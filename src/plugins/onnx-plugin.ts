import { WarpPlugin, WarpPluginType } from 'warp-contracts';
import * as onnx from 'onnxruntime-node';
import { BertTokenizer } from 'bert-tokenizer';

export class OnnxPlugin implements WarpPlugin<any, void> {
  private vocabUrl = 'node_modules/bert-tokenizer/assets/vocab.json';
  process(input: any): void {
    input.onnx = onnx;
    input.bertTokenizer = new BertTokenizer(this.vocabUrl);
  }

  type(): WarpPluginType {
    return 'smartweave-extension';
  }
}