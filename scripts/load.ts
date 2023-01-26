import fs from 'fs';
import path from 'path';
import {Contract, InteractionResult, LoggerFactory, WarpFactory, WriteInteractionResponse} from "warp-contracts";
import { JWKInterface } from 'arweave/node/lib/wallet';
import { TensorFlowPlugin } from '../src/plugins/tensorflow-plugin';
import { OnnxPlugin } from '../src/plugins/onnx-plugin';

LoggerFactory.INST.logLevel('error');

async function loadModel() {
  
  try {   
    const contractTxId = fs.readFileSync('./tmp/tmp-nlp-tx-id.txt').toString();
    let jwk: JWKInterface = readJSON('./.secrets/arweave-testnet-key-with-tokens.json');

    const warp = WarpFactory.forTestnet().use(new OnnxPlugin());
    const contract = warp.contract<any>(contractTxId).connect(jwk);    

    await contract.setEvaluationOptions({  allowBigInt: true });
    let response: WriteInteractionResponse = await contract.writeInteraction<any>({
      function: "load",
    });
    console.log(response);
    const state = await contract.readState();
    console.log(state);
  } catch (e) {
    console.log(e);
  }

}

(async function main() {
  await loadModel().catch((e) => console.error(e));
})();

export function readJSON(path: string): JWKInterface {
    const content = fs.readFileSync(path, "utf-8");
    try {
      return JSON.parse(content);
    } catch (e) {
      throw new Error(`File "${path}" does not contain a valid JSON`);
    }
}
  

