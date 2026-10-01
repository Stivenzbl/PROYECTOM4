import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  writeBatch,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import { Task, TaskInput } from '@/types';

const TASKS_COLLECTION = 'tasks';

/**
 * Suscribe a los cambios en tiempo real de las tareas del usuario autenticado.
 * Limpia la suscripción cuando se invoca la función devuelta (previene memory leaks).
 */
export const subscribeUserTasks = (
  userId: string,
  onUpdate: (tasks: Task[]) => void,
  onError: (error: Error) => void
): Unsubscribe => {
  const tasksRef = collection(db, TASKS_COLLECTION);
  // Consulta filtrando estrictamente por el ID del usuario
  const q = query(tasksRef, where('userId', '==', userId));

  return onSnapshot(
    q,
    (snapshot) => {
      const tasks: Task[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          title: data.title || '',
          description: data.description || '',
          completed: Boolean(data.completed),
          priority: data.priority || 'medium',
          dueDate: data.dueDate || undefined,
          userId: data.userId,
          createdAt: data.createdAt || Date.now(),
          updatedAt: data.updatedAt,
          order: typeof data.order === 'number' ? data.order : 0,
        };
      });

      // Ordenar por 'order' ascendente y como fallback por 'createdAt' descendente
      tasks.sort((a, b) => {
        if (a.order !== b.order) {
          return a.order - b.order;
        }
        return b.createdAt - a.createdAt;
      });

      onUpdate(tasks);
    },
    (err) => {
      console.error('Error al suscribir tareas:', err);
      onError(err);
    }
  );
};

/**
 * Agrega una nueva tarea en Cloud Firestore asignada al usuario.
 */
export const addTask = async (
  userId: string,
  taskInput: TaskInput,
  currentTaskCount: number = 0
): Promise<string> => {
  const tasksRef = collection(db, TASKS_COLLECTION);
  const now = Date.now();

  const docRef = await addDoc(tasksRef, {
    title: taskInput.title.trim(),
    description: (taskInput.description || '').trim(),
    completed: false,
    priority: taskInput.priority || 'medium',
    dueDate: taskInput.dueDate || null,
    userId,
    createdAt: now,
    updatedAt: now,
    order: currentTaskCount,
  });

  return docRef.id;
};

/**
 * Actualiza parcialmente una tarea existente.
 */
export const updateTask = async (
  taskId: string,
  updates: Partial<Omit<Task, 'id' | 'userId' | 'createdAt'>>
): Promise<void> => {
  const taskDocRef = doc(db, TASKS_COLLECTION, taskId);
  await updateDoc(taskDocRef, {
    ...updates,
    updatedAt: Date.now(),
  });
};

/**
 * Alterna el estado de completitud de una tarea.
 */
export const toggleTaskCompleted = async (
  taskId: string,
  currentStatus: boolean
): Promise<void> => {
  await updateTask(taskId, { completed: !currentStatus });
};

/**
 * Elimina una tarea por su ID.
 */
export const removeTask = async (taskId: string): Promise<void> => {
  const taskDocRef = doc(db, TASKS_COLLECTION, taskId);
  await deleteDoc(taskDocRef);
};

/**
 * Reordena una lista de tareas usando un batch de Firestore.
 */
export const reorderTasksInBatch = async (
  orderedTasks: { id: string; order: number }[]
): Promise<void> => {
  const batch = writeBatch(db);
  orderedTasks.forEach(({ id, order }) => {
    const taskRef = doc(db, TASKS_COLLECTION, id);
    batch.update(taskRef, { order, updatedAt: Date.now() });
  });
  await batch.commit();
};
