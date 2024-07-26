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
import * as Location from "expo-location";

let accelerometerSubscription: any = null;
let gyroscopeSubscription: any = null;
let magnetometerSubscription: any = null;
let barometerSubscription: any = null;
let pedometerSubscription: any = null;
let lightSubscription: any = null;
let locationSubscription: any = null;

const LOG_FILE_NAME = "logdata.txt";
let logFilePath: string;
let lastSessionEndTimestamp: number | null = null;
let loggingInterval: NodeJS.Timeout | null = null;

export type SensorState = {
  gps: boolean;
  accelerometer: boolean;
  gyroscope: boolean;
  magnetometer: boolean;
  light: boolean;
  barometer: boolean;
  pedometer: boolean;
};

export async function detectSensors(): Promise<SensorState> {
  const sensors: SensorState = {
    gps: await Location.hasServicesEnabledAsync(),
    accelerometer: await Accelerometer.isAvailableAsync(),
    gyroscope: await Gyroscope.isAvailableAsync(),
    magnetometer: await Magnetometer.isAvailableAsync(),
    barometer: await Barometer.isAvailableAsync(),
    pedometer: await Pedometer.isAvailableAsync(),
    light: await LightSensor.isAvailableAsync(),
  };
  return sensors;
}

export async function handlePermissions() {
  const status: SensorState = {
    gps: false,
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
  let { granted: locationGranted } = await Location.getForegroundPermissionsAsync();

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

  if (!locationGranted) {
    const response = await Location.requestForegroundPermissionsAsync();
    status.gps = response.granted;
  } else {
    status.gps = true;
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

export async function startLogging({
  interval,
  activeSensors,
}: {
  interval: number;
  activeSensors: SensorState;
}) {
  const startTimestamp = +new Date();
  await appendToLogFile(`START,${startTimestamp}\n`);

  // Generate dynamic headers based on active sensors
  let headers = "Date,Time";
  if (activeSensors.gps) headers += ",Latitude,Longitude,Altitude,Speed";
  if (activeSensors.accelerometer) headers += ",AccX,AccY,AccZ";
  if (activeSensors.gyroscope) headers += ",GyroX,GyroY,GyroZ";
  if (activeSensors.magnetometer) headers += ",MagX,MagY,MagZ";
  if (activeSensors.barometer) headers += ",Pressure";
  if (activeSensors.pedometer) headers += ",Steps";
  if (activeSensors.light) headers += ",Illuminance";
  headers += ",SampleRate\n";

  await appendToLogFile(headers);

  const updateInterval = interval;

  if (activeSensors.accelerometer) {
    Accelerometer.setUpdateInterval(updateInterval);
  }
  if (activeSensors.gyroscope) {
    Gyroscope.setUpdateInterval(updateInterval);
  }
  if (activeSensors.magnetometer) {
    Magnetometer.setUpdateInterval(updateInterval);
  }
  if (activeSensors.barometer) {
    Barometer.setUpdateInterval(updateInterval);
  }
  if (activeSensors.light) {
    LightSensor.setUpdateInterval(updateInterval);
  }

  let accData = { x: 0, y: 0, z: 0 };
  let gyroData = { x: 0, y: 0, z: 0 };
  let magData = { x: 0, y: 0, z: 0 };
  let baroData = { pressure: 0 };
  let steps = 0;
  let lightData = { illuminance: 0 };
  let gpsData = {
    latitude: 0,
    longitude: 0,
    altitude: 0,
    speed: 0,
    accuracy: 0,
    heading: 0,
    altitudeAccuracy: 0,
  };

  if (activeSensors.accelerometer) {
    accelerometerSubscription = Accelerometer.addListener((data) => {
      accData = data;
    });
  }

  if (activeSensors.gyroscope) {
    gyroscopeSubscription = Gyroscope.addListener((data) => {
      gyroData = data;
    });
  }

  if (activeSensors.magnetometer) {
    magnetometerSubscription = Magnetometer.addListener((data) => {
      magData = data;
    });
  }

  if (activeSensors.barometer) {
    barometerSubscription = Barometer.addListener((data) => {
      baroData = data;
    });
  }

  if (activeSensors.pedometer) {
    pedometerSubscription = Pedometer.watchStepCount((result) => {
      steps = result.steps;
    });
  }

  if (activeSensors.light) {
    lightSubscription = LightSensor.addListener((data) => {
      lightData = data;
    });
  }

  if (activeSensors.gps) {
    locationSubscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: updateInterval,
        distanceInterval: 1, // Update every 1 meter
      },
      (location) => {
        gpsData = {
          accuracy: location.coords.accuracy || 0,
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          speed: location.coords.speed || 0,
          heading: location.coords.heading || 0,
          altitude: location.coords.altitude || 0,
          altitudeAccuracy: location.coords.altitudeAccuracy || 0,
        };
      }
    );
  }

  loggingInterval = setInterval(async () => {
    const now = new Date();
    const rtcDate = format(now, "MM/dd/yyyy");
    const rtcTime = format(now, "HH:mm:ss.SS");

    let logData = `${rtcDate},${rtcTime}`;

    if (activeSensors.gps) {
      logData += `,${gpsData.latitude.toFixed(6)},${gpsData.longitude.toFixed(
        6
      )},${gpsData.altitude.toFixed(2)},${gpsData.speed.toFixed(2)}`;
    }
    if (activeSensors.accelerometer) {
      logData += `,${accData.x.toFixed(2)},${accData.y.toFixed(2)},${accData.z.toFixed(2)}`;
    }
    if (activeSensors.gyroscope) {
      logData += `,${gyroData.x.toFixed(2)},${gyroData.y.toFixed(2)},${gyroData.z.toFixed(
        2
      )}`;
    }
    if (activeSensors.magnetometer) {
      logData += `,${magData.x.toFixed(2)},${magData.y.toFixed(2)},${magData.z.toFixed(2)}`;
    }
    if (activeSensors.barometer) {
      logData += `,${baroData.pressure.toFixed(2)}`;
    }
    if (activeSensors.pedometer) {
      logData += `,${steps}`;
    }
    if (activeSensors.light) {
      logData += `,${lightData.illuminance.toFixed(2)}`;
    }

    logData += `,${(1000 / updateInterval).toFixed(3)}\n`;

    // FIXME: Add more data processing here
    // Estimate wind speed
    console.log("Wind speed:");

    await appendToLogFile(logData);
  }, updateInterval);
}

export async function stopLogging(): Promise<boolean> {
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
  if (locationSubscription) {
    locationSubscription.remove();
    locationSubscription = null;
  }

  if (loggingInterval) {
    clearInterval(loggingInterval);
    loggingInterval = null;
  }

  const endTimestamp = +new Date();
  await appendToLogFile(`END,${endTimestamp}\n`);

  // Ensure the END timestamp is written
  try {
    const fileContent = await readAsStringAsync(logFilePath);
    if (!fileContent.trim().endsWith(`END,${endTimestamp}`)) {
      throw new Error("Failed to write END timestamp");
    }
  } catch (error) {
    console.error("Error verifying END timestamp:", error);
    return false;
  }

  return true;
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
