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
const buildFromSource = process.env.WHISPER_CPP_BUILD_FROM_SOURCE === "true";

try {
  await main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}

async function main() {
  if (process.platform === "win32" && !buildFromSource) {
    await setupWindowsBinary();
  } else {
    setupFromSource();
  }

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

async function setupWindowsBinary() {
  const assetName =
    process.env.WHISPER_CPP_WINDOWS_ASSET ?? defaultWindowsAsset();
  const assetId = `${whisperRef}/${assetName}`;
  const binaryDir = path.join(whisperHome, "build", "bin");
  const markerPath = path.join(binaryDir, ".windows-asset");
  const binaryPath = path.join(binaryDir, "Release", "whisper-cli.exe");

  if (
    fs.existsSync(binaryPath) &&
    fs.existsSync(markerPath) &&
    fs.readFileSync(markerPath, "utf8") === assetId
  ) {
    return;
  }

  fs.rmSync(binaryDir, { force: true, recursive: true });
  fs.mkdirSync(binaryDir, { recursive: true });

  const zipPath = path.join(whisperHome, "downloads", whisperRef, assetName);
  if (!fs.existsSync(zipPath)) {
    fs.mkdirSync(path.dirname(zipPath), { recursive: true });
    await downloadFile(windowsAssetUrl(assetName), zipPath);
  }

  extractZip(zipPath, binaryDir);

  if (!fs.existsSync(binaryPath)) {
    throw new Error(
      `Windows whisper.cpp binary was not found after extracting ${assetName}. Expected ${binaryPath}.`,
    );
  }

  fs.writeFileSync(markerPath, assetId);
}

function setupFromSource() {
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

  const generatorArgs = cmakeGeneratorArgs();
  prepareBuildDirectory(generatorArgs);
  run(
    "cmake",
    ["-B", "build", "-DCMAKE_BUILD_TYPE=Release", ...generatorArgs],
    {
      cwd: whisperHome,
    },
  );
  run("cmake", ["--build", "build", "--config", "Release", "--parallel"], {
    cwd: whisperHome,
  });
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    stdio: "inherit",
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

function cmakeGeneratorArgs() {
  const configuredGenerator = process.env.WHISPER_CPP_CMAKE_GENERATOR?.trim();
  if (configuredGenerator) {
    return ["-G", configuredGenerator, ...cmakeArchitectureArgs()];
  }

  if (process.platform !== "win32") {
    return [];
  }

  if (commandExists("ninja")) {
    return ["-G", "Ninja"];
  }

  if (commandExists("nmake") && commandExists("cl")) {
    return ["-G", "NMake Makefiles"];
  }

  return ["-G", "Visual Studio 17 2022", "-A", "x64"];
}

function cmakeArchitectureArgs() {
  const architecture = process.env.WHISPER_CPP_CMAKE_ARCHITECTURE?.trim();
  return architecture ? ["-A", architecture] : [];
}

function prepareBuildDirectory(generatorArgs) {
  if (process.platform !== "win32") {
    return;
  }

  const buildDir = path.join(whisperHome, "build");
  if (!fs.existsSync(buildDir)) {
    return;
  }

  const expectedGenerator = generatorFromArgs(generatorArgs);
  const existingGenerator = generatorFromCache(
    path.join(buildDir, "CMakeCache.txt"),
  );

  if (!existingGenerator || existingGenerator !== expectedGenerator) {
    fs.rmSync(buildDir, { force: true, recursive: true });
  }
}

function generatorFromArgs(generatorArgs) {
  const generatorIndex = generatorArgs.indexOf("-G");
  return generatorIndex >= 0 ? generatorArgs[generatorIndex + 1] : "";
}

function generatorFromCache(cachePath) {
  if (!fs.existsSync(cachePath)) {
    return "";
  }

  const match = fs
    .readFileSync(cachePath, "utf8")
    .match(/^CMAKE_GENERATOR:INTERNAL=(.+)$/m);
  return match?.[1] ?? "";
}

function commandExists(command) {
  const result = spawnSync(
    process.platform === "win32" ? "where" : "which",
    [command],
    {
      cwd: repoRoot,
      stdio: "ignore",
    },
  );

  return result.status === 0;
}

function defaultWindowsAsset() {
  return process.arch === "ia32"
    ? "whisper-bin-Win32.zip"
    : "whisper-bin-x64.zip";
}

function windowsAssetUrl(assetName) {
  return `https://github.com/ggml-org/whisper.cpp/releases/download/${whisperRef}/${assetName}`;
}

function extractZip(zipPath, destination) {
  const powershell = commandExists("powershell.exe")
    ? "powershell.exe"
    : "powershell";

  run(powershell, [
    "-NoProfile",
    "-ExecutionPolicy",
    "Bypass",
    "-Command",
    "Expand-Archive -LiteralPath $args[0] -DestinationPath $args[1] -Force",
    zipPath,
    destination,
  ]);
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
