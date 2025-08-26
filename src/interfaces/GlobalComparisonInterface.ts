export interface FinancialMetrics {
    monthlyIncome: number;
    monthlyExpenses: number;
    monthlyProfit: number;
    annualIncome: number;
    annualExpenses: number;
    annualProfit: number;
    profitMargin: number;
    breakEvenPoint?: number;
}

export interface ConfigurationComparison {
    configId: string;
    configName: string;
    configType: 'tjm' | 'house' | 'restaurant';
    metrics: FinancialMetrics;
    riskLevel: 'low' | 'medium' | 'high';
    timeToProfit?: number; // in months
    details: {
        [key: string]: any;
    };
}

export interface GlobalComparisonResult {
    totalMonthlyIncome: number;
    totalMonthlyExpenses: number;
    totalMonthlyProfit: number;
    totalAnnualIncome: number;
    totalAnnualExpenses: number;
    totalAnnualProfit: number;
    overallProfitMargin: number;
    configurations: ConfigurationComparison[];
    recommendations: string[];
    riskAssessment: {
        overall: 'low' | 'medium' | 'high';
        factors: string[];
    };
}
