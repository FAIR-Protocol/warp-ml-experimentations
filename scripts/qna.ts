import fs from 'fs';
import path from 'path';
import {Contract, InteractionResult, LoggerFactory, WarpFactory, WriteInteractionResponse} from "warp-contracts";
import { JWKInterface } from 'arweave/node/lib/wallet';
import { OnnxPlugin } from '../src/plugins/onnx-plugin';

LoggerFactory.INST.logLevel('error');

async function qna() {
  
  try {   
    const contractTxId = fs.readFileSync('./tmp/tmp-nlp-tx-id.txt').toString();
    let jwk: JWKInterface = readJSON('./.secrets/arweave-testnet-key-with-tokens.json');

    const warp = WarpFactory.forTestnet().use(new OnnxPlugin());
    const contract = warp.contract<any>(contractTxId).connect(jwk);    

    await contract.setEvaluationOptions({  allowBigInt: true });
    let response: InteractionResult<any, any> /* WriteInteractionResponse */ = await contract.viewState<any>({
      function: "qna",
      sentence: "{\"question\": \"Where is Bob Dylan From?\", \"context\": \"Bob Dylan is from Duluth, Minnesota and is an American singer-songwriter\"}"
    });
    console.log(response);
    // console.log(response.result.last_hidden_state.data, 'inference');

  } catch (e) {
    console.log(e);
  }

}

(async function main() {
  await qna().catch((e) => console.error(e));
})();

export function readJSON(path: string): JWKInterface {
    const content = fs.readFileSync(path, "utf-8");
    try {
      return JSON.parse(content);
    } catch (e) {
      throw new Error(`File "${path}" does not contain a valid JSON`);
    }
}
  

