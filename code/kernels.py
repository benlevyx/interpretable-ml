from typing import Union

import numpy as np
from sklearn.gaussian_process.kernels import  Hyperparameter, StationaryKernelMixin, NormalizedKernelMixin, Kernel

from info_architecture import InfoArchTree


class RBF:
    """Compute the covariance between `ia1` and `ia2` using an RBF kernel.
    """
    def __init__(self, length_scale=1.0, length_scale_bounds=(1e-5, 1e5), distance_matrix=None):
        self.length_scale = length_scale
        self.length_scale_bounds = length_scale_bounds
        self.distance_matrix = distance_matrix

    @property
    def anisotropic(self):
        return np.iterable(self.length_scale) and len(self.length_scale) > 1

    @property
    def hyperparameter_length_scale(self):
        if self.anisotropic:
            return Hyperparameter("length_scale", "numeric",
                                  self.length_scale_bounds,
                                  len(self.length_scale))
        return Hyperparameter(
            "length_scale", "numeric", self.length_scale_bounds)

    def __call__(self, X: Union[InfoArchTree, list], Y: Union[InfoArchTree, list]):
        """Evaluate k(X, Y)
        """
        if type(X) == InfoArchTree:
            X = [X]
        if type(Y) == InfoArchTree:
            Y = [Y]

        dist = np.zeros((len(X), len(Y)))
        for i in range(len(X)):
            for j in range(len(Y)):
                if self.distance_matrix is not None:
                    dist[i, j] = self._lookup_dist(X[i], Y[j])
                else:
                    dist[i, j] = X[i].distance(Y[j]) ** 2
        return np.exp(-.5 / (self.length_scale ** 2) * dist)

    def _lookup_dist(self, X: InfoArchTree, Y: InfoArchTree) -> Union[int, float]:
        """Get the distance between `X` and `Y`.
        """
        return self.distance_matrix[X.id, Y.id]
