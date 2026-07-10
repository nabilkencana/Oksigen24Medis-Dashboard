// Realistic Indonesian Mock Data Generator for Oksigen24Medis ERP Dashboard

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  status: 'Active' | 'Inactive';
  balance: number;
  joinedDate: string;
}

export interface Vendor {
  id: string;
  name: string;
  companyName: string;
  phone: string;
  email: string;
  address: string;
  status: 'Active' | 'Inactive';
}

export interface Cylinder {
  id: string;
  serialNo: string;
  oxygenType: string;
  size: '1m3' | '2m3' | '6m3';
  status: 'Available' | 'Rented' | 'At Vendor' | 'Maintenance' | 'Empty';
  lastInspection: string;
}

export interface Product {
  id: string;
  name: string;
  category: 'Gas' | 'Equipment' | 'Accessory';
  stock: number;
  price: number;
  cost: number;
  description: string;
}

export interface Rental {
  id: string;
  customerId: string;
  customerName: string;
  cylinderId: string;
  cylinderSerial: string;
  rentDate: string;
  returnDate: string;
  actualReturnDate?: string;
  deposit: number;
  rentalFee: number;
  status: 'Active' | 'Returned' | 'Overdue';
  paymentMethod?: 'Cash' | 'Transfer' | 'E-Wallet';
  invoiceNo?: string;
  serviceType?: 'Kios' | 'Antar';
  cylinderDeposit?: number;
  cylinderFee?: number;
  accessories?: Array<{ name: string; qty: number; fee: number; deposit: number }>;
}

export interface Refill {
  id: string;
  cylinderId: string;
  cylinderSerial: string;
  vendorId: string;
  vendorName: string;
  sendDate: string;
  returnDate?: string;
  cost: number;
  status: 'Sent' | 'In Queue' | 'Returned';
}

export interface StockMovement {
  id: string;
  itemId: string; // Cylinder serial or Product ID
  itemName: string;
  itemType: 'Cylinder' | 'Product';
  type: 'Incoming' | 'Outgoing' | 'Adjustment';
  quantity: number;
  date: string;
  reason: string;
}

export interface Purchase {
  id: string;
  vendorId: string;
  vendorName: string;
  items: Array<{ itemId: string; name: string; qty: number; cost: number }>;
  totalAmount: number;
  date: string;
  status: 'Pending' | 'Completed' | 'Cancelled';
}

export interface Sale {
  id: string;
  customerId: string;
  customerName: string;
  items: Array<{ productId: string; name: string; qty: number; price: number }>;
  totalAmount: number;
  date: string;
  paymentMethod: 'Cash' | 'Transfer' | 'E-Wallet';
  status: 'Paid' | 'Unpaid';
  invoiceNo?: string;
  serviceType?: 'Kios' | 'Antar';
}

export interface Expense {
  id: string;
  category: 'Operational' | 'Utilities' | 'Rent' | 'Refills' | 'Marketing' | 'Salaries' | 'Other';
  description: string;
  amount: number;
  date: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  attachment?: string;
}

export interface Transaction {
  id: string;
  date: string;
  type: 'Rental' | 'Refill' | 'Purchase' | 'Sale' | 'Expense';
  description: string;
  amount: number;
  status: 'Completed' | 'Pending' | 'Cancelled' | 'Active' | 'In Progress' | 'Approved' | 'Rejected';
  referenceId: string;
}

// Indonesian Name Elements
const FIRST_NAMES_MALE = [
  'Budi', 'Agus', 'Adi', 'Bambang', 'Joko', 'Dedi', 'Hendra', 'Eko', 'Rian', 'Asep',
  'Cecep', 'Naufal', 'Fajar', 'Aditya', 'Reza', 'Rizky', 'Kevin', 'Daniel', 'Yudi', 'Taufik',
  'Deni', 'Gede', 'Putu', 'Wayan', 'Made', 'Fahmi', 'Aris', 'Slamet', 'Wahyu', 'Rudi'
];

