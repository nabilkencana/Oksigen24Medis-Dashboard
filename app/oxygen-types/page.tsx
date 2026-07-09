'use client';

import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Input, Textarea } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Drawer } from '../../components/ui/Drawer';
import { Modal } from '../../components/ui/Modal';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Plus, Search, Edit2, Trash2, Wind, ShieldCheck } from 'lucide-react';
import { OXYGEN_TYPES } from '../../context/mockData';

export default function OxygenTypesPage() {
  const { cylinders } = useData();

  // Local state for Oxygen Types since it's small, but we will make it interactive!
  const [oxyTypes, setOxyTypes] = useState(OXYGEN_TYPES);
  const [searchTerm, setSearchTerm] = useState('');

  // Drawer & Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null);

  // Form State
  const [formFields, setFormFields] = useState({ name: '', purity: '', description: '' });

  // Get cylinder count for each type
  const getCylinderCount = (typeName: string) => {
    return cylinders.filter(c => c.oxygenType === typeName).length;
  };

  // Filtered oxygen types
  const filteredTypes = useMemo(() => {
    if (!searchTerm) return oxyTypes;
    const query = searchTerm.toLowerCase();
    return oxyTypes.filter(ot =>
      ot.name.toLowerCase().includes(query) ||
      ot.purity.toLowerCase().includes(query) ||
      ot.description.toLowerCase().includes(query)
    );
  }, [oxyTypes, searchTerm]);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFields.name || !formFields.purity) {
      alert('Nama tipe dan tingkat kemurnian gas wajib diisi.');
      return;
    }
    const newType = {
      id: `OT-${String(oxyTypes.length + 1).padStart(2, '0')}`,
      name: formFields.name,
      purity: formFields.purity,
      description: formFields.description
    };
    setOxyTypes([...oxyTypes, newType]);
    setIsCreateOpen(false);
    resetForm();
  };

  const handleEditClick = (type: typeof oxyTypes[0]) => {
    setSelectedTypeId(type.id);
    setFormFields({
      name: type.name,
      purity: type.purity,
      description: type.description
    });
    setIsEditOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTypeId) {
      setOxyTypes(prev => prev.map(t => t.id === selectedTypeId ? { ...t, ...formFields } : t));
      setIsEditOpen(false);
      resetForm();
    }
  };

  const handleDeleteClick = (id: string) => {
    setSelectedTypeId(id);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedTypeId) {
      setOxyTypes(prev => prev.filter(t => t.id !== selectedTypeId));
      setSelectedTypeId(null);
    }
  };

  const resetForm = () => {
    setFormFields({ name: '', purity: '', description: '' });
    setSelectedTypeId(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Tipe & Kemurnian Oksigen</h2>
          <p className="text-xs text-muted-foreground mt-1">Definisikan grade gas (Medis, Industri, High-Purity) dan spesifikasi sertifikasinya.</p>
        </div>
        <Button size="sm" className="flex items-center gap-1.5" onClick={() => { resetForm(); setIsCreateOpen(true); }}>
          <Plus className="w-4 h-4" /> Tambah Grade Gas
        </Button>
      </div>

      {/* Search Filter Card */}
      <Card>
        <CardContent className="p-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Cari grade gas atau kandungan..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="flex h-10 w-full rounded-lg border border-border bg-background pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:border-border/60"
            />
          </div>
        </CardContent>
      </Card>

      {/* Grid of Gas Grades */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredTypes.map(type => {
          const cylinderCount = getCylinderCount(type.name);
          return (
            <Card key={type.id} className="relative flex flex-col justify-between">
              <CardHeader className="pb-3 border-b border-border/40">
                <div className="flex justify-between items-start">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                    <Wind className="w-5 h-5 animate-pulse" />
                  </div>
                  <Badge variant="success" className="flex gap-1 items-center">
                    <ShieldCheck className="w-3.5 h-3.5" /> Purity {type.purity}
                  </Badge>
                </div>
                <CardTitle className="mt-4">{type.name}</CardTitle>
                <CardDescription className="text-3xs uppercase font-bold tracking-widest text-muted-foreground mt-1">ID: {type.id}</CardDescription>
              </CardHeader>
              <CardContent className="py-4 flex-1">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {type.description}
                </p>
                <div className="mt-6 flex justify-between items-center bg-muted/30 px-3.5 py-2.5 rounded-lg border border-border">
                  <span className="text-xs text-muted-foreground font-medium">Jumlah Tabung</span>
                  <span className="text-sm font-bold text-foreground">{cylinderCount} Unit</span>
                </div>
              </CardContent>
              <div className="p-4 border-t border-border/40 flex justify-end gap-1.5 bg-muted/10">
                <button
                  onClick={() => handleEditClick(type)}
                  className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer border border-border"
                  title="Edit"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteClick(type.id)}
                  className="p-1.5 rounded hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-colors cursor-pointer border border-border"
                  title="Hapus"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* 1. DRAWERS - CREATE OXYGEN TYPE */}
      <Drawer isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Tambah Tipe Gas Baru">
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <Input
            label="Nama Grade / Tipe Gas *"
            id="oxyName"
            placeholder="e.g. Ultra-Pure Oxygen"
            value={formFields.name}
            onChange={e => setFormFields({ ...formFields, name: e.target.value })}
          />
          <Input
            label="Tingkat Kemurnian (Purity %) *"
            id="oxyPurity"
            placeholder="e.g. 99.999%"
            value={formFields.purity}
            onChange={e => setFormFields({ ...formFields, purity: e.target.value })}
          />
          <Textarea
            label="Keterangan / Penggunaan / Syarat Sertifikasi"
            id="oxyDesc"
            placeholder="e.g. Digunakan untuk riset laboratorium tingkat tinggi, tidak boleh terkontaminasi gas luar..."
            value={formFields.description}
            onChange={e => setFormFields({ ...formFields, description: e.target.value })}
          />
          <div className="border-t border-border pt-4 flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setIsCreateOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" className="flex-1">
              Simpan Grade Gas
            </Button>
          </div>
        </form>
      </Drawer>

      {/* 2. DRAWERS - EDIT OXYGEN TYPE */}
      <Drawer isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title={`Edit Grade Gas ${selectedTypeId}`}>
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <Input
            label="Nama Grade / Tipe Gas *"
            id="editOxyName"
            value={formFields.name}
            onChange={e => setFormFields({ ...formFields, name: e.target.value })}
          />
          <Input
            label="Tingkat Kemurnian (Purity %) *"
            id="editOxyPurity"
            value={formFields.purity}
            onChange={e => setFormFields({ ...formFields, purity: e.target.value })}
          />
          <Textarea
            label="Keterangan / Penggunaan"
            id="editOxyDesc"
            value={formFields.description}
            onChange={e => setFormFields({ ...formFields, description: e.target.value })}
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
        title="Hapus Grade Gas"
        description="Apakah Anda yakin ingin menghapus data spesifikasi grade gas oksigen ini? Harap pastikan tidak ada tabung baja aktif di gudang yang terhubung dengan grade gas ini sebelum menghapusnya."
        confirmText="Hapus Grade"
        variant="destructive"
      />

    </div>
  );
}
