import type { PresenceAssets, PresenceConstructor } from "@nowly/sdk"

declare global {
  const Presence: PresenceConstructor
  const Assets: PresenceAssets
}