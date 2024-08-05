import { SensorState } from "@/lib/main";

const initialSensorStates: SensorState = {
  gps: false,
  accelerometer: false,
  gyroscope: false,
  magnetometer: false,
  barometer: false,
  pedometer: false,
  light: false,
};

export { initialSensorStates };