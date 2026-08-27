# AI integration

<div class="note">

The AI feature and all its related components are marked as <strong>experimental</strong> and are subject to change.

</div>

## Introduction

Bryntum components ship with an AI feature that lets users interact with data using natural language. Through a chat
panel, users can ask questions, filter data, sort records, create or update entries, and more — all using
conversational commands instead of traditional UI interactions.

The AI feature supports multiple LLM providers (OpenAI, Anthropic, Google) and includes voice input/output capabilities.

## Getting started

### Minimum configuration

To enable the AI feature, you need two things:

1. A `promptUrl` — your backend endpoint that forwards prompts to the LLM API
2. An `apiPlugin` — the plugin class matching your LLM provider

```javascript
import { Grid, OpenAIPlugin } from '@bryntum/grid';

const grid = new Grid({
    features : {
        ai : {
            promptUrl : '/api/ai/prompt',
            apiPlugin : OpenAIPlugin
        }
    }
});
```

This gives you a working AI chat panel. The feature will automatically detect your grid's columns, data model, and
available operations.

### Adding a chat button

To show a floating chat button that opens the chat panel:

```javascript
features : {
    ai : {
        promptUrl  : '/api/ai/prompt',
        apiPlugin  : OpenAIPlugin,
        chatButton : true
    }
}
```

You can also customize the chat button and panel appearance:

```javascript
features : {
    ai : {
        promptUrl : '/api/ai/prompt',
        apiPlugin : OpenAIPlugin,
        chatButton : {
            tooltip   : 'AI Assistant',
            appendTo  : 'container',
            chatPanel : {
                title            : 'AI Assistant',
                intro            : { html : 'Hello, I am your AI assistant' },
                avatar           : 'resources/avatar.webp',
                showTimestamp    : true,
                showReadAloud    : true,
                showRecordButton : true,
                width            : '30em'
            }
        }
    }
}
```

### Specifying the model

Most LLM APIs require a model name. Set it using the `model` config:

```javascript
features : {
    ai : {
        promptUrl : '/api/ai/prompt',
        apiPlugin : OpenAIPlugin,
        model     : 'gpt-4o'
    }
}
```

## Backend setup

The AI feature does **not** call LLM APIs directly from the browser. Instead, it sends requests to your
`promptUrl` endpoint. Your backend is responsible for:

1. Receiving the prompt request from the client
2. Adding your API credentials (API key)
3. Forwarding the request to the LLM API
4. Returning the response to the client

This architecture keeps your API keys secure on the server side.

