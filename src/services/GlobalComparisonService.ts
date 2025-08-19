import TjmConfigInterface from "@/interfaces/configurations/TjmConfigInterface";
import HouseConfigInterface from "@/interfaces/configurations/HouseConfigInterface";
import RestaurantConfigInterface from "@/interfaces/configurations/RestaurantConfigInterface";
import { ConfigurationComparison, FinancialMetrics, GlobalComparisonResult } from "@/interfaces/GlobalComparisonInterface";
import TjmConfigService from "./configurations/TjmConfigService";
import HouseConfigService from "./configurations/HouseConfigService";
import RestaurantConfigService from "./configurations/RestaurantConfigService";

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
        const loanAmount = config.loanAmount.value;
        const annualRate = config.annualInterestRate.value / 100;
        const loanTermMonths = config.loanTermMonths.value;
        const insuranceRate = config.inclInsurance ? config.annualInsuranceRate.value / 100 : 0;
        
        // Calcul mensualité avec formule standard
        const monthlyRate = annualRate / 12;
        const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, loanTermMonths)) / 
                              (Math.pow(1 + monthlyRate, loanTermMonths) - 1);
        
        const monthlyInsurance = (loanAmount * insuranceRate) / 12;
        const totalMonthlyExpenses = monthlyPayment + monthlyInsurance;
        
        return {
            monthlyIncome: 0, // Immobilier génère pas de revenus directs dans ce modèle
            monthlyExpenses: totalMonthlyExpenses,
            monthlyProfit: -totalMonthlyExpenses,
            annualIncome: 0,
            annualExpenses: totalMonthlyExpenses * 12,
            annualProfit: -totalMonthlyExpenses * 12,
            profitMargin: -100, // Négatif car c'est une dépense
            breakEvenPoint: loanTermMonths
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
        restaurantConfigId?: string
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
                configurations.push({
                    configId: houseConfigId,
                    configName: config.name,
                    configType: 'house',
                    metrics,
                    riskLevel: this.assessRiskLevel('house', metrics),
                    timeToProfit: metrics.breakEvenPoint,
                    details: {
                        loanAmount: config.loanAmount.value,
                        interestRate: config.annualInterestRate.value,
                        loanTerm: config.loanTermMonths.value
                    }
                });
                totalMonthlyIncome += metrics.monthlyIncome;
                totalMonthlyExpenses += metrics.monthlyExpenses;
            }
        }
        
        // Analyse Restaurant
        if (restaurantConfigId) {
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
                        weeklyRevenue: metrics.monthlyIncome * 12 / (config.stats.workedWeeks || 48)
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
