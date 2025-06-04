// topics
//const TOPIC_REQ = 'request/robot/all/all';
//const TOPIC_RES = 'response/+/+/+';
//var pubtopic = TOPIC_REQ;
//var subtopic = TOPIC_RES;
const subtopic = 'test';

// publication options
//const ROBUST_QOS = 2;

// subscription options
const SUBSCRIPTION_OPTIONS = {
  qos: 2
};

// commands executed on robots
//const COMMAND1 = '/bin/bash /home/d-yoshi/ShellScript/startConsole.sh';

// Create a client instance
let client = new Paho.MQTT.Client('localhost', 9001, 'clientID' + new Date().getTime());
//let client = new Paho.MQTT.Client('163.143.85.105', 9090, 'clientID' + new Date().getTime());
//let client = new Paho.MQTT.Client('192.168.43.147', 9090, 'clientID' + new Date().getTime());

// set callback handlers
client.onConnectionLost = onConnectionLost;
client.onMessageArrived = onMessageArrived;

// connect the client
client.connect({onSuccess:onConnect});

// called when the client connects
function onConnect() {
  // Once a connection has been made, make a subscription and send a message.
  console.log("onConnect");
  //client.subscribe(SURV_TOPIC_RES);
  client.subscribe(subtopic, SUBSCRIPTION_OPTIONS);
  // publish the message
  //mosq_pub();
}

// called when the client loses its connection
function onConnectionLost(responseObject) {
  if(responseObject.errorCode !== 0) {
    console.log('onConnectionLost:'+responseObject.errorMessage);
  }
}

// called when a message arrives
function onMessageArrived(message) {
  console.log('onMessageArrived: '+message.payloadString);

  //const items_text = message.payloadString.replace('.', '_');
  //const items_obj = JSON.parse(items_text);
  const items_obj = JSON.parse(message.payloadString);
  //console.log(items_obj.RTC_TimedDouble.data);
  console.log(items_obj);
  console.log(items_obj['data']);
  let lamp_num;
  let color;
  switch(items_obj['lamp_num']){
    case 1:
      lamp_num = 'lamp1';
      break;
    case 2:
      lamp_num = 'lamp2';
      break;
    case 3:
      lamp_num = 'lamp3';
  }
  switch(items_obj['data']){
    case 1:
      color = '0.png';
      break;
    case 2:
      color = '1.png';
      break;
    case 3:
      color = '2.png';
  }
  //const start_x = 65;
  //const end_x = 780;
  //const start_y = 460;
  //const position_x = Number(start_x) + Number(end_x - start_x) * Number(items_obj.RTC_TimedDouble.data);
  //$('#frame1').html('<img id="img5" src="robot2.png" class="s2" style="top:' + start_y + 'px; left:' + position_x +'px"/><br>');
  $('#frame2').html('<img id="' + lamp_num + '" src="' + color + '" width="80" height="80" border="0">');
