---
topic: Computer Networks
difficulty: medium
---

# Domain Name System (DNS) Architecture and Hierarchy

The Domain Name System (DNS) is a distributed, hierarchical naming database that translates human-readable hostnames (e.g., `api.example.com`) into routable numerical IP addresses (e.g., `192.0.2.1` or `2606:2800:220:1:248:1893:25c8:1946`). Operating predominantly over UDP port 53 (and TCP port 53 for large zone transfers or payloads exceeding 512 bytes), DNS eliminates the necessity for humans to memorize raw IP addresses.

The DNS hierarchy is structured as an inverted tree:
- Root Domain: Represented by a dot (`.`), governed globally by 13 logical root server clusters (named `a.root-servers.net` through `m.root-servers.net`), operated by organizations like ICANN, NASA, and Verisign via Anycast routing.
- Top-Level Domain (TLD): The rightmost segment of a domain (`.com`, `.org`, `.edu`, `.io`, `.gov`), managed by designated TLD registries.
- Second-Level Domain: The domain name registered by an individual or entity (`example` in `example.com`).
- Subdomains: Hierarchical subdivisions controlled by the domain owner (`api.example.com`).

# Recursive vs Iterative DNS Resolution

When a client browser initiates a web request to an uncached hostname, the resolution proceeds through distinct query modes:
1. Local Cache Inspection: The browser inspects its internal DNS cache, followed by operating system resolver cache and local `/etc/hosts` mappings.
2. Recursive Query: If unfulfilled locally, the client resolver dispatches a Recursive Query to a Recursive Resolver (typically hosted by the ISP or public providers like Cloudflare `1.1.1.1` or Google `8.8.8.8`). In a recursive query, the resolver assumes full responsibility for traversing the DNS hierarchy and returning the definitive IP answer or an NXDOMAIN error.
3. Iterative Queries: The recursive resolver executes a sequence of Iterative Queries:
   - Queries Root Nameserver: Root responds with referral to the `.com` TLD Nameserver.
   - Queries TLD Nameserver: TLD responds with referral to the Authoritative Nameservers for `example.com` (NS records).
   - Queries Authoritative Nameserver: Authoritative server holds the master DNS zone files and returns the definitive A / AAAA record mapping to the target IP address.
   - The recursive resolver caches the record according to its TTL and returns the IP address to the client.

# DNS Record Types and TTL Management

DNS zone configurations define mapping semantics through specialized Resource Records (RRs):
- `A` Record (Address): Maps a fully qualified domain name to a 32-bit IPv4 address.
- `AAAA` Record (Quad-A): Maps a domain name to a 128-bit IPv6 address.
- `CNAME` Record (Canonical Name): Creates an alias pointing one domain name to another canonical domain name (cannot coexist with other records on root apex domain `@`).
- `MX` Record (Mail Exchange): Designates the mail server responsible for accepting incoming email for the domain, associated with an integer priority preference.
- `TXT` Record: Arbitrary text payload used for domain verification, SPF (Sender Policy Framework), DKIM, and DMARC email authentication.
- `NS` Record (Name Server): Delegates a DNS zone to specific authoritative nameservers.

Time-To-Live (TTL): A 32-bit unsigned integer in seconds defining how long intermediate recursive caching resolvers may cache a DNS record before discarding it and re-querying authoritative servers. High TTLs optimize client lookup latency and reduce nameserver query load; low TTLs provide operational agility during infrastructure migrations and DNS failover events.
