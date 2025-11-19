// Refatoração: cálculo e validações mais dinâmicas e modulares
const PRODUCTS = {
	dtf: {
		tiers: [
			{ max: 10, pricePerMeter: 10 },
			{ max: 30, pricePerMeter: 9 },
			{ max: 100, pricePerMeter: 8 },
		],
		overMessage: "Sob orçamento",
	},
	vinil: { pricePerMeter: 14 },
	placas: { pricePerMeter: 14 },
	lona: { pricePerMeter: 14, ilhosPerMeter: 0.5 },
};

function qs(selector, el = document) {
	return el.querySelector(selector);
}

function qsa(selector, el = document) {
	return Array.from(el.querySelectorAll(selector));
}

function getSelectedProductId() {
	const checked = qs('input[name="tipo_produto"]:checked');
	return checked ? checked.id : null;
}

function formatPrice(value) {
	return value + " €";
}

function calculatePrice(productId, meters, copies = 1, ilhos = false) {
	if (!productId || isNaN(meters) || meters <= 0) return "";
	const product = PRODUCTS[productId];
	if (!product) return "";

	// DTF has tiered pricing
	if (product.tiers) {
		for (const tier of product.tiers) {
			if (meters <= tier.max) {
				return (tier.pricePerMeter * meters * copies).toFixed(2) + " €";
			}
		}
		return product.overMessage || "";
	}

	// Simple per-meter pricing
	let total = (product.pricePerMeter || 0) * meters;
	if (product.ilhosPerMeter && ilhos) total += product.ilhosPerMeter * meters;
	total = total * copies;
	return total.toFixed(2) + " €";
}

// File validation: require PDF and max size per file (2MB default)
function validateFiles(
	files,
	{ maxSizeBytes = 2 * 1024 * 1024, allowedExt = [".pdf"] } = {}
) {
	const errors = [];
	const valid = [];
	for (const f of files) {
		const name = f.name || "";
		const ext = name.slice(name.lastIndexOf(".")).toLowerCase();
		if (!allowedExt.includes(ext)) {
			errors.push(`${name}: formato inválido (${ext})`);
			continue;
		}
		if (f.size > maxSizeBytes) {
			errors.push(
				`${name}: ficheiro demasiado grande (${(f.size / 1024 / 1024).toFixed(
					2
				)} MB)`
			);
			continue;
		}
		valid.push(f);
	}
	return { errors, valid };
}

