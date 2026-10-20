# Données du planificateur « Où investir quoi et quand ? »

**Dernière vérification complète : 20 octobre 2026** (séries historiques arrêtées au 30 septembre 2026, fiscalité 2026).

Toutes les valeurs vivent dans un seul fichier : `src/data/InvestmentData.ts`. Ce document dit, pour chaque valeur, où elle est, d'où elle vient, quand elle a été relevée et quand la revérifier. Mettez à jour les deux constantes `INVESTMENT_DATA_AS_OF` (fin des séries) et `INVESTMENT_DATA_LAST_UPDATE` (jour de la vérification) à chaque passage : elles s'affichent dans l'application.

## Calendrier de mise à jour

| Quand | Quoi | Où dans le code |
|---|---|---|
| **1er février et 1er août** | Taux Livret A / LDDS / LEP (révision semestrielle) | `ASSETS.livret_a.examples`, `.note` ; `ENVELOPES.livret.sources` |
| **Janvier** (après loi de finances + LFSS) | PFU, prélèvements sociaux, régimes PEA / AV / PER, plafond PER (10 % de 8 PASS), tranches TMI | `ENVELOPES.*.taxRateLong / taxRateShort / abatement / ceiling / taxSummary`, `TMI_OPTIONS` |
| **Février–mars** (publication France Assureurs / ACPR) | Rendement moyen des fonds euros de l'année écoulée ; frais moyens AV / PER | `ASSETS.fonds_euros.returns`, `.examples`, `.note` ; `ENVELOPES.av.defaultFee`, `ENVELOPES.per.defaultFee` |
| **Février** (publication ASPIM / IEIF) | Taux de distribution et TRI 10 / 20 ans des SCPI | `ASSETS.scpi.returns`, `.examples`, `.note` |
| **Janvier** (INSEE) | Inflation de l'année écoulée → recalcul des moyennes 10 / 20 / 30 ans | `INFLATION` |
| **Une fois par an** (ou après un krach) | Rendements annualisés 10 / 20 / 30 ans, volatilité, pire chute de chaque indice | `ASSETS.*.returns / volatility / maxDrawdown` |
| **Une fois par an** | Frais (TER) des ETF cités en exemple | `ASSETS.*.defaultFee`, `.examples` |
| **Quand une source change** | Libellé, URL et date de chaque source | `sources` de chaque entrée, `INFLATION_SOURCES`, `GLIDE_PATH_SOURCE`, `TIMING_GUIDANCE[].source` |

## Fiscalité et enveloppes (`ENVELOPES`)

