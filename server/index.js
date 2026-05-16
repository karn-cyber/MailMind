const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config({ path: __dirname + '/.env' });

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ──────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── MongoDB ─────────────────────────────────────────────────────────────────
let db;
const client = new MongoClient(process.env.MONGODB_URI);

async function connectDB() {
  try {
    await client.connect();
    db = client.db(); // uses the db name from the URI ("mailmind")
    console.log('✅ Connected to MongoDB Atlas');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  }
}

// Make db accessible to routes
app.use((req, res, next) => {
  req.db = db;
  next();
});

// ─── Health Check ────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Sender Routes ──────────────────────────────────────────────────────────

// GET /senders — list all senders sorted by most recent
app.get('/senders', async (req, res) => {
  try {
    const senders = await req.db
      .collection('senders')
      .find()
      .sort({ lastMessageAt: -1 })
      .toArray();
    res.json(senders);
  } catch (err) {
    console.error('GET /senders error:', err);
    res.status(500).json({ error: 'Failed to fetch senders' });
  }
});

// POST /senders — create a new sender
app.post('/senders', async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'name and email are required' });
    }

    // Check if sender already exists
    const existing = await req.db.collection('senders').findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.json(existing);
    }

    const doc = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      lastMessageAt: new Date(),
      unreadCount: 0,
      createdAt: new Date(),
    };
    const result = await req.db.collection('senders').insertOne(doc);
    res.status(201).json({ ...doc, _id: result.insertedId });
  } catch (err) {
    console.error('POST /senders error:', err);
    res.status(500).json({ error: 'Failed to create sender' });
  }
});

// DELETE /senders/:id — delete sender and all their messages
app.delete('/senders/:id', async (req, res) => {
  try {
    const id = new ObjectId(req.params.id);
    await req.db.collection('messages').deleteMany({ senderId: id.toString() });
    const result = await req.db.collection('senders').deleteOne({ _id: id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Sender not found' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /senders/:id error:', err);
    res.status(500).json({ error: 'Failed to delete sender' });
  }
});

// ─── Message Routes ─────────────────────────────────────────────────────────

// GET /messages?senderId=X — get all messages for a sender
app.get('/messages', async (req, res) => {
  try {
    const { senderId } = req.query;
    if (!senderId) {
      return res.status(400).json({ error: 'senderId query param is required' });
    }
    const messages = await req.db
      .collection('messages')
      .find({ senderId })
      .sort({ createdAt: 1 })
      .toArray();
    res.json(messages);
  } catch (err) {
    console.error('GET /messages error:', err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// POST /messages — save a new message
app.post('/messages', async (req, res) => {
  try {
    const { senderId, type, content, summary, casualDraft, tone } = req.body;
    if (!senderId || !type) {
      return res.status(400).json({ error: 'senderId and type are required' });
    }

    const doc = {
      senderId,
      type, // 'email_in' or 'reply_out'
      content: content || '',
      summary: summary || [],
      casualDraft: casualDraft || '',
      tone: tone || '',
      createdAt: new Date(),
    };

    const result = await req.db.collection('messages').insertOne(doc);

    // Update sender's lastMessageAt and increment unread for incoming
    const updateFields = { lastMessageAt: new Date() };
    if (type === 'email_in') {
      await req.db.collection('senders').updateOne(
        { _id: new ObjectId(senderId) },
        { $set: updateFields, $inc: { unreadCount: 1 } }
      );
    } else {
      await req.db.collection('senders').updateOne(
        { _id: new ObjectId(senderId) },
        { $set: { ...updateFields, unreadCount: 0 } }
      );
    }

    res.status(201).json({ ...doc, _id: result.insertedId });
  } catch (err) {
    console.error('POST /messages error:', err);
    res.status(500).json({ error: 'Failed to save message' });
  }
});

// ─── Start Server ───────────────────────────────────────────────────────────
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 MailMind API running on http://localhost:${PORT}`);
  });
});
