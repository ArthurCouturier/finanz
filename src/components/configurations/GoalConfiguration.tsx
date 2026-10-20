import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Number from "../Number";
import HoverInfo from "../HoverInfo";
import ValueUnit from "../ValueUnit";
import WealthChart, { WealthSeries } from "../WealthChart";
import PortfolioPlanner from "../PortfolioPlanner";
import { fmtMoney, fmtPct } from "@/utils/FormatUtils";
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
import { Switch } from "../ui/switch";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { ExportConfigurationButton } from "../buttons/DataImportButton";
import GoalConfigInterface, {
  FinancialIndependenceGoal,
  PortfolioPlan,
} from "@/interfaces/configurations/GoalConfigInterface";
import GoalConfigService from "@/services/configurations/GoalConfigService";
import { LifeSpendingService } from "@/services/LifeSpendingService";
import {
  annualContribution,
  computeGoal,
  FEASIBILITY_LEVELS,
  MAX_SEARCH_YEARS,
} from "@/services/GoalCalculationService";
import {
  computePortfolio,
  normalizePortfolioPlan,
} from "@/services/PortfolioCalculationService";
import {
  AMOUNT_CURVE,
  COMPARE_RATE_MAX,
  COMPARE_RATE_MIN,
  CONTRIBUTION_FREQUENCIES,
  CONTRIBUTION_FREQUENCY_ORDER,
  ContributionFrequency,
  DEFAULT_PASSIVE_YIELD_RATE,
  GOAL_TYPE_PRESETS,
  GoalType,
  PASSIVE_YIELD_RATE_MAX,
  START_AMOUNT_MAX,
  TARGET_AMOUNT_MAX,
  TARGET_AMOUNT_MIN,
  YEARS_MAX,
  YEARS_MIN,
} from "@/enums/GoalType";

/** Monthly living expenses of the first Life Spending config, without creating one. */
function readMonthlyExpenses(): number | null {
  const service = LifeSpendingService.getInstance();
  if (service.getAllConfigsIds().length === 0) return null;
  const configs = service.getAllConfigs();
  if (configs.length === 0) return null;
  return service.calculateMonthlyExpenses(configs[0]);
}

