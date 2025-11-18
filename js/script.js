// document.getElementById("onSubmit").addEventListener("submit", async function(e) {
//    e.preventDefault();

//        // Obter tipo de impressão (pegando todos os radio inputs marcados)
//        const tipoImpressao = Array.from(form.querySelectorAll('input[type="radio"]:checked')).map(input => input.nextElementSibling.innerText.trim()).join(', ');

//        // Obter outros campos
//        const copias = form.querySelector('#inputPatientName').value;
//        const nome = form.querySelector('#nome').value;
//        const nif = form.querySelector('#nif').value;
//        const contacto = form.querySelector('#contacto').value;
//        const morada = form.querySelector('#morada').value;
//        const codigoPostal = form.querySelector('#codigo-postal').value;
//        const metodoPagamento = form.querySelector('select[name="metodo-pagamento"]').value;

//        // Criar objeto com os dados
//        const templateParams = {
//          tipo_impressao: tipoImpressao,
//          copias: copias,
//          nome: nome,
//          nif: nif,
//          contacto: contacto,
//          morada: morada,
//          codigo_postal: codigoPostal,
//          metodo_pagamento: metodoPagamento
//        };

//   const formData = new FormData(templateParams);
//   console.log(formData )
//   try {
//     const response = await fetch("http://localhost:3000/enviar-email", {
//       method: "POST",
//       body: formData
//     });

//     const result = await response.text();
//     alert(result);
//   } catch (error) {
//     console.error("Erro ao enviar:", error);
//     alert("Erro ao enviar o formulário.");
//   }
// });

//  const stripe = Stripe("pk_test_51RLppmQtQsfEFAD0ioNM9JtH587KNrszmVcgjBg5ZIlOevyiuuIdHdIZBrV1nkLxKYYqy3uFeDEZyqB2KLhp5nWS00bvQvaOJW");

//     document.getElementById("checkout-button").addEventListener("click", () => {
//       fetch("http://localhost:4242/create-checkout-session", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//       })
//         .then((res) => {res.json()
//             console.log("res",res)
//         })
//         .then((data) => stripe.redirectToCheckout({ sessionId: data.id }));
//     });

// ////////////////////
async function handleSubmit(e) {
	e.preventDefault(); // Evita o envio padrão do formulário
	console.log(e);
	const form = e.target;
	const formData = new FormData();

	// 🖨️ Impressões (coleta todos os inputs type="radio" que estiverem marcados)
	const impressoesSelecionadas = form.querySelectorAll(
		'input[type="radio"]:checked'
	);
	impressoesSelecionadas.forEach((input, index) => {
		formData.append(`impressao_${index + 1}`, input.id);
	});

	// 🗃️ Quantidade de cópias
	const copias = form.querySelector("#inputPatientName").value;
	formData.append("copias", copias);

	// 📂 Ficheiros
	const ficheiros = form.querySelector("#fileInput").files;
	for (let i = 0; i < ficheiros.length; i++) {
		formData.append("ficheiros[]", ficheiros[i]);
	}

	// 👤 Dados pessoais
	formData.append("nome", form.querySelector("#nome").value);
	formData.append("nif", form.querySelector("#nif").value);
	formData.append("contacto", form.querySelector("#contacto").value);
	formData.append("morada", form.querySelector("#morada").value);
	formData.append("codigo_postal", form.querySelector("#codigo-postal").value);

	// 💰 Método de pagamento
	const pagamento = form.querySelector('select[name="metodo-pagamento"]').value;
	formData.append("metodo_pagamento", pagamento);

	// 🛰️ Enviar para o backend (porta 4242)
	console.log(formData);
	try {
	  const response = await fetch('http://localhost:4242/create-checkout-session', {
	    method: 'POST',
	    body: formData,
      'Access-Control-Allow-Origin': '*'

	  });

	  if (!response.ok) {
	    throw new Error(`Erro: ${response.status}`);
	  }

	  const result = await response.json();
	  console.log(result)
	  alert('Pedido enviado com sucesso!');
	  console.log(result);
	} catch (error) {
	  console.error('Erro ao enviar o pedido:', error);
	  alert('Erro ao submeter o pedido.');
	}
}
// calcular custo estimado

document.addEventListener("DOMContentLoaded", function () {

  const metrosInput = document.getElementById("metros");
  const copiasInput = document.getElementById("copias");
  const ilhosInput = document.getElementById("ilhos");
  const valorSpan = document.getElementById("valor");
  const radios = document.querySelectorAll('input[name="tipo_produto"]');
  const ilhosRow = document.getElementById("ilhossRow");

  function atualizarIlhos() {
    const tipo = document.querySelector('input[name="tipo_produto"]:checked');
    if (tipo && tipo.id === "lona") {
      ilhosRow.style.display = "block";
    } else {
      ilhosRow.style.display = "none";
      ilhosInput.checked = false; // desmarca se não for lona
    }
  }

  function calcularValor() {
    const tipo = document.querySelector('input[name="tipo_produto"]:checked');
    const metros = parseFloat(metrosInput.value);
    const copias = parseInt(copiasInput.value) || 1;
    const ilhos = ilhosInput.checked;

    if (!tipo || isNaN(metros) || metros <= 0) {
      valorSpan.textContent = "";
      return;
    }

    let total = 0;

    switch (tipo.id) {
      case "dtf":
        if (metros <= 10) total = metros * 10;
        else if (metros <= 30) total = metros * 9;
        else if (metros <= 100) total = metros * 8;
        else {
          valorSpan.textContent = "Sob orçamento";
          return;
        }
        break;

      case "vinil":
        total = metros * 14;
        break;

      case "placas":
        total = metros * 14;
        break;

      case "lona":
        total = metros * 14;
        if (ilhos) total += metros * 0.5;
        break;

      default:
        valorSpan.textContent = "";
        return;
    }

    if (copias > 0) total = total * copias;
    valorSpan.textContent = total.toFixed(2) + " €";
  }

  // Eventos
  metrosInput.addEventListener("blur", calcularValor);
  copiasInput.addEventListener("change", calcularValor);
  ilhosInput.addEventListener("change", calcularValor);
  radios.forEach(radio => {
    radio.addEventListener("change", function () {
      atualizarIlhos();
      calcularValor();
    });
  });

  // Inicializa ilhós escondido
  atualizarIlhos();

});





