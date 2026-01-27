//データ操作用
class DataStore {
	constructor() {
		throw new Error('This class is static.');
	}

	static #storageKey = 'data';

	//データ取得
	static getJsonData() {
		const data = localStorage.getItem(this.#storageKey);
		return data ? JSON.parse(data) : {};
	}

	//データ追加or上書き
	static setJsonData(data) {
		localStorage.setItem(this.#storageKey, JSON.stringify(data));
	}

	static isUUID(id = '') {
		const regex = /^([0-9a-f]{8})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{12})$/;
		if (id && regex.test(String(id))) {
			return true;
		}
		return false;
	}

	//idからデータ取得
	static getDataById(id) {
		if (!id || !this.isUUID(id)) { throw new Error('The first argument must be a UUID.'); }

		const data = this.getJsonData();
	
		//idからデータを取得
		let this_date_date = null;
		let this_date_index = -1;
		for (const [key, val] of Object.entries(data)) {
			const index = val.findIndex(i => i['id'] === id);
			if (index !== -1) {
				this_date_date = key;
				this_date_index = index;
				return [this_date_date, this_date_index, data];
			}
		}
	}

	//idからデータ編集
	static editDataById(new_data, id) {
		if (!new_data || typeof new_data !== 'object') { throw new Error('The first argument must be an object.'); }
		if (!id || !this.isUUID(id)) { throw new Error('The second argument must be a UUID.'); }
		
		const [this_date_date, this_date_index, data] = this.getDataById(id);

		//データが見つかれば
		if (this_date_date !== null) {

			//編集
			data[this_date_date][this_date_index] = new_data;

			//データを上書き
			this.setJsonData(data);

			//表更新
			create_tables();

			return true;
		}
		return false;
	}

	//idからデータ削除
	static removeDataById(id) {
		if (!id || !this.isUUID(id)) { throw new Error('The first argument must be a UUID.'); }

		const [this_date_date, this_date_index, data] = this.getDataById(id);

		//データが見つかれば
		if (this_date_date !== null) {
			//削除
			data[this_date_date].splice(this_date_index, 1);

			//データを上書き
			this.setJsonData(data);

			//表更新
			create_tables();

			return true;
		}
		return false;
	}

	static pushData(new_data, date) {
		if (!new_data || typeof new_data !== 'object') { throw new Error('The first argument must be an object.'); }
		if (!date || !Array.isArray(date)) { throw new Error('The second argument must be an array.\n[YYYY, MM]'); }

		let data_key = date.map(i => String(i).padStart(2, '0')).join('-');
		let json = this.getJsonData();

		//オブジェクト,配列がない場合追加
		if (!json) {
			json = {};
		}
		if (!json[data_key]) {
			json[data_key] = [];
		}

		//データ挿入
		json[data_key].push(new_data);
		this.setJsonData(json);
		
		//表更新
		create_tables(date);
	}

	//URLから月を取得,ない場合は今月
	static getSelectedMonth() {

		const now = new Date();
		let selected_month = [
			now.getFullYear(),
			now.getMonth() + 1
		];

		//urlパラメータチェック
		const search_param = 'y-m';
		const urlparam = get_url_params(search_param);

		if (urlparam !== null) {
			const [pY, pM] = get_url_params('y-m').split('-').map(i => Number(i));
			const condition = (Number.isInteger(pY) && pY >= 0 && pY <= 9999) && (Number.isInteger(pM) && pM >= 1 && pM <= 12);

			//値チェック
			if (condition) {
				return [pY, pM];
			} else {
				delete_param();
			}
		}
		return selected_month;

		//urlパラメータ取得
		function get_url_params(param) {
			const now_url = location.search;
			const url_params = new URLSearchParams(now_url);

			if (param !== undefined && url_params.get(param) !== null) {
				return url_params.get(param);
			}
			return null;
		}

		//urlパラメータを削除
		function delete_param() {
			const url = new URL(location.href);
			url.searchParams.delete(search_param);
			window.history.replaceState(null, '', url.toString());
		}
	}

	//現在の年月日取得
	static getNow() {
		const now = new Date();
		const [Y, M, D] = [
				now.getFullYear(),
				now.getMonth() + 1,
				now.getDate()
			];
		return [Y, M, D];
	}
}

class UIManager {
	constructor() {
		throw new Error('This class is static.');
	}

