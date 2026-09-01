/**
 * `fast-formula-parser` ships no type declarations and has no @types package.
 *
 * Rather than `declare module "…"` (which types the whole import as `any` and
 * would silently swallow a signature change), this declares the exact surface
 * lib/excel-engine.ts uses: the constructor, its config callbacks, and parse().
 */
declare module "fast-formula-parser" {
  type CellPosition = { sheet: string; row: number; col: number };
  type RangeRef = {
    sheet: string;
    from: { row: number; col: number };
    to: { row: number; col: number };
  };

  type ParserConfig = {
    onCell?: (position: CellPosition) => unknown;
    onRange?: (ref: RangeRef) => unknown[][];
    functions?: Record<string, (...args: never[]) => unknown>;
  };

  export default class FormulaParser {
    constructor(config?: ParserConfig);
    parse(formula: string, position: CellPosition): unknown;
  }
}
