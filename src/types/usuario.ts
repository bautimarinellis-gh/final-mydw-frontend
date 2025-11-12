export interface Usuario {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  descripcion?: string;
  fotoUrl?: string;
  carrera: string;
  sede: string;
  edad: number;
  intereses: string[];
}

