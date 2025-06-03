import { describe, test, expect, beforeEach } from 'vitest';
import { MeasurementSpot } from '../lib/measurement_spot';
import { MeasurementValue } from '../lib/measurement_value';
import { CycleType } from '../lib/rain_drop';

describe('MeasurementSpot', () => {
    let spot: MeasurementSpot;
    
    beforeEach(() => {
        spot = new MeasurementSpot('テスト計測位置');
    });

    test('should create a spot with the given label', () => {
        expect(spot.label).toBe('テスト計測位置');
        expect(spot.list.size).toBe(0);
        expect(spot.rainDrops).toEqual([]);
    });

    test('should insert data correctly', () => {
        spot.insertData(10.5);
        spot.insertData(-5.25);
        
        expect(spot.list.size).toBe(2);
        
        const values = spot.list.toArray().map(v => v.value);
        expect(values).toEqual([10.5, -5.25]);
    });

    test('should extract peaks and valleys', async () => {
        // 単純な波形を挿入
        const values = [0, 5, 10, 5, 0, -5, 0, 5];
        values.forEach(v => spot.insertData(v));
        
        await spot.extractPeaksAndValleysAsync();
        
        // テスト: ここでは直接extractedPeaksAndValleysにアクセスする方法がないため、
        // calculateRainDropsAsyncを実行してその結果をチェックする
        await spot.calculateRainDropsAsync();
        
        // レインドロップが計算されていることを確認
        expect(spot.rainDrops.length).toBeGreaterThan(0);
    });

    test('should calculate rain drops', async () => {
        // 単純な波形のピークと谷を挿入
        const values = [0, 10, -5, 5];
        values.forEach(v => spot.insertData(v));
        
        await spot.extractPeaksAndValleysAsync();
        await spot.calculateRainDropsAsync();
        
        // レインドロップが計算されていることを確認
        expect(spot.rainDrops.length).toBeGreaterThan(0);
        
        // 各レインドロップが適切な構造を持つこと
        spot.rainDrops.forEach(drop => {
            expect(drop).toHaveProperty('range');
            expect(drop).toHaveProperty('cycleType');
            expect(typeof drop.range).toBe('number');
            expect([CycleType.FULL, CycleType.HALF]).toContain(drop.cycleType);
        });
    });

    test('should calculate status correctly', async () => {
        // data_header.tsvから抽出したテストデータ
        const values = [
            2.594074965, -1.414950013, -4.952324867, -10.84794998, -18.15852547,
            -23.34667587, -25.46910095, -24.76162529, -23.11084938, -19.80929947
        ];
        values.forEach(v => spot.insertData(v));
        
        await spot.extractPeaksAndValleysAsync();
        await spot.calculateRainDropsAsync();
        
        // レインドロップを手動で設定 (テスト用)
        const tempRainDrops = [
            { range: 10, cycleType: CycleType.FULL },
            { range: 20, cycleType: CycleType.FULL },
            { range: 15, cycleType: CycleType.HALF }
        ];
        
        // rainDropsを直接設定する方法がないため、ここではstatusの計算のみをテスト
        spot.calculateStatus();
        
        // measurementValueに関する統計情報の確認
        expect(spot['_status'].measurementValueCount).toBe(values.length);
        expect(spot['_status'].measurementValueMax).toBe(2.594074965);
        expect(spot['_status'].measurementValueMin).toBe(-25.46910095);
    });

    test('should handle real-world data', async () => {
        // data_header.tsvから抽出したテストデータ
        const values = [
            2.594074965, -1.414950013, -4.952324867, -10.84794998, -18.15852547,
            -23.34667587, -25.46910095, -24.76162529, -23.11084938, -19.80929947,
            -14.38532543, -8.253874779, -2.358250141, 1.414950013, 5.659800053,
            12.73455048, 20.04512596, 25.94075012, 32.07220078, 37.73200226
        ];
        values.forEach(v => spot.insertData(v));
        
        // すべての処理を実行
        await spot.extractPeaksAndValleysAsync();
        await spot.calculateRainDropsAsync();
        spot.calculateStatus();
        
        // データが正しく処理されていることを確認
        expect(spot.list.size).toBe(values.length);
        expect(spot.rainDrops.length).toBeGreaterThan(0);
        
        // 統計情報が計算されていることを確認
        expect(spot['_status'].measurementValueCount).toBeGreaterThan(0);
        expect(spot['_status'].rainDropAmplitudeCount).toBeGreaterThan(0);
    });
});
