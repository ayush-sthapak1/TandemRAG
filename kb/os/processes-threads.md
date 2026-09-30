---
topic: Operating Systems
difficulty: medium
---

# Processes vs Threads Architecture

A process is an executing instance of a computer program endowed with its own isolated virtual address space, containing text (instructions), data (global/static variables), heap (dynamically allocated memory), stack (call frames and local variables), and operating system resources (file descriptors, sockets, security tokens). The operating system maintains process state within a Process Control Block (PCB). Because memory boundaries between distinct processes are strictly isolated by hardware MMU memory protection rings, processes cannot accidentally corrupt each other's memory. Inter-Process Communication (IPC) requires explicit kernel-mediated mechanisms such as pipes, sockets, shared memory, or message queues.

A thread represents the smallest schedulable unit of CPU execution within a process, frequently termed a lightweight process. Multiple threads residing within the same process share the parent process's virtual address space, global data segment, open file handles, and heap. However, each individual thread retains its own private Thread Control Block (TCB), Program Counter (PC), CPU registers set, and private execution stack. Because memory is shared, inter-thread communication is instantaneous without IPC syscalls, but introduces severe race conditions requiring synchronization primitives.

# Context Switching Overhead and Multitasking

A context switch is the fundamental operating system procedure of storing the state of the currently executing process or thread so that execution can be paused and another task resumed or initiated. The context switch sequence involves switching CPU execution into kernel mode, saving registers and the program counter into the active TCB/PCB, running the scheduler algorithm to select the next ready thread, reloading the target task's registers, and returning CPU control to user mode.

Thread context switching within the same process is substantially faster than process context switching because the virtual memory address space remains unchanged. Process context switching mandates invalidating the CPU Translation Lookaside Buffer (TLB) or switching Page Table Base Registers (such as the CR3 register in x86). Flushing the TLB incurs heavy performance degradation because subsequent memory accesses experience cache misses until virtual address mappings are repopulated in hardware cache.

# User-Level Threads vs Kernel-Level Threads

Threads can be scheduled at either user space or kernel space, defining threading models:
1. User-Level Threads (Many-to-One): Thread management routines are bundled entirely inside a user-space runtime library without kernel awareness. Thread creation, switching, and destruction avoid expensive trap syscalls. However, if any thread issues a blocking I/O syscall, the entire parent process blocks in the kernel, and the OS cannot schedule separate user threads across multiple physical CPU cores.
2. Kernel-Level Threads (One-to-One): The operating system kernel manages thread lifecycles directly. The kernel independently schedules individual threads onto distinct processor cores, realizing true parallel multiprocessing. Blocking syscalls on one thread do not hinder the execution of sibling threads. This is the architecture utilized by Linux (`pthreads` via `clone`), Windows, and macOS.
3. Hybrid Model (Many-to-Many / M:N): Maps $M$ user green threads onto $N$ kernel worker threads (such as Go goroutines or Erlang actors), providing lightweight user-space scheduling paired with multi-core kernel dispatching.
