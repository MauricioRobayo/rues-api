import { advancedSearch, getToken } from "..";

const tokenResponse = await getToken();

if (tokenResponse.status === "error") {
  console.error(tokenResponse);
  process.exit(1);
}

const response = await advancedSearch({
  query: { nit: 900122353 },
  token: tokenResponse.data.token,
});
console.dir(response, { depth: Infinity });
