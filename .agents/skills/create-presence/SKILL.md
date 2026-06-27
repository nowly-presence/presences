---
name: create-presence
description: >
  Step-by-step guide for creating a new Nowly presence (a Discord Rich Presence script
  for a website). Use this whenever you need to add support for a new site/service such
  as streaming, music, social, gaming, tools, AI, learning, or creator platforms. Trigger
  on mentions of: 'create a presence', 'new presence', 'write a presence', 'presence
  script', 'Discord Rich Presence', 'setActivity', 'PresenceData', 'metadata.json',
  'presence.ts', 'nowly presence', 'add support for', 'add presence for'.
---

# Creating a Nowly Presence

This is a self-contained guide to author a new **presence** — a script that detects
what a user is doing on a website and shows it as Discord Rich Presence. Follow it
top to bottom.

## What a presence is

A presence lives in `src/{LETTER}/{Service Name}/`. The Nowly CLI (`@nowly/cli`)
bundles its `presence.ts` with esbuild, and the browser extension injects the bundle
into matching pages. On a timer, the extension fires an `UpdateData` event; your
handler reads the DOM and calls `setActivity(...)`, which is forwarded to the Go
native host and on to Discord over IPC.

```
website DOM  ──read──▶  presence.on("UpdateData")  ──setActivity()──▶  extension  ──▶  native host  ──▶  Discord
```

## Before you start

1. Read the official presence docs at https://nowly.me/docs (Creating your first
   presence, Presence structure, Metadata, Presence API, Assets, Settings).
2. Open **two existing presences as references** — pick the ones closest to your
   target site (see "Pick a strategy" below). Match their structure, naming, and
   tone exactly.

## Folder anatomy

```
src/{LETTER}/{Service Name}/
  metadata.json        # required — marketplace + matching metadata
  presence.ts          # required — the script (entry point bundled by esbuild)
  utils/               # optional but recommended — helpers (DOM, parsing, API, bridge)
    player.ts
    browsing.ts
  assets/              # required for publishing — binary images
    logo.png
    icon.png
    thumbnail.jpg
```

**Naming rules:**
- `{LETTER}` = first character of the name, uppercased.
- `{Service Name}` = human folder name with spaces.
- `slug` is derived automatically: lowercase, spaces → hyphens.
- **Do not** put `slug` in `metadata.json`.

## Setting up

```bash
# Install the CLI globally:
pnpm i -g @nowly/cli

# Install this repo's dependencies:
pnpm install
```

> On Node 24+, the global install may require `--config.minimumReleaseAge=0` if the
> package was recently published.

## Workflow

1. **Scaffold.** Either run `nowly init "Service Name"` or create the folder/files
   by hand, copying an existing presence.
2. **Write `metadata.json`** (see reference below). Include `longDescription` and
   `features` in `en-US`, `fr-FR`, `es-ES`.
3. **Inspect the target site's DOM** with the snippets in "DOM inspection".
4. **Write `presence.ts` + `utils/`** following the SDK reference and conventions.
5. **Build:** `nowly build <slug>` — must succeed.
6. **Validate:** `nowly validate <slug>` — must report `✓`.
7. **Type-check:** `npx tsc --noEmit -p tsconfig.json` — must be clean.
8. Hand off assets + manual E2E verification.

## CLI commands

Run all commands from the repo root:

```bash
nowly                          # Interactive init
nowly init "Service Name"      # Non-interactive init (add --category, --color, etc.)
nowly build <slug>             # Build a presence
nowly validate <slug>          # Validate metadata
nowly list                     # List all presences
```

## `metadata.json` reference

| Field | Notes |
|---|---|
| `name` | Display name, e.g. `"Paramount+"`. |
| `author` | `{ "name": string, "github"?: string }`. |
| `url` | Array of domains it matches. |
| `regExp` | Optional stricter URL match. |
| `world` | `"isolated"` (default) or `"main"`. |
| `runAt` | `"document_start" \| "document_end" \| "document_idle"`. |
| `color` | Brand color `#RRGGBB`. |
| `category` | `streaming, music, video, social, gaming, tools, ai, learning, creator, other`. |
| `description` | Short, keyed by locale. **`en-US` required.** |
| `longDescription` | Detailed, per locale. |
| `features` | Per locale, 1–10 short bullet strings. |
| `assets` | `{ "logo": "logo.png", "icon": "icon.png", "thumbnail": "thumbnail.jpg" }`. |

