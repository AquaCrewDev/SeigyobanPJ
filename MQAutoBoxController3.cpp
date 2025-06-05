#include <cnoid/SimpleController>
#include <cnoid/Joystick>
#include <iostream>
#include <mqtt/client.h>
#include <chrono>
#include <thread>
#include <nlohmann/json.hpp>  // JSONライブラリのインクルード

using json = nlohmann::json;
using namespace cnoid;

class MQAutoBoxController3 : public SimpleController
{
    Link* box;      
    Link* smallBox; 
    Link* robo;     
    double q_ref_box;
    double q_prev_box;     
    double q_initial_box;  
    double q_ref_smallBox; 
    double q_prev_smallBox;
    double q_initial_smallBox;
    double q_ref_robo;     
    double q_prev_robo;    
    double dt;  
    Joystick joystick;    
    bool actionTriggered = false;  
    int state = 0;    
    double timer = 0.0;   
    double moveDistance = 0.0;  

    // MQTT関連セッティング
    const std::string SERVER_ADDRESS{""};
    const std::string CLIENT_ID{"test"};
    const std::string TOPIC{"test"};

    const std::string CA_CERT_PATH{""};
    const std::string CLIENT_CERT_PATH{""};
    const std::string PRIVATE_KEY_PATH{""};

    mqtt::client* client = nullptr;
    mqtt::callback* mqttCallback = nullptr; // コールバックオブジェクトをメンバーとして保持
    std::string lastReceivedMessage; // 最後に受信したメッセージを保持
    std::string jsonDataString;  // 受け取ったJSONデータをString型で格納

    class MyCallback : public virtual mqtt::callback {
    public:
        MQAutoBoxController3* controller;

        MyCallback(MQAutoBoxController3* controller) : controller(controller) {}

        void message_arrived(mqtt::const_message_ptr msg) override {
            std::cout << "メッセージ受信: トピック '" << msg->get_topic() << "' メッセージ: '" << msg->to_string() << "'\n";
            controller->onMessageReceived(msg->to_string());
        }

        void connection_lost(const std::string& cause) override {
            std::cout << "接続が失われました: " << cause << std::endl;
        }
    };

    // MQTTメッセージが受信されたときに呼ばれるメソッド
    void onMessageReceived(const std::string& message) {
        lastReceivedMessage = message;

        // JSONデータをString型の変数に格納
        jsonDataString = message;

        try {
            // メッセージをJSONとしてパース
            auto parsed_json = json::parse(message);
            // "data" フィールドの値を取り出す
            std::string data_value = parsed_json["data"];
           
            std::cout << "Received data_value: " << data_value << std::endl;

            // メッセージに応じて制御のトリガーを行う
            if (data_value == "start_move_1") {
                actionTriggered = true;
                state = 1;
                timer = 0.0;
                moveDistance = -0.00025;
            } else if (data_value == "start_move_2") {
                actionTriggered = true;
                state = 1;
                timer = 0.0;
                moveDistance = -0.0004;
            } else if (data_value == "start_move_3") {
                actionTriggered = true;
                state = 1;
                timer = 0.0;
                moveDistance = -0.0001;
            }
        } catch (json::exception& e) {
            std::cerr << "JSONパースエラー: " << e.what() << std::endl;
        }
    }

public:
    virtual bool initialize(SimpleControllerIO* io) override
    {
        box = io->body()->link("Box");
        smallBox = io->body()->link("SmallBox");
        robo = io->body()->link("Robo");

        if (!box || !smallBox || !robo) {
            std::cerr << "Error: Link(s) not found!" << std::endl;
            return false;
        }
        
        box->setActuationMode(Link::JOINT_TORQUE);
        smallBox->setActuationMode(Link::JOINT_TORQUE);
        robo->setActuationMode(Link::JOINT_TORQUE);
        
        io->enableIO(box);
        io->enableIO(smallBox);
        io->enableIO(robo);
        
        q_ref_box = q_prev_box = q_initial_box = box->q();
        q_ref_smallBox = q_prev_smallBox = q_initial_smallBox = smallBox->q();
        q_ref_robo = q_prev_robo = robo->q();

        dt = io->timeStep();

        try {
            mqtt::ssl_options sslopts;
            sslopts.set_trust_store(CA_CERT_PATH);
            sslopts.set_key_store(CLIENT_CERT_PATH);
            sslopts.set_private_key(PRIVATE_KEY_PATH);

            mqtt::connect_options connOpts;
            connOpts.set_ssl(sslopts);
            connOpts.set_clean_session(true);

            client = new mqtt::client(SERVER_ADDRESS, CLIENT_ID);
            mqttCallback = new MyCallback(this); // コールバックオブジェクトを初期化
            client->set_callback(*mqttCallback);

            std::cout << "AWS IoT Coreに接続中..." << std::endl;
            client->connect(connOpts);
            std::cout << "接続完了。" << std::endl;

            client->subscribe(TOPIC, 1);
            std::cout << "トピックにサブスクライブしました: " << TOPIC << std::endl;
        } catch (const mqtt::exception& exc) {
            std::cerr << "MQTT接続エラー: " << exc.what() << std::endl;
            return false;
        }

        std::cout << "Initialization complete." << std::endl;
        return true;
    }

