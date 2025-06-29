import TjmConfiguration from "@/components/configurations/TjmConfiguration";
import TjmConfigInterface from "@/interfaces/configurations/TjmConfigInterface";
import TjmConfigService from "@/services/configurations/TjmConfigService";

export default function Tjm() {
    const configs: TjmConfigInterface[] = TjmConfigService.getInstance().getAllConfigs();

    return (
        <div>
            {configs.map((config: TjmConfigInterface) => (
                <div>
                    <TjmConfiguration key={config.uuid} config={config} />
                </div>
            ))}
        </div>
    )
}
