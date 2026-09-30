---
topic: DBMS
difficulty: hard
---

# Transaction Isolation Levels and Read Phenomena

A transaction is an atomic sequence of database operations executed as a single logical unit of work. To balance consistency against concurrent performance, ANSI/ISO SQL defines four standard Transaction Isolation Levels, designed to prevent specific concurrency anomalies (Read Phenomena):

1. Dirty Read: Transaction $T_1$ modifies a row without committing; Transaction $T_2$ reads this uncommitted value. If $T_1$ subsequently rolls back, $T_2$ has acted on phantom, invalid data.
2. Non-Repeatable Read (Fuzzy Read): Transaction $T_1$ reads a row. Transaction $T_2$ modifies or deletes that row and commits. When $T_1$ rereads the same row, it observes altered data values.
3. Phantom Read: Transaction $T_1$ reads a set of rows matching a predicate range (`WHERE salary > 50000`). Transaction $T_2$ inserts a new row satisfying that predicate and commits. When $T_1$ repeats the range query, a new "phantom" row appears.

The four isolation levels prevent these phenomena as follows:
- Read Uncommitted: Permits Dirty Reads, Non-Repeatable Reads, and Phantom Reads.
- Read Committed: Prevents Dirty Reads; permits Non-Repeatable Reads and Phantom Reads.
- Repeatable Read: Prevents Dirty Reads and Non-Repeatable Reads; permits Phantom Reads (mitigated in InnoDB using next-key locks).
- Serializable: Prevents all read phenomena, enforcing total sequential execution equivalence.

# Two-Phase Locking (2PL) and Strict 2PL

Two-Phase Locking (2PL) is a concurrency control protocol that guarantees conflict serializability of concurrent transaction execution schedules. Under 2PL, a transaction acquires and releases locks in two distinct, non-overlapping phases:
1. Growing Phase: The transaction may acquire new shared (read) or exclusive (write) locks as needed, but is strictly prohibited from releasing any lock.
2. Shrinking Phase: Once the transaction releases its very first lock, it transitions permanently into the shrinking phase. In this phase, it may release existing locks, but cannot acquire any new lock.

Although standard 2PL guarantees serializability, it is vulnerable to Cascading Aborts (Cascading Rollbacks): if transaction $T_1$ releases an exclusive lock during its shrinking phase and later aborts, any transaction $T_2$ that read $T_1$'s intermediate data must also be recursively aborted. To eliminate cascading rollbacks, enterprise engines implement Strict 2PL (or Rigorous 2PL), which mandates holding all exclusive locks (and in Rigorous 2PL, shared locks as well) continuously until the transaction commits or aborts (`COMMIT` or `ROLLBACK`).

# Multi-Version Concurrency Control (MVCC)

Multi-Version Concurrency Control (MVCC) is the dominant concurrency control architecture in modern high-performance databases (PostgreSQL, MySQL InnoDB, Oracle). MVCC's core design philosophy is: "Readers never block writers, and writers never block readers."

Instead of locking data rows during read operations, MVCC maintains multiple historical versions of each row. When a transaction updates a row, the database engine creates a new physical version of the row tagged with transaction creation identifiers (`xmin` in Postgres, `trx_id` and rollback pointers in InnoDB undo logs), while leaving older versions intact. When a reader queries the database, the engine establishes a Transaction Snapshot based on the transaction's isolation level. The query evaluates row visibility by comparing each row version's transaction timestamp against the active snapshot, seamlessly reading the consistent historical image without acquiring read locks.
