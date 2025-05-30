/**
 * レインフロー法の計算結果を表すインターフェース
 * ASTM E1049-85準拠
 */
export interface RainDrop {
    /** 振幅範囲 */
    range: number;
    /** サイクル数 (true = 1サイクル, false = 0.5サイクル) */
    cycle: boolean;
}
