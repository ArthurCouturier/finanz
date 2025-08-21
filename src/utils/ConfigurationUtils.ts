import { ConfigurationCategory, ConfigurationTypeCategories } from "@/enums/ConfigurationCategory";

export type ConfigurationType = 'tjm' | 'house' | 'restaurant';

export const getConfigurationCategory = (type: ConfigurationType): ConfigurationCategory => {
    return ConfigurationTypeCategories[type];
};

export const getConfigurationsByCategory = (category: ConfigurationCategory): ConfigurationType[] => {
    return Object.entries(ConfigurationTypeCategories)
        .filter(([_, cat]) => cat === category || cat === ConfigurationCategory.MIX)
        .map(([type, _]) => type as ConfigurationType);
};

export const isConfigurationInCategory = (type: ConfigurationType, category: ConfigurationCategory): boolean => {
    const configCategory = getConfigurationCategory(type);
    return configCategory === category || configCategory === ConfigurationCategory.MIX;
};
