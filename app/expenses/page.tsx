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
import { Plus, Search, Eye, FileText, CheckCircle2, AlertTriangle, Upload, X, Check } from 'lucide-react';

export default function ExpensesPage() {
  const { expenses, createExpense, approveExpense } = useData();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'All' | 'Operational' | 'Utilities' | 'Rent' | 'Refills' | 'Marketing' | 'Salaries' | 'Other'>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Drawer states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(null);

  // Form State
  const [formFields, setFormFields] = useState({
    category: 'Operational' as 'Operational' | 'Utilities' | 'Rent' | 'Refills' | 'Marketing' | 'Salaries' | 'Other',
    description: '',
    amount: '',
    date: ''
  });
  const [simulatedFile, setSimulatedFile] = useState<string | null>(null);

  // Calculations
  const thisMonthStr = new Date().toISOString().substring(0, 7);
  
  const totalApprovedExpensesThisMonth = expenses
    .filter(e => e.date.startsWith(thisMonthStr) && e.status === 'Approved')
    .reduce((sum, e) => sum + e.amount, 0);

  const pendingApprovalCount = expenses.filter(e => e.status === 'Pending').length;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFields.description || !formFields.amount || !formFields.date) {
      alert('Harap isi deskripsi, nominal, dan tanggal pengeluaran.');
      return;
    }
    createExpense({
      category: formFields.category,
      description: formFields.description,
      amount: Number(formFields.amount),
      date: formFields.date
    });
    setIsCreateOpen(false);
    setFormFields({ category: 'Operational', description: '', amount: '', date: '' });
    setSimulatedFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSimulatedFile(e.target.files[0].name);
    }
  };

  // Filtered Expenses
  const filteredExpenses = useMemo(() => {
    let result = [...expenses];

    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      result = result.filter(e =>
        e.description.toLowerCase().includes(query) ||
        e.id.toLowerCase().includes(query) ||
        e.category.toLowerCase().includes(query)
      );
    }

    if (categoryFilter !== 'All') {
      result = result.filter(e => e.category === categoryFilter);
    }

    result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return result;
  }, [expenses, searchTerm, categoryFilter]);

  // Paginated data
  const paginatedExpenses = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredExpenses.slice(start, start + itemsPerPage);
  }, [filteredExpenses, currentPage]);

  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);

  const selectedExpense = useMemo(() => {
    if (!selectedExpenseId) return null;
    return expenses.find(e => e.id === selectedExpenseId) || null;
  }, [expenses, selectedExpenseId]);

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Biaya & Pengeluaran Kas (Expenses)</h2>
          <p className="text-xs text-muted-foreground mt-1">Catat biaya operasional gudang, BBM, tagihan listrik, internet, gaji, hingga sewa ruko gudang.</p>
        </div>
        <Button size="sm" className="flex items-center gap-1.5" onClick={() => {
          setFormFields({
            category: 'Operational',
            description: '',
            amount: '',
            date: new Date().toISOString().split('T')[0]
          });
          setSimulatedFile(null);
          setIsCreateOpen(true);
        }}>
          <Plus className="w-4 h-4" /> Catat Kas Keluar
        </Button>
      </div>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-2xs font-bold text-muted-foreground uppercase tracking-wider">Kas Keluar (Bulan Ini)</p>
              <p className="text-xl font-bold mt-1 text-rose-500">{formatRupiah(totalApprovedExpensesThisMonth)}</p>
              <p className="text-4xs text-muted-foreground mt-1">Akumulasi pengeluaran operasional lunas</p>
            </div>
            <div className="p-3 rounded-lg bg-rose-500/10 text-rose-500 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-2xs font-bold text-muted-foreground uppercase tracking-wider">Menunggu Approval Direktur</p>
              <p className="text-xl font-bold mt-1 text-amber-500">{pendingApprovalCount} Pengeluaran</p>
              <p className="text-4xs text-muted-foreground mt-1">Perlu review & persetujuan keuangan</p>
            </div>
            <div className="p-3 rounded-lg bg-amber-500/10 text-amber-500 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Category Filter Card */}
      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Cari pengeluaran berdasarkan nama keperluan, ID, kategori..."
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="flex h-10 w-full rounded-lg border border-border bg-background pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:border-border/60"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <Select
              id="filterCategory"
              value={categoryFilter}
              onChange={e => { setCategoryFilter(e.target.value as any); setCurrentPage(1); }}
              options={[
                { value: 'All', label: 'Semua Kategori' },
                { value: 'Operational', label: 'Operasional' },
                { value: 'Utilities', label: 'Listrik & Utilitas' },
                { value: 'Rent', label: 'Sewa Tempat' },
                { value: 'Refills', label: 'Vendor Refill' },
                { value: 'Marketing', label: 'Pemasaran' },
                { value: 'Salaries', label: 'Gaji Karyawan' },
                { value: 'Other', label: 'Lain-lain' }
              ]}
              className="w-full sm:w-44"
            />
          </div>
        </CardContent>
      </Card>

      {/* Expenses Table */}
      <Card>
        <CardContent className="p-0">
          {paginatedExpenses.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-24">ID Biaya</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Keperluan / Deskripsi</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Nominal Biaya</TableHead>
                    <TableHead className="w-24 text-center">Status</TableHead>
                    <TableHead className="w-24 text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedExpenses.map(exp => (
                    <TableRow key={exp.id}>
                      <TableCell className="font-bold text-xs">{exp.id}</TableCell>
                      <TableCell>
                        <Badge variant={
                          exp.category === 'Salaries' ? 'info' :
                          exp.category === 'Rent' ? 'warning' :
                          exp.category === 'Utilities' ? 'default' : 'secondary'
                        }>
                          {exp.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold text-foreground">{exp.description}</TableCell>
                      <TableCell className="text-xs">{exp.date}</TableCell>
                      <TableCell className="font-bold text-xs text-rose-500">{formatRupiah(exp.amount)}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={exp.status === 'Approved' ? 'success' : 'warning'}>
                          {exp.status === 'Approved' ? 'Disetujui' : 'Pending'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1.5">
                          {exp.status === 'Pending' && (
                            <button
                              onClick={() => approveExpense(exp.id)}
                              className="p-1.5 rounded hover:bg-emerald-500/10 text-emerald-600 hover:text-emerald-500 transition-colors cursor-pointer border border-border"
                              title="Approve"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <Button size="sm" variant="outline" className="h-8 px-2.5 flex items-center gap-1 cursor-pointer" onClick={() => setSelectedExpenseId(exp.id)}>
                            <Eye className="w-3.5 h-3.5" /> Detail
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={filteredExpenses.length}
                itemsPerPage={itemsPerPage}
              />
            </>
          ) : (
            <div className="py-24 text-center flex flex-col items-center justify-center gap-3">
              <FileText className="w-12 h-12 text-muted-foreground/45" />
              <h3 className="text-base font-bold text-foreground">Tidak Ada Biaya</h3>
              <p className="text-xs text-muted-foreground max-w-sm">
                Tidak ada data log biaya pengeluaran kas yang cocok dengan kata kunci filter Anda.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 1. DRAWER - LOG EXPENSE */}
      <Drawer isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Catat Pengeluaran Baru">
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <Select
            label="Kategori Pengeluaran *"
            id="expCat"
            value={formFields.category}
            onChange={e => setFormFields({ ...formFields, category: e.target.value as any })}
            options={[
              { value: 'Operational', label: 'Operasional Gudang / Supir' },
              { value: 'Utilities', label: 'Tagihan Listrik / Air / Internet' },
              { value: 'Rent', label: 'Biaya Sewa Tempat / Cabang' },
              { value: 'Refills', label: 'Biaya Isi Ulang Gas (Vendor)' },
              { value: 'Marketing', label: 'Iklan & Pembuatan Brosur' },
              { value: 'Salaries', label: 'Gaji & Bonus Karyawan' },
              { value: 'Other', label: 'Lain-lain' }
            ]}
          />
          <Input
            label="Keterangan Keperluan Biaya *"
            id="expDesc"
            placeholder="e.g. Pembelian 3 ban serep mobil pickup pengiriman"
            value={formFields.description}
            onChange={e => setFormFields({ ...formFields, description: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Nomor Nominal Biaya (Rp) *"
              id="expAmt"
              type="number"
              placeholder="e.g. 1200000"
              value={formFields.amount}
              onChange={e => setFormFields({ ...formFields, amount: e.target.value })}
            />
            <Input
              label="Tanggal Pengeluaran *"
              id="expDate"
              type="date"
              value={formFields.date}
              onChange={e => setFormFields({ ...formFields, date: e.target.value })}
            />
          </div>

          {/* SIMULATED FILE UPLOADER */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Kwitansi / Bukti Nota (Attachment)</span>
            <div className="border-2 border-dashed border-border hover:border-primary/50 transition-colors rounded-xl p-6 text-center cursor-pointer relative bg-muted/20">
              <input
                type="file"
                id="receiptFile"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
              <p className="text-xs font-semibold">Klik atau seret kwitansi ke sini</p>
              <p className="text-4xs text-muted-foreground mt-0.5">Mendukung format JPG, PNG, PDF (Maks. 5MB)</p>
            </div>
            {simulatedFile && (
              <div className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-card text-xs">
                <span className="truncate max-w-[250px] font-semibold text-primary">{simulatedFile}</span>
                <button type="button" onClick={() => setSimulatedFile(null)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>
            )}
          </div>

          <div className="border-t border-border pt-4 flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setIsCreateOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" className="flex-1">
              Catat Kas Keluar
            </Button>
          </div>
        </form>
      </Drawer>

      {/* 2. DRAWER - DETAILS */}
      <Drawer isOpen={!!selectedExpense} onClose={() => setSelectedExpenseId(null)} title={`Detail Pengeluaran ${selectedExpense?.id}`}>
        {selectedExpense && (
          <div className="space-y-6 text-xs">
            <div className="flex justify-between items-center p-4 bg-muted/30 border border-border rounded-xl">
              <div>
                <p className="text-4xs text-muted-foreground uppercase font-bold">Status Verifikasi</p>
                <p className="mt-1 font-semibold text-sm">
                  <Badge variant={selectedExpense.status === 'Approved' ? 'success' : 'warning'}>
                    {selectedExpense.status === 'Approved' ? 'Disetujui Keuangan' : 'Menunggu Approval'}
                  </Badge>
                </p>
              </div>
              <p className="text-right">
                <span className="text-4xs text-muted-foreground uppercase font-bold block">Tanggal Kas Keluar</span>
                <span className="font-bold text-sm">{selectedExpense.date}</span>
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-muted-foreground text-3xs font-semibold uppercase">Kategori</p>
                <p className="font-semibold text-sm mt-0.5">{selectedExpense.category}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-3xs font-semibold uppercase">Keperluan / Keterangan</p>
                <p className="font-semibold text-sm mt-0.5 leading-relaxed text-foreground">{selectedExpense.description}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-3xs font-semibold uppercase">Total Pengeluaran Kas</p>
                <p className="font-extrabold text-lg mt-0.5 text-rose-500">{formatRupiah(selectedExpense.amount)}</p>
              </div>
            </div>

            {/* ATTACHMENT DISPLAY SIMULATION */}
            <div className="border border-border/80 rounded-xl p-4 bg-card space-y-2">
              <p className="font-bold text-foreground">Bukti Kwitansi Terlampir</p>
              <div className="h-44 rounded-lg bg-muted flex items-center justify-center text-center text-muted-foreground border border-border/60 relative overflow-hidden">
                {/* Render dummy invoice background preview */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]" />
                <div className="z-10 space-y-1">
                  <FileText className="w-8 h-8 mx-auto text-muted-foreground/60" />
                  <p className="font-bold text-4xs uppercase tracking-wider text-muted-foreground">Kwitansi_Pembayaran_{selectedExpense.id}.jpg</p>
                  <p className="text-5xs text-muted-foreground/80">Gambar terupload otomatis oleh sistem</p>
                </div>
              </div>
            </div>

            {selectedExpense.status === 'Pending' && (
              <div className="border-t border-border pt-4">
                <Button variant="success" className="w-full flex items-center justify-center gap-1.5" onClick={() => {
                  approveExpense(selectedExpense.id);
                  setSelectedExpenseId(null);
                }}>
                  <CheckCircle2 className="w-4 h-4" /> Setujui & Lunasi Biaya
                </Button>
              </div>
            )}
          </div>
        )}
      </Drawer>

    </div>
  );
}
