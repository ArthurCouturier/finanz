import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfigurationCategory, ConfigurationCategoryLabels, ConfigurationCategoryIcons } from "@/enums/ConfigurationCategory";
import { useNavigate } from "react-router-dom";

export default function Home() {

    let navigateTo = useNavigate();

    const navigateToCategory = (category: ConfigurationCategory) => {
        navigateTo(`/category/${category}`);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    Configure my Finanz planner
                </CardTitle>
            </CardHeader>
            
            {/* Navigation par catégories */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-6 mb-6">
                <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
                    <CardContent className="flex flex-col p-6">
                        <div className="flex items-center gap-2 mb-2">
                            {ConfigurationCategoryIcons[ConfigurationCategory.REVENUE]}
                            <span className="font-semibold text-lg">{ConfigurationCategoryLabels[ConfigurationCategory.REVENUE]}</span>
                        </div>
                        <div className="text-sm text-muted-foreground mb-4">
                            Configurations générant des revenus (TJM, Restaurant)
                        </div>
                        <Button 
                            className="w-full" 
                            onClick={() => navigateToCategory(ConfigurationCategory.REVENUE)}
                        >
                            Gérer les revenus
                        </Button>
                    </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950 dark:to-rose-950">
                    <CardContent className="flex flex-col p-6">
                        <div className="flex items-center gap-2 mb-2">
                            {ConfigurationCategoryIcons[ConfigurationCategory.SPENDING]}
                            <span className="font-semibold text-lg">{ConfigurationCategoryLabels[ConfigurationCategory.SPENDING]}</span>
                        </div>
                        <div className="text-sm text-muted-foreground mb-4">
                            Configurations de dépenses (Immobilier, Restaurant)
                        </div>
                        <Button 
                            className="w-full" 
                            onClick={() => navigateToCategory(ConfigurationCategory.SPENDING)}
                        >
                            Gérer les dépenses
                        </Button>
                    </CardContent>
                </Card>
            </div>
            
            {/* Configuration globale */}
            <Card className="w-[50vw] mx-auto bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
                <CardContent className="flex flex-col">
                    <div>
                        Configuration Globale 🌍
                    </div>
                    <div>
                        Mettez en concurrence et liez tous vos types de configuration pour une planification financière complète.
                    </div>
                    <Button className="w-full mt-4" onClick={() => navigateTo("/global")}>
                        Planification Globale
                    </Button>
                </CardContent>
            </Card>
        </Card >
    )
}