The request body sent to your backend matches the format expected by the configured `apiPlugin`. For OpenAI, it follows
the [Chat Completions API](https://platform.openai.com/docs/api-reference/chat) format. For Anthropic, it follows the
[Messages API](https://docs.anthropic.com/en/api/messages) format.

## API plugins

Three built-in API plugins are available:

| Plugin | LLM Provider | Import path |
|--------|-------------|-------------|
| `OpenAIPlugin` | OpenAI (GPT-4, GPT-4o, etc.) | `Core/feature/ai/apiPlugins/OpenAIPlugin` |
| `AnthropicPlugin` | Anthropic (Claude) | `Core/feature/ai/apiPlugins/AnthropicPlugin` |
| `GooglePlugin` | Google (Gemini) | `Core/feature/ai/apiPlugins/GooglePlugin` |

### Using multiple models

You can let users switch between different models at runtime using the `availableApis` config:

```javascript
features : {
    ai : {
        promptUrl     : '/api/ai/prompt',
        apiPlugin     : OpenAIPlugin,
        model         : 'gpt-4o',
        availableApis : [
            { id : 'gpt-4o', name : 'GPT-4o', apiPlugin : OpenAIPlugin },
            { id : 'claude-opus-4-1', name : 'Claude Opus', apiPlugin : AnthropicPlugin },
            { id : 'gemini-2.0-flash', name : 'Gemini Flash', apiPlugin : GooglePlugin }
        ]
    }
}
```

This adds a model selector in the AI settings panel.

## Built-in tools

The AI feature comes with built-in tools that let the LLM interact with the component. Tools are the actions the LLM can
perform. They are automatically described to the LLM via the system message.

### Grid tools

| Tool | Description |
|------|-------------|
| `getRecords` | Retrieves records from the store |
| `updateRecords` | Updates records in the store |
| `deleteRecords` | Deletes records from the store |
| `addRecord` | Adds a new record to the store |
| `filterRecords` | Filters the store |
| `unfilterRecords` | Removes all filters |
| `sortRecords` | Sorts the store |
| `selectRecords` | Selects records in the grid |
| `highlightCells` | Highlights specific cells in the grid |
| `groupRecords` | Groups the store by a field, or clears grouping |
| `getColumns` | Lists visible and hidden columns |
| `showColumn` | Shows a hidden column |
| `hideColumn` | Hides a visible column |
| `lockRows` | Locks rows to the top (requires [LockRows](#Grid/feature/LockRows)) |
| `reloadGrid` | Reloads data (if the store supports it) |

### Base tools

These tools are available in all Bryntum products:

| Tool | Description |
|------|-------------|
| `changeTheme` | Switches between dark and light themes |
| `askUser` | Presents the user with a question and clickable options |
| `createPlan` | Creates a step-by-step plan for multi-step tasks (requires [planning](#Grid/feature/AI#config-planning)) |
| `completePlanSteps` | Marks plan steps as completed (only available when a plan is active) |
| `undo` | Undoes the last AI action |
| `endVoiceConversation` | Ends the current voice conversation |

<div class="note">

Tool names are dynamic and change based on your model class names. For example, if your row model is named
<code>Person</code>, the tools will be named <code>getPersons</code>, <code>updatePersons</code>, etc.

</div>

## Custom tools

You can add your own tools to extend the AI's capabilities. Use the
[AIHelper](#Core/feature/ai/AIHelper) class for convenience:

```javascript
import { Grid, AIHelper, OpenAIPlugin } from '@bryntum/grid';

const grid = new Grid({
    features : {
        ai : {
            promptUrl : '/api/ai/prompt',
            apiPlugin : OpenAIPlugin,
            tools     : {
                exportToPdf : AIHelper.createBasicTool({
                    description : 'Exports the grid data to a PDF file',
                    properties  : {
                        fileName : {
                            type        : 'string',
                            description : 'The file name for the exported PDF'
                        }
                    },
                    required : ['fileName'],
                    fn({ args : { fileName } }) {
                        // Your export logic here
                        grid.features.pdfExport.export({ fileName });
                        return 'PDF exported successfully';
                    }
                })
            }
        }
    }
});
```

### Removing a built-in tool

To remove a tool you don't want the AI to use, set it to `null`:

```javascript
features : {
    ai : {
        promptUrl : '/api/ai/prompt',
        apiPlugin : OpenAIPlugin,
        tools     : {
            deleteRecords : null  // Prevent the AI from deleting records
        }
    }
}
```

### Tool helper methods

The [AIHelper](#Core/feature/ai/AIHelper) class provides several factory methods for creating tools:

| Method | Purpose |
|--------|---------|
| `createBasicTool` | Simple tool with parameters |
| `createConditionTool` | Tool with data filtering conditions |
| `createGetRecordsTool` | Tool for retrieving records |
| `createUpdateRecordsTool` | Tool for updating records |
| `createDeleteRecordsTool` | Tool for deleting records |
| `createAddRecordTool` | Tool for adding records |
| `createFilterTool` | Tool for filtering a store |

### Structured tool responses

A tool's `fn()` can return either a plain string (used as-is as the success message) or a structured
`AIToolCallResult` object of the form `{ ok, message, data, error }`. Returning structured results lets you pass
typed data back to the LLM and signal failure clearly. Two static helpers on [AIHelper](#Core/feature/ai/AIHelper)
make this easy:

| Helper | Shape |
|--------|-------|
| `AIHelper.error(message, more?)` | `{ ok: false, error: { message }, ...more }` |
| `AIHelper.result(data, message?)` | `{ ok: true, data, message? }` |

```javascript
features : {
    ai : {
        tools : {
            getInventory : AIHelper.createBasicTool({
                description : 'Returns current inventory counts for a SKU',
                properties  : {
                    sku : { type : 'string', description : 'Product SKU' }
                },
                required : ['sku'],
                async fn({ args : { sku } }) {
                    const response = await fetch(`/api/inventory/${sku}`);
                    if (!response.ok) {
                        return AIHelper.error(`No inventory record for SKU ${sku}`);
                    }
                    return AIHelper.result(await response.json(), 'Inventory loaded');
                }
            })
        }
    }
}
```

Each configured API plugin automatically converts the structured result to the native tool-response format expected
by OpenAI, Anthropic, or Google.

## Data models

The AI feature automatically discovers your data model from the store's `ModelClass`. To provide additional context
(related models, extra stores), use the `models` config:

```javascript
const grid = new Grid({
    features : {
        ai : {
            promptUrl : '/api/ai/prompt',
            apiPlugin : OpenAIPlugin,
            models    : {
                Project : {
                    relations : {
                        members : {
                            relatedModelName : 'Member'
                        },
                        owner : {
                            relatedModelName : 'Member'
                        }
                    }
                },
                Member : {
                    store : memberStore
                }
            }
        }
    }
});
```

This tells the AI about the `Member` model and its relationship to `Project`, allowing users to make prompts like
*"Show projects where the owner is John"*.

## @ mention support

The chat input supports `@` mentions for referencing specific records inline. Typing `@` followed by at least one
character searches the configured [models](#Grid/feature/AI#config-models) by their `classDisplayName` and shows a
dropdown of matching records. Keyboard navigation (`ArrowDown`/`ArrowUp`), `Enter`/`Tab` to select, `Escape` to dismiss,
and mouse click selection are all supported.

When the message is sent, each mention is replaced with a structured token like
`{@:"Record Name", model:"ModelName", id:123}` that the agent can resolve to a specific record. Chat bubbles
automatically detect and render these tokens as styled mention tags — both in the user's sent messages and in any LLM
responses that echo the same format.

Mentions are enabled by default and can be disabled:

```javascript
features : {
    ai : {
        mentions : false
    }
}
```

## Undo / Redo

The AI feature supports undo/redo for data-modifying actions. This is enabled by default:

```javascript
features : {
    ai : {
        promptUrl : '/api/ai/prompt',
        apiPlugin : OpenAIPlugin,
        undo      : true,   // enabled by default
        redo      : true    // enabled by default, requires undo
    }
}
```

When enabled, an undo icon appears under the last undoable message in the chat panel. The undo/redo functionality uses
the [StateTrackingManager](#Core/data/stm/StateTrackingManager) (STM) internally.

## Confirmation dialogs

You can require user confirmation before the AI modifies data:

```javascript
features : {
    ai : {
        promptUrl                     : '/api/ai/prompt',
        apiPlugin                     : OpenAIPlugin,
        requireConfirmationOnUpdates  : true,
        requireConfirmationOnRemovals : true,
        requireConfirmationOnAdds     : true
    }
}
```

When enabled, the user will see a confirmation dialog listing the affected records before any data changes are applied.

## Planning

When the AI needs to perform multi-step tasks (for example, copying an event to every day of the week), it can break
the work into a tracked plan. This is especially useful with smaller or less capable LLM models that may otherwise
skip steps or lose track of progress.

Planning is enabled by default. You can disable it:

```javascript
features : {
    ai : {
        planning : false
    }
}
```

When enabled, the AI has access to two additional tools: `createPlan` (to outline steps) and `completePlanSteps`
(to mark steps as done). The AI is instructed to create a plan before executing multi-step requests, and the
framework tracks progress, nudging the AI to continue if it stops before all steps are completed.

The user can also toggle planning on/off from the AI settings panel at runtime.

## Training data

You can "teach" the AI how to handle specific scenarios by providing example conversations:

```javascript
features : {
    ai : {
        promptUrl    : '/api/ai/prompt',
        apiPlugin    : OpenAIPlugin,
        trainingData : [
            [
                {
                    role    : 'user',
                    content : 'mark all out-of-stock products as discontinued'
                },
                {
                    role      : 'assistant',
                    toolCalls : [
                        {
                            name       : 'updateRecords',
                            parameters : {
                                changes : [
                                    {
                                        field       : 'status',
                                        value       : 'discontinued',
                                        setOperator : 'set'
                                    }
                                ],
                                recordConditions : {
                                    type       : 'all',
                                    conditions : [
                                        {
                                            field    : 'availability',
                                            operator : '=',
                                            value    : 'Out of stock'
                                        }
                                    ]
                                }
                            }
                        }
                    ]
                }
            ]
        ]
    }
}
```

<div class="note">

Training data is included in every request sent to the LLM API, so it consumes tokens and context window space. Use it
sparingly and only for scenarios where the AI needs explicit guidance.

</div>

## Voice features

The AI feature supports voice input and output through three capabilities:

### Voice recording (speech-to-text)

Enable a record button in the chat panel by configuring a `transcribeUrl`:

```javascript
features : {
    ai : {
        promptUrl     : '/api/ai/prompt',
        apiPlugin     : OpenAIPlugin,
        transcribeUrl : '/api/ai/transcribe',
        chatButton    : {
            chatPanel : {
                showRecordButton : true
            }
        }
    }
}
```

### Read aloud (text-to-speech)

Enable a "read aloud" button on AI responses by configuring a `textToSpeechUrl`:

```javascript
features : {
    ai : {
        promptUrl       : '/api/ai/prompt',
        apiPlugin       : OpenAIPlugin,
        textToSpeechUrl : '/api/ai/speak',
        chatButton      : {
            chatPanel : {
                showReadAloud : true
            }
        }
    }
}
```

### Voice activation

Enable hands-free voice activation with a wake phrase:

```javascript
features : {
    ai : {
        promptUrl       : '/api/ai/prompt',
        apiPlugin       : OpenAIPlugin,
        transcribeUrl   : '/api/ai/transcribe',
        textToSpeechUrl : '/api/ai/speak',
        voiceActivation : {
            phrase              : 'Hey assistant',
            replyOnActivation   : true,
            language            : 'en-US',
            conversationTimeout : 600000,  // 10 minutes
            autoStart           : false
        }
    }
}
```

## AI-powered filtering (AIFilter)

The [AIFilter](#Grid/feature/ai/AIFilter) feature provides a simpler, filter-only AI integration. It enables a text
field where users can type natural language filter queries like *"Show products under $50"*.

```javascript
import { OpenAIPlugin } from '@bryntum/grid';

const grid = new Grid({
    features : {
        aiFilter : {
            promptUrl : '/api/ai/prompt',
            apiPlugin : OpenAIPlugin,
            model     : 'gpt-4o'
        }
    },
    tbar : [
        {
            type        : 'aifilterfield',
            width       : 400,
            placeholder : 'Ask AI to filter...'
        }
    ],
    store : {
        fields : [
            { name : 'name', type : 'string', description : 'Product name' },
            { name : 'price', type : 'number', description : 'Price in USD' },
            { name : 'category', type : 'string', description : 'Product category' }
        ]
    }
});
```

<div class="note">

The <code>description</code> property on data fields is important for AIFilter — it helps the AI understand what each
field represents and generate accurate filters.

</div>

## User settings

You can persist user preferences (selected model, verbosity, voice settings, etc.) using the `userSettings` config
and the `userSettingsUpdate` event:

```javascript
// Load saved settings
const savedSettings = JSON.parse(localStorage.getItem('ai-settings') || '{}');

const grid = new Grid({
    features : {
        ai : {
            promptUrl    : '/api/ai/prompt',
            apiPlugin    : OpenAIPlugin,
            userSettings : savedSettings,
            listeners    : {
                userSettingsUpdate({ changes }) {
                    Object.assign(savedSettings, changes);
                    localStorage.setItem('ai-settings', JSON.stringify(savedSettings));
                }
            }
        }
    }
});
```

The settings panel is accessible from the chat panel and includes options for:

* AI model selection (if `availableApis` is configured)
* Response verbosity level
* Highlight related items
* Confirmation preferences
* Voice activation settings

## Prompt history

The chat panel supports `ArrowUp`/`ArrowDown` to cycle through previously sent messages. This is opt-in via the
`promptHistory` config — pass `true` or an empty array to activate it, or pass a previously persisted array to restore
earlier prompts. Whenever a new message is sent, the `promptHistoryUpdate` event fires so the application can persist
the updated list.

```javascript
const grid = new Grid({
    features : {
        ai : {
            promptHistory : JSON.parse(localStorage.getItem('ai-prompt-history') || '[]'),
            listeners     : {
                promptHistoryUpdate({ promptHistory }) {
                    localStorage.setItem('ai-prompt-history', JSON.stringify(promptHistory));
                }
            }
        }
    }
});
```

When the chat input contains multiline text, `ArrowUp`/`ArrowDown` move the cursor between lines instead. History
navigation only activates when the cursor is on the first or last line and the field content has not been manually
edited.

## Additional configuration

### Debug mode

Enable console logging of AI operations for development:

```javascript
features : {
    ai : {
        debugMode : true
    }
}
```

With `debugMode` enabled, each API response also logs its current and cumulative token usage to the browser console,
making it easy to spot unexpected context growth while developing.

### Token usage tracking

Each AI chat message that results from an API response stores the token usage reported by the provider on the message
record:

| Field | Description |
|-------|-------------|
| `inputTokens` | Tokens consumed by the request |
| `outputTokens` | Tokens generated in the response |
| `totalTokens` | Sum of input and output tokens |

Applications can read these fields from the chat panel's store to monitor or report API consumption. Records for
messages that did not trigger an API call (e.g. purely local messages) do not carry these fields.

### Async status messages

While an AI prompt is in flight, the chat bubble cycles through contextual status messages like "Thinking",
"Reading Records", "Updating Records", or "Processing". The `minStatusDisplayTime` config (default `400` ms) sets
the minimum time each status is visible before the next one replaces it, ensuring users can read each one:

```javascript
features : {
    ai : {
        minStatusDisplayTime : 600  // give users a bit longer to read each status
    }
}
```

### Connection check

Verify the AI backend is reachable on startup:

```javascript
features : {
    ai : {
        showNoConnectionIcon : true
    }
}
```

If the connection test fails, a warning icon appears on the chat button.

### Timeout

Configure the maximum time a prompt is allowed to take (default: 60 seconds):

```javascript
features : {
    ai : {
        timeout : 120000  // 2 minutes
    }
}
```

### Verbosity

Control how verbose the AI responses are ('1' = minimal, '2' = concise, '3' = verbose):

```javascript
features : {
    ai : {
        verbosityLevel : '2'
    }
}
```

### Record highlighting

By default, records affected by AI actions are highlighted in the UI. Disable it with:

```javascript
features : {
    ai : {
        highlightRelatedItems : false
    }
}
```

### Feedback

Enable thumbs up/down feedback on AI responses:

```javascript
features : {
    ai : {
        feedbackUrl : '/api/ai/feedback'
    }
}
```

## Full configuration example

Here is a comprehensive example combining many of the configurations described above:

```javascript
import { Grid, OpenAIPlugin, AnthropicPlugin, AIHelper } from '@bryntum/grid';

const savedSettings = JSON.parse(localStorage.getItem('ai-settings') || '{}');

const grid = new Grid({
    features : {
        ai : {
            // Backend endpoints
            promptUrl       : '/api/ai/prompt',
            textToSpeechUrl : '/api/ai/speak',
            transcribeUrl   : '/api/ai/transcribe',
            feedbackUrl     : '/api/ai/feedback',

            // API configuration
            apiPlugin     : OpenAIPlugin,
            model         : 'gpt-4-1',
            availableApis : [
                { id : 'gpt-4-1', name : 'GPT-4-1', apiPlugin : OpenAIPlugin },
                { id : 'claude-opus-4-1', name : 'Claude Opus', apiPlugin : AnthropicPlugin }
            ],

            // UI
            chatButton : {
                tooltip   : 'AI Assistant',
                chatPanel : {
                    title            : 'AI Assistant',
                    intro            : { html : 'How can I help you?' },
                    showTimestamp    : true,
                    showReadAloud    : true,
                    showRecordButton : true,
                    width            : '30em'
                }
            },

            // Behavior
            undo                          : true,
            redo                          : true,
            highlightRelatedItems         : true,
            requireConfirmationOnUpdates  : true,
            requireConfirmationOnRemovals : true,
            showNoConnectionIcon          : true,
            timeout                       : 120000,
            verbosityLevel                : '2',

            // Voice
            voiceActivation : {
                phrase            : 'Hey assistant',
                replyOnActivation : true,
                language          : 'en-US'
            },

            // User settings persistence
            userSettings : savedSettings,
            listeners    : {
                userSettingsUpdate({ changes }) {
                    Object.assign(savedSettings, changes);
                    localStorage.setItem('ai-settings', JSON.stringify(savedSettings));
                }
            },

            // Custom tools
            tools : {
                exportData : AIHelper.createBasicTool({
                    description : 'Exports the visible grid data to CSV format',
                    fn() {
                        grid.features.excelExporter.export();
                        return 'Data exported successfully';
                    }
                }),
                deleteRecords : null  // Disable record deletion
            }
        }
    }
});
```

## API docs

* [Grid AI feature](#Grid/feature/AI)
* [AIFilter feature](#Grid/feature/ai/AIFilter)
* [AIBase (base class)](#Core/feature/ai/AIBase)
* [AIHelper (tool utilities)](#Core/feature/ai/AIHelper)

## Demos

* [AI Project Summary](https://bryntum.com/products/grid/examples/ai-project-summary/) — Grid with AI chat panel
* [AI-Powered E-Commerce Product Grid](https://bryntum.com/products/grid/examples/ai-ecommerce-grid/) — Grid with AIFilter and formula features
* [AI-Powered Review Insights Grid](https://bryntum.com/products/grid/examples/ai-review-grid/) — Shows how to use an AI FormulaProvider to populate cell values and display them in the Grid


<p class="last-modified">Last modified on 2026-07-22 10:39:04</p>