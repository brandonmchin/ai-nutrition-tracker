import express from 'express';
import prisma from '../prisma';

const router = express.Router();

// Create a test user
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    const user = await prisma.user.create({
      data: { name }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Get all users
router.get('/', async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

export default router;