import { mount } from "svelte";
import Highlight from "@/lib/components/Highlight.svelte";
import "../app.css";

export default defineContentScript({
  allFrames: true,
  matches: ["<all_urls>"],
  main(ctx) {
    // const appVersion = browser?.runtime?.getManifest()?.version || "0.0.0-dev"
    console.log("Content script mounting Svelte component.");
    const target = document.createElement("div");
    target.id = "highlight-container";
    document.body.appendChild(target);

    // Mount the Svelte component that contains all the highlighting logic.
    mount(Highlight, { target, context: new Map([["wxt:context", ctx]]) });
  },
});
