'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useData } from '../../context/DataContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Pagination } from '../../components/ui/Table';
import { Search, ArrowUpDown, ChevronLeft, ArrowDown, ArrowUp } from 'lucide-react';
import { Button } from '../../components/ui/Button';

// Mapper to translate database reasons to Indonesian
const mapReasonToIndonesian = (reason: string) => {
  const r = reason.toUpperCase();
  if (r === 'RETURN') return 'Pengembalian Tabung';
  if (r === 'RENTAL') return 'Penyewaan Tabung';
  if (r === 'VENDOR_REFILL') return 'Isi Ulang Vendor';
  if (r === 'SALE') return 'Penjualan Ritel';
  if (r === 'PURCHASE') return 'Pembelian Restock';
  if (r === 'ADJUSTMENT') return 'Penyesuaian Stok';
  return reason;
};

export default function StockMovementsPage() {
  const router = useRouter();
  const { stockMovements } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter movements based on search term & type
  const filteredMovements = useMemo(() => {
    return stockMovements.filter(m => {
      const indonesianReason = mapReasonToIndonesian(m.reason);
      const matchesSearch =
        m.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.itemId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
        indonesianReason.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = typeFilter === 'All' || m.type === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [stockMovements, searchTerm, typeFilter]);

  // Paginated movements
  const totalPages = Math.ceil(filteredMovements.length / itemsPerPage);
  const paginatedMovements = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredMovements.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredMovements, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-6">
      
      {/* Header back navigation and title */}
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => router.push('/')}
          className="flex items-center gap-1.5 border border-border"
        >
          <ChevronLeft className="w-4 h-4" /> Kembali ke Dashboard
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6">
          <div>
            <CardTitle>Aktivitas Logistik & Gudang</CardTitle>
            <CardDescription>Riwayat mutasi keluar masuk tabung oksigen dan produk aksesoris.</CardDescription>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Search Bar */}
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cari item, serial, atau alasan..."
                value={searchTerm}
                onChange={e => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9 h-10 w-full"
              />
            </div>
            
            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={e => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="flex h-10 w-full sm:w-40 rounded-lg border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <option value="All">Semua Tipe</option>
              <option value="Incoming">Masuk (Incoming)</option>
              <option value="Outgoing">Keluar (Outgoing)</option>
              <option value="Adjustment">Penyesuaian</option>
            </select>
          </div>
        </CardHeader>
        
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID Mutasi</TableHead>
                <TableHead>Nama & Serial Item</TableHead>
                <TableHead>Tipe Item</TableHead>
                <TableHead>Tipe Mutasi</TableHead>
                <TableHead>Jumlah (Qty)</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Keterangan / Alasan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedMovements.length > 0 ? (
                paginatedMovements.map(mvt => {
                  return (
                    <TableRow key={mvt.id}>
                      <TableCell className="font-bold text-foreground">{mvt.id}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-semibold text-xs">{mvt.itemName}</p>
                          <p className="text-4xs text-muted-foreground mt-0.5">{mvt.itemId}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {mvt.itemType === 'Cylinder' ? 'Tabung' : 'Aksesoris'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold ${
                          mvt.type === 'Incoming' ? 'text-emerald-500' : mvt.type === 'Outgoing' ? 'text-blue-500' : 'text-amber-500'
                        }`}>
                          {mvt.type === 'Incoming' ? <ArrowUp className="w-3.5 h-3.5" /> : mvt.type === 'Outgoing' ? <ArrowDown className="w-3.5 h-3.5" /> : <ArrowUpDown className="w-3.5 h-3.5" />}
                          {mvt.type === 'Incoming' ? 'Masuk' : mvt.type === 'Outgoing' ? 'Keluar' : 'Penyesuaian'}
                        </span>
                      </TableCell>
                      <TableCell className="font-bold text-foreground">
                        {mvt.type === 'Outgoing' ? '-' : '+'}{mvt.quantity}
                      </TableCell>
                      <TableCell>{mvt.date}</TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-xs truncate" title={mapReasonToIndonesian(mvt.reason)}>
                        {mapReasonToIndonesian(mvt.reason)}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    Tidak ada riwayat aktivitas logistik ditemukan.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="mt-4 flex justify-end">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                totalItems={filteredMovements.length}
                itemsPerPage={itemsPerPage}
              />
            </div>
          )}
        </CardContent>
      </Card>
      
    </div>
  );
}
