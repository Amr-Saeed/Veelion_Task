const path = require('node:path');

const { createId } = require('../../../utils/id');
const { readJsonArray, writeJsonArray } = require('../../../utils/jsonStore');
const HttpError = require('../../../utils/httpError');

const ACTIVITY_FILE_PATH = path.join(
  __dirname,
  '..',
  '..',
  '..',
  '..',
  'data',
  'activity.json'
);
const MAX_FIELD_LENGTH = 500;

async function getAllActivity() {
  return readJsonArray(ACTIVITY_FILE_PATH);
}

async function createNewActivity(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new HttpError(400, 'Body must be a JSON object.');
  }

  const action = typeof payload.action === 'string' ? payload.action.trim() : '';
  const info = typeof payload.info === 'string' ? payload.info.trim() : '';

  if (!action || !info) {
    throw new HttpError(400, 'action and info are required strings.');
  }

  if (action.length > MAX_FIELD_LENGTH || info.length > MAX_FIELD_LENGTH) {
    throw new HttpError(400, `action and info must be ${MAX_FIELD_LENGTH} characters or fewer.`);
  }

  const activity = {
    id: createId(),
    action,
    info,
    when: new Date().toISOString(),
  };

  const activities = await readJsonArray(ACTIVITY_FILE_PATH);
  activities.push(activity);
  await writeJsonArray(ACTIVITY_FILE_PATH, activities);

  return activity;
}

module.exports = {
  getAllActivity,
  createNewActivity,
};
