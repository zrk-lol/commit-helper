#!/usr/bin/env node
// Propose un message de commit propre à partir de tes fichiers modifiés.
// Made by Varhex by Ȥrk Team — https://varhex.com · MIT
import { readdirSync, statSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, relative, extname } from "node:path";
import { execFileSync } from "node:child_process";
const args = process.argv.slice(2);
const SKIP = /^(node_modules|\.git|dist|build|\.next|\.output|coverage|\.vercel)$/;
function* walk(dir = ".") { for (const n of readdirSync(dir)) { if (SKIP.test(n)) continue; const p = join(dir, n), s = statSync(p); if (s.isDirectory()) yield* walk(p); else yield { path: relative(".", p), size: s.size }; } }
const read = (p) => { try { return readFileSync(p, "utf8"); } catch { return ""; } };
const git = (...a) => { try { return execFileSync("git", a, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim(); } catch { return ""; } };
const env = (p) => Object.fromEntries(read(p).split(/\r?\n/).map((l) => l.match(/^\s*(?:export\s+)?([A-Za-z_][\w.]*)\s*=\s*(.*)$/)).filter(Boolean).map((m) => [m[1], m[2]]));
const files = git("diff", "--cached", "--name-only").split("\n").filter(Boolean);
if (!files.length) { console.log("Rien de stagé : fais d'abord git add."); process.exit(1); }
const type = files.every((f) => /\.(md|txt)$/.test(f)) ? "docs" : files.every((f) => /test|spec/.test(f)) ? "test" : files.some((f) => /package(-lock)?\.json$/.test(f)) && files.length < 3 ? "chore" : git("diff", "--cached", "--diff-filter=A", "--name-only") ? "feat" : "fix";
const scope = [...new Set(files.map((f) => f.split("/")[f.split("/").length > 1 ? f.split("/").length - 2 : 0]))].slice(0, 2).join(",");
console.log(`${type}(${scope}): ${files.length === 1 ? "update " + files[0].split("/").pop() : files.length + " files"}`);
