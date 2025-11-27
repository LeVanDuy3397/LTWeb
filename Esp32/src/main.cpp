// // // #include <Arduino.h>
// // // #include "DHT.h"
// // // #include <LiquidCrystal_I2C.h>
// // // const int buzzer = 5;

// // // #define NOTE_C4 262
// // // #define NOTE_D4 294
// // // #define NOTE_E4 330
// // // #define NOTE_F4 349
// // // #define NOTE_G4 392
// // // #define NOTE_A4 440
// // // #define NOTE_B4 494
// // // #define NOTE_C5 523

// // // // change this to make the song slower or faster

// // // int melody[] = {
// // //     NOTE_C5, NOTE_A4, NOTE_G4, NOTE_F4,
// // //     NOTE_G4, NOTE_E4, NOTE_D4, NOTE_C4,
// // //     NOTE_D4, NOTE_F4, NOTE_E4, NOTE_D4,
// // //     NOTE_C4, NOTE_D4, NOTE_E4, NOTE_F4,
// // //     NOTE_G4, NOTE_A4, NOTE_G4, NOTE_F4,

// // //     // Phần giai điệu chính
// // //     NOTE_G4, NOTE_E4, NOTE_D4, NOTE_C4,
// // //     NOTE_D4, NOTE_F4, NOTE_E4, NOTE_D4};

// // // int noteDurations[] = {
// // //     4, 4, 4, 4,
// // //     4, 4, 4, 4,
// // //     4, 4, 4, 4,
// // //     4, 4, 4, 4,
// // //     4, 4, 4, 4,

// // //     4, 4, 4, 4,
// // //     4, 4, 4, 4};
// // // #define DHTPIN 14
// // // #define DHTTYPE DHT11
// // // DHT dht(DHTPIN, DHTTYPE);
// // // int lcdColumns = 16;
// // // int lcdRows = 2;
// // // LiquidCrystal_I2C lcd(0x27, lcdColumns, lcdRows);
// // // String messageToScroll = "Dien tu nhung Tiot Smart";

// // // int measurePin = 4;
// // // int ledPower = 2;
// // // int sensorADC = 0;
// // // float sensorVoltage;
// // // float sensorDustDensity;
// // // float zeroSensorDustDensity = 0.6; // Voltage in clean air

// // // void scrollText(int row, String message, int delayTime, int lcdColumns)
// // // {
// // //   for (int i = 0; i < lcdColumns; i++)
// // //   {
// // //     message = " " + message;
// // //   }
// // //   message = message + " ";
// // //   for (int pos = 0; pos < message.length(); pos++)
// // //   {
// // //     lcd.setCursor(0, row);
// // //     lcd.print(message.substring(pos, pos + lcdColumns));
// // //     delay(delayTime);
// // //   }
// // // }

// // // void setup()
// // // {
// // //   Serial.begin(9600);
// // //   Serial.println(F("DHTxx test!"));
// // //   dht.begin();
// // //   // // initialize LCD
// // //   lcd.init();
// // //   // turn on LCD backlight
// // //   lcd.backlight();
// // //   Serial.begin(9600);
// // //   pinMode(ledPower, OUTPUT);
// // //   digitalWrite(ledPower, LOW);
// // // }

// // // void loop()
// // // {
// // //   for (int thisNote = 0; thisNote < sizeof(melody) / sizeof(melody[0]); thisNote++)
// // //   {
// // //     int noteDuration = 1000 / noteDurations[thisNote];
// // //     tone(buzzer, melody[thisNote], noteDuration);

// // //     int pauseBetweenNotes = noteDuration * 1.30;
// // //     delay(pauseBetweenNotes);

// // //     noTone(buzzer);
// // //   }
// // //   delay(2000);

// // //   // Reading temperature or humidity takes about 250 milliseconds !Sensor readings may also be up to 2 seconds 'old'(its a very slow sensor)
// // //   float h = dht.readHumidity();
// // //   // Read temperature as Celsius (the default)
// // //   float t = dht.readTemperature();
// // //   // Read temperature as Fahrenheit (isFahrenheit = true)
// // //   float f = dht.readTemperature(true);

// // //   // Check if any reads failed and exit early (to try again).
// // //   if (isnan(h) || isnan(t) || isnan(f))
// // //   {
// // //     Serial.println(F("Failed to read from DHT sensor!"));
// // //     return;
// // //   }

// // //   // Compute heat index in Fahrenheit (the default)
// // //   float hif = dht.computeHeatIndex(f, h);
// // //   // Compute heat index in Celsius (isFahreheit = false)
// // //   float hic = dht.computeHeatIndex(t, h, false);

// // //   Serial.print(F("Humidity: "));
// // //   Serial.print(h);
// // //   Serial.print(F("%  Temperature: "));
// // //   Serial.print(t);
// // //   Serial.print(F("°C "));
// // //   Serial.print(f);
// // //   Serial.print(F("°F  Heat index: "));
// // //   Serial.print(hic);
// // //   Serial.print(F("°C "));
// // //   Serial.print(hif);
// // //   Serial.println(F("°F"));

