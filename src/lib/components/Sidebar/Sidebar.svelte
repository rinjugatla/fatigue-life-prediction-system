<script lang="ts">
    import {
        isSidebarOpen
    } from '$lib/stores/measurement-store';
    import FileLoader from './FileLoadMenu.svelte';
    import HistgramWidthSelector from './Histgram/HistgramWidthSelector.svelte';
    import LogScaleToggle from './Histgram/LogScaleToggle.svelte';
    import SpotSelector from './Histgram/SpotSelector.svelte';

    // サイドバーの開閉を切り替える
    const toggleSidebar = () => {
        $isSidebarOpen = !$isSidebarOpen;
    };
</script>

<div
    class="sidebar-container relative {$isSidebarOpen
        ? 'w-80'
        : 'w-12'} transition-all duration-300 ease-in-out bg-base-200"
>
    <div class="sidebar-toggle absolute top-4 -right-3 z-10">
        <button
            class="btn btn-circle btn-sm bg-primary text-white shadow-lg"
            on:click={toggleSidebar}
            aria-label={$isSidebarOpen ? 'サイドバーを閉じる' : 'サイドバーを開く'}
        >
            {#if $isSidebarOpen}
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 19l-7-7 7-7"
                    />
                </svg>
            {:else}
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 5l7 7-7 7"
                    />
                </svg>
            {/if}
        </button>
    </div>

    <div
        class="sidebar-content overflow-y-auto p-4 {$isSidebarOpen
            ? 'opacity-100'
            : 'pointer-events-none opacity-0'}"
    >
        <FileLoader />
        <HistgramWidthSelector />
        <SpotSelector />
        <LogScaleToggle />
    </div>
</div>
