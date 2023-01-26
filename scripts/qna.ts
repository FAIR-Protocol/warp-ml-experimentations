import fs from 'fs';
import {Contract, InteractionResult, LoggerFactory, WarpFactory, WriteInteractionResponse} from "warp-contracts";
import { JWKInterface } from 'arweave/node/lib/wallet';
import { OnnxPlugin } from '../src/plugins/onnx-plugin';
import { readJSON, readMyModelDataFile } from '../helpers/helpers';

LoggerFactory.INST.logLevel('error');

async function qna() {
  
  try {   
    const contractTxId = fs.readFileSync('./tmp/tmp-onnx-tx-id.txt').toString();
    let jwk: JWKInterface = readJSON('./.secrets/arweave-testnet-key-with-tokens.json');

    const warp = WarpFactory.forLocal().use(new OnnxPlugin());
    const contract = warp.contract<any>(contractTxId).connect(jwk);    
    const path = process.cwd() + '/bert-large-uncased-whole-word-masking-finetuned-squad.onnx';
    await contract.setEvaluationOptions({  allowBigInt: true });
    let response: /* InteractionResult<any, any> */ WriteInteractionResponse | null = await contract.writeInteraction<any>({
      function: "qna",
      path,
      sentence: "{\"question\": \"Where is Bob Dylan From?\", \"context\": \"Bob Dylan is from Duluth, Minnesota and is an American singer-songwriter\"}"
    });
    console.log(response);
    // console.log(response.result.last_hidden_state.data, 'inference');
    const state = await contract.readState();
    console.log(state);
    console.log(state.cachedValue.state.result);
  } catch (e) {
    console.log(e);
  }

}

(async function main() {
  await qna().catch((e) => console.error(e));
})();
