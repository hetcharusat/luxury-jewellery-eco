import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import type { Session } from '@supabase/supabase-js';
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  CircleUserRound,
  ClipboardList,
  Crown,
  Gem,
  Gift,
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  Minus,
  Package,
  Plus,
  Search,
  ShoppingBag,
  Sparkles,
  Store,
  X,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Collection = {
  name: string;
  detail: string;
  className: string;
};

type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  className: string;
  badge?: string;
};

type AuthMode = 'sign-in' | 'sign-up';

const collections: Collection[] = [
  { name: 'The Heirloom Edit', detail: '01 — 06', className: 'collection-heirloom' },
  { name: 'The Everyday Gold', detail: '02 — 06', className: 'collection-everyday' },
  { name: 'The Occasion Edit', detail: '03 — 06', className: 'collection-occasion' },
  { name: 'The Modern Bride', detail: '04 — 06', className: 'collection-bride' },
  { name: 'The Gift Atelier', detail: '05 — 06', className: 'collection-gift' },
];

const products: Product[] = [
  { id: 1, name: 'The Noor Necklace', category: 'Necklaces', price: 24800, className: 'art-noor', badge: 'Bestseller' },
  { id: 2, name: 'Aster Drop Earrings', category: 'Earrings', price: 12800, className: 'art-aster' },
  { id: 3, name: 'Luna Signet Ring', category: 'Rings', price: 8900, className: 'art-luna' },
  { id: 4, name: 'Saanjh Bangle', category: 'Bangles', price: 16400, className: 'art-saanjh', badge: 'New arrival' },
];

