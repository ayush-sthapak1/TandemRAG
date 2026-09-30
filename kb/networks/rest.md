---
topic: Computer Networks
difficulty: medium
---

# REST Architectural Principles and Constraints

Representational State Transfer (REST) is an architectural style for distributed hypermedia systems, formulated by Roy Fielding in his 2000 doctoral dissertation. REST is protocol-agnostic, though overwhelmingly instantiated over HTTP. To qualify as truly RESTful, an API system must strictly conform to six guiding architectural constraints:

1. Client-Server Architecture: Strict separation of concerns between user interface/client state and data storage/server state, allowing independent component evolution and scaling.
2. Statelessness: Each request from client to server must contain all contextual information necessary to understand and process the request. No client conversational session state may be retained on the server between requests.
3. Cacheability: Server responses must explicitly label themselves as cacheable or non-cacheable (via `Cache-Control` and `ETag` headers) to eliminate redundant network round-trips.
4. Layered System: Clients cannot discern whether they are communicating directly with the origin server or through intermediate proxies, load balancers, or CDNs.
5. Uniform Interface: The cornerstone of REST, ensuring standardized communication.
6. Code on Demand (Optional): Servers may temporarily extend client capabilities by transferring executable scripts (e.g., JavaScript).

# The Uniform Interface and Richardson Maturity Model

The Uniform Interface constraint comprises four fundamental tenets:
- Resource Identification: Individual resources are identified conceptually through URIs (e.g., `/api/v1/users/42`), decoupled from internal database representations.
- Manipulation Through Representations: Clients interact with resources via standardized representations (JSON, XML), mutating state by sending updated representations.
- Self-Descriptive Messages: Each message carries metadata explaining how to parse it (e.g., `Content-Type: application/json`).
- HATEOAS (Hypermedia As The Engine Of Application State): Clients discover reachable actions and dynamic workflow state transitions through hypermedia hyperlinks provided within server responses.

Leonard Richardson formalized REST compliance into the Richardson Maturity Model:
- Level 0 (The Swamp of POX): Single URI and single HTTP verb (usually POST) used for all remote procedure calls (e.g., SOAP or XML-RPC).
- Level 1 (Resources): Multiple discrete URIs representing distinct individual resources (`/users`, `/orders`), but relying on a single HTTP verb.
- Level 2 (HTTP Verbs): Semantic utilization of standard HTTP verbs (`GET`, `POST`, `PUT`, `DELETE`, `PATCH`) combined with appropriate HTTP status codes. Most commercial "REST" APIs operate at Level 2.
- Level 3 (Hypermedia Controls): True REST with HATEOAS, embedding hypermedia navigational controls within payloads.

# REST vs GraphQL vs gRPC Architectural Comparison

Modern distributed systems select API paradigms based on specific architectural trade-offs:
- REST: Simple, universal HTTP caching, human-readable JSON payloads, tooling ubiquity. Trade-offs: Over-fetching (receiving unneeded fields) and under-fetching (requiring $N+1$ waterfall round-trips to resolve relational dependencies).
- GraphQL: Developed by Meta to solve over/under-fetching. Clients transmit a declarative query string defining the exact field schema required in a single network round-trip. Trade-offs: Complicated HTTP caching (everything runs via POST to `/graphql`), query complexity risks (clients can construct pathological recursive nested queries DOSing the server), and schema maintenance overhead.
- gRPC: High-performance RPC framework developed by Google running over HTTP/2 and HTTP/3 with Protocol Buffers (Protobuf). Payloads are strongly typed, binary-serialized, and support bidirectional streaming. Ideal for microservice-to-microservice internal low-latency communication; less ergonomic for direct public browser consumption due to binary serialization.
