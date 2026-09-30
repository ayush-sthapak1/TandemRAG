---
topic: DBMS
difficulty: medium
---

# ACID Properties Overview

The ACID acronym formalizes the four fundamental guarantees that a relational Database Management System provides to preserve data reliability in the presence of concurrent execution, hardware faults, network partitions, and software crashes:

- Atomicity ("All or Nothing"): Every transaction is an indivisible unit of work. Either all participating database modifications complete and persist successfully to disk, or the entire transaction is rolled back, leaving the database state pristine as if the transaction had never begun.
- Consistency: A transaction transforms the database from one valid state satisfying all defined database schema constraints (such as primary keys, unique indexes, foreign key relationships, check constraints, and triggers) to another valid state.
- Isolation: The execution of concurrent transactions is isolated from one another so that intermediate, uncommitted state modifications within one transaction are imperceptible to other concurrent transactions.
- Durability: Once a transaction commits, its modifications are permanently recorded in non-volatile storage and will survive subsequent power failures, operating system crashes, or hardware reboots.

# Write-Ahead Logging (WAL) and Durability Implementation

To guarantee both Atomicity and Durability without incurring the catastrophic I/O performance penalty of writing random memory pages to table data files on every single commit, relational databases utilize Write-Ahead Logging (WAL) (termed the redo log in InnoDB or XLOG in PostgreSQL).

The foundational rule of WAL mandates: "No data page modification may be written to non-volatile disk storage until the corresponding log record describing the modification has been written and flushed (`fsync`) to persistent log storage." When a transaction executes modifications:
1. Changes are applied in-memory to cached buffer pool pages (marking them "dirty").
2. Simultaneously, a compact sequential log record specifying old and new values is appended to the WAL buffer.
3. At commit time, only the sequential WAL buffer is synchronously flushed to persistent disk. Because sequential disk writes operate orders of magnitude faster than random disk page flushes, transaction commit latency remains exceptionally low.

# Crash Recovery and the ARIES Algorithm

Algorithms for Recovery and Isolation Exploiting Semantics (ARIES) is the standard crash recovery paradigm for WAL-based database engines. Recovery executes in three sequential passes following a crash:

1. Analysis Pass: The engine scans the WAL forward from the most recent safe Checkpoint record to identify all dirty buffer pool pages at the time of crash and reconstruct the Transaction Table, distinguishing "winner" transactions (committed before crash) from "loser" transactions (active/uncommitted at crash).
2. Redo Pass: Repeating History. The engine scans the WAL forward from the earliest unwritten page modification, replaying all logged operations (both committed and uncommitted) to restore the physical database state precisely to the exact millisecond of system failure.
3. Undo Pass: The engine scans the WAL backward, rolling back the intermediate modifications of all "loser" transactions using compensation log records (CLRs) to ensure undo operations themselves are idempotent if a second crash occurs during recovery.
