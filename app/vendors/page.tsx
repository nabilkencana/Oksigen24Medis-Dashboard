'use client';

import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Drawer } from '../../components/ui/Drawer';
import { Modal } from '../../components/ui/Modal';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Pagination } from '../../components/ui/Table';
import { Plus, Search, Edit2, Trash2, Building, Filter, X } from 'lucide-react';

export default function VendorsPage() {
  const { vendors, addVendor, updateVendor, deleteVendor } = useData();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [sortKey, setSortKey] = useState<'id' | 'companyName' | 'name'>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Drawer & Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);

  // Form State
  const [formFields, setFormFields] = useState({ companyName: '', name: '', phone: '', email: '', address: '', status: 'Active' as 'Active' | 'Inactive' });

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

  // Filtered & Sorted Vendors
  const filteredVendors = useMemo(() => {
    let result = [...vendors];

    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      result = result.filter(v =>
        v.companyName.toLowerCase().includes(query) ||
        v.name.toLowerCase().includes(query) ||
        v.id.toLowerCase().includes(query) ||
        v.phone.toLowerCase().includes(query) ||
        v.email.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== 'All') {
      result = result.filter(v => v.status === statusFilter);
    }

    result.sort((a, b) => {
      let valA = a[sortKey];
      let valB = b[sortKey];

      if (sortKey === 'companyName' || sortKey === 'name') {
        valA = (valA as string).toLowerCase();
        valB = (valB as string).toLowerCase();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [vendors, searchTerm, statusFilter, sortKey, sortOrder]);

  // Paginated data
  const paginatedVendors = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredVendors.slice(start, start + itemsPerPage);
  }, [filteredVendors, currentPage]);

  const totalPages = Math.ceil(filteredVendors.length / itemsPerPage);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFields.companyName || !formFields.name || !formFields.phone) {
      alert('Nama Perusahaan, PIC, dan No Telepon wajib diisi.');
      return;
    }
    addVendor(formFields);
    setIsCreateOpen(false);
    resetForm();
  };

  const handleEditClick = (vend: typeof vendors[0]) => {
    setSelectedVendorId(vend.id);
    setFormFields({
      companyName: vend.companyName,
      name: vend.name,
      phone: vend.phone,
      email: vend.email,
      address: vend.address,
      status: vend.status
    });
    setIsEditOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedVendorId) {
      updateVendor(selectedVendorId, formFields);
      setIsEditOpen(false);
      resetForm();
    }
  };

  const handleDeleteClick = (id: string) => {
    setSelectedVendorId(id);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedVendorId) {
      deleteVendor(selectedVendorId);
      setSelectedVendorId(null);
    }
  };

  const resetForm = () => {
    setFormFields({ companyName: '', name: '', phone: '', email: '', address: '', status: 'Active' });
    setSelectedVendorId(null);
  };

  const toggleSort = (key: 'id' | 'companyName' | 'name') => {
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
          <h2 className="text-xl font-bold text-foreground">Manajemen Vendor</h2>
          <p className="text-xs text-muted-foreground mt-1">Kelola data mitra penyuplai oksigen, tabung, dan jasa isi ulang.</p>
        </div>
        <Button size="sm" className="flex items-center gap-1.5" onClick={() => { resetForm(); setIsCreateOpen(true); }}>
          <Building className="w-4 h-4" /> Tambah Vendor
        </Button>
      </div>

      {/* Filter and Search Card */}
      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Cari vendor berdasarkan Perusahaan, PIC, ID..."
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
                { value: 'Active', label: 'Aktif' },
                { value: 'Inactive', label: 'Non-Aktif' }
              ]}
              className="w-full sm:w-40"
            />

            <Select
              id="sortBy"
              value={`${sortKey}-${sortOrder}`}
              onChange={e => {
                const [key, order] = e.target.value.split('-');
                setSortKey(key as any);
                setSortOrder(order as any);
              }}
              options={[
                { value: 'id-asc', label: 'ID (Terkecil)' },
                { value: 'id-desc', label: 'ID (Terbesar)' },
                { value: 'companyName-asc', label: 'Perusahaan (A-Z)' },
                { value: 'companyName-desc', label: 'Perusahaan (Z-A)' },
                { value: 'name-asc', label: 'PIC (A-Z)' }
              ]}
              className="w-full sm:w-44"
            />
          </div>
        </CardContent>
      </Card>

      {/* Vendors Data Table */}
      <Card>
        <CardContent className="p-0">
          {paginatedVendors.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-24 cursor-pointer" onClick={() => toggleSort('id')}>
                      ID Vendor {sortKey === 'id' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => toggleSort('companyName')}>
                      Nama Perusahaan {sortKey === 'companyName' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => toggleSort('name')}>
                      Penanggung Jawab (PIC) {sortKey === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </TableHead>
                    <TableHead>Kontak & Email</TableHead>
                    <TableHead>Alamat Pabrik / Gudang</TableHead>
                    <TableHead className="w-24">Status</TableHead>
                    <TableHead className="w-28 text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedVendors.map(vend => (
                    <TableRow key={vend.id}>
                      <TableCell className="font-bold text-xs">{vend.id}</TableCell>
                      <TableCell className="font-semibold text-foreground">{vend.companyName}</TableCell>
                      <TableCell className="text-sm">{vend.name}</TableCell>
                      <TableCell className="text-xs">
                        <div>{vend.phone}</div>
                        <div className="text-muted-foreground text-3xs">{vend.email}</div>
                      </TableCell>
                      <TableCell className="text-xs max-w-xs truncate" title={vend.address}>
                        {vend.address}
                      </TableCell>
                      <TableCell>
                        <Badge variant={vend.status === 'Active' ? 'success' : 'destructive'}>
                          {vend.status === 'Active' ? 'Aktif' : 'Non-Aktif'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => handleEditClick(vend)}
                            className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(vend.id)}
                            className="p-1.5 rounded hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-colors cursor-pointer"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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
                totalItems={filteredVendors.length}
                itemsPerPage={itemsPerPage}
              />
            </>
          ) : (
            <div className="py-24 text-center flex flex-col items-center justify-center gap-3">
              <Search className="w-12 h-12 text-muted-foreground/45" />
              <h3 className="text-base font-bold text-foreground">Tidak Ada Vendor</h3>
              <p className="text-xs text-muted-foreground max-w-sm">
                Tidak ada data mitra vendor yang cocok dengan filter atau kata kunci pencarian Anda.
              </p>
              <Button size="sm" variant="outline" className="mt-2" onClick={() => { setSearchTerm(''); setStatusFilter('All'); }}>
                Reset Filter
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 1. DRAWERS - CREATE VENDOR */}
      <Drawer isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Tambah Vendor Baru">
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <Input
            label="Nama Perusahaan Vendor *"
            id="vendCompany"
            placeholder="e.g. PT Samator Gas Industri"
            value={formFields.companyName}
            onChange={e => setFormFields({ ...formFields, companyName: e.target.value })}
          />
          <Input
            label="Nama PIC / Sales Rep *"
            id="vendName"
            placeholder="e.g. Hendra Wijaya"
            value={formFields.name}
            onChange={e => setFormFields({ ...formFields, name: e.target.value })}
          />
          <Input
            label="Nomor Telepon Kantor/HP *"
            id="vendPhone"
            placeholder="e.g. 0812-9900-8811"
            value={formFields.phone}
            onChange={e => setFormFields({ ...formFields, phone: e.target.value })}
          />
          <Input
            label="Alamat Email Perusahaan"
            id="vendEmail"
            type="email"
            placeholder="e.g. marketing@samator.co.id"
            value={formFields.email}
            onChange={e => setFormFields({ ...formFields, email: e.target.value })}
          />
          <Textarea
            label="Alamat Pabrik / Gudang Vendor"
            id="vendAddress"
            placeholder="Tulis alamat pabrik pengisian ulang tabung oksigen..."
            value={formFields.address}
            onChange={e => setFormFields({ ...formFields, address: e.target.value })}
          />
          <Select
            label="Status Kemitraan"
            id="vendStatus"
            value={formFields.status}
            onChange={e => setFormFields({ ...formFields, status: e.target.value as any })}
            options={[
              { value: 'Active', label: 'Aktif (Kemitraan Jalan)' },
              { value: 'Inactive', label: 'Non-Aktif (Ditangguhkan)' }
            ]}
          />
          <div className="border-t border-border pt-4 flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setIsCreateOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" className="flex-1">
              Simpan Vendor
            </Button>
          </div>
        </form>
      </Drawer>

      {/* 2. DRAWERS - EDIT VENDOR */}
      <Drawer isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title={`Edit Vendor ${selectedVendorId}`}>
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <Input
            label="Nama Perusahaan Vendor *"
            id="editVendCompany"
            value={formFields.companyName}
            onChange={e => setFormFields({ ...formFields, companyName: e.target.value })}
          />
          <Input
            label="Nama PIC / Sales Rep *"
            id="editVendName"
            value={formFields.name}
            onChange={e => setFormFields({ ...formFields, name: e.target.value })}
          />
          <Input
            label="Nomor Telepon Kantor/HP *"
            id="editVendPhone"
            value={formFields.phone}
            onChange={e => setFormFields({ ...formFields, phone: e.target.value })}
          />
          <Input
            label="Alamat Email Perusahaan"
            id="editVendEmail"
            type="email"
            value={formFields.email}
            onChange={e => setFormFields({ ...formFields, email: e.target.value })}
          />
          <Textarea
            label="Alamat Pabrik / Gudang Vendor"
            id="editVendAddress"
            value={formFields.address}
            onChange={e => setFormFields({ ...formFields, address: e.target.value })}
          />
          <Select
            label="Status Kemitraan"
            id="editVendStatus"
            value={formFields.status}
            onChange={e => setFormFields({ ...formFields, status: e.target.value as any })}
            options={[
              { value: 'Active', label: 'Aktif' },
              { value: 'Inactive', label: 'Non-Aktif' }
            ]}
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
        title="Hapus Data Vendor"
        description="Apakah Anda yakin ingin menghapus data kemitraan vendor ini? Penghapusan data vendor tidak mempengaruhi log pembelian atau riwayat isi ulang tabung terdahulu, namun vendor tidak akan dapat dipilih kembali pada transaksi berikutnya."
        confirmText="Hapus Vendor"
        variant="destructive"
      />

    </div>
  );
}
