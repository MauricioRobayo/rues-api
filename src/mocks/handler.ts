import {
  type DefaultBodyType,
  http,
  HttpResponse,
  type StrictRequest,
} from "msw";

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
      if (!validateRequest(request)) {
        return unauthorized();
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
      if (!validateRequest(request)) {
        return unauthorized();
      }
      return HttpResponse.json(mockResponse);
    }
  ),
];

function validateRequest(request: StrictRequest<DefaultBodyType>) {
  const authorization = request.headers.get("Authorization");
  return authorization === `Bearer ${mockToken}`;
}
