import { StackFrame } from "./stackFrame";

export interface ParsedStack {
  type: string | undefined;
  error: string | undefined;
  stack: StackFrame[];
}
