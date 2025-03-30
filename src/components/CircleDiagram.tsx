export default function CircleDiagram({
    taxs,
}: {
    taxs: number[];
}) {
    const getRadFromPercent = (percent: number) => {
        return (percent / 4 * Math.PI);
    };

    return (
        <svg width="200" height="200">
            <circle cx="100" cy="100" r={getRadFromPercent(100)} fill="var(--chart-5)"
                className="hover:opacity-80 transition duration-300 ease-in-out"
            />
            <circle cx="100" cy="100" r={getRadFromPercent(90)} stroke="var(--secondary)" strokeWidth="2" fill="var(--secondary)" />
            <circle cx="100" cy="100" r={getRadFromPercent(90)} stroke="var(--secondary)" strokeWidth="2" fill="var(--chart-5)"
                className="hover:opacity-80 transition duration-300 ease-in-out"
            />
            <circle cx="100" cy="100" r={getRadFromPercent(100 - 10 - taxs[0])} stroke="var(--secondary)" strokeWidth="4" fill="var(--secondary)" />
            <circle cx="100" cy="100" r={getRadFromPercent(100 - 10 - taxs[0])} stroke="var(--secondary)" strokeWidth="4" fill="var(--chart-1)"
                className="hover:opacity-80 transition duration-300 ease-in-out"
            />
        </svg>
    );
}
