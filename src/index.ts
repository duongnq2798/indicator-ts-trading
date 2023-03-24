/**
 * Calculate the moving average of an array of numbers.
 * @param data An array of data points.
 * @param N The number of data points to consider in the moving average.
 * @returns The moving average of the last N data points in the array.
 * @throws An error if there are less than N data points in the array.
 */
export function movingAverage(data: number[], N: number): number {
  if (data.length < N) {
    throw new Error("Not enough data points to calculate moving average");
  }

  const sum = data
    .slice(data.length - N)
    .reduce((accumulator, currentValue) => accumulator + currentValue);
  return sum / N;
}

/**
 * Calculate Moving Average Envelope.
 * @param closePrices An array of closing prices of the asset.
 * @param n The number of days in the Moving Average cycle.
 * @param k The percentage value of the Moving Average offset.
 * @returns An object containing the Upper Envelope and Lower Envelope values.
 */
export function movingAverageEnvelope(
  closePrices: number[],
  n: number,
  k: number
): { upperEnvelope: number[]; lowerEnvelope: number[] } {
  const sma = simpleMovingAverage(closePrices, n);
  const upperEnvelope = sma.map((price) => price * (1 + k / 100));
  const lowerEnvelope = sma.map((price) => price * (1 - k / 100));
  return { upperEnvelope, lowerEnvelope };
}

/**
 * Calculate Simple Moving Average.
 * @param closePrices An array of closing prices of the asset.
 * @param n The number of days in the Moving Average cycle.
 * @returns An array containing Simple Moving Average values.
 */
export function simpleMovingAverage(
  closePrices: number[],
  n: number
): number[] {
  const sma = [];
  let sum = 0;

  for (let i = 0; i < closePrices.length; i++) {
    sum += closePrices[i];
    if (i >= n) {
      sum -= closePrices[i - n];
      sma.push(sum / n);
    }
  }

  return sma;
}

/**
 * Calculates the Moving Average Deviation (MAD) for a given array of numbers.
 *
 * @param numbers An array of numbers for which to calculate MAD.
 * @param windowSize The size of the moving window (i.e., the number of values to include in each subset).
 * @returns An array of MAD values.
 */
export function MAD(numbers: number[], windowSize: number): number[] {
  // Initialize an empty array to hold the MAD values.
  const mad: number[] = [];

  // Iterate over the numbers array and calculate MAD for each subset of size windowSize.
  for (let i = 0; i <= numbers.length - windowSize; i++) {
    // Extract a subset of the numbers array of size windowSize.
    const subset = numbers.slice(i, i + windowSize);
    // Calculate the average (i.e., the mean) of the subset.
    const avg = subset.reduce((sum, value) => sum + value, 0) / windowSize;
    // Calculate the deviations of each value from the average.
    const deviations = subset.map((value) => Math.abs(value - avg));
    // Calculate the MAD for the subset by taking the average of the absolute deviations.
    const madValue =
      deviations.reduce((sum, value) => sum + value, 0) / windowSize;
    // Add the MAD value to the mad array.
    mad.push(madValue);
  }

  // Return the array of MAD values.
  return mad;
}

/**
 * Calculates the Bollinger Bands for a given array of numbers using a moving average and standard deviation.
 * @param data An array of numbers for which to calculate Bollinger Bands.
 * @param period The number of data points to include in each moving average calculation.
 * @param deviation The number of standard deviations to use for the upper and lower bands.
 * @returns An array of BollingerBandsResult objects.
 */
interface BollingerBandsResult {
  upperBand: number;
  middleBand: number;
  lowerBand: number;
}

export function bollingerBands(
  data: number[],
  period: number,
  deviation: number
): BollingerBandsResult[] {
  const results: BollingerBandsResult[] = [];

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      // Not enough data yet, so just skip
      results.push({ upperBand: NaN, middleBand: NaN, lowerBand: NaN });
      continue;
    }

    const slice = data.slice(i - period + 1, i + 1);
    const mean = slice.reduce((acc, val) => acc + val, 0) / period;
    const variance =
      slice.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / period;
    const stdDev = Math.sqrt(variance);
    const upperBand = mean + deviation * stdDev;
    const lowerBand = mean - deviation * stdDev;

    results.push({ upperBand, middleBand: mean, lowerBand });
  }

  return results;
}

interface RSIOptions {
  period: number;
  values: number[];
}

