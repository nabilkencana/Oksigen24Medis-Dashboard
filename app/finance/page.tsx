'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useData } from '../../context/DataContext';
import { formatRupiah, Transaction, Expense } from '../../context/mockData';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Drawer } from '../../components/ui/Drawer';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Pagination } from '../../components/ui/Table';
import { AreaChart, BarChart } from '../../components/ui/Charts';
import { Plus, Search, FileText, CheckCircle2, TrendingUp, TrendingDown, DollarSign, Wallet, FileImage } from 'lucide-react';

type TabType = 'income' | 'expenses' | 'cashflow' | 'summary';

export default function FinancePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as TabType) || 'income';

  const {
    transactions,
    expenses,
    createExpense,
    approveExpense
  } = useData();

  // Tab State
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Add Expense Drawer
  const [isExpenseDrawerOpen, setIsExpenseDrawerOpen] = useState(false);
  const [expenseForm, setExpenseForm] = useState({ category: 'Operational' as const, description: '', amount: '', date: '' });
  const [expenseAttachment, setExpenseAttachment] = useState<string | null>(null);

  // Detail attachment modal
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);

  useEffect(() => {
    setActiveTab(initialTab);
    setCurrentPage(1);
  }, [initialTab]);

  const changeTab = (tab: TabType) => {
    setActiveTab(tab);
    setSearchTerm('');
    setCurrentPage(1);
    router.replace(`/finance?tab=${tab}`);
  };

  // Set default date
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setExpenseForm(prev => ({ ...prev, date: today }));
  }, []);

  // -------------------------------------------------------------
  // INCOME LISTING
  // -------------------------------------------------------------
  const incomeTransactions = useMemo(() => {
    return transactions.filter(t => t.type === 'Rental' || t.type === 'Sale');
  }, [transactions]);

  const filteredIncome = useMemo(() => {
    return incomeTransactions.filter(t => 
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
      t.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [incomeTransactions, searchTerm]);

  // -------------------------------------------------------------
  // EXPENSES LISTING
  // -------------------------------------------------------------
  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => 
      e.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
      e.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [expenses, searchTerm]);

  // -------------------------------------------------------------
  // COMBINED CASH FLOW LEDGER
  // -------------------------------------------------------------
  const cashflowLedger = useMemo(() => {
    // Sort all transactions and expenses chronologically by date
    const combined: Array<{ id: string; date: string; desc: string; type: 'IN' | 'OUT'; amount: number; category: string }> = [];
    
    transactions.forEach(t => {
      if (t.type === 'Rental' || t.type === 'Sale') {
        combined.push({ id: t.id, date: t.date, desc: t.description, type: 'IN', amount: t.amount, category: t.type });
      }
    });

    expenses.forEach(e => {
      combined.push({ 
        id: e.id, 
        date: e.date, 
        desc: e.description, 
        type: 'OUT', 
        amount: e.amount, 
        category: e.category 
      });
    });

    // Sort descending by date, then by id descending for newest first
    return combined.sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
  }, [transactions, expenses]);

  const filteredCashflow = useMemo(() => {
    return cashflowLedger.filter(item => 
      item.desc.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [cashflowLedger, searchTerm]);

  // -------------------------------------------------------------
  // FINANCIAL CALCULATIONS SUMMARY
  // -------------------------------------------------------------
  const financeSummary = useMemo(() => {
    const totalIncome = transactions
      .filter(t => t.type === 'Rental' || t.type === 'Sale')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = expenses
      .reduce((sum, e) => sum + e.amount, 0);

    const pendingExpenses = expenses
      .filter(e => e.status === 'Pending')
      .reduce((sum, e) => sum + e.amount, 0);

    const netProfit = totalIncome - totalExpense;
    const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

    // Breakdown category
    const categoryBreakdown: Record<string, number> = {};
    expenses.forEach(e => {
      categoryBreakdown[e.category] = (categoryBreakdown[e.category] || 0) + e.amount;
    });

    return {
      totalIncome,
      totalExpense,
      pendingExpenses,
      netProfit,
      profitMargin,
      categoryBreakdown
    };
  }, [transactions, expenses]);

  // Paginated calculations
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const data = activeTab === 'income' ? filteredIncome :
                 activeTab === 'expenses' ? filteredExpenses :
                 filteredCashflow;
    return data.slice(start, start + itemsPerPage);
  }, [activeTab, filteredIncome, filteredExpenses, filteredCashflow, currentPage]);

  const totalPages = Math.ceil(
    (activeTab === 'income' ? filteredIncome.length :
     activeTab === 'expenses' ? filteredExpenses.length :
     filteredCashflow.length) / itemsPerPage
  );

  // -------------------------------------------------------------
  // FORM HANDLERS
  // -------------------------------------------------------------
  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseForm.description || !expenseForm.amount || !expenseForm.date) {
      alert('Harap isi semua kolom wajib.');
      return;
    }

    createExpense({
      category: expenseForm.category,
      description: expenseForm.description,
      amount: Number(expenseForm.amount),
      date: expenseForm.date,
      attachment: expenseAttachment || undefined
    });

    setIsExpenseDrawerOpen(false);
    setExpenseForm({ category: 'Operational', description: '', amount: '', date: '' });
    setExpenseAttachment(null);
  };

  const handleSimulateUpload = () => {
    // Simulated receipt generator
    const receiptImages = [
      'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=500&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1534951009808-766178b47a4f?w=500&auto=format&fit=crop&q=60'
    ];
    const chosen = receiptImages[Math.floor(Math.random() * receiptImages.length)];
    setExpenseAttachment(chosen);
    alert('Kwitansi terunggah otomatis!');
  };

  return (
    <div className="space-y-6">
      
      {/* Title with tab buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Keuangan Operasional</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Kelola kas masuk pelanggan, otorisasi pengeluaran kas, dan rekap laba bersih.</p>
        </div>

        <div className="flex gap-1 bg-muted/40 p-1 border border-border rounded-xl text-xs font-semibold shrink-0">
          <button
            onClick={() => changeTab('income')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${activeTab === 'income' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Pendapatan
          </button>
          <button
            onClick={() => changeTab('expenses')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${activeTab === 'expenses' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Pengeluaran
          </button>
          <button
            onClick={() => changeTab('cashflow')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${activeTab === 'cashflow' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Arus Kas
          </button>
          <button
            onClick={() => changeTab('summary')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${activeTab === 'summary' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Ikhtisar Margin
          </button>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* SUMMARY TAB GRAPHICS */}
      {/* ----------------------------------------------------------------- */}
      {activeTab === 'summary' ? (
        <div className="space-y-6">
          
          {/* Dashboard cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-5 flex flex-col justify-between h-30">
                <div className="flex justify-between items-start">
                  <span className="text-3xs font-bold text-muted-foreground uppercase">Total Pendapatan</span>
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">{formatRupiah(financeSummary.totalIncome)}</p>
                  <p className="text-4xs text-emerald-600 dark:text-emerald-400 mt-1">Uang masuk persewaan & ritel</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5 flex flex-col justify-between h-30">
                <div className="flex justify-between items-start">
                  <span className="text-3xs font-bold text-muted-foreground uppercase">Total Pengeluaran</span>
                  <TrendingDown className="w-4 h-4 text-rose-500" />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">{formatRupiah(financeSummary.totalExpense)}</p>
                  <p className="text-4xs text-rose-500 mt-1">{formatRupiah(financeSummary.pendingExpenses)} pending approval</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5 flex flex-col justify-between h-30">
                <div className="flex justify-between items-start">
                  <span className="text-3xs font-bold text-muted-foreground uppercase">Laba Bersih</span>
                  <DollarSign className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">{formatRupiah(financeSummary.netProfit)}</p>
                  <p className="text-4xs text-muted-foreground mt-1">Selisih kas masuk - kas keluar</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5 flex flex-col justify-between h-30">
                <div className="flex justify-between items-start">
                  <span className="text-3xs font-bold text-muted-foreground uppercase">Margin Laba (%)</span>
                  <Wallet className="w-4 h-4 text-amber-500" />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">{financeSummary.profitMargin.toFixed(1)}%</p>
                  <p className="text-4xs text-muted-foreground mt-1">Rasio efisiensi bersih usaha</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Breakdown graphics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Category Breakdown (left) */}
            <Card>
              <CardHeader>
                <CardTitle>Biaya Berdasarkan Kategori</CardTitle>
                <CardDescription>Pembagian biaya operasional bulan ini.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(financeSummary.categoryBreakdown).map(([cat, val]) => {
                    const pct = financeSummary.totalExpense > 0 ? (val / financeSummary.totalExpense) * 100 : 0;
                    return (
                      <div key={cat} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-muted-foreground">{cat}</span>
                          <span className="text-foreground">{formatRupiah(val)} ({pct.toFixed(0)}%)</span>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-rose-500 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Income curve (right) */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Rasio Laba Terhadap Pengeluaran</CardTitle>
                <CardDescription>Grafik perbandingan pengeluaran (merah) vs laba bersih (hijau).</CardDescription>
              </CardHeader>
              <CardContent>
                <BarChart
                  data={[
                    { label: 'Pendapatan Kas', value: financeSummary.totalIncome },
                    { label: 'Pengeluaran Kas', value: financeSummary.totalExpense },
                    { label: 'Laba Bersih', value: financeSummary.netProfit }
                  ]}
                  height={180}
                  color="#ef4444"
                />
              </CardContent>
            </Card>

          </div>

        </div>
      ) : (
        /* ----------------------------------------------------------------- */
        /* LIST TABLES (INCOME / EXPENSES / CASH FLOW) */
        /* ----------------------------------------------------------------- */
        <Card>
          <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <CardTitle>
                {activeTab === 'income' && 'Pendapatan Usaha'}
                {activeTab === 'expenses' && 'Buku Kas Pengeluaran (Expenses)'}
                {activeTab === 'cashflow' && 'Buku Jurnal Arus Kas (Combined)'}
              </CardTitle>
              <CardDescription>
                {activeTab === 'income' && 'Riwayat pembayaran rental dan ritel kasir.'}
                {activeTab === 'expenses' && 'Otorisasi biaya listrik, BBM, gaji karyawan, dan refill vendor.'}
                {activeTab === 'cashflow' && 'Daftar kronologis lengkap aliran kas masuk dan kas keluar.'}
              </CardDescription>
            </div>
            {activeTab === 'expenses' && (
              <Button className="flex items-center gap-1.5 self-start" onClick={() => setIsExpenseDrawerOpen(true)}>
                <Plus className="w-4 h-4" /> Catat Kas Keluar
              </Button>
            )}
          </CardHeader>
          <CardContent>
            
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Cari deskripsi transaksi atau ID..."
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="pl-9 pr-4 py-2 w-full text-sm bg-background border border-border rounded-lg outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {paginatedData.length > 0 ? (
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Deskripsi Keterangan</TableHead>
                      
                      {/* Context headings */}
                      {activeTab === 'income' && <TableHead>Metode Bayar</TableHead>}
                      {activeTab === 'expenses' && <TableHead>Kategori</TableHead>}
                      {activeTab === 'cashflow' && <TableHead>Tipe</TableHead>}
                      
                      <TableHead>Nominal</TableHead>
                      <TableHead>Status</TableHead>
                      {activeTab === 'expenses' && <TableHead className="text-right">Aksi</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedData.map((item: any) => {
                      const isIncomeRow = activeTab === 'income' || item.type === 'IN';
                      return (
                        <TableRow key={item.id}>
                          <TableCell className="font-bold text-foreground">{item.id}</TableCell>
                          <TableCell>{item.date}</TableCell>
                          <TableCell className="font-medium text-foreground">{item.description || item.desc}</TableCell>
                          
                          {/* Context cell */}
                          {activeTab === 'income' && <TableCell>{item.paymentMethod}</TableCell>}
                          {activeTab === 'expenses' && <TableCell>{item.category}</TableCell>}
                          {activeTab === 'cashflow' && (
                            <TableCell>
                              <Badge variant={isIncomeRow ? 'success' : 'destructive'}>
                                {isIncomeRow ? 'KAS MASUK' : 'KAS KELUAR'}
                              </Badge>
                            </TableCell>
                          )}

                          <TableCell className={`font-bold ${isIncomeRow ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {isIncomeRow ? '+' : '-'} {formatRupiah(item.amount)}
                          </TableCell>

                          <TableCell>
                            <Badge variant={item.status === 'Pending' ? 'warning' : 'secondary'}>
                              {item.status === 'Pending' ? 'Menunggu Approval' : 'Selesai'}
                            </Badge>
                          </TableCell>

                          {/* Expense actions */}
                          {activeTab === 'expenses' && (
                            <TableCell className="text-right space-x-1.5">
                              {item.attachment && (
                                <button
                                  onClick={() => setSelectedReceipt(item.attachment)}
                                  className="text-primary hover:underline font-bold text-3xs cursor-pointer inline-flex items-center gap-0.5"
                                >
                                  <FileImage className="w-3.5 h-3.5" /> Bukti
                                </button>
                              )}
                              {item.status === 'Pending' ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="px-2 text-3xs h-7 text-emerald-500 border-emerald-500/20"
                                  onClick={() => approveExpense(item.id)}
                                >
                                  Approve
                                </Button>
                              ) : (
                                <span className="text-[10px] text-muted-foreground font-semibold">Disetujui</span>
                              )}
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>

                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  totalItems={activeTab === 'income' ? filteredIncome.length : activeTab === 'expenses' ? filteredExpenses.length : filteredCashflow.length}
                  itemsPerPage={itemsPerPage}
                />
              </div>
            ) : (
              <div className="py-16 text-center text-muted-foreground text-sm">
                Tidak ada data keuangan yang ditemukan.
              </div>
            )}

          </CardContent>
        </Card>
      )}

      {/* ------------------------------------------------------------- */}
      {/* DRAWERS & MODALS FOR EXPENSE ATTACHMENTS */}
      {/* ------------------------------------------------------------- */}
      
      {/* Record Expense Drawer */}
      <Drawer isOpen={isExpenseDrawerOpen} onClose={() => setIsExpenseDrawerOpen(false)} title="Catat Pengeluaran Kas">
        <form onSubmit={handleExpenseSubmit} className="space-y-4">
          <Select
            label="Kategori Pengeluaran *"
            id="expCat"
            value={expenseForm.category}
            onChange={e => setExpenseForm({ ...expenseForm, category: e.target.value as any })}
            options={[
              { value: 'Operational', label: 'Operational Kantor' },
              { value: 'Electricity', label: 'Listrik & Utilitas ruko' },
              { value: 'Refill', label: 'Biaya Refill Gas Samator' },
              { value: 'Salary', label: 'Gaji Karyawan' },
              { value: 'Other', label: 'Lain-Lain' }
            ]}
          />
          <Input
            label="Deskripsi Keperluan *"
            id="expDesc"
            placeholder="e.g. Pembelian bensin mobil tangki"
            value={expenseForm.description}
            onChange={e => setExpenseForm({ ...expenseForm, description: e.target.value })}
            required
          />
          <Input
            label="Nominal Biaya (Rp) *"
            id="expAmount"
            type="number"
            value={expenseForm.amount}
            onChange={e => setExpenseForm({ ...expenseForm, amount: e.target.value })}
            required
          />
          <Input
            label="Tanggal Pengeluaran *"
            id="expDate"
            type="date"
            value={expenseForm.date}
            onChange={e => setExpenseForm({ ...expenseForm, date: e.target.value })}
            required
          />
          
          {/* Simulated Attachment File Upload */}
          <div className="border border-border/80 p-3 rounded-lg bg-muted/20">
            <span className="text-3xs font-bold text-muted-foreground block mb-2">Unggah Kwitansi / Struk Fisik</span>
            <div className="flex gap-2">
              <Button type="button" size="sm" variant="outline" className="flex-1 text-2xs" onClick={handleSimulateUpload}>
                <Plus className="w-3.5 h-3.5 mr-1" /> Pilih Kwitansi
              </Button>
              {expenseAttachment && (
                <div className="flex items-center text-3xs font-bold text-emerald-500 bg-emerald-500/10 px-2 rounded-lg">
                  Kwitansi.jpg
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-border pt-4 flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setIsExpenseDrawerOpen(false)}>Batal</Button>
            <Button type="submit" className="flex-1">Catat Kas</Button>
          </div>
        </form>
      </Drawer>

      {/* View Attachment Modal Drawer */}
      {selectedReceipt && (
        <Drawer isOpen={selectedReceipt !== null} onClose={() => setSelectedReceipt(null)} title="Bukti Kwitansi Fisik">
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">Kwitansi nota pengeluaran operasional terlampir:</p>
            <div className="border border-border/80 rounded-xl overflow-hidden bg-card max-h-[300px]">
              <img src={selectedReceipt} alt="Receipt Attachment" className="w-full h-full object-cover" />
            </div>
            <Button className="w-full" onClick={() => setSelectedReceipt(null)}>Tutup Kwitansi</Button>
          </div>
        </Drawer>
      )}

    </div>
  );
}
