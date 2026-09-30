---
topic: Operating Systems
difficulty: medium
---

# Contiguous Memory Allocation and Fragmentation

Memory management governs the allocation, tracking, and protection of primary physical RAM across competing processes. In early contiguous allocation schemes, each process occupied a single contiguous block of physical memory. The operating system utilizes Base and Limit registers inside the hardware Memory Management Unit (MMU) to enforce address isolation: the base register holds the starting physical address, and the limit register specifies the partition size. If a process attempts to read or write an address beyond `base + limit`, a CPU segmentation trap occurs.

Contiguous allocation inevitably engenders memory fragmentation:
- Internal Fragmentation: Occurs when fixed-size memory partitions are assigned to a process requiring less memory than the block provides, leaving unused, wasted memory trapped inside the assigned partition.
- External Fragmentation: Occurs when free physical memory is broken into numerous tiny non-contiguous blocks scattered throughout RAM. Although total free memory may exceed a requesting process's demand, no single contiguous hole is large enough. Dynamic allocation strategies (First-Fit, Best-Fit, Worst-Fit) attempt to minimize external fragmentation, but complete resolution requires costly physical memory compaction.

# Paging Architecture and Hardware Address Translation

Paging eliminates external fragmentation by decoupling logical program addresses from physical memory locations. Physical RAM is partitioned into fixed-size blocks termed Frames (typically 4 KB). Logical address space is partitioned into contiguous blocks of identical dimensions termed Pages. Because any logical page can be mapped to any arbitrary physical frame anywhere in RAM, memory need not be physically contiguous.

The CPU hardware MMU translates a logical address composed of a Page Number ($p$) and Page Offset ($d$):
1. The page number $p$ indexes into the process's Page Table.
2. The page table entry yields the corresponding physical Frame Number ($f$).
3. The physical address is constructed as $(f \times \text{FrameSize}) + d$.
Page tables also store permission bits: Present/Absent, Read/Write, User/Kernel, and Dirty bits.

# Translation Lookaside Buffer (TLB) and Multi-Level Paging

Because the page table itself resides in physical RAM, a naive address lookup requires two physical memory accesses for every single instruction: one to read the page table entry, and a second to access the actual data operand. This halves effective memory throughput. To eliminate this bottleneck, the CPU incorporates the Translation Lookaside Buffer (TLB)—a fast, associative hardware associative cache for recent page-to-frame translations.

When the CPU issues an address:
- TLB Hit: The frame number is retrieved instantaneously from the TLB in $<1$ clock cycle.
- TLB Miss: The MMU walks the page table in RAM, loads the translation, updates the TLB, and accesses the target frame.
In modern 64-bit architectures with enormous address spaces ($2^{64}$ bytes), a flat page table would consume petabytes. Modern systems implement Multi-Level (Hierarchical) Paging (e.g., 4-level or 5-level page tables like x86-64 PML4), allocating page table branches dynamically on-demand only for address spaces the process actively uses.
