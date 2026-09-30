---
topic: Operating Systems
difficulty: hard
---

# Coffman Conditions for Deadlock

A deadlock is a permanent stall state in a concurrent environment where a set of processes are blocked because every process holds at least one resource and is waiting to acquire another resource currently held by another process in that same set. According to the Coffman conditions, a system deadlock can materialize if and only if all four of the following conditions hold simultaneously:

1. Mutual Exclusion: At least one resource must be held in a non-shareable mode (only one process can use the resource at any given time).
2. Hold and Wait: A process must concurrently hold at least one resource while waiting to acquire additional resources held by other processes.
3. No Preemption: Resources cannot be forcibly seized from a process holding them; they can only be released voluntarily after that process finishes its task.
4. Circular Wait: A closed chain of processes $\{P_0, P_1, \dots, P_n\}$ must exist such that $P_0$ waits for a resource held by $P_1$, $P_1$ waits for $P_2$, and $P_n$ waits for $P_0$.

# Deadlock Prevention and Avoidance

Deadlock mitigation strategies are categorized by their intervention timing:
- Deadlock Prevention: Eliminates deadlock by structurally invalidating at least one of the four Coffman conditions beforehand. For instance, eliminating "Circular Wait" by imposing a strict global total ordering on all resource identifiers and requiring processes to acquire resources strictly in ascending order ($R_1 < R_2 < R_3$). Eliminating "Hold and Wait" by requiring processes to request and obtain all required resources atomically at initialization.
- Deadlock Avoidance: Allows dynamic resource requests but dynamically monitors system states to ensure the system never transitions into an "Unsafe State". A state is safe if there exists a safe execution sequence $\langle P_1, P_2, \dots, P_n \rangle$ where every process can satisfy its maximum remaining resource demands using currently available resources plus resources released by preceding processes.

# Banker's Algorithm and Deadlock Recovery

Dijkstra's Banker's Algorithm is the definitive deadlock avoidance algorithm for systems managing multiple instances of finite resource types. The system tracks matrices:
- `Available[m]`: count of unallocated resources of each type.
- `Max[n][m]`: maximum resource demands declared by each process upfront.
- `Allocation[n][m]`: currently assigned resources per process.
- `Need[n][m] = Max[n][m] - Allocation[n][m]`: remaining resources needed to complete.

When process $P_i$ issues request `Request[i]`:
1. Verify `Request[i] <= Need[i]`, otherwise throw error (exceeding declared maximum).
2. Verify `Request[i] <= Available`, otherwise $P_i$ must wait.
3. Tentatively simulate resource allocation:
   `Available -= Request[i]`, `Allocation[i] += Request[i]`, `Need[i] -= Request[i]`.
4. Run the Safety Algorithm. If safe, approve allocation; if unsafe, roll back and make $P_i$ wait.

Deadlock Detection and Recovery: Schedulers periodically inspect Resource Allocation Graphs for cycles. If deadlock is detected, the OS recovers by either process termination (aborting all deadlocked processes or aborting one-by-one until cycles dissolve) or resource preemption (rolling back a victim process to a previous checkpoint and reclaiming its resources).
