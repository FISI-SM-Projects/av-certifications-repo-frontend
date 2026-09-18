export type TeacherProfile = {
  id: number;
  personId: number;
  moodleId: number | null;
  code: string;
  dni: string | null;
  firstName: string;
  paternalLastName: string;
  maternalLastName: string | null;
  department: "CC" | "SW" | "EG" | "NA" | null;
  registerState: "ACTIVO" | "SUSPENDIDO" | "ELIMINADO";
};

export type TeacherProfileResponse = {
  success: true;
  message: string;
  data: TeacherProfile;
};
