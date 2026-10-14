const activityService = require('../services/activity.service');
const asyncHandler = require('../../../middleware/asyncHandler');

const getActivity = asyncHandler(async (req, res) => {
  const activities = await activityService.getAllActivity();
  res.status(200).json(activities);
});

const addActivity = asyncHandler(async (req, res) => {
  const activity = await activityService.createNewActivity(req.body);
  res.status(201).json(activity);
});

module.exports = {
  getActivity,
  addActivity,
};
