import { getTokenWithPassword } from "..";

const response = await getTokenWithPassword({
  password: process.env.RUES_TOKEN_PASSWORD ?? "",
  username: process.env.RUES_TOKEN_USERNAME ?? "",
});

console.log(response);
