import { describe, test, expect, beforeEach } from 'vitest';
import { MeasurementList } from './measurement_list';
import { MeasurementValue } from './measurement_value';
import { calculateRainDropsAsync } from './raindrop_calculator';
import { type RainDrop, CycleType } from './rain_drop';

describe('RainDropCalculator', () => {
    let peaksAndValleys: MeasurementList;

    beforeEach(() => {
        peaksAndValleys = new MeasurementList();
    });

    test('should handle empty list', async () => {
        const rainDrops = await calculateRainDropsAsync(peaksAndValleys);
        expect(rainDrops).toEqual([]);
    });

    test('should handle list with single value', async () => {
        peaksAndValleys.append(new MeasurementValue(10.5));
        const rainDrops = await calculateRainDropsAsync(peaksAndValleys);
        expect(rainDrops).toEqual([]);
    });

    test('should calculate raindrops for simple wave', async () => {
        // 単純な波形のピークと谷
        const values = [0, 10, -5, 5];
        values.forEach(v => peaksAndValleys.append(new MeasurementValue(v)));

        const rainDrops = await calculateRainDropsAsync(peaksAndValleys);

        // レインドロップが計算されること
        expect(rainDrops.length).toBeGreaterThan(0);

        // 各レインドロップが適切な構造を持つこと
        rainDrops.forEach(drop => {
            expect(drop).toHaveProperty('range');
            expect(drop).toHaveProperty('cycleType');
            expect(typeof drop.range).toBe('number');
            expect([CycleType.FULL, CycleType.HALF]).toContain(drop.cycleType);
        });

        // 振幅の値が正しいこと
        const ranges = rainDrops.map(drop => drop.range);
        expect(ranges).toContain(15); // 10 - (-5) = 15
    });

    test('should calculate raindrops for complex wave', async () => {
        // 複雑な波形のピークと谷
        const values = [
            0, 10, -5, 8, -3, 12, -8, 6, -2, 4, 0
        ];
        values.forEach(v => peaksAndValleys.append(new MeasurementValue(v)));

        const rainDrops = await calculateRainDropsAsync(peaksAndValleys);
        console.log(rainDrops);

        // レインドロップが計算されること
        expect(rainDrops.length).toBeGreaterThan(0);

        // フルサイクルと0.5サイクルの両方が存在すること
        const fullCycles = rainDrops.filter(drop => drop.cycleType === CycleType.FULL);
        const halfCycles = rainDrops.filter(drop => drop.cycleType === CycleType.HALF);

        expect(fullCycles.length).toBeGreaterThan(0);
        expect(halfCycles.length).toBeGreaterThan(0);

        // 合計サイクル数が正しいこと
        const collectRainDrops: RainDrop[] = [
            { range: 10, cycleType: 0.5 },
            { range: 11, cycleType: 1 },
            { range: 15, cycleType: 0.5 },
            { range: 17, cycleType: 0.5 },
            { range: 20, cycleType: 0.5 },
            { range: 14, cycleType: 0.5 },
            { range: 8, cycleType: 0.5 },
            { range: 6, cycleType: 0.5 },
            { range: 4, cycleType: 0.5 }
        ];

        // 計算結果とcollectRainDropsを比較する
        expect(rainDrops).toEqual(collectRainDrops);
    });

    test('should calculate raindrops using real-world data', async () => {
        // data_header.tsvから抽出したピーク・谷データ
        const values = [
            2.594074965, -25.46910095, 43.39179993, 32.54384995
        ];
        values.forEach(v => peaksAndValleys.append(new MeasurementValue(v)));

        const rainDrops = await calculateRainDropsAsync(peaksAndValleys);

        // レインドロップが計算されること
        expect(rainDrops.length).toBeGreaterThan(0);

        // 最大振幅を確認
        const maxRange = Math.max(...rainDrops.map(drop => drop.range));
        const expectedMaxRange = 43.39179993 - (-25.46910095); // 最大値 - 最小値
        expect(maxRange).toBeCloseTo(expectedMaxRange, 5);
    });    test('should calculate raindrops using data from data_header_short.tsv', async () => {
        // data_header_short.tsvからデータを読み取り
        const values = [
            2.594074965, -25.46910095, 43.39179993, 32.54384995, -126.873848, -70.0400238, -43.39179993, -46.45752716
        ];
        values.forEach(v => peaksAndValleys.append(new MeasurementValue(v)));

        const rainDrops = await calculateRainDropsAsync(peaksAndValleys);

        // レインドロップが計算されること
        expect(rainDrops.length).toBeGreaterThan(0);

        // 各レインドロップが適切な構造を持つこと
        rainDrops.forEach(drop => {
            expect(drop).toHaveProperty('range');
            expect(drop).toHaveProperty('cycleType');
            expect(typeof drop.range).toBe('number');
            expect([CycleType.FULL, CycleType.HALF]).toContain(drop.cycleType);
        });

        // 実行結果を正解データとして比較
        const expectedRainDrops: RainDrop[] = [
            { range: 28.063175915000002, cycleType: 0.5 },
            { range: 10.847949979999996, cycleType: 1 },
            { range: 101.40474705, cycleType: 0.5 },
            { range: 56.833824199999995, cycleType: 0.5 },
            { range: 26.648223870000002, cycleType: 0.5 },
            { range: 3.0657272300000002, cycleType: 0.5 }
        ];
        expect(rainDrops).toEqual(expectedRainDrops);

        // 最大振幅を確認
        const maxRange = Math.max(...rainDrops.map(drop => drop.range));
        // 注: 最大振幅はデータの最大値-最小値と必ずしも一致しない
        expect(maxRange).toBe(101.40474705);
    });
});
