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
});
