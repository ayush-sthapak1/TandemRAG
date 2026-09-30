---
topic: DSA
difficulty: medium
---

# Sorting Algorithms: Quicksort and Mergesort Analysis

Quicksort is an in-place divide-and-conquer sorting algorithm that selects a pivot element and partitions the input array into two subarrays: elements strictly less than or equal to the pivot on the left, and elements greater than the pivot on the right. With randomized or median-of-three pivot selection, Quicksort achieves average-case time complexity of $O(n \log n)$ and auxiliary space of $O(\log n)$ for recursive call frames. However, pathological pivot selections (e.g., picking the smallest element on an already sorted array using naive Lomuto partitioning) degrade performance to $O(n^2)$ worst-case time complexity.

Mergesort is a stable divide-and-conquer sorting algorithm that recursively bisects an array into halves until single-element base cases are reached, subsequently merging sorted subarrays together using a two-pointer merge subroutine. Mergesort provides an ironclad worst-case, average-case, and best-case time complexity of $O(n \log n)$. However, because merging linked elements within contiguous arrays requires allocating a secondary buffer, standard Mergesort requires $O(n)$ auxiliary space, making it less memory-efficient than Quicksort or Heapsort for in-memory primitive arrays.

# Binary Search Variants and Search Space Reduction

Binary search is an optimal search paradigm that operates on monotonic (sorted or partially ordered) search spaces in $O(\log n)$ time. The search window is defined by boundaries `low` and `high`, calculating the midpoint using `mid = low + Math.floor((high - low) / 2)` to eliminate integer overflow vulnerabilities common in naive `(low + high) / 2` expressions.

Beyond direct key lookups, interviews emphasize boundary discovery:
- Finding First Occurrence (Lower Bound): When `arr[mid] >= target`, collapse the right boundary (`high = mid`) rather than returning immediately, continuing binary reduction until `low == high`.
- Finding Last Occurrence (Upper Bound): When `arr[mid] <= target`, advance the left boundary (`low = mid + 1`).
- Rotated Sorted Array Search: At least one half of the array ($[low, mid]$ or $[mid, high]$) is guaranteed to remain strictly sorted. By comparing `arr[low]` against `arr[mid]`, the algorithm identifies which side is sorted and determines whether `target` falls within that sorted subarray's boundary, eliminating the opposite half in $O(\log n)$ time.

# Binary Search on Solution Space

Binary Search on Answer (or Solution Space) generalizes binary search beyond existing physical data arrays to abstract monotonic functions $f(x) \to \{\text{true}, \text{false}\}$. If a problem asks for the minimum or maximum value $x$ satisfying a complex validity constraint, and the constraint exhibits monotonicity—such that if $x$ is valid, all values $y > x$ are also valid (or vice versa)—the problem can be solved by binary searching over the numeric range $[x_{\min}, x_{\max}]$.

Classic examples include the Capacity To Ship Packages Within D Days, Koko Eating Bananas, and Split Array Largest Sum. In each problem, a predicate function `isValid(candidate)` tests whether an allocation or speed threshold allows completing the task within required constraints in $O(n)$ time. The outer binary search iteratively halves the answer search space over $\log(\text{Range})$ steps, resulting in an optimal overall runtime of $O(n \log(\text{Range}))$.
