'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useData } from '../../context/DataContext';
import { formatRupiah, Cylinder, Product, Customer, Vendor } from '../../context/mockData';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Drawer } from '../../components/ui/Drawer';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Pagination } from '../../components/ui/Table';
import { Plus, Search, Edit2, Trash2, ShieldAlert, CheckCircle2, User, Building, Database, ShoppingBag } from 'lucide-react';

const isAccessoryAsset = (serial: string, size?: string) => {
  const s = (serial || '').toUpperCase();
  const sz = (size || '').toUpperCase();
  return s.startsWith('REG-') || s.startsWith('TRL-') || s.startsWith('ACC-') || sz === 'PCS';
};

type TabType = 'cylinders' | 'accessories' | 'products' | 'customers' | 'vendors';

export default function InventoryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as TabType) || 'cylinders';
  const urlSearch = searchParams.get('search') || '';

  const {
    customers,
    vendors,
    cylinders,
    products,
    oxygenTypes,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    addVendor,
    updateVendor,
    deleteVendor,
    addCylinder,
    updateCylinder,
    deleteCylinder,
    addProduct,
    updateProduct,
    deleteProduct
  } = useData();

  // Tab State
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
    if (urlSearch) {
      setSearchTerm(urlSearch);
    }
  }, [initialTab, urlSearch]);

  const changeTab = (tab: TabType) => {
    setActiveTab(tab);
    setSearchTerm('');
    setStatusFilter('All');
    setCurrentPage(1);
    router.replace(`/inventory?tab=${tab}`);
  };

  // Search & Filters state
  const [searchTerm, setSearchTerm] = useState(urlSearch);
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Drawer states
  const [isCylinderDrawerOpen, setIsCylinderDrawerOpen] = useState(false);
  const [isProductDrawerOpen, setIsProductDrawerOpen] = useState(false);
  const [isCustomerDrawerOpen, setIsCustomerDrawerOpen] = useState(false);
  const [isVendorDrawerOpen, setIsVendorDrawerOpen] = useState(false);

  // Edit target states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form states
  // Form states
  const [cylinderForm, setCylinderForm] = useState<{
    serialNo: string;
    size: '1m3' | '2m3' | '6m3' | 'Pcs';
    oxygenType: string;
    lastInspection: string;
    status: 'Available' | 'Rented' | 'At Vendor' | 'Maintenance' | 'Empty';
  }>({
    serialNo: '',
    size: '1m3',
    oxygenType: 'Medical Oxygen 99.5%',
    lastInspection: '',
    status: 'Available'
  });
  const [productForm, setProductForm] = useState<{
    name: string;
    category: 'Gas' | 'Peralatan' | 'Aksesoris';
    stock: string;
    cost: string;
    price: string;
    description: string;
  }>({
    name: '',
    category: 'Aksesoris',
    stock: '50',
    cost: '15000',
    price: '25000',
    description: ''
  });
  const [customerForm, setCustomerForm] = useState<{
    name: string;
    phone: string;
    address: string;
    status: 'Active' | 'Inactive';
  }>({
    name: '',
    phone: '',
    address: '',
    status: 'Active'
  });
  const [vendorForm, setVendorForm] = useState<{
    companyName: string;
    name: string;
    phone: string;
    email: string;
    address: string;
    status: 'Active' | 'Inactive';
  }>({
    companyName: '',
    name: '',
    phone: '',
    email: '',
    address: '',
    status: 'Active'
  });

  // Auto-fill test dates
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setCylinderForm(prev => ({ ...prev, lastInspection: today }));
  }, []);

  // Reset form helper
  const resetForms = () => {
    setEditingId(null);
    const today = new Date().toISOString().split('T')[0];
    setCylinderForm({
      serialNo: '',
      size: activeTab === 'accessories' ? 'Pcs' : '1m3',
      oxygenType: activeTab === 'accessories' ? 'Sewa Regulator Medis' : 'Medical Oxygen 99.5%',
      lastInspection: today,
      status: 'Available'
    });
    setProductForm({ name: '', category: 'Aksesoris', stock: '50', cost: '15000', price: '25000', description: '' });
    setCustomerForm({ name: '', phone: '', address: '', status: 'Active' });
    setVendorForm({ companyName: '', name: '', phone: '', email: '', address: '', status: 'Active' });
  };

  // -------------------------------------------------------------
  // DATA FILTERING & SEARCHING
  // -------------------------------------------------------------
  const filteredData = useMemo(() => {
    const query = searchTerm.toLowerCase();

    if (activeTab === 'cylinders') {
      return cylinders.filter(c => {
        if (isAccessoryAsset(c.serialNo, c.size)) return false;
        const matchesSearch = c.serialNo.toLowerCase().includes(query) || c.id.toLowerCase().includes(query);
        const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
        return matchesSearch && matchesStatus;
      });
    }

    if (activeTab === 'accessories') {
      return cylinders.filter(c => {
        if (!isAccessoryAsset(c.serialNo, c.size)) return false;
        const matchesSearch = c.serialNo.toLowerCase().includes(query) || c.id.toLowerCase().includes(query);
        const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
        return matchesSearch && matchesStatus;
      });
    }

    if (activeTab === 'products') {
      return products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(query) || p.id.toLowerCase().includes(query) || p.category.toLowerCase().includes(query);
        return matchesSearch;
      });
    }

    if (activeTab === 'customers') {
      return customers.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(query) || c.phone.includes(query) || c.id.toLowerCase().includes(query);
        const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
        return matchesSearch && matchesStatus;
      });
    }

    if (activeTab === 'vendors') {
      return vendors.filter(v => {
        const matchesSearch = v.companyName.toLowerCase().includes(query) || v.name.toLowerCase().includes(query) || v.id.toLowerCase().includes(query);
        const matchesStatus = statusFilter === 'All' || v.status === statusFilter;
        return matchesSearch && matchesStatus;
      });
    }

    return [];
  }, [activeTab, cylinders, products, customers, vendors, searchTerm, statusFilter]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // -------------------------------------------------------------
  // FORM SUBMISSION HANDLERS
  // -------------------------------------------------------------
  const handleCylinderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cylinderForm.serialNo) return;

    setIsSaving(true);
    try {
      if (editingId) {
        await updateCylinder(editingId, cylinderForm);
      } else {
        await addCylinder(cylinderForm);
      }
      setIsCylinderDrawerOpen(false);
      resetForms();
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan data tabung.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name) return;

    const formatted = {
      name: productForm.name,
      category: productForm.category,
      stock: Number(productForm.stock) || 0,
      cost: Number(productForm.cost) || 0,
      price: Number(productForm.price) || 0,
      description: productForm.description
    };

    setIsSaving(true);
    try {
      if (editingId) {
        await updateProduct(editingId, formatted);
      } else {
        await addProduct(formatted);
      }
      setIsProductDrawerOpen(false);
      resetForms();
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan data produk.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerForm.name || !customerForm.phone) return;

    setIsSaving(true);
    try {
      if (editingId) {
        await updateCustomer(editingId, customerForm);
      } else {
        await addCustomer(customerForm);
      }
      setIsCustomerDrawerOpen(false);
      resetForms();
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan data pelanggan.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleVendorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorForm.companyName || !vendorForm.name) return;

    setIsSaving(true);
    try {
      if (editingId) {
        await updateVendor(editingId, vendorForm);
      } else {
        await addVendor(vendorForm);
      }
      setIsVendorDrawerOpen(false);
      resetForms();
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan data vendor.');
    } finally {
      setIsSaving(false);
    }
  };

  // -------------------------------------------------------------
  // EDIT HANDLERS (LOAD DATA INTO FORMS)
  // -------------------------------------------------------------
  const loadEditCylinder = (c: Cylinder) => {
    setEditingId(c.id);
    setCylinderForm({
      serialNo: c.serialNo,
      size: c.size,
      oxygenType: c.oxygenType,
      lastInspection: c.lastInspection,
      status: c.status
    });
    setIsCylinderDrawerOpen(true);
  };

  const loadEditProduct = (p: Product) => {
    setEditingId(p.id);
    setProductForm({
      name: p.name,
      category: p.category,
      stock: String(p.stock),
      cost: String(p.cost),
      price: String(p.price),
      description: p.description
    });
    setIsProductDrawerOpen(true);
  };

  const loadEditCustomer = (c: Customer) => {
    setEditingId(c.id);
    setCustomerForm({
      name: c.name,
      phone: c.phone,
      address: c.address,
      status: c.status
    });
    setIsCustomerDrawerOpen(true);
  };

  const loadEditVendor = (v: Vendor) => {
    setEditingId(v.id);
    setVendorForm({
      companyName: v.companyName,
      name: v.name,
      phone: v.phone,
      email: v.email,
      address: v.address,
      status: v.status
    });
    setIsVendorDrawerOpen(true);
  };

  return (
    <div className="space-y-6">
      
      {/* Title & Tabs selection */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Inventaris & Database</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Kelola tabung oksigen, katalog produk retail, data pelanggan, dan profil vendor.</p>
        </div>

        {/* Tab Buttons Wrapper with right-fade scroll indicator on mobile */}
        <div className="relative w-full overflow-hidden sm:overflow-visible shrink-0 lg:w-auto">
          <div className="flex gap-1 bg-muted/40 p-1 border border-border rounded-xl text-xs font-semibold overflow-x-auto max-w-full scrollbar-none pr-8 sm:pr-1 shrink-0">
            <button
              onClick={() => changeTab('cylinders')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0 whitespace-nowrap ${activeTab === 'cylinders' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Tabung Oksigen
            </button>
            <button
              onClick={() => changeTab('accessories')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0 whitespace-nowrap ${activeTab === 'accessories' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Aset Aksesoris
            </button>
            <button
              onClick={() => changeTab('products')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0 whitespace-nowrap ${activeTab === 'products' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Katalog Produk
            </button>
            <button
              onClick={() => changeTab('customers')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0 whitespace-nowrap ${activeTab === 'customers' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Pelanggan
            </button>
            <button
              onClick={() => changeTab('vendors')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0 whitespace-nowrap ${activeTab === 'vendors' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Mitra Vendor
            </button>
          </div>
          {/* Scroll fade indicator for mobile only */}
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none sm:hidden" />
        </div>
      </div>

      {/* Main card panels */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <CardTitle>
              {activeTab === 'cylinders' && 'Aset Tabung Oksigen'}
              {activeTab === 'accessories' && 'Aset Aksesoris'}
              {activeTab === 'products' && 'Katalog Produk & Aksesoris'}
              {activeTab === 'customers' && 'Database Pelanggan'}
              {activeTab === 'vendors' && 'Database Mitra Vendor'}
            </CardTitle>
            <CardDescription>
              {activeTab === 'cylinders' && 'Inventarisasi tabung gas medis dan kelayakan uji tekan.'}
              {activeTab === 'accessories' && 'Inventarisasi aset aksesoris medis (regulator, troli) yang disewakan.'}
              {activeTab === 'products' && 'Manajemen persediaan barang retail medis non-persewaan.'}
              {activeTab === 'customers' && 'Detail nomor kontak, alamat kirim sewa, dan saldo pelanggan.'}
              {activeTab === 'vendors' && 'Profil PIC vendor penyuplai logistik atau pabrik refill.'}
            </CardDescription>
          </div>
          
          <Button
            className="flex items-center gap-1.5 shrink-0"
            onClick={() => {
              if (activeTab === 'cylinders' || activeTab === 'accessories') {
                resetForms();
                setIsCylinderDrawerOpen(true);
              }
              if (activeTab === 'products') setIsProductDrawerOpen(true);
              if (activeTab === 'customers') setIsCustomerDrawerOpen(true);
              if (activeTab === 'vendors') setIsVendorDrawerOpen(true);
            }}
          >
            <Plus className="w-4 h-4" />
            {activeTab === 'cylinders' && 'Tabung Baru'}
            {activeTab === 'accessories' && 'Aksesoris Baru'}
            {activeTab === 'products' && 'Produk Baru'}
            {activeTab === 'customers' && 'Pelanggan Baru'}
            {activeTab === 'vendors' && 'Vendor Baru'}
          </Button>
        </CardHeader>
        <CardContent>
          
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4 items-center">
            <div className="relative w-full sm:flex-1">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={
                  (activeTab === 'cylinders' || activeTab === 'accessories') ? 'Cari serial number/aset...' :
                  activeTab === 'products' ? 'Cari nama produk...' :
                  activeTab === 'customers' ? 'Cari nama pelanggan...' :
                  'Cari profil vendor...'
                }
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="pl-9 pr-4 h-10 w-full text-sm bg-background border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            
            {/* Context-aware status select filter */}
            <div className="w-full sm:w-48 shrink-0">
              <Select
                id="invStatusFilter"
                value={statusFilter}
                onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                options={
                  (activeTab === 'cylinders' || activeTab === 'accessories') ? [
                    { value: 'All', label: 'Semua Status' },
                    { value: 'Available', label: 'Tersedia' },
                    { value: 'Rented', label: 'Disewa' },
                    { value: 'At Vendor', label: 'Di Vendor' },
                    { value: 'Maintenance', label: 'Servis' },
                    { value: 'Empty', label: 'Kosong' }
                  ] :
                  activeTab === 'customers' ? [
                    { value: 'All', label: 'Semua Status' },
                    { value: 'Active', label: 'Aktif' },
                    { value: 'Inactive', label: 'Nonaktif' }
                  ] : [
                    { value: 'All', label: 'Semua Status' },
                    { value: 'Active', label: 'Aktif' },
                    { value: 'Inactive', label: 'Nonaktif' }
                  ]
                }
              />
            </div>
          </div>

          {/* 1. CYLINDERS & ACCESSORIES TABLE */}
          {(activeTab === 'cylinders' || activeTab === 'accessories') && paginatedData.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{activeTab === 'accessories' ? 'ID Aksesoris' : 'ID Tabung'}</TableHead>
                  <TableHead>Nomor Serial (SN)</TableHead>
                  <TableHead>{activeTab === 'accessories' ? 'Satuan' : 'Ukuran'}</TableHead>
                  <TableHead>{activeTab === 'accessories' ? 'Nama Aksesoris' : 'Tipe Gas'}</TableHead>
                  <TableHead>Inspeksi Terakhir</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((c: any) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-bold text-foreground">{c.id}</TableCell>
                    <TableCell className="font-semibold text-foreground">{c.serialNo}</TableCell>
                    <TableCell>{c.size}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{c.oxygenType}</Badge>
                    </TableCell>
                    <TableCell>{c.lastInspection}</TableCell>
                    <TableCell>
                      <Badge variant={c.status === 'Available' ? 'success' : c.status === 'Rented' ? 'secondary' : c.status === 'At Vendor' ? 'info' : 'destructive'}>
                        {c.status === 'Available' ? 'Tersedia' : c.status === 'Rented' ? 'Disewa' : c.status === 'At Vendor' ? 'Di Vendor' : 'Servis'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="outline" size="sm" className="px-2" onClick={() => loadEditCylinder(c)}>
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="px-2 text-rose-500 hover:bg-rose-500/10"
                        disabled={deletingId !== null}
                        onClick={async () => {
                          if (confirm(activeTab === 'accessories' ? 'Hapus aksesoris ini?' : 'Hapus tabung ini?')) {
                            setDeletingId(c.id);
                            try {
                              await deleteCylinder(c.id);
                            } catch (err: any) {
                              alert(err.message || 'Gagal menghapus.');
                            } finally {
                              setDeletingId(null);
                            }
                          }
                        }}
                      >
                        {deletingId === c.id ? (
                          <div className="w-3.5 h-3.5 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* 2. PRODUCTS TABLE */}
          {activeTab === 'products' && paginatedData.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID Produk</TableHead>
                  <TableHead>Nama Barang</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Stok Gudang</TableHead>
                  <TableHead>Harga Modal</TableHead>
                  <TableHead>Harga Jual</TableHead>
                  <TableHead>Margin</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((p: any) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-bold text-foreground">{p.id}</TableCell>
                    <TableCell className="font-semibold text-foreground">{p.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{p.category}</Badge>
                    </TableCell>
                    <TableCell className="font-bold text-foreground">
                      <span className={p.stock < 10 ? 'text-amber-500 font-extrabold' : ''}>{p.stock} pcs</span>
                    </TableCell>
                    <TableCell>{formatRupiah(p.cost)}</TableCell>
                    <TableCell>{formatRupiah(p.price)}</TableCell>
                    <TableCell className="text-emerald-500 font-bold">{formatRupiah(p.price - p.cost)}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="outline" size="sm" className="px-2" onClick={() => loadEditProduct(p)}>
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="px-2 text-rose-500 hover:bg-rose-500/10"
                        disabled={deletingId !== null}
                        onClick={async () => {
                          if (confirm('Hapus produk ini?')) {
                            setDeletingId(p.id);
                            try {
                              await deleteProduct(p.id);
                            } catch (err: any) {
                              alert(err.message || 'Gagal menghapus produk.');
                            } finally {
                              setDeletingId(null);
                            }
                          }
                        }}
                      >
                        {deletingId === p.id ? (
                          <div className="w-3.5 h-3.5 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* 3. CUSTOMERS TABLE */}
          {activeTab === 'customers' && paginatedData.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID Pelanggan</TableHead>
                  <TableHead>Nama Pelanggan</TableHead>
                  <TableHead>WhatsApp / Telp</TableHead>
                  <TableHead>Alamat Pengiriman</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((c: any) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-bold text-foreground">{c.id}</TableCell>
                    <TableCell className="font-semibold text-foreground">{c.name}</TableCell>
                    <TableCell>{c.phone}</TableCell>
                    <TableCell className="max-w-[150px] truncate">{c.address}</TableCell>
                    <TableCell>
                      <Badge variant={c.status === 'Active' ? 'success' : 'secondary'}>
                        {c.status === 'Active' ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="outline" size="sm" className="px-2" onClick={() => loadEditCustomer(c)}>
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="px-2 text-rose-500 hover:bg-rose-500/10"
                        disabled={deletingId !== null}
                        onClick={async () => {
                          if (confirm('Hapus pelanggan ini?')) {
                            setDeletingId(c.id);
                            try {
                              await deleteCustomer(c.id);
                            } catch (err: any) {
                              alert(err.message || 'Gagal menghapus pelanggan.');
                            } finally {
                              setDeletingId(null);
                            }
                          }
                        }}
                      >
                        {deletingId === c.id ? (
                          <div className="w-3.5 h-3.5 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* 4. VENDORS TABLE */}
          {activeTab === 'vendors' && paginatedData.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID Vendor</TableHead>
                  <TableHead>Nama Perusahaan</TableHead>
                  <TableHead>PIC / Sales</TableHead>
                  <TableHead>WhatsApp</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status Kerja</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((v: any) => (
                  <TableRow key={v.id}>
                    <TableCell className="font-bold text-foreground">{v.id}</TableCell>
                    <TableCell className="font-semibold text-foreground">{v.companyName}</TableCell>
                    <TableCell>{v.name}</TableCell>
                    <TableCell>{v.phone}</TableCell>
                    <TableCell>{v.email}</TableCell>
                    <TableCell>
                      <Badge variant={v.status === 'Active' ? 'success' : 'secondary'}>
                        {v.status === 'Active' ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="outline" size="sm" className="px-2" onClick={() => loadEditVendor(v)}>
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="px-2 text-rose-500 hover:bg-rose-500/10"
                        disabled={deletingId !== null}
                        onClick={async () => {
                          if (confirm('Hapus vendor ini?')) {
                            setDeletingId(v.id);
                            try {
                              await deleteVendor(v.id);
                            } catch (err: any) {
                              alert(err.message || 'Gagal menghapus vendor.');
                            } finally {
                              setDeletingId(null);
                            }
                          }
                        }}
                      >
                        {deletingId === v.id ? (
                          <div className="w-3.5 h-3.5 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {filteredData.length > 0 ? (
            <div className="mt-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={filteredData.length}
                itemsPerPage={itemsPerPage}
              />
            </div>
          ) : (
            <div className="py-20 text-center text-muted-foreground text-sm">
              Tidak ada data inventaris yang cocok dengan filter atau pencarian Anda.
            </div>
          )}

        </CardContent>
      </Card>

      {/* ------------------------------------------------------------- */}
      {/* FORM DRAWERS (ADD / EDIT LAYOUTS) */}
      {/* ------------------------------------------------------------- */}
      
      {/* 1. CYLINDER & ACCESSORIES DRAWER */}
      <Drawer
        isOpen={isCylinderDrawerOpen}
        onClose={() => {
          setIsCylinderDrawerOpen(false);
          resetForms();
        }}
        title={editingId
          ? (isAccessoryAsset(cylinderForm.serialNo, cylinderForm.size) ? 'Edit Aset Aksesoris' : 'Edit Tabung Baja')
          : (activeTab === 'accessories' ? 'Tambah Aset Aksesoris Baru' : 'Tambah Tabung Oksigen Baru')
        }
      >
        <form onSubmit={handleCylinderSubmit} className="space-y-4">
          <Input
            label={activeTab === 'accessories' ? "Nomor Serial Aksesoris (SN) *" : "Nomor Serial Tabung (SN) *"}
            id="cylSn"
            placeholder={activeTab === 'accessories' ? "e.g. REG-NES-001" : "e.g. SN-OX-12345"}
            value={cylinderForm.serialNo}
            onChange={e => setCylinderForm({ ...cylinderForm, serialNo: e.target.value })}
            required
          />
          <Select
            label={activeTab === 'accessories' ? "Satuan / Unit *" : "Ukuran Volume Tabung *"}
            id="cylSize"
            value={cylinderForm.size}
            onChange={e => setCylinderForm({ ...cylinderForm, size: e.target.value as any })}
            options={activeTab === 'accessories' ? [
              { value: 'Pcs', label: 'Pcs' }
            ] : [
              { value: '1m3', label: '1 m³' },
              { value: '2m3', label: '2 m³' },
              { value: '6m3', label: '6 m³' }
            ]}
          />
          <Select
            label={activeTab === 'accessories' ? "Nama / Tipe Aksesoris *" : "Grade Kandungan Gas *"}
            id="cylType"
            value={cylinderForm.oxygenType}
            onChange={e => setCylinderForm({ ...cylinderForm, oxygenType: e.target.value as any })}
            options={
              activeTab === 'accessories' ? oxygenTypes
                .filter(t => t.name.toLowerCase().includes('sewa') || t.name.toLowerCase().includes('regulator') || t.name.toLowerCase().includes('troli'))
                .map(t => ({ value: t.name, label: t.name }))
              : oxygenTypes
                .filter(t => !t.name.toLowerCase().includes('sewa') && !t.name.toLowerCase().includes('regulator') && !t.name.toLowerCase().includes('troli'))
                .map(t => ({ value: t.name, label: t.name }))
            }
          />
          <Input
            label={activeTab === 'accessories' ? "Tanggal Inspeksi / Kelayakan *" : "Tanggal Hydrotest / Inspeksi Terakhir *"}
            id="cylInspect"
            type="date"
            value={cylinderForm.lastInspection}
            onChange={e => setCylinderForm({ ...cylinderForm, lastInspection: e.target.value })}
          />
          {editingId && (
            <Select
              label={activeTab === 'accessories' ? "Status Posisi Aksesoris *" : "Status Posisi Tabung *"}
              id="cylStat"
              value={cylinderForm.status}
              onChange={e => setCylinderForm({ ...cylinderForm, status: e.target.value as any })}
              options={activeTab === 'accessories' ? [
                { value: 'Available', label: 'Tersedia di Gudang (Available)' },
                { value: 'Rented', label: 'Sedang Disewa (Rented)' },
                { value: 'Maintenance', label: 'Sedang Servis (Maintenance)' }
              ] : [
                { value: 'Available', label: 'Tersedia di Gudang (Available)' },
                { value: 'Rented', label: 'Sedang Disewa (Rented)' },
                { value: 'At Vendor', label: 'Isi Ulang di Vendor (At Vendor)' },
                { value: 'Maintenance', label: 'Sedang Servis (Maintenance)' },
                { value: 'Empty', label: 'Kosong (Empty)' }
              ]}
            />
          )}
          <div className="border-t border-border pt-4 flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={() => { setIsCylinderDrawerOpen(false); resetForms(); }} disabled={isSaving}>Batal</Button>
            <Button type="submit" className="flex-1" disabled={isSaving}>
              {isSaving ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Memproses...</span>
                </div>
              ) : (
                'Simpan Tabung'
              )}
            </Button>
          </div>
        </form>
      </Drawer>

      {/* 2. PRODUCT DRAWER */}
      <Drawer isOpen={isProductDrawerOpen} onClose={() => { setIsProductDrawerOpen(false); resetForms(); }} title={editingId ? 'Edit Produk Katalog' : 'Tambah Produk Baru'}>
        <form onSubmit={handleProductSubmit} className="space-y-4">
          <Input
            label="Nama Produk Ritel *"
            id="prodName"
            placeholder="e.g. Regulator Oksigen Nesco"
            value={productForm.name}
            onChange={e => setProductForm({ ...productForm, name: e.target.value })}
            required
          />
          <Select
            label="Kategori Produk *"
            id="prodCat"
            value={productForm.category}
            onChange={e => setProductForm({ ...productForm, category: e.target.value as any })}
            options={[
              { value: 'Aksesoris', label: 'Aksesoris / Consumables' },
              { value: 'Peralatan', label: 'Peralatan / Alat Medis' },
              { value: 'Gas', label: 'Gas / Isi Ulang' }
            ]}
          />
          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Stok Awal *"
              id="prodStock"
              type="number"
              value={productForm.stock}
              onChange={e => setProductForm({ ...productForm, stock: e.target.value })}
            />
            <Input
              label="Modal Beli (Rp)"
              id="prodCost"
              isRupiah={true}
              value={productForm.cost}
              onChange={e => setProductForm({ ...productForm, cost: e.target.value })}
            />
            <Input
              label="Harga Jual (Rp)"
              id="prodPrice"
              isRupiah={true}
              value={productForm.price}
              onChange={e => setProductForm({ ...productForm, price: e.target.value })}
            />
          </div>
          <Textarea
            label="Deskripsi Keterangan Barang"
            id="prodDesc"
            value={productForm.description}
            onChange={e => setProductForm({ ...productForm, description: e.target.value })}
          />

          <div className="border-t border-border pt-4 flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={() => { setIsProductDrawerOpen(false); resetForms(); }} disabled={isSaving}>Batal</Button>
            <Button type="submit" className="flex-1" disabled={isSaving}>
              {isSaving ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Memproses...</span>
                </div>
              ) : (
                'Simpan Produk'
              )}
            </Button>
          </div>
        </form>
      </Drawer>

      {/* 3. CUSTOMER DRAWER */}
      <Drawer isOpen={isCustomerDrawerOpen} onClose={() => { setIsCustomerDrawerOpen(false); resetForms(); }} title={editingId ? 'Edit Pelanggan' : 'Tambah Pelanggan Baru'}>
        <form onSubmit={handleCustomerSubmit} className="space-y-4">
          <Input
            label="Nama Lengkap Pelanggan / RS *"
            id="custName"
            placeholder="e.g. Rumah Sakit Dustira"
            value={customerForm.name}
            onChange={e => setCustomerForm({ ...customerForm, name: e.target.value })}
            required
          />
          <Input
            label="WhatsApp / No Telp *"
            id="custPhone"
            placeholder="e.g. 08123456789"
            value={customerForm.phone}
            onChange={e => setCustomerForm({ ...customerForm, phone: e.target.value })}
            required
          />
          <Textarea
            label="Alamat Lengkap Pengiriman *"
            id="custAddress"
            placeholder="Alamat RS / rumah pengantaran tabung"
            value={customerForm.address}
            onChange={e => setCustomerForm({ ...customerForm, address: e.target.value })}
          />
          {editingId && (
            <Select
              label="Status Akun *"
              id="custStat"
              value={customerForm.status}
              onChange={e => setCustomerForm({ ...customerForm, status: e.target.value as any })}
              options={[
                { value: 'Active', label: 'Aktif' },
                { value: 'Inactive', label: 'Nonaktif' }
              ]}
            />
          )}
          <div className="border-t border-border pt-4 flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={() => { setIsCustomerDrawerOpen(false); resetForms(); }} disabled={isSaving}>Batal</Button>
            <Button type="submit" className="flex-1" disabled={isSaving}>
              {isSaving ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Memproses...</span>
                </div>
              ) : (
                'Simpan Pelanggan'
              )}
            </Button>
          </div>
        </form>
      </Drawer>

      {/* 4. VENDOR DRAWER */}
      <Drawer isOpen={isVendorDrawerOpen} onClose={() => { setIsVendorDrawerOpen(false); resetForms(); }} title={editingId ? 'Edit Profil Vendor' : 'Tambah Vendor Baru'}>
        <form onSubmit={handleVendorSubmit} className="space-y-4">
          <Input
            label="Nama Instansi / Badan Usaha *"
            id="vendComp"
            placeholder="e.g. PT Samator Gas Industri"
            value={vendorForm.companyName}
            onChange={e => setVendorForm({ ...vendorForm, companyName: e.target.value })}
            required
          />
          <Input
            label="Nama Sales Representative (PIC) *"
            id="vendPic"
            placeholder="e.g. Ahmad Faisal"
            value={vendorForm.name}
            onChange={e => setVendorForm({ ...vendorForm, name: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="WhatsApp / Telp PIC *"
              id="vendPhone"
              value={vendorForm.phone}
              onChange={e => setVendorForm({ ...vendorForm, phone: e.target.value })}
            />
            <Input
              label="Email Perusahaan"
              id="vendEmail"
              placeholder="e.g. info@samator.com"
              value={vendorForm.email}
              onChange={e => setVendorForm({ ...vendorForm, email: e.target.value })}
            />
          </div>
          <Textarea
            label="Alamat Pabrik / Kantor Pusat"
            id="vendAddress"
            value={vendorForm.address}
            onChange={e => setVendorForm({ ...vendorForm, address: e.target.value })}
          />
          {editingId && (
            <Select
              label="Status Kerja Sama *"
              id="vendStat"
              value={vendorForm.status}
              onChange={e => setVendorForm({ ...vendorForm, status: e.target.value as any })}
              options={[
                { value: 'Active', label: 'Aktif' },
                { value: 'Inactive', label: 'Non-Aktif' }
              ]}
            />
          )}
          <div className="border-t border-border pt-4 flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={() => { setIsVendorDrawerOpen(false); resetForms(); }} disabled={isSaving}>Batal</Button>
            <Button type="submit" className="flex-1" disabled={isSaving}>
              {isSaving ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Memproses...</span>
                </div>
              ) : (
                'Simpan Vendor'
              )}
            </Button>
          </div>
        </form>
      </Drawer>

    </div>
  );
}
