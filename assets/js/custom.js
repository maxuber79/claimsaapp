// Mensaje de carga del archivo guideline.js en consola con estilo
console.log("%c<<< load guideline.js >>>", "background: blue; color:#ffffff; padding: 2px 5px; font-weight: bold;");

// Espera a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {

	// Asigna la función de la barra de progreso al evento scroll
/* 	window.onscroll = () => {
		myProgressBar();
	}; */

	// Actualiza el ancho de una barra de progreso según el scroll vertical del usuario
	/* const myProgressBar = () => {
		const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
		const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
		const scrolled = (winScroll / height) * 100;
		document.getElementById("myBar").style.width = scrolled + "%";
		console.log(`%c MyBar incremented: ${Math.round(scrolled)}%`, "color: yellow; font-weight: bold;");

	}; */

	// Agrega o remueve una clase al navbar según el scroll del usuario
	/* window.addEventListener("scroll", function () {
		let navbar = document.getElementById("nav");
		if(navbar === null) {

		if (window.scrollY > 70) {
			console.info('%c Se agrega la clase navbar-scroll', 'color: white; background-color: blue; padding: 4px 8px; border-radius: 4px; font-weight: bold;');
			navbar.classList.add("navbar-scroll");
		} else {
			navbar.classList.remove("navbar-scroll");
			console.clear();
			console.info('%c Se quita la clase navbar-scroll', 'color: white; background-color: orange; padding: 4px 8px; border-radius: 4px; font-weight: bold;');
			}
		} else {
			console.info('%c NO esta la clase navbar-scroll', 'color: white; background-color: orange; padding: 4px 8px; border-radius: 4px; font-weight: bold;');
		}
	}); */

	/*
	 * Inicializa todos los elementos <select> con la clase .select2-dynamic
	 * usando el plugin Select2 con tema Bootstrap 5
	 */
	document.querySelectorAll('.select2-dynamic').forEach(select => {
		$(select).select2({
			theme: 'bootstrap-5',
			placeholder: "Selecciona item",
			dropdownAutoWidth: true,
			width: $(this).data('width') ? $(this).data('width') : $(this).hasClass('w-100') ? '100%' : 'style',
			allowClear: true,
			dropdownParent: $(select).parent(),
			templateResult: function (data) {
				if (!data.id) return data.text;
				return $(`<span>${data.text}</span>`);
			},
			templateSelection: function (data) {
				return data.text;
			}
		});
	});

	/*
	 * Maneja la validación de formularios usando validaciones nativas de HTML5
	 */
	var forms = document.getElementsByClassName('needs-validation');
	if (forms.length > 0) {
		Array.prototype.filter.call(forms, function (form) {
			form.addEventListener('submit', function (event) {
				if (form.checkValidity() === false) {
					event.preventDefault();
					event.stopPropagation();
				}
				form.classList.add('was-validated');
			}, false);
		});
	}

	// Selecciona todos los botones que copian texto de color (por clase .copy-button)
	const copyButtons = document.querySelectorAll('.copy-button');

	// Agrega evento de click a cada botón para copiar contenido
	copyButtons.forEach(button => {
		button.addEventListener('click', () => {
			console.log("%c<<< addEventListener >>>", "color: green; font-weight: bold;", button);
			copyContent(button);
		});
	});

	// Copia el valor hexadecimal del color al portapapeles
	function copyContent(button) {
		let colorHex = button.parentNode.querySelector('.sg-color-value').textContent;
		console.log('let colorHex:', colorHex);

		try {
			navigator.clipboard.writeText(colorHex);
			console.log("%cContent copied to clipboard:", "color: green; font-weight: bold;", colorHex);
			showCopySuccessMessage();
		} catch (err) {
			console.error('Failed to copy: ', err);
			showCopyFailureMessage();
		}
	}

	/*
	 * Copia el HTML completo de una tarjeta (.card) al portapapeles, quitando el botón de copia
	 */
	const botones = document.querySelectorAll(".copiar-card-btn");
	console.log("%c Enumerar botones", "color: yellow; font-weight: bold;", botones.length);

	botones.forEach((btn, index) => {
		console.log("%c Botones", "color: yellow; font-weight: bold;", btn);
		btn.addEventListener("click", () => {
			console.log(`%c Click en el botón card #${index + 1}`, "color: yellow; font-weight: bold;");

			const card = btn.parentNode.querySelector('.card');

			if (!card) {
				console.error("No se encontró la card.");
				showCopyFailureMessage();
				return;
			}

			// Clona la tarjeta y elimina los botones de copia
			const cardClonada = card.cloneNode(true);
			const botonesCopiar = cardClonada.querySelectorAll(".copiar-card-btn");
			botonesCopiar.forEach(b => b.remove());

			const htmlLimpio = cardClonada.outerHTML;

			if (!htmlLimpio || htmlLimpio.trim() === "") {
				console.warn("La card está vacía.");
				showCopyFailureMessage();
				return;
			}

			if (!navigator.clipboard) {
				console.error("Clipboard API no disponible.");
				showCopyFailureMessage();
				return;
			}

			navigator.clipboard.writeText(htmlLimpio)
				.then(() => {
					console.log("%c✅ HTML copiado sin botón:", "color: green; font-weight: bold;", htmlLimpio);
					showCopySuccessMessage();
				})
				.catch((err) => {
					console.error("Error al copiar:", err);
					showCopyFailureMessage();
				});
		});
	});

	// Muestra un mensaje de éxito usando SweetAlert2
	function showCopySuccessMessage() {
		Swal.fire({
			title: '✅ HTML copiado al portapapeles',
			icon: 'success',
			timer: 2000,
			timerProgressBar: true,
			showConfirmButton: false
		});
	}

	// Muestra un mensaje de error usando SweetAlert2
	function showCopyFailureMessage() {
		Swal.fire({
			title: '❌ No se pudo copiar',
			text: 'Intenta nuevamente o copia manualmente.',
			icon: 'error',
			showConfirmButton: true
		});
	}

	/* document.getElementById('darkModeToggle').addEventListener('click', (event) => {
		event.preventDefault();
		event.stopPropagation();
		console.log('Activar Dark mode toggle');
		document.body.classList.toggle('dark-mode');
	}); */

	document.querySelectorAll('.copy-button').forEach(button => {
		const colorName = button.previousElementSibling?.textContent?.trim();
		button.setAttribute('aria-label', `Copiar color ${colorName}`);
	});


	const toggle = document.getElementById('darkModeToggle');

	// Cargar preferencia guardada
	const isDarkMode = localStorage.getItem('darkMode') === 'true';

/* 	if (isDarkMode) {
		document.body.classList.add('dark-mode');
		toggle.checked = true;
	}

	toggle.addEventListener('change', () => {
		document.body.classList.toggle('dark-mode', toggle.checked);
		localStorage.setItem('darkMode', toggle.checked);
	}); */

	//const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
	const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
	console.log("%c✅ const tooltipTriggerList:", "color: lime; font-weight: bold;", tooltipTriggerList);
	tooltipTriggerList.forEach(function (tooltipTriggerEl) {
		new bootstrap.Tooltip(tooltipTriggerEl);
		const lorem = new bootstrap.Tooltip(tooltipTriggerEl);
		console.log("%c✅ bootstrap.Tooltip(tooltipTriggerEl):", "color: deeppink; font-weight: bold;", lorem);
	});
});
