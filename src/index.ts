import type {
  AdvancedSearchResponse,
  BusinessEstablishmentsResponse,
  FileResponse,
  QueryNitResponse,
  RuesFetchOptions,
  RuesResponse,
} from "./types";

export type {
  AdvancedSearchResponse,
  BusinessEstablishment,
  BusinessEstablishmentsResponse,
  BusinessRecord,
  CompanyRecord,
  File,
  FileResponse,
  StoreFront,
  TourismRegistry,
} from "./types";

const baseUrl = "https://ruesapi.rues.org.co";

type WithOptions<T = unknown> = T & {
  signal?: AbortSignal;
};

export function advancedSearch({
  query,
  signal,
  token,
}: WithOptions<{
  query:
    | { cod_camara?: string; matricula: string }
    | { cod_camara?: string; nit: number }
    | { cod_camara?: string; razon: string };
  token: string;
}>) {
  return ruesApi<AdvancedSearchResponse>({
    body: query,
    path: "/api/ConsultasRUES/BusquedaAvanzadaRM",
    signal,
    token,
  });
}

export function getBusinessDetails(registrationId: string) {
  const businessRegistrationNumber = registrationId.slice(-10);
  const chamberCode = registrationId
    .replace(businessRegistrationNumber, "")
    .padStart(2, "0");
  return {
    businessRegistrationNumber,
    chamberCode,
  };
}

export function getBusinessEstablishments({
  query,
  signal,
  token,
}: WithOptions<{
  query: { businessRegistrationNumber: string; chamberCode: string };
  token: string;
}>) {
  return ruesApi<BusinessEstablishmentsResponse>({
    path: "/api/PropietarioEstXCamaraYMatricula",
    searchParams: new URLSearchParams({
      codigo_camara: query.chamberCode,
      matricula: query.businessRegistrationNumber,
    }),
    signal,
    token,
  });
}

export async function getFile({
  registrationId,
  signal,
}: WithOptions<{
  registrationId: string;
}>) {
  return ruesApi<FileResponse>({
    method: "GET",
    path: `/WEB2/api/Expediente/DetalleRM/${registrationId}`,
    signal,
  });
}

export function getLegalRepresentativePowers({
  query,
  signal,
  token,
}: WithOptions<{
  query: { chamberCode: string; registrationNumber: string };
  token: string;
}>) {
  return ruesApi<string>({
    path: "/api/ConsultFacultadesXCamYMatricula",
    searchParams: new URLSearchParams({
      codigo_camara: query.chamberCode,
      matricula: query.registrationNumber,
    }),
    signal,
    token,
  });
}

export async function getToken({ signal }: WithOptions = {}) {
  try {
    const response = await ruesFetch({
      path: "/WEB2/api/Token/ObtenerToken",
      signal,
    });
    const data = await response.json();
    const token = response.headers.get("tokenRuesAPI");
    if (!token || !response.ok) {
      return {
        error: data,
        status: "error",
        statusCode: response.status,
      } as const;
    }
    return {
      data: { token },
      status: "success",
      statusCode: response.status,
    } as const;
  } catch (error) {
    return {
      error,
      status: "error",
    } as const;
  }
}

export async function queryNit({
  nit,
  signal,
  token,
}: WithOptions<{
  nit: number;
  token: string;
}>) {
  return ruesApi<QueryNitResponse>({
    path: "/api/consultasRUES/ConsultaNIT",
    searchParams: new URLSearchParams({
      nit: String(nit),
      usuario: "",
    }),
    signal,
    token,
  });
}

async function ruesApi<T>(options: RuesFetchOptions): Promise<RuesResponse<T>> {
  try {
    const response = await ruesFetch(options);
    const data = (await response.json()) as
      | T
      | {
          error: {
            code: string;
            message: string;
          };
        };
    if (!response.ok) {
      return {
        error: data,
        status: "error",
        statusCode: response.status,
      } as const;
    }
    if (
      typeof data === "object" &&
      data !== null &&
      "error" in data &&
      Number(data.error.code) !== 0
    ) {
      return {
        error: data.error.message,
        status: "error",
        statusCode: Number(data.error.code),
      };
    }
    return {
      data: data as T,
      status: "success",
      statusCode: response.status,
    } as const;
  } catch (error) {
    return {
      error,
      status: "error",
    } as const;
  }
}

async function ruesFetch({
  body,
  method = "POST",
  path,
  searchParams,
  signal,
  token,
}: RuesFetchOptions) {
  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  if (token) {
    headers.append("Authorization", `Bearer ${token}`);
  }
  const url = new URL(path, baseUrl);
  if (searchParams) {
    url.search = searchParams.toString();
  }
  return fetch(url, {
    body: body ? JSON.stringify(body) : undefined,
    headers,
    method,
    signal,
  });
}