const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`;

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState<Product[]>([products[0]]);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [activeCategory, setActiveCategory] = useState('All pieces');
  const [quickView, setQuickView] = useState<Product | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [adminOpen, setAdminOpen] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authBusy, setAuthBusy] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('sign-in');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authMessage, setAuthMessage] = useState('');
  const collectionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      return;
    }
    let mounted = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (mounted) {
        setSession(data.session);
        setAuthLoading(false);
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAuthLoading(false);
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(scrollable > 0 ? window.scrollY / scrollable : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const revealItems = document.querySelectorAll<HTMLElement>('[data-reveal]');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    revealItems.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, [activeCategory]);

  const filteredProducts = useMemo(
    () => activeCategory === 'All pieces' ? products : products.filter((product) => product.category === activeCategory),
    [activeCategory],
  );

  const addToCart = (product: Product) => {
    setCart((current) => [...current, product]);
    setCartOpen(true);
    setQuickView(null);
  };

  const removeFromCart = (id: number) => {
    setCart((current) => {
      const index = current.findIndex((item) => item.id === id);
      return index === -1 ? current : [...current.slice(0, index), ...current.slice(index + 1)];
    });
  };

  const toggleWishlist = (id: number) => {
    setWishlist((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  const scrollCollections = (direction: number) => {
    collectionsRef.current?.scrollBy({ left: direction * 420, behavior: 'smooth' });
  };

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  const handleAuthSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase) {
      setAuthError('Admin access is not connected in this environment yet.');
      return;
    }
    setAuthBusy(true);
    setAuthError('');
    setAuthMessage('');
    const result = authMode === 'sign-in'
      ? await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword })
      : await supabase.auth.signUp({ email: authEmail, password: authPassword });
    if (result.error) {
      setAuthError(result.error.message);
    } else if (authMode === 'sign-up' && !result.data.session) {
      setAuthMode('sign-in');
      setAuthMessage('Your account is ready. Sign in with the same details.');
    } else {
      setAuthMessage('');
    }
    setAuthBusy(false);
  };

  const handleSignOut = async () => {
    if (!supabase) {
      setAdminOpen(false);
      return;
    }
    const { error } = await supabase.auth.signOut();
    if (error) {
      setAuthError(error.message);
      return;
    }
    setAdminOpen(false);
  };

  return (
    <div className="site-shell">
      <div className="scroll-line" style={{ transform: `scaleX(${scrollProgress})` }} />
      <header className="site-header">
        <div className="header-main">
          <button className="mobile-menu-button" aria-label="Open menu" onClick={() => setMenuOpen(true)}><Menu size={20} /></button>
          <a className="brand-mark" href="#top" aria-label="Praashi by Supal home">
            <span className="brand-symbol">P</span>
            <span><strong>Praashi</strong><small>by Supal</small></span>
          </a>
          <button className="search-pill" onClick={() => setSearchOpen(true)} aria-label="Search jewellery"><Search size={17} strokeWidth={1.7} /><span>Search for diamond jewellery</span><span className="search-tools"><Gem size={15} /><Sparkles size={15} /></span></button>
          <div className="header-actions">
            <button className="header-gem" aria-label="Diamond collection"><Gem size={19} strokeWidth={1.5} /></button>
            <button className="account-action" aria-label="Open admin panel" onClick={() => setAdminOpen(true)}><CircleUserRound size={19} strokeWidth={1.5} /></button>
            <button aria-label="Wishlist"><Heart size={19} strokeWidth={1.5} /></button>
            <button className="bag-action" aria-label={`${cart.length} items in bag`} onClick={() => setCartOpen(true)}>
              <ShoppingBag size={19} strokeWidth={1.5} />
              <span>{cart.length}</span>
            </button>
          </div>
        </div>
        <nav className={menuOpen ? 'main-nav is-open' : 'main-nav'} aria-label="Jewellery categories">
          <button className="nav-close" aria-label="Close menu" onClick={() => setMenuOpen(false)}><X size={20} /></button>
          <a href="#new-arrivals" onClick={() => setMenuOpen(false)}><Sparkles size={16} />All Jewellery</a>
          <a href="#new-arrivals" onClick={() => setMenuOpen(false)}><Crown size={16} />Gold</a>
          <a href="#new-arrivals" onClick={() => setMenuOpen(false)}><Gem size={16} />Diamond</a>
          <a href="#new-arrivals" onClick={() => setMenuOpen(false)}><Sparkles size={16} />Earrings</a>
          <a href="#new-arrivals" onClick={() => setMenuOpen(false)}><CircleUserRound size={16} />Daily Wear</a>
          <a href="#new-arrivals" onClick={() => setMenuOpen(false)}><Gem size={16} />Gemstone</a>
          <a href="#collections" onClick={() => setMenuOpen(false)}><Crown size={16} />Wedding</a>
          <a href="#collections" onClick={() => setMenuOpen(false)}><Gift size={16} />Gifting</a>
          <a href="#new-arrivals" onClick={() => setMenuOpen(false)}><CircleDollarSign size={16} />Under 50K</a>
          <a href="#story" onClick={() => setMenuOpen(false)}><Store size={16} />More</a>
        </nav>
      </header>

      <main id="top">
        <section className="hero-section">
          <div className="hero-side-card hero-side-card-left"><div className="side-jewel side-jewel-left" /></div>
          <div className="hero-banner">
            <div className="hero-copy" data-reveal>
              <p className="eyebrow">Praashi presents</p>
              <h1>Adhyantara</h1>
              <p className="hero-subtitle">A cosmic wonder</p>
              <p className="hero-description">Jewellery that moves with you, inspired by the infinite beauty of the universe.</p>
              <a className="button button-light" href="#new-arrivals">Explore now <ArrowRight size={16} /></a>
            </div>
            <div className="hero-art" aria-label="Editorial still life of a gold necklace">
              <div className="hero-glow" />
              <div className="hero-planet planet-large" />
              <div className="hero-planet planet-small" />
              <div className="hero-stars"><i /><i /><i /><i /><i /><i /></div>
              <div className="hero-orbit orbit-one" />
              <div className="hero-orbit orbit-two" />
              <div className="hero-pedestal" />
              <div className="hero-necklace">
                <span className="chain chain-left" /><span className="chain chain-right" />
                <span className="jewel jewel-top" /><span className="jewel jewel-main" /><span className="jewel jewel-drop" />
              </div>
              <p className="art-caption">A celestial edit · 22k gold</p>
            </div>
            <span className="campaign-mark">PRAASHI <small>BY SUPAL</small></span>
          </div>
          <div className="hero-side-card hero-side-card-right"><div className="side-jewel side-jewel-right" /></div>
          <div className="hero-footer">
            <span>Scroll to discover</span><ArrowDown size={16} />
            <span className="hero-index">01 <i /> 04</span>
          </div>
        </section>

        <section className="marquee" aria-label="Brand promise">
          <div className="marquee-track"><span>Crafted for the extraordinary</span><b>✦</b><span>Gold that tells your story</span><b>✦</b><span>Crafted for the extraordinary</span><b>✦</b><span>Gold that tells your story</span></div>
        </section>

        <section className="intro-section section-pad" id="story">
          <div className="intro-label" data-reveal><span>01</span><i /></div>
          <div className="intro-content" data-reveal>
            <p className="eyebrow">A new Indian classic</p>
            <h2>For the rituals<br />that make <em>you.</em></h2>
            <div className="intro-bottom"><p>We make modern heirlooms for the in-between moments — the first light of a new day, a table set for two, a celebration still to come.</p><a className="text-link" href="#journal">Discover our story <ArrowUpRight size={16} /></a></div>
          </div>
          <div className="intro-art" data-reveal><div className="portrait-silhouette" /><span>Praashi / 01</span></div>
        </section>

        <section className="collections-section section-pad" id="collections">
          <div className="section-heading" data-reveal><div><p className="eyebrow">Curated for you</p><h2>Enter a <em>world</em><br />of gold.</h2></div><div className="slider-controls"><button aria-label="Previous collections" onClick={() => scrollCollections(-1)}><ChevronLeft size={18} /></button><button aria-label="Next collections" onClick={() => scrollCollections(1)}><ChevronRight size={18} /></button></div></div>
          <div className="collection-rail" ref={collectionsRef}>
            {collections.map((collection, index) => <a className={`collection-card ${collection.className}`} href="#new-arrivals" key={collection.name} data-reveal style={{ transitionDelay: `${index * 70}ms` }}><div className="collection-art"><span className="collection-jewel" /></div><div className="collection-meta"><span>{collection.detail}</span><h3>{collection.name}</h3><ArrowUpRight size={18} /></div></a>)}
          </div>
        </section>

        <section className="arrival-section section-pad" id="new-arrivals">
          <div className="section-heading" data-reveal><div><p className="eyebrow">The latest from our atelier</p><h2>New <em>arrivals</em></h2></div><a className="text-link desktop-link" href="#new-arrivals">View all pieces <ArrowRight size={16} /></a></div>
          <div className="category-tabs" role="tablist" aria-label="Product categories">{['All pieces', 'Necklaces', 'Earrings', 'Rings', 'Bangles'].map((category) => <button className={activeCategory === category ? 'active' : ''} key={category} onClick={() => setActiveCategory(category)} role="tab" aria-selected={activeCategory === category}>{category}</button>)}</div>
          <div className="product-grid">
            {filteredProducts.map((product, index) => <article className="product-card" key={product.id} data-reveal style={{ transitionDelay: `${index * 80}ms` }}><button className="product-image" onClick={() => setQuickView(product)} aria-label={`View ${product.name}`}><div className={`product-art ${product.className}`}><span className="product-shine" /></div>{product.badge && <span className="product-badge">{product.badge}</span>}<span className="quick-view">Quick view <ArrowUpRight size={14} /></span></button><div className="product-info"><div><p>{product.category}</p><h3>{product.name}</h3></div><button className={wishlist.includes(product.id) ? 'heart-button is-liked' : 'heart-button'} onClick={() => toggleWishlist(product.id)} aria-label={`${wishlist.includes(product.id) ? 'Remove' : 'Add'} ${product.name} ${wishlist.includes(product.id) ? 'from' : 'to'} wishlist`}><Heart size={18} fill={wishlist.includes(product.id) ? 'currentColor' : 'none'} /></button></div><div className="product-price"><span>{formatPrice(product.price)}</span><button onClick={() => addToCart(product)}>Add to bag <Plus size={14} /></button></div></article>)}
          </div>
          <a className="mobile-all-link text-link" href="#new-arrivals">View all pieces <ArrowRight size={16} /></a>
        </section>

        <section className="statement-section">
          <div className="statement-art"><div className="statement-ring ring-back" /><div className="statement-ring ring-front" /><div className="statement-shadow" /></div>
          <div className="statement-copy" data-reveal><p className="eyebrow">The Praashi point of view</p><h2>“The most beautiful thing you can wear is <em>your own light.</em>”</h2><a className="button button-dark" href="#story">Our philosophy <ArrowUpRight size={16} /></a></div>
        </section>

        <section className="journal-section section-pad" id="journal">
          <div className="section-heading" data-reveal><div><p className="eyebrow">From the journal</p><h2>Notes on <em>beauty.</em></h2></div><a className="text-link desktop-link" href="#journal">Read all stories <ArrowRight size={16} /></a></div>
          <div className="journal-grid"><article className="journal-feature" data-reveal><div className="journal-visual journal-dawn"><span>01</span></div><div className="journal-text"><p>Culture & craft</p><h3>The quiet power of a piece made by hand.</h3><a className="text-link" href="#journal">Read story <ArrowUpRight size={16} /></a></div></article><article className="journal-small" data-reveal><div className="journal-visual journal-studio"><span>02</span></div><div className="journal-text"><p>Inside Praashi</p><h3>In the studio: the art of the everyday.</h3><a className="text-link" href="#journal">Read story <ArrowUpRight size={16} /></a></div></article><article className="journal-small" data-reveal><div className="journal-visual journal-light"><span>03</span></div><div className="journal-text"><p>Style notes</p><h3>How to build your signature stack.</h3><a className="text-link" href="#journal">Read story <ArrowUpRight size={16} /></a></div></article></div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-top"><div><a className="brand-mark footer-brand" href="#top"><span className="brand-symbol">P</span><span><strong>Praashi</strong><small>by Supal</small></span></a><p className="footer-note">Jewellery for every chapter<br />of your becoming.</p></div><div className="newsletter"><p className="eyebrow">A little something special</p><h3>Join our inner circle.</h3><p>Sign up for first access to new collections, stories and private previews.</p>{subscribed ? <div className="subscribed-message"><Sparkles size={16} /> Welcome to the circle.</div> : <form onSubmit={(event) => { event.preventDefault(); if (email) setSubscribed(true); }}><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Your email address" aria-label="Your email address" required /><button aria-label="Subscribe"><ArrowRight size={18} /></button></form>}</div><div className="footer-links"><div><p>Explore</p><a href="#collections">Collections</a><a href="#new-arrivals">New arrivals</a><a href="#story">Our story</a></div><div><p>Connect</p><a href="#journal">Instagram</a><a href="#journal">Pinterest</a><a href="#journal">Contact us</a></div></div></div>
        <div className="footer-bottom"><span>© 2026 Praashi by Supal</span><span>Made slowly, worn forever</span><span>Privacy · Terms</span></div>
      </footer>

      {adminOpen && <div className="admin-overlay" role="dialog" aria-modal="true"><div className="admin-portal"><aside className="admin-sidebar"><a className="brand-mark admin-brand" href="#top"><span className="brand-symbol">P</span><span><strong>Praashi</strong><small>admin atelier</small></span></a><div className="admin-nav"><button className="active"><LayoutDashboard size={17} />Overview</button><button><Package size={17} />Products</button><button><ClipboardList size={17} />Orders</button><button><CircleUserRound size={17} />Customers</button></div><button className="admin-logout" onClick={handleSignOut}><LogOut size={16} />Sign out</button></aside><section className="admin-content"><header className="admin-topbar"><div><p className="eyebrow">Praashi by Supal</p><h2>Admin overview</h2></div><button className="admin-close" onClick={() => setAdminOpen(false)} aria-label="Close admin panel"><X size={21} /></button></header>{authLoading ? <div className="admin-loading">Opening your secure workspace...</div> : session ? <div className="admin-dashboard"><div className="admin-welcome"><div><p className="eyebrow">Good to see you</p><h3>Welcome back to the atelier.</h3><p>Manage the store story, products and orders from one calm workspace.</p></div><span className="admin-user">{session.user.email}</span></div><div className="admin-stats"><div><span>Products</span><strong>128</strong><small>+12 this month</small></div><div><span>Orders</span><strong>46</strong><small>8 awaiting dispatch</small></div><div><span>Customers</span><strong>1,284</strong><small>+18.4% this month</small></div><div><span>Enquiries</span><strong>19</strong><small>5 need attention</small></div></div><div className="admin-lower"><div className="admin-panel-card"><div><p className="eyebrow">Recent orders</p><h3>Today at a glance</h3></div><div className="admin-order"><span>#PB-1048</span><strong>Aarohi Mehta</strong><b>₹24,800</b><em>Processing</em></div><div className="admin-order"><span>#PB-1047</span><strong>Rhea Kapoor</strong><b>₹12,800</b><em className="ready">Ready to ship</em></div><div className="admin-order"><span>#PB-1046</span><strong>Diya Shah</strong><b>₹8,900</b><em>Processing</em></div></div><div className="admin-panel-card admin-actions-card"><p className="eyebrow">Quick actions</p><h3>Keep the storefront fresh.</h3><button><Package size={17} />Add new product <ArrowUpRight size={15} /></button><button><Sparkles size={17} />Update homepage <ArrowUpRight size={15} /></button><button><ClipboardList size={17} />Review enquiries <ArrowUpRight size={15} /></button></div></div></div> : <div className="auth-card"><div className="auth-heading"><span className="auth-mark">P</span><p className="eyebrow">Protected store access</p><h3>{authMode === 'sign-in' ? 'Welcome back.' : 'Create admin access.'}</h3><p>{authMode === 'sign-in' ? 'Sign in to manage your Praashi storefront.' : 'Set up an email and password for your store workspace.'}</p></div>{!supabase && <p className="auth-feedback auth-error">Admin access is unavailable because the store connection is not configured.</p>}<form onSubmit={handleAuthSubmit}><label>Email address<input type="email" value={authEmail} onChange={(event) => setAuthEmail(event.target.value)} placeholder="you@example.com" required /></label><label>Password<input type="password" value={authPassword} onChange={(event) => setAuthPassword(event.target.value)} placeholder="At least 6 characters" minLength={6} required /></label>{authError && <p className="auth-feedback auth-error">{authError}</p>}{authMessage && <p className="auth-feedback auth-message">{authMessage}</p>}<button className="button button-dark" disabled={authBusy}>{authBusy ? 'Please wait...' : authMode === 'sign-in' ? 'Sign in to admin' : 'Create admin account'} <ArrowRight size={16} /></button></form><button className="auth-switch" onClick={() => { setAuthMode(authMode === 'sign-in' ? 'sign-up' : 'sign-in'); setAuthError(''); setAuthMessage(''); }}>{authMode === 'sign-in' ? 'Need an account? Create admin access' : 'Already have access? Sign in'}</button></div>}</section></div></div>}
      {searchOpen && <div className="overlay search-overlay" role="dialog" aria-modal="true"><button className="overlay-close" onClick={() => setSearchOpen(false)} aria-label="Close search"><X size={22} /></button><div className="search-box"><p className="eyebrow">Search the atelier</p><input autoFocus placeholder="Try “gold hoops” or “everyday necklace”" /><ArrowRight size={22} /></div></div>}
      {quickView && <div className="overlay quick-view-overlay" role="dialog" aria-modal="true"><button className="overlay-close" onClick={() => setQuickView(null)} aria-label="Close quick view"><X size={22} /></button><div className="quick-view-modal"><div className={`quick-view-art product-art ${quickView.className}`}><span className="product-shine" /></div><div className="quick-view-copy"><p className="eyebrow">{quickView.category}</p><h2>{quickView.name}</h2><p className="modal-description">A considered silhouette in warm gold tones, designed to become part of your everyday language.</p><strong>{formatPrice(quickView.price)}</strong><button className="button button-dark" onClick={() => addToCart(quickView)}>Add to bag <ShoppingBag size={16} /></button><button className="modal-link" onClick={() => toggleWishlist(quickView.id)}>{wishlist.includes(quickView.id) ? 'Saved to your wishlist' : 'Save to wishlist'} <Heart size={15} fill={wishlist.includes(quickView.id) ? 'currentColor' : 'none'} /></button></div></div></div>}
      {cartOpen && <div className="overlay cart-overlay" role="dialog" aria-modal="true"><div className="cart-drawer"><div className="drawer-heading"><div><p className="eyebrow">Your selection</p><h2>Shopping bag <span>{cart.length}</span></h2></div><button onClick={() => setCartOpen(false)} aria-label="Close shopping bag"><X size={22} /></button></div>{cart.length === 0 ? <div className="empty-cart"><ShoppingBag size={26} /><p>Your bag is waiting to be filled.</p><button className="text-link" onClick={() => setCartOpen(false)}>Continue browsing <ArrowRight size={16} /></button></div> : <><div className="cart-items">{cart.map((product, index) => <div className="cart-item" key={`${product.id}-${index}`}><div className={`cart-thumb product-art ${product.className}`} /><div><p>{product.category}</p><h3>{product.name}</h3><span>{formatPrice(product.price)}</span></div><button aria-label={`Remove ${product.name}`} onClick={() => removeFromCart(product.id)}><Minus size={14} /></button></div>)}</div><div className="cart-summary"><div><span>Subtotal</span><strong>{formatPrice(total)}</strong></div><p>Shipping and taxes calculated at checkout.</p><button className="button button-dark">Continue to checkout <ArrowRight size={16} /></button></div></>}</div></div>}
    </div>
  );
}

export default App;
