const express = require("express")
const mongoose = require("mongoose")
const bodyParser = require("body-parser")
const nodemailer = require("nodemailer")
require("dotenv").config()

const User = require("./model/User")

const app = express()

//parser application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
    extended: false
}))
//parser application/json
app.use(bodyParser.json())

//connect mongodb
mongoose.connect("mongodb://localhost:27017/runoob", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(res => {
    console.log("mongodb connected")
}).catch(err => {
    console.log(err)
})

const port = process.env.PORT || 5000

app.get("/test", (req, res) => {
    res.json({
        state: "suc",
        msg: "it works"
    })
})

app.post("/addUser", (req, res) => {
    // console.log(req.body.username)
    // console.log(req.body.pwd)
    // console.log(req.body.email)
    User.findOne({
        email: req.body.email
    }).then(user => {
        if (user) {
            res.status(400).json({
                state: "failed",
                msg: "该用户已存在"
            })
        } else {
            const newUser = new User(({
                username: req.body.username,
                email: req.body.email,
                pwd: req.body.pwd,
            }))
            newUser.save().then((user) => {
                    res.status(200).json({
                        state: "success",
                        msg: "添加用户成功",
                        data: user
                    })
                })
                .catch(err => {
                    console.log(err)
                })
        }
    })
})

app.post("/retrievePwd", (req, res) => {
    User.findOne({
        email: req.body.email
    }).then(user => {
        // console.log(user)
        if (!user) {
            res.status(400).json({
                state: "failed",
                msg: "该用户不存在"
            })
        } else {
            // step 1
            let transporter = nodemailer.createTransport({
                service: "qq",
                secure: true,
                auth: {
                    user: process.env.EMAIL,
                    pass: process.env.PASSWORD
                }
            })

            // step 2
            let mailOptions = {
                from: "371164382@qq.com",
                to: req.body.email,
                // cc:"抄送",
                // bcc:"私密发送"
                subject: "找回密码",
                text: `您的用户名${user.username},密码${user.pwd}`
            }

            // step 3
            transporter.sendMail(mailOptions, (err, data) => {
                if (err) {
                    res.status(400).json({
                        state: "failed",
                        msg: err
                    })
                } else {
                    res.status(200).json({
                        state: "success",
                        msg: `密码已发送至您的邮箱${req.body.email}`
                    })
                }
            })
        }
    })
})

app.listen(port, () => {
    console.log(`服务运行中,端口为:${port}`)
})