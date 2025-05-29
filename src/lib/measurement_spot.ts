import { MeasurementList } from "./measurement_list";
import { MeasurementValue } from "./measurement_value";

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
}
