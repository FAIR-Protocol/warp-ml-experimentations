import fs from 'fs';
import util from 'util';
import { JWKInterface } from 'arweave/node/lib/wallet';

export const readMyModelDataFile = async (filepathOrUri) => {
  // read model file content (Node.js) as Buffer (Uint8Array)
  return await util.promisify(fs.readFile)(filepathOrUri);
}

export const readJSON = (path: string): JWKInterface => {
  const content = fs.readFileSync(path, "utf-8");
  try {
    return JSON.parse(content);
  } catch (e) {
    throw new Error(`File "${path}" does not contain a valid JSON`);
  }
}