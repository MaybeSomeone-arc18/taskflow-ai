import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import { NotificationProvider, useNotifications } from '../../../context/NotificationContext';
import { eventBus } from '../../../utils/eventBus';
import { NotificationDropdown } from '../NotificationDropdown';

let captured: ReturnType<typeof useNotifications>;
const Probe: React.FC = () => {
  captured = useNotifications();
  return null;
};

const renderDropdown = () =>
  render(
    <NotificationProvider>
      <Probe />
      <NotificationDropdown />
    </NotificationProvider>
  );

describe('Notification bell / dropdown count', () => {
  afterEach(() => cleanup());

  beforeEach(() => {
    localStorage.clear();
  });

  it('unread count in the dropdown header drops when the deleted task’s notifications are pruned', () => {
    renderDropdown();
    act(() => {
      eventBus.emit('new_notification', { title: 'Task Created', message: 'a', type: 'task', taskId: 't1' });
      eventBus.emit('new_notification', { title: 'Task Completed', message: 'b', type: 'task', taskId: 't1' });
      eventBus.emit('new_notification', { title: 'Task Created', message: 'c', type: 'task', taskId: 't2' });
    });

    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('3 new')).toBeTruthy();

    act(() => captured.removeNotificationsForTask('t1'));
    expect(screen.getByText('1 new')).toBeTruthy();

    act(() => captured.removeNotificationsForTask('t2'));
    expect(screen.queryByText(/^\d+ new$/)).toBeNull();
  });
});
