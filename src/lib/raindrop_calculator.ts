import { MeasurementList } from './measurement_list';
import { MeasurementValue } from './measurement_value';
import { CycleType, type RainDrop } from './rain_drop';

/**
 * レインフロー法によるひずみ振幅の計算
 *
 * アルゴリズムはASTM E1049-85に準拠
 */
export const calculateRainDropsAsync = async (
    extractedPeaksAndValleys: MeasurementList
): Promise<RainDrop[]> => {
    // リストが空または1点しかない場合は早期リターン
    if (extractedPeaksAndValleys.size <= 1) {
        return [];
    }

    const rainDrops: RainDrop[] = [];
    const workingList = extractedPeaksAndValleys.clone();

    try {
        processThreePointComparison(workingList, rainDrops);
        processRemainingPoints(workingList, rainDrops);
    } catch (error) {
        console.error('レインフロー計算エラー:', error);
    }

    return rainDrops;
};

/**
 * 3点比較によるレインフロー処理
 * @param workingList 作業用リスト
 * @param rainDrops 結果格納配列
 * @param stats 統計情報
 */
const processThreePointComparison = (workingList: MeasurementList, rainDrops: RainDrop[]) => {
    let node = workingList.head as MeasurementValue | null;

    // 少なくとも3点あることを確認
    while (node && node.next && node.next.next) {
        const currentNode = node as MeasurementValue;
        const nextNode = node.next as MeasurementValue;
        const nextNextNode = node.next.next as MeasurementValue;

        // 振幅
        const currentAmplitude = Math.abs(currentNode.value - nextNode.value);
        const nextAmplitude = Math.abs(nextNode.value - nextNextNode.value);

        // 小ループを形成する点のみ処理
        const hasSmallLoop = nextAmplitude >= currentAmplitude && currentAmplitude > 0;
        if (hasSmallLoop) {
            const isFirstNode = !node.prev;
            if (isFirstNode) {
                // ノードが最初の点の場合: 0.5サイクル処理
                processFirstCycle(workingList, rainDrops, node, currentAmplitude);
            } else {
                // 1サイクル処理
                processFullCycle(workingList, rainDrops, node, currentAmplitude);
            }
            // 先頭からやり直し
            node = workingList.head as MeasurementValue | null;
        } else {
            // 次の点に移動
            node = node.next as MeasurementValue | null;
        }
    }
};

/**
 * 最初の点の振幅を記録
 *
 * 0.5サイクルとして処理
 */
const processFirstCycle = (
    workingList: MeasurementList,
    rainDrops: RainDrop[],
    node: MeasurementValue,
    range: number
) => {
    // レンジを0.5サイクルとして挿入
    rainDrops.push({
        range: range,
        cycleType: CycleType.HALF
    });

    // 最初の点を削除
    workingList.remove(node);
};

/**
 * 最初以外の点の振幅を記録
 *
 * 1サイクルとして処理
 */
const processFullCycle = (
    workingList: MeasurementList,
    rainDrops: RainDrop[],
    node: MeasurementValue,
    range: number
) => {
    // レンジを1サイクルとして挿入
    rainDrops.push({
        range: range,
        cycleType: CycleType.FULL
    });

    // 現在のレンジの点を削除（次の点と現在の点）
    if (node.next) {
        workingList.remove(node.next);
    }
    workingList.remove(node);
};

/**
 * 残りの点の処理
 */
const processRemainingPoints = (workingList: MeasurementList, rainDrops: RainDrop[]) => {
    let node = workingList.head as MeasurementValue | null;
    while (node && node.next) {
        const currentNode = node as MeasurementValue;
        const nextNode = node.next as MeasurementValue;
        const range = Math.abs(currentNode.value - nextNode.value);

        rainDrops.push({
            range: range,
            cycleType: CycleType.HALF
        });

        node = node.next as MeasurementValue | null;
    }
};
