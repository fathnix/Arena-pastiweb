import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, CheckIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

const BASE_PRICE = 120_000;
const START_HOUR = 8;
const END_HOUR = 22;
const DAY_NAMES = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

interface DayOption {
  index: number;
  dayName: string;
  dateLabel: string;
  weekday: string;
  isWeekend: boolean;
}

const currency = (value: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Math.round(value));

const compactCurrency = (value: number) =>
  `${Math.round(value / 1000).toLocaleString('id-ID')}rb`;

function buildDays(): DayOption[] {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index);
    const weekday = DAY_NAMES[date.getDay()];

    return {
      index,
      dayName: index === 0 ? 'Hari ini' : weekday,
      dateLabel: `${date.getDate()} ${MONTH_NAMES[date.getMonth()]}`,
      weekday,
      isWeekend: date.getDay() === 0 || date.getDay() === 6,
    };
  });
}

function isBookedSlot(dayIndex: number, hour: number) {
  const seed = (dayIndex * 17 + hour * 7 + (hour % 3) * 5) % 9;
  if (seed === 0 || seed === 4) return true;
  return hour >= 18 && seed === 7;
}

function isPastSlot(dayIndex: number, hour: number) {
  return dayIndex === 0 && hour <= new Date().getHours();
}

function priceForSlot(day: DayOption, hour: number) {
  let price = BASE_PRICE;
  if (day.isWeekend) price *= 1.2;
  if (hour >= 18) price *= 1.15;
  return price;
}

function defaultSelection() {
  for (let dayIndex = 0; dayIndex < 7; dayIndex += 1) {
    const peak = [18, 19, 20, 21, 22].filter(
      (hour) => !isBookedSlot(dayIndex, hour) && !isPastSlot(dayIndex, hour),
    );
    if (peak.length >= 2) {
      return { dayIndex, selected: peak.slice(0, 2) };
    }
  }
  return { dayIndex: 0, selected: [] as number[] };
}

