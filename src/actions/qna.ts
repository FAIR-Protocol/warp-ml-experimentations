declare const SmartWeave: any;

export const qna = async (input: any,) => {
  const sentence = input.sentence;
  const bertTokenizer = SmartWeave.extensions.bertTokenizer;
  const onnx = SmartWeave.extensions.onnx;
  // create a new session and load the specific model.
  //
  // the model in this example contains a single MatMul node
  // it has 2 inputs: 'a'(float32, 3x4) and 'b'(float32, 4x3)
  // it has 1 output: 'c'(float32, 3x3)
  const session = await onnx.InferenceSession.create(process.cwd() + '/onnx/bert-large-uncased-whole-word-masking-finetuned-squad.onnx');

  // prepare inputs. a tensor need its corresponding TypedArray as data
  const tokens = bertTokenizer.tokenize(sentence);
  const { inputIds, segmentIds, inputMask } = bertTokenizer.convertSingleExample(sentence);
  let ids = inputIds.map((x: number) => BigInt(x))
  let mask = inputMask.map((x: number) => BigInt(x))
  let tids = segmentIds.map((x: number) => BigInt(x))

  // Convert inputs to tensors    
  let tensorIds = new SmartWeave.extensions.onnx.Tensor('int64', BigInt64Array.from(ids), [1, ids.length]);
  let tensorMask = new SmartWeave.extensions.onnx.Tensor('int64', BigInt64Array.from(mask), [1, mask.length]);
  let tensorTids = new SmartWeave.extensions.onnx.Tensor('int64', BigInt64Array.from(tids), [1, tids.length]);
  let inputs = { input_ids: tensorIds, input_mask: tensorMask, segment_ids: tensorTids};
  const { start_logits: startLogits, end_logits: endLogits } = await session.run(inputs);
  let startMax = 0, endMax = 0;
  startLogits.data.map((el: number) => startMax = (el > startMax) ? el : startMax);
  endLogits.data.map((el: number) => endMax = (el > endMax) ? el : endMax);
  const startIndex = (startLogits.data as any[]).indexOf(startMax) -1;
  const endIndex = (endLogits.data as any[]).indexOf(endMax) - 1;
  // read from results
  const prediction = tokens.filter((_: any, index: number) => index >= startIndex && index < (startIndex + (endIndex + 1 - startIndex)));
  // const predictionStr = prediction.join('').replaceAll('_', '');
  const result = {
    tokens: bertTokenizer.convertIdsToTokens(prediction),
    str: bertTokenizer.convertIdsToTokens(prediction).join(' ').replaceAll('▁', '')
  }

  return result;
}