// トピック名
const subtopic_image = ''; // AWS IoT Coreのトピック
const subtopic_robo = ''; // ロボットのスライダーに関するAWS IoT Coreのトピック

// subscription options： QoSは1
const SUBSCRIPTION_OPTIONS = {
  qos: 1
};

// SigV4 Utils (AWS認証のための署名生成関数)
function SigV4Utils() {}

SigV4Utils.sign = function(key, msg) {
  var hash = CryptoJS.HmacSHA256(msg, key);
  return hash.toString(CryptoJS.enc.Hex);
};

SigV4Utils.sha256 = function(msg) {
  var hash = CryptoJS.SHA256(msg);
  return hash.toString(CryptoJS.enc.Hex);
};

SigV4Utils.getSignatureKey = function(key, dateStamp, regionName, serviceName) {
  var kDate = CryptoJS.HmacSHA256(dateStamp, 'AWS4' + key);
  var kRegion = CryptoJS.HmacSHA256(regionName, kDate);
  var kService = CryptoJS.HmacSHA256(serviceName, kRegion);
  var kSigning = CryptoJS.HmacSHA256('aws4_request', kService);
  return kSigning;
}

// AWS IoT Coreへの接続エンドポイントの生成
function createEndpoint(regionName, awsIotEndpoint, accessKey, secretKey) {
  var time = moment.utc();
  var dateStamp = time.format('YYYYMMDD');
  var amzdate = dateStamp + 'T' + time.format('HHmmss') + 'Z';
  var service = 'iotdevicegateway';
  var region = regionName;
  var algorithm = 'AWS4-HMAC-SHA256';
  var method = 'GET';
  var canonicalUri = '/mqtt';
  var host = awsIotEndpoint;

  var credentialScope = dateStamp + '/' + region + '/' + service + '/' + 'aws4_request';
  var canonicalQuerystring = 'X-Amz-Algorithm=AWS4-HMAC-SHA256';
  canonicalQuerystring += '&X-Amz-Credential=' + encodeURIComponent(accessKey + '/' + credentialScope);
  canonicalQuerystring += '&X-Amz-Date=' + amzdate;
  canonicalQuerystring += '&X-Amz-SignedHeaders=host';

  var canonicalHeaders = 'host:' + host + '\n';
  var payloadHash = SigV4Utils.sha256('');
  var canonicalRequest = method + '\n' + canonicalUri + '\n' + canonicalQuerystring + '\n' + canonicalHeaders + '\nhost\n' + payloadHash;

  var stringToSign = algorithm + '\n' + amzdate + '\n' + credentialScope + '\n' + SigV4Utils.sha256(canonicalRequest);
  var signingKey = SigV4Utils.getSignatureKey(secretKey, dateStamp, region, service);
  var signature = SigV4Utils.sign(signingKey, stringToSign);

  canonicalQuerystring += '&X-Amz-Signature=' + signature;
  return 'wss://' + host + canonicalUri + '?' + canonicalQuerystring;
}

// エンドポイントとAWSアクセスキー、シークレットキーを使用してWebSocketエンドポイントを生成
var endpoint = createEndpoint(
  'ap-northeast-1', // AWSリージョン
  '', // AWS IoT Coreエンドポイント
  '', // あなたのAWSアクセスキー
  '' // あなたのAWSシークレットキー
);

// MQTTクライアントインスタンスの作成
var clientId = 'clientID-' + Math.random().toString(36).substring(7);
var client = new Paho.MQTT.Client(endpoint, clientId);

// コールバックの設定
client.onConnectionLost = onConnectionLost;
client.onMessageArrived = onMessageArrived;

// MQTT Brokerへの接続
client.connect({
  useSSL: true,
  timeout: 3,
  mqttVersion: 4,
  onSuccess: onConnect
});

// 接続に成功した場合のコールバック
function onConnect() {
  console.log("Connected to AWS IoT Core");
  
  // imageトピックとroboトピックに対してsubscribe
  client.subscribe(subtopic_image, SUBSCRIPTION_OPTIONS);
  client.subscribe(subtopic_robo, SUBSCRIPTION_OPTIONS);
}

// 接続を失った場合のコールバック
function onConnectionLost(responseObject) {
  if (responseObject.errorCode !== 0) {
    console.log('Connection lost: ' + responseObject.errorMessage);
  }
}

