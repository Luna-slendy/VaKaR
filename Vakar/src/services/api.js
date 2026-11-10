const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

/**
 * Vienota vieta WebAPI pieprasījumiem.
 * Autentifikācijas klienta OAuth piekļuves pilnvara jāpievieno galvenē Authorization: Bearer ...
 * No pārlūka neveido tiešu savienojumu ar Azure SQL vai Cosmos DB.
 */
export async function apiRequest(path, options = {}) {
  if (!API_BASE) {
    throw new Error("VITE_API_BASE_URL is not configured yet.");
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    throw new Error(`WebAPI request failed (${response.status})`);
  }

  if (response.status === 204) return null;
  return response.json();
}

export async function updateProfile(profile) {
  return apiRequest("/api/profile", {
    method: "PATCH",
    body: JSON.stringify(profile),
  });
}

export async function uploadAvatar(file) {
  const form = new FormData();
  form.append("avatar", file);
  if (!API_BASE) throw new Error("VITE_API_BASE_URL is not configured yet.");

  const response = await fetch(`${API_BASE}/api/profile/avatar`, {
    method: "POST",
    body: form,
  });
  if (!response.ok) throw new Error(`Avatar upload failed (${response.status})`);
  return response.json(); // Sagaidāmais formāts: { avatarUrl: "https://..." }
}
