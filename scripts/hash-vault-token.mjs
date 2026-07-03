#!/usr/bin/env node

import { createHash, randomBytes } from "node:crypto";

const providedToken = process.argv.slice(2).join(" ").trim();
const token = providedToken || randomBytes(32).toString("base64url");
const tokenHash = createHash("sha256").update(token).digest("hex");

console.log(`Token: ${token}`);
console.log(`shareTokenHash: "sha256:${tokenHash}"`);

if (!providedToken) {
  console.log("");
  console.log("Save the token somewhere private. Commit only the shareTokenHash.");
}
