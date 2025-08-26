import AbstractConfigService from './configurations/AbstractConfigService';
import { LifeSpendingInterface } from '../interfaces/LifeSpendingInterface';
import { v4 as uuidv4 } from 'uuid';

export class LifeSpendingService extends AbstractConfigService<LifeSpendingInterface> {
    private static instance: LifeSpendingService;

    private constructor() {
        super();
        this.CONFIG_KEY = 'lifespending-configs';
    }

    public static getInstance(): LifeSpendingService {
        if (!LifeSpendingService.instance) {
            LifeSpendingService.instance = new LifeSpendingService();
        }
        return LifeSpendingService.instance;
    }

    createEmptyConfig(): LifeSpendingInterface {
        return {
            uuid: uuidv4(),
            name: 'New Life Spending Configuration',
            createdAt: new Date(),
            updatedAt: new Date(),
            groceries: { uuid: uuidv4(), value: 400, currency: '€' },
            groceriesDaily: false,
            rent: { uuid: uuidv4(), value: 800, currency: '€' },
            internet: { uuid: uuidv4(), value: 30, currency: '€' },
            energy: { uuid: uuidv4(), value: 80, currency: '€' },
            car: { uuid: uuidv4(), value: 200, currency: '€' },
            credit: { uuid: uuidv4(), value: 0, currency: '€' },
            subscriptions: { uuid: uuidv4(), value: 50, currency: '€' },
            leisure: { uuid: uuidv4(), value: 150, currency: '€' },
            restaurant: { uuid: uuidv4(), value: 200, currency: '€' },
            shopping: { uuid: uuidv4(), value: 100, currency: '€' },
            health: { uuid: uuidv4(), value: 50, currency: '€' },
            professionalExpenses: { uuid: uuidv4(), value: 100, currency: '€' }
        };
    }

    // Convenience methods
    createConfig(): LifeSpendingInterface {
        const config = this.createEmptyConfig();
        this.setConfig(config);
        return config;
    }

    updateConfig(config: LifeSpendingInterface): void {
        config.updatedAt = new Date();
        this.setConfig(config);
    }

    deleteConfig(uuid: string): void {
        this.removeConfig(uuid);
    }

    public calculateMonthlyExpenses(config: LifeSpendingInterface): number {
        let total = 0;
        
        // Groceries - handle daily option
        if (config.groceriesDaily) {
            total += config.groceries.value * 30; // Daily * 30 days
        } else {
            total += config.groceries.value; // Monthly
        }
        
        // All other expenses are monthly
        total += config.rent.value;
        total += config.internet.value;
        total += config.energy.value;
        total += config.car.value;
        total += config.credit.value;
        total += config.subscriptions.value;
        total += config.leisure.value;
        total += config.restaurant.value;
        total += config.shopping.value;
        total += config.health.value;
        total += config.professionalExpenses.value;
        
        return total;
    }

    public calculateAnnualExpenses(config: LifeSpendingInterface): number {
        return this.calculateMonthlyExpenses(config) * 12;
    }

    public getExpenseBreakdown(config: LifeSpendingInterface): Record<string, number> {
        const groceriesAmount = config.groceriesDaily 
            ? config.groceries.value * 30 
            : config.groceries.value;

        return {
            groceries: groceriesAmount,
            rent: config.rent.value,
            internet: config.internet.value,
            energy: config.energy.value,
            car: config.car.value,
            credit: config.credit.value,
            subscriptions: config.subscriptions.value,
            leisure: config.leisure.value,
            restaurant: config.restaurant.value,
            shopping: config.shopping.value,
            health: config.health.value,
            professionalExpenses: config.professionalExpenses.value
        };
    }
}
