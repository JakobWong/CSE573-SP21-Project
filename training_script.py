import numpy as np
from flair.embeddings import TransformerWordEmbeddings
from flair.data import Sentence
from tensorflow import keras
from tensorflow.keras import layers
import tensorflow as tf
from keras.models import Sequential
from keras.layers import Activation,Dense, Flatten, BatchNormalization, Conv2D, MaxPool2D
from keras.optimizers import Adam
from keras.metrics import categorical_crossentropy
from keras.metrics import categorical_accuracy
from sklearn.preprocessing import MinMaxScaler
import sklearn

#Conditioning Flags
conditioning=True

sentenceTest=True

#Model Type parameter {'MLP','CNN','LIN'}
modelType='CNN'

#Dataset Type Parameter {'rest','laptop'}
dataType='laptop'

#Temporary Sample Training Set
samples=['the amd turin processor is better than intel','I love intel but hate amd','it is hard to say whether amd is better than intel']
labels=[[0,1,1,1,0,0,0,3],[0,0,1,0,0,3],[0,0,0,0,0,0,2,0,0,0,2]]
numSamples=len(samples)

#Temporary Sample Testing Set
testSamples=['nobody likes the new intel processor','I find the new amd processor to be marginally good','The intel processor beats amd hard']
testLabels=[[0,0,0,0,3,3,],[0,0,0,0,2,2,0,0,0,0],[0,1,1,0,3,0]]

#Generate BERT representations
bert_embedder = TransformerWordEmbeddings('bert-base-multilingual-cased')

#Obtain Bert Embeddings
def getBertEmbeddings(samples):
    bertEmbeddings=[]
    for s in samples:
        sentence=Sentence(s)
        bert_embedder.embed(sentence)
        for sent in sentence:
            embeddingList=[]
            for val in sent.embedding:
                embeddingList.append(float(val))
            embeddingList=np.array(embeddingList)
            #Condition Embeddings
            if conditioning:
                if modelType == 'CNN':
                    scaler = MinMaxScaler(feature_range=(0,255))
                    embeddingList=scaler.fit_transform(embeddingList.reshape(-1,1))
                    embeddingList=embeddingList.transpose()[0]
                    for i in range(len(embeddingList)):
                        embeddingList[i]=int(round(embeddingList[i]))
                else:
                    scaler = MinMaxScaler(feature_range=(0,1))
                    embeddingList=scaler.fit_transform(embeddingList.reshape(-1,1))
                    embeddingList=embeddingList.transpose()[0]
            if modelType=='CNN':
                embeddingMatrix=[]
                for i in range(24):
                    row=[]
                    for j in range(32):
                        row.append(embeddingList[i*24+j])
                    embeddingMatrix.append(row)
                bertEmbeddings.append(embeddingMatrix) 
            else:
                bertEmbeddings.append(embeddingList)
    bertEmbeddings=np.array(bertEmbeddings)
    if modelType=='CNN':
        bertEmbeddings=bertEmbeddings.reshape(list(bertEmbeddings.shape)+[1])
    return bertEmbeddings

bertEmbeddings=getBertEmbeddings(samples)
#print(bertEmbeddings)
#print(bertEmbeddings.shape)

bertEmbeddingsTest=getBertEmbeddings(testSamples)
#print(bertEmbeddingsTest)
#print(bertEmbeddingsTest.shape)

#Label Preprocessing
trainingLabels=[]
for i in range(numSamples):
    trainingLabels+=labels[i]
trainingLabels=np.array(trainingLabels)

testingLabels=[]
for i in range(len(testSamples)):
    testingLabels+=testLabels[i]

#Shuffle Training Samples
bertEmbeddings,trainingLabels=sklearn.utils.shuffle(bertEmbeddings,trainingLabels)

#Configure GPU
#physical_devices=tf.config.experimental.list_physical_devices('GPU')
#print("Num GPUs Available: ",len(physical_devices))
#tf.config.experimental.set_memory_growth(physical_devices[0],True)

