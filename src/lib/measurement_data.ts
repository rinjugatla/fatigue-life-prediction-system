import type { DataOption } from "./data_option";
import { MeasurementSpot } from "./measurement_spot";

/**
 * 計測データ(csv, tsv)を読み込むクラス
 */
export class MeasurementData {
    private _option: DataOption;
    private _spots: MeasurementSpot[] = [];
    private _spotColumnCount: number = 0;
    private _spotStartColumnIndex: number = 0;

    constructor(option: DataOption) {
        this._option = option;
    }

    /**
     * 計測データ読み込み
     * @param text 計測データテキスト
     */
    public read = (text: string) => {
        const lines = text.split(/\r\n|\n|\r/).map(line => line.trim()).filter(line => line.length > 0);

        this._spotStartColumnIndex = this._option.existsDatetimeColumn ? this._option.existsMillisecondColumn ? 2 : 1 : 0;
        this._spotColumnCount = lines[0].split(this._option.delimiter).length - this._spotStartColumnIndex;

        this.initPoints(lines[0].split(this._option.delimiter));
        this.readDataRows(lines)
    }

    /**
     * 計測スポットの配列を初期化
     * @param firstRowData 最初の行のデータ
     */
    private initPoints = (firstRowData: string[]) => {
        const row = firstRowData.slice(this._spotStartColumnIndex, this._spotStartColumnIndex + this._spotColumnCount);
        for (let i = 0; i < this._spotColumnCount; i++) {
            const label = this._option.existsHeaderRow ? row[i] : `Point ${i + 1}`;
            this._spots.push(new MeasurementSpot(label));
        }

        if (!this._option.existsHeaderRow) {
            // ヘッダが存在しない場合は1行目から計測データを読み込む
            for (let i = 0; i < this._spotColumnCount; i++) {
                const value = parseFloat(row[i]);
                this._spots[i].insertData(value);
            }
        }
    }

    /**
     * 計測スポットのデータ読み込み
     * @param lines 計測データの行
     */
    private readDataRows = (lines: string[]) => {
        for (let rowIndex = 1; rowIndex < lines.length; rowIndex++) {
            const row = lines[rowIndex].split(this._option.delimiter).slice(this._spotStartColumnIndex, this._spotStartColumnIndex + this._spotColumnCount);
            const isSameCplumnCount = row.length === this._spotColumnCount;
            if (!isSameCplumnCount) {
                continue;
            }

            // 各計測ポイントにデータを挿入
            for (let columnIndex = 0; columnIndex < this._spotColumnCount; columnIndex++) {
                const value = parseFloat(row[columnIndex]);
                this._spots[columnIndex].insertData(value);
            }
        }

        if (this._option.existsHeaderRow) {
        }
    }

    /**
     * 計測値から極値（ピークと谷）を抽出
     * @param threshold 同値とみなす閾値。この値以下の変化は無視されます。デフォルトは0.001
     * @returns Promise<MeasurementSpot[]> 抽出された極値を持つ計測スポットの配列
     */
    public extractPeaksAndValleysAsync = async (threshold: number = 0.001) => {
        const promises = this._spots.map(spot => {
            return new Promise<void>((resolve) => {
                spot.extractPeaksAndValleysAsync(threshold);
                resolve();
            });
        });

        await Promise.all(promises);
    }

    /**
     * レインフロー法によるひずみ振幅の計算
     * 
     * アルゴリズムはASTM E1049-85に準拠
     * 並列計算によりパフォーマンスを向上
     */
    public calcRainDropAsync = async () => {
        const promises = this._spots.map(spot => {
            return new Promise<void>((resolve) => {
                spot.calculateRainDropsAsync();
                resolve();
            });
        });

        await Promise.all(promises);
    }
}
