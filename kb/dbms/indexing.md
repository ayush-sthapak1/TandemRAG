---
topic: DBMS
difficulty: medium
---

# B-Trees and B+ Trees Index Architecture

A database index is an auxiliary data structure that enhances the speed of data retrieval operations on a database table at the cost of additional storage space and slower write operations (inserts, updates, and deletes). The predominant indexing structure across modern relational engines (PostgreSQL, MySQL InnoDB, Oracle) is the B+ Tree—a self-balancing, multi-way search tree optimized for disk block storage systems.

In a B+ Tree:
- Non-leaf internal nodes contain only search routing keys and child disk pointers; they never store row data records. This enables high branching factors (fan-out), meaning each disk block can hold hundreds of keys, keeping the tree remarkably flat (often height 3 or 4 for millions of records).
- All actual data records or row pointers reside exclusively in leaf nodes.
- Leaf nodes are linked sequentially via bidirectional pointers, enabling exceptionally fast contiguous range scans (`WHERE age BETWEEN 25 AND 35`) with simple sequential disk read-aheads, without requiring costly tree backtracking.

# Clustered vs Non-Clustered Indexes

Database indexes are categorized by how they interact with physical on-disk table storage:
1. Clustered Index: Dictates the physical storage order of the actual table rows on disk blocks. Because physical rows can only be ordered in a single physical sequence, a table can have at most one clustered index (typically assigned automatically to the Primary Key). The leaf nodes of a clustered index contain the complete actual row data. As a result, searching a clustered index requires zero additional secondary lookups.
2. Non-Clustered (Secondary) Index: Maintains a separate auxiliary B+ Tree structure independent of the physical row arrangement. The leaf nodes of a non-clustered index contain the indexed column values and a row locator. In engines like MySQL InnoDB, this row locator is the clustered primary key; in heap-organized tables like PostgreSQL, it is a tuple identifier (TID / RID pointing to the heap file block and offset).
3. Bookmark Lookup / Heap Access: When a query requests columns not present in the non-clustered index, the engine must use the row locator to fetch the remaining data from the clustered index or heap, adding random I/O overhead.

# Covering Indexes and Composite Index Leftmost Prefix Rule

A Covering Index is an index design optimization where all columns referenced by a query (in the `SELECT`, `WHERE`, `JOIN`, and `ORDER BY` clauses) are included directly within the index itself. When a covering index matches, the query optimizer satisfies the query exclusively from the index tree without performing secondary bookmark lookups on table rows (indicated as `Using index` in query execution plans), yielding dramatic throughput gains.

A Composite (Compound) Index indexes multiple columns simultaneously, such as `INDEX idx_user (status, created_at, user_id)`. Composite indexes operate strictly under the Leftmost Prefix Rule:
- Queries can utilize the index if their `WHERE` predicates include leading prefixes of the composite index in order: `(status)`, `(status, created_at)`, or `(status, created_at, user_id)`.
- If a query filters on `created_at` alone, the index cannot be utilized for point lookups because the tree is sorted primarily by `status`.
- Range conditions (`<`, `>`, `BETWEEN`) truncate composite index utility: once an index column encounters a range filter, subsequent columns in the composite index cannot be used for direct index lookups.
