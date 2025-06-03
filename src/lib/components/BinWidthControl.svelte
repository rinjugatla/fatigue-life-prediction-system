<script lang="ts">
    import { histogramBinWidth } from '$lib/stores/measurement-store';
</script>

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
