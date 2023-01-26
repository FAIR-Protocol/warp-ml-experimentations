import fs from 'fs';
import path from 'path';
import {Contract, LoggerFactory, WarpFactory} from "warp-contracts";
import { JWKInterface } from 'arweave/node/lib/wallet';
import { OnnxPlugin } from '../src/plugins/onnx-plugin';
import { PythoniaPlugin } from '../src/plugins/pythonia-plugin';
import Bundlr from '@bundlr-network/client';
import { readJSON, readMyModelDataFile } from '../helpers/helpers';

let jwk: JWKInterface = readJSON('./.secrets/arweave-testnet-key-with-tokens.json');
let contractTxId = '';

LoggerFactory.INST.logLevel('debug');
const warp = WarpFactory.forLocal().use(new OnnxPlugin()).use(new PythoniaPlugin());

const deploy = async () => {

  const contractSrc = fs.readFileSync(
    path.join(__dirname, '../dist/contract.js'), 'utf8'
  );

  const initialState = {
    data: []
  };

  const address = await warp.arweave.wallets.jwkToAddress(jwk);
  const balance = await warp.arweave.wallets.getBalance(address);
  console.log(`Wallet Address: ${address}`);
  console.log(`Wallet Balance: ${balance}`);
  /* const bundlr = new Bundlr("http://local.bundlr.network", "arweave", jwk, { providerUrl: 'http://localhost:1984'}); */
  // Get loaded balance in atomic units
  /* let atomicBalance = await bundlr.getLoadedBalance();
  console.log(`node balance (atomic units) = ${atomicBalance}`);

  // Convert balance to an easier to read format
  let convertedBalance = bundlr.utils.unitConverter(atomicBalance);
  console.log(`node balance (converted) = ${convertedBalance}`); */
  const modelBuffer = await readMyModelDataFile(process.cwd() + '/bert-large-uncased-whole-word-masking-finetuned-squad.onnx');
  const tx = await warp.arweave.createTransaction({
    data: modelBuffer,
  });
  await warp.arweave.transactions.sign(tx, jwk);
  const uploader = await warp.arweave.transactions.getUploader(tx);

  while(!uploader.isComplete) {
    await uploader.uploadChunk();
    console.log(`${uploader.pctComplete}% complete, ${uploader.uploadedChunks}/${uploader.totalChunks}`);
  }
  console.log('upload done', tx.id);
  // console.log(contractSrc);
 /*  const deployment = await warp.createContract.deploy({
    wallet: jwk,
    initState: JSON.stringify(initialState),
    src: contractSrc,
  });
  contractTxId = deployment.contractTxId;
  console.log('Deployment of onnx completed: ' + contractTxId);
  fs.writeFileSync('./tmp/tmp-onnx-tx-id.txt', contractTxId); */
}


(async () => {
  await deploy();
})();
