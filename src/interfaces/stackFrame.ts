export interface StackFrame {
  at: string | null;
  className: string | null;
  methodName: string | null;
  file: string;
  line: number;
  column: number;
}
