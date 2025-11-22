// // #include <Arduino.h>
// // #include "DHT.h"
// // #include <LiquidCrystal_I2C.h>
// // const int buzzer = 5;

// // #define NOTE_C4 262
// // #define NOTE_D4 294
// // #define NOTE_E4 330
// // #define NOTE_F4 349
// // #define NOTE_G4 392
// // #define NOTE_A4 440
// // #define NOTE_B4 494
// // #define NOTE_C5 523

// // // change this to make the song slower or faster

// // int melody[] = {
// //     NOTE_C5, NOTE_A4, NOTE_G4, NOTE_F4,
// //     NOTE_G4, NOTE_E4, NOTE_D4, NOTE_C4,
// //     NOTE_D4, NOTE_F4, NOTE_E4, NOTE_D4,
// //     NOTE_C4, NOTE_D4, NOTE_E4, NOTE_F4,
// //     NOTE_G4, NOTE_A4, NOTE_G4, NOTE_F4,

// //     // Phần giai điệu chính
// //     NOTE_G4, NOTE_E4, NOTE_D4, NOTE_C4,
// //     NOTE_D4, NOTE_F4, NOTE_E4, NOTE_D4};

// // int noteDurations[] = {
// //     4, 4, 4, 4,
// //     4, 4, 4, 4,
// //     4, 4, 4, 4,
// //     4, 4, 4, 4,
// //     4, 4, 4, 4,

// //     4, 4, 4, 4,
// //     4, 4, 4, 4};
// // #define DHTPIN 14
// // #define DHTTYPE DHT11
// // DHT dht(DHTPIN, DHTTYPE);
// // int lcdColumns = 16;
// // int lcdRows = 2;
// // LiquidCrystal_I2C lcd(0x27, lcdColumns, lcdRows);
// // String messageToScroll = "Dien tu nhung Tiot Smart";

// // int measurePin = 4;
// // int ledPower = 2;
// // int sensorADC = 0;
// // float sensorVoltage;
// // float sensorDustDensity;
// // float zeroSensorDustDensity = 0.6; // Voltage in clean air

// // void scrollText(int row, String message, int delayTime, int lcdColumns)
// // {
// //   for (int i = 0; i < lcdColumns; i++)
// //   {
// //     message = " " + message;
// //   }
// //   message = message + " ";
// //   for (int pos = 0; pos < message.length(); pos++)
// //   {
// //     lcd.setCursor(0, row);
// //     lcd.print(message.substring(pos, pos + lcdColumns));
// //     delay(delayTime);
// //   }
// // }

// // void setup()
// // {
// //   Serial.begin(9600);
// //   Serial.println(F("DHTxx test!"));
// //   dht.begin();
// //   // // initialize LCD
// //   lcd.init();
// //   // turn on LCD backlight
// //   lcd.backlight();
// //   Serial.begin(9600);
// //   pinMode(ledPower, OUTPUT);
// //   digitalWrite(ledPower, LOW);
// // }

// // void loop()
// // {
// //   for (int thisNote = 0; thisNote < sizeof(melody) / sizeof(melody[0]); thisNote++)
// //   {
// //     int noteDuration = 1000 / noteDurations[thisNote];
// //     tone(buzzer, melody[thisNote], noteDuration);

// //     int pauseBetweenNotes = noteDuration * 1.30;
// //     delay(pauseBetweenNotes);

// //     noTone(buzzer);
// //   }
// //   delay(2000);

// //   // Reading temperature or humidity takes about 250 milliseconds !Sensor readings may also be up to 2 seconds 'old'(its a very slow sensor)
// //   float h = dht.readHumidity();
// //   // Read temperature as Celsius (the default)
// //   float t = dht.readTemperature();
// //   // Read temperature as Fahrenheit (isFahrenheit = true)
// //   float f = dht.readTemperature(true);

// //   // Check if any reads failed and exit early (to try again).
// //   if (isnan(h) || isnan(t) || isnan(f))
// //   {
// //     Serial.println(F("Failed to read from DHT sensor!"));
// //     return;
// //   }

// //   // Compute heat index in Fahrenheit (the default)
// //   float hif = dht.computeHeatIndex(f, h);
// //   // Compute heat index in Celsius (isFahreheit = false)
// //   float hic = dht.computeHeatIndex(t, h, false);

// //   Serial.print(F("Humidity: "));
// //   Serial.print(h);
// //   Serial.print(F("%  Temperature: "));
// //   Serial.print(t);
// //   Serial.print(F("°C "));
// //   Serial.print(f);
// //   Serial.print(F("°F  Heat index: "));
// //   Serial.print(hic);
// //   Serial.print(F("°C "));
// //   Serial.print(hif);
// //   Serial.println(F("°F"));

