import { MeasurementList } from "./measurement_list";
import type { MeasurementSpotStatus } from "./measurement_spot_status";
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
  /** 統計情報 */
  private _status: MeasurementSpotStatus = {
    measurementValueMax: 0,
    measurementValueMin: 0,
    measurementValueCount: 0,

    peacksAndValleysCount: 0,

    rainDropAmplitudeMax: 0,
    rainDropAmplitudeMin: 0,
    rainDropAmplitudeCount: 0,
    rainDropAmplitudeCycleCount: 0,
  };

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

  /** レインドロップデータを取得 */
  public get rainDrops(): RainDrop[] {
    return this._rainDrops;
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
   */
  public extractPeaksAndValleysAsync = async (): Promise<void> => {
    const extracted = await extractPeaksAndValleysAsync(this._measurementValues);
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

  /**
   * 計測位置の統計情報を計算
   */
  public calculateStatus = () => {
    const max = (a: number, b: number) => { return Math.max(a, b); };
    const min = (a: number, b: number) => { return Math.min(a, b); };

    const measurementValues = this._measurementValues.toArray().map(value => value.value);
    this._status.measurementValueMax = measurementValues.reduce(max);
    this._status.measurementValueMin = measurementValues.reduce(min);
    this._status.measurementValueCount = measurementValues.length;

    this._status.peacksAndValleysCount = this._extractedPeaksAndValleys.size;

    const rainDropAmplitudes = this._rainDrops.map(drop => drop);
    this._status.rainDropAmplitudeMax = rainDropAmplitudes.map(drop => drop.range).reduce(max);
    this._status.rainDropAmplitudeMin = rainDropAmplitudes.map(drop => drop.range).reduce(min);
    this._status.rainDropAmplitudeCount = rainDropAmplitudes.length
    this._status.rainDropAmplitudeCycleCount = rainDropAmplitudes.map(drop => drop.cycleType).reduce((sum, type) => sum + type, 0);
  }
}
