import { getLegalRepresentativePowers, getToken } from "..";

const tokenResponse = await getToken();

if (tokenResponse.status === "error") {
  console.error(tokenResponse);
  process.exit(1);
}

const response = await getLegalRepresentativePowers({
  query: {
    registrationNumber: "0001763070",
    chamberCode: "04",
  },
  token: tokenResponse.data.token,
});
console.log(response);
