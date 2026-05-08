import { authenticateAdmin } from "./_auth.js";
import { jsonResponse, readTournaments } from "./_store.js";

export default async (request) => {
  const user = await authenticateAdmin(request);
  if (!user) return jsonResponse({ error: "Yetkisiz erisim." }, 401);
  const tournaments = await readTournaments();
  return new Response(
    JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        source: "FL26 Arena Manager by Reiken",
        tournaments,
      },
      null,
      2,
    ),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": "attachment; filename=\"fl26-tournaments.json\"",
      },
    },
  );
};

export { jsonResponse };

