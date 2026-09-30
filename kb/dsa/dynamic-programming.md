---
topic: DSA
difficulty: hard
---

# Dynamic Programming Principles and Memoization vs Tabulation

Dynamic Programming (DP) is an optimization paradigm applied to algorithmic problems exhibiting two indispensable properties: Optimal Substructure and Overlapping Subproblems. Optimal substructure implies an optimal global solution can be constructed from optimal solutions to its constituent subproblems. Overlapping subproblems signifies that naive recursive decomposition repeatedly recomputes identical subproblems exponentially. DP eliminates this redundancy by solving each distinct subproblem once and storing its computed result in a lookup structure.

There are two primary approaches to dynamic programming:
1. Top-Down DP with Memoization: Retains the intuitive recursive structure of the problem, checking a cache (hash map or array) before performing work and writing computed results into the cache before returning. This visits only reachable states, but incurs recursive stack overhead and potential recursion depth limits.
2. Bottom-Up DP with Tabulation: Eliminates recursion entirely by iteratively filling a table in topological dependency order from smallest base cases to final target states. Tabulation avoids call-stack overhead and enables state-compression optimizations (e.g., retaining only the last two rows or previous scalar values), frequently reducing spatial complexity from $O(n)$ or $O(n^2)$ down to $O(1)$ or $O(n)$.

# The 0/1 Knapsack Problem and State Space Formulation

The 0/1 Knapsack problem exemplifies constrained combinatorial optimization. Given $n$ items, each with a positive weight $w_i$ and value $v_i$, alongside a knapsack of capacity $W$, determine the maximum value achievable without exceeding $W$, where each item may either be included (1) or excluded (0) at most once.

Let `dp[i][c]` represent the maximum value achievable considering the first `i` items with a remaining knapsack capacity `c`. The state recurrence relation is:
- If $w[i-1] > c$: item cannot fit, so `dp[i][c] = dp[i-1][c]`.
- Else: `dp[i][c] = max(dp[i-1][c], dp[i-1][c - w[i-1]] + v[i-1])`.
Base cases initialize `dp[0][c] = 0` for all $c \in [0, W]$. The time complexity is $O(n \cdot W)$, which is pseudo-polynomial because it depends on the numerical value of $W$ rather than the bit length of input representation. The space complexity can be reduced from $O(n \cdot W)$ to a single 1D array of size $W+1$ by traversing the capacity iteration in descending reverse order ($W$ down to $w_i$) to prevent using the same item multiple times.

# Longest Common Subsequence and Interval DP

The Longest Common Subsequence (LCS) problem finds the length of the longest subsequence present in both strings $S_1$ (length $m$) and $S_2$ (length $n$) in the same relative order, but not necessarily contiguously. The 2D DP state `dp[i][j]` denotes the LCS length between prefix $S_1[0..i-1]$ and $S_2[0..j-1]$.
- If characters match ($S_1[i-1] == S_2[j-1]$): `dp[i][j] = 1 + dp[i-1][j-1]`.
- If characters mismatch: `dp[i][j] = max(dp[i-1][j], dp[i][j-1])`.
This formulation runs in $O(m \cdot n)$ time and $O(m \cdot n)$ space (compressible to $O(\min(m, n))$ space).

Interval DP extends dynamic programming over contiguous subsegments of an array, parameterized by state `dp[i][j]` representing the optimal cost for the subarray spanning indices $i$ through $j$. Classic examples include Matrix Chain Multiplication, Burst Balloons, and Palindromic Partitioning. In Interval DP, states are computed in order of increasing subsegment length $L$ from 1 to $n$, evaluating split points $k$ between $i$ and $j$ via recurrences such as `dp[i][j] = min_{i <= k < j}(dp[i][k] + dp[k+1][j] + cost(i, k, j))`, running in $O(n^3)$ time complexity.
