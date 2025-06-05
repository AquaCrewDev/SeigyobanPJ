シミュレーション実行およびMQTT連携の概要

本プロジェクトでは、Choreonoidのプロジェクトファイル switchRobotSimu_MQTT_ver.cnoid を読み込んだうえで、以下の3つのコントローラプログラムをビルドし、それぞれの .so ファイルをChoreonoidのコントローラとして適用し、シミュレーションを実行します。
1. ビルド対象のコントローラソースファイル

    CameraSample2.cpp

    MQAutoBoxController3.cpp

    CylinderLightController2.cpp

各 .cpp ファイルをビルドして生成される .so（共有ライブラリ）を、それぞれ対応するロボットコンポーネントのコントローラに設定します。
MQTT通信による遠隔操作

フロントエンドとして、front_lamp2024/js/mobile_robot_ver2.js を使用しています。
このJavaScriptファイル内に AWS IoT Core のエンドポイント、Access Key、Secret Access Key を設定することで、WebブラウザとChoreonoid間でMQTT通信が可能となり、遠隔操作を実現します。
必要な設定項目（mobile_robot_ver2.js）

const awsIotConfig = {
  endpoint: "XXXXXXXXXXX-ats.iot.ap-northeast-1.amazonaws.com",
  region: "ap-northeast-1",
  accessKeyId: "AKIAxxxxxxxxxxxxxxxx",
  secretAccessKey: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  topic: "choreonoid/remote-control"
};

    ⚠️ AWS認証情報はセキュリティの観点からコードに直書きしないことが推奨されます。本番環境では署名付きWebSocketや Cognito を検討してください。

実行の流れ（概要）

    CameraSample2.cpp などの各ソースをビルドし .so を生成

    switchRobotSimu_MQTT_ver.cnoid をChoreonoidで開く

    各コントローラに生成した .so を設定

    mobile_robot_ver2.js にAWS IoT Coreの設定を入力

    ブラウザからWebインターフェースを開いてMQTT通信を開始

    Choreonoidシミュレーションを起動して、双方向通信の確認
