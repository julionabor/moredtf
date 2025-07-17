
    
    document.getElementById("onSubmit").addEventListener("submit", async function(e) {
       e.preventDefault();
       
           // Obter tipo de impressão (pegando todos os radio inputs marcados)
           const tipoImpressao = Array.from(form.querySelectorAll('input[type="radio"]:checked')).map(input => input.nextElementSibling.innerText.trim()).join(', ');
       
           // Obter outros campos
           const copias = form.querySelector('#inputPatientName').value;
           const nome = form.querySelector('#nome').value;
           const nif = form.querySelector('#nif').value;
           const contacto = form.querySelector('#contacto').value;
           const morada = form.querySelector('#morada').value;
           const codigoPostal = form.querySelector('#codigo-postal').value;
           const metodoPagamento = form.querySelector('select[name="metodo-pagamento"]').value;
       
           // Criar objeto com os dados
           const templateParams = {
             tipo_impressao: tipoImpressao,
             copias: copias,
             nome: nome,
             nif: nif,
             contacto: contacto,
             morada: morada,
             codigo_postal: codigoPostal,
             metodo_pagamento: metodoPagamento
           };
    
      const formData = new FormData(templateParams);
      console.log(formData )
      try {
        const response = await fetch("http://localhost:3000/enviar-email", {
          method: "POST",
          body: formData
        });
    
        const result = await response.text();
        alert(result);
      } catch (error) {
        console.error("Erro ao enviar:", error);
        alert("Erro ao enviar o formulário.");
      }
    });