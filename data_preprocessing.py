#File Reader and Formatter
class Reader:
    def __init__(self,filename,limit_number):
        self.samples=[]
        self.labels=[]
        with open(filename) as f:
            content = f.readlines()
        content = [x.strip() for x in content]
        for i in range(limit_number):
            sample_label=content[i].split("#")
            #Data Cleaning
            s=sample_label[0]
            s=s.replace('(','')
            s=s.replace('+','')
            s=s.replace(')','')
            s=s.replace('\"','')
            s=s.replace('-','')
            s=s.replace('*','')
            s=s.replace('  ',' ')
            s=s.replace(' \'',' ')
            s=s.replace('cannot','can not')
            if '...' in s:
                if s[len(s)-1]=='.':  
                    s=s.replace('...','')
                    s=s.replace('....','')
                    s=s.replace('..','')
                    s=s+'.'
                else:
                    s=s.replace('...','')
                    s=s.replace('....','')
                    s=s.replace('..','')
            self.samples.append(s)
            label= sample_label[4].split(" ")
            vector_label=[]
            for i in range(len(label)):
                #flag=False
                #for p in ['(',')']:
                #    if p in label[i]:
                #        flag=True
               # if flag:
                #    continue
                if '=O' in label[i]:
                    vector_label.append(0)
                elif '=T-POS' in label[i]:
                    vector_label.append(1)
                elif '=T-NEU' in label[i]:
                    vector_label.append(2)
                elif '=T-NEG' in label[i]:
                    vector_label.append(3)
            self.labels.append(vector_label)

    def getSamples(self):
        return self.samples
    
    def getLabels(self):
        return self.labels

#Testing Code
a=Reader("data/rest16/train.txt",10)
print(len(a.getSamples()),len(a.getLabels()))
print(a.getSamples())
print(a.getLabels())
