# 🚀 Switch Robot Simulation with MQTT連携（Choreonoidベース）

本プロジェクトは、**Choreonoid**を用いたスイッチ操作ロボットのシミュレーション環境において、**MQTT通信を活用した遠隔操作**の検証を目的としています。

---

## 📁 システム構成概要

### 🔧 使用プロジェクトファイル
switchRobotSimu_MQTT_ver.cnoid


### ビルド対象のコントローラ（C++）

以下のコントローラをビルドし、`.so`（共有ライブラリ）としてChoreonoidに読み込ませます。

- `CameraSample2.cpp`
- `MQAutoBoxController3.cpp`
- `CylinderLightController2.cpp`

各コントローラは、対応するロボットコンポーネントに割り当てられ、動作を制御します。

---

##  MQTT通信による遠隔操作

###  使用フロントエンド
front_lamp2024/js/mobile_robot_ver2.js

本JavaScriptファイルにAWS IoT Coreの設定情報を記述することで、Webブラウザ経由のMQTT通信によるロボット遠隔操作を実現します。

#### 🔧 設定項目（※開発環境用）

```javascript
const awsIotConfig = {
  endpoint: "XXXXXXXXXXX-ats.iot.ap-northeast-1.amazonaws.com",
  region: "ap-northeast-1",
  accessKeyId: "AKIAxxxxxxxxxxxxxxxx",
  secretAccessKey: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  topic: "choreonoid/remote-control"
};
⚠️ 注意
AWS認証情報のコード内への直書きはセキュリティ上危険です。
本番環境では、署名付きWebSocket や Amazon Cognito を用いた安全な認証手法の利用を推奨します。

🏃‍♂️ 実行手順（概要）
各 .cpp ソースファイルをビルドし、.so を生成

Choreonoidで switchRobotSimu_MQTT_ver.cnoid を開く

各コンポーネントに対応する .so を設定

mobile_robot_ver2.js にAWS設定情報を記入

Webブラウザでインターフェースを起動、MQTT通信を開始

Choreonoidシミュレーションを起動し、双方向通信の動作確認

💬 補足情報
MQTTブローカーにはAWS IoT Coreを使用しています。

シミュレーション内で仮想ジョイスティックの入力を受け取り、実際にスイッチやボタン操作を行う一連の流れを再現しています。
