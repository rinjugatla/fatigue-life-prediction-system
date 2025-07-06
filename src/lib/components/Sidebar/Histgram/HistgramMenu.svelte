<script lang="ts">
    import HistgramWidthSelector from './HistgramWidthSelector.svelte';
    import LogScaleToggle from './LogScaleToggle.svelte';
    import SpotSelector from './SpotSelector.svelte';
    import { measurementData } from '$lib/stores/measurement-store';
</script>

<div class="card bg-base-100 mt-4 shadow-sm">
    <div class="card-body p-4">
        <h2 class="card-title flex items-center text-lg font-bold">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                class="mr-2 h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
            </svg>
            ヒストグラム設定
        </h2>

        <div class="divider my-2"></div>

        {#if $measurementData}
            <div class="space-y-4">
                <SpotSelector />
                <HistgramWidthSelector />
                <LogScaleToggle />
            </div>
        {:else}
            <div class="alert alert-info shadow-sm">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-6 w-6 shrink-0 stroke-current"
                    fill="none"
                    viewBox="0 0 24 24"
                    ><path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    /></svg
                >
                <span>データを読み込むとヒストグラム設定が表示されます</span>
            </div>
        {/if}
    </div>
</div>
