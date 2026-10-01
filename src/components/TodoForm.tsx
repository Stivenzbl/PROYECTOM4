import React, { useState, useEffect } from 'react';
import { Priority, TaskInput, Task } from '@/types';
import { PlusCircle, Save, X, Calendar, Flag, AlertCircle } from 'lucide-react';

interface TodoFormProps {
  initialTask?: Task | null;
  onSubmit: (data: TaskInput) => Promise<void> | void;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

export const TodoForm: React.FC<TodoFormProps> = ({
  initialTask,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const isEditing = Boolean(initialTask);

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setDescription(initialTask.description || '');
      setPriority(initialTask.priority || 'medium');
      setDueDate(initialTask.dueDate || '');
    } else {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate('');
    }
    setValidationError(null);
  }, [initialTask]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setValidationError('El título de la tarea es obligatorio.');
      return;
    }

    setValidationError(null);

    await onSubmit({
      title: title.trim(),
      description: description.trim(),
      priority,
      dueDate: dueDate || undefined,
    });

    if (!isEditing) {
      // Limpiar formulario tras crear
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate('');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      data-testid="todo-form"
      className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200 transition-all hover:shadow-md"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
          {isEditing ? (
            <>
              <Save className="w-5 h-5 text-indigo-600" />
              Editar Tarea
            </>
          ) : (
            <>
              <PlusCircle className="w-5 h-5 text-indigo-600" />
              Crear Nueva Tarea
            </>
          )}
        </h2>
        {isEditing && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            title="Cancelar edición"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {validationError && (
        <div
          data-testid="form-error"
          className="mb-4 flex items-center gap-2 text-xs sm:text-sm text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Input de Título */}
      <div className="mb-3">
        <label htmlFor="task-title" className="block text-xs font-semibold text-slate-700 mb-1">
          Título de la Tarea <span className="text-red-500">*</span>
        </label>
        <input
          id="task-title"
          data-testid="task-title-input"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ej: Implementar autenticación con Firebase"
          disabled={isSubmitting}
          className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
        />
      </div>

      {/* Textarea de Descripción */}
      <div className="mb-3">
        <label htmlFor="task-desc" className="block text-xs font-semibold text-slate-700 mb-1">
          Descripción <span className="text-slate-400 font-normal">(opcional)</span>
        </label>
        <textarea
          id="task-desc"
          data-testid="task-desc-input"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Detalles adicionales, requerimientos o notas de la tarea..."
          rows={2}
          disabled={isSubmitting}
          className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition resize-none"
        />
      </div>

      {/* Prioridad y Fecha de vencimiento */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {/* Selector de Prioridad */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
            <Flag className="w-3.5 h-3.5 text-slate-500" />
            Prioridad
          </label>
          <div className="flex gap-2">
            {(['low', 'medium', 'high'] as Priority[]).map((p) => {
              const active = priority === p;
              const labels = { low: 'Baja', medium: 'Media', high: 'Alta' };
              const colors = {
                low: active ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100',
                medium: active ? 'bg-amber-500 text-white border-amber-500' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100',
                high: active ? 'bg-rose-600 text-white border-rose-600' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100',
              };

              return (
                <button
                  type="button"
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all text-center ${colors[p]}`}
                >
                  {labels[p]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Input de Fecha de Vencimiento */}
        <div>
          <label htmlFor="task-due" className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            Fecha de Vencimiento
          </label>
          <input
            id="task-due"
            data-testid="task-due-input"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            disabled={isSubmitting}
            className="w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
          />
        </div>
      </div>

      {/* Botones de Acción */}
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
        {isEditing && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          data-testid="submit-task-button"
          disabled={isSubmitting}
          className="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center gap-2"
        >
          {isEditing ? 'Guardar Cambios' : 'Agregar Tarea'}
        </button>
      </div>
    </form>
  );
};
