import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

export function writeToJsonFile(filePath, data, pretty = true) {
  try {
    const jsonData = pretty 
      ? JSON.stringify(data, null, 2)
      : JSON.stringify(data);

    // create directory if it doesn't exist
    mkdirSync(dirname(filePath), { recursive: true });

    writeFileSync(filePath, jsonData, 'utf8');
    console.log(`Data successfully written to ${filePath}`);
  } catch (err) {
    console.error(`Error writing file ${filePath}:`, err);
  }
}