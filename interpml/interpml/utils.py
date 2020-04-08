import numpy as np
from tqdm import tqdm


def compute_distances(info_archs, distance_func=None, args=None):
    distances = np.zeros((len(info_archs), len(info_archs)))
    with tqdm(total=len(info_archs) ** 2) as pbar:
        for i in range(len(info_archs)):
            for j in range(len(info_archs)):
                distances[i, j] = info_archs[i].distance(info_archs[j], distance_func=distance_func, args=args)
                pbar.update()
    return distances
