import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor, act, cleanup } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

vi.mock('../../services/projectService', () => ({
  getProject: vi.fn(async () => ({
    _id: 'p1', title: 'Demo Project', description: '', color: '#000', status: 'Active',
    createdBy: 'u1', createdAt: '', updatedAt: '',
  })),
}));
vi.mock('../../services/taskService', () => ({
  getProjectTasks: vi.fn(async () => ({
    tasks: [
      {
        _id: 'task-1', projectId: 'p1', title: 'Write spec', description: '', status: 'Todo',
        priority: 'Medium', estimatedHours: 0, actualHours: 0, tags: [], createdBy: 'u1',
        createdAt: '', updatedAt: '',
      },
    ],
    pages: 1,
    total: 1,
  })),
  createTask: vi.fn(),
  updateTask: vi.fn(),
  deleteTask: vi.fn(),
}));
vi.mock('../../components/AIPanel', () => ({ default: () => null }));
vi.mock('../../components/ShareModal', () => ({ ShareModal: () => null }));

import { getProjectTasks, deleteTask } from '../../services/taskService';
import { NotificationProvider, useNotifications } from '../../context/NotificationContext';
import { eventBus } from '../../utils/eventBus';
import KanbanBoard from '../KanbanBoard';

let captured: ReturnType<typeof useNotifications>;
const Probe: React.FC = () => {
  captured = useNotifications();
  return null;
};

const renderBoard = () =>
  render(
    <MemoryRouter initialEntries={['/project/p1']}>
      <NotificationProvider>
        <Probe />
        <Routes>
          <Route path="/project/:projectId" element={<KanbanBoard />} />
        </Routes>
      </NotificationProvider>
    </MemoryRouter>
  );

const seedTaskNotifications = () =>
  act(() => {
    eventBus.emit('new_notification', { title: 'Task Created', message: 'Task "Write spec" was successfully added.', type: 'task', taskId: 'task-1' });
    eventBus.emit('new_notification', { title: 'Task Created', message: 'other task', type: 'task', taskId: 'task-2' });
  });

const deleteViaUI = async () => {
  await waitFor(() => expect(screen.getByText('Write spec')).toBeTruthy());
  const card = screen.getByText('Write spec').closest('div')!;
  const buttons = Array.from(card.querySelectorAll('button'));
  const deleteBtn = buttons.find((b) => b.querySelector('svg.lucide-trash2'));
  expect(deleteBtn, 'card delete button').toBeTruthy();
  fireEvent.click(deleteBtn!);
  const confirm = await screen.findByText('Delete Permanently');
  fireEvent.click(confirm);
};

describe('KanbanBoard task deletion and notifications', () => {
  afterEach(() => cleanup());

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('prunes the deleted task’s notifications only after a successful delete', async () => {
    (deleteTask as any).mockResolvedValueOnce({});
    renderBoard();
    seedTaskNotifications();
    expect(captured.unreadCount).toBe(2);

    await deleteViaUI();

    await waitFor(() => {
      expect(captured.notifications.some((n) => n.taskId === 'task-1')).toBe(false);
    });
    expect(captured.notifications.some((n) => n.taskId === 'task-2')).toBe(true);
    expect(captured.notifications.some((n) => n.title === 'Task Deleted')).toBe(true);
  });

  it('preserves all notifications when the delete request fails', async () => {
    (deleteTask as any).mockRejectedValueOnce(new Error('server error'));
    renderBoard();
    seedTaskNotifications();
    expect(captured.unreadCount).toBe(2);

    await deleteViaUI();

    await waitFor(() => {
      expect(screen.getByText('server error')).toBeTruthy();
    });
    expect(captured.notifications.some((n) => n.taskId === 'task-1')).toBe(true);
    expect(captured.notifications.some((n) => n.taskId === 'task-2')).toBe(true);
    expect(captured.notifications.some((n) => n.title === 'Task Deleted')).toBe(false);
    expect(captured.unreadCount).toBe(2);
  });
});
