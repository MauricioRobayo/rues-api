export interface AdvancedSearchResponse {
  cant_registros: number;
  error: Error;
  fecha_respuesta: string;
  hora_respuesta: string;
  registros?: BusinessRecord[];
}

export interface BusinessEstablishment {
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

export interface BusinessEstablishmentsResponse {
  cant_Registros: number;
  code: string;
  fecha_respuesta: string;
  hora_respuesta: string;
  message: string;
  registros?: BusinessEstablishment[];
}
export interface BusinessRecord {
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

export interface CapitalInformation {
  capital_autorizado: string;
  capital_pagado: string;
  capital_social: string;
  capital_suscrito: string;
  eat_aportes_activos?: string;
  eat_aportes_en_dinero?: string;
  eat_aportes_laborales?: string;
  eat_aportes_laborales_adicionales?: string;
  eat_total_aportes?: string;
  fecha_modificacion_capital: string;
  patrimonio_esal?: string;
}

export interface CompanyRecord {
  autorizacion_envio_correo_electronico: string;
  barrio_comercial?: string;
  barrio_fiscal?: string;
  camara: string;
  cantidad_establecimientos: string;
  cantidad_mujeres_cargos_directivos: string;
  cantidad_mujeres_empleadas: string;
  categoria_matricula: string;
  ciiu3?: string;
  ciiu4?: string;
  ciiu_mayores_ingresos: string;
  cod_ciiu_act_econ_pri: string;
  cod_ciiu_act_econ_sec?: string;
  codigo_camara: string;
  codigo_categoria_matricula: string;
  codigo_estado_matricula: string;
  codigo_municipio_comercial: string;
  codigo_municipio_fiscal: string;
  codigo_organizacion_juridica: string;
  codigo_postal_comercial: string;
  codigo_postal_fiscal: string;
  codigo_tamano_empresa: "01" | "02" | "03" | "04";
  codigo_tipo_identificacion: string;
  codigo_tipo_sociedad: string;
  control_inactivacion_sipref: string;
  correo_electronico_comercial: string;
  correo_electronico_fiscal: string;
  desc_ciiu3?: string;
  desc_ciiu4?: string;
  desc_ciiu_act_econ_pri: string;
  desc_ciiu_act_econ_sec?: string;
  digito_verificacion: string;
  direccion_comercial: string;
  direccion_fiscal: string;
  dpto_comercial: string;
  dpto_fiscal: string;
  establecimientos?: (StoreFront | { rnt: RNT[] })[];
  estado_matricula: string;
  extincion_dominio: string;
  fecha_actualizacion_rues: string;
  fecha_cancelacion: string;
  fecha_matricula: string;
  fecha_renovacion: string;
  genero: string;
  HistoricoCambiosNombre: {
    codigo_camara: string;
    fecha_cambio: string;
    matricula: string;
    razon_social_anterior: string;
  };
  indicador_emprendimiento_social: string;
  indicador_inhabilidad_RUP: string;
  informacionCapitales?: CapitalInformation[];
  informacionFinanciera?: FinancialInformation[];
  inscripcion_proponente: string;
  matricula: string;
  multas: unknown[];
  municipio_comercial: string;
  municipio_fiscal: string;
  numero_empleados: string;
  numero_identificacion: string;
  objeto_social?: string;
  organizacion_juridica: string;
  razon_social: string;
  sanciones: unknown[];
  sede_administrativa?: string;
  sigla?: string;
  telefono_comercial_1: string;
  telefono_comercial_2?: string;
  telefono_fiscal_1: string;
  telefono_fiscal_2?: string;
  tipo_identificacion: string;
  tipo_sociedad: string;
  ubicacion_empresa?: string;
  ultimo_ano_renovado: string;
  vinculos?: Vinculo[];
  zona_comercial: string;
  zona_fiscal: string;
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

export interface FinancialInformation {
  activo_corriente: string;
  activo_no_corriente?: string;
  activo_total: string;
  ano_informacion_financiera: string;
  balance_social?: string;
  capital_social_extranjero_privado: string;
  capital_social_extranjero_publico: string;
  capital_social_nacional_privado: string;
  capital_social_nacional_publico: string;
  costo_ventas: string;
  gastos_impuestos?: string;
  gastos_operacionales: string;
  ingresos_actividad_ordinaria: string;
  otros_gastos: string;
  otros_ingresos: string;
  pasivo_corriente: string;
  pasivo_mas_patrimonio?: string;
  pasivo_no_corriente?: string;
  pasivo_total: string;
  patrimonio_neto: string;
  resultado_del_periodo: string;
  utilidad_perdida_operacional: string;
}

export interface QueryNitResponse {
  fecha_respuesta: string;
  hora_respuesta: string;
  nit: string;
  registros: CompanyRecord[];
}

export interface RNT {
  RNT: string;
  RNT_categoria: string;
  RNT_correo_electronico: string;
  RNT_correo_electronico_prestador: string;
  RNT_departamento: string;
  RNT_direccion_comercial: string;
  RNT_direccion_notificacion: string;
  RNT_dpto_notificacion: string;
  RNT_dv_prestador: string;
  RNT_empleados: string;
  RNT_estado: string;
  RNT_identificacion_representante_legal: string;
  RNT_municipio: string;
  RNT_municipio_notificacion: string;
  RNT_nit_prestador: string;
  RNT_razon_social: string;
  RNT_razon_social_prestador: string;
  RNT_representante_legal: string;
  RNT_subCategoria: string;
  RNT_telefono_celular: string;
  RNT_telefono_fijo: string;
  RNT_telefono_notificaciones: string;
  RNT_telefono_prestador: string;
  RNT_ultimo_ano_actualizado: string;
}

export type RuesFetchOptions = {
  body?: Record<string, unknown>;
  method?: "GET" | "POST";
  path: string;
  searchParams?: URLSearchParams;
  token?: string;
};

export type RuesResponse<T> = Promise<
  | { data: T; status: "success"; statusCode: number }
  | { error: unknown; status: "error"; statusCode?: number }
>;

export interface StoreFront {
  afiliado: string;
  ano_renovado_anterior: string;
  barrio_comercial: string;
  barrio_fiscal: string;
  ciiu1?: string;
  ciiu2?: string;
  ciiu3?: string;
  ciiu4?: string;
  codigo_camara: string;
  codigo_categoria_matricula: string;
  codigo_estado_matricula: string;
  codigo_organizacion_juridica: string;
  codigo_postal_comercial: string;
  codigo_postal_fiscal: string;
  codigo_tipo_local: string;
  codigo_ubicacion_empresa: string;
  correo_electronico_comercial: string;
  correo_electronico_fiscal: string;
  desc_Act_Econ: string;
  desc_ciiu1?: string;
  desc_ciiu2?: string;
  desc_ciiu3?: string;
  desc_ciiu4?: string;
  direccion_comercial: string;
  direccion_fiscal: string;
  empleados: string;
  fecha_cancelacion: string;
  fecha_matricula: string;
  fecha_renovacion: string;
  fecha_renovacion_anterior: string;
  matricula: string;
  municipio_comercial: string;
  municipio_fiscal: string;
  razon_social: string;
  shd1: string;
  shd2: string;
  shd3: string;
  shd4: string;
  telefono_comercial_1: string;
  telefono_comercial_2: string;
  telefono_comercial_3: string;
  tipo_propietario: string;
  ultimo_ano_renovado: string;
  valor_est_ag_suc: string;
}

export interface Vinculo {
  clase_identificacion: string;
  codigo_clase_identificacion: string;
  codigo_tipo_vinculo: string;
  nombre: string;
  numero_identificacion: string;
  tipo_vinculo: string;
}
