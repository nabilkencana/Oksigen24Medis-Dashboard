'use client';

import React, { useState } from 'react';
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
  PackageCheck
} from 'lucide-react';

export default function Home() {
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
    createRental,
    sendToRefill,
    createSale,
    createExpense,
    user
  } = useData();

  // Drawer states
  const [activeDrawer, setActiveDrawer] = useState<'rental' | 'refill' | 'sale' | 'expense' | null>(null);

  // Form states
  const [rentalForm, setRentalForm] = useState({ customerId: '', cylinderId: '', rentDate: '', returnDate: '', deposit: '', rentalFee: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [refillForm, setRefillForm] = useState({ cylinderId: '', vendorId: '', cost: '', sendDate: '' });
  const [saleForm, setSaleForm] = useState({ customerId: '', productId: '', qty: '1', paymentMethod: 'Cash' as const });
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

  // Monthly/Today revenue calculation
  const todayStr = new Date().toISOString().split('T')[0];
  const thisMonthStr = todayStr.substring(0, 7);

  const todayRevenue = transactions
    .filter(t => t.date === todayStr && (t.type === 'Rental' || t.type === 'Sale') && t.status === 'Completed')
    .reduce((sum, t) => sum + t.amount, 0) || 1250000; // fallback dummy today

  const monthlyRevenue = transactions
    .filter(t => t.date.startsWith(thisMonthStr) && (t.type === 'Rental' || t.type === 'Sale') && t.status === 'Completed')
    .reduce((sum, t) => sum + t.amount, 0) || 48900000; // fallback monthly

  // Charts data compilation
  const monthlyRevenueData = [
    { label: 'Jan', value: 34000000 },
    { label: 'Feb', value: 38000000 },
    { label: 'Mar', value: 42000000 },
    { label: 'Apr', value: 45000000 },
    { label: 'May', value: 41000000 },
    { label: 'Jun', value: 48900000 }
  ];

  const rentalTrendData = [
    { label: 'Mon', value: 12 },
    { label: 'Tue', value: 18 },
    { label: 'Wed', value: 15 },
    { label: 'Thu', value: 22 },
    { label: 'Fri', value: 26 },
    { label: 'Sat', value: 14 },
    { label: 'Sun', value: 8 }
  ];

  const cylinderStatusData = [
    { label: 'Tersedia', value: availableCylindersCount },
    { label: 'Disewa', value: activeRentalsCount },
    { label: 'Di Vendor Refill', value: atVendorCount },
    { label: 'Maintanance', value: maintenanceCount }
  ];

  // Quick Action form submissions
  const handleRentalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rentalForm.customerId || !rentalForm.cylinderId || !rentalForm.rentDate || !rentalForm.returnDate) {
      alert('Harap isi semua kolom wajib.');
      return;
    }
    setIsSaving(true);
    try {
      await createRental({
        customerId: rentalForm.customerId,
        cylinderId: rentalForm.cylinderId,
        rentDate: rentalForm.rentDate,
        returnDate: rentalForm.returnDate,
        deposit: Number(rentalForm.deposit) || 0,
        rentalFee: Number(rentalForm.rentalFee) || 0
      });
      setActiveDrawer(null);
      setRentalForm({ customerId: '', cylinderId: '', rentDate: '', returnDate: '', deposit: '', rentalFee: '' });
    } catch (err: any) {
      alert(err.message || 'Gagal membuat sewa.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRefillSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refillForm.cylinderId || !refillForm.vendorId || !refillForm.sendDate) {
      alert('Harap isi semua kolom wajib.');
      return;
    }
    setIsSaving(true);
    try {
      await sendToRefill({
        cylinderId: refillForm.cylinderId,
        vendorId: refillForm.vendorId,
        cost: Number(refillForm.cost) || 0,
        sendDate: refillForm.sendDate
      });
      setActiveDrawer(null);
      setRefillForm({ cylinderId: '', vendorId: '', cost: '', sendDate: '' });
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
        paymentMethod: saleForm.paymentMethod
      });
      setActiveDrawer(null);
      setSaleForm({ customerId: '', productId: '', qty: '1', paymentMethod: 'Cash' });
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
          <CardContent className="p-5 flex flex-col justify-between h-32">
            <div className="flex justify-between items-start">
              <span className="text-3xs font-bold text-muted-foreground uppercase tracking-wider">Pendapatan Hari Ini</span>
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
            </div>
            <div>
              <p className="text-xl font-bold tracking-tight">{formatRupiah(todayRevenue)}</p>
              <p className="text-4xs text-emerald-600 dark:text-emerald-400 font-bold mt-1.5 flex items-center gap-0.5">
                <ArrowUpRight className="w-3 h-3" /> +12.4% <span className="text-muted-foreground font-medium font-sans">vs kemarin</span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Active Rentals */}
        <Card>
          <CardContent className="p-5 flex flex-col justify-between h-32">
            <div className="flex justify-between items-start">
              <span className="text-3xs font-bold text-muted-foreground uppercase tracking-wider">Rental Aktif</span>
              <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-500">
                <Clock className="w-3.5 h-3.5" />
              </div>
            </div>
            <div>
              <p className="text-xl font-bold tracking-tight">{activeRentalsCount} <span className="text-2xs text-muted-foreground font-medium">Tabung</span></p>
              <p className="text-4xs text-rose-500 font-bold mt-1.5 flex items-center gap-0.5">
                <ArrowDownRight className="w-3 h-3" /> -2.4% <span className="text-muted-foreground font-medium font-sans">vs minggu lalu</span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Available Cylinders */}
        <Card>
          <CardContent className="p-5 flex flex-col justify-between h-32">
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
          <CardContent className="p-5 flex flex-col justify-between h-32">
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
          <CardContent className="p-5 flex flex-col justify-between h-32">
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
      <div className="flex flex-wrap items-center gap-3 p-4 bg-muted/20 border border-border/80 rounded-xl">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mr-2">Pintasan Cepat:</span>
        <Button size="sm" className="flex items-center gap-1.5" onClick={() => setActiveDrawer('rental')}>
          <Plus className="w-3.5 h-3.5" /> Sewa Tabung Baru
        </Button>
        <Button size="sm" variant="secondary" className="flex items-center gap-1.5 border border-border" onClick={() => setActiveDrawer('refill')}>
          <RefreshCw className="w-3.5 h-3.5 text-blue-500" /> Kirim Refill Vendor
        </Button>
        <Button size="sm" variant="secondary" className="flex items-center gap-1.5 border border-border" onClick={() => setActiveDrawer('sale')}>
          <DollarSign className="w-3.5 h-3.5 text-purple-500" /> Kasir POS Ritel
        </Button>
        <Button size="sm" variant="secondary" className="flex items-center gap-1.5 border border-border" onClick={() => setActiveDrawer('expense')}>
          <FileText className="w-3.5 h-3.5 text-rose-500" /> Catat Kas Keluar
        </Button>
      </div>

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
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => window.location.href = '/rentals'}>
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
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => window.location.href = '/stock-movements'}>
              Lihat Gudang
            </Button>
          </CardHeader>
          <CardContent>
            <div className="relative border-l border-border pl-4 space-y-4 py-2 ml-2">
              {stockMovements.slice(0, 4).map(mvt => (
                <div key={mvt.id} className="relative">
                  <span className={`absolute -left-[21px] mt-1 flex h-2.5 w-2.5 rounded-full ring-4 ring-card ${
                    mvt.type === 'Incoming' ? 'bg-emerald-500' : mvt.type === 'Outgoing' ? 'bg-blue-500' : 'bg-amber-500'
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
      
      {/* 1. SEWA TABUNG DRAWER */}
      <Drawer isOpen={activeDrawer === 'rental'} onClose={() => setActiveDrawer(null)} title="Buat Kontrak Sewa Baru">
        <form onSubmit={handleRentalSubmit} className="space-y-4">
          <Select
            label="Pilih Customer *"
            id="rentCust"
            value={rentalForm.customerId}
            onChange={e => setRentalForm({ ...rentalForm, customerId: e.target.value })}
            options={[
              { value: '', label: '-- Pilih Pelanggan --' },
              ...customers.map(c => ({ value: c.id, label: `${c.id} - ${c.name}` }))
            ]}
          />
          <Select
            label="Pilih Tabung Oksigen Tersedia *"
            id="rentCyl"
            value={rentalForm.cylinderId}
            onChange={e => setRentalForm({ ...rentalForm, cylinderId: e.target.value })}
            options={[
              { value: '', label: '-- Pilih Tabung --' },
              ...cylinders.map(c => {
                let statusLabel = 'Tersedia';
                if (c.status === 'Rented') statusLabel = 'Sedang Disewa';
                if (c.status === 'At Vendor') statusLabel = 'Di Pabrik Vendor';
                if (c.status === 'Maintenance') statusLabel = 'Perawatan';
                if (c.status === 'Empty') statusLabel = 'Kosong';
                
                return {
                  value: c.id,
                  label: `${c.serialNo} (${c.size} - ${c.oxygenType}) - [${statusLabel}]`,
                  disabled: c.status !== 'Available'
                };
              })
            ]}
          />
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
                  label: `${c.serialNo} (${c.size} - ${c.oxygenType}) - [${statusLabel}]`,
                  disabled: !canRefill
                };
              })
            ]}
          />
          <Select
            label="Pilih Vendor Refill *"
            id="refillVendor"
            value={refillForm.vendorId}
            onChange={e => setRefillForm({ ...refillForm, vendorId: e.target.value })}
            options={[
              { value: '', label: '-- Pilih Vendor Refill --' },
              ...vendors.map(v => ({ value: v.id, label: v.companyName }))
            ]}
          />
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
              ...customers.map(c => ({ value: c.id, label: c.name }))
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
                { value: 'Cash', label: 'Tunai (Cash)' },
                { value: 'Transfer', label: 'Transfer Bank' },
                { value: 'E-Wallet', label: 'E-Wallet (GoPay/OVO)' }
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
