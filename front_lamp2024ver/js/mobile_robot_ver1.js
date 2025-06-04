// topics
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

  /*
  const STR_SRES = 'survey_response:';
  const STR_BRES = 'build_response:';
  const STR_DRES = 'stop_response:';

  const STR_OK = 'OK';
  const STR_ERR = 'ERR';
  */

  const items_text = message.payloadString.replace('.', '_');
  const items_obj = JSON.parse(items_text);
  console.log(items_obj.RTC_TimedDouble.data);
  const start_x = 65;
  const end_x = 780;
  const start_y = 460;
  const position_x = Number(start_x) + Number(end_x - start_x) * Number(items_obj.RTC_TimedDouble.data);
  $('#frame1').html('<img id="img5" src="robot2.png" class="s2" style="top:' + start_y + 'px; left:' + position_x +'px"/><br>');
  /*
  $(function(){
    if((message.payloadString).indexOf(STR_SRES) != -1){
      let target = (message.payloadString).slice((STR_SRES).length);
      let nogp1 = false;
      let nogp2 = false;
      let nogp3 = false;
      switch(target){
        case NUMROBOTS[0]:
          $('#cbsmall00').prop('disabled', false);
          break;
        case NUMROBOTS[1]:
          $('#cbsmall01').prop('disabled', false);
          break;
        case NUMROBOTS[2]:
          $('#cbsmall02').prop('disabled', false);
          break;
        case NUMROBOTS[3]:
          $('#cbsmall03').prop('disabled', false);
          break;
        default:
          nogp1 = true;
          break;
      }
      if(nogp1 == false){
        $('#cbmiddle0').prop('disabled', false);
      }
      switch(target){
        case NUMROBOTS[4]:
          $('#cbsmall04').prop('disabled', false);
          break;
        case NUMROBOTS[5]:
          $('#cbsmall05').prop('disabled', false);
          break;
        case NUMROBOTS[6]:
          $('#cbsmall06').prop('disabled', false);
          break;
        case NUMROBOTS[7]:
          $('#cbsmall07').prop('disabled', false);
          break;
        default:
          nogp2 = true;
          break;
      }
      if(nogp2 == false){
        $('#cbmiddle1').prop('disabled', false);
      }
      switch(target){
        case NUMROBOTS[8]:
          $('#cbsmall08').prop('disabled', false);
          break;
        case NUMROBOTS[9]:
          $('#cbsmall09').prop('disabled', false);
          break;
        case NUMROBOTS[10]:
          $('#cbsmall10').prop('disabled', false);
          break;
        case NUMROBOTS[11]:
          $('#cbsmall11').prop('disabled', false);
          break;
        default:
          nogp3 = true;
          break;
      }
      if(nogp3 == false){
        $('#cbmiddle2').prop('disabled', false);
      }
      if(nogp1 == false || nogp2 == false || nogp3 == false){
        $('#cblarge0').prop('disabled', false);
        $('#select2nd').prop('disabled', false);
        $('#'+target).html(RBTCONFIRM);
        $('#status').append('<font color="#00dd00">ロボット'+target+' の接続が確認されました。</font></br>');
      }
    }
    else if((message.payloadString).indexOf(STR_BRES) != -1){
      let actchk = false;
      if((message.payloadString).indexOf(STR_OK) != -1){
        for(let i in NUMROBOTS){
          if((message.payloadString).indexOf(NUMROBOTS[i]) != -1){
            $('#'+NUMROBOTS[i]).html(RBTACTIVATE);
            $('#status').append('<font color="#ff0000">ロボット'+NUMROBOTS[i]+' のシステム構築および起動完了</font></br>');
            actchk = true;
          }
        }
      }
      else if((message.payloadString).indexOf(STR_ERR) != -1){
        for(let i in NUMROBOTS){
          if((message.payloadString).indexOf(NUMROBOTS[i]) != -1){
            $('#'+NUMROBOTS[i]).html(RBTACTFAIL);
            $('#status').append('<font color="#ff0000">ロボット'+NUMROBOTS[i]+' のシステム構築および起動失敗。</font></br>');
          }
        }
      }
      if(actchk == true){
        $('#select3rd').prop('disabled', false);
      }
    }
    else if((message.payloadString).indexOf(STR_DRES) != -1){
      if((message.payloadString).indexOf(STR_OK) != -1){
        for(let i in NUMROBOTS){
          if((message.payloadString).indexOf(NUMROBOTS[i]) != -1){
            $('#'+NUMROBOTS[i]).html(RBTDEACT);
            $('#status').append('<font color="#cc00cc">ロボット'+NUMROBOTS[i]+' のシステム停止完了</font></br>');
          }
        }
      }
      else if((message.payloadString).indexOf(STR_ERR) != -1){
        for(let i in NUMROBOTS){
          if((message.payloadString).indexOf(NUMROBOTS[i]) != -1){
            $('#'+NUMROBOTS[i]).html(RBTDEACTFAIL);
            $('#status').append('<font color="#cc00cc">ロボット'+NUMROBOTS[i]+' のシステム停止失敗</font></br>');
          }
        }
      }
    }
  });
  */
}

