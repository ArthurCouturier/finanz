import RestaurantConfiguration from "@/components/configurations/RestaurantConfiguration";
import RestaurantConfigInterface from "@/interfaces/configurations/RestaurantConfigInterface";
import RestaurantConfigService from "@/services/configurations/RestaurantConfigService";
import { useParams } from "react-router-dom";

export default function Restaurant() {

    const { uuid } = useParams<{ uuid: string }>();

    const configs: RestaurantConfigInterface[] = RestaurantConfigService.getInstance().getAllConfigs();
    
    return uuid ? (
        <RestaurantConfiguration key={uuid} config={RestaurantConfigService.getInstance().getConfig(uuid).get()} />
            ) : (
                <div>
                    {configs.map((config: RestaurantConfigInterface) => (
                        <div>
                            <RestaurantConfiguration key={config.uuid} config={config} />
                        </div>
                    ))}
                </div>
    )
}