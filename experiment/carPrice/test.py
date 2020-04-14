import sys
import pandas as pd
num = sys.argv[1]
response = sys.argv[2]
data = pd.read_csv("car.data")
print(data)