import { MeasurementList } from "./measurement_list";
import type { MeasurementValue } from "./measurement_value";

/**
   * 波形の最大値と最小値のみを残し、その他のポイントを排除
   * 波形の上昇/下降が変化する点（極値）を検出し、それ以外の点を排除します
   * 
   * @param measurementValues 処理対象の計測値リスト
   * @param threshold 同値とみなす閾値。この値以下の変化は無視されます。デフォルトは0.001
   * @returns 処理後の波形ポイント数
   */
export const extractPeaksAndValleysAsync = async (measurementValues: MeasurementList, threshold: number = 0.001) => {
    // 空のリストや少ないポイント数の場合は早期リターン
    if (measurementValues.size === 0) { return null; }

    const values = measurementValues.toArray();
    if (values.length <= 2) { return null; }

    // 結果を格納する配列
    const extremePoints: MeasurementValue[] = [];

    // 波形の方向を示す型
    type Direction = 'up' | 'down' | 'none';

    // 初期値の設定
    extremePoints.push(values[0]);
    let prevDirection: Direction = 'none';
    let lastExtreme = values[0].value;

    // 各ポイントを調査
    for (let i = 1; i < values.length; i++) {
        const current = values[i].value;
        const previous = values[i - 1].value;
        const diff = current - previous;

        // 現在の方向を判定（閾値以下の変化は方向変化なしとみなす）
        const currentDirection: Direction =
            Math.abs(diff) <= threshold ? 'none' :
                diff > 0 ? 'up' : 'down';

        // 極値（ピークまたは谷）の検出
        const isPeak = prevDirection === 'up' && currentDirection === 'down';
        const isValley = prevDirection === 'down' && currentDirection === 'up';

        if (isPeak || isValley) {
            const extremeCandidate = values[i - 1];
            // 前回追加した極値との差が閾値より大きい場合のみ追加
            if (Math.abs(extremeCandidate.value - lastExtreme) > threshold) {
                extremePoints.push(extremeCandidate);
                lastExtreme = extremeCandidate.value;
            }
        }

        // 方向の更新（有意な変化がある場合のみ）
        if (currentDirection !== 'none') {
            prevDirection = currentDirection;
        }

        // 最後の点は常に含める（前回の極値と十分に異なる場合）
        if (i === values.length - 1 && Math.abs(current - lastExtreme) > threshold) {
            extremePoints.push(values[i]);
        }
    }

    var extractedPeak = new MeasurementList();
    extremePoints.forEach(point => extractedPeak.append(point));
    return extractedPeak;
}
