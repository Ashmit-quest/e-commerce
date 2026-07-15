import { LayoutDashboard, ShoppingBag, Package, Users, BarChart3, Megaphone, Search, Bell, X, CheckCircle2, Sliders, Settings, LogOut, User, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { motion, AnimatePresence } from "framer-motion";
import { API_URL } from '@/config';

// --- Animated Number Component ---

interface AnimatedNumberProps {
  value: string | number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}

const AnimatedNumber = ({ value, prefix = "", suffix = "", duration = 1000 }: AnimatedNumberProps) => {
  const [displayValue, setDisplayValue] = useState<string>("0");

  useEffect(() => {
    const strVal = String(value);
    const numericMatch = strVal.replace(/[^0-9.-]/g, "");
    const target = parseFloat(numericMatch);

    if (isNaN(target)) {
      setDisplayValue(strVal);
      return;
    }

    const dotIndex = strVal.indexOf(".");
    const decimals = dotIndex !== -1 ? strVal.length - dotIndex - 1 : 0;

    let start = 0;
    let startTime: number | null = null;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      
      const current = start + (target - start) * easeProgress;
      const formatted = current.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });

      setDisplayValue(formatted);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return <>{prefix}{displayValue}{suffix}</>;
};

// --- Types ---

interface Product {
  id: string;
  name: string;
  emoji: string;
  bg_color: string;
  price: number;
  stock: number;
  status: string;
}

interface Order {
  id: string;
  product: string;
  emoji: string;
  bg_color: string;
  customer: string;
  city: string;
  status: string;
  status_text: string;
  amount: number;
}

interface Customer {
  id: string;
  name: string;
  location: string;
  orders_count: number;
  spent: number;
  status: string;
}

interface Campaign {
  id: string;
  name: string;
  details: string;
  status: string;
  channel: string;
  audience: string;
}

interface Notification {
  id: string;
  title: string;
  details: string;
  read: boolean;
}

// --- Components ---

const AmbientBackground = () => (
  <>
    <div className="ambient-bg">
      <div className="orb a"></div>
      <div className="orb b"></div>
      <div className="orb c"></div>
    </div>
    <div className="grain-overlay"></div>
  </>
);

const Sidebar = ({ currentView, setView }: { currentView: string; setView: (v: string) => void }) => {
  return (
    <aside className="sticky top-0 h-screen w-[248px] flex-none border-r border-[#ffe8cd1a] flex flex-col py-6 px-4 z-10 hidden md:flex">
      <div className="flex items-center gap-3 px-2.5 pb-5">
        <div className="flame-container flame-shadow">
          <div className="flame-body"></div>
        </div>
        <div className="font-serif font-semibold text-[22px] tracking-[0.06em]">
          LUM<b className="text-[#FFC061] font-semibold">É</b>N
        </div>
      </div>

      <div className="text-[11px] tracking-[0.14em] uppercase text-[#7C6F60] px-3 pt-3.5 pb-1.5">Overview</div>
      
      <nav className="flex flex-col gap-2">
        <NavItem icon={<LayoutDashboard size={19} />} label="Dashboard" active={currentView === 'dashboard'} onClick={() => setView('dashboard')} />
        <NavItem icon={<ShoppingBag size={19} />} label="Orders" active={currentView === 'orders'} onClick={() => setView('orders')} />
        <NavItem icon={<Package size={19} />} label="Products" active={currentView === 'products'} onClick={() => setView('products')} />
        <NavItem icon={<Users size={19} />} label="Customers" active={currentView === 'customers'} onClick={() => setView('customers')} />
      </nav>

      <div className="text-[11px] tracking-[0.14em] uppercase text-[#7C6F60] px-3 pt-5 pb-1.5">Growth</div>
      
      <nav className="flex flex-col gap-2">
        <NavItem icon={<BarChart3 size={19} />} label="Analytics" active={currentView === 'analytics'} onClick={() => setView('analytics')} />
        <NavItem icon={<Megaphone size={19} />} label="Campaigns" active={currentView === 'campaigns'} onClick={() => setView('campaigns')} />
      </nav>

      <div className="mt-auto p-3.5 rounded-[12px] bg-[#fff7ee0b] border border-[#ffe8cd1a] text-[13px]">
        <b className="block font-serif text-[15px] mb-1 font-medium">Studio plan</b>
        <span className="text-muted-foreground block mb-2.5">72% of monthly send limit used</span>
        <button className="w-full py-2.5 rounded-[9px] font-sans font-semibold text-[#2a1c10] bg-gradient-primary hover:brightness-110 transition-all">
          Upgrade
        </button>
      </div>
    </aside>
  );
};

const NavItem = ({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick: () => void }) => (
  <div onClick={onClick} className={`flex items-center gap-3 px-3.5 py-2.5 rounded-[12px] cursor-pointer font-medium text-[14.5px] transition-all duration-250 border border-transparent
    ${active 
      ? 'text-foreground bg-gradient-nav border-[#ffe8cd2e] [&>svg]:text-[#FFC061]' 
      : 'text-muted-foreground hover:text-foreground hover:bg-[#fff7ee0b] hover:translate-x-[3px]'}`
  }>
    <div className="flex-none">{icon}</div>
    {label}
  </div>
);

const KPI = ({ title, value, prefix = "", suffix = "", delta, deltaUp, sparkPts, delay, onClick }: any) => (
  <div onClick={onClick} className="glass-panel glass-panel-hover rounded-[18px] p-4 pt-5 relative overflow-hidden animate-rise cursor-pointer" style={{ animationDelay: delay }}>
    <div className="absolute inset-0 rounded-[18px] pointer-events-none" style={{ background: 'radial-gradient(120% 90% at 100% 0%, rgba(246,166,35,.06), transparent 45%)' }}></div>
    
    <div className="flex items-center gap-2 text-[12.5px] text-muted-foreground relative z-10">
      <div className="w-[26px] h-[26px] rounded-lg flex items-center justify-center bg-[#f6a62323] text-[#FFC061]">
        {title === 'Revenue' && <BarChart3 size={15} />}
        {title === 'Orders' && <ShoppingBag size={15} />}
        {title === 'Avg order' && <Package size={15} />}
        {title === 'Conversion' && <Users size={15} />}
      </div>
      {title}
    </div>
    
    <div className="font-serif font-medium text-[31px] tracking-[-0.5px] my-3 relative z-10">
      <AnimatedNumber value={value} prefix={prefix} suffix={suffix} />
    </div>
    
    <div className="flex items-center justify-between relative z-10">
      <span className={`text-[12.5px] font-semibold flex items-center gap-1 px-2 py-0.5 rounded-full ${deltaUp ? 'text-[#6FE0A6] bg-[#6fe0a61f]' : 'text-[#FF8A8A] bg-[#ff8a8a1f]'}`}>
        {deltaUp ? '▲' : '▼'} {delta}
      </span>
      <svg className="w-[76px] h-[30px]" viewBox="0 0 76 30" preserveAspectRatio="none">
        <polyline fill="none" stroke={deltaUp ? "#6FE0A6" : "#FF8A8A"} strokeWidth="2" points={sparkPts} />
      </svg>
    </div>
  </div>
);

export default function Index() {
  const [currentView, setView] = useState("dashboard");
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [toasts, setToasts] = useState<any[]>([]);
  const [globalSearch, setGlobalSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRange, setSelectedRange] = useState("30d");

  // Modals / Dropdowns
  const [campaignModalOpen, setCampaignModalOpen] = useState(false);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [rangeMenuOpen, setRangeMenuOpen] = useState(false);
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);

  // New item States
  const [newCampaignName, setNewCampaignName] = useState("Autumn Ember — early access");
  const [newCampaignAudience, setNewCampaignAudience] = useState("All subscribers · 8,420");
  const [newCampaignChannel, setNewCampaignChannel] = useState("Email");
  const [newCampaignSuccess, setNewCampaignSuccess] = useState(false);

  const [newCustName, setNewCustName] = useState("");
  const [newCustLocation, setNewCustLocation] = useState("");
  const [newCustStatus, setNewCustStatus] = useState("Active");

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Fetch Data
  const fetchData = async () => {
    try {
      const [resP, resO, resC, resCamp, resN] = await Promise.all([
        fetch(`${API_URL}/api/products`),
        fetch(`${API_URL}/api/orders`),
        fetch(`${API_URL}/api/customers`),
        fetch(`${API_URL}/api/campaigns`),
        fetch(`${API_URL}/api/notifications`)
      ]);
      setProducts(await resP.json());
      setOrders(await resO.json());
      setCustomers(await resC.json());
      setCampaigns(await resCamp.json());
      setNotifications(await resN.json());
    } catch (err) {
      console.error("Error loading LUMÉN store data:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Sync simulated order notifications
  useEffect(() => {
    const names = ['Jonas P.', 'Priya R.', 'Marco S.', 'Aiko T.', 'Dana W.', 'Leo M.'];
    const items = ['Amber & Oud', 'Ember Trio', 'Cedar Spray', 'Fig & Vetiver', 'Eucalyptus Diffuser'];
    
    const triggerSimulatedOrder = async () => {
      const name = names[Math.floor(Math.random() * names.length)];
      const item = items[Math.floor(Math.random() * items.length)];
      const amt = parseFloat((18 + Math.random() * 80).toFixed(2));
      
      const newOrder = {
        product: item,
        emoji: "🕯️",
        bg_color: "#3a2a12",
        customer: name,
        city: "San Francisco",
        status: "paid",
        status_text: "Paid",
        amount: amt
      };

      try {
        const res = await fetch(`${API_URL}/api/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newOrder)
        });
        if (res.ok) {
          fetchData();
          setToasts(prev => [...prev, {
            id: Date.now(),
            name,
            item,
            amt: amt.toFixed(2)
          }]);
        }
      } catch (e) {
        console.error("Simulated order failed", e);
      }
    };

    const t1 = setTimeout(triggerSimulatedOrder, 6000);
    const int = setInterval(triggerSimulatedOrder, 15000);
    return () => { clearTimeout(t1); clearInterval(int); };
  }, []);

  // Handlers
  const handleCreateCampaign = async () => {
    try {
      const res = await fetch(`${API_URL}/api/campaigns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCampaignName,
          details: `${newCampaignChannel} · pending send`,
          status: "sched",
          channel: newCampaignChannel,
          audience: newCampaignAudience
        })
      });
      if (res.ok) {
        setNewCampaignSuccess(true);
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateCustomer = async () => {
    try {
      const res = await fetch(`${API_URL}/api/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCustName,
          location: newCustLocation,
          orders_count: 0,
          spent: 0.0,
          status: newCustStatus
        })
      });
      if (res.ok) {
        setCustomerModalOpen(false);
        setNewCustName("");
        setNewCustLocation("");
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;
    try {
      const res = await fetch(`${API_URL}/api/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingProduct.name,
          emoji: editingProduct.emoji,
          bg_color: editingProduct.bg_color,
          price: editingProduct.price,
          stock: editingProduct.stock,
          status: editingProduct.stock < 30 ? "Low" : "In stock"
        })
      });
      if (res.ok) {
        setProductModalOpen(false);
        setEditingProduct(null);
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkNotificationsRead = async () => {
    try {
      await fetch(`${API_URL}/api/notifications/read`, { method: 'PUT' });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    const matchesSearch = o.product.toLowerCase().includes(globalSearch.toLowerCase()) ||
                          o.customer.toLowerCase().includes(globalSearch.toLowerCase()) ||
                          o.city.toLowerCase().includes(globalSearch.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Calculate trends
  const revenueDataMap: Record<string, any[]> = {
    "today": [{ name: "1", value: 120 }, { name: "2", value: 450 }, { name: "3", value: 980 }, { name: "4", value: 1284 }],
    "7d": [{ name: "Mon", value: 1200 }, { name: "Tue", value: 2400 }, { name: "Wed", value: 1800 }, { name: "Thu", value: 3100 }, { name: "Fri", value: 2900 }, { name: "Sat", value: 4200 }, { name: "Sun", value: 3800 }],
    "30d": [
      { name: '1', value: 620 }, { name: '2', value: 700 }, { name: '3', value: 540 },
      { name: '4', value: 880 }, { name: '5', value: 760 }, { name: '6', value: 900 },
      { name: '7', value: 1040 }, { name: '8', value: 720 }, { name: '9', value: 980 },
      { name: '10', value: 1120 }, { name: '11', value: 860 }, { name: '12', value: 1240 },
      { name: '13', value: 1080 }, { name: '14', value: 1300 }, { name: '15', value: 1160 },
      { name: '16', value: 1420 }, { name: '17', value: 1240 }, { name: '18', value: 1500 },
      { name: '19', value: 1360 }, { name: '20', value: 1180 }, { name: '21', value: 1540 },
      { name: '22', value: 1420 }, { name: '23', value: 1620 }, { name: '24', value: 1480 },
      { name: '25', value: 1720 }, { name: '26', value: 1560 }, { name: '27', value: 1840 },
      { name: '28', value: 1680 }, { name: '29', value: 1980 }, { name: '30', value: 2140 }
    ],
    "12m": [{ name: "Jan", value: 24 }, { name: "Feb", value: 27 }, { name: "Mar", value: 22 }, { name: "Apr", value: 31 }, { name: "May", value: 29 }, { name: "Jun", value: 34 }, { name: "Jul", value: 38 }, { name: "Aug", value: 33 }, { name: "Sep", value: 41 }, { name: "Oct", value: 45 }, { name: "Nov", value: 48 }, { name: "Dec", value: 52 }]
  };

  const chartData = revenueDataMap[selectedRange] || revenueDataMap["30d"];

  // Aggregate Metrics based on selected range
  const metricsMap: Record<string, { revenue: string; orders: string; aov: string; conv: string }> = {
    "today": { revenue: "4.8", orders: "128", aov: "37.6", conv: "4.90" },
    "7d": { revenue: "11.2", orders: "302", aov: "37.2", conv: "4.81" },
    "30d": { revenue: "48.2", orders: "1,284", aov: "37.6", conv: "4.72" },
    "12m": { revenue: "512.3", orders: "14,820", aov: "34.6", conv: "4.10" }
  };

  const activeMetrics = metricsMap[selectedRange] || metricsMap["30d"];

  return (
    <div className="min-h-screen text-foreground bg-background selection:bg-[#F6A623] selection:text-[#140F0D]">
      <AmbientBackground />
      
      <div className="relative z-10 flex min-h-screen">
        <Sidebar currentView={currentView} setView={setView} />
        
        <main className="flex-1 p-5 md:p-6 pb-20 min-w-0">
          {/* Top Bar */}
          <div className="flex items-center gap-4 mb-7 relative z-30">
            <div className="flex-1 min-w-0">
              <h1 className="font-serif font-medium text-[27px] leading-[1.1]">
                {currentView === 'dashboard' && "Good evening, Aria"}
                {currentView === 'orders' && "Orders catalogue"}
                {currentView === 'products' && "Your scent catalogue"}
                {currentView === 'customers' && "The people who love LUMÉN"}
                {currentView === 'analytics' && "Trends & performance"}
                {currentView === 'campaigns' && "Reach your audience"}
              </h1>
              <p className="text-muted-foreground text-[13.5px] mt-1">
                {currentView === 'dashboard' && "Here's how the store is glowing today — Tue, Jul 15"}
                {currentView === 'orders' && "Track and manage every single order"}
                {currentView === 'products' && "Manage stocks, edit descriptions and prices"}
                {currentView === 'customers' && "Overview of active VIPs and general segments"}
                {currentView === 'analytics' && "Detailed breakdown of conversions and growth"}
                {currentView === 'campaigns' && "Create and schedule beautiful templates"}
              </p>
            </div>
            
            {/* Search */}
            <div className="hidden md:flex items-center gap-2 bg-[#fff7ee0b] border border-[#ffe8cd1a] px-3.5 py-2.5 rounded-[12px] w-[220px] text-muted-foreground focus-within:border-[#F6A623] focus-within:ring-2 focus-within:ring-[#f6a62323] transition-all">
              <Search size={17} />
              <input 
                value={globalSearch}
                onChange={(e) => {
                  setGlobalSearch(e.target.value);
                  if (currentView !== 'orders') setView('orders');
                }}
                placeholder="Search orders…" 
                className="bg-transparent border-none outline-none text-foreground text-[14px] w-full placeholder:text-[#7C6F60]" 
              />
            </div>

            {/* Range Selector */}
            <div className="relative">
              <button 
                onClick={() => setRangeMenuOpen(!rangeMenuOpen)}
                className="hidden sm:flex items-center gap-2 bg-[#fff7ee0b] border border-[#ffe8cd1a] px-4 h-11 rounded-[12px] text-muted-foreground hover:text-foreground hover:border-[#ffe8cd2e] transition-all"
              >
                <Sliders size={16} />
                <span>Last {selectedRange === '30d' ? '30 days' : selectedRange === '7d' ? '7 days' : selectedRange === '12m' ? '12 months' : 'Today'}</span>
              </button>
              
              <AnimatePresence>
                {rangeMenuOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                    className="absolute top-[54px] right-0 min-w-[200px] bg-gradient-to-b from-[#241A15] to-[#1C1512] border border-[#ffe8cd2e] rounded-[14px] shadow-panel p-1.5 z-40"
                  >
                    {[
                      { key: "today", val: "Today" },
                      { key: "7d", val: "Last 7 days" },
                      { key: "30d", val: "Last 30 days" },
                      { key: "12m", val: "Last 12 months" }
                    ].map(r => (
                      <button 
                        key={r.key}
                        onClick={() => {
                          setSelectedRange(r.key);
                          setRangeMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[9px] text-[13.5px] transition-all text-left
                          ${selectedRange === r.key ? 'text-[#FFC061] bg-[#fff7ee0b]' : 'text-muted-foreground hover:text-foreground hover:bg-[#fff7ee0b]'}`}
                      >
                        {r.val}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Notification Bell */}
            <div className="relative">
              <button 
                onClick={() => {
                  setNotifMenuOpen(!notifMenuOpen);
                  handleMarkNotificationsRead();
                }} 
                className="relative w-11 h-11 rounded-[12px] border border-[#ffe8cd1a] bg-[#fff7ee0b] text-muted-foreground hover:text-foreground hover:bg-[#fff7ee13] hover:-translate-y-[2px] transition-all flex items-center justify-center"
              >
                {notifications.some(n => !n.read) && (
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#FF6B45] shadow-[0_0_0_3px_#1C1512,0_0_10px_#FF6B45]"></span>
                )}
                <Bell size={19} />
              </button>

              <AnimatePresence>
                {notifMenuOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                    className="absolute top-[54px] right-0 w-[280px] bg-gradient-to-b from-[#241A15] to-[#1C1512] border border-[#ffe8cd2e] rounded-[14px] shadow-panel p-2 z-40"
                  >
                    <div className="flex justify-between items-center text-[11px] tracking-[0.1em] uppercase text-[#7C6F60] font-semibold p-2">
                      Notifications
                      <span className="text-[#FFC061] cursor-pointer" onClick={handleMarkNotificationsRead}>Mark all read</span>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto space-y-1 mt-1">
                      {notifications.length === 0 ? (
                        <div className="text-center py-4 text-[12.5px] text-muted-foreground">No updates today.</div>
                      ) : (
                        notifications.map(n => (
                          <div key={n.id} className={`p-2.5 rounded-[9px] text-left transition-all ${n.read ? 'opacity-60' : 'bg-[#fff7ee0b]'}`}>
                            <div className="flex gap-2">
                              {!n.read && <span className="w-2 h-2 rounded-full bg-[#FFC061] shadow-[0_0_8px_#F6A623] mt-1.5 flex-none" />}
                              <div>
                                <b className="text-[13px] block text-foreground leading-snug">{n.title}</b>
                                <span className="text-muted-foreground text-[11.5px] leading-tight block mt-0.5">{n.details}</span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Create Campaign */}
            <button onClick={() => { setNewCampaignSuccess(false); setCampaignModalOpen(true); }} className="h-11 px-4.5 rounded-[12px] bg-gradient-primary shadow-glow hover:shadow-glow-hover hover:-translate-y-[2px] active:translate-y-0 text-[#2a1c10] font-semibold text-[14px] flex items-center gap-2 transition-all whitespace-nowrap">
              <Megaphone size={17} />
              <span className="hidden sm:inline">New campaign</span>
            </button>
            
            {/* Avatar Dropdown */}
            <div className="relative">
              <div 
                onClick={() => setAvatarMenuOpen(!avatarMenuOpen)}
                className="w-11 h-11 rounded-[12px] flex-none flex items-center justify-center font-bold text-[15px] text-[#2a1c10] cursor-pointer bg-gradient-to-br from-[#FFC061] to-[#FF6B45] shadow-sm"
              >
                A
              </div>

              <AnimatePresence>
                {avatarMenuOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                    className="absolute top-[54px] right-0 min-w-[200px] bg-gradient-to-b from-[#241A15] to-[#1C1512] border border-[#ffe8cd2e] rounded-[14px] shadow-panel p-1.5 z-40"
                  >
                    <div className="text-[11px] tracking-[0.1em] uppercase text-[#7C6F60] font-semibold px-3 py-2 border-b border-[#ffe8cd11] mb-1">
                      Aria Okafor
                    </div>
                    <button onClick={() => { setAvatarMenuOpen(false); setView('dashboard'); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[9px] text-[13.5px] text-muted-foreground hover:text-foreground hover:bg-[#fff7ee0b] transition-all">
                      <User size={16} /> Profile
                    </button>
                    <button onClick={() => { setAvatarMenuOpen(false); setView('analytics'); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[9px] text-[13.5px] text-muted-foreground hover:text-foreground hover:bg-[#fff7ee0b] transition-all">
                      <Settings size={16} /> Store Settings
                    </button>
                    <button onClick={() => { setAvatarMenuOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[9px] text-[13.5px] text-[#FF8A8A] hover:bg-[#ff8a8a11] transition-all border-t border-[#ffe8cd11] mt-1">
                      <LogOut size={16} /> Sign out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ===== VIEWS ===== */}

          {/* DASHBOARD VIEW */}
          {currentView === 'dashboard' && (
            <div className="space-y-4">
              {/* KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPI onClick={() => setView('analytics')} title="Revenue" value={activeMetrics.revenue} prefix="$" suffix="k" delta="12.4%" deltaUp={true} sparkPts="0,24 12,20 24,22 36,12 48,15 60,6 76,3" delay="0.05s" />
                <KPI onClick={() => setView('orders')} title="Orders" value={activeMetrics.orders} delta="8.1%" deltaUp={true} sparkPts="0,20 12,22 24,14 36,18 48,10 60,12 76,5" delay="0.12s" />
                <KPI onClick={() => setView('products')} title="Avg order" value={activeMetrics.aov} prefix="$" delta="3.9%" deltaUp={true} sparkPts="0,18 12,16 24,17 36,13 48,14 60,9 76,8" delay="0.19s" />
                <KPI onClick={() => setView('analytics')} title="Conversion" value={activeMetrics.conv} suffix="%" delta="0.4%" deltaUp={false} sparkPts="0,8 12,10 24,7 36,12 48,11 60,16 76,15" delay="0.26s" />
              </div>

              {/* Graphical row */}
              <div className="grid grid-cols-1 lg:grid-cols-[1.75fr_1fr] gap-4">
                {/* Revenue chart */}
                <div className="glass-panel rounded-[18px] animate-rise relative overflow-hidden flex flex-col" style={{ animationDelay: '0.3s' }}>
                  <div className="absolute inset-0 rounded-[18px] pointer-events-none" style={{ background: 'radial-gradient(120% 90% at 100% 0%, rgba(246,166,35,.06), transparent 45%)' }}></div>
                  <div className="flex items-center justify-between p-5 pb-2 relative z-10">
                    <div>
                      <h3 className="font-serif font-medium text-[18px]">Revenue Over Time</h3>
                      <p className="text-[12.5px] text-muted-foreground mt-0.5">Real-time store earnings metrics</p>
                    </div>
                  </div>
                  <div className="h-[260px] w-full px-3 pb-3 relative z-10 mt-auto">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#F6A623" stopOpacity={0.35}/>
                            <stop offset="95%" stopColor="#F6A623" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="strokeGradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#FF6B45" />
                            <stop offset="100%" stopColor="#FFC061" />
                          </linearGradient>
                        </defs>
                        <Tooltip 
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-[#1a120e] border border-[#ffe8cd2e] p-2 px-3 rounded-[9px] shadow-panel text-[12.5px]">
                                  <b className="text-[#FFC061] font-serif">${payload[0].value?.toLocaleString()}</b> · Point {payload[0].payload.name}
                                </div>
                              );
                            }
                            return null;
                          }}
                          cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
                        />
                        <Area type="monotone" dataKey="value" stroke="url(#strokeGradient)" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Category breakdown */}
                <div className="glass-panel rounded-[18px] animate-rise relative overflow-hidden" style={{ animationDelay: '0.36s' }}>
                  <div className="absolute inset-0 rounded-[18px] pointer-events-none" style={{ background: 'radial-gradient(120% 90% at 100% 0%, rgba(246,166,35,.06), transparent 45%)' }}></div>
                  <div className="p-5 pb-2 relative z-10">
                    <h3 className="font-serif font-medium text-[18px]">By category</h3>
                    <p className="text-[12.5px] text-muted-foreground mt-0.5">Share of revenue</p>
                  </div>
                  <div className="p-5 pt-2 flex flex-col items-center gap-4 relative z-10">
                    <div className="relative w-[172px] h-[172px]">
                      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                        <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,.05)" strokeWidth="14"/>
                        <motion.circle cx="60" cy="60" r="50" fill="none" stroke="#F6A623" strokeWidth="14" strokeLinecap="round" strokeDasharray="314" initial={{ strokeDashoffset: 314 }} animate={{ strokeDashoffset: -314 * 0 }} transition={{ duration: 1.1, ease: "easeOut" }} />
                        <motion.circle cx="60" cy="60" r="50" fill="none" stroke="#FF6B45" strokeWidth="14" strokeLinecap="round" strokeDasharray="314" initial={{ strokeDashoffset: 314 }} animate={{ strokeDashoffset: -314 * 42 / 100 }} transition={{ duration: 1.1, ease: "easeOut" }} />
                        <motion.circle cx="60" cy="60" r="50" fill="none" stroke="#FFC061" strokeWidth="14" strokeLinecap="round" strokeDasharray="314" initial={{ strokeDashoffset: 314 }} animate={{ strokeDashoffset: -314 * 69 / 100 }} transition={{ duration: 1.1, ease: "easeOut" }} />
                        <motion.circle cx="60" cy="60" r="50" fill="none" stroke="#8ab4ff" strokeWidth="14" strokeLinecap="round" strokeDasharray="314" initial={{ strokeDashoffset: 314 }} animate={{ strokeDashoffset: -314 * 88 / 100 }} transition={{ duration: 1.1, ease: "easeOut" }} />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <b className="font-serif text-[26px] leading-none block text-[#F6EFE6] drop-shadow-md">$48.2k</b>
                        <span className="text-[11.5px] text-muted-foreground mt-1">total</span>
                      </div>
                    </div>
                    
                    <div className="w-full flex flex-col gap-2.5 mt-2">
                      {[
                        { color: '#F6A623', name: 'Candles', val: '42%' },
                        { color: '#FF6B45', name: 'Diffusers', val: '27%' },
                        { color: '#FFC061', name: 'Room sprays', val: '19%' },
                        { color: '#8ab4ff', name: 'Refills', val: '12%' },
                      ].map(i => (
                        <div key={i.name} className="flex items-center gap-2.5 text-[13px]">
                          <span className="w-2.5 h-2.5 rounded-[3px] flex-none" style={{ backgroundColor: i.color }}></span>
                          <span className="flex-1 text-muted-foreground">{i.name}</span>
                          <span className="font-semibold">{i.val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Orders table */}
              <div className="glass-panel rounded-[18px] animate-rise relative overflow-hidden" style={{ animationDelay: '0.42s' }}>
                <div className="absolute inset-0 rounded-[18px] pointer-events-none" style={{ background: 'radial-gradient(120% 90% at 100% 0%, rgba(246,166,35,.06), transparent 45%)' }}></div>
                <div className="flex items-center justify-between p-5 pb-2 relative z-10">
                  <h3 className="font-serif font-medium text-[18px]">Recent orders</h3>
                  <button onClick={() => setView('orders')} className="text-[#FFC061] text-[13px] font-semibold hover:underline">View all →</button>
                </div>
                <div className="w-full overflow-x-auto relative z-10 pb-2">
                  <table className="w-full border-collapse min-w-[600px]">
                    <thead>
                      <tr>
                        <th className="text-left text-[11px] tracking-[0.08em] uppercase text-[#7C6F60] font-semibold px-5 py-2">Product</th>
                        <th className="text-left text-[11px] tracking-[0.08em] uppercase text-[#7C6F60] font-semibold px-5 py-2">Customer</th>
                        <th className="text-left text-[11px] tracking-[0.08em] uppercase text-[#7C6F60] font-semibold px-5 py-2">Status</th>
                        <th className="text-right text-[11px] tracking-[0.08em] uppercase text-[#7C6F60] font-semibold px-5 py-2">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0, 5).map((o, i) => (
                        <tr key={i} className="hover:bg-[#fff7ee0b] transition-colors border-t border-[#ffe8cd1a]">
                          <td className="px-5 py-3.5 text-[14px]">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-[10px] flex-none flex items-center justify-center text-[17px]" style={{ backgroundColor: o.bg_color || '#3a2a12' }}>
                                {o.emoji || '🕯️'}
                              </div>
                              {o.product}
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-[13px] text-muted-foreground">{o.customer}</td>
                          <td className="px-5 py-3.5">
                            <span className={`text-[12px] font-semibold px-2.5 py-1 rounded-full inline-flex items-center gap-1.5
                              ${o.status === 'paid' ? 'text-[#6FE0A6] bg-[#6fe0a61a]' : 
                                o.status === 'pend' ? 'text-[#FFC061] bg-[#f6a6231f]' : 
                                'text-[#8ab4ff] bg-[#8ab4ff1f]'}`}>
                              <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                              {o.status_text}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-right font-serif font-medium text-[14px]">${o.amount.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ORDERS VIEW */}
          {currentView === 'orders' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-panel rounded-[18px] p-4.5">
                  <div className="text-[12.5px] text-muted-foreground">Total orders</div>
                  <div className="font-serif font-medium text-[27px] mt-2">
                    <AnimatedNumber value={orders.length} />
                  </div>
                  <div className="text-[11.5px] text-[#6FE0A6] mt-1">▲ 8.1% compared to last week</div>
                </div>
                <div className="glass-panel rounded-[18px] p-4.5">
                  <div className="text-[12.5px] text-muted-foreground">Paid</div>
                  <div className="font-serif font-medium text-[27px] mt-2">
                    <AnimatedNumber value={orders.filter(o => o.status === 'paid').length} />
                  </div>
                  <div className="text-[11.5px] text-[#6FE0A6] mt-1">▲ 6.4% completed successfully</div>
                </div>
                <div className="glass-panel rounded-[18px] p-4.5">
                  <div className="text-[12.5px] text-muted-foreground">Pending</div>
                  <div className="font-serif font-medium text-[27px] mt-2">
                    <AnimatedNumber value={orders.filter(o => o.status === 'pend').length} />
                  </div>
                  <div className="text-[11.5px] text-muted-foreground mt-1">Awaiting checkout action</div>
                </div>
                <div className="glass-panel rounded-[18px] p-4.5">
                  <div className="text-[12.5px] text-muted-foreground">Shipped</div>
                  <div className="font-serif font-medium text-[27px] mt-2">
                    <AnimatedNumber value={orders.filter(o => o.status === 'ship').length} />
                  </div>
                  <div className="text-[11.5px] text-[#6FE0A6] mt-1">▲ 4.7% dispatch rate</div>
                </div>
              </div>

              {/* Filter / Table Row */}
              <div className="glass-panel rounded-[18px] overflow-hidden p-5">
                <div className="flex items-center justify-between gap-4 flex-wrap mb-5">
                  <div>
                    <h3 className="font-serif font-medium text-[18px]">All Orders</h3>
                    <p className="text-[12.5px] text-muted-foreground mt-0.5">{filteredOrders.length} orders found</p>
                  </div>
                  <div className="flex gap-1 bg-[#00000040] p-1 rounded-[11px] border border-[#ffe8cd1a]">
                    {[
                      { key: "all", label: "All" },
                      { key: "paid", label: "Paid" },
                      { key: "pend", label: "Pending" },
                      { key: "ship", label: "Shipped" }
                    ].map(tab => (
                      <button 
                        key={tab.key}
                        onClick={() => setStatusFilter(tab.key)}
                        className={`px-3 py-1.5 rounded-lg text-[12.5px] font-semibold transition-all ${statusFilter === tab.key ? 'bg-[#fff7ee13] text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="w-full overflow-x-auto">
                  <table className="w-full border-collapse min-w-[600px]">
                    <thead>
                      <tr>
                        <th className="text-left text-[11px] tracking-[0.08em] uppercase text-[#7C6F60] font-semibold px-5 py-2">Order ID</th>
                        <th className="text-left text-[11px] tracking-[0.08em] uppercase text-[#7C6F60] font-semibold px-5 py-2">Product</th>
                        <th className="text-left text-[11px] tracking-[0.08em] uppercase text-[#7C6F60] font-semibold px-5 py-2">Customer</th>
                        <th className="text-left text-[11px] tracking-[0.08em] uppercase text-[#7C6F60] font-semibold px-5 py-2">Status</th>
                        <th className="text-right text-[11px] tracking-[0.08em] uppercase text-[#7C6F60] font-semibold px-5 py-2">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-8 text-muted-foreground text-[14px]">No orders match your filters.</td>
                        </tr>
                      ) : (
                        filteredOrders.map((o, i) => (
                          <tr key={i} className="hover:bg-[#fff7ee0b] transition-colors border-t border-[#ffe8cd1a]">
                            <td className="px-5 py-3.5 text-[13px] text-muted-foreground">{o.id}</td>
                            <td className="px-5 py-3.5 text-[14px]">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-[10px] flex-none flex items-center justify-center text-[17px]" style={{ backgroundColor: o.bg_color || '#3a2a12' }}>
                                  {o.emoji || '🕯️'}
                                </div>
                                {o.product}
                              </div>
                            </td>
                            <td className="px-5 py-3.5 text-[13px] text-muted-foreground">{o.customer}</td>
                            <td className="px-5 py-3.5">
                              <span className={`text-[12px] font-semibold px-2.5 py-1 rounded-full inline-flex items-center gap-1.5
                                ${o.status === 'paid' ? 'text-[#6FE0A6] bg-[#6fe0a61a]' : 
                                  o.status === 'pend' ? 'text-[#FFC061] bg-[#f6a6231f]' : 
                                  'text-[#8ab4ff] bg-[#8ab4ff1f]'}`}>
                                <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                {o.status_text}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-right font-serif font-medium text-[14px]">${o.amount.toFixed(2)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* PRODUCTS VIEW */}
          {currentView === 'products' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-panel rounded-[18px] p-4.5">
                  <div className="text-[12.5px] text-muted-foreground">Active products</div>
                  <div className="font-serif font-medium text-[27px] mt-2">
                    <AnimatedNumber value={products.length} />
                  </div>
                </div>
                <div className="glass-panel rounded-[18px] p-4.5">
                  <div className="text-[12.5px] text-muted-foreground">Units sold</div>
                  <div className="font-serif font-medium text-[27px] mt-2">
                    <AnimatedNumber value={1624} />
                  </div>
                </div>
                <div className="glass-panel rounded-[18px] p-4.5">
                  <div className="text-[12.5px] text-muted-foreground">Low stock items</div>
                  <div className="font-serif font-medium text-[27px] mt-2 text-[#FF8A8A]">
                    <AnimatedNumber value={products.filter(p => p.stock < 30).length} />
                  </div>
                </div>
                <div className="glass-panel rounded-[18px] p-4.5">
                  <div className="text-[12.5px] text-muted-foreground">Total value</div>
                  <div className="font-serif font-medium text-[27px] mt-2">
                    <AnimatedNumber value={46.9} prefix="$" suffix="k" />
                  </div>
                </div>
              </div>

              {/* Scent catalogue chart */}
              <div className="glass-panel rounded-[18px] p-5">
                <h3 className="font-serif font-medium text-[18px] mb-1">Top scents by stock level</h3>
                <p className="text-[12.5px] text-muted-foreground mb-4">Inventory health & units count</p>
                <div className="h-[220px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={products}>
                      <XAxis dataKey="name" stroke="#7C6F60" fontSize={11} />
                      <YAxis stroke="#7C6F60" fontSize={11} />
                      <Tooltip cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                      <Bar dataKey="stock" fill="#F6A623" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Product cards grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {products.map(p => (
                  <div key={p.id} className="glass-panel rounded-[18px] p-4 flex flex-col relative overflow-hidden group">
                    <div className="h-[118px] rounded-[12px] flex items-center justify-center text-[44px] mb-3" style={{ backgroundColor: p.bg_color }}>
                      {p.emoji}
                    </div>
                    <b className="font-serif font-medium text-[16px] block text-foreground">{p.name}</b>
                    <div className="flex justify-between items-center mt-2.5">
                      <span className="font-serif font-medium text-[17px]">${p.price.toFixed(2)}</span>
                      <span className="text-[11.5px] text-muted-foreground">
                        {p.stock < 30 ? (
                          <span className="text-[#FF8A8A] font-semibold">Low stock ({p.stock})</span>
                        ) : (
                          `${p.stock} units`
                        )}
                      </span>
                    </div>
                    <button 
                      onClick={() => {
                        setEditingProduct(p);
                        setProductModalOpen(true);
                      }} 
                      className="mt-4 w-full py-2.5 rounded-[9px] border border-[#ffe8cd1a] hover:bg-[#F6A623] hover:text-[#2a1c10] hover:border-transparent font-semibold text-[13px] transition-all"
                    >
                      Edit product
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CUSTOMERS VIEW */}
          {currentView === 'customers' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-panel rounded-[18px] p-4.5">
                  <div className="text-[12.5px] text-muted-foreground">Total customers</div>
                  <div className="font-serif font-medium text-[27px] mt-2">
                    <AnimatedNumber value={customers.length} />
                  </div>
                </div>
                <div className="glass-panel rounded-[18px] p-4.5">
                  <div className="text-[12.5px] text-muted-foreground">New segment</div>
                  <div className="font-serif font-medium text-[27px] mt-2">
                    <AnimatedNumber value={214} />
                  </div>
                </div>
                <div className="glass-panel rounded-[18px] p-4.5">
                  <div className="text-[12.5px] text-muted-foreground">Returning rate</div>
                  <div className="font-serif font-medium text-[27px] mt-2">
                    <AnimatedNumber value={42} suffix="%" />
                  </div>
                </div>
                <div className="glass-panel rounded-[18px] p-4.5">
                  <div className="text-[12.5px] text-muted-foreground">Avg lifetime spend</div>
                  <div className="font-serif font-medium text-[27px] mt-2">
                    <AnimatedNumber value={286} prefix="$" />
                  </div>
                </div>
              </div>

              {/* Customers table */}
              <div className="glass-panel rounded-[18px] overflow-hidden p-5">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="font-serif font-medium text-[18px]">Customers</h3>
                  <button onClick={() => setCustomerModalOpen(true)} className="text-[#FFC061] text-[13px] font-semibold flex items-center gap-1.5 hover:underline">
                    <Plus size={16} /> Add customer
                  </button>
                </div>

                <div className="w-full overflow-x-auto">
                  <table className="w-full border-collapse min-w-[600px]">
                    <thead>
                      <tr>
                        <th className="text-left text-[11px] tracking-[0.08em] uppercase text-[#7C6F60] font-semibold px-5 py-2">Name</th>
                        <th className="text-left text-[11px] tracking-[0.08em] uppercase text-[#7C6F60] font-semibold px-5 py-2">Location</th>
                        <th className="text-left text-[11px] tracking-[0.08em] uppercase text-[#7C6F60] font-semibold px-5 py-2">Orders</th>
                        <th className="text-left text-[11px] tracking-[0.08em] uppercase text-[#7C6F60] font-semibold px-5 py-2">Spent</th>
                        <th className="text-right text-[11px] tracking-[0.08em] uppercase text-[#7C6F60] font-semibold px-5 py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.map((c, i) => (
                        <tr key={i} className="hover:bg-[#fff7ee0b] transition-colors border-t border-[#ffe8cd1a]">
                          <td className="px-5 py-3.5 text-[14px]">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full flex-none flex items-center justify-center font-bold text-[13px] text-[#2a1c10] bg-[#FFC061]">
                                {c.name.split(' ').map(w => w[0]).join('')}
                              </div>
                              {c.name}
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-[13px] text-muted-foreground">{c.location}</td>
                          <td className="px-5 py-3.5 text-[14px]">{c.orders_count}</td>
                          <td className="px-5 py-3.5 font-serif font-medium text-[14px]">${c.spent.toFixed(2)}</td>
                          <td className="px-5 py-3.5 text-right font-serif font-medium text-[14px]">
                            <span className={`text-[12px] font-semibold px-2.5 py-1 rounded-full inline-flex items-center gap-1.5
                              ${c.status === 'VIP' ? 'text-[#FFC061] bg-[#f6a6231f]' : 'text-[#6FE0A6] bg-[#6fe0a61a]'}`}>
                              {c.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ANALYTICS VIEW */}
          {currentView === 'analytics' && (
            <div className="space-y-6">
              {/* Converssion funnel */}
              <div className="glass-panel rounded-[18px] p-5">
                <h3 className="font-serif font-medium text-[18px] mb-1">Conversion Funnel</h3>
                <p className="text-[12.5px] text-muted-foreground mb-6">Visit to Purchase flow analysis</p>
                
                <div className="space-y-4">
                  {[
                    { label: "Visits", value: "128,400", pct: "100%", color: "linear-gradient(90deg, #8AB4FF, #c9def7)" },
                    { label: "Added to cart", value: "21,900", pct: "52%", color: "linear-gradient(90deg, #FF6B45, #FFC061)" },
                    { label: "Checkout", value: "9,240", pct: "31%", color: "linear-gradient(90deg, #F6A623, #FFC061)" },
                    { label: "Purchased", value: "6,060", pct: "19%", color: "linear-gradient(90deg, #6FE0A6, #a7f0cd)" }
                  ].map((step, i) => (
                    <div key={i} className="space-y-1.5">
                      <div className="flex justify-between text-[13px]">
                        <span className="text-muted-foreground">{step.label}</span>
                        <b>{step.value}</b>
                      </div>
                      <div className="h-2 w-full rounded-full bg-[#ffffff0f] overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: step.pct, background: step.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* CAMPAIGNS VIEW */}
          {currentView === 'campaigns' && (
            <div className="space-y-6">
              <div className="glass-panel rounded-[18px] overflow-hidden">
                <div className="flex justify-between items-center p-5 pb-2">
                  <div>
                    <h3 className="font-serif font-medium text-[18px]">Campaigns</h3>
                    <p className="text-[12.5px] text-muted-foreground mt-0.5">Reach your subscribers across email, SMS & push</p>
                  </div>
                  <button onClick={() => { setNewCampaignSuccess(false); setCampaignModalOpen(true); }} className="h-9 px-4.5 rounded-[12px] bg-gradient-primary text-[#2a1c10] font-bold text-[13px] flex items-center gap-2 transition-all">
                    <Plus size={16} /> New
                  </button>
                </div>

                <div className="divide-y divide-[#ffe8cd11] mt-4">
                  {campaigns.map(c => (
                    <div key={c.id} className="flex items-center gap-4 p-4 px-5">
                      <div className="w-[42px] h-[42px] rounded-[11px] flex-none flex items-center justify-center bg-[#f6a62323] text-[#FFC061]">
                        <Megaphone size={19} />
                      </div>
                      <div className="flex-1">
                        <b className="font-serif font-medium text-[16px] block text-foreground leading-snug">{c.name}</b>
                        <span className="text-muted-foreground text-[12px] block mt-0.5">{c.details}</span>
                      </div>
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase
                        ${c.status === 'live' ? 'text-[#6FE0A6] bg-[#6fe0a61a]' : 
                          c.status === 'sched' ? 'text-[#FFC061] bg-[#f6a6231f]' : 
                          'text-muted-foreground bg-[#ffffff0f]'}`}>
                        {c.status === 'live' ? 'LIVE' : c.status === 'sched' ? 'SCHEDULED' : 'SENT'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Toasts */}
      <div className="fixed right-6 bottom-6 z-50 flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div 
              key={t.id}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className="flex items-center gap-3 min-w-[280px] p-3.5 px-4 rounded-[14px] bg-[#1c1411eb] border border-[#ffe8cd2e] backdrop-blur-md shadow-panel pointer-events-auto"
            >
              <div className="w-9 h-9 rounded-[10px] flex-none flex items-center justify-center bg-[#6fe0a623] text-[#6FE0A6]">
                <CheckCircle2 size={19} />
              </div>
              <div className="flex-1">
                <b className="text-[14px] block mb-0.5 text-foreground leading-tight">New order</b>
                <span className="text-muted-foreground text-[12.5px]">{t.name} · {t.item}</span>
              </div>
              <div className="text-[#FFC061] font-medium text-[14px]">${t.amt}</div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* CAMPAIGN MODAL */}
      <AnimatePresence>
        {campaignModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#08050499] backdrop-blur-sm"
              onClick={() => setCampaignModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-[460px] bg-gradient-to-b from-[#241A15] to-[#1C1512] border border-[#ffe8cd2e] rounded-[22px] p-6 shadow-panel relative overflow-hidden z-10"
            >
              <div className="absolute -top-[60px] -right-[40px] w-[200px] h-[200px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(246,166,35,.22), transparent 70%)' }}></div>
              
              <button onClick={() => setCampaignModalOpen(false)} className="absolute top-4 right-4 w-8 h-8 rounded-[10px] border border-[#ffe8cd1a] bg-[#fff7ee0b] text-muted-foreground hover:text-foreground flex items-center justify-center z-20 transition-colors">
                <X size={16} />
              </button>

              {!newCampaignSuccess ? (
                <div>
                  <h2 className="font-serif font-medium text-[23px] mb-1 text-foreground">Launch a campaign</h2>
                  <p className="text-muted-foreground text-[14px] mb-5">Send a scented story to your list. Warm them up before the drop.</p>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-[12.5px] text-muted-foreground block mb-1.5 font-medium">Campaign name</label>
                      <input 
                        value={newCampaignName}
                        onChange={(e) => setNewCampaignName(e.target.value)}
                        className="w-full p-3 rounded-[11px] bg-[#00000047] border border-[#ffe8cd1a] text-[14px] outline-none focus:border-[#F6A623] focus:ring-2 focus:ring-[#f6a62323] transition-all" 
                      />
                    </div>
                    <div>
                      <label className="text-[12.5px] text-muted-foreground block mb-1.5 font-medium">Audience</label>
                      <select 
                        value={newCampaignAudience}
                        onChange={(e) => setNewCampaignAudience(e.target.value)}
                        className="w-full p-3 rounded-[11px] bg-[#00000047] border border-[#ffe8cd1a] text-[14px] outline-none focus:border-[#F6A623] focus:ring-2 focus:ring-[#f6a62323] transition-all appearance-none"
                      >
                        <option value="All subscribers · 8,420">All subscribers · 8,420</option>
                        <option value="VIP buyers · 1,190">VIP buyers · 1,190</option>
                        <option value="Cart abandoners · 640">Cart abandoners · 640</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[12.5px] text-muted-foreground block mb-1.5 font-medium">Channel</label>
                      <div className="flex gap-2">
                        {['Email', 'SMS', 'Push'].map((ch) => (
                          <button 
                            key={ch}
                            onClick={() => setNewCampaignChannel(ch)}
                            className={`flex-1 py-2.5 rounded-[11px] border font-semibold text-[13px] transition-all
                              ${newCampaignChannel === ch ? 'border-[#F6A623] bg-[#f6a6231f] text-foreground' : 'border-[#ffe8cd1a] bg-[#00000033] text-muted-foreground hover:bg-[#fff7ee0b]'}`}
                          >
                            {ch}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2.5 mt-6">
                    <button onClick={() => setCampaignModalOpen(false)} className="px-4 py-3 rounded-[12px] border border-[#ffe8cd2e] bg-transparent text-muted-foreground font-semibold text-[14px] hover:bg-[#fff7ee0b] transition-colors">Cancel</button>
                    <button onClick={handleCreateCampaign} className="flex-1 py-3 rounded-[12px] bg-gradient-primary shadow-glow hover:shadow-glow-hover hover:-translate-y-0.5 text-[#2a1c10] font-bold text-[14px] transition-all">Schedule send</button>
                  </div>
                </div>
              ) : (
                <div className="text-center pt-4 pb-2">
                  <motion.div 
                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5 }}
                    className="w-[74px] h-[74px] rounded-full mx-auto mb-4 flex items-center justify-center bg-[#6fe0a623] text-[#6FE0A6]"
                  >
                    <CheckCircle2 size={34} />
                  </motion.div>
                  <h2 className="font-serif font-medium text-[23px] mb-1.5">Campaign scheduled</h2>
                  <p className="text-muted-foreground text-[14px] mb-6">“{newCampaignName}” will reach your target subscribers. We'll notify you when the glow lands.</p>
                  <button onClick={() => setCampaignModalOpen(false)} className="w-full py-3 rounded-[12px] bg-gradient-primary shadow-glow hover:shadow-glow-hover hover:-translate-y-0.5 text-[#2a1c10] font-bold text-[14px] transition-all">Done</button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CUSTOMER MODAL */}
      <AnimatePresence>
        {customerModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#08050499] backdrop-blur-sm"
              onClick={() => setCustomerModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-[460px] bg-gradient-to-b from-[#241A15] to-[#1C1512] border border-[#ffe8cd2e] rounded-[22px] p-6 shadow-panel relative overflow-hidden z-10"
            >
              <button onClick={() => setCustomerModalOpen(false)} className="absolute top-4 right-4 w-8 h-8 rounded-[10px] border border-[#ffe8cd1a] bg-[#fff7ee0b] text-muted-foreground hover:text-foreground flex items-center justify-center z-20 transition-colors">
                <X size={16} />
              </button>

              <div>
                <h2 className="font-serif font-medium text-[23px] mb-1 text-foreground">Add new customer</h2>
                <p className="text-muted-foreground text-[14px] mb-5">Create a customer profile for custom orders and direct messaging.</p>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-[12.5px] text-muted-foreground block mb-1.5 font-medium">Customer name</label>
                    <input 
                      value={newCustName}
                      onChange={(e) => setNewCustName(e.target.value)}
                      placeholder="e.g. Liam Novak"
                      className="w-full p-3 rounded-[11px] bg-[#00000047] border border-[#ffe8cd1a] text-[14px] outline-none focus:border-[#F6A623] focus:ring-2 focus:ring-[#f6a62323] transition-all" 
                    />
                  </div>
                  <div>
                    <label className="text-[12.5px] text-muted-foreground block mb-1.5 font-medium">Location</label>
                    <input 
                      value={newCustLocation}
                      onChange={(e) => setNewCustLocation(e.target.value)}
                      placeholder="e.g. San Francisco"
                      className="w-full p-3 rounded-[11px] bg-[#00000047] border border-[#ffe8cd1a] text-[14px] outline-none focus:border-[#F6A623] focus:ring-2 focus:ring-[#f6a62323] transition-all" 
                    />
                  </div>
                  <div>
                    <label className="text-[12.5px] text-muted-foreground block mb-1.5 font-medium">Status</label>
                    <select 
                      value={newCustStatus}
                      onChange={(e) => setNewCustStatus(e.target.value)}
                      className="w-full p-3 rounded-[11px] bg-[#00000047] border border-[#ffe8cd1a] text-[14px] outline-none focus:border-[#F6A623] focus:ring-2 focus:ring-[#f6a62323] transition-all appearance-none"
                    >
                      <option value="Active">Active</option>
                      <option value="VIP">VIP</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2.5 mt-6">
                  <button onClick={() => setCustomerModalOpen(false)} className="px-4 py-3 rounded-[12px] border border-[#ffe8cd2e] bg-transparent text-muted-foreground font-semibold text-[14px] hover:bg-[#fff7ee0b] transition-colors">Cancel</button>
                  <button onClick={handleCreateCustomer} className="flex-1 py-3 rounded-[12px] bg-gradient-primary shadow-glow hover:shadow-glow-hover hover:-translate-y-0.5 text-[#2a1c10] font-bold text-[14px] transition-all">Add customer</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT PRODUCT MODAL */}
      <AnimatePresence>
        {productModalOpen && editingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#08050499] backdrop-blur-sm"
              onClick={() => { setProductModalOpen(false); setEditingProduct(null); }}
            />
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-[460px] bg-gradient-to-b from-[#241A15] to-[#1C1512] border border-[#ffe8cd2e] rounded-[22px] p-6 shadow-panel relative overflow-hidden z-10"
            >
              <button onClick={() => { setProductModalOpen(false); setEditingProduct(null); }} className="absolute top-4 right-4 w-8 h-8 rounded-[10px] border border-[#ffe8cd1a] bg-[#fff7ee0b] text-muted-foreground hover:text-foreground flex items-center justify-center z-20 transition-colors">
                <X size={16} />
              </button>

              <div>
                <h2 className="font-serif font-medium text-[23px] mb-1 text-foreground">Edit Scent Product</h2>
                <p className="text-muted-foreground text-[14px] mb-5">Adjust details, stock thresholds, and catalogue presentation.</p>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-[12.5px] text-muted-foreground block mb-1.5 font-medium">Product name</label>
                    <input 
                      value={editingProduct.name}
                      onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                      className="w-full p-3 rounded-[11px] bg-[#00000047] border border-[#ffe8cd1a] text-[14px] outline-none focus:border-[#F6A623] focus:ring-2 focus:ring-[#f6a62323] transition-all" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[12.5px] text-muted-foreground block mb-1.5 font-medium">Price ($)</label>
                      <input 
                        type="number"
                        value={editingProduct.price}
                        onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })}
                        className="w-full p-3 rounded-[11px] bg-[#00000047] border border-[#ffe8cd1a] text-[14px] outline-none focus:border-[#F6A623] focus:ring-2 focus:ring-[#f6a62323] transition-all" 
                      />
                    </div>
                    <div>
                      <label className="text-[12.5px] text-muted-foreground block mb-1.5 font-medium">Stock count</label>
                      <input 
                        type="number"
                        value={editingProduct.stock}
                        onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) || 0 })}
                        className="w-full p-3 rounded-[11px] bg-[#00000047] border border-[#ffe8cd1a] text-[14px] outline-none focus:border-[#F6A623] focus:ring-2 focus:ring-[#f6a62323] transition-all" 
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2.5 mt-6">
                  <button onClick={() => { setProductModalOpen(false); setEditingProduct(null); }} className="px-4 py-3 rounded-[12px] border border-[#ffe8cd2e] bg-transparent text-muted-foreground font-semibold text-[14px] hover:bg-[#fff7ee0b] transition-colors">Cancel</button>
                  <button onClick={handleUpdateProduct} className="flex-1 py-3 rounded-[12px] bg-gradient-primary shadow-glow hover:shadow-glow-hover hover:-translate-y-0.5 text-[#2a1c10] font-bold text-[14px] transition-all">Save changes</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}