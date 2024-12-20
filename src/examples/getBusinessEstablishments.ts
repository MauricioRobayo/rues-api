import { RUES } from "..";

const tokenResponse = await RUES.getToken();

if (tokenResponse.status === "error") {
  console.error(tokenResponse);
  process.exit(1);
}

const rues = new RUES(tokenResponse.data.token);

const response = await rues.getBusinessEstablishments({
  businessRegistrationNumber: "0001763070",
  chamberCode: "04",
});
console.dir(response, { depth: Infinity });
