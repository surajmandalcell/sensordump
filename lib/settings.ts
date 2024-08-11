import * as SQLite from 'expo-sqlite';
import { SensorState } from '@/lib/main';

const DB_NAME = 'settings.db';

export interface Settings {
  sensorStates: SensorState;
}

const defaultSettings: Settings = {
  sensorStates: {
    gps: true,
    accelerometer: true,
    gyroscope: true,
    magnetometer: true,
    barometer: false,
    pedometer: false,
    light: false,
  },
};

let db: SQLite.SQLiteDatabase | null = null;

export async function initializeDatabase(): Promise<void> {
  if (!db) {
    db = SQLite.openDatabaseSync(DB_NAME);
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
      )
    `);
  }
}

export async function getSettings(): Promise<Settings> {
  if (!db) await initializeDatabase();
  
  const result = await db!.getFirstAsync<{ value: string }>(
    'SELECT value FROM settings WHERE key = ?',
    ['sensorStates']
  );
  
  if (result) {
    const storedSettings = JSON.parse(result.value);
    return {
      sensorStates: { ...defaultSettings.sensorStates, ...storedSettings },
    };
  } else {
    return defaultSettings;
  }
}

export async function saveSettings(settings: Settings): Promise<void> {
  if (!db) await initializeDatabase();
  
  await db!.runAsync(
    'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
    ['sensorStates', JSON.stringify(settings.sensorStates)]
  );
}