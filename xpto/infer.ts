import { InferenceSession, Tensor} from 'onnxruntime-node';
import { BertTokenizer } from 'bert-tokenizer';
import { softmax } from '../scripts/helpers';

// use an async context to call onnxruntime functions.
const main = async () => {
  const sentence = "{\"question\": \"Where is Bob Dylan From?\", \"context\": \"Bob Dylan is from Duluth, Minnesota and is an American singer-songwriter\"}";

  try {

    // create a new session and load the specific model.
    //
    // the model in this example contains a single MatMul node
    // it has 2 inputs: 'a'(float32, 3x4) and 'b'(float32, 4x3)
    // it has 1 output: 'c'(float32, 3x3)
    const session = await InferenceSession.create(process.cwd() + '/onnx/bert-large-uncased-whole-word-masking-finetuned-squad.onnx');

    const vocabUrl = 'node_modules/bert-tokenizer/assets/vocab.json';
    // prepare inputs. a tensor need its corresponding TypedArray as data
    const bertTokenizer = new BertTokenizer(vocabUrl);
    const tokens = bertTokenizer.tokenize(sentence);
    const { inputIds, segmentIds, inputMask } = bertTokenizer.convertSingleExample(sentence);
    let ids = inputIds.map(x => BigInt(x))
    let mask = inputMask.map(x => BigInt(x))
    let tids = segmentIds.map(x => BigInt(x))

    // Convert inputs to tensors    
    let tensorIds = new Tensor('int64', BigInt64Array.from(ids), [1, ids.length]);
    let tensorMask = new Tensor('int64', BigInt64Array.from(mask), [1, mask.length]);
    let tensorTids = new Tensor('int64', BigInt64Array.from(tids), [1, tids.length]);
    let inputs = { input_ids: tensorIds, input_mask: tensorMask, segment_ids: tensorTids};
    const { start_logits: startLogits, end_logits: endLogits } = await session.run(inputs);
    let startMax = 0, endMax = 0;
    startLogits.data.map(el => startMax = (el > startMax) ? el : startMax);
    endLogits.data.map(el => endMax = (el > endMax) ? el : endMax);
    const startIndex = (startLogits.data as any[]).indexOf(startMax) -1;
    const endIndex = (endLogits.data as any[]).indexOf(endMax) - 1;
    // read from results
    const prediction = tokens.filter((_, index) => index >= startIndex && index < (startIndex + (endIndex + 1 - startIndex)));
    console.log(bertTokenizer.convertIdsToTokens(prediction));
  } catch (e) {
    console.log(`failed to inference ONNX model: ${e}.`);
  }
}

(async () => {
  await main();
})();