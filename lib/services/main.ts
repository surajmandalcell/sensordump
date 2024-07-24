import { Accelerometer } from "expo-sensors";
import { format } from "date-fns";
import {
  initializeBaseDirectory,
  getLastLogNumber,
  createNewLogFile,
  appendToLogFile,
} from "@/lib/utils/fs";

let accelerometerSubscription: any = null;
let currentLogNumber = 1; // Starting log number
let currentLogFile: string | null = null;

export async function detectSensors(): Promise<{
  [key: string]: boolean | undefined;
}> {
  const sensors: { [key: string]: boolean | undefined } = {
    accelerometer: undefined,
  };
  sensors.accelerometer = await Accelerometer.isAvailableAsync();
  // console.log(`Sensors: ${JSON.stringify(sensors)}`);
  return sensors;
}

export async function handlePermissions() {
  const status = {
    accelerometer: false,
  };
  let { granted: accGranted } = await Accelerometer.getPermissionsAsync();

  if (!accGranted) {
    const response = await Accelerometer.requestPermissionsAsync();
    status.accelerometer = response.granted;
  } else {
    status.accelerometer = true;
  }

  await initializeBaseDirectory();

  return status;
}

async function ensureLogFile() {
  if (!currentLogFile) {
    currentLogNumber = (await getLastLogNumber()) + 1;
    currentLogFile = await createNewLogFile(currentLogNumber);
  }
}

export function startLogging({ interval } = { interval: 200 }) {
  Accelerometer.setUpdateInterval(interval);
  accelerometerSubscription = Accelerometer.addListener(async (data) => {
    const now = new Date();
    const rtcDate = format(now, "MM/dd/yyyy");
    const rtcTime = format(now, "HH:mm:ss.SS");

    const logData = `${rtcDate},${rtcTime},${data.x.toFixed(
      2
    )},${data.y.toFixed(2)},${data.z.toFixed(
      2
    )},0,0,0,0,0,0,0,${rtcDate},${rtcTime},0,0,0,0,0,0,0,9999,${(
      1000 / interval
    ).toFixed(3)}\n`;

    await ensureLogFile();
    console.log("Log file exists");
    await appendToLogFile(currentLogFile!, logData);
  });
}

export function stopLogging() {
  if (accelerometerSubscription) {
    accelerometerSubscription.remove();
    accelerometerSubscription = null;
  }
  currentLogFile = null;
}
