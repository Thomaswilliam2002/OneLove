require('dotenv').config();
const {sequelize, Occupe, Personnel, Poste, BarSimpleJournal, BarVipJournal, AppartFondJournal, CuisineJournal, 
    ChambreJournal, Sanction, CrazyClubJournal,
    Appartement,
    Categorie,
    Produit,
    Emballage,
    Caisse,
    CaisseJournal,} = require('./src/db/sequelize');

const {stockJob} = require('./src/mail/email')


const methodOverride = require('method-override');
const path = require('path'); 
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const bcrypt = require('bcrypt');
const {protrctionRoot, authorise, infos} = require('./src/middleware/protectRoot');
const {fn, col, literal, json, where, Op} = require('sequelize');

//const bodyParser = require('body-parser')
const appart = require('./src/routes/appartement/appart')
const appartJournal = require('./src/routes/appartement/appartJournal')
const barSimple = require('./src/routes/barSimple/barSimple')
const barSJournal = require('./src/routes/barSimple/barSJournal')
const barVip = require('./src/routes/barVip/barVip')
const barVJournal = require('./src/routes/barVip/barVJournal')
const caisse = require('./src/routes/caisse/caisse')
const caisseJournal = require('./src/routes/caisse/caisseJournal')
const chambre = require('./src/routes/chambre/chambre')
const chambreJournal = require('./src/routes/chambre/chambreJournal')
const cuisine = require('./src/routes/cuisine/cuisine')
const cuisineJournal = require('./src/routes/cuisine/cuisineJournal')
const maisonClose = require('./src/routes/maisonclose/maisonClose')
const personnel = require('./src/routes/personnel/personnel')
const poste = require('./src/routes/poste/poste')
const sanction = require('./src/routes/sanction/sanction')
const client = require('./src/routes/client/client')
const crazyClub = require('./src/routes/cclub/cclub')
const crazyClubJournal = require('./src/routes/cclub/cclubJournal')
const categorie = require('./src/routes/categorie/categorie')
const produit = require('./src/routes/produit/produit')
const emballage = require('./src/routes/emballage/emballage')
const histEntrer = require('./src/routes/hist/histEntrer')
const histSortie = require('./src/routes/hist/histSortie')
const pointage = require('./src/routes/presence/presence')
const occupent = require('./src/routes/occupent/occupent')
const caisseProduit = require('./src/routes/produit/produitCaisse')
const forgot = require('./src/mail/forgotMail')

const {MaisonColse, Chambre, Cuisine} = require('./src/db/sequelize')
const {BarSimple} = require('./src/db/sequelize')
const {BarVip} = require('./src/db/sequelize')
const {CrazyClub} = require('./src/db/sequelize')

const express = require('express');
const { create } = require('domain');
// const cclubJournal = require('./src/models/cclubJournal');
const appartFondJournal = require('./src/models/appartFondJournal');
//const article = require('./src/models/article')

const app = express();
app.set('trust proxy', 1); // Indispensable pour que le cookie passe sur Render

app.set('view engine', 'ejs');
app.set('views', 'src/vues')

const mySessionStore = new SequelizeStore({
    db: sequelize,
    tableName: 'Sessions', // Nom de la table qui sera créée automatiquement
    logging: false, // <--- Ajoute cette ligne pour cacher les logs SQL des sessions
    checkExpirationInterval: 15 * 60 * 1000, // Nettoie les sessions expirées toutes les 15 min
    expiration: 7 * 24 * 60 * 60 * 1000  // Durée max de 1 semaine
});

app.use(session({
    name: "session_name",
    secret: process.env.SESSION_SECRET || 'mon_secret_ultra_sur',
    store: mySessionStore,
    resave: false,
    saveUninitialized: false,
    proxy: true, // Ajoute cette ligne aussi
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7,
        secure: process.env.NODE_ENV === 'production' || true,
        httpOnly: true,
        // sameSite: 'lax' // Recommandé pour éviter les problèmes de redirection
        sameSite: 'none',     // Nécessaire si le cookie traverse des domaines
    }
}));


