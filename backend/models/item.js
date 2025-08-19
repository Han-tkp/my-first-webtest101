module.exports = (sequelize, DataTypes) => {
  const Item = sequelize.define('Item', {
    name: { type: DataTypes.STRING, allowNull: false },
    price: { type: DataTypes.FLOAT, allowNull: false },
    stock: { type: DataTypes.INTEGER, allowNull: false }
  });
  return Item;
};