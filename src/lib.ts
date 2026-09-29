// Bundle entry for the library build: pulls in the component styles (emitted as dist/style.css)
// and re-exports the public API. Kept apart from index.ts so the emitted .d.ts files carry no
// stylesheet imports, which consumers' TypeScript could not resolve.
import "./assets/css/_vuetable.scss";

export * from "./index";
export { default } from "./index";
