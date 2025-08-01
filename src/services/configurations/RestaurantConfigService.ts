import AbstractConfigService from "./AbstractConfigService";
import { v4 as uuidv4 } from 'uuid';
import RestaurantConfigInterface from '@/interfaces/configurations/RestaurantConfigInterface';

export default class RestaurantConfigService extends AbstractConfigService<RestaurantConfigInterface> {

    private static instance: RestaurantConfigService;
    CONFIG_KEY: string = "finanz-configs-restaurant";

    createEmptyConfig(): RestaurantConfigInterface {
        return {
    uuid: uuidv4(),
    name: "New Configuration",
    createdAt: new Date(),
    updatedAt: new Date()
}
    }

    static getInstance(): RestaurantConfigService {
        if (!RestaurantConfigService.instance) {
            RestaurantConfigService.instance = new RestaurantConfigService();
        }
        return RestaurantConfigService.instance;
    }
}


