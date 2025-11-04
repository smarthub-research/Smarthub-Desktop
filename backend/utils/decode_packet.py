"""
Utility functions for decoding SmartHub BLE data packets.
"""


def convert_from_raw(raw_data: bytearray):
    """
    Convert raw data from SmartHub to true acceleration and gyro data.
    
    :param raw_data: raw data as 18 len bytearray
    :returns: tuple of (accel_data, gyro_data) each as list of 4 floats

    Format of raw data:
    ┏---┓
    ┃ 0 ┃ sign bits for accel data  0b00001111 if all 4 negative
    ┗---┛
    ┏---┓
    ┃ 1 ┃ sign bits for gyro data  0b00001111 if all 4 negative
    ┗---┛
    ┏---┓┏---┓
    ┃ 2 ┃┃ 3 ┃ accel data 1 (LSB first) | unsigned value, divide by 1000 to get true accel data
    ┗---┗┗---┛
    ┏---┓┏---┓
    ┃ 4 ┃┃ 5 ┃ accel data 2
    ┗---┗┗---┛
    ┏---┓┏---┓
    ┃ 6 ┃┃ 7 ┃ accel data 3
    ┗---┗┗---┛
    ┏---┓┏---┓
    ┃ 8 ┃┃ 9 ┃ accel data 4
    ┗---┗┗---┛
    ┏----┓┏----┓
    ┃ 10 ┃┃ 11 ┃ gyro data 1 (LSB first) | unsigned value, divide by 100 to get true gyro data
    ┗----┗┗----┛
    ┏----┓┏----┓
    ┃ 12 ┃┃ 13 ┃ gyro data 2
    ┗----┗┗----┛
    ┏----┓┏----┓
    ┃ 14 ┃┃ 15 ┃ gyro data 3
    ┗----┗┗----┛
    ┏----┓┏----┓
    ┃ 16 ┃┃ 17 ┃ gyro data 4
    ┗----┗┗----┛

    1 refers to oldest data, 4 refers to newest data
    """
    accel_data = []
    gyro_data = []

    for i in range(4):
        # LSB first - convert to true accel data
        accel_data.append((raw_data[2*i+2] + raw_data[2*i+3]*256) / 1000)
        
        # LSB first - convert to true gyro data
        gyro_data.append((raw_data[2*i+10] + raw_data[2*i+11]*256) / 100)

        # Apply signs from sign bytes
        if (raw_data[0] & (1 << i)) == (1 << i):
            accel_data[i] *= -1

        if (raw_data[1] & (1 << i)) == (1 << i):
            gyro_data[i] *= -1
            
    return {
        "accel_data": accel_data, 
        "gyro_data": gyro_data
    }

