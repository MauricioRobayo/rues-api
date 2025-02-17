import { getFile } from "..";

const file = await getFile({ registrationId: "210037256304" });
console.dir(file, { depth: Infinity });
