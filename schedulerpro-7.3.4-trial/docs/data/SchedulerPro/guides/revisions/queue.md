# Leveraging the Project Queue for Enhanced Project Synchronization

Historically, synchronizing project changes across clients was straightforward. However, with the demand for more
responsive projects and real-time updates, the existing approach became inadequate. Enter the
[applyProjectChanges](#SchedulerPro/model/ProjectModel#function-applyProjectChanges) API
and the concept of the project queue, offering a more robust and seamless method to manage project updates.

## The Challenge

Consider two clients concurrently working on the same project. When changes from one client arrive while the other is
actively editing data, conflicts can arise. These conflicts may result in lost changes and unexpected updates to the
project view. Moreover, distinguishing between changes made by different users for undo/redo purposes becomes
challenging.

## The Resolution

To address these challenges, we introduce the concept of transactions. Transactions provide boundaries that separate
individual sets of changes, allowing for more precise management of project updates:

1. **Isolation of User Actions:** Transactions enable us to group user actions together, ensuring they remain unaffected
by incoming changes from other clients.
2. **Stability of the Project View:** Incoming changes are queued and only displayed when the user becomes inactive,
preventing disruptions to their current work.
3. **Facilitation of Undo/Redo Operations:** Transactions provide clear boundaries for undo operations, enabling users
to revert changes accurately.
4. **Support for Collaborative Viewing:** Users can observe changes made by others while viewing the project.

## How It Operates

The project queue operates like a chain of promises, executing actions in a first-in, first-out (FIFO) manner. Queue
steps are executed when previous promises in the chain are settled, ensuring that rejected promises do not halt the
queue.

When using queue be aware of possible deadlocks. If you put a promise which does not resolve on a queue, the
queue will be halted. We will cover that in more details below.

By default, this feature is disabled but can be enabled by setting the
[enableTransactionalFeatures](#SchedulerPro/view/SchedulerPro#config-enableTransactionalFeatures) configuration to
`true`. When enabled, this config will change features' behavior to wrap their work into transactions. For example,
when you start dragging an event transaction will start and will pause queue until drag is finished.

## Implementation

### Basics

To add work to the queue, simply pass a function (a "step") to the
[queue](#SchedulerPro/model/ProjectModel#function-queue) method, which returns a promise:

```javascript
// step can be empty
await project.queue(() => {});

// ...or synchronous
await project.queue(() => project.taskStore.getById(1).name = 'foo');

// ...or asynchronous
await project.queue(async () => {
    project.taskStore.getById(1).duration = 1;
    await project.commitAsync();
    project.taskStore.getById(2).duration = 2;
    await project.commitAsync();
});
```

You can chain more promises to a queue call, but those will be executed in its own order and may overlap
with steps:

```javascript
await project.queue(() => console.log(1))
await project.queue(() => console.log(2))
// logs: 1, 2

// this will log: 1, 2, 3, 4
await project.queue(() => console.log(1)).then(() => console.log(2));
await project.queue(() => console.log(3)).then(() => console.log(4));

// however, if you create a chain of promises and don't await for them order might be
// other than you expect. this one would log: 1, 2, 4, 3, 5, 6
project.queue(() => console.log(1)).then(() => console.log(2)).then(() => console.log(3));
project.queue(() => console.log(4)).then(() => console.log(5)).then(() => console.log(6));

// if you want specific order you should wrap entire promise chain to a step
// this will log: 1, 2, 3, 4, 5, 6
project.queue(() => {
    return Promise.resolve().then(() => console.log(1)).then(() => console.log(2)).then(() => console.log(3));
});
project.queue(() => {
    return Promise.resolve().then(() => console.log(4)).then(() => console.log(5)).then(() => console.log(6));
});
```

Step only runs once, when queue gets to it. Let's see how execution flows:

```javascript
async function test() {
    console.log(1)

    // this will schedule a microtask
    const step1 = project.queue(() => console.log(2))

    // this will execute synchronously
    console.log(3)

    // here we put new step on the queue and await the queue
    // by extension it will also await for step1
    await project.queue(() => console.log(4))
}

test() // logs: 1, 3, 2, 4
```

Features using queue will handle STM transaction recordings, but if you call queue on your own you may want
to record transaction manually:

```javascript
await project.queue(async () => {
    const { stm } = project;

    // Stop previous auto-recorded transaction
    if (stm.isRecording) {
        stm.stopTransaction();
    }

    stm.startTransaction();

    // change project

    await project.commitAsync();

    stm.stopTransaction();
});
```

Auto-recorded STM will start transaction on any change and will stop it after delay. In this case it is
enough to stop transaction:

```javascript
await project.queue(async () => {
    const { stm } = project;

    // Stop previous auto-recorded transaction
    if (stm.isRecording) {
        stm.stopTransaction();
    }

    // change project

    await project.commitAsync();

    // Optionally stop current transaction. If you don't - other changes may get into it
    stm.stopTransaction();
});
```

### Error Handling

You can handle step exceptions using standard promise error handling:

```javascript
await project.queue(() => {
    throw new Error('Error');
}).catch(err => {
    console.log(err.message); // logs: Error
});

// Despite the exception you can continue using queue
await project.queue(() => console.log('queue is unblocked')); // logs: queue is unblocked
```

### Avoiding Deadlocks

To prevent deadlocks, ensure that every step eventually resolves:

```javascript
// This is a deadlock
await project.queue(() => {
    // Queue is currently running first step which depends on the 2nd step.
    // Such promise will never resolve
    return project.queue(() => console.log(1));
});

// This is a deadlock too
await project.queue(() => {
    return new Promise(resolve => {
        // Let's assume you have a conditional expression which unintentionally
        // always resolves to false
        if (false) {
            resolve();
        }
    });
});

// As well as this
await project.queue(async () => {
    await Promise.all([
        project.queue(() => console.log(2)),
        Promise.resolve()
    ]);
});

// But this is NOT a deadlock
await project.queue(async () => {
    console.log(1);

    // We added a step to queue, but Promise.race will resolve anyway, unblock the queue
    // and eventually log 2 to the console
    await Promise.race([
        project.queue(() => console.log(2)),
        new Promise(resolve => setTimeout(resolve, 100))
    ])
});
```

At the same time it is absolutely valid to call queue within a step. Just make sure you do not wait for this
promise to resolve:

```javascript
let step2;

await project.queue(() => {
    // We only schedule a promise here, we can store it to a variable and await later
    step2 = project.queue(() => console.log(1));
});

await step2;

// Or you can just wait for next queue step
await project.queue(() => {
    project.queue(() => console.log(2));
});

// This will work because we waited for the 1st step to resolve. 1st step added 2nd step
// and quit before promise got resolved. This call adds 3rd step to a queue
await project.queue(() => console.log(3)); // this will log 2, 3
```

## Practical Usage

The project queue is particularly useful when working with the
[applyProjectChanges](#SchedulerPro/model/ProjectModel#function-applyProjectChanges) API to synchronize changes between
projects, especially via websocket connections.

For demo purposes we will assume both projects are running on the same page and target project is used in
the Bryntum Scheduler Pro view. Below is prerequisite code which sets up two identical projects and awaits for initial
calculation:

```javascript
const sourceProject = new ProjectModel({ /* config */ });
const targetProject = new ProjectModel({ /* config */ });

await Promise.all([sourceProject.commitAsync(), targetProject.commitAsync()])
```

Now we can modify one project and move changes to another:

```javascript
await sourceProject.taskStore.getById(1).setDuration(1);

// This will apply duration change
await targetProject.applyProjectChanges(sourceProject.changes);
```

This code may execute while user is creating new dependency and move task. To avoid confusion and allow
user to finish his action we need to wrap this into a queue step:

```javascript
await sourceProject.taskStore.getById(1).setDuration(1);

// This will apply duration change
await targetProject.queue(() => targetProject.applyProjectChanges(sourceProject.changes));
```


<p class="last-modified">Last modified on 2026-07-22 10:55:57</p>