# 📘 Next.js & Turbopack Troubleshooting Guide
*A comprehensive guide for student developers on common errors in modern Next.js development.*

Today, we encountered several critical errors while working on the **AASTU Campus Event Management System**. This document explains what they were, why they happened, and how to fix them.

---

## 1. Turbopack Root Directory Inference
### ❌ The Error
`Error: Next.js inferred your workspace root, but it may not be correct.`

### 🔍 Discovery
In a **monorepo** (where you have `apps/web` and `apps/api`), Turbopack sometimes loses track of where the main `package.json` and `node_modules` are located. If it can't find the root, it refuses to compile files for security and performance reasons.

### ✅ The Solution
We modified `apps/web/next.config.ts` to explicitly define the root:
```typescript
const nextConfig: NextConfig = {
  turbopack: {
    // path.resolve(__dirname, "../../") points to the actual monorepo root
    root: path.resolve(__dirname, "../../"),
  },
  // ...
};
```

---

## 2. Module Not Found & Casing Issues
### ❌ The Error
`Module not found: Can't resolve '../controllers/ButtonController'`
`Module not found: Can't resolve './modalHeader'`

### 🔍 Discovery
1.  **Pathing**: Assets like `ButtonController` were moved or located in the same directory as the component, but the code was looking for a `../controllers/` folder that didn't exist.
2.  **Casing**: Linux filesystems are **case-sensitive**. If your file is named `ModalHeader.tsx`, importing it as `./modalHeader` will work on Windows/Mac but **fail on Linux**.

### ✅ The Solution
*   Updated paths from `../controllers/` to `./`.
*   Fixed the import casing to match the actual filename: `ModalHeader`.

---

## 3. Server/Client Component Boundary
### ❌ The Error
`Functions cannot be passed directly to Client Components unless you explicitly expose it by marking it with "use server".`

### 🔍 Discovery
Next.js **App Router** separates code into **Server Components** (default) and **Client Components** (`"use client"`). 
*   Server Components run on the server and send HTML to the browser.
*   Client Components run in the browser.

You **cannot** pass a JavaScript function (like a `render` function in a table column) from a Server Component to a Client Component. Functions cannot be serialized and sent over the network.

### ✅ The Solution
We added `"use client";` to the top of the `page.tsx` files. By making the page a Client Component, both the page and the `DataTable` run in the browser, allowing functions to be passed freely.

---

## 4. Turbopack Cache Corruption (Fatal Error)
### ❌ The Error
`thread 'tokio-runtime-worker' panicked... Failed to deserialize AMQF from 00000013.meta`
`ArrayLengthMismatch { required: 102, found: 617 }`

### 🔍 Discovery
Turbopack uses a high-performance, persistent cache stored in the `.next` folder. Sometimes, if the dev server is interrupted or a complex change happens, this internal database becomes **corrupted**. The "ArrayLengthMismatch" is a low-level database error inside the Turbopack engine (written in Rust).

### ✅ The Solution
The "Golden Rule" for Next.js development: **When in doubt, delete `.next`.**
Performing `rm -rf .next` forces Next.js to rebuild the cache from scratch, which clears out the corruption.

---

## 🚀 Pro-Tip for Student Developers
Always keep your **Terminal** open and watch the logs. Most of the time, the error message tells you exactly which file and line is failing. If you see a "Panic" or low-level database error, it's almost always a cache issue that a simple folder deletion will fix.
