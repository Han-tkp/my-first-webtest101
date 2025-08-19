
import { DataTypes } from 'sequelize';
import { sequelize } from '../db.js';
import Borrow from './Borrow.js';

const Return = sequelize.define('Return', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  returnDate: { type: DataTypes.DATEONLY, allowNull: false },
  condition: { type: DataTypes.STRING, allowNull: true }
}, { tableName: 'returns' });

Return.belongsTo(Borrow, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });

export default Return;
