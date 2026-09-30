---
topic: OOP
difficulty: easy
---

# Classes and Objects Architecture

In Object-Oriented Programming (OOP), a Class serves as an extensible blueprint, template, or abstract data type specifying the state variables (attributes, fields) and behavioral routines (methods, member functions) that entities constructed from it will possess. A class defines structure in source code and incurs no heap memory allocation until instantiated.

An Object (Instance) is a concrete, self-contained runtime entity instantiated from a class definition. Instantiation allocates a distinct block of heap memory representing the object's instance state, populated via constructor initialization. While each object maintains its own independent set of instance variables in heap memory, all instances share a single copy of member function code stored in the process's executable text memory segment, preventing wasteful code duplication across instances.

# Constructors, Destructors, and Memory Lifecycles

Object lifecycles are governed by specialized lifecycle methods:
- Default and Parameterized Constructors: Member routines automatically invoked upon object instantiation to allocate resources, establish class invariants, and initialize fields to valid starting states.
- Copy Constructors and Deep vs Shallow Copying: Copy constructors initialize a new object using an existing instance of the same class. A Shallow Copy duplicates primitive field values and copies pointer references verbatim; consequently, both instances reference the identical underlying heap memory block, leading to catastrophic double-free crashes upon deallocation. A Deep Copy explicitly allocates a separate heap memory buffer and duplicates the underlying data contents independently.
- Destructors: Routines invoked automatically when an object goes out of scope or is explicitly deleted, responsible for releasing non-memory system resources (e.g., closing file descriptors, releasing database locks, terminating network sockets). In garbage-collected languages (Java, JavaScript, Python), destructors are replaced with finalizers or explicit cleanup protocols (e.g., `AutoCloseable`, `IDisposable`).

# Static Members, Class Methods, and the This Pointer

OOP distinctions between instance scope and class scope:
- Static Members: Class-level variables and methods marked with the `static` keyword exist independently of any individual instance. Only a single copy of a static member exists across the entire application runtime, stored in the global/static data segment, accessible via the class name (`ClassName.staticField`). Static methods cannot reference instance variables because they do not operate within the context of any concrete object.
- The `this` (or `self`) Pointer: An implicit reference or pointer passed automatically as a hidden first argument to all non-static member functions, referencing the specific instance upon which the method was invoked (`this->attribute`), resolving field shadowing and facilitating method chaining.
