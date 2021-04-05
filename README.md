# CSE573-SP21-Project
A repo for our project in explainable sentimental analysis

# UI usage
## How to run the UI
  1. To view the UI, go to folder `frontend` and start a local server and render the file `explainableSentimentAnalysis.html`. You can use http.server of python to start your own local server (e.g. `python -m http.server 1008`).
  2. The final prediction and all the intermediate outputs of the neural networks on all the data points are pre-computed and stored locally as static files. Per different queries those files are retrived. Due to the size of the files we are not able to include them in this github repo, so you will need to download two files (preds_test_rest.zip)[https://drive.google.com/file/d/1Y4yhjeHo3Hm_qmOMTLC6jUg3jTyl23hp/view?usp=sharing] and (preds_test_laptop.zip)[https://drive.google.com/file/d/1bkTh7Cd5vxpozOf4WBE-njo_r_23GH8R/view?usp=sharing] from google drive and unzip them and place them under directory `frontend` so they can be read properly.
  3. Upon initializing the page you'll see an empty interface like this:

      A image here

  Don't freak out, you're at the right place just that you need to select the dataset and model to see some interesting visualizations. So hit the buttons on top to select dataset and model. After that you'll be ready to start your journey.
## The user interface
### 1. Assembled Embedding (AE) view
Two-dimensional representations of 768-dimensional BERT-generated vectors. The 2-d dots are then aggregated locally into multiple cells to reduce visual clutter and provide overview. The AE view also gives us a general picture of the data distribution without demanding much cognition.
#### 1.1 Cell Design
The size of each cell in AE view is proportional to the number of dots within the cell. The color of the cell reflects the distribution of different categories in the cell. (e.g. A cell of pure color means all the dots in the locality the cell represents are of the same class)
#### 1.2 Click a cell to see local detail
To reveal points in a locality, the user clicks the corresponding cell of that locality. Multiple views that present different insights of the selected locality are updated meanwhile.
####
  3. ****
  4. **Explore the sentence where a target word comes from** When you hover on a datapoint in the local UMAP view, 
