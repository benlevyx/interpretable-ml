import numpy as np
import scipy.stats as spstats
import scipy.optimize as spopt
from sklearn.gaussian_process import GaussianProcessRegressor
from sklearn.gaussian_process.kernels import RBF, Matern, ConstantKernel

from .acquisition_functions import ExpectedImprovement, LowerConfidenceBound, UpperConfidenceBound


def propose_next(acquisition_fn, X_samp, Y_samp, gpr, bounds=None, n_restarts=10):
    """Propose the next sample point by optimizing `acquisition_fn`.
    """
    d = X_samp.shape[1]
    min_val = 1.
    X_min = None

    def min_obj(X):
        return -acquisition_fn(X.reshape(-1, d), X_samp, Y_samp, gpr)

    for x0 in np.random.uniform(bounds[:, 0], bounds[:, 1], size=(n_restarts, d)):
        x0 = x0.reshape(1, d)
        res = spopt.minimize(min_obj, x0=x0, bounds=bounds, method='L-BFGS-B')
        if res.fun < min_val:
            min_val = res.fun[0]
            X_min = res.x

    return X_min.reshape(-1, 1)


class BayesianOptimizer():
    """Class for performing Bayesian optimization using a gaussian process as
    a proxy function.
    """
    def __init__(self, sigma=1., kernel='rbf', nu=1.5,
                 acquisition_fn='expected_improvement', length_scale=1.,
                 n_restarts=10, xi=1e-2, kappa=.1):
        self.sigma = sigma
        self.length_scale = length_scale
        self.nu = nu
        self.n_restarts = n_restarts
        self.xi = xi
        self.kappa = kappa

        if type(kernel) == str:
            kernel = self._get_kernel(kernel)

        self.gpr = GaussianProcessRegressor(kernel=kernel, alpha=self.sigma ** 2)
        self.X_obs = None
        self.y_obs = None

        if type(acquisition_fn) == str:
            self.acquisition_fn = self._get_acquisition_fn(acquisition_fn)

    def _get_kernel(self, kernel):
        if kernel == 'rbf':
            return RBF(length_scale=self.length_scale)
        elif kernel == 'matern':
            return Matern(length_scale=self.length_scale, nu=self.nu)
        elif kernel == 'constant':
            return ConstantKernel()
        else:
            raise ValueError(f"No kernel matching '{kernel}'")

    def _get_acquisition_fn(self, acquisition_fn):
        if acquisition_fn in ('expected_improvement', 'ei'):
            return ExpectedImprovement(self.gpr, self.xi)
        elif acquisition_fn == 'lcb':
            return LowerConfidenceBound(self.gpr, self.kappa)
        elif acquisition_fn == 'ucb':
            return UpperConfidenceBound(self.gpr, self.kappa)
        else:
            raise ValueError(f"No acquisition function matching '{acquisition_fn}'")

    def fit(self, X: np.ndarray, y: np.ndarray):
        """Fit the GPR on new data.
        """
        self.X_obs = X
        self.y_obs = y
        self._fit_gpr()
        return self

    def _fit_gpr(self):
        self.gpr.fit(self.X_obs, self.y_obs)

    def update(self, X: np.ndarray, y: np.ndarray):
        X = self._reshape2d(X)
        y = self._reshape1d(y)

        if self.X_obs is not None:
            self.X_obs = np.vstack((self.X_obs, X))
        else:
            self.X_obs = X
        if self.y_obs is not None:
            self.y_obs = np.vstack((self.y_obs, y))
        else:
            self.y_obs = y

        self._fit_gpr()

    def propose_next(self, X: np.ndarray):
        """Propose the next point given the data observed and the acquisition
        function.

        Arguments:
            X {np.ndarray} -- Candidate points to sample from (n_obs x dim_x)

        Returns:
            ('idx_next', 'X_next')
        """
        scores = self.acquisition_fn(X, self.X_obs, self.y_obs)
        idx_next = np.argmax(scores)
        score_next = scores[idx_next]
        return idx_next, X[idx_next], score_next

    def _reshape2d(self, arr):
        if arr.ndim == 1:
            return arr.reshape(1, -1)
        else:
            return arr

    def _reshape1d(self, arr):
        if type(arr) != np.ndarray:
            arr = np.array(arr)
        arr = arr.ravel()
        return arr
