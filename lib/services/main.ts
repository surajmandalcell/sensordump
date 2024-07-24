import {
  Accelerometer,
  Gyroscope,
  Magnetometer,
  Barometer,
  Pedometer,
  LightSensor,
} from "expo-sensors";
import {
  documentDirectory,
  getInfoAsync,
  readAsStringAsync,
  writeAsStringAsync,
} from "expo-file-system";
import { isAvailableAsync, shareAsync } from "expo-sharing";
import { format } from "date-fns";

let accelerometerSubscription: any = null;
let gyroscopeSubscription: any = null;
let magnetometerSubscription: any = null;
let barometerSubscription: any = null;
let pedometerSubscription: any = null;
let lightSubscription: any = null;

const LOG_FILE_NAME = "logdata.txt";
let logFilePath: string;
let lastSessionEndTimestamp: number | null = null;

export async function detectSensors(): Promise<{
  [key: string]: boolean | undefined;
}> {
  const sensors: { [key: string]: boolean | undefined } = {
    accelerometer: undefined,
    gyroscope: undefined,
    magnetometer: undefined,
    barometer: undefined,
    pedometer: undefined,
    light: undefined,
  };
  sensors.accelerometer = await Accelerometer.isAvailableAsync();
  sensors.gyroscope = await Gyroscope.isAvailableAsync();
  sensors.magnetometer = await Magnetometer.isAvailableAsync();
  sensors.barometer = await Barometer.isAvailableAsync();
  sensors.pedometer = await Pedometer.isAvailableAsync();
  sensors.light = await LightSensor.isAvailableAsync();
  return sensors;
}

export async function handlePermissions() {
  const status = {
    accelerometer: false,
    gyroscope: false,
    magnetometer: false,
    barometer: false,
    pedometer: false,
    light: false,
  };

  let { granted: accGranted } = await Accelerometer.getPermissionsAsync();
  let { granted: gyroGranted } = await Gyroscope.getPermissionsAsync();
  let { granted: magGranted } = await Magnetometer.getPermissionsAsync();
  let { granted: baroGranted } = await Barometer.getPermissionsAsync();
  let { granted: pedoGranted } = await Pedometer.getPermissionsAsync();
  let { granted: lightGranted } = await LightSensor.getPermissionsAsync();

  if (!accGranted) {
    const response = await Accelerometer.requestPermissionsAsync();
    status.accelerometer = response.granted;
  } else {
    status.accelerometer = true;
  }

  if (!gyroGranted) {
    const response = await Gyroscope.requestPermissionsAsync();
    status.gyroscope = response.granted;
  } else {
    status.gyroscope = true;
  }

  if (!magGranted) {
    const response = await Magnetometer.requestPermissionsAsync();
    status.magnetometer = response.granted;
  } else {
    status.magnetometer = true;
  }

  if (!baroGranted) {
    const response = await Barometer.requestPermissionsAsync();
    status.barometer = response.granted;
  } else {
    status.barometer = true;
  }

  if (!pedoGranted) {
    const response = await Pedometer.requestPermissionsAsync();
    status.pedometer = response.granted;
  } else {
    status.pedometer = true;
  }

  if (!lightGranted) {
    const response = await LightSensor.requestPermissionsAsync();
    status.light = response.granted;
  } else {
    status.light = true;
  }

  await initializeLogFile();

  return status;
}

async function initializeLogFile() {
  logFilePath = `${documentDirectory}${LOG_FILE_NAME}`;
  const fileInfo = await getInfoAsync(logFilePath);

  if (fileInfo.exists) {
    const fileContent = await readAsStringAsync(logFilePath);
    const lines = fileContent.split("\n");
    const lastLine = lines[lines.length - 1];

    if (!lastLine.startsWith("END,")) {
      lastSessionEndTimestamp = +new Date();
      const updatedContent = fileContent + `END,${lastSessionEndTimestamp}\n`;
      await writeAsStringAsync(logFilePath, updatedContent);
    }
  } else {
    await writeAsStringAsync(logFilePath, "");
  }
}

