'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useData } from '../../context/DataContext';
import { formatRupiah } from '../../context/mockData';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { AreaChart, BarChart, DonutChart } from '../../components/ui/Charts';
import { Download, Calendar, FileSpreadsheet, FileDown, Eye, Filter } from 'lucide-react';

export default function ReportsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'revenue';

  const { transactions, rentals, expenses, cylinders } = useData();

  // Filters
  const [startDate, setStartDate] = useState('2026-06-01');
  const [endDate, setEndDate] = useState('2026-07-09');
  const [periodType, setPeriodType] = useState<'Daily' | 'Monthly' | 'Yearly'>('Monthly');

  // Change tab helper
  const setTab = (tabName: string) => {
    router.push(`/reports?tab=${tabName}`);
  };

  // Export alerts simulation
  const handleExport = (type: 'CSV' | 'PDF') => {
    alert(`Mengekspor laporan "${activeTab.toUpperCase()}" dalam format ${type}...\nUnduhan akan segera dimulai secara otomatis.`);
  };

  // Filtered transactions for date range
  const dateFilteredTransactions = useMemo(() => {
    return transactions.filter(t => t.date >= startDate && t.date <= endDate);
  }, [transactions, startDate, endDate]);

  const dateFilteredRentals = useMemo(() => {
    return rentals.filter(r => r.rentDate >= startDate && r.rentDate <= endDate);
  }, [rentals, startDate, endDate]);

  const dateFilteredExpenses = useMemo(() => {
    return expenses.filter(e => e.date >= startDate && e.date <= endDate);
  }, [expenses, startDate, endDate]);

  // 1. REVENUE CALCS
  const revenueTotal = useMemo(() => {
    return dateFilteredTransactions
      .filter(t => (t.type === 'Rental' || t.type === 'Sale') && t.status === 'Completed')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [dateFilteredTransactions]);

  const salesRevenueTotal = useMemo(() => {
    return dateFilteredTransactions
      .filter(t => t.type === 'Sale' && t.status === 'Completed')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [dateFilteredTransactions]);

  const rentalRevenueTotal = useMemo(() => {
    return dateFilteredTransactions
      .filter(t => t.type === 'Rental' && t.status === 'Completed')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [dateFilteredTransactions]);

  const revenueChartData = useMemo(() => {
    // Generate weekly/monthly labels dynamically based on range
    return [
      { label: 'Minggu 1', value: Math.round(revenueTotal * 0.2) },
      { label: 'Minggu 2', value: Math.round(revenueTotal * 0.25) },
      { label: 'Minggu 3', value: Math.round(revenueTotal * 0.3) },
      { label: 'Minggu 4', value: Math.round(revenueTotal * 0.25) }
    ];
  }, [revenueTotal]);

  // 2. RENTAL CALCS
  const totalRentalsCount = dateFilteredRentals.length;
  const returnedRentalsCount = dateFilteredRentals.filter(r => r.status === 'Returned').length;
  const overdueRentalsCount = dateFilteredRentals.filter(r => r.status === 'Overdue').length;
  const returnRate = totalRentalsCount > 0 ? ((returnedRentalsCount / totalRentalsCount) * 100).toFixed(0) : '0';

  const rentalChartData = useMemo(() => {
    return [
      { label: 'Medical Oxygen', value: dateFilteredRentals.filter(r => r.rentalFee < 100000).length },
      { label: 'Industrial Oxygen', value: dateFilteredRentals.filter(r => r.rentalFee >= 100000 && r.rentalFee < 150000).length },
      { label: 'High-Purity Oxygen', value: dateFilteredRentals.filter(r => r.rentalFee >= 150000).length }
    ];
  }, [dateFilteredRentals]);

  // 3. EXPENSE CALCS
  const expenseTotal = useMemo(() => {
    return dateFilteredExpenses
      .filter(e => e.status === 'Approved')
      .reduce((sum, e) => sum + e.amount, 0);
  }, [dateFilteredExpenses]);

  const expenseBreakdown = useMemo(() => {
    const categories: Record<string, number> = {};
    dateFilteredExpenses.forEach(e => {
      if (e.status === 'Approved') {
        categories[e.category] = (categories[e.category] || 0) + e.amount;
      }
    });
    return Object.entries(categories).map(([label, value]) => ({ label, value }));
  }, [dateFilteredExpenses]);

  // 4. INVENTORY CALCS
  const availableCyl = cylinders.filter(c => c.status === 'Available').length;
  const rentedCyl = cylinders.filter(c => c.status === 'Rented').length;
  const vendorCyl = cylinders.filter(c => c.status === 'At Vendor').length;
  const maintenanceCyl = cylinders.filter(c => c.status === 'Maintenance').length;

  const inventoryChartData = [
    { label: 'Tersedia', value: availableCyl },
    { label: 'Disewa', value: rentedCyl },
    { label: 'Di Vendor', value: vendorCyl },
    { label: 'Maintenance', value: maintenanceCyl }
  ];

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Laporan Manajemen & Operasional</h2>
          <p className="text-xs text-muted-foreground mt-1">Ekspor laporan rekapitulasi keuangan, rental tabung, kas keluar, dan status pergudangan.</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="flex items-center gap-1 border border-border" onClick={() => handleExport('CSV')}>
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" /> Export Excel
          </Button>
          <Button size="sm" variant="outline" className="flex items-center gap-1 border border-border" onClick={() => handleExport('PDF')}>
            <FileDown className="w-4 h-4 text-rose-500" /> Export PDF
          </Button>
        </div>
      </div>

      {/* Unified Filters panel */}
      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row items-center gap-4 text-xs">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 flex-1 w-full">
            <Input
              label="Tanggal Mulai"
              id="startDate"
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
            />
            <Input
              label="Tanggal Selesai"
              id="endDate"
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
            />
            <div className="col-span-2 md:col-span-1">
              <Select
                label="Periode Laporan"
                id="period"
                value={periodType}
                onChange={e => setPeriodType(e.target.value as any)}
                options={[
                  { value: 'Daily', label: 'Harian (Daily)' },
                  { value: 'Monthly', label: 'Bulanan (Monthly)' },
                  { value: 'Yearly', label: 'Tahunan (Yearly)' }
                ]}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs trigger */}
      <div className="flex border-b border-border/60">
        {[
          { key: 'revenue', label: 'Laporan Pendapatan' },
          { key: 'rental', label: 'Laporan Sewa Tabung' },
          { key: 'expense', label: 'Laporan Pengeluaran' },
          { key: 'inventory', label: 'Laporan Inventaris Gudang' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setTab(tab.key)}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === tab.key ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* RENDER ACTIVE REPORT SCREEN */}
      <div className="space-y-6">

        {/* 1. REVENUE REPORT */}
        {activeTab === 'revenue' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-5">
                  <span className="text-3xs font-bold text-muted-foreground uppercase tracking-widest">Total Pendapatan Tergabung</span>
                  <p className="text-xl font-bold text-foreground mt-1.5">{formatRupiah(revenueTotal)}</p>
                  <p className="text-4xs text-muted-foreground mt-1">Sewa & Penjualan Retail Lunas</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <span className="text-3xs font-bold text-muted-foreground uppercase tracking-widest">Kontribusi Sewa Oksigen</span>
                  <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1.5">{formatRupiah(rentalRevenueTotal)}</p>
                  <p className="text-4xs text-muted-foreground mt-1">
                    {revenueTotal > 0 ? ((rentalRevenueTotal / revenueTotal) * 100).toFixed(0) : 0}% Porsi dari total omset
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <span className="text-3xs font-bold text-muted-foreground uppercase tracking-widest">Kontribusi Jual Aksesoris</span>
                  <p className="text-xl font-bold text-blue-500 mt-1.5">{formatRupiah(salesRevenueTotal)}</p>
                  <p className="text-4xs text-muted-foreground mt-1">
                    {revenueTotal > 0 ? ((salesRevenueTotal / revenueTotal) * 100).toFixed(0) : 0}% Porsi dari total omset
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Tren Pertumbuhan Omset Pendapatan</CardTitle>
                <CardDescription>Grafik grafik total penjualan dan sewa per minggu</CardDescription>
              </CardHeader>
              <CardContent>
                <AreaChart data={revenueChartData} height={220} color="#3b82f6" />
              </CardContent>
            </Card>
          </>
        )}

        {/* 2. RENTAL REPORT */}
        {activeTab === 'rental' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-5">
                  <span className="text-3xs font-bold text-muted-foreground uppercase tracking-widest">Total Kontrak Sewa</span>
                  <p className="text-xl font-bold text-foreground mt-1.5">{totalRentalsCount} Kontrak</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <span className="text-3xs font-bold text-muted-foreground uppercase tracking-widest">Tabung Terlambat</span>
                  <p className="text-xl font-bold text-rose-500 mt-1.5">{overdueRentalsCount} Unit</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <span className="text-3xs font-bold text-muted-foreground uppercase tracking-widest">Tabung Kembali</span>
                  <p className="text-xl font-bold text-emerald-500 mt-1.5">{returnedRentalsCount} Unit</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <span className="text-3xs font-bold text-muted-foreground uppercase tracking-widest">Rasio Pengembalian</span>
                  <p className="text-xl font-bold text-blue-500 mt-1.5">{returnRate}% Rasio</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Distribusi Sewa Berdasarkan Volume Tabung</CardTitle>
                <CardDescription>Pembagian intensitas sewa tabung kecil 1m3, sedang 2m3, dan besar 6m3</CardDescription>
              </CardHeader>
              <CardContent>
                <BarChart data={rentalChartData} height={220} color="#10b981" />
              </CardContent>
            </Card>
          </>
        )}

        {/* 3. EXPENSE REPORT */}
        {activeTab === 'expense' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-5">
                  <span className="text-3xs font-bold text-muted-foreground uppercase tracking-widest">Total Kas Keluar (Lunas)</span>
                  <p className="text-xl font-bold text-rose-500 mt-1.5">{formatRupiah(expenseTotal)}</p>
                  <p className="text-4xs text-muted-foreground mt-1">Biaya operasional ruko, supir, bensin & tagihan bulanan</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <span className="text-3xs font-bold text-muted-foreground uppercase tracking-widest">Rata-rata Transaksi Biaya</span>
                  <p className="text-xl font-bold text-foreground mt-1.5">
                    {formatRupiah(dateFilteredExpenses.length > 0 ? Math.round(expenseTotal / dateFilteredExpenses.length) : 0)}
                  </p>
                  <p className="text-4xs text-muted-foreground mt-1">Per tiket nota pengeluaran kas</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Distribusi Kategori Biaya Pengeluaran</CardTitle>
                <CardDescription>Pembagian persentase dana pengeluaran kas operasional</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center items-center py-6">
                {expenseBreakdown.length > 0 ? (
                  <DonutChart data={expenseBreakdown} />
                ) : (
                  <p className="text-xs text-muted-foreground py-10">Belum ada pengeluaran kas disetujui dalam rentang waktu ini.</p>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* 4. INVENTORY REPORT */}
        {activeTab === 'inventory' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-5">
                  <span className="text-3xs font-bold text-muted-foreground uppercase tracking-widest">Tersedia di Gudang</span>
                  <p className="text-xl font-bold text-emerald-500 mt-1.5">{availableCyl} Unit</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <span className="text-3xs font-bold text-muted-foreground uppercase tracking-widest">Sedang Disewa</span>
                  <p className="text-xl font-bold text-blue-500 mt-1.5">{rentedCyl} Unit</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <span className="text-3xs font-bold text-muted-foreground uppercase tracking-widest">Di Vendor Refill</span>
                  <p className="text-xl font-bold text-amber-500 mt-1.5">{vendorCyl} Unit</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <span className="text-3xs font-bold text-muted-foreground uppercase tracking-widest">Maintenance (Uji/Cat)</span>
                  <p className="text-xl font-bold text-rose-500 mt-1.5">{maintenanceCyl} Unit</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Struktur Status Fisik Aset Tabung</CardTitle>
                <CardDescription>Visualisasi jumlah tabung berdasarkan pembagian lokasi & status operasional</CardDescription>
              </CardHeader>
              <CardContent>
                <BarChart data={inventoryChartData} height={220} color="#8b5cf6" />
              </CardContent>
            </Card>
          </>
        )}

      </div>

    </div>
  );
}
