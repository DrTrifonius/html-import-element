class HTMLImport extends HTMLElement {
	async connectedCallback() {
		// src should contain a relative link to the HTML file
		const htmlSrc = this.getAttribute("src");
		// root indicates the element whose children should be cloned (e.g. body)
		const rootSelector = this.getAttribute("root");

		// fetch the content
		const htmlResult = await fetch(htmlSrc);
		if (!htmlResult.ok) {
			// if we ran into an error, fail gracefully
			return;
		}

		const htmlContent = await htmlResult.text();

		// create an empty element to store new DOM
		//09/2025: changed from template to body to facilitate root selection
		const domHolder = document.createElement("body");

		domHolder.innerHTML = htmlContent;

		// if any script tags are added, clone them
		const scripts = domHolder.querySelectorAll("script");
		scripts.forEach((script) => {
			// Clone the script node
			const clonedScript = document.createElement("script");
			[...script.attributes].forEach((attr) =>
				clonedScript.setAttribute(attr.name, attr.value)
			);
			clonedScript.textContent = script.textContent;

			// replace the original script tag with this new one (which will cause it to trigger)
			script.parentNode.replaceChild(clonedScript, script);
		});

		// replace this tag with the new content
		if (
			rootSelector &&
			//outer html and body tags get dropped automatically, as neither can be contained by a <body> tag, so they would crash
			!(rootSelector === "body" || rootSelector === "html")
		) {
			this.replaceWith(...domHolder.querySelector(rootSelector).childNodes);
		} else {
			this.replaceWith(...domHolder.childNodes);
		}
	}
}

customElements.define("html-import", HTMLImport);
