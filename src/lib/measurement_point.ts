import {
  LinkedList,
  LinkedListNode
} from '@datastructures-js/linked-list';

export class MeasurementPoint {
  // 計測位置ラベル
  private _label: string = '';
  // 計測値
  private _data: LinkedList<number> = new LinkedList<number>();

  constructor(label: string) {
    this._label = label;
  }

  public insertData(data: number): void {
    this._data.insertLast(data);
  }
}
