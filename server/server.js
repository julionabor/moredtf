const express = require("express");
const nodemailer = require("nodemailer");
const multer = require("multer");
const fs = require("fs");
const cors = require("cors");
const app = express();

// Load .env if available
try {
	require("dotenv").config();
} catch (e) {
	console.warn(
		'dotenv not installed; skipping automatic .env loading. Run "npm install dotenv --save" to enable.'
	);
}

const password = process.env.EMAIL_PASS;
if (password) console.log("EMAIL_PASS loaded from environment");
else
	console.warn(
		"EMAIL_PASS is not set; server will run in MOCK mode (no emails will be sent)"
	);
// Configurações
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Global error handlers to avoid silent crashes and provide debug info
process.on("unhandledRejection", (reason, promise) => {
	console.error("Unhandled Rejection at:", promise, "reason:", reason);
});
process.on("uncaughtException", (err) => {
	console.error("Uncaught Exception thrown:", err);
	// Optional: decide whether to exit process or attempt graceful recovery
});

// Multer - upload de múltiplos arquivos PDF
const upload = multer({
	dest: "uploads/",
	limits: { fileSize: 2 * 1024 * 1024 }, // 2MB por arquivo
	fileFilter: (req, file, cb) => {
		if (file.mimetype === "application/pdf") {
			cb(null, true);
		} else {
			cb(new Error("Apenas arquivos PDF são permitidos."));
		}
	},
});

// Rota POST para envio de e-mail
app.post("/enviar-email", upload.array("arquivo"), async (req, res) => {
	try {
		console.log("Requisição recebida!");
		console.log("Body:", req.body);
		console.log("Arquivos:", req.files);

		const {
			nome,
			email,
			tipo_produto,
			copias,
			metros,
			ilhos,
			contacto,
			morada,
			cp,
			metodo,
		} = req.body;

		const arquivos = req.files || [];

		const plainText = `Novo Pedido de Orçamento:\n\nNome: ${nome}\nEmail: ${email}\nTipo de Produto: ${tipo_produto}\nCópias: ${copias}\nMetros: ${metros}\nIlhós: ${
			ilhos === "true" ? "Sim" : "Não"
		}\nContacto: ${contacto}\nMorada: ${morada}\nCódigo Postal: ${cp}\nMétodo de Pagamento: ${metodo}`;

		const htmlBody = `
				<div style="font-family: Arial, Helvetica, sans-serif; color:#222;">
					<h2 style="color:#0c0c0c;">Novo Pedido de Orçamento</h2>
					<table style="width:100%; border-collapse: collapse;">
						<tr><td style="padding:8px; border-bottom:1px solid #eee;"><strong>Nome</strong></td><td style="padding:8px; border-bottom:1px solid #eee;">${nome}</td></tr>
						<tr><td style="padding:8px; border-bottom:1px solid #eee;"><strong>Email</strong></td><td style="padding:8px; border-bottom:1px solid #eee;">${email}</td></tr>
						<tr><td style="padding:8px; border-bottom:1px solid #eee;"><strong>Tipo de Produto</strong></td><td style="padding:8px; border-bottom:1px solid #eee;">${tipo_produto}</td></tr>
						<tr><td style="padding:8px; border-bottom:1px solid #eee;"><strong>Cópias</strong></td><td style="padding:8px; border-bottom:1px solid #eee;">${copias}</td></tr>
						<tr><td style="padding:8px; border-bottom:1px solid #eee;"><strong>Metros</strong></td><td style="padding:8px; border-bottom:1px solid #eee;">${metros}</td></tr>
						<tr><td style="padding:8px; border-bottom:1px solid #eee;"><strong>Ilhós</strong></td><td style="padding:8px; border-bottom:1px solid #eee;">${
							ilhos === "true" ? "Sim" : "Não"
						}</td></tr>
						<tr><td style="padding:8px; border-bottom:1px solid #eee;"><strong>Contacto</strong></td><td style="padding:8px; border-bottom:1px solid #eee;">${contacto}</td></tr>
						<tr><td style="padding:8px; border-bottom:1px solid #eee;"><strong>Morada</strong></td><td style="padding:8px; border-bottom:1px solid #eee;">${morada}</td></tr>
						<tr><td style="padding:8px; border-bottom:1px solid #eee;"><strong>Código Postal</strong></td><td style="padding:8px; border-bottom:1px solid #eee;">${cp}</td></tr>
						<tr><td style="padding:8px; border-bottom:1px solid #eee;"><strong>Método de Pagamento</strong></td><td style="padding:8px; border-bottom:1px solid #eee;">${metodo}</td></tr>
					</table>
					<h4 style="margin-top:18px;">Ficheiros enviados</h4>
					<ul>
						${arquivos
							.map(
								(f) =>
									`<li>${f.originalname} (${(f.size / 1024 / 1024).toFixed(
										2
									)} MB)</li>`
							)
							.join("")}
					</ul>
					<hr />
					<p style="font-size:0.9rem;color:#666;">Pedido gerado automaticamente no site More DTF.</p>
				</div>
				`;

		if (!password) {
			// Dev mode: não temos credenciais — registar email e devolver sucesso para testes locais
			console.warn(
				"EMAIL_PASS não definido. Modo MOCK ativado — o email NÃO será enviado."
			);
			console.log("=== MOCK EMAIL ===");
			console.log(plainText);
			console.log(
				"Arquivos enviados:",
				arquivos.map((f) => f && f.originalname)
			);
			// Deletar arquivos temporários (seguro)
			arquivos.forEach((file) => {
				try {
					if (file && file.path && fs.existsSync(file.path)) {
						fs.unlinkSync(file.path);
					}
				} catch (e) {
					console.warn("Falha ao remover arquivo temporário:", e);
				}
			});
			return res.send("Mock: pedido registado. (EMAIL_PASS não definido)");
		}

		const transporter = nodemailer.createTransport({
			host: "smtp.gmail.com",
			port: 465,
			secure: true,
			auth: {
				user: "moreofthesame19@gmail.com",
				pass: password, // usar senha de app
			},
		});

		await transporter.sendMail({
			from: `"More DTF" <geral@graficamsprint.com>`,
			to: "julio_nabor@hotmail.com",
			subject: "[More DTF] Novo Pedido de Orçamento",
			text: plainText,
			html: htmlBody,
			attachments: arquivos.map((file) => ({
				filename: file.originalname,
				path: file.path,
			})),
		});

		// Deletar arquivos temporários (seguro)
		arquivos.forEach((file) => {
			try {
				if (file && file.path && fs.existsSync(file.path)) {
					fs.unlinkSync(file.path);
				}
			} catch (e) {
				console.warn("Falha ao remover arquivo temporário:", e);
			}
		});
		res.send("Email enviado com sucesso!");
	} catch (err) {
		console.error(err);
		res.status(500).send("Erro ao enviar email: " + err.message);
	}
});

app.listen(3000, () => console.log("Servidor rodando na porta 3000"));
