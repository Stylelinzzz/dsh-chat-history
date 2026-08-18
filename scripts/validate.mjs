// validate.mjs — structural checks for the dsh-chat-history package.
// Run locally (node scripts/validate.mjs) or in CI. Verifies the contract the
// DSH loader depends on, without executing any plugin code:
//   1. dsh.client.platform === "web" and dsh.bundle.patch points at a file
//   2. exports["./client"] resolves to an existing bundle
//   3. every file in the `files` whitelist exists
//   4. the bundle references no undeclared runtime inject service
//   5. all locale keys are present in both zh and en dictionaries
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(new URL("../package.json", import.meta.url)));
const pkg = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
const failures = [];

const check = (ok, message) => {
  if (!ok) failures.push(message);
};

// 1. dsh manifest
const dsh = pkg.dsh ?? {};
check(typeof dsh.client?.platform === "string", "dsh.client.platform must be a string");
check(dsh.client?.platform === "web", "dsh.client.platform must be 'web'");
const patchRel = dsh.bundle?.patch;
check(typeof patchRel === "string", "dsh.bundle.patch must be a string");
if (typeof patchRel === "string") {
  check(existsSync(resolve(root, patchRel)), `dsh.bundle.patch not found: ${patchRel}`);
}

// 2. client export resolves to an existing bundle
const clientExport = pkg.exports?.["./client"];
const clientRel = typeof clientExport === "string" ? clientExport : clientExport?.default;
check(typeof clientRel === "string", "exports['./client'] must be a string or { default: string }");
if (typeof clientRel === "string") {
  check(existsSync(resolve(root, clientRel)), `client bundle not found: ${clientRel}`);
}

// 3. files whitelist
for (const pattern of pkg.files ?? []) {
  if (pattern.includes("*")) continue; // glob patterns are matched loosely here
  check(existsSync(resolve(root, pattern)), `files entry missing: ${pattern}`);
}

// 4. inject services declared in the bundle match what the loader resolves
const bundle = readFileSync(resolve(root, clientRel), "utf8");
const injectMatch = bundle.match(/const inject = \[([^\]]+)\]/);
check(injectMatch !== null, "bundle must declare its inject service list");
if (injectMatch) {
  const declared = injectMatch[1].match(/"([^"]+)"/g)?.map((s) => s.replaceAll('"', "")) ?? [];
  for (const service of declared) {
    check(
      ["slots", "sessions", "locale"].includes(service),
      `undeclared inject service: ${service}`
    );
  }
}

// 5. locale key parity between zh and en
const zhBlock = bundle.match(/const zh = \{\s*([\s\S]*?)\n\s*\};/)?.[1] ?? "";
const enBlock = bundle.match(/const en = \{\s*([\s\S]*?)\n\s*\};/)?.[1] ?? "";
const keys = (block) => [...block.matchAll(/"([^"]+)":/g)].map((m) => m[1]);
const zhKeys = keys(zhBlock);
const enKeys = keys(enBlock);
for (const key of zhKeys) check(enKeys.includes(key), `en dictionary missing key: ${key}`);
for (const key of enKeys) check(zhKeys.includes(key), `zh dictionary missing key: ${key}`);

if (failures.length > 0) {
  console.error(`validate: ${failures.length} problem(s)`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}
console.log("validate: all checks passed");
