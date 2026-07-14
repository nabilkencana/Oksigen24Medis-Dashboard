"use client";

import React, { useState } from "react";
import {
  HelpCircle,
  Wind,
  ShoppingBag,
  ArrowLeftRight,
  ShoppingCart,
  PackagePlus,
  RefreshCw,
  ChevronRight,
  Info,
  CheckCircle2,
  AlertTriangle,
  Camera,
  BookOpen,
  ImageIcon,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type SectionId =
  | "sewa-tabung"
  | "sewa-aksesoris"
  | "pengembalian"
  | "kasir-pos"
  | "restock-supplier"
  | "refill-vendor";

interface Step {
  title: string;
  description: string;
  tip?: string;
  warning?: string;
  screenshotLabel: string;
  /** Path relatif dari /public, mis. "/guide/sewa-tabung/step-1.png" */
  screenshotSrc?: string;
}

interface GuideSection {
  id: SectionId;
  label: string;
  icon: React.ReactNode;
  description: string;
  steps: Step[];
}

// ─── Guide Data ───────────────────────────────────────────────────────────────

const sections: GuideSection[] = [
  {
    id: "sewa-tabung",
    label: "Sewa Tabung",
    icon: <Wind className="w-4 h-4" />,
    description:
      "Panduan untuk membuat kontrak sewa tabung oksigen baru kepada pelanggan, termasuk pengaturan deposit jaminan dan batas waktu pengembalian.",
    steps: [
      {
        title: "Buka Menu Transaksi",
        description:
          'Klik menu "Transaksi" di sidebar kiri, lalu pilih tab "Sewa Tabung" di bagian atas halaman.',
        tip: 'Pastikan tab aktif adalah "Sewa Tabung" sebelum melanjutkan.',
        screenshotLabel: "Halaman Transaksi — Tab Sewa Tabung aktif",
        screenshotSrc: "/assets/demo/sewa-tabung/step-1.png",
      },
      {
        title: 'Klik Tombol "+ Sewa Baru"',
        description:
          'Klik tombol biru "+ Sewa Baru" di pojok kanan atas kartu Kontrak Sewa Oksigen untuk membuka formulir.',
        screenshotLabel: 'Tombol "+ Sewa Baru" di pojok kanan atas',
        screenshotSrc: "/assets/demo/sewa-tabung/step-2.png",
      },
      {
        title: "Pilih Pelanggan",
        description:
          "Pada dropdown Pelanggan, cari dan pilih nama pelanggan. Jika belum terdaftar, tambahkan terlebih dahulu.",
        warning:
          "Pastikan data pelanggan sudah lengkap sebelum membuat kontrak sewa.",
        screenshotLabel: "Dropdown pilih pelanggan di formulir sewa",
        screenshotSrc: "/assets/demo/sewa-tabung/step-3.png",
      },
      {
        title: "Pilih Tabung Oksigen",
        description:
          'Pilih tabung dari dropdown. Hanya tabung berstatus "Tersedia" yang tampil.',
        tip: "Perhatikan ukuran tabung (1m³, 6m³, dsb.) sesuai kebutuhan pelanggan.",
        screenshotLabel: "Dropdown pilih tabung — hanya yang tersedia",
        screenshotSrc: "/assets/demo/sewa-tabung/step-4.png",
      },
      {
        title: "Atur Tanggal & Deposit",
        description:
          "Isi tanggal mulai sewa, batas waktu pengembalian, dan jumlah deposit jaminan yang dibayarkan pelanggan.",
        screenshotLabel: "Input tanggal sewa, batas kembali, dan deposit",
        screenshotSrc: "/assets/demo/sewa-tabung/step-5.png",
      },
      {
        title: "Simpan Kontrak",
        description:
          'Klik "Buat Sewa" untuk menyimpan. Status tabung otomatis berubah menjadi "Disewa" dan kartu kontrak muncul di daftar.',
        tip: "Gunakan ikon printer untuk mencetak bukti sewa langsung dari daftar.",
        screenshotLabel: "Daftar kontrak aktif setelah disimpan",
        screenshotSrc: "/assets/demo/sewa-tabung/step-6.png",
      },
      {
        title: "Detail & Cetak Nota",
        description:
          "Klik ikon mata untuk melihat detail transaksi secara lengkap atau klik ikon print (cetak) untuk mencetak nota bukti transaksi.",
        screenshotLabel: "Melihat detail transaksi atau cetak nota",
        screenshotSrc: "/assets/demo/sewa-tabung/step-7.png",
      },
    ],
  },
  {
    id: "sewa-aksesoris",
    label: "Sewa Aksesoris",
    icon: <ShoppingBag className="w-4 h-4" />,
    description:
      "Panduan untuk menyewakan aksesoris pendukung seperti regulator, humidifier, dan masker oksigen kepada pelanggan.",
    steps: [
      {
        title: "Buka Tab Sewa Aksesoris",
        description:
          'Dari menu Transaksi, klik tab "Sewa Aksesoris" di bagian atas untuk beralih ke daftar sewa aksesoris.',
        screenshotLabel: "Tab Sewa Aksesoris aktif di halaman Transaksi",
        screenshotSrc: "/assets/demo/sewa-aksesoris/step-1.png",
      },
      {
        title: "Tambah Sewa Baru",
        description:
          'Klik tombol "+ Sewa Aksesoris" untuk membuka panel formulir dari sisi kanan layar.',
        screenshotLabel: 'Tombol "+ Sewa Aksesoris"',
        screenshotSrc: "/assets/demo/sewa-aksesoris/step-2.png",
      },
      {
        title: "Pilih Pelanggan & Aksesoris",
        description:
          "Pilih pelanggan dari dropdown, kemudian pilih aksesoris. Aksesoris dengan stok 0 tidak bisa dipilih.",
        warning:
          "Pastikan stok aksesoris tersedia di Inventaris sebelum membuat sewa.",
        screenshotLabel: "Formulir — dropdown pelanggan dan aksesoris",
        screenshotSrc: "/assets/demo/sewa-aksesoris/step-3.png",
      },
      {
        title: "Isi Detail Sewa",
        description:
          "Masukkan jumlah unit, tanggal mulai, batas pengembalian, dan biaya sewa per periode.",
        tip: "Biaya bisa diisi 0 jika aksesoris diberikan gratis bersama sewa tabung.",
        screenshotLabel: "Input detail sewa aksesoris",
        screenshotSrc: "/assets/demo/sewa-aksesoris/step-4.png",
      },
      {
        title: "Simpan & Konfirmasi",
        description:
          'Klik "Simpan Sewa". Stok aksesoris otomatis berkurang di inventaris.',
        screenshotLabel: "Konfirmasi berhasil & daftar sewa terupdate",
        screenshotSrc: "/assets/demo/sewa-aksesoris/step-5.png",
      },
      {
        title: "Detail & Cetak Nota",
        description:
          "Klik ikon mata untuk melihat detail transaksi secara lengkap atau klik ikon print (cetak) untuk mencetak nota bukti transaksi.",
        screenshotLabel: "Melihat detail transaksi atau cetak nota",
        screenshotSrc: "/assets/demo/sewa-aksesoris/step-6.png",
      },
    ],

  },
  {
    id: "pengembalian",
    label: "Pengembalian",
    icon: <ArrowLeftRight className="w-4 h-4" />,
    description:
      "Panduan untuk memproses pengembalian tabung atau aksesoris dari pelanggan melalui fitur Log Kembali.",
    steps: [
      {
        title: "Buka Tab Pengembalian",
        description:
          'Dari menu Transaksi, klik tab "Pengembalian". Tampil semua sewa aktif yang siap diproses kembali.',
        screenshotLabel: "Tab Pengembalian — daftar sewa aktif",
        screenshotSrc: "/assets/demo/pengembalian/step-1.png",
      },
      {
        title: "Cari Nama Pelanggan atau ID Sewa",
        description:
          "Gunakan kolom pencarian di bagian atas untuk menemukan sewa berdasarkan nama pelanggan atau ID transaksi.",
        tip: "Sewa yang sudah jatuh tempo biasanya ditandai warna berbeda — perhatikan indikator tersebut.",
        screenshotLabel: "Kolom pencarian nama / ID sewa",
        screenshotSrc: "/assets/demo/pengembalian/step-2.png",
      },
      {
        title: "Klik Tombol Log Kembali",
        description:
          'Pada baris sewa yang akan diproses, klik tombol "Log Kembali" untuk membuka formulir pengembalian.',
        screenshotLabel: 'Tombol "Log Kembali" di baris tabel',
        screenshotSrc: "/assets/demo/pengembalian/step-3.png",
      },
      {
        title: "Pastikan Data Sudah Benar",
        description:
          "Periksa detail pengembalian: nama pelanggan, item yang dikembalikan, tanggal, dan kondisi barang. Pastikan semua sesuai sebelum mengkonfirmasi.",
        warning:
          "Periksa kembali semua data sebelum melanjutkan — pengembalian yang sudah dikonfirmasi tidak bisa dibatalkan.",
        screenshotLabel: "Formulir review data pengembalian",
        screenshotSrc: "/assets/demo/pengembalian/step-4.png",
      },
      {
        title: "Klik Log Kembali untuk Konfirmasi",
        description:
          'Setelah data dipastikan benar, klik tombol "Log Kembali". Status sewa berubah menjadi "Selesai" dan item kembali ke inventaris.',
        screenshotLabel: 'Konfirmasi selesai — status sewa berubah "Selesai"',
        screenshotSrc: "/assets/demo/pengembalian/step-5.png",
      },
    ],
  },
  {
    id: "kasir-pos",
    label: "Kasir POS",
    icon: <ShoppingCart className="w-4 h-4" />,
    description:
      "Panduan untuk memproses penjualan ritel langsung (over-the-counter) menggunakan sistem Point of Sale terintegrasi.",
    steps: [
      {
        title: "Buka Tab Kasir POS",
        description:
          'Dari menu Transaksi, klik tab "Kasir POS" di bagian atas halaman untuk membuka modul antarmuka Point of Sale (POS).',
        screenshotLabel: "Tampilan POS — daftar produk & keranjang belanja",
        screenshotSrc: "/assets/demo/kasir-pos/step-1.png",
      },
      {
        title: "Pilih / Buat Nama Client",
        description:
          "Cari dan pilih nama pelanggan dari dropdown. Jika pelanggan belum terdaftar, Anda dapat menambahkannya langsung melalui formulir.",
        screenshotLabel: "Pilih atau buat nama pelanggan",
        screenshotSrc: "/assets/demo/kasir-pos/step-2.png",
      },
      {
        title: "Pilih Barang dan Jumlah yang Ingin Dibeli",
        description:
          "Cari dan klik produk dari daftar sebelah kiri untuk menambahkannya ke dalam keranjang belanja sebelah kanan.",
        tip: "Gunakan kolom pencarian di atas daftar produk untuk menemukan item dengan cepat.",
        screenshotLabel: "Memilih produk masuk ke keranjang belanja",
        screenshotSrc: "/assets/demo/kasir-pos/step-3.png",
      },
      {
        title: "Tentukan Metode Pembayaran, Tipe Layanan & Bayar",
        description:
          "Pilih tipe layanan, tentukan metode pembayaran (Tunai, Transfer Bank, atau QRIS) dan nominal uang, lalu klik tombol Bayar.",
        screenshotLabel: "Pilihan tipe layanan, metode pembayaran & bayar",
        screenshotSrc: "/assets/demo/kasir-pos/step-4.png",
      },
      {
        title: "Mencetak Nota / Struk",
        description:
          'Setelah pembayaran berhasil diproses, klik tombol "Cetak Struk" untuk mencetak nota bukti transaksi atau "Selesai" untuk kembali.',
        screenshotLabel: "Opsi cetak struk belanja / nota bukti transaksi",
        screenshotSrc: "/assets/demo/kasir-pos/step-5.png",
      },
    ],
  },
  {
    id: "restock-supplier",
    label: "Restock Supplier",
    icon: <PackagePlus className="w-4 h-4" />,
    description:
      "Panduan untuk mencatat pembelian stok baru dari supplier, termasuk produk dan aksesoris untuk menambah inventaris.",
    steps: [
      {
        title: "Buka Tab Restock Supplier",
        description:
          'Dari menu Transaksi, klik tab "Restock Supplier" di bagian atas halaman untuk membuka modul pembelian stok dari supplier.',
        screenshotLabel: "Tampilan Tab Restock Supplier",
        screenshotSrc: "/assets/demo/restock-supplier/step-1.png",
      },
      {
        title: "Klik Tombol Beli Restock Baru",
        description:
          'Klik tombol "+ Restock Baru" di pojok kanan atas untuk membuka panel formulir pembelian stok baru.',
        screenshotLabel: "Tombol + Restock Baru",
        screenshotSrc: "/assets/demo/restock-supplier/step-2.png",
      },
      {
        title: "Pilih Vendor",
        description:
          "Pilih nama vendor atau supplier dari dropdown yang tersedia untuk mencatat asal barang yang dibeli.",
        screenshotLabel: "Dropdown pilih vendor",
        screenshotSrc: "/assets/demo/restock-supplier/step-3.png",
      },
      {
        title: "Pilih Barang & Jumlah",
        description:
          "Pilih produk atau aksesoris yang ingin dibeli, kemudian masukkan jumlah unit dan harga beli dari vendor tersebut.",
        screenshotLabel: "Memilih produk, jumlah, dan harga beli",
        screenshotSrc: "/assets/demo/restock-supplier/step-4.png",
      },
      {
        title: "Beli Restock",
        description:
          'Setelah semua item dan detail transaksi lengkap, klik tombol "Beli Restock" di bagian bawah formulir untuk memproses dan menyimpan transaksi.',
        screenshotLabel: "Menyimpan transaksi pembelian restock",
        screenshotSrc: "/assets/demo/restock-supplier/step-5.png",
      },
      {
        title: "Tampil Riwayat Restock",
        description:
          "Setelah transaksi berhasil disimpan, riwayat restock baru Anda akan langsung muncul di halaman utama daftar Restock Supplier.",
        screenshotLabel: "Riwayat transaksi restock terupdate",
        screenshotSrc: "/assets/demo/restock-supplier/step-6.png",
      },
    ],
  },
  {
    id: "refill-vendor",
    label: "Refill Vendor",
    icon: <RefreshCw className="w-4 h-4" />,
    description:
      "Panduan untuk mengelola proses pengisian ulang (refill) tabung oksigen melalui vendor dari pengiriman kosong hingga siap digunakan kembali.",
    steps: [
      {
        title: "Buka Tab Refill Vendor",
        description:
          'Dari menu Transaksi, klik tab "Refill Vendor" di bagian atas halaman untuk membuka modul pengisian ulang tabung.',
        screenshotLabel: "Tab Refill Vendor aktif di halaman Transaksi",
        screenshotSrc: "/assets/demo/refill-vendor/step-1.png",
      },
      {
        title: "Klik Kirim Tabung Isi Ulang",
        description:
          'Klik tombol "+ Kirim Tabung Isi Ulang" di pojok kanan atas untuk memulai proses pengiriman tabung ke instansi refill.',
        screenshotLabel: 'Tombol "Kirim Tabung Isi Ulang"',
        screenshotSrc: "/assets/demo/refill-vendor/step-2.png",
      },
      {
        title: "Pilih Tabung",
        description:
          "Pilih tabung kosong yang ingin dikirim untuk di-refill dari daftar tabung kosong yang tersedia.",
        screenshotLabel: "Memilih tabung kosong di formulir",
        screenshotSrc: "/assets/demo/refill-vendor/step-3.png",
      },
      {
        title: "Pilih Instansi",
        description:
          "Pilih nama instansi atau vendor yang akan melakukan pengisian ulang tabung oksigen tersebut.",
        screenshotLabel: "Memilih instansi / vendor refill",
        screenshotSrc: "/assets/demo/refill-vendor/step-4.png",
      },
      {
        title: "Isi Biaya Refill & Tanggal",
        description:
          "Isi detail biaya refill per tabung, tanggal pengiriman, dan estimasi selesai, lalu kirim formulirnya.",
        screenshotLabel: "Input biaya refill, tanggal, dan kirim",
        screenshotSrc: "/assets/demo/refill-vendor/step-5.png",
      },
      {
        title: "Klik Konfirmasi Selesai",
        description:
          "Setelah proses pengisian ulang selesai dan tabung kembali diterima, klik tombol konfirmasi untuk memperbarui status tabung menjadi tersedia kembali.",
        screenshotLabel: "Konfirmasi penerimaan tabung selesai",
        screenshotSrc: "/assets/demo/refill-vendor/step-6.png",
      },
    ],
  },
];

// ─── Lightbox ─────────────────────────────────────────────────────────────────

function Lightbox({
  src,
  label,
  onClose,
}: {
  src: string;
  label: string;
  onClose: () => void;
}) {
  const [zoom, setZoom] = useState(1);

  // Close on Escape
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/85 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Toolbar */}
      <div
        className="flex items-center justify-between px-5 py-3 shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-xs text-white/70 font-medium truncate max-w-xs">
          {label}
        </p>
        <div className="flex items-center gap-2">
          {/* Zoom out */}
          <button
            onClick={() =>
              setZoom((z) => Math.max(0.5, +(z - 0.25).toFixed(2)))
            }
            className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-sm font-bold transition-colors cursor-pointer"
            title="Zoom out"
          >
            −
          </button>
          <span className="text-xs text-white/60 w-10 text-center tabular-nums">
            {Math.round(zoom * 100)}%
          </span>
          {/* Zoom in */}
          <button
            onClick={() => setZoom((z) => Math.min(3, +(z + 0.25).toFixed(2)))}
            className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-sm font-bold transition-colors cursor-pointer"
            title="Zoom in"
          >
            +
          </button>
          {/* Reset */}
          <button
            onClick={() => setZoom(1)}
            className="text-[10px] text-white/50 hover:text-white/80 px-2 py-1 rounded-md bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
          >
            Reset
          </button>
          {/* Close */}
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-white/10 hover:bg-rose-500/70 flex items-center justify-center text-white text-sm transition-colors cursor-pointer ml-2"
            title="Tutup (Esc)"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Image area — scrollable */}
      <div
        className="flex-1 overflow-auto flex items-center justify-center p-6"
        onClick={onClose}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: "center center",
            transition: "transform 0.15s ease",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={label}
            className="max-w-[90vw] max-h-[80vh] rounded-lg shadow-2xl object-contain select-none"
            draggable={false}
          />
        </div>
      </div>

      <p className="text-center text-[10px] text-white/30 pb-4 shrink-0">
        Klik di luar gambar atau tekan Esc untuk menutup
      </p>
    </div>
  );
}

