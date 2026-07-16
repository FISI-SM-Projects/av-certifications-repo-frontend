import type { PerfilDocenteResponse } from "../types/perfilDocente.types";

// Recurso de desarrollo: se conserva como referencia para pruebas locales.
// La pantalla principal consume el backend mediante perfilDocenteService.ts.
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
      generationId: "082026-32BGNYGF-1-26.1-v001",
      certificateKey: "082026-32BGNYGF-1-26.1",
      version: 1,
      type: "CURSO",
      status: "GENERADO",
      teacherCode: "082026",
      courseCode: "32BGNYGF",
      section: "1",
      semester: "26.1",
      generatedAt: "2026-06-20T10:30:00",
      viewUrl: "/api/v1/constancias/generaciones/082026-32BGNYGF-1-26.1-v001/pdf",
      downloadUrl: "/api/v1/constancias/generaciones/082026-32BGNYGF-1-26.1-v001/download",
    },
    {
      generationId: "082026-26.1-v001",
      certificateKey: "082026-26.1",
      version: 1,
      type: "SEMESTRAL",
      status: "APROBADO",
      teacherCode: "082026",
      courseCode: null,
      section: null,
      semester: "26.1",
      generatedAt: "2026-07-14T10:30:00",
      viewUrl: "/api/v1/constancias/generaciones/082026-26.1-v001/pdf",
      downloadUrl: "/api/v1/constancias/generaciones/082026-26.1-v001/download",
    },
  ],
};