// //   lcd.setCursor(0, 0);
// //   lcd.print("Xin chao");
// //   delay(1000);
// //   lcd.clear();

// //   lcd.setCursor(0, 1);
// //   lcd.print("Xin chao");
// //   delay(1000);
// //   lcd.clear();

// //   scrollText(1, messageToScroll, 500, lcdColumns);
// //   for (int i = 0; i < 10; i++)
// //   {
// //     digitalWrite(ledPower, HIGH);
// //     delayMicroseconds(280);
// //     sensorADC += analogRead(measurePin);
// //     digitalWrite(ledPower, LOW);
// //     delay(10);
// //   }
// //   sensorADC = sensorADC / 10;
// //   sensorVoltage = sensorADC * 11 * (5.0 / 1024.0);
// //   if (sensorVoltage < zeroSensorDustDensity)
// //   {
// //     sensorDustDensity = 0;
// //   }
// //   else
// //   {
// //     sensorDustDensity = 0.17 * sensorVoltage - 0.1;
// //   }
// //   Serial.print(sensorVoltage);
// //   Serial.print("\t\t");
// //   Serial.print(sensorDustDensity);
// //   Serial.println(" ug/m3");
// //   delay(1000);
// // }

#include <WiFi.h>
#include <WebServer.h>
#include <ArduinoJson.h>
#include <HTTPClient.h>

// ====== Cấu hình WiFi ======
const char *WIFI_SSID = "MiXue";
const char *WIFI_PASSWORD = "88888888";

// ====== Cấu hình máy chủ Node.js ======
const char *NODE_SERVER_BASE = "http://192.168.1.9:3000"; // Đổi IP/port theo máy chạy Node
String IP_Esp32 = "";
// ====== Cấu hình thiết bị ======
WebServer server(80);
bool ledState = true;
const int LED_PIN = 2;        // LED trên nhiều board ESP32 là GPIO2
float fakeTemperature = 27.5; // Demo: dùng giá trị giả. Thực tế đọc từ cảm biến (DS18B20/DHT22...)
float fakeHumidity = 45.0;    // Demo: dùng giá trị giả. Thực tế đọc từ cảm biến (DHT22...)

// ====== Helper: trả JSON ======
void sendJson(WebServer &srv, int code, const JsonDocument &doc)
{
  String out;
  serializeJson(doc, out);
  srv.send(code, "application/json", out);
}

// ====== Endpoint: /status ======
void handleStatus()
{
  StaticJsonDocument<128> doc;
  doc["online"] = true;
  sendJson(server, 200, doc);
  Serial.println("Status requested");
}

// ====== Endpoint: /sensor (GET) ======
void handleSensor()
{
  // Demo: cập nhật nhẹ để nhìn thấy thay đổi
  fakeTemperature += 0.1;
  if (fakeTemperature > 35.0)
    fakeTemperature = 27.0;
  fakeHumidity += 0.5;
  if (fakeHumidity > 60.0)
    fakeHumidity = 45.0;
  StaticJsonDocument<128> doc;
  doc["success"] = true;
  doc["temperature"] = fakeTemperature;
  doc["humidity"] = fakeHumidity;
  sendJson(server, 200, doc);
  Serial.println("Sensor temperature and humidity data requested");
}

// ====== Endpoint: /led (POST) ======
void handleLed()
{
  if (server.method() != HTTP_POST)
  {
    server.send(405, "text/plain", "Method Not Allowed");
    return;
  }

  // Đọc body JSON
  String body = server.arg("plain");
  StaticJsonDocument<256> doc;
  DeserializationError err = deserializeJson(doc, body);
  if (err)
  {
    server.send(400, "text/plain", "Invalid JSON");
    return;
  }

  const char *state = doc["state"] | "";
  if (strcmp(state, "ON") == 0)
  {
    ledState = true;
    digitalWrite(LED_PIN, HIGH);
  }
  else if (strcmp(state, "OFF") == 0)
  {
    ledState = false;
    digitalWrite(LED_PIN, LOW);
  }
  else
  {
    server.send(400, "text/plain", "Invalid state");
    return;
  }

  // Trả về JSON
  StaticJsonDocument<128> resp;
  resp["success"] = true;
  resp["state"] = ledState ? "ON" : "OFF";
  sendJson(server, 200, resp);
}

