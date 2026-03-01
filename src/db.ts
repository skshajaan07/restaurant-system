import Database from 'better-sqlite3';

const db = new Database('restaurant.db');

export function initDb() {
  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS menu_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      category TEXT NOT NULL,
      image_url TEXT
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_name TEXT NOT NULL,
      user_email TEXT NOT NULL,
      user_phone TEXT NOT NULL,
      user_address TEXT NOT NULL,
      payment_method TEXT NOT NULL,
      total_amount REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      menu_item_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      price_at_time REAL NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders (id),
      FOREIGN KEY (menu_item_id) REFERENCES menu_items (id)
    );
    
    CREATE TABLE IF NOT EXISTS contact_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed menu items if empty
  const count = db.prepare('SELECT count(*) as count FROM menu_items').get() as { count: number };
  if (count.count === 0) {
    const insert = db.prepare('INSERT INTO menu_items (name, description, price, category, image_url) VALUES (?, ?, ?, ?, ?)');
    const items = [
      // Starters
      ['Paneer Tikka', 'Marinated paneer cubes grilled with spices and bell peppers.', 299, 'Starters', 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=800&q=80'],
      ['Chicken 65', 'Spicy, deep-fried chicken bites with curry leaves and red chilies.', 349, 'Starters', 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=800&q=80'],
      ['Aloo Tikki', 'Crispy potato patties served with mint chutney.', 199, 'Starters', 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&w=800&q=80'],
      ['Samosa', 'Crispy pastry filled with spiced potatoes and peas.', 149, 'Starters', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80'],
      
      // Main Courses
      ['Butter Chicken', 'Creamy tomato-based curry with tender chicken pieces.', 499, 'Main Courses', 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80'],
      ['Paneer Butter Masala', 'Paneer in a rich, buttery tomato sauce.', 399, 'Main Courses', 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80'],
      ['Rogan Josh', 'Aromatic Kashmiri lamb curry with yogurt and spices.', 549, 'Main Courses', 'https://images.unsplash.com/photo-1585937421612-70a008356f36?auto=format&fit=crop&w=800&q=80'],
      ['Palak Paneer', 'Paneer cubes in a creamy spinach gravy.', 349, 'Main Courses', 'https://images.unsplash.com/photo-1589647363585-f4a7d3877b10?auto=format&fit=crop&w=800&q=80'],
      ['Chole Bhature', 'Spiced chickpeas served with fluffy fried bread.', 299, 'Main Courses', 'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=800&q=80'],
      ['Mutton Biryani', 'Fragrant basmati rice with tender mutton and spices.', 599, 'Main Courses', 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=800&q=80'],

      // Breads
      ['Butter Naan', 'Soft tandoori bread brushed with butter.', 79, 'Breads', 'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=800&q=80'], // Placeholder
      ['Garlic Naan', 'Naan topped with fresh garlic and cilantro.', 99, 'Breads', 'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=800&q=80'], // Placeholder
      ['Aloo Paratha', 'Whole wheat bread stuffed with spiced potatoes.', 129, 'Breads', 'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=800&q=80'], // Placeholder
      ['Tandoori Roti', 'Whole wheat bread baked in a tandoor.', 59, 'Breads', 'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=800&q=80'], // Placeholder

      // Rice & Biryani
      ['Chicken Biryani', 'Aromatic rice layered with spiced chicken.', 449, 'Rice & Biryani', 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80'],
      ['Veg Biryani', 'Fragrant rice with mixed vegetables and spices.', 349, 'Rice & Biryani', 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80'],
      ['Jeera Rice', 'Basmati rice tempered with cumin seeds.', 199, 'Rice & Biryani', 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80'],
      ['Prawn Biryani', 'Spiced prawns layered with fragrant basmati rice.', 599, 'Rice & Biryani', 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80'],

      // Desserts
      ['Gulab Jamun', 'Soft milk dumplings soaked in rose-flavored syrup.', 149, 'Desserts', 'https://images.unsplash.com/photo-1589119908995-c6837fa14848?auto=format&fit=crop&w=800&q=80'],
      ['Rasmalai', 'Spongy paneer balls in sweetened milk with saffron.', 179, 'Desserts', 'https://images.unsplash.com/photo-1589119908995-c6837fa14848?auto=format&fit=crop&w=800&q=80'],
      ['Kheer', 'Creamy rice pudding with cardamom and nuts.', 129, 'Desserts', 'https://images.unsplash.com/photo-1589119908995-c6837fa14848?auto=format&fit=crop&w=800&q=80'],

      // Drinks
      ['Mango Lassi', 'Creamy yogurt drink blended with fresh mangoes.', 149, 'Drinks', 'https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?auto=format&fit=crop&w=800&q=80'],
      ['Masala Chai', 'Spiced tea with cardamom, ginger, and cloves.', 99, 'Drinks', 'https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?auto=format&fit=crop&w=800&q=80'],
      ['Nimbu Pani', 'Refreshing lemon drink with a hint of mint.', 79, 'Drinks', 'https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?auto=format&fit=crop&w=800&q=80'],
      ['Thandai', 'Traditional spiced milk drink with almonds and saffron.', 159, 'Drinks', 'https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?auto=format&fit=crop&w=800&q=80'],
    ];

    const insertMany = db.transaction((items) => {
      for (const item of items) insert.run(item);
    });

    insertMany(items);
    console.log('Database seeded with menu items.');
  }
}

export default db;
