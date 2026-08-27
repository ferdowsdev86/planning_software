# State Tracking Manager behavior in relation to revisions

## Key points

### Undo/redo queue cannot be modified outside of the STM

In general case, transaction in the STM is not necessarily atomic - e.g. incorporating only one meaningful change.
Even though action in the transaction are atomic, we cannot determine which action triggered which. Therefore we cannot
clear action from the queue. It means that action should always stay in the queue.

Example:

Assume there are 3 tasks (A, B, C) and there are dependencies (A->B, B->C, A->C). User removes task A. Along with the
task, scheduling engine will remove also dependencies A->B and A->C. Then lets say user also removed dependency B->C.
In this case, transaction contains 4 actions:
1. Remove task A
2. Remove dependency A->B
3. Remove dependency A->C
4. Remove dependency B->C

Assume we want to change the transaction and remove action 1 and all related actions. There are few problems.

The first problem stems from the fact that there are no relations among individual actions. Therefore, we cannot
reliably tell which action triggered which. As a consequence we have a second problem: we cannot tell whether removing
the action will make other actions invalid.

Actions in the transaction are marked with `isUserInput` or `isCalculated` flag. Which may suggest if we're removing
action with certain user input generation, then we can also remove actions with `isCalculated` of the same generation.
It is possible, however, to make more changes than remove task A.

For example:

1. Remove task A
2. Add task D with a dependency to the task B

If both actions are performed at once, in the same project commit, they will produce following actions:
1. Remove task A
2. Add task D
3. Add dependency D->B
4. Remove dependency A->B
5. Remove dependency A->C
6. Move task B to start after task D
7. Update project duration

We can achieve a situation where items 1 and 2 are marked as `isUserInput = 1` and actions 3-7 are marked as
`isCalculated = 1`. Now we cannot ungroup actions and tell which actions should be removed.

### Some actions might become obsolete

This is the originally reported problem.

Assume we have a task and two clients. Client 1 removes the task and then undo the removal. Then client 2 removes the
same task and undo the removal. Two clients now share the state and the redo queue. Both clients can redo the
removal of the referenced task. *When either client undoes the removal, another will have an action in the redo queue
which does nothing*. And we cannot remove the action from the queue for reasons described above.

Another variation of the problem is when two clients do these steps simultaneously. In which case they both send two
revisions: one removes the task and another adds it back. If they do it at the same time, two tasks might get added,
which is not desired.

It means server should track ids of the removed and added tasks and not add duplicates.


<p class="last-modified">Last modified on 2026-07-22 10:55:57</p>