// TRÈS IMPORTANT : Créer la table dans MariaDB si elle n'existe pas
mySessionStore.sync();

app.use(methodOverride('_method'));

app.use('/assets', express.static(path.join(__dirname, 'src/vues/assets')))

app.use(express.urlencoded({extended: false}))

const port = process.env.PORT || 3000;

app.use(infos);

//no-store : Interdit au navigateur de sauvegarder la page sur le disque.
//must-revalidate : Force le navigateur à vérifier si le contenu a changé.
//max-stale=0 : Considère que toute version en cache est immédiatement périmée.

app.use((req, res, next) => {
    res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    next();
});

//route roote
app.get('/', (req, res) => {
    // res.render('login', {msg: req.query.msg})
    res.json('Hello heroku !🤩')
})
// ------------------------------------------------------------------------------------------
app.get('/expo', (req, res) => {
    res.json({data: 'ok'})
})
// ------------------------------------------------------------------------------------------

//route page not found
app.get('/notFound', (req, res) => {
    res.render('page-not-found', {msg: req.query.msg})
})

//route acount not found or probleme validation
app.get('/validation', (req, res) => {
    res.render('validation')
})

//route cree une fiche de paie
app.get('/fichePaie', (req, res) => {
    res.render('create-invoice')
})

// ------------------------------------------------------------------------------------------
const getDay = () => {
    const now = new Date()
    const year =  now.getFullYear()

    //premier jour de l'annee (UTC)
    const firstDay = new Date(Date.UTC(year, 0, 1))
    //dernier jour de l'annee (UTC)
    const lastDay = new Date(Date.UTC(year, 11, 31, 59, 59, 999))

    return {
        firstDayISO : firstDay,
        lastDayISO : lastDay
    }
}
// ------------------------------------------------------------------------------------------

//route dashboard
app.get('/index', protrctionRoot, authorise('admin'), async (req, res) => {
    const nvdate = new Date();
    // Début et fin du mois en cours pour le filtrage
    const firstDay = new Date(nvdate.getFullYear(), nvdate.getMonth(), 1);
    const lastDay = new Date(nvdate.getFullYear(), nvdate.getMonth() + 1, 1);

    try {
        // On lance TOUTES les requêtes en parallèle pour gagner en performance
        const [
            nb_personnel, nb_appart, nb_barSimple, nb_barVip, nb_crazyClub,
            sum_bs, sum_bv, sum_cc, sum_cui, sum_ap, sum_ch,
            sum_caisse_recette, nb_mc, nb_ch, nb_cu, nb_cat, nb_prod, nb_emb, nb_cai
        ] = await Promise.all([
            Personnel.count(),
            Appartement.count(),
            BarSimple.count(),
            BarVip.count(),
            CrazyClub.count(),
            // Sommes avec gestion de la période (Gte = Supérieur ou égal, Lt = Strictement inférieur)
            BarSimpleJournal.sum("recette", { where: { date: { [Op.gte]: firstDay, [Op.lt]: lastDay } } }),
            BarVipJournal.sum("recette", { where: { date: { [Op.gte]: firstDay, [Op.lt]: lastDay } } }),
            CrazyClubJournal.sum("recette", { where: { date: { [Op.gte]: firstDay, [Op.lt]: lastDay } } }),
            CuisineJournal.sum("montant_verser", { where: { date: { [Op.gte]: firstDay, [Op.lt]: lastDay } } }),
            AppartFondJournal.sum("recette", { where: { date: { [Op.gte]: firstDay, [Op.lt]: lastDay } } }),
            ChambreJournal.sum("loyer", { where: { date: { [Op.gte]: firstDay, [Op.lt]: lastDay } } }),
            // Totaux globaux
            Caisse.sum("recette"),
            MaisonColse.count(),
            Chambre.count(),
            Cuisine.count(),
            Categorie.count(),
            Produit.count(),
            Emballage.count(),
            Caisse.count()
        ]);

        const data = {
            "personnel": nb_personnel || 0,
            "nbAppart": nb_appart || 0,
            "nbBarSimple": nb_barSimple || 0,
            "nbBarVip": nb_barVip || 0,
            "nbCrazyClub": nb_crazyClub || 0,
            "nbMaisonClose": nb_mc || 0,
            "nbChambre": nb_ch || 0,
            "nbCuisine": nb_cu || 0,
            "nbProduit": nb_prod || 0,
            "nbCaisse": nb_cai || 0,
            "nbEmballage": nb_emb || 0,
            "nbCategorieArticle": nb_cat || 0,
            "nbTotalBarClub": (nb_barSimple || 0) + (nb_barVip || 0) + (nb_crazyClub || 0),
            "recetteBarSimple": sum_bs || 0,
            "recetteBarVip": sum_bv || 0,
            "recetteCrazyClub": sum_cc || 0,
            "recetteCuisine": sum_cui || 0,
            "recetteAppart": sum_ap || 0,
            "recetteChambre": sum_ch || 0,
            "sum_caisse_recette": sum_caisse_recette || 0
        };

        res.render('index', { data: data });

    } catch (e) {
        console.error("Erreur Dashboard Index:", e);
        res.status(500).send("Erreur lors du chargement du tableau de bord");
    }
});

