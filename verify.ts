
import { createTask, completeTask, EisenhowerQuadrant } from '@studyos/core';
import { InMemoryAdapter, TaskRepository } from '@studyos/storage';

async function runVerification() {
    console.log("Starting Verification...");

    // 1. Setup Storage
    const adapter = new InMemoryAdapter();
    const repo = new TaskRepository(adapter);

    // 2. Create Task
    const task = createTask("Study Physics", EisenhowerQuadrant.Q2_NOT_URGENT_IMPORTANT);
    console.log("Created Task:", task.title, task.id);
    console.log("Initial Points:", task.pointsValue);

    // 3. Save Task
    await repo.saveTask(task);
    console.log("Task Saved.");

    // 4. Retrieve Task
    const retrieved = await repo.getTask(task.id);
    if (!retrieved) {
        console.error("Failed to retrieve task!");
        process.exit(1);
    }
    console.log("Retrieved Task:", retrieved.title);

    // 5. Complete Task
    const completed = completeTask(retrieved);
    await repo.saveTask(completed);
    console.log("Task Completed & Saved.");

    // 6. Verify Completion
    const final = await repo.getTask(task.id);
    console.log("Final Status:", final?.status);

    if (final?.status === 'COMPLETED') {
        console.log("Verification SUCCESS");
    } else {
        console.error("Verification FAILED");
    }
}

runVerification();
