import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import Number from '../components/Number';
import NumberFlow from '@number-flow/react';
import { LifeSpendingInterface } from '../interfaces/LifeSpendingInterface';
import { LifeSpendingService } from '../services/LifeSpendingService';
import { ExportConfigurationButton } from '../components/buttons/DataImportButton';

const LifeSpending: React.FC = () => {
    const navigate = useNavigate();
    const [configs, setConfigs] = useState<LifeSpendingInterface[]>([]);
    const [selectedConfigId, setSelectedConfigId] = useState<string>('');
    const [currentConfig, setCurrentConfig] = useState<LifeSpendingInterface | null>(null);
    const [name, setName] = useState('');
    const [groceries, setGroceries] = useState(400);
    const [groceriesDaily, setGroceriesDaily] = useState(false);
    const [rent, setRent] = useState(800);
    const [internet, setInternet] = useState(30);
    const [energy, setEnergy] = useState(80);
    const [car, setCar] = useState(200);
    const [credit, setCredit] = useState(0);
    const [subscriptions, setSubscriptions] = useState(50);
    const [leisure, setLeisure] = useState(150);
    const [restaurant, setRestaurant] = useState(200);
    const [shopping, setShopping] = useState(100);
    const [health, setHealth] = useState(50);
    const [professionalExpenses, setProfessionalExpenses] = useState(100);

    const service = LifeSpendingService.getInstance();

    useEffect(() => {
        loadConfigs();
    }, []);

    const loadConfigs = () => {
        const allConfigs = service.getAllConfigs();
        setConfigs(allConfigs);
        if (allConfigs.length > 0 && !selectedConfigId) {
            handleConfigSelect(allConfigs[0].uuid);
        }
    };

    const handleConfigSelect = (configId: string) => {
        setSelectedConfigId(configId);
        const config = service.getConfig(configId);
        if (config.isPresent()) {
            const configData = config.get();
            setCurrentConfig(configData);
            setName(configData.name);
            setGroceries(configData.groceries.value);
            setGroceriesDaily(configData.groceriesDaily);
            setRent(configData.rent.value);
            setInternet(configData.internet.value);
            setEnergy(configData.energy.value);
            setCar(configData.car.value);
            setCredit(configData.credit.value);
            setSubscriptions(configData.subscriptions.value);
            setLeisure(configData.leisure.value);
            setRestaurant(configData.restaurant.value);
            setShopping(configData.shopping.value);
            setHealth(configData.health.value);
            setProfessionalExpenses(configData.professionalExpenses.value);
        }
    };

    const handleCreateNew = () => {
        const newConfig = service.createConfig();
        setConfigs([...configs, newConfig]);
        setSelectedConfigId(newConfig.uuid);
        setCurrentConfig(newConfig);
        setName(newConfig.name);
        setGroceries(newConfig.groceries.value);
        setGroceriesDaily(newConfig.groceriesDaily);
        setRent(newConfig.rent.value);
        setInternet(newConfig.internet.value);
        setEnergy(newConfig.energy.value);
        setCar(newConfig.car.value);
        setCredit(newConfig.credit.value);
        setSubscriptions(newConfig.subscriptions.value);
        setLeisure(newConfig.leisure.value);
        setRestaurant(newConfig.restaurant.value);
        setShopping(newConfig.shopping.value);
        setHealth(newConfig.health.value);
        setProfessionalExpenses(newConfig.professionalExpenses.value);
    };

    const handleSave = () => {
        if (currentConfig) {
            const updatedConfig = {
                ...currentConfig,
                name: name,
                groceries: { ...currentConfig.groceries, value: groceries },
                groceriesDaily: groceriesDaily,
                rent: { ...currentConfig.rent, value: rent },
                internet: { ...currentConfig.internet, value: internet },
                energy: { ...currentConfig.energy, value: energy },
                car: { ...currentConfig.car, value: car },
                credit: { ...currentConfig.credit, value: credit },
                subscriptions: { ...currentConfig.subscriptions, value: subscriptions },
                leisure: { ...currentConfig.leisure, value: leisure },
                restaurant: { ...currentConfig.restaurant, value: restaurant },
                shopping: { ...currentConfig.shopping, value: shopping },
                health: { ...currentConfig.health, value: health },
                professionalExpenses: { ...currentConfig.professionalExpenses, value: professionalExpenses },
                updatedAt: new Date()
            };
            service.updateConfig(updatedConfig);
            loadConfigs();
            toast.success('Configuration Saved');
        }
    };



    const calculateTotalMonthly = (): number => {
        let total = 0;
        
        // Groceries - handle daily option
        if (groceriesDaily) {
            total += groceries * 30; // Daily * 30 days
        } else {
            total += groceries; // Monthly
        }
        
        // All other expenses are monthly
        total += rent;
        total += internet;
        total += energy;
        total += car;
        total += credit;
        total += subscriptions;
        total += leisure;
        total += restaurant;
        total += shopping;
        total += health;
        total += professionalExpenses;
        
        return total;
    };

    const calculateTotalAnnual = (): number => {
        return calculateTotalMonthly() * 12;
    };


    if (!currentConfig) {
        return (
            <div className="container mx-auto p-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            💸 Life Spending Configurations
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-600 mb-4">No configurations found. Create your first one!</p>
                        <Button onClick={handleCreateNew} className="w-full">
                            Create New Configuration
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <Card className="h-fit">
            <CardHeader className="relative">
                <Button
                    className="absolute left-4 -top-1.5 blue"
                    onClick={() => navigate('/')}
                >
                    Home
                </Button>
                <CardTitle>
                    <h2>
                        <input
                            className="text-center"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </h2>
                </CardTitle>
                <Button
                    className="absolute right-4 -top-1.5 blue"
                    onClick={() => navigate('/chooseConfig/lifespending')}
                >
                    Change config
                </Button>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center h-max">
                {/* Groceries with daily switch */}
                <div className="flex items-center">
                    <Number
                        title="🛒 Groceries"
                        subtitle={groceriesDaily ? "(daily)" : "(monthly)"}
                        className="w-45"
                        value={groceries}
                        setValue={setGroceries}
                        defaultValue={groceries}
                        min={0}
                        max={groceriesDaily ? 50 : 1500}
                        step={groceriesDaily ? 1 : 10}
                    />
                    <Switch
                        className="mx-4"
                        checked={groceriesDaily}
                        onCheckedChange={setGroceriesDaily}
                    />
                    <p>Daily</p>
                </div>

                {/* Housing */}
                <Number
                    title="🏠 Rent"
                    subtitle="€/month"
                    className="w-45"
                    value={rent}
                    setValue={setRent}
                    defaultValue={rent}
                    min={0}
                    max={3000}
                    step={50}
                />

                {/* Utilities */}
                <div className="flex flex-col md:flex-row md:max-w-full md:overflow-x-auto md:whitespace-nowrap">
                    <Number
                        title="📡 Internet"
                        subtitle="€/month"
                        className="min-w-45 w-45 mx-10"
                        value={internet}
                        setValue={setInternet}
                        defaultValue={internet}
                        min={0}
                        max={100}
                        step={5}
                    />
                    <Number
                        title="⚡ Energy"
                        subtitle="€/month"
                        className="min-w-45 w-45 mx-10"
                        value={energy}
                        setValue={setEnergy}
                        defaultValue={energy}
                        min={0}
                        max={300}
                        step={10}
                    />
                </div>

                {/* Transportation & Financial */}
                <div className="flex flex-col md:flex-row md:max-w-full md:overflow-x-auto md:whitespace-nowrap">
                    <Number
                        title="🚗 Car"
                        subtitle="€/month"
                        className="min-w-45 w-45 mx-10"
                        value={car}
                        setValue={setCar}
                        defaultValue={car}
                        min={0}
                        max={800}
                        step={25}
                    />
                    <Number
                        title="💳 Credit"
                        subtitle="€/month"
                        className="min-w-45 w-45 mx-10"
                        value={credit}
                        setValue={setCredit}
                        defaultValue={credit}
                        min={0}
                        max={1000}
                        step={25}
                    />
                </div>

                {/* Subscriptions & Lifestyle */}
                <div className="flex flex-col md:flex-row md:max-w-full md:overflow-x-auto md:whitespace-nowrap">
                    <Number
                        title="📱 Subscriptions"
                        subtitle="€/month"
                        className="min-w-45 w-45 mx-10"
                        value={subscriptions}
                        setValue={setSubscriptions}
                        defaultValue={subscriptions}
                        min={0}
                        max={200}
                        step={5}
                    />
                    <Number
                        title="🎯 Leisure"
                        subtitle="€/month"
                        className="min-w-45 w-45 mx-10"
                        value={leisure}
                        setValue={setLeisure}
                        defaultValue={leisure}
                        min={0}
                        max={500}
                        step={10}
                    />
                </div>

                {/* Food & Shopping */}
                <div className="flex flex-col md:flex-row md:max-w-full md:overflow-x-auto md:whitespace-nowrap">
                    <Number
                        title="🍽️ Restaurant"
                        subtitle="€/month"
                        className="min-w-45 w-45 mx-10"
                        value={restaurant}
                        setValue={setRestaurant}
                        defaultValue={restaurant}
                        min={0}
                        max={600}
                        step={10}
                    />
                    <Number
                        title="🛍️ Shopping"
                        subtitle="€/month"
                        className="min-w-45 w-45 mx-10"
                        value={shopping}
                        setValue={setShopping}
                        defaultValue={shopping}
                        min={0}
                        max={500}
                        step={10}
                    />
                </div>

                {/* Health & Professional */}
                <div className="flex flex-col md:flex-row md:max-w-full md:overflow-x-auto md:whitespace-nowrap">
                    <Number
                        title="🏥 Health"
                        subtitle="€/month"
                        className="min-w-45 w-45 mx-10"
                        value={health}
                        setValue={setHealth}
                        defaultValue={health}
                        min={0}
                        max={300}
                        step={10}
                    />
                    <Number
                        title="💼 Professional"
                        subtitle="€/month"
                        className="min-w-45 w-45 mx-10"
                        value={professionalExpenses}
                        setValue={setProfessionalExpenses}
                        defaultValue={professionalExpenses}
                        min={0}
                        max={400}
                        step={10}
                    />
                </div>

                <p>Total monthly:</p>
                <NumberFlow value={calculateTotalMonthly()} className="text-2xl font-bold" />
                <p>Total annual:</p>
                <NumberFlow value={calculateTotalAnnual()} className="text-2xl font-bold" />
            </CardContent>
            <CardFooter className="flex items-center justify-center gap-6 mt-4">
                <Button onClick={handleSave}>Save</Button>
                <ExportConfigurationButton uuid={currentConfig.uuid} name={name} />
            </CardFooter>
        </Card>
    );
};

export default LifeSpending;