// ─── Screenshot Slot ──────────────────────────────────────────────────────────

function ScreenshotSlot({
  label,
  src,
  onOpen,
}: {
  label: string;
  src?: string;
  onOpen?: () => void;
}) {
  if (src) {
    return (
      <div className="mt-3 max-w-sm">
        <div
          onClick={onOpen}
          className="rounded-xl border border-border overflow-hidden bg-muted/20 cursor-zoom-in group"
          title="Klik untuk perbesar"
        >
          {/* Fixed-height — semua gambar sama tinggi */}
          <div className="h-44 bg-muted/40 flex items-center justify-center overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={label}
              className="h-full w-full object-contain transition-opacity group-hover:opacity-80"
            />
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 border-t border-border/60 bg-muted/30">
            <ImageIcon className="w-3 h-3 text-muted-foreground shrink-0" />
            <p className="text-[10px] text-muted-foreground truncate flex-1">
              {label}
            </p>
            <span className="text-[9px] text-muted-foreground/50 shrink-0">
              🔍 perbesar
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3 max-w-sm rounded-xl border-2 border-dashed border-border bg-muted/30 hover:bg-muted/50 transition-colors flex items-center gap-3 px-4 py-3 group cursor-default">
      <div className="w-8 h-8 rounded-lg bg-muted border border-border flex items-center justify-center shrink-0">
        <ImageIcon className="w-3.5 h-3.5 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-muted-foreground truncate">
          {label}
        </p>
        <p className="text-[10px] text-muted-foreground/60 mt-0.5">
          Belum ada screenshot — simpan di{" "}
          <code className="font-mono bg-muted px-1 rounded">
            /public/assets/demo/
          </code>
        </p>
      </div>
      <Camera className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0 group-hover:text-muted-foreground transition-colors" />
    </div>
  );
}

// ─── Step Card ─────────────────────────────────────────────────────────────────

function StepCard({
  step,
  index,
  isLast,
  onOpenLightbox,
}: {
  step: Step;
  index: number;
  isLast: boolean;
  onOpenLightbox: (src: string, label: string) => void;
}) {
  return (
    <div className="flex gap-4">
      {/* Connector */}
      <div className="flex flex-col items-center shrink-0">
        <div className="w-8 h-8 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center shrink-0">
          <span className="text-xs font-bold text-primary">{index + 1}</span>
        </div>
        {!isLast && (
          <div
            className="w-px border-l border-dashed border-border flex-1 mt-2"
            style={{ minHeight: "20px" }}
          />
        )}
      </div>

      {/* Content */}
      <div className={`${isLast ? "pb-0" : "pb-6"} flex-1 min-w-0`}>
        <h4 className="text-sm font-semibold text-foreground mb-1 leading-snug">
          {step.title}
        </h4>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {step.description}
        </p>

        {step.tip && (
          <div className="mt-2.5 flex items-start gap-2 bg-primary/5 border border-primary/20 rounded-lg px-3 py-2">
            <Info className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
            <p className="text-xs text-primary/80 leading-snug">{step.tip}</p>
          </div>
        )}
        {step.warning && (
          <div className="mt-2.5 flex items-start gap-2 bg-destructive/5 border border-destructive/20 rounded-lg px-3 py-2">
            <AlertTriangle className="w-3.5 h-3.5 text-destructive shrink-0 mt-0.5" />
            <p className="text-xs text-destructive/80 leading-snug">
              {step.warning}
            </p>
          </div>
        )}

        <ScreenshotSlot
          label={step.screenshotLabel}
          src={step.screenshotSrc}
          onOpen={
            step.screenshotSrc
              ? () => onOpenLightbox(step.screenshotSrc!, step.screenshotLabel)
              : undefined
          }
        />
      </div>
    </div>
  );
}

// ─── Section Panel ─────────────────────────────────────────────────────────────

function SectionPanel({
  section,
  onOpenLightbox,
}: {
  section: GuideSection;
  onOpenLightbox: (src: string, label: string) => void;
}) {
  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="rounded-2xl border border-border bg-muted/20 p-5">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 shadow-sm">
            <span className="text-primary">{section.icon}</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-foreground">
                {section.label}
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                Panduan
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              {section.description}
            </p>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div>
        <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-primary" />
          Langkah-Langkah
        </h3>
        <div>
          {section.steps.map((step, i) => (
            <StepCard
              key={i}
              step={step}
              index={i}
              isLast={i === section.steps.length - 1}
              onOpenLightbox={onOpenLightbox}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function GuidePage() {
  const [activeSection, setActiveSection] = useState<SectionId>("sewa-tabung");
  const [lightbox, setLightbox] = useState<{
    src: string;
    label: string;
  } | null>(null);

  const current = sections.find((s) => s.id === activeSection)!;

  return (
    <div className="space-y-6">
      {/* Lightbox overlay */}
      {lightbox && (
        <Lightbox
          src={lightbox.src}
          label={lightbox.label}
          onClose={() => setLightbox(null)}
        />
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary" />
            Panduan Penggunaan
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Petunjuk langkah demi langkah untuk setiap fitur transaksi
            operasional.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 border border-border rounded-xl px-3 py-2 shrink-0">
          <BookOpen className="w-3.5 h-3.5" />
          <span className="font-medium">
            {sections.length} Panduan Tersedia
          </span>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Sub-Navigation — sticky saat scroll */}
        <aside className="w-full lg:w-52 shrink-0 lg:sticky lg:top-0">
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border/60 bg-muted/20">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Kategori Panduan
              </p>
            </div>
            <nav className="p-2 space-y-0.5">
              {sections.map((section) => {
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left cursor-pointer group ${
                      isActive
                        ? "bg-primary/10 text-primary ring-1 ring-primary/20"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    <span
                      className={`shrink-0 transition-transform ${isActive ? "" : "group-hover:scale-110"}`}
                    >
                      {section.icon}
                    </span>
                    <span className="truncate flex-1">{section.label}</span>
                    {isActive && (
                      <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-60" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Right Content Panel */}
        <div className="flex-1 min-w-0 bg-card border border-border rounded-2xl p-6">
          <SectionPanel
            section={current}
            onOpenLightbox={(src, label) => setLightbox({ src, label })}
          />
        </div>
      </div>
    </div>
  );
}
