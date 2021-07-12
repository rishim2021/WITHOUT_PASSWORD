
const express = require('express');

const router  = express.Router();

const db = require('../../../config/db');

const userModel = db.users;

const { validate } = require('../middleware/validation');
 
const auth = require('../middleware/authGuard');

const user = require('../../../common/models/user');

const jwt = require("jsonwebtoken");


router.get('/',async(req,res)=>{
    res.status(200).render('login',{ layout:false,name:'Akashdeep',login:1,register:0 });
})

router.post('/',async(req,res,next)=>{
    let bodyData = req.body;
    let userEmail = bodyData.UserEmail;
    const { error } = validate(bodyData)
    if(error) return res.status(400).send({Error:error.details[0].message}) 
    
    let existsUser = await userModel.findOne({ where : { UserEmail : bodyData.UserEmail }})
    if(!existsUser) return res.status(404).send({ msg : 'Data Not Found !!' })
    
    const jwtKey = "myJwtSecretKey"
    const jwtExpirySeconds = 3000

    const token = jwt.sign({ userEmail }, jwtKey, {
		algorithm: "HS256",
		expiresIn: jwtExpirySeconds,
	})

    res.cookie("token", token, { maxAge: jwtExpirySeconds * 1000 }).status(200).redirect('/login/home')

    res.end();

})


router.get('/home',auth,async(req,res)=>{

    let token = req.cookies.token;

    let userDecodeData = jwt.decode(token)

    let userData = await userModel.findOne({ where : { UserEmail : userDecodeData.userEmail }})

    res.status(200).render('home',{ userData : userData })
})


router.get('/logout',async(req,res)=>{
    res.clearCookie('connect.sid')
    res.clearCookie('token')
    res.status(200).redirect('/login')

})












module.exports = router;