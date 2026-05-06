import { spawnSync } from "node:child_process";
import fs from "node:fs";
import https from "node:https";
import path from "node:path";
import process from "node:process";

const repoRoot = process.cwd();
const whisperRef = process.env.WHISPER_CPP_REF ?? "v1.8.4";
const modelName = process.env.WHISPER_CPP_MODEL ?? "base.en";
const whisperHome = path.resolve(
  repoRoot,
  process.env.WHISPER_CPP_HOME ?? ".local/whisper.cpp",
);
const modelPath = path.join(whisperHome, "models", `ggml-${modelName}.bin`);

try {
  await main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}

async function main() {
  run("git", ["--version"]);
  run("cmake", ["--version"]);

  if (!fs.existsSync(whisperHome)) {
    fs.mkdirSync(path.dirname(whisperHome), { recursive: true });
    run("git", [
      "clone",
      "--depth",
      "1",
      "--branch",
      whisperRef,
      "https://github.com/ggml-org/whisper.cpp.git",
      whisperHome,
    ]);
  } else {
    run("git", ["fetch", "--tags", "--depth", "1", "origin", whisperRef], {
      cwd: whisperHome,
    });
    run("git", ["checkout", whisperRef], { cwd: whisperHome });
  }

  run("cmake", ["-B", "build", "-DCMAKE_BUILD_TYPE=Release"], {
    cwd: whisperHome,
  });
  run("cmake", ["--build", "build", "--config", "Release", "-j"], {
    cwd: whisperHome,
  });

  if (!fs.existsSync(modelPath)) {
    fs.mkdirSync(path.dirname(modelPath), { recursive: true });
    await downloadFile(modelUrl(modelName), modelPath);
  }

  console.log(`whisper.cpp ready:
  WHISPER_CPP_HOME=${path.relative(repoRoot, whisperHome)}
  WHISPER_CPP_MODEL=${modelName}
  WHISPER_MODEL_PATH=${path.relative(repoRoot, modelPath)}
`);
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    stdio: "inherit",
    shell: process.platform === "win32",
    ...options,
  });

  if (result.error) {
    throw new Error(
      `Unable to run ${command}. Install git, CMake, and a C++ build toolchain before running pnpm setup:whisper.`,
    );
  }

  if (result.status !== 0) {
    throw new Error(`Command failed: ${command} ${args.join(" ")}`);
  }
}

function modelUrl(name) {
  return `https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-${name}.bin?download=true`;
}

async function downloadFile(url, destination) {
  console.log(`Downloading ${url}`);

  await new Promise((resolve, reject) => {
    const request = https.get(url, (response) => {
      if (
        response.statusCode &&
        response.statusCode >= 300 &&
        response.statusCode < 400 &&
        response.headers.location
      ) {
        response.resume();
        downloadFile(response.headers.location, destination)
          .then(resolve)
          .catch(reject);
        return;
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Download failed with HTTP ${response.statusCode}`));
        response.resume();
        return;
      }

      const file = fs.createWriteStream(destination);
      response.pipe(file);
      file.on("finish", () => {
        file.close(resolve);
      });
      file.on("error", reject);
    });

    request.on("error", reject);
  });
}
