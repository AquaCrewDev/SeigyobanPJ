#include <cnoid/SimpleController>
#include <cnoid/Camera>
#include <iostream>
#include <fstream>
#include <string>
#include <ctime>
#include <iomanip>
#include <sstream>
#include <ros/ros.h>
#include <sensor_msgs/Image.h>
#include <sensor_msgs/image_encodings.h>
#include <image_transport/image_transport.h>
#include <cv_bridge/cv_bridge.h>
#include <opencv2/core.hpp>
#include <opencv2/opencv.hpp>
#include <chrono>
#include <mqtt/async_client.h>
#include <nlohmann/json.hpp>
#include <thread>
#include <random> // 追加: ランダム関連のヘッダ

using namespace cnoid;
using namespace std;
using namespace std::chrono;
using json = nlohmann::json;

class CameraSample2 : public SimpleController
{
    Camera* camera;
    std::ostream* os;
    BodyPtr ioBody;
    double timeStep;
    SimpleControllerIO* io;

    ros::NodeHandle node;
    image_transport::Publisher pub;
    int imageCounter = 0;
    bool imageErrorDisplayed = false;

    time_point<steady_clock> lastSaveTime;

    mqtt::async_client* mqttClient;
    const std::string SERVER_ADDRESS{"ssl://a3o0r3on150edr-ats.iot.ap-northeast-1.amazonaws.com:8883"};
    const std::string CLIENT_ID{"camera_lamp_controller"};
    const std::string TOPIC{"robot_project/aki150103/lamp_virtual"};

    const std::string CA_CERT_PATH{"/home/aquacrew2/aqua_aws_setting/AmazonRootCA1.pem"};
    const std::string CLIENT_CERT_PATH{"/home/aquacrew2/aqua_aws_setting/00962ca4ef67e4bfd61f6d7281e9fce21556e22305c70b7c9834dd659374ee52-certificate.pem.crt"};
    const std::string PRIVATE_KEY_PATH{"/home/aquacrew2/aqua_aws_setting/00962ca4ef67e4bfd61f6d7281e9fce21556e22305c70b7c9834dd659374ee52-private.pem.key"};

    bool isConnected = false;
    std::thread publisherThread;
    bool stopPublishing = false;

public:
    ~CameraSample2() {
        std::cout << "[DEBUG] Destructor called" << std::endl;
        stopPublishing = true;
        if (publisherThread.joinable()) {
            publisherThread.join();
        }
        if (mqttClient) {
            mqttClient->stop_consuming();
            mqttClient->disconnect()->wait();
            delete mqttClient;
        }
    }

    virtual bool configure(SimpleControllerConfig* config) override
    {
        std::cout << "[DEBUG] configure() started" << std::endl;
        try {
            mqtt::ssl_options sslopts;
            sslopts.set_trust_store(CA_CERT_PATH);
            sslopts.set_key_store(CLIENT_CERT_PATH);
            sslopts.set_private_key(PRIVATE_KEY_PATH);

            mqtt::connect_options connOpts;
            connOpts.set_ssl(sslopts);
            connOpts.set_clean_session(true);
            connOpts.set_keep_alive_interval(20);

            mqttClient = new mqtt::async_client(SERVER_ADDRESS, CLIENT_ID);

            mqttClient->set_connected_handler([this](const std::string& cause) {
                isConnected = true;
                std::cout << "[INFO] Connected to AWS IoT Core" << std::endl;
            });

            mqttClient->set_disconnected_handler([this](const mqtt::properties&, mqtt::ReasonCode reason) {
                isConnected = false;
                std::cerr << "[ERROR] Disconnected from AWS IoT Core. Reason code: " << static_cast<int>(reason) << std::endl;
            });

            mqttClient->connect(connOpts)->wait();
        } catch (const mqtt::exception& e) {
            std::cerr << "[ERROR] MQTT connection error: " << e.what() << std::endl;
            return false;
        }

        try {
            image_transport::ImageTransport it(node);
            pub = it.advertise("out_image_base_topic", 1);
        } catch (const std::exception& e) {
            std::cerr << "[ERROR] Failed to initialize ImageTransport: " << e.what() << std::endl;
            return false;
        }

        publisherThread = std::thread(&CameraSample2::publishLoop, this);
        std::cout << "[DEBUG] configure() completed" << std::endl;
        return true;
    }

    virtual bool initialize(SimpleControllerIO* io) override
    {
        std::cout << "[DEBUG] initialize() started" << std::endl;

        this->io = io;
        os = &io->os();

        camera = io->body()->findDevice<Camera>("RangeCamera");
        if (camera == nullptr) {
            std::cerr << "Error: Camera device 'RangeCamera' not found!" << std::endl;
            return false;
        }

        io->enableInput(camera);
        ioBody = io->body();
        timeStep = io->timeStep();

        lastSaveTime = steady_clock::now();
        std::cout << "[DEBUG] initialize() completed" << std::endl;
        return true;
    }

