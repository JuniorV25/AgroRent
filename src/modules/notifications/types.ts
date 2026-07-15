// ============================================================================
// Dominio: Notificaciones in-app
// ============================================================================
export type NotificationType = "reserva" | "alerta" | "sistema";

export interface Notification {
  id: string;
  forUserId: string; // usuario destinatario (multi-usuario real)
  type: NotificationType;
  title: string;
  message: string;
  reservationId?: string;
  read: boolean;
  createdAt: string;
}
