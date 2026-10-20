import { v4 as uuidv4 } from "uuid";
import Number from "./Number";
import HoverInfo from "./HoverInfo";
import ValueUnit from "./ValueUnit";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  ASSETS,
  ASSET_ORDER,
  AssetKey,
  ENVELOPES,
  ENVELOPE_ORDER,
  EnvelopeKey,
  HistoryPeriod,
  INFLATION,
  INFLATION_SOURCES,
  INVESTMENT_DATA_AS_OF,
  INVESTMENT_DATA_DOC_PATH,
  INVESTMENT_DATA_LAST_UPDATE,
  PORTFOLIO_PRESETS,
  PortfolioPreset,
  Source,
  TIMING_GUIDANCE,
  TMI_OPTIONS,
} from "@/data/InvestmentData";
import {
  PortfolioLine,
  PortfolioPlan,
} from "@/interfaces/configurations/GoalConfigInterface";
import {
  buildPresetLines,
  PortfolioComputation,
} from "@/services/PortfolioCalculationService";
import { fmtMoney, fmtPct } from "@/utils/FormatUtils";

const HISTORY_PERIODS: HistoryPeriod[] = [10, 20, 30];

const pct1 = (v: number) =>
  v.toLocaleString("fr-FR", { maximumFractionDigits: 1 });

function SourceLinks({ sources }: { sources: Source[] }) {
  return (
    <span className="inline-flex flex-wrap gap-x-1">
      {sources.map((s) => (
        <a
          key={s.url}
          href={s.url}
          target="_blank"
          rel="noreferrer"
          title={`${s.label} (${s.date})`}
          className="underline decoration-dotted opacity-70 hover:opacity-100"
        >
          ↗
        </a>
      ))}
    </span>
  );
}

function SourceList({ sources }: { sources: Source[] }) {
  return (
    <ul className="mt-2 list-disc space-y-0.5 pl-5 text-left text-xs opacity-70">
      {sources.map((s) => (
        <li key={s.url}>
          <a href={s.url} target="_blank" rel="noreferrer" className="underline">
            {s.label}
          </a>{" "}
          — {s.date}
        </li>
      ))}
    </ul>
  );
}

