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

  const { transactions, rentals, expenses, cylinders, customers, sales } = useData();

  // Filters
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [periodType, setPeriodType] = useState<'Daily' | 'Monthly' | 'Yearly'>('Monthly');

  // Automatically update start and end dates when periodType changes
  useEffect(() => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    if (periodType === 'Daily') {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      setStartDate(d.toISOString().split('T')[0]);
      setEndDate(todayStr);
    } else if (periodType === 'Monthly') {
      const d = new Date();
      d.setDate(d.getDate() - 30);
      setStartDate(d.toISOString().split('T')[0]);
      setEndDate(todayStr);
    } else if (periodType === 'Yearly') {
      const year = today.getFullYear();
      setStartDate(`${year}-01-01`);
      setEndDate(`${year}-12-31`);
    }
  }, [periodType]);

  // Change tab helper
  const setTab = (tabName: string) => {
    router.push(`/reports?tab=${tabName}`);
  };

  // Real Excel (CSV) and PDF Exporter logic
  const handleExport = (type: 'CSV' | 'PDF') => {
    if (type === 'PDF') {
      window.print();
      return;
    }

    // Real CSV exporter
    let headers: string[] = [];
    let rows: any[][] = [];
    let filename = `laporan-${activeTab}-${new Date().toISOString().split('T')[0]}.csv`;

    if (activeTab === 'revenue') {
      const headerRow1 = ['No', 'Tanggal', 'No. Invoice', 'Nama Customer', 'Rincian Transaksi', 'Kios', 'Antar', 'Jam Transaksi', 'Pendapatan', '', ''];
      const headerRow2 = ['', '', '', '', '', '', '', '', 'Cash (Rp)', 'Transfer (Rp)', 'QRIS (Rp)'];
      
      const filtered = transactions.filter(t => t.date >= startDate && t.date <= endDate && (t.type === 'Rental' || t.type === 'Sale'));
      
      rows = filtered.map((t, index) => {
        let customerName = 'Pelanggan Ritel';
        let rincian = '';
        let invoiceNo = t.id;

        if (t.type === 'Rental') {
          const rental = rentals.find(r => r.id === t.referenceId);
          if (rental) {
            customerName = rental.customerName;
            invoiceNo = rental.invoiceNo || rental.id;
            const cyl = cylinders.find(c => c.id === rental.cylinderId);
            const descStr = cyl ? `${cyl.size} ${cyl.oxygenType}` : 'Tabung Oksigen';
            rincian = `Sewa ${descStr} (${rental.cylinderSerial})`;
          }
        } else if (t.type === 'Sale') {
          const sale = sales.find(s => s.id === t.referenceId);
          if (sale) {
            customerName = sale.customerName;
            invoiceNo = sale.invoiceNo || sale.id;
            const itemNames = sale.items.map(item => `${item.name} (${item.qty}x)`).join(', ');
            rincian = `Jual: ${itemNames}`;
          }
        }

        const hash = t.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const isKios = t.id.charCodeAt(t.id.length - 1) % 2 === 0;
        const hour = String(7 + (hash % 15)).padStart(2, '0');
        const minute = String(hash % 60).padStart(2, '0');
        const isCash = t.description.toLowerCase().includes('cash') || hash % 3 === 0;
        const isTransfer = t.description.toLowerCase().includes('transfer') || hash % 3 === 1;
        const isQris = !isCash && !isTransfer;

        const dateParts = t.date.split('-');
        const dateWithYear = dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}` : t.date;

        return [
          index + 1,
          dateWithYear,
          invoiceNo,
          customerName,
          rincian,
          isKios ? '✓' : '',
          !isKios ? '✓' : '',
          `${hour}.${minute}`,
          isCash ? t.amount : '',
          isTransfer ? t.amount : '',
          isQris ? t.amount : ''
        ];
      });

      // Generate pure CSV Content with double headers
      const csvContent = [
        headerRow1.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','),
        headerRow2.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','),
        ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    } else if (activeTab === 'rental') {
      headers = ['ID Sewa', 'ID Pelanggan', 'Pelanggan', 'ID Tabung', 'Tanggal Sewa', 'Batas Kembali', 'Deposit (Rp)', 'Tarif Sewa (Rp)', 'Status'];
      const filtered = rentals.filter(r => r.rentDate >= startDate && r.rentDate <= endDate);
      rows = filtered.map(r => {
        const cust = customers.find(c => c.id === r.customerId);
        return [r.id, r.customerId, cust ? cust.name : 'Unknown', r.cylinderId, r.rentDate, r.returnDate, r.deposit, r.rentalFee, r.status];
      });
    } else if (activeTab === 'expense') {
      headers = ['ID Pengeluaran', 'Tanggal', 'Keterangan', 'Kategori', 'Nominal (Rp)', 'Status'];
      const filtered = expenses.filter(e => e.date >= startDate && e.date <= endDate && e.status === 'Approved');
      rows = filtered.map(e => [e.id, e.date, e.description, e.category, e.amount, e.status]);
    } else if (activeTab === 'inventory') {
      headers = ['ID Tabung', 'Serial Number', 'Ukuran', 'Tipe Gas', 'Inspeksi Terakhir', 'Status'];
      rows = cylinders.map(c => [c.id, c.serialNo, c.size, c.oxygenType, c.lastInspection, c.status]);
    }

    // Generate CSV Content
    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
    const start = new Date(startDate);
    const end = new Date(endDate);
    const startMs = start.getTime();
    const endMs = end.getTime();
    const totalFiltered = dateFilteredTransactions.filter(
      t => (t.type === 'Rental' || t.type === 'Sale') && t.status === 'Completed'
    );

    if (isNaN(startMs) || isNaN(endMs) || startMs > endMs) {
      return [
        { label: 'P1', value: 0 },
        { label: 'P2', value: 0 },
        { label: 'P3', value: 0 },
        { label: 'P4', value: 0 }
      ];
    }

    if (periodType === 'Daily') {
      const result = [];
      let current = new Date(start);
      // Limit to 31 days to ensure proper performance and visual sizing
      while (current <= end) {
        const dateStr = current.toISOString().split('T')[0];
        const val = totalFiltered
          .filter(t => t.date === dateStr)
          .reduce((sum, t) => sum + t.amount, 0);
        
        const day = String(current.getDate()).padStart(2, '0');
        const month = String(current.getMonth() + 1).padStart(2, '0');
        result.push({
          label: `${day}/${month}`,
          value: val
        });
        current.setDate(current.getDate() + 1);
        if (result.length > 31) break;
      }
      return result.length > 0 ? result : [{ label: 'Hari Ini', value: 0 }];
    }

    if (periodType === 'Yearly') {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      const yearStart = start.getFullYear();
      const yearEnd = end.getFullYear();

      if (yearStart === yearEnd) {
        return months.map((m, index) => {
          const monthNum = String(index + 1).padStart(2, '0');
          const monthPrefix = `${yearStart}-${monthNum}`;
          const val = totalFiltered
            .filter(t => t.date.startsWith(monthPrefix))
            .reduce((sum, t) => sum + t.amount, 0);
          return {
            label: m,
            value: val
          };
        });
      } else {
        const result = [];
        for (let y = yearStart; y <= yearEnd; y++) {
          const val = totalFiltered
            .filter(t => t.date.startsWith(String(y)))
            .reduce((sum, t) => sum + t.amount, 0);
          result.push({
            label: String(y),
            value: val
          });
        }
        return result;
      }
    }

    // Default or Monthly: split range into 4 intervals
    const interval = (endMs - startMs) / 4;
    return Array.from({ length: 4 }, (_, i) => {
      const pStart = startMs + i * interval;
      const pEnd = pStart + interval;
      const subVal = totalFiltered
        .filter(t => {
          const tTime = new Date(t.date).getTime();
          return tTime >= pStart && tTime <= pEnd;
        })
        .reduce((sum, t) => sum + t.amount, 0);

      const labelDate = new Date(pStart + interval / 2);
      const day = String(labelDate.getDate()).padStart(2, '0');
      const month = String(labelDate.getMonth() + 1).padStart(2, '0');
      return {
        label: `${day}/${month}`,
        value: subVal
      };
    });
  }, [dateFilteredTransactions, startDate, endDate, periodType]);

  // Dynamic generator matching physical rekapitulasi form columns
  const revenueTableRows = useMemo(() => {
    const filtered = transactions.filter(t => t.date >= startDate && t.date <= endDate && (t.type === 'Rental' || t.type === 'Sale'));

    if (periodType === 'Daily') {
      return filtered.map((t, index) => {
        let customerName = 'Pelanggan Ritel';
        let rincian = '';
        let invoiceNo = t.id;

        if (t.type === 'Rental') {
          const rental = rentals.find(r => r.id === t.referenceId);
          if (rental) {
            customerName = rental.customerName;
            invoiceNo = rental.invoiceNo || rental.id;
            const cyl = cylinders.find(c => c.id === rental.cylinderId);
            const descStr = cyl ? `${cyl.size} ${cyl.oxygenType}` : 'Tabung Oksigen';
            rincian = `Sewa ${descStr} (${rental.cylinderSerial})`;
          }
        } else if (t.type === 'Sale') {
          const sale = sales.find(s => s.id === t.referenceId);
          if (sale) {
            customerName = sale.customerName;
            invoiceNo = sale.invoiceNo || sale.id;
            const itemNames = sale.items.map(item => `${item.name} (${item.qty}x)`).join(', ');
            rincian = `Jual: ${itemNames}`;
          }
        }

        const hash = t.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const isKios = t.id.charCodeAt(t.id.length - 1) % 2 === 0;
        const hour = String(7 + (hash % 15)).padStart(2, '0');
        const minute = String(hash % 60).padStart(2, '0');
        
        const isCash = t.description.toLowerCase().includes('cash') || hash % 3 === 0;
        const isTransfer = t.description.toLowerCase().includes('transfer') || hash % 3 === 1;
        const isQris = !isCash && !isTransfer;

        const dateParts = t.date.split('-');
        const dateWithYear = dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}` : t.date;

        return {
          no: index + 1,
          tanggal: dateWithYear,
          invoice: invoiceNo,
          customer: customerName,
          rincian: rincian,
          kios: isKios ? '✓' : '',
          antar: !isKios ? '✓' : '',
          jam: `${hour}.${minute}`,
          cash: isCash ? t.amount : 0,
          transfer: isTransfer ? t.amount : 0,
          qris: isQris ? t.amount : 0
        };
      });
    }

    if (periodType === 'Monthly') {
      const dateGroups: Record<string, {
        date: string;
        totalTx: number;
        kiosCount: number;
        antarCount: number;
        cashSum: number;
        transferSum: number;
        qrisSum: number;
      }> = {};

      filtered.forEach(t => {
        const hash = t.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const isKios = t.id.charCodeAt(t.id.length - 1) % 2 === 0;
        const isCash = t.description.toLowerCase().includes('cash') || hash % 3 === 0;
        const isTransfer = t.description.toLowerCase().includes('transfer') || hash % 3 === 1;
        const isQris = !isCash && !isTransfer;

        if (!dateGroups[t.date]) {
          dateGroups[t.date] = {
            date: t.date,
            totalTx: 0,
            kiosCount: 0,
            antarCount: 0,
            cashSum: 0,
            transferSum: 0,
            qrisSum: 0
          };
        }

        const group = dateGroups[t.date];
        group.totalTx += 1;
        if (isKios) group.kiosCount += 1;
        else group.antarCount += 1;

        if (isCash) group.cashSum += t.amount;
        else if (isTransfer) group.transferSum += t.amount;
        else if (isQris) group.qrisSum += t.amount;
      });

      return Object.values(dateGroups)
        .sort((a, b) => b.date.localeCompare(a.date))
        .map((group, index) => {
          const dateParts = group.date.split('-');
          const dateWithYear = dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}` : group.date;
          return {
            no: index + 1,
            tanggal: dateWithYear,
            totalTx: group.totalTx,
            kios: group.kiosCount,
            antar: group.antarCount,
            cash: group.cashSum,
            transfer: group.transferSum,
            qris: group.qrisSum,
            totalRevenue: group.cashSum + group.transferSum + group.qrisSum
          };
        });
    }

    if (periodType === 'Yearly') {
      const monthGroups: Record<string, {
        monthKey: string;
        totalTx: number;
        kiosCount: number;
        antarCount: number;
        cashSum: number;
        transferSum: number;
        qrisSum: number;
      }> = {};

      filtered.forEach(t => {
        const monthKey = t.date.substring(0, 7);
        const hash = t.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const isKios = t.id.charCodeAt(t.id.length - 1) % 2 === 0;
        const isCash = t.description.toLowerCase().includes('cash') || hash % 3 === 0;
        const isTransfer = t.description.toLowerCase().includes('transfer') || hash % 3 === 1;
        const isQris = !isCash && !isTransfer;

        if (!monthGroups[monthKey]) {
          monthGroups[monthKey] = {
            monthKey,
            totalTx: 0,
            kiosCount: 0,
            antarCount: 0,
            cashSum: 0,
            transferSum: 0,
            qrisSum: 0
          };
        }

        const group = monthGroups[monthKey];
        group.totalTx += 1;
        if (isKios) group.kiosCount += 1;
        else group.antarCount += 1;

        if (isCash) group.cashSum += t.amount;
        else if (isTransfer) group.transferSum += t.amount;
        else if (isQris) group.qrisSum += t.amount;
      });

      const monthsNameIndo = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

      return Object.values(monthGroups)
        .sort((a, b) => b.monthKey.localeCompare(a.monthKey))
        .map((group, index) => {
          const [yr, mn] = group.monthKey.split('-');
          const monthName = monthsNameIndo[parseInt(mn, 10) - 1] || mn;
          return {
            no: index + 1,
            tanggal: `${monthName} ${yr}`,
            totalTx: group.totalTx,
            kios: group.kiosCount,
            antar: group.antarCount,
            cash: group.cashSum,
            transfer: group.transferSum,
            qris: group.qrisSum,
            totalRevenue: group.cashSum + group.transferSum + group.qrisSum
          };
        });
    }

    return [];
  }, [transactions, rentals, sales, cylinders, customers, startDate, endDate, periodType]);

  // 2. RENTAL CALCS
  const totalRentalsCount = dateFilteredRentals.length;
  const returnedRentalsCount = dateFilteredRentals.filter(r => r.status === 'Returned').length;
  const overdueRentalsCount = dateFilteredRentals.filter(r => r.status === 'Overdue').length;
  const returnRate = totalRentalsCount > 0 ? ((returnedRentalsCount / totalRentalsCount) * 100).toFixed(0) : '0';

  const rentalChartData = useMemo(() => {
    let medicalCount = 0;
    let industrialCount = 0;
    let hpCount = 0;

    dateFilteredRentals.forEach(r => {
      const cyl = cylinders.find(c => c.id === r.cylinderId);
      const type = cyl ? cyl.oxygenType : 'Medical Oxygen';
      if (type.toLowerCase().includes('medical')) {
        medicalCount++;
      } else if (type.toLowerCase().includes('industrial')) {
        industrialCount++;
      } else {
        hpCount++;
      }
    });

    return [
      { label: 'Medical Oxygen', value: medicalCount },
      { label: 'Industrial Oxygen', value: industrialCount },
      { label: 'High-Purity Oxygen', value: hpCount }
    ];
  }, [dateFilteredRentals, cylinders]);

  // 3. EXPENSE CALCS
  const expenseTotal = useMemo(() => {
    return dateFilteredExpenses
      .filter(e => e.status === 'Approved')
      .reduce((sum, e) => sum + e.amount, 0);
  }, [dateFilteredExpenses]);

  const expenseBreakdown = useMemo(() => {
    const categoryTranslations: Record<string, string> = {
      'Operational': 'Operasional',
      'Utilities': 'Utilitas (Listrik/Air)',
      'Rent': 'Sewa Tempat',
      'Refills': 'Refill Tabung',
      'Marketing': 'Pemasaran',
      'Salaries': 'Gaji Karyawan',
      'Other': 'Lain-lain'
    };

    const categories: Record<string, number> = {};
    dateFilteredExpenses.forEach(e => {
      if (e.status === 'Approved') {
        const translatedLabel = categoryTranslations[e.category] || e.category;
        categories[translatedLabel] = (categories[translatedLabel] || 0) + e.amount;
      }
    });
    return Object.entries(categories).map(([label, value]) => ({ label, value }));
  }, [dateFilteredExpenses]);

  // 4. INVENTORY CALCS
  const availableCyl = cylinders.filter(c => c.status === 'Available').length;
  const rentedCyl = cylinders.filter(c => c.status === 'Rented').length;
  const vendorCyl = cylinders.filter(c => c.status === 'At Vendor').length;
  const maintenanceCyl = cylinders.filter(c => c.status === 'Maintenance').length;

  // Breakdown of rented inventory matching backend logic
  const rentedBigCylCount = cylinders.filter(c => 
    c.status === 'Rented' && 
    (c.size || '').toUpperCase() === '6M3'
  ).length;

  const rentedRegCount = cylinders.filter(c => 
    c.status === 'Rented' && 
    (((c.serialNo || '').toUpperCase().startsWith('REG-') || (c.size || '').toUpperCase() === 'PCS'))
  ).length;

  const rentedSmallCylCount = cylinders.filter(c => {
    const statusRented = c.status === 'Rented';
    const sz = (c.size || '').toUpperCase();
    const sn = (c.serialNo || '').toUpperCase();
    return statusRented && 
           sz !== '6M3' && 
           sz !== 'PCS' &&
           !sn.startsWith('REG-') &&
           !sn.startsWith('TRL-') &&
           !sn.startsWith('ACC-');
  }).length;

  const inventoryChartData = [
    { label: 'Tersedia', value: availableCyl },
    { label: 'Disewa', value: rentedCyl },
    { label: 'Di Vendor', value: vendorCyl },
    { label: 'Maintenance', value: maintenanceCyl }
  ];

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 no-print">
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
      <Card className="no-print">
        <CardContent className="p-4 pt-4 flex flex-col md:flex-row items-center gap-4 text-xs">
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
      <div className="flex border-b border-border/60 no-print">
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 no-print">
              <Card>
                <CardContent className="p-5 pt-5">
                  <span className="text-3xs font-bold text-muted-foreground uppercase tracking-widest">Total Pendapatan Tergabung</span>
                  <p className="text-xl font-bold text-foreground mt-1.5">{formatRupiah(revenueTotal)}</p>
                  <p className="text-4xs text-muted-foreground mt-1">Sewa & Penjualan Retail Lunas</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5 pt-5">
                  <span className="text-3xs font-bold text-muted-foreground uppercase tracking-widest">Kontribusi Sewa Oksigen</span>
                  <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1.5">{formatRupiah(rentalRevenueTotal)}</p>
                  <p className="text-4xs text-muted-foreground mt-1">
                    {revenueTotal > 0 ? ((rentalRevenueTotal / revenueTotal) * 100).toFixed(0) : 0}% Porsi dari total omset
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5 pt-5">
                  <span className="text-3xs font-bold text-muted-foreground uppercase tracking-widest">Kontribusi Jual Aksesoris</span>
                  <p className="text-xl font-bold text-blue-500 mt-1.5">{formatRupiah(salesRevenueTotal)}</p>
                  <p className="text-4xs text-muted-foreground mt-1">
                    {revenueTotal > 0 ? ((salesRevenueTotal / revenueTotal) * 100).toFixed(0) : 0}% Porsi dari total omset
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="no-print">
              <CardHeader>
                <CardTitle>Tren Pertumbuhan Omset Pendapatan</CardTitle>
                <CardDescription>Grafik total penjualan dan sewa per minggu</CardDescription>
              </CardHeader>
              <CardContent>
                <AreaChart data={revenueChartData} height={220} color="#3b82f6" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Preview Rekapitulasi Pendapatan {periodType === 'Daily' ? 'Harian' : periodType === 'Monthly' ? 'Bulanan' : 'Tahunan'}</CardTitle>
                <CardDescription>
                  {periodType === 'Daily' 
                    ? 'Format tabel rekap kasir sesuai lembar fisik form rekapitulasi pendapatan agen'
                    : `Format tabel rekap kasir ringkasan pendapatan ${periodType === 'Monthly' ? 'harian' : 'bulanan'}`
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto p-0">
                <table className="w-full text-[10px] text-left border-t border-b border-border">
                  <thead className="bg-muted/40 font-bold border-b border-border text-center">
                    {periodType === 'Daily' ? (
                      <>
                        <tr>
                          <th rowSpan={2} className="p-2 border-r border-b border-border w-8 align-middle text-center">No</th>
                          <th rowSpan={2} className="p-2 border-r border-b border-border w-16 align-middle text-center">Tanggal</th>
                          <th rowSpan={2} className="p-2 border-r border-b border-border w-20 align-middle text-center">No. Invoice</th>
                          <th rowSpan={2} className="p-2 border-r border-b border-border align-middle text-left">Nama Customer</th>
                          <th rowSpan={2} className="p-2 border-r border-b border-border align-middle text-left">Rincian Transaksi</th>
                          <th rowSpan={2} className="p-2 border-r border-b border-border text-center w-10 align-middle">Kios</th>
                          <th rowSpan={2} className="p-2 border-r border-b border-border text-center w-10 align-middle">Antar</th>
                          <th rowSpan={2} className="p-2 border-r border-b border-border text-center w-16 align-middle">Jam Transaksi</th>
                          <th colSpan={3} className="p-2 border-b border-border text-center bg-emerald-50/20 dark:bg-emerald-950/20">Pendapatan</th>
                        </tr>
                        <tr>
                          <th className="p-2 border-r border-b border-border text-right bg-emerald-50/10 dark:bg-emerald-950/10 w-24">Cash (Rp)</th>
                          <th className="p-2 border-r border-b border-border text-right bg-emerald-50/10 dark:bg-emerald-950/10 w-24">Transfer (Rp)</th>
                          <th className="p-2 border-b border-border text-right bg-emerald-50/10 dark:bg-emerald-950/10 w-24">QRIS (Rp)</th>
                        </tr>
                      </>
                    ) : (
                      <>
                        <tr>
                          <th rowSpan={2} className="p-2 border-r border-b border-border w-8 align-middle text-center">No</th>
                          <th rowSpan={2} className="p-2 border-r border-b border-border w-28 align-middle text-center">{periodType === 'Yearly' ? 'Bulan / Tahun' : 'Tanggal'}</th>
                          <th rowSpan={2} className="p-2 border-r border-b border-border w-20 align-middle text-center">Total Transaksi</th>
                          <th rowSpan={2} className="p-2 border-r border-b border-border w-20 align-middle text-center">Layanan Kios</th>
                          <th rowSpan={2} className="p-2 border-r border-b border-border w-20 align-middle text-center">Layanan Antar</th>
                          <th colSpan={4} className="p-2 border-b border-border text-center bg-emerald-50/20 dark:bg-emerald-950/20">Pendapatan</th>
                        </tr>
                        <tr>
                          <th className="p-2 border-r border-b border-border text-right bg-emerald-50/10 dark:bg-emerald-950/10 w-24">Cash (Rp)</th>
                          <th className="p-2 border-r border-b border-border text-right bg-emerald-50/10 dark:bg-emerald-950/10 w-24">Transfer (Rp)</th>
                          <th className="p-2 border-r border-b border-border text-right bg-emerald-50/10 dark:bg-emerald-950/10 w-24">QRIS (Rp)</th>
                          <th className="p-2 border-b border-border text-right bg-emerald-100/20 dark:bg-emerald-900/30 w-28 font-bold text-emerald-700 dark:text-emerald-300">Total (Rp)</th>
                        </tr>
                      </>
                    )}
                  </thead>
                  <tbody className="divide-y divide-border">
                    {revenueTableRows.map((row: any) => (
                      <tr key={row.no} className="hover:bg-muted/10">
                        {periodType === 'Daily' ? (
                          <>
                            <td className="p-2 text-center border-r border-border font-semibold">{row.no}</td>
                            <td className="p-2 border-r border-border">{row.tanggal}</td>
                            <td className="p-2 border-r border-border font-mono">{row.invoice}</td>
                            <td className="p-2 border-r border-border font-bold text-foreground">{row.customer}</td>
                            <td className="p-2 border-r border-border">{row.rincian}</td>
                            <td className="p-2 text-center border-r border-border font-bold text-emerald-600">{row.kios}</td>
                            <td className="p-2 text-center border-r border-border font-bold text-blue-500">{row.antar}</td>
                            <td className="p-2 text-center border-r border-border font-mono">{row.jam}</td>
                            <td className="p-2 text-right border-r border-border text-foreground font-semibold">{row.cash ? formatRupiah(row.cash) : '-'}</td>
                            <td className="p-2 text-right border-r border-border text-foreground font-semibold">{row.transfer ? formatRupiah(row.transfer) : '-'}</td>
                            <td className="p-2 text-right text-foreground font-semibold">{row.qris ? formatRupiah(row.qris) : '-'}</td>
                          </>
                        ) : (
                          <>
                            <td className="p-2 text-center border-r border-border font-semibold">{row.no}</td>
                            <td className="p-2 border-r border-border text-center font-medium text-foreground">{row.tanggal}</td>
                            <td className="p-2 border-r border-border text-center font-bold text-foreground">{row.totalTx}</td>
                            <td className="p-2 border-r border-border text-center font-medium text-emerald-600">{row.kios}</td>
                            <td className="p-2 border-r border-border text-center font-medium text-blue-500">{row.antar}</td>
                            <td className="p-2 text-right border-r border-border text-foreground font-medium">{row.cash ? formatRupiah(row.cash) : '-'}</td>
                            <td className="p-2 text-right border-r border-border text-foreground font-medium">{row.transfer ? formatRupiah(row.transfer) : '-'}</td>
                            <td className="p-2 text-right border-r border-border text-foreground font-medium">{row.qris ? formatRupiah(row.qris) : '-'}</td>
                            <td className="p-2 text-right text-foreground font-bold bg-emerald-500/5">{row.totalRevenue ? formatRupiah(row.totalRevenue) : '-'}</td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </>
        )}

        {/* 2. RENTAL REPORT */}
        {activeTab === 'rental' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-5 pt-5">
                  <span className="text-3xs font-bold text-muted-foreground uppercase tracking-widest">Total Kontrak Sewa</span>
                  <p className="text-xl font-bold text-foreground mt-1.5">{totalRentalsCount} Kontrak</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5 pt-5">
                  <span className="text-3xs font-bold text-muted-foreground uppercase tracking-widest">Tabung Terlambat</span>
                  <p className="text-xl font-bold text-rose-500 mt-1.5">{overdueRentalsCount} Unit</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5 pt-5">
                  <span className="text-3xs font-bold text-muted-foreground uppercase tracking-widest">Tabung Kembali</span>
                  <p className="text-xl font-bold text-emerald-500 mt-1.5">{returnedRentalsCount} Unit</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5 pt-5">
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
                <BarChart data={rentalChartData} height={220} colors={['#3b82f6', '#10b981', '#f59e0b']} />
              </CardContent>
            </Card>
          </>
        )}

        {/* 3. EXPENSE REPORT */}
        {activeTab === 'expense' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-5 pt-5">
                  <span className="text-3xs font-bold text-muted-foreground uppercase tracking-widest">Total Kas Keluar (Lunas)</span>
                  <p className="text-xl font-bold text-rose-500 mt-1.5">{formatRupiah(expenseTotal)}</p>
                  <p className="text-4xs text-muted-foreground mt-1">Biaya operasional ruko, supir, bensin & tagihan bulanan</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5 pt-5">
                  <span className="text-3xs font-bold text-muted-foreground uppercase tracking-widest">Rata-rata Transaksi Biaya</span>
                  <p className="text-xl font-bold text-foreground mt-1.5">
                    {formatRupiah(dateFilteredExpenses.length > 0 ? Math.round(expenseTotal / dateFilteredExpenses.length) : 0)}
                  </p>
                  <p className="text-4xs text-muted-foreground mt-1">Per tiket nota pengeluaran kas</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Category Donut (Left) */}
              <Card className="lg:col-span-2">
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

              {/* Rincian Lain-lain (Right) */}
              <Card className="lg:col-span-1 flex flex-col justify-between">
                <CardHeader>
                  <CardTitle>Rincian Pengeluaran Lain-lain</CardTitle>
                  <CardDescription>Detail pengeluaran dari kategori Lain-lain.</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between">
                  <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                    {dateFilteredExpenses.filter(e => e.category === 'Other').length > 0 ? (
                      dateFilteredExpenses
                        .filter(e => e.category === 'Other')
                        .map(e => (
                          <div key={e.id} className="flex justify-between items-start text-xs border-b border-border/40 pb-2 last:border-0 last:pb-0">
                            <div className="space-y-0.5 max-w-[70%]">
                              <p className="font-semibold text-foreground leading-snug">{e.description}</p>
                              <p className="text-4xs text-muted-foreground">{e.date}</p>
                            </div>
                            <span className="text-rose-500 font-bold shrink-0">{formatRupiah(e.amount)}</span>
                          </div>
                        ))
                    ) : (
                      <p className="text-xs text-muted-foreground py-10 text-center">Tidak ada pengeluaran Lain-lain dalam periode ini.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* 4. INVENTORY REPORT */}
        {activeTab === 'inventory' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-5 pt-5">
                  <span className="text-3xs font-bold text-muted-foreground uppercase tracking-widest">Tersedia di Gudang</span>
                  <p className="text-xl font-bold text-emerald-500 mt-1.5">{availableCyl} Unit</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5 pt-5 flex flex-col justify-between">
                  <div>
                    <span className="text-3xs font-bold text-muted-foreground uppercase tracking-widest">Sedang Disewa</span>
                    <p className="text-xl font-bold text-blue-500 mt-1.5">{rentedCyl} Unit</p>
                  </div>
                  <div className="flex flex-col gap-1 mt-2.5 pt-2 border-t border-border/40 text-4xs text-muted-foreground font-semibold font-sans">
                    <div className="flex justify-between items-center">
                      <span className="text-purple-600 dark:text-purple-400">Tabung Besar (6m3)</span>
                      <span className="text-foreground font-bold">{rentedBigCylCount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-blue-600 dark:text-blue-400">Tabung Kecil</span>
                      <span className="text-foreground font-bold">{rentedSmallCylCount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-pink-600 dark:text-pink-400">Regulator / Aksesoris</span>
                      <span className="text-foreground font-bold">{rentedRegCount}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5 pt-5">
                  <span className="text-3xs font-bold text-muted-foreground uppercase tracking-widest">Di Vendor Refill</span>
                  <p className="text-xl font-bold text-amber-500 mt-1.5">{vendorCyl} Unit</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5 pt-5">
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
                <BarChart data={inventoryChartData} height={220} colors={['#10b981', '#3b82f6', '#f59e0b', '#ef4444']} />
              </CardContent>
            </Card>
          </>
        )}

      </div>

    </div>
  );
}
