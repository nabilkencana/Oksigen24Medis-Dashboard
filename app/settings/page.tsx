'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useData } from '../../context/DataContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Shield, Users, Save, Check, User, Eye, EyeOff } from 'lucide-react';

type TabType = 'users' | 'roles' | 'profile';

export default function SettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as TabType) || 'users';
  
  const { theme, toggleTheme, user } = useData();
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const changeTab = (tab: TabType) => {
    setActiveTab(tab);
    router.replace(`/settings?tab=${tab}`);
  };

  const [profileForm, setProfileForm] = useState({
    name: 'Administrator Utama',
    email: 'admin@oksigen24jam.co.id',
    phone: '0811-9988-7766',
    password: 'Password123!',
    role: 'Admin'
  });

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || 'Administrator Utama',
        email: user.email || 'admin@oksigen24jam.co.id',
        phone: user.phone || '0811-9988-7766',
        password: 'Password123!',
        role: (user.role && typeof user.role === 'object' ? user.role.name : user.role) || 'Admin'
      });
    }
  }, [user]);

  const handleSave = (e: React.FormEvent, msg: string) => {
    e.preventDefault();
    alert(msg);
  };

  // Mock User List
  const erpUsers = [
    { id: 'USR-01', name: 'Nabil Kencana', email: 'nabil@oksigen24jam.co.id', role: 'Owner', status: 'Active' },
    { id: 'USR-02', name: 'Ahmad Faisal', email: 'faisal@oksigen24jam.co.id', role: 'Admin', status: 'Active' },
    { id: 'USR-03', name: 'Sari Indah', email: 'sari@oksigen24jam.co.id', role: 'Finance', status: 'Active' },
    { id: 'USR-04', name: 'Eko Budiman', email: 'eko@oksigen24jam.co.id', role: 'Warehouse Staff', status: 'Active' }
  ];

  // Role permissions Matrix representation
  const modules = ['Pelanggan & Vendor', 'Tabung Oksigen', 'Penyewaan Tabung', 'Isi Ulang (Refill)', 'Kasir POS Ritel', 'Kas Pengeluaran', 'Pengaturan Akses'];
  const rolePermissions: Record<string, string[]> = {
    Owner: ['Pelanggan & Vendor', 'Tabung Oksigen', 'Penyewaan Tabung', 'Isi Ulang (Refill)', 'Kasir POS Ritel', 'Kas Pengeluaran', 'Pengaturan Akses'],
    Admin: ['Pelanggan & Vendor', 'Tabung Oksigen', 'Penyewaan Tabung', 'Isi Ulang (Refill)', 'Kasir POS Ritel', 'Kas Pengeluaran'],
    Finance: ['Pelanggan & Vendor', 'Kasir POS Ritel', 'Kas Pengeluaran'],
    'Warehouse Staff': ['Tabung Oksigen', 'Isi Ulang (Refill)']
  };

  return (
    <div className="space-y-6">
      
      {/* Title with tab buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Pengaturan Sistem</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Konfigurasi data karyawan, hak akses, dan detail akun personal.</p>
        </div>

        <div className="flex gap-1 bg-muted/40 p-1 border border-border rounded-xl text-xs font-semibold shrink-0">
          <button
            onClick={() => changeTab('users')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${activeTab === 'users' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Karyawan
          </button>
          <button
            onClick={() => changeTab('roles')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${activeTab === 'roles' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Hak Akses
          </button>
          <button
            onClick={() => changeTab('profile')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${activeTab === 'profile' ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Profil Saya
          </button>
        </div>
      </div>

      <div className="min-w-0">
        
        {/* 1. USERS LIST */}
        {activeTab === 'users' && (
          <Card>
            <CardHeader>
              <CardTitle>Daftar Akun Karyawan</CardTitle>
              <CardDescription>Manajemen data akun staf operasional sistem logistik oksigen.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/60 text-xs">
                {erpUsers.map(usr => (
                  <div key={usr.id} className="flex justify-between items-center p-4">
                    <div className="flex gap-3 items-center">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-bold text-muted-foreground select-none">
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
        )}

        {/* 2. ROLES AND PERMISSIONS MATRIX */}
        {activeTab === 'roles' && (
          <Card>
            <CardHeader>
              <CardTitle>Matriks Peran & Otorisasi Hak Akses</CardTitle>
              <CardDescription>Pencocokan fungsionalitas menu transaksi berdasarkan tingkat peran kerja.</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-xs text-left border border-border">
                <thead className="bg-muted/40 font-bold border-b border-border">
                  <tr>
                    <th className="p-3 border-r border-border">Nama Modul Sistem</th>
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
        )}

        {/* 3. USER PROFILE */}
        {activeTab === 'profile' && (
          <Card>
            <CardHeader>
              <CardTitle>Akun Personal Saya</CardTitle>
              <CardDescription>Konfigurasi data login Administrator dan perubahan kata sandi.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={e => handleSave(e, 'Data profil personal Anda berhasil diperbarui!')} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Nama Lengkap *"
                    id="settUserName"
                    value={profileForm.name}
                    onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                  />
                  <Input
                    label="Alamat Email Kredensial *"
                    id="settUserEmail"
                    type="email"
                    value={profileForm.email}
                    onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Nomor Telepon Pribadi"
                    id="settUserPhone"
                    value={profileForm.phone}
                    onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                  />
                  <div className="relative flex items-end">
                    <Input
                      label="Ubah Kata Sandi (Password)"
                      id="settUserPass"
                      type={showPassword ? 'text' : 'password'}
                      value={profileForm.password}
                      onChange={e => setProfileForm({ ...profileForm, password: e.target.value })}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 bottom-2.5 p-1 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="border-t border-border pt-4 flex justify-between items-center">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground">Tingkat Jabatan Anda:</span>
                    <Badge variant="secondary">{profileForm.role}</Badge>
                  </div>
                  <Button type="submit" className="flex items-center gap-1.5">
                    <Save className="w-4 h-4" /> Perbarui Akun Saya
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

      </div>

    </div>
  );
}
