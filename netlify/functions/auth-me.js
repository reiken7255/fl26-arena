import { authenticateAdmin, publicUser } from "./_auth.js";
import { jsonResponse } from "./_store.js";

export default async (request) => {
  const user = await authenticateAdmin(request);
  if (!user) return jsonResponse({ user: null }, 200);
  return jsonResponse({ user: publicUser(user) }, 200);
};

