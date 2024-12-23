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

beforeAll(() => {
  server.listen();
});
afterEach(() => {
  server.resetHandlers();
  vi.clearAllMocks();
});
afterAll(() => {
  server.close();
});

describe("getToken", () => {
  test("get a token", async () => {
    const response = await RUES.getToken();

    expect(response).toMatchObject({
      data: { token: mockToken },
      status: "success",
      statusCode: 200,
    });
  });

  test("retry 2 times if fetch throws", async () => {
    const consoleLogSpy = getConsoleLogSpy();
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

  test("retry 2 times if fetch returns status code other than success", async () => {
    const consoleLogSpy = getConsoleLogSpy();
    server.use(
      http.post(
        "https://ruesapi.rues.org.co/WEB2/api/Token/ObtenerToken",
        () => {
          return HttpResponse.json(
            {
              message: "Internal server error",
            },
            {
              status: 500,
            }
          );
        }
      )
    );

    const response = await RUES.getToken({ minTimeout: 0, retries: 2 });

    expect(consoleLogSpy).toHaveBeenCalledTimes(2);
    expect(consoleLogSpy).toHaveBeenCalledWith(
      "Attempt 1: 500 Failed to fetch"
    );
    expect(consoleLogSpy).toHaveBeenCalledWith(
      "Attempt 2: 500 Failed to fetch"
    );
    expect(response).toMatchObject({
      data: {},
      status: "error",
      statusCode: 500,
    });
  });
});

describe("advancedSearch", () => {
  test("get a business record if given a valid token", async () => {
    const token = await getToken();
    const rues = new RUES(token);
    const response = await rues.advancedSearch({ query: { nit: 900000000 } });

    expect(response).toMatchObject({
      data: mockResponse,
      status: "success",
      statusCode: 200,
    });
  });

  test("no retries if invalid token is given", async () => {
    const consoleLogSpy = getConsoleLogSpy();
    const rues = new RUES("invalid-token");
    const data = await rues.advancedSearch({ query: { nit: 900000000 } });

    expect(consoleLogSpy).toHaveBeenCalledTimes(0);
    expect(data).toMatchObject({
      data: {},
      status: "error",
      statusCode: 401,
    });
  });

  test("no retries if no token is provided", async () => {
    const consoleLogSpy = getConsoleLogSpy();
    const rues = new RUES();

    const data = await rues.advancedSearch({ query: { nit: 900000000 } });
    expect(consoleLogSpy).toHaveBeenCalledTimes(0);
    expect(data).toMatchObject({
      data: {
        message: "Missing token.",
      },
      status: "error",
    });
  });

  test("retry when fetch throws", async () => {
    const consoleLogSpy = getConsoleLogSpy();
    server.use(
      http.post(
        "https://ruesapi.rues.org.co/api/ConsultasRUES/BusquedaAvanzadaRM",
        () => {
          return HttpResponse.error();
        }
      )
    );
    const rues = new RUES(mockToken);

    const data = await rues.advancedSearch({
      query: { nit: 900000000 },
      retryOptions: {
        minTimeout: 0,
        retries: 2,
      },
    });
    expect(consoleLogSpy).toHaveBeenCalledTimes(2);
    expect(consoleLogSpy).toHaveBeenCalledWith("Attempt 1: Failed to fetch");
    expect(consoleLogSpy).toHaveBeenCalledWith("Attempt 2: Failed to fetch");
    expect(data).toMatchObject({
      data: {},
      status: "error",
    });
  });

  test("retry when fetch fails with any error other than 401", async () => {
    const consoleLogSpy = getConsoleLogSpy();
    server.use(
      http.post(
        "https://ruesapi.rues.org.co/api/ConsultasRUES/BusquedaAvanzadaRM",
        () => {
          return HttpResponse.json(
            {
              Message: "Internal server error",
            },
            {
              status: 500,
            }
          );
        }
      )
    );
    const rues = new RUES(mockToken);
    const data = await rues.advancedSearch({
      query: { nit: 900000000 },
      retryOptions: {
        minTimeout: 0,
        retries: 2,
      },
    });

    expect(consoleLogSpy).toHaveBeenCalledTimes(2);
    expect(consoleLogSpy).toHaveBeenCalledWith(
      "Attempt 1: 500 Failed to fetch"
    );
    expect(consoleLogSpy).toHaveBeenCalledWith(
      "Attempt 2: 500 Failed to fetch"
    );
    expect(data).toMatchObject({
      data: {},
      status: "error",
      statusCode: 500,
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

describe.skip("getEstablishments", () => {
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

function getConsoleLogSpy() {
  return vi.spyOn(console, "log").mockImplementation(() => null);
}
