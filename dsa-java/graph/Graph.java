import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Represents a directed graph modeling task dependencies.
 * Vertices are task IDs, and directed edges (U -> V) represent that task U must
 * be completed before task V can start.
 */
public class Graph {
    private final Map<String, List<String>> adjList;

    public Graph() {
        this.adjList = new HashMap<>();
    }

    /**
     * Adds a vertex (task ID) to the graph.
     *
     * @param vertex the task identifier
     */
    public void addVertex(String vertex) {
        adjList.putIfAbsent(vertex, new ArrayList<>());
    }

    /**
     * Adds a directed edge (from -> to) representing a dependency relationship.
     * Specifies that 'from' is a dependency of 'to'.
     *
     * @param from the dependency task
     * @param to the target task
     */
    public void addEdge(String from, String to) {
        addVertex(from);
        addVertex(to);
        adjList.get(from).add(to);
    }

    /**
     * Gets all neighboring vertices (tasks that depend on this task).
     *
     * @param vertex the task identifier
     * @return list of dependent tasks
     */
    public List<String> getNeighbors(String vertex) {
        return adjList.getOrDefault(vertex, new ArrayList<>());
    }

    /**
     * Returns the set of all task vertices in the graph.
     *
     * @return set of vertices
     */
    public Set<String> getVertices() {
        return adjList.keySet();
    }

    /**
     * Computes the in-degrees (number of incoming dependency edges) for all vertices.
     *
     * @return map of task IDs to their respective in-degrees
     */
    public Map<String, Integer> getInDegrees() {
        Map<String, Integer> inDegrees = new HashMap<>();
        for (String v : getVertices()) {
            inDegrees.put(v, 0);
        }
        for (String u : getVertices()) {
            for (String v : getNeighbors(u)) {
                inDegrees.put(v, inDegrees.get(v) + 1);
            }
        }
        return inDegrees;
    }
}
