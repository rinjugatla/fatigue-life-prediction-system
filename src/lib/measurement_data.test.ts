import { describe, test, expect, vi, beforeEach } from 'vitest';
import { MeasurementData } from './measurement_data';
import type { DataOption } from './data_option';

describe('MeasurementData', () => {
    let measurementData: MeasurementData;
    let defaultOption: DataOption;
    
    beforeEach(() => {
        defaultOption = {
            delimiter: '\t',
            existsHeaderRow: true,
            existsDatetimeColumn: true,
            existsMillisecondColumn: true,
            measurementValueThreshold: 0.001
        };
        measurementData = new MeasurementData(defaultOption);
    });

    test('should create an instance with the given options', () => {
        expect(measurementData).toBeInstanceOf(MeasurementData);
    });

    test('should read data from text with header row', () => {
        // data_header.tsvの一部を使用したテストデータ
        const testData = `日時\tミリ秒\t計測位置1\t計測位置2\t計測位置3
2014/10/11 17:22:41\t000000\t2.594074965\t4.952324867\t77.82225037
2014/10/11 17:22:41\t010000\t-1.414950013\t8.961350441\t74.99234772
2014/10/11 17:22:41\t020000\t-4.952324867\t14.38532543\t73.34157562`;

        measurementData.read(testData);
        
        // 3つの計測位置が作成されること
        expect(measurementData.spots.length).toBe(3);
        
        // 計測位置のラベルが正しいこと
        expect(measurementData.spots[0].label).toBe('計測位置1');
        expect(measurementData.spots[1].label).toBe('計測位置2');
        expect(measurementData.spots[2].label).toBe('計測位置3');
        
        // 各計測位置に3つのデータポイントが読み込まれること
        expect(measurementData.spots[0].list.size).toBe(3);
        expect(measurementData.spots[1].list.size).toBe(3);
        expect(measurementData.spots[2].list.size).toBe(3);
        
        // 最初の計測位置の値が正しいこと
        const spot1Values = measurementData.spots[0].list.toArray().map(v => v.value);
        expect(spot1Values).toEqual([2.594074965, -1.414950013, -4.952324867]);
    });

    test('should read data without header row', () => {
        const optionWithoutHeader: DataOption = {
            ...defaultOption,
            existsHeaderRow: false
        };
        const measurementDataNoHeader = new MeasurementData(optionWithoutHeader);
        
        // ヘッダーなしのテストデータ
        const testData = `2014/10/11 17:22:41\t000000\t2.594074965\t4.952324867\t77.82225037
2014/10/11 17:22:41\t010000\t-1.414950013\t8.961350441\t74.99234772`;

        measurementDataNoHeader.read(testData);
        
        // 3つの計測位置が作成されること
        expect(measurementDataNoHeader.spots.length).toBe(3);
        
        // 計測位置のラベルがデフォルト値であること
        expect(measurementDataNoHeader.spots[0].label).toBe('Spot 1');
        expect(measurementDataNoHeader.spots[1].label).toBe('Spot 2');
        expect(measurementDataNoHeader.spots[2].label).toBe('Spot 3');
        
        // 各計測位置に2つのデータポイントが読み込まれること
        expect(measurementDataNoHeader.spots[0].list.size).toBe(2);
    });

    test('should process data with different delimiters', () => {
        const commaOption: DataOption = {
            ...defaultOption,
            delimiter: ','
        };
        const measurementDataComma = new MeasurementData(commaOption);
        
        // カンマ区切りのテストデータ
        const testData = `日時,ミリ秒,計測位置1,計測位置2
2014/10/11 17:22:41,000000,2.594074965,4.952324867
2014/10/11 17:22:41,010000,-1.414950013,8.961350441`;

        measurementDataComma.read(testData);
        
        // 2つの計測位置が作成されること
        expect(measurementDataComma.spots.length).toBe(2);
        
        // 各計測位置に2つのデータポイントが読み込まれること
        expect(measurementDataComma.spots[0].list.size).toBe(2);
        expect(measurementDataComma.spots[1].list.size).toBe(2);
    });

    test('should skip duplicate values based on threshold', () => {
        const thresholdOption: DataOption = {
            ...defaultOption,
            measurementValueThreshold: 1.0 // 大きな閾値を設定
        };
        const measurementDataThreshold = new MeasurementData(thresholdOption);
          // 近い値を含むテストデータ
        const testData = `日時\tミリ秒\t計測位置1
2014/10/11 17:22:41\t000000\t10.0
2014/10/11 17:22:41\t010000\t10.5
2014/10/11 17:22:41\t020000\t11.0
2014/10/11 17:22:41\t030000\t15.0`;

        measurementDataThreshold.read(testData);
        
        // 閾値内の値は重複とみなされ除外されること
        expect(measurementDataThreshold.spots[0].list.size).toBe(3); // 10.0、11.0、15.0が残る
    });

    test('should extract peaks and valleys asynchronously', async () => {
        // テストデータ
        const testData = `日時\tミリ秒\t計測位置1
2014/10/11 17:22:41\t000000\t0
2014/10/11 17:22:41\t010000\t5
2014/10/11 17:22:41\t020000\t10
2014/10/11 17:22:41\t030000\t5
2014/10/11 17:22:41\t040000\t0
2014/10/11 17:22:41\t050000\t-5`;

        measurementData.read(testData);
        
        // スパイを設定してextractPeaksAndValleysAsyncメソッドを監視
        const extractSpy = vi.spyOn(measurementData.spots[0], 'extractPeaksAndValleysAsync');
        
        await measurementData.extractPeaksAndValleysAsync();
        
        // メソッドが呼び出されたことを確認
        expect(extractSpy).toHaveBeenCalled();
    });

    test('should calculate rain drops asynchronously', async () => {
        // テストデータ
        const testData = `日時\tミリ秒\t計測位置1
2014/10/11 17:22:41\t000000\t0
2014/10/11 17:22:41\t010000\t5
2014/10/11 17:22:41\t020000\t10
2014/10/11 17:22:41\t030000\t5
2014/10/11 17:22:41\t040000\t0
2014/10/11 17:22:41\t050000\t-5`;

        measurementData.read(testData);
        
        // スパイを設定してcalculateRainDropsAsyncメソッドを監視
        const calcSpy = vi.spyOn(measurementData.spots[0], 'calculateRainDropsAsync');
        
        await measurementData.calcRainDropAsync();
        
        // メソッドが呼び出されたことを確認
        expect(calcSpy).toHaveBeenCalled();
    });
});