	//<input type="date">の値,labelの値を変更
	static setCalendar(date, which) {
		const selector_table = document.getElementById('month_selector');
		const lab_selector_table = document.getElementById('lab_month_selector');
		const selector_edit = document.getElementById('input_date_edit');
		const lab_selector_edit = document.getElementById('lab_input_date');

		if (date && Array.isArray(date)) {	
			switch (which) {
			//tableのとき
			case 'table':
				//更新
				let [tY, tM] = date.map(i => String(i).padStart(2, '0'));
				selector_table.value = `${tY}-${tM}`;
				lab_selector_table.textContent = `${tY}年${tM}月`;

				//edit側も月のみ変更,存在しない日排除
				let [oY, oM, oD] = selector_edit.value.split('-').map(i => Number(i));
				[tY, tM] = [tY, tM].map(i => Number(i));
				const this_date = new Date(tY, tM - 1, oD);
				const condition = (
					this_date.getFullYear() === tY &&
					this_date.getMonth() + 1 === tM &&
					this_date.getDate() === oD
				);
				if (!condition) {
					this_date.setDate(0);
					[tY, tM, oD] = [
						this_date.getFullYear(),
						this_date.getMonth() + 1,
						this_date.getDate()
					];
				}
				[tY, tM, oD] = [tY, tM, oD].map(i => String(i).padStart(2, '0'));
				selector_edit.value = `${tY}-${tM}-${oD}`;
				lab_selector_edit.textContent = `${tY}年${tM}月${oD}日`;

				break;
			//editのとき
			case 'edit':
				//更新
				const [eY, eM, eD] = date.map(i => String(i).padStart(2, '0'));
				selector_edit.value = `${eY}-${eM}-${eD}`;
				lab_selector_edit.textContent = `${eY}年${eM}月${eD}日`;

				break;
			}
		}
	}

	//<input type="date">の値取得,ない場合は今日
	static getCalendar(which) {
		const now = DataStore.getNow();

		switch (which) {
		case 'table':
			const selector_table = document.getElementById('month_selector');

			if (selector_table.value !== '') {
				const [tY, tM] = selector_table.value.split('-').map(i => Number(i));
				return [tY, tM];
			}

			//ないとき
			return now.slice(0, 2);

			break;
		case 'edit':
			const selector_edit = document.getElementById('input_date_edit');

			if (selector_edit.value !== '') {
				const [eY, eM] = selector_edit.value.split('-').map(i => Number(i));
				return [eY, eM];
			}
			//ないとき
			return now;

			break;
		}
	}

	//ディスプレイ切り替え
	static toggleDisplay(id) {
		const table_area = document.getElementById('display_area');
		const edit_area = document.getElementById('edit_area');
		const form_guide = document.getElementById('form_guide');
		const submit_btn = document.getElementById('btn_submit');
		const delete_btn = document.getElementById('btn_delete');

		if (DataStore.isUUID(String(id)) && edit_area.classList.contains('is-hidden')) {
			//編集モードの時
			edit_area.dataset.editId = id;

			const [this_date_date, this_date_index, data] = DataStore.getDataById(id);
			const this_data = data[this_date_date][this_date_index];
			const [oY, oM, oD] = this_data['date'].split('-').map(i => Number(i));
			const old_date = new Date(oY, oM - 1, oD);
			const formated_date = [
				old_date.getFullYear(),
				old_date.getMonth() + 1,
				old_date.getDate()
			];
			const content = {
				detail: this_data['detail'],
				money: this_data['money'],
				note: this_data['note'],
				date: formated_date
			};

			delete_btn.classList.remove('is-hidden');
			form_guide.textContent = 'Edit';
			submit_btn.textContent = 'Edit';
			this.resetForm(content);

		}else {
			delete edit_area.dataset.editId;
			delete_btn.classList.add('is-hidden');
			form_guide.textContent = 'Add';
			submit_btn.textContent = 'Add';
		}

		if (table_area.classList.contains('is-hidden')) {
			this.resetForm();
		}

		table_area.classList.toggle('is-hidden');
		edit_area.classList.toggle('is-hidden');
	}

