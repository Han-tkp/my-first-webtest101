
import { Router } from 'express';
import Machine from '../models/Machine.js';
import Borrow from '../models/Borrow.js';
import Repair from '../models/Repair.js';
import { requireAuth } from '../middleware/auth.js';
import { Op } from 'sequelize';

const router = Router();

router.get('/', requireAuth, async (req,res)=>{
  const total = await Machine.count();
  const idle = await Machine.count({ where: { status:'idle' } });
  const borrowed = await Machine.count({ where: { status:'borrowed' } });
  const repair = await Machine.count({ where: { status:'repair' } });
  const recentBorrows = await Borrow.findAll({ limit: 5, order:[['id','DESC']] });
  const recentRepairs = await Repair.findAll({ limit: 5, order:[['id','DESC']] });
  res.json({ total, idle, borrowed, repair, recentBorrows, recentRepairs });
});

export default router;
