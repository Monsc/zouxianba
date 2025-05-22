const catchAsync = require('../utils/catchAsync');

const createComment = catchAsync(async (req, res) => {
  res.status(201).json({ message: 'Comment created successfully' });
});

module.exports = {
  createComment,
};
