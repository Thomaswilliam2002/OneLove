const crypto = require('crypto'); // Module natif de Node.js
const { Personnel } = require('../db/sequelize');
const { sendEmail } = require('./emailService'); // On réutilise ton service email
const bcrypt = require('bcrypt')

// Route : POST /forgot-password 
forgotPassword = (app) =>{
    app.get('/forgotPassword',async (req, res) => {
        const { email } = req.body;

        try {
            const user = await Personnel.findOne({ where: { email: email } });
            if (!user) {
                return res.redirect("/notFound?msg=email");
            }

            // 1. Créer un token aléatoire
            const token = crypto.randomBytes(32).toString('hex');
            
            // 2. Définir une expiration (ex: 1 heure)
            const expiration = new Date(Date.now() + 3600000); 

            // 3. Sauvegarder dans la DB
            await user.update({
                resetToken: token,
                resetTokenExpiration: expiration
            });

            // 4. Envoyer l'email
            const link = `http://localhost:3000/reset-password/${token}`;
            const message = `Vous avez demandé la réinitialisation de votre mot de passe. Cliquez ici : ${link}`;
            
            await sendEmail([user.email], "Réinitialisation de mot de passe", message);

            return res.redirect("/notFound?msg=envoyer");
        } catch (error) {
            return res.redirect("/notFound?msg=serveur");
        }
    });

}

// Route : POST /reset-password/:token
resetPassword = (app) => {

    app.get('/resetPassword/:token',async (req, res) => {
        const { token } = req.params;
        const { password } = req.body;

        try {
            // Trouver l'utilisateur avec ce token ET vérifier si l'heure n'est pas passée
            const user = await Employer.findOne({ 
                where: { 
                    resetToken: token,
                    resetTokenExpiration: { [Op.gt]: new Date() } // Op.gt veut dire "plus grand que maintenant"
                } 
            });

            if (!user) {
                return res.redirect("/notFound?msg=invalide");
            }

            // Mettre à jour le mot de passe (pense à le hasher avec bcrypt !)
            user.password = await bcrypt.hash(password, 10);
            user.resetToken = null; // On efface le token
            user.resetTokenExpiration = null;
            await user.save();

            return res.redirect("/notFound?msg=mdpsuccess");
        } catch (error) {
            return res.redirect("/notFound?msg=serveur");
        }
    });

}

module.exports = { forgotPassword, resetPassword };