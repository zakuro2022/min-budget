import React, { useState, useEffect, useRef } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import {
  Plus, Trash2, Receipt, ShoppingBag, PiggyBank, CreditCard,
  TrendingUp, RotateCcw,
} from "lucide-react";

/* ---------- palette & type meta ---------- */
const INK = "#1A1A18";
const PAPER = "#FAF9F6";
const PAPER_ALT = "#F1EFE9";
const STAMP_RED = "#C23B22";
const BRASS = "#A9791F";
const SLATE = "#5B6168";
const SAGE = "#5E8368";
const LINE = "#D8D5CC";

const TYPES = {
  Inkomst: { label: "Inkomst", color: SAGE, icon: TrendingUp, sign: 1 },
  Räkning: { label: "Räkning", color: INK, icon: Receipt, sign: -1 },
  Utgift: { label: "Utgift", color: STAMP_RED, icon: ShoppingBag, sign: -1 },
  Sparande: { label: "Sparande", color: BRASS, icon: PiggyBank, sign: -1 },
  Skuld: { label: "Skuld", color: SLATE, icon: CreditCard, sign: -1 },
};
const TYPE_ORDER = ["Inkomst", "Räkning", "Utgift", "Sparande", "Skuld"];

const STORAGE_KEY = "smart-budget:state";

const seedCategories = [
  { id: "c1", name: "Lön", type: "Inkomst", budget: 31900 },
  { id: "c2", name: "Extrainkomst", type: "Inkomst", budget: 0 },
  { id: "c3", name: "Hyra/Bostadslån", type: "Räkning", budget: 16450 },
  { id: "c4", name: "Streaming", type: "Räkning", budget: 406 },
  { id: "c5", name: "Mat", type: "Utgift", budget: 3000 },
  { id: "c6", name: "Hämtmat", type: "Utgift", budget: 800 },
  { id: "c7", name: "Kläder", type: "Utgift", budget: 500 },
  { id: "c8", name: "Nöje & övrigt", type: "Utgift", budget: 700 },
  { id: "c9", name: "Investeringar", type: "Sparande", budget: 1000 },
  { id: "c10", name: "e-sparkonto", type: "Sparande", budget: 2500 },
  { id: "c11", name: "Revolut", type: "Sparande", budget: 5000 },
  { id: "c12", name: "Västtrafik", type: "Räkning", budget: 1335 },
  { id: "c13", name: "Gym Hagabadet", type: "Räkning", budget: 1000 },
  { id: "c14", name: "A-kassa", type: "Räkning", budget: 149 },
  { id: "c15", name: "iCloud+", type: "Räkning", budget: 129 },
  { id: "c16", name: "Vision (fackförbund)", type: "Räkning", budget: 315 },
  { id: "c17", name: "Försäkring/avgift (nyckelkund)", type: "Räkning", budget: 45 },
  { id: "c19", name: "AI appar", type: "Räkning", budget: 526 },
  { id: "c20", name: "Hälsokost", type: "Utgift", budget: 0 },
];

function isoToday() {
  return new Date().toISOString().slice(0, 10);
}

