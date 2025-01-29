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
  File,
  FileResponse,
} from "./types";

const baseUrl = "https://ruesapi.rues.org.co";

export function advancedSearch({
  query,
  token,
}: {
  query: { matricula: string } | { nit: number } | { razon: string };
  token: string;
}) {
  return ruesApi<AdvancedSearchResponse>({
    body: query,
    path: "/api/ConsultasRUES/BusquedaAvanzadaRM",
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
  token,
}: {
  query: { businessRegistrationNumber: string; chamberCode: string };
  token: string;
}) {
  return ruesApi<BusinessEstablishmentsResponse>({
    path: "/api/PropietarioEstXCamaraYMatricula",
    searchParams: new URLSearchParams({
      codigo_camara: query.chamberCode,
      matricula: query.businessRegistrationNumber,
    }),
    token,
  });
}

export async function getFile(registrationId: string) {
  return ruesApi<FileResponse>({
    method: "GET",
    path: `/WEB2/api/Expediente/DetalleRM/${registrationId}`,
  });
}

export async function getToken(): RuesResponse<{ token: string }> {
  try {
    const response = await ruesFetch({
      path: "/WEB2/api/Token/ObtenerToken",
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

export async function queryNit({ nit, token }: { nit: number; token: string }) {
  return ruesApi<QueryNitResponse>({
    path: "/api/consultasRUES/ConsultaNIT",
    searchParams: new URLSearchParams({
      nit: String(nit),
      usuario: "",
    }),
    token,
  });
}

async function ruesApi<T>(options: RuesFetchOptions): RuesResponse<T> {
  try {
    const response = await ruesFetch(options);
    const data = await response.json();
    if (!response.ok) {
      return {
        error: data,
        status: "error",
        statusCode: response.status,
      } as const;
    }
    return {
      data: data as T,
      status: "success",
      statusCode: response.status,
    };
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
  });
}
