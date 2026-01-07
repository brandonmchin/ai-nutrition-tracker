import express from 'express';
import prisma from '../prisma';

const router = express.Router();

// Create a user
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

// Delete a user
router.delete('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    await prisma.user.delete({
      where: { id: userId }
    });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;