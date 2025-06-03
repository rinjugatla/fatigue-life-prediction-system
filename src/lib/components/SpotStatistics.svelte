<script lang="ts">
    import { measurementData, selectedSpotIndices } from '$lib/stores/measurement-store';
</script>

<div class="stats-container flex items-center gap-4">
    <div class="stats-row flex flex-wrap gap-4">
        {#if $selectedSpotIndices.length === 0}
            <div class="stat bg-base-200 rounded-box p-3">
                <div class="stat-title text-sm">スポット選択</div>
                <div class="stat-value text-xl">未選択</div>
            </div>
        {:else if $selectedSpotIndices.length === 1 && $measurementData}
            {@const spot = $measurementData.spots[$selectedSpotIndices[0]]}
            <div class="stat bg-base-200 rounded-box p-3">
                <div class="stat-title text-sm">総サイクル数</div>
                <div class="stat-value text-xl">
                    {spot.rainDrops.reduce((acc, drop) => acc + drop.cycleType, 0).toFixed(1)}
                </div>
            </div>
            <div class="stat bg-base-200 rounded-box p-3">
                <div class="stat-title text-sm">最大振幅</div>
                <div class="stat-value text-xl">
                    {spot.rainDrops.length > 0
                        ? Math.max(...spot.rainDrops.map((drop) => drop.range)).toFixed(2)
                        : '0.00'}
                </div>
            </div>{:else}
            <div class="stat bg-base-200 rounded-box p-3">
                <div class="stat-title text-sm">選択スポット数</div>
                <div class="stat-value text-xl">
                    {$selectedSpotIndices.length}
                </div>
            </div>
            <div class="stat bg-base-200 rounded-box p-3">
                <div class="stat-title text-sm">合計サイクル数</div>
                <div class="stat-value text-xl">
                    {#if $measurementData}
                        {@const totalCycles = $selectedSpotIndices.reduce(
                            (acc, spotIndex) =>
                                acc +
                                $measurementData.spots[spotIndex].rainDrops.reduce(
                                    (spotAcc, drop) => spotAcc + drop.cycleType,
                                    0
                                ),
                            0
                        )}
                        {totalCycles.toFixed(1)}
                    {:else}0{/if}
                </div>
            </div>
        {/if}
    </div>
</div>
