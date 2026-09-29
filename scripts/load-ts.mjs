/**
 * Load a project TypeScript module from a plain Node script.
 *
 * The verifier has to exercise the *real* lib/ code — a re-implementation of
 * the Excel engine inside the verifier would happily agree with itself while
 * the shipped one was broken. There is no tsx/esbuild binary in this project,
 * so this transpiles with the TypeScript compiler that's already a devDep,
 * rewrites the `@/` path alias to a relative one, and imports the result.
 *
 * Types are stripped, not checked — `next build` is what type-checks.
 */
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { join, basename, dirname } from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

const loaded = new Map();
let outDir = null;

/**
 * Output has to live inside the repo, not in the OS temp dir: the transpiled
 * modules still `import "fast-formula-parser"`, and Node resolves that by
 * walking up from the importing file. From %TEMP% there is no node_modules to
 * find and every import fails.
 */
function ensureOutDir(repoRoot) {
  if (!outDir) {
    outDir = join(repoRoot, "node_modules", ".cache", "sqlsports-ts");
    mkdirSync(outDir, { recursive: true });
  }
  return outDir;
}

/** Files currently being compiled, so a real import cycle is caught, not fatal. */
const inFlight = new Set();

/**
 * @param {string} absPath  Absolute path to a .ts file under the repo root.
 * @param {string} repoRoot Repo root, used to resolve the `@/` alias.
 */
export async function loadTs(absPath, repoRoot) {
  if (loaded.has(absPath)) return loaded.get(absPath);
  inFlight.add(absPath);

  const dir = ensureOutDir(repoRoot);
  const source = readFileSync(absPath, "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
      verbatimModuleSyntax: false,
    },
  });

  // Two import forms need rewriting, both to a transpiled sibling in outDir:
  //   `@/lib/foo`  the project path alias, which Node knows nothing about
  //   `./foo`      a relative import with no extension, which ESM rejects
  // ONE pass over both forms. Running them as two sequential .replace() calls
  // is wrong: the alias pass emits `./foo.mjs`, which the relative pass then
  // matches and rewrites again to `./foo.mjs.mjs`.
  const rewritten = outputText.replace(
    /from\s+["'](?:@\/|\.\.?\/)([^"']+?)["']/g,
    (_m, rel) => `from "./${basename(rel).replace(/\.mjs$/, "")}.mjs"`,
  );

  // Compile each dependency first so the sibling it now points at exists.
  //
  // Type-only imports are stripped before scanning, because they are erased by
  // transpilation and are routinely circular: lib/finals.ts does
  // `import type { Unit } from "./curriculum"` while curriculum.ts imports
  // finals.ts for its units. Following those meant curriculum → finals →
  // curriculum → … forever, since a file is only recorded in `loaded` once it
  // has finished. That recursion ate 4GB and killed the process, which took
  // the answer-key verifier with it.
  const scanned = source.replace(/import\s+type\s+[^;]+?;/g, "");
  const deps = [
    ...[...scanned.matchAll(/from\s+["']@\/(.+?)["']/g)].map((m) =>
      join(repoRoot, `${m[1]}.ts`),
    ),
    ...[...scanned.matchAll(/from\s+["']\.\.?\/([^"']+?)["']/g)].map((m) =>
      join(dirname(absPath), `${m[1]}.ts`),
    ),
  ];
  for (const dep of deps) {
    // A value-level cycle can't be resolved by compiling deps first — say so
    // instead of recursing into another out-of-memory crash.
    if (inFlight.has(dep)) {
      throw new Error(
        `Circular value import between ${basename(absPath)} and ${basename(dep)}. ` +
          `Make one side \`import type\`, or move the shared value into its own module.`,
      );
    }
    if (existsSync(dep)) await loadTs(dep, repoRoot);
  }

  const outFile = join(dir, `${basename(absPath, ".ts")}.mjs`);
  writeFileSync(outFile, rewritten, "utf8");
  const mod = await import(pathToFileURL(outFile).href);
  loaded.set(absPath, mod);
  inFlight.delete(absPath);
  return mod;
}
