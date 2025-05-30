/**
 * レインフロー法のサイクル種別を表す列挙型
 */
export enum CycleType {
    /** 1サイクル (完全なサイクル) */
    FULL = 1,
    /** 0.5サイクル (半分のサイクル) */
    HALF = 0.5
}

/**
 * レインフロー法の計算結果を表すインターフェース
 * ASTM E1049-85準拠
 */
export interface RainDrop {
    /** 振幅範囲 */
    range: number;
    /** サイクル種別 */
    cycleType: CycleType;
}
