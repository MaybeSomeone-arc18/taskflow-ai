import java.util.List;

/**
 * Manages task dependency relations within a project workspace.
 * Acts as a wrapper around the Graph and TopologicalSort algorithms.
 */
public class TaskDependencyManager {
    private final Graph dependencyGraph;

    public TaskDependencyManager() {
        this.dependencyGraph = new Graph();
    }

    /**
     * Registers a task in the dependency system.
     *
     * @param taskId the unique identifier of the task
     */
    public void addTask(String taskId) {
        dependencyGraph.addVertex(taskId);
    }

    /**
     * Declares a dependency: taskId depends on dependsOnId (dependsOnId -> taskId).
     * This means dependsOnId must be completed BEFORE taskId can begin.
     *
     * @param taskId the dependent task
     * @param dependsOnId the dependency task
     */
    public void addDependency(String taskId, String dependsOnId) {
        dependencyGraph.addEdge(dependsOnId, taskId);
    }

    /**
     * Computes the safe chronological execution order for the project tasks.
     *
     * @return a list of task IDs ordered by dependency requirements
     * @throws CircularDependencyException if a cycle is present in dependencies
     */
    public List<String> getExecutionOrder() {
        return TopologicalSort.sort(dependencyGraph);
    }
}
