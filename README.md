# CSE573-SP21-Project
A repo for our project in explainable sentimental analysis

# UI usage
1. To view the UI, go to folder `frontend` and start a local server and render the file `explainableSentimentAnalysis.html`. You can use http.server of python to start your own local server (e.g. `python -m http.server 1008`).
2. The final prediction and all the intermediate outputs of the neural networks on all the data points are pre-computed and stored locally as static files. Per different queries those files are retrived. Due to the size of the files we are not able to include them in this github repo, so you will need to download two files (preds_test_rest.zip)[https://drive.google.com/file/d/1Y4yhjeHo3Hm_qmOMTLC6jUg3jTyl23hp/view?usp=sharing] and (preds_test_laptop.zip)[https://drive.google.com/file/d/1bkTh7Cd5vxpozOf4WBE-njo_r_23GH8R/view?usp=sharing] from google drive and unzip them and place them under directory `frontend` so they can be read properly.
3. Upon initializing the page you'll see an empty interface like this:

A image here

Don't freak out, you're at the right place just that you need to select the dataset and model to see some interesting visualizations. So hit the buttons on top to select dataset and model. After that you'll be ready to start your journey.
