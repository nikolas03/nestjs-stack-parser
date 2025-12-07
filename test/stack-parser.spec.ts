import { parseStack } from "../src";

describe("parseStack", () => {
  it("should parse error type and message", () => {
    const stack = `TypeError: Cannot read properties of undefined (reading 'qd')
    at MyService.doStuff (/app/src/my.service.ts:10:15)`;

    const result = parseStack(stack);

    expect(result?.type).toBe("TypeError");
    expect(result?.error).toBe(
      "Cannot read properties of undefined (reading 'qd')"
    );
    expect(result?.stack.length).toBe(1);

    const frame = result?.stack[0];
    expect(frame?.file).toContain("my.service.ts");
    expect(frame?.line).toBe(10);
    expect(frame?.column).toBe(15);
    expect(frame?.className).toBe("MyService");
    expect(frame?.methodName).toBe("doStuff");
  });

  it("should handle anonymous function", () => {
    const stack = `Error: Something went wrong
    at /app/src/index.ts:5:10`;

    const result = parseStack(stack);

    expect(result?.stack[0].methodName).toBe("<anonymous>");
  });

  it("should filter out node_modules when excludeNodeModules is true", () => {
    const stack = `Error: Boom
    at AppService.run (/app/src/app.service.ts:12:8)
    at SomeLib.doSomething (/app/node_modules/some-lib/index.js:42:5)`;

    const result = parseStack(stack, { excludeNodeModules: true });

    expect(result?.stack.length).toBe(1);
    expect(result?.stack[0].file).toContain("app.service.ts");
  });

  it("should return undefined for empty stack", () => {
    expect(parseStack(undefined)).toBeUndefined();
    expect(parseStack("")).toBeUndefined();
  });

  it("should handle error messages with colons", () => {
    const stack = `Error: Connection failed: timeout exceeded
    at Database.connect (/app/src/db.ts:20:5)`;

    const result = parseStack(stack);

    expect(result?.type).toBe("Error");
    expect(result?.error).toBe("Connection failed: timeout exceeded");
  });

  it("should parse async function calls", () => {
    const stack = `Error: Async error
    at async UserService.fetchUser (/app/src/user.service.ts:30:10)`;

    const result = parseStack(stack);

    expect(result?.stack.length).toBe(1);
    const frame = result?.stack[0];
    expect(frame?.className).toBe("UserService");
    expect(frame?.methodName).toBe("fetchUser");
    expect(frame?.file).toContain("user.service.ts");
  });

  it("should handle relative paths", () => {
    const stack = `Error: Test error
    at testFunc (./src/test.ts:5:3)`;

    const result = parseStack(stack);

    expect(result?.stack.length).toBe(1);
    expect(result?.stack[0].file).toBe("./src/test.ts");
    expect(result?.stack[0].methodName).toBe("testFunc");
  });

  it("should handle Windows paths", () => {
    const stack = `Error: Windows error
    at MyClass.method (C:\\Users\\app\\src\\file.ts:10:5)`;

    const result = parseStack(stack);

    expect(result?.stack.length).toBe(1);
    expect(result?.stack[0].file).toContain("C:");
    expect(result?.stack[0].className).toBe("MyClass");
  });

  it("should handle nested method names", () => {
    const stack = `Error: Nested error
    at Object.prototype.toString (/app/src/object.ts:15:20)`;

    const result = parseStack(stack);

    expect(result?.stack.length).toBe(1);
    const frame = result?.stack[0];
    expect(frame?.className).toBe("Object");
    expect(frame?.methodName).toBe("prototype.toString");
  });

  it("should exclude internal Node.js modules when excludeInternal is true", () => {
    const stack = `Error: Internal error
    at MyService.run (/app/src/service.ts:10:5)
    at processTicksAndRejections (node:internal/process/task_queues:95:5)`;

    const result = parseStack(stack, { excludeInternal: true });

    expect(result?.stack.length).toBe(1);
    expect(result?.stack[0].file).toContain("service.ts");
  });

  it("should limit frames when maxFrames is set", () => {
    const stack = `Error: Multiple frames
    at func1 (/app/src/file1.ts:1:1)
    at func2 (/app/src/file2.ts:2:2)
    at func3 (/app/src/file3.ts:3:3)
    at func4 (/app/src/file4.ts:4:4)`;

    const result = parseStack(stack, { maxFrames: 2 });

    expect(result?.stack.length).toBe(2);
    expect(result?.stack[0].methodName).toBe("func1");
    expect(result?.stack[1].methodName).toBe("func2");
  });

  it("should handle functions without class names", () => {
    const stack = `Error: Function error
    at myFunction (/app/src/utils.ts:20:10)`;

    const result = parseStack(stack);

    expect(result?.stack.length).toBe(1);
    const frame = result?.stack[0];
    expect(frame?.className).toBeNull();
    expect(frame?.methodName).toBe("myFunction");
  });

  it("should handle whitespace-only stack", () => {
    expect(parseStack("   ")).toBeUndefined();
    expect(parseStack("\n\n")).toBeUndefined();
  });

  it("should handle multiline stack with no matching frames", () => {
    const stack = `Error: No frames
Some random text
More random text`;

    const result = parseStack(stack);

    expect(result?.type).toBe("Error");
    expect(result?.error).toBe("No frames");
    expect(result?.stack.length).toBe(0);
  });
});
