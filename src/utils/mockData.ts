import type { Usuario } from '../types';

// Datos de prueba para desarrollo
export const mockUsers: Usuario[] = [
  {
    id: '1',
    nombre: 'Sofía',
    apellido: 'García',
    email: 'sofia@uai.com',
    descripcion: 'Estudiante apasionada por la tecnología y el diseño. Me encanta crear interfaces intuitivas.',
    carrera: 'Ingeniería en Sistemas',
    sede: 'Sede Centro',
    edad: 22,
    intereses: ['Tecnología', 'Gaming', 'Deportes'],
  },
  {
    id: '2',
    nombre: 'Lucas',
    apellido: 'Rodríguez',
    email: 'lucas@uai.com',
    descripcion: 'Futuro arquitecto, amante del diseño moderno y la fotografía urbana.',
    carrera: 'Arquitectura',
    sede: 'Sede Norte',
    edad: 23,
    intereses: ['Diseño', 'Fotografía', 'Arte'],
  },
  {
    id: '3',
    nombre: 'María',
    apellido: 'López',
    email: 'maria@uai.com',
    descripcion: 'Estudiante de administración con interés en emprendimiento y startups.',
    carrera: 'Administración de Empresas',
    sede: 'Sede Centro',
    edad: 21,
    intereses: ['Negocios', 'Música', 'Viajes'],
  },
  {
    id: '4',
    nombre: 'Diego',
    apellido: 'Martínez',
    email: 'diego@uai.com',
    descripcion: 'Desarrollador web en formación. Me gusta el código limpio y las buenas prácticas.',
    carrera: 'Ingeniería en Informática',
    sede: 'Sede Sur',
    edad: 24,
    intereses: ['Programación', 'Gaming', 'Tecnología'],
  },
  {
    id: '5',
    nombre: 'Valentina',
    apellido: 'Fernández',
    email: 'valentina@uai.com',
    descripcion: 'Estudiante de diseño gráfico, creativa y apasionada por el arte digital.',
    carrera: 'Diseño Gráfico',
    sede: 'Sede Centro',
    edad: 20,
    intereses: ['Diseño', 'Arte', 'Fotografía'],
  },
];

// Usuario actual de prueba
export const mockCurrentUser: Usuario = {
  id: 'current',
  nombre: 'Juan',
  apellido: 'Pérez',
  email: 'juan@uai.com',
  descripcion: 'Estudiante de ingeniería, apasionado por la tecnología y la innovación.',
  carrera: 'Ingeniería en Sistemas',
  sede: 'Sede Centro',
  edad: 22,
  intereses: ['Tecnología', 'Deportes', 'Música'],
};

