import torch
from transformers import BertForQuestionAnswering

# Load tokenizer and PyTorch weights form the Hub
model_name = "bert-large-uncased-whole-word-masking-finetuned-squad"
model = BertForQuestionAnswering.from_pretrained(model_name)
model.eval()
output_names=['start_logits', "end_logits"]
inputs = {
    # list of numerical ids for the tokenized text
    'input_ids':   torch.randint(32, [1, 32], dtype=torch.long), 
    # dummy list of ones
    'attention_mask': torch.ones([1, 32], dtype=torch.long),     
    # dummy list of ones
    'token_type_ids':  torch.ones([1, 32], dtype=torch.long)     
}

symbolic_names = {0: 'batch_size', 1: 'max_seq_len'}
torch.onnx.export(model,                                         
# model being run
    (inputs['input_ids'],
    inputs['attention_mask'], 
    inputs['token_type_ids']),                    # model input (or a tuple for multiple inputs)
    './onnx/'+model_name+'.onnx',                                    # where to save the model (can be a file or file-like object)
    opset_version=11,                              # the ONNX version to export the model to
    do_constant_folding=True,                      # whether to execute constant folding for optimization
    input_names=['input_ids',
                'input_mask', 
                'segment_ids'],                   # the model's input names
    output_names=['start_logits', "end_logits"],   # the model's output names
    dynamic_axes={'input_ids': symbolic_names,
                'input_mask' : symbolic_names,
                'segment_ids' : symbolic_names,
                'start_logits' : symbolic_names, 
                'end_logits': symbolic_names})   # variable length axes/dynamic input
#after save run in terminal:
#
# python -m transformers.onnx --model=local-pt-checkpoint onnx/
#
#using optimum ----
#high-level
""" from optimum.onnxruntime import ORTModelForSequenceClassification
from transformers.onnx import export
from pathlib import Path

model = ORTModelForSequenceClassification.from_pretrained("distilbert-base-uncased-finetuned-sst-2-english", from_transformers=True)
path = Path('model.onnx')
 """

# mid level
""" from pathlib import Path
import transformers
from transformers.onnx import FeaturesManager
from transformers import AutoConfig, AutoTokenizer, AutoModelForSequenceClassification

# load model and tokenizer
model_id = "distilbert-base-uncased-finetuned-sst-2-english"
feature = "sequence-classification"
model = AutoModelForSequenceClassification.from_pretrained(model_id)
tokenizer = AutoTokenizer.from_pretrained(model_id)

# load config
model_kind, model_onnx_config = FeaturesManager.check_supported_model_or_raise(model, feature=feature)
onnx_config = model_onnx_config(model.config)

# export
onnx_inputs, onnx_outputs = transformers.onnx.export(
        preprocessor=tokenizer,
        model=model,
        config=onnx_config,
        opset=13,
        output=Path("trfs-model.onnx")
) """

#low-level
""" import torch
from transformers import AutoModelForSequenceClassification, AutoTokenizer

# load model and tokenizer
model_id = "distilbert-base-uncased-finetuned-sst-2-english"
model = AutoModelForSequenceClassification.from_pretrained(model_id)
tokenizer = AutoTokenizer.from_pretrained(model_id)
dummy_model_input = tokenizer("This is a sample", return_tensors="pt")

# export
torch.onnx.export(
    model, 
    tuple(dummy_model_input.values()),
    f="torch-model.onnx",  
    input_names=['input_ids', 'attention_mask'], 
    output_names=['logits'], 
    dynamic_axes={'input_ids': {0: 'batch_size', 1: 'sequence'}, 
                  'attention_mask': {0: 'batch_size', 1: 'sequence'}, 
                  'logits': {0: 'batch_size', 1: 'sequence'}}, 
    do_constant_folding=True, 
    opset_version=13, 
) """