/**
 * makeGrid -- Render a bootstrap grid to the DOM following the specification in `spec`
 * @param spec -- specification for the grid (nested JSON)
 * @param _parentElem -- The ID of the div to draw the grid in (no '#')
 *
 * example spec:
 *
 *      {"id": -1,   // The ID of the viz component (-1 for inner node)
 *       "height": 1,    // Height as a proportion of parent
 *       "width": 1,     // Width as a proportion of parent
 *       "orientation": "n",  // "n" == none; "v" == vertical; "h" == horizontal
 *       "left_child": { ... },    // Recursively defined
 *       "right_child": { ... }
 *      }
 *
 */
export default function makeGrid(spec, _parentElem) {
  var container = d3.select('#' + _parentElem)
      .append('div')
      .attr('class', 'container db-container');
  drawSingleGridLevel(spec, container);
}

/**
 * drawSingleGridLevel -- Recursively draw the grid
 * @param data  -- A JS object containing the data to be rendered
 * @param elem  -- An HTML selection (parent element)
 */
function drawSingleGridLevel(data, elem) {
  if (data.id !== -1) {
    // Leaf node
    elem.append('div').attr('class', 'vis-container')
        .attr('id', `vis-container-${data.id}`);
  }
  else {
    var orient = data.orientation,
        elemBbox = elem.node().getBoundingClientRect(),
        width = elemBbox.width,
        height = elemBbox.height,
        left,
        right;

    left = elem.append('div')
        .call(setChildAttrs, width, height, data.left_child);

    drawSingleGridLevel(data.left_child, left);

    if (data.right_child !== {}) {
      right = elem.append('div')
          .call(setChildAttrs, width, height, data.right_child, orient);

      drawSingleGridLevel(data.right_child, right);
    }
  }
}

function setChildAttrs(e, width, height, child, orientation) {
  e.attr('class', 'container inner-node')
      .style('position', 'absolute')
      .attr('width', width * child.width)
      .attr('height', height * child.height);

  if (orientation !== undefined) {
    if (orientation === 'v') {
      e.attr('left', width * (1 - child.width));
    } else {
      e.attr('top', height * (1 - child.height));
    }
  } else {
    e.attr('top', 0).attr('left', 0);
  }
}