const seedTransactions = [
  { id: "t1", date: "2026-06-27", categoryId: "c1", amount: 31900, note: "Lön" },
  { id: "t2", date: "2026-06-27", categoryId: "c3", amount: 16450, note: "Danka Johansson – hyra och bostadslån, autogiro (lönekonto)" },
  { id: "t3", date: "2026-06-27", categoryId: "c10", amount: 2500, note: "Autogiro till e-sparkonto (lönekonto)" },
  { id: "t4", date: "2026-06-27", categoryId: "c11", amount: 5000, note: "Fondöverföring till Revolut, autogiro" },
  { id: "t5", date: "2026-06-27", categoryId: "c13", amount: 1000, note: "Gym Hagabadet, autogiro (lönekonto)" },
  { id: "t6", date: "2026-06-27", categoryId: "c14", amount: 149, note: "A-kassa, autogiro (lönekonto)" },
  { id: "t7", date: "2026-07-04", categoryId: "c4", amount: 49, note: "Disney+" },
  { id: "t8", date: "2026-06-29", categoryId: "c15", amount: 129, note: "iCloud+ 2TB, Apple.com/bill" },
  { id: "t9", date: "2026-06-28", categoryId: "c16", amount: 315, note: "Vision medlemsavgift (lönekonto)" },
  { id: "t10", date: "2026-06-28", categoryId: "c17", amount: 45, note: "Pris nyckelkund (oklar kategori, justera vid behov) (lönekonto)" },
  { id: "t11", date: "2026-07-06", categoryId: "c4", amount: 69, note: "SkyShowtime" },
  { id: "t12", date: "2026-07-09", categoryId: "c4", amount: 129, note: "Spotify" },
  { id: "t15", date: "2026-07-24", categoryId: "c4", amount: 159, note: "Max (HBO Max)" },
  { id: "t13", date: "2026-07-01", categoryId: "c12", amount: 1335, note: "Västtrafik-kort, laddning" },
  { id: "t14", date: "2026-07-13", categoryId: "c19", amount: 249, note: "Claude Pro - Monthly, Apple.com/bill" },
  { id: "t16", date: "2026-07-24", categoryId: "c19", amount: 277, note: "Lovable.dev (25 EUR, kurs ~11,08)" },
  { id: "t17", date: "2026-07-03", categoryId: "c6", amount: 134, note: "McDonald's" },
  { id: "t18", date: "2026-07-03", categoryId: "c8", amount: 216, note: "Airport Lounge pass" },
  { id: "t19", date: "2026-07-04", categoryId: "c5", amount: 654, note: "ICA" },
  { id: "t20", date: "2026-07-04", categoryId: "c6", amount: 390, note: "Restaurang Kungstorget" },
  { id: "t21", date: "2026-07-04", categoryId: "c8", amount: 39, note: "Pressbyrån" },
  { id: "t22", date: "2026-07-05", categoryId: "c6", amount: 230, note: "Elio" },
  { id: "t23", date: "2026-07-07", categoryId: "c7", amount: 159, note: "Åhléns" },
  { id: "t24", date: "2026-07-08", categoryId: "c6", amount: 220, note: "Restaurang Johanna/Joha" },
  { id: "t25", date: "2026-07-08", categoryId: "c8", amount: 43, note: "Espresso House" },
  { id: "t26", date: "2026-07-09", categoryId: "c6", amount: 235, note: "Restaurang Kungstorget" },
  { id: "t27", date: "2026-07-09", categoryId: "c8", amount: 39, note: "Pressbyrån" },
  { id: "t28", date: "2026-07-10", categoryId: "c5", amount: 105, note: "ICA" },
  { id: "t29", date: "2026-07-10", categoryId: "c11", amount: 105, note: "Premium-paketet (Revolut)" },
  { id: "t30", date: "2026-07-12", categoryId: "c5", amount: 238, note: "ICA" },
  { id: "t31", date: "2026-07-12", categoryId: "c6", amount: 160, note: "Delivery Hero Sweden AB" },
  { id: "t32", date: "2026-07-12", categoryId: "c8", amount: 110, note: "Kaffelabbet" },
  { id: "t33", date: "2026-07-13", categoryId: "c5", amount: 286, note: "ICA" },
  { id: "t34", date: "2026-07-15", categoryId: "c5", amount: 82, note: "ICA" },
  { id: "t35", date: "2026-07-15", categoryId: "c9", amount: 129, note: "Mats Svensson 2000 Ab" },
  { id: "t36", date: "2026-07-16", categoryId: "c20", amount: 238, note: "Sp Kalla" },
  { id: "t37", date: "2026-07-16", categoryId: "c5", amount: 26, note: "Lidl" },
  { id: "t38", date: "2026-07-16", categoryId: "c8", amount: 535, note: "Optimalprint" },
];

function fmtKr(n) {
  const r = Math.round(n || 0);
  return r.toLocaleString("sv-SE") + " kr";
}

