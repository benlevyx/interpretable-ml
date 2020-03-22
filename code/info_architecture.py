import numpy as np
import pandas as pd
import matplotlib.pyplot as plt


class InfoArchTree:
    def __init__(self, root, height=12, width=12):
        self.root = root
        self.height = height
        self.width = width

    @staticmethod
    def from_array(arr, height=12, width=12):
        root = arr2tree(arr, 1., None)
        return InfoArchTree(root, height=height, width=width)

    @staticmethod
    def from_components(self, components: list):
        """
        Create an InfoArchTree from a list of components (tuples) with the
        following fields (in order):
            0. Component name
            1. Size (0 <= size <= 1)
            2. Orientation ('v' or 'h'), indicating the direction in which
               the component spans 100% of its parent
        """
        raise NotImplementedError()

    def get_features(self):
        """Get the corresponding feature matrix for this IA.
        Fields:
            - value (name of component)
            - size (fraction of total)
            - orientation (1 for 'v', 0 for 'h')
            - depth (position in the tree)
        """
        feats = self.root.get_features(1., 1., 0)
        # Adding depth = 1 to the last component
        last_comp = feats[-1]
        last_depth = last_comp[-1] + 1
        last_comp = (last_comp[0], last_comp[1], last_comp[2], last_depth)
        feats[-1] = last_comp

        res = pd.DataFrame(feats,
                           columns=['value', 'size', 'orientation', 'depth'])
        res['orientation'] = res['orientation'].apply(lambda x: 1 if x == 'v' else 0)
        res['depth'] = res['depth'] / res['depth'].max()
        res['priority'] = (res.index.values + 1) / (len(res))
        return res

    def to_array(self):
        """Get the treemap representation for this IA (in np.ndarray format)"""
        return self.root.to_array(self.height, self.width)

    def plot(self):
        """Plot the IA"""
        arr = self.root.to_array(self.height, self.width)
        im = plt.imshow(arr, cmap='Paired', vmax=12)
        plt.colorbar(im)
        return im

    def distance(self, other, distance_func=None, args=None):
        """Compute the similarity between this and `other`"""
        feats1 = self.get_features()
        feats2 = other.get_features()
        all_comps = pd.Series(list(set(feats1['value'].tolist() + feats2['value'].tolist())),
                              name='value')

        feats1 = self._fill_to_components(feats1, all_comps)
        feats2 = self._fill_to_components(feats2, all_comps)

        if distance_func:
            return distance_func(feats1.values, feats2.values, *args)
        else:
            diff = np.abs(feats1.values - feats2.values)
            return diff.sum()

    def __str__(self):
        return str(self.root)

    @staticmethod
    def _fill_to_components(feats, comps):
        return (pd.merge(feats, comps, on='value', how='outer')
                .fillna(0)
                .sort_values('value')
                .drop('value', axis=1))


class Node:
    def __init__(self, value, size, orientation, left=None, right=None):
        """Instantiate a Node

        Arguments:
            value {int} -- The component name/value
            size {float} -- Size of the component as a proportion of the
                            parent component.
                            0 <= size <= 1
            orientation {str} -- One of {'v', 'h'}. The way this component is
                                 oriented. If 'v', then component has equal
                                 height as parent. If 'h', then component has
                                 equal width as parent.
        Keyword arguments:
            left {Node|None} -- If not None, automatically adds as left child
            right {Node|None} -- If not None, automatically adds as right child
        """
        self.value = value
        self.size = size
        self.orientation = orientation
        self.left = left
        self.right = right

    def add_left(self, node):
        self.left = node

    def add_right(self, node):
        self.right = node

    def to_array(self, height, width) -> np.ndarray:
        """Get a treemap representation of the tree with this
        node at the root."""
        if self.value:
            arr = np.full((height, width), self.value)
        else:
            if self.left.orientation == 'v':
                left_size = (height, int(np.round(self.left.size * width)))
                right_size = (height, width - left_size[1])
                concat_axis = 1
            else:
                left_size = (int(np.round(self.left.size * height)), width)
                right_size = (height - left_size[0], width)
                concat_axis = 0
            left_arr = self.left.to_array(*left_size)
            right_arr = self.right.to_array(*right_size)
            arr = np.concatenate((left_arr, right_arr), axis=concat_axis)
        return arr

    def get_features(self, height, width, depth):
        """Return a dictionary of components with the following fields:
            - Component name
            - Size in absolute terms as pct of total
            - Vertical or horizontal split
            - Depth in tree
        """
        if self.orientation == 'v':
            h = height
            w = self.size * width
        else:
            h = height * self.size
            w = width
        if self.value:
            return [(self.value, h * w, self.orientation, depth)]
        else:
            d = depth + 1
            feats = []
            if self.left:
                left_feats = self.left.get_features(h, w, d)
                feats.extend(left_feats)
            if self.right:
                right_feats = self.right.get_features(h, w, d)
                feats.extend(right_feats)
            return feats

    def __str__(self):
        if self.left is None and self.right is None:
            return f'{self.value}, {self.size:.2f}, {self.orientation}'
        else:
            lines = [f'[], {self.size:.2f}']
            for child in (self.left, self.right):
                childstr = str(child)
                for i, line in enumerate(childstr.split('\n')):
                    if i == 0:
                        lines.append(f'|----{line}')
                    else:
                        lines.append(f'|    {line}')
            return '\n'.join(lines)


