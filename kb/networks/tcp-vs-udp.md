---
topic: Computer Networks
difficulty: medium
---

# Transmission Control Protocol (TCP) Architecture and Three-Way Handshake

Transmission Control Protocol (TCP) is a connection-oriented, reliable, byte-stream transport layer protocol defined in RFC 793. TCP guarantees ordered, duplicate-free, error-checked delivery of payload segments between communicating endpoints across an inherently unreliable, packet-dropping IP network.

Connection establishment is governed by the TCP Three-Way Handshake:
1. `SYN` (Synchronize): Client selects an initial sequence number ($ISN_c$) and transmits a segment with the `SYN` control flag enabled to the server's listening port.
2. `SYN-ACK`: Server allocates buffer resources, chooses its own random initial sequence number ($ISN_s$), and replies with `SYN` and `ACK` flags set, with acknowledgment number `ack = ISN_c + 1`.
3. `ACK`: Client acknowledges the server's sequence number with `ack = ISN_s + 1`, and the connection transitions to the `ESTABLISHED` state. Payload data can now flow bidirectionally.

Connection termination employs a Four-Way Handshake using `FIN` and `ACK` packets. The endpoint initiating closure enters the `TIME_WAIT` state (typically 2 MSL, or 60–120 seconds) to ensure final `ACK` delivery and allow stray delayed duplicate segments to dissipate from the network before port reuse.

# TCP Reliability: Flow Control, Congestion Control, and Error Handling

TCP maintains reliability through intricate feedback loops:
- Cumulative Acknowledgments and Retransmission: Receivers acknowledge the highest contiguous byte received. If a sender does not receive an ACK before a dynamic Retransmission Timeout (RTO) expires, it retransmits the unacknowledged segment. Fast Retransmit triggers immediate retransmission upon receiving 3 duplicate ACKs without awaiting RTO expiry.
- Sliding Window Flow Control: Prevents a fast sender from overwhelming a slow receiver's buffer. The receiver advertises a Receive Window (`rwnd`) in each TCP header indicating available buffer space. The sender cannot transmit beyond this window.
- Congestion Control: Prevents senders from overwhelming the intermediate network infrastructure. Managed by a Congestion Window (`cwnd`) through four canonical phases:
  1. Slow Start: Exponential increase in `cwnd` doubling every RTT until reaching `ssthresh`.
  2. Congestion Avoidance: Linear additive increase ($\approx +1$ MSS per RTT).
  3. Fast Recovery: Halves `cwnd` upon packet loss signaled by 3 duplicate ACKs (AIMD: Additive Increase Multiplicative Decrease).

# User Datagram Protocol (UDP) and Protocol Comparison

User Datagram Protocol (UDP, RFC 768) is a minimal, connectionless, lightweight transport protocol. UDP encapsulates application messages into datagrams with only an 8-byte header: Source Port (16 bits), Destination Port (16 bits), Length (16 bits), and Checksum (16 bits).

Key Comparison Vectors:
- Connection Overhead: TCP incurs handshake latency (1-RTT) and stateful connection tracking; UDP has zero connection establishment overhead (0-RTT).
- Ordering and Delivery: TCP guarantees in-order arrival, retransmission of lost packets, and duplicate filtering; UDP provides no delivery guarantees—packets may arrive out-of-order, be duplicated, or be dropped entirely.
- Flow/Congestion Throttling: TCP dynamically throttles transmission based on network load; UDP transmits immediately at whatever rate the application dispatches.
- Header Size: TCP headers are 20–60 bytes; UDP headers are fixed at 8 bytes.
- Ideal Use Cases: TCP powers web traffic (HTTP/1.1, HTTP/2), file transfers (FTP, SFTP), database connections, and email (SMTP). UDP powers latency-critical, loss-tolerant applications including VoIP, real-time multiplayer gaming, live video streaming, DNS lookups, and QUIC (HTTP/3).
