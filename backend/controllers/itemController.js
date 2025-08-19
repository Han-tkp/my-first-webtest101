const { Item } = require('../models');

exports.getItems = async (req, res) => {
  const items = await Item.findAll();
  res.json(items);
};

exports.addItem = async (req, res) => {
  const item = await Item.create(req.body);
  res.json(item);
};

exports.updateItem = async (req, res) => {
  await Item.update(req.body, { where: { id: req.params.id } });
  res.json({ message: 'Item updated' });
};

exports.deleteItem = async (req, res) => {
  await Item.destroy({ where: { id: req.params.id } });
  res.json({ message: 'Item deleted' });
};