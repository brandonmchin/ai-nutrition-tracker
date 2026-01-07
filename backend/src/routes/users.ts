import express from 'express';
import prisma from '../prisma';

const router = express.Router();

// Create a user under an account
router.post('/', async (req, res) => {
  try {
    const { name, accountId } = req.body;
    
    if (!accountId) {
      return res.status(400).json({ error: 'Account ID required' });
    }
    
    const user = await prisma.user.create({
      data: { 
        name,
        accountId
      }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Get all users for an account
router.get('/account/:accountId', async (req, res) => {
  try {
    const { accountId } = req.params;
    const users = await prisma.user.findMany({
      where: { accountId }
    });
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