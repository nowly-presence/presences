# Creating a Nowly Presence

Self-contained guide to author a new **presence** — a script that detects what a user is doing on a website and shows it as Discord Rich Presence. Use this whenever adding support for a new site/service (streaming, music, social, gaming, tools, AI, learning, creator platforms). Follow it top to bottom.

## What a presence is

A presence lives in `src/{LETTER}/{Service Name}/`. The Nowly CLI (`@nowly/cli`) bundles its `presence.ts` with esbuild, and the browser extension injects the bundle into matching pages. On a timer, the extension fires an `UpdateData` event; your handler reads the DOM and calls `setActivity(...)`, which is forwarded to the Go native host and on to Discord over IPC.

```
website DOM  ──read──▶  presence.on("UpdateData")  ──setActivity()──▶  extension  ──▶  native host  ──▶  Discord
```

## Before you start

1. Read the official presence docs at https://nowly.me/docs (Creating your first presence, Presence structure, Metadata, Presence API, Assets, Settings).
2. Open **two existing presences as references** — pick the ones closest to your target site (see "Pick a strategy" below). Match their structure, naming, and tone exactly.

## Folder anatomy

```
src/{LETTER}/{Service Name}/
  metadata.json        # required - marketplace + matching metadata
  presence.ts          # required - the script (entry point bundled by esbuild)
  settings.ts          # preferred - default-exported setting definitions (CLI 1.7.0+)
  utils/               # optional but recommended - helpers (DOM, parsing, API, bridge)
    player.ts
    browsing.ts
  locales/             # required - runtime activity strings shown on Discord
    en-US.json
    fr-FR.json
    es-ES.json
  assets/              # required for publishing - binary images
    logo.png
    icon.png
    thumbnail.jpg
```

**Naming rules:**
- `{LETTER}` = first character of the name, uppercased.
- `{Service Name}` = human folder name with spaces.
- `slug` is derived automatically: lowercase, spaces → hyphens.
- **Do not** put `slug` in `metadata.json`. To make other library URLs open the presence page (e.g. `/library/openfront` for `Openfront.io`), list them in `aliases`.

## Setting up

```bash
# Install the CLI globally:
pnpm i -g @nowly/cli

# Install this repo's dependencies:
pnpm install
```

> On Node 24+, the global install may require `--config.minimumReleaseAge=0` if the package was recently published.

## Workflow

1. **Scaffold.** With CLI 1.7.0+, run `nowly init "Service Name"` (also creates `settings.ts` and starter `locales/{en-US,fr-FR,es-ES}.json`) or create the files by hand. Do not copy legacy inline setting definitions into a new presence.
2. **Write `metadata.json`** (see reference below). Include `longDescription` and `features` in `en-US`, `fr-FR`, `es-ES`.
3. **Write `locales/en-US.json`, `fr-FR.json`, `es-ES.json`** — the runtime strings your `presence.ts` will show as `details`/`state` (see "Locales" below). Write `en-US.json` first, then translate the same keys into the other two.
4. **Inspect the target site's DOM** to find where the relevant data lives.
5. **Write `presence.ts` + `utils/`** following the SDK reference and conventions — call `presence.getStrings()` for activity text instead of hardcoding English.
6. **Build:** `nowly build <slug>` — must succeed.
7. **Load locally:** `nowly extension <slug>` (first time) or `nowly pack <slug>` and drop the zip in the extension Debug panel.
8. **Validate:** `nowly validate <slug>` — must report `✓`.
9. **Type-check:** `npx tsc --noEmit -p tsconfig.json` — must be clean.
10. Hand off assets + manual E2E verification.

## CLI commands

Run all commands from the repo root:

```bash
nowly                          # Interactive init
nowly init "Service Name"      # Non-interactive init (add --category, --color, --discord-native, etc.)
nowly build <slug>             # Build a presence
nowly pack <slug>              # Zip a built presence for drop-install
nowly extension <slug...>      # Bake presences into a ready-to-load Chrome dev extension
nowly validate <slug>          # Validate metadata
nowly list                     # List all presences
```

## `metadata.json` reference

| Field | Notes |
|---|---|
| `name` | Display name, e.g. `"Paramount+"`. |
| `aliases` | Optional alternative library URL slugs that redirect to the presence page, e.g. `["openfront"]`. Lowercase letters, digits, dots or hyphens, max 10. Each must differ from the presence slug and from every other presence's slug and aliases; `nowly validate` (CLI 1.8.0+), the Nolo PR check and publishing reject conflicts. |
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
| `discordNative` | Optional boolean. `true` when Discord already supports the platform if the user links their account. |
| `imageProxy` | Optional `{ hostSuffixes: string[], headers?: Record<string,string> }`. Declares external CDN hosts to proxy images through (via `createCachedImageProxyUrl`) when Discord can't load them directly. |

Locale keys: `^[a-z]{2}-[A-Z]{2}$`. Standard: `en-US`, `fr-FR`, `es-ES`.

## `presence.ts` — the SDK

The SDK is published on npm as `@nowly/sdk`. `Presence` and `Assets` are **injected globals** — do not import them.

```ts
import { createMediaTimestamps, PresenceType } from "@nowly/sdk"

const presence = new Presence()

presence.on("UpdateData", async (ctx) => {
  // ctx.settings holds the user's current setting values
})

await presence.setActivity(data)   // push to Discord
presence.clearActivity()           // show nothing
await presence.getStrings()        // this presence's locale/{lang}.json content
presence.formatString(tpl, params) // "{name} on Foo" + {name: "x"} -> "x on Foo"
presence.info("msg")
presence.error("msg")
```

### PresenceData

