"use client";

import Image from "next/image";
import * as React from "react";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Download,
  Eye,
  FileText,
  Landmark,
  LockKeyhole,
  Printer,
  Plus,
  Receipt,
  RotateCcw,
  Scale,
  UnlockKeyhole,
  Wallet,
} from "lucide-react";
import {
  eachDayOfInterval,
  eachMonthOfInterval,
  eachWeekOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  parseISO,
} from "date-fns";
import { es } from "date-fns/locale";
import { PageHeader } from "@/components/shared/page-header";
import { KpiCard } from "@/components/shared/kpi-card";
import { DataTable, type Column, type FilterConfig } from "@/components/shared/data-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { SimpleBarChart, type BarDatum } from "@/components/charts/charts";
import {
  ACCOUNTING_CATEGORY_LABELS,
  ACCOUNTING_OPENING_BALANCE,
  ACCOUNTING_PAYMENT_LABELS,
} from "@/mocks/accounting";
import {
  useDemoStore,
  type NewAccountingAuditEventInput,
  type NewAccountingCommissionInput,
  type NewAccountingEntryInput,
  type NewAccountingFixedExpenseInput,
  type NewAccountingPayableInput,
  type NewAccountingPeriodCloseInput,
  type NewAccountingReceivableInput,
} from "@/stores/demo-store";
import { exportToCsv } from "@/lib/csv";
import { formatDate } from "@/lib/format";
import { cn, formatMXN, formatNumber } from "@/lib/utils";
import { toast } from "@/components/ui/toast";
import type { BadgeTone } from "@/constants";
import type {
  AccountingAccount,
  AccountingAuditEvent,
  AccountingCommission,
  AccountingCategory,
  AccountingDeductibleStatus,
  AccountingEntry,
  AccountingEntryType,
  AccountingFixedExpense,
  AccountingInvoiceStatus,
  AccountingPaymentMethod,
  AccountingPayable,
  AccountingPeriodClose,
  AccountingReceivable,
} from "@/types";

type ReportMode = "week" | "month" | "year";
type CaptureDialog = "receivable" | "payable" | "fixed" | "commission" | "adjustment" | "closePeriod" | "closureDetail" | "reopenPeriod" | "printReport" | null;
type PrintReportType = "accounting" | "tax" | "closure";

interface CloseControlItem {
  label: string;
  detail: string;
  tone: BadgeTone;
  done: boolean;
  value?: string;
}

interface AdminAlertItem {
  title: string;
  detail: string;
  tone: BadgeTone;
  value: string;
}

const REPORT_LABELS: Record<PrintReportType, string> = {
  accounting: "Reporte contable",
  tax: "Reporte fiscal",
  closure: "Reporte de cierre",
};

interface PeriodOption {
  id: string;
  label: string;
  shortLabel: string;
  start: string;
  end: string;
}

const WEEKLY_PERIODS: PeriodOption[] = [
  { id: "week-2026-07-06", label: "Semana 06-12 julio 2026", shortLabel: "06-12 jul", start: "2026-07-06", end: "2026-07-12" },
  { id: "week-2026-07-13", label: "Semana 13-19 julio 2026", shortLabel: "13-19 jul", start: "2026-07-13", end: "2026-07-19" },
  { id: "week-2026-07-27", label: "Semana 27 julio-02 agosto 2026", shortLabel: "27 jul-02 ago", start: "2026-07-27", end: "2026-08-02" },
  { id: "week-2026-08-03", label: "Semana 03-09 agosto 2026", shortLabel: "03-09 ago", start: "2026-08-03", end: "2026-08-09" },
];

const MONTHLY_PERIODS: PeriodOption[] = [
  { id: "month-2026-07", label: "Julio 2026", shortLabel: "Jul 2026", start: "2026-07-01", end: "2026-07-31" },
  { id: "month-2026-08", label: "Agosto 2026", shortLabel: "Ago 2026", start: "2026-08-01", end: "2026-08-31" },
];

const YEARLY_PERIODS: PeriodOption[] = [
  { id: "year-2026", label: "Año 2026", shortLabel: "2026", start: "2026-01-01", end: "2026-12-31" },
];

const ACCOUNTING_TODAY = "2026-08-04";
const ACCOUNTING_SOON_DATE = "2026-08-08";

