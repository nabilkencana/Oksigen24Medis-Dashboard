'use client';

import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Sun, Moon, Bell, Building, Shield, Users, Save, Check } from 'lucide-react';

export default function SettingsPage() {
  const { theme, toggleTheme } = useData();
  const [activeSubTab, setActiveSubTab] = useState<'company' | 'users' | 'notifications' | 'theme'>('company');

  // Form states
  const [companyForm, setCompanyForm] = useState({
    name: 'PT Oksigen 24 Medika',
    email: 'info@oksigen24medis.co.id',
    phone: '0812-3456-7890',
    address: 'Jl. Gatot Subroto No. 45, Bandung',
    npwp: '01.234.567.8-901.000'
  });

  const [notificationConfig, setNotificationConfig] = useState({
    rentalOverdueWa: true,
    lowStockEmail: true,
    refillReturnedWa: false,
    expenseApprovalEmail: true
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Konfigurasi pengaturan berhasil disimpan!');
  };

  // Mock User List
  const erpUsers = [
    { id: 'USR-01', name: 'Nabil Kencana', email: 'nabil@oksigen24.com', role: 'Owner', status: 'Active' },
    { id: 'USR-02', name: 'Ahmad Faisal', email: 'faisal@oksigen24.com', role: 'Admin', status: 'Active' },
    { id: 'USR-03', name: 'Sari Indah', email: 'sari@oksigen24.com', role: 'Finance', status: 'Active' },
    { id: 'USR-04', name: 'Eko Budiman', email: 'eko@oksigen24.com', role: 'Warehouse Staff', status: 'Active' }
  ];

  // Role permissions Matrix representation
  const modules = ['Master Customer', 'Master Cylinders', 'Oxygen Rentals', 'Vendor Refills', 'Sales POS', 'Expenses Log', 'Settings Access'];
  const rolePermissions: Record<string, string[]> = {
    Owner: ['Master Customer', 'Master Cylinders', 'Oxygen Rentals', 'Vendor Refills', 'Sales POS', 'Expenses Log', 'Settings Access'],
    Admin: ['Master Customer', 'Master Cylinders', 'Oxygen Rentals', 'Vendor Refills', 'Sales POS', 'Expenses Log'],
    Finance: ['Master Customer', 'Sales POS', 'Expenses Log'],
    'Warehouse Staff': ['Master Cylinders', 'Vendor Refills']
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-foreground">Pengaturan ERP Sistem</h2>
        <p className="text-xs text-muted-foreground mt-1">Konfigurasi profile korporat, notifikasi WhatsApp/Email, kelola hak akses pengguna, dan tema tampilan.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Settings Navigation list (left side) */}
        <aside className="w-full lg:w-60 flex flex-row lg:flex-col gap-1 border-b lg:border-b-0 lg:border-r border-border pb-3 lg:pb-0 lg:pr-4 shrink-0 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveSubTab('company')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors cursor-pointer w-full text-left truncate shrink-0 ${
              activeSubTab === 'company' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent text-muted-foreground'
            }`}
          >
            <Building className="w-4 h-4 shrink-0" />
            <span>Profile Perusahaan</span>
          </button>
          <button
            onClick={() => setActiveSubTab('users')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors cursor-pointer w-full text-left truncate shrink-0 ${
              activeSubTab === 'users' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent text-muted-foreground'
            }`}
          >
            <Shield className="w-4 h-4 shrink-0" />
            <span>Pengguna & Hak Akses</span>
          </button>
          <button
            onClick={() => setActiveSubTab('notifications')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors cursor-pointer w-full text-left truncate shrink-0 ${
              activeSubTab === 'notifications' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent text-muted-foreground'
            }`}
          >
            <Bell className="w-4 h-4 shrink-0" />
            <span>Notifikasi Triggers</span>
          </button>
          <button
            onClick={() => setActiveSubTab('theme')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors cursor-pointer w-full text-left truncate shrink-0 ${
              activeSubTab === 'theme' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent text-muted-foreground'
            }`}
          >
            <Sun className="w-4 h-4 shrink-0" />
            <span>Tema Tampilan</span>
          </button>
        </aside>

        {/* Setting Content Panels */}
        <div className="flex-1 min-w-0">
          
          {/* 1. COMPANY PROFILE */}
          {activeSubTab === 'company' && (
            <Card>
              <CardHeader>
                <CardTitle>Profil Perusahaan</CardTitle>
                <CardDescription>Detail legalitas korporat untuk format kop struk POS dan print PDF invoice sewa.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSave} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Nama Perusahaan *"
                      id="compName"
                      value={companyForm.name}
                      onChange={e => setCompanyForm({ ...companyForm, name: e.target.value })}
                    />
                    <Input
                      label="Nomor NPWP Legalitas"
                      id="compNpwp"
                      value={companyForm.npwp}
                      onChange={e => setCompanyForm({ ...companyForm, npwp: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Email Admin *"
                      id="compEmail"
                      type="email"
                      value={companyForm.email}
                      onChange={e => setCompanyForm({ ...companyForm, email: e.target.value })}
                    />
                    <Input
                      label="WhatsApp Hotline *"
                      id="compPhone"
                      value={companyForm.phone}
                      onChange={e => setCompanyForm({ ...companyForm, phone: e.target.value })}
                    />
                  </div>
                  <Textarea
                    label="Alamat Kantor Pusat *"
                    id="compAddress"
                    value={companyForm.address}
                    onChange={e => setCompanyForm({ ...companyForm, address: e.target.value })}
                  />
                  <div className="border-t border-border pt-4 flex justify-end">
                    <Button type="submit" className="flex items-center gap-1.5">
                      <Save className="w-4 h-4" /> Simpan Profil
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* 2. USERS & ROLES */}
          {activeSubTab === 'users' && (
            <div className="space-y-6">
              
              {/* Users list */}
              <Card>
                <CardHeader>
                  <CardTitle>Daftar Pengguna ERP</CardTitle>
                  <CardDescription>Manajemen data akun staf operasional sistem logistik.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border/60 text-xs">
                    {erpUsers.map(usr => (
                      <div key={usr.id} className="flex justify-between items-center p-4">
                        <div className="flex gap-3 items-center">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-bold text-muted-foreground">
                            {usr.name.substring(0,2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-foreground">{usr.name}</p>
                            <p className="text-muted-foreground mt-0.5">{usr.email} • ID: {usr.id}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-muted-foreground">{usr.role}</span>
                          <Badge variant="success">AKTIF</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Roles matrix */}
              <Card>
                <CardHeader>
                  <CardTitle>Matriks Izin Hak Akses (Permissions)</CardTitle>
                  <CardDescription>Pencocokan fungsionalitas modul berdasarkan peran kerja karyawan.</CardDescription>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <table className="w-full text-xs text-left border border-border">
                    <thead className="bg-muted/40 font-bold border-b border-border">
                      <tr>
                        <th className="p-3 border-r border-border">Nama Modul ERP</th>
                        <th className="p-3 text-center border-r border-border">Owner</th>
                        <th className="p-3 text-center border-r border-border">Admin</th>
                        <th className="p-3 text-center border-r border-border">Finance</th>
                        <th className="p-3 text-center">Warehouse</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {modules.map((mod, index) => (
                        <tr key={index} className="hover:bg-muted/10">
                          <td className="p-3 font-semibold border-r border-border">{mod}</td>
                          <td className="p-3 text-center border-r border-border">
                            {rolePermissions['Owner'].includes(mod) ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> : '-'}
                          </td>
                          <td className="p-3 text-center border-r border-border">
                            {rolePermissions['Admin'].includes(mod) ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> : '-'}
                          </td>
                          <td className="p-3 text-center border-r border-border">
                            {rolePermissions['Finance'].includes(mod) ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> : '-'}
                          </td>
                          <td className="p-3 text-center">
                            {rolePermissions['Warehouse Staff'].includes(mod) ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>

            </div>
          )}

          {/* 3. NOTIFICATION TRIGGERS */}
          {activeSubTab === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle>Pemberitahuan Sistem Otomatis</CardTitle>
                <CardDescription>Atur pengiriman pesan WhatsApp & Email otomatis dari aksi kasir / gudang.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSave} className="space-y-4">
                  <div className="divide-y divide-border">
                    
                    {/* Overdue alert */}
                    <div className="flex justify-between items-center py-3">
                      <div>
                        <p className="text-xs font-bold text-foreground">WhatsApp Pengingat Jatuh Tempo</p>
                        <p className="text-3xs text-muted-foreground mt-0.5">Kirim penagihan WhatsApp otomatis H-1 batas sewa tabung customer.</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificationConfig.rentalOverdueWa}
                        onChange={e => setNotificationConfig({ ...notificationConfig, rentalOverdueWa: e.target.checked })}
                        className="w-4.5 h-4.5 text-primary border-border bg-background rounded focus:ring-primary cursor-pointer"
                      />
                    </div>

                    {/* Low stock alert */}
                    <div className="flex justify-between items-center py-3">
                      <div>
                        <p className="text-xs font-bold text-foreground">Email Notifikasi Stok Menipis</p>
                        <p className="text-3xs text-muted-foreground mt-0.5">Beri laporan email harian jika ada produk retail dengan stok kurang dari 10 pcs.</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificationConfig.lowStockEmail}
                        onChange={e => setNotificationConfig({ ...notificationConfig, lowStockEmail: e.target.checked })}
                        className="w-4.5 h-4.5 text-primary border-border bg-background rounded focus:ring-primary cursor-pointer"
                      />
                    </div>

                    {/* Refill alerts */}
                    <div className="flex justify-between items-center py-3">
                      <div>
                        <p className="text-xs font-bold text-foreground">WhatsApp Penerimaan Refill</p>
                        <p className="text-3xs text-muted-foreground mt-0.5">Kirim rekapan laporan penerimaan tabung isi kepada Kepala Gudang.</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificationConfig.refillReturnedWa}
                        onChange={e => setNotificationConfig({ ...notificationConfig, refillReturnedWa: e.target.checked })}
                        className="w-4.5 h-4.5 text-primary border-border bg-background rounded focus:ring-primary cursor-pointer"
                      />
                    </div>

                    {/* Expense approvals alert */}
                    <div className="flex justify-between items-center py-3">
                      <div>
                        <p className="text-xs font-bold text-foreground">Email Persetujuan Kas Keluar</p>
                        <p className="text-3xs text-muted-foreground mt-0.5">Kirim email pengajuan approval biaya operasional baru kepada Direktur.</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificationConfig.expenseApprovalEmail}
                        onChange={e => setNotificationConfig({ ...notificationConfig, expenseApprovalEmail: e.target.checked })}
                        className="w-4.5 h-4.5 text-primary border-border bg-background rounded focus:ring-primary cursor-pointer"
                      />
                    </div>

                  </div>
                  <div className="border-t border-border pt-4 flex justify-end">
                    <Button type="submit" className="flex items-center gap-1.5">
                      <Save className="w-4 h-4" /> Simpan Trigger Notifikasi
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* 4. THEME & STYLING */}
          {activeSubTab === 'theme' && (
            <Card>
              <CardHeader>
                <CardTitle>Tema Sistem & Tampilan</CardTitle>
                <CardDescription>Ubah skema warna dasar panel dashboard ERP.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  
                  {/* Light theme selector card */}
                  <div
                    onClick={() => { if (theme === 'dark') toggleTheme(); }}
                    className={`border rounded-xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                      theme === 'light'
                        ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                        : 'border-border hover:border-muted-foreground/40 bg-card'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-500 shadow-inner">
                      <Sun className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-xs">Light Mode</p>
                      <p className="text-4xs text-muted-foreground mt-0.5">Warna dasar putih & bersih</p>
                    </div>
                  </div>

                  {/* Dark theme selector card */}
                  <div
                    onClick={() => { if (theme === 'light') toggleTheme(); }}
                    className={`border rounded-xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                      theme === 'dark'
                        ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                        : 'border-border hover:border-muted-foreground/40 bg-card'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-950 flex items-center justify-center text-blue-400 shadow-inner">
                      <Moon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-xs">Dark Mode (Premium)</p>
                      <p className="text-4xs text-muted-foreground mt-0.5">Warna dasar gelap premium</p>
                    </div>
                  </div>

                </div>
              </CardContent>
            </Card>
          )}

        </div>

      </div>

    </div>
  );
}
