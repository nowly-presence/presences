export type FreeTvPlayerEvent = {
  type?: string
  programType?: string
  channelName?: string
  programName?: string
}

let latestEvent: FreeTvPlayerEvent = {}

window.addEventListener("message", (e) => {
  if (e.data?.type !== "nowly-freetv-player-event") return
  latestEvent = {
    type: e.data.eventType,
    programType: e.data.programType,
    channelName: e.data.channelName,
    programName: e.data.programName,
  }
})

export const installFreeTvBridge = (): void => {
  const script = document.createElement("script")
  script.textContent = `
(() => {
  if (window.__nowlyFreeTvPatched) return;
  window.__nowlyFreeTvPatched = true;
  const originalLog = console.log;
  console.log = function (...args) {
    if (typeof args[0] === "string" && args[0].includes("[PlayerEvent] start event") && args[1] && typeof args[1] === "object") {
      window.postMessage({
        type: "nowly-freetv-player-event",
        eventType: args[1].type,
        programType: args[1].programType,
        channelName: args[1].channelName,
        programName: args[1].programName,
      }, "*");
    }
    return originalLog.apply(console, args);
  };
})();
`
  document.head.appendChild(script)
}

export const getLatestFreeTvEvent = (): FreeTvPlayerEvent => latestEvent
