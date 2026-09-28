// Browser/Node-neutral build adapter.
// Usage in a JS-capable build step:
//   import state from "../../issues/0001/state.json" with { type: "json" };
//   import { renderSystem } from "./system-renderer.js";
//   write(renderSystem(state, "en")); write(renderSystem(state, "ua"));
//
// Renderer deliberately accepts the analytical state as data.
// It must not fetch news, infer deltas, or mutate Ledger state.
export { renderSystem, STRINGS } from "./system-renderer.js";
