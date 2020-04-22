import numpy as np
import scipy.stats as spstats


class BaseAcquisitionFunction:
    def __init__(self, gpr, eps=1e-6):
        self.gpr = gpr
        self.eps = eps

    def _get_mu_sigma(self, X, X_samp, Y_samp):
        mu, sigma = self.gpr.predict(X, return_std=True)
        mu_samp, sigma_samp = self.gpr.predict(X_samp, return_std=True)

        mu = mu.reshape(-1, 1)
        sigma = sigma.reshape(-1, 1)
        mu_samp = mu_samp.reshape(-1, 1)
        sigma_samp = sigma_samp.reshape(-1, 1)

        return mu, sigma, mu_samp, sigma_samp


class ExpectedImprovement(BaseAcquisitionFunction):
    """Compute expected improvement for query points `X`

    Based on http://krasserm.github.io/2018/03/21/bayesian-optimization/
    """
    def __init__(self, gpr, xi=1e-2, **kwargs):
        self.xi = xi
        super().__init__(gpr, **kwargs)

    def __call__(self, X, X_samp, Y_samp):
        mu, sigma, mu_samp, sigma_samp = self._get_mu_sigma(X, X_samp, Y_samp)
        mu_samp_opt = np.max(mu_samp)

        imp = mu - mu_samp_opt - self.xi
        Z = imp / sigma
        ei = imp * spstats.norm.cdf(Z) + sigma * spstats.norm.pdf(Z)
        ei[sigma == 0.] = 0.

        return ei


class ConfidenceBound(BaseAcquisitionFunction):
    def __init__(self, gpr, kappa=.1, **kwargs):
        self.kappa = kappa
        super().__init__(gpr, **kwargs)

    def _confidence_bound(self, X, X_samp, Y_samp, i):
        mu, sigma, mu_samp, sigma_samp = self._get_mu_sigma(X, X_samp, Y_samp)
        lcb = mu_samp + i * self.kappa * sigma_samp
        return lcb


class LowerConfidenceBound(ConfidenceBound):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def __call__(self, X, X_samp, Y_samp):
        return self._confidence_bound(X, X_samp, Y_samp, -1)


class UpperConfidenceBound(ConfidenceBound):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def __call__(self, X, X_samp, Y_samp):
        return self._confidence_bound(X, X_samp, Y_samp, 1)
