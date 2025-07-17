const express = require("express");
const nodemailer = require("nodemailer");
const multer = require("multer");
const fs = require("fs");

const app = express();
const upload = multer({ dest: "uploads/" });

app.post("/enviar-email", upload.single("arquivo"), async (req, res) => {
  const { nome, email } = req.body;
  const arquivo = req.file;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "julionabor@gmail.com",
      pass: "mavmjpg1991"
    }
  });

  try {
    await transporter.sendMail({
      from: `"Formulário" <seuemail@gmail.com>`,
      to: "destinatario@exemplo.com",
      subject: "Novo envio do formulário",
      text: `Nome: ${nome}\nEmail: ${email}`,
      attachments: [
        {
          filename: arquivo.originalname,
          path: arquivo.path
        }
      ]
    });

    // opcional: deletar o arquivo depois de enviar
    fs.unlinkSync(arquivo.path);

    res.send("Email enviado com sucesso!");
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao enviar email.");
  }
});

app.listen(3000, () => console.log("Servidor rodando na porta 3000"));