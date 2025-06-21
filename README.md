# Truely AI

An agentic browser extension to tell you the whole truth.

## Setup

We used [WXT](https://wxt.dev/), [Svelte`(https://svelte.dev/)] and [PNPM](https://pnpm.io/) to build this project.

To get started, run `pnpm install` to install the dependencies and `pnpm dev` to start the development server.

## Project Structure

This project uses [WXT](https://wxt.dev/)'s standard project structure, with all source code located inside the `src` directory.

- `src/`: Contains all the source code for the extension.
- `src/assets/`: This directory is for static assets that are processed by the build tool (Vite), like CSS, fonts, or images that are imported into your UI components.
- `src/entrypoints/`: This is where the main files for your extension live. Each subdirectory represents a different part of your extension.
  - `background/`: The background service worker for the extension.
  - `content/`: Content scripts that run in the context of web pages.
  - `sidepanel/`: The sidepanel for the extension with configuration and a chat interface.
- `src/lib/components/`: Contains reusable Svelte components that are used across different parts of the extension's UI.
- `src/public/`: Any files in this directory are copied directly to the root of the extension's build output without being processed.
  -  `icon/`: Contains the extension icons in various sizes.
- `wxt.config.ts`: The main configuration file for the WXT framework, where you can customize the build process and extension manifest.
- `package.json`: The standard Node.js manifest file containing project metadata, dependencies, and scripts.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) with the following extensions:

- [Svelte for VS Code](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode)
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
