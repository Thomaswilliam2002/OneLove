const protrctionRoot = (req, res, next) =>{
    if(!req.session.user){
        res.redirect('/login')
    }else{
        next();
    }
}

//verifier si le role est aitoriser
const authorise = (...roles) =>{
    return (req, res, next) => {
        const userRole = req.session?.user?.Personnel.type_personnel;
        if(!roles.includes(userRole)){
            return res.status(403).json({message: 'acces reffuser'})
        }
        next(); 
    };
}

const infos = (req, res, next) => {
    res.locals.user = req.session.user
    //console.log(res.locals.idUser)
    next();
}

module.exports = {protrctionRoot,authorise, infos};