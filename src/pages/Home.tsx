import Configuration from "@/components/Configuration";
import ConfigInterface from "@/interfaces/ConfigInterface";
import ConfigService from "@/services/ConfigService";

export default function Home() {
    const configs: ConfigInterface[] = ConfigService.getAllConfigs();

    return (
        <div>
            {configs.map((config: ConfigInterface) => (
                <div>
                    <Configuration key={config.uuid} config={config} />
                </div>
            ))}
        </div>
    )
}
