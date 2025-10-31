import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")

supabase: Client = create_client(url, key)


# API configuration
API_HOST = "localhost"
API_PORT = 8000

# CORS origins
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000"
]

KAFKA_BOOTSTRAP = "localhost:9092"
RAW_TOPIC = "raw-packets"
RESULT_TOPIC = "processed-results"
RECORDING_EVENTS_TOPIC = "recording-events"

import os
from datetime import datetime

left_gain = 23.10
left_offset = -0.049
right_gain = 22.94
right_offset = -0.0357

D_EULER_THRESH = 25
WHEEL_DIAM_IN = 1
IN_TO_M = 0.0254
DIST_WHEELS_IN = 21.07

DATETIME_FMT = '%Y%m%d'
DATETIME_HMS_FMT = '%Y%m%d-%H%M%S'
DATE_DAY = datetime.now().strftime(DATETIME_FMT)
DATE_NOW = datetime.now().strftime(DATETIME_HMS_FMT)
DATA_DIR = os.path.join(os.getcwd(), 'data')
DATE_DIR = os.path.join(DATA_DIR, DATE_DAY)
