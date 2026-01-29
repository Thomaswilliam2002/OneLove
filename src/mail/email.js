const { CronJob } = require("cron");
const nodemailer = require('nodemailer');
const { Produit, Emballage } = require('../db/sequelize');
// --- 1. FONCTION D'ENVOI (MOTEUR) ---
const sendStockAlert = async (emails, message) => {
    const transporter = nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: "5665c3ea8a96ad", // TON USER MAILTRAP
          pass: "85b636efcc7adb"        // TON PASS MAILTRAP (Vérifie bien ces 2 codes sur Mailtrap !)
        }
    });

    const mailOptions = {
        from: '"Stock One Love" <test@onelove.com>', //"One Love Test" <test@onelove.com>
        to: emails.join(','),
        subject: "⚠️ ALERTE : Seuil de stock atteint",
        text: message
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("✅ Email envoyé à Mailtrap !");
    } catch (error) {
        console.error("❌ Erreur d'envoi SMTP :", error.message);
    }
};

// --- 2. LOGIQUE DE SURVEILLANCE (CRON) ---
const admins = ["ton-email@test.com"];

const stockJob = new CronJob('0 0 * * * *', async () => {
    console.log("🔍 Vérification des seuils...");
    try {
        const produits = await Produit.findAll();
        const emballages = await Emballage.findAll();

        let msg = "";

        for (const produit of produits) {
            if (produit.quantiter <= produit.seuil) {
                msg += `⚠️ Le produit ${produit.nom} est en rupture de stock ! I est actuellement a ${produit.quantiter} .\n`;
            }
        }

        for (const emballage of emballages) {
            if (emballage.quantiter <= emballage.seuil) {
                msg += `⚠️ L'emballage ${emballage.nom} est en rupture de stock ! Il est actuellement a ${emballage.quantiter} .\n`;
            }
        }
        await sendStockAlert(admins, msg);
    } catch (err) {
        console.error("❌ Erreur dans le calcul du Cron :", err.message);
    }
});

module.exports = { stockJob };