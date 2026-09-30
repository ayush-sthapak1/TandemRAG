---
topic: Computer Networks
difficulty: medium
---

# HTTP Protocol Evolution: HTTP/1.1, HTTP/2, and HTTP/3

Hypertext Transfer Protocol (HTTP) is the foundational stateless request-response application protocol of the World Wide Web.
- HTTP/1.1: Introduced persistent TCP connections (`Connection: keep-alive`) and chunked transfer encoding. However, HTTP/1.1 suffers from Head-of-Line (HoL) Blocking at the application layer: multiple requests over a single TCP connection must be processed and responded to in strict FIFO sequence. If an earlier request stalls, all subsequent requests are blocked. Browsers circumvented this by opening up to 6 concurrent parallel TCP connections per domain, incurring substantial network overhead.
- HTTP/2: Replaced plain-text parsing with a binary framing layer. HTTP/2 introduces Multiplexing: multiple independent bidirectional request/response streams interleave concurrently over a single underlying TCP connection. It also added HPACK header compression and Server Push. However, HTTP/2 remains susceptible to TCP-level HoL blocking: because TCP enforces strict byte-stream ordering, a single dropped packet stalls all multiplexed streams until retransmission succeeds.
- HTTP/3: Replaces TCP with QUIC (Quick UDP Internet Connections), running over UDP. QUIC moves stream multiplexing into the transport layer, eliminating TCP HoL blocking entirely. It combines cryptographic handshake with transport connection establishment (0-RTT resumption) and supports seamless connection migration across IP changes (e.g., Wi-Fi to cellular).

# HTTPS and the TLS Handshake Process

HTTPS (HTTP Secure) layers HTTP on top of Transport Layer Security (TLS 1.2 / TLS 1.3), providing Confidentiality (symmetric encryption prevents eavesdropping), Integrity (cryptographic message authentication prevents tampering), and Authentication (digital certificates verify server identity).

The TLS 1.3 Handshake establishes secure symmetric session keys in a single round-trip (1-RTT):
1. Client Hello: Client transmits supported TLS version, supported cipher suites, a random nonce, and Key Share parameters (ephemeral Diffie-Hellman public keys).
2. Server Hello: Server selects cipher suite, generates its own Diffie-Hellman key share, and calculates the shared symmetric Master Secret. It sends its Digital Certificate (containing its public key signed by a trusted Certificate Authority) and a Certificate Verify cryptographic signature.
3. Key Derivation & Finished: The client verifies the certificate chain against its local operating system root CA store. Both parties derive identical symmetric session keys (AES-GCM or ChaCha20-Poly1305). All subsequent application HTTP payloads are symmetrically encrypted.

# HTTP Status Codes, Methods, and Idempotency

HTTP defines semantic request verbs and response status categories:
- Idempotency: An HTTP method is idempotent if the side effects of making $N > 1$ identical requests are identical to making a single request.
  - `GET`: Safe and idempotent; retrieves representation of a resource without mutating server state.
  - `PUT`: Idempotent; completely replaces the target resource representation.
  - `DELETE`: Idempotent; deletes target resource; repeated calls still leave the resource non-existent.
  - `POST`: Non-idempotent; creates a new subordinate resource or triggers side-effects (e.g., credit card charge).
  - `PATCH`: Non-idempotent (can be idempotent depending on specification); applies partial modifications to a resource.

Status Code Classifications:
- `2xx Success`: `200 OK`, `201 Created` (new resource instantiated), `204 No Content`.
- `3xx Redirection`: `301 Moved Permanently` (browser caches new URL), `302 Found` (temporary redirect), `304 Not Modified` (HTTP caching validation).
- `4xx Client Error`: `400 Bad Request` (syntax/validation failure), `401 Unauthorized` (authentication missing/invalid), `403 Forbidden` (authenticated but unauthorized), `404 Not Found`, `429 Too Many Requests` (rate limited).
- `5xx Server Error`: `500 Internal Server Error`, `502 Bad Gateway` (upstream proxy failure), `503 Service Unavailable`, `504 Gateway Timeout`.
