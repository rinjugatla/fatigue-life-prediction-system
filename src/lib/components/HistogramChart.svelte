<script lang="ts">
    import { onMount, onDestroy, afterUpdate } from 'svelte';
    import { Chart, registerables } from 'chart.js';
    import type { RainDrop } from '$lib/rain_drop';
    import { HistogramCalculator, type HistogramBin } from '$lib/histogram_calculator';

    // Chart.jsの必要な機能を登録
    Chart.register(...registerables);

    // プロパティ
    export let datasets: { rainDrops: RainDrop[]; label: string; color?: string }[] = [];
    export let binWidth: number = 10;
    export let title: string = 'ひずみ頻度分布';

    // 内部変数
    let chartCanvas: HTMLCanvasElement;
    let chart: Chart | undefined;
    let histogramDataSets: { histogramData: HistogramBin[]; label: string; color: string }[] = [];

    // 色のパレット - 暗い背景に映える鮮やかな色
    const colorPalette = [
        'rgba(0, 220, 220, 0.7)',   // ティール
        'rgba(255, 105, 180, 0.7)',  // ホットピンク
        'rgba(64, 224, 208, 0.7)',   // ターコイズ
        'rgba(255, 215, 0, 0.7)',    // ゴールド
        'rgba(138, 43, 226, 0.7)',   // ブルーバイオレット
        'rgba(255, 140, 0, 0.7)',    // ダークオレンジ
        'rgba(173, 255, 47, 0.7)',   // グリーンイエロー
        'rgba(32, 178, 170, 0.7)',   // ライトシーグリーン
        'rgba(220, 20, 60, 0.7)',    // クリムゾン
        'rgba(30, 144, 255, 0.7)'    // ドジャーブルー
    ];

    // ヒストグラムデータの計算
    $: {
        if (datasets && datasets.length > 0 && binWidth > 0) {
            histogramDataSets = datasets.map((dataset, index) => {
                const histogramData = HistogramCalculator.calculate(dataset.rainDrops, binWidth);
                const color = dataset.color || colorPalette[index % colorPalette.length];
                return {
                    histogramData,
                    label: dataset.label,
                    color
                };
            });
            updateChart();
        }
    }

    // 初期化時にチャートを作成
    onMount(() => {
        createChart();
    });

    // コンポーネント破棄時にチャートも破棄
    onDestroy(() => {
        if (chart) {
            chart.destroy();
        }
    });
    // チャートの作成
    function createChart() {
        if (!chartCanvas) return;

        const ctx = chartCanvas.getContext('2d');
        if (!ctx) return;

        // 暗いテーマ用の色設定
        const textColor = '#e2e8f0';
        const gridColor = 'rgba(255, 255, 255, 0.1)';

        // 以前のチャートを破棄
        if (chart) {
            chart.destroy();
        }

        // 全データセットの最大値を見つけてX軸の範囲を決定
        let allBins: number[] = [];
        histogramDataSets.forEach(dataset => {
            dataset.histogramData.forEach(bin => {
                allBins.push(Math.floor(bin.max));
            });
        });
        const uniqueBins = [...new Set(allBins)].sort((a, b) => a - b);

        chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: uniqueBins.map(bin => bin.toString()),
                datasets: histogramDataSets.map((dataset, index) => {
                    // 各ビンの値をデータセットに合わせて設定
                    const data = uniqueBins.map(binMax => {
                        const bin = dataset.histogramData.find(b => Math.floor(b.max) === binMax);
                        return bin ? bin.count : 0;
                    });
                    
                    return {
                        label: dataset.label,
                        data: data,
                        backgroundColor: dataset.color,
                        borderColor: dataset.color.replace('0.6', '1'), // 境界線はより濃く
                        borderWidth: 1
                    };
                })
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 800, // アニメーション時間（ミリ秒）
                    easing: 'easeOutQuart' // アニメーションイージング
                },
                plugins: {
                    title: {
                        display: true,
                        text: title,
                        font: {
                            size: 18,
                            weight: 'bold'
                        },
                        color: textColor,
                        padding: {
                            top: 10,
                            bottom: 20
                        }
                    },
                    tooltip: {
                        callbacks: {
                            title: (items) => {
                                if (items.length > 0) {
                                    const binValue = parseInt(items[0].label);
                                    const prevBin = binValue - binWidth;
                                    return `範囲: ${prevBin} - ${binValue}`;
                                }
                                return '';
                            }
                        },
                        padding: 10,
                        titleFont: {
                            size: 14
                        },
                        bodyFont: {
                            size: 14
                        },
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff'
                    },
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            font: {
                                size: 12
                            },
                            color: textColor
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: '振幅',
                            color: textColor
                        },
                        grid: {
                            color: gridColor
                        },
                        ticks: {
                            color: textColor
                        }
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: '頻度 (サイクル)',
                            color: textColor
                        },
                        grid: {
                            color: gridColor
                        },
                        ticks: {
                            color: textColor
                        }
                    }
                }
            }
        });
    }
    // チャートの更新
    function updateChart() {
        if (!chart || histogramDataSets.length === 0) return;

        // 全データセットの最大値を見つけてX軸の範囲を決定
        let allBins: number[] = [];
        histogramDataSets.forEach(dataset => {
            dataset.histogramData.forEach(bin => {
                allBins.push(Math.floor(bin.max));
            });
        });
        const uniqueBins = [...new Set(allBins)].sort((a, b) => a - b);

        // 更新によるアニメーション効果
        chart.data.labels = uniqueBins.map(bin => bin.toString());
        chart.data.datasets = histogramDataSets.map((dataset, index) => {
            // 各ビンの値をデータセットに合わせて設定
            const data = uniqueBins.map(binMax => {
                const bin = dataset.histogramData.find(b => Math.floor(b.max) === binMax);
                return bin ? bin.count : 0;
            });
            
            return {
                label: dataset.label,
                data: data,
                backgroundColor: dataset.color,
                borderColor: dataset.color.replace('0.6', '1'), // 境界線はより濃く
                borderWidth: 1
            };
        });

        // タイトルの更新
        if (chart.options && chart.options.plugins && chart.options.plugins.title) {
            chart.options.plugins.title.text = title;
        }

        chart.update('active'); // アニメーションのトランジションモードを'active'に設定
    }
</script>

<div class="chart-container" style="position: relative; height: 100%; width: 100%;">
    <canvas bind:this={chartCanvas}></canvas>
</div>

<style>
    .chart-container {
        padding: 0.5rem;
        background-color: #1e293b; /* 暗い背景色 */
        border-radius: 0.5rem;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
        min-height: 400px;
        height: 100%;
    }
</style>
