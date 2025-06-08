<script lang="ts">
    import HistogramContainer from '$lib/components/HistogramContainer.svelte';
    import Sidebar from '$lib/components/Sidebar/Sidebar.svelte';
    import { isSidebarOpen } from '$lib/stores/measurement-store';
</script>

<div class="app-container flex h-screen overflow-hidden">
    <!-- サイドバーコンポーネント -->
    <Sidebar />

    <!-- メインコンテンツエリア -->
    <HistogramContainer />
</div>
