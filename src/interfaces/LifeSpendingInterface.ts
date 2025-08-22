import AbstractConfigInterface from './configurations/AbstractConfigInterface';
import AbstractNumberInterface from './AbstractNumberInterface';

export interface LifeSpendingInterface extends AbstractConfigInterface {
    // 🛒 Groceries - with daily option
    groceries: AbstractNumberInterface;
    groceriesDaily: boolean;
    
    // 🏠 Housing
    rent: AbstractNumberInterface;
    
    // 📡 Utilities & Services
    internet: AbstractNumberInterface;
    energy: AbstractNumberInterface;
    
    // 🚗 Transportation
    car: AbstractNumberInterface;
    
    // 💳 Financial
    credit: AbstractNumberInterface;
    
    // 📱 Subscriptions
    subscriptions: AbstractNumberInterface;
    
    // 🎯 Lifestyle
    leisure: AbstractNumberInterface;
    restaurant: AbstractNumberInterface;
    shopping: AbstractNumberInterface;
    
    // 🏥 Health
    health: AbstractNumberInterface;
    
    // 💼 Professional
    professionalExpenses: AbstractNumberInterface;
}
