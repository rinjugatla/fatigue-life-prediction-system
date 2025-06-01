<script lang="ts">
    import { onMount, onDestroy, afterUpdate } from 'svelte';
    import { Chart, registerables } from 'chart.js';
    import type { RainDrop } from '$lib/rain_drop';
    import { HistogramCalculator, type HistogramBin } from '$lib/histogram_calculator';

    // Chart.jsの必要な機能を登録
    Chart.register(...registerables);

    // プロパティ
    export let rainDrops: RainDrop[] = [];
    export let binWidth: number = 10;
    export let title: string = 'Rain Drop Histogram';

    // 内部変数
    let chartCanvas: HTMLCanvasElement;
    let chart: Chart | undefined;
    let histogramData: HistogramBin[] = [];

    // ヒストグラムデータの計算
    $: {
        if (rainDrops && rainDrops.length > 0 && binWidth > 0) {
            histogramData = HistogramCalculator.calculate(rainDrops, binWidth);
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

        // ダークモード対応のための色設定
        const isDarkMode = document.documentElement.classList.contains('dark');
        const textColor = isDarkMode ? '#e2e8f0' : '#475569';
        const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

        // 以前のチャートを破棄
        if (chart) {
            chart.destroy();
        }

        chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: histogramData.map((bin) => Math.floor(bin.max).toString()),
                datasets: [
                    {
                        label: 'Frequency',
                        data: histogramData.map((bin) => bin.count),
                        backgroundColor: 'rgba(75, 192, 192, 0.6)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    }
                ]
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
                                    const index = items[0].dataIndex;
                                    const bin = histogramData[index];
                                    return `範囲: ${Math.floor(bin.min)} - ${Math.floor(bin.max)}`;
                                }
                                return '';
                            },
                            label: (item) => {
                                return `頻度: ${item.parsed.y.toFixed(2)}`;
                            }
                        },
                        padding: 10,
                        titleFont: {
                            size: 14
                        },
                        bodyFont: {
                            size: 14
                        }
                    },
                    legend: {
                        display: false
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
        if (!chart || histogramData.length === 0) return;

        // 更新によるアニメーション効果
        chart.data.labels = histogramData.map((bin) => Math.floor(bin.max).toString());
        chart.data.datasets[0].data = histogramData.map((bin) => bin.count);

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
        background-color: #fff;
        border-radius: 0.5rem;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        min-height: 400px;
        height: 100%;
    }
</style>
