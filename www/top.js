const dir_info_json = './toybox/directory_info.json';

fetch_dir_info().then(res => {
	const background = document.getElementById('background_toybox');
	for (const i in res) {
		let button_path = `./toybox/${res[i]['path']}`;
		button_path = button_path.split('/').slice(0, -1).join('/') + '/';

		check_link(button_path).then(result => {
				if (result) {
				const button_html = `
				<a class="app-button-a" href="${button_path}">
				<div class="app-button">
					<div class="app-title-area">
						<p class="app-title">${i}</p>
					</div>
					<hr class="hr-app-button">
					<div class="app-text-area">
						<p class="app-text">${res[i]['description'] !== undefined ? res[i]['description'] : '説明がありません。'}</p>
					</div>
				</div>`;

				background.insertAdjacentHTML('afterbegin', button_html);
			}
		});
	}
});

async function fetch_dir_info() {
	try {
		const res = await fetch(dir_info_json);
		if (!res.ok) {
			throw new Error(`error status: ${res.status}`);
		}

		return await res.json();
	} catch (e) {
		console.error(e);
	}
}

async function check_link(url) {
	if (url !== undefined) {
		try {
			const res = await fetch(url, {method: 'HEAD'});

			if (res.ok) {
				return true;
			} else {
				return false;
			}
		} catch (e) {
			return false;
		}
	} else {
		return false;
	}
}