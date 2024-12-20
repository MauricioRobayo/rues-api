import { RUES } from "..";

const token = await RUES.getToken();
const rues = new RUES(token);

// try {
//   const response = await rues.advancedSearch({ nit: "900122353" });
//   console.log(response);
// } catch (err) {
//   console.error(err);
// }

try {
  const response = await rues.advancedSearch({
    razon: "ALMACENES EXITO S.A",
  });
  console.log(response);
} catch (err) {
  console.error(err);
}
