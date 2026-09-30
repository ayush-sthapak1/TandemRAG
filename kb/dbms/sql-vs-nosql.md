---
topic: DBMS
difficulty: medium
---

# Relational SQL vs NoSQL Architectural Paradigms

The architectural dichotomy between relational (SQL) and non-relational (NoSQL) databases stems from divergent design priorities regarding schema rigidity, scalability vectors, and consistency guarantees:
- Relational Databases (PostgreSQL, MySQL, Oracle): Rely on structured tabular schemas with fixed column definitions, relational integrity, primary/foreign key constraints, and declarative SQL querying. They prioritize ACID guarantees and complex ad-hoc join operations. Scaling is predominantly vertical (Scale-Up: provisioning larger CPUs, RAM, and NVMe drives), with horizontal read replication requiring complex read/write splitting.
- NoSQL Databases (MongoDB, Cassandra, Redis): Emerged to tackle web-scale horizontal elasticity (Scale-Out: sharding clusters across commodity servers) and flexible, polymorphic data representations. They abandon rigid relational schemas and relational joins in favor of denormalized document, key-value, column-family, or graph data models.

# NoSQL Data Models: Document, Key-Value, Column-Family, and Graph

NoSQL architectures are specialized by data model:
1. Document Stores (MongoDB, Couchbase): Store self-describing, hierarchical JSON/BSON documents. Complex real-world entities are modeled organically with embedded subdocuments and arrays, avoiding expensive multi-table joins. Document stores excel in agile application development with evolving schemas.
2. Key-Value Stores (Redis, DynamoDB): The simplest data model, mapping arbitrary unique string keys to opaque or typed values. Extremely high throughput with sub-millisecond latencies, optimized for session caching, rate-limiting counters, and leaderboard state.
3. Wide-Column Stores (Cassandra, ScyllaDB): Organize data into flexible column families indexed by row key and clustering keys. Optimized for high-velocity append-only write streams and time-series sensor ingestion across massive distributed clusters.
4. Graph Databases (Neo4j): Treat entities as nodes and relationships as first-class edges with properties, executing constant-time pointer-hopping graph traversals for social networks, fraud detection, and recommendation engines.

# The CAP Theorem and BASE Consistency Model

Eric Brewer's CAP Theorem proves that a distributed data store can simultaneously guarantee at most two of the following three properties in the presence of network partitions:
- Consistency (Linearizability): Every read operation receives the most recent write or an error. All nodes see the identical data state simultaneously.
- Availability: Every non-failing node returns a non-error response for every request, without guarantee that it contains the most recent write.
- Partition Tolerance: The system continues to operate despite arbitrary message loss or network latency failures between nodes.

Because physical network hardware failures are inevitable in real-world distributed networks, Partition Tolerance ($P$) is non-negotiable. Consequently, distributed architectures must balance between CP (Consistency + Partition Tolerance, e.g., MongoDB, HBase) or AP (Availability + Partition Tolerance, e.g., Cassandra, DynamoDB).

To describe AP systems, the BASE model contrasts with ACID:
- Basically Available: The distributed system guarantees availability according to SLA, potentially returning degraded or stale state during outages.
- Soft State: Data values may drift over time without user interaction due to background replica synchronization.
- Eventual Consistency: If no further mutations occur, all replicas will eventually converge to identical consistent state.
