import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient, Db, ObjectId } from 'mongodb';

// ─── Environment Setup ────────────────────────────────────────────────────────
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://neelanshu2024_db_user:W9VvY7saja8yVmd0@mailmind.lno8jtr.mongodb.net/?appName=MailMind';
const PORT = process.env.PORT || 3001;

// ─── MongoDB Setup ────────────────────────────────────────────────────────────
let db: Db;
let client: MongoClient;

const connectDB = async () => {
  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db('mailmind');
    
    // Create indexes
    const sendersCol = db.collection('senders');
    const messagesCol = db.collection('messages');
    
    await sendersCol.createIndex({ createdAt: -1 });
    await sendersCol.createIndex({ lastMessageAt: -1 });
    await messagesCol.createIndex({ senderId: 1, createdAt: -1 });
    
    console.log('✓ MongoDB connected successfully');
  } catch (error) {
    console.error('✗ MongoDB connection failed:', error);
    process.exit(1);
  }
};

// ─── Express App Setup ────────────────────────────────────────────────────────
const app: Express = express();

app.use(cors({
  origin: ['http://localhost:19000', 'http://localhost:8081', 'http://192.168.1.*'],
  credentials: true,
}));

app.use(express.json());

// ─── Types ────────────────────────────────────────────────────────────────────
interface Sender {
  _id?: string;
  name: string;
  email: string;
  lastMessageAt: string;
  unreadCount: number;
  createdAt: string;
}

interface Message {
  _id?: string;
  senderId: string;
  type: 'email_in' | 'reply_out';
  content: string;
  summary: string[];
  casualDraft: string;
  tone: string;
  createdAt: string;
}

// ─── Routes: Senders ──────────────────────────────────────────────────────────
/**
 * GET /senders
 * List all senders sorted by lastMessageAt descending
 */
app.get('/senders', async (req: Request, res: Response) => {
  try {
    const senders = await db
      .collection<Sender>('senders')
      .find({})
      .sort({ lastMessageAt: -1 })
      .toArray();
    
    res.json(senders);
  } catch (error) {
    console.error('Error fetching senders:', error);
    res.status(500).json({ error: 'Failed to fetch senders' });
  }
});

/**
 * POST /senders
 * Create a new sender { name, email }
 */
app.post('/senders', async (req: Request, res: Response) => {
  try {
    const { name, email } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }
    
    const now = new Date().toISOString();
    const newSender: Sender = {
      name,
      email,
      lastMessageAt: now,
      unreadCount: 0,
      createdAt: now,
    };
    
    const result = await db.collection<Sender>('senders').insertOne(newSender);
    
    res.status(201).json({ _id: result.insertedId, ...newSender });
  } catch (error) {
    console.error('Error creating sender:', error);
    res.status(500).json({ error: 'Failed to create sender' });
  }
});

/**
 * DELETE /senders/:id
 * Delete sender and all their messages
 */
app.delete('/senders/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'Sender ID is required' });
    }
    
    // Delete all messages for this sender
    await db.collection<Message>('messages').deleteMany({ senderId: id } as any);
    
    // Delete the sender
    const result = await db.collection<Sender>('senders').deleteOne({ _id: new ObjectId(id) } as any);
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Sender not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting sender:', error);
    res.status(500).json({ error: 'Failed to delete sender' });
  }
});

// ─── Routes: Messages ─────────────────────────────────────────────────────────
/**
 * GET /messages?senderId=X
 * Get all messages for a sender
 */
app.get('/messages', async (req: Request, res: Response) => {
  try {
    const { senderId } = req.query;
    
    if (!senderId) {
      return res.status(400).json({ error: 'senderId query parameter is required' });
    }
    
    const messages = await db
      .collection<Message>('messages')
      .find({ senderId: senderId as string })
      .sort({ createdAt: 1 })
      .toArray();
    
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

/**
 * POST /messages
 * Save a new message (email_in or reply_out)
 */
app.post('/messages', async (req: Request, res: Response) => {
  try {
    const { senderId, type, content, summary, casualDraft, tone } = req.body;
    
    if (!senderId || !type || !content) {
      return res.status(400).json({ error: 'senderId, type, and content are required' });
    }
    
    if (!['email_in', 'reply_out'].includes(type)) {
      return res.status(400).json({ error: 'type must be email_in or reply_out' });
    }
    
    const now = new Date().toISOString();
    const newMessage: Message = {
      senderId,
      type,
      content,
      summary: summary || [],
      casualDraft: casualDraft || '',
      tone: tone || '',
      createdAt: now,
    };
    
    const result = await db.collection<Message>('messages').insertOne(newMessage);
    
    // Update sender's lastMessageAt
    await db.collection<Sender>('senders').updateOne(
      { _id: new ObjectId(senderId) } as any,
      { $set: { lastMessageAt: now } }
    );
    
    res.status(201).json({ _id: result.insertedId, ...newMessage });
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).json({ error: 'Failed to create message' });
  }
});

// ─── Health Check ────────────────────────────────────────────────────────────
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Error Handler ───────────────────────────────────────────────────────────
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ─── Start Server ────────────────────────────────────────────────────────────
const startServer = async () => {
  await connectDB();
  
  app.listen(PORT, () => {
    console.log(`🚀 MailMind server running on http://localhost:${PORT}`);
  });
};

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
