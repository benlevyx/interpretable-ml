"""Plotting utilities, partially from
https://github.com/krasserm/bayesian-machine-learning/blob/master/bayesian_optimization_util.py
"""
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.cm as mcm

import networkx as nx


def plot_approximation(gpr, X, Y, X_sample, Y_sample, X_next=None, show_legend=False):
    mu, std = gpr.predict(X, return_std=True)
    plt.fill_between(X.ravel(), 
                     mu.ravel() + 1.96 * std, 
                     mu.ravel() - 1.96 * std, 
                     alpha=0.1) 
    plt.plot(X, Y, 'y--', lw=1, label='Noise-free objective')
    plt.plot(X, mu, 'b-', lw=1, label='Surrogate function')
    plt.plot(X_sample, Y_sample, 'kx', mew=3, label='Noisy samples')

    max_idx = Y.argmax()
    Y_max_true = Y[max_idx]
    X_max_true = X[max_idx]
    plt.plot(X_max_true, Y_max_true, '+', mew=2, ms=8, color='green', label='True optimum')

    if X_next:
        plt.axvline(x=X_next, ls='--', c='k', lw=1)
    if show_legend:
        plt.legend()

def plot_acquisition(X, Y, X_next, show_legend=False):
    plt.plot(X, Y, 'r-', lw=1, label='Acquisition function')
    plt.axvline(x=X_next, ls='--', c='k', lw=1, label='Next sampling location')
    if show_legend:
        plt.legend()    
        
def plot_convergence(X_sample, Y_sample, n_init=2):
    plt.figure(figsize=(12, 3))

    x = X_sample[n_init:].ravel()
    y = Y_sample[n_init:].ravel()
    r = range(1, len(x)+1)
    
    x_neighbor_dist = [np.abs(a-b) for a, b in zip(x, x[1:])]
    y_max_watermark = np.maximum.accumulate(y)
    
    plt.subplot(1, 2, 1)
    plt.plot(r[1:], x_neighbor_dist, 'bo-')
    plt.xlabel('Iteration')
    plt.ylabel('Distance')
    plt.title('Distance between consecutive x\'s')

    plt.subplot(1, 2, 2)
    plt.plot(r, y_max_watermark, 'ro-')
    plt.xlabel('Iteration')
    plt.ylabel('Best Y')
    plt.title('Value of best selected sample')


def plot_treemap(arr, cmap='Paired', ax=None, **kwargs):
    if ax is None:
        plotter = plt
    else:
        plotter = ax
    if 'vmax' not in kwargs:
        kwargs.update({'vmax': 12})
    return plotter.imshow(arr, cmap=cmap, **kwargs)


def plot_tree_graph(info_arch, **kwargs):
    """Plot an information architecture as a tree
    """
    G = nx.DiGraph()
    nodes, edges = info_arch.get_nodes_and_edges()
    G.add_nodes_from(nodes)
    G.add_edges_from(edges)
    G = nx.convert_node_labels_to_integers(G)
    pos = nx.drawing.nx_agraph.graphviz_layout(G, prog='dot')

    node_colors = [n.value if n.value else mcm.Paired.N - 1 for n in nodes]

    nx.draw(G, pos, node_color=node_colors, cmap=mcm.Paired, with_labels=False, node_size=1000)
    return G
