import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import AbstractConfigInterface from "@/interfaces/configurations/AbstractConfigInterface";
import HouseConfigService from "@/services/configurations/HouseConfigService";
import TjmConfigService from "@/services/configurations/TjmConfigService";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";

export default function ChooseConfig() {
    const { type } = useParams<{ type: string }>();

    let configService;
    switch (type) {
        case "tjm":
            configService = TjmConfigService.getInstance();
            break;
        case "house":
            configService = HouseConfigService.getInstance();
            break;
        default:
            return <div>Type de configuration inconnu</div>;
    }

    const [allTypeConfigs, setAllTypeConfigs] = useState<AbstractConfigInterface[]>(configService.getAllConfigs())

    const handleAdd = () => {
        const newConfig: AbstractConfigInterface = configService.createEmptyConfig();
        // @ts-ignore
        configService.setConfig(newConfig);
        setAllTypeConfigs(configService.getAllConfigs())
    }

    return (
        <Card>
            <CardTitle>Configurations available</CardTitle>
            {allTypeConfigs.map((config) => {
                return (
                    <CardContent>
                        <Link to={`/${type}/${config.uuid}`}>
                            {config.name}
                        </Link>
                    </CardContent>
                )
            })}
            <CardContent>
                <Button onClick={handleAdd}>Add a configuration</Button>
            </CardContent>
        </Card>
    )
}