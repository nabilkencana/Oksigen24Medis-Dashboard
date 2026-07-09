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

type TabType = 'cylinders' | 'products' | 'customers' | 'vendors';

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
  const [cylinderForm, setCylinderForm] = useState<{
    serialNo: string;
    size: '1m3' | '2m3' | '6m3';
    oxygenType: string;
    lastInspection: string;
    status: 'Available' | 'Rented' | 'At Vendor' | 'Maintenance' | 'Empty';
  }>({
    serialNo: '',
    size: '1m3',
    oxygenType: 'Medical',
    lastInspection: '',
    status: 'Available'
  });
  const [productForm, setProductForm] = useState<{
    name: string;
    category: 'Gas' | 'Equipment' | 'Accessory';
    stock: string;
    cost: string;
    price: string;
    description: string;
  }>({
    name: '',
    category: 'Accessory',
    stock: '50',
    cost: '15000',
    price: '25000',
    description: ''
  });
  const [customerForm, setCustomerForm] = useState<{
    name: string;
    phone: string;
    email: string;
    address: string;
    status: 'Active' | 'Inactive';
  }>({
    name: '',
    phone: '',
    email: '',
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
    setCylinderForm({ serialNo: '', size: '1m3', oxygenType: 'Medical', lastInspection: today, status: 'Available' });
    setProductForm({ name: '', category: 'Accessory', stock: '50', cost: '15000', price: '25000', description: '' });
    setCustomerForm({ name: '', phone: '', email: '', address: '', status: 'Active' });
    setVendorForm({ companyName: '', name: '', phone: '', email: '', address: '', status: 'Active' });
  };

  // -------------------------------------------------------------
  // DATA FILTERING & SEARCHING
  // -------------------------------------------------------------
  const filteredData = useMemo(() => {
    const query = searchTerm.toLowerCase();

    if (activeTab === 'cylinders') {
      return cylinders.filter(c => {
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
      email: c.email,
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

        <div className="flex gap-1 bg-muted/40 p-1 border border-border rounded-xl text-xs font-semibold shrink-0">
          <button
            onClick={() => changeTab('cylinders')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${activeTab === 'cylinders' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Tabung Oksigen
          </button>
          <button
            onClick={() => changeTab('products')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${activeTab === 'products' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Katalog Produk
          </button>
          <button
            onClick={() => changeTab('customers')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${activeTab === 'customers' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Pelanggan
          </button>
          <button
            onClick={() => changeTab('vendors')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${activeTab === 'vendors' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Mitra Vendor
          </button>
        </div>
      </div>

      {/* Main card panels */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <CardTitle>
              {activeTab === 'cylinders' && 'Aset Tabung Oksigen'}
              {activeTab === 'products' && 'Katalog Produk & Aksesoris'}
              {activeTab === 'customers' && 'Database Pelanggan'}
              {activeTab === 'vendors' && 'Database Mitra Vendor'}
            </CardTitle>
            <CardDescription>
              {activeTab === 'cylinders' && 'Inventarisasi tabung gas medis dan kelayakan uji tekan.'}
              {activeTab === 'products' && 'Manajemen persediaan barang retail medis non-persewaan.'}
              {activeTab === 'customers' && 'Detail nomor kontak, alamat kirim sewa, dan saldo pelanggan.'}
              {activeTab === 'vendors' && 'Profil PIC vendor penyuplai logistik atau pabrik refill.'}
            </CardDescription>
          </div>
          <Button
            className="flex items-center gap-1.5 self-start"
            onClick={() => {
              resetForms();
              if (activeTab === 'cylinders') setIsCylinderDrawerOpen(true);
              if (activeTab === 'products') setIsProductDrawerOpen(true);
              if (activeTab === 'customers') setIsCustomerDrawerOpen(true);
              if (activeTab === 'vendors') setIsVendorDrawerOpen(true);
            }}
          >
            <Plus className="w-4 h-4" />
            {activeTab === 'cylinders' && 'Tabung Baru'}
            {activeTab === 'products' && 'Produk Baru'}
            {activeTab === 'customers' && 'Pelanggan Baru'}
            {activeTab === 'vendors' && 'Vendor Baru'}
          </Button>
        </CardHeader>
        <CardContent>
          
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={
                  activeTab === 'cylinders' ? 'Cari serial number tabung...' :
                  activeTab === 'products' ? 'Cari nama produk...' :
                  activeTab === 'customers' ? 'Cari nama pelanggan...' :
                  'Cari profil vendor...'
                }
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="pl-9 pr-4 py-2 w-full text-sm bg-background border border-border rounded-lg outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            
            {/* Context-aware status select filter */}
            <Select
              id="invStatusFilter"
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              options={
                activeTab === 'cylinders' ? [
                  { value: 'All', label: 'Semua Status' },
                  { value: 'Available', label: 'Tersedia' },
                  { value: 'Rented', label: 'Sedang Disewa' },
                  { value: 'At Vendor', label: 'Di Vendor Refill' },
                  { value: 'Maintenance', label: 'Maintenance' }
                ] : [
                  { value: 'All', label: 'Semua Status' },
                  { value: 'Active', label: 'Aktif' },
                  { value: 'Inactive', label: 'Non-Aktif' }
                ]
              }
              className="w-full sm:w-44"
            />
          </div>

          {/* 1. CYLINDERS TABLE */}
          {activeTab === 'cylinders' && paginatedData.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID Tabung</TableHead>
                  <TableHead>Nomor Serial (SN)</TableHead>
                  <TableHead>Ukuran</TableHead>
                  <TableHead>Tipe Gas</TableHead>
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
                          if (confirm('Hapus tabung ini?')) {
                            setDeletingId(c.id);
                            try {
                              await deleteCylinder(c.id);
                            } catch (err: any) {
                              alert(err.message || 'Gagal menghapus tabung.');
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
                  <TableHead>Email</TableHead>
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
                    <TableCell>{c.email}</TableCell>
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
      
      {/* 1. CYLINDER DRAWER */}
      <Drawer isOpen={isCylinderDrawerOpen} onClose={() => { setIsCylinderDrawerOpen(false); resetForms(); }} title={editingId ? 'Edit Tabung Baja' : 'Tambah Tabung Oksigen Baru'}>
        <form onSubmit={handleCylinderSubmit} className="space-y-4">
          <Input
            label="Nomor Serial Tabung (SN) *"
            id="cylSn"
            placeholder="e.g. SN-OX-12345"
            value={cylinderForm.serialNo}
            onChange={e => setCylinderForm({ ...cylinderForm, serialNo: e.target.value })}
            required
          />
          <Select
            label="Ukuran Volume Tabung *"
            id="cylSize"
            value={cylinderForm.size}
            onChange={e => setCylinderForm({ ...cylinderForm, size: e.target.value as any })}
            options={[
              { value: '1m3', label: '1 m³' },
              { value: '2m3', label: '2 m³' },
              { value: '6m3', label: '6 m³' }
            ]}
          />
          <Select
            label="Grade Kandungan Gas *"
            id="cylType"
            value={cylinderForm.oxygenType}
            onChange={e => setCylinderForm({ ...cylinderForm, oxygenType: e.target.value as any })}
            options={[
              { value: 'Medical', label: 'Medical Oxygen (99.5%)' },
              { value: 'Industrial', label: 'Industrial Oxygen (99.2%)' },
              { value: 'High-Purity', label: 'High Purity (99.99%)' }
            ]}
          />
          <Input
            label="Tanggal Hydrotest / Inspeksi Terakhir *"
            id="cylInspect"
            type="date"
            value={cylinderForm.lastInspection}
            onChange={e => setCylinderForm({ ...cylinderForm, lastInspection: e.target.value })}
          />
          {editingId && (
            <Select
              label="Status Posisi Tabung *"
              id="cylStat"
              value={cylinderForm.status}
              onChange={e => setCylinderForm({ ...cylinderForm, status: e.target.value as any })}
              options={[
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
              { value: 'Accessory', label: 'Accessory / Consumables' },
              { value: 'Equipment', label: 'Equipment / Alat Medis' },
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
          <Input
            label="Alamat Email"
            id="custEmail"
            placeholder="e.g. dustira@gmail.com"
            value={customerForm.email}
            onChange={e => setCustomerForm({ ...customerForm, email: e.target.value })}
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
