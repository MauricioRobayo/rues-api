import { RUES } from "..";

const token = await RUES.getToken();

const rues = new RUES(token);

try {
  const response = await rues.getBusinessEstablishments({
    businessRegistrationNumber: "0001763070",
    chamberCode: "04",
  });
  console.log(response);
} catch (err) {
  console.error(err);
}
