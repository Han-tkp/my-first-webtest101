
import { DataTypes } from 'sequelize';
import { sequelize } from '../db.js';
import Machine from './Machine.js';
import User from './User.js';

const Repair = sequelize.define('Repair', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  status: { type: DataTypes.ENUM('queued','in_progress','done'), defaultValue: 'queued' },
  note: { type: DataTypes.TEXT, allowNull: true }
}, { tableName: 'repairs' });

Repair.belongsTo(Machine, { foreignKey: { allowNull: false } });
Repair.belongsTo(User, { as: 'createdBy', foreignKey: { name: 'createdById', allowNull: false } });

export default Repair;
