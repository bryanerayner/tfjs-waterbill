/*

Plan:

List data as histogram of usage.

Train NN on histogram as input, and desired brackets and baseline prices as output.

For update step, compute monthly revenue per household, and monthly income / expense for the utility.


 Planned input
 [
    -category
    -baseline-price

    -price per gallon
    -size of bracket
    -price per gallon
    -size of bracket
    ...etc
 ],
 [

 ]


During each update step, brackets can be logged in human-readable format.

*/


import * as tf from '@tensorflow/tfjs';

import { getNewSimulatedCity, getMonthlyHistogram } from './sim_city';


/*

type RulesetCollection = IRuleset[]; // Index is category

type IRuleset = Brackets[]; // Index is meter size

type Brackets = [
    baseline,
    price per gallon,
    size of bucket
    ...

]

ruleset: RulesetCollection

*/

function computeWaterBill(category, meterSize, gallons, ruleset) {
    const gradients = ruleset[category][meterSize];

    let price = gradients[0] + 0;
    let computedGallons = 0;
    
    for(let i = 1, ii = gradients.length; i < ii; i+=2) {
        const pricePerGallon = gradients[i];
        const sizeOfBucket = gradients[i + 1];
        const bracketMin = computedGallons;
        const bracketMax = computedGallons + sizeOfBucket;

        if (gallons > bracketMin && gallons <= bracketMax) {
            const amountUsedInBucket = gallons - bracketMin;
            const amountOwedInBucket = amountUsedInBucket * pricePerGallon;
            price += amountOwedInBucket;
            continue;
        }
        if (gallons > bracketMax && gallons > bracketMin) {
            const bucketSize = bracketMax - bracketMin;
            const bucketPrice = bucketSize * pricePerGallon;
            price += bucketPrice;
            continue;
        }
        if (gallons <= bracketMin) {
            break;
        }
    }

    return price;
}

/**
 * Mountain car system simulator.
 *
 * There are two state variables in this system:
 *
 *   - position: The x-coordinate of location of the car.
 *   - velocity: The velocity of the car.
 *
 * The system is controlled through three distinct actions:
 *
 *   - leftward acceleration.
 *   - rightward acceleration
 *   - no acceleration
 */
export class WaterBill {
  /**
   * Constructor of MountainCar.
   */
  constructor() {
    this.simCityData = JSON.parse(localStorage.getItem('SIM_CITY') || 'null');
    if (!this.simCityData) {
        this.simCityData = getNewSimulatedCity();
        localStorage.setItem('SIM_CITY', JSON.stringify(this.simCityData));
    }

    this.monthlyHistogram = getMonthlyHistogram(this.simCityData);
  }


  /**
   * Get current state as a tf.Tensor of shape [1, 2].
   */
  getStateTensor() {
    

    return tf.tensor2d([
      ...this.monthlyHistogram,
      ...this.priceSettings
    ]);
  }

  /**
   * Update the mountain car system using an action.
   * @param {number[]} action Only the sign of `action` matters.
   *   Action is an integer, in [-1, 0, 1]
   *   A value of 1 leads to a rightward force of a fixed magnitude.
   *   A value of -1 leads to a leftward force of the same fixed magnitude.
   *   A value of 0 leads to no force applied.
   * @returns {bool} Whether the simulation is done.
   */
  update(priceSettings) {
    this.priceSettings = priceSettings;
    this.computePrices();
  }

  computePrices() {
    this.userMonthlyPrices = this.simCityData.simMonthlyWaterUsageData.map(simUser => {
        const userCaategory = simUser[0];
        const userMeterSize = simUser[1];
        const output = [userCaategory, userMeterSize];
        for(let i = 2, ii = simUser.length; i < ii; i+= 1) {
            const monthlyUsage = simUser[i];
            const waterBill = computeWaterBill(userCaategory, userMeterSize, monthlyUsage, this.priceSettings);
            output.push(waterBill);
        }
        return output;
    });
    this.monthlyGrossRevenue = this.userMonthlyPrices.reduce((sum, data) => {
        
        for(let i = 2, ii = simUser.length; i < ii; i+= 1) {
            sum[i-2] += data[i];
        }
    }, [0,0,0,0,0,0,0,0,0,0]);
  }

   /**
   * Determine whether this simulation is done.
   *
   * A simulation is done when `position` reaches `goalPosition`
   * and `velocity` is greater than zero.
   *
   * @returns {bool} Whether the simulation is done.
   */
  isDone() {
    return (
      this.position >= this.goalPosition
    ) && (
      this.velocity >= this.goalVelocity
    );
  }
}
