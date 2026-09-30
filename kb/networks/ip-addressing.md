---
topic: Computer Networks
difficulty: medium
---

# IPv4 Structure, Subnetting, and CIDR Notation

Internet Protocol Version 4 (IPv4) provides logical addressing for host interfaces across network boundaries. An IPv4 address is a 32-bit unsigned binary integer, traditionally represented as four decimal octets separated by dots (e.g., `192.168.1.1`). Total IPv4 address capacity is $2^{32} \approx 4.29$ billion addresses.

Classless Inter-Domain Routing (CIDR, RFC 1519) replaced obsolete legacy class-based addressing (Class A, B, C) with flexible variable-length subnet masking denoted as `/prefixLength` (e.g., `192.168.1.0/24`). The prefix length specifies the number of leading bits reserved for the Network Identifier; the remaining $32 - \text{prefixLength}$ bits identify specific Host Interfaces within that subnet.
- In a `/24` subnet, 24 bits represent network ID and 8 bits represent host space ($2^8 = 256$ total addresses).
- By network convention, two addresses are always reserved and cannot be assigned to hosts: the Network Address (all host bits 0, e.g., `192.168.1.0`) and the Broadcast Address (all host bits 1, e.g., `192.168.1.255`), leaving $2^h - 2 = 254$ usable host IPs.

# Private IP Ranges and Network Address Translation (NAT)

Due to rapid global exhaustion of the IPv4 address space, RFC 1918 designated three specific address blocks for private, non-routable local area networks:
- 10.0.0.0/8: Single Class A range ($10.0.0.0$ to $10.255.255.255$), providing 16,777,216 addresses.
- 172.16.0.0/12: Sixteen Class B ranges ($172.16.0.0$ to $172.31.255.255$), providing 1,048,576 addresses.
- 192.168.0.0/16: 256 Class C ranges ($192.168.0.0$ to $192.168.255.255$), providing 65,536 addresses.

Network Address Translation (NAT), specifically Port Address Translation (PAT) or NAT Overload, enables thousands of internal private host devices to share a single public routable IPv4 address. When an internal host (`192.168.1.50:52314`) sends a packet to the Internet, the edge router substitutes the private source IP and port with its own public IP and an assigned ephemeral external port (`203.0.113.1:40123`), recording the mapping in a stateful NAT Translation Table. When return packets arrive, the router reverses translation.

# IPv6 Architecture and Transition Mechanisms

Internet Protocol Version 6 (IPv6) was architected to permanently resolve address exhaustion by expanding address bit length from 32 bits to 128 bits, providing $2^{128} \approx 3.4 \times 10^{38}$ unique addresses. IPv6 addresses are written as eight 16-bit blocks formatted in hexadecimal notation separated by colons (e.g., `2001:0db8:85a3:0000:0000:8a2e:0370:7334`). Leading zeros can be omitted, and consecutive sections of zeros can be compressed once using `::` (e.g., `2001:db8:85a3::8a2e:370:7334`).

Architectural improvements in IPv6:
- Elimination of Broadcasts: Replaced with efficient Multicast and Anycast addressing.
- Simplified Fixed Header: Fixed 40-byte base header with chained extension headers, accelerating hardware router processing.
- Stateless Address Autoconfiguration (SLAAC): Hosts configure their own global addresses automatically using router advertisements and MAC EUI-64 without requiring DHCP.
- Native IPSec Support: Security headers integrated into standard protocol specifications.
- Transition Mechanisms: Dual-Stack routing (running IPv4 and IPv6 concurrently) and 6to4 tunneling bridge legacy infrastructures.
