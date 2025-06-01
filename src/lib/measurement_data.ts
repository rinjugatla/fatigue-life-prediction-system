import type { DataOption } from './data_option';
import { MeasurementSpot } from './measurement_spot';
import type { MeasurementValue } from './measurement_value';

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
        const lines = text
            .split(/\r\n|\n|\r/)
            .map((line) => line.trim())
            .filter((line) => line.length > 0);

        this._spotStartColumnIndex = this._option.existsDatetimeColumn
            ? this._option.existsMillisecondColumn
                ? 2
                : 1
            : 0;
        this._spotColumnCount =
            lines[0].split(this._option.delimiter).length - this._spotStartColumnIndex;

        this.prepareSpots(lines[0]);
        this.readDataRows(lines);
    };

    /**
     * 計測位置の配列を準備
     *
     * ヘッダーがある場合はここで計測位置名も設定
     */
    private prepareSpots = (firstLine: string) => {
        const row = firstLine
            .split(this._option.delimiter)
            .slice(this._spotStartColumnIndex, this._spotStartColumnIndex + this._spotColumnCount);
        for (let i = 0; i < this._spotColumnCount; i++) {
            const label = this._option.existsHeaderRow ? row[i] : `Spot ${i + 1}`;
            this._spots.push(new MeasurementSpot(label));
        }
    };

    /**
     * 計測スポットのデータ読み込み
     * @param lines 計測データの行
     */
    private readDataRows = (lines: string[]) => {
        const dataLineStartIndex = this._option.existsHeaderRow ? 1 : 0;
        for (let rowIndex = dataLineStartIndex; rowIndex < lines.length; rowIndex++) {
            const row = lines[rowIndex]
                .split(this._option.delimiter)
                .slice(
                    this._spotStartColumnIndex,
                    this._spotStartColumnIndex + this._spotColumnCount
                );
            const isSameCplumnCount = row.length === this._spotColumnCount;
            if (!isSameCplumnCount) {
                continue;
            }

            // 各計測ポイントにデータを挿入
            for (let columnIndex = 0; columnIndex < this._spotColumnCount; columnIndex++) {
                const value = parseFloat(row[columnIndex]);

                // 同値の除外
                const lastValue = this._spots[columnIndex].list.tail as MeasurementValue | null;
                const isSamePrevValue =
                    lastValue &&
                    Math.abs(lastValue.value - value) <= this._option.measurementValueThreshold;
                if (isSamePrevValue) {
                    continue;
                }

                this._spots[columnIndex].insertData(value);
            }
        }
    };

    /**
     * 計測値から極値（ピークと谷）を抽出
     * @returns Promise<MeasurementSpot[]> 抽出された極値を持つ計測スポットの配列
     */
    public extractPeaksAndValleysAsync = async () => {
        const promises = this._spots.map((spot) => {
            return new Promise<void>((resolve) => {
                spot.extractPeaksAndValleysAsync();
                resolve();
            });
        });

        await Promise.all(promises);
    };

    /**
     * レインフロー法によるひずみ振幅の計算
     *
     * アルゴリズムはASTM E1049-85に準拠
     * 並列計算によりパフォーマンスを向上
     */
    public calcRainDropAsync = async () => {
        const promises = this._spots.map((spot) => {
            return new Promise<void>((resolve) => {
                spot.calculateRainDropsAsync();
                resolve();
            });
        });

        await Promise.all(promises);
    };

    /**
     * 計測位置の統計情報を計算
     */
    public calcStatusAsync = async () => {
        const promises = this._spots.map((spot) => {
            return new Promise<void>((resolve) => {
                spot.calculateStatus();
                resolve();
            });
        });

        await Promise.all(promises);
    };

    /**
     * 計測スポットの配列を取得
     */
    public get spots(): MeasurementSpot[] {
        return this._spots;
    }
}
