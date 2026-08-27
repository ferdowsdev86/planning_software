# Bryntum AI Agent skills

[Agent skills](https://agentskills.io) are instruction files that show your AI agent how to do specific tasks. [Bryntum skills](https://github.com/bryntum/skills) complement the Bryntum MCP server by providing practical knowledge for using Bryntum and avoiding common pitfalls such as handling React StrictMode.

## Available skills

| Skill | What it covers |
|-------|----------------|
| bryntum _(required)_ | Product identification, CSS setup, docs lookup via MCP, component defaults, sizing, dark mode, data loading |
| bryntum-react | `<BryntumGrid>` wrapper, JSX config props, `useRef` instance access, StrictMode handling |
| bryntum-angular | `<bryntum-grid>` selector, `[prop]="..."` template binding, standalone component setup |
| bryntum-vue | `<bryntum-grid>` component, `v-bind` config spreading, `BryntumGridProps` typing |
| bryntum-vanilla | Direct class import from `@bryntum/grid`, instantiation with `appendTo` |
| bryntum-crud | CrudManager, AjaxStore, phantom ID handling, partial sync, data gotchas |

## Installation

Install all skills at once:

```bash
npx degit bryntum/skills/bryntum ~/.claude/skills/bryntum
npx degit bryntum/skills/bryntum-react ~/.claude/skills/bryntum-react
npx degit bryntum/skills/bryntum-angular ~/.claude/skills/bryntum-angular
npx degit bryntum/skills/bryntum-vue ~/.claude/skills/bryntum-vue
npx degit bryntum/skills/bryntum-vanilla ~/.claude/skills/bryntum-vanilla
npx degit bryntum/skills/bryntum-crud ~/.claude/skills/bryntum-crud
```

Or install only what you need: at minimum, install `bryntum` plus the skill for your framework:

```bash
npx degit bryntum/skills/bryntum ~/.claude/skills/bryntum
npx degit bryntum/skills/bryntum-react ~/.claude/skills/bryntum-react
```


<p class="last-modified">Last modified on 2026-07-22 10:46:47</p>