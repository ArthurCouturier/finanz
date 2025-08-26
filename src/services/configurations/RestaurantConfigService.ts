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
            updatedAt: new Date(),
            week: [
                    { name: "Monday", meals: [{ covers: 0, starterPrice: 0, mainCoursePrice: 0, dessertPrice: 0, drinkPrice: 0 }, { covers: 0, starterPrice: 0, mainCoursePrice: 0, dessertPrice: 0, drinkPrice: 0 }] },
                    { name: "Tuesday", meals: [{ covers: 0, starterPrice: 0, mainCoursePrice: 0, dessertPrice: 0, drinkPrice: 0 }, { covers: 0, starterPrice: 0, mainCoursePrice: 0, dessertPrice: 0, drinkPrice: 0 }] },
                    { name: "Wednesday", meals: [{ covers: 0, starterPrice: 0, mainCoursePrice: 0, dessertPrice: 0, drinkPrice: 0 }, { covers: 0, starterPrice: 0, mainCoursePrice: 0, dessertPrice: 0, drinkPrice: 0 }] },
                    { name: "Thursday", meals: [{ covers: 0, starterPrice: 0, mainCoursePrice: 0, dessertPrice: 0, drinkPrice: 0 }, { covers: 0, starterPrice: 0, mainCoursePrice: 0, dessertPrice: 0, drinkPrice: 0 }] },
                    { name: "Friday", meals: [{ covers: 0, starterPrice: 0, mainCoursePrice: 0, dessertPrice: 0, drinkPrice: 0 }, { covers: 0, starterPrice: 0, mainCoursePrice: 0, dessertPrice: 0, drinkPrice: 0 }] },
                    { name: "Saturday", meals: [{ covers: 0, starterPrice: 0, mainCoursePrice: 0, dessertPrice: 0, drinkPrice: 0 }, { covers: 0, starterPrice: 0, mainCoursePrice: 0, dessertPrice: 0, drinkPrice: 0 }] },
                    { name: "Sunday", meals: [{ covers: 0, starterPrice: 0, mainCoursePrice: 0, dessertPrice: 0, drinkPrice: 0 }, { covers: 0, starterPrice: 0, mainCoursePrice: 0, dessertPrice: 0, drinkPrice: 0 }] },
                ],
            stats: {
                workedWeeks: 0
            }
        }
    }

    static getInstance(): RestaurantConfigService {
        if (!RestaurantConfigService.instance) {
            RestaurantConfigService.instance = new RestaurantConfigService();
        }
        return RestaurantConfigService.instance;
    }
}


