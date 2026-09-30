---
topic: DSA
difficulty: medium
---

# Binary Trees and Binary Search Trees Properties

A binary tree is a hierarchical data structure composed of nodes, each having at most two children denoted as `left` and `right`. In a Binary Search Tree (BST), an invariant ordering property is enforced across all subtrees: for any node $N$, every key in $N$'s left subtree is strictly less than $N$'s key, and every key in $N$'s right subtree is strictly greater than $N$'s key. Under balanced conditions, BST operations—search, insertion, and deletion—execute in $O(\log n)$ time, directly proportional to tree height $h$. However, degenerate trees (e.g., sequentially inserted sorted numbers) devolve into linear chains with $O(n)$ search complexity.

Tree traversals are categorized into Depth-First Traversals—Pre-order (Root-Left-Right), In-order (Left-Root-Right), and Post-order (Left-Right-Root)—and Breadth-First / Level-Order Traversal. Notably, performing an in-order traversal over a valid BST yields keys in strictly sorted ascending sequence. Deletion in a BST requires addressing three distinct cases: deleting a leaf (trivial null pointer assignment), deleting a node with a single child (repointing the parent to the child), and deleting a node with two children (replacing the node's value with its in-order successor or predecessor, then recursively deleting that successor).

# Balanced Trees and AVL / Red-Black Trees

To avert tree degeneration and guarantee $O(\log n)$ worst-case time complexity, self-balancing binary search trees enforce structural invariants. An AVL tree is a strictly balanced BST where the height difference (balance factor) between left and right subtrees for any given node is at most 1. Violations triggered during insertion or deletion are immediately corrected via tree rotations: Left Rotation, Right Rotation, Left-Right Rotation, or Right-Left Rotation. Because AVL trees maintain stringent height balancing ($\approx 1.44 \log_2 n$), they offer faster lookups at the expense of more frequent rotations during write-heavy workloads.

Red-Black Trees offer a relaxed balancing guarantee using color attributes (Red or Black) assigned to each node along with specific rules: the root is black, red nodes cannot have red children (no consecutive red nodes), and every path from a node to descendant null leaves must contain identical numbers of black nodes. This ensures the longest path never exceeds twice the length of the shortest path. Due to fewer rotations during insertion and removal, Red-Black Trees serve as the default underlying mechanism for standard library collections like C++ `std::map` and Java `TreeMap`.

# Lowest Common Ancestor and Tree Recursion

The Lowest Common Ancestor (LCA) of two distinct nodes $p$ and $q$ in a tree is defined as the deepest node $T$ that has both $p$ and $q$ as descendants (where a node can be a descendant of itself). In a standard binary tree, LCA can be located in $O(n)$ time using post-order tree recursion: if the root equals null, $p$, or $q$, return root. Recurse into left and right subtrees. If both recursive calls return non-null pointers, the current node is the juncture point and hence the LCA. If only one call is non-null, propagate that non-null ancestor upward.

In a Binary Search Tree, LCA resolution leverages the ordering property to achieve $O(h)$ time without searching both subtrees simultaneously. Starting at the root: if both $p$ and $q$ keys are strictly smaller than the current node's value, the LCA must reside exclusively in the left subtree. If both keys are strictly greater, the LCA must reside in the right subtree. The very first node where $p$ and $q$ split to opposite subtrees (or where the node matches either $p$ or $q$) is definitively the LCA.