const CATEGORY_OPTIONS = Object.entries(ACCOUNTING_CATEGORY_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const TYPE_LABELS: Record<AccountingEntryType, string> = {
  ingreso: "Ingreso",
  egreso: "Egreso",
};

const ACCOUNT_LABELS: Record<AccountingAccount, string> = {
  caja: "Caja",
  banco: "Banco",
};

const INVOICE_STATUS_LABELS: Record<AccountingInvoiceStatus, string> = {
  no_requiere: "No requiere factura",
  por_facturar: "Por facturar",
  facturada: "Facturada",
};

const DEDUCTIBLE_STATUS_LABELS: Record<AccountingDeductibleStatus, string> = {
  deducible: "Sí es deducible",
  no_deducible: "No es deducible",
};

const DEFAULT_ENTRY: NewAccountingEntryInput = {
  date: "2026-08-04",
  concept: "",
  type: "ingreso",
  category: "traslados",
  paymentMethod: "efectivo",
  account: "caja",
  amount: 0,
  reference: "",
  status: "conciliado",
  invoiceStatus: "por_facturar",
  invoiceFolio: "",
  deductibleStatus: "deducible",
  notes: "",
};

const DEFAULT_RECEIVABLE: NewAccountingReceivableInput = {
  client: "",
  concept: "",
  total: 0,
  paid: 0,
  dueDate: "2026-08-08",
  status: "pendiente",
};

const DEFAULT_PAYABLE: NewAccountingPayableInput = {
  provider: "",
  concept: "",
  amount: 0,
  dueDate: "2026-08-08",
  status: "pendiente",
};

const DEFAULT_FIXED_EXPENSE: NewAccountingFixedExpenseInput = {
  concept: "",
  amount: 0,
  frequency: "mensual",
};

const DEFAULT_COMMISSION: NewAccountingCommissionInput = {
  name: "",
  source: "Agencia",
  sales: 0,
  rate: 10,
  status: "pendiente",
};

const DEFAULT_ADJUSTMENT: NewAccountingEntryInput = {
  ...DEFAULT_ENTRY,
  type: "egreso",
  category: "otros",
  concept: "",
  reference: "Ajuste administrativo",
  status: "pendiente",
  invoiceStatus: "no_requiere",
  deductibleStatus: "no_deducible",
};

export default function AccountingPage() {
  const {
    accounting,
    addAccountingEntry,
    trips,
    vehicles,
    fuel,
    maintenance,
    receivables,
    addReceivable,
    payables,
    addPayable,
    fixedExpenses,
    addFixedExpense,
    commissions,
    addCommission,
    periodClosures,
    closeAccountingPeriod,
    reopenAccountingPeriod,
    accountingAuditLog,
    addAccountingAuditEvent,
  } = useDemoStore();
  const [mode, setMode] = React.useState<ReportMode>("week");
  const [periodId, setPeriodId] = React.useState(WEEKLY_PERIODS[0].id);
  const [entryOpen, setEntryOpen] = React.useState(false);
  const [captureOpen, setCaptureOpen] = React.useState<CaptureDialog>(null);
  const [entryDraft, setEntryDraft] = React.useState<NewAccountingEntryInput>(DEFAULT_ENTRY);
  const [receivableDraft, setReceivableDraft] = React.useState<NewAccountingReceivableInput>(DEFAULT_RECEIVABLE);
  const [payableDraft, setPayableDraft] = React.useState<NewAccountingPayableInput>(DEFAULT_PAYABLE);
  const [fixedExpenseDraft, setFixedExpenseDraft] = React.useState<NewAccountingFixedExpenseInput>(DEFAULT_FIXED_EXPENSE);
  const [commissionDraft, setCommissionDraft] = React.useState<NewAccountingCommissionInput>(DEFAULT_COMMISSION);
  const [adjustmentDraft, setAdjustmentDraft] = React.useState<NewAccountingEntryInput>(DEFAULT_ADJUSTMENT);
  const [closureDetail, setClosureDetail] = React.useState<AccountingPeriodClose | null>(null);
  const [reopenTarget, setReopenTarget] = React.useState<AccountingPeriodClose | null>(null);
  const [printReportType, setPrintReportType] = React.useState<PrintReportType>("accounting");

  React.useEffect(() => {
    if (window.location.search.includes("new=entry")) {
      setEntryOpen(true);
    }
  }, []);

  const periodOptions = mode === "week" ? WEEKLY_PERIODS : mode === "month" ? MONTHLY_PERIODS : YEARLY_PERIODS;
  const selectedPeriod = periodOptions.find((period) => period.id === periodId) ?? periodOptions[0];

  React.useEffect(() => {
    const options = mode === "week" ? WEEKLY_PERIODS : mode === "month" ? MONTHLY_PERIODS : YEARLY_PERIODS;
    setPeriodId(options[0].id);
  }, [mode]);

  const periodEntries = React.useMemo(
    () =>
      accounting
        .filter((entry) => isInPeriod(entry, selectedPeriod))
        .sort((a, b) => b.date.localeCompare(a.date)),
    [accounting, selectedPeriod],
  );

  const summary = React.useMemo(() => buildSummary(periodEntries, selectedPeriod, accounting), [periodEntries, selectedPeriod, accounting]);
  const chartData = React.useMemo(
    () => buildChartData(periodEntries, selectedPeriod, mode),
    [periodEntries, selectedPeriod, mode],
  );
  const paymentBreakdown = React.useMemo(() => buildPaymentBreakdown(periodEntries), [periodEntries]);
  const categoryBreakdown = React.useMemo(() => buildCategoryBreakdown(periodEntries), [periodEntries]);
  const receivableSummary = React.useMemo(() => buildReceivableSummary(receivables), [receivables]);
  const payableSummary = React.useMemo(() => buildPayableSummary(payables), [payables]);
  const dailyClose = React.useMemo(() => buildDailyClose(periodEntries, summary.cashBefore), [periodEntries, summary.cashBefore]);
  const unitProfitability = React.useMemo(
    () => buildUnitProfitability(vehicles, trips, fuel, maintenance),
    [vehicles, trips, fuel, maintenance],
  );
  const fixedExpensesTotal = React.useMemo(
    () => fixedExpenses.reduce((sum, expense) => sum + expense.amount, 0),
    [fixedExpenses],
  );
  const commissionTotal = React.useMemo(
    () => commissions.reduce((sum, commission) => sum + (commission.sales * commission.rate) / 100, 0),
    [commissions],
  );
  const bankPending = React.useMemo(
    () => periodEntries.filter((entry) => entry.account === "banco" && entry.status === "pendiente"),
    [periodEntries],
  );
  const fiscalSummary = React.useMemo(() => buildFiscalSummary(periodEntries), [periodEntries]);
  const closeControl = React.useMemo(
    () => buildCloseControl(periodEntries, selectedPeriod, fiscalSummary, receivables, payables, bankPending, dailyClose),
    [periodEntries, selectedPeriod, fiscalSummary, receivables, payables, bankPending, dailyClose],
  );
  const currentClosure = React.useMemo(
    () => periodClosures.find((closure) => closure.periodId === selectedPeriod.id),
    [periodClosures, selectedPeriod.id],
  );
  const recentClosures = React.useMemo(() => periodClosures.slice(0, 4), [periodClosures]);
  const periodIsClosed = Boolean(currentClosure);
  const periodAuditLog = React.useMemo(
    () =>
      accountingAuditLog
        .filter((event) => !event.periodId || event.periodId === selectedPeriod.id)
        .slice(0, 6),
    [accountingAuditLog, selectedPeriod.id],
  );

  const handleExport = () => {
    exportToCsv(
      `contabilidad_${selectedPeriod.id}`,
      periodEntries.map((entry) => ({
        Fecha: entry.date,
        Tipo: TYPE_LABELS[entry.type],
        Concepto: entry.concept,
        Categoria: ACCOUNTING_CATEGORY_LABELS[entry.category],
        Metodo: ACCOUNTING_PAYMENT_LABELS[entry.paymentMethod],
        Cuenta: ACCOUNT_LABELS[entry.account],
        Monto: entry.amount,
        Referencia: entry.reference ?? "",
        Estado: entry.status,
        Fiscal: entry.type === "ingreso" ? INVOICE_STATUS_LABELS[getInvoiceStatus(entry)] : DEDUCTIBLE_STATUS_LABELS[getDeductibleStatus(entry)],
        "Folio factura": entry.invoiceFolio ?? "",
      })),
    );
  };

  const handleFiscalExport = () => {
    exportToCsv(
      `reporte_contador_${selectedPeriod.id}`,
      periodEntries.map((entry) => {
        const invoiceStatus = getInvoiceStatus(entry);
        const deductibleStatus = getDeductibleStatus(entry);
        const taxableIncome = entry.type === "ingreso" && invoiceStatus !== "no_requiere" ? entry.amount : 0;
        return {
          Fecha: entry.date,
          Tipo: TYPE_LABELS[entry.type],
          Concepto: entry.concept,
          Categoria: ACCOUNTING_CATEGORY_LABELS[entry.category],
          Metodo: ACCOUNTING_PAYMENT_LABELS[entry.paymentMethod],
          Cuenta: ACCOUNT_LABELS[entry.account],
          Monto: entry.amount,
          "Estado factura": entry.type === "ingreso" ? INVOICE_STATUS_LABELS[invoiceStatus] : "",
          "Folio factura": entry.invoiceFolio ?? "",
          "Ingreso base IVA": taxableIncome,
          "IVA estimado": taxableIncome * 0.16,
          Deducible: entry.type === "egreso" ? DEDUCTIBLE_STATUS_LABELS[deductibleStatus] : "",
          "Estado conciliación": entry.status,
          Notas: entry.notes ?? "",
        };
      }),
    );
  };

  const logAccountingEvent = (event: NewAccountingAuditEventInput) => {
    addAccountingAuditEvent(event);
  };

  const handleOpenPrintReport = (type: PrintReportType) => {
    setPrintReportType(type);
    setCaptureOpen("printReport");
    logAccountingEvent({
      actor: "Laura Martínez",
      action: "reporte_generado",
      periodId: selectedPeriod.id,
      periodLabel: selectedPeriod.label,
      detail: `Preparó ${REPORT_LABELS[type].toLowerCase()} para impresión PDF.`,
    });
  };

  const handleClosePeriod = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const note = readFormString(formData, "note");
    const pendingItems = closeControl.items.length - closeControl.doneCount;
    const payload: NewAccountingPeriodCloseInput = {
      periodId: selectedPeriod.id,
      periodLabel: selectedPeriod.label,
      closedBy: "Laura Martínez",
      income: summary.income,
      expenses: summary.expenses,
      net: summary.net,
      fiscalScore: closeControl.score,
      pendingItems,
      status: pendingItems > 0 ? "cerrado_con_pendientes" : "cerrado",
      note: note || undefined,
    };
    closeAccountingPeriod(payload);
    logAccountingEvent({
      actor: payload.closedBy,
      action: "periodo_cerrado",
      periodId: selectedPeriod.id,
      periodLabel: selectedPeriod.label,
      detail: payload.status === "cerrado" ? "Cerró el periodo sin pendientes." : `Cerró el periodo con ${pendingItems} pendientes.`,
      note: payload.note,
    });
    setCaptureOpen(null);
    toast.success(pendingItems > 0 ? "Periodo cerrado con pendientes en el DEMO." : "Periodo cerrado en el DEMO.");
  };

  const handleViewClosure = (closure: AccountingPeriodClose) => {
    setClosureDetail(closure);
    setCaptureOpen("closureDetail");
  };

  const requestReopenPeriod = (closure: AccountingPeriodClose) => {
    setReopenTarget(closure);
    setCaptureOpen("reopenPeriod");
  };

  const handleReopenPeriod = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!reopenTarget) return;
    const formData = new FormData(event.currentTarget);
    const note = readFormString(formData, "reason");
    if (!note) {
      toast.warning("Agrega el motivo para reabrir el periodo.");
      return;
    }
    reopenAccountingPeriod(reopenTarget.periodId);
    logAccountingEvent({
      actor: "Laura Martínez",
      action: "periodo_reabierto",
      periodId: reopenTarget.periodId,
      periodLabel: reopenTarget.periodLabel,
      detail: "Reabrió el periodo para permitir cambios administrativos.",
      note,
    });
    if (closureDetail?.periodId === reopenTarget.periodId) {
      setClosureDetail(null);
    }
    setReopenTarget(null);
    setCaptureOpen(null);
    toast.success("Periodo reabierto en el DEMO.");
  };

  const handleCreateEntry = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!entryDraft.concept.trim()) {
      toast.warning("Agrega un concepto para el movimiento.");
      return;
    }
    if (entryDraft.amount <= 0) {
      toast.warning("El monto debe ser mayor a cero.");
      return;
    }
    addAccountingEntry({
      ...entryDraft,
      concept: entryDraft.concept.trim(),
      reference: entryDraft.reference?.trim() || undefined,
      invoiceFolio: entryDraft.invoiceFolio?.trim() || undefined,
      notes: entryDraft.notes?.trim() || undefined,
    });
    logAccountingEvent({
      actor: "Laura Martínez",
      action: "movimiento_creado",
      periodId: selectedPeriod.id,
      periodLabel: selectedPeriod.label,
      detail: `Registró ${entryDraft.type === "ingreso" ? "ingreso" : "egreso"} por ${formatMXN(entryDraft.amount)}.`,
      note: entryDraft.concept.trim(),
    });
    setEntryDraft(DEFAULT_ENTRY);
    setEntryOpen(false);
    toast.success("Movimiento contable registrado en el DEMO.");
  };

  const handleCreateReceivable = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const client = readFormString(formData, "client");
    const concept = readFormString(formData, "concept");
    const total = readFormNumber(formData, "total");
    const paid = readFormNumber(formData, "paid");
    const dueDate = readFormString(formData, "dueDate");
    const status = readFormString(formData, "status") as AccountingReceivable["status"];
    if (!client || !concept) {
      toast.warning("Agrega cliente y concepto por cobrar.");
      return;
    }
    if (total <= 0 || paid < 0 || paid > total) {
      toast.warning("Revisa el total y el monto pagado.");
      return;
    }
    addReceivable({
      client,
      concept,
      total,
      paid,
      dueDate,
      status,
    });
    logAccountingEvent({
      actor: "Laura Martínez",
      action: "movimiento_creado",
      detail: `Agregó cuenta por cobrar de ${client} por ${formatMXN(total - paid)}.`,
      note: concept,
    });
    setReceivableDraft(DEFAULT_RECEIVABLE);
    setCaptureOpen(null);
    toast.success("Cuenta por cobrar agregada al DEMO.");
  };

  const handleCreatePayable = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const provider = readFormString(formData, "provider");
    const concept = readFormString(formData, "concept");
    const amount = readFormNumber(formData, "amount");
    const dueDate = readFormString(formData, "dueDate");
    const status = readFormString(formData, "status") as AccountingPayable["status"];
    if (!provider || !concept) {
      toast.warning("Agrega proveedor y concepto por pagar.");
      return;
    }
    if (amount <= 0) {
      toast.warning("El monto por pagar debe ser mayor a cero.");
      return;
    }
    addPayable({
      provider,
      concept,
      amount,
      dueDate,
      status,
    });
    logAccountingEvent({
      actor: "Laura Martínez",
      action: "movimiento_creado",
      detail: `Agregó cuenta por pagar de ${provider} por ${formatMXN(amount)}.`,
      note: concept,
    });
    setPayableDraft(DEFAULT_PAYABLE);
    setCaptureOpen(null);
    toast.success("Cuenta por pagar agregada al DEMO.");
  };

  const handleCreateFixedExpense = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const concept = readFormString(formData, "concept");
    const amount = readFormNumber(formData, "amount");
    const frequency = readFormString(formData, "frequency") as AccountingFixedExpense["frequency"];
    if (!concept) {
      toast.warning("Agrega el concepto del gasto fijo.");
      return;
    }
    if (amount <= 0) {
      toast.warning("El monto del gasto fijo debe ser mayor a cero.");
      return;
    }
    addFixedExpense({ concept, amount, frequency });
    logAccountingEvent({
      actor: "Laura Martínez",
      action: "movimiento_creado",
      detail: `Agregó gasto fijo ${frequency} por ${formatMXN(amount)}.`,
      note: concept,
    });
    setFixedExpenseDraft(DEFAULT_FIXED_EXPENSE);
    setCaptureOpen(null);
    toast.success("Gasto fijo agregado al DEMO.");
  };

  const handleCreateCommission = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = readFormString(formData, "name");
    const source = readFormString(formData, "source") as AccountingCommission["source"];
    const sales = readFormNumber(formData, "sales");
    const rate = readFormNumber(formData, "rate");
    const status = readFormString(formData, "status") as AccountingCommission["status"];
    if (!name) {
      toast.warning("Agrega el nombre de la agencia, hotel o conductor.");
      return;
    }
    if (sales <= 0 || rate <= 0) {
      toast.warning("Ventas y porcentaje deben ser mayores a cero.");
      return;
    }
    addCommission({ name, source, sales, rate, status });
    logAccountingEvent({
      actor: "Laura Martínez",
      action: "movimiento_creado",
      detail: `Agregó comisión de ${name} por ${formatNumber(rate, 1)}%.`,
      note: `${source} · ventas ${formatMXN(sales)}`,
    });
    setCommissionDraft(DEFAULT_COMMISSION);
    setCaptureOpen(null);
    toast.success("Comisión agregada al DEMO.");
  };

  const handleCreateAdjustment = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const concept = readFormString(formData, "concept");
    const type = readFormString(formData, "type") as AccountingEntryType;
    const date = readFormString(formData, "date");
    const category = readFormString(formData, "category") as AccountingCategory;
    const account = readFormString(formData, "account") as AccountingAccount;
    const status = readFormString(formData, "status") as AccountingEntry["status"];
    const amount = readFormNumber(formData, "amount");
    const reference = readFormString(formData, "reference") || "Ajuste administrativo";
    const notes = readFormString(formData, "notes");
    if (!concept) {
      toast.warning("Agrega el motivo del ajuste.");
      return;
    }
    if (amount <= 0) {
      toast.warning("El monto del ajuste debe ser mayor a cero.");
      return;
    }
    addAccountingEntry({
      ...adjustmentDraft,
      type,
      date,
      category,
      account,
      status,
      concept,
      amount,
      reference,
      notes: notes || undefined,
    });
    logAccountingEvent({
      actor: "Laura Martínez",
      action: "ajuste_creado",
      periodId: selectedPeriod.id,
      periodLabel: selectedPeriod.label,
      detail: `Registró ajuste ${type === "ingreso" ? "de ingreso" : "de egreso"} por ${formatMXN(amount)}.`,
      note: concept,
    });
    setAdjustmentDraft(DEFAULT_ADJUSTMENT);
    setCaptureOpen(null);
    toast.success("Ajuste administrativo registrado en el DEMO.");
  };

  const columns: Column<AccountingEntry>[] = [
    {
      key: "date",
      header: "Fecha",
      render: (entry) => <span className="whitespace-nowrap text-xs">{formatDate(entry.date, "dd MMM")}</span>,
    },
    {
      key: "concept",
      header: "Concepto",
      render: (entry) => (
        <div>
          <p className="font-medium">{entry.concept}</p>
          {entry.reference && <p className="text-xs text-muted-foreground">{entry.reference}</p>}
        </div>
      ),
    },
    {
      key: "category",
      header: "Categoría",
      render: (entry) => <span className="text-xs">{ACCOUNTING_CATEGORY_LABELS[entry.category]}</span>,
    },
    {
      key: "method",
      header: "Método",
      render: (entry) => <span className="text-xs">{ACCOUNTING_PAYMENT_LABELS[entry.paymentMethod]}</span>,
    },
    {
      key: "status",
      header: "Estado",
      render: (entry) => (
        <Badge tone={entry.status === "conciliado" ? "success" : "warning"}>
          {entry.status === "conciliado" ? "Conciliado" : "Pendiente"}
        </Badge>
      ),
    },
    {
      key: "fiscal",
      header: "Fiscal",
      render: (entry) =>
        entry.type === "ingreso" ? (
          <Badge tone={getInvoiceStatus(entry) === "facturada" ? "success" : getInvoiceStatus(entry) === "por_facturar" ? "warning" : "neutral"}>
            {INVOICE_STATUS_LABELS[getInvoiceStatus(entry)]}
          </Badge>
        ) : (
          <Badge tone={getDeductibleStatus(entry) === "deducible" ? "success" : "neutral"}>
            {DEDUCTIBLE_STATUS_LABELS[getDeductibleStatus(entry)]}
          </Badge>
        ),
    },
    {
      key: "amount",
      header: "Monto",
      className: "text-right",
      render: (entry) => (
        <span
          className={cn(
            "whitespace-nowrap font-semibold tabular-nums",
            entry.type === "ingreso" ? "text-success" : "text-warning",
          )}
        >
          {entry.type === "ingreso" ? "+" : "-"}
          {formatMXN(entry.amount)}
        </span>
      ),
    },
  ];

  const filters: FilterConfig<AccountingEntry>[] = [
    {
      label: "Tipo",
      options: [
        { value: "ingreso", label: "Ingresos" },
        { value: "egreso", label: "Egresos" },
      ],
      predicate: (entry, value) => entry.type === value,
    },
    {
      label: "Categoría",
      options: CATEGORY_OPTIONS,
      predicate: (entry, value) => entry.category === value,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Contabilidad"
        description="Reportes internos de ingresos, egresos, caja y conciliación. Datos simulados del DEMO."
        breadcrumbs={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Contabilidad" }]}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={handleExport} disabled={periodEntries.length === 0}>
              <Download /> Exportar CSV
            </Button>
            <Button variant="outline" onClick={handleFiscalExport} disabled={periodEntries.length === 0}>
              <FileText /> CSV contador
            </Button>
            <Button variant={currentClosure ? "success" : "secondary"} onClick={() => handleOpenPrintReport(currentClosure ? "closure" : "accounting")}>
              <Printer /> {currentClosure ? "PDF de cierre" : "PDF"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setCaptureOpen("adjustment")}
              disabled={periodIsClosed}
              title={periodIsClosed ? "Reabre el periodo para registrar ajustes." : undefined}
            >
              <Scale /> Ajuste administrativo
            </Button>
            <Button variant={currentClosure ? "secondary" : "success"} onClick={() => setCaptureOpen("closePeriod")}>
              <ClipboardCheck /> {currentClosure ? "Ver cierre" : "Cerrar periodo"}
            </Button>
            <Button
              onClick={() => setEntryOpen(true)}
              disabled={periodIsClosed}
              title={periodIsClosed ? "Reabre el periodo para registrar movimientos." : undefined}
            >
              <Plus /> Nuevo movimiento
            </Button>
          </div>
        }
      />

      <Card className="mb-5">
        <CardContent className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold">Generador de reporte contable</p>
            <p className="text-xs text-muted-foreground">
              Cambia entre corte semanal, mensual o anual para recalcular ingresos, egresos y saldos.
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-[auto_240px_auto] sm:items-center">
            <div className="inline-flex rounded-lg border border-border bg-muted p-1">
              {(["week", "month", "year"] as ReportMode[]).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setMode(option)}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm font-semibold transition-colors",
                    mode === option ? "bg-primary text-primary-foreground shadow-soft" : "text-muted-foreground hover:bg-card",
                  )}
                >
                  {option === "week" ? "Semanal" : option === "month" ? "Mensual" : "Anual"}
                </button>
              ))}
            </div>
            <Select value={periodId} onChange={(event) => setPeriodId(event.target.value)} aria-label="Periodo contable">
              {periodOptions.map((period) => (
                <option key={period.id} value={period.id}>
                  {period.label}
                </option>
              ))}
            </Select>
            <PeriodStatusBadge closure={currentClosure} />
          </div>
        </CardContent>
      </Card>

      {currentClosure && (
        <Card className="mb-5 border-success/30 bg-success-soft/40">
          <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <span className="rounded-lg bg-success p-2 text-success-foreground">
                <LockKeyhole className="h-5 w-5" />
              </span>
              <div>
                <p className="font-semibold">
                  {currentClosure.status === "cerrado" ? "Periodo cerrado" : "Periodo cerrado con pendientes"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Los movimientos de este periodo están bloqueados. Reabre para registrar cambios.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => handleViewClosure(currentClosure)}>
                <Eye /> Ver detalle
              </Button>
              <Button size="sm" variant="secondary" onClick={() => requestReopenPeriod(currentClosure)}>
                <UnlockKeyhole /> Reabrir periodo
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mb-5 grid gap-4 xl:grid-cols-[.9fr_1.4fr_.9fr]">
        <FiscalSignalCard
          tone={closeControl.tone}
          title={closeControl.title}
          detail={closeControl.detail}
          score={closeControl.score}
          period={selectedPeriod.shortLabel}
        />

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle>Checklist de cierre</CardTitle>
                <CardDescription>Lo que falta antes de cerrar este periodo.</CardDescription>
              </div>
              <Badge tone={closeControl.doneCount === closeControl.items.length ? "success" : "warning"}>
                {closeControl.doneCount}/{closeControl.items.length} listo
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {closeControl.items.map((item) => (
              <CloseChecklistRow key={item.label} item={item} />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alertas administrativas</CardTitle>
            <CardDescription>Prioridades para cobranza, pagos y fiscal.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {closeControl.alerts.map((alert) => (
              <AdminAlertRow key={alert.title} alert={alert} />
            ))}
          </CardContent>
        </Card>
      </div>

      {recentClosures.length > 0 && (
        <Card className="mb-5">
          <CardHeader>
            <CardTitle>Historial de cierres</CardTitle>
            <CardDescription>Últimos periodos cerrados en el DEMO.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
            {recentClosures.map((closure) => (
              <ClosureHistoryItem key={closure.id} closure={closure} onView={handleViewClosure} />
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label="Ingresos" value={formatMXN(summary.income)} icon={ArrowUpRight} tone="success" />
        <KpiCard label="Egresos" value={formatMXN(summary.expenses)} icon={ArrowDownRight} tone="warning" />
        <KpiCard label="Ingreso neto" value={formatMXN(summary.net)} icon={Receipt} tone={summary.net >= 0 ? "primary" : "warning"} />
        <KpiCard label="Por conciliar" value={formatMXN(summary.pending)} icon={CalendarDays} tone={summary.pending > 0 ? "warning" : "success"} />
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Flujo neto del periodo</CardTitle>
            <CardDescription>
              Ingresos menos egresos por {mode === "week" ? "día" : mode === "month" ? "semana" : "mes"} · {selectedPeriod.shortLabel}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleBarChart data={chartData} unit="MXN" height={260} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Corte de caja</CardTitle>
            <CardDescription>Saldo inicial, movimientos del periodo y saldo estimado.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <CashRow label="Caja anterior" value={summary.cashBefore} />
            <CashRow label="Ingresos en caja" value={summary.cashIncome} tone="success" />
            <CashRow label="Egresos en caja" value={summary.cashExpenses} tone="warning" />
            <div className="border-t border-border pt-3">
              <CashRow label="Caja actual estimada" value={summary.cashCurrent} strong />
            </div>
            <CashRow label="Banco estimado" value={summary.bankCurrent} icon={Landmark} />
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Métodos de cobro</CardTitle>
            <CardDescription>Ingresos recibidos por método de pago.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {paymentBreakdown.map((item) => (
              <ProgressRow key={item.method} label={ACCOUNTING_PAYMENT_LABELS[item.method]} value={item.total} max={summary.income} />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gastos por categoría</CardTitle>
            <CardDescription>Distribución de egresos administrativos y operativos.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {categoryBreakdown.length === 0 ? (
              <p className="rounded-md bg-muted p-4 text-center text-sm text-muted-foreground">Sin egresos en este periodo.</p>
            ) : (
              categoryBreakdown.map((item) => (
                <ProgressRow key={item.category} label={ACCOUNTING_CATEGORY_LABELS[item.category]} value={item.total} max={summary.expenses} />
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Resumen administrativo</CardTitle>
          <CardDescription>Lectura rápida para cierre interno del periodo seleccionado.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <AdminMetric label="Movimientos" value={String(periodEntries.length)} />
            <AdminMetric label="Margen operativo" value={`${formatNumber(summary.margin, 1)}%`} />
            <AdminMetric label="Ingresos en banco" value={formatMXN(summary.bankIncome)} />
            <AdminMetric label="Egresos administrativos" value={formatMXN(summary.adminExpenses)} />
          </div>
        </CardContent>
      </Card>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle>Cuentas por cobrar</CardTitle>
                <CardDescription>Anticipos, saldos y clientes pendientes.</CardDescription>
              </div>
              <Button size="sm" variant="outline" onClick={() => setCaptureOpen("receivable")}>
                <Plus /> Agregar
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <AdminMetric label="Por cobrar" value={formatMXN(receivableSummary.pending)} />
              <AdminMetric label="Vencen pronto" value={String(receivableSummary.dueSoon)} />
            </div>
            <CompactList
              items={receivables}
              render={(item) => (
                <MoneyListItem
                  title={item.client}
                  detail={`${item.concept} · vence ${formatDate(item.dueDate, "dd MMM")}`}
                  amount={item.total - item.paid}
                  badge={item.status === "pagado" ? "Pagado" : item.status === "parcial" ? "Parcial" : "Pendiente"}
                  tone={item.status === "pagado" ? "success" : item.status === "parcial" ? "warning" : "info"}
                />
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle>Cuentas por pagar</CardTitle>
                <CardDescription>Proveedores, taller, gasolina y pagos programados.</CardDescription>
              </div>
              <Button size="sm" variant="outline" onClick={() => setCaptureOpen("payable")}>
                <Plus /> Agregar
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <AdminMetric label="Por pagar" value={formatMXN(payableSummary.pending)} />
              <AdminMetric label="Pagos abiertos" value={String(payableSummary.openItems)} />
            </div>
            <CompactList
              items={payables}
              render={(item) => (
                <MoneyListItem
                  title={item.provider}
                  detail={`${item.concept} · ${formatDate(item.dueDate, "dd MMM")}`}
                  amount={item.amount}
                  badge={item.status === "pagado" ? "Pagado" : item.status === "programado" ? "Programado" : "Pendiente"}
                  tone={item.status === "pagado" ? "success" : "warning"}
                />
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Corte diario</CardTitle>
            <CardDescription>Cierre de efectivo del último día con movimientos.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <CashRow label="Día de corte" value={0} textValue={dailyClose.date ? formatDate(dailyClose.date, "dd MMM yyyy") : "Sin movimientos"} icon={CalendarDays} />
            <CashRow label="Entradas efectivo" value={dailyClose.cashIncome} tone="success" />
            <CashRow label="Salidas efectivo" value={dailyClose.cashExpenses} tone="warning" />
            <div className="border-t border-border pt-3">
              <CashRow label="Caja esperada" value={dailyClose.expectedCash} strong />
            </div>
            <CashRow label="Diferencia mock" value={dailyClose.difference} tone={dailyClose.difference === 0 ? "success" : "warning"} />
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Rentabilidad por unidad</CardTitle>
            <CardDescription>Ingresos menos gasolina, taller y costo operativo estimado.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {unitProfitability.map((unit) => (
              <div key={unit.id} className="rounded-lg border border-border p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{unit.code}</p>
                    <p className="text-xs text-muted-foreground">
                      Ingresos {formatMXN(unit.income)} · Costos {formatMXN(unit.cost)}
                    </p>
                  </div>
                  <span className={cn("font-heading text-lg font-bold tabular-nums", unit.profit >= 0 ? "text-success" : "text-warning")}>
                    {formatMXN(unit.profit)}
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(Math.max(unit.margin, 4), 100)}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle>Gastos fijos y comisiones</CardTitle>
                <CardDescription>Costos base del mes y pagos a agencias/conductores.</CardDescription>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button size="sm" variant="outline" onClick={() => setCaptureOpen("fixed")}>
                  <Plus /> Fijo
                </Button>
                <Button size="sm" variant="outline" onClick={() => setCaptureOpen("commission")}>
                  <Plus /> Comisión
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-semibold">Gastos fijos</p>
                <span className="text-sm font-bold">{formatMXN(fixedExpensesTotal)}</span>
              </div>
              <CompactList
                items={fixedExpenses}
                render={(item) => (
                  <MoneyListItem title={item.concept} detail={item.frequency} amount={item.amount} />
                )}
              />
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-semibold">Comisiones</p>
                <span className="text-sm font-bold">{formatMXN(commissionTotal)}</span>
              </div>
              <CompactList
                items={commissions}
                render={(item) => (
                  <MoneyListItem
                    title={item.name}
                    detail={`${item.source} · ${item.rate}%`}
                    amount={(item.sales * item.rate) / 100}
                    badge={item.status === "pagado" ? "Pagado" : item.status === "programado" ? "Programado" : "Pendiente"}
                    tone={item.status === "pagado" ? "success" : "warning"}
                  />
                )}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Conciliación bancaria</CardTitle>
            <CardDescription>Movimientos de banco pendientes de confirmar.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {bankPending.length === 0 ? (
              <p className="rounded-md bg-muted p-4 text-center text-sm text-muted-foreground">No hay movimientos bancarios pendientes en este periodo.</p>
            ) : (
              <CompactList
                items={bankPending}
                render={(item) => (
                  <MoneyListItem
                    title={item.concept}
                    detail={`${ACCOUNTING_PAYMENT_LABELS[item.paymentMethod]} · ${formatDate(item.date, "dd MMM")}`}
                    amount={item.amount}
                    badge="Pendiente"
                    tone="warning"
                  />
                )}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumen fiscal</CardTitle>
            <CardDescription>Se llena con el campo Factura y Gasto deducible de cada movimiento.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <CashRow label="Ingresos facturables" value={fiscalSummary.billableIncome} icon={Receipt} />
            <CashRow label="Ya facturado" value={fiscalSummary.invoicedIncome} icon={Receipt} tone="success" />
            <CashRow label="Por facturar" value={fiscalSummary.pendingInvoiceIncome} icon={CalendarDays} tone="warning" />
            <CashRow label="IVA estimado" value={fiscalSummary.estimatedVat} icon={Scale} />
            <CashRow label="Gastos deducibles" value={fiscalSummary.deductibleExpenses} icon={Receipt} />
            <CashRow label="No deducibles" value={fiscalSummary.nonDeductibleExpenses} icon={Receipt} />
            <div className="rounded-lg bg-secondary/60 p-3 text-xs text-muted-foreground">
              Captura ingresos como Facturada o Por facturar; marca egresos como deducibles solo si tendrán comprobante fiscal.
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[.85fr_1.15fr]">
        <Card>
          <CardHeader>
            <CardTitle>Reportes PDF</CardTitle>
            <CardDescription>Genera documentos en carta con logo, Arial y datos del periodo seleccionado.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
            <Button variant="outline" onClick={() => handleOpenPrintReport("accounting")}>
              <Printer /> Reporte contable
            </Button>
            <Button variant="outline" onClick={() => handleOpenPrintReport("tax")}>
              <Printer /> Reporte fiscal
            </Button>
            <Button variant="outline" onClick={() => handleOpenPrintReport("closure")}>
              <Printer /> Reporte de cierre
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bitácora administrativa</CardTitle>
            <CardDescription>Últimos cambios y acciones del periodo.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {periodAuditLog.length === 0 ? (
              <p className="rounded-md bg-muted p-4 text-center text-sm text-muted-foreground">
                Los cambios del periodo aparecerán aquí: cierres, reaperturas, ajustes y reportes generados.
              </p>
            ) : (
              periodAuditLog.map((event) => <AuditEventRow key={event.id} event={event} />)
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-5">
        <DataTable
          columns={columns}
          rows={periodEntries}
          getRowId={(entry) => entry.id}
          searchPlaceholder="Buscar por concepto, referencia, categoría o método…"
          searchAccessor={(entry) =>
            `${entry.concept} ${entry.reference ?? ""} ${ACCOUNTING_CATEGORY_LABELS[entry.category]} ${ACCOUNTING_PAYMENT_LABELS[entry.paymentMethod]} ${entry.type === "ingreso" ? INVOICE_STATUS_LABELS[getInvoiceStatus(entry)] : DEDUCTIBLE_STATUS_LABELS[getDeductibleStatus(entry)]}`
          }
          filters={filters}
          emptyTitle="Sin movimientos contables"
          emptyDescription="No hay ingresos ni egresos registrados en este periodo mock."
        />
      </div>

      <Dialog
        open={entryOpen}
        onClose={() => setEntryOpen(false)}
        title="Nuevo movimiento contable"
        description="Registra un ingreso o egreso simulado para alimentar los reportes del Admin."
        className="max-w-2xl"
      >
        <form onSubmit={handleCreateEntry} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Tipo">
              <Select
                value={entryDraft.type}
                onChange={(event) =>
                  setEntryDraft((draft) => ({
                    ...draft,
                    type: event.target.value as AccountingEntryType,
                    category: event.target.value === "ingreso" ? "traslados" : "combustible",
                    invoiceStatus: event.target.value === "ingreso" ? "por_facturar" : "no_requiere",
                    deductibleStatus: event.target.value === "egreso" ? "deducible" : "no_deducible",
                  }))
                }
              >
                <option value="ingreso">Ingreso</option>
                <option value="egreso">Egreso</option>
              </Select>
            </Field>
            <Field label="Fecha">
              <Input
                type="date"
                value={entryDraft.date}
                onChange={(event) => setEntryDraft((draft) => ({ ...draft, date: event.target.value }))}
              />
            </Field>
            <Field label="Monto">
              <Input
                type="number"
                min={1}
                step={10}
                value={entryDraft.amount || ""}
                onChange={(event) => setEntryDraft((draft) => ({ ...draft, amount: Number(event.target.value) }))}
                placeholder="1500"
              />
            </Field>
          </div>

          <Field label="Concepto sencillo">
            <Input
              value={entryDraft.concept}
              onChange={(event) => setEntryDraft((draft) => ({ ...draft, concept: event.target.value }))}
              placeholder={entryDraft.type === "ingreso" ? "Traslado a Tulum" : "Gasolina unidad U-01"}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Categoría">
              <Select
                value={entryDraft.category}
                onChange={(event) => setEntryDraft((draft) => ({ ...draft, category: event.target.value as AccountingCategory }))}
              >
                {(Object.keys(ACCOUNTING_CATEGORY_LABELS) as AccountingCategory[]).map((category) => (
                  <option key={category} value={category}>
                    {ACCOUNTING_CATEGORY_LABELS[category]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Método">
              <Select
                value={entryDraft.paymentMethod}
                onChange={(event) =>
                  setEntryDraft((draft) => ({ ...draft, paymentMethod: event.target.value as AccountingPaymentMethod }))
                }
              >
                {(Object.keys(ACCOUNTING_PAYMENT_LABELS) as AccountingPaymentMethod[]).map((method) => (
                  <option key={method} value={method}>
                    {ACCOUNTING_PAYMENT_LABELS[method]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Cuenta">
              <Select
                value={entryDraft.account}
                onChange={(event) => setEntryDraft((draft) => ({ ...draft, account: event.target.value as AccountingAccount }))}
              >
                <option value="caja">Caja</option>
                <option value="banco">Banco</option>
              </Select>
            </Field>
          </div>

          <div className="rounded-lg border border-border bg-secondary/40 p-4">
            <div className="mb-3">
              <p className="text-sm font-semibold">Detalle fiscal</p>
              <p className="text-xs text-muted-foreground">
                Estos campos alimentan el resumen fiscal de forma directa.
              </p>
            </div>
            {entryDraft.type === "ingreso" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Factura">
                  <Select
                    value={entryDraft.invoiceStatus ?? "por_facturar"}
                    onChange={(event) =>
                      setEntryDraft((draft) => ({ ...draft, invoiceStatus: event.target.value as AccountingInvoiceStatus }))
                    }
                  >
                    {(Object.keys(INVOICE_STATUS_LABELS) as AccountingInvoiceStatus[]).map((status) => (
                      <option key={status} value={status}>
                        {INVOICE_STATUS_LABELS[status]}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Folio de factura">
                  <Input
                    value={entryDraft.invoiceFolio ?? ""}
                    onChange={(event) => setEntryDraft((draft) => ({ ...draft, invoiceFolio: event.target.value }))}
                    placeholder="UUID o folio interno"
                    disabled={(entryDraft.invoiceStatus ?? "por_facturar") !== "facturada"}
                  />
                </Field>
              </div>
            ) : (
              <Field label="Gasto deducible">
                <Select
                  value={entryDraft.deductibleStatus ?? "deducible"}
                  onChange={(event) =>
                    setEntryDraft((draft) => ({ ...draft, deductibleStatus: event.target.value as AccountingDeductibleStatus }))
                  }
                >
                  {(Object.keys(DEDUCTIBLE_STATUS_LABELS) as AccountingDeductibleStatus[]).map((status) => (
                    <option key={status} value={status}>
                      {DEDUCTIBLE_STATUS_LABELS[status]}
                    </option>
                  ))}
                </Select>
              </Field>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Referencia">
              <Input
                value={entryDraft.reference ?? ""}
                onChange={(event) => setEntryDraft((draft) => ({ ...draft, reference: event.target.value }))}
                placeholder="Folio, nota o comprobante"
              />
            </Field>
            <Field label="Estado">
              <Select
                value={entryDraft.status}
                onChange={(event) =>
                  setEntryDraft((draft) => ({ ...draft, status: event.target.value as AccountingEntry["status"] }))
                }
              >
                <option value="conciliado">Conciliado</option>
                <option value="pendiente">Pendiente</option>
              </Select>
            </Field>
          </div>

          <Field label="Notas internas">
            <Textarea
              value={entryDraft.notes ?? ""}
              onChange={(event) => setEntryDraft((draft) => ({ ...draft, notes: event.target.value }))}
              placeholder="Detalle opcional para control interno"
            />
          </Field>

          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <Button type="button" variant="outline" onClick={() => setEntryOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Guardar movimiento</Button>
          </div>
        </form>
      </Dialog>

      <Dialog
        open={captureOpen === "receivable"}
        onClose={() => setCaptureOpen(null)}
        title="Nueva cuenta por cobrar"
        description="Registra saldos pendientes de clientes, hoteles o agencias dentro del DEMO."
        className="max-w-xl"
      >
        <form onSubmit={handleCreateReceivable} className="space-y-4">
          <Field label="Cliente">
            <Input
              name="client"
              value={receivableDraft.client}
              onChange={(event) => setReceivableDraft((draft) => ({ ...draft, client: event.target.value }))}
              placeholder="Agencia, hotel o cliente directo"
            />
          </Field>
          <Field label="Concepto">
            <Input
              name="concept"
              value={receivableDraft.concept}
              onChange={(event) => setReceivableDraft((draft) => ({ ...draft, concept: event.target.value }))}
              placeholder="Servicios de agosto, anticipo o saldo"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Total">
              <Input
                name="total"
                type="number"
                min={1}
                step={10}
                value={receivableDraft.total || ""}
                onChange={(event) => setReceivableDraft((draft) => ({ ...draft, total: Number(event.target.value) }))}
                placeholder="8500"
              />
            </Field>
            <Field label="Pagado">
              <Input
                name="paid"
                type="number"
                min={0}
                step={10}
                value={receivableDraft.paid || ""}
                onChange={(event) => setReceivableDraft((draft) => ({ ...draft, paid: Number(event.target.value) }))}
                placeholder="0"
              />
            </Field>
            <Field label="Vence">
              <Input
                name="dueDate"
                type="date"
                value={receivableDraft.dueDate}
                onChange={(event) => setReceivableDraft((draft) => ({ ...draft, dueDate: event.target.value }))}
              />
            </Field>
          </div>
          <Field label="Estado">
            <Select
              name="status"
              value={receivableDraft.status}
              onChange={(event) => setReceivableDraft((draft) => ({ ...draft, status: event.target.value as AccountingReceivable["status"] }))}
            >
              <option value="pendiente">Pendiente</option>
              <option value="parcial">Parcial</option>
              <option value="pagado">Pagado</option>
            </Select>
          </Field>
          <DialogActions onCancel={() => setCaptureOpen(null)} submitLabel="Guardar por cobrar" />
        </form>
      </Dialog>

      <Dialog
        open={captureOpen === "payable"}
        onClose={() => setCaptureOpen(null)}
        title="Nueva cuenta por pagar"
        description="Registra compromisos con proveedores, taller, gasolina o pagos administrativos."
        className="max-w-xl"
      >
        <form onSubmit={handleCreatePayable} className="space-y-4">
          <Field label="Proveedor">
            <Input
              name="provider"
              value={payableDraft.provider}
              onChange={(event) => setPayableDraft((draft) => ({ ...draft, provider: event.target.value }))}
              placeholder="Gasolinera, taller o proveedor"
            />
          </Field>
          <Field label="Concepto">
            <Input
              name="concept"
              value={payableDraft.concept}
              onChange={(event) => setPayableDraft((draft) => ({ ...draft, concept: event.target.value }))}
              placeholder="Gasolina semanal, servicio de unidad o comisión"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Monto">
              <Input
                name="amount"
                type="number"
                min={1}
                step={10}
                value={payableDraft.amount || ""}
                onChange={(event) => setPayableDraft((draft) => ({ ...draft, amount: Number(event.target.value) }))}
                placeholder="4800"
              />
            </Field>
            <Field label="Vence">
              <Input
                name="dueDate"
                type="date"
                value={payableDraft.dueDate}
                onChange={(event) => setPayableDraft((draft) => ({ ...draft, dueDate: event.target.value }))}
              />
            </Field>
            <Field label="Estado">
              <Select
                name="status"
                value={payableDraft.status}
                onChange={(event) => setPayableDraft((draft) => ({ ...draft, status: event.target.value as AccountingPayable["status"] }))}
              >
                <option value="pendiente">Pendiente</option>
                <option value="programado">Programado</option>
                <option value="pagado">Pagado</option>
              </Select>
            </Field>
          </div>
          <DialogActions onCancel={() => setCaptureOpen(null)} submitLabel="Guardar por pagar" />
        </form>
      </Dialog>

      <Dialog
        open={captureOpen === "fixed"}
        onClose={() => setCaptureOpen(null)}
        title="Nuevo gasto fijo"
        description="Agrega costos recurrentes como seguros, GPS, renta, publicidad o administración."
        className="max-w-lg"
      >
        <form onSubmit={handleCreateFixedExpense} className="space-y-4">
          <Field label="Concepto">
            <Input
              name="concept"
              value={fixedExpenseDraft.concept}
              onChange={(event) => setFixedExpenseDraft((draft) => ({ ...draft, concept: event.target.value }))}
              placeholder="Seguro de unidades"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Monto">
              <Input
                name="amount"
                type="number"
                min={1}
                step={10}
                value={fixedExpenseDraft.amount || ""}
                onChange={(event) => setFixedExpenseDraft((draft) => ({ ...draft, amount: Number(event.target.value) }))}
                placeholder="9200"
              />
            </Field>
            <Field label="Frecuencia">
              <Select
                name="frequency"
                value={fixedExpenseDraft.frequency}
                onChange={(event) =>
                  setFixedExpenseDraft((draft) => ({ ...draft, frequency: event.target.value as AccountingFixedExpense["frequency"] }))
                }
              >
                <option value="semanal">Semanal</option>
                <option value="mensual">Mensual</option>
                <option value="anual">Anual</option>
              </Select>
            </Field>
          </div>
          <DialogActions onCancel={() => setCaptureOpen(null)} submitLabel="Guardar gasto fijo" />
        </form>
      </Dialog>

      <Dialog
        open={captureOpen === "commission"}
        onClose={() => setCaptureOpen(null)}
        title="Nueva comisión"
        description="Registra comisiones para agencias, hoteles, conductores u otros aliados."
        className="max-w-xl"
      >
        <form onSubmit={handleCreateCommission} className="space-y-4">
          <Field label="Nombre">
            <Input
              name="name"
              value={commissionDraft.name}
              onChange={(event) => setCommissionDraft((draft) => ({ ...draft, name: event.target.value }))}
              placeholder="Agencia, hotel o conductor"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Origen">
              <Select
                name="source"
                value={commissionDraft.source}
                onChange={(event) => setCommissionDraft((draft) => ({ ...draft, source: event.target.value as AccountingCommission["source"] }))}
              >
                <option value="Agencia">Agencia</option>
                <option value="Hotel">Hotel</option>
                <option value="Conductor">Conductor</option>
                <option value="Otro">Otro</option>
              </Select>
            </Field>
            <Field label="Ventas">
              <Input
                name="sales"
                type="number"
                min={1}
                step={10}
                value={commissionDraft.sales || ""}
                onChange={(event) => setCommissionDraft((draft) => ({ ...draft, sales: Number(event.target.value) }))}
                placeholder="12600"
              />
            </Field>
            <Field label="% Comisión">
              <Input
                name="rate"
                type="number"
                min={1}
                step={0.5}
                value={commissionDraft.rate || ""}
                onChange={(event) => setCommissionDraft((draft) => ({ ...draft, rate: Number(event.target.value) }))}
                placeholder="10"
              />
            </Field>
          </div>
          <Field label="Estado">
            <Select
              name="status"
              value={commissionDraft.status}
              onChange={(event) => setCommissionDraft((draft) => ({ ...draft, status: event.target.value as AccountingCommission["status"] }))}
            >
              <option value="pendiente">Pendiente</option>
              <option value="programado">Programado</option>
              <option value="pagado">Pagado</option>
            </Select>
          </Field>
          <DialogActions onCancel={() => setCaptureOpen(null)} submitLabel="Guardar comisión" />
        </form>
      </Dialog>

      <Dialog
        open={captureOpen === "adjustment"}
        onClose={() => setCaptureOpen(null)}
        title="Nuevo ajuste administrativo"
        description="Registra correcciones internas, diferencias de caja o ajustes no operativos."
        className="max-w-2xl"
      >
        <form onSubmit={handleCreateAdjustment} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Tipo">
              <Select
                name="type"
                value={adjustmentDraft.type}
                onChange={(event) =>
                  setAdjustmentDraft((draft) => ({
                    ...draft,
                    type: event.target.value as AccountingEntryType,
                    category: event.target.value === "ingreso" ? "otros" : draft.category,
                  }))
                }
              >
                <option value="ingreso">Ingreso</option>
                <option value="egreso">Egreso</option>
              </Select>
            </Field>
            <Field label="Fecha">
              <Input
                name="date"
                type="date"
                value={adjustmentDraft.date}
                onChange={(event) => setAdjustmentDraft((draft) => ({ ...draft, date: event.target.value }))}
              />
            </Field>
            <Field label="Monto">
              <Input
                name="amount"
                type="number"
                min={1}
                step={10}
                value={adjustmentDraft.amount || ""}
                onChange={(event) => setAdjustmentDraft((draft) => ({ ...draft, amount: Number(event.target.value) }))}
                placeholder="500"
              />
            </Field>
          </div>
          <Field label="Motivo del ajuste">
            <Input
              name="concept"
              value={adjustmentDraft.concept}
              onChange={(event) => setAdjustmentDraft((draft) => ({ ...draft, concept: event.target.value }))}
              placeholder="Diferencia de caja, corrección de saldo o reclasificación"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Categoría">
              <Select
                name="category"
                value={adjustmentDraft.category}
                onChange={(event) => setAdjustmentDraft((draft) => ({ ...draft, category: event.target.value as AccountingCategory }))}
              >
                {(Object.keys(ACCOUNTING_CATEGORY_LABELS) as AccountingCategory[]).map((category) => (
                  <option key={category} value={category}>
                    {ACCOUNTING_CATEGORY_LABELS[category]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Cuenta">
              <Select
                name="account"
                value={adjustmentDraft.account}
                onChange={(event) => setAdjustmentDraft((draft) => ({ ...draft, account: event.target.value as AccountingAccount }))}
              >
                <option value="caja">Caja</option>
                <option value="banco">Banco</option>
              </Select>
            </Field>
            <Field label="Estado">
              <Select
                name="status"
                value={adjustmentDraft.status}
                onChange={(event) => setAdjustmentDraft((draft) => ({ ...draft, status: event.target.value as AccountingEntry["status"] }))}
              >
                <option value="pendiente">Pendiente</option>
                <option value="conciliado">Conciliado</option>
              </Select>
            </Field>
          </div>
          <Field label="Notas">
            <Textarea
              name="notes"
              value={adjustmentDraft.notes ?? ""}
              onChange={(event) => setAdjustmentDraft((draft) => ({ ...draft, notes: event.target.value }))}
              placeholder="Detalle opcional para auditoría interna"
            />
          </Field>
          <DialogActions onCancel={() => setCaptureOpen(null)} submitLabel="Guardar ajuste" />
        </form>
      </Dialog>

      <Dialog
        open={captureOpen === "closePeriod"}
        onClose={() => setCaptureOpen(null)}
        title={currentClosure ? "Detalle del cierre" : "Cerrar periodo"}
        description={
          currentClosure
            ? "Este periodo ya fue cerrado en el DEMO. Puedes volver a cerrarlo si necesitas actualizar el corte."
            : "Confirma el corte con el resumen actual y los pendientes detectados."
        }
        className="max-w-3xl"
      >
        <form onSubmit={handleClosePeriod} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <AdminMetric label="Ingresos" value={formatMXN(summary.income)} />
            <AdminMetric label="Egresos" value={formatMXN(summary.expenses)} />
            <AdminMetric label="Neto" value={formatMXN(summary.net)} />
          </div>

          <div className={cn("rounded-lg border p-4", closeControl.tone === "danger" ? "border-destructive/30 bg-destructive-soft/40" : closeControl.tone === "warning" ? "border-warning/30 bg-warning-soft/40" : "border-success/30 bg-success-soft/40")}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{closeControl.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{closeControl.detail}</p>
              </div>
              <Badge tone={closeControl.tone}>{closeControl.score}%</Badge>
            </div>
          </div>

          <div className="grid gap-2 md:grid-cols-2">
            {closeControl.items.map((item) => (
              <CloseChecklistRow key={item.label} item={item} />
            ))}
          </div>

          {currentClosure && (
            <div className="rounded-lg border border-border bg-secondary/50 p-3 text-sm">
              <p className="font-semibold">Último cierre</p>
              <p className="mt-1 text-muted-foreground">
                {formatDate(currentClosure.closedAt, "dd MMM yyyy HH:mm")} · {currentClosure.closedBy} · {currentClosure.pendingItems} pendientes
              </p>
              {currentClosure.note && <p className="mt-2 text-muted-foreground">{currentClosure.note}</p>}
            </div>
          )}

          <Field label="Nota de cierre">
            <Textarea name="note" placeholder="Ejemplo: se cierra con facturas pendientes para seguimiento con contador." />
          </Field>

          <div className="flex flex-col gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={() => setCaptureOpen(null)}>
              Cancelar
            </Button>
            {currentClosure && (
              <Button type="button" variant="secondary" onClick={() => requestReopenPeriod(currentClosure)}>
                <UnlockKeyhole /> Reabrir periodo
              </Button>
            )}
            <Button type="submit" variant={closeControl.doneCount === closeControl.items.length ? "success" : "default"}>
              {currentClosure ? "Actualizar cierre" : closeControl.doneCount === closeControl.items.length ? "Cerrar periodo" : "Cerrar con pendientes"}
            </Button>
          </div>
        </form>
      </Dialog>

      <Dialog
        open={captureOpen === "closureDetail" && Boolean(closureDetail)}
        onClose={() => {
          setCaptureOpen(null);
          setClosureDetail(null);
        }}
        title="Detalle del cierre"
        description="Resumen guardado del periodo seleccionado."
        className="max-w-2xl"
      >
        {closureDetail && (
          <div className="space-y-4">
            <div className="flex flex-col gap-3 rounded-lg border border-border bg-secondary/50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold">{closureDetail.periodLabel}</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(closureDetail.closedAt, "dd MMM yyyy HH:mm")} · {closureDetail.closedBy}
                </p>
              </div>
              <Badge tone={closureDetail.status === "cerrado" ? "success" : "warning"}>
                {closureDetail.status === "cerrado" ? "Cerrado" : "Con pendientes"}
              </Badge>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <AdminMetric label="Ingresos" value={formatMXN(closureDetail.income)} />
              <AdminMetric label="Egresos" value={formatMXN(closureDetail.expenses)} />
              <AdminMetric label="Neto" value={formatMXN(closureDetail.net)} />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <AdminMetric label="Avance de cierre" value={`${closureDetail.fiscalScore}%`} />
              <AdminMetric label="Pendientes al cierre" value={String(closureDetail.pendingItems)} />
            </div>

            {closureDetail.note && (
              <div className="rounded-lg border border-border p-3">
                <p className="text-xs text-muted-foreground">Nota de cierre</p>
                <p className="mt-1 text-sm">{closureDetail.note}</p>
              </div>
            )}

            <div className="flex flex-col gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setCaptureOpen(null);
                  setClosureDetail(null);
                }}
              >
                Cerrar
              </Button>
              <Button type="button" variant="secondary" onClick={() => requestReopenPeriod(closureDetail)}>
                <UnlockKeyhole /> Reabrir periodo
              </Button>
            </div>
          </div>
        )}
      </Dialog>

      <Dialog
        open={captureOpen === "reopenPeriod" && Boolean(reopenTarget)}
        onClose={() => {
          setCaptureOpen(null);
          setReopenTarget(null);
        }}
        title="Reabrir periodo"
        description="Para reabrir un cierre agrega el motivo. Quedará registrado en la bitácora."
        className="max-w-lg"
      >
        {reopenTarget && (
          <form onSubmit={handleReopenPeriod} className="space-y-4">
            <div className="rounded-lg border border-warning/30 bg-warning-soft/40 p-4">
              <p className="font-semibold">{reopenTarget.periodLabel}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Cerrado el {formatDate(reopenTarget.closedAt, "dd MMM yyyy HH:mm")} con {reopenTarget.pendingItems} pendientes.
              </p>
            </div>
            <Field label="Motivo de reapertura">
              <Textarea name="reason" placeholder="Ejemplo: faltó capturar una factura o se detectó una diferencia de caja." />
            </Field>
            <div className="flex justify-end gap-2 border-t border-border pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setCaptureOpen(null);
                  setReopenTarget(null);
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" variant="secondary">
                <UnlockKeyhole /> Reabrir periodo
              </Button>
            </div>
          </form>
        )}
      </Dialog>

      <Dialog
        open={captureOpen === "printReport"}
        onClose={() => setCaptureOpen(null)}
        title="Reporte para PDF"
        description="Previsualiza el formato carta. Usa Imprimir y guarda como PDF."
        className="max-w-5xl"
      >
        <div className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="inline-flex rounded-lg border border-border bg-muted p-1">
              {(["accounting", "tax", "closure"] as PrintReportType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setPrintReportType(type)}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm font-semibold transition-colors",
                    printReportType === type ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-card",
                  )}
                >
                  {REPORT_LABELS[type]}
                </button>
              ))}
            </div>
            <Button type="button" onClick={() => window.print()}>
              <Printer /> Imprimir / guardar PDF
            </Button>
          </div>

          <PrintReportSheet
            reportType={printReportType}
            period={selectedPeriod}
            entries={periodEntries}
            summary={summary}
            fiscalSummary={fiscalSummary}
            closeControl={closeControl}
            closure={currentClosure}
          />
        </div>
      </Dialog>
    </div>
  );
}

function isInPeriod(entry: AccountingEntry, period: PeriodOption) {
  return entry.date >= period.start && entry.date <= period.end;
}

function sumEntries(entries: AccountingEntry[], type?: AccountingEntryType, account?: AccountingAccount) {
  return entries
    .filter((entry) => (!type || entry.type === type) && (!account || entry.account === account))
    .reduce((sum, entry) => sum + entry.amount, 0);
}

function buildSummary(entries: AccountingEntry[], period: PeriodOption, allEntries: AccountingEntry[]) {
  const previousEntries = allEntries.filter((entry) => entry.date < period.start);
  const income = sumEntries(entries, "ingreso");
  const expenses = sumEntries(entries, "egreso");
  const cashIncome = sumEntries(entries, "ingreso", "caja");
  const cashExpenses = sumEntries(entries, "egreso", "caja");
  const bankIncome = sumEntries(entries, "ingreso", "banco");
  const bankExpenses = sumEntries(entries, "egreso", "banco");
  const previousCash = sumEntries(previousEntries, "ingreso", "caja") - sumEntries(previousEntries, "egreso", "caja");
  const previousBank = sumEntries(previousEntries, "ingreso", "banco") - sumEntries(previousEntries, "egreso", "banco");
  const pending = entries
    .filter((entry) => entry.status === "pendiente")
    .reduce((sum, entry) => sum + entry.amount, 0);
  const adminExpenses = entries
    .filter((entry) => entry.type === "egreso" && ["oficina", "impuestos", "comisiones"].includes(entry.category))
    .reduce((sum, entry) => sum + entry.amount, 0);
  const net = income - expenses;

  return {
    income,
    expenses,
    net,
    margin: income > 0 ? (net / income) * 100 : 0,
    pending,
    cashBefore: ACCOUNTING_OPENING_BALANCE.cash + previousCash,
    cashIncome,
    cashExpenses,
    cashCurrent: ACCOUNTING_OPENING_BALANCE.cash + previousCash + cashIncome - cashExpenses,
    bankIncome,
    bankExpenses,
    bankCurrent: ACCOUNTING_OPENING_BALANCE.bank + previousBank + bankIncome - bankExpenses,
    adminExpenses,
  };
}

function buildChartData(entries: AccountingEntry[], period: PeriodOption, mode: ReportMode): BarDatum[] {
  const start = parseISO(period.start);
  const end = parseISO(period.end);
  const buckets =
    mode === "week"
      ? eachDayOfInterval({ start, end }).map((date) => ({ start: date, end: date }))
      : mode === "month"
        ? eachWeekOfInterval({ start, end }, { weekStartsOn: 1 }).map((date) => ({
          start: date,
          end: endOfWeek(date, { weekStartsOn: 1 }) > end ? end : endOfWeek(date, { weekStartsOn: 1 }),
        }))
        : eachMonthOfInterval({ start, end }).map((date) => ({
          start: date,
          end: endOfMonth(date),
        }));

  return buckets.map((bucket, index) => {
    const bucketStart = format(bucket.start, "yyyy-MM-dd");
    const bucketEnd = format(bucket.end, "yyyy-MM-dd");
    const bucketEntries = entries.filter((entry) => entry.date >= bucketStart && entry.date <= bucketEnd);
    const net = sumEntries(bucketEntries, "ingreso") - sumEntries(bucketEntries, "egreso");
    const label =
      mode === "week"
        ? format(bucket.start, "EEE", { locale: es })
        : mode === "month"
          ? `Sem ${index + 1}`
          : format(bucket.start, "MMM", { locale: es });
    return {
      label,
      value: net,
      color: net >= 0 ? "#9DC52D" : "#EAA33D",
    };
  });
}

function buildPaymentBreakdown(entries: AccountingEntry[]) {
  const methods = Object.keys(ACCOUNTING_PAYMENT_LABELS) as AccountingPaymentMethod[];
  return methods.map((method) => ({
    method,
    total: entries
      .filter((entry) => entry.type === "ingreso" && entry.paymentMethod === method)
      .reduce((sum, entry) => sum + entry.amount, 0),
  }));
}

function buildCategoryBreakdown(entries: AccountingEntry[]) {
  const categories = Object.keys(ACCOUNTING_CATEGORY_LABELS) as AccountingCategory[];
  return categories
    .map((category) => ({
      category,
      total: entries
        .filter((entry) => entry.type === "egreso" && entry.category === category)
        .reduce((sum, entry) => sum + entry.amount, 0),
    }))
    .filter((item) => item.total > 0)
    .sort((a, b) => b.total - a.total);
}

function buildReceivableSummary(receivables: AccountingReceivable[]) {
  const pending = receivables.reduce((sum, item) => sum + Math.max(item.total - item.paid, 0), 0);
  const dueSoon = receivables.filter((item) => item.status !== "pagado" && item.dueDate <= ACCOUNTING_SOON_DATE).length;
  return { pending, dueSoon };
}

function readFormString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function readFormNumber(formData: FormData, key: string) {
  return Number(formData.get(key) ?? 0);
}

function buildPayableSummary(payables: AccountingPayable[]) {
  const pending = payables
    .filter((item) => item.status !== "pagado")
    .reduce((sum, item) => sum + item.amount, 0);
  const openItems = payables.filter((item) => item.status !== "pagado").length;
  return { pending, openItems };
}

function buildCloseControl(
  entries: AccountingEntry[],
  period: PeriodOption,
  fiscalSummary: ReturnType<typeof buildFiscalSummary>,
  receivables: AccountingReceivable[],
  payables: AccountingPayable[],
  bankPending: AccountingEntry[],
  dailyClose: ReturnType<typeof buildDailyClose>,
) {
  const pendingInvoiceCount = entries.filter((entry) => entry.type === "ingreso" && getInvoiceStatus(entry) === "por_facturar").length;
  const nonDeductibleCount = entries.filter((entry) => entry.type === "egreso" && getDeductibleStatus(entry) === "no_deducible").length;
  const overdueReceivables = receivables.filter((item) => item.status !== "pagado" && item.dueDate < ACCOUNTING_TODAY);
  const dueSoonReceivables = receivables.filter(
    (item) => item.status !== "pagado" && item.dueDate >= ACCOUNTING_TODAY && item.dueDate <= ACCOUNTING_SOON_DATE,
  );
  const dueSoonPayables = payables.filter(
    (item) => item.status !== "pagado" && item.dueDate >= ACCOUNTING_TODAY && item.dueDate <= ACCOUNTING_SOON_DATE,
  );
  const overduePayables = payables.filter((item) => item.status !== "pagado" && item.dueDate < ACCOUNTING_TODAY);
  const bankPendingAmount = bankPending.reduce((sum, entry) => sum + entry.amount, 0);
  const overdueReceivableAmount = overdueReceivables.reduce((sum, item) => sum + Math.max(item.total - item.paid, 0), 0);
  const duePayableAmount = [...overduePayables, ...dueSoonPayables].reduce((sum, item) => sum + item.amount, 0);

  const items: CloseControlItem[] = [
    {
      label: "Conciliación bancaria",
      detail: bankPending.length === 0 ? "Banco sin pendientes en el periodo." : `${bankPending.length} movimientos pendientes de confirmar.`,
      value: bankPending.length === 0 ? undefined : formatMXN(bankPendingAmount),
      tone: bankPending.length === 0 ? "success" : "warning",
      done: bankPending.length === 0,
    },
    {
      label: "Facturas de ingresos",
      detail: pendingInvoiceCount === 0 ? "Ingresos fiscales clasificados." : `${pendingInvoiceCount} ingresos siguen por facturar.`,
      value: fiscalSummary.pendingInvoiceIncome > 0 ? formatMXN(fiscalSummary.pendingInvoiceIncome) : undefined,
      tone: pendingInvoiceCount === 0 ? "success" : "warning",
      done: pendingInvoiceCount === 0,
    },
    {
      label: "Gastos deducibles",
      detail: nonDeductibleCount === 0 ? "Gastos listos para revisión fiscal." : `${nonDeductibleCount} gastos quedaron no deducibles.`,
      value: fiscalSummary.nonDeductibleExpenses > 0 ? formatMXN(fiscalSummary.nonDeductibleExpenses) : undefined,
      tone: nonDeductibleCount === 0 ? "success" : "info",
      done: nonDeductibleCount === 0,
    },
    {
      label: "Cobranza",
      detail: overdueReceivables.length === 0 ? "Sin cuentas vencidas." : `${overdueReceivables.length} cuentas por cobrar vencidas.`,
      value: overdueReceivableAmount > 0 ? formatMXN(overdueReceivableAmount) : undefined,
      tone: overdueReceivables.length === 0 ? "success" : "danger",
      done: overdueReceivables.length === 0,
    },
    {
      label: "Pagos próximos",
      detail: dueSoonPayables.length + overduePayables.length === 0 ? "Sin pagos urgentes." : `${dueSoonPayables.length + overduePayables.length} pagos requieren atención.`,
      value: duePayableAmount > 0 ? formatMXN(duePayableAmount) : undefined,
      tone: overduePayables.length > 0 ? "danger" : dueSoonPayables.length > 0 ? "warning" : "success",
      done: dueSoonPayables.length + overduePayables.length === 0,
    },
    {
      label: "Corte de caja",
      detail: dailyClose.difference === 0 ? "Caja sin diferencia en el mock." : "Hay diferencia por justificar.",
      value: dailyClose.difference !== 0 ? formatMXN(dailyClose.difference) : undefined,
      tone: dailyClose.difference === 0 ? "success" : "danger",
      done: dailyClose.difference === 0,
    },
  ];

  const doneCount = items.filter((item) => item.done).length;
  const score = Math.round((doneCount / items.length) * 100);
  const hasCritical = items.some((item) => item.tone === "danger");
  const tone: BadgeTone = hasCritical ? "danger" : doneCount === items.length ? "success" : "warning";
  const title = tone === "success" ? "Listo para cerrar" : tone === "danger" ? "Revisar antes de cerrar" : "Cierre en proceso";
  const detail =
    tone === "success"
      ? `${period.shortLabel} no tiene pendientes críticos.`
      : tone === "danger"
        ? "Hay vencidos o diferencias que conviene resolver primero."
        : "Hay pendientes normales de conciliación, factura o pagos.";

  const alerts: AdminAlertItem[] = [
    overdueReceivables.length > 0 && {
      title: "Cobranza vencida",
      detail: "Prioriza clientes con saldo atrasado.",
      tone: "danger",
      value: formatMXN(overdueReceivableAmount),
    },
    pendingInvoiceCount > 0 && {
      title: "Ingresos por facturar",
      detail: "Completa factura o marca como no requerida.",
      tone: "warning",
      value: formatMXN(fiscalSummary.pendingInvoiceIncome),
    },
    bankPending.length > 0 && {
      title: "Banco pendiente",
      detail: "Confirma depósitos y pagos bancarios.",
      tone: "warning",
      value: String(bankPending.length),
    },
    dueSoonPayables.length > 0 && {
      title: "Pagos próximos",
      detail: `Vencen antes del ${formatDate(ACCOUNTING_SOON_DATE, "dd MMM")}.`,
      tone: "warning",
      value: formatMXN(dueSoonPayables.reduce((sum, item) => sum + item.amount, 0)),
    },
    dueSoonReceivables.length > 0 && {
      title: "Cobros próximos",
      detail: "Da seguimiento antes de que se atrasen.",
      tone: "info",
      value: String(dueSoonReceivables.length),
    },
    nonDeductibleCount > 0 && {
      title: "Gastos no deducibles",
      detail: "Revisa si existe comprobante fiscal.",
      tone: "info",
      value: formatMXN(fiscalSummary.nonDeductibleExpenses),
    },
  ].filter(Boolean).slice(0, 4) as AdminAlertItem[];

  if (alerts.length === 0) {
    alerts.push({
      title: "Sin pendientes críticos",
      detail: "El periodo está listo para revisión.",
      tone: "success",
      value: "OK",
    });
  }

  return { items, alerts, doneCount, score, tone, title, detail };
}

function buildDailyClose(entries: AccountingEntry[], cashBefore: number) {
  const cashEntries = entries.filter((entry) => entry.account === "caja");
  const date = cashEntries.map((entry) => entry.date).sort().at(-1) ?? "";
  const dayEntries = cashEntries.filter((entry) => entry.date === date);
  const previousDayEntries = cashEntries.filter((entry) => entry.date < date);
  const previousMovement = sumEntries(previousDayEntries, "ingreso", "caja") - sumEntries(previousDayEntries, "egreso", "caja");
  const cashIncome = sumEntries(dayEntries, "ingreso", "caja");
  const cashExpenses = sumEntries(dayEntries, "egreso", "caja");
  const expectedCash = cashBefore + previousMovement + cashIncome - cashExpenses;
  return {
    date,
    cashIncome,
    cashExpenses,
    expectedCash,
    difference: 0,
  };
}

function buildUnitProfitability(
  vehicles: ReturnType<typeof useDemoStore.getState>["vehicles"],
  trips: ReturnType<typeof useDemoStore.getState>["trips"],
  fuel: ReturnType<typeof useDemoStore.getState>["fuel"],
  maintenance: ReturnType<typeof useDemoStore.getState>["maintenance"],
) {
  return vehicles.map((vehicle) => {
    const income = trips
      .filter((trip) => trip.vehicleId === vehicle.id && trip.status === "completado")
      .reduce((sum, trip) => sum + trip.amount, 0);
    const fuelCost = fuel
      .filter((record) => record.vehicleId === vehicle.id)
      .reduce((sum, record) => sum + record.total, 0);
    const maintenanceCost = maintenance
      .filter((record) => record.vehicleId === vehicle.id)
      .reduce((sum, record) => sum + record.estimatedCost, 0);
    const operatingCost = Math.round(vehicle.odometerKm * 0.03);
    const cost = Math.round(fuelCost + maintenanceCost + operatingCost);
    const profit = income - cost;
    return {
      id: vehicle.id,
      code: `${vehicle.code} · ${vehicle.brand} ${vehicle.model}`,
      income,
      cost,
      profit,
      margin: income > 0 ? Math.max((profit / income) * 100, 0) : 0,
    };
  });
}

function buildFiscalSummary(entries: AccountingEntry[]) {
  const incomeEntries = entries.filter((entry) => entry.type === "ingreso");
  const expenseEntries = entries.filter((entry) => entry.type === "egreso");
  const billableIncome = incomeEntries
    .filter((entry) => getInvoiceStatus(entry) !== "no_requiere")
    .reduce((sum, entry) => sum + entry.amount, 0);
  const invoicedIncome = incomeEntries
    .filter((entry) => getInvoiceStatus(entry) === "facturada")
    .reduce((sum, entry) => sum + entry.amount, 0);
  const pendingInvoiceIncome = incomeEntries
    .filter((entry) => getInvoiceStatus(entry) === "por_facturar")
    .reduce((sum, entry) => sum + entry.amount, 0);
  const estimatedVat = billableIncome * 0.16;
  const deductibleExpenses = expenseEntries
    .filter((entry) => getDeductibleStatus(entry) === "deducible")
    .reduce((sum, entry) => sum + entry.amount, 0);
  const nonDeductibleExpenses = expenseEntries
    .filter((entry) => getDeductibleStatus(entry) === "no_deducible")
    .reduce((sum, entry) => sum + entry.amount, 0);
  return { billableIncome, invoicedIncome, pendingInvoiceIncome, estimatedVat, deductibleExpenses, nonDeductibleExpenses };
}

function getInvoiceStatus(entry: AccountingEntry): AccountingInvoiceStatus {
  if (entry.invoiceStatus) return entry.invoiceStatus;
  return entry.paymentMethod === "efectivo" ? "no_requiere" : "por_facturar";
}

function getDeductibleStatus(entry: AccountingEntry): AccountingDeductibleStatus {
  if (entry.deductibleStatus) return entry.deductibleStatus;
  return ["combustible", "mantenimiento", "oficina", "impuestos"].includes(entry.category) ? "deducible" : "no_deducible";
}

function PeriodStatusBadge({ closure }: { closure?: AccountingPeriodClose }) {
  if (!closure) {
    return (
      <Badge tone="info" className="justify-center">
        <UnlockKeyhole className="h-3.5 w-3.5" /> Abierto
      </Badge>
    );
  }
  return (
    <Badge tone={closure.status === "cerrado" ? "success" : "warning"} className="justify-center">
      <LockKeyhole className="h-3.5 w-3.5" /> {closure.status === "cerrado" ? "Cerrado" : "Con pendientes"}
    </Badge>
  );
}

function FiscalSignalCard({
  tone,
  title,
  detail,
  score,
  period,
}: {
  tone: BadgeTone;
  title: string;
  detail: string;
  score: number;
  period: string;
}) {
  const Icon = tone === "success" ? CheckCircle2 : tone === "danger" ? AlertTriangle : ClipboardCheck;
  return (
    <Card className={cn("overflow-hidden", tone === "danger" && "border-destructive/30", tone === "warning" && "border-warning/30")}>
      <CardContent className="p-0">
        <div className={cn("p-4", fiscalSignalBand(tone))}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">Semáforo fiscal · {period}</p>
              <h3 className="mt-1 font-heading text-2xl font-bold">{title}</h3>
            </div>
            <span className={cn("rounded-lg p-2", fiscalSignalIcon(tone))}>
              <Icon className="h-5 w-5" />
            </span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">{detail}</p>
        </div>
        <div className="border-t border-border p-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Avance de cierre</p>
              <p className="font-heading text-3xl font-bold tabular-nums">{score}%</p>
            </div>
            <Badge tone={tone} dot>{tone === "success" ? "Verde" : tone === "danger" ? "Crítico" : "Pendiente"}</Badge>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
            <div className={cn("h-full rounded-full", tone === "success" ? "bg-success" : tone === "danger" ? "bg-destructive" : "bg-warning")} style={{ width: `${score}%` }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CloseChecklistRow({ item }: { item: CloseControlItem }) {
  const Icon = item.done ? CheckCircle2 : AlertTriangle;
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border p-3">
      <span className={cn("mt-0.5 rounded-md p-1.5", item.done ? "bg-success-soft text-success" : item.tone === "danger" ? "bg-destructive-soft text-destructive" : "bg-warning-soft text-warning")}>
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-semibold">{item.label}</p>
          {item.value && <span className="whitespace-nowrap text-xs font-bold tabular-nums">{item.value}</span>}
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">{item.detail}</p>
      </div>
    </div>
  );
}

function AdminAlertRow({ alert }: { alert: AdminAlertItem }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{alert.title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{alert.detail}</p>
        </div>
        <Badge tone={alert.tone}>{alert.value}</Badge>
      </div>
    </div>
  );
}

function ClosureHistoryItem({ closure, onView }: { closure: AccountingPeriodClose; onView: (closure: AccountingPeriodClose) => void }) {
  const clean = closure.status === "cerrado";
  return (
    <div className="rounded-lg border border-border p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">{closure.periodLabel}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{formatDate(closure.closedAt, "dd MMM yyyy")}</p>
        </div>
        <Badge tone={clean ? "success" : "warning"}>{clean ? "Cerrado" : "Con pendientes"}</Badge>
      </div>
      <div className="mt-3 flex items-end justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground">Neto</p>
          <p className="font-semibold tabular-nums">{formatMXN(closure.net)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Cierre</p>
          <p className="font-semibold tabular-nums">{closure.fiscalScore}%</p>
        </div>
      </div>
      <Button type="button" size="sm" variant="outline" className="mt-3 w-full" onClick={() => onView(closure)}>
        <Eye /> Ver detalle
      </Button>
    </div>
  );
}

function AuditEventRow({ event }: { event: AccountingAuditEvent }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border p-3">
      <span className="mt-0.5 rounded-md bg-secondary p-1.5 text-muted-foreground">
        <RotateCcw className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold">{event.detail}</p>
          <span className="text-xs text-muted-foreground">{formatDate(event.date, "dd MMM HH:mm")}</span>
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {event.actor}{event.note ? ` · ${event.note}` : ""}
        </p>
      </div>
    </div>
  );
}

function PrintReportSheet({
  reportType,
  period,
  entries,
  summary,
  fiscalSummary,
  closeControl,
  closure,
}: {
  reportType: PrintReportType;
  period: PeriodOption;
  entries: AccountingEntry[];
  summary: ReturnType<typeof buildSummary>;
  fiscalSummary: ReturnType<typeof buildFiscalSummary>;
  closeControl: ReturnType<typeof buildCloseControl>;
  closure?: AccountingPeriodClose;
}) {
  const reportTitle = REPORT_LABELS[reportType];
  const visibleEntries = entries.slice(0, 14);
  return (
    <div className="accounting-print-area rounded-lg border border-border bg-muted p-4">
      <article className="accounting-letter-sheet mx-auto bg-white p-8 text-neutral-950 shadow-soft">
        <header className="flex items-start justify-between border-b border-neutral-300 pb-4">
          <div className="flex items-start gap-4">
            <Image
              src="/images/logos/logo_color.png"
              alt="GreenGo Transfers Cancún"
              width={132}
              height={56}
              className="h-14 w-auto object-contain"
            />
            <div>
              <h1 className="text-xl font-bold">{reportTitle}</h1>
              <p className="text-sm text-neutral-600">GreenGo Transfers Cancún</p>
              <p className="text-sm text-neutral-600">{period.label}</p>
            </div>
          </div>
          <div className="text-right text-xs text-neutral-600">
            <p>Generado: {formatDate(ACCOUNTING_TODAY, "dd MMM yyyy")}</p>
            <p>Formato carta · DEMO</p>
          </div>
        </header>

        <section className="mt-5 grid grid-cols-4 gap-3">
          <PrintMetric label="Ingresos" value={formatMXN(summary.income)} />
          <PrintMetric label="Egresos" value={formatMXN(summary.expenses)} />
          <PrintMetric label="Neto" value={formatMXN(summary.net)} />
          <PrintMetric label="Cierre" value={`${closeControl.score}%`} />
        </section>

        {reportType === "tax" ? (
          <section className="mt-5 grid grid-cols-2 gap-3">
            <PrintMetric label="Ingresos facturables" value={formatMXN(fiscalSummary.billableIncome)} />
            <PrintMetric label="IVA estimado" value={formatMXN(fiscalSummary.estimatedVat)} />
            <PrintMetric label="Ya facturado" value={formatMXN(fiscalSummary.invoicedIncome)} />
            <PrintMetric label="Por facturar" value={formatMXN(fiscalSummary.pendingInvoiceIncome)} />
            <PrintMetric label="Gastos deducibles" value={formatMXN(fiscalSummary.deductibleExpenses)} />
            <PrintMetric label="No deducibles" value={formatMXN(fiscalSummary.nonDeductibleExpenses)} />
          </section>
        ) : reportType === "closure" ? (
          <section className="mt-5">
            <h2 className="text-sm font-bold uppercase">Checklist de cierre</h2>
            <div className="mt-2 space-y-2">
              {closeControl.items.map((item) => (
                <div key={item.label} className="flex justify-between border-b border-neutral-200 py-2 text-sm">
                  <span>{item.label}</span>
                  <span>{item.done ? "Listo" : item.value ?? "Pendiente"}</span>
                </div>
              ))}
            </div>
            {closure && (
              <div className="mt-4 rounded border border-neutral-300 p-3 text-sm">
                <p><strong>Estado:</strong> {closure.status === "cerrado" ? "Cerrado" : "Cerrado con pendientes"}</p>
                <p><strong>Cerrado por:</strong> {closure.closedBy}</p>
                <p><strong>Fecha:</strong> {formatDate(closure.closedAt, "dd MMM yyyy HH:mm")}</p>
                {closure.note && <p><strong>Nota:</strong> {closure.note}</p>}
              </div>
            )}
          </section>
        ) : (
          <section className="mt-5">
            <h2 className="text-sm font-bold uppercase">Movimientos del periodo</h2>
            <PrintTable entries={visibleEntries} />
          </section>
        )}

        {reportType !== "accounting" && (
          <section className="mt-5">
            <h2 className="text-sm font-bold uppercase">Movimientos de soporte</h2>
            <PrintTable entries={visibleEntries.slice(0, 8)} />
          </section>
        )}

        <footer className="mt-6 border-t border-neutral-300 pt-3 text-xs text-neutral-500">
          Reporte generado con datos simulados del DEMO. No sustituye contabilidad fiscal real.
        </footer>
      </article>
    </div>
  );
}

function PrintMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-neutral-300 p-2">
      <p className="text-[10px] uppercase text-neutral-500">{label}</p>
      <p className="mt-1 text-base font-bold">{value}</p>
    </div>
  );
}

function PrintTable({ entries }: { entries: AccountingEntry[] }) {
  return (
    <table className="mt-2 w-full border-collapse text-xs">
      <thead>
        <tr className="bg-neutral-100">
          <th className="border border-neutral-300 p-2 text-left">Fecha</th>
          <th className="border border-neutral-300 p-2 text-left">Concepto</th>
          <th className="border border-neutral-300 p-2 text-left">Tipo</th>
          <th className="border border-neutral-300 p-2 text-right">Monto</th>
          <th className="border border-neutral-300 p-2 text-left">Fiscal</th>
        </tr>
      </thead>
      <tbody>
        {entries.map((entry) => (
          <tr key={entry.id}>
            <td className="border border-neutral-300 p-2">{formatDate(entry.date, "dd MMM")}</td>
            <td className="border border-neutral-300 p-2">{entry.concept}</td>
            <td className="border border-neutral-300 p-2">{TYPE_LABELS[entry.type]}</td>
            <td className="border border-neutral-300 p-2 text-right">{formatMXN(entry.amount)}</td>
            <td className="border border-neutral-300 p-2">
              {entry.type === "ingreso" ? INVOICE_STATUS_LABELS[getInvoiceStatus(entry)] : DEDUCTIBLE_STATUS_LABELS[getDeductibleStatus(entry)]}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function fiscalSignalBand(tone: BadgeTone) {
  if (tone === "success") return "bg-success-soft/70";
  if (tone === "danger") return "bg-destructive-soft/70";
  if (tone === "warning") return "bg-warning-soft/70";
  return "bg-secondary/70";
}

function fiscalSignalIcon(tone: BadgeTone) {
  if (tone === "success") return "bg-success text-success-foreground";
  if (tone === "danger") return "bg-destructive text-destructive-foreground";
  if (tone === "warning") return "bg-warning text-warning-foreground";
  return "bg-info text-info-foreground";
}

function CashRow({
  label,
  value,
  tone = "neutral",
  strong = false,
  icon: Icon = Wallet,
  textValue,
}: {
  label: string;
  value: number;
  tone?: "neutral" | "success" | "warning";
  strong?: boolean;
  icon?: typeof Wallet;
  textValue?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="h-4 w-4" /> {label}
      </span>
      <span
        className={cn(
          "text-right tabular-nums",
          strong ? "text-lg font-bold text-foreground" : "font-semibold",
          tone === "success" && "text-success",
          tone === "warning" && "text-warning",
        )}
      >
        {textValue ?? formatMXN(value)}
      </span>
    </div>
  );
}

function ProgressRow({ label, value, max }: { label: string; value: number; max: number }) {
  const percent = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-3 text-sm">
        <span className="truncate text-muted-foreground">{label}</span>
        <span className="font-semibold tabular-nums">{formatMXN(value)}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(percent, 100)}%` }} />
      </div>
    </div>
  );
}

function AdminMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-secondary/50 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-heading text-lg font-bold">{value}</p>
    </div>
  );
}

function CompactList<T>({ items, render }: { items: readonly T[]; render: (item: T) => React.ReactNode }) {
  return <div className="space-y-2">{items.map((item, index) => <React.Fragment key={index}>{render(item)}</React.Fragment>)}</div>;
}

function MoneyListItem({
  title,
  detail,
  amount,
  badge,
  tone = "neutral",
}: {
  title: string;
  detail: string;
  amount: number;
  badge?: string;
  tone?: "neutral" | "success" | "warning" | "info";
}) {
  return (
    <div className="rounded-lg border border-border p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{detail}</p>
        </div>
        <span className="whitespace-nowrap text-sm font-bold tabular-nums">{formatMXN(amount)}</span>
      </div>
      {badge && (
        <Badge className="mt-2" tone={tone === "success" ? "success" : tone === "info" ? "info" : tone === "warning" ? "warning" : "neutral"}>
          {badge}
        </Badge>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  const fallbackId = React.useId();
  const childId = React.isValidElement<{ id?: string }>(children) ? (children.props.id ?? fallbackId) : undefined;
  const content = React.isValidElement<{ id?: string }>(children)
    ? React.cloneElement(children, { id: childId })
    : children;

  return (
    <div>
      <Label htmlFor={childId} className="mb-1 block">
        {label}
      </Label>
      {content}
    </div>
  );
}

function DialogActions({ onCancel, submitLabel }: { onCancel: () => void; submitLabel: string }) {
  return (
    <div className="flex justify-end gap-2 border-t border-border pt-4">
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancelar
      </Button>
      <Button type="submit">{submitLabel}</Button>
    </div>
  );
}
