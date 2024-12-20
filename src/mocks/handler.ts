import { http, HttpResponse } from "msw";

export const mockToken = "mock-token";
export const mockFileId = "mock-file-id";
export const mockResponse = { mock: true };
export const mockBusinessRegistrationNumber =
  "mock-business-registration-number";
export const mockChamberCode = "mock-chamber-code";

export const handlers = [
  http.post("https://ruesapi.rues.org.co/WEB2/api/Token/ObtenerToken", () => {
    return HttpResponse.json(mockResponse, {
      headers: {
        tokenRuesAPI: mockToken,
      },
    });
  }),
  http.post(
    "https://ruesapi.rues.org.co/api/ConsultasRUES/BusquedaAvanzadaRM",
    ({ request }) => {
      const authorization = request.headers.get("Authorization");

      if (authorization !== `Bearer ${mockToken}`) {
        return HttpResponse.json(
          {
            Message: "Authorization has been denied for this request.",
          },
          {
            status: 401,
          }
        );
      }

      return HttpResponse.json(mockResponse);
    }
  ),
  http.get(
    "https://ruesapi.rues.org.co/WEB2/api/Expediente/DetalleRM/:id",
    () => HttpResponse.json(mockResponse)
  ),
  http.post(
    "https://ruesapi.rues.org.co/api/PropietarioEstXCamaraYMatricula",
    ({ request }) => {
      const authorization = request.headers.get("Authorization");

      if (authorization !== `Bearer ${mockToken}`) {
        return HttpResponse.json(
          {
            Message: "Authorization has been denied for this request.",
          },
          {
            status: 401,
          }
        );
      }
      return HttpResponse.json(mockResponse);
    }
  ),
];
