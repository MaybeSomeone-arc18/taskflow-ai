# TaskFlow AI - Java DSA Module

This module contains Java 17 implementations of two core Data Structures and Algorithms (DSA) concepts that directly model and support the operational flow of **TaskFlow AI**.

---

## 📋 Table of Contents
1. [Overview & Purpose](#-overview--purpose)
2. [Concept 1: Priority Queue Task Scheduler](#-concept-1-priority-queue-task-scheduler)
3. [Concept 2: Topological Task Dependency Graph](#-concept-2-topological-task-dependency-graph)
4. [Complexity Analysis Table](#-complexity-analysis-table)
5. [How to Run the Code](#%EF%B8%8F-how-to-run-the-code)

---

## 🔍 Overview & Purpose

As a project management tool built for students, freelancers, and teams, TaskFlow AI relies heavily on sequencing workflows logically. This module translates those systems into Java code:
* **Priority Queue:** Schedules tasks in an optimal sequence based on priority levels, deadlines, and creation histories.
* **Topological Sort:** Resolves task-to-task dependency graphs and detects recursive loops (circular references) that prevent sprint execution.

---

## 🚀 Concept 1: Priority Queue Task Scheduler

### Purpose
In a project workspace, users deal with multiple tasks carrying varied deadlines and urgency tiers. A simple list doesn't scale for scheduling. This module implements a **Priority Scheduler** using a **Binary Min-Heap** representation to retrieve the next most urgent task instantly.

### Order Rules
1. **Urgency Rank:** `Critical` > `High` > `Medium` > `Low`.
2. **Deadline Tie-Breaker:** Earlier due date wins.
3. **Creation Tie-Breaker:** Earlier creation timestamp wins (First-In, First-Out for equal properties).

### Real-world Integration
This logic mirrors the backend query sorting filters. When the AI Copilot builds the **Daily Plan**, it processes tasks in this order to guide the user's focus.

---

## ⛓️ Concept 2: Topological Task Dependency Graph

### Purpose
Tasks are often dependent on others (e.g., "Write API validation" must happen before "Integrate Frontend"). A **Directed Graph** maps these relations where vertices are tasks and directed edges represent dependencies.

### Topological Sort & Cycle Detection
To compute a chronological execution path, we use **Kahn's Algorithm** (Breadth-First Search topological sort):
1. Compute the incoming dependency count (in-degree) for all task vertices.
2. Store vertices with an in-degree of `0` (no preceding dependencies) in a queue.
3. Dequeue a task, add it to the final execution order, and decrement the in-degree of all tasks depending on it.
4. If a depending task's in-degree reaches `0`, enqueue it.
5. If the final ordered list has fewer elements than the total vertices in the graph, it signifies a **circular loop**, and a `CircularDependencyException` is thrown.

---

## 📊 Complexity Analysis Table

| DSA Concept | Operation | Time Complexity | Space Complexity | Rationale |
| :--- | :--- | :---: | :---: | :--- |
| **Priority Queue** | Add Task (Enqueue) | $O(\log N)$ | $O(N)$ | Inserting elements into a Binary Heap takes logarithmic time to bubble up the tree structure. |
| **Priority Queue** | Next Task (Dequeue) | $O(\log N)$ | $O(N)$ | Removing the root element requires reheapification to maintain structural properties. |
| **Priority Queue** | Peek Task | $O(1)$ | $O(N)$ | Inspecting the root element takes constant time. |
| **Graph & Topo Sort** | Build Graph | $O(V + E)$ | $O(V + E)$ | Vertices ($V$) and dependency edges ($E$) are stored in an adjacency list. |
| **Graph & Topo Sort** | Resolve Sort | $O(V + E)$ | $O(V)$ | Every vertex and edge is traversed exactly once during queue-based BFS reductions. |

---

## 🛠️ How to Run the Code

Mentors can run and test both programs directly in the terminal:

### 1. Priority Queue Scheduler Demo
Navigate to the directory and run:
```bash
cd priority-queue
javac *.java
java Main
```

#### Example Output:
```
========================================================
TaskFlow AI - Priority Queue Task Scheduler Demo
========================================================
Adding tasks to scheduler...

Initial queue size: 5

Retrieving tasks in scheduled priority order:

1. Task[ID=T3, Title='Fix Atlas connection timeout', Priority=CRITICAL, DueDate=2026-07-19]
   - Title: Fix Atlas connection timeout
   - Urgency Tier: CRITICAL
   ...
```

### 2. Dependency Graph Topological Sort Demo
Navigate to the directory and run:
```bash
cd graph
javac *.java
java Main
```

#### Example Output:
```
========================================================
TaskFlow AI - Task Dependency Topological Sort Demo
========================================================
--- Scenario 1: Valid Dependency Schedule ---
Successfully resolved execution order!
  Step 1: Design UI
  Step 2: Backend API
  Step 3: Write Docs
  Step 4: Testing
  Step 5: Deployment

--- Scenario 2: Circular Dependency Detection ---
...
SUCCESS: Expected exception caught!
Error Message: Circular dependency detected! A valid scheduling sequence cannot be resolved because some tasks form a dependency loop.
========================================================
```
