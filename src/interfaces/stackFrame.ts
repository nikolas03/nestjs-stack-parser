export interface StackFrame {
  at: string | null;
  className: string | null;
  methodName: string;
  file: string;
  line: number;
  column: number;
}
