'use client';

import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Drawer } from '../../components/ui/Drawer';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Pagination } from '../../components/ui/Table';
import { Plus, Search, ArrowRightLeft, ArrowUpRight, ArrowDownRight, Edit3, Filter, X } from 'lucide-react';

export default function StockMovementsPage() {
  const { products, stockMovements, createStockMovement } = useData();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'All' | 'Incoming' | 'Outgoing' | 'Adjustment'>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Drawer state
  const [isAdjustmentOpen, setIsAdjustmentOpen] = useState(false);

  // Form State
  const [adjustForm, setAdjustForm] = useState({
    itemId: '',
    type: 'Adjustment' as 'Incoming' | 'Outgoing' | 'Adjustment',
    quantity: '1',
    reason: ''
  });

  // Calculations
  const incomingCount = stockMovements.filter(m => m.type === 'Incoming').length;
  const outgoingCount = stockMovements.filter(m => m.type === 'Outgoing').length;
  const adjustmentCount = stockMovements.filter(m => m.type === 'Adjustment').length;

  // Filtered Stock Movements
  const filteredMovements = useMemo(() => {
    let result = [...stockMovements];

    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      result = result.filter(m =>
        m.itemName.toLowerCase().includes(query) ||
        m.itemId.toLowerCase().includes(query) ||
        m.id.toLowerCase().includes(query) ||
        m.reason.toLowerCase().includes(query)
      );
    }

    if (typeFilter !== 'All') {
      result = result.filter(m => m.type === typeFilter);
    }

    // Sort by date descending
    result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return result;
  }, [stockMovements, searchTerm, typeFilter]);

  // Paginated movements
  const paginatedMovements = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredMovements.slice(start, start + itemsPerPage);
  }, [filteredMovements, currentPage]);

  const totalPages = Math.ceil(filteredMovements.length / itemsPerPage);

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustForm.itemId || !adjustForm.quantity || !adjustForm.reason) {
      alert('Harap lengkapi seluruh kolom wajib.');
      return;
    }
    const item = products.find(p => p.id === adjustForm.itemId);
    if (!item) return;

    createStockMovement({
      itemId: adjustForm.itemId,
      itemName: item.name,
      itemType: 'Product',
      type: adjustForm.type,
      quantity: Number(adjustForm.quantity),
      reason: adjustForm.reason
    });
    setIsAdjustmentOpen(false);
    setAdjustForm({ itemId: '', type: 'Adjustment', quantity: '1', reason: '' });
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Logistik & Mutasi Stok Gudang</h2>
          <p className="text-xs text-muted-foreground mt-1">Audit mutasi pergudangan, restock produk, pelacakan bongkar muat, dan penyesuaian stok opname manual.</p>
        </div>
        <Button size="sm" className="flex items-center gap-1.5" onClick={() => setIsAdjustmentOpen(true)}>
          <Plus className="w-4 h-4" /> Koreksi Stok Opname
        </Button>
      </div>

      {/* Grid Summaries */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-2xs font-bold text-muted-foreground uppercase tracking-wider">Total Masuk (Incoming)</p>
              <p className="text-xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">{incomingCount} Log Mutasi</p>
              <p className="text-4xs text-muted-foreground mt-1">Restock supplier & return sewa</p>
            </div>
            <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-500 shrink-0">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-2xs font-bold text-muted-foreground uppercase tracking-wider">Total Keluar (Outgoing)</p>
              <p className="text-xl font-bold mt-1 text-blue-500">{outgoingCount} Log Mutasi</p>
              <p className="text-4xs text-muted-foreground mt-1">Penjualan kasir & pengiriman sewa</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500/10 text-blue-500 shrink-0">
              <ArrowDownRight className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-2xs font-bold text-muted-foreground uppercase tracking-wider">Koreksi Opname (Adjustments)</p>
              <p className="text-xl font-bold mt-1 text-amber-500">{adjustmentCount} Koreksi</p>
              <p className="text-4xs text-muted-foreground mt-1">Penyesuaian manual stock-opname</p>
            </div>
            <div className="p-3 rounded-lg bg-amber-500/10 text-amber-500 shrink-0">
              <Edit3 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Card */}
      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Cari log mutasi berdasarkan nama item, ID item, keterangan..."
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="flex h-10 w-full rounded-lg border border-border bg-background pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:border-border/60"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <Select
              id="filterType"
              value={typeFilter}
              onChange={e => { setTypeFilter(e.target.value as any); setCurrentPage(1); }}
              options={[
                { value: 'All', label: 'Semua Tipe Mutasi' },
                { value: 'Incoming', label: 'Barang Masuk (Incoming)' },
                { value: 'Outgoing', label: 'Barang Keluar (Outgoing)' },
                { value: 'Adjustment', label: 'Penyesuaian (Adjustment)' }
              ]}
              className="w-full sm:w-48"
            />
          </div>
        </CardContent>
      </Card>

      {/* Movements Table */}
      <Card>
        <CardContent className="p-0">
          {paginatedMovements.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-24">ID Mutasi</TableHead>
                    <TableHead>Nama Item Gudang</TableHead>
                    <TableHead>ID / Kode Item</TableHead>
                    <TableHead>Tipe</TableHead>
                    <TableHead className="text-center w-24">Jumlah Qty</TableHead>
                    <TableHead>Tanggal Mutasi</TableHead>
                    <TableHead>Keperluan / Alasan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedMovements.map(mvt => {
                    const badgeColors = {
                      Incoming: 'success',
                      Outgoing: 'info',
                      Adjustment: 'warning'
                    };
                    const badgeLabels = {
                      Incoming: 'Masuk',
                      Outgoing: 'Keluar',
                      Adjustment: 'Koreksi'
                    };
                    return (
                      <TableRow key={mvt.id}>
                        <TableCell className="font-bold text-xs">{mvt.id}</TableCell>
                        <TableCell className="font-semibold text-foreground">{mvt.itemName}</TableCell>
                        <TableCell className="text-xs font-semibold text-primary">{mvt.itemId}</TableCell>
                        <TableCell>
                          <Badge variant={badgeColors[mvt.type] as any}>{badgeLabels[mvt.type]}</Badge>
                        </TableCell>
                        <TableCell className={`text-center font-bold text-sm ${
                          mvt.type === 'Incoming' ? 'text-emerald-500' : mvt.type === 'Outgoing' ? 'text-blue-500' : 'text-amber-500'
                        }`}>
                          {mvt.type === 'Incoming' ? '+' : mvt.type === 'Outgoing' ? '-' : '±'}{mvt.quantity}
                        </TableCell>
                        <TableCell className="text-xs">{mvt.date}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{mvt.reason}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={filteredMovements.length}
                itemsPerPage={itemsPerPage}
              />
            </>
          ) : (
            <div className="py-24 text-center flex flex-col items-center justify-center gap-3">
              <ArrowRightLeft className="w-12 h-12 text-muted-foreground/45" />
              <h3 className="text-base font-bold text-foreground">Tidak Ada Mutasi</h3>
              <p className="text-xs text-muted-foreground max-w-sm">
                Belum ada pergerakan stok gudang masuk atau keluar yang sesuai dengan kriteria filter.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 1. DRAWER - MANUAL CORRECTION */}
      <Drawer isOpen={isAdjustmentOpen} onClose={() => setIsAdjustmentOpen(false)} title="Input Koreksi Stok Opname Manual">
        <form onSubmit={handleAdjustSubmit} className="space-y-4">
          <Select
            label="Pilih Item / Produk Gudang *"
            id="adjustItemId"
            value={adjustForm.itemId}
            onChange={e => setAdjustForm({ ...adjustForm, itemId: e.target.value })}
            options={[
              { value: '', label: '-- Pilih Produk Katalog --' },
              ...products.map(p => ({ value: p.id, label: `${p.name} (ID: ${p.id} | Stok: ${p.stock})` }))
            ]}
          />
          <Select
            label="Jenis Koreksi / Mutasi *"
            id="adjustType"
            value={adjustForm.type}
            onChange={e => setAdjustForm({ ...adjustForm, type: e.target.value as any })}
            options={[
              { value: 'Adjustment', label: 'Koreksi Stok Opname (Over-write)' },
              { value: 'Incoming', label: 'Tambah Stok Masuk (+ Qty)' },
              { value: 'Outgoing', label: 'Kurangi Stok Keluar (- Qty)' }
            ]}
          />
          <Input
            label="Kuantitas Qty Koreksi *"
            id="adjustQty"
            type="number"
            min="1"
            value={adjustForm.quantity}
            onChange={e => setAdjustForm({ ...adjustForm, quantity: e.target.value })}
          />
          <Textarea
            label="Alasan Koreksi / Nomor Dokumen Berita Acara *"
            id="adjustReason"
            placeholder="e.g. Ditemukan selisih 2 regulator rusak di pojok gudang saat opname 9 Juli..."
            value={adjustForm.reason}
            onChange={e => setAdjustForm({ ...adjustForm, reason: e.target.value })}
          />
          <div className="border-t border-border pt-4 flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setIsAdjustmentOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" className="flex-1">
              Simpan Koreksi
            </Button>
          </div>
        </form>
      </Drawer>

    </div>
  );
}
