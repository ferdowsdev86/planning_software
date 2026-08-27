# How to use Bryntum Scheduler with .NET and SQLite

[Bryntum Scheduler](https://bryntum.com/products/scheduler/) is a performant, highly customizable JavaScript UI component for resource scheduling.
It integrates with the major JavaScript web frameworks. This tutorial demonstrates how to use
Bryntum Scheduler with a [.NET Framework](https://dotnet.microsoft.com/en-us/) backend and SQLite.

You'll learn to do the following:

- Set up a .NET Web API that uses a local SQLite database and [Entity Framework Core](https://learn.microsoft.com/en-us/ef/core/).
- Configure Entity Framework Core models to define the database table structure.
- Run a seed command to populate the database with example JSON data.
- Create API endpoints to load data and sync data changes to the database.
- Set up a vanilla JavaScript Bryntum Scheduler frontend using Vite.
- Configure the Bryntum Scheduler to load data from the database and synchronize changes to the database
  using the created API endpoints.

Here's what we'll build:

![Bryntum Scheduler](data/Scheduler/images/integration/backends/dotnet/bryntum-scheduler-complete.png)

You can find the code for the completed guide in our GitHub repositories:

- [.NET Bryntum Scheduler backend](https://github.com/ritza-co/bryntum-backend-guides/tree/main/backend/dotnet/sqlite-scheduler)
- [Scheduler Vite frontend](https://github.com/ritza-co/bryntum-backend-guides/tree/main/frontend/vanilla-js/scheduler)

## Prerequisites

To follow along, you need the [.NET SDK](https://dotnet.microsoft.com/en-us/download) (version 10.0 or later) and
[Node.js](https://nodejs.org/en/download) installed on your system.

## Set up the backend

Create a new .NET Web API project:

```sh
dotnet new webapi -n dotnet-sqlite-scheduler
cd dotnet-sqlite-scheduler
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
    "DefaultConnection": "Data Source=scheduler.sqlite3"
  }
}
```

## Create the data models

We'll define database models for the events and resources example data using [Entity Framework Core](https://learn.microsoft.com/en-us/ef/core/).
In Bryntum Scheduler, data stores are kept and linked together in the [Crud Manager](#Scheduler/guides/data/crud_manager.md).
Bryntum Scheduler uses the following data stores:

- [ResourceStore](#Scheduler/data/ResourceStore)
- [EventStore](#Scheduler/data/EventStore)
- [AssignmentStore](#Scheduler/data/AssignmentStore)
- [TimeRangeStore](#Scheduler/data/TimeRangeStore)
- [ResourceTimeRangeStore](#Scheduler/data/ResourceTimeRangeStore)

This basic tutorial covers making models for the EventStore and the ResourceStore.

### Create the Event model

Create a folder called `Models` in the project directory. Create a file called `Event.cs` in this folder and add the
following lines of code to it:

```plaintext
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace SchedulerApi.Models
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

The `Event` model defines the `events` table structure. The `[JsonPropertyName]` attributes ensure properties are
serialized using the JSON property names that Bryntum Scheduler expects.

### Create the Resource model

Create `Models/Resource.cs`:

```plaintext
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace SchedulerApi.Models
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

### Create the Assignment model

Create `Models/Assignment.cs`:

```plaintext
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace SchedulerApi.Models
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

Assignments link events to resources, allowing events to be displayed on specific resource rows in the Scheduler.

### Create the JsonStringToArrayConverter model

Create `Models/JsonStringToArrayConverter.cs`:

```plaintext
using System.Text.Json;
using System.Text.Json.Serialization;

namespace SchedulerApi.Models
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

### Create the SyncModels model

Create `Models/SyncModels.cs`:

```plaintext
using System.Text.Json;
using System.Text.Json.Serialization;

namespace SchedulerApi.Models
{
    // Request DTOs
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

    // Special store changes for assignments that can have phantom IDs for eventId
    public class AssignmentStoreChanges
    {
        [JsonPropertyName("added")]
        public List<AssignmentSyncDto>? Added { get; set; }

        [JsonPropertyName("updated")]
        public List<AssignmentSyncDto>? Updated { get; set; }

        [JsonPropertyName("removed")]
        public List<AssignmentSyncDto>? Removed { get; set; }
    }

    // DTO for assignment sync that accepts eventId as either int or string
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

        // Convert to Assignment entity, resolving phantom IDs
        public Assignment ToAssignment(Dictionary<string, int>? eventPhantomIdMap)
        {
            var assignment = new Assignment
            {
                Id = Id,
                PhantomId = PhantomId,
                ResourceId = ResourceId
            };

            // Resolve eventId
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

    // Response DTOs
    public class LoadResponse
    {
        [JsonPropertyName("events")]
        public StoreData<Event>? Events { get; set; }

        [JsonPropertyName("resources")]
        public StoreData<Resource>? Resources { get; set; }

        [JsonPropertyName("assignments")]
        public StoreData<Assignment>? Assignments { get; set; }
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

The `SyncRequest` class contains the `requestId` and optional `events`, `resources`, and `assignments` properties that
hold changes for each store. The `AssignmentSyncDto` handles cases where `eventId` might be a phantom ID string
referencing a newly created event.

## Create the database context

Create a folder called `Data` in the project directory. In this folder, create a `SchedulerContext.cs` file
containing the following lines of code:

```plaintext
using Microsoft.EntityFrameworkCore;
using SchedulerApi.Models;

namespace SchedulerApi.Data
{
    public class SchedulerContext : DbContext
    {
        public SchedulerContext(DbContextOptions<SchedulerContext> options) : base(options) { }

        public DbSet<Event> Events { get; set; } = null!;
        public DbSet<Resource> Resources { get; set; } = null!;
        public DbSet<Assignment> Assignments { get; set; } = null!;

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

                // Configure cascade delete
                entity.HasOne<Event>()
                    .WithMany()
                    .HasForeignKey(a => a.EventId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne<Resource>()
                    .WithMany()
                    .HasForeignKey(a => a.ResourceId)
                    .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}
```

The `SchedulerContext` defines `DbSet` properties for each model and configures cascade delete behavior for assignments.

## Configure the .NET backend to use SQLite and seed the local SQLite database with example data

First copy the `example-data` folder from the completed [.NET Bryntum Scheduler backend](https://github.com/ritza-co/bryntum-backend-guides/tree/main/backend/dotnet/sqlite-scheduler)
and add it to the root folder of your .NET backend.

Now let's update the `Program.cs` file to configure the .NET backend to use SQLite, and create a seeding function that
populates a local SQLite database with the example JSON data from the `example-data` directory.

Replace the contents of `Program.cs` with the following:

```plaintext
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using SchedulerApi.Data;
using SchedulerApi.Models;

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
builder.Services.AddDbContext<SchedulerContext>(options =>
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
    var context = scope.ServiceProvider.GetRequiredService<SchedulerContext>();
    context.Database.EnsureCreated();
}

app.UseAuthorization();
app.MapControllers();

app.Run();

// Seeding function
static async Task SeedDatabase(WebApplication app)
{
    using var scope = app.Services.CreateScope();
    var context = scope.ServiceProvider.GetRequiredService<SchedulerContext>();

    // Drop existing tables and recreate
    await context.Database.EnsureDeletedAsync();
    await context.Database.EnsureCreatedAsync();
    Console.WriteLine("Database recreated.");

    // Read JSON data from example files
    var basePath = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "example-data"));

    var eventsJsonPath = Path.Combine(basePath, "events.json");
    var resourcesJsonPath = Path.Combine(basePath, "resources.json");
    var assignmentsJsonPath = Path.Combine(basePath, "assignments.json");

    Console.WriteLine($"Reading events from: {eventsJsonPath}");
    Console.WriteLine($"Reading resources from: {resourcesJsonPath}");
    Console.WriteLine($"Reading assignments from: {assignmentsJsonPath}");

    var eventsJson = await File.ReadAllTextAsync(eventsJsonPath);
    var resourcesJson = await File.ReadAllTextAsync(resourcesJsonPath);
    var assignmentsJson = await File.ReadAllTextAsync(assignmentsJsonPath);

    var options = new JsonSerializerOptions
    {
        PropertyNameCaseInsensitive = true
    };

    var events = JsonSerializer.Deserialize<List<Event>>(eventsJson, options);
    var resources = JsonSerializer.Deserialize<List<Resource>>(resourcesJson, options);
    var assignments = JsonSerializer.Deserialize<List<Assignment>>(assignmentsJson, options);

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

    Console.WriteLine("Database seeded successfully!");
}
```

This configures Entity Framework Core to use SQLite, adds CORS to allow requests from the frontend at `http://localhost:5173`, and includes a seeding function to populate the database with example data.

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

You will also see a `scheduler.sqlite3` file created in your project folder.

## Create API endpoints

Create a folder called `Controllers` in the project directory. Create a file called `SchedulerController.cs`
in this folder and add the following code:

```plaintext
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SchedulerApi.Data;
using SchedulerApi.Models;

namespace SchedulerApi.Controllers
{
    [ApiController]
    [Route("api")]
    public class SchedulerController : ControllerBase
    {
        private readonly SchedulerContext _context;
        private readonly ILogger<SchedulerController> _logger;

        public SchedulerController(SchedulerContext context, ILogger<SchedulerController> logger)
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

                await Task.WhenAll(eventsTask, resourcesTask, assignmentsTask);

                var response = new LoadResponse
                {
                    Events = new StoreData<Event> { Rows = eventsTask.Result },
                    Resources = new StoreData<Resource> { Rows = resourcesTask.Result },
                    Assignments = new StoreData<Assignment> { Rows = assignmentsTask.Result }
                };

                _logger.LogInformation("Loaded {EventCount} events, {ResourceCount} resources, {AssignmentCount} assignments",
                    eventsTask.Result.Count, resourcesTask.Result.Count, assignmentsTask.Result.Count);

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error loading data");
                return StatusCode(500, new { success = false, message = "There was an error loading the assignments, events, and resources data." });
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

                // Track event phantom ID mappings for assignments
                var eventPhantomIdMap = new Dictionary<string, int>();

                // Process resources first
                if (request.Resources != null)
                {
                    var rows = await ApplyResourceChanges(request.Resources);
                    if (rows != null && rows.Count > 0)
                    {
                        response.Resources = new SyncStoreResponse { Rows = rows };
                    }
                }

                // Process events second (track phantom IDs)
                if (request.Events != null)
                {
                    var rows = await ApplyEventChanges(request.Events, eventPhantomIdMap);
                    if (rows != null && rows.Count > 0)
                    {
                        response.Events = new SyncStoreResponse { Rows = rows };
                    }
                }

                // Process assignments last (use event phantom ID mappings)
                if (request.Assignments != null)
                {
                    var rows = await ApplyAssignmentChanges(request.Assignments, eventPhantomIdMap);
                    if (rows != null && rows.Count > 0)
                    {
                        response.Assignments = new SyncStoreResponse { Rows = rows };
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
    }
}
```

The `/api/load` endpoint fetches all data from the database. The `/api/sync` endpoint handles create, update, and delete operations. For added records, it returns the phantom ID and the created database ID so the client can update its records.

Run the development server:

```shell
dotnet run
```

Open `http://localhost:1337/api/load` in your browser to verify the data loads correctly.

## Set up the frontend

In a new terminal, create a Vite project:

```sh
npm create vite@latest scheduler-frontend -- --template vanilla
cd scheduler-frontend
npm install
```

Delete the following default files that we don't need:

- `src/counter.js`
- `src/javascript.svg`

### Install the Bryntum Scheduler component

First, access the private Bryntum npm registry by following the [guide in our docs](#Scheduler/guides/quick-start/javascript-npm.md#access-to-npm-registry).

Once you've logged in to the registry, install the Bryntum Scheduler component:

<div class="docs-tabs" data-name="licensed">
<div>
    <a>Trial version</a>
    <a>Licensed version</a>
</div>
<div>

```shell
npm install @bryntum/scheduler@npm:@bryntum/scheduler-trial
```

</div>
<div>

```shell
npm install @bryntum/scheduler
```

</div>
</div>

<div class="note">

Ensure that you have configured your npm properly to get access to the Bryntum packages. If not,
refer to <a href="#Scheduler/guides/npm-repository.md">this guide</a>.

</div>

### Create and configure the Bryntum Scheduler

Update the `main.js` file to import, create, and configure the Bryntum Scheduler:

```javascript
import { Scheduler } from '@bryntum/scheduler';
import './style.css';

const scheduler = new Scheduler({
    appendTo    : 'app',
    startDate   : new Date(2026, 6, 20, 6),
    endDate     : new Date(2026, 6, 20, 20),
    viewPreset  : 'hourAndDay',
    crudManager : {
        loadUrl          : 'http://localhost:1337/api/load',
        autoLoad         : true,
        syncUrl          : 'http://localhost:1337/api/sync',
        autoSync         : true,
        validateResponse : true
    },
    columns : [{ text : 'Name', field : 'name', width : 130 }]
});
```

The configuration attaches the Scheduler to the `#app` element. The `startDate` and `endDate` set the visible time range
to July 20, 2026, matching the example data. The `crudManager` configures automatic loading and syncing with the
.NET API.

### Add styles

Update the `style.css` file in the `src` directory:

```css
@import "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap";
@import "@bryntum/scheduler/fontawesome/css/fontawesome.css";
@import "@bryntum/scheduler/fontawesome/css/solid.css";
@import "@bryntum/scheduler/scheduler.css";
@import "@bryntum/scheduler/svalbard-light.css";

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

Open `http://localhost:5173/` in your browser. You'll see a Bryntum Scheduler with
the example data from the local SQLite database.

<video controls width="100%">
<source src="data/Scheduler/images/integration/backends/dotnet/bryntum-scheduler-crud.webm" type="video/mp4">
Sorry, your browser doesn't support embedded videos.
</video>

## Adapting for React, Angular, or Vue

This tutorial demonstrates a vanilla JavaScript implementation. If you're using a framework, the backend code remains
the same, but you'll need to adapt the frontend. Refer to the [integration guides](#integration) for detailed
instructions.

## Next steps

This tutorial covers the basics of using Bryntum Scheduler with .NET and SQLite. Take a look at the
[Bryntum Scheduler examples page](https://bryntum.com/products/scheduler/examples/) to browse the additional features
you can add to your Scheduler.

<p class="last-modified">Last modified on 2026-07-22 10:51:34</p>