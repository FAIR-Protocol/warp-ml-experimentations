// process.env['PYTHON_BIN'] = 'C:/Users/lsilvestre/anaconda3/envs/rgsys/Scripts';
import { python, py, PyClass } from 'pythonia';


export const main = async (input: string) => {
  const torch = await python('torch');
  const { BloomForCausalLM, BloomTokenizerFast } = await python('transformers');

  const model = await BloomForCausalLM.from_pretrained('bigscience/bloom-560m');
  const tokenizer = await BloomTokenizerFast.from_pretrained('bigscience/bloom-560m');

  const inputs = await tokenizer(input, 'pt')
  const res = await model.generate(inputs['input_ids'], 50);
  const result = await tokenizer.decode(res[0]);
  console.log(result);
  (python as any).exit();
};

(async () => {
  await main('Hello, How are you?');
})();