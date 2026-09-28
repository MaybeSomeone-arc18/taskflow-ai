const { test } = require('node:test');
const assert = require('node:assert/strict');
const Project = require('../dist/models/Project.js').default;
const { getDashboardStats, getChartData } = require('../dist/services/analyticsService.js');

test('dashboard excludes archived projects and their tasks', async () => {
  const original = Project.find;
  let query;
  Project.find = async (filter) => { query = filter; return []; };
  try {
    const result = await getDashboardStats('507f1f77bcf86cd799439011');
    assert.equal(query.status, 'Active');
    assert.equal(result.totalTasks, 0);
    assert.equal(result.pendingTasks, 0);
  } finally { Project.find = original; }
});

test('chart excludes archived projects', async () => {
  const original = Project.find;
  let query;
  Project.find = async (filter) => { query = filter; return []; };
  try {
    const result = await getChartData('507f1f77bcf86cd799439011');
    assert.equal(query.status, 'Active');
    assert.deepEqual(result.projectProgress, []);
  } finally { Project.find = original; }
});
