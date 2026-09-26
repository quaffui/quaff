import runDocgen from "../docgen/run.js";

await runDocgen({ targets: process.argv.slice(2) });
