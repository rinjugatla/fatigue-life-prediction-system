<script lang="ts">
    import {
        measurementData,
        selectedSpotIndices,
        selectedSpotIndex
    } from '$lib/stores/measurement-store';
</script>

<div class="spot-select bg-base-200 rounded-lg p-3">
    <label for="spot-select" class="label flex items-center font-medium">
        <svg
            xmlns="http://www.w3.org/2000/svg"
            class="mr-2 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
            <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
        </svg>
        <span>スポット選択</span>
    </label>
    <div class="dropdown mt-1 w-full">
        <div tabindex="0" role="button" class="select select-bordered select-sm w-full">
            {$selectedSpotIndices.length === 0
                ? 'スポットを選択'
                : $selectedSpotIndices.length === 1
                  ? $measurementData?.spots[$selectedSpotIndices[0]]?.label || 'スポット'
                  : `${$selectedSpotIndices.length} スポットを選択中`}
        </div>
        <div
            tabindex="-1"
            class="dropdown-content menu bg-base-100 rounded-box z-[1] max-h-60 w-full overflow-y-auto p-2 shadow"
        >
            {#if $measurementData && $measurementData.spots}
                <div class="mb-2 flex justify-between border-b border-gray-200 pb-2">
                    <button
                        class="btn btn-xs btn-outline btn-primary"
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
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="mr-1 h-3 w-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M4 5h16a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2z"
                            />
                        </svg>
                        すべて選択
                    </button>
                    <button
                        class="btn btn-xs btn-outline"
                        on:click={() => {
                            $selectedSpotIndices = [];
                            $selectedSpotIndex = 0;
                        }}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="mr-1 h-3 w-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                        すべて解除
                    </button>
                </div>
                <div class="max-h-40 overflow-y-auto pr-1">
                    {#each $measurementData.spots as spot, i}
                        <div class="form-control">
                            <label class="label cursor-pointer justify-start gap-2 py-1">
                                <input
                                    type="checkbox"
                                    class="checkbox checkbox-primary checkbox-sm"
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
                </div>
            {/if}
        </div>
    </div>
    <div class="mt-1 text-xs text-gray-500">複数のスポットを選択するとすべて表示されます</div>
</div>
