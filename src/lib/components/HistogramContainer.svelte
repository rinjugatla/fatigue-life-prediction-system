<script lang="ts">
    import HistogramChart from './HistogramChart.svelte';
    import SpotSelector from './SpotSelector.svelte';
    import SpotStatistics from './SpotStatistics.svelte';
    import BinWidthControl from './BinWidthControl.svelte';
    import LogScaleToggle from './LogScaleToggle.svelte';
    import {
        measurementData,
        selectedSpotIndex,
        selectedSpotIndices,
        histogramBinWidth,
        useLogScale
    } from '$lib/stores/measurement-store';
</script>

<div class="main-content flex-1 overflow-y-auto p-4">
    {#if $measurementData && $measurementData.spots.length > 0}
        <div class="histogram-container flex h-full flex-col">
            <div class="histogram-header mb-4 flex flex-wrap items-center justify-between gap-4">
                <SpotStatistics />
                <div class="controls flex flex-wrap items-center gap-4">
                    <SpotSelector />
                    <BinWidthControl />
                    <LogScaleToggle />
                </div>
            </div>
            <div class="chart-wrapper min-h-[400px] flex-1">
                {#if $selectedSpotIndices.length === 0}
                    <div class="flex h-full items-center justify-center">
                        <div class="text-center text-gray-500">
                            <svg
                                class="mx-auto mb-4 h-16 w-16"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M13 10V3L4 14h7v7l9-11h-7z"
                                ></path>
                            </svg>
                            <p class="text-xl">表示するスポットを選択してください</p>
                        </div>
                    </div>
                {:else}
                    <HistogramChart
                        datasets={$selectedSpotIndices.map((index) => ({
                            rainDrops: $measurementData.spots[index].rainDrops,
                            label: $measurementData.spots[index].label
                        }))}
                        binWidth={$histogramBinWidth}
                        useLogScale={$useLogScale}
                        title={$selectedSpotIndices.length === 1
                            ? `${$measurementData.spots[$selectedSpotIndices[0]].label} - ひずみ頻度分布`
                            : '複数スポット - ひずみ頻度分布比較'}
                    />
                {/if}
            </div>
        </div>
    {:else}
        <div class="placeholder-container flex h-full items-center justify-center">
            <div class="text-center text-gray-500">
                <svg
                    class="mx-auto mb-6 h-24 w-24"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                </svg>
                <p class="mb-2 text-2xl">データが読み込まれていません</p>
                <p class="text-lg">左側のサイドバーからデータをアップロードして解析してください</p>
            </div>
        </div>
    {/if}
</div>
