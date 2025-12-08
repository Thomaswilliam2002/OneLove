const {Client, Appartement} = require('../../db/sequelize')
const {AppartJournal} = require('../../db/sequelize')
const {protrctionRoot, authorise} = require('../../middleware/protectRoot');

formAddClient = (app) =>{
    app.get('/formAddClient', protrctionRoot, authorise('admin', 'gerant'), async (req, res) => {
        const appartements = await Appartement.findAll()
        if(appartements){
            res.status(200).render('add-client', {appartements: appartements})
        }else{
            console.log('erreure de selection all')
        }
        
    })
}
 
allClient = (app) => {
    app.get('/allClient', protrctionRoot, authorise('admin', 'comptable', 'gerant'), (req, res) => {
        Client.findAll({
            order:[['id_client', 'DESC']]
        })
            .then(clients => {
                AppartJournal.findAll({
                    include:[
                        {model:Appartement}
                    ]
                })
                    .then(appj =>{
                        res.status(200).render('client-list', {clients: clients,msg: req.query.msg, japparts: appj});
                    })
                    .catch(_ => console.log('erreure de selection all', _))
            })
            .catch(_ => console.log('erreure de selection all', _))
    })
}

addClient = (app) => {
    app.post('/addClient', protrctionRoot, authorise('admin', 'comptable', 'gerant'), async (req, res) => {
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
                    nuiter:nuiter,
                    id_appart:id_appart,
                    id_client:cli.id_client
                })
                res.redirect('/allClient?msg=ajout');
            }catch (e){
                console.log('erreure de ajout', e)
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
                        nuiter:nuiter,
                        id_appart:id_appart,
                        id_client:client.id_client
                    })
                    res.redirect('/allClient?msg=ajout');
                }catch (e){
                    console.log('erreure de ajout', e.message)
                }
            }
        }
        
    })
}

deleteClient = (app) => {
    app.delete('/deleteClient/:id', protrctionRoot, authorise('admin', 'comptable'), (req, res) => {
        Client.findByPk(req.params.id)
            .then(client => {
                const appartDel = client;
                Client.destroy({where: {id_client: appartDel.id_client}})
                    .then(_ => {
                        res.redirect('/allClient?msg=sup');
                    })
                    .catch(_ => console.log('erreure de suppression', _))
            })
    })
}

module.exports = {
    allClient,
    addClient,
    deleteClient,
    formAddClient
}