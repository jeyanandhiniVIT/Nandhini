import { Request, Response } from 'express';
import { z } from 'zod';
import * as messageService from '../services/message.service';
import { authenticateJWT } from '../middleware/auth.middleware';
import { createMessageSchema } from '../validators/message.validators';

export const getMyMessages = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const messages = await messageService.getMessagesForUser(req.user.id);
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving messages' });
  }
};

export const sendMessage = async (req: Request, res: Response) => {
  const result = createMessageSchema.safeParse(req.body);
  
  if (!result.success) {
    return res.status(400).json({ errors: result.error.errors });
  }

  const { recipientId, content } = result.data;

  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const newMessage = await messageService.createMessage({
      senderId: req.user.id,
      senderName: `${req.user.firstName} ${req.user.lastName}`,
      recipientId,
      content,
      timestamp: new Date(),
    });
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: 'Error sending message' });
  }
};