const FIRST_NAMES_FEMALE = [
  'Sari', 'Indah', 'Dewi', 'Rini', 'Ani', 'Siti', 'Dian', 'Sri', 'Mega', 'Yuni',
  'Wulan', 'Kartika', 'Nani', 'Fitri', 'Lani', 'Amanda', 'Maria', 'Jessica', 'Putri', 'Ayu',
  'Lestari', 'Ratna', 'Desi', 'Hana', 'Rina', 'Elisa', 'Niken', 'Utami', 'Wati', 'Citra'
];

const LAST_NAMES = [
  'Kencana', 'Wijaya', 'Saputra', 'Wibowo', 'Setiawan', 'Santoso', 'Pratama', 'Siregar', 'Nasution', 'Ginting',
  'Pane', 'Lubis', 'Hidayat', 'Gunawan', 'Kusuma', 'Nugroho', 'Budiman', 'Halim', 'Tan', 'Salim',
  'Harsono', 'Subagyo', 'Hartono', 'Purnama', 'Dharmawan', 'Suryadi', 'Bachtiar', 'Laksana', 'Hadi', 'Widodo'
];

const VENDOR_COMPANIES = [
  'PT Gas Oksigen Nusantara', 'CV Kita Refill', 'UD Berkah Abadi Gas', 'PT Delta Gas Industri',
  'CV Cahaya Medika', 'PT Oxygenindo Utama', 'PT Samator Indah', 'UD Barokah Jaya Oksigen',
  'PT Aneka Gas Selaras', 'CV Prima Lestari Refill'
];

const CITIES = ['Jakarta', 'Bandung', 'Semarang', 'Surabaya', 'Yogyakarta', 'Denpasar', 'Medan', 'Makassar', 'Tangerang', 'Bekasi'];

const STREETS = ['Jl. Sudirman', 'Jl. Gatot Subroto', 'Jl. Pemuda', 'Jl. Basuki Rahmat', 'Jl. Malioboro', 'Jl. Teuku Umar', 'Jl. Diponegoro', 'Jl. Ahmad Yani', 'Jl. Hayam Wuruk', 'Jl. Gajah Mada'];

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generatePhone(): string {
  const providers = ['0811', '0812', '0813', '0852', '0857', '0878', '0896', '0821'];
  const provider = getRandomItem(providers);
  const number = Math.floor(10000000 + Math.random() * 90000000);
  return `${provider}-${number}`;
}

function generateIndonesianName(): string {
  const isMale = Math.random() > 0.5;
  const first = isMale ? getRandomItem(FIRST_NAMES_MALE) : getRandomItem(FIRST_NAMES_FEMALE);
  const last = getRandomItem(LAST_NAMES);
  return `${first} ${last}`;
}

function generateAddress(): string {
  return `${getRandomItem(STREETS)} No. ${getRandomRange(1, 150)}, ${getRandomItem(CITIES)}`;
}

// Generate static items to refer during data generation
export const OXYGEN_TYPES = [
  { id: 'OT-01', name: 'Medical Oxygen', purity: '99.5%', description: 'Oksigen medis steril untuk pernapasan' },
  { id: 'OT-02', name: 'Industrial Oxygen', purity: '99.2%', description: 'Oksigen untuk pengelasan & pabrik' },
  { id: 'OT-03', name: 'High-Purity Oxygen', purity: '99.99%', description: 'Oksigen laboratori & penelitian' }
];

