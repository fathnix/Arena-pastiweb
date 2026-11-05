import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  BanknotesIcon,
  Bars3Icon,
  BoltIcon,
  BuildingOffice2Icon,
  CalendarDaysIcon,
  ChartBarIcon,
  CheckIcon,
  ChevronDownIcon,
  ClockIcon,
  DevicePhoneMobileIcon,
  LockClosedIcon,
  MapPinIcon,
  PlayIcon,
  QrCodeIcon,
  ShieldCheckIcon,
  SparklesIcon,
  TicketIcon,
  UserGroupIcon,
  WalletIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import PitchScene from '../components/landing/PitchScene';
import AvailabilityDemo from '../components/landing/AvailabilityDemo';
import Reveal from '../components/landing/Reveal';

interface Branch {
  id: number;
  name: string;
  code: string;
  address?: string | null;
  phone?: string | null;
  is_active?: boolean;
  fields_count?: number;
  users_count?: number;
}

const fallbackBranches: Branch[] = [
  {
    id: 1,
    name: 'Arena Pasti Pusat',
    code: 'ARP',
    address: 'Jl. Olahraga No. 123, Jakarta',
    phone: '021-12345678',
    is_active: true,
    fields_count: 4,
    users_count: 3,
  },
  {
    id: 2,
    name: 'Arena Pasti Cabang Selatan',
    code: 'ARS',
    address: 'Jl. Raya Selatan No. 45, Jakarta',
    phone: '021-87654321',
    is_active: true,
    fields_count: 3,
    users_count: 2,
  },
];

const navItems = [
  { href: '#fitur', label: 'Fitur' },
  { href: '#jadwal', label: 'Jadwal' },
  { href: '#cara-kerja', label: 'Cara Kerja' },
  { href: '#cabang', label: 'Cabang' },
  { href: '#faq', label: 'FAQ' },
];

const sports = ['Futsal', 'Mini Soccer', 'Badminton', 'Basket', 'Voli', 'Tenis'];
const CURRENT_YEAR = new Date().getFullYear();

const faqs = [
  {
    question: 'Apakah harus punya akun untuk booking?',
    answer:
      'Ya, akun gratis dibutuhkan agar e-ticket, riwayat booking, dan status pembayaran tersimpan dengan aman. Pendaftaran hanya butuh nama, email, dan password.',
  },
  {
    question: 'Bagaimana Arena Pasti mencegah double-booking?',
    answer:
      'Setiap checkout berjalan dalam transaksi database dengan row-level lock. Slot yang sedang dibayar dikunci, dan slot dari booking yang kedaluwarsa dilepas otomatis oleh scheduler.',
  },
  {
    question: 'Metode pembayaran apa saja yang tersedia?',
    answer:
      'Transfer bank dengan upload bukti atau pembayaran tunai di kasir. Admin cabang memverifikasi pembayaran sebelum status booking berubah menjadi confirmed.',
  },
  {
    question: 'Apakah bisa booking lebih dari satu jam?',
    answer:
      'Bisa. Pilih beberapa slot sekaligus dalam satu checkout. Booking 3 jam atau lebih otomatis mendapat diskon 5% dari subtotal.',
  },
  {
    question: 'Bagaimana kalau saya belum bayar?',
    answer:
      'Booking berstatus pending_payment akan otomatis kedaluwarsa dan slotnya dilepas, sehingga pemain lain bisa memesan. Kamu bisa membuat booking baru kapan saja.',
  },
  {
    question: 'Bisa booking langsung di lokasi?',
    answer:
      'Bisa. Admin atau kasir dapat membuat walk-in booking dari dashboard cabang, lalu memproses pembayaran dan check-in di tempat.',
  },
];

const currency = (value: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-700">
      <span className="h-px w-6 bg-emerald-500" />
      {children}
    </span>
  );
}

function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-sm">
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
          <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
          <path d="M12 5v14M3 12h3M18 12h3" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      </span>
      <span className="text-[17px] font-extrabold tracking-tight text-zinc-900">
        Arena <span className="text-emerald-700">Pasti</span>
        {!compact && (
          <span className="ml-1.5 align-middle text-[9px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
            Booking
          </span>
        )}
      </span>
    </span>
  );
}

