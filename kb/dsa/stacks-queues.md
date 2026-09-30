---
topic: DSA
difficulty: medium
---

# Stacks and Queues Architecture

A Stack represents a Last-In, First-Out (LIFO) abstract data type where insertions (`push`) and deletions (`pop`) occur strictly at a single designated boundary known as the top. Common implementations utilize either dynamic arrays or singly linked lists with insertion and removal restricted to the head, yielding guaranteed $O(1)$ operations. Stacks form the foundational mechanism for function call frame allocation, expression evaluation, syntax parsing, and depth-first search execution.

A Queue represents a First-In, First-Out (FIFO) abstract data type where insertions (`enqueue`) occur at the tail (rear) and extractions (`dequeue`) occur at the front (head). When implemented over a fixed-capacity contiguous buffer, queues require circular buffer arithmetic (`index = (index + 1) % capacity`) to prevent index drift and wasteful memory reallocations. Double-ended queues (Deques) generalize this paradigm by supporting amortized $O(1)$ insertions and removals at both endpoints, which is crucial for sliding window maximum algorithms.

# Monotonic Stack and Next Greater Element

A Monotonic Stack is a specialized stack pattern where elements are strictly maintained in either monotonically increasing or monotonically decreasing order. Whenever an incoming element violates the monotonicity condition, existing elements are repeatedly popped until the order is re-established. Despite nested while loops, the overall runtime remains $O(n)$ because every element in the array is pushed onto the stack exactly once and popped at most once.

In the classic Next Greater Element problem, iterating backwards or forwards across an array while maintaining a decreasing stack allows each element to instantly identify its nearest superior neighbor. When an incoming candidate $x$ arrives, all stacked values strictly smaller than $x$ are popped because $x$ dominates them for any preceding elements. The top of the stack then immediately reveals the next greater element for $x$, after which $x$ is pushed onto the stack. Similar logic solves problems like Largest Rectangle in Histogram and Trapping Rain Water.

# Queue Implementation Using Stacks and BFS Traversal

Implementing a FIFO queue using two LIFO stacks (`inStack` and `outStack`) demonstrates algorithmic adaptation under constraint. The `enqueue` operation always pushes incoming items onto `inStack` in $O(1)$ time. When a `dequeue` or `peek` operation occurs, if `outStack` is empty, all elements from `inStack` are iteratively popped and pushed into `outStack`, effectively reversing their sequential order. Elements are then popped directly from `outStack`. Although an individual dequeue may take $O(n)$ in the worst case during a transfer, each item is moved between stacks at most once, yielding an amortized time complexity of $O(1)$.

In Breadth-First Search (BFS) graph and tree traversals, queues are indispensable for level-order exploration. A queue holds nodes at the current depth tier while their direct children are enqueued for subsequent level exploration. BFS guarantees finding the shortest path in unweighted graphs because it explores all vertices at topological distance $k$ before evaluating any vertex at distance $k+1$.
