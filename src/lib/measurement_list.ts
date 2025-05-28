import { List } from "linked-list";

/**
 * 計測値の双方向リスト
 */
export class MeasurementList extends List {
    join(delimiter: string) {
        return this.toArray().join(delimiter);
    }
}
