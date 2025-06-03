import { describe, test, expect } from 'vitest';
import { HistogramCalculator } from '../lib/histogram_calculator';
import { CycleType, type RainDrop } from '../lib/rain_drop';

describe('HistogramCalculator', () => {
    test('should handle empty raindrops array', () => {
        const rainDrops: RainDrop[] = [];
        const binWidth = 10;
        
        const bins = HistogramCalculator.calculate(rainDrops, binWidth);
        expect(bins).toEqual([]);
    });

    test('should handle invalid bin width', () => {
        const rainDrops: RainDrop[] = [
            { range: 10, cycleType: CycleType.FULL }
        ];
        
        const bins = HistogramCalculator.calculate(rainDrops, 0);
        expect(bins).toEqual([]);
        
        const binsNegative = HistogramCalculator.calculate(rainDrops, -5);
        expect(binsNegative).toEqual([]);
    });

    test('should calculate histogram with proper bin structure', () => {
        const rainDrops: RainDrop[] = [
            { range: 10, cycleType: CycleType.FULL },
            { range: 15, cycleType: CycleType.FULL },
            { range: 25, cycleType: CycleType.HALF }
        ];
        const binWidth = 10;
        
        const bins = HistogramCalculator.calculate(rainDrops, binWidth);
        
        // 3つの区間が作成されること (0-10, 10-20, 20-30)
        expect(bins.length).toBe(3);
        
        // 各区間が正しい構造を持つこと
        bins.forEach(bin => {
            expect(bin).toHaveProperty('min');
            expect(bin).toHaveProperty('max');
            expect(bin).toHaveProperty('count');
            expect(bin).toHaveProperty('center');
        });
        
        // 最初の区間 (0-10)
        expect(bins[0].min).toBe(0);
        expect(bins[0].max).toBe(10);
        expect(bins[0].center).toBe(5);
        expect(bins[0].count).toBe(0); // 0-10の範囲には値がない
        
        // 2番目の区間 (10-20)
        expect(bins[1].min).toBe(10);
        expect(bins[1].max).toBe(20);
        expect(bins[1].center).toBe(15);
        expect(bins[1].count).toBe(2); // 10と15の2つのフルサイクル
        
        // 3番目の区間 (20-30)
        expect(bins[2].min).toBe(20);
        expect(bins[2].max).toBe(30);
        expect(bins[2].center).toBe(25);
        expect(bins[2].count).toBe(0.5); // 25の0.5サイクル
    });

    test('should calculate histogram with real-world data', () => {
        // data_header.tsvから抽出したテストデータ
        const rainDrops: RainDrop[] = [
            { range: 28.06, cycleType: CycleType.FULL },
            { range: 68.86, cycleType: CycleType.FULL },
            { range: 10.85, cycleType: CycleType.HALF },
            { range: 43.39, cycleType: CycleType.HALF },
            { range: 15.33, cycleType: CycleType.FULL }
        ];
        const binWidth = 20;
        
        const bins = HistogramCalculator.calculate(rainDrops, binWidth);
        
        // 4つの区間が作成されること (0-20, 20-40, 40-60, 60-80)
        expect(bins.length).toBe(4);
        
        // 各区間のカウントが正しいこと
        expect(bins[0].count).toBe(1.5); // 10.85のハーフサイクルと15.33のフルサイクル
        expect(bins[1].count).toBe(1); // 28.06のフルサイクル
        expect(bins[2].count).toBe(0.5); // 43.39のハーフサイクル
        expect(bins[3].count).toBe(1); // 68.86のフルサイクル
        
        // 合計サイクル数が正しいこと
        const totalCycles = bins.reduce((sum, bin) => sum + bin.count, 0);
        expect(totalCycles).toBe(4); // 3フルサイクル + 2ハーフサイクル = 4サイクル
    });
});