// verrifie la liste des produit et emballage en rupture de stock toutte les heure et envoi un mail aux admin
stockJob.start();

//route presence
app.get('/presence', protrctionRoot, authorise('admin', 'comptable', 'caissier'), async (req, res) => {
    const personnels = await Personnel.findAll() 
    if(personnels){
        res.render('presence', {personnels: personnels, msg: req.query.msg, type: req.query.type});
    }else{
        res.redirect('/notFound');
    }
    
})

//route login
app.get('/login', (req, res) => {
    res.render('login', {msg: req.query.msg})
})

//route connexion
app.post('/connexion', async (req, res) => {
    const{email, pwd} = req.body
    const personnel = await Occupe.findOne({
        include:[
            {model: Personnel,where: {email: email}},
            {model: Poste}
        ]
    })
    if(personnel){
        const verif = await bcrypt.compare(pwd, personnel.Personnel.mdp);
        if(verif){
            if(personnel.Personnel.validation === true){
                req.session.user = personnel;
                req.session.isLoggedIn = true;
                // res.locals.user = personnel;
                //console.log(res.locals.user)
                if(personnel.Poste.nom_poste === 'Admin'){
                    res.redirect('/index');
                }else{
                    // console.log('oui')
                    res.redirect('/onePersonnel/' + personnel.Personnel.id_personnel)
                }
            }else{
                // console.log('compte nom valider');
                res.redirect('login?msg=validation')
            }
            
        }else{
            // console.log('mdp incorrect');
            res.redirect('login?msg=mdp')
        }
    }else{
        // console.log('utilisateur non trouver');
        res.redirect('login?msg=user')
    }
})

//route deconnexion
app.get('/deconnexion', protrctionRoot, (req, res) => {
    req.session.destroy((err) => {
        if(err){
            res.redirect('/login')
        }else{
            res.clearCookie("session_name")
            res.redirect('/login')
        }
    })
})

//route mdp oublier
app.get('/forgot', (req, res) => { //, protrctionRoot
    res.render('forgot-password')
})

//route changer le mdp
app.get('/reset', protrctionRoot, (req, res) => {
    res.render('reset-password',{msg: req.query.msg})
})

