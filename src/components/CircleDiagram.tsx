export default function CircleDiagram({
    taxs,
}: {
    taxs: number[];
}) {
    const getRadFromPercent = (percent: number) => {
        return (percent / 4 * Math.PI);
    };

    const taxsSum = taxs.reduce((acc, curr) => acc + curr, 0);

    const reduce: number[] = []
    taxs.reduce((acc, curr) => {
        const sum = acc + curr;
        reduce.push(sum);
        return sum;
    }, 0)

    return (
        <svg width="200" height="200">
            <circle cx="100" cy="100" r={getRadFromPercent(100)} fill="var(--chart-5)"
                className="hover:opacity-80 transition duration-300 ease-in-out"
            />
            {taxs.map((_, index) => (
                <>
                    <circle cx="100" cy="100" r={getRadFromPercent(100 - reduce[index])} stroke="var(--secondary)" strokeWidth="1" fill="var(--secondary)" />
                    <circle cx="100" cy="100" r={getRadFromPercent(100 - reduce[index])} stroke="var(--secondary)" strokeWidth="1" fill="var(--chart-5)"
                        className="hover:opacity-80 transition duration-300 ease-in-out"
                    />
                </>
            ))}
            <circle cx="100" cy="100" r={getRadFromPercent(100 - taxsSum)} stroke="var(--secondary)" strokeWidth="1" fill="var(--secondary)" />
            <circle cx="100" cy="100" r={getRadFromPercent(100 - taxsSum)} stroke="var(--secondary)" strokeWidth="1" fill="var(--chart-1)"
                className="hover:opacity-80 transition duration-300 ease-in-out"
            />
        </svg>
    );
}
