#!/usr/bin/env python
# coding: utf-8

# In[6]:


def data_reader(filename,limit_number):
    samples=[]
    labels=[]
    with open(filename) as f:
        content = f.readlines()
    content = [x.strip() for x in content]
    for i in range(limit_number):
        sample_label=content[i].split("#")
        samples.append(sample_label[0])
        label= sample_label[4].split(" ")
        vector_label=[]
        for i in range(len(label)):
            if '=O' in label[i]:
                vector_label.append(0)
            elif '=T-POS' in label[i]:
                vector_label.append(1)
            elif '=T-NEU' in label[i]:
                vector_label.append(2)
            elif '=T-NEG' in label[i]:
                vector_label.append(3)
        labels.append(vector_label)
    return [samples,labels]


# In[7]:


a=data_reader("rest16/train.txt",10)


# In[8]:


print(len(a[0]),len(a[1]))


# In[9]:


print(a[0])


# In[10]:


print(a[1])


# In[ ]:




