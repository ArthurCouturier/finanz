import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "../components/ui/button";
import { useState } from "react";
import Number from "@/components/Number";

export default function Home() {
    const [value, setValue] = useState(0)

    return (
        <div>
            <h1>Home</h1>
            <p>This is the home page</p>
            <Button>Test</Button>
            <ModeToggle />
            <Number
                title="TJM"
                subtitle="(H.T.)"
                clasName="w-45"
                value={value}
                setValue={setValue}
                defaultValue={value}
                min={0}
                max={1000}
                step={5}
            />
        </div>
    )
}
