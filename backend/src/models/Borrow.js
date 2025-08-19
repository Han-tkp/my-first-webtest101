
import { DataTypes } from 'sequelize';
import { sequelize } from '../db.js';
import Machine from './Machine.js';
import User from './User.js';

const Borrow = sequelize.define('Borrow', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  borrowDate: { type: DataTypes.DATEONLY, allowNull: false },
  dueDate: { type: DataTypes.DATEONLY, allowNull: true },
  quantity: { type: DataTypes.INTEGER, defaultValue: 1 }
}, { tableName: 'borrows' });

Borrow.belongsTo(Machine, { foreignKey: { allowNull: false } });
Borrow.belongsTo(User, { as: 'borrower', foreignKey: { name: 'userId', allowNull: false } });

export default Borrow;
