
import { OnnxPlugin } from '../src/plugins/onnx-plugin';
import { JWKInterface } from 'arweave/node/lib/wallet';
import {Contract, LoggerFactory, WarpFactory} from "warp-contracts";
import { readJSON, readMyModelDataFile } from '../helpers/helpers';

(async () => {
  let jwk: JWKInterface = readJSON('./.secrets/arweave-testnet-key-with-tokens.json');

  LoggerFactory.INST.logLevel('debug');
  const warp = WarpFactory.forLocal().use(new OnnxPlugin());
  // const w = await warp.arweave.wallets.generate()
  const addr = await warp.arweave.wallets.jwkToAddress(jwk)
  const balance = await warp.arweave.wallets.getBalance(addr);
  console.log(warp.arweave.ar.winstonToAr(balance));
  if (+balance <= 0) {
    const tokens = warp.arweave.ar.arToWinston('100')
    // mint some tokens
    await warp.arweave.api.get(`mint/${addr}/${tokens}`)
    await warp.arweave.api.get('mine');
  
    const newBalance = await warp.arweave.wallets.getBalance(addr);
    console.log(warp.arweave.ar.winstonToAr(newBalance));
    console.log(addr);
    console.log('done');
  }
})()