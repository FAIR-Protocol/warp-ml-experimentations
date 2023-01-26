# Imports
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from transformers import TFBertModel
from transformers import BertTokenizerFast
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split

def create_model(max_len, classifier_layer=True):
    # Load tiny BERT model
    encoder = TFBertModel.from_pretrained(
        "google/bert_uncased_L-2_H-128_A-2", from_pt=True)

    # Setup input layer
    input_ids = layers.Input(
        shape=(max_len,), dtype=tf.int32, name="input_ids")
    token_type_ids = layers.Input(
        shape=(max_len,), dtype=tf.int32, name="token_type_ids")
    attention_mask = layers.Input(
        shape=(max_len,), dtype=tf.int32, name="attention_mask")
    bert = encoder(
        input_ids, token_type_ids=token_type_ids, attention_mask=attention_mask
    )[0]

    # Make sure BERT weights stay the same during training
    bert.trainable = False

    # For python training we add a classification layer
    if classifier_layer:
        bert = layers.Dense(1, activation="sigmoid")(bert)

    # For TFJS we just add a layer to flatten the output
    else:
        bert = layers.Flatten()(bert)

    # Put model together
    model = keras.Model(
        inputs=[input_ids, token_type_ids, attention_mask],
        outputs=[bert],
    )
    loss = keras.losses.BinaryCrossentropy(from_logits=False)
    optimizer = keras.optimizers.Adam(lr=0.0001)
    model.compile(optimizer=optimizer, loss=[loss], metrics=["accuracy"])

    return model


# Model takes 128 tokens as input
MAX_LEN = 128

# Save model for TFJS
model_to_save = create_model(MAX_LEN, False)
model_to_save.save("./model")