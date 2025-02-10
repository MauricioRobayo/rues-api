import { getToken, queryNit } from "..";

const tokenResponse = await getToken();

if (tokenResponse.status === "error") {
  console.error(tokenResponse);
  process.exit(1);
}

const response = await queryNit({
  nit: 90012235,
  token: tokenResponse.data.token,
});

console.dir(response, { depth: Infinity });
