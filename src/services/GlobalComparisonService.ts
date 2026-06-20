import TjmConfigInterface from "@/interfaces/configurations/TjmConfigInterface";
import HouseConfigInterface from "@/interfaces/configurations/HouseConfigInterface";
import RestaurantConfigInterface from "@/interfaces/configurations/RestaurantConfigInterface";
import { ConfigurationComparison, FinancialMetrics, GlobalComparisonResult } from "@/interfaces/GlobalComparisonInterface";
import TjmConfigService from "./configurations/TjmConfigService";
import HouseConfigService from "./configurations/HouseConfigService";
import RestaurantConfigService from "./configurations/RestaurantConfigService";
import { computeHouse } from "./HouseCalculationService";

export default class GlobalComparisonService {
    private static instance: GlobalComparisonService;

    static getInstance(): GlobalComparisonService {
        if (!GlobalComparisonService.instance) {
            GlobalComparisonService.instance = new GlobalComparisonService();
        }
        return GlobalComparisonService.instance;
    }

    calculateTjmMetrics(config: TjmConfigInterface): FinancialMetrics {
        const tjmValue = config.tjm.value;
        const workedDaysPerMonth = config.workedDays[0]?.value || 20;
        const taxRate = config.tax[0]?.value || 0;
        
        const monthlyIncomeBeforeTax = tjmValue * workedDaysPerMonth;
        const monthlyTax = (monthlyIncomeBeforeTax * taxRate) / 100;
        const monthlyIncome = monthlyIncomeBeforeTax - monthlyTax;
        
        return {
            monthlyIncome,
            monthlyExpenses: 0, // TJM n'a pas de dépenses directes
            monthlyProfit: monthlyIncome,
            annualIncome: monthlyIncome * 12,
            annualExpenses: 0,
            annualProfit: monthlyIncome * 12,
            profitMargin: 100 // 100% car pas de dépenses
        };
    }

    calculateHouseMetrics(config: HouseConfigInterface): FinancialMetrics {
        // Nouveau modèle multi-crédits : on consolide via le moteur de calcul.
        const computation = computeHouse(config);
        const totalMonthlyExpenses = computation.monthlyTotal;
        const longestTerm = computation.loanComputations.reduce(
            (max, c) => Math.max(max, c.months),
            0
        );

        return {
            monthlyIncome: 0, // Immobilier génère pas de revenus directs dans ce modèle
            monthlyExpenses: totalMonthlyExpenses,
            monthlyProfit: -totalMonthlyExpenses,
            annualIncome: 0,
            annualExpenses: totalMonthlyExpenses * 12,
            annualProfit: -totalMonthlyExpenses * 12,
            profitMargin: -100, // Négatif car c'est une dépense
            breakEvenPoint: longestTerm
        };
    }

    calculateRestaurantMetrics(config: RestaurantConfigInterface): FinancialMetrics {
        const workedWeeks = config.stats.workedWeeks || 48; // 48 semaines par an par défaut
        
        let weeklyRevenue = 0;
        let weeklyCovers = 0;
        
        config.week.forEach(day => {
            day.meals.forEach(meal => {
                const mealRevenue = meal.covers * (
                    meal.starterPrice + 
                    meal.mainCoursePrice + 
                    meal.dessertPrice + 
                    meal.drinkPrice
                );
                weeklyRevenue += mealRevenue;
                weeklyCovers += meal.covers;
            });
        });
        
        // Estimation des coûts (30% du CA pour les matières premières + 40% pour les charges)
        const weeklyCosts = weeklyRevenue * 0.7; // 70% de charges estimées
        const weeklyProfit = weeklyRevenue - weeklyCosts;
        
        const monthlyIncome = (weeklyRevenue * workedWeeks) / 12;
        const monthlyExpenses = (weeklyCosts * workedWeeks) / 12;
        const monthlyProfit = monthlyIncome - monthlyExpenses;
        
        return {
            monthlyIncome,
            monthlyExpenses,
            monthlyProfit,
            annualIncome: weeklyRevenue * workedWeeks,
            annualExpenses: weeklyCosts * workedWeeks,
            annualProfit: weeklyProfit * workedWeeks,
            profitMargin: weeklyRevenue > 0 ? (weeklyProfit / weeklyRevenue) * 100 : 0
        };
    }

    assessRiskLevel(configType: string, metrics: FinancialMetrics): 'low' | 'medium' | 'high' {
        switch (configType) {
            case 'tjm':
                return metrics.profitMargin > 80 ? 'low' : metrics.profitMargin > 60 ? 'medium' : 'high';
            case 'house':
                return 'medium'; // Immobilier toujours risque moyen
            case 'restaurant':
                return metrics.profitMargin > 20 ? 'low' : metrics.profitMargin > 10 ? 'medium' : 'high';
            default:
                return 'medium';
        }
    }

