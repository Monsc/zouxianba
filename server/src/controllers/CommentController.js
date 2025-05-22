const catchAsync = require('../utils/catchAsync');

const createComment = catchAsync(async (req, res) => {
  res.status(201).json({ message: 'Comment created successfully' });
});

const updateComment = catchAsync(async (req, res) => {
  const { id } = req.params;
  res.status(200).json({ message: `Comment ${id} updated` });
});

const deleteComment = catchAsync(async (req, res) => {
  const { id } = req.params;
  res.status(200).json({ message: `Comment ${id} deleted successfully` });
});

module.exports = {
  createComment,
  updateComment,
  deleteComment,
};
