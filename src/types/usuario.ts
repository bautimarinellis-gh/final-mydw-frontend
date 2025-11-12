export interface Usuario {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  descripcion?: string;
  carrera: string;
  sede: string;
  edad: number;
  intereses: string[];
}

