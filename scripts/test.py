import transformers
from transformers import BertTokenizer, BertLMHeadModel
import torch
from torch.nn import functional as F
tokenizer = BertTokenizer.from_pretrained('distilbert-base-uncased')
model = BertLMHeadModel.from_pretrained('distilbert-base-uncased', return_dict=True, is_decoder = True)
text = "I am happy, "
input = tokenizer.encode_plus(text, return_tensors = "pt")
output = model(**input).logits[:, -1, :]
softmax = F.softmax(output, -1)
index = torch.argmax(softmax, dim = -1)
x = tokenizer.decode(index)
print(x)