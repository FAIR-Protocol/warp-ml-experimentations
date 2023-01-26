import fs from 'fs';
import {Contract, InteractionResult, LoggerFactory, WarpFactory, WriteInteractionResponse} from "warp-contracts";
import { JWKInterface } from 'arweave/node/lib/wallet';
import { OnnxPlugin } from '../src/plugins/onnx-plugin';
import { readJSON, readMyModelDataFile } from '../helpers/helpers';

LoggerFactory.INST.logLevel('error');

async function test() {
  
  try {   
    const contractTxId = fs.readFileSync('./tmp/tmp-onnx-tx-id.txt').toString();
    let jwk: JWKInterface = readJSON('./.secrets/arweave-testnet-key-with-tokens.json');

    const warp = WarpFactory.forLocal().use(new OnnxPlugin());
    const contract = warp.contract<any>(contractTxId).connect(jwk);    

    await contract.setEvaluationOptions({  allowBigInt: true });
    let response: /* InteractionResult<any, any> */ WriteInteractionResponse | null = await contract.writeInteraction<any>({
      function: "test",
      message: `message works: ${new Date().getTime()}`,
    });
    console.log(response);
    // console.log(response.result.last_hidden_state.data, 'inference');
    const state = await contract.readState()
    console.log(state);
  } catch (e) {
    console.log(e);
  }

}

(async function main() {
  await test().catch((e) => console.error(e));
})();