    virtual bool start() override
    {
        std::cout << "[DEBUG] start() called" << std::endl;
        return true;
    }

    virtual bool control() override
    {
        std::cout << "[DEBUG] control() started" << std::endl;
        const Image& image = camera->constImage();

        if (!image.empty()) {
            imageErrorDisplayed = false;

            const int height = image.height();
            const int width = image.width();

            const unsigned char* pixels = image.pixels();
            if (pixels == nullptr) {
                std::cerr << "Error: Image pixels are nullptr" << std::endl;
                return false;
            }

            cv::Mat img_rgb(height, width, CV_8UC3, const_cast<uchar*>(pixels));
            cv::Mat img_bgr;
            cv::cvtColor(img_rgb, img_bgr, cv::COLOR_RGB2BGR);

            monitorSpotlight(img_bgr);
            pushimage(img_bgr);
        } else {
            if (!imageErrorDisplayed) {
                std::cerr << "Error: No image from camera" << std::endl;
                imageErrorDisplayed = true;
            }

            cv::Mat default_image = cv::Mat::zeros(480, 640, CV_8UC3);
            cv::imshow("Default Image", default_image);
        }

        std::cout << "[DEBUG] control() completed" << std::endl;
        return true;
    }

    string monitorSpotlight(cv::Mat& image)
    {
        std::cout << "[DEBUG] monitorSpotlight() called" << std::endl;
        cv::Rect spotlight1_area(300, 80, 40, 40);
        cv::Rect spotlight2_area(380, 80, 40, 40);
        cv::Rect spotlight3_area(450, 80, 40, 40);

        cv::Mat spotlight1_img = image(spotlight1_area);
        cv::Mat spotlight2_img = image(spotlight2_area);
        cv::Mat spotlight3_img = image(spotlight3_area);

        int brightness_threshold = 130;

        bool spotlight1_on = isSpotlightOnByBrightness(spotlight1_img, brightness_threshold);
        bool spotlight2_on = isSpotlightOnByBrightness(spotlight2_img, brightness_threshold);
        bool spotlight3_on = isSpotlightOnByBrightness(spotlight3_img, brightness_threshold);

        string status = to_string(spotlight1_on ? 1 : 0) + "," +
                        to_string(spotlight2_on ? 1 : 0) + "," +
                        to_string(spotlight3_on ? 1 : 0);

        std::cout << "[DEBUG] Spotlight status: " << status << std::endl;
        return status;
    }

    bool isSpotlightOnByBrightness(cv::Mat& spotlight_area, int brightness_threshold)
    {
        cv::Mat gray;
        cv::cvtColor(spotlight_area, gray, cv::COLOR_BGR2GRAY);

        double avg_brightness = cv::mean(gray)[0];
        return avg_brightness > brightness_threshold;
    }

    void pushimage(cv::Mat outputimage)
    {
        sensor_msgs::ImagePtr imagemsg = cv_bridge::CvImage(std_msgs::Header(), "bgr8", outputimage).toImageMsg();
        pub.publish(imagemsg);
    }

    void publishLoop()
    {
        std::cout << "[DEBUG] publishLoop() started" << std::endl;
        while (!stopPublishing) {
            try {
                json payload = {
                    {"RTC.TimedShortSeq", {
                        {"tm", {{"sec", 0}, {"nsec", 0}}},
                        {"data", {1, generate_random_value(), 1174, 923, 2, generate_random_value(), 1403, 914, 3, generate_random_value(), 1618, 911}}
                    }}
                };

                std::string payload_str = payload.dump();
                mqtt::message_ptr pubmsg = mqtt::make_message(TOPIC, payload_str);
                pubmsg->set_qos(1);

                mqttClient->publish(pubmsg);
                std::cout << "[INFO] Message published: " << payload_str << std::endl;
            } catch (const mqtt::exception& e) {
                std::cerr << "[ERROR] Failed to publish message: " << e.what() << std::endl;
            }

            std::this_thread::sleep_for(std::chrono::seconds(5));
        }
        std::cout << "[DEBUG] publishLoop() stopped" << std::endl;
    }

    int generate_random_value() {
        static std::random_device rd;
        static std::mt19937 gen(rd());
        static std::uniform_int_distribution<> dis(0, 1);
        return dis(gen);
    }
};

CNOID_IMPLEMENT_SIMPLE_CONTROLLER_FACTORY(CameraSample2)

