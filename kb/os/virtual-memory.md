---
topic: Operating Systems
difficulty: hard
---

# Virtual Memory and Demand Paging

Virtual memory is a fundamental operating system abstraction that provides each process with the illusion of an expansive, contiguous, dedicated memory address space, independent of actual physical RAM capacity. This enables execution of processes whose memory footprints exceed physical RAM, permits higher degrees of multiprogramming, and simplifies program compilation and linking.

Under Demand Paging, pages are loaded into physical RAM only when referenced by CPU execution. Each page table entry contains a valid-invalid bit (Present Bit). When a process attempts to access a page marked invalid (not currently mapped to physical RAM), the MMU hardware triggers a CPU interrupt known as a Page Fault. The kernel page fault handler intercepts the trap, verifies that the address is logically legal, locates the missing page on backing storage (swap partition/SSD), selects a free physical frame (or evicts an existing page if RAM is saturated), reads the page from disk into the frame via DMA, updates the page table entry to valid, and restarts the interrupted CPU instruction.

# Page Replacement Algorithms: FIFO, LRU, and Optimal

When a page fault occurs and no physical memory frames are free, the operating system must execute a Page Replacement Algorithm to choose a victim page to evict:
1. Optimal Algorithm (OPT / Belady's Min): Evicts the page that will not be referenced for the longest duration in the future. OPT yields the mathematically minimal page fault rate, but is impossible to implement in practice because it requires clairvoyant knowledge of future memory accesses. It serves as an empirical theoretical benchmark.
2. First-In, First-Out (FIFO): Evicts the oldest page brought into memory. FIFO is susceptible to Belady's Anomaly—a counter-intuitive phenomenon where allocating more physical memory frames results in an increased number of page faults.
3. Least Recently Used (LRU): Evicts the page that has not been referenced for the longest period, approximating OPT by assuming recent history predicts future locality. Exact LRU requires hardware timestamps or doubly-linked list manipulation on every single memory reference, which is prohibitively costly. Practical systems implement the Clock (Second-Chance) Algorithm, which checks a single hardware reference bit per frame, rotating around a circular buffer to find an unreferenced page.

# Thrashing and Working Set Model

Thrashing is a catastrophic operating system condition where the system spends significantly more time executing page-fault I/O swapping operations than performing productive instruction computation. Thrashing occurs when the aggregate memory demands of all active processes exceed total physical RAM, causing processes to continuously fault, evicting each other's active working pages. As processes block waiting for swap I/O, CPU utilization plummets, prompting naive schedulers to introduce even more processes into the ready queue, exacerbating the collapse.

To prevent thrashing, Peter Denning established the Working Set Model based on the Principle of Locality (programs access a localized set of pages within any short execution interval $\Delta$). A process's working set $W(t, \Delta)$ is the set of distinct pages referenced during the most recent $\Delta$ time units. The OS monitors total working set demand: $D = \sum |W_i|$. If $D$ exceeds total available frames, the OS preemptively suspends one or more entire processes, swapping their pages out to disk, thereby granting remaining active processes sufficient frames to run smoothly without thrashing.