//route changer le mdp
app.put('/resetTraitement/:id', protrctionRoot, async (req, res) => {
    console.log('recu')
    const {Pwd, newPwd, cnewPwd} = req.body;
    console.log(req.params.id)
    const user = await Personnel.findByPk(req.params.id);
    if(user){
        const verif = await bcrypt.compare(Pwd, personnel.mdp);
        if(verif){
            if(newPwd === cnewPwd){
                try{
                    const salt = await bcrypt.genSalt(10);
                    hash_pass = await bcrypt.hash(newPwd, salt)
                    await Personnel.update({
                        mdp: hash_pass,
                    })
                    res.redirect('/login')
                }catch(e){
                    res.redirect('/notFond')
                    // console.log(e)
                }
            }
        }else{
            res.redirect('/reset?msg=mdp')
        }
    }else{
        res.redirect('/login')
    }
})

// la route vers la facture proforma
app.get('/proforma', protrctionRoot, authorise('admin', 'comptable'), (req, res) => {
    res.status(200).render('proforma')
})

//route add
app.get('/Add', protrctionRoot, authorise('admin', 'comptable'), (req, res) => {
    MaisonColse.findAll()
        .then(maisonColses => {
            Chambre.findAll() 
                .then(chambres => {
                    
                    const msg = "Liste recuperer avec succes"
                    //res.json(maisonColses[0].id_mclose)
                    res.render('ajout', {maisonColses: maisonColses, chambres: chambres})
                })
                .catch(_ => console.log('erreure de selection all' + _))
        })
        .catch(_ => console.log('erreure de selection all' + _))
})

// //route add bar
// app.get('/fondBarClub', (req, res) => {
//     res.render('/fondBarClub', {msg: req.query.msg})
// })

//route edit-bar-club
app.get('/editBarClub/:id', protrctionRoot, authorise('admin', 'comptable'), (req, res) => {
    //console.log("ok")
    if(req.query.type === "bs"){
        BarSimple.findByPk(req.params.id)
            .then(bar => {
                res.status(200).render('edit-bar-club', {bar: bar, type: "bs"})
            })
            .catch(_ => console.log('erreure de selection' + _))
    }
    else if(req.query.type === "bv"){
        BarVip.findByPk(req.params.id)
            .then(bar => {
                res.status(200).render('edit-bar-club', {bar: bar, type: "bv"})
            })
            .catch(_ => console.log('erreure de selection' + _))
    }
    else if(req.query.type === "cc"){
        CrazyClub.findByPk(req.params.id)
            .then(bar => {
                res.status(200).render('edit-bar-club', {bar: bar, type: "cc"})
            })
            .catch(_ => console.log('erreure de selection' + _))
    }
    
})


//route afficher bar simple,vip and crazy club
app.get('/allBarClub', protrctionRoot, authorise('admin', 'comptable'), (req, res) => {
    BarSimple.findAll()
        .then(bars => {
            BarVip.findAll()
                .then(barv => {
                    CrazyClub.findAll()
                        .then(crazyc => {
                            res.render('all-bars-club', {bars: bars, barv: barv, crazyc: crazyc, msg: req.query.msg, type: req.query.type})
                        })
                        .catch(_ => console.log('erreure de selection all' + _))
                })
                .catch(_ => console.log('erreure de selection all' + _))
        })
        .catch(_ => console.log('erreure de selection all' + _))
})

// la route vers la liste des salarier
app.get('/salarier', protrctionRoot, authorise('admin', 'comptable'), async (req, res) =>{
    const data = []
    const salariers = await Occupe.findAll({
        include:[
            {model: Personnel},
            {model: Poste}
        ],
        order:[['id_occupe', 'DESC']]
    })
    if(salariers){
        data.push(salariers)
        const sanction = await Sanction.findAll()
        if(sanction){
            data.push(sanction)
            res.render('salaries', {datas: data})
        }
    }
        // .then(salariers =>{
        //     //res.json(salariers)
        //     res.render('salaries', {salariers: salariers})
        // })
        // .catch(err => console.log(err))
})

