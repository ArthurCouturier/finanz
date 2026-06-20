import NumberFlow from "@number-flow/react";
import Number from "../Number";
import HoverInfo from "../HoverInfo";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import HouseConfigInterface from "@/interfaces/configurations/HouseConfigInterface";
import LoanInterface from "@/interfaces/configurations/LoanInterface";
import IncomeInterface from "@/interfaces/IncomeInterface";
import HouseConfigService from "@/services/configurations/HouseConfigService";
import {
  computeHouse,
  computeLoan,
  MAX_DEBT_RATIO,
} from "@/services/HouseCalculationService";
import {
  LoanType,
  LOAN_TYPE_PRESETS,
  createLoan,
  LOAN_MIN_AMOUNT,
  AMOUNT_CURVE,
} from "@/enums/LoanType";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";
import { ExportConfigurationButton } from "../buttons/DataImportButton";

/**
 * Animated number kept centered in place, with its unit (€, %, ...) pinned
 * absolutely just to its right so it never shifts the digits off-center.
 */
function ValueUnit({
  value,
  unit,
  className,
}: {
  value: number;
  unit: string;
  className?: string;
}) {
  return (
    <span className="relative inline-flex justify-center">
      <NumberFlow value={value} className={className} />
      <span className="absolute left-full top-1/2 ml-1 -translate-y-1/2 whitespace-nowrap text-sm font-normal opacity-70">
        {unit}
      </span>
    </span>
  );
}

