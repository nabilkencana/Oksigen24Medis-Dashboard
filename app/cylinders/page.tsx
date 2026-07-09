'use client';

import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Input, Select } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Drawer } from '../../components/ui/Drawer';
import { Modal } from '../../components/ui/Modal';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Pagination } from '../../components/ui/Table';
import { Plus, Search, Edit2, Trash2, Database, Filter, X } from 'lucide-react';
import { OXYGEN_TYPES } from '../../context/mockData';

export default function CylindersPage() {
  const { cylinders, addCylinder, updateCylinder, deleteCylinder } = useData();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Available' | 'Rented' | 'At Vendor' | 'Maintenance'>('All');
  const [sizeFilter, setSizeFilter] = useState<'All' | '1m3' | '2m3' | '6m3'>('All');
  const [sortKey, setSortKey] = useState<'id' | 'serialNo' | 'size' | 'lastInspection'>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Drawer & Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  const [selectedCylinderId, setSelectedCylinderId] = useState<string | null>(null);

  // Form State
  const [formFields, setFormFields] = useState({
    serialNo: '',
    oxygenType: 'Medical Oxygen',
    size: '1m3' as '1m3' | '2m3' | '6m3',
    status: 'Available' as 'Available' | 'Rented' | 'At Vendor' | 'Maintenance',
    lastInspection: ''
  });

  // Handle URL searches (from command palette search)
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const urlSearch = searchParams.get('search');
      if (urlSearch) {
        setSearchTerm(urlSearch);
      }
    }
  }, []);

  // Filtered & Sorted Cylinders
  const filteredCylinders = useMemo(() => {
    let result = [...cylinders];

    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      result = result.filter(c =>
        c.serialNo.toLowerCase().includes(query) ||
        c.id.toLowerCase().includes(query) ||
        c.oxygenType.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== 'All') {
      result = result.filter(c => c.status === statusFilter);
    }

    if (sizeFilter !== 'All') {
      result = result.filter(c => c.size === sizeFilter);
    }

    result.sort((a, b) => {
      let valA = a[sortKey];
      let valB = b[sortKey];

      if (sortKey === 'serialNo') {
        valA = (valA as string).toLowerCase();
        valB = (valB as string).toLowerCase();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [cylinders, searchTerm, statusFilter, sizeFilter, sortKey, sortOrder]);

  // Paginated data
  const paginatedCylinders = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCylinders.slice(start, start + itemsPerPage);
  }, [filteredCylinders, currentPage]);

  const totalPages = Math.ceil(filteredCylinders.length / itemsPerPage);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFields.serialNo || !formFields.lastInspection) {
      alert('Nomor Seri dan Tanggal Inspeksi Terakhir wajib diisi.');
      return;
    }
    addCylinder(formFields);
    setIsCreateOpen(false);
    resetForm();
  };

  const handleEditClick = (cyl: typeof cylinders[0]) => {
    setSelectedCylinderId(cyl.id);
    setFormFields({
      serialNo: cyl.serialNo,
      oxygenType: cyl.oxygenType,
      size: cyl.size,
      status: cyl.status,
      lastInspection: cyl.lastInspection
    });
    setIsEditOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCylinderId) {
      updateCylinder(selectedCylinderId, formFields);
      setIsEditOpen(false);
      resetForm();
    }
  };

  const handleDeleteClick = (id: string) => {
    setSelectedCylinderId(id);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedCylinderId) {
      deleteCylinder(selectedCylinderId);
      setSelectedCylinderId(null);
    }
  };

  const resetForm = () => {
    setFormFields({
      serialNo: '',
      oxygenType: 'Medical Oxygen',
      size: '1m3',
      status: 'Available',
      lastInspection: new Date().toISOString().split('T')[0]
    });
    setSelectedCylinderId(null);
  };

  const toggleSort = (key: 'id' | 'serialNo' | 'size' | 'lastInspection') => {
    if (sortKey === key) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Inventaris Tabung Oksigen</h2>
          <p className="text-xs text-muted-foreground mt-1">Lacak posisi, status, kelayakan uji, dan ukuran tabung baja oksigen.</p>
        </div>
        <Button size="sm" className="flex items-center gap-1.5" onClick={() => { resetForm(); setIsCreateOpen(true); }}>
          <Plus className="w-4 h-4" /> Tambah Tabung
        </Button>
      </div>

      {/* Filter and Search Card */}
      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Cari tabung berdasarkan nomor seri (SN)..."
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="flex h-10 w-full rounded-lg border border-border bg-background pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:border-border/60"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <Select
              id="filterStatus"
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value as any); setCurrentPage(1); }}
              options={[
                { value: 'All', label: 'Semua Status' },
                { value: 'Available', label: 'Tersedia (Ready)' },
                { value: 'Rented', label: 'Disewa Pelanggan' },
                { value: 'At Vendor', label: 'Di Vendor Refill' },
                { value: 'Maintenance', label: 'Servis / Uji Tekan' }
              ]}
              className="w-full sm:w-44"
            />

            <Select
              id="filterSize"
              value={sizeFilter}
              onChange={e => { setSizeFilter(e.target.value as any); setCurrentPage(1); }}
              options={[
                { value: 'All', label: 'Semua Ukuran' },
                { value: '1m3', label: 'Kecil (1m³)' },
                { value: '2m3', label: 'Sedang (2m³)' },
                { value: '6m3', label: 'Besar (6m³)' }
              ]}
              className="w-full sm:w-36"
            />
          </div>
        </CardContent>
      </Card>

      {/* Cylinders Data Table */}
      <Card>
        <CardContent className="p-0">
          {paginatedCylinders.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-24 cursor-pointer" onClick={() => toggleSort('id')}>
                      ID Tabung {sortKey === 'id' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => toggleSort('serialNo')}>
                      No. Seri Tabung (SN) {sortKey === 'serialNo' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </TableHead>
                    <TableHead>Tipe Oksigen</TableHead>
                    <TableHead className="cursor-pointer text-center" onClick={() => toggleSort('size')}>
                      Ukuran {sortKey === 'size' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </TableHead>
                    <TableHead className="w-40 text-center">Status</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => toggleSort('lastInspection')}>
                      Inspeksi Terakhir {sortKey === 'lastInspection' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </TableHead>
                    <TableHead className="w-28 text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedCylinders.map(cyl => {
                    const statusColors = {
                      Available: 'success',
                      Rented: 'info',
                      'At Vendor': 'warning',
                      Maintenance: 'destructive'
                    };
                    const statusLabels = {
                      Available: 'Tersedia',
                      Rented: 'Disewa',
                      'At Vendor': 'Di Vendor Refill',
                      Maintenance: 'Maintenance'
                    };
                    return (
                      <TableRow key={cyl.id}>
                        <TableCell className="font-bold text-xs">{cyl.id}</TableCell>
                        <TableCell className="font-semibold text-foreground">{cyl.serialNo}</TableCell>
                        <TableCell className="text-xs">{cyl.oxygenType}</TableCell>
                        <TableCell className="text-center">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded border border-border bg-muted/40">
                            {cyl.size}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={statusColors[cyl.status] as any}>{statusLabels[cyl.status]}</Badge>
                        </TableCell>
                        <TableCell className="text-xs font-semibold text-muted-foreground">{cyl.lastInspection}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => handleEditClick(cyl)}
                              className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(cyl.id)}
                              className="p-1.5 rounded hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-colors cursor-pointer"
                              title="Hapus"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
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
                totalItems={filteredCylinders.length}
                itemsPerPage={itemsPerPage}
              />
            </>
          ) : (
            <div className="py-24 text-center flex flex-col items-center justify-center gap-3">
              <Database className="w-12 h-12 text-muted-foreground/45" />
              <h3 className="text-base font-bold text-foreground">Tidak Ada Tabung</h3>
              <p className="text-xs text-muted-foreground max-w-sm">
                Tidak ada tabung gas baja yang cocok dengan kriteria filter atau nomor seri yang Anda cari.
              </p>
              <Button size="sm" variant="outline" className="mt-2" onClick={() => { setSearchTerm(''); setStatusFilter('All'); setSizeFilter('All'); }}>
                Reset Filter
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 1. DRAWERS - CREATE CYLINDER */}
      <Drawer isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Tambah Tabung Baja Oksigen">
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <Input
            label="Nomor Seri Tabung (Serial Number / SN) *"
            id="cylSerial"
            placeholder="e.g. SN-OX-99218"
            value={formFields.serialNo}
            onChange={e => setFormFields({ ...formFields, serialNo: e.target.value })}
          />
          <Select
            label="Ukuran Tabung Baja *"
            id="cylSize"
            value={formFields.size}
            onChange={e => setFormFields({ ...formFields, size: e.target.value as any })}
            options={[
              { value: '1m3', label: '1 meter kubik (1m³)' },
              { value: '2m3', label: '2 meter kubik (2m³)' },
              { value: '6m3', label: '6 meter kubik (6m³)' }
            ]}
          />
          <Select
            label="Tipe Kandungan Gas *"
            id="cylOxyType"
            value={formFields.oxygenType}
            onChange={e => setFormFields({ ...formFields, oxygenType: e.target.value })}
            options={OXYGEN_TYPES.map(ot => ({ value: ot.name, label: `${ot.name} (${ot.purity})` }))}
          />
          <Select
            label="Status Awal Tabung"
            id="cylStatus"
            value={formFields.status}
            onChange={e => setFormFields({ ...formFields, status: e.target.value as any })}
            options={[
              { value: 'Available', label: 'Tersedia (Ready untuk disewa)' },
              { value: 'Maintenance', label: 'Uji Tekanan / Servis Valve' }
            ]}
          />
          <Input
            label="Tanggal Inspeksi / Hydrotest Terakhir *"
            id="cylInspection"
            type="date"
            value={formFields.lastInspection}
            onChange={e => setFormFields({ ...formFields, lastInspection: e.target.value })}
          />
          <div className="border-t border-border pt-4 flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setIsCreateOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" className="flex-1">
              Simpan Tabung
            </Button>
          </div>
        </form>
      </Drawer>

      {/* 2. DRAWERS - EDIT CYLINDER */}
      <Drawer isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title={`Edit Tabung ${selectedCylinderId}`}>
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <Input
            label="Nomor Seri Tabung (Serial Number / SN) *"
            id="editCylSerial"
            value={formFields.serialNo}
            onChange={e => setFormFields({ ...formFields, serialNo: e.target.value })}
          />
          <Select
            label="Ukuran Tabung Baja *"
            id="editCylSize"
            value={formFields.size}
            onChange={e => setFormFields({ ...formFields, size: e.target.value as any })}
            options={[
              { value: '1m3', label: '1 meter kubik (1m³)' },
              { value: '2m3', label: '2 meter kubik (2m³)' },
              { value: '6m3', label: '6 meter kubik (6m³)' }
            ]}
          />
          <Select
            label="Tipe Kandungan Gas *"
            id="editCylOxyType"
            value={formFields.oxygenType}
            onChange={e => setFormFields({ ...formFields, oxygenType: e.target.value })}
            options={OXYGEN_TYPES.map(ot => ({ value: ot.name, label: ot.name }))}
          />
          <Select
            label="Status Operasional Tabung"
            id="editCylStatus"
            value={formFields.status}
            onChange={e => setFormFields({ ...formFields, status: e.target.value as any })}
            options={[
              { value: 'Available', label: 'Tersedia (Ready)' },
              { value: 'Rented', label: 'Sedang Disewa (Rented)' },
              { value: 'At Vendor', label: 'Di Vendor Refill' },
              { value: 'Maintenance', label: 'Maintenance' }
            ]}
          />
          <Input
            label="Tanggal Inspeksi / Hydrotest Terakhir *"
            id="editCylInspection"
            type="date"
            value={formFields.lastInspection}
            onChange={e => setFormFields({ ...formFields, lastInspection: e.target.value })}
          />
          <div className="border-t border-border pt-4 flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setIsEditOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" className="flex-1">
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </Drawer>

      {/* 3. MODAL - CONFIRM DELETE */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Hapus Tabung Gas"
        description="Apakah Anda yakin ingin menghapus tabung gas baja ini dari catatan sistem? Tindakan ini tidak dapat dibatalkan. Seluruh riwayat transaksi sewa masa lalu tetap disimpan, tetapi tabung ini tidak akan terdeteksi di modul gudang lagi."
        confirmText="Hapus Tabung"
        variant="destructive"
      />

    </div>
  );
}
