---
topic: Web / MERN
difficulty: hard
---

# Node.js Single-Threaded Event Loop and libuv

Node.js executes JavaScript code in a single-threaded runtime environment powered by Google V8, paired with `libuv`—a high-performance, cross-platform C library that provides an asynchronous I/O event loop and a managed background worker Thread Pool.

Although JavaScript execution occurs on a single main thread, Node.js achieves immense non-blocking scalability because heavy asynchronous operations are offloaded:
- Network I/O (HTTP sockets, TCP, DNS): Offloaded directly to the operating system kernel's non-blocking I/O multiplexing primitives (epoll on Linux, kqueue on macOS, IOCP on Windows). The OS notifies `libuv` when sockets are ready without blocking any thread.
- File System and Cryptography: Because standard operating system file APIs lack universal non-blocking interfaces, `libuv` dispatches file I/O (`fs.readFile`), DNS lookups (`dns.lookup`), and CPU-heavy cryptographic operations (`crypto.pbkdf2`) to an internal Worker Thread Pool (default 4 threads, configurable via `UV_THREADPOOL_SIZE`).

# Event Loop Execution Phases

The `libuv` event loop runs continuously, executing queued callbacks across six distinct, ordered sequential phases in every iteration (tick):
1. Timers Phase: Executes callbacks scheduled by `setTimeout()` and `setInterval()` whose expiration thresholds have elapsed.
2. Pending Callbacks (I/O Callbacks): Executes deferred I/O callbacks from the previous loop iteration (e.g., specific OS-level network socket error handlers).
3. Idle, Prepare Phase: Internal `libuv` maintenance phases used exclusively by the runtime engine.
4. Poll Phase: Retrieves new I/O events from the OS kernel and executes almost all application I/O callbacks (incoming HTTP requests, database responses, file read completions). If no timers are scheduled, the loop blocks in the poll phase awaiting incoming events.
5. Check Phase: Executes callbacks registered via `setImmediate()`.
6. Close Callbacks: Executes socket/stream teardown callbacks (e.g., `socket.on('close', ...)`).

# Microtasks Queue: process.nextTick vs Promise.then

Outside the standard event loop phases reside two high-priority Microtask queues:
1. `process.nextTick` Queue: Highest priority queue in Node.js.
2. Promise Microtask Queue: Handles resolved native Promise callbacks (`.then()`, `.catch()`, `.finally()`, and `async/await` resumptions).

Microtask Execution Semantics: Microtask queues are not part of `libuv`'s six loop phases. Instead, the microtask queue is drained completely immediately after the current JavaScript operation finishes, between transitions of any individual event loop phase, and even between executions of individual timer callbacks.
- `process.nextTick()` callbacks execute before Promise microtasks.
- Calling `process.nextTick()` recursively can starve the entire event loop, completely blocking the poll phase and preventing any I/O or timers from executing.
- `setImmediate()` vs `setTimeout(..., 0)`: `setImmediate()` is scheduled in the Check phase immediately following the Poll phase; `setTimeout(..., 0)` is evaluated in the Timers phase on the next loop iteration.
