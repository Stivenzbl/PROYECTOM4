import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import type { Task } from '../src/types';

interface SendSummaryRequestBody {
  tasks: Task[];
  userEmail: string;
  userName?: string;
}

export default async function handler(req: any, res: any) {
  // Solo permitir método POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Use POST.' });
  }

  try {
    const { tasks, userEmail, userName }: SendSummaryRequestBody = req.body;

    if (!userEmail) {
      return res.status(400).json({ error: 'El email de destino es obligatorio.' });
    }

    const taskList = tasks || [];
    const totalCount = taskList.length;
    const completedCount = taskList.filter((t) => t.completed).length;
    const pendingCount = totalCount - completedCount;

    // Variables de entorno para AWS SES (estrictamente en el servidor)
    const region = process.env.AWS_REGION || 'us-east-1';
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    const senderEmail = process.env.AWS_SES_SENDER_EMAIL || 'notificaciones@matecode.dev';

    // Verificación de credenciales reales vs simulación en desarrollo
    const isMock =
      !accessKeyId ||
      !secretAccessKey ||
      accessKeyId === 'tu_aws_access_key_id' ||
      accessKeyId === 'mock_aws_key';

    // Generar contenido HTML estilizado para el email
    const taskRowsHtml = taskList
      .map(
        (t) => `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 12px; font-size: 14px; color: ${t.completed ? '#64748b' : '#0f172a'}; text-decoration: ${t.completed ? 'line-through' : 'none'};">
            <strong>${t.title}</strong>
            ${t.description ? `<br/><span style="font-size: 12px; color: #64748b;">${t.description}</span>` : ''}
          </td>
          <td style="padding: 12px; text-align: center;">
            <span style="display: inline-block; padding: 4px 8px; font-size: 12px; border-radius: 9999px; font-weight: 600; background-color: ${
              t.priority === 'high' ? '#fee2e2' : t.priority === 'medium' ? '#fef3c7' : '#e0e7ff'
            }; color: ${
              t.priority === 'high' ? '#991b1b' : t.priority === 'medium' ? '#92400e' : '#3730a3'
            };">
              ${t.priority.toUpperCase()}
            </span>
          </td>
          <td style="padding: 12px; text-align: center;">
            <span style="display: inline-block; padding: 4px 8px; font-size: 12px; border-radius: 9999px; font-weight: 600; background-color: ${
              t.completed ? '#dcfce7' : '#f1f5f9'
            }; color: ${t.completed ? '#166534' : '#475569'};">
              ${t.completed ? 'Completada' : 'Pendiente'}
            </span>
          </td>
        </tr>`
      )
      .join('');

    const htmlBody = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Resumen de Tareas - MateCode</title>
        </head>
        <body style="font-family: Arial, sans-serif; background-color: #f8fafc; padding: 24px; color: #1e293b;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border: 1px solid #e2e8f0;">
            <div style="background-color: #4f46e5; padding: 24px; text-align: center; color: #ffffff;">
              <h1 style="margin: 0; font-size: 24px;">MateCode Tasks</h1>
              <p style="margin: 6px 0 0 0; opacity: 0.9; font-size: 14px;">Resumen Estratégico de Tareas Diarias</p>
            </div>
            
            <div style="padding: 24px;">
              <p style="font-size: 16px;">Hola <strong>${userName || userEmail}</strong>,</p>
              <p style="font-size: 14px; color: #475569;">Aquí tienes el balance actual de tus actividades en la plataforma:</p>
              
              <div style="display: flex; gap: 12px; margin: 20px 0;">
                <div style="flex: 1; background-color: #eef2ff; border: 1px solid #c7d2fe; padding: 12px; border-radius: 8px; text-align: center;">
                  <div style="font-size: 20px; font-weight: bold; color: #4338ca;">${totalCount}</div>
                  <div style="font-size: 12px; color: #4f46e5;">Total</div>
                </div>
                <div style="flex: 1; background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 12px; border-radius: 8px; text-align: center;">
                  <div style="font-size: 20px; font-weight: bold; color: #15803d;">${completedCount}</div>
                  <div style="font-size: 12px; color: #16a34a;">Completadas</div>
                </div>
                <div style="flex: 1; background-color: #fffbeb; border: 1px solid #fde68a; padding: 12px; border-radius: 8px; text-align: center;">
                  <div style="font-size: 20px; font-weight: bold; color: #b45309;">${pendingCount}</div>
                  <div style="font-size: 12px; color: #d97706;">Pendientes</div>
                </div>
              </div>

              ${
                taskList.length > 0
                  ? `
                <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
                  <thead>
                    <tr style="background-color: #f1f5f9; text-align: left; font-size: 12px; color: #475569;">
                      <th style="padding: 10px 12px;">Tarea</th>
                      <th style="padding: 10px 12px; text-align: center;">Prioridad</th>
                      <th style="padding: 10px 12px; text-align: center;">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${taskRowsHtml}
                  </tbody>
                </table>
              `
                  : `<p style="text-align: center; color: #94a3b8; padding: 24px;">No tienes tareas registradas actualmente.</p>`
              }

              <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center;">
                Notificación generada automáticamente mediante AWS SES y Vercel Functions.<br/>
                &copy; ${new Date().getFullYear()} MateCode SPA.
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    if (isMock) {
      console.log(`[AWS SES SIMULACIÓN] Email de resumen para ${userEmail}: ${completedCount}/${totalCount} completadas.`);
      return res.status(200).json({
        success: true,
        simulated: true,
        message: `[MODO SIMULACIÓN] Resumen generado exitosamente para ${userEmail}. Cuando configures tus claves de AWS SES en Vercel, se enviará el email real.`,
        stats: { totalCount, completedCount, pendingCount },
      });
    }

    // Inicializar cliente AWS SES
    const sesClient = new SESClient({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    const sendEmailCommand = new SendEmailCommand({
      Source: senderEmail,
      Destination: {
        ToAddresses: [userEmail],
      },
      Message: {
        Subject: {
          Data: `📋 Resumen de Tareas MateCode - ${new Date().toLocaleDateString('es-ES')}`,
          Charset: 'UTF-8',
        },
        Body: {
          Html: {
            Data: htmlBody,
            Charset: 'UTF-8',
          },
          Text: {
            Data: `Hola ${userName || userEmail}, tienes un total de ${totalCount} tareas (${completedCount} completadas, ${pendingCount} pendientes).`,
            Charset: 'UTF-8',
          },
        },
      },
    });

    const response = await sesClient.send(sendEmailCommand);

    return res.status(200).json({
      success: true,
      messageId: response.MessageId,
      message: `¡Correo enviado exitosamente a ${userEmail} a través de AWS SES!`,
      stats: { totalCount, completedCount, pendingCount },
    });
  } catch (error: any) {
    console.error('Error en AWS SES Serverless Function:', error);
    return res.status(500).json({
      error: 'Error al enviar el email con AWS SES.',
      details: error.message || 'Error desconocido',
    });
  }
}
