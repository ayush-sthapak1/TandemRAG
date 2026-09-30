---
topic: Web / MERN
difficulty: medium
---

# MongoDB Index Architecture and WiredTiger Engine

MongoDB utilizes the WiredTiger storage engine as its default data management tier, organizing indexes as B-Trees stored in cache and on disk. Without indexes, MongoDB must execute a Collection Scan (`COLLSCAN`), inspecting every document in a collection sequentially to satisfy a query. An index restricts search space to an Index Scan (`IXSCAN`), traversing balanced B-Tree keys in logarithmic $O(\log n)$ time.

Every MongoDB collection is automatically provisioned with a unique, immutable index on the `_id` field. Secondary indexes can be created on any scalar field, embedded subdocument, or array attribute (`db.collection.createIndex({ email: 1 })`). MongoDB indexes order keys in ascending (`1`) or descending (`-1`) sort direction, which is particularly relevant when sorting across multiple fields in compound indexes.

# MongoDB Compound Indexes and the ESR Rule

A Compound Index contains references to multiple fields within a single index structure (e.g., `{ organizationId: 1, status: 1, createdAt: -1 }`). To achieve optimal query efficiency and avoid in-memory sorting (`SORT` stage in explain plans), compound indexes should follow the Equality, Sort, Range (ESR) Rule:
1. Equality (E): Place fields tested with exact equality matches (e.g., `{ organizationId: 'org_123', status: 'active' }`) first in the index key definition. This rapidly narrows down the search space to a localized range of B-Tree leaf entries.
2. Sort (S): Place fields used in the sort criteria (e.g., `{ createdAt: -1 }`) immediately after the equality fields. By aligning index order with query sort order, the engine traverses leaf nodes in pre-sorted sequence without buffering documents into RAM.
3. Range (R): Place fields evaluated with inequality operators (e.g., `{ age: { $gte: 21, $lte: 65 } }`) last. Once a range scan begins on a B-Tree, subsequent index fields cannot be used for efficient equality pruning.

# Multikey, TTL, and Atlas Vector Search Indexes

Specialized index types in MongoDB:
- Multikey Indexes: Created automatically when indexing an array field (e.g., `{ tags: 1 }`). MongoDB constructs separate index entries for every distinct element inside the array, allowing direct queries like `{ tags: 'javascript' }`. However, compound multikey indexes cannot contain more than one array field per index.
- Time-To-Live (TTL) Indexes: Single-field indexes on date fields that automatically delete documents after a configured duration (e.g., `{ expireAfterSeconds: 3600 }`). A background thread evaluates TTL expirations every 60 seconds, ideal for user sessions and temporary caching.
- Atlas Vector Search: Integrates approximate nearest neighbor (ANN) vector retrieval using Hierarchical Navigable Small World (HNSW) graphs. Allows querying high-dimensional embedding vectors via the `$vectorSearch` aggregation pipeline stage for AI RAG applications, semantic search, and recommendation systems without exporting data to external vector stores.
