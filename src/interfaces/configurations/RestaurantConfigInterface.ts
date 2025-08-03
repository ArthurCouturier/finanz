import DayInterface from "../DayInterface";
import StatsInterface from "../StatsInterface";
import AbstractConfigInterface from "./AbstractConfigInterface";

export default interface RestaurantConfigInterface extends AbstractConfigInterface {
    week: DayInterface[];
    stats: StatsInterface;
}
