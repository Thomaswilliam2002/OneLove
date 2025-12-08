const {CronJob} = require("cron")
const nodemeiler = require('nodemailer')
const fs = require("fs")
const inlineCss = require("inline-css")

email = async (resive, sujet, msg) => {
    const transporter = nodemeiler.createTransport({
        service: "gmail",
        auth:{
            user: "w98464103@gmail.com",
            pass:"98464103william"
        }
    })

    const templateFile = fs.readFileSync("./template/template.html", 'utf-8')

    const mailOption = {
        from: "w98464103@gmail.com",
        to: resive,
        subject: sujet,
        text: msg
    }

    await transporter.sendMail(mailOption, (e, info) => {
        if (e) {
            console.log(e)
        } else {
            console.log("Email envoyer avec succes:" + info.response)
        }
    })
}

const job = new CronJob(
    cronTime= "* * * * * *",
    onTick= () => {
        console.log("ok")
    },
    start= false
)

job.start()