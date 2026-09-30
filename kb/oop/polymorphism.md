---
topic: OOP
difficulty: medium
---

# Polymorphism Concepts and Principles

Polymorphism, originating from the Greek words for "many forms," is the object-oriented capability of presenting the identical interface for differing underlying forms or data types. It allows a single entity, such as an object reference, function call, or operator, to exhibit distinct behaviors depending on the concrete context in which it is invoked.

Polymorphism is the core engine behind the Open/Closed Principle (software entities should be open for extension, but closed for modification). By writing high-level business logic against polymorphic interfaces or abstract base classes, systems can integrate novel concrete subclasses seamlessly without modifying a single line of existing orchestrating code. Polymorphism is bifurcated into Static (Compile-Time) Polymorphism and Dynamic (Runtime) Polymorphism.

# Compile-Time Polymorphism: Method Overloading and Operator Overloading

Compile-Time Polymorphism (Static Binding / Early Binding) resolves function calls during compilation:
- Method Overloading: Occurs when multiple methods within the same class share the identical method identifier but possess distinct parameter signatures (differing in parameter count, parameter types, or parameter ordering). Return types alone cannot distinguish overloaded methods because callers may ignore return values. The compiler inspects invocation arguments at compile time and emits direct call instructions to the mangled name of the matching routine, incurring zero runtime overhead.
- Operator Overloading: Languages like C++ and Python permit redefining standard operators (`+`, `-`, `==`, `[]`) for user-defined classes (e.g., implementing vector addition via `Vector operator+(const Vector& other)`), enhancing syntactic fluency.

# Runtime Polymorphism: Method Overriding and Dynamic Dispatch

Runtime Polymorphism (Dynamic Binding / Late Binding) resolves method execution dynamically at runtime based on the actual concrete type of the object referenced, rather than the declared type of the reference pointer.
- Method Overriding: Occurs when a subclass provides a specific implementation for a method already defined in its parent class, sharing the identical method signature and compatible return type (covariant returns).
- Upcasting: Assigning a subclass instance to a base class reference variable (e.g., `Shape shape = new Circle()`).
- Dynamic Dispatch: When `shape.draw()` is invoked, the runtime environment dynamically inspects the concrete runtime type of the instance (`Circle`) and dispatches the execution to `Circle`'s overridden `draw()` method, rather than executing the base `Shape` method.
