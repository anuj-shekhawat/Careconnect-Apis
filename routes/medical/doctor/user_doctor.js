const express=require('express');
const doctorRouter=express();
const {getDoctorData}=require('../../../Queryfunctions/medical/doctor/user_doctor');
const {getDocsId,getUserInfo,updateUserData,addUser}=require("../../../Queryfunctions/medical/general");

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
});

doctorRouter.get('/info',async(req,res)=>{
    const documentid=req.query.documentid;
    const role=req.query.role;
    try {
      const data=await getUserInfo(documentid,role);
      if(data){
        res.send(data);
      }else{
        throw error;
      }
    } catch (error) {
      res.status(404).send("Error");
    }
});

doctorRouter.post('/update',async(req,res)=>{
  try {
    let documentid=req.body.documentid;
    let collection=req.body.collection;
    let data=JSON.parse(req.body.data);
    await updateUserData(documentid,data,collection);
    res.send("Sucess");
  } catch (error) {
    res.status(404).send("Error");
  }
});

doctorRouter.post('/add',async(req,res)=>{
  try {;
    let collection=req.body.collection;
    let data=JSON.parse(req.body.data);
    await addUser(collection,data);
    res.send("Sucess");
  } catch (error) {
    res.status(404).send("Error");
  }
});

module.exports=doctorRouter;