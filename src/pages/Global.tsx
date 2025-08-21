import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import HouseConfigService from "@/services/configurations/HouseConfigService";
import RestaurantConfigService from "@/services/configurations/RestaurantConfigService";
import TjmConfigService from "@/services/configurations/TjmConfigService";
import GlobalComparisonService from "@/services/GlobalComparisonService";
import GlobalComparisonResults from "@/components/GlobalComparisonResults";
import { GlobalComparisonResult } from "@/interfaces/GlobalComparisonInterface";
import { ConfigurationCategory, ConfigurationCategoryLabels, ConfigurationCategoryIcons } from "@/enums/ConfigurationCategory";
import { isConfigurationInCategory } from "@/utils/ConfigurationUtils";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface GlobalConfiguration {
    tjm: string | null;
    house: string | null;
    restaurant: string | null;
    // Pour les configurations Mix, on peut avoir des configs différentes pour revenus et dépenses
    restaurantRevenue: string | null;
    restaurantSpending: string | null;
}

export default function Global() {
    const navigate = useNavigate();
    const [globalConfig, setGlobalConfig] = useState<GlobalConfiguration>({
        tjm: null,
        house: null,
        restaurant: null,
        restaurantRevenue: null,
        restaurantSpending: null
    });

    const [availableConfigs, setAvailableConfigs] = useState({
        tjm: TjmConfigService.getInstance().getAllConfigs(),
        house: HouseConfigService.getInstance().getAllConfigs(),
        restaurant: RestaurantConfigService.getInstance().getAllConfigs()
    });

    const [comparisonResult, setComparisonResult] = useState<GlobalComparisonResult | null>(null);
    const [showComparison, setShowComparison] = useState(false);

    useEffect(() => {
        // Load saved global configuration from localStorage
        const savedGlobalConfig = localStorage.getItem('finanz-global-config');
        if (savedGlobalConfig) {
            setGlobalConfig(JSON.parse(savedGlobalConfig));
        }
    }, []);

    const handleConfigSelection = (type: keyof GlobalConfiguration, configId: string) => {
        const newGlobalConfig = { ...globalConfig, [type]: configId };
        setGlobalConfig(newGlobalConfig);
        localStorage.setItem('finanz-global-config', JSON.stringify(newGlobalConfig));
    };

    const getConfigName = (type: 'tjm' | 'house' | 'restaurant', configId: string) => {
        const config = availableConfigs[type].find((c: any) => c.uuid === configId);
        return config ? config.name : 'Configuration inconnue';
    };

    const createNewConfig = (type: string) => {
        navigate(`/${type}`);
    };

    const editConfig = (type: string, configId: string) => {
        navigate(`/${type}/${configId}`);
    };

    const refreshConfigs = () => {
        setAvailableConfigs({
            tjm: TjmConfigService.getInstance().getAllConfigs(),
            house: HouseConfigService.getInstance().getAllConfigs(),
            restaurant: RestaurantConfigService.getInstance().getAllConfigs()
        });
    };

    const calculateGlobalProjection = () => {
        // Pour les configurations Mix, on utilise les configs spécialisées si disponibles, sinon la config générale
        const restaurantConfigId = globalConfig.restaurantRevenue || globalConfig.restaurantSpending || globalConfig.restaurant;
        
        const result = GlobalComparisonService.getInstance().compareConfigurations(
            globalConfig.tjm || undefined,
            globalConfig.house || undefined,
            restaurantConfigId || undefined,
            globalConfig.restaurantRevenue || undefined,
            globalConfig.restaurantSpending || undefined
        );
        setComparisonResult(result);
        setShowComparison(true);
    };

    const hasSelectedConfigs = globalConfig.tjm || globalConfig.house || globalConfig.restaurant || globalConfig.restaurantRevenue || globalConfig.restaurantSpending;

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    🌍 Configuration Globale - Planification Financière
                </CardTitle>
            </CardHeader>
            
            <div className="space-y-6 px-6 pb-6">
                {/* Layout gauche/droite pour Revenues et Spendings */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Colonne Revenus */}
                    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                {ConfigurationCategoryIcons[ConfigurationCategory.REVENUE]}
                                {ConfigurationCategoryLabels[ConfigurationCategory.REVENUE]}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* TJM Configuration */}
                            {isConfigurationInCategory('tjm', ConfigurationCategory.REVENUE) && (
                                <Card>
                                    <CardContent className="flex flex-col space-y-4 pt-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-medium">TJM 💸</h4>
                                                <p className="text-xs text-muted-foreground">
                                                    Taux journalier moyen freelance
                                                </p>
                                            </div>
                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                onClick={() => createNewConfig('tjm')}
                                            >
                                                +
                                            </Button>
                                        </div>
                                        
                                        <Select 
                                            value={globalConfig.tjm || ""} 
                                            onValueChange={(value: string) => handleConfigSelection('tjm', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sélectionner TJM" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableConfigs.tjm.map((config) => (
                                                    <SelectItem key={config.uuid} value={config.uuid}>
                                                        {config.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        
                                        {globalConfig.tjm && (
                                            <Button 
                                                variant="secondary" 
                                                size="sm"
                                                onClick={() => editConfig('tjm', globalConfig.tjm!)}
                                                className="w-full"
                                            >
                                                Modifier
                                            </Button>
                                        )}
                                    </CardContent>
                                </Card>
                            )}
                            
                            {/* Restaurant Configuration (Revenus) */}
                            {isConfigurationInCategory('restaurant', ConfigurationCategory.REVENUE) && (
                                <Card>
                                    <CardContent className="flex flex-col space-y-4 pt-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-medium">Restaurant 🧑‍🍳</h4>
                                                <p className="text-xs text-muted-foreground">
                                                    Revenus restaurant
                                                </p>
                                            </div>
                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                onClick={() => createNewConfig('restaurant')}
                                            >
                                                +
                                            </Button>
                                        </div>
                                        
                                        <Select 
                                            value={globalConfig.restaurantRevenue || ""} 
                                            onValueChange={(value: string) => handleConfigSelection('restaurantRevenue', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sélectionner restaurant (revenus)" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableConfigs.restaurant.map((config) => (
                                                    <SelectItem key={config.uuid} value={config.uuid}>
                                                        {config.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        
                                        {globalConfig.restaurantRevenue && (
                                            <Button 
                                                variant="secondary" 
                                                size="sm"
                                                onClick={() => editConfig('restaurant', globalConfig.restaurantRevenue!)}
                                                className="w-full"
                                            >
                                                Modifier
                                            </Button>
                                        )}
                                    </CardContent>
                                </Card>
                            )}
                        </CardContent>
                    </Card>
                    
                    {/* Colonne Dépenses */}
                    <Card className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950 dark:to-rose-950">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                {ConfigurationCategoryIcons[ConfigurationCategory.SPENDING]}
                                {ConfigurationCategoryLabels[ConfigurationCategory.SPENDING]}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* House Configuration */}
                            {isConfigurationInCategory('house', ConfigurationCategory.SPENDING) && (
                                <Card>
                                    <CardContent className="flex flex-col space-y-4 pt-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-medium">Immobilier 🏡</h4>
                                                <p className="text-xs text-muted-foreground">
                                                    Prêt immobilier
                                                </p>
                                            </div>
                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                onClick={() => createNewConfig('house')}
                                            >
                                                +
                                            </Button>
                                        </div>
                                        
                                        <Select 
                                            value={globalConfig.house || ""} 
                                            onValueChange={(value: string) => handleConfigSelection('house', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sélectionner immobilier" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableConfigs.house.map((config) => (
                                                    <SelectItem key={config.uuid} value={config.uuid}>
                                                        {config.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        
                                        {globalConfig.house && (
                                            <Button 
                                                variant="secondary" 
                                                size="sm"
                                                onClick={() => editConfig('house', globalConfig.house!)}
                                                className="w-full"
                                            >
                                                Modifier
                                            </Button>
                                        )}
                                    </CardContent>
                                </Card>
                            )}
                            
                            {/* Restaurant Configuration (Dépenses) */}
                            {isConfigurationInCategory('restaurant', ConfigurationCategory.SPENDING) && (
                                <Card>
                                    <CardContent className="flex flex-col space-y-4 pt-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-medium">Restaurant 🧑‍🍳</h4>
                                                <p className="text-xs text-muted-foreground">
                                                    Charges restaurant
                                                </p>
                                            </div>
                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                onClick={() => createNewConfig('restaurant')}
                                            >
                                                +
                                            </Button>
                                        </div>
                                        
                                        <Select 
                                            value={globalConfig.restaurantSpending || ""} 
                                            onValueChange={(value: string) => handleConfigSelection('restaurantSpending', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sélectionner restaurant (dépenses)" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableConfigs.restaurant.map((config) => (
                                                    <SelectItem key={config.uuid} value={config.uuid}>
                                                        {config.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        
                                        {globalConfig.restaurantSpending && (
                                            <Button 
                                                variant="secondary" 
                                                size="sm"
                                                onClick={() => editConfig('restaurant', globalConfig.restaurantSpending!)}
                                                className="w-full"
                                            >
                                                Modifier
                                            </Button>
                                        )}
                                    </CardContent>
                                </Card>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Actions Globales */}
                <Card className="w-full bg-primary/5">
                    <CardContent className="flex flex-col space-y-4">
                        <h3 className="font-semibold text-lg">📈 Actions Globales</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Button 
                                onClick={refreshConfigs}
                                variant="outline"
                            >
                                🔄 Actualiser les configurations
                            </Button>
                            
                            <Button 
                                onClick={calculateGlobalProjection}
                                disabled={!hasSelectedConfigs}
                            >
                                📈 Calculer projection globale
                            </Button>
                        </div>
                        
                        {hasSelectedConfigs && (
                            <div className="mt-4 p-4 bg-background rounded-lg border">
                                <h4 className="font-medium mb-2">Configuration actuelle :</h4>
                                <ul className="space-y-1 text-sm">
                                    {globalConfig.tjm && (
                                        <li>• TJM: {getConfigName('tjm', globalConfig.tjm)}</li>
                                    )}
                                    {globalConfig.house && (
                                        <li>• Immobilier: {getConfigName('house', globalConfig.house)}</li>
                                    )}
                                    {globalConfig.restaurantRevenue && (
                                        <li>• Restaurant (Revenus): {getConfigName('restaurant', globalConfig.restaurantRevenue)}</li>
                                    )}
                                    {globalConfig.restaurantSpending && (
                                        <li>• Restaurant (Dépenses): {getConfigName('restaurant', globalConfig.restaurantSpending)}</li>
                                    )}
                                    {globalConfig.restaurant && (
                                        <li>• Restaurant: {getConfigName('restaurant', globalConfig.restaurant)}</li>
                                    )}
                                </ul>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Résultats de comparaison */}
                {showComparison && comparisonResult && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                🔍 Analyse comparative et mise en concurrence
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => setShowComparison(false)}
                                >
                                    Masquer
                                </Button>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <GlobalComparisonResults result={comparisonResult} />
                        </CardContent>
                    </Card>
                )}

                {/* Navigation */}
                <div className="flex justify-center">
                    <Button 
                        variant="ghost" 
                        onClick={() => navigate('/')}
                    >
                        ← Retour à l'accueil
                    </Button>
                </div>
            </div>
        </Card>
    );
}
