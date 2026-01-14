"""Simple helper to persist collected row-oriented sensor data to JSON.

The `save_data` function expects `data` as an iterable of rows where each
row contains ordered columns matching the structured output below. The
routine transposes the rows into column arrays and writes a timestamped
JSON file into the local `data/` folder.
"""

import json
import os
from datetime import datetime


def save_data(data):
    """Save collected rows to a timestamped JSON file.

    Args:
        data: iterable of rows (e.g. list of tuples/lists). Each row is
              expected to contain the fields in the order matched below.

    Returns:
        Path to the saved JSON file.
    """
    os.makedirs("data", exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    data_file = os.path.join("data", f"data_{timestamp}.json")

    # Transpose rows -> columns
    transposed = list(zip(*data))
    structured_data = {
        "timestamps": list(transposed[0]),
        "left_accel_x": list(transposed[1]),
        "left_accel_y": list(transposed[2]),
        "left_accel_z": list(transposed[3]),
        "left_gyro_x_raw": list(transposed[4]),
        "left_gyro_x_calibrated": list(transposed[5]),
        "left_gyro_y_raw": list(transposed[6]),
        "left_gyro_y_calibrated": list(transposed[7]),
        "left_gyro_z_raw": list(transposed[8]),
        "left_gyro_z_calibrated": list(transposed[9]),
        "right_accel_x": list(transposed[10]),
        "right_accel_y": list(transposed[11]),
        "right_accel_z": list(transposed[12]),
        "right_gyro_x_raw": list(transposed[13]),
        "right_gyro_x_calibrated": list(transposed[14]),
        "right_gyro_y_raw": list(transposed[15]),
        "right_gyro_y_calibrated": list(transposed[16]),
        "right_gyro_z_raw": list(transposed[17]),
        "right_gyro_z_calibrated": list(transposed[18])
    }

    with open(data_file, "w") as f:
        json.dump(structured_data, f, indent=2)

    print(f"Saved {len(data)} samples → {data_file}")
    return data_file