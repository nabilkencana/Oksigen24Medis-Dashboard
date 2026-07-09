'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  generateInitialData,
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
  Transaction,
  OXYGEN_TYPES
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
  expenses: Expense[];
  transactions: Transaction[];
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  // CRUD actions
  addCustomer: (cust: Omit<Customer, 'id' | 'joinedDate' | 'balance'> & { balance?: number }) => void;
  updateCustomer: (id: string, cust: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  addVendor: (vend: Omit<Vendor, 'id'>) => void;
  updateVendor: (id: string, vend: Partial<Vendor>) => void;
  deleteVendor: (id: string) => void;
  addCylinder: (cyl: Omit<Cylinder, 'id'>) => void;
  updateCylinder: (id: string, cyl: Partial<Cylinder>) => void;
  deleteCylinder: (id: string) => void;
  addProduct: (prod: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, prod: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  // Workflows
  createRental: (rentalData: { customerId: string; cylinderId: string; rentDate: string; returnDate: string; deposit: number; rentalFee: number }) => void;
  returnRental: (rentalId: string, actualReturnDate: string, cylinderStatus: Cylinder['status']) => void;
  sendToRefill: (refillData: { cylinderId: string; vendorId: string; cost: number; sendDate: string }) => void;
  receiveRefill: (refillId: string, returnDate: string) => void;
  createStockMovement: (mvt: Omit<StockMovement, 'id' | 'date'>) => void;
  createPurchase: (pur: { vendorId: string; items: Array<{ itemId: string; name: string; qty: number; cost: number }>; date: string }) => void;
  createSale: (sale: { customerId: string; items: Array<{ productId: string; name: string; qty: number; price: number }>; date: string; paymentMethod: Sale['paymentMethod'] }) => void;
  createExpense: (exp: Omit<Expense, 'id' | 'status'>) => void;
  approveExpense: (expenseId: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
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

  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Load from local storage or generate
  useEffect(() => {
    const savedData = localStorage.getItem('oksigen24_erp_data');
    if (savedData) {
      try {
        setData(JSON.parse(savedData));
      } catch (e) {
        const init = generateInitialData();
        setData(init);
        localStorage.setItem('oksigen24_erp_data', JSON.stringify(init));
      }
    } else {
      const init = generateInitialData();
      setData(init);
      localStorage.setItem('oksigen24_erp_data', JSON.stringify(init));
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
  }, []);

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

  // Sync back helper
  const updateData = (updater: (prev: typeof data) => typeof data) => {
    setData(prev => {
      const next = updater(prev);
      if (next) {
        localStorage.setItem('oksigen24_erp_data', JSON.stringify(next));
      }
      return next;
    });
  };

  // CRUD Implementations
  const addCustomer = (cust: Omit<Customer, 'id' | 'joinedDate' | 'balance'> & { balance?: number }) => {
    updateData(prev => {
      if (!prev) return prev;
      const newCust: Customer = {
        ...cust,
        balance: cust.balance || 0,
        id: `CST-${String(prev.customers.length + 1).padStart(3, '0')}`,
        joinedDate: new Date().toISOString().split('T')[0]
      };
      return {
        ...prev,
        customers: [newCust, ...prev.customers]
      };
    });
  };

  const updateCustomer = (id: string, updatedCust: Partial<Customer>) => {
    updateData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        customers: prev.customers.map(c => c.id === id ? { ...c, ...updatedCust } : c)
      };
    });
  };

  const deleteCustomer = (id: string) => {
    updateData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        customers: prev.customers.filter(c => c.id !== id)
      };
    });
  };

  const addVendor = (vend: Omit<Vendor, 'id'>) => {
    updateData(prev => {
      if (!prev) return prev;
      const newVend: Vendor = {
        ...vend,
        id: `VND-${String(prev.vendors.length + 1).padStart(3, '0')}`
      };
      return {
        ...prev,
        vendors: [newVend, ...prev.vendors]
      };
    });
  };

  const updateVendor = (id: string, updatedVend: Partial<Vendor>) => {
    updateData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        vendors: prev.vendors.map(v => v.id === id ? { ...v, ...updatedVend } : v)
      };
    });
  };

  const deleteVendor = (id: string) => {
    updateData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        vendors: prev.vendors.filter(v => v.id !== id)
      };
    });
  };

  const addCylinder = (cyl: Omit<Cylinder, 'id'>) => {
    updateData(prev => {
      if (!prev) return prev;
      const newCyl: Cylinder = {
        ...cyl,
        id: `CYL-${String(prev.cylinders.length + 1).padStart(3, '0')}`
      };
      return {
        ...prev,
        cylinders: [newCyl, ...prev.cylinders]
      };
    });
  };

  const updateCylinder = (id: string, updatedCyl: Partial<Cylinder>) => {
    updateData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        cylinders: prev.cylinders.map(c => c.id === id ? { ...c, ...updatedCyl } : c)
      };
    });
  };

  const deleteCylinder = (id: string) => {
    updateData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        cylinders: prev.cylinders.filter(c => c.id !== id)
      };
    });
  };

  const addProduct = (prod: Omit<Product, 'id'>) => {
    updateData(prev => {
      if (!prev) return prev;
      const newProd: Product = {
        ...prod,
        id: `PRD-${String(prev.products.length + 1).padStart(3, '0')}`
      };
      return {
        ...prev,
        products: [newProd, ...prev.products]
      };
    });
  };

  const updateProduct = (id: string, updatedProd: Partial<Product>) => {
    updateData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        products: prev.products.map(p => p.id === id ? { ...p, ...updatedProd } : p)
      };
    });
  };

  const deleteProduct = (id: string) => {
    updateData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        products: prev.products.filter(p => p.id !== id)
      };
    });
  };

  // Workflow Implementations
  const createRental = (rentalData: { customerId: string; cylinderId: string; rentDate: string; returnDate: string; deposit: number; rentalFee: number }) => {
    updateData(prev => {
      if (!prev) return prev;
      
      const customer = prev.customers.find(c => c.id === rentalData.customerId);
      const cylinder = prev.cylinders.find(c => c.id === rentalData.cylinderId);
      
      if (!customer || !cylinder) return prev;

      // Update cylinder status to Rented
      const updatedCylinders = prev.cylinders.map(c => 
        c.id === rentalData.cylinderId ? { ...c, status: 'Rented' as const } : c
      );

      // Create rental object
      const newRental: Rental = {
        id: `RNT-${String(prev.rentals.length + 1).padStart(3, '0')}`,
        customerId: rentalData.customerId,
        customerName: customer.name,
        cylinderId: rentalData.cylinderId,
        cylinderSerial: cylinder.serialNo,
        rentDate: rentalData.rentDate,
        returnDate: rentalData.returnDate,
        deposit: rentalData.deposit,
        rentalFee: rentalData.rentalFee,
        status: 'Active'
      };

      // Create transaction object
      const newTx: Transaction = {
        id: `TX-${newRental.id}`,
        date: rentalData.rentDate,
        type: 'Rental',
        description: `Rental ${cylinder.serialNo} - ${customer.name}`,
        amount: rentalData.rentalFee,
        status: 'Active',
        referenceId: newRental.id
      };

      // Create stock movement
      const newMovement: StockMovement = {
        id: `MVT-${String(prev.stockMovements.length + 1).padStart(3, '0')}`,
        itemId: cylinder.serialNo,
        itemName: `Tabung Oksigen ${cylinder.size} (${cylinder.oxygenType})`,
        itemType: 'Cylinder',
        type: 'Outgoing',
        quantity: 1,
        date: rentalData.rentDate,
        reason: `Disewa oleh ${customer.name} (${newRental.id})`
      };

      return {
        ...prev,
        cylinders: updatedCylinders,
        rentals: [newRental, ...prev.rentals],
        transactions: [newTx, ...prev.transactions],
        stockMovements: [newMovement, ...prev.stockMovements]
      };
    });
  };

  const returnRental = (rentalId: string, actualReturnDate: string, cylinderStatus: Cylinder['status'] = 'Available') => {
    updateData(prev => {
      if (!prev) return prev;

      const rental = prev.rentals.find(r => r.id === rentalId);
      if (!rental) return prev;

      // Update rental status to Returned
      const updatedRentals = prev.rentals.map(r => 
        r.id === rentalId 
          ? { ...r, status: 'Returned' as const, actualReturnDate } 
          : r
      );

      // Update cylinder status to Available/Maintenance/etc.
      const updatedCylinders = prev.cylinders.map(c => 
        c.id === rental.cylinderId 
          ? { ...c, status: cylinderStatus, lastInspection: actualReturnDate } 
          : c
      );

      // Create transaction update/new transaction for deposit return or rental complete
      const updatedTransactions = prev.transactions.map(t => 
        t.referenceId === rentalId ? { ...t, status: 'Completed' as const } : t
      );

      // Add Stock Movement
      const newMovement: StockMovement = {
        id: `MVT-${String(prev.stockMovements.length + 1).padStart(3, '0')}`,
        itemId: rental.cylinderSerial,
        itemName: `Kembali Tabung Oksigen`,
        itemType: 'Cylinder',
        type: 'Incoming',
        quantity: 1,
        date: actualReturnDate,
        reason: `Pengembalian sewa ${rental.customerName} (${rentalId})`
      };

      return {
        ...prev,
        rentals: updatedRentals,
        cylinders: updatedCylinders,
        transactions: updatedTransactions,
        stockMovements: [newMovement, ...prev.stockMovements]
      };
    });
  };

  const sendToRefill = (refillData: { cylinderId: string; vendorId: string; cost: number; sendDate: string }) => {
    updateData(prev => {
      if (!prev) return prev;

      const cylinder = prev.cylinders.find(c => c.id === refillData.cylinderId);
      const vendor = prev.vendors.find(v => v.id === refillData.vendorId);
      if (!cylinder || !vendor) return prev;

      // Update cylinder status to At Vendor
      const updatedCylinders = prev.cylinders.map(c => 
        c.id === refillData.cylinderId ? { ...c, status: 'At Vendor' as const } : c
      );

      // Create Refill object
      const newRefill: Refill = {
        id: `REF-${String(prev.refills.length + 1).padStart(3, '0')}`,
        cylinderId: refillData.cylinderId,
        cylinderSerial: cylinder.serialNo,
        vendorId: refillData.vendorId,
        vendorName: vendor.companyName,
        sendDate: refillData.sendDate,
        cost: refillData.cost,
        status: 'Sent'
      };

      // Create Transaction
      const newTx: Transaction = {
        id: `TX-${newRefill.id}`,
        date: refillData.sendDate,
        type: 'Refill',
        description: `Isi Ulang ${cylinder.serialNo} di ${vendor.companyName}`,
        amount: refillData.cost,
        status: 'In Progress',
        referenceId: newRefill.id
      };

      return {
        ...prev,
        cylinders: updatedCylinders,
        refills: [newRefill, ...prev.refills],
        transactions: [newTx, ...prev.transactions]
      };
    });
  };

  const receiveRefill = (refillId: string, returnDate: string) => {
    updateData(prev => {
      if (!prev) return prev;

      const refill = prev.refills.find(r => r.id === refillId);
      if (!refill) return prev;

      // Update refill status
      const updatedRefills = prev.refills.map(r => 
        r.id === refillId ? { ...r, status: 'Returned' as const, returnDate } : r
      );

      // Update cylinder status to Available
      const updatedCylinders = prev.cylinders.map(c => 
        c.id === refill.cylinderId ? { ...c, status: 'Available' as const, lastInspection: returnDate } : c
      );

      // Update Transaction
      const updatedTransactions = prev.transactions.map(t => 
        t.referenceId === refillId ? { ...t, status: 'Completed' as const } : t
      );

      // Add Stock Movement
      const newMovement: StockMovement = {
        id: `MVT-${String(prev.stockMovements.length + 1).padStart(3, '0')}`,
        itemId: refill.cylinderSerial,
        itemName: `Refill Tabung Selesai`,
        itemType: 'Cylinder',
        type: 'Incoming',
        quantity: 1,
        date: returnDate,
        reason: `Pengembalian refill dari ${refill.vendorName} (${refillId})`
      };

      return {
        ...prev,
        refills: updatedRefills,
        cylinders: updatedCylinders,
        transactions: updatedTransactions,
        stockMovements: [newMovement, ...prev.stockMovements]
      };
    });
  };

  const createStockMovement = (mvt: Omit<StockMovement, 'id' | 'date'>) => {
    updateData(prev => {
      if (!prev) return prev;

      const newMvt: StockMovement = {
        ...mvt,
        id: `MVT-${String(prev.stockMovements.length + 1).padStart(3, '0')}`,
        date: new Date().toISOString().split('T')[0]
      };

      // Apply stock adjustment to products if it is a Product
      let updatedProducts = prev.products;
      if (mvt.itemType === 'Product') {
        updatedProducts = prev.products.map(p => {
          if (p.id === mvt.itemId) {
            let nextStock = p.stock;
            if (mvt.type === 'Incoming') nextStock += mvt.quantity;
            else if (mvt.type === 'Outgoing') nextStock -= mvt.quantity;
            else nextStock = mvt.quantity; // Adjustment is an overwrite in this simplistic ERP logic
            return { ...p, stock: Math.max(0, nextStock) };
          }
          return p;
        });
      }

      return {
        ...prev,
        stockMovements: [newMvt, ...prev.stockMovements],
        products: updatedProducts
      };
    });
  };

  const createPurchase = (pur: { vendorId: string; items: Array<{ itemId: string; name: string; qty: number; cost: number }>; date: string }) => {
    updateData(prev => {
      if (!prev) return prev;

      const vendor = prev.vendors.find(v => v.id === pur.vendorId);
      if (!vendor) return prev;

      const newPur: Purchase = {
        id: `PRC-${String(prev.purchases.length + 1).padStart(3, '0')}`,
        vendorId: pur.vendorId,
        vendorName: vendor.companyName,
        items: pur.items,
        totalAmount: pur.items.reduce((sum, item) => sum + (item.qty * item.cost), 0),
        date: pur.date,
        status: 'Completed'
      };

      const newTx: Transaction = {
        id: `TX-${newPur.id}`,
        date: pur.date,
        type: 'Purchase',
        description: `Pembelian Stok - ${vendor.companyName}`,
        amount: newPur.totalAmount,
        status: 'Completed',
        referenceId: newPur.id
      };

      // Adjust product stocks & create movements
      const updatedProducts = prev.products.map(p => {
        const purItem = pur.items.find(i => i.itemId === p.id);
        if (purItem) {
          return { ...p, stock: p.stock + purItem.qty };
        }
        return p;
      });

      const newMovements = pur.items.map((item, index) => ({
        id: `MVT-${String(prev.stockMovements.length + index + 1).padStart(3, '0')}`,
        itemId: item.itemId,
        itemName: item.name,
        itemType: 'Product' as const,
        type: 'Incoming' as const,
        quantity: item.qty,
        date: pur.date,
        reason: `Restock Pembelian ${newPur.id}`
      }));

      return {
        ...prev,
        purchases: [newPur, ...prev.purchases],
        transactions: [newTx, ...prev.transactions],
        products: updatedProducts,
        stockMovements: [...newMovements, ...prev.stockMovements]
      };
    });
  };

  const createSale = (sale: { customerId: string; items: Array<{ productId: string; name: string; qty: number; price: number }>; date: string; paymentMethod: Sale['paymentMethod'] }) => {
    updateData(prev => {
      if (!prev) return prev;

      const customer = prev.customers.find(c => c.id === sale.customerId);
      if (!customer) return prev;

      const newSale: Sale = {
        id: `SAL-${String(prev.sales.length + 1).padStart(3, '0')}`,
        customerId: sale.customerId,
        customerName: customer.name,
        items: sale.items,
        totalAmount: sale.items.reduce((sum, item) => sum + (item.qty * item.price), 0),
        date: sale.date,
        paymentMethod: sale.paymentMethod,
        status: 'Paid'
      };

      const newTx: Transaction = {
        id: `TX-${newSale.id}`,
        date: sale.date,
        type: 'Sale',
        description: `Penjualan Retail - ${customer.name}`,
        amount: newSale.totalAmount,
        status: 'Completed',
        referenceId: newSale.id
      };

      // Adjust product stocks & create movements
      const updatedProducts = prev.products.map(p => {
        const saleItem = sale.items.find(i => i.productId === p.id);
        if (saleItem) {
          return { ...p, stock: Math.max(0, p.stock - saleItem.qty) };
        }
        return p;
      });

      const newMovements = sale.items.map((item, index) => ({
        id: `MVT-${String(prev.stockMovements.length + index + 1).padStart(3, '0')}`,
        itemId: item.productId,
        itemName: item.name,
        itemType: 'Product' as const,
        type: 'Outgoing' as const,
        quantity: item.qty,
        date: sale.date,
        reason: `Penjualan Retail ${newSale.id}`
      }));

      return {
        ...prev,
        sales: [newSale, ...prev.sales],
        transactions: [newTx, ...prev.transactions],
        products: updatedProducts,
        stockMovements: [...newMovements, ...prev.stockMovements]
      };
    });
  };

  const createExpense = (exp: Omit<Expense, 'id' | 'status'>) => {
    updateData(prev => {
      if (!prev) return prev;

      const newExp: Expense = {
        ...exp,
        id: `EXP-${String(prev.expenses.length + 1).padStart(3, '0')}`,
        status: 'Approved' // Direct approval for simplicity
      };

      const newTx: Transaction = {
        id: `TX-${newExp.id}`,
        date: exp.date,
        type: 'Expense',
        description: `Pengeluaran: ${exp.description}`,
        amount: exp.amount,
        status: 'Completed',
        referenceId: newExp.id
      };

      return {
        ...prev,
        expenses: [newExp, ...prev.expenses],
        transactions: [newTx, ...prev.transactions]
      };
    });
  };

  const approveExpense = (expenseId: string) => {
    updateData(prev => {
      if (!prev) return prev;

      const updatedExpenses = prev.expenses.map(e => 
        e.id === expenseId ? { ...e, status: 'Approved' as const } : e
      );

      const updatedTransactions = prev.transactions.map(t => 
        t.referenceId === expenseId ? { ...t, status: 'Completed' as const } : t
      );

      return {
        ...prev,
        expenses: updatedExpenses,
        transactions: updatedTransactions
      };
    });
  };

  if (!data) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Loading Database Oksigen24Medis...</p>
        </div>
      </div>
    );
  }

  return (
    <DataContext.Provider
      value={{
        ...data,
        theme,
        toggleTheme,
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
