<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'PHPMailer/src/Exception.php';
require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';

// Configurações
$empresa_email = "moreofthesame19@gmail.com"; // email da empresa
$empresa_nome = "More DTF";

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

// Cria a mensagem para a empresa
$mensagem_empresa = "
Nova solicitação de orçamento:

Tipo de Produto: $tipo_produto
Cópias: $copias
Metros: $metros
Ilhós: $ilhos
Custo Estimado: $custo_estimado €

Dados do Cliente:
Nome: $nome
Email: $email
Contacto: $contacto
Morada: $morada
Código Postal: $cp
Método de Pagamento: $metodo
";

// PHPMailer para envio para empresa
$mail = new PHPMailer(true);

try {
    // Configuração do servidor SMTP
    $mail->isSMTP();
    $mail->Host = 'smtp.seudominio.com'; // substituir pelo SMTP do host
    $mail->SMTPAuth = true;
    $mail->Username = 'seuemail@seudominio.com'; // seu email SMTP
    $mail->Password = 'sua_senha'; // senha SMTP
    $mail->SMTPSecure = 'tls';
    $mail->Port = 587;

    // Remetente
    $mail->setFrom($email, $nome); // envia com email do cliente para facilitar reply
    $mail->addAddress($empresa_email, $empresa_nome);
    $mail->Subject = "Nova Solicitação de Orçamento";

    // Anexos
    if(isset($_FILES['fileInput'])) {
        foreach($_FILES['fileInput']['tmp_name'] as $key => $tmp_name){
            $filename = $_FILES['fileInput']['name'][$key];
            $mail->addAttachment($tmp_name, $filename);
        }
    }

    // Conteúdo
    $mail->Body = $mensagem_empresa;
    $mail->send();

    // Email de confirmação para o cliente
    $mail_cliente = new PHPMailer(true);
    $mail_cliente->isSMTP();
    $mail_cliente->Host = 'smtp.seudominio.com';
    $mail_cliente->SMTPAuth = true;
    $mail_cliente->Username = 'seuemail@seudominio.com';
    $mail_cliente->Password = 'sua_senha';
    $mail_cliente->SMTPSecure = 'tls';
    $mail_cliente->Port = 587;

    $mail_cliente->setFrom($empresa_email, $empresa_nome);
    $mail_cliente->addAddress($email, $nome);
    $mail_cliente->Subject = "Confirmação de Orçamento - More DTF";

    $mensagem_cliente = "
Olá $nome,

Recebemos sua solicitação de orçamento com sucesso!

Custo Estimado: $custo_estimado €

Em breve entraremos em contacto para confirmar os detalhes e iniciar a produção.

Obrigado por escolher a More DTF!

Atenciosamente,
Equipe More DTF
";

    $mail_cliente->Body = $mensagem_cliente;
    $mail_cliente->send();

    echo json_encode([
        'status' => 'success',
        'message' => 'Orçamento enviado com sucesso!'
    ]);

} catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Erro ao enviar o email: ' . $mail->ErrorInfo
    ]);
}
?>
