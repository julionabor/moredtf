const express = require("express");
const nodemailer = require("nodemailer");
const multer = require("multer");
const fs = require("fs");
const cors = require("cors");
const app = express();

// Configurações
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

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

		const arquivos = req.files;

		const transporter = nodemailer.createTransport({
			host: "smtp.gmail.com",
			port: 465,
			secure: true,
			auth: {
				user: "julionabor@gmail.com",
				pass: "dwgi wugw izgl sxdt", // usar senha de app
			},
		});

		const emailText = `
Novo Pedido de Orçamento:

Nome: ${nome}
Email: ${email}
Tipo de Produto: ${tipo_produto}
Cópias: ${copias}
Metros: ${metros}
Ilhós: ${ilhos === "true" ? "Sim" : "Não"}
Contacto: ${contacto}
Morada: ${morada}
Código Postal: ${cp}
Método de Pagamento: ${metodo}
`;

		await transporter.sendMail({
			from: `"Formulário" <julionabor@gmail.com>`,
			to: "julio_nabor@hotmail.com",
			subject: "Novo Pedido de Orçamento",
			text: emailText,
			attachments: arquivos.map((file) => ({
				filename: file.originalname,
				path: file.path,
			})),
		});

		// Deletar arquivos temporários
		arquivos.forEach((file) => fs.unlinkSync(file.path));
    if(res.status(200)){
      alert("Orçamento submetido com sucesso!");
    }
		res.send("Email enviado com sucesso!");
	} catch (err) {
		console.error(err);
		res.status(500).send("Erro ao enviar email: " + err.message);
	}
});

app.listen(3000, () => console.log("Servidor rodando na porta 3000"));
