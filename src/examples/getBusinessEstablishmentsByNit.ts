import { RUES } from "..";

const token = await RUES.getToken();
const rues = new RUES(token);

try {
  const response = await rues.getBusinessEstablishmentsByNit("900122353");
  console.log(response);
} catch (err) {
  console.error(err);
}
