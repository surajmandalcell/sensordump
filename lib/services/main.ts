import { Accelerometer } from "expo-sensors";
import { format } from "date-fns";
import {
  documentDirectory,
  getInfoAsync,
  readAsStringAsync,
  writeAsStringAsync,
} from "expo-file-system";
import { isAvailableAsync, shareAsync } from "expo-sharing";

let accelerometerSubscription: any = null;
const LOG_FILE_NAME = "logdata.txt";
let logFilePath: string;
let lastSessionEndTimestamp: number | null = null;

export async function detectSensors(): Promise<{
  [key: string]: boolean | undefined;
}> {
  const sensors: { [key: string]: boolean | undefined } = {
    accelerometer: undefined,
  };
  sensors.accelerometer = await Accelerometer.isAvailableAsync();
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

  Accelerometer.setUpdateInterval(interval);
  accelerometerSubscription = Accelerometer.addListener(async (data) => {
    const now = new Date();
    const rtcDate = format(now, "MM/dd/yyyy");
    const rtcTime = format(now, "HH:mm:ss.SS");

    const logData = `${rtcDate},${rtcTime},${data.x.toFixed(2)},${data.y.toFixed(
      2
    )},${data.z.toFixed(2)},0,0,0,0,0,0,0,${rtcDate},${rtcTime},0,0,0,0,0,0,0,9999,${(
      1000 / interval
    ).toFixed(3)}\n`;

    await appendToLogFile(logData);
  });
}

export async function stopLogging() {
  if (accelerometerSubscription) {
    accelerometerSubscription.remove();
    accelerometerSubscription = null;
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
