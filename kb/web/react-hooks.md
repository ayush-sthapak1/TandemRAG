---
topic: Web / MERN
difficulty: medium
---

# React Fiber Architecture and Reconciliation Algorithm

React is a declarative, component-based user interface library that synchronizes state with the Document Object Model (DOM) using a Virtual DOM and the Fiber Reconciliation Engine. React Fiber represents a complete rewrite of React's core reconciler, converting the synchronous stack-based rendering of earlier versions into an asynchronous, priority-based, incremental scheduling architecture.

In Fiber, every React element is represented by an internal JavaScript object (a Fiber node) containing component type, state, props, and pointers forming a singly-linked tree (`child`, `sibling`, `return`). Rendering executes across two distinct phases:
1. Render Phase (Asynchronous and Interruptible): React traverses the component tree, compares the current Fiber tree against the work-in-progress Fiber tree (Diffing), identifies DOM mutations, and tags nodes with effect flags (Placement, Update, Deletion). High-priority user input events (typing, clicks) can preempt and pause ongoing background render passes.
2. Commit Phase (Synchronous): React applies all calculated DOM modifications to the actual physical browser DOM in a single synchronous pass, followed by invoking layout and passive lifecycle effects.

# Core React Hooks: useState, useEffect, and useRef

React Hooks enable functional components to manage local state, lifecycle effects, and mutable references without writing class components:
- `useState`: Declares a local reactive state variable and an updater function. When state changes, React schedules a re-render of the component. State updates are batched asynchronously across event handlers to optimize rendering performance.
- `useEffect`: Manages side effects (API calls, DOM subscriptions, timers) after the DOM commit phase. The dependency array controls execution:
  - No dependency array: Runs after every single render pass.
  - Empty array `[]`: Runs once after initial mount, mimicking `componentDidMount`.
  - Array with values `[depA, depB]`: Runs only when specified dependencies mutate by shallow reference comparison (`Object.is`).
  - Cleanup Function: Returned from the effect callback; executes prior to component unmounting or before the effect re-runs, preventing memory leaks and stale socket listeners.
- `useRef`: Returns a persistent mutable object whose `.current` property survives across all render cycles without triggering a re-render when mutated. Used for referencing physical DOM nodes and storing mutable instance variables.

# Performance Optimization: useMemo, useCallback, and React.memo

Unnecessary component re-renders degrade user interface responsiveness. React provides targeted memoization primitives to preserve referential equality and avoid redundant computations:
- `React.memo`: A higher-order component that wraps a functional component, memoizing its rendered output. React skips rendering the component if its incoming props are shallowly equal to its previous props.
- `useMemo`: Caches the computed result of an expensive calculation across re-renders: `const memoizedValue = useMemo(() => computeExpensiveCalculation(a, b), [a, b])`. It recomputes only when dependencies change.
- `useCallback`: Returns a memoized version of a callback function instance: `const handleClick = useCallback(() => doSomething(a), [a])`. In JavaScript, declaring an inline arrow function creates a brand-new function reference on every single render pass. Passing an unmemoized callback to a `React.memo` child component causes the child to re-render needlessly because shallow prop comparison fails (`prevHandler !== nextHandler`). `useCallback` preserves referential equality until dependencies mutate.
