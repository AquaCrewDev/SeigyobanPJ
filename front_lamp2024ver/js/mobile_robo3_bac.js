// トピック名
const subtopic = ''; // AWS IoT Coreのトピック

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
};

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
  '', // AWSリージョン
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
  // subscribe開始
  client.subscribe(subtopic, SUBSCRIPTION_OPTIONS);
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
    
    // RTC.TimedShortSeq のデータが存在するかチェック
    if (payload && payload["RTC.TimedShortSeq"] && payload["RTC.TimedShortSeq"].data) {
      const timedShortSeq = payload["RTC.TimedShortSeq"].data;

      console.log("Received TimedShortSeq data:", timedShortSeq);

      // ロボットの移動座標の計算
      const start_x = 65;
      const end_x = 780;
      const start_y = 460;
      const position_x = start_x + (end_x - start_x) * (timedShortSeq[0] / 100); // 例として、data[0]を使う

      // ロボット画像の移動を反映する
      document.getElementById('frame1').innerHTML = '<img id="img5" src="robot2.png" class="s2" style="top:' + start_y + 'px; left:' + position_x + 'px"/><br>';
    } else {
      console.error("TimedShortSeq data is missing or not in the expected format.");
    }
  } catch (e) {
    console.error("Failed to parse message payload as JSON", e);
  }
}

