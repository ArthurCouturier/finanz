export enum ConfigurationCategory {
    REVENUE = 'revenue',
    SPENDING = 'spending',
    MIX = 'mix'
}

export const ConfigurationCategoryLabels = {
    [ConfigurationCategory.REVENUE]: 'Revenus',
    [ConfigurationCategory.SPENDING]: 'Dépenses',
    [ConfigurationCategory.MIX]: 'Mixte'
};

export const ConfigurationCategoryIcons = {
    [ConfigurationCategory.REVENUE]: '💰',
    [ConfigurationCategory.SPENDING]: '💸',
    [ConfigurationCategory.MIX]: '⚖️'
};

// Classification des types de configuration
export const ConfigurationTypeCategories = {
    tjm: ConfigurationCategory.REVENUE,
    house: ConfigurationCategory.SPENDING,
    restaurant: ConfigurationCategory.MIX
} as const;
