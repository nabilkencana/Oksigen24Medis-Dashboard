'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useData } from '../context/DataContext';
import { formatRupiah, Cylinder } from '../context/mockData';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { AreaChart, BarChart, DonutChart } from '../components/ui/Charts';
import { Drawer } from '../components/ui/Drawer';
import { Input, Select, Textarea } from '../components/ui/Input';
import {
  TrendingUp,
  Clock,
  Database,
  AlertTriangle,
  Plus,
  RefreshCw,
  DollarSign,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  CheckCircle2,
  PackageCheck,
  UserPlus
} from 'lucide-react';

const isAccessoryAsset = (serial: string, size?: string) => {
  const s = (serial || '').toUpperCase();
  const sz = (size || '').toUpperCase();
  return s.startsWith('REG-') || s.startsWith('TRL-') || s.startsWith('ACC-') || sz === 'PCS';
};

export default function Home() {
  const router = useRouter();
  const {
    customers,
    vendors,
    cylinders,
    products,
    rentals,
    refills,
    expenses,
    transactions,
    stockMovements,
    addCustomer,
    addVendor,
    addCylinder,
    addOxygenType,
    oxygenTypes,
    createRental,
    sendToRefill,
    createSale,
    createExpense,
    user
  } = useData();

  // Drawer states
  const [activeDrawer, setActiveDrawer] = useState<'rental' | 'accessory-rental' | 'refill' | 'sale' | 'expense' | null>(null);
  const [rentalForm, setRentalForm] = useState({ customerId: '', cylinderId: '', rentDate: '', returnDate: '', deposit: '', rentalFee: '', paymentMethod: 'Tunai', serviceType: 'Kios' as 'Kios' | 'Antar' });
  const [isSaving, setIsSaving] = useState(false);
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');
  const [isNewCylinder, setIsNewCylinder] = useState(false);
  const [newCylinderSerialNo, setNewCylinderSerialNo] = useState('');
  const [newCylinderSize, setNewCylinderSize] = useState<'1m3' | '2m3' | '6m3' | 'Pcs'>('1m3');
  const [newCylinderType, setNewCylinderType] = useState('');
  const [showNewAccessoryTypeForm, setShowNewAccessoryTypeForm] = useState(false);
  const [newAccessoryName, setNewAccessoryName] = useState('');
  const [newAccessoryPricePerUnit, setNewAccessoryPricePerUnit] = useState('25000');
  const [newAccessoryDesc, setNewAccessoryDesc] = useState('');
  const [refillForm, setRefillForm] = useState({ cylinderId: '', vendorId: '', cost: '', sendDate: '' });
  const [isNewVendor, setIsNewVendor] = useState(false);
  const [newVendorCompanyName, setNewVendorCompanyName] = useState('');
  const [newVendorPhone, setNewVendorPhone] = useState('');
  const [newVendorAddress, setNewVendorAddress] = useState('');
  const [saleForm, setSaleForm] = useState({ customerId: '', productId: '', qty: '1', paymentMethod: 'Tunai' as const, serviceType: 'Kios' as 'Kios' | 'Antar' });
  const [expenseForm, setExpenseForm] = useState({ category: 'Operational' as const, description: '', amount: '', date: '' });

  // Greetings helper
  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return 'Selamat Pagi';
    if (hours < 15) return 'Selamat Siang';
    if (hours < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  // Calculations
  const activeRentalsCount = rentals.filter(r => r.status === 'Active' || r.status === 'Overdue').length;
  const availableCylindersCount = cylinders.filter(c => c.status === 'Available').length;
  const atVendorCount = cylinders.filter(c => c.status === 'At Vendor').length;
  const maintenanceCount = cylinders.filter(c => c.status === 'Maintenance').length;
  const lowStockProductsCount = products.filter(p => p.stock < 10).length;

  // Breakdown of rented inventory matching backend logic
  const rentedBigCylindersCount = cylinders.filter(c => 
    c.status === 'Rented' && 
    (c.size || '').toUpperCase() === '6M3'
  ).length;

  const rentedRegulatorsCount = cylinders.filter(c => 
    c.status === 'Rented' && 
    (((c.serialNo || '').toUpperCase().startsWith('REG-') || (c.size || '').toUpperCase() === 'PCS'))
  ).length;

  const rentedSmallCylindersCount = cylinders.filter(c => {
    const statusRented = c.status === 'Rented';
    const sz = (c.size || '').toUpperCase();
    const sn = (c.serialNo || '').toUpperCase();
    return statusRented && 
           sz !== '6M3' && 
           sz !== 'PCS' &&
           !sn.startsWith('REG-') &&
           !sn.startsWith('TRL-') &&
           !sn.startsWith('ACC-');
  }).length;

  // Monthly/Today revenue calculation
  const todayStr = new Date().toISOString().split('T')[0];
  const thisMonthStr = todayStr.substring(0, 7);

  const todayRevenue = transactions
    .filter(t => t.date === todayStr && (t.type === 'Rental' || t.type === 'Sale') && t.status === 'Completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyRevenue = transactions
    .filter(t => t.date.startsWith(thisMonthStr) && (t.type === 'Rental' || t.type === 'Sale') && t.status === 'Completed')
    .reduce((sum, t) => sum + t.amount, 0);

  // Yesterday's revenue calculation
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  const yesterdayRevenue = transactions
    .filter(t => t.date === yesterdayStr && (t.type === 'Rental' || t.type === 'Sale') && t.status === 'Completed')
    .reduce((sum, t) => sum + t.amount, 0);

  // Revenue growth percentage vs yesterday
  let revenueGrowthPct = 0;
  if (yesterdayRevenue > 0) {
    revenueGrowthPct = ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100;
  } else if (todayRevenue > 0) {
    revenueGrowthPct = 100;
  }

  // Active rentals count 7 days ago vs today
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekAgoStr = weekAgo.toISOString().split('T')[0];

  const activeRentalsWeekAgoCount = rentals.filter(r => {
    const isRentingBefore = r.rentDate <= weekAgoStr;
    const isNotReturnedYet = !r.actualReturnDate || r.actualReturnDate > weekAgoStr;
    return isRentingBefore && isNotReturnedYet;
  }).length;

  let activeRentalsGrowthPct = 0;
  if (activeRentalsWeekAgoCount > 0) {
    activeRentalsGrowthPct = ((activeRentalsCount - activeRentalsWeekAgoCount) / activeRentalsWeekAgoCount) * 100;
  } else if (activeRentalsCount > 0) {
    activeRentalsGrowthPct = 100;
  }

  // Dynamically calculate monthly revenue data for charts based on last 6 months
  const getMonthlyRevenueData = () => {
    const result = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleString('id-ID', { month: 'short' });
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const yearMonth = `${year}-${month}`;

      const value = transactions
        .filter(t => t.date.startsWith(yearMonth) && (t.type === 'Rental' || t.type === 'Sale') && t.status === 'Completed')
        .reduce((sum, t) => sum + t.amount, 0);

      result.push({ label, value });
    }
    return result;
  };

  const monthlyRevenueData = getMonthlyRevenueData();

  const cylinderStatusData = [
    { label: 'Tersedia', value: availableCylindersCount },
    { label: 'Disewa', value: activeRentalsCount },
    { label: 'Di Vendor Refill', value: atVendorCount },
    { label: 'Maintanance', value: maintenanceCount }
  ];

  // Quick Action form submissions
  const handleRentalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let targetCustomerId = rentalForm.customerId;
    let targetCylinderId = rentalForm.cylinderId;

    if (isNewCustomer) {
      if (!newCustName.trim() || !newCustPhone.trim() || !newCustAddress.trim()) {
        alert('Harap isi semua kolom wajib untuk pelanggan baru.');
        return;
      }
    } else {
      if (!targetCustomerId) {
        alert('Harap pilih customer.');
        return;
      }
    }

    if (isNewCylinder) {
      if (!newCylinderSerialNo.trim()) {
        alert(activeDrawer === 'accessory-rental' ? 'Harap isi nomor serial untuk aksesoris baru.' : 'Harap isi nomor serial untuk tabung baru.');
        return;
      }
      if (activeDrawer === 'accessory-rental') {
        if (showNewAccessoryTypeForm) {
          if (!newAccessoryName.trim() || !newAccessoryPricePerUnit.trim()) {
            alert('Harap isi nama dan harga sewa untuk tipe aksesoris baru.');
            return;
          }
        } else {
          if (!newCylinderType) {
            alert('Harap pilih tipe aksesoris.');
            return;
          }
        }
      }
    } else {
      if (!targetCylinderId) {
        alert(activeDrawer === 'accessory-rental' ? 'Harap pilih aksesoris.' : 'Harap pilih tabung oksigen.');
        return;
      }
    }

    if (!rentalForm.rentDate || !rentalForm.returnDate) {
      alert('Harap isi semua kolom wajib.');
      return;
    }

    setIsSaving(true);
    try {
      if (isNewCustomer) {
        // Create new customer on the fly
        const newCust = await addCustomer({
          name: newCustName.trim(),
          phone: newCustPhone.trim(),
          address: newCustAddress.trim(),
        });
        targetCustomerId = newCust.id;
      }

      if (isNewCylinder) {
        let finalCylinderType = '';
        if (activeDrawer === 'accessory-rental') {
          if (showNewAccessoryTypeForm) {
            let finalName = newAccessoryName.trim();
            const lowerName = finalName.toLowerCase();
            if (!lowerName.includes('sewa') && !lowerName.includes('regulator') && !lowerName.includes('troli')) {
              finalName = `Sewa ${finalName}`;
            }
            const ot = await addOxygenType({
              name: finalName,
              purity: 0,
              pricePerUnit: Number(newAccessoryPricePerUnit),
              description: newAccessoryDesc.trim()
            });
            finalCylinderType = ot.name;
          } else {
            finalCylinderType = newCylinderType;
          }
        }

        // Create new cylinder/accessory on the fly
        const newCyl = await addCylinder({
          serialNo: newCylinderSerialNo.trim(),
          size: activeDrawer === 'accessory-rental' ? 'Pcs' : newCylinderSize,
          oxygenType: activeDrawer === 'accessory-rental' ? finalCylinderType : 'Medical Oxygen 99.5%',
          lastInspection: new Date().toISOString().split('T')[0],
          status: 'Available'
        });
        targetCylinderId = newCyl.id;
      }

      await createRental({
        customerId: targetCustomerId,
        cylinderId: targetCylinderId,
        rentDate: rentalForm.rentDate,
        returnDate: rentalForm.returnDate,
        deposit: Number(rentalForm.deposit) || 0,
        rentalFee: Number(rentalForm.rentalFee) || 0,
        paymentMethod: rentalForm.paymentMethod || 'Tunai',
        serviceType: rentalForm.serviceType
      });
      setActiveDrawer(null);
      setRentalForm({ customerId: '', cylinderId: '', rentDate: '', returnDate: '', deposit: '', rentalFee: '', paymentMethod: 'Tunai', serviceType: 'Kios' });
      setIsNewCustomer(false);
      setNewCustName('');
      setNewCustPhone('');
      setNewCustAddress('');
      setIsNewCylinder(false);
      setNewCylinderSerialNo('');
      setNewCylinderSize('1m3');
      setNewCylinderType('');
      setShowNewAccessoryTypeForm(false);
      setNewAccessoryName('');
      setNewAccessoryPricePerUnit('25000');
      setNewAccessoryDesc('');
    } catch (err: any) {
      alert(err.message || 'Gagal membuat sewa.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRefillSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let targetVendorId = refillForm.vendorId;

    if (isNewVendor) {
      if (!newVendorCompanyName.trim() || !newVendorPhone.trim()) {
        alert('Harap isi semua kolom wajib untuk vendor baru.');
        return;
      }
    } else {
      if (!targetVendorId) {
        alert('Harap pilih vendor refill.');
        return;
      }
    }

    if (!refillForm.cylinderId || !refillForm.sendDate) {
      alert('Harap isi semua kolom wajib.');
      return;
    }

    setIsSaving(true);
    try {
      if (isNewVendor) {
        // Create new vendor on the fly
        const newVend = await addVendor({
          companyName: newVendorCompanyName.trim(),
          name: newVendorCompanyName.trim(),
          phone: newVendorPhone.trim(),
          address: newVendorAddress.trim(),
          email: `${newVendorCompanyName.toLowerCase().replace(/\s/g, '')}@vendor.com`,
          status: 'Active'
        });
        targetVendorId = newVend.id;
      }

      await sendToRefill({
        cylinderId: refillForm.cylinderId,
        vendorId: targetVendorId,
        cost: Number(refillForm.cost) || 0,
        sendDate: refillForm.sendDate
      });
      setActiveDrawer(null);
      setRefillForm({ cylinderId: '', vendorId: '', cost: '', sendDate: '' });
      setIsNewVendor(false);
      setNewVendorCompanyName('');
      setNewVendorPhone('');
      setNewVendorAddress('');
    } catch (err: any) {
      alert(err.message || 'Gagal mengirim refill.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!saleForm.customerId || !saleForm.productId) {
      alert('Harap isi semua kolom wajib.');
      return;
    }
    const product = products.find(p => p.id === saleForm.productId);
    if (!product) return;

    setIsSaving(true);
    try {
      await createSale({
        customerId: saleForm.customerId,
        items: [{
          productId: saleForm.productId,
          name: product.name,
          qty: Number(saleForm.qty),
          price: product.price
        }],
        date: new Date().toISOString().split('T')[0],
        paymentMethod: saleForm.paymentMethod,
        serviceType: saleForm.serviceType || 'Kios'
      });
      setActiveDrawer(null);
      setSaleForm({ customerId: '', productId: '', qty: '1', paymentMethod: 'Tunai', serviceType: 'Kios' });
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan penjualan.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseForm.description || !expenseForm.amount || !expenseForm.date) {
      alert('Harap isi semua kolom wajib.');
      return;
    }
    setIsSaving(true);
    try {
      await createExpense({
        category: expenseForm.category,
        description: expenseForm.description,
        amount: Number(expenseForm.amount),
        date: expenseForm.date
      });
      setActiveDrawer(null);
      setExpenseForm({ category: 'Operational', description: '', amount: '', date: '' });
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan pengeluaran.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Welcome banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 bg-card border border-border rounded-xl shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            {getGreeting()}, {user?.fullName ? user.fullName.split(' ')[0] : 'Admin'} <span className="animate-wave origin-[70%_70%] inline-block">👋</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Berikut ringkasan operasional logistik dan sewa tabung oksigen hari ini.
          </p>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">

        {/* Today Revenue */}
        <Card>
          <CardContent className="p-5 pt-5 flex flex-col justify-between h-32">
            <div className="flex justify-between items-start">
              <span className="text-3xs font-bold text-muted-foreground uppercase tracking-wider">Pendapatan Hari Ini</span>
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
            </div>
            <div>
              <p className="text-xl font-bold tracking-tight">{formatRupiah(todayRevenue)}</p>
              {revenueGrowthPct !== 0 ? (
                <p className={`text-4xs font-bold mt-1.5 flex items-center gap-0.5 ${revenueGrowthPct > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                  {revenueGrowthPct > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {revenueGrowthPct > 0 ? '+' : ''}{revenueGrowthPct.toFixed(1)}% <span className="text-muted-foreground font-medium font-sans">vs kemarin</span>
                </p>
              ) : (
                <p className="text-4xs text-muted-foreground font-medium mt-1.5">Sama dengan kemarin</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Active Rentals */}
        <Card>
          <CardContent className="p-5 pt-5 flex flex-col justify-between min-h-32 h-auto">
            <div className="flex justify-between items-start">
              <span className="text-3xs font-bold text-muted-foreground uppercase tracking-wider">Rental Aktif</span>
              <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-500">
                <Clock className="w-3.5 h-3.5" />
              </div>
            </div>
            <div>
              <p className="text-xl font-bold tracking-tight">{activeRentalsCount} <span className="text-2xs text-muted-foreground font-medium">Tabung</span></p>
              <div className="flex gap-1.5 mt-1.5 text-4xs text-muted-foreground font-semibold font-sans">
                <span className="text-purple-600 dark:text-purple-400">Besar: <strong className="text-foreground font-bold">{rentedBigCylindersCount}</strong></span>
                <span>•</span>
                <span className="text-blue-600 dark:text-blue-400">Kecil: <strong className="text-foreground font-bold">{rentedSmallCylindersCount}</strong></span>
                <span>•</span>
                <span className="text-pink-600 dark:text-pink-400">Reg: <strong className="text-foreground font-bold">{rentedRegulatorsCount}</strong></span>
              </div>
              {activeRentalsGrowthPct !== 0 ? (
                <p className={`text-4xs font-bold mt-1.5 flex items-center gap-0.5 ${activeRentalsGrowthPct > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                  {activeRentalsGrowthPct > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {activeRentalsGrowthPct > 0 ? '+' : ''}{activeRentalsGrowthPct.toFixed(1)}% <span className="text-muted-foreground font-medium font-sans">vs mgg lalu</span>
                </p>
              ) : (
                <p className="text-4xs text-muted-foreground font-medium mt-1.5">Stabil vs mgg lalu</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Available Cylinders */}
        <Card>
          <CardContent className="p-5 pt-5 flex flex-col justify-between h-32">
            <div className="flex justify-between items-start">
              <span className="text-3xs font-bold text-muted-foreground uppercase tracking-wider">Tabung Tersedia</span>
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                <Database className="w-3.5 h-3.5" />
              </div>
            </div>
            <div>
              <p className="text-xl font-bold tracking-tight">{availableCylindersCount} <span className="text-2xs text-muted-foreground font-medium">Unit</span></p>
              <p className="text-4xs text-emerald-600 dark:text-emerald-400 font-bold mt-1.5 flex items-center gap-0.5">
                <CheckCircle2 className="w-3 h-3" /> Ready disewa
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Cylinders at Vendor */}
        <Card>
          <CardContent className="p-5 pt-5 flex flex-col justify-between h-32">
            <div className="flex justify-between items-start">
              <span className="text-3xs font-bold text-muted-foreground uppercase tracking-wider">Tabung di Vendor</span>
              <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
                <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
              </div>
            </div>
            <div>
              <p className="text-xl font-bold tracking-tight">{atVendorCount} <span className="text-2xs text-muted-foreground font-medium">Unit</span></p>
              <p className="text-4xs text-muted-foreground font-medium mt-1.5">
                Sedang antre refill gas
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Low Stock */}
        <Card>
          <CardContent className="p-5 pt-5 flex flex-col justify-between h-32">
            <div className="flex justify-between items-start">
              <span className="text-3xs font-bold text-muted-foreground uppercase tracking-wider">Stok Menipis</span>
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
                <AlertTriangle className="w-3.5 h-3.5" />
              </div>
            </div>
            <div>
              <p className="text-xl font-bold tracking-tight">{lowStockProductsCount} <span className="text-2xs text-muted-foreground font-medium">Produk</span></p>
              <p className="text-4xs font-bold mt-1.5 flex items-center gap-0.5">
                {lowStockProductsCount > 0 ? (
                  <span className="text-amber-500">Butuh restock segera</span>
                ) : (
                  <span className="text-emerald-500">Stok barang aman</span>
                )}
              </p>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Quick Action Panel */}
      {(() => {
        const userRole = String(user?.role?.name || user?.role || 'OWNER').toUpperCase();
        const quickActions = [
          { label: 'Sewa Tabung Baru', icon: <Plus className="w-3.5 h-3.5" />, onClick: () => setActiveDrawer('rental'), roles: ['OWNER', 'ADMIN', 'WAREHOUSE'], primary: true },
          { label: 'Sewa Aksesoris Baru', icon: <Plus className="w-3.5 h-3.5" />, onClick: () => setActiveDrawer('accessory-rental'), roles: ['OWNER', 'ADMIN', 'WAREHOUSE'], primary: true },
          { label: 'Kembalikan Tabung', icon: <Clock className="w-3.5 h-3.5 text-orange-500" />, onClick: () => router.push('/transactions?tab=return'), roles: ['OWNER', 'ADMIN', 'WAREHOUSE'] },
          { label: 'Kirim Refill Vendor', icon: <RefreshCw className="w-3.5 h-3.5 text-blue-500" />, onClick: () => setActiveDrawer('refill'), roles: ['OWNER', 'ADMIN', 'WAREHOUSE'] },
          { label: 'POS Kasir Ritel', icon: <DollarSign className="w-3.5 h-3.5 text-purple-500" />, onClick: () => setActiveDrawer('sale'), roles: ['OWNER', 'ADMIN', 'FINANCE'] },
          { label: 'Beli Restock Baru', icon: <PackageCheck className="w-3.5 h-3.5 text-emerald-500" />, onClick: () => router.push('/transactions?tab=restock'), roles: ['OWNER', 'ADMIN', 'WAREHOUSE'] },
          { label: 'Catat Kas Keluar', icon: <FileText className="w-3.5 h-3.5 text-rose-500" />, onClick: () => setActiveDrawer('expense'), roles: ['OWNER', 'ADMIN', 'FINANCE'] },
        ].filter(a => !a.roles || a.roles.includes(userRole));

        return (
          <div className="p-4 bg-card border border-border/80 rounded-xl space-y-3 shadow-xs">
            <div className="flex items-center">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Pintasan Cepat</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
              {quickActions.map(a => (
                <Button
                  key={a.label}
                  size="sm"
                  variant={a.primary ? 'primary' : 'secondary'}
                  className={`flex items-center justify-center gap-1.5 w-full text-center text-xs h-9 cursor-pointer transition-all ${!a.primary ? ' border border-border hover:bg-muted' : ''}`}
                  onClick={a.onClick}
                >
                  {a.icon}
                  <span className="truncate">{a.label}</span>
                </Button>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 gap-6">

        {/* Revenue Area Chart - Full Width */}
        <Card>
          <CardHeader>
            <CardTitle>Tren Pendapatan Operasional</CardTitle>
            <CardDescription>Grafik pertumbuhan kas masuk (Sewa & POS) 6 bulan terakhir</CardDescription>
          </CardHeader>
          <CardContent>
            <AreaChart data={monthlyRevenueData} height={220} color="#10b981" />
          </CardContent>
        </Card>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Transactions Ledger */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Transaksi Terbaru</CardTitle>
              <CardDescription>Daftar transaksi kasir terbaru</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => router.push('/transactions')}>
              Lihat Semua
            </Button>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border/60">
              {transactions.slice(0, 5).map(tx => {
                const colors = {
                  Rental: 'success',
                  Refill: 'info',
                  Purchase: 'warning',
                  Sale: 'default',
                  Expense: 'destructive'
                };
                return (
                  <div key={tx.id} className="flex justify-between items-center py-3">
                    <div>
                      <p className="text-xs font-semibold text-foreground">{tx.description}</p>
                      <p className="text-3xs text-muted-foreground mt-0.5">{tx.date} • {tx.id}</p>
                    </div>
                    <div className="flex items-center gap-3.5">
                      <Badge variant={colors[tx.type] as any}>{tx.type}</Badge>
                      <span className="text-xs font-bold">{formatRupiah(tx.amount)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Log Movements */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Aktivitas Logistik</CardTitle>
              <CardDescription>Riwayat pergerakan keluar masuk tabung</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => router.push('/stock-movements')}>
              Lihat Gudang
            </Button>
          </CardHeader>
          <CardContent>
            <div className="relative border-l border-border pl-4 space-y-4 py-2 ml-2">
              {stockMovements.slice(0, 4).map(mvt => (
                <div key={mvt.id} className="relative">
                  <span className={`absolute -left-[21px] mt-1 flex h-2.5 w-2.5 rounded-full ring-4 ring-card ${mvt.type === 'Incoming' ? 'bg-emerald-500' : mvt.type === 'Outgoing' ? 'bg-blue-500' : 'bg-amber-500'
                    }`} />
                  <div>
                    <p className="text-xs font-semibold text-foreground">{mvt.reason}</p>
                    <p className="text-3xs text-muted-foreground mt-0.5">
                      Item: <span className="font-bold">{mvt.itemName}</span> ({mvt.itemId}) • Qty: {mvt.quantity} • {mvt.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>

      {/* DRAWERS (Forms Implementation) */}

      {/* 1. SEWA TABUNG & AKSESORIS DRAWER */}
      <Drawer
        isOpen={activeDrawer === 'rental' || activeDrawer === 'accessory-rental'}
        onClose={() => {
          setActiveDrawer(null);
          setIsNewCustomer(false);
          setNewCustName('');
          setNewCustPhone('');
          setNewCustAddress('');
          setIsNewCylinder(false);
          setNewCylinderSerialNo('');
          setNewCylinderSize('1m3');
          setNewCylinderType('');
          setShowNewAccessoryTypeForm(false);
          setNewAccessoryName('');
          setNewAccessoryPricePerUnit('25000');
          setNewAccessoryDesc('');
        }}
        title={activeDrawer === 'accessory-rental' ? 'Buat Kontrak Sewa Aksesoris Baru' : 'Buat Kontrak Sewa Tabung Baru'}
      >
        <form onSubmit={handleRentalSubmit} className="space-y-4">
          {/* Select/Input Customer Toggle */}
          <div className="space-y-1.5 w-full">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Customer *
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsNewCustomer(!isNewCustomer);
                  setRentalForm(prev => ({ ...prev, customerId: '' }));
                  setNewCustName('');
                  setNewCustPhone('');
                  setNewCustAddress('');
                }}
                className="text-xs text-primary hover:underline font-medium cursor-pointer flex items-center gap-1"
              >
                {isNewCustomer ? (
                  <>
                    <Database className="w-3.5 h-3.5" />
                    <span>Pilih dari Daftar</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Pelanggan Baru</span>
                  </>
                )}
              </button>
            </div>

            {isNewCustomer ? (
              <div className="space-y-3 bg-muted/20 p-3 rounded-lg border border-border/80">
                <Input
                  label="Nama Lengkap *"
                  id="newCustName"
                  placeholder="e.g. Budi Santoso"
                  value={newCustName}
                  onChange={e => setNewCustName(e.target.value)}
                  required
                />
                <Input
                  label="WhatsApp / No Telp *"
                  id="newCustPhone"
                  placeholder="e.g. 08123456789"
                  value={newCustPhone}
                  onChange={e => setNewCustPhone(e.target.value)}
                  required
                />
                <Textarea
                  label="Alamat Lengkap Pengiriman *"
                  id="newCustAddress"
                  placeholder="Alamat rumah / lokasi pengiriman tabung..."
                  value={newCustAddress}
                  onChange={e => setNewCustAddress(e.target.value)}
                  required
                />
              </div>
            ) : (
              <Select
                id="rentCust"
                value={rentalForm.customerId}
                onChange={e => setRentalForm({ ...rentalForm, customerId: e.target.value })}
                options={[
                  { value: '', label: '-- Pilih Pelanggan --' },
                  ...customers.map(c => ({ value: c.id, label: c.phone ? `${c.name} - ${c.phone}` : c.name }))
                ]}
              />
            )}
          </div>
          <div className="space-y-1.5 w-full">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {activeDrawer === 'accessory-rental' ? "Pilih Aksesoris *" : "Pilih Tabung Oksigen *"}
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsNewCylinder(!isNewCylinder);
                  setRentalForm(prev => ({ ...prev, cylinderId: '' }));
                  setNewCylinderSerialNo('');
                  setNewCylinderSize(activeDrawer === 'accessory-rental' ? 'Pcs' : '1m3');
                  setNewCylinderType('');
                  setShowNewAccessoryTypeForm(false);
                  setNewAccessoryName('');
                  setNewAccessoryPricePerUnit('25000');
                  setNewAccessoryDesc('');
                }}
                className="text-xs text-primary hover:underline font-medium cursor-pointer flex items-center gap-1"
              >
                {isNewCylinder ? (
                  <>
                    <Database className="w-3.5 h-3.5" />
                    <span>Pilih dari Daftar</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span>{activeDrawer === 'accessory-rental' ? 'Aksesoris Baru' : 'Tabung Baru'}</span>
                  </>
                )}
              </button>
            </div>

            {isNewCylinder ? (
              activeDrawer === 'accessory-rental' ? (
                <div className="space-y-3 bg-muted/20 p-3 rounded-lg border border-border/80">
                  <Input
                    label="Nomor Serial Aksesoris (SN) *"
                    id="newCylinderSerialNo"
                    placeholder="e.g. REG-NES-001"
                    value={newCylinderSerialNo}
                    onChange={e => setNewCylinderSerialNo(e.target.value)}
                    required
                  />
                  {showNewAccessoryTypeForm ? (
                    <div className="p-3 border border-border bg-muted/10 rounded-lg space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-foreground">Tipe Aksesoris Baru</span>
                        <button
                          type="button"
                          onClick={() => {
                            setShowNewAccessoryTypeForm(false);
                            setNewAccessoryName('');
                            setNewAccessoryPricePerUnit('25000');
                            setNewAccessoryDesc('');
                          }}
                          className="text-xs text-primary font-semibold hover:underline"
                        >
                          ← Pilih Tipe
                        </button>
                      </div>
                      <Input
                        label="Nama Aksesoris *"
                        id="newAccName"
                        placeholder="e.g. Sewa Humidifier Medis"
                        value={newAccessoryName}
                        onChange={e => setNewAccessoryName(e.target.value)}
                        required
                      />
                      <Input
                        label="Biaya Sewa per Unit (Rp) *"
                        id="newAccPrice"
                        isRupiah={true}
                        placeholder="e.g. 25000"
                        value={newAccessoryPricePerUnit}
                        onChange={e => setNewAccessoryPricePerUnit(e.target.value)}
                        required
                      />
                      <Textarea
                        label="Keterangan / Deskripsi"
                        id="newAccDesc"
                        placeholder="e.g. Sewa botol pelembab udara"
                        value={newAccessoryDesc}
                        onChange={e => setNewAccessoryDesc(e.target.value)}
                      />
                    </div>
                  ) : (
                    <div className="space-y-1.5 w-full">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Nama / Tipe Aksesoris *
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowNewAccessoryTypeForm(true)}
                          className="text-xs text-primary font-semibold hover:underline"
                        >
                          + Tipe Baru
                        </button>
                      </div>
                      <Select
                        id="newCylinderType"
                        value={newCylinderType}
                        onChange={e => setNewCylinderType(e.target.value)}
                        options={[
                          { value: '', label: '-- Pilih Tipe Aksesoris --' },
                          ...oxygenTypes
                            .filter(t => t.name.toLowerCase().includes('sewa') || t.name.toLowerCase().includes('regulator') || t.name.toLowerCase().includes('troli'))
                            .map(t => ({ value: t.name, label: t.name }))
                        ]}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3 bg-muted/20 p-3 rounded-lg border border-border/80">
                  <Input
                    label="Nomor Serial Tabung (SN) *"
                    id="newCylinderSerialNo"
                    placeholder="e.g. SN-OX-9999"
                    value={newCylinderSerialNo}
                    onChange={e => setNewCylinderSerialNo(e.target.value)}
                    required
                  />
                  <Select
                    label="Ukuran Volume Tabung *"
                    id="newCylinderSize"
                    value={newCylinderSize as any}
                    onChange={e => setNewCylinderSize(e.target.value as any)}
                    options={[
                      { value: '1m3', label: '1 m³' },
                      { value: '2m3', label: '2 m³' },
                      { value: '6m3', label: '6 m³' }
                    ]}
                  />
                </div>
              )
            ) : (
              <Select
                id="rentCylinder"
                value={rentalForm.cylinderId}
                onChange={e => setRentalForm({ ...rentalForm, cylinderId: e.target.value })}
                options={[
                  { value: '', label: activeDrawer === 'accessory-rental' ? '-- Pilih Aksesoris --' : '-- Pilih Tabung --' },
                  ...cylinders
                    .filter(c => {
                      const isAcc = isAccessoryAsset(c.serialNo, c.size);
                      return activeDrawer === 'accessory-rental' ? isAcc : !isAcc;
                    })
                    .map(c => {
                      const statusLabel = c.status === 'Available' ? 'Tersedia' : c.status;
                      return {
                        value: c.id,
                        label: `${c.serialNo} (${c.size}) - [${statusLabel}]`,
                        disabled: c.status !== 'Available'
                      };
                    })
                ]}
              />
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Tanggal Sewa *"
              id="rentDate"
              type="date"
              value={rentalForm.rentDate}
              onChange={e => setRentalForm({ ...rentalForm, rentDate: e.target.value })}
            />
            <Input
              label="Batas Pengembalian *"
              id="returnDate"
              type="date"
              value={rentalForm.returnDate}
              onChange={e => setRentalForm({ ...rentalForm, returnDate: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Uang Jaminan (Deposit) (Rp)"
              id="rentDeposit"
              isRupiah={true}
              placeholder="e.g. 200.000"
              value={rentalForm.deposit}
              onChange={e => setRentalForm({ ...rentalForm, deposit: e.target.value })}
            />
            <Input
              label="Biaya Sewa (Rp) *"
              id="rentFee"
              isRupiah={true}
              placeholder="e.g. 50.000"
              value={rentalForm.rentalFee}
              onChange={e => setRentalForm({ ...rentalForm, rentalFee: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Metode Pembayaran *"
              id="rentPayMethod"
              value={rentalForm.paymentMethod || 'Tunai'}
              onChange={e => setRentalForm({ ...rentalForm, paymentMethod: e.target.value as any })}
              options={[
                { value: 'Tunai', label: 'Tunai' },
                { value: 'QRIS', label: 'QRIS' },
                { value: 'Transfer', label: 'Transfer' }
              ]}
            />
            <Select
              label="Tipe Layanan *"
              id="rentServiceType"
              value={rentalForm.serviceType || 'Kios'}
              onChange={e => setRentalForm({ ...rentalForm, serviceType: e.target.value as any })}
              options={[
                { value: 'Kios', label: 'Ambil di Kios' },
                { value: 'Antar', label: 'Kirim / Antar Alamat' }
              ]}
            />
          </div>
          <div className="border-t border-border pt-4 flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setActiveDrawer(null)} disabled={isSaving}>Batal</Button>
            <Button type="submit" variant="success" className="flex-1" disabled={isSaving}>
              {isSaving ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Memproses...</span>
                </div>
              ) : (
                'Buat Sewa'
              )}
            </Button>
          </div>
        </form>
      </Drawer>

      {/* 2. KIRIM REFILL DRAWER */}
      <Drawer isOpen={activeDrawer === 'refill'} onClose={() => setActiveDrawer(null)} title="Kirim Tabung Kosong ke Vendor">
        <form onSubmit={handleRefillSubmit} className="space-y-4">
          <Select
            label="Pilih Tabung Oksigen (Kosong/Maintenance) *"
            id="refillCyl"
            value={refillForm.cylinderId}
            onChange={e => setRefillForm({ ...refillForm, cylinderId: e.target.value })}
            options={[
              { value: '', label: '-- Pilih Tabung --' },
              ...cylinders.map(c => {
                let statusLabel = 'Tersedia';
                if (c.status === 'Rented') statusLabel = 'Sedang Disewa';
                if (c.status === 'At Vendor') statusLabel = 'Di Pabrik Vendor';
                if (c.status === 'Maintenance') statusLabel = 'Perawatan';
                if (c.status === 'Empty') statusLabel = 'Kosong';

                const canRefill = c.status === 'Empty' || c.status === 'Maintenance';
                return {
                  value: c.id,
                  label: `${c.serialNo} (${c.size}) - [${statusLabel}]`,
                  disabled: !canRefill
                };
              })
            ]}
          />
          <div className="space-y-1.5 w-full">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Pilih Mitra Vendor Refill *
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsNewVendor(!isNewVendor);
                  setRefillForm(prev => ({ ...prev, vendorId: '' }));
                  setNewVendorCompanyName('');
                  setNewVendorPhone('');
                  setNewVendorAddress('');
                }}
                className="text-xs text-primary hover:underline font-medium cursor-pointer flex items-center gap-1"
              >
                {isNewVendor ? (
                  <>
                    <Database className="w-3.5 h-3.5" />
                    <span>Pilih dari Daftar</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Mitra Vendor Baru</span>
                  </>
                )}
              </button>
            </div>

            {isNewVendor ? (
              <div className="space-y-3 bg-muted/20 p-3 rounded-lg border border-border/80">
                <Input
                  label="Nama Perusahaan Vendor *"
                  id="newVendorCompanyName"
                  placeholder="e.g. CV Oksigen Utama"
                  value={newVendorCompanyName}
                  onChange={e => setNewVendorCompanyName(e.target.value)}
                  required
                />
                <Input
                  label="WhatsApp / No Telp *"
                  id="newVendorPhone"
                  placeholder="e.g. 08123456789"
                  value={newVendorPhone}
                  onChange={e => setNewVendorPhone(e.target.value)}
                  required
                />
                <Textarea
                  label="Alamat Lengkap Vendor"
                  id="newVendorAddress"
                  placeholder="Alamat kantor / pabrik pengisian..."
                  value={newVendorAddress}
                  onChange={e => setNewVendorAddress(e.target.value)}
                />
              </div>
            ) : (
              <Select
                id="refillVendor"
                value={refillForm.vendorId}
                onChange={e => setRefillForm({ ...refillForm, vendorId: e.target.value })}
                options={[
                  { value: '', label: '-- Pilih Vendor Refill --' },
                  ...vendors.map(v => ({ value: v.id, label: v.companyName }))
                ]}
              />
            )}
          </div>
          <Input
            label="Biaya Refill Oksigen (Rp) *"
            id="refillCost"
            isRupiah={true}
            placeholder="e.g. 80.000"
            value={refillForm.cost}
            onChange={e => setRefillForm({ ...refillForm, cost: e.target.value })}
          />
          <Input
            label="Tanggal Pengiriman *"
            id="refillDate"
            type="date"
            value={refillForm.sendDate}
            onChange={e => setRefillForm({ ...refillForm, sendDate: e.target.value })}
          />
          <div className="border-t border-border pt-4 flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setActiveDrawer(null)} disabled={isSaving}>Batal</Button>
            <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" disabled={isSaving}>
              {isSaving ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Memproses...</span>
                </div>
              ) : (
                'Kirim Refill'
              )}
            </Button>
          </div>
        </form>
      </Drawer>

      {/* 3. JUAL AKSESORIS DRAWER */}
      <Drawer isOpen={activeDrawer === 'sale'} onClose={() => setActiveDrawer(null)} title="Transaksi Penjualan Retail">
        <form onSubmit={handleSaleSubmit} className="space-y-4">
          <Select
            label="Pilih Pelanggan *"
            id="saleCust"
            value={saleForm.customerId}
            onChange={e => setSaleForm({ ...saleForm, customerId: e.target.value })}
            options={[
              { value: '', label: '-- Pilih Pelanggan --' },
              ...customers.map(c => ({ value: c.id, label: c.phone ? `${c.name} - ${c.phone}` : c.name }))
            ]}
          />
          <Select
            label="Pilih Produk / Aksesoris *"
            id="saleProd"
            value={saleForm.productId}
            onChange={e => setSaleForm({ ...saleForm, productId: e.target.value })}
            options={[
              { value: '', label: '-- Pilih Produk --' },
              ...products.filter(p => p.stock > 0).map(p => ({ value: p.id, label: `${p.name} (Stok: ${p.stock} | ${formatRupiah(p.price)})` }))
            ]}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Jumlah Jual (Qty) *"
              id="saleQty"
              type="number"
              min="1"
              value={saleForm.qty}
              onChange={e => setSaleForm({ ...saleForm, qty: e.target.value })}
            />
            <Select
              label="Metode Pembayaran *"
              id="salePayment"
              value={saleForm.paymentMethod}
              onChange={e => setSaleForm({ ...saleForm, paymentMethod: e.target.value as any })}
              options={[
                { value: 'Tunai', label: 'Tunai' },
                { value: 'QRIS', label: 'QRIS' },
                { value: 'Transfer', label: 'Transfer' }
              ]}
            />
          </div>
          <Select
            label="Tipe Layanan *"
            id="saleServiceType"
            value={saleForm.serviceType || 'Kios'}
            onChange={e => setSaleForm({ ...saleForm, serviceType: e.target.value as any })}
            options={[
              { value: 'Kios', label: 'Ambil di Kios' },
              { value: 'Antar', label: 'Kirim / Antar Alamat' }
            ]}
          />
          <div className="border-t border-border pt-4 flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setActiveDrawer(null)} disabled={isSaving}>Batal</Button>
            <Button type="submit" variant="success" className="flex-1" disabled={isSaving}>
              {isSaving ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Memproses...</span>
                </div>
              ) : (
                'Simpan Penjualan'
              )}
            </Button>
          </div>
        </form>
      </Drawer>

      {/* 4. CATAT PENGELUARAN DRAWER */}
      <Drawer isOpen={activeDrawer === 'expense'} onClose={() => setActiveDrawer(null)} title="Catat Pengeluaran Baru">
        <form onSubmit={handleExpenseSubmit} className="space-y-4">
          <Select
            label="Kategori Pengeluaran *"
            id="expCat"
            value={expenseForm.category}
            onChange={e => setExpenseForm({ ...expenseForm, category: e.target.value as any })}
            options={[
              { value: 'Operational', label: 'Operasional Gudang / Supir' },
              { value: 'Utilities', label: 'Listrik / Air / Internet' },
              { value: 'Rent', label: 'Sewa Ruko / Kantor' },
              { value: 'Marketing', label: 'Pemasaran & Brosur' },
              { value: 'Salaries', label: 'Gaji Karyawan' },
              { value: 'Other', label: 'Lain-lain' }
            ]}
          />
          <Input
            label="Deskripsi / Keperluan *"
            id="expDesc"
            placeholder="e.g. Pembelian bensin mobil tangki"
            value={expenseForm.description}
            onChange={e => setExpenseForm({ ...expenseForm, description: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Total Nominal (Rp) *"
              id="expAmt"
              isRupiah={true}
              placeholder="e.g. 150.000"
              value={expenseForm.amount}
              onChange={e => setExpenseForm({ ...expenseForm, amount: e.target.value })}
            />
            <Input
              label="Tanggal Pengeluaran *"
              id="expDate"
              type="date"
              value={expenseForm.date}
              onChange={e => setExpenseForm({ ...expenseForm, date: e.target.value })}
            />
          </div>
          <div className="border-t border-border pt-4 flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setActiveDrawer(null)} disabled={isSaving}>Batal</Button>
            <Button type="submit" variant="destructive" className="flex-1" disabled={isSaving}>
              {isSaving ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Memproses...</span>
                </div>
              ) : (
                'Catat Kas Keluar'
              )}
            </Button>
          </div>
        </form>
      </Drawer>

    </div>
  );
}