// ====== Endpoint: /sensor_humidity (GET) ======
void handleHumidity()
{
  // Demo: giá trị giả
  float fakeHumidity = 55.0;

  StaticJsonDocument<128> doc;
  doc["success"] = true;
  doc["humidity"] = fakeHumidity;
  sendJson(server, 200, doc);
  Serial.println("Sensor humidity data requested");
}

// ====== Endpoint: /fan (POST) ======
void handleFan()
{
  if (server.method() != HTTP_POST)
  {
    server.send(405, "text/plain", "Method Not Allowed");
    return;
  }

  // Đọc body JSON
  String body = server.arg("plain");
  StaticJsonDocument<256> doc;
  DeserializationError err = deserializeJson(doc, body);
  if (err)
  {
    server.send(400, "text/plain", "Invalid JSON");
    return;
  }

  const char *state = doc["state"] | "";
  // Demo: chỉ in ra trạng thái quạt
  Serial.printf("Fan state set to: %s\n", state);

  // Trả về JSON
  StaticJsonDocument<128> resp;
  resp["success"] = true;
  resp["state"] = state;
  sendJson(server, 200, resp);
}

// ====== Endpoint: /dust (GET) ======
void handleDust()
{
  // Demo: giá trị giả
  float fakeDustDensity = 12.5; // µg/m3

  StaticJsonDocument<128> doc;
  doc["success"] = true;
  doc["dust_density"] = fakeDustDensity;
  sendJson(server, 200, doc);
  Serial.println("Sensor dust density data requested");
}

// ====== Kết nối WiFi ======
void connectWiFi()
{
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting WiFi");
  int retry = 0;
  while (WiFi.status() != WL_CONNECTED)
  {
    delay(500);
    Serial.print(".");
    retry++;
    if (retry > 60)
    { // ~30s timeout
      Serial.println("\nWiFi connect timeout, restarting...");
      ESP.restart();
    }
  }
  IP_Esp32 = WiFi.localIP().toString();
  if (sizeof(IP_Esp32) > 0)
  {
    Serial.printf("\nlấy được IP esp32 là %s", IP_Esp32);
  }
  Serial.printf("\nWiFi connected: %s, IP của server esp32 chính là IP room: %s\n",
                WIFI_SSID, IP_Esp32);
}

// ESP32 POST dữ liệu lên server web, dùng chính API mà server web đã định nghĩa rồi
void postSensorToServer()
{
  if (WiFi.status() != WL_CONNECTED)
    return;

  // Chuẩn bị JSON
  StaticJsonDocument<256> doc;
  doc["ip"] = IP_Esp32; // Server dùng để match Room
  doc["temperature"] = fakeTemperature;
  doc["timestamp"] = millis(); // Demo: dùng millis. Thực tế dùng thời gian thực nếu có RTC/NTP.
  doc["humidity"] = fakeHumidity;
  String payload;
  serializeJson(doc, payload);

  HTTPClient http;
  String url = String(NODE_SERVER_BASE) + "/api/sensor-data";
  http.begin(url);
  http.addHeader("Content-Type", "application/json");

  int code = http.POST(payload);
  if (code > 0)
  {
    String resp = http.getString();
    Serial.printf("[POST] %s -> code: %d, resp: %s\n", url.c_str(), code, resp.c_str());
  }
  else
  {
    Serial.printf("[POST] Error: %d\n", code);
  }
  http.end();
}

// ====== Setup ======
void setup()
{
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, HIGH);

  connectWiFi();

  // cấu hình esp32 giống như 1 server, vì thế sẽ có địa chỉ IP phụ thuộc vào mạng đang dùng
  // nên không thể tự định nghĩa IP được

  // đây chính là API nội bộ mà esp32 cung cấp và web server (nodejs) sẽ dùng những cái này để
  // nhận gửi dữ liệu đến thiết bị thông qua esp32
  server.on("/status", HTTP_GET, handleStatus);
  server.on("/sensor", HTTP_GET, handleSensor);
  server.on("/led", HTTP_POST, handleLed);
  server.on("/fan", HTTP_POST, handleFan);
  server.begin();
  Serial.println("ESP32 HTTP server started on port 80");
}

// ====== Loop ======
unsigned long lastPost = 0;
void loop()
{
  server.handleClient();

  // Demo: mỗi 5s, ESP32 chủ động POST dữ liệu lên server
  unsigned long now = millis();
  if (now - lastPost > 5000)
  {
    lastPost = now;
    // Cập nhật nhiệt độ demo
    fakeTemperature += 0.2;
    fakeHumidity += 0.5;
    if (fakeTemperature > 36.0)
      fakeTemperature = 26.5;
    if (fakeHumidity > 60.0)
      fakeHumidity = 45.0;
    postSensorToServer();
  }
}