export default function HouseConfiguration({
  config,
}: {
  config: HouseConfigInterface;
}) {
  const navigateTo = useNavigate();

  const [name, setName] = useState(config.name);
  const [loans, setLoans] = useState<LoanInterface[]>(config.loans);
  const [downPayment, setDownPayment] = useState(config.downPayment);
  const [incomes, setIncomes] = useState<IncomeInterface[]>(config.incomes);

  const [propertyKind, setPropertyKind] = useState(config.propertyKind);
  const [notaryRateOld, setNotaryRateOld] = useState(config.notaryRateOld);
  const [notaryRateNew, setNotaryRateNew] = useState(config.notaryRateNew);
  const [agencyRate, setAgencyRate] = useState(config.agencyRate);
  const [agencyIncluded, setAgencyIncluded] = useState(config.agencyIncluded);

  const [inclInsurance, setInclInsurance] = useState(config.inclInsurance);
  const [decimal, setDecimal] = useState(false);
  const [loanTypeToAdd, setLoanTypeToAdd] = useState<LoanType>(LoanType.BANK);

  // Calcul en direct à chaque rendu (pur, peu coûteux).
  const draft: HouseConfigInterface = {
    ...config,
    name,
    loans,
    downPayment,
    incomes,
    propertyKind,
    notaryRateOld,
    notaryRateNew,
    agencyRate,
    agencyIncluded,
    inclInsurance,
  };
  const result = computeHouse(draft);

  const fmt = (value: number) => parseFloat(value.toFixed(decimal ? 2 : 0));

  // --- Gestion des crédits ---
  const updateLoan = (id: string, patch: Partial<LoanInterface>) =>
    setLoans((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...patch } : l))
    );
  const addLoan = () => setLoans((prev) => [...prev, createLoan(loanTypeToAdd)]);
  const removeLoan = (id: string) =>
    setLoans((prev) => prev.filter((l) => l.id !== id));

  // --- Gestion des revenus ---
  const updateIncome = (id: string, patch: Partial<IncomeInterface>) =>
    setIncomes((prev) =>
      prev.map((i) => (i.id === id ? { ...i, ...patch } : i))
    );
  const addIncome = () =>
    setIncomes((prev) => [
      ...prev,
      { id: uuidv4(), label: "Revenu", amount: 2000, frequency: "monthly" },
    ]);
  const removeIncome = (id: string) =>
    setIncomes((prev) => prev.filter((i) => i.id !== id));

  const handleSave = () => {
    HouseConfigService.getInstance().setConfig({
      ...config,
      name,
      loans,
      downPayment,
      incomes,
      propertyKind,
      notaryRateOld,
      notaryRateNew,
      agencyRate,
      agencyIncluded,
      inclInsurance,
      updatedAt: new Date(),
    });
    toast.success("Configuration enregistrée");
  };

  const notaryRate = propertyKind === "new" ? notaryRateNew : notaryRateOld;
  const debtPct = result.debtRatio !== null ? result.debtRatio * 100 : null;
  const debtOk = debtPct !== null && debtPct <= MAX_DEBT_RATIO * 100;

  return (
    <Card className="h-fit">
      <CardHeader className="relative">
        <Button
          className="absolute left-4 -top-1.5 blue"
          onClick={() => navigateTo("/")}
        >
          Accueil
        </Button>
        <CardTitle>
          <h2>
            <input
              className="text-center"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </h2>
        </CardTitle>
        <Button
          className="absolute right-4 -top-1.5 blue"
          onClick={() => navigateTo("/chooseConfig/house")}
        >
          Changer de config
        </Button>
      </CardHeader>

      {/* Revenus de référence (en haut) */}
      <CardContent className="flex flex-col items-center gap-2">
        <h3 className="text-lg font-bold">💶 Revenus de référence</h3>
        {incomes.map((inc) => (
          <div key={inc.id} className="flex items-center gap-2">
            <input
              className="w-32 rounded-md border px-2 py-1 text-sm"
              value={inc.label}
              onChange={(e) => updateIncome(inc.id, { label: e.target.value })}
            />
            <Number
              className="w-40"
              value={inc.amount}
              setValue={(v) => updateIncome(inc.id, { amount: v })}
              min={0}
              max={inc.frequency === "annual" ? 240000 : 20000}
              step={inc.frequency === "annual" ? 1000 : 100}
            />
            <Select
              value={inc.frequency}
              onValueChange={(v) =>
                updateIncome(inc.id, {
                  frequency: v as IncomeInterface["frequency"],
                })
              }
            >
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">/ mois</SelectItem>
                <SelectItem value="annual">/ an</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeIncome(inc.id)}
            >
              ✕
            </Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={addIncome}>
          + Ajouter un revenu
        </Button>
        <p className="text-sm opacity-70">
          Revenu net mensuel :{" "}
          <span className="font-semibold">{fmt(result.monthlyIncome)} €</span>
        </p>
      </CardContent>

      {/* Réglages globaux */}
      <CardContent className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
        <Switch checked={inclInsurance} onCheckedChange={setInclInsurance} />
        <p>Assurance incluse</p>
        <Switch checked={decimal} onCheckedChange={setDecimal} />
        <p>Décimales</p>
      </CardContent>

      {/* Crédits */}
      <CardContent className="flex flex-col items-center gap-3">
        <h3 className="text-lg font-bold">🏦 Crédits</h3>
        {loans.map((loan) => {
          const preset = LOAN_TYPE_PRESETS[loan.type];
          const comp = computeLoan(loan, inclInsurance);
          return (
            <div
              key={loan.id}
              className="w-full max-w-3xl rounded-xl border p-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={loan.enabled}
                    onCheckedChange={(v) => updateLoan(loan.id, { enabled: v })}
                  />
                  <span className="text-lg">{preset.emoji}</span>
                  <span className="font-semibold">{preset.label}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeLoan(loan.id)}
                >
                  ✕
                </Button>
              </div>
              <div
                className={`flex flex-col flex-wrap items-center justify-center md:flex-row ${
                  loan.enabled ? "" : "opacity-40"
                }`}
              >
                <Number
                  title="Montant"
                  subtitle="€"
                  className="w-44 mx-2"
                  value={loan.amount}
                  setValue={(v) => updateLoan(loan.id, { amount: v })}
                  min={LOAN_MIN_AMOUNT}
                  max={preset.maxAmount}
                  step={5000}
                  curve={AMOUNT_CURVE}
                />
                {preset.rateEditable ? (
                  <Number
                    title="Taux"
                    subtitle="%"
                    className="w-44 mx-2"
                    value={loan.rate}
                    setValue={(v) => updateLoan(loan.id, { rate: v })}
                    min={0}
                    max={10}
                    step={0.05}
                  />
                ) : (
                  <div className="w-44 mx-2 my-2 text-center">
                    <h2 className="text-lg font-bold">Taux</h2>
                    <p className="opacity-70">0% (fixe)</p>
                  </div>
                )}
                <Number
                  title="Durée"
                  subtitle="ans"
                  className="w-44 mx-2"
                  value={loan.years}
                  setValue={(v) => updateLoan(loan.id, { years: v })}
                  min={1}
                  max={40}
                  step={1}
                />
                {preset.hasInsurance && (
                  <Number
                    title="Assurance"
                    subtitle="%"
                    className="w-44 mx-2"
                    value={loan.insuranceRate}
                    setValue={(v) => updateLoan(loan.id, { insuranceRate: v })}
                    min={0}
                    max={1}
                    step={0.01}
                  />
                )}
                {preset.hasDeferral && (
                  <Number
                    title="Différé"
                    subtitle="mois"
                    className="w-44 mx-2"
                    value={loan.deferralMonths}
                    setValue={(v) => updateLoan(loan.id, { deferralMonths: v })}
                    min={0}
                    max={Math.max(0, loan.years * 12 - 1)}
                    step={1}
                  />
                )}
              </div>
              <p className="text-center text-sm opacity-70">
                Mensualité : {fmt(comp.monthlyTotal)} € · Coût total :{" "}
                {fmt(comp.totalCost)} €
              </p>
            </div>
          );
        })}

        <div className="flex items-center justify-center gap-2">
          <Select
            value={loanTypeToAdd}
            onValueChange={(v) => setLoanTypeToAdd(v as LoanType)}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.values(LoanType).map((t) => (
                <SelectItem key={t} value={t}>
                  {LOAN_TYPE_PRESETS[t].emoji} {LOAN_TYPE_PRESETS[t].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={addLoan}>+ Ajouter un crédit</Button>
        </div>
      </CardContent>

      {/* Apport + frais */}
      <CardContent className="flex flex-col flex-wrap items-center justify-center gap-4 md:flex-row md:items-start">
        <div className="flex flex-col items-center">
          <h3 className="text-lg font-bold">💰 Apport</h3>
          <Number
            subtitle="€"
            className="w-44"
            value={downPayment}
            setValue={setDownPayment}
            min={0}
            max={1500000}
            step={5000}
            curve={AMOUNT_CURVE}
          />
        </div>
        <div className="flex flex-col items-center">
          <h3 className="text-lg font-bold">
            🧾 Frais
            <HoverInfo>
              <span className="block font-semibold">Ancien ou neuf : des frais différents</span>
              <span className="block">
                Dans l'ancien, les frais de notaire sont élevés (~7–8 %) car ils
                incluent les droits de mutation.
              </span>
              <span className="block">
                Dans le neuf (VEFA), ils sont réduits (~2–3 %) : droits de
                mutation allégés et TVA déjà comprise dans le prix.
              </span>
              <span className="block opacity-70">
                Les frais d'agence, eux, s'ajoutent (ou sont inclus, FAI) selon
                le bien.
              </span>
            </HoverInfo>
          </h3>
          <div className="my-2 flex items-center gap-2">
            <span className={propertyKind === "old" ? "font-semibold" : "opacity-60"}>
              Ancien
            </span>
            <Switch
              checked={propertyKind === "new"}
              onCheckedChange={(v) => setPropertyKind(v ? "new" : "old")}
            />
            <span className={propertyKind === "new" ? "font-semibold" : "opacity-60"}>
              Neuf
            </span>
          </div>
          <div className="flex flex-col flex-wrap items-center justify-center md:flex-row">
            <Number
              title="Notaire"
              subtitle="%"
              className="w-44 mx-2"
              value={propertyKind === "new" ? notaryRateNew : notaryRateOld}
              setValue={
                propertyKind === "new" ? setNotaryRateNew : setNotaryRateOld
              }
              min={0}
              max={15}
              step={0.1}
            />
            <Number
              title="Agence"
              subtitle="%"
              className="w-44 mx-2"
              value={agencyRate}
              setValue={setAgencyRate}
              min={0}
              max={10}
              step={0.1}
            />
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={agencyIncluded}
              onCheckedChange={setAgencyIncluded}
            />
            <p>
              Frais d'agence inclus (FAI)
              <HoverInfo>
                Activé, le prix affiché inclut déjà les frais d'agence. La
                trésorerie totale nécessaire est identique dans les deux cas :
                seul l'affichage du prix change.
              </HoverInfo>
            </p>
          </div>
        </div>
      </CardContent>

      {/* Synthèse */}
      <CardContent className="grid w-fit mx-auto grid-cols-1 gap-x-8 sm:grid-cols-2">
        <CardContent className="text-center">
          <p>Total emprunté :</p>
          <ValueUnit value={fmt(result.totalBorrowed)} unit="€" className="text-2xl font-bold" />
        </CardContent>
        <CardContent className="text-center">
          <p>
            Coût du crédit :
            <HoverInfo>
              <span className="block font-semibold">Intérêts + assurance</span>
              {result.loanComputations.map((c) => (
                <span key={c.loan.id} className="block">
                  {LOAN_TYPE_PRESETS[c.loan.type].emoji}{" "}
                  {LOAN_TYPE_PRESETS[c.loan.type].label} : intérêts{" "}
                  {fmt(c.totalInterest)} € · assurance {fmt(c.totalInsurance)} €
                </span>
              ))}
              {result.loanComputations.length === 0 && (
                <span className="block">Aucun crédit actif</span>
              )}
            </HoverInfo>
          </p>
          <ValueUnit value={fmt(result.extraToRepay)} unit="€" className="text-2xl font-bold" />
        </CardContent>
        <CardContent className="text-center">
          <p>Apport :</p>
          <ValueUnit value={fmt(result.downPayment)} unit="€" className="text-2xl font-bold" />
        </CardContent>
        <CardContent className="text-center">
          <p>
            Frais (notaire + agence) :
            <HoverInfo>
              <span className="block">Notaire ({notaryRate}%) : {fmt(result.notaryFees)} €</span>
              <span className="block">Agence ({agencyRate}%) : {fmt(result.agencyFees)} €</span>
              <span className="block opacity-70">
                Prix net vendeur : {fmt(result.netSellerPrice)} €
              </span>
            </HoverInfo>
          </p>
          <ValueUnit value={fmt(result.totalFees)} unit="€" className="text-2xl font-bold" />
        </CardContent>
        <CardContent className="sm:col-span-2 text-center">
          <p>
            🏡 Pouvoir d'achat (prix du bien) :
            <HoverInfo>
              Enveloppe (crédits + apport) {fmt(result.envelope)} € moins les frais,
              {agencyIncluded
                ? " frais d'agence inclus dans le prix."
                : " frais d'agence ajoutés en plus."}
            </HoverInfo>
          </p>
          <ValueUnit
            value={fmt(result.purchasingPower)}
            unit="€"
            className="text-3xl font-bold text-emerald-600"
          />
        </CardContent>
        <CardContent className="sm:col-span-2 text-center">
          <p>Mensualité totale :</p>
          <ValueUnit value={fmt(result.monthlyTotal)} unit="€" className="text-2xl font-bold" />
          <p className="mt-1 text-sm">
            Taux d'endettement :{" "}
            {debtPct === null ? (
              <span className="opacity-60">— (ajoutez un revenu)</span>
            ) : (
              <span
                className={`font-semibold ${
                  debtOk ? "text-emerald-600" : "text-red-600"
                }`}
              >
                {debtPct.toFixed(1)}% {debtOk ? "✅" : "⚠️"}
                <HoverInfo>
                  La recommandation HCSF plafonne le taux d'endettement à{" "}
                  {MAX_DEBT_RATIO * 100}%.
                </HoverInfo>
              </span>
            )}
          </p>
        </CardContent>
      </CardContent>

      <CardFooter className="flex items-center justify-center gap-6 mt-4">
        <Button onClick={handleSave}>Enregistrer</Button>
        <ExportConfigurationButton uuid={config.uuid} name={name} />
      </CardFooter>
    </Card>
  );
}