// // //   lcd.setCursor(0, 0);
// // //   lcd.print("Xin chao");
// // //   delay(1000);
// // //   lcd.clear();

// // //   lcd.setCursor(0, 1);
// // //   lcd.print("Xin chao");
// // //   delay(1000);
// // //   lcd.clear();

// // //   scrollText(1, messageToScroll, 500, lcdColumns);
// // //   for (int i = 0; i < 10; i++)
// // //   {
// // //     digitalWrite(ledPower, HIGH);
// // //     delayMicroseconds(280);
// // //     sensorADC += analogRead(measurePin);
// // //     digitalWrite(ledPower, LOW);
// // //     delay(10);
// // //   }
// // //   sensorADC = sensorADC / 10;
// // //   sensorVoltage = sensorADC * 11 * (5.0 / 1024.0);
// // //   if (sensorVoltage < zeroSensorDustDensity)
// // //   {
// // //     sensorDustDensity = 0;
// // //   }
// // //   else
// // //   {
// // //     sensorDustDensity = 0.17 * sensorVoltage - 0.1;
// // //   }
// // //   Serial.print(sensorVoltage);
// // //   Serial.print("\t\t");
// // //   Serial.print(sensorDustDensity);
// // //   Serial.println(" ug/m3");
// // //   delay(1000);
// // // }

#include "mbedtls/aes.h"
#include <mbedtls/platform.h>
#include "mbedtls/base64.h"
#include "mbedtls/md.h"
#include <WiFi.h>
#include <WebServer.h>
#include <ArduinoJson.h>
#include <HTTPClient.h>
#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <iostream>
#include <vector>
#include <stdint.h>
#include <Arduino.h>
#include <algorithm>

// ====== Cấu hình WiFi ======
const char *WIFI_SSID = "Duy";
const char *WIFI_PASSWORD = "0988759274";

String IP_Esp32 = "";
// ====== Cấu hình thiết bị ======
WebServer server(80);
bool ledState = false;
bool fanState = false;
const int LED_PIN = 2;            // LED trên nhiều board ESP32 là GPIO2
const int FAN_PIN = 4;            // Quạt nối với GPIO4 (ví dụ)
float Temperature = 27.5;         // Demo: dùng giá trị giả. Thực tế đọc từ cảm biến (DS18B20/DHT22...)
float Humidity = 45.0;            // Demo: dùng giá trị giả. Thực tế đọc từ cảm biến (DHT22...)
String enable_encryption = "OFF"; // Bật/tắt mã hóa nhiệt độ
String encryption_method = "";    // Chọn phương thức mã hóa: "DES" hoặc "AES"
const char *simpleKey1 = "165743";
// ====== Helper: trả JSON ======
void sendJson(WebServer &srv, int code, const JsonDocument &doc)
{
  String out;
  serializeJson(doc, out);
  srv.send(code, "application/json", out);
}

// ====== Endpoint: /status ======
void handleis_online()
{
  StaticJsonDocument<128> doc;
  doc["online"] = true;
  sendJson(server, 200, doc);
  Serial.println("Status requested");
}
// ============ AES Functions ============

// Tạo AES key 32 bytes từ key đơn giản
void generateKey(const char *password, unsigned char *key)
{
  mbedtls_md_context_t ctx;
  mbedtls_md_type_t md_type = MBEDTLS_MD_SHA256;

  mbedtls_md_init(&ctx);
  mbedtls_md_setup(&ctx, mbedtls_md_info_from_type(md_type), 0);
  mbedtls_md_starts(&ctx);
  mbedtls_md_update(&ctx, (const unsigned char *)password, strlen(password));
  mbedtls_md_finish(&ctx, key);
  mbedtls_md_free(&ctx);
}

// Mã hóa AES-256-CBC
String encodedAES_Humidity(float value)
{
  unsigned char key[32];
  generateKey(simpleKey1, key);

  // IV cố định (16 bytes)
  unsigned char iv[16] = {0};
  for (int i = 0; i < 16; i++)
    iv[i] = i;

  // Chuyển số thành string
  char valueStr[20];
  sprintf(valueStr, "%.1f", value);

  // PKCS7 Padding
  int inputLen = strlen(valueStr);
  int paddedLen = ((inputLen / 16) + 1) * 16;
  unsigned char input[paddedLen];
  memcpy(input, valueStr, inputLen);

  int paddingValue = paddedLen - inputLen;
  for (int i = inputLen; i < paddedLen; i++)
  {
    input[i] = paddingValue;
  }

  // Mã hóa
  unsigned char output[paddedLen];
  mbedtls_aes_context aes;
  mbedtls_aes_init(&aes);
  mbedtls_aes_setkey_enc(&aes, key, 256);

  unsigned char iv_copy[16];
  memcpy(iv_copy, iv, 16);
  mbedtls_aes_crypt_cbc(&aes, MBEDTLS_AES_ENCRYPT, paddedLen, iv_copy, input, output);
  mbedtls_aes_free(&aes);

  // Base64 encode
  size_t olen;
  unsigned char base64Output[200];
  mbedtls_base64_encode(base64Output, sizeof(base64Output), &olen, output, paddedLen);

  return String((char *)base64Output);
}

