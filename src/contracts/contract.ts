import { similarity, softmax } from "../../scripts/helpers";

export async function handle(state, action) {
  const input = action.input;
  const caller = action.caller;

  if (input.function === 'process') {
    /* const bertTokenizer = SmartWeave.extensions.bertTokenizer;
    const onnx = SmartWeave.extensions.onnx;

    const InferenceSession = onnx.InferenceSession;
    const session = await InferenceSession.create(process.cwd() + './onnx/model.onnx');

    const { inputIds, segmentIds, inputMask } = bertTokenizer.convertSingleExample(input.firstWord);
    let ids = inputIds.map(x => BigInt(x))
    let mask = inputMask.map(x => BigInt(x))
    let tids = segmentIds.map(x => BigInt(x))

    // Convert inputs to tensors    
    let tensorIds = new SmartWeave.extensions.onnx.Tensor('int64', BigInt64Array.from(ids), [1, ids.length]);
    let tensorMask = new SmartWeave.extensions.onnx.Tensor('int64', BigInt64Array.from(mask), [1, mask.length]);
    let tensorTids = new SmartWeave.extensions.onnx.Tensor('int64', BigInt64Array.from(tids), [1, tids.length]);
    let inputs = { input_ids: tensorIds, attention_mask: tensorMask, token_type_ids: tensorTids};
    
    const v1 = await session.run(inputs); */

    /* const { inputIds: secondInputIds, segmentIds: secondSegmentIds, inputMask: secondInputMask } = bertTokenizer.convertSingleExample(input.firstWord);
    let secondIds = secondInputIds.map(x => BigInt(x))
    let secondMask = secondSegmentIds.map(x => BigInt(x))
    let secondTids = secondInputMask.map(x => BigInt(x))

    // Convert inputs to tensors    
    let secondTensorIds = new SmartWeave.extensions.onnx.Tensor('int64', BigInt64Array.from(secondIds), [1, secondIds.length]);
    let secondTensorMask = new SmartWeave.extensions.onnx.Tensor('int64', BigInt64Array.from(secondMask), [1, secondMask.length]);
    let secondTensorTids = new SmartWeave.extensions.onnx.Tensor('int64', BigInt64Array.from(secondTids), [1, secondTids.length]);
    let secondInputs = { input_ids: secondTensorIds, attention_mask: secondTensorMask, token_type_ids: secondTensorTids};
    const v2 = await session.run(secondInputs);
    const word1Result = v1.last_hidden_state.data;
    const word2Result = v2.last_hidden_state.data; */

    // state.result = result;
    // tate.prediction
    // const prediction = bertTokenizer.convertIdsToTokens(result.last_hidden_state.data);
    // const newVar = 'new Var';
    let max = 0;
    /* const result = v1.last_hidden_state.data.map(el => {
      if (el > max) max = el;
      return el;
    }); */
    /* const processed = softmax(v1.last_hidden_state.data)
    processed.map(el => el > max ? max = el : el);
    const idxs = processed.reduce((r, v, i) => r.concat(v === max ? i : []), []);
    const result: any = {
      data: processed,
      max,
      idxs,
      toToken: bertTokenizer.convertIdsToTokens(idxs),
      toToken2: bertTokenizer.convertIdsToTokens(idxs.map(el => el+999)),
    };
    result.best = Math.max(result.data); */
    // state.result = result;
   /*  result.best_match = result.findIndex(el => el === max);
    result.bestmatchId = bertTokenizer.convertIdsToTokens([result.best_match]); */
    return { state, /* prediction , */ };
  };

  if (input.function === 'qna') {
    const sentence = input.sentence;
    const bertTokenizer = SmartWeave.extensions.bertTokenizer;
    const onnx = SmartWeave.extensions.onnx;
    // create a new session and load the specific model.
    //
    // the model in this example contains a single MatMul node
    // it has 2 inputs: 'a'(float32, 3x4) and 'b'(float32, 4x3)
    // it has 1 output: 'c'(float32, 3x3)
    const session = await onnx.InferenceSession.create(process.cwd() + '/bert-large-uncased-whole-word-masking-finetuned-squad.onnx');

    // prepare inputs. a tensor need its corresponding TypedArray as data
    const tokens = bertTokenizer.tokenize(sentence);
    const { inputIds, segmentIds, inputMask } = bertTokenizer.convertSingleExample(sentence);
    let ids = inputIds.map(x => BigInt(x))
    let mask = inputMask.map(x => BigInt(x))
    let tids = segmentIds.map(x => BigInt(x))

    // Convert inputs to tensors    
    let tensorIds = new SmartWeave.extensions.onnx.Tensor('int64', BigInt64Array.from(ids), [1, ids.length]);
    let tensorMask = new SmartWeave.extensions.onnx.Tensor('int64', BigInt64Array.from(mask), [1, mask.length]);
    let tensorTids = new SmartWeave.extensions.onnx.Tensor('int64', BigInt64Array.from(tids), [1, tids.length]);
    let inputs = { input_ids: tensorIds, input_mask: tensorMask, segment_ids: tensorTids};
    const { start_logits: startLogits, end_logits: endLogits } = await session.run(inputs);
    let startMax = 0, endMax = 0;
    startLogits.data.map(el => startMax = (el > startMax) ? el : startMax);
    endLogits.data.map(el => endMax = (el > endMax) ? el : endMax);
    const startIndex = (startLogits.data as any[]).indexOf(startMax) -1;
    const endIndex = (endLogits.data as any[]).indexOf(endMax) - 1;
    // read from results
    const prediction = tokens.filter((_, index) => index >= startIndex && index < (startIndex + (endIndex + 1 - startIndex)));
    // const predictionStr = prediction.join('').replaceAll('_', '');
    const result = {
      tokens: bertTokenizer.convertIdsToTokens(prediction),
      str: bertTokenizer.convertIdsToTokens(prediction).join(' ').replaceAll('▁', '')
    }
    return { result };
  }

  throw new ContractError(`No function supplied or function not recognised: "${input.function}"`);
}
