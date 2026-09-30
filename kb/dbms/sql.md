---
topic: DBMS
difficulty: medium
---

# SQL Execution Order and Relational Operations

Structured Query Language (SQL) is a declarative domain-specific language designed for querying and managing data in relational database systems. Although SQL statements are written starting with the `SELECT` clause, the database query execution engine evaluates clauses in a strictly defined logical execution sequence:
1. `FROM` and `JOIN`: Resolves candidate tables, evaluates Cartesian products, and applies `ON` join predicates to synthesize the primary virtual working table.
2. `WHERE`: Filters individual rows prior to grouping, discarding rows violating the boolean predicate (cannot access aggregate functions).
3. `GROUP BY`: Partitions the filtered rows into discrete buckets based on specified grouping column values.
4. `HAVING`: Filters grouped summary buckets, evaluating filter predicates on aggregate calculations (`HAVING COUNT(*) > 5`).
5. `SELECT`: Evaluates projection expressions, column aliases, and window calculations.
6. `DISTINCT`: Eliminates duplicate projection rows.
7. `ORDER BY`: Sorts the resulting dataset using in-memory sort buffers or disk-backed merge sort.
8. `LIMIT` / `OFFSET`: Restricts the final row count and applies pagination boundaries.

# SQL Joins Mechanisms: Inner, Left, Right, Full, and Hash Joins

Relational joins combine columns from one or more tables based on logical relationships:
- `INNER JOIN`: Returns exclusively those rows where there is a satisfying match in both participating tables.
- `LEFT (OUTER) JOIN`: Preserves all rows from the left table; unmatched columns from the right table are populated with `NULL`.
- `RIGHT (OUTER) JOIN`: Preserves all rows from the right table, populating missing left table columns with `NULL`.
- `FULL (OUTER) JOIN`: Combines the results of both Left and Right joins, preserving all rows from both sides and filling unmatched attributes with `NULL`.
- `CROSS JOIN`: Computes the Cartesian product of two tables, producing $N \times M$ combinations.

At the physical database engine level, joins are executed using one of three fundamental physical join algorithms:
1. Nested Loop Join: Scans the outer table row by row, performing index lookups or full scans on the inner table ($O(N \times M)$ or $O(N \log M)$ with index).
2. Hash Join: Builds an in-memory hash table on the smaller table's join keys, then streams the larger table probing the hash table in $O(N + M)$ time.
3. Sort-Merge Join: Sorts both tables on join keys if not already ordered, then synchronously merges them using a two-pointer scan in $O(N \log N + M \log M)$ time.

# Window Functions and Common Table Expressions (CTEs)

Window Functions perform calculations across a set of table rows related to the current row without collapsing the rows into a single summary output, unlike standard `GROUP BY` operations. The `OVER` clause defines the window partitioning and ordering:
- Ranking Functions: `ROW_NUMBER()` (assigns unique sequential integers), `RANK()` (assigns identical rank to ties, leaving gaps), and `DENSE_RANK()` (assigns identical rank to ties without gaps).
- Value Functions: `LEAD()` and `LAG()` access subsequent or preceding rows at specified offsets, essential for time-series delta calculations.
- Aggregation Windows: `SUM(amount) OVER (PARTITION BY user_id ORDER BY created_at)` computes running cumulative totals.

Common Table Expressions (CTEs) defined via the `WITH` clause construct temporary, named result sets that exist solely within the execution scope of a single query. CTEs dramatically enhance query readability over deeply nested subqueries and enable Recursive CTEs—indispensable for traversing hierarchical data structures such as organizational reporting trees or graph networks.