String encodedDES_Humidity(float value, const char *keyStr = "165743")
{
  //
}

// ====== Endpoint: /data_from_esp32 (GET) ======
void handledata_from_esp32()
{
  // Demo: cập nhật nhẹ để nhìn thấy thay đổi
  Temperature += 0.1;
  if (Temperature > 35.0)
    Temperature = 27.0;
  Humidity += 0.5;
  if (Humidity > 60.0)
    Humidity = 45.0;
  StaticJsonDocument<128> doc;
  doc["success"] = true;

  // Mã hóa độ ẩm nếu cần
  if (enable_encryption == "ON")
  {
    if (encryption_method == "AES-256")
    {
      // Mã hóa AES
      doc["humidity"] = encodedAES_Humidity(Humidity);
      Serial.println("phương thức mã hóa AES được chọn");
      Serial.println("giá trị độ ẩm sau mã hóa AES: " + doc["humidity"].as<String>());
    }
    else if (encryption_method == "DES")
    {
      //
      doc["humidity"] = String(Humidity);
      Serial.println("phương thức mã hóa DES được chọn");
      Serial.println("nhưng hiện chưa thể mã hóa DES");
    }
  }
  else
  {
    doc["humidity"] = String(Humidity);
    Serial.println("phương thức mã hóa không được chọn");
  }
  doc["temperature"] = Temperature;
  doc["status_led"] = ledState ? "ON" : "OFF";
  doc["status_fan"] = fanState ? "ON" : "OFF";
  doc["is_online"] = true;
  sendJson(server, 200, doc);
  Serial.println("Sensor temperature, humidity data requested");
}

void handleEncryption()
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

  enable_encryption = doc["enable_encryption"] | "OFF";
  encryption_method = doc["encryption_method"] | "";

  Serial.println("trạng thái mã hóa " + enable_encryption);
  Serial.println("loại mã hóa " + encryption_method);

  // Trả về JSON
  StaticJsonDocument<128> resp;
  resp["success"] = true;
  resp["enable_encryption"] = enable_encryption;
  resp["encryption_method"] = encryption_method;
  sendJson(server, 200, resp);
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

  const char *status = doc["status_led"] | "";
  if (strcmp(status, "ON") == 0)
  {
    ledState = true;
    digitalWrite(LED_PIN, HIGH);
  }
  else if (strcmp(status, "OFF") == 0)
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
  resp["status_led"] = ledState ? "ON" : "OFF";
  sendJson(server, 200, resp);
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

  const char *status = doc["status_fan"] | "";
  if (strcmp(status, "ON") == 0)
  {
    fanState = true;
    digitalWrite(FAN_PIN, HIGH);
  }
  else if (strcmp(status, "OFF") == 0)
  {
    fanState = false;
    digitalWrite(FAN_PIN, LOW);
  }
  else
  {
    server.send(400, "text/plain", "Invalid state");
    return;
  }

  // Trả về JSON
  StaticJsonDocument<128> resp;
  resp["success"] = true;
  resp["status_fan"] = fanState ? "ON" : "OFF";
  sendJson(server, 200, resp);
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

  Serial.printf("\nlấy được IP esp32 là %s", WiFi.localIP().toString());
  // Serial.printf("\nWiFi connected: %s, IP của server esp32 chính là IP room: %s\n",
  //               WIFI_SSID, IP_Esp32);
}

// ====== Setup ======
void setup()
{
  Serial.begin(115200);
  delay(1000);
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, HIGH);

  connectWiFi();

  // cấu hình esp32 giống như 1 server, vì thế sẽ có địa chỉ IP phụ thuộc vào mạng đang dùng
  // nên không thể tự định nghĩa IP được

  // đây chính là API nội bộ mà esp32 cung cấp và web server (nodejs) sẽ dùng những cái này để
  // nhận gửi dữ liệu đến thiết bị thông qua esp32
  server.on("/is_online", HTTP_GET, handleis_online);
  server.on("/data_from_esp32", HTTP_GET, handledata_from_esp32);
  server.on("/led", HTTP_POST, handleLed);
  server.on("/fan", HTTP_POST, handleFan);
  server.on("/encryption", HTTP_POST, handleEncryption);
  server.begin();
  Serial.println("\nESP32 HTTP server started on port 80");
}

void loop()
{
  server.handleClient();
}