    virtual bool control() override
    {
        static const double P = 200.0;    
        static const double D = 50.0;     

        // ジョイスティックの状態を取得（必要に応じて）
        joystick.readCurrentState();

        // アクションがトリガーされた場合の状態遷移
        if (actionTriggered) {
            switch (state) {
                case 1: 
                    q_ref_box += moveDistance;   
                    if (timer >= 1.0) {
                        state = 2;  
                        timer = 0.0;    
                    }
                    break;
                case 2: 
                    if (timer >= 1.0) {
                        state = 3;  
                        timer = 0.0;    
                    }
                    break;
                case 3: 
                    q_ref_smallBox = 0.005;   
                    if (timer >= 1.0) {
                        state = 4;  
                        timer = 0.0;    
                    }
                    break;
                case 4: 
                    if (timer >= 1.0) {
                        state = 5;  
                        timer = 0.0;    
                    }
                    break;
                case 5: 
                    q_ref_robo = 45.0 * (M_PI / 180.0);  
                    if (timer >= 1.0) {
                        state = 6;  
                        timer = 0.0;    
                    }
                    break;
                case 6: 
                    if (timer >= 1.0) {
                        state = 8;  
                        timer = 0.0;    
                    }
                    break;
                case 8: 
                    q_ref_smallBox = q_initial_smallBox;    
                    if (std::abs(q_ref_smallBox - smallBox->q()) < 1e-6) {
                        state = 7;  
                        timer = 0.0;    
                    }
                    break;
                case 7: 
                    q_ref_robo = 0.0;   
                    if (timer >= 1.0) {
                        state = 9;  
                        timer = 0.0;    
                    }
                    break;
                case 9: 
                    q_ref_box = q_initial_box;    
                    if (std::abs(q_ref_box - box->q()) < 1e-6) {
                        actionTriggered = false;   
                    }
                    break;
            }
            timer += dt; 
        }

        // Boxリンクの制御
        double q_box = box->q();   
        double dq_box = (q_box - q_prev_box) / dt;  
        box->u() = P * (q_ref_box - q_box) + D * (-dq_box);   
        q_prev_box = q_box;   

        // SmallBoxリンクの制御
        double q_smallBox = smallBox->q();   
        double dq_smallBox = (q_smallBox - q_prev_smallBox) / dt;  
        smallBox->u() = P * (q_ref_smallBox - q_smallBox) + D * (-dq_smallBox);   
        q_prev_smallBox = q_smallBox;   

        // Roboリンクの制御
        double q_robo = robo->q(); 
        double dq_robo = (q_robo - q_prev_robo) / dt;  
        robo->u() = P * (q_ref_robo - q_robo) + D * (-dq_robo);   
        q_prev_robo = q_robo;   

        return true;
    }

    virtual ~MQAutoBoxController3() {
        if (client) {
            client->disconnect();
            delete client;
            std::cout << "MQTTクライアント切断しました。" << std::endl;
        }
        delete mqttCallback; // コールバックオブジェクトを解放
    }
};

CNOID_IMPLEMENT_SIMPLE_CONTROLLER_FACTORY(MQAutoBoxController3)