Locale keys: `^[a-z]{2}-[A-Z]{2}$`. Standard: `en-US`, `fr-FR`, `es-ES`.

## `presence.ts` — the SDK

The SDK is published on npm as `@nowly/sdk`. `Presence` and `Assets` are **injected
globals** — do not import them.

```ts
import { createMediaTimestamps, PresenceType } from "@nowly/sdk"

const settings = Presence.Settings({ /* ... */ })
const presence = new Presence(settings)

presence.on("UpdateData", async (ctx) => {
  // ctx.settings holds the user's current setting values
})

await presence.setActivity(data)   // push to Discord
presence.clearActivity()           // show nothing
await presence.getStrings(dict)    // locale-aware strings
presence.info("msg")
presence.error("msg")
```

### PresenceData

```ts
type PresenceData = {
  details?: string
  state?: string
  largeImageKey?: string   // Assets.Logo | Assets.Icon | Assets.Thumbnail | https:// URL
  largeImageText?: string
  smallImageKey?: string   // "play" | "pause" | "search" only
  smallImageText?: string
  startTimestamp?: number
  endTimestamp?: number
  type?: PresenceTypeValue // Watching, Listening, Playing, ...
  buttons?: { label: string; url: string }[]  // max 2
  appName?: string
}
```

### Timestamps

```ts
import { createMediaTimestamps } from "@nowly/sdk"
// Returns {} when paused, otherwise { startTimestamp, endTimestamp }
if (!video.paused) Object.assign(data, createMediaTimestamps(video))
```

### Settings

```ts
const settings = Presence.Settings({
  showBrowsing: {
    type: "boolean",
    default: false,
    label: { "en-US": "Show browsing activity", "fr-FR": "...", "es-ES": "..." },
    description: { "en-US": "When enabled, ..." },
  },
})
```

### Assets

```ts
Assets.Logo       // -> assets/logo.png
Assets.Icon       // -> assets/icon.png
Assets.Thumbnail  // -> assets/thumbnail.jpg
```

For large posters fetched from the page, pass `https://` URL directly as `largeImageKey`.
For dynamic/expiring/long URLs, use `createImageProxyUrl` / `createCachedImageProxyUrl`
from `@nowly/sdk`.

## Pick a strategy

| Strategy | When | `world` |
|---|---|---|
| **Pure DOM scraping** | Title/episode/poster are readable in the DOM. | isolated |
| **Same-origin API fetch** | The site exposes a JSON API on its own origin. | `main` |
| **Page-world bridge** | Data only exists on a page-world object. | isolated + injected `<script>` |

## Conventions

- **Browsing toggle.** Add `showBrowsing` boolean setting, `default: false`, with
  tri-lingual label/description. Watch state always shows; browsing only if enabled.
- **Clear when irrelevant.** `presence.clearActivity()` on unmatched pages.
- **Small images.** Only `"play"`, `"pause"`, `"search"`.
- **Buttons.** At most 2; strip query strings.
- **`world`.** Stay isolated by default.
- **Localization.** `en-US`, `fr-FR`, `es-ES` for all user-facing strings.
- **Code style.** No semicolons, double quotes, 2-space indent.

## Assets

`logo.png`, `icon.png`, `thumbnail.jpg` are binary images that must be supplied by
a human. Build and validate pass without them, but they are required before publishing.

## Build & type-check

```bash
nowly build <slug>
nowly validate <slug>
npx tsc --noEmit -p tsconfig.json   # esbuild does NOT type-check — always run this!
```

## Reference presences

All at `src/{LETTER}/{Service Name}/`:

- **Prime Video** — streaming, pure DOM
- **Netflix** — streaming, same-origin API (`world: main`)
- **Disney Plus** — streaming, page-world bridge
- **Apple TV Plus** — streaming, pure DOM
- **YouTube Music** — music (`PresenceType.Listening`)
- **Twitch** — live/VOD/clips with browsing
- **TikTok / YouTube** — social/video, image proxy
- **Cinepulse** — single-file (no utils)
