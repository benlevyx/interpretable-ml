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

from interpml import config, utils
from interpml import info_architecture as ia


if __name__ == '__main__':
    arg_parser = argparse.ArgumentParser()