export const PRODUCTS_LIST: Omit<Product, 'stock'>[] = [
  { id: 'PRD-01', name: 'Regulator Oksigen Medis', category: 'Equipment', price: 275000, cost: 180000, description: 'Regulator tekanan gas oksigen dengan flowmeter' },
  { id: 'PRD-02', name: 'Trolley Tabung Oksigen 1m3', category: 'Equipment', price: 150000, cost: 95000, description: 'Troli beroda dua untuk tabung 1m3' },
  { id: 'PRD-03', name: 'Trolley Tabung Oksigen 6m3', category: 'Equipment', price: 450000, cost: 300000, description: 'Troli kokoh untuk memindahkan tabung 6m3' },
  { id: 'PRD-04', name: 'Selang Oksigen Nasal Cannula Dewasa', category: 'Accessory', price: 15000, cost: 5000, description: 'Selang hidung steril sekali pakai ukuran dewasa' },
  { id: 'PRD-05', name: 'Selang Oksigen Nasal Cannula Anak', category: 'Accessory', price: 15000, cost: 5000, description: 'Selang hidung steril sekali pakai ukuran anak' },
  { id: 'PRD-06', name: 'Masker Oksigen Non-Rebreathing Dewasa', category: 'Accessory', price: 35000, cost: 15000, description: 'Masker oksigen dengan kantung reservoir' },
  { id: 'PRD-07', name: 'Humidifier Tabung Oksigen', category: 'Accessory', price: 75000, cost: 45000, description: 'Botol pelembab udara untuk pernapasan' },
  { id: 'PRD-08', name: 'Tabung Oksigen 1m3 (Kosong)', category: 'Gas', price: 700000, cost: 550000, description: 'Tabung gas baja kapasitas 1 meter kubik' },
  { id: 'PRD-09', name: 'Tabung Oksigen 2m3 (Kosong)', category: 'Gas', price: 950000, cost: 750000, description: 'Tabung gas baja kapasitas 2 meter kubik' },
  { id: 'PRD-10', name: 'Tabung Oksigen 6m3 (Kosong)', category: 'Gas', price: 1600000, cost: 1200000, description: 'Tabung gas baja kapasitas 6 meter kubik' }
];

