import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import HouseConfigService from "@/services/configurations/HouseConfigService";
import RestaurantConfigService from "@/services/configurations/RestaurantConfigService";
import TjmConfigService from "@/services/configurations/TjmConfigService";
import { ConfigurationCategory, ConfigurationCategoryLabels, ConfigurationCategoryIcons } from "@/enums/ConfigurationCategory";
import { isConfigurationInCategory, ConfigurationType } from "@/utils/ConfigurationUtils";
import { useNavigate, useParams } from "react-router-dom";

export default function CategoryView() {
    const navigate = useNavigate();
    const { category } = useParams<{ category: string }>();
    
    const currentCategory = category as ConfigurationCategory;
    
    const getServiceByType = (type: ConfigurationType) => {
        switch (type) {
            case 'tjm': return TjmConfigService.getInstance();
            case 'house': return HouseConfigService.getInstance();
            case 'restaurant': return RestaurantConfigService.getInstance();
        }
    };

    const getConfigInfo = (type: ConfigurationType) => {
        switch (type) {
            case 'tjm':
                return {
                    title: 'TJM 💸',
                    description: 'The TJM (Average Daily Rate = Taux Journalier Moyen in French 🇫🇷) config helps you to configure and plan this parameter for your freelance missions'
                };
            case 'house':
                return {
                    title: 'House 🏡',
                    description: 'The House config helps you to configure and plan a real estate loan'
                };
            case 'restaurant':
                return {
                    title: 'Restaurant 🧑‍🍳',
                    description: 'The Restaurant config helps you organize your menu, kitchen workflows, and daily operations.'
                };
        }
    };

    const navigateToConfig = (type: ConfigurationType) => {
        const service = getServiceByType(type);
        if (service.getAllConfigsIds().length > 1) {
            navigate(`/chooseConfig/${type}`);
        } else {
            navigate(`/${type}`);
        }
    };

    const availableTypes = ['tjm', 'house', 'restaurant'] as ConfigurationType[];
    const filteredTypes = availableTypes.filter(type => 
        isConfigurationInCategory(type, currentCategory)
    );

    if (!currentCategory || !Object.values(ConfigurationCategory).includes(currentCategory)) {
        return (
            <Card>
                <CardContent className="p-6">
                    <p>Catégorie non trouvée</p>
                    <Button onClick={() => navigate('/')} className="mt-4">
                        Retour à l'accueil
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    {ConfigurationCategoryIcons[currentCategory]}
                    {ConfigurationCategoryLabels[currentCategory]}
                </CardTitle>
            </CardHeader>
            
            <div className="space-y-4 px-6 pb-6">
                {filteredTypes.map(type => {
                    const configInfo = getConfigInfo(type);
                    return (
                        <Card key={type} className="w-full">
                            <CardContent className="flex flex-col">
                                <div className="font-semibold mb-2">
                                    {configInfo.title}
                                </div>
                                <div className="text-sm text-muted-foreground mb-4">
                                    {configInfo.description}
                                </div>
                                <Button 
                                    className="w-full" 
                                    onClick={() => navigateToConfig(type)}
                                >
                                    Configure
                                </Button>
                            </CardContent>
                        </Card>
                    );
                })}
                
                {filteredTypes.length === 0 && (
                    <Card>
                        <CardContent className="p-6 text-center">
                            <p className="text-muted-foreground">
                                Aucune configuration disponible pour cette catégorie.
                            </p>
                        </CardContent>
                    </Card>
                )}
                
                <div className="flex justify-center mt-6">
                    <Button variant="ghost" onClick={() => navigate('/')}>
                        ← Retour à l'accueil
                    </Button>
                </div>
            </div>
        </Card>
    );
}