    generateRecommendations(result: GlobalComparisonResult): string[] {
        const recommendations: string[] = [];
        
        if (result.overallProfitMargin < 10) {
            recommendations.push("⚠️ Marge bénéficiaire globale faible. Considérez optimiser vos configurations.");
        }
        
        if (result.totalMonthlyExpenses > result.totalMonthlyIncome * 0.8) {
            recommendations.push("💰 Charges élevées par rapport aux revenus. Analysez vos coûts.");
        }
        
        const tjmConfig = result.configurations.find(c => c.configType === 'tjm');
        if (tjmConfig && tjmConfig.metrics.monthlyIncome > 0) {
            recommendations.push("✅ Revenus TJM stables - Bonne base financière.");
        }
        
        const restaurantConfig = result.configurations.find(c => c.configType === 'restaurant');
        if (restaurantConfig && restaurantConfig.metrics.profitMargin < 15) {
            recommendations.push("🍽️ Marge restaurant faible. Optimisez vos prix ou réduisez les coûts.");
        }
        
        const houseConfig = result.configurations.find(c => c.configType === 'house');
        if (houseConfig && result.totalMonthlyIncome > 0) {
            const debtRatio = Math.abs(houseConfig.metrics.monthlyExpenses) / result.totalMonthlyIncome;
            if (debtRatio > 0.33) {
                recommendations.push("🏠 Endettement immobilier élevé (>33% des revenus).");
            }
        }
        
        return recommendations;
    }

