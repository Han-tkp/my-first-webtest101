const { User } = require('../models');

exports.getUsers = async (req, res) => {
  const users = await User.findAll();
  res.json(users);
};

exports.addUser = async (req, res) => {
  const user = await User.create(req.body);
  res.json(user);
};

exports.updateUser = async (req, res) => {
  await User.update(req.body, { where: { id: req.params.id } });
  res.json({ message: 'User updated' });
};

exports.deleteUser = async (req, res) => {
  await User.destroy({ where: { id: req.params.id } });
  res.json({ message: 'User deleted' });
};