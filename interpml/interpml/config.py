from pathlib import Path
import numpy as np


root = Path(__file__).parent.parent.parent
figs = root / 'figs'
notebooks = root / 'notebooks'
data = root / 'data'
architectures_file = data / 'all_architectures.csv'

weights = np.array([5., 1, 5., 1.])
n_components = 8
n_init = 3

bayes_opt_params = dict(sigma=1,
                        kernel='rbf',
                        acquisition_fn='ei',
                        xi=1e-3,
                        kappa=1,
                        nu=1.5,
                        length_scale=5,
                        n_restarts=10)