```ts
type PresenceData = {
  name?: string
  details?: string
  state?: string
  detailsUrl?: string      // SDK 1.7.0+: public HTTPS destination for details
  stateUrl?: string        // SDK 1.7.0+: public HTTPS destination for state
  largeImageKey?: string   // Assets.Logo | Assets.Icon | Assets.Thumbnail | https:// URL
  largeImageText?: string
  smallImageKey?: string   // "play" | "pause" | "search" only
  smallImageText?: string
  startTimestamp?: number
  endTimestamp?: number
  type?: PresenceTypeValue // Watching, Listening, Playing, ...
  statusDisplayType?: 0 | 1 | 2 // compact status: name, state, details; does not change the card
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

Prefer a default export in `settings.ts` with CLI 1.7.0+. This file completely overrides legacy inline `Presence.Settings({ ... })` definitions; there is no merge. Invalid files must fail the build, not silently fall back. Without the file, existing inline definitions remain supported. Do not migrate unrelated presences just to change the format.

```ts
// settings.ts
import type { PresenceSetting } from "@nowly/sdk"

export default {
  showBrowsing: {
    type: "boolean",
    default: false,
    label: { "en-US": "Show browsing activity", "fr-FR": "...", "es-ES": "..." },
    description: { "en-US": "When enabled, ..." },
  },
} satisfies Record<string, PresenceSetting>
```

Use `new Presence()` in `presence.ts`. Do not import `settings.ts` or call `Presence.Settings` for the new format: the CLI discovers the file and registers defaults automatically. Read values from `ctx.settings` or `getSetting<boolean>("showBrowsing")` for an explicitly typed value. The CLI still emits `settings.json`; stored user values take priority. Keep definitions declarative and JSON-compatible, without browser or Node APIs.

For streaming/video presences, offer `hideOnPause` (false), `showPlaybackState` (true), and `statusDisplayType` (select, `name` by default). Hide paused playback before any browsing fallback; resume normally when playback resumes. Hiding playback state removes both the small icon and its tooltip. Map `name`/`state`/`details` to `0`/`1`/`2`, falling back to `0` if the chosen field is unavailable. Preserve media titles in the card, privacy controls, live-stream timestamps, and browsing toggles. Compact status selection requires compatible extension and native host versions.

### Locales

`locales/*.json` files hold the strings your `presence.ts` shows on Discord (`details`, `state`, mode labels, etc.). Marketplace translations stay in `metadata.json` (`description`, `longDescription`, `features`); setting labels and descriptions stay in `settings.ts`, or in legacy inline definitions.

```json
// locales/en-US.json
{
  "browsingHomepage": "Browsing homepage",
  "watching": "Watching {title}"
}
```

```ts
import type enUS from "./locales/en-US.json"

presence.on("UpdateData", async (ctx) => {
  const strings = await presence.getStrings<typeof enUS>()

  await presence.setActivity({
    details: strings.browsingHomepage,
    state: presence.formatString(strings.watching, { title }),
    // ...
  })
})
```

Keep the exact same key set across all three locale files. Fallback to `en-US` only happens when the *entire* locale file is missing — there is no per-key fallback, so a key present in `en-US.json` but forgotten in `fr-FR.json` renders as `undefined`.

### Assets

```ts
Assets.Logo       // -> assets/logo.png
Assets.Icon       // -> assets/icon.png
Assets.Thumbnail  // -> assets/thumbnail.jpg
```

For large posters fetched from the page, pass `https://` URL directly as `largeImageKey`. For dynamic/expiring/long URLs, use `createImageProxyUrl` / `createCachedImageProxyUrl` from `@nowly/sdk`.

## Pick a strategy

| Strategy | When | `world` |
|---|---|---|
| **Pure DOM scraping** | Title/episode/poster are readable in the DOM. | isolated |
| **Same-origin API fetch** | The site exposes a JSON API on its own origin. | `main` |
| **Page-world bridge** | Data only exists on a page-world object. | isolated + injected `<script>` |

## Conventions

- **Browsing toggle.** Add `showBrowsing` boolean setting, `default: false`, with tri-lingual label/description. Playback shows unless `hideOnPause` applies; browsing only if enabled.
- **Clear when irrelevant.** `presence.clearActivity()` on unmatched pages.
- **Small images.** Only `"play"`, `"pause"`, `"search"`.
- **Buttons.** At most 2; strip query strings.
- **Clickable text.** With SDK 1.7.0+ and compatible extension/native host, use `detailsUrl` and `stateUrl` for independently clickable lines. Match each destination to its displayed content or author, using verified public links from the page or canonical content IDs. Omit unknown links and all links hidden by privacy settings. Do not expose private chats, secret resources, credentials, or access tokens. URLs must be HTTPS, at most 2048 characters, and retain only query parameters needed to identify public content (for example YouTube's `v`). Music links must come from matching now-playing anchors, not the unrelated page being browsed. This is independent of button visibility.
- **`world`.** Stay isolated by default.
- **Localization.** `en-US`, `fr-FR`, `es-ES` everywhere: `metadata.json` for marketplace text, setting definitions for labels/descriptions, and `locales/*.json` + `getStrings()` for activity text. Never hardcode English activity text.
- **Code style.** No semicolons, double quotes, 2-space indent.

## Assets

`logo.png`, `icon.png`, `thumbnail.jpg` are binary images that must be supplied by a human. Build and validate pass without them, but they are required before publishing.

## Build & type-check

```bash
nowly build <slug>
nowly validate <slug>
npx tsc --noEmit -p tsconfig.json   # esbuild does NOT type-check - always run this!
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
- **Figma / YouTube** — reference for `locales/*.json` + `getStrings()`/`formatString()`