    compareConfigurations(
        tjmConfigId?: string,
        houseConfigId?: string,
        restaurantConfigId?: string,
        restaurantRevenueConfigId?: string,
        restaurantSpendingConfigId?: string
    ): GlobalComparisonResult {
        const configurations: ConfigurationComparison[] = [];
        let totalMonthlyIncome = 0;
        let totalMonthlyExpenses = 0;
        
        // Analyse TJM
        if (tjmConfigId) {
            const tjmConfig = TjmConfigService.getInstance().getConfig(tjmConfigId);
            if (tjmConfig.isPresent()) {
                const config = tjmConfig.get();
                const metrics = this.calculateTjmMetrics(config);
                configurations.push({
                    configId: tjmConfigId,
                    configName: config.name,
                    configType: 'tjm',
                    metrics,
                    riskLevel: this.assessRiskLevel('tjm', metrics),
                    details: {
                        tjmValue: config.tjm.value,
                        workedDays: config.workedDays[0]?.value,
                        taxRate: config.tax[0]?.value
                    }
                });
                totalMonthlyIncome += metrics.monthlyIncome;
                totalMonthlyExpenses += metrics.monthlyExpenses;
            }
        }
        
        // Analyse House
        if (houseConfigId) {
            const houseConfig = HouseConfigService.getInstance().getConfig(houseConfigId);
            if (houseConfig.isPresent()) {
                const config = houseConfig.get();
                const metrics = this.calculateHouseMetrics(config);
                const computation = computeHouse(config);
                configurations.push({
                    configId: houseConfigId,
                    configName: config.name,
                    configType: 'house',
                    metrics,
                    riskLevel: this.assessRiskLevel('house', metrics),
                    timeToProfit: metrics.breakEvenPoint,
                    details: {
                        loanAmount: computation.totalBorrowed,
                        downPayment: computation.downPayment,
                        purchasingPower: computation.purchasingPower,
                        activeLoans: computation.loanComputations.length
                    }
                });
                totalMonthlyIncome += metrics.monthlyIncome;
                totalMonthlyExpenses += metrics.monthlyExpenses;
            }
        }
        
        // Analyse Restaurant - Gestion des configs séparées pour Mix
        const restaurantRevenueId = restaurantRevenueConfigId || restaurantConfigId;
        const restaurantSpendingId = restaurantSpendingConfigId || restaurantConfigId;
        
        // Analyse Restaurant (Revenus)
        if (restaurantRevenueId) {
            const restaurantConfig = RestaurantConfigService.getInstance().getConfig(restaurantRevenueId);
            if (restaurantConfig.isPresent()) {
                const config = restaurantConfig.get();
                const metrics = this.calculateRestaurantMetrics(config);
                
                // Pour les revenus, on ne prend que la partie positive
                const revenueMetrics = {
                    ...metrics,
                    monthlyExpenses: 0,
                    monthlyProfit: metrics.monthlyIncome,
                    annualExpenses: 0,
                    annualProfit: metrics.annualIncome,
                    profitMargin: 100
                };
                
                configurations.push({
                    configId: restaurantRevenueId,
                    configName: config.name + (restaurantRevenueConfigId ? ' (Revenus)' : ''),
                    configType: 'restaurant',
                    metrics: revenueMetrics,
                    riskLevel: this.assessRiskLevel('restaurant', revenueMetrics),
                    details: {
                        workedWeeks: config.stats.workedWeeks,
                        weeklyRevenue: metrics.monthlyIncome * 12 / (config.stats.workedWeeks || 48),
                        mode: 'revenue'
                    }
                });
                totalMonthlyIncome += revenueMetrics.monthlyIncome;
            }
        }
        
        // Analyse Restaurant (Dépenses) - seulement si différent des revenus
        if (restaurantSpendingId && restaurantSpendingId !== restaurantRevenueId) {
            const restaurantConfig = RestaurantConfigService.getInstance().getConfig(restaurantSpendingId);
            if (restaurantConfig.isPresent()) {
                const config = restaurantConfig.get();
                const metrics = this.calculateRestaurantMetrics(config);
                
                // Pour les dépenses, on ne prend que la partie négative
                const spendingMetrics = {
                    ...metrics,
                    monthlyIncome: 0,
                    monthlyProfit: -metrics.monthlyExpenses,
                    annualIncome: 0,
                    annualProfit: -metrics.annualExpenses,
                    profitMargin: -100
                };
                
                configurations.push({
                    configId: restaurantSpendingId,
                    configName: config.name + ' (Dépenses)',
                    configType: 'restaurant',
                    metrics: spendingMetrics,
                    riskLevel: this.assessRiskLevel('restaurant', spendingMetrics),
                    details: {
                        workedWeeks: config.stats.workedWeeks,
                        weeklyExpenses: metrics.monthlyExpenses * 12 / (config.stats.workedWeeks || 48),
                        mode: 'spending'
                    }
                });
                totalMonthlyExpenses += spendingMetrics.monthlyExpenses;
            }
        } else if (restaurantConfigId && !restaurantRevenueConfigId && !restaurantSpendingConfigId) {
            // Mode classique : une seule config restaurant avec revenus et dépenses
            const restaurantConfig = RestaurantConfigService.getInstance().getConfig(restaurantConfigId);
            if (restaurantConfig.isPresent()) {
                const config = restaurantConfig.get();
                const metrics = this.calculateRestaurantMetrics(config);
                configurations.push({
                    configId: restaurantConfigId,
                    configName: config.name,
                    configType: 'restaurant',
                    metrics,
                    riskLevel: this.assessRiskLevel('restaurant', metrics),
                    details: {
                        workedWeeks: config.stats.workedWeeks,
                        weeklyRevenue: metrics.monthlyIncome * 12 / (config.stats.workedWeeks || 48),
                        mode: 'mixed'
                    }
                });
                totalMonthlyIncome += metrics.monthlyIncome;
                totalMonthlyExpenses += metrics.monthlyExpenses;
            }
        }
        
        const totalMonthlyProfit = totalMonthlyIncome - totalMonthlyExpenses;
        const overallProfitMargin = totalMonthlyIncome > 0 ? (totalMonthlyProfit / totalMonthlyIncome) * 100 : 0;
        
        const result: GlobalComparisonResult = {
            totalMonthlyIncome,
            totalMonthlyExpenses,
            totalMonthlyProfit,
            totalAnnualIncome: totalMonthlyIncome * 12,
            totalAnnualExpenses: totalMonthlyExpenses * 12,
            totalAnnualProfit: totalMonthlyProfit * 12,
            overallProfitMargin,
            configurations,
            recommendations: [],
            riskAssessment: {
                overall: 'medium',
                factors: []
            }
        };
        
        result.recommendations = this.generateRecommendations(result);
        
        // Évaluation du risque global
        const highRiskConfigs = configurations.filter(c => c.riskLevel === 'high').length;
        const mediumRiskConfigs = configurations.filter(c => c.riskLevel === 'medium').length;
        
        if (highRiskConfigs > 0) {
            result.riskAssessment.overall = 'high';
            result.riskAssessment.factors.push(`${highRiskConfigs} configuration(s) à haut risque`);
        } else if (mediumRiskConfigs > 1) {
            result.riskAssessment.overall = 'medium';
            result.riskAssessment.factors.push(`${mediumRiskConfigs} configurations à risque moyen`);
        } else {
            result.riskAssessment.overall = 'low';
        }
        
        if (overallProfitMargin < 10) {
            result.riskAssessment.factors.push('Marge bénéficiaire globale faible');
        }
        
        return result;
    }
}
