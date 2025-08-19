
import { DataTypes } from 'sequelize';
import { sequelize } from '../db.js';

const MachineType = sequelize.define('MachineType', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  code: { type: DataTypes.STRING, allowNull: false, unique: true },
  name: { type: DataTypes.STRING, allowNull: false }
}, { tableName: 'machine_types' });

export default MachineType;
