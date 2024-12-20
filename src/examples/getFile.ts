import { RUES } from "..";

// No token needed for this endpoint.
const rues = new RUES();

try {
  const file = await rues.getFile("210037256304");
  console.log(file);
} catch (err) {
  console.error(err);
}
