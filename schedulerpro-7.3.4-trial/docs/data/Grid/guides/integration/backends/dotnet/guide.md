# How to use Bryntum Grid with .NET and SQLite

[Bryntum Grid](https://bryntum.com/products/grid/) is a performant, highly customizable JavaScript data grid component.
It integrates with the major JavaScript web frameworks. This tutorial demonstrates how to use
Bryntum Grid with a [.NET Framework](https://dotnet.microsoft.com/en-us/) backend and SQLite.

You'll learn to do the following:

- Set up a .NET Web API that uses a local SQLite database and [Entity Framework Core](https://learn.microsoft.com/en-us/ef/core/).
- Configure Entity Framework Core models to define the database table structure.
- Run a seed command to populate the database with example JSON data.
- Create API endpoints to load data and sync data changes to the database.
- Set up a vanilla JavaScript Bryntum Grid frontend using Vite.
- Configure the Bryntum Grid to load data from the database and synchronize changes to the database
  using the created API endpoints.

Here's what we'll build:

![Bryntum Grid](data/Grid/images/integration/backends/dotnet/bryntum-grid-complete.png)

You can find the code for the completed guide in our GitHub repositories:

- [.NET Bryntum Grid backend](https://github.com/ritza-co/bryntum-backend-guides/tree/main/backend/dotnet/sqlite-grid)
- [Grid Vite frontend](https://github.com/ritza-co/bryntum-backend-guides/tree/main/frontend/vanilla-js/grid)

## Prerequisites

To follow along, you need the [.NET SDK](https://dotnet.microsoft.com/en-us/download) (version 10.0 or later) and
[Node.js](https://nodejs.org/en/download) installed on your system.

## Set up the backend

Create a new .NET Web API project:

```sh
dotnet new webapi -n dotnet-sqlite-grid
cd dotnet-sqlite-grid
```

### Install SQLite

If you use macOS, install SQLite using [Homebrew](https://brew.sh/):

```sh
brew install sqlite
```

For installation instructions on other operating systems, see the [SQLite downloads page](https://sqlite.org/download.html).

Install the Entity Framework Core SQLite packages:

```sh
dotnet add package Microsoft.EntityFrameworkCore.Sqlite
dotnet add package Microsoft.EntityFrameworkCore.Design
```

### Configure the port and database connection

Replace the contents of `Properties/launchSettings.json` with:

```json
{
  "$schema": "http://json.schemastore.org/launchsettings.json",
  "profiles": {
    "http": {
      "commandName": "Project",
      "dotnetRunMessages": true,
      "launchBrowser": false,
      "applicationUrl": "http://localhost:1337",
      "environmentVariables": {
        "ASPNETCORE_ENVIRONMENT": "Development"
      }
    }
  }
}
```

This configures the API to run on port 1337 without automatically opening a browser.

Update `appsettings.json` to add a SQLite connection string:

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=grid.sqlite3"
  }
}
```

## Create the data models

We'll define database models for the example data using [Entity Framework Core](https://learn.microsoft.com/en-us/ef/core/).
In Bryntum Grid, data is managed through a [Store](#Core/data/Store).

This basic tutorial covers making a model for the data store.

### Create the data models

Create a `Models` folder in the project directory. In this folder, create the following files.

### Create the Player model

Create `Models/Player.cs`:

```plaintext
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace GridApi.Models
{
    [Table("players")]
    public class Player
    {
        [Key]
        [Column("id")]
        [JsonPropertyName("id")]
        [JsonConverter(typeof(IntOrStringIdConverter))]
        public int Id { get; set; }

        [Column("name")]
        [JsonPropertyName("name")]
        public string? Name { get; set; }

        [Column("city")]
        [JsonPropertyName("city")]
        public string? City { get; set; }

        [Column("team")]
        [JsonPropertyName("team")]
        public string? Team { get; set; }

        [Column("score")]
        [JsonPropertyName("score")]
        public double Score { get; set; } = 0;

        [Column("percentageWins")]
        [JsonPropertyName("percentageWins")]
        public double PercentageWins { get; set; } = 0;
    }
}
```

This model defines the `Player` class representing players in the database. The `[JsonPropertyName]` attributes ensure
the properties are serialized using the JSON names that Bryntum Grid expects.

### Create the IntOrStringIdConverter model

Add `Models/IntOrStringIdConverter.cs` for converting IDs:

```plaintext
using System.Text.Json;
using System.Text.Json.Serialization;

namespace GridApi.Models
{
    /// <summary>
    /// Converts an ID that can be either an integer or a string (phantom ID).
    /// When reading a string, it returns 0 (for auto-generation).
    /// When writing, it always writes the integer value.
    /// </summary>
    public class IntOrStringIdConverter : JsonConverter<int>
    {
        public override int Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            if (reader.TokenType == JsonTokenType.Number)
            {
                return reader.GetInt32();
            }
            else if (reader.TokenType == JsonTokenType.String)
            {
                var stringValue = reader.GetString();
                // If it's a valid integer string, parse it
                if (int.TryParse(stringValue, out int intValue))
                {
                    return intValue;
                }
                // Otherwise it's a phantom ID - return 0 for auto-generation
                return 0;
            }
            else if (reader.TokenType == JsonTokenType.Null)
            {
                return 0;
            }

            throw new JsonException($"Unable to convert to int. Token type: {reader.TokenType}");
        }

        public override void Write(Utf8JsonWriter writer, int value, JsonSerializerOptions options)
        {
            writer.WriteNumberValue(value);
        }
    }
}
```

This converter handles phantom IDs that Bryntum Grid generates for new records before they're saved to the database.

### Create the SyncModels model

Add `Models/SyncModels.cs` for the API request and response models:

```plaintext
using System.Text.Json.Serialization;

namespace GridApi.Models
{
    // Response DTOs for Grid - uses AjaxStore pattern (not CrudManager)
    public class ReadResponse
    {
        [JsonPropertyName("success")]
        public bool Success { get; set; }

        [JsonPropertyName("data")]
        public List<Player>? Data { get; set; }

        [JsonPropertyName("message")]
        public string? Message { get; set; }
    }

    public class CreateRequest
    {
        [JsonPropertyName("data")]
        public List<Player>? Data { get; set; }
    }

    // DTO for updates with nullable fields to support partial updates
    public class PlayerUpdateDto
    {
        [JsonPropertyName("id")]
        [JsonConverter(typeof(IntOrStringIdConverter))]
        public int Id { get; set; }

        [JsonPropertyName("name")]
        public string? Name { get; set; }

        [JsonPropertyName("city")]
        public string? City { get; set; }

        [JsonPropertyName("team")]
        public string? Team { get; set; }

        [JsonPropertyName("score")]
        public double? Score { get; set; }

        [JsonPropertyName("percentageWins")]
        public double? PercentageWins { get; set; }
    }

    public class UpdateRequest
    {
        [JsonPropertyName("data")]
        public List<PlayerUpdateDto>? Data { get; set; }
    }

    public class DeleteRequest
    {
        [JsonPropertyName("ids")]
        public List<int>? Ids { get; set; }
    }

    public class DeleteResponse
    {
        [JsonPropertyName("success")]
        public bool Success { get; set; }

        [JsonPropertyName("message")]
        public string? Message { get; set; }
    }
}
```

## Create the database context

Create a folder called `Data` in the project directory. In this folder, create a `GridContext.cs` file
containing the following lines of code:

```plaintext
using Microsoft.EntityFrameworkCore;
using GridApi.Models;

namespace GridApi.Data
{
    public class GridContext : DbContext
    {
        public GridContext(DbContextOptions<GridContext> options) : base(options) { }

        public DbSet<Player> Players { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Player>(entity =>
            {
                entity.ToTable("players");
                entity.HasKey(p => p.Id);
            });
        }
    }
}
```

## Configure the .NET backend to use SQLite and seed the local SQLite database with example data

First copy the `example-data` folder from the completed [.NET Bryntum Grid backend](https://github.com/ritza-co/bryntum-backend-guides/tree/main/backend/dotnet/sqlite-grid)
and add it to the root folder of your .NET backend.

Now let's update the `Program.cs` file to configure the .NET backend to use SQLite, and create a seeding function that
populates a local SQLite database with the example JSON data from the `example-data` directory.

Replace the contents of `Program.cs` with the following:

```plaintext
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using GridApi.Data;
using GridApi.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
        options.JsonSerializerOptions.NumberHandling = JsonNumberHandling.AllowReadingFromString;
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    });
builder.Services.AddEndpointsApiExplorer();

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<GridContext>(options =>
    options.UseSqlite(connectionString)
);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

if (args.Contains("--seed"))
{
    await SeedDatabase(app);
    return;
}

app.UseCors("AllowFrontend");

using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<GridContext>();
    context.Database.EnsureCreated();
}

app.UseAuthorization();
app.MapControllers();

app.Run();

// Seeding function
static async Task SeedDatabase(WebApplication app)
{
    using var scope = app.Services.CreateScope();
    var context = scope.ServiceProvider.GetRequiredService<GridContext>();

    // Drop existing tables and recreate
    await context.Database.EnsureDeletedAsync();
    await context.Database.EnsureCreatedAsync();
    Console.WriteLine("Database recreated.");

    // Read JSON data from example files
    var basePath = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "example-data"));

    var playersJsonPath = Path.Combine(basePath, "players.json");

    Console.WriteLine($"Reading players from: {playersJsonPath}");

    var playersJson = await File.ReadAllTextAsync(playersJsonPath);

    var options = new JsonSerializerOptions
    {
        PropertyNameCaseInsensitive = true
    };

    var players = JsonSerializer.Deserialize<List<Player>>(playersJson, options);

    if (players != null && players.Count > 0)
    {
        await context.Players.AddRangeAsync(players);
        await context.SaveChangesAsync();
        Console.WriteLine($"Added {players.Count} players.");
    }

    Console.WriteLine("Database seeded successfully!");
}
```

This `Program.cs` file configures the Entity Framework Core to use SQLite with the connection string
from `appsettings.json`. It also maps controllers for the API endpoints and adds CORS configuration
to allow requests from the frontend running on `http://localhost:5173`.

Run the seeding command to create and populate the database:

```shell
dotnet run -- --seed
```

You should see the following output in your terminal:

```plaintext
Database seeded successfully!
```

You will also see a `grid.sqlite3` file created in your project folder.

## Create API endpoints

Create a folder called `Controllers` in the project directory. Create a file called `GridController.cs`
in this folder and add the following code:

```plaintext
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GridApi.Data;
using GridApi.Models;

namespace GridApi.Controllers
{
    [ApiController]
    [Route("api")]
    public class GridController : ControllerBase
    {
        private readonly GridContext _context;
        private readonly ILogger<GridController> _logger;

        public GridController(GridContext context, ILogger<GridController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet("read")]
        public async Task<ActionResult<ReadResponse>> Read()
        {
            try
            {
                var players = await _context.Players.ToListAsync();

                _logger.LogInformation("Read {PlayerCount} players", players.Count);

                return Ok(new ReadResponse
                {
                    Success = true,
                    Data = players
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error reading players");
                return StatusCode(500, new ReadResponse
                {
                    Success = false,
                    Message = "Players data could not be read."
                });
            }
        }

        [HttpPost("create")]
        public async Task<ActionResult<ReadResponse>> Create([FromBody] CreateRequest request)
        {
            try
            {
                if (request.Data == null || request.Data.Count == 0)
                {
                    return BadRequest(new ReadResponse
                    {
                        Success = false,
                        Message = "No players data provided"
                    });
                }

                var createdPlayers = new List<Player>();

                foreach (var player in request.Data)
                {
                    // Reset Id to 0 for new players (will be auto-generated)
                    player.Id = 0;

                    _context.Players.Add(player);
                    await _context.SaveChangesAsync();

                    createdPlayers.Add(player);
                }

                _logger.LogInformation("Created {PlayerCount} players", createdPlayers.Count);

                return Ok(new ReadResponse
                {
                    Success = true,
                    Data = createdPlayers
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating players");
                return StatusCode(500, new ReadResponse
                {
                    Success = false,
                    Message = "Players could not be created"
                });
            }
        }

        [HttpPatch("update")]
        public async Task<ActionResult<ReadResponse>> Update([FromBody] UpdateRequest request)
        {
            try
            {
                if (request.Data == null || request.Data.Count == 0)
                {
                    return BadRequest(new ReadResponse
                    {
                        Success = false,
                        Message = "No players data provided"
                    });
                }

                var updatedPlayers = new List<Player>();

                foreach (var playerUpdate in request.Data)
                {
                    if (playerUpdate.Id <= 0)
                    {
                        continue;
                    }

                    var existingPlayer = await _context.Players.FindAsync(playerUpdate.Id);
                    if (existingPlayer == null)
                    {
                        return StatusCode(500, new ReadResponse
                        {
                            Success = false,
                            Message = $"Player with id {playerUpdate.Id} not found"
                        });
                    }

                    // Only update fields that were provided in the request
                    if (playerUpdate.Name != null) existingPlayer.Name = playerUpdate.Name;
                    if (playerUpdate.City != null) existingPlayer.City = playerUpdate.City;
                    if (playerUpdate.Team != null) existingPlayer.Team = playerUpdate.Team;
                    if (playerUpdate.Score.HasValue) existingPlayer.Score = playerUpdate.Score.Value;
                    if (playerUpdate.PercentageWins.HasValue) existingPlayer.PercentageWins = playerUpdate.PercentageWins.Value;

                    await _context.SaveChangesAsync();
                    updatedPlayers.Add(existingPlayer);
                }

                _logger.LogInformation("Updated {PlayerCount} players", updatedPlayers.Count);

                return Ok(new ReadResponse
                {
                    Success = true,
                    Data = updatedPlayers
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating players");
                return StatusCode(500, new ReadResponse
                {
                    Success = false,
                    Message = "Players could not be updated"
                });
            }
        }

        [HttpDelete("delete")]
        public async Task<ActionResult<DeleteResponse>> Delete([FromBody] DeleteRequest request)
        {
            try
            {
                if (request.Ids == null || request.Ids.Count == 0)
                {
                    return BadRequest(new DeleteResponse
                    {
                        Success = false,
                        Message = "No player ids provided"
                    });
                }

                var playersToDelete = await _context.Players
                    .Where(p => request.Ids.Contains(p.Id))
                    .ToListAsync();

                _context.Players.RemoveRange(playersToDelete);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Deleted {PlayerCount} players", playersToDelete.Count);

                return Ok(new DeleteResponse
                {
                    Success = true
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting players");
                return StatusCode(500, new DeleteResponse
                {
                    Success = false,
                    Message = "Could not delete selected player record(s)"
                });
            }
        }
    }
}
```

This controller provides four endpoints for CRUD operations:

- `GET /api/read` fetches all players.
- `POST /api/create` creates new players.
- `PATCH /api/update` updates existing players.
- `DELETE /api/delete` removes players.

Run the development server:

```shell
dotnet run
```

Open `http://localhost:1337/api/read` in your browser to verify the data loads correctly.

## Set up the frontend

In a new terminal, create a Vite project:

```sh
npm create vite@latest grid-frontend -- --template vanilla
cd grid-frontend
npm install
```

Delete the following default files that we don't need:

- `src/counter.js`
- `src/javascript.svg`

### Install the Bryntum Grid component

First, access the private Bryntum npm registry by following the [guide in our docs](#Grid/guides/quick-start/javascript-npm.md#access-to-npm-registry).

Once you've logged in to the registry, install the Bryntum Grid component:

<div class="docs-tabs" data-name="licensed">
<div>
    <a>Trial version</a>
    <a>Licensed version</a>
</div>
<div>

```shell
npm install @bryntum/grid@npm:@bryntum/grid-trial
```

</div>
<div>

```shell
npm install @bryntum/grid
```

</div>
</div>

<div class="note">

Ensure that you have configured your npm properly to get access to the Bryntum packages. If not,
refer to <a href="#Grid/guides/npm-repository.md">this guide</a>.

</div>

### Create and configure the Bryntum Grid

Update the `main.js` file to import, create, and configure the Bryntum Grid:

```javascript
import { Grid } from '@bryntum/grid';
import './style.css';
import { AjaxStore } from '@bryntum/grid';

const store = new AjaxStore({
    createUrl         : 'http://localhost:1337/api/create',
    readUrl           : 'http://localhost:1337/api/read',
    updateUrl         : 'http://localhost:1337/api/update',
    deleteUrl         : 'http://localhost:1337/api/delete',
    autoLoad          : true,
    autoCommit        : true,
    useRestfulMethods : true,
    httpMethods       : {
        read   : 'GET',
        create : 'POST',
        update : 'PATCH',
        delete : 'DELETE'
    }
});

const grid = new Grid({
    appendTo : 'app',
    store,
    columns  : [
        { type : 'rownumber' },
        {
            text  : 'Name',
            field : 'name',
            width : 280
        },
        {
            text  : 'City',
            field : 'city',
            width : 220
        },
        {
            text  : 'Team',
            field : 'team',
            width : 270
        },
        {
            type  : 'number',
            text  : 'Score',
            field : 'score',
            width : 100
        },
        {
            type  : 'percent',
            text  : 'Percent wins',
            field : 'percentageWins',
            width : 200
        }
    ]
});
```

This configures an [AjaxStore](#Core/data/AjaxStore) that connects to our .NET API endpoints. The `autoLoad` and
`autoCommit` options enable automatic data loading and saving.

### Add styles

Update the `style.css` file in the `src` directory:

```css
@import "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap";
@import "@bryntum/grid/fontawesome/css/fontawesome.css";
@import "@bryntum/grid/fontawesome/css/solid.css";
@import "@bryntum/grid/grid.css";
@import "@bryntum/grid/svalbard-light.css";

* {
    margin: 0;
}

body,
html {
    font-family: Poppins, "Open Sans", Helvetica, Arial, sans-serif;
}

#app {
    display: flex;
    flex-direction: column;
    height: 100vh;
    font-size: 14px;
}
```

## Run the application

First make sure the backend is running:

```shell
dotnet run
```

Then, in a separate terminal, start the frontend:

```shell
npm run dev
```

Open `http://localhost:5173/` in your browser. You'll see a Bryntum Grid with
the example data from the local SQLite database.

<video controls width="100%">
<source src="data/Grid/images/integration/backends/dotnet/bryntum-grid-crud.webm" type="video/mp4">
Sorry, your browser doesn't support embedded videos.
</video>

## Adapting for React, Angular, or Vue

This tutorial demonstrates a vanilla JavaScript implementation. If you're using a framework, the backend code remains
the same, but you'll need to adapt the frontend. Refer to the [integration guides](#integration) for detailed
instructions.

## Next steps

This tutorial covers the basics of using Bryntum Grid with .NET and SQLite. Take a look at the
[Bryntum Grid examples page](https://bryntum.com/products/grid/examples/) to browse the additional features
you can add to your Grid.

<p class="last-modified">Last modified on 2026-07-22 10:46:47</p>