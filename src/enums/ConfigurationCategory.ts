export enum ConfigurationCategory {
    REVENUE = 'revenue',
    SPENDING = 'spending',
    MIX = 'mix',
    GOAL = 'goal'
}

export const ConfigurationCategoryLabels = {
    [ConfigurationCategory.REVENUE]: 'Revenus',
    [ConfigurationCategory.SPENDING]: 'Dépenses',
    [ConfigurationCategory.MIX]: 'Mixte',
    [ConfigurationCategory.GOAL]: 'Objectifs'
};

export const ConfigurationCategoryIcons = {
    [ConfigurationCategory.REVENUE]: '💰',
    [ConfigurationCategory.SPENDING]: '💸',
    [ConfigurationCategory.MIX]: '⚖️',
    [ConfigurationCategory.GOAL]: '🎯'
};

// Classification des types de configuration
export const ConfigurationTypeCategories = {
    tjm: ConfigurationCategory.REVENUE,
    house: ConfigurationCategory.SPENDING,
    restaurant: ConfigurationCategory.MIX,
    lifespending: ConfigurationCategory.SPENDING,
    goal: ConfigurationCategory.GOAL
} as const;
