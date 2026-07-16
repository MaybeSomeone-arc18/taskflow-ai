import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Queue;

/**
 * Custom runtime exception thrown when a cyclic dependency is detected in the graph.
 */
class CircularDependencyException extends RuntimeException {
    public CircularDependencyException(String message) {
        super(message);
    }
}

/**
 * Implements Topological Sorting using Kahn's Algorithm (BFS).
 * Detects cycles and resolves dependencies chronologically.
 */
public class TopologicalSort {

    /**
     * Performs a topological sort on the provided directed graph.
     * Time Complexity: O(V + E)
     * Space Complexity: O(V)
     *
     * @param graph the task dependency graph
     * @return a list of task IDs in correct execution order
     * @throws CircularDependencyException if a cycle (circular dependency) is detected
     */
    public static List<String> sort(Graph graph) {
        List<String> order = new ArrayList<>();
        Map<String, Integer> inDegrees = graph.getInDegrees();
        Queue<String> queue = new LinkedList<>();

        // Add all tasks with no incoming dependencies (in-degree = 0)
        for (Map.Entry<String, Integer> entry : inDegrees.entrySet()) {
            if (entry.getValue() == 0) {
                queue.offer(entry.getKey());
            }
        }

        // Process vertices
        while (!queue.isEmpty()) {
            String u = queue.poll();
            order.add(u);

            for (String v : graph.getNeighbors(u)) {
                inDegrees.put(v, inDegrees.get(v) - 1);
                if (inDegrees.get(v) == 0) {
                    queue.offer(v);
                }
            }
        }

        // Cycle check: If sorted list contains fewer elements than vertices in graph, a cycle exists.
        if (order.size() < graph.getVertices().size()) {
            throw new CircularDependencyException(
                "Circular dependency detected! A valid scheduling sequence cannot be resolved because " +
                "some tasks form a dependency loop."
            );
        }

        return order;
    }
}