// la route vers le formulaire ajout des font des bars et club
app.get('/formFondBarClub', protrctionRoot, authorise('admin','comptable','caissier', 'caissier central'), async (req, res) =>{
    let chambres = null;
    if(req.query.type === 'bc'){
        BarSimple.findAll()
        .then(barss =>{
            BarVip.findAll()
                .then(barvs =>{
                    CrazyClub.findAll()
                        .then(crazys =>{
                            Caisse.findAll()
                                .then(caisses => {
                                    res.render('fondBarClub', {barss: barss, chambres: chambres, barvs: barvs, crazys: crazys, caisses: caisses, msg: req.query.msg, type: req.query.type})
                                })
                                .catch(err => console.log(err))
                        })
                        .catch(err => console.log(err))
                })
                .catch(err => console.log(err))
        })
        .catch(err => console.log(err))
    }else if(req.query.type === 'cuisine'){
        Cuisine.findAll()
            .then(cuisines => {
                res.render('fondBarClub', {cuisines: cuisines, chambres: chambres, msg: req.query.msg, type: req.query.type})
            })
            .catch(_ => console.log('erreure de selection all' + _))
    }else if(req.query.type === 'mclose') {
        const mcloses = await MaisonColse.findAll()
        if(mcloses){
            const chambre = await Chambre.findAll()
            if(chambre){
                res.render('fondBarClub', {mcloses: mcloses, chambres: chambre, msg: req.query.msg, type: req.query.type})
            }
        }
    }else if(req.query.type === 'appart') {
        const apparts = await Appartement.findAll()
        if(apparts && apparts !== null){
            res.render('fondBarClub', {apparts:apparts,chambres: chambres, msg: req.query.msg, type: req.query.type})
        }
    }
})

// route pour la caisse general one love
app.get('/caisseOnelove', protrctionRoot, authorise('admin', 'comptable'), async (req, res) => {
    try {
        // Définition de l'expression de date pour Postgres
        const moisExpr = fn('TO_CHAR', col('date'), 'YYYY-MM');

        // On lance toutes les requêtes en parallèle pour plus de performance
        const [fbs, fbv, fap, fcui, fmc, fcc] = await Promise.all([
            BarSimpleJournal.findAll({
                attributes: [[moisExpr, 'mois'], [fn('SUM', col('recette')), 'total_recette']],
                group: [moisExpr], // Groupement par l'expression de date
                order: [[literal('"mois"'), 'ASC']],
                raw: true
            }),
            BarVipJournal.findAll({
                attributes: [[moisExpr, 'mois'], [fn('SUM', col('recette')), 'total_recette']],
                group: [moisExpr],
                order: [[literal('"mois"'), 'ASC']],
                raw: true
            }),
            AppartFondJournal.findAll({
                attributes: [[moisExpr, 'mois'], [fn('SUM', col('recette')), 'total_recette']],
                group: [moisExpr],
                order: [[literal('"mois"'), 'ASC']],
                raw: true
            }),
            CuisineJournal.findAll({
                attributes: [[moisExpr, 'mois'], [fn('SUM', col('montant_verser')), 'total_recette']],
                group: [moisExpr],
                order: [[literal('"mois"'), 'ASC']],
                raw: true
            }),
            ChambreJournal.findAll({
                attributes: [[moisExpr, 'mois'], [fn('SUM', col('loyer')), 'total_recette']],
                group: [moisExpr],
                order: [[literal('"mois"'), 'ASC']],
                raw: true
            }),
            CrazyClubJournal.findAll({ // Assure-toi que le modèle est bien importé
                attributes: [[moisExpr, 'mois'], [fn('SUM', col('recette')), 'total_recette']],
                group: [moisExpr],
                order: [[literal('"mois"'), 'ASC']],
                raw: true
            })
        ]);

        // Construction du tableau final
        const all_recette = [fbs, fbv, fap, fcui, fmc, fcc];

        res.render('caisseOnelove', { all_recette });

    } catch (e) {
        console.error("Erreur dans la route caisseOnelove :", e);
        res.redirect('/notFound');
    }
});

