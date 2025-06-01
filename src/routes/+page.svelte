<script lang="ts">
	import { MeasurementData } from '$lib/measurement_data';
	import HistogramChart from '$lib/components/HistogramChart.svelte';

	// ファイル
	let files: FileList | null = null;
	// 区切り文字
	let delimiter: ',' | '\t' = ',';
	// 文字エンコード
	let encode = 'utf-8';
	// 測定値の閾値
	let measurementValueThreshold = '0.001';
	// ヘッダーがあるか
	let existsHeaderRow = false;
	// 日時列があるか
	let existsDatetimeColumn = false;
	// ミリ秒列があるか
	let existsMillisecondColumn = false;
	// ファイルの内容
	let fileContent = '';
	// エラーメッセージ
	let errorMessage = '';
	// 解析中か(解析が長い場合に連続でボタンを押させないため)
	let analyzing = false;
	// 解析結果
	let measurementData: MeasurementData | null = null;
	// 選択中の計測スポットインデックス
	let selectedSpotIndex = 0;
	// ヒストグラムの区間幅
	let histogramBinWidth = 10;
	// サイドバーが開いているかどうか
	let isSidebarOpen = true;

	// サイドバーの開閉を切り替える
	const toggleSidebar = () => {
		isSidebarOpen = !isSidebarOpen;
	};

	const analyze = () => {
		const hasError = errorHandler();
		if (hasError) {
			return;
		}

		loadFile();
	};

	// 例外処理
	const errorHandler = () => {
		if (!files || files.length === 0) {
			errorMessage = 'No file selected';
			return true;
		}
		if (!encode) {
			errorMessage = 'No encoding selected';
			return true;
		}

		errorMessage = '';
		return false;
	};

	// ファイル読み込み
	const loadFile = () => {
		if (!files) {
			return;
		}

		const file = files[0];
		file.name.endsWith('.tsv') ? (delimiter = '\t') : (delimiter = ',');

		const reader = new FileReader();
		reader.onload = async (e) => {
			fileContent = e.target?.result as string;
			const data = new MeasurementData({
				delimiter,
				existsHeaderRow,
				existsDatetimeColumn,
				existsMillisecondColumn,
				measurementValueThreshold: parseFloat(measurementValueThreshold)
			});
			data.read(fileContent);

			try {
				// 並列処理を順番に実行
				await data.extractPeaksAndValleysAsync();
				await data.calcRainDropAsync();
				await data.calcStatusAsync();
				console.log(data);
				
				// 解析結果を保存
				measurementData = data;
				selectedSpotIndex = 0; // 最初のスポットを選択
			} catch (error) {
				console.error('解析エラー:', error);
				errorMessage = '解析中にエラーが発生しました';
			} finally {
				analyzing = false;
			}
		};
		reader.readAsText(file, encode);
		analyzing = true;
	};
</script>