async function appendToLogFile(data: string) {
  const existingContent = await readAsStringAsync(logFilePath);
  const updatedContent = existingContent + data;
  await writeAsStringAsync(logFilePath, updatedContent);
}

export function startLogging({ interval } = { interval: 200 }) {
  const startTimestamp = +new Date();
  appendToLogFile(`START,${startTimestamp}\n`);

  const updateInterval = interval;
  Accelerometer.setUpdateInterval(updateInterval);
  Gyroscope.setUpdateInterval(updateInterval);
  Magnetometer.setUpdateInterval(updateInterval);
  Barometer.setUpdateInterval(updateInterval);
  LightSensor.setUpdateInterval(updateInterval);

  let accData = { x: 0, y: 0, z: 0 };
  let gyroData = { x: 0, y: 0, z: 0 };
  let magData = { x: 0, y: 0, z: 0 };
  let baroData = { pressure: 0 };
  let steps = 0;
  let lightData = { illuminance: 0 };

  accelerometerSubscription = Accelerometer.addListener((data) => {
    accData = data;
  });

  gyroscopeSubscription = Gyroscope.addListener((data) => {
    gyroData = data;
  });

  magnetometerSubscription = Magnetometer.addListener((data) => {
    magData = data;
  });

  barometerSubscription = Barometer.addListener((data) => {
    baroData = data;
  });

  pedometerSubscription = Pedometer.watchStepCount((result) => {
    steps = result.steps;
  });

  lightSubscription = LightSensor.addListener((data) => {
    lightData = data;
  });

  setInterval(async () => {
    const now = new Date();
    const rtcDate = format(now, "MM/dd/yyyy");
    const rtcTime = format(now, "HH:mm:ss.SS");

    const logData =
      `${rtcDate},${rtcTime},${accData.x.toFixed(2)},${accData.y.toFixed(
        2
      )},${accData.z.toFixed(2)},` +
      `${gyroData.x.toFixed(2)},${gyroData.y.toFixed(2)},${gyroData.z.toFixed(2)},` +
      `${magData.x.toFixed(2)},${magData.y.toFixed(2)},${magData.z.toFixed(2)},` +
      `${baroData.pressure.toFixed(2)},${rtcDate},${rtcTime},${steps},` +
      `${lightData.illuminance.toFixed(2)},0,0,0,0,0,9999,${(1000 / updateInterval).toFixed(
        3
      )}\n`;

    await appendToLogFile(logData);
  }, updateInterval);
}

export async function stopLogging() {
  if (accelerometerSubscription) {
    accelerometerSubscription.remove();
    accelerometerSubscription = null;
  }
  if (gyroscopeSubscription) {
    gyroscopeSubscription.remove();
    gyroscopeSubscription = null;
  }
  if (magnetometerSubscription) {
    magnetometerSubscription.remove();
    magnetometerSubscription = null;
  }
  if (barometerSubscription) {
    barometerSubscription.remove();
    barometerSubscription = null;
  }
  if (pedometerSubscription) {
    pedometerSubscription.remove();
    pedometerSubscription = null;
  }
  if (lightSubscription) {
    lightSubscription.remove();
    lightSubscription = null;
  }

  const endTimestamp = +new Date();
  await appendToLogFile(`END,${endTimestamp}\n`);
}

export async function shareLogFile() {
  if (!(await isAvailableAsync())) {
    alert("Sharing is not available on this device");
    return;
  }

  try {
    await shareAsync(logFilePath);
  } catch (error) {
    console.error("Error sharing log file:", error);
    alert("An error occurred while sharing the log file");
  }
}

export async function cleanLogFile() {
  try {
    await writeAsStringAsync(logFilePath, "");
    console.log("Log file cleared successfully");
  } catch (error) {
    console.error("Error clearing log file:", error);
    throw new Error("Failed to clear log file");
  }
}
