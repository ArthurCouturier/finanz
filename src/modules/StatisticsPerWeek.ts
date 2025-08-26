import DayInterface from "../interfaces/DayInterface";

export function getAverageBasketPerWeek(week: DayInterface[]): string {
    let average = 0;
    let total = 0;
    week.forEach(day => {
        let dayTotal = 0;
        day.meals.forEach(meal => {
            dayTotal += meal.covers * (meal.starterPrice + meal.mainCoursePrice + meal.dessertPrice + meal.drinkPrice);
        });
        total += dayTotal;
    });
    average = total / getCoversPerWeek(week);
    return average.toFixed(2);
}

export function getAverageDrinkBasketPerWeek(week: DayInterface[]): string {
    let average = 0;
    let total = 0;
    week.forEach(day => {
        let dayTotal = 0;
        day.meals.forEach(meal => {
            dayTotal += meal.covers * meal.drinkPrice;
        });
        total += dayTotal;
    });
    average = total / getCoversPerWeek(week);
    return average.toFixed(2);
}

export function getAverageLunchBasketPerWeek(week: DayInterface[]): string {
    let average = 0;
    let total = 0;
    week.forEach(day => {
        let dayTotal = 0;
        day.meals.forEach(meal => {
            dayTotal += meal.covers * (meal.starterPrice + meal.mainCoursePrice + meal.dessertPrice);
        });
        total += dayTotal;
    });
    average = total / getCoversPerWeek(week);
    return average.toFixed(2);
}

export function getCoversPerWeek(week: DayInterface[]): number {
    let total = 0;
    week.forEach(day => {
        day.meals.forEach(meal => {
            total += meal.covers;
        });
    });
    return total;
}

export function workedDaysPerWeek(week: DayInterface[]): number {
    let total = 0;
    week.forEach(day => {
        if (day.meals[0].covers > 0 || day.meals[1].covers > 0) {
            total++;
        }
    });
    return total;
}

export function workedMealsPerWeek(week: DayInterface[]): number {
    let total = 0;
    week.forEach(day => {
        day.meals.forEach(meal => {
            if (meal.covers > 0) {
                total++;
            }
        });
    });
    return total;
}

export function mealsCookedPerWeek(week: DayInterface[]): number {
    let total = 0;
    week.forEach(day => {
        day.meals.forEach(meal => {
            total += meal.covers;
        });
    });
    return total;
}

export function totalWeeklySales(week: DayInterface[]): number {
    let total = 0;
    week.forEach(day => {
        day.meals.forEach(meal => {
            total += meal.covers * (meal.starterPrice + meal.mainCoursePrice + meal.dessertPrice + meal.drinkPrice);
        });
    });
    return total;
}
