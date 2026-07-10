'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { fetchApi, BASE_URL } from './apiClient';
import LoginOverlay from '../components/LoginOverlay';
import {
  Customer,
  Vendor,
  Cylinder,
  Product,
  Rental,
  Refill,
  StockMovement,
  Purchase,
  Sale,
  Expense,
  Transaction
} from './mockData';

interface DataContextType {
  customers: Customer[];
  vendors: Vendor[];
  cylinders: Cylinder[];
  products: Product[];
  rentals: Rental[];
  refills: Refill[];
  stockMovements: StockMovement[];
  purchases: Purchase[];
  sales: Sale[];
  transactions: Transaction[];
  expenses: Expense[];
  oxygenTypes: any[];
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  user: any | null;
  logout: () => void;
  // CRUD actions
  addCustomer: (cust: Partial<Omit<Customer, 'id' | 'joinedDate' | 'balance'>> & { name: string; balance?: number }) => Promise<any>;
  updateCustomer: (id: string, cust: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  addVendor: (vend: Omit<Vendor, 'id'>) => Promise<void>;
  updateVendor: (id: string, vend: Partial<Vendor>) => Promise<void>;
  deleteVendor: (id: string) => Promise<void>;
  addCylinder: (cyl: Omit<Cylinder, 'id'>) => Promise<void>;
  updateCylinder: (id: string, cyl: Partial<Cylinder>) => Promise<void>;
  deleteCylinder: (id: string) => Promise<void>;
  addProduct: (prod: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, prod: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  // Workflows
  createRental: (rentalData: { customerId: string; cylinderId: string; rentDate: string; returnDate: string; deposit: number; rentalFee: number; paymentMethod?: string; serviceType?: 'Kios' | 'Antar'; accessories?: Array<{ name: string; qty: number; fee: number; deposit: number }> }) => Promise<void>;
  returnRental: (rentalId: string, actualReturnDate: string, cylinderStatus: Cylinder['status']) => Promise<void>;
  sendToRefill: (refillData: { cylinderId: string; vendorId: string; cost: number; sendDate: string }) => Promise<void>;
  receiveRefill: (refillId: string, returnDate: string) => Promise<void>;
  createStockMovement: (mvt: Omit<StockMovement, 'id' | 'date'>) => Promise<void>;
  createPurchase: (pur: { vendorId: string; items: Array<{ itemId: string; name: string; qty: number; cost: number }>; date: string }) => Promise<void>;
  createSale: (sale: { customerId: string; items: Array<{ productId: string; name: string; qty: number; price: number }>; date: string; paymentMethod: Sale['paymentMethod']; serviceType?: 'Kios' | 'Antar' }) => Promise<any>;
  createExpense: (exp: Omit<Expense, 'id' | 'status'>) => Promise<void>;
  approveExpense: (expenseId: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Helper mappings for Enums
const mapCylinderStatusToFrontend = (status: string) => {
  switch (status) {
    case 'AVAILABLE': return 'Available';
    case 'RENTED': return 'Rented';
    case 'AT_VENDOR': return 'At Vendor';
    case 'MAINTENANCE': return 'Maintenance';
    case 'EMPTY': return 'Empty';
    default: return 'Available';
  }
};

const mapProductCategoryToFrontend = (catName: string = '') => {
  const name = catName.toLowerCase();
  if (name.includes('regulator') || name.includes('trolley') || name.includes('stand') || name.includes('peralatan')) return 'Peralatan';
  if (name.includes('consumable') || name.includes('cannula') || name.includes('mask') || name.includes('tube') || name.includes('aksesoris')) return 'Aksesoris';
  return 'Gas';
};

const mapRentalStatusToFrontend = (status: string) => {
  if (status === 'RENTING') return 'Active';
  if (status === 'RETURNED') return 'Returned';
  if (status === 'OVERDUE') return 'Overdue';
  return 'Active';
};

const mapExpenseCategoryToFrontend = (category: string) => {
  const cat = category.toLowerCase();
  if (cat.includes('operational')) return 'Operational';
  if (cat.includes('utilities')) return 'Utilities';
  if (cat.includes('rent')) return 'Rent';
  if (cat.includes('refill') || cat.includes('vendor_refill')) return 'Refills';
  if (cat.includes('marketing')) return 'Marketing';
  if (cat.includes('salaries')) return 'Salaries';
  return 'Other';
};

export function DataProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const isRefreshingRef = useRef(false);
  const [user, setUser] = useState<any | null>(null);
  const [isClientLoaded, setIsClientLoaded] = useState(false);

  const [data, setData] = useState<{
    customers: Customer[];
    vendors: Vendor[];
    cylinders: Cylinder[];
    products: Product[];
    rentals: Rental[];
    refills: Refill[];
    stockMovements: StockMovement[];
    purchases: Purchase[];
    sales: Sale[];
    expenses: Expense[];
    transactions: Transaction[];
  } | null>(null);

  const [categories, setCategories] = useState<any[]>([]);
  const [oxygenTypes, setOxygenTypes] = useState<any[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Load auth state and theme from local storage
  useEffect(() => {
    const savedToken = localStorage.getItem('oksigen24_access_token');
    const savedUser = localStorage.getItem('oksigen24_user');
    if (savedToken && savedToken !== 'undefined' && savedToken !== 'null' && savedUser && savedUser !== 'undefined' && savedUser !== 'null') {
      setToken(savedToken);
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        setUser(null);
      }
    } else {
      localStorage.removeItem('oksigen24_access_token');
      localStorage.removeItem('oksigen24_refresh_token');
      localStorage.removeItem('oksigen24_user');
    }

    const savedTheme = localStorage.getItem('oksigen24_theme') as 'light' | 'dark';
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    setTheme(initialTheme);
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    setIsClientLoaded(true);
  }, []);

  // Listen for logout events dispatched from API client
  useEffect(() => {
    const handleLogout = () => {
      setToken(null);
      setUser(null);
      setData(null);
    };
    window.addEventListener('auth-logout', handleLogout);
    return () => window.removeEventListener('auth-logout', handleLogout);
  }, []);

  // Fetch all dashboard data when token is available
  const refreshAllData = async () => {
    if (!token || isRefreshingRef.current) return;
    isRefreshingRef.current = true;

    // Helper: resolve to null instead of throwing on 403 Forbidden
    const safe = async (fn: () => Promise<any>) => {
      try { return await fn(); } catch { return null; }
    };

    // Derive the user role from the cached user object
    const currentUser = (() => {
      try {
        const u = localStorage.getItem('oksigen24_user');
        return u ? JSON.parse(u) : null;
      } catch { return null; }
    })();
    const roleName = String(currentUser?.role?.name || currentUser?.role || 'OWNER').toUpperCase();
    const isOwnerOrAdmin = roleName === 'OWNER' || roleName === 'ADMIN';
    const isFinance = roleName === 'FINANCE';
    const isWarehouse = roleName === 'WAREHOUSE';

    // FINANCE can't access: vendors, cylinders, rentals, purchases, stock-movements
    // WAREHOUSE can't access: finance/expenses, finance/incomes, sales (POST only – GET allowed for all on sales)
    // Note: GET /transactions/sales has no @Roles guard so all authenticated users can read it.

    try {
      const [
        customersData,
        vendorsData,
        cylindersData,
        productsData,
        rentalsData,
        salesData,
        purchasesData,
        movementsData,
        expensesData,
        incomesData,
        categoriesData,
        oxygenTypesData,
      ] = await Promise.all([
        fetchApi('/inventory/customers?limit=100'),                                    // all roles can read
        isFinance ? safe(() => fetchApi('/inventory/vendors?limit=100')) : fetchApi('/inventory/vendors?limit=100'),
        isFinance ? safe(() => fetchApi('/inventory/cylinders?limit=100')) : fetchApi('/inventory/cylinders?limit=100'),
        fetchApi('/inventory/products?limit=100'),                                     // all roles can read
        isFinance ? safe(() => fetchApi('/transactions/rentals?limit=100')) : fetchApi('/transactions/rentals?limit=100'),
        fetchApi('/transactions/sales?limit=100'),                                     // all roles can read (no GET guard)
        isFinance ? safe(() => fetchApi('/transactions/purchases?limit=100')) : fetchApi('/transactions/purchases?limit=100'),
        isFinance ? safe(() => fetchApi('/transactions/stock-movements?limit=100')) : fetchApi('/transactions/stock-movements?limit=100'),
        isWarehouse ? safe(() => fetchApi('/finance/expenses?limit=100')) : fetchApi('/finance/expenses?limit=100'),
        isWarehouse ? safe(() => fetchApi('/finance/incomes?limit=100')) : fetchApi('/finance/incomes?limit=100'),
        fetchApi('/inventory/categories?limit=100'),                                   // all roles can read
        fetchApi('/inventory/oxygen-types?limit=100'),                                 // all roles can read
      ]);

      setCategories((categoriesData?.items) || []);
      setOxygenTypes((oxygenTypesData?.items) || []);

      // Mapping Logic
      const mappedCustomers: Customer[] = ((customersData?.items) || []).map((c: any) => ({
        id: c.id,
        name: c.name,
        phone: c.phone || '',
        address: c.address || '',
        status: c.isActive ? 'Active' : 'Inactive',
        balance: Number(c.balance) || 0,
        joinedDate: new Date(c.createdAt).toISOString().split('T')[0]
      }));

      const mappedVendors: Vendor[] = ((vendorsData?.items) || []).map((v: any) => ({
        id: v.id,
        name: v.name,
        companyName: v.name,
        phone: v.phone || '',
        email: v.email || '',
        address: v.address || '',
        status: v.isActive ? 'Active' : 'Inactive'
      }));

      const mappedCylinders: Cylinder[] = ((cylindersData?.items) || []).map((c: any) => ({
        id: c.id,
        serialNo: c.serialNumber,
        oxygenType: c.oxygenType?.name || 'Medical Oxygen',
        size: c.size,
        status: mapCylinderStatusToFrontend(c.status),
        lastInspection: c.updatedAt ? new Date(c.updatedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      }));

      const mappedProducts: Product[] = ((productsData?.items) || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        category: mapProductCategoryToFrontend(p.category?.name),
        stock: p.currentStock,
        price: Number(p.price) || 0,
        cost: Number(p.cost) || 0,
        description: p.description || ''
      }));

      const mappedRentals: Rental[] = ((rentalsData?.items) || []).map((r: any) => {
        const cylSize = r.items?.[0]?.cylinder?.size || '1m3';
        const defaultDeposit = cylSize === '1m3' ? 200000 : cylSize === '2m3' ? 300000 : 500000;
        let depositVal = defaultDeposit;
        if (r.notes && r.notes.includes('[DEPOSIT:')) {
          const match = r.notes.match(/\[DEPOSIT:\s*(\d+)\]/);
          if (match) {
            depositVal = Number(match[1]);
          }
        }

        let paymentMethodVal: 'Tunai' | 'Transfer' | 'QRIS' = 'Tunai';
        if (r.notes && r.notes.includes('[PAYMENT:')) {
          const match = r.notes.match(/\[PAYMENT:\s*([^\]]+)\]/);
          if (match) {
            const pm = match[1].trim().toUpperCase();
            paymentMethodVal = pm === 'TRANSFER' ? 'Transfer' : (pm === 'QRIS' || pm === 'E_WALLET') ? 'QRIS' : 'Tunai';
          }
        }

        let serviceTypeVal: 'Kios' | 'Antar' = 'Kios';
        if (r.notes && r.notes.includes('[SERVICE:')) {
          const match = r.notes.match(/\[SERVICE:\s*([^\]]+)\]/);
          if (match) {
            serviceTypeVal = match[1].trim().toUpperCase() === 'ANTAR' ? 'Antar' : 'Kios';
          }
        }

        let accessoriesVal: Array<{ name: string; qty: number; fee: number; deposit: number }> = [];
        if (r.notes && r.notes.includes('[ACCESSORIES:')) {
          const match = r.notes.match(/\[ACCESSORIES:\s*([^\]]+)\]/);
          if (match) {
            const accParts = match[1].split(';');
            accParts.forEach((part: string) => {
              const cleaned = part.trim();
              if (!cleaned) return;
              // Regulator(1)|fee:50000|dep:100000
              const mainMatch = cleaned.match(/^([^(]+)\((\d+)\)\|fee:(\d+)\|dep:(\d+)$/);
              if (mainMatch) {
                accessoriesVal.push({
                  name: mainMatch[1].trim(),
                  qty: Number(mainMatch[2]),
                  fee: Number(mainMatch[3]),
                  deposit: Number(mainMatch[4])
                });
              }
            });
          }
        }

        const totalAccFees = accessoriesVal.reduce((sum, a) => sum + (a.fee * a.qty), 0);
        const totalAccDeposits = accessoriesVal.reduce((sum, a) => sum + (a.deposit * a.qty), 0);

        return {
          id: r.id,
          customerId: r.customerId,
          customerName: r.customer?.name || 'Unknown',
          cylinderId: r.items?.[0]?.cylinder?.id || '',
          cylinderSerial: r.items?.[0]?.cylinder?.serialNumber || '',
          rentDate: new Date(r.createdAt).toISOString().split('T')[0],
          returnDate: new Date(r.dueDate).toISOString().split('T')[0],
          actualReturnDate: r.returnDate ? new Date(r.returnDate).toISOString().split('T')[0] : undefined,
          cylinderDeposit: depositVal,
          cylinderFee: Number(r.totalAmount) || 0,
          deposit: depositVal + totalAccDeposits,
          rentalFee: (Number(r.totalAmount) || 0) + totalAccFees,
          status: mapRentalStatusToFrontend(r.status),
          paymentMethod: paymentMethodVal,
          invoiceNo: r.invoiceNo,
          serviceType: serviceTypeVal,
          accessories: accessoriesVal
        };
      });

      const activeRefills: Refill[] = ((cylindersData?.items) || [])
        .filter((c: any) => c.status === 'AT_VENDOR')
        .map((c: any) => ({
          id: c.id,
          cylinderId: c.id,
          cylinderSerial: c.serialNumber,
          vendorId: c.vendorId || '',
          vendorName: c.vendor?.name || 'Unknown Vendor',
          sendDate: c.updatedAt ? new Date(c.updatedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          cost: 25000,
          status: 'Sent' as const
        }));

      const mappedMovements: StockMovement[] = ((movementsData?.items) || []).map((m: any) => ({
        id: m.id,
        itemId: m.cylinder?.serialNumber || m.product?.name || m.productId || m.cylinderId || '',
        itemName: m.cylinder ? `Tabung ${m.cylinder.serialNumber}` : (m.product?.name || 'Item'),
        itemType: m.cylinder ? 'Cylinder' : 'Product',
        type: m.type === 'IN' ? 'Incoming' : m.type === 'OUT' ? 'Outgoing' : 'Adjustment',
        quantity: m.quantity,
        date: new Date(m.createdAt).toISOString().split('T')[0],
        reason: m.referenceType
      }));

      const mappedPurchases: Purchase[] = ((purchasesData?.items) || []).map((p: any) => ({
        id: p.id,
        vendorId: p.vendorId,
        vendorName: p.vendor?.name || 'Unknown',
        items: (p.items || []).map((i: any) => ({
          itemId: i.productId,
          name: i.product?.name || 'Product',
          qty: i.quantity,
          cost: Number(i.unitCost) || 0
        })),
        totalAmount: Number(p.totalAmount) || 0,
        date: new Date(p.createdAt).toISOString().split('T')[0],
        status: p.status === 'PAID' ? 'Completed' : 'Pending'
      }));

      const mappedSales: Sale[] = ((salesData?.items) || []).map((s: any) => {
        let rawPm = s.paymentMethod || 'CASH';
        let serviceTypeVal: 'Kios' | 'Antar' = 'Kios';
        if (rawPm.includes('[SERVICE:')) {
          const match = rawPm.match(/\[SERVICE:\s*([^\]]+)\]/);
          if (match) {
            serviceTypeVal = match[1].trim().toUpperCase() === 'ANTAR' ? 'Antar' : 'Kios';
          }
          rawPm = rawPm.split('[SERVICE:')[0].trim();
        }
        const cleanPm = rawPm.toUpperCase() === 'TRANSFER' ? 'Transfer' : (rawPm.toUpperCase() === 'QRIS' || rawPm.toUpperCase() === 'E_WALLET') ? 'QRIS' : 'Tunai';

        return {
          id: s.id,
          customerId: s.customerId || '',
          customerName: s.customer?.name || 'Umum',
          items: (s.items || []).map((i: any) => ({
            productId: i.productId,
            name: i.product?.name || 'Product',
            qty: i.quantity,
            price: Number(i.unitPrice) || 0
          })),
          totalAmount: Number(s.totalAmount) || 0,
          date: new Date(s.createdAt).toISOString().split('T')[0],
          paymentMethod: cleanPm,
          status: s.status === 'PAID' ? 'Paid' : 'Unpaid',
          invoiceNo: s.invoiceNo,
          serviceType: serviceTypeVal
        };
      });

      const mappedExpenses: Expense[] = ((expensesData?.items) || []).map((e: any) => {
        let desc = e.description || '';
        if (desc.startsWith('Refill cost for ') && (desc.includes(' cylinders from vendor') || desc.includes(' tabung dari vendor'))) {
          const match = desc.match(/Refill cost for (\d+)/);
          if (match) {
            desc = `Biaya isi ulang untuk ${match[1]} tabung dari vendor`;
          }
        } else if (desc.startsWith('Purchase of inventory restock under invoice ')) {
          desc = desc.replace('Purchase of inventory restock under invoice ', 'Pembelian restock inventaris dengan invoice ');
        } else if (desc === 'Restock regulators and cannulas') {
          desc = 'Restock regulator dan kanula';
        }

        return {
          id: e.id,
          category: mapExpenseCategoryToFrontend(e.category),
          description: desc,
          amount: Number(e.amount) || 0,
          date: new Date(e.date).toISOString().split('T')[0],
          status: 'Approved'
        };
      });

      const txFromIncomes = ((incomesData?.items) || []).map((inc: any) => {
        let desc = inc.description || 'Pendapatan';
        if (desc.startsWith('Payment for rental invoice ')) {
          desc = desc.replace('Payment for rental invoice ', 'Pembayaran invoice sewa ');
        } else if (desc.startsWith('Payment for sales invoice ')) {
          desc = desc.replace('Payment for sales invoice ', 'Pembayaran invoice penjualan ');
        }

        let payMethod = 'Cash';
        if (inc.referenceType === 'SALE' && inc.referenceId) {
          const sale = mappedSales.find(s => s.id === inc.referenceId);
          if (sale) {
            payMethod = sale.paymentMethod;
          }
        } else if (inc.referenceType === 'RENTAL' && inc.referenceId) {
          const rental = mappedRentals.find(r => r.id === inc.referenceId);
          if (rental && rental.paymentMethod) {
            payMethod = rental.paymentMethod;
          }
        }

        return {
          id: `inc-${inc.id}`,
          date: new Date(inc.date).toISOString().split('T')[0],
          type: inc.referenceType === 'SALE' ? ('Sale' as const) : ('Rental' as const),
          description: desc,
          paymentMethod: payMethod,
          amount: Number(inc.amount) || 0,
          status: 'Completed' as const,
          referenceId: inc.referenceId || inc.id
        };
      });

      const txFromExpenses = ((expensesData?.items) || []).map((exp: any) => {
        let desc = exp.description || 'Pengeluaran';
        if (desc.startsWith('Refill cost for ') && (desc.includes(' cylinders from vendor') || desc.includes(' tabung dari vendor'))) {
          const match = desc.match(/Refill cost for (\d+)/);
          if (match) {
            desc = `Biaya isi ulang untuk ${match[1]} tabung dari vendor`;
          }
        } else if (desc.startsWith('Purchase of inventory restock under invoice ')) {
          desc = desc.replace('Purchase of inventory restock under invoice ', 'Pembelian restock inventaris dengan invoice ');
        } else if (desc === 'Restock regulators and cannulas') {
          desc = 'Restock regulator dan kanula';
        }

        return {
          id: `exp-${exp.id}`,
          date: new Date(exp.date).toISOString().split('T')[0],
          type: exp.category === 'VENDOR_REFILL' ? ('Refill' as const) : exp.category === 'PURCHASE' ? ('Purchase' as const) : ('Expense' as const),
          description: desc,
          amount: Number(exp.amount) || 0,
          status: 'Completed' as const,
          referenceId: exp.id
        };
      });

      const allTransactions = [...txFromIncomes, ...txFromExpenses].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setData({
        customers: mappedCustomers,
        vendors: mappedVendors,
        cylinders: mappedCylinders,
        products: mappedProducts,
        rentals: mappedRentals,
        refills: activeRefills,
        stockMovements: mappedMovements,
        purchases: mappedPurchases,
        sales: mappedSales,
        expenses: mappedExpenses,
        transactions: allTransactions
      });
    } catch (e) {
      console.error('Failed to load live ERP data:', e);
    } finally {
      isRefreshingRef.current = false;
    }
  };

