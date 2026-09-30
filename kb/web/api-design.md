---
topic: Web / MERN
difficulty: medium
---

# API Design Principles and Resource Modeling

API design governs the structural and contractual interface through which software systems communicate. Well-designed APIs prioritize predictability, consistency, ergonomics, and developer experience (DX). Key principles of modern RESTful resource modeling include:
- Nouns over Verbs: Use plural nouns for resource collections (`/api/v1/users`, `/api/v1/orders`), mapping business actions to standard HTTP verbs (`GET` for retrieval, `POST` for creation, `DELETE` for removal) rather than embedding verbs in endpoints (avoid `/api/v1/getUsers` or `/api/v1/deleteUser`).
- Hierarchical Sub-Resources: Model relational ownership cleanly using path nesting: `/api/v1/users/:userId/orders` represents orders belonging exclusively to a specific user. Avoid nesting beyond two levels (e.g., avoid `/users/:id/orders/:id/items/:id/discounts`); flatten deep relationships to top-level resource paths filtered by query parameters (`/api/v1/order-items?orderId=...`).
- Consistent Payload Envelopes: Wrap responses in predictable JSON envelopes distinguishing data payloads from metadata:
  ```json
  {
    "success": true,
    "data": { ... },
    "meta": { "page": 1, "limit": 20, "total": 142 }
  }
  ```

# API Versioning, Pagination, and Filtering Strategies

Production APIs anticipate change and scale through standardized patterns:
- Versioning: Expose the major API version in the URI path (`/api/v1/...`). URI versioning provides explicit routing clarity and prevents backward-incompatible breaking changes from disrupting legacy client applications. Alternative versioning strategies include custom request headers (`Accept-Version: 1.0.0`) or MIME-type content negotiation.
- Offset-Based Pagination: Uses `limit` and `offset` query parameters (`?limit=20&offset=40`). Simple to implement with database `LIMIT 20 OFFSET 40`, but degrades to $O(N)$ full scans at large offsets and suffers from skipped or duplicate rows when concurrent insertions or deletions occur during pagination.
- Cursor-Based (Keyset) Pagination: Uses an opaque, encoded cursor token pointing to the last evaluated record's sort keys (e.g., `?limit=20&cursor=eyJpZCI6MTQyLCJjcmVhdGVkQXQiOjE3MD...`). The database query translates to `WHERE (created_at, id) < (cursor_date, cursor_id) ORDER BY created_at DESC, id DESC LIMIT 20`, leveraging index seeking in constant $O(1)$ time regardless of pagination depth.

# Idempotency Keys and Webhooks Reliability

Reliability patterns in mission-critical distributed web services:
- Idempotency Keys: Network disconnects or timeouts during non-idempotent operations (such as `POST /payments`) risk duplicate charges if clients naively retry requests. By requiring clients to submit a unique, client-generated `Idempotency-Key` header (e.g., UUID v4), the server checks a distributed cache (Redis) before executing. If the key exists, the server short-circuits execution and returns the cached response from the previous successful execution, guaranteeing exact-once processing.
- Webhook Delivery Reliability: When notifying external consumer systems of asynchronous events, servers implement exponential backoff retry algorithms with jitter upon receiving non-2xx responses. Webhooks should sign payloads with HMAC-SHA256 signatures in a custom header (e.g., `X-Signature`) using a shared secret, enabling receiving clients to verify authenticity and integrity before processing.
