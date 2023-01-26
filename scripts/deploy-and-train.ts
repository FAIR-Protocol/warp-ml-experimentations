import fs from 'fs';
import path from 'path';
import {Contract, LoggerFactory, WarpFactory} from "warp-contracts";
import { JWKInterface } from 'arweave/node/lib/wallet';
import { OnnxPlugin } from '../src/plugins/onnx-plugin';


let jwk: JWKInterface = readJSON('./.secrets/arweave-testnet-key-with-tokens.json');
var contractTxId;

LoggerFactory.INST.logLevel('debug');
const warp = WarpFactory.forTestnet().use(new OnnxPlugin());

async function deploy() {

  const contractSrc = fs.readFileSync(
    path.join(__dirname, '../dist/contract.js'), 'utf8'
  );

  const initialState = {
    data: []
  };

  console.log('Deployment started');
  console.log(contractSrc);
  const deployment = await warp.createContract.deploy({
    wallet: jwk,
    initState: JSON.stringify(initialState),
    src: contractSrc,
  });
  contractTxId = deployment.contractTxId;
  console.log('Deployment of NLP completed: ' + contractTxId);
  fs.writeFileSync('./tmp/tmp-nlp-tx-id.txt', contractTxId);
}

async function load() {
  
  try {   

    const contract = warp.contract<any>(contractTxId).connect(jwk);

    await contract.setEvaluationOptions({ allowBigInt: true });
    await contract.writeInteraction<any>({
      function: "load"
    });

    const {cachedValue} = await contract.readState();

    console.log("State: ");
    console.log(JSON.stringify(cachedValue, null, "  "));


  } catch (e) {
    console.log(e);

  }

}

async function addDataAndTrain() {
  
  try {   

    const contract = warp.contract<any>(contractTxId).connect(jwk);

    await addData(contract, "document",'goodbye for now', 'greetings.bye');
    await addData(contract, "document", 'bye bye take care', 'greetings.bye');
    await addData(contract, "document", 'okay see you later', 'greetings.bye');
    await addData(contract, "document", 'bye for now', 'greetings.bye');
    await addData(contract, "document", 'i must go', 'greetings.bye');
    await addData(contract, "document", 'hello', 'greetings.hello');
    await addData(contract, "document", 'hi', 'greetings.hello');
    await addData(contract, "document", 'howdy', 'greetings.hello');

    await addData(contract, "answer", 'Till next time', 'greetings.bye');
    await addData(contract, "answer", 'see you soon!', 'greetings.bye');
    await addData(contract, "answer", 'Hey there!', 'greetings.hello');
    await addData(contract, "answer", 'Greetings!', 'greetings.hello');

    await contract.writeInteraction<any>({
      function: "train"
    });

    const {cachedValue} = await contract.readState();

    console.log("State: ");
    console.log(JSON.stringify(cachedValue, null, "  "));


  } catch (e) {
    console.log(e);

  }

}

(async function main() {
  await deploy();
  // await load().catch((e) => console.error(e));
})();

async function addData(contract: Contract<any>, type:any, content:any, category:any) {
  await contract.writeInteraction<any>({
    function: "addData",
    dataItem: {
      type: type,
      lang: "en",
      content: content,
      category: category
    }
  });
}

export function readJSON(path: string): JWKInterface {
  const content = fs.readFileSync(path, "utf-8");
  try {
    return JSON.parse(content);
  } catch (e) {
    throw new Error(`File "${path}" does not contain a valid JSON`);
  }
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}