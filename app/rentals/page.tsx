'use client';

import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { formatRupiah, Cylinder } from '../../context/mockData';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Input, Select } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Drawer } from '../../components/ui/Drawer';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Pagination } from '../../components/ui/Table';
import { Plus, Search, Eye, RefreshCw, Printer, Calendar, FileText, ChevronRight, X, Clock } from 'lucide-react';

export default function RentalsPage() {
  const { customers, cylinders, rentals, createRental, returnRental } = useData();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Returned' | 'Overdue'>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Drawer States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedRentalId, setSelectedRentalId] = useState<string | null>(null);
  
  // Return workflow states (inside Detail drawer)
  const [isReturnMode, setIsReturnMode] = useState(false);
  const [returnForm, setReturnForm] = useState({ actualReturnDate: '', cylinderStatus: 'Available' as Cylinder['status'] });

  // Creation form states
  const [createForm, setCreateForm] = useState({
    customerId: '',
    cylinderId: '',
    rentDate: '',
    returnDate: '',
    deposit: '',
    rentalFee: ''
  });

  // Handle URL searches (from dashboard quick search)
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const urlSearch = searchParams.get('search');
      if (urlSearch) {
        setSearchTerm(urlSearch);
      }
    }
  }, []);

  // Filtered rentals
  const filteredRentals = useMemo(() => {
    let result = [...rentals];

    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      result = result.filter(r =>
        r.customerName.toLowerCase().includes(query) ||
        r.cylinderSerial.toLowerCase().includes(query) ||
        r.id.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== 'All') {
      result = result.filter(r => r.status === statusFilter);
    }

    // Sort by rent date descending
    result.sort((a, b) => new Date(b.rentDate).getTime() - new Date(a.rentDate).getTime());

    return result;
  }, [rentals, searchTerm, statusFilter]);

  // Paginated rentals
  const paginatedRentals = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRentals.slice(start, start + itemsPerPage);
  }, [filteredRentals, currentPage]);

  const totalPages = Math.ceil(filteredRentals.length / itemsPerPage);

  const selectedRental = useMemo(() => {
    if (!selectedRentalId) return null;
    return rentals.find(r => r.id === selectedRentalId) || null;
  }, [rentals, selectedRentalId]);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.customerId || !createForm.cylinderId || !createForm.rentDate || !createForm.returnDate || !createForm.rentalFee) {
      alert('Harap lengkapi seluruh kolom wajib yang bertanda (*).');
      return;
    }
    createRental({
      customerId: createForm.customerId,
      cylinderId: createForm.cylinderId,
      rentDate: createForm.rentDate,
      returnDate: createForm.returnDate,
      deposit: Number(createForm.deposit) || 0,
      rentalFee: Number(createForm.rentalFee) || 0
    });
    setIsCreateOpen(false);
    setCreateForm({ customerId: '', cylinderId: '', rentDate: '', returnDate: '', deposit: '', rentalFee: '' });
  };

  const handleReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRentalId || !returnForm.actualReturnDate) {
      alert('Tanggal pengembalian wajib diisi.');
      return;
    }
    returnRental(selectedRentalId, returnForm.actualReturnDate, returnForm.cylinderStatus);
    setIsReturnMode(false);
    setSelectedRentalId(null);
  };

  const openDetails = (id: string) => {
    setSelectedRentalId(id);
    setIsReturnMode(false);
    setReturnForm({
      actualReturnDate: new Date().toISOString().split('T')[0],
      cylinderStatus: 'Available'
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Sewa Tabung Oksigen</h2>
          <p className="text-xs text-muted-foreground mt-1">Buat kontrak persewaan tabung oksigen baru, monitoring batas waktu, dan proses pengembalian tabung.</p>
        </div>
        <Button size="sm" className="flex items-center gap-1.5" onClick={() => setIsCreateOpen(true)}>
          <Plus className="w-4 h-4" /> Sewa Baru
        </Button>
      </div>

      {/* Filter and Search Card */}
      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Cari sewa berdasarkan nama customer, serial tabung, ID sewa..."
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="flex h-10 w-full rounded-lg border border-border bg-background pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:border-border/60"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <Select
              id="filterStatus"
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value as any); setCurrentPage(1); }}
              options={[
                { value: 'All', label: 'Semua Status' },
                { value: 'Active', label: 'Aktif' },
                { value: 'Overdue', label: 'Overdue (Terlambat)' },
                { value: 'Returned', label: 'Sudah Kembali' }
              ]}
              className="w-full sm:w-44"
            />
          </div>
        </CardContent>
      </Card>

      {/* Rentals Table */}
      <Card>
        <CardContent className="p-0">
          {paginatedRentals.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-24">ID Sewa</TableHead>
                    <TableHead>Nama Customer</TableHead>
                    <TableHead>Serial Tabung (SN)</TableHead>
                    <TableHead>Tanggal Pinjam</TableHead>
                    <TableHead>Batas Kembali</TableHead>
                    <TableHead>Total Biaya</TableHead>
                    <TableHead className="w-24 text-center">Status</TableHead>
                    <TableHead className="w-24 text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRentals.map(rent => {
                    const statusColors = {
                      Active: 'success',
                      Overdue: 'warning',
                      Returned: 'secondary'
                    };
                    const statusLabels = {
                      Active: 'Aktif',
                      Overdue: 'Terlambat',
                      Returned: 'Kembali'
                    };
                    return (
                      <TableRow key={rent.id}>
                        <TableCell className="font-bold text-xs">{rent.id}</TableCell>
                        <TableCell className="font-semibold text-foreground">{rent.customerName}</TableCell>
                        <TableCell className="font-semibold text-xs text-primary">{rent.cylinderSerial}</TableCell>
                        <TableCell className="text-xs">{rent.rentDate}</TableCell>
                        <TableCell className="text-xs">
                          <span className={rent.status === 'Overdue' ? 'text-rose-500 font-bold' : ''}>
                            {rent.returnDate}
                          </span>
                        </TableCell>
                        <TableCell className="font-bold text-xs">{formatRupiah(rent.rentalFee)}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant={statusColors[rent.status] as any}>{statusLabels[rent.status]}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline" className="h-8 px-2.5 flex items-center gap-1 cursor-pointer" onClick={() => openDetails(rent.id)}>
                            <Eye className="w-3.5 h-3.5" /> Detail
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={filteredRentals.length}
                itemsPerPage={itemsPerPage}
              />
            </>
          ) : (
            <div className="py-24 text-center flex flex-col items-center justify-center gap-3">
              <Clock className="w-12 h-12 text-muted-foreground/45" />
              <h3 className="text-base font-bold text-foreground">Tidak Ada Sewa</h3>
              <p className="text-xs text-muted-foreground max-w-sm">
                Tidak ada data kontrak rental tabung oksigen yang cocok dengan filter atau kata kunci Anda.
              </p>
              <Button size="sm" variant="outline" className="mt-2" onClick={() => { setSearchTerm(''); setStatusFilter('All'); }}>
                Reset Filter
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 1. DRAWER - CREATE RENTAL */}
      <Drawer isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Buat Kontrak Sewa Tabung Baru">
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <Select
            label="Pilih Pelanggan (Customer) *"
            id="rentCustSelect"
            value={createForm.customerId}
            onChange={e => setCreateForm({ ...createForm, customerId: e.target.value })}
            options={[
              { value: '', label: '-- Pilih Pelanggan --' },
              ...customers.filter(c => c.status === 'Active').map(c => ({ value: c.id, label: `${c.id} - ${c.name}` }))
            ]}
          />
          <Select
            label="Pilih Tabung Baja Tersedia (Ready) *"
            id="rentCylSelect"
            value={createForm.cylinderId}
            onChange={e => setCreateForm({ ...createForm, cylinderId: e.target.value })}
            options={[
              { value: '', label: '-- Pilih Tabung --' },
              ...cylinders.filter(c => c.status === 'Available').map(c => ({ value: c.id, label: `SN: ${c.serialNo} (${c.size} | ${c.oxygenType})` }))
            ]}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Tanggal Sewa (Mulai) *"
              id="rentDateInput"
              type="date"
              value={createForm.rentDate}
              onChange={e => setCreateForm({ ...createForm, rentDate: e.target.value })}
            />
            <Input
              label="Batas Kembali (Due Date) *"
              id="rentReturnInput"
              type="date"
              value={createForm.returnDate}
              onChange={e => setCreateForm({ ...createForm, returnDate: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Biaya Jaminan (Deposit) (Rp)"
              id="rentDepositInput"
              type="number"
              placeholder="e.g. 200000"
              value={createForm.deposit}
              onChange={e => setCreateForm({ ...createForm, deposit: e.target.value })}
            />
            <Input
              label="Biaya Sewa Penggunaan (Rp) *"
              id="rentFeeInput"
              type="number"
              placeholder="e.g. 50000"
              value={createForm.rentalFee}
              onChange={e => setCreateForm({ ...createForm, rentalFee: e.target.value })}
            />
          </div>
          <div className="bg-muted/40 p-4 rounded-lg border border-border text-xs leading-relaxed space-y-1">
            <p className="font-bold text-foreground">💡 Ketentuan Sewa:</p>
            <p>1. Uang jaminan (deposit) akan dikembalikan penuh saat tabung dikembalikan dalam keadaan baik.</p>
            <p>2. Denda keterlambatan berlaku otomatis jika melewati batas pengembalian.</p>
          </div>
          <div className="border-t border-border pt-4 flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setIsCreateOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="success" className="flex-1">
              Buat Sewa Kontrak
            </Button>
          </div>
        </form>
      </Drawer>

      {/* 2. DRAWER - RENTAL DETAIL & WORKFLOW */}
      <Drawer isOpen={!!selectedRental} onClose={() => setSelectedRentalId(null)} title={`Detail Kontrak ${selectedRental?.id}`}>
        {selectedRental && (
          <div className="space-y-6">
            
            {/* Status overview */}
            <div className="flex items-center justify-between p-4 bg-muted/30 border border-border rounded-xl">
              <div>
                <span className="text-3xs font-bold uppercase tracking-wider text-muted-foreground">Status Kontrak</span>
                <div className="mt-1 flex items-center gap-2">
                  <Badge variant={selectedRental.status === 'Active' ? 'success' : selectedRental.status === 'Overdue' ? 'warning' : 'secondary' as any}>
                    {selectedRental.status === 'Active' ? 'Aktif' : selectedRental.status === 'Overdue' ? 'Terlambat' : 'Sudah Kembali'}
                  </Badge>
                </div>
              </div>
              <div>
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 border border-border bg-card hover:bg-accent rounded-lg cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" /> Cetak Invoice
                </button>
              </div>
            </div>

            {/* Rental Information */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <p className="text-muted-foreground">Customer</p>
                <p className="font-bold text-foreground text-sm">{selectedRental.customerName}</p>
                <p className="text-muted-foreground">ID: {selectedRental.customerId}</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">Tabung Sewa</p>
                <p className="font-bold text-foreground text-sm">{selectedRental.cylinderSerial}</p>
                <p className="text-muted-foreground">ID Tabung: {selectedRental.cylinderId}</p>
              </div>
            </div>

            {/* Timeline */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Linimasa Penyerahan Tabung</h4>
              <div className="relative border-l border-border pl-4 space-y-4 py-2 ml-1 text-xs">
                
                {/* 1. Issued */}
                <div className="relative">
                  <span className="absolute -left-[21px] mt-1 flex h-2.5 w-2.5 rounded-full bg-emerald-500 ring-4 ring-card" />
                  <div>
                    <p className="font-bold text-foreground">Kontrak Dibuat & Disetujui</p>
                    <p className="text-3xs text-muted-foreground mt-0.5">{selectedRental.rentDate} • Oleh Admin Gudang</p>
                  </div>
                </div>

                {/* 2. Deposit Received */}
                <div className="relative">
                  <span className="absolute -left-[21px] mt-1 flex h-2.5 w-2.5 rounded-full bg-emerald-500 ring-4 ring-card" />
                  <div>
                    <p className="font-bold text-foreground">Deposit diterima kasir</p>
                    <p className="text-3xs text-muted-foreground mt-0.5">Nominal: {formatRupiah(selectedRental.deposit)} • LUNAS</p>
                  </div>
                </div>

                {/* 3. In Rent */}
                <div className="relative">
                  <span className="absolute -left-[21px] mt-1 flex h-2.5 w-2.5 rounded-full bg-blue-500 ring-4 ring-card animate-pulse" />
                  <div>
                    <p className="font-bold text-foreground">Tabung Dibawa Pelanggan</p>
                    <p className="text-3xs text-muted-foreground mt-0.5">Batas waktu pengembalian: <span className="font-bold text-foreground">{selectedRental.returnDate}</span></p>
                  </div>
                </div>

                {/* 4. Returned */}
                {selectedRental.status === 'Returned' && (
                  <div className="relative">
                    <span className="absolute -left-[21px] mt-1 flex h-2.5 w-2.5 rounded-full bg-slate-500 ring-4 ring-card" />
                    <div>
                      <p className="font-bold text-foreground">Tabung Kembali Ke Gudang</p>
                      <p className="text-3xs text-muted-foreground mt-0.5">Selesai pada: {selectedRental.actualReturnDate} • Jaminan Dikembalikan</p>
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* INVOICE PREVIEW CARD */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Pratinjau Invoice Sewa</h4>
              <div className="border border-border/80 rounded-xl p-5 bg-card text-foreground font-sans relative overflow-hidden text-xs">
                
                {/* Invoice header */}
                <div className="flex justify-between border-b border-border/60 pb-3 items-start">
                  <div>
                    <h3 className="font-extrabold text-sm text-primary tracking-tight">Oksigen24Medis</h3>
                    <p className="text-4xs text-muted-foreground mt-0.5">Gudang Medis Oksigen Cabang Bandung</p>
                  </div>
                  <div className="text-right">
                    <h4 className="font-bold text-xs uppercase tracking-wider">INVOICE SEWA</h4>
                    <p className="text-4xs text-muted-foreground mt-0.5">Ref: INV-{selectedRental.id}</p>
                  </div>
                </div>

                {/* Invoice addresses */}
                <div className="grid grid-cols-2 gap-4 py-3 border-b border-border/40 text-[10px] leading-tight">
                  <div>
                    <p className="text-muted-foreground">Ditagihkan Ke:</p>
                    <p className="font-bold mt-0.5">{selectedRental.customerName}</p>
                    <p className="text-muted-foreground mt-0.5">ID: {selectedRental.customerId}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-muted-foreground">Detail Tanggal:</p>
                    <p className="font-medium mt-0.5">Sewa: {selectedRental.rentDate}</p>
                    <p className="font-medium text-rose-500 mt-0.5">Tempo: {selectedRental.returnDate}</p>
                  </div>
                </div>

                {/* Table items */}
                <div className="py-3 border-b border-border/40">
                  <div className="grid grid-cols-3 font-semibold pb-1 border-b border-border/20 text-[10px] text-muted-foreground">
                    <div>Deskripsi Item</div>
                    <div className="text-center">Jaminan (Deposit)</div>
                    <div className="text-right">Biaya Sewa</div>
                  </div>
                  <div className="grid grid-cols-3 py-2 text-[10px] leading-tight items-center">
                    <div>
                      <p className="font-bold">Sewa Tabung Gas Baja</p>
                      <p className="text-4xs text-muted-foreground">SN: {selectedRental.cylinderSerial}</p>
                    </div>
                    <div className="text-center font-medium">{formatRupiah(selectedRental.deposit)}</div>
                    <div className="text-right font-bold text-emerald-600 dark:text-emerald-400">{formatRupiah(selectedRental.rentalFee)}</div>
                  </div>
                </div>

                {/* Totals */}
                <div className="py-3 text-[10px] leading-relaxed flex flex-col items-end">
                  <div className="flex justify-between w-40 text-muted-foreground">
                    <span>Subtotal Sewa</span>
                    <span className="font-semibold text-foreground">{formatRupiah(selectedRental.rentalFee)}</span>
                  </div>
                  <div className="flex justify-between w-40 text-muted-foreground border-b border-border/20 pb-1">
                    <span>Jaminan Jasa</span>
                    <span className="font-semibold text-foreground">{formatRupiah(selectedRental.deposit)}</span>
                  </div>
                  <div className="flex justify-between w-40 font-bold text-xs pt-1">
                    <span>Total Bayar</span>
                    <span>{formatRupiah(selectedRental.rentalFee + selectedRental.deposit)}</span>
                  </div>
                </div>

                {/* Terms */}
                <div className="border-t border-border/40 pt-2 text-[8px] text-center text-muted-foreground">
                  Terima kasih atas kepercayaan Anda. Tabung harap dikembalikan sebelum batas waktu untuk menghindari denda harian.
                </div>
              </div>
            </div>

            {/* RETURN WORKFLOW CONTROLS */}
            {selectedRental.status !== 'Returned' && (
              <div className="border-t border-border pt-4">
                {!isReturnMode ? (
                  <Button variant="success" className="w-full flex items-center justify-center gap-1.5" onClick={() => setIsReturnMode(true)}>
                    <RefreshCw className="w-4 h-4 animate-spin-slow" /> Proses Pengembalian Tabung
                  </Button>
                ) : (
                  <form onSubmit={handleReturnSubmit} className="space-y-4 bg-muted/30 p-4 rounded-xl border border-border">
                    <h4 className="text-xs font-bold text-foreground">Konfirmasi Pengembalian</h4>
                    <Input
                      label="Tanggal Pengembalian *"
                      id="returnFormDate"
                      type="date"
                      value={returnForm.actualReturnDate}
                      onChange={e => setReturnForm({ ...returnForm, actualReturnDate: e.target.value })}
                    />
                    <Select
                      label="Kondisi Akhir Tabung Baja *"
                      id="returnFormStatus"
                      value={returnForm.cylinderStatus}
                      onChange={e => setReturnForm({ ...returnForm, cylinderStatus: e.target.value as any })}
                      options={[
                        { value: 'Available', label: 'Tersedia (Ready untuk disewa lagi)' },
                        { value: 'Maintenance', label: 'Kotor / Perlu Servis Valve (Maintenance)' }
                      ]}
                    />
                    <div className="flex gap-2.5">
                      <Button type="button" variant="outline" className="flex-1" onClick={() => setIsReturnMode(false)}>Batal</Button>
                      <Button type="submit" variant="success" className="flex-1">Selesaikan Kontrak</Button>
                    </div>
                  </form>
                )}
              </div>
            )}

          </div>
        )}
      </Drawer>

    </div>
  );
}
