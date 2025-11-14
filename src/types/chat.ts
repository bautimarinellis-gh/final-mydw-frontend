import type { Usuario } from './usuario';

export interface Mensaje {
  id: string;
  contenido: string;
  remitenteId: string;
  destinatarioId: string;
  matchId: string;
  leido: boolean;
  createdAt: string | Date;
}

export interface Conversacion {
  matchId: string;
  usuario: Usuario;
  ultimoMensaje: Mensaje | null;
  mensajesNoLeidos: number;
  updatedAt: string | Date;
}

export interface ConversacionDetalle {
  matchId: string;
  usuario: Usuario;
  mensajes: Mensaje[];
  total: number;
}

export interface EnviarMensajeRequest {
  matchId: string;
  destinatarioId: string;
  contenido: string;
}