function showMessage(container, message, { type = "info" } = {}) {
	if (!container) return alert(message);
	console.debug("showMessage called:", { type, message });
	// Prefer native lightweight toast first (works without Bootstrap/jQuery and avoids extension interference)
	try {
		console.debug("Attempting native toast fallback first");
		const tContainer =
			document.getElementById("toastContainer") ||
			(function () {
				const c = document.createElement("div");
				c.id = "toastContainer";
				c.style.position = "fixed";
				c.style.top = "1rem";
				c.style.right = "1rem";
				c.style.zIndex = 1080;
				document.body.appendChild(c);
				return c;
			})();

		const toast = document.createElement("div");
		toast.className = "native-toast";
		toast.style.minWidth = "220px";
		toast.style.marginBottom = "0.5rem";
		toast.style.padding = "0.75rem 1rem";
		toast.style.borderRadius = "4px";
		toast.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
		toast.style.color = "#fff";
		toast.style.opacity = "0";
		toast.style.transition = "opacity 0.25s ease, transform 0.25s ease";
		if (type === "success") toast.style.background = "#28a745";
		else if (type === "error") toast.style.background = "#dc3545";
		else toast.style.background = "#17a2b8";

		toast.innerHTML = `<div style="font-weight:600;margin-bottom:6px;">${
			type === "success" ? "Sucesso" : type === "error" ? "Erro" : "Info"
		}</div><div style="font-size:0.95rem;">${(message + "").replace(
			/\n/g,
			"<br>"
		)}</div>`;
		tContainer.appendChild(toast);
		requestAnimationFrame(() => {
			toast.style.opacity = "1";
			toast.style.transform = "translateY(0)";
		});
		setTimeout(() => {
			toast.style.opacity = "0";
			toast.style.transform = "translateY(-6px)";
			setTimeout(() => {
				try {
					toast.remove();
				} catch (e) {}
			}, 300);
		}, 6000);
		container.innerHTML = `<div class="sr-only">${(message + "").replace(
			/\n/g,
			"<br>"
		)}</div>`;
		return;
	} catch (ex) {
		console.warn("native toast fallback failed", ex);
	}

	// Also update the inline submit feedback area if present (above the submit button)
	try {
		const submitFeedback = qs("#submitFeedback");
		if (submitFeedback) {
			if (type === "success") {
				submitFeedback.innerHTML = `<div class="alert alert-success mb-0" role="alert">${(
					message + ""
				).replace(/\n/g, "<br>")}</div>`;
				// clear after same duration as toast
				setTimeout(() => {
					try {
						submitFeedback.innerHTML = "";
					} catch (e) {}
				}, 6000);
			} else if (type === "error") {
				submitFeedback.innerHTML = `<div class="alert alert-danger mb-0" role="alert">${(
					message + ""
				).replace(/\n/g, "<br>")}</div>`;
				setTimeout(() => {
					try {
						submitFeedback.innerHTML = "";
					} catch (e) {}
				}, 8000);
			} else {
				submitFeedback.innerHTML = `<div class="alert alert-info mb-0" role="status">${(
					message + ""
				).replace(/\n/g, "<br>")}</div>`;
				setTimeout(() => {
					try {
						submitFeedback.innerHTML = "";
					} catch (e) {}
				}, 6000);
			}
		}
	} catch (e) {
		console.warn("Erro ao atualizar submitFeedback:", e);
	}

	// If native toast didn't work for some reason, try Bootstrap/jQuery toast as a fallback
	try {
		if (window.jQuery && jQuery("#formToast").length) {
			const tTitle =
				type === "success"
					? "Sucesso"
					: type === "error"
					? "Erro"
					: "Informação";
			console.debug("Bootstrap toast element found, attempting to show it");
			const $toast = jQuery("#formToast");
			jQuery("#formToastTitle").text(tTitle);
			jQuery("#formToastBody").html((message + "").replace(/\n/g, "<br>"));
			$toast.removeClass("bg-success bg-danger bg-info text-white");
			if (type === "success") $toast.addClass("bg-success text-white");
			else if (type === "error") $toast.addClass("bg-danger text-white");
			else $toast.addClass("bg-info text-white");
			$toast.toast("show");
			container.innerHTML = `<div class="sr-only">${(message + "").replace(
				/\n/g,
				"<br>"
			)}</div>`;
			return;
		}
	} catch (e) {
		console.warn(
			"Erro ao exibir toast de feedback (bootstrap/jQuery) fallback:",
			e
		);
	}

	// final fallback: inline alert
	container.innerHTML = "";
	const alertDiv = document.createElement("div");
	const bsType = type === "error" ? "danger" : type === "info" ? "info" : type;
	alertDiv.className = `alert alert-${bsType} alert-dismissible fade show`;
	alertDiv.setAttribute("role", "alert");
	alertDiv.innerHTML = `
	<div>${(message + "").replace(/\n/g, "<br>")}</div>
	<button type="button" class="close" data-dismiss="alert" aria-label="Close">
		<span aria-hidden="true">&times;</span>
	</button>`;
	container.appendChild(alertDiv);
	try {
		if (window.jQuery && jQuery("#formToast").length) {
			const tTitle =
				type === "success"
					? "Sucesso"
					: type === "error"
					? "Erro"
					: "Informação";
			console.debug("Toast element found, showing toast");
			const $toast = jQuery("#formToast");
			jQuery("#formToastTitle").text(tTitle);
			jQuery("#formToastBody").html((message + "").replace(/\n/g, "<br>"));
			// styling
			$toast.removeClass("bg-success bg-danger bg-info text-white");
			if (type === "success") $toast.addClass("bg-success text-white");
			else if (type === "error") $toast.addClass("bg-danger text-white");
			else $toast.addClass("bg-info text-white");
			$toast.toast("show");
			// also set container text for accessibility/screen readers
			container.innerHTML = `<div class="sr-only">${(message + "").replace(
				/\n/g,
				"<br>"
			)}</div>`;
			return;
		}
	} catch (e) {
		console.warn("Erro ao exibir toast de feedback", e);
	}

	try {
		if (window.jQuery && jQuery("#formToast").length) {
			const tTitle =
				type === "success"
					? "Sucesso"
					: type === "error"
					? "Erro"
					: "Informação";
			console.debug("Toast element found, showing toast");
			const $toast = jQuery("#formToast");
			jQuery("#formToastTitle").text(tTitle);
			jQuery("#formToastBody").html((message + "").replace(/\n/g, "<br>"));
			// styling
			$toast.removeClass("bg-success bg-danger bg-info text-white");
			if (type === "success") $toast.addClass("bg-success text-white");
			else if (type === "error") $toast.addClass("bg-danger text-white");
			else $toast.addClass("bg-info text-white");
			$toast.toast("show");
			// also set container text for accessibility/screen readers
			container.innerHTML = `<div class="sr-only">${(message + "").replace(
				/\n/g,
				"<br>"
			)}</div>`;
			return;
		}
	} catch (e) {
		console.warn("Erro ao exibir toast de feedback (bootstrap/jQuery):", e);
	}

	// Native fallback toast (lightweight)
	try {
		const tContainer =
			document.getElementById("toastContainer") ||
			(function () {
				const c = document.createElement("div");
				c.id = "toastContainer";
				c.style.position = "fixed";
				c.style.top = "1rem";
				c.style.right = "1rem";
				c.style.zIndex = 1080;
				document.body.appendChild(c);
				return c;
			})();

		const toast = document.createElement("div");
		toast.className = "native-toast";
		toast.style.minWidth = "220px";
		toast.style.marginBottom = "0.5rem";
		toast.style.padding = "0.75rem 1rem";
		toast.style.borderRadius = "4px";
		toast.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
		toast.style.color = "#fff";
		toast.style.opacity = "0";
		toast.style.transition = "opacity 0.25s ease, transform 0.25s ease";
		if (type === "success") toast.style.background = "#28a745";
		else if (type === "error") toast.style.background = "#dc3545";
		else toast.style.background = "#17a2b8";

		toast.innerHTML = `<div style="font-weight:600;margin-bottom:6px;">${
			type === "success" ? "Sucesso" : type === "error" ? "Erro" : "Info"
		}</div><div style="font-size:0.95rem;">${(message + "").replace(
			/\n/g,
			"<br>"
		)}</div>`;
		tContainer.appendChild(toast);
		requestAnimationFrame(() => {
			toast.style.opacity = "1";
			toast.style.transform = "translateY(0)";
		});
		setTimeout(() => {
			toast.style.opacity = "0";
			toast.style.transform = "translateY(-6px)";
			setTimeout(() => {
				try {
					toast.remove();
				} catch (e) {}
			}, 300);
		}, 6000);
		container.innerHTML = `<div class="sr-only">${(message + "").replace(
			/\n/g,
			"<br>"
		)}</div>`;
		return;
	} catch (ex) {
		console.warn("native toast fallback failed", ex);
	}
}

