# Network Security Fundamentals
Provider: State University
Status: in_progress | Type: college
Grade: 87.0% (B)

## Assignments
- Lab 1 — Wireshark Packet Analysis — Due: 2026-02-10 — done
- Lab 2 — Firewall Configuration — Due: 2026-02-24 — done
- Midterm Exam — Due: 2026-03-05 — done
- Lab 3 — VPN Setup — Due: 2026-03-20 — done
- test123 — Due: 2026-03-29 — pending
- Research Paper — Zero Trust Architecture — Due: 2026-04-10 — pending
- Final Exam — Due: 2026-05-05 — pending

## Study Notes
### OSI Model Layers
Layer 7 Application — HTTP, FTP, DNS\nLayer 6 Presentation — Encryption, compression\nLayer 5 Session — Sessions between apps\nLayer 4 Transport — TCP/UDP, ports\nLayer 3 Network — IP addressing, routing\nLayer 2 Data Link — MAC addresses, switches\nLayer 1 Physical — Cables, hubs, signals

### Common Attack Vectors
Phishing — social engineering via email\nMITM — intercept traffic between two parties\nDDoS — overwhelm a target with traffic\nSQL Injection — malicious SQL in input fields\nXSS — inject scripts into web pages\nBuffer Overflow — exceed memory buffer limits

### test
# OSI Model — Network Security Notes

## Overview
The OSI model has **7 layers** that describe how data travels 
across a network. Understanding each layer is *critical* for 
identifying attack surfaces.

## The 7 Layers

1. Physical — cables, switches, hardware
2. Data Link — MAC addresses, frames
3. Network — IP addresses, routing
4. Transport — TCP/UDP, ports
5. Session — connections, authentication
6. Presentation — encryption, compression
7. Application — HTTP, DNS, FTP

## Common Attacks by Layer

- **Layer 2:** ARP Spoofing, MAC flooding
- **Layer 3:** IP Spoofing, ICMP attacks
- **Layer 4:** SYN flood, port scanning
- **Layer 7:** SQL injection, XSS, phishing

## Key Command
```bash
nmap -sV -p 1-1000 192.168.1.1
```

> Remember: Security is only as strong as the weakest layer.

---

## Study Checklist
- [ ] Memorize all 7 layers
- [ ] Understand TCP vs UDP
- [ ] Practice with Wireshark
sdkf aoie. aldkf 08h a

## Key Concepts
**Zero Trust**: Security model that assumes no user or device is trusted by default, even inside the network perimeter. Always verify.
**Defense in Depth**: Layered security approach using multiple controls so if one fails, others still protect the system.
**CIA Triad**: Confidentiality, Integrity, Availability — the three core principles of information security.
**DMZ**: Demilitarized Zone — a network segment that sits between the internal network and the internet, hosting public-facing services.

## Study Sessions
- 2026-03-10: 95 min — Reviewed firewall types and packet filtering
- 2026-03-12: 80 min — Studied VPN protocols — IPSec vs SSL
- 2026-03-17: 90 min — Lab prep — VPN setup on VirtualBox
- 2026-03-24: 75 min — Started research paper outline
