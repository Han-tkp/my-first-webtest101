
import { DataTypes } from 'sequelize';
import { sequelize } from '../db.js';
import MachineType from './MachineType.js';

const Machine = sequelize.define('Machine', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  code: { type: DataTypes.STRING, allowNull: false, unique: true },
  serial: { type: DataTypes.STRING, allowNull: true },
  status: { type: DataTypes.ENUM('idle','borrowed','repair','retired'), defaultValue: 'idle' },
  location: { type: DataTypes.STRING, allowNull: true },
  price: { type: DataTypes.DECIMAL(12,2), allowNull: true }
}, { tableName: 'machines' });

Machine.belongsTo(MachineType, { foreignKey: { allowNull: false }, onDelete: 'RESTRICT' });

export default Machine;
