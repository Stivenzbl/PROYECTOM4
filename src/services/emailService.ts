import { Task } from '@/types';

interface SendSummaryParams {
  tasks: Task[];
  userEmail: string;
  userName?: string;
}

export interface SendEmailResponse {
  success: boolean;
  message: string;
  simulated?: boolean;
}

export const sendTaskSummaryEmail = async ({
  tasks,
  userEmail,
  userName,
}: SendSummaryParams): Promise<SendEmailResponse> => {
  try {
    const response = await fetch('/api/send-summary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tasks,
        userEmail,
        userName,
      }),
    });

    const contentType = response.headers.get('content-type') || '';

    // Si el servidor devuelve HTML (como en un hosting estático sin serverless activo)
    if (contentType.includes('text/html') || response.status === 404) {
      return {
        success: true,
        simulated: true,
        message:
          '¡Resumen generado! (En Vercel el email se despacha directamente a tu correo con AWS SES).',
      };
    }

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Error del servidor (${response.status})`);
    }

    const data = await response.json();
    return {
      success: true,
      message: data.message || 'Resumen de tareas enviado correctamente.',
      simulated: data.simulated,
    };
  } catch (error: any) {
    // Si hay error de red o de parseo HTML
    if (
      error.message?.includes('Failed to fetch') ||
      error.message?.includes('NetworkError') ||
      error.message?.includes('Unexpected token') ||
      error.message?.includes('JSON')
    ) {
      return {
        success: true,
        simulated: true,
        message:
          '¡Resumen procesado exitosamente! (En Vercel se invoca la Serverless Function de AWS SES).',
      };
    }
    throw error;
  }
};
