import RestaurantConfigInterface from "@/interfaces/configurations/RestaurantConfigInterface";
import { Button } from "../ui/button";
import { Card, CardHeader, CardTitle, CardFooter } from "../ui/card";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { ArrowRightIcon } from "@heroicons/react/24/solid";
import DayInterface from "@/interfaces/DayInterface";
import RestaurantConfigService from "@/services/configurations/RestaurantConfigService";
import { toast } from "sonner";
import Day from "../Day";
import AnnualStats from "../modules/AnnualStats.tsx"
import WeekStats from "../modules/WeekStats.tsx";
import SuperNova from "../modules/SuperNova.tsx";


export default function RestaurantConfiguration({
    config
}: {
    config: RestaurantConfigInterface
}) {
    const [showConfigWeek, setShowConfigWeek] = useState(false);
    const [showStats, setShowStats] = useState(false);

    const navigateTo = useNavigate();

    const [actualConfig, setActualConfig] = useState(config);

    const [name, setName] = useState(config.name);
    const [workedWeeks, setWorkedWeeks] = useState(config.stats.workedWeeks);
    const [week, setWeek] = useState(config.week);

    const handleSave = () => {
        const updatedConfig: RestaurantConfigInterface = {
            ...actualConfig,
            name: name,
            week: week,
            stats: { ...actualConfig.stats, workedWeeks: workedWeeks }
        };

        RestaurantConfigService.getInstance().setConfig(updatedConfig);
        setActualConfig(updatedConfig); 
        toast.success("Configuration Saved");
    };

    return (
        <Card className="h-fit">
            <CardHeader className="relative">
                <Button className="absolute left-4 -top-1.5 blue" onClick={() => navigateTo("/")}>
                    Home
                </Button>
                <CardTitle>
                    <h2>
                        <input className="text-center" value={name} onChange={(e) => setName(e.target.value)} />
                    </h2>
                </CardTitle>
                <Button className="absolute right-4 -top-1.5 blue" onClick={() => navigateTo("/chooseConfig/tjm")}>
                    Change config
                </Button>
            </CardHeader>

            <div className="flex justify-center">
                {showConfigWeek ? (
                    <Card className="mx-4 mt-2 pt-2 w-full h-full" onClick={() => setShowConfigWeek(false)}>
                        <CardTitle className="justify-center flex items-center gap-2">
                            <h2 className="flex gap-2">Configuration of the week</h2>
                            <ArrowRightIcon className="w-6 h-6 text-text-primary rotate-90" />
                        </CardTitle>
                        <div className="gap-4 flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
                            {week.map((day: DayInterface, index: number) => (
                                <Day
                                    key={index}
                                    day={day}
                                    saveConfig={(updatedDay: DayInterface) => {
                                        const updatedWeek = [...week];
                                        updatedWeek[index] = updatedDay;
                                        setWeek(updatedWeek);
                                    }}
                                />
                            ))}
                        </div>
                    </Card>
                ) : (
                    <Button
                        className={`h-full flex items-baseline ${showConfigWeek && "w-5/6"}`}
                        onClick={() => setShowConfigWeek(true)}
                    >
                        <div className="flex flex-col w-full items-center">
                            <h2 className="flex gap-2">
                                Configuration of the week
                                <ArrowRightIcon className="mt-0.5 w-6 h-6 text-text-primary" />
                            </h2>
                        </div>
                    </Button>
                )}
            </div>

            <div className="flex justify-center">
                {showStats ? (
                    <Card className="mx-4 mt-2 pt-2 w-full h-full" onClick={() => setShowStats(false)}>
                        <CardTitle className="justify-center flex items-center gap-2">
                            <h2 className="flex gap-2">Statistics</h2>
                            <ArrowRightIcon className="w-6 h-6 text-text-primary rotate-90" />
                        </CardTitle>
                        <div className="gap-4 flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
                            <AnnualStats
                                config={actualConfig}
                                saveConfig={handleSave}
                                workedWeeks={workedWeeks}
                                setWorkedWeeks={setWorkedWeeks}
                            />
                            <WeekStats config={actualConfig} />
                            <SuperNova config={actualConfig} />
                        </div>
                    </Card>
                ) : (
                    <Button
                        className={`h-full flex items-baseline ${showStats && "w-5/6"}`}
                        onClick={() => setShowStats(true)}
                    >
                        <div className="flex flex-col w-full items-center">
                            <h2 className="flex gap-2">
                                Statistics
                                <ArrowRightIcon className="mt-0.5 w-6 h-6 text-text-primary" />
                            </h2>
                        </div>
                    </Button>
                )}
            </div>

            <CardFooter className="flex items-center justify-center">
                <Button className="mt-4" onClick={handleSave}>
                    Save
                </Button>
            </CardFooter>
        </Card>
    );
}
