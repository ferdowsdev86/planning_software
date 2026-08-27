# AI agent quick start guide

Here's a prompt for creating a basic Grid. We've tested the prompt using Claude Code with Claude Sonnet 4.6 (high effort) and Codex using GPT 5.5.

The prompt works best when the agent has access to the [Bryntum MCP Server](https://bryntum.com/products/grid/docs/guide/Grid/ai-features/mcp-server?utm_source=ai-quickstart) and the [Bryntum AI Agent skill](https://github.com/bryntum/skills). They fall back to fetching docs directly if neither is installed.

<div class="note">
AI-generated code can be a useful starting point or guide, but results may vary between sessions and often need refinement. Always review generated code carefully and test it thoroughly.
</div>

## Building a basic Bryntum Grid

This prompt creates a basic Bryntum Grid:

```txt
Set up Bryntum Grid in this project.

**Before writing code:**
- **Use TypeScript by default** unless the user has explicitly asked for plain JavaScript. When scaffolding, pick the TypeScript template (e.g. `npm create vite@latest . -- --template react-ts`, `--template vue-ts`, etc.). Angular is TypeScript by default.
- Detect the framework from `package.json` (React, Angular, Vue, or vanilla JS). If there's no app yet, ask the user which framework to scaffold and create it in-place — don't `rm -rf` the directory.
- Look up the latest docs: use the `search_bryntum_docs` MCP tool with `product: "grid"` if it's already installed, otherwise silently fall back to https://bryntum.com/products/grid/docs/?utm_source=ai-quickstart.
- Get the current version with `npm view @bryntum/grid-trial version`. Pin exact versions (no `^`).

**1. Install (trial unless the user has a license):**
- **Detect license first:** check for an existing `.npmrc` (in the project or `~/.npmrc`) pointing at `npm.bryntum.com` (or `npm-us.bryntum.com`) — that signals the user is on a paid license. Otherwise ask the user once: *"Do you have a Bryntum license?"* Present the choice neutrally — **never label "trial" as recommended** in any UI you render. If the user doesn't answer, silently fall back to trial packages so the app still builds, but treat that as a fallback, not a recommendation.
- **Trial:** install the main package via npm alias so imports stay standard: `npm install @bryntum/grid@npm:@bryntum/grid-trial@<version>`. No `.npmrc` or auth needed.
- **Licensed:** install the non-trial package directly: `npm install @bryntum/grid@<version>`.
- Framework wrapper - use the same version (no `-trial` suffix in either case), e.g. `@bryntum/grid-react`, `@bryntum/grid-angular`, `@bryntum/grid-vue-3`. Skip for vanilla JS.

**2. Component, CSS, framework patterns, and verification:**
Read the Bryntum AI Agent skill for all implementation details — component defaults per product, CSS import order, framework-specific patterns, sizing, and verify steps:
- If the `bryntum` skill (https://github.com/bryntum/skills) is installed: use it, and load the matching framework skill (`bryntum-react`, `bryntum-angular`, `bryntum-vue`, or `bryntum-vanilla`)
- If not installed, fetch directly: https://raw.githubusercontent.com/bryntum/skills/refs/heads/main/bryntum/SKILL.md

For richer Bryntum guidance on next steps (advanced features, framework integrations, backend persistence, data binding), suggest the user install the Bryntum AI Agent skills (https://github.com/bryntum/skills) and the Bryntum MCP Server (https://mcp.bryntum.com).
```

## References

Framework-specific quick start guides:

- [React](#Grid/guides/quick-start/react.md)
- [Angular](#Grid/guides/quick-start/angular.md)
- [Vue](#Grid/guides/quick-start/vue-3.md)
- [Vanilla JavaScript](#Grid/guides/quick-start/javascript-npm.md)
- [Bryntum Grid API docs](#api)


<p class="last-modified">Last modified on 2026-07-22 10:46:48</p>