export function generateInitialData() {
  // 1. Generate Customers
  const customers: Customer[] = Array.from({ length: 100 }, (_, i) => {
    const name = generateIndonesianName();
    const id = `CST-${String(i + 1).padStart(3, '0')}`;
    const email = `${name.toLowerCase().replace(/\s+/g, '')}@gmail.com`;
    const joinedDaysAgo = getRandomRange(10, 365);
    const joinedDate = new Date();
    joinedDate.setDate(joinedDate.getDate() - joinedDaysAgo);

    return {
      id,
      name,
      phone: generatePhone(),
      email,
      address: generateAddress(),
      status: Math.random() > 0.1 ? 'Active' : 'Inactive',
      balance: getRandomRange(0, 10) > 8 ? getRandomRange(50000, 500000) : 0,
      joinedDate: joinedDate.toISOString().split('T')[0]
    };
  });

  // 2. Generate Vendors
  const vendors: Vendor[] = Array.from({ length: 50 }, (_, i) => {
    const id = `VND-${String(i + 1).padStart(3, '0')}`;
    const companyName = i < VENDOR_COMPANIES.length ? VENDOR_COMPANIES[i] : `CV Oksigen Mandiri ${i - VENDOR_COMPANIES.length + 1}`;
    const repName = generateIndonesianName();
    const email = `marketing@${companyName.toLowerCase().replace(/\s+/g, '')}.co.id`;

    return {
      id,
      name: repName,
      companyName,
      phone: generatePhone(),
      email,
      address: generateAddress(),
      status: Math.random() > 0.05 ? 'Active' : 'Inactive'
    };
  });

  // 3. Generate Cylinders
  const cylinders: Cylinder[] = Array.from({ length: 100 }, (_, i) => {
    const id = `CYL-${String(i + 1).padStart(3, '0')}`;
    const serialNo = `SN-OX-${getRandomRange(10000, 99999)}`;
    const size = getRandomItem(['1m3', '2m3', '6m3']) as '1m3' | '2m3' | '6m3';
    const statusVal = getRandomItem(['Available', 'Rented', 'At Vendor', 'Maintenance']);
    const inspectionDaysAgo = getRandomRange(1, 180);
    const lastInspection = new Date();
    lastInspection.setDate(lastInspection.getDate() - inspectionDaysAgo);

    return {
      id,
      serialNo,
      oxygenType: getRandomItem(OXYGEN_TYPES).name,
      size,
      status: statusVal as 'Available' | 'Rented' | 'At Vendor' | 'Maintenance',
      lastInspection: lastInspection.toISOString().split('T')[0]
    };
  });

  // 4. Generate Products (with stocks)
  const products: Product[] = PRODUCTS_LIST.map((p, i) => {
    return {
      ...p,
      stock: getRandomRange(10, 150)
    };
  });

  // Additional products up to 100
  const extraProducts: Product[] = Array.from({ length: 90 }, (_, i) => {
    const id = `PRD-${String(i + 11).padStart(3, '0')}`;
    const categories: ('Gas' | 'Equipment' | 'Accessory')[] = ['Gas', 'Equipment', 'Accessory'];
    const category = getRandomItem(categories);
    const cost = getRandomRange(20, 500) * 1000;
    const price = Math.round(cost * 1.4 / 1000) * 1000;
    const names = {
      Gas: ['Refill Oksigen 1m3', 'Refill Oksigen 2m3', 'Refill Oksigen 6m3', 'Nitrogen Gas 1m3', 'Argon Gas 1m3'],
      Equipment: ['Wall Flowmeter', 'Cylinder Cap Steel', 'Trolley Stainless 1m3', 'O2 Concentrator 5L'],
      Accessory: ['Oxygen Tubing Connector', 'Masker Oksigen Anak', 'Wrench Cylinder Valve', 'Filter Concentrator']
    };
    const name = getRandomItem(names[category]) + ` Type-${getRandomRange(1, 5)}`;

    return {
      id,
      name,
      category,
      stock: getRandomRange(5, 200),
      price,
      cost,
      description: `Deskripsi untuk produk ${name} kategori ${category}`
    };
  });
  const allProducts = [...products, ...extraProducts];

  // 5. Generate Rentals
  const rentals: Rental[] = [];
  const rentedCylinders = cylinders.filter(c => c.status === 'Rented');
  
  // Create ongoing active rentals for the rented cylinders
  rentedCylinders.forEach((cyl, index) => {
    const cust = getRandomItem(customers);
    const rentDaysAgo = getRandomRange(1, 30);
    const rentDate = new Date();
    rentDate.setDate(rentDate.getDate() - rentDaysAgo);
    const returnDate = new Date(rentDate);
    returnDate.setDate(returnDate.getDate() + 7); // 7-day standard rental

    const deposit = cyl.size === '1m3' ? 200000 : cyl.size === '2m3' ? 300000 : 500000;
    const rentalFee = cyl.size === '1m3' ? 50000 : cyl.size === '2m3' ? 75000 : 150000;
    
    rentals.push({
      id: `RNT-${String(index + 1).padStart(3, '0')}`,
      customerId: cust.id,
      customerName: cust.name,
      cylinderId: cyl.id,
      cylinderSerial: cyl.serialNo,
      rentDate: rentDate.toISOString().split('T')[0],
      returnDate: returnDate.toISOString().split('T')[0],
      deposit,
      rentalFee,
      status: returnDate < new Date() ? 'Overdue' : 'Active'
    });
  });

  // Create returned historical rentals
  for (let i = 0; i < 70; i++) {
    const idNum = rentals.length + 1;
    const cust = getRandomItem(customers);
    const cyl = getRandomItem(cylinders);
    const rentDaysAgo = getRandomRange(35, 120);
    const rentDate = new Date();
    rentDate.setDate(rentDate.getDate() - rentDaysAgo);
    
    const returnDate = new Date(rentDate);
    returnDate.setDate(returnDate.getDate() + getRandomRange(3, 14));
    
    const actualReturnDate = new Date(returnDate);
    if (Math.random() > 0.2) {
      actualReturnDate.setDate(actualReturnDate.getDate() + getRandomRange(-2, 2));
    }

    const deposit = cyl.size === '1m3' ? 200000 : cyl.size === '2m3' ? 300000 : 500000;
    const rentalFee = cyl.size === '1m3' ? 50000 : cyl.size === '2m3' ? 75000 : 150000;

    rentals.push({
      id: `RNT-${String(idNum).padStart(3, '0')}`,
      customerId: cust.id,
      customerName: cust.name,
      cylinderId: cyl.id,
      cylinderSerial: cyl.serialNo,
      rentDate: rentDate.toISOString().split('T')[0],
      returnDate: returnDate.toISOString().split('T')[0],
      actualReturnDate: actualReturnDate.toISOString().split('T')[0],
      deposit,
      rentalFee,
      status: 'Returned'
    });
  }

  // 6. Generate Refills
  const refills: Refill[] = [];
  const refillCyls = cylinders.filter(c => c.status === 'At Vendor');
  
  refillCyls.forEach((cyl, index) => {
    const vendor = getRandomItem(vendors);
    const sendDaysAgo = getRandomRange(1, 10);
    const sendDate = new Date();
    sendDate.setDate(sendDate.getDate() - sendDaysAgo);
    
    const cost = cyl.size === '1m3' ? 25000 : cyl.size === '2m3' ? 40000 : 80000;

    refills.push({
      id: `REF-${String(index + 1).padStart(3, '0')}`,
      cylinderId: cyl.id,
      cylinderSerial: cyl.serialNo,
      vendorId: vendor.id,
      vendorName: vendor.companyName,
      sendDate: sendDate.toISOString().split('T')[0],
      cost,
      status: Math.random() > 0.5 ? 'Sent' : 'In Queue'
    });
  });

  // Historical refills
  for (let i = 0; i < 40; i++) {
    const idNum = refills.length + 1;
    const cyl = getRandomItem(cylinders);
    const vendor = getRandomItem(vendors);
    const sendDaysAgo = getRandomRange(12, 120);
    const sendDate = new Date();
    sendDate.setDate(sendDate.getDate() - sendDaysAgo);
    
    const returnDate = new Date(sendDate);
    returnDate.setDate(returnDate.getDate() + getRandomRange(2, 5));
    const cost = cyl.size === '1m3' ? 25000 : cyl.size === '2m3' ? 40000 : 80000;

    refills.push({
      id: `REF-${String(idNum).padStart(3, '0')}`,
      cylinderId: cyl.id,
      cylinderSerial: cyl.serialNo,
      vendorId: vendor.id,
      vendorName: vendor.companyName,
      sendDate: sendDate.toISOString().split('T')[0],
      returnDate: returnDate.toISOString().split('T')[0],
      cost,
      status: 'Returned'
    });
  }

  // 7. Generate Stock Movements
  const stockMovements: StockMovement[] = [];
  for (let i = 0; i < 50; i++) {
    const product = getRandomItem(allProducts);
    const moveDaysAgo = getRandomRange(1, 90);
    const date = new Date();
    date.setDate(date.getDate() - moveDaysAgo);
    const types: ('Incoming' | 'Outgoing' | 'Adjustment')[] = ['Incoming', 'Outgoing', 'Adjustment'];
    const type = getRandomItem(types);
    const quantity = getRandomRange(1, 20);

    stockMovements.push({
      id: `MVT-${String(i + 1).padStart(3, '0')}`,
      itemId: product.id,
      itemName: product.name,
      itemType: 'Product',
      type,
      quantity,
      date: date.toISOString().split('T')[0],
      reason: type === 'Incoming' ? 'Pembelian supplier' : type === 'Outgoing' ? 'Penjualan retail' : 'Koreksi stok opname'
    });
  }

  // 8. Generate Purchases
  const purchases: Purchase[] = [];
  for (let i = 0; i < 40; i++) {
    const vendor = getRandomItem(vendors);
    const purchaseDaysAgo = getRandomRange(5, 120);
    const date = new Date();
    date.setDate(date.getDate() - purchaseDaysAgo);
    
    const item1 = getRandomItem(allProducts);
    const item2 = getRandomItem(allProducts);
    const qty1 = getRandomRange(10, 50);
    const qty2 = getRandomRange(5, 20);

    const items = [
      { itemId: item1.id, name: item1.name, qty: qty1, cost: item1.cost },
      { itemId: item2.id, name: item2.name, qty: qty2, cost: item2.cost }
    ];
    const totalAmount = (qty1 * item1.cost) + (qty2 * item2.cost);

    purchases.push({
      id: `PRC-${String(i + 1).padStart(3, '0')}`,
      vendorId: vendor.id,
      vendorName: vendor.companyName,
      items,
      totalAmount,
      date: date.toISOString().split('T')[0],
      status: purchaseDaysAgo < 15 && Math.random() > 0.7 ? 'Pending' : 'Completed'
    });
  }

  // 9. Generate Sales
  const sales: Sale[] = [];
  for (let i = 0; i < 80; i++) {
    const cust = getRandomItem(customers);
    const saleDaysAgo = getRandomRange(1, 90);
    const date = new Date();
    date.setDate(date.getDate() - saleDaysAgo);
    
    const p1 = getRandomItem(allProducts);
    const p2 = getRandomItem(allProducts);
    const qty1 = getRandomRange(1, 5);
    const qty2 = getRandomRange(1, 2);

    const items = [
      { productId: p1.id, name: p1.name, qty: qty1, price: p1.price },
      { productId: p2.id, name: p2.name, qty: qty2, price: p2.price }
    ];
    const totalAmount = (qty1 * p1.price) + (qty2 * p2.price);
    const paymentMethods: ('Cash' | 'Transfer' | 'E-Wallet')[] = ['Cash', 'Transfer', 'E-Wallet'];
    const paymentMethod = getRandomItem(paymentMethods);

    sales.push({
      id: `SAL-${String(i + 1).padStart(3, '0')}`,
      customerId: cust.id,
      customerName: cust.name,
      items,
      totalAmount,
      date: date.toISOString().split('T')[0],
      paymentMethod,
      status: 'Paid'
    });
  }

  // 10. Generate Expenses
  const expenses: Expense[] = [];
  const expenseCats: Array<'Operational' | 'Utilities' | 'Rent' | 'Refills' | 'Marketing' | 'Salaries' | 'Other'> = [
    'Operational', 'Utilities', 'Rent', 'Refills', 'Marketing', 'Salaries', 'Other'
  ];
  const expenseDescs = {
    Operational: ['Bensin mobil operasional', 'Servis mobil tangki', 'Pembelian ATK kantor', 'Pembersihan gudang'],
    Utilities: ['Tagihan listrik PLN kantor', 'Tagihan air PDAM', 'Tagihan Wifi Biznet', 'Pulsa HP operasional'],
    Rent: ['Sewa ruko gudang cabang', 'Sewa printer kantor'],
    Refills: ['Biaya isi ulang tabung gas vendor', 'DP biaya refill samator'],
    Marketing: ['Pembuatan brosur cetak', 'Iklan Facebook & Instagram ads', 'Sponsor event kesehatan'],
    Salaries: ['Gaji karyawan gudang', 'Gaji supir pengiriman', 'Bonus pencapaian sales'],
    Other: ['Konsumsi rapat bulanan', 'Sumbangan warga sekitar']
  };

  for (let i = 0; i < 60; i++) {
    const category = getRandomItem(expenseCats);
    const descList = expenseDescs[category];
    const description = getRandomItem(descList);
    const expenseDaysAgo = getRandomRange(1, 90);
    const date = new Date();
    date.setDate(date.getDate() - expenseDaysAgo);
    const amount = getRandomRange(1, 30) * 100000;

    expenses.push({
      id: `EXP-${String(i + 1).padStart(3, '0')}`,
      category,
      description,
      amount,
      date: date.toISOString().split('T')[0],
      status: expenseDaysAgo < 7 && Math.random() > 0.5 ? 'Pending' : 'Approved'
    });
  }

  // 11. Compile Unified 500+ Transactions
  const transactions: Transaction[] = [];
  
  rentals.forEach(r => {
    transactions.push({
      id: `TX-${r.id}`,
      date: r.rentDate,
      type: 'Rental',
      description: `Rental ${r.cylinderSerial} - ${r.customerName}`,
      amount: r.rentalFee,
      status: r.status === 'Active' ? 'Active' : r.status === 'Overdue' ? 'Pending' : 'Completed',
      referenceId: r.id
    });
  });

  refills.forEach(r => {
    transactions.push({
      id: `TX-${r.id}`,
      date: r.sendDate,
      type: 'Refill',
      description: `Isi Ulang ${r.cylinderSerial} di ${r.vendorName}`,
      amount: r.cost,
      status: r.status === 'Returned' ? 'Completed' : 'In Progress',
      referenceId: r.id
    });
  });

  purchases.forEach(p => {
    transactions.push({
      id: `TX-${p.id}`,
      date: p.date,
      type: 'Purchase',
      description: `Pembelian Stok - ${p.vendorName}`,
      amount: p.totalAmount,
      status: p.status === 'Completed' ? 'Completed' : p.status === 'Pending' ? 'Pending' : 'Cancelled',
      referenceId: p.id
    });
  });

  sales.forEach(s => {
    transactions.push({
      id: `TX-${s.id}`,
      date: s.date,
      type: 'Sale',
      description: `Penjualan Retail - ${s.customerName}`,
      amount: s.totalAmount,
      status: s.status === 'Paid' ? 'Completed' : 'Pending',
      referenceId: s.id
    });
  });

  expenses.forEach(e => {
    transactions.push({
      id: `TX-${e.id}`,
      date: e.date,
      type: 'Expense',
      description: `Pengeluaran: ${e.description}`,
      amount: e.amount,
      status: e.status === 'Approved' ? 'Completed' : e.status === 'Pending' ? 'Pending' : 'Rejected',
      referenceId: e.id
    });
  });

  let txId = transactions.length + 1;
  while (transactions.length < 500) {
    const types: ('Rental' | 'Refill' | 'Purchase' | 'Sale' | 'Expense')[] = ['Rental', 'Refill', 'Purchase', 'Sale', 'Expense'];
    const type = getRandomItem(types);
    const daysAgo = getRandomRange(120, 365);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    
    let description = '';
    let amount = 0;
    let statusVal: Transaction['status'] = 'Completed';
    let refId = '';

    if (type === 'Rental') {
      const c = getRandomItem(customers);
      description = `Rental Oksigen 1m3 - ${c.name}`;
      amount = 50000;
      refId = `RNT-OLD-${txId}`;
    } else if (type === 'Refill') {
      const v = getRandomItem(vendors);
      description = `Isi Ulang Oksigen 6m3 di ${v.companyName}`;
      amount = 80000;
      refId = `REF-OLD-${txId}`;
    } else if (type === 'Purchase') {
      const v = getRandomItem(vendors);
      description = `Restock Regulator Oksigen - ${v.companyName}`;
      amount = getRandomRange(10, 30) * 180000;
      refId = `PRC-OLD-${txId}`;
    } else if (type === 'Sale') {
      const c = getRandomItem(customers);
      description = `Penjualan Regulator & Masker - ${c.name}`;
      amount = getRandomRange(1, 3) * 275000;
      refId = `SAL-OLD-${txId}`;
    } else {
      description = 'Biaya operasional & ATK kantor';
      amount = getRandomRange(5, 50) * 10000;
      refId = `EXP-OLD-${txId}`;
    }

    transactions.push({
      id: `TX-${String(txId).padStart(4, '0')}`,
      date: date.toISOString().split('T')[0],
      type,
      description,
      amount,
      status: statusVal,
      referenceId: refId
    });
    txId++;
  }

  transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return {
    customers,
    vendors,
    cylinders,
    products: allProducts,
    rentals,
    refills,
    stockMovements,
    purchases,
    sales,
    expenses,
    transactions
  };
}

export function formatRupiah(val: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(val);
}
