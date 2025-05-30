import { MeasurementList } from "./measurement_list";
import { MeasurementValue } from "./measurement_value";
import type { RainDrop } from "./rain_drop";

/**
 * 計測位置と計測値の管理
 */
export class MeasurementSpot {
  // 計測位置ラベル
  private _label: string = '';
  // 計測値
  private _list: MeasurementList = new MeasurementList();

  constructor(label: string) {
    this._label = label;
  }

  public insertData(data: number): void {
    this._list.append(new MeasurementValue(data));
  }

  /**
   * 波形の最大値と最小値のみを残し、その他のポイントを排除
   * 波形の上昇/下降が変化する点（極値）を検出し、それ以外の点を排除します
   * 
   * @param threshold 同値とみなす閾値。この値以下の変化は無視されます。デフォルトは0.001
   * @returns 処理後の波形ポイント数
   */
  public extractPeaksAndValleys(threshold: number = 0.001): number {
    // 空のリストや少ないポイント数の場合は早期リターン
    if (this._list.size === 0) return 0;
    const values = this._list.toArray().map(item => item as MeasurementValue);
    if (values.length <= 2) return values.length;

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

    // 元のリストを再構築
    this._list = new MeasurementList();
    extremePoints.forEach(point => this._list.append(point));

    return this._list.size;
  }

  /**
   * レインフロー法によるひずみ振幅の計算
   * 
   * アルゴリズムはASTM E1049-85に準拠
   * @returns レインフローの計算結果配列
   */
  public calcDropRain(): RainDrop[] {
    // 結果を格納する配列
    const rainDrops: RainDrop[] = [];

    // リストが空または1点しかない場合は早期リターン
    if (this._list.size <= 1) {
      return rainDrops;
    }

    // 作業用変数
    let X: number; // 次の振幅
    let Y: number; // 現在の振幅

    // 最大レンジを保存するための変数
    let maxRange = 0;
    let isMaxRangeCycle = true;

    // リストのクローンを作成して作業する（元のデータを保持するため）
    const workingList = new MeasurementList();
    const values = this._list.toArray().map(item => item as MeasurementValue);

    for (const value of values) {
      workingList.append(new MeasurementValue(value.value));
    }

    // 3点比較でレインフロー処理を行う
    try {
      // 最初から順に処理
      let node = workingList.head as MeasurementValue | null;

      // 少なくとも3点あることを確認
      while (node && node.next && node.next.next) {
        const currentNode = node as MeasurementValue;
        const nextNode = node.next as MeasurementValue;
        const nextNextNode = node.next.next as MeasurementValue;

        // 振幅の計算
        Y = Math.abs(currentNode.value - nextNode.value);
        X = Math.abs(nextNode.value - nextNextNode.value);

        // 小ループを形成する点のみ処理 (X >= Y && Y > 0)
        if (X >= Y && Y > 0) {
          // ノードが最初の点の場合
          if (!node.prev) {
            // レンジYを0.5サイクルとして挿入
            rainDrops.push({
              range: Y,
              cycle: false
            });

            // 最初の点を削除
            workingList.remove(node);

            // 最大レンジの更新
            if (maxRange < Y) {
              maxRange = Y;
              isMaxRangeCycle = false;
            }

            // 先頭からやり直し
            node = workingList.head as MeasurementValue | null;
          } else {
            // レンジYを1サイクルとして挿入
            rainDrops.push({
              range: Y,
              cycle: true
            });

            // 最大レンジの更新
            if (maxRange < Y) {
              maxRange = Y;
              isMaxRangeCycle = true;
            }

            // Yレンジの点を削除（次の点と現在の点）
            workingList.remove(node.next);
            workingList.remove(node);

            // 先頭からやり直し
            node = workingList.head as MeasurementValue | null;
          }
        } else {
          // 次の点に移動
          node = node.next as MeasurementValue | null;
        }
      }

      // 小ループ除去後の残りの点に対して0.5サイクルでレンジを計数
      node = workingList.head as MeasurementValue | null;
      while (node && node.next) {
        const currentNode = node as MeasurementValue;
        const nextNode = node.next as MeasurementValue;
        const range = Math.abs(currentNode.value - nextNode.value);

        rainDrops.push({
          range: range,
          cycle: false
        });

        // 最大レンジの更新
        if (maxRange < range) {
          maxRange = range;
          isMaxRangeCycle = false;
        }

        node = node.next as MeasurementValue | null;
      }
    } catch (error) {
      console.error("レインフロー計算エラー:", error);
    }

    return rainDrops;
  }

  /**
   * 計測位置ラベルを取得
   */
  public get label(): string {
    return this._label;
  }

  /**
   * 計測値リストを取得
   */
  public get list(): MeasurementList {
    return this._list;
  }
}
