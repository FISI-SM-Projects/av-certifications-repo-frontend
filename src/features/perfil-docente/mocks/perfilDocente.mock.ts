import type { PerfilDocenteResponse } from "../types/perfilDocente.types";

export const perfilDocenteMock: PerfilDocenteResponse = {
  docente: {
    id: 1,
    codigo: "082026",
    nombres: "Juan Carlos",
    apellidos: "Pérez Gómez",
    correoInstitucional: "jperez@unmsm.edu.pe",
    departamentoAcademico: "Ingeniería de Software",
    categoria: "Asociado",
    condicion: "Nombrado",
  },
  constancias: [
    {
      id: 1,
      titulo: "Constancia de cumplimiento en Aula Virtual",
      periodo: "2026-I",
      estado: "GENERADO",
      fechaGeneracion: "2026-06-20",
      archivoUrl: "/constancias/demo-2026-I.pdf",
    },
    {
      id: 2,
      titulo: "Constancia de cumplimiento en Aula Virtual",
      periodo: "2025-II",
      estado: "APROBADO",
      fechaGeneracion: "2025-12-10",
      archivoUrl: "/constancias/demo-2025-II.pdf",
    },
  ],
};
