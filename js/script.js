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
async function handleSubmit(event) {
  event.preventDefault();

  const form = document.getElementById("encomenda");
  const formData = new FormData();

  // Seleção do tipo de produto
  const tipoProduto = form.querySelector('input[name="tipo_produto"]:checked');
  formData.append("tipo_produto", tipoProduto ? tipoProduto.id : "");

  // Outros campos
  formData.append("copias", document.getElementById("copias").value);
  formData.append("metros", document.getElementById("metros").value);
  formData.append("ilhos", document.getElementById("ilhos").checked);
  formData.append("nome", document.getElementById("nome").value);
  formData.append("email", document.getElementById("email").value);
  formData.append("contacto", document.getElementById("contacto").value);
  formData.append("morada", document.getElementById("morada").value);
  formData.append("cp", document.getElementById("cp").value);
  formData.append("metodo", document.getElementById("metodo").value);

  // Adicionar arquivos
const arquivos = document.getElementById("fileInput").files;
for (let i = 0; i < arquivos.length; i++) {
  formData.append("arquivo", arquivos[i]);
}

  try {
    const response = await fetch("http://localhost:3000/enviar-email", {
  method: "POST",
  body: formData,
})
	console.log("Fetch concluído", response.status);
    if (response.ok) {
      alert("Email enviado com sucesso!");
      form.reset();
    } else {
      const text = await response.text();
      alert("Erro ao enviar email: " + text);
    }
  } catch (error) {
    alert("Erro ao enviar email: " + error.message);
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