// Submit handler (async) - separated from showMessage
async function handleSubmit(event) {
	if (event && typeof event.preventDefault === "function")
		event.preventDefault();
	const form = qs("#encomenda");
	const submitBtn =
		qs('#encomenda button[type="button"], #encomenda button[type="submit"]') ||
		qs("#encomenda button.btn");
	const messageContainer = qs("#formMessage");

	const productId = getSelectedProductId();
	const copias = parseInt(qs("#copias").value, 10) || 1;
	const metros = parseFloat(qs("#metros").value);
	const ilhos = !!qs("#ilhos").checked;

	// Basic validation
	if (!form.checkValidity()) {
		form.classList.add("was-validated");
		return showMessage(
			messageContainer,
			"Por favor preencha todos os campos obrigatórios.",
			{ type: "error" }
		);
	}
	if (!productId)
		return showMessage(
			messageContainer,
			"Por favor selecione um tipo de impressão.",
			{ type: "error" }
		);
	if (isNaN(metros) || metros <= 0)
		return showMessage(
			messageContainer,
			"Insira um valor válido para metros.",
			{ type: "error" }
		);

	const fileInput = qs("#fileInput");
	const { errors, valid } = validateFiles(Array.from(fileInput.files));
	if (errors.length)
		return showMessage(
			messageContainer,
			"Problemas com ficheiros:\n" + errors.join("\n"),
			{ type: "error" }
		);

	const formData = new FormData();
	formData.append("tipo_produto", productId);
	formData.append("copias", copias);
	formData.append("metros", metros);
	formData.append("ilhos", ilhos);
	["nome", "email", "contacto", "morada", "cp", "metodo"].forEach((id) => {
		const el = qs("#" + id);
		formData.append(id, el ? el.value : "");
	});
	valid.forEach((f) => formData.append("arquivo", f));

	try {
		if (submitBtn) {
			submitBtn.disabled = true;
			submitBtn.textContent = "Enviando...";
		}
		const res = await fetch("http://localhost:3000/enviar-email", {
			method: "POST",
			body: formData,
		});
		if (!res.ok) {
			const text = await res.text();
			// Log full server response for debugging, but show a concise message to user
			console.error("Server returned error response:", text);
			showMessage(
				messageContainer,
				"Erro ao enviar o pedido. Verifique os dados e tente novamente (detalhes no console).",
				{ type: "error" }
			);
			return;
		}
		showMessage(
			messageContainer,
			"Pedido enviado com sucesso! Iremos contactá-lo em breve.",
			{ type: "success" }
		);
		// Optionally read response text (success message)
		try {
			const bodyText = await res.text();
			console.info("Server response:", bodyText);
		} catch (e) {
			/* ignore */
		}
		form.reset();
		qs("#valor").textContent = "";
	} catch (err) {
		showMessage(messageContainer, "Erro ao enviar: " + err.message, {
			type: "error",
		});
	} finally {
		if (submitBtn) {
			submitBtn.disabled = false;
			submitBtn.textContent = "Solicitar Orçamento";
		}
	}

	return false;
}

