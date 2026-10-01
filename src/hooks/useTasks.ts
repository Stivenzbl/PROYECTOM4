import { useState, useEffect, useCallback } from 'react';
import { Task, TaskInput } from '@/types';
import {
  subscribeUserTasks,
  addTask,
  updateTask,
  toggleTaskCompleted,
  removeTask,
  reorderTasksInBatch,
} from '@/services/taskService';
import { isFirebaseConfigured } from '@/services/firebase';

const LOCAL_STORAGE_KEY = 'matecode_demo_tasks';

export const useTasks = (userId?: string) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const isConfigured = isFirebaseConfigured();

  // Suscripción o fallback local
  useEffect(() => {
    if (!userId) {
      setTasks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Fallback local con localStorage si Firebase aún no fue configurado por el estudiante
    if (!isConfigured) {
      try {
        const stored = localStorage.getItem(`${LOCAL_STORAGE_KEY}_${userId}`);
        if (stored) {
          setTasks(JSON.parse(stored));
        } else {
          // Tareas de demostración iniciales
          const initialDemoTasks: Task[] = [
            {
              id: 'demo-1',
              title: 'Revisar la guía de desarrollo del M4',
              description: 'Completar los 9 hitos y verificar cada requerimiento funcional.',
              completed: true,
              priority: 'high',
              dueDate: new Date().toISOString().split('T')[0],
              userId,
              createdAt: Date.now() - 3600000,
              order: 0,
            },
            {
              id: 'demo-2',
              title: 'Configurar credenciales reales de Firebase',
              description: 'Crear proyecto en console.firebase.google.com y actualizar el archivo .env',
              completed: false,
              priority: 'high',
              dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
              userId,
              createdAt: Date.now() - 1800000,
              order: 1,
            },
            {
              id: 'demo-3',
              title: 'Probar el envío de email de resumen',
              description: 'Verificar la función serverless de AWS SES para confirmar tareas.',
              completed: false,
              priority: 'medium',
              userId,
              createdAt: Date.now(),
              order: 2,
            },
          ];
          setTasks(initialDemoTasks);
          localStorage.setItem(`${LOCAL_STORAGE_KEY}_${userId}`, JSON.stringify(initialDemoTasks));
        }
      } catch (e) {
        console.error('Error cargando tareas locales:', e);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Suscripción en tiempo real a Cloud Firestore
    const unsubscribe = subscribeUserTasks(
      userId,
      (fetchedTasks) => {
        setTasks(fetchedTasks);
        setLoading(false);
      },
      (err) => {
        console.error('Error Firestore tasks:', err);
        setError('No se pudieron sincronizar las tareas en tiempo real.');
        setLoading(false);
      }
    );

    // Limpieza de la suscripción para evitar memory leaks
    return () => unsubscribe();
  }, [userId, isConfigured]);

  // Auxiliar para persistir en demo local
  const saveLocalDemoTasks = useCallback(
    (newTasks: Task[]) => {
      if (!isConfigured && userId) {
        localStorage.setItem(`${LOCAL_STORAGE_KEY}_${userId}`, JSON.stringify(newTasks));
      }
    },
    [isConfigured, userId]
  );

  // Crear tarea
  const createTask = useCallback(
    async (taskInput: TaskInput) => {
      if (!userId) throw new Error('Usuario no autenticado');
      setError(null);

      if (!isConfigured) {
        const newTask: Task = {
          id: `task_${Date.now()}`,
          title: taskInput.title.trim(),
          description: (taskInput.description || '').trim(),
          completed: false,
          priority: taskInput.priority || 'medium',
          dueDate: taskInput.dueDate || undefined,
          userId,
          createdAt: Date.now(),
          order: tasks.length,
        };
        const updated = [...tasks, newTask];
        setTasks(updated);
        saveLocalDemoTasks(updated);
        return newTask.id;
      }

      return await addTask(userId, taskInput, tasks.length);
    },
    [userId, isConfigured, tasks, saveLocalDemoTasks]
  );

  // Editar tarea
  const editTask = useCallback(
    async (taskId: string, updates: Partial<TaskInput>) => {
      setError(null);
      if (!isConfigured) {
        const updated = tasks.map((t) =>
          t.id === taskId ? { ...t, ...updates, updatedAt: Date.now() } : t
        );
        setTasks(updated);
        saveLocalDemoTasks(updated);
        return;
      }

      await updateTask(taskId, updates);
    },
    [isConfigured, tasks, saveLocalDemoTasks]
  );

  // Alternar completitud
  const toggleTask = useCallback(
    async (taskId: string) => {
      setError(null);
      const target = tasks.find((t) => t.id === taskId);
      if (!target) return;

      if (!isConfigured) {
        const updated = tasks.map((t) =>
          t.id === taskId ? { ...t, completed: !t.completed, updatedAt: Date.now() } : t
        );
        setTasks(updated);
        saveLocalDemoTasks(updated);
        return;
      }

      await toggleTaskCompleted(taskId, target.completed);
    },
    [isConfigured, tasks, saveLocalDemoTasks]
  );

  // Eliminar tarea
  const deleteTask = useCallback(
    async (taskId: string) => {
      setError(null);
      if (!isConfigured) {
        const updated = tasks.filter((t) => t.id !== taskId);
        setTasks(updated);
        saveLocalDemoTasks(updated);
        return;
      }

      await removeTask(taskId);
    },
    [isConfigured, tasks, saveLocalDemoTasks]
  );

  // Reordenar tareas (Drag and Drop)
  const reorderTasks = useCallback(
    async (activeId: string, overId: string) => {
      if (activeId === overId) return;

      const oldIndex = tasks.findIndex((t) => t.id === activeId);
      const newIndex = tasks.findIndex((t) => t.id === overId);
      if (oldIndex === -1 || newIndex === -1) return;

      // Reordenamiento in-memory optimista
      const newTasks = [...tasks];
      const [moved] = newTasks.splice(oldIndex, 1);
      newTasks.splice(newIndex, 0, moved);

      // Reasignar campo order
      const withNewOrders = newTasks.map((task, index) => ({
        ...task,
        order: index,
      }));

      setTasks(withNewOrders);

      if (!isConfigured) {
        saveLocalDemoTasks(withNewOrders);
        return;
      }

      try {
        const batchPayload = withNewOrders.map((t) => ({ id: t.id, order: t.order }));
        await reorderTasksInBatch(batchPayload);
      } catch (err) {
        console.error('Error al guardar el nuevo orden:', err);
        // Revertir en caso de fallo
        setTasks(tasks);
        setError('No se pudo guardar el nuevo orden de tareas.');
      }
    },
    [tasks, isConfigured, saveLocalDemoTasks]
  );

  return {
    tasks,
    loading,
    error,
    createTask,
    editTask,
    toggleTask,
    deleteTask,
    reorderTasks,
  };
};
