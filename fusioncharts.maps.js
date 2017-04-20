
(function (factory) {
    if (typeof module === 'object' && typeof module.exports !== "undefined") {
        module.exports = factory;
    } else {
        factory(FusionCharts);
    }
}(function (FusionCharts) {


/**!
 * @license FusionCharts JavaScript Library - KDtree
 * Copyright FusionCharts Technologies LLP
 * License Information at <http://www.fusioncharts.com/license>
 *
 * @version 3.12.0
 */
/**
 * @private
 * @module fusioncharts.renderer.javascript.kdtree
 * @export fusioncharts.kdtree.js
 */
FusionCharts.register('module', ['private', 'modules.renderer.js-kdtree', function () {

/*
     * compareFunction : An optional argument for Array.Prototype.sort(). Used to change the default sorting order.
     * @param a {Object} and @param b {Object} - two elements being compared during the sort.
    */
    // sorts the Array w.r.t to 'x' property of the array elements in an ascending order.
    var global = this,
        lib = global.hcLib,
        UNDEFINED,
        isWithinCircle = function (x, y, cx, cy, r) {
            return (Math.pow(cx - x, 2) + Math.pow(cy - y, 2) <= Math.pow(r, 2));
        },
        rad = function (deg) {
            return deg % 360 * deg2rad;
        },
        mathPI = Math.PI,
        mathCos = Math.cos,
        mathSin = Math.sin,
        mathMax = Math.max,
        mathMin = Math.min,
        deg2rad = mathPI / 180,
        doIntersect = function (p1x, p1y, q1x, q1y, p2x, p2y, q2x, q2y) {
            // Find the four orientations needed for general and
            // special cases
            var o1 = orientation(p1x, p1y, q1x, q1y, p2x, p2y),
                o2 = orientation(p1x, p1y, q1x, q1y, q2x, q2y),
                o3 = orientation(p2x, p2y, q2x, q2y, p1x, p1y),
                o4 = orientation(p2x, p2y, q2x, q2y, q1x, q1y);

            // General case
            if (o1 !== o2 && o3 !== o4) {
                return true;
            }

            // Special Cases
            // p1, q1 and p2 are colinear and p2 lies on segment p1q1
            if (o1 === 0 && onSegment(p1x, p1y, p2x, p2y, q1x, q1y)) {
                return true;
            }

            // p1, q1 and p2 are colinear and q2 lies on segment p1q1
            if (o2 === 0 && onSegment(p1x, p1y, q2x, q2y, q1x, q1y)) {
                return true;
            }

            // p2, q2 and p1 are colinear and p1 lies on segment p2q2
            if (o3 === 0 && onSegment(p2x, p2y, p1x, p1y, q2x, q2y)) {
                return true;
            }

             // p2, q2 and q1 are colinear and q1 lies on segment p2q2
            if (o4 === 0 && onSegment(p2x, p2y, q1x, q1y, q2x, q2y)) {
                return true;
            }

            return false; // Doesn't fall in any of the above cases
        },
        onSegment = function (p1x, p1y, q1x, q1y, p2x, p2y) {
            if (q1x <= mathMax(p1x, p2x) && q1x >= mathMin(p1x, p2x) &&
                    q1y <= mathMax(p1y, p2y) && q1y >= mathMin(p1y, p2y)) {
                return true;
            }
            return false;
        },
        orientation = function (p1x, p1y, q1x, q1y, p2x, p2y) {
            var A = q1y - p1y,
                B = p2x - q1x,
                C = q1x - p1x,
                D = p2y - q1y,
                val1,
                val2,
                val;

            val1 = A * B;
            val2 = C * D;

            if (isNaN(val1)) {
                val1 = 0;
            }

            if (isNaN(val2)) {
                val2 = 0;
            }

            val = val1 - val2;

            if (val === 0) {
                return 0;  // colinear
            }

            return (val > 0) ? 1: 2;
        },
        isWithinPolygon = function (x, y, cx, cy, r, sides, startAngle) {
            var i,
                extreme = Infinity,
                angle,
                count = 0,
                p1x,
                p2x,
                p2y,
                p1y,
                inangle,
                inside = false;

            if (isWithinCircle(x, y, cx, cy, r) && sides >= 3) {
                angle = startAngle === UNDEFINED ? mathPI * 0.5 : rad(startAngle);
                inangle = 2 * mathPI / sides;
                p1x = cx + r * mathCos(-angle);
                p1y = cy + r * mathSin(-angle);

                for (i = 0; i < sides; i++) {
                    angle += inangle;
                    p2x = cx + r * mathCos(-angle);
                    p2y = cy + r * mathSin(-angle);

                    if (doIntersect(p1x, p1y, p2x, p2y, x, y, extreme, y)) {

                        if (orientation(p1x, p1y, x, y, p2x, p2y) === 0) {
                            return onSegment(p1x, p1y, x, y, p2x, p2y);
                        }

                        count++;
                    }
                    p1x = p2x;
                    p1y = p2y;
                }

                inside = count % 2 !== 0;
            }

            return inside;
        };

    function kdTreeAbs (arr) {
        'use strict';
        // Max radius will be tolerance
        var tolerance = arr && arr[0] && arr[0].r || 5,
            i,
            max = Math.max,
            floor = Math.floor,
            sqrt = Math.sqrt,
            min = Math.min,
            log = Math.log,
            exp = Math.exp,
            pow = Math.pow;
        arr = arr || [];
        // Find tolerance as the max radius
        // of the element
        for (i = arr.length; i--;) {
            if (arr[i].r > tolerance) {
                tolerance = arr[i].r;
            }
            // Setting the index
            arr[i].i = i;
            arr[i].x = +arr[i].x;
            arr[i].y = +arr[i].y;
        }
        // KdTree Definition below
        function buildKdTree(arr, left, right, isY){
            var ob = {},
                mid,
                access = isY ? 'y' : 'x';
            if(left === right){
                ob.point = arr[left];
                return ob;
            }
            if(right - left === 1){
                if(arr[left][access] > arr[right][access]){
                    ob.point = arr[left];
                    ob.left = {
                        point: arr[right]
                    };
                } else {
                    ob.point = arr[right];
                    ob.left = {
                        point: arr[left]
                    };
                }
                return ob;
            }

            mid = (left + right) >> 1;

            if (isY) {
                quickselectY(arr, mid, left, right);
            } else {
                quickselectX(arr, mid, left, right);
            }

            ob.point = arr[mid];
            ob.left = buildKdTree(arr, left, mid - 1, !isY);
            ob.right = buildKdTree(arr, mid + 1, right, !isY);
            return ob;
        }

        function quickselectX(arr, k, left, right) {
            var n, m, z, s, sd, newLeft, newRight, t, i, j;

            while (right > left) {
                if (right - left > 600) {
                    n = right - left + 1,
                    m = k - left + 1,
                    z = log(n),
                    s = 0.5 * exp(2 * z / 3),
                    sd = 0.5 * sqrt(z * s * (n - s) / n) * (m - n / 2 < 0 ? -1 : 1),
                    newLeft = max(left, floor(k - m * s / n + sd)),
                    newRight = min(right, floor(k + (n - m) * s / n + sd));
                    quickselectX(arr, k, newLeft, newRight);
                }

                t = arr[k];
                i = left;
                j = right;

                swap(arr, left, k);
                if (arr[right].x > t.x) {
                    swap(arr, left, right);
                }

                while (i < j) {
                    swap(arr, i, j);
                    i++;
                    j--;
                    while (arr[i].x < t.x) {
                        i++;
                    }
                    while (arr[j].x > t.x) {
                        j--;
                    }
                }

                if (arr[left].x === t.x) {
                    swap(arr, left, j);
                } else {
                    j++;
                    swap(arr, j, right);
                }

                if (j <= k) {
                    left = j + 1;
                }
                if (k <= j) {
                    right = j - 1;
                }
            }
        }
        function quickselectY(arr, k, left, right) {

            var n, m, z, s, sd, newLeft, newRight, t, i, j;

            while (right > left) {
                if (right - left > 600) {
                    n = right - left + 1,
                    m = k - left + 1,
                    z = log(n),
                    s = 0.5 * exp(2 * z / 3),
                    sd = 0.5 * sqrt(z * s * (n - s) / n) * (m - n / 2 < 0 ? -1 : 1),
                    newLeft = max(left, floor(k - m * s / n + sd)),
                    newRight = min(right, floor(k + (n - m) * s / n + sd));
                    quickselectY(arr, k, newLeft, newRight);
                }

                t = arr[k];
                i = left;
                j = right;

                swap(arr, left, k);
                if (arr[right].y > t.y) {
                    swap(arr, left, right);
                }

                while (i < j) {
                    swap(arr, i, j);
                    i++;
                    j--;
                    while (arr[i].y < t.y) {
                        i++;
                    }
                    while (arr[j].y > t.y) {
                        j--;
                    }
                }

                if (arr[left].y === t.y) {
                    swap(arr, left, j);
                } else {
                    j++;
                    swap(arr, j, right);
                }

                if (j <= k) {
                    left = j + 1;
                }
                if (k <= j) {
                    right = j - 1;
                }
            }
        }

        function swap(arr, i, j) {
            var tmp = arr[i];
            arr[i] = arr[j];
            arr[j] = tmp;
        }
        return {
            tree: (arr.length === 0) ? {} : buildKdTree(arr, 0, arr.length - 1, false),
            search: function (x, y, type) {
                // Check a point is in range w.r.t
                // to given range
                function inRange (a, b) {
                    if (type === 'circle') {
                        return calcDist(a, b, x, y) <= x1;
                    }
                    return a >= x1 && a <= x2 && b >= y1 && b <= y2;
                }
                function inRangeApply (a, r1, r2) {
                    return a >= r1 && a <= r2;
                }
                // Helper function for search
                // to apply data if found
                function apply (ob) {
                    var currentHovered = inRangeApply(x, ob.x1, ob.x2) && inRangeApply(y, ob.y1, ob.y2),
                        currentDist = calcDist(x, y, ob.point.x, ob.point.y);

                    if (!res) {
                        res = ob;
                        lastHovered = currentHovered;
                        lastDist = currentDist;
                        return;
                    }
                    if (currentHovered) {
                        if (lastHovered) {
                            if (ob.point.i > res.point.i) {
                                res = ob;
                                lastHovered = currentHovered;
                                lastDist = currentDist;
                            }
                        } else {
                            res = ob;
                            lastHovered = currentHovered;
                            lastDist = currentDist;
                        }
                    } else {
                        if (!lastHovered) {
                            if (currentDist < lastDist) {
                                res = ob;
                                lastHovered = currentHovered;
                                lastDist = currentDist;
                            }
                        }
                    }
                }
                function defineSearchArea (r) {
                    if (type === 'circle') {
                        // Defining box again
                        x1 = r;
                    } else {
                        x1 = x - r || 0;
                        x2 = x + r || 0;
                        y1 = y - r || 0;
                        y2 = y + r || 0;
                    }
                }
                // Calculate  distance between two points
                function calcDist (x, y, p, q) {
                    return sqrt(pow(x - p, 2) + pow(y - q, 2));
                }
                // X and Y searching different for
                // maintaing performance
                function searchX (ob) {
                    // Not found
                    if (!ob || !ob.point) {
                        return;
                    }
                    // defining search area
                    defineSearchArea(ob.point.r);
                    // If match found return
                    if (inRange(ob.point.x, ob.point.y)) {
                        apply(ob);
                    }
                    // If smaller x1 go left
                    if (x1 <= ob.point.x) {
                        searchY(ob.left);
                    }
                    // If bigger x2 goto right
                    if (x2 >= ob.point.x) {
                        searchY(ob.right);
                    }
                }
                function searchY (ob) {
                    // Not found
                    if (!ob || !ob.point) {
                        return;
                    }
                    // defining search area
                    defineSearchArea(ob.point.r);
                    // If match found return
                    if (inRange(ob.point.x, ob.point.y)) {
                        apply(ob);
                    }
                    // If smaller x1 go left
                    if (y1 <= ob.point.y) {
                        searchX(ob.left);
                    }
                    // If bigger x2 goto right
                    if (y2 >= ob.point.y) {
                        searchX(ob.right);
                    }
                }
                // Actual search logic
                var tree = this.tree,
                    res,
                    x1 = x - tolerance,
                    x2 = x + tolerance,
                    y1 = y - tolerance,
                    y2 = y + tolerance,
                    lastHovered = false,
                    lastDist = 0;
                searchX(tree);
                // Return point otherwise undefined value
                return res && res.point || res;
            }
        };

    }
    /*
     * The entire data of the dataset is converted to a tree like structure(namely kdTree).
     * This is very useful to traverse and extract details(e.g. for a tooltip) from a million array elements especially
     * to extract information of the hovered plot on each mouseMove.
     * @constructor
     */
    function KdTree (shape) {
        var kdTreeObj = this;
        kdTreeObj.configure(shape);
    }

    KdTree.prototype = {
        configure: function (shape) {
            var kdTreeObj = this;
            kdTreeObj.validatorFn = shape ? kdTreeObj.shapeValidator() : kdTreeObj.defaultValidator();
        },
        /*
         * Check Function: To determine if the mouseMove Point and the point to be searched are within limits
         * @param mousePoint {Object} - point extracted from the mouseMove.
         * @return {Function} - Returns if the setElem is in limit wrt the mouseMoved point.
        */
        defaultValidator: function () {
            var kdTreeObj = this;
            return function (setElem) {
                var mousePoint = kdTreeObj.mousePoint;
                //Refer to the 2-D distance formula for two points
                // @returns {Boolean} - If the calculated distances are within the limits.
                return setElem && (Math.pow((setElem.x - mousePoint.x) / kdTreeObj.xLimit, 2) +
                 Math.pow((setElem.y - mousePoint.y) / kdTreeObj.yLimit, 2) <= 1) ? true : false;
            };
        },
        shapeValidator: function () {
            var kdTreeObj = this;

            return function (setElem) {
                var mousePoint = kdTreeObj.mousePoint,
                    shapeInfo = setElem && setElem.shapeInfo,
                    inside = false,
                    type,
                    innerradius,
                    r,
                    x = mousePoint.x,
                    y = mousePoint.y,
                    sides,
                    startAngle,
                    x1,
                    x2,
                    y1,
                    y2;

                type = shapeInfo && shapeInfo.type;

                switch (type) {
                    case 'circle':
                        r = shapeInfo.radius;
                        inside = isWithinCircle(x, y, setElem.x, setElem.y, r);
                        break;

                    case 'arc':
                        innerradius = shapeInfo.innerradius;
                        r = shapeInfo.radius;
                        inside = !isWithinCircle(x, y, setElem.x, setElem.y, innerradius) &&
                            isWithinCircle(x, y, setElem.x, setElem.y, r);
                        break;

                    case 'polygon':
                        r = shapeInfo.radius;
                        startAngle = shapeInfo.startAngle;
                        sides = shapeInfo.sides;
                        inside = isWithinPolygon(x, y, setElem.x, setElem.y, r, sides, startAngle);
                        break;

                    case 'rect':
                        x1 = setElem.x;
                        y1 = setElem.y;
                        x2 = x1 + (shapeInfo.width || 0);
                        y2 = y1 + (shapeInfo.height || 0);
                        inside = x >= x1 && x <= x2 && y >= y1 && y <= y2;
                        break;

                    case 'default':
                        inside = false;
                        break;
                }

                return inside;

            };
        },
        /*
         * Builds the tree structure from the data points provided.
         * @param points {Array} - The set level elements belonging to a particular dataset
         * Updates the tree structure in the tree property of the current instance.
         */
        buildKdTree: function (points) {
            /*
             * _buildKdTree is for the internal use to build the tree recursively.
             * @param points {Array} - The set level elements.
             * @param isX {Boolean} - isX determines the sorting order. Initially setting the isX = false ensures that
             * the initial sorting order of the array is w.r.t to y - axis
            */
            this.kdTree = kdTreeAbs(points);
            this.tree = this.kdTree.tree;
            return this;
        },
        /*
         * Returns the nearest point to the point given.
         * @param point {Object} - the point of reference in whose neighbour the point required is to be returned
         * @return {Object} - The neighbouring point w.r.t to the point is hunted and returned once within limits
        */
        getNeighbour : function (point, basicSearch, type) {
            var kDTreeObj = this, // Instance of the kdTree class specific to indivual dataset instance.
                tree = kDTreeObj.tree, // refer to the created tree like structure for that dataset instance.
                // limitBox - set the limiting boundaries for the neighbour hunt of the given point.
                limitBox = {
                    x1: point.x - kDTreeObj.xLimit,
                    x2: point.x + kDTreeObj.xLimit,
                    y1: point.y - kDTreeObj.yLimit,
                    y2: point.y + kDTreeObj.yLimit
                },
                //function specific to a paricular point that retruns Boolean if the neighbour searched is within limits
                validatorFn = kDTreeObj.validatorFn;
            kDTreeObj.mousePoint = point;
            // If basic search is on will use the search function from the
            // abstract implementation of kdTree
            if (basicSearch) {
                return this.kdTree && this.kdTree.search(point.x, point.y, type);
            }
            //When the renderring turns heavy, probably then the tree is not yet build.
            // Proceed further only if the tree exists.
            if (tree) {
                // search the nearest points within limits and return it.
                return kDTreeObj._searchBtwnLimit(limitBox, tree, true, validatorFn);
            }
        },
        /*
         * If two points are very closely spreaded, the point that was parsed later is given preference and returned
         hence.
         * This is important when two plots are very near, the tooltip and hover effects of the one that comes avobe is
         being displayed
         * @param p1 {Object} - The first point being compared.
         * @param p2 {Object} - The second point being compared in close vicinity of the first point (p1).
         * @return {Object} - The point that occurs later in the JSON data gets the preference.
        */
        _compair2closest: function (p1, p2) {
            if (!p1 || p1 && p2 && p2.i > p1.i) {
                return p2;
            }
            return p1;
        },
        /*
         * Search and return the nearest neighbouring point in the pre defined limits.
         * @param limitBox {Object} - Boundary conditions for the tolerance for the neighbourhood search.
         * @param tree {Object} - The tree within which the point is needed to be searched,
         * @param isX {Boolean} - Flag representative of the axis. This gets swapped everytime the function is called
         recursively
         * @param validatorFn {Function} - Returns if the point is within the limits.
         * @return returnPoint {Object} - neighbouring point.
        */
        _searchBtwnLimit : function(limitBox, tree, isX, validatorFn) {
            var point,
                returnPoint,
                kdTreeObj = this,
                axis = isX ? 'x': 'y',
                // get the lower and upper limits in accordance to the axis being referenced.
                lowerLimit = isX ? limitBox.x1 : limitBox.y1,
                upperLimit = isX ? limitBox.x2 : limitBox.y2;
            //Proceed further only when tree is defined
            point = tree && tree.point && tree.point[axis];
            if (point === undefined) {
                return;
            }
            // point1 is within limit;
            if (validatorFn(tree.point)) {
                //In case of two closely spaced points, they are chosen preferably using _compair2closest()
                returnPoint = tree.point;
            }
            // search the left side if required
            if (point >= lowerLimit && tree.left) {
                // if left is available then search on left
                returnPoint = kdTreeObj._compair2closest(returnPoint,
                    kdTreeObj._searchBtwnLimit(limitBox, tree.left, !isX, validatorFn));
            }
            // search the right side if required
            if (point <= upperLimit && tree.right) {
                // if left is available then search on left
                returnPoint = kdTreeObj._compair2closest(returnPoint,
                    kdTreeObj._searchBtwnLimit(limitBox, tree.right, !isX, validatorFn));
            }
            return returnPoint;

        },
        /*
         * Sets the tolerance limit for kdTree search after every zoom level
         * @param xLimit {Number} - The limiting tolerance in the x-axis
         * @param yLimit {Number} - The limiting tolerance in the y-axis
         */
        _setSearchLimit : function (xLimit,yLimit) {
            var kdTree = this;
            //sets the x and y limits.
            kdTree.xLimit = xLimit;
            kdTree.yLimit = yLimit;
        }
    };
    //reset the constructor
    KdTree.prototype.constructor = KdTree;

    lib.KdTree = KdTree;

    /* jshint ignore:start */

}]);

/**
 * @private
 * @module fusioncharts.renderer.javascript.legend-gradient
 */

FusionCharts.register('module', ['private', 'modules.renderer.js-gradientlegend', function() {
    var global = this,
        lib = global.hcLib,
        pluckNumber = lib.pluckNumber,
        pluck = lib.pluck,
        toRaphaelColor = lib.toRaphaelColor,
        graphics = lib.graphics,
        dehashify = lib.dehashify,
        hashify = lib.hashify,
        convertColor = graphics.convertColor,
        RGBtoHex = graphics.RGBtoHex,
        HEXtoRGB = graphics.HEXtoRGB,
        getLightColor = graphics.getLightColor,
        getValidColor = graphics.getValidColor,
        compositionKeys = {},
        isIE = lib.isIE,
        TRACKER_FILL = 'rgba(192,192,192,' + (isIE ? 0.002 : 0.000001) + ')',
        legendManager,
        DEF_COLOR = lib.COLOR_BLACK,
        FORMER_SLIDER_INDEX = false,
        LATER_SLIDER_INDEX = true,
        PERCENT_STR = '%',
        COMMA_STR = ',',
        hasOwnProp = ({}).hasOwnProperty,
        M = 'M',
        L = 'L',
        animType = 'easeIn',
        componentPoolFactory,
        universalPool = {};

    // Utility functions

    /*
     * Recursively merges two objects.
     * Source is object from where the properties will be copied and sink is destination object where the props are to
     * be copied. If the property is already present in sink, it wont copy the property.
     *
     * Example:                         After merging the sink will be changed and returned
     * src = {      | sink = {      |   sink = {
     *  a: 1,       |   b: 33,      |       a: 1,
     *  b: 2,       |   c: 44,      |       b: 33,
     *  obj1: {     |   obj2: {     |       c: 44,
     *      m: 1,   |       w: 11,  |       obj1: {
     *      n: 2    |       x: 22   |           m: 1,
     *  },          | }             |           n: 2
     *  obj2: {     |               |       },
     *      x: 1,   |               |       obj2: {
     *      y: 2,   |               |           w: 11,
     *      z: 3    |               |           x: 22,
     *  }           |               |           y: 2,
     * }            |               |           z: 3
     *              |               |       }
     *              |               |   }
     *
     * @param: source {Object} - The object from where the props are to be copied
     * @param: sink {Object} - The object where the props are to be merged
     * @return {Object} - The reference to the sink object which was passed
     */
    function merge (source, sink) {
        (function rec (source, sink) {
            var sourceVal,
                prop;

            for (prop in source) {
                // Iterates for every property in souce
                if (!hasOwnProp.call(source, prop)) {
                    // Igoners if the property does not belong to the object directly, it might resides on the prototype
                    // chain
                    continue;
                }

                sourceVal = source[prop];
                if (sink[prop] === undefined) {
                    // Assigns the value / ref if the value of the same property is undefined (it's not checked whether
                    // the key is directly or indirectly present on the object) in the sink.
                    sink[prop] = sourceVal;
                } else if (typeof sourceVal === 'object' && typeof sourceVal !== null) {
                    // If the value is another object recursively perform the merging.

                    // @todo check if the value is function, array etc. If it happens this will execute unpredictively,
                    // Its not implmented because it would more condition.
                    rec(sourceVal, sink[prop]);
                }
            }
        })(source, sink);

        return sink;
    }

    /*
     * Takes care of sanity checking of the color to some extent.
     * If no color is passed, ie called as getValidHexColor() it returns the default color. If incorrect color is passed
     * it returns false.
     *
     * @param code {String} - color code in string
     * @return {String | Boolean} - false if invalid color is passed, otherwise the same color or default color if no
     *                              no color is passed
     */
    function getValidHexColor (code) {
        var color = code ? code : DEF_COLOR;

        return getValidColor(color) || DEF_COLOR;
    }

    /*
     * Returns the opposite LIGHT color of a color. If the color is alraedy light, wont get much difference.
     *
     * @param code {String} - color code in string
     * @return {String} - Lightest (approx) color code of the color sent
     */
    function getOppositeColor (code) {
        return getLightColor(code, 1);
    }

    function getColorBetween(range1, range2, value) {
        /*jshint newcap: false */
        var value1 = range1.value,
            code1 = range1.code,
            rgb1 = HEXtoRGB(code1),
            value2 = range2.value,
            code2 = range2.code,
            rgb2 = HEXtoRGB(code2),
            diff,
            rgb;

        diff = value2 - value1;

        rgb = [
            Math.round(rgb1[0] + (((rgb2[0] - rgb1[0]) / diff) * (value - value1))),
            Math.round(rgb1[1] + (((rgb2[1] - rgb1[1]) / diff) * (value - value1))),
            Math.round(rgb1[2] + (((rgb2[2] - rgb1[2]) / diff) * (value - value1)))
        ];

        return RGBtoHex(rgb);
        /*jshint newcap: true */
    }

    function normalizeFontSizeAppend(obj) {
        var fontSize = obj.fontSize + '',
            normalizeFontSize;

        if (!fontSize) { return obj; }

        normalizeFontSize = fontSize.replace(/(\d+)(px)*/, '$1px');
        obj.fontSize = normalizeFontSize;

        return obj;
    }

    function isInvalid(arg){
        if (arg === undefined || typeof arg === 'undefined' || arg === null) {
            return true;
        } else if (arg !== arg) {
            return true;
        }

        return false;
    }

    compositionKeys.CAPTION = 'CAPTION';
    compositionKeys.LEGEND_BODY = 'LEGEND_BODY';
    compositionKeys.AXIS_LABEL = 'LEGEND_LABEL';
    compositionKeys.LEGEND_AXIS = 'LEGEND_AXIS';
    compositionKeys.RANGE = 'RANGE';
    compositionKeys.AXIS_VALUE = 'AXIS_VALUE';

    legendManager = (function () {
        var layers,
            components,
            chart,
            defaultConf = {},
            config;

        defaultConf.legendCarpetConf = {
            spreadFactor : 0.85,
            allowDrag: false,
            captionAlignment: 'center',
            padding: {
                v: 3,
                h: 3
            },
            style : {
                'fill' : '#e4d9c1',
                'stroke' : '#c4b89d'
            }
        };

        defaultConf.legendCaptionConf = {
            spreadFactor: 0.2,
            padding: {
                v: 2,
                h: 2
            },
            style : {
                fill: '#786B50',
                fontFamily: 'sans-serif',
                fontSize: '12px',
                fontWeight: 'bold',
                fontStyle: 'normal'
            },
            bound: {
                style: {
                    stroke: 'none'
                }
            }
        };

        defaultConf.legendBodyConf = {
            spreadFactor: 0.8,
            padding: {
                v: 2,
                h: 2
            },
            bound: {
                style: {
                    stroke: 'none'
                }
            }
        };

        defaultConf.legendAxisConf = {
            legendAxisHeight: 11,
            spreadFactor: 0.4,
            padding: {
                v: 1,
                h: 1
            },
            style : {
                stroke: 'none',
                'stroke-opacity': 0,
                'stroke-width': 1
            },
            line: {
                grooveLength: 3,
                offset: 8,
                style: {
                    stroke: 'rgba(255, 255, 255, 0.65)',
                    'stroke-width': 1.5
                }
            },
            shadow : {
                style : {
                    stroke : 'none',
                    fill : toRaphaelColor({
                        FCcolor: {
                            alpha : '25,0,0',
                            angle : 360,
                            color : '000000,FFFFFF,FFFFFF',
                            ratio : '0,30,40'
                        }
                    })
                }
            },
            bound: {
                style: {
                    stroke: 'none'
                }
            }
        };

        defaultConf.sliderGroupConf = {
            showTooltip: 1,
            outerCircle : {
                rFactor: 1.4,
                style: {
                    fill: TRACKER_FILL,
                    stroke: '#757575',
                    'stroke-width': 3
                }
            },
            innerCircle : {
                rFactor: 0.65,
                style: {
                    fill: TRACKER_FILL,
                    stroke: '#FFFFFF'
                }
            }
        };

        defaultConf.axisTextItemConf = {
            spreadFactor: 0.3,
            padding: {
                v: 1,
                h: 1
            },
            style : {
                fill: '#786B50',
                fontFamily: 'sans-serif',
                fontSize: '12px',
                fontWeight: 'normal',
                fontStyle: 'normal'
            }
        };

        function normalizePreprocessedData (confArr) {
            var numberFormatter = components.numberFormatter,
                index,
                length,
                rawVal;

            for (index = 0, length = confArr.length; index < length; index++) {
                rawVal = confArr[index].maxvalue;

                if (!rawVal) {
                    continue;
                }

                confArr[index].maxvalue = numberFormatter.getCleanValue(rawVal);
            }
        }

        return {
            init : function (options) {
                chart = options.chart;
                layers = chart.graphics;
                components = chart.components;
            },

            setConf : function (conf) {
                config = conf;
            },

            legacyDataParser : function (data, extremes) {
                var colormanagerConf = {},
                    numberFormatter = components.numberFormatter,
                    colorConfArr,
                    colorConf,
                    startColor,
                    endColor,
                    index,
                    validColor,
                    length,
                    colorRange,
                    value,
                    dispValue,
                    mapByPercent,
                    isMaxValPresent,
                    obj;

                if (!data) {
                    return false;
                }

                colormanagerConf.mapByPercent = mapByPercent = !!(pluckNumber(data.mapbypercent, 0));
                colorConfArr = data.color || [];

                if (data.minvalue === undefined) {
                    data.minvalue = extremes.min !== undefined ? (mapByPercent ? 0 : extremes.min) : 0;
                }

                if (data.maxvalue === undefined) {
                    data.maxvalue = extremes.max !== undefined ? (mapByPercent ? 100 : extremes.max) : 100;
                }

                isMaxValPresent = false;
                for (index = 0, length = colorConfArr.length; index < length; index++) {
                    if (colorConfArr[index].maxvalue) {
                        isMaxValPresent = true;
                        break;
                    }
                }

                if (!isMaxValPresent) {
                    colorConfArr = [];
                }

                startColor = data.code;

                colorRange = colormanagerConf.colorRange = [];
                colormanagerConf.gradient = !!pluckNumber(data.gradient, 1);

                // If no additional color array is provided as part of generating the gradient, creates the start and
                // end value to create the gradient
                if (!colorConfArr.length) {
                    if (startColor) {
                        // If start color is mentioned, create a gradient starting from default color to the mentioned
                        // color
                        endColor = getValidHexColor(startColor);
                        startColor = getValidHexColor();
                    } else {
                        // If no color is mentioned, create a gradient of two opposite color
                        startColor = getValidHexColor();
                        endColor = getOppositeColor(startColor);
                    }

                    colorConfArr.push({
                        code: endColor,
                        maxvalue: data.maxvalue,
                        label: undefined
                    });

                } else {
                    startColor = getValidHexColor(startColor);
                }

                normalizePreprocessedData(colorConfArr);

                colorConfArr = colorConfArr.sort(function (m, n) {
                    return m.maxvalue - n.maxvalue;
                });

                value = dispValue = data.minvalue && numberFormatter.getCleanValue(data.minvalue);
                dispValue = (value !== undefined || value !== null) && (mapByPercent ? value + PERCENT_STR :
                    numberFormatter.legendValue(value));
                colorRange.push({
                    code: dehashify(startColor),
                    value: value,
                    displayValue: dispValue,
                    label: data.startlabel
                });

                for (index = 0, length = colorConfArr.length; index < length; index++) {
                    colorConf = colorConfArr[index];
                    validColor = getValidHexColor(colorConf.code || colorConf.color);

                    value = dispValue = colorConf.maxvalue;

                    if(isNaN(parseInt(value, 10))) { continue; }

                    dispValue = (value !== undefined || value !== null) && (mapByPercent ? value + PERCENT_STR :
                        numberFormatter.legendValue(value));

                    colorRange.push(obj = new Object({
                        code: dehashify(validColor),
                        value: value,
                        displayValue: dispValue,
                        label: colorConf.label || colorConf.displayvalue
                    }));
                }

                colorRange[colorRange.length - 1].label = data.endlabel || colorConf.label;

                return colormanagerConf;

            },

            getDefaultConf: function (key) {
                return defaultConf[key];
            }
        };
    })();

    componentPoolFactory = function (chart) {
        var chartId = chart.chartInstance.id,
            pool = universalPool[chartId] || (universalPool[chartId] = {});


        return (function () {
            var elemTypes,
                actions = {},
                paper;

            elemTypes = {
                KEY_RECT : 'rect',
                KEY_TEXT : 'text',
                KEY_GROUP: 'group',
                KEY_CIRCLE: 'circle',
                KEY_PATH: 'path'
            };

            actions[elemTypes.KEY_RECT] = function (group) {
                return paper.rect(group);
            };

            actions[elemTypes.KEY_TEXT] = function (attr, group) {
                return paper.text(attr, group);
            };

            actions[elemTypes.KEY_GROUP] = function (groupName, parentGroup) {
                return paper.group(groupName, parentGroup);
            };

            actions[elemTypes.KEY_CIRCLE] = function (group) {
                return paper.circle(group);
            };

            actions[elemTypes.KEY_PATH] = function (pathStr, group) {
                return paper.path(pathStr, group);
            };

            function _hideRecursive () {
                var keyLevel1,
                    keyLevel2,
                    objLevel1,
                    val,
                    index, length;

                for (keyLevel1 in pool) {
                    objLevel1 = pool[keyLevel1];

                    for (keyLevel2 in objLevel1) {
                        val = objLevel1[keyLevel2];

                        if (val instanceof Array) {
                            for (index = 0, length = val.length; index < length; index++) {
                                val[index] && val[index].hide();
                            }
                        } else {
                            val.hide();
                        }
                    }
                }
            }

            return {
                init: function (renderer) {
                    paper = renderer;

                    _hideRecursive();
                },

                emptyPool: function () {
                    pool = universalPool[chartId] = {};
                },

                getChart: function () {
                    return chart;
                },

                getComponent: function (id, elemType, storeTillReCall) {
                    var idSpecificPool = pool[id],
                        multiInstance,
                        instance,
                        inst,
                        instanceRetrieved = 0;


                    if (!idSpecificPool) {
                        idSpecificPool = pool[id] = {};
                    }

                    instance = idSpecificPool[elemType];

                    if ((instance && !(instance instanceof Array)) ||
                        (instance instanceof Array && instance.length > 0)) {
                        return function () {
                            if (storeTillReCall) {
                                inst = instance[instanceRetrieved++];
                                if (inst) {
                                    return inst.show();
                                } else {
                                    return instance[instanceRetrieved] = actions[elemType].apply(this, arguments);
                                }
                            }

                            return instance.show();
                        };
                    }

                    return function () {
                        if (storeTillReCall) {
                            multiInstance = idSpecificPool[elemType] || (idSpecificPool[elemType] = []);
                            instance = actions[elemType].apply(this, arguments);
                            multiInstance.push(instance);

                            return instance.show();
                        }

                        return idSpecificPool[elemType] = actions[elemType].apply(this, arguments);
                    };

                },

                hideAll: function () {
                    _hideRecursive();
                },

                getKeys: function () {
                    return elemTypes;
                }
            };
        })();
    };

    function LegendBase (carpet, componentPool) {
        this.carpet = carpet;
        this._componentPool = componentPool;
    }

    LegendBase.prototype.constructor = LegendBase;

    LegendBase.prototype.draw = function (options) {
        options.componentPool = this._componentPool;
        return this.carpet.draw(options);
    };

    LegendBase.prototype.getLogicalSpace = function (options, recalculate) {
        options.componentPool = this._componentPool;
        return this.carpet.getLogicalSpace(options, recalculate);
    };

    LegendBase.prototype.dispose = function () {
        this.carpet && this.carpet.group && this.carpet.group.remove();
        this._componentPool.emptyPool();
    };

    function LegendCarpet (conf) {
        this.conf = conf;
        this._id = 'GL_CARPET';

        // Save the components which are the building block of the whole legend. Like: The background rect,
        // text, slider, color axis etc.
        this.compositionsByCategory = {};
        this.node = undefined;
        this.group = undefined;
        this._lSpace = undefined;
        this.autoRecalculate = false;
        this.groupName = 'fc-gradient-legend';
        this.moveInstructions = {};
    }

    LegendCarpet.prototype.constructor = LegendCarpet;

    LegendCarpet.prototype.addCompositions = function (instance, category) {
        this.compositionsByCategory[category] = instance;
    };

    LegendCarpet.prototype.getBoundingBox = function (options) {
        var conf = this.conf,
            spreadFactor = conf.spreadFactor,
            refSide = options.refSide,
            alignment = options.alignment,
            refOffset = options.refOffset,
            x = options.x,
            y = options.y,
            lWidth;


        lWidth = conf.width = refSide * spreadFactor;

        if (alignment && (x === undefined || x === null)) {
            x = ((refOffset + refSide) / 2) - lWidth / 2;
        }

        return {
            width: lWidth,
            height: options.maxOtherSide,
            x: x,
            y: y
        };
    };

    LegendCarpet.prototype.getPostCalcDecisions = function (bBox, componentsArea) {
        var conf = this.conf,
            padding = conf.padding,
            cat,
            totalHeightTaken = 0;

        for (cat in componentsArea) {
            totalHeightTaken += componentsArea[cat].height || 0;
        }

        bBox.height = totalHeightTaken + 2 * padding.v;
    };

    LegendCarpet.prototype.getLogicalSpace = function (options, recalculate) {
        var lSpace = this._lSpace,
            conf = this.conf,
            padding = conf.padding,
            compositionsByCategory = this.compositionsByCategory,
            composition,
            bBox,
            effectivePlotArea,
            compositionLSPace,
            compositionHeight = 0,
            componentsArea = { },
            category,
            compositionPlotArea,
            autoRecalculate,
            heightNotUsed = 0;

        if (lSpace && !recalculate) {
            lSpace.isImpure = true;
            // If logical space has already been calculated and recalculate flag is on, return without recalculating.
            return lSpace;
        } else {
            autoRecalculate = false;
        }

        lSpace = this._lSpace = bBox = this.getBoundingBox(options);

        if (isInvalid(lSpace.x) || isInvalid(lSpace.y) || isInvalid(lSpace.height) || isInvalid(lSpace.width)) {
            this.autoRecalculate = true;
        }

        // Copy the props
        effectivePlotArea = merge(bBox, {});

        // The logical rect inside which the composition are drawn
        effectivePlotArea.height -= 2 * padding.v;
        effectivePlotArea.width -= 2 * padding.h;
        effectivePlotArea.x += padding.h;
        effectivePlotArea.y += padding.v;

        for (category in compositionsByCategory) {
            composition = compositionsByCategory[category];

            compositionPlotArea = merge(effectivePlotArea, {});
            compositionPlotArea.y += compositionHeight;
            compositionHeight = effectivePlotArea.height * composition.conf.spreadFactor;
            compositionPlotArea.height = compositionHeight + heightNotUsed;

            compositionLSPace = composition.getLogicalSpace(merge(compositionPlotArea, {}), options, recalculate);

            heightNotUsed = compositionPlotArea.height - compositionLSPace.height;

            componentsArea[category] = compositionLSPace;

            compositionHeight = compositionLSPace.height;
        }

        this.getPostCalcDecisions(bBox, componentsArea);

        this._lSpace = bBox;
        return bBox;
    };

    LegendCarpet.prototype.setupDragging = function () {
        var group = this. group,
            dx = 0,
            dy = 0,
            idx = 0,
            idy = 0;

        group.css({cursor: 'move'});
        group.drag(function (_dx, _dy) {
            dx = _dx;
            dy = _dy;
            group.attr({
                transform: 't' + (idx + dx) + ',' + (idy + dy)
            });
        }, function () {
            idx += dx;
            idy += dy;
        }, function () { });
    };

    LegendCarpet.prototype.draw = function (options) {
        var conf = this.conf,
            compositionsByCategory = this.compositionsByCategory,
            paper = options.paper,
            parentGroup = options.parentGroup,
            componentPool = options.componentPool,
            chart = componentPool.getChart(),
            group,
            node,
            category,
            composition,
            lSpace,
            compositionRes,
            animDuration = chart.get('config', 'animationObj').duration,
            instanceFn,
            keys = componentPool.getKeys();

        this.getLogicalSpace(options, this.autoRecalculate);
        lSpace = this._lSpace;

        instanceFn = componentPool.getComponent(this._id, keys.KEY_GROUP);
        this.group = group = instanceFn(this.groupName, parentGroup);

        group.attr({
            opacity: 0
        });

        group.animate({
            opacity: 1
        }, animDuration, animType);

        // The main rect outside all the composition
        instanceFn = componentPool.getComponent(this._id, keys.KEY_RECT);
        this.node = node = instanceFn(group).attr(lSpace).css(conf.style);

        for (category in compositionsByCategory) {
            composition = compositionsByCategory[category];

            compositionRes = composition.draw(conf.captionAlignment, lSpace, {
                colorRange: options.colorRange,
                numberFormatter: options.numberFormatter,
                paper: paper,
                parentLayer: group,
                smartLabel: options.smartLabel,
                moveInstructions : this.moveInstructions[category],
                componentPool: options.componentPool
            });
        }

        conf.allowDrag && this.setupDragging();
        return this.node;
    };


    function VerticalLegendCarpet () {
        LegendCarpet.apply(this, arguments);
    }

    VerticalLegendCarpet.prototype = Object.create(LegendCarpet.prototype);
    VerticalLegendCarpet.prototype.constructor = VerticalLegendCarpet;

    VerticalLegendCarpet.prototype.getBoundingBox = function (options) {
        var conf = this.conf,
            spreadFactor = conf.spreadFactor,
            refSide = options.refSide,
            alignment = options.alignment,
            refOffset = options.refOffset,
            x = options.x,
            y = options.y,
            lHeight;


        lHeight = conf.height = refSide * spreadFactor;

        if (alignment && (y === undefined || y === null)) {
            y = ((refOffset + refSide) / 2) - lHeight / 2;
        }

        return {
            width: options.maxOtherSide,
            height: lHeight,
            x: x,
            y: y
        };
    };

    VerticalLegendCarpet.prototype.getPostCalcDecisions = function (bBox, componentsArea) {
        var conf = this.conf,
            padding = conf.padding,
            maxWidth = Number.NEGATIVE_INFINITY,
            width,
            cat,
            move = this.moveInstructions,
            diff;

        LegendCarpet.prototype.getPostCalcDecisions.apply(this, arguments);

        for (cat in componentsArea) {
            width = componentsArea[cat].width;
            maxWidth = maxWidth < width ? width : maxWidth;
        }

        bBox.width = maxWidth + 2 * padding.h;

        for (cat in componentsArea) {
            width = componentsArea[cat].width;
            if (diff = maxWidth - width) {
                move[cat] = 't' + diff / 2 + ',0';
            }
        }
    };

    function LegendCaption (text, conf) {
        this.rawText = text;
        this.conf = conf;
        this._id = 'GL_CAPTION';

        this.node = undefined;
        this.bound = undefined;
        this._lSpace = undefined;
    }

    LegendCaption.prototype.constructor = LegendCaption;

    LegendCaption.LEFT = {
        x: function (smartText, boundingBox) {
            return boundingBox.x + smartText.width / 2 + 2;
        }
    };

    LegendCaption.RIGHT = {
        x: function (smartText, boundingBox) {
            return boundingBox.x + boundingBox.width - smartText.width / 2 - 2;
        }
    };

    LegendCaption.CENTER = {
        x: function (smartText, boundingBox) {
            return boundingBox.x + (boundingBox.width / 2);
        }
    };

    LegendCaption.prototype.getLogicalSpace = function (bBox, options, recalculate) {
        var conf = this.conf,
            padding = conf.padding,
            lSpace = this._lSpace,
            text = this.rawText,
            componentPool = options.componentPool,
            chart = componentPool.getChart(),
            smartLabel,
            effectivePlotArea,
            smartText,
            copyOfStyle;

        if (lSpace && !recalculate) {
            lSpace.isImpure = true;
            // If logical space has already been calculated and recalculate flag is on, return without recalculating.
            return lSpace;
        }

        lSpace = this._lSpace = {
            bound: {
                height: 0,
                width: 0
            },

            node: {
                logicArea: undefined,
                smartText: undefined
            }
        };

        smartLabel = options.smartLabel;

        if (!text) {
            return lSpace.bound;
        }

        effectivePlotArea = merge(bBox, {});

        // The logical rect inside which the composition are drawn
        effectivePlotArea.height -= 2 * padding.v;
        effectivePlotArea.width -= 2 * padding.h;
        effectivePlotArea.x += padding.h;
        effectivePlotArea.y += padding.v;

        smartLabel.useEllipsesOnOverflow(chart.config.useEllipsesWhenOverflow);
        copyOfStyle = merge(this.conf.style, {});
        normalizeFontSizeAppend(copyOfStyle);

        smartLabel.setStyle(this._metaStyle = copyOfStyle);
        smartText = smartLabel.getSmartText(text, effectivePlotArea.width, effectivePlotArea.height);

        effectivePlotArea.height = smartText.height;
        effectivePlotArea.width = smartText.width;

        bBox.height = smartText.height + 2 * padding.v;
        bBox.width = smartText.width + 2 * padding.h;

        lSpace.node.smartText = smartText;
        lSpace.node.logicArea = effectivePlotArea;
        lSpace.bound = bBox;

        return bBox;
    };

    LegendCaption.prototype.draw = function () {
        var conf = this.conf,
            smartLabel,
            paper,
            layer,
            boundAttr = conf.bound || {},
            group,
            bound,
            instanceFn,
            boundingArea,
            lSpace,
            normalizedX,
            x,
            bBox,
            options,
            node,
            componentPool,
            keys;

        if (arguments.length >= 3) {
            x = arguments[0];
            bBox = arguments[1];
            options = arguments[2];
        } else if (arguments.length >= 2){
            x = arguments[0];
            options = arguments[1];
        }

        smartLabel = options.smartLabel;
        paper = options.paper;
        layer = options.parentLayer;
        componentPool = options.componentPool;
        keys = componentPool.getKeys();

        // Separate group for caption and the bounding rect
        instanceFn = componentPool.getComponent(this._id, keys.KEY_GROUP);
        this.group = group = instanceFn('legend-caption', layer).css(conf.style);

        //group = paper.group('legend-caption', layer);

        this.getLogicalSpace(bBox, options);
        lSpace = this._lSpace;

        node = lSpace.node;
        boundingArea = lSpace.bound;

        // Bounding rect
        instanceFn = componentPool.getComponent(this._id, keys.KEY_RECT);
        this.bound = bound = instanceFn(group).attr(boundingArea).css(boundAttr.style);
        //bound = this.bound = paper.rect(boundingArea, group).css(boundAttr.style);

        normalizedX = typeof x === 'string' ? LegendCaption[x.toUpperCase()].x(node.smartText, bBox || node.logicArea)
            : x;

        instanceFn = componentPool.getComponent(this._id, keys.KEY_TEXT);
        this.node = instanceFn({ }, group).attr({
                text: node.smartText.text,
                x: normalizedX,
                y: node.logicArea.y + (node.smartText.height / 2),
                lineHeight: this._metaStyle.lineHeight,
                fill: conf.style.fill
            });

        return {
            group: group,
            bound: bound,
            node: this.node
        };
    };



    function LegendBody (colorRange, conf, childTextConf) {
        this.colorRange = colorRange;
        this.conf = conf;
        this.childTextConf = childTextConf;
        this._id = 'GL_BODY';

        this.bound = undefined;
        this.compositionsByCategory = {};
        this._lSpace = undefined;
    }

    // Space calculation order
    LegendBody.SC_STACK = [
        compositionKeys.AXIS_LABEL,
        compositionKeys.LEGEND_AXIS,
        compositionKeys.AXIS_VALUE
    ];

    LegendBody.DARW_STACK = [
        compositionKeys.AXIS_VALUE,
        compositionKeys.LEGEND_AXIS,
        compositionKeys.AXIS_LABEL
    ];

    LegendBody.prototype.constructor = LegendBody;

    LegendBody.prototype.addCompositions = function (instance, category) {
        this.compositionsByCategory[category] = instance;
    };

    LegendBody.prototype.getCompositionPlotAreaFor = function (effectivePlotArea) {
        var plotArea;

        plotArea = merge(effectivePlotArea, {});

        return function (compositionAreaOffset, sf) {
            compositionAreaOffset = compositionAreaOffset || {};

            plotArea.y += compositionAreaOffset.height || 0;
            plotArea.height = effectivePlotArea.height * sf;

            return plotArea;
        };
    };

    LegendBody.prototype.getSpaceTaken = function (spaceObj) {
        return spaceObj.height;
    };

    LegendBody.prototype.updateEffectivePlotArea = function (bBox, effectivePlotArea, val) {
        var conf = this.conf,
            padding = conf.padding;

        effectivePlotArea.height = val;
        bBox.height = val + 2 * padding.v;
    };

    LegendBody.prototype.getLogicalSpace = function (bBox, options, recalculate) {
        var lSpace = this._lSpace,
            conf = this.conf,
            padding = conf.padding,
            compositionsByCategory = this.compositionsByCategory,
            composition,
            compositionPlotArea,
            compositionAreaOffset,
            effectivePlotArea,
            getCompositionPlotArea,
            spaceTaken = 0,
            index,
            length;

        if (lSpace && !recalculate) {
            lSpace.isImpure = true;
            // If logical space has already been calculated and recalculate flag is on, return without recalculating.
            return lSpace;
        }

        lSpace = this._lSpace = {
            bound: {
                height: 0,
                width: 0
            },

            node: {
                logicArea: undefined
            }
        };

        effectivePlotArea = merge(bBox, {});

        // The logical rect inside which the composition are drawn
        effectivePlotArea.height -= 2 * padding.v;
        effectivePlotArea.width -= 2 * padding.h;
        effectivePlotArea.x += padding.h;
        effectivePlotArea.y += padding.v;

        getCompositionPlotArea = this.getCompositionPlotAreaFor(effectivePlotArea);

        options.colorRange = this.colorRange;

        for (index = 0, length = LegendBody.SC_STACK.length; index < length; index++) {
            if (!(composition = compositionsByCategory[LegendBody.SC_STACK[index]])) {
                continue;
            }

            compositionPlotArea = getCompositionPlotArea(compositionAreaOffset, composition.conf.spreadFactor);
            compositionAreaOffset = composition.getLogicalSpace(merge(compositionPlotArea, {}), options, recalculate);

            spaceTaken += this.getSpaceTaken(compositionAreaOffset);
        }

        this.updateEffectivePlotArea(bBox, effectivePlotArea, spaceTaken);

        lSpace.node.logicArea = effectivePlotArea;
        lSpace.bound = bBox;

        return bBox;
    };

    LegendBody.prototype.draw = function () {
        var childTextConf = this.childTextConf,
            conf = this.conf,
            boundStyle = conf.bound.style || {},
            compositionsByCategory = this.compositionsByCategory,
            paper,
            layer,
            bound,
            colorRange,
            composition,
            legendBodyGroup,
            bBox,
            componentPool,
            lSpace,
            x,
            options,
            index,
            length,
            instanceFn,
            keys;


        if (arguments.length >= 3) {
            x = arguments[0];
            bBox = arguments[1];
            options = arguments[2];
        } else if (arguments.length >= 2){
            x = arguments[0];
            options = arguments[1];
        }

        paper = options.paper;
        layer = options.parentLayer;
        colorRange = options.colorRange;
        componentPool = options.componentPool;
        keys = componentPool.getKeys();

        this.getLogicalSpace(bBox, options);
        lSpace = this._lSpace;
        // debugger
        instanceFn = componentPool.getComponent(this._id, keys.KEY_GROUP);
        legendBodyGroup = instanceFn('legend-body', layer).attr({
            transform: 't0,0'
        }).css(childTextConf.style);
        //legendBodyGroup = paper.group('legend-body', layer);

        instanceFn = componentPool.getComponent(this._id, keys.KEY_RECT);
        this.bound = bound = instanceFn(legendBodyGroup).attr(lSpace.bound).css(boundStyle);
        //bound = this.bound = paper.rect(lSpace.bound, legendBodyGroup).css(boundStyle);


        options.colorRange = this.colorRange;
        options.parentLayer = legendBodyGroup;
        for (index = 0, length = LegendBody.DARW_STACK.length; index < length; index++) {
            if (!(composition = compositionsByCategory[LegendBody.DARW_STACK[index]])) {
                continue;
            }

            composition.draw(options);
        }

        if (options.moveInstructions) {
            legendBodyGroup.attr({
                transform: options.moveInstructions
            });
        }

        return {
            bound: bound,
            group: legendBodyGroup
        };
    };

    function VerticalLegendBody () {
        LegendBody.apply(this, arguments);
    }

    VerticalLegendBody.prototype = Object.create(LegendBody.prototype);
    VerticalLegendBody.prototype.constructor = VerticalLegendBody;

    VerticalLegendBody.prototype.getCompositionPlotAreaFor = function (effectivePlotArea) {
        var plotArea;

        plotArea = merge(effectivePlotArea, {});

        return function (compositionAreaOffset, sf) {
            compositionAreaOffset = compositionAreaOffset || {};

            plotArea.x += compositionAreaOffset.width || 0;
            plotArea.width = effectivePlotArea.width * sf;

            return plotArea;
        };
    };

    VerticalLegendBody.prototype.updateEffectivePlotArea = function (bBox, effectivePlotArea, val) {
        var conf = this.conf,
            padding = conf.padding;

        effectivePlotArea.width = val;
        bBox.width = val + 2 * padding.h;
    };

    VerticalLegendBody.prototype.getSpaceTaken = function (spaceObj) {
        return spaceObj.width;
    };

    function LegendLabels(conf) {
        this.conf = conf;
        this._id = 'GL_LABELS';
    }

    LegendLabels.prototype.constructor = LegendLabels;

    LegendLabels.prototype.getEffectivePlotArea = function (area) {
        var conf = this.conf,
            padding = conf.padding;

        // The logical rect inside which the composition are drawn
        area.height -= 2 * padding.v;
        area.width -= 2 * padding.h;
        area.x += padding.h;
        area.y += padding.v;
        this.node = [];

        return area;
    };

    LegendLabels.prototype.getLogicalSpace = function (bBox, options, recalculate) {
        var lSpace = this._lSpace,
            conf = this.conf,
            padding = conf.padding,
            cRange,
            smartLabel,
            crDataObj,
            index,
            length,
            labelHeights = [],
            leftBound,
            rightBound,
            plotArea,
            label,
            valueRatio,
            stop,
            zerothStop,
            lsTexts,
            maxHeight,
            effectivePlotArea,
            testSmartLabel,
            noOfLabels = 0,
            nextRefPoint,
            currPoint,
            leftStop,
            smartText,
            ni,
            copyOfStyle,
            componentPool = options.componentPool,
            chart = componentPool.getChart(),
            normalizedDataArr = [];

        if (lSpace && !recalculate) {
            lSpace.isImpure = true;
            // If logical space has already been calculated and recalculate flag is on, return without recalculating.
            return lSpace;
        }

        cRange = options.colorRange;
        smartLabel = options.smartLabel;
        valueRatio = cRange.getCumulativeValueRatio();
        crDataObj = cRange.colorRange;

        lSpace = this._lSpace = {
            bound: {
                height: 0,
                width: 0
            },

            node: {
                logicArea: undefined,
                smartTexts: []
            }
        };

        lsTexts = lSpace.node.smartTexts;

        plotArea = merge(bBox, {});

        // The logical rect inside which the composition are drawn
        effectivePlotArea = this.getEffectivePlotArea(plotArea);

        smartLabel.useEllipsesOnOverflow(chart.config.useEllipsesWhenOverflow);
        copyOfStyle = merge(conf.style, {});
        normalizeFontSizeAppend(this._metaStyle = copyOfStyle);

        smartLabel.setStyle(copyOfStyle);
        testSmartLabel = smartLabel.getSmartText('W');

        for (index = 0, length = crDataObj.length; index < length; index++) {
            label = crDataObj[index].label;

            if (!label) {
                lsTexts[index] = undefined;
                continue;
            }

            noOfLabels++;
            normalizedDataArr.push({
                oriIndex: index,
                label: label
            });
        }

        length = normalizedDataArr.length;

        if (length === 0) {
            return {
                height: 0,
                width: 0
            };
        }

        if (length > 1) {
            stop = ((valueRatio[normalizedDataArr[length - 1].oriIndex] -
                valueRatio[normalizedDataArr[0].oriIndex]) / 2) * effectivePlotArea.width / 100;
        } else {
            stop = Math.max(valueRatio[normalizedDataArr[0].oriIndex], 100 -
                valueRatio[normalizedDataArr[0].oriIndex]) / 2 * effectivePlotArea.width / 100;
        }

        zerothStop = stop;

        // first scale Label
        smartText = smartLabel.getSmartText(normalizedDataArr[0].label, zerothStop, effectivePlotArea.height);
        smartText.x = valueRatio[normalizedDataArr[0].oriIndex] * effectivePlotArea.width / 100;
        leftBound = smartText.x + smartText.width;
        labelHeights.push(smartText.height);
        lsTexts[normalizedDataArr[0].oriIndex] = smartText;

        //last scale label
        smartText = smartLabel.getSmartText(normalizedDataArr[length - 1].label,
            zerothStop, effectivePlotArea.height);
        smartText.x = valueRatio[normalizedDataArr[length - 1].oriIndex] * effectivePlotArea.width / 100;
        rightBound = smartText.x - smartText.width;
        labelHeights.push(smartText.height);
        lsTexts[normalizedDataArr[length - 1].oriIndex] = smartText;

        leftStop = leftBound;
        for (index = 1; index < length - 1; index++) {
            label = normalizedDataArr[index].label;
            ni = normalizedDataArr[index].oriIndex;

            smartText = undefined;

            nextRefPoint = index + 1 === length - 1 ? rightBound : valueRatio[normalizedDataArr[index + 1].oriIndex] *
                effectivePlotArea.width / 100;

            currPoint = valueRatio[normalizedDataArr[index].oriIndex] * effectivePlotArea.width / 100;

            stop = Math.min(currPoint - leftStop, nextRefPoint - currPoint);

            if (stop > 2 * testSmartLabel.width) {
                smartText = smartLabel.getSmartText(label, stop, effectivePlotArea.height);
                smartText.x = valueRatio[ni] * effectivePlotArea.width / 100;

                leftStop = stop;
                labelHeights.push(smartText.height);
            }

            lsTexts[normalizedDataArr[index].oriIndex] = smartText;
        }

        maxHeight = Math.max.apply(Math, labelHeights);

        effectivePlotArea.height = maxHeight;
        bBox.height = maxHeight + 2 * padding.v;

        lSpace.node.logicArea = effectivePlotArea;
        lSpace.bound = bBox;

        return bBox;
    };

    LegendLabels.prototype.draw = function () {
        var paper,
            layer,
            bound,
            conf = this.conf,
            boundStyle = conf.bound && conf.bound.style || {
                stroke: 'none'
            },
            cRange,
            componentPool,
            legendLabelsGroup,
            bBox,
            smartText,
            lSpace,
            crDataObj,
            valueRatio,
            options,
            index,
            logicArea,
            lsTexts,
            length,
            pos = {},
            instanceFn,
            keys;


        if (arguments.length >= 2) {
            bBox = arguments[0];
            options = arguments[1];
        } else if (arguments.length >= 1){
            options = arguments[0];
        }

        paper = options.paper;
        layer = options.parentLayer;
        cRange = options.colorRange;
        valueRatio = cRange.getCumulativeValueRatio();
        crDataObj = cRange.colorRange;
        componentPool = options.componentPool;
        keys = componentPool.getKeys();

        this.getLogicalSpace(bBox, options);
        lSpace = this._lSpace;
        logicArea = lSpace.node.logicArea;
        lsTexts = lSpace.node.smartTexts;

        instanceFn = componentPool.getComponent(this._id, keys.KEY_GROUP);
        legendLabelsGroup = instanceFn('legend-labels', layer);

        instanceFn = componentPool.getComponent(this._id, keys.KEY_RECT);
        this.bound = bound = instanceFn(legendLabelsGroup).attr(lSpace.bound).css(boundStyle);

        // legendLabelsGroup.transform('R0');


        instanceFn = componentPool.getComponent(this._id, keys.KEY_TEXT, true);
        for (index = 0, length = lsTexts.length; index < length; index++) {
            smartText = lsTexts[index];

            if (!smartText) {
                continue;
            }

            pos.y = logicArea.y + smartText.height / 2;

            if (index === length - 1) {
                pos.x = logicArea.x + smartText.x - smartText.width / 2;
            } else if (index){
                pos.x = logicArea.x + smartText.x;
            } else {
                pos.x = logicArea.x + smartText.x + smartText.width / 2;
            }

            this.node.push(instanceFn({}, legendLabelsGroup).attr({
                text: smartText.text,
                x: pos.x,
                y: pos.y,
                lineHeight: this._metaStyle.lineHeight,
                fill: conf.style.fill
            }).transform('R0'));
        }

        return {
            group: legendLabelsGroup,
            bound: bound,
            node: this.node
        };
    };

    function VerticalLegendLabels () {
        LegendLabels.apply(this, arguments);
    }

    VerticalLegendLabels.prototype = Object.create(LegendLabels.prototype);
    VerticalLegendLabels.prototype.constructor = VerticalLegendLabels;

    VerticalLegendLabels.prototype.getLogicalSpace = function (bBox, options, recalculate) {
        var lSpace = this._lSpace,
            conf = this.conf,
            padding = conf.padding,
            cRange,
            smartLabel,
            crDataObj,
            index,
            length,
            labelHeights = [],
            leftBound,
            rightBound,
            plotArea,
            label,
            valueRatio,
            stop,
            zerothStop,
            lsTexts,
            maxHeight,
            effectivePlotArea,
            testSmartLabel,
            noOfLabels = 0,
            nextRefPoint,
            currPoint,
            leftStop,
            smartText,
            ni,
            copyOfStyle,
            componentPool = options.componentPool,
            chart = componentPool.getChart(),
            normalizedDataArr = [];

        if (lSpace && !recalculate) {
            lSpace.isImpure = true;
            // If logical space has already been calculated and recalculate flag is on, return without recalculating.
            return lSpace;
        }

        cRange = options.colorRange;
        smartLabel = options.smartLabel;
        valueRatio = cRange.getCumulativeValueRatio();
        crDataObj = cRange.colorRange;

        lSpace = this._lSpace = {
            bound: {
                height: 0,
                width: 0
            },

            node: {
                logicArea: undefined,
                smartTexts: []
            }
        };

        lsTexts = lSpace.node.smartTexts;

        plotArea = merge(bBox, {});

        // The logical rect inside which the composition are drawn
        effectivePlotArea = this.getEffectivePlotArea(plotArea);

        smartLabel.useEllipsesOnOverflow(chart.config.useEllipsesWhenOverflow);
        copyOfStyle = merge(conf.style, {});
        normalizeFontSizeAppend(this._metaStyle = copyOfStyle);

        smartLabel.setStyle(copyOfStyle);
        testSmartLabel = smartLabel.getSmartText('W');

        for (index = 0, length = crDataObj.length; index < length; index++) {
            label = crDataObj[index].label;

            if (!label) {
                lsTexts[index] = undefined;
                continue;
            }

            noOfLabels++;
            normalizedDataArr.push({
                oriIndex: index,
                label: label
            });
        }

        length = normalizedDataArr.length;

        if (length === 0) {
            return {
                height: 0,
                width: 0
            };
        }

        if (length > 1) {
            stop = ((valueRatio[normalizedDataArr[length - 1].oriIndex] -
                valueRatio[normalizedDataArr[0].oriIndex]) / 2) * effectivePlotArea.height / 100;
        } else {
            stop = Math.max(valueRatio[normalizedDataArr[0].oriIndex], 100 -
                valueRatio[normalizedDataArr[0].oriIndex]) / 2 * effectivePlotArea.height / 100;
        }

        zerothStop = stop;

        // first scale Label
        smartText = smartLabel.getSmartText(normalizedDataArr[0].label, zerothStop, effectivePlotArea.width);
        smartText.y = valueRatio[normalizedDataArr[0].oriIndex] * effectivePlotArea.height / 100;
        leftBound = smartText.y + smartText.width;
        labelHeights.push(smartText.height);
        lsTexts[normalizedDataArr[0].oriIndex] = smartText;

        //last scale label
        smartText = smartLabel.getSmartText(normalizedDataArr[length - 1].label, zerothStop, effectivePlotArea.width);
        smartText.y = valueRatio[normalizedDataArr[length - 1].oriIndex] * effectivePlotArea.height / 100;
        rightBound = smartText.y - smartText.width;
        labelHeights.push(smartText.height);
        lsTexts[normalizedDataArr[length - 1].oriIndex] = smartText;

        leftStop = leftBound;
        for (index = 1; index < length - 1; index++) {
            label = normalizedDataArr[index].label;
            ni = normalizedDataArr[index].oriIndex;

            smartText = undefined;

            nextRefPoint = index + 1 === length - 1 ? rightBound : valueRatio[normalizedDataArr[index + 1].oriIndex] *
                effectivePlotArea.height / 100;

            currPoint = valueRatio[normalizedDataArr[index].oriIndex] * effectivePlotArea.height / 100;

            stop = Math.min(currPoint - leftStop, nextRefPoint - currPoint);

            if (stop > 2 * testSmartLabel.width) {
                smartText = smartLabel.getSmartText(label, stop, effectivePlotArea.width);
                smartText.y = valueRatio[ni] * effectivePlotArea.height / 100;

                leftStop = stop;
                labelHeights.push(smartText.height);
            }

            lsTexts[normalizedDataArr[index].oriIndex] = smartText;
        }

        maxHeight = Math.max.apply(Math, labelHeights);

        effectivePlotArea.width = maxHeight;
        bBox.width = maxHeight + 2 * padding.v;

        lSpace.node.logicArea = effectivePlotArea;
        lSpace.bound = bBox;

        return bBox;
    };

    VerticalLegendLabels.prototype.draw = function () {
        var paper,
            layer,
            bound,
            conf = this.conf,
            boundStyle = conf.bound && conf.bound.style || {
                stroke: 'none'
            },
            cRange,
            componentPool,
            legendLabelsGroup,
            bBox,
            smartText,
            lSpace,
            crDataObj,
            valueRatio,
            options,
            index,
            logicArea,
            lsTexts,
            length,
            pos = {},
            instanceFn,
            keys;


        if (arguments.length >= 2) {
            bBox = arguments[0];
            options = arguments[1];
        } else if (arguments.length >= 1){
            options = arguments[0];
        }

        paper = options.paper;
        layer = options.parentLayer;
        cRange = options.colorRange;
        valueRatio = cRange.getCumulativeValueRatio();
        crDataObj = cRange.colorRange;
        componentPool = options.componentPool;
        keys = componentPool.getKeys();

        this.getLogicalSpace(bBox, options);
        lSpace = this._lSpace;
        logicArea = lSpace.node.logicArea;
        lsTexts = lSpace.node.smartTexts;

        instanceFn = componentPool.getComponent(this._id, keys.KEY_GROUP);
        legendLabelsGroup = instanceFn('legend-labels', layer);

        instanceFn = componentPool.getComponent(this._id, keys.KEY_RECT);
        this.bound = bound = instanceFn(legendLabelsGroup).attr(lSpace.bound).css(boundStyle);

        instanceFn = componentPool.getComponent(this._id, keys.KEY_TEXT, true);
        for (index = 0, length = lsTexts.length; index < length; index++) {
            smartText = lsTexts[index];

            if (!smartText) {
                continue;
            }

            pos.x = logicArea.x + smartText.height / 2;

            if (index === length - 1) {
                pos.y = logicArea.y + smartText.y - smartText.width / 2;
            } else if (index){
                pos.y = logicArea.y + smartText.y;
            } else {
                pos.y = logicArea.y + smartText.y + smartText.width / 2;
            }

            this.node.push(instanceFn({}, legendLabelsGroup).attr({
                text: smartText.text,
                x: pos.x,
                y: pos.y,
                lineHeight: this._metaStyle.lineHeight,
                fill: conf.style.fill
            }).transform('R270,' + pos.x + ',' + pos.y));
        }

        return {
            group: legendLabelsGroup,
            bound: bound,
            node: this.node
        };
    };




    function LegendValues () {
        LegendLabels.apply(this, arguments);
        this._id = 'GL_VALUES';
    }

    LegendValues.prototype = Object.create(LegendLabels.prototype);
    LegendValues.prototype.constructor = LegendValues;

    LegendValues.prototype.getLogicalSpace = function (bBox, options, recalculate) {
        var lSpace = this._lSpace,
            conf = this.conf,
            padding = conf.padding,
            componentPool = options.componentPool,
            chart = componentPool.getChart(),
            cRange,
            smartLabel,
            crDataObj,
            smartText,
            index,
            length,
            valueRatio,
            stop,
            nextRefPoint,
            currPoint,
            zerothStop,
            labelHeights = [],
            leftBound,
            leftStop,
            rightBound,
            maxHeight,
            effectivePlotArea,
            val,
            dispValue,
            testSmartLabel,
            copyOfStyle,
            lsTexts;

        if (lSpace && !recalculate) {
            lSpace.isImpure = true;
            // If logical space has already been calculated and recalculate flag is on, return without recalculating.
            return lSpace;
        }

        cRange = options.colorRange;
        smartLabel = options.smartLabel;
        crDataObj = cRange.colorRange;
        valueRatio = cRange.getCumulativeValueRatio();

        lSpace = this._lSpace = {
            bound: {
                height: 0,
                width: 0
            },

            node: {
                logicArea: undefined,
                smartTexts: []
            }
        };

        lsTexts = lSpace.node.smartTexts;
        effectivePlotArea = merge(bBox, {});

        // The logical rect inside which the composition are drawn
        effectivePlotArea.height -= 2 * padding.v;
        effectivePlotArea.width -= 2 * padding.h;
        effectivePlotArea.x += padding.h;
        effectivePlotArea.y += padding.v;

        smartLabel.useEllipsesOnOverflow(chart.config.useEllipsesWhenOverflow);
        copyOfStyle = merge(conf.style, {});
        normalizeFontSizeAppend(this._metaStyle = copyOfStyle);

        smartLabel.setStyle(copyOfStyle);
        testSmartLabel = smartLabel.getSmartText('W');

        length = crDataObj.length;
        zerothStop = stop = ((valueRatio[length - 1] - valueRatio[0]) / 2) * effectivePlotArea.width / 100;

        // first scale Label
        dispValue = crDataObj[0].displayValue;
        smartText = smartLabel.getSmartText((typeof dispValue !== 'string' && dispValue !== undefined) &&
            dispValue.toString() || dispValue, zerothStop, effectivePlotArea.height);
        smartText.x = valueRatio[0] * effectivePlotArea.width / 100;
        leftBound = smartText.x + smartText.width;
        labelHeights.push(smartText.height);
        lsTexts[0] = smartText;

        //last scale label
        smartText = smartLabel.getSmartText(crDataObj[length - 1].displayValue,
            zerothStop, effectivePlotArea.height);
        smartText.x = valueRatio[length - 1] * effectivePlotArea.width / 100;
        rightBound = smartText.x - smartText.width;
        labelHeights.push(smartText.height);
        lsTexts[length - 1] = smartText;

        leftStop = leftBound;
        for (index = 1; index < length - 1; index++) {
            smartText = undefined;

            val = crDataObj[index].displayValue;

            nextRefPoint = index + 1 === length - 1 ? rightBound : valueRatio[index + 1] *
                effectivePlotArea.width / 100;
            currPoint = valueRatio[index] * effectivePlotArea.width / 100;

            stop = Math.min(currPoint - leftStop, nextRefPoint - currPoint);

            if (stop > 1.5 * testSmartLabel.width) {
                smartText = smartLabel.getSmartText(val, 2 * stop, effectivePlotArea.height);
                smartText.x = valueRatio[index] * effectivePlotArea.width / 100;
                leftStop = stop;
                labelHeights.push(smartText.height);
            }

            lsTexts[index] = smartText;
        }

        maxHeight = Math.max.apply(Math, labelHeights);

        effectivePlotArea.height = maxHeight;
        bBox.height = maxHeight + 2 * padding.v;

        lSpace.node.logicArea = effectivePlotArea;
        lSpace.bound = bBox;

        return bBox;
    };

    LegendValues.prototype.draw = function () {
        var conf = this.conf,
            boundStyle = conf.bound && conf.bound.style || {
                stroke: 'none'
            },
            keys,
            pos = {},
            paper,
            layer,
            bound,
            legendValuesGroup,
            componentPool,
            bBox,
            lSpace,
            smartLabel,
            logicArea,
            options,
            cRange,
            valueRatio,
            index,
            length,
            smartTexts,
            smartText,
            instanceFn,
            numberFormatter;


        if (arguments.length >= 2) {
            bBox = arguments[0];
            options = arguments[1];
        } else if (arguments.length >= 1){
            options = arguments[0];
        }

        paper = options.paper;
        layer = options.parentLayer;
        smartLabel = options.smartLabel,
        cRange = options.colorRange;
        numberFormatter = options.numberFormatter,
        valueRatio = cRange.getCumulativeValueRatio();
        componentPool = options.componentPool;
        keys = componentPool.getKeys();

        this.getLogicalSpace(bBox, options);
        lSpace = this._lSpace;
        logicArea = lSpace.node.logicArea;
        smartTexts = lSpace.node.smartTexts;

        instanceFn = componentPool.getComponent(this._id, keys.KEY_GROUP);
        legendValuesGroup = instanceFn('legend-values', layer);

        instanceFn = componentPool.getComponent(this._id, keys.KEY_RECT);
        this.bound = bound = instanceFn(legendValuesGroup).attr(lSpace.bound).css(boundStyle);

        instanceFn = componentPool.getComponent(this._id, keys.KEY_TEXT, true);
        for (index = 0, length = valueRatio.length; index < length; index++) {
            smartText = smartTexts[index];

            if (!smartText) {
                continue;
            }

            pos.y = logicArea.y + smartText.height / 2;

            if (index === length - 1) {
                pos.x = logicArea.x + smartText.x - smartText.width / 2;
            } else if (index){
                pos.x = logicArea.x + smartText.x;
            } else {
                pos.x = logicArea.x + smartText.x + smartText.width / 2;
            }

            instanceFn({}, legendValuesGroup).attr({
                text: smartText.text,
                x: pos.x,
                y: pos.y,
                lineHeight: this._metaStyle.lineHeight,
                fill: conf.style.fill
            });

        }

        return {
            group: legendValuesGroup,
            bound: bound
        };
    };


    function VerticalLegendValues () {
        LegendValues.apply(this, arguments);
        this._id = 'GL_VALUES';
    }

    VerticalLegendValues.prototype = Object.create(LegendValues.prototype);
    VerticalLegendValues.prototype.constructor = VerticalLegendValues;

    VerticalLegendValues.prototype.getLogicalSpace = function (bBox, options, recalculate) {
        var lSpace = this._lSpace,
            conf = this.conf,
            padding = conf.padding,
            componentPool = options.componentPool,
            chart = componentPool.getChart(),
            cRange,
            smartLabel,
            crDataObj,
            smartText,
            index,
            length,
            valueRatio,
            stop,
            nextRefPoint,
            currPoint,
            effectivePlotArea,
            zerothStop,
            labelWidths = [],
            topBound,
            topStop,
            maxWidth,
            bottomBound,
            val,
            copyOfStyle,
            testSmartLabel,
            lsTexts;

        if (lSpace && !recalculate) {
            lSpace.isImpure = true;
            // If logical space has already been calculated and recalculate flag is on, return without recalculating.
            return lSpace;
        }

        cRange = options.colorRange;
        smartLabel = options.smartLabel;
        crDataObj = cRange.colorRange;
        valueRatio = cRange.getCumulativeValueRatio();

        lSpace = this._lSpace = {
            bound: {
                height: 0,
                width: 0
            },

            node: {
                logicArea: undefined,
                smartTexts: []
            }
        };

        lsTexts = lSpace.node.smartTexts;
        effectivePlotArea = merge(bBox, {});

        // The logical rect inside which the composition are drawn
        effectivePlotArea.height -= 2 * padding.v;
        effectivePlotArea.width -= 2 * padding.h;
        effectivePlotArea.x += padding.h;
        effectivePlotArea.y += padding.v;

        smartLabel.useEllipsesOnOverflow(chart.config.useEllipsesWhenOverflow);
        copyOfStyle = merge(conf.style, {});
        normalizeFontSizeAppend(copyOfStyle);

        smartLabel.setStyle(this._metaStyle = copyOfStyle);
        testSmartLabel = smartLabel.getSmartText('W');

        length = crDataObj.length;
        zerothStop = stop = ((valueRatio[length - 1] - valueRatio[0]) / 2) * effectivePlotArea.height / 100;

        // first scale Label
        smartText = smartLabel.getSmartText(crDataObj[0].displayValue,
                    effectivePlotArea.width, zerothStop);
        smartText.y = valueRatio[0] * effectivePlotArea.height / 100;
        topBound = smartText.y + smartText.width;
        labelWidths.push(smartText.width);
        lsTexts[0] = smartText;

        //last scale label
        smartText = smartLabel.getSmartText(crDataObj[length - 1].displayValue,
            effectivePlotArea.width, zerothStop);
        smartText.y = valueRatio[length - 1] * effectivePlotArea.height / 100;
        bottomBound = smartText.y - smartText.height;
        labelWidths.push(smartText.width);
        lsTexts[length - 1] = smartText;

        topStop = topBound;
        for (index = 1; index < length - 1; index++) {
            smartText = undefined;

            val = crDataObj[index].displayValue;

            nextRefPoint = index + 1 === length - 1 ? bottomBound : valueRatio[index + 1] *
                effectivePlotArea.height / 100;
            currPoint = valueRatio[index] * effectivePlotArea.height / 100;

            stop = Math.min(currPoint - topStop, nextRefPoint - currPoint);

            if (stop > 2 * testSmartLabel.height) {
                smartText = smartLabel.getSmartText(val, effectivePlotArea.width, 2 * stop);
                smartText.y = valueRatio[index] * effectivePlotArea.height / 100;

                topStop = stop;
                labelWidths.push(smartText.width);
            }

            lsTexts[index] = smartText;
        }

        maxWidth = Math.max.apply(Math, labelWidths);

        effectivePlotArea.width = maxWidth;
        bBox.width = maxWidth + 2 * padding.h;

        lSpace.node.logicArea = effectivePlotArea;
        lSpace.bound = bBox;

        return bBox;
    };

    VerticalLegendValues.prototype.draw = function () {
        var paper,
            layer,
            bound,
            conf = this.conf,
            boundStyle = conf.bound && conf.bound.style || {
                stroke: 'none'
            },
            legendValuesGroup,
            bBox,
            lSpace,
            smartLabel,
            logicArea,
            options,
            cRange,
            valueRatio,
            smartTexts,
            smartText,
            index,
            length,
            pos = {},
            componentPool,
            instanceFn,
            keys;


        if (arguments.length >= 2) {
            bBox = arguments[0];
            options = arguments[1];
        } else if (arguments.length >= 1){
            options = arguments[0];
        }

        paper = options.paper;
        layer = options.parentLayer;
        smartLabel = options.smartLabel,
        cRange = options.colorRange;
        valueRatio = cRange.getCumulativeValueRatio();
        componentPool = options.componentPool;
        keys = componentPool.getKeys();

        this.getLogicalSpace(bBox, options);
        lSpace = this._lSpace;
        logicArea = lSpace.node.logicArea;
        smartTexts = lSpace.node.smartTexts;

        instanceFn = componentPool.getComponent(this._id, keys.KEY_GROUP);
        legendValuesGroup = instanceFn('legend-values', layer);

        instanceFn = componentPool.getComponent(this._id, keys.KEY_RECT);
        this.bound = bound = instanceFn(legendValuesGroup).attr(lSpace.bound).css(boundStyle);

        instanceFn = componentPool.getComponent(this._id, keys.KEY_TEXT, true);
        for (index = 0, length = valueRatio.length; index < length; index++) {
            smartText = smartTexts[index];

            if (!smartText) {
                continue;
            }

            pos.x = logicArea.x + smartText.width / 2;

            if (index === length - 1) {
                pos.y = logicArea.y + smartText.y - smartText.height / 2;
            } else if (index){
                pos.y = logicArea.y + smartText.y;
            } else {
                pos.y = logicArea.y + smartText.y + smartText.height / 2;
            }

            instanceFn({ }, legendValuesGroup).attr({
                text: smartText.text,
                x: pos.x,
                y: pos.y,
                lineHeight: this._metaStyle.lineHeight,
                fill: conf.style.fill
            });

        }

        return {
            group: legendValuesGroup,
            bound: bound
        };
    };

    function LegendAxis (conf) {
        this.conf = conf;
        this._id = 'FL_AXIS';

        this.node = undefined;
        this.shadow = undefined;
        this.markerLine = undefined;
        this.compositionsByCategory = {};
    }

    LegendAxis.prototype.constructor = LegendAxis;

    LegendAxis.prototype.addCompositions = function (instance, category) {
        this.compositionsByCategory[category] = instance;
    };

    LegendAxis.prototype.getLogicalSpace = function (bBox, options, recalculate) {
        var lSpace = this._lSpace,
            conf = this.conf,
            padding = conf.padding,
            heightTakenLower,
            heightTakenUpper,
            heightTaken,
            axisThickness = conf.legendAxisHeight,
            compositionsByCategory = this.compositionsByCategory,
            sliderG,
            effectivePlotArea,
            slider,
            sliderSpace,
            sliderExtraDiam = 0;

        if (lSpace && !recalculate) {
            lSpace.isImpure = true;
            // If logical space has already been calculated and recalculate flag is on, return without recalculating.
            return lSpace;
        }

        lSpace = this._lSpace = {
            bound: {
                height: 0,
                width: 0
            },

            node: {
                logicArea: undefined
            }
        };

        effectivePlotArea = merge(bBox, {});

        // The logical rect inside which the composition are drawn
        effectivePlotArea.height -= 2 * padding.v;
        effectivePlotArea.width -= 2 * padding.h;
        effectivePlotArea.x += padding.h;
        effectivePlotArea.y += padding.v;

        heightTakenLower = (axisThickness / 2) + conf.line.offset;
        heightTakenUpper = axisThickness / 2;

        sliderG = compositionsByCategory[compositionKeys.RANGE];
        if (sliderG) {
            slider = sliderG.sliders[false];
            sliderSpace = slider.conf.outerCircle.rFactor * axisThickness;
            heightTakenUpper += sliderExtraDiam = Math.max(sliderSpace / 2 - axisThickness / 2, 0);
        }

        // @todo Change the height and width of bBox
        effectivePlotArea.y += sliderExtraDiam;
        effectivePlotArea.height = heightTaken = heightTakenUpper + heightTakenLower + sliderExtraDiam;
        bBox.height = heightTaken + 2 * padding.v;

        lSpace.node.logicArea = effectivePlotArea;
        lSpace.bound = bBox;

        return bBox;
    };

    LegendAxis.prototype.getDrawableAxisArea = function (parentBoundingRect) {
        var conf = this.conf,
            x = parentBoundingRect.x,
            y = parentBoundingRect.y,
            width = parentBoundingRect.width,
            height = conf.legendAxisHeight,
            r = conf.legendAxisHeight / 2;

        return {
            x: x,
            y: y,
            width: width,
            height: height,
            r: r
        };
    };

    LegendAxis.prototype.preDrawingRangeParam = function (drawableArea) {
        var y = drawableArea.y + (drawableArea.height / 2),
            calculationBase = drawableArea.height;

        return {
            y: y,
            calculationBase: calculationBase,
            rangeStart: drawableArea.x,
            rangeEnd: drawableArea.x + drawableArea.width,
            prop: 'y'
        };
    };

    LegendAxis.prototype.getScaleMarkerPathStr = function (oriAxisRect, valueRatio) {
        var axisRect = merge(oriAxisRect, {}),
            conf = this.conf,
            lineAttr = conf.line,
            index,
            length,
            ratio,
            covered,
            markerStartY,
            tickStr = '',
            lineStr = '';

        axisRect.x += axisRect.r;
        axisRect.width -= 2 * axisRect.r;
        markerStartY = axisRect.y + axisRect.height;

        for (index = 0, length = valueRatio.length; index < length; index++) {
            ratio = valueRatio[index];
            covered = axisRect.x + (ratio * axisRect.width / 100);

            tickStr += M + (covered) + COMMA_STR + (markerStartY - lineAttr.grooveLength) +
                L + (covered) + COMMA_STR + (markerStartY + lineAttr.offset);
        }

        lineStr += M + (axisRect.x) + COMMA_STR + (markerStartY + lineAttr.offset) +
            L + (axisRect.x + axisRect.width) + COMMA_STR + (markerStartY + lineAttr.offset);

        return tickStr + lineStr;
    };

    LegendAxis.prototype.getColorGradient = function (colorRange) {
        return {
            axis: colorRange.getBoxFill(),
            shadow: toRaphaelColor({
                FCcolor: {
                    alpha : '25,0,0',
                    angle : 90,
                    color : '000000,FFFFFF,FFFFFF',
                    ratio : '0,30,40'
                }
            })
        };
    };

    LegendAxis.prototype.draw = function () {
        var paper,
            layer,
            bound,
            conf = this.conf,
            boundAttr = conf.bound || {},
            lineAttr = conf.line,
            boundStyle = boundAttr.style || {},
            node,
            bBox,
            category,
            compositionsByCategory = this.compositionsByCategory,
            cRange,
            valueRatio,
            composition,
            compositionMes,
            legendAxisGroup,
            rangeParams,
            grad,
            oriAxisRect,
            lSpace,
            options,
            instanceFn,
            keys,
            componentPool,
            scaleLine;


        if (arguments.length >= 2) {
            bBox = arguments[0];
            options = arguments[1];
        } else if (arguments.length >= 1){
            options = arguments[0];
        }

        paper = options.paper;
        layer = options.parentLayer;
        cRange = options.colorRange;
        valueRatio = cRange.getCumulativeValueRatio();
        componentPool = options.componentPool;
        keys = componentPool.getKeys();


        this.getLogicalSpace(bBox, options);
        lSpace = this._lSpace;

        instanceFn = componentPool.getComponent(this._id, keys.KEY_GROUP);
        legendAxisGroup = instanceFn('legend-axis', layer);
        //legendAxisGroup = paper.group('legend-axis', layer);

        instanceFn = componentPool.getComponent(this._id, keys.KEY_RECT, true);

        this.bound = bound = instanceFn(legendAxisGroup).attr(lSpace.bound).css(boundStyle);
        //bound = this.bound = paper.rect(lSpace.bound, legendAxisGroup).css(boundStyle);

        oriAxisRect = this.getDrawableAxisArea(lSpace.node.logicArea);
        grad = this.getColorGradient(cRange);
        conf.style.fill = grad.axis;
        conf.shadow.style.fill = grad.shadow;

        // node = this.node = paper.rect(oriAxisRect, legendAxisGroup).css(conf.style);
        // this.shadow = paper.rect(oriAxisRect, legendAxisGroup).css(conf.shadow.style);
        node = this.node = instanceFn(legendAxisGroup).attr(oriAxisRect).css(conf.style);
        this.shadow = instanceFn(legendAxisGroup).attr(oriAxisRect).css(conf.shadow.style);

        scaleLine = this.getScaleMarkerPathStr(oriAxisRect, valueRatio);
        instanceFn = componentPool.getComponent(this._id, keys.KEY_PATH);
        instanceFn('M0,0', legendAxisGroup)
            .attr({ path: scaleLine }).css(lineAttr.style);

        for (category in compositionsByCategory) {
            composition = compositionsByCategory[category];

            switch (category) {
                case compositionKeys.RANGE:
                    rangeParams = this.preDrawingRangeParam(oriAxisRect);

                    options[rangeParams.prop] = rangeParams[rangeParams.prop];
                    options.key = rangeParams.prop;
                    options.rCalcBase = rangeParams.calculationBase;
                    options.parentLayer = legendAxisGroup;

                    compositionMes = composition.draw(rangeParams.rangeStart,rangeParams.rangeEnd, options);
            }
        }
    };

    function VerticalLegendAxis () {
        LegendAxis.apply(this, arguments);
    }

    VerticalLegendAxis.prototype = Object.create(LegendAxis.prototype);
    VerticalLegendAxis.prototype.constructor = VerticalLegendAxis;

    VerticalLegendAxis.prototype.getLogicalSpace = function (bBox, options, recalculate) {
        var lSpace = this._lSpace,
            conf = this.conf,
            padding = conf.padding,
            widthTakenLower,
            widthTakenUpper,
            widthTaken,
            axisThickness = conf.legendAxisHeight,
            compositionsByCategory = this.compositionsByCategory,
            sliderG,
            slider,
            effectivePlotArea,
            sliderSpace,
            sliderExtraDiam = 0;

        if (lSpace && !recalculate) {
            lSpace.isImpure = true;
            // If logical space has already been calculated and recalculate flag is on, return without recalculating.
            return lSpace;
        }

        lSpace = this._lSpace = {
            bound: {
                height: 0,
                width: 0
            },

            node: {
                logicArea: undefined
            }
        };

        effectivePlotArea = merge(bBox, {});

        // The logical rect inside which the composition are drawn
        effectivePlotArea.height -= 2 * padding.v;
        effectivePlotArea.width -= 2 * padding.h;
        effectivePlotArea.x += padding.h;
        effectivePlotArea.y += padding.v;

        widthTakenLower = (axisThickness / 2) + conf.line.offset;
        widthTakenUpper = axisThickness / 2;

        sliderG = compositionsByCategory[compositionKeys.RANGE];
        if (sliderG) {
            slider = sliderG.sliders[false];
            sliderSpace = slider.conf.outerCircle.rFactor * axisThickness;
            widthTakenUpper += sliderExtraDiam = Math.max(sliderSpace / 2 - axisThickness / 2, 0);
        }

        effectivePlotArea.x += sliderExtraDiam;
        effectivePlotArea.width = widthTaken = widthTakenUpper + widthTakenLower + sliderExtraDiam;
        bBox.width = widthTaken + 2 * padding.v;

        lSpace.node.logicArea = effectivePlotArea;
        lSpace.bound = bBox;

        return bBox;
    };

    VerticalLegendAxis.prototype.getDrawableAxisArea = function (parentBoundingRect) {
        var conf = this.conf;

        return {
            x: parentBoundingRect.x,
            y: parentBoundingRect.y,
            width: conf.legendAxisHeight,
            height: parentBoundingRect.height,
            r: conf.legendAxisHeight / 2
        };
    };

    VerticalLegendAxis.prototype.getScaleMarkerPathStr = function (oriAxisRect, valueRatio) {
        var axisRect = merge(oriAxisRect, {}),
            conf = this.conf,
            lineAttr = conf.line,
            index,
            ratio,
            length,
            markerStartX,
            covered,
            tickStr = '',
            lineStr = '';

        axisRect.y += axisRect.r;
        axisRect.height -= 2 * axisRect.r;
        markerStartX = axisRect.x + axisRect.width;

        for (index = 0, length = valueRatio.length; index < length; index++) {
            ratio = valueRatio[index];
            covered = axisRect.y + (ratio * axisRect.height / 100);

            tickStr += M + (markerStartX - lineAttr.grooveLength) + COMMA_STR + (covered) +
                L + (markerStartX + lineAttr.offset) + COMMA_STR + (covered);
        }

        lineStr += M + (markerStartX + lineAttr.offset) + COMMA_STR + (axisRect.y) +
            L + (markerStartX + lineAttr.offset) + COMMA_STR + (axisRect.y + axisRect.height);

        return tickStr + lineStr;
    };

    VerticalLegendAxis.prototype.getColorGradient = function (colorRange) {
        return {
            axis: colorRange.getBoxFill(true),
            shadow: toRaphaelColor({
                FCcolor: {
                    alpha : '25,0,0',
                    angle : 360,
                    color : '000000,FFFFFF,FFFFFF',
                    ratio : '0,30,40'
                }
            })
        };
    };

    VerticalLegendAxis.prototype.preDrawingRangeParam = function (drawableArea) {
        var x = drawableArea.x + (drawableArea.width / 2),
            calculationBase = drawableArea.width;

        return {
            x: x,
            calculationBase: calculationBase,
            rangeStart: drawableArea.y,
            rangeEnd: drawableArea.y + drawableArea.height,
            prop: 'x'
        };
    };

    function SliderGroup (conf) {
        var sliderConf = conf,
            options = {};

        this._id = 'GL_SG1';
        this.conf = conf;

        options.conf = sliderConf;

        this.extremes = [];
        this.sliders = {};

        options.sliderGroup = this;
        this.valueRange = [];
        this.callbacks = [];

        this.sliders[FORMER_SLIDER_INDEX] = new Slider(FORMER_SLIDER_INDEX, options, this._id +
                    '_' + (+FORMER_SLIDER_INDEX));
        this.sliders[LATER_SLIDER_INDEX] = new Slider(LATER_SLIDER_INDEX, options, this._id +
                    '_' + (+LATER_SLIDER_INDEX));
    }

    SliderGroup.prototype.constructor = SliderGroup;


    SliderGroup.prototype.initRange = function (slider, updatedRange) {
        var sliderIndex = slider.sliderIndex;

        this.extremes[+sliderIndex] = updatedRange;
    };

    SliderGroup.prototype.updateRange = function (slider, updatedRange) {
        var sliderIndex = slider.sliderIndex,
            sliders = this.sliders,
            s = sliders[!sliderIndex];

        s.updateSwingRange(sliderIndex, updatedRange);
    };

    SliderGroup.prototype.reset = function () {
        var options = {};

        options.conf = this.conf;
        options.sliderGroup = this;

        // @todo do it from a more generalized way
        this.sliders[FORMER_SLIDER_INDEX] = new Slider(FORMER_SLIDER_INDEX, options, this._id +
                    '_' + (+FORMER_SLIDER_INDEX));
        this.sliders[LATER_SLIDER_INDEX] = new Slider(LATER_SLIDER_INDEX, options, this._id +
                    '_' + (+LATER_SLIDER_INDEX));

        this.draw.apply(this, this._drawParams);
    };

    SliderGroup.prototype.clearListeners = function () {
        this.callbacks.length = 0;
    };

    SliderGroup.prototype.draw = function (rangeStart, rangeEnd, options) {
        var sliders = this.sliders,
            lSlider = sliders[FORMER_SLIDER_INDEX],
            rSlider = sliders[LATER_SLIDER_INDEX],
            cRange = options.colorRange,
            colorRange = cRange.colorRange,
            componentPool = options.componentPool,
            chart = this._fcChart = componentPool.getChart(),
            oneSliderMes;

        this.getValueFormPixel = function (valueStart, valueEnd, pixelStart, pixelEnd) {
            var unit = (valueEnd - valueStart) / (pixelEnd - pixelStart);

            this.getValueFormPixel = function (pixel) {
                return valueStart + (unit * pixel);
            };
        };

        this.updateWhenInMove = function (numberFormatter, mapByPercent) {
            this.updateWhenInMove = function (slider, val) {
                var extremes = this.extremes,
                    sliderIndex = slider.sliderIndex,
                    nVal,
                    value;

                if (sliderIndex) {
                    nVal = extremes[1] - extremes[0] + val;
                } else {
                    nVal = val;
                }

                value = this.getValueFormPixel(nVal);

                if (!mapByPercent) {
                    value = numberFormatter.legendValue(value);
                } else {
                    value = parseFloat(value).toFixed(2) + PERCENT_STR;
                }

                return value;
            };
        };

        this._drawParams = [rangeStart, rangeEnd, options];
        this.updateWhenInMove(chart.components.numberFormatter, cRange.mapByPercent);

        oneSliderMes = lSlider.draw(rangeStart, colorRange[0].displayValue, options[options.key], options);
        oneSliderMes = rSlider.draw(rangeEnd, colorRange[colorRange.length - 1].displayValue, options[options.key],
                options);

        lSlider.swing = this.extremes.slice(0);
        rSlider.swing = this.extremes.slice(0);

        this.getValueFormPixel(colorRange[0].value, colorRange[colorRange.length - 1].value,
                                this.extremes[0], this.extremes[1]);

        return oneSliderMes;
    };

    SliderGroup.prototype.registerListener = function (fn, context, params) {
        this.callbacks.push({
            fn: fn,
            context: context,
            params: params || []
        });
    };

    SliderGroup.prototype.updateWhenInRest = function (slider, val) {
        var sliders = this.sliders,
            extremes = this.extremes,
            sliderIndex = slider.sliderIndex,
            lValue,
            rValue,
            cIndex,
            cLength,
            callbacks = this.callbacks,
            cb,
            params;

        if (sliderIndex) {
            lValue = sliders[!sliderIndex].currPos;
            rValue = extremes[1] - extremes[0] + val;
        } else {
            lValue = val;
            rValue = extremes[1] - extremes[0] + sliders[!sliderIndex].currPos;
        }

        for (cIndex = 0, cLength = callbacks.length; cIndex < cLength; cIndex++) {
            cb = callbacks[cIndex];
            params = cb.params.slice(0);
            params.unshift(this.getValueFormPixel(rValue));
            params.unshift(this.getValueFormPixel(lValue));
            cb.fn.apply(cb.context, params);
        }
    };

    SliderGroup.prototype.dragStarted = function (self) {
        var sliders = this.sliders,
            extremes = this.extremes,
            conf = self.conf,
            chart = this._fcChart;

        global.raiseEvent ('legendpointerdragstart', {
            pointerIndex: +self.sliderIndex,
            pointers: [{
                value: this.getValueFormPixel(sliders[false].currPos)
            }, {
                value: this.getValueFormPixel(extremes[1] - extremes[0] + sliders[true].currPos)
            }],
            legendPointerHeight: conf.outerRadius,
            legendPointerWidth: conf.innerRadius,
            outerRadius: conf.outerRadius,
            innerRadius: conf.innerRadius
        }, chart.chartInstance, [chart.id]);
    };


    SliderGroup.prototype.dragCompleted = function (self, isDragged, newVal) {
        var sliders = this.sliders,
            extremes = this.extremes,
            conf = self.conf,
            minValue = this.getValueFormPixel(sliders[false].currPos),
            maxValue = this.getValueFormPixel(extremes[1] - extremes[0] + sliders[true].currPos),
            chart = this._fcChart,
            newMinValue,
            newMaxValue;

        if (!self.sliderIndex) {
            newMinValue = this.getValueFormPixel(newVal);
            newMaxValue = maxValue;
        } else {
            newMinValue = minValue;
            newMaxValue = this.getValueFormPixel(extremes[1] - extremes[0] + newVal);
        }

        if (isDragged) {
            global.raiseEvent ('legendrangeupdated', {
                previousMinValue: minValue,
                previousMaxValue: maxValue,
                minValue: newMinValue,
                maxValue: newMaxValue
            }, chart.chartInstance, [chart.id]);
        }

        global.raiseEvent ('legendpointerdragstop', {
            pointerIndex: +self.sliderIndex,
            pointers: [{
                value: minValue
            }, {
                value: maxValue
            }],
            legendPointerHeight: conf.outerRadius,
            legendPointerWidth: conf.innerRadius,
            outerRadius: conf.outerRadius,
            innerRadius: conf.innerRadius
        }, chart.chartInstance, [chart.id]);
    };

    function Slider (sliderIndex, options, id) {
        this.conf = options.conf;
        this.sliderIndex = sliderIndex;
        this.rangeGroup = options.sliderGroup;
        this._id = id;

        this.node = undefined;
        this.tracker = undefined;
        this.currPos = 0;
        this.swing = [];
    }

    Slider.prototype.constructor = Slider;

    Slider.prototype.updateSwingRange = function (index, value) {
        this.swing[+index] = value;
    };

    // @todo: Who should be responsible for reset, range or individual slider
    // Slider.prototype.reset = function () {
    //     var node = this.node,
    //         tracker = this.tracker,
    //         conf = this.conf,
    //         dragAPI;

    //     if (!node) {
    //         return;
    //     }

    //     node.attr({
    //         transform: 't0,0'
    //     });

    //     this.currPos = 0;
    //     this.swing = [];

    // };

    Slider.prototype.draw = function (rangeStart, scaleVal, position, options) {
        var layer = options.parentLayer,
            conf = this.conf,
            ocConf = conf.outerCircle,
            icConf = conf.innerCircle,
            ocRadius = Math.ceil((ocConf.rFactor * options.rCalcBase ) / 2),
            icRadius = Math.ceil((icConf.rFactor * options.rCalcBase ) / 2),
            icThickness = ocRadius - icRadius,
            group,
            rangeGroup = this.rangeGroup,
            sliderIndex = this.sliderIndex,
            dragAPI,
            strokeWidthOffset,
            x,
            y,
            tracker,
            instanceFn,
            iniRange,
            componentPool = options.componentPool,
            keys = componentPool.getKeys();

        conf.outerRadius = ocRadius;
        conf.innerRadius = icRadius;

        this._scaleVal = scaleVal;

        icConf.style['stroke-width'] = icThickness;
        strokeWidthOffset = Math.ceil(ocConf.style['stroke-width'] / 2);
        icRadius += strokeWidthOffset;

        instanceFn = componentPool.getComponent(this._id, keys.KEY_GROUP);
        group = this.node = instanceFn('fc-gl-slider', layer).attr({
            'cursor' : 'pointer',
            'transform': 't0,0'
        });


        if (options.key === 'x') {
            x = position;
            y = rangeStart;
            y += sliderIndex ? -(icRadius) : +icRadius;
            iniRange = y;
        } else {
            x = rangeStart;
            y = position;
            x += sliderIndex ? -(icRadius) : +icRadius;
            iniRange = x;
        }

        rangeGroup.initRange(this, iniRange);

        instanceFn = componentPool.getComponent(this._id, keys.KEY_CIRCLE, true);
        instanceFn(group).attr({
            cx: x,
            cy: y,
            r: ocRadius
        }).css(ocConf.style);
        instanceFn(group).attr({
            cx: x,
            cy: y,
            r: icRadius
        }).css(icConf.style);

        tracker = this.tracker = instanceFn(group).attr({
            cx: x,
            cy: y,
            r: ocRadius + 5,
            ishot: true,
            fill: TRACKER_FILL,
            stroke: 0,
            cursor: 'pointer'
        }).trackTooltip(conf.showTooltip ? true : false).tooltip(scaleVal, null, null, true);

        this._dragAPI = dragAPI = this.getDragAPI(options.key === 'x');

        tracker.undrag();
        tracker.drag(dragAPI.dragging, dragAPI.dragStart, dragAPI.dragEnd);

        return {
            translateAscending: ocRadius + strokeWidthOffset
        };
    };

    Slider.prototype.getDragAPI = function (verticalDragging) {
        var self = this,
            node = self.node,
            index = self.sliderIndex,
            range = self.rangeGroup,
            swing,
            lastDisplacement,
            timeoutId,
            innerRadius = self.conf.innerRadius,
            spaceSaved = innerRadius,
            isDragged;

        return {
            dragging : function () {
                var left,
                    right,
                    d,
                    event;

                event = arguments[4];
                event.stopPropagation();
                event.preventDefault();

                if (verticalDragging) {
                    d = arguments[1];
                } else {
                    d = arguments[0];
                }

                if (index) {
                    left = swing[0] - swing[1] + spaceSaved;
                    right = 0;
                } else {
                    left = 0;
                    right = swing[1] - swing[0] - spaceSaved;
                }

                if ((self.currPos + d) < left || (self.currPos + d) > right) {
                    return;
                }

                node.attr({
                    transform : verticalDragging ? 't0,' + (self.currPos + d) :
                            't' + (self.currPos + d) + ',' + 0
                });

                lastDisplacement = d;

                timeoutId && clearTimeout(timeoutId);
                timeoutId = setTimeout(function () {
                    range.updateWhenInRest(self, self.currPos + d);
                }, 100);

                self.tracker.tooltip(range.updateWhenInMove(self, self.currPos + d), null, null, true);
                isDragged = true;

                return true;
            },

            dragStart : function (x, y, event) {
                event.stopPropagation();
                event.preventDefault();

                node.attr({
                    transform : verticalDragging ? 't0,' + self.currPos :
                            't' + self.currPos + ',' + 0
                });

                swing = swing || self.swing;

                isDragged = false;

                range.dragStarted(self);
            },

            dragEnd : function () {
                var newPos;
                range.dragCompleted(self, isDragged, self.currPos + lastDisplacement);

                if (!isDragged) {
                    return;
                }

                timeoutId && clearTimeout(timeoutId);
                timeoutId = setTimeout(function () {
                    range.updateWhenInRest(self, self.currPos);
                }, 100);

                self.currPos += lastDisplacement;
                newPos = swing[+index] + self.currPos;
                range.updateRange(self, newPos);
            }
        };
    };


    function ColorRange (data, options, chart) {
        var numberFormatter = chart.components.numberFormatter,
            index,
            length,
            range,
            min,
            max,
            minRange,
            maxRange,
            minValue,
            maxValue,
            mapByPercent;

        this.data = data;
        this.options = options || {};
        mapByPercent = this.mapByPercent = !!data.mapByPercent;
        this.appender = '';

        min = this.mapByPercent ? 0 : options.min;
        max = this.mapByPercent ? 100 :  options.max;

        if (data.colorRange.length === 2) {
            minRange = data.colorRange[0];
            maxRange = data.colorRange[1];

            minValue = minRange.value = isInvalid(minRange.value) ? min : minRange.value;
            maxValue = maxRange.value = isInvalid(maxRange.value) ? max : maxRange.value;

            if (minValue === maxValue) {
                minValue = minRange.value = min;
                maxValue = maxRange.value = max;
            }

            minRange.displayValue = mapByPercent ? minValue + PERCENT_STR :  numberFormatter.legendValue(minValue);
            maxRange.displayValue = mapByPercent ? maxValue + PERCENT_STR :  numberFormatter.legendValue(maxValue);
        }

        if ((isInvalid(min) && isInvalid(minRange.value)) || (isInvalid(max) && isInvalid(minRange.value)) ||
            !data.gradient) {
            this._preparationGoneWrong = true;
        } else {
            this._preparationGoneWrong = false;
        }

        range = this.colorRange = data.colorRange.sort(function (m, n) { return m.value - n.value; });
        this.valueRatio = undefined;
        this.values = [];

        for (index = 0, length = range.length; index < length; index++) {
            this.values.push(range[index].value);
        }
    }

    ColorRange.prototype.constructor = ColorRange;

    ColorRange.prototype.getValueRatio = function () {
        var colorRange = this.colorRange,
            currentRange,
            index,
            length = colorRange.length,
            ratio = this.valueRatio,
            maxValue = colorRange[length - 1].value,
            minValue = colorRange[0].value,
            range = maxValue - minValue,
            itemValuePercent,
            lastValue = 0;

        if (ratio) {
            return ratio;
        }

        ratio = this.valueRatio = [];
        for (index = 0; index < length; index++) {
            currentRange = colorRange[index];
            itemValuePercent = (currentRange.value - minValue) / range;

            ratio.push((itemValuePercent - lastValue) * 100);
            lastValue = itemValuePercent;
        }

        return ratio;
    };

    ColorRange.prototype.getCumulativeValueRatio = function () {
        var colorRange = this.colorRange,
            currentRange,
            index,
            length = colorRange.length,
            firstValue = colorRange[0].value,
            lastValue = colorRange[length - 1].value,
            ratio = [];

        for (index = 0; index < length; index++) {
            currentRange = colorRange[index];
            ratio.push((currentRange.value - firstValue) / (lastValue - firstValue) * 100);
        }
        return ratio;
    };

    ColorRange.prototype.getBoxFill = function (isVertical) {
        var colorRange = this.colorRange,
            currentRange,
            index,
            length = colorRange.length,
            color = [],
            raphColorArg,
            angle;

        angle = isVertical ? 90 : 0;

        for (index = 0; index < length; index++) {
            currentRange = colorRange[index];
            color.push(currentRange.code);
        }

        raphColorArg = {
            FCcolor: {
                alpha: '100,100,100',
                angle: angle,
                color: color.join(COMMA_STR),
                ratio: this.getValueRatio().join(COMMA_STR)
            }
        };

        return toRaphaelColor(raphColorArg);
    };

    ColorRange.prototype.getColorByValue = function (nVal) {
        var valueArr = this.values,
            colorRange = this.colorRange,
            length,
            index,
            rangeOutSideColor,
            color;

        if (nVal === undefined || nVal === null) {
            return;
        }

        for (index = 0, length = valueArr.length; index < length; index++) {
            if (nVal === valueArr[index]) {
                color = colorRange[index].code;
                break;
            } else if (!index && nVal < valueArr[index]) {
                rangeOutSideColor = true;
                break;
            } else if (index === length - 1 && nVal > valueArr[index]) {
                rangeOutSideColor = true;
                break;
            }else if (nVal > valueArr[index] && nVal < valueArr[index + 1]) {
                color = getColorBetween(colorRange[index], colorRange[index + 1], nVal);
                break;
            }
        }

        if (rangeOutSideColor) {
            return;
        }

        return color;
    };


    function GradientLegend () {
        LegendBase.apply(this, arguments);
    }

    GradientLegend.prototype = Object.create(LegendBase.prototype);
    GradientLegend.prototype.constructor = GradientLegend;

    FusionCharts.register('component', ['gradientLegend', 'gradientLegend', {
        pIndex: 1,

        enabled: false,
        /*
         * Initializes the component.
         * Calling this would create instance of colorRange. Which can be used to access the api of the same.
         * Configure is called when the second level of init is called. The second level is explained below.
         *
         *
         * Example use
         * legend = new (FusionCharts.register('component',['gradientLegend', 'gradientLegend']))();
         *
         * 1st level - fn = legend.init({chart: chart});
         * 2nd level - fn({min: 100, max: 1000, maxOtherSide: 150});
         *
         * Or putting it together -  legend.init({chart: chart, dataExtremes: {min: 100, max: 1000, maxOtherSide: 150}})
         * colorRange = legend.colorRange
         *
         *
         * @param options {Object} - A simple key value pair needed for init.
         * {
         *      chart: chartInstance,
         *      dataExtremes: optional data extreme of the datasets in the form
         *          {
         *              max: maximum value,
         *              min: minimum value,
         *              maxOtherSide: Optional maximum other side measurement. This takes the maximum allowed height for
         *                  a horizontal legend and width for vertical legend.
         *          },
         * }
         *
         * @return {Function | undefined} - If the dataExtremes are provided return undefined, else returns a function
         *                                  where it is to be fed.
         */
        init: function (options) {
            var componentAPI = this,
                iapi = options.chart,
                dataExtremes,
                cr,
                nData,
                fcChart;

            /*
             * Performs 2nd level of initialization.
             * Injects the colorRange in the API object.
             *
             * @param de {Object} - A simple key value pair needed for 2nd level of init. See the above dataExtremes obj
             */
            function continueInit (de) {
                // Extracts raw FC Chart data and parse it to prepare data for colorRange. This kind of acts like a
                // adapter.
                componentAPI.data = options.chart.jsonData.colorrange;
                nData = componentAPI.nData = legendManager.legacyDataParser(componentAPI.data, de);

                if (!nData) {
                    // If no valid data is present, sets a flag not to draw the legend . This will be read by subsequent
                    // calls.
                    componentAPI._dontPlot = true;
                    return;
                }

                // Starts prepaeparing the drawOptions object which is needed during the final drawing and space
                // management.
                componentAPI.drawOptions = {
                    smartLabel: iapi.linkedItems.smartLabel,
                    colorRange: (componentAPI.colorRange = cr = new ColorRange(nData, de, fcChart)),
                    maxOtherSide: de.maxOtherSide
                };

                componentAPI._dontPlot = false;
                cr && cr._preparationGoneWrong && (componentAPI._dontPlot = true);

                componentAPI._recalculateLogicalSpace = true;

                // Parse all the legend releted attrs.
                componentAPI._configure();
            }

            // Initiates the legend manager by providing the access to the chart object.
            legendManager.init(options);

            // Saves the reference of chart for internal use, in case
            fcChart = componentAPI._chart = options.chart;
            componentAPI._cpool = componentPoolFactory(fcChart);

            if (!(dataExtremes = options.dataExtremes)) {
                // If the dataExtremes is not provided, return the function for 2nd level of init
                return continueInit;
            }

            // If provided perform the 2nd level of init internally by giving the feel to the user that init happened
            // in one single shot
            continueInit(dataExtremes);
        },

        /*
         * Parses all the FC attributes for gradient legend
         */
        _configure: function () {
            var componentAPI = this,
                chart = componentAPI._chart,
                chartAttrs = chart.jsonData.chart,
                conf = componentAPI.conf = {},
                outCanvasBaseFont = chartAttrs.outcnvbasefont,
                outCanvasBaseFontSize = chartAttrs.outcnvbasefontsize,
                outCanvasBaseFontColor = chartAttrs.outcnvbasefontcolor,
                labelStyle = chart.config.dataLabelStyle,
                fColor,
                fFamily,
                fSize,
                fWeight,
                cfColor,
                cfFamily,
                cfSize,
                cfWeight,
                axisBorderColor,
                axisBorderAlpha;

            conf.caption = pluck(chartAttrs.legendcaption);
            conf.legendPosition = pluck(chartAttrs.legendposition, 'bottom').toLowerCase();
            conf.showLegend = pluckNumber(chartAttrs.showlegend, 1);
            conf.interactiveLegend = pluckNumber(chartAttrs.interactivelegend, 1);
            conf.showLegendLabels = pluckNumber(chartAttrs.showlegendlabels, 1);

            fColor = chartAttrs.legenditemfontcolor || outCanvasBaseFontColor;
            fFamily = chartAttrs.legenditemfont || outCanvasBaseFont;
            fSize = chartAttrs.legenditemfontsize || outCanvasBaseFontSize;
            fWeight = pluckNumber(chartAttrs.legenditemfontbold, 0);

            cfColor = chartAttrs.legendcaptionfontcolor || outCanvasBaseFontColor;
            cfFamily = chartAttrs.legendcaptionfont || outCanvasBaseFont;
            cfSize = chartAttrs.legendcaptionfontsize || outCanvasBaseFontSize;
            cfWeight = pluckNumber(chartAttrs.legendcaptionfontbold, 1);

            axisBorderColor = chartAttrs.legendaxisbordercolor ?
                hashify(dehashify(chartAttrs.legendaxisbordercolor)) : undefined;

            axisBorderAlpha = axisBorderColor ? pluckNumber(chartAttrs.legendaxisborderalpha, 100) / 100 :
                undefined;

            // We do this like this so that, it becomes easy to override the default configuartion. The default conf was
            // created in this format.
            conf.axisTextItemConf = {
                style: {
                    fill: fColor ? convertColor(pluck(fColor)) : labelStyle.color,
                    fontFamily: fFamily ? pluck(fFamily) : labelStyle.fontFamily,
                    fontSize: fSize ? pluckNumber(fSize) : labelStyle.fontSize.match(/\d+/)[0],
                    fontWeight: fWeight ? 'bold' : labelStyle.fontWeight
                }
            };

            conf.legendCaptionConf = {
                style : {
                    fill: cfColor ? convertColor(pluck(cfColor)) : labelStyle.color,
                    fontFamily: cfFamily ? pluck(cfFamily) : labelStyle.fontFamily,
                    fontSize: cfSize ? pluckNumber(cfSize) : labelStyle.fontSize.match(/\d+/)[0],
                    fontWeight: cfWeight ? 'bold' : labelStyle.fontWeight,
                    fontStyle: 'normal'
                }
            };

            conf.legendAxisConf = {
                legendAxisHeight: 11,
                style : {
                    stroke: axisBorderColor,
                    'stroke-opacity': axisBorderAlpha
                },
                line: {
                    style: {
                        stroke: convertColor(pluck(chartAttrs.legendscalelinecolor, 'FFF8E9'),
                            pluckNumber(chartAttrs.legendscalelinealpha, 100)),
                        'stroke-width': pluckNumber(chartAttrs.legendscalelinethickness)
                    }
                }
            };

            conf.sliderGroupConf = {
                showTooltip: pluckNumber(chartAttrs.showtooltip, 1),
                outerCircle : {
                    rFactor: pluckNumber(chartAttrs.sliderdiameterfactor),
                    style: {
                        stroke: convertColor(pluck(chartAttrs.legendpointerbordercolor, '757575'),
                            pluckNumber(chartAttrs.legendpointerborderalpha, 100))
                    }
                },
                innerCircle : {
                    rFactor: pluckNumber(chartAttrs.sliderholediameterfactor),
                    style: {
                        stroke: convertColor(pluck(chartAttrs.legendpointercolor, 'FFFFFF'),
                            pluckNumber(chartAttrs.legendpointeralpha, 100))
                    }
                }
            };

            conf.legendCarpetConf = {
                spreadFactor : pluckNumber(chartAttrs.legendspreadfactor),
                allowDrag: !!pluckNumber(chartAttrs.legendallowdrag, 0),
                captionAlignment: pluck(chartAttrs.legendcaptionalignment, 'center'),
                style : {
                    'fill' : convertColor(pluck(chartAttrs.legendbgcolor, 'e4d9c1'),
                            pluckNumber(chartAttrs.legendbgalpha, 100)),
                    'stroke' : convertColor(pluck(chartAttrs.legendbordercolor, 'c4b89d'),
                            pluckNumber(chartAttrs.legendborderalpha, 100)),
                    'stroke-width': pluckNumber(chartAttrs.legendborderthickness, 1)
                }
            };
        },

        /*
         * This takes care of the instance creation of various component based on attrs. Dependency injection /
         * component injection is managed from here.
         * This is not meant to be called from outside. This gets called internally.
         */
        postConfigureInit : function () {
            var componentAPI = this,
                conf = componentAPI.conf,
                caption,
                carpet,
                axis,
                sGroup,
                gl,
                ovrdConf,
                ovrdTextConf,
                body,
                labels,
                values;

            // Container for the component instances.
            componentAPI.elem = {};

            // The details of the various components and their relationship is written at the top.

            if (conf.caption) {
                // If caption is present, create a instance of the same
                ovrdConf = merge(legendManager.getDefaultConf('legendCaptionConf'), conf.legendCaptionConf);
                caption = new LegendCaption(conf.caption, ovrdConf);
            }

            if (conf.interactiveLegend) {
                // If interactiveLegend is attr is present, creates the sliders of the legend.

                // Override the default conf with the user given one.
                ovrdConf = merge(legendManager.getDefaultConf('sliderGroupConf'), conf.sliderGroupConf);
                componentAPI.elem.sGroup = sGroup = new SliderGroup(ovrdConf);
                componentAPI.listeners && componentAPI.listeners.length > 0 &&
                    sGroup.registerListener.apply(sGroup, componentAPI.listeners);
            }

            ovrdConf = merge(legendManager.getDefaultConf('legendCarpetConf'), conf.legendCarpetConf);

            if (conf.legendPosition === 'bottom') {
                // If the legend to be placed at bottom

                // The reference side would be width and will be covered the complete canvasWidth.
                // The max of other side is given by maxOtherSide.
                // The margin is taken from canvasLeft
                componentAPI.drawOptions.refSideKey = 'canvasWidth';
                componentAPI.drawOptions.refOffsetKey = 'canvasLeft';

                // Creates a horizontal capet, axis, labels and values component
                carpet = new LegendCarpet(ovrdConf);

                ovrdTextConf = merge(legendManager.getDefaultConf('axisTextItemConf'), conf.axisTextItemConf);

                body = new LegendBody(componentAPI.drawOptions.colorRange,
                    legendManager.getDefaultConf('legendBodyConf'), ovrdTextConf);

                axis = new LegendAxis(merge(legendManager.getDefaultConf('legendAxisConf'), conf.legendAxisConf));

                conf.showLegendLabels && (labels = new LegendLabels(ovrdTextConf));
                values = new LegendValues(ovrdTextConf);
            } else {
                // If the legend to be placed at bottom

                // The reference side would be height and will be covered the complete canvasWidth.
                // The max of other side is given by maxOtherSide.
                // The margin is taken from canvasTop
                componentAPI.drawOptions.refSideKey = 'canvasHeight';
                componentAPI.drawOptions.refOffsetKey = 'canvasTop';

                ovrdTextConf = merge(legendManager.getDefaultConf('axisTextItemConf'), conf.axisTextItemConf);

                carpet = new VerticalLegendCarpet(ovrdConf);
                body = new VerticalLegendBody(componentAPI.drawOptions.colorRange,
                    legendManager.getDefaultConf('legendBodyConf'), ovrdTextConf);

                axis = new VerticalLegendAxis(merge(legendManager.getDefaultConf('legendAxisConf'),
                    conf.legendAxisConf));

                conf.showLegendLabels && (labels = new VerticalLegendLabels(ovrdTextConf));
                values = new VerticalLegendValues(ovrdTextConf);
            }

            // If the slider group is defined, inject as component. Slider group is component of axis.
            sGroup && axis.addCompositions(sGroup, compositionKeys.RANGE);

            // Adds component to the body if available
            labels && body.addCompositions(labels, compositionKeys.AXIS_LABEL);
            body.addCompositions(axis, compositionKeys.LEGEND_AXIS);
            body.addCompositions(values, compositionKeys.AXIS_VALUE);

            // Adds the body and the caption to the carpet
            caption && carpet.addCompositions(caption, compositionKeys.CAPTION);
            carpet.addCompositions(body, compositionKeys.LEGEND_BODY);

            // Finally creates the gradient legend.
            componentAPI.elem.gl = gl = new GradientLegend(carpet, componentAPI._cpool);
        },

        notifyWhenUpdate: function (fn, context, params) {
            var componentAPI = this,
                rGroup;

            rGroup = componentAPI.elem && componentAPI.elem.sGroup;
            if (rGroup) {
                rGroup.registerListener(fn, context, params);
            } else {
                componentAPI.listeners = [fn, context, params];
            }
        },

        dispose: function () {
            var componentAPI = this;

            componentAPI.elem && componentAPI.elem.gl && componentAPI.elem.gl.dispose();
            componentAPI.elem = {};
        },

        getLogicalSpace: function (maxOtherSide) {
            var componentAPI = this,
                conf = componentAPI.conf,
                zeroArea = {
                    height: 0,
                    width: 0
                },
                drawOptions = componentAPI.drawOptions,
                refSideKey,
                chart = componentAPI._chart,
                refOffsetKey;

            // @todo redundancy in calculating the reference side. Make it from a organized procedure call.
            if (!componentAPI._recalculateLogicalSpace) {
                refSideKey = drawOptions.refSideKey;
                refOffsetKey = drawOptions.refOffsetKey;

                componentAPI.drawOptions.refSide = chart.config[refSideKey];
                componentAPI.drawOptions.refOffset = chart.config[refOffsetKey];

                (componentAPI._logicalArea = componentAPI.elem.gl.getLogicalSpace(componentAPI.drawOptions, true));
                return componentAPI._logicalArea || zeroArea;
            }

            if (componentAPI._dontPlot) {
                return zeroArea;
            }

            componentAPI._recalculateLogicalSpace = false;
            componentAPI.postConfigureInit();

            if (!conf.showLegend) {
                return zeroArea;
            }

            refSideKey = drawOptions.refSideKey;
            refOffsetKey = drawOptions.refOffsetKey;

            componentAPI.drawOptions.refSide = chart.config[refSideKey];
            componentAPI.drawOptions.refOffset = chart.config[refOffsetKey];

            componentAPI.drawOptions.maxOtherSide = maxOtherSide || componentAPI.drawOptions.maxOtherSide;
            return componentAPI.elem.gl &&
                (componentAPI._logicalArea = componentAPI.elem.gl.getLogicalSpace(componentAPI.drawOptions, true));
        },

        resetLegend: function() {
            var componentAPI = this,
                rGroup;

            rGroup = componentAPI.elem && componentAPI.elem.sGroup;
            if (rGroup) {
                rGroup.reset();
            }
        },

        clearListeners: function () {
            var componentAPI = this,
                rGroup;

            rGroup = componentAPI.elem && componentAPI.elem.sGroup;
            if (rGroup) {
                rGroup.clearListeners();
            }
        },

        draw: function (x, y, options) {
            var componentAPI = this,
                conf = componentAPI.conf,
                measurement,
                node;

            if (componentAPI._dontPlot) {
                return;
            }

            componentAPI._cpool.init(options.paper);

            if (!conf.showLegend) {
                componentAPI.enabled  = false;
                return;
            }

            componentAPI.drawOptions.paper = options.paper;
            componentAPI.drawOptions.parentGroup = options.parentGroup;
            componentAPI.drawOptions.x = x;
            componentAPI.drawOptions.y = y;
            componentAPI.drawOptions.maxOtherSide = componentAPI.drawOptions.maxOtherSide || options.maxOtherSide;

            node = componentAPI.elem.gl.draw(componentAPI.drawOptions);
            measurement = node.getBBox();

            conf.xPos = measurement.x;
            conf.yPos = measurement.y;
            conf.height = measurement.height;
            conf.width = measurement.width;

            componentAPI.enabled = true;
        }

    }]);
}]);

/**!
 * @license FusionCharts JavaScript Library
 * Copyright FusionCharts Technologies LLP
 * License Information at <http://www.fusioncharts.com/license>
 *
 * @version 3.12.0
 */
/**
 * @private
 * @module fusioncharts.renderer.javascript.maps
 * @requires fusioncharts.renderer.javascript.legend-gradient
 * @export fusioncharts.maps.js
 */
FusionCharts.register('module', ['private', 'modules.renderer.js-maps', function () {

    var global = this,
        win = global.window,
        lib = global.hcLib,
        renderer = lib.chartAPI,
        chartAPI = renderer,

        addEvent = lib.addEvent,
        removeEvent = lib.removeEvent,
        // fireMouseEvent = lib.fireMouseEvent,
        // doc = win.document,
        pluck = lib.pluck,
        imprint = lib.imprint,
        extend2 = lib.extend2,
        parseTooltext = lib.parseTooltext,
        pluckNumber = lib.pluckNumber,
        COMPONENT = 'component',
        getLightColor = lib.graphics.getLightColor,
        dropHash = lib.dropHash,
        HASHSTRING = lib.HASHSTRING,
        parseUnsafeString = lib.parseUnsafeString,
        getDashStyle = lib.getDashStyle,
        schedular = lib.schedular,
        // jobList = lib.jobList,
        // pluckFontSize = lib.pluckFontSize,
        defaultPaletteOptions = extend2(lib.defaultPaletteOptions, {
            foregroundcolor: '333333',
            foregroundalpha: '100',
            foregrounddarkcolor: '111111',
            foregrounddarkalpha: '100',
            foregroundlightcolor: '666666',
            foregroundlightalpha: '100',
            backgroundlightcolor: 'FFFFFF',
            backgroundlightalpha: '100',
            backgroundlightangle: 90,
            backgroundlightratio: '',
            backgroundcolor: 'FFFFCC',
            backgroundalpha: '100',
            backgrounddarkcolor: 'ffcc66',
            backgrounddarkalpha: '100',
            backgrounddarkangle: 270,
            backgrounddarkratio: '',
            shadow: 1
        }),
        PXSTRING = 'px',
        setLineHeight = lib.setLineHeight,
        // parseUnsafeString = lib.parseUnsafeString,
        // getFirstColor = lib.getFirstColor,
        convertColor = lib.graphics.convertColor,
        // hashify = lib.hashify,
        UNDEFINED,
        // The default value for stroke-dash attribute.
        DASH_DEF = 'none',

        userAgent = win.navigator.userAgent,
        isIE = /msie/i.test(userAgent) && !win.opera,
        /** @todo fix this. */
        // isWebKit = /AppleWebKit/.test(userAgent),
        // isStrokeReg = /stroke/ig,
        hasSVG = lib.hasSVG,
        COMMASPACE = ', ',
        COMMA = ',',
        // QUOTE = '"',
        // QUOTECOMMAQUOTE = '","',        // CRLFQUOTE = '\r\n"',
        BLANK = '',
        POSITION_TOP = 'top',
        POSITION_BOTTOM = 'bottom',
        POSITION_RIGHT = 'right',
        POSITION_LEFT = 'left',
        POSITION_MIDDLE = 'middle',
        POSITION_CENTER = 'center',
        POSITION_START = 'start',
        POSITION_END = 'end',
        SHAPE_CIRCLE = 'circle',
        // NONE = 'none',
        // TILE = 'tile',
        // FILL = 'fill',
        // FIT = 'fit',
        // BOLD = 'bold',
        // NORMAL = 'normal',
        CRISP = 'crisp',
        GEO = 'geo',
        INNERRADIUSFACTOR = 0.6,

        math = win.Math,
        mathMin = math.min,
        mathMax = math.max,

        isStrokeReg = /stroke/ig,
        isWebKit = /AppleWebKit/.test(userAgent),
        mathCeil = math.ceil,
        MARKER_ITEM_KEY = 'items',
        mathPI = Math.PI,
        deg2rad = mathPI / 180,
        hasTouch = lib.hasTouch,
        CREDITS = false && (!lib.CREDIT_REGEX.test(win.location.hostname)),

        toRaphaelColor = lib.toRaphaelColor,
        TRACKER_FILL = 'rgba(192,192,192,' + (isIE ? 0.002 : 0.000001) + ')', // invisible but clickable
        // TEXT_ANCHOR_MAP = {
        //     left : 'start',
        //     right: 'end',
        //     center: 'middle'
        // },

        extend = function (a, b) { /** @todo refactor dependency */
            var n;
            if (!a) {
                a = {};
            }
            for (n in b) {
                a[n] = b[n];
            }
            return a;
        },

        /* CHeck if the mouseEvent was triggered within the canvas area and update its configurations wrt chart.
         * @param e {MouseEvent} - The original mouse event.
         * @param chart {Object} - The renderingAPI reference
         * @return The sanitized event adding the chartX, chartY property (pixel values wrt to chart specifically) and
         add an insideCanvas property to denote if the interaction was within the canvas area
        */
        isWithinCanvas = function (e, chart) {
            var mousePos = lib.getMouseCoordinate(chart.linkedItems.container,e),
            /*converts the original mouse event to a Fusion
            Charts event( that has chartX, chartY, pageX and pageY as its property)*/
                chartX = mousePos.chartX,
                chartY = mousePos.chartY,
                chartConfig = chart.config,
                minX = chartConfig.canvasLeft,
                minY = chartConfig.canvasTop,
                maxX = chartConfig.canvasLeft + chartConfig.canvasWidth,
                maxY = chartConfig.canvasHeight + chartConfig.canvasTop;
            //default value of the flag.
            mousePos.insideCanvas = false;

            // store the original event as well
            mousePos.originalEvent = e;
            //return true if within the canvas
            if (chartX > minX && chartX < maxX && chartY > minY && chartY < maxY) {
                //set the flag to be TRUE if triggered within the canvas area.
                mousePos.insideCanvas = true;
            }
            return mousePos;
        },
        /*
         * Function to check if the element is whose scpoe the function is being
         * called is a descendant of the passed element or not.
         * ~returns {undefined}
         */
        // isDescendant = function (parent) {
        //     var ele = this,
        //     currParent = ele.parentNode;

        //     if (!currParent) {
        //         return false;
        //     }

        //     while (currParent) {
        //         if (currParent === doc.documentElement) {
        //             return false;
        //         }
        //         else if (currParent === parent) {
        //             return true;
        //         }
        //         else {
        //             currParent = currParent.parentNode;
        //         }
        //     }

        //     return false;
        // },

        /**
         * Reduces the pain of writing loads of object structures while creating
         * FusionCharts specific color configurations
         */
        colorize = function (original, obj) {
            var col = !obj ? {
                FCcolor: original
            } : extend(original.FCcolor, obj);

            col.toString = toRaphaelColor;
            return col;
        },

        pruneStrokeAttrs = function (obj, thicknessModifier) {
            var key,
                returnObj = {};

            thicknessModifier = thicknessModifier || 1;

            if (!obj || typeof obj !== 'object') {
                return returnObj;
            }

            for (key in obj) {
                if (!isStrokeReg.test(key)) {
                    if (key === 'stroke-width') {
                        returnObj[key] = Number(obj[key]) / thicknessModifier;

                        if (isWebKit) {
                            // webkit issue fix
                            returnObj[key] = (returnObj[key] && mathCeil(returnObj[key])) || 0;
                        }
                    }
                    else {
                        returnObj[key] = obj[key];
                    }
                }
            }

            return returnObj;
        },


        ColorPalette = function (hash, index) {
            var subpalette,
                key;

            this.index = index;

            for (key in hash) {
                subpalette = defaultPaletteOptions[hash[key]];
                this[key] = subpalette instanceof Array ? subpalette[index] : subpalette;
            }
        },

        getTextWrapWidth = {
            right: function (w, x) {
                return x;
            },
            left: function (w, x) {
                return w - x;
            },
            center: function (w, x) {
                return mathMin(x, w - x) * 2;
            }
        },

        getTextWrapHeight = {
            top: function (h, y) {
                return y;
            },
            middle: function (h, y) {
                return mathMin(y, h - y) * 2;
            },
            bottom: function (h, y) {
                return h - y;
            }
        },

        convertArrayToIdMap = function (arr) {
            var i = (arr && arr.length) || 0,
                ret = {},
                item;

            while (i--) {
                item = arr[i];
                if (item.id !== UNDEFINED) {
                    ret[item.id.toLowerCase()] = item;
                }
            }

            return ret;
        },

        /**
         * Converts an array of objects to a hash based on a key present in the objects
         * of the array.
         *
         * @param {array} arr Array containing the objects.
         * @param {string} idKey The key in the array objects whose value is used to
         * create the keys in the returnObj. The values of this key should be
         * unique across all objects in the array.
         *
         * @returns {object} returnObj Object with the idKey as the key and
         * objects as the values.
         */
        convertToObj = function (arr, idKey) {
            var i = (arr && arr.length) || false,
                key = idKey || 'id',
                returnObj = {},
                item;

            if (!arr) {
                return arr;
            }

            while (i--) {
                item = arr[i];

                (item[key] !== UNDEFINED) && (returnObj[item[key].toLowerCase()] = item);
            }

            return returnObj;
        },
        KdTree = lib.KdTree;

    // Extend events
    extend(lib.eventList, {
        entityrollover: 'FC_Event',
        entityrollout: 'FC_Event'
    });

    /**
     * Definition of root geo-base. This definition has all the vizualization
     * routines required to draw maps (along with all base functionalities).
     *
     * All maps should inherit from this and simply redefine its data-definition
     * like "entities", "width", "height", "name", etc.
     */
    chartAPI(GEO, {
        name: GEO,
        friendlyName: 'Map',
        revision: 1,
        creditLabel: CREDITS,
        hasCanvas: true,
        standaloneInit: false, // this map cannot be displayed alone
        defaultDatasetType: 'maps',
        // Define the charts original (default) width and height. The user x,y
        // will be scaled as per this.
        baseWidth: 400,
        baseHeight: 300,
        baseScaleFactor: 1,
        defaultSeriesType: GEO,
        fireGroupEvent: true,
        legendposition: 'right',
        hasGradientLegend: true,
        isMap: true,
        /*
         * Definition for geo entities (their labels and entity outlines)
         * ~type {object.<string, Object>}
         */
        entities: {
            /**
             * Data-structure definition for map entities.
             * @example
            "ab": {
                outlines: [
                // Outline can have more than once closed paths idicating
                // distinct and disjoint areas.
                    [M,188.6,29.4,L,189.8,30.05,189.8,30.1,Z]
                ],

                label: "AB Entity",
                shortLabel: "AB",
                labelPosition: [158.75,57.9],
                labelConnectors: []
            }
             */
        },
        init: function (container, dataObj, chartobj, callBack) {
            var iapi = this,
                components,
                Caption,
                chartAttrs;

            chartAttrs = dataObj.chart = (dataObj.chart || dataObj.graph ||
                    dataObj.map || { });
            iapi.jsonData = dataObj;
            components = iapi.components = iapi.components || (iapi.components = {});
            // Map specific component
            components.mapAnnotations = components.mapAnnotations || (components.mapAnnotations =
                new lib.Annotations());

            iapi.components.colorPalette = new ColorPalette (this.colorPaletteMap,
                (chartAttrs.palette > 0 && chartAttrs.palette < 6 ?
                chartAttrs.palette : pluckNumber(iapi.paletteIndex, 1)) - 1);
            Caption = FusionCharts.register (COMPONENT, ['caption', 'MapCaption']);
            components.caption || (components.caption = new Caption());

            chartAPI.mscartesian.init.call(iapi, container, dataObj, chartobj, callBack);
        },
        configure: function () {
            var iapi = this,
                config,
                jsonData = iapi.jsonData,
                chartAttrs = jsonData.chart || jsonData.map,
                markerAttrs = jsonData.markers,
                // Select the color palette
                palette = new ColorPalette(this.colorPaletteMap,
                        (chartAttrs.palette > 0 && chartAttrs.palette < 6 ?
                        chartAttrs.palette : pluckNumber(iapi.paletteIndex, 1)) - 1),
                inCancolor,
                inCanFontFamily,
                inCanFontSize,
                style,
                entityBorderColor = pluck(chartAttrs.entitybordercolor, chartAttrs.bordercolor,
                    palette.plotbordercolor),
                entityFillColor = pluck(chartAttrs.entityfillcolor, chartAttrs.fillcolor, palette.plotfillcolor),
                entityFillAlpha = pluck(chartAttrs.entityfillalpha, chartAttrs.fillalpha, palette.plotfillalpha),
                entityFillRatio = pluck(chartAttrs.entityfillratio, chartAttrs.fillratio, palette.plotfillratio),
                entityFillAngle = pluck(chartAttrs.entityfillangle, chartAttrs.fillangle, palette.plotfillangle),
                nullEntityColor = pluck(chartAttrs.nullentityfillcolor, chartAttrs.nullentitycolor, entityFillColor),
                markerDataEnabled = pluckNumber(chartAttrs.usevaluesformarkers,
                        jsonData.markers && jsonData.markers.items && jsonData.markers.items.length,
                        !(jsonData.markers &&
                        (jsonData.markers.application && jsonData.markers.application.length &&
                        jsonData.markers.definition && jsonData.markers.definition.length)));

            iapi.base.base.configure.call(this);
            config = iapi.config;

            config.origMarginTop = pluckNumber(chartAttrs.charttopmargin, chartAttrs.maptopmargin, 11);
            config.origMarginLeft = pluckNumber(chartAttrs.chartleftmargin, chartAttrs.mapleftmargin, 11);
            config.origMarginBottom = pluckNumber(chartAttrs.chartbottommargin, chartAttrs.mapbottommargin, 11);
            config.origMarginRight = pluckNumber(chartAttrs.chartrightmargin, chartAttrs.maprightmargin, 11);
            style = config.style;
            inCancolor = style.inCancolor;
            inCanFontFamily = style.inCanfontFamily;
            inCanFontSize = style.inCanfontSize;
            config.entityOpts = {
                baseScaleFactor: iapi.baseScaleFactor,
                dataLabels: {
                    style: {
                        fontFamily: inCanFontFamily,
                        fontSize:  inCanFontSize,
                        lineHeight: style.inCanLineHeight,
                        // The color value is also copied back from style to the main
                        // 'dataLabels' object
                        color: style.inCancolor
                    }
                },
                fillColor: entityFillColor,
                fillAlpha: entityFillAlpha,
                fillRatio: entityFillRatio,
                fillAngle: entityFillAngle,
                borderColor: entityBorderColor,
                borderAlpha: pluck(chartAttrs.entityborderalpha, chartAttrs.borderalpha, iapi.borderAlpha, '100'),
                borderThickness: pluckNumber(chartAttrs.showentityborder, chartAttrs.showborder, 1) ?
                    pluckNumber(chartAttrs.entityborderthickness,chartAttrs.borderthickness,  1) : 0,
                scaleBorder: pluckNumber(chartAttrs.scaleentityborder, chartAttrs.scaleborder, 0),
                hoverFillColor: pluck(chartAttrs.entityfillhovercolor, chartAttrs.hoverfillcolor,
                    chartAttrs.hovercolor, palette.plothoverfillcolor),
                hoverFillAlpha: pluck(chartAttrs.entityfillhoveralpha, chartAttrs.hoverfillalpha,
                    chartAttrs.hoveralpha, palette.plothoverfillalpha),
                hoverFillRatio: pluck(chartAttrs.entityfillhoverratio, chartAttrs.hoverfillratio,
                    chartAttrs.hoverratio, palette.plothoverfillratio),
                hoverFillAngle: pluck(chartAttrs.entityfillhoverangle, chartAttrs.hoverfillangle,
                    chartAttrs.hoverangle, palette.plothoverfillangle),
                hoverBorderThickness: pluck(chartAttrs.entityborderhoverthickness, chartAttrs.hoverborderthickness),
                hoverBorderColor: pluck(chartAttrs.entityborderhovercolor, palette.plotbordercolor),
                hoverBorderAlpha: pluck(chartAttrs.entityborderhoveralpha, palette.plotborderalpha),

                nullEntityColor: nullEntityColor,
                nullEntityAlpha: pluck(chartAttrs.nullentityfillalpha, chartAttrs.nullentityalpha, entityFillAlpha),
                nullEntityRatio: pluck(chartAttrs.nullentityfillratio, chartAttrs.nullentityratio, entityFillRatio),
                nullEntityAngle: pluck(chartAttrs.nullentityfillangle, chartAttrs.nullentityangle, entityFillAngle),

                connectorColor: pluck(chartAttrs.labelconnectorcolor, chartAttrs.connectorcolor, inCancolor),
                connectorAlpha: pluck(chartAttrs.labelconnectoralpha, chartAttrs.connectoralpha, '100'),
                connectorThickness: pluckNumber(chartAttrs.labelconnectorthickness, chartAttrs.borderthickness, 1),

                showHoverEffect: pluckNumber(chartAttrs.showentityhovereffect, chartAttrs.usehovercolor,
                    chartAttrs.showhovereffect, 1),
                hoverOnNull: pluckNumber(chartAttrs.hoveronnull, chartAttrs.entityhoveronnull, 1),

                labelPadding: pluckNumber(chartAttrs.labelpadding, 5),
                showLabels: pluckNumber(chartAttrs.showlabels, 1),
                labelsOnTop: pluckNumber(chartAttrs.entitylabelsontop, 1),
                includeNameInLabels: pluckNumber(chartAttrs.includenameinlabels, 1),
                includeValueInLabels: pluckNumber(chartAttrs.includevalueinlabels, 0),
                useSNameInTooltip: pluckNumber(chartAttrs.usesnameintooltip, 0),
                useShortName: pluckNumber(chartAttrs.usesnameinlabels, 1),
                labelSepChar: pluck(chartAttrs.labelsepchar, COMMASPACE),
                showTooltip: pluckNumber(chartAttrs.showentitytooltip,
                    chartAttrs.showtooltip, 1),
                tooltipSepChar: pluck(chartAttrs.tooltipsepchar, ', '),
                tooltext: chartAttrs.entitytooltext,
                hideNullEntities: pluckNumber(chartAttrs.hidenullentities, 0),
                showHiddenEntityBorder: pluckNumber(chartAttrs.showhiddenentityborder, 1),
                showNullEntityBorder: pluckNumber(chartAttrs.shownullentityborder, 1),
                hiddenEntityColor: pluck(chartAttrs.hiddenentitycolor,
                    chartAttrs.hiddenentityfillcolor,
                    (chartAttrs.hiddenentityalpha ||
                        chartAttrs.hiddenentityfillalpha ?
                            nullEntityColor: 'ffffff')),
                hiddenEntityAlpha: pluck(chartAttrs.hiddenentityalpha,
                    chartAttrs.hiddenentityfillalpha, 0.001),

                // Plot shadow effect.
                shadow: pluckNumber(chartAttrs.showshadow,
                            iapi.defaultPlotShadow, palette.shadow)
            };

            config.markerOpts = {
                dataLabels: {
                    style: {
                        fontFamily: pluck(chartAttrs.markerfont, inCanFontFamily),
                        fontSize: pluckNumber(chartAttrs.markerfontsize, parseInt(inCanFontSize, 10)),
                        fontColor: pluck(chartAttrs.markerfontcolor, inCancolor)
                    }
                },
                showTooltip: pluckNumber(chartAttrs.showmarkertooltip, chartAttrs.showtooltip, 1),
                showLabels: pluckNumber(chartAttrs.showmarkerlabels,
                        chartAttrs.showlabels, 1),
                showHoverEffect: pluckNumber(chartAttrs.showmarkerhovereffect, 1),
                labelPadding: pluck(chartAttrs.markerlabelpadding, '5'),
                labelWrapWidth: pluckNumber(chartAttrs.markerlabelwrapwidth, 0),
                labelWrapHeight: pluckNumber(chartAttrs.markerlabelwrapheight, 0),
                fillColor: pluck(chartAttrs.markerfillcolor, chartAttrs.markerbgcolor,
                        palette.markerfillcolor), // has a legacy attr
                fillAlpha: pluck(chartAttrs.markerfillalpha, palette.markerfillalpha),
                fillAngle: pluck(chartAttrs.markerfillangle, palette.markerfillangle),
                fillRatio: pluck(chartAttrs.markerfillratio, palette.markerfillratio),
                fillPattern: pluck(chartAttrs.markerfillpattern, palette.markerbgpattern),
                hoverFillColor: chartAttrs.markerfillhovercolor,
                hoverFillAlpha: chartAttrs.markerfillhoveralpha,
                hoverFillRatio: chartAttrs.markerfillhoverratio,
                hoverFillAngle: chartAttrs.markerfillhoverangle,
                borderThickness: pluck(chartAttrs.markerborderthickness, 1),
                borderColor: pluck(chartAttrs.markerbordercolor, palette.markerbordercolor),
                borderAlpha: pluckNumber(chartAttrs.markerborderalpha, palette.markerborderalpha),
                hoverBorderThickness: chartAttrs.markerborderhoverthickness,
                hoverBorderColor: chartAttrs.markerborderhovercolor,
                hoverBorderAlpha: chartAttrs.markerborderhoveralpha,
                radius: pluckNumber((chartAttrs.markerradius && lib.trimString(chartAttrs.markerradius)), 7),
                shapeId: pluck(chartAttrs.defaultmarkershape, SHAPE_CIRCLE),
                labelSepChar: pluck(chartAttrs.labelsepchar, COMMASPACE),
                tooltipSepChar: pluck(chartAttrs.tooltipsepchar, ', '),
                autoScale: pluckNumber(chartAttrs.autoscalemarkers, 0),
                tooltext: pluck(markerAttrs && markerAttrs.tooltext, chartAttrs.markertooltext),

                /* Value related attributes */
                dataEnabled: markerDataEnabled,
                valueToRadius: pluckNumber(chartAttrs.markerradiusfromvalue, 1),
                valueMarkerAlpha: pluck(chartAttrs.valuemarkeralpha, '75'),
                hideNull: pluckNumber(chartAttrs.hidenullmarkers, 0),
                nullRadius: pluckNumber(chartAttrs.nullmarkerradius, chartAttrs.markerradius, 7),
                adjustViewPort: pluckNumber(chartAttrs.adjustviewportformarkers, 0),
                startAngle: pluckNumber(chartAttrs.markerstartangle, 90),
                maxRadius: pluckNumber(chartAttrs.maxmarkerradius, 0),
                minRadius: pluckNumber(chartAttrs.minmarkerradius, 0),
                applyAll: pluckNumber(chartAttrs.applyallmarkers, 0),
                shadow: pluckNumber(chartAttrs.showmarkershadow,
                    chartAttrs.showshadow, 0)
            };
            config.connectorOpts = {
                showHoverEffect: pluckNumber(chartAttrs.showconnectorhovereffect, 1),
                thickness: pluckNumber(chartAttrs.connectorthickness,
                    chartAttrs.markerconnthickness, '2'),
                color: pluck(chartAttrs.connectorcolor,
                    chartAttrs.markerconncolor, palette.markerbordercolor),
                alpha: pluck(chartAttrs.connectoralpha,
                    chartAttrs.markerconnalpha, '100'),
                hoverThickness: pluckNumber(chartAttrs.connectorhoverthickness,
                    chartAttrs.connectorthickness,
                    chartAttrs.markerconnthickness, '2'),
                hoverColor: pluck(chartAttrs.connectorhovercolor,
                    chartAttrs.connectorcolor, chartAttrs.markerconncolor,
                    palette.markerbordercolor),
                hoverAlpha: pluck(chartAttrs.connectorhoveralpha,
                    chartAttrs.connectoralpha, chartAttrs.markerconnalpha, '100'),
                dashed: pluckNumber(chartAttrs.connectordashed,
                    chartAttrs.markerconndashed, 0),
                dashLen: pluckNumber(chartAttrs.connectordashlen,
                    chartAttrs.markerconndashlen, 3),
                dashGap: pluckNumber(chartAttrs.connectordashgap,
                    chartAttrs.markerconndashgap, 2),
                font: pluck(chartAttrs.connectorfont,
                    chartAttrs.markerconnfont, inCanFontFamily),
                fontColor: pluck(chartAttrs.connectorfontcolor,
                    chartAttrs.markerconnfontcolor, inCancolor),
                fontSize: pluckNumber(chartAttrs.connectorfontsize,
                    chartAttrs.markerconnfontsize,
                    parseInt(inCanFontSize, 10)),
                showLabels: pluckNumber(chartAttrs.showconnectorlabels, chartAttrs.showmarkerlabels,
                    chartAttrs.showlabels, 1),
                labelBgColor: pluck(chartAttrs.connectorlabelbgcolor,
                    chartAttrs.markerconnlabelbgcolor,
                    palette.plotfillcolor),
                labelBorderColor: pluck(chartAttrs.connectorlabelbordercolor,
                    chartAttrs.markerconnlabelbordercolor,
                    palette.markerbordercolor),
                shadow: pluckNumber(chartAttrs.showconnectorshadow,
                    chartAttrs.showmarkershadow,
                    chartAttrs.showshadow, 0),
                showTooltip: pluckNumber(chartAttrs.showconnectortooltip,
                    chartAttrs.showmarkertooltip,
                    chartAttrs.showtooltip, 1),
                tooltext: pluck(markerAttrs && markerAttrs.connectortooltext, chartAttrs.connectortooltext),
                hideOpen: pluckNumber(chartAttrs.hideopenconnectors, 1)
            };
            config.adjustViewPortForMarkers = pluckNumber(chartAttrs.adjustviewportformarkers, markerDataEnabled);
        },
        _createLayers: function () {
            var iapi =this,
                graphics = iapi.graphics || (iapi.graphics = { }),
                components = iapi.components,
                paper = components.paper;
            //***** Create elements or components required for drawing

            // create elements if they are not available
            graphics = iapi.graphics;
            graphics.backgroundGroup = graphics.backgroundGroup || paper.group ('background');
            graphics.canvasGroup = graphics.canvasGroup || paper.group ('canvas');
            graphics.shadowGroup = graphics.shadowGroup || paper.group ('shadow');
            graphics.datasetGroup = graphics.datasetGroup || paper.group ('dataset');
            graphics.datalabelsGroup = graphics.datalabelsGroup || paper.group ('datalabel');
            graphics.legendGroup = graphics.legendGroup || paper.group ('legend');
            graphics.captionGroup = graphics.captionGroup || paper.group ('caption');
            graphics.captionGroup.trackTooltip(true);
            graphics.datasetGroup.trackTooltip(true);
            graphics.buttonGroup = graphics.buttonGroup || paper.group ('buttons');
            iapi._attachMouseEvents();
        },
        _attachMouseEvents: function () {
            var iapi = this,
                linkedItems = iapi.linkedItems,
                listeners = linkedItems.eventListeners || (linkedItems.eventListeners = []),
                containerElem = iapi.linkedItems.container;

            //remove any existing events if any
            removeEvent(containerElem, hasTouch ? 'touchstart' : 'mousemove', iapi.searchMouseMove);
            //adds to event stack.
            listeners.push(addEvent(containerElem, 'touchstart mousemove', iapi.searchMouseMove, iapi));
        },
        searchMouseMove: function (e) {
            var mousePos,
                chart = e.data,
                chartConfig = chart.config,
                lastMouseCoordinate = {};

            if (!chart.linkedItems.container) {
                return;
            }

            //check if the event is fired within the canvas region.
            if ((mousePos = isWithinCanvas(e, chart)) && mousePos.insideCanvas) {
                //store the evnt object. This will be used to generate event on same coordinate
                chartConfig.lastMouseEvent = e;
                lastMouseCoordinate = {
                    x: mousePos.chartX,
                    y: mousePos.chartY
                };

                //search the best neighbouring point of the mouse moved point.
                chart._searchNearestNeighbour(lastMouseCoordinate);
            }
        },
        _searchNearestNeighbour: function (point) {
            var iapi = this,
                datasets = iapi.components.dataset,
                markers = datasets[1],
                kdPoint;


            if (markers) {
                if (!markers.components.kDTree) {
                    return;
                }
                //searches the nearest neighbouring point of the input point.
                kdPoint = markers.getElement(point);
                if (kdPoint) {
                    iapi.config.lastHoveredPoint !== kdPoint && markers.highlightPoint(kdPoint);
                }
                else {
                    markers.highlightPoint(false);
                }
            }
        },
        _createDatasets: function () {
            var iapi = this,
                components = iapi.components,
                dataObj = iapi.jsonData,
                i,
                datasetObj,
                dsType = iapi.defaultDatasetType,
                entityJSONData = dataObj.data || {},
                markerJSONData = dataObj.markers,
                count = 0,
                type,
                datasetStore = iapi.components.dataset,
                DsClass;

            datasetStore = components.dataset  || (components.dataset = []);
            dsType = dsType && dsType.toLowerCase ();

            /// get the DsClass
            DsClass = FusionCharts.get('component', ['dataset', 'Entities']);
            if (DsClass) {
                if (!datasetStore[count]) {
                    // create the dataset Object
                    datasetObj = new DsClass ();
                    datasetStore.push (datasetObj);
                    datasetObj.chart = iapi;
                    datasetObj.index = i;

                    datasetObj.init (entityJSONData);
                }
                else {
                    datasetStore[count].JSONData = entityJSONData;
                    datasetStore[count].configure();
                }
                count++;
            }
            DsClass = FusionCharts.get('component', ['dataset', 'Markers']);
            datasetObj = datasetStore[count];
            if (DsClass && markerJSONData) {
                if (!datasetStore[count]) {
                    // create the dataset Object
                    datasetObj = new DsClass ();
                    datasetStore.push (datasetObj);
                    datasetObj.chart = iapi;
                    datasetObj.index = i;

                    datasetObj.init (markerJSONData);
                }
                else {
                    datasetObj.index = i;
                    datasetObj.init (markerJSONData);
                    datasetStore[count].configure();
                }
            }
            else {
                type = datasetObj && datasetObj.type;
                if (type === 'markers') {
                    datasetStore.splice(count, 1);
                }
            }
        },
        _parseBackgroundCosmetics: function () {
            var iapi = this,
                components = iapi.components,
                background = components.background,
                config = background.config,
                palette = iapi.components.colorPalette,
                chartAttrs = iapi.jsonData.chart,
                showBorder,
                chartBorderWidth;
            showBorder = config.showBorder = pluckNumber (chartAttrs.showcanvasborder, 1);
            config.borderWidth = chartBorderWidth = showBorder ? pluckNumber (chartAttrs.canvasborderthickness, 1) : 0;
            config.borderRadius = config.borderRadius = pluckNumber (chartAttrs.canvasborderradius, 0);
            config.borderDashStyle = config.borderDashStyle =  pluckNumber (chartAttrs.borderdashed, 0) ?
                getDashStyle (pluckNumber (chartAttrs.borderdashlen, 4),
                    pluckNumber (chartAttrs.borderdashgap, 2), chartBorderWidth) : DASH_DEF,
            config.borderColor = config.borderColor = convertColor (pluck (chartAttrs.canvasbordercolor,
                palette && palette.borderColor));
            config.borderAlpha = pluck (chartAttrs.canvasborderalpha,
                palette.borderAlpha);
        },
        _getBackgroundCosmetics: function () {
            var iapi = this,
                components = iapi.components,
                chartAttrs = iapi.jsonData.chart || iapi.jsonData.map,
                palette = components.colorPalette;

            return {
                FCcolor : {
                    color : pluck (chartAttrs.bgcolor, chartAttrs.canvasbgcolor,
                        palette.bgcolor),
                    alpha : pluck (chartAttrs.bgalpha, chartAttrs.canvasbgalpha,
                        palette.bgalpha),
                    angle : pluck (chartAttrs.bgangle, chartAttrs.canvasbgangle,
                        palette.bgangle),
                    ratio : pluck (chartAttrs.bgratio, chartAttrs.canvasbgratio,
                        palette.bgratio)
                }
            };
        },
        _parseCanvasCosmetics: function () {
            var iapi = this,
                config = iapi.config,
                chartAttrs = iapi.jsonData.chart || iapi.jsonData.map,
                components = iapi.components,
                canvasConfig = components.canvas.config;

            // borderThickness = pluckNumber(chartAttrs.showborder, 1) ? pluckNumber(chartAttrs.borderthickness, 1) : 0;
            // chart margins
            config.origMarginTop = pluckNumber(chartAttrs.maptopmargin, 11);
            config.origMarginLeft = pluckNumber(chartAttrs.mapleftmargin, 11);
            config.origMarginBottom = pluckNumber(chartAttrs.mapbottommargin, 11);
            config.origMarginRight = pluckNumber(chartAttrs.maprightmargin, 11);

            config.origCanvasLeftMargin = pluckNumber(chartAttrs.canvasleftmargin, 0);
            config.origCanvasRightMargin = pluckNumber(chartAttrs.canvasrightmargin, 0);
            config.origCanvasTopMargin = pluckNumber(chartAttrs.canvastopmargin, 0);
            config.origCanvasBottomMargin = pluckNumber(chartAttrs.canvasbottommargin, 0);

            canvasConfig.canvasBorderRadius = pluckNumber(chartAttrs.canvasborderradius, 0);
            // canvas padding
            canvasConfig.origCanvasTopPad = pluckNumber(chartAttrs.canvastoppadding, 0);
            canvasConfig.origCanvasBottomPad = pluckNumber(chartAttrs.canvasbottompadding, 0);
            canvasConfig.origCanvasLeftPad = pluckNumber(chartAttrs.canvasleftpadding, 0);
            canvasConfig.origCanvasRightPad = pluckNumber(chartAttrs.canvasrightpadding, 0);
        },
        draw: function () {
            var iapi = this;
            iapi.config.entitiesDrawn = false;
            if (iapi.config.hasChartMessage) {
                iapi._hide();
                iapi.drawChartMessage();
            }
            else {
                //show the chart if hidden
                iapi._show();

                iapi.chartMenuTools.reset(iapi.components.tb, iapi);
                //create any scroll elements if any.
                iapi._createToolBox ();
                // allocate space to all components
                iapi._manageSpace();
                // draw elements finally
                iapi._updateVisuals();
                iapi.inited = true;
                iapi.chartInstance.jsVars.drawCount += 1;
                iapi.chartInstance.__state.dataReady = true;
                iapi.chartInstance.jsVars.hasNativeMessage = false;
            }
        },
        _drawDataset : function () {
            var iapi = this,
                chartInstance = iapi.chartInstance,
                dataset = iapi.components.dataset,
                layers = iapi.graphics,
                length = dataset.length,
                scalingParams = iapi.config.scalingParams,
                transformGroup = function () {
                    return function (event) {
                        event.detachHandler(); // one time
                        if (hasSVG) {
                            layers.datasetGroup && layers.datasetGroup.attr({
                                transform: scalingParams.transformStr
                            });
                            layers.shadowGroup && layers.shadowGroup.attr({
                                transform: scalingParams.transformStr
                            });
                        }
                        // display the layers for both VML and SVG
                        layers.datasetGroup && layers.datasetGroup.show();
                        layers.shadowGroup && layers.shadowGroup.show();
                    };
                },
                i;
            layers.datasetGroup.hide();
            layers.shadowGroup.hide();
            iapi.config.entitiesReady = false;
            chartInstance.addEventListener('internal.mapdrawingcomplete', transformGroup());
            for (i = 0; i < length; i++) {
                dataset[i].draw();
            }
            iapi.checkComplete();
        },
        /*
         * This method to determine if the dimensions of the graphic (map) need to
         * be altered to accomodate markers within them.
         *
         * Only the x and y are used here as this calculation is primarily for the
         * properties that will be scaled up and down with the graphic (map).
         *
         * ~param {object} hc
         * ~param {object} fc
         *
         * ~return {object} The min and max co-ordinates of the markers,
         * excluding the space needed for the radius which will be accounted for later.
         */
        preliminaryScaling: function () {

            var iapi = this,
                jsonData = iapi.jsonData,
                markerArray = (jsonData.markers && jsonData.markers.items) || [],
                i = (markerArray && markerArray.length) || 0,
                minX = Infinity,
                minY = Infinity,
                maxX = -Infinity,
                maxY = -Infinity,
                x,
                y,
                item;

            while (i--) {
                item = markerArray[i];

                x = Number(item.x);
                y = Number(item.y);

                minX = mathMin(minX, x);
                minY = mathMin(minY, y);
                maxX = mathMax(maxX, x);
                maxY = mathMax(maxY, y);
            }

            return {
                x: minX,
                y: minY,
                x1: maxX,
                y1: maxY
            };
        },

        /*
         * This method returns the scale factor and translate factors when a graphic
         * of provided dimensions has to be scaled to best fit into a view port of
         * provided dimensions.
         *
         * ~param {number} wg, width of the graphic
         * ~param {number} hg, height of the graphic
         * ~param {number} wv, width of the viewport
         * ~param {number} hv, height of the viewport
         *
         * ~returns {object}
         */
        getScalingParameters: function (wg, hg, wv, hv) {
            var iapi = this,
                aspR = wg / hg,
                widthScaleR = (wv / (wg * iapi.baseScaleFactor)),
                heightScaleR = (hv / (hg * iapi.baseScaleFactor)),
                translateX = 0,
                translateY = 0,
                scaleFactor,
                strokeWidth;

            if (widthScaleR > heightScaleR) {
                scaleFactor = heightScaleR;
                translateX += (wv - (hv * aspR)) / 2;
                strokeWidth = (200 / (hg * scaleFactor));
            }
            else {
                scaleFactor = widthScaleR;
                translateY += (hv - (wv / aspR)) / 2;
                strokeWidth = (200 / (wg * scaleFactor));
            }

            return {
                scaleFactor: scaleFactor,
                strokeWidth: strokeWidth,
                translateX: translateX,
                translateY: translateY
            };
        },

        /*
         * Assigns to markers radii normalized using that value of the marker. If
         * marker does not have a value then user provided radius or default radius
         * is assumed. The bounding box for each marker is then obtained using the
         * radius and total overflow on each side of the map canvas is returned in
         * an object.
         *
         * ~param {object} hc
         * ~param {object} fc
         * ~param {number} scaleFactor, the scaleFactor applied to the map
         * ~param {number} xOffset, if a markers co-ordinates are given in -ve
         * co-ordinates then an offset needs to be added to the marker position
         * to account for it.
         * ~param {number} yOffset
         *
         * ~return {object}
         */
         // @todo Need to transfer this function to a more appropriate place
        calculateMarkerBounds: function (scaleFactor, xOffset, yOffset) {

            var iapi = this,
                config = iapi.config,
                markerOptions = config.markerOpts,
                datasets = iapi.components.dataset,
                limits = iapi.getDataLimits(),
                dataMin = limits.dataMin,
                dataMax = limits.dataMax,
                hideNull = markerOptions.hideNull,
                nullRadius = markerOptions.nullRadius,
                v2r = markerOptions.valueToRadius,
                markerDataset,
                markerConf,
                minR,
                maxR,
                markerArray,
                i,
                type,
                dataset,
                len,
                minX = Infinity,
                minY = Infinity,
                maxX = -Infinity,
                maxY = -Infinity,
                x,
                y,
                r,
                definition,
                item;

            for (i = 0, len = datasets.length; i < len; i++) {
                dataset = datasets[i];
                type = dataset.type;
                if (type === 'markers') {
                    markerDataset = dataset;
                }
            }

            if (markerDataset) {
                markerDataset.calculateMarkerRadiusLimits();
                markerConf = markerDataset.conf || {};
                minR = markerConf.minRadius,
                maxR = markerConf.maxRadius;
                markerArray = (markerDataset.components && markerDataset.components.markerObjs) || {};

                for (i in markerArray) {
                    item = markerArray[i];
                    config = item.config;
                    definition = config.definition || {};
                    if (config.cleanValue !== null) {
                        if (v2r && definition.radius === UNDEFINED) {
                            config.radius = minR + ((maxR - minR) * (config.cleanValue - dataMin) /
                                (dataMax - dataMin));
                        }
                    }
                    else {
                        if (hideNull) {
                            config.__hideMarker = true;
                        }
                        else if (config.radius === null) {
                            config.radius = nullRadius;
                        }
                        continue;
                    }
                    r = Number(config.radius);
                    x = (Number(definition.x) + xOffset) * scaleFactor;
                    y = (Number(definition.y) + yOffset) * scaleFactor;

                    // These values will be scaled along with the graphic
                    minX = mathMin(minX, x - r);
                    minY = mathMin(minY, y - r);
                    maxX = mathMax(maxX, x + r);
                    maxY = mathMax(maxY, y + r);
                }
            }


            return {
                x: minX,
                y: minY,
                x1: maxX,
                y1: maxY
            };
        },
        _spaceManager: function () {
            // todo marge _allocateSpace and _spacemanager
            var availableHeight,
                iapi = this,
                config = iapi.config,
                components = iapi.components,
                legend = components.legend,
                legendPosition = legend.config.legendPos,
                chartAttrs = iapi.jsonData.chart,
                showBorder = config.showBorder,
                translateX = config.origMarginLeft,
                translateY = config.origMarginTop,
                wg = iapi.baseWidth,
                hg = iapi.baseHeight,
                scalingParams,
                wv,
                hv,
                sFactor,
                extraMarkerSpace = {},
                xDifference = 0,
                yDifference = 0,
                initHv,
                initWv,
                allottedSpace,
                topSpace,
                markerOptions = config.markerOpts,
                chartBorderWidth =
                    config.borderWidth = showBorder ? pluckNumber (chartAttrs.borderthickness, 1) : 0;

            iapi._allocateSpace ( {
                top : chartBorderWidth,
                bottom : chartBorderWidth,
                left : chartBorderWidth,
                right : chartBorderWidth
            });
            iapi._allocateSpace(iapi._manageActionBarSpace &&
                iapi._manageActionBarSpace(config.availableHeight * 0.225) || {});

            if (legendPosition === 'right') {
                allottedSpace = config.canvasWidth * 0.3;
            }
            else {
                allottedSpace = config.canvasHeight * 0.3;
            }
            iapi._manageLegendSpace(allottedSpace);
            availableHeight = (legendPosition === POSITION_BOTTOM) ? config.canvasHeight * 0.225 :
                config.canvasWidth * 0.225;

            // a space manager that manages the space for the tools as well as the captions.
            topSpace = iapi._manageChartMenuBar(availableHeight);
            wv = config.canvasWidth;
            hv = config.canvasHeight;
            if (markerOptions.dataEnabled) {
                if (config.adjustViewPortForMarkers) {
                    // Calculate the overflow of the scaled properties (x, y)
                    extraMarkerSpace = iapi.preliminaryScaling();

                    if (extraMarkerSpace.x1 > wg) {
                        wg = extraMarkerSpace.x1;
                    }

                    if (extraMarkerSpace.x < 0) {
                        wg += (-extraMarkerSpace.x);
                        xDifference = (-extraMarkerSpace.x);
                    }

                    if (extraMarkerSpace.y1 > hg) {
                        hg = extraMarkerSpace.y1;
                    }

                    if (extraMarkerSpace.y < 0) {
                        hg += (-extraMarkerSpace.y);
                        yDifference = (-extraMarkerSpace.y);
                    }

                    // Get the scale factor and translate factors
                    scalingParams = iapi.getScalingParameters(wg, hg, wv, hv);

                    // Assign radii to the markers that have a value but no radius.
                    // Calculate the overflow of the radius (unscaled property).
                    extraMarkerSpace = iapi.calculateMarkerBounds(
                        scalingParams.scaleFactor * iapi.baseScaleFactor, xDifference, yDifference);

                    /**
                     * @todo: Check if the wv and hv become less than a certain limit.
                     * If they do reduce the radii of the markers.
                     */
                    initHv = hv;
                    initWv = wv;

                    if (extraMarkerSpace.x < 0) {
                        translateX += (-extraMarkerSpace.x);
                        wv += extraMarkerSpace.x;
                    }

                    if (extraMarkerSpace.y < 0) {
                        translateY += (-extraMarkerSpace.y);
                        hv += extraMarkerSpace.y;
                    }

                    if (extraMarkerSpace.x1 > initWv) {
                        wv -= (extraMarkerSpace.x1 - initWv);
                    }

                    if (extraMarkerSpace.y1 > initHv) {
                        hv -= (extraMarkerSpace.y1 - initHv);
                    }
                }
                else {
                    // Get the scale factor and translate factors
                    scalingParams = iapi.getScalingParameters(wg, hg, wv, hv);

                    // Assign radii to the markers that have a value but no radius.
                    // Calculate the overflow of the radius (unscaled property).
                    iapi.calculateMarkerBounds(scalingParams.scaleFactor * iapi.baseScaleFactor,
                        xDifference, yDifference);
                }

                // Recalculate the scale factor after accounting for radii.
                scalingParams = iapi.getScalingParameters(wg, hg, wv, hv);
                translateX += (xDifference * scalingParams.scaleFactor * iapi.baseScaleFactor);
                translateY += (yDifference * scalingParams.scaleFactor * iapi.baseScaleFactor);
            }
            else {
                scalingParams = iapi.getScalingParameters(wg, hg, wv, hv);
            }
            iapi.config.scalingParams = scalingParams;
            sFactor = scalingParams.scaleFactor;
            scalingParams.translateX = scalingParams.translateX + translateX;
            scalingParams.translateY = scalingParams.translateY + translateY + topSpace.top || 0;
            scalingParams.sFactor = (sFactor * iapi.baseScaleFactor * 100) / 100;
            scalingParams.transformStr = ['t', scalingParams.translateX, ',', scalingParams.translateY,
                's', sFactor, ',', sFactor, ',0,0'].join('');

            iapi.config.annotationConfig = {
                id: GEO,
                showbelow: 0,
                autoscale: 0,
                grpxshift: (scalingParams.translateX ? scalingParams.translateX : 0),
                grpyshift: (scalingParams.translateY ? scalingParams.translateY : 0),
                xscale: (sFactor ? sFactor * iapi.baseScaleFactor : 1) * 100,
                yscale: (sFactor ? sFactor * iapi.baseScaleFactor : 1) * 100,
                options: { useTracker: true }
            };

            iapi.components.mapAnnotations.reset(null, iapi.config.annotationConfig, iapi);
            iapi.components.mapAnnotations._renderer && (iapi.components.mapAnnotations._renderer = null);
        },

        getDataLimits: function () {
            var iapi = this,
                datasets = iapi.components.dataset,
                length = datasets.length,
                dataset,
                dataMin = +Infinity,
                dataMax = -Infinity,
                limits,
                i;
            for (i = 0; i < length; i++) {
                dataset = datasets[i];
                limits = dataset.getDataLimits();
                dataMin = mathMin(dataMin, limits.min);
                dataMax = mathMax(dataMax, limits.max);
            }
            return {
                dataMin: dataMin,
                dataMax: dataMax
            };
        },
        getEntityPaths: function (copy) {
            var returnObj = {},
                ents = this.entities,
                id;

            if (copy) {
                for (id in ents) {
                    returnObj[id] = ents[id];
                }
                return returnObj;
            }
            else {
                return ents;
            }
        },
        checkComplete: function () {
            var iapi = this,
                jobList = iapi.getJobList(),
                mapAnnotations = iapi.components.mapAnnotations,
                mapLabelAnnotations = iapi.components.mapLabelAnnotations || [],
                len = mapLabelAnnotations.length,
                annotations,
                i,
                entityLabelsOnTop = iapi.config.entityOpts.labelsOnTop,
                annotationGroup,
                labelAnnotationGroup,
                callback = function () {
                    iapi.config.labelDrawCount++;
                    if (iapi.config.labelDrawCount === len && entityLabelsOnTop) {
                        annotationGroup = mapAnnotations.groups && mapAnnotations.groups[0] &&
                            mapAnnotations.groups[0].wrapper;
                        if (annotationGroup) {
                            for (i = 0; i < len; i++) {
                                labelAnnotationGroup = mapLabelAnnotations[i].groups[0] &&
                                    mapLabelAnnotations[i].groups[0].wrapper;
                                labelAnnotationGroup && labelAnnotationGroup.insertAfter(annotationGroup);
                            }
                        }
                    }
                },
                drawLabelAnnotations = function () {
                    for (i = 0; i < len; i++) {
                        annotations = mapLabelAnnotations[i];
                        jobList.labelDrawID.push(schedular.addJob(annotations.draw, annotations,
                            [iapi, true], lib.priorityList.label, true, callback));
                    }
                };

            iapi.config.labelDrawCount = 0;
            if (iapi.config.entityFlag && iapi.config.entitiesReady) {
                iapi.config.entityFlag = false;

                drawLabelAnnotations();
                mapAnnotations.draw(iapi);
                iapi.config.markersDrawn = true;
                // jobList.labelDrawID.push(schedular.addJob(mapAnnotations.draw, mapAnnotations,
                //     [iapi], lib.priorityList.label));
                global.raiseEvent('internal.mapdrawingcomplete', {
                    renderer: iapi
                }, iapi.chartInstance);
            }
        },
        colorPaletteMap: {
            basefontcolor: 'foregroundcolor',
            bordercolor: 'foregrounddarkcolor',
            borderalpha: 'foregrounddarkalpha',
            bgcolor: 'backgroundlightcolor',
            bgalpha: 'backgroundlightalpha',
            bgangle: 'backgroundlightangle',
            bgratio: 'backgroundlightratio',
            canvasbordercolor: 'foregrounddarkcolor',
            canvasborderalpha: 'foregrounddarkalpha',
            canvasbgcolor: 'backgroundlightcolor',
            canvasbgalpha: 'backgroundlightalpha',
            canvasbgangle: 'backgroundlightangle',
            canvasbgratio: 'backgroundlightratio',
            tooltipbordercolor: 'foregrounddarkcolor',
            tooltipborderalpha: 'foregrounddarkalpha',
            tooltipbgcolor: 'backgroundlightcolor',
            tooltipbgalpha: 'backgroundlightalpha',
            tooltipfontcolor: 'foregroundcolor',
            legendbordercolor: 'foregrounddarkcolor',
            legendborderalpha: 'foregrounddarkalpha',
            markerbordercolor: 'foregroundlightcolor',
            markerborderalpha: 'foregroundlightalpha',
            markerfillcolor: 'backgrounddarkcolor',
            markerfillalpha: 'backgrounddarkalpha',
            markerfillangle: 'backgrounddarkangle',
            markerfillratio: 'backgrounddarkratio',
            plotfillcolor: 'backgroundcolor',
            plotfillalpha: 'backgroundalpha',
            plotfillangle: 'backgroundangle',
            plotfillratio: 'backgroundratio',
            plothoverfillcolor: 'backgrounddarkcolor',
            plothoverfillalpha: 'backgrounddarkalpha',
            plothoverfillangle: 'backgrounddarkangle',
            plothoverfillratio: 'backgrounddarkratio',
            plotbordercolor: 'foregroundcolor',
            plotborderalpha: 'foregroundalpha',
            shadow: 'shadow'
        },
        eiMethods: {
            getMapName: function () {
                var chart = this,
                    iapi = chart.jsVars.instanceAPI,
                    mapName = typeof iapi.name === 'string' && iapi.name.toLowerCase();
                return mapName;
            },

            getEntityList: function () {
                var chart = this,
                    iapi = chart.jsVars.instanceAPI,
                    datasets = iapi.components.dataset || [],
                    i,
                    entities,
                    dataset,
                    len = datasets.length,
                    entityList = [],
                    data,
                    entityObj,
                    config,
                    type;

                for (i = 0; i < len; i++) {
                    dataset = datasets[i] || [];
                    type = dataset.type;
                    if (type === 'entity') {
                        entities = dataset;
                        break;
                    }
                }

                data = entities.components.data;
                len = data.length;
                for (i in data) {
                    if (data.hasOwnProperty(i)) {
                        entityObj = data[i] || {};
                        config = entityObj.config || {};
                        entityList.push({
                            id: config.id,
                            originalId: (config.originalId || config.id),
                            label: config.label,
                            shortlabel: config.shortLabel,
                            value: config.value,
                            formattedValue: config.formattedValue,
                            toolText: config.toolText
                        });
                    }
                }
                return entityList;
            },

            getMapAttribute: function () {
                var chartObj = this;

                global.raiseWarning(this, '12061210581', 'run', 'JavaScriptRenderer~getMapAttribute()',
                    'Use of deprecated "getMapAttribute()". Replace with "getChartAttribute()".');
                return chartObj.getChartAttribute.apply(chartObj, arguments);
            },
            exportMap: function () {
                var chartObj = this;

                global.raiseWarning(this, '12061210581', 'run', 'JavaScriptRenderer~exportMap()',
                    'Use of deprecated "exportMap()". Replace with "exportChart()".');
                return chartObj.exportChart &&
                    chartObj.exportChart.apply(chartObj, arguments);
            },

            addMarker: function (options) {
                var iapi = this.jsVars.instanceAPI,
                    datasets = iapi.components.dataset || [],
                    len = datasets.length,
                    i,
                    dataset,
                    markers,
                    type;

                for (i = 0; i < len; i++) {
                    dataset = datasets[i] || [];
                    type = dataset.type;
                    if (type === 'markers') {
                        markers = dataset;
                        break;
                    }
                }

                if (markers && !markers.addMarkerItem(options)) {
                    global.raiseWarning(this, '1309264086', 'run', 'MapsRenderer~addMarker()',
                        'Failed to add marker. Check the options and try again.');
                }
            },

            updateMarker: function (id, options) {
                var iapi = this.jsVars.instanceAPI,
                    datasets = iapi.components.dataset || [],
                    len = datasets.length,
                    i,
                    dataset,
                    markers,
                    type;

                for (i = 0; i < len; i++) {
                    dataset = datasets[i] || [];
                    type = dataset.type;
                    if (type === 'markers') {
                        markers = dataset;
                        break;
                    }
                }

                if (markers && id) {
                    id = (id + BLANK).toLowerCase();
                    markers.updateMarkerItem(id, options);
                }
            },

            removeMarker: function (id) {
                var iapi = this.jsVars.instanceAPI,
                    datasets = iapi.components.dataset || [],
                    len = datasets.length,
                    i,
                    dataset,
                    markers,
                    type;

                for (i = 0; i < len; i++) {
                    dataset = datasets[i] || [];
                    type = dataset.type;
                    if (type === 'markers') {
                        markers = dataset;
                        break;
                    }
                }

                if (id) {
                    id = (id + BLANK).toLowerCase();

                    markers._removeMarkerItem(id);
                }
            }
        },
        _createAxes: function () {

        }

    }, chartAPI.mscartesian);

    FusionCharts.register(COMPONENT, ['caption', 'MapCaption', {
        configure: function () {
            var iapi = this.chart,
                chartConfig = iapi.config,
                chartAttrs = iapi.jsonData.chart,
                components = iapi.components,
                caption = components.caption,
                captionConfig = caption.config,
                style = chartConfig.style,
                outCanfontFamily = style.outCanfontFamily,
                outCancolor = style.outCancolor,
                fontSize = style.fontSize,
                align = ['top', 'center'],
                subCaptionConfig = components.subCaption.config;

            //subCaptionStyle = subCaptionConfig.style;
            captionConfig.style = {
                fontFamily: pluck (chartAttrs.captionfont, outCanfontFamily),
                color: convertColor(pluck (chartAttrs.captionfontcolor, outCancolor).
                                    replace (/^#? ([a-f0-9]+)/ig, '#$1')),
                fontSize: pluckNumber (chartAttrs.captionfontsize, (fontSize + 3)) + PXSTRING,
                fontWeight: pluckNumber (chartAttrs.captionfontbold) === 0 ? 'normal' : 'bold'
            };

            captionConfig.align = subCaptionConfig.align = pluck (chartAttrs.captionposition, POSITION_CENTER);

            if (captionConfig.align) {
                align = captionConfig.align.split('-');
                align[0] && (align[0] = align[0].toLowerCase());
                align[1] && (align[1] = align[1].toLowerCase());
            }

            if (align[0] === 'bottom') {
                captionConfig.isOnTop = subCaptionConfig.isOnTop = 0;
            }
            else {
                captionConfig.isOnTop = subCaptionConfig.isOnTop = 1;
            }

            switch (align[1]) {
                case POSITION_RIGHT :
                    captionConfig.align = POSITION_END;
                    break;
                case POSITION_LEFT :
                    captionConfig.align = POSITION_START;
                    break;
                default :
                    captionConfig.align = POSITION_MIDDLE;
            }
            captionConfig.alignWithCanvas = subCaptionConfig.alignWithCanvas =
                pluckNumber (chartAttrs.aligncaptionwithcanvas, 1);
            captionConfig.horizontalPadding = subCaptionConfig.horizontalPadding = pluckNumber (
                chartAttrs.captionhorizontalpadding, (captionConfig.alignWithCanvas ? 0 : 15));
            captionConfig.drawCaption = true;
            setLineHeight (captionConfig.style);

            subCaptionConfig.style = {
                fontFamily: pluck (chartAttrs.subcaptionfont, chartAttrs.captionfont, outCanfontFamily),
                color: convertColor(pluck (chartAttrs.subcaptionfontcolor, chartAttrs.captionfontcolor, outCancolor).
                                    replace (/^#? ([a-f0-9]+)/ig, '#$1')),
                fontSize: (pluckNumber (
                    chartAttrs.subcaptionfontsize,
                        (pluckNumber (mathMax (pluckNumber (chartAttrs.captionfontsize) - 3, -1), fontSize) +
                        pluckNumber (this.subTitleFontSizeExtender, 1))
                    ) + PXSTRING),
                fontWeight: pluckNumber (chartAttrs.subcaptionfontbold, this.subTitleFontWeight,
                    chartAttrs.captionfontbold) === 0 ? 'normal' : 'bold'
            };
            setLineHeight (subCaptionConfig.style);
        }
    }, 'Caption']);
    FusionCharts.register('component', ['dataset', 'Entities', {
        customConfigFn : '_createDatasets',
        type: 'entity',
        pIndex : 2,
        configure: function () {
            var dataset = this,
                chart = dataset.chart,
                rawData = chart.jsonData,
                conf = dataset.conf,
                components = chart.components,
                mapAttrs = rawData.map || rawData.chart,
                entityJSONData,
                colorRangeObj = rawData.colorrange || {},
                ColorRangeManager = lib.nonGradientColorRange,
                isGradient = colorRangeObj.gradient,
                postLegendInitFn = components.postLegendInitFn,
                numberFormatter = components.numberFormatter,
                entities,
                dataItem,
                entityItem,
                item,
                limits = {},
                entityDef = rawData.entitydef || [];


            if (rawData.data && rawData.data[0] && rawData.data[0].data) {
                entityJSONData = dataset.JSONData = rawData.data[0].data || [];
            }
            else {
                entityJSONData = dataset.JSONData = rawData.data || [];
            }
            conf.useSNameAsId =  pluckNumber(mapAttrs.usesnameasid, 0);
            this._redefineEntities(entityDef);
            entities = dataset.components.data;
            conf.showTooltip = pluckNumber(mapAttrs.showtooltip, 1);
            conf.showHoverEffect = pluckNumber(mapAttrs.showhovereffect, 0);
            entityJSONData = convertArrayToIdMap(entityJSONData);
            dataset.calculateDataLimits();
            limits = dataset.getDataLimits();
            if (isGradient) {
                postLegendInitFn({
                    min: limits.min,
                    max: limits.max
                });
            }
            else {
                dataset.components.colorRange = new ColorRangeManager({
                    colorRange: rawData.colorrange,
                    dataMin: limits.min,
                    dataMax: limits.max,
                    defaultColor: '#00ff00',
                    numberFormatter: numberFormatter
                });
            }
            for (item in entities) {
                dataItem = entityJSONData[item];
                entityItem = entities[item];
                entityItem.dataset = dataset;
                if (dataItem) {
                    // Work on a copy of dataItem
                    this._configureEntity(item, entityItem,
                        imprint(dataset._sanitizeEntityOptions(extend2({},dataItem)), entityItem.config));
                }
                else {
                    this._configureEntity(item, entityItem, entityItem.config);
                }
            }
            dataset._addLegend();
        },
        init: function (entityJSONData) {
            var dataSet = this;

            dataSet.JSONData = {
                data: entityJSONData
            };
            dataSet.components = {

            };

            dataSet.conf = {

            };

            dataSet.graphics = {

            };

            dataSet.configure();
        },
        updateEntityColors: function () {
            var dataset = this,
                minValue = arguments[0],
                maxValue = arguments[1],
                components = dataset.components,
                entities = components.data,
                chart = dataset.chart,
                entityObj,
                config,
                value,
                name,
                alphaArr,
                visibleEntityAttr,
                hiddenAttr = {
                    'fill-opacity': 0
                };
            for (name in entities) {
                entityObj = entities[name];
                config = entityObj.config;
                value = config.cleanValue;
                alphaArr = config.alphaArr || [];
                visibleEntityAttr = {
                    'fill-opacity': (alphaArr[0] / 100) || 1
                };

                // Value outside range
                if (value < minValue || value > maxValue) {
                    dataset.setCustomAttrs(entityObj, hiddenAttr, chart);
                    entityObj.hidden = true;
                }
                // Value within range
                else {
                    // // In normal legend visibility is passed as false for hiding entities within range
                    // // In gradient legend visiblity is always undefined so it goes to else part and always
                    // // shows all entities outside range
                    // if (visibility === false) {
                    //     appliedAttrs = hiddenAttr;
                    //     entityObj.hidden = true;
                    // }
                    // else {
                    //     appliedAttrs = visibleEntityAttr;
                    //     entityObj.hidden = false;
                    // }
                    entityObj.hidden = false;
                    dataset.setCustomAttrs(entityObj, visibleEntityAttr, chart);
                }
            }
        },
        _addLegend: function () {
            var dataset = this,
                chart = dataset.chart,
                chartComponents = chart.components,
                legend = chartComponents.legend,
                colorRangeObj = dataset.components.colorRange || {},
                colorRangeArr = colorRangeObj.colorArr || [],
                entityColorMap = dataset.components.entityColorMap = dataset.components.entityColorMap ||
                    (dataset.components.entityColorMap = []),
                colorObj,
                i,
                len = colorRangeArr.length,
                config,
                color,
                strokeColor,
                entityColorObj,
                lightColor,
                fillColor;
            legend.emptyItems();
            entityColorMap.length = 0;
            for (i = 0, len = colorRangeArr.length; i < len; i++) {
                colorObj = colorRangeArr[i];
                color = pluck(colorObj.code, colorObj.color);
                strokeColor = getLightColor(color, 60).replace(dropHash, HASHSTRING);
                lightColor = getLightColor(color, 40);
                fillColor = {
                    FCcolor: {
                        color: color + ',' + color + ',' + lightColor + ',' + color + ',' + color,
                        ratio: '0,70,30',
                        angle: 270,
                        alpha: '100,100,100,100,100'
                    }
                };
                config = {
                    fillColor: toRaphaelColor(fillColor),
                    label: pluck(colorObj.label, colorObj.displayvalue),
                    strokeColor: toRaphaelColor(strokeColor),
                    legendItemId: colorObj.legendItemId
                };
                entityColorObj = entityColorMap[i];
                if (!entityColorObj) {
                    entityColorObj = entityColorMap[i] = {
                        config: {}
                    };
                }
                entityColorObj.config = colorObj;
                entityColorObj.visible = true;
                entityColorObj.dataset = dataset;
                entityColorObj.legendItemId = legend.addItems(entityColorObj, dataset.legendInteractivity, config);
            }
        },
        legendInteractivity: function (entityColorObj, legendItem) {
            var legend = this,
                legendConfig = legend.config,
                entityColorConfig = entityColorObj.config,
                visible = entityColorObj.visible,
                dataset = entityColorObj.dataset,
                chart = dataset.chart,
                entities = dataset.components.data,
                i,
                entity,
                config = legendItem.config,
                legendGraphics = legendItem.graphics,
                cleanValue,
                itemHiddenStyle = legendConfig.itemHiddenStyle,
                colorRange = dataset.components.colorRange,
                hiddenColor = itemHiddenStyle.color,
                itemStyle = legendConfig.itemStyle,
                itemTextColor = itemStyle.color,
                color = config.fillColor,
                attrObj = {},
                type,
                element,
                entityAttrs,
                visibleEntityAttr = {},
                applyAttr,
                hiddenAttr = {
                    'fill-opacity': 0
                },
                colorObj,
                stroke = config.strokeColor;

            entityColorObj.visible = !visible;
            for (i in entities) {

                if (entities.hasOwnProperty(i)) {
                    entity = entities[i];
                    config = entity.config;
                    cleanValue = config.cleanValue;
                    colorObj = colorRange.getColorObj(cleanValue);
                    entityAttrs = config.visibleEntityAttr;
                    visibleEntityAttr['fill-opacity'] = entityAttrs['fill-opacity'];
                    applyAttr = visible ? hiddenAttr : visibleEntityAttr;
                    if (entityColorConfig.code === colorObj.code) {
                        entity.hidden = visible ? true : false;
                        dataset.setCustomAttrs(entity, applyAttr, chart);
                    }
                }
            }

            attrObj = {
                'legendItemSymbol': {
                    fill: visible ? hiddenColor : color,
                    'stroke': visible ? hiddenColor : stroke
                },
                legendItemText: {
                    fill: visible ? hiddenColor : itemTextColor
                },
                legendIconLine: {
                    'stroke': visible ? hiddenColor : color
                }
            };

            for (type in legendGraphics) {
                element = legendGraphics[type];
                element && element.attr && element.attr(attrObj[type]);
            }
        },
        setCustomAttrs: function (entityObj, attrs, chart) {
            var animationObj = chart.get('config', 'animationObj'),
                animationDuration = animationObj.transposeAnimDuration,
                animType = animationObj.animType,
                elements,
                graphic;
            if (entityObj) {
                elements = entityObj.graphics;
                graphic = elements.outlines;
                graphic.animate(attrs, animationDuration, animType);
            }
        },

        calculateDataLimits: function () {
            var dataset = this,
                chart = dataset.chart,
                conf = dataset.conf,
                jsonData = chart.jsonData,
                dataArr = jsonData.data || [],
                numberFormatter = chart.components.numberFormatter,
                cleanValue,
                value,
                minValue = +Infinity,
                maxValue = -Infinity,
                len,
                i;
            for (i = 0,len = dataArr.length; i < len; i++) {
                value = dataArr[i].value;
                cleanValue = numberFormatter.getCleanValue(value);
                minValue = mathMin(minValue, cleanValue);
                maxValue = mathMax(maxValue, cleanValue);
            }
            conf.max = maxValue;
            conf.min = minValue;
        },
        /*
            This function configures various properties of an entity item
            @param - id - id of the entityItem
            @param - entityItem - entityObject
            @param - entityJSON - json data of entity item
        */
        _configureEntity: function (id, entityItem, entityJSON) {
            var dataset = this,
                chart = dataset.chart,
                conf = dataset.conf,
                jsonData = chart.jsonData,
                components = chart.components,
                numberFormatter = components.numberFormatter,
                chartConf = chart.config,
                entityOpts = chartConf.entityOpts,
                entityConf = entityItem.config,
                labelConfig = entityItem.labelConfig,
                value = entityJSON.value,
                isGradient = jsonData.colorrange && jsonData.colorrange.gradient,
                gradientLegend =  components.gradientLegend,
                gColorRange = gradientLegend && gradientLegend.colorRange,
                colorRange = dataset.components.colorRange,
                cleanValue = entityConf.cleanValue = numberFormatter.getCleanValue(value),
                formattedValue = entityConf.formattedValue =
                    (cleanValue !== UNDEFINED) ? numberFormatter.dataLabels(cleanValue) : UNDEFINED,
                showTooltip = pluckNumber(entityJSON.showtooltip, entityOpts.showTooltip),
                defaultTooltip = this._getDefaultTooltip.call(entityItem, entityJSON, dataset),
                tooltextMacroObj = {
                    formattedValue: formattedValue,
                    sName: entityJSON.shortLabel,
                    lName: entityJSON.label
                },
                styleObj = entityOpts.dataLabels.style,
                toolText = entityConf.toolText = showTooltip ?
                    parseUnsafeString(pluck(parseTooltext(
                        pluck(entityJSON.tooltext, entityOpts.tooltext, defaultTooltip),
                        [1, 2, 7, 38, 39],
                        tooltextMacroObj,
                        entityJSON)))
                    : BLANK,
                borderColor = entityConf.borderColor = pluck(entityJSON.bordercolor, entityOpts.borderColor),
                borderAlpha = entityConf.borderAlpha = pluck(entityJSON.borderalpha, entityOpts.borderAlpha),
                borderThickness = entityConf.borderThickness =
                    pluckNumber(entityJSON.borderthickness, entityOpts.borderThickness),
                hoverOnNull = entityOpts.hoverOnNull,
                useHoverColor = entityConf.useHoverColor = pluckNumber(entityJSON.showhovereffect,
                    entityJSON.usehovercolor,
                    (hoverOnNull ? entityOpts.showHoverEffect : isNaN(value) ? 0 : entityOpts.showHoverEffect)),
                labelAlignment = entityConf.labelAlignment,
                colorObj,
                link,
                align,
                valign,
                color,
                alpha,
                angle,
                ratio,
                fillColor,
                fontColor,
                fontFamily,
                fontBold,
                emptyColorObject,
                fillColorObject,
                hoverColor,
                bgColor,
                labels,
                labelObj,
                oriLabels,
                i,
                alphaArr;


            // Reset the hidden flag so that on data update entity item gets visible
            entityItem.hidden = false;
            entityConf.showLabel = pluckNumber(entityJSON.showlabel, entityOpts.showLabels);
            entityConf.labelPadding = pluckNumber(entityJSON.labelpadding,
                entityOpts.labelPadding);
            entityConf.fontFamily = pluck(entityJSON.font, styleObj.fontFamily);
            entityConf.fontSize = pluckNumber(parseInt(entityJSON.fontsize, 10),
                parseInt(styleObj.fontSize, 10));
            entityConf.fontBold = pluckNumber(entityJSON.fontbold, 0);
            entityConf.fontColor = pluck(entityJSON.fontcolor, styleObj.color);
            entityConf.connectorColor = pluck(entityJSON.labelconnectorcolor,
                entityOpts.connectorColor);
            entityConf.connectorAlpha = pluck(entityJSON.labelconnectoralpha,
                entityOpts.connectorAlpha);
            entityConf.hoverBorderThickness = pluckNumber(entityJSON.borderhoverthickness,
                entityJSON.hoverborderthickness, entityOpts.hoverBorderThickness);
            entityConf.hoverBorderColor = pluck(entityJSON.borderhovercolor, entityJSON.hoverbordercolor,
                entityOpts.hoverBorderColor, entityConf.borderColor);
            entityConf.hoverBorderAlpha = pluck(entityJSON.borderhoveralpha, entityJSON.hoverborderalpha,
                entityOpts.hoverBorderAlpha, entityConf.borderAlpha);
            entityConf.connectorThickness = pluckNumber(entityJSON.labelconnectorthickness,
                entityOpts.connectorThickness);
            entityConf.origConnectorThickness = entityConf.connectorThickness;
            entityConf.borderThickness = borderThickness;
            entityConf.link = entityJSON.link;
            entityConf.isVisible = true;
            entityConf.id = id;
            entityConf.originalId = entityJSON.origId;
            if (cleanValue !== null) {
                if (gColorRange && isGradient) {
                    bgColor = gColorRange.getColorByValue(cleanValue);
                }
                else if (colorRange) {
                    colorObj = colorRange.getColorObj(cleanValue);
                    bgColor = pluck(colorObj.color, colorObj.code);
                }

            }
            if (pluck(entityJSON.color, entityJSON.alpha,
                    entityJSON.angle, entityJSON.ratio) !== UNDEFINED) {
                color = pluck(entityJSON.color, bgColor, entityOpts.fillColor);
                alpha = pluck(entityJSON.alpha, entityOpts.fillAlpha);
                angle = pluck(entityJSON.angle, entityOpts.fillAngle);
                ratio = pluck(entityJSON.ratio, entityOpts.fillRatio);

                fillColor = colorize({
                    color: color,
                    alpha: alpha,
                    angle: angle,
                    ratio: ratio
                });
            }
            else {

                fillColorObject = colorize({
                    color: pluck(bgColor, entityOpts.fillColor),
                    alpha: pluck(entityOpts.fillAlpha),
                    angle: pluck(entityOpts.fillAngle),
                    ratio: pluck(entityOpts.fillRatio)
                });

                emptyColorObject = colorize({
                    color: pluck(entityOpts.nullEntityColor),
                    alpha: pluck(entityOpts.nullEntityAlpha),
                    angle: pluck(entityOpts.nullEntityAngle),
                    ratio: pluck(entityOpts.nullEntityRatio)
                });

                // If value is null then set empty color for entity
                fillColor = cleanValue === null ? emptyColorObject : fillColorObject;
                color = fillColor.FCcolor.color;
                alpha = fillColor.FCcolor.alpha;
                angle = fillColor.FCcolor.angle;
                ratio = fillColor.FCcolor.ratio;
            }
            // Need to re-check whether tooltip is to be shown for blank
            // tooltext
            if (toolText === BLANK) {
                conf.showTooltip = 0;
            }

            entityConf.visibleEntityAttr = {
                stroke: convertColor(borderColor, borderAlpha),
                fill: (entityConf.fillColor = fillColor).toString(),
                'fill-opacity': alpha / 100
            };

            alphaArr = alpha.split(COMMA);

            // if (borderThickness) {
            //     alphaArr.push(borderAlpha);
            // }
            entityConf.alphaArr = alphaArr;

            if (useHoverColor) {
                if (pluck(entityJSON.fillhovercolor, entityJSON.fillhoveralpha, entityJSON.fillhoverangle,
                    entityJSON.fillhoverratio, entityJSON.hoverfillcolor, entityJSON.hoverfillalpha,
                    entityJSON.hoverfillratio, entityJSON.hoverfillangle) !== UNDEFINED) {

                    color = pluck(entityJSON.fillhovercolor, entityJSON.hoverfillcolor, entityOpts.hoverFillColor);
                    alpha = pluck(entityJSON.fillhoveralpha, entityJSON.hoverfillalpha, entityOpts.hoverFillAlpha);
                    angle = pluck(entityJSON.fillhoverangle, entityJSON.hoverfillangle, entityOpts.hoverFillAngle);
                    ratio = pluck(entityJSON.fillhoverratio, entityJSON.hoverfillratio, entityOpts.hoverFillRatio);

                    hoverColor = colorize({
                        color: color,
                        alpha: alpha,
                        angle: angle,
                        ratio: ratio
                    });
                }
                else {
                    if (!entityOpts.hoverColorObject) {
                        entityOpts.hoverColorObject = colorize({
                            color: entityOpts.hoverFillColor,
                            alpha: entityOpts.hoverFillAlpha,
                            angle: entityOpts.hoverFillAngle,
                            ratio: entityOpts.hoverFillRatio
                        });
                    }

                    hoverColor = entityOpts.hoverColorObject;
                }

                entityConf.hoverColor = hoverColor;
            }

            // Entity Label configurations
            !labelConfig && (labelConfig = entityItem.labelConfig = {});
            fontColor = entityConf.fontColor;
            fontFamily = entityConf.fontFamily;
            fontBold = entityConf.fontBold;
            toolText = entityConf.toolText;
            link = entityConf.link;

            if (labelAlignment) {
                // labelPadding neednt be scaleFactored.
                align = labelAlignment[0];
                valign = labelAlignment[1];
            }
            else {
                align = POSITION_CENTER,
                valign = POSITION_MIDDLE;
            }
            labelConfig.align = align;
            labelConfig.vAlign = valign;
            labelConfig.bgColor = BLANK;
            labelConfig.borderColor = BLANK;
            labelConfig.fontColor = fontColor;
            labelConfig.fontFamily = fontFamily;
            labelConfig.fontBold = fontBold;
            labelConfig.toolText = toolText;
            labelConfig.link = link;

            if (typeof  entityConf.options === 'object') {
                labels = entityConf.entityLabels = entityConf.entityLabels || [];

                oriLabels = entityConf.labels || [];

                i = oriLabels.length;

                while (i--) {
                    if (!labels[i]) {
                        labels[i] = {
                            config: {}
                        };
                    }
                    labelConfig = labels[i].config;
                    labelAlignment = oriLabels[i].labelAlignment;
                    if (labelAlignment) {
                        // labelPadding neednt be scaleFactored.
                        align = labelAlignment[0];
                        valign = labelAlignment[1];
                    }
                    else {
                        align = POSITION_CENTER,
                        valign = POSITION_MIDDLE;
                    }
                    labelConfig.align = align;
                    labelConfig.vAlign = valign;
                    labelConfig.displayValue = dataset.getDisplayValue.call(entityItem, oriLabels[i],
                        entityConf.options.isDataEnabled, !i, entityJSON);

                    labelConfig.bgColor = BLANK;
                    labelConfig.borderColor = BLANK;
                    labelConfig.toolText = toolText;
                    labelConfig.align = align;
                    labelConfig.vAlign = valign;
                    labelConfig.bgColor = BLANK;
                    labelConfig.borderColor = BLANK;
                    labelConfig.fontColor = fontColor;
                    labelConfig.fontFamily = fontFamily;
                    labelConfig.fontBold = fontBold;
                    labelConfig.toolText = toolText;
                }
            }
            else {
                labelObj = {
                    shortText: entityConf.shortLabel,
                    text: entityConf.label
                };
                labelConfig.displayValue = dataset.getDisplayValue.call(entityItem, labelObj, true, true, entityJSON);
            }
        },
        getDisplayValue: function (labelObj, userValue, userDV, entityJSON) {
            var entity = this,
                chart = entity.dataset.chart,
                entityOpts = chart.config.entityOpts,
                entityConf = entity.config,
                cleanValue = entityConf.cleanValue,
                formattedValue = entityConf.formattedValue,
                labelSepChar = entityOpts.labelSepChar,
                displayValue;
            // Parsing display Value
            if (userValue) {
                if (userDV && typeof entityJSON.displayvalue !== 'undefined') {
                    displayValue = entityJSON.displayvalue;
                } else {
                    displayValue = pluck((entityOpts.includeNameInLabels ?
                        (entityOpts.useShortName ?
                            labelObj.shortText : labelObj.text) : ''));

                    if (entityOpts.includeValueInLabels && cleanValue !== null) {
                        displayValue = (displayValue === UNDEFINED) ? formattedValue :
                            (displayValue + labelSepChar + formattedValue);
                    }
                }
            }
            else {
                displayValue = entityConf.label;
            }
            return displayValue;
        },
        _sanitizeEntityOptions: function(options) {
            // The entity object cannot have the following properties.
            delete options.outlines;
            delete options.label;
            delete options.shortlabel;
            delete options.labelposition;
            delete options.labelalignment;
            delete options.labelconnectors;

            return options;
        },
        _redefineEntities: function (entityDef) {
            var dataset = this,
                conf = dataset.conf,
                chart = dataset.chart,
                redefinedEntities = {},
                processedIds = {},
                entities = chart.entities,
                useSNameAsId = conf.useSNameAsId,
                i,
                defObj,
                oldId,
                newId,
                sName,
                lName,
                id,
                newObj,
                entityCount = 0,
                entityStore,
                entityDataStore,
                item,
                entityObj;
            i = entityDef.length;

            while (i--) {
                defObj = entityDef[i],
                oldId = defObj.internalid,
                newId = (defObj.newid ? defObj.newid : oldId);
                sName = defObj.sname;
                lName = defObj.lname;
                entityObj = entities[oldId];

                /**
                 * Handling the exception when the entity ids in the map js have an
                 * extra space (leading or trailing)
                 */
                oldId = lib.trimString(oldId);
                newId = lib.trimString(newId);
                newId = newId && newId.toLowerCase();
                if (entityObj) {

                    redefinedEntities[newId] = newObj = { origId: oldId };

                    // processedIds is needed to keep track of all the entities
                    // that have been redefined using the entitiydef block.
                    processedIds[oldId] = true;

                    // not using extend2 as it involves a deep copy of the objects.
                    for (item in entityObj) {
                        newObj[item] = entityObj[item];
                    }

                    newObj.shortLabel = sName ? sName : entityObj.shortLabel;
                    newObj.label = lName ? lName : entityObj.label;
                    newObj.showhovereffect = defObj.showhovereffect;
                    newObj.fillhovercolor  = defObj.fillhovercolor;
                    newObj.fillhoveralpha = defObj.fillhoveralpha;
                    newObj.fillhoverangle = defObj.fillhoverangle;
                    newObj.fillhoverratio = defObj.fillhoverratio;
                    newObj.borderhoverthickness = defObj.borderhoverthickness;
                }
            }
            entityDataStore = dataset.components.data;
            if (!entityDataStore) {
                entityDataStore = dataset.components.data = {

                };
            }
            for (id in redefinedEntities) {
                id = id.toLowerCase();
                if (!entityDataStore[id]) {
                    entityDataStore[id] = {
                        config : {}
                    };
                }
                entityDataStore[id].config = redefinedEntities[id];
                entityCount += 1;
            }
            entityStore = entityDataStore;
            for (id in entities) {

                newObj = entities[id];
                /**
                 * Handling the exception when the entity ids in the map js have an
                 * extra space (leading or trailing)
                 */
                id = lib.trimString(id);

                if (!processedIds[id]) {
                    if (useSNameAsId) {
                        entityObj = entityStore[newObj.shortLabel.toLowerCase()];
                        if (!entityObj) {
                            entityObj = entityStore[newObj.shortLabel.toLowerCase()] = {};
                        }
                        entityObj.config = {};
                        entityObj.origId = newObj.shortLabel;
                    }
                    else {
                        entityObj = entityStore[id.toLowerCase()];
                        if (!entityObj) {
                            entityObj = entityStore[id.toLowerCase()] = {};
                        }
                        entityObj.config = {};
                        entityObj.config.origId = id;
                    }

                    for (item in newObj) {
                        entityObj.config[item] = newObj[item];
                    }

                    entityCount += 1;
                }
            }
            // Entity count introduced to enable the batch rendering of entities.
            conf.entityCount = entityCount;
        },
        draw: function () {
            var dataset = this,
                conf = dataset.conf,
                chart = dataset.chart,
                // The rendering should be done in samll batches only for VML.
                // For SVG increase the batch size
                // @todo Determine the batchsize in a generalized way for all browsers instead of hardcoding it.
                BATCH_SIZE = hasSVG ? 200 : 10,
                doBatchRendering;
            this.conf.ready = false;
            conf.BATCH_SIZE = BATCH_SIZE;
            conf.labelBatchSize = hasSVG ? 200 : 20;
            doBatchRendering = this._batchRender();
            doBatchRendering(0);
            chart.config.entityFlag = true;
        },
        _batchRender: function () {
            var dataset = this,
                conf = dataset.conf,
                chart = dataset.chart,
                jobList = chart.getJobList(),
                firstEntity = chart.entities.firstEntity,
                components = dataset.components,
                entities = components.data,
                batchSize = conf.BATCH_SIZE,
                keys = conf.entityKeys = firstEntity ? dataset._getKeys(firstEntity, entities) : Object.keys(entities),
                keysLength = conf.entityLength = keys.length,
                i,
                entityObj,
                count,
                ent,
                outlinesDrawn,
                drawEntities = function (entityStartIndex) {
                    i = entityStartIndex;
                    count = 0;
                    // To counter the performance issues while rendering in IE, the entities shall
                    // be rendered in bat +ches of BATCH_SIZE.
                    while (keys[i] !== UNDEFINED) {

                        entityObj = entities[keys[i]];
                        outlinesDrawn = dataset.drawEntity(entityObj, batchSize);
                        count += outlinesDrawn;
                        if (entityObj.config.drawn) {
                            ent = i === keysLength - 1 ? entityObj : entities[keys[i-1]];
                            if (ent) {
                                ent.config.drawn = false;
                                ent.config.outlineStartIndex = UNDEFINED;
                            }
                            i++;
                        }
                        if (count >= batchSize) {
                            jobList.entityDrawID.push(schedular.addJob(drawEntities, dataset, [i],
                                lib.priorityList.entitydraw, true));
                            break;
                        }
                    }

                    if (i === keysLength) {
                        dataset._addEventListenersToEntities(0);
                        dataset.initComplete();
                    }

                };

            return drawEntities;
        },
        _addEventListenersToEntities: function (startIndex) {
            var dataset = this,
                entities = dataset.components.data,
                chart = dataset.chart,
                jobList = chart.getJobList(),
                conf = dataset.conf,
                batchSize = conf.BATCH_SIZE,
                keys = conf.entityKeys,
                i,
                len = conf.entityLength,
                entity,
                count = 0,
                options,
                entityConf;

            for (i = startIndex; i < len; i++) {
                entity = entities[keys[i]];
                entityConf = entity.config;
                options = entityConf.options;
                if (!(options && options.isDataEnabled === false)) {
                    dataset.addMouseGestures.call(entity);
                }
                count++;
                if (count === batchSize) {
                    jobList.entityDrawID.push(schedular.addJob(dataset._addEventListenersToEntities, dataset, [i],
                        lib.priorityList.entitydraw, true));
                    break;
                }
            }

        },
        _getKeys: function (firstEntity, entities) {
            var keys = [firstEntity],
                item = firstEntity;

            while (entities[item]) {
                item = entities[item].nextId;
                keys.push(item);
            }
            return keys;
        },
        _getDefaultTooltip: function (entityJSON) {
            var entity = this,
                dataset = entity.dataset,
                value = entity.config.cleanValue,
                formattedValue = entity.config.formattedValue,
                entityOpts = dataset.chart.config.entityOpts,
                tooltip,
                labelObj;

            if (typeof entity.config.options === 'object') {
                labelObj = entityJSON.labels && entityJSON.labels[0];
                if (!labelObj) {
                    return UNDEFINED;
                }
                tooltip = ((entityOpts.useSNameInTooltip ?
                    labelObj.shortText : labelObj.text) +
                    (value === null ? BLANK : (entityOpts.tooltipSepChar +
                    formattedValue)));
            }
            else {
                tooltip = ((entityOpts.useSNameInTooltip ?
                    entityJSON.shortLabel : entityJSON.label) +
                    (value === null ? BLANK : (entityOpts.tooltipSepChar +
                    formattedValue)));
            }

            return tooltip;
        },
        drawEntity: function (entity, outlinesDrawCount) {
            var dataset = this,
                chart = dataset.chart,
                components = chart.components,
                paper = components.paper,
                entityConf = entity.config,
                pathStr = (hasSVG || !isIE) ? 'litepath' : 'path',
                entityOpts = chart.config.entityOpts,
                outlines = entityConf.outlines,
                addTo = chart.graphics.datasetGroup,
                shadowGroup = chart.graphics.shadowGroup,
                toolText = entityConf.toolText,
                showShadow = entityOpts.shadow,
                i,
                outlinePath = [],
                path,
                visibleEntityAttr,
                fillOpacity,
                applyAttr,
                outlineGraphics,
                outline,
                count,
                customStrokeWidthModifier,
                shadowOptions;


            dataset._configureEntityDrawingParams(entity);
            entityConf = entity.config;
            visibleEntityAttr = entityConf.visibleEntityAttr;
            shadowOptions = entityConf.shadowOptions;
            fillOpacity = entityConf.fillOpacity;

            i = entityConf.outlineStartIndex === UNDEFINED ? outlines.length : entityConf.outlineStartIndex;
            if (!entity.graphics) {
                entity.graphics = {};
            }
            count = 0;
            outlinePath = entityConf.outlinePath || (entityConf.outlinePath = []);
            customStrokeWidthModifier = entityConf.customStrokeWidthModifier;
            if (typeof entityConf.options === 'object') {
                while (i--) {
                    outlinePath = outlines[i].outline;
                    if (entityConf.options.isDataEnabled === true) {
                        applyAttr = visibleEntityAttr;
                    }
                    else {
                        applyAttr = extend2(extend2({}, visibleEntityAttr),
                            pruneStrokeAttrs(outlines[i].style, customStrokeWidthModifier));
                    }

                    outlineGraphics = entity.graphics.outlines;
                    if (!outlineGraphics) {
                        outlineGraphics = entity.graphics.outlines = [];
                    }

                    !outlineGraphics[i] && (outlineGraphics[i] = {});
                    outline = outlineGraphics[i].outline;
                    if (!outline) {
                        outline = outlineGraphics[i].outline = paper[pathStr](outlinePath, addTo);
                    }
                    else {
                        outline.attr({
                            'fill-opacity': fillOpacity
                        });
                    }

                    outline.attr(applyAttr)
                    .tooltip(toolText)
                    .shadow(showShadow ? shadowOptions : false, shadowGroup);
                    count++;
                    entityConf.outlineStartIndex = i;
                    if (count === outlinesDrawCount) {
                        return count;
                    }
                }

                entityConf.drawn = true;
                return count;
            }
            else {

                if (!entity.graphics.outlines) {
                    while (i--) {
                        path = outlines[i];
                        outlinePath = path.concat(outlinePath);
                        count++;
                        entityConf.outlineStartIndex = i;
                        if (count === outlinesDrawCount) {
                            entityConf.outlinePath = outlinePath;
                            return count;
                        }
                    }
                    entity.graphics.outlines = paper[pathStr](outlinePath, addTo)
                    .attr(visibleEntityAttr);
                }
                else {
                    entity.graphics.outlines.attr(visibleEntityAttr)
                    .attr({
                        'fill-opacity': fillOpacity
                    });
                }
                entityConf.drawn = true;
                entityConf.outlineStartIndex = 0;
                entityConf.outlinePath = [];
                entity.graphics.outlines.tooltip(toolText).shadow(showShadow ? shadowOptions : false, shadowGroup);
                return count;
            }
        },
        _configureEntityDrawingParams: function (entity) {
            var dataset = this,
                chart = dataset.chart,
                chartConf = chart.config,
                components = chart.components,
                gradientLegend = components.gradientLegend,
                entityConf = entity.config,
                entityOpts = chart.config.entityOpts,
                scalingParams = chart.config.scalingParams,
                scaleStrokes = (!isIE || hasSVG),
                scaleFactor = scalingParams.scaleFactor,
                scaledPixel = scalingParams.strokeWidth,
                scaledPixelWithBaseFactor = (scaleStrokes ?
                    chart.baseScaleFactor : 1) * scaledPixel,
                scaleBorder = entityOpts.scaleBorder === 1,
                borderThickness = entityConf.borderThickness,
                alphaArr = entityConf.alphaArr,
                connectorThickness = entityConf.origConnectorThickness,
                hoverBorderThickness = entityConf.hoverBorderThickness,
                visibleEntityAttr = entityConf.visibleEntityAttr,
                fillOpacity = visibleEntityAttr['fill-opacity'],
                customStrokeWidthModifier;

            entityConf.shadowOptions = {
                scalefactor: [scaleFactor, scaleFactor * chart.baseScaleFactor],
                opacity: mathMax.apply(math, alphaArr) / 100
            };

            if (gradientLegend && chartConf.gLegendEnabled === true) {
                entity.hidden = false;
            }

            entityConf.fillOpacity = entity.hidden ? 0 : fillOpacity;
            (gradientLegend && gradientLegend.enabled) && (gradientLegend.resetLegend(),
                    gradientLegend.clearListeners());

            gradientLegend && gradientLegend.notifyWhenUpdate(dataset.updateEntityColors,
                dataset);
            // By default scaleBorder is false.
            if (scaleStrokes) {
                // SVG
                borderThickness = entityConf.entityBorderThickness = scaleBorder ?
                (borderThickness * scaledPixelWithBaseFactor) :
                    (borderThickness / scaleFactor);
                connectorThickness = connectorThickness / scaleFactor;
                customStrokeWidthModifier = scaleBorder ? scaleFactor : scalingParams.sFactor;
                if (hoverBorderThickness) {
                    hoverBorderThickness = entityConf.hoverBorderThickness = scaleBorder ?
                    (hoverBorderThickness * scaledPixelWithBaseFactor) :
                        (hoverBorderThickness / scaleFactor);
                }

                // if (isWebKit) {
                    // webkit issue fix
                //     borderThickness = (borderThickness && mathCeil(borderThickness)) || 0;
                //     connectorThickness = (connectorThickness && mathCeil(connectorThickness)) || 0;
                // }
            }
            else {
                // VML
                borderThickness = scaleBorder ? borderThickness * scaledPixel : borderThickness;
                customStrokeWidthModifier = scaleBorder ? scalingParams.scaleFactor : chart.baseScaleFactor;
            }
            entityConf.entityBorderThickness = borderThickness;
            entityConf.connectorThickness = connectorThickness;
            entityConf.customStrokeWidthModifier = customStrokeWidthModifier;
            visibleEntityAttr['stroke-width'] = borderThickness;
            visibleEntityAttr.transform = hasSVG || !isIE ? '' : scalingParams.transformStr;
        },
        drawLabels: function (dataset) {
            var ent = this,
                itemMap = ent,
                chart = dataset.chart,
                conf = dataset.conf,
                batchSize = conf.labelBatchSize,
                components = chart.components,
                keysLength = conf.entityLength,
                labelItems = [],
                i,
                annotations,
                count = 0,
                annCount = 0,
                labelItemsAdded = 0,
                annConfig = chart.config.annotationConfig,
                mapLabelAnnotations = components.mapLabelAnnotations = components.mapLabelAnnotations ||
                    (components.mapLabelAnnotations = []);


            annotations = mapLabelAnnotations[count];
            if (!annotations) {
                annotations = mapLabelAnnotations[count] = new lib.Annotations();
            }
            annotations.reset(null, annConfig, chart);
            annotations._renderer && (annotations._renderer = null);

            for (i in itemMap) {

                dataset.drawLabel.call(itemMap[i], labelItems);
                count++;
                if (count === batchSize) {
                    annotations.addGroup({
                        id: 'entityLabels',
                        items: labelItems
                    });
                    annCount++;
                    annotations = mapLabelAnnotations[annCount];
                    if (!annotations) {
                        annotations = mapLabelAnnotations[annCount] = new lib.Annotations();
                    }
                    annotations.reset(null, annConfig, chart);
                    annotations._renderer && (annotations._renderer = null);
                    count = 0;
                    labelItems = [];
                }
                else if (labelItemsAdded === keysLength - 1) {
                    annotations.addGroup({
                        id: 'entityLabels',
                        items: labelItems
                    });
                }
                labelItemsAdded++;
            }
            dataset.drawLabelConnFn(0);
        },
        drawLabelConnFn: function (startIndex) {
            var dataset = this,
                conf = dataset.conf,
                chart = dataset.chart,
                jobList = chart.getJobList(),
                entities = dataset.components.data,
                batchSize = conf.BATCH_SIZE,
                keys = conf.entityKeys,
                l,
                i,
                length = keys.length,
                labelArr,
                config,
                entity,
                count = 0;

            for (i = startIndex; i < length; i++) {
                entity = entities[keys[i]];
                config = entity.config;
                if (typeof config.options === 'object') {
                    labelArr = config.labels;
                    l = (labelArr && labelArr.length) || 0;
                    while (l--) {
                        if (labelArr[l].labelConnectors) {
                            dataset.drawLabelConnectors.call(entity, labelArr[l].labelConnectors);
                            count++;
                        }
                    }
                }
                else {
                    if (config.labelConnectors) {
                        dataset.drawLabelConnectors.call(entity, config.labelConnectors);
                        count++;
                    }
                }
                if (count === batchSize) {
                    jobList.entityDrawID.push(schedular.addJob(dataset.drawLabelConnFn, dataset, [i],
                        lib.priorityList.entitydraw, true));
                    break;
                }
            }
        },
        // Returns a label object with x y positions and cosmetic attributes which is then pushed to annotations array
        _getLabelObject: function (index, userValue) {
            var entity = this,
                dataset = entity.dataset,
                chart = dataset.chart,
                entityConf = entity.config,
                labelConfig,
                scalingParams = chart.config.scalingParams,
                labelPos,
                labelAlignment,
                firstEle = entity.graphics && entity.graphics.outlines,
                fontStyleObj,
                fontSize = entityConf.fontSize,
                labelPadding = entityConf.labelPadding,
                labelsArr = entityConf.labels || [],
                entityLabels = entityConf.entityLabels || [],
                baseWidth,
                baseHeight,
                labelX,
                labelY,
                box,
                align,
                valign,
                fsize,
                xOffset,
                yOffset,
                oriLabelObj,
                labelObj;

            if (index !== undefined) {
                oriLabelObj = labelsArr[index];
                labelObj = entityLabels[index];
                labelConfig = labelObj.config;
                fontStyleObj = labelConfig.style = oriLabelObj.style;

                labelPos = oriLabelObj.labelPosition;
                labelAlignment = oriLabelObj.labelAlignment;
            }
            else {
                labelConfig = entity.labelConfig;

                labelPos = entityConf.labelPosition;
                labelAlignment = entityConf.labelAlignment;
            }

            if (labelPos) {
                labelX = labelPos[0];
                labelY = labelPos[1];
            }
            else {
                box = firstEle.getBBox();
                labelX = box.x + (box.width / 2);
                labelY = box.y + (box.height / 2);
            }

            if (labelAlignment) {
                // labelPadding neednt be scaleFactored.
                align = labelAlignment[0];
                valign = labelAlignment[1];

                if (align === POSITION_RIGHT) {
                    labelX -= labelPadding;
                }
                else if (align === POSITION_LEFT) {
                    labelX += labelPadding;
                }

                if (valign === POSITION_TOP) {
                    labelY -= labelPadding;
                }
                else if (valign === POSITION_BOTTOM) {
                    labelY += labelPadding;
                }

            }
            else {
                align = POSITION_CENTER,
                valign = POSITION_MIDDLE;
            }

            fsize = parseFloat(fontSize) / (scalingParams.sFactor);
            if (!userValue && fontStyleObj) {
                /** @todo change fill property to color as for fonts fill is non-standard */
                fontStyleObj.color && (labelConfig.fontColor = fontStyleObj.color);
                fontStyleObj['font-size'] && (fsize =
                    (parseFloat(fontStyleObj['font-size']) / (scalingParams.sFactor)));
                fontStyleObj['font-family'] && (labelConfig.fontFamily = fontStyleObj['font-family']);
                (fontStyleObj['font-weight'] !== UNDEFINED) && (labelConfig.fontBold =
                    (fontStyleObj['font-weight'] === 'bold'));
            }
            labelConfig.x = labelX.toString();
            labelConfig.y = labelY.toString();
            labelConfig.wrap = 1;
            labelConfig.type = 'text';
            labelConfig.fontSize = fsize;
            return {
                x: labelX.toString(),
                y: labelY.toString(),
                wrapwidth: getTextWrapWidth[align](baseWidth, labelX + xOffset) - labelPadding,
                wrapheight: getTextWrapHeight[valign](baseHeight, labelY + yOffset) - labelPadding,
                wrap: 1,
                type: 'text',
                align: labelConfig.align,
                valign: labelConfig.vAlign,
                text: labelConfig.displayValue,
                tooltext: labelConfig.toolText,
                link: labelConfig.link,
                bgcolor: labelConfig.bgColor,
                bordercolor: labelConfig.borderColor,
                fillcolor: labelConfig.fontColor,
                fontsize: labelConfig.fontSize,
                font: labelConfig.fontFamily,
                bold: labelConfig.fontBold,
                onclick: function (e) {
                    /*
                     * A map contains *entities* marked by concrete boundaries. For example, the India map has 28
                     * states, each state can be marked as an entity. Every entity has an id by which it is referred
                     * to in the JS file . The user can assign an Id of choice to the entity or use the original ID
                     * of the entity. The `entityClick` event is fired when an *entity* is clicked.
                     *
                     * The user can used this event to perform an action on clicking the entity. This event is
                     * usually preceded by the the {@link FusionCharts#event:entityRollOver} event.
                     *
                     * @event FusionCharts#entityClick
                     * @group map:entity
                     * @see  FusionCharts#event:entityRollOver
                     * @see  FusionCharts#event:entityRollOut
                     *
                     * @param {number} value The value of the entity.
                     * @param {string} label The label of the entity.
                     * @param {string} shortLabel Short label used by the user.
                     * @param {string} originalId The ID of the entity stored in the JS file.
                     * @param {string} id This could be the original ID or the ID assigned by the user.
                     *
                     * @example
                     * FusionCharts.ready(function () {
                     *     var map = new FusionCharts({
                     *         type: 'maps/world',
                     *         renderAt: 'map-container-div',
                     *
                     *         events: {
                     *             entityClick: function (event, args) {
                     *                 console.log(args.label + 'clicked');
                     *             }
                     *         }
                     *     });
                     * });
                     */

                    global.raiseEvent('entityclick', entityConf.eventArgs, chart.chartInstance, e);
                },

                onmouseover: function (e) {
                    var hoverEnt = entity.graphics.outlines,
                        i,
                        len;

                    // In some maps outline graphics is an array of elements for example - usmsa map
                    if (hoverEnt instanceof Array) {
                        for (i = 0, len = hoverEnt.length; i < len; i++) {
                            dataset.entityRollOver.call(hoverEnt[i].outline, e);
                        }
                    }
                    else {
                        dataset.entityRollOver.call(hoverEnt, e);
                    }
                },

                onmouseout: function (e) {
                    var hoverEnt = entity.graphics.outlines,
                        i,
                        len;

                    // In some maps outline graphics is an array of elements for example - usmsa map
                    if (hoverEnt instanceof Array) {
                        for (i = 0, len = hoverEnt.length; i < len; i++) {
                            dataset.entityRollOut.call(hoverEnt[i].outline, e);
                        }
                    }
                    else {
                        dataset.entityRollOut.call(hoverEnt, e);
                    }

                },
                ontouchstart: function (e) {
                    var hoverEnt = entity.graphics.outlines,
                        i,
                        len;

                    // In some maps outline graphics is an array of elements for example - usmsa map
                    if (hoverEnt instanceof Array) {
                        for (i = 0, len = hoverEnt.length; i < len; i++) {
                            dataset.entityRollOver.call(hoverEnt[i].outline, e);
                        }
                    }
                    else {
                        dataset.entityRollOver.call(hoverEnt, e);
                    }
                    dataset.entityRollOver.call(hoverEnt, e);
                }
            };
        },
        drawLabel: function (annotationsArray) {
            var entity = this,
                dataset = entity.dataset,
                config = entity.config,
                showLabel = config.showLabel,
                useValue,
                i,
                labelArr;

            if (!showLabel) {
                return;
            }

            if (typeof config.options === 'object') {
                labelArr = config.labels;
                i = (labelArr && labelArr.length) || 0;

                useValue = config.options.isDataEnabled;
                while (i--) {
                    annotationsArray.push(dataset._getLabelObject.call(entity, i, useValue, !i));
                }
            }
            else {
                annotationsArray.push(dataset._getLabelObject.call(entity, undefined, true, true));
            }
        },
        drawLabelConnectors: function (connectorArr) {
            var entity = this,
                entityConf = entity.config,
                dataset = entity.dataset,
                chart = dataset.chart,
                paper = chart.components.paper,
                scalingParams = chart.config.scalingParams,
                datasetGroup = chart.graphics.datasetGroup,
                i = (connectorArr && connectorArr.length) || 0,
                connElem,
                path,
                showLabel = entityConf.showLabel;

            while (i--) {
                path = connectorArr[i];
                connElem = entity.graphics.connectorElem;
                if (showLabel) {
                    if (!connElem) {
                        entity.graphics.connectorElem = connElem = paper.path(path, datasetGroup);
                    }

                    connElem.show().attr({
                        transform: (hasSVG || !isIE) ? '' : scalingParams.transformStr,
                        stroke: convertColor(entityConf.connectorColor, entityConf.connectorAlpha),
                        'shape-rendering': CRISP,
                        'stroke-width': entityConf.connectorThickness
                    });
                }
                else {
                    connElem && connElem.hide();
                }

            }
        },
        entityClick: function (e) {
            var entity = this.node.__entity,
                dataset = entity.dataset,
                chart = dataset.chart,
                linkClickFN = chart.linkedItems.linkClickFN,
                config = entity.config,
                link = config.link;

            global.raiseEvent('entityclick', config.eventArgs,
                chart.chartInstance, e);

            // parse user links
            (link !== UNDEFINED) && linkClickFN.call({
                link: link
            }, chart);
        },
        entityRollOver: function (e) {
            var entityElem = this,
                entity = entityElem.node.__entity,
                dataset = entity.dataset,
                config = entity.config,
                chart = dataset.chart,
                hoverAttr = config.hoverAttr;

            lib.plotEventHandler.call(entityElem, chart, e, 'entityRollOver');
            if (entityElem.data('hovered')) {
                clearTimeout(entity.config.timer);
            }
            else {
                if (config.useHoverColor && config.isVisible && !entity.hidden) {
                    chart.config.hoverEntity = entityElem;
                    entityElem.attr(hoverAttr);
                    entityElem.data('hovered', true);
                }

                // lib.plotEventHandler.call(entityElem, chart, e, 'entityRollOver');

                // global.raiseEvent('entityRollOver', eventArgs, chart.chartInstance);
            }
        },
        entityRollOut: function (e) {
            var entityElem = this,
                entity = this.node.__entity,
                dataset = entity.dataset,
                hidden,
                chart = dataset.chart,
                config = entity.config,
                revertAttr = config.revertAttr;
            /**
             * A map might contain entities marked by concrete boundaries. For example, the India map has 28 states,
             * each state can be marked as an entity . Every entity has an id by which it is referred to in the
             * map definition file. The user can assign an in autonomous id's to the entity or use the original Id.
             *
             * The `entityRollOver` event is fired when the pointer is rolled over an entity.
             * This event is followed either by the {@link FusionCharts#event:entityClick} event or the
             * {@link FusionCharts#event:entityRollOut} event.
             *
             * @event FusionCharts#entityRollOver
             * @group map:entity
             * @see  FusionCharts#event:entityClick
             * @see  FusionCharts#event:entityRollOut
             *
             * @param {number} value The value of the entity.
             * @param {string} label The label of the entity.
             * @param {string} shortLabel Short label used by the user.
             * @param {string} originalId The ID of the entity stored in the map definition file.
             * @param {string} id This could be the original ID or the ID assigned by the user.
             */
            lib.plotEventHandler.call(entityElem, chart, e, 'entityRollOut');
            // global.raiseEvent('entityRollOut', eventArgs, chart.chartInstance);
            entity.config.timer = setTimeout(function () {
                hidden = entity.hidden;
                if (hidden !== true) {
                    entityElem.attr(revertAttr);
                    entityElem.data('hovered', false);
                }
            }, 100);
        },
        addMouseGestures: function () {
            var entity = this,
                config = entity.config,
                originalId = config.originalId,
                dataset = entity.dataset,
                graphics = entity.graphics,
                useHoverColor = 1,
                hoverBorderThickness = config.hoverBorderThickness,
                hoverBorderColor = config.hoverBorderColor,
                hoverBorderAlpha = config.hoverBorderAlpha,
                borderThickness = config.entityBorderThickness,
                borderColor = config.borderColor,
                borderAlpha = config.borderAlpha,
                link = config.link,
                visibleEntityAttr = config.visibleEntityAttr,
                groupId = 'groupId' + originalId,
                item,
                i,
                graphic,
                len,
                outlines,
                bindListener = function (graphic) {
                    if (link !== UNDEFINED) {
                        graphic
                        .css({
                            cursor : 'pointer',
                            '_cursor': 'hand'
                        });
                    }

                    graphic.data('eventArgs', config.eventArgs);
                    graphic.data('groupId', groupId);
                    graphic.node.__entity = entity;

                    // If listeners are not binded
                    if (!entity._listenersBinded) {
                        graphic.click(dataset.entityClick)
                        .hover(dataset.entityRollOver, dataset.entityRollOut);
                    }
                };

            config.eventArgs = {
                value: config.cleanValue,
                label: config.label,
                shortLabel: config.shortLabel,
                originalId: config.origId,
                id: config.id || config.origId
            };

            config.legacyEventArgs = {
                value: config.value,
                lName: config.label,
                sName: config.shortLabel,
                id: config.originalId || config.id
            };

            if (useHoverColor) {
                config.hoverAttr = {
                    fill: toRaphaelColor(config.hoverColor)
                };
                config.revertAttr = {
                    fill: toRaphaelColor(config.fillColor),
                    stroke: toRaphaelColor(config.borderColor, config.borderAlpha)
                };

                config.revertAttr['fill-opacity'] = visibleEntityAttr['fill-opacity'];
                if (hoverBorderThickness !== borderThickness) {
                    config.hoverAttr['stroke-width'] = pluckNumber(hoverBorderThickness, borderThickness);
                    config.revertAttr['stroke-width'] = borderThickness;
                }

                /* @todo: Enable once the drawing of entities allows these
                 * hover effects to be applied properly.
                 */
                if (hoverBorderColor !== borderColor || hoverBorderAlpha !== borderAlpha) {
                    config.hoverAttr.stoke = convertColor(hoverBorderColor, hoverBorderAlpha);
                    config.revertAttr.stroke = convertColor(borderColor, borderAlpha);
                }
            }

            for (item in graphics) {

                if (graphics.hasOwnProperty(item)) {

                    if (graphics[item] instanceof Array) {
                        outlines = graphics[item];
                        for (i = 0, len = outlines.length; i < len; i++) {
                            graphic = outlines[i].outline;
                            bindListener(graphic);
                        }
                        entity._listenersBinded = true;
                    }
                    else {
                        graphic = graphics[item];
                        bindListener(graphic);
                        entity._listenersBinded = true;
                    }
                }
            }
        },
        getDataLimits: function () {
            var dataset = this,
                conf = dataset.conf;
            return {
                max: conf.max,
                min: conf.min
            };
        },
        initComplete: function () {
            var dataset = this,
                chart = dataset.chart,
                entities = dataset.components.data;
            this.drawLabels.call(entities, dataset);
            chart.config.entitiesReady = true;
            chart.checkComplete();
        }
    }]);

    FusionCharts.register('component', ['dataset', 'Markers', {
        type: 'markers',
        configure: function () {
            var dataset = this,
                chart = dataset.chart,
                markerOptions = chart.config.markerOpts;
            dataset.calculateDataLimits();
            if (markerOptions.dataEnabled) {
                this._parseMarkers();
            }
            else {
                this.defineMarkersNShapes();
            }
            this.configureConnectors();
        },
        init: function (markerJSONData) {
            var dataSet = this;

            dataSet.JSONData = markerJSONData;
            dataSet.components = {

            };

            dataSet.conf = {

            };

            dataSet.graphics = {

            };

            dataSet.configure();
        },
        calculateMarkerRadiusLimits: function () {
            var dataset = this,
                JSONData = dataset.JSONData,
                conf = dataset.conf,
                chart = dataset.chart,
                width = chart.config.width,
                height = chart.config.height,
                markerMaxRadius = JSONData.markermaxradius,
                markerMinRadius = JSONData.markerminradius,
                minMax = this.getMarkerRadiusLimits(width, height, markerMaxRadius, markerMinRadius);
            conf.minRadius = minMax.min;
            conf.maxRadius = minMax.max;
        },
        calculateDataLimits: function () {
            var dataset = this,
                chart = dataset.chart,
                conf = dataset.conf,
                jsonData = chart.jsonData,
                markers = jsonData.markers || {},
                markerData = markers[MARKER_ITEM_KEY] || [],
                numberFormatter = chart.components.numberFormatter,
                min = +Infinity,
                max = -Infinity,
                markerObj,
                cleanValue,
                len,
                value,
                i;
            for (i = 0, len = markerData.length; i < len; i++) {
                markerObj = markerData[i];
                value = markerObj.value;
                cleanValue = numberFormatter.getCleanValue(value);
                if (cleanValue !== null) {
                    min = mathMin(cleanValue, min);
                    max = mathMax(cleanValue, max);
                }
            }
            conf.min = min;
            conf.max = max;

        },
        _parseMarkers: function () {
            var dataset = this,
                chart = dataset.chart,
                jsonData = chart.jsonData,
                markers = jsonData.markers,
                markerData = markers[MARKER_ITEM_KEY],
                shapeArr = markers.shapes,
                markerOptions = chart.config.markerOpts,
                numberFormatter = chart.components.numberFormatter,
                shapeObjs = dataset.components.shapeObjs = dataset.components.shapeObjs ||
                    (dataset.components.shapeObjs = {}),
                markerObjs = dataset.components.markerObjs = dataset.components.markerObjs ||
                    (dataset.components.markerObjs = {}),
                value,
                i,
                markerObj,
                item,
                shapeId,
                markerConfig,
                options,
                id;

            if (!markerData || !markerData.length) {
                return;
            }

            if (shapeArr && shapeArr.length) {
                i = shapeArr.length;
                for (; i; i -= 1) {
                    item = shapeArr[i - 1];
                    if ((id = item.id.toLowerCase())) {
                        shapeObjs[id] = item;
                    }
                }
            }

            i = markerData.length;

            while (i--) {
                item = markerData[i];

                if ((id =  (item.id && item.id.toLowerCase()))) {
                    value = item.value;
                    if (value !== UNDEFINED && value !== '') {
                        value = parseFloat(value);
                    }

                    markerObj = this._initializeMarkerItem(id, item, null, chart);
                    shapeId = markerObj.config.options.shapeid;
                    shapeId && typeof shapeId === 'string' && (shapeId = shapeId.toLowerCase());
                    markerConfig = markerObj.config;
                    options = markerConfig.options;
                    markerConfig.cleanValue = numberFormatter.getCleanValue(value);
                    if (markerConfig.cleanValue !== null) {
                        markerConfig.formattedValue = numberFormatter.dataLabels(value);
                    }
                    else {
                        markerConfig.formattedValue = UNDEFINED;
                    }
                    markerConfig.fillColor = pluck(options.fillcolor, options.color, markerOptions.fillColor),
                    markerConfig.fillAlpha = pluck(options.fillalpha, options.alpha, markerOptions.fillAlpha),
                    markerConfig.fillRatio = pluck(options.fillratio, markerOptions.fillRatio),
                    markerConfig.fillAngle = pluck(options.fillangle, markerOptions.fillAngle),
                    markerConfig.borderThickness = pluckNumber(options.borderthickness, markerOptions.borderThickness),
                    markerConfig.borderColor = pluck(options.bordercolor, markerOptions.borderColor),
                    markerConfig.borderAlpha = pluck(options.borderalpha, markerOptions.borderAlpha),
                    markerConfig.labelPadding = (options.labelpadding || markerOptions.labelPadding),
                    markerObj.dataset = dataset;
                    if (item.__hideMarker) {
                        markerObj._isHidden = true;
                    }

                    if (shapeId) {
                        markerObj.shapeObj = shapeObjs[shapeId];
                    }

                    markerObjs[id] = markerObj;
                }
            }
        },
        /**
         * Create objects for the markers and shapes as per their definition.
         */
        defineMarkersNShapes: function () {
            var dataset = this,
                chart = dataset.chart,
                jsonData = chart.jsonData,
                markers = jsonData.markers,
                defineArr = markers.definition,
                numberFormatter = chart.components.numberFormatter,
                markerOptions = chart.config.markerOpts,
                defineObject = convertToObj(defineArr) || {},
                applyObject = convertToObj(markers.application) || {},
                shapeArr = markers.shapes,
                shapeObjs = dataset.components.shapeObjs = dataset.components.shapeObjs ||
                    (dataset.components.shapeObjs = {}),
                markerObjs = dataset.components.markerObjs = dataset.components.markerObjs ||
                    (dataset.components.markerObjs = {}),
                options,
                markerConfig,
                value,
                i,
                markerObj,
                item,
                shapeId,
                id;

            if (!defineArr || !defineArr.length) {
                return;
            }

            if (shapeArr && shapeArr.length) {
                i = shapeArr.length;
                for (; i; i -= 1) {
                    item = shapeArr[i - 1];
                    if ((id = item.id.toLowerCase())) {
                        shapeObjs[id] = item;
                    }
                }
            }

            for (id in defineObject) {

                item = defineObject[id];
                markerObj = markerObjs[id] = this._initializeMarkerItem(id, item, applyObject[id], chart);
                markerObj.dataset = dataset;
                shapeId = markerObj.config.options.shapeid;
                markerConfig = markerObj.config;
                value = item.value;
                markerConfig.cleanValue = numberFormatter.getCleanValue(value);
                options = markerConfig.options;
                if (markerConfig.cleanValue !== null) {
                    markerConfig.formattedValue = numberFormatter.dataLabels(value);
                }
                else {
                    markerConfig.formattedValue = UNDEFINED;
                }
                markerConfig.fillColor = pluck(options.fillcolor, options.color, markerOptions.fillColor),
                markerConfig.fillAlpha = pluck(options.fillalpha, options.alpha, markerOptions.fillAlpha),
                markerConfig.fillRatio = pluck(options.fillratio, markerOptions.fillRatio),
                markerConfig.fillAngle = pluck(options.fillangle, markerOptions.fillAngle),
                markerConfig.borderThickness = pluckNumber(options.borderthickness, markerOptions.borderThickness),
                markerConfig.borderColor = pluck(options.bordercolor, markerOptions.borderColor),
                markerConfig.borderAlpha = pluck(options.borderalpha, markerOptions.borderAlpha),
                markerConfig.labelPadding = (options.labelpadding || markerOptions.labelPadding);
                markerConfig.options.tooltext = pluck(options.tooltext, markerOptions.tooltext);
                markerConfig.link = options.link;
                if (shapeId) {
                    markerObj.shapeObj = shapeObjs[shapeId.toLowerCase()];
                }
            }
        },
        getMarkerRadiusLimits: function (width, height, userMax, userMin) {

            var dime = mathMin(width, height),
                factor = 0.02,
                times = 3.5,
                minR = (factor * dime),
                maxR = (factor * times * dime);

            userMin = parseFloat(userMin);
            userMax = parseFloat(userMax);

            if (!isNaN(userMin) && !isNaN(userMax)) {
                if (userMin < userMax) {
                    return {
                        min: userMin,
                        max: userMax
                    };
                }
                else {
                    return {
                        min: userMax,
                        max: userMin
                    };
                }
            }
            else if (!isNaN(userMin)) {
                return {
                    min: userMin,
                    max: 10 * userMin
                };
            }
            else if (!isNaN(userMax)) {
                return {
                    min: parseInt((userMax / 10), 10),
                    max: userMax
                };
            }
            else {
                return {
                    min: minR,
                    max: maxR
                };
            }
        },
        getDataLimits: function () {
            var dataset = this,
                conf = dataset.conf;
            return {
                min: conf.min,
                max: conf.max
            };
        },
        _initializeMarkerItem: function (id, markerDefinition, markerApplication) {
            var markerObj = {},
                config = markerObj.config,
                opts;
            if (!config) {
                config = markerObj.config = {};
            }
            config.id = id;
            config.definition = markerDefinition;
            config.application = markerApplication;

            // new member variables for value markers.
            config.hasValue = null;
            config.value =  null;
            config.options = null;

            config.label = null;
            config.markerShape = null;
            config.markerLabel = null;
            config.drawOptions = { shape: null, label: null };

            config.drawComplete = false;

            opts = markerObj.config.options = extend2({}, config.definition);

            if (config.dataEnabled) {
                if (!isNaN(opts.value) && opts.value !== '') {
                    markerObj.value = parseFloat(opts.value);
                    markerObj.hasValue = true;
                }
            }
            else if (config.applyAll) {
                config.options = extend2(opts, config.application);
            }
            else if (markerApplication) {
                config.options = extend2(opts, config.application);
            }
            return markerObj;
        },
        configureConnectors: function () {
            var dataset = this,
                chart = dataset.chart,
                jsonData = chart.jsonData,
                datasetComponents = dataset.components,
                markers = jsonData.markers || {},
                connectors = markers.connector || markers.connectors || [],
                markerObjs = datasetComponents.markerObjs,
                length = connectors.length,
                connectorComponents = dataset.components.connectors,
                getMouseOverFn = function (eventArgs) {
                    return function (e) {
                        var shape = e.data,
                            wrapper = shape.wrapper;

                        if (wrapper && shape.options.hoverEffect) {
                            wrapper.attr(shape.options._hoverAttrs);
                        }
                        /**
                         * In maps, markers are used to denote important or essential locations.
                         * We might encounter situations where we will need to connect markers to make the
                         * information more lucid. `Connectors` are used to connect markers.
                         * The `connectorRollOver` event is fired when the pointer is rolled over the connector.
                         *
                         * @event FusionCharts#connectorRollOver
                         * @group map
                         *
                         * @param {string} fromMarkerId The Id of the marker from which the connector starts.
                         * @param {string} toMarkerId The Id of the marker to which the connector is drawn.
                         * @param {label} label The label on the connector.
                         *
                         */
                        global.raiseEvent('connectorrollover', eventArgs, chart.chartInstance, e);
                    };
                },
                getMouseOutFn = function (eventArgs) {
                    return function (e) {
                        var shape = e.data,
                            wrapper = shape.wrapper;

                        if (wrapper && shape.options.hoverEffect) {
                            wrapper.attr(shape.options._defaultAttrs);
                        }
                        /**
                         * In maps, markers are used to denote important or essential locations. We might encounter
                         * situations where we will need to connect markers to make the information more lucid.
                         * `Connectors` are used to connect markers. The `connectorRollOut` event is fired when the
                         * pointer is rolled out of the connector. The {@link FusionCharts#event:connectorRollOver}
                         * event precedes this event.
                         *
                         * @event FusionCharts#connectorRollOut
                         * @group map
                         * @see FusionCharts#event:connectorRollOver
                         *
                         * @param {string} fromMarkerId The Id of the marker from which the connector starts.
                         * @param {string} toMarkerId The Id of the marker to which the connector is drawn.
                         * @param {label} label The label on the connector.
                         */
                        global.raiseEvent('connectorrollout', eventArgs, chart.chartInstance, e);
                    };
                },
                getClickFn = function (eventArgs) {
                    return function (e) {
                        /**
                         * In maps, markers are used to denote important or essential locations.
                         * We might encounter situations where we will need to connect markers to make the
                         * information more lucid. `Connectors` are used to connect markers.
                         * The `connectClick` event is fired when a connector is clicked. It is preceded by
                         * the {@link FusionCharts#event:connectorRollOver} event.
                         *
                         * @event FusionCharts#connectorClick
                         * @param {string} fromMarkerId The Id of the marker from which the connector starts.
                         * @param {string} toMarkerId The Id of the marker to which the connector is drawn.
                         * @param {label} label The label on the connector.
                         *
                         * @example
                         *     //declaring the fusioncharts object.
                         *     var myMap = new FusionCharts( "Maps/FCMap_World.swf", "myMapId", "400", "300", "0" );
                         *     //setting the data source.
                         *     myMap.setXMLUrl("Data.xml");
                         *     //rendering the chart in the associated Div.
                         *     myMap.render("mapContainer")
                         *
                         *     //function to perform the necessary action on capturing the connectorClicked event.
                         *     //alert the user with the from and to marker id's.
                         *     function listenerEvent(eventObject, argumentsObject){
                         *         alert( "From marker ID: "+ argumentsObject.fromMarkerId + ",
                         *                         To marker ID: " + argumentsObject.toMarkerId);
                         *     }
                         *
                         *     //listening to the connector click event
                         *     FusionCharts("myMapId").addEventListener ("connectorClicked" , listenerEvent );
                         *
                         */
                        global.raiseEvent('connectorClick', eventArgs, chart.chartInstance, e);
                    };
                },
                chartConnOptions = chart.config.connectorOpts,
                connectorItem = {},
                config,
                options,
                fromMarker,
                toMarker,
                label,
                toolText,
                thickness,
                color,
                alpha,
                hovercolor,
                hoveralpha,
                hoverthickness,
                connLabelConfig,
                obj,
                i;
            if (!connectorComponents) {
                connectorComponents = dataset.components.connectors = [];
            }
            for (i = 0; i < length; i++) {
                obj = connectors[i];
                if (!obj.from && !obj.to) {
                    continue;
                }
                fromMarker = markerObjs[obj.from.toLowerCase()];
                toMarker = markerObjs[obj.to.toLowerCase()];

                if (!fromMarker || !toMarker) {
                    continue;
                }
                label = connectors[i].label;
                // if (connectorConfig.hideOpen &&
                //         (fromMarker._isHidden || toMarker._isHidden)) {
                //     continue;
                // }
                connectorItem = connectorComponents[i];
                !connectorItem && (connectorItem = connectorComponents[i] = {});
                !connectorItem.config && (config = connectorItem.config = {});
                !connectorItem.graphics && (connectorItem.graphics = {});
                config = connectorItem.config = extend2({}, obj);
                config.fromMarker = fromMarker;
                config.toMarker = toMarker;
                config.link = obj.link;
                config.showTooltip = pluckNumber(obj.showtooltip, chartConnOptions.showTooltip),
                toolText = config.tooltext = config.showTooltip ? pluck(obj.tooltext,
                    chartConnOptions.tooltext) : BLANK;
                thickness = config.thickness = pluck(obj.thickness, chartConnOptions.thickness),
                color = config.color = pluck(obj.color, chartConnOptions.color),
                alpha = config.alpha = pluck(obj.alpha, chartConnOptions.alpha),
                config.hoverEffect = pluckNumber(obj.showhovereffect, chartConnOptions.showHoverEffect),
                hovercolor = pluck(obj.hovercolor, chartConnOptions.hoverColor, color),
                hoveralpha = pluck(obj.hoveralpha, chartConnOptions.hoverAlpha, alpha),
                hoverthickness = pluck(obj.hoverthickness, chartConnOptions.hoverThickness, thickness),
                config.dashed = pluck(obj.dashed, chartConnOptions.dashed),
                config.dashLen = pluckNumber(obj.dashlen, chartConnOptions.dashlen),
                config.dashGap = pluckNumber(obj.dashgap, chartConnOptions.dashgap);
                if (toolText) {
                    config.tooltext = toolText = parseUnsafeString(parseTooltext(toolText, [3, 40, 41, 42, 43], {
                        label: label,
                        fromId: fromMarker.config.definition.id,
                        toId: toMarker.config.definition.id,
                        fromLabel: fromMarker.config.definition.label,
                        toLabel: toMarker.config.definition.label
                    }, options));
                }
                config.eventArgs = {
                    fromMarkerId: fromMarker.config.id,
                    toMarkerId: toMarker.config.id,
                    label: label
                };
                config._hoverAttrs = {
                    stroke: colorize({
                        color: hovercolor,
                        alpha: hoveralpha
                    }).toString(),
                    'stroke-width': hoverthickness
                };
                config._defaultAttrs = {
                    stroke: colorize({
                        color: color,
                        alpha: alpha
                    }).toString(),
                    'stroke-width': thickness
                };
                config.type = 'line';
                config.onclick = getClickFn(config.eventArgs);
                config.onmouseover = getMouseOverFn(config.eventArgs);
                config.onmouseout = getMouseOutFn(config.eventArgs);
                if (label) {
                    connLabelConfig = connectorItem.labelConfig;
                    !connLabelConfig && (connLabelConfig = connectorItem.labelConfig = {});
                    connLabelConfig.type = 'text';
                    connLabelConfig.text = label;
                    connLabelConfig.align = POSITION_CENTER,
                    connLabelConfig.valign = POSITION_MIDDLE,
                    connLabelConfig.font = chartConnOptions.font,
                    connLabelConfig.fillcolor = chartConnOptions.fontColor;
                    connLabelConfig.bgcolor = chartConnOptions.labelBgColor;
                    connLabelConfig.bordercolor = chartConnOptions.labelBorderColor;
                    connLabelConfig.tooltext = chartConnOptions.tooltext;
                }

            }
        },
        draw: function () {
            var dataset = this,
                chart = dataset.chart,
                conf = dataset.conf,
                annotations = chart.components.mapAnnotations,
                markers = dataset.components.markerObjs,
                chartConf = chart.config,
                chartMarkerOpts = chartConf.markerOpts,
                scalingParams = chartConf.scalingParams,
                markerItems = [],
                markerLabels = [],
                appliedMarkers = {},
                appliedObj,
                markerItem,
                shapeId,
                config,
                id,
                markerLabelGroup,
                markerGroup,
                jobList = chart.getJobList();

            dataset.imageLoadCount = 0;
            dataset.imageCount = 0;

            markerLabelGroup = annotations.addGroup({
                items: markerLabels
            });

            markerGroup = annotations.addGroup({
                fillalpha: '100',
                items: markerItems
            });

            dataset.components.markerGroup = markerGroup;
            dataset.components.markerLabelGroup = markerLabelGroup;
            // Have to configure the autoscale property in draw function as the scale factor is
            // available only after spaceManagement
            conf.autoScale = chartMarkerOpts.autoScale ? scalingParams.sFactor : 1;
            for (id in markers) {

                appliedObj = null;
                markerItem = markers[id];
                config = markerItem.config;
                shapeId = config.options.shapeid;

                if (!config.conIsHidden) {
                    appliedObj = this._drawMarkerItem.call(markerItem);
                }

                if (!appliedObj) {
                    continue;
                }

                config._annotationIndex = markerItems.length;
                appliedMarkers[id] = markerItem;
                markerItem.markerShape = appliedObj.markerShape &&
                    markerGroup.addItem(appliedObj.markerShape, false, chart);
                markerItems.push(markerItem.markerShape);
                markerItem.markerLabel = appliedObj.markerLabel &&
                    markerLabelGroup.addItem(appliedObj.markerLabel, false, chart);
                markerLabels.push(markerItem.markerLabel);
            }

            this._drawConnectors();

            jobList.kdTreeID.push(schedular.addJob(this._buildKdTree, dataset,
                [], lib.priorityList.kdTree, true));
        },
        _buildKdTree: function () {
            var dataset = this,
                kdArrayMap = dataset.components.kdArrayMap,
                markerGroup = dataset.components.markerGroup,
                kdPointsArr = [],
                id,
                i,
                items = markerGroup && markerGroup.items,
                len = (items && items.length) || 0;

            for (i = 0; i < len; i++) {
                id = items[i]._id;
                kdArrayMap[id] && kdPointsArr.push(kdArrayMap[id]);
            }


            if (!dataset.components.kDTree) {
                //Create a new instance of the KdTree class and store its reference in the current instance.
                dataset.components.kDTree = new KdTree(true);
            }
            dataset.components.kDTree._setSearchLimit(Infinity, Infinity);
            dataset.components.kDTree.buildKdTree(kdPointsArr);
        },
        _drawMarkerItem: function () {
            var marker = this,
                dataset = marker.dataset,
                chart = dataset.chart,
                conf = chart.config,
                datasetConfig = dataset.conf,
                scalingParams = conf.scalingParams,
                markerConfig = marker.config,
                options = markerConfig.options,
                definition = markerConfig.definition,
                chartMarkerOpts = conf.markerOpts,
                markerStyle = chartMarkerOpts.dataLabels.style,
                shapeId = options.shapeid,
                itemScale = (options.scale || 1),
                label = options.label || BLANK,
                scaleFactor = chart.config.scalingParams.scaleFactor * chart.baseScaleFactor,
                labelPos = (options.labelpos || POSITION_TOP).toLowerCase(),
                value = markerConfig.formattedValue,
                tooltext = options.tooltext,
                radius = (pluckNumber(definition.radius, markerConfig.radius, chartMarkerOpts.radius) *
                    itemScale * datasetConfig.autoScale) || 0.0001,
                fillColor = markerConfig.fillColor,
                fillAlpha = markerConfig.fillAlpha,
                fillRatio = markerConfig.fillRatio,
                fillAngle = markerConfig.fillAngle,
                borderThickness = markerConfig.borderThickness,
                borderColor = markerConfig.borderColor,
                borderAlpha = markerConfig.borderAlpha,
                labelObj,
                align,
                valign,
                baseWidth,
                baseHeight,
                xOffset,
                yOffset,
                wrapWidth,
                wrapHeight,
                labelPadding,
                shapeObj,
                fillAttrs,
                hoverFillAttrs,
                shapeType,
                calcX,
                calcY,
                kdPoint,
                innerradius,
                sides,
                type,
                kdArrayMap = dataset.components.kdArrayMap || (dataset.components.kdArrayMap = {}),
                markerId = marker.config.id;

            markerConfig.autoScale = chartMarkerOpts.autoScale ? scaleFactor : 1;
            if (!shapeId) {
                return;
            }

            if (tooltext) {
                tooltext = parseUnsafeString(parseTooltext(tooltext, [1, 2, 3], {
                    formattedValue: value,
                    label: label
                }, options));
            }
            else {
                tooltext = (value ? (label + chartMarkerOpts.tooltipSepChar + value) : label);
            }

            if (value !== UNDEFINED && value !== null) {
                /* value_for_markers */
                label = label + chartMarkerOpts.labelSepChar + value;
            }
            else {

                if (!isNaN(itemScale)) {
                    if (itemScale < 0) {
                        itemScale = 0;
                    }
                    else if (itemScale > 5) {
                        itemScale = 5;
                    }
                }
                else {
                    itemScale = 1;
                }
            }

            extend2(options, {
                x: options.x.toString(),
                y: options.y.toString(),
                fillcolor: fillColor,
                fillalpha: fillAlpha,
                fillratio: fillRatio,
                fillangle: fillAngle,
                borderthickness: borderThickness,
                bordercolor: borderColor,
                borderalpha: borderAlpha,
                hovereffect: pluck(chartMarkerOpts.showHoverEffect),
                radius: radius.toString(),
                // tooltext: chartMarkerOpts.showTooltip ? tooltext : 0,
                link: options.link,
                showshadow: pluckNumber(options.showshadow, markerConfig.shadow),
                _markerLabel: label, // for event
                _markerId: options.id, // for event
                id: (options.id + BLANK).toLowerCase()
            });

            delete options.tooltext;

            markerConfig.tooltext = chartMarkerOpts.showTooltip ? tooltext : false;

            shapeType = options.type;

            calcX = (Number(options.x) * scalingParams.sFactor) + scalingParams.translateX;
            calcY = (Number(options.y) * scalingParams.sFactor) + scalingParams.translateY;
            radius = options.radius;

            if (shapeId === 'triangle') {
                extend2(options, {
                    type: 'polygon',
                    sides: 3,
                    startangle: chartMarkerOpts.startAngle

                });
                type = 'polygon';
                sides = 3;
            }
            else if (shapeId === 'diamond') {
                extend2(options, {
                    type: 'polygon',
                    sides: 4,
                    startangle: chartMarkerOpts.startAngle
                });
                type = 'polygon';
                sides = 4;
            }
            else if (shapeId === 'arc') {

                innerradius = radius * INNERRADIUSFACTOR;

                extend2(options, {
                    type: 'arc',
                    startangle: 0,
                    endangle: 360,
                    innerradius: innerradius
                });
                type = 'arc';
            }
            else if (shapeId === 'circle') {
                options.type = 'circle';
                type = 'circle';
            }
            else {
                shapeObj = dataset.getShapeArgs.call(marker);

                if (!chartMarkerOpts.dataEnabled || !chartMarkerOpts.valueToRadius || options.radius === UNDEFINED) {
                    !shapeObj.radius && (shapeObj.radius = chartMarkerOpts.radius);
                    shapeObj.radius *= (itemScale * markerConfig.autoScale);
                }
                else {
                    delete shapeObj.radius;
                }

                extend2(options, shapeObj);
                options.id = options._markerId && options._markerId.toLowerCase();
                innerradius = shapeObj.innerradius;
                radius = shapeObj.radius;
                type = shapeObj.type;
                sides = shapeObj.sides;
            }

            // Setting the hover attributes after all the cosmetics have been finalized.
            extend2(options, {
                hoverfillcolor: pluck(options.fillhovercolor, chartMarkerOpts.hoverFillColor, options.fillcolor),
                hoverfillalpha: pluck(options.fillhoveralpha, chartMarkerOpts.hoverFillAlpha, options.fillalpha),
                hoverfillratio: pluck(options.fillhoverratio, chartMarkerOpts.hoverFillRatio, options.fillratio),
                hoverfillangle: pluck(options.fillhoverangle, chartMarkerOpts.hoverFillAngle, options.fillangle),
                hoverborderthickness: pluckNumber(options.borderhoverthickness,
                chartMarkerOpts.hoverBorderThickness,
                    options.borderthickness),
                hoverbordercolor: pluck(options.borderhovercolor,
                chartMarkerOpts.hoverBorderColor, options.bordercolor),
                hoverborderalpha: pluck(options.borderhoveralpha,
                chartMarkerOpts.hoverBorderAlpha, options.borderalpha)
            });


            fillAttrs = {
                alpha: options.fillalpha,
                color: options.fillcolor,
                angle: 360 - options.fillangle,
                ratio: options.fillratio
            };

            hoverFillAttrs = {
                alpha: options.hoverfillalpha,
                color: options.hoverfillcolor,
                angle: 360 - options.hoverfillangle,
                ratio: options.hoverfillratio
            };

            /** Hover Effect for markers **/
            options._defaultattrs = {
                fill: toRaphaelColor(fillAttrs),
                'stroke-width': options.showborder !== '0' ? options.borderthickness : 0,
                stroke: convertColor(options.bordercolor, options.borderalpha)
            };

            options._hoverattrs = {
                fill: toRaphaelColor(hoverFillAttrs),
                'stroke-width': options.showborder !== '0' ? options.hoverborderthickness : 0,
                stroke: convertColor(options.hoverbordercolor, options.hoverborderalpha)
            };

            if (options.type === 'image') {
                // In case of image there should not be a border around it by default.
                options.borderthickness = options.borderthickness || 0;

                options.onload = function (imageattr) {
                    var shape = this,
                        options = shape.options,
                        width = imageattr.width,
                        height = imageattr.height,
                        kdPoint = {},

                        // Recalculating x & y because by default annotations fx
                        // aligns the image to the top left corner.
                        // In this case the image needs to be centrally aligned.
                        calcX = (Number(options.x) - (width / (2 * scalingParams.sFactor))) * scalingParams.sFactor,
                        calcY = (Number(options.y) - (height / (2 * scalingParams.sFactor))) * scalingParams.sFactor,
                        item;

                    kdPoint = kdArrayMap[markerId] || (kdArrayMap[markerId] = {});

                    kdPoint.x = calcX + scalingParams.translateX;
                    kdPoint.y = calcY + scalingParams.translateY;
                    kdPoint.element = marker;

                    kdPoint.shapeInfo = {
                        type: 'rect',
                        width: width,
                        height: height
                    };

                    if (width && height) {
                        for (item in { wrapper: 1, tracker: 1 }) {
                            shape[item] && shape[item].attr({
                                x: calcX,
                                y: calcY,
                                width: width,
                                height: height
                            });
                        }
                    }
                    dataset.imageLoadCount++;

                    if (dataset.imageLoadCount === dataset.imageCount) {
                        dataset._buildKdTree();
                    }
                };

                options.onerror = function () {
                    dataset.imageLoadCount++;
                    if (dataset.imageLoadCount === dataset.imageCount) {
                        dataset._buildKdTree();
                    }
                };

                dataset.imageCount++;
            }
            else {

                kdPoint = kdArrayMap[markerId] || (kdArrayMap[markerId] = {});

                kdPoint.x = calcX;
                kdPoint.y = calcY;
                kdPoint.element = marker;

                kdPoint.shapeInfo = {
                    type: type,
                    sides: sides,
                    radius: Number(radius) + (options.borderthickness / 2),
                    innerradius: innerradius
                };
            }


            markerConfig.drawOptions.shape = options;
            if (!chartMarkerOpts.showLabels) {
                return {
                    markerShape: options
                };
            }

            // creating marker label options here.
            labelPadding = (options.labelpadding || chartMarkerOpts.labelPadding),
            labelObj = dataset._getLabelOptions(labelPos, labelPadding, options),
            align = labelObj.align,
            valign = labelObj.valign,
            baseWidth = markerConfig._labelBaseWidth,
            baseHeight = markerConfig._labelBaseHeight,
            xOffset = markerConfig._labelXOffset,
            yOffset = markerConfig._labelYOffset,

            wrapWidth = chartMarkerOpts.labelWrapWidth ? chartMarkerOpts.labelWrapWidth :
                (dataset.getWrapWidth[align](baseWidth, Number(labelObj.x) + xOffset)),
            wrapHeight = chartMarkerOpts.labelWrapHeight ? chartMarkerOpts.labelWrapHeight :
                (dataset.getWrapHeight[valign](baseHeight, Number(labelObj.y) + yOffset));


            if (wrapWidth > labelPadding) {
                wrapWidth -= labelPadding;
            }
            if (wrapHeight > labelPadding) {
                wrapHeight -= labelPadding;
            }

            // When the marker label is placed over the marker then the label
            // will have the same hovering effect as the marker
            if (align == 'center' && valign == 'middle') {
                markerConfig.drawOptions.label = extend2({ type: 'text' }, {
                    text: label,
                    tooltext: options.tooltext,
                    x: labelObj.x,
                    y: labelObj.y,
                    align: align,
                    valign: labelObj.valign,
                    wrap: 1,
                    wrapwidth: wrapWidth,
                    wrapheight: wrapHeight,
                    fontsize: markerStyle.fontSize / scalingParams.sFactor,
                    font: markerStyle.fontFamily,
                    fillcolor: markerStyle.fontColor
                });
            } else {
                markerConfig.drawOptions.label = extend2({ type: 'text' }, {
                    text: label,
                    tooltext: options.tooltext,
                    x: labelObj.x,
                    y: labelObj.y,
                    align: align,
                    valign: labelObj.valign,
                    wrap: 1,
                    wrapwidth: wrapWidth,
                    wrapheight: wrapHeight,
                    fontsize: markerStyle.fontSize / scalingParams.sFactor,
                    font: markerStyle.fontFamily,
                    fillcolor: markerStyle.fontColor
                });
            }

            return {
                markerShape: options,
                markerLabel: markerConfig.drawOptions.label
            };
        },
        getHoverFn: function () {
            var dataset = this,
                chart = dataset.chart;

            return function () {
                var element = this,
                    marker = element.data('marker'),
                    shape = marker.markerShape,
                    options = shape.options,
                    bounds = shape.bounds,
                    eventArgs = options._markerEventArgs,
                    wrapper = shape.wrapper,
                    fillOptions = shape.fillOptions,
                    attrs,
                    fillObj,
                    scalingParams = chart.config.scalingParams,
                    plotLeft = scalingParams.translateX,
                    plotTop = scalingParams.translateY,
                    markerConfig = marker.config;

                if (wrapper && options.hovereffect) {
                    if (shape.type === 'circle') {
                        fillObj = {
                            color: options.hoverfillcolor,
                            alpha: options.hoverfillalpha,
                            angle: 360 - options.hoverfillangle,
                            ratio: options.hoverfillratio,
                            gradientUnits: 'objectBoundingBox',
                            radialGradient: fillOptions.radialGradient,
                            cx: fillOptions.cx,
                            cy: fillOptions.cy
                        };
                        options._hoverattrs.fill = toRaphaelColor(fillObj);
                        // options._hoverattrs = extend2(obj, options._hoverattrs);
                    }
                    attrs = extend2({}, options._hoverattrs);
                    if (wrapper.type === 'image') {
                        delete attrs.fill;
                        delete attrs.stroke;
                        delete attrs['stroke-width'];
                    }
                    wrapper.attr(attrs);
                }

                if (!eventArgs) {
                    eventArgs = options._markerEventArgs = {
                        x: bounds.x1 / bounds.xs,
                        y: bounds.y1 / bounds.ys,
                        scaledX: bounds.x1,
                        scaledY: bounds.y1,
                        chartX: plotLeft + bounds.x1,
                        chartY: plotTop + bounds.y1,
                        id: options._markerId,
                        label: options._markerLabel
                    };
                }

                /**
                 * ``Markers`` are used to denote important or essential points in a map.
                 * e.g In an India map , markers might be used to denote capitals of the different states.
                 * The markerRollOver event is fired when the pointer is rolled over a marker.
                 * @event FusionCharts#markerRollOver
                 * @group map
                 *
                 * @param {number} x The original X co-ordinate of the marker.
                 * @param {number} y The original Y co-ordinate of the marker.
                 * @param {number} scaledX The scaled value of X co-ordinate of the marker.
                 * @param {number} scaledY The scaled value of Y co-ordinate of the marker.
                 * @param {number} chartX The x position of the marker with respect to the top-left
                 * corner of the map canvas (that is 0,0 position).
                 * @param {number} chartY The y position of the marker with respect to the top-left
                 * corner of the map canvas (that is 0,0 position).
                 * @param {string} label The label of the marker.
                 *
                 * @example
                 * //declaring the FusionCharts object.
                 * var myMap = new FusionCharts( "Maps/FCMap_World.swf", "myMapId", "400", "300", "0" );
                 * //passing the data to the object in *XML* format.
                 * myMap.setXMLUrl("Data.xml");
                 * //rendering the chart in the map container.
                 * myMap.render("mapContainer");
                 *
                 * //the function which gets executed when the MarkerRollOver event is captured.
                 * function myChartListener(eventObject, argumentsObject){
                 *     alert([
                 *         "ID: ", argumentsObject.id, "; Label: ", argumentsObject.label,
                 *         "; x: ", argumentsObject.x, ", y: ", argumentsObject.x,
                 *         "; scaledX: ", argumentsObject.scaledX, ", scaledY: ", argumentsObject.scaledY,
                 *         "; chartX: ", argumentsObject.chartX, ", chartY: ", argumentsObject.chartY
                 *     ].join(""));
                 * }
                 *
                 * //listening to the markerRollOver event.
                 * FusionCharts("myMapId").addEventListener ("markerRollOver" , myChartListener );
                **/


                global.raiseEventGroup(markerConfig.id,'markerRollOver', eventArgs,
                    chart.chartInstance, markerConfig, undefined, undefined, undefined);
            };
        },

        getHoverOutFn: function () {
            var dataset = this,
                chart = dataset.chart;

            return function () {
                var element = this,
                    marker = element.data('marker'),
                    shape = marker.markerShape,
                    wrapper = shape.wrapper,
                    fillOptions = shape.fillOptions,
                    markerConfig = marker.config,
                    options = shape.options,
                    attrs;

                if (wrapper && shape.options.hovereffect) {
                    if (shape.type === 'circle') {
                        options._defaultattrs.fill = toRaphaelColor(fillOptions);
                    }

                    attrs = extend2({}, shape.options._defaultattrs);
                    if (wrapper.type === 'image') {
                        delete attrs.fill;
                        delete attrs.stroke;
                        delete attrs['stroke-width'];
                    }
                    wrapper.attr(attrs);
                }
                /**
                 * `Markers` are used to denote important or essential points in a map.
                 * e.g In an India map , markers might be used to denote capitals of the different states.
                 * The `markerRollOut` event is fired when the pointer is rolled out of a marker.
                 * This event is usually preceded by the {@link FusionCharts#markerRollOver} or the
                 * {@link FusionCharts#markerClicked} event.
                 *
                 * @event FusionCharts#markerRollOut
                 * @group map
                 *
                 * @param {number} x The original X co-ordinate of the marker.
                 * @param {number} y The original Y co-ordinate of the marker.
                 * @param {number} scaledX The scaled value of X co-ordinate of the marker.
                 * @param {number} scaledY The scaled value of Y co-ordinate of the marker.
                 * @param {number} chartX The x position of the marker with respect to the top-left
                 * corner of the map canvas (that is 0,0 position).
                 * @param {number} chartY The y position of the marker with respect to the top-left
                 * corner of the map canvas (that is 0,0 position).
                 * @param {string} label The label of the marker.
                 *
                 * @example
                 * //declaring the Fusion Charts object.
                 * var myMap = new FusionCharts( "Maps/FCMap_World.swf", "myMapId", "400", "300", "0" );
                 * //passing the data to the object in *XML* format.
                 * myMap.setXMLUrl("Data.xml");
                 * //rendering the chart in the map container.
                 * myMap.render("mapContainer");
                 *
                 * //the function which gets executed when the MarkerRollOut event is captured.
                 * function myChartListener(eventObject, argumentsObject){
                 *     alert([
                 *         "ID: ", argumentsObject.id, "; Label: ", argumentsObject.label,
                 *         "; x: ", argumentsObject.x, ", y: ", argumentsObject.x,
                 *         "; scaledX: ", argumentsObject.scaledX, ", scaledY: ", argumentsObject.scaledY,
                 *         "; chartX: ", argumentsObject.chartX, ", chartY: ", argumentsObject.chartY
                 *     ].join(""));
                 * }
                 *
                 * //listening to the markerRollOut event.
                 * FusionCharts("myMapId").addEventListener ("markerRollOut" , myChartListener );
                 *
                 */
                global.raiseEventGroup(markerConfig.id,'markerRollOut',
                    shape.options._markerEventArgs, chart.chartInstance, undefined, undefined, undefined);
            };
        },

        getClickFn: function () {
            var dataset = this;
            return function (e) {
                var element = this,
                    marker = element.data('marker'),
                    chart = dataset.chart,
                    scalingParams = chart.config.scalingParams,
                    plotLeft = scalingParams.translateX,
                    plotTop = scalingParams.translateY,
                    shape = marker.markerShape,
                    options = shape.options,
                    bounds = shape.bounds,
                    eventArgs = options._markerEventArgs;

                if (!eventArgs) {
                    eventArgs = options._markerEventArgs = {
                        x: bounds.x1 / bounds.xs,
                        y: bounds.y1 / bounds.ys,
                        scaledX: bounds.x1,
                        scaledY: bounds.y1,
                        chartX: plotLeft + bounds.x1,
                        chartY: plotTop + bounds.y1,
                        id: options._markerId,
                        label: options._markerLabel
                    };
                }
                    /*
                     * `Markers` are used to denote important or essential points in a map.
                     * e.g In an India map , markers might be used to denote capitals of the different states.
                     * The markerClick event is fired when a marker is clicked.
                     * This event is usually preceded by the {@link FusionCharts#event:markerRollOver} event.
                     *
                     * By listening to this event , the user can retrieve the position of the marker and the label
                     * associated with it.
                     *
                     * @event FusionCharts#markerClick
                     * @group map
                     *
                     * @param {number} x The original X co-ordinate of the marker.
                     * @param {number} y The original Y co-ordinate of the marker.
                     * @param {number} scaledX The scaled value of X co-ordinate of the marker.
                     * @param {number} scaledY The scaled value of Y co-ordinate of the marker.
                     * @param {number} chartX The x position of the marker with respect to the top-left
                     * corner of the map canvas (that is 0,0 position).
                     * @param {number} chartY The y position of the marker with respect to the top-left
                     * corner of the map canvas (that is 0,0 position).
                     * @param {string} label The label of the marker.
                     *
                     * @example
                     * //declaring the Fusion Charts object.
                     * var myMap = new FusionCharts( "Maps/FCMap_World.swf", "myMapId", "400", "300", "0" );
                     * //passing the data to the object in *XML* format.
                     * myMap.setXMLUrl("Data.xml");
                     * //rendering the chart in the map container.
                     * myMap.render("mapContainer");
                     *
                     * //the function which gets executed when the MarkerClick event is captured.
                     * function myChartListener(eventObject, argumentsObject){
                     *     alert([
                     *         "ID: ", argumentsObject.id, "; Label: ", argumentsObject.label,
                     *         "; x: ", argumentsObject.x, ", y: ", argumentsObject.x,
                     *         "; scaledX: ", argumentsObject.scaledX, ", scaledY: ", argumentsObject.scaledY,
                     *         "; chartX: ", argumentsObject.chartX, ", chartY: ", argumentsObject.chartY
                     *     ].join(""));
                     * }
                     *
                     * //listening to the markerClicked event.
                     * FusionCharts("myMapId").addEventListener ("markerClicked" , myChartListener );
                     */

                global.raiseEvent('markerClick', eventArgs, chart.chartInstance, e);
            };
        },

        highlightPoint: function (kdPoint) {
            var marker = kdPoint.element,
                dataset = this,
                chart = dataset.chart,
                chartGraphics = chart.graphics,
                paper = chart.components.paper,
                trackerElems = chartGraphics.trackerElems || (chartGraphics.trackerElems = {}),
                shapeInfo = kdPoint.shapeInfo,
                type,
                trackerElement,
                x = kdPoint.x,
                y = kdPoint.y,
                sides,
                startAngle,
                width,
                radius,
                innerradius,
                height,
                endAngle,
                angles,
                lastHoveredPoint = chart.config.lastHoveredPoint,
                newElem = false;

            if (kdPoint === false) {
                type = lastHoveredPoint && lastHoveredPoint.shapeInfo.type;
                trackerElement = trackerElems[type];
                trackerElement && trackerElement.hide();
                chart.config.lastHoveredPoint = null;
                return;
            }

            type = shapeInfo.type;

            type === 'circle' && (type = 'polygon');

            trackerElement = trackerElems[type];
            if (type === 'polygon') {
                sides = shapeInfo.sides || 1;
                startAngle = shapeInfo.startAngle;
                radius = shapeInfo.radius;

                if (!trackerElement) {
                    trackerElement = chartGraphics.trackerElems[type] = paper.polypath(sides, x, y, radius, startAngle);
                    newElem = true;
                }
                else {
                    trackerElement.attr({
                        polypath: [sides, x, y, radius, startAngle]
                    });
                }
            }

            else if (type === 'rect') {
                width = shapeInfo.width;
                height = shapeInfo.height;

                if (!trackerElement) {
                    trackerElement = chartGraphics.trackerElems[type] = paper.rect(x, y, width, height);
                    newElem = true;
                }
                else {
                    trackerElement.attr({
                        x: x,
                        y: y,
                        width: width,
                        height: height
                    });
                }
            }

            else if (type === 'arc') {
                innerradius = marker.markerShape.bounds.innerR;
                angles = marker.markerShape.bounds.angles;
                startAngle = angles.start * deg2rad;
                endAngle = angles.end * deg2rad;
                radius = shapeInfo.radius;
                if (!trackerElement) {
                    trackerElement = chartGraphics.trackerElems[type] = paper.ringpath(x, y, radius, innerradius,
                        startAngle, endAngle);
                    newElem = true;
                }
                else {
                    trackerElement.attr({
                        ringpath: [x, y, radius, innerradius, startAngle, endAngle]
                    });
                }
            }

            chart.config.lastHoveredPoint = kdPoint;

            if (newElem) {
                trackerElement.attr({
                    fill: TRACKER_FILL,
                    stroke: TRACKER_FILL
                })
                .click(dataset.getClickFn())
                .hover(dataset.getHoverFn(), dataset.getHoverOutFn());
                trackerElement.trackTooltip(true);
            }

            // trackerElement.toFront();
            trackerElement.show().tooltip(marker.config.tooltext)
                .data('marker', marker);
            // newElem && fireMouseEvent('mouseover', trackerElement && trackerElement.node,
            // chartConfig.lastMouseEvent);
        },

        _drawConnectors: function () {
            var dataset = this,
                chart = dataset.chart,
                datasetComponents = dataset.components,
                connectors = datasetComponents.connectors,
                length = connectors.length,
                scalingParams = chart.config.scalingParams,
                chartConnOptions = chart.config.connectorOpts,
                showConnectorLabels = chartConnOptions.showLabels,
                annotations = chart.components.mapAnnotations,
                i,
                connectorOptions = [],
                connectorLabelItems = [],
                x,
                y,
                toX,
                toY,
                fromMarkerConfig,
                toMarkerConfig,
                groups = [];
            groups.push({
                id: 'connectorLabels',
                fillalpha: '100',
                items: connectorLabelItems
            });
            groups.push({
                id: 'connectors',
                fillalpha: '100',
                items: connectorOptions
            });
            for (i = 0; i < length; i++) {
                if (!connectors[i]) {
                    continue;
                }
                fromMarkerConfig = connectors[i].config.fromMarker.config;
                toMarkerConfig = connectors[i].config.toMarker.config;
                x = fromMarkerConfig.options.x;
                y = fromMarkerConfig.options.y;
                toX = toMarkerConfig.options.x;
                toY = toMarkerConfig.options.y;
                connectors[i].config.x = x;
                connectors[i].config.y = y;
                connectors[i].config.tox = toX;
                connectors[i].config.toy = toY;
                connectorOptions.push(connectors[i].config);
                if (connectors[i].labelConfig && showConnectorLabels) {
                    connectors[i].labelConfig.x = ((Number(x) + Number(toX)) / 2).toString();
                    connectors[i].labelConfig.y = ((Number(y) + Number(toY)) / 2).toString();
                    connectors[i].labelConfig.fontsize = (chartConnOptions.fontSize /
                        (scalingParams.scaleFactor * chart.baseScaleFactor));
                    connectorLabelItems.push(connectors[i].labelConfig);
                }

            }
            annotations.addGroup(groups[0]);
            annotations.addGroup(groups[1]);
        },
        getShapeArgs: function () {
            var mark = this,
                config = mark.config,
                shapeObj = extend2({}, mark.shapeObj),
                // FMXT-388: work on a copy of the shapeObj so as to not alter the original shapeObj.
                radius;
            config.autoScale = 1;
            if (shapeObj) {
                if (shapeObj.type === 'polygon') {
                    if (shapeObj.sides < 3) {
                        shapeObj.type = 'circle';
                    }
                    else {
                        shapeObj.startangle = config.startAngle;
                    }
                }
                else if (shapeObj.type === 'arc') {
                    radius = (shapeObj.radius || config.markerRadius) * config.autoScale;
                    shapeObj.radius = radius;

                    shapeObj.innerradius = ((shapeObj.innerradius &&
                        (shapeObj.innerradius * config.autoScale)) || (radius * INNERRADIUSFACTOR));
                }

                return shapeObj;
            }
            else {
                return null;
            }
        },
        _getLabelOptions: function (labelPos, labelPadding, options, width, height) {
            var dataset = this,
                radius,
                x,
                y,
                alignment = labelPos && labelPos.toLowerCase();

            // validate alignments
            if (!dataset.getLabelAlignment[alignment]) {
                alignment = 'center';
            }

            x = Number(options.x),
            y = Number(options.y);

            if (width === UNDEFINED || height === UNDEFINED) {
                // not an image
                radius = options.radius || 0;
            }
            else {
                // image
                radius = /^(top|bottom)$/ig.test(alignment) && (height * 0.5) ||
                        /^(left|right)$/ig.test(alignment) && (width * 0.5) || 0;
            }

            radius = (Number(radius) + Number(labelPadding));
            return dataset.getLabelAlignment[alignment](x, y, radius);
        },
        getLabelAlignment: {
            top: function (x, y, radius) {
                return {
                    x: x.toString(),
                    y: (y - radius).toString(),
                    align: POSITION_CENTER,
                    valign: POSITION_TOP
                };
            },
            left: function (x, y, radius) {
                return {
                    x: (x - radius).toString(),
                    y: y.toString(),
                    align: POSITION_RIGHT,
                    valign: POSITION_MIDDLE
                };
            },
            right: function (x, y, radius) {
                return {
                    x: (x + radius).toString(),
                    y: y.toString(),
                    align: POSITION_LEFT,
                    valign: POSITION_MIDDLE
                };
            },
            bottom: function (x, y, radius) {
                return {
                    x: x.toString(),
                    y: (y + radius).toString(),
                    align: POSITION_CENTER,
                    valign: POSITION_BOTTOM
                };
            },
            center: function (x, y) {
                return {
                    x: x.toString(),
                    y: y.toString(),
                    align: POSITION_CENTER,
                    valign: POSITION_MIDDLE
                };
            }
        },
        getWrapWidth: {
            right: function (width, x) {
                return x;
            },
            left: function (width, x) {
                return (width - x);
            },
            center: function (width, x) {
                return (mathMin(x, width - x) * 2);
            }
        },

        getWrapHeight: {
            top: function (height, y) {
                return y;
            },
            middle: function (height, y) {
                return (mathMin(y, height - y) * 2);
            },
            bottom: function (height, y) {
                return (height - y);
            }
        },

        addMarkerItem: function (options) {
            var markers = this,
                item = options,
                markerObj,
                items = markers.components.markerObjs,
                shapeObjs = markers.components.shapeObjs,
                markerGroup = markers.components.markerGroup,
                markerLabelGroup = markers.components.markerLabelGroup,
                drawOptions,
                shapeId,
                id;

            if ((id = item.id.toLowerCase())) {

                if (items[id]) {
                    return;
                }

                // Data enabled markers not yet supported by this method.
                delete item.value;
                markers.imageLoadCount = 0;
                markerObj = markers._initializeMarkerItem(id, item, null);
                markerObj.dataset = markers;
                shapeId = markerObj.config.options.shapeid;

                if (shapeId) {
                    markerObj.shapeObj = shapeObjs[shapeId && shapeId.toLowerCase()];
                }

                items[id] = markerObj;
                drawOptions = markers._drawMarkerItem.call(markerObj);

                if (markerGroup && markerLabelGroup) {
                    markerObj.markerShape = drawOptions.markerShape &&
                        markerGroup.addItem(drawOptions.markerShape, true);
                    markerObj.markerLabel = drawOptions.markerLabel &&
                        markerLabelGroup.addItem(drawOptions.markerLabel, true);
                }

                markers._buildKdTree();
            }
        },

        updateMarkerItem: function (id, options) {
            var markers = this,
                chart = markers.chart,
                annotations = chart.components.mapAnnotations,
                markerObjs = markers.components.markerObjs,
                origOptions,
                marker = markerObjs[id],
                annotOptions;

            if (marker) {
                origOptions = marker.config.options;
                // Add the marker options passed to the original options to persist in case of multiple updates.
                extend2(origOptions, options);
                markers.imageLoadCount = 0;
                // Get the annotation options from marker options.
                annotOptions = markers._drawMarkerItem.call(marker).markerShape;

                markers._buildKdTree();

                // Update annotations
                annotations.update(id, annotOptions);
            }
        },
        _removeMarkerItem: function (id) {
            var markers = this,
                components = markers.components,
                markerObjs = components.markerObjs,
                markerObj = markerObjs[id],
                kdArrayMap = components.kdArrayMap,
                markerShape,
                markerLabel;

            if (markerObj) {
                markerShape = markerObj.markerShape;
                markerLabel = markerObj.markerLabel;
                markerShape && markerShape.destroy();
                markerLabel && markerLabel.destroy();
                delete kdArrayMap[id];
                markers._buildKdTree();
            }

            delete markerObjs[id];

        },
        getElement: function (point) {
            var datasetObj = this;
            if (datasetObj.components.kDTree) {
                // searches the neighbouring points using the kdtree instance.
                return datasetObj.components.kDTree.getNeighbour(point);
            }
        }
    }, 'Entities']);

}, [3, 2, 0, 'release']]);





}));
