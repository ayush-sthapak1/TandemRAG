---
topic: DSA
difficulty: medium
---

# Array Data Structure Fundamentals

An array is a contiguous block of allocated memory containing elements of identical type, directly indexable through zero-based arithmetic. Because memory addresses are contiguous, accessing any element given its index `i` operates in strictly $O(1)$ time complexity using the base pointer formula `Address(i) = BaseAddress + (i * ElementSize)`. However, this rigid memory layout incurs severe tradeoffs when resizing or inserting elements into the middle or front of the array, requiring an $O(n)$ data shift operation to maintain contiguous alignment.

When candidates analyze arrays in interviews, they must differentiate between fixed-size static arrays (allocated on the stack or fixed heap segment) and dynamically resizable arrays like C++ `std::vector`, Java `ArrayList`, or Python `list`. Dynamic arrays double their capacity when reaching maximum threshold, giving append operations an amortized $O(1)$ time complexity, despite individual reallocation operations requiring $O(n)$ copy steps.

# Two-Pointer and Sliding Window Techniques

The two-pointer pattern and sliding window algorithm are fundamental optimization strategies used to reduce naive $O(n^2)$ nested loop iterations down to $O(n)$ linear runtime on linear data structures. Two pointers can traverse an array in opposing directions (such as left from index 0 and right from $n-1$ for sorted pair sum or palindrome checks) or in the same direction at varying velocities (known as fast-and-slow pointers or Floyd's cycle detection algorithm).

A sliding window maintains a contiguous subsegment $[L, R]$ of the array defined by two boundary pointers. In fixed-size windows, the right boundary expands while the left boundary advances synchronously once the window length is satisfied, allowing instantaneous metric updates (e.g., maintaining maximum sum over $k$ elements). In variable-size windows, the right boundary expands until an invariant condition is violated (such as maximum allowed distinct characters), at which point the left boundary shrinks until the invariant is restored.

# Prefix Sum and Kadane's Algorithm for Subarrays

Prefix sums preprocess an array of size $n$ into an auxiliary array $P$ where $P[i] = \sum_{j=0}^{i} A[j]$, enabling arbitrary range sum queries $\sum_{k=L}^{R} A[k] = P[R] - P[L-1]$ in constant $O(1)$ time after an initial $O(n)$ preprocessing step. This pattern is exceptionally valuable when solving subarray problems involving hash maps to locate subarrays whose sum equals a target value $k$ by checking whether $P[i] - k$ has been previously encountered.

Kadane's algorithm solves the Maximum Subarray problem in strict $O(n)$ time and $O(1)$ auxiliary space by leveraging dynamic programming principles without maintaining an explicit table. At every element $x$, the algorithm makes an optimal greedy decision: either extend the current contiguous subarray sum by adding $x$ (`currentMax = currentMax + x`), or discard previous accumulations and start a fresh contiguous subarray starting at $x$ (`currentMax = max(x, currentMax + x)`). The global maximum across all step evaluations represents the final solution.