	//金額用テキストとマーカー色決定
	static decideTextMark(money, reverse = false) {
		let sign = '';
		let mark = null;
		let text = '';
		if (money > 0) {
			sign = '+';
			if (reverse) {mark = 'marker-red';}
			else {mark = 'marker-blue';}

		} else if (money < 0) {
			sign = '−';
			if (reverse) {mark = 'marker-blue';}
			else {mark = 'marker-red';}
		}
		text = `${sign}￥${Math.abs(money).toLocaleString()}`;

		return [text, mark];
	}

	//フォーム初期化
	static resetForm(content) {
		const detailE = document.getElementById('edit_detail');
		const moneyE = document.getElementById('edit_money');
		const noteE = document.getElementById('edit_note');

		if (content && typeof content === 'object') {
			//指定があるとき
			detailE.value = content.detail;
			moneyE.value = content.money;
			noteE.value = content.note;
			this.setCalendar(content.date, 'edit');
		}else {
			detailE.value = moneyE.value = noteE.value = '';
		}
	}

	//送信ボタンが押されたら実行
	static sendForm(e) {
		e.preventDefault();

		//フォームの要素
		const detailE = document.getElementById('edit_detail');
		const moneyE = document.getElementById('edit_money');
		const noteE = document.getElementById('edit_note');

		//フォームのデータ
		const detail = detailE.value.trim();
		let money = moneyE.value.trim();
		const note = noteE.value.trim();
		const date = document.getElementById('input_date_edit').value;

		//取得した日付&入力チェック
		const [vY, vM, vD] = date.split('-').map(i => Number(i));
		const sent_date = new Date(vY, vM - 1, vD);
		const condition = detail.length > 0 && String(money).length > 0 && !isNaN(money) && !isNaN(sent_date.getTime());

		money = Number(money);

		//編集モードかどうか
		const edit_id = document.getElementById('edit_area')?.dataset.editId || null;

		//日付のフォーマット
		const [sY, sM, sD] = [
			sent_date.getFullYear(),
			sent_date.getMonth() + 1,
			sent_date.getDate()
		].map(i => String(i).padStart(2, '0'));

		let display_text = `
			以下の内容${edit_id === null ? 'を追加' : 'に変更'}してもよろしいですか。
			内容 : ${detail}
			金額 : ${this.decideTextMark(money)[0]}
			備考 : ${note}
			日付 : ${sY}年${sM}月${sD}日`.trim().replace(/\t/g, '');

		//入力チェック
		if (condition) {
			if (confirm(display_text)) {

				//挿入するデータを作成
				const new_data = {
					date: `${sY}-${sM}-${sD}`,
					detail: detail,
					money: money,
					note: note,
					id: edit_id === null ? self.crypto.randomUUID() : edit_id
				};

				if (edit_id === null) {
					//編集モードでないとき
					DataStore.pushData(new_data, [sY, sM]);
				}else {
					DataStore.editDataById(new_data, edit_id);
				}

				alert('記録しました。');
				this.toggleDisplay();
			}
		} else {
			this.resetForm();
			alert('不正な入力です。');
		}
	}

	//deleteボタンが押されたら
	static sendDelete(e) {
		e.preventDefault();

		//id取得
		const id = document.getElementById('edit_area')?.dataset.editId || null;
		if (id && confirm('データを削除します。\nよろしいですか。')) {
			DataStore.removeDataById(id);
			alert('削除しました。');
			this.toggleDisplay();
		}


	}

