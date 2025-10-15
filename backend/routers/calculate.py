from fastapi import APIRouter
from calc import get_displacement_m, get_velocity_m_s, get_heading_deg, get_top_traj, smooth_data
from metricsService import data_analyze_main

router = APIRouter(
    prefix="/calculate",
    tags=["calculate"],
    responses={404: {"description": "Not found"}}
)

# Expected input 
@router.post("/")
async def calc(data: dict):
    
    rightGain = 1.12
    leftGain = 1.13

    # Apply gain to each element in the smoothed arrays
    data["gyroRight"] = [x * rightGain for x in data["gyroRight"]]
    data["gyroLeft"] = [x * leftGain for x in data["gyroLeft"]]

    # Default wheel_distance if not present
    wheel_distance = 26

    displacement = get_displacement_m(data["timeStamps"], data["gyroLeft"], data["gyroRight"], 24, wheel_distance)
    velocity = get_velocity_m_s(data["timeStamps"], data["gyroLeft"], data["gyroRight"], 24, wheel_distance)
    heading = get_heading_deg(data["timeStamps"], data["gyroLeft"], data["gyroRight"], 24, wheel_distance)
    trajectory = get_top_traj(disp_m=displacement, vel_ms=velocity, heading_deg=heading, timeStamps=data["timeStamps"])

    # Transform trajectory data to separate x,y arrays to match frontend expectations
    trajectory_x = [point[0] for point in trajectory] if trajectory else []
    trajectory_y = [point[1] for point in trajectory] if trajectory else []

    return {
        "displacement": displacement,
        "velocity": velocity,
        "heading": heading,
        "trajectory_x": trajectory_x,
        "trajectory_y": trajectory_y,
        "gyroLeft": data["gyroLeft"],
        "gyroRight": data["gyroRight"],
        "timeStamp": data["timeStamps"]
    }

@router.get("/metrics")
async def calculateMetrics(data: dict):
    return data_analyze_main(data["timeStamp"], data["distance"], data["velocity"])

@router.post("/smooth")
async def smooth_packet(data: dict):
    print(f"Received data keys: {list(data.keys())}")
    print(f"Data types: {[(k, type(v).__name__, len(v) if isinstance(v, list) else 'N/A') for k, v in data.items()]}")
    response = smooth_data(data)
    return {
        "gyro_right_smoothed": response["gyro_right_smoothed"],
        "gyro_left_smoothed": response["gyro_left_smoothed"]
    }


