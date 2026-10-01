import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTasks } from '@/hooks/useTasks';
import { Navbar } from '@/components/Navbar';
import { TodoForm } from '@/components/TodoForm';
import { TodoList } from '@/components/TodoList';
import { FirebaseBanner } from '@/components/FirebaseBanner';
import { Task, TaskInput } from '@/types';
import {
  CheckCircle,
  Clock,
  Layers,
  AlertTriangle,
  X,
  CheckCircle2,
  Info,
} from 'lucide-react';

export const TasksPage: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    tasks,
    loading,
    error,
    createTask,
    editTask,
    toggleTask,
    deleteTask,
    reorderTasks,
  } = useTasks(currentUser?.uid);

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{
    text: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  // Estadísticas
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const highPriorityTasks = tasks.filter((t) => !t.completed && t.priority === 'high').length;

  const handleFormSubmit = async (data: TaskInput) => {
    setIsSubmitting(true);
    try {
      if (editingTask) {
        await editTask(editingTask.id, data);
        setEditingTask(null);
        setNotification({ text: 'Tarea actualizada con éxito.', type: 'success' });
      } else {
        await createTask(data);
        setNotification({ text: 'Tarea creada con éxito.', type: 'success' });
      }
    } catch (err: any) {
      setNotification({
        text: err.message || 'Error al procesar la tarea.',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Aviso de configuración de Firebase */}
      <FirebaseBanner />

      {/* Barra de navegación superior con botón AWS SES */}
      <Navbar tasks={tasks} onNotify={setNotification} />

      {/* Toast de Notificaciones */}
      {notification && (
        <div className="max-w-6xl mx-auto px-4 w-full mt-4">
          <div
            className={`p-4 rounded-xl flex items-start justify-between shadow-sm transition-all border ${
              notification.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : notification.type === 'error'
                ? 'bg-rose-50 text-rose-800 border-rose-200'
                : 'bg-indigo-50 text-indigo-800 border-indigo-200'
            }`}
          >
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              {notification.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : notification.type === 'error' ? (
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              ) : (
                <Info className="w-5 h-5 text-indigo-600 shrink-0" />
              )}
              <span>{notification.text}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-slate-400 hover:text-slate-600 p-1"
              aria-label="Cerrar notificación"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Error de sincronización si ocurre */}
      {error && (
        <div className="max-w-6xl mx-auto px-4 w-full mt-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs sm:text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Contenido Principal */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Tarjetas de Métricas / Balance */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Tareas</p>
              <p className="text-lg sm:text-xl font-bold text-slate-800">{totalTasks}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Completadas</p>
              <p className="text-lg sm:text-xl font-bold text-slate-800">{completedTasks}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Pendientes</p>
              <p className="text-lg sm:text-xl font-bold text-slate-800">{pendingTasks}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Prioridad Alta</p>
              <p className="text-lg sm:text-xl font-bold text-slate-800">{highPriorityTasks}</p>
            </div>
          </div>
        </section>

        {/* Layout en dos columnas en pantallas grandes: Formulario + Lista */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Columna Izquierda: Formulario (Fijo en desktop) */}
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <TodoForm
              initialTask={editingTask}
              onSubmit={handleFormSubmit}
              onCancel={() => setEditingTask(null)}
              isSubmitting={isSubmitting}
            />
          </div>

          {/* Columna Derecha: Filtros y Lista de Tareas con DnD */}
          <div className="lg:col-span-7">
            <TodoList
              tasks={tasks}
              loading={loading}
              onToggle={toggleTask}
              onEdit={(task) => {
                setEditingTask(task);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onDelete={deleteTask}
              onReorder={reorderTasks}
            />
          </div>
        </div>
      </main>
    </div>
  );
};