// publish commands to robots
/*
function mosq_pub(ptopic, pqos, pmessage){
  let message = new Paho.MQTT.Message(pmessage);
  message.destinationName = ptopic;
  message.qos = pqos;
  client.send(message);
}

function ctrl_rbtsystem(str_req){
  let chk = $('#cblarge0').prop('checked');
  if(chk == true){
    pubmess = str_req + $('#cblarge0').val();
    //$('#status').append('<font color="#444444">■ 災害対策ロボット全体</font></br>');
    $('#status').append('<font color="#444444">■ デモ用ロボット全体</font></br>');
    mosq_pub(pubtopic, ROBUST_QOS, pubmess);
  }
  else{
    chk = $('#cbmiddle0').prop('checked');
    if(chk == true){
      pubmess = str_req + $('#cbmiddle0').val();
      $('#status').append('<font color="#444444">■ 第1グループ</font></br>');
      mosq_pub(pubtopic, ROBUST_QOS, pubmess);
    }
    else{
      $('input[name="smallgroup0"]:checked').map(function(){
        let val = $(this).val();
        pubmess = str_req + val;
        $('#status').append('<font color="#444444">■ ロボット'+val+'</font></br>');
        mosq_pub(pubtopic, ROBUST_QOS, pubmess);
      });
    }
    chk = $('#cbmiddle1').prop('checked');
    if(chk == true){
      pubmess = str_req + $('#cbmiddle1').val();
      $('#status').append('<font color="#444444">■ 第2グループ</font></br>');
      mosq_pub(pubtopic, ROBUST_QOS, pubmess);
    }
    else{
      $('input[name="smallgroup1"]:checked').map(function(){
        let val = $(this).val();
        pubmess = str_req + val;
        $('#status').append('<font color="#444444">■ ロボット'+val+'</font></br>');
        mosq_pub(pubtopic, ROBUST_QOS, pubmess);
      });
    }
    chk = $('#cbmiddle2').prop('checked');
    if(chk == true){
      pubmess = str_req + $('#cbmiddle2').val();
      $('#status').append('<font color="#444444">■ 第3グループ</font></br>');
      mosq_pub(pubtopic, ROBUST_QOS, pubmess);
    }
    else{
      $('input[name="smallgroup2"]:checked').map(function(){
        let val = $(this).val();
        pubmess = str_req + val;
        $('#status').append('<font color="#444444">■ ロボット'+val+'</font></br>');
        mosq_pub(pubtopic, ROBUST_QOS, pubmess);
      });
    }
  }
}
*/

/*
function ctrl_label(pchk, pchkid){
  if(pchk == true){
    $('label[for="'+pchkid+'"]').css({
      'background-color': '#ffa500',
      'color': '#fff'
    }).unbind('mouseenter').unbind('mouseleave');
  }
  else{
    $('label[for="'+pchkid+'"]').css({
      'background-color': '#f0e69c',
      'color': '#000'
    }).hover(function(){
      $(this).css('background-color', '#f5f5dc');
      }, function(){
      $(this).css('background-color', '#f0e68c');
    });
  }
}
*/

/*
function ctrl_label2(pchk, pchkid){
  if(pchk == true){
    $('label[for="'+pchkid+'"]').css({
      'background-color': '#0063A4',
      'color': '#ff0'
    }).unbind('mouseenter').unbind('mouseleave');
  }
  else{
    $('label[for="'+pchkid+'"]').css({
      'background-color': '#cccccc',
      'color': '#000'
    }).hover(function(){
      $(this).css('background-color', '#e2edf9');
      }, function(){
      $(this).css('background-color', '#cccccc');
    });
  }
}
*/

/*
$(function(){
  $('#cbmiddle0').on('change', function(){
    $('input[name="smallgroup0"]:enabled').prop('checked', this.checked);
  });
  $('#cbmiddle1').on('change', function(){
    $('input[name="smallgroup1"]:enabled').prop('checked', this.checked);
  });
  $('#cbmiddle2').on('change', function(){
    $('input[name="smallgroup2"]:enabled').prop('checked', this.checked);
  });
  $('#cblarge0').on('change', function(){
    $('input[name="middlegroup"]:enabled').prop('checked', this.checked);
    $('input[name="smallgroup0"]:enabled').prop('checked', this.checked);
    $('input[name="smallgroup1"]:enabled').prop('checked', this.checked);
    $('input[name="smallgroup2"]:enabled').prop('checked', this.checked);
  });
  $('#chkbtn').on('click', function(){
    const STR_SREQ = 'survey_request:';
    const STR_BREQ = 'build_request:';
    const STR_DREQ = 'stop_request:';
    let pubmessi = '';
    let radioval = $('input[name="intgroup"]:checked').val();
    //console.log(radioval);

    if(radioval === RADIOVALS[0]){
      $('#status').html('接続確認中・・・</br>');
      pubmess = STR_SREQ;
      mosq_pub(pubtopic, ROBUST_QOS, pubmess);
    }
    else if(radioval === RADIOVALS[1]){
      ctrl_rbtsystem(STR_BREQ);
      $('#status').append('<font color="#000">に対してシステム構築＆起動命令発行・・・</font></br>');
    }
    else if(radioval === RADIOVALS[2]){
      ctrl_rbtsystem(STR_DREQ);
      $('#status').append('<font color="#000">に対してシステム停止命令発行・・・</font></br>');
    }
  });
  $('input[type="checkbox"]').on('change', function(){
    //let chk = $(this).prop('checked');
    //let chkid = $(this).attr('id');
    //ctrl_label(chk, chkid);
    let cntck = 0;
    $('input[type="checkbox"]:checked').map(function(){
      cntck++;
    });
    if(cntck > 0){
      $('#chkbtn').prop('disabled', false);
    }
    else{
      $('#chkbtn').prop('disabled', true);
    }
  });
  $('input[name="intgroup"]').on('change', function(){
    let rdval = $(this).val();
    if(rdval === RADIOVALS[0]){
      $('#chkbtn').prop('disabled', false);
    }
    else if(rdval === RADIOVALS[1] || rdval === RADIOVALS[2]){
      let cntck = 0;
      $('input[type="checkbox"]:checked').map(function(){
        cntck++;
      });
      if(cntck > 0){
        $('#chkbtn').prop('disabled', false);
      }
      else{
        $('#chkbtn').prop('disabled', true);
      }
    }
  });
});
*/
