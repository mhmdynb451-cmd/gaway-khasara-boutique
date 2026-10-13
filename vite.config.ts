Deep Fix & Root Cause Resolution Directive for Vite / TanStack Router Path Resolution:

Issue: 
The CI/CD pipeline fails at `npm run build` with:
TypeError [ERR_INVALID_ARG_TYPE]: The "paths[0]" argument must be of type string. Received undefined
at resolve (node:path:1115:7)

Required Action:
1. Conduct a rigorous, production-grade check across `vite.config.ts`, `vitest.config.ts`, and `tsconfig.json` paths mapping.
2. Ensure that any alias or path resolution uses strict absolute fallback strings (e.g., using `path.resolve(__dirname, './src')` or direct absolute string paths like `path.resolve(process.cwd(), 'src')`) so that no `undefined` value is ever passed to `path.resolve()`, regardless of whether the config is loaded via ESM, CJS, or custom bundler loaders in CI.
3. Provide the exact, verified, production-ready code blocks for both `vite.config.ts` and `vitest.config.ts` that guarantee zero build-time type errors or path evaluation failures.
  
