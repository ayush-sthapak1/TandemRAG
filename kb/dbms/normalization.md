---
topic: DBMS
difficulty: medium
---

# Database Normalization Goals and Anomalies

Database Normalization is a systematic relational database design technique that decomposes tables to eliminate data redundancy and preclude operational anomalies while maintaining data integrity through lossless decomposition and dependency preservation. Unnormalized schemas suffer from three severe anomalies:
- Insertion Anomaly: Inability to insert legitimate data regarding one entity without simultaneously inserting unrelated data regarding another entity (e.g., cannot register a new course unless at least one student is enrolled).
- Deletion Anomaly: Unintended loss of crucial independent data caused by deleting unrelated data (e.g., deleting the last student enrolled in a course inadvertently erases all record of that course's existence).
- Update Anomaly: Inconsistency that emerges when redundant data exists across multiple rows and an update modifies some rows but misses others, leaving the database in a contradictory state.

# Normal Forms: 1NF, 2NF, and 3NF

Relational normalization proceeds through progressive tiers of mathematical constraints based on functional dependencies ($X \to Y$, where attribute set $X$ uniquely determines $Y$):
1. First Normal Form (1NF): Requires that every column contain only atomic (indivisible) values, eliminating repeating groups, multivalued attributes, or nested relational arrays. Every row must be uniquely identifiable via a defined primary key.
2. Second Normal Form (2NF): Satisfies 1NF and contains no Partial Functional Dependencies. Every non-prime attribute (an attribute not part of any candidate key) must be fully functionally dependent on the entire primary key. Partial dependencies arise when a composite primary key exists and an attribute depends on only a subset of that composite key. To reach 2NF, partially dependent attributes are extracted into a separate table.
3. Third Normal Form (3NF): Satisfies 2NF and contains no Transitive Functional Dependencies. If $X \to Y$ and $Y \to Z$, where $X$ is a candidate key and $Z$ is a non-prime attribute, $Z$ transitively depends on $X$ through $Y$. Formally, for every non-trivial functional dependency $X \to A$, either $X$ is a superkey, or $A$ is a prime attribute.

# Boyce-Codd Normal Form (BCNF) and Denormalization

Boyce-Codd Normal Form (BCNF) is a stricter variant of 3NF that eliminates anomalies arising when multiple overlapping candidate keys exist. A relation is in BCNF if and only if for every non-trivial functional dependency $X \to Y$, the determinant $X$ is strictly a Superkey. Unlike 3NF, BCNF does not permit an exception where the dependent attribute $Y$ is prime. Consequently, decomposing certain schemas into BCNF may sacrifice dependency preservation, necessitating a calculated engineering trade-off.

Denormalization is the deliberate re-introduction of redundancy into a normalized schema to optimize read query performance in read-heavy online transaction processing (OLTP) or analytical (OLAP) workloads. In highly normalized schemas, executing complex queries requires expensive multi-table relational `JOIN` operations across foreign keys, degrading latency and throughput. Denormalization reduces join overhead by pre-aggregating or duplicating attributes into parent tables. However, architects must safeguard consistency through database triggers, application-level transactions, or background synchronization pipelines.
