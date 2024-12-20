import { afterAll, afterEach, beforeAll, describe, expect, test } from "vitest";

import { RUES } from ".";
import { mockFileId, mockResponse } from "./mocks/handler";
import { server } from "./mocks/node";

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("advancedSearch", () => {
  test("should get a business record if given a valid token", async () => {
    const token = await getToken();
    const rues = new RUES(token);
    const response = await rues.advancedSearch({ nit: 900000000 });

    expect(response).toMatchObject({
      data: mockResponse,
      status: "success",
      statusCode: 200,
    });
  });

  test("should throw an error if given an invalid token", async () => {
    const rues = new RUES("invalid-token");

    const data = await rues.advancedSearch({ nit: 900000000 });
    expect(data).toMatchObject({
      data: { Message: "Authorization has been denied for this request." },
      status: "error",
      statusCode: 401,
    });
  });

  test("should throw an error if no token is provided", async () => {
    const rues = new RUES();

    const data = await rues.advancedSearch({ nit: 900000000 });
    expect(data).toMatchObject({
      data: {
        message:
          "Please provide a token when instantiating the class. You can get a token using the static getToken method: `const token = await RUES.getToken()`",
      },
      status: "error",
      statusCode: 401,
    });
  });
});

describe("getFile", () => {
  test("should get the file given an id", async () => {
    const rues = new RUES();
    const response = await rues.getFile(mockFileId);

    expect(response).toMatchObject({
      data: mockResponse,
      status: "success",
      statusCode: 200,
    });
  });
});

describe("getEstablishments", () => {
  test("should get business establishments given a business registration number and chamber code", async () => {
    const token = await getToken();
    const rues = new RUES(token);
    const response = await rues.getBusinessEstablishments({
      businessRegistrationNumber: "123",
      chamberCode: "456",
    });

    expect(response).toMatchObject({
      data: mockResponse,
      status: "success",
      statusCode: 200,
    });
  });

  test("should throw an error if given an invalid token", async () => {
    const rues = new RUES("invalid-token");

    const response = await rues.advancedSearch({ nit: 900000000 });
    expect(response).toMatchObject({
      data: { Message: "Authorization has been denied for this request." },
      status: "error",
      statusCode: 401,
    });
  });
});

async function getToken() {
  const { data, status } = await RUES.getToken();
  if (status === "error") {
    throw new Error("Failed to get token");
  }
  return data.token;
}
