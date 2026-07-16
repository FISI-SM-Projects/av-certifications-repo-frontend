import type { CertificateGenerationSummary } from "@/features/constancias/types/constancia.types";

export type EstadoConstancia = "GENERADO" | "APROBADO";

export type Docente = {
  id: number;
  codigo: string;
  nombres: string;
  apellidos: string;
  correoInstitucional: string;
  departamentoAcademico: string;
  categoria: string;
  condicion: string;
};

export type ConstanciaPerfil = CertificateGenerationSummary;

export type PerfilDocenteResponse = {
  docente: Docente;
  constancias: ConstanciaPerfil[];
};
