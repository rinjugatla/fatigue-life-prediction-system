import { writable, get } from 'svelte/store';
import { MeasurementData } from '$lib/measurement_data';
import type { DataOption } from '$lib/data_option';

// サイドバーの開閉状態
export const isSidebarOpen = writable(true);

// 計測データと関連状態
export const measurementData = writable<MeasurementData | null>(null);
export const selectedSpotIndex = writable(0);
export const histogramBinWidth = writable(10);

// 入力フォームの状態
export const files = writable<FileList | null>(null);
export const delimiter = writable<',' | '\t'>(',');
export const encode = writable('utf-8');
export const measurementValueThreshold = writable('0.001');
export const existsHeaderRow = writable(false);
export const existsDatetimeColumn = writable(false);
export const existsMillisecondColumn = writable(false);

// 処理状態
export const analyzing = writable(false);
export const errorMessage = writable('');

// ファイル読み込み関数
export const loadFile = async () => {
    // ストアの値を取得するためにgetメソッドを使用
    const filesList = get(files);
    if (!filesList || filesList.length === 0) return;

    analyzing.set(true);
    errorMessage.set('');

    const file = filesList[0];
    file.name.endsWith('.tsv') ? delimiter.set('\t') : delimiter.set(',');

    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const fileContent = e.target?.result as string;
            if (!fileContent) {
                throw new Error('ファイルの内容を読み取れませんでした');
            }

            const delimiterValue = get(delimiter);
            const headerRowValue = get(existsHeaderRow);
            const datetimeColumnValue = get(existsDatetimeColumn);
            const millisecondColumnValue = get(existsMillisecondColumn);
            const thresholdValue = get(measurementValueThreshold);

            const option: DataOption = {
                delimiter: delimiterValue,
                existsHeaderRow: headerRowValue,
                existsDatetimeColumn: datetimeColumnValue,
                existsMillisecondColumn: millisecondColumnValue,
                measurementValueThreshold: parseFloat(thresholdValue)
            };

            const data = new MeasurementData(option);
            data.read(fileContent);

            // 並列処理を順番に実行
            await data.extractPeaksAndValleysAsync();
            await data.calcRainDropAsync();
            await data.calcStatusAsync();

            // 解析結果を保存
            measurementData.set(data);
            selectedSpotIndex.set(0); // 最初のスポットを選択
        } catch (error) {
            console.error('解析エラー:', error);
            errorMessage.set('解析中にエラーが発生しました');
        } finally {
            analyzing.set(false);
        }
    };
    reader.onerror = () => {
        errorMessage.set('ファイル読み込み中にエラーが発生しました');
        analyzing.set(false);
    };

    reader.readAsText(file, get(encode));
};

// 解析実行前のエラーチェック
export const validateBeforeAnalyze = (): boolean => {
    const filesValue = get(files);
    const encodeValue = get(encode);

    if (!filesValue || filesValue.length === 0) {
        errorMessage.set('ファイルが選択されていません');
        return false;
    }
    if (!encodeValue) {
        errorMessage.set('エンコードが選択されていません');
        return false;
    }

    errorMessage.set('');
    return true;
};
