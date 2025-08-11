import { ImportConfigurationButton } from "@/components/buttons/DataImportButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AbstractConfigInterface from "@/interfaces/configurations/AbstractConfigInterface";
import HouseConfigService from "@/services/configurations/HouseConfigService";
import RestaurantConfigService from "@/services/configurations/RestaurantConfigService";
import TjmConfigService from "@/services/configurations/TjmConfigService";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

export default function ChooseConfig() {
  const { type } = useParams<{ type: string }>();
  const navigateTo = useNavigate();

  let configService;
  switch (type) {
    case "tjm":
      configService = TjmConfigService.getInstance();
      break;
    case "house":
      configService = HouseConfigService.getInstance();
      break;
    case "restaurant":
      configService = RestaurantConfigService.getInstance();
      break;
    default:
      return <div>Type de configuration inconnu</div>;
  }

  const [allTypeConfigs, setAllTypeConfigs] = useState<
    AbstractConfigInterface[]
  >(configService.getAllConfigs());

  const handleAdd = () => {
    const newConfig: AbstractConfigInterface =
      configService.createEmptyConfig();
    // @ts-ignore
    configService.setConfig(newConfig);
    setAllTypeConfigs(configService.getAllConfigs());
  };

  const onRemove = (uuid: string) => {
    configService.removeConfigId(uuid);
    const allTypeConfigsUpdate = allTypeConfigs.filter(
      (config) => config.uuid !== uuid
    );
    setAllTypeConfigs(allTypeConfigsUpdate);
    toast.success("Configuration removed");
  };

  const handleFetchConfigurations = () => {
    setAllTypeConfigs(configService.getAllConfigs());
  };

  return (
    <Card>
      <CardHeader className="relative ">
        <Button
          className="absolute left-4 -top-1.5 blue"
          onClick={() => {
            navigateTo("/");
          }}
        >
          Home
        </Button>
        <CardTitle>Configurations available</CardTitle>
        <div className="absolute right-4 -top-1.5 blue flex flex-col gap-2">
          <ImportConfigurationButton
            fetchConfigs={handleFetchConfigurations}
            configService={configService}
            typeConfig={type}
          />
        </div>
      </CardHeader>
      {allTypeConfigs.map((config) => {
        return (
          <CardContent
            key={config.uuid}
            className="flex items-center gap-2 justify-center"
          >
            <button
              onClick={() => {
                navigateTo(`/${type}/${config.uuid}`);
              }}
            >
              {config.name}
            </button>
            <button
              className="bg-red-400 hover:bg-red-500 text-text-primary p-2 rounded-md transition duration-200 mx-2 my-auto h-6 w-6 flex items-center justify-center text-xs"
              onClick={() => {
                onRemove(config.uuid);
              }}
            >
              🗑
            </button>
          </CardContent>
        );
      })}
      <CardContent>
        <Button onClick={handleAdd}>Add a configuration</Button>
      </CardContent>
    </Card>
  );
}