function QrMock() {
  const size = 21;
  const modules = useMemo(() => {
    const cells: Array<{ x: number; y: number; finder: boolean }> = [];

    const inFinder = (x: number, y: number) => {
      const corners = [
        [0, 0],
        [0, size - 7],
        [size - 7, 0],
      ];
      return corners.some(
        ([cx, cy]) =>
          x >= cx && x < cx + 7 && y >= cy && y < cy + 7 && (x === cx || x === cx + 6 || y === cy || y === cy + 6 || (x >= cx + 2 && x <= cx + 4 && y >= cy + 2 && y <= cy + 4)),
      );
    };

    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        const finder = inFinder(x, y);
        const nearFinder =
          (x < 8 && y < 8) || (x < 8 && y > size - 9) || (x > size - 9 && y < 8);
        const filled = finder || (!nearFinder && (x * 5 + y * 7 + x * y) % 7 < 3);
        if (filled) cells.push({ x, y, finder });
      }
    }

    return cells;
  }, []);

  return (
    <div className="relative mx-auto mt-5 flex h-28 w-28 items-center justify-center rounded-xl bg-white p-2.5 shadow-[0_16px_36px_-20px_rgba(15,23,42,0.35)] border border-zinc-200">
      <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-full" role="img" aria-label="Contoh e-ticket QR">
        {modules.map((cell) => (
          <rect
            key={`${cell.x}-${cell.y}`}
            x={cell.x}
            y={cell.y}
            width="1"
            height="1"
            fill={cell.finder ? '#065f46' : '#0f172a'}
          />
        ))}
      </svg>
      <span className="absolute flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500 text-[9px] font-black text-zinc-900">
        AP
      </span>
    </div>
  );
}

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const { data: branches } = useQuery<Branch[]>({
    queryKey: ['landing-branches'],
    queryFn: async () => {
      const { data } = await api.get<Branch[]>('/branches');
      return Array.isArray(data) ? data : [];
    },
    retry: 1,
    staleTime: 1000 * 60 * 5,
  });

  const branchList = useMemo<Branch[]>(() => {
    if (!branches || branches.length === 0) return fallbackBranches;

    return branches.map((branch) => {
      const match = fallbackBranches.find((item) => item.code === branch.code);
      return {
        ...branch,
        address: branch.address ?? match?.address ?? null,
        fields_count: branch.fields_count ?? match?.fields_count ?? 0,
        is_active: branch.is_active ?? true,
      };
    });
  }, [branches]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const primaryHref = isAuthenticated ? '/booking' : '/register';
  const secondaryHref = isAuthenticated ? '/dashboard' : '/login';

  return (
    <div className="landing-page min-h-screen overflow-x-hidden antialiased">
      {/* ---------------------------------------------------------------- */}
      {/* Header                                                           */}
      {/* ---------------------------------------------------------------- */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'border-b border-zinc-200 bg-[#f6f6f4]'
            : 'border-b border-transparent bg-transparent'
        }`}
      >
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
          <Link to="/" aria-label="Arena Pasti — beranda">
            <BrandMark />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Navigasi utama">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors duration-200 hover:bg-zinc-100 hover:text-zinc-900"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <Link
              to={secondaryHref}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-zinc-700 transition-colors duration-200 hover:text-zinc-900"
            >
              {isAuthenticated ? 'Dashboard' : 'Masuk'}
            </Link>
            <Link
              to={primaryHref}
              className="group inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 ease-out hover:bg-emerald-800 hover:shadow-md"
            >
              {isAuthenticated ? 'Booking sekarang' : 'Mulai booking'}
              <ArrowRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-800 transition-colors hover:bg-zinc-100 lg:hidden"
            aria-label={mobileOpen ? 'Tutup menu' : 'Buka menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <XMarkIcon className="h-5 w-5" /> : <Bars3Icon className="h-5 w-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="border-t border-zinc-200 bg-[#f6f6f4] px-4 pb-5 pt-3 lg:hidden">
            <nav className="space-y-1" aria-label="Navigasi seluler">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
                >
                  {item.label}
                </a>
              ))}
            </nav>
            <div className="mt-4 flex gap-2 border-t border-zinc-200 pt-4">
              <Link
                to={secondaryHref}
                className="flex-1 rounded-lg border border-zinc-200 px-4 py-2.5 text-center text-sm font-semibold text-zinc-800 transition-colors hover:bg-zinc-100"
              >
                {isAuthenticated ? 'Dashboard' : 'Masuk'}
              </Link>
              <Link
                to={primaryHref}
                className="flex-1 rounded-lg bg-emerald-700 px-4 py-2.5 text-center text-sm font-semibold text-white"
              >
                {isAuthenticated ? 'Booking' : 'Daftar'}
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ---------------------------------------------------------------- */}
      {/* Hero                                                             */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative overflow-hidden pb-16 pt-14 sm:pt-20 lg:pb-24 lg:pt-24">
        <div className="pointer-events-none absolute inset-0 landing-grid" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-6 xl:col-span-6">
              <Reveal>
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold tracking-wide text-emerald-700">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-700 opacity-75 [animation:pulse-ring_2s_ease-out_infinite]" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-700" />
                  </span>
                  Ketersediaan real-time · Multi-cabang
                </span>
              </Reveal>

              <Reveal delay={70}>
                <h1 className="mt-6 text-[2.6rem] font-extrabold leading-[1] tracking-[-0.045em] text-zinc-900 sm:text-6xl xl:text-[4.5rem]">
                  Booking lapangan,
                  <br />
                  <span className="text-zinc-500">tanpa drama</span>
                  <br />
                  <span className="text-emerald-700">double-booking.</span>
                </h1>
              </Reveal>

              <Reveal delay={130}>
                <p className="mt-6 max-w-xl text-base leading-relaxed text-zinc-600 sm:text-[17px]">
                  Arena Pasti menyatukan ketersediaan lapangan real-time, harga transparan,
                  dan pembayaran aman. Dari futsal sampai badminton — pilih slot, bayar,
                  lalu datang dan main.
                </p>
              </Reveal>

              <Reveal delay={190}>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Link
                    to={primaryHref}
                    className="group inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition-all duration-200 ease-out hover:bg-emerald-800 hover:shadow-md"
                  >
                    {isAuthenticated ? 'Booking lapangan' : 'Pesan lapangan sekarang'}
                    <ArrowRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </Link>
                  <a
                    href="#jadwal"
                    className="group inline-flex items-center justify-center gap-2.5 rounded-lg border border-zinc-200 bg-zinc-50 px-5 py-3 text-sm font-semibold text-zinc-800 transition-all duration-200 ease-out hover:border-zinc-300 hover:bg-zinc-100 hover:text-zinc-900"
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-100 text-zinc-700 transition-colors group-hover:bg-emerald-100 group-hover:text-emerald-800">
                      <PlayIcon className="ml-0.5 h-3 w-3" />
                    </span>
                    Cek jadwal live
                  </a>
                </div>
              </Reveal>

              <Reveal delay={240}>
                <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-zinc-500">
                  {['Gratis daftar', 'Konfirmasi instan', 'E-ticket QR'].map((item) => (
                    <span key={item} className="flex items-center gap-1.5">
                      <CheckIcon className="h-3.5 w-3.5 text-emerald-700" strokeWidth={2.5} />
                      {item}
                    </span>
                  ))}
                </div>
              </Reveal>

              <Reveal delay={290}>
                <div className="mt-10 grid max-w-md grid-cols-3 border-t border-zinc-200 pt-6">
                  {[
                    { value: '15', label: 'slot per hari' },
                    { value: '< 2 mnt', label: 'rata-rata checkout' },
                    { value: '0', label: 'double-booking' },
                  ].map((stat, index) => (
                    <div
                      key={stat.label}
                      className={index === 0 ? '' : 'border-l border-zinc-200 pl-4'}
                    >
                      <p className="text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl">
                        {stat.value}
                      </p>
                      <p className="mt-0.5 text-[11px] leading-tight text-zinc-400">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="mt-4 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-400">
                  <LockClosedIcon className="h-3 w-3" />
                  Row-level lock · auto-release slot · audit trail
                </p>
              </Reveal>
            </div>

            <Reveal delay={160} className="lg:col-span-6">
              <PitchScene />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Sport marquee                                                    */}
      {/* ---------------------------------------------------------------- */}
      <section className="border-y border-zinc-200 bg-white py-4" aria-label="Jenis olahraga">
        <div className="marquee-mask overflow-hidden">
          <div className="marquee-track flex w-max items-center gap-10">
            {[...sports, ...sports, ...sports, ...sports].map((sport, index) => (
              <span
                key={`${sport}-${index}`}
                className="flex items-center gap-10 whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.32em] text-zinc-400"
              >
                {sport}
                <span className="h-1 w-1 rotate-45 bg-emerald-700/40" />
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Features                                                         */}
      {/* ---------------------------------------------------------------- */}
      <section id="fitur" className="relative scroll-mt-24 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="max-w-2xl">
            <Eyebrow>Fitur profesional</Eyebrow>
            <h2 className="mt-4 text-3xl font-extrabold leading-[1.05] tracking-[-0.035em] text-zinc-900 sm:text-4xl lg:text-[2.75rem]">
              Semua yang dibutuhkan, dari klik pertama sampai check-in.
            </h2>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-zinc-500">
              Bukan sekadar form booking. Arena Pasti menangani operasional lapangan
              yang sibuk — tanpa bentrok jadwal, tanpa hitungan manual.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-4 lg:grid-cols-6">
            {/* Anti double-booking */}
            <Reveal className="lg:col-span-4">
              <article className="group relative h-full overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 transition-all duration-300 hover:border-emerald-300 sm:p-7">
                <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-emerald-500/0 blur-3xl transition-colors duration-500 group-hover:bg-emerald-500/5" />
                <div className="relative">
                  <div className="flex items-start justify-between gap-4">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-700">
                      <ShieldCheckIcon className="h-5 w-5" />
                    </span>
                    <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 font-mono text-[10px] text-zinc-500">
                      row-lock
                    </span>
                  </div>
                  <h3 className="mt-5 text-xl font-bold tracking-tight text-zinc-900">
                    Anti double-booking yang benar-benar bekerja
                  </h3>
                  <p className="mt-2 max-w-lg text-sm leading-relaxed text-zinc-500">
                    Transaksi database + row lock mengunci slot saat checkout. Booking
                    kedaluwarsa otomatis dilepas, jadi slot kosong selalu benar-benar kosong.
                  </p>

                  <div className="mt-6 rounded-xl border border-zinc-200 bg-zinc-50 p-3.5">
                    <div className="flex items-center justify-between border-b border-zinc-200 pb-2.5">
                      <span className="flex items-center gap-2 text-[11px] font-medium text-zinc-700">
                        <CalendarDaysIcon className="h-3.5 w-3.5 text-zinc-400" />
                        Lapangan 2 · Rabu, 12 Nov
                      </span>
                      <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-700" />
                        Live
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-1.5 sm:grid-cols-6">
                      {[
                        ['08:00', 'free'],
                        ['09:00', 'free'],
                        ['10:00', 'full'],
                        ['11:00', 'free'],
                        ['12:00', 'full'],
                        ['13:00', 'free'],
                        ['14:00', 'free'],
                        ['15:00', 'free'],
                        ['16:00', 'full'],
                        ['17:00', 'free'],
                        ['18:00', 'picked'],
                        ['19:00', 'picked'],
                      ].map(([time, state], index) => (
                        <div
                          key={time}
                          className={`rounded-md border px-2 py-1.5 text-center font-mono text-[10px] ${
                            state === 'full'
                              ? 'border-zinc-200 bg-zinc-50 text-zinc-400 line-through'
                              : state === 'picked'
                                ? 'border-emerald-700 bg-emerald-700 font-semibold text-white'
                                : 'border-zinc-200 bg-zinc-50 text-zinc-600'
                          }`}
                          style={{ transitionDelay: `${index * 20}ms` }}
                        >
                          {time}
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex items-center justify-between text-[10px] text-zinc-400">
                      <span>6 slot terisi · 2 slot dikunci untukmu</span>
                      <span className="font-mono text-emerald-700/80">auto-release on</span>
                    </div>
                  </div>
                </div>
              </article>
            </Reveal>

            {/* Dynamic pricing */}
            <Reveal className="lg:col-span-2" delay={60}>
              <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 transition-all duration-300 hover:border-emerald-300 sm:p-7">
                <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-amber-500/0 blur-3xl transition-colors duration-500 group-hover:bg-amber-500/5" />
                <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-amber-100 bg-amber-50 text-amber-700">
                  <BoltIcon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-lg font-bold tracking-tight text-zinc-900">
                  Harga dinamis, tanpa kejutan
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                  Weekend, jam sibuk, dan durasi main dihitung otomatis saat checkout.
                </p>

                <div className="mt-auto pt-6">
                  <div className="flex h-24 items-end gap-1.5">
                    {[38, 52, 44, 66, 58, 82, 96, 71, 88, 64].map((height, index) => (
                      <div
                        key={index}
                        className={`animate-rise-bar flex-1 rounded-sm ${
                          index >= 7 ? 'bg-emerald-700' : 'bg-zinc-200'
                        }`}
                        style={{ height: `${height}%`, animationDelay: `${index * 60}ms` }}
                      />
                    ))}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {['Weekend +20%', 'Peak +15%', '3 jam −5%'].map((rule) => (
                      <span
                        key={rule}
                        className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-1 font-mono text-[10px] text-zinc-600"
                      >
                        {rule}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            </Reveal>

            {/* E-ticket */}
            <Reveal className="lg:col-span-2" delay={90}>
              <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 transition-all duration-300 hover:border-emerald-300 sm:p-7">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-100 text-zinc-700">
                  <QrCodeIcon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-lg font-bold tracking-tight text-zinc-900">
                  E-ticket dengan QR
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                  Tunjukkan QR di pintu masuk. Admin scan, check-in selesai dalam hitungan detik.
                </p>
                <QrMock />
                <div className="mt-4 flex items-center justify-between border-t border-zinc-200 pt-3">
                  <span className="font-mono text-[10px] text-zinc-400">#ARP-2481</span>
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                    Aktif
                  </span>
                </div>
              </article>
            </Reveal>

            {/* Multi-branch */}
            <Reveal className="lg:col-span-2" delay={120}>
              <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 transition-all duration-300 hover:border-emerald-300 sm:p-7">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-100 text-zinc-700">
                  <BuildingOffice2Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-lg font-bold tracking-tight text-zinc-900">
                  Satu akun, semua cabang
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                  Pindah lokasi tanpa akun baru. Jadwal dan harga tiap cabang tetap rapi.
                </p>

                <div className="mt-5 space-y-2">
                  {branchList.slice(0, 3).map((branch) => (
                    <div
                      key={branch.id}
                      className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 transition-colors group-hover:border-zinc-300"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-700" />
                        <span className="truncate text-[11px] font-medium text-zinc-700">
                          {branch.name.replace('Arena Pasti ', '')}
                        </span>
                      </div>
                      <span className="shrink-0 font-mono text-[10px] text-zinc-400">
                        {branch.fields_count} lap.
                      </span>
                    </div>
                  ))}
                </div>
              </article>
            </Reveal>

            {/* Payments */}
            <Reveal className="lg:col-span-2" delay={150}>
              <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 transition-all duration-300 hover:border-emerald-300 sm:p-7">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-100 text-zinc-700">
                  <WalletIcon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-lg font-bold tracking-tight text-zinc-900">
                  Pembayaran fleksibel
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                  Transfer bank dengan bukti atau bayar tunai di kasir. Verifikasi oleh admin cabang.
                </p>

                <div className="mt-5 space-y-2">
                  <div className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5">
                    <span className="flex items-center gap-2 text-[11px] font-medium text-zinc-700">
                      <BanknotesIcon className="h-4 w-4 text-zinc-400" />
                      Transfer bank
                    </span>
                    <span className="text-[10px] text-emerald-700">Populer</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5">
                    <span className="flex items-center gap-2 text-[11px] font-medium text-zinc-700">
                      <WalletIcon className="h-4 w-4 text-zinc-400" />
                      Tunai di kasir
                    </span>
                    <span className="text-[10px] text-zinc-400">Walk-in</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-1.5 text-[10px] text-zinc-400">
                  <CheckIcon className="h-3 w-3 text-emerald-700" />
                  Bukti bayar terenkripsi & terdokumentasi
                </div>
              </article>
            </Reveal>

            {/* Analytics */}
            <Reveal className="lg:col-span-6" delay={60}>
              <article className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 transition-all duration-300 hover:border-emerald-300 sm:p-7">
                <div className="pointer-events-none absolute -left-24 top-0 h-64 w-64 rounded-full bg-emerald-500/5 blur-3xl" />
                <div className="relative grid gap-8 lg:grid-cols-2 lg:items-center">
                  <div>
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-700">
                      <ChartBarIcon className="h-5 w-5" />
                    </span>
                    <h3 className="mt-5 text-xl font-bold tracking-tight text-zinc-900">
                      Dashboard yang mengambil keputusan untukmu
                    </h3>
                    <p className="mt-2 max-w-md text-sm leading-relaxed text-zinc-500">
                      Revenue harian, peak hours, performa cabang, sampai laporan CSV.
                      Superadmin melihat semuanya; admin fokus ke cabangnya sendiri.
                    </p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {['Revenue', 'Peak hours', 'Performa cabang', 'Export CSV'].map((item) => (
                        <span
                          key={item}
                          className="rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[11px] text-zinc-600"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.14em] text-zinc-400">
                          Revenue hari ini
                        </p>
                        <p className="mt-1 text-2xl font-bold tracking-tight text-zinc-900">
                          {currency(2_480_000)}
                        </p>
                      </div>
                      <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">
                        <ChartBarIcon className="h-3 w-3" />
                        +18.4%
                      </span>
                    </div>

                    <div className="mt-5 flex h-20 items-end gap-1">
                      {[34, 48, 40, 62, 55, 74, 60, 88, 72, 94, 80, 100].map((height, index) => (
                        <div
                          key={index}
                          className={`animate-rise-bar flex-1 rounded-t-sm ${
                            index > 7 ? 'bg-emerald-700' : 'bg-emerald-700/35'
                          }`}
                          style={{ height: `${height}%`, animationDelay: `${index * 45}ms` }}
                        />
                      ))}
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-2 border-t border-zinc-200 pt-3">
                      {[
                        ['Booking', '38'],
                        ['Check-in', '31'],
                        ['Utilisasi', '86%'],
                      ].map(([label, value]) => (
                        <div key={label}>
                          <p className="text-[10px] text-zinc-400">{label}</p>
                          <p className="mt-0.5 text-sm font-semibold text-zinc-800">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Live availability                                                */}
      {/* ---------------------------------------------------------------- */}
      <section id="jadwal" className="relative scroll-mt-24 overflow-hidden border-y border-zinc-200 bg-white py-20 sm:py-28">
        <div className="pointer-events-none absolute right-0 top-0 h-full w-1/2 landing-dots opacity-60" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-10">
            <Reveal className="lg:col-span-5">
              <Eyebrow>Live availability</Eyebrow>
              <h2 className="mt-4 text-3xl font-extrabold leading-[1.05] tracking-[-0.035em] text-zinc-900 sm:text-4xl lg:text-[2.75rem]">
                Lihat slot kosong sebelum kamu berangkat.
              </h2>
              <p className="mt-4 max-w-md text-[15px] leading-relaxed text-zinc-500">
                Coba widget di samping. Pilih tanggal dan jam — harga, surcharge, dan
                diskon langsung terhitung. Ini simulasi, jadi kamu bisa eksplor tanpa login.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  {
                    icon: ClockIcon,
                    title: 'Slot terkunci selama checkout',
                    description: 'Tidak ada dua orang yang bisa mengunci jam yang sama.',
                  },
                  {
                    icon: BoltIcon,
                    title: 'Harga berubah sesuai aturan',
                    description: 'Weekend +20%, peak hour +15%, dan diskon 5% untuk 3 jam+.',
                  },
                  {
                    icon: DevicePhoneMobileIcon,
                    title: 'E-ticket langsung di ponsel',
                    description: 'QR check-in tersedia segera setelah pembayaran terverifikasi.',
                  },
                ].map((item) => (
                  <div key={item.title} className="flex gap-3.5">
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 text-emerald-700">
                      <item.icon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-zinc-800">{item.title}</p>
                      <p className="mt-0.5 text-[12px] leading-relaxed text-zinc-500">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-[11px] text-zinc-400">
                <SparklesIcon className="h-4 w-4 shrink-0 text-amber-700" />
                Simulasi interaktif — tanpa perlu akun.
              </div>
            </Reveal>

            <Reveal className="lg:col-span-7" delay={100}>
              <AvailabilityDemo />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* How it works                                                     */}
      {/* ---------------------------------------------------------------- */}
      <section id="cara-kerja" className="scroll-mt-24 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <Reveal className="max-w-2xl">
              <Eyebrow>Cara kerja</Eyebrow>
              <h2 className="mt-4 text-3xl font-extrabold leading-[1.05] tracking-[-0.035em] text-zinc-900 sm:text-4xl lg:text-[2.75rem]">
                Tiga langkah. Satu lapangan pasti.
              </h2>
            </Reveal>
            <Reveal delay={60}>
              <a
                href="#jadwal"
                className="group inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 transition-colors hover:text-emerald-800"
              >
                Coba simulasi jadwal
                <ArrowUpRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            </Reveal>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {[
              {
                number: '01',
                icon: MapPinIcon,
                title: 'Pilih cabang & lapangan',
                description:
                  'Temukan lokasi terdekat, bandingkan jenis lapangan, dan lihat harga per jamnya.',
              },
              {
                number: '02',
                icon: CalendarDaysIcon,
                title: 'Kunci slot & bayar',
                description:
                  'Slot dikunci selama checkout. Bayar via transfer atau tunai di kasir.',
              },
              {
                number: '03',
                icon: TicketIcon,
                title: 'Check-in dengan QR',
                description:
                  'Tunjukkan e-ticket di lokasi. Admin scan, kamu langsung main.',
              },
            ].map((step, index) => (
              <Reveal key={step.number} delay={index * 80}>
                <article className="group relative h-full overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300 sm:p-7">
                  <span className="pointer-events-none absolute -right-2 -top-6 text-7xl font-black tracking-tighter text-zinc-900/[0.04] transition-colors duration-300 group-hover:text-emerald-800/10">
                    {step.number}
                  </span>
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-700">
                    <step.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 text-lg font-bold tracking-tight text-zinc-900">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-500">{step.description}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Branches                                                         */}
      {/* ---------------------------------------------------------------- */}
      <section id="cabang" className="scroll-mt-24 border-y border-zinc-200 bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <Reveal className="max-w-2xl">
              <Eyebrow>Cabang</Eyebrow>
              <h2 className="mt-4 text-3xl font-extrabold leading-[1.05] tracking-[-0.035em] text-zinc-900 sm:text-4xl lg:text-[2.75rem]">
                Satu sistem untuk semua lokasi.
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-zinc-500">
                Jadwal, lapangan, dan admin tiap cabang terisolasi dengan rapi —
                pengalaman pemain tetap konsisten.
              </p>
            </Reveal>
            <Reveal delay={60}>
              <Link
                to={isAuthenticated ? '/booking' : '/login'}
                className="group inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm font-semibold text-zinc-800 transition-all duration-200 hover:border-zinc-300 hover:bg-zinc-100 hover:text-zinc-900"
              >
                Pesan di cabang mana saja
                <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Reveal>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {branchList.slice(0, 6).map((branch, index) => (
              <Reveal key={branch.id} delay={index * 60}>
                <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 transition-all duration-300 hover:border-emerald-300">
                  <div className="flex items-start justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-700">
                      <BuildingOffice2Icon className="h-5 w-5" />
                    </span>
                    <span className="flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
                      <span className={`h-1.5 w-1.5 rounded-full ${branch.is_active ? 'bg-emerald-700' : 'bg-zinc-400'}`} />
                      {branch.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>

                  <h3 className="mt-5 text-lg font-bold tracking-tight text-zinc-900">{branch.name}</h3>
                  <p className="mt-1.5 flex items-start gap-1.5 text-[12px] leading-relaxed text-zinc-500">
                    <MapPinIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-400" />
                    {branch.address ?? 'Alamat cabang'}
                  </p>

                  <div className="mt-5 flex items-center justify-between border-t border-zinc-200 pt-4">
                    <div className="flex items-center gap-3 text-[11px] text-zinc-400">
                      <span className="font-mono">{branch.code}</span>
                      <span className="h-3 w-px bg-zinc-200" />
                      <span>{branch.fields_count} lapangan</span>
                    </div>
                    <Link
                      to={isAuthenticated ? '/booking' : '/login'}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 transition-colors group-hover:text-emerald-800"
                    >
                      Booking
                      <ArrowUpRightIcon className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                </article>
              </Reveal>
            ))}

            <Reveal delay={branchList.length * 60}>
              <article className="flex h-full min-h-[190px] flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-6 text-center">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-500">
                  <SparklesIcon className="h-5 w-5" />
                </span>
                <p className="mt-4 text-sm font-semibold text-zinc-700">Cabang baru segera hadir</p>
                <p className="mt-1 text-[12px] text-zinc-400">
                  Sistem siap menambah lokasi tanpa mengubah alur pemain.
                </p>
              </article>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Roles                                                            */}
      {/* ---------------------------------------------------------------- */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <Eyebrow>Untuk semua peran</Eyebrow>
            <h2 className="mt-4 text-3xl font-extrabold leading-[1.05] tracking-[-0.035em] text-zinc-900 sm:text-4xl lg:text-[2.75rem]">
              Pemain fokus main. Operasional tetap tenang.
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-zinc-500">
              Tiga pengalaman yang dirancang untuk kebutuhan masing-masing — tanpa
              saling mengganggu.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {[
              {
                icon: UserGroupIcon,
                title: 'Pemain',
                subtitle: 'Booking & main',
                points: [
                  'Ketersediaan slot real-time',
                  'E-ticket QR dan riwayat booking',
                  'Bayar transfer atau tunai',
                ],
              },
              {
                icon: LockClosedIcon,
                title: 'Admin / Kasir',
                subtitle: 'Operasional cabang',
                points: [
                  'Verifikasi pembayaran & check-in',
                  'Walk-in booking untuk pelanggan',
                  'Kelola lapangan cabang sendiri',
                ],
              },
              {
                icon: ChartBarIcon,
                title: 'Superadmin',
                subtitle: 'Kontrol global',
                points: [
                  'Dashboard semua cabang',
                  'Kelola pengguna dan akses',
                  'Laporan revenue & export CSV',
                ],
              },
            ].map((role, index) => (
              <Reveal key={role.title} delay={index * 80}>
                <article className="group flex h-full flex-col rounded-2xl border border-zinc-200 bg-white p-6 transition-all duration-300 hover:border-emerald-300 sm:p-7">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-700">
                      <role.icon className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="text-base font-bold tracking-tight text-zinc-900">{role.title}</h3>
                      <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-400">
                        {role.subtitle}
                      </p>
                    </div>
                  </div>
                  <ul className="mt-6 space-y-2.5 border-t border-zinc-200 pt-5">
                    {role.points.map((point) => (
                      <li key={point} className="flex items-start gap-2 text-[13px] text-zinc-600">
                        <CheckIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-700/80" strokeWidth={2.5} />
                        {point}
                      </li>
                    ))}
                  </ul>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* FAQ                                                              */}
      {/* ---------------------------------------------------------------- */}
      <section id="faq" className="scroll-mt-24 border-t border-zinc-200 bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-4">
              <Eyebrow>FAQ</Eyebrow>
              <h2 className="mt-4 text-3xl font-extrabold leading-[1.05] tracking-[-0.035em] text-zinc-900 sm:text-4xl">
                Masih ada yang mengganjal?
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-zinc-500">
                Jawaban singkat untuk hal-hal yang paling sering ditanyakan sebelum
                booking pertama.
              </p>
              <Link
                to="/login"
                className="group mt-6 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 transition-colors hover:text-emerald-800"
              >
                Masuk ke akun
                <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Reveal>

            <Reveal className="lg:col-span-8" delay={80}>
              <div className="divide-y divide-zinc-200 rounded-2xl border border-zinc-200 bg-white">
                {faqs.map((faq, index) => {
                  const isOpen = openFaq === index;
                  return (
                    <div key={faq.question}>
                      <button
                        type="button"
                        onClick={() => setOpenFaq(isOpen ? null : index)}
                        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors duration-200 hover:bg-zinc-50 sm:px-6"
                        aria-expanded={isOpen}
                      >
                        <span className="text-sm font-semibold text-zinc-800">{faq.question}</span>
                        <ChevronDownIcon
                          className={`h-4 w-4 shrink-0 text-zinc-400 transition-transform duration-300 ${
                            isOpen ? 'rotate-180 text-emerald-700' : ''
                          }`}
                        />
                      </button>
                      <div
                        className={`grid transition-all duration-300 ease-out ${
                          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                        }`}
                      >
                        <div className="overflow-hidden">
                          <p className="px-5 pb-5 text-[13px] leading-relaxed text-zinc-500 sm:px-6">
                            {faq.answer}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Final CTA                                                        */}
      {/* ---------------------------------------------------------------- */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="relative overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-14 text-center sm:px-12 sm:py-20">
              <div className="pointer-events-none absolute inset-0 landing-grid opacity-70" />
      
              <div className="relative">
                <Eyebrow>Mulai sekarang</Eyebrow>
                <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-extrabold leading-[1.03] tracking-[-0.04em] text-zinc-900 sm:text-4xl lg:text-5xl">
                  Jadwal main berikutnya,
                  <br className="hidden sm:block" /> tiga klik lagi.
                </h2>
                <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-zinc-600">
                  Daftar gratis, pilih slot yang pasti kosong, dan tinggalkan drama
                  rebutan lapangan.
                </p>

                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Link
                    to={primaryHref}
                    className="group inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 px-6 py-3 text-sm font-semibold text-white transition-all duration-200 ease-out hover:bg-emerald-800 hover:shadow-md sm:w-auto"
                  >
                    {isAuthenticated ? 'Booking sekarang' : 'Buat akun & booking'}
                    <ArrowRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </Link>
                  <Link
                    to={secondaryHref}
                    className="inline-flex w-full items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 px-6 py-3 text-sm font-semibold text-zinc-800 transition-all duration-200 hover:border-zinc-300 hover:bg-zinc-100 hover:text-zinc-900 sm:w-auto"
                  >
                    {isAuthenticated ? 'Buka dashboard' : 'Masuk ke akun'}
                  </Link>
                </div>

                <p className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] text-zinc-400">
                  {['Tanpa biaya langganan', 'Konfirmasi instan', 'E-ticket otomatis'].map((item) => (
                    <span key={item} className="flex items-center gap-1.5">
                      <CheckIcon className="h-3 w-3 text-emerald-700" strokeWidth={2.5} />
                      {item}
                    </span>
                  ))}
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Footer                                                           */}
      {/* ---------------------------------------------------------------- */}
      <footer className="border-t border-zinc-200 bg-[#fafaf9]">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid gap-10 md:grid-cols-12">
            <div className="md:col-span-5">
              <BrandMark />
              <p className="mt-4 max-w-xs text-[13px] leading-relaxed text-zinc-500">
                Sistem booking lapangan olahraga multi-cabang. Ketersediaan real-time,
                harga transparan, dan operasional yang rapi.
              </p>
              <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[10px] font-medium text-emerald-700">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-700 opacity-70 [animation:pulse-ring_2s_ease-out_infinite]" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-700" />
                </span>
                Semua sistem beroperasi normal
              </div>
            </div>

            <div className="md:col-span-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
                Produk
              </p>
              <ul className="mt-4 space-y-2.5 text-[13px] text-zinc-500">
                <li><a href="#fitur" className="transition-colors hover:text-zinc-900">Fitur</a></li>
                <li><a href="#jadwal" className="transition-colors hover:text-zinc-900">Jadwal live</a></li>
                <li><a href="#cabang" className="transition-colors hover:text-zinc-900">Cabang</a></li>
                <li><Link to="/booking" className="transition-colors hover:text-zinc-900">Booking</Link></li>
              </ul>
            </div>

            <div className="md:col-span-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
                Akun
              </p>
              <ul className="mt-4 space-y-2.5 text-[13px] text-zinc-500">
                <li><Link to="/login" className="transition-colors hover:text-zinc-900">Masuk</Link></li>
                <li><Link to="/register" className="transition-colors hover:text-zinc-900">Daftar</Link></li>
                <li><Link to="/my-bookings" className="transition-colors hover:text-zinc-900">Booking saya</Link></li>
                <li><Link to="/profile" className="transition-colors hover:text-zinc-900">Profil</Link></li>
              </ul>
            </div>

            <div className="md:col-span-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
                Operasional
              </p>
              <ul className="mt-4 space-y-2.5 text-[13px] text-zinc-500">
                <li><a href="#faq" className="transition-colors hover:text-zinc-900">FAQ</a></li>
                <li><a href="#cara-kerja" className="transition-colors hover:text-zinc-900">Cara kerja</a></li>
                <li><Link to="/login" className="transition-colors hover:text-zinc-900">Portal admin</Link></li>
                <li><Link to="/login" className="transition-colors hover:text-zinc-900">Bantuan</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-3 border-t border-zinc-200 pt-6 text-[11px] text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
            <p>© {CURRENT_YEAR} Arena Pasti. Semua hak dilindungi.</p>
            <p className="font-mono uppercase tracking-[0.14em]">
              Built for courts that never sleep
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
