import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import HouseConfigService from "@/services/configurations/HouseConfigService";
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
        </Card >
    )
}
