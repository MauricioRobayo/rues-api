import retry from "async-retry";

import type {
  AdvancedSearchResponse,
  BusinessEstablishmentsResponse,
  FileResponse,
  RetryOptions,
  RuesResponse,
  WithRetryOptions,
} from "./types";

import { HttpError } from "./httpError";

const defaultRetryOptions: RetryOptions = {
  minTimeout: 1000,
  retries: 3,
};
export class RUES {
  private static readonly baseUrl = "https://ruesapi.rues.org.co";
  get baseUrl() {
    return RUES.baseUrl;
  }

  private readonly retryOptions: RetryOptions = {};

  constructor(
    private readonly token?: string,
    {
      minTimeout = defaultRetryOptions.minTimeout,
      retries = defaultRetryOptions.retries,
    }: RetryOptions = {}
  ) {
    this.retryOptions = {
      minTimeout,
      retries,
    };
  }

  static getBusinessDetails(businessRegistrationId: string) {
    const businessRegistrationNumber = businessRegistrationId.slice(-10);
    const chamberCode = businessRegistrationId
      .replace(businessRegistrationNumber, "")
      .padStart(2, "0");
    return {
      businessRegistrationNumber,
      chamberCode,
    };
  }

  static async getToken({
    minTimeout = defaultRetryOptions.minTimeout,
    retries = defaultRetryOptions.retries,
  }: RetryOptions = {}): RuesResponse<{ token: string }> {
    const fetchToken = async () => {
      const response = await fetch(
        `${RUES.baseUrl}/WEB2/api/Token/ObtenerToken`,
        {
          method: "POST",
        }
      );
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
    };

    try {
      const response = await retry(fetchToken, {
        minTimeout,
        onRetry,
        retries,
      });
      return response;
    } catch (error) {
      return failedRequestResponse(error);
    }
  }

  async advancedSearch({
    query,
    retryOptions,
    token = this.token,
  }: WithRetryOptions<{
    query: { matricula: string } | { nit: number } | { razon: string };
    token?: string;
  }>): RuesResponse<AdvancedSearchResponse> {
    if (!token) {
      return {
        data: {
          message: "Missing token.",
        },
        status: "error",
      };
    }

    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Authorization", `Bearer ${this.token}`);

    const fetchRues = async (bail: (e: unknown) => void) => {
      const requestOptions = {
        body: JSON.stringify(query),
        headers: headers,
        method: "POST",
      };
      const response = await fetch(
        `${RUES.baseUrl}/api/ConsultasRUES/BusquedaAvanzadaRM`,
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

      if (response.status === 401) {
        bail(new HttpError(401, "Unauthorized"));
      } else {
        throw new HttpError(response.status, "Failed to fetch");
      }
      return {
        data,
        status: "error",
        statusCode: response.status,
      } as const;
    };

    try {
      const response = await retry(fetchRues, {
        ...{ ...this.retryOptions, ...retryOptions },
        onRetry,
      });
      return response;
    } catch (error) {
      return failedRequestResponse(error);
    }
  }

  async getBusinessEstablishments({
    query,
    retryOptions,
    token = this.token,
  }: WithRetryOptions<{
    query: { businessRegistrationNumber: string; chamberCode: string };
    token?: string;
  }>): RuesResponse<BusinessEstablishmentsResponse> {
    if (!token) {
      return {
        data: {
          message: "Missing token.",
        },
        status: "error",
      };
    }

    const fetchBusinessEstablishments = async () => {
      const searchParams = new URLSearchParams({
        codigo_camara: query.chamberCode,
        matricula: query.businessRegistrationNumber,
      });
      const response = await fetch(
        `${RUES.baseUrl}/api/PropietarioEstXCamaraYMatricula?${searchParams}`,
        {
          headers: {
            authorization: `Bearer ${this.token}`,
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
    };

    try {
      const response = await retry(fetchBusinessEstablishments, {
        ...{ ...this.retryOptions, ...retryOptions },
        onRetry,
      });
      return response;
    } catch (error) {
      return failedRequestResponse(error);
    }
  }

  async getFile({
    id,
    retryOptions,
  }: WithRetryOptions<{ id: string }>): RuesResponse<FileResponse> {
    const fetchFile = async () => {
      const response = await fetch(
        `${RUES.baseUrl}/WEB2/api/Expediente/DetalleRM/${id}`
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
    };

    try {
      const response = await retry(fetchFile, {
        ...{ ...this.retryOptions, ...retryOptions },
        onRetry,
      });
      return response;
    } catch (error) {
      return failedRequestResponse(error);
    }
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

function onRetry(error: unknown, attempt: number) {
  if (error instanceof HttpError) {
    console.log(`Attempt ${attempt}: ${error.statusCode} ${error.message}`);
    return;
  }
  if (error instanceof TypeError) {
    console.log(`Attempt ${attempt}: ${error.message}`);
    return;
  }
  console.log(`Attempt ${attempt}: ${error}`);
}