export default function PortfolioPlanner({
  plan,
  onChange,
  result,
  requiredRatePct,
  targetAmount,
  years,
  startYear,
  contributionUnit,
  monthlyExpenses,
}: {
  plan: PortfolioPlan;
  onChange: (patch: Partial<PortfolioPlan>) => void;
  result: PortfolioComputation;
  requiredRatePct: number | null;
  targetAmount: number;
  years: number;
  startYear: number;
  /** "/ mois", "/ an"… — the unit of the goal's contribution */
  contributionUnit: string;
  /** Monthly living expenses from the Life Spending config, when one exists */
  monthlyExpenses: number | null;
}) {
  const updateLine = (id: string, patch: Partial<PortfolioLine>) =>
    onChange({
      lines: plan.lines.map((l) => (l.id === id ? { ...l, ...patch } : l)),
    });
  const changeEnvelope = (line: PortfolioLine, envelope: EnvelopeKey) => {
    const asset = ASSETS[line.asset].envelopes.includes(envelope)
      ? line.asset
      : ASSET_ORDER.find((a) => ASSETS[a].envelopes.includes(envelope)) ?? line.asset;
    updateLine(line.id, { envelope, asset });
  };
  const addLine = () =>
    onChange({
      lines: [
        ...plan.lines,
        { id: uuidv4(), envelope: "pea", asset: "msci_world", weight: 10 },
      ],
    });
  const removeLine = (id: string) =>
    onChange({ lines: plan.lines.filter((l) => l.id !== id) });
  const applyPreset = (preset: PortfolioPreset) =>
    onChange({ lines: buildPresetLines(preset) });

  const hasPer = plan.lines.some((l) => l.envelope === "per" && l.weight > 0);
  const netRate = result.netAnnualizedRate;
  const beatsRequired =
    netRate !== null && requiredRatePct !== null && netRate >= requiredRatePct;
  const rateColor =
    netRate === null ? "" : beatsRequired ? "text-emerald-600" : "text-red-600";
  const sourceSet = new Map<string, Source>();
  for (const a of ASSET_ORDER) for (const s of ASSETS[a].sources) sourceSet.set(s.url, s);
  for (const e of ENVELOPE_ORDER) for (const s of ENVELOPES[e].sources) sourceSet.set(s.url, s);
  for (const s of INFLATION_SOURCES) sourceSet.set(s.url, s);

  return (
    <details className="w-full rounded-xl border text-left">
      <summary className="cursor-pointer px-4 py-3 text-lg font-bold">
        🧭 Où investir quoi et quand ?
        <span className="ml-2 text-sm font-normal opacity-70">
          {netRate === null
            ? "construisez un portefeuille pour obtenir un taux net"
            : `portefeuille : ${fmtPct(netRate)} net / an`}
        </span>
      </summary>

      <div className="space-y-4 px-4 pb-4">
        <p className="text-sm opacity-70">
          Données historiques en euros, dividendes réinvestis, arrêtées au{" "}
          {INVESTMENT_DATA_AS_OF} ; fiscalité 2026. Simulation pédagogique, pas un
          conseil en investissement : les rendements passés ne préjugent pas des
          rendements futurs.
        </p>

        {/* ---- Enveloppes ---- */}
        <details className="rounded-lg border">
          <summary className="cursor-pointer px-3 py-2 font-semibold">
            📚 Les enveloppes : où placer ?
          </summary>
          <div className="overflow-x-auto px-3 pb-3">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-1 pr-2">Enveloppe</th>
                  <th className="py-1 pr-2">Fiscalité des gains</th>
                  <th className="py-1 pr-2">Plafond</th>
                  <th className="py-1 pr-2">Disponibilité</th>
                  <th className="py-1 pr-2">Idéal pour</th>
                  <th className="py-1 pr-2">Frais / an</th>
                  <th className="py-1">Src</th>
                </tr>
              </thead>
              <tbody>
                {ENVELOPE_ORDER.map((key) => {
                  const e = ENVELOPES[key];
                  return (
                    <tr key={key} className="border-b align-top">
                      <td className="py-1 pr-2 font-semibold whitespace-nowrap">
                        {e.emoji} {e.label}
                      </td>
                      <td className="py-1 pr-2">{e.taxSummary}</td>
                      <td className="py-1 pr-2 whitespace-nowrap">
                        {e.ceiling === null
                          ? "Aucun"
                          : `${e.ceiling.toLocaleString("fr-FR")} €${e.ceilingPerYear ? " / an" : ""}`}
                      </td>
                      <td className="py-1 pr-2">{e.liquidity}</td>
                      <td className="py-1 pr-2">{e.bestFor}</td>
                      <td className="py-1 pr-2 whitespace-nowrap">
                        {e.defaultFee > 0 ? `≈ ${pct1(e.defaultFee)} %` : "≈ 0 %"}
                      </td>
                      <td className="py-1">
                        <SourceLinks sources={e.sources} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </details>

        {/* ---- Actifs ---- */}
        <details className="rounded-lg border">
          <summary className="cursor-pointer px-3 py-2 font-semibold">
            📊 Les actifs : quoi acheter ? (rendements annualisés 10 / 20 / 30 ans)
          </summary>
          <div className="overflow-x-auto px-3 pb-3">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-1 pr-2">Actif</th>
                  {HISTORY_PERIODS.map((p) => (
                    <th
                      key={p}
                      className={`py-1 pr-2 text-right ${p === plan.basisPeriod ? "underline" : ""}`}
                    >
                      {p} ans
                    </th>
                  ))}
                  <th className="py-1 pr-2 text-right">Volatilité</th>
                  <th className="py-1 pr-2 text-right">Pire chute</th>
                  <th className="py-1 pr-2 text-right">Frais</th>
                  <th className="py-1 pr-2">Enveloppes</th>
                  <th className="py-1 pr-2">Rôle / exemples</th>
                  <th className="py-1">Src</th>
                </tr>
              </thead>
              <tbody>
                {ASSET_ORDER.map((key) => {
                  const a = ASSETS[key];
                  return (
                    <tr key={key} className="border-b align-top">
                      <td className="py-1 pr-2 font-semibold whitespace-nowrap">
                        {a.emoji} {a.label}
                        {a.note && <HoverInfo>{a.note}</HoverInfo>}
                      </td>
                      {HISTORY_PERIODS.map((p) => (
                        <td
                          key={p}
                          className={`py-1 pr-2 text-right tabular-nums ${p === plan.basisPeriod ? "font-bold" : ""}`}
                        >
                          {pct1(a.returns[p])} %
                        </td>
                      ))}
                      <td className="py-1 pr-2 text-right tabular-nums">
                        {a.volatility === null ? "—" : `${pct1(a.volatility)} %`}
                      </td>
                      <td className="py-1 pr-2 text-right tabular-nums">
                        {a.maxDrawdown === null ? "—" : `${pct1(a.maxDrawdown)} %`}
                      </td>
                      <td className="py-1 pr-2 text-right tabular-nums">
                        {a.defaultFee > 0 ? `${a.defaultFee} %` : "inclus"}
                      </td>
                      <td className="py-1 pr-2">
                        {a.envelopes.map((e) => ENVELOPES[e].label).join(", ")}
                      </td>
                      <td className="py-1 pr-2">
                        {a.role}
                        <span className="block opacity-60">{a.examples}</span>
                      </td>
                      <td className="py-1">
                        <SourceLinks sources={a.sources} />
                      </td>
                    </tr>
                  );
                })}
                <tr className="align-top opacity-70">
                  <td className="py-1 pr-2 font-semibold whitespace-nowrap">📉 Inflation (INSEE)</td>
                  {HISTORY_PERIODS.map((p) => (
                    <td key={p} className="py-1 pr-2 text-right tabular-nums">
                      {pct1(INFLATION[p])} %
                    </td>
                  ))}
                  <td colSpan={5} className="py-1 pr-2">
                    Un placement doit battre l'inflation pour enrichir réellement : comparez
                    les colonnes à cette ligne.
                  </td>
                  <td className="py-1">
                    <SourceLinks sources={INFLATION_SOURCES} />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </details>

        {/* ---- Quand ---- */}
        <details className="rounded-lg border">
          <summary className="cursor-pointer px-3 py-2 font-semibold">
            🕰️ Quand investir ? La méthode en 5 étapes
          </summary>
          <ol className="space-y-2 px-3 pb-3 text-sm">
            {TIMING_GUIDANCE.map((g) => (
              <li key={g.title}>
                <span className="font-semibold">{g.title}.</span> {g.text}
                {g.source && (
                  <>
                    {" "}
                    <a
                      href={g.source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="underline decoration-dotted opacity-70"
                      title={g.source.date}
                    >
                      {g.source.label} ↗
                    </a>
                  </>
                )}
              </li>
            ))}
            {monthlyExpenses !== null && monthlyExpenses > 0 && (
              <li className="rounded-md bg-muted px-3 py-2">
                💡 D'après votre configuration « Dépenses de vie » ({fmtMoney(monthlyExpenses)} /
                mois), votre épargne de précaution devrait se situer entre{" "}
                <span className="font-semibold">{fmtMoney(monthlyExpenses * 3)}</span> et{" "}
                <span className="font-semibold">{fmtMoney(monthlyExpenses * 6)}</span> sur
                livrets avant d'investir le reste.
              </li>
            )}
          </ol>
        </details>

        {/* ---- Portefeuille ---- */}
        <div className="rounded-lg border px-3 py-3">
          <h4 className="mb-2 font-semibold">🧺 Mon portefeuille</h4>
          <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
            <span className="opacity-70">Partir d'un modèle :</span>
            {PORTFOLIO_PRESETS.map((p) => (
              <Button
                key={p.key}
                variant="outline"
                size="sm"
                title={p.description}
                onClick={() => applyPreset(p)}
              >
                {p.emoji} {p.label}
              </Button>
            ))}
          </div>

          <div className="space-y-2">
            {plan.lines.map((line, idx) => {
              const computed = result.lines[idx];
              const eligible = ASSET_ORDER.filter((a) =>
                ASSETS[a].envelopes.includes(line.envelope)
              );
              return (
                <div
                  key={line.id}
                  className="flex flex-wrap items-center justify-center gap-2 rounded-md border px-2 py-1"
                >
                  <Select
                    value={line.envelope}
                    onValueChange={(v) => changeEnvelope(line, v as EnvelopeKey)}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ENVELOPE_ORDER.map((e) => (
                        <SelectItem key={e} value={e}>
                          {ENVELOPES[e].emoji} {ENVELOPES[e].label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={line.asset}
                    onValueChange={(v) => updateLine(line.id, { asset: v as AssetKey })}
                  >
                    <SelectTrigger className="w-64">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {eligible.map((a) => (
                        <SelectItem key={a} value={a}>
                          {ASSETS[a].emoji} {ASSETS[a].label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Number
                    className="w-40"
                    value={line.weight}
                    setValue={(v) => updateLine(line.id, { weight: v })}
                    min={0}
                    max={100}
                    step={5}
                  />
                  <span className="w-24 text-sm opacity-70">
                    = {computed ? pct1(computed.share * 100) : "0"} % ·{" "}
                    {computed ? pct1(computed.grossRate - computed.feeRate) : "0"} % net
                    de frais
                  </span>
                  <Button variant="ghost" size="sm" onClick={() => removeLine(line.id)}>
                    ✕
                  </Button>
                </div>
              );
            })}
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-sm">
            <Button variant="outline" size="sm" onClick={addLine}>
              + Ajouter une ligne
            </Button>
            <span className="opacity-70">
              Σ poids = {pct1(result.weightSum)} %
              {Math.abs(result.weightSum - 100) > 0.01 && result.weightSum > 0
                ? " (normalisé à 100 %)"
                : ""}
            </span>
          </div>

          <h4 className="mt-4 mb-1 font-semibold">⚙️ Hypothèses</h4>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span>Historique de référence</span>
              <Select
                value={String(plan.basisPeriod)}
                onValueChange={(v) =>
                  onChange({ basisPeriod: globalThis.Number(v) as HistoryPeriod })
                }
              >
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HISTORY_PERIODS.map((p) => (
                    <SelectItem key={p} value={String(p)}>
                      {p} ans
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <HoverInfo>
                Les 10 dernières années ont été exceptionnelles pour les actions
                américaines ; 20 ou 30 ans incluent les crises de 2000 et 2008 et
                donnent une base plus prudente.
              </HoverInfo>
            </div>
            <Number
              title="Décote"
              subtitle="pts / an"
              className="w-44"
              value={plan.haircut}
              setValue={(v) => onChange({ haircut: v })}
              min={0}
              max={5}
              step={0.5}
            />
            <HoverInfo>
              Décote de prudence : points de rendement retirés chaque année aux
              actifs risqués (actions, or, immobilier, obligations) pour ne pas
              extrapoler les performances passées.
            </HoverInfo>
            <div className="flex items-center gap-2">
              <Switch
                checked={plan.inflationAdjusted}
                onCheckedChange={(v) => onChange({ inflationAdjusted: v })}
              />
              <span>
                Euros constants
                <HoverInfo>
                  Déflate la courbe du portefeuille avec l'inflation moyenne de la
                  période de référence ({pct1(INFLATION[plan.basisPeriod])} % / an) :
                  la cible est alors exprimée en pouvoir d'achat d'aujourd'hui.
                </HoverInfo>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={plan.glidePath}
                onCheckedChange={(v) => onChange({ glidePath: v })}
              />
              <span>
                Sécurisation progressive
                <HoverInfo>
                  Calendrier « équilibré horizon retraite » du PER : au moins 20 % de la
                  poche risquée est basculée vers le taux sécurisé à 10 ans de l'échéance,
                  50 % à 5 ans, 70 % à 2 ans.
                </HoverInfo>
              </span>
            </div>
            {plan.glidePath && (
              <Number
                title="Taux sécurisé"
                subtitle="% / an"
                className="w-44"
                value={plan.safeRate}
                setValue={(v) => onChange({ safeRate: v })}
                min={0}
                max={6}
                step={0.1}
              />
            )}
            {hasPer && (
              <>
                <div className="flex items-center gap-2">
                  <span>TMI aujourd'hui</span>
                  <Select
                    value={String(plan.tmiEntry)}
                    onValueChange={(v) => onChange({ tmiEntry: globalThis.Number(v) })}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TMI_OPTIONS.map((t) => (
                        <SelectItem key={t} value={String(t)}>
                          {t} %
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <HoverInfo>
                    Tranche marginale d'imposition : chaque euro versé sur le PER vous
                    fait économiser TMI centimes d'impôt, réinvestis dans la simulation.
                  </HoverInfo>
                </div>
                <div className="flex items-center gap-2">
                  <span>TMI à la sortie</span>
                  <Select
                    value={String(plan.tmiExit)}
                    onValueChange={(v) => onChange({ tmiExit: globalThis.Number(v) })}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TMI_OPTIONS.map((t) => (
                        <SelectItem key={t} value={String(t)}>
                          {t} %
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <HoverInfo>
                    À la retraite, le capital du PER est imposé au barème : une TMI plus
                    basse qu'aujourd'hui est tout l'intérêt du PER.
                  </HoverInfo>
                </div>
              </>
            )}
            <div className="flex items-center gap-2">
              <Switch
                checked={plan.enabled}
                onCheckedChange={(v) => onChange({ enabled: v })}
              />
              <span>Tracer le portefeuille sur le graphique</span>
            </div>
          </div>
        </div>

        {/* ---- Résultat ---- */}
        <div className="rounded-lg border px-3 py-3 text-center">
          <h4 className="mb-2 font-semibold">🎯 Résultat de ce portefeuille</h4>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 md:grid-cols-4">
            <div>
              <p className="text-sm opacity-70">
                Rendement brut pondéré
                <HoverInfo>
                  Moyenne des rendements historiques pondérée par les poids. Le taux
                  net annualisé peut la dépasser : la ligne la plus performante pèse
                  de plus en plus lourd au fil des ans (intérêts composés).
                </HoverInfo>
              </p>
              <ValueUnit
                value={result.weightedGrossRate}
                unit="%"
                format={{ maximumFractionDigits: 1 }}
                className="text-xl font-bold"
              />
            </div>
            <div>
              <p className="text-sm opacity-70">Frais</p>
              <ValueUnit
                value={-result.weightedFeeRate}
                unit="% / an"
                format={{ maximumFractionDigits: 2 }}
                className="text-xl font-bold"
              />
            </div>
            <div>
              <p className="text-sm opacity-70">
                Impôts à la sortie
                <HoverInfo>
                  Prélèvements sociaux et impôt dus si tout est liquidé en{" "}
                  {startYear + years}, enveloppe par enveloppe (PEA après 5 ans,
                  assurance-vie après 8 ans, capital du PER au barème…). Frais cumulés
                  sur la période : {fmtMoney(result.totalFees)}.
                </HoverInfo>
              </p>
              <ValueUnit
                value={-result.totalTax}
                unit="€"
                format={{ maximumFractionDigits: 0 }}
                className="text-xl font-bold"
              />
            </div>
            <div>
              <p className="text-sm opacity-70">
                Taux net annualisé
                <HoverInfo>
                  Taux constant qui transformerait votre effort d'épargne (départ +
                  versements) en ce capital net : il intègre frais, fiscalité, économie
                  d'impôt du PER et sécurisation progressive.
                </HoverInfo>
              </p>
              {netRate === null ? (
                <span className="text-2xl font-bold">—</span>
              ) : (
                <ValueUnit
                  value={netRate}
                  unit="% / an"
                  format={{ maximumFractionDigits: 1 }}
                  className={`text-3xl font-bold ${rateColor}`}
                />
              )}
              {result.realAnnualizedRate !== null && (
                <p className="text-xs opacity-70">
                  soit {fmtPct(result.realAnnualizedRate)} réels (inflation{" "}
                  {pct1(result.inflationRate)} %)
                </p>
              )}
            </div>
          </div>

          <p className="mt-3 text-sm">
            {netRate !== null && requiredRatePct !== null && (
              <span className={`font-semibold ${rateColor}`}>
                {beatsRequired ? "✅" : "⚠️"} {fmtPct(netRate)} net contre{" "}
                {fmtPct(requiredRatePct)} nécessaire
              </span>
            )}
          </p>
          <div className="mt-2 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
            <div>
              <p className="text-sm opacity-70">
                Capital net en {startYear + years}
                {plan.inflationAdjusted ? " (euros constants)" : ""}
              </p>
              <ValueUnit
                value={result.series[result.series.length - 1]?.amount ?? 0}
                unit="€"
                format={{ maximumFractionDigits: 0 }}
                className={`text-2xl font-bold ${result.reachesTarget ? "text-emerald-600" : "text-red-600"}`}
              />
              <p className="text-xs opacity-70">
                cible {fmtMoney(targetAmount)} · brut avant impôts{" "}
                {fmtMoney(result.grossFinal)}
              </p>
            </div>
            <div>
              <p className="text-sm opacity-70">Versement nécessaire avec ce portefeuille</p>
              {result.contributionNeeded === null ? (
                <span className="text-2xl font-bold">—</span>
              ) : (
                <ValueUnit
                  value={result.contributionNeeded}
                  unit={`€ ${contributionUnit}`}
                  format={{ maximumFractionDigits: 0 }}
                  className="text-2xl font-bold"
                />
              )}
              <p className="text-xs opacity-70">
                pour atteindre exactement la cible à l'horizon
              </p>
            </div>
          </div>
          <p className="mt-2 text-xs opacity-70">
            Risque indicatif : volatilité ≈ {pct1(result.weightedVolatility)} % / an ·
            pire chute historique d'une ligne {pct1(result.worstDrawdown)} %
            {plan.glidePath
              ? ` · part sécurisée la dernière année ${pct1(result.secureShareByYear[years] * 100)} %`
              : ""}
          </p>

          {result.warnings.length > 0 && (
            <ul className="mx-auto mt-3 max-w-2xl space-y-1 text-left text-sm">
              {result.warnings.map((w) => (
                <li key={w.message} className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-1">
                  ⚠️ {w.message}
                </li>
              ))}
            </ul>
          )}

          {result.lines.length > 0 && (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-1 pr-2">Ligne</th>
                    <th className="py-1 pr-2 text-right">Part</th>
                    <th className="py-1 pr-2 text-right">Brut</th>
                    <th className="py-1 pr-2 text-right">Frais</th>
                    <th className="py-1 pr-2 text-right">Fiscalité</th>
                    <th className="py-1 pr-2 text-right">Effort versé</th>
                    <th className="py-1 pr-2 text-right">Impôts</th>
                    <th className="py-1 text-right">Net en {startYear + years}</th>
                  </tr>
                </thead>
                <tbody>
                  {result.lines.map((l) => (
                    <tr key={l.line.id} className="border-b">
                      <td className="py-1 pr-2 whitespace-nowrap">
                        {ENVELOPES[l.line.envelope].emoji} {ENVELOPES[l.line.envelope].label} ·{" "}
                        {ASSETS[l.line.asset].emoji} {ASSETS[l.line.asset].label}
                        {l.boost > 1 && (
                          <span className="opacity-60"> (×{pct1(l.boost)} déduction PER)</span>
                        )}
                      </td>
                      <td className="py-1 pr-2 text-right tabular-nums">{pct1(l.share * 100)} %</td>
                      <td className="py-1 pr-2 text-right tabular-nums">{pct1(l.grossRate)} %</td>
                      <td className="py-1 pr-2 text-right tabular-nums">{l.feeRate.toFixed(2)} %</td>
                      <td className="py-1 pr-2 text-right tabular-nums">
                        {l.line.envelope === "per"
                          ? `${pct1(l.taxRateApplied)} % + TMI`
                          : `${pct1(l.taxRateApplied)} %`}
                      </td>
                      <td className="py-1 pr-2 text-right tabular-nums">{fmtMoney(l.effort)}</td>
                      <td className="py-1 pr-2 text-right tabular-nums">{fmtMoney(l.tax)}</td>
                      <td className="py-1 text-right font-semibold tabular-nums">{fmtMoney(l.netValue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <details className="rounded-lg border">
          <summary className="cursor-pointer px-3 py-2 text-sm font-semibold">
            📎 Toutes les sources ({sourceSet.size}) · dernière vérification le{" "}
            {INVESTMENT_DATA_LAST_UPDATE}
          </summary>
          <div className="px-3 pb-3">
            <SourceList sources={[...sourceSet.values()]} />
            <p className="mt-2 text-xs opacity-60">
              Procédure de mise à jour : {INVESTMENT_DATA_DOC_PATH}
            </p>
          </div>
        </details>
      </div>
    </details>
  );
}
