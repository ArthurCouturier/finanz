import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import HouseConfigService from "@/services/configurations/HouseConfigService";
import RestaurantConfigService from "@/services/configurations/RestaurantConfigService";
import TjmConfigService from "@/services/configurations/TjmConfigService";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface GlobalConfiguration {
    tjm: string | null;
    house: string | null;
    restaurant: string | null;
}

export default function Global() {
    const navigate = useNavigate();
    const [globalConfig, setGlobalConfig] = useState<GlobalConfiguration>({
        tjm: null,
        house: null,
        restaurant: null
    });

    const [availableConfigs, setAvailableConfigs] = useState({
        tjm: TjmConfigService.getInstance().getAllConfigs(),
        house: HouseConfigService.getInstance().getAllConfigs(),
        restaurant: RestaurantConfigService.getInstance().getAllConfigs()
    });

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

    const getConfigName = (type: keyof GlobalConfiguration, configId: string) => {
        const config = availableConfigs[type].find(c => c.uuid === configId);
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
        // This would contain the logic to calculate financial projections
        // based on all selected configurations
        alert('Calcul de projection globale - À implémenter selon vos besoins spécifiques');
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    🌍 Configuration Globale - Planification Financière
                </CardTitle>
            </CardHeader>
            
            <div className="space-y-6 px-6 pb-6">
                {/* TJM Configuration */}
                <Card className="w-full">
                    <CardContent className="flex flex-col space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-lg">TJM 💸</h3>
                                <p className="text-sm text-muted-foreground">
                                    Configuration du taux journalier moyen pour vos missions freelance
                                </p>
                            </div>
                            <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => createNewConfig('tjm')}
                            >
                                Nouvelle config
                            </Button>
                        </div>
                        
                        <Select 
                            value={globalConfig.tjm || ""} 
                            onValueChange={(value: string) => handleConfigSelection('tjm', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Sélectionner une configuration TJM" />
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
                            <div className="flex space-x-2">
                                <Button 
                                    variant="secondary" 
                                    size="sm"
                                    onClick={() => editConfig('tjm', globalConfig.tjm!)}
                                >
                                    Modifier: {getConfigName('tjm', globalConfig.tjm)}
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* House Configuration */}
                <Card className="w-full">
                    <CardContent className="flex flex-col space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-lg">Immobilier 🏡</h3>
                                <p className="text-sm text-muted-foreground">
                                    Configuration pour la planification d'un prêt immobilier
                                </p>
                            </div>
                            <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => createNewConfig('house')}
                            >
                                Nouvelle config
                            </Button>
                        </div>
                        
                        <Select 
                            value={globalConfig.house || ""} 
                            onValueChange={(value: string) => handleConfigSelection('house', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Sélectionner une configuration immobilière" />
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
                            <div className="flex space-x-2">
                                <Button 
                                    variant="secondary" 
                                    size="sm"
                                    onClick={() => editConfig('house', globalConfig.house!)}
                                >
                                    Modifier: {getConfigName('house', globalConfig.house)}
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Restaurant Configuration */}
                <Card className="w-full">
                    <CardContent className="flex flex-col space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-lg">Restaurant 🧑‍🍳</h3>
                                <p className="text-sm text-muted-foreground">
                                    Configuration pour l'organisation et la gestion de restaurant
                                </p>
                            </div>
                            <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => createNewConfig('restaurant')}
                            >
                                Nouvelle config
                            </Button>
                        </div>
                        
                        <Select 
                            value={globalConfig.restaurant || ""} 
                            onValueChange={(value: string) => handleConfigSelection('restaurant', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Sélectionner une configuration restaurant" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableConfigs.restaurant.map((config) => (
                                    <SelectItem key={config.uuid} value={config.uuid}>
                                        {config.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        
                        {globalConfig.restaurant && (
                            <div className="flex space-x-2">
                                <Button 
                                    variant="secondary" 
                                    size="sm"
                                    onClick={() => editConfig('restaurant', globalConfig.restaurant!)}
                                >
                                    Modifier: {getConfigName('restaurant', globalConfig.restaurant)}
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Global Actions */}
                <Card className="w-full bg-primary/5">
                    <CardContent className="flex flex-col space-y-4">
                        <h3 className="font-semibold text-lg">📊 Actions Globales</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Button 
                                onClick={refreshConfigs}
                                variant="outline"
                            >
                                🔄 Actualiser les configurations
                            </Button>
                            
                            <Button 
                                onClick={calculateGlobalProjection}
                                disabled={!globalConfig.tjm && !globalConfig.house && !globalConfig.restaurant}
                            >
                                📈 Calculer projection globale
                            </Button>
                        </div>
                        
                        {(globalConfig.tjm || globalConfig.house || globalConfig.restaurant) && (
                            <div className="mt-4 p-4 bg-background rounded-lg border">
                                <h4 className="font-medium mb-2">Configuration actuelle :</h4>
                                <ul className="space-y-1 text-sm">
                                    {globalConfig.tjm && (
                                        <li>• TJM: {getConfigName('tjm', globalConfig.tjm)}</li>
                                    )}
                                    {globalConfig.house && (
                                        <li>• Immobilier: {getConfigName('house', globalConfig.house)}</li>
                                    )}
                                    {globalConfig.restaurant && (
                                        <li>• Restaurant: {getConfigName('restaurant', globalConfig.restaurant)}</li>
                                    )}
                                </ul>
                            </div>
                        )}
                    </CardContent>
                </Card>

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