| Donnée | Valeur utilisée | Champ | Source | Relevé le |
|---|---|---|---|---|
| PFU (CTO, PER gains) | **31,4 %** = 12,8 % IR + 18,6 % PS depuis le 1er janvier 2026 (CSG 9,2 → 10,6 %, LFSS 2026 art. 12) | `cto.taxRateLong/Short`, `per.taxRateLong`, `pea.taxRateShort` | [La finance pour tous — Comprendre le PFU](https://www.lafinancepourtous.com/pratique/impots/fiscalite-de-l-epargne-2/prelevement-forfaitaire-unique-pfu/comprendre-le-pfu/) (mis à jour le 19/01/2026) ; [Lita — CSG 10,6 % et ce qui reste à 9,2 %](https://lita-ec.fr/csg-sur-les-revenus-du-capital-la-hausse-a-106-en-2026-et-ce-qui-reste-a-92/) (14/01/2026) | 20/10/2026 |
| PEA après 5 ans | **18,6 %** (PS seuls, 0 % IR) ; avant 5 ans 31,4 % ; plafond 150 000 € | `pea.*` | [service-public F2385](https://www.service-public.gouv.fr/particuliers/vosdroits/F2385) (vérifié le 22/05/2026) ; [service-public F22449](https://www.service-public.gouv.fr/particuliers/vosdroits/F22449) (15/04/2026) ; [Les Clés de la Banque](https://www.lesclesdelabanque.com/particulier/fiscalite-pea/) pour le 18,6 % | 20/10/2026 |
| ⚠️ Point à confirmer | L'application de la CSG à 10,6 % aux gains du PEA est annoncée par les sources privées mais la page service-public ne donne pas le taux. Vérifier au BOFiP / art. L136-8 CSS. | `pea.taxRateLong` | — | — |
| Assurance-vie | après 8 ans **24,7 %** (7,5 % + 17,2 %) au-delà de 4 600 € / 9 200 € d'abattement, < 150 000 € de primes ; avant 8 ans 30 %. Exclue de la hausse de CSG 2026 (reste 17,2 %) | `av.*` | [service-public F22414](https://www.service-public.gouv.fr/particuliers/vosdroits/F22414) (vérifié le 15/04/2026) | 20/10/2026 |
| PER | déduction dans la limite de 10 % des revenus, **max 37 680 €** (plancher 4 710 €) ; sortie en capital : capital au barème, gains à 31,4 % ; blocage sauf accidents de la vie et résidence principale ; plus de déduction après 70 ans | `per.*`, `TMI_OPTIONS` | [service-public F34982](https://www.service-public.gouv.fr/particuliers/vosdroits/F34982) (vérifié le 12/10/2026) | 20/10/2026 |
| Livrets | 0 % ; Livret A 22 950 €, LDDS 12 000 €, LEP 10 000 € ; taux **1,70 / 1,70 / 2,50 %** depuis le 1er août 2026 | `livret.*`, `ASSETS.livret_a` | [Meilleurtaux — taux au 1er août 2026](https://placement.meilleurtaux.com/livret-epargne/actualites/2026-juillet/livrets-les-taux-officiels-au-1er-aout-2026.html) | 20/10/2026 |
| Frais AV | **0,6 %** par défaut (marché : 0,88 % sur UC, 0,66 % fonds euros, contrats en ligne ≈ 0,5-0,6 %) | `av.defaultFee` | [France Assureurs via Tout sur mes finances](https://www.toutsurmesfinances.com/actualites/a/assurance-vie-ce-que-les-frais-de-gestion-ont-coute-en-2025) (06/05/2026) | 20/10/2026 |
| Frais PER | **0,9 %** (ACPR 2025 : 0,91 % sur UC) | `per.defaultFee` | [ACPR via Tout sur mes finances](https://www.toutsurmesfinances.com/actualites/?p=1075) | 20/10/2026 |
| Sécurisation progressive | profil « équilibré horizon retraite » : ≥ 20 % sécurisé à 10 ans, 50 % à 5 ans, 70 % à 2 ans | `GLIDE_PATH_SCHEDULE`, `GLIDE_PATH_SOURCE` | [MoneyVox — gestions pilotées du PER](https://www.moneyvox.fr/retraite/actualites/75384/plan-epargne-retraite-a-quoi-ressembleront-les-gestions-pilotees) (arrêté d'août 2019) | 20/10/2026 |

## Rendements historiques (`ASSETS.*.returns`, en EUR, nominal, dividendes réinvestis, annualisés)

Sauf mention contraire : [Lazy Portfolio ETF](https://www.lazyportfolioetf.com/), tables « Investment Returns as of Sep 30, 2026 ». Pour mettre à jour : ouvrir la page de l'ETF, lire la table 10Y / 20Y / 30Y (colonne *Annualized Return*), la *Standard Deviation* 20Y et le *Max Drawdown* 30Y.

| Actif (clé) | 10 ans | 20 ans | 30 ans | Volatilité (20 ans) | Pire chute (30 ans) | Page source |
|---|---|---|---|---|---|---|
| `msci_world` | 12,8 % | 9,0 % | 8,4 % | 13,4 % | −55,7 % | [iShares Core MSCI World (EUNL)](https://www.lazyportfolioetf.com/etf/ishares-core-msci-world-eur-currency/) |
| `sp500` | 14,9 % | 11,6 % | 10,5 % | 14,0 % | −60,6 % | [iShares Core S&P 500 (SXR8)](https://www.lazyportfolioetf.com/etf/ishares-core-sp-500-eur-currency/) ; contrôle croisé [EU Personal Finance](https://www.eupersonalfinance.eu/articles/average-annual-return-sp500) au 31/12/2025 : 13,6 / 11,5 / 11,1 % |
| `nasdaq100` | 20,5 % | 16,8 % | 14,0 % | 18,1 % | −81,7 % | [iShares Nasdaq 100 (SXRV)](https://www.lazyportfolioetf.com/etf/ishares-nasdaq-100-eur-currency/) |
| `cac40_gr` | ≈ 8,5 % | ≈ 7,0 % | ≈ 7,4 % | 18 % (estimation) | −55 % (estimation) | [Ramify](https://www.ramify.fr/bourse/cac-40) (8,96 %/an depuis 1987, juillet 2025) ; [bourse-assurance-retraite.fr](https://bourse-assurance-retraite.fr/cac-40-gross-return-historique/) (07/05/2026). **Approximatif** : aucune série annualisée officielle trouvée ; idéalement remplacer par les données Euronext de l'indice PX1GR. |
| `emerging` | 8,6 % | 6,7 % | 7,0 % | 16,9 % | −56,3 % | [iShares MSCI Emerging Markets (EEM) → EUR](https://www.lazyportfolioetf.com/etf/ishares-msci-emerging-markets-eem-tocurrency-eur/) |
| `euro_gov_bonds` | −1,0 % | 1,7 % | 2,7 % | 4,7 % | −21,6 % | [Xtrackers II Eurozone Government Bond (XGLE)](https://www.lazyportfolioetf.com/etf/xtrackers-ii-eurozone-government-bond/) |
| `gold` | 12,0 % | 10,5 % | 8,5 % | 16,2 % | −36,8 % | [SPDR Gold Trust (GLD) → EUR](https://www.lazyportfolioetf.com/etf/spdr-gold-trust-gld-tocurrency-eur) |
| `scpi` | 3,2 % | 6,4 % | 6,4 % (= 20 ans, pas de série 30 ans) | 6 % (estimation) | −20 % (estimation) | [Portail SCPI — TRI ASPIM/IEIF fin 2025](https://portail-scpi.fr/definition-scpi/guide-scpi-complet/taux-rendement/) ; taux de distribution 2025 : 4,91 % |
| `fonds_euros` | 1,9 % | 2,6 % | 3,4 % | 0 | 0 | Moyennes arithmétiques des taux annuels de marché ([MoneyVox / ACPR 2025](https://www.moneyvox.fr/assurance-vie/actualites/108096/le-taux-moyen-reste-a-2-63-en-2025-comme-en-2024-selon-acpr), [Mon Petit Placement](https://www.monpetitplacement.fr/assurance-vie/assurance-vie-rendement)) — voir méthode ci-dessous |
| `livret_a` | 1,4 % | 1,7 % | 2,1 % | 0 | 0 | Moyennes arithmétiques du taux moyen annuel 1996-2025 ([Tout sur mes finances](https://www.toutsurmesfinances.com/placements/livret-a-et-livret-bleu-historique-du-taux-moyen-annuel-depuis-1970.html)) |
| `INFLATION` | 1,9 % | 1,6 % | 1,6 % | — | — | INSEE via [MoneyVox](https://www.moneyvox.fr/placement/inflation.php) (2000-2025) et Tout sur mes finances (1996-1999) |

### Méthode des moyennes calculées à la main

- **Livret A** : taux moyen annuel 2016-2025 = 0,75 / 0,75 / 0,75 / 0,75 / 0,52 / 0,50 / 1,38 / 2,92 / 3,00 / 2,16 → 1,35 %. 2006-2015 ajoute 2,45 / 2,85 / 3,70 / 1,90 / 1,45 / 2,10 / 2,25 / 1,60 / 1,15 / 0,90 → 1,69 % sur 20 ans. 1996-2005 ajoute 3,70 / 3,50 / 3,20 / 2,70 / 2,60 / 3,00 / 3,00 / 2,70 / 2,25 / 2,15 → 2,09 % sur 30 ans.
- **Inflation** : 2016-2025 = 0,2 / 1,0 / 1,8 / 1,1 / 0,5 / 1,6 / 5,2 / 4,9 / 2,0 / 0,9 → 1,92 %. 2006-2015 = 1,7 / 1,5 / 2,8 / 0,1 / 1,5 / 2,1 / 2,0 / 0,9 / 0,5 / 0,0 → 1,61 % sur 20 ans. 1996-2005 = 2,0 / 1,2 / 0,6 / 0,5 / 1,7 / 1,6 / 1,9 / 2,1 / 2,1 / 1,7 → 1,59 % sur 30 ans.
- **Fonds euros** : 2016-2025 ≈ 1,9 / 1,8 / 1,8 / 1,4 / 1,3 / 1,3 / 1,9 / 2,6 / 2,5 / 2,6 → 1,9 % ; 2006-2015 ≈ 4,1 / 4,1 / 3,9 / 3,6 / 3,4 / 3,0 / 2,9 / 2,8 / 2,5 / 2,3 → 2,6 % sur 20 ans ; 1996-2005 ≈ 6,0 / 5,6 / 5,3 / 5,3 / 5,3 / 5,3 / 4,8 / 4,5 / 4,4 / 4,2 → 3,4 % sur 30 ans. Les années antérieures à 2015 sont des moyennes de marché FFA reprises par la presse : à remplacer par la série ACPR si vous la retrouvez.
- Pour refaire ces moyennes : ajouter l'année écoulée, retirer la plus ancienne de chaque fenêtre, moyenne arithmétique arrondie au dixième.

## Frais des produits (`ASSETS.*.defaultFee`, `.examples`)

| Actif | TER retenu | Exemples cités | Source | Relevé le |
|---|---|---|---|---|
| MSCI World | 0,20 % | WPEA 0,20 %, DCAM 0,20 %, CW8 0,38 % | [pea.fr — meilleurs ETF MSCI World PEA](https://pea.fr/les-etf/meilleurs-etf-msci-world-pea/) (juin 2026) | 20/10/2026 |
| S&P 500 | 0,15 % | PE500 0,15 %, CSPX 0,07 % | connaissance des fiches produits Amundi / iShares — à revérifier sur justETF | 20/10/2026 |
| Nasdaq-100 | 0,30 % | PUST 0,30 %, SXRV 0,33 % | idem | 20/10/2026 |
| CAC 40 | 0,25 % | C40 / CAC 0,25 % | idem | 20/10/2026 |
| Émergents | 0,20 % | PAEEM 0,20 %, EIMI 0,18 % | idem | 20/10/2026 |
| Obligations euro | 0,09 % | XGLE 0,09 %, SXRP 0,20 % | idem | 20/10/2026 |
| Or | 0,12 % | GOLD / PPFB 0,12 % | idem | 20/10/2026 |
| SCPI, fonds euros, livrets | 0 (rendements déjà nets) | — | — | — |

## Conseils de timing (`TIMING_GUIDANCE`)

| Étape | Source | Relevé le |
|---|---|---|
| Épargne de précaution 3-6 mois | [MoneyVox](https://www.moneyvox.fr/livret/actualites/49361/livrets-combien-garder-comme-epargne-de-precaution) | 20/10/2026 |
| Lump sum bat le DCA ≈ 2/3 du temps | [Vanguard 2012, « Dollar-cost averaging just means taking risk later »](https://militarymoneymanual.com/wp-content/uploads/2021/08/Dollar-Cost-Averaging-Just-Means-Taking-Risk-Later-Vanguard.pdf) ; actualisation 2023 : 68 % | 20/10/2026 |
| Ordre des enveloppes | service-public F2385 / F34982 (ci-dessus) | 20/10/2026 |
| Impact des frais (0,2 % vs 1 % sur 25 ans ≈ −18 %) | calcul : (1,07/1,078)^25 ≈ 0,83 | — |
| Sécurisation 20 / 50 / 70 % | arrêté PER via MoneyVox (ci-dessus) | 20/10/2026 |

## Hypothèses de modélisation (dans `src/services/PortfolioCalculationService.ts`)

- Les versements sont placés en fin de période et composés au taux périodique équivalent ; les frais sont retranchés du rendement brut chaque année.
- L'impôt est calculé comme si tout était liquidé à l'année affichée (la courbe est une « valeur nette de liquidation ») : PEA à 18,6 % après 5 ans, AV à 24,7 % après 8 ans avec un abattement unique de 4 600 €, CTO à 31,4 %, PER = capital × TMI de sortie + gains × 31,4 %.
- PER : l'économie d'impôt (versement × TMI) est supposée réinvestie, soit 1 / (1 − TMI) € placés par euro d'effort.
- Sécurisation progressive : la part sécurisée touche uniquement les lignes « risquées » (tout sauf fonds euros et livrets) et rapporte `safeRate` moins les frais de l'enveloppe.
- Le « taux net annualisé » est le taux constant qui mènerait l'effort d'épargne réel au capital net final (même solveur que le taux nécessaire).
- Volatilité et pire chute du portefeuille sont des moyennes pondérées / minima indicatifs, sans effet de diversification.
