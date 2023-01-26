import { WarpPlugin, WarpPluginType } from 'warp-contracts';
// import * as tf from '@tensorflow/tfjs';

export class TensorFlowPlugin implements WarpPlugin<any, void> {
  process(input: any): void {
    // input.tf = tf;
  }

  type(): WarpPluginType {
    return 'smartweave-extension';
  }
}