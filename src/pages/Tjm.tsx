import TjmConfiguration from "@/components/configurations/TjmConfiguration";
import TjmConfigInterface from "@/interfaces/configurations/TjmConfigInterface";
import TjmConfigService from "@/services/configurations/TjmConfigService";
import { useParams } from "react-router-dom";

export default function Tjm() {
    const { uuid } = useParams<{ uuid: string }>();

    const configs: TjmConfigInterface[] = TjmConfigService.getInstance().getAllConfigs();

    return uuid ? (
        <TjmConfiguration key={uuid} config={TjmConfigService.getInstance().getConfig(uuid).get()} />
    ) : (
        <div>
            {configs.map((config: TjmConfigInterface) => (
                <div>
                    <TjmConfiguration key={config.uuid} config={config} />
                </div>
            ))}
        </div>
    )
}
