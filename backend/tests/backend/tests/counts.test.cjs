const { test } = require('node:test');
const assert = require('node:assert/strict');
const Project = require('../dist/models/Project.js').default;
const Task = require('../dist/models/Task.js').default;
const ActivityLog = require('../dist/models/ActivityLog.js').default;
const { getDashboardStats } = require('../dist/services/analyticsService.js');

test('dashboard counts created and assigned tasks, and reflects deletion', async () => {
  const id = '507f1f77bcf86cd799439011';
  let tasks = [
    { title: 'created, unassigned', createdBy: id, assignedTo: null, status: 'Todo' },
    { title: 'assigned to me', createdBy: '507f1f77bcf86cd799439012', assignedTo: id, status: 'Completed' },
  ];
  const original = { find: Project.find, count: Task.countDocuments, taskFind: Task.find, activityFind: ActivityLog.find };
  Project.find = async () => [{ _id: id, status: 'Active' }];
  Task.countDocuments = async (query) => tasks.filter(t =>
    (query.$or || []).some(part => Object.entries(part).some(([key, value]) => String(t[key]) === String(value))) &&
    (!query.status || (typeof query.status === 'string' ? t.status === query.status :
      query.status.$in ? query.status.$in.includes(t.status) : t.status !== query.status.$ne)) &&
    !query.dueDate
  ).length;
  const emptyChain = { populate() { return this; }, sort() { return this; }, limit() { return this; }, then(resolve) { return Promise.resolve([]).then(resolve); } };
  Task.find = () => emptyChain;
  ActivityLog.find = () => emptyChain;
  try {
    let result = await getDashboardStats(id);
    assert.equal(result.totalTasks, 2);
    assert.equal(result.pendingTasks, 1);
    tasks = tasks.filter(t => t.title !== 'created, unassigned');
    result = await getDashboardStats(id);
    assert.equal(result.totalTasks, 1);
    assert.equal(result.pendingTasks, 0);
  } finally {
    Project.find = original.find; Task.countDocuments = original.count;
    Task.find = original.taskFind; ActivityLog.find = original.activityFind;
  }
});
