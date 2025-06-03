import { describe, test, expect } from 'vitest';
import { MeasurementValue } from './measurement_value';

describe('MeasurementValue', () => {
    test('should create a MeasurementValue with the given value', () => {
        const value = 10.5;
        const measurementValue = new MeasurementValue(value);
        expect(measurementValue.value).toBe(value);
    });

    test('should clone a MeasurementValue correctly', () => {
        const value = -15.75;
        const original = new MeasurementValue(value);
        const cloned = original.clone();
        
        // クローンは同じ値を持つが別のオブジェクトであること
        expect(cloned.value).toBe(value);
        expect(cloned).not.toBe(original);
    });
});
