import { MeasurementList } from "./measurement_list";
import { MeasurementValue } from "./measurement_value";
import { extractPeaksAndValleysAsync } from "./peak_extractor";
import type { RainDrop } from "./rain_drop";
import { calculateRainDropsAsync } from "./raindrop_calculator";

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
  public insertData = (value: number) => {
    this._measurementValues.append(new MeasurementValue(value));
  }

  /**
   * 計測値から極致を抽出(非同期)
   * 
   * @param threshold 同値とみなす閾値。この値以下の変化は無視されます。デフォルトは0.001
   */
  public extractPeaksAndValleysAsync = async (threshold: number = 0.001): Promise<void> => {
    const extracted = await extractPeaksAndValleysAsync(this._measurementValues, threshold);
    if (!extracted) { return; }

    this._extractedPeaksAndValleys = extracted;
  }

  /**
   * レインフロー法によるひずみ振幅の計算(非同期)
   * 
   * アルゴリズムはASTM E1049-85に準拠
   */
  public calculateRainDropsAsync = async (): Promise<void> => {
    const rainDrops = await calculateRainDropsAsync(this._extractedPeaksAndValleys);
    this._rainDrops = rainDrops;
  }
}
