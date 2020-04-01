import numpy as np
from numpy.linalg import inv, cholesky, cho_solve


class GaussianProcess:
    def __init__(self, kernel, sigma):
        self.kernel = kernel
        self.sigma = sigma

    def posterior_predictive(self, X_s, X_train, Y_train):
        '''
        Computes the suffifient statistics of the GP posterior predictive
        distribution from m training data X_train and Y_train and n new
        inputs X_s.

        Args:
            X_s: New input locations (n x d).
            X_train: Training locations (m x d).
            Y_train: Training targets (m x 1).
            l: Kernel length parameter.
            sigma_f: Kernel vertical variation parameter.
            sigma_y: Noise parameter.

        Returns:
            Posterior mean vector (n x d) and covariance matrix (n x n).
        '''
        K = self.kernel(X_train, X_train) + self.sigma ** 2 * np.eye(len(X_train))
        K_s = self.kernel(X_train, X_s)
        K_ss = self.kernel(X_s, X_s) + 1e-8 * np.eye(len(X_s))
        K_inv = inv(K)

        # Equation (4)
        mu_s = K_s.T.dot(K_inv).dot(Y_train)

        # Equation (5)
        cov_s = K_ss - K_s.T.dot(K_inv).dot(K_s)

        return mu_s, cov_s