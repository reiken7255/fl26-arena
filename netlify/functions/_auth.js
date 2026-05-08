import crypto from "node:crypto";
import process from "node:process";
import { Buffer } from "node:buffer";
import { nanoid } from "nanoid";
import { readUsers, writeUsers } from "./_store.js";

const COOKIE_NAME = "fl26_admin_session";
const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7;

function base64UrlEncode(input) {
  return Buffer.from(input).toString("base64url");
}

function base64UrlDecode(input) {
  return Buffer.from(input, "base64url").toString("utf-8");
}

function getSecret() {
  return process.env.FL26_AUTH_SECRET || "fl26-dev-secret-change-this";
}

function isSecureCookie() {
  return process.env.NODE_ENV === "production" && process.env.NETLIFY_DEV !== "true";
}

function sign(payload) {
  const header = { alg: "HS256", typ: "JWT" };
  const headerEncoded = base64UrlEncode(JSON.stringify(header));
  const payloadEncoded = base64UrlEncode(JSON.stringify(payload));
  const signature = crypto
    .createHmac("sha256", getSecret())
    .update(`${headerEncoded}.${payloadEncoded}`)
    .digest("base64url");
  return `${headerEncoded}.${payloadEncoded}.${signature}`;
}

function verify(token) {
  const [headerEncoded, payloadEncoded, signature] = String(token || "").split(".");
  if (!headerEncoded || !payloadEncoded || !signature) return null;

  const expected = crypto
    .createHmac("sha256", getSecret())
    .update(`${headerEncoded}.${payloadEncoded}`)
    .digest("base64url");

  if (signature !== expected) return null;

  const payload = JSON.parse(base64UrlDecode(payloadEncoded));
  if (!payload.exp || Number(payload.exp) < Math.floor(Date.now() / 1000)) return null;
  return payload;
}

function getCookieValue(cookieHeader, name) {
  const value = String(cookieHeader || "")
    .split(";")
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(`${name}=`));
  if (!value) return "";
  return value.slice(name.length + 1);
}

export function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.pbkdf2Sync(String(password), salt, 120000, 64, "sha512").toString("hex");
  return { salt, hash };
}

export function verifyPassword(password, salt, hash) {
  const calculated = crypto.pbkdf2Sync(String(password), String(salt), 120000, 64, "sha512").toString("hex");
  return crypto.timingSafeEqual(Buffer.from(calculated), Buffer.from(String(hash)));
}

export async function ensureDefaultAdmin() {
  const users = await readUsers();
  if (users.length > 0) return users;

  const defaultUsername = process.env.FL26_DEFAULT_ADMIN_USERNAME || "admin";
  const defaultPassword = process.env.FL26_DEFAULT_ADMIN_PASSWORD || "admin12345";
  const passwordData = hashPassword(defaultPassword);

  const seed = [
    {
      id: nanoid(10),
      username: defaultUsername,
      displayName: "Reiken Master Admin",
      role: "owner",
      ...passwordData,
      createdAt: new Date().toISOString(),
    },
  ];
  await writeUsers(seed);
  return seed;
}

export async function authenticateAdmin(request) {
  await ensureDefaultAdmin();
  const cookie =
    (typeof request?.headers?.get === "function" ? request.headers.get("cookie") : null) ||
    request?.headers?.cookie ||
    request?.headers?.Cookie ||
    "";
  const token = getCookieValue(cookie, COOKIE_NAME);
  const payload = verify(token);
  if (!payload?.userId) return null;
  const users = await readUsers();
  const user = users.find((entry) => entry.id === payload.userId);
  if (!user) return null;
  return user;
}

export function createSessionCookie(user) {
  const now = Math.floor(Date.now() / 1000);
  const token = sign({ userId: user.id, username: user.username, role: user.role, iat: now, exp: now + TOKEN_TTL_SECONDS });
  const securePart = isSecureCookie() ? "; Secure" : "";
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${TOKEN_TTL_SECONDS}${securePart}`;
}

export function clearSessionCookie() {
  const securePart = isSecureCookie() ? "; Secure" : "";
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${securePart}`;
}

export function publicUser(user) {
  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    role: user.role,
    createdAt: user.createdAt,
  };
}

