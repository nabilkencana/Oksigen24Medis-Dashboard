'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../context/DataContext';
import { formatRupiah } from '../context/mockData';
import {
  LayoutDashboard,
  Users,
  Building2,
  Package,
  Database,
  Wind,
  Clock,
  RefreshCw,
  ArrowRightLeft,
  ShoppingCart,
  DollarSign,
  FileText,
  TrendingUp,
  BarChart3,
  Settings,
  LogOut,
  Search,
  Bell,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  User,
  Sun,
  Moon,
  AlertTriangle
} from 'lucide-react';

interface SidebarItem {
  name: string;
  href: string;
  icon: any;
}

interface SidebarGroup {
  title: string;
  items: SidebarItem[];
}

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme, customers, vendors, cylinders, products, expenses, user, logout } = useData();

  const getRoleLabel = (usr: any) => {
    if (!usr) return 'Admin Role';
    const roleVal = usr.role?.name || usr.role || 'ADMIN';
    const r = String(roleVal).toUpperCase();
    if (r === 'OWNER') return 'Owner Role';
    if (r === 'ADMIN') return 'Admin Role';
    if (r === 'FINANCE') return 'Finance Role';
    if (r === 'WAREHOUSE') return 'Warehouse Role';
    return `${roleVal} Role`;
  };

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  // Collapsed submenus state
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    'Data Master': true,
    'Transaksi Logistik': true,
    'Laporan Rekapan': false,
  });

  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Listen for Cmd+K / Ctrl+K
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleGroup = (group: string) => {
    setOpenGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  const menuStructure: SidebarGroup[] = [
    {
      title: 'Menu Utama',
      items: [
        { name: 'Dashboard', href: '/', icon: LayoutDashboard },
        { name: 'Transaksi', href: '/transactions', icon: ArrowRightLeft },
        { name: 'Inventaris', href: '/inventory', icon: Database },
        { name: 'Keuangan', href: '/finance', icon: DollarSign },
        { name: 'Laporan', href: '/reports', icon: TrendingUp },
        { name: 'Pengaturan', href: '/settings', icon: Settings },
      ]
    }
  ];

  // Breadcrumbs generator
  const getBreadcrumbs = () => {
    if (pathname === '/') return ['Dashboard'];
    
    // Find matching link
    for (const group of menuStructure) {
      for (const item of group.items) {
        if (pathname === item.href || pathname.startsWith(item.href + '/')) {
          return [item.name];
        }
      }
    }
    return [pathname.replace('/', '')];
  };

  const breadcrumbs = getBreadcrumbs();

  // Search filter
  const getSearchResults = () => {
    if (!searchQuery) return [];
    const query = searchQuery.toLowerCase();
    
    const matchedCustomers = customers
      .filter(c => c.name.toLowerCase().includes(query) || c.id.toLowerCase().includes(query))
      .slice(0, 3)
      .map(c => ({ type: 'Pelanggan', name: c.name, sub: c.id, link: `/inventory?tab=customers&search=${c.id}` }));

    const matchedVendors = vendors
      .filter(v => v.companyName.toLowerCase().includes(query) || v.id.toLowerCase().includes(query))
      .slice(0, 3)
      .map(v => ({ type: 'Mitra Vendor', name: v.companyName, sub: `Rep: ${v.name}`, link: `/inventory?tab=vendors&search=${v.id}` }));

    const matchedCylinders = cylinders
      .filter(c => c.serialNo.toLowerCase().includes(query) || c.id.toLowerCase().includes(query))
      .slice(0, 3)
      .map(c => ({ type: 'Tabung', name: c.serialNo, sub: `${c.size} - ${c.status}`, link: `/inventory?tab=cylinders&search=${c.serialNo}` }));

    const matchedProducts = products
      .filter(p => p.name.toLowerCase().includes(query) || p.id.toLowerCase().includes(query))
      .slice(0, 3)
      .map(p => ({ type: 'Produk', name: p.name, sub: `${p.category} | ${formatRupiah(p.price)}`, link: `/inventory?tab=products&search=${p.id}` }));

    // Pages match
    const matchedPages = [];
    for (const group of menuStructure) {
      for (const item of group.items) {
        if (item.name.toLowerCase().includes(query)) {
          matchedPages.push({ type: 'Menu Navigasi', name: item.name, sub: `Buka halaman ${item.name}`, link: item.href });
        }
      }
    }

    return [...matchedPages, ...matchedCustomers, ...matchedVendors, ...matchedCylinders, ...matchedProducts];
  };

  const searchResults = getSearchResults();

  // Custom alert notifications (mocked)
  const mockNotifications = [
    { id: '1', title: 'Stok Aksesoris Menipis', desc: 'Humidifier Tabung Oksigen sisa 2 unit di gudang.', type: 'alert', time: '10 mnt lalu' },
    { id: '2', title: 'Rental Jatuh Tempo', desc: 'Tabung SN-OX-49281 (Budi Wijaya) terlambat 3 hari.', type: 'warning', time: '1 jam lalu' },
    { id: '3', title: 'Isi Ulang Diterima', desc: 'Vendor SAMATOR mengembalikan 12 tabung refill 6m3.', type: 'info', time: '4 jam lalu' },
    { id: '4', title: 'Persetujuan Pengeluaran', desc: 'Biaya Servis Mobil Tangki Rp 2.500.000 menunggu approval.', type: 'approval', time: '1 hari lalu' }
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-card text-card-foreground shrink-0 select-none">
        
        {/* Sidebar Logo */}
        <div className="h-16 flex items-center px-6 border-b border-border/60">
          <img src="/website-logo.png" alt="Website Logo" className="h-9 object-contain" />
        </div>

        {/* Sidebar Links */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
          {menuStructure.map((group, index) => (
            <div key={index} className="space-y-1">
              <div className="px-2 py-1 text-2xs font-bold text-muted-foreground uppercase tracking-widest">
                {group.title}
              </div>
              <div className="space-y-0.5">
                {group.items.map((item, itemIndex) => {
                  const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={itemIndex}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all group ${
                        isActive
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'hover:bg-accent hover:text-accent-foreground text-muted-foreground'
                      }`}
                    >
                      <item.icon className={`w-4 h-4 shrink-0 transition-transform ${isActive ? '' : 'group-hover:scale-110'}`} />
                      <span className="truncate">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-border/60 bg-muted/20">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase shadow-inner">
                {user?.fullName ? user.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'AD'}
              </div>
              <div className="truncate w-28">
                <p className="text-xs font-semibold leading-tight truncate">{user?.fullName || 'Administrator'}</p>
                <p className="text-4xs text-muted-foreground leading-none font-bold uppercase">{getRoleLabel(user)}</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/settings')}
              className="p-1.5 rounded-lg border border-border bg-card hover:bg-accent text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title="Settings"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </aside>

      {/* Main Content Layout */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        
        {/* Top Navbar */}
        <header className="h-16 flex items-center justify-between border-b border-border/60 bg-card px-4 lg:px-6 select-none shrink-0 z-40">
          
          {/* Left Navigation Details */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden p-1.5 rounded-lg border border-border bg-background hover:bg-accent text-muted-foreground cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumbs */}
            <div className="hidden sm:flex items-center gap-2 text-xs font-medium">
              <span className="text-muted-foreground/80 hover:text-foreground cursor-pointer" onClick={() => router.push('/')}>
                Oksigen Medis 24 Jam
              </span>
              {breadcrumbs.map((bc, i) => (
                <React.Fragment key={i}>
                  <ChevronRight className="w-3 h-3 text-muted-foreground/50" />
                  <span className={i === breadcrumbs.length - 1 ? 'text-foreground font-semibold' : 'text-muted-foreground'}>
                    {bc}
                  </span>
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Right Navigation Details */}
          <div className="flex items-center gap-3">
            
            {/* Search Trigger */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2.5 h-9 px-3 w-40 md:w-56 text-xs text-muted-foreground rounded-lg border border-border bg-muted/40 hover:bg-muted/70 hover:text-foreground transition-all cursor-pointer text-left focus:outline-none"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search...</span>
              <kbd className="hidden md:inline-flex ml-auto text-[9px] font-bold px-1.5 py-0.5 border border-border/80 bg-background rounded shadow-2xs select-none">
                ⌘K
              </kbd>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg border border-border bg-muted/10 hover:bg-accent hover:text-accent-foreground text-muted-foreground cursor-pointer transition-colors"
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>



            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-1.5 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase border border-emerald-500/20">
                  {user?.fullName ? user.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'AD'}
                </div>
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-2xl p-1 z-50"
                  >
                    <div className="px-3 py-2 border-b border-border/60">
                      <p className="text-xs font-bold truncate">{user?.fullName || 'Nabil Kencana'}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{user?.email || 'nabil@oksigen24.com'}</p>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          router.push('/settings');
                        }}
                        className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg cursor-pointer"
                      >
                        <User className="w-3.5 h-3.5" />
                        <span>Profile Saya</span>
                      </button>
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          router.push('/settings');
                        }}
                        className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg cursor-pointer"
                      >
                        <Settings className="w-3.5 h-3.5" />
                        <span>Settings ERP</span>
                      </button>
                    </div>
                    <div className="border-t border-border/60 pt-1">
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          logout();
                        }}
                        className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-rose-500 hover:bg-rose-500/10 rounded-lg cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-background">
          {children}
        </main>
      </div>

      {/* Sidebar Drawer - Mobile */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 z-50 bg-black lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed inset-y-0 left-0 z-50 flex flex-col w-64 border-r border-border bg-card text-card-foreground h-full lg:hidden"
            >
              {/* Header */}
              <div className="h-16 flex items-center justify-between px-6 border-b border-border/60">
                <div className="flex items-center gap-3">
                  <img src="/website-logo.png" alt="Website Logo" className="h-8 w-8 object-contain" />
                  <h1 className="font-bold text-sm text-foreground">Oksigen24Medis</h1>
                </div>
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="p-1 rounded-lg border border-border hover:bg-accent text-muted-foreground cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="flex-1 overflow-y-auto p-4 space-y-6">
                {menuStructure.map((group, index) => (
                  <div key={index} className="space-y-1">
                    <div className="px-2 py-1 text-3xs font-bold text-muted-foreground uppercase tracking-widest">
                      {group.title}
                    </div>
                    <div className="space-y-0.5">
                      {group.items.map((item, itemIndex) => {
                        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                        return (
                          <Link
                            key={itemIndex}
                            href={item.href}
                            onClick={() => setIsMobileOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                              isActive
                                ? 'bg-primary text-primary-foreground'
                                : 'hover:bg-accent hover:text-accent-foreground text-muted-foreground'
                            }`}
                          >
                            <item.icon className="w-4 h-4 shrink-0" />
                            <span className="truncate">{item.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </nav>

              {/* Footer */}
              <div className="p-4 border-t border-border/60 bg-muted/20">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase">
                    {user?.fullName ? user.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'AD'}
                  </div>
                  <div className="truncate w-36">
                    <p className="text-xs font-semibold leading-none truncate">{user?.fullName || 'Administrator'}</p>
                    <p className="text-4xs text-muted-foreground mt-0.5 uppercase font-bold">{getRoleLabel(user)}</p>
                  </div>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Global Command Search Palette */}
      <AnimatePresence>
        {isSearchOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSearchOpen(false)}
              className="fixed inset-0 z-50 bg-black"
            />
            <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] p-4">
              <motion.div
                initial={{ scale: 0.97, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.97, opacity: 0 }}
                className="w-full max-w-xl bg-card border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col"
              >
                {/* Search Bar */}
                <div className="flex items-center gap-3 px-4 border-b border-border/60 h-12">
                  <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                  <input
                    autoFocus
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Cari pelanggan, vendor, tabung, produk, halaman..."
                    className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground text-foreground border-none outline-none focus:ring-0 focus:outline-none"
                  />
                  <button
                    onClick={() => setIsSearchOpen(false)}
                    className="text-xs px-2 py-1 rounded border border-border bg-muted/30 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    ESC
                  </button>
                </div>

                {/* Search Results */}
                <div className="max-h-80 overflow-y-auto p-2">
                  {searchQuery ? (
                    searchResults.length > 0 ? (
                      <div className="space-y-1">
                        {searchResults.map((res, i) => (
                          <div
                            key={i}
                            onClick={() => {
                              setIsSearchOpen(false);
                              setSearchQuery('');
                              router.push(res.link);
                            }}
                            className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                          >
                            <div>
                              <p className="text-xs font-semibold text-foreground">{res.name}</p>
                              <p className="text-4xs text-muted-foreground font-medium mt-0.5">{res.sub}</p>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                              {res.type}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-12 text-center flex flex-col items-center justify-center gap-2">
                        <AlertTriangle className="w-8 h-8 text-muted-foreground/60" />
                        <p className="text-sm font-semibold text-muted-foreground">Tidak ada hasil ditemukan</p>
                        <p className="text-xs text-muted-foreground/75">Coba cari dengan kata kunci lain.</p>
                      </div>
                    )
                  ) : (
                    <div className="p-4 space-y-4">
                      <div>
                        <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Pintasan Cepat</h4>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => { setIsSearchOpen(false); router.push('/transactions?tab=rental'); }}
                            className="flex items-center gap-2 p-2 rounded-lg border border-border hover:bg-muted cursor-pointer text-left text-xs"
                          >
                            <Clock className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Sewa Tabung Oksigen</span>
                          </button>
                          <button
                            onClick={() => { setIsSearchOpen(false); router.push('/transactions?tab=return'); }}
                            className="flex items-center gap-2 p-2 rounded-lg border border-border hover:bg-muted cursor-pointer text-left text-xs"
                          >
                            <ArrowRightLeft className="w-3.5 h-3.5 text-orange-500" />
                            <span>Kembalikan Tabung</span>
                          </button>
                          <button
                            onClick={() => { setIsSearchOpen(false); router.push('/transactions?tab=refill'); }}
                            className="flex items-center gap-2 p-2 rounded-lg border border-border hover:bg-muted cursor-pointer text-left text-xs"
                          >
                            <RefreshCw className="w-3.5 h-3.5 text-blue-500" />
                            <span>Isi Ulang Gas (Refill)</span>
                          </button>
                          <button
                            onClick={() => { setIsSearchOpen(false); router.push('/transactions?tab=sales'); }}
                            className="flex items-center gap-2 p-2 rounded-lg border border-border hover:bg-muted cursor-pointer text-left text-xs"
                          >
                            <ShoppingCart className="w-3.5 h-3.5 text-purple-500" />
                            <span>POS Kasir Ritel</span>
                          </button>
                          <button
                            onClick={() => { setIsSearchOpen(false); router.push('/transactions?tab=restock'); }}
                            className="flex items-center gap-2 p-2 rounded-lg border border-border hover:bg-muted cursor-pointer text-left text-xs"
                          >
                            <Package className="w-3.5 h-3.5 text-teal-500" />
                            <span>Beli Restock Baru</span>
                          </button>
                          <button
                            onClick={() => { setIsSearchOpen(false); router.push('/finance?tab=expenses'); }}
                            className="flex items-center gap-2 p-2 rounded-lg border border-border hover:bg-muted cursor-pointer text-left text-xs"
                          >
                            <FileText className="w-3.5 h-3.5 text-rose-500" />
                            <span>Catat Kas Keluar</span>
                          </button>
                        </div>
                      </div>
                      <div className="text-center text-4xs text-muted-foreground font-semibold uppercase tracking-widest border-t border-border/40 pt-2">
                        Gunakan panah & enter untuk navigasi
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
