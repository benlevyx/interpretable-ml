"""
run_bayes_opt.py

Run this file from the command line to execute the BayesOpt procedure

Syntax:
    `run_bayes_opt.py <obs>`

Arguments:
    <obs> -- The observed data thus far in the form of a JSON string. Use the following format:
             {
                "meta": {
                    "height": 10,   // The height of the dashboard
                    "width": 12,    // The width of the dashboard
                    "n_architectures": 1    // The number of info architectures to return
                    "n_components": 8   // The number of possible components
                },
                "architectures": [
                        {
                            "id": -1,   // The ID of the viz component (-1 for inner node)
                            "height": 1,    // Height as a proportion of parent
                            "width": 1,     // Width as a proportion of parent
                            "orientation": "n",  // "n" == none; "v" == vertical; "h" == horizontal
                            "children": [
                                [
                                    { ... },    // Recursively defined
                                    { ... }
                                ]
                            ]
                        },
                        ...     // An architecture for each trial, in the same order as scores
                    ]
                ],
                "scores": [0.81, ...]   // The scores from each trial
             }

Returns:
    <next> -- The next information architectures to try
              {
                "architectures": [
                    {
                        "id": -1,   // The ID of the viz component (-1 for inner node)
                        "height": 1,    // Height as a proportion of parent
                        "width": 1,     // Width as a proportion of parent
                        "orientation": "n",  // "n" == none; "v" == vertical; "h" == horizontal
                        "left_child": { ... },  // Recursive
                        "right_child": { ... }
                    },
                    ...     // More depending on value of `n_architectures`
                ]
              }
"""
import argparse
import json
import sys

import numpy as np

from interpml import config, utils
from interpml import info_architecture as ia
from interpml import bayes_opt as bo


X = np.loadtxt(config.ia_feats_file, delimiter=',')
info_archs = json.load(config.ia_layouts_file.open('r'))['architectures']


def get_features(info_arch_jsons, n_components):
    """Get the feature vectors for the trees associated with the JSON-like
    objects in `info_arch_jsons`

    :param info_arch_jsons: JSON-like dicts with the InfoArchTree specs
    :param n_components: int
    :return: 'feat_vecs'
    """
    feat_vecs = []
    for ia_json in info_arch_jsons:
        ia_tree = ia.InfoArchTree.from_json(ia_json)
        feat_vec = ia_tree.get_feature_vector(components=n_components)
        feat_vecs.append(feat_vec)
    return np.stack(feat_vecs, axis=0)


def pack_next(next_ias):
    if type(next_ias) == dict:
        next_ias = [next_ias]
    return json.dumps({"architectures": next_ias})


def random_init(n=config.n_init):
    idxs = np.random.choice(len(info_archs), size=n)
    return list([info_archs[i] for i in idxs])


def propose_next(X_obs, y_obs):
    """Run the BayesOpt procedure to get the next proposed architecture

    :param X_obs: Observed info architecture feature vectors
    :param y_obs: Observed user scores
    :return: 'ia_next' -- The next info architecture (in json format) to try
    """
    bayes_opt = bo.BayesianOptimizer(**config.bayes_opt_params)
    bayes_opt.update(X_obs, y_obs)
    idx_next, X_next, score_next = bayes_opt.propose_next(X)
    ia_next = info_archs[idx_next]
    return ia_next


if __name__ == '__main__':
    parser = argparse.ArgumentParser(
        description='run_bayes_opt. Compute the next best information architecture to try.')

    parser.add_argument('-i', '--input', type=str, nargs=1, default=None,
                        help='A JSON-like dict with all observed architectures and scores')
    args = parser.parse_args()

    input_ = args.input

    if input_ is None:
        # Random initialization
        res = pack_next(random_init())
    else:
        # get next
        obs = json.loads(input_[0])
        X_obs = get_features(obs['architectures'], n_components=obs['meta'].get('n_components', config.n_components))
        y_obs = obs['scores']

        ia_next = propose_next(X_obs, y_obs)

        res = pack_next(ia_next)

    sys.stdout.write(res)
