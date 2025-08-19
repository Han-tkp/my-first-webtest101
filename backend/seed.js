
import { sequelize } from './src/db.js';
import './src/models/associations.js';
import User from './src/models/User.js';
import MachineType from './src/models/MachineType.js';
import Machine from './src/models/Machine.js';
import { hashPassword } from './src/utils/password.js';

async function run() {
  await sequelize.sync({ force: true });
  const admin = await User.create({
    name: 'Admin',
    email: 'admin@weldork.local',
    passwordHash: await hashPassword('admin123'),
    role: 'admin'
  });
  const user = await User.create({
    name: 'User',
    email: 'user@weldork.local',
    passwordHash: await hashPassword('user123'),
    role: 'user'
  });

  const mt1 = await MachineType.create({ code: 'mt101', name: 'เครื่องเชื่อม แม็ก' });
  const mt2 = await MachineType.create({ code: 'mt102', name: 'เครื่องเชื่อม อาร์กอน' });

  await Machine.create({ code: 'm101', serial: '092373097', MachineTypeId: mt1.id, status: 'idle', location:'c1', price: 40000 });
  await Machine.create({ code: 'm102', serial: '72836491', MachineTypeId: mt2.id, status: 'idle', location:'c1', price: 10000 });

  console.log('Seed complete');
  process.exit(0);
}

run().catch(e=>{ console.error(e); process.exit(1); });
