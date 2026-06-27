import { readFileSync, writeFileSync, readdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const srcDir = join(root, "src");
const readmePath = join(root, "README.md");

type Presence = {
  name: string
  slug: string
};

const slug = (name: string): string => name.toLowerCase().replace(/\s+/g, "-");

const loadPresences = (): Presence[] => {
  const entries = readdirSync(srcDir, { withFileTypes: true });
  const presences: Presence[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory() || !/^[A-Z]$/.test(entry.name)) continue;

    const letterDir = join(srcDir, entry.name);
    for (const sub of readdirSync(letterDir, { withFileTypes: true })) {
      if (!sub.isDirectory()) continue;

      const metaPath = join(letterDir, sub.name, "metadata.json");
      if (!existsSync(metaPath)) continue;

      const meta = JSON.parse(readFileSync(metaPath, "utf-8"));
      presences.push({ name: meta.name, slug: slug(sub.name) });
    }
  }

  presences.sort((a, b) => a.name.localeCompare(b.name));
  return presences;
};

const cell = (presence: Presence | null): string => {
  if (!presence) return '    <td align="center"></td>';

  return [
    '    <td align="center">',
    `      <img src="https://cdn.nowly.me/presences/${presence.slug}/assets/logo.png" width="48" height="48" alt="${presence.name}"><br>`,
    `      <b>${presence.name}</b>`,
    "    </td>",
  ].join("\n");
};

const generateTable = (presences: Presence[]): string => {
  const cols = 5;
  const rows: string[] = [];

  for (let i = 0; i < presences.length; i += cols) {
    const chunk = presences.slice(i, i + cols);
    const cells = chunk.map(cell).join("\n");

    rows.push(`  <tr>\n${cells}\n  </tr>`);
  }

  return `<table width="100%">\n${rows.join("\n")}\n</table>`;
};

const presences = loadPresences();
const table = generateTable(presences);

let readme = readFileSync(readmePath, "utf-8");
readme = readme.replace(
  /<!-- TABLE_START -->[\s\S]*?<!-- TABLE_END -->/,
  `<!-- TABLE_START -->\n${table}\n<!-- TABLE_END -->`,
);

writeFileSync(readmePath, readme, "utf-8");
console.log(`README generated with ${presences.length} presences (${Math.ceil(presences.length / 5)} rows × 5 columns).`);
