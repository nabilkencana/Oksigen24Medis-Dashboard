'use client';

import React from 'react';
import { useData } from '../../context/DataContext';
import { formatRupiah } from '../../context/mockData';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { AreaChart, BarChart } from '../../components/ui/Charts';
import { TrendingUp, Users, ArrowUpRight, Award, Flame, Zap } from 'lucide-react';

export default function AnalyticsPage() {
  const { customers, vendors, products } = useData();

  // Exec KPIs
  const totalRevenueVal = 582450000;
  const totalExpensesVal = 210450000;
  const netProfitVal = totalRevenueVal - totalExpensesVal;
  const profitMargin = ((netProfitVal / totalRevenueVal) * 100).toFixed(1);

  // Performance Charts Data
  const monthlyProfitVsRevenue = [
    { label: 'Jan', value: 45 },
    { label: 'Feb', value: 50 },
    { label: 'Mar', value: 68 },
    { label: 'Apr', value: 72 },
    { label: 'May', value: 85 },
    { label: 'Jun', value: 94 }
  ];

  const mostRentedProducts = [
    { label: 'Regulator O2', value: 124 },
    { label: 'Selang Nasal', value: 382 },
    { label: 'Trolley 1m3', value: 84 },
    { label: 'Masker O2', value: 241 },
    { label: 'Humidifier', value: 110 }
  ];

  // Leaders
  const topCustomers = [
    { name: 'Rumah Sakit Santosa Bandung', id: 'CST-012', revenue: 45000000, rentals: 24, status: 'Active' },
    { name: 'Klinik Medika Sehat', id: 'CST-045', revenue: 28500000, rentals: 16, status: 'Active' },
    { name: 'Puskesmas Coblong', id: 'CST-081', revenue: 19800000, rentals: 11, status: 'Active' },
    { name: 'Budi Wijaya (Mandiri)', id: 'CST-003', revenue: 12400000, rentals: 8, status: 'Active' }
  ];

  const topVendors = [
    { name: 'PT Samator Indah Gas', id: 'VND-001', refillCount: 182, quality: '99.5%', speed: '1-2 Hari' },
    { name: 'PT Oxygenindo Utama', id: 'VND-004', refillCount: 94, quality: '99.9%', speed: '2 Hari' },
    { name: 'CV Kita Refill Industri', id: 'VND-002', refillCount: 78, quality: '99.2%', speed: 'Same Day' }
  ];

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-foreground">Dashboard Eksekutif & KPI</h2>
        <p className="text-xs text-muted-foreground mt-1">Analisis performa bisnis, rasio margin laba bersih, kepuasan vendor, dan loyalitas customer.</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Revenue */}
        <Card>
          <CardContent className="p-6">
            <span className="text-3xs font-bold text-muted-foreground uppercase tracking-widest">Total Pendapatan (YTD)</span>
            <p className="text-2xl font-bold tracking-tight mt-1.5">{formatRupiah(totalRevenueVal)}</p>
            <p className="text-4xs text-emerald-600 dark:text-emerald-400 font-bold mt-1 flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" /> +24.8% <span className="text-muted-foreground font-medium font-sans">YoY vs tahun lalu</span>
            </p>
          </CardContent>
        </Card>

        {/* Total Expenses */}
        <Card>
          <CardContent className="p-6">
            <span className="text-3xs font-bold text-muted-foreground uppercase tracking-widest">Total Biaya Operasional</span>
            <p className="text-2xl font-bold tracking-tight mt-1.5">{formatRupiah(totalExpensesVal)}</p>
            <p className="text-4xs text-rose-500 font-bold mt-1 flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" /> +12.4% <span className="text-muted-foreground font-medium font-sans">YoY pengeluaran naik</span>
            </p>
          </CardContent>
        </Card>

        {/* Net Profit */}
        <Card>
          <CardContent className="p-6">
            <span className="text-3xs font-bold text-muted-foreground uppercase tracking-widest">Laba Bersih (Net Profit)</span>
            <p className="text-2xl font-bold tracking-tight mt-1.5 text-emerald-600 dark:text-emerald-400">{formatRupiah(netProfitVal)}</p>
            <p className="text-4xs text-emerald-600 dark:text-emerald-400 font-bold mt-1 flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" /> +32.1% <span className="text-muted-foreground font-medium font-sans">Peningkatan profitabilitas</span>
            </p>
          </CardContent>
        </Card>

        {/* Profit Margin */}
        <Card>
          <CardContent className="p-6">
            <span className="text-3xs font-bold text-muted-foreground uppercase tracking-widest">Rasio Margin Keuntungan</span>
            <p className="text-2xl font-bold tracking-tight mt-1.5 text-blue-500">{profitMargin}%</p>
            <div className="w-full bg-muted rounded-full h-1 mt-2.5">
              <div className="bg-blue-500 h-1 rounded-full" style={{ width: `${profitMargin}%` }} />
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Performance Profit vs Revenue */}
        <Card>
          <CardHeader>
            <CardTitle>Indeks Pertumbuhan Laba Bersih</CardTitle>
            <CardDescription>Indeks efisiensi margin keuntungan operasional bulanan</CardDescription>
          </CardHeader>
          <CardContent>
            <AreaChart data={[
              { label: 'Jan', value: 120000000 },
              { label: 'Feb', value: 145000000 },
              { label: 'Mar', value: 130000000 },
              { label: 'Apr', value: 180000000 },
              { label: 'May', value: 210000000 },
              { label: 'Jun', value: 245000000 }
            ]} height={200} color="#3b82f6" />
          </CardContent>
        </Card>

        {/* Most Rented Equipment */}
        <Card>
          <CardHeader>
            <CardTitle>Produk & Aksesoris Paling Laris (Rented/Sold)</CardTitle>
            <CardDescription>Volume pengeluaran item aksesoris dari gudang cabang</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart data={mostRentedProducts} height={200} color="#10b981" />
          </CardContent>
        </Card>

      </div>

      {/* Leaders Boards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top Customers Leaderboard */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <div>
              <CardTitle>Pelanggan Terbesar (Top Customers)</CardTitle>
              <CardDescription>Berdasarkan total kontribusi nilai sewa & transaksi retail</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/60">
              {topCustomers.map((cust, i) => (
                <div key={cust.id} className="flex justify-between items-center p-4">
                  <div className="flex gap-3.5 items-center">
                    <span className="text-xs font-bold w-4 h-4 rounded-full bg-muted flex items-center justify-center text-muted-foreground">{i + 1}</span>
                    <div>
                      <p className="text-xs font-bold text-foreground">{cust.name}</p>
                      <p className="text-3xs text-muted-foreground mt-0.5">{cust.rentals} Transaksi Sewa • ID: {cust.id}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{formatRupiah(cust.revenue)}</p>
                    <Badge variant="success" className="text-4xs px-1.5 mt-0.5 font-bold uppercase">PREMIUM</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Vendors performance */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Zap className="w-5 h-5 text-blue-500" />
            <div>
              <CardTitle>Vendor Teraktif (Top Refills Partners)</CardTitle>
              <CardDescription>Berdasarkan volume antrean dan kecepatan layanan refill</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/60">
              {topVendors.map((vend, i) => (
                <div key={vend.id} className="flex justify-between items-center p-4">
                  <div className="flex gap-3.5 items-center">
                    <span className="text-xs font-bold w-4 h-4 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground">{i + 1}</span>
                    <div>
                      <p className="text-xs font-bold text-foreground">{vend.name}</p>
                      <p className="text-3xs text-muted-foreground mt-0.5">Refill Gas Purity: <strong className="text-foreground">{vend.quality}</strong> • ID: {vend.id}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-foreground">{vend.refillCount} Refills</p>
                    <span className="text-4xs text-muted-foreground/80 font-bold uppercase tracking-wider block mt-0.5">Speed: {vend.speed}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>

    </div>
  );
}
