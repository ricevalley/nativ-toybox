//↓ fontawesome_kit_path
const fontawesome_kit_path = '';
if (!fontawesome_kit_path) console.error('Edit \'/common/common.js\' and import fontawesome.');

class Header extends HTMLElement {
	connectedCallback() {
		this.innerHTML = `
			<header>
				<p class="header-title"><a href="./" tabindex="-1">${typeof commonset_header_title !== 'undefined' ? commonset_header_title : 'not-set'}</a></p>
				${
					typeof header_enable !== 'undefined' && header_enable === true ?
					`<p class="header-links">
						<a href="/" tabindex="-1">TOP</a>
					</p>`:''
				}
			</header>
		`;
	}
}

class Footer extends HTMLElement {
	connectedCallback() {
		this.innerHTML = `
			<footer>
				<div class="links">
					<p><a href="/">TOP</a></p>
				</div>
				<p>© 2026 ricevalley</p>
			</footer>`;
	}
}

window.addEventListener('DOMContentLoaded', () => {
	customElements.define('set-header', Header);
	customElements.define('set-footer', Footer);

	//head
	const common_head = `
		<title>${typeof commonset_page_title !== 'undefined' ? commonset_page_title : 'not-set | Not-set'}</title>
		<link rel="icon" type="image/png" sizes="48x48" href="/src/icons/icon-48.png">
		<link rel="icon" type="image/png" sizes="72x72" href="/src/icons/icon-72.png">
		<link rel="icon" type="image/png" sizes="96x96" href="/src/icons/icon-96.png">
		<link rel="icon" type="image/png" sizes="128x128" href="/src/icons/icon-128.png">
		<link rel="icon" type="image/png" sizes="192x192" href="/src/icons/icon-192.png">
		<link rel="icon" type="image/png" sizes="256x256" href="/src/icons/icon-256.png">
		<link rel="icon" type="image/png" sizes="512x512" href="/src/icons/icon-512.png">
		<link rel="manifest" href="/manifest.json">
	`;
	document.head.insertAdjacentHTML('beforeend', common_head);

	//fontawesome
	const fontawesome_import = document.createElement('script');
	fontawesome_import.src = fontawesome_kit_path;
	fontawesome_import.crossOrigin = 'anonymous';
	document.head.appendChild(fontawesome_import);

});