// メッセージを受け取った場合のコールバック
function onMessageArrived(message) {
  console.log('Message arrived: ' + message.payloadString);

  try {
    // メッセージをパース
    const payload = JSON.parse(message.payloadString);
    
    if (message.destinationName === subtopic_image) {
      // imageトピックからのデータ処理 (ランプの状態を変更)
      handleImageTopicMessage(payload);
    } else if (message.destinationName === subtopic_robo) {
      // roboトピックからのデータ処理 (ロボットの位置を更新)
      handleRoboTopicMessage(payload);
    }
  } catch (e) {
    console.error("Failed to parse message payload as JSON", e);
  }
}

// imageトピックのメッセージを処理する関数
function handleImageTopicMessage(payload) {
  // RTC.TimedShortSeq のデータが存在するかチェック
  if (payload && payload["RTC.TimedShortSeq"] && payload["RTC.TimedShortSeq"].data) {
    const data_list = payload["RTC.TimedShortSeq"].data;
    console.log("data_list:", data_list);
//    console.log("Fisrt data:", data_list[0]);
//    split_list1 = data_list[0].split(' ').join(',')
//    console.log("split_list1:", split_list1[2]);
    
//    console.log("Second data:", data_list[1]);
//    split_list2 = data_list[1].split(' ').join(',')
//    console.log("split_list2:", split_list2[2]);
    
//    console.log("Second data:", data_list[2]);
//    split_list3 = data_list[2].split(' ').join(',')
//    console.log("split_list3:", split_list3[2]);
    

    
     
    // ランプの色変更処理と回転処理を実行
    // ランプ状態はdata_listのインデックス1, 5, 9に格納されていると仮定
    updateLampState(data_list[1], data_list[5], data_list[9]);
  //  updateLampState(split_list1[2], split_list2[2], split_list3[2]);
  } else {
    console.error("TimedShortSeq data is missing or not in the expected format.");
  }
}

// roboトピックのメッセージを処理する関数
function handleRoboTopicMessage(payload) {
  if (payload && payload["RTC.TimedShortSeq"] && payload["RTC.TimedShortSeq"].data) {
    const data_list = payload["RTC.TimedShortSeq"].data;

    console.log("Received data_list[0]:", data_list[0]);

    // data_list[0]の値を取得（0から0.5の範囲を期待）
    let position_x = parseFloat(data_list[0]); 

    // position_xが0から0.5の範囲内かをチェックし、範囲内に収める
   // if (position_x < 0) {
   //   position_x = 0;
   // } else if (position_x > 0.5) {
   //   position_x = 0.5;
    //}

    console.log("Clipped position_x (0 to 0.5 range):", position_x);

    // ロボット画像の移動を反映する
    const imgElement = document.createElement('img');
    imgElement.src = "robot2.png";
    imgElement.className = "s2";
    imgElement.style.position = "absolute";
    imgElement.style.top = '460px';  // 固定
    imgElement.style.left = (position_x * 800) + 'px';  // 0~0.5の範囲を1600pxに拡大

    // 画像をframe1に追加
    const frame = document.getElementById('frame1');
    frame.innerHTML = '';  // フレームをクリア
    frame.appendChild(imgElement);  // 画像を追加
  } else {
    console.error("Robo Position data is missing or not in the expected format.");
  }
}



// ランプの状態に応じて画像を更新し、同時に画像を回転させる関数
function updateLampState(lamp1State, lamp2State, lamp3State) {
  // ランプの状態に基づいて画像を更新し、回転角度を決定
  updateLampAndRotate('lamp1', 'img1', lamp1State);
  updateLampAndRotate('lamp2', 'img2', lamp2State);
  updateLampAndRotate('lamp3', 'img3', lamp3State);

  console.log('Lamp1: ' + lamp1State + ', Lamp2: ' + lamp2State + ', Lamp3: ' + lamp3State);
}

// ランプの状態に基づいて画像と回転を同時に更新するヘルパー関数
function updateLampAndRotate(lampId, imgId, state) {
  var imgElement = document.getElementById(imgId);
  var lampElement = document.getElementById(lampId);

  // 状態に応じた画像の更新と回転処理
  switch(state) {
    case 0:
      lampElement.src = '0.png';
      imgElement.style.transform = 'rotate(0deg)';
      break;
    case 1:
      lampElement.src = '1.png';
      imgElement.style.transform = 'rotate(60deg)';
      break;
    case 2:
      lampElement.src = '2.png';
      imgElement.style.transform = 'rotate(120deg)';
      break;
    default:
      lampElement.src = '0.png';
      imgElement.style.transform = 'rotate(0deg)';
      break;
  }
}

