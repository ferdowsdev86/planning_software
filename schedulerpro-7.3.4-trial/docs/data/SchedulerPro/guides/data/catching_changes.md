# Catching changes from all stores

If your app doesn't use the `CrudManager` functionality of the project to load and save data, you can still leverage its 
change tracking to have a single point of entry to catch all data changes in your app.

## Setup

To utilize the change tracking, add a listener for the `hasChanges` event on the `project`:

```javascript
schedulerPro.project.on({
    // Called for data changes that are persistable  
    hasChanges() {}
});
```

In the listener, you can access the changes via the `changes` property of the `project` (here using an initial listener 
instead):

```javascript
const schedulerPro = new SchedulerPro({
    project : {
        listeners : {
            hasChanges() {
                const { changes } = this;
                
                // Process changes here
            }
        }
    },
    ...
})
```

The listener could for example use the native `fetch` API to pass changes to your backend. You should also reset the 
local change tracking by calling `project.acceptChanges()`, to not get the same changes included in the next call to 
`hasChanges`:

```javascript
async hasChanges() {
    const { changes } = this;
    
    // Pseudo code
    if (await myBackend.saveChanges(changes) === 'ok') {
        // Reset change tracking
        this.acceptChanges();
    }
}
```

## Data format

The format of `changes` is (depending on which stores you use in your Scheduler Pro, and what actually changed):

```javascript
{
    resources : {
        added   : [ ... ],
        updated : [ ... ],
        removed : [ ... ]    
    },
    events : {
        added   : [ ... ],
        updated : [ ... ],
        removed : [ ... ]
    },
    ...
}
```

For example after moving an event in time:

```javascript
{
    events : {
        updated : [ 
            {
                id        : 1,
                startDate : '2023-01-10',
                endDate   : '2023-01-12'
            } 
        ]
    }
}
```

Or after removing a resource:

```javascript
{
    resources : {
        removed : [ 
            { id : 1 } 
        ]
    }
}
```

If you have remapped any fields (their `dataSource`), your mappings will be used.


<p class="last-modified">Last modified on 2026-07-22 10:39:19</p>