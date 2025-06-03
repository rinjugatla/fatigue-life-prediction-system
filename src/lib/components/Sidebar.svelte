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

    // サイドバーの開閉を切り替える
    const toggleSidebar = () => {
        $isSidebarOpen = !$isSidebarOpen;
    };

    // 解析処理の実行
    const analyze = () => {
        if (validateBeforeAnalyze()) {
            loadFile();
        }
    };
</script>

<div
    class="sidebar-container relative {$isSidebarOpen
        ? 'w-80'
        : 'w-12'} transition-all duration-300 ease-in-out"
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
        class="sidebar-content bg-base-200 h-full overflow-y-auto p-4 {$isSidebarOpen
            ? 'opacity-100'
            : 'pointer-events-none opacity-0'}"
    >
        <h2 class="mb-4 text-xl font-bold">ひずみデータ</h2>

        <form>
            <fieldset class="mb-4">
                <legend class="mb-2 font-medium">ファイル(csv, tsv)</legend>
                <input
                    type="file"
                    class="file-input mb-3 w-full"
                    accept=".csv,.tsv"
                    bind:files={$files}
                />

                <select class="select mb-3 w-full" bind:value={$encode}>
                    <option disabled>文字エンコード</option>
                    <option value="utf-8">UTF-8</option>
                    <option value="sjis">SJIS</option>
                </select>
            </fieldset>

            <fieldset class="mb-4">
                <legend class="mb-2 font-medium">計測値を同値とみなす閾値</legend>
                <input
                    type="number"
                    class="input w-full"
                    placeholder="0.001"
                    bind:value={$measurementValueThreshold}
                />
            </fieldset>

            <div class="options mb-4">
                <label class="label cursor-pointer">
                    <input
                        type="checkbox"
                        bind:checked={$existsHeaderRow}
                        class="checkbox checkbox-primary mr-2"
                    />
                    <span>ヘッダーが存在する</span>
                </label>

                <label class="label cursor-pointer">
                    <input
                        type="checkbox"
                        bind:checked={$existsDatetimeColumn}
                        class="checkbox checkbox-primary mr-2"
                    />
                    <span>日時列が存在する</span>
                </label>

                <label class="label cursor-pointer">
                    <input
                        type="checkbox"
                        bind:checked={$existsMillisecondColumn}
                        class="checkbox checkbox-primary mr-2"
                    />
                    <span>ミリ秒列が存在する</span>
                </label>
            </div>

            <div class="analyze-btn-container mb-4">
                <button
                    class="btn btn-primary w-full"
                    on:click={analyze}
                    disabled={$analyzing}
                    type="button"
                >
                    {$analyzing ? '解析中...' : '解析'}
                </button>
                {#if $errorMessage}
                    <div role="alert" class="alert alert-error mt-2 p-2">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-6 w-6 shrink-0 stroke-current"
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
