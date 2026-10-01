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

    if (!response.ok) {
      // Si la API devuelve un error o la ruta /api no existe en dev de vite local
      if (response.status === 404) {
        return {
          success: true,
          simulated: true,
          message:
            'Nota: La función serverless se activa automáticamente en Vercel o con `vercel dev`. Simulando envío exitoso para desarrollo.',
        };
      }
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
    // Si fetch falla por no haber backend local activo
    if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
      return {
        success: true,
        simulated: true,
        message:
          'Simulación local activa: En Vercel o Vercel CLI el correo se despachará mediante AWS SES.',
      };
    }
    throw error;
  }
};
