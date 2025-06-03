import { describe, test, expect } from 'vitest';
import { MeasurementList } from '../lib/measurement_list';
import { MeasurementValue } from '../lib/measurement_value';

describe('MeasurementList', () => {
    test('should create an empty list', () => {
        const list = new MeasurementList();
        expect(list.size).toBe(0);
    });

    test('should append items to the list', () => {
        const list = new MeasurementList();
        const value1 = new MeasurementValue(10.5);
        const value2 = new MeasurementValue(-5.25);

        list.append(value1);
        expect(list.size).toBe(1);
        
        list.append(value2);
        expect(list.size).toBe(2);
    });

    test('should remove items from the list', () => {
        const list = new MeasurementList();
        const value1 = new MeasurementValue(10.5);
        const value2 = new MeasurementValue(-5.25);
        
        list.append(value1);
        list.append(value2);
        expect(list.size).toBe(2);
        
        list.remove(value1);
        expect(list.size).toBe(1);
        
        // head should now be value2
        expect((list.head as MeasurementValue).value).toBe(-5.25);
    });

    test('should join items with a delimiter', () => {
        const list = new MeasurementList();
        list.append(new MeasurementValue(10.5));
        list.append(new MeasurementValue(-5.25));
        list.append(new MeasurementValue(0));
        
        // MeasurementValueのvalueをカンマで結合
        const joined = list.join(',');
        expect(joined).toBe('10.5,-5.25,0');
    });

    test('should clone the list correctly', () => {
        const originalList = new MeasurementList();
        originalList.append(new MeasurementValue(10.5));
        originalList.append(new MeasurementValue(-5.25));
        
        const clonedList = originalList.clone();
        
        // サイズが同じであること
        expect(clonedList.size).toBe(originalList.size);
        
        // 別のオブジェクトであること
        expect(clonedList).not.toBe(originalList);
        
        // 内容が同じであること
        const originalArray = originalList.toArray();
        const clonedArray = clonedList.toArray();
        
        expect(clonedArray.length).toBe(originalArray.length);
        for (let i = 0; i < originalArray.length; i++) {
            expect(clonedArray[i].value).toBe(originalArray[i].value);
            expect(clonedArray[i]).not.toBe(originalArray[i]);
        }
    });

    test('should convert to array correctly', () => {
        const list = new MeasurementList();
        const values = [10.5, -5.25, 0, 3.75];
        
        values.forEach(v => list.append(new MeasurementValue(v)));
        
        const array = list.toArray();
        expect(array.length).toBe(values.length);
        
        for (let i = 0; i < values.length; i++) {
            expect(array[i].value).toBe(values[i]);
        }
    });
});
