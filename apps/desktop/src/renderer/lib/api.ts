import type {
  AdminUser,
  DictationResponse,
  OutputMode,
  UsageSummary,
  UserSettings,
} from "@inumaki/shared";

export async function saveServerSettings(
  apiBaseUrl: string,
  settings: UserSettings,
): Promise<UserSettings> {
  const response = await fetch(`${apiBaseUrl}/settings`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  });

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  return response.json() as Promise<UserSettings>;
}

export async function createDictation(input: {
  apiBaseUrl: string;
  audio: Blob;
  audioSeconds: number;
  clientAudioBlobMs?: number;
  groqApiKey?: string;
  mode: OutputMode;
  offlineMode?: boolean;
}): Promise<DictationResponse> {
  const formData = new FormData();
  formData.append("audio", input.audio, "dictation.webm");
  formData.append("mode", input.mode);
  formData.append("audioSeconds", String(input.audioSeconds));
  if (input.groqApiKey) {
    formData.append("groqApiKey", input.groqApiKey);
  }
  if (input.offlineMode) {
    formData.append("offlineMode", "true");
  }

  const startedAt = performance.now();
  const response = await fetch(`${input.apiBaseUrl}/dictations`, {
    method: "POST",
    body: formData,
  });
  const clientUploadMs = Math.round(performance.now() - startedAt);

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  const payload = (await response.json()) as DictationResponse;
  return {
    ...payload,
    timings: {
      ...payload.timings,
      clientAudioBlobMs: input.clientAudioBlobMs,
      clientUploadMs,
    },
  };
}

export async function getUsage(apiBaseUrl: string): Promise<UsageSummary> {
  const response = await fetch(`${apiBaseUrl}/admin/usage`);

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  return response.json() as Promise<UsageSummary>;
}

export async function listUsers(apiBaseUrl: string): Promise<AdminUser[]> {
  const response = await fetch(`${apiBaseUrl}/admin/users`);

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  return response.json() as Promise<AdminUser[]>;
}

export async function inviteUser(
  apiBaseUrl: string,
  email: string,
): Promise<AdminUser> {
  const response = await fetch(`${apiBaseUrl}/admin/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  return response.json() as Promise<AdminUser>;
}

export async function disableUser(
  apiBaseUrl: string,
  id: string,
): Promise<void> {
  const response = await fetch(`${apiBaseUrl}/admin/users/${id}/disable`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(await readError(response));
  }
}

export async function checkApiHealth(
  apiBaseUrl: string,
  timeoutMs = 2000,
): Promise<{ ok: boolean; error?: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${apiBaseUrl}/health`, {
      signal: controller.signal,
    });
    if (!response.ok) {
      return { ok: false, error: `API responded with ${response.status}.` };
    }
    return { ok: true };
  } catch (error) {
    const message =
      error instanceof Error && error.name === "AbortError"
        ? `API did not respond within ${timeoutMs}ms.`
        : error instanceof Error
          ? error.message
          : "Unknown error";
    return { ok: false, error: message };
  } finally {
    clearTimeout(timer);
  }
}

async function readError(response: Response): Promise<string> {
  const payload = await response.json().catch(() => null);
  return payload?.error ?? `Request failed with ${response.status}`;
}
