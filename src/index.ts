import { readFile, writeFile } from "fs/promises";
import path from "path";

const baseUrl = "https://ruesapi.rues.org.co";
const publicDir = path.join(process.cwd(), "public", "establishments");

export interface AdvancedSearchResponse {
  registros?: BusinessRecord[];
  cant_registros: number;
  fecha_respuesta: string;
  hora_respuesta: string;
  error: Error;
}

interface Error {
  code: string;
  message: string;
}

interface BusinessRecord {
  tipo_documento: string;
  nit: string;
  dv: string;
  id_rm: string;
  razon_social: string;
  sigla: string;
  cod_camara: string;
  nom_camara: string;
  matricula: string;
  organizacion_juridica: string;
  estado_matricula: string;
  ultimo_ano_renovado: string;
  categoria: string;
}

interface BusinessEstablishmentsResponse {
  code: string;
  message: string;
  cant_Registros: number;
  fecha_respuesta: string;
  hora_respuesta: string;
  registros?: BusinessEstablishment[];
}

interface BusinessEstablishment {
  CODIGO_CLASE_IDENTIFICACION: string;
  NUMERO_IDENTIFICACION: string;
  DIGITO_VERIFICACION: string;
  RAZON_SOCIAL: string;
  SIGLA: string;
  CODIGO_CAMARA: string;
  DESC_CAMARA: string;
  MATRICULA: string;
  CODIGO_TIPO_SOCIEDAD: string;
  DESC_TIPO_SOCIEDAD: string;
  CODIGO_ORGANIZACION_JURIDICA: string;
  DESC_ORGANIZACION_JURIDICA: string;
  CODIGO_CATEGORIA_MATRICULA: string;
  CATEGORIA_MATRICULA: string;
  CODIGO_ESTADO_MATRICULA: string;
  DESC_ESTADO_MATRICULA: "ACTIVA" | "CANCELADA";
  FECHA_MATRICULA: string;
  FECHA_RENOVACION: string;
  ULTIMO_ANO_RENOVADO: number;
}

async function getBusinessEstablishments({
  chamberCode,
  businessRegistrationNumber,
  apiToken,
}: {
  chamberCode: string;
  businessRegistrationNumber: string;
  apiToken: string;
}) {
  const searchParams = new URLSearchParams({
    Codigo_camara: chamberCode,
    Matricula: businessRegistrationNumber,
  });
  const response = await fetch(
    `${baseUrl}/api/PropietarioEstXCamaraYMatricula?${searchParams}`,
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiToken}`,
        "content-type": "application/json",
      },
    }
  );
  const data: BusinessEstablishmentsResponse = await response.json();
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

async function advancedSearch({
  apiToken,
  query,
}: {
  apiToken: string;
  query:
    | { Nit: string }
    | { Razon: string }
    | { Dpto: string }
    | { Cod_Camara: string }
    | { Matricula: string };
}) {
  const response = await fetch(
    `${baseUrl}/api/ConsultasRUES/BusquedaAvanzadaRM`,
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiToken}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(query),
    }
  );
  const data: AdvancedSearchResponse = await response.json();
  return data;
}

export async function getEstablisments({
  token,
  NIT,
}: {
  token?: string;
  NIT: string;
}) {
  const dataFile = path.join(publicDir, `${NIT}.json`);
  try {
    const data: { name: string; chamber: string; registry: string }[] =
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
      query: { Nit: NIT },
      apiToken,
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
      businessRegistrationNumber,
      chamberCode,
      apiToken,
    });
    const establishments = (response.registros ?? [])
      .filter((record) => record.DESC_ESTADO_MATRICULA === "ACTIVA")
      .map((record) => ({
        name: record.RAZON_SOCIAL,
        chamber: record.DESC_CAMARA,
        registry: record.MATRICULA,
      }));
    console.log(`Found ${establishments.length} establishments.`);
    await writeFile(dataFile, JSON.stringify(establishments));
    return establishments;
  }
}
