import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  test,
  vi,
} from "vitest";

import * as RUES from ".";
import { mockFileId, mockResponse, mockToken } from "./mocks/handler";
import { server } from "./mocks/node";

beforeAll(() => {
  server.listen();
});
afterEach(() => {
  server.resetHandlers();
});
afterAll(() => {
  server.close();
});

test("getToken", async () => {
  const response = await RUES.getToken();
  if (response.status === "error") {
    throw new Error("Failed to get token");
  }

  expect(response).toMatchObject({
    data: { token: mockToken },
    status: "success",
    statusCode: 200,
  });
});

describe("advancedSearch", () => {
  test("successful response", async () => {
    const response = await RUES.advancedSearch({
      query: { nit: 900000000 },
      token: mockToken,
    });

    expect(response).toMatchObject({
      data: mockResponse,
      status: "success",
      statusCode: 200,
    });
  });
  test("failed response", async () => {
    const response = await RUES.advancedSearch({
      query: { nit: 900000000 },
      token: "invalid-token",
    });
    expect(response).toMatchObject({
      error: { Message: "Authorization has been denied for this request." },
      status: "error",
      statusCode: 401,
    });
  });
});

test("getFile", async () => {
  const response = await RUES.getFile(mockFileId);

  expect(response).toMatchObject({
    data: mockResponse,
    status: "success",
    statusCode: 200,
  });
});

describe("getEstablishments", () => {
  test("successful response", async () => {
    const response = await RUES.getBusinessEstablishments({
      query: {
        businessRegistrationNumber: "123",
        chamberCode: "456",
      },
      token: mockToken,
    });

    expect(response).toMatchObject({
      data: mockResponse,
      status: "success",
      statusCode: 200,
    });
  });

  test("failed response", async () => {
    const response = await RUES.getBusinessEstablishments({
      query: {
        businessRegistrationNumber: "123",
        chamberCode: "456",
      },
      token: "invalid-token",
    });
    expect(response).toMatchObject({
      error: { Message: "Authorization has been denied for this request." },
      status: "error",
      statusCode: 401,
    });
  });
});
