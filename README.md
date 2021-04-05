# CSE573-SP21-Project
A repo for our project in explainable sentimental analysis

# UI usage
## How to run the UI
  1. To view the UI, go to folder `frontend` and start a local server and render the file `explainableSentimentAnalysis.html`. You can use http.server of python to start your own local server (e.g. `python -m http.server 1008`).
  2. The final prediction and all the intermediate outputs of the neural networks on all the data points are pre-computed and stored locally as static files. Per different queries those files are retrived. Due to the size of the files we are not able to include them in this github repo, so you will need to download two files (preds_test_rest.zip)[https://drive.google.com/file/d/1Y4yhjeHo3Hm_qmOMTLC6jUg3jTyl23hp/view?usp=sharing] and (preds_test_laptop.zip)[https://drive.google.com/file/d/1bkTh7Cd5vxpozOf4WBE-njo_r_23GH8R/view?usp=sharing] from google drive and unzip them and place them under directory `frontend` so they can be read properly.
  3. Upon initializing the page you'll see an empty interface like this:

      A image here

  Don't freak out, you're at the right place just that you need to select the dataset and model to see some interesting visualizations. So hit the buttons on top to select dataset and model. After that you'll be ready to start your journey.
## Interactions
  1. **Click a cell in the assembled embedding to reveal data points in locality** The dataset consists of six thousands 768-dimensional vectors, which are represented in 2-d scatter plots using dimensionality reduction tehcnique UMAP. Due to the scale of the dataset, it will become very cluttered if every single data point is presented in the plot. So instead of showing everything at one time, we opt to show an aggregated overview of the scatter plot where data points near to each other are aggregated into one cell and the cells instead of the datapoints are displayed. The Assembled embedding view also gives us a general picture of the data distribution without demanding much cognition.
  2. **Click a datapoint in local UMAP view to see how it flows through the neural architecture** Each circle in the local scatter plot represents a word, orginally as a 768-d verctor embedded by BERT. The 768-d vector is processed by a neural network (linear MLP, non-linear MLP or CNN in our setting) and returned as a 4-d vectors indicating the predicted class. Upon a click of a circle, the process of its corresponding bert vector going through the network will be rendered and users can easily see what is hidden in the activation process. For example, when a neural network is not making a confident decision, activation values of the four output nodes are evenly spread. But when a neural network is confident about its prediction, activation values condense at one node.
