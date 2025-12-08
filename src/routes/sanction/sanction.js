const { where } = require('sequelize')
const {Sanction, Occupe, Personnel} = require('../../db/sequelize')
const occupe = require('../../models/occupe')
const {protrctionRoot, authorise} = require('../../middleware/protectRoot');

allSanction = (app) => {
    app.get('/allSanction/:id', protrctionRoot, authorise('admin', 'comptable'), (req, res) => {
        Sanction.findAll({
            order:[['id_sanction', 'DESC']]
        })
            .then(sanctions => {
                const msg = "Liste recuperer avec succes"
                res.json({msg, data: sanctions})
            })
            .catch(_ => console.log('erreure de selection all'))
    })
}

formAddSamction = (app) =>{
    app.get('/formAddSamction/:id', protrctionRoot, authorise('admin', 'comptable'), (req, res) =>{
        console.log(req.params.id)
        res.status(200).render('add-sanction', {id: req.params.id})
    })
}

oneSanction = (app) => {
    app.get('/oneSanction/:id', protrctionRoot, authorise('admin', 'comptable'), (req, res) => {
        Sanction.findByPk(req.params.id)
            .then(sanction => {
                const msg = "sanction recuperer avec succes"
                res.json({msg, data: sanction})
            })
            .catch(_ => console.log('erreure de selection'))
    })
}

addSanction = (app) => {
    app.post('/addSanction/:id', protrctionRoot, authorise('admin', 'comptable'), (req, res) => {
        const {motif, desc, montant, date} = req.body;
        Personnel.findOne({
            where: {id_personnel: req.params.id}
        })
            .then(personnel => {
                Occupe.findOne({
                    where:{id_personnel: personnel.id_personnel}
                })
                    .then(occupe => {
                        console.log(occupe)
                        Sanction.create({
                            motif: motif,
                            description: desc,
                            montan_defalquer: montant,
                            date: date,
                            id_occupe: occupe.id_occupe
                        })
                            .then(sanction => {
                                res.redirect('/allPersonnel?allType=pas_admin');
                            })
                            .catch(_ => console.log('erreure de ajout', _))
                    })
                    .catch(_ => console.log('erreure de selection', _))
            })
            .catch(_ => console.log('erreure de selection', _))
        

        
    })
}

updateSanction = (app) => {
    app.put('/updateSanction/:id', protrctionRoot, authorise('admin', 'comptable'), (req, res) => {
        Sanction.update(req.body, {
            where: {id: req.params.id}
        })
            .then(_ => {
                const msg = "Modification de la sanction avec succes"
                res.json({msg})
            })
            .catch(_ => console.log('erreure de modification'))
    })
}

deleteSanction = (app) => {
    app.delete('/deleteSanction/:id', protrctionRoot, authorise('admin', 'comptable'), (req, res) => {
        Sanction.findByPk(req.params.id)
            .then(sanction => {
                const appartDel = sanction;
                Sanction.destroy({where: {id: appartDel.id}})
                    .then(_ => {
                        const msg = "Suppression de la sanction avec succes"
                        res.json({msg})
                    })
                    .catch(_ => console.log('erreure de suppression'))
            })
    })
}

module.exports = {
    allSanction,
    oneSanction,
    addSanction,
    updateSanction,
    deleteSanction,
    formAddSamction
}