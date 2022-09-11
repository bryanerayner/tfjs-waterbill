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


export function getMonthlyHistogram({
    simMonthlyWaterUsageData,
    simHistoricDepartmentCostData
}) {

    const meterTypeCounts = new Map();

    const categoryCounts = new Map();

    const categoryData = new Map();

    simMonthlyWaterUsageData.forEach(dataset => {
        const category = dataset[0];
        const meterType = dataset[1];
        const mtC = meterTypeCounts.get(meterType) || 0;
        meterTypeCounts.set(meterType, mtc + 1);

        const cC = categoryCounts.get(category) || 0;
        categoryCounts.set(category, cc + 1);

        if (! categoryData.has(category)) {
            categoryData.set(category, [
                new Set(),
                new Set(),
                new Set(),

                new Set(),
                new Set(),
                new Set(),

                new Set(),
                new Set(),
                new Set(),

                new Set(),
                new Set(),
                new Set()
            ]);
        }

        const sums = categoryData.get(category);
        for(let i =0, ii = 12; i<ii;i+=1) {
            const usage = dataset[i+2];
            sums[i].add(usage || 0);
        }
    });

    // We will output a 2d array with the following outline:
    // [METER_TYPE_ENTRY, meterType, count],
    // [CATEGORY_CUSTOMER_COUNT, customerCount],
    // [CATEGORY_DATASET, monthlyUseCount],
    // [HISTORICAL_USAGE, monthlyData],

    const output = [];

    const METER_TYPE_ENTRY = 1;
    const CATEGORY_DATASET = 2;
    const CATEGORY_CUSTOMER_COUNT = 3;
    const HISTORICAL_USAGE = 4;

    meterTypeCounts.forEach((count, meterType) => {
        output.push([METER_TYPE_ENTRY, meterType, count]);
    });
    categoryCounts.forEach((count, category) => {
        output.push([CATEGORY_CUSTOMER_COUNT, category, count]);
    });

    var s = new Set();

    categoryData.forEach((montlyUseData, category) => {
        const sums = [];
        for(let i = 0, ii = montlyUseData.length; i< ii; i+=1) {
            const d = sums[i];
            let total = 0;
            d.forEach(v => total +=v);
            const mean = total / d.size;
            sums.push(mean);
        }

        output.push([CATEGORY_DATASET, ...sums]);
    });

    simHistoricDepartmentCostData.forEach(historicalCost => {
        output.push([HISTORICAL_USAGE, ...historicalCost]);
    });


    return normalize2dArrayLength(output);
}

export function normalize2dArrayLength(output) {

    let maxSize = 0;
    for (let o of output) {
        if (o.length > maxSize) {
            maxSize = o.length;
        }
    }
    for (let o of output) {
        while ( o.length < maxSize) {
            o.push(0);
        }
    }

    return output;
}