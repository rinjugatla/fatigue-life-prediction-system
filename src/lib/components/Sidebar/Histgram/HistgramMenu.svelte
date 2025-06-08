<script lang="ts">
    import HistgramWidthSelector from './HistgramWidthSelector.svelte';
    import LogScaleToggle from './LogScaleToggle.svelte';
    import SpotSelector from './SpotSelector.svelte';
</script>

<div>
    <h2 class="mb-4 text-xl font-bold">ヒストグラム設定</h2>

    <HistgramWidthSelector />
    <SpotSelector />
    <LogScaleToggle />
</div>
