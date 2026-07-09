'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useData } from '../../context/DataContext';
import { formatRupiah, Cylinder } from '../../context/mockData';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Drawer } from '../../components/ui/Drawer';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Pagination } from '../../components/ui/Table';
import { Plus, Search, Eye, RefreshCw, Printer, Calendar, FileText, ChevronRight, X, ShoppingCart, Trash2, CheckCircle2 } from 'lucide-react';

type TabType = 'rental' | 'return' | 'sales' | 'restock' | 'refill';

export default function TransactionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as TabType) || 'rental';
  const urlSearch = searchParams.get('search') || '';

  const {
    customers,
    vendors,
    cylinders,
    products,
    rentals,
    refills,
    transactions,
    createRental,
    returnRental,
    sendToRefill,
    receiveRefill,
    createSale,
    createPurchase
  } = useData();

  // Tab State
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
    if (urlSearch) {
      setSearchTerm(urlSearch);
    }
  }, [initialTab, urlSearch]);

  const changeTab = (tab: TabType) => {
    setActiveTab(tab);
    setSearchTerm('');
    router.replace(`/transactions?tab=${tab}`);
  };

  // Search & Filters state
  const [searchTerm, setSearchTerm] = useState(urlSearch);
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Selected Detail Rental (Modal/Drawer)
  const [selectedRental, setSelectedRental] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isPrintOpen, setIsPrintOpen] = useState(false);

  // Global Actions Drawer states
  const [isRentalDrawerOpen, setIsRentalDrawerOpen] = useState(false);
  const [isReturnDrawerOpen, setIsReturnDrawerOpen] = useState(false);
  const [isRefillDrawerOpen, setIsRefillDrawerOpen] = useState(false);
  const [isRestockDrawerOpen, setIsRestockDrawerOpen] = useState(false);

  // Form states
  const [rentalForm, setRentalForm] = useState({ customerId: '', cylinderId: '', rentDate: '', returnDate: '', deposit: '', rentalFee: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [returnForm, setReturnForm] = useState({ rentalId: '', returnDate: '', condition: 'Available' as 'Available' | 'Maintenance' });
  const [refillForm, setRefillForm] = useState({ cylinderId: '', vendorId: '', cost: '', sendDate: '' });
  
  // POS Cart State
  const [posCustomer, setPosCustomer] = useState('');
  const [posCart, setPosCart] = useState<Array<{ productId: string; name: string; qty: number; price: number }>>([]);
  const [posProduct, setPosProduct] = useState('');
  const [posQty, setPosQty] = useState('1');
  const [posPaymentMethod, setPosPaymentMethod] = useState<'Cash' | 'Transfer' | 'E-Wallet'>('Cash');
  const [completedSaleInvoice, setCompletedSaleInvoice] = useState<any>(null);

  // Supplier Restock Cart State
  const [restockVendor, setRestockVendor] = useState('');
  const [restockCart, setRestockCart] = useState<Array<{ itemId: string; name: string; qty: number; cost: number }>>([]);
  const [restockProduct, setRestockProduct] = useState('');
  const [restockQty, setRestockQty] = useState('1');
  const [restockCostInput, setRestockCostInput] = useState('');

  // Auto-fill Dates
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    setRentalForm(prev => ({ ...prev, rentDate: today, returnDate: nextWeek }));
    setReturnForm(prev => ({ ...prev, returnDate: today }));
    setRefillForm(prev => ({ ...prev, sendDate: today }));
  }, []);

  // -------------------------------------------------------------
  // RENTAL TAB FILTER & SEARCH
  // -------------------------------------------------------------
  const filteredRentals = useMemo(() => {
    return rentals.filter(r => {
      const cust = customers.find(c => c.id === r.customerId);
      const matchesSearch =
        r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cust && cust.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        r.cylinderId.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [rentals, customers, searchTerm, statusFilter]);

  const paginatedRentals = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRentals.slice(start, start + itemsPerPage);
  }, [filteredRentals, currentPage]);

  // -------------------------------------------------------------
  // POS RETAIL FUNCTIONS
  // -------------------------------------------------------------
  const handleAddPosCart = () => {
    if (!posProduct) return;
    const prod = products.find(p => p.id === posProduct);
    if (!prod) return;

    const qtyNum = Number(posQty);
    if (qtyNum <= 0) return;

    if (prod.stock < qtyNum) {
      alert(`Stok tidak mencukupi! Sisa stok: ${prod.stock} unit.`);
      return;
    }

    // Check if item already exists in cart
    const existing = posCart.find(item => item.productId === posProduct);
    if (existing) {
      if (prod.stock < existing.qty + qtyNum) {
        alert(`Stok tidak mencukupi! Total pesanan melebihi stok gudang.`);
        return;
      }
      setPosCart(posCart.map(item => item.productId === posProduct ? { ...item, qty: item.qty + qtyNum } : item));
    } else {
      setPosCart([...posCart, { productId: prod.id, name: prod.name, qty: qtyNum, price: prod.price }]);
    }

    setPosProduct('');
    setPosQty('1');
  };

  const handleRemovePosCart = (prodId: string) => {
    setPosCart(posCart.filter(item => item.productId !== prodId));
  };

  const posTotal = useMemo(() => {
    return posCart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  }, [posCart]);

  const handleCheckoutPOS = async () => {
    if (!posCustomer || posCart.length === 0) {
      alert('Harap pilih pelanggan dan tambahkan produk ke keranjang.');
      return;
    }

    setIsSaving(true);
    try {
      const sale = await createSale({
        customerId: posCustomer,
        items: posCart,
        date: new Date().toISOString().split('T')[0],
        paymentMethod: posPaymentMethod
      });

      setCompletedSaleInvoice(sale);
      setPosCart([]);
      setPosCustomer('');
    } catch (err: any) {
      alert(err.message || 'Gagal memproses transaksi.');
    } finally {
      setIsSaving(false);
    }
  };

  // -------------------------------------------------------------
  // SUPPLIER RESTOCK FUNCTIONS
  // -------------------------------------------------------------
  const handleAddRestockCart = () => {
    if (!restockProduct) return;
    const prod = products.find(p => p.id === restockProduct);
    if (!prod) return;

    const qtyNum = Number(restockQty);
    const costNum = Number(restockCostInput) || prod.cost;

    if (qtyNum <= 0) return;

    const existing = restockCart.find(item => item.itemId === restockProduct);
    if (existing) {
      setRestockCart(restockCart.map(item => item.itemId === restockProduct ? { ...item, qty: item.qty + qtyNum } : item));
    } else {
      setRestockCart([...restockCart, { itemId: prod.id, name: prod.name, qty: qtyNum, cost: costNum }]);
    }

    setRestockProduct('');
    setRestockQty('1');
    setRestockCostInput('');
  };

  const handleRemoveRestockCart = (prodId: string) => {
    setRestockCart(restockCart.filter(item => item.itemId !== prodId));
  };

  const restockTotal = useMemo(() => {
    return restockCart.reduce((sum, item) => sum + (item.cost * item.qty), 0);
  }, [restockCart]);

  const handleCheckoutRestock = async () => {
    if (!restockVendor || restockCart.length === 0) {
      alert('Harap pilih supplier dan tambahkan produk ke keranjang.');
      return;
    }

    setIsSaving(true);
    try {
      await createPurchase({
        vendorId: restockVendor,
        items: restockCart,
        date: new Date().toISOString().split('T')[0]
      });

      alert('Transaksi restock pengadaan berhasil disimpan!');
      setRestockCart([]);
      setRestockVendor('');
      setIsRestockDrawerOpen(false);
    } catch (err: any) {
      alert(err.message || 'Gagal memproses transaksi.');
    } finally {
      setIsSaving(false);
    }
  };

  // -------------------------------------------------------------
  // FORM HANDLERS
  // -------------------------------------------------------------
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
      setIsRentalDrawerOpen(false);
      setRentalForm({ customerId: '', cylinderId: '', rentDate: '', returnDate: '', deposit: '', rentalFee: '' });
    } catch (err: any) {
      alert(err.message || 'Gagal membuat sewa.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReturnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnForm.rentalId || !returnForm.returnDate) {
      alert('Harap isi semua kolom wajib.');
      return;
    }
    setIsSaving(true);
    try {
      await returnRental(returnForm.rentalId, returnForm.returnDate, returnForm.condition);
      setIsReturnDrawerOpen(false);
      setReturnForm({ rentalId: '', returnDate: '', condition: 'Available' });
    } catch (err: any) {
      alert(err.message || 'Gagal memproses pengembalian sewa.');
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
      setIsRefillDrawerOpen(false);
      setRefillForm({ cylinderId: '', vendorId: '', cost: '', sendDate: '' });
    } catch (err: any) {
      alert(err.message || 'Gagal mengirim refill.');
    } finally {
      setIsSaving(false);
    }
  };

  // Filter cylinders for refills (need available empty cylinders or maintenance ones)
  const emptyCylinders = cylinders.filter(c => c.status === 'Available' || c.status === 'Maintenance');
  const rentedCylindersForReturn = rentals.filter(r => r.status === 'Active' || r.status === 'Overdue');

  return (
    <div className="space-y-6">
      
      {/* Tab Navigation header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Transaksi Operasional</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Kelola rental tabung, kasir POS ritel, restock grosir, dan logistik isi ulang.</p>
        </div>

        {/* Tab Buttons */}
        <div className="flex gap-1 bg-muted/40 p-1 border border-border rounded-xl text-xs font-semibold shrink-0">
          <button
            onClick={() => changeTab('rental')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${activeTab === 'rental' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Sewa Tabung
          </button>
          <button
            onClick={() => changeTab('return')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${activeTab === 'return' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Pengembalian
          </button>
          <button
            onClick={() => changeTab('sales')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${activeTab === 'sales' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Kasir POS
          </button>
          <button
            onClick={() => changeTab('restock')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${activeTab === 'restock' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Restock Supplier
          </button>
          <button
            onClick={() => changeTab('refill')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${activeTab === 'refill' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Refill Vendor
          </button>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* 1. SEWA TABUNG TAB */}
      {/* ----------------------------------------------------------------- */}
      {activeTab === 'rental' && (
        <Card>
          <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <CardTitle>Kontrak Sewa Oksigen</CardTitle>
              <CardDescription>Daftar transaksi pinjam tabung dan deposit jaminan pelanggan.</CardDescription>
            </div>
            <Button className="flex items-center gap-1.5 self-start" onClick={() => setIsRentalDrawerOpen(true)}>
              <Plus className="w-4 h-4" /> Sewa Baru
            </Button>
          </CardHeader>
          <CardContent>
            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Cari ID rental, pelanggan, atau tabung..."
                  value={searchTerm}
                  onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="pl-9 pr-4 py-2 w-full text-sm bg-background border border-border rounded-lg outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <Select
                id="statusFilter"
                value={statusFilter}
                onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                options={[
                  { value: 'All', label: 'Semua Status' },
                  { value: 'Active', label: 'Aktif' },
                  { value: 'Overdue', label: 'Jatuh Tempo (Denda)' },
                  { value: 'Returned', label: 'Selesai (Kembali)' }
                ]}
                className="w-full sm:w-44"
              />
            </div>

            {/* Rentals Table */}
            {filteredRentals.length > 0 ? (
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID Sewa</TableHead>
                      <TableHead>Pelanggan</TableHead>
                      <TableHead>Tabung / Size</TableHead>
                      <TableHead>Tanggal Sewa</TableHead>
                      <TableHead>Batas Kembali</TableHead>
                      <TableHead>Deposit Jaminan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedRentals.map(r => {
                      const cust = customers.find(c => c.id === r.customerId);
                      return (
                        <TableRow key={r.id}>
                          <TableCell className="font-bold text-foreground">{r.id}</TableCell>
                          <TableCell>
                            <p className="font-semibold">{cust ? cust.name : 'Unknown'}</p>
                            <p className="text-3xs text-muted-foreground">{r.customerId}</p>
                          </TableCell>
                          <TableCell>{r.cylinderId}</TableCell>
                          <TableCell>{r.rentDate}</TableCell>
                          <TableCell>{r.returnDate}</TableCell>
                          <TableCell className="font-medium text-foreground">{formatRupiah(r.deposit)}</TableCell>
                          <TableCell>
                            <Badge variant={r.status === 'Active' ? 'success' : r.status === 'Overdue' ? 'destructive' : 'secondary'}>
                              {r.status === 'Active' ? 'Aktif' : r.status === 'Overdue' ? 'Jatuh Tempo' : 'Selesai'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right space-x-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="px-2"
                              onClick={() => { setSelectedRental(r); setIsDetailOpen(true); }}
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="px-2 text-emerald-500"
                              onClick={() => { setSelectedRental(r); setIsPrintOpen(true); }}
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                
                <Pagination
                  currentPage={currentPage}
                  totalPages={Math.ceil(filteredRentals.length / itemsPerPage)}
                  onPageChange={setCurrentPage}
                  totalItems={filteredRentals.length}
                  itemsPerPage={itemsPerPage}
                />
              </div>
            ) : (
              <div className="py-16 text-center text-muted-foreground text-sm">
                Tidak ada data sewa yang ditemukan.
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* 2. PENGEMBALIAN TAB */}
      {/* ----------------------------------------------------------------- */}
      {activeTab === 'return' && (
        <Card>
          <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <CardTitle>Logistik Pengembalian Tabung</CardTitle>
              <CardDescription>Proses pengembalian tabung sewa dari tangan pelanggan ke gudang.</CardDescription>
            </div>
            <Button
              className="flex items-center gap-1.5 self-start bg-success text-white hover:bg-success/90"
              onClick={() => setIsReturnDrawerOpen(true)}
              disabled={rentedCylindersForReturn.length === 0}
            >
              <Plus className="w-4 h-4" /> Proses Tabung Kembali
            </Button>
          </CardHeader>
          <CardContent>
            {rentedCylindersForReturn.length > 0 ? (
              <div className="space-y-4">
                <p className="text-xs text-amber-600 font-bold bg-amber-500/10 p-3 rounded-lg border border-amber-500/20">
                  ⚠️ Terdapat {rentedCylindersForReturn.length} tabung sewa aktif yang belum dikembalikan oleh pelanggan.
                </p>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID Sewa</TableHead>
                      <TableHead>Pelanggan</TableHead>
                      <TableHead>Tabung Oksigen</TableHead>
                      <TableHead>Tanggal Pinjam</TableHead>
                      <TableHead>Uang Deposit</TableHead>
                      <TableHead>Status Kontrak</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rentedCylindersForReturn.map(r => {
                      const cust = customers.find(c => c.id === r.customerId);
                      return (
                        <TableRow key={r.id}>
                          <TableCell className="font-bold text-foreground">{r.id}</TableCell>
                          <TableCell>{cust ? cust.name : 'Unknown'}</TableCell>
                          <TableCell className="font-semibold text-foreground">{r.cylinderId}</TableCell>
                          <TableCell>{r.rentDate}</TableCell>
                          <TableCell>{formatRupiah(r.deposit)}</TableCell>
                          <TableCell>
                            <Badge variant={r.status === 'Overdue' ? 'destructive' : 'success'}>
                              {r.status === 'Overdue' ? 'Overdue (Denda)' : 'Aktif'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs text-primary"
                              onClick={() => {
                                setReturnForm(prev => ({ ...prev, rentalId: r.id }));
                                setIsReturnDrawerOpen(true);
                              }}
                            >
                              Log Kembali
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                <h3 className="text-base font-bold text-foreground">Semua Tabung Aman</h3>
                <p className="text-xs text-muted-foreground max-w-sm">
                  Tidak ada tabung sewa yang aktif saat ini. Semua aset tabung oksigen berada di dalam gudang atau sedang antre di vendor pengisian.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* 3. KASIR POS TAB */}
      {/* ----------------------------------------------------------------- */}
      {activeTab === 'sales' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* POS Cart selection (left) */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Kasir Point of Sales (POS)</CardTitle>
                <CardDescription>Pilih aksesoris medis medis untuk pelanggan langsung.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                
                {/* Select Customer */}
                <Select
                  label="Pilih Pelanggan POS *"
                  id="posCust"
                  value={posCustomer}
                  onChange={e => setPosCustomer(e.target.value)}
                  options={[
                    { value: '', label: '-- Pilih Pelanggan Ritel --' },
                    ...customers.map(c => ({ value: c.id, label: `${c.id} - ${c.name}` }))
                  ]}
                />

                {/* Select Product Item */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end border-t border-border pt-4">
                  <div className="sm:col-span-2">
                    <Select
                      label="Pilih Produk Ritel"
                      id="posProd"
                      value={posProduct}
                      onChange={e => setPosProduct(e.target.value)}
                      options={[
                        { value: '', label: '-- Pilih Barang Ritel --' },
                        ...products.map(p => ({ value: p.id, label: `${p.name} (Stok: ${p.stock} pcs) - ${formatRupiah(p.price)}` }))
                      ]}
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="w-20">
                      <Input
                        label="Qty"
                        id="posQty"
                        type="number"
                        min="1"
                        value={posQty}
                        onChange={e => setPosQty(e.target.value)}
                      />
                    </div>
                    <Button type="button" className="flex-1" onClick={handleAddPosCart}>
                      <Plus className="w-4 h-4 mr-1" /> Tambah
                    </Button>
                  </div>
                </div>

                {/* Cart list table */}
                <div className="border border-border/80 rounded-xl overflow-hidden mt-4">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-muted font-bold">
                      <tr>
                        <th className="p-3">Nama Produk</th>
                        <th className="p-3 text-center">Harga Satuan</th>
                        <th className="p-3 text-center">Qty</th>
                        <th className="p-3 text-center">Total</th>
                        <th className="p-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {posCart.length > 0 ? (
                        posCart.map(item => (
                          <tr key={item.productId} className="hover:bg-muted/10">
                            <td className="p-3 font-semibold text-foreground">{item.name}</td>
                            <td className="p-3 text-center">{formatRupiah(item.price)}</td>
                            <td className="p-3 text-center font-bold">{item.qty}</td>
                            <td className="p-3 text-center font-bold text-foreground">{formatRupiah(item.price * item.qty)}</td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() => handleRemovePosCart(item.productId)}
                                className="text-rose-500 hover:text-rose-700 cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="p-6 text-center text-muted-foreground">
                            Keranjang POS kosong. Silakan tambahkan barang di atas.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

              </CardContent>
            </Card>
          </div>

          {/* Checkout Panel (right) */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Ringkasan Pembayaran</CardTitle>
                <CardDescription>Rincian nominal struk thermal kasir.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center text-xs pb-3 border-b border-border/60">
                  <span className="text-muted-foreground">Subtotal Item</span>
                  <span className="font-semibold text-foreground">{posCart.length} jenis produk</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold py-2 text-foreground">
                  <span>Total Tagihan</span>
                  <span className="text-emerald-500">{formatRupiah(posTotal)}</span>
                </div>

                <Select
                  label="Metode Pembayaran"
                  id="posPay"
                  value={posPaymentMethod}
                  onChange={e => setPosPaymentMethod(e.target.value as any)}
                  options={[
                    { value: 'Cash', label: 'Tunai (Cash)' },
                    { value: 'Transfer', label: 'Transfer Bank (BCA/Mandiri)' },
                    { value: 'E-Wallet', label: 'E-Wallet (GoPay/OVO)' }
                  ]}
                />

                <Button
                  className="w-full mt-4 flex items-center justify-center gap-1.5"
                  disabled={posCart.length === 0 || !posCustomer || isSaving}
                  onClick={handleCheckoutPOS}
                >
                  {isSaving ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Memproses...</span>
                    </div>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" /> Bayar & Cetak Struk
                    </>
                  )}
                </Button>

                {/* Print completed invoice */}
                {completedSaleInvoice && (
                  <div className="border border-emerald-500/20 bg-emerald-500/5 p-4 rounded-xl space-y-3 mt-4">
                    <p className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Transaksi Kasir Berhasil!
                    </p>
                    <div className="text-4xs font-mono text-muted-foreground leading-relaxed p-2 bg-card border border-border/50 rounded-lg">
                      <p className="text-center font-bold text-foreground">OKSIGEN MEDIS 24 JAM</p>
                      <p className="text-center mb-2">Dusun Sembon, Sembon, Kec. Karangrejo, Tulungagung</p>
                      <p>Inv: {completedSaleInvoice.id}</p>
                      <p>Tgl: {completedSaleInvoice.date}</p>
                      <p>Bayar: {completedSaleInvoice.paymentMethod}</p>
                      <hr className="my-1 border-dashed border-border" />
                      {completedSaleInvoice.items.map((it: any) => (
                        <div key={it.productId} className="flex justify-between">
                          <span>{it.name} x {it.qty}</span>
                          <span>{formatRupiah(it.price * it.qty)}</span>
                        </div>
                      ))}
                      <hr className="my-1 border-dashed border-border" />
                      <div className="flex justify-between font-bold text-foreground">
                        <span>TOTAL</span>
                        <span>{formatRupiah(completedSaleInvoice.amount)}</span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-3xs py-1"
                      onClick={() => setCompletedSaleInvoice(null)}
                    >
                      Tutup Struk
                    </Button>
                  </div>
                )}

              </CardContent>
            </Card>
          </div>

        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* 4. RESTOCK SUPPLIER TAB */}
      {/* ----------------------------------------------------------------- */}
      {activeTab === 'restock' && (
        <Card>
          <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <CardTitle>Pengadaan Barang Ritel (Restock)</CardTitle>
              <CardDescription>Kelola pasokan produk baru dari vendor grosir eksternal.</CardDescription>
            </div>
            <Button
              className="flex items-center gap-1.5 self-start bg-primary text-white"
              onClick={() => setIsRestockDrawerOpen(true)}
            >
              <Plus className="w-4 h-4" /> Beli Restock Baru
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID Restock</TableHead>
                  <TableHead>Nama Supplier</TableHead>
                  <TableHead>Jumlah Item</TableHead>
                  <TableHead>Total Biaya Pengadaan</TableHead>
                  <TableHead>Tanggal Transaksi</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions
                  .filter(t => t.type === 'Purchase')
                  .slice(0, 10)
                  .map(tx => {
                    const matchedVendor = vendors.find(v => tx.description.toLowerCase().includes(v.companyName.toLowerCase()));
                    return (
                      <TableRow key={tx.id}>
                        <TableCell className="font-bold text-foreground">{tx.id}</TableCell>
                        <TableCell>{matchedVendor ? matchedVendor.companyName : 'PT Supplier Gas Medika'}</TableCell>
                        <TableCell>Logistik & Aksesoris</TableCell>
                        <TableCell className="font-bold text-rose-500">{formatRupiah(tx.amount)}</TableCell>
                        <TableCell>{tx.date}</TableCell>
                        <TableCell>
                          <Badge variant="warning">Restock</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">Selesai</Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* 5. VENDOR REFILL TAB */}
      {/* ----------------------------------------------------------------- */}
      {activeTab === 'refill' && (
        <Card>
          <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <CardTitle>Antrean Refill Gas Tabung</CardTitle>
              <CardDescription>Kirim tabung kosong ke pabrik pengisian gas oksigen industri mitra.</CardDescription>
            </div>
            <Button
              className="flex items-center gap-1.5 self-start bg-blue-600 text-white hover:bg-blue-700"
              onClick={() => setIsRefillDrawerOpen(true)}
              disabled={emptyCylinders.length === 0}
            >
              <RefreshCw className="w-4 h-4" /> Kirim Tabung Isi Ulang
            </Button>
          </CardHeader>
          <CardContent>
            {refills.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID Refill</TableHead>
                    <TableHead>Pabrik Refill (Vendor)</TableHead>
                    <TableHead>Tabung Oksigen</TableHead>
                    <TableHead>Tanggal Kirim</TableHead>
                    <TableHead>Tanggal Selesai</TableHead>
                    <TableHead>Ongkos Isi Ulang</TableHead>
                    <TableHead>Status Antrean</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {refills.map(ref => {
                    const vend = vendors.find(v => v.id === ref.vendorId);
                    return (
                      <TableRow key={ref.id}>
                        <TableCell className="font-bold text-foreground">{ref.id}</TableCell>
                        <TableCell>{vend ? vend.companyName : 'Unknown'}</TableCell>
                        <TableCell className="font-semibold text-foreground">{ref.cylinderId}</TableCell>
                        <TableCell>{ref.sendDate}</TableCell>
                        <TableCell>{ref.returnDate || '-'}</TableCell>
                        <TableCell>{formatRupiah(ref.cost)}</TableCell>
                        <TableCell>
                          <Badge variant={ref.status === 'Sent' ? 'warning' : 'success'}>
                            {ref.status === 'Sent' ? 'Sedang Antre' : 'Diterima'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {ref.status === 'Sent' ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs text-blue-600"
                              onClick={() => {
                                receiveRefill(ref.id, new Date().toISOString().split('T')[0]);
                                alert('Tabung isi ulang diterima kembali di gudang!');
                              }}
                            >
                              Konfirmasi Selesai
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground font-semibold">Tuntas</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="py-16 text-center text-muted-foreground text-sm">
                Belum ada pengiriman tabung ke vendor refill baru.
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* DRAWERS & MODALS FOR ACTIVE FORMS */}
      {/* ----------------------------------------------------------------- */}
      
      {/* 1. SEWA DRAWER */}
      <Drawer isOpen={isRentalDrawerOpen} onClose={() => setIsRentalDrawerOpen(false)} title="Buat Kontrak Sewa Tabung">
        <form onSubmit={handleRentalSubmit} className="space-y-4">
          <Select
            label="Pilih Pelanggan *"
            id="drawRentCust"
            value={rentalForm.customerId}
            onChange={e => setRentalForm({ ...rentalForm, customerId: e.target.value })}
            options={[
              { value: '', label: '-- Pilih Pelanggan --' },
              ...customers.map(c => ({ value: c.id, label: `${c.id} - ${c.name}` }))
            ]}
          />
          <Select
            label="Pilih Tabung Oksigen Tersedia *"
            id="drawRentCyl"
            value={rentalForm.cylinderId}
            onChange={e => setRentalForm({ ...rentalForm, cylinderId: e.target.value })}
            options={[
              { value: '', label: '-- Pilih Tabung Ready --' },
              ...cylinders.filter(c => c.status === 'Available').map(c => ({ value: c.id, label: `${c.serialNo} (${c.size}) - ${c.oxygenType}` }))
            ]}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Tanggal Pinjam *"
              id="drawRentDate"
              type="date"
              value={rentalForm.rentDate}
              onChange={e => setRentalForm({ ...rentalForm, rentDate: e.target.value })}
            />
            <Input
              label="Batas Kembali *"
              id="drawReturnDate"
              type="date"
              value={rentalForm.returnDate}
              onChange={e => setRentalForm({ ...rentalForm, returnDate: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Jaminan (Deposit) (Rp)"
              id="drawRentDep"
              isRupiah={true}
              value={rentalForm.deposit}
              onChange={e => setRentalForm({ ...rentalForm, deposit: e.target.value })}
            />
            <Input
              label="Tarif Sewa (Rp)"
              id="drawRentFee"
              isRupiah={true}
              value={rentalForm.rentalFee}
              onChange={e => setRentalForm({ ...rentalForm, rentalFee: e.target.value })}
            />
          </div>
          <div className="border-t border-border pt-4 flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setIsRentalDrawerOpen(false)} disabled={isSaving}>Kembali</Button>
            <Button type="submit" className="flex-1" disabled={isSaving}>
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

      {/* 2. PENGEMBALIAN DRAWER */}
      <Drawer isOpen={isReturnDrawerOpen} onClose={() => setIsReturnDrawerOpen(false)} title="Logistik Tabung Kembali">
        <form onSubmit={handleReturnSubmit} className="space-y-4">
          <Select
            label="Pilih ID Sewa Aktif *"
            id="drawRetId"
            value={returnForm.rentalId}
            onChange={e => setReturnForm({ ...returnForm, rentalId: e.target.value })}
            options={[
              { value: '', label: '-- Pilih Kontrak Aktif --' },
              ...rentedCylindersForReturn.map(r => {
                const c = customers.find(cust => cust.id === r.customerId);
                return { value: r.id, label: `${r.id} - ${c ? c.name : 'Unknown'} (${r.cylinderId})` };
              })
            ]}
          />
          <Input
            label="Tanggal Dikembalikan *"
            id="drawRetDate"
            type="date"
            value={returnForm.returnDate}
            onChange={e => setReturnForm({ ...returnForm, returnDate: e.target.value })}
          />
          <Select
            label="Kondisi Akhir Tabung Baja *"
            id="drawRetCond"
            value={returnForm.condition}
            onChange={e => setReturnForm({ ...returnForm, condition: e.target.value as any })}
            options={[
              { value: 'Available', label: 'Bagus & Siap Pakai' },
              { value: 'Maintenance', label: 'Rusak / Butuh hydrotest ulang' }
            ]}
          />
          <p className="text-4xs text-muted-foreground bg-muted/40 p-2.5 rounded-lg border border-border">
            * Jaminan (deposit) sewa akan secara otomatis dikembalikan kepada saldo cash pelanggan saat pengembalian diproses.
          </p>
          <div className="border-t border-border pt-4 flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setIsReturnDrawerOpen(false)} disabled={isSaving}>Batal</Button>
            <Button type="submit" className="flex-1 bg-success text-white" disabled={isSaving}>
              {isSaving ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Memproses...</span>
                </div>
              ) : (
                'Log Kembali'
              )}
            </Button>
          </div>
        </form>
      </Drawer>

      {/* 3. REFILL VENDOR DRAWER */}
      <Drawer isOpen={isRefillDrawerOpen} onClose={() => setIsRefillDrawerOpen(false)} title="Kirim Tabung Refill Gas">
        <form onSubmit={handleRefillSubmit} className="space-y-4">
          <Select
            label="Pilih Tabung Kosong di Gudang *"
            id="drawRefCyl"
            value={refillForm.cylinderId}
            onChange={e => setRefillForm({ ...refillForm, cylinderId: e.target.value })}
            options={[
              { value: '', label: '-- Pilih Tabung --' },
              ...emptyCylinders.map(c => ({ value: c.id, label: `${c.serialNo} (${c.size} - status: ${c.status})` }))
            ]}
          />
          <Select
            label="Pilih Mitra Vendor Refill *"
            id="drawRefVend"
            value={refillForm.vendorId}
            onChange={e => setRefillForm({ ...refillForm, vendorId: e.target.value })}
            options={[
              { value: '', label: '-- Pilih Pabrik Vendor --' },
              ...vendors.map(v => ({ value: v.id, label: v.companyName }))
            ]}
          />
          <Input
            label="Biaya Pengisian Oksigen (Rp)"
            id="drawRefCost"
            isRupiah={true}
            placeholder="e.g. 50000"
            value={refillForm.cost}
            onChange={e => setRefillForm({ ...refillForm, cost: e.target.value })}
          />
          <Input
            label="Tanggal Pengiriman Logistik *"
            id="drawRefSend"
            type="date"
            value={refillForm.sendDate}
            onChange={e => setRefillForm({ ...refillForm, sendDate: e.target.value })}
          />
          <div className="border-t border-border pt-4 flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setIsRefillDrawerOpen(false)} disabled={isSaving}>Batal</Button>
            <Button type="submit" className="flex-1 bg-blue-600 text-white" disabled={isSaving}>
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

      {/* 4. RESTOCK SUPPLIER DRAWER */}
      <Drawer isOpen={isRestockDrawerOpen} onClose={() => setIsRestockDrawerOpen(false)} title="Pengadaan Restock Grosir">
        <div className="space-y-4">
          <Select
            label="Pilih Vendor Supplier *"
            id="drawRestVend"
            value={restockVendor}
            onChange={e => setRestockVendor(e.target.value)}
            options={[
              { value: '', label: '-- Pilih Vendor Supplier --' },
              ...vendors.map(v => ({ value: v.id, label: v.companyName }))
            ]}
          />
          
          <div className="border-t border-border pt-3">
            <p className="text-3xs font-bold text-muted-foreground uppercase mb-2">Keranjang Restock</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-end">
              <Select
                label="Pilih Produk"
                id="drawRestProd"
                value={restockProduct}
                onChange={e => setRestockProduct(e.target.value)}
                options={[
                  { value: '', label: '-- Pilih Barang --' },
                  ...products.map(p => ({ value: p.id, label: `${p.name} (Modal: ${formatRupiah(p.cost)})` }))
                ]}
              />
              <div className="flex gap-2">
                <Input
                  label="Qty"
                  id="drawRestQty"
                  type="number"
                  min="1"
                  value={restockQty}
                  onChange={e => setRestockQty(e.target.value)}
                />
                <Button type="button" className="self-end h-10" onClick={handleAddRestockCart}>+</Button>
              </div>
            </div>
          </div>

          <div className="border border-border rounded-lg max-h-36 overflow-y-auto text-2xs p-2 space-y-2 mt-2 bg-muted/20">
            {restockCart.length > 0 ? (
              restockCart.map(item => (
                <div key={item.itemId} className="flex justify-between items-center">
                  <span>{item.name} (x{item.qty})</span>
                  <div className="flex items-center gap-3">
                    <span className="font-bold">{formatRupiah(item.cost * item.qty)}</span>
                    <button onClick={() => handleRemoveRestockCart(item.itemId)} className="text-rose-500 hover:underline">Hapus</button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center py-4 text-muted-foreground">Keranjang restock supplier kosong.</p>
            )}
          </div>

          <div className="flex justify-between items-center text-xs border-t border-border pt-3 font-bold text-foreground">
            <span>Total Tagihan Grosir</span>
            <span className="text-emerald-500">{formatRupiah(restockTotal)}</span>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setIsRestockDrawerOpen(false)} disabled={isSaving}>Batal</Button>
            <Button type="button" className="flex-1" disabled={restockCart.length === 0 || !restockVendor || isSaving} onClick={handleCheckoutRestock}>
              {isSaving ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Memproses...</span>
                </div>
              ) : (
                'Beli Restock'
              )}
            </Button>
          </div>
        </div>
      </Drawer>

      {/* 5. INVOICE PREVIEW MODAL */}
      {isPrintOpen && selectedRental && (
        <Drawer isOpen={isPrintOpen} onClose={() => setIsPrintOpen(false)} title="Invoice Persewaan">
          <div className="p-4 bg-white text-zinc-900 font-sans border rounded-xl shadow-xs text-xs space-y-4">
            
            {/* Header */}
            <div className="flex justify-between items-start border-b pb-4">
              <div>
                <h3 className="text-sm font-bold tracking-tight">Oksigen Medis 24 Jam</h3>
                <p className="text-5xs text-zinc-500 mt-0.5">Dusun Sembon, Sembon, Kec. Karangrejo, Tulungagung • Telp: 0858-6697-2209</p>
              </div>
              <div className="text-right">
                <span className="text-3xs font-extrabold uppercase bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">INVOICE</span>
                <p className="text-[10px] font-mono mt-1">NO: {selectedRental.id}</p>
              </div>
            </div>

            {/* Customer Details */}
            <div className="grid grid-cols-2 gap-4 text-4xs">
              <div>
                <p className="font-bold text-zinc-500">DITAGIHKAN KEPADA:</p>
                <p className="font-bold text-zinc-900 mt-1">{customers.find(c => c.id === selectedRental.customerId)?.name || 'Pelanggan Mandiri'}</p>
                <p className="text-zinc-500 mt-0.5">{customers.find(c => c.id === selectedRental.customerId)?.address}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-zinc-500">TANGGAL PINJAM:</p>
                <p className="font-bold text-zinc-900 mt-1">{selectedRental.rentDate}</p>
                <p className="font-bold text-zinc-500 mt-1">BATAS KEMBALI:</p>
                <p className="font-bold text-zinc-900 mt-1">{selectedRental.returnDate}</p>
              </div>
            </div>

            {/* Rental details table */}
            <table className="w-full text-zinc-900 text-[10px] border-y border-zinc-200">
              <thead>
                <tr className="border-b font-bold text-zinc-500">
                  <th className="py-2 text-left">Deskripsi Produk</th>
                  <th className="py-2 text-center">Unit / SN</th>
                  <th className="py-2 text-right">Biaya Sewa</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2">
                    <p className="font-bold">Rental Tabung Oksigen Medis</p>
                    <p className="text-5xs text-zinc-400">Purity Grade: 99.5% Medical Standard</p>
                  </td>
                  <td className="py-2 text-center font-mono">{selectedRental.cylinderId}</td>
                  <td className="py-2 text-right">{formatRupiah(selectedRental.rentalFee)}</td>
                </tr>
                <tr>
                  <td className="py-2" colSpan={2}>
                    <p className="font-bold text-zinc-600">Uang Jaminan Kontrak (Deposit)</p>
                    <p className="text-5xs text-zinc-400">* Dikembalikan penuh saat tabung kosong kembali ke gudang</p>
                  </td>
                  <td className="py-2 text-right font-bold">{formatRupiah(selectedRental.deposit)}</td>
                </tr>
              </tbody>
            </table>

            {/* Total */}
            <div className="flex justify-between items-center text-xs font-bold pt-2">
              <span className="text-zinc-500">TOTAL PEMBAYARAN KONTRAK</span>
              <span className="text-emerald-600">{formatRupiah(selectedRental.rentalFee + selectedRental.deposit)}</span>
            </div>

            <div className="text-[9px] text-zinc-400 text-center border-t pt-4">
              Terima kasih atas kepercayaan Anda. Layanan Oksigen Medis 24 Jam Bandung.
            </div>

            <Button
              className="w-full text-white bg-emerald-600 mt-2 text-3xs py-1.5"
              onClick={() => {
                window.print();
              }}
            >
              Print Cetak Fisik
            </Button>
          </div>
        </Drawer>
      )}

      {/* 6. DETAIL RENTAL MODAL */}
      {isDetailOpen && selectedRental && (
        <Drawer isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} title="Detail Transaksi Sewa">
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase">Informasi Penyewaan</p>
              <div className="mt-2 space-y-2 p-3 bg-muted/20 border border-border rounded-xl text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ID Rental</span>
                  <span className="font-bold text-foreground">{selectedRental.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pelanggan</span>
                  <span className="font-semibold text-foreground">
                    {customers.find(c => c.id === selectedRental.customerId)?.name || 'Unknown'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ID Tabung Baja</span>
                  <span className="font-semibold text-foreground">{selectedRental.cylinderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tanggal Sewa</span>
                  <span>{selectedRental.rentDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Batas Jatuh Tempo</span>
                  <span>{selectedRental.returnDate}</span>
                </div>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase">Rincian Finansial</p>
              <div className="mt-2 space-y-2 p-3 bg-muted/20 border border-border rounded-xl text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Uang Jaminan (Deposit)</span>
                  <span className="font-bold text-foreground">{formatRupiah(selectedRental.deposit)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tarif Jasa Sewa</span>
                  <span className="font-bold text-foreground">{formatRupiah(selectedRental.rentalFee)}</span>
                </div>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase">Linimasa Logistik</p>
              <div className="mt-2 border-l border-border pl-4 space-y-4 ml-2 text-xs">
                <div className="relative">
                  <span className="absolute -left-[21px] mt-1 flex h-2.5 w-2.5 rounded-full bg-emerald-500 ring-4 ring-card" />
                  <p className="font-semibold">Kontrak Dibuat & Disetujui</p>
                  <p className="text-4xs text-muted-foreground mt-0.5">{selectedRental.rentDate}</p>
                </div>
                <div className="relative">
                  <span className="absolute -left-[21px] mt-1 flex h-2.5 w-2.5 rounded-full bg-emerald-500 ring-4 ring-card" />
                  <p className="font-semibold">Jaminan Deposit Diterima Kasir</p>
                  <p className="text-4xs text-muted-foreground mt-0.5">{formatRupiah(selectedRental.deposit)} • Tunai</p>
                </div>
                <div className="relative">
                  <span className={`absolute -left-[21px] mt-1 flex h-2.5 w-2.5 rounded-full ring-4 ring-card ${selectedRental.status === 'Returned' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                  <p className="font-semibold">
                    {selectedRental.status === 'Returned' ? 'Tabung Diterima Kembali di Gudang' : 'Tabung Berada di Tangan Pelanggan'}
                  </p>
                  <p className="text-4xs text-muted-foreground mt-0.5">Status: {selectedRental.status}</p>
                </div>
              </div>
            </div>

            <Button className="w-full mt-4" onClick={() => setIsDetailOpen(false)}>Tutup Detail</Button>
          </div>
        </Drawer>
      )}

    </div>
  );
}
