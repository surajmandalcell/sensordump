import { getInfoAsync, EncodingType, StorageAccessFramework } from "expo-file-system";
import { Platform } from "react-native";

const {
  requestDirectoryPermissionsAsync,
  readDirectoryAsync,
  writeAsStringAsync,
  makeDirectoryAsync,
} = StorageAccessFramework;

let baseDirectory: string;

export async function initializeBaseDirectory() {
  if (Platform.OS === "android") {
    const permissions = await requestDirectoryPermissionsAsync();

    if (permissions.granted) {
      console.log("Permission granted");
      baseDirectory = permissions.directoryUri;
      console.log("Base directory", baseDirectory);
    } else {
      throw new Error("Storage permission not granted");
    }
  }

  const metaDataDir = await getInfoAsync(baseDirectory);
  const isDir = metaDataDir.isDirectory;
  if (!isDir) {
    try {
      await makeDirectoryAsync(baseDirectory, "Sensordump");
    } catch (e) {
      console.info("ERROR", e);
    }
  }
}

export async function getLastLogNumber(): Promise<number> {
  const files = await readDirectoryAsync(baseDirectory);
  const logFiles = files.filter((file) => file.startsWith("dataLog") && file.endsWith(".csv"));

  if (logFiles.length === 0) {
    return 0;
  }

  const lastFile = logFiles.sort().pop();
  if (lastFile) {
    const match = lastFile.match(/dataLog(\d+)\.csv/);
    if (match) {
      return parseInt(match[1], 10);
    }
  }

  return 0;
}

export async function createNewLogFile(currentLogNumber: number): Promise<string> {
  const fileName = `dataLog${currentLogNumber.toString().padStart(5, "0")}.csv`;
  const filePath = `${baseDirectory}/${fileName}`;

  await writeAsStringAsync(
    filePath,
    "rtcDate,rtcTime,aX,aY,aZ,gX,gY,gZ,mX,mY,mZ,imu_degC,gps_Date,gps_Time,gps_Lat,gps_Long,gps_Alt,gps_SIV,gps_FixType,gps_GroundSpeed,gps_Heading,gps_pDOP,output_Hz\n",
    { encoding: EncodingType.UTF8 }
  );

  return filePath;
}

export async function appendToLogFile(filePath: string, data: string) {
  await writeAsStringAsync(filePath, data, { encoding: EncodingType.UTF8 });
}
