const awsIot = require('aws-iot-device-sdk');

// AWS IoTデバイス設定
const device = awsIot.device({
   keyPath: '/home/aqua/aqua_aws_setting/00962ca4ef67e4bfd61f6d7281e9fce21556e22305c70b7c9834dd659374ee52-private.pem.key',
   certPath: '/home/aqua/aqua_aws_setting/00962ca4ef67e4bfd61f6d7281e9fce21556e22305c70b7c9834dd659374ee52-certificate.pem.crt',
   caPath: '/home/aqua/aqua_aws_setting/AmazonRootCA1.pem',
   clientId: 'clientID_' + new Date().getTime(),
   host: 'a3o0r3on150edr-ats.iot.ap-northeast-1.amazonaws.com',
   port: 8883
});

// トピック設定
const topic = 'robot_project/aki150103/lamp';

// 接続イベントの処理
device.on('connect', function() {
    console.log('Connected to AWS IoT Core');
    device.subscribe(topic, { qos: 0 });  // QoS 0でサブスクライブ
    // 必要に応じてメッセージをパブリッシュする処理を追加
});

// メッセージ受信時の処理
device.on('message', function(topic, payload) {
    console.log('Message arrived on topic:', topic);
    console.log('Payload:', payload.toString());

    if (topic === 'robot_project/aki150103/lamp') {
        const items_text = payload.toString().replace('.', '_');
        const items_obj = JSON.parse(items_text);
        console.log(items_obj.RTC_TimedShortSeq.data);
    }
});

// 接続が失われた場合の処理
device.on('close', function() {
    console.log('Connection closed');
});

// エラーハンドリング
device.on('error', function(error) {
    console.error('Error:', error);
});

