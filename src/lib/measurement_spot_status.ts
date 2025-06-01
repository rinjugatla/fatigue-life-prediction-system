/** 計測位置の統計情報 */
export type MeasurementSpotStatus = {
    /** 計測値の最大値 */
    measurementValueMax: number;
    /** 計測値の最小値 */
    measurementValueMin: number;
    /** 計測値の個数 */
    measurementValueCount: number;

    /** 極致の個数 */
    peacksAndValleysCount: number;

    /** レインフロー法による振幅の最大値 */
    rainDropAmplitudeMax: number;
    /** レインフロー法による振幅の最小値 */
    rainDropAmplitudeMin: number;
    /** レインフロー法による振幅の個数 */
    rainDropAmplitudeCount: number;
    /** レインフロー法による振幅のサイクル数 */
    rainDropAmplitudeCycleCount: number;
};
