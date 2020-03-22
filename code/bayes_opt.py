import numpy as np
import scipy.stats as spstats
import scipy.optimize as spopt
from sklearn.gaussian_process import GaussianProcessRegressor
from sklearn.gaussian_process.kernels import RBF, Matern, ConstantKernel


def expected_improvement(X, X_samp, Y_samp, gpr, xi=1e-2, eps=1e-6):
    """Compute expected improvement for query points `X`

    Based on http://krasserm.github.io/2018/03/21/bayesian-optimization/
    """
    mu, sigma = gpr.predict(X, return_std=True)
    mu_samp = gpr.predict(X_samp)
    sigma = sigma.reshape(-1, 1) + eps
    mu_samp_opt = np.max(mu_samp)

    imp = mu - mu_samp_opt - xi
    Z = imp / sigma
    ei = imp * spstats.norm.cdf(Z) + sigma * spstats.norm.pdf(Z)
    ei[sigma == 0.] = 0.

    return ei


def propose_next(acquisition_fn, X_samp, Y_samp, gpr, bounds, n_restarts=10):
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
