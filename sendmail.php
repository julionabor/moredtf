<?php
header('Content-Type: application/json');

// CONFIGURAÇÕES
$admin_email = "julionabor@gmail.com";   // email que recebe o pedido
$site_name   = "Print Service";               // nome que aparece nos emails
$from_email  = "no-reply@" . $_SERVER['SERVER_NAME']; // remetente automático

try {

    // ===========
    // 1. VALIDAR CAMPOS
    // ===========
    $required = ["tipo_produto", "nome", "email", "metros", "copias"];
    foreach ($required as $field) {
        if (empty($_POST[$field])) {
            throw new Exception("Campo obrigatório em falta: $field");
        }
    }

    // ===========
    // 2. RECEBER CAMPOS
    // ===========
    $tipo      = $_POST["tipo_produto"];
    $copias    = $_POST["copias"];
    $metros    = $_POST["metros"];
    $ilhos     = isset($_POST["ilhos"]) ? "Sim" : "Não";

    $nome      = $_POST["nome"];
    $email     = $_POST["email"];
    $contacto  = $_POST["contacto"] ?? "";
    $morada    = $_POST["morada"] ?? "";
    $cp        = $_POST["cp"] ?? "";
    $metodo    = $_POST["metodo"] ?? "";

    // ===========
    // 3. EMAIL PRINCIPAL (HTML)
    // ===========
    $html = "
    <h2>Novo Pedido de Orçamento</h2>

    <h3>Tipo de Impressão</h3>
    <p><strong>Produto:</strong> $tipo</p>

    <h3>Especificações</h3>
    <p><strong>Copias:</strong> $copias<br>
    <strong>Metros:</strong> $metros<br>
    <strong>Ilhós:</strong> $ilhos</p>

    <h3>Dados do Cliente</h3>
    <p>
    <strong>Nome:</strong> $nome<br>
    <strong>Email:</strong> $email<br>
    <strong>Contacto:</strong> $contacto<br>
    <strong>Morada:</strong> $morada<br>
    <strong>Código Postal:</strong> $cp<br>
    <strong>Método de Pagamento:</strong> $metodo
    </p>
    ";


    // ===========
    // 4. CONSTRUIR E-MAIL COM ANEXOS
    // ===========
    $boundary = md5(time());
    $headers  = "From: $site_name <$from_email>\r\n";
    $headers .= "Reply-To: $email\r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: multipart/mixed; boundary=\"$boundary\"\r\n";

    $body  = "--$boundary\r\n";
    $body .= "Content-Type: text/html; charset=UTF-8\r\n";
    $body .= "Content-Transfer-Encoding: 8bit\r\n\r\n";
    $body .= $html . "\r\n\r\n";

    // ANEXAR FICHEIROS
    if (!empty($_FILES["files"])) {
        foreach ($_FILES["files"]["tmp_name"] as $i => $tmp) {

            if ($_FILES["files"]["error"][$i] === UPLOAD_ERR_OK) {

                $filename = $_FILES["files"]["name"][$i];
                $filedata = file_get_contents($tmp);
                $filedata = chunk_split(base64_encode($filedata));
                $filetype = $_FILES["files"]["type"][$i];

                $body .= "--$boundary\r\n";
                $body .= "Content-Type: $filetype; name=\"$filename\"\r\n";
                $body .= "Content-Disposition: attachment; filename=\"$filename\"\r\n";
                $body .= "Content-Transfer-Encoding: base64\r\n\r\n";
                $body .= $filedata . "\r\n\r\n";
            }
        }
    }

    $body .= "--$boundary--";

    // ===========
    // 5. ENVIAR PARA ADMIN
    // ===========
    if (!mail($admin_email, "Novo Pedido de Orçamento", $body, $headers)) {
        throw new Exception("Não foi possível enviar o email.");
    }

    // ===========
    // 6. EMAIL DE CONFIRMAÇÃO PARA O UTILIZADOR
    // ===========
    $confirm_subject = "Recebemos o seu pedido de orçamento";
    $confirm_html = "
    <p>Olá <strong>$nome</strong>,</p>
    <p>Recebemos o seu pedido de orçamento e iremos responder em breve.</p>
    <p><strong>Resumo:</strong></p>
    <p>
    - Produto: $tipo <br>
    - Metros: $metros <br>
    - Cópias: $copias <br>
    </p>
    <p>Obrigado pelo seu contacto!</p>
    ";

    $confirm_headers  = "From: $site_name <$from_email>\r\n";
    $confirm_headers .= "MIME-Version: 1.0\r\n";
    $confirm_headers .= "Content-Type: text/html; charset=UTF-8\r\n";

    mail($email, $confirm_subject, $confirm_html, $confirm_headers);

    // ===========
    // 7. RESPOSTA AO JS
    // ===========
    echo json_encode(["success" => true]);

} catch (Exception $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>
