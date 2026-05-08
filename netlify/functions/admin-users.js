import { authenticateAdmin, hashPassword, publicUser } from "./_auth.js";
import { getRequestMethod, jsonResponse, readJsonBody, readUsers, writeUsers } from "./_store.js";
import { nanoid } from "nanoid";

export default async (request) => {
  const user = await authenticateAdmin(request);
  if (!user) return jsonResponse({ error: "Yetkisiz erisim." }, 401);

  const method = getRequestMethod(request);
  const users = await readUsers();

  if (method === "GET") {
    return jsonResponse({ users: users.map(publicUser) });
  }

  if (method === "POST") {
    const payload = await readJsonBody(request);
    const username = String(payload.username || "").trim();
    const password = String(payload.password || "");
    const displayName = String(payload.displayName || "").trim() || username;

    if (username.length < 3 || password.length < 8) {
      return jsonResponse({ error: "Kullanici adi en az 3, sifre en az 8 karakter olmali." }, 400);
    }
    if (users.some((entry) => entry.username === username)) {
      return jsonResponse({ error: "Bu kullanici adi zaten mevcut." }, 409);
    }

    const passwordData = hashPassword(password);
    const created = {
      id: nanoid(10),
      username,
      displayName,
      role: "admin",
      ...passwordData,
      createdAt: new Date().toISOString(),
    };
    users.push(created);
    await writeUsers(users);
    return jsonResponse({ user: publicUser(created) }, 201);
  }

  return jsonResponse({ error: "Method not allowed" }, 405);
};

