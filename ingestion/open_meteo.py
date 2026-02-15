import time
import os
import requests
from influxdb_client import InfluxDBClient, Point
from influxdb_client.client.write_api import SYNCHRONOUS
from dotenv import load_dotenv

# Load .env
load_dotenv()

# InfluxDB config
INFLUX_URL = os.getenv("INFLUX_URL")
INFLUX_TOKEN = os.getenv("INFLUX_TOKEN")
INFLUX_ORG = os.getenv("INFLUX_ORG")
INFLUX_BUCKET = os.getenv("INFLUX_BUCKET")

# Location (Bangladesh example)
LATITUDE = 23.97
LONGITUDE = 90.32

INTERVAL = 300  # 5 minutes

client = InfluxDBClient(
    url=INFLUX_URL,
    token=INFLUX_TOKEN,
    org=INFLUX_ORG
)

write_api = client.write_api(write_options=SYNCHRONOUS)

while True:
    try:
        url = (
            "https://api.open-meteo.com/v1/forecast"
            f"?latitude={LATITUDE}&longitude={LONGITUDE}"
            "&current=temperature_2m,relative_humidity_2m,"
            "pressure_msl,wind_speed_10m,wind_direction_10m"
        )

        response = requests.get(url, timeout=10)
        data = response.json()
        current = data["current"]

        point = (
            Point("weather_live")
            .field("temperature", current["temperature_2m"])
            .field("humidity", current["relative_humidity_2m"])
            .field("pressure", current["pressure_msl"])
            .field("wind_speed", current["wind_speed_10m"])
            .field("wind_direction", current["wind_direction_10m"])
            .time(current["time"])
        )

        write_api.write(bucket=INFLUX_BUCKET, record=point)

        print("✅ Data written:", current["time"])

    except Exception as e:
        print("❌ Error:", e)

    time.sleep(INTERVAL)
