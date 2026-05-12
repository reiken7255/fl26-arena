const teamLogoMap = {
  "ars": "9825", "mci": "8456", "liv": "8650", "mun": "10260", "che": "8455", "tot": "8586", "avl": "10252", "new": "10261", "whu": "8191", "bha": "10204",
  "rma": "8633", "bar": "8634", "atm": "9906", "rso": "8560", "villarreal": "10205", "sevilla": "8302", "betis": "8603",
  "bay": "9823", "bvb": "9789", "lev": "8178", "rbl": "178474", "stuttgart": "10269",
  "int": "8636", "juv": "9885", "acm": "8564", "nap": "9875", "rom": "8686", "laz": "8543", "ata": "8524",
  "psg": "9847", "monaco": "9831", "mar": "8592", "lyon": "8027",
  "gal": "10077", "fen": "8695", "bes": "8659", "tra": "8654", "bas": "284351", "eye": "686733", "sam": "8352",
  "aln": "247076", "alhi": "102431", "alit": "102430", "al ahli": "102429",
  "mia": "906233", "lafc": "808930", "lag": "6363"
};

export const getLogoUrl = (teamId, fallbackName) => {
  if (teamId && teamLogoMap[teamId]) {
    return `https://images.fotmob.com/image_resources/logo/teamlogo/${teamLogoMap[teamId]}.png`;
  }
  const seed = encodeURIComponent(fallbackName || "U");
  return `https://ui-avatars.com/api/?name=${seed}&background=ec4899&color=fff&rounded=true&bold=true`;
};

export const normalizeParticipants = (participants) => {
  if (!participants || !Array.isArray(participants)) return [];
  return participants.map(p => {
    let name = "Unknown"; let leagueId = ""; let teamId = "";
    if (typeof p === 'string') { name = p; }
    else if (p && typeof p === 'object') {
      name = String(p.name || "Unknown");
      leagueId = String(p.leagueId || "");
      teamId = String(p.teamId || "");
    }
    return { name, leagueId, teamId };
  });
};

export const createParticipant = () => ({ name: "", leagueId: "", teamId: "" });

export const calculateStandings = (matches = [], participants = []) => {
  const table = Object.fromEntries(participants.map((p) => [p.name, { team: p.name, teamId: p.teamId, played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, gd: 0, pts: 0 }]));
  for (const match of (matches || [])) {
    const h = table[match.home]; const a = table[match.away];
    if (!h || !a) continue;
    h.played += 1; a.played += 1; h.gf += Number(match.homeGoals); h.ga += Number(match.awayGoals); a.gf += Number(match.awayGoals); a.ga += Number(match.homeGoals);
    if (Number(match.homeGoals) > Number(match.awayGoals)) { h.win += 1; a.lose += 1; h.pts += 3; }
    else if (Number(match.homeGoals) < Number(match.awayGoals)) { a.win += 1; h.lose += 1; a.pts += 3; }
    else { h.draw += 1; a.draw += 1; h.pts += 1; a.pts += 1; }
  }
  return Object.values(table).map((row) => ({ ...row, gd: row.gf - row.ga })).sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);
};
