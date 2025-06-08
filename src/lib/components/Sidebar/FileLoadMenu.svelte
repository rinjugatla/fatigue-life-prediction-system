<script lang="ts">
    import {
        isSidebarOpen,
        files,
        encode,
        measurementValueThreshold,
        existsHeaderRow,
        existsDatetimeColumn,
        existsMillisecondColumn,
        analyzing,
        errorMessage
    } from '$lib/stores/measurement-store';
    import { loadFile, validateBeforeAnalyze } from '$lib/services/file-service';

    // 解析処理の実行
    const analyze = () => {
        if (validateBeforeAnalyze()) {
            loadFile();
        }
    };
</script>

<div class="card bg-base-100 shadow-sm">
    <div class="card-body p-4">
        <h2 class="card-title text-lg font-bold flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            ひずみデータ
        </h2>
        
        <div class="divider my-2"></div>

<form>
    <div class="bg-base-200 rounded-lg p-3 mb-4">
        <legend class="font-medium flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>ファイル(csv, tsv)</span>
        </legend>
        <input type="file" class="file-input file-input-sm mb-3 w-full mt-2" accept=".csv,.tsv" bind:files={$files} />        <div class="mt-2">
            <label for="encode-select" class="text-xs mb-1 block">文字エンコード:</label>
            <select id="encode-select" class="select select-sm w-full" bind:value={$encode}>
                <option value="utf-8">UTF-8</option>
                <option value="sjis">SJIS</option>
            </select>
        </div>
        <div class="text-xs text-gray-500 mt-1">
            CSVまたはTSV形式のひずみデータファイルを選択してください
        </div>
    </div>    <div class="bg-base-200 rounded-lg p-3 mb-4">
        <legend class="font-medium flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>計測値を同値とみなす閾値</span>
        </legend>
        <input
            type="number"
            class="input input-sm input-bordered w-full mt-2"
            placeholder="0.001"
            bind:value={$measurementValueThreshold}
        />
        <div class="text-xs text-gray-500 mt-1">
            この値以下の差を持つ計測値は同一とみなされます
        </div>
    </div>    <div class="bg-base-200 rounded-lg p-3 mb-4">
        <div class="font-medium flex items-center mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>データオプション</span>
        </div>
        
        <div class="space-y-1">
            <label class="label cursor-pointer justify-start py-1">
                <input
                    type="checkbox"
                    bind:checked={$existsHeaderRow}
                    class="checkbox checkbox-primary checkbox-sm mr-2"
                />
                <span class="text-sm">ヘッダーが存在する</span>
            </label>

            <label class="label cursor-pointer justify-start py-1">
                <input
                    type="checkbox"
                    bind:checked={$existsDatetimeColumn}
                    class="checkbox checkbox-primary checkbox-sm mr-2"
                />
                <span class="text-sm">日時列が存在する</span>
            </label>

            <label class="label cursor-pointer justify-start py-1">
                <input
                    type="checkbox"
                    bind:checked={$existsMillisecondColumn}
                    class="checkbox checkbox-primary checkbox-sm mr-2"
                />
                <span class="text-sm">ミリ秒列が存在する</span>
            </label>
        </div>
        <div class="text-xs text-gray-500 mt-1">
            データファイルの構造に合わせてオプションを選択してください
        </div>
    </div>    <div class="analyze-btn-container">
        <button
            class="btn btn-primary btn-sm w-full"
            on:click={analyze}
            disabled={$analyzing}
            type="button"
        >
            {#if $analyzing}
                <span class="loading loading-spinner loading-xs"></span>
                解析中...
            {:else}
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                解析
            {/if}
        </button>
        {#if $errorMessage}
            <div role="alert" class="alert alert-error mt-2 p-2 text-sm">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4 shrink-0 stroke-current"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                </svg>
                <span>{$errorMessage}</span>
            </div>
        {/if}
    </div>
</form>
    </div>
</div>
