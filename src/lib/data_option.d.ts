export type DataOption = {
    /** データの区切り文字 */
    delimiter: ',' | '\t';
    /** ヘッダー行が存在するか */
    existsHeaderRow: boolean;
    /** 日時列が存在するか */
    existsDatetimeColumn: boolean;
    /** ミリ秒列が存在するか */
    existsMillisecondColumn: boolean;
}
