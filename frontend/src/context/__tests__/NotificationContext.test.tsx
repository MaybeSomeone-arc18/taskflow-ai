import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import React, { useEffect } from 'react';
import { render, act, cleanup } from '@testing-library/react';
import { NotificationProvider, useNotifications, Notification } from '../NotificationContext';
import { eventBus } from '../../utils/eventBus';

let captured: ReturnType<typeof useNotifications>;

const Probe: React.FC = () => {
  captured = useNotifications();
  return null;
};

const setup = () =>
  render(
    <NotificationProvider>
      <Probe />
    </NotificationProvider>
  );

const emit = (n: Parameters<ReturnType<typeof useNotifications>['addNotification']>[0]) =>
  act(() => {
    eventBus.emit('new_notification', n);
  });

describe('NotificationContext task-scoped pruning', () => {
  afterEach(() => cleanup());

  beforeEach(() => {
    localStorage.clear();
  });

  it('stores taskId carried through the new_notification event (emit-site contract)', () => {
    setup();
    emit({ title: 'Task Created', message: 'm', type: 'task', taskId: 't1' });
    expect(captured.notifications[0].taskId).toBe('t1');
    expect(captured.unreadCount).toBe(1);
  });

  it('prunes only the deleted task’s notifications; duplicate titles and unrelated tasks stay', () => {
    setup();
    emit({ title: 'Task Created', message: 'same title', type: 'task', taskId: 't1' });
    emit({ title: 'Task Completed', message: 'same title', type: 'task', taskId: 't1' });
    emit({ title: 'Task Created', message: 'same title', type: 'task', taskId: 't2' });
    emit({ title: 'Project Created', message: 'no task', type: 'project' });
    expect(captured.unreadCount).toBe(4);

    act(() => captured.removeNotificationsForTask('t1'));

    const remaining = captured.notifications;
    expect(remaining.length).toBe(2);
    expect(remaining.some((n) => n.taskId === 't1')).toBe(false);
    expect(remaining.filter((n) => n.message === 'same title').length).toBe(1);
    expect(remaining.some((n) => n.taskId === 't2')).toBe(true);
    expect(remaining.some((n) => n.type === 'project')).toBe(true);
    expect(captured.unreadCount).toBe(2);
  });

  it('leaves notifications recorded without a taskId (pre-fix records) untouched', () => {
    setup();
    emit({ title: 'Task Created', message: 'old unlinked record', type: 'task' });
    emit({ title: 'Task Created', message: 'linked record', type: 'task', taskId: 't9' });

    act(() => captured.removeNotificationsForTask('t9'));

    expect(captured.notifications.length).toBe(1);
    expect(captured.notifications[0].message).toBe('old unlinked record');
  });

  it('loads old-format localStorage records (no taskId) and never prunes them by task', () => {
    const old: Notification[] = [
      { id: 'a', title: 'Task Created', message: 'legacy', type: 'task', isRead: false, createdAt: new Date().toISOString() },
    ];
    localStorage.setItem('taskflow_notifications', JSON.stringify(old));
    setup();
    expect(captured.notifications.length).toBe(1);

    act(() => captured.removeNotificationsForTask('anything'));
    expect(captured.notifications.length).toBe(1);
    expect(captured.unreadCount).toBe(1);
  });

  it('keeps read/unread state of survivors intact after pruning', () => {
    setup();
    emit({ title: 'A', message: 'm', type: 'task', taskId: 't1' });
    emit({ title: 'B', message: 'm', type: 'task', taskId: 't2' });
    const bId = captured.notifications.find((n) => n.taskId === 't2')!.id;
    act(() => captured.markAsRead(bId));
    expect(captured.unreadCount).toBe(1);

    act(() => captured.removeNotificationsForTask('t1'));
    expect(captured.unreadCount).toBe(0);
    expect(captured.notifications[0].isRead).toBe(true);
  });
});
