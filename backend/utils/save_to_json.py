import json, os
from datetime import datetime


def save_data(data):
    """Save collected data to timestamped JSON file in column-based format"""
    # Create data folder if it doesn't exist
    os.makedirs("data", exist_ok=True)
    
    # Generate timestamped filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    data_file = os.path.join("data", f"data_{timestamp}.json")
    
    # Transpose data from row-based to column-based format
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
    
    # Save JSON
    with open(data_file, "w") as f:
        json.dump(structured_data, f, indent=2)
    
    print(f"Saved {len(data)} samples → {data_file}")
    return data_file