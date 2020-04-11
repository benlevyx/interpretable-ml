import sys
import pandas as pd
num = sys.argv[1]
response = sys.argv[2]
print("current question: " + num)
print("user response: " + response)
data = pd.read_csv("car.data")
print(data)