// les routes commence ici allBarClub
//appart.ell(app);
appart.allAppart(app);
appart.oneAppart(app);
appart.addAppart(app);
appart.updateAppart(app);
appart.deleteAppart(app);
appart.formAddAppart(app);
appart.formEditAppart(app);
//console.log("ok");
appartJournal.allJournal(app);
appartJournal.oneJournal(app);
appartJournal.addJournal(app);
appartJournal.updateJournal(app);
appartJournal.deleteJournal(app);
appartJournal.appartFondJournal(app);
appartJournal.deleteFondJournal(app);

client.allClient(app);
client.formAddClient(app);
client.addClient(app);
client.deleteClient(app);

barSimple.allBarS(app);
barSimple.oneBarS(app);
barSimple.addBarS(app);
barSimple.updateBarS(app);
barSimple.deleteBarS(app);

barSJournal.allBSJournal(app);
barSJournal.oneBSJournal(app);
barSJournal.addBSJournal(app);
barSJournal.updateBSJournal(app);
barSJournal.deleteBSJournal(app);

barVip.allBarV(app);
barVip.oneBarV(app);
barVip.addBarV(app);
barVip.updateBarV(app);
barVip.deleteBarV(app);

barVJournal.allBVJournal(app);
barVJournal.oneBVJournal(app);
barVJournal.addBVJournal(app);
barVJournal.updateBVJournal(app);
barVJournal.deleteBVJournal(app); 

crazyClub.allCClub(app);
crazyClub.oneCClub(app);
crazyClub.addCClub(app);
crazyClub.updateCClub(app);
crazyClub.deleteCClub(app);

crazyClubJournal.allCCJournal(app);
crazyClubJournal.oneCCJournal(app);
crazyClubJournal.addCCJournal(app);
crazyClubJournal.updateCCJournal(app);
crazyClubJournal.deleteCCJournal(app);

caisse.allCaisse(app);
caisse.oneCaisse(app);
caisse.addCaisse(app);
caisse.updateCaisse(app);
caisse.deleteCaisse(app);
caisse.formAddCaisse(app);
caisse.formEditCaisse(app);
caisse.caisseBareSimple(app);
caisse.caisseBareVip(app);
caisse.caisseAppart(app);
caisse.caisseMClose(app);
caisse.caisseCClub(app);
caisse.caisseCuisine(app);

caisseProduit.allProduitCaisse(app);
caisseProduit.addHistCaisse(app);
caisseProduit.allHistCaisse(app);
caisseProduit.deleteHistCaisse(app);

caisseJournal.allCJournal(app);
caisseJournal.oneCJournal(app);
caisseJournal.addCJournal(app);
caisseJournal.updateCJournal(app);
caisseJournal.deleteCJournal(app);

chambre.allChambre(app);
chambre.oneChambre(app);
chambre.addChambre(app);
chambre.updateChambre(app);
chambre.deleteChambre(app);

chambreJournal.allChJournal(app);
chambreJournal.oneChJournal(app);
chambreJournal.addChJournal(app);
chambreJournal.updateChJournal(app);
chambreJournal.deleteChJournal(app);

cuisine.allCuisine(app);
cuisine.oneCuisine(app);
cuisine.addCuisine(app);
cuisine.updateCuisine(app);
cuisine.deleteCuisine(app);
cuisine.formAddCuisine(app);
cuisine.formEditCuisine(app);

cuisineJournal.allCuJournal(app);
cuisineJournal.oneCuJournal(app);
cuisineJournal.addCuJournal(app);
cuisineJournal.updateCuJournal(app);
cuisineJournal.deleteCuJournal(app);

maisonClose.allMClose(app);
maisonClose.oneMClose(app);
maisonClose.addMClose(app);
maisonClose.updateMClose(app);
maisonClose.deleteMClose(app);