export default function GoalConfiguration({
  config,
}: {
  config: GoalConfigInterface;
}) {
  const navigateTo = useNavigate();
  const preset =
    GOAL_TYPE_PRESETS[config.type] ??
    GOAL_TYPE_PRESETS[GoalType.FINANCIAL_INDEPENDENCE];

  const [name, setName] = useState(config.name);
  const [goal, setGoal] = useState<FinancialIndependenceGoal>(() => ({
    ...config.financialIndependence,
    // Goals saved before these features have no yield rate / portfolio yet.
    passiveYieldRate:
      config.financialIndependence.passiveYieldRate ?? DEFAULT_PASSIVE_YIELD_RATE,
    portfolio: normalizePortfolioPlan(config.financialIndependence.portfolio),
  }));
  const [monthlyExpenses] = useState<number | null>(readMonthlyExpenses);
  const updateGoal = (patch: Partial<FinancialIndependenceGoal>) =>
    setGoal((prev) => ({ ...prev, ...patch }));
  const updatePlan = (patch: Partial<PortfolioPlan>) =>
    setGoal((prev) => ({ ...prev, portfolio: { ...prev.portfolio, ...patch } }));

  // Calcul en direct à chaque rendu (pur, peu coûteux).
  const result = computeGoal(goal);
  const portfolio = computePortfolio(goal);
  const level = result.feasibility;
  const frequency = CONTRIBUTION_FREQUENCIES[goal.contributionFrequency];
  const currentYear = new Date().getFullYear();

  const changeFrequency = (f: ContributionFrequency) =>
    updateGoal({
      contributionFrequency: f,
      contribution: Math.min(goal.contribution, CONTRIBUTION_FREQUENCIES[f].max),
    });

  // Enabling the comparison seeds its rate with the required one, so the
  // duplicated total starts on the target and then moves with the slider.
  const toggleCompare = (on: boolean) => {
    if (on && result.requiredRatePct !== null) {
      const seeded = Math.round(result.requiredRatePct * 10) / 10;
      updateGoal({
        compareEnabled: true,
        compareRate: Math.min(COMPARE_RATE_MAX, Math.max(COMPARE_RATE_MIN, seeded)),
      });
    } else {
      updateGoal({ compareEnabled: on });
    }
  };

  const handleSave = () => {
    GoalConfigService.getInstance().setConfig({
      ...config,
      name,
      financialIndependence: goal,
      updatedAt: new Date(),
    });
    toast.success("Objectif enregistré");
  };

  const series: WealthSeries[] = [
    {
      id: "required",
      label:
        result.requiredRatePct === null
          ? "Sans rendement · 0 %"
          : `Nécessaire · ${fmtPct(result.requiredRatePct)}`,
      color: "var(--chart-line-1)",
      points: result.requiredSeries,
    },
  ];
  if (goal.compareEnabled && result.compareSeries) {
    series.push({
      id: "compare",
      label: `Comparé · ${fmtPct(goal.compareRate)}`,
      color: "var(--chart-line-2)",
      points: result.compareSeries,
    });
  }
  if (goal.portfolio.enabled && portfolio.netAnnualizedRate !== null) {
    series.push({
      id: "portfolio",
      label: `Portefeuille · ${fmtPct(portfolio.netAnnualizedRate)}${
        goal.portfolio.inflationAdjusted ? " (€ constants)" : ""
      }`,
      color: "var(--chart-line-3)",
      points: portfolio.series,
    });
  }

  const compareOk = result.compareGap !== null && result.compareGap >= 0;
  const compareColor = compareOk ? "text-emerald-600" : "text-red-600";

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
          onClick={() => navigateTo("/chooseConfig/goal")}
        >
          Changer d'objectif
        </Button>
      </CardHeader>

      {/* Type d'objectif */}
      <CardContent className="flex flex-col items-center gap-2 text-center">
        <Badge variant="secondary" className="px-3 py-1 text-sm">
          {preset.emoji} {preset.label}
        </Badge>
        <p className="max-w-xl text-sm opacity-70">{preset.description}</p>
      </CardContent>

      {/* Paramètres */}
      <CardContent className="flex flex-col items-center gap-2">
        <h3 className="text-lg font-bold">🎛️ Paramètres</h3>
        <div className="flex flex-col flex-wrap items-center justify-center md:flex-row">
          <Number
            title="Départ"
            subtitle="€"
            className="w-45 mx-4"
            value={goal.startAmount}
            setValue={(v) => updateGoal({ startAmount: v })}
            min={0}
            max={START_AMOUNT_MAX}
            step={500}
            curve={AMOUNT_CURVE}
          />
          <div className="flex flex-col items-center">
            <Number
              title="Cible"
              subtitle="€"
              className="w-45 mx-4"
              value={goal.targetAmount}
              setValue={(v) => updateGoal({ targetAmount: v })}
              min={TARGET_AMOUNT_MIN}
              max={TARGET_AMOUNT_MAX}
              step={5000}
              curve={AMOUNT_CURVE}
            />
            <p className="-mt-1 flex flex-wrap items-center justify-center gap-1 text-sm opacity-70">
              💤 ≈{" "}
              <span className="font-semibold">
                {fmtMoney(result.monthlyPassiveIncome)}
              </span>{" "}
              / mois passifs à
              <input
                type="number"
                className="w-14 rounded-md border px-1 py-0.5 text-center text-sm"
                value={goal.passiveYieldRate}
                min={0}
                max={PASSIVE_YIELD_RATE_MAX}
                step={0.1}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  updateGoal({
                    passiveYieldRate: isNaN(v)
                      ? 0
                      : Math.min(PASSIVE_YIELD_RATE_MAX, Math.max(0, v)),
                  });
                }}
              />
              % / an
              <HoverInfo>
                <span className="block font-semibold">
                  Rente mensuelle ≈ capital × taux de rente ÷ 12
                </span>
                <span className="block">
                  Le taux par défaut suit la « règle des 4 % » : prélever chaque
                  année 4 % d'un portefeuille diversifié (≈ son rendement réel
                  moyen, inflation déduite) permet en théorie de vivre de ses
                  placements sans entamer le capital.
                </span>
                <span className="block opacity-70">
                  Estimation brute, avant impôts et prélèvements sociaux.
                </span>
              </HoverInfo>
            </p>
          </div>
          <div className="flex flex-col items-center">
            <Number
              title="Horizon"
              subtitle="ans"
              className="w-45 mx-4"
              value={goal.years}
              setValue={(v) => updateGoal({ years: v })}
              min={YEARS_MIN}
              max={YEARS_MAX}
              step={1}
            />
            <p className="-mt-1 text-sm opacity-70">
              📅 Date cible : {result.targetYear}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-center">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Number
              key={goal.contributionFrequency}
              title="Contribution"
              subtitle="€"
              className="w-45"
              value={goal.contribution}
              setValue={(v) => updateGoal({ contribution: v })}
              min={0}
              max={frequency.max}
              step={frequency.step}
            />
            <Select
              value={goal.contributionFrequency}
              onValueChange={(v) => changeFrequency(v as ContributionFrequency)}
            >
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CONTRIBUTION_FREQUENCY_ORDER.map((f) => (
                  <SelectItem key={f} value={f}>
                    {CONTRIBUTION_FREQUENCIES[f].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="max-w-xl text-center text-sm opacity-70">
            Soit{" "}
            {CONTRIBUTION_FREQUENCY_ORDER.filter((f) => f !== goal.contributionFrequency).map(
              (f, i) => (
                <span key={f}>
                  {i > 0 && " · "}
                  <span className="font-semibold">
                    {fmtMoney(
                      annualContribution(goal) / CONTRIBUTION_FREQUENCIES[f].periodsPerYear
                    )}
                  </span>{" "}
                  {CONTRIBUTION_FREQUENCIES[f].unit}
                </span>
              )
            )}
            {" · "}
            {fmtMoney(result.totalInvested)} versés au total sur{" "}
            {Math.max(1, Math.round(goal.years))} ans
          </p>
        </div>
      </CardContent>

      {/* Rendement nécessaire */}
      <CardContent className="flex flex-col items-center gap-1 text-center">
        <p>
          📈 Rendement annuel nécessaire :
          <HoverInfo>
            <span className="block font-semibold">
              Repères de rendement annuel (net de frais, hors inflation)
            </span>
            {FEASIBILITY_LEVELS.filter((l) => l.key !== "acquired").map((l) => (
              <span key={l.key} className="block">
                {l.emoji} {l.label}
                {l.maxRatePct !== null ? ` (≤ ${l.maxRatePct} %)` : " (> 15 %)"} :{" "}
                {l.description}
              </span>
            ))}
          </HoverInfo>
        </p>
        {result.requiredRatePct !== null ? (
          <ValueUnit
            value={result.requiredRatePct}
            unit="% / an"
            format={{ maximumFractionDigits: 1 }}
            className={`text-4xl font-bold ${level.className}`}
          />
        ) : (
          <span className={`text-4xl font-bold ${level.className}`}>—</span>
        )}
        <p className={`font-semibold ${level.className}`}>
          {level.emoji} {level.label}
        </p>
        <p className="max-w-md text-sm opacity-70">{level.description}</p>
        <div className="mt-2 grid grid-cols-1 gap-x-10 gap-y-2 sm:grid-cols-2">
          <div>
            <p>Total versé :</p>
            <ValueUnit
              value={result.totalInvested}
              unit="€"
              format={{ maximumFractionDigits: 0 }}
              className="text-2xl font-bold"
            />
          </div>
          <div>
            <p>
              Gains à générer :
              <HoverInfo>
                Ce que vos placements doivent produire en plus de vos versements
                pour atteindre la cible à l'horizon.
              </HoverInfo>
            </p>
            <ValueUnit
              value={Math.max(0, result.requiredGains)}
              unit="€"
              format={{ maximumFractionDigits: 0 }}
              className="text-2xl font-bold"
            />
          </div>
        </div>
      </CardContent>

      {/* Comparaison avec un taux choisi */}
      <CardContent className="flex flex-col items-center gap-2 text-center">
        <div className="flex items-center gap-2">
          <Switch checked={goal.compareEnabled} onCheckedChange={toggleCompare} />
          <p>
            Comparer avec un autre taux
            <HoverInfo>
              Le montant à l'horizon est dupliqué : faites varier le taux comparé
              pour voir où vous mènerait réellement un placement donné, puis
              comparez les deux courbes ci-dessous.
            </HoverInfo>
          </p>
        </div>
        {goal.compareEnabled && (
          <>
            <Number
              title="Taux comparé"
              subtitle="% / an"
              className="w-45"
              value={goal.compareRate}
              setValue={(v) => updateGoal({ compareRate: v })}
              min={COMPARE_RATE_MIN}
              max={COMPARE_RATE_MAX}
              step={0.1}
            />
            <div className="grid grid-cols-1 gap-x-10 gap-y-2 sm:grid-cols-2">
              <div>
                <p>À {fmtPct(result.requiredRatePct)} (nécessaire) :</p>
                <ValueUnit
                  value={goal.targetAmount}
                  unit="€"
                  format={{ maximumFractionDigits: 0 }}
                  className="text-2xl font-bold"
                />
                <p className="text-xs opacity-70">
                  💤 ≈ {fmtMoney(result.monthlyPassiveIncome)} / mois passifs
                </p>
              </div>
              <div>
                <p>À {fmtPct(goal.compareRate)} (comparé) :</p>
                <ValueUnit
                  value={result.compareFinalAmount ?? 0}
                  unit="€"
                  format={{ maximumFractionDigits: 0 }}
                  className={`text-2xl font-bold ${compareColor}`}
                />
                <p className="text-xs opacity-70">
                  💤 ≈ {fmtMoney(result.compareMonthlyPassiveIncome ?? 0)} / mois passifs
                </p>
              </div>
            </div>
            <p className="text-sm">
              Écart :{" "}
              <span className={`font-semibold ${compareColor}`}>
                {compareOk ? "+" : "−"}
                {fmtMoney(Math.abs(result.compareGap ?? 0))}
              </span>
              {" · "}
              {result.compareYearsToTarget === null ? (
                <span>cible non atteinte avant {MAX_SEARCH_YEARS} ans</span>
              ) : (
                <span>
                  cible atteinte en {result.compareYearsToTarget} an
                  {result.compareYearsToTarget > 1 ? "s" : ""} (
                  {currentYear + result.compareYearsToTarget})
                </span>
              )}
            </p>
          </>
        )}
      </CardContent>

      {/* Où investir quoi et quand */}
      <CardContent className="flex flex-col items-center gap-2">
        <PortfolioPlanner
          plan={goal.portfolio}
          onChange={updatePlan}
          result={portfolio}
          requiredRatePct={result.requiredRatePct}
          targetAmount={goal.targetAmount}
          years={Math.max(1, Math.round(goal.years))}
          startYear={currentYear}
          contributionUnit={frequency.unit}
          monthlyExpenses={monthlyExpenses}
        />
      </CardContent>

      {/* Graphique */}
      <CardContent className="flex flex-col items-center gap-2">
        <h3 className="text-lg font-bold">📊 Évolution du capital</h3>
        <WealthChart
          series={series}
          target={goal.targetAmount}
          startYear={currentYear}
          monthlyIncomeRate={goal.passiveYieldRate}
        />
      </CardContent>

      <CardFooter className="flex items-center justify-center gap-6 mt-4">
        <Button onClick={handleSave}>Enregistrer</Button>
        <ExportConfigurationButton uuid={config.uuid} name={name} />
      </CardFooter>
    </Card>
  );
}