function parseAmount(input) {
  if (typeof input === "number") return isNaN(input) ? 0 : input;
  if (typeof input !== "string") return 0;
  const normalized = input.trim().replace(/\s/g, "").replace(",", ".");
  const n = parseFloat(normalized);
  return isNaN(n) ? 0 : n;
}

function payPeriod() {
  const now = new Date();
  let end = new Date(now.getFullYear(), now.getMonth(), 27);
  if (now.getDate() >= 27) {
    end = new Date(now.getFullYear(), now.getMonth() + 1, 27);
  }
  const start = new Date(end.getFullYear(), end.getMonth() - 1, 27);
  return { start, end };
}

function daysLeftInPeriod() {
  const { end } = payPeriod();
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diff = Math.round((end - startOfToday) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
}

function periodLabel() {
  const { end } = payPeriod();
  const periodEnd = new Date(end.getFullYear(), end.getMonth() + 1, end.getDate() - 1);
  const fmt = (d) => d.toLocaleDateString("sv-SE", { day: "numeric", month: "long" });
  return `${fmt(end)} – ${fmt(periodEnd)} ${periodEnd.getFullYear()}`;
}

/* ---------- small UI atoms ---------- */
function DashedRule({ margin = "14px 0" }) {
  return <div style={{ borderTop: `1.5px dashed ${LINE}`, margin }} />;
}

function LineItem({ label, value, bold, color }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 8, padding: "4px 0" }}>
      <span style={{ fontFamily: "Inter, sans-serif", fontSize: 13.5, color: bold ? INK : "#3a3a36", whiteSpace: "nowrap" }}>
        {label}
      </span>
      <span style={{ flex: 1, borderBottom: `1px dotted ${LINE}`, transform: "translateY(-3px)" }} />
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: bold ? 700 : 500, fontSize: 13.5, color: color || INK, whiteSpace: "nowrap" }}>
        {value}
      </span>
    </div>
  );
}

function Stamp({ ok }) {
  const color = ok ? SAGE : STAMP_RED;
  return (
    <div
      style={{
        position: "absolute",
        right: 14,
        bottom: 14,
        transform: "rotate(-9deg)",
        border: `3px solid ${color}`,
        borderRadius: 8,
        padding: "6px 10px",
        color,
        fontFamily: "'Space Grotesk', sans-serif",
        fontWeight: 700,
        fontSize: 12.5,
        letterSpacing: "0.06em",
        mixBlendMode: "multiply",
        opacity: 0.85,
        pointerEvents: "none",
        background: `repeating-linear-gradient(0deg, ${color}0d 0 1px, transparent 1px 3px)`,
      }}
    >
      {ok ? "✓ INOM BUDGET" : "! ÖVER BUDGET"}
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily: "'Space Grotesk', sans-serif",
        fontWeight: 600,
        fontSize: 13,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "8px 4px",
        color: active ? INK : "#9b968a",
        borderBottom: active ? `2.5px solid ${STAMP_RED}` : "2.5px solid transparent",
        transition: "color .15s",
      }}
    >
      {children}
    </button>
  );
}

function Field({ label, children }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 3, fontFamily: "Inter, sans-serif", fontSize: 11, color: SLATE, flex: 1, minWidth: 100 }}>
      {label}
      {children}
    </label>
  );
}

const inputStyle = {
  fontFamily: "Inter, sans-serif",
  fontSize: 13.5,
  padding: "7px 10px",
  border: `1.5px solid ${LINE}`,
  borderRadius: 6,
  background: "#fff",
  color: INK,
  outline: "none",
};

