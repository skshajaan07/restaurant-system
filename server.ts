import express from 'express';
import { createServer as createViteServer } from 'vite';
import db, { initDb } from './src/db';
import bodyParser from 'body-parser';

// Initialize DB
initDb();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(bodyParser.json());

  // API Routes
  app.get('/api/menu', (req, res) => {
    try {
      const items = db.prepare('SELECT * FROM menu_items').all();
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch menu items' });
    }
  });

  app.post('/api/orders', (req, res) => {
    try {
      const { user_name, user_email, user_phone, user_address, payment_method, items, total_amount } = req.body;
      
      if (!items || items.length === 0) {
        return res.status(400).json({ error: 'No items in order' });
      }

      const createOrder = db.transaction(() => {
        const result = db.prepare(`
          INSERT INTO orders (user_name, user_email, user_phone, user_address, payment_method, total_amount)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(user_name, user_email, user_phone, user_address, payment_method, total_amount);

        const orderId = result.lastInsertRowid;

        const insertItem = db.prepare(`
          INSERT INTO order_items (order_id, menu_item_id, quantity, price_at_time)
          VALUES (?, ?, ?, ?)
        `);

        for (const item of items) {
          insertItem.run(orderId, item.id, item.quantity, item.price);
        }

        return orderId;
      });

      const orderId = createOrder();
      res.json({ success: true, order_id: orderId });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to place order' });
    }
  });

  app.post('/api/contact', (req, res) => {
    try {
      const { name, email, message } = req.body;
      db.prepare('INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)').run(name, email, message);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to submit message' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static file serving would go here
    // app.use(express.static('dist'));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
