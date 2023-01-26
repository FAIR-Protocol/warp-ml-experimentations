import fs from 'fs';
import {Contract, InteractionResult, LoggerFactory, WarpFactory, WriteInteractionResponse} from "warp-contracts";
import { JWKInterface } from 'arweave/node/lib/wallet';
import { OnnxPlugin } from '../src/plugins/onnx-plugin';
import * as onnx from 'onnxruntime-node';
import { readJSON, readMyModelDataFile } from '../helpers/helpers';

LoggerFactory.INST.logLevel('error');

async function setup() {
  
  try {   
    const contractTxId = fs.readFileSync('./tmp/tmp-onnx-tx-id.txt').toString();
    let jwk: JWKInterface = readJSON('./.secrets/arweave-testnet-key-with-tokens.json');

    const warp = WarpFactory.forLocal().use(new OnnxPlugin());
    const contract = warp.contract<any>(contractTxId).connect(jwk);    

    const path = process.cwd() + '/bert-large-uncased-whole-word-masking-finetuned-squad.onnx';
    const modelBuffer = await readMyModelDataFile(process.cwd() + '/bert-large-uncased-whole-word-masking-finetuned-squad.onnx');
    await contract.setEvaluationOptions({  allowBigInt: true });

    let response: WriteInteractionResponse | null = await contract.writeInteraction<any>({
      function: "setup",
      path
    });
    console.log(response);
    console.log(await contract.readState());
  } catch (e) {
    console.log(e);
  }

}

(async function main() {
  await setup().catch((e) => console.error(e));
})();