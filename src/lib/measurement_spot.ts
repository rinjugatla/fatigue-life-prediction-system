import { MeasurementList } from "./measurement_list";
import { MeasurementValue } from "./measurement_value";
import { extractPeaksAndValleysAsync } from "./peak_extractor";
import type { RainDrop } from "./rain_drop";
import { CycleType } from "./rain_drop";

/**
 * 計測位置と計測値の管理
 */
export class MeasurementSpot {
  /** 計測位置ラベル */
  private _label: string = '';
  /** 計測値 */
  private _measurementValues: MeasurementList = new MeasurementList();
  /** 極致のみ抽出した計測値 */
  private _extractedPeaksAndValleys: MeasurementList = new MeasurementList();
  /** レインフロー法による計算結果（振幅の範囲とサイクル数） */
  private _rainDrops: RainDrop[] = [];
  /** レインフロー法で計算された最大振幅範囲 */
  private _maxRange: number = 0;

  constructor(label: string) {
    this._label = label;
  }

  /** 計測位置ラベルを取得 */
  public get label(): string {
    return this._label;
  }

  /** 計測値リストを取得 */
  public get list(): MeasurementList {
    return this._measurementValues;
  }

  /**
   * 計測値を最後に追加
   * @param value 計測値
   */
  public insertData(value: number): void {
    this._measurementValues.append(new MeasurementValue(value));
  }

  /**
   * 計測値から極致を抽出(非同期)
   * 
   * @param threshold 同値とみなす閾値。この値以下の変化は無視されます。デフォルトは0.001
   */
  public async extractPeaksAndValleysAsync(threshold: number = 0.001): Promise<void> {
    const extracted = await extractPeaksAndValleysAsync(this._measurementValues, threshold);
    if (!extracted) { return; }

    this._extractedPeaksAndValleys = extracted;
  }


  /**
   * レインフロー法によるひずみ振幅の計算
   * 
   * アルゴリズムはASTM E1049-85に準拠
   * @returns レインフローの計算結果配列
   */
  public calcDropRain(): void {
    // リストが空または1点しかない場合は早期リターン
    if (this._measurementValues.size <= 1) { return; }

    const rainDrops: RainDrop[] = [];
    const workingList = this.createWorkingList();

    try {
      this.processThreePointComparison(workingList, rainDrops);
      this.processRemainingPoints(workingList, rainDrops);
    } catch (error) {
      console.error("レインフロー計算エラー:", error);
    }

    this._rainDrops = rainDrops;
  }

  /**
   * 作業用のリストを作成する
   * @returns 作業用リスト
   */
  private createWorkingList(): MeasurementList {
    const workingList = new MeasurementList();
    const values = this._measurementValues.toArray().map(item => item as MeasurementValue);

    for (const value of values) {
      workingList.append(new MeasurementValue(value.value));
    }

    return workingList;
  }

  /**
   * 3点比較によるレインフロー処理
   * @param workingList 作業用リスト
   * @param rainDrops 結果格納配列
   * @param stats 統計情報
   */
  private processThreePointComparison(
    workingList: MeasurementList,
    rainDrops: RainDrop[]
  ): void {
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
          this.processFirstCycle(workingList, rainDrops, node, currentAmplitude);
        } else {
          // 1サイクル処理
          this.processFullCycle(workingList, rainDrops, node, currentAmplitude);
        }
        // 先頭からやり直し
        node = workingList.head as MeasurementValue | null;
      } else {
        // 次の点に移動
        node = node.next as MeasurementValue | null;
      }
    }
  }

  /**
   * 最初の点の振幅を記録
   * 
   * 0.5サイクルとして処理
   */
  private processFirstCycle(
    workingList: MeasurementList,
    rainDrops: RainDrop[],
    node: MeasurementValue,
    range: number
  ): void {
    // レンジを0.5サイクルとして挿入
    rainDrops.push({
      range: range,
      cycleType: CycleType.HALF
    });

    // 最初の点を削除
    workingList.remove(node);

    this.updateMaxRange(range);
  }

  /**
   * 最初以外の点の振幅を記録
   * 
   * 1サイクルとして処理
   */
  private processFullCycle(
    workingList: MeasurementList,
    rainDrops: RainDrop[],
    node: MeasurementValue,
    range: number
  ): void {
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

    this.updateMaxRange(range);
  }

  /**
   * 残りの点の処理
   */
  private processRemainingPoints(
    workingList: MeasurementList,
    rainDrops: RainDrop[]
  ): void {
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

      this.updateMaxRange(range);
    }
  }

  /**
   * 最大レンジの更新
   * 
   * 統計用
   * @param range レインフロー法で有効とされた振幅の範囲
   */
  private updateMaxRange(range: number): void {
    if (this._maxRange < range) {
      this._maxRange = range;
    }
  }
}
