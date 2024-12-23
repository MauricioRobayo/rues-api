import { RUES } from "..";

// No token needed for this endpoint.
const rues = new RUES();

const file = await rues.getFile({ id: "210037256304" });
console.dir(file, { depth: Infinity });
