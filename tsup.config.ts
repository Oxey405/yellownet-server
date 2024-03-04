import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["src/main.ts"],
    format: ['cjs', 'esm'],
    dts: true,
    shims: true,
    skipNodeModulesBundle: true,
    clean: true,
    sourcemap: true
})