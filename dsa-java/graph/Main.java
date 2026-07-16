import java.util.List;

public class Main {
    public static void main(String[] args) {
        System.out.println("========================================================");
        System.out.println("TaskFlow AI - Task Dependency Topological Sort Demo");
        System.out.println("========================================================");

        // Scenario 1: Valid Directed Acyclic Graph (DAG)
        System.out.println("--- Scenario 1: Valid Dependency Schedule ---");
        TaskDependencyManager manager = new TaskDependencyManager();

        // Register tasks
        manager.addTask("Design UI");
        manager.addTask("Backend API");
        manager.addTask("Testing");
        manager.addTask("Deployment");
        manager.addTask("Write Docs");

        // Define dependency edges: (task, dependsOn)
        // Backend API depends on Design UI
        manager.addDependency("Backend API", "Design UI");
        // Testing depends on Backend API
        manager.addDependency("Testing", "Backend API");
        // Deployment depends on Testing
        manager.addDependency("Deployment", "Testing");
        // Write Docs depends on Design UI
        manager.addDependency("Write Docs", "Design UI");

        try {
            List<String> executionOrder = manager.getExecutionOrder();
            System.out.println("Successfully resolved execution order!");
            for (int i = 0; i < executionOrder.size(); i++) {
                System.out.printf("  Step %d: %s\n", (i + 1), executionOrder.get(i));
            }
        } catch (CircularDependencyException e) {
            System.out.println("FAIL: Unexpected cyclic error: " + e.getMessage());
        }

        // Scenario 2: Directed Graph with Cycle (Circular Dependency)
        System.out.println("\n--- Scenario 2: Circular Dependency Detection ---");
        TaskDependencyManager cyclicManager = new TaskDependencyManager();

        // Register tasks
        cyclicManager.addTask("Task A");
        cyclicManager.addTask("Task B");
        cyclicManager.addTask("Task C");

        // Create cycle: A depends on B, B depends on C, C depends on A
        System.out.println("Adding circular dependency edges:");
        System.out.println("  - Task A depends on Task B");
        cyclicManager.addDependency("Task A", "Task B");
        
        System.out.println("  - Task B depends on Task C");
        cyclicManager.addDependency("Task B", "Task C");
        
        System.out.println("  - Task C depends on Task A (Creating Loop!)");
        cyclicManager.addDependency("Task C", "Task A");

        try {
            System.out.println("Resolving execution order for cyclic graph...");
            List<String> badOrder = cyclicManager.getExecutionOrder();
            System.out.println("FAIL: Managed to sort a cyclic graph: " + badOrder);
        } catch (CircularDependencyException e) {
            System.out.println("SUCCESS: Expected exception caught!");
            System.out.println("Error Message: " + e.getMessage());
        }

        System.out.println("========================================================");
    }
}
