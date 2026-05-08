import { nanoid } from "nanoid";
import { authenticateAdmin } from "./_auth.js";
import { getRequestMethod, jsonResponse, readJsonBody, readTournaments, writeTournaments } from "./_store.js";

function normalizeTournament(payload) {
  const participants = Array.isArray(payload.participants)
    ? payload.participants.map((entry) => {
        if (typeof entry === 'string') return entry.trim();
        if (entry && typeof entry === 'object') {
          return {
            name: String(entry.name || "").trim(),
            teamId: String(entry.teamId || ""),
            leagueId: String(entry.leagueId || "")
          };
        }
        return null;
      }).filter(Boolean)
    : [];

  return {
    id: payload.id || nanoid(10),
    name: String(payload.name || "Adsiz Turnuva"),
    leagueId: String(payload.leagueId || ""),
    season: String(payload.season || "2026"),
    type: String(payload.type || "league"),
    stage: String(payload.stage || "group"),
    isContinuation: Boolean(payload.isContinuation),
    participants,
    matches: Array.isArray(payload.matches) ? payload.matches : [],
    archivedAt: payload.archivedAt || null,
    createdAt: payload.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export default async (request) => {
  const method = getRequestMethod(request);
  const tournaments = await readTournaments();

  if (method === "GET") {
    const sorted = [...tournaments].sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
    return jsonResponse({ tournaments: sorted });
  }

  if (method === "POST") {
    const user = await authenticateAdmin(request);
    if (!user) return jsonResponse({ error: "Yetkisiz erisim." }, 401);
    const payload = await readJsonBody(request);
    const next = normalizeTournament(payload);
    tournaments.push(next);
    await writeTournaments(tournaments);
    return jsonResponse({ tournament: next }, 201);
  }

  if (method === "PATCH") {
    const user = await authenticateAdmin(request);
    if (!user) return jsonResponse({ error: "Yetkisiz erisim." }, 401);
    const payload = await readJsonBody(request);
    const target = tournaments.find((entry) => entry.id === payload.id);

    if (!target) return jsonResponse({ error: "Turnuva bulunamadi." }, 404);

    if (payload.action === "addMatch") {
      const { match } = payload;
      const participantNames = target.participants.map(p => typeof p === 'string' ? p : p.name);
      if (!match || !participantNames.includes(match.home) || !participantNames.includes(match.away)) {
        return jsonResponse({ error: "Gecersiz mac verisi." }, 400);
      }

      target.matches.push({
        id: nanoid(12),
        home: match.home,
        away: match.away,
        homeGoals: Number(match.homeGoals) || 0,
        awayGoals: Number(match.awayGoals) || 0,
        playedAt: new Date().toISOString(),
      });
      target.updatedAt = new Date().toISOString();
    } else if (payload.action === "archive") {
      target.archivedAt = new Date().toISOString();
      target.updatedAt = new Date().toISOString();
    } else if (payload.action === "restore") {
      target.archivedAt = null;
      target.updatedAt = new Date().toISOString();
    } else if (payload.action === "updateMeta") {
      target.name = String(payload.name || target.name);
      target.season = String(payload.season || target.season);
      target.stage = String(payload.stage || target.stage);
      target.updatedAt = new Date().toISOString();
    } else if (payload.action === "bulkImport") {
      const { items } = payload;
      if (Array.isArray(items)) {
        const normalized = items.map(normalizeTournament);
        tournaments.push(...normalized);
      }
    } else {
      return jsonResponse({ error: "Desteklenmeyen islem." }, 400);
    }

    await writeTournaments(tournaments);
    return jsonResponse({ tournament: target });
  }

  if (method === "DELETE") {
    const user = await authenticateAdmin(request);
    if (!user) return jsonResponse({ error: "Yetkisiz erisim." }, 401);
    await writeTournaments([]);
    return jsonResponse({ message: "Tum veriler sifirlandi." });
  }

  return jsonResponse({ error: "Method not allowed" }, 405);
};

