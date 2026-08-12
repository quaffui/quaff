import updateAllProps from "../docgen/props/updateAllProps.js";

const targets = process.argv.slice(2);

await updateAllProps(targets.length ? targets : undefined);
