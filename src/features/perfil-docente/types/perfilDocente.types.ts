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

export type Constancia = {
  id: number;
  titulo: string;
  periodo: string;
  estado: EstadoConstancia;
  fechaGeneracion: string;
  archivoUrl: string;
};

export type PerfilDocenteResponse = {
  docente: Docente;
  constancias: Constancia[];
};
