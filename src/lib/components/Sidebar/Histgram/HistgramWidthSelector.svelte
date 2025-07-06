<script lang="ts">
    import { histogramBinWidth } from '$lib/stores/measurement-store';
</script>

<div class="bin-width-control bg-base-200 rounded-lg p-3">
    <label for="bin-width" class="label flex items-center font-medium">
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
                d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
            />
        </svg>
        <span>区間幅</span>
    </label>
    <div class="mt-1 flex items-center gap-2">
        <input
            id="bin-width-range"
            type="range"
            min="1"
            max="50"
            step="1"
            class="range range-primary range-sm w-40"
            bind:value={$histogramBinWidth}
            aria-labelledby="bin-width"
        />
        <div class="w-16">
            <input
                id="bin-width"
                type="number"
                min="1"
                class="input input-bordered input-sm w-full"
                bind:value={$histogramBinWidth}
            />
        </div>
    </div>
    <div class="mt-1 text-xs text-gray-500">小さい値でより詳細なヒストグラムを表示します</div>
</div>
