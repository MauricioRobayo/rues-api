import { RUES } from "..";

// No token needed for this endpoint.
const rues = new RUES();

try {
  const file = await rues.getFile("210037256304");
  console.dir(file, { depth: Infinity });
} catch (err) {
  console.error(err);
}