/* ---------- error boundary so a crash never shows a blank screen ---------- */
class BudgetErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  handleReset = async () => {
    try {
      await window.storage.delete(STORAGE_KEY);
    } catch (e) {
      // ignore — key may not exist
    }
    window.location.reload();
  };
  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight: "100vh", background: PAPER, fontFamily: "Inter, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ maxWidth: 380, background: "#fff", border: `1px solid ${LINE}`, borderRadius: 10, padding: 24, textAlign: "center" }}>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 18, color: INK, marginBottom: 8 }}>
              Något gick fel
            </div>
            <div style={{ fontSize: 13, color: SLATE, marginBottom: 16 }}>
              Appen kraschade, troligen på grund av sparad data den inte kunde läsa. Du kan återställa till exempeldata och börja om — dina poster i Excel-filen påverkas inte.
            </div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#b3afa3", marginBottom: 16, wordBreak: "break-word" }}>
              {String(this.state.error?.message || this.state.error)}
            </div>
            <button
              onClick={this.handleReset}
              style={{ background: INK, color: "#fff", border: "none", borderRadius: 6, padding: "10px 18px", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 13, cursor: "pointer" }}
            >
              Rensa data och börja om
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ---------- main app ---------- */
export default function SmartBudget() {
  return (
    <BudgetErrorBoundary>
      <SmartBudgetInner />
    </BudgetErrorBoundary>
  );
}

