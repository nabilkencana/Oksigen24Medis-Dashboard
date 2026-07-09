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
import { Plus, Search, Eye, ShoppingCart, User, PlusCircle, Trash2, Printer } from 'lucide-react';

export default function SalesPage() {
  const { customers, products, sales, createSale } = useData();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Drawer states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);

  // Form State (New Sale)
  const [customerId, setCustomerId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Transfer' | 'E-Wallet'>('Cash');
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);

  // Shopping Cart items for POS builder
  const [cart, setCart] = useState<Array<{ productId: string; name: string; qty: number; price: number }>>([]);
  const [currentItem, setCurrentItem] = useState({ productId: '', qty: '1' });

  // Calculations
  const todayStr = new Date().toISOString().split('T')[0];
  const totalSalesToday = sales
    .filter(s => s.date === todayStr && s.status === 'Paid')
    .reduce((sum, s) => sum + s.totalAmount, 0);

  const totalSalesCountToday = sales.filter(s => s.date === todayStr).length;

  // Add item to cart
  const handleAddItem = () => {
    if (!currentItem.productId) {
      alert('Pilih produk terlebih dahulu.');
      return;
    }
    const product = products.find(p => p.id === currentItem.productId);
    if (!product) return;

    if (product.stock < Number(currentItem.qty)) {
      alert(`Stok tidak mencukupi. Sisa stok: ${product.stock} unit.`);
      return;
    }

    // Check if product already in cart
    const existingIndex = cart.findIndex(i => i.productId === currentItem.productId);
    const qty = Number(currentItem.qty) || 1;
    
    if (existingIndex > -1) {
      const nextCart = [...cart];
      if (product.stock < (nextCart[existingIndex].qty + qty)) {
        alert(`Stok tidak mencukupi untuk jumlah akumulasi. Sisa stok: ${product.stock} unit.`);
        return;
      }
      nextCart[existingIndex].qty += qty;
      setCart(nextCart);
    } else {
      setCart([...cart, {
        productId: product.id,
        name: product.name,
        qty,
        price: product.price
      }]);
    }
    // reset item select
    setCurrentItem({ productId: '', qty: '1' });
  };

  // Remove item from cart
  const handleRemoveItem = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.qty * item.price), 0);
  }, [cart]);

  const handleSaleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || cart.length === 0 || !saleDate) {
      alert('Harap pilih customer, tanggal, dan tambahkan minimal 1 item produk.');
      return;
    }
    createSale({
      customerId,
      items: cart,
      date: saleDate,
      paymentMethod
    });
    setIsCreateOpen(false);
    setCart([]);
    setCustomerId('');
  };

  // Filtered Sales
  const filteredSales = useMemo(() => {
    let result = [...sales];

    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      result = result.filter(s =>
        s.customerName.toLowerCase().includes(query) ||
        s.id.toLowerCase().includes(query)
      );
    }

    result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return result;
  }, [sales, searchTerm]);

  // Paginated sales
  const paginatedSales = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredSales.slice(start, start + itemsPerPage);
  }, [filteredSales, currentPage]);

  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);

  const selectedSale = useMemo(() => {
    if (!selectedSaleId) return null;
    return sales.find(s => s.id === selectedSaleId) || null;
  }, [sales, selectedSaleId]);

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Penjualan Retail (Sales Cashier)</h2>
          <p className="text-xs text-muted-foreground mt-1">Kasir POS penjualan regulator, troli tabung, masker pernapasan, dan kelengkapan medis retail.</p>
        </div>
        <Button size="sm" className="flex items-center gap-1.5" onClick={() => {
          setCart([]);
          setCustomerId('');
          setSaleDate(new Date().toISOString().split('T')[0]);
          setIsCreateOpen(true);
        }}>
          <Plus className="w-4 h-4" /> Kasir POS Baru
        </Button>
      </div>

      {/* Top Summaries */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-2xs font-bold text-muted-foreground uppercase tracking-wider">Omset Kasir POS Hari Ini</p>
              <p className="text-xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">{formatRupiah(totalSalesToday)}</p>
              <p className="text-4xs text-muted-foreground mt-1">Akumulasi penjualan retail tunai & e-wallet</p>
            </div>
            <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-500 shrink-0">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-2xs font-bold text-muted-foreground uppercase tracking-wider">Jumlah Struk Transaksi Hari Ini</p>
              <p className="text-xl font-bold mt-1 text-blue-500">{totalSalesCountToday} Transaksi</p>
              <p className="text-4xs text-muted-foreground mt-1">Struk penjualan terbit hari ini</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500/10 text-blue-500 shrink-0">
              <User className="w-5 h-5" />
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
              placeholder="Cari struk berdasarkan nama pelanggan, ID penjualan..."
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="flex h-10 w-full rounded-lg border border-border bg-background pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:border-border/60"
            />
          </div>
        </CardContent>
      </Card>

      {/* Sales Table */}
      <Card>
        <CardContent className="p-0">
          {paginatedSales.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-24">ID Struk</TableHead>
                    <TableHead>Nama Pelanggan</TableHead>
                    <TableHead>Metode Bayar</TableHead>
                    <TableHead>Total Belanja</TableHead>
                    <TableHead>Tanggal Beli</TableHead>
                    <TableHead className="w-24 text-center">Status</TableHead>
                    <TableHead className="w-24 text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedSales.map(sale => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-bold text-xs">{sale.id}</TableCell>
                      <TableCell className="font-semibold text-foreground">{sale.customerName}</TableCell>
                      <TableCell className="text-xs">{sale.paymentMethod}</TableCell>
                      <TableCell className="font-bold text-xs text-emerald-600 dark:text-emerald-400">{formatRupiah(sale.totalAmount)}</TableCell>
                      <TableCell className="text-xs">{sale.date}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="success">LUNAS</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" className="h-8 px-2.5 flex items-center gap-1 cursor-pointer" onClick={() => setSelectedSaleId(sale.id)}>
                          <Eye className="w-3.5 h-3.5" /> Struk
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
                totalItems={filteredSales.length}
                itemsPerPage={itemsPerPage}
              />
            </>
          ) : (
            <div className="py-24 text-center flex flex-col items-center justify-center gap-3">
              <ShoppingCart className="w-12 h-12 text-muted-foreground/45" />
              <h3 className="text-base font-bold text-foreground">Tidak Ada Transaksi</h3>
              <p className="text-xs text-muted-foreground max-w-sm">
                Belum ada transaksi struk kasir penjualan retail di sistem kami.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 1. DRAWER - CREATE SALE (POS) */}
      <Drawer isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Buka Kasir POS Oksigen24Medis">
        <form onSubmit={handleSaleSubmit} className="space-y-4">
          <Select
            label="Pilih Pelanggan *"
            id="saleVendor"
            value={customerId}
            onChange={e => setCustomerId(e.target.value)}
            options={[
              { value: '', label: '-- Pilih Customer --' },
              ...customers.filter(c => c.status === 'Active').map(c => ({ value: c.id, label: c.name }))
            ]}
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Metode Pembayaran *"
              id="salePay"
              value={paymentMethod}
              onChange={e => setPaymentMethod(e.target.value as any)}
              options={[
                { value: 'Cash', label: 'Cash (Tunai)' },
                { value: 'Transfer', label: 'Transfer Bank (Lunas)' },
                { value: 'E-Wallet', label: 'E-Wallet (GoPay/OVO)' }
              ]}
            />
            <Input
              label="Tanggal Penjualan *"
              id="saleDate"
              type="date"
              value={saleDate}
              onChange={e => setSaleDate(e.target.value)}
            />
          </div>

          {/* ITEM SELECTOR */}
          <div className="border border-border rounded-xl p-4 bg-muted/20 space-y-3">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Tambah Item Belanja</h4>
            <div className="grid grid-cols-3 gap-2 items-end">
              <div className="col-span-2">
                <Select
                  label="Pilih Produk *"
                  id="saleCartItem"
                  value={currentItem.productId}
                  onChange={e => setCurrentItem({ ...currentItem, productId: e.target.value })}
                  options={[
                    { value: '', label: '-- Pilih Produk --' },
                    ...products.filter(p => p.stock > 0).map(p => ({ value: p.id, label: `${p.name} (Stok: ${p.stock} | Price: ${formatRupiah(p.price)})` }))
                  ]}
                />
              </div>
              <Input
                label="Jumlah *"
                id="saleCartQty"
                type="number"
                min="1"
                value={currentItem.qty}
                onChange={e => setCurrentItem({ ...currentItem, qty: e.target.value })}
              />
            </div>
            <Button type="button" size="sm" variant="outline" className="w-full flex items-center justify-center gap-1 mt-2 cursor-pointer" onClick={handleAddItem}>
              <PlusCircle className="w-4 h-4" /> Tambah Keranjang
            </Button>
          </div>

          {/* CART VIEW */}
          {cart.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Daftar Belanja</h4>
              <div className="border border-border rounded-xl divide-y divide-border overflow-hidden">
                {cart.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-3 text-xs bg-card">
                    <div>
                      <p className="font-bold">{item.name}</p>
                      <p className="text-3xs text-muted-foreground">
                        {item.qty} unit x {formatRupiah(item.price)} = <span className="font-semibold text-foreground">{formatRupiah(item.qty * item.price)}</span>
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
                <span>Total Belanja:</span>
                <span className="text-emerald-600 dark:text-emerald-400 text-sm">{formatRupiah(cartTotal)}</span>
              </div>
            </div>
          )}

          <div className="border-t border-border pt-4 flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setIsCreateOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="success" className="flex-1" disabled={cart.length === 0}>
              Bayar Lunas Struk
            </Button>
          </div>
        </form>
      </Drawer>

      {/* 2. DRAWER - RECEIPT DETAIL */}
      <Drawer isOpen={!!selectedSale} onClose={() => setSelectedSaleId(null)} title={`Pratinjau Struk ${selectedSale?.id}`}>
        {selectedSale && (
          <div className="space-y-6 text-xs">
            <div className="flex justify-between items-center p-4 bg-muted/30 border border-border rounded-xl">
              <div>
                <p className="text-4xs text-muted-foreground uppercase font-bold">Metode Pembayaran</p>
                <p className="mt-1 font-semibold text-sm">{selectedSale.paymentMethod}</p>
              </div>
              <p className="text-right">
                <span className="text-4xs text-muted-foreground uppercase font-bold block">Tanggal Transaksi</span>
                <span className="font-bold text-sm">{selectedSale.date}</span>
              </p>
            </div>

            {/* RETAIL RECEIPT PREVIEW */}
            <div>
              <div className="border border-dashed border-border p-6 bg-card text-foreground font-mono relative overflow-hidden text-xs max-w-sm mx-auto shadow-inner space-y-4">
                
                {/* Header */}
                <div className="text-center border-b border-dashed border-border pb-4 space-y-1">
                  <h3 className="font-bold text-base tracking-tight">OKSIGEN24MEDIS</h3>
                  <p className="text-5xs text-muted-foreground">Jl. Gatot Subroto No. 45, Bandung</p>
                  <p className="text-5xs text-muted-foreground">WA: 0812-3456-7890</p>
                </div>

                {/* Info block */}
                <div className="text-[10px] space-y-0.5 border-b border-dashed border-border pb-3">
                  <div className="flex justify-between">
                    <span>No. Struk:</span>
                    <span className="font-bold">{selectedSale.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tanggal:</span>
                    <span>{selectedSale.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Customer:</span>
                    <span>{selectedSale.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Kasir:</span>
                    <span>Admin ERP</span>
                  </div>
                </div>

                {/* Items */}
                <div className="border-b border-dashed border-border pb-3 space-y-2">
                  {selectedSale.items.map((item, i) => (
                    <div key={i} className="text-[10px] space-y-0.5">
                      <div className="flex justify-between font-bold">
                        <span>{item.name}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground text-3xs">
                        <span>{item.qty} pcs x {formatRupiah(item.price)}</span>
                        <span>{formatRupiah(item.qty * item.price)}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="space-y-1 text-[10px]">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatRupiah(selectedSale.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Pajak PPN (0%):</span>
                    <span>Rp 0</span>
                  </div>
                  <div className="flex justify-between font-bold border-t border-dashed border-border pt-2 text-xs">
                    <span>Total Belanja:</span>
                    <span>{formatRupiah(selectedSale.totalAmount)}</span>
                  </div>
                </div>

                {/* Method */}
                <div className="text-center font-bold border-t border-dashed border-border pt-4 text-xs tracking-widest text-emerald-600 dark:text-emerald-400">
                  *** LUNAS ({selectedSale.paymentMethod.toUpperCase()}) ***
                </div>

                <div className="text-[9px] text-center text-muted-foreground pt-2">
                  Barang yang sudah dibeli tidak dapat ditukar/dikembalikan. Terima kasih!
                </div>
              </div>
            </div>

            {/* Actions */}
            <Button className="w-full flex items-center justify-center gap-1.5" onClick={() => window.print()}>
              <Printer className="w-4 h-4" /> Cetak Salinan Struk
            </Button>
          </div>
        )}
      </Drawer>

    </div>
  );
}
