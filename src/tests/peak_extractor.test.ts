import { describe, test, expect, beforeEach } from 'vitest';
import { MeasurementList } from '../lib/measurement_list';
import { MeasurementValue } from '../lib/measurement_value';
import { extractPeaksAndValleysAsync } from '../lib/peak_extractor';

describe('PeakExtractor', () => {
    let measurementValues: MeasurementList;

    beforeEach(() => {
        measurementValues = new MeasurementList();
    });

    test('should handle empty list', async () => {
        const result = await extractPeaksAndValleysAsync(measurementValues);
        expect(result).toBeNull();
    });

    test('should handle list with single value', async () => {
        measurementValues.append(new MeasurementValue(10.5));
        const result = await extractPeaksAndValleysAsync(measurementValues);
        expect(result).toBeNull();
    });

    test('should handle list with two values', async () => {
        measurementValues.append(new MeasurementValue(10.5));
        measurementValues.append(new MeasurementValue(-5.25));
        const result = await extractPeaksAndValleysAsync(measurementValues);
        expect(result).toBeNull();
    });

    test('should extract peaks and valleys from a simple wave', async () => {
        // 単純な波形: 上昇 -> 下降 -> 上昇
        const values = [0, 5, 10, 5, 0, -5, 0, 5];
        values.forEach((v) => measurementValues.append(new MeasurementValue(v)));

        const result = await extractPeaksAndValleysAsync(measurementValues);

        // 結果はnullでないこと
        expect(result).not.toBeNull();
        if (result) {
            // 極値のみが抽出されること（最初と最後の点を含む）
            const extractedValues = result.toArray().map((v) => v.value);

            // 期待される極値: 開始点、最大値、最小値、終了点
            expect(extractedValues).toEqual([0, 10, -5, 5]);
            expect(result.size).toBe(4);
        }
    });

    test('should extract peaks and valleys from real-world data', async () => {
        // data_header.tsvから抽出したテストデータ
        const values = [
            2.594074965, -1.414950013, -4.952324867, -10.84794998, -18.15852547, -23.34667587,
            -25.46910095, -24.76162529, -23.11084938, -19.80929947, -14.38532543, -8.253874779,
            -2.358250141, 1.414950013, 5.659800053, 12.73455048, 20.04512596, 25.94075012,
            32.07220078, 37.73200226, 42.44850159, 43.39179993, 40.56190109, 36.08122635,
            32.54384995
        ];
        values.forEach((v) => measurementValues.append(new MeasurementValue(v)));

        const result = await extractPeaksAndValleysAsync(measurementValues);

        // 結果はnullでないこと
        expect(result).not.toBeNull();
        if (result) {
            // 極値のみが抽出されること
            const extractedValues = result.toArray().map((v) => v.value);

            // 最低でも開始点と終了点が含まれること
            expect(extractedValues).toContain(values[0]);
            expect(extractedValues).toContain(values[values.length - 1]);

            // 最低点が含まれること
            expect(extractedValues).toContain(-25.46910095);

            // 最高点が含まれること
            expect(extractedValues).toContain(43.39179993);

            // 極値の数は元のデータより少ないこと
            expect(result.size).toBeLessThan(values.length);
        }
    });
});