personnel.formAddAdmin(app);
personnel.allPersonnel(app);
personnel.onePersonnel(app);
personnel.addPersonnel(app);
personnel.updatePersonnel(app);
personnel.deletePersonnel(app);
personnel.formAddPersonnel(app);
personnel.formEditPersonnel(app);
personnel.formEditAdmin(app);
personnel.validation(app);

poste.allPoste(app);
poste.onePoste(app);
poste.addPoste(app);
poste.updatePoste(app);
poste.deletePoste(app);

sanction.allSanction(app);
sanction.oneSanction(app);
sanction.addSanction(app);
sanction.updateSanction(app);
sanction.deleteSanction(app);
sanction.formAddSamction(app);

categorie.allCateg(app);
categorie.addCateg(app);
categorie.deleteCateg(app);
//categorie.formAddCateg(app);

histSortie.allHSortie(app);
histSortie.addHSortie(app);
histSortie.deleteHSortie(app);

histEntrer.allHEntrer(app);
histEntrer.addHEntrer(app);
histEntrer.deleteHEntrer(app);

produit.allProduit(app);
produit.formAddProduit(app);
produit.updateProduit(app);
produit.addProduit(app);
produit.deleteProduit(app);
produit.oneProduit(app);

emballage.allEmballage(app);
emballage.formAddEmballage(app);
emballage.addEmballage(app);
emballage.deleteEmballage(app);
emballage.updateEmballage(app);
emballage.oneEmballage(app);

pointage.addPresence(app);
pointage.addAbsence(app);
pointage.allPresence(app);
pointage.allAbsence(app);
pointage.deletePresence(app);

occupent.AddOccupent(app);
occupent.deleteOccupent(app);

forgot.forgotPassword(app);
forgot.resetPassword(app);

// app.listen(port, () => console.log('serveur en cour sur http://localhost:' + port));

app.listen(port, () => {
    console.log(`Serveur en cours sur http://localhost:${port}`);
});

//----------------------------------------------------------------------------------------------------------------------
// const {DataTypes} = require('sequelize')

// const Appartement_m = require('./src/moduls/appartement')
// const AppartJournal_m = require('./src/moduls/appartJournal')
// const BarSimple_m = require('./src/moduls/barSimple')
// const BarSimpleJournal_m = require('./src/moduls/barSimpleJournal')
// const BarVip_m = require('./src/moduls/barVip');
// const BarVipJournal_m = require('./src/moduls/barVipJournal');
// const Caisse_m = require('./src/moduls/caisse');
// const CaisseJournal_m = require('./src/moduls/caisseJournal');
// const Chambre_m = require('./src/moduls/chambre');
// const ChambreJournal_m = require('./src/moduls/chambreJournal');
// const CrazyClub_m = require('./src/moduls/crazyClub');
// const Cuisine_m = require('./src/moduls/cuisine');
// const CuisineJournal_m = require('./src/moduls/cuisineJournal');
// const MaisonColse_m = require('./src/moduls/maisonClose');
// const Personnel_m = require('./src/moduls/personnel');
// const Poste_m = require('./src/moduls/postel');
// const Sanction_m = require('./src/moduls/sanction');


// const Appartement = Appartement_m(sequelize, DataTypes);
// const AppartJournal = AppartJournal_m(sequelize, DataTypes);
// const BarSimple = BarSimple_m(sequelize, DataTypes);
// const BarSimpleJournal = BarSimpleJournal_m(sequelize, DataTypes);
// const BarVip = BarVip_m(sequelize, DataTypes);
// const BarVipJournal = BarVipJournal_m(sequelize, DataTypes);
// const Caisse = Caisse_m(sequelize, DataTypes);
// const CaisseJournal = CaisseJournal_m(sequelize, DataTypes);
// const Chambre = Chambre_m(sequelize, DataTypes);
// const ChambreJournal = ChambreJournal_m(sequelize, DataTypes);
// const CrazyClub = CrazyClub_m(sequelize, DataTypes);
// const Cuisine = Cuisine_m(sequelize, DataTypes);
// const CuisineJournal = CuisineJournal_m(sequelize, DataTypes);
// const MaisonColse = MaisonColse_m(sequelize, DataTypes);
// const Personnel = Personnel_m(sequelize, DataTypes);
// const Poste = Poste(sequelize, DataTypes);
// const Sanction = Sanction(sequelize, DataTypes);
// //creation des relation entre les table

