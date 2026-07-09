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
import { Plus, Search, RefreshCw, Send, ShieldCheck, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

export default function RefillsPage() {
  const { cylinders, vendors, refills, sendToRefill, receiveRefill } = useData();

  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'queue' | 'history'>('queue');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Drawer States
  const [isSendOpen, setIsSendOpen] = useState(false);
  const [selectedRefillId, setSelectedRefillId] = useState<string | null>(null);

  // Send Refill Form State
  const [sendForm, setSendForm] = useState({ cylinderId: '', vendorId: '', cost: '', sendDate: '' });
  const [receiveDate, setReceiveDate] = useState(new Date().toISOString().split('T')[0]);

  // Calculations
  const cylindersAtVendorCount = cylinders.filter(c => c.status === 'At Vendor').length;
  // Let's count empty cylinders (cylinders that are in Maintenance or Available but let's count Maintenance as a queue candidate)
  const emptyCylindersCount = cylinders.filter(c => c.status === 'Maintenance').length;
  
  const thisMonthStr = new Date().toISOString().substring(0, 7);
  const totalRefillCostThisMonth = refills
    .filter(r => r.sendDate.startsWith(thisMonthStr))
    .reduce((sum, r) => sum + r.cost, 0);

  // Filtered refills
  const filteredRefills = useMemo(() => {
    let result = [...refills];

    // Filter by tab
    if (activeTab === 'queue') {
      result = result.filter(r => r.status === 'Sent' || r.status === 'In Queue');
    } else {
      result = result.filter(r => r.status === 'Returned');
    }

    // Filter by search
    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      result = result.filter(r =>
        r.cylinderSerial.toLowerCase().includes(query) ||
        r.vendorName.toLowerCase().includes(query) ||
        r.id.toLowerCase().includes(query)
      );
    }

    // Sort by send date descending
    result.sort((a, b) => new Date(b.sendDate).getTime() - new Date(a.sendDate).getTime());

    return result;
  }, [refills, activeTab, searchTerm]);

  // Paginated data
  const paginatedRefills = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRefills.slice(start, start + itemsPerPage);
  }, [filteredRefills, currentPage]);

  const totalPages = Math.ceil(filteredRefills.length / itemsPerPage);

  const selectedRefill = useMemo(() => {
    if (!selectedRefillId) return null;
    return refills.find(r => r.id === selectedRefillId) || null;
  }, [refills, selectedRefillId]);

  const handleSendSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sendForm.cylinderId || !sendForm.vendorId || !sendForm.sendDate || !sendForm.cost) {
      alert('Harap lengkapi semua kolom wajib.');
      return;
    }
    sendToRefill({
      cylinderId: sendForm.cylinderId,
      vendorId: sendForm.vendorId,
      cost: Number(sendForm.cost),
      sendDate: sendForm.sendDate
    });
    setIsSendOpen(false);
    setSendForm({ cylinderId: '', vendorId: '', cost: '', sendDate: '' });
  };

  const handleReceiveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRefillId || !receiveDate) {
      alert('Tanggal penerimaan wajib diisi.');
      return;
    }
    receiveRefill(selectedRefillId, receiveDate);
    setSelectedRefillId(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Isi Ulang Oksigen (Vendor Refills)</h2>
          <p className="text-xs text-muted-foreground mt-1">Pantau siklus pengiriman tabung kosong, antrean pengisian gas di vendor, dan penerimaan tabung isi.</p>
        </div>
        <Button size="sm" className="flex items-center gap-1.5" onClick={() => {
          setSendForm({
            cylinderId: '',
            vendorId: '',
            cost: '',
            sendDate: new Date().toISOString().split('T')[0]
          });
          setIsSendOpen(true);
        }}>
          <Send className="w-4 h-4" /> Kirim Refill
        </Button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-2xs font-bold text-muted-foreground uppercase tracking-wider">Antrean Uji Tekan / Maintenance</p>
              <p className="text-xl font-bold mt-1 text-rose-500">{emptyCylindersCount} Tabung</p>
              <p className="text-4xs text-muted-foreground mt-1">Akan dikirim untuk isi ulang</p>
            </div>
            <div className="p-3 rounded-lg bg-rose-500/10 text-rose-500 shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-2xs font-bold text-muted-foreground uppercase tracking-wider">Tabung di Vendor Refill</p>
              <p className="text-xl font-bold mt-1 text-amber-500">{cylindersAtVendorCount} Tabung</p>
              <p className="text-4xs text-muted-foreground mt-1">Sedang proses pengisian gas</p>
            </div>
            <div className="p-3 rounded-lg bg-amber-500/10 text-amber-500 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-2xs font-bold text-muted-foreground uppercase tracking-wider">Biaya Refill (Bulan Ini)</p>
              <p className="text-xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">{formatRupiah(totalRefillCostThisMonth)}</p>
              <p className="text-4xs text-muted-foreground mt-1">Akumulasi pengeluaran isi ulang</p>
            </div>
            <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-500 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-border/60">
        <button
          onClick={() => { setActiveTab('queue'); setCurrentPage(1); }}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'queue' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Antrean Refill Vendor ({refills.filter(r => r.status !== 'Returned').length})
        </button>
        <button
          onClick={() => { setActiveTab('history'); setCurrentPage(1); }}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'history' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Riwayat Isi Ulang Selesai ({refills.filter(r => r.status === 'Returned').length})
        </button>
      </div>

      {/* Filter and Search Card */}
      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Cari berdasarkan nomor seri tabung, nama vendor..."
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="flex h-10 w-full rounded-lg border border-border bg-background pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:border-border/60"
            />
          </div>
        </CardContent>
      </Card>

      {/* Refills Table */}
      <Card>
        <CardContent className="p-0">
          {paginatedRefills.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-24">ID Refill</TableHead>
                    <TableHead>Serial Tabung (SN)</TableHead>
                    <TableHead>Vendor Mitra</TableHead>
                    <TableHead>Tanggal Kirim</TableHead>
                    {activeTab === 'history' && <TableHead>Tanggal Kembali</TableHead>}
                    <TableHead>Biaya Isi Ulang</TableHead>
                    <TableHead className="w-24 text-center">Status</TableHead>
                    {activeTab === 'queue' && <TableHead className="w-28 text-right">Aksi</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRefills.map(ref => (
                    <TableRow key={ref.id}>
                      <TableCell className="font-bold text-xs">{ref.id}</TableCell>
                      <TableCell className="font-semibold text-xs text-primary">{ref.cylinderSerial}</TableCell>
                      <TableCell className="font-semibold text-foreground">{ref.vendorName}</TableCell>
                      <TableCell className="text-xs">{ref.sendDate}</TableCell>
                      {activeTab === 'history' && <TableCell className="text-xs">{ref.returnDate}</TableCell>}
                      <TableCell className="font-bold text-xs">{formatRupiah(ref.cost)}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={ref.status === 'Returned' ? 'success' : ref.status === 'Sent' ? 'info' : 'warning'}>
                          {ref.status === 'Returned' ? 'Kembali' : ref.status === 'Sent' ? 'Sent' : 'In Queue'}
                        </Badge>
                      </TableCell>
                      {activeTab === 'queue' && (
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline" className="h-8 px-2.5 flex items-center gap-1 cursor-pointer" onClick={() => setSelectedRefillId(ref.id)}>
                            <RefreshCw className="w-3.5 h-3.5" /> Terima
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={filteredRefills.length}
                itemsPerPage={itemsPerPage}
              />
            </>
          ) : (
            <div className="py-24 text-center flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-12 h-12 text-muted-foreground/45" />
              <h3 className="text-base font-bold text-foreground">Tidak Ada Antrean</h3>
              <p className="text-xs text-muted-foreground max-w-sm">
                Saat ini tidak ada tabung yang berada di {activeTab === 'queue' ? 'antrean vendor pengisian ulang' : 'riwayat transaksi selesai'}.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 1. DRAWER - SEND REFILL */}
      <Drawer isOpen={isSendOpen} onClose={() => setIsSendOpen(false)} title="Kirim Tabung Kosong Ke Vendor">
        <form onSubmit={handleSendSubmit} className="space-y-4">
          <Select
            label="Pilih Tabung Oksigen Kosong / Maintenance *"
            id="sendCylId"
            value={sendForm.cylinderId}
            onChange={e => setSendForm({ ...sendForm, cylinderId: e.target.value })}
            options={[
              { value: '', label: '-- Pilih Tabung Kosong --' },
              // Exclude rented and at vendor cylinders. Let Available and Maintenance be candidates
              ...cylinders.filter(c => c.status !== 'Rented' && c.status !== 'At Vendor').map(c => ({ value: c.id, label: `${c.serialNo} (${c.size} | Status: ${c.status})` }))
            ]}
          />
          <Select
            label="Pilih Vendor Tujuan Refill *"
            id="sendVendorId"
            value={sendForm.vendorId}
            onChange={e => setSendForm({ ...sendForm, vendorId: e.target.value })}
            options={[
              { value: '', label: '-- Pilih Vendor Mitra --' },
              ...vendors.filter(v => v.status === 'Active').map(v => ({ value: v.id, label: v.companyName }))
            ]}
          />
          <Input
            label="Biaya Refill Gas (Rp) *"
            id="sendCost"
            type="number"
            placeholder="e.g. 80000"
            value={sendForm.cost}
            onChange={e => setSendForm({ ...sendForm, cost: e.target.value })}
          />
          <Input
            label="Tanggal Pengiriman ke Vendor *"
            id="sendDate"
            type="date"
            value={sendForm.sendDate}
            onChange={e => setSendForm({ ...sendForm, sendDate: e.target.value })}
          />
          <div className="border-t border-border pt-4 flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setIsSendOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" className="flex-1">
              Kirim ke Pabrik
            </Button>
          </div>
        </form>
      </Drawer>

      {/* 2. DRAWER - RECEIVE REFILL */}
      <Drawer isOpen={!!selectedRefill} onClose={() => setSelectedRefillId(null)} title={`Terima Tabung ${selectedRefill?.cylinderSerial}`}>
        {selectedRefill && (
          <form onSubmit={handleReceiveSubmit} className="space-y-4">
            <div className="bg-muted/30 p-4 border border-border rounded-xl text-xs space-y-2">
              <p><span className="text-muted-foreground">ID Refill:</span> <span className="font-semibold">{selectedRefill.id}</span></p>
              <p><span className="text-muted-foreground">Vendor:</span> <span className="font-semibold">{selectedRefill.vendorName}</span></p>
              <p><span className="text-muted-foreground">Biaya:</span> <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatRupiah(selectedRefill.cost)}</span></p>
              <p><span className="text-muted-foreground">Tanggal Kirim:</span> <span className="font-semibold">{selectedRefill.sendDate}</span></p>
            </div>
            
            <Input
              label="Tanggal Penerimaan Tabung Gas *"
              id="recvDate"
              type="date"
              value={receiveDate}
              onChange={e => setReceiveDate(e.target.value)}
            />

            <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg text-emerald-600 dark:text-emerald-400 text-3xs flex gap-2 items-center">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Status tabung otomatis berubah menjadi <strong>Tersedia (Available)</strong> dan logistik gudang bertambah.</span>
            </div>

            <div className="border-t border-border pt-4 flex gap-3">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setSelectedRefillId(null)}>
                Batal
              </Button>
              <Button type="submit" variant="success" className="flex-1">
                Terima Tabung Isi
              </Button>
            </div>
          </form>
        )}
      </Drawer>

    </div>
  );
}
