import {
  type DefaultBodyType,
  http,
  HttpResponse,
  type StrictRequest,
} from "msw";

import { baseUrl } from "..";

export const mockToken = "mock-token";
export const mockFileId = "mock-file-id";
export const mockResponse = { mock: true };
export const mockBusinessRegistrationNumber =
  "mock-business-registration-number";
export const mockChamberCode = "mock-chamber-code";

const unauthorized = () =>
  HttpResponse.json(
    {
      Message: "Authorization has been denied for this request.",
    },
    {
      status: 401,
    }
  );

export const handlers = [
  http.post(`${baseUrl}/WEB2/api/Token/ObtenerToken`, () => {
    return HttpResponse.json(mockResponse, {
      headers: {
        tokenRuesAPI: mockToken,
      },
    });
  }),
  http.post(
    `${baseUrl}/api/ConsultasRUES/BusquedaAvanzadaRM`,
    ({ request }) => {
      if (!validateRequest(request)) {
        return unauthorized();
      }
      return HttpResponse.json(mockResponse);
    }
  ),
  http.get(`${baseUrl}/WEB2/api/Expediente/DetalleRM/:id`, () =>
    HttpResponse.json(mockResponse)
  ),
  http.post(`${baseUrl}/api/PropietarioEstXCamaraYMatricula`, ({ request }) => {
    if (!validateRequest(request)) {
      return unauthorized();
    }
    return HttpResponse.json(mockResponse);
  }),
  http.post(`${baseUrl}/api/consultasRUES/ConsultaNIT`, async ({ request }) => {
    console.log("msw", request);

    await new Promise((resolve) => setTimeout(resolve, 500));

    if (!validateRequest(request)) {
      return unauthorized();
    }
    return HttpResponse.json(mockResponse);
  }),
];

function validateRequest(request: StrictRequest<DefaultBodyType>) {
  const authorization = request.headers.get("Authorization");
  return authorization === `Bearer ${mockToken}`;
}
