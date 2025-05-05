document.getElementById('meu-formulario').addEventListener('submit', function(e) {
    e.preventDefault();

    const form = e.target;

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

    emailjs.send('service_8p2hn7o', 'template_9xbi639', templateParams)
      .then(function(response) {
         alert('Email enviado com sucesso!');
      }, function(error) {
         alert('Falha ao enviar email: ' + error.text);
      });
  });