import GoalConfiguration from "@/components/configurations/GoalConfiguration";
import GoalConfigInterface from "@/interfaces/configurations/GoalConfigInterface";
import GoalConfigService from "@/services/configurations/GoalConfigService";
import { Navigate, useParams } from "react-router-dom";

export default function Goal() {
  const { uuid } = useParams<{ uuid: string }>();
  const service = GoalConfigService.getInstance();

  if (uuid) {
    const config = service.getConfig(uuid);
    if (!config.isPresent()) {
      return <Navigate to="/goal" replace />;
    }
    return <GoalConfiguration key={uuid} config={config.get()} />;
  }

  const configs: GoalConfigInterface[] = service.getAllConfigs();
  return <GoalConfiguration key={configs[0].uuid} config={configs[0]} />;
}
