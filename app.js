const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const Nexmo = require('nexmo');
const socketio = require('socket.io');
require ('dotenv').config();

//Init Nexmo
const nexmo = new Nexmo({
  apiKey: process.env.NEXMO_KEY,
  apiSecret: process.env.NEXMO_SECRET
}, {debug: true} )
//Init app
const app = express();

//Template engine setup
app.set('view engine', 'html');
app.engine('html', ejs.renderFile);

//Public folder setup
app.use(express.static(__dirname + '/public'));

//Index Route
app.get('/', (req, res) => {
  res.render('index');
});

//Body Parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Catch form submit
app.post('/', (req, res) => {
  // res.send(req.body);
  // console.log(req.body);
const number = req.body.number
const text = req.body.text;
nexmo.message.sendSms(
  '12034089543', number, text, { type: 'unicode' },
  (err, responseData) => {
    if(err) {
      console.log(err);
    } else {
      console.dir(responseData);
      //Get data from the response
      const data = {
        id: responseData.messages[0]['message-id'],
        number: responseData.messages[0]['to']
      }

      //Emit to the client
      io.emit('smsStatus', data)
    }
  }
)
})

//Define port
const port = 8080;

//Start Server
const server = app.listen(port, () => console.log(`Warpgate locked on ${port}`));

//Connect to socket.io
const io = socketio(server)
io.on('connection', (socket) => {
  console.log("Plugged In");
  io.on('disconnect', () => {
    console.log('Plugged Out');
  })
})