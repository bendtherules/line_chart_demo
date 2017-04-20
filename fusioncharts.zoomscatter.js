
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

/**!
 * @license FusionCharts JavaScript Library - ZoomScatter Chart
 * Copyright FusionCharts Technologies LLP
 * License Information at <http://www.fusioncharts.com/license>
 *
 * @version 3.12.0
 */
/**
 * @private
 * @module fusioncharts.renderer.javascript.zoomscatter
 * @export fusioncharts.zoomscatter.js
 */
FusionCharts.register('module', ['private', 'modules.renderer.js-zoomscatter', function () {
    /*jslint newcap: false */
    var global = this,
        lib = global.hcLib,
        parseTooltext = lib.parseTooltext,
        // extend2 = lib.extend2,
        // getLinkAction = lib.getLinkAction,
        // NumberFormatter = lib.NumberFormatter,
        R = lib.Raphael,
        win = global.window,
        addEvent = lib.addEvent,
        removeEvent = lib.removeEvent,
        MouseEvent = win.MouseEvent,
        doc = win.document,
        //strings
        BLANKSTRING = lib.BLANKSTRING,
        // HASHSTRING = lib.HASHSTRING,
        // getSentenceCase = lib.getSentenceCase,
        // dropHash = lib.regex.dropHash,
        //add the tools thats are requared
        pluck = lib.pluck,
        // getValidValue = lib.getValidValue,
        pluckNumber = lib.pluckNumber,
        getFirstValue = lib.getFirstValue,
        // parseUnsafeString = lib.parseUnsafeString,
        // FC_CONFIG_STRING = lib.FC_CONFIG_STRING,
        // getDashStyle = lib.getDashStyle, // returns dashed style of a line series
        toRaphaelColor = lib.toRaphaelColor,
        // toPrecision = lib.toPrecision,
        hasSVG = lib.hasSVG,
        isIE = lib.isIE || lib.isIE11,
        getFirstColor = lib.getFirstColor,
        hasTouch = lib.hasTouch,
        /*pInt = function(s, mag) {
            return parseInt(s, mag || 10);
        },*/
        // The default value for stroke-dash attribute.
        // DASH_DEF = 'none',
        TRACKER_FILL = 'rgba(192,192,192,' + (isIE ? 0.002 : 0.000001) + ')', // invisible but clickable
        // M = 'M',
        math = Math,
        // mathSin = math.sin,
        // mathCos = math.cos,
        mathRound = math.round,
        mathMin = math.min,
        mathMax = math.max,
        mathAbs = math.abs,
        mathCos = math.cos,
        mathSin = math.sin,
        mathSqrt = math.sqrt,
        mathPow = math.pow,
        // mathCeil = math.ceil,
        mathFloor = math.floor,
        pi = Math.PI,
        pi2 = 2 * pi,
        getMouseCoordinate = lib.getMouseCoordinate,
        // getFirstColor = lib.getFirstColor,
        // setLineHeight = lib.setLineHeight,
        // pluckFontSize = lib.pluckFontSize, // To get the valid font size (filters negative values)
        // getDarkColor = lib.graphics.getDarkColor,
        // getLightColor = lib.graphics.getLightColor,
        // convertColor = lib.graphics.convertColor,
        POSITION_BOTTOM = lib.POSITION_BOTTOM,
        // POSITION_RIGHT = lib.POSITION_RIGHT,
        chartAPI = lib.chartAPI,
        // renderer = chartAPI,
        // ZEROSTRING = lib.ZEROSTRING,
        // ONESTRING = lib.ONESTRING,
        HUNDREDSTRING = lib.HUNDREDSTRING,
        // PXSTRING = lib.PXSTRING,
        // COMMASTRING = lib.COMMASTRING,
        creditLabel = false && !lib.CREDIT_REGEX.test(win.location.hostname),
        COLOR_WHITE = '#FFFFFF',
        COLOR_E3E3E3 = '#E3E3E3',
        COLOR_C2C2C2 = '#C2C2C2',
        COLOR_EFEFEF = '#EFEFEF',
        COLOR_E6E6E6 = '#E6E6E6',
        POINTER = 'pointer',
        //gradient colors used for the toogle button.
        // COLOR_ZOOM_TOOGLE = '0-#E6E6E6-#E6E6E6:49-#bfbfbf:49-#bfbfbf:51-#FFFFFF:51-#FFFFFF',
        // COLOR_PAN_TOOGLE = '0-#FFFFFF-#FFFFFF:49-#bfbfbf:49-#bfbfbf:51-#E6E6E6:51-#E6E6E6',
        //default cursor type.
        STR_DEF = 'default',
        //todo place as a local variable.
        // componentDispose = lib.componentDispose,
        /* CHeck if the mouseEvent was triggered within the canvas area and update its configurations wrt chart.
         * @param e {MouseEvent} - The original mouse event.
         * @param chart {Object} - The renderingAPI reference
         * @return The sanitized event adding the chartX, chartY property (pixel values wrt to chart specifically) and
         add an insideCanvas property to denote if the interaction was within the canvas area
        */
        isWithinCanvas = function (e, chart) {
            var mousePos = getMouseCoordinate(chart.linkedItems.container,e),
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

         // * Function to trigger a mouse event.
         // * @param eventName {String} - The name of the event to be triggered.
         // * @param domElement {HTML DOM element} - The element to be applied.
         // * @param mouseEventInit {MouseEvent} - Initial mouse event, whose replicate is needed to be fired.

        fireMouseEvent = function (eventName, domElement, mouseEventInit) {
            var event;
            if (!domElement || !eventName) {
                return;
            }

            if(!mouseEventInit){
                mouseEventInit = {};
            }
            if (mouseEventInit.originalEvent) {
                mouseEventInit = mouseEventInit.originalEvent;
            }
            // map touch event for touch devices
            if (mouseEventInit.touches) {
                mouseEventInit = mouseEventInit.touches[0];
            }

            if (domElement.dispatchEvent) {
                if (MouseEvent && !isIE) {
                    //for FireFox, chrome and opera. NOT confirmed in Safari
                    // Creates a MouseEvent object.
                    event = new MouseEvent(eventName, {
                        bubbles: !!mouseEventInit.bubbles,
                        cancelable: !!mouseEventInit.cancelable,
                        clientX: mouseEventInit.clientX || ( mouseEventInit.pageX && (mouseEventInit.pageX -
                            doc.body.scrollLeft - doc.documentElement.scrollLeft)) || 0,
                        clientY: mouseEventInit.clientY || ( mouseEventInit.pageY && (mouseEventInit.pageY -
                            doc.body.scrollTop - doc.documentElement.scrollTop)) || 0,
                        screenX: mouseEventInit.screenX || 0,
                        screenY: mouseEventInit.screenY || 0,
                        pageX: mouseEventInit.pageX || 0,
                        pageY: mouseEventInit.pageY || 0
                    });
                }
                else if (doc.createEvent) {
                    //for IE support.
                    event = doc.createEvent('HTMLEvents');
                    event.initEvent(eventName, !!mouseEventInit.bubbles, !!mouseEventInit.cancelable);
                }
                event.eventName = eventName;
                event && domElement.dispatchEvent(event);
            }
            else if(doc.createEventObject && domElement.fireEvent){
                event = doc.createEventObject();
                event.eventType = eventName;
                event.eventName = eventName;
                //trigger the event forcefully.
                domElement.fireEvent('on' + eventName, event);
            }
        },
        KdTree = lib.KdTree;

    chartAPI('zoomscatter', {
        standaloneInit: true,
        defaultDatasetType: 'zoomscatter',
        applicableDSList: {
            'zoomscatter': true
        },
        highlightEnabled: false,
        friendlyName: 'ZoomScatter Chart',
        isXY: true,
        defaultZeroPlaneHighlighted: false,
        creditLabel: creditLabel,
        configure: function () {
            var chartAttr,
                iapi = this,
                conf = iapi.config;
            chartAPI.scatter.configure.apply(iapi,arguments);
            chartAttr = iapi.jsonData.chart;
            conf.stepZoom = 1 - pluckNumber(chartAttr.stepzoom, 25) / 100;

            conf.showToolBarButtonToolText = pluckNumber(chartAttr.showtoolbarbuttontooltext, 1);
            conf.btnResetChartToolText = pluck(chartAttr.btnresetcharttooltext, 'Reset Chart');
            conf.btnZoomOutToolText = pluck(chartAttr.btnzoomouttooltext, 'Zoom out to previous level');
            conf.btnZoomInToolText = pluck(chartAttr.btnzoomintooltext, '<strong>Zoom in</strong><br/>Or double-' +
                'click on plot to zoom-in');
            conf.btnSelectZoomToolText = pluck(chartAttr.btnselectzoomtooltext,
                    '<strong>Select a region to zoom-in</strong><br/>Click to enable pan mode.');
            conf.btnPanToolText = pluck(chartAttr.btnpantooltext,
                    '<strong>Drag to move across chart</strong><br/>Click to enable select-zoom mode.');
        },
        _setAxisLimits : function () {
            var iapi = this,
                components = iapi.components,
                dataObj = iapi.jsonData,
                chartAttr = dataObj.chart,
                xAxis = components.xAxis,
                xAxisLabelMode = pluck (chartAttr.xaxislabelmode, 'categories'),
                categoriesArr = dataObj.categories && dataObj.categories[0],
                categories = (categoriesArr && categoriesArr.category || []).slice(),
                axisRange,
                increment,
                i,
                xMin = Infinity,
                xMax = -Infinity,
                catX;
            if (xAxisLabelMode === 'auto' || categories.length === 0) {
                chartAPI.mscartesian._setAxisLimits.call(iapi);
                axisRange = xAxis[0].getLimit();
                increment = axisRange.tickInterval;
                xAxis[0].setAxisConfig({
                    hasCategory : 0
                });
                xAxis[0].resetCategoryAxisComponents();
                // iterate through the categories to find the max and min of them.
                for (i = 0; i < categories.length; i += 1) {
                    if (catX = categories[i].x) {
                        if (catX < xMin) {
                            xMin = catX;
                        }
                        if (catX > xMax) {
                            xMax = catX;
                        }
                    }
                }
                // Update the axis Limits if the categories extremes exceeds them.
                if (xMax > axisRange.max || xMin < axisRange.min) {
                    xMax = mathMax(xMax, axisRange.max);
                    xMin = mathMin(xMin, axisRange.min);
                    xAxis[0].setDataLimit(xMax, xMin);
                }
            }
            else {
                xAxis[0].resetNumericAxisComponents();
                chartAPI.scatterBase._setAxisLimits.call(iapi);
            }
        },

        _createAxes: function () {
            var iapi = this,
                components = iapi.components;

            chartAPI.scatter._createAxes.call(iapi, arguments);
            components.yAxis[0].setAxisConfig ( {
                animateAxis : false
            });
            components.xAxis[0].setAxisConfig ( {
                animateAxis : false
            });
        },

        _spaceManager: function () {
            // todo marge _allocateSpace and _spacemanager
            var availableWidth,
                availableHeight,
                iapi = this,
                config = iapi.config,
                components = iapi.components,
                xAxis = components.xAxis && components.xAxis[0],
                yAxisArr = (components.yAxis && components.yAxis) || [],
                yAxis,
                len,
                legend = components.legend,
                legendPosition = legend.config.legendPos,
                xDepth = config.xDepth,
                yDepth = config.yDepth,
                canvasBgDepth = config.canvasBgDepth,
                allottedSpace,
                canvasBaseDepth = config.canvasBaseDepth,
                canvasBasePadding = config.canvasBasePadding,
                canvasBorderWidth = components.canvas.config.canvasBorderWidth,
                showRTValue = config.realTimeConfig && config.realTimeConfig.showRTValue,
                chartBorderWidth = config.borderWidth,
                canvasMarginTop = config.canvasMarginTop,
                canvasMarginBottom = config.canvasMarginBottom,
                canvasMarginLeft = config.canvasMarginLeft,
                canvasMarginRight = config.canvasMarginRight,
                minCanvasHeight = config.minCanvasHeight,
                minCanvasWidth = config.minCanvasWidth,
                minChartWidth = config.minChartWidth,
                minChartHeight = config.minChartHeight,
                height = config.height,
                width = config.width,
                diff,
                initConfig = config._initConfig || (config._initConfig = {}),
                heightAdjust = false,
                widthAdjust = false,
                top,
                bottom,
                left,
                right,
                i,
                currentCanvasHeight,
                origCanvasTopMargin = config.origCanvasTopMargin,
                origCanvasBottomMargin = config.origCanvasBottomMargin,
                chartBorderHorizontal,
                chartBorderVertical,
                canvasBorderHorizontal,
                canvasBorderVertical,
                yAxisSpaceAllocation = [],
                xAxisSpaceAllocation,
                spaceTakenByAxis,
                sum;
            initConfig.canvasLeft = config.canvasLeft;
            initConfig.canvasWidth = config.canvasWidth;
            initConfig.canvasHeight = config.canvasHeight;
            initConfig.canvasTop = config.canvasTop;
            initConfig.availableHeight = config.availableHeight;
            initConfig.availableWidth = config.availableWidth;

            if ((config.canvasWidth - 2 * chartBorderWidth) < minChartWidth ) {
                chartBorderVertical = (config.canvasWidth -  minChartWidth) / 2;
            }

            if ((config.canvasHeight - 2 * chartBorderWidth) < minChartHeight ) {
                chartBorderHorizontal = (config.canvasHeight -  minChartHeight) / 2;
            }

            iapi._allocateSpace ( {
                top : chartBorderHorizontal || chartBorderWidth,
                bottom : chartBorderHorizontal || chartBorderWidth,
                left : chartBorderVertical || chartBorderWidth,
                right : chartBorderVertical || chartBorderWidth
            });

            //temp code.. for zoomscatter implementation. Once removed. Merge with scatter space manager. Delete this.
            config.origCanvasWidth = config.canvasWidth;
            config.origCanvasLeft = config.canvasLeft;
            config.canvasRight = config.canvasLeft + config.canvasWidth;
            config.origCanvasRight = config.canvasRight;
            //temp code ends.

            for (i = 0, len = yAxisArr.length; i < len; i++) {
                yAxis = yAxisArr[i];
                //****** Manage space
                availableWidth = config.availableWidth * 0.7;
                spaceTakenByAxis = yAxis && yAxis.placeAxis(availableWidth) || {};

                yAxisSpaceAllocation.push({
                    axisIndex: i,
                    spaceTaken: spaceTakenByAxis
                });

                yAxis && iapi._allocateSpace (spaceTakenByAxis);
            }

            availableHeight = config.canvasHeight * 0.7;
            iapi._manageActionBarSpace && iapi._allocateSpace(iapi._manageActionBarSpace(availableHeight));

            //No space is allocated for legend drawing in single series charts
            iapi._manageLegendSpace(allottedSpace);

            availableHeight = (legendPosition === POSITION_BOTTOM) ? config.availableHeight * 0.6 :
                config.availableWidth * 0.6;

            //space management for 3d canvas
            if (yDepth) {
                iapi._allocateSpace ( {
                    bottom : yDepth
                });
                config.shift = xDepth + canvasBasePadding + canvasBaseDepth;
            }
            if (canvasBgDepth) {
                iapi._allocateSpace ( {
                    right: canvasBgDepth
                });
            }

            if ((config.canvasWidth - 2 * canvasBorderWidth) < minCanvasWidth ) {
                canvasBorderVertical = (config.canvasWidth -  minCanvasWidth) / 2;
            }

            iapi._allocateSpace ( {
                left : canvasBorderVertical || canvasBorderWidth,
                right : canvasBorderVertical || canvasBorderWidth
            });

            // Check for minimun canvas width for applying canvas left and right margin.
            if (minCanvasWidth > width - canvasMarginLeft - canvasMarginRight) {
                widthAdjust = true;
                diff = config.canvasWidth - minCanvasWidth;
                sum = canvasMarginLeft + canvasMarginRight;
                canvasMarginLeft = config.canvasMarginLeft = diff * canvasMarginLeft / sum;
                canvasMarginRight = config.canvasMarginRight = diff * canvasMarginRight / sum;
            }

            // Calculating the left and right canvas margin.
            left = canvasMarginLeft > config.canvasLeft ? (canvasMarginLeft - config.canvasLeft) : 0;
            right = canvasMarginRight > (width - config.canvasRight) ? (canvasMarginRight + config.canvasRight - width)
                : 0;

            iapi._allocateSpace ( {
                left : left,
                right : right
            });

            availableHeight = (legendPosition === POSITION_BOTTOM) ? config.canvasHeight * 0.6 :
                config.canvasWidth *0.6;

            // a space manager that manages the space for the tools as well as the captions.
            iapi._manageChartMenuBar(availableHeight);

            availableHeight = config.availableHeight * 0.2;

            iapi._allocateSpace(iapi._getSumValueSpace(availableHeight));

            availableHeight = config.availableHeight * 0.3;

            // temp code starts..... for zoomscatter implementation.
            config.origCanvasHeight = config.canvasHeight;
            config.canvasBottom = config.canvasTop + config.canvasHeight;
            config.origCanvasBottom = config.canvasBottom;
            config.origCanvasTop = config.canvasTop;
            //temp code ends...

            if (config.realtimeEnabled) {
                if (showRTValue) {
                    iapi._allocateSpace(iapi._realTimeValuePositioning (availableHeight));
                }
                else {
                    iapi._hideRealTimeValue();
                }
            }

            availableHeight = config.availableHeight * 0.6;
            config.xAxisSpaceAllocation = xAxisSpaceAllocation = xAxis && xAxis.placeAxis (availableHeight);
            xAxis && iapi._allocateSpace (xAxisSpaceAllocation);

            iapi._getDSspace && iapi._allocateSpace (iapi._getDSspace (config.canvasWidth * 0.4));

            // alocate the space for scroll.
            availableHeight = config.availableHeight * 0.3;
            iapi._manageScrollerPosition && iapi._manageScrollerPosition(availableHeight);


            if ((config.canvasHeight - 2 * canvasBorderWidth) < minCanvasHeight ) {
                canvasBorderHorizontal = (config.canvasHeight -  minCanvasHeight) / 2;
            }

            iapi._allocateSpace ( {
                top : canvasBorderHorizontal || canvasBorderWidth,
                bottom : canvasBorderHorizontal || canvasBorderWidth
            });

            iapi._allocateSpace({
                bottom: canvasBaseDepth
            });

            // Check for minimum canvas height for applying top and bottom margin.
            if (minCanvasHeight > height - canvasMarginTop - canvasMarginBottom) {
                heightAdjust = true;
                diff = config.canvasHeight - minCanvasHeight;
                sum = canvasMarginTop + canvasMarginBottom;
                canvasMarginTop = config.canvasMarginTop = diff * canvasMarginTop / sum;
                canvasMarginBottom = config.canvasMarginBottom = diff * canvasMarginBottom / sum;
            }

            // Allocate space for canvas margin only if the margin is less than the margin entered by the user.
            top = canvasMarginTop > config.canvasTop ? (canvasMarginTop - config.canvasTop) : 0;
            bottom = canvasMarginBottom > (height - config.canvasBottom) ? (canvasMarginBottom + config.canvasBottom -
                height) : 0;

            iapi._allocateSpace ( {
                top : top,
                bottom : bottom
            });

            // Forcing canvas height to its minimum
            if (heightAdjust) {
                sum = origCanvasTopMargin + origCanvasBottomMargin;
                currentCanvasHeight = config.canvasHeight;
                if (currentCanvasHeight > minCanvasHeight) {
                    diff = currentCanvasHeight - minCanvasHeight;
                    top = diff * origCanvasTopMargin / sum;
                    bottom = diff * origCanvasBottomMargin / sum;
                }
                iapi._allocateSpace ( {
                    top : top,
                    bottom : bottom
                });
            }

            config.actualCanvasMarginTop = top;
            config.actualCanvasMarginLeft = left;
        },
        _createToolBox: function () {
            var toolBox,
                toolBoxGraphics,
                toolBoxAPI,
                group,
                SymbolStore,
                Symbol,
                zoomInButton,
                zoomOutButton,
                resetButton,
                toggleZoomInButton,
                togglePanButton,
                iapi = this,
                config = iapi.config,
                components = iapi.components,
                chartMenuBar = components.chartMenuBar,
                actionBar = components.actionBar,
                tooltip = config.showToolBarButtonToolText,
                stepZoom = config.stepZoom;
            /* Do not reconfigure the toolbox if its already drawn. This flag is set falsy on each time configurations
            are updated. */
            if (chartMenuBar && chartMenuBar.drawn || actionBar && actionBar.drawn) {
                return;
            }
            chartAPI.mscartesian._createToolBox.call(iapi);
            toolBox = components.tb;
            toolBoxGraphics = toolBox.graphics || (toolBox.graphics = {});
            toolBoxAPI = toolBox.getAPIInstances(toolBox.ALIGNMENT_HORIZONTAL);
            Symbol = toolBoxAPI.Symbol;
            SymbolStore = toolBoxAPI.SymbolStore;
            group = (components.chartMenuBar || components.actionBar).componentGroups[0],


            // Add the symbols in the chartMenuBar
            zoomInButton = toolBoxGraphics.zoomInButton = new Symbol('zoomInIcon', undefined, toolBox.idCount++,
                toolBox.pId)
                .attachEventHandlers({
                    'click' : function () {
                        iapi.zoom(stepZoom);
                    },
                    'tooltext': tooltip && config.btnZoomInToolText || BLANKSTRING
                });
            zoomOutButton = toolBoxGraphics.zoomOutButton = new Symbol('zoomOutIcon', undefined, toolBox.idCount++,
                toolBox.pId)
                .attachEventHandlers({
                    'click' : function () {
                        var viewPortHistory = config.viewPortHistory,
                        previousViewPortHist;
                        //zoom out is possible only if it is not the initial unzoomed configurations.
                        if (viewPortHistory.length > 1) {
                            previousViewPortHist = viewPortHistory.slice(-2,-1)[0];
                            iapi.updateVisual(previousViewPortHist.x, previousViewPortHist.y,
                                previousViewPortHist.scaleX, previousViewPortHist.scaleY);
                        }
                    },
                    'tooltext': tooltip && config.btnZoomOutToolText || BLANKSTRING
                });
            resetButton = toolBoxGraphics.resetButton = new Symbol('resetIcon', undefined, toolBox.idCount++,
                toolBox.pId)
                .attachEventHandlers({
                    'click' : function () {
                        var viewPortConfig = config.viewPortConfig,
                            iapiGraphics = iapi.graphics;
                            /*xAxis = components.xAxis[0],
                            yAxis = components.yAxis[0];*/
                        if (config.viewPortHistory.length > 1) {
                            viewPortConfig.isReset = true;
                            iapi.zoomSelection(0, 0, config.canvasWidth, config.canvasHeight);
                            //deletes all the configurations except the initial one.
                            config.viewPortHistory.splice(1);
                            iapiGraphics.trackerGroup.attr({
                                cursor: 'default'
                            });
                            iapi.updateButtonVisual();
                            //reset the selection box after the chart is reset.
                            iapi.updateSelectionBox(0,0,0,0);
                        }
                        global.raiseEvent('zoomReset', {}, iapi.chartInstance, [iapi.chartInstance.id]);
                    },
                    'tooltext': tooltip && config.btnResetChartToolText || BLANKSTRING
                });
            toggleZoomInButton = toolBoxGraphics.toggleZoomInButton = new Symbol('zoomModeIcon', undefined,
                    toolBox.idCount++, toolBox.pId).attachEventHandlers({
                'click' : function () {
                    iapi.toogleDragPan(true);
                },
                'tooltext': tooltip && config.btnSelectZoomToolText || BLANKSTRING
            });
            togglePanButton = toolBoxGraphics.togglePanButton = new Symbol('panModeIcon', undefined,
                    toolBox.idCount++, toolBox.pId).attachEventHandlers({
                'click' : function () {
                    iapi.toogleDragPan(true);
                },
                'tooltext': tooltip && config.btnPanToolText || BLANKSTRING
            });
            group.addSymbol(togglePanButton, true);
            group.addSymbol(toggleZoomInButton, true);
            group.addSymbol(resetButton, true);
            group.addSymbol(zoomOutButton, true);
            group.addSymbol(zoomInButton, true);
        },

        _createLayers: function () {
            var iapi = this,
                iapiGraphics = iapi.graphics,
                paper = iapi.components.paper;
            chartAPI.scatter._createLayers.call(iapi);
            //create the additional layers.
            //create the container element
            !iapiGraphics.imageContainer && (iapiGraphics.imageContainer =
                paper.group('dataset-orphan', iapiGraphics.datasetGroup));
            iapi.__preDraw();
        },
        /*
         *calculate the 2-d distance between two given points(in pixels)
         * @param point1 {Object} - The first point to compute the 2-d distance
         * @param point2 {Object} - The second point to compute the 2-d distance
         * @return {NUmber} - 2-d distance between the points.
        */
        _dist: function (point1, point2) {
            var chart = this,
                chartComponents = chart.components,
                dx,
                dy,
                xAxis = chartComponents.xAxis[0],
                yAxis = chartComponents.yAxis[0];

            if (point1 && point2) {
                dx = (point1.x - point2.x) * xAxis.getPVR();
                dy = (point1.y - point2.y) * yAxis.getPVR();
                //point to point distance.
                return Math.sqrt(Math.pow(dx,2)+Math.pow(dy,2));
            }
        },
        __preDraw: function () {
            var iapi = this,
                iapiGraphics = iapi.graphics,
                imageContainer = iapiGraphics.imageContainer,
                iapiConfig = iapi.config,
                canvasLeft = iapiConfig.canvasLeft,
                canvasTop = iapiConfig.canvasTop,
                canvasWidth = iapiConfig.canvasWidth,
                canvasHeight = iapiConfig.canvasHeight,
                chartDef = iapi.jsonData.chart,
                linkedItems = iapi.linkedItems,
                listeners = linkedItems.eventListeners || (linkedItems.eventListeners = []),
                containerElem = iapi.linkedItems.container,
                paper = iapi.components.paper;
            iapiConfig.updateAnimDuration = 500; // default animation durations.
            //the origin of the container element should coincide with the origin(top-left) of the canvas area.
            imageContainer.transform('t' + canvasLeft + ',' + canvasTop);
            //apply clipping to the container element.
            imageContainer.attr({
                'clip-rect': canvasLeft + ',' + canvasTop + ',' + canvasWidth + ',' + canvasHeight
            });
            iapiConfig.status = 'zoom';
            //set the maximum scaleX and scaleY.
            iapiConfig.maxZoomLimit = pluckNumber(chartDef.maxzoomlimit, 1000);

            //stores the different visual configurations for a historical reference.
            iapiConfig.viewPortHistory = [{
                scaleX: 1,
                scaleY: 1,
                x: 0,
                y: 0
            }];
            /*create a hot element of same size as that of the canvas area which is used to draw the tracker element
            for trendzone in axis module and also apply the cursor properties.*/
            !iapiGraphics.trackerElem && (iapiGraphics.trackerElem = paper.rect(canvasLeft, canvasTop, canvasWidth,
                canvasHeight, 0, iapiGraphics.trackerGroup).attr({
                'fill': TRACKER_FILL,
                'stroke': TRACKER_FILL
            }));

            //remove any existing events if any
            removeEvent(containerElem, hasTouch ? 'touchstart' : 'mousemove', iapi.searchMouseMove);
            //adds to event stack.
            listeners.push(addEvent(containerElem, 'touchstart mousemove', iapi.searchMouseMove, iapi));

            //callbacks for the image is set
            iapi.zoomPanManager(imageContainer);
        },
        /*
         * Searches for the nearest neighbouring point from the point being hovered(/ moved).
         * @param e {MouseEvent} - Mouse MOve event
        */
        searchMouseMove: function (e) {
            var mousePos,
                top,
                left,
                point,
                chart = e.data,
                chartConfig = chart.config,
                viewPortConfig = chartConfig.viewPortConfig,
                chartComponents = chart.components,
                xAxis = chartComponents.xAxis[0],
                yAxis = chartComponents.yAxis[0],
                trendlines = chartComponents.trendlines,
                vTrendlines = chartComponents.vTrendlines,
                hoverPoint,
                hoveredTrendLine,
                hoveredVtrendLine;

            if (!chart.linkedItems.container || chartConfig.isDragging) {
                return ;
            }

            //check if the event is fired within the canvas region.
            if ((mousePos = isWithinCanvas(e, chart)) && mousePos.insideCanvas) {
                //Convert the event coordinates into chart coordinates
                top = chartConfig.canvasTop;
                left = xAxis.getAxisConfig('axisDimention').x || chartConfig.canvasLeft;
                //Get the coordinates of the point wrt inital unzoomed canvas origin(in pixels)
                //convert to x, y-values.

                point = viewPortConfig.lastMouseCoordinate = {
                    'x': Number(xAxis.getValue(mousePos.chartX-left)),
                    'y': Number(yAxis.getValue(mousePos.chartY-top))
                };
                // clear previous search timer
                //clearTimeout(viewPortConfig.neighbourSearchTimer);
                //store the evnt object. This will be used to generate event on same coordinate
                chartConfig.lastMouseEvent = e;

                // for performance do the search in a seperate thread
                viewPortConfig.neighbourSearchTimer = (function () {
                    // this checking prevent the state where the timeout was called when the chart was not in idDragging
                    // state. But when the when the timer is getting executed, the chart is in isDragging state
                    if (!chartConfig.isDragging){
                        //search the best neighbouring point of the mouse moved point.
                        hoverPoint = chart._bestNeighbour(viewPortConfig.lastMouseCoordinate);

                        hoveredTrendLine = chart._getHoveredTrendLine(point, trendlines);
                        hoveredVtrendLine = chart._getHoveredTrendLine(point, vTrendlines);

                        if (hoveredTrendLine && hoveredTrendLine.showontop) {
                            chart._drawTooltip(e.originalEvent, hoveredTrendLine.tooltext);
                        } else if (!hoveredTrendLine && hoveredVtrendLine && !hoverPoint){
                            chart._drawTooltip(e.originalEvent, hoveredVtrendLine.tooltext);
                        } else if (hoveredTrendLine && !hoveredVtrendLine && !hoverPoint){
                            chart._drawTooltip(e.originalEvent, hoveredTrendLine.tooltext);
                        }else if (hoveredTrendLine && hoveredVtrendLine && !hoverPoint){
                            chart._drawTooltip(e.originalEvent, hoveredVtrendLine.tooltext);
                        }
                    }
                })();


            }
            else {
                //hide the tracker element.
                //lib.toolTip.hide();
                chart.highlightPoint(false);
            }
        },
        /*
         * Creates a rectangular selection Box.
         * This gives a visual clue of what portion is being selected using the selectZoom option.
         * All the pixel informations are provided wrt to canvas area origin(top-left).
         * Store the selection box dimensions as a reference to the viewPortConfig Object.
         * @param x1 {Number} - x-coordinate of the left top point of the selection rectangle to be created
         * @param y1 {Number} - y-coordinate of the left top point of the selection rectangle to be created
         * @param x2 {Number} - x-coordinate of the right bottom point of the selection rectangle to be created
         * @param y2 {Number} - y-coordinate of the right bottom point of the selection rectangle to be created
        */
        updateSelectionBox: function (x1,y1,x2,y2) {
            var chart = this,
                chartComponents = chart.components,
                chartConfig = chart.config,
                chartGraphics = chart.graphics,
                paper = chartComponents.paper,
                viewPortConfig = chartConfig.viewPortConfig,
                cursor = chartConfig.cursor,
                selectionBox = chartGraphics.selectionBox,
                canvasRight = chartConfig.canvasRight,
                canvasLeft = chartConfig.canvasLeft,
                canvasTop = chartConfig.canvasTop,
                canvasBottom = chartConfig.canvasBottom,
                smallerX = (x1 < x2) ? x1: x2,
                smallerY = (y1 < y2) ? y1 : y2,
                largerX = (x1 > x2) ? x1 : x2,
                largerY = (y1 > y2) ? y1 : y2,

                /*Width and Height are temporary used in determining the cursor mode and updated later*/
                width = x2-x1,
                height = y1-y2;

            //change the cursor modes according to the width and height
            if (cursor) {
                if (width > 0 && height > 0) {
                    cursor = 'ne-resize';
                }
                else if (width < 0 && height > 0) {
                    cursor = 'nw-resize';
                }
                else if (width < 0 && height < 0){
                    cursor = 'sw-resize';
                }
                else if (width > 0 && height < 0) {
                    cursor = 'se-resize';
                }
                //reset the cursor to default once the selection box is removed(atleast visually)
                //i.e. width and height = 0
                else {
                    cursor = STR_DEF; //default cursor.
                }
            }
            else{
                cursor = STR_DEF;
            }
            //dimension for the selectionBox cannot be exceeded than the canvas area dimensions.
            largerX = (largerX > canvasRight) ? canvasRight : ((largerX < canvasLeft) ? canvasLeft : largerX);
            largerY = (largerY > canvasBottom) ? canvasBottom : ((largerY < canvasTop) ? canvasTop : largerY);
            smallerX = (smallerX < canvasLeft) ? canvasLeft : ((smallerX > canvasRight) ? canvasRight : smallerX);
            smallerY = (smallerY < canvasTop) ? canvasTop : ((smallerY > canvasBottom) ? canvasBottom : smallerY);

            width = (x1 === x2 && y1 === y2) ? 0 : (largerX - smallerX);
            height = (x1 === x2 && y1 === y2) ? 0 : (largerY - smallerY);

            if (selectionBox){
                //update the dimensions and posiitons of the selection Box.
                selectionBox.attr({
                    x: smallerX,
                    y: smallerY,
                    width: width,
                    height: height,
                    cursor: cursor
                });
                chartGraphics.trackerGroup.attr({ //update the cursor shape.
                    cursor: cursor
                });
            }
            //Create the selection Box.
            else{
                //shouldnot be hardcoded.
                selectionBox = chartGraphics.selectionBox =  paper.rect(smallerX,smallerY,width,height).attr({
                    'stroke-width': 1,
                    'stroke': 'red',
                    'fill': '#00FF00',
                    'opacity': 0.2,
                    'cursor': cursor
                });
                chartGraphics.trackerGroup.attr({ //update the cursor shape.
                    cursor: cursor
                });
            }

            chartConfig.cursor = cursor;
            //store the selection Box dimensions for future reference.
            if (!viewPortConfig.selectionDimensions) {
                viewPortConfig.selectionDimensions = {
                    startX: 0,
                    endX: 0,
                    startY: 0,
                    endY: 0
                };
            }
            //update the dimensions.
            viewPortConfig.selectionDimensions.startX = x1;
            viewPortConfig.selectionDimensions.endX = y1;
            viewPortConfig.selectionDimensions.startY = x2;
            viewPortConfig.selectionDimensions.endY = y2;
        },
        /*
         * @param point {Object} - Pixel values in chartX,chartY at any scale of viewPortConfigurations.
         * @Retrun {Object} - Axes values corresponding to it.
        */
        getValue: function (point) {
            var chart = this,
                chartConfig = chart.config,
                chartComponents = chart.components,
                viewPortConfig = chartConfig.viewPortConfig,
                //the pixel wrt original canvas size
                origpixel = chart.getOriginalPositions(point.x,point.y,point.x,point.y),
                origX = origpixel[0],
                origY = origpixel[1],
                xAxis = chartComponents.xAxis[0],
                yAxis = chartComponents.yAxis[0],
                xaxisRange = xAxis.config.axisRange,
                yaxisRange = yAxis.config.axisRange,
                minX = xaxisRange.min,
                maxX = xaxisRange.max,
                maxY = yaxisRange.max,
                minY = yaxisRange.min,
                //calcualte the Pixel to Value Ratios.
                xPVR = chartConfig.canvasWidth * viewPortConfig.scaleX / (maxX - minX),
                yPVR = chartConfig.canvasHeight * viewPortConfig.scaleY / (maxY - minY);

            return {
                x: minX + ((origX - chartConfig.canvasLeft) / xPVR),
                y: maxY - ((origY - chartConfig.canvasTop) / yPVR)
            };
        },
        /*
         * Get a rectangular configuration out of the multi point events.
         * @param startEventPoint {Object} - Contains the diagonal points of the startTouch Points in case of multiTouch
         * @param moveEventPoint {Object} - Contains the diagonal points of the touchMove Points in case of multiTouch.
         These diagonal points creates an extended version of that created by startEventPoint
         * @param initialViewPort {Object} - The initial viewPort configurations while the startEvent was being fired.
         * @return {Object} - A rectangular configuration which needs to be zoomed.
        */
        _getTouchViewPort: function (startEventPoint, moveEventPoint, initialViewPort) {
            var maxX,
                maxY,

                chart = this,
                chartConfig = chart.config,
                left = chartConfig.canvasLeft,
                top = chartConfig.canvasTop,
                width = chartConfig.canvasWidth,
                height = chartConfig.canvasHeight,

                //initial rectangle
                xInitial = mathMin(startEventPoint[0].chartX , startEventPoint[1].chartX) - left,
                yInitial = mathMin(startEventPoint[0].chartY , startEventPoint[1].chartY) - top,
                wInitial = Math.abs(startEventPoint[1].chartX - startEventPoint[0].chartX),
                hInitial = Math.abs(startEventPoint[1].chartY - startEventPoint[0].chartY),

                //final Rectangle
                xFinal = mathMin(moveEventPoint[0].chartX, moveEventPoint[1].chartX) - left,
                yFinal = mathMin(moveEventPoint[0].chartY , moveEventPoint[1].chartY) - top,
                wFinal = Math.abs(moveEventPoint[1].chartX - moveEventPoint[0].chartX),
                hFinal = Math.abs(moveEventPoint[1].chartY - moveEventPoint[0].chartY),
                //get the new scale factors
                scaleNewX = initialViewPort.scaleX * (wFinal / wInitial),
                scaleNewY = initialViewPort.scaleY * (hFinal / hInitial),

                xNew = (initialViewPort.x + (xInitial / initialViewPort.scaleX)) - (xFinal / scaleNewX),
                yNew = (initialViewPort.y + (yInitial / initialViewPort.scaleY)) - (yFinal / scaleNewY);

            //restrictions for origin and scale configurations.
            xNew = xNew < 0 ? 0 : xNew;

            yNew = yNew < 0 ? 0 : yNew;
            scaleNewY = scaleNewY < 1 ? 1 : scaleNewY;
            scaleNewX = scaleNewX < 1 ? 1 : scaleNewX;

            maxX = width - (width / scaleNewX);
            maxY = height - (height / scaleNewY);

            xNew = xNew > maxX ? maxX : xNew;
            yNew = yNew > maxY ? maxY : yNew;
            // the rectangular configurations build on the two recieved rectangles.
            return {
                x: xNew,
                y: yNew,
                scaleX: scaleNewX,
                scaleY: scaleNewY
            };
        },
        /*
         * At any level of zoom and in a state of shifted origin, this function converts and return the pixels wrt the
         original unzoomed configurations for the rectangle provided.
         * Original configurations are useful for all the zoom and pan calculations of the pixels.
         * @param x1 {Number} - x coordinate of the left top point of the rectangle.
         * @param y1 {Number} - y coordinate of the right bottom point of the rectangle.
         * @param x2 {Number} - x coordinate of the left top point of the rectangle.
         * @param y2 {Number} - y coordinate of the right bottom point of the rectangle.
         * @return {Array} - The coordinates wrt original unzoomed conditions.
        */
        getOriginalPositions: function (x1,y1,x2,y2) {
            var newW,
                newH,
                newX,
                newY,
                chart = this,
                chartConfig = chart.config,
                viewPortConfig = chartConfig.viewPortConfig,
                oldScaleX = viewPortConfig.scaleX,
                oldScaleY = viewPortConfig.scaleY,
                //coodinates of the visual canvas origin wrt to original canvas.
                oldX = viewPortConfig.x,
                oldY = viewPortConfig.y,

                xMin = mathMin(x1, x2),
                xMax = mathMax(x1, x2),
                yMin = mathMin(y1, y2),
                yMax = mathMax(y1, y2);

            //Right Bottom limit boundary
            xMax = xMax > chartConfig.canvasWidth ? chartConfig.canvasWidth : xMax;
            yMax = yMax > chartConfig.canvasHeight ? chartConfig.canvasHeight : yMax;
            //Left Top Limit Boundary
            xMin = xMin < 0 ? 0 : xMin;
            yMin = yMin < 0 ? 0 : yMin;
            // update the dimensions wrt to initial viewPort configurations.
            newW = (xMax - xMin ) / oldScaleX;
            newH = (yMax - yMin ) / oldScaleY;
            newX = oldX + (xMin / oldScaleX);
            newY = oldY + (yMin / oldScaleY);
            //converts to the coordinates wrt original image
            return [newX, newY, newW, newH];
        },
        /*
         * Impose restrictions and initiate the zooming effect.
         * This is useful when the rectangular area points are provided and needed to zoom that area.
         * @param x {Number} - x-coordinate of the top left origin of the rectangular area to be zoomed.
         * @param y {Number} - y-coordinate of the top left origin of the rectangular area to be zoomed.
         * @param w {Number} - width of the rectangular area to be zoomed.
         * @param h {Number} - height of the rectangular area to be zoomed.
        */
        zoomSelection: function (x, y, w, h) {
            var chart = this,
                chartConfig = chart.config,
                scaleX,
                scaleY,
                newWidth,
                newHeight,
                maxX,
                maxY,
                newOriginX,
                newOriginY;


            // if the width or height is 0 return it
            if (!w || !h) {
                return;
            }
            //scale factors cannnot be negatives.
            scaleX = Math.abs(chartConfig.canvasWidth / w);
            scaleY = Math.abs(chartConfig.canvasHeight / h);
            //total dimensions it would look alike when zoomed with these scale factors
            newWidth = chartConfig.canvasWidth * scaleX;
            newHeight = chartConfig.canvasHeight * scaleY;
            //the amount to be shifted so that the zoom portion falls in the visible area.
            newOriginX = x * scaleX;
            newOriginY = y * scaleY;
            //impose restrictions on the boundaries.
            maxX = (newWidth - chartConfig.canvasWidth);
            maxY = (newHeight - chartConfig.canvasHeight);

            //left top restricition
            newOriginX = (newOriginX < 0) ? 0 : newOriginX;
            newOriginY = (newOriginY < 0) ? 0 : newOriginY;

            //right bottom restriction
            newOriginX = (newOriginX > maxX) ? maxX : newOriginX;
            newOriginY = (newOriginY > maxY) ? maxY : newOriginY;
            //update the final visual(drawing) part.
            chart.updateVisual(x, y, scaleX, scaleY);
        },

        //Toogle the status from 'zoom' and 'pan' mode.
        toogleDragPan: function (isToogle) {
            var chart = this,
                chartConfig = chart.config,
                status = chartConfig.status;
            if (isToogle) {
                chartConfig.status = (status === 'zoom') ? 'pan': 'zoom';
                global.raiseEvent('zoomModeChanged', {
                    panModeActive: chartConfig.status
                }, chart.chartInstance, [chart.chartInstance.id]);
            }
            //visual update
            chart.updateButtonVisual();
        },
        /*
         * Manages and updates all the datasets' drawing.
         * Draws the quadrant if required.
         * @param pixelatedDraw {Boolean} - Flag to zoom in a pixelerated manner while the pinch zoom interaction is
         going on.
        */
        updateManager: function (pixelatedDraw) {
            var i,
                chart = this,
                chartComponents = chart.components,
                dataSets = chartComponents.dataset,
                len = dataSets.length;

            // redraw the datasets
            for (i = 0; i < len; i += 1) {
                dataSets[i].draw(pixelatedDraw);
            }
            //draw the qudrants if required.
            if (!pixelatedDraw) {
                chart._drawQuadrant();
            }
        },
        /*
         * helps attaching the essential callbacks for mouse and touch interactions.
        */
        zoomPanManager: function () {
            var touchPoint,
                //stroes the start event
                startEvent = [],
                current = [],
                chart = this,
                chartConfig = chart.config,
                chartGraphics = chart.graphics,
                chartComponents = chart.components,
                xAxis = chartComponents.xAxis[0],
                listeners = chartComponents.eventListeners || (chartComponents.eventListeners = []),
                viewPortConfig = chart.viewPortConfig,
                isMultiTouch = false, // flag for number of touches if its a single or multi touch.
                dblClick = 0, // to distinguish double and single click.
                firstClickIsMouse,
                initialViewPortConfig = {},
                containerElem = chart.linkedItems.container,
                /*
                 * Imposes restrictions on the chartX and chartY as it cannot exceed the canvas area dimensions
                 * @param event {Object} - Fetches the event
                */
                forceLimit = function (event) {
                    var chartX = event.chartX,
                        chartY = event.chartY,
                        left = xAxis.getAxisConfig('axisDimention').x || chartConfig.canvasLeft,
                        top = chartConfig.canvasTop,
                        right = chartConfig.canvasRight,
                        bottom = chartConfig.canvasBottom;

                    (chartX < left) && (event.chartX = mathMax(chartX, left));
                    (chartX > right) && (event.chartX = mathMin(chartX, right));

                    (chartY < top) && (event.chartY = mathMax(chartY, top));
                    (chartY > bottom) && (event.chartY = mathMin(chartY, bottom));
                },
                dragCallbacks = {
                    /*
                     * @param event {Object} - Events for touchStart and dragStart events.
                    */
                    start: function (event) {
                        //update the viewPort configurations.
                        viewPortConfig = chartConfig.viewPortConfig;
                        /*event.touches tells if the interaction was done by a mouse or touch. Orelse in case of hybrid
                        devices, although the hasTouch turns TRUE, it has confusions and error prone if the interaction
                        was mouse based, because event.touches remains undefined in that situation */
                        hasTouch = (event.touches) ? true : false;


                        //for mouseEvent or single touch event.
                        startEvent[0] = isWithinCanvas(event, chart);



                        // todo remove this fix once the drag-move is applied on page body (outside chart)
                        // hide the zoom-selection box
                        chart.updateSelectionBox(0,0,0,0);


                        // check whether this is a multi touch
                        if (hasTouch) {
                            isMultiTouch = false; // default its a single touch.
                            touchPoint = event.touches.length;
                            if (touchPoint === 2) { // for pinch zoom
                                isMultiTouch = true;
                                // store the initial view port
                                initialViewPortConfig.x = viewPortConfig.x;
                                initialViewPortConfig.y = viewPortConfig.y;
                                initialViewPortConfig.scaleX = viewPortConfig.scaleX;
                                initialViewPortConfig.scaleY = viewPortConfig.scaleY;
                                //store the default multi touched event
                                startEvent[0] = isWithinCanvas(event.touches.item(0), chart);
                                startEvent[1] = isWithinCanvas(event.touches.item(1), chart);
                            }
                        }

                        // reset the dragging flag
                        chartConfig.isDragging = false;

                        // if in pan mode
                        if (chartConfig.status === 'pan') {
                            chartConfig.panStartX = viewPortConfig.x;
                            chartConfig.panStartY = viewPortConfig.y;
                            //update the cursor.
                            startEvent[0].insideCanvas && (chartGraphics.trackerGroup.attr({
                                cursor: 'move'
                            }));
                        }
                    },
                    /*
                     * @param event {Object} - Events for touchMove and dragMove events.
                    */
                    on: function (event){

                        var maxX,
                            maxY,
                            newHeight,
                            newOriginX,
                            newOriginY,
                            newViewPortConfig,

                            dx,
                            dy,

                            panStartX = chartConfig.panStartX,
                            panStartY = chartConfig.panStartY,
                            scaleX = viewPortConfig.scaleX,
                            scaleY = viewPortConfig.scaleY,
                            touchPoint,
                            xAxis = chartComponents.xAxis[0],
                            yAxis =  chartComponents.yAxis[0];
                        // if the interaction was based on mouse or touch
                        hasTouch = (event.touches) ? true : false;
                        //for single touch or drag events
                        current[0] = isWithinCanvas(event, chart);

                        if (!current[0].insideCanvas) {
                            chartGraphics.trackerGroup.attr({
                                cursor: STR_DEF
                            });
                        }
                        else {
                            (chartConfig.status === 'pan') && chartGraphics.trackerGroup.attr({
                                cursor: 'move'
                            });
                        }

                        if (hasTouch && event) {
                            touchPoint = event.touches.length;
                            if (touchPoint === 2) {
                                isMultiTouch = true;
                                //set the current event for multi touch event
                                current[0] = isWithinCanvas(event.touches.item(0), chart);
                                current[1] = isWithinCanvas(event.touches.item(1), chart);
                            }
                            else {
                                isMultiTouch = false;
                            }
                        }

                        /*for touch devices, the mouse move may get called during non-moved tap
                        if dragging flag is not enabled
                        Not to detect that as a drag, don't count the mouse move untill it moves significently*/
                        if(!chartConfig.isDragging && (!hasTouch ||mathAbs(current[0].chartX -
                            startEvent[0].chartX) > 2 || mathAbs(current[0].chartY - startEvent[0].chartY) > 2)) {
                            // reset the dragging flag
                            chartConfig.isDragging = true;

                            //hide the tracker element.
                            chart.highlightPoint(false);

                            if (chartConfig.status === 'zoom') {
                                //convert to axis value
                                startEvent[0].pointValue = chart.getValue({
                                    x: startEvent[0].chartX,
                                    y: startEvent[0].chartY
                                });
                                /*
                                 * Raised when the user starts to draw a selection box on a zoomscatter chart.
                                 *
                                 * @param {number} chartX - The x-coordinate of the mouse with respect to the chart.
                                 * @param {number} chartY - The y-coordinate of the mouse with respect to the chart.
                                 * @param {number} pageX - The x-coordinate of the mouse with respect to the page.
                                 * @param {number} pageY - The y-coordinate of the mouse with respect to the page.
                                 * @param {number} startXValue - The value on the canvas x-axis where the selection
                                 started.
                                 * @param {number} startYValue - The value on the canvas y-axis where the selection
                                 started.
                                 * @param {number} selectionTop - Distance between the top edges of the selection box
                                 and the chart
                                 * @param {number} selectionLeft - Distance between the left edges of the selection box
                                 and the chart
                                 * @param {number} selectionWidth - Width of the selection box (0 for this event,
                                 because it is triggered before you finish drawing the box)
                                 * @param {number} selectionHeight - Height of the selection box (0 for this event,
                                 because it is triggered before you finish drawing the box)
                                */
                                global.raiseEvent('selectionStart', {
                                    chartX: startEvent[0].chartX,
                                    chartY: startEvent[0].chartY,
                                    pageX: startEvent[0].pageX,
                                    pageY: startEvent[0].pageY,
                                    selectionTop: startEvent[0].chartX + chartConfig.canvasLeft,
                                    selectionLeft: startEvent[0].chartY + chartConfig.canvasTop,
                                    selectionWidth: 0,
                                    selectionHeight: 0,
                                    startXVAlue: startEvent[0].pointValue.x,
                                    startYVAlue: startEvent[0].pointValue.y
                                }, chart.chartInstance, [chart.chartInstance.id]);
                            }
                        }
                        // if this is dragging then do the drag end
                        if (chartConfig.isDragging) {

                            // do the multitouch zoom
                            if (isMultiTouch) {
                                if (startEvent[0].insideCanvas || startEvent[1].insideCanvas) {
                                    //get a rectangular configuration out of the multi point events.
                                    newViewPortConfig = chart._getTouchViewPort(startEvent, current,
                                        initialViewPortConfig);
                                    // zoom the newViewPortConfig rectangular configurations
                                    chart.updateVisual(newViewPortConfig.x, newViewPortConfig.y,
                                        newViewPortConfig.scaleX, newViewPortConfig.scaleY, true);
                                }
                            }
                            else if (chartConfig.status === 'zoom'){ // do the zooming
                                //update the size of the rectangle
                                chart.updateSelectionBox(startEvent[0].chartX, startEvent[0].chartY, current[0].chartX,
                                    current[0].chartY);
                            }
                            else if (chartConfig.status === 'pan' && (scaleX !== 1 || scaleY !== 1) &&
                                startEvent[0].insideCanvas){ // do the paning
                                maxX = chartConfig.canvasRight;
                                maxY = chartConfig.canvasBottom;
                                //calculate the incremental change.
                                dx = startEvent && (current[0].chartX - startEvent[0].chartX);
                                dy = startEvent && (current[0].chartY - startEvent[0].chartY);


                                panStartX -= dx / scaleX;
                                panStartY -= dy / scaleY;

                                maxX = (chartConfig.canvasWidth * (scaleX - 1))/scaleX;
                                maxY = (chartConfig.canvasHeight * (scaleY - 1))/scaleY;

                                panStartX  = panStartX > maxX ? maxX: (panStartX < 0 ? 0 : panStartX);
                                panStartY = panStartY > maxY ? maxY : (panStartY < 0 ? 0 : panStartY);

                                viewPortConfig.x = panStartX;
                                viewPortConfig.y = panStartY;

                                //updates(redraw) the plot as per panning interactions.
                                chart.updateManager();

                                newHeight = chartConfig.canvasHeight * scaleY;
                                newOriginX = viewPortConfig.x * scaleX;
                                newOriginY = viewPortConfig.y * scaleY;
                                //Redraw the axes on zooming
                                xAxis.draw();
                                yAxis.draw();
                            }
                        }
                    },
                    /*
                     * @param event {Object} - Events for touchEnd and dragEnd events.
                    */
                    end: function (event) {

                        var mousePos = isWithinCanvas(event, chart),
                            left = xAxis.getAxisConfig('axisDimention').x || chartConfig.canvasLeft,
                            top = chartConfig.canvasTop,
                            canvasWidth = chartConfig.canvasWidth,
                            canvasHeight = chartConfig.canvasHeight,
                            oriPositions,
                            selectionEnd,
                            selectionStart,
                            newViewPortConfig,
                            quaterCanvasW = canvasWidth / 4,
                            quaterCanvasH = canvasHeight / 4,
                            mouseX,
                            mouseY,
                            searchEvent;

                        // if the mouse pointer is not valid, retrive the mouse pointer from last mousemove.
                        mousePos  = (isNaN(mousePos.chartX) || isNaN(mousePos.chartY)) ? (current[0] ||
                            startEvent[0]) : mousePos;

                        // if this is dragging then do the drag end
                        if (chartConfig.isDragging) {

                            if (isMultiTouch) { // if multi touch
                                // at the touch end we don't need to do the scale calculations again
                                // we just have to redraw the canvas
                                if (startEvent[0].insideCanvas || startEvent[1].insideCanvas) {
                                    //get a rectangular configuration out of the multi point events.
                                    newViewPortConfig = chart._getTouchViewPort(startEvent, current,
                                        initialViewPortConfig);
                                    // zoom the newViewPortConfig rectangular configurations
                                    chart.updateVisual(newViewPortConfig.x, newViewPortConfig.y,
                                        newViewPortConfig.scaleX, newViewPortConfig.scaleY);
                                }
                                //reset the flag.
                                isMultiTouch = false;

                            }
                            // for single point drag in select zoom state
                            else if (chartConfig.status === 'zoom'){
                                //delete the selection box and call for update plot
                                selectionEnd  = mousePos;
                                selectionStart = startEvent[0];

                                // limit the actions within the canvas area only
                                forceLimit(selectionStart);
                                forceLimit(selectionEnd);

                                //get the original positions of the selection events wrt original unzoomed canvas area.
                                oriPositions = chart.getOriginalPositions(
                                    selectionStart.chartX - left, selectionStart.chartY - top,
                                    selectionEnd.chartX - left, selectionEnd.chartY - top);

                                //reset only if it was a drag mouse event
                                if (oriPositions){
                                    // get the axis values of the end event.
                                    selectionEnd.pointValue = chart.getValue({
                                        x: selectionEnd.chartX,
                                        y: selectionEnd.chartY
                                    });
                                    /*
                                     * Triggered when you complete drawing a selection box on a zoomScatter chart.
                                     *
                                     * @param {number} chartX - x-coordinate of the pointer, relative to the chart
                                     * @param {number} chartY - y-coordinate of the pointer, relative to the chart
                                     * @param {number} pageX - x-coordinate of the pointer, relative to the page
                                     * @param {number} pageY - y-coordinate of the pointer, relative to the page
                                     * @param {number} startXValue - Value of the starting position of the selection
                                     box, in the canvas x-axis
                                     * @param {number} startYValue - Value of the starting position of the selection
                                     box, in the canvas y-axis
                                     * @param {number} endXValue - Value of the ending position of the selection box,
                                     in the canvas x-axis
                                     * @param {number} endYValue - Value of the ending position of the selection box,
                                     in the canvas y-axis
                                     * @param {number} selectionTop - Distance between the top edges of the selection
                                     box and the chart
                                     * @param {number} selectionLeft -Distance between the left edges of the selection
                                     box and the chart
                                     * @param {number} selectionWidth - Width of the selection box
                                     * @param {number} selectionHeight - Height of the selection box
                                    */
                                    global.raiseEvent('selectionEnd', {
                                        chartX: selectionEnd.chartX,
                                        chartY: selectionEnd.chartY,
                                        pageX: selectionEnd.pageX,
                                        pageY: selectionEnd.pageY,
                                        selectionTop: selectionEnd.chartX + chartConfig.canvasLeft,
                                        selectionLeft: selectionEnd.chartY + chartConfig.canvasTop,
                                        selectionWidth: Math.abs(selectionEnd.chartX - selectionStart.chartX),
                                        selectionHeight: Math.abs(selectionEnd.chartY - selectionStart.chartY),
                                        startXVAlue: selectionStart.pointValue.x,
                                        startYVAlue: selectionStart.pointValue.y,
                                        endXValue: selectionEnd.pointValue.x,
                                        endYValue: selectionEnd.pointValue.y
                                    }, chart.chartInstance, [chart.chartInstance.id]);

                                    //when the drag start and end both happens outside the canvas area.
                                    if (selectionStart.chartX !== selectionEnd.chartX &&
                                        selectionStart.chartY !== selectionEnd.chartY){
                                        chart.zoomSelection(oriPositions[0], oriPositions[1], oriPositions[2],
                                            oriPositions[3]);
                                    }
                                    // hide the zoom-selection box
                                    chart.updateSelectionBox(0,0,0,0);
                                }
                            }
                            // reset the is dragging flag
                            chartConfig.isDragging = false;
                            // call the mouse move point search function at the drag end
                            searchEvent = current[0] || startEvent[0];
                            //store the reference of the rendering API in the event itself
                            searchEvent.data = chart;
                            chart.searchMouseMove(searchEvent);
                        }
                        else if(mousePos.insideCanvas){// detect as a mouse click inside canvas
                            dblClick += 1;
                            //doubeTouch flag turns false if no click occurs in 500ms.
                            setTimeout(function () {
                                dblClick = 0;
                                firstClickIsMouse = undefined;
                            },500);
                            if (dblClick === 2 ){
                                if(((event && event.touches) ? true : false) === firstClickIsMouse) {
                                // detect double click
                                    mouseX = mousePos.chartX - left;
                                    mouseY = mousePos.chartY - top;
                                    oriPositions = chart.getOriginalPositions(mouseX - quaterCanvasW,
                                        mouseY - quaterCanvasH, mouseX + quaterCanvasW, mouseY + quaterCanvasH);
                                    chart.zoomSelection(oriPositions[0], oriPositions[1], oriPositions[2],
                                        oriPositions[3]);
                                    event.preventDefault();
                                }
                            }
                            else {// detect as click
                                firstClickIsMouse = (event && event.touches) ? true : false;
                            }
                        }

                        // reset the coursor if any applied
                        chartGraphics.trackerGroup.attr({
                            cursor: STR_DEF
                        });
                    }
                };
            //todo remove event and remove the annonomisity of the callback function with removeEvent.
            //callback for the interactions
            listeners.push(addEvent(containerElem, 'pointerdrag', function (evt) {
                dragCallbacks[evt.state](evt.originalEvent);
            }));
        },
        _drawDataset: function () {
            var i,
                iapi = this,
                chartComponents = iapi.components,
                dataSets = chartComponents.dataset,
                len = dataSets.length;

            // redraw the datasets
            for (i = 0; i < len; i += 1) {
                dataSets[i]._deleteGridImages();
                dataSets[i].graphics._grid = {};
            }
            iapi.updateVisual();
        },
        /*
         * Zooms an area when the scale factors are provided instead the rectangle dimensions.
         * Also useful when a pixelerated zooming is required e.g. in case of pinch zoom interactions.
         * @param zoomX {Number} - x- coordinate in pixels of the rectangle in original viewPortConfigurations
         * @param zoomY {Number} - y- coordinate in pixels of the rectangle in original viewPortConfigurations
         * @param scaleX {Number} - scale factors horizontally the zooming is required
         * @param scaleY {Number} - scale factors vertically the zooming is required
         * @param pixelatedDraw {Boolean} - Flag to zoom in pixelerated manner or redrawing is required.
        */
        updateVisual: function (zoomX, zoomY, scaleX, scaleY, pixelatedDraw) {
            var xVisibleMin,
                xVisibleMax,
                yVisibleMin,
                yVisibleMax,
                i,
                clipRect,
                chart = this,
                chartConfig = chart.config,
                chartComponents = chart.components,
                viewPortConfig = chartConfig.viewPortConfig,
                oldCanvasWidth = chartConfig.canvasWidth,
                oldCanvasHeight = chartConfig.canvasHeight,
                newCanvasWidth = oldCanvasWidth,
                newCanvasHeight = oldCanvasHeight,
                viewPortHistory = chartConfig.viewPortHistory,
                lastViewPortConfig = viewPortHistory.slice(-1)[0],
                zoomEvent = [],
                viewPortStatus = chartConfig.status,
                initConfig = chartConfig._initConfig,

                xAxis = chartComponents.xAxis[0],
                yAxis = chartComponents.yAxis[0],
                chartGraphics = chart.graphics,
                quadrant = chartComponents.quadrant,
                quadrantContainer = quadrant && quadrant.graphics.container,
                maxZoomLimit = chartConfig.maxZoomLimit; //restrictions in the zooming limit.
            //check for validity for the input arguments provided.
            //Incase invalid, revert to the last viewPort configurations, that is visually there remains no change.
            viewPortConfig.x = isNaN(zoomX) ? (zoomX = lastViewPortConfig.x) : zoomX;
            viewPortConfig.y = isNaN(zoomY) ? (zoomY = lastViewPortConfig.y) : zoomY;
            viewPortConfig.scaleX = scaleX || (scaleX = lastViewPortConfig.scaleX);
            viewPortConfig.scaleY = scaleY || (scaleY = lastViewPortConfig.scaleY);

            // apply the limit
            if (scaleX > maxZoomLimit) {
                viewPortConfig.x = zoomX = mathMin(zoomX, (oldCanvasWidth - oldCanvasWidth/maxZoomLimit));
                viewPortConfig.scaleX = scaleX = maxZoomLimit;
            }
            if (scaleY > maxZoomLimit) {
                viewPortConfig.y = zoomY = mathMin(zoomY, (oldCanvasHeight - oldCanvasHeight/maxZoomLimit));
                viewPortConfig.scaleY = scaleY = maxZoomLimit;
            }

            if (pixelatedDraw) {
                //only applicable in case of pinch zoom interaction.
                chart.updateManager(pixelatedDraw);
            }
            else {

                //update the viewPortConfig.status to pan mode after every zoom, only if it is not an initial view.
                if (scaleX > 1 || scaleY > 1) {
                    //incase the status is zoom after zooming in, then toogle it.
                    if (viewPortStatus === 'zoom') {
                        //updates the button visuals as well as the status is toogled.
                        chart.toogleDragPan(true);
                    }
                    //it is a situation of zoomIn
                    if (scaleX >= lastViewPortConfig.scaleX || scaleY >= lastViewPortConfig.scaleY) {
                        //the new configuration is stored for future use.
                        viewPortHistory.push({
                            scaleX: scaleX,
                            scaleY: scaleY,
                            x: zoomX,
                            y: zoomY
                        });
                        //stack of events to be raised.
                        zoomEvent = ['zoomed','zoomIn'];
                    }
                    //situation of zoomOut.
                    else {
                        //pops the latest configuration from the viewPortHistory
                        viewPortHistory.pop();
                        //overwrite the viewPortConfigurations with the latest stored configs and update them.
                        lastViewPortConfig = viewPortHistory.slice(-1)[0];
                        viewPortConfig.x = lastViewPortConfig.x;
                        viewPortConfig.y = lastViewPortConfig.y;
                        viewPortConfig.scaleX = lastViewPortConfig.scaleX;
                        viewPortConfig.scaleY = lastViewPortConfig.scaleY;
                        //stack of events to be raised.
                        zoomEvent = ['zoomed','zoomOut'];
                    }
                }
                else {
                    if (viewPortHistory.length > 1) {
                        //atleast once the zooming has occured.
                        viewPortHistory.pop();
                    }

                    //In the initial view, it will be in zoom state, so in case in pan, toogling is required.
                    if (viewPortStatus === 'pan') {
                        chart.toogleDragPan(true);
                    }
                    //stack of events to be raised.
                    zoomEvent = ['zoomed','zoomOut'];
                }
                //todo reduce the redaundancy. Updates the button visual only.
                chart.toogleDragPan();

                newCanvasWidth = chartConfig.canvasWidth;
                newCanvasHeight = chartConfig.canvasHeight;

                // update the viewPortConfig x and y with the new canvas dimension
                if (zoomX) {
                    zoomX = viewPortConfig.x =  viewPortConfig.x  * (newCanvasWidth / oldCanvasWidth);
                }
                if (zoomY) {
                    viewPortConfig.y = viewPortConfig.y * (newCanvasHeight / oldCanvasHeight);
                }

                chartConfig.canvasLeft = initConfig.canvasLeft;
                chartConfig.canvasWidth = initConfig.canvasWidth;
                chartConfig.canvasHeight = initConfig.canvasHeight;
                chartConfig.canvasTop = initConfig.canvasTop;
                chartConfig.availableHeight = initConfig.availableHeight;
                chartConfig.availableWidth = initConfig.availableWidth;

                chart._spaceManager();
                chart._postSpaceManagement();

                /*On zoom draw all the datasets and the cosmetics needs to according
                to the cosmetic of that dataset when drawn initially*/

                chart.updateManager();

                //Redraw the axes on zooming
                xAxis.draw();
                yAxis.draw();
                chart._drawCanvas ();
                clipRect = {
                    'clip-rect' : chartConfig.canvasLeft + ',' + chartConfig.canvasTop + ',' +
                    chartConfig.canvasWidth + ',' + chartConfig.canvasHeight
                };
                if (chartConfig.viewPortConfig) {
                    chart.graphics.imageContainer.attr({
                        x : chartConfig.canvasLeft,
                        y : chartConfig.canvasRight
                    });
                }
                //update the image container wrt modified canvas dimension after resizing.
                chartGraphics.imageContainer.attr(clipRect)
                .transform('T' + chartConfig.canvasLeft + ',' + chartConfig.canvasTop);
                /*Clipping on the tracker is required when a single plot covers more than the screen and one hover on
                it, the hovering circle goes out of the canvas, which needs to be prevented and hence needs to be
                clipped. This clipping again needs to be updated with every resizing.*/
                chartGraphics.tracker && chartGraphics.tracker.attr(clipRect);

                quadrantContainer && quadrantContainer.attr(clipRect);
                /* zero(0) and newCanvasWidth and newCanvasHeight denotes the extremes of the canvas area. So when
                getValue() is invoked with these inputs they fetches the minimum and maximum values of the x and y-axis
                in terms of axis value. */
                xVisibleMin = xAxis.getValue(0);
                xVisibleMax = xAxis.getValue(newCanvasWidth);
                yVisibleMin = yAxis.getValue(0);
                yVisibleMax = yAxis.getValue(newCanvasHeight);

                //check if it is a first call ie. the unzoomed initial level.
                if (arguments.length === 0) {
                    zoomEvent = BLANKSTRING;
                }
                for (i = 0; i < zoomEvent.length; i += 1) {
                    //todo create global variables of 'zoomIn','zoomOut','reset' to avoid new instance of String class.
                    if (zoomEvent[i] === 'zoomed') {
                        /*
                         * event to be raised when the plot is zoomed in or out.
                         * level - the current level of viewPort configurations in the configuration stack.
                         * startX - the visible minimum value of the x-axis
                         * startY - the visible minimum value of the y-axis
                         * endX - the visible maximum value of the x-axis
                         * endY - the visible maximum value of the y-axis
                        */
                        global.raiseEvent('zoomed', {
                            level: viewPortHistory.length,
                            startX: xVisibleMin,
                            startY: yVisibleMin,
                            endX: xVisibleMax,
                            endY: yVisibleMax
                        }, chart.chartInstance, [chart.chartInstance.id]);
                    }
                    if (zoomEvent[i] === 'zoomIn') {
                        /*
                         * event to be raised when the plot is zoomed in only.
                         * level - the current level of viewPort configurations in the configuration stack.
                         * startX - the visible minimum value of the x-axis
                         * startY - the visible minimum value of the y-axis
                         * endX - the visible maximum value of the x-axis
                         * endY - the visible maximum value of the y-axis
                        */
                        global.raiseEvent('zoomedIn', {
                            level: viewPortHistory.length,
                            startX: xVisibleMin,
                            startY: yVisibleMin,
                            endX: xVisibleMax,
                            endY: yVisibleMax
                        }, chart.chartInstance, [chart.chartInstance.id]);
                    }
                    else if (zoomEvent[i] === 'zoomOut' && !viewPortConfig.isReset) {
                        /*
                         * event to be raised when the plot is zoomed out only.
                         * level - the current level of viewPort configurations in the configuration stack.
                         * startX - the visible minimum value of the x-axis
                         * startY - the visible minimum value of the y-axis
                         * endX - the visible maximum value of the x-axis
                         * endY - the visible maximum value of the y-axis
                        */
                        global.raiseEvent('zoomedOut', {
                            level: viewPortHistory.length,
                            startX: xVisibleMin,
                            startY: yVisibleMin,
                            endX: xVisibleMax,
                            endY: yVisibleMax
                        }, chart.chartInstance, [chart.chartInstance.id]);
                    }
                }
            }
            //hide the tracker element.
            chart.highlightPoint(false);
            //reset the isReset flag.
            viewPortConfig.isReset = false;
        },
        //converts to a specified color corresponding to the given color and opacity.
        /*
         * Takes a color and opacity as input and converts the required rgba code.
         * @param color {String} - HEX color code
         * @param opacity {Number} - opacity in the range of 0-100
        */
        getFillColor: function  (color, opacity) {
            //todo check if we have any similar library method
            opacity = parseFloat(opacity/100); // opacity is provided in [0-100] and needed to be in [0-1]
            if (opacity < 0) { // opacity cannot be negative.
                opacity = 0;
            }
            else if (opacity > 1) { // opacity cannot be more than 1
                opacity = 1;
            }
            if (!color) {
                color = COLOR_WHITE; // white stays the default color
            }

            if (isIE && !hasSVG) {// if the version donot have SVG in IE.
                return opacity ? color : 'transparent';
            }
            else {
                //convert to rgba code.
                color = color.replace(/^#?([a-f0-9]+)/ig, '$1');
                color = lib.graphics.HEXtoRGB(color),
                color[3] = opacity.toString();
                return 'rgba(' + color.join(',') + ')';
            }
        },
        /* function to find hovered trendlines
        */
        _getHoveredTrendLine: function (point, trendLines) {
            var chart = this,
                chartComponents = chart.components,
                xAxis = chartComponents.xAxis[0],
                yAxis = chartComponents.yAxis[0],
                i,
                trendLinesLen = trendLines && trendLines.length,
                xPos = xAxis.getPixel(point.x),
                yPos = yAxis.getPixel(point.y),
                slope,
                trendObj,
                A,
                B,
                C,
                dist,
                x1,
                y1,
                x2,
                y2;

            if (!trendLinesLen) {
                return undefined;
            }
            for (i = trendLinesLen - 1; i >= 0; i--) {
                trendObj = trendLines[i];
                x1 = trendObj.x1;
                y1 = trendObj.y1;
                x2 = trendObj.x2;
                y2 = trendObj.y2;
                if (trendObj.isTrendZone) {
                    if (xPos >= x1 && xPos <= x2 && yPos >= y1 && yPos <= y2) {
                        return trendObj;
                    }
                } else {
                    if (y1 !== y2 && x1 !== x2) {
                        slope = (y1 - y2) / (x1 - x2);
                        A = slope;
                        B = -1;
                        C = y1 - slope * x1;
                        dist = mathAbs(A * xPos + B * yPos + C) / (mathSqrt(mathPow(A,2) + mathPow(B,2)));
                    } else if (x1 === x2) {
                        dist = mathAbs(x1 - xPos);
                    } else if (y1 === y2) {
                        dist = mathAbs(y1 - yPos);
                    }

                    if (dist <= trendObj.tolerance) {
                        return trendObj;
                    }
                }
            }
        },
        /*
         * Search the nearest neighbouring point
         * Show the tooltip and the hover effects.
         * @param point {Object} - The position of the mouse move event wrt to the axis values.
        */
        _bestNeighbour: function (point) {
            var chart = this,
                chartComponents = chart.components,
                chartConfig = chart.config,
                xAxis = chartComponents.xAxis[0],
                yAxis = chartComponents.yAxis[0],
                chartDef = chart.jsonData.chart,
                canvasLeft = chartConfig.canvasLeft,
                canvasTop = chartConfig.canvasTop,
                cx,
                cy,
                i,
                dist,
                showHoverEffect,
                pos,
                datasetObj,
                kdPoint,
                hoverPoint,
                hoverDistance,
                hoveredRadius,
                showToolTip,

                setTooltext,
                toolTipSepChar,
                seriesNameInToolTip,
                x,
                y,
                formatedVal,
                datasetConfig,
                label,
                toolText,
                numberFormatter = chartComponents.numberFormatter,
                datasets = chartComponents.dataset,
                lastIndex = datasets.length - 1;


            for (i = lastIndex; i >= 0; i -= 1) {
                datasetObj = datasets[i];
                datasetConfig = datasetObj.config;
                showHoverEffect = datasetConfig.showHoverEffect;
                showToolTip = datasetConfig.showTooltip;
                if ((!datasetObj.components.kDTree) || !datasetObj.visible) {
                    /*the search is not required either the tree is not build and mouse move occurs or that dataset is
                    cuurently hidden after some legend interaction*/
                    continue;
                }
                //searches the nearest neighbouring point of the input point.
                kdPoint = datasetObj.getElement(point);
                //calculates the distance of the fetched neighbouring point and the recieved point.
                dist = chart._dist(point,kdPoint);

                if (!hoverPoint || dist < hoverDistance) {
                    //if within a permissible distance the neighbouring point is found.
                    pos = i;
                    hoverPoint = kdPoint;
                    //update the minimum of the distance among the other dataset.
                    hoverDistance = dist;
                    //zoomedRadius is the radius of the plot in a particular zoom level.
                    hoveredRadius = ((datasets[pos] && datasetConfig.zoomedRadius) || 0);
                    //if this distance is less than equal to radius break the loop
                    if (hoverDistance <= hoveredRadius) {
                        /*once a valid point(within the plot radius) is found within a dataset further serach among
                        other dataset is not required.*/
                        break;
                    }
                }
            }

            // if nearest point is within distance range highlight the tooltip
            if (hoverDistance <= mathMax((hoveredRadius + 2), 5)) {
                //convert to pixels for the center of the plot.
                /*cx = Math.round(startX + ((hoverPoint.x - minX) * xPVR));
                cy = Math.round(startY + ((maxY - hoverPoint.y) * yPVR));*/
                cx = xAxis.getPixel(hoverPoint.x) - canvasLeft;
                cy = yAxis.getPixel(hoverPoint.y) - canvasTop;
                setTooltext = pluck(hoverPoint.tooltext, datasetConfig.plotToolText);
                datasetObj = datasets[pos];
                datasetConfig = datasetObj.config;
                toolTipSepChar = datasetConfig.tooltip.toolTipSepChar;
                seriesNameInToolTip = datasetConfig.tooltip.seriesNameInToolTip;
                x = hoverPoint.x;
                y = hoverPoint.y;
                if (hoverPoint) {
                    //applying the axis specific number formatter required in tooltip
                    formatedVal = numberFormatter.yAxis(y);
                    label = numberFormatter.xAxis(x);
                    if (Number(showToolTip)) {
                        if (setTooltext !== undefined) {
                            //support for macros in tooltip.
                            toolText = parseTooltext(setTooltext, [4,5,6,7,8,9,10,11], {
                                yaxisName: yAxis.getAxisConfig('axisName'),
                                xaxisName: xAxis.getAxisConfig('axisName'),
                                yDataValue: formatedVal,
                                xDataValue: label
                            }, hoverPoint, chartDef, datasetObj.config);
                        }
                        else {
                            //determine the tooltext then.
                            toolText = (seriesNameInToolTip ? (datasetConfig.seriesname ?
                                (datasetConfig.seriesname + toolTipSepChar): '') : '') + 'x:' + label  +
                            toolTipSepChar + 'y:' + formatedVal;
                        }
                    }
                    else {
                        toolText = BLANKSTRING;
                    }
                }
                //highlightPoint() is not called if the recent found point is same as the last hovered point.
                if (chartConfig.lastHoveredPoint !== hoverPoint) {
                    //update the tracker circle and display the tooltext if required.
                    chart.highlightPoint(showHoverEffect, cx, cy, hoverPoint, pos, toolText);
                }

            }
            else { // else hide the tooltip
                lib.toolTip.hide();
                chart.highlightPoint(false);
            }

            return hoverPoint;
        },
        /* function to draw tooltip of trendlines/zones or v-lines/zones
        */
        _drawTooltip: function (originalEvent, tooltext) {
            var chart = this,
                chartComponents = chart.components,
                paper = chartComponents.paper,
                tip = lib.toolTip;

            if (tooltext) {
                tip.setStyle(paper);
                tip.setPosition(originalEvent);
                tip.draw(tooltext, paper);
            }
        },

        /*
         * Highlight the hovered element. It needs the index value to set the cosmetics according to the dataset
         cosmetics
         * @param showHover {Boolean} -
         * @param cx {Number} - Pixel information about the x-cordinate of the center of the plot being hovered.
         * @param cy {Number} - Pixel information about the y-cordinate of the center of the plot being hovered.
         * @param point {Object} - Raw information about the point say its x and y.
         * @param index {Number} - This refers to the dataset index to which the point being hovered belongs to.
         * @param toolText {String} - Tooltext needed to be displayed for the point being hovered.
        */
        highlightPoint: function (showHover,cx,cy,point,index, toolText) {
            var chart = this,
                chartConfig = chart.config,
                chartComponents = chart.components,
                chartGraphics = chart.graphics,
                paper = chartComponents.paper,
                tracker = chartGraphics.tracker,
                datasetObj = chartComponents.dataset[index],
                datasetConfig = datasetObj && datasetObj.config,
                radius = ( datasetObj && datasetConfig.zoomedRadius || 0),
                hoverCosmetics = datasetObj && datasetConfig.hoverCosmetics,
                fill = hoverCosmetics && hoverCosmetics.fill,
                borderColor = hoverCosmetics && hoverCosmetics.borderColor,
                borderThickness = hoverCosmetics && hoverCosmetics.borderThickness,
                attrObj = {},
                //attach the callbacks for the click and hover interactions for the hovering element.
                plotEventHandlerCallback = {
                    'click': function (e){
                        lib.plotEventHandler.call(this, chart, e);
                    },
                    'hoverIn': function (e){
                        lib.plotEventHandler.call(this, chart, e, 'dataplotRollover');
                    },
                    'hoverOut': function (e) {
                        lib.plotEventHandler.call(this, chart, e, 'dataplotRollout');
                    }
                },
                setLink = point && point.link;

            if (!tracker) {
                // in case the tracker element is not created. Attach the callbacks for click and hovering effects.
                tracker = chartGraphics.tracker = paper.circle(0, 0, 0, chartGraphics.trackerGroup)
                .attr({
                    'clip-rect': chartConfig.canvasLeft + ',' + (chartConfig.canvasTop) + ',' +
                        chartConfig.canvasWidth + ',' + chartConfig.canvasHeight
                })
                .click(plotEventHandlerCallback.click)
                .trackTooltip(true)
                .hover(plotEventHandlerCallback.hoverIn, plotEventHandlerCallback.hoverOut);
            }
            //Attach the required information for the hovering element.
            point && tracker.data('eventArgs', {
                x: point.x,
                y: point.y,
                tooltip: toolText,
                link: setLink
            });

            /* store the hovered point as last visible point. This is required to avoid redaundant calls if the same
            point is hovered. */
            chartConfig.lastHoveredPoint = point;

            // if hover cosmetics then add that in the attrObj
            if (Number(showHover)) {
                attrObj = {
                    r: radius,
                    fill: fill,
                    stroke: borderColor,
                    'stroke-width': borderThickness
                };
            }
            else { // make transparent configuration
                attrObj = {
                    r: radius,
                    fill: TRACKER_FILL,
                    stroke: TRACKER_FILL,
                    'stroke-width': 0
                };
            }
            attrObj.cursor = setLink ? POINTER : '',
            tracker
            .attr(attrObj)
            .tooltip(toolText)
            .transform('t' + (cx + chartConfig.canvasLeft) + ',' + (cy + chartConfig.canvasTop));
            /*on first mouse move the element is created and on the next mouse move the tooltip is shown. In order give
            the effect of displaying the tooltip once hovered, another mouseMove event is fired forcefully */
            point && fireMouseEvent('mouseover', tracker && tracker.node, chartConfig.lastMouseEvent);
        },
        zoom: function (level) {
            var newX,
                newY,
                newEndX,
                newEndY,
                chart = this,
                chartConfig = chart.config,
                viewPortConfig = chartConfig.viewPortConfig,
                oldScaleX = viewPortConfig.scaleX,
                oldScaleY = viewPortConfig.scaleY,
                oldX = viewPortConfig.x,
                oldY = viewPortConfig.y,
                canvasW = chartConfig.canvasWidth,
                canvasH = chartConfig.canvasHeight,
                scale1w = canvasW / oldScaleX,
                scale1h = canvasH / oldScaleY,
                newscale1w = scale1w *level,
                newscale1h = scale1h *level;

            // should not cross canvas limit
            newscale1w = newscale1w > canvasW ? canvasW : newscale1w;
            newscale1h = newscale1h > canvasH ? canvasH : newscale1h;

            // calculate the new x and y
            newX = (oldX + (scale1w / 2)) - (newscale1w / 2);
            newY = (oldY + (scale1h / 2)) - (newscale1h / 2);

            // new x and y should not be less than 0
            newX = newX < 0 ? 0 : newX;
            newY = newY < 0 ? 0 : newY;

            // new visible area should not cross the original size
            newEndX = newX + newscale1w;
            newEndY = newY + newscale1h;
            newX = newEndX > canvasW ? (canvasW - newscale1w) : newX;
            newY = newEndY > canvasH ? (canvasH - newscale1h) : newY;

            chart.zoomSelection(newX, newY, newscale1w, newscale1h);
        },
        /*converts the buttons visual into activated/ deactivated modes. e.g. deactivation of reset button iniitially.
        buttonArr stores the array list of the buttons, whose visuals needs to be modified.
        tooltip of the buttons needs to be modified inaccordance to its activated / deactivated states.*/
        updateButtonVisual: function () {
            var i,
                button,
                buttonDisableArr,
                buttonEnableArr,
                chart = this,
                chartConfig = chart.config,
                chartComponents = chart.components,
                toolBoxGraphics = chartComponents.tb.graphics,
                viewPortHistory = chartConfig.viewPortHistory,
                status = chartConfig.status,
                pressedButton;
            // atleast once zoomed.
            if (viewPortHistory.length <= 1) {
                buttonDisableArr = ['zoomOutButton', 'resetButton', 'togglePanButton'];
                buttonEnableArr = ['zoomInButton'];
                pressedButton = 'toggleZoomInButton';
            }
            // intial unzoomed view
            else {
                buttonEnableArr = ['resetButton', 'zoomOutButton', 'zoomInButton'];
                buttonDisableArr = [];
                if (status === 'zoom') {
                    buttonEnableArr.push('togglePanButton');
                    pressedButton = 'toggleZoomInButton';
                }
                else if (status === 'pan'){
                    buttonEnableArr.push('toggleZoomInButton');
                    pressedButton = 'togglePanButton';
                }
            }
            for (i = 0; i < buttonDisableArr.length; i += 1) {
                button = buttonDisableArr[i];
                //convert the button visual to deactivated state with blank tooltip.
                toolBoxGraphics[button].node.attr({
                    config: {
                        hover: {
                            fill: COLOR_WHITE,
                            'stroke-width': 1,
                            stroke: COLOR_E3E3E3,
                            cursor: STR_DEF
                        },
                        normal: {
                            fill: COLOR_WHITE,
                            stroke: COLOR_E3E3E3,
                            'stroke-width': 1,
                            cursor: STR_DEF
                        },
                        disable: {
                            fill: COLOR_WHITE,
                            'stroke-width': 1,
                            stroke: COLOR_E3E3E3,
                            'stroke-opacity': 1,
                            cursor: STR_DEF
                        },
                        pressed: {
                            fill: COLOR_WHITE,
                            'stroke-width': 1,
                            stroke: COLOR_E3E3E3,
                            cursor: STR_DEF
                        }
                    },
                    fill: [COLOR_WHITE, COLOR_WHITE, COLOR_WHITE, COLOR_WHITE, true],
                    'button-disabled': false,
                    'stroke': COLOR_E3E3E3,
                    'stroke-opacity': 1
                });
            }

            for (i = 0; i < buttonEnableArr.length; i += 1) {
                button = buttonEnableArr[i];
                //convert the button visial to activated state with appropiate tooltip.
                toolBoxGraphics[button].node.attr({
                    config: {
                        hover: {
                            fill: COLOR_WHITE,
                            'stroke-width': 1,
                            stroke: '#aaaaaa',
                            cursor: 'pointer'
                        },
                        normal: {
                            fill: COLOR_WHITE,
                            stroke: COLOR_C2C2C2,
                            'stroke-width': 1,
                            cursor: 'pointer'
                        },
                        disable: {
                            fill: COLOR_WHITE,
                            'stroke-width': 1,
                            stroke: COLOR_E3E3E3,
                            'stroke-opacity': 1,
                            cursor: 'pointer'
                        },
                        pressed: {
                            fill: COLOR_EFEFEF,
                            'stroke-width': 1,
                            stroke: COLOR_C2C2C2,
                            cursor: 'pointer'
                        }
                    },
                    'button-disabled': false,
                    fill: [COLOR_WHITE, COLOR_WHITE, COLOR_WHITE, COLOR_WHITE, true],
                    'stroke': COLOR_C2C2C2,
                    'stroke-opacity': 1
                });
            }

            toolBoxGraphics[pressedButton].node.attr({
                config: {
                    hover: {
                        fill: COLOR_EFEFEF,
                        'stroke-width': 1,
                        stroke: COLOR_EFEFEF,
                        cursor: STR_DEF
                    },
                    normal: {
                        fill: COLOR_EFEFEF,
                        stroke: COLOR_E3E3E3,
                        'stroke-width': 1,
                        cursor: STR_DEF
                    },
                    disable: {
                        fill: COLOR_E6E6E6,
                        'stroke-width': 1,
                        stroke: COLOR_E3E3E3,
                        'stroke-opacity': 1,
                        cursor: STR_DEF
                    },
                    pressed: {
                        fill: COLOR_EFEFEF,
                        'stroke-width': 1,
                        stroke: COLOR_E3E3E3,
                        cursor: STR_DEF
                    }
                },
                'button-disabled': false,
                fill: [COLOR_EFEFEF, COLOR_EFEFEF, COLOR_EFEFEF, COLOR_EFEFEF, true],
                'stroke': COLOR_E3E3E3,
                'stroke-opacity': 1
            });
        },
        _drawAxis: function () {

        }
    }, chartAPI.scatterBase);


    FusionCharts.register('component', ['dataset', 'zoomscatter', {
        type: 'zoomscatter',
        configure: function () {
            var plotFillHoverColor,
                plotFillHoverAlpha,
                borderHoverColor,
                borderHoverThickness,
                borderHoverAlpha,
                userGivenBorderColor,
                conf,
                showHoverEffect,
                dataSetComponents,
                staticRadius,
                dataSet = this,
                chart = dataSet.chart,
                chartConfig = chart.config,
                chartAttr = chart.jsonData.chart,
                getFillColor = chart.getFillColor,
                JSONData = dataSet.JSONData;
            // configurations parsed as those of the scatter chart.
            dataSet.__base__.configure.call(dataSet);
            //store a reference to the configuration parsed.
            conf = dataSet.config;
            dataSetComponents = dataSet.components;
            //Following configurations are added or modified being speciifc to the 'zoom-scatter' chart
            // We first look into dataset then chart obj and then default value.(plucking the cosmetics)
            userGivenBorderColor = pluck(JSONData.anchorbordercolor, chartAttr.anchorbordercolor);
            /*If no border Thickness is given, the border thickness turns to 1 px in case there exists a
                user-defined anchorBorderColor; orelse the anchorBorderThickness turns to zero.*/
            conf.anchorBorderThickness = pluck(JSONData.anchorborderthickness, chartAttr.anchorborderthickness,
                userGivenBorderColor ? 1 : 0);
            dataSetComponents.kDTree = new KdTree(); // create a new instance for the kdTree class.

            // * @todo make this dynamic as per the browser performance
            conf.chunkSize = Math.floor(mathMin(((JSONData.data || []).length)/5,50000));
            // Turning staticRadius TRUE, keeps the radius of the plots intact even after zooming.
            staticRadius = conf.staticRadius = pluckNumber(chartAttr.staticradius, 0);
            // Applies to all the plots of a particular dataset.
            conf.radius = pluckNumber(JSONData.radius,JSONData.anchorradius,chartAttr.radius,
                chartAttr.anchorradius, (staticRadius ? 3 : 0.5));

            showHoverEffect = conf.showHoverEffect;
            //Hover Cosmetics
            plotFillHoverColor = getFirstColor(pluck(JSONData.plotfillhovercolor, JSONData.hovercolor,
                chartAttr.plotfillhovercolor, chartAttr.hovercolor, conf.anchorbgcolor)),
            plotFillHoverAlpha = pluck(JSONData.plotfillhoveralpha, JSONData.hoveralpha,
                chartAttr.plotfillhoveralpha, chartAttr.hoveralpha, HUNDREDSTRING),
            borderHoverColor = getFirstColor(pluck(JSONData.plotfillhovercolor, JSONData.hovercolor,
                chartAttr.plotfillhovercolor, chartAttr.hovercolor, plotFillHoverColor)),
            borderHoverAlpha = pluck(JSONData.plotfillhoveralpha, JSONData.hoveralpha, chartAttr.plotfillhoveralpha,
                chartAttr.hoveralpha, HUNDREDSTRING),
            borderHoverThickness = pluckNumber(JSONData.borderhoverthickness, chartAttr.borderhoverthickness, 1),

            conf.hoverCosmetics = {
                'showHoverEffect': showHoverEffect,
                'fill': getFillColor(plotFillHoverColor,plotFillHoverAlpha),
                'borderColor': getFillColor(borderHoverColor,borderHoverAlpha),
                'borderThickness': borderHoverThickness
            };
            //store the hoverCosmetics
            //sending an examplory
            // conf.hoverCosmetics = dataSet._parseHoverEffectOptions();
            //tooltip configurations
            conf.tooltip = {
                toolTipVisible: chartConfig.showtooltip,
                seriesNameInToolTip: chartConfig.seriesnameintooltip,
                toolTipSepChar: chartConfig.tooltipsepchar
            };
            // create the store to store last scale factors
            conf.lastViewPort = {};
        },
        /*
         * check for zoom or pan operations and start the _gridDraw()
         * @param pixelatedDraw {Boolean} - During the pinchZoom interactions in touch enabled devices, this flag is set
          to true to have a pixelerated drawing mode to let the user know to what extent they are zooming into
        */
        draw: function (pixelatedDraw) {
            var xAxis,
                yAxis,
                xPVR,
                yPVR,
                zoomedRadius,
                datasetObj = this,
                dataSetGraphics = datasetObj.graphics,
                chart = datasetObj.chart,
                chartComponents = chart.components,
                chartGraphics = chart.graphics,
                imageContainer = chartGraphics.imageContainer,
                paper = chartComponents.paper,
                chartConfig = chart.config,
                imageGroup = dataSetGraphics.container,
                visible = datasetObj.visible,
                viewPortConfig = chartConfig.viewPortConfig,
                datasetConfig = datasetObj.config, // Refernece to the configurations particular to the dataset instance
                lastViewPort = datasetConfig.lastViewPort || {}, // store the latest viewPort Configurations
                quickInitialDraw = false; /*a flag to check if there is a modification in the lastViewPort and determine
                 if the action is supposedly zoom or paning one.*/
            //create the image group if not being created
            if (!imageGroup) {
                // This grid-container is the container element for all the images required for that dataset itself.
                imageGroup = (dataSetGraphics.container = paper.group('grid-container',imageContainer));
            }
            /* Invoke the hide or show function, only if ambigious cases arises like the _conatinerHidden is set to
            true whilst the dataSet is in visible state. */
            if (visible && datasetObj._conatinerHidden) {
                datasetObj.show();
            }
            else if (!visible && !datasetObj._conatinerHidden) {
                datasetObj.hide();
            }

            if (pixelatedDraw) {
                datasetObj._pixelatedDraw(); /* Draws in the pixelerated mode giving a better visual clue during pinch
                zoom interaction*/
            }
            else {
                //modifications in viewPortConfig indicates it is a zoom effect and not pan.
                if (lastViewPort.scaleX !== viewPortConfig.scaleX || lastViewPort.scaleY !== viewPortConfig.scaleY) {
                    //This is a zoom action as the viewPortConfigurations are modified.

                    // update the lastViewPort Configurations
                    lastViewPort.scaleX = viewPortConfig.scaleX;
                    lastViewPort.scaleY = viewPortConfig.scaleY;
                    //sets the x and y limit for search implementation.
                    xAxis = chartComponents.xAxis[0];
                    yAxis = chartComponents.yAxis[0];
                    // Get the latest PixelValueRatio from the axis modules.
                    xPVR = xAxis.getPVR();
                    yPVR = yAxis.getPVR();

                    /*For zoomedRadius below 2 pixels, it becomes tough for tooltip display, hence minimum 2 pixels is
                    the lower cut-off.Similarily, zoomedDiameter can not be expected to be more than the canvasWidth or
                    canvasHeight becuase there is no point of letting the user zoom beyond a level where only a single
                    plot covers the entire canvas area*/
                    zoomedRadius = mathMax((datasetConfig.zoomedRadius = mathMin((datasetConfig.staticRadius ?
                        datasetConfig.radius : (datasetConfig.radius * mathMin(viewPortConfig.scaleX,
                            viewPortConfig.scaleY))), chartConfig.canvasWidth / 2, chartConfig.canvasHeight / 2)), 2);
                    // reset the configurations which are dependent on zoom level
                    datasetObj.components.kDTree._setSearchLimit(zoomedRadius/xPVR, zoomedRadius/yPVR);
                    datasetObj._deleteGridImages(); // delete the old grids.
                    datasetObj.graphics._grid = {}; //initialise the _grid Object.
                    quickInitialDraw = true; // in case of zoom do not create a seperate thread for the first drawing
                }
                // now draw the grid image
                datasetObj._gridDraw(quickInitialDraw);
            }
        },
        /*
         * Pixelerates the entire canvas drawing. This is useful in pinchZoom interaction where the redraw part is not
         required untill the interaction is completed.
         * Clear the previous drawing threads.
         * Pixelerate(Modify the posiition and dimentions of) the images in accordance to the modified viewPort
         configurations.
        */
        _pixelatedDraw: function () {
            var rowIndex,
                colIndex,
                imageElem,
                gridElem,
                lineImage,
                row,
                datasetObj = this,
                chart = datasetObj.chart,
                chartConfig = chart.config,
                datasetConfig = datasetObj.config,
                dataSetGraphics = datasetObj.graphics,
                drawLine = datasetConfig.drawLine,
                lastViewPort = datasetConfig.lastViewPort || {},
                oldSX = lastViewPort.scaleX,
                oldSY = lastViewPort.scaleY,
                viewPortConfig = chartConfig.viewPortConfig,
                newSX = viewPortConfig.scaleX,
                newSY = viewPortConfig.scaleY,
                grid = datasetObj.graphics._grid || (datasetObj.graphics._grid = []),
                scaleFactorX = newSX / oldSX, // Factor by which the scaleX have been changed in the new configurations
                scaleFactorY = newSY / oldSY, // Factor by which the scaleY have been changed in the new configurations
                gridWidth = chartConfig.canvasWidth * scaleFactorX,
                gridHeight = chartConfig.canvasHeight * scaleFactorY,
                batchDarwTimers = datasetConfig._batchDarwTimers,
                imageGroup = dataSetGraphics.container;

            // clear previous drading thread if any
            clearTimeout(datasetObj.timer);

            // delete previous drawing threads for grids
            if (batchDarwTimers && batchDarwTimers.length) {
                while (batchDarwTimers.length) {
                    clearTimeout(batchDarwTimers.shift());
                }
            }
            // pan the image group
            imageGroup.transform('t'+mathRound(-viewPortConfig.x * viewPortConfig.scaleX)+',' +
                mathRound(-viewPortConfig.y * viewPortConfig.scaleY));

            // zoom all the images. grid is the 2-d array consisting of the image elements.
            for (rowIndex in grid) {
                row = grid[rowIndex];
                if (row) {
                    for (colIndex in row) {
                        gridElem = row[colIndex];
                        if (gridElem && gridElem.drawState) {
                            imageElem = gridElem.image;
                            //update the image elements positions and dimentions.
                            imageElem.attr({
                                'x' : gridElem.xPixel * scaleFactorX,
                                'y' : gridElem.yPixel * scaleFactorY,
                                'width': gridWidth,
                                'height': gridHeight
                            });

                            if (drawLine) {
                                lineImage = gridElem.lineImage;
                                //update the image elements positions and dimentions.
                                lineImage.attr({
                                    'x' : gridElem.xPixel * scaleFactorX,
                                    'y' : gridElem.yPixel * scaleFactorY,
                                    'width': gridWidth,
                                    'height': gridHeight
                                });
                            }
                        }
                    }
                }
            }
        },
        /*
         * Delete the already drawn images
         * Delete previous drawing threads
        */
        _deleteGridImages: function () {
            var imageElem,
                lineImage,
                lineCanvas,
                canvasElem,
                gridElem,
                rowIndex,
                colIndex,
                row,
                datasetObj = this,
                datasetConfig = datasetObj.config,
                datasetGraphics = datasetObj.graphics,
                imagePool =datasetGraphics._imagePool || (datasetGraphics._imagePool = []),
                canvasPool = datasetGraphics._canvasPool || (datasetGraphics._canvasPool = []),
                lineImagePool =datasetGraphics._lineImagePool || (datasetGraphics._lineImagePool = []),
                lineCanvasPool = datasetGraphics._lineCanvasPool || (datasetGraphics._lineCanvasPool = []),
                grid = datasetGraphics._grid || [],
                batchDarwTimers = datasetConfig._batchDarwTimers;

            // delete previous drawing threads
            if (batchDarwTimers && batchDarwTimers.length) {
                while (batchDarwTimers.length) {
                    clearTimeout(batchDarwTimers.shift());
                }
            }

            for ( rowIndex in grid) {
                row = grid[rowIndex];
                if (row) {
                    for (colIndex in row) {
                        gridElem = row[colIndex];
                        if (gridElem && gridElem.drawState) {
                            // unlink the image element
                            imageElem = gridElem.image;
                            //blanks the src of the image element.
                            imageElem.attr({
                                'src': '',
                                'width': 0,
                                'height': 0
                            });
                            imagePool.push(imageElem); //push the already drawn image in the image pool
                            delete gridElem.image;
                            // unlink the canvas element
                            canvasElem = gridElem.canvas;
                            canvasPool.push(canvasElem); //push the already drawn canvas in the canvas pool
                            delete gridElem.canvas;
                            delete gridElem.ctx;

                            if ((lineImage = gridElem.lineImage)) {
                                //blanks the src of the line image element.
                                lineImage.attr({
                                    'src': '',
                                    'width': 0,
                                    'height': 0
                                });
                                lineImagePool.push(lineImage); //push the already drawn image in the image pool
                                delete gridElem.lineImage;
                                // unlink the canvas element
                                lineCanvas = gridElem.lineCanvas;
                                lineCanvasPool.push(lineCanvas); //push the already drawn canvas in the canvas pool
                                delete gridElem.lineCanvas;
                                delete gridElem.lineCtx;
                            }
                        }
                    }
                }
            }
            // delete the grid store
            delete datasetGraphics._grid;
        },
        /*
         * Primarily updates the gridManager using _gridManager(). But in case of pan, it does in timer to avoid mouse
         freezing. So even if the drawing part becomes heavy, they dont block mouse drag event, enriching the UI
         experience,
         * @param quickInitialDraw {Boolean} - The flag is TRUE for zooming action and FALSE during the panning actions.
        */
        _gridDraw: function (quickInitialDraw) {
            var datasetObj = this,
                dataSetGraphics = datasetObj.graphics,
                datasetConfig = datasetObj.config,
                chart = datasetObj.chart,
                chartConfig = chart.config,
                viewPortConfig = chartConfig.viewPortConfig;

            // clear previous drading thread if any
            clearTimeout(datasetConfig.timer);

            /*Pan the image group to the latest viewPortConfigurations taking the scaling factors(due to zooming) in
            account*/
            dataSetGraphics.container.transform('t'+mathRound(-viewPortConfig.x * viewPortConfig.scaleX)+',' +
                mathRound(-viewPortConfig.y * viewPortConfig.scaleY));

            if (quickInitialDraw) { //Zoom actions
                // draw grid members if required
                datasetObj._gridManager();
            }
            else { //Pan(/Drag) actions.
                //_gridManager() is called in setTimeout() to avoid frezzed mousemove as the drawing is heavy
                datasetConfig.timer = setTimeout (function () {
                    // draw grid members if required
                    datasetObj._gridManager();
                }, 10);
            }
        },
        /*
         * initially draw max 4 grid (grid of the 4 sample corner point) which are visible and then draw
         the rest images
        */
        _gridManager: function () {
            var rowGrid,
                element,
                xMinValue,
                xMaxValue,
                yMinValue,
                yMaxValue,
                gridIndex,
                centerRowNo,
                centerColNo,
                returnObj,
                startRow,
                startCol,
                endRow,
                endCol,
                i,
                j,
                rowObj,
                callBack,
                datasetObj = this,
                datasetGraphics = datasetObj.graphics,
                datasetConfig = datasetObj.config,
                grid = datasetGraphics._grid,
                drawGrid = datasetConfig._drawGrid || (datasetConfig._drawGrid = []),
                chart = datasetObj.chart,
                chartConfig = chart.config,
                chartComponents = chart.components,
                viewPortConfig = chartConfig.viewPortConfig,
                scaleX = viewPortConfig.scaleX,
                scaleY = viewPortConfig.scaleY,
                noRow = Math.ceil(scaleY),
                noCol = Math.ceil(scaleX),
                xAxis = chartComponents.xAxis[0],
                yAxis = chartComponents.yAxis[0],
                cellWidth = xAxis.getAxisConfig('axisDimention').axisLength || chartConfig.canvasWidth,
                cellHeight = chartConfig.canvasHeight,
                xAxisConfig = xAxis.config,
                yAxisConfig = yAxis.config,
                xMin = xAxisConfig.axisRange.min,
                xMax = xAxisConfig.axisRange.max,
                yMin = yAxisConfig.axisRange.min,
                yMax = yAxisConfig.axisRange.max,
                cellXlength = (xMax - xMin) / scaleX,
                cellYlength = (yMax - yMin) / scaleY,

                radius =  datasetConfig.radius * mathMin(viewPortConfig.scaleX,viewPortConfig.scaleY),
                borderWidth = datasetConfig.plotCosmetics.borderWidth,
                padPx = radius + borderWidth,
                xRadiusPad = mathAbs(padPx / (cellWidth * viewPortConfig.scaleX/(xAxis.max - xAxis.min))),
                yRadiusPad = mathAbs(padPx / (cellHeight * viewPortConfig.scaleY/(yAxis.max - yAxis.min))),

                viewPortOrigW = cellWidth / scaleX,
                viewPortOrigH = cellHeight / scaleY,
                // distance of the sample 4 corner point from the view-port border
                gridPadding = mathMin(1, viewPortOrigW / 10, viewPortOrigH / 10),

                p1GridStore = {}, // grids that will be drawn in phase-1
                // grids that will be added later.
                //Use Array as this will be directly passed to `_drawGridArr`
                p2GridStore = [],

                // get the 4 corner pixel
                leftX = viewPortConfig.x + gridPadding,
                rightX = viewPortConfig.x - gridPadding + viewPortOrigW,
                topY = viewPortConfig.y + gridPadding,
                bottomY = viewPortConfig.y + viewPortOrigH - gridPadding;

            // initially draw max 4 grid (grid of the 4 sample corner point) which are visisble
            // grid of the top-left corner
            gridIndex = datasetObj._getFocusedGrid(leftX, topY);
            rowObj = p1GridStore[gridIndex.row] || (p1GridStore[gridIndex.row] = {});
            rowObj[gridIndex.col] = true;

            // grid of the top-right corner
            gridIndex = datasetObj._getFocusedGrid(rightX, topY);
            rowObj = p1GridStore[gridIndex.row] || (p1GridStore[gridIndex.row] = {});
            rowObj[gridIndex.col] = true;

            // grid of the bottom-right corner
            gridIndex = datasetObj._getFocusedGrid(rightX, bottomY);
            rowObj = p1GridStore[gridIndex.row] || (p1GridStore[gridIndex.row] = {});
            rowObj[gridIndex.col] = true;

            // grid of the bottom-left corner
            gridIndex = datasetObj._getFocusedGrid(leftX, bottomY);
            rowObj = p1GridStore[gridIndex.row] || (p1GridStore[gridIndex.row] = {});
            rowObj[gridIndex.col] = true;

            /* @todo: support animantion*/
            // get the center grid
            returnObj = datasetObj._getFocusedGrid();

            centerRowNo = returnObj.row;// the center row index
            centerColNo = returnObj.col; // the center column index
            //configurations required to traverse across the center image.
            startRow = mathMax(centerRowNo - 1, 0);
            endRow = mathMin(centerRowNo + 1, noRow - 1);
            startCol = mathMax(centerColNo - 1, 0);
            endCol = mathMin(centerColNo + 1, noCol - 1);


            yMaxValue = yMax - (startRow * cellYlength);
            /*keeping the center grid, get the neighbouring images if present and create the drawGrid to store the grids
             to be drawn*/
            for (i = startRow; i <= endRow; i += 1) {
                rowGrid = grid[i] || (grid[i] = {});
                xMinValue = xMin + (startCol * cellXlength);
                for (j = startCol; j <= endCol; j+=1) {

                    element = grid[i][j];

                    if (!element) {
                        yMinValue = mathMax(yMaxValue - cellYlength, yMin);
                        xMaxValue = mathMin(xMinValue + cellXlength, xMax);
                        //update the grid element configurations.
                        element = grid[i][j] = {
                            xPixel: j * cellWidth,
                            yPixel: i * cellHeight,
                            xMinValue: xMinValue,
                            yMinValue: yMinValue,
                            xMaxValue: xMaxValue,
                            yMaxValue: yMaxValue,
                            drawState: 0, // 0=> not drawn, 1=> drawn, 2=> is drawing

                            // padding to accomodate the partial drawing of the elements of neighbouring grid
                            xMinWPad: mathMax(xMinValue - xRadiusPad, xMin),
                            yMinWPad: mathMax(yMinValue - yRadiusPad, yMin),
                            xMaxWPad: mathMin(xMaxValue + xRadiusPad, xMax),
                            yMaxWPad: mathMin(yMaxValue + yRadiusPad, yMax)

                        };
                    }

                    if (!element.drawState) {
                        if (p1GridStore[i] && p1GridStore[i][j]) {
                            //build the stack of the images needed to be drawn in the first phase.
                            drawGrid.push({
                                row : i,
                                col : j
                            });
                        }
                        else {
                            p2GridStore.push({
                            //build the stack of the images needed to be drawn in the next phase.
                                row : i,
                                col : j
                            });
                        }
                    }
                    xMinValue += cellXlength; //increment the xMinValue after every image is drawn horizontally.
                }
                yMaxValue -= cellYlength; //decrement the yMaxValue after every image is drawn vertically.
            }
            //The visible images are drawn first and the rest images are drawn as a callback of the rest.
            if (drawGrid.length || p2GridStore.length) {
                // create the call back function that will be called once these grids are created
                callBack = function () {
                    datasetConfig._drawGrid = p2GridStore;
                    // No callback after the 2nd phase
                    datasetObj._drawGridArr();
                };
                // draw the images for 1st phase
                datasetObj._drawGridArr(callBack);
            }
        },
        /*
         * Returns the center grid element row and column wrt to a given x,y or based on canvas center.
         * @param x {Number} - x-Coordinate wrt which the grid element center is to be found.
         * @param y {NUmber} - y-coordinate wrt which the grid element center is to be tracked.
         * @return {Object} - The row and column for the center grid element.
        */
        _getFocusedGrid: function (x, y) {
            // get the focused grid based on the grid center and not the left top.
            var datasetObj = this,
            chart = datasetObj.chart,
            chartConfig = chart.config,
            viewPortConfig = chartConfig.viewPortConfig,

            scaleX = viewPortConfig.scaleX,
            scaleY = viewPortConfig.scaleY,
            canvasWidth = chartConfig.canvasWidth,
            canvasHeight = chartConfig.canvasHeight,
            //the width and height wrt original unzoomed initial level.
            canOrigW = canvasWidth / scaleX,
            canOrigH = canvasHeight / scaleY,
            //In case the x,y is not defined, the canvas center in its current zoom level is choosen.
            xPixel = isNaN(x) ? viewPortConfig.x + (canOrigW / 2) : x,
            yPixel = isNaN(y) ? viewPortConfig.y + (canOrigH / 2) : y;

            return {
                    'row': mathFloor(yPixel / canOrigH),
                    'col': mathFloor(xPixel / canOrigW)
                };
        },

        /*
         *
         * @param callBack {Function} - Once the four visible images are drawn, this function sets the _drawGrid to the
         rest images, which are drawn again. Hence this callback is invoked at the end of the completion of drawing of
         the first phase images.
        */
        _drawGridArr: function (callBack) {
            // draw grids and delete them from the drawGridarr once completed
            var gridIndexElem,
                gridElem,
                canvasElem,
                lineCanvasElem,
                ctx,
                lineCtx,
                datasetObj = this,
                chart = datasetObj.chart,
                chartConfig = chart.config,
                chartComponents = chart.components,
                viewPortConfig = chartConfig.viewPortConfig,
                datasetConfig = datasetObj.config,
                drawLine = datasetConfig.drawLine,
                gridIndexArr = datasetConfig._drawGrid, // list of images to be drawn.
                gridSubArr = [],
                gridContainer = datasetObj.graphics.container,
                paper = chartComponents.paper,
                width = chartComponents.xAxis[0].getAxisConfig('axisDimention').axisLength || chartConfig.canvasWidth,
                height = chartConfig.canvasHeight,
                grid = datasetObj.graphics._grid,
                imagePool = datasetObj.graphics._imagePool || [],
                canvasPool = datasetObj.graphics._canvasPool || [],
                lineImagePool = datasetObj.graphics._lineImagePool || [],
                lineCanvasPool = datasetObj.graphics._lineCanvasPool || [],
                plotCosmetics = datasetConfig.plotCosmetics,
                //update the radius with every zoom configurations.
                radius =  datasetConfig.radius * mathMin(viewPortConfig.scaleX, viewPortConfig.scaleY),
                offset = (chart.components.xAxis[0].getAxisConfig('axisDimention').x || chartConfig.canvasLeft) -
                    chartConfig.canvasLeft;

            if (gridIndexArr.length) {
                while (gridIndexArr.length) {
                    gridIndexElem = gridIndexArr.shift();
                    gridElem = grid[gridIndexElem.row][gridIndexElem.col];


                    if (gridElem.drawState === 2) {
                        continue;
                    }
                    gridElem.drawState = 2;
                    // use another set of images for drawing the lines.
                    if (drawLine) {
                        // add the image from the pool
                        if (lineImagePool.length) {
                            gridElem.lineImage = lineImagePool.shift();
                        }
                        else {
                            // create the image element.
                            gridElem.lineImage = paper.image('', gridContainer);
                        }
                        // set the image dimensions.
                        gridElem.lineImage.attr({
                            'x' : gridElem.xPixel + offset,
                            'y' : gridElem.yPixel,
                            'width' : (width),
                            'height' : (height)
                        });

                        // add the canvas element from the pool
                        if (canvasPool.length) {
                            gridElem.lineCanvas = lineCanvasElem = lineCanvasPool.shift();
                        }
                        else {
                            // create the canvas if it doesnot exist.
                            gridElem.lineCanvas = lineCanvasElem = win.document.createElement('canvas');
                        }

                        // set the canvas dimensions
                        lineCanvasElem.setAttribute('width', width);
                        lineCanvasElem.setAttribute('height', height);
                        // cache the context of the canvas element.
                        lineCtx = gridElem.lineCtx = lineCanvasElem.getContext('2d');

                        // apply the cosmetics of the anchors.
                        lineCtx.fillStyle = plotCosmetics.fillStyle;
                        lineCtx.strokeStyle = plotCosmetics.lineStrokeStyle;
                        lineCtx.lineWidth = plotCosmetics.lineWidth;
                    }
                    // add the image from the pool
                    if (imagePool.length) {
                        gridElem.image = imagePool.shift();
                    }
                    else {
                        // create the image element.
                        gridElem.image = paper.image('', gridContainer);
                    }

                    // set the image dimensions.
                    gridElem.image.attr({
                            'x' : gridElem.xPixel  + offset,
                            'y' : gridElem.yPixel,
                            'width' : (width),
                            'height' : (height)
                        });

                    // add the canvas element from the pool
                    if (canvasPool.length) {
                        gridElem.canvas = canvasElem = canvasPool.shift();
                    }
                    else {
                        // create the canvas if it doesnot exist.
                        gridElem.canvas = canvasElem = win.document.createElement('canvas');
                    }

                    // set the canvas dimensions
                    canvasElem.setAttribute('width', width);
                    canvasElem.setAttribute('height', height);
                    ctx = gridElem.ctx = canvasElem.getContext('2d'); // cache the context of the canvas element.

                    // apply the cosmetics of the anchors.
                    if (radius < 1) {
                        /* incase of very small radius, set the fill as stroke-style and draw a dot. This is acts as a
                        leverage on performance.*/
                        ctx.strokeStyle= plotCosmetics.fillStyle;
                        ctx.lineWidth = 0.5;
                    }
                    else {
                        ctx.fillStyle = plotCosmetics.fillStyle;
                        ctx.strokeStyle = plotCosmetics.strokeStyle;
                        ctx.lineWidth = plotCosmetics.borderWidth;
                    }
                    gridSubArr.push(gridElem);
                }

                // reset the batch drawing index
                datasetConfig._batchDrawindex = (datasetObj.JSONData.data && datasetObj.JSONData.data.length - 1) || 0;
                //start drawing the images in batches.
                datasetObj._drawGridArrBatch(gridSubArr, callBack, !datasetConfig.animation.enabled);
            }
            else { // if there is nothing to draw then call the callBack
                callBack && callBack();
            }
        },
        /*
         * Draw the grids of the array together in batch.
         * At the batch end call the call back.
         * Use grid's own image and canvas only.
         * At the end set the drawState of the grids.
         * Draw in batches so that it naver goes for script time out.
         * @param gridArr {Array} - Stores the grid Elements, which has its own indivual images, canvas elements and
         contexts
         * @param callBack {Function} - Function being called at the end of all drawings of the images in the gridArr.
         * @param doNotUpdateImage {Boolean} - Flag to update the visual configurations. If set to true, At every batch
          the images are viusally updated. Once set to false they are shown only if all the drawing is completed. This
          is attained using showAnimation = 0
        */
        _drawGridArrBatch : function (gridArr, callBack, doNotUpdateImage) {
            var cx,
                cy,
                cx1,
                cx2,
                cy1,
                cy2,
                y1,
                y2,
                storeX,
                j,
                gridElem,
                ctx,
                lineCtx,
                element,
                minX,
                xMinValue,
                yMaxValue,
                leftElement,
                lineImage,
                lineCanvas,
                minY,
                maxX,
                maxY,
                image,
                canvas,
                regresionPoints,
                datasetObj = this,
                conf = datasetObj.config,
                chart = datasetObj.chart,
                chartConfig = chart.config,
                chartComponents = chart.components,
                width = chartConfig.canvasWidth,
                datasetConfig = datasetObj.config,
                drawLine = datasetConfig.drawLine,
                plotCosmetics = datasetConfig.plotCosmetics,
                i = datasetConfig._batchDrawindex,
                arr = datasetObj.components.data,
                chunkSize = datasetConfig.chunkSize,
                endIndex = i - chunkSize,
                xAxis = chartComponents.xAxis[0],
                yAxis = chartComponents.yAxis[0],

                radius =  datasetConfig.zoomedRadius,
                xPVR = xAxis.getPVR(),
                yPVR = yAxis.getPVR(),
                regressionStatus = conf.showRegressionLine,
                showYonX,
                regressionLineColor,
                regressionLineThickness,

                //stores the already plotted pixels for caching and performance improvement.
                _store = datasetConfig._store || [],
                // doStroke for the plot is set to TRUE only if there exists a lineWidth or radius is less than 1 pixel
                doStroke = (plotCosmetics.lineWidth || (radius < 1));

            if (regressionStatus) {
                showYonX = conf.showYOnX;
                regressionLineColor = conf.regLineColor;
                regressionLineThickness = conf.regressionLineThickness;
            }

            //clear all the previous visual for the canvas grid and update its cosmetics.
            for (j = 0; j < gridArr.length; j += 1) {
                gridArr[j].ctx.beginPath();
                if (drawLine) {
                    gridArr[j].lineCtx.beginPath();
                }
            }

            endIndex = endIndex <= 0 ? 0 : endIndex; // lower limit is 0

            for (; i >= endIndex; i-=1) {
                element = arr[i] && arr[i].config.setValue;
                //Check for NaN value.
                if (!element || isNaN(element.x) || isNaN(element.y)) {
                    continue;
                }
                //Check which grid is the element lying and draw it in that grid.
                for (j = 0; j < gridArr.length; j += 1) {
                    gridElem = gridArr[j];

                    xMinValue = gridElem.xMinValue;
                    yMaxValue = gridElem.yMaxValue;
                    if ((element.x < gridElem.xMinWPad || element.x > gridElem.xMaxWPad) ||
                        (element.y < gridElem.yMinWPad  || element.y > gridElem.yMaxWPad)) {
                        continue;
                    }

                    ctx = gridElem.ctx;
                    lineCtx = gridElem.lineCtx;

                    cx = mathRound((element.x - xMinValue) * xPVR); // value to pixel conversions
                    cy = mathRound((yMaxValue - element.y) * yPVR); // value to pixel conversions

                    /* Incase there is already a point being drawn with exact same center pixelwise, there is no need to
                     draw again. This can happen when two data points are very closely placed. This caching is done in
                     _store */
                    storeX = _store[cx];

                    if (!storeX) {
                        storeX = _store[cx] = {};
                    }

                    if (!storeX[cy]) {

                        storeX[cy] = true; //set the flag of a circle being drawn at that pixel to TRUE
                        if (drawLine) {
                            leftElement = ((i - 1) >= 0) && arr[i - 1].config.setValue;
                            if (leftElement) {
                                lineCtx.moveTo(mathRound((leftElement.x - xMinValue) * xPVR),
                                    mathRound((yMaxValue - leftElement.y) * yPVR));
                                lineCtx.lineTo(cx, cy);
                            }
                        }
                        if (radius < 1){
                            /* Drawing a dot seemed to have a performance preference to drawing an arc. So if radius
                            turns less than 1 pixel, drawing a dot is prefered. */
                            ctx.moveTo(cx, cy);
                            ctx.lineTo(cx+1, cy);
                        }
                        else {
                            ctx.moveTo(cx+radius, cy);
                            ctx.arc(cx,cy,radius,0,pi2);
                        }
                    }
                }
            }

            //clear all the previous visual for the canvas grid and update its cosmetics.
            for (j = 0; j < gridArr.length; j += 1) {
                gridElem = gridArr[j];
                ctx = gridElem.ctx;
                ctx.fill();
                doStroke && ctx.stroke();
                ctx.closePath();

                if (drawLine) {
                    lineCtx = gridElem.lineCtx;
                    lineCtx.fill();
                    doStroke && lineCtx.stroke();
                    lineCtx.closePath();
                }
            }
            // reset the _batchDrawindex
            datasetConfig._batchDrawindex = i;

            // if there is any remaning drawing to be drawn
            if (i >= 0) {

                if (!doNotUpdateImage) {
                    //update all the grid images for the visual clue.
                    for (j = 0; j < gridArr.length; j += 1){
                        image = gridArr[j].image;
                        canvas = gridArr[j].canvas;
                        // update the src of the images.
                        image.attr({
                            'src': canvas.toDataURL('image/png')
                        });
                        if (datasetConfig.drawLine) {
                            lineImage = gridArr[j].lineImage;
                            lineCanvas = gridArr[j].lineCanvas;
                            // update the src of the images.
                            lineImage.attr({
                                'src': lineCanvas.toDataURL('image/png')
                            });
                        }
                    }
                }

                // store the timers to future cancellation
                (datasetConfig._batchDarwTimers || (datasetConfig._batchDarwTimers = [])).push(
                    setTimeout(function () {
                        datasetObj.chart && datasetObj._drawGridArrBatch(gridArr, callBack, doNotUpdateImage);
                    }, 0));
            }

            // drawing completed
            else {
                // remove the temp store arr
                delete datasetConfig._store;
                //regresion line generalised for all images.
                if (regressionStatus) {
                    regresionPoints = conf.regressionData;
                    // temp code need to remove
                    /*if already the regression analysis is complete, update the
                    drawing part by scaling correctly instead re-calculating*/
                    /*if (!regresionPoints) {
                        regresionPoints = ;
                        datasetObj.components.regressionObj.regresionPoints = regresionPoints;
                    }*/

                    /*0 pixel in the canvas is the origin and no offset */

                    //update all the grid images for the regressionLine.
                    for (j = 0; j < gridArr.length; j += 1) {
                        gridElem = gridArr[j];

                        minX= gridElem.xMinValue;
                        minY = gridElem.yMinValue;
                        maxX = gridElem.xMaxValue;
                        maxY = gridElem.yMaxValue;

                        image = gridElem.image;
                        canvas = gridElem.canvas;
                        ctx = gridElem.ctx;

                        // extend the points to make the regressionLine throughout the canvas.
                        cx1 = ((regresionPoints[0].x - minX) * xPVR);
                        cy1 = ((maxY - regresionPoints[0].y) * yPVR);
                        cx2 = ((regresionPoints[1].x - minX) * xPVR);
                        cy2 = ((maxY - regresionPoints[1].y) * yPVR);
                        y1 = (((cy2 - cy1) * (0 - cx2))/(cx2 - cx1)) + cy2;
                        y2 = (((cy2 - cy1) * (width - cx2))/(cx2 - cx1)) + cy2;
                        ctx.beginPath();
                        ctx.strokeStyle = regressionLineColor;
                        ctx.lineWidth = regressionLineThickness;
                        ctx.moveTo(cx1, cy1);
                        ctx.lineTo(cx2, cy2);
                        ctx.stroke();
                        ctx.closePath();
                    }
                }

                //update all the grid images for the visual clue.
                for (j = 0; j < gridArr.length; j += 1) {

                    gridElem = gridArr[j];

                    image = gridElem.image;
                    canvas = gridElem.canvas;
                    gridElem.drawState = 1; // set the drawState flag as drawn.

                    image.attr({
                        'src': canvas.toDataURL('image/png')
                    });
                    if (drawLine) {
                        lineImage = gridElem.lineImage;
                        lineCanvas = gridElem.lineCanvas;
                        lineImage.attr({
                            'src': lineCanvas.toDataURL('image/png')
                        });
                    }
                }

                if (!datasetObj.tree) {
                    // create the kdtree in a seperate thread
                    setTimeout(function (){
                        datasetObj._buildKdTree();
                    },250);
                }

                // invoke the completion callBack
                callBack && callBack();
            }
        },
        /*
         * Builds the tree structure and store them inside the dataset instance.
         * A temporary cloning of the original data may be required to avoid permannent manipulations in the original
         array
        */
        _buildKdTree: function () {
            var datasetObj = this,
                datasetConfig = datasetObj.config,
                JSONData = datasetObj.JSONData;
            /* Create a replica of the original JSON data to avoid manipulations in the original array. This replica is
            created and destroyed only for the sole purpose of making the tree. Once the tree is made, its deleted and
            is no more required.*/
            datasetConfig._kdPoints = (JSONData.data || []).slice();

            if (!datasetObj.components.kDTree) {
                //Create a new instance of the KdTree class and store its reference in the current instance.
                datasetObj.components.kDTree = new KdTree();
            }

            datasetObj.components.kDTree.buildKdTree(datasetConfig._kdPoints); // Build the tree structure.
            delete datasetConfig._kdPoints; // delete the replicated array.
        },
        /*
         * Its mainly an abstraction that fetches the neighbouring point using the kdTree class instance.
         * @param point {Object} - The x and y- coordinate whose neighbouring point is to be hunted.
         * @return {Object} - The neighbouring point of the input point fetched within that partiuclar dataset.
        */
        getElement: function (point) {
            var datasetObj = this;
            if (datasetObj.components.kDTree) {
                // searches the neighbouring points using the kdtree instance.
                return datasetObj.components.kDTree.getNeighbour(point);
            }
        },

        show: function () {
            var dataSet = this,
                dataSetGraphics = dataSet.graphics,
                container = dataSetGraphics && dataSetGraphics.container;

            dataSet.visible = true;
            dataSet._conatinerHidden = false;
            container.show();
        },

        hide: function () {
            var dataSet = this,
                dataSetGraphics = dataSet.graphics,
                container = dataSetGraphics && dataSetGraphics.container;

            dataSet.visible = false;
            dataSet._conatinerHidden = true;
            container.hide();
        },
        _addLegend: function () {
            var dataSet = this,
                chart = dataSet.chart,
                chartAttr = chart.jsonData.chart,
                conf = dataSet.config,
                JSONData = dataSet.JSONData,
                getFillColor = chart.getFillColor,
                userGivenBorderColor = pluck(JSONData.anchorbordercolor, chartAttr.anchorbordercolor),
                seriesAnchorBorderColor = getFirstColor(pluck(userGivenBorderColor,
                    conf.plotBorderColor)),
                seriesAnchorBorderThickness = pluckNumber(JSONData.anchorborderthickness,
                    chartAttr.anchorborderthickness, userGivenBorderColor ? 1 : 0),
                seriesAnchorBgColor = getFirstColor(pluck(JSONData.anchorbgcolor, JSONData.color,
                    chartAttr.anchorbgcolor,conf.plotColor)),
                seriesAnchorAlpha = pluck(JSONData.anchoralpha, JSONData.alpha, chartAttr.anchoralpha,
                    HUNDREDSTRING),
                seriesAnchorBgAlpha = pluck(JSONData.anchorbgalpha, JSONData.alpha, chartAttr.anchorbgalpha,
                    HUNDREDSTRING),
                lineColorObj = {
                    color: conf.lineColor,
                    alpha: conf.lineAlpha
                },
                //save the cosmetics finally plucked for re-drawing them in future
                plotCosmetics = conf.plotCosmetics = {
                    'fillStyle': getFillColor(seriesAnchorBgColor,((seriesAnchorAlpha * seriesAnchorBgAlpha) / 100)),
                    'strokeStyle': getFillColor(seriesAnchorBorderColor,seriesAnchorAlpha),
                    'borderWidth': seriesAnchorBorderThickness,
                    lineWidth: conf.lineThickness,
                    'lineStrokeStyle': toRaphaelColor(lineColorObj)
                };
            dataSet.legendItemId = chart.components.legend.addItems(dataSet, dataSet.legendInteractivity, {
                enabled: conf.includeInLegend,
                type : dataSet.type,
                fillColor : plotCosmetics.fillStyle,
                strokeColor: plotCosmetics.strokeStyle,
                anchorSide: 2,
                strokeWidth: conf.anchorBorderThickness,
                label : getFirstValue(dataSet.JSONData.seriesname)
            });
        },
        /*
         * Sets the configurations for the set level attributes.
        */
        _setConfigure: function () {
            var i,
                config,
                dataObj,
                setData,
                setValue,
                toolText,
                toolTipValue,
                macroIndices,
                parserConfig,
                formatedVal,
                formatedValX,
                setDisplayValue,
                infMin = -Infinity,
                infMax = +Infinity,
                yMax = infMin,
                yMin = infMax,
                xMin = infMax,
                xMax = infMin,
                dataSet = this,
                dataStore = dataSet.components.data || (dataSet.components.data = []),
                chart = dataSet.chart,
                chartComponents = chart.components,
                parseUnsafeString = lib.parseUnsafeString,
                conf = dataSet.config,
                JSONData = dataSet.JSONData,
                //chart level JSON format
                chartAttr = chart.jsonData.chart,
                setDataArr = JSONData.data || [],
                dataSetLen = setDataArr.length,
                numberFormatter = chartComponents.numberFormatter,
                yAxisName = parseUnsafeString(chartAttr.yaxisname),
                xAxisName = parseUnsafeString(chartAttr.xaxisname),
                lineDashed = conf.lineDashed,
                lineDashStyle = conf.lineDashStyle,
                parentYAxis = conf.parentYAxis,
                tooltipSepChar = conf.toolTipSepChar,
                seriesname = conf.seriesname;
            // Iterate through all set level data
            for (i = 0; i < dataSetLen; i += 1) {
                setData = setDataArr[i];
                dataObj = dataStore[i] || (dataStore[i] = {});
                config = dataObj.config || (dataObj.config = {});
                //The set data is given: {x: <Number>, y : <Number>}
                config.setValue = setValue = {
                    x: numberFormatter.getCleanValue(setData.x),
                    y: numberFormatter.getCleanValue(setData.y),
                    index: i
                };
                xMax = mathMax(xMax, setValue.x);
                xMin = mathMin(xMin, setValue.x);
                yMax = mathMax(yMax, setValue.y);
                yMin = mathMin(yMin, setValue.y);
                //update the regression calulations.
                conf.showRegressionLine && this.pointValueWatcher(setValue.x, setValue.y, conf.regressionObj);
                config.setLink  = pluck(setData.link);
                // Parsing the anchor properties for set level
                config.anchorProps = this._parseAnchorProperties(i);
                config.showValue = pluckNumber(setData.showvalue, conf.showValues);
                // Dashed, color and alpha configuration in set level is only for line chart
                config.dashed = pluckNumber(setData.dashed, lineDashed);
                config.color = pluck(setData.color, conf.lineColor);
                config.alpha = pluck(setData.alpha, conf.lineAlpha);

                config.dashStyle = config.dashed ? lineDashStyle : 'none';
                config.toolTipValue = toolTipValue = numberFormatter.dataLabels(setValue.y, parentYAxis);
                config.setDisplayValue = setDisplayValue = parseUnsafeString(setData.displayvalue);
                formatedVal = (config.formatedVal = pluck(setData.toolTipValue,
                    numberFormatter.dataLabels(setValue.y, parentYAxis)));
                formatedValX = numberFormatter.xAxis(setValue.x);
                config.displayValue = pluck(setDisplayValue, toolTipValue);
                config.setTooltext = lib.getValidValue(parseUnsafeString(pluck(setData.tooltext,
                    conf.plotToolText)));
                // Initial tooltext parsing
                if (!conf.showTooltip) {
                    toolText = false;
                }
                else if (config.setTooltext !== undefined) {
                    macroIndices = [4,5,6,7,8,9,10,11];
                    parserConfig = {
                        yaxisName: yAxisName,
                        xaxisName: xAxisName,
                        yDataValue: formatedVal,
                        xDataValue: formatedValX
                    };
                    toolText = parseTooltext(config.setTooltext, macroIndices, parserConfig, setData, chartAttr,
                        JSONData);
                }
                //determine the default tooltext then.
                else {
                    if (formatedVal === null) {
                        toolText = false;
                    }
                    else {
                        toolText = seriesname ? seriesname + tooltipSepChar : BLANKSTRING;
                        toolText += setValue.x ? formatedValX + tooltipSepChar : BLANKSTRING;
                        toolText += toolTipValue;
                    }
                }

                config.toolText = toolText;
                if (!dataObj) {
                    dataObj = dataStore[i] = {
                        graphics : {}
                    };
                }
                else if (!dataObj.graphics) {
                    dataStore[i].graphics = {};

                }
                //parse the hover cosmetics.
                config.hoverEffects = this._parseHoverEffectOptions(dataObj);
                config.anchorProps.isAnchorHoverRadius = config.hoverEffects.anchorRadius;
            }
            conf.xMax = xMax;
            conf.xMin = xMin;
            conf.yMin = yMin;
            conf.yMax = yMax;
            //augment the regression line to be a line series.
            if (conf.showRegressionLine) {
                //get a line series.
                conf.regressionData = this.getRegressionLineSeries(conf.regressionObj, conf.showYOnX, dataSetLen);
            }
            dataSet.ErrorValueConfigure && dataSet.ErrorValueConfigure();

        }
    }, 'Scatter']);

    //Adding the custom tool symbol
    R.addSymbol({

        zoomInIcon: function (x, y, radius) {
            var icoX = x - radius * 0.2,
                icoY = y - radius * 0.2,
                rad = radius * 0.8,
                startAngle = R.rad(43),
                // to prevent cos and sin of start and end from becoming equal on 360 arcs
                endAngle = R.rad(48),
                startX = icoX + rad * mathCos(startAngle),
                startY = icoY + rad * mathSin(startAngle),
                endX = icoX + rad * mathCos(endAngle),
                endY = icoY + rad * mathSin(endAngle),
                handleHeight = radius, // the height of the handle
                handAngle = R.rad(45),
                handX1 = startX + handleHeight * mathCos(handAngle),
                handY1 = startY + handleHeight * mathSin(handAngle),
                handX2 = endX + handleHeight * mathCos(handAngle) - 1,
                handY2 = endY + handleHeight * mathSin(handAngle) - 1,
                semiW = 2;

            return ['M', startX , startY,
                    'A', rad, rad, 0, 1, 0, endX, endY, 'Z', 'M', startX + 1 , startY + 1 , 'L',
                    handX1, handY1, handX2, handY2, endX + 1,
                    endY + 1, 'Z', 'M', icoX - semiW, icoY, 'L', icoX + semiW,
                    icoY, 'Z','M', icoX, icoY - semiW, 'L', icoX ,
                    icoY+semiW, 'Z'];
        },

        zoomModeIcon: function (cx,cy,radius){
            var x = cx,
                path = [],
                y = cy,
                icoX = x - radius * 0.2,
                icoY = y - radius * 0.2,
                rad = radius * 0.8,
                startAngle = R.rad(43),
                // to prevent cos and sin of start and end from becoming equal on 360 arcs
                endAngle = R.rad(48),
                startX = icoX + rad * mathCos(startAngle),
                startY = icoY + rad * mathSin(startAngle),
                endX = icoX + rad * mathCos(endAngle),
                endY = icoY + rad * mathSin(endAngle),
                handleHeight = radius, // the height of the handle
                handAngle = R.rad(45),
                handX1 = startX + handleHeight * mathCos(handAngle),
                handY1 = startY + handleHeight * mathSin(handAngle),
                handX2 = endX + handleHeight * mathCos(handAngle) - 1,
                handY2 = endY + handleHeight * mathSin(handAngle) - 1,
                semiW = 2;

            path = path.concat(['M', startX , startY,
                'A', rad, rad, 0, 1, 0, endX, endY, 'Z', 'M', startX + 1 , startY + 1 , 'L',
                handX1, handY1, handX2, handY2, handX2+1, handY2-1, handX2+1.5, handY2+1.5,  handX2-1,
                handY2+1,handX2, handY2,
                endX + 1,
                endY + 1, 'Z', 'M', icoX - semiW, icoY, 'L', icoX + semiW,
                icoY, 'Z','M', icoX, icoY - semiW, 'L', icoX ,
                icoY+semiW, 'Z']);

            return path;
        },

        panModeIcon: function (cx,cy,radius){
            var x = cx - (45/4),
                y = cy;
            //draw the pan(move) icon.
            x = cx;
            radius *= 2.5;

            return [].concat(['M', (x - (radius/16)) , (y - (radius/8)),'L',(x + (radius/16)) ,
                (y - (radius/8)),'L', (x + (radius/16)) , (y - (radius/3.2)), 'L',(x + (6*radius/32)) ,
                (y - (10*radius/32)),'L', x , (y - radius/2),'L',(x - (6*radius/32)) , (y - (10*radius/32)),
                'L',(x - (radius/16)) , (y - (radius/3.2)),'Z',

            'M', (x + (4*radius/32)) , (y-(2*radius/32)),'L',(x + (10*radius/32)) , (y-(2*radius/32)),'L',
            (x + (10*radius/32)) , (y-(6*radius/32)), 'L',(x + (16*radius/32)) , y,'L',
            (x+(10*radius/32)) , (y+(6*radius/32)),'L',(x + (10*radius/32)) , (y+(2*radius/32)),'L',
            (x + (4*radius/32)) , (y+(2*radius/32)),'Z',

            'M', (x + (2*radius/32)) , (y + (5*radius/32)),'L',(x + (2*radius/32)) , (y+(10*radius/32)),'L',
            (x + (6*radius/32)) , (y+(10*radius/32)), 'L',x , (y+(16*radius/32)),'L',
            (x-(6*radius/32)) , (y+(10*radius/32)),'L',(x - (2*radius/32)) , (y+(10*radius/32)),'L',
            (x - (2*radius/32)) ,(y+(5*radius/32)),'Z',

            'M', (x - (4*radius/32)) , (y - (2*radius/32)),'L',(x - (10*radius/32)) , (y - (2*radius/32)),
            'L', (x - (10*radius/32)) , (y-(6*radius/32)), 'L',(x-(16*radius/32)) , y,'L',
            (x-(10*radius/32)) , (y+(6*radius/32)),'L',(x - (10*radius/32)) , (y+(2*radius/32)),'L',
            (x - (4*radius/32)) , (y+(2*radius/32)),'Z']);
        }
    });
}]);


}));
