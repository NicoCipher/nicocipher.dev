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
 * Validate the stored token by calling /user and checking repository write access.
 * Returns the GitHub username on success, throws descriptive error on failure.
 */
export async function validateToken() {
  const user = await ghFetch("/user");
  if (!user || !user.login) {
    throw new Error("Authentication failed: invalid user profile");
  }

  // Verify write permission on the target repository
  const repo = await ghFetch(`/repos/${REPO_OWNER}/${REPO_NAME}`);
  if (repo && repo.permissions && !repo.permissions.push) {
    throw new Error("Token authenticated, but lacks write (push) permission for this repository.");
  }

  return user.login;
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
 * Validate and sanitize repo file paths to prevent directory traversal
 * and restrict writes/reads strictly to Markdown publications.
 */
export function validateRepoFilePath(filePath) {
  if (typeof filePath !== "string" || !filePath.trim()) {
    throw new Error("Invalid file path: path must be a non-empty string");
  }

  // Reject traversal attempts, backslashes, or leading slashes
  if (filePath.includes("..") || filePath.includes("\\") || filePath.startsWith("/")) {
    throw new Error("Path traversal blocked: invalid file path format");
  }

  // Enforce repository content prefix and markdown extension
  if (!filePath.startsWith(`${CONTENT_PREFIX}/`) || !filePath.endsWith(".md")) {
    throw new Error(`Forbidden path: file must reside within ${CONTENT_PREFIX}/ and have .md extension`);
  }

  // Enforce valid alphanumeric, dash, and underscore character set for subpaths
  const subpath = filePath.slice(CONTENT_PREFIX.length + 1);
  if (!/^[a-zA-Z0-9_\-\/]+\.md$/.test(subpath)) {
    throw new Error("Invalid file path: path contains disallowed characters");
  }

  return filePath;
}

/**
 * Get a single file's content from the repo.
 * Returns { content (string), sha, path }.
 */
export async function getFileContent(filePath) {
  const safePath = validateRepoFilePath(filePath);
  const data = await ghFetch(`/repos/${REPO_OWNER}/${REPO_NAME}/contents/${safePath}`);

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
  const safePath = validateRepoFilePath(filePath);

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

  const result = await ghFetch(`/repos/${REPO_OWNER}/${REPO_NAME}/contents/${safePath}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });

  return result.content.sha;
}

/**
 * Delete a file from the repo.
 */
export async function deleteFile(filePath, sha, commitMessage) {
  const safePath = validateRepoFilePath(filePath);

  await ghFetch(`/repos/${REPO_OWNER}/${REPO_NAME}/contents/${safePath}`, {
    method: "DELETE",
    body: JSON.stringify({
      message: commitMessage,
      sha,
      branch: "main",
    }),
  });
}
