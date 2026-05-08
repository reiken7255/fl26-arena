import { createSessionCookie, ensureDefaultAdmin, publicUser, verifyPassword } from "./_auth.js";
import { getRequestMethod, jsonResponse, readJsonBody, readUsers } from "./_store.js";

export default async (request) => {
  if (getRequestMethod(request) !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  await ensureDefaultAdmin();
  const payload = await readJsonBody(request);
  const username = String(payload.username || "").trim();
  const password = String(payload.password || "");
  const users = await readUsers();
  const user = users.find((entry) => entry.username === username);

  if (!user || !verifyPassword(password, user.salt, user.hash)) {
    return jsonResponse({ error: "Kullanici adi veya sifre hatali." }, 401);
  }

  return new Response(JSON.stringify({ user: publicUser(user) }), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Set-Cookie": createSessionCookie(user),
    },
  });
};

