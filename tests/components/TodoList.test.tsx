import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TodoList } from '@/components/TodoList';
import { Task } from '@/types';

// Mock de canvas-confetti
vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}));

describe('TodoList Component', () => {
  const mockTasks: Task[] = [
    {
      id: 'task-1',
      title: 'Configurar Firebase',
      description: 'Habilitar Auth y Firestore',
      completed: false,
      priority: 'high',
      userId: 'user-1',
      createdAt: 1000,
      order: 0,
    },
    {
      id: 'task-2',
      title: 'Crear componentes React',
      description: 'Armar TodoList y TodoForm',
      completed: true,
      priority: 'medium',
      userId: 'user-1',
      createdAt: 2000,
      order: 1,
    },
    {
      id: 'task-3',
      title: 'Escribir tests con Vitest',
      description: 'Mockear servicios y probar CRUD',
      completed: false,
      priority: 'low',
      userId: 'user-1',
      createdAt: 3000,
      order: 2,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'confirm').mockImplementation(() => true);
  });

  it('renderiza la lista de tareas correctamente', () => {
    render(
      <TodoList
        tasks={mockTasks}
        loading={false}
        onToggle={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onReorder={vi.fn()}
      />
    );

    expect(screen.getByText('Configurar Firebase')).toBeInTheDocument();
    expect(screen.getByText('Crear componentes React')).toBeInTheDocument();
    expect(screen.getByText('Escribir tests con Vitest')).toBeInTheDocument();
  });

  it('filtra tareas completadas y pendientes al hacer clic en las pestañas', async () => {
    const user = userEvent.setup();
    render(
      <TodoList
        tasks={mockTasks}
        loading={false}
        onToggle={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onReorder={vi.fn()}
      />
    );

    // Clic en pestaña 'Pendientes'
    const pendingTab = screen.getByTestId('filter-pending');
    await user.click(pendingTab);

    expect(screen.getByText('Configurar Firebase')).toBeInTheDocument();
    expect(screen.getByText('Escribir tests con Vitest')).toBeInTheDocument();
    expect(screen.queryByText('Crear componentes React')).not.toBeInTheDocument();

    // Clic en pestaña 'Completadas'
    const completedTab = screen.getByTestId('filter-completed');
    await user.click(completedTab);

    expect(screen.getByText('Crear componentes React')).toBeInTheDocument();
    expect(screen.queryByText('Configurar Firebase')).not.toBeInTheDocument();
  });

  it('filtra tareas mediante la barra de búsqueda', async () => {
    const user = userEvent.setup();
    render(
      <TodoList
        tasks={mockTasks}
        loading={false}
        onToggle={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onReorder={vi.fn()}
      />
    );

    const searchInput = screen.getByTestId('search-input');
    await user.type(searchInput, 'Vitest');

    expect(screen.getByText('Escribir tests con Vitest')).toBeInTheDocument();
    expect(screen.queryByText('Configurar Firebase')).not.toBeInTheDocument();
    expect(screen.queryByText('Crear componentes React')).not.toBeInTheDocument();
  });

  it('llama a onToggle cuando se hace clic en el checkbox de una tarea', () => {
    const handleToggle = vi.fn();
    render(
      <TodoList
        tasks={mockTasks}
        loading={false}
        onToggle={handleToggle}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onReorder={vi.fn()}
      />
    );

    const toggleBtn = screen.getByTestId('task-toggle-task-1');
    fireEvent.click(toggleBtn);

    expect(handleToggle).toHaveBeenCalledWith('task-1');
  });

  it('llama a onDelete cuando se presiona el botón eliminar y se confirma', () => {
    const handleDelete = vi.fn();
    render(
      <TodoList
        tasks={mockTasks}
        loading={false}
        onToggle={vi.fn()}
        onEdit={vi.fn()}
        onDelete={handleDelete}
        onReorder={vi.fn()}
      />
    );

    const deleteBtn = screen.getByTestId('task-delete-task-1');
    fireEvent.click(deleteBtn);

    expect(handleDelete).toHaveBeenCalledWith('task-1');
  });

  it('muestra estado vacío cuando no hay tareas disponibles', () => {
    render(
      <TodoList
        tasks={[]}
        loading={false}
        onToggle={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onReorder={vi.fn()}
      />
    );

    expect(screen.getByTestId('empty-tasks-state')).toBeInTheDocument();
    expect(screen.getByText('Tu lista está vacía')).toBeInTheDocument();
  });
});
