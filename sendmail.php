<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'PHPMailer/src/Exception.php';
require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';

header('Content-Type: application/json');

$empresa_email = "moreofthesame19@gmail.com";
$empresa_nome = "More DTF";

try {
    // Recebendo dados do formulário
    $tipo_produto = $_POST['tipo_produto'] ?? '';
    $copias = $_POST['copias'] ?? '';
    $metros = $_POST['metros'] ?? '';
    $ilhos = isset($_POST['ilhos']) ? "Sim" : "Não";
    $custo_estimado = $_POST['valor_hidden'] ?? '';

    $nome = $_POST['nome'] ?? '';
    $email = $_POST['email'] ?? '';
    $contacto = $_POST['contacto'] ?? '';
    $morada = $_POST['morada'] ?? '';
    $cp = $_POST['cp'] ?? '';
    $metodo = $_POST['metodo'] ?? '';

    // Função para gerar template HTML
    function generateEmailHTML($title, $content) {
        return "
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; background: #f9f9f9; }
                h2 { color: #28a745; }
                table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                td { padding: 6px; border-bottom: 1px solid #ddd; }
                .footer { margin-top: 20px; font-size: 0.9rem; color: #555; }
            </style>
        </head>
        <body>
            <div class='container'>
                <h2>$title</h2>
                $content
                <div class='footer'>More DTF - Seu parceiro em impressões DTF</div>
            </div>
        </body>
        </html>
        ";
    }

    // Conteúdo da empresa
    $content_empresa = "
    <p>Nova solicitação de orçamento:</p>
    <table>
        <tr><td><strong>Tipo de Produto:</strong></td><td>$tipo_produto</td></tr>
        <tr><td><strong>Cópias:</strong></td><td>$copias</td></tr>
        <tr><td><strong>Metros:</strong></td><td>$metros</td></tr>
        <tr><td><strong>Ilhós:</strong></td><td>$ilhos</td></tr>
        <tr><td><strong>Custo Estimado:</strong></td><td>$custo_estimado €</td></tr>
    </table>
    <p><strong>Dados do Cliente:</strong></p>
    <table>
        <tr><td><strong>Nome:</strong></td><td>$nome</td></tr>
        <tr><td><strong>Email:</strong></td><td>$email</td></tr>
        <tr><td><strong>Contacto:</strong></td><td>$contacto</td></tr>
        <tr><td><strong>Morada:</strong></td><td>$morada</td></tr>
        <tr><td><strong>Código Postal:</strong></td><td>$cp</td></tr>
        <tr><td><strong>Método de Pagamento:</strong></td><td>$metodo</td></tr>
    </table>
    ";

    $html_empresa = generateEmailHTML("Nova Solicitação de Orçamento", $content_empresa);

    // Envio para empresa
    $mail = new PHPMailer(true);
    $mail->isSMTP();
    $mail->Host = 'smtp.gmail.com';
    $mail->SMTPAuth = true;
    $mail->Username = 'moreofthesame19@gmail.com';
    $mail->Password = 'thvl etkl gsjj zywl';
    $mail->SMTPSecure = 'tls';
    $mail->Port = 587;

    $mail->setFrom($email, $nome);
    $mail->addAddress($empresa_email, $empresa_nome);
    $mail->isHTML(true);
    $mail->Subject = "Nova Solicitação de Orçamento";
    $mail->Body = $html_empresa;

    // Anexos
    if (!empty($_FILES['arquivo']['name'][0])) {
        foreach ($_FILES['arquivo']['tmp_name'] as $key => $tmp_name) {
            $filename = $_FILES['arquivo']['name'][$key];
            $mail->addAttachment($tmp_name, $filename);
        }
    }

    $mail->send();

    // Conteúdo para cliente
    $content_cliente = "
    <p>Olá <strong>$nome</strong>,</p>
    <p>Recebemos sua solicitação de orçamento com sucesso!</p>
    <table>
        <tr><td><strong>Custo Estimado:</strong></td><td>$custo_estimado €</td></tr>
    </table>
    <p>Em breve entraremos em contato para confirmar os detalhes e iniciar a produção.</p>
    <p>Obrigado por escolher a More DTF!</p>
    ";

    $html_cliente = generateEmailHTML("Confirmação de Orçamento", $content_cliente);

    // Envio para cliente
    $mail_cliente = new PHPMailer(true);
    $mail_cliente->isSMTP();
    $mail_cliente->Host = 'smtp.gmail.com';
    $mail_cliente->SMTPAuth = true;
    $mail_cliente->Username = 'moreofthesame19@gmail.com';
    $mail_cliente->Password = 'thvl etkl gsjj zywl';
    $mail_cliente->SMTPSecure = 'tls';
    $mail_cliente->Port = 587;

    $mail_cliente->setFrom('noreply@graficamsprint.com', 'More DTF');
    $mail_cliente->addAddress($email, $nome);
    $mail_cliente->isHTML(true);
    $mail_cliente->Subject = "Confirmação de Orçamento - More DTF";
    $mail_cliente->Body = $html_cliente;

    $mail_cliente->send();

    echo json_encode([
        'success' => true,
        'message' => 'Orçamento enviado com sucesso!'
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao enviar o email: ' . $e->getMessage()
    ]);
}
