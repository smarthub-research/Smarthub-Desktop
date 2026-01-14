"""Kinematic calculation utilities used by the processing pipeline.

This module contains `CalcUtils`, a small helper class that provides
conversion utilities between gyro rates (deg/s) and physical quantities:
- displacement (meters)
- distance (meters)
- velocity (m/s)
- heading change (degrees)

All functions expect gyro rotation rates in degrees/second and time
intervals in seconds. Constants for wheel dimensions and unit conversions
are imported from the project's `constants` module.
"""

import numpy as np

from constants import (
    WHEEL_DIAM_IN,
    DIST_WHEELS_IN,
    IN_TO_M
)


class CalcUtils:
    """Small stateful helper for kinematic calculations.

    The class currently keeps some legacy state fields for compatibility but
    exposes purely functional methods that compute results from the inputs.
    """

    def __init__(self) -> None:
        self.last_distance = 0
        self.last_displacement = 0
        self.last_velocity = 0
        self.last_heading = 0
        self.last_dx = 0
        self.last_dy = 0
        self.last_dt = 0

    def get_displacement_m(self, time_from_start, rot_l, rot_r, diameter=WHEEL_DIAM_IN):
        """Return linear displacement (m) during the provided time interval.

        Args:
            time_from_start: Pair/list like [t_prev, t_curr]
            rot_l: left wheel gyro rate (deg/s)
            rot_r: right wheel gyro rate (deg/s)
            diameter: wheel diameter in inches
        """
        # Time step (seconds)
        dt = time_from_start[1] - time_from_start[0]

        # Use average angular rate from both wheels (deg/s)
        avg_gyro = (rot_l + rot_r) / 2

        # Convert angular rate to rotations during the interval
        dx_rotations = (avg_gyro * dt) / 360.0

        # Rotations -> meters: rotations * circumference * in->m
        dx_m = dx_rotations * np.pi * diameter * IN_TO_M

        return dx_m

    def get_distance_m(self, time_from_start, rot_l, rot_r, diameter=WHEEL_DIAM_IN):
        """Return absolute distance traveled (m) using absolute wheel rates."""
        return self.get_displacement_m(time_from_start, abs(rot_l), abs(rot_r), diameter)

    def get_velocity_m_s(self, rot_l, rot_r, diameter=WHEEL_DIAM_IN):
        """Estimate vehicle forward velocity (m/s) from wheel angular rates.

        Note: uses simple geometry approximations; kept consistent with legacy
        code that derives velocity from wheel angular rates.
        """
        # Angular to linear conversion: omega (deg/s) -> radians/s -> linear
        v_r = (rot_r) * (diameter / 2) * IN_TO_M * (np.pi / 180.0)
        v_l = (rot_l) * (diameter / 2) * IN_TO_M * (np.pi / 180.0)

        # Forward velocity is average of both wheel linear speeds
        v_curr = (v_r + v_l) / 2.0
        return v_curr

    def get_heading_deg(self, time_from_start, rot_l, rot_r, diameter=WHEEL_DIAM_IN, dist_wheels=DIST_WHEELS_IN):
        """Compute heading change (degrees) over the given time interval.

        Heading change is derived from the arc-length difference between
        wheels divided by the wheelbase, converting the result to degrees.
        """
        dt = time_from_start[1] - time_from_start[0]

        # Difference in wheel angular rates (deg/s)
        delta_gyro = rot_r - rot_l

        # Rotation difference over the time step (degrees)
        delta_rotation_deg = delta_gyro * dt

        # Convert rotation difference to arc length difference (meters)
        delta_arc_length = (delta_rotation_deg / 360.0) * np.pi * diameter * IN_TO_M

        # Angular change (radians) = arc length difference / wheelbase
        delta_heading_rad = delta_arc_length / (dist_wheels * IN_TO_M)

        # Convert to degrees
        dh = delta_heading_rad * 180.0 / np.pi
        return dh

    def get_top_traj(self, vel_ms, heading_deg, time_from_start):
        """Approximate small-step trajectory delta from velocity and heading.

        Returns a dict with incremental `x` and `y` displacements (meters).
        """
        dt = time_from_start[1] - time_from_start[0]
        # heading_deg interpreted as heading angle in degrees
        dx = vel_ms * np.cos(np.deg2rad(heading_deg)) * dt
        dy = vel_ms * np.sin(np.deg2rad(heading_deg)) * dt

        return {
            "x": dx,
            "y": dy
        }
