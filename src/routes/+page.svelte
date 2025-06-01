<script lang="ts">
	import { MeasurementData } from "$lib/measurement_data";

	// ファイル
	let files: FileList | null = null;
	// 区切り文字
	let delimiter: ',' | '\t' = ',';
	// 文字エンコード
	let encode = 'utf-8';
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
			const data = new MeasurementData({delimiter, existsHeaderRow, existsDatetimeColumn, existsMillisecondColumn});
			data.read(fileContent);
			
			try {
				// 並列処理を順番に実行
				await data.extractPeaksAndValleysAsync();
				await data.calcRainDropAsync();
				await data.calcStatusAsync();
				console.log(data);
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
