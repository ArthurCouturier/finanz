import RestaurantConfigInterface from "@/interfaces/configurations/RestaurantConfigInterface";
import { Button } from "../ui/button";
import { Card, CardHeader, CardTitle, CardFooter, CardContent } from "../ui/card";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { ArrowRightIcon } from "@heroicons/react/24/solid";
import Number from "../Number";


export default function RestaurantConfiguration({
    config
} :{
    config: RestaurantConfigInterface
}) {

    const [showConfigWeek, setShowConfigWeek] = useState(false);

    const navigateTo = useNavigate();

    const [name, setName] = useState(config.name);
    
    return (
        <Card className="h-fit">
            <CardHeader className="relative">
                <Button className="absolute left-4 -top-1.5 blue" onClick={() => { navigateTo("/") }}>
                    Home
                </Button>
                <CardTitle>
                    <h2><input className="text-center" value={name} onChange={(e) => setName(e.target.value)} /></h2>
                </CardTitle>
                <Button className="absolute right-4 -top-1.5 blue" onClick={() => { navigateTo("/chooseConfig/tjm") }}>
                    Change config
                </Button>
            </CardHeader>
            <div className="flex justify-center">
                {showConfigWeek ? 
                <Card className="mx-4 mt-2 pt-2 w-full h-full" onClick={() => setShowConfigWeek(false)}>
                    <CardTitle className="justify-center flex items-center gap-2">
                        <h2 className="flex gap-2">
                            Configuration of the week
                        </h2>
                        <ArrowRightIcon className="w-6 h-6 text-text-primary rotate-90"/>
                    </CardTitle>
                    <CardContent 
                    className="gap-4 flex flex-col items-center" 
                    onClick={(e) => e.stopPropagation()}>
                        <Day name={"Monday"}/>
                        <Day name={"Tuesday"}/>
                        <Day name={"Wednesday"}/>
                        <Day name={"Thursday"}/>
                        <Day name={"Friday"}/>
                        <Day name={"Saturday"}/>
                        <Day name={"Sunday"}/>
                    </CardContent>
                </Card>
                : <Button
                className={`h-full flex items-baseline ${showConfigWeek && "w-5/6"}`}
                onClick={() => setShowConfigWeek(true)}>
                    <div className="flex flex-col w-full items-center">
                        <h2 className="flex gap-2">
                            Configuration of the week 
                            <ArrowRightIcon className="mt-0.5 w-6 h-6 text-text-primary"/>
                        </h2>
                    </div>
                </Button>
                }
            </div>
            <CardFooter className="flex items-center justify-center">
                <Button
                    className="mt-4"
                    // onClick={handleSave}
                >
                    Save
                </Button>
            </CardFooter>
        </Card>
    )
}

function Day({
    name
}: {
    name: string
}) {

    const [showDetails, setShowDetails] = useState(false);

    return (
        showDetails ?
        <Card 
        className="mx-4 mt-2 pt-2 w-full h-full flex flex-col items-center" 
        onClick={() => setShowDetails(false)}> 
            <CardTitle className="justify-center flex items-center gap-2">
                <h2 className="flex gap-2">
                    {name}
                </h2>
                <ArrowRightIcon className="w-6 h-6 text-text-primary rotate-90"/>
            </CardTitle>
            <CardContent 
            className="w-full gap-6 flex flex-col items-center " 
            onClick={(e) => e.stopPropagation()}>
                <Service name={"Lunch Service"}/>
                <Service name={"Evening Service"}/>
            </CardContent>
            <CardFooter className="flex items-center justify-center">
                <Button
                    className="mt-4"
                    // onClick={handleSave}
                >
                    Save
                </Button>
            </CardFooter>
        </Card>
        : <Button
        className="h-full flex flex-col items-center w-32"
        onClick={() => setShowDetails(true)}>
            <h2 className="flex gap-2"> 
                {name}
                <ArrowRightIcon className="mt-0.5 w-6 h-6 text-text-primary"/>
            </h2>
        </Button>
    )
}

function Service({
    name,
    config
}:{
    name: string;
    config: RestaurantConfigInterface
}) {

    const [cutlery, setCutlery] = useState(0); // Il faudra mettre quelque chose du genre config.week.cutleryValue
    const [starters, setStarters] = useState(0);
    const [mains, setMains] = useState(0);
    const [desserts, setDesserts] = useState(0);
    const [drinks, setDrinks] = useState(0);

    return (
        <div className="w-full"
        onClick={(e)=> e.stopPropagation()}>
            <h2> {name} </h2>
            <div className="flex justify-between gap-2">
                <Number
                    className="w-full"
                    title={"Couverts"}
                    max={1500}
                    min={0}
                    step={1}
                    value={cutlery} 
                    setValue={setCutlery} 
                />
                <Number
                className="w-full"
                    title={"Entrées"} 
                    max={1500}
                    min={0}
                    value={starters} 
                    setValue={setStarters} 
                />
                <Number
                className="w-full"
                    title={"Plats"} 
                    max={1500}
                    min={0}
                    value={mains} 
                    setValue={setMains} 
                />
                <Number
                className="w-full"
                    title={"Desserts"} 
                    max={1500}
                    min={0}
                    value={desserts} 
                    setValue={setDesserts} 
                />
                <Number
                className="w-full"
                    title={"Boissons"} 
                    max={1500}
                    min={0}
                    value={drinks} 
                    setValue={setDrinks} 
                />
            </div>
        </div>
    )
}