document.addEventListener("DOMContentLoaded", () => {
	const metrosInput = qs("#metros");
	const copiasInput = qs("#copias");
	const ilhosInput = qs("#ilhos");
	const valorSpan = qs("#valor");
	const radios = qsa('input[name="tipo_produto"]');
	const ilhosRow = qs("#ilhossRow");
	const fileInput = qs("#fileInput");
	const fileListElId = "fileList";

	// show/hide ilhós row depending on selection
	function updateIlhosVisibility() {
		const pid = getSelectedProductId();
		if (pid === "lona") {
			ilhosRow.style.display = "block";
		} else {
			ilhosRow.style.display = "none";
			ilhosInput.checked = false;
		}
	}

	function updatePriceDisplay() {
		const pid = getSelectedProductId();
		const meters = parseFloat(metrosInput.value);
		const copies = parseInt(copiasInput.value, 10) || 1;
		const ilhos = !!ilhosInput.checked;
		const text = calculatePrice(pid, meters, copies, ilhos);
		valorSpan.textContent = text;
	}

	// file input preview and validation
	function updateFileList() {
		let list = qs("#" + fileListElId);
		if (!list) {
			list = document.createElement("div");
			list.id = fileListElId;
			fileInput.parentNode.appendChild(list);
		}
		const files = Array.from(fileInput.files);
		if (files.length === 0) {
			list.textContent = "";
			return;
		}
		const { errors } = validateFiles(files);
		if (errors.length) {
			list.textContent = "Erros: " + errors.join("; ");
			list.style.color = "red";
			return;
		}
		list.style.color = "";
		list.textContent = files
			.map((f) => `${f.name} (${(f.size / 1024 / 1024).toFixed(2)}MB)`)
			.join("\n");
	}

	// Events
	metrosInput.addEventListener("input", updatePriceDisplay);
	copiasInput.addEventListener("input", updatePriceDisplay);
	ilhosInput.addEventListener("change", updatePriceDisplay);
	radios.forEach((r) =>
		r.addEventListener("change", () => {
			updateIlhosVisibility();
			updatePriceDisplay();
		})
	);
	fileInput.addEventListener("change", updateFileList);
	const formEl = qs("#encomenda");
	// Defensive: ensure form won't perform a real navigation even if JS errors occur
	try {
		formEl.setAttribute("action", "javascript:void(0)");
	} catch (e) {
		console.warn("Não foi possível ajustar atributo action do form", e);
	}

	// Hard override: prevent any native submission or other handlers from causing navigation
	try {
		formEl.onsubmit = function (e) {
			e = e || window.event;
			if (e && typeof e.preventDefault === "function") e.preventDefault();
			if (e && typeof e.stopImmediatePropagation === "function")
				e.stopImmediatePropagation();
			return false;
		};
	} catch (e) {
		console.warn("Não foi possível sobrepor form.onsubmit", e);
	}

	// Use a wrapper to guarantee preventDefault and catch handler errors
	formEl.addEventListener("submit", function (evt) {
		try {
			evt.preventDefault();
			// call our async handler and catch any rejection to avoid unhandled promise
			void handleSubmit(evt).catch((err) => {
				console.error("Erro async no handler de submissão:", err);
				const messageContainer = qs("#formMessage");
				showMessage(
					messageContainer,
					"Ocorreu um erro ao processar o envio. Verifique o console para detalhes.",
					{ type: "error" }
				);
			});
		} catch (err) {
			console.error("Erro no handler de submissão:", err);
		}
	});

	// Fallback: also intercept click on submit button
	const submitBtn =
		qs('#encomenda button[type="button"], #encomenda button[type="submit"]') ||
		qs("#encomenda button.btn");
	if (submitBtn) {
		submitBtn.addEventListener("click", function (evt) {
			try {
				evt.preventDefault();
				void handleSubmit(evt).catch((err) => {
					console.error("Erro async no click do submit:", err);
					const messageContainer = qs("#formMessage");
					showMessage(
						messageContainer,
						"Ocorreu um erro ao processar o envio. Verifique o console para detalhes.",
						{ type: "error" }
					);
				});
			} catch (err) {
				console.error("Erro no click do submit:", err);
			}
		});
	}

	// Global handler to capture any unhandled promise rejections and show friendly message
	window.addEventListener("unhandledrejection", function (event) {
		console.error("Unhandled promise rejection:", event.reason);
		try {
			const messageContainer = qs("#formMessage");
			showMessage(
				messageContainer,
				"Ocorreu um erro inesperado. Por favor verifique o console para detalhes.",
				{ type: "error" }
			);
		} catch (e) {
			console.warn("Não foi possível mostrar mensagem de erro global:", e);
		}
	});

	// initialize
	updateIlhosVisibility();
	updatePriceDisplay();
});
