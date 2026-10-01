import React, { useState, useMemo } from 'react';
import { Task, TaskFilter, Priority } from '@/types';
import { TaskItem } from './TaskItem';
import confetti from 'canvas-confetti';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Search, Filter, CheckCircle2, ListTodo, AlertCircle } from 'lucide-react';

interface TodoListProps {
  tasks: Task[];
  loading: boolean;
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onReorder: (activeId: string, overId: string) => void;
}

export const TodoList: React.FC<TodoListProps> = ({
  tasks,
  loading,
  onToggle,
  onEdit,
  onDelete,
  onReorder,
}) => {
  const [filter, setFilter] = useState<TaskFilter>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | Priority>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Sensores para DnD (soporte táctil, mouse y teclado)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Requiere mover 5px para no interferir con clicks normales
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      onReorder(String(active.id), String(over.id));
    }
  };

  const handleToggleWithCelebration = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (task && !task.completed) {
      // Efecto confetti al completar una tarea
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
    }
    onToggle(id);
  };

  // Filtrado y búsqueda
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // Filtro de estado
      if (filter === 'pending' && t.completed) return false;
      if (filter === 'completed' && !t.completed) return false;

      // Filtro de prioridad
      if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;

      // Filtro de búsqueda
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = t.title.toLowerCase().includes(query);
        const matchesDesc = (t.description || '').toLowerCase().includes(query);
        return matchesTitle || matchesDesc;
      }

      return true;
    });
  }, [tasks, filter, priorityFilter, searchQuery]);

  // El Drag & Drop se activa principalmente en vista completa para no distorsionar el orden global
  const isDragDisabled = filter !== 'all' || priorityFilter !== 'all' || Boolean(searchQuery.trim());

  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center text-slate-400">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-sm font-medium">Sincronizando tareas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="todo-list-container">
      {/* Barra de Filtros, Búsqueda y Prioridad */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Filtros de Estado */}
        <div className="flex bg-slate-100 p-1 rounded-xl">
          {(
            [
              { key: 'all', label: 'Todas', count: tasks.length },
              { key: 'pending', label: 'Pendientes', count: tasks.filter((t) => !t.completed).length },
              { key: 'completed', label: 'Completadas', count: tasks.filter((t) => t.completed).length },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              data-testid={`filter-${tab.key}`}
              onClick={() => setFilter(tab.key)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                filter === tab.key
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  filter === tab.key
                    ? 'bg-indigo-50 text-indigo-700 font-bold'
                    : 'bg-slate-200/80 text-slate-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Búsqueda y Selector de Prioridad */}
        <div className="flex items-center gap-2 flex-1 md:max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              data-testid="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar tareas..."
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          <div className="flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
              className="py-1.5 px-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 text-slate-700 font-medium"
              aria-label="Filtrar por prioridad"
            >
              <option value="all">Prioridad: Todas</option>
              <option value="high">Alta</option>
              <option value="medium">Media</option>
              <option value="low">Baja</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Tareas o Estado Vacío */}
      {filteredTasks.length === 0 ? (
        <div
          data-testid="empty-tasks-state"
          className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center flex flex-col items-center justify-center"
        >
          {searchQuery ? (
            <>
              <AlertCircle className="w-10 h-10 text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-700">Sin coincidencias</p>
              <p className="text-xs text-slate-500 mt-1">
                No encontramos tareas que coincidan con &quot;{searchQuery}&quot;.
              </p>
            </>
          ) : filter === 'completed' ? (
            <>
              <CheckCircle2 className="w-10 h-10 text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-700">Aún no hay tareas completadas</p>
              <p className="text-xs text-slate-500 mt-1">
                Marca el checkbox de tus tareas pendientes cuando las finalices.
              </p>
            </>
          ) : (
            <>
              <ListTodo className="w-10 h-10 text-indigo-300 mb-2" />
              <p className="text-sm font-semibold text-slate-700">Tu lista está vacía</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                Crea tu primera tarea en el formulario superior para comenzar a organizar tu día.
              </p>
            </>
          )}
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={filteredTasks.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2.5">
              {filteredTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={handleToggleWithCelebration}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  isDragDisabled={isDragDisabled}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Indicador de Drag & Drop */}
      {filteredTasks.length > 1 && !isDragDisabled && (
        <p className="text-center text-[11px] text-slate-400 font-medium">
          💡 Puedes arrastrar y soltar las tareas para ordenar tu prioridad diaria.
        </p>
      )}
    </div>
  );
};
