# Onglet Objectifs — architecture

L'onglet **Objectifs** (🎯) s'ajoute à Revenus et Dépenses. Un objectif est une configuration comme les autres (localStorage, import / export JSON, plusieurs objectifs possibles) ; le seul type pour l'instant est **Indépendance financière**.

## Fichiers

| Rôle | Fichier |
|---|---|
| Modèle d'un objectif (paramètres, comparaison, revenu passif, portefeuille) | `src/interfaces/configurations/GoalConfigInterface.ts` |
| Types d'objectif, fréquences de versement, bornes des curseurs | `src/enums/GoalType.ts` |
| Persistance (clé `finanz-goals`) et valeurs par défaut | `src/services/configurations/GoalConfigService.ts` |
| Moteur « taux nécessaire » (pur) | `src/services/GoalCalculationService.ts` |
| Moteur « portefeuille » : frais, fiscalité par enveloppe, PER, sécurisation, inflation | `src/services/PortfolioCalculationService.ts` |
| Données sourcées (enveloppes, actifs, modèles, conseils) | `src/data/InvestmentData.ts` — maintenance : `docs/DONNEES_INVESTISSEMENT.md` |
| Page et composant principal (même structure que le TJM) | `src/pages/Goal.tsx`, `src/components/configurations/GoalConfiguration.tsx` |
| Dépliant « Où investir quoi et quand ? » | `src/components/PortfolioPlanner.tsx` |
| Graphique SVG (courbes annuelles, cible, survol, tableau) | `src/components/WealthChart.tsx` (couleurs `--chart-line-1/2/3` dans `src/index.css`) |

## Les trois taux du graphique

1. **Nécessaire** : taux annuel `r` tel que `S·(1+r)^N + C·((1+r)^N − 1)/i = cible`, avec `S` le départ, `C` le versement par période, `i = (1+r)^(1/n) − 1` le taux périodique et `N` l'horizon. Résolu par dichotomie entre −99 % et +1 000 % ; classé de « Déjà acquis » à « Irréaliste ».
2. **Comparé** : la même projection à un taux choisi par l'utilisateur (initialisé sur le taux nécessaire quand on active le toggle).
3. **Portefeuille** : somme, ligne par ligne (actif × enveloppe × poids), des valeurs nettes de liquidation chaque année. Le « taux net annualisé » est le taux constant qui mènerait le même effort d'épargne au même capital net final — il est donc directement comparable au taux nécessaire.

Le survol du graphique affiche, pour chaque courbe, le capital de l'année et le revenu passif mensuel correspondant au taux de rente défini sous la cible.

## Ajouter un type d'objectif

Ajouter une entrée dans `GoalType` et `GOAL_TYPE_PRESETS`, un bloc de paramètres dans `GoalConfigInterface`, un moteur de calcul pur dans `src/services/`, puis brancher le composant dans `GoalConfiguration` selon `config.type`.
