import fs from 'fs';
import path from 'path';
import {Contract, InteractionResult, LoggerFactory, WarpFactory, WriteInteractionResponse} from "warp-contracts";
import { JWKInterface } from 'arweave/node/lib/wallet';
import { TensorFlowPlugin } from '../src/plugins/tensorflow-plugin';

LoggerFactory.INST.logLevel('error');

async function trainModel() {
  
  try {   
    const contractTxId = fs.readFileSync('./tmp/tmp-bert-tx-id.txt').toString();
    let jwk: JWKInterface = readJSON('./.secrets/jwk.json');

    const warp = WarpFactory.forTestnet().use(new TensorFlowPlugin());
    const contract = warp.contract<any>(contractTxId).connect(jwk);    

    await contract.setEvaluationOptions({  allowBigInt: true });
    let response: WriteInteractionResponse = await contract.writeInteraction<any>({
      function: "train",
    });
    console.log(response);
    const state = await contract.readState();
    console.log(state);
  } catch (e) {
    console.log(e);
  }

}

(async function main() {
  await trainModel().catch((e) => console.error(e));
})();

export function readJSON(path: string): JWKInterface {
    const content = fs.readFileSync(path, "utf-8");
    try {
      return JSON.parse(content);
    } catch (e) {
      throw new Error(`File "${path}" does not contain a valid JSON`);
    }
}
  

