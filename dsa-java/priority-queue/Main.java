import java.time.LocalDate;
import java.time.LocalDateTime;

public class Main {
    public static void main(String[] args) {
        System.out.println("========================================================");
        System.out.println("TaskFlow AI - Priority Queue Task Scheduler Demo");
        System.out.println("========================================================");

        PriorityScheduler scheduler = new PriorityScheduler();

        // 1. Add tasks with varying priorities
        System.out.println("Adding tasks to scheduler...");
        
        // Task A: High priority, due in 5 days
        Task taskA = new Task("T1", "Setup MongoDB Indexes", Task.Priority.HIGH, 
                LocalDate.now().plusDays(5), LocalDateTime.now().minusHours(2));
        
        // Task B: Low priority, due in 2 days
        Task taskB = new Task("T2", "Refactor index.css variables", Task.Priority.LOW, 
                LocalDate.now().plusDays(2), LocalDateTime.now().minusHours(1));
        
        // Task C: Critical priority, due in 3 days
        Task taskC = new Task("T3", "Fix Atlas connection timeout", Task.Priority.CRITICAL, 
                LocalDate.now().plusDays(3), LocalDateTime.now().minusHours(3));
        
        // Task D: High priority, due in 1 day (earlier than Task A)
        Task taskD = new Task("T4", "Write validation middleware", Task.Priority.HIGH, 
                LocalDate.now().plusDays(1), LocalDateTime.now().minusHours(4));
        
        // Task E: High priority, due in 5 days, created 4 hours ago (earlier than Task A)
        Task taskE = new Task("T5", "Implement React routes", Task.Priority.HIGH, 
                LocalDate.now().plusDays(5), LocalDateTime.now().minusHours(4));

        scheduler.addTask(taskA);
        scheduler.addTask(taskB);
        scheduler.addTask(taskC);
        scheduler.addTask(taskD);
        scheduler.addTask(taskE);

        System.out.println("\nInitial queue size: " + scheduler.size());
        System.out.println("\nRetrieving tasks in scheduled priority order:\n");

        int rank = 1;
        while (!scheduler.isEmpty()) {
            Task next = scheduler.nextTask();
            System.out.printf("%d. %s\n", rank++, next);
            System.out.printf("   - Title: %s\n", next.getTitle());
            System.out.printf("   - Urgency Tier: %s\n", next.getPriority());
            System.out.printf("   - Deadline: %s\n", next.getDueDate());
            System.out.printf("   - Created: %s\n\n", next.getCreatedAt());
        }

        System.out.println("========================================================");
    }
}