def arr2tree(arr, size, orientation):
    if arr.size == 0:
        return None
    comp1_val = arr[0, 0]
    if np.all(arr == comp1_val):
        # Make a single node:
        return Node(comp1_val, size, orientation)
    else:
        c1 = _find_sep(arr, axis=1)
        if c1:
            # Vertical
            orientation = 'v'
            r1 = arr.shape[0]
            left_size = (c1 + 1) / arr.shape[1]
            right_size = 1. - left_size
            left_child = arr2tree(arr[:, :c1 + 1], left_size, orientation)
            right_child = arr2tree(arr[:, c1 + 1:], right_size, orientation)
        else:
            # Horizontal
            orientation = 'h'
            r1 = _find_sep(arr, axis=0)
            c1 = arr.shape[1]
            left_size = (r1 + 1) / arr.shape[0]
            right_size = 1. - left_size
            left_child = arr2tree(arr[:r1 + 1, :], left_size, orientation)
            right_child = arr2tree(arr[r1 + 1:, :], right_size, orientation)

        if left_child.value and right_child.value:
            right_child.size = 1.
            right_child = Node(None, right_size, orientation, left=right_child, right=None)

        root = Node(None, size, orientation, left=left_child, right=right_child)
        return root


def _find_sep(arr, axis):
    diffs = np.diff(arr, axis=axis).astype(bool).astype(int)
    totals = diffs.sum(axis=axis - 1)
    axis_total = arr.shape[axis - 1]
    pos = np.argwhere(totals == axis_total)
    if len(pos) != 0:
        return pos[0, 0]
    else:
        return None


def generate_treemap(height=12, width=12, n_components=6,
                     min_size=2, min_height=None, min_width=None,
                     drop_prob=0.1) -> np.ndarray:
    """Generate a random treemap.
    """
    if not min_width:
        min_height, min_width = min_size, min_size
    # Decide which components to drop
    n_to_drop = np.random.binomial(n_components, drop_prob)
    if n_to_drop > 0:
        dropped = np.random.choice(n_components, size=n_to_drop, replace=False)
        components = [c for c in np.arange(n_components) if c not in dropped]
    else:
        components = np.arange(n_components)

    # Making the tree
    arr = np.zeros((height, width))
    arr = _generate_treemap(arr, components, min_height, min_width)
    return arr


def _generate_treemap(arr, components, min_height, min_width):
    if len(components) == 1:
        arr[:, :] = components[0]
        return arr
    else:
        # 1. Choose vertical or horizontal split
        if arr.shape[0] < min_height * 2:
            orientation = 1
        elif arr.shape[1] < min_width * 2:
            orientation = 0
        else:
            orientation = np.random.choice(2)

        if orientation == 1:
            # 1. Vertical (columns)
            min_size = min_width
        else:
            # 2. Horizontal (row)
            min_size = min_height
        div = np.clip(np.random.choice(arr.shape[orientation]),
                      min_size + 1, arr.shape[orientation] - min_size - 1)
        left_arr, right_arr = np.split(arr, [div], axis=orientation)

        # 2. Partition components
        n_left_comps = np.clip(np.random.choice(len(components)),
                               1, len(components) - 1)
        components = np.random.permutation(components)
        left_comps, right_comps = np.split(components, [n_left_comps])

        left_tiled = _generate_treemap(left_arr, left_comps, min_height, min_width)
        right_tiled = _generate_treemap(right_arr, right_comps, min_height, min_width)

        if orientation == 1:
            res = np.hstack((left_tiled, right_tiled))
        else:
            res = np.vstack((left_tiled, right_tiled))
        return res


def plot_treemap(arr, cmap='Paired', ax=None, **kwargs):
    if ax is None:
        plotter = plt
    else:
        plotter = ax
    if 'vmax' not in kwargs:
        kwargs.update({'vmax': 12})
    return plotter.imshow(arr, cmap=cmap, **kwargs)