function SmartBudgetInner() {
  const [loaded, setLoaded] = useState(false);
  const [categories, setCategories] = useState(seedCategories);
  const [transactions, setTransactions] = useState(seedTransactions);
  const [startCapital, setStartCapital] = useState("683");
  const [tab, setTab] = useState("overview");
  const didInit = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.get(STORAGE_KEY);
        if (res && res.value) {
          const parsed = JSON.parse(res.value);
          setCategories(parsed.categories || seedCategories);
          setTransactions(parsed.transactions || seedTransactions);
          setStartCapital(parsed.startCapital ?? "683");
        }
      } catch (e) {
        // no saved state yet — keep seed data
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    if (!didInit.current) { didInit.current = true; return; }
    const payload = JSON.stringify({ categories, transactions, startCapital });
    window.storage.set(STORAGE_KEY, payload).catch(() => {});
  }, [categories, transactions, startCapital, loaded]);

  const catById = Object.fromEntries(categories.map((c) => [c.id, c]));

  const totalsByType = {};
  TYPE_ORDER.forEach((t) => (totalsByType[t] = { budget: 0, utfall: 0 }));
  categories.forEach((c) => {
    if (totalsByType[c.type]) totalsByType[c.type].budget += parseAmount(c.budget);
  });
  transactions.forEach((tx) => {
    const cat = catById[tx.categoryId];
    if (cat && totalsByType[cat.type]) totalsByType[cat.type].utfall += Number(tx.amount) || 0;
  });

  const inkomstUtfall = totalsByType.Inkomst.utfall;
  const outflowUtfall = ["Räkning", "Utgift", "Sparande", "Skuld"].reduce(
    (s, t) => s + totalsByType[t].utfall, 0
  );
  const outflowBudget = ["Räkning", "Utgift", "Sparande", "Skuld"].reduce(
    (s, t) => s + totalsByType[t].budget, 0
  );
  const kvarAttSpendera = parseAmount(startCapital) + inkomstUtfall - outflowUtfall;
  const inomBudget = outflowUtfall <= outflowBudget;
  const lonekontoBehov = transactions.reduce(
    (sum, tx) => (tx.note && tx.note.includes("(lönekonto)") ? sum + parseAmount(tx.amount) : sum),
    0
  );

  const barData = TYPE_ORDER.map((t) => ({
    name: TYPES[t].label,
    Budget: totalsByType[t].budget,
    Utfall: totalsByType[t].utfall,
  }));

  const donutData = ["Räkning", "Utgift", "Sparande", "Skuld"]
    .map((t) => ({ name: TYPES[t].label, value: totalsByType[t].utfall, color: TYPES[t].color }))
    .filter((d) => d.value > 0);

  function addTransaction(tx) {
    setTransactions((prev) => [{ ...tx, id: "t" + Date.now() }, ...prev]);
  }
  function deleteTransaction(id) {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }
  function addCategory(cat) {
    setCategories((prev) => [...prev, { ...cat, id: "c" + Date.now() }]);
  }
  function updateCategoryBudget(id, budget) {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, budget } : c)));
  }
  function deleteCategory(id) {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    setTransactions((prev) => prev.filter((t) => t.categoryId !== id));
  }
  function toggleConfirmed(id) {
    setTransactions((prev) => prev.map((t) => t.id === id ? { ...t, confirmed: !t.confirmed } : t));
  }
  const [confirmingReset, setConfirmingReset] = useState(false);
  function resetAll() {
    if (!confirmingReset) {
      setConfirmingReset(true);
      setTimeout(() => setConfirmingReset(false), 3000);
      return;
    }
    setCategories(seedCategories);
    setTransactions(seedTransactions);
    setStartCapital("683");
    setConfirmingReset(false);
  }

  return (
    <div style={{ minHeight: "100vh", background: PAPER, fontFamily: "Inter, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;700&display=swap');
        * { box-sizing: border-box; }
        ::selection { background: ${STAMP_RED}33; }
        input:focus, select:focus, button:focus-visible {
          outline: 2px solid ${STAMP_RED}; outline-offset: 1px;
        }
        .sb-card {
          background: #fff; border: 1px solid ${LINE}; border-radius: 10px;
        }
        .sb-row:hover { background: ${PAPER_ALT}; }
        @media (max-width: 760px) {
          .sb-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div style={{ maxWidth: 980, margin: "0 auto", padding: "18px 16px 60px" }}>
        {/* header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 20, letterSpacing: "-0.01em", color: INK }}>
              SMART BUDGET
            </div>
            <div style={{ fontSize: 11.5, color: SLATE, marginTop: 1 }}>{periodLabel()} · sparas automatiskt</div>
          </div>
          <button
            onClick={resetAll}
            style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: confirmingReset ? STAMP_RED : SLATE, background: "none", border: `1px solid ${confirmingReset ? STAMP_RED : LINE}`, borderRadius: 6, padding: "5px 9px", cursor: "pointer", flexShrink: 0 }}
          >
            <RotateCcw size={12} /> {confirmingReset ? "Bekräfta?" : "Återställ"}
          </button>
        </div>

        <div style={{ display: "flex", gap: 16, overflowX: "auto", whiteSpace: "nowrap", borderBottom: `1px solid ${LINE}`, marginBottom: 18 }}>
          <TabButton active={tab === "overview"} onClick={() => setTab("overview")}>Översikt</TabButton>
          <TabButton active={tab === "transactions"} onClick={() => setTab("transactions")}>Transaktioner</TabButton>
          <TabButton active={tab === "categories"} onClick={() => setTab("categories")}>Kategorier</TabButton>
        </div>

        {tab === "overview" && (
          <Overview
            kvarAttSpendera={kvarAttSpendera}
            inomBudget={inomBudget}
            totalsByType={totalsByType}
            barData={barData}
            donutData={donutData}
            startCapital={startCapital}
            setStartCapital={setStartCapital}
            outflowBudget={outflowBudget}
            outflowUtfall={outflowUtfall}
            lonekontoBehov={lonekontoBehov}
          />
        )}
        {tab === "transactions" && (
          <Transactions
            categories={categories}
            transactions={transactions}
            catById={catById}
            onAdd={addTransaction}
            onDelete={deleteTransaction}
            onToggleConfirmed={toggleConfirmed}
          />
        )}
        {tab === "categories" && (
          <Categories
            categories={categories}
            totalsByType={totalsByType}
            onAdd={addCategory}
            onUpdateBudget={updateCategoryBudget}
            onDelete={deleteCategory}
          />
        )}
      </div>
    </div>
  );
}

/* ---------- Overview ---------- */
function Overview({ kvarAttSpendera, inomBudget, totalsByType, barData, donutData, startCapital, setStartCapital, outflowBudget, outflowUtfall, lonekontoBehov }) {
  return (
    <div className="sb-grid" style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 20 }}>
      <div>
        {/* receipt card */}
        <div className="sb-card" style={{ position: "relative", padding: "20px 20px 64px", overflow: "hidden" }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: SLATE, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Kvitto · {new Date().toLocaleDateString("sv-SE")}
          </div>
          <DashedRule margin="10px 0 14px" />
          <div style={{ fontSize: 11.5, color: SLATE, marginBottom: 2 }}>Kvar att spendera</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 34, color: kvarAttSpendera < 0 ? STAMP_RED : INK, lineHeight: 1.1 }}>
            {fmtKr(kvarAttSpendera)}
          </div>
          <DashedRule />
          <LineItem label="Dagar kvar av perioden" value={`${daysLeftInPeriod()} dagar`} />
          <LineItem label="Budgeterat (ej inkomst)" value={fmtKr(outflowBudget)} />
          <LineItem label="Spenderat hittills" value={fmtKr(outflowUtfall)} bold color={outflowUtfall > outflowBudget ? STAMP_RED : INK} />
          <DashedRule />
          <Field label="Startkapital / överskott föregående månad">
            <input
              type="text"
              inputMode="decimal"
              value={startCapital}
              onChange={(e) => setStartCapital(e.target.value)}
              style={{ ...inputStyle, fontFamily: "'JetBrains Mono', monospace" }}
            />
          </Field>
          <Stamp ok={inomBudget} />
        </div>

        {lonekontoBehov > 0 && (
          <div className="sb-card" style={{ marginTop: 16, padding: 18, borderColor: BRASS }}>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 12.5, color: SLATE, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>
              Behövs kvar på lönekontot
            </div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 26, color: BRASS }}>
              {fmtKr(lonekontoBehov)}
            </div>
            <div style={{ fontSize: 11.5, color: SLATE, marginTop: 4 }}>
              Summan av poster märkta "(lönekonto)" — kommande autogirodragningar
            </div>
          </div>
        )}

        <div className="sb-card" style={{ marginTop: 16, padding: 18 }}>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 13, marginBottom: 10, color: INK }}>
            Per kategorityp
          </div>
          {TYPE_ORDER.map((t) => {
            const meta = TYPES[t];
            const Icon = meta.icon;
            const d = totalsByType[t];
            return (
              <div key={t} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                  <Icon size={13} color={meta.color} />
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: INK }}>{meta.label}</span>
                </div>
                <LineItem label="Budget" value={fmtKr(d.budget)} />
                <LineItem label="Utfall" value={fmtKr(d.utfall)} color={meta.color} />
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="sb-card" style={{ padding: 18 }}>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 14, marginBottom: 10, color: INK }}>
            Budget vs utfall
          </div>
          <div style={{ width: "100%", height: 240 }}>
            <ResponsiveContainer>
              <BarChart data={barData} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
                <CartesianGrid stroke={LINE} vertical={false} />
                <XAxis dataKey="name" interval={0} tick={{ fontSize: 10.5, fontFamily: "Inter" }} axisLine={{ stroke: LINE }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fontFamily: "Inter" }} axisLine={false} tickLine={false} width={56} tickFormatter={(v) => v.toLocaleString("sv-SE")} />
                <Tooltip formatter={(v) => fmtKr(v)} contentStyle={{ fontFamily: "Inter", fontSize: 12, borderRadius: 8, border: `1px solid ${LINE}` }} />
                <Bar dataKey="Budget" fill={INK} radius={[3, 3, 0, 0]} />
                <Bar dataKey="Utfall" fill={SAGE} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="sb-card" style={{ padding: 18 }}>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 14, marginBottom: 4, color: INK }}>
            Vart pengarna tog vägen
          </div>
          {donutData.length === 0 ? (
            <div style={{ fontSize: 12.5, color: SLATE, padding: "20px 0" }}>Inga utgifter registrerade ännu.</div>
          ) : (
            <div style={{ width: "100%", height: 240, display: "flex", alignItems: "center" }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={donutData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={88} paddingAngle={2}>
                    {donutData.map((d, i) => (
                      <Cell key={i} fill={d.color} stroke="#fff" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => fmtKr(v)} contentStyle={{ fontFamily: "Inter", fontSize: 12, borderRadius: 8, border: `1px solid ${LINE}` }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 4 }}>
            {donutData.map((d, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12 }}>
                <span style={{ width: 9, height: 9, borderRadius: 2, background: d.color, display: "inline-block" }} />
                {d.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Transactions ---------- */
function Transactions({ categories, transactions, catById, onAdd, onDelete, onToggleConfirmed }) {
  const [date, setDate] = useState(isoToday());
  const [categoryId, setCategoryId] = useState(categories[0]?.id || "");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [sortBy, setSortBy] = useState("date");

  function submit(e) {
    e.preventDefault();
    if (!categoryId || !amount) return;
    onAdd({ date, categoryId, amount: parseAmount(amount), note });
    setAmount("");
    setNote("");
  }

  const sorted = [...transactions].sort((a, b) => {
    if (sortBy === "amount") return Math.abs(b.amount) - Math.abs(a.amount);
    if (sortBy === "category") {
      const an = catById[a.categoryId]?.name || "";
      const bn = catById[b.categoryId]?.name || "";
      return an.localeCompare(bn, "sv");
    }
    return a.date < b.date ? 1 : -1;
  });

  const pendingCount = transactions.filter((t) => !t.confirmed).length;

  return (
    <div>
      <form onSubmit={submit} className="sb-card" style={{ padding: "14px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 12px", marginBottom: 14 }}>
        <Field label="Datum">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={inputStyle} required />
        </Field>
        <Field label="Kategori">
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} style={inputStyle} required>
            {TYPE_ORDER.map((t) => {
              const opts = categories.filter((c) => c.type === t);
              if (opts.length === 0) return null;
              return (
                <optgroup key={t} label={TYPES[t].label}>
                  {opts.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </optgroup>
              );
            })}
          </select>
        </Field>
        <Field label="Belopp (kr)">
          <input type="text" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} style={{ ...inputStyle, fontFamily: "'JetBrains Mono', monospace" }} required />
        </Field>
        <Field label="Kommentar">
          <input type="text" value={note} onChange={(e) => setNote(e.target.value)} style={inputStyle} placeholder="valfritt" />
        </Field>
        <button type="submit" style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: INK, color: "#fff", border: "none", borderRadius: 6, padding: "9px 0", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
          <Plus size={15} /> Lägg till
        </button>
      </form>

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
        <span style={{ fontSize: 12, color: SLATE }}>Sortera:</span>
        {[
          { key: "date", label: "Datum" },
          { key: "amount", label: "Belopp" },
          { key: "category", label: "Kategori" },
        ].map((opt) => (
          <button
            key={opt.key}
            onClick={() => setSortBy(opt.key)}
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 12,
              fontWeight: 600,
              padding: "5px 10px",
              borderRadius: 6,
              cursor: "pointer",
              border: `1px solid ${sortBy === opt.key ? INK : LINE}`,
              background: sortBy === opt.key ? INK : "#fff",
              color: sortBy === opt.key ? "#fff" : SLATE,
            }}
          >
            {opt.label}
          </button>
        ))}
        {pendingCount > 0 && (
          <span style={{ marginLeft: "auto", fontSize: 12, color: STAMP_RED, fontWeight: 600 }}>
            {pendingCount} ej bekräftad{pendingCount > 1 ? "e" : ""}
          </span>
        )}
      </div>

      <div className="sb-card">
        {sorted.length === 0 && (
          <div style={{ padding: 24, fontSize: 13, color: SLATE, textAlign: "center" }}>Inga transaktioner ännu.</div>
        )}
        {sorted.map((tx) => {
          const cat = catById[tx.categoryId];
          const meta = cat ? TYPES[cat.type] : null;
          const confirmed = !!tx.confirmed;
          return (
            <div key={tx.id} className="sb-row" style={{ display: "flex", flexDirection: "column", gap: 2, padding: "9px 14px", borderBottom: `1px solid ${LINE}`, opacity: confirmed ? 0.45 : 1, transition: "opacity .2s" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button
                  onClick={() => onToggleConfirmed(tx.id)}
                  aria-label={confirmed ? "Avmarkera" : "Bekräfta dragning"}
                  style={{
                    flexShrink: 0,
                    width: 19,
                    height: 19,
                    borderRadius: 5,
                    border: `2px solid ${confirmed ? SAGE : LINE}`,
                    background: confirmed ? SAGE : "#fff",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: 11,
                    fontWeight: 700,
                    transition: "all .15s",
                  }}
                >
                  {confirmed ? "✓" : ""}
                </button>
                <span style={{ fontSize: 13, fontWeight: 500, color: confirmed ? SLATE : INK, flex: 1, minWidth: 0, overflowWrap: "break-word", textDecoration: confirmed ? "line-through" : "none" }}>
                  {cat ? cat.name : "(borttagen)"}
                </span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 13, color: confirmed ? SLATE : (meta ? meta.color : INK), whiteSpace: "nowrap", flexShrink: 0 }}>
                  {meta?.sign === 1 ? "+" : "−"}{fmtKr(Math.abs(tx.amount))}
                </span>
                <button onClick={() => onDelete(tx.id)} style={{ background: "none", border: "none", color: "#c5c1bb", cursor: "pointer", padding: "2px 4px", flexShrink: 0 }} aria-label="Ta bort">
                  <Trash2 size={14} />
                </button>
              </div>
              <div style={{ display: "flex", gap: 8, paddingLeft: 27 }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#9b968a", flexShrink: 0 }}>{tx.date}</span>
                {tx.note && (
                  <span style={{ fontSize: 11.5, color: "#9b968a", minWidth: 0, overflowWrap: "break-word" }}>{tx.note}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


/* ---------- Categories ---------- */
function Categories({ categories, totalsByType, onAdd, onUpdateBudget, onDelete }) {
  const [name, setName] = useState("");
  const [type, setType] = useState("Utgift");
  const [budget, setBudget] = useState("");

  function submit(e) {
    e.preventDefault();
    if (!name || !budget) return;
    onAdd({ name, type, budget: parseAmount(budget) });
    setName("");
    setBudget("");
  }

  return (
    <div>
      <form onSubmit={submit} className="sb-card" style={{ padding: 16, display: "flex", flexWrap: "wrap", gap: 10, alignItems: "flex-end", marginBottom: 20 }}>
        <Field label="Namn">
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} placeholder="t.ex. Gym" required />
        </Field>
        <Field label="Typ">
          <select value={type} onChange={(e) => setType(e.target.value)} style={inputStyle}>
            {TYPE_ORDER.map((t) => (
              <option key={t} value={t}>{TYPES[t].label}</option>
            ))}
          </select>
        </Field>
        <Field label="Budget (kr/månad)">
          <input type="text" inputMode="decimal" value={budget} onChange={(e) => setBudget(e.target.value)} style={{ ...inputStyle, fontFamily: "'JetBrains Mono', monospace" }} required />
        </Field>
        <button type="submit" style={{ display: "flex", alignItems: "center", gap: 6, background: INK, color: "#fff", border: "none", borderRadius: 6, padding: "9px 16px", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
          <Plus size={15} /> Lägg till kategori
        </button>
      </form>

      <div style={{ display: "grid", gap: 16 }}>
        {TYPE_ORDER.map((t) => {
          const meta = TYPES[t];
          const Icon = meta.icon;
          const items = categories.filter((c) => c.type === t);
          return (
            <div key={t} className="sb-card">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: `1px solid ${LINE}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Icon size={15} color={meta.color} />
                  <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 13.5, color: INK }}>{meta.label}</span>
                </div>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12.5, color: SLATE }}>
                  Budget {fmtKr(totalsByType[t].budget)}
                </span>
              </div>
              {items.length === 0 && (
                <div style={{ padding: "12px 16px", fontSize: 12.5, color: SLATE }}>Ingen kategori ännu.</div>
              )}
              {items.map((c) => (
                <div key={c.id} className="sb-row" style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 16px", borderBottom: `1px solid ${LINE}` }}>
                  <span style={{ fontSize: 13.5, color: INK, flex: 1 }}>{c.name}</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={c.budget}
                    onChange={(e) => onUpdateBudget(c.id, e.target.value)}
                    style={{ ...inputStyle, width: 100, fontFamily: "'JetBrains Mono', monospace", padding: "5px 8px", fontSize: 13 }}
                  />
                  <button onClick={() => onDelete(c.id)} style={{ background: "none", border: "none", color: "#b3afa3", cursor: "pointer", padding: 4 }} aria-label="Ta bort">
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
