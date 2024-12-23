import { http, HttpResponse } from "msw";
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  test,
  vi,
} from "vitest";

import { RUES } from ".";
import { mockFileId, mockResponse, mockToken } from "./mocks/handler";
import { server } from "./mocks/node";

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("getToken", () => {
  test("should get a token", async () => {
    const response = await RUES.getToken();

    expect(response).toMatchObject({
      data: { token: mockToken },
      status: "success",
      statusCode: 200,
    });
  });

  test("should retry 2 times if the request fails", async () => {
    const consoleLogSpy = vi.spyOn(console, "log");
    server.use(
      http.post(
        "https://ruesapi.rues.org.co/WEB2/api/Token/ObtenerToken",
        () => {
          return HttpResponse.error();
        }
      )
    );

    const response = await RUES.getToken({ minTimeout: 0, retries: 2 });

    expect(consoleLogSpy).toHaveBeenCalledTimes(2);
    expect(consoleLogSpy).toHaveBeenCalledWith("Attempt 1: Failed to fetch");
    expect(consoleLogSpy).toHaveBeenCalledWith("Attempt 2: Failed to fetch");
    expect(response).toMatchObject({
      data: {},
      status: "error",
    });
  });
});

describe("advancedSearch", () => {
  test("should get a business record if given a valid token", async () => {
    const token = await getToken();
    const rues = new RUES(token);
    const response = await rues.advancedSearch({ query: { nit: 900000000 } });

    expect(response).toMatchObject({
      data: mockResponse,
      status: "success",
      statusCode: 200,
    });
  });

  test("should throw an error if given an invalid token", async () => {
    const rues = new RUES("invalid-token");

    const data = await rues.advancedSearch({ query: { nit: 900000000 } });
    expect(data).toMatchObject({
      data: { Message: "Authorization has been denied for this request." },
      status: "error",
      statusCode: 401,
    });
  });

  test("should throw an error if no token is provided", async () => {
    const rues = new RUES();

    const data = await rues.advancedSearch({ query: { nit: 900000000 } });
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
      query: {
        businessRegistrationNumber: "123",
        chamberCode: "456",
      },
    });

    expect(response).toMatchObject({
      data: mockResponse,
      status: "success",
      statusCode: 200,
    });
  });

  test("should throw an error if given an invalid token", async () => {
    const rues = new RUES("invalid-token");

    const response = await rues.advancedSearch({ query: { nit: 900000000 } });
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
