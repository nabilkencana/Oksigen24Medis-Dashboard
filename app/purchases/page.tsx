'use client';

import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { formatRupiah } from '../../context/mockData';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Drawer } from '../../components/ui/Drawer';
import { Input, Select } from '../../components/ui/Input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Pagination } from '../../components/ui/Table';
import { Plus, Search, Eye, ShoppingBag, ShoppingCart, User, Calendar, PlusCircle, Trash2 } from 'lucide-react';

export default function PurchasesPage() {
  const { vendors, products, purchases, createPurchase } = useData();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Drawer states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedPurchaseId, setSelectedPurchaseId] = useState<string | null>(null);

  // Form State (New Purchase)
  const [vendorId, setVendorId] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Shopping Cart items for purchase builder
  const [cart, setCart] = useState<Array<{ itemId: string; name: string; qty: number; cost: number }>>([]);
  const [currentItem, setCurrentItem] = useState({ itemId: '', qty: '10' });

  // Calculations
  const thisMonthStr = new Date().toISOString().substring(0, 7);
  const totalPurchaseThisMonth = purchases
    .filter(p => p.date.startsWith(thisMonthStr) && p.status === 'Completed')
    .reduce((sum, p) => sum + p.totalAmount, 0);

  const pendingPurchasesCount = purchases.filter(p => p.status === 'Pending').length;

  // Add item to cart
  const handleAddItem = () => {
    if (!currentItem.itemId) {
      alert('Pilih produk terlebih dahulu.');
      return;
    }
    const product = products.find(p => p.id === currentItem.itemId);
    if (!product) return;

    // Check if product already in cart
    const existingIndex = cart.findIndex(i => i.itemId === currentItem.itemId);
    const qty = Number(currentItem.qty) || 1;
    
    if (existingIndex > -1) {
      const nextCart = [...cart];
      nextCart[existingIndex].qty += qty;
      setCart(nextCart);
    } else {
      setCart([...cart, {
        itemId: product.id,
        name: product.name,
        qty,
        cost: product.cost // wholesale cost
      }]);
    }
    // reset item select
    setCurrentItem({ itemId: '', qty: '10' });
  };

  // Remove item from cart
  const handleRemoveItem = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.qty * item.cost), 0);
  }, [cart]);

  const handlePurchaseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorId || cart.length === 0 || !purchaseDate) {
      alert('Harap pilih supplier, tanggal, dan tambahkan minimal 1 item produk.');
      return;
    }
    createPurchase({
      vendorId,
      items: cart,
      date: purchaseDate
    });
    setIsCreateOpen(false);
    setCart([]);
    setVendorId('');
  };

  // Filtered Purchases
  const filteredPurchases = useMemo(() => {
    let result = [...purchases];

    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      result = result.filter(p =>
        p.vendorName.toLowerCase().includes(query) ||
        p.id.toLowerCase().includes(query)
      );
    }

    result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return result;
  }, [purchases, searchTerm]);

  // Paginated purchases
  const paginatedPurchases = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPurchases.slice(start, start + itemsPerPage);
  }, [filteredPurchases, currentPage]);

  const totalPages = Math.ceil(filteredPurchases.length / itemsPerPage);

  const selectedPurchase = useMemo(() => {
    if (!selectedPurchaseId) return null;
    return purchases.find(p => p.id === selectedPurchaseId) || null;
  }, [purchases, selectedPurchaseId]);

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Restock & Pembelian Supplier (Purchases)</h2>
          <p className="text-xs text-muted-foreground mt-1">Kelola transaksi pengadaan gas, tabung baja, maupun suku cadang dari supplier.</p>
        </div>
        <Button size="sm" className="flex items-center gap-1.5" onClick={() => {
          setCart([]);
          setVendorId('');
          setPurchaseDate(new Date().toISOString().split('T')[0]);
          setIsCreateOpen(true);
        }}>
          <Plus className="w-4 h-4" /> Pengadaan Baru
        </Button>
      </div>

      {/* Top Summaries */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-2xs font-bold text-muted-foreground uppercase tracking-wider">Restock Grosir Bulan Ini</p>
              <p className="text-xl font-bold mt-1 text-rose-500">{formatRupiah(totalPurchaseThisMonth)}</p>
              <p className="text-4xs text-muted-foreground mt-1">Biaya pengeluaran modal restock barang</p>
            </div>
            <div className="p-3 rounded-lg bg-rose-500/10 text-rose-500 shrink-0">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-2xs font-bold text-muted-foreground uppercase tracking-wider">Pending Delivery / Kontrak</p>
              <p className="text-xl font-bold mt-1 text-amber-500">{pendingPurchasesCount} Pembelian</p>
              <p className="text-4xs text-muted-foreground mt-1">Menunggu barang tiba di gudang</p>
            </div>
            <div className="p-3 rounded-lg bg-amber-500/10 text-amber-500 shrink-0">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Filter Card */}
      <Card>
        <CardContent className="p-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Cari pengadaan berdasarkan nama supplier, ID transaksi..."
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="flex h-10 w-full rounded-lg border border-border bg-background pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:border-border/60"
            />
          </div>
        </CardContent>
      </Card>

      {/* Purchases Table */}
      <Card>
        <CardContent className="p-0">
          {paginatedPurchases.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-24">ID Transaksi</TableHead>
                    <TableHead>Vendor Supplier</TableHead>
                    <TableHead>Total Nominal (Modal)</TableHead>
                    <TableHead>Tanggal Transaksi</TableHead>
                    <TableHead className="w-24 text-center">Status</TableHead>
                    <TableHead className="w-24 text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedPurchases.map(pur => (
                    <TableRow key={pur.id}>
                      <TableCell className="font-bold text-xs">{pur.id}</TableCell>
                      <TableCell className="font-semibold text-foreground">{pur.vendorName}</TableCell>
                      <TableCell className="font-bold text-xs text-rose-500">{formatRupiah(pur.totalAmount)}</TableCell>
                      <TableCell className="text-xs">{pur.date}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={pur.status === 'Completed' ? 'success' : 'warning'}>
                          {pur.status === 'Completed' ? 'Selesai' : 'Pending'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" className="h-8 px-2.5 flex items-center gap-1 cursor-pointer" onClick={() => setSelectedPurchaseId(pur.id)}>
                          <Eye className="w-3.5 h-3.5" /> Detail
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={filteredPurchases.length}
                itemsPerPage={itemsPerPage}
              />
            </>
          ) : (
            <div className="py-24 text-center flex flex-col items-center justify-center gap-3">
              <ShoppingBag className="w-12 h-12 text-muted-foreground/45" />
              <h3 className="text-base font-bold text-foreground">Tidak Ada Pengadaan</h3>
              <p className="text-xs text-muted-foreground max-w-sm">
                Belum ada transaksi pengadaan restock dari supplier yang terdaftar di sistem.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 1. DRAWER - CREATE PURCHASE */}
      <Drawer isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Buat Dokumen Pengadaan Restock">
        <form onSubmit={handlePurchaseSubmit} className="space-y-4">
          <Select
            label="Pilih Vendor Supplier *"
            id="purVendor"
            value={vendorId}
            onChange={e => setVendorId(e.target.value)}
            options={[
              { value: '', label: '-- Pilih Supplier --' },
              ...vendors.filter(v => v.status === 'Active').map(v => ({ value: v.id, label: v.companyName }))
            ]}
          />
          <Input
            label="Tanggal Pembelian *"
            id="purDate"
            type="date"
            value={purchaseDate}
            onChange={e => setPurchaseDate(e.target.value)}
          />

          {/* ITEM BUILDER CARD */}
          <div className="border border-border rounded-xl p-4 bg-muted/20 space-y-3">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Pilih Item Restock</h4>
            <div className="grid grid-cols-3 gap-2 items-end">
              <div className="col-span-2">
                <Select
                  label="Pilih Produk *"
                  id="purCartItem"
                  value={currentItem.itemId}
                  onChange={e => setCurrentItem({ ...currentItem, itemId: e.target.value })}
                  options={[
                    { value: '', label: '-- Pilih Produk --' },
                    ...products.map(p => ({ value: p.id, label: `${p.name} (Cost: ${formatRupiah(p.cost)})` }))
                  ]}
                />
              </div>
              <Input
                label="Jumlah *"
                id="purCartQty"
                type="number"
                min="1"
                value={currentItem.qty}
                onChange={e => setCurrentItem({ ...currentItem, qty: e.target.value })}
              />
            </div>
            <Button type="button" size="sm" variant="outline" className="w-full flex items-center justify-center gap-1 mt-2 cursor-pointer" onClick={handleAddItem}>
              <PlusCircle className="w-4 h-4" /> Tambah Ke Keranjang
            </Button>
          </div>

          {/* CART VIEW */}
          {cart.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Item Yang Akan Dibeli</h4>
              <div className="border border-border rounded-xl divide-y divide-border overflow-hidden">
                {cart.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-3 text-xs bg-card">
                    <div>
                      <p className="font-bold">{item.name}</p>
                      <p className="text-3xs text-muted-foreground">
                        {item.qty} pcs x {formatRupiah(item.cost)} = <span className="font-semibold text-foreground">{formatRupiah(item.qty * item.cost)}</span>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="p-1 text-rose-500 hover:bg-rose-500/10 rounded cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center px-2 py-1.5 text-xs font-bold bg-muted/40 border border-border rounded-lg">
                <span>Estimasi Total Pengeluaran:</span>
                <span className="text-rose-500 text-sm">{formatRupiah(cartTotal)}</span>
              </div>
            </div>
          )}

          <div className="border-t border-border pt-4 flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setIsCreateOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" className="flex-1" disabled={cart.length === 0}>
              Kirim Invoice & Restock
            </Button>
          </div>
        </form>
      </Drawer>

      {/* 2. DRAWER - DETAILS */}
      <Drawer isOpen={!!selectedPurchase} onClose={() => setSelectedPurchaseId(null)} title={`Detail Restock ${selectedPurchase?.id}`}>
        {selectedPurchase && (
          <div className="space-y-6 text-xs">
            <div className="flex justify-between items-center p-4 bg-muted/30 border border-border rounded-xl">
              <div>
                <p className="text-4xs text-muted-foreground uppercase font-bold">Status Pengadaan</p>
                <p className="mt-1 font-semibold text-sm">
                  <Badge variant={selectedPurchase.status === 'Completed' ? 'success' : 'warning'}>
                    {selectedPurchase.status === 'Completed' ? 'Barang Diterima' : 'Menunggu Pengiriman'}
                  </Badge>
                </p>
              </div>
              <p className="text-right">
                <span className="text-4xs text-muted-foreground uppercase font-bold block">Tanggal Transaksi</span>
                <span className="font-bold text-sm">{selectedPurchase.date}</span>
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-muted-foreground">Supplier Mitra</p>
              <p className="font-bold text-sm text-foreground">{selectedPurchase.vendorName}</p>
              <p className="text-muted-foreground text-3xs">Vendor ID: {selectedPurchase.vendorId}</p>
            </div>

            {/* ITEM DETAILS TABLE */}
            <div className="border border-border/80 rounded-xl overflow-hidden">
              <div className="bg-muted/40 px-4 py-2 border-b border-border/60 font-semibold text-muted-foreground text-[10px] uppercase">
                Rincian Barang Yang Dibeli
              </div>
              <div className="divide-y divide-border/60">
                {selectedPurchase.items.map((item, i) => (
                  <div key={i} className="flex justify-between items-center p-4">
                    <div>
                      <p className="font-bold text-foreground">{item.name}</p>
                      <p className="text-muted-foreground mt-0.5">{item.qty} Unit x {formatRupiah(item.cost)}</p>
                    </div>
                    <span className="font-bold text-rose-500">{formatRupiah(item.qty * item.cost)}</span>
                  </div>
                ))}
              </div>
              <div className="bg-muted/30 p-4 border-t border-border/60 flex justify-between items-center font-bold text-sm">
                <span>Total Biaya Restock (Lunas)</span>
                <span className="text-rose-500">{formatRupiah(selectedPurchase.totalAmount)}</span>
              </div>
            </div>
          </div>
        )}
      </Drawer>

    </div>
  );
}
