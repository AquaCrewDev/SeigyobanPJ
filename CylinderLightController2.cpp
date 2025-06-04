#include <cnoid/SimpleController>
#include <cnoid/SpotLight>
#include <cnoid/Link>
#include <iostream>
#include <cmath>

using namespace cnoid;

class CylinderLightController2 : public SimpleController {
    SpotLight* light;
    SpotLight* light1;
    SpotLight* light2;
    Link* cylinderJoint;
    Link* cylinderJoint2;
    Link* cylinderJoint3;
    double time;
    double targetAngle1, targetAngle2, targetAngle3;
    const double maxAngle = 0.610865; // 35度（ラジアン）
    const double minAngle = -0.610865; // -35度（ラジアン）
    const double torqueThreshold = 0.1; // トルクの閾値
    double timeStep;

public:
    // 初期化関数
    virtual bool initialize(SimpleControllerIO* io) override {
        // SpotLightデバイスを取得
        light = io->body()->findDevice<SpotLight>("Light");
        light1 = io->body()->findDevice<SpotLight>("Light1");
        light2 = io->body()->findDevice<SpotLight>("Light2");
        
        // Cylinderジョイントを取得
        cylinderJoint = io->body()->link("Cylinder");
        cylinderJoint2 = io->body()->link("Cylinder2");
        cylinderJoint3 = io->body()->link("Cylinder3");

        // デバイスやリンクが見つからない場合のエラーチェック
        if (!light || !light1 || !light2 || !cylinderJoint || !cylinderJoint2 || !cylinderJoint3) {
            std::cerr << "Error: Device or link not found!" << std::endl;
            return false;
        }

        // 関節のアクチュエーションモードをトルク制御に設定
        cylinderJoint->setActuationMode(Link::JointTorque);
        cylinderJoint2->setActuationMode(Link::JointTorque);
        cylinderJoint3->setActuationMode(Link::JointTorque);

        // IOを有効にする
        io->enableIO(cylinderJoint);
        io->enableIO(cylinderJoint2);
        io->enableIO(cylinderJoint3);

        // 初期化
        time = 0.0;
        timeStep = io->timeStep();
        targetAngle1 = cylinderJoint->q(); // 初期角度を現在の角度に設定
        targetAngle2 = cylinderJoint2->q(); // 初期角度を現在の角度に設定
        targetAngle3 = cylinderJoint3->q(); // 初期角度を現在の角度に設定
       
        return true;
    }

    // 制御関数
    virtual bool control() override {
        // 時間をインクリメント
        time += 0.001;

        // 外部からの力が加わったかどうかをトルクで判定し、現在の角度を新しい目標角度として設定
        if(std::abs(cylinderJoint->u()) > torqueThreshold){
            targetAngle1 = cylinderJoint->q();
        }
        if(std::abs(cylinderJoint2->u()) > torqueThreshold){
            targetAngle2 = cylinderJoint2->q();
        }
        if(std::abs(cylinderJoint3->u()) > torqueThreshold){
            targetAngle3 = cylinderJoint3->q();
        }

        // 制御を追加して範囲を制限
        double pgain = 0.5;
        double dgain = 0.04;
        for(int i = 0; i < 3; ++i){
            Link* joint;
            double targetAngle;
            if(i == 0){
                joint = cylinderJoint;
                targetAngle = targetAngle1;
            } else if(i == 1){
                joint = cylinderJoint2;
                targetAngle = targetAngle2;
            } else {
                joint = cylinderJoint3;
                targetAngle = targetAngle3;
            }
            double q = joint->q(); // 現在角度
            double dq = (q - targetAngle) / timeStep; // 現在角速度[rad]

            double u = (targetAngle - q) * pgain + (-dq) * dgain;
            joint->u() = u;
        }

        // ジョイント角度を度に変換
        double jointAngle1 = cylinderJoint->q() * (180.0 / 3.141592653589793);
        double jointAngle2 = cylinderJoint2->q() * (180.0 / 3.141592653589793);
        double jointAngle3 = cylinderJoint3->q() * (180.0 / 3.141592653589793);

        // 現在のジョイント角度を出力
        std::cout << "現在のジョイント角度: Cylinder = " << jointAngle1 
                  << "度, Cylinder2 = " << jointAngle2 
                  << "度, Cylinder3 = " << jointAngle3 << "度" << std::endl;

        // Cylinderジョイントの角度に基づいてライトをオン/オフ
        if (std::abs(jointAngle3) >= 35) { // 35度に変更
            if (!light->on()) {
                light->on(true);
                light->notifyStateChange();
                std::cout << "Lightがオンになりました。" << std::endl;
            }
        } else {
            if (light->on()) {
                light->on(false);
                light->notifyStateChange();
                std::cout << "Lightがオフになりました。" << std::endl;
            }
        }

        if (std::abs(jointAngle2) >= 35) { // 35度に変更
            if (!light1->on()) {
                light1->on(true);
                light1->notifyStateChange();
                std::cout << "Light1がオンになりました。" << std::endl;
            }
        } else {
            if (light1->on()) {
                light1->on(false);
                light1->notifyStateChange();
                std::cout << "Light1がオフになりました。" << std::endl;
            }
        }

        if (std::abs(jointAngle1) >= 35) { // 35度に変更
            if (!light2->on()) {
                light2->on(true);
                light2->notifyStateChange();
                std::cout << "Light2がオンになりました。" << std::endl;
            }
        } else {
            if (light2->on()) {
                light2->on(false);
                light2->notifyStateChange();
                std::cout << "Light2がオフになりました。" << std::endl;
            }
        }

        return true;
    }
};

CNOID_IMPLEMENT_SIMPLE_CONTROLLER_FACTORY(CylinderLightController2)

