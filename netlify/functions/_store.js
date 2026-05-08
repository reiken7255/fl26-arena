import { getStore } from "@netlify/blobs";

const store = getStore({ name: "fl26-arena-store" });
const TOURNAMENTS_KEY = "tournaments";
const USERS_KEY = "users";

export async function readTournaments() {
  const existing = await store.get(TOURNAMENTS_KEY, { type: "json" });
  if (!existing) return [];
  if (!Array.isArray(existing)) return [];
  return existing;
}

export async function writeTournaments(tournaments) {
  await store.setJSON(TOURNAMENTS_KEY, tournaments);
}

export async function readUsers() {
  const existing = await store.get(USERS_KEY, { type: "json" });
  if (!existing) return [];
  if (!Array.isArray(existing)) return [];
  return existing;
}

export async function writeUsers(users) {
  await store.setJSON(USERS_KEY, users);
}

export function jsonResponse(payload, statusCode = 200) {
  return new Response(JSON.stringify(payload), {
    status: statusCode,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

export function getRequestMethod(request) {
  return request?.method || request?.httpMethod || "GET";
}

export async function readJsonBody(request) {
  if (!request) return {};
  if (typeof request.json === "function") {
    try {
      return await request.json();
    } catch {
      return {};
    }
  }
  try {
    return JSON.parse(request.body || "{}");
  } catch {
    return {};
  }
}

