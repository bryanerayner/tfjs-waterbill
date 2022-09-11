export function getNewSimulatedCity() {
    

    const usagePatternSeeds = 
    [ 
    [7,6,7, 5,14,15, 12,11,10, 8,7,6 ],
    [8,8,6, 7,7,7, 10,10,8, 7,7,7 ],
    [7,8,7, 8,7,7, 10,13,8, 7,7,7 ]
    ];

    const patternVariance = 1500;

    const costSeeds = [
    [300, 300, 300, 300, 300, 300, 300, 300, 300, 300, 300, 300],
    [300, 300, 300, 400, 400, 460, 300, 400, 300, 300, 300, 300],
    ];

    const costVariance = 20000;

    const datasetCount = 8000;

    const categoryCounts = 4;
    const meterSizeCounts = 4;

    // Array of arrays.
    // Meaning of indices:
    // [0] - Class
    // [1] - Meter Size
    // [2...13] - Jan - Dec usage (gallons)
    const simMonthlyWaterUsageData = [];
    const simHistoricDepartmentCostData = [];

    for(const pattern of usagePatterns) {
        let counter = Math.ceil(datasetCount / (usagePatternSeeds.length + 1));
        while(counter-- > 0) {
            if (simMonthlyWaterUsageData.length > datasetCount) {
                continue;
            }
            let simUsage = [];
            const category = Math.floor(Math.random() * categoryCounts);
            simUsage.push(category);
            const meterSize = Math.floor(Math.random() * meterSizeCounts);
            simUsage.push(meterSize);
            for(const value of pattern) {
                const deviation = Math.floor(Math.random() * patternVariance);
                const baseline = value * 1000;
                simUsage.push(baseline + deviation);
            }
            simMonthlyWaterUsageData.push(simUsage);
        }
    }

    for(const seed of costSeeds) {
        const dataset = [];
        for(const month of seed) {
            const deviation = Math.floor(Math.random() * costVariance);
            const baseline = month * 1000;
            const price = baseline + deviation;
            dataset.push(price);
        }
        simHistoricDepartmentCostData.push(dataset);
    }

    return {
        simMonthlyWaterUsageData,
        simHistoricDepartmentCostData
    };
}