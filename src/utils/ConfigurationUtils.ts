import { ConfigurationCategory, ConfigurationTypeCategories } from "@/enums/ConfigurationCategory";

export type ConfigurationType = 'tjm' | 'house' | 'restaurant' | 'lifespending' | 'goal';

/** Categories a MIX configuration (revenue + spending) also belongs to. */
const MIX_CATEGORIES: ConfigurationCategory[] = [
    ConfigurationCategory.REVENUE,
    ConfigurationCategory.SPENDING
];

const categoryMatches = (configCategory: ConfigurationCategory, category: ConfigurationCategory): boolean => {
    return configCategory === category
        || (configCategory === ConfigurationCategory.MIX && MIX_CATEGORIES.includes(category));
};

export const getConfigurationCategory = (type: ConfigurationType): ConfigurationCategory => {
    return ConfigurationTypeCategories[type];
};

export const getConfigurationsByCategory = (category: ConfigurationCategory): ConfigurationType[] => {
    return Object.entries(ConfigurationTypeCategories)
        .filter(([, cat]) => categoryMatches(cat, category))
        .map(([type]) => type as ConfigurationType);
};

export const isConfigurationInCategory = (type: ConfigurationType, category: ConfigurationCategory): boolean => {
    return categoryMatches(getConfigurationCategory(type), category);
};
