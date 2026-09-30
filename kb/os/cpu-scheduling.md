---
topic: Operating Systems
difficulty: medium
---

# CPU Scheduling Criteria and Principles

CPU scheduling is the process by which the operating system scheduler allocates CPU time slices to runnable processes residing in the ready queue. The primary objective is to maximize resource utilization while ensuring equitable latency and throughput. Schedulers are characterized as either Non-Preemptive (cooperative, where a process retains the CPU until it voluntarily yields or blocks for I/O) or Preemptive (where timer interrupts enable the kernel to forcefully wrest CPU control away from an executing process to run a higher-priority task).

Key metrics for evaluating scheduling algorithms include:
- CPU Utilization: Percentage of time the processor is actively executing instructions.
- Throughput: Number of completed processes per unit time.
- Turnaround Time: Total elapsed interval from process submission to process termination (`Turnaround = Completion Time - Arrival Time`).
- Waiting Time: Total duration a process spends languishing in the ready queue awaiting CPU dispatch (`Waiting Time = Turnaround Time - Burst Time`).
- Response Time: Time from initial process arrival to the first dispatch of CPU execution.

# Classical Scheduling Algorithms: FCFS, SJF, and Round Robin

Common classic scheduling algorithms demonstrate distinct trade-offs:
1. First-Come, First-Served (FCFS): Non-preemptive queue that allocates the CPU in arrival order. While simple, FCFS suffers heavily from the Convoy Effect, where small I/O-bound processes wait indefinitely behind a single massive CPU-bound process, degrading overall system response time.
2. Shortest Job First (SJF) and Shortest Remaining Time First (SRTF): SJF dispatches the process with the shortest upcoming CPU burst time. SRTF is the preemptive variant: if a new process arrives with a remaining burst shorter than the currently executing process, the current process is preempted. SJF/SRTF yields provably minimal average waiting time, but risks starvation for long processes and requires estimating future burst lengths using exponential smoothing.
3. Round Robin (RR): Preemptive algorithm designed specifically for time-sharing systems. Each process is granted a fixed quantum (time slice, typically 10–100ms). If a process does not complete within its quantum, a timer interrupt fires, and the process is cycled to the tail of the ready queue.

# Multi-Level Feedback Queue and Linux Completely Fair Scheduler

The Multi-Level Feedback Queue (MLFQ) is an adaptive scheduling algorithm that dynamically adjusts process priorities based on observed runtime behavior without requiring a priori knowledge of burst lengths:
- It maintains multiple priority queues, with higher queues having shorter time quanta.
- New processes enter the highest priority queue.
- If a process consumes its full quantum without blocking (CPU-bound), it is demoted to a lower priority queue.
- If a process voluntarily yields the CPU before exhausting its quantum (interactive or I/O-bound), it remains in or is promoted to higher priority queues.
- Periodic priority boosting shifts all processes back to the top queue to prevent starvation.

In modern Linux, the Completely Fair Scheduler (CFS) implements $O(\log n)$ scheduling using a Red-Black Tree keyed on `vruntime` (virtual runtime). Each task accumulates `vruntime` scaled inversely by its nice level (priority). CFS always dispatches the leftmost node in the tree—the process that has received the least virtual CPU time—thereby providing optimal execution fairness across all competing tasks.
