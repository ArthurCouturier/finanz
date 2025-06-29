import HouseConfiguration from "@/components/configurations/HouseConfiguration";
import HouseConfigInterface from "@/interfaces/configurations/HouseConfigInterface";
import HouseConfigService from "@/services/configurations/HouseConfigService";
import { useParams } from "react-router-dom";

export default function House() {
    const { uuid } = useParams<{ uuid: string }>();

    const configs: HouseConfigInterface[] = HouseConfigService.getInstance().getAllConfigs();

    return uuid ? (
        <HouseConfiguration key={uuid} config={HouseConfigService.getInstance().getConfig(uuid).get()} />
    ) : (
        <div>
            <HouseConfiguration key={configs[0].uuid} config={configs[0]} />
        </div>
    )
}
