import { ParsedStack, StackFrame } from "./interfaces";

export function parseStack(
  stack?: string,
  options?: { excludeNodeModules?: boolean }
): ParsedStack | undefined {
  if (!stack) return;

  const [firstLine, ...rest] = stack.split("\n");
  const match = firstLine.match(/^([^:]+):\s*(.+)/);

  const errorType = match?.[1];
  const error = match?.[2];

  const stackRegex =
    /at\s+(?:(.*?)\s+\()?((?:\/|[a-zA-Z]:\\).+?):(\d+):(\d+)\)?/;

  const stackFrames: StackFrame[] = rest
    .flatMap((line) => {
      const match = line.match(stackRegex);
      if (!match) return [];

      const fullFunctionName = match[1]?.trim() || null;
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

      return [
        {
          at: fullFunctionName,
          className,
          methodName,
          file: match[2],
          line: Number(match[3]),
          column: Number(match[4]),
        },
      ];
    })
    .filter((frame) => {
      if (!frame) return false;
      if (options?.excludeNodeModules && frame.file.includes("node_modules")) {
        return false;
      }
      return true;
    });
  return { type: errorType, error, stack: stackFrames };
}
