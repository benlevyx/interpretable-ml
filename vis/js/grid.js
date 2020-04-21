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
  var container = d3.select('#' + parentElem)
      .append('div')
      .attr('class', 'container db-container');
  drawSingleGridLevel(container, spec, false);
}

/**
 * drawSingleGridLevel -- Recursively draw the grid
 * @param elem  -- A d3 selector to a div element
 * @param data  -- A JS object containing the data to be rendered
 * @param isRow -- true if the element is a row
 *                 (can't draw another row inside, can't end the
 *                 hierarchy here)
 */
function drawSingleGridLevel(elem, data, isRow) {
  if (data.id !== -1) {
    // Leaf node
    elem.append('div').attr('class', `vis-container vis-container-${data.id}`)
  }
  else {
    var orient = data.orientation,
        left,
        right;

    if (orient === 'v') {
      // Two new rows; stack the children on top of one another

      if (isRow) {
        // First, add a new col
        elem = elem.append('div')
            .attr('class', 'col')
            .attr('width', '100%');
      }
      left = elem.append('div')
          .attr('class', 'row')
          .attr('width', convertToPercentage(data.left_child.width))
          .attr('height', convertToPercentage(data.left_child.height));

      drawSingleGridLevel(left, data.left_right, true);

      if (data.right_child !== {}) {
        right = elem.append('div')
            .attr('class', 'row')
            .attr('width', convertToPercentage(data.right_child.width))
            .attr('height', convertToPercentage(data.right_child.height));

        drawSingleGridLevel(right, data.right_child, true);
      }
    } else {
      // Two new cols, in the same row
      left = elem.append('div')
          .attr('class', 'col')
          .attr('width', convertToPercentage(data.left_child.width));

      drawSingleGridLevel(left, elem.left_child, false);
      if (data.right_child !== {}) {
        right = elem.append('div')
            .attr('class', 'col')
            .attr('width', convertToPercentage(data.right_child.width));

        drawSingleGridLevel(right, elem.right_child, false);
      }
    }
  }
}

function convertToPercentage(n) {
  return `${Math.round(n * 100000) / 100}%`
}