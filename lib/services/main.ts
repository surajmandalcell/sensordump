import { Accelerometer } from "expo-sensors";

let accelerometerSubscription: any = null;

export async function detectSensors(): Promise<{
  [key: string]: boolean | undefined;
}> {
  const sensors: { [key: string]: boolean | undefined } = {
    accelerometer: undefined,
  };
  sensors.accelerometer = await Accelerometer.isAvailableAsync();
  console.log(`Sensors: ${JSON.stringify(sensors)}`);
  return sensors;
}

export async function handlePermissions() {
  const status = {
    accelerometer: false,
  };
  let { granted: accGranted } = await Accelerometer.getPermissionsAsync();

  if (accGranted) {
    const response = await Accelerometer.requestPermissionsAsync();
    status.accelerometer = response.granted;
  }

  return status;
}

export function startLogging({ interval } = { interval: 200 }) {
  Accelerometer.setUpdateInterval(interval);
  accelerometerSubscription = Accelerometer.addListener((data) => {
    console.log(`Accelerometer: ${JSON.stringify(data)}`);
  });
}

export function stopLogging() {
  if (accelerometerSubscription) {
    accelerometerSubscription.remove();
    accelerometerSubscription = null;
  }
}
