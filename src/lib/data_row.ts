import type { DataOption } from "./data_option";

class DataRow {
    // 計測日時
    private _Datetime: Date | null = null;
    // 計測ミリ秒
    private _Milliseconds: number = 0;
    // 計測値
    private _MeasuredValues: number[] = [];

    constructor(option: DataOption, text: string) {
        const values = text.split(option.delimiter);

        let valueStartIndex = 0;
        if (option.existsDatetimeColumn){
            this._Datetime = new Date(values[0]);
            valueStartIndex++;
        }
        if (option.existsMillisecondColumn) {
            this._Milliseconds = parseInt(values[1], 10);
            valueStartIndex++;
        }
        this._MeasuredValues = values.slice(valueStartIndex).map((v) => parseFloat(v));
    }
}
