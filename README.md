# CSE573-SP21-Project
A repo for our project in explainable sentimental analysis

## Datasets Processing
  1. For this project, we will use the most popular ABSA bechmark datasets, which are restaurant reviews from SemEval 2014(rest14), 2015(rest15), 2016(rest16). The laptop reviews, which are from SemEval 2014(laptop14), will also be used to help training the different models, all data files are in the `data` folder. For the ABSA label vocabulary categories, the possible values of the tag are B-{POS, NEG, NEU}, I-{POS, NEG, NEU}, E-{POS, NEG, NEU}, T-{POS, NEG, NEU}, S-{POS, NEG, NEU}, O-{POS, NEG, NEU}. The tagging schemes are BIEOS, IOB, OT, and inside-outside-beginning tagging. The file under`data` folder called `data preprocessing.ipynb` provides a reader machine which can split the sampeles and labels, furthermore, we assign the ABSA vocabulary categories new labels, 0 means no aspect, 1 means postive, 2 means neutral, 3 means negative.


# UI usage
## How to run the UI
  1. To view the UI, go to folder `frontend` and start a local server and render the file `explainableSentimentAnalysis.html`. You can use http.server of python to start your own local server (e.g. `python -m http.server 1008`).
  2. The final prediction and all the intermediate outputs of the neural networks on all the data points are pre-computed and stored locally as static files. Per different queries those files are retrived. Due to the size of the files we are not able to include them in this github repo, so you will need to download two files [preds_test_rest.zip](https://drive.google.com/file/d/1Y4yhjeHo3Hm_qmOMTLC6jUg3jTyl23hp/view?usp=sharing) and [preds_test_laptop.zip](https://drive.google.com/file/d/1bkTh7Cd5vxpozOf4WBE-njo_r_23GH8R/view?usp=sharing) from google drive (files are only accessible for asu account) and unzip them and place them under directory `frontend` so they can be read properly.
  3. Upon initializing the page you'll see an empty interface like this:
  ![interface](interface.png)

  Don't freak out, you're at the right place just that you need to select the dataset and model to see some interesting visualizations. So hit the buttons on top to select dataset and model. After that you'll be ready to start your journey.
## The user interface
The design philosophy: Neural networks are trained on dataset. Hence, a well-rounded explaination of a neural network needs to includes explaination of the dataset. A perculiar behavior of an NN is usually due to a peculiar subset of the dataset or a peculiar distribution of data points. In this work We pay a lion share of attention to augment users' ability to relate NN behaviors with dataset to attain a holistc, contextualized explaination.

### 1. Assembled Embedding (AE) view
Two-dimensional representations of 768-dimensional BERT-generated vectors. The 2-d dots are then aggregated locally into multiple cells to reduce visual clutter and provide overview. The AE view also gives us a general picture of the data distribution without demanding much cognition.
#### 1.1 Cell Design
The size of each cell in AE view is proportional to the number of dots within the cell. The color of the cell reflects the distribution of different categories in the cell. (e.g. A cell of pure color means all the dots in the locality the cell represents are of the same class)
#### 1.2 Click a cell to see local detail
To reveal points in a locality, the user clicks the corresponding cell of that locality. Multiple views that present different insights of the selected locality are updated meanwhile.
#### 1.3 Hover to show data distribution
The user can hover on a cell to see the distribution of different classes in the cell
#### 1.4 Zoom and Pan
Scrolling the mouse on the AE view to zoom in and out. Drag on the view for panning.
### 2. Local UMAP Embedding View
A scatter plot displaying dots in the selected locality is updated when the user selects a cell in AE view. Dots representing words are colored by their labels. The UMAP technique encodes high-dimensional data in a way that keeps proximity, meaning dots near to each other in the high-dimensional space are kept near to each other in the UMAP embedding.
#### 2.1 Hover to see the word
Hover on a datapoint and the word the datapoint represents will pop up in a tooltip.
#### 2.2 Click to see how the datapoint flows through the neural network
Click a datapoint and the neural network view will be updated. Highly activated neurons are marked by dark color whereas mildly activated neurons are marked by light color. The color of the neurons relates the color of the data point so as to keep visual consistency.
### 3. Local Word List
To support users inspecting datapoints at localities from multiple perspective, we also display the distribution of words of the locality of interest in a customized scrollable vertical barchart. Words appearing in the locality are grouped up in different rows, each occurence of a word has a corresponding rectangle laid in its row. Rectangles are colored identically the way the dots are colored.
### 4. Local Diveriging Barchart
We use a diverging barchart to showcase the performance of the selected neural arachitecture on the selected locality. Each class has a bar correspondent, the portion of correctly classified samples in a class is represented by the above-x-axis part of a bar. The misclassified portion is represented by the below-x-axis part of a bar.

  4. **Explore the sentence where a target word comes from** When you hover on a datapoint in the local UMAP view, 
