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

<form>
	<fieldset class="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
		<legend class="fieldset-legend">Fatigue data</legend>

		<legend class="fieldset-legend">Data file(csv, tsv)</legend>
		<input type="file" class="file-input" accept=".csv,.tsv" bind:files />

		<select class="select" bind:value={encode}>
			<option disabled>Encode</option>
			<option value="utf-8">UTF-8</option>
			<option value="sjis">SJIS</option>
		</select>

		<fieldset class="fieldset">
			<legend class="fieldset-legend">Threshold for extreme value extraction</legend>
			<input
				type="number"
				class="input"
				placeholder="0.001"
				bind:value={measurementValueThreshold}
			/>
		</fieldset>

		<label class="label">
			<input type="checkbox" bind:checked={existsHeaderRow} class="checkbox" />
			Exists header row
		</label>

		<label class="label">
			<input type="checkbox" bind:checked={existsDatetimeColumn} class="checkbox" />
			Exists datetime column
		</label>

		<label class="label">
			<input type="checkbox" bind:checked={existsMillisecondColumn} class="checkbox" />
			Exists millisecond column
		</label>
	</fieldset>

	<fieldset class="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
		<button class="btn" on:click={analyze} disabled={analyzing}>Analyze</button>
		{#if errorMessage}
			<div role="alert" class="alert alert-error p-2">
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
	</fieldset>
</form>

{#if measurementData && measurementData.spots.length > 0}
	<div class="histogram-container bg-base-200 border-base-300 rounded-box border p-4 mt-4">
		<h2 class="text-xl font-bold mb-4">Rain Drop Histogram</h2>
		
		<div class="controls mb-4">
			<label class="label font-medium">スポット選択:</label>
			<select 
				class="select w-full mb-4" 
				bind:value={selectedSpotIndex}
			>
				{#each measurementData.spots as spot, i}
					<option value={i}>{spot.label}</option>
				{/each}
			</select>
			
			<label class="label font-medium">ヒストグラム区間幅:</label>
			<div class="flex items-center gap-4">
				<input 
					type="range" 
					min="1" 
					max="50" 
					step="1" 
					class="range range-primary flex-grow" 
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
		
		<div class="chart-wrapper">
			<HistogramChart 
				rainDrops={measurementData.spots[selectedSpotIndex].rainDrops} 
				binWidth={histogramBinWidth}
				title={`${measurementData.spots[selectedSpotIndex].label} - Rain Drop Histogram`}
			/>
		</div>
		
		<div class="stats mt-4 grid grid-cols-1 md:grid-cols-2 gap-2">
			<div class="stat bg-base-100 rounded-box p-4">
				<div class="stat-title">総サイクル数</div>
				<div class="stat-value">
					{measurementData.spots[selectedSpotIndex].rainDrops
						.reduce((acc, drop) => acc + drop.cycleType, 0)
						.toFixed(1)}
				</div>
			</div>
			<div class="stat bg-base-100 rounded-box p-4">
				<div class="stat-title">最大振幅</div>
				<div class="stat-value">
					{measurementData.spots[selectedSpotIndex].rainDrops.length > 0
						? Math.max(...measurementData.spots[selectedSpotIndex].rainDrops.map(drop => drop.range)).toFixed(2)
						: 0}
				</div>
			</div>
		</div>
	</div>
{/if}
