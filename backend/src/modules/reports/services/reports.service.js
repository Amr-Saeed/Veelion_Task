const path = require('node:path');
const { readJsonArray } = require('../../../utils/jsonStore');

const DATA_DIRECTORY = path.join(__dirname, '..', '..', '..', '..', 'data');
const TASKS_FILE_PATH = path.join(DATA_DIRECTORY, 'tasks.json');
const ACTIVITY_FILE_PATH = path.join(DATA_DIRECTORY, 'activity.json');
const RECENT_ACTIVITY_WINDOW_DAYS = 7;

function getTaskStatus(task) {
  if (task.status === 'todo' || task.status === 'in-progress' || task.status === 'done') {
    return task.status;
  }

  return task.completed === true ? 'done' : 'todo';
}

function isRecentActivity(activity, now = Date.now()) {
  const timestamp = Date.parse(activity.when);
  if (Number.isNaN(timestamp)) {
    return false;
  }

  const windowStart = now - RECENT_ACTIVITY_WINDOW_DAYS * 24 * 60 * 60 * 1000;
  return timestamp >= windowStart && timestamp <= now;
}

async function getTasksSummary() {
  const [tasks, activities] = await Promise.all([
    readJsonArray(TASKS_FILE_PATH),
    readJsonArray(ACTIVITY_FILE_PATH)
  ]);

  const byStatus = {
    todo: 0,
    'in-progress': 0,
    done: 0,
  };

  for (const task of tasks) {
    byStatus[getTaskStatus(task)] += 1;
  }

  return {
    total: tasks.length,
    byStatus,
    recentActivityCount: activities.filter((activity) => isRecentActivity(activity)).length,
  };
}

module.exports = {
  getTasksSummary
};
