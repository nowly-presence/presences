import { PresenceType } from "@nowly/sdk"

const presence = new Presence()

presence.on("UpdateData", async () => {
  await presence.setActivity({
    details: `Browsing ${document.location.hostname}`,
    largeImageKey: Assets.Logo,
    type: PresenceType.Watching,
  })
})
