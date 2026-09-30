---
topic: Computer Networks
difficulty: medium
---

# OSI 7-Layer Reference Model Architecture

The Open Systems Interconnection (OSI) reference model is a conceptual 7-layer framework established by ISO to standardize telecommunications and computer network protocol interactions:
1. Physical Layer (Layer 1): Transmits raw unstructured bitstreams across physical physical media (cables, fiber optics, radio frequencies), governing electrical voltages, pinouts, and bit timing.
2. Data Link Layer (Layer 2): Provides node-to-node node transfer across a local physical segment, framing bits into data frames, handling physical MAC addressing, and collision arbitration (e.g., Ethernet, Wi-Fi 802.11).
3. Network Layer (Layer 3): Orchestrates end-to-end packet routing and logical host addressing across heterogeneous interconnected networks using IP (IPv4, IPv6) and routing protocols (OSPF, BGP).
4. Transport Layer (Layer 4): Delivers end-to-end segment communication, port multiplexing, and reliable stream delivery or datagram dispatch (TCP, UDP).
5. Session Layer (Layer 5): Establishes, manages, and terminates persistent dialogue sessions between application processes (RPC, NetBIOS).
6. Presentation Layer (Layer 6): Translates data formats, character encodings, encryption/decryption (TLS/SSL), and compression (JSON, ASCII, ASN.1).
7. Application Layer (Layer 7): Exposes network communication interfaces directly to software applications and end-user protocols (HTTP, SMTP, SSH, DNS).

# TCP/IP Model vs OSI Comparison

While the OSI model is a theoretical pedagogical standard, the Internet is built entirely upon the 4-Layer TCP/IP protocol suite (RFC 1122):
- Application Layer: Synthesizes OSI Layers 5, 6, and 7 into a single unified application plane (HTTP, TLS, DNS, FTP, WebSockets).
- Transport Layer: Maps directly to OSI Layer 4, governing host-to-host process communication via 16-bit port numbers (TCP, UDP, QUIC).
- Internet Layer: Maps to OSI Layer 3, orchestrating logical packet routing and internetworking (IP, ICMP, ARP).
- Network Access (Link) Layer: Merges OSI Layers 1 and 2, managing hardware device drivers, network interface cards, and local physical frame transmission.

The primary architectural distinction is that TCP/IP adopted a pragmatic, implementation-first philosophy where protocol simplicity and autonomous packet switching outweighed rigid boundary layering, leaving session and presentation concerns to individual application developers.

# Packet Encapsulation and Decapsulation Lifecycle

Data transmission across network architectures is governed by Protocol Data Unit (PDU) Encapsulation:
1. An application generates a raw payload (Data).
2. The Transport layer prepends a Transport Header (containing source and destination port numbers, sequence numbers, checksums), creating a Segment (TCP) or Datagram (UDP).
3. The Internet layer prepends an IP Header (containing source and destination IP addresses, TTL, protocol ID), creating a Packet.
4. The Link layer prepends a Frame Header (source and destination MAC addresses) and appends a Frame Check Sequence (CRC checksum), forming a Frame.
5. The Physical layer transmits the frame as electrical, optical, or radio Signals.

Upon reaching the destination host, Decapsulation reverses this sequence: the NIC validates CRC, strips the Ethernet frame, the OS kernel verifies IP routing and strips the IP header, the transport layer demultiplexes the segment to the bound socket buffer, and the application receives the pure data payload.
