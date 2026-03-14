const {Client, Appartement, AppartJournal, sequelize} = require('../../db/sequelize')
const {protrctionRoot, authorise} = require('../../middleware/protectRoot');

formAddClient = (app) =>{
    app.get('/formAddClient', protrctionRoot, authorise('admin', 'gerant', 'comptable', 'caissier'), async (req, res) => {
        const appartements = await Appartement.findAll({where: {is_active: true}});
        if(appartements){
            res.status(200).render('add-client', {appartements: appartements})
        }else{
            res.redirect('/notFound');
            return; // On stoppe tout ici !
        }
        
    })
}
 
allClient = (app) => {
    app.get('/allClient', protrctionRoot, authorise('admin', 'comptable', 'gerant', 'caissier', 'caissier central'), (req, res) => {
        Client.findAll({
            where: {is_active: true},
            order:[['id_client', 'DESC']]
        })
            .then(clients => {
                AppartJournal.findAll({
                    include:[
                        {model:Appartement, where: {is_active: true}, required: true}
                    ],
                    where: {is_active: true},
                    order:[['id_journal', 'DESC']]
                })
                    .then(appj =>{
                        res.status(200).render('client-list', {clients: clients,msg: req.query.msg, japparts: appj});
                    })
                    .catch(_ => {
                        console.error(_);
                        res.redirect('/notFound');
                        return; // On stoppe tout ici !
                    })
            })
            .catch(_ => {
                console.error(_);
                res.redirect('/notFound');
                return; // On stoppe tout ici !
            })
    })
}

addClient = (app) => {
    app.post('/addClient', protrctionRoot, authorise('admin', 'comptable', 'gerant', 'caissier'), async (req, res) => {
        const {nom, prenom, numero, loyer, nuiter, id_appart, commentaire, date} = req.body;
        const cli = await Client.findOne({
            where:{nom_client: nom,
                prenom_client:prenom
            }
        })
        if(cli){
            try{
                //console.log(cli)
                let nd = new Date(date);
                let d = nd.setDate(nd.getDate() + nuiter)
                AppartJournal.create({
                    date_debut:date,
                    date_fin: d,
                    loyer: loyer,
                    nuiter:nuiter || 0,
                    id_appart:id_appart,
                    id_client:cli.id_client
                })
                res.redirect('/allClient?msg=Client ajouter avec succes&tc=alert-success');
            }catch (e){
                console.error(e);
                res.redirect('/notFound');
                return; // On stoppe tout ici !
            }
            
        }else{
            const client = await Client.create({
                nom_client: nom,
                prenom_client: prenom,
                numero_client: numero,
                comentaire_client: commentaire
            })
            if(client){
                try{
                    let nd = new Date(date);
                    let d = nd.setDate(nd.getDate() + parseInt(nuiter))
                    AppartJournal.create({
                        date_debut:date,
                        date_fin: d,
                        loyer: loyer,
                        nuiter:nuiter || 0,
                        id_appart:id_appart,
                        id_client:client.id_client
                    })
                    res.redirect('/allClient?msg=Client ajouter avec succes&tc=alert-success');
                }catch (e){
                    console.error(e);
                    res.redirect('/notFound');
                    return; // On stoppe tout ici !
                }
            }
        }
        
    })
}

deleteClient = (app) => {
    app.delete('/deleteClient/:id', protrctionRoot, authorise('admin', 'comptable'), async (req, res) => {
        try{
            const t = await sequelize.transaction();
            Client.update({is_active: false}, {where: {id_client: req.params.id}, transaction: t});
            await AppartJournal.update({is_active: false}, {where: {id_client: req.params.id, is_active: true}, transaction: t});

            await t.commit();

            res.redirect('/allClient?msg=Suppression de client avec succes&tc=alert-success');
        }
        catch(e){
            console.error(e);
            await t.rollback();
            res.redirect('/notFound');
            return; // On stoppe tout ici !
        }
    })
}

module.exports = {
    allClient,
    addClient,
    deleteClient,
    formAddClient
}