/**
 * Given an array of numbers, calculate the average of those numbers.
 * @param {number[]} values - number[] - This is the array of numbers we want to calculate the average
 * of.
 * @returns The average of the values in the array.
 */
function calculateAverage(values: number[]): number {
  const sum = values.reduce((a, b) => a + b, 0);
  return sum / values.length;
}

/**
 * It takes an array of numbers and returns an array of numbers.
 * @param {RSIOptions} options - RSIOptions
 * @returns An array of numbers.
 */
export function rsi(options: RSIOptions): number[] {
  const { period, values } = options;
  const deltas = [];
  for (let i = 1; i < values.length; i++) {
    deltas.push(values[i] - values[i - 1]);
  }
  const gains = deltas.map((delta) => (delta > 0 ? delta : 0));
  const losses = deltas.map((delta) => (delta < 0 ? Math.abs(delta) : 0));
  let avgGain = calculateAverage(gains.slice(0, period));
  let avgLoss = calculateAverage(losses.slice(0, period));
  let rs = avgGain / avgLoss;
  const rsi = [100 - 100 / (1 + rs)];
  for (let i = period; i < values.length; i++) {
    const delta = deltas[i - 1];
    const gain = delta > 0 ? delta : 0;
    const loss = delta < 0 ? Math.abs(delta) : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    rs = avgGain / avgLoss;
    rsi.push(100 - 100 / (1 + rs));
  }
  return rsi;
}

interface Candle {
  time: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

type CandleWithMacdLine = Candle & { macdLine: number };

/**
 * It takes an array of candles, a period, and a key, and returns an array of ema values
 * @param {CandleWithMacdLine[]} candles - CandleWithMacdLine[]
 * @param {number} period - The number of candles to calculate the EMA over.
 * @param key - keyof CandleWithMacdLine
 * @returns An array of numbers.
 */
export function ema(
  candles: CandleWithMacdLine[],
  period: number,
  key: keyof CandleWithMacdLine
): number[] {
  const prices: any = candles.map((candle) => candle[key]);
  const emaArray = [];

  let ema =
    prices.slice(0, period).reduce((a: number, b: number) => a + b) / period;
  emaArray.push(ema);

  for (let i = period; i < prices.length; i++) {
    ema = prices[i] * (2 / (period + 1)) + ema * (1 - 2 / (period + 1));
    emaArray.push(ema);
  }

  return emaArray;
}

/**
 * It takes in a list of candles, a list of short EMA values, a list of long EMA values, and a signal
 * period, and returns a list of MACD values.
 * @param {Candle[]} candles - Candle[] - an array of candles
 * @param {number[]} shortEMA - number[] - the short EMA values
 * @param {number[]} longEMA - the long EMA
 * @param {number} signalPeriod - 9
 * @returns The difference between the short and long EMA.
 */
export function macd(
  candles: Candle[],
  shortEMA: number[],
  longEMA: number[],
  signalPeriod: number
): number[] {
  const shortEMAValues = shortEMA.slice(longEMA.length - shortEMA.length);
  const longEMAValues = longEMA.slice(longEMA.length - shortEMA.length);

  const macdLine = shortEMAValues.map((ema, i) => ema - longEMAValues[i]);

  const signalLine = ema(
    macdLine.map((value, i) => ({
      ...candles[i + longEMA.length - shortEMA.length],
      macdLine: value,
    })),
    signalPeriod,
    "macdLine"
  );

  return macdLine.map((value, i) => value - signalLine[i]);
}

interface CryptoDataPoint {
  timestamp: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/**
 * The Accumulation/Distribution Line is a momentum indicator that attempts to gauge supply and demand
 * by determining whether investors are generally "accumulating," or buying, a security, or
 * "distributing," or selling, a security.
 * @param {CryptoDataPoint[]} cryptoData - CryptoDataPoint[] = [
 * @returns An array of numbers.
 */
export function calculateAD(cryptoData: CryptoDataPoint[]): number[] {
  const ad: number[] = [];
  let prevAD = 0;
  for (let i = 0; i < cryptoData.length; i++) {
    const currentData = cryptoData[i];
    const { high, low, close, volume } = currentData;
    const moneyFlowMultiplier = (close - low - (high - close)) / (high - low);
    const moneyFlowVolume = moneyFlowMultiplier * volume;
    const currentAD = prevAD + moneyFlowVolume;
    ad.push(currentAD);
    prevAD = currentAD;
  }
  return ad;
}
