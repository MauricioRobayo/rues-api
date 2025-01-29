import type {
  AdvancedSearchResponse,
  BusinessEstablishmentsResponse,
  FileResponse,
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

import { HttpError } from "./httpError";

const baseUrl = "https://ruesapi.rues.org.co";

export async function advancedSearch({
  query,
  token,
}: {
  query: { matricula: string } | { nit: number } | { razon: string };
  token: string;
}): RuesResponse<AdvancedSearchResponse> {
  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  headers.append("Authorization", `Bearer ${token}`);

  const requestOptions = {
    body: JSON.stringify(query),
    headers: headers,
    method: "POST",
  };

  try {
    const response = await fetch(
      `${baseUrl}/api/ConsultasRUES/BusquedaAvanzadaRM`,
      requestOptions
    );

    const data = await response.json();

    if (response.ok) {
      return {
        data: data as AdvancedSearchResponse,
        status: "success",
        statusCode: response.status,
      } as const;
    }

    if (!response.ok) {
      throw new HttpError(response.status, "Failed to fetch");
    }

    return {
      data,
      status: "error",
      statusCode: response.status,
    } as const;
  } catch (error) {
    return failedRequestResponse(error);
  }
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

export async function getBusinessEstablishments({
  query,
  token,
}: {
  query: { businessRegistrationNumber: string; chamberCode: string };
  token: string;
}): RuesResponse<BusinessEstablishmentsResponse> {
  const searchParams = new URLSearchParams({
    codigo_camara: query.chamberCode,
    matricula: query.businessRegistrationNumber,
  });
  try {
    const response = await fetch(
      `${baseUrl}/api/PropietarioEstXCamaraYMatricula?${searchParams}`,
      {
        headers: {
          authorization: `Bearer ${token}`,
          "content-type": "application/json",
        },
        method: "POST",
      }
    );
    const data = await response.json();
    if (!response.ok) {
      return {
        data,
        status: "error",
        statusCode: response.status,
      } as const;
    }
    return {
      data: data as BusinessEstablishmentsResponse,
      status: "success",
      statusCode: response.status,
    } as const;
  } catch (error) {
    return failedRequestResponse(error);
  }
}

export async function getFile({
  id,
}: {
  id: string;
}): RuesResponse<FileResponse> {
  try {
    const response = await fetch(
      `${baseUrl}/WEB2/api/Expediente/DetalleRM/${id}`
    );

    const data = await response.json();
    if (!response.ok) {
      throw new HttpError(response.status, "Failed to fetch");
    }
    return {
      data: data as FileResponse,
      status: "success",
      statusCode: response.status,
    } as const;
  } catch (error) {
    return failedRequestResponse(error);
  }
}

export async function getToken(): RuesResponse<{ token: string }> {
  try {
    const response = await fetch(`${baseUrl}/WEB2/api/Token/ObtenerToken`, {
      method: "POST",
    });
    if (!response.ok) {
      throw new HttpError(response.status, "Failed to fetch");
    }
    const token = response.headers.get("tokenRuesAPI");
    const data = await response.json();
    if (!token) {
      return {
        data,
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
    return failedRequestResponse(error);
  }
}

function failedRequestResponse(error: unknown) {
  if (error instanceof HttpError) {
    return {
      data: {
        message: error.message,
      },
      status: "error",
      statusCode: error.statusCode,
    } as const;
  }
  if (error instanceof TypeError) {
    return {
      data: { message: error.message },
      status: "error",
    } as const;
  }
  return {
    data: error,
    status: "error",
  } as const;
}
