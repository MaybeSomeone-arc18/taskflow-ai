import java.util.PriorityQueue;

/**
 * Manages task scheduling using a Priority Queue (Min-Heap / Binary Heap).
 * Guarantees that the most urgent tasks are dispatched first.
 */
public class PriorityScheduler {
    private final PriorityQueue<Task> taskQueue;

    public PriorityScheduler() {
        this.taskQueue = new PriorityQueue<>();
    }

    /**
     * Adds a task to the scheduling queue.
     * Time Complexity: O(log N)
     *
     * @param task the task to be added
     */
    public void addTask(Task task) {
        if (task == null) {
            throw new IllegalArgumentException("Task cannot be null");
        }
        taskQueue.offer(task);
    }

    /**
     * Retrieves and removes the most urgent task from the scheduler.
     * Time Complexity: O(log N)
     *
     * @return the most urgent task, or null if empty
     */
    public Task nextTask() {
        return taskQueue.poll();
    }

    /**
     * Inspects the most urgent task without removing it.
     * Time Complexity: O(1)
     *
     * @return the most urgent task, or null if empty
     */
    public Task peekTask() {
        return taskQueue.peek();
    }

    public boolean isEmpty() {
        return taskQueue.isEmpty();
    }

    public int size() {
        return taskQueue.size();
    }

    public void clear() {
        taskQueue.clear();
    }
}
