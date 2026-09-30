---
topic: OOP
difficulty: easy
---

# Encapsulation and Information Hiding Principles

Encapsulation is the fundamental object-oriented programming paradigm of bundling internal data representations (fields) alongside the methods that operate on that data into a single cohesive unit, while strictly restricting direct external access to internal state components. This technique is formally termed Information Hiding.

The primary engineering objective of encapsulation is loose coupling and defensive programming. By shielding internal state from arbitrary external mutation, classes preserve internal invariants and business rules. For example, a `BankAccount` class enforces that `balance` cannot be reduced below zero or mutated without an associated transaction log entry. If external code were allowed direct write access (`account.balance = -500`), class invariants would collapse. Encapsulation also insulates client code from internal refactoring: an engineering team can completely redesign underlying data structures (e.g., swapping a fixed array for a balanced binary search tree) without altering the public API consumed by clients.

# Access Modifiers: Public, Private, and Protected

Object-oriented languages enforce access boundaries through compile-time and runtime Access Modifiers:
- `private`: Accessible strictly from within the declaring class itself. Private fields and helper methods cannot be inspected or invoked by external classes, nor by derived subclass hierarchies.
- `protected`: Accessible within the declaring class and all derived subclasses that inherit from it. Protected access provides extensibility for framework hierarchies while shielding fields from arbitrary third-party consumers.
- `public`: Unrestricted visibility from any package or module across the entire codebase. Represents the contractual interface of the class.
- Package-Private (Default in Java): Accessible to any class residing within the identical namespace or package package directory, facilitating modular package-level cohesion.

# Getters, Setters, and Class Invariants

Accessors (Getters) and Mutators (Setters) provide controlled read and write interfaces to private member variables, enabling programmatic enforcement of class invariants:
- Validation and Sanitization: Setters validate input arguments before mutating state (e.g., verifying `age >= 0` or sanitizing email strings), throwing domain exceptions upon constraint violation.
- Read-Only Immutability: By exposing a getter without providing a corresponding setter, a class guarantees immutability for specific properties after constructor initialization.
- Computed Properties: Getters can dynamically compute return values on-the-fly (e.g., computing `fullName` from `firstName + " " + lastName`) without exposing internal representation or storing redundant derived fields.
