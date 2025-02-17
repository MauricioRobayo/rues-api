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

export function advancedSearch({
  query,
  signal,
  token,
}: {
  query:
    | { cod_camara?: string; matricula: string }
    | { cod_camara?: string; nit: number }
    | { cod_camara?: string; razon: string };
  signal?: AbortSignal;
  token: string;
}) {
  return ruesApi<AdvancedSearchResponse>({
    body: query,
    path: "/api/ConsultasRUES/BusquedaAvanzadaRM",
    signal,
    token,
  });
}

export function getBusinessDetails(businessRegistrationId: string) {
  const businessRegistrationNumber = businessRegistrationId.slice(-10);
  const chamberCode = businessRegistrationId
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
}: {
  query: { businessRegistrationNumber: string; chamberCode: string };
  signal?: AbortSignal;
  token: string;
}) {
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
}: {
  registrationId: string;
  signal?: AbortSignal;
}) {
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
}: {
  query: { businessRegistrationNumber: string; chamberCode: string };
  signal?: AbortSignal;
  token: string;
}) {
  return ruesApi<string>({
    path: "/api/ConsultFacultadesXCamYMatricula",
    searchParams: new URLSearchParams({
      codigo_camara: query.chamberCode,
      matricula: query.businessRegistrationNumber,
    }),
    signal,
    token,
  });
}

export async function getToken({ signal }: { signal?: AbortSignal } = {}) {
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
}: {
  nit: number;
  signal?: AbortSignal;
  token: string;
}) {
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
