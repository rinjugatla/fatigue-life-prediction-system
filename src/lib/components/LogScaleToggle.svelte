<script lang="ts">
    import { useLogScale } from '$lib/stores/measurement-store';
</script>

<div class="log-scale-control flex items-center gap-2">
    <label for="log-scale" class="label cursor-pointer font-medium">
        <span class="label-text mr-2">対数表示</span>
        <input
            id="log-scale"
            type="checkbox"
            class="toggle toggle-primary"
            bind:checked={$useLogScale}
        />
    </label>
</div>
