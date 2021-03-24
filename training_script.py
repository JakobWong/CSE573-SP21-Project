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
from tensorflow.python.keras.layers.kernelized import RandomFourierFeatures
from data_preprocessing import *
from datetime import datetime

#Conditioning Flags
conditioning=True

#Other Parameters
sentenceTest=True
trainingSize=1000
testingSize=500
bertFineTune=True
largeAttention=True
now = str(datetime.now())

#Model Type parameter {'MLP','CNN','LIN'}
modelType='LIN'

#Dataset Type Parameter {'rest','laptop'}
dataType='rest'

#Temporary Sample Training Set
#samples=['the amd turin processor is better than intel','I love intel but hate amd','it is hard to say whether amd is better than intel']
#labels=[[0,1,1,1,0,0,0,3],[0,0,1,0,0,3],[0,0,0,0,0,0,2,0,0,0,2]]
#samples=['the amd turin processor: is better than intel']
#labels=[[0,1,1,1,0,0,0,3]]

#Temporary Sample Testing Set
#testSamples=['nobody likes the new intel processor','I find the new amd processor to be marginally good','The intel processor beats amd hard']
#testLabels=[[0,0,0,0,3,3,],[0,0,0,0,2,2,0,0,0,0],[0,1,1,0,3,0]]

if dataType=='laptop':
    trainReader=Reader("data/laptop14/train.txt",trainingSize)
    testReader=Reader("data/laptop14/test.txt",testingSize)
    samples=trainReader.getSamples()
    labels=trainReader.getLabels()
    testSamples=testReader.getSamples()
    testLabels=testReader.getLabels()
    assert len(samples)==len(labels)
    assert len(testSamples)==len(testLabels)
    
elif dataType=='rest':
    trainReader=Reader("data/rest16/train.txt",trainingSize)
    testReader=Reader("data/rest16/test.txt",testingSize)
    samples=trainReader.getSamples()
    labels=trainReader.getLabels()
    testSamples=testReader.getSamples()
    testLabels=testReader.getLabels()
    assert len(samples)==len(labels)
    assert len(testSamples)==len(testLabels)
  

#Generate BERT representations
bert_embedder = TransformerWordEmbeddings('bert-base-multilingual-cased',fine_tune=bertFineTune,allow_long_sentences=largeAttention)

#Obtain Bert Embeddings
def getBertEmbeddings(samples,labels):
    toRemove=[]
    bertEmbeddings=[]
    for s in range(len(samples)):
        sentence=Sentence(samples[s])
        bert_embedder.embed(sentence)
        newLabelCount=0
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
            newLabelCount+=1
        #Remove Incompatible Data
        if newLabelCount!=len(labels[s]):
            print('error')
            print(samples[s])
            print(len(labels[s]))
            print(newLabelCount)
            toRemove.append(s)
            for i in range(newLabelCount):
                bertEmbeddings.pop()
    bertEmbeddings=np.array(bertEmbeddings)
    if modelType=='CNN':
        bertEmbeddings=bertEmbeddings.reshape(list(bertEmbeddings.shape)+[1])
    return bertEmbeddings, toRemove

bertEmbeddings,remove=getBertEmbeddings(samples,labels)

#print(bertEmbeddings)
#print(bertEmbeddings.shape)

#Prepare results file
file=open('model_evaluations/evaluation_model_'+modelType+'_'+dataType+'_'+now+'.txt','a')

for r in sorted(remove, reverse=True):
   del labels[r]

print('Removed '+str(len(remove))+' from training set')
file.write('Training on '+str(trainingSize-len(remove))+' samples')
file.write('\n')

bertEmbeddingsTest,remove=getBertEmbeddings(testSamples,testLabels)
for r in sorted(remove, reverse=True):
   del testLabels[r]
print('Removed '+str(len(remove))+' from testing set')
#print(bertEmbeddingsTest)
#print(bertEmbeddingsTest.shape)

file.write('Testing on '+str(testingSize-len(remove))+' samples')
file.write('\n')

#print('length')
#print(len(bertEmbeddings))

#Label Preprocessing
trainingLabels=[]
for i in range(len(labels)):
    trainingLabels+=labels[i]
trainingLabels=np.array(trainingLabels)

testingLabels=[]
for i in range(len(testLabels)):
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
    if TP==0:
        TP=0.000001
    if FP==0:
        FP=0.000001
    print('Testing Flat Accuracy: '+str(correct/len(roundedPredictions)))
    file.write('Testing Flat Accuracy: '+str(correct/len(roundedPredictions)))
    file.write('\n')
    print('Testing Balanced Accuracy: '+str((TP+TN)/(TP+FP+TN+FN)))
    file.write('Testing Balanced Accuracy: '+str((TP+TN)/(TP+FP+TN+FN)))
    file.write('\n')
    print('Testing Precision: '+str(TP/(TP+FP)))
    file.write('Testing Precision: '+str(TP/(TP+FP)))
    file.write('\n')
    print('Testing Recall: '+str(TP/(TP+FN)))
    file.write('Testing Recall: '+str(TP/(TP+FN)))
    file.write('\n')
    print('Testing F1 Score: '+str(TP/(TP+0.5*(FP+FN))))
    file.write('Testing F1 Score: '+str(TP/(TP+0.5*(FP+FN))))
    file.write('\n')
    
if modelType=='LIN':
    #Build Linear Model
    model = Sequential()
    #The following hyperparameters will be determined experimentally
    batchSize=20
    model.add(Dense(4, input_shape=(768,), activation='softmax'))
    model.summary()
    model.compile(loss='sparse_categorical_crossentropy', optimizer=Adam(learning_rate=0.0001), 
                  metrics=['accuracy'])
    
    #Use Random Fourier Features to Approximate SVM 
    #model = keras.Sequential(
    #[
    #    keras.Input(shape=(768,)),
    #    RandomFourierFeatures(
    #        output_dim=4096, scale=10.0, kernel_initializer="gaussian"
    #    ),
    #    layers.Dense(units=4),
    #]
    #)
    #model.compile(
    #    optimizer=keras.optimizers.Adam(learning_rate=1e-3),
    #    loss=keras.losses.hinge,
    #    metrics=[keras.metrics.CategoricalAccuracy(name="acc")],
    #)
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
    batchSize=20
    model.add(Dense(400, input_shape=(768,), activation=nonLinearity))
    model.add(Dense(24, activation=nonLinearity))
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
    batchSize=20
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
model.save('models/model_'+modelType+'_'+dataType+'_'+now+'.h5')
file.close()

#Test Model on Specific Sentence
if sentenceTest:
    sentence=["The amd turin processor seems to perform better than intel"]
    label=[[0,1,1,1,0,0,0,0,0,3]]
    print(sentence)
    singleBertEmbedding,q=getBertEmbeddings(sentence,label)
    #print(singleBertEmbedding.shape)
    predictions=model.predict(x=singleBertEmbedding)
    roundedPredictions=np.argmax(predictions,axis=-1)
    print('Predicted Label:')
    print(roundedPredictions)
    
    