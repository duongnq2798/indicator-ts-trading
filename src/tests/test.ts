import {
  calculateMovingAverage,
  calculateMovingAverageEnvelope,
} from "../index";

describe("calculateMovingAverage", () => {
  test("it should calculate the moving average correctly", () => {
    const data = [2, 4, 6, 8, 10];
    const N = 3;
    const expected = 8;
    const result = calculateMovingAverage(data, N);
    expect(result).toBe(expected);
  });

  test("it should throw an error if there is not enough data", () => {
    const data = [2, 4];
    const N = 3;
    expect(() => calculateMovingAverage(data, N)).toThrow(
      "Not enough data points to calculate moving average"
    );
  });
});

describe("calculateMovingAverageEnvelope", () => {
  test("returns the correct envelope values", () => {
    const closePrices = [10, 20, 30, 40, 50];
    const n = 3;
    const k = 10;
    const expectedUpperEnvelope = [33, 44, 55];
    const expectedLowerEnvelope = [17, 28, 39];
    const result = calculateMovingAverageEnvelope(closePrices, n, k);
    expect(result.upperEnvelope).toEqual(expectedUpperEnvelope);
    expect(result.lowerEnvelope).toEqual(expectedLowerEnvelope);
  });

  test("returns an object with two arrays", () => {
    const closePrices = [10, 20, 30, 40, 50];
    const n = 3;
    const k = 10;
    const result = calculateMovingAverageEnvelope(closePrices, n, k);
    expect(result).toHaveProperty("upperEnvelope");
    expect(result).toHaveProperty("lowerEnvelope");
    expect(Array.isArray(result.upperEnvelope)).toBe(true);
    expect(Array.isArray(result.lowerEnvelope)).toBe(true);
  });
});
