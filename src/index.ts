import { readFile, writeFile } from "fs/promises";
import path from "path";

const baseUrl = "https://ruesapi.rues.org.co";
const publicDir = path.join(process.cwd(), "public", "establishments");

export interface AdvancedSearchResponse {
  cant_registros: number;
  error: Error;
  fecha_respuesta: string;
  hora_respuesta: string;
  registros?: BusinessRecord[];
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

interface Error {
  code: string;
  message: string;
}

export async function getEstablisments({
  NIT,
  token,
}: {
  NIT: string;
  token?: string;
}) {
  const dataFile = path.join(publicDir, `${NIT}.json`);
  try {
    const data: { chamber: string; name: string; registry: string }[] =
      JSON.parse(await readFile(dataFile, "utf-8"));
    console.log(
      `Found data file for "${NIT}". Returning data from disk with ${data.length} establishments.`
    );
    return data;
  } catch {
    let apiToken = token;
    if (!apiToken) {
      console.log("No token provided. Getting a new token.");
      apiToken = await getToken();
    }
    console.log(`Getting business record for ${NIT}...`);
    const rues = await advancedSearch({
      apiToken,
      query: { Nit: NIT },
    });
    const businessRegistrationId = rues.registros?.at(0)?.id_rm;
    if (!businessRegistrationId) {
      console.error(
        "Cound not find business registration id for",
        NIT,
        JSON.stringify(rues)
      );
      return [];
    }
    const { businessRegistrationNumber, chamberCode } = getBusinessDetails(
      businessRegistrationId
    );
    console.log(
      `Getting business establishments for ${chamberCode} - ${businessRegistrationNumber}...`
    );
    const response = await getBusinessEstablishments({
      apiToken,
      businessRegistrationNumber,
      chamberCode,
    });
    const establishments = (response.registros ?? [])
      .filter((record) => record.DESC_ESTADO_MATRICULA === "ACTIVA")
      .map((record) => ({
        chamber: record.DESC_CAMARA,
        name: record.RAZON_SOCIAL,
        registry: record.MATRICULA,
      }));
    console.log(`Found ${establishments.length} establishments.`);
    await writeFile(dataFile, JSON.stringify(establishments));
    return establishments;
  }
}

async function advancedSearch({
  apiToken,
  query,
}: {
  apiToken: string;
  query:
    | { Cod_Camara: string }
    | { Dpto: string }
    | { Matricula: string }
    | { Nit: string }
    | { Razon: string };
}) {
  const response = await fetch(
    `${baseUrl}/api/ConsultasRUES/BusquedaAvanzadaRM`,
    {
      body: JSON.stringify(query),
      headers: {
        authorization: `Bearer ${apiToken}`,
        "content-type": "application/json",
      },
      method: "POST",
    }
  );
  const data: AdvancedSearchResponse = await response.json();
  return data;
}

function getBusinessDetails(businessRegistrationId: string) {
  const businessRegistrationNumber = businessRegistrationId.slice(-10);
  const chamberCode = businessRegistrationId
    .replace(businessRegistrationNumber, "")
    .padStart(2, "0");
  return {
    businessRegistrationNumber,
    chamberCode,
  };
}

async function getBusinessEstablishments({
  apiToken,
  businessRegistrationNumber,
  chamberCode,
}: {
  apiToken: string;
  businessRegistrationNumber: string;
  chamberCode: string;
}) {
  const searchParams = new URLSearchParams({
    Codigo_camara: chamberCode,
    Matricula: businessRegistrationNumber,
  });
  const response = await fetch(
    `${baseUrl}/api/PropietarioEstXCamaraYMatricula?${searchParams}`,
    {
      headers: {
        authorization: `Bearer ${apiToken}`,
        "content-type": "application/json",
      },
      method: "POST",
    }
  );
  const data: BusinessEstablishmentsResponse = await response.json();
  return data;
}

async function getToken() {
  const response = await fetch(`${baseUrl}/WEB2/api/Token/ObtenerToken`, {
    method: "POST",
  });
  const token = response.headers.get("tokenRuesAPI");
  if (!token) {
    throw new Error("Could not get token");
  }
  console.log(
    `Successfuly got a new token: "${token.slice(0, 4)}${"*".repeat(10)}"`
  );
  return token;
}
