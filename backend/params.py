import os
from datetime import datetime

leftGain = 23.81
left_offset = -0.049
rightGain = 23.61
right_offset = -0.0357

D_EULER_THRESH = 25
WHEEL_DIAM_IN = 1
IN_TO_M = 0.0254
DIST_WHEELS_IN = 21.51

DATETIME_FMT = '%Y%m%d'
DATETIME_HMS_FMT = '%Y%m%d-%H%M%S'
DATE_DAY = datetime.now().strftime(DATETIME_FMT)
DATE_NOW = datetime.now().strftime(DATETIME_HMS_FMT)
DATA_DIR = os.path.join(os.getcwd(), 'data')
DATE_DIR = os.path.join(DATA_DIR, DATE_DAY)