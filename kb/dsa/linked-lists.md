---
topic: DSA
difficulty: medium
---

# Singly and Doubly Linked List Mechanics

A linked list is a linear collection of data elements where order is determined not by physical memory adjacency, but by explicit memory pointers stored within each node. A standard singly linked node encapsulates a value payload and a `next` pointer directed toward the successor node, whereas a doubly linked node incorporates both `next` and `prev` pointers, facilitating bidirectional traversal. Because nodes are individually allocated across non-contiguous heap memory, linked lists lack CPU cache locality compared to contiguous arrays, resulting in higher cache misses during traversal.

Insertion and deletion at known node locations operate in $O(1)$ constant time by simply updating pointer references, avoiding the $O(n)$ data shifting mandated by arrays. However, random access requires $O(n)$ sequential pointer chasing from the `head` pointer. In technical interviews, sentinel or dummy head nodes are standard architectural patterns that eliminate complex edge cases when mutating head nodes or operating on empty lists.

# Floyd's Cycle Detection and Fast-Slow Pointers

Floyd's cycle-finding algorithm, commonly known as the tortoise and hare algorithm, determines whether a linked list contains a cycle using $O(1)$ auxiliary space and $O(n)$ time. The algorithm initializes two pointers at the head: a slow pointer advancing one step per iteration (`slow = slow.next`) and a fast pointer advancing two steps (`fast = fast.next.next`). If the list is acyclic, `fast` or `fast.next` encounters null termination; if a loop exists, the fast pointer will inevitably lap and collide with the slow pointer inside the cycle.

To locate the exact node where the cycle begins, once the initial collision occurs, reset the slow pointer back to the list head while keeping the fast pointer at the meeting position. Then, advance both pointers one step at a time at equal velocity. By mathematical proof, the distance from the head to the cycle start equals the distance from the meeting point around the cycle to the cycle start modulo cycle length. The two pointers will meet exactly at the cycle entrance node.

# In-Place Linked List Reversal Techniques

Reversing a singly linked list in-place in $O(n)$ time and $O(1)$ space is a cornerstone interview problem. The standard iterative technique maintains three tracking pointers: `prev` (initialized to null), `curr` (initialized to `head`), and `nextTemp` (used to preserve the forward pointer chain before overwriting). In each iteration, `nextTemp = curr.next`, `curr.next = prev`, `prev = curr`, and `curr = nextTemp`. Traversal terminates when `curr` becomes null, at which point `prev` designates the new head of the reversed sequence.

For sublist reversal between indices $m$ and $n$, a dummy node prefixed before head simplifies boundary tracking. A pointer traverses to node $m-1$, and iterative head-insertion shifts each succeeding node within the range directly behind $m-1$. Recursive implementations can also invert linked lists by recursing down to the tail node and propagating the reversal backwards, but require $O(n)$ call stack frames, violating constant space constraints.