	//文字列エスケープ
	static escapeHTML(str = '') {
		const div = document.createElement('div');
		div.textContent = str;
		return div.innerHTML;
	}

}

//初期設定
const setup = (function() {
	//表側
	const selector_table = document.getElementById('month_selector');
	const lab_selector_table = document.getElementById('lab_month_selector');

	lab_selector_table.addEventListener('click', show_pop);
	lab_selector_table.addEventListener('keydown', show_pop);
	selector_table.addEventListener('change', change_selector);

	//編集画面側
	const selector_edit = document.getElementById('input_date_edit');
	const lab_selector_edit = document.getElementById('lab_input_date');

	lab_selector_edit.addEventListener('click', show_pop);
	lab_selector_edit.addEventListener('keydown', show_pop);
	selector_edit.addEventListener('change', change_selector);

	//送信ボタン
	const submit_btn = document.getElementById('btn_submit');
	submit_btn.addEventListener('click', (e) => UIManager.sendForm(e));

	const delete_btn = document.getElementById('btn_delete');
	delete_btn.addEventListener('click', (e) => UIManager.sendDelete(e));

	//表並び替え
	const select_sort_order = document.getElementById('sort_order');
	select_sort_order.addEventListener('change', create_tables);

	//表示・非表示
	const minus_checked = document.getElementById('minus_checked');
	const plus_checked = document.getElementById('plus_checked');

	minus_checked.addEventListener('change', create_tables);
	plus_checked.addEventListener('change', create_tables);

	//ページ読み込み時 表側カレンダー初期設定
	const month_data = DataStore.getSelectedMonth();
	const month_formated = month_data.map(i => String(i).padStart(2, '0'));
	UIManager.setCalendar(month_formated, 'table');

	//ページ読み込み時 編集画面側カレンダー初期設定
	UIManager.setCalendar(DataStore.getNow(), 'edit');

	//表作成(両方)
	create_tables();

	//編集画面,表画面切り替え
	const btn_to_edit = document.getElementById('btn_transition_edit');
	const btn_to_table = document.getElementById('btn_transition_table');

	edit_area.classList.add('is-hidden');
	btn_to_edit.addEventListener('click', () => UIManager.toggleDisplay());
	btn_to_table.addEventListener('click', () => UIManager.toggleDisplay());

	//ポップアップを表示
	function show_pop(e) {
		const obj = e.currentTarget.control;
		if (obj && 'showPicker' in obj) {
			switch (e.type) {
			case 'keydown':
				if (e.key === 'Enter') {
					return obj.showPicker();
				}else {
					return;
				}
				break;
			case 'click':
				return obj.showPicker();
				break;
			}
		}
	}

	//labelを更新
	function change_selector(e) {
		const selector = e.currentTarget;
		const label = selector.labels[0];
		let selected_date = selector.value.split('-').map(i => String(i).padStart(2, '0'));
		const size = selected_date.length;
		let label_text = size === 2 ? '-年-月':'-年-月-日';

		if (selector.value) {

			if (size === 2) {
				label_text = `${selected_date[0]}年${selected_date[1]}月`;
				selected_date = selected_date.map(i => Number(i));

				//表更新
				create_tables(selected_date);
			}else if (size === 3) {

				label_text = `${selected_date[0]}年${selected_date[1]}月${selected_date[2]}日`;
			}
		}
		label.textContent = label_text;
	}

})();

//表作成(両方)
function create_tables(arg_date) {
	//表を作成する月
	if (arg_date) UIManager.setCalendar(arg_date, 'table');
	let create_month = UIManager.getCalendar('table');
	const create_date = new Date(
		create_month[0],
		create_month[1] - 1,
		1
	);

	//データ取得
	const data = DataStore.getJsonData();

	//表タイトル変更(月,年)
	const table_title = document.getElementById('table_title');
	const month_upper = (new Intl.DateTimeFormat('en-US', { month: 'long' }).format(create_date)).toUpperCase();
	const year_short = create_date.getFullYear().toString().slice(-2);
	const title_text = `${month_upper} '${year_short}`;
	table_title.textContent = title_text;
	
	//表を作成する月が今月ならマーカー
	const [sY,sM] = [
		create_date.getFullYear(),
		create_date.getMonth() + 1
	];
	const [nY,nM] = DataStore.getNow();
	const condition = sY === nY && sM === nM;
	table_title.classList.remove('marker-main-color');
	if (condition) {
		table_title.classList.add('marker-main-color');
	}

	//既に生成された表を削除
	document.querySelectorAll('#tbody_money > tr:has(td)').forEach(i => i.remove());
	document.querySelectorAll('.month-table tbody td[id]').forEach(i => i.innerHTML = '');

	//表を作成
	create_money_table(data, create_month);
	create_month_table(data, create_month);
}

//一覧表作成
function create_money_table(data, month) {
	const money_table_body = document.getElementById('tbody_money');
	const month_key = month.map(i => String(i).padStart(2, '0')).join('-');

	//データがあるかどうか
	let selected_data = null;
	if (data && Object.hasOwn(data, month_key)) {
		selected_data = month_key;
	}

	if (selected_data !== null && data[selected_data].length > 0) {

		//並べ替え順取得
		const sort_order = document.getElementById('sort_order').value;
		let sorted_data = data[selected_data];
		switch (sort_order) {
		case 'added':
			sorted_data = data[selected_data].toSorted(() => 0);
			break;
		case 'date_ascending':
			sorted_data = data[selected_data].toSorted((a, b) => a.date.localeCompare(b.date));
			break;
		case 'date_descending':
			sorted_data = data[selected_data].toSorted((a, b) => b.date.localeCompare(a.date));
			break;
		case 'amount_ascending':
			sorted_data = data[selected_data].toSorted((a, b) => Number(a.money) - Number(b.money));
			break;
		case 'amount_descending':
			sorted_data = data[selected_data].toSorted((a, b) => Number(b.money) - Number(a.money));
			break;
		}

		//表示・非表示
		const minus_checked = document.getElementById('minus_checked');
		const plus_checked = document.getElementById('plus_checked');
		if (minus_checked.checked) {
			//支出を表示しない(収入のみ)
			sorted_data = sorted_data.filter(i => Number(i.money) >= 0);
		}
		if (plus_checked.checked) {
			//収入を表示しない(支出のみ)
			sorted_data = sorted_data.filter(i => Number(i.money) <= 0);
		}

		for (const i of sorted_data) {
			//行を作成
			const row = document.createElement('tr');

			for (const p in i) {
				//これ以外のプロパティは無視
				const use_key = ['date', 'detail', 'money'];
				if (use_key.includes(p)) {
					const td = document.createElement('td');
					switch (p) {
						case 'date':{
							//日付のテキスト作成
							const date_span = document.createElement('span');
							const [iY, iM, iD] = i[p].split('-').map(i => Number(i));
							const date = new Date(iY, iM - 1, iD);
							const date_text = `${date.getMonth() + 1}/${date.getDate()}`;
							date_span.textContent = date_text;
							date_span.classList.add('edit-btn-date');
							//日付をクリックすると編集画面へ
							date_span.addEventListener('click', e => {
								UIManager.toggleDisplay(i['id']);
							});
							td.appendChild(date_span);
							td.classList.add('money-td-date');
							break;
						}
						case 'detail':{
							const detail_span = document.createElement('span');
							detail_span.textContent = i[p];
							detail_span.classList.add('detail-btn');
							const [iY, iM, iD] = i['date'].split('-');
							//日付をクリックすると編集画面へ
							detail_span.addEventListener('click', e => {
								alert(`
									内容：${i['detail']}
									金額：${UIManager.decideTextMark(i['money'])[0]}
									備考：${i['note']}
									日付：${iY}年${iM}月${iD}日
								`.trim().replace(/\t/g, ''));
							});

							td.appendChild(detail_span);
							td.classList.add('money-td-detail');
							break;
						}
						case 'money':
							//符号,マーカーの色決定
							const line_span = document.createElement('span');
							const [text, mark] = UIManager.decideTextMark(i[p]);
							//金額のテキスト作成 spanを挟む
							line_span.textContent = text;
							mark && line_span.classList.add(mark);
							td.appendChild(line_span);
							td.classList.add('money-td-money');
							break;

						default:
							//それ以外はそのまま
							td.textContent = i[p];
							break;
					}
					row.appendChild(td);
				}
			}
			//行を追加
			money_table_body.appendChild(row);
		}
	}

	if (money_table_body.childElementCount <= 1) {
		//データがない場合
		const row = document.createElement('tr');
		const td = document.createElement('td');

		td.colSpan = 3;
		td.textContent = 'データがありません。';
		td.classList.add('text-light');

		row.appendChild(td);
		money_table_body.appendChild(row);
	}
}

//集計表作成
function create_month_table(data, month) {
	const month_key = month.map(i => String(i).padStart(2, '0')).join('-');

	//データがあるかどうか
	let selected_data = null;
	if (data && Object.hasOwn(data, month_key)) {
		selected_data = month_key;
	}

	//各セル取得
	const td_month_income_amount = document.getElementById('td_month_income_amount');
	const td_month_income_mom = document.getElementById('td_month_income_mom');
	const td_month_expense_amount = document.getElementById('td_month_expense_amount');
	const td_month_expense_mom = document.getElementById('td_month_expense_mom');
	const td_month_difference_amount = document.getElementById('td_month_difference_amount');
	const td_month_difference_mom = document.getElementById('td_month_difference_mom');

	//選択月表示
	document.querySelectorAll('span.span-td-month').forEach(i => i.textContent = month[1]);

	//データMapへ
	const both_data = new Map([
		[td_month_income_amount, null],
		[td_month_expense_amount, null],
		[td_month_difference_amount, null],
		[td_month_income_mom, null],
		[td_month_expense_mom, null],
		[td_month_difference_mom, null]
	]);

	//今月のデータがあるとき
	if (selected_data !== null && data[selected_data].length > 0) {

		//選択月の収入,支出,収支差額計算
		const [income_amount, expense_amount, difference_amount] = count_amount(selected_data);

		//テキスト追加用<span>作成
		const span_income_amount = document.createElement('span');
		const span_expense_amount = document.createElement('span');
		const span_difference_amount = document.createElement('span');

		//テキスト挿入
		create_money_text(span_income_amount, income_amount);
		create_money_text(span_expense_amount, expense_amount);
		create_money_text(span_difference_amount, difference_amount);

		both_data.set(td_month_income_amount, span_income_amount)
		.set(td_month_expense_amount, span_expense_amount)
		.set(td_month_difference_amount, span_difference_amount);

		//先月を取得
		const last_month_date = new Date(
			month[0],
			month[1] - 1,
			1
		);
		last_month_date.setMonth(last_month_date.getMonth() - 1);

		const [last_y, last_m] = [
			last_month_date.getFullYear(),
			last_month_date.getMonth() + 1
		];
		const last_month = [last_y, last_m].map(i => String(i).padStart(2, '0')).join('-');

		//先月のデータがあるか。
		if (Object.hasOwn(data, last_month) && data[last_month].length > 0) {
			//前月の収入,支出,収支差額計算
			const [last_income_amount, last_expense_amount, last_difference_amount] = count_amount(last_month);

			//差額計算
			const income_mom = Math.abs(income_amount) - Math.abs(last_income_amount);
			const expense_mom = Math.abs(expense_amount) - Math.abs(last_expense_amount);
			const difference_mom = difference_amount - last_difference_amount;

			//差額用<span>作成
			const span_income_mom = document.createElement('span');
			const span_expense_mom = document.createElement('span');
			const span_difference_mom = document.createElement('span');

			//テキスト挿入
			create_money_text(span_income_mom , income_mom);
			create_money_text(span_expense_mom, expense_mom, true);
			create_money_text(span_difference_mom, difference_mom);

			both_data.set(td_month_income_mom, span_income_mom)
			.set(td_month_expense_mom, span_expense_mom)
			.set(td_month_difference_mom, span_difference_mom);
		}
	}

	//spanか'-'挿入
	both_data.forEach((val, key) => {
		if (val !== null) {
			key.appendChild(val);
		}else {
			key.textContent = '-';
		}
	});

	//収入,支出,差額を計算
	function count_amount(data_kay) {
		let plus = 0;
		let minus = 0;
		let plus_minus = 0;
		for (const obj of data[data_kay]) {
			for (const i in obj) {
				if (i === 'money') {
					if (obj[i] >= 0) {
						plus += Number(obj[i]);
					}else {
						minus += Number(obj[i]);
					}
				}
			}
		}
		plus_minus = plus + minus;
		return [plus, minus, plus_minus];
	}

	//金額用テキストを作って挿入
	function create_money_text(element, money, reverse = false) {
		const [text, mark] = UIManager.decideTextMark(money, reverse);
		element.textContent = text;
		mark && element.classList.add(mark);
	}
}