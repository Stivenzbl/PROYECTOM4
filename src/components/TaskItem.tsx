import React from 'react';
import { Task } from '@/types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Check,
  Trash2,
  Edit3,
  GripVertical,
  Calendar,
  AlertTriangle,
} from 'lucide-react';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  isDragDisabled?: boolean;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggle,
  onEdit,
  onDelete,
  isDragDisabled = false,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    disabled: isDragDisabled,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 20 : 1,
  };

  // Determinar si la tarea está vencida
  const isOverdue = React.useMemo(() => {
    if (!task.dueDate || task.completed) return false;
    const today = new Date().toISOString().split('T')[0];
    return task.dueDate < today;
  }, [task.dueDate, task.completed]);

  const priorityStyles = {
    low: 'bg-blue-50 text-blue-700 border-blue-200',
    medium: 'bg-amber-50 text-amber-700 border-amber-200',
    high: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  const priorityLabels = {
    low: 'Baja',
    medium: 'Media',
    high: 'Alta',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-testid={`task-item-${task.id}`}
      className={`group bg-white rounded-xl border transition-all duration-200 p-4 flex items-start gap-3 shadow-sm ${
        task.completed
          ? 'bg-slate-50/70 border-slate-200'
          : 'border-slate-200 hover:border-indigo-300 hover:shadow-md'
      }`}
    >
      {/* Botón de arrastre para DnD */}
      {!isDragDisabled && (
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="text-slate-300 group-hover:text-slate-500 cursor-grab active:cursor-grabbing p-1 -ml-1 rounded focus:outline-none"
          title="Arrastrar para reordenar"
          aria-label="Reordenar tarea"
        >
          <GripVertical className="w-4 h-4" />
        </button>
      )}

      {/* Botón Checkbox de completitud */}
      <button
        type="button"
        role="checkbox"
        aria-checked={task.completed}
        data-testid={`task-toggle-${task.id}`}
        onClick={() => onToggle(task.id)}
        className={`w-5 h-5 mt-0.5 rounded-md border flex items-center justify-center transition-all ${
          task.completed
            ? 'bg-emerald-600 border-emerald-600 text-white'
            : 'border-slate-300 hover:border-emerald-500 bg-white'
        }`}
      >
        {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
      </button>

      {/* Contenido de la tarea */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span
            className={`text-sm font-semibold tracking-tight break-words ${
              task.completed
                ? 'line-through text-slate-400'
                : 'text-slate-800'
            }`}
          >
            {task.title}
          </span>

          {/* Badge de Prioridad */}
          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
              priorityStyles[task.priority || 'medium']
            }`}
          >
            {priorityLabels[task.priority || 'medium']}
          </span>

          {/* Badge de Vencimiento / Vencida */}
          {task.dueDate && (
            <span
              className={`text-[11px] font-medium px-2 py-0.5 rounded-md inline-flex items-center gap-1 ${
                isOverdue
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : 'bg-slate-100 text-slate-600'
              }`}
              title={isOverdue ? 'Tarea vencida' : 'Fecha límite'}
            >
              {isOverdue ? (
                <AlertTriangle className="w-3 h-3 text-red-600" />
              ) : (
                <Calendar className="w-3 h-3 text-slate-400" />
              )}
              <span>{task.dueDate}</span>
            </span>
          )}
        </div>

        {/* Descripción de la tarea */}
        {task.description && (
          <p
            className={`text-xs mt-1 leading-relaxed break-words ${
              task.completed ? 'text-slate-400' : 'text-slate-600'
            }`}
          >
            {task.description}
          </p>
        )}
      </div>

      {/* Botones de acción (Editar y Eliminar) */}
      <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          data-testid={`task-edit-${task.id}`}
          onClick={() => onEdit(task)}
          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          title="Editar tarea"
          aria-label="Editar tarea"
        >
          <Edit3 className="w-4 h-4" />
        </button>

        <button
          type="button"
          data-testid={`task-delete-${task.id}`}
          onClick={() => {
            if (window.confirm('¿Seguro que deseas eliminar esta tarea permanentemente?')) {
              onDelete(task.id);
            }
          }}
          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Eliminar tarea"
          aria-label="Eliminar tarea"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
