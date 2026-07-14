'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useData } from '../../context/DataContext';
import { formatRupiah, Cylinder } from '../../context/mockData';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Drawer } from '../../components/ui/Drawer';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Pagination } from '../../components/ui/Table';
import { Plus, Search, Eye, RefreshCw, Printer, Calendar, FileText, ChevronRight, X, ShoppingCart, Trash2, CheckCircle2, UserPlus, Database } from 'lucide-react';

const isAccessoryAsset = (serial: string, size?: string) => {
  const s = (serial || '').toUpperCase();
  const sz = (size || '').toUpperCase();
  return s.startsWith('REG-') || s.startsWith('TRL-') || s.startsWith('ACC-') || sz === 'PCS';
};

type TabType = 'rental' | 'accessory-rental' | 'return' | 'sales' | 'restock' | 'refill';

export default function TransactionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as TabType) || 'rental';
  const urlSearch = searchParams.get('search') || '';

  const {
    customers,
    vendors,
    cylinders,
    products,
    rentals,
    refills,
    transactions,
    addCustomer,
    addVendor,
    addCylinder,
    createRental,
    returnRental,
    sendToRefill,
    receiveRefill,
    createSale,
    createPurchase
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
    setTypeFilter('All');
    router.replace(`/transactions?tab=${tab}`);
  };

  // Search & Filters state
  const [searchTerm, setSearchTerm] = useState(urlSearch);
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Selected Detail Rental (Modal/Drawer)
  const [selectedRental, setSelectedRental] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isPrintOpen, setIsPrintOpen] = useState(false);

  // Global Actions Drawer states
  const [isRentalDrawerOpen, setIsRentalDrawerOpen] = useState(false);
  const [isReturnDrawerOpen, setIsReturnDrawerOpen] = useState(false);
  const [isRefillDrawerOpen, setIsRefillDrawerOpen] = useState(false);
  const [isRestockDrawerOpen, setIsRestockDrawerOpen] = useState(false);

  // Form states
  const [rentalForm, setRentalForm] = useState({ customerId: '', cylinderId: '', rentDate: '', returnDate: '', deposit: '', rentalFee: '', paymentMethod: 'Tunai', serviceType: 'Kios' as 'Kios' | 'Antar' });
  const [isSaving, setIsSaving] = useState(false);
  const [rentIsNewCustomer, setRentIsNewCustomer] = useState(false);
  const [rentNewCustName, setRentNewCustName] = useState('');
  const [rentNewCustPhone, setRentNewCustPhone] = useState('');
  const [rentNewCustAddress, setRentNewCustAddress] = useState('');
  const [rentIsNewCylinder, setRentIsNewCylinder] = useState(false);
  const [rentNewCylinderSerialNo, setRentNewCylinderSerialNo] = useState('');
  const [rentNewCylinderSize, setRentNewCylinderSize] = useState<'1m3' | '2m3' | '6m3'>('1m3');
  const [refillLoadingId, setRefillLoadingId] = useState<string | null>(null);
  const [returnForm, setReturnForm] = useState({ rentalId: '', returnDate: '', condition: 'Available' as 'Available' | 'Maintenance' });
  const [refillForm, setRefillForm] = useState({ cylinderId: '', vendorId: '', cost: '', sendDate: '' });
  const [refillIsNewVendor, setRefillIsNewVendor] = useState(false);
  const [refillNewVendorCompanyName, setRefillNewVendorCompanyName] = useState('');
  const [refillNewVendorPhone, setRefillNewVendorPhone] = useState('');
  const [refillNewVendorAddress, setRefillNewVendorAddress] = useState('');
  
  // POS Cart State
  const [posCustomer, setPosCustomer] = useState('');
  const [posCustomerMode, setPosCustomerMode] = useState<'select' | 'input'>('select');
  const [posCustomerName, setPosCustomerName] = useState('');
  const [posCart, setPosCart] = useState<Array<{ productId: string; name: string; qty: number; price: number }>>([]);
  const [posProduct, setPosProduct] = useState('');
  const [posQty, setPosQty] = useState('1');
  const [posPaymentMethod, setPosPaymentMethod] = useState<'Tunai' | 'Transfer' | 'QRIS'>('Tunai');
  const [posServiceType, setPosServiceType] = useState<'Kios' | 'Antar'>('Kios');
  const [completedSaleInvoice, setCompletedSaleInvoice] = useState<any>(null);

  // Supplier Restock Cart State
  const [restockVendor, setRestockVendor] = useState('');
  const [restockCart, setRestockCart] = useState<Array<{ itemId: string; name: string; qty: number; cost: number }>>([]);
  const [restockProduct, setRestockProduct] = useState('');
  const [restockQty, setRestockQty] = useState('1');
  const [restockCostInput, setRestockCostInput] = useState('');

  // Auto-fill Dates
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    setRentalForm(prev => ({ ...prev, rentDate: today, returnDate: nextWeek }));
    setReturnForm(prev => ({ ...prev, returnDate: today }));
    setRefillForm(prev => ({ ...prev, sendDate: today }));
  }, []);

  // -------------------------------------------------------------
  // RENTAL TAB FILTER & SEARCH
  // -------------------------------------------------------------
  const filteredRentals = useMemo(() => {
    return rentals.filter(r => {
      const isAcc = isAccessoryAsset(r.cylinderSerial || '', r.cylinderSize || '');
      const isCorrectTabType = activeTab === 'accessory-rental' ? isAcc : !isAcc;
      if (!isCorrectTabType) return false;

      const cust = customers.find(c => c.id === r.customerId);
      const matchesSearch =
        r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cust && cust.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        r.cylinderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.cylinderSerial || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [rentals, customers, searchTerm, statusFilter, activeTab]);

  const paginatedRentals = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRentals.slice(start, start + itemsPerPage);
  }, [filteredRentals, currentPage]);

  // -------------------------------------------------------------
  // POS RETAIL FUNCTIONS
  // -------------------------------------------------------------
  const handleAddPosCart = () => {
    if (!posProduct) return;
    const prod = products.find(p => p.id === posProduct);
    if (!prod) return;

    const qtyNum = Number(posQty);
    if (qtyNum <= 0) return;

    if (prod.stock < qtyNum) {
      alert(`Stok tidak mencukupi! Sisa stok: ${prod.stock} unit.`);
      return;
    }

    // Check if item already exists in cart
    const existing = posCart.find(item => item.productId === posProduct);
    if (existing) {
      if (prod.stock < existing.qty + qtyNum) {
        alert(`Stok tidak mencukupi! Total pesanan melebihi stok gudang.`);
        return;
      }
      setPosCart(posCart.map(item => item.productId === posProduct ? { ...item, qty: item.qty + qtyNum } : item));
    } else {
      setPosCart([...posCart, { productId: prod.id, name: prod.name, qty: qtyNum, price: prod.price }]);
    }

    setPosProduct('');
    setPosQty('1');
  };

  const handleRemovePosCart = (prodId: string) => {
    setPosCart(posCart.filter(item => item.productId !== prodId));
  };

  const posTotal = useMemo(() => {
    return posCart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  }, [posCart]);

  const handleCheckoutPOS = async () => {
    if (posCart.length === 0) {
      alert('Harap tambahkan produk ke keranjang.');
      return;
    }

    setIsSaving(true);
    try {
      let finalCustomerId = undefined;

      if (posCustomerMode === 'select') {
        if (posCustomer) {
          finalCustomerId = posCustomer;
        }
      } else if (posCustomerMode === 'input') {
        const trimmedName = posCustomerName.trim();
        if (trimmedName) {
          // Check if customer already exists (case-insensitive) to prevent duplicates
          const existing = customers.find(c => c.name.toLowerCase() === trimmedName.toLowerCase());
          if (existing) {
            finalCustomerId = existing.id;
          } else {
            // Create new customer on the fly
            const newCust = await addCustomer({ name: trimmedName });
            finalCustomerId = newCust.id;
          }
        }
      }

      const sale = await createSale({
        customerId: finalCustomerId,
        items: posCart,
        date: new Date().toISOString().split('T')[0],
        paymentMethod: posPaymentMethod,
        serviceType: posServiceType
      });

      setCompletedSaleInvoice(sale);
      setPosCart([]);
      setPosCustomer('');
      setPosCustomerName('');
      setPosCustomerMode('select');
      setPosServiceType('Kios');
    } catch (err: any) {
      alert(err.message || 'Gagal memproses transaksi.');
    } finally {
      setIsSaving(false);
    }
  };

  // -------------------------------------------------------------
  // SUPPLIER RESTOCK FUNCTIONS
  // -------------------------------------------------------------
  const handleAddRestockCart = () => {
    if (!restockProduct) return;
    const prod = products.find(p => p.id === restockProduct);
    if (!prod) return;

    const qtyNum = Number(restockQty);
    const costNum = Number(restockCostInput) || prod.cost;

    if (qtyNum <= 0) return;

    const existing = restockCart.find(item => item.itemId === restockProduct);
    if (existing) {
      setRestockCart(restockCart.map(item => item.itemId === restockProduct ? { ...item, qty: item.qty + qtyNum } : item));
    } else {
      setRestockCart([...restockCart, { itemId: prod.id, name: prod.name, qty: qtyNum, cost: costNum }]);
    }

    setRestockProduct('');
    setRestockQty('1');
    setRestockCostInput('');
  };

  const handleRemoveRestockCart = (prodId: string) => {
    setRestockCart(restockCart.filter(item => item.itemId !== prodId));
  };

  const restockTotal = useMemo(() => {
    return restockCart.reduce((sum, item) => sum + (item.cost * item.qty), 0);
  }, [restockCart]);

  const handleCheckoutRestock = async () => {
    if (!restockVendor || restockCart.length === 0) {
      alert('Harap pilih supplier dan tambahkan produk ke keranjang.');
      return;
    }

    setIsSaving(true);
    try {
      await createPurchase({
        vendorId: restockVendor,
        items: restockCart,
        date: new Date().toISOString().split('T')[0]
      });

      alert('Transaksi restock pengadaan berhasil disimpan!');
      setRestockCart([]);
      setRestockVendor('');
      setIsRestockDrawerOpen(false);
    } catch (err: any) {
      alert(err.message || 'Gagal memproses transaksi.');
    } finally {
      setIsSaving(false);
    }
  };

  // -------------------------------------------------------------
  // FORM HANDLERS
  // -------------------------------------------------------------
  const handleRentalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let targetCustomerId = rentalForm.customerId;
    let targetCylinderId = rentalForm.cylinderId;

    if (rentIsNewCustomer) {
      if (!rentNewCustName.trim() || !rentNewCustPhone.trim() || !rentNewCustAddress.trim()) {
        alert('Harap isi semua kolom wajib untuk pelanggan baru.');
        return;
      }
    } else {
      if (!targetCustomerId) {
        alert('Harap pilih customer.');
        return;
      }
    }

    if (rentIsNewCylinder) {
      if (!rentNewCylinderSerialNo.trim()) {
        alert('Harap isi nomor serial untuk tabung baru.');
        return;
      }
    } else {
      if (!targetCylinderId) {
        alert('Harap pilih tabung oksigen.');
        return;
      }
    }

    if (!rentalForm.rentDate || !rentalForm.returnDate) {
      alert('Harap isi semua kolom wajib.');
      return;
    }

    setIsSaving(true);
    try {
      if (rentIsNewCustomer) {
        // Create new customer on the fly
        const newCust = await addCustomer({
          name: rentNewCustName.trim(),
          phone: rentNewCustPhone.trim(),
          address: rentNewCustAddress.trim(),
        });
        targetCustomerId = newCust.id;
      }

      if (rentIsNewCylinder) {
        // Create new cylinder on the fly
        const newCyl = await addCylinder({
          serialNo: rentNewCylinderSerialNo.trim(),
          size: rentNewCylinderSize,
          oxygenType: 'Medical Oxygen 99.5%',
          lastInspection: new Date().toISOString().split('T')[0],
          status: 'Available'
        });
        targetCylinderId = newCyl.id;
      }

      await createRental({
        customerId: targetCustomerId,
        cylinderId: targetCylinderId,
        rentDate: rentalForm.rentDate,
        returnDate: rentalForm.returnDate,
        deposit: Number(rentalForm.deposit) || 0,
        rentalFee: Number(rentalForm.rentalFee) || 0,
        paymentMethod: rentalForm.paymentMethod || 'Tunai',
        serviceType: rentalForm.serviceType || 'Kios'
      });
      setIsRentalDrawerOpen(false);
      setRentalForm({ customerId: '', cylinderId: '', rentDate: '', returnDate: '', deposit: '', rentalFee: '', paymentMethod: 'Tunai', serviceType: 'Kios' });
      setRentIsNewCustomer(false);
      setRentNewCustName('');
      setRentNewCustPhone('');
      setRentNewCustAddress('');
      setRentIsNewCylinder(false);
      setRentNewCylinderSerialNo('');
      setRentNewCylinderSize('1m3');
    } catch (err: any) {
      alert(err.message || 'Gagal membuat sewa.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReturnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnForm.rentalId || !returnForm.returnDate) {
      alert('Harap isi semua kolom wajib.');
      return;
    }
    setIsSaving(true);
    try {
      await returnRental(returnForm.rentalId, returnForm.returnDate, returnForm.condition);
      setIsReturnDrawerOpen(false);
      setReturnForm({ rentalId: '', returnDate: '', condition: 'Available' });
    } catch (err: any) {
      alert(err.message || 'Gagal memproses pengembalian sewa.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRefillSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let targetVendorId = refillForm.vendorId;

    if (refillIsNewVendor) {
      if (!refillNewVendorCompanyName.trim() || !refillNewVendorPhone.trim()) {
        alert('Harap isi semua kolom wajib untuk vendor baru.');
        return;
      }
    } else {
      if (!targetVendorId) {
        alert('Harap pilih vendor refill.');
        return;
      }
    }

    if (!refillForm.cylinderId || !refillForm.sendDate) {
      alert('Harap isi semua kolom wajib.');
      return;
    }

    setIsSaving(true);
    try {
      if (refillIsNewVendor) {
        // Create new vendor on the fly
        const newVend = await addVendor({
          companyName: refillNewVendorCompanyName.trim(),
          name: refillNewVendorCompanyName.trim(),
          phone: refillNewVendorPhone.trim(),
          address: refillNewVendorAddress.trim(),
          email: `${refillNewVendorCompanyName.toLowerCase().replace(/\s/g, '')}@vendor.com`,
          status: 'Active'
        });
        targetVendorId = newVend.id;
      }

      await sendToRefill({
        cylinderId: refillForm.cylinderId,
        vendorId: targetVendorId,
        cost: Number(refillForm.cost) || 0,
        sendDate: refillForm.sendDate
      });
      setIsRefillDrawerOpen(false);
      setRefillForm({ cylinderId: '', vendorId: '', cost: '', sendDate: '' });
      setRefillIsNewVendor(false);
      setRefillNewVendorCompanyName('');
      setRefillNewVendorPhone('');
      setRefillNewVendorAddress('');
    } catch (err: any) {
      alert(err.message || 'Gagal mengirim refill.');
    } finally {
      setIsSaving(false);
    }
  };

  // Filter cylinders for refills (need empty cylinders or maintenance ones)
  const emptyCylinders = cylinders.filter(c => c.status === 'Empty' || c.status === 'Maintenance');
  const rentedCylindersForReturn = rentals.filter(r => r.status === 'Active' || r.status === 'Overdue');
  const filteredReturns = useMemo(() => {
    return rentedCylindersForReturn.filter(r => {
      const cust = customers.find(c => c.id === r.customerId);
      const isAcc = isAccessoryAsset(r.cylinderSerial || '', r.cylinderSize || '');

      // Type Filter
      if (typeFilter !== 'All') {
        if (typeFilter === 'Accessory' && !isAcc) return false;
        if (typeFilter === 'Cylinder' && isAcc) return false;
      }

      // Search matching
      const matchesSearch =
        r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cust && cust.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        r.cylinderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.cylinderSerial || '').toLowerCase().includes(searchTerm.toLowerCase());

      // Status matching (All, Active, Overdue)
      const matchesStatus = statusFilter === 'All' || r.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [rentedCylindersForReturn, customers, searchTerm, statusFilter, typeFilter]);

  return (
    <div className="space-y-6">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          aside, header, .no-print, [role="button"], button, select, .bg-black {
            display: none !important;
          }
          html, body, #__next, .flex.h-screen, .flex-1.flex.flex-col, main {
            height: auto !important;
            min-height: auto !important;
            overflow: visible !important;
            display: block !important;
            position: static !important;
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          html, body {
            background-color: white !important;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .fixed.inset-y-0.right-0 {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            min-height: 100vh !important;
            background: white !important;
            box-shadow: none !important;
            border: none !important;
            padding: 20px !important;
            display: flex !important;
            justify-content: center !important;
            align-items: flex-start !important;
            z-index: 9999999 !important;
          }
          .fixed.inset-y-0.right-0 > div:first-child {
            display: none !important;
          }
          .fixed.inset-y-0.right-0 > div:last-child {
            overflow: visible !important;
            padding: 0 !important;
            width: 100% !important;
            display: flex !important;
            justify-content: center !important;
          }
          .printable-invoice-card {
            width: 100% !important;
            max-width: 580px !important;
            background: white !important;
            border: 1px solid #e4e4e7 !important;
            border-radius: 16px !important;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05) !important;
            padding: 24px !important;
            margin: 20px auto !important;
          }
        }
      `}} />

      <div className="space-y-6 no-print">
      
      {/* Tab Navigation header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Transaksi Operasional</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Kelola rental tabung, kasir POS ritel, restock grosir, dan logistik isi ulang.</p>
        </div>

        {/* Tab Buttons Wrapper with right-fade scroll indicator on mobile */}
        <div className="relative w-full overflow-hidden sm:overflow-visible shrink-0 lg:w-auto">
          <div className="flex gap-1 bg-muted/40 p-1 border border-border rounded-xl text-xs font-semibold overflow-x-auto max-w-full scrollbar-none pr-8 sm:pr-1 shrink-0">
            <button
              onClick={() => changeTab('rental')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0 whitespace-nowrap ${activeTab === 'rental' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Sewa Tabung
            </button>
            <button
              onClick={() => changeTab('accessory-rental')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0 whitespace-nowrap ${activeTab === 'accessory-rental' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Sewa Aksesoris
            </button>
            <button
              onClick={() => changeTab('return')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0 whitespace-nowrap ${activeTab === 'return' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Pengembalian
            </button>
            <button
              onClick={() => changeTab('sales')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0 whitespace-nowrap ${activeTab === 'sales' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Kasir POS
            </button>
            <button
              onClick={() => changeTab('restock')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0 whitespace-nowrap ${activeTab === 'restock' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Restock Supplier
            </button>
            <button
              onClick={() => changeTab('refill')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0 whitespace-nowrap ${activeTab === 'refill' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Refill Vendor
            </button>
          </div>
          {/* Scroll fade indicator for mobile only */}
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none sm:hidden" />
        </div>
      </div>

      {/* 1. SEWA TABUNG & SEWA AKSESORIS TABS */}
      {/* ----------------------------------------------------------------- */}
      {(activeTab === 'rental' || activeTab === 'accessory-rental') && (
        <Card>
          <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <CardTitle>{activeTab === 'accessory-rental' ? 'Kontrak Sewa Aksesoris' : 'Kontrak Sewa Oksigen'}</CardTitle>
              <CardDescription>
                {activeTab === 'accessory-rental' 
                  ? 'Daftar transaksi pinjam aksesoris medis (regulator, troli, dll) dan jaminan pelanggan.' 
                  : 'Daftar transaksi pinjam tabung dan deposit jaminan pelanggan.'}
              </CardDescription>
            </div>
            <Button 
              className="flex items-center gap-1.5 self-start" 
              onClick={() => {
                setRentalForm(prev => ({
                  ...prev,
                  cylinderId: '' // Clear any previous cylinder selection
                }));
                setIsRentalDrawerOpen(true);
              }}
            >
              <Plus className="w-4 h-4" /> Sewa Baru
            </Button>
          </CardHeader>
          <CardContent>
            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4 items-center">
              <div className="relative w-full sm:flex-1">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Cari ID rental, pelanggan, atau tabung..."
                  value={searchTerm}
                  onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="pl-9 pr-4 h-10 w-full text-sm bg-background border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              <div className="w-full sm:w-48 shrink-0">
                <Select
                  id="statusFilter"
                  value={statusFilter}
                  onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                  options={[
                    { value: 'All', label: 'Semua Status' },
                    { value: 'Active', label: 'Aktif' },
                    { value: 'Overdue', label: 'Jatuh Tempo (Denda)' },
                    { value: 'Returned', label: 'Selesai (Kembali)' }
                  ]}
                />
              </div>
            </div>

            {/* Rentals Table */}
            {filteredRentals.length > 0 ? (
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID Sewa</TableHead>
                      <TableHead>Pelanggan</TableHead>
                      <TableHead>{activeTab === 'accessory-rental' ? 'Aksesoris / Qty' : 'Tabung / Size'}</TableHead>
                      <TableHead>Tanggal Sewa</TableHead>
                      <TableHead>Batas Kembali</TableHead>
                      <TableHead>Deposit Jaminan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedRentals.map(r => {
                      const cust = customers.find(c => c.id === r.customerId);
                      return (
                        <TableRow key={r.id}>
                          <TableCell className="font-bold text-foreground">{r.id}</TableCell>
                          <TableCell>
                            <p className="font-semibold">{cust ? cust.name : 'Unknown'}</p>
                            <p className="text-3xs text-muted-foreground">{r.customerId}</p>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium text-foreground">{r.cylinderSerial || r.cylinderId}</span>
                            {(() => {
                              const cyl = cylinders.find(c => c.id === r.cylinderId);
                              return cyl ? <span className="text-2xs text-muted-foreground ml-1.5">({cyl.size} - {cyl.oxygenType})</span> : null;
                            })()}
                          </TableCell>
                          <TableCell>{r.rentDate}</TableCell>
                          <TableCell>{r.returnDate}</TableCell>
                          <TableCell className="font-medium text-foreground">{formatRupiah(r.deposit)}</TableCell>
                          <TableCell>
                            <Badge variant={r.status === 'Active' ? 'success' : r.status === 'Overdue' ? 'destructive' : 'secondary'}>
                              {r.status === 'Active' ? 'Aktif' : r.status === 'Overdue' ? 'Jatuh Tempo' : 'Selesai'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                className="px-2"
                                onClick={() => { setSelectedRental(r); setIsDetailOpen(true); }}
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="px-2 text-emerald-500"
                                onClick={() => { setSelectedRental(r); setIsPrintOpen(true); }}
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                
                <Pagination
                  currentPage={currentPage}
                  totalPages={Math.ceil(filteredRentals.length / itemsPerPage)}
                  onPageChange={setCurrentPage}
                  totalItems={filteredRentals.length}
                  itemsPerPage={itemsPerPage}
                />
              </div>
            ) : (
              <div className="py-16 text-center text-muted-foreground text-sm">
                Tidak ada data sewa yang ditemukan.
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* 2. PENGEMBALIAN TAB */}
      {/* ----------------------------------------------------------------- */}
      {activeTab === 'return' && (
        <Card>
          <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <CardTitle>Logistik Pengembalian Barang (Tabung & Aksesoris)</CardTitle>
              <CardDescription>Proses pengembalian tabung dan aksesoris sewa dari tangan pelanggan ke gudang.</CardDescription>
            </div>
            <Button
              className="flex items-center gap-1.5 self-start bg-success text-white hover:bg-success/90"
              onClick={() => setIsReturnDrawerOpen(true)}
              disabled={rentedCylindersForReturn.length === 0}
            >
              <Plus className="w-4 h-4" /> Proses Pengembalian Barang
            </Button>
          </CardHeader>
          <CardContent>
            {rentedCylindersForReturn.length > 0 ? (
              <div className="space-y-4">
                {/* Search & Filter */}
                <div className="flex flex-col sm:flex-row gap-3 mb-4 items-center">
                  <div className="relative w-full sm:flex-1">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Cari ID sewa, nama pelanggan, nomor seri..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="pl-9 pr-4 h-10 w-full text-sm bg-background border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                  <div className="w-full sm:w-44 shrink-0">
                    <Select
                      id="returnTypeFilter"
                      value={typeFilter}
                      onChange={e => setTypeFilter(e.target.value)}
                      options={[
                        { value: 'All', label: 'Semua Tipe' },
                        { value: 'Cylinder', label: 'Tabung Oksigen' },
                        { value: 'Accessory', label: 'Aksesoris Medis' }
                      ]}
                    />
                  </div>
                  <div className="w-full sm:w-44 shrink-0">
                    <Select
                      id="returnStatusFilter"
                      value={statusFilter}
                      onChange={e => setStatusFilter(e.target.value)}
                      options={[
                        { value: 'All', label: 'Semua Status' },
                        { value: 'Active', label: 'Aktif' },
                        { value: 'Overdue', label: 'Overdue (Denda)' }
                      ]}
                    />
                  </div>
                </div>

                {filteredReturns.length > 0 ? (
                  <div className="space-y-4">
                    <p className="text-xs text-amber-600 font-bold bg-amber-500/10 p-3 rounded-lg border border-amber-500/20">
                      {(() => {
                        const accCount = rentedCylindersForReturn.filter(r => isAccessoryAsset(r.cylinderSerial || '', r.cylinderSize || '')).length;
                        const cylCount = rentedCylindersForReturn.length - accCount;
                        return `⚠️ Terdapat ${rentedCylindersForReturn.length} barang sewa aktif (${cylCount} tabung, ${accCount} aksesoris) yang belum dikembalikan oleh pelanggan.`;
                      })()}
                    </p>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID Sewa</TableHead>
                          <TableHead>Pelanggan</TableHead>
                          <TableHead>Tipe</TableHead>
                          <TableHead>Barang / Serial</TableHead>
                          <TableHead>Tanggal Pinjam</TableHead>
                          <TableHead>Uang Deposit</TableHead>
                          <TableHead>Status Kontrak</TableHead>
                          <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredReturns.map(r => {
                          const cust = customers.find(c => c.id === r.customerId);
                          const isAcc = isAccessoryAsset(r.cylinderSerial || '', r.cylinderSize || '');
                          return (
                            <TableRow key={r.id}>
                              <TableCell className="font-bold text-foreground">{r.id}</TableCell>
                              <TableCell>{cust ? cust.name : 'Unknown'}</TableCell>
                              <TableCell>
                                <Badge variant={isAcc ? 'secondary' : 'success'}>
                                  {isAcc ? 'Aksesoris' : 'Tabung'}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-semibold text-foreground">
                                {r.cylinderSerial || r.cylinderId}
                              </TableCell>
                              <TableCell>{r.rentDate}</TableCell>
                              <TableCell>{formatRupiah(r.deposit)}</TableCell>
                              <TableCell>
                                <Badge variant={r.status === 'Overdue' ? 'destructive' : 'success'}>
                                  {r.status === 'Overdue' ? 'Overdue (Denda)' : 'Aktif'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-xs text-primary"
                                  onClick={() => {
                                    setReturnForm(prev => ({ ...prev, rentalId: r.id }));
                                    setIsReturnDrawerOpen(true);
                                  }}
                                >
                                  Log Kembali
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="py-12 text-center text-xs text-muted-foreground bg-muted/20 rounded-lg border border-dashed border-border">
                    Tidak ada pengembalian aktif yang cocok dengan filter atau pencarian Anda.
                  </div>
                )}
              </div>
            ) : (
              <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                <h3 className="text-base font-bold text-foreground">Semua Tabung & Aksesoris Aman</h3>
                <p className="text-xs text-muted-foreground max-w-sm">
                  Tidak ada tabung atau aksesoris sewa yang aktif saat ini. Semua aset sewa berada di dalam gudang.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* 3. KASIR POS TAB */}
      {/* ----------------------------------------------------------------- */}
      {activeTab === 'sales' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* POS Cart selection (left) */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Kasir Point of Sales (POS)</CardTitle>
                <CardDescription>Pilih aksesoris medis medis untuk pelanggan langsung.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                
                {/* Select/Input Customer */}
                <div className="space-y-1.5 w-full">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Pelanggan POS
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setPosCustomerMode(posCustomerMode === 'select' ? 'input' : 'select');
                        setPosCustomer('');
                        setPosCustomerName('');
                      }}
                      className="text-xs text-primary hover:underline font-medium cursor-pointer flex items-center gap-1"
                    >
                      {posCustomerMode === 'select' ? (
                        <>
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Ketik Nama Manual</span>
                        </>
                      ) : (
                        <>
                          <Database className="w-3.5 h-3.5" />
                          <span>Pilih dari Daftar</span>
                        </>
                      )}
                    </button>
                  </div>
                  
                  {posCustomerMode === 'select' ? (
                    <Select
                      id="posCust"
                      value={posCustomer}
                      onChange={e => setPosCustomer(e.target.value)}
                      options={[
                        { value: '', label: '-- Pilih Pelanggan Ritel --' },
                        ...customers.map(c => ({ value: c.id, label: `${c.id} - ${c.name}` }))
                      ]}
                    />
                  ) : (
                    <Input
                      id="posCustName"
                      placeholder="Masukkan nama pelanggan baru / ritel..."
                      value={posCustomerName}
                      onChange={e => setPosCustomerName(e.target.value)}
                    />
                  )}
                </div>

                {/* Select Product Item */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end border-t border-border pt-4">
                  <div className="sm:col-span-2">
                    <Select
                      label="Pilih Produk Ritel"
                      id="posProd"
                      value={posProduct}
                      onChange={e => setPosProduct(e.target.value)}
                      options={[
                        { value: '', label: '-- Pilih Barang Ritel --' },
                        ...products.map(p => ({ value: p.id, label: `${p.name} (Stok: ${p.stock} pcs) - ${formatRupiah(p.price)}` }))
                      ]}
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="w-20">
                      <Input
                        label="Qty"
                        id="posQty"
                        type="number"
                        min="1"
                        value={posQty}
                        onChange={e => setPosQty(e.target.value)}
                      />
                    </div>
                    <Button type="button" className="flex-1" onClick={handleAddPosCart}>
                      <Plus className="w-4 h-4 mr-1" /> Tambah
                    </Button>
                  </div>
                </div>

                {/* Cart list table */}
                <div className="border border-border/80 rounded-xl overflow-hidden mt-4">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-muted font-bold">
                      <tr>
                        <th className="p-3">Nama Produk</th>
                        <th className="p-3 text-center">Harga Satuan</th>
                        <th className="p-3 text-center">Qty</th>
                        <th className="p-3 text-center">Total</th>
                        <th className="p-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {posCart.length > 0 ? (
                        posCart.map(item => (
                          <tr key={item.productId} className="hover:bg-muted/10">
                            <td className="p-3 font-semibold text-foreground">{item.name}</td>
                            <td className="p-3 text-center">{formatRupiah(item.price)}</td>
                            <td className="p-3 text-center font-bold">{item.qty}</td>
                            <td className="p-3 text-center font-bold text-foreground">{formatRupiah(item.price * item.qty)}</td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() => handleRemovePosCart(item.productId)}
                                className="text-rose-500 hover:text-rose-700 cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="p-6 text-center text-muted-foreground">
                            Keranjang POS kosong. Silakan tambahkan barang di atas.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

              </CardContent>
            </Card>
          </div>

          {/* Checkout Panel (right) */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Ringkasan Pembayaran</CardTitle>
                <CardDescription>Rincian nominal struk thermal kasir.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center text-xs pb-3 border-b border-border/60">
                  <span className="text-muted-foreground">Subtotal Item</span>
                  <span className="font-semibold text-foreground">{posCart.length} jenis produk</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold py-2 text-foreground">
                  <span>Total Tagihan</span>
                  <span className="text-emerald-500">{formatRupiah(posTotal)}</span>
                </div>

                <Select
                  label="Metode Pembayaran"
                  id="posPay"
                  value={posPaymentMethod}
                  onChange={e => setPosPaymentMethod(e.target.value as any)}
                  options={[
                    { value: 'Tunai', label: 'Tunai' },
                    { value: 'QRIS', label: 'QRIS' },
                    { value: 'Transfer', label: 'Transfer' }
                  ]}
                />

                <Select
                  label="Tipe Layanan"
                  id="posServiceType"
                  value={posServiceType}
                  onChange={e => setPosServiceType(e.target.value as any)}
                  options={[
                    { value: 'Kios', label: 'Ambil di Kios' },
                    { value: 'Antar', label: 'Kirim / Antar Alamat' }
                  ]}
                />

                <Button
                  className="w-full mt-4 flex items-center justify-center gap-1.5"
                  disabled={posCart.length === 0 || isSaving}
                  onClick={handleCheckoutPOS}
                >
                  {isSaving ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Memproses...</span>
                    </div>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" /> Bayar & Cetak Struk
                    </>
                  )}
                </Button>



              </CardContent>
            </Card>
          </div>

        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* 4. RESTOCK SUPPLIER TAB */}
      {/* ----------------------------------------------------------------- */}
      {activeTab === 'restock' && (
        <Card>
          <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <CardTitle>Pengadaan Barang Ritel (Restock)</CardTitle>
              <CardDescription>Kelola pasokan produk baru dari vendor grosir eksternal.</CardDescription>
            </div>
            <Button
              className="flex items-center gap-1.5 self-start bg-primary text-white"
              onClick={() => setIsRestockDrawerOpen(true)}
            >
              <Plus className="w-4 h-4" /> Beli Restock Baru
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID Restock</TableHead>
                  <TableHead>Nama Supplier</TableHead>
                  <TableHead>Jumlah Item</TableHead>
                  <TableHead>Total Biaya Pengadaan</TableHead>
                  <TableHead>Tanggal Transaksi</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions
                  .filter(t => t.type === 'Purchase')
                  .slice(0, 10)
                  .map(tx => {
                    const matchedVendor = vendors.find(v => tx.description.toLowerCase().includes(v.companyName.toLowerCase()));
                    return (
                      <TableRow key={tx.id}>
                        <TableCell className="font-bold text-foreground">{tx.id}</TableCell>
                        <TableCell>{matchedVendor ? matchedVendor.companyName : 'PT Supplier Gas Medika'}</TableCell>
                        <TableCell>Logistik & Aksesoris</TableCell>
                        <TableCell className="font-bold text-rose-500">{formatRupiah(tx.amount)}</TableCell>
                        <TableCell>{tx.date}</TableCell>
                        <TableCell>
                          <Badge variant="warning">Restock</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">Selesai</Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* 5. VENDOR REFILL TAB */}
      {/* ----------------------------------------------------------------- */}
      {activeTab === 'refill' && (
        <Card>
          <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <CardTitle>Antrean Refill Gas Tabung</CardTitle>
              <CardDescription>Kirim tabung kosong ke pabrik pengisian gas oksigen industri mitra.</CardDescription>
            </div>
            <Button
              className="flex items-center gap-1.5 self-start bg-blue-600 text-white hover:bg-blue-700"
              onClick={() => setIsRefillDrawerOpen(true)}
              disabled={emptyCylinders.length === 0}
            >
              <RefreshCw className="w-4 h-4" /> Kirim Tabung Isi Ulang
            </Button>
          </CardHeader>
          <CardContent>
            {refills.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID Refill</TableHead>
                    <TableHead>Pabrik Refill (Vendor)</TableHead>
                    <TableHead>Tabung Oksigen</TableHead>
                    <TableHead>Tanggal Kirim</TableHead>
                    <TableHead>Tanggal Selesai</TableHead>
                    <TableHead>Ongkos Isi Ulang</TableHead>
                    <TableHead className="whitespace-nowrap">Status Antrean</TableHead>
                    <TableHead className="text-right whitespace-nowrap">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {refills.map(ref => {
                    const vend = vendors.find(v => v.id === ref.vendorId);
                    return (
                      <TableRow key={ref.id}>
                        <TableCell className="font-bold text-foreground">{ref.id}</TableCell>
                        <TableCell>{vend ? vend.companyName : 'Unknown'}</TableCell>
                        <TableCell className="font-semibold text-foreground">{ref.cylinderId}</TableCell>
                        <TableCell>{ref.sendDate}</TableCell>
                        <TableCell>{ref.returnDate || '-'}</TableCell>
                        <TableCell>{formatRupiah(ref.cost)}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          <Badge variant={ref.status === 'Sent' ? 'warning' : 'success'} className="whitespace-nowrap">
                            {ref.status === 'Sent' ? 'Sedang Antre' : 'Diterima'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          {ref.status === 'Sent' ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs text-blue-600 whitespace-nowrap"
                              disabled={refillLoadingId !== null}
                              onClick={async () => {
                                setRefillLoadingId(ref.id);
                                try {
                                  await receiveRefill(ref.id, new Date().toISOString().split('T')[0]);
                                  alert('Tabung isi ulang diterima kembali di gudang!');
                                } catch (err: any) {
                                  alert(err.message || 'Gagal memproses penerimaan refill.');
                                } finally {
                                  setRefillLoadingId(null);
                                }
                              }}
                            >
                              {refillLoadingId === ref.id ? (
                                <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
                                  <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                  <span>Memproses...</span>
                                </div>
                              ) : (
                                'Konfirmasi Selesai'
                              )}
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground font-semibold">Tuntas</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="py-16 text-center text-muted-foreground text-sm">
                Belum ada pengiriman tabung ke vendor refill baru.
              </div>
            )}
          </CardContent>
        </Card>
      )}
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* DRAWERS & MODALS FOR ACTIVE FORMS */}
      {/* ----------------------------------------------------------------- */}
      
      {/* 1. SEWA DRAWER */}
      <Drawer
        isOpen={isRentalDrawerOpen}
        onClose={() => {
          setIsRentalDrawerOpen(false);
          setRentIsNewCustomer(false);
          setRentNewCustName('');
          setRentNewCustPhone('');
          setRentNewCustAddress('');
        }}
        title={activeTab === 'accessory-rental' ? "Buat Kontrak Sewa Aksesoris" : "Buat Kontrak Sewa Tabung"}
      >
        <form onSubmit={handleRentalSubmit} className="space-y-4">
          {/* Select/Input Customer Toggle */}
          <div className="space-y-1.5 w-full">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Pelanggan *
              </label>
              <button
                type="button"
                onClick={() => {
                  setRentIsNewCustomer(!rentIsNewCustomer);
                  setRentalForm(prev => ({ ...prev, customerId: '' }));
                  setRentNewCustName('');
                  setRentNewCustPhone('');
                  setRentNewCustAddress('');
                }}
                className="text-xs text-primary hover:underline font-medium cursor-pointer flex items-center gap-1"
              >
                {rentIsNewCustomer ? (
                  <>
                    <Database className="w-3.5 h-3.5" />
                    <span>Pilih dari Daftar</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Pelanggan Baru</span>
                  </>
                )}
              </button>
            </div>
            
            {rentIsNewCustomer ? (
              <div className="space-y-3 bg-muted/20 p-3 rounded-lg border border-border/80">
                <Input
                  label="Nama Lengkap *"
                  id="rentNewCustName"
                  placeholder="e.g. Budi Santoso"
                  value={rentNewCustName}
                  onChange={e => setRentNewCustName(e.target.value)}
                  required
                />
                <Input
                  label="WhatsApp / No Telp *"
                  id="rentNewCustPhone"
                  placeholder="e.g. 08123456789"
                  value={rentNewCustPhone}
                  onChange={e => setRentNewCustPhone(e.target.value)}
                  required
                />
                <Textarea
                  label="Alamat Lengkap Pengiriman *"
                  id="rentNewCustAddress"
                  placeholder="Alamat rumah / lokasi pengiriman tabung..."
                  value={rentNewCustAddress}
                  onChange={e => setRentNewCustAddress(e.target.value)}
                  required
                />
              </div>
            ) : (
              <Select
                id="drawRentCust"
                value={rentalForm.customerId}
                onChange={e => setRentalForm({ ...rentalForm, customerId: e.target.value })}
                options={[
                  { value: '', label: '-- Pilih Pelanggan --' },
                  ...customers.map(c => ({ value: c.id, label: `${c.id} - ${c.name}` }))
                ]}
              />
            )}
          </div>
          <div className="space-y-1.5 w-full">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {activeTab === 'accessory-rental' ? "Pilih Aksesoris *" : "Pilih Tabung Oksigen *"}
              </label>
              {activeTab === 'rental' && (
                <button
                  type="button"
                  onClick={() => {
                    setRentIsNewCylinder(!rentIsNewCylinder);
                    setRentalForm(prev => ({ ...prev, cylinderId: '' }));
                    setRentNewCylinderSerialNo('');
                    setRentNewCylinderSize('1m3');
                  }}
                  className="text-xs text-primary hover:underline font-medium cursor-pointer flex items-center gap-1"
                >
                  {rentIsNewCylinder ? (
                    <>
                      <Database className="w-3.5 h-3.5" />
                      <span>Pilih dari Daftar</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tabung Baru</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {rentIsNewCylinder && activeTab === 'rental' ? (
              <div className="space-y-3 bg-muted/20 p-3 rounded-lg border border-border/80">
                <Input
                  label="Nomor Serial Tabung (SN) *"
                  id="rentNewCylinderSerialNo"
                  placeholder="e.g. SN-OX-9999"
                  value={rentNewCylinderSerialNo}
                  onChange={e => setRentNewCylinderSerialNo(e.target.value)}
                  required
                />
                <Select
                  label="Ukuran Volume Tabung *"
                  id="rentNewCylinderSize"
                  value={rentNewCylinderSize}
                  onChange={e => setRentNewCylinderSize(e.target.value as any)}
                  options={[
                    { value: '1m3', label: '1 m³' },
                    { value: '2m3', label: '2 m³' },
                    { value: '6m3', label: '6 m³' }
                  ]}
                />
              </div>
            ) : (
              <Select
                id="drawRentCyl"
                value={rentalForm.cylinderId}
                onChange={e => setRentalForm({ ...rentalForm, cylinderId: e.target.value })}
                options={[
                  { value: '', label: activeTab === 'accessory-rental' ? '-- Pilih Aksesoris --' : '-- Pilih Tabung --' },
                  ...cylinders
                    .filter(c => {
                      const isAcc = isAccessoryAsset(c.serialNo, c.size);
                      return activeTab === 'accessory-rental' ? isAcc : !isAcc;
                    })
                    .map(c => {
                      const statusLabel = c.status === 'Available' ? 'Tersedia' : c.status;
                      return {
                        value: c.id,
                        label: `${c.serialNo} (${c.size}) - [${statusLabel}]`,
                        disabled: c.status !== 'Available'
                      };
                    })
                ]}
              />
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Tanggal Pinjam *"
              id="drawRentDate"
              type="date"
              value={rentalForm.rentDate}
              onChange={e => setRentalForm({ ...rentalForm, rentDate: e.target.value })}
            />
            <Input
              label="Batas Kembali *"
              id="drawReturnDate"
              type="date"
              value={rentalForm.returnDate}
              onChange={e => setRentalForm({ ...rentalForm, returnDate: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Jaminan (Deposit) (Rp)"
              id="drawRentDep"
              isRupiah={true}
              value={rentalForm.deposit}
              onChange={e => setRentalForm({ ...rentalForm, deposit: e.target.value })}
            />
            <Input
              label="Tarif Sewa (Rp)"
              id="drawRentFee"
              isRupiah={true}
              value={rentalForm.rentalFee}
              onChange={e => setRentalForm({ ...rentalForm, rentalFee: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Metode Pembayaran *"
              id="drawRentPay"
              value={rentalForm.paymentMethod || 'Tunai'}
              onChange={e => setRentalForm({ ...rentalForm, paymentMethod: e.target.value as any })}
              options={[
                { value: 'Tunai', label: 'Tunai' },
                { value: 'QRIS', label: 'QRIS' },
                { value: 'Transfer', label: 'Transfer' }
              ]}
            />
            <Select
              label="Tipe Layanan *"
              id="drawRentServiceType"
              value={rentalForm.serviceType || 'Kios'}
              onChange={e => setRentalForm({ ...rentalForm, serviceType: e.target.value as any })}
              options={[
                { value: 'Kios', label: 'Ambil di Kios' },
                { value: 'Antar', label: 'Kirim / Antar Alamat' }
              ]}
            />
          </div>
          <div className="border-t border-border pt-4 flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setIsRentalDrawerOpen(false)} disabled={isSaving}>Kembali</Button>
            <Button type="submit" className="flex-1" disabled={isSaving}>
              {isSaving ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Memproses...</span>
                </div>
              ) : (
                'Buat Sewa'
              )}
            </Button>
          </div>
        </form>
      </Drawer>

      {/* 2. PENGEMBALIAN DRAWER */}
      <Drawer isOpen={isReturnDrawerOpen} onClose={() => setIsReturnDrawerOpen(false)} title="Logistik Penerimaan Kembali">
        <form onSubmit={handleReturnSubmit} className="space-y-4">
          <Select
            label="Pilih ID Sewa Aktif *"
            id="drawRetId"
            value={returnForm.rentalId}
            onChange={e => setReturnForm({ ...returnForm, rentalId: e.target.value })}
            options={[
              { value: '', label: '-- Pilih Kontrak Aktif --' },
              ...rentedCylindersForReturn.map(r => {
                const c = customers.find(cust => cust.id === r.customerId);
                const isAcc = isAccessoryAsset(r.cylinderSerial || '');
                return { 
                  value: r.id, 
                  label: `${isAcc ? '[AKSESORIS]' : '[TABUNG]'} ${r.id} - ${c ? c.name : 'Unknown'} (${r.cylinderSerial || r.cylinderId})` 
                };
              })
            ]}
          />
          <Input
            label="Tanggal Dikembalikan *"
            id="drawRetDate"
            type="date"
            value={returnForm.returnDate}
            onChange={e => setReturnForm({ ...returnForm, returnDate: e.target.value })}
          />
          <Select
            label={(() => {
              const selectedRent = rentals.find(r => r.id === returnForm.rentalId);
              return (selectedRent && isAccessoryAsset(selectedRent.cylinderSerial || ''))
                ? "Kondisi Akhir Aksesoris *"
                : "Kondisi Akhir Tabung Baja *";
            })()}
            id="drawRetCond"
            value={returnForm.condition}
            onChange={e => setReturnForm({ ...returnForm, condition: e.target.value as any })}
            options={[
              { value: 'Available', label: 'Bagus / Siap Pakai Kembali' },
              { value: 'Maintenance', label: 'Rusak / Butuh Perbaikan' }
            ]}
          />
          <p className="text-4xs text-muted-foreground bg-muted/40 p-2.5 rounded-lg border border-border">
            * Jaminan (deposit) sewa akan secara otomatis dikembalikan kepada saldo cash pelanggan saat pengembalian diproses.
          </p>
          <div className="border-t border-border pt-4 flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setIsReturnDrawerOpen(false)} disabled={isSaving}>Batal</Button>
            <Button type="submit" className="flex-1 bg-success text-white" disabled={isSaving}>
              {isSaving ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Memproses...</span>
                </div>
              ) : (
                'Log Kembali'
              )}
            </Button>
          </div>
        </form>
      </Drawer>

      {/* 3. REFILL VENDOR DRAWER */}
      <Drawer isOpen={isRefillDrawerOpen} onClose={() => setIsRefillDrawerOpen(false)} title="Kirim Tabung Refill Gas">
        <form onSubmit={handleRefillSubmit} className="space-y-4">
          <Select
            label="Pilih Tabung Kosong di Gudang *"
            id="drawRefCyl"
            value={refillForm.cylinderId}
            onChange={e => setRefillForm({ ...refillForm, cylinderId: e.target.value })}
            options={[
              { value: '', label: '-- Pilih Tabung --' },
              ...cylinders.map(c => {
                let statusLabel = 'Tersedia';
                if (c.status === 'Rented') statusLabel = 'Sedang Disewa';
                if (c.status === 'At Vendor') statusLabel = 'Di Pabrik Vendor';
                if (c.status === 'Maintenance') statusLabel = 'Perawatan';
                if (c.status === 'Empty') statusLabel = 'Kosong';
                
                const canRefill = c.status === 'Empty' || c.status === 'Maintenance';
                return {
                  value: c.id,
                  label: `${c.serialNo} (${c.size}) - [${statusLabel}]`,
                  disabled: !canRefill
                };
              })
            ]}
          />
          <div className="space-y-1.5 w-full">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Pilih Mitra Vendor Refill *
              </label>
              <button
                type="button"
                onClick={() => {
                  setRefillIsNewVendor(!refillIsNewVendor);
                  setRefillForm(prev => ({ ...prev, vendorId: '' }));
                  setRefillNewVendorCompanyName('');
                  setRefillNewVendorPhone('');
                  setRefillNewVendorAddress('');
                }}
                className="text-xs text-primary hover:underline font-medium cursor-pointer flex items-center gap-1"
              >
                {refillIsNewVendor ? (
                  <>
                    <Database className="w-3.5 h-3.5" />
                    <span>Pilih dari Daftar</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Mitra Vendor Baru</span>
                  </>
                )}
              </button>
            </div>

            {refillIsNewVendor ? (
              <div className="space-y-3 bg-muted/20 p-3 rounded-lg border border-border/80">
                <Input
                  label="Nama Perusahaan Vendor *"
                  id="refillNewVendorCompanyName"
                  placeholder="e.g. CV Oksigen Utama"
                  value={refillNewVendorCompanyName}
                  onChange={e => setRefillNewVendorCompanyName(e.target.value)}
                  required
                />
                <Input
                  label="WhatsApp / No Telp *"
                  id="refillNewVendorPhone"
                  placeholder="e.g. 08123456789"
                  value={refillNewVendorPhone}
                  onChange={e => setRefillNewVendorPhone(e.target.value)}
                  required
                />
                <Textarea
                  label="Alamat Lengkap Vendor"
                  id="refillNewVendorAddress"
                  placeholder="Alamat kantor / pabrik pengisian..."
                  value={refillNewVendorAddress}
                  onChange={e => setRefillNewVendorAddress(e.target.value)}
                />
              </div>
            ) : (
              <Select
                id="drawRefVend"
                value={refillForm.vendorId}
                onChange={e => setRefillForm({ ...refillForm, vendorId: e.target.value })}
                options={[
                  { value: '', label: '-- Pilih Pabrik Vendor --' },
                  ...vendors.map(v => ({ value: v.id, label: v.companyName }))
                ]}
              />
            )}
          </div>
          <Input
            label="Biaya Pengisian Oksigen (Rp)"
            id="drawRefCost"
            isRupiah={true}
            placeholder="e.g. 50000"
            value={refillForm.cost}
            onChange={e => setRefillForm({ ...refillForm, cost: e.target.value })}
          />
          <Input
            label="Tanggal Pengiriman Logistik *"
            id="drawRefSend"
            type="date"
            value={refillForm.sendDate}
            onChange={e => setRefillForm({ ...refillForm, sendDate: e.target.value })}
          />
          <div className="border-t border-border pt-4 flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setIsRefillDrawerOpen(false)} disabled={isSaving}>Batal</Button>
            <Button type="submit" className="flex-1 bg-blue-600 text-white" disabled={isSaving}>
              {isSaving ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Memproses...</span>
                </div>
              ) : (
                'Kirim Refill'
              )}
            </Button>
          </div>
        </form>
      </Drawer>

      {/* 4. RESTOCK SUPPLIER DRAWER */}
      <Drawer isOpen={isRestockDrawerOpen} onClose={() => setIsRestockDrawerOpen(false)} title="Pengadaan Restock Grosir">
        <div className="space-y-4">
          <Select
            label="Pilih Vendor Supplier *"
            id="drawRestVend"
            value={restockVendor}
            onChange={e => setRestockVendor(e.target.value)}
            options={[
              { value: '', label: '-- Pilih Vendor Supplier --' },
              ...vendors.map(v => ({ value: v.id, label: v.companyName }))
            ]}
          />
          
          <div className="border-t border-border pt-3">
            <p className="text-3xs font-bold text-muted-foreground uppercase mb-2">Keranjang Restock</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-end">
              <Select
                label="Pilih Produk"
                id="drawRestProd"
                value={restockProduct}
                onChange={e => setRestockProduct(e.target.value)}
                options={[
                  { value: '', label: '-- Pilih Barang --' },
                  ...products.map(p => ({ value: p.id, label: `${p.name} (Modal: ${formatRupiah(p.cost)})` }))
                ]}
              />
              <div className="flex gap-2">
                <Input
                  label="Qty"
                  id="drawRestQty"
                  type="number"
                  min="1"
                  value={restockQty}
                  onChange={e => setRestockQty(e.target.value)}
                />
                <Button type="button" className="self-end h-10" onClick={handleAddRestockCart}>+</Button>
              </div>
            </div>
          </div>

          <div className="border border-border rounded-lg max-h-36 overflow-y-auto text-2xs p-2 space-y-2 mt-2 bg-muted/20">
            {restockCart.length > 0 ? (
              restockCart.map(item => (
                <div key={item.itemId} className="flex justify-between items-center">
                  <span>{item.name} (x{item.qty})</span>
                  <div className="flex items-center gap-3">
                    <span className="font-bold">{formatRupiah(item.cost * item.qty)}</span>
                    <button onClick={() => handleRemoveRestockCart(item.itemId)} className="text-rose-500 hover:underline">Hapus</button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center py-4 text-muted-foreground">Keranjang restock supplier kosong.</p>
            )}
          </div>

          <div className="flex justify-between items-center text-xs border-t border-border pt-3 font-bold text-foreground">
            <span>Total Tagihan Grosir</span>
            <span className="text-emerald-500">{formatRupiah(restockTotal)}</span>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setIsRestockDrawerOpen(false)} disabled={isSaving}>Batal</Button>
            <Button type="button" className="flex-1" disabled={restockCart.length === 0 || !restockVendor || isSaving} onClick={handleCheckoutRestock}>
              {isSaving ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Memproses...</span>
                </div>
              ) : (
                'Beli Restock'
              )}
            </Button>
          </div>
        </div>
      </Drawer>

      {/* 5. INVOICE PREVIEW MODAL */}
      {isPrintOpen && selectedRental && (
        <Drawer isOpen={isPrintOpen} onClose={() => setIsPrintOpen(false)} title="Invoice Persewaan">
          <div className="printable-invoice-card p-4 bg-white text-zinc-900 font-sans border rounded-xl shadow-xs text-xs space-y-4">
            
            {/* Header */}
            <div className="flex justify-between items-start border-b pb-4">
              <div className="flex items-center gap-3">
                <img src="/logo-full-removebg-preview.png" alt="Logo" className="h-10 w-auto object-contain" />
                <div>
                  <h3 className="text-sm font-bold tracking-tight">Oksigen Medis 24 Jam</h3>
                  <p className="text-5xs text-zinc-500 mt-0.5">Dusun Sembon, Sembon, Kec. Karangrejo, Tulungagung • Telp: 0858-6697-2209</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-3xs font-extrabold uppercase bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">INVOICE</span>
                <p className="text-[10px] font-mono mt-1">NO: {selectedRental.id}</p>
              </div>
            </div>

            {/* Customer Details */}
            <div className="grid grid-cols-2 gap-4 text-4xs">
              <div>
                <p className="font-bold text-zinc-500">DITAGIHKAN KEPADA:</p>
                <p className="font-bold text-zinc-900 mt-1">{customers.find(c => c.id === selectedRental.customerId)?.name || 'Pelanggan Mandiri'}</p>
                <p className="text-zinc-500 mt-0.5">{customers.find(c => c.id === selectedRental.customerId)?.address}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-zinc-500">TANGGAL PINJAM:</p>
                <p className="font-bold text-zinc-900 mt-1">{selectedRental.rentDate}</p>
                <p className="font-bold text-zinc-500 mt-1">BATAS KEMBALI:</p>
                <p className="font-bold text-zinc-900 mt-1">{selectedRental.returnDate}</p>
              </div>
            </div>

            {/* Rental details table */}
            <table className="w-full text-zinc-900 text-[10px] border-y border-zinc-200">
              <thead>
                <tr className="border-b font-bold text-zinc-500">
                  <th className="py-2 text-left">Deskripsi Produk</th>
                  <th className="py-2 text-center">Unit / SN</th>
                  <th className="py-2 text-right">Biaya Sewa</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2">
                    <p className="font-bold">
                      {isAccessoryAsset(selectedRental.cylinderSerial || '') ? 'Rental Aksesoris Medis' : 'Rental Tabung Oksigen Medis'}
                    </p>
                    <p className="text-5xs text-zinc-400">
                      {isAccessoryAsset(selectedRental.cylinderSerial || '') ? 'Peralatan & Pendukung Medis' : 'Purity Grade: 99.5% Medical Standard'}
                    </p>
                  </td>
                  <td className="py-2 text-center font-mono">{selectedRental.cylinderSerial || selectedRental.cylinderId}</td>
                  <td className="py-2 text-right">{formatRupiah(selectedRental.rentalFee)}</td>
                </tr>
                <tr>
                  <td className="py-2" colSpan={2}>
                    <p className="font-bold text-zinc-600">Uang Jaminan Kontrak (Deposit)</p>
                    <p className="text-5xs text-zinc-400">* Dikembalikan penuh saat barang kembali ke gudang</p>
                  </td>
                  <td className="py-2 text-right font-bold">{formatRupiah(selectedRental.deposit)}</td>
                </tr>
              </tbody>
            </table>

            {/* Total */}
            <div className="flex justify-between items-center text-xs font-bold pt-2">
              <span className="text-zinc-500">TOTAL PEMBAYARAN KONTRAK</span>
              <span className="text-emerald-600">{formatRupiah(selectedRental.rentalFee + selectedRental.deposit)}</span>
            </div>

            <div className="text-[9px] text-zinc-400 text-center border-t pt-4">
              Terima kasih atas kepercayaan Anda. Layanan Oksigen Medis 24 Jam Bandung.
            </div>

            <Button
              className="w-full text-white bg-emerald-600 mt-2 text-3xs py-1.5"
              onClick={() => {
                window.print();
              }}
            >
              Print Cetak Fisik
            </Button>
          </div>
        </Drawer>
      )}

      {/* 5b. COMPLETED POS INVOICE DRAWER */}
      {completedSaleInvoice && (
        <Drawer isOpen={!!completedSaleInvoice} onClose={() => setCompletedSaleInvoice(null)} title="Nota Penjualan POS">
          <div className="printable-invoice-card p-6 bg-white text-zinc-900 font-sans border rounded-xl shadow-xs text-xs space-y-4 max-w-sm mx-auto">
            {/* Completion Success Header */}
            <div className="flex flex-col items-center justify-center text-center space-y-2 pb-4 border-b border-zinc-100 no-print">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-emerald-600 text-sm">Pembayaran Berhasil!</h4>
              <p className="text-[10px] text-zinc-400">Transaksi ritel kasir POS telah tersimpan di database.</p>
            </div>

            {/* Receipt Details (matches thermal receipt style) */}
            <div className="space-y-3 font-mono text-xs">
              <div className="text-center space-y-1.5">
                <img src="/logo-full-removebg-preview.png" alt="Logo" className="h-12 w-auto mx-auto object-contain" />
                <h3 className="font-bold text-sm tracking-tight">Oksigen Medis 24 Jam</h3>
                <p className="text-[9px] text-zinc-500 mt-0.5">Dusun Sembon, Sembon, Kec. Karangrejo, Tulungagung • Telp: 0858-6697-2209</p>
              </div>

              <hr className="border-dashed border-zinc-300" />
              
              <div className="space-y-1 text-[10px] text-zinc-600">
                <div className="flex justify-between">
                  <span>No. Nota:</span>
                  <span className="font-bold text-zinc-900">{completedSaleInvoice.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tanggal:</span>
                  <span>{completedSaleInvoice.date}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pelanggan:</span>
                  <span className="font-bold text-zinc-900">{customers.find(c => c.id === completedSaleInvoice.customerId)?.name || 'Pelanggan Ritel'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pembayaran:</span>
                  <span className="font-bold text-zinc-900 uppercase">{completedSaleInvoice.paymentMethod}</span>
                </div>
              </div>

              <hr className="border-dashed border-zinc-300" />

              {/* Items List */}
              <div className="space-y-2 text-[10px]">
                {completedSaleInvoice.items.map((it: any) => (
                  <div key={it.productId} className="space-y-0.5">
                    <div className="flex justify-between text-zinc-900">
                      <span className="font-semibold">{it.name}</span>
                      <span>{formatRupiah(it.price * it.qty)}</span>
                    </div>
                    <div className="flex justify-between text-zinc-500 text-[9px]">
                      <span>{it.qty} x {formatRupiah(it.price)}</span>
                    </div>
                  </div>
                ))}
              </div>

              <hr className="border-dashed border-zinc-300" />

              {/* Grand Total */}
              <div className="flex justify-between items-center text-xs font-bold text-zinc-900 pt-1">
                <span>TOTAL</span>
                <span className="text-sm font-extrabold text-emerald-600">{formatRupiah(completedSaleInvoice.amount)}</span>
              </div>
            </div>

            <div className="text-[9px] text-zinc-400 text-center pt-2">
              Terima kasih atas kunjungan Anda.
            </div>

            {/* Print trigger button */}
            <div className="flex gap-3 pt-4 border-t border-zinc-100 no-print">
              <Button
                variant="outline"
                className="flex-1 text-xs"
                onClick={() => setCompletedSaleInvoice(null)}
              >
                Tutup
              </Button>
              <Button
                className="flex-1 text-white bg-blue-600 text-xs"
                onClick={() => window.print()}
              >
                Cetak Nota / Struk
              </Button>
            </div>
          </div>
        </Drawer>
      )}

      {/* 6. DETAIL RENTAL MODAL */}
      {isDetailOpen && selectedRental && (
        <Drawer isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} title="Detail Transaksi Sewa">
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase">Informasi Penyewaan</p>
              <div className="mt-2 space-y-2 p-3 bg-muted/20 border border-border rounded-xl text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ID Rental</span>
                  <span className="font-bold text-foreground">{selectedRental.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pelanggan</span>
                  <span className="font-semibold text-foreground">
                    {customers.find(c => c.id === selectedRental.customerId)?.name || 'Unknown'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ID Tabung Baja</span>
                  <span className="font-semibold text-foreground">{selectedRental.cylinderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tanggal Sewa</span>
                  <span>{selectedRental.rentDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Batas Jatuh Tempo</span>
                  <span>{selectedRental.returnDate}</span>
                </div>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase">Rincian Finansial</p>
              <div className="mt-2 space-y-2 p-3 bg-muted/20 border border-border rounded-xl text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Uang Jaminan (Deposit)</span>
                  <span className="font-bold text-foreground">{formatRupiah(selectedRental.deposit)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tarif Jasa Sewa</span>
                  <span className="font-bold text-foreground">{formatRupiah(selectedRental.rentalFee)}</span>
                </div>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase">Linimasa Logistik</p>
              <div className="mt-2 border-l border-border pl-4 space-y-4 ml-2 text-xs">
                <div className="relative">
                  <span className="absolute -left-[21px] mt-1 flex h-2.5 w-2.5 rounded-full bg-emerald-500 ring-4 ring-card" />
                  <p className="font-semibold">Kontrak Dibuat & Disetujui</p>
                  <p className="text-4xs text-muted-foreground mt-0.5">{selectedRental.rentDate}</p>
                </div>
                <div className="relative">
                  <span className="absolute -left-[21px] mt-1 flex h-2.5 w-2.5 rounded-full bg-emerald-500 ring-4 ring-card" />
                  <p className="font-semibold">Jaminan Deposit Diterima Kasir</p>
                  <p className="text-4xs text-muted-foreground mt-0.5">{formatRupiah(selectedRental.deposit)} • Tunai</p>
                </div>
                <div className="relative">
                  <span className={`absolute -left-[21px] mt-1 flex h-2.5 w-2.5 rounded-full ring-4 ring-card ${selectedRental.status === 'Returned' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                  <p className="font-semibold">
                    {selectedRental.status === 'Returned' ? 'Tabung Diterima Kembali di Gudang' : 'Tabung Berada di Tangan Pelanggan'}
                  </p>
                  <p className="text-4xs text-muted-foreground mt-0.5">Status: {selectedRental.status}</p>
                </div>
              </div>
            </div>

            <Button className="w-full mt-4" onClick={() => setIsDetailOpen(false)}>Tutup Detail</Button>
          </div>
        </Drawer>
      )}

    </div>
  );
}
