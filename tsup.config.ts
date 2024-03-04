import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["./src/main.ts"],
    format: ['cjs', 'esm'],
    dts: {
        footer: "declare module 'yellownet-server';"
    },
    shims: true,
    skipNodeModulesBundle: true,
    clean: true,
    sourcemap: true
})