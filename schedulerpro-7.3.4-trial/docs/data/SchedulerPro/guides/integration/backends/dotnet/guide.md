# How to use Bryntum SchedulerPro with .NET and SQLite

[Bryntum Scheduler Pro](https://bryntum.com/products/schedulerpro/) is an advanced, performant JavaScript scheduling component with constraint-based scheduling.
It integrates with the major JavaScript web frameworks. This tutorial demonstrates how to use
Bryntum Scheduler Pro with a [.NET Framework](https://dotnet.microsoft.com/en-us/) backend and SQLite.

You'll learn to do the following:

- Set up a .NET Web API that uses a local SQLite database and [Entity Framework Core](https://learn.microsoft.com/en-us/ef/core/).
- Configure Entity Framework Core models to define the database table structure.
- Run a seed command to populate the database with example JSON data.
- Create API endpoints to load data and sync data changes to the database.
- Set up a vanilla JavaScript Bryntum SchedulerPro frontend using Vite.
- Configure the Bryntum SchedulerPro to load data from the database and synchronize changes to the database
  using the created API endpoints.

Here's what we'll build:

![Bryntum SchedulerPro](data/SchedulerPro/images/integration/backends/dotnet/bryntum-schedulerpro-complete.png)

You can find the code for the completed guide in our GitHub repositories:

- [.NET Bryntum SchedulerPro backend](https://github.com/ritza-co/bryntum-backend-guides/tree/main/backend/dotnet/sqlite-schedulerpro)
- [SchedulerPro Vite frontend](https://github.com/ritza-co/bryntum-backend-guides/tree/main/frontend/vanilla-js/schedulerpro)

## Prerequisites

To follow along, you need the [.NET SDK](https://dotnet.microsoft.com/en-us/download) (version 10.0 or later) and
[Node.js](https://nodejs.org/en/download) installed on your system.

## Set up the backend

Create a new .NET Web API project:

```sh
dotnet new webapi -n dotnet-sqlite-schedulerpro
cd dotnet-sqlite-schedulerpro
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
    "DefaultConnection": "Data Source=schedulerpro.sqlite3"
  }
}
```

## Create the data models

We'll define database models for the events and resources example data using [Entity Framework Core](https://learn.microsoft.com/en-us/ef/core/).
In Bryntum Scheduler Pro, data stores are kept and linked together in the [project](#SchedulerPro/model/ProjectModel).
Bryntum Scheduler Pro uses the following data stores:

- [ResourceStore](#Scheduler/data/ResourceStore)
- [EventStore](#Scheduler/data/EventStore)
- [AssignmentStore](#Scheduler/data/AssignmentStore)
- [TimeRangeStore](#Scheduler/data/TimeRangeStore)
- [ResourceTimeRangeStore](#Scheduler/data/ResourceTimeRangeStore)
- [DependencyStore](#SchedulerPro/data/DependencyStore)

This basic tutorial covers making models for the EventStore and the ResourceStore.

### Create the Event model

Create a `Models` folder in the project directory. Add the following files:

Create `Models/Event.cs`:

```plaintext
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace SchedulerProApi.Models
{
    [Table("events")]
    public class Event
    {
        [Key]
        [Column("id")]
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("$PhantomId")]
        [NotMapped]
        public string? PhantomId { get; set; }

        [Column("name")]
        [JsonPropertyName("name")]
        public string? Name { get; set; }

        [Column("startDate")]
        [JsonPropertyName("startDate")]
        public DateTime? StartDate { get; set; }

        [Column("endDate")]
        [JsonPropertyName("endDate")]
        public DateTime? EndDate { get; set; }

        [Column("allDay")]
        [JsonPropertyName("allDay")]
        public bool? AllDay { get; set; } = false;

        [Column("duration")]
        [JsonPropertyName("duration")]
        public double? Duration { get; set; }

        [Column("durationUnit")]
        [JsonPropertyName("durationUnit")]
        public string? DurationUnit { get; set; } = "day";

        [Column("readOnly")]
        [JsonPropertyName("readOnly")]
        public bool? ReadOnly { get; set; } = false;

        [Column("draggable")]
        [JsonPropertyName("draggable")]
        public bool? Draggable { get; set; } = true;

        [Column("resizable")]
        [JsonPropertyName("resizable")]
        public string? Resizable { get; set; } = "true";

        [Column("timeZone")]
        [JsonPropertyName("timeZone")]
        public string? TimeZone { get; set; }

        [Column("recurrenceRule")]
        [JsonPropertyName("recurrenceRule")]
        public string? RecurrenceRule { get; set; }

        [Column("exceptionDates")]
        [JsonPropertyName("exceptionDates")]
        [JsonConverter(typeof(JsonStringToArrayConverter))]
        public string? ExceptionDates { get; set; }

        [Column("children")]
        [JsonPropertyName("children")]
        public string? Children { get; set; }

        [Column("cls")]
        [JsonPropertyName("cls")]
        public string? Cls { get; set; }

        [Column("eventColor")]
        [JsonPropertyName("eventColor")]
        public string? EventColor { get; set; }

        [Column("eventStyle")]
        [JsonPropertyName("eventStyle")]
        public string? EventStyle { get; set; }

        [Column("iconCls")]
        [JsonPropertyName("iconCls")]
        public string? IconCls { get; set; }

        [Column("style")]
        [JsonPropertyName("style")]
        public string? Style { get; set; }
    }
}
```

The `Event` model represents scheduled events with properties like name, dates, and styling options.
The `[JsonPropertyName]` attributes ensure properties are serialized using the JSON property names that Bryntum
Scheduler Pro expects.

### Create the Resource model

Create `Models/Resource.cs`:

```plaintext
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace SchedulerProApi.Models
{
    [Table("resources")]
    public class Resource
    {
        [Key]
        [Column("id")]
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("$PhantomId")]
        [NotMapped]
        public string? PhantomId { get; set; }

        [Column("name")]
        [JsonPropertyName("name")]
        public string? Name { get; set; }

        [Column("eventColor")]
        [JsonPropertyName("eventColor")]
        public string? EventColor { get; set; }

        [Column("readOnly")]
        [JsonPropertyName("readOnly")]
        public bool? ReadOnly { get; set; } = false;
    }
}
```

Resources represent people, equipment, or rooms that events can be assigned to.

### Create the Assignment model

Create `Models/Assignment.cs`:

```plaintext
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace SchedulerProApi.Models
{
    [Table("assignments")]
    public class Assignment
    {
        [Key]
        [Column("id")]
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("$PhantomId")]
        [NotMapped]
        public string? PhantomId { get; set; }

        [Column("eventId")]
        [JsonPropertyName("eventId")]
        public int EventId { get; set; }

        [Column("resourceId")]
        [JsonPropertyName("resourceId")]
        public int ResourceId { get; set; }
    }
}
```

Assignments link events to resources, allowing multi-assignment, so that one event can be assigned to multiple resources.

### Create the Dependency model

Create `Models/Dependency.cs`:

```plaintext
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace SchedulerProApi.Models
{
    [Table("dependencies")]
    public class Dependency
    {
        [Key]
        [Column("id")]
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("$PhantomId")]
        [NotMapped]
        public string? PhantomId { get; set; }

        [Column("from")]
        [JsonPropertyName("from")]
        public int? From { get; set; }

        [Column("to")]
        [JsonPropertyName("to")]
        public int? To { get; set; }

        [Column("fromSide")]
        [JsonPropertyName("fromSide")]
        public string? FromSide { get; set; } = "right";

        [Column("toSide")]
        [JsonPropertyName("toSide")]
        public string? ToSide { get; set; } = "left";

        [Column("cls")]
        [JsonPropertyName("cls")]
        public string? Cls { get; set; }

        [Column("lag")]
        [JsonPropertyName("lag")]
        public double? Lag { get; set; } = 0;

        [Column("lagUnit")]
        [JsonPropertyName("lagUnit")]
        public string? LagUnit { get; set; } = "day";
    }
}
```

Dependencies define relationships between events, where one event must finish before another can start.

### Create the JsonStringToArrayConverter model

Create `Models/JsonStringToArrayConverter.cs` to handle the `exceptionDates` field conversion:

```plaintext
using System.Text.Json;
using System.Text.Json.Serialization;

namespace SchedulerProApi.Models
{
    public class JsonStringToArrayConverter : JsonConverter<string?>
    {
        public override string? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            if (reader.TokenType == JsonTokenType.StartArray)
            {
                using var doc = JsonDocument.ParseValue(ref reader);
                return doc.RootElement.GetRawText();
            }

            return reader.GetString();
        }

        public override void Write(Utf8JsonWriter writer, string? value, JsonSerializerOptions options)
        {
            if (value == null)
            {
                writer.WriteNullValue();
                return;
            }

            try
            {
                using var doc = JsonDocument.Parse(value);
                doc.RootElement.WriteTo(writer);
            }
            catch
            {
                writer.WriteNullValue();
            }
        }
    }
}
```

This converter transforms JSON arrays to strings for database storage and back to arrays for API responses.

### Create the SyncModels model

Create `Models/SyncModels.cs` for the request and response data transfer objects:

```plaintext
using System.Text.Json;
using System.Text.Json.Serialization;

namespace SchedulerProApi.Models
{
    public class SyncRequest
    {
        [JsonPropertyName("requestId")]
        public long? RequestId { get; set; }

        [JsonPropertyName("events")]
        public StoreChanges<Event>? Events { get; set; }

        [JsonPropertyName("resources")]
        public StoreChanges<Resource>? Resources { get; set; }

        [JsonPropertyName("assignments")]
        public AssignmentStoreChanges? Assignments { get; set; }

        [JsonPropertyName("dependencies")]
        public StoreChanges<Dependency>? Dependencies { get; set; }
    }

    public class StoreChanges<T>
    {
        [JsonPropertyName("added")]
        public List<T>? Added { get; set; }

        [JsonPropertyName("updated")]
        public List<T>? Updated { get; set; }

        [JsonPropertyName("removed")]
        public List<T>? Removed { get; set; }
    }

    public class AssignmentStoreChanges
    {
        [JsonPropertyName("added")]
        public List<AssignmentSyncDto>? Added { get; set; }

        [JsonPropertyName("updated")]
        public List<AssignmentSyncDto>? Updated { get; set; }

        [JsonPropertyName("removed")]
        public List<AssignmentSyncDto>? Removed { get; set; }
    }

    public class AssignmentSyncDto
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("$PhantomId")]
        public string? PhantomId { get; set; }

        [JsonPropertyName("eventId")]
        public JsonElement? EventIdRaw { get; set; }

        [JsonPropertyName("resourceId")]
        public int ResourceId { get; set; }

        public Assignment ToAssignment(Dictionary<string, int>? eventPhantomIdMap)
        {
            var assignment = new Assignment
            {
                Id = Id,
                PhantomId = PhantomId,
                ResourceId = ResourceId
            };

            if (EventIdRaw.HasValue)
            {
                if (EventIdRaw.Value.ValueKind == JsonValueKind.Number)
                {
                    assignment.EventId = EventIdRaw.Value.GetInt32();
                }
                else if (EventIdRaw.Value.ValueKind == JsonValueKind.String)
                {
                    var phantomId = EventIdRaw.Value.GetString();
                    if (eventPhantomIdMap != null && phantomId != null && eventPhantomIdMap.TryGetValue(phantomId, out int realId))
                    {
                        assignment.EventId = realId;
                    }
                }
            }

            return assignment;
        }
    }

    public class LoadResponse
    {
        [JsonPropertyName("events")]
        public StoreData<Event>? Events { get; set; }

        [JsonPropertyName("resources")]
        public StoreData<Resource>? Resources { get; set; }

        [JsonPropertyName("assignments")]
        public StoreData<Assignment>? Assignments { get; set; }

        [JsonPropertyName("dependencies")]
        public StoreData<Dependency>? Dependencies { get; set; }
    }

    public class StoreData<T>
    {
        [JsonPropertyName("rows")]
        public List<T> Rows { get; set; } = new List<T>();
    }

    public class SyncResponse
    {
        [JsonPropertyName("requestId")]
        public long? RequestId { get; set; }

        [JsonPropertyName("success")]
        public bool Success { get; set; }

        [JsonPropertyName("message")]
        public string? Message { get; set; }

        [JsonPropertyName("events")]
        public SyncStoreResponse? Events { get; set; }

        [JsonPropertyName("resources")]
        public SyncStoreResponse? Resources { get; set; }

        [JsonPropertyName("assignments")]
        public SyncStoreResponse? Assignments { get; set; }

        [JsonPropertyName("dependencies")]
        public SyncStoreResponse? Dependencies { get; set; }
    }

    public class SyncStoreResponse
    {
        [JsonPropertyName("rows")]
        public List<IdMapping>? Rows { get; set; }
    }

    public class IdMapping
    {
        [JsonPropertyName("$PhantomId")]
        public string? PhantomId { get; set; }

        [JsonPropertyName("id")]
        public object? Id { get; set; }
    }
}
```

The `AssignmentSyncDto` class handles assignments where `eventId` may be a phantom ID (string) referencing a newly
created event. The `ToAssignment` method resolves phantom IDs to real database IDs.

## Create the database context

Create a folder called `Data` in the project directory. In this folder, create a `SchedulerProContext.cs` file
containing the following lines of code:

```plaintext
using Microsoft.EntityFrameworkCore;
using SchedulerProApi.Models;

namespace SchedulerProApi.Data
{
    public class SchedulerProContext : DbContext
    {
        public SchedulerProContext(DbContextOptions<SchedulerProContext> options) : base(options) { }

        public DbSet<Event> Events { get; set; } = null!;
        public DbSet<Resource> Resources { get; set; } = null!;
        public DbSet<Assignment> Assignments { get; set; } = null!;
        public DbSet<Dependency> Dependencies { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Event>(entity =>
            {
                entity.ToTable("events");
                entity.HasKey(e => e.Id);
            });

            modelBuilder.Entity<Resource>(entity =>
            {
                entity.ToTable("resources");
                entity.HasKey(r => r.Id);
            });

            modelBuilder.Entity<Assignment>(entity =>
            {
                entity.ToTable("assignments");
                entity.HasKey(a => a.Id);
                entity.HasIndex(a => a.EventId);
                entity.HasIndex(a => a.ResourceId);

                entity.HasOne<Event>()
                    .WithMany()
                    .HasForeignKey(a => a.EventId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne<Resource>()
                    .WithMany()
                    .HasForeignKey(a => a.ResourceId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Dependency>(entity =>
            {
                entity.ToTable("dependencies");
                entity.HasKey(d => d.Id);
                entity.HasIndex(d => d.From);
                entity.HasIndex(d => d.To);

                entity.HasOne<Event>()
                    .WithMany()
                    .HasForeignKey(d => d.From)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne<Event>()
                    .WithMany()
                    .HasForeignKey(d => d.To)
                    .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}
```

The `SchedulerProContext` class inherits methods and properties from `DbContext` and defines `DbSet` properties for each
model. The `OnModelCreating` method configures the table names, primary keys, and cascade delete behavior so that
deleting an event automatically removes its assignments and dependencies.

## Configure the .NET backend to use SQLite and seed the local SQLite database with example data

First copy the `example-data` folder from the completed [.NET Bryntum SchedulerPro backend](https://github.com/ritza-co/bryntum-backend-guides/tree/main/backend/dotnet/sqlite-schedulerpro)
and add it to the root folder of your .NET backend.

Now let's update the `Program.cs` file to configure the .NET backend to use SQLite, and create a seeding function that
populates a local SQLite database with the example JSON data from the `example-data` directory.

Replace the contents of `Program.cs` with the following:

```plaintext
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using SchedulerProApi.Data;
using SchedulerProApi.Models;

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
builder.Services.AddDbContext<SchedulerProContext>(options =>
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
    var context = scope.ServiceProvider.GetRequiredService<SchedulerProContext>();
    context.Database.EnsureCreated();
}

app.UseAuthorization();
app.MapControllers();

app.Run();

static async Task SeedDatabase(WebApplication app)
{
    using var scope = app.Services.CreateScope();
    var context = scope.ServiceProvider.GetRequiredService<SchedulerProContext>();

    await context.Database.EnsureDeletedAsync();
    await context.Database.EnsureCreatedAsync();
    Console.WriteLine("Database recreated.");

    var basePath = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "example-data"));

    var eventsJsonPath = Path.Combine(basePath, "events.json");
    var resourcesJsonPath = Path.Combine(basePath, "resources.json");
    var assignmentsJsonPath = Path.Combine(basePath, "assignments.json");
    var dependenciesJsonPath = Path.Combine(basePath, "dependencies.json");

    Console.WriteLine($"Reading events from: {eventsJsonPath}");
    Console.WriteLine($"Reading resources from: {resourcesJsonPath}");
    Console.WriteLine($"Reading assignments from: {assignmentsJsonPath}");
    Console.WriteLine($"Reading dependencies from: {dependenciesJsonPath}");

    var eventsJson = await File.ReadAllTextAsync(eventsJsonPath);
    var resourcesJson = await File.ReadAllTextAsync(resourcesJsonPath);
    var assignmentsJson = await File.ReadAllTextAsync(assignmentsJsonPath);
    var dependenciesJson = await File.ReadAllTextAsync(dependenciesJsonPath);

    var options = new JsonSerializerOptions
    {
        PropertyNameCaseInsensitive = true
    };

    var events = JsonSerializer.Deserialize<List<Event>>(eventsJson, options);
    var resources = JsonSerializer.Deserialize<List<Resource>>(resourcesJson, options);
    var assignments = JsonSerializer.Deserialize<List<Assignment>>(assignmentsJson, options);
    var dependencies = JsonSerializer.Deserialize<List<Dependency>>(dependenciesJson, options);

    if (resources != null && resources.Count > 0)
    {
        await context.Resources.AddRangeAsync(resources);
        await context.SaveChangesAsync();
        Console.WriteLine($"Added {resources.Count} resources.");
    }

    if (events != null && events.Count > 0)
    {
        await context.Events.AddRangeAsync(events);
        await context.SaveChangesAsync();
        Console.WriteLine($"Added {events.Count} events.");
    }

    if (assignments != null && assignments.Count > 0)
    {
        await context.Assignments.AddRangeAsync(assignments);
        await context.SaveChangesAsync();
        Console.WriteLine($"Added {assignments.Count} assignments.");
    }

    if (dependencies != null && dependencies.Count > 0)
    {
        await context.Dependencies.AddRangeAsync(dependencies);
        await context.SaveChangesAsync();
        Console.WriteLine($"Added {dependencies.Count} dependencies.");
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

You will also see a `schedulerpro.sqlite3` file created in your project folder.

## Create API endpoints

Create a folder called `Controllers` in the project directory. Create a file called `SchedulerProController.cs`
in this folder and add the following code:

```plaintext
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SchedulerProApi.Data;
using SchedulerProApi.Models;

namespace SchedulerProApi.Controllers
{
    [ApiController]
    [Route("api")]
    public class SchedulerProController : ControllerBase
    {
        private readonly SchedulerProContext _context;
        private readonly ILogger<SchedulerProController> _logger;

        public SchedulerProController(SchedulerProContext context, ILogger<SchedulerProController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet("load")]
        public async Task<ActionResult<LoadResponse>> Load()
        {
            try
            {
                var eventsTask = _context.Events.ToListAsync();
                var resourcesTask = _context.Resources.ToListAsync();
                var assignmentsTask = _context.Assignments.ToListAsync();
                var dependenciesTask = _context.Dependencies.ToListAsync();

                await Task.WhenAll(eventsTask, resourcesTask, assignmentsTask, dependenciesTask);

                var response = new LoadResponse
                {
                    Events = new StoreData<Event> { Rows = eventsTask.Result },
                    Resources = new StoreData<Resource> { Rows = resourcesTask.Result },
                    Assignments = new StoreData<Assignment> { Rows = assignmentsTask.Result },
                    Dependencies = new StoreData<Dependency> { Rows = dependenciesTask.Result }
                };

                _logger.LogInformation("Loaded {EventCount} events, {ResourceCount} resources, {AssignmentCount} assignments, {DependencyCount} dependencies",
                    eventsTask.Result.Count, resourcesTask.Result.Count, assignmentsTask.Result.Count, dependenciesTask.Result.Count);

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error loading data");
                return StatusCode(500, new { success = false, message = "There was an error loading the assignments, dependencies, events, and resources data." });
            }
        }

        [HttpPost("sync")]
        public async Task<ActionResult<SyncResponse>> Sync([FromBody] SyncRequest request)
        {
            _logger.LogInformation("Sync request received. RequestId: {RequestId}", request.RequestId);

            try
            {
                var response = new SyncResponse
                {
                    RequestId = request.RequestId,
                    Success = true
                };

                var eventPhantomIdMap = new Dictionary<string, int>();

                if (request.Resources != null)
                {
                    var rows = await ApplyResourceChanges(request.Resources);
                    if (rows != null && rows.Count > 0)
                    {
                        response.Resources = new SyncStoreResponse { Rows = rows };
                    }
                }

                if (request.Events != null)
                {
                    var rows = await ApplyEventChanges(request.Events, eventPhantomIdMap);
                    if (rows != null && rows.Count > 0)
                    {
                        response.Events = new SyncStoreResponse { Rows = rows };
                    }
                }

                if (request.Assignments != null)
                {
                    var rows = await ApplyAssignmentChanges(request.Assignments, eventPhantomIdMap);
                    if (rows != null && rows.Count > 0)
                    {
                        response.Assignments = new SyncStoreResponse { Rows = rows };
                    }
                }

                if (request.Dependencies != null)
                {
                    var rows = await ApplyDependencyChanges(request.Dependencies, eventPhantomIdMap);
                    if (rows != null && rows.Count > 0)
                    {
                        response.Dependencies = new SyncStoreResponse { Rows = rows };
                    }
                }

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error syncing data");
                return StatusCode(500, new SyncResponse
                {
                    RequestId = request.RequestId,
                    Success = false,
                    Message = "There was an error syncing the data changes."
                });
            }
        }

        private async Task<List<IdMapping>?> ApplyEventChanges(StoreChanges<Event> changes, Dictionary<string, int> phantomIdMap)
        {
            List<IdMapping>? rows = null;

            if (changes.Added != null && changes.Added.Count > 0)
            {
                rows = new List<IdMapping>();
                foreach (var newEvent in changes.Added)
                {
                    var phantomId = newEvent.PhantomId;
                    newEvent.Id = 0;
                    if (newEvent.Name == null) newEvent.Name = "";

                    _context.Events.Add(newEvent);
                    await _context.SaveChangesAsync();

                    if (!string.IsNullOrEmpty(phantomId))
                    {
                        phantomIdMap[phantomId] = newEvent.Id;
                    }

                    rows.Add(new IdMapping
                    {
                        PhantomId = phantomId,
                        Id = newEvent.Id
                    });
                }
            }

            if (changes.Updated != null && changes.Updated.Count > 0)
            {
                foreach (var eventUpdate in changes.Updated)
                {
                    if (eventUpdate.Id > 0)
                    {
                        var existingEvent = await _context.Events.FindAsync(eventUpdate.Id);
                        if (existingEvent != null)
                        {
                            if (eventUpdate.Name != null) existingEvent.Name = eventUpdate.Name;
                            if (eventUpdate.StartDate.HasValue) existingEvent.StartDate = eventUpdate.StartDate;
                            if (eventUpdate.EndDate.HasValue) existingEvent.EndDate = eventUpdate.EndDate;
                            if (eventUpdate.AllDay.HasValue) existingEvent.AllDay = eventUpdate.AllDay;
                            if (eventUpdate.Duration.HasValue) existingEvent.Duration = eventUpdate.Duration;
                            if (eventUpdate.DurationUnit != null) existingEvent.DurationUnit = eventUpdate.DurationUnit;
                            if (eventUpdate.ReadOnly.HasValue) existingEvent.ReadOnly = eventUpdate.ReadOnly;
                            if (eventUpdate.Draggable.HasValue) existingEvent.Draggable = eventUpdate.Draggable;
                            if (eventUpdate.Resizable != null) existingEvent.Resizable = eventUpdate.Resizable;
                            if (eventUpdate.TimeZone != null) existingEvent.TimeZone = eventUpdate.TimeZone;
                            if (eventUpdate.RecurrenceRule != null) existingEvent.RecurrenceRule = eventUpdate.RecurrenceRule;
                            if (eventUpdate.ExceptionDates != null) existingEvent.ExceptionDates = eventUpdate.ExceptionDates;
                            if (eventUpdate.Children != null) existingEvent.Children = eventUpdate.Children;
                            if (eventUpdate.Cls != null) existingEvent.Cls = eventUpdate.Cls;
                            if (eventUpdate.EventColor != null) existingEvent.EventColor = eventUpdate.EventColor;
                            if (eventUpdate.EventStyle != null) existingEvent.EventStyle = eventUpdate.EventStyle;
                            if (eventUpdate.IconCls != null) existingEvent.IconCls = eventUpdate.IconCls;
                            if (eventUpdate.Style != null) existingEvent.Style = eventUpdate.Style;

                            await _context.SaveChangesAsync();
                        }
                    }
                }
            }

            if (changes.Removed != null && changes.Removed.Count > 0)
            {
                foreach (var eventToRemove in changes.Removed)
                {
                    if (eventToRemove.Id > 0)
                    {
                        var existingEvent = await _context.Events.FindAsync(eventToRemove.Id);
                        if (existingEvent != null)
                        {
                            _context.Events.Remove(existingEvent);
                            await _context.SaveChangesAsync();
                        }
                    }
                }
            }

            return rows;
        }

        private async Task<List<IdMapping>?> ApplyResourceChanges(StoreChanges<Resource> changes)
        {
            List<IdMapping>? rows = null;

            if (changes.Added != null && changes.Added.Count > 0)
            {
                rows = new List<IdMapping>();
                foreach (var newResource in changes.Added)
                {
                    var phantomId = newResource.PhantomId;
                    newResource.Id = 0;
                    if (newResource.Name == null) newResource.Name = "";

                    _context.Resources.Add(newResource);
                    await _context.SaveChangesAsync();

                    rows.Add(new IdMapping
                    {
                        PhantomId = phantomId,
                        Id = newResource.Id
                    });
                }
            }

            if (changes.Updated != null && changes.Updated.Count > 0)
            {
                foreach (var resourceUpdate in changes.Updated)
                {
                    if (resourceUpdate.Id > 0)
                    {
                        var existingResource = await _context.Resources.FindAsync(resourceUpdate.Id);
                        if (existingResource != null)
                        {
                            if (resourceUpdate.Name != null) existingResource.Name = resourceUpdate.Name;
                            if (resourceUpdate.EventColor != null) existingResource.EventColor = resourceUpdate.EventColor;
                            if (resourceUpdate.ReadOnly.HasValue) existingResource.ReadOnly = resourceUpdate.ReadOnly;

                            await _context.SaveChangesAsync();
                        }
                    }
                }
            }

            if (changes.Removed != null && changes.Removed.Count > 0)
            {
                foreach (var resourceToRemove in changes.Removed)
                {
                    if (resourceToRemove.Id > 0)
                    {
                        var existingResource = await _context.Resources.FindAsync(resourceToRemove.Id);
                        if (existingResource != null)
                        {
                            _context.Resources.Remove(existingResource);
                            await _context.SaveChangesAsync();
                        }
                    }
                }
            }

            return rows;
        }

        private async Task<List<IdMapping>?> ApplyAssignmentChanges(AssignmentStoreChanges changes, Dictionary<string, int> eventPhantomIdMap)
        {
            List<IdMapping>? rows = null;

            if (changes.Added != null && changes.Added.Count > 0)
            {
                rows = new List<IdMapping>();
                foreach (var dto in changes.Added)
                {
                    var phantomId = dto.PhantomId;
                    var newAssignment = dto.ToAssignment(eventPhantomIdMap);
                    newAssignment.Id = 0;

                    _context.Assignments.Add(newAssignment);
                    await _context.SaveChangesAsync();

                    rows.Add(new IdMapping
                    {
                        PhantomId = phantomId,
                        Id = newAssignment.Id
                    });
                }
            }

            if (changes.Updated != null && changes.Updated.Count > 0)
            {
                foreach (var dto in changes.Updated)
                {
                    var assignmentUpdate = dto.ToAssignment(eventPhantomIdMap);

                    if (assignmentUpdate.Id > 0)
                    {
                        var existingAssignment = await _context.Assignments.FindAsync(assignmentUpdate.Id);
                        if (existingAssignment != null)
                        {
                            if (assignmentUpdate.EventId > 0) existingAssignment.EventId = assignmentUpdate.EventId;
                            if (assignmentUpdate.ResourceId > 0) existingAssignment.ResourceId = assignmentUpdate.ResourceId;

                            await _context.SaveChangesAsync();
                        }
                    }
                }
            }

            if (changes.Removed != null && changes.Removed.Count > 0)
            {
                foreach (var dto in changes.Removed)
                {
                    if (dto.Id > 0)
                    {
                        var existingAssignment = await _context.Assignments.FindAsync(dto.Id);
                        if (existingAssignment != null)
                        {
                            _context.Assignments.Remove(existingAssignment);
                            await _context.SaveChangesAsync();
                        }
                    }
                }
            }

            return rows;
        }

        private async Task<List<IdMapping>?> ApplyDependencyChanges(StoreChanges<Dependency> changes, Dictionary<string, int> eventPhantomIdMap)
        {
            List<IdMapping>? rows = null;

            if (changes.Added != null && changes.Added.Count > 0)
            {
                rows = new List<IdMapping>();
                foreach (var newDependency in changes.Added)
                {
                    var phantomId = newDependency.PhantomId;
                    newDependency.Id = 0;

                    _context.Dependencies.Add(newDependency);
                    await _context.SaveChangesAsync();

                    rows.Add(new IdMapping
                    {
                        PhantomId = phantomId,
                        Id = newDependency.Id
                    });
                }
            }

            if (changes.Updated != null && changes.Updated.Count > 0)
            {
                foreach (var dependencyUpdate in changes.Updated)
                {
                    if (dependencyUpdate.Id > 0)
                    {
                        var existingDependency = await _context.Dependencies.FindAsync(dependencyUpdate.Id);
                        if (existingDependency != null)
                        {
                            if (dependencyUpdate.From.HasValue) existingDependency.From = dependencyUpdate.From;
                            if (dependencyUpdate.To.HasValue) existingDependency.To = dependencyUpdate.To;
                            if (dependencyUpdate.FromSide != null) existingDependency.FromSide = dependencyUpdate.FromSide;
                            if (dependencyUpdate.ToSide != null) existingDependency.ToSide = dependencyUpdate.ToSide;
                            if (dependencyUpdate.Cls != null) existingDependency.Cls = dependencyUpdate.Cls;
                            if (dependencyUpdate.Lag.HasValue) existingDependency.Lag = dependencyUpdate.Lag;
                            if (dependencyUpdate.LagUnit != null) existingDependency.LagUnit = dependencyUpdate.LagUnit;

                            await _context.SaveChangesAsync();
                        }
                    }
                }
            }

            if (changes.Removed != null && changes.Removed.Count > 0)
            {
                foreach (var dependencyToRemove in changes.Removed)
                {
                    if (dependencyToRemove.Id > 0)
                    {
                        var existingDependency = await _context.Dependencies.FindAsync(dependencyToRemove.Id);
                        if (existingDependency != null)
                        {
                            _context.Dependencies.Remove(existingDependency);
                            await _context.SaveChangesAsync();
                        }
                    }
                }
            }

            return rows;
        }
    }
}
```

The controller provides two endpoints:

- `GET /api/load` returns all events, resources, assignments, and dependencies from the database.
- `POST /api/sync` handles create, update, and delete operations for all data types.

The `/api/sync` endpoint processes changes in a specific order (resources, events, assignments, dependencies) and maintains a mapping of event phantom IDs to real IDs so that new assignments can reference newly created events.

Run the development server:

```shell
dotnet run
```

Open `http://localhost:1337/api/load` in your browser to verify the data loads correctly.

## Set up the frontend

In a new terminal, create a Vite project:

```sh
npm create vite@latest schedulerpro-frontend -- --template vanilla
cd schedulerpro-frontend
npm install
```

Delete the following default files that we don't need:

- `src/counter.js`
- `src/javascript.svg`

### Install the Bryntum SchedulerPro component

First, access the private Bryntum npm registry by following the [guide in our docs](#SchedulerPro/guides/quick-start/javascript-npm.md#access-to-npm-registry).

Once you've logged in to the registry, install the Bryntum SchedulerPro component:

<div class="docs-tabs" data-name="licensed">
<div>
    <a>Trial version</a>
    <a>Licensed version</a>
</div>
<div>

```shell
npm install @bryntum/schedulerpro@npm:@bryntum/schedulerpro-trial
```

</div>
<div>

```shell
npm install @bryntum/schedulerpro
```

</div>
</div>

<div class="note">

Ensure that you have configured your npm properly to get access to the Bryntum packages. If not,
refer to <a href="#SchedulerPro/guides/npm-repository.md">this guide</a>.

</div>

### Create and configure the Bryntum SchedulerPro

Update the `main.js` file to import, create, and configure the Bryntum SchedulerPro:

```javascript
import { SchedulerPro } from '@bryntum/schedulerpro';
import './style.css';

const schedulerpro = new SchedulerPro({
    appendTo   : 'app',
    startDate  : new Date(2026, 6, 20, 6),
    endDate    : new Date(2026, 6, 20, 20),
    viewPreset : 'hourAndDay',
    project    : {
        autoLoad  : true,
        autoSync  : true,
        transport : {
            load : {
                url : 'http://localhost:1337/api/load'
            },
            sync : {
                url : 'http://localhost:1337/api/sync'
            }
        }
    },
    columns : [{ text : 'Name', field : 'name', width : 130 }]
});
```

The [project](#SchedulerPro/model/ProjectModel) configuration connects the scheduler to the backend API. The `transport`
object specifies the URLs for loading and syncing data. Setting `autoLoad` and `autoSync` to `true` enables automatic
data loading and synchronization.

### Add styles

Update the `style.css` file in the `src` directory:

```css
@import "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap";
@import "@bryntum/schedulerpro/fontawesome/css/fontawesome.css";
@import "@bryntum/schedulerpro/fontawesome/css/solid.css";
@import "@bryntum/schedulerpro/schedulerpro.css";
@import "@bryntum/schedulerpro/svalbard-light.css";

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

Open `http://localhost:5173/` in your browser. You'll see a Bryntum SchedulerPro with
the example data from the local SQLite database.

<video controls width="100%">
<source src="data/SchedulerPro/images/integration/backends/dotnet/bryntum-schedulerpro-crud.webm" type="video/mp4">
Sorry, your browser doesn't support embedded videos.
</video>

## Adapting for React, Angular, or Vue

This tutorial demonstrates a vanilla JavaScript implementation. If you're using a framework, the backend code remains
the same, but you'll need to adapt the frontend. Refer to the [integration guides](#integration) for detailed
instructions.

## Next steps

This tutorial covers the basics of using Bryntum SchedulerPro with .NET and SQLite. Take a look at the
[Bryntum SchedulerPro examples page](https://bryntum.com/products/schedulerpro/examples/) to browse the additional features
you can add to your SchedulerPro.

<p class="last-modified">Last modified on 2026-07-22 10:55:57</p>