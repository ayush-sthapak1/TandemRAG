---
topic: Operating Systems
difficulty: hard
---

# Critical Section Problem and Race Conditions

A race condition occurs in concurrent systems when multiple threads or processes concurrently read and mutate shared mutable state, such that the final outcome depends unpredictably on the arbitrary interleaving of thread execution order. The segment of code accessing this shared state is designated the Critical Section.

To solve the Critical Section problem, any correct synchronization protocol must satisfy three indispensable properties:
1. Mutual Exclusion: If thread $T_i$ is executing inside its critical section, no other thread may enter that critical section simultaneously.
2. Progress: If no thread is executing inside the critical section and some threads desire to enter, only those threads not executing in their remainder sections can participate in deciding which enters next, and this selection cannot be postponed indefinitely.
3. Bounded Waiting: There must exist a bound on the number of times other threads are permitted to enter their critical sections after a thread has requested entry before that request is granted, precluding starvation.

# Mutexes, Semaphores, and Spinlocks

Operating systems provide hardware-assisted and software synchronization primitives:
- Spinlocks: The thread repeatedly polls a lock variable inside a busy-wait `while` loop until it succeeds in acquiring the lock. Spinlocks utilize atomic CPU instructions like Test-and-Set or Compare-and-Swap (CAS). Spinlocks are optimal for very short wait durations on multiprocessor architectures where context-switch overhead exceeds the spin duration, but waste CPU cycles if held for extended operations.
- Mutex (Mutual Exclusion Lock): A binary locking mechanism with ownership semantics. Only the thread that locks a mutex is permitted to unlock it. If the mutex is unavailable, the calling thread is placed onto a sleep wait-queue, yielding CPU execution until woken by the kernel when the mutex becomes available.
- Semaphore: A signaling mechanism introduced by Dijkstra maintaining an integer counter and two atomic primitives: `wait()` (or `P()`, which decrements counter, blocking if counter $\le 0$) and `signal()` (or `V()`, which increments counter and awakens waiting threads). Counting semaphores govern access to a pool of $N$ finite resources, while binary semaphores (counter initialized to 1) enforce mutual exclusion without strict thread ownership.

# Classical Synchronization Problems

Operating systems theory formalizes concurrency patterns through classic canonical synchronization problems:
1. Producer-Consumer (Bounded Buffer): Producers generate items and push them to a fixed-size buffer, while consumers extract items. Requires synchronization using two counting semaphores (`emptyBuffers` initialized to $N$, `fullBuffers` initialized to 0) and one binary mutex protecting the shared buffer queue to prevent buffer overflow and underflow.
2. Readers-Writers Problem: Multiple reader threads can concurrently read a shared dataset without hazard, but writers require exclusive, isolated access. Solutions prioritize either reader throughput (risking writer starvation) or writer fairness (queuing subsequent readers once a writer signals intent).
3. Dining Philosophers: Illustrates deadlock and starvation in circular resource allocation graphs, solved via asymmetric seating rules, resource hierarchy ordering, or atomic multi-lock acquisition.
