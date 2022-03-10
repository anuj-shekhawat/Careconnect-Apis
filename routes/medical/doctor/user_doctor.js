const express=require('express');
const doctorRouter=express();
const {getDoctorData}=require('../../../Queryfunctions/medical/doctor/user_doctor');
const {getDocsId}=require("../../../Queryfunctions/medical/general");
doctorRouter.get('/alldoctor',async(req,res)=>{
    const data=await getDoctorData();
    if(data){
        res.send(data);
    }else{
        res.status(404).send("Error in getting data");
    }
});

doctorRouter.get('/getdocsid',async(req,res)=>{
    try {
        const email=req.query.email;
        const role=req.query.role;
        const data=await getDocsId(email,role);
        if(data){
          res.send(data);
        }else{
          throw error;
        }
      } catch (error) {
        res.status(404).send("Error");
      }
})

module.exports=doctorRouter;