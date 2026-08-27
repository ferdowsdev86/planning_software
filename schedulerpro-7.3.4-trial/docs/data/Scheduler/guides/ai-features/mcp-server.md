# Bryntum Model Context Protocol (MCP) Server

The Bryntum MCP server provides AI coding assistants with access to version-specific Bryntum documentation, including API references, configuration options, and live examples. Use it to get accurate, context-aware guidance when integrating and configuring Bryntum components. The server also exposes guideline resources with best-practice rules for setup, theming, and framework integration.

## Installation

You can install the MCP server in your AI coding tool of choice.

<div class="docs-tabs" data-name="installation">
<div>
    <a>Claude Code</a>
    <a>OpenAI Codex</a>
    <a>Cursor</a>
    <a>VS Code</a>
</div>
<div>

```shell
claude mcp add --transport http bryntum https://mcp.bryntum.com
```

</div>
<div>

```shell
codex mcp add bryntum --url https://mcp.bryntum.com
```

</div>
<div>

<ul>
<li>Open the <strong>Command Palette</strong> (<code>Cmd + Shift + P</code> on Mac, <code>Ctrl + Shift + P</code> on Windows) and run <strong>View: Open MCP Settings</strong>. This opens the <code>.cursor/mcp.json</code> file.</li>
<li>Add the following property to the <code>mcpServers</code> JSON object:</li>
</ul>

```json
"Bryntum": {
  "url": "https://mcp.bryntum.com",
  "type": "http"
}
```

</div>
<div>

<ul>
<li>Open the <strong>Command Palette</strong> (<code>Cmd + Shift + P</code> on Mac, <code>Ctrl + Shift + P</code> on Windows) and run <strong>MCP: Add Server...</strong>.</li>
<li>Select <strong>HTTP (HTTP or Server-Sent Events) Connect to a remote HTTP server that implements the MCP protocol</strong>.</li>
<li>Enter <code>https://mcp.bryntum.com</code> in the <strong>Server URL input</strong>.</li>
</ul>

This adds the following JSON object property to the <code>.vscode/mcp.json</code> file:

```json
{
	"servers": {
		"Bryntum MCP": {
			"url": "https://mcp.bryntum.com",
			"type": "http"
		}
	},
	"inputs": []
}
```
</div>
</div>

You can also install it in AI building platforms that support custom MCP servers, such as [Lovable](https://lovable.dev/), [Replit](https://replit.com/), and [Bolt](https://bolt.new/).

## Documentation search tool

The MCP server has a `search_bryntum_docs` tool that accepts a natural language query and returns version-specific documentation results, including source code, configuration options, and links to live examples. You can filter results by product (for example, Scheduler, Gantt, Calendar) and by version.

The tool name is `search_bryntum_docs` (full name: `mcp__bryntum__search_bryntum_docs`).

The `search_bryntum_docs` tool supports the following parameters:

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `query` | string | Yes | Search term, for example, "infinite scroll" |
| `limit` | number | No | Maximum number of results to return (default: 10, max: 100) |
| `product` | string | No | Filter by a specific Bryntum product, for example, scheduler |
| `version` | string | No | Filter by documentation version. Use "latest" for the most recent version |

For example, you could ask your AI coding assistant: "How do you display resources vertically?"

Here's the first part of the `search_bryntum_docs` response:

```txt
## Result 1
**Product:** scheduler
**Version:** 7.2.1
**File:** 
**Relevance:** 0.549

# [VerticalTimeAxisColumn](https://bryntum.com/docs/scheduler-vanilla/api/Scheduler/column/VerticalTimeAxisColumn)

A special column containing the time axis labels when the Scheduler is used in vertical mode.
...
```

The **Relevance score** shows how closely a search result matches your query. Higher scores mean a better match, they are used for ranking results within the same search.

## Usage example

With the MCP server installed, you can ask your AI coding assistant to help you build and configure Bryntum components. For example, you could give it the following prompt:

> Show resources at the top of the scheduler

The AI coding assistant uses the `search_bryntum_docs` tool to look up the relevant API references and generates code based on the official documentation:  

<video controls width="100%">
<source src="Scheduler/ai-features/bryntum-mcp-scheduler-example.webm" type="video/webm">
Sorry, your browser doesn't support embedded videos.
</video>

The MCP server provides version-specific documentation, which means the generated code uses the correct API for your version of Bryntum. It uses the latest version if not specified.

## Guideline resources

Alongside the search tool, the MCP server exposes a set of resources: read-only, best-practice documents that AI coding assistants can load into context. Where the `search_bryntum_docs` tool answers a specific question by searching the documentation, these resources give the assistant a small, curated set of rules to follow before it generates setup code, CSS imports, or framework examples. There are four resources:

- **Bryntum Setup Guidelines** — Important setup and example rules for Bryntum products. Agents should review this before generating setup instructions, CSS imports, or framework examples.
- **Bryntum CSS & Theme Rules** — CSS and theme import rules for Bryntum 7+. Covers the correct three-part import pattern and common mistakes to avoid.
- **Bryntum Framework Integration Rules** — Rules for integrating Bryntum with Angular, React, and Vue. Covers framework-idiomatic patterns and common pitfalls.
- **Bryntum API & Example Safety** — Guidelines for referencing Bryntum APIs and generating code examples. Covers configuration safety and example generation best practices.

Your AI coding tool reads the resources through the MCP server. How they're surfaced varies by tool. In Claude Code, for example, they can be read when relevant, or you can attach one to a prompt with an `@` mention.



<p class="last-modified">Last modified on 2026-07-22 10:51:33</p>