export default function AvailabilityDemo() {
  const { isAuthenticated } = useAuth();
  const days = useMemo(() => buildDays(), []);
  const defaults = useMemo(() => defaultSelection(), []);
  const [dayIndex, setDayIndex] = useState(defaults.dayIndex);
  const [selected, setSelected] = useState<number[]>(defaults.selected);

  const activeDay = days[dayIndex];
  const slots = useMemo(
    () =>
      Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, index) => START_HOUR + index),
    [],
  );

  const selectedSorted = [...selected].sort((a, b) => a - b);
  const subtotal = selectedSorted.reduce((sum, hour) => sum + priceForSlot(activeDay, hour), 0);
  const hasPeak = selectedSorted.some((hour) => hour >= 18);
  const discount = selectedSorted.length >= 3 ? subtotal * 0.05 : 0;
  const total = subtotal - discount;

  const toggleSlot = (hour: number) => {
    if (isBookedSlot(dayIndex, hour) || isPastSlot(dayIndex, hour)) return;
    setSelected((current) =>
      current.includes(hour) ? current.filter((item) => item !== hour) : [...current, hour],
    );
  };

  const changeDay = (index: number) => {
    setDayIndex(index);
    setSelected((current) =>
      current.filter((hour) => !isBookedSlot(index, hour) && !isPastSlot(index, hour)),
    );
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_30px_70px_-45px_rgba(15,23,42,0.45)]">
      <div className="flex items-center justify-between gap-3 border-b border-zinc-200 px-5 py-4 sm:px-6">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
            <CheckIcon className="h-4 w-4" strokeWidth={2.5} />
          </span>
          <div>
            <p className="text-sm font-semibold tracking-tight text-zinc-900">Cek ketersediaan</p>
            <p className="text-[11px] text-zinc-500">Pilih tanggal & jam main</p>
          </div>
        </div>
        <span className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-700">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-600 opacity-70 [animation:pulse-ring_2s_ease-out_infinite]" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-600" />
          </span>
          Live
        </span>
      </div>

      <div className="p-5 sm:p-6">
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {days.map((day) => {
            const isActive = day.index === dayIndex;
            return (
              <button
                key={day.index}
                type="button"
                onClick={() => changeDay(day.index)}
                className={`group rounded-xl border px-1 py-2.5 text-center transition-all duration-200 ease-out sm:px-2 ${
                  isActive
                    ? 'border-emerald-700 bg-emerald-700 shadow-sm'
                    : 'border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50'
                }`}
              >
                <span
                  className={`flex h-7 items-center justify-center text-center text-[10px] font-medium leading-[1.1] ${
                    isActive ? 'text-emerald-100' : 'text-zinc-500'
                  }`}
                >
                  {day.dayName}
                </span>
                <span
                  className={`mt-0.5 block text-sm font-semibold tracking-tight ${
                    isActive ? 'text-white' : 'text-zinc-800'
                  }`}
                >
                  {day.dateLabel.split(' ')[0]}
                </span>
                <span
                  className={`mt-0.5 block text-[9px] uppercase tracking-wide ${
                    isActive ? 'text-emerald-200' : 'text-zinc-400'
                  }`}
                >
                  {day.dateLabel.split(' ')[1]}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-500">
            Slot tersedia
          </p>
          <div className="flex items-center gap-3 text-[10px] text-zinc-500">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm bg-emerald-600" /> Dipilih
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm border border-zinc-300 bg-white" /> Kosong
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm bg-amber-400" /> Penuh
            </span>
          </div>
        </div>

        <div className="mt-2.5 grid grid-cols-3 gap-2 sm:grid-cols-5">
          {slots.map((hour) => {
            const booked = isBookedSlot(dayIndex, hour);
            const past = isPastSlot(dayIndex, hour);
            const isSelected = selected.includes(hour);
            const disabled = booked || past;
            const peak = hour >= 18;

            return (
              <button
                key={hour}
                type="button"
                disabled={disabled}
                onClick={() => toggleSlot(hour)}
                className={`slot-button rounded-lg border px-1.5 py-2 text-center ${
                  isSelected
                    ? 'border-emerald-700 bg-emerald-700 text-white shadow-sm'
                    : disabled
                      ? 'cursor-not-allowed border-zinc-100 bg-zinc-50 text-zinc-400'
                      : 'border-zinc-200 bg-white text-zinc-700 hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-800'
                }`}
              >
                <span
                  className={`block font-mono text-[11px] font-medium ${
                    isSelected ? 'text-white' : disabled ? 'line-through' : ''
                  }`}
                >
                  {String(hour).padStart(2, '0')}:00
                </span>
                <span
                  className={`mt-0.5 block text-[9px] ${
                    isSelected
                      ? 'font-semibold text-emerald-100'
                      : disabled
                        ? 'text-zinc-400'
                        : peak
                          ? 'text-amber-700'
                          : 'text-zinc-400'
                  }`}
                >
                  {disabled ? (past ? 'Lewat' : 'Penuh') : isSelected ? 'Dipilih' : compactCurrency(priceForSlot(activeDay, hour))}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-5 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-500">
                Total estimasi
              </p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-bold tracking-tight text-zinc-900">
                  {currency(total)}
                </span>
                <span className="text-[11px] text-zinc-500">
                  / {selectedSorted.length || 0} jam
                </span>
              </div>
            </div>

            <Link
              to={isAuthenticated ? '/booking' : '/register'}
              className="group inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 ease-out hover:bg-emerald-800 hover:shadow-md sm:w-auto"
            >
              {isAuthenticated ? 'Lanjut booking' : 'Daftar & booking'}
              <ArrowRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="mt-3 space-y-1 border-t border-zinc-200 pt-3 text-[11px]">
            {activeDay.isWeekend && (
              <div className="flex items-center justify-between text-zinc-500">
                <span>Weekend surcharge</span>
                <span className="font-mono text-amber-700">+20%</span>
              </div>
            )}
            {hasPeak && (
              <div className="flex items-center justify-between text-zinc-500">
                <span>Peak hour (18:00–22:00)</span>
                <span className="font-mono text-amber-700">+15%</span>
              </div>
            )}
            {discount > 0 && (
              <div className="flex items-center justify-between text-emerald-700">
                <span>Diskon main 3 jam+</span>
                <span className="font-mono">−{currency(discount)}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-zinc-400">
              <span className="flex items-center gap-1.5">
                <LockClosedIcon className="h-3 w-3" />
                Slot terkunci selama checkout
              </span>
              <span className="font-mono">Demo</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
