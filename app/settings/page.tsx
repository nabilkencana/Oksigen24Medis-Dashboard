'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useData } from '../../context/DataContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Drawer } from '../../components/ui/Drawer';
import { Modal } from '../../components/ui/Modal';
import { Shield, Users, Save, Check, User, Eye, EyeOff, Plus, Edit2, Trash2 } from 'lucide-react';

type TabType = 'users' | 'roles' | 'profile';

export default function SettingsPage() {
  const getIndonesianRole = (role: string) => {
    const r = String(role).toUpperCase();
    if (r === 'OWNER') return 'Pemilik Bisnis (Owner)';
    if (r === 'ADMIN') return 'Admin';
    if (r === 'FINANCE') return 'Keuangan';
    if (r === 'WAREHOUSE') return 'Staf Gudang';
    return role;
  };

  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as TabType) || 'users';
  
  const { 
    user, 
    users = [], 
    addEmployee, 
    updateEmployee, 
    deleteEmployee, 
    updateProfile 
  } = useData();

  const roleName = String(user?.role?.name || user?.role || 'OWNER').toUpperCase();
  const isOwnerOrAdmin = roleName === 'OWNER' || roleName === 'ADMIN';
  const isOwner = roleName === 'OWNER';

  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Drawer states for Employee Add/Edit
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'add' | 'edit'>('add');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [employeeForm, setEmployeeForm] = useState({
    name: '',
    email: '',
    role: 'ADMIN',
    password: '',
    isActive: true
  });

  // Modal states for Employee Delete
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<any | null>(null);

  useEffect(() => {
    if (user) {
      if (!isOwnerOrAdmin && initialTab !== 'profile') {
        setActiveTab('profile');
        router.replace('/settings?tab=profile');
      } else {
        setActiveTab(initialTab);
      }
    }
  }, [initialTab, user, isOwnerOrAdmin]);

  const changeTab = (tab: TabType) => {
    setActiveTab(tab);
    router.replace(`/settings?tab=${tab}`);
  };

  const [profileForm, setProfileForm] = useState({
    name: 'Administrator Utama',
    email: 'admin@oksigen24jam.co.id',
    phone: '0811-9988-7766',
    password: '',
    role: 'Admin'
  });

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.fullName || user.name || 'Administrator Utama',
        email: user.email || 'admin@oksigen24jam.co.id',
        phone: user.phone || '0811-9988-7766',
        password: '',
        role: (user.role && typeof user.role === 'object' ? user.role.name : user.role) || 'Admin'
      });
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);
    try {
      await updateProfile(profileForm);
      alert('Data profil personal Anda berhasil diperbarui!');
    } catch (err: any) {
      alert(err.message || 'Terjadi kesalahan saat memperbarui profil');
    } finally {
      setIsSaving(false);
    }
  };

  const openAddDrawer = () => {
    setDrawerMode('add');
    setSelectedEmployeeId(null);
    setEmployeeForm({
      name: '',
      email: '',
      role: 'ADMIN',
      password: '',
      isActive: true
    });
    setIsDrawerOpen(true);
  };

  const openEditDrawer = (emp: any) => {
    setDrawerMode('edit');
    setSelectedEmployeeId(emp.id);
    setEmployeeForm({
      name: emp.name,
      email: emp.email,
      role: emp.role,
      password: '',
      isActive: emp.status === 'Active'
    });
    setIsDrawerOpen(true);
  };

  const handleSaveEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);
    try {
      if (drawerMode === 'add') {
        await addEmployee(employeeForm);
        alert('Karyawan berhasil ditambahkan!');
      } else if (selectedEmployeeId) {
        await updateEmployee(selectedEmployeeId, employeeForm);
        alert('Data karyawan berhasil diperbarui!');
      }
      setIsDrawerOpen(false);
    } catch (err: any) {
      alert(err.message || 'Terjadi kesalahan');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!employeeToDelete) return;
    try {
      await deleteEmployee(employeeToDelete.id);
      alert('Karyawan berhasil dinonaktifkan / dihapus!');
    } catch (err: any) {
      alert(err.message || 'Terjadi kesalahan');
    } finally {
      setEmployeeToDelete(null);
    }
  };

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
          {isOwnerOrAdmin && (
            <>
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
            </>
          )}
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
        {activeTab === 'users' && isOwnerOrAdmin && (
          <Card>
            <CardHeader className="flex flex-row justify-between items-center space-y-0 p-6 border-b border-border/40">
              <div>
                <CardTitle>Daftar Akun Karyawan</CardTitle>
                <CardDescription>Manajemen data akun staf operasional sistem logistik oksigen.</CardDescription>
              </div>
              <Button onClick={openAddDrawer} className="flex items-center gap-1.5 text-xs">
                <Plus className="w-3.5 h-3.5" /> Tambah Karyawan
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/60 text-xs">
                {users.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground font-medium">
                    Tidak ada data karyawan ditemukan.
                  </div>
                ) : (
                  users.map(usr => (
                    <div key={usr.id} className="flex justify-between items-center p-4">
                      <div className="flex gap-3 items-center">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold select-none">
                          {(usr.name || '').substring(0,2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-foreground">{usr.name}</p>
                          <p className="text-muted-foreground mt-0.5">{usr.email} • ID: {usr.id}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end gap-1">
                          <span className="font-semibold text-muted-foreground">{getIndonesianRole(usr.role)}</span>
                          <Badge variant={usr.status === 'Active' ? 'success' : 'secondary'}>
                            {usr.status === 'Active' ? 'AKTIF' : 'NON-AKTIF'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1.5 border-l border-border pl-3">
                          <button
                            onClick={() => openEditDrawer(usr)}
                            className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                            title="Edit Karyawan"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {isOwner && (
                            <button
                              onClick={() => {
                                setEmployeeToDelete(usr);
                                setIsDeleteModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg border border-border hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 cursor-pointer transition-colors"
                              title="Hapus Karyawan"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 2. ROLES AND PERMISSIONS MATRIX */}
        {activeTab === 'roles' && isOwnerOrAdmin && (
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
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Nama Lengkap *"
                    id="settUserName"
                    value={profileForm.name}
                    onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                    required
                  />
                  <Input
                    label="Alamat Email Kredensial *"
                    id="settUserEmail"
                    type="email"
                    value={profileForm.email}
                    onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                    required
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
                      label="Ubah Kata Sandi (Kosongkan jika tidak diubah)"
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
                    <Badge variant="secondary">{getIndonesianRole(profileForm.role)}</Badge>
                  </div>
                  <Button type="submit" disabled={isSaving} className="flex items-center gap-1.5">
                    <Save className="w-4 h-4" /> {isSaving ? 'Menyimpan...' : 'Perbarui Akun Saya'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

      </div>

      {/* Drawer: Add/Edit Employee */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={drawerMode === 'add' ? 'Tambah Akun Karyawan Baru' : 'Edit Akun Karyawan'}
      >
        <form onSubmit={handleSaveEmployee} className="space-y-4 text-xs">
          <Input
            label="Nama Lengkap *"
            id="empName"
            value={employeeForm.name}
            onChange={e => setEmployeeForm({ ...employeeForm, name: e.target.value })}
            required
          />
          <Input
            label="Alamat Email Kredensial *"
            id="empEmail"
            type="email"
            value={employeeForm.email}
            onChange={e => setEmployeeForm({ ...employeeForm, email: e.target.value })}
            required
            disabled={drawerMode === 'edit'}
          />
          <Select
            label="Peran Kerja (Role) *"
            id="empRole"
            value={employeeForm.role}
            onChange={e => setEmployeeForm({ ...employeeForm, role: e.target.value })}
            options={[
              { value: 'OWNER', label: 'Owner' },
              { value: 'ADMIN', label: 'Admin' },
              { value: 'FINANCE', label: 'Finance' },
              { value: 'WAREHOUSE', label: 'Warehouse Staff' }
            ]}
          />

          <Input
            label={drawerMode === 'add' ? 'Kata Sandi (Password) *' : 'Ubah Kata Sandi (Kosongkan jika tidak diubah)'}
            id="empPassword"
            type="password"
            value={employeeForm.password}
            onChange={e => setEmployeeForm({ ...employeeForm, password: e.target.value })}
            required={drawerMode === 'add'}
          />

          {drawerMode === 'edit' && (
            <Select
              label="Status Akun"
              id="empStatus"
              value={employeeForm.isActive ? 'true' : 'false'}
              onChange={e => setEmployeeForm({ ...employeeForm, isActive: e.target.value === 'true' })}
              options={[
                { value: 'true', label: 'Aktif' },
                { value: 'false', label: 'Non-Aktif' }
              ]}
            />
          )}

          <div className="border-t border-border pt-4 flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setIsDrawerOpen(false)}
              disabled={isSaving}
            >
              Batal
            </Button>
            <Button type="submit" className="flex-1" disabled={isSaving}>
              {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </div>
        </form>
      </Drawer>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Hapus Karyawan"
        description={`Apakah Anda yakin ingin menghapus / menonaktifkan akun karyawan "${employeeToDelete?.name}"?`}
        confirmText="Hapus"
        cancelText="Batal"
        variant="destructive"
      />

    </div>
  );
}
