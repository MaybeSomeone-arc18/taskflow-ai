import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Represents a task in the TaskFlow AI workspace.
 * Implements Comparable to define the ordering of scheduling urgency.
 */
public class Task implements Comparable<Task> {
    private final String id;
    private final String title;
    private final Priority priority;
    private final LocalDate dueDate;
    private final LocalDateTime createdAt;

    /**
     * Enumerates Task Priorities with rank values.
     * Higher rank indicates higher urgency.
     */
    public enum Priority {
        LOW(1),
        MEDIUM(2),
        HIGH(3),
        CRITICAL(4);

        private final int rank;

        Priority(int rank) {
            this.rank = rank;
        }

        public int getRank() {
            return rank;
        }
    }

    public Task(String id, String title, Priority priority, LocalDate dueDate, LocalDateTime createdAt) {
        this.id = id;
        this.title = title;
        this.priority = priority;
        this.dueDate = dueDate;
        this.createdAt = createdAt;
    }

    public String getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public Priority getPriority() {
        return priority;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    /**
     * Compares this task with another task for priority ordering.
     *
     * Urgency Rules:
     * 1. Higher priority wins (Critical > High > Medium > Low).
     * 2. If priorities are equal, earlier due date wins.
     * 3. If due dates are equal, earlier creation time wins.
     */
    @Override
    public int compareTo(Task other) {
        // 1. Compare Priorities (descending rank)
        int priorityComparison = Integer.compare(other.priority.getRank(), this.priority.getRank());
        if (priorityComparison != 0) {
            return priorityComparison;
        }

        // 2. Compare Due Dates (ascending order - earlier first)
        int dueDateComparison = this.dueDate.compareTo(other.dueDate);
        if (dueDateComparison != 0) {
            return dueDateComparison;
        }

        // 3. Compare Creation Times (ascending order - earlier first)
        return this.createdAt.compareTo(other.createdAt);
    }

    @Override
    public String toString() {
        return String.format(
            "Task[ID=%s, Title='%s', Priority=%s, DueDate=%s, CreatedAt=%s]",
            id, title, priority, dueDate, createdAt
        );
    }
}