// // liaison entre bar simple et son journal
// BarSimple.hasMany(BarSimpleJournal, {
//     foreignKey: 'code_barSimple'
// });
// BarSimpleJournal.belongsTo(BarSimple, {
//     foreignKey: 'code_barSimple'
// });

// // liaison entre appartement et son journal
// Appartement.hasMany(AppartJournal, {
//     foreignKey: 'id_appart'
// });
// AppartJournal.belongsTo(Appartement, {
//     foreignKey: 'id_appart'
// });

// // liaison entre bar vip et son journal
// BarVip.hasMany(BarVipJournal, {
//     foreignKey: 'code_barVip'
// });
// BarVipJournal.belongsTo(BarVip, {
//     foreignKey: 'code_barVip'
// });

// // liaison entre bar cuisine et son journal
// Cuisine.hasMany(CuisineJournal, {
//     foreignKey: 'id_cuisine'
// });
// CuisineJournal.belongsTo(Cuisine, {
//     foreignKey: 'id_cuisine'
// });

// // liaison entre maison close et chambre
// MaisonColse.hasMany(Chambre, {
//     foreignKey: 'id_mclose'
// });
// Chambre.belongsTo(MaisonColse, {
//     foreignKey: 'id_mclose'
// });

// // liaison entre chambre et son journal
// Chambre.hasMany(ChambreJournal, {
//     foreignKey: 'id_chambre'
// });
// ChambreJournal.belongsTo(Chambre, {
//     foreignKey: 'id_chambre'
// });

// // liaison entre caisse et son journal
// Caisse.hasMany(CaisseJournal, {
//     foreignKey: 'id_caisse'
// });
// CaisseJournal.belongsTo(Caisse, {
//     foreignKey: 'id_caisse'
// });

// // liaison entre caisse et bar simple
// Caisse.hasMany(BarSimple, {
//     foreignKey: 'id_caisse'
// });
// BarSimple.belongsTo(Caisse, {
//     foreignKey: 'id_caisse'
// });

// // liaison entre caisse et appartement
// Caisse.hasMany(Appartement, {
//     foreignKey: 'id_caisse'
// });
// Appartement.belongsTo(Caisse, {
//     foreignKey: 'id_caisse'
// });

// // liaison entre caisse et bar vip
// Caisse.hasMany(BarVip, {
//     foreignKey: 'id_caisse'
// });
// BarVip.belongsTo(Caisse, {
//     foreignKey: 'id_caisse'
// });

// // liaison entre caisse et cuisine
// Caisse.hasMany(Cuisine, {
//     foreignKey: 'id_caisse'
// });
// Cuisine.belongsTo(Caisse, {
//     foreignKey: 'id_caisse'
// });

// // liaison entre caisse et maison close
// Caisse.hasMany(MaisonColse, {
//     foreignKey: 'id_caisse'
// });
// MaisonColse.belongsTo(Caisse, {
//     foreignKey: 'id_caisse'
// });

// // liaison entre personnel et poste
// Personnel.hasMany(Poste, {
//     foreignKey: 'id_personnel'
// });
// Poste.belongsTo(Personnel, {
//     foreignKey: 'id_personnel'
// });

// // liaison entre poste et sanction
// Poste.hasMany(Sanction, {
//     foreignKey: 'id_poste'
// });
// Sanction.belongsTo(Poste, {
//     foreignKey: 'id_poste'
// });

// sequelize.sync({force: false})
//     .then(_ => console.log('Base synchronisee'))
//     .catch(err => console.log('Erreur ' + err))