import { defineConfig } from 'wxt';
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";
import tailwindcss from '@tailwindcss/vite';

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-svelte'],
  manifest: {
    name: "Name",
    description: "My extension description",
    permissions: ["storage"],
    web_accessible_resources: [
      {
        resources: ["dashboard.html"],
        matches: ["*://*/*"]
      }
    ],
    // entrypoints: {
    //   // Existing entry points
    //   background: 'src/entrypoints/background.ts',
    //   popup: 'src/entrypoints/popup/popup.ts',
    //   dashboard: 'src/entrypoints/dashboard/dashboard.ts',
    //   // Updated content script entry point
    //   content: 'src/entrypoints/content/content.ts'
    // },
  },
  vite: () => ({
    plugins: [
      wasm(),
      topLevelAwait(),
      tailwindcss()
    ],
  }),

  webExt: {
    // startUrls: ['https://www.nbcnews.com/news/us-news/minnesota-lobbyist-arrested-allegedly-sending-threatening-texts-rcna214283']
    // startUrls: ['https://www.google.com/search?q=svelte+&sca_esv=bceb17660d299197&sxsrf=AE3TifPTf4yzQBFL2e4CB2J9kR_SevQN8A%3A1750560224977&ei=4G1XaOu4O_6U5OMP2fO1iQw&ved=0ahUKEwjrqPiCgYSOAxV-CnkGHdl5LcEQ4dUDCBA&uact=5&oq=svelte+&gs_lp=Egxnd3Mtd2l6LXNlcnAiB3N2ZWx0ZSAyBBAjGCcyChAjGIAEGCcYigUyCxAAGIAEGJECGIoFMgoQABiABBgUGIcCMgsQABiABBiRAhiKBTILEAAYgAQYsQMYgwEyCxAAGIAEGJECGIoFMgoQABiABBgUGIcCMgsQABiABBiRAhiKBTILEAAYgAQYsQMYgwFIpQtQ_QZY6AhwAngBkAEAmAHdAaAB9gKqAQUwLjEuMbgBA8gBAPgBAZgCBKAC_wLCAgoQABiwAxjWBBhHwgIGEAAYFhgewgILEAAYgAQYhgMYigXCAggQABiABBiiBMICBRAAGO8FmAMAiAYBkAYIkgcFMi4xLjGgB6gOsgcFMC4xLjG4B_sCwgcDMC40yAcH&sclient=gws-wiz-serp']
    startUrls: ['https://www.unz.com/article/was-coronavirus-a-biowarfare-attack-against-china/']
    // startUrls: ['https://kirschsubstack.com/p/should-you-get-any-vaccines-the-data']
  }
});
