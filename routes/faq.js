const express = require("express");
const db = require(__dirname + "/db_connect");
const router = express.Router();
router.get('/', async(req,res)=>{
    const faqTitle= "SELECT * FROM `faqTitle` "

    const faqTitleResponse = await db.query(faqTitle)
     

    const faqSubtitle ="SELECT `faqsubtitle`.`titleId`, `faqsubtitle`.`subtitle`, `faqsubtitle`.`subtitleContent` FROM `faqsubtitle`"
    const faqSubtitleResponse = await db.query(faqSubtitle)

    

    res.json([faqTitleResponse[0],faqSubtitleResponse[0]])
})

module.exports = router

