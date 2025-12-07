# nestjs-stack-parser

A lightweight and typed utility for parsing JavaScript and NestJS stack traces into structured, readable objects.

---

## 📦 Installation

```bash
npm install nestjs-stack-parser
```

---

## 🔍 What It Does

`nestjs-stack-parser` helps you convert raw stack traces—like those from NestJS or plain JavaScript errors—into structured objects. It parses:

- The error **type** (e.g., `TypeError`, `ForbiddenException`)
- The **error message** (including messages with colons)
- The full **stack trace**, broken down into:
  - Class name (if present)
  - Method name
  - File path (absolute, relative, Windows, Unix)
  - Line and column numbers

### Supported Stack Trace Formats

- ✅ Standard synchronous calls
- ✅ Async/await function calls
- ✅ Anonymous functions
- ✅ Nested method names (e.g., `Object.prototype.toString`)
- ✅ Unix absolute paths (`/app/src/file.ts`)
- ✅ Windows paths (`C:\Users\app\src\file.ts`)
- ✅ Relative paths (`./src/file.ts`, `../utils/helper.ts`)
- ✅ NestJS exception formats

---

## 🛠️ Usage

```ts
import { parseStack } from "nestjs-stack-parser";

try {
  // some code that throws
} catch (err) {
  const parsed = parseStack(err.stack, {
    excludeNodeModules: true,
    excludeInternal: true,
    maxFrames: 10
  });
  console.log(parsed);
}
```

### Example Output

```ts
{
  type: 'TypeError',
  error: "Cannot read properties of undefined (reading 'qd')",
  stack: [
    {
      at: 'AppService.getHello',
      className: 'AppService',
      methodName: 'getHello',
      file: '/app/src/app.service.ts',
      line: 13,
      column: 20
    },
    // ...more frames
  ]
}
```

---

## ⚙️ Options

### `excludeNodeModules`

- Type: `boolean`
- Default: `false`
- If `true`, stack frames from `node_modules` will be excluded.

### `excludeInternal`

- Type: `boolean`
- Default: `false`
- If `true`, internal Node.js stack frames (like `node:internal/...`) will be excluded.

### `maxFrames`

- Type: `number`
- Default: `undefined` (no limit)
- Limits the number of stack frames returned. Useful for reducing output size.

---

## 🧪 Testing

This project uses [Jest](https://jestjs.io/) for unit tests. To run tests:

```bash
npm test
```

---

## 📁 Project Structure

```
├── src/
│   └── parseStack.ts
├── dist/
├── test/
│   └── parseStack.test.ts
├── package.json
├── tsconfig.json
├── jest.config.js
└── README.md
```

---

## 📄 License

MIT © Nicolas LEROY

---

## 🌐 Links

- GitHub: [github.com/nikolas03/nestjs-stack-parser](https://github.com/nikolas03/nestjs-stack-parser)
- NPM: [npmjs.com/package/nestjs-stack-parser](https://www.npmjs.com/package/nestjs-stack-parser)
