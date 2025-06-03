<script lang="ts">
    import HistogramChart from './HistogramChart.svelte';
    import { measurementData, selectedSpotIndex, histogramBinWidth } from '$lib/stores/measurement-store';
</script>

<div class="main-content flex-1 overflow-y-auto p-4">
    {#if $measurementData && $measurementData.spots.length > 0}
        <div class="histogram-container flex h-full flex-col">
            <div class="histogram-header mb-4 flex flex-wrap items-center justify-between gap-4">
                <div class="controls flex flex-wrap items-center gap-4">
                    <div class="spot-select">
                        <label for="spot-select" class="label font-medium">スポット選択:</label>
                        <select 
                            id="spot-select" 
                            class="select select-bordered" 
                            bind:value={$selectedSpotIndex}
                        >
                            {#if $measurementData && $measurementData.spots}
                                {#each $measurementData.spots as spot, i}
                                    <option value={i}>{spot.label}</option>
                                {/each}
                            {/if}
                        </select>
                    </div>

                    <div class="bin-width-control flex flex-col">
                        <label for="bin-width" class="label font-medium">ヒストグラム区間幅:</label>
                        <div class="flex items-center gap-2">
                            <input
                                id="bin-width-range"
                                type="range"
                                min="1"
                                max="50"
                                step="1"
                                class="range range-primary w-40"
                                bind:value={$histogramBinWidth}
                                aria-labelledby="bin-width"
                            />
                            <div class="w-16">
                                <input
                                    id="bin-width"
                                    type="number"
                                    min="1"
                                    class="input input-bordered w-full"
                                    bind:value={$histogramBinWidth}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="stats mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                <div class="stat bg-base-200 rounded-box p-3">
                    <div class="stat-title text-sm">総サイクル数</div>
                    <div class="stat-value text-xl">
                        {$measurementData.spots[$selectedSpotIndex].rainDrops
                            .reduce((acc, drop) => acc + drop.cycleType, 0)
                            .toFixed(1)}
                    </div>
                </div>
                <div class="stat bg-base-200 rounded-box p-3">
                    <div class="stat-title text-sm">最大振幅</div>
                    <div class="stat-value text-xl">
                        {$measurementData.spots[$selectedSpotIndex].rainDrops.length > 0
                            ? Math.max(
                                  ...$measurementData.spots[$selectedSpotIndex].rainDrops.map(
                                      (drop) => drop.range
                                  )
                              ).toFixed(2)
                            : 0}
                    </div>
                </div>
            </div>

            <div class="chart-wrapper min-h-[400px] flex-1">
                <HistogramChart
                    rainDrops={$measurementData.spots[$selectedSpotIndex].rainDrops}
                    binWidth={$histogramBinWidth}
                    title={`${$measurementData.spots[$selectedSpotIndex].label} - ひずみ頻度分布`}  
                />
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
                <p class="text-lg">
                    左側のサイドバーからデータをアップロードして解析してください
                </p>
            </div>
        </div>
    {/if}
</div>
