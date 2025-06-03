import { List, Item } from 'linked-list';
import type { MeasurementValue } from './measurement_value';

/**
 * 計測値の双方向リスト
 */
export class MeasurementList extends List {
    join = (delimiter: string) => {
        return this.toArray().map(item => (item as MeasurementValue).value).join(delimiter);
    };

    /**
     * リストからアイテムを削除します
     * @param item 削除するアイテム
     */
    remove = (item: Item) => {
        if (item.prev) item.prev.next = item.next;
        if (item.next) item.next.prev = item.prev;
        if (this.head === item) this.head = item.next;
        if (this.tail === item) this.tail = item.prev;
        item.prev = item.next = null;
        this.size--;
    };

    clone = () => {
        const list = new MeasurementList();
        super.toArray().map((item) => list.append((item as MeasurementValue).clone()));
        return list;
    };

    toArray = (): MeasurementValue[] => {
        const array = super.toArray().map((item) => (item as MeasurementValue).clone());
        return array;
    };
}
