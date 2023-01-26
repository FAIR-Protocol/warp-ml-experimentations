import { WarpPlugin, WarpPluginType } from 'warp-contracts';
import { python } from 'pythonia';

export class PythoniaPlugin implements WarpPlugin<any, void> {
  process(input: any): void {
    input.python = python;
  }

  type(): WarpPluginType {
    return 'smartweave-extension-pythonia';
  }
}