#Model Creation and Training
def evaluator(roundedPredictions):
    #Produce Accuracy (Polarity Identification) and F1 score (aspect identification)
    correct=0
    TP,FP,FN,TN=0,0,0,0
    for i in range(len(roundedPredictions)):
        if roundedPredictions[i]==testingLabels[i]:
            correct+=1
        if roundedPredictions[i] in [1,2,3] and testingLabels[i] in [1,2,3]:
            TP+=1
        elif roundedPredictions[i] in [1,2,3] and testingLabels[i]==0:
            FP+=1
        elif roundedPredictions[i]==0 and testingLabels[i] in [1,2,3]:
            FN+=1
        elif roundedPredictions[i]==0 and testingLabels[i] ==0:
            TN+=1    
    print('Testing Accuracy: '+str(correct/len(roundedPredictions)))
    print('Testing F1 Score: '+str(TP/(TP+0.5*(FP+FN))))

if modelType=='LIN':
    #Build Linear Model
    model = Sequential()
    #The following hyperparameters will be determined experimentally
    batchSize=15
    model.add(Dense(4, input_shape=(768,), activation='softmax'))
    model.summary()
    model.compile(loss='sparse_categorical_crossentropy', optimizer=Adam(learning_rate=0.0001), 
                  metrics=['accuracy'])
    model.fit(x=bertEmbeddings,y=trainingLabels, validation_split=0.1,epochs=30, batch_size=batchSize,verbose=2)
    #Test Model
    predictions=model.predict(x=bertEmbeddingsTest,batch_size=batchSize,verbose=0)
    roundedPredictions=np.argmax(predictions,axis=-1)
    evaluator(roundedPredictions)
    
elif modelType=='MLP':
    #Build MLP Model
    model = Sequential()
    #The following hyperparameters will be determined experimentally
    nonLinearity='relu'
    batchSize=15
    model.add(Dense(16, input_shape=(768,), activation=nonLinearity))
    model.add(Dense(12, activation=nonLinearity))
    #4 classes on output, softmax for probability distribution over classes
    model.add(Dense(4, activation='softmax'))
    model.summary()
    model.compile(loss='sparse_categorical_crossentropy', optimizer=Adam(learning_rate=0.0001), 
                  metrics=['accuracy'])
    model.fit(x=bertEmbeddings,y=trainingLabels, validation_split=0.1,epochs=30, batch_size=batchSize,verbose=2)
    #Test Model
    predictions=model.predict(x=bertEmbeddingsTest,batch_size=batchSize,verbose=0)
    roundedPredictions=np.argmax(predictions,axis=-1)
    evaluator(roundedPredictions)
           
elif modelType=='CNN':
    #Build CNN model
    nonLinearity='relu'
    model = Sequential([Conv2D(filters=32,kernel_size=(3,3),activation=nonLinearity,padding='same',input_shape=(24,32,1)),
                        MaxPool2D(pool_size=(2,2),strides=2),Conv2D(filters=64,kernel_size=(3,3),activation=nonLinearity,padding='same'),
                        MaxPool2D(pool_size=(2,2),strides=2),Flatten(),Dense(4,activation='softmax')])
    model.summary()
    model.compile(optimizer=Adam(learning_rate=0.0001),loss='sparse_categorical_crossentropy',metrics=['accuracy'])
    model.fit(x=bertEmbeddings,y=trainingLabels, validation_split=0.1,epochs=30, batch_size=batchSize,verbose=2)
    #Test Model
    predictions=model.predict(x=bertEmbeddingsTest,batch_size=batchSize,verbose=0)
    roundedPredictions=np.argmax(predictions,axis=-1)
    evaluator(roundedPredictions)
    
#Save Model
model.save('model_'+modelType+'_'+dataType+'.h5')

#Test Model on Specific Sentence
if sentenceTest:
    sentence="The amd turin processor seems to perform better than intel"
    print(sentence)
    singleBertEmbedding=getBertEmbeddings([sentence])
    #print(singleBertEmbedding.shape)
    predictions=model.predict(x=singleBertEmbedding)
    roundedPredictions=np.argmax(predictions,axis=-1)
    print('Predicted Label:')
    print(roundedPredictions)