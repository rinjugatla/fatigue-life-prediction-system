import type { DataOption } from './data_option';
import { MeasurementData } from './measurement_data';

/**
 * レインフローアルゴリズムのサンプル使用方法
 */
export function rainflowSampleUsage(rawData: string): void {
    // データオプションの設定
    const options: DataOption = {
        delimiter: ',', // CSVファイルの区切り文字
        existsHeaderRow: true, // ヘッダー行が存在する
        existsDatetimeColumn: true, // 日時列が存在する
        existsMillisecondColumn: false // ミリ秒列は存在しない
    };

    // 計測データの読み込み
    const measurementData = new MeasurementData(options);
    measurementData.read(rawData);

    // 極値（ピークと谷）の抽出
    measurementData.extractPeaksAndValleysAsync();

    // レインフロー法による計算
    measurementData.calcRainDropAsync();

    console.log('レインフロー計算が完了しました');
}

/**
 * サンプルデータを生成
 */
export function generateSampleData(): string {
    // ヘッダー行
    let data = '時間,計測点1,計測点2\n';

    // サイン波＋ノイズデータを生成
    for (let i = 0; i < 100; i++) {
        const time = new Date(2025, 0, 1, 0, 0, i).toISOString();
        const value1 = Math.sin(i * 0.1) * 100 + (Math.random() * 10 - 5);
        const value2 = Math.cos(i * 0.1) * 80 + (Math.random() * 8 - 4);
        data += `${time},${value1.toFixed(2)},${value2.toFixed(2)}\n`;
    }

    return data;
}
