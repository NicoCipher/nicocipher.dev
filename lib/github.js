/**
 * GitHub API client for the Publishing Workspace.
 * Runs entirely client-side — communicates with api.github.com only.
 */

const REPO_OWNER = "NicoCipher";
const REPO_NAME = "nicocipher.dev";
const CONTENT_PREFIX = "content/publications";
const TOKEN_KEY = "nc_gh_token";

// ─── Token Management ────────────────────────────────────────

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// ─── API Helpers ─────────────────────────────────────────────

async function ghFetch(endpoint, options = {}) {
  const token = getToken();
  if (!token) throw new Error("No GitHub token configured");

  const res = await fetch(`https://api.github.com${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `GitHub API error: ${res.status}`);
  }

  return res.json();
}

/**
 * Validate the stored token by calling /user.
 * Returns the GitHub username on success, null on failure.
 */
export async function validateToken() {
  try {
    const user = await ghFetch("/user");
    return user.login;
  } catch {
    return null;
  }
}

// ─── Publication Operations ──────────────────────────────────

/**
 * List all publication files in the repo.
 * Uses the Git Trees API for efficiency (single request).
 * Returns array of { path, sha } objects.
 */
export async function listPublicationFiles() {
  // Get the full repo tree recursively
  const tree = await ghFetch(`/repos/${REPO_OWNER}/${REPO_NAME}/git/trees/main?recursive=1`);

  return tree.tree
    .filter((item) => item.type === "blob" && item.path.startsWith(CONTENT_PREFIX) && item.path.endsWith(".md"))
    .map((item) => ({ path: item.path, sha: item.sha }));
}

/**
 * Get a single file's content from the repo.
 * Returns { content (string), sha, path }.
 */
export async function getFileContent(filePath) {
  const data = await ghFetch(`/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filePath}`);

  // GitHub returns Base64-encoded content
  const content = atob(data.content.replace(/\n/g, ""));
  // Handle UTF-8 properly
  const bytes = Uint8Array.from(content, (c) => c.charCodeAt(0));
  const decoded = new TextDecoder().decode(bytes);

  return {
    content: decoded,
    sha: data.sha,
    path: data.path,
  };
}

/**
 * Create or update a file in the repo.
 * If sha is provided, it updates the existing file.
 * If sha is null, it creates a new file.
 * Returns the new sha.
 */
export async function saveFile(filePath, content, commitMessage, sha = null) {
  // Encode content to Base64 (handle UTF-8)
  const encoded = btoa(
    Array.from(new TextEncoder().encode(content))
      .map((b) => String.fromCharCode(b))
      .join("")
  );

  const body = {
    message: commitMessage,
    content: encoded,
    branch: "main",
  };

  if (sha) {
    body.sha = sha;
  }

  const result = await ghFetch(`/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filePath}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });

  return result.content.sha;
}

/**
 * Delete a file from the repo.
 */
export async function deleteFile(filePath, sha, commitMessage) {
  await ghFetch(`/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filePath}`, {
    method: "DELETE",
    body: JSON.stringify({
      message: commitMessage,
      sha,
      branch: "main",
    }),
  });
}
