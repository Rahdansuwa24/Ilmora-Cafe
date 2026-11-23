import React, { useState, useEffect, useMemo, useRef } from "react";
import { createIcons, icons } from "lucide";
import qrcode from "qrcode-generator";
import jsQR from "jsqr";
const fmtIDR = n => "Rp " + new Intl.NumberFormat("id-ID").format(n);
const fmtDate = ts => new Date(ts).toLocaleDateString("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric"
});
const fmtDateTime = ts => {
  const d = new Date(ts);
  const date = d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
  const time = d.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit"
  }).replace(":", ".");
  return `${date} • ${time}`;
};
const isExpired = v => !v.used && Date.now() > v.expiresAt;
const uid = () => Math.random().toString(36).slice(2, 9);
const TIER_ORDER = ["Bronze", "Silver", "Gold", "Platinum"];
const TIER_MIN_XP = {
  Bronze: 0,
  Silver: 1000,
  Gold: 2500,
  Platinum: 5000
};
const TIER_STYLE = {
  Bronze: "bg-amber-100 text-amber-800 border-amber-200",
  Silver: "bg-slate-100 text-slate-700 border-slate-300",
  Gold: "bg-yellow-100 text-yellow-800 border-yellow-300",
  Platinum: "bg-violet-100 text-violet-800 border-violet-300"
};
function tierInfo(xp) {
  if (xp >= 5000) return {
    tier: "Platinum",
    next: null,
    progress: 100,
    need: 0
  };
  if (xp >= 2500) return {
    tier: "Gold",
    next: "Platinum",
    progress: Math.round((xp - 2500) / 2500 * 100),
    need: 5000 - xp
  };
  if (xp >= 1000) return {
    tier: "Silver",
    next: "Gold",
    progress: Math.round((xp - 1000) / 1500 * 100),
    need: 2500 - xp
  };
  return {
    tier: "Bronze",
    next: "Silver",
    progress: Math.round(xp / 1000 * 100),
    need: 1000 - xp
  };
}
function maskWord(w) {
  if (!w) return w;
  if (w.length <= 2) return w.charAt(0) + "*";
  return w.charAt(0) + "*".repeat(w.length - 2) + w.charAt(w.length - 1);
}
function maskName(name) {
  return String(name).split(" ").map(maskWord).join(" ");
}
function Icon({
  name,
  className = "w-5 h-5"
}) {
  return <i data-lucide={name} className={className}></i>;
}
const INITIAL_MEMBERS = [{
  id: "AUR-001",
  name: "Andara Prameswari",
  tier: "Gold",
  points: 1240,
  xp: 2840,
  dailyXp: 320,
  monthlyXp: 2840,
  visits: 42,
  phone: "0812-3401-8871",
  joinDate: "12 Jan 2025"
}, {
  id: "AUR-002",
  name: "Rizky Ramadhan",
  tier: "Platinum",
  points: 2310,
  xp: 5420,
  dailyXp: 410,
  monthlyXp: 5420,
  visits: 78,
  phone: "0813-2209-4410",
  joinDate: "03 Nov 2024"
}, {
  id: "AUR-003",
  name: "Sinta Maharani",
  tier: "Gold",
  points: 980,
  xp: 2610,
  dailyXp: 280,
  monthlyXp: 2610,
  visits: 39,
  phone: "0821-7788-1122",
  joinDate: "20 Feb 2025"
}, {
  id: "AUR-004",
  name: "Bagus Aditya",
  tier: "Silver",
  points: 620,
  xp: 1780,
  dailyXp: 150,
  monthlyXp: 1780,
  visits: 25,
  phone: "0857-9912-3304",
  joinDate: "05 Mar 2025"
}, {
  id: "AUR-005",
  name: "Maya Putri",
  tier: "Silver",
  points: 540,
  xp: 1420,
  dailyXp: 190,
  monthlyXp: 1420,
  visits: 21,
  phone: "0819-4455-6677",
  joinDate: "18 Apr 2025"
}, {
  id: "AUR-006",
  name: "Dimas Prasetyo",
  tier: "Bronze",
  points: 210,
  xp: 640,
  dailyXp: 90,
  monthlyXp: 640,
  visits: 9,
  phone: "0822-3344-5566",
  joinDate: "02 Jun 2025"
}, {
  id: "AUR-007",
  name: "Larasati Ayu",
  tier: "Platinum",
  points: 1890,
  xp: 5110,
  dailyXp: 350,
  monthlyXp: 5110,
  visits: 71,
  phone: "0815-6677-8899",
  joinDate: "11 Dec 2024"
}, {
  id: "AUR-008",
  name: "Fajar Nugroho",
  tier: "Bronze",
  points: 120,
  xp: 380,
  dailyXp: 60,
  monthlyXp: 380,
  visits: 6,
  phone: "0838-1122-3344",
  joinDate: "30 Jul 2025"
}];
const B_COFFEE = [{
  k: "bean",
  l: "4%",
  t: "10%",
  s: 34,
  d: "5s",
  r: "-24deg"
}, {
  k: "milk",
  l: "88%",
  t: "8%",
  s: 32,
  d: "6s",
  r: "20deg"
}, {
  k: "bean",
  l: "8%",
  t: "66%",
  s: 28,
  d: "4.2s",
  r: "12deg"
}, {
  k: "sugar",
  l: "92%",
  t: "58%",
  s: 30,
  d: "5.2s",
  r: "15deg"
}, {
  k: "milk",
  l: "70%",
  t: "78%",
  s: 38,
  d: "5.6s",
  r: "-14deg"
}, {
  k: "bean",
  l: "50%",
  t: "5%",
  s: 24,
  d: "4.6s",
  r: "30deg"
}, {
  k: "sugar",
  l: "28%",
  t: "84%",
  s: 26,
  d: "6.2s",
  r: "-10deg"
}];
const B_CHOCO = [{
  k: "milk",
  l: "5%",
  t: "12%",
  s: 34,
  d: "5s",
  r: "-24deg"
}, {
  k: "chip",
  l: "86%",
  t: "10%",
  s: 32,
  d: "6s",
  r: "45deg"
}, {
  k: "milk",
  l: "10%",
  t: "66%",
  s: 28,
  d: "4.2s",
  r: "12deg"
}, {
  k: "chip",
  l: "80%",
  t: "64%",
  s: 34,
  d: "5.4s",
  r: "20deg"
}, {
  k: "milk",
  l: "68%",
  t: "78%",
  s: 38,
  d: "5.6s",
  r: "-14deg"
}, {
  k: "sugar",
  l: "45%",
  t: "5%",
  s: 26,
  d: "4.6s",
  r: "30deg"
}, {
  k: "chip",
  l: "30%",
  t: "84%",
  s: 28,
  d: "6.2s",
  r: "60deg"
}];
const B_AVO = [{
  k: "milk",
  l: "6%",
  t: "12%",
  s: 34,
  d: "5s",
  r: "-24deg"
}, {
  k: "leaf",
  l: "85%",
  t: "10%",
  s: 34,
  d: "6s",
  r: "20deg"
}, {
  k: "milk",
  l: "12%",
  t: "66%",
  s: 28,
  d: "4.2s",
  r: "12deg"
}, {
  k: "leaf",
  l: "79%",
  t: "64%",
  s: 32,
  d: "5.4s",
  r: "-30deg"
}, {
  k: "milk",
  l: "68%",
  t: "78%",
  s: 38,
  d: "5.6s",
  r: "-14deg"
}, {
  k: "sugar",
  l: "46%",
  t: "5%",
  s: 26,
  d: "4.6s",
  r: "30deg"
}, {
  k: "leaf",
  l: "32%",
  t: "84%",
  s: 30,
  d: "6.2s",
  r: "50deg"
}];
const B_PASTRY = [{
  k: "flour",
  l: "5%",
  t: "12%",
  s: 36,
  d: "5s",
  r: "0deg"
}, {
  k: "egg",
  l: "86%",
  t: "10%",
  s: 32,
  d: "6s",
  r: "20deg"
}, {
  k: "butter",
  l: "11%",
  t: "64%",
  s: 30,
  d: "4.2s",
  r: "12deg"
}, {
  k: "flour",
  l: "79%",
  t: "62%",
  s: 36,
  d: "5.4s",
  r: "0deg"
}, {
  k: "egg",
  l: "66%",
  t: "78%",
  s: 32,
  d: "5.6s",
  r: "-20deg"
}, {
  k: "butter",
  l: "45%",
  t: "5%",
  s: 28,
  d: "4.6s",
  r: "30deg"
}, {
  k: "flour",
  l: "29%",
  t: "84%",
  s: 32,
  d: "6.2s",
  r: "0deg"
}, {
  k: "egg",
  l: "93%",
  t: "38%",
  s: 26,
  d: "5.8s",
  r: "-40deg"
}];
const HERO_DRINKS = [{
  menuId: "c-kopsus",
  word: "KOPI SUSU",
  img: "/images/hero-glass-kopsus.jpg",
  bg: "#9CC3E5",
  bits: B_COFFEE
}, {
  menuId: "c-vietnam",
  word: "VIETNAM DRIP",
  img: "/images/hero-glass-vietnam.jpg",
  bg: "#8FB8E0",
  bits: B_COFFEE
}, {
  menuId: "c-latte",
  word: "COFFEE LATTE",
  img: "/images/hero-glass-latte.jpg",
  bg: "#A9CFEA",
  bits: B_COFFEE
}, {
  menuId: "n-chocolate",
  word: "CHOCOLATE",
  img: "/images/hero-glass-choco.jpg",
  bg: "#93BCE2",
  bits: B_CHOCO
}, {
  menuId: "n-avocado",
  word: "AVOCADO",
  img: "/images/hero-glass-avo.jpg",
  bg: "#9CCBE9",
  bits: B_AVO
}, {
  menuId: "p-croissant",
  word: "CROISSANT",
  img: "/images/hero-ani-croissant.jpg",
  bg: "#A5C9E8",
  bits: B_PASTRY
}, {
  menuId: "p-danish",
  word: "DANISH",
  img: "/images/hero-ani-danish.jpg",
  bg: "#8FB8E0",
  bits: B_PASTRY
}];
const PROMO_THEMES = [{
  tint: "#FFF7ED",
  edge: "#F97316",
  badge: "#FFEDD5",
  badgeText: "#9A3412"
}, {
  tint: "#EFF6FF",
  edge: "#2B92C4",
  badge: "#E0F2FE",
  badgeText: "#0C4A6E"
}, {
  tint: "#ECFDF5",
  edge: "#059669",
  badge: "#D1FAE5",
  badgeText: "#065F46"
}, {
  tint: "#FDF2F8",
  edge: "#DB2777",
  badge: "#FCE7F3",
  badgeText: "#831843"
}];
const INITIAL_PROMOS = [{
  id: "promo1",
  tag: "Happy Hour",
  title: "Beli 1 Gratis 1 Cold Brew",
  desc: "Setiap Senin–Jumat pukul 15.00–17.00. Tunjukkan Member ID di kasir.",
  valid: "s/d 30 Nov 2026",
  theme: 0
}, {
  id: "promo2",
  tag: "Double XP",
  title: "Weekend Double XP + Points",
  desc: "Semua pembelian Sabtu–Minggu dapat 2× XP. Otomatis masuk ke akun.",
  valid: "Setiap weekend",
  theme: 1
}, {
  id: "promo3",
  tag: "Member Baru",
  title: "Gratis Croissant untuk Gold+",
  desc: "Tukar 0 poin — klaim langsung dari aplikasi untuk tier Gold ke atas.",
  valid: "s/d 15 Des 2026",
  theme: 2
}];
const INITIAL_MISSIONS = [{
  id: "m1",
  type: "Harian",
  title: "Pesan 1 Signature Coffee",
  desc: "Aurora Signature / Kopi Susu Gula Aren hari ini.",
  progress: 1,
  target: 1,
  rewardPoints: 30,
  rewardXp: 60
}, {
  id: "m2",
  type: "Harian",
  title: "Kunjungi Happy Hour",
  desc: "Transaksi antara pukul 15.00–17.00.",
  progress: 0,
  target: 1,
  rewardPoints: 20,
  rewardXp: 40
}, {
  id: "m3",
  type: "Mingguan",
  title: "Order 2 Cold Brews minggu ini",
  desc: "Cold Brew Gula Aren / Cold Brew Classic.",
  progress: 1,
  target: 2,
  rewardPoints: 80,
  rewardXp: 150
}, {
  id: "m4",
  type: "Mingguan",
  title: "Belanja Rp 150rb dalam seminggu",
  desc: "Akumulasi semua struk minggu berjalan.",
  progress: 135000,
  target: 150000,
  isMoney: true,
  rewardPoints: 120,
  rewardXp: 200
}];
const INITIAL_TX = [{
  id: "tx1",
  no: "ILM-0001",
  date: "20 Nov 2026 • 09:12",
  items: "2× Cold Brew Gula Aren",
  amount: 64000,
  points: 64,
  xp: 128
}, {
  id: "tx2",
  no: "ILM-0002",
  date: "18 Nov 2026 • 16:40",
  items: "1× Oat Latte Honey + Croissant",
  amount: 58000,
  points: 58,
  xp: 116
}, {
  id: "tx3",
  no: "ILM-0003",
  date: "15 Nov 2026 • 10:05",
  items: "1× Caramel Cloud Macchiato",
  amount: 34000,
  points: 34,
  xp: 68
}, {
  id: "tx4",
  no: "ILM-0004",
  date: "11 Nov 2026 • 15:22",
  items: "2× Kopi Susu Ilmora (Happy Hour)",
  amount: 44000,
  points: 88,
  xp: 176
}, {
  id: "tx5",
  no: "ILM-0005",
  date: "07 Nov 2026 • 08:50",
  items: "1× Espresso + Pisang Goreng Madu",
  amount: 38000,
  points: 38,
  xp: 76
}];
const WHEEL_PRIZES = [{
  label: "Gratis Pulsa",
  sub: "Rp 10rb",
  color: "#6F4E37"
}, {
  label: "Voucher 21%",
  sub: "Min. Rp 50rb",
  color: "#F5EFE3"
}, {
  label: "+100 Poin",
  sub: "Langsung masuk",
  color: "#2B92C4"
}, {
  label: "Free Espresso",
  sub: "Senilai Rp 22rb",
  color: "#FFFFFF"
}, {
  label: "20% Off",
  sub: "Semua minuman",
  color: "#8A5A33"
}, {
  label: "Coba Lagi",
  sub: "Belum beruntung",
  color: "#EFE3CE"
}, {
  label: "Free Pastry",
  sub: "Croissant / Roti",
  color: "#1E7AA5"
}, {
  label: "50% Off",
  sub: "Min. Rp 50rb",
  color: "#E2E8F2"
}];
const FORECAST = [{
  name: "Coffee Beans",
  need: "92 kg",
  pct: 92,
  stockDays: 5,
  icon: "coffee"
}, {
  name: "Fresh Milk",
  need: "78 L",
  pct: 78,
  stockDays: 2,
  icon: "milk"
}, {
  name: "Palm Sugar",
  need: "65 kg",
  pct: 65,
  stockDays: 6,
  icon: "candy"
}, {
  name: "Oat Milk",
  need: "48 L",
  pct: 48,
  stockDays: 1,
  icon: "package"
}];
const INITIAL_REWARDS = [{
  id: "r1",
  name: "Free Espresso",
  cost: 300
}, {
  id: "r2",
  name: "Free Croissant",
  cost: 450
}, {
  id: "r3",
  name: "Voucher 20% Off",
  cost: 200
}, {
  id: "r4",
  name: "Voucher 50% Off",
  cost: 600
}];
const DEMO_ACCOUNTS = [{
  email: "member@aurora.id",
  pass: "member123",
  role: "customer",
  memberId: "AUR-001",
  name: "Andara Prameswari"
}, {
  email: "admin@aurora.id",
  pass: "admin123",
  role: "admin",
  memberId: null,
  name: "Aurora Admin"
}, {
  email: "kasir@aurora.id",
  pass: "kasir123",
  role: "kasir",
  memberId: null,
  name: "Kasir Aurora"
}];
const INITIAL_STAFFS = [{
  code: "01",
  name: "Aurora Admin",
  email: "admin@aurora.id",
  pass: "admin123",
  role: "admin",
  served: 0
}, {
  code: "02",
  name: "Kasir Aurora",
  email: "kasir@aurora.id",
  pass: "kasir123",
  role: "kasir",
  served: 0
}];
const MENU_CATALOG = [{
  id: "c-americano",
  cat: "coffee",
  name: "Americano",
  desc: "Espresso + air panas. Pahit bersih, aroma bold.",
  price: 18000,
  poin: 18,
  rating: "4.7",
  badge: "Coffee",
  badgeColor: "bg-peri",
  img: "/images/menu-coffee.jpg"
}, {
  id: "c-cappuccino",
  cat: "coffee",
  name: "Cappuccino",
  desc: "Espresso + susu steamed + foam tebal.",
  price: 23000,
  poin: 23,
  rating: "4.8",
  badge: "Coffee",
  badgeColor: "bg-peri",
  img: "/images/menu-cappuccino.jpg"
}, {
  id: "c-latte",
  cat: "coffee",
  name: "Coffee Latte",
  desc: "Espresso lembut + susu creamy yang milky.",
  price: 23000,
  poin: 23,
  rating: "4.8",
  badge: "Coffee",
  badgeColor: "bg-peri",
  img: "/images/menu-card-latte.jpg"
}, {
  id: "c-vietnam",
  cat: "coffee",
  name: "Vietnam Drip",
  desc: "Tetesan robusta + susu kental manis. Legit.",
  price: 23000,
  poin: 23,
  rating: "4.9",
  badge: "Coffee",
  badgeColor: "bg-peri",
  img: "/images/menu-card-vietnam.jpg"
}, {
  id: "c-tubruk",
  cat: "coffee",
  name: "Tubruk",
  desc: "Kopi tubruk klasik diseduh langsung. Mantap.",
  price: 20000,
  poin: 20,
  rating: "4.6",
  badge: "Coffee",
  badgeColor: "bg-peri",
  img: "/images/menu-card-tubruk.jpg"
}, {
  id: "c-v60",
  cat: "coffee",
  name: "V60",
  desc: "Manual brew pour-over. Bersih & aromatik.",
  price: 25000,
  poin: 25,
  rating: "4.8",
  badge: "Coffee",
  badgeColor: "bg-peri",
  img: "/images/menu-v60.jpg"
}, {
  id: "c-kopsus",
  cat: "coffee",
  name: "Kopi Susu",
  desc: "Signature creamy + gula aren, favorit semua kalangan.",
  price: 25000,
  poin: 25,
  rating: "4.9",
  badge: "Coffee",
  badgeColor: "bg-peri",
  img: "/images/hero-kopisusu.jpg"
}, {
  id: "n-chocolate",
  cat: "non",
  name: "Chocolate",
  desc: "Cokelat hangat/dingin yang rich & creamy.",
  price: 22000,
  poin: 22,
  rating: "4.8",
  badge: "Non-Coffee",
  badgeColor: "bg-rose-500",
  img: "/images/menu-card-choco.jpg"
}, {
  id: "n-redvelvet",
  cat: "non",
  name: "Red Velvet",
  desc: "Manis lembut dengan aroma kakao khas.",
  price: 22000,
  poin: 22,
  rating: "4.7",
  badge: "Non-Coffee",
  badgeColor: "bg-rose-500",
  img: "/images/menu-card-redvelvet.jpg"
}, {
  id: "n-greentea",
  cat: "non",
  name: "Green Tea",
  desc: "Matcha milky yang segar & menenangkan.",
  price: 22000,
  poin: 22,
  rating: "4.7",
  badge: "Non-Coffee",
  badgeColor: "bg-rose-500",
  img: "/images/menu-greentea.jpg"
}, {
  id: "n-caramel",
  cat: "non",
  name: "Caramel",
  desc: "Susu + karamel, manisnya pas.",
  price: 22000,
  poin: 22,
  rating: "4.6",
  badge: "Non-Coffee",
  badgeColor: "bg-rose-500",
  img: "/images/menu-caramel.jpg"
}, {
  id: "n-hazelnut",
  cat: "non",
  name: "Hazelnut",
  desc: "Susu creamy dengan sentuhan hazelnut.",
  price: 22000,
  poin: 22,
  rating: "4.7",
  badge: "Non-Coffee",
  badgeColor: "bg-rose-500",
  img: "/images/menu-hazelnut.jpg"
}, {
  id: "n-avocado",
  cat: "non",
  name: "Avocado",
  desc: "Jus alpukat + susu + cokelat. Mengenyangkan.",
  price: 25000,
  poin: 25,
  rating: "4.8",
  badge: "Non-Coffee",
  badgeColor: "bg-rose-500",
  img: "/images/menu-card-avo.jpg"
}, {
  id: "n-jasmine",
  cat: "non",
  name: "Jasmine Tea",
  desc: "Teh melati ringan & wangi. Menyegarkan.",
  price: 16000,
  poin: 16,
  rating: "4.6",
  badge: "Non-Coffee",
  badgeColor: "bg-rose-500",
  img: "/images/menu-card-jasmine.jpg"
}, {
  id: "n-lychee",
  cat: "non",
  name: "Lychee Tea",
  desc: "Teh buah leci, manis segar.",
  price: 20000,
  poin: 20,
  rating: "4.7",
  badge: "Non-Coffee",
  badgeColor: "bg-rose-500",
  img: "/images/menu-card-lychee.jpg"
}, {
  id: "p-butter",
  cat: "pastry",
  name: "Butter Croissant",
  desc: "Renyah berlapis dengan mentega premium.",
  price: 20000,
  poin: 20,
  rating: "4.8",
  badge: "Pastry",
  badgeColor: "bg-emerald-600",
  img: "/images/menu-card-butter.jpg"
}, {
  id: "p-croissant",
  cat: "pastry",
  name: "Croissant",
  desc: "Renyah di luar, lembut di dalam. Teman ngopi.",
  price: 25000,
  poin: 25,
  rating: "4.8",
  badge: "Pastry",
  badgeColor: "bg-emerald-600",
  img: "/images/menu-croissant.jpg"
}, {
  id: "p-danish",
  cat: "pastry",
  name: "Danish Pastry",
  desc: "Pastry Denmark manis dengan isian.",
  price: 25000,
  poin: 25,
  rating: "4.7",
  badge: "Pastry",
  badgeColor: "bg-emerald-600",
  img: "/images/menu-card-danish.jpg"
}];
const MENU_CATS = [{
  value: "coffee",
  label: "Coffee",
  color: "bg-peri"
}, {
  value: "non",
  label: "Non-Coffee",
  color: "bg-rose-500"
}, {
  value: "pastry",
  label: "Pastry",
  color: "bg-emerald-600"
}];
function qrPattern(seedStr) {
  const N = 21;
  let h = 0;
  for (let i = 0; i < seedStr.length; i++) h = h * 31 + seedStr.charCodeAt(i) >>> 0;
  const cells = [];
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const inFinder = x < 7 && y < 7 || x >= N - 7 && y < 7 || x < 7 && y >= N - 7;
    if (inFinder) continue;
    let v = h ^ x * 374761393 + y * 668265263;
    v = (v ^ v >> 13) >>> 0;
    if (v % 3 !== 0) cells.push([x, y]);
  }
  return {
    N,
    cells
  };
}
function Finder({
  x,
  y
}) {
  return <g>
      <rect x={x} y={y} width="7" height="7" fill="#1E2432" rx="1.5" />
      <rect x={x + 1} y={y + 1} width="5" height="5" fill="white" />
      <rect x={x + 2} y={y + 2} width="3" height="3" fill="#1E2432" />
    </g>;
}
function RealQR({
  text,
  size = 189
}) {
  const mod = useMemo(() => {
    try {
      {
        const q = qrcode(0, "M");
        q.addData(text);
        q.make();
        const n = q.getModuleCount();
        const cells = [];
        for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) cells.push([c, r]);
        return {
          n,
          cells
        };
      }
    } catch (e) {}
    const f = qrPattern(text || "ILMORA");
    return {
      n: f.N,
      cells: f.cells
    };
  }, [text]);
  return <svg width={size} height={size} viewBox={`0 0 ${mod.n} ${mod.n}`} shapeRendering="crispEdges">
      <rect width={mod.n} height={mod.n} fill="white" />
      {mod.cells.map(([x, y], i) => <rect key={i} x={x} y={y} width="1.02" height="1.02" fill="#1E2432" />)}
    </svg>;
}
function App() {
  const [role, setRole] = useState("customer");
  const [currentUserId, setCurrentUserId] = useState("AUR-001");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [members, setMembers] = useState(INITIAL_MEMBERS);
  const [promos, setPromos] = useState(INITIAL_PROMOS);
  const [missions, setMissions] = useState(INITIAL_MISSIONS.map(m => ({
    ...m,
    claimed: false
  })));
  const [transactions, setTransactions] = useState(INITIAL_TX);
  const [vouchers, setVouchers] = useState([{
    id: "v-awal",
    label: "20% Off",
    code: "AUR-20-8X2K",
    date: "18 Nov 2026",
    expiresAt: Date.now() + 7 * 86400000,
    used: false,
    memberId: "AUR-001",
    memberName: "Andara Prameswari"
  }]);
  const [ratio, setRatio] = useState({
    idrPer: 10000,
    pointsPer: 10,
    xpPer: 20
  });
  const [rewards, setRewards] = useState(INITIAL_REWARDS);
  const [leaderTab, setLeaderTab] = useState("top");
  const [showQR, setShowQR] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [winPrize, setWinPrize] = useState(null);
  const promoRef = useRef(null);
  const [promoPaused, setPromoPaused] = useState(false);
  const [menuPage, setMenuPage] = useState(0);
  const [heroIdx, setHeroIdx] = useState(0);
  const [heroPaused, setHeroPaused] = useState(false);
  const [voucherDays, setVoucherDays] = useState(7);
  const [session, setSession] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [authTab, setAuthTab] = useState("login");
  const [loginForm, setLoginForm] = useState({
    email: "",
    pass: "",
    role: "member"
  });
  const [regForm, setRegForm] = useState({
    nama: "",
    umur: "",
    email: "",
    pass: "",
    pass2: ""
  });
  const [accounts, setAccounts] = useState([]);
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [showRegPass, setShowRegPass] = useState(false);
  const [showRegPass2, setShowRegPass2] = useState(false);
  const [voucherQR, setVoucherQR] = useState(null);
  const [voucherQRFrom, setVoucherQRFrom] = useState("member");
  const [selectedTx, setSelectedTx] = useState(null);
  const [showAllTx, setShowAllTx] = useState(false);
  const [menus, setMenus] = useState(MENU_CATALOG.map(m => ({
    ...m,
    xp: m.poin * 2
  })));
  const [menuForm, setMenuForm] = useState({
    name: "",
    desc: "",
    price: "",
    poin: "",
    xp: "",
    rating: "4.8",
    cat: "coffee",
    badge: "Coffee",
    badgeColor: "bg-peri",
    img: ""
  });
  const [editingMenuId, setEditingMenuId] = useState(null);
  const [adminTab, setAdminTab] = useState("kasir");
  const [kasirView, setKasirView] = useState("transaksi");
  const [cashierMember, setCashierMember] = useState("AUR-001");
  const [cashierQuery, setCashierQuery] = useState("");
  const [cashierFocus, setCashierFocus] = useState(false);
  const [cart, setCart] = useState({});
  const [menuQuery, setMenuQuery] = useState("");
  const [menuFocus, setMenuFocus] = useState(false);
  const [staffs, setStaffs] = useState(INITIAL_STAFFS);
  const [staffForm, setStaffForm] = useState({
    name: "",
    email: "",
    pass: "",
    role: "kasir"
  });
  const [editingStaff, setEditingStaff] = useState(null);
  const [showStaffPass, setShowStaffPass] = useState(false);
  const [showEditStaffPass, setShowEditStaffPass] = useState(false);
  const [scanMode, setScanMode] = useState("file");
  const [camError, setCamError] = useState("");
  const [camStatus, setCamStatus] = useState({
    s: "idle",
    text: ""
  });
  const [qrSeen, setQrSeen] = useState(false);
  const videoRef = useRef(null);
  const camStreamRef = useRef(null);
  const camLoopRef = useRef(null);
  const seenRef = useRef(false);
  const lastInvalidRef = useRef("");
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("Semua");
  const [editing, setEditing] = useState(null);
  const [promoForm, setPromoForm] = useState({
    tag: "Promo Baru",
    title: "",
    desc: "",
    valid: ""
  });
  const [newReward, setNewReward] = useState({
    name: "",
    cost: ""
  });
  const [toasts, setToasts] = useState([]);
  const me = members.find(m => m.id === currentUserId) || members[0];
  const myTier = tierInfo(me.xp);
  const [page, setPage] = useState("beranda");
  const menuRef = useRef(null);
  const [spinHistory, setSpinHistory] = useState([{
    id: "sh1",
    label: "Gratis Pulsa",
    code: "GRA-9K2Q",
    time: "04.00"
  }, {
    id: "sh2",
    label: "Voucher 21%",
    code: "VOU-7T1M",
    time: "12.00"
  }, {
    id: "sh3",
    label: "+100 Poin",
    code: "POI-3B8N",
    time: "Kemarin, 14.00"
  }]);
  const boardByPoints = useMemo(() => [...members].sort((a, b) => b.points - a.points), [members]);
  const rankBoard = useMemo(() => {
    if (leaderTab === "harian") return [...members].sort((a, b) => b.dailyXp - a.dailyXp).slice(0, 10);
    if (leaderTab === "mingguan") return [...members].sort((a, b) => b.monthlyXp - a.monthlyXp).slice(0, 10);
    return boardByPoints.slice(0, 10);
  }, [members, leaderTab, boardByPoints]);
  const rankUnit = leaderTab === "top" ? "poin" : "XP";
  const rankScore = m => leaderTab === "top" ? m.points : leaderTab === "harian" ? m.dailyXp : m.monthlyXp;
  const goPage = p => {
    setPage(p);
    setMobileMenu(false);
    window.scrollTo({
      top: 0
    });
  };
  const needLogin = () => {
    if (session && session.role === "customer") return false;
    if (session) {
      pushToast("Mode pratinjau staf: masuk sebagai Member untuk fitur ini.", "error");
      return true;
    }
    setShowLogin(true);
    setAuthTab("login");
    pushToast("Login dulu sebagai member untuk lanjut.", "error");
    return true;
  };
  useEffect(() => {
    createIcons({
      icons
    });
  });
  useEffect(() => {
    if (!toasts.length) return;
    const t = setTimeout(() => setToasts(p => p.slice(1)), 3200);
    return () => clearTimeout(t);
  }, [toasts]);
  useEffect(() => {
    if (role !== "customer" || page !== "beranda") return;
    let raf;
    let last = performance.now();
    const SPEED = 45;
    const tick = now => {
      const el = promoRef.current;
      const dt = Math.min(64, now - last);
      last = now;
      if (el && !promoPaused && !document.hidden && el.scrollWidth > el.clientWidth + 10) {
        const half = el.scrollWidth / 2;
        let next = el.scrollLeft + SPEED * dt / 1000;
        if (next >= half) next -= half;
        el.scrollLeft = next;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [role, page, promoPaused, promos.length]);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page]);
  useEffect(() => {
    if (page !== "beranda" || heroPaused) return;
    const iv = setInterval(() => setHeroIdx(i => (i + 1) % HERO_DRINKS.length), 4500);
    return () => clearInterval(iv);
  }, [page, heroPaused]);
  useEffect(() => () => {
    try {
      if (camLoopRef.current) cancelAnimationFrame(camLoopRef.current);
      if (camStreamRef.current) camStreamRef.current.getTracks().forEach(t => t.stop());
    } catch (e) {}
  }, []);
  const pushToast = (msg, type = "success") => setToasts(p => [...p, {
    id: uid(),
    msg,
    type
  }]);
  const doLogin = () => {
    const email = loginForm.email.trim().toLowerCase();
    if (!email || !loginForm.pass) {
      pushToast("Isi email & password dulu.", "error");
      return;
    }
    const acc = [...staffs, ...accounts, ...DEMO_ACCOUNTS].find(a => a.email.toLowerCase() === email);
    if (!acc || acc.pass !== loginForm.pass) {
      pushToast("Email / password salah.", "error");
      return;
    }
    if (acc.memberId) setCurrentUserId(acc.memberId);
    setRole(acc.role);
    if (acc.role !== "customer") setAdminTab("kasir");
    setSession({
      name: acc.name,
      email: acc.email,
      role: acc.role,
      memberId: acc.memberId || null
    });
    setShowLogin(false);
    setLoginForm({
      email: "",
      pass: "",
      role: "member"
    });
    pushToast(`Selamat datang, ${acc.name}!`);
  };
  const doRegister = () => {
    const nama = regForm.nama.trim();
    const umur = parseInt(regForm.umur, 10);
    const email = regForm.email.trim().toLowerCase();
    if (nama.length < 3) {
      pushToast("Nama minimal 3 huruf.", "error");
      return;
    }
    if (!umur || umur < 5 || umur > 120) {
      pushToast("Umur tidak valid (5–120).", "error");
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      pushToast("Email tidak valid.", "error");
      return;
    }
    if (regForm.pass.length < 6) {
      pushToast("Password minimal 6 karakter.", "error");
      return;
    }
    if (regForm.pass !== regForm.pass2) {
      pushToast("Konfirmasi password tidak sama.", "error");
      return;
    }
    if ([...DEMO_ACCOUNTS, ...accounts, ...staffs].some(a => a.email.toLowerCase() === email)) {
      pushToast("Email sudah terdaftar, silakan login.", "error");
      return;
    }
    const id = "AUR-" + String(Math.floor(100 + Math.random() * 900));
    setMembers(prev => [...prev, {
      id,
      name: nama,
      points: 100,
      xp: 0,
      dailyXp: 0,
      monthlyXp: 0,
      visits: 1,
      phone: "-",
      joinDate: "22 Nov 2026"
    }]);
    setAccounts(prev => [...prev, {
      email,
      pass: regForm.pass,
      role: "customer",
      memberId: id,
      name: nama
    }]);
    setCurrentUserId(id);
    setRole("customer");
    setSession({
      name: nama,
      email,
      role: "customer",
      memberId: id
    });
    setRegForm({
      nama: "",
      umur: "",
      email: "",
      pass: "",
      pass2: ""
    });
    setShowLogin(false);
    pushToast(`Akun ${nama} dibuat! Bonus 100 poin selamat datang.`);
  };
  const doLogout = () => {
    setSession(null);
    setRole("customer");
    pushToast("Kamu sudah keluar. Sampai jumpa!");
  };
  const [claimCode, setClaimCode] = useState("");
  const [showScan, setShowScan] = useState(false);
  const [scanMemberId, setScanMemberId] = useState(null);
  const [scanning, setScanning] = useState(false);
  const currentStaffCode = () => {
    if (session && session.email) {
      const s = staffs.find(x => x.email.toLowerCase() === session.email.toLowerCase());
      if (s) return s.code;
    }
    return "01";
  };
  const bumpServed = () => {
    if (!session || !session.email) return;
    const em = session.email.toLowerCase();
    setStaffs(prev => prev.map(s => s.email.toLowerCase() === em ? {
      ...s,
      served: (s.served || 0) + 1
    } : s));
  };
  const claimVoucherCode = raw => {
    const code = String(raw || "").trim().toUpperCase();
    if (!code) {
      pushToast("Masukkan kode voucher dulu.", "error");
      return false;
    }
    const v = vouchers.find(x => x.code.toUpperCase() === code);
    if (!v) {
      pushToast("Kode voucher tidak ditemukan.", "error");
      return false;
    }
    if (v.used) {
      pushToast(`Voucher ${v.label} (${v.code}) sudah terpakai.`, "error");
      return false;
    }
    if (isExpired(v)) {
      pushToast(`Voucher ${v.label} (${v.code}) sudah kedaluwarsa (hangus).`, "error");
      return false;
    }
    setVouchers(prev => prev.map(x => x.id === v.id ? {
      ...x,
      used: true,
      usedAt: Date.now(),
      kasir: currentStaffCode()
    } : x));
    bumpServed();
    pushToast(`Voucher ${v.label} (${v.code}) berhasil diklaim.`);
    return true;
  };
  const claimVoucher = () => {
    if (claimVoucherCode(claimCode)) setClaimCode("");
  };
  const nextStaffCode = () => {
    const nums = staffs.map(s => parseInt(s.code, 10)).filter(n => !isNaN(n));
    const mx = nums.length ? Math.max(...nums) : 0;
    return String(mx + 1).padStart(2, "0");
  };
  const addStaff = () => {
    const name = staffForm.name.trim();
    const email = staffForm.email.trim().toLowerCase();
    if (name.length < 3) {
      pushToast("Nama kasir/admin minimal 3 huruf.", "error");
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      pushToast("Email tidak valid.", "error");
      return;
    }
    if (staffForm.pass.length < 6) {
      pushToast("Password baru minimal 6 karakter.", "error");
      return;
    }
    if ([...DEMO_ACCOUNTS, ...accounts, ...staffs].some(a => a.email.toLowerCase() === email)) {
      pushToast("Email sudah dipakai akun lain.", "error");
      return;
    }
    const code = nextStaffCode();
    setStaffs(prev => [...prev, {
      code,
      name,
      email,
      pass: staffForm.pass,
      role: staffForm.role,
      served: 0
    }]);
    setStaffForm({
      name: "",
      email: "",
      pass: "",
      role: "kasir"
    });
    setShowStaffPass(false);
    pushToast(`Kasir ${code} (${name}) ditambahkan.`);
  };
  const saveStaff = () => {
    if (!editingStaff) return;
    const name = String(editingStaff.name || "").trim();
    if (name.length < 3) {
      pushToast("Nama minimal 3 huruf.", "error");
      return;
    }
    if (String(editingStaff.pass || "").length < 6) {
      pushToast("Password minimal 6 karakter.", "error");
      return;
    }
    setStaffs(prev => prev.map(s => s.code === editingStaff.code ? {
      ...s,
      name,
      pass: editingStaff.pass
    } : s));
    setEditingStaff(null);
    setShowEditStaffPass(false);
    pushToast(`Data Kasir ${editingStaff.code} diperbarui.`);
  };
  const deleteStaff = code => {
    const s = staffs.find(x => x.code === code);
    if (session && s && session.email && s.email.toLowerCase() === session.email.toLowerCase()) {
      pushToast("Tidak bisa menghapus akun yang sedang login.", "error");
      return;
    }
    setStaffs(prev => prev.filter(x => x.code !== code));
    if (editingStaff && editingStaff.code === code) setEditingStaff(null);
    pushToast(`Kasir ${code} dihapus.`);
  };
  const getJsQR = async () => jsQR;
  const parseMemberText = txt => {
    const t = String(txt || "").trim();
    const mm = t.match(/ILMORA-MEMBER:([A-Za-z0-9-]+)/i);
    const mid = mm ? mm[1].toUpperCase() : /^AUR-\d+$/i.test(t) ? t.toUpperCase() : null;
    return mid;
  };
  const handleScanText = txt => {
    const t = String(txt || "").trim();
    const mid = parseMemberText(t);
    if (mid) {
      const m = members.find(x => x.id.toUpperCase() === mid);
      if (m) {
        setScanMemberId(m.id);
        setCamStatus({
          s: "found",
          text: t
        });
        if (navigator.vibrate) {
          try {
            navigator.vibrate(120);
          } catch (e) {}
        }
        pushToast(`QR terbaca ✓ Member: ${m.name}`);
        stopCamera();
        setScanMode("file");
        return "member";
      }
      return null;
    }
    const vm = t.match(/ILMORA-VOUCHER:([A-Za-z0-9-]+)/i);
    const vcand = (vm ? vm[1] : t).toUpperCase();
    const v = vouchers.find(x => x.code.toUpperCase() === vcand);
    if (v) {
      setVoucherQR(v);
      setVoucherQRFrom("kasir");
      setCamStatus({
        s: "found",
        text: t
      });
      if (navigator.vibrate) {
        try {
          navigator.vibrate(120);
        } catch (e) {}
      }
      pushToast(`QR terbaca ✓ Voucher: ${v.label} (${v.code})`);
      closeScan();
      return "voucher";
    }
    return null;
  };
  const stopCamera = () => {
    if (camLoopRef.current) {
      cancelAnimationFrame(camLoopRef.current);
      camLoopRef.current = null;
    }
    if (camStreamRef.current) {
      try {
        camStreamRef.current.getTracks().forEach(t => t.stop());
      } catch (e) {}
      camStreamRef.current = null;
    }
    if (videoRef.current) {
      try {
        videoRef.current.srcObject = null;
      } catch (e) {}
    }
  };
  const closeScan = () => {
    stopCamera();
    setShowScan(false);
    setScanMemberId(null);
    setScanMode("file");
    setCamError("");
    setScanning(false);
    setCamStatus({
      s: "idle",
      text: ""
    });
    setQrSeen(false);
    seenRef.current = false;
    lastInvalidRef.current = "";
  };
  const startCamera = async () => {
    setCamError("");
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCamError("Kamera tidak didukung di perangkat ini. Pakai pilih file di bawah.");
      setScanMode("file");
      return;
    }
    setScanning(true);
    stopCamera();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment"
        },
        audio: false
      });
      camStreamRef.current = stream;
      setScanMode("camera");
      setScanning(false);
      setCamStatus({
        s: "searching",
        text: ""
      });
      setQrSeen(false);
      seenRef.current = false;
      lastInvalidRef.current = "";
      let tries = 0;
      const attach = () => {
        const v = videoRef.current;
        if (v) {
          v.srcObject = stream;
          v.setAttribute("playsinline", "true");
          v.muted = true;
          v.play().catch(() => {});
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d", {
            willReadFrequently: true
          });
          let lastT = 0;
          const markSeen = seen => {
            if (seenRef.current !== seen) {
              seenRef.current = seen;
              setQrSeen(seen);
            }
          };
          const loop = async now => {
            if (!camStreamRef.current) return;
            try {
              if (v.readyState === v.HAVE_ENOUGH_DATA && v.videoWidth > 0 && now - lastT > 250) {
                lastT = now;
                const sc = Math.min(1, 720 / Math.max(v.videoWidth, v.videoHeight));
                canvas.width = Math.max(1, Math.round(v.videoWidth * sc));
                canvas.height = Math.max(1, Math.round(v.videoHeight * sc));
                ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
                const id = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const jsQR = await getJsQR();
                if (!camStreamRef.current) return;
                const found = jsQR(id.data, id.width, id.height, {
                  inversionAttempts: "attemptBoth"
                });
                if (found && found.data) {
                  markSeen(true);
                  if (handleScanText(found.data)) return;
                  const txt = String(found.data).slice(0, 60);
                  if (lastInvalidRef.current !== txt) {
                    lastInvalidRef.current = txt;
                    setCamStatus({
                      s: "invalid",
                      text: txt
                    });
                  }
                } else {
                  markSeen(false);
                }
              }
            } catch (e) {}
            camLoopRef.current = requestAnimationFrame(loop);
          };
          camLoopRef.current = requestAnimationFrame(loop);
        } else if (tries++ < 30) {
          setTimeout(attach, 150);
        } else {
          setCamError("Video pratinjau gagal tampil. Pakai pilih file.");
          setScanMode("file");
          stopCamera();
        }
      };
      attach();
    } catch (e) {
      setScanning(false);
      const name = e && e.name || "";
      if (name === "NotAllowedError" || name === "SecurityError") setCamError("Izin kamera ditolak. Izinkan akses kamera di browser, atau pakai pilih file di bawah.");else if (name === "NotFoundError" || name === "OverconstrainedError") setCamError("Kamera tidak ditemukan di perangkat ini. Pakai pilih file di bawah.");else setCamError("Kamera gagal dibuka. Pakai pilih file di bawah.");
      setScanMode("file");
      stopCamera();
    }
  };
  const snapAndDecode = async () => {
    const v = videoRef.current;
    if (!v || !v.videoWidth) {
      pushToast("Kamera belum siap. Tunggu sebentar.", "error");
      return;
    }
    try {
      const canvas = document.createElement("canvas");
      const sc = Math.min(1, 1280 / Math.max(v.videoWidth, v.videoHeight));
      canvas.width = Math.max(1, Math.round(v.videoWidth * sc));
      canvas.height = Math.max(1, Math.round(v.videoHeight * sc));
      const ctx = canvas.getContext("2d", {
        willReadFrequently: true
      });
      ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
      const id = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const jsQR = await getJsQR();
      const found = jsQR(id.data, id.width, id.height, {
        inversionAttempts: "attemptBoth"
      });
      if (!found || !found.data) {
        setCamStatus({
          s: "invalid",
          text: "tidak ada QR"
        });
        pushToast("Tidak ada QR yang terbaca. Dekatkan QR ke kotak & sejajarkan.", "error");
        return;
      }
      if (handleScanText(found.data)) return;
      const txt = String(found.data).slice(0, 60);
      lastInvalidRef.current = txt;
      setCamStatus({
        s: "invalid",
        text: txt
      });
      pushToast("QR terbaca ✗ tapi bukan QR Ilmora (member/voucher).", "error");
    } catch (e) {
      pushToast("Gagal memindai frame. Coba lagi.", "error");
    }
  };
  const onScanFile = async f => {
    if (!f || scanning) return;
    setScanning(true);
    try {
      const dataUrl = await new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(r.result);
        r.onerror = rej;
        r.readAsDataURL(f);
      });
      const img = await new Promise((res, rej) => {
        const im = new Image();
        im.onload = () => res(im);
        im.onerror = rej;
        im.src = dataUrl;
      });
      const cw = document.createElement("canvas");
      const sc = Math.min(1, 800 / Math.max(img.width, img.height));
      cw.width = Math.max(1, Math.round(img.width * sc));
      cw.height = Math.max(1, Math.round(img.height * sc));
      const cx = cw.getContext("2d", {
        willReadFrequently: true
      });
      cx.drawImage(img, 0, 0, cw.width, cw.height);
      const id = cx.getImageData(0, 0, cw.width, cw.height);
      const jsQR = await getJsQR();
      const found = jsQR(id.data, id.width, id.height, {
        inversionAttempts: "attemptBoth"
      });
      if (!found || !found.data) {
        pushToast("QR tidak terbaca. Coba foto lebih jelas atau ketik kode manual.", "error");
        return;
      }
      const mid = parseMemberText(found.data);
      if (mid) {
        const m = members.find(x => x.id.toUpperCase() === mid);
        if (m) {
          setScanMemberId(m.id);
          pushToast(`QR terbaca ✓ Member: ${m.name}`);
          return;
        }
        pushToast(`Member ${mid} tidak ditemukan.`, "error");
        return;
      }
      const vm = String(found.data).trim().match(/ILMORA-VOUCHER:([A-Za-z0-9-]+)/i);
      const vcand = (vm ? vm[1] : String(found.data).trim()).toUpperCase();
      const vv = vouchers.find(x => x.code.toUpperCase() === vcand);
      if (vv) {
        setVoucherQR(vv);
        setVoucherQRFrom("kasir");
        setShowScan(false);
        setScanMemberId(null);
        pushToast(`QR terbaca ✓ Voucher: ${vv.label} (${vv.code})`);
        return;
      }
      if (vm) {
        pushToast(`Kode voucher ${vcand} tidak dikenal.`, "error");
        return;
      }
      pushToast("QR ini bukan QR Ilmora (member/voucher).", "error");
      return;
    } catch (e) {
      pushToast("Gagal memindai. Periksa koneksi lalu coba lagi / ketik manual.", "error");
    } finally {
      setScanning(false);
    }
  };
  const spinWheel = () => {
    if (spinning) return;
    if (needLogin()) return;
    if (me.points < 50) {
      pushToast("Poin tidak cukup (butuh 50 poin).", "error");
      return;
    }
    setMembers(prev => prev.map(m => m.id === me.id ? {
      ...m,
      points: m.points - 50
    } : m));
    setSpinning(true);
    setWinPrize(null);
    const winIdx = Math.floor(Math.random() * WHEEL_PRIZES.length);
    const current = (rotation % 360 + 360) % 360;
    const finalMod = ((90 - winIdx * 45) % 360 + 360) % 360;
    const jitter = Math.floor(Math.random() * 20) - 10;
    const delta = 360 * 5 + (finalMod - current + 360) % 360 + jitter;
    const next = rotation + delta;
    requestAnimationFrame(() => setRotation(next));
    setTimeout(() => {
      const prize = WHEEL_PRIZES[winIdx];
      setSpinning(false);
      setWinPrize(prize);
      const code = (prize.label.slice(0, 3).toUpperCase().replace(/[^A-Z]/g, "X") || "HDH") + "-" + Math.random().toString(36).slice(2, 6).toUpperCase();
      if (prize.label === "+100 Poin") {
        setMembers(prev => prev.map(m => m.id === me.id ? {
          ...m,
          points: m.points + 100,
          xp: m.xp + 50,
          dailyXp: m.dailyXp + 50,
          monthlyXp: m.monthlyXp + 50
        } : m));
        setSpinHistory(prev => [{
          id: uid(),
          label: prize.label,
          code,
          time: "Baru saja"
        }, ...prev]);
      } else if (prize.label !== "Coba Lagi") {
        setVouchers(prev => [{
          id: uid(),
          label: prize.label,
          code,
          date: "22 Nov 2026",
          expiresAt: Date.now() + voucherDays * 86400000,
          used: false,
          memberId: me.id,
          memberName: me.name
        }, ...prev]);
        setSpinHistory(prev => [{
          id: uid(),
          label: prize.label,
          code,
          time: "Baru saja"
        }, ...prev]);
      }
    }, 4300);
  };
  const claimMission = m => {
    const done = m.isMoney ? m.progress >= m.target : m.progress >= m.target;
    if (!done || m.claimed) return;
    setMembers(prev => prev.map(x => x.id === me.id ? {
      ...x,
      points: x.points + m.rewardPoints,
      xp: x.xp + m.rewardXp,
      dailyXp: x.dailyXp + m.rewardXp,
      monthlyXp: x.monthlyXp + m.rewardXp
    } : x));
    setMissions(prev => prev.map(x => x.id === m.id ? {
      ...x,
      claimed: true
    } : x));
    pushToast(`Misi "${m.title}" diklaim! +${m.rewardPoints} poin, +${m.rewardXp} XP`);
  };
  const resolveCashierMember = () => {
    const q = cashierQuery.trim().toLowerCase();
    if (!q) return members.find(m => m.id === cashierMember) || null;
    return members.find(m => m.id.toLowerCase() === q) || members.find(m => q.startsWith(m.id.toLowerCase())) || members.find(m => m.name.toLowerCase() === q) || members.find(m => m.name.toLowerCase().includes(q)) || members.find(m => m.id.toLowerCase().includes(q)) || null;
  };
  const cashierMatches = useMemo(() => {
    const q = cashierQuery.trim().toLowerCase();
    if (!q) return members;
    return members.filter(m => m.id.toLowerCase().includes(q) || m.name.toLowerCase().includes(q));
  }, [members, cashierQuery]);
  const cartEntries = menus.map(m => ({
    ...m,
    qty: cart[m.id] || 0
  })).filter(e => e.qty > 0);
  const cartAmt = cartEntries.reduce((s, e) => s + e.price * e.qty, 0);
  const cartPts = cartEntries.reduce((s, e) => s + (e.poin ? e.poin * e.qty : Math.floor(e.price * e.qty / ratio.idrPer) * ratio.pointsPer), 0);
  const cartXp = cartEntries.reduce((s, e) => s + (e.xp ? e.xp * e.qty : Math.floor(e.price * e.qty / ratio.idrPer) * ratio.xpPer), 0);
  const incCart = id => setCart(p => ({
    ...p,
    [id]: Math.min(99, (p[id] || 0) + 1)
  }));
  const decCart = id => setCart(p => {
    const q = (p[id] || 0) - 1;
    const n = {
      ...p
    };
    if (q <= 0) delete n[id];else n[id] = q;
    return n;
  });
  const removeCart = id => setCart(p => {
    const n = {
      ...p
    };
    delete n[id];
    return n;
  });
  const menuMatches = useMemo(() => {
    const q = menuQuery.trim().toLowerCase();
    if (!q) return menus;
    return menus.filter(m => m.name.toLowerCase().includes(q));
  }, [menus, menuQuery]);
  const submitCashier = () => {
    const target = resolveCashierMember();
    if (!target) {
      pushToast("Pilih member dulu dari daftar.", "error");
      return;
    }
    if (cartEntries.length === 0) {
      pushToast("Pilih minimal 1 menu.", "error");
      return;
    }
    const kcode = currentStaffCode();
    const kname = (staffs.find(s => s.code === kcode) || {}).name || `Kasir ${kcode}`;
    const itemsStr = cartEntries.map(e => `${e.qty}× ${e.name}`).join(", ");
    setMembers(prev => prev.map(m => m.id === target.id ? {
      ...m,
      points: m.points + cartPts,
      xp: m.xp + cartXp,
      dailyXp: m.dailyXp + cartXp,
      monthlyXp: m.monthlyXp + cartXp,
      visits: m.visits + 1
    } : m));
    const no = "ILM-" + String(transactions.length + 1).padStart(4, "0");
    setTransactions(prev => [{
      id: uid(),
      no,
      date: `22 Nov 2026 • Kasir ${kcode}`,
      items: `Kasir ${kcode} → ${target.name}: ${itemsStr}`,
      amount: cartAmt,
      points: cartPts,
      xp: cartXp,
      kasir: kcode,
      kasirName: kname,
      memberId: target.id,
      memberName: target.name,
      detail: itemsStr,
      at: Date.now()
    }, ...prev]);
    setCart({});
    setMenuQuery("");
    bumpServed();
    pushToast(`Transaksi ${fmtIDR(cartAmt)} (${no}) • Kasir ${kcode} → ${target.name}: +${cartPts} poin, +${cartXp} XP`);
  };
  const deleteMember = id => {
    if (id === currentUserId) {
      pushToast("Tidak bisa menghapus akun yang sedang login.", "error");
      return;
    }
    setMembers(prev => prev.filter(m => m.id !== id));
    pushToast("Member dihapus.");
  };
  const saveEditing = () => {
    if (!editing) return;
    setMembers(prev => prev.map(m => m.id === editing.id ? {
      ...editing,
      points: Number(editing.points) || 0,
      xp: Number(editing.xp) || 0
    } : m));
    setEditing(null);
    pushToast("Data member diperbarui.");
  };
  const publishPromo = () => {
    if (!promoForm.title.trim() || !promoForm.desc.trim()) {
      pushToast("Judul & deskripsi promo wajib diisi.", "error");
      return;
    }
    setPromos(prev => [{
      id: uid(),
      tag: promoForm.tag || "Promo",
      title: promoForm.title,
      desc: promoForm.desc,
      valid: promoForm.valid || "Terbatas",
      theme: prev.length % PROMO_THEMES.length
    }, ...prev]);
    setPromoForm({
      tag: "Promo Baru",
      title: "",
      desc: "",
      valid: ""
    });
    pushToast("Promo diterbitkan ke Info & Promo!");
  };
  const resetMenuForm = () => {
    setMenuForm({
      name: "",
      desc: "",
      price: "",
      poin: "",
      xp: "",
      rating: "4.8",
      cat: "coffee",
      badge: "Coffee",
      badgeColor: "bg-peri",
      img: ""
    });
    setEditingMenuId(null);
  };
  const saveMenu = () => {
    const price = Number(menuForm.price) || 0;
    const poin = Math.max(0, Number(menuForm.poin) || 0);
    const xp = Math.max(0, Number(menuForm.xp) || poin * 2);
    if (menuForm.name.trim().length < 3) {
      pushToast("Nama menu minimal 3 huruf.", "error");
      return;
    }
    if (price <= 0) {
      pushToast("Harga harus lebih dari 0.", "error");
      return;
    }
    const data = {
      cat: menuForm.cat || "coffee",
      name: menuForm.name.trim(),
      desc: menuForm.desc.trim() || "-",
      price,
      poin,
      xp,
      rating: String(menuForm.rating || "4.8"),
      badge: menuForm.badge || "Coffee",
      badgeColor: menuForm.badgeColor || "bg-amber-500",
      img: menuForm.img || "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80&auto=format&fit=crop"
    };
    if (editingMenuId) {
      setMenus(prev => prev.map(m => m.id === editingMenuId ? {
        ...m,
        ...data
      } : m));
      pushToast(`Menu "${data.name}" diperbarui.`);
    } else {
      setMenus(prev => [...prev, {
        id: uid(),
        ...data
      }]);
      pushToast(`Menu "${data.name}" ditambahkan ke katalog.`);
    }
    resetMenuForm();
  };
  const startEditMenu = m => {
    setEditingMenuId(m.id);
    setMenuForm({
      name: m.name,
      desc: m.desc,
      price: String(m.price),
      poin: String(m.poin),
      xp: String(m.xp),
      rating: String(m.rating),
      cat: m.cat || "coffee",
      badge: m.badge,
      badgeColor: m.badgeColor,
      img: m.img
    });
  };
  const deleteMenu = id => {
    const m = menus.find(x => x.id === id);
    setMenus(prev => prev.filter(x => x.id !== id));
    if (editingMenuId === id) resetMenuForm();
    pushToast(`Menu "${m ? m.name : ""}" dihapus.`);
  };
  const onMenuImgFile = f => {
    if (!f) return;
    const r = new FileReader();
    r.onload = () => setMenuForm(p => ({
      ...p,
      img: r.result
    }));
    r.readAsDataURL(f);
  };
  const filteredMembers = members.filter(m => {
    const q = search.toLowerCase();
    const okQ = !q || m.name.toLowerCase().includes(q) || m.id.toLowerCase().includes(q);
    const okT = tierFilter === "Semua" || tierInfo(m.xp).tier === tierFilter;
    return okQ && okT;
  });
  const tierDist = useMemo(() => {
    const c = {
      Bronze: 0,
      Silver: 0,
      Gold: 0,
      Platinum: 0
    };
    members.forEach(m => {
      c[tierInfo(m.xp).tier]++;
    });
    return c;
  }, [members]);
  const wheelGradient = `conic-gradient(from -22.5deg, ${WHEEL_PRIZES.map((p, i) => `${p.color} ${i * 45}deg ${i * 45 + 43}deg, #FFFFFF ${i * 45 + 43}deg ${i * 45 + 45}deg`).join(", ")})`;
  const MENU_BADGES = [{
    label: "Coffee",
    color: "bg-peri"
  }, {
    label: "Non-Coffee",
    color: "bg-rose-500"
  }, {
    label: "Pastry",
    color: "bg-emerald-600"
  }];
  return <div className="min-h-screen font-jakarta text-charcoal flex flex-col overflow-x-clip">
      {}
      <header className="sticky top-3 z-40 px-3 sm:px-6">
        <div className="max-w-7xl mx-auto bg-white/80 backdrop-blur-md rounded-2xl shadow-soft border border-white px-4 sm:px-6 py-3 flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <img src="/logo-ilmora.png" alt="Ilmora" className="h-11 rounded-xl shadow" />
          </div>

          <nav className="hidden lg:flex items-center gap-1 ml-6 text-sm font-semibold text-charcoal">
            {role === "customer" ? <React.Fragment>
                {[["beranda", "Beranda"], ["game", "Game"], ["peringkat", "Peringkat"]].map(([k, label]) => <button key={k} onClick={() => goPage(k)} className={`px-5 py-2 rounded-full transition whitespace-nowrap ${page === k ? "bg-[#F5EFE3]/80 text-charcoal shadow border border-amber-200/70" : "hover:bg-mist"}`}>{label}</button>)}
                {session && session.role !== "customer" && <button onClick={() => setRole(session.role)} className="px-4 py-2 rounded-full transition whitespace-nowrap border-2 border-peri text-peri hover:bg-sky-100 font-bold">Dashboard</button>}
              </React.Fragment> : <React.Fragment>
                {[["kasir", "Transaksi"], ["datakasir", "Kasir"], ["member", "Member"], ["promo", "Promo"], ["menu", "Menu"]].filter(([k]) => role === "admin" ? true : k === "kasir").map(([k, label]) => <button key={k} onClick={() => setAdminTab(k)} className={`px-5 py-2 rounded-full transition whitespace-nowrap ${adminTab === k ? "bg-[#F5EFE3]/80 text-charcoal shadow border border-amber-200/70" : "hover:bg-mist"}`}>{label}</button>)}
              </React.Fragment>}
          </nav>

          <div className="flex-1"></div>

          {}
          {session && session.role === "customer" && <div className="hidden sm:flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-full pl-2 pr-3 py-1.5 text-sm font-bold">
              <Icon name="star" className="w-4 h-4" />
              {me.points.toLocaleString("id-ID")} pts
            </div>}

          {}
          {session ? <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 bg-mist rounded-full pl-1.5 pr-3 py-1.5">
                <div className="w-7 h-7 rounded-full bg-espresso text-white flex items-center justify-center text-xs font-extrabold">{session.name.charAt(0)}</div>
                <div className="leading-tight">
                  <p className="text-xs font-extrabold">{session.name.split(" ")[0]}</p>
                  <p className="text-[10px] text-mutedslate font-bold capitalize">{session.role === "customer" ? "Member" : session.role}</p>
                </div>
              </div>
              <button onClick={doLogout} className="inline-flex items-center gap-1.5 bg-white border-2 border-slate-200 text-charcoal text-xs sm:text-sm font-bold px-3 sm:px-4 py-2 sm:py-2.5 rounded-full hover:border-charcoal transition">
                <Icon name="log-out" className="w-4 h-4" /> <span className="hidden sm:inline">Keluar</span>
              </button>
            </div> : <button onClick={() => {
          setShowLogin(true);
          setAuthTab("login");
        }} className="inline-flex items-center gap-1.5 bg-peri hover:bg-peridark text-white text-xs sm:text-sm font-bold px-4 sm:px-5 py-2 sm:py-2.5 rounded-full shadow transition">
              <Icon name="log-in" className="w-4 h-4" /> Login/Daftar
            </button>}

          <button className="lg:hidden p-2 rounded-full hover:bg-mist" onClick={() => setMobileMenu(v => !v)} aria-label="menu">
            <Icon name={mobileMenu ? "x" : "menu"} className="w-5 h-5" />
          </button>
        </div>
        {mobileMenu && <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/45 fade-in" onClick={() => setMobileMenu(false)}></div>
            <aside className="absolute right-0 top-0 bottom-0 w-72 max-w-[85vw] bg-white shadow-2xl p-5 flex flex-col gap-3 overflow-y-auto drawer-in text-left text-sm font-semibold text-charcoal">
              <div className="flex items-center gap-2.5">
                <img src="/logo-ilmora.png" alt="Ilmora" className="h-9 rounded-xl shadow" />
                <p className="font-extrabold flex-1">ILMORA</p>
                <button onClick={() => setMobileMenu(false)} aria-label="tutup menu" className="p-2 rounded-full hover:bg-mist"><Icon name="x" className="w-5 h-5" /></button>
              </div>
            {!session ? <button onClick={() => {
            setShowLogin(true);
            setAuthTab("login");
            setMobileMenu(false);
          }} className="w-full mb-2 inline-flex items-center justify-center gap-1.5 bg-espresso text-white font-bold py-2.5 rounded-full">
                <Icon name="log-in" className="w-4 h-4" /> Login/Daftar
              </button> : <div className="flex items-center gap-2 bg-mist rounded-2xl px-3 py-2">
                <div className="w-8 h-8 rounded-full bg-espresso text-white flex items-center justify-center text-sm font-extrabold shrink-0">{session.name.charAt(0)}</div>
                <p className="font-bold text-charcoal text-sm flex-1 min-w-0 truncate">{session.name} <span className="text-[10px] text-mutedslate capitalize">• {session.role === "customer" ? "Member" : session.role}</span></p>
                <button onClick={() => {
              doLogout();
              setMobileMenu(false);
            }} className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-full shrink-0">Keluar</button>
              </div>}
            {session && session.role === "customer" && <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl px-3 py-2 text-sm font-bold">
                <Icon name="star" className="w-4 h-4" />
                {me.points.toLocaleString("id-ID")} pts
              </div>}
            <p className="text-[11px] font-extrabold text-mutedslate uppercase tracking-wider mt-1">Menu</p>
            {role === "customer" ? <div className="flex flex-col gap-1">
                {[["beranda", "Beranda"], ["game", "Game"], ["peringkat", "Peringkat"]].map(([k, label]) => <button key={k} onClick={() => goPage(k)} className={`px-4 py-2.5 rounded-xl text-left font-semibold ${page === k ? "bg-[#F5EFE3]/80 text-charcoal border border-amber-200/70" : "hover:bg-mist"}`}>{label}</button>)}
                {session && session.role !== "customer" && <button onClick={() => {
              setRole(session.role);
              setMobileMenu(false);
            }} className="px-4 py-2.5 rounded-xl text-left font-bold border-2 border-peri text-peri">Dashboard</button>}
              </div> : <div className="flex flex-col gap-1">
                {[["kasir", "Transaksi"], ["datakasir", "Kasir"], ["member", "Member"], ["promo", "Promo"], ["menu", "Menu"]].filter(([k]) => role === "admin" ? true : k === "kasir").map(([k, label]) => <button key={k} onClick={() => {
              setAdminTab(k);
              setMobileMenu(false);
            }} className={`px-4 py-2.5 rounded-xl text-left font-semibold ${adminTab === k ? "bg-[#F5EFE3]/80 text-charcoal border border-amber-200/70" : "hover:bg-mist"}`}>{label}</button>)}
              </div>}
            </aside>
          </div>}
      </header>

      {role === "customer" ? <main className="max-w-7xl mx-auto px-3 sm:px-6 pb-16 flex-1 w-full">
          {page === "beranda" && <React.Fragment>
          {session && session.role !== "customer" && <div className="mt-5 bg-amber-50 border-2 border-amber-300 rounded-2xl px-4 py-3 flex flex-wrap items-center gap-2 text-sm">
            <Icon name="eye" className="w-4 h-4 text-amber-700 shrink-0" />
            <p className="flex-1 font-semibold text-amber-900 min-w-[200px]">Mode Pratinjau Member — Anda login sebagai {session.role === "admin" ? "Admin" : "Kasir"}.</p>
            <button onClick={() => setRole(session.role)} className="font-bold text-peri underline">Kembali ke Dashboard</button>
          </div>}
        {}
          <section className="relative w-screen -mt-20 sm:-mt-24 pt-24 sm:pt-28 overflow-hidden hero-dots transition-all duration-700" onMouseEnter={() => setHeroPaused(true)} onMouseLeave={() => setHeroPaused(false)} style={{
          background: HERO_DRINKS[heroIdx % HERO_DRINKS.length].bg,
          marginLeft: "calc(-50vw + 50%)"
        }}>
            {(() => {
            const hero = HERO_DRINKS[heroIdx % HERO_DRINKS.length];
            return <React.Fragment>
                <div className="relative min-h-[560px] sm:min-h-[680px] flex items-center justify-center">
                  {}
                  <div key={"w" + heroIdx} className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center font-extrabold text-white/70 text-6xl sm:text-9xl tracking-tight whitespace-nowrap select-none drop-shadow" style={{
                  animation: "hero-word .6s ease both"
                }}>{hero.word}</div>
                  {}
                  {(() => {
                  const HH = {
                    bean: 1.35,
                    egg: 1.35,
                    leaf: 1.3,
                    milk: 1,
                    flour: 1,
                    butter: 1,
                    sugar: 1,
                    chip: 1
                  };
                  return (hero.bits || []).map((b, i) => <span key={i} className={b.k === "bean" ? "coffee-bean" : "floatie f-" + b.k} style={{
                    left: b.l,
                    top: b.t,
                    width: b.s,
                    height: Math.round(b.s * (HH[b.k] || 1)),
                    ["--bd"]: b.d,
                    ["--br"]: b.r
                  }}></span>);
                })()}
                  {}
                  <button onClick={() => setHeroIdx((heroIdx + HERO_DRINKS.length - 1) % HERO_DRINKS.length)} aria-label="minuman sebelumnya" className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/25 hover:bg-white/50 text-white font-extrabold backdrop-blur transition">‹</button>
                  <button onClick={() => setHeroIdx((heroIdx + 1) % HERO_DRINKS.length)} aria-label="minuman berikutnya" className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/25 hover:bg-white/50 text-white font-extrabold backdrop-blur transition">›</button>
                  {}
                  <img key={"c" + heroIdx} src={hero.img} alt={hero.word} className="relative z-10 h-96 sm:h-[32rem] object-contain" style={{
                  animation: "hero-swap .5s ease both, floaty 5s ease-in-out .5s infinite",
                  mixBlendMode: "multiply",
                  WebkitMaskImage: "radial-gradient(ellipse 100% 100% at 50% 50%, black 72%, transparent 98%)",
                  maskImage: "radial-gradient(ellipse 100% 100% at 50% 50%, black 72%, transparent 98%)"
                }} loading="lazy" />
                  {}
                  <div className="absolute bottom-8 inset-x-0 z-20 flex justify-center gap-1.5">
                    {HERO_DRINKS.map((_, i) => <button key={i} onClick={() => setHeroIdx(i)} aria-label={"ke minuman " + (i + 1)} className={`h-2 rounded-full transition-all ${i === heroIdx % HERO_DRINKS.length ? "w-6 bg-white" : "w-2 bg-white/40 hover:bg-white/70"}`} />)}
                  </div>
                </div>
                {}
                <div className="absolute bottom-0 inset-x-0 h-28 pointer-events-none" style={{
                background: "linear-gradient(180deg, rgba(248,250,252,0) 0%, #F8FAFC 100%)"
              }}></div>
              </React.Fragment>;
          })()}
          </section>

          {}
          <section id="promos" className="mt-10 scroll-mt-28">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2"><Icon name="megaphone" className="w-6 h-6 text-espresso" /> Info & Promo Terbaru</h2>
            </div>
            <div ref={promoRef} onMouseEnter={() => setPromoPaused(true)} onMouseLeave={() => setPromoPaused(false)} onTouchStart={() => setPromoPaused(true)} onTouchEnd={() => setPromoPaused(false)} className="mt-4 flex gap-4 overflow-x-auto no-scrollbar pb-2">
              {[...promos, ...promos].map((p, i) => {
              const t = PROMO_THEMES[(p.theme ?? 0) % PROMO_THEMES.length];
              return <div key={p.id + "-" + i} className="snap-start shrink-0 w-[300px] sm:w-[360px] rounded-3xl p-5 shadow-soft relative overflow-hidden border-2" style={{
                background: t.tint,
                borderColor: t.edge
              }}>
                  <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full" style={{
                  background: t.badge,
                  color: t.badgeText
                }}>{p.tag}</span>
                  <h3 className="mt-2 font-extrabold text-lg leading-snug text-charcoal">{p.title}</h3>
                  <p className="text-sm text-slate-600 mt-1 leading-relaxed">{p.desc}</p>
                  <p className="mt-3 text-[11px] font-bold text-slate-600 bg-black/5 inline-block px-2.5 py-1 rounded-full">{p.valid}</p>
                </div>;
            })}
              {promos.length === 0 && <p className="text-sm text-mutedslate bg-white rounded-2xl p-5 border">Belum ada promo. Admin dapat mempublish dari dashboard.</p>}
            </div>
          </section>

                    {}
          <section id="menu" className="mt-10 scroll-mt-28">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2"><Icon name="coffee" className="w-6 h-6 text-espresso" /> Menu</h2>
            </div>
            {(() => {
            const PER_PAGE = 6;
            const pageCount = Math.max(1, Math.ceil(menus.length / PER_PAGE));
            const pg = Math.min(menuPage, pageCount - 1);
            const shown = menus.slice(pg * PER_PAGE, pg * PER_PAGE + PER_PAGE);
            return <React.Fragment>
            <div className="mt-5 grid grid-cols-2 lg:grid-cols-3 gap-4" onTouchStart={e => {
                e.currentTarget.dataset.sx = e.changedTouches[0].clientX;
              }} onTouchEnd={e => {
                const sx = Number(e.currentTarget.dataset.sx || 0);
                const dx = e.changedTouches[0].clientX - sx;
                if (dx < -40) setMenuPage((pg + 1) % pageCount);else if (dx > 40) setMenuPage((pg + pageCount - 1) % pageCount);
              }}>
              {shown.map(item => <article key={item.id} className="bg-white rounded-3xl shadow-card border overflow-hidden hover:shadow-soft transition group">
                  <div className="relative">
                    <img src={item.img} alt={item.name} className="w-full h-44 object-cover scale-[.96] group-hover:scale-125 transition-transform duration-700 ease-out" loading="lazy" />
                    <span className={`absolute top-3 left-3 text-white text-xs font-extrabold px-3 py-1.5 rounded-full shadow ${item.badgeColor}`}>{item.badge}</span>
                    <span className="absolute top-3 right-3 bg-white/85 backdrop-blur text-xs font-bold px-2.5 py-1.5 rounded-full flex items-center gap-1"><Icon name="star" className="w-3.5 h-3.5 text-amber-500" />{item.rating}</span>
                  </div>
                  <div className="p-5">
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <span className="text-[11px] font-extrabold text-espresso bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">+{item.poin} poin</span>
                      <span className="text-[11px] font-extrabold text-peri bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-full">+{item.xp} XP</span>
                    </div>
                    <h3 className="font-extrabold text-lg leading-snug mt-2 text-left">{item.name}</h3>
                    <p className="text-sm text-mutedslate mt-0.5 leading-relaxed text-left">{item.desc}</p>
                    <div className="mt-4 text-right">
                      <span className="font-extrabold text-lg">{fmtIDR(item.price)}</span>
                    </div>
                  </div>
                </article>)}
            </div>
            {pageCount > 1 && <div className="mt-4 flex items-center justify-center gap-3">
              <button onClick={() => setMenuPage((pg + pageCount - 1) % pageCount)} aria-label="menu sebelumnya" className="w-10 h-10 rounded-full bg-white border-2 border-slate-200 hover:border-espresso font-extrabold text-charcoal transition">‹</button>
              <div className="flex gap-1.5">
                {Array.from({
                    length: pageCount
                  }).map((_, i) => <button key={i} onClick={() => setMenuPage(i)} aria-label={"ke halaman menu " + (i + 1)} className={`h-2 rounded-full transition-all ${i === pg ? "w-6 bg-espresso" : "w-2 bg-slate-300 hover:bg-slate-400"}`} />)}
              </div>
              <button onClick={() => setMenuPage((pg + 1) % pageCount)} aria-label="menu berikutnya" className="w-10 h-10 rounded-full bg-espresso text-white font-extrabold hover:bg-espressodark transition">›</button>
            </div>}
              </React.Fragment>;
          })()}
          </section>
          {session && session.role === "customer" && <React.Fragment>
          {}
          <section id="history" className="mt-10 scroll-mt-28">
            <div className="bg-white rounded-3xl shadow-card border p-6 overflow-hidden">
              <h2 className="font-extrabold text-xl flex items-center gap-2"><Icon name="history" className="w-5 h-5 text-espresso" /> Riwayat Transaksi</h2>
              <div className="mt-4 overflow-x-auto -mx-6 px-6">
                <table className="w-full text-sm min-w-[640px]">
                  <thead>
                    <tr className="text-left text-[11px] uppercase tracking-wider text-mutedslate border-b">
                      <th className="py-2 pr-3">Tanggal</th><th className="py-2 pr-3">Item</th><th className="py-2 pr-3 text-right">Nominal</th><th className="py-2 pr-3">Poin</th><th className="py-2">XP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map(t => <tr key={t.id} className="border-b last:border-0 hover:bg-mist/50">
                        <td className="py-3 pr-3 text-mutedslate whitespace-nowrap tabular-nums">{t.date}</td>
                        <td className="py-3 pr-3 font-semibold">{t.items}{t.no ? <span className="block text-[11px] font-mono font-normal text-mutedslate">{t.no}</span> : null}</td>
                        <td className="py-3 pr-3 text-right font-extrabold tabular-nums">{fmtIDR(t.amount)}</td>
                        <td className="py-3 pr-3 tabular-nums"><span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full text-xs">+{t.points}</span></td>
                        <td className="py-3 tabular-nums"><span className="bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-full text-xs">+{t.xp}</span></td>
                      </tr>)}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
          </React.Fragment>}
          </React.Fragment>}

          {page === "game" && <React.Fragment>
          {}
          <section className="mt-5">
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">LUCKY SPIN</h2>
              <p className="text-mutedslate text-sm mt-1">{session && session.role === "customer" ? <React.Fragment>Tukar <b className="text-charcoal">50 poin</b> untuk 1× putaran. Saldo: <b className="text-espresso">{me.points.toLocaleString("id-ID")} pts</b></React.Fragment> : "Login sebagai member untuk memutar roda dengan poinmu."}</p>
            </div>
            <div className="mt-6 max-w-2xl mx-auto space-y-4">
              <div className="bg-white rounded-3xl shadow-card border p-6 sm:p-8 text-center relative overflow-hidden">
                <div className="relative w-72 h-72 sm:w-96 sm:h-96 mx-auto mt-2">
                  {}
                  <div className="absolute top-1/2 -right-2.5 -translate-y-1/2 z-10 w-0 h-0 border-t-[12px] border-b-[12px] border-r-[22px] border-t-transparent border-b-transparent border-r-charcoal drop-shadow"></div>
                  <div className="w-full h-full rounded-full bg-white shadow-soft wheel-transition relative p-1.5" style={{
                  transform: `rotate(${rotation}deg)`
                }}>
                    <div className="w-full h-full rounded-full overflow-hidden relative" style={{
                    background: wheelGradient
                  }}>
                      <div className="absolute inset-0 flex items-center justify-center" style={{
                      transform: `rotate(${-rotation}deg)`
                    }}>
                        <button onClick={spinWheel} disabled={spinning || session && session.role === "customer" && me.points < 50} title="Putar roda" className={`w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-full shadow-soft flex flex-col items-center justify-center border-4 border-mist transition ${spinning || session && session.role === "customer" && me.points < 50 ? "cursor-not-allowed opacity-80" : "hover:scale-105 active:scale-95 cursor-pointer"}`}>
                          <span className={`font-extrabold tracking-widest ${spinning ? "text-mutedslate text-xl" : "text-espresso text-base sm:text-lg"}`}>{spinning ? "…" : "SPIN"}</span>
                          {!spinning && <span className="text-[9px] font-bold text-mutedslate">{session && session.role === "customer" ? "50 poin" : "login dulu"}</span>}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                {session && session.role === "customer" && <p className="mt-3 text-xs font-bold text-mutedslate">Saldo Poin Saat Ini: <span className="text-espresso tabular-nums">{me.points.toLocaleString("id-ID")} pts</span>{me.points < 50 ? " • Poin tidak cukup (butuh 50 poin)" : ""}</p>}
                <div className="mt-4 grid grid-cols-2 gap-1.5 text-left">
                  {WHEEL_PRIZES.map(p => <div key={p.label} className="flex items-center gap-2 bg-mist rounded-xl px-2.5 py-1.5">
                      <span className="w-2.5 h-2.5 rounded-full inline-block shrink-0" style={{
                    background: p.color
                  }}></span>
                      <div className="leading-tight">
                        <p className="text-[11px] font-extrabold">{p.label}</p>
                        <p className="text-[10px] text-mutedslate">{p.sub}</p>
                      </div>
                    </div>)}
                </div>
              </div>
              {session && session.role === "customer" && <div className="bg-white rounded-3xl shadow-card border p-6">
                  <h3 className="font-extrabold text-lg flex items-center gap-2"><Icon name="history" className="w-5 h-5 text-espresso" /> Riwayat Putaran</h3>
                  <div className="mt-3 overflow-auto rounded-2xl border border-slate-200 max-h-[300px]">
                    <table className="w-full text-sm text-left">
                      <thead className="sticky top-0">
                        <tr className="bg-mist text-left text-[11px] uppercase tracking-wide text-mutedslate">
                          <th className="px-4 py-2.5">Hadiah</th><th className="px-4 py-2.5">Kode</th><th className="px-4 py-2.5">Waktu</th>
                        </tr>
                      </thead>
                      <tbody>
                        {spinHistory.map(s => <tr key={s.id} className="border-t border-slate-200 first:border-0">
                            <td className="px-4 py-3 font-bold">{s.label}</td>
                            <td className="px-4 py-3 font-mono text-xs text-mutedslate">{s.code}</td>
                            <td className="px-4 py-3 text-mutedslate text-xs font-semibold whitespace-nowrap">{s.time}</td>
                          </tr>)}
                      </tbody>
                    </table>
                  </div>
                </div>}
                {session && session.role === "customer" && <div className="bg-white rounded-3xl shadow-card border p-6">
                  <h3 className="font-extrabold text-lg flex items-center gap-2"><Icon name="ticket" className="w-5 h-5 text-peri" /> Voucher Saya ({vouchers.length})</h3>
                  <p className="text-xs text-mutedslate mt-1">Ketuk voucher untuk menampilkan kode & QR.</p>
                  <div className="mt-3 space-y-2 max-h-56 overflow-auto pr-1">
                    {vouchers.map(v => {
                  const exp = isExpired(v);
                  const status = v.used ? {
                    label: "Terpakai",
                    cls: "text-slate-600 bg-slate-200"
                  } : exp ? {
                    label: "Kadaluarsa",
                    cls: "text-red-700 bg-red-100"
                  } : {
                    label: "Aktif",
                    cls: "text-emerald-700 bg-emerald-100"
                  };
                  return <button key={v.id} onClick={() => {
                    setVoucherQR(v);
                    setVoucherQRFrom("member");
                  }} title="Ketuk untuk kode & QR" className={`w-full text-left flex items-center gap-3 border border-dashed rounded-2xl p-3 transition cursor-pointer ${v.used || exp ? "border-slate-300 bg-slate-50 opacity-70" : "border-espresso/40 bg-amber-50/60 hover:border-espresso hover:shadow-card"}`}>
                        <div className={`w-10 h-10 rounded-xl text-white flex items-center justify-center shrink-0 ${v.used || exp ? "bg-slate-400" : "bg-espresso"}`}><Icon name="ticket" className="w-5 h-5" /></div>
                        <div className="flex-1 min-w-0 text-left">
                          <p className="font-extrabold text-sm">{v.label}</p>
                          <p className="text-xs text-mutedslate font-mono">{v.code} • {v.date}</p>
                          <p className="text-[11px] text-mutedslate">Berlaku s/d {fmtDate(v.expiresAt)} • hangus jika tak dipakai</p>
                        </div>
                        <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full shrink-0 ${status.cls}`}>{status.label}</span>
                      </button>;
                })}
                    {vouchers.length === 0 && <p className="text-sm text-mutedslate">Belum ada voucher. Putar rodanya!</p>}
                  </div>
                </div>}
            </div>
          </section>

          </React.Fragment>}

          {page === "peringkat" && <React.Fragment>
          {}
          <section className="mt-5">
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Papan Peringkat</h2>
            </div>
            {}
            <div className="mt-6 grid grid-cols-3 gap-3 sm:gap-4 items-end max-w-2xl mx-auto">
              {[2, 1, 3].map(pos => {
              const m = boardByPoints[pos - 1];
              if (!m) return null;
              const first = pos === 1;
              const second = pos === 2;
              return <div key={m.id} style={first ? {
                background: "linear-gradient(180deg, rgba(243,234,214,0.6) 0%, rgba(227,241,249,0.6) 55%, rgba(255,255,255,0.9) 100%)"
              } : second ? {
                background: "linear-gradient(180deg,#E3F1F9 0%,#FFFFFF 55%)"
              } : {
                background: "linear-gradient(180deg,#F5EFE3 0%,#FFFFFF 60%)"
              }} className={`rounded-3xl border text-center flex flex-col ${first ? "shadow-soft px-5 sm:px-6 pt-5 sm:pt-6 pb-0 border-slate-200 min-h-[240px] sm:min-h-[260px]" : "shadow-card px-4 pt-4 pb-0 border-slate-200" + (second ? " min-h-[200px] sm:min-h-[215px]" : " min-h-[165px] sm:min-h-[180px]")}`}>
                    {first ? <Icon name="crown" className="w-6 h-6 text-amber-500 mx-auto" /> : <Icon name="medal" className={`w-5 h-5 mx-auto ${second ? "text-peri" : "text-amber-700"}`} />}
                    <p className={`font-extrabold tabular-nums ${first ? "text-4xl mt-1 text-espresso" : "text-2xl text-mutedslate"}`}>{pos}</p>
                    <div className={`mx-auto mt-2 rounded-full flex items-center justify-center font-extrabold ${first ? "w-14 h-14 text-xl bg-gradient-to-br from-amber-300 to-amber-500 text-charcoal" : "w-11 h-11 bg-mist text-charcoal"}`}>{m.name.charAt(0)}</div>
                    <p className="mt-2 font-bold text-sm truncate">{maskName(m.name)}</p>
                    <p className={`font-extrabold tabular-nums text-espresso ${first ? "text-lg" : ""}`}>{m.points.toLocaleString("id-ID")}</p>
                    <p className="text-[11px] font-semibold text-mutedslate">poin</p>
                    <div className="flex-1 min-h-3"></div>
                    <div className={`py-2 rounded-b-3xl text-[11px] font-extrabold tracking-widest ${first ? "-mx-5 sm:-mx-6 text-espresso" : "-mx-4 " + (second ? "text-peri" : "text-amber-800")}`} style={first ? {
                  background: "linear-gradient(90deg, rgba(43,146,196,0.35), rgba(111,78,55,0.35))"
                } : second ? {
                  background: "rgba(43,146,196,0.12)"
                } : {
                  background: "rgba(111,78,55,0.12)"
                }}>JUARA {pos}</div>
                  </div>;
            })}
            </div>
            {}
            <div className="mt-6 max-w-2xl mx-auto bg-white rounded-3xl shadow-card border p-3 sm:p-4 flex flex-wrap items-center justify-start gap-2">
              {[["top", "Top 10"], ["harian", "Harian"], ["mingguan", "Mingguan"]].map(([k, label]) => <button key={k} onClick={() => setLeaderTab(k)} className={`px-6 py-2 rounded-full text-sm font-bold transition ${leaderTab === k ? "bg-peri text-white shadow" : "bg-mist text-mutedslate hover:bg-indigo-100"}`}>{label}</button>)}
            </div>
            {}
            <div className="mt-4 max-w-2xl mx-auto bg-white rounded-3xl shadow-card border p-3 sm:p-4 space-y-2">
              {rankBoard.map((m, i) => {
              const isSelf = m.id === currentUserId && session && session.role === "customer";
              return <div key={m.id} className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${isSelf ? "bg-sky-100 border-sky-300" : "bg-white border-slate-200"}`}>
                  <span className="w-8 text-center text-sm font-extrabold text-mutedslate tabular-nums shrink-0">{i + 1}</span>
                  <p className="flex-1 min-w-0 font-bold text-sm text-left truncate">{isSelf ? m.name : maskName(m.name)} {isSelf && <span className="text-[10px] bg-peri text-white px-2 py-0.5 rounded-full ml-1">KAMU</span>}</p>
                  <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full border shrink-0 ${TIER_STYLE[tierInfo(m.xp).tier]}`}>{tierInfo(m.xp).tier}</span>
                  <span className="w-24 text-right shrink-0"><span className="text-sm font-extrabold tabular-nums">{rankScore(m).toLocaleString("id-ID")}</span> <span className="text-[11px] font-bold text-mutedslate">{rankUnit}</span></span>
                </div>;
            })}
            </div>
            {session && session.role === "customer" && (() => {
            if (rankBoard.some(m => m.id === currentUserId)) return null;
            const full = leaderTab === "harian" ? [...members].sort((a, b) => b.dailyXp - a.dailyXp) : leaderTab === "mingguan" ? [...members].sort((a, b) => b.monthlyXp - a.monthlyXp) : boardByPoints;
            const myRank = full.findIndex(m => m.id === currentUserId) + 1;
            if (myRank <= 0) return null;
            const mm = full[myRank - 1];
            return <div className="sticky bottom-3 mt-3 max-w-2xl mx-auto bg-sky-100 border-2 border-sky-300 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-soft">
                  <span className="font-extrabold tabular-nums text-peri">#{myRank}</span>
                  <p className="flex-1 font-bold text-sm text-left truncate">Posisimu: {mm.name}</p>
                  <span className="font-extrabold tabular-nums text-sm">{rankScore(mm).toLocaleString("id-ID")} {rankUnit}</span>
                </div>;
          })()}
          </section>

          </React.Fragment>}

        </main> : (<main className="max-w-7xl mx-auto px-3 sm:px-6 pb-16 flex-1 w-full">
          {adminTab === "kasir" && <div className="mt-4">
              <div className="bg-white/80 backdrop-blur rounded-2xl border shadow-sm p-1.5 flex gap-1 w-fit text-sm font-bold">
                <button onClick={() => setKasirView("transaksi")} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition ${kasirView === "transaksi" ? "bg-peri text-white shadow" : "text-mutedslate hover:bg-mist"}`}>
                  <Icon name="shopping-bag" className="w-4 h-4" /> Transaksi
                </button>
                <button onClick={() => setKasirView("voucher")} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition ${kasirView === "voucher" ? "bg-peri text-white shadow" : "text-mutedslate hover:bg-mist"}`}>
                  <Icon name="ticket" className="w-4 h-4" /> Voucher ({vouchers.filter(v => !v.used && !isExpired(v)).length})
                </button>
              </div>
              {kasirView === "transaksi" ? <div className="mt-4 grid lg:grid-cols-2 gap-4">
              <div className="bg-white rounded-3xl border shadow-card p-6 flex flex-col min-w-0">
                <label className="block mt-1 text-xs font-extrabold text-mutedslate uppercase tracking-wide">Member</label>
                <div className="relative mt-1.5">
                  <input value={cashierQuery} onChange={e => {
                setCashierQuery(e.target.value);
                setCashierFocus(true);
              }} onFocus={() => setCashierFocus(true)} onBlur={() => setTimeout(() => setCashierFocus(false), 150)} placeholder="Ketik nama atau ID member…" className="w-full border-2 border-slate-200 rounded-2xl px-4 py-3 font-semibold" />
                  {cashierFocus && cashierMatches.length > 0 && <div className="absolute z-20 left-0 right-0 mt-1.5 bg-white border-2 border-slate-200 rounded-2xl shadow-soft overflow-hidden max-h-56 overflow-y-auto">
                      {cashierMatches.map(m => <button key={m.id} onMouseDown={e => e.preventDefault()} onClick={() => {
                  setCashierMember(m.id);
                  setCashierQuery(`${m.id} — ${m.name}`);
                  setCashierFocus(false);
                }} className="w-full text-left px-4 py-2.5 hover:bg-mist flex items-center gap-2 transition">
                          <span className="font-bold text-sm flex-1 truncate">{m.name} <span className="font-mono text-xs text-mutedslate">{m.id}</span></span>
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${TIER_STYLE[tierInfo(m.xp).tier]}`}>{tierInfo(m.xp).tier}</span>
                        </button>)}
                    </div>}
                </div>
                <label className="block mt-4 text-xs font-extrabold text-mutedslate uppercase tracking-wide">Pilih Menu ({cartEntries.reduce((s, e) => s + e.qty, 0)} item)</label>
                <div className="relative mt-1.5">
                  <input value={menuQuery} onChange={e => {
                setMenuQuery(e.target.value);
                setMenuFocus(true);
              }} onFocus={() => setMenuFocus(true)} onBlur={() => setTimeout(() => setMenuFocus(false), 150)} placeholder="Ketik nama menu…" className="w-full border-2 border-slate-200 rounded-2xl px-4 py-3 font-semibold" />
                  {menuFocus && menuMatches.length > 0 && <div className="absolute z-20 left-0 right-0 mt-1.5 bg-white border-2 border-slate-200 rounded-2xl shadow-soft overflow-hidden max-h-64 overflow-y-auto">
                      {menuMatches.map(m => <button key={m.id} onMouseDown={e => e.preventDefault()} onClick={() => {
                  incCart(m.id);
                  setMenuQuery("");
                  setMenuFocus(false);
                }} className="w-full text-left px-4 py-2.5 hover:bg-mist flex items-center gap-2 transition">
                          <span className="flex-1 min-w-0">
                            <span className="block font-bold text-sm truncate">{m.name}</span>
                            <span className="block text-[11px] text-mutedslate tabular-nums">{fmtIDR(m.price)} • <b className="text-espresso">+{m.poin} pts</b> • <b className="text-peri">+{m.xp} XP</b></span>
                          </span>
                          <span className="text-peri font-extrabold text-lg leading-none shrink-0">+</span>
                        </button>)}
                    </div>}
                </div>
                <div className="mt-1.5 max-h-64 overflow-auto pr-1 flex-1 min-w-0">
                  {cartEntries.length === 0 && <p className="text-sm text-mutedslate bg-mist rounded-2xl p-4 text-center">Belum ada menu dipilih. Ketik nama menu di atas untuk menambah.</p>}
                  {cartEntries.length > 0 && <div className="overflow-x-auto rounded-2xl border-2 border-slate-200">
                    <table className="w-full text-sm min-w-[460px]">
                      <thead>
                        <tr className="bg-mist text-left text-[11px] uppercase tracking-wide text-mutedslate">
                          <th className="px-3 py-2">Menu</th>
                          <th className="px-2 py-2 text-right">Harga</th>
                          <th className="px-2 py-2 text-right">Poin</th>
                          <th className="px-2 py-2 text-right">XP</th>
                          <th className="px-2 py-2 text-center">Jml</th>
                          <th className="px-2 py-2 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cartEntries.map(e => <tr key={e.id} className="border-t border-slate-200 first:border-0">
                          <td className="px-3 py-2 font-bold">{e.name}</td>
                          <td className="px-2 py-2 text-right tabular-nums">{fmtIDR(e.price)}</td>
                          <td className="px-2 py-2 text-right tabular-nums font-bold text-espresso">+{e.poin * e.qty}</td>
                          <td className="px-2 py-2 text-right tabular-nums font-bold text-peri">+{e.xp * e.qty}</td>
                          <td className="px-2 py-2">
                            <div className="flex items-center justify-center gap-1">
                              <button onClick={() => decCart(e.id)} className="w-7 h-7 rounded-full border-2 border-slate-200 font-extrabold hover:border-espresso transition leading-none">−</button>
                              <span className="w-6 text-center font-extrabold tabular-nums">{e.qty}</span>
                              <button onClick={() => incCart(e.id)} className="w-7 h-7 rounded-full bg-espresso text-white font-extrabold hover:bg-espressodark transition leading-none">+</button>
                            </div>
                          </td>
                          <td className="px-2 py-2 text-right">
                            <button onClick={() => removeCart(e.id)} title="Hapus" className="p-1.5 rounded-full text-red-500 hover:bg-red-50 font-extrabold transition"><Icon name="trash-2" className="w-4 h-4" /></button>
                          </td>
                        </tr>)}
                      </tbody>
                    </table>
                  </div>}
                </div>
                {}
                <div className="mt-4 bg-mist rounded-2xl p-4 flex items-center gap-3 text-left overflow-hidden">
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-extrabold text-mutedslate text-left">Total Belanja</p>
                    <p className="font-extrabold text-lg tabular-nums text-left">{fmtIDR(cartAmt)}</p>
                    <p className="text-xs text-mutedslate truncate text-left">{cartEntries.length ? cartEntries.map(e => `${e.qty}× ${e.name}`).join(", ") : "Belum ada menu dipilih"}</p>
                  </div>
                  <div className="shrink-0 min-w-0 max-w-[45%] text-right">
                    <p className="font-extrabold text-amber-700 tabular-nums text-sm sm:text-base break-words leading-snug">+{cartPts} Points</p>
                    <p className="font-extrabold text-peri tabular-nums text-sm sm:text-base break-words leading-snug">+{cartXp} XP</p>
                  </div>
                </div>
                <button onClick={submitCashier} disabled={cartEntries.length === 0} className={`mt-4 w-full font-bold py-3.5 rounded-full transition flex items-center justify-center gap-2 ${cartEntries.length === 0 ? "bg-slate-200 text-slate-400 cursor-not-allowed" : "bg-espresso hover:bg-espressodark text-white"}`}>
                  <Icon name="check" className="w-4 h-4" /> Proses Transaksi
                </button>
              </div>
              <div className="bg-white rounded-3xl border shadow-card p-6 min-w-0">
                <h3 className="font-extrabold text-lg">Struk Terakhir</h3>
                <div className="mt-3 space-y-2 max-h-[420px] overflow-auto pr-1">
                  {transactions.slice(0, 8).map(t => <button key={t.id} onClick={() => setSelectedTx(t)} title="Lihat detail struk" className="w-full text-left flex items-center gap-3 border rounded-2xl p-3 transition cursor-pointer hover:border-peri hover:shadow-card">
                      <div className="w-10 h-10 rounded-xl bg-mist flex items-center justify-center shrink-0"><Icon name="shopping-bag" className="w-5 h-5 text-espresso" /></div>
                      <div className="flex-1 min-w-0 text-left">
                        <p className="font-bold text-sm truncate">{t.items}</p>
                        <p className="text-xs text-mutedslate">{t.no ? t.no + " • " : ""}{t.date}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-extrabold text-sm tabular-nums">{fmtIDR(t.amount)}</p>
                        <p className="text-[11px] font-bold text-peri tabular-nums">+{t.points} pts • +{t.xp} XP</p>
                      </div>
                    </button>)}
                </div>
                {transactions.length > 8 && <button onClick={() => setShowAllTx(true)} className="mt-3 w-full font-bold py-2.5 rounded-full border-2 border-slate-200 hover:border-peri hover:text-peri transition text-sm">
                    Lihat selengkapnya ({transactions.length} transaksi)
                  </button>}
              </div>
              </div> : <div className="mt-4 grid gap-4">
              <div className="bg-white rounded-3xl border shadow-card p-6">
                <h2 className="font-extrabold text-xl flex items-center gap-2"><Icon name="ticket" className="w-5 h-5 text-peri" /> Klaim Voucher</h2>
                <p className="text-sm text-mutedslate mt-1">Satu kode hanya bisa dipakai 1×. Voucher kedaluwarsa otomatis ditolak.</p>
                <div className="mt-4 flex gap-2">
                  <input value={claimCode} onChange={e => setClaimCode(e.target.value.toUpperCase())} onKeyDown={e => {
                if (e.key === "Enter") claimVoucher();
              }} placeholder="cth: ILMR-XXXX" className="flex-1 min-w-0 border-2 border-slate-200 rounded-2xl px-4 py-3 font-mono font-bold uppercase" />
                  <button onClick={() => {
                setShowScan(true);
                setScanMemberId(null);
                setScanMode("file");
                setCamError("");
              }} title="Scan QR member" className="shrink-0 w-[52px] rounded-2xl border-2 border-slate-200 hover:border-peri text-peri flex items-center justify-center transition">
                    <Icon name="scan-line" className="w-5 h-5" />
                  </button>
                  <button onClick={claimVoucher} disabled={!claimCode.trim()} className="bg-peri hover:bg-peridark disabled:opacity-40 text-white font-bold px-6 rounded-2xl transition shrink-0">Klaim</button>
                </div>
                {claimCode.trim() !== "" && (() => {
              const found = vouchers.find(x => x.code.toUpperCase() === claimCode.trim().toUpperCase());
              if (!found) return <p className="mt-2.5 rounded-2xl border-2 border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">Kode tidak dikenal. Periksa lagi ya.</p>;
              const bad = found.used || isExpired(found);
              return <div className={`mt-2.5 rounded-2xl border-2 p-3 text-sm ${bad ? "border-amber-200 bg-amber-50" : "border-emerald-200 bg-emerald-50"}`}>
                      <p className="font-extrabold">{found.label} <span className="font-mono text-mutedslate">• {found.code}</span></p>
                      <p className="text-xs text-mutedslate mt-0.5">Berlaku s/d {fmtDate(found.expiresAt)}{found.used ? " • SUDAH TERPAKAI" : isExpired(found) ? " • KEDALUWARSA" : " • siap diklaim"}</p>
                    </div>;
            })()}
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3">
                    <p className="text-xl font-extrabold text-emerald-700">{vouchers.filter(v => !v.used && !isExpired(v)).length}</p>
                    <p className="text-[11px] font-bold text-mutedslate">Aktif</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3">
                    <p className="text-xl font-extrabold text-slate-600">{vouchers.filter(v => v.used).length}</p>
                    <p className="text-[11px] font-bold text-mutedslate">Terpakai</p>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-3">
                    <p className="text-xl font-extrabold text-red-600">{vouchers.filter(v => isExpired(v)).length}</p>
                    <p className="text-[11px] font-bold text-mutedslate">Hangus</p>
                  </div>
                </div>
                <p className="mt-3 text-[11px] text-mutedslate leading-relaxed">Masa berlaku voucher diatur admin (saat ini {voucherDays} hari). Voucher hangus tidak bisa diklaim.</p>
              </div>
              <div className="bg-white rounded-3xl border shadow-card p-6">
                <h3 className="font-extrabold text-lg">Riwayat Voucher ({vouchers.length})</h3>
                <div className="mt-3 space-y-2 max-h-[380px] overflow-auto pr-1">
                  {vouchers.map(v => {
                const exp = isExpired(v);
                const st = v.used ? {
                  t: "Terpakai",
                  c: "bg-slate-200 text-slate-600"
                } : exp ? {
                  t: "Hangus",
                  c: "bg-red-100 text-red-700"
                } : {
                  t: "Aktif",
                  c: "bg-emerald-100 text-emerald-700"
                };
                return <button key={v.id} onClick={() => {
                  setVoucherQR(v);
                  setVoucherQRFrom("kasir");
                }} title="Verifikasi & klaim" className="w-full text-left border border-slate-200 rounded-2xl p-3 transition cursor-pointer hover:border-peri hover:shadow-card">
                      <div className="flex items-center gap-2">
                        <p className="font-extrabold text-sm flex-1 truncate">{v.memberName || "Member"} <span className="font-mono font-bold text-mutedslate">• {v.code}</span></p>
                        <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full shrink-0 ${st.c}`}>{st.t}</span>
                      </div>
                      <p className="text-sm font-bold mt-0.5">{v.label}</p>
                      <p className="text-[11px] text-mutedslate mt-0.5">Berlaku s/d {fmtDate(v.expiresAt)}{v.used && v.usedAt ? ` • Dipakai ${fmtDateTime(v.usedAt)}` : v.used ? " • Sudah terpakai" : exp ? " • Sudah tidak berlaku" : ""}</p>
                    </button>;
              })}
                  {vouchers.length === 0 && <p className="text-sm text-mutedslate py-6 text-center">Belum ada voucher diterbitkan.</p>}
                </div>
              </div>
              </div>}
            </div>}

          {adminTab === "datakasir" && <div className="mt-4 grid lg:grid-cols-2 gap-4">
              <div className="bg-white rounded-3xl border shadow-card p-6">
                <h2 className="font-extrabold text-xl flex items-center gap-2"><Icon name="user-plus" className="w-5 h-5 text-espresso" /> Tambah Kasir / Admin</h2>
                <label className="block mt-4 text-sm font-bold text-charcoal text-left">Nama kasir / admin</label>
                <input value={staffForm.name} onChange={e => setStaffForm({
            ...staffForm,
            name: e.target.value
          })} placeholder="cth: Budi Santoso" className="mt-1.5 w-full border-2 border-slate-200 rounded-2xl px-4 py-2.5 font-semibold" />
                <label className="block mt-4 text-sm font-bold text-charcoal text-left">Email login</label>
                <input value={staffForm.email} onChange={e => setStaffForm({
            ...staffForm,
            email: e.target.value
          })} type="email" placeholder="nama@ilmora.id" className="mt-1.5 w-full border-2 border-slate-200 rounded-2xl px-4 py-2.5 font-semibold" />
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-sm font-bold text-charcoal">Password baru</label>
                    <div className="relative mt-1.5">
                      <input value={staffForm.pass} onChange={e => setStaffForm({
                  ...staffForm,
                  pass: e.target.value
                })} type={showStaffPass ? "text" : "password"} placeholder="min. 6 karakter" className="w-full border-2 border-slate-200 rounded-2xl px-4 py-2.5 pr-12 font-semibold" />
                      <button type="button" onClick={() => setShowStaffPass(v => !v)} aria-label={showStaffPass ? "Sembunyikan password" : "Tampilkan password"} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full text-mutedslate hover:bg-mist">
                        <Icon name={showStaffPass ? "eye-off" : "eye"} className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-bold text-charcoal">Peran</label>
                    <select value={staffForm.role} onChange={e => setStaffForm({
                ...staffForm,
                role: e.target.value
              })} className="mt-1.5 w-full border-2 border-slate-200 rounded-2xl px-4 py-2.5 font-bold bg-white">
                      <option value="kasir">Kasir</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
                <button onClick={addStaff} className="mt-4 w-full font-bold py-3 rounded-full bg-espresso text-white hover:bg-espressodark transition flex items-center justify-center gap-2"><Icon name="plus" className="w-4 h-4" /> Tambah Kasir {nextStaffCode()}</button>
              </div>
              <div className="bg-white rounded-3xl border shadow-card p-6">
                <h3 className="font-extrabold text-lg text-left">Daftar Kasir / Admin ({staffs.length})</h3>
                <div className="mt-3 space-y-2 max-h-[560px] overflow-auto pr-1">
                  {staffs.map(s => <div key={s.code} className="flex items-center gap-3 border-2 border-slate-200 rounded-2xl px-3 py-2.5">
                      <span className="shrink-0 text-xs font-extrabold font-mono bg-charcoal text-white px-2.5 py-1.5 rounded-full">Kasir {s.code}</span>
                      <div className="flex-1 min-w-0 text-left">
                        <p className="font-extrabold text-sm truncate">{s.name}</p>
                        <p className="text-[11px] text-mutedslate tabular-nums">{s.served || 0} pelanggan dilayani</p>
                      </div>
                      <button title="Edit info kasir" onClick={() => {
                setEditingStaff({
                  code: s.code,
                  name: s.name,
                  pass: s.pass
                });
                setShowEditStaffPass(false);
              }} className="p-2 rounded-full hover:bg-amber-50 text-amber-700 shrink-0"><Icon name="pencil" className="w-4 h-4" /></button>
                      <button title="Hapus kasir" onClick={() => deleteStaff(s.code)} className="p-2 rounded-full hover:bg-red-50 text-red-500 shrink-0"><Icon name="trash-2" className="w-4 h-4" /></button>
                    </div>)}
                </div>
              </div>
            </div>}

          {adminTab === "member" && <div className="mt-4 grid lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 bg-white rounded-3xl border shadow-card p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-extrabold text-xl flex items-center gap-2"><Icon name="users" className="w-5 h-5 text-espresso" /> Daftar Member Terdaftar ({members.length})</h2>
                  <div className="flex-1"></div>
                  <div className="relative">
                    <Icon name="search" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-mutedslate" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama / ID..." className="border-2 border-slate-200 rounded-full pl-9 pr-4 py-2 text-sm w-52" />
                  </div>
                  <select value={tierFilter} onChange={e => setTierFilter(e.target.value)} className="border-2 border-slate-200 rounded-full px-3 py-2 text-sm font-bold">
                    {["Semua", ...TIER_ORDER].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="mt-4 overflow-auto -mx-6 px-6 max-h-[410px]">
                  <table className="w-full text-[13px] sm:text-sm text-left">
                    <thead className="sticky top-0 bg-white"><tr className="text-left text-[11px] uppercase tracking-wider text-mutedslate border-b"><th className="py-2 pr-1">Member</th><th className="py-2 px-1 whitespace-nowrap">Tier</th><th className="py-2 px-1 text-right whitespace-nowrap">Points</th><th className="py-2 px-1 text-right whitespace-nowrap">XP</th><th className="py-2 pl-1 text-right whitespace-nowrap">Aksi</th></tr></thead>
                    <tbody>
                      {filteredMembers.map(m => <tr key={m.id} className="border-b last:border-0 hover:bg-mist/40">
                          <td className="py-2 pr-1 min-w-0"><p className="font-bold leading-tight break-words">{m.name}</p><p className="text-xs text-mutedslate font-mono">{m.id}</p></td>
                          <td className="py-2 px-1"><span className={`text-[10px] sm:text-[11px] font-extrabold px-2 py-0.5 rounded-full border whitespace-nowrap ${TIER_STYLE[tierInfo(m.xp).tier]}`}>{tierInfo(m.xp).tier}</span></td>
                          <td className="py-2 px-1 text-right font-extrabold whitespace-nowrap tabular-nums">{m.points.toLocaleString("id-ID")}</td>
                          <td className="py-2 px-1 text-right font-bold text-peri whitespace-nowrap tabular-nums">{m.xp.toLocaleString("id-ID")}</td>
                          <td className="py-2 pl-1 text-right whitespace-nowrap">
                            <button onClick={() => setEditing({
                      ...m
                    })} className="p-1.5 rounded-full hover:bg-amber-50 text-amber-700"><Icon name="pencil" className="w-4 h-4" /></button>
                            <button onClick={() => deleteMember(m.id)} className="p-1.5 rounded-full hover:bg-red-50 text-red-500"><Icon name="trash-2" className="w-4 h-4" /></button>
                          </td>
                        </tr>)}
                    </tbody>
                  </table>
                  {filteredMembers.length === 0 && <p className="text-sm text-mutedslate py-6 text-center">Tidak ada member yang cocok.</p>}
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-white rounded-3xl border shadow-card p-6">
                  <h3 className="font-extrabold flex items-center gap-2"><Icon name="settings" className="w-4 h-4 text-espresso" /> Pengaturan Rasio Poin & XP</h3>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <label className="text-xs font-bold">Rp per<input type="number" value={ratio.idrPer} onChange={e => setRatio({
                  ...ratio,
                  idrPer: Number(e.target.value) || 1000
                })} className="mt-1 w-full border-2 border-slate-200 rounded-xl px-2 py-2 font-bold" /></label>
                    <label className="text-xs font-bold">Pts<input type="number" value={ratio.pointsPer} onChange={e => setRatio({
                  ...ratio,
                  pointsPer: Number(e.target.value) || 0
                })} className="mt-1 w-full border-2 border-slate-200 rounded-xl px-2 py-2 font-bold" /></label>
                    <label className="text-xs font-bold">XP<input type="number" value={ratio.xpPer} onChange={e => setRatio({
                  ...ratio,
                  xpPer: Number(e.target.value) || 0
                })} className="mt-1 w-full border-2 border-slate-200 rounded-xl px-2 py-2 font-bold" /></label>
                  </div>
                  <button onClick={() => pushToast("Rasio earning diperbarui!")} className="mt-3 w-full bg-peri hover:bg-peridark text-white text-sm font-bold py-2.5 rounded-full transition">Simpan Rasio</button>
                  <div className="mt-4 pt-3 border-t">
                    <label className="text-xs font-extrabold text-mutedslate uppercase">Masa berlaku voucher (hari)</label>
                    <div className="mt-1.5 flex gap-2">
                      <input type="number" min="1" max="90" value={voucherDays} onChange={e => setVoucherDays(Math.max(1, Number(e.target.value) || 1))} className="flex-1 border-2 border-slate-200 rounded-xl px-3 py-2 font-bold" />
                      <button onClick={() => pushToast(`Voucher baru berlaku ${voucherDays} hari. Lewat itu hangus.`)} className="bg-peri hover:bg-peridark text-white text-sm font-bold px-4 rounded-xl transition">OK</button>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-3xl border shadow-card p-6">
                  <h3 className="font-extrabold flex items-center gap-2"><Icon name="gift" className="w-4 h-4 text-espresso" /> LUCKY SPIN</h3>
                  <div className="mt-3 space-y-2 max-h-[120px] overflow-auto pr-1">
                    {rewards.map(r => <div key={r.id} className="flex items-center gap-2 border rounded-2xl px-3 py-2">
                        <p className="flex-1 font-bold text-sm text-left">{r.name}</p>
                        <span className="text-xs font-extrabold bg-amber-100 text-amber-800 px-2 py-1 rounded-full">{r.cost} pts</span>
                        <button onClick={() => setRewards(p => p.filter(x => x.id !== r.id))} className="p-1.5 rounded-full hover:bg-red-50 text-red-500"><Icon name="trash-2" className="w-3.5 h-3.5" /></button>
                      </div>)}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <input value={newReward.name} onChange={e => setNewReward({
                ...newReward,
                name: e.target.value
              })} placeholder="Nama reward" className="flex-1 border-2 border-slate-200 rounded-xl px-3 py-2 text-sm" />
                    <input value={newReward.cost} onChange={e => setNewReward({
                ...newReward,
                cost: e.target.value
              })} placeholder="pts" type="number" className="w-20 border-2 border-slate-200 rounded-xl px-3 py-2 text-sm" />
                    <button onClick={() => {
                if (!newReward.name.trim()) return;
                setRewards(p => [...p, {
                  id: uid(),
                  name: newReward.name,
                  cost: Number(newReward.cost) || 100
                }]);
                setNewReward({
                  name: "",
                  cost: ""
                });
                pushToast("Reward ditambahkan.");
              }} className="bg-espresso text-white p-2.5 rounded-xl"><Icon name="plus" className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            </div>}

          {adminTab === "promo" && <div className="mt-4 grid lg:grid-cols-2 gap-4">
              <div className="bg-white rounded-3xl border shadow-card p-6">
                <h2 className="font-extrabold text-xl flex items-center gap-2"><Icon name="megaphone" className="w-5 h-5 text-peri" /> Publish Promo Baru</h2>
                <label className="block mt-4 text-sm font-bold text-charcoal text-left">Tag</label>
                <input value={promoForm.tag} onChange={e => setPromoForm({
            ...promoForm,
            tag: e.target.value
          })} className="mt-1.5 w-full border-2 border-slate-200 rounded-2xl px-4 py-2.5 font-semibold" />
                <label className="block mt-4 text-sm font-bold text-charcoal text-left">Judul</label>
                <input value={promoForm.title} onChange={e => setPromoForm({
            ...promoForm,
            title: e.target.value
          })} placeholder="cth: Gratis Upsize Hari Jumat" className="mt-1.5 w-full border-2 border-slate-200 rounded-2xl px-4 py-2.5 font-semibold" />
                <label className="block mt-4 text-sm font-bold text-charcoal text-left">Deskripsi</label>
                <textarea value={promoForm.desc} onChange={e => setPromoForm({
            ...promoForm,
            desc: e.target.value
          })} rows="3" placeholder="Syarat & cara klaim..." className="mt-1.5 w-full border-2 border-slate-200 rounded-2xl px-4 py-2.5 text-sm" />
                <label className="block mt-4 text-sm font-bold text-charcoal text-left">Berlaku</label>
                <input value={promoForm.valid} onChange={e => setPromoForm({
            ...promoForm,
            valid: e.target.value
          })} placeholder="cth: s/d 30 Nov 2026" className="mt-1.5 w-full border-2 border-slate-200 rounded-2xl px-4 py-2.5 font-semibold" />
                <button onClick={publishPromo} className="mt-4 w-full bg-gradient-to-r from-peri to-peridark hover:opacity-90 text-white font-bold py-3 rounded-full flex items-center justify-center gap-2 transition"><Icon name="megaphone" className="w-4 h-4" /> Terbitkan Promo</button>
              </div>
              <div className="bg-white rounded-3xl border shadow-card p-6">
                <h3 className="font-extrabold text-lg">Promo Aktif ({promos.length})</h3>
                <div className="mt-3 space-y-2.5 max-h-[460px] overflow-auto pr-1">
                  {promos.map(p => {
              const t = PROMO_THEMES[(p.theme ?? 0) % PROMO_THEMES.length];
              return <div key={p.id} className="rounded-2xl p-4 border-2" style={{
                background: t.tint,
                borderColor: t.edge
              }}>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full" style={{
                    background: t.badge,
                    color: t.badgeText
                  }}>{p.tag}</span>
                        <span className="ml-auto text-[11px] font-bold text-slate-600 bg-black/5 px-2 py-0.5 rounded-full">{p.valid}</span>
                      </div>
                      <p className="mt-1.5 font-extrabold text-charcoal">{p.title}</p>
                      <p className="text-sm text-slate-600">{p.desc}</p>
                      <button onClick={() => {
                  setPromos(prev => prev.filter(x => x.id !== p.id));
                  pushToast("Promo dihapus dari board.");
                }} className="mt-2 text-xs font-bold px-3 py-1.5 rounded-full border-2 hover:bg-white/60" style={{
                  borderColor: t.edge,
                  color: t.badgeText
                }}>Hapus</button>
                    </div>;
            })}
                </div>
              </div>
            </div>}

                    {adminTab === "menu" && <div className="mt-4 grid lg:grid-cols-2 gap-4">
              <div className="bg-white rounded-3xl border shadow-card p-6">
                <h2 className="font-extrabold text-xl flex items-center gap-2"><Icon name="coffee" className="w-5 h-5 text-espresso" /> {editingMenuId ? "Edit Menu" : "Tambah Menu Baru"}</h2>
                <label className="block mt-4 text-sm font-bold text-charcoal text-left">Nama menu</label>
                <input value={menuForm.name} onChange={e => setMenuForm({
            ...menuForm,
            name: e.target.value
          })} placeholder="cth: Kopi Susu Ilmora" className="mt-1.5 w-full border-2 border-slate-200 rounded-2xl px-4 py-2.5 font-semibold" />
                <label className="block mt-4 text-sm font-bold text-charcoal text-left">Deskripsi</label>
                <textarea value={menuForm.desc} onChange={e => setMenuForm({
            ...menuForm,
            desc: e.target.value
          })} rows="2" placeholder="Deskripsi singkat..." className="mt-1.5 w-full border-2 border-slate-200 rounded-2xl px-4 py-2.5 text-sm" />
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <label className="text-xs font-bold text-mutedslate">Harga (Rp)<input type="number" min="0" value={menuForm.price} onChange={e => setMenuForm({
                ...menuForm,
                price: e.target.value
              })} placeholder="35000" className="mt-1 w-full border-2 border-slate-200 rounded-xl px-3 py-2 font-bold text-charcoal" /></label>
                  <label className="text-xs font-bold text-mutedslate">Poin<input type="number" min="0" value={menuForm.poin} onChange={e => setMenuForm({
                ...menuForm,
                poin: e.target.value
              })} placeholder="32" className="mt-1 w-full border-2 border-slate-200 rounded-xl px-3 py-2 font-bold text-charcoal" /></label>
                  <label className="text-xs font-bold text-mutedslate">XP<input type="number" min="0" value={menuForm.xp} onChange={e => setMenuForm({
                ...menuForm,
                xp: e.target.value
              })} placeholder="64" className="mt-1 w-full border-2 border-slate-200 rounded-xl px-3 py-2 font-bold text-charcoal" /></label>
                </div>
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <label className="text-xs font-bold text-mutedslate">Rating<input value={menuForm.rating} onChange={e => setMenuForm({
                ...menuForm,
                rating: e.target.value
              })} placeholder="4.8" className="mt-1 w-full border-2 border-slate-200 rounded-xl px-3 py-2 font-bold text-charcoal" /></label>
                  <label className="text-xs font-bold text-mutedslate">Kategori
                    <select value={menuForm.cat || "coffee"} onChange={e => {
                const c = MENU_CATS.find(x => x.value === e.target.value);
                setMenuForm({
                  ...menuForm,
                  cat: c.value,
                  badge: c.label,
                  badgeColor: c.color
                });
              }} className="mt-1 w-full border-2 border-slate-200 rounded-xl px-3 py-2 font-bold text-charcoal bg-white">
                      {MENU_CATS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </label>
                  <label className="text-xs font-bold text-mutedslate">Badge
                    <select value={menuForm.badge} onChange={e => {
                const b = MENU_BADGES.find(x => x.label === e.target.value);
                setMenuForm({
                  ...menuForm,
                  badge: b.label,
                  badgeColor: b.color
                });
              }} className="mt-1 w-full border-2 border-slate-200 rounded-xl px-3 py-2 font-bold text-charcoal bg-white">
                      {MENU_BADGES.map(b => <option key={b.label} value={b.label}>{b.label}</option>)}
                    </select>
                  </label>
                </div>
                <label className="block mt-4 text-sm font-bold text-charcoal text-left">Foto produk</label>
                <div className="relative mt-1.5">
                  <input value={typeof menuForm.img === "string" && menuForm.img.indexOf("http") === 0 ? menuForm.img : ""} onChange={e => setMenuForm({
              ...menuForm,
              img: e.target.value
            })} placeholder="Tempel URL gambar (https://...) atau pakai klip" className="w-full border-2 border-slate-200 rounded-2xl pl-4 pr-12 py-2.5 text-sm font-semibold" />
                  <label htmlFor="menuImgPick" title="Upload foto dari HP" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full text-mutedslate hover:bg-mist cursor-pointer">
                    <Icon name="paperclip" className="w-4 h-4" />
                  </label>
                  <input id="menuImgPick" type="file" accept="image/*" className="hidden" onChange={e => onMenuImgFile(e.target.files && e.target.files[0])} />
                </div>
                {menuForm.img ? <img src={menuForm.img} alt="pratinjau" className="mt-2 h-16 w-16 rounded-xl object-cover border" /> : null}
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {editingMenuId ? <React.Fragment>
                      <button key="m-cancel" onClick={resetMenuForm} className="font-bold py-3 rounded-full border-2 border-slate-200 hover:bg-mist">Batal</button>
                      <button key="m-save" onClick={saveMenu} className="font-bold py-3 rounded-full bg-peri text-white hover:bg-peridark transition">Simpan Perubahan</button>
                    </React.Fragment> : <button key="m-add" onClick={saveMenu} className="col-span-2 font-bold py-3 rounded-full bg-espresso text-white hover:bg-espressodark transition flex items-center justify-center gap-2"><Icon name="plus" className="w-4 h-4" /> Tambah ke Katalog</button>}
                </div>
              </div>
              <div className="bg-white rounded-3xl border shadow-card p-6">
                <h3 className="font-extrabold text-lg text-left">Daftar Menu ({menus.length})</h3>
                <div className="mt-3 space-y-2 max-h-[342px] overflow-auto pr-1">
                  {menus.map(m => <div key={m.id} className="flex items-center gap-3 border rounded-2xl p-3">
                      <img src={m.img} alt={m.name} className="w-14 h-14 rounded-xl object-cover shrink-0" />
                      <div className="flex-1 min-w-0 text-left">
                        <p className="font-extrabold text-sm truncate">{m.name} <span className="text-[10px] font-extrabold text-mutedslate">• {m.cat === "non" ? "Non-Coffee" : m.cat === "pastry" ? "Pastry" : "Coffee"}</span></p>
                        <p className="text-xs text-mutedslate tabular-nums">{fmtIDR(m.price)} • <b className="text-espresso">+{m.poin} pts</b> • <b className="text-peri">+{m.xp} XP</b></p>
                      </div>
                      <button onClick={() => startEditMenu(m)} title="Edit" className="p-2 rounded-full hover:bg-amber-50 text-amber-700"><Icon name="pencil" className="w-4 h-4" /></button>
                      <button onClick={() => deleteMenu(m.id)} title="Hapus" className="p-2 rounded-full hover:bg-red-50 text-red-500"><Icon name="trash-2" className="w-4 h-4" /></button>
                    </div>)}
                </div>
              </div>
            </div>}
        </main>)}

      {}
      <footer className="mt-6 text-white" style={{
      background: "#5C3D28"
    }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid sm:grid-cols-2 gap-6 items-start" style={{
        backgroundImage: "repeating-linear-gradient(90deg, rgba(255,255,255,.05) 0 1px, transparent 1px 60px)"
      }}>
          <div className="text-left">
            <p className="font-extrabold text-2xl tracking-tight">ILMORA</p>
            <p className="text-xs font-bold text-white/70 tracking-[0.2em] mt-1">CO-WORKING & LIBRARY</p>
            <p className="mt-3 text-sm text-white/70 leading-relaxed text-left">Menggabungkan kafe, ruang kerja bersama (co-working), dan nuansa perpustakaan/komunitas. Ngopi, kerja, dan berkumpul dalam satu tempat yang nyaman.</p>
          </div>
          <div className="text-sm text-left sm:pl-10">
            <p className="font-extrabold mb-2 text-white/90">Lokasi & Jam Operasional</p>
            <p className="text-white/70 flex gap-2 text-left"><Icon name="map-pin" className="w-4 h-4 shrink-0 mt-0.5 text-white/50" /> <span>Jl. Raya Gn. Anyar Sawah (Jl. Gunung Anyar Sawah No. 32), Kec. Gunung Anyar, Surabaya, Jawa Timur 60294</span></p>
            <p className="text-white/70 flex gap-2 mt-1.5 text-left"><Icon name="clock" className="w-4 h-4 shrink-0 mt-0.5 text-white/50" /> <span>Setiap hari (Senin–Minggu), 08.00–23.00 WIB</span></p>
            <p className="text-white/70 flex gap-2 mt-1.5 text-left"><Icon name="phone" className="w-4 h-4 shrink-0 mt-0.5 text-white/50" /> <span>0888-4907-862 (Reservasi)</span></p>
            <p className="text-white/70 flex gap-2 mt-1.5 text-left"><Icon name="camera" className="w-4 h-4 shrink-0 mt-0.5 text-white/50" /> <span>Instagram @ilmora.cafe</span></p>
          </div>
        </div>
        <div className="text-center text-xs text-white/60 py-4" style={{
        background: "#3E2718"
      }}>© 2026 Ilmora Cafe • Co-working & Library • Surabaya</div>
      </footer>

      {showQR && <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm" onClick={() => setShowQR(false)}>
          <div className="animate-pop bg-white rounded-3xl w-full max-w-sm p-6 text-center shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <p className="font-extrabold">Digital Member ID</p>
              <button onClick={() => setShowQR(false)} className="p-2 rounded-full hover:bg-mist"><Icon name="x" className="w-4 h-4" /></button>
            </div>
            <div className="mt-3 mx-auto w-fit bg-white border-4 border-charcoal rounded-2xl p-3">
              <RealQR text={"ILMORA-MEMBER:" + me.id} />
            </div>
            <p className="mt-3 font-mono font-extrabold tracking-widest text-lg">{me.id}</p>
            <p className="font-bold">{me.name} • <span className={`text-xs px-2 py-0.5 rounded-full border ${TIER_STYLE[myTier.tier]}`}>{myTier.tier}</span></p>
            <p className="mt-1 text-xs text-mutedslate">Tunjukkan QR ini ke kasir untuk earn / redeem poin. Kasir bisa memindai langsung dari menu Scan.</p>
          </div>
        </div>}

      {voucherQR && <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm" onClick={() => setVoucherQR(null)}>
          <div className="animate-pop bg-white rounded-3xl w-full max-w-sm p-6 text-center shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <p className="font-extrabold">{voucherQRFrom === "kasir" ? "Verifikasi Voucher" : "Voucher"}</p>
              <button onClick={() => setVoucherQR(null)} className="p-2 rounded-full hover:bg-mist"><Icon name="x" className="w-4 h-4" /></button>
            </div>
            <p className="mt-1 font-extrabold text-lg">{voucherQR.label}</p>
            {voucherQRFrom === "kasir" && (() => {
          const qm = members.find(m => m.id === voucherQR.memberId);
          const qName = voucherQR.memberName || (qm ? qm.name : "Member");
          const qTier = qm ? tierInfo(qm.xp).tier : null;
          const qExp = isExpired(voucherQR);
          return <React.Fragment>
                <div className="mt-3 flex items-center gap-3 bg-mist rounded-2xl p-3 text-left">
                  <div className="w-11 h-11 rounded-full bg-espresso text-white flex items-center justify-center font-extrabold text-lg shrink-0">{qName.charAt(0)}</div>
                  <div className="min-w-0 text-left">
                    <p className="font-extrabold text-sm truncate">{qName}</p>
                    <p className="text-[11px] text-mutedslate font-mono">{voucherQR.memberId || "- ID"}{qTier ? ` • ${qTier}` : ""}</p>
                  </div>
                </div>
                <div className={`mt-3 rounded-2xl border-2 p-3 text-left ${voucherQR.used || qExp ? "border-red-300 bg-red-50" : "border-emerald-300 bg-emerald-50/60"}`}>
                  <p className="font-mono font-extrabold tracking-widest text-lg text-center">{voucherQR.code}</p>
                  <div className="mt-2 flex items-center justify-center">
                    {voucherQR.used ? <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-red-600 text-white">Terpakai</span> : qExp ? <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-red-600 text-white">Kedaluarsa</span> : <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-600 text-white">Aktif</span>}
                  </div>
                  {voucherQR.used ? <p className="mt-1.5 text-xs font-bold text-red-700 text-center">Sudah terpakai pada {voucherQR.usedAt ? fmtDateTime(voucherQR.usedAt) : "waktu yang tercatat"}</p> : qExp ? <p className="mt-1.5 text-xs font-bold text-red-700 text-center">Sudah tidak berlaku (kedaluarsa {fmtDate(voucherQR.expiresAt)})</p> : <p className="mt-1.5 text-xs font-bold text-emerald-700 text-center">Berlaku sampai {fmtDate(voucherQR.expiresAt)}</p>}
                </div>
                </React.Fragment>;
        })()}
            {voucherQRFrom !== "kasir" && <p className="mt-3 font-mono font-extrabold tracking-widest text-2xl bg-mist rounded-2xl py-3 px-4">{voucherQR.code}</p>}
            {voucherQRFrom !== "kasir" && <div className="mt-3 mx-auto w-fit bg-white border-4 border-charcoal rounded-2xl p-3">
              <RealQR text={"ILMORA-VOUCHER:" + voucherQR.code} />
            </div>}
            {voucherQRFrom !== "kasir" && <p className="mt-2 text-xs text-mutedslate font-semibold">Berlaku s/d {fmtDate(voucherQR.expiresAt)}{voucherQR.used ? " • SUDAH TERPAKAI" : isExpired(voucherQR) ? " • KEDALUWARSA" : " • Aktif"}</p>}
            <p className="mt-1 text-xs text-mutedslate">{voucherQRFrom === "kasir" ? "Periksa data member & voucher di atas, lalu Klaim atau Tutup." : "Tunjukkan kode / QR ini ke kasir untuk scan & klaim."}</p>
            {voucherQRFrom === "kasir" ? <div className="mt-4 grid grid-cols-2 gap-2">
                <button onClick={() => {
            if (claimVoucherCode(voucherQR.code)) setVoucherQR(null);
          }} disabled={voucherQR.used || isExpired(voucherQR)} className={`font-bold py-3 rounded-full transition ${voucherQR.used || isExpired(voucherQR) ? "bg-slate-200 text-slate-400 cursor-not-allowed" : "bg-espresso text-white hover:bg-espressodark"}`}>Klaim</button>
                <button onClick={() => setVoucherQR(null)} className="font-bold py-3 rounded-full border-2 border-slate-200 hover:bg-mist">Tutup</button>
              </div> : <div className="mt-4 grid grid-cols-2 gap-2">
                <button onClick={() => {
            if (navigator.clipboard) navigator.clipboard.writeText(voucherQR.code).then(() => pushToast("Kode voucher disalin."));
          }} className="font-bold py-3 rounded-full border-2 border-slate-200 hover:bg-mist">Salin Kode</button>
                <button onClick={() => setVoucherQR(null)} className="font-bold py-3 rounded-full bg-espresso text-white hover:bg-espressodark">Tutup</button>
              </div>}
          </div>
        </div>}

      {selectedTx && (() => {
      const t = selectedTx;
      const kName = t.kasirName || (staffs.find(s => s.code === t.kasir) || {}).name || (t.kasir ? `Kasir ${t.kasir}` : "Kasir");
      const items = (t.detail || t.items || "").split(",").map(s => s.trim()).filter(Boolean);
      return <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm" onClick={() => setSelectedTx(null)}>
          <div className="animate-pop bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl max-h-[92vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <p className="font-extrabold">Detail Struk {t.no || ""}</p>
              <button onClick={() => setSelectedTx(null)} className="p-2 rounded-full hover:bg-mist"><Icon name="x" className="w-4 h-4" /></button>
            </div>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex items-center gap-2 bg-mist rounded-2xl p-3">
                <Icon name="user" className="w-4 h-4 text-espresso shrink-0" />
                <div className="min-w-0 text-left"><p className="text-[11px] font-bold text-mutedslate">Kasir</p><p className="font-extrabold truncate">{kName}{t.kasir ? <span className="font-mono text-xs text-mutedslate"> • {t.kasir}</span> : null}</p></div>
              </div>
              <div className="flex items-center gap-2 bg-mist rounded-2xl p-3">
                <Icon name="users" className="w-4 h-4 text-peri shrink-0" />
                <div className="min-w-0 text-left"><p className="text-[11px] font-bold text-mutedslate">Member</p><p className="font-extrabold truncate">{t.memberName || "Member"}{t.memberId ? <span className="font-mono text-xs text-mutedslate"> • {t.memberId}</span> : null}</p></div>
              </div>
              <div className="bg-mist rounded-2xl p-3 text-left">
                <p className="text-[11px] font-bold text-mutedslate">Pesanan</p>
                <div className="mt-1 space-y-1">
                  {items.map((it, i) => <p key={i} className="font-bold">• {it}</p>)}
                  {items.length === 0 && <p className="font-bold">-</p>}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-white border-2 border-slate-200 rounded-2xl p-2.5"><p className="font-extrabold tabular-nums">{fmtIDR(t.amount)}</p><p className="text-[10px] font-bold text-mutedslate">Total</p></div>
                <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-2.5"><p className="font-extrabold tabular-nums text-amber-700">+{t.points}</p><p className="text-[10px] font-bold text-mutedslate">Poin</p></div>
                <div className="bg-indigo-50 border-2 border-indigo-100 rounded-2xl p-2.5"><p className="font-extrabold tabular-nums text-peri">+{t.xp}</p><p className="text-[10px] font-bold text-mutedslate">XP</p></div>
              </div>
              <div className="flex items-center gap-2 text-xs text-mutedslate font-semibold">
                <Icon name="clock" className="w-4 h-4 shrink-0" />
                <span>{t.at ? fmtDateTime(t.at) : t.date}</span>
              </div>
            </div>
            <button onClick={() => setSelectedTx(null)} className="mt-4 w-full font-bold py-3 rounded-full bg-espresso text-white hover:bg-espressodark">Tutup</button>
          </div>
        </div>;
    })()}

      {showAllTx && <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm" onClick={() => setShowAllTx(false)}>
          <div className="animate-pop bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl max-h-[92vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <p className="font-extrabold">Semua Transaksi ({transactions.length})</p>
              <button onClick={() => setShowAllTx(false)} className="p-2 rounded-full hover:bg-mist"><Icon name="x" className="w-4 h-4" /></button>
            </div>
            <div className="mt-3 space-y-2 overflow-y-auto pr-1">
              {transactions.map(t => <button key={t.id} onClick={() => setSelectedTx(t)} title="Lihat detail struk" className="w-full text-left flex items-center gap-3 border rounded-2xl p-3 transition cursor-pointer hover:border-peri hover:shadow-card">
                  <div className="w-10 h-10 rounded-xl bg-mist flex items-center justify-center shrink-0"><Icon name="shopping-bag" className="w-5 h-5 text-espresso" /></div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="font-bold text-sm truncate">{t.items}</p>
                    <p className="text-xs text-mutedslate">{t.no ? t.no + " • " : ""}{t.date}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-extrabold text-sm tabular-nums">{fmtIDR(t.amount)}</p>
                    <p className="text-[11px] font-bold text-peri tabular-nums">+{t.points} pts</p>
                  </div>
                </button>)}
            </div>
            <button onClick={() => setShowAllTx(false)} className="mt-4 w-full font-bold py-3 rounded-full border-2 border-slate-200 hover:bg-mist">Tutup</button>
          </div>
        </div>}

      {showScan && <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm" onClick={closeScan}>
          <div className="animate-pop bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl max-h-[92vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <p className="font-extrabold">Scan QR Member</p>
              <button onClick={closeScan} className="p-2 rounded-full hover:bg-mist"><Icon name="x" className="w-4 h-4" /></button>
            </div>
            {!scanMemberId ? <div className="mt-3">
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={startCamera} className={`font-bold py-2.5 rounded-2xl border-2 transition flex items-center justify-center gap-1.5 text-sm ${scanMode === "camera" ? "border-peri bg-sky-50 text-peri" : "border-slate-200 hover:border-peri"}`}>
                    <Icon name="camera" className="w-4 h-4" /> Buka Kamera
                  </button>
                  <label htmlFor="scanPick" className="cursor-pointer font-bold py-2.5 rounded-2xl border-2 border-slate-200 hover:border-peri transition flex items-center justify-center gap-1.5 text-sm text-center">
                    <Icon name="image" className="w-4 h-4" /> Pilih File
                  </label>
                </div>
                <input id="scanPick" type="file" accept="image/*" className="hidden" onChange={e => {
            onScanFile(e.target.files && e.target.files[0]);
            e.target.value = "";
          }} />
                {scanMode === "camera" && <div className="mt-3 rounded-3xl overflow-hidden border-2 bg-charcoal relative" style={{
            borderColor: qrSeen ? "#10B981" : "#2B92C4"
          }}>
                    <video ref={videoRef} className="w-full h-56 object-cover bg-charcoal" playsInline muted />
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <div className="w-44 h-44 rounded-2xl" style={{
                border: `4px solid ${qrSeen ? "#10B981" : "rgba(255,255,255,.8)"}`
              }}></div>
                    </div>
                    <p className="absolute bottom-2 left-0 right-0 text-center text-[11px] font-bold text-white/90">Arahkan QR member ke dalam kotak…</p>
                  </div>}
                {scanMode === "camera" && <div className={`mt-2.5 rounded-2xl border-2 p-3 text-sm font-bold flex items-center gap-2 ${camStatus.s === "invalid" ? "border-red-200 bg-red-50 text-red-700" : qrSeen ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-indigo-200 bg-indigo-50 text-peri"}`}>
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{
              background: camStatus.s === "invalid" ? "#DC2626" : qrSeen ? "#10B981" : "#2B92C4",
              animation: !qrSeen && camStatus.s !== "invalid" ? "pulse-dot 1.2s infinite" : "none"
            }}></span>
                    {camStatus.s === "invalid" ? camStatus.text === "tidak ada QR" ? "✗ Tidak ada QR yang terbaca. Dekatkan & sejajarkan QR." : `✗ QR terbaca tapi bukan QR Ilmora${camStatus.text ? `: "${camStatus.text}"` : ""}` : qrSeen ? "✓ QR terdeteksi — sedang membaca…" : "Mencari kode QR… arahkan QR ke dalam kotak."}
                  </div>}
                {scanMode === "camera" && <button onClick={snapAndDecode} className="mt-2.5 w-full font-bold py-3 rounded-full bg-peri hover:bg-peridark text-white transition flex items-center justify-center gap-2">
                    <Icon name="camera" className="w-4 h-4" /> Pindai Sekarang
                  </button>}
                {scanMode === "camera" && <button onClick={() => {
            stopCamera();
            setScanMode("file");
            setCamStatus({
              s: "idle",
              text: ""
            });
            setQrSeen(false);
          }} className="mt-2 w-full text-xs font-bold text-mutedslate underline">Tutup kamera / pakai file saja</button>}
                {camError && <p className="mt-2.5 rounded-2xl border-2 border-amber-200 bg-amber-50 p-3 text-sm font-bold text-amber-800">{camError}</p>}
                {scanMode === "file" && <label htmlFor="scanPick2" className="cursor-pointer mt-3 flex flex-col items-center gap-2 border-2 border-dashed border-slate-300 hover:border-peri rounded-3xl p-6 text-center transition">
                    <span className="w-14 h-14 rounded-2xl bg-mist flex items-center justify-center"><Icon name={scanning ? "refresh-cw" : "scan-line"} className={`w-7 h-7 text-peri ${scanning ? "animate-spin" : ""}`} /></span>
                    <span className="font-extrabold">{scanning ? "Memindai…" : "Ketuk untuk foto / pilih QR"}</span>
                    <span className="text-xs text-mutedslate">Di HP maupun laptop: Buka Kamera memindai langsung • Pilih File mengunggah foto QR. Bisa QR Member (menu "QR Saya") maupun QR Voucher.</span>
                  </label>}
                <input id="scanPick2" type="file" accept="image/*" className="hidden" onChange={e => {
            onScanFile(e.target.files && e.target.files[0]);
            e.target.value = "";
          }} />
              </div> : (() => {
          const sm = members.find(m => m.id === scanMemberId);
          if (!sm) return null;
          const sVouchers = [...vouchers.filter(v => v.memberId === sm.id)].sort((a, b) => Number(a.used || isExpired(a)) - Number(b.used || isExpired(b)));
          const sTier = tierInfo(sm.xp).tier;
          return <div className="mt-3">
                  <div className="flex items-center gap-3 bg-mist rounded-2xl p-3">
                    <div className="w-11 h-11 rounded-full bg-espresso text-white flex items-center justify-center font-extrabold text-lg shrink-0">{sm.name.charAt(0)}</div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="font-extrabold text-sm truncate">{sm.name}</p>
                      <p className="text-[11px] text-mutedslate font-mono">{sm.id} • {sTier} • {sm.points.toLocaleString("id-ID")} pts</p>
                    </div>
                    <button onClick={() => setScanMemberId(null)} className="text-xs font-bold text-peri underline shrink-0">Pindai lagi</button>
                  </div>
                  <p className="mt-3 text-xs font-extrabold text-mutedslate uppercase">Voucher {sm.name.split(" ")[0]} ({sVouchers.length}) — ketuk untuk verifikasi & klaim</p>
                  <div className="mt-1.5 space-y-2 max-h-56 overflow-y-auto pr-0.5">
                    {sVouchers.map(v => {
                const exp = isExpired(v);
                const st = v.used ? {
                  t: "Terpakai",
                  c: "border-red-300 bg-red-50"
                } : exp ? {
                  t: "Kedaluarsa",
                  c: "border-red-300 bg-red-50"
                } : {
                  t: "Aktif",
                  c: "border-emerald-300 bg-emerald-50/60 hover:border-emerald-500"
                };
                return <button key={v.id} onClick={() => {
                  setVoucherQR(v);
                  setVoucherQRFrom("kasir");
                  closeScan();
                }} className={`w-full text-left border-2 rounded-2xl p-3 transition ${st.c}`}>
                        <div className="flex items-center gap-2">
                          <p className="font-extrabold text-sm flex-1">{v.label}</p>
                          <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full shrink-0 ${v.used || exp ? "bg-red-600 text-white" : "bg-emerald-600 text-white"}`}>{st.t}</span>
                        </div>
                        <p className="text-xs text-mutedslate font-mono mt-0.5">{v.code}</p>
                        {v.used ? <p className="mt-1 text-xs font-bold text-red-700">Sudah terpakai pada {v.usedAt ? fmtDateTime(v.usedAt) : "waktu yang tercatat"}</p> : exp ? <p className="mt-1 text-xs font-bold text-red-700">Sudah tidak berlaku (kedaluarsa {fmtDate(v.expiresAt)})</p> : <p className="mt-1 text-xs font-bold text-emerald-700">Berlaku sampai {fmtDate(v.expiresAt)} — ketuk untuk verifikasi & klaim</p>}
                      </button>;
              })}
                    {sVouchers.length === 0 && <p className="text-sm text-mutedslate bg-mist rounded-2xl p-4 text-center">Member ini belum punya voucher.</p>}
                  </div>
                  <button onClick={closeScan} className="mt-3 w-full font-bold py-3 rounded-full border-2 border-slate-200 hover:bg-mist">Tutup</button>
                </div>;
        })()}
          </div>
        </div>}

      {winPrize && <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm" onClick={() => setWinPrize(null)}>
          <div className="animate-pop bg-white rounded-3xl w-full max-w-sm p-7 text-center shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="mx-auto w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center"><Icon name={winPrize.label === "Coba Lagi" ? "frown" : "gift"} className="w-8 h-8 text-espresso" /></div>
            <h3 className="mt-3 font-extrabold text-2xl">{winPrize.label === "Coba Lagi" ? "Belum beruntung!" : "Selamat! 🎉"}</h3>
            <p className="font-extrabold text-espresso text-lg mt-1">{winPrize.label}</p>
            <p className="text-sm text-mutedslate">{winPrize.sub}{winPrize.label !== "Coba Lagi" && winPrize.label !== "+100 Poin" ? " • voucher masuk ke list kamu." : ""}</p>
            <button onClick={() => setWinPrize(null)} className="mt-5 w-full bg-espresso text-white font-bold py-3 rounded-full hover:bg-espressodark">Klaim & Tutup</button>
          </div>
        </div>}

      {editing && <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm" onClick={() => setEditing(null)}>
          <div className="animate-pop bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="font-extrabold text-lg">Edit Member — {editing.id}</h3>
            <label className="block mt-3 text-xs font-bold text-mutedslate">Nama</label>
            <input value={editing.name} onChange={e => setEditing({
          ...editing,
          name: e.target.value
        })} className="mt-1 w-full border-2 border-slate-200 rounded-xl px-3 py-2 font-semibold" />
            <div className="mt-2 grid grid-cols-2 gap-2">
              <label className="text-xs font-bold text-mutedslate">Points<input type="number" value={editing.points} onChange={e => setEditing({
              ...editing,
              points: e.target.value
            })} className="mt-1 w-full border-2 border-slate-200 rounded-xl px-3 py-2 font-bold text-charcoal" /></label>
              <label className="text-xs font-bold text-mutedslate">XP<input type="number" value={editing.xp} onChange={e => setEditing({
              ...editing,
              xp: e.target.value
            })} className="mt-1 w-full border-2 border-slate-200 rounded-xl px-3 py-2 font-bold text-charcoal" /></label>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button onClick={() => setEditing(null)} className="font-bold py-2.5 rounded-full border-2 border-slate-200">Batal</button>
              <button onClick={saveEditing} className="font-bold py-2.5 rounded-full bg-peri hover:bg-peridark text-white transition">Simpan</button>
            </div>
          </div>
        </div>}

      {editingStaff && <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm" onClick={() => {
      setEditingStaff(null);
      setShowEditStaffPass(false);
    }}>
          <div className="animate-pop bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="font-extrabold text-lg">Edit Kasir {editingStaff.code}</h3>
            <label className="block mt-3 text-xs font-bold text-mutedslate">Nama</label>
            <input value={editingStaff.name} onChange={e => setEditingStaff({
          ...editingStaff,
          name: e.target.value
        })} className="mt-1 w-full border-2 border-slate-200 rounded-xl px-3 py-2 font-semibold" />
            <label className="block mt-3 text-xs font-bold text-mutedslate">Password baru</label>
            <div className="relative mt-1">
              <input value={editingStaff.pass} onChange={e => setEditingStaff({
            ...editingStaff,
            pass: e.target.value
          })} type={showEditStaffPass ? "text" : "password"} className="w-full border-2 border-slate-200 rounded-xl px-3 py-2 pr-11 font-semibold" />
              <button type="button" onClick={() => setShowEditStaffPass(v => !v)} aria-label={showEditStaffPass ? "Sembunyikan password" : "Tampilkan password"} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full text-mutedslate hover:bg-mist">
                <Icon name={showEditStaffPass ? "eye-off" : "eye"} className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button onClick={() => {
            setEditingStaff(null);
            setShowEditStaffPass(false);
          }} className="font-bold py-2.5 rounded-full border-2 border-slate-200">Batal</button>
              <button onClick={saveStaff} className="font-bold py-2.5 rounded-full bg-peri hover:bg-peridark text-white transition">Simpan</button>
            </div>
          </div>
        </div>}

      {showLogin && <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 bg-black/45 backdrop-blur-sm" onClick={() => setShowLogin(false)}>
          <div className="animate-pop bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl max-h-[92vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6" style={{
          background: "linear-gradient(120deg, #7C583A 0%, rgba(43,146,196,0.9) 60%, rgba(43,146,196,0.55) 100%)"
        }}>
              <div className="flex items-start justify-between text-white">
                <div>
                  <p className="font-extrabold text-xl">Selamat datang 👋</p>
                  <p className="text-sm text-white/80 mt-0.5">Login / daftar untuk kumpulkan poin & XP.</p>
                </div>
                <button onClick={() => setShowLogin(false)} className="p-2 rounded-full bg-white/20 hover:bg-white/30"><Icon name="x" className="w-4 h-4" /></button>
              </div>
              <div className="mt-4 flex bg-white/20 rounded-full p-1 text-sm font-bold">
                <button onClick={() => setAuthTab("login")} className={`flex-1 py-2 rounded-full transition ${authTab === "login" ? "bg-[#6F4E37]/80 text-white shadow" : "text-white/80 hover:text-white"}`}>Login</button>
                <button onClick={() => setAuthTab("daftar")} className={`flex-1 py-2 rounded-full transition ${authTab === "daftar" ? "bg-[#6F4E37]/80 text-white shadow" : "text-white/80 hover:text-white"}`}>Daftar</button>
              </div>
            </div>
            <div className="p-6">
              {authTab === "login" ? <div>
                  <label className="block text-sm font-bold text-charcoal">Email</label>
                  <input value={loginForm.email} onChange={e => setLoginForm({
              ...loginForm,
              email: e.target.value
            })} type="email" placeholder="nama@email.com" className="mt-1.5 w-full border-2 border-slate-200 rounded-2xl px-4 py-2.5 font-semibold" />
                  <label className="block mt-4 text-sm font-bold text-charcoal text-left">Password</label>
                  <div className="relative mt-1.5">
                    <input value={loginForm.pass} onChange={e => setLoginForm({
                ...loginForm,
                pass: e.target.value
              })} type={showLoginPass ? "text" : "password"} placeholder="••••••••" onKeyDown={e => {
                if (e.key === "Enter") doLogin();
              }} className="w-full border-2 border-slate-200 rounded-2xl px-4 py-2.5 pr-12 font-semibold" />
                    <button type="button" onClick={() => setShowLoginPass(v => !v)} aria-label={showLoginPass ? "Sembunyikan password" : "Tampilkan password"} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full text-mutedslate hover:bg-mist">
                      <Icon name={showLoginPass ? "eye-off" : "eye"} className="w-4 h-4" />
                    </button>
                  </div>
                  <button onClick={doLogin} className="mt-4 w-full inline-flex items-center justify-center gap-1.5 bg-peri hover:bg-peridark text-white font-bold py-3 rounded-full transition">
                    <Icon name="log-in" className="w-4 h-4" /> Login
                  </button>
                  <div className="mt-4 flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-extrabold bg-sky-100 text-sky-800 border border-sky-200 px-2.5 py-1 rounded-full">Mode Demo (Isi Cepat)</span>
                    <div className="flex gap-1.5">
                      <button onClick={() => setLoginForm({
                  email: "member@aurora.id",
                  pass: "member123",
                  role: "member"
                })} className="text-[11px] font-bold bg-white border px-2.5 py-1.5 rounded-full hover:border-peri">Member</button>
                      <button onClick={() => setLoginForm({
                  email: "admin@aurora.id",
                  pass: "admin123",
                  role: "admin"
                })} className="text-[11px] font-bold bg-white border px-2.5 py-1.5 rounded-full hover:border-peri">Admin</button>
                      <button onClick={() => setLoginForm({
                  email: "kasir@aurora.id",
                  pass: "kasir123",
                  role: "kasir"
                })} className="text-[11px] font-bold bg-white border px-2.5 py-1.5 rounded-full hover:border-peri">Kasir</button>
                    </div>
                  </div>
                </div> : <div>
                  <label className="block text-sm font-bold text-charcoal">Nama Lengkap</label>
                  <input value={regForm.nama} onChange={e => setRegForm({
              ...regForm,
              nama: e.target.value
            })} placeholder="cth: Rizky Ramadhan" className="mt-1.5 w-full border-2 border-slate-200 rounded-2xl px-4 py-2.5 font-semibold" />
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-bold text-charcoal">Umur</label>
                      <input value={regForm.umur} onChange={e => setRegForm({
                  ...regForm,
                  umur: e.target.value
                })} type="number" min="5" max="120" placeholder="24" className="mt-1.5 w-full border-2 border-slate-200 rounded-2xl px-4 py-2.5 font-semibold" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-charcoal">Email</label>
                      <input value={regForm.email} onChange={e => setRegForm({
                  ...regForm,
                  email: e.target.value
                })} type="email" placeholder="nama@email.com" className="mt-1.5 w-full border-2 border-slate-200 rounded-2xl px-4 py-2.5 font-semibold" />
                    </div>
                  </div>
                  <label className="block mt-4 text-sm font-bold text-charcoal text-left">Password Baru</label>
                  <div className="relative mt-1.5">
                    <input value={regForm.pass} onChange={e => setRegForm({
                ...regForm,
                pass: e.target.value
              })} type={showRegPass ? "text" : "password"} placeholder="min. 6 karakter" className="w-full border-2 border-slate-200 rounded-2xl px-4 py-2.5 pr-12 font-semibold" />
                    <button type="button" onClick={() => setShowRegPass(v => !v)} aria-label={showRegPass ? "Sembunyikan password" : "Tampilkan password"} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full text-mutedslate hover:bg-mist">
                      <Icon name={showRegPass ? "eye-off" : "eye"} className="w-4 h-4" />
                    </button>
                  </div>
                  <label className="block mt-4 text-sm font-bold text-charcoal text-left">Konfirmasi Password</label>
                  <div className="relative mt-1.5">
                    <input value={regForm.pass2} onChange={e => setRegForm({
                ...regForm,
                pass2: e.target.value
              })} type={showRegPass2 ? "text" : "password"} placeholder="ulangi password" onKeyDown={e => {
                if (e.key === "Enter") doRegister();
              }} className="w-full border-2 border-slate-200 rounded-2xl px-4 py-2.5 pr-12 font-semibold" />
                    <button type="button" onClick={() => setShowRegPass2(v => !v)} aria-label={showRegPass2 ? "Sembunyikan password" : "Tampilkan password"} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full text-mutedslate hover:bg-mist">
                      <Icon name={showRegPass2 ? "eye-off" : "eye"} className="w-4 h-4" />
                    </button>
                  </div>
                  <button onClick={doRegister} className="mt-4 w-full inline-flex items-center justify-center gap-1.5 bg-peri hover:bg-peridark text-white font-bold py-3 rounded-full transition">
                    <Icon name="plus" className="w-4 h-4" /> Buat Akun (+100 poin)
                  </button>
                  <p className="mt-3 text-center text-sm text-mutedslate">Sudah punya akun? <button onClick={() => setAuthTab("login")} className="font-bold text-peri underline">Login di sini</button></p>
                </div>}
            </div>
          </div>
        </div>}

      {}
      <div className="fixed bottom-4 right-4 z-[60] space-y-2 max-w-[calc(100vw-2rem)]">
        {toasts.map(t => <div key={t.id} className={`toast-in flex items-start gap-2.5 text-sm font-semibold text-white rounded-2xl px-4 py-3 shadow-2xl ${t.type === "error" ? "bg-red-600" : "bg-charcoal"}`}>
            <Icon name={t.type === "error" ? "triangle-alert" : "check"} className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{t.msg}</span>
          </div>)}
      </div>
    </div>;
}
export default App;