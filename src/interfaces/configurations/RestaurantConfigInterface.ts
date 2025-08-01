import AbstractConfigInterface from "./AbstractConfigInterface";
import DayInterface from "../DayInterface";

export default interface RestaurantConfigInterface extends AbstractConfigInterface {
    week: DayInterface[];
}
