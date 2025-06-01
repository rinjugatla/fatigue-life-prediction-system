import { writable } from 'svelte/store';
import { MeasurementData } from '$lib/measurement_data';

// サイドバーの開閉状態
export const isSidebarOpen = writable(true);

// 計測データと関連状態
export const measurementData = writable<MeasurementData | null>(null);
export const selectedSpotIndex = writable(0);
export const histogramBinWidth = writable(10);

// 入力フォームの状態
export const files = writable<FileList | null>(null);
export const delimiter = writable<',' | '\t'>(',');
export const encode = writable('utf-8');
export const measurementValueThreshold = writable('0.001');
export const existsHeaderRow = writable(false);
export const existsDatetimeColumn = writable(false);
export const existsMillisecondColumn = writable(false);

// 処理状態
export const analyzing = writable(false);
export const errorMessage = writable('');
