import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Menu, X, Facebook, Twitter, Instagram, Linkedin, CreditCard, Smartphone, DollarSign } from 'lucide-react';

// Types
interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
}

interface CartItem extends MenuItem {
  quantity: number;
}

export default function App() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [isScrolled, setIsScrolled] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [orderPlaced, setOrderPlaced] = useState(false);

  // Fetch menu on load
  useEffect(() => {
    fetch('/api/menu')
      .then(res => res.json())
      .then(data => setMenuItems(data))
      .catch(err => console.error('Failed to fetch menu:', err));
    
    // Load cart from local storage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }

    // Scroll listener
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Save cart to local storage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    alert(`${item.name} added to cart!`);
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, quantity: Math.max(0, item.quantity + delta) };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const orderData = {
      user_name: formData.get('name'),
      user_email: formData.get('email'),
      user_phone: formData.get('phone'),
      user_address: formData.get('address'),
      payment_method: paymentMethod,
      items: cart,
      total_amount: cartTotal
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      
      if (res.ok) {
        setOrderPlaced(true);
        setCart([]);
        localStorage.removeItem('cart');
        setTimeout(() => {
          setOrderPlaced(false);
          setShowCheckout(false);
          setActiveSection('home');
        }, 3000);
      } else {
        alert('Failed to place order. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert('Error placing order');
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name'),
          email: formData.get('email'),
          message: formData.get('message')
        })
      });
      alert('Message sent successfully!');
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      alert('Failed to send message');
    }
  };

  const categories = Array.from(new Set(menuItems.map(item => item.category)));

  const renderSection = () => {
    if (activeSection === 'cart') {
      return (
        <section id="cart" className="menu">
          <div className="container">
            <h2>Your Cart</h2>
            {cart.length === 0 ? (
              <p className="text-center text-xl">Your cart is empty.</p>
            ) : (
              <>
                <div id="cart-items" className="menu-items">
                  {cart.map((item, index) => (
                    <div key={item.id} className="menu-item" style={{ '--order': index + 1 } as any}>
                      <h4>{item.name} <span>₹{item.price}</span></h4>
                      <p>Quantity: 
                        <button className="quantity-btn" onClick={() => updateQuantity(item.id, -1)}>-</button>
                        {item.quantity}
                        <button className="quantity-btn" onClick={() => updateQuantity(item.id, 1)}>+</button>
                      </p>
                      <p>Subtotal: ₹{(item.price * item.quantity).toFixed(2)}</p>
                      <button className="btn remove-item" onClick={() => removeFromCart(item.id)}>Remove</button>
                    </div>
                  ))}
                </div>
                <div id="cart-total" style={{ textAlign: 'right', marginTop: '2rem' }}>
                  <h3>Total: <span id="total-amount">₹{cartTotal.toFixed(2)}</span></h3>
                </div>
                <div style={{ textAlign: 'right', marginTop: '1rem' }}>
                  <button 
                    className="btn" 
                    id="proceed-to-checkout" 
                    disabled={cart.length === 0}
                    onClick={() => setShowCheckout(true)}
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </>
            )}

            {showCheckout && (
              <div id="checkout" className="contact" style={{ marginTop: '3rem', display: 'block' }}>
                <div className="container">
                  <h2>Checkout</h2>
                  {orderPlaced ? (
                    <div className="text-center p-8 bg-green-100 rounded-lg">
                      <h3 className="text-green-800 text-2xl mb-4">Order Placed Successfully!</h3>
                      <p>Thank you for dining with us.</p>
                    </div>
                  ) : (
                    <form className="contact-form" onSubmit={handleCheckout}>
                      <h3>Billing Information</h3>
                      <input type="text" name="name" placeholder="Full Name" required />
                      <input type="email" name="email" placeholder="Email Address" required />
                      <input type="tel" name="phone" placeholder="Phone Number" required />
                      <textarea name="address" placeholder="Delivery Address" required></textarea>
                      
                      <h3>Payment Method</h3>
                      <div className="payment-methods">
                        <label style={{ display: 'block', marginBottom: '1rem' }}>
                          <input 
                            type="radio" 
                            name="payment" 
                            value="card" 
                            checked={paymentMethod === 'card'} 
                            onChange={() => setPaymentMethod('card')}
                          /> Credit/Debit Card
                        </label>
                        {paymentMethod === 'card' && (
                          <div id="card-details">
                            <input type="text" placeholder="Card Number" required />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                              <input type="text" placeholder="MM/YY" required />
                              <input type="text" placeholder="CVV" required />
                            </div>
                          </div>
                        )}

                        <label style={{ display: 'block', marginBottom: '1rem' }}>
                          <input 
                            type="radio" 
                            name="payment" 
                            value="upi" 
                            checked={paymentMethod === 'upi'} 
                            onChange={() => setPaymentMethod('upi')}
                          /> UPI
                        </label>
                        {paymentMethod === 'upi' && (
                          <div id="upi-details">
                            <input type="text" placeholder="UPI ID" required />
                          </div>
                        )}

                        <label style={{ display: 'block', marginBottom: '1rem' }}>
                          <input 
                            type="radio" 
                            name="payment" 
                            value="cod" 
                            checked={paymentMethod === 'cod'} 
                            onChange={() => setPaymentMethod('cod')}
                          /> Cash on Delivery
                        </label>
                      </div>
                      <button className="btn" type="submit">Place Order</button>
                    </form>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      );
    }

    return (
      <>
        <section id="home" className="hero">
          <div className="container">
            <h2>Welcome to Indian Delights</h2>
            <p>Embark on an authentic Indian culinary journey with over 20+ traditional dishes crafted with love.</p>
            <button onClick={() => {
              setActiveSection('menu');
              document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' });
            }} className="btn">Explore Our Menu</button>
          </div>
        </section>

        <section id="menu" className="menu">
          <div className="container">
            <h2>Our Indian Menu</h2>
            {categories.map(category => (
              <div key={category} className="menu-category">
                <h3>{category}</h3>
                <div className="menu-items">
                  {menuItems.filter(item => item.category === category).map((item, index) => (
                    <div key={item.id} className="menu-item" style={{ '--order': index + 1 } as any}>
                      <img src={item.image_url} alt={item.name} referrerPolicy="no-referrer" />
                      <h4>{item.name} <span>₹{item.price}</span></h4>
                      <p>{item.description}</p>
                      <button className="btn add-to-cart" onClick={() => addToCart(item)}>Add to Cart</button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="about" className="about">
          <div className="container">
            <h2>About Us</h2>
            <p>Indian Delights is a family-owned restaurant celebrating the rich flavors of India. Our menu showcases authentic dishes crafted with fresh ingredients and traditional spices.</p>
          </div>
        </section>

        <section id="contact" className="contact">
          <div className="container">
            <h2>Contact Us</h2>
            <address>
              <p>Email: <a href="mailto:info@Indiandelights.com">info@Indiandelights.com</a></p>
              <p>Phone: <a href="tel:+919890045237">(+91) 9890045237</a></p>
              <p>Address: Hatte Nagar Latur</p>
            </address>
            <form className="contact-form" onSubmit={handleContactSubmit}>
              <input type="text" name="name" placeholder="Your Name" required />
              <input type="email" name="email" placeholder="Your Email" required />
              <textarea name="message" placeholder="Your Message" required></textarea>
              <button className="btn" type="submit">Send Message</button>
            </form>
          </div>
        </section>
      </>
    );
  };

  return (
    <div>
      <header className={isScrolled ? 'scrolled' : ''}>
        <div className="container">
          <h1>🍛 Indian Delights</h1>
          <button className="mobile-menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
          <nav className={isMenuOpen ? 'active' : ''}>
            <ul>
              <li><button onClick={() => { setActiveSection('home'); setIsMenuOpen(false); }} className="nav-link bg-transparent border-none cursor-pointer text-lg">Home</button></li>
              <li><button onClick={() => { setActiveSection('home'); setTimeout(() => document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' }), 100); setIsMenuOpen(false); }} className="nav-link bg-transparent border-none cursor-pointer text-lg">Menu</button></li>
              <li><button onClick={() => { setActiveSection('home'); setTimeout(() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }), 100); setIsMenuOpen(false); }} className="nav-link bg-transparent border-none cursor-pointer text-lg">About</button></li>
              <li><button onClick={() => { setActiveSection('home'); setTimeout(() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }), 100); setIsMenuOpen(false); }} className="nav-link bg-transparent border-none cursor-pointer text-lg">Contact</button></li>
              <li>
                <button onClick={() => { setActiveSection('cart'); setIsMenuOpen(false); }} className="nav-link bg-transparent border-none cursor-pointer text-lg flex items-center gap-2">
                  Cart {cart.length > 0 && <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">{cart.reduce((a, b) => a + b.quantity, 0)}</span>}
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      {renderSection()}

      <footer>
        <div className="container">
          <p>© 2025 Indian Delights. All rights reserved.</p>
          <div className="social-links">
            <a href="#"><Facebook size={20} /></a>
            <a href="#"><Twitter size={20} /></a>
            <a href="#"><Instagram size={20} /></a>
            <a href="#"><Linkedin size={20} /></a>
          </div>
        </div>
      </footer>
    </div>
  );
}
