---
topic: Web / MERN
difficulty: medium
---

# JSON Web Token (JWT) Anatomy and Cryptographic Verification

A JSON Web Token (JWT, RFC 7519) is a compact, URL-safe, self-contained standard for transmitting authenticated claims securely between parties as a JSON object. A JWT string consists of three discrete parts separated by dots (`.`): `Header.Payload.Signature`.

1. Header: Base64Url-encoded JSON object specifying token metadata, notably the signing algorithm (`"alg": "HS256"` or `"RS256"`) and token type (`"typ": "JWT"`).
2. Payload: Base64Url-encoded JSON object containing user claims—both registered standard claims (`iss` issuer, `exp` expiration timestamp, `sub` subject identifier) and custom application claims (`userId`, `role`). Crucially, the payload is encoded, NOT encrypted; sensitive secrets or passwords must never be stored inside a JWT payload because anyone can decode and view it.
3. Signature: Cryptographic hash computed by hashing the concatenated encoded header and payload using a server-side secret key or private key: `HMACSHA256(base64Url(header) + "." + base64Url(payload), secret)`. When a client presents a token, the server computes the signature independently; if any byte of the header or payload was tampered with, the signatures mismatch, and the token is rejected.

# Stateless Authentication vs Stateful Sessions

Modern web systems select authentication paradigms based on scalability and architectural requirements:
- Stateful Session Authentication: Upon user login, the server generates a cryptographically random session identifier, stores session state (user details, permissions) in server memory or a shared distributed cache (e.g., Redis), and sets an `HttpOnly` cookie on the client containing the session ID. Every subsequent request checks the session store.
  - Advantages: Immediate server-side revocation (logging out immediately invalidates session in Redis).
  - Tradeoffs: Requires centralized shared cache infrastructure across scaled server instances; incurs network round-trip overhead to Redis for every incoming request.
- Stateless JWT Authentication: The server issues a signed JWT to the client upon login. The client attaches the JWT to the `Authorization: Bearer <token>` header on subsequent API requests. The server validates the token solely via mathematical cryptographic signature checking without performing database or cache lookups.
  - Advantages: Perfectly stateless horizontal scaling; zero database lookup overhead per request.
  - Tradeoffs: Inability to immediately revoke tokens prior to natural expiration without maintaining a revocation blacklist.

# Access Token, Refresh Token Rotation, and Storage Security

To address token revocation while mitigating stolen credential windows, production architectures implement Dual-Token Authentication with Token Rotation:
- Short-Lived Access Token: Valid for 5–15 minutes, used to authorize individual API requests. If intercepted, the attacker's exposure window is minimal.
- Long-Lived Refresh Token: Valid for 7–30 days, stored strictly in the database against the user account and transmitted to the client inside a secure, `HttpOnly`, `SameSite=Strict` cookie (protecting it against client-side JavaScript access and XSS theft).
- Token Rotation: When the access token expires, the client calls `/auth/refresh`. The server validates the refresh token against the database, invalidates it immediately, issues a new access token alongside a fresh replacement refresh token, and returns both to the client. If an invalidated refresh token is ever presented again, the server detects potential reuse/theft and revokes all active sessions for that account immediately.
