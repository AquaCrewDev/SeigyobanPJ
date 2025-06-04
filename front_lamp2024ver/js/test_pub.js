var mqtt = require('mqtt');
const fs = require('fs');

const _ca_certs = '/etc/mosquitto/ca_certificates/ca.crt';
const _client_cert = '/home/dy-aqua/front_lamp/Certs_and_Key/client_v3.crt';
const _client_key = '/home/dy-aqua/front_lamp/Certs_and_Key/client.key';
  
var TRUSTED_CA_LIST = fs.readFileSync(_ca_certs);
var CERT = fs.readFileSync(_client_cert);
var KEY = fs.readFileSync(_client_key);

var PORT = 8883;
var HOST = 'localhost';
var _topic ='test';
//var _username = 'ral'
//var _password = 'ralpasswd'

var options = {
  port: PORT,
  host: HOST,
  rejectUnauthorized: false,
  // The CA list will be used to determine if server is authorized
  ca: TRUSTED_CA_LIST,
  cert: CERT,
  key: KEY,
  protocol: 'mqtts',
  secureProtocol: 'TLSv1_2_method'
  //username: _username,
  //password: _password 
}

var client = mqtt.connect(options);

client.subscribe(_topic);

client.publish(_topic, 'Current time is: ' + new Date());

client.on('message', function (topic, message) {
  console.log('subscribe->'+message);
});

client.on('connect', function () {
  console.log('Connected');
});

client.on('error', function (err) {
  console.log(err);
  client.end();
});
