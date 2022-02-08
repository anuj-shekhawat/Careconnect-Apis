const express = require("express");
const dotenv=require('dotenv');
dotenv.config();
const https = require("https");
const cors = require('cors');
const qs = require("querystring");
const checksum_lib=require('./paytm/checksum.js');
const config=require('./paytm/config.js');
const app = express();
const bodyParser=require('body-parser')
const parseUrl = express.urlencoded({ extended: false });
const parseJson = express.json({ extended: false });
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

const firebase=require('firebase/app');
const {getFirestore,collection,getDocs}=require('firebase/firestore');

const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  databaseURL: process.env.DATABASE_URL,
  projectId:process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  appId: process.env.APP_ID,
  measurementId: process.env.MEASUREMENT_ID
};
const firebaseApp=firebase.initializeApp(firebaseConfig);
const db=getFirestore(firebaseApp);
const getUserId=require('./db.js');
var userId;

app.get("/", (req, res) => {
  res.send("This is an API");
});

app.get(`/pay`,async(req,res)=>{
  userId=await getUserId(db,req.query.email,req.query.role);
  if(parseInt(req.query.amount) !== NaN){
    res.sendFile(__dirname + "/views/index.html");
  }else{
    res.send('404 error');
  }
});

app.get('/callback',(req,res)=>{
  res.send("Return back to CareConnect Application");
})

app.post("/paynow", [parseUrl, parseJson], (req, res) => {
    // Route for making payment
    var paymentDetails = {
      amount: req.body.amount,
      customerId: userId,
      customerEmail: req.body.email || process.env.PAYTM_EMAIL,
      customerPhone: req.body.phone || process.env.PAYTM_PHONE
  }


  if(!paymentDetails.amount || !paymentDetails.customerId || !paymentDetails.customerEmail || !paymentDetails.customerPhone) {
      res.status(400).send('Payment failed')
  } else {
      var params = {};
      params['MID'] = config.PaytmConfig.mid;
      params['WEBSITE'] = config.PaytmConfig.website;
      params['CHANNEL_ID'] = 'WEB';
      params['INDUSTRY_TYPE_ID'] = 'Retail';
      params['ORDER_ID'] = 'TEST_'  + new Date().getTime();
      params['CUST_ID'] = paymentDetails.customerId;
      params['TXN_AMOUNT'] = paymentDetails.amount;
      params['CALLBACK_URL'] = 'http://localhost:3000/callback';
      params['EMAIL'] = paymentDetails.customerEmail;
      params['MOBILE_NO'] = paymentDetails.customerPhone;
  
  
      checksum_lib.genchecksum(params, config.PaytmConfig.key, function (err, checksum) {
          var txn_url = "https://securegw-stage.paytm.in/theia/processTransaction"; // for staging
          // var txn_url = "https://securegw.paytm.in/theia/processTransaction"; // for production
  
          var form_fields = "";
          for (var x in params) {
              form_fields += "<input type='hidden' name='" + x + "' value='" + params[x] + "' >";
          }
          form_fields += "<input type='hidden' name='CHECKSUMHASH' value='" + checksum + "' >";
  
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.write('<html><head><title>Merchant Checkout Page</title></head><body><center><h1>Please do not refresh this page...</h1></center><form method="post" action="' + txn_url + '" name="f1">' + form_fields + '</form><script type="text/javascript">document.f1.submit();</script></body></html>');
          res.end();
      });
  }
  });

app.listen(PORT, () => {
  console.log(`App is listening on Port ${PORT}`);
});