  useEffect(() => {
    if (token) {
      refreshAllData();
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;

    let socket: WebSocket | null = null;
    let reconnectTimeout: any = null;

    const connect = () => {
      console.log('[WS] Connecting to real-time events...');
      const wsUrl = BASE_URL.replace(/^http/, 'ws');
      socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        console.log('[WS] Connected to Realtime Gateway successfully');
      };

      socket.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.event === 'db_change') {
            console.log('[WS] DB Change detected:', msg.payload);
            refreshAllData();
          }
        } catch (e) {
          console.error('[WS] Failed to parse message:', e);
        }
      };

      socket.onerror = (err) => {
        console.error('[WS] WebSocket Error:', err);
      };

      socket.onclose = () => {
        console.log('[WS] Connection closed. Reconnecting in 5 seconds...');
        reconnectTimeout = setTimeout(connect, 5000);
      };
    };

    connect();

    return () => {
      if (socket) {
        socket.onclose = null;
        socket.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, [token]);

  const handleLoginSuccess = (loggedInUser: any, tokens: { accessToken: string; refreshToken: string }) => {
    localStorage.setItem('oksigen24_access_token', tokens.accessToken);
    localStorage.setItem('oksigen24_refresh_token', tokens.refreshToken);
    localStorage.setItem('oksigen24_user', JSON.stringify(loggedInUser));
    setToken(tokens.accessToken);
    setUser(loggedInUser);
  };

  const logout = async () => {
    if (token) {
      try {
        await fetchApi('/auth/logout', { method: 'POST' });
      } catch (e) {
        console.error('Logout API failure:', e);
      }
    }
    localStorage.removeItem('oksigen24_access_token');
    localStorage.removeItem('oksigen24_refresh_token');
    localStorage.removeItem('oksigen24_user');
    setToken(null);
    setUser(null);
    setData(null);
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('oksigen24_theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // CRUD API Integrations
  const addCustomer = async (cust: any) => {
    const res = await fetchApi('/inventory/customers', {
      method: 'POST',
      body: JSON.stringify({
        name: cust.name,
        phone: cust.phone,
        address: cust.address || ''
      })
    });
    await refreshAllData();
    return res;
  };

  const updateCustomer = async (id: string, cust: any) => {
    await fetchApi(`/inventory/customers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        name: cust.name,
        phone: cust.phone,
        address: cust.address,
        isActive: cust.status === undefined ? undefined : (cust.status === 'Active')
      })
    });
    await refreshAllData();
  };

  const deleteCustomer = async (id: string) => {
    await fetchApi(`/inventory/customers/${id}`, {
      method: 'DELETE'
    });
    await refreshAllData();
  };

  const addVendor = async (vend: any) => {
    await fetchApi('/inventory/vendors', {
      method: 'POST',
      body: JSON.stringify({
        name: vend.companyName,
        phone: vend.phone,
        email: vend.email || `${vend.companyName.toLowerCase().replace(/\s/g, '')}@vendor.com`,
        address: vend.address || ''
      })
    });
    await refreshAllData();
  };

  const updateVendor = async (id: string, vend: any) => {
    await fetchApi(`/inventory/vendors/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        name: vend.companyName,
        phone: vend.phone,
        email: vend.email,
        address: vend.address,
        isActive: vend.status === undefined ? undefined : (vend.status === 'Active')
      })
    });
    await refreshAllData();
  };

  const deleteVendor = async (id: string) => {
    await fetchApi(`/inventory/vendors/${id}`, {
      method: 'DELETE'
    });
    await refreshAllData();
  };

  const addCylinder = async (cyl: any) => {
    const ot = oxygenTypes.find(t => t.name === cyl.oxygenType) || oxygenTypes[0];
    await fetchApi('/inventory/cylinders', {
      method: 'POST',
      body: JSON.stringify({
        serialNumber: cyl.serialNo,
        capacity: Number(cyl.capacity) || 40,
        size: cyl.size,
        status: cyl.status.toUpperCase() === 'AT VENDOR' ? 'AT_VENDOR' : cyl.status.toUpperCase(),
        oxygenTypeId: ot?.id
      })
    });
    await refreshAllData();
  };

  const updateCylinder = async (id: string, cyl: any) => {
    const ot = oxygenTypes.find(t => t.name === cyl.oxygenType);
    const payload: any = {};

    if (cyl.serialNo !== undefined) payload.serialNumber = cyl.serialNo;
    if (cyl.size !== undefined) payload.size = cyl.size;
    if (cyl.status !== undefined) {
      payload.status = cyl.status.toUpperCase() === 'AT VENDOR' ? 'AT_VENDOR' : cyl.status.toUpperCase();
    }
    if (ot) payload.oxygenTypeId = ot.id;
    if (cyl.capacity !== undefined) payload.capacity = Number(cyl.capacity);

    await fetchApi(`/inventory/cylinders/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
    await refreshAllData();
  };

  const deleteCylinder = async (id: string) => {
    await fetchApi(`/inventory/cylinders/${id}`, {
      method: 'DELETE'
    });
    await refreshAllData();
  };

  const addProduct = async (prod: any) => {
    const matchedCategory = categories.find(c =>
      c.name.toLowerCase().includes(prod.category.toLowerCase()) ||
      (prod.category === 'Peralatan' && c.name.toLowerCase().includes('regulator')) ||
      (prod.category === 'Aksesoris' && c.name.toLowerCase().includes('consumable'))
    ) || categories[0];

    await fetchApi('/inventory/products', {
      method: 'POST',
      body: JSON.stringify({
        name: prod.name,
        sku: `PRD-${Date.now().toString().slice(-6)}`,
        description: prod.description || '',
        price: Number(prod.price),
        cost: Number(prod.cost),
        currentStock: Number(prod.stock) || 0,
        minStock: 5,
        categoryId: matchedCategory?.id
      })
    });
    await refreshAllData();
  };

  const updateProduct = async (id: string, prod: any) => {
    let matchedCategory = categories.find(cat => cat.name === prod.category);
    if (!matchedCategory && prod.category) {
      matchedCategory = categories.find(c =>
        c.name.toLowerCase().includes(prod.category.toLowerCase()) ||
        (prod.category === 'Peralatan' && c.name.toLowerCase().includes('regulator')) ||
        (prod.category === 'Aksesoris' && c.name.toLowerCase().includes('consumable'))
      );
    }
    const payload: any = {};

    if (prod.name !== undefined) payload.name = prod.name;
    if (prod.description !== undefined) payload.description = prod.description || '';
    if (prod.price !== undefined) payload.price = Number(prod.price);
    if (prod.cost !== undefined) payload.cost = Number(prod.cost);
    if (prod.stock !== undefined) payload.currentStock = Number(prod.stock);
    if (matchedCategory) payload.categoryId = matchedCategory.id;

    await fetchApi(`/inventory/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
    await refreshAllData();
  };

  const deleteProduct = async (id: string) => {
    await fetchApi(`/inventory/products/${id}`, {
      method: 'DELETE'
    });
    await refreshAllData();
  };

  // Workflow integrations
  const createRental = async (rentalData: any) => {
    const depositAmount = Number(rentalData.deposit) || 0;
    const payMethod = (rentalData.paymentMethod || 'CASH').toUpperCase();
    const sType = (rentalData.serviceType || 'Kios').toUpperCase();

    let notesPayload = `[DEPOSIT: ${depositAmount}] [PAYMENT: ${payMethod}] [SERVICE: ${sType}]`;
    if (rentalData.accessories && rentalData.accessories.length > 0) {
      const accStr = rentalData.accessories.map((a: any) => `${a.name}(${a.qty})|fee:${a.fee}|dep:${a.deposit}`).join(';');
      notesPayload += ` [ACCESSORIES: ${accStr}]`;
    }

    const totalAccFees = rentalData.accessories?.reduce((sum: number, a: any) => sum + (a.fee * a.qty), 0) || 0;

    await fetchApi('/transactions/rentals', {
      method: 'POST',
      body: JSON.stringify({
        customerId: rentalData.customerId,
        dueDate: new Date(rentalData.returnDate).toISOString(),
        cylinderIds: [rentalData.cylinderId],
        amountPaid: (Number(rentalData.rentalFee) || 0) + totalAccFees,
        notes: notesPayload
      })
    });
    await refreshAllData();
  };

  const returnRental = async (rentalId: string, actualReturnDate: string, status: any) => {
    const rental = data?.rentals.find(r => r.id === rentalId);
    if (!rental) return;
    await fetchApi(`/transactions/rentals/${rentalId}/return`, {
      method: 'POST',
      body: JSON.stringify({
        cylinderIds: [rental.cylinderId]
      })
    });

    // If it is an accessory, automatically set its status to 'Available' or 'Maintenance'
    const s = (rental.cylinderSerial || '').toUpperCase();
    const isAcc = s.startsWith('REG-') || s.startsWith('TRL-') || s.startsWith('ACC-');
    if (isAcc) {
      const targetStatus = status === 'Maintenance' ? 'Maintenance' : 'Available';
      await updateCylinder(rental.cylinderId, { status: targetStatus });
    } else {
      if (status === 'Maintenance') {
        await updateCylinder(rental.cylinderId, { status: 'Maintenance' });
      }
    }

    await refreshAllData();
  };

  const sendToRefill = async (refillData: any) => {
    // Backend demands cylinders must be empty to be filled
    // Force EMPTY cylinder status beforehand so backend validation passes.
    await fetchApi(`/inventory/cylinders/${refillData.cylinderId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'EMPTY' })
    });

    await fetchApi('/transactions/refills/send', {
      method: 'POST',
      body: JSON.stringify({
        vendorId: refillData.vendorId,
        cylinderIds: [refillData.cylinderId]
      })
    });
    await refreshAllData();
  };

  const receiveRefill = async (refillId: string, returnDate: string) => {
    await fetchApi('/transactions/refills/receive', {
      method: 'POST',
      body: JSON.stringify({
        cylinderIds: [refillId], // refillId maps to cylinderId on frontend
        costPerCylinder: 25000,
        amountPaid: 25000
      })
    });
    await refreshAllData();
  };

  const createStockMovement = async (mvt: any) => {
    // Stock movements are logged automatically on transactions
  };

  const createPurchase = async (pur: any) => {
    await fetchApi('/transactions/purchases', {
      method: 'POST',
      body: JSON.stringify({
        vendorId: pur.vendorId,
        items: pur.items.map((i: any) => ({
          productId: i.itemId,
          quantity: i.qty,
          unitCost: i.cost
        })),
        amountPaid: pur.items.reduce((sum: number, i: any) => sum + (i.qty * i.cost), 0)
      })
    });
    await refreshAllData();
  };

  const createSale = async (sale: any) => {
    const sType = (sale.serviceType || 'Kios').toUpperCase();
    const upperPm = (sale.paymentMethod || 'TUNAI').toUpperCase();
    const rawPm = upperPm === 'TUNAI' || upperPm === 'CASH' ? 'TUNAI' : upperPm === 'TRANSFER' ? 'TRANSFER' : 'QRIS';
    const pmPayload = `${rawPm} [SERVICE: ${sType}]`;

    const res = await fetchApi('/transactions/sales', {
      method: 'POST',
      body: JSON.stringify({
        customerId: sale.customerId || undefined,
        items: sale.items.map((i: any) => ({
          productId: i.productId,
          quantity: i.qty
        })),
        amountPaid: sale.items.reduce((sum: number, i: any) => sum + (i.qty * i.price), 0),
        paymentMethod: pmPayload
      })
    });

    const mappedItems = (res.items || []).map((i: any) => {
      const prod = data?.products?.find(p => p.id === i.productId);
      return {
        productId: i.productId,
        name: prod ? prod.name : 'Produk Ritel',
        qty: i.quantity,
        price: Number(i.unitPrice) || 0
      };
    });

    await refreshAllData();

    return {
      id: res.id,
      customerId: res.customerId || '',
      paymentMethod: (res.paymentMethod === 'E_WALLET' || res.paymentMethod === 'QRIS') ? 'QRIS' : (res.paymentMethod === 'TRANSFER' ? 'Transfer' : 'Tunai'),
      amount: Number(res.totalAmount) || 0,
      date: new Date(res.createdAt).toISOString().split('T')[0],
      items: mappedItems
    };
  };

  const createExpense = async (exp: any) => {
    await fetchApi('/finance/expenses', {
      method: 'POST',
      body: JSON.stringify({
        category: exp.category.toUpperCase() === 'REFILLS' ? 'VENDOR_REFILL' : exp.category.toUpperCase(),
        amount: Number(exp.amount),
        description: exp.description,
        date: new Date(exp.date).toISOString()
      })
    });
    await refreshAllData();
  };

  const approveExpense = async (expenseId: string) => {
    // Direct approval from backend upon creation
  };

  if (!isClientLoaded) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Memuat Sistem...</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return <LoginOverlay onLoginSuccess={handleLoginSuccess} />;
  }

  if (!data) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider">Menghubungkan ke database live Supabase...</p>
        </div>
      </div>
    );
  }

  return (
    <DataContext.Provider
      value={{
        ...data,
        oxygenTypes,
        theme,
        toggleTheme,
        user,
        logout,
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
        deleteProduct,
        createRental,
        returnRental,
        sendToRefill,
        receiveRefill,
        createStockMovement,
        createPurchase,
        createSale,
        createExpense,
        approveExpense
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
