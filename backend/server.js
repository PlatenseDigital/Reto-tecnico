const express = require("express");
const app = express();
const path = require('path');
const cors = require('cors')

app.use(cors());

const port = process.env.PORT || 3005;

app.listen(port, function () {
    console.log('backend listening on port ' + port + '!');
  });

  app.get('/', function(req,res){
    res.sendFile(path.join(__dirname, '../carsJSON.json'));
  })