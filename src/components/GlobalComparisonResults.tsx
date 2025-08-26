import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { GlobalComparisonResult, ConfigurationComparison } from "@/interfaces/GlobalComparisonInterface";

interface GlobalComparisonResultsProps {
    result: GlobalComparisonResult;
}

const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
    }).format(amount);
};

const getRiskColor = (risk: 'low' | 'medium' | 'high'): string => {
    switch (risk) {
        case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
        case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
        case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    }
};

const getConfigIcon = (type: string): string => {
    switch (type) {
        case 'tjm': return '💸';
        case 'house': return '🏡';
        case 'restaurant': return '🧑‍🍳';
        default: return '📊';
    }
};

const ConfigurationCard = ({ config }: { config: ConfigurationComparison }) => (
    <Card className="h-full">
        <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-lg">
                <span className="flex items-center gap-2">
                    {getConfigIcon(config.configType)} {config.configName}
                </span>
                <Badge className={getRiskColor(config.riskLevel)}>
                    {config.riskLevel === 'low' ? 'Faible risque' : 
                     config.riskLevel === 'medium' ? 'Risque moyen' : 'Haut risque'}
                </Badge>
            </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <p className="text-muted-foreground">Revenus mensuels</p>
                    <p className="font-semibold text-green-600">
                        {formatCurrency(config.metrics.monthlyIncome)}
                    </p>
                </div>
                <div>
                    <p className="text-muted-foreground">Charges mensuelles</p>
                    <p className="font-semibold text-red-600">
                        {formatCurrency(config.metrics.monthlyExpenses)}
                    </p>
                </div>
                <div>
                    <p className="text-muted-foreground">Profit mensuel</p>
                    <p className={`font-semibold ${config.metrics.monthlyProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(config.metrics.monthlyProfit)}
                    </p>
                </div>
                <div>
                    <p className="text-muted-foreground">Marge</p>
                    <p className={`font-semibold ${config.metrics.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {config.metrics.profitMargin.toFixed(1)}%
                    </p>
                </div>
            </div>
            
            {config.metrics.profitMargin >= 0 && (
                <div>
                    <div className="flex justify-between text-sm mb-2">
                        <span>Marge bénéficiaire</span>
                        <span>{config.metrics.profitMargin.toFixed(1)}%</span>
                    </div>
                    <Progress value={Math.min(config.metrics.profitMargin, 100)} className="h-2" />
                </div>
            )}
            
            {config.timeToProfit && (
                <div className="text-sm">
                    <p className="text-muted-foreground">Durée d'amortissement</p>
                    <p className="font-semibold">{config.timeToProfit} mois</p>
                </div>
            )}
        </CardContent>
    </Card>
);

export default function GlobalComparisonResults({ result }: GlobalComparisonResultsProps) {
    return (
        <div className="space-y-6">
            {/* Vue d'ensemble globale */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        📊 Vue d'ensemble financière globale
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-green-600">
                                {formatCurrency(result.totalMonthlyIncome)}
                            </p>
                            <p className="text-sm text-muted-foreground">Revenus mensuels totaux</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-red-600">
                                {formatCurrency(result.totalMonthlyExpenses)}
                            </p>
                            <p className="text-sm text-muted-foreground">Charges mensuelles totales</p>
                        </div>
                        <div className="text-center">
                            <p className={`text-2xl font-bold ${result.totalMonthlyProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatCurrency(result.totalMonthlyProfit)}
                            </p>
                            <p className="text-sm text-muted-foreground">Profit mensuel net</p>
                        </div>
                    </div>
                    
                    <div className="mt-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Marge bénéficiaire globale</p>
                            <p className={`text-xl font-bold ${result.overallProfitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {result.overallProfitMargin.toFixed(1)}%
                            </p>
                        </div>
                        <Badge className={getRiskColor(result.riskAssessment.overall)} variant="outline">
                            Risque global: {result.riskAssessment.overall === 'low' ? 'Faible' : 
                                          result.riskAssessment.overall === 'medium' ? 'Moyen' : 'Élevé'}
                        </Badge>
                    </div>
                </CardContent>
            </Card>

            {/* Détail par configuration */}
            <div>
                <h3 className="text-lg font-semibold mb-4">Détail par configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {result.configurations.map((config) => (
                        <ConfigurationCard key={config.configId} config={config} />
                    ))}
                </div>
            </div>

            {/* Recommandations */}
            {result.recommendations.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            💡 Recommandations
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {result.recommendations.map((recommendation, index) => (
                                <li key={index} className="flex items-start gap-2">
                                    <span className="text-sm">{recommendation}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}

            {/* Évaluation des risques */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        ⚠️ Évaluation des risques
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4 mb-4">
                        <Badge className={getRiskColor(result.riskAssessment.overall)} variant="outline">
                            Niveau de risque global: {result.riskAssessment.overall === 'low' ? 'Faible' : 
                                                    result.riskAssessment.overall === 'medium' ? 'Moyen' : 'Élevé'}
                        </Badge>
                    </div>
                    {result.riskAssessment.factors.length > 0 && (
                        <div>
                            <p className="text-sm font-medium mb-2">Facteurs de risque identifiés:</p>
                            <ul className="space-y-1">
                                {result.riskAssessment.factors.map((factor, index) => (
                                    <li key={index} className="text-sm text-muted-foreground">
                                        • {factor}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Projection annuelle */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        📈 Projection annuelle
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Revenus annuels</p>
                            <p className="text-xl font-bold text-green-600">
                                {formatCurrency(result.totalAnnualIncome)}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Charges annuelles</p>
                            <p className="text-xl font-bold text-red-600">
                                {formatCurrency(result.totalAnnualExpenses)}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Profit annuel net</p>
                            <p className={`text-xl font-bold ${result.totalAnnualProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatCurrency(result.totalAnnualProfit)}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
