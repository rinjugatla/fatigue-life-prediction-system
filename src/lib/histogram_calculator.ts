import type { RainDrop } from './rain_drop';

/**
 * ヒストグラムの区間（ビン）を表すインターフェース
 */
export interface HistogramBin {
    /** 区間の最小値 */
    min: number;
    /** 区間の最大値 */
    max: number;
    /** 区間に含まれる要素数 */
    count: number;
    /** 区間の中央値（表示用） */
    center: number;
}

/**
 * レインドロップデータからヒストグラムを計算するクラス
 */
export class HistogramCalculator {
    /**
     * レインドロップデータから指定された幅のヒストグラムを計算する
     *
     * @param rainDrops レインドロップデータ配列
     * @param binWidth ヒストグラムの区間幅
     * @returns ヒストグラムデータ
     */
    public static calculate(rainDrops: RainDrop[], binWidth: number): HistogramBin[] {
        if (!rainDrops || rainDrops.length === 0 || binWidth <= 0) {
            return [];
        }

        // 最大値の計算
        const ranges = rainDrops.map((drop) => drop.range);
        const max = Math.max(...ranges);

        // 最小値は常に0から開始
        const min = 0;

        // 区間数を計算
        const binCount = Math.ceil(max / binWidth);

        // 区間の初期化
        const bins: HistogramBin[] = Array(binCount)
            .fill(0)
            .map((_, index) => {
                const binMin = min + index * binWidth;
                const binMax = binMin + binWidth;
                return {
                    min: binMin,
                    max: binMax,
                    count: 0,
                    center: binMin + binWidth / 2
                };
            });

        // 各レインドロップを適切な区間にカウント
        rainDrops.forEach((drop) => {
            const binIndex = Math.floor(drop.range / binWidth);
            if (binIndex >= 0 && binIndex < bins.length) {
                // サイクル種別を考慮したカウント
                bins[binIndex].count += drop.cycleType;
            }
        });

        return bins;
    }
}
