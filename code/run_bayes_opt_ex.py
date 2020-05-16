#!/Library/Frameworks/Python.framework/Versions/3.7/bin/python3

import subprocess
import json
from interpml import info_architecture as ia
from interpml import config

def run_bayes_opt(obs=None):
    args = ['./', str(config.code / 'run_bayes_opt.py')]
    if obs is not None:
        args.extend(['-i', obs])
    p = subprocess.Popen(args, stdin=subprocess.PIPE, stdout=subprocess.PIPE)
    output, err = p.communicate()
    return output

# Random initialization
output = run_bayes_opt()
ias_init = json.loads(output)

# Fake data
test_data = [.1, .8, .9]
obs = {
    "meta": {
        "height": 10,
        "width": 12,
        "n_architectures": 1,
        "n_components": 8
    },
    "architectures": ias_init['architectures'],
    "scores": test_data
}
obs_str = json.dumps(obs)

# Get the next architecture
output = json.loads(run_bayes_opt(obs_str))
print(output)
