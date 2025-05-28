import { Item } from "linked-list";

/**
 * 計測値
 */
export class MeasurementValue extends Item {
    public value: number;

    constructor(value: number) {
        super();
        this.value = value;
    }
}
