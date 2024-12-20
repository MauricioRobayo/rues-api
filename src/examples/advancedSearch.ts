import { RUES } from "..";

const tokenResponse = await RUES.getToken();

if (tokenResponse.status === "error") {
  console.error(tokenResponse);
  process.exit(1);
}

const rues = new RUES(tokenResponse.data.token);

try {
  const response = await rues.advancedSearch({ nit: 900122353 });
  console.dir(response, { depth: Infinity });
} catch (err) {
  console.error(err);
}
