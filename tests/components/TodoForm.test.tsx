import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TodoForm } from '@/components/TodoForm';
import { Task } from '@/types';

describe('TodoForm Component', () => {
  it('renderiza correctamente los campos del formulario', () => {
    render(<TodoForm onSubmit={vi.fn()} />);

    expect(screen.getByTestId('task-title-input')).toBeInTheDocument();
    expect(screen.getByTestId('task-desc-input')).toBeInTheDocument();
    expect(screen.getByTestId('task-due-input')).toBeInTheDocument();
    expect(screen.getByTestId('submit-task-button')).toBeInTheDocument();
  });

  it('muestra error de validación cuando se intenta enviar sin título', async () => {
    const handleSubmit = vi.fn();
    render(<TodoForm onSubmit={handleSubmit} />);

    const submitBtn = screen.getByTestId('submit-task-button');
    fireEvent.click(submitBtn);

    expect(
      screen.getByText('El título de la tarea es obligatorio.')
    ).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('llama a onSubmit con los datos correctos al ingresar título y prioridad', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();
    render(<TodoForm onSubmit={handleSubmit} />);

    const titleInput = screen.getByTestId('task-title-input');
    const descInput = screen.getByTestId('task-desc-input');
    const highPriorityBtn = screen.getByRole('button', { name: 'Alta' });
    const submitBtn = screen.getByTestId('submit-task-button');

    await user.type(titleInput, 'Aprender Firestore');
    await user.type(descInput, 'Crear reglas de seguridad');
    await user.click(highPriorityBtn);
    await user.click(submitBtn);

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledTimes(1);
      expect(handleSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Aprender Firestore',
          description: 'Crear reglas de seguridad',
          priority: 'high',
        })
      );
    });
  });

  it('rellena los datos de la tarea cuando se proporciona initialTask (modo edición)', () => {
    const mockTask: Task = {
      id: 'task-1',
      title: 'Tarea existente',
      description: 'Descripción existente',
      priority: 'high',
      dueDate: '2026-12-31',
      completed: false,
      userId: 'user-123',
      createdAt: 1000,
      order: 0,
    };

    render(<TodoForm initialTask={mockTask} onSubmit={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.getByDisplayValue('Tarea existente')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Descripción existente')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2026-12-31')).toBeInTheDocument();
    expect(screen.getByText('Guardar Cambios')).toBeInTheDocument();
  });
});
