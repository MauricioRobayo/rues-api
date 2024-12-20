import { afterAll, afterEach, beforeAll, describe, expect, test } from "vitest";

import { RUES } from ".";
import { mockFileId, mockResponse, mockToken } from "./mocks/handler";
import { server } from "./mocks/node";

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("advancedSearch", () => {
  test("should get a business record if given a valid token", async () => {
    const token = await RUES.getToken();
    const rues = new RUES(token);
    const response = await rues.advancedSearch({ nit: "900000000" });

    expect(token).toBe(mockToken);
    expect(response).toMatchObject(mockResponse);
  });

  test("should throw an error if given an invalid token", async () => {
    const rues = new RUES("invalid-token");

    await expect(rues.advancedSearch({ nit: "900000000" })).rejects.toThrow(
      /Response status: 401/
    );
  });

  test("should throw an error if no token is provided", async () => {
    const rues = new RUES();

    await expect(rues.advancedSearch({ nit: "900000000" })).rejects.toThrow(
      /Token is required to perform advanced search/
    );
  });
});

describe("getFile", () => {
  test("should get the file given an id", async () => {
    const rues = new RUES();
    const response = await rues.getFile(mockFileId);

    expect(response).toMatchObject(mockResponse);
  });
});

describe("getEstablishments", () => {
  test("should get business establishments given a business registration number and chamber code", async () => {
    const token = await RUES.getToken();
    const rues = new RUES(token);
    const response = await rues.getBusinessEstablishments({
      businessRegistrationNumber: "123",
      chamberCode: "456",
    });

    expect(response).toMatchObject(mockResponse);
  });
  test("should throw an error if given an invalid token", async () => {
    const rues = new RUES("invalid-token");

    await expect(rues.advancedSearch({ nit: "900000000" })).rejects.toThrow(
      /Response status: 401/
    );
  });
});
