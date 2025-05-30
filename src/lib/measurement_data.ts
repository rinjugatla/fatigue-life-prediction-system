import type { DataOption } from "./data_option";
import { MeasurementSpot } from "./measurement_spot";

/**
 * 計測データ(csv, tsv)を読み込むクラス
 */
export class MeasurementData {
    private _option: DataOption;
    private _spots: MeasurementSpot[] = [];
    private _columnCount: number = 0;
    private _dataStartColumnIndex: number = 0;

    constructor(option: DataOption) {
        this._option = option;
    }

    /**
     * 計測データ読み込み
     * @param text 計測データテキスト
     */
    public read(text: string): void {
        const lines = text.split(/\r\n|\n|\r/).map(line => line.trim()).filter(line => line.length > 0);

        this._dataStartColumnIndex = this._option.existsDatetimeColumn ? this._option.existsMillisecondColumn ? 2 : 1 : 0;
        this._columnCount = lines[0].split(this._option.delimiter).length;

        this.initPoints(lines[0].split(this._option.delimiter));
        this.readDataRows(lines)
    }

    /**
     * 計測スポットの配列を初期化
     * @param firstRowData 最初の行のデータ
     */
    private initPoints(firstRowData: string[]): void {
        for (let i = this._dataStartColumnIndex; i < this._columnCount; i++) {
            const label = this._option.existsHeaderRow ? firstRowData[i] : `Point ${i - this._dataStartColumnIndex + 1}`;
            this._spots.push(new MeasurementSpot(label));
        }

        if (!this._option.existsHeaderRow) {
            // ヘッダが存在しない場合は1行目から計測データを読み込む
            for (let i = this._dataStartColumnIndex; i < this._columnCount; i++) {
                const value = parseFloat(firstRowData[i]);
                this._spots[i - this._dataStartColumnIndex].insertData(value);
            }
        }
    }

    /**
     * 計測スポットのデータ読み込み
     * @param lines 計測データの行
     */
    private readDataRows(lines: string[]): void {
        for (let rowIndex = 1; rowIndex < lines.length; rowIndex++) {
            const rowData = lines[rowIndex].split(this._option.delimiter);
            const isSameCplumnCount = rowData.length === this._columnCount;
            if (!isSameCplumnCount) {
                continue;
            }

            // 各計測ポイントにデータを挿入
            for (let columnIndex = this._dataStartColumnIndex; columnIndex < this._columnCount; columnIndex++) {
                const value = parseFloat(rowData[columnIndex]);
                this._spots[columnIndex - this._dataStartColumnIndex].insertData(value);
            }
        }

        if (this._option.existsHeaderRow) {
        }
    }

    /**
     * 計測値から極値（ピークと谷）を抽出
     * @param threshold 同値とみなす閾値。この値以下の変化は無視されます。デフォルトは0.001
     * @returns 計測スポットの配列数
     */
    public extractPeaksAndValleys(threshold: number = 0.001): void {
        for (const spot of this._spots) {
            spot.extractPeaksAndValleys(threshold)
        }
    }

    /**
     * レインフロー法によるひずみ振幅の計算
     * 
     * アルゴリズムはASTM E1049-85に準拠
     */
    public calcRainDrop(): void {
        for (const spot of this._spots) {
            spot.calcDropRain();
        }
    }
}
