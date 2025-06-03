<script lang="ts">
    import HistogramChart from './HistogramChart.svelte';
    import {
        measurementData,
        selectedSpotIndex,
        selectedSpotIndices,
        histogramBinWidth
    } from '$lib/stores/measurement-store';
</script>

<div class="main-content flex-1 overflow-y-auto p-4">
    {#if $measurementData && $measurementData.spots.length > 0}
        <div class="histogram-container flex h-full flex-col">
            <div class="histogram-header mb-4 flex flex-wrap items-center justify-between gap-4">                <div class="stats-container flex items-center gap-4">
                    <div class="stats-row flex flex-wrap gap-4">
                        {#if $selectedSpotIndices.length === 0}
                            <div class="stat bg-base-200 rounded-box p-3">
                                <div class="stat-title text-sm">スポット選択</div>
                                <div class="stat-value text-xl">
                                    未選択
                                </div>
                            </div>
                        {:else if $selectedSpotIndices.length === 1}
                            <div class="stat bg-base-200 rounded-box p-3">
                                <div class="stat-title text-sm">総サイクル数</div>
                                <div class="stat-value text-xl">
                                    {$measurementData.spots[$selectedSpotIndices[0]].rainDrops
                                        .reduce((acc, drop) => acc + drop.cycleType, 0)
                                        .toFixed(1)}
                                </div>
                            </div>
                            <div class="stat bg-base-200 rounded-box p-3">
                                <div class="stat-title text-sm">最大振幅</div>
                                <div class="stat-value text-xl">
                                    {$measurementData.spots[$selectedSpotIndices[0]].rainDrops.length > 0
                                        ? Math.max(
                                              ...$measurementData.spots[
                                                  $selectedSpotIndices[0]
                                              ].rainDrops.map((drop) => drop.range)
                                          ).toFixed(2)
                                        : 0}
                                </div>
                            </div>
                        {:else}
                            <div class="stat bg-base-200 rounded-box p-3">
                                <div class="stat-title text-sm">選択スポット数</div>
                                <div class="stat-value text-xl">
                                    {$selectedSpotIndices.length}
                                </div>
                            </div>
                            <div class="stat bg-base-200 rounded-box p-3">
                                <div class="stat-title text-sm">合計サイクル数</div>
                                <div class="stat-value text-xl">
                                    {$selectedSpotIndices
                                        .reduce((acc, spotIndex) => 
                                            acc + $measurementData.spots[spotIndex].rainDrops
                                                .reduce((spotAcc, drop) => spotAcc + drop.cycleType, 0), 0)
                                        .toFixed(1)}
                                </div>
                            </div>
                        {/if}
                    </div>
                </div><div class="controls flex flex-wrap items-center gap-4">
                    <div class="spot-select">
                        <label for="spot-select" class="label font-medium">スポット選択:</label>
                        <div class="dropdown w-64">
                            <div tabindex="0" role="button" class="select select-bordered w-full">
                                {$selectedSpotIndices.length === 0 
                                    ? 'スポットを選択' 
                                    : $selectedSpotIndices.length === 1 
                                        ? $measurementData.spots[$selectedSpotIndices[0]].label
                                        : `${$selectedSpotIndices.length} スポットを選択中`}
                            </div>                            <div tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-full max-h-60 overflow-y-auto">
                                {#if $measurementData && $measurementData.spots}
                                    <div class="flex justify-between mb-2 pb-2 border-b border-gray-200">
                                        <button 
                                            class="btn btn-xs btn-outline" 
                                            on:click={() => {
                                                $selectedSpotIndices = Array.from({ length: $measurementData.spots.length }, (_, i) => i);
                                                if ($selectedSpotIndices.length > 0) {
                                                    $selectedSpotIndex = $selectedSpotIndices[0];
                                                }
                                            }}
                                        >
                                            すべて選択
                                        </button>
                                        <button 
                                            class="btn btn-xs btn-outline" 
                                            on:click={() => {
                                                $selectedSpotIndices = [];
                                                $selectedSpotIndex = 0;
                                            }}
                                        >
                                            すべて解除
                                        </button>
                                    </div>
                                    {#each $measurementData.spots as spot, i}
                                        <div class="form-control">
                                            <label class="label cursor-pointer justify-start gap-2">
                                                <input 
                                                    type="checkbox" 
                                                    class="checkbox checkbox-primary"
                                                    checked={$selectedSpotIndices.includes(i)}
                                                    on:change={() => {
                                                        if ($selectedSpotIndices.includes(i)) {
                                                            $selectedSpotIndices = $selectedSpotIndices.filter(idx => idx !== i);
                                                        } else {
                                                            $selectedSpotIndices = [...$selectedSpotIndices, i];
                                                        }
                                                        // 単一選択互換性のために
                                                        if ($selectedSpotIndices.length > 0) {
                                                            $selectedSpotIndex = $selectedSpotIndices[0];
                                                        }
                                                    }}
                                                />
                                                <span class="label-text">{spot.label}</span>
                                            </label>
                                        </div>
                                    {/each}
                                {/if}
                            </div>
                        </div>
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
            </div>            <div class="chart-wrapper min-h-[400px] flex-1">
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
                        datasets={$selectedSpotIndices.map(index => ({
                            rainDrops: $measurementData.spots[index].rainDrops,
                            label: $measurementData.spots[index].label
                        }))}
                        binWidth={$histogramBinWidth}
                        title={$selectedSpotIndices.length === 1 
                            ? `${$measurementData.spots[$selectedSpotIndices[0]].label} - ひずみ頻度分布`
                            : "複数スポット - ひずみ頻度分布比較"}
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
