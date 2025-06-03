<script lang="ts">
    import {
        measurementData,
        selectedSpotIndices,
        selectedSpotIndex
    } from '$lib/stores/measurement-store';

    // 外部からのプロパティ（オプション）
    export let label = 'スポット選択:';
    export let width = 'w-64';
</script>

<div class="spot-select">
    <label for="spot-select" class="label font-medium">{label}</label>
    <div class="dropdown {width}">
        <div tabindex="0" role="button" class="select select-bordered w-full">
            {$selectedSpotIndices.length === 0
                ? 'スポットを選択'
                : $selectedSpotIndices.length === 1
                  ? $measurementData?.spots[$selectedSpotIndices[0]]?.label || 'スポット'
                  : `${$selectedSpotIndices.length} スポットを選択中`}
        </div>
        <div
            tabindex="1"
            class="dropdown-content menu bg-base-100 rounded-box z-[1] max-h-60 w-full overflow-y-auto p-2 shadow"
        >
            {#if $measurementData && $measurementData.spots}
                <div class="mb-2 flex justify-between border-b border-gray-200 pb-2">
                    <button
                        class="btn btn-xs btn-outline"
                        on:click={() => {
                            $selectedSpotIndices = Array.from(
                                { length: $measurementData.spots.length },
                                (_, i) => i
                            );
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
                                        $selectedSpotIndices = $selectedSpotIndices.filter(
                                            (idx) => idx !== i
                                        );
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
