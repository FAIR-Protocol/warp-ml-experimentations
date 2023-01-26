const Arweave = require('arweave');
import fs from 'fs';

const arweave = Arweave.init({
  host: 'localhost',
  port: '1984',
  protocol: 'http'
});

(async () => {
  const w = await arweave.wallets.generate()
  const addr = await arweave.wallets.jwkToAddress(w)
  const tokens = arweave.ar.arToWinston(100)
  // mint some tokens
  await arweave.api.get(`mint/${addr}/${tokens}`)
  await arweave.api.get('mine');

  fs.writeFileSync('./secrets/jwk.json', JSON.stringify(w));
  console.log(addr);
  console.log('done');
})()