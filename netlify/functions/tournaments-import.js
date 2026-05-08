import { authenticateAdmin } from "./_auth.js";
import { getRequestMethod, jsonResponse, readJsonBody, writeTournaments } from "./_store.js";

export default async (request) => {
  const user = await authenticateAdmin(request);
  if (!user) return jsonResponse({ error: "Yetkisiz erisim." }, 401);

  if (getRequestMethod(request) !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const payload = await readJsonBody(request);
    const tournaments = Array.isArray(payload.tournaments) ? payload.tournaments : [];
    await writeTournaments(tournaments);
    return jsonResponse({ imported: tournaments.length });
  } catch (error) {
    return jsonResponse({ error: "Import dosyasi gecersiz.", detail: error.message }, 400);
  }
};

