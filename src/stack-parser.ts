import { ParsedStack, StackFrame } from "./interfaces";

/**
 * Options for parsing stack traces
 */
export interface ParseOptions {
  /** Exclude stack frames from node_modules directory */
  excludeNodeModules?: boolean;
  /** Exclude internal Node.js stack frames */
  excludeInternal?: boolean;
  /** Maximum number of stack frames to return */
  maxFrames?: number;
}

/**
 * Parses a JavaScript/TypeScript stack trace string into a structured object.
 *
 * @param stack - The raw stack trace string (typically from error.stack)
 * @param options - Configuration options for parsing
 * @returns A structured ParsedStack object, or undefined if the stack is invalid
 *
 * @example
 * ```typescript
 * try {
 *   throw new Error('Something went wrong');
 * } catch (err) {
 *   const parsed = parseStack(err.stack, { excludeNodeModules: true });
 *   console.log(parsed);
 * }
 * ```
 */
export function parseStack(
  stack?: string,
  options?: ParseOptions
): ParsedStack | undefined {
  if (!stack || stack.trim() === "") return;

  const lines = stack.split("\n");
  const firstLine = lines[0];

  // Parse error type and message from first line
  // Handle cases where the error message contains colons
  const colonIndex = firstLine.indexOf(":");
  const errorType = colonIndex > -1 ? firstLine.slice(0, colonIndex).trim() : undefined;
  const error = colonIndex > -1 ? firstLine.slice(colonIndex + 1).trim() : undefined;

  // Improved regex to handle:
  // - async functions: "at async ClassName.method"
  // - absolute paths: Unix (/path) and Windows (C:\path)
  // - relative paths: (./path or ../path)
  // - anonymous functions
  const stackRegex =
    /at\s+(?:async\s+)?(?:(.*?)\s+\()?((?:\/|[a-zA-Z]:[\\\/]|\.[\\\/]).+?):(\d+):(\d+)\)?/;

  const stackFrames: StackFrame[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(stackRegex);

    if (!match) continue;

    const fullFunctionName = match[1]?.trim() || null;
    const filePath = match[2];

    // Apply filters
    if (options?.excludeNodeModules && filePath.includes("node_modules")) {
      continue;
    }

    if (options?.excludeInternal && isInternalNodeModule(filePath)) {
      continue;
    }

    // Parse class and method names
    let className: string | null = null;
    let methodName: string;

    if (fullFunctionName && fullFunctionName.includes(".")) {
      const parts = fullFunctionName.split(".");
      className = parts[0];
      methodName = parts.slice(1).join(".");
    } else if (!fullFunctionName) {
      methodName = "<anonymous>";
    } else {
      methodName = fullFunctionName;
    }

    stackFrames.push({
      at: fullFunctionName,
      className,
      methodName,
      file: filePath,
      line: Number(match[3]),
      column: Number(match[4]),
    });

    // Apply maxFrames limit
    if (options?.maxFrames && stackFrames.length >= options.maxFrames) {
      break;
    }
  }

  return { type: errorType, error, stack: stackFrames };
}

/**
 * Checks if a file path belongs to Node.js internal modules
 */
function isInternalNodeModule(filePath: string): boolean {
  return (
    filePath.startsWith("node:") ||
    filePath.startsWith("internal/") ||
    (filePath.includes("(") && filePath.includes(")") && !filePath.includes("/"))
  );
}
