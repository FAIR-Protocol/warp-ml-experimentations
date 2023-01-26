const {BertTokenizer} = require('bert-tokenizer');

const text = "i like strawberries";
const tokenIds = [ 1045, 2066, 13137, 20968 ];
const vocabUrl = 'node_modules/bert-tokenizer/assets/vocab.json'

const bertTokenizer = new BertTokenizer(vocabUrl, true);
console.log(bertTokenizer.tokenize(text));
//[ 1045, 2066, 13137, 20968 ]
console.log(bertTokenizer.convertIdsToTokens(tokenIds));
//[ '▁i', '▁like', '▁straw', 'berries' ]
console.log(bertTokenizer.convertSingleExample(text));
//[ '[CLS]', '▁i', '▁like', '▁straw', 'berries', '[SEP]' ]