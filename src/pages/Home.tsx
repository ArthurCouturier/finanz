import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import HouseConfigService from "@/services/configurations/HouseConfigService";
import RestaurantConfigService from "@/services/configurations/RestaurantConfigService";
import TjmConfigService from "@/services/configurations/TjmConfigService";
import { useNavigate } from "react-router-dom";

export default function Home() {

    let navigateTo = useNavigate();

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    Configure my Finanz planner
                </CardTitle>
            </CardHeader>
            <Card className="w-[50vw] mx-auto">
                <CardContent className="flex flex-col">
                    <div>
                        TJM 💸
                    </div>
                    <div>
                        The TJM (Average Daily Rate = Taux Journalier Moyen in French 🇫🇷)
                        config helps you to configure and plan this parameter for your freelance missions
                    </div>
                    <Button className="w-full mt-4" onClick={() => {
                        if (TjmConfigService.getInstance().getAllConfigsIds().length > 1) {
                            navigateTo("/chooseConfig/tjm")
                        } else {
                            navigateTo("/tjm")
                        }
                    }}>
                        Configure
                    </Button>
                </CardContent>
            </Card>
            <Card className="w-[50vw] mx-auto">
                <CardContent className="flex flex-col">
                    <div>
                        House 🏡
                    </div>
                    <div>
                        The House config helps you to configure and plan a real estate loan
                    </div>
                    <Button className="w-full mt-4" onClick={() => {
                        if (HouseConfigService.getInstance().getAllConfigsIds().length > 1) {
                            navigateTo("/chooseConfig/house")
                        } else {
                            navigateTo("/house")
                        }
                    }}>
                        Configure
                    </Button>
                </CardContent>
            </Card>
            <Card className="w-[50vw] mx-auto">
                <CardContent className="flex flex-col">
                    <div>
                        Restaurant 🧑‍🍳
                    </div>
                    <div>
                        The Restaurant config helps you organize your menu, kitchen workflows, and daily operations.
                    </div>
                    <Button className="w-full mt-4" onClick={() => {
                        if (RestaurantConfigService.getInstance().getAllConfigsIds().length > 1) {
                            navigateTo("/chooseConfig/restaurant")
                        } else {
                            navigateTo("/restaurant")
                        }
                    }}>
                        Configure
                    </Button>
                </CardContent>
            </Card>
            
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