<div class="app-container flex h-screen overflow-hidden">
	<!-- 折り畳み可能なサイドバー -->
	<div class="sidebar-container relative {isSidebarOpen ? 'w-80' : 'w-12'} transition-all duration-300 ease-in-out">
		<div class="sidebar-toggle absolute -right-3 top-4 z-10">
			<button 
				class="btn btn-circle btn-sm bg-primary text-white shadow-lg" 
				on:click={toggleSidebar}
				aria-label={isSidebarOpen ? 'サイドバーを閉じる' : 'サイドバーを開く'}
			>
				{#if isSidebarOpen}
					<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
					</svg>
				{:else}
					<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
					</svg>
				{/if}
			</button>
		</div>
		
		<div class="sidebar-content h-full overflow-y-auto bg-base-200 p-4 {isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}">
			<h2 class="mb-4 text-xl font-bold">Fatigue data</h2>
			
			<form>
				<fieldset class="mb-4">
					<legend class="mb-2 font-medium">Data file(csv, tsv)</legend>
					<input type="file" class="file-input w-full mb-3" accept=".csv,.tsv" bind:files />

					<select class="select w-full mb-3" bind:value={encode}>
						<option disabled>Encode</option>
						<option value="utf-8">UTF-8</option>
						<option value="sjis">SJIS</option>
					</select>
				</fieldset>

				<fieldset class="mb-4">
					<legend class="mb-2 font-medium">Threshold for extreme value extraction</legend>
					<input
						type="number"
						class="input w-full"
						placeholder="0.001"
						bind:value={measurementValueThreshold}
					/>
				</fieldset>

				<div class="options mb-4">
					<label class="label cursor-pointer">
						<span>Exists header row</span>
						<input type="checkbox" bind:checked={existsHeaderRow} class="checkbox checkbox-primary" />
					</label>

					<label class="label cursor-pointer">
						<span>Exists datetime column</span>
						<input type="checkbox" bind:checked={existsDatetimeColumn} class="checkbox checkbox-primary" />
					</label>

					<label class="label cursor-pointer">
						<span>Exists millisecond column</span>
						<input type="checkbox" bind:checked={existsMillisecondColumn} class="checkbox checkbox-primary" />
					</label>
				</div>

				<div class="analyze-btn-container mb-4">
					<button class="btn btn-primary w-full" on:click={analyze} disabled={analyzing}>
						{analyzing ? 'Analyzing...' : 'Analyze'}
					</button>
					{#if errorMessage}
						<div role="alert" class="alert alert-error p-2 mt-2">
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
							<span>{errorMessage}</span>
						</div>
					{/if}
				</div>
			</form>
		</div>
	</div>

	<!-- メインコンテンツエリア -->
	<div class="main-content flex-1 overflow-y-auto p-4">
		{#if measurementData && measurementData.spots.length > 0}
			<div class="histogram-container h-full flex flex-col">
				<div class="histogram-header mb-4 flex flex-wrap items-center justify-between gap-4">
					<h2 class="text-2xl font-bold">Rain Drop Histogram</h2>
					
					<div class="controls flex flex-wrap items-center gap-4">
						<div class="spot-select">
							<label class="label font-medium">スポット選択:</label>
							<select 
								class="select select-bordered" 
								bind:value={selectedSpotIndex}
							>
								{#each measurementData.spots as spot, i}
									<option value={i}>{spot.label}</option>
								{/each}
							</select>
						</div>
						
						<div class="bin-width-control flex flex-col">
							<label class="label font-medium">ヒストグラム区間幅:</label>
							<div class="flex items-center gap-2">
								<input 
									type="range" 
									min="1" 
									max="50" 
									step="1" 
									class="range range-primary w-40" 
									bind:value={histogramBinWidth}
								/>
								<div class="w-16">
									<input 
										type="number" 
										min="1" 
										class="input input-bordered w-full" 
										bind:value={histogramBinWidth}
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
				
				<div class="stats mb-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
					<div class="stat bg-base-200 rounded-box p-3">
						<div class="stat-title text-sm">総サイクル数</div>
						<div class="stat-value text-xl">
							{measurementData.spots[selectedSpotIndex].rainDrops
								.reduce((acc, drop) => acc + drop.cycleType, 0)
								.toFixed(1)}
						</div>
					</div>
					<div class="stat bg-base-200 rounded-box p-3">
						<div class="stat-title text-sm">最大振幅</div>
						<div class="stat-value text-xl">
							{measurementData.spots[selectedSpotIndex].rainDrops.length > 0
								? Math.max(...measurementData.spots[selectedSpotIndex].rainDrops.map(drop => drop.range)).toFixed(2)
								: 0}
						</div>
					</div>
				</div>
				
				<div class="chart-wrapper flex-1 min-h-[400px]">
					<HistogramChart 
						rainDrops={measurementData.spots[selectedSpotIndex].rainDrops} 
						binWidth={histogramBinWidth}
						title={`${measurementData.spots[selectedSpotIndex].label} - Rain Drop Histogram`}
					/>
				</div>
			</div>
		{:else}
			<div class="placeholder-container h-full flex items-center justify-center">
				<div class="text-center text-gray-500">
					<svg class="w-24 h-24 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
					</svg>
					<p class="text-2xl mb-2">データが読み込まれていません</p>
					<p class="text-lg">左側のサイドバーからデータをアップロードして解析してください</p>
				</div>
			</div>
		{/if}
	</div>
</div>
