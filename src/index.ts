import retry from "async-retry";

import { HttpError } from "./httpError";

export interface AdvancedSearchResponse {
  cant_registros: number;
  error: Error;
  fecha_respuesta: string;
  hora_respuesta: string;
  registros?: BusinessRecord[];
}

export interface File {
  camara: string;
  categoria_matricula: string;
  ciiu3: string;
  ciiu4: string;
  clase_identificacion: string;
  cod_camara: string;
  cod_ciiu_act_econ_pri: string;
  cod_ciiu_act_econ_sec: string;
  cod_tipo_sociedad: string;
  desc_ciiu3: string;
  desc_ciiu4: string;
  desc_ciiu_act_econ_pri: string;
  desc_ciiu_act_econ_sec: string;
  dir_comercial: null;
  dir_fiscal: null;
  dv: string;
  email_com: null;
  email_fiscal: null;
  estado: string;
  extincion_dominio: string;
  fecha_actualizacion: string;
  fecha_cancelacion: string;
  fecha_matricula: string;
  fecha_renovacion: string;
  fecha_vigencia: string;
  id: string;
  indicador_emprendimiento_social: string;
  matricula: string;
  motivo_cancelacion: string;
  mun_comercial: null | string;
  mun_fiscal: null | string;
  numero_identificacion: string;
  numero_identificacion_2: string;
  organizacion_juridica: string;
  razon_social: string;
  sigla: null | string;
  tel_com_1: null | string;
  tel_com_2: null | string;
  tel_com_3: null | string;
  tel_fiscal_1: null | string;
  tel_fiscal_2: null | string;
  tel_fiscal_3: null | string;
  tipo_sociedad: string;
  ultimo_ano_renovado: string;
  url_venta_certificados: string;
}

export interface FileResponse {
  codigo_error: string;
  fecha_respuesta: Date;
  hora_respuesta: string;
  mensaje_error: null;
  registros: File;
}

interface BusinessEstablishment {
  CATEGORIA_MATRICULA: string;
  CODIGO_CAMARA: string;
  CODIGO_CATEGORIA_MATRICULA: string;
  CODIGO_CLASE_IDENTIFICACION: string;
  CODIGO_ESTADO_MATRICULA: string;
  CODIGO_ORGANIZACION_JURIDICA: string;
  CODIGO_TIPO_SOCIEDAD: string;
  DESC_CAMARA: string;
  DESC_ESTADO_MATRICULA: "ACTIVA" | "CANCELADA";
  DESC_ORGANIZACION_JURIDICA: string;
  DESC_TIPO_SOCIEDAD: string;
  DIGITO_VERIFICACION: string;
  FECHA_MATRICULA: string;
  FECHA_RENOVACION: string;
  MATRICULA: string;
  NUMERO_IDENTIFICACION: string;
  RAZON_SOCIAL: string;
  SIGLA: string;
  ULTIMO_ANO_RENOVADO: number;
}
interface BusinessEstablishmentsResponse {
  cant_Registros: number;
  code: string;
  fecha_respuesta: string;
  hora_respuesta: string;
  message: string;
  registros?: BusinessEstablishment[];
}

interface BusinessRecord {
  categoria: string;
  cod_camara: string;
  dv: string;
  estado_matricula: string;
  id_rm: string;
  matricula: string;
  nit: string;
  nom_camara: string;
  organizacion_juridica: string;
  razon_social: string;
  sigla: string;
  tipo_documento: string;
  ultimo_ano_renovado: string;
}

interface RetryOptions {
  minTimeout?: number;
  retries?: number;
}

const defaultRetryOptions: RetryOptions = { minTimeout: 1000, retries: 3 };

type RuesResponse<T> = Promise<
  | { data: T; status: "success"; statusCode: number }
  | { data: unknown; status: "error"; statusCode?: number }
>;

export class RUES {
  private static readonly baseUrl = "https://ruesapi.rues.org.co";

  get baseUrl() {
    return RUES.baseUrl;
  }

  constructor(private readonly token?: string) {}

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
    try {
      const response = await retry(
        async () => {
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
        },
        {
          minTimeout,
          onRetry,
          retries,
        }
      );
      return response;
    } catch (error) {
      return failedRequestResponse(error);
    }
  }

  async advancedSearch({
    query,
    retryOptions: {
      minTimeout = defaultRetryOptions.minTimeout,
      retries = defaultRetryOptions.retries,
    } = {},
    token = this.token,
  }: {
    query: { matricula: string } | { nit: number } | { razon: string };
    retryOptions?: RetryOptions;
    token?: string;
  }): RuesResponse<AdvancedSearchResponse> {
    if (!token) {
      return {
        data: {
          message: "Missing token.",
        },
        status: "error",
      };
    }

    try {
      const headers = new Headers();
      headers.append("Content-Type", "application/json");
      headers.append("Authorization", `Bearer ${this.token}`);

      const requestOptions = {
        body: JSON.stringify(query),
        headers: headers,
        method: "POST",
      };

      const response = await retry(
        async (bail) => {
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
        },
        {
          minTimeout,
          onRetry,
          retries,
        }
      );
      return response;
    } catch (error) {
      return failedRequestResponse(error);
    }
  }

  async getBusinessEstablishments({
    query,
    retryOptions: {
      minTimeout = defaultRetryOptions.minTimeout,
      retries = defaultRetryOptions.retries,
    } = {},
  }: {
    query: { businessRegistrationNumber: string; chamberCode: string };
    retryOptions?: RetryOptions;
  }): RuesResponse<BusinessEstablishmentsResponse> {
    if (!this.token) {
      return {
        data: {
          message:
            "Please provide a token when instantiating the class. You can get a token using the static getToken method: `const token = await RUES.getToken()`",
        },
        status: "error",
        statusCode: 401,
      };
    }

    try {
      const response = await retry(
        async () => {
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
        },
        {
          minTimeout,
          onRetry: (error, attempt) => {
            console.log(`Attempt ${attempt}: ${error}`);
          },
          retries,
        }
      );
      return response;
    } catch (error) {
      return {
        data: error,
        status: "error",
      };
    }
  }

  async getBusinessEstablishmentsByNit(
    nit: number,
    {
      minTimeout = defaultRetryOptions.minTimeout,
      retries = defaultRetryOptions.retries,
    }: RetryOptions = {}
  ) {
    const response = await this.advancedSearch({
      query: { nit },
      retryOptions: { minTimeout, retries },
    });
    if (response.status === "error") {
      return response;
    }
    const businessRegistrationId = response.data.registros?.at(0)?.id_rm;
    if (!businessRegistrationId) {
      throw new Error("NIT not found!");
    }
    const { businessRegistrationNumber, chamberCode } = RUES.getBusinessDetails(
      businessRegistrationId
    );
    return this.getBusinessEstablishments({
      query: {
        businessRegistrationNumber,
        chamberCode,
      },
      retryOptions: { minTimeout, retries },
    });
  }

  async getFile(id: string): RuesResponse<FileResponse> {
    try {
      const response = await fetch(
        `${RUES.baseUrl}/WEB2/api/Expediente/DetalleRM/${id}`
      );
      const data = await response.json();
      if (!response.ok) {
        return {
          data,
          status: "error",
          statusCode: response.status,
        };
      }
      return {
        data: data as FileResponse,
        status: "success",
        statusCode: response.status,
      };
    } catch (error) {
      return {
        data: error,
        status: "error",
      };
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
