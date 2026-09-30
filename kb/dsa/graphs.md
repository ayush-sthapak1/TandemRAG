---
topic: DSA
difficulty: hard
---

# Graph Representations and Basic Traversals

A graph $G = (V, E)$ consists of a set of vertices $V$ connected by edges $E$, which may be directed or undirected, weighted or unweighted. The two canonical memory representations are Adjacency Matrices and Adjacency Lists. An adjacency matrix consumes $O(|V|^2)$ space and facilitates $O(1)$ edge existence checks, but is inefficient for sparse graphs. An adjacency list consumes $O(|V| + |E|)$ space, storing for each vertex an array or linked list of outgoing neighbors, which aligns optimal performance with graph exploration algorithms.

Breadth-First Search (BFS) explores neighbors concentrically level-by-level using a FIFO queue and a `visited` hash set or boolean array, yielding $O(|V| + |E|)$ time and identifying unweighted shortest paths. Depth-First Search (DFS) traverses along candidate branches as deep as possible before backtracking, naturally implemented through system recursion or an explicit LIFO stack. DFS is instrumental for finding connected components, detecting cycles, evaluating reachability, and computing graph bridges and articulation points.

# Topological Sorting and Cycle Detection in Directed Graphs

Topological sorting produces a linear ordering of vertices in a Directed Acyclic Graph (DAG) such that for every directed edge $u \to v$, vertex $u$ precedes $v$ in the ordering. If a graph contains even a single directed cycle, a valid topological sort is impossible. Topological sort is fundamental for dependency resolution pipelines, compiler build order systems, and task scheduling.

Two primary algorithms execute topological sorting in $O(|V| + |E|)$ time:
1. Kahn's Algorithm (BFS-based): Compute the in-degree of all vertices. Push all vertices with an in-degree of 0 into a queue. Iteratively dequeue vertex $u$, append it to the topological order, and decrement the in-degrees of all adjacent neighbors $v$. Whenever neighbor $v$'s in-degree reaches 0, enqueue $v$. If the count of processed vertices equals $|V|$, a valid topological sort exists; otherwise, a cycle is present.
2. DFS-based Post-Order Algorithm: Maintain a three-state visitation array (`UNVISITED`, `VISITING`, `VISITED`). Recursively explore nodes in `VISITING` status. If an edge encounters a neighbor marked `VISITING`, a back-edge (cycle) is detected. Once all children are exhaustively processed, mark the node `VISITED` and push it onto a stack or prepend it to the result list.

# Shortest Path Algorithms: Dijkstra and Bellman-Ford

Dijkstra's algorithm computes single-source shortest paths on non-negative weighted graphs in $O((|V| + |E|) \log |V|)$ time using a min-priority queue (min-heap). Starting with source distance 0 and all other distances initialized to infinity, the algorithm greedily extracts the vertex $u$ possessing minimum tentative distance. It then relaxes all outgoing edges $(u, v, w)$: if `dist[u] + w < dist[v]`, update `dist[v] = dist[u] + w` and push the updated distance-vertex pair into the priority queue. Because Dijkstra assumes greedy optimality once a vertex is extracted, it fails completely on graphs containing negative edge weights.

The Bellman-Ford algorithm accommodates arbitrary negative edge weights and detects negative-weight cycles in $O(|V| \cdot |E|)$ time. It relaxes every edge in the graph $|V| - 1$ consecutive times, because a simple shortest path in a graph with $|V|$ vertices can contain at most $|V| - 1$ edges. If an additional relaxation pass further reduces any vertex distance, a negative-weight cycle exists, indicating that paths can arbitrarily decrease without bounded minimum.
