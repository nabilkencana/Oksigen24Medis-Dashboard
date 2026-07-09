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
import { Plus, Search, Edit2, Trash2, Package, Filter, X, ArrowUpRight } from 'lucide-react';
import { formatRupiah } from '../../context/mockData';

export default function ProductsPage() {
  const { products, addProduct, updateProduct, deleteProduct } = useData();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'All' | 'Gas' | 'Equipment' | 'Accessory'>('All');
  const [sortKey, setSortKey] = useState<'id' | 'name' | 'stock' | 'price'>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Drawer & Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  // Form State
  const [formFields, setFormFields] = useState({ name: '', category: 'Accessory' as 'Gas' | 'Equipment' | 'Accessory', stock: 0, price: 0, cost: 0, description: '' });

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

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.id.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
      );
    }

    if (categoryFilter !== 'All') {
      result = result.filter(p => p.category === categoryFilter);
    }

    result.sort((a, b) => {
      let valA = a[sortKey];
      let valB = b[sortKey];

      if (sortKey === 'name') {
        valA = (valA as string).toLowerCase();
        valB = (valB as string).toLowerCase();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [products, searchTerm, categoryFilter, sortKey, sortOrder]);

  // Paginated data
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFields.name || formFields.price <= 0 || formFields.cost <= 0) {
      alert('Nama produk, harga jual, dan harga modal wajib diisi.');
      return;
    }
    addProduct(formFields);
    setIsCreateOpen(false);
    resetForm();
  };

  const handleEditClick = (prod: typeof products[0]) => {
    setSelectedProductId(prod.id);
    setFormFields({
      name: prod.name,
      category: prod.category,
      stock: prod.stock,
      price: prod.price,
      cost: prod.cost,
      description: prod.description
    });
    setIsEditOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedProductId) {
      updateProduct(selectedProductId, formFields);
      setIsEditOpen(false);
      resetForm();
    }
  };

  const handleDeleteClick = (id: string) => {
    setSelectedProductId(id);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedProductId) {
      deleteProduct(selectedProductId);
      setSelectedProductId(null);
    }
  };

  const resetForm = () => {
    setFormFields({ name: '', category: 'Accessory', stock: 0, price: 0, cost: 0, description: '' });
    setSelectedProductId(null);
  };

  const toggleSort = (key: 'id' | 'name' | 'stock' | 'price') => {
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
          <h2 className="text-xl font-bold text-foreground">Master Produk & Gas</h2>
          <p className="text-xs text-muted-foreground mt-1">Kelola data komoditas retail seperti regulator, troli, masker, maupun isi gas.</p>
        </div>
        <Button size="sm" className="flex items-center gap-1.5" onClick={() => { resetForm(); setIsCreateOpen(true); }}>
          <Plus className="w-4 h-4" /> Tambah Produk
        </Button>
      </div>

      {/* Filter and Search Card */}
      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Cari produk berdasarkan nama, ID..."
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
              id="filterCategory"
              value={categoryFilter}
              onChange={e => { setCategoryFilter(e.target.value as any); setCurrentPage(1); }}
              options={[
                { value: 'All', label: 'Semua Kategori' },
                { value: 'Gas', label: 'Gas Oksigen' },
                { value: 'Equipment', label: 'Alat Medis (Equipment)' },
                { value: 'Accessory', label: 'Aksesoris / Consumables' }
              ]}
              className="w-full sm:w-44"
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
                { value: 'name-asc', label: 'Nama (A-Z)' },
                { value: 'name-desc', label: 'Nama (Z-A)' },
                { value: 'stock-asc', label: 'Stok Terendah' },
                { value: 'stock-desc', label: 'Stok Tertinggi' },
                { value: 'price-asc', label: 'Harga Termurah' },
                { value: 'price-desc', label: 'Harga Termahal' }
              ]}
              className="w-full sm:w-44"
            />
          </div>
        </CardContent>
      </Card>

      {/* Products Data Table */}
      <Card>
        <CardContent className="p-0">
          {paginatedProducts.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-24 cursor-pointer" onClick={() => toggleSort('id')}>
                      ID Produk {sortKey === 'id' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => toggleSort('name')}>
                      Nama Produk {sortKey === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead className="cursor-pointer text-center" onClick={() => toggleSort('stock')}>
                      Stok Gudang {sortKey === 'stock' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </TableHead>
                    <TableHead>Harga Modal (Cost)</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => toggleSort('price')}>
                      Harga Jual (Price) {sortKey === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </TableHead>
                    <TableHead className="w-28 text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedProducts.map(prod => (
                    <TableRow key={prod.id}>
                      <TableCell className="font-bold text-xs">{prod.id}</TableCell>
                      <TableCell className="font-semibold text-foreground">
                        <div>{prod.name}</div>
                        <div className="text-muted-foreground text-3xs font-medium max-w-[280px] truncate" title={prod.description}>
                          {prod.description}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={prod.category === 'Gas' ? 'success' : prod.category === 'Equipment' ? 'info' : 'secondary'}>
                          {prod.category === 'Gas' ? 'Gas' : prod.category === 'Equipment' ? 'Alat Medis' : 'Aksesoris'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center font-bold">
                        <span className={prod.stock < 10 ? 'text-rose-500 bg-rose-500/10 px-2.5 py-0.5 rounded-full text-xs font-bold' : 'text-foreground'}>
                          {prod.stock}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{formatRupiah(prod.cost)}</TableCell>
                      <TableCell className="font-bold text-xs text-emerald-600 dark:text-emerald-400">{formatRupiah(prod.price)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => handleEditClick(prod)}
                            className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(prod.id)}
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
                totalItems={filteredProducts.length}
                itemsPerPage={itemsPerPage}
              />
            </>
          ) : (
            <div className="py-24 text-center flex flex-col items-center justify-center gap-3">
              <Package className="w-12 h-12 text-muted-foreground/45" />
              <h3 className="text-base font-bold text-foreground">Tidak Ada Produk</h3>
              <p className="text-xs text-muted-foreground max-w-sm">
                Tidak ada data produk retail yang cocok dengan filter atau kata kunci pencarian Anda.
              </p>
              <Button size="sm" variant="outline" className="mt-2" onClick={() => { setSearchTerm(''); setCategoryFilter('All'); }}>
                Reset Filter
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 1. DRAWERS - CREATE PRODUCT */}
      <Drawer isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Tambah Produk Baru">
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <Input
            label="Nama Lengkap Produk *"
            id="prodName"
            placeholder="e.g. Regulator Oksigen Medical"
            value={formFields.name}
            onChange={e => setFormFields({ ...formFields, name: e.target.value })}
          />
          <Select
            label="Kategori Produk *"
            id="prodCategory"
            value={formFields.category}
            onChange={e => setFormFields({ ...formFields, category: e.target.value as any })}
            options={[
              { value: 'Gas', label: 'Gas Oksigen' },
              { value: 'Equipment', label: 'Alat Medis (Equipment)' },
              { value: 'Accessory', label: 'Aksesoris / Consumables' }
            ]}
          />
          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Stok Awal"
              id="prodStock"
              type="number"
              value={formFields.stock}
              onChange={e => setFormFields({ ...formFields, stock: Number(e.target.value) })}
            />
            <Input
              label="Harga Modal (Rp) *"
              id="prodCost"
              type="number"
              placeholder="e.g. 180000"
              value={formFields.cost || ''}
              onChange={e => setFormFields({ ...formFields, cost: Number(e.target.value) })}
            />
            <Input
              label="Harga Jual (Rp) *"
              id="prodPrice"
              type="number"
              placeholder="e.g. 250000"
              value={formFields.price || ''}
              onChange={e => setFormFields({ ...formFields, price: Number(e.target.value) })}
            />
          </div>
          <Textarea
            label="Deskripsi Singkat Produk"
            id="prodDesc"
            placeholder="Tulis kegunaan, dimensi, merk, atau spesifikasi detail produk..."
            value={formFields.description}
            onChange={e => setFormFields({ ...formFields, description: e.target.value })}
          />
          <div className="border-t border-border pt-4 flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setIsCreateOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" className="flex-1">
              Simpan Produk
            </Button>
          </div>
        </form>
      </Drawer>

      {/* 2. DRAWERS - EDIT PRODUCT */}
      <Drawer isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title={`Edit Produk ${selectedProductId}`}>
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <Input
            label="Nama Lengkap Produk *"
            id="editProdName"
            value={formFields.name}
            onChange={e => setFormFields({ ...formFields, name: e.target.value })}
          />
          <Select
            label="Kategori Produk *"
            id="editProdCategory"
            value={formFields.category}
            onChange={e => setFormFields({ ...formFields, category: e.target.value as any })}
            options={[
              { value: 'Gas', label: 'Gas Oksigen' },
              { value: 'Equipment', label: 'Alat Medis (Equipment)' },
              { value: 'Accessory', label: 'Aksesoris / Consumables' }
            ]}
          />
          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Stok Gudang"
              id="editProdStock"
              type="number"
              value={formFields.stock}
              onChange={e => setFormFields({ ...formFields, stock: Number(e.target.value) })}
            />
            <Input
              label="Harga Modal (Rp) *"
              id="editProdCost"
              type="number"
              value={formFields.cost}
              onChange={e => setFormFields({ ...formFields, cost: Number(e.target.value) })}
            />
            <Input
              label="Harga Jual (Rp) *"
              id="editProdPrice"
              type="number"
              value={formFields.price}
              onChange={e => setFormFields({ ...formFields, price: Number(e.target.value) })}
            />
          </div>
          <Textarea
            label="Deskripsi Singkat Produk"
            id="editProdDesc"
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
        title="Hapus Produk"
        description="Apakah Anda yakin ingin menghapus produk retail ini dari katalog? Transaksi retail lama yang mengaitkan produk ini akan tetap diarsipkan, tetapi produk tidak akan tersedia lagi untuk kasir penjualan atau restock supplier."
        confirmText="Hapus Katalog"
        variant="destructive"
      />

    </div>
  );
}
