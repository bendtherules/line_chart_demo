
(function (factory) {
    if (typeof module === 'object' && typeof module.exports !== "undefined") {
        module.exports = factory;
    } else {
        factory(FusionCharts);
    }
}(function (FusionCharts) {

/**!
 * @license FusionCharts JavaScript Library - Tree Map Chart
 * Copyright FusionCharts Technologies LLP
 * License Information at <http://www.fusioncharts.com/license>
 *
 * @version 3.12.0
 */


/**
 * @private
 * @module fusioncharts.renderer.javascript.treemap
 * @export fusioncharts.treemap.js
 */

FusionCharts.register('module', ['private', 'modules.renderer.js-treemap', function () {

    var afAPICreator,
        algorithmFactoryCreator,
        treeOpt,
        containerManagerCreator,
        global = this,
        lib = global.hcLib,
        chartAPI = lib.chartAPI,
        math = Math,
        mathMax = math.max,
        mathRound = math.round,
        mathTan = math.tan,
        mathMin = math.min,
        pi = math.PI,
        fcExtend = lib.extend2,
        win = global.window,
        parsexAxisStyles = lib.parsexAxisStyles,
        R = lib.Raphael,
        graphics = lib.graphics,
        convertColor = graphics.convertColor,
        getLightColor = graphics.getLightColor,
        raiseEvent = global.raiseEvent,
        pluckNumber = lib.pluckNumber,
        pluck = lib.pluck,
        each = lib.each,
        MOTHER_OF_ALL_COLOR = 'E5E5E5',
        ROLLOVER = 'DataPlotRollOver',
        ROLLOUT = 'DataPlotRollOut',
        BLANKSTRING = lib.BLANKSTRING,
        userAgent = win.navigator.userAgent,
        isIE = /msie/i.test(userAgent) && !win.opera,
        TRACKER_FILL = 'rgba(192,192,192,' + (isIE ? 0.002 : 0.000001) + ')', // invisible but clickable,
        creditLabel = false && !lib.CREDIT_REGEX.test(win.location.hostname),
        plotEventHandler = lib.plotEventHandler,
        schedular = lib.schedular,
        preDefStr = lib.preDefStr,
        DEFAULT_CURSOR = preDefStr.DEFAULT,
        POINTER = 'pointer';

    // Icon drawing at toolbar. Back and reset button.
    R.addSymbol({
        backIcon: function (x, y, radius) {
            var rad = radius - 1,
                x1 = x,
                y1 = (y - rad),

                x2 = (x - rad),
                y2 = y,

                x3 = x,
                y3 = (y + rad),

                x4 = x3,
                y4 = (y3 - (rad / 2)),

                x5 = x4 + rad,
                y5 = y4,

                x6 = x5,
                y6 = y5 - rad,

                x7 = x5 - rad,
                y7 = y6;

            return [
                'M',
                x1, y1,
                'L',
                x2, y2,
                x3, y3,
                x4, y4,
                x5, y5,
                x6, y6,
                x7, y7,
                'Z'
            ];
        },

        homeIcon: function (x, y, radius) {
            var rad = radius - 1,
                len = rad * 2,
                x1 = x,
                y1 = (y - rad),

                x2 = (x - rad),
                y2 = y,

                x3 = (x2 + (len / 6)),
                y3 = y2,

                x4 = x3,
                y4 = (y + rad),

                x5 = (x4 + (len / 4)),
                y5 = y4,

                x6 = x5,
                y6 = (y5 - rad / 2),

                x7 = (x6 + (len / 6)),
                y7 = y6,

                x8 = x7,
                y8 = (y6 + rad / 2),

                x9 = (x7 + (len / 4)),
                y9 = y8,

                x10 = x9,
                y10 = (y9 - rad),

                x11 = (x9 + (len / 6)),
                y11 = y10;

            return [
                'M',
                x1, y1,
                'L',
                x2, y2,
                x3, y3,
                x4, y4,
                x5, y5,
                x6, y6,
                x7, y7,
                x8, y8,
                x9, y9,
                x10, y10,
                x11, y11,
                'Z'
            ];
        }
    });

    /*
     * Normalize the color code. It takes care of all the basic checks. Like if the '#' is missing from the
     * code, if code is passed at all. If the code is not passed it returns the mother_of_all_color :-D
     */
    function normalizeColorCode (hex) {
        if (!hex) {
            // Returns the default color since no code is passed
            return '#' + MOTHER_OF_ALL_COLOR;
        }

        return hex.replace(/^#*/, '#');
    }

    /*
     * Singular node in a tree. A node consists of label and value associated with it.
     * One single node can have two references. One to the children and one to the parent.
     * Using this references the complete tree can be traveresd.
     * If the the node is a leaf then reference to children (next) would be undefined.
     * If the node is the root node the refernce to the parent would be undefined.
     * @param label {String} - label of the node. Usually a catagory or specific item.
     * @param value {Integer} - value of the node.
     * @constructor
     */
    function TreeNode (label, value, colorValue) {
        // Currently this label is unique (which should be the case ideally). This label serves the purpose of id.
        this.label = label;
        this.value = parseFloat(value, 10);
        this.colorValue = parseFloat(colorValue, 10);
        // Refernce to child nodes. The tree here is a generic tree. Hence can have any number of child, and is a array.
        this.next = undefined;
        // Reference to the parent of the current node. Single treenode element, since only one node can be parent.
        this.prev = undefined;
        // Stores the meta information specific to set level like back ground color
        this.meta = {};
    }

    TreeNode.prototype.constructor = TreeNode;
    /*
     * Fetches the css configurations for the node
    */
    TreeNode.prototype.getCSSconf = function () {
        return this.cssConf;
    };
    /*
     * Fetches the path wrt the global root node.
    */
    TreeNode.prototype.getPath = function () {
        return this.path;
    };
    /*
     * Sets the path wrt the global root.
    */
    TreeNode.prototype.setPath = function () {
        var node = this,
            parentNode = node.getParent();
        node.path = (parentNode ? parentNode.getPath() : []).concat(node);
    };

    /*
     * Adds a child to the existing list of children of the current node.
     * Link the child nodes with the ancestors. This linking is done one at a time.
     * Since the tree is a generic one, the links are saved as sorted array.
     * @param ref {TreeNode} - reference to the next child
     * @return {Array.<TreeNode>} - Array of all children
     */
    TreeNode.prototype.addChild = function (ref) {
        if (ref instanceof TreeNode) {
            // Add at the end of the existing child. If no child is present create a list.
            this.next = this.next || [];
            [].push.call(this.next, ref);
            // Set the parent as well
            ref.setParent(this);
        }

        // Return the list of updated child
        return this.next;
    };

    /*
     * Get all the children of the current node.
     * @return {Array.<TreeNode>} - Array of all children
     */
    TreeNode.prototype.getChildren = function () {
        return this.next;
    };

    /*
     * add children to a specific node(parent node in this context) to a specified index.
     * Can be a multiple child insertions at a time.
     * Default index remains at the end of the object.
    */
    TreeNode.prototype.addChildren = function (newNode, index) {
        var parentNode = this,
            childrenArr = parentNode.getChildren() || (parentNode.next = []),
            len = childrenArr.length;
        // default place in the end
        if (!index) {
            index = len - 1;
        }
        // applying extreme conditions.
        index = (index > (len - 1)) ? (len - 1) : ((index < 0) ? 0 : index);
        childrenArr.splice(index, 0, newNode);
        newNode.setParent(this);
    };

    /*
     * Fetch the depth of the current node.
     * @return {Number} - Depth of the node element in the tree structure.
    */
    TreeNode.prototype.getDepth = function () {
        return this.meta.depth;
    };
    /*
     * Check if the node is a leaf node.
     * @param maxDepth {Number} -  Depth Traversal restrictions.
     * @return {boolean} - If the node is a leaf node keeping the imposed restrictions intact.
    */
    TreeNode.prototype.isLeaf = function (maxDepth) {
        var node = this;
        //if no depth restrictions being imposed, only node.next is used to determine its virginity
        return ((maxDepth ? (node.getDepth() < maxDepth) : true) && node.next);
    };

    /*
     * Set a parent node of the current node
     * @param ref {TreeNode} - reference to the next child
     * @return {TreeNode} - Current node with updated parent reference.
     */
    TreeNode.prototype.setParent = function (ref) {
        if (ref instanceof TreeNode) {
            this.prev = ref;
        }
        return this;
    };

    /*
     * Get siblings' count of the current node
     * @return {Integer} - sibling count including the current node
     */
    TreeNode.prototype.getSiblingCount = function (side) {
        var parent,
            counter = 0,
            node = this,
            currentSibling = node;

        if (!(this instanceof TreeNode)) {
            // IF the instance is not of TreeNode which should not be case at any given point time.
            return;
        }

        // Traverse up the parent node, so that we get the reference to list of children
        parent = node.getParent();
        //get sibling count specific to a particular side.
        if (side) {
            while (currentSibling) {
                currentSibling = currentSibling.getSibling(side);
                if (currentSibling) {
                    counter += 1;
                }
            }
            return counter;
        }
        if (parent) {
            // If parent is present, which is not the case for the root node, return the count of children.
            // Which in turns is the count of sibling.
            return parent.getChildren().length;
        }
    };

    /*
     * Get the parent of the current node.
     * @return {TreeNode} - parent
     */
    TreeNode.prototype.getParent = function () {
        return this.prev;
    };

    /*
     * Get the label of the current node.
     * @return {String} - label
     */
    TreeNode.prototype.getLabel = function () {
        return this.label;
    };

    /*
     * Get the value of the current node.
     * @return {Integer} - value
     */
    TreeNode.prototype.getValue = function () {
        return this.value;
    };

    /*
     * Sets the value of the current node.
     * @param value {Integer} - The updated value for the node.
     * @param incermental {Boolean} - A flag to update the value incrementally and not on absolute scale.
     * @return {Integer} - value
     */
    TreeNode.prototype.setValue = function (value, incremental) {
        var node = this;
        if (incremental) {
            node.value += value;
        }
        else {
            node.value = value;
        }
    };

    /*
     * Get the colorValue of the current node.
     * @return {Integer} - value
     */
    TreeNode.prototype.getColorValue = function () {
        return this.colorValue;
    };

    /*
     * Get the immediate sibling of the current node. The sibling can be retrieved either from the left side or right.
     * @param  side {Enum} - specifies the side from which sibling to be retrieved. Can be either 'left' or 'right'
     * @return {TreeMap} - the sibling of the specified side
     */
    TreeNode.prototype.getSibling = function (side) {
        var nSideStr = side.toLowerCase(),
            parent = this.getParent(),
            label = this.getLabel(),
            children,
            index,
            tLabel,
            child;

        if (!parent) {
            // If the parent is not present, means the node is root node. Hence no sibling present.
            return;
        }

        // Retrieves all the sibling
        children = parent.getChildren();

        // Searches node by label as label name is most likely to be same in one category.
        for (index = 0; index < children.length; index++) {
            child = children[index];
            tLabel = child.getLabel();

            if (tLabel === label) {
                switch (nSideStr) {
                    case 'left':
                        return children[index - 1];

                    case 'right':
                        return children[index + 1];
                }
            }
        }
        return;
    };

    /*
     * Set the meta information. Like which is specific to a set label
     * @param key {String} - the key of the set label attr like color
     * @param value {String | Object} - the value of the key
     */
    TreeNode.prototype.setMeta = function (key, value) {
        this.meta[key] = value;
    };

    /*
     * Set the depth information.
     * @param depth {String} - The level at which the node is present in reference to the tree.
     */
    TreeNode.prototype.setDepth = function (depth) {
        this.meta.depth = depth;
    };

    /*
     * Get the meta information by key or completely. If the key is passed it returns back the value or the complete
     * meta information.
     * @param key {String} - the key of the set label attr like color
     * @return {String | Object | undefined} - the value of the key or if the key is not passed the complete meta obj.
     */
    TreeNode.prototype.getMeta = function (key) {
        if (!key) {
            return this.meta;
        }

        return this.meta[key];
    };

    /*
     * This takes reference of all the leaf nodes, sort it and place it in a logical bucket with pointers
     * to remember the state. This is only done when legend is enabled and in the beginning of the data traversal.
     * When the legend is dragged, the nodes from bucket are traversed and desired operation is performed on the nodes
     * which are outliers. Currently the operation being changing the style only.
     * For the following tree
     *          a, 10
     *            |
     *       |----|----|
     *       |         |
     *      b, 3     c, 7
     *                 |
     *         |-------|-------|
     *         |       |       |
     *        d, 4    e, 2    f, 1
     *
     * the bucket will be an ascending ordered array with ref pointers
     *  -------------------------------------------
     * | refOf(f) | refOf(e) | refOf(v) | refOf(d) |
     *  -------------------------------------------
     *      ^                                 ^
     * statePointerLow                  statePointerHigh
     *
     */
    function Bucket () {
        this._b = [];
        this._css = undefined;
        // Default function to be operated on outliers.
        this.rangeOurEffectApplyFn = function () { };

        // statePointers are simple object that remembers state. It has two properties which get updated when the
        // legend is dragged. the .value property is the value which the pointer is detecting. This value might not be
        // the one from the array elements. It can be any number between the first and last range. The .index property
        // is the index of the immediate element that just surpasses the value of .value

        // This initially points to the first element of the array. Since the array is sorted, this in turns points
        // the lowest value node. When the slider is dragged the lower pointer moves accordingly based on the value of
        // legend slider. Any nodes that resides left side of the slider are outliers.
        this.statePointerLow = {
            value: undefined,
            index: undefined
        };

        // This initially points to the last element of the array. Since the array is sorted, this in turns points
        // the highest value node. When the slider is dragged the higher pointer moves accordingly based on the value of
        // legend slider. Any nodes that resides right side of the slider are outliers.
        this.statePointerHigh = {
            value: undefined,
            index: undefined
        };
    }

    Bucket.prototype.constructor = Bucket;

    /*
     * Resets the iteration state pointers, so that it starts from the initial position
     */
    Bucket.prototype.resetPointers = function () {
        this.statePointerLow = {
            value: undefined,
            index: undefined
        };

        this.statePointerHigh = {
            value: undefined,
            index: undefined
        };
    };

    /*
     * Sets what operation to be performed if a node remains in the outlier area.
     * @param css {Object} - the style object to be applied
     * @param rangeOurEffectApplyFn {Function} - the function to be executed. This function is called with the
     *                                          outlier node and css.
     */
    Bucket.prototype.setRangeOutEffect = function (css, rangeOurEffectApplyFn) {
        this._css = css;
        this.rangeOurEffectApplyFn = rangeOurEffectApplyFn;
    };

    /*
     * Place node in the bucket cumulatively in sorted manner. This use binary search and insert policy.
     * @param node {TreeNode} - node to be inserted. Make sure the node is leaf. This does not check if the node passed
     *                          is leaf node or not.
     */
    Bucket.prototype.addInBucket = function (node) {
        var arr = this._b,
            val = node.getColorValue(),
            minIndex = 0,
            maxIndex = arr.length - 1,
            targetIndex;

        if(!val){
            return;
        }

        // Get position where the current node will fit in the ascending array. This position is based on the value of
        // the node.
        targetIndex = (function () {
            var _i, _elem, _elemVal;

            // Initially the whole array is the window. And continue until the window is shrinked to zero.
            while (minIndex <= maxIndex) {
                // Apply sort of divide and conquer to get the middle index (floored if the index is not integer). This
                // becomes the pivot element
                targetIndex = _i = (minIndex + maxIndex) / 2 | 0;

                _elem = arr[_i];
                _elemVal = _elem.getColorValue();

                if (_elemVal < val) {
                    // If value of the element to be entered is greater than the current calculated pivot element value
                    // shift the left hand of the window starting from the pivot element and recalculate.
                    minIndex = _i + 1;
                } else if (_elemVal > val) {
                    // If value of the element to be entered is less than the current calculated pivot element value
                    // shift the right hand of the window starting from the pivot element and recalculate.
                    maxIndex = _i - 1;
                } else {
                    // Both are same. Return the current position.
                    return _i;
                }
            }
            // Return the index which is ready for use in splice
            return ~ maxIndex;
        })();

        // Add the element at that location
        arr.splice(Math.abs(targetIndex), 0, node);
    };

    /*
     * Moves the lowerStatePointer and perform operation on the outliers which resides at left side of the pointer.
     * @param value {Integer} - value according to which the lowerStatePointer would be moved.
     */
    Bucket.prototype.moveLowerShadePointer = function (value) {
        var arr = this._b,
            index,
            bucketElem,
            _val,
            statePtr = this.statePointerLow,
            stateIndex = statePtr.index,
            stateVal = statePtr.value,
            pointerAheadFlag = false;

        // Assign a initial pointer state if legend is dragged for the first time otherwise resume the previous state
        index = stateIndex = stateIndex !== undefined ? stateIndex : 0;
        stateVal = stateVal !== undefined ? stateVal : Number.NEGATIVE_INFINITY;

        if (value === stateVal) {
            // Donot move the pointer if the last state value and the current one is same.
            return;
        }

        if (stateVal <= value) {
            // If the legend is moved further right from the the last position.
            while (true) {
                // Iterate over the new changed range to find the outliers.
                bucketElem = arr[index++];
                _val = bucketElem ? bucketElem.getColorValue() : 0;

                if( value < _val || !bucketElem) {
                    // When no more outliers are to be iterated, break
                    break;
                }

                // A flag to bring the pointer back to its correct position.
                pointerAheadFlag = true;
                // Apply style and execute the operation on outliers
                bucketElem.rangeOutEffect = this._css;
                this.rangeOurEffectApplyFn.call(bucketElem, this._css);
            }

            // Fix the pointer position
            index = pointerAheadFlag ? index - 2 : index - 1;
        } else {
            // If the legend is moved further left from the the last position.
            while (true) {
                // Remove some elements from outlier region. i.e. rollback the changes done when they were in outliers.
                bucketElem = arr[index--];
                _val = bucketElem ? bucketElem.getColorValue() : 0;

                if (value >= _val || !bucketElem) {
                    break;
                }

                // Restore the previous style which was in use before it had become a outliers
                bucketElem.cssConf = bucketElem.cssConf || {};

                // A flag to bring the pointer back to its correct position.
                pointerAheadFlag = true;
                delete bucketElem.rangeOutEffect;
                // Forcefully made the opacity 1. This is against the guard that if the opacity is changed through
                // configuration during legend dragging
                bucketElem.cssConf.opacity = 1;
                this.rangeOurEffectApplyFn.call(bucketElem, bucketElem.cssConf);
            }

            // Fix the pointer position
            index = pointerAheadFlag ? index + 2 : index + 1;
        }

        // Saves the current state
        statePtr.index = index;
        statePtr.value = value;
    };

    /*
     * Moves the higherStatePointer and perform operation on the outliers which resides at right side of the pointer.
     * @param value {Integer} - value according to which the higherStatePointer would be moved.
     */
    Bucket.prototype.moveHigherShadePointer = function (value) {
        var arr = this._b,
            length = arr.length,
            index,
            bucketElem,
            _val,
            statePtr = this.statePointerHigh,
            stateIndex = statePtr.index,
            stateVal = statePtr.value,
            pointerAheadFlag = false;

        // Assign a initial pointer state if legend is dragged for the first time otherwise resume the previous state
        index = stateIndex = stateIndex !== undefined? stateIndex : length - 1;
        stateVal = stateVal !== undefined ? stateVal : Number.POSITIVE_INFINITY;

        if (value === stateVal) {
            // Donot move the pointer if the last state value and the current one is same.
            return;
        }

        if (stateVal > value) {
            // If the legend is moved further left from the the last position.
            while (true) {
                // Iterate over the new changed range to find the outliers.
                bucketElem = arr[index--];
                _val = bucketElem ? bucketElem.getColorValue() : 0;

                if (value >= _val || !bucketElem) {
                    // When no more outliers are to be iterated, break
                    break;
                }

                // A flag to bring the pointer back to its correct position.
                pointerAheadFlag = true;
                // Apply style and execute the operation on outliers
                bucketElem.rangeOutEffect = this._css;
                this.rangeOurEffectApplyFn.call(bucketElem, this._css);
            }
            // Fix the pointer position
            index = pointerAheadFlag ? index + 2 : index + 1;
        } else {
            // If the legend is moved further right from the the last position.
            while (true) {
                // Remove some elements from outlier region. i.e. rollback the changes done when they were in outliers.
                bucketElem = arr[index++];
                _val = bucketElem ? bucketElem.getColorValue() : 0;

                if (value < _val || !bucketElem ) {
                    break;
                }

                // Restore the previous style which was in use before it had become a outliers
                bucketElem.cssConf = bucketElem.cssConf || {};

                // A flag to bring the pointer back to its correct position.
                pointerAheadFlag = true;
                delete bucketElem.rangeOutEffect;
                // Forcefully made the opacity 1. This is against the guard that if the opacity is changed through
                // configuration during legend dragging
                bucketElem.cssConf.opacity = 1;
                this.rangeOurEffectApplyFn.call(bucketElem, bucketElem.cssConf);
            }
            // Fix the pointer position
            index = pointerAheadFlag ? index - 2 : index - 1;
        }

        // Saves the current state
        statePtr.index = index;
        statePtr.value = value;
    };

    chartAPI('treemap', {
        friendlyName: 'TreeMap',
        standaloneInit: true,
        hasGradientLegend: true,
        creditLabel: creditLabel,
        defaultDatasetType: 'treemap',
        enableMouseOutEvent: true,
        applicableDSList: {
            'treemap': true
        },
        _mouseEvtHandler: function (e) {
            var //type = e.type,
                data = e.data,
                chart = data.chart,
                mouseTracker = data.mouseTracker,
                oriEvent = e.originalEvent,
                chartConfig = chart.config,
                canvasLeft = chartConfig.canvasLeft,
                canvasRight = chartConfig.canvasRight,
                canvasBottom = chartConfig.canvasBottom,
                canvasTop = chartConfig.canvasTop,
                datasets = chartConfig.datasetOrder || chart.components.dataset,
                coordinate = lib.getMouseCoordinate(chart.linkedItems.container, oriEvent, chart),
                chartX = coordinate.chartX,
                chartY = coordinate.chartY,
                dataset,
                hoveredInfo,
                pointFound = false,
                i = datasets.length,
                j,
                l,
                MOUSEOUT = 'mouseout',
                derivedEvensInfo,
                _lastDatasetIndex = mouseTracker._lastDatasetIndex,
                _lastPointIndex = mouseTracker._lastPointIndex;

            // @todo we have to implement this for charts with more than one canvas like candle stick

            // if inside the canvas
            if (chartX > canvasLeft && chartX < canvasRight && chartY > canvasTop && chartY < canvasBottom ||
                chart.config.plotOverFlow) {
                // @todo make sure the datasets are as per their z-order
                while (i-- && !pointFound) {
                    dataset = datasets[i];
                    if (dataset) {
                        hoveredInfo = dataset._getHoveredPlot && dataset._getHoveredPlot(chartX, chartY);
                        if (hoveredInfo && hoveredInfo.hovered) {
                            pointFound = true;
                            hoveredInfo.datasetIndex = i;
                            derivedEvensInfo = mouseTracker._getMouseEvents(e, hoveredInfo.datasetIndex,
                                hoveredInfo.pointIndex);
                        }
                    }
                }
            }
            // @todo instead of sending event names, create a event object of that type and send it

            // fire out on last hovered plot
            if ((!pointFound || (derivedEvensInfo && derivedEvensInfo.fireOut)) && _lastDatasetIndex !== undefined) {
                // delete stored last ds details
                delete mouseTracker._lastDatasetIndex;
                delete mouseTracker._lastPointIndex;
                datasets[_lastDatasetIndex] && datasets[_lastDatasetIndex]._firePlotEvent &&
                    datasets[_lastDatasetIndex]._firePlotEvent(MOUSEOUT, _lastPointIndex, e);

                // @todo scope to have sticky tracked tooltip
            }
            // fire remaining events
            if (pointFound) {
                l = derivedEvensInfo.events && derivedEvensInfo.events.length;
                // store the index of the hovered DS and plot
                mouseTracker._lastDatasetIndex = hoveredInfo.datasetIndex;
                _lastPointIndex = mouseTracker._lastPointIndex = hoveredInfo.pointIndex;
                for (j = 0; j < l; j += 1) {
                    dataset && dataset._firePlotEvent && dataset._firePlotEvent(derivedEvensInfo.events[j],
                        _lastPointIndex, e);
                }
            }
        },
        /*
         * Remove a node from the specified path.
         * tree {Object} - A subtree or even a single node
         * path {Array} - Specify the position of the node to be removed wrt the root node for the tree. The last
         value in path here denotes the insertion point of the tree. Elements insertion orders have a visual effect on
         the slice and dice algorithims.
         * draw {Boolean} - A flag when set to false, will not update the visual after the removal.
        */
        addData: function () {
            var algorithmFactory = this._ref.algorithmFactory,
                args = Array.prototype.slice.call(arguments, 0);
            args.unshift('addData');
            // attaching the data cleaning function for applying number formatting
            args.unshift(this._getCleanValue());
            algorithmFactory.realTimeUpdate.apply(this, args);
        },
        /*
         * Remove a node from the specified path.
         * path {Array} - Specify the position of the node to be removed wrt the root node for the tree.
         * draw {Boolean} - A flag when set to false, will not update the visual after the removal.
        */
        removeData: function () {
            var algorithmFactory = this._ref.algorithmFactory,
                args = Array.prototype.slice.call(arguments, 0);
            args.unshift('deleteData');
            // attaching the data cleaning function for applying number formatting
            args.unshift(this._getCleanValue());
            algorithmFactory.realTimeUpdate.apply(this, args);
        },

        _createToolBox: function () {
            var iapi = this,
                toolBox,
                toolBoxAPI,
                group,
                Symbol,
                backSymbol,
                homeSymbol,
                components = iapi.components,
                chartMenuBar = components.chartMenuBar,
                actionBar = components.actionBar;

            /* Do not reconfigure the toolbox if its already drawn. This flag is set falsy on each time configurations
            are updated. */
            if (chartMenuBar && chartMenuBar.drawn || actionBar && actionBar.drawn) {
                return;
            }
            chartAPI.mscartesian._createToolBox.call(iapi);

            toolBox = components.tb;
            toolBoxAPI = toolBox.getAPIInstances(toolBox.ALIGNMENT_HORIZONTAL);
            Symbol = toolBoxAPI.Symbol;
            group = (components.chartMenuBar || components.actionBar).componentGroups[0];

            backSymbol = new Symbol('backIcon', false, (toolBox.idCount = toolBox.idCount || 0, toolBox.idCount++),
                toolBox.pId);
            homeSymbol = new Symbol('homeIcon', false, toolBox.idCount++, toolBox.pId);

            group.addSymbol(homeSymbol, true);
            group.addSymbol(backSymbol, true);

            components.toolbarBtns = {
                back: backSymbol,
                home: homeSymbol
            };


        },
        /*
         * @return Function: Returning the number formatted value.
        */
        _getCleanValue: function () {
            // storing the reference for number formatter for future use.
            var numberFormatter = this.components.numberFormatter;
            return function (value) {
                return numberFormatter.getCleanValue(value);
            };
        },

        _createDatasets : function () {
            var iapi = this,
                components = iapi.components,
                dataObj = iapi.jsonData,
                dataset = dataObj.dataset,
                data = dataObj.data || (dataset && dataset[0].data),
                datasetStore,
                datasetObj,
                defaultSeriesType = iapi.defaultDatasetType,
                dsType,
                DsClass,
                dataOnlyArr = [],
                datasetJSON;
            if (!(data && data.length)) {
                iapi.setChartMessage();
            }
            each (data, function (data) {
                if (!data.vline) {
                    dataOnlyArr.push (data);
                }
            });
            datasetJSON = { data: dataOnlyArr };

            iapi.config.categories = dataOnlyArr;

            datasetStore = components.dataset  || (components.dataset = []);

            if (!data) {
                iapi.setChartMessage();
                return;
            }

            dsType = defaultSeriesType;

            if (dsType) {

                /// get the DsClass
                DsClass = FusionCharts.get('component', ['dataset', dsType]);
                if (DsClass) {
                    if (!datasetStore[0]) {
                        // create the dataset Object
                        iapi._dsInstance = datasetObj = new DsClass ();
                        datasetStore.push (datasetObj);
                        datasetObj.chart = iapi;
                        datasetObj.init(datasetJSON);
                    }
                    else {
                        datasetStore[0].JSONData = dataOnlyArr[0];
                        datasetStore[0].configure();
                    }
                }
            }
        },

        init: function () {
            var iapi = this;
            iapi._ref = ref();
            chartAPI.guageBase.init.apply(iapi, arguments);
        }
    }, chartAPI.guageBase, {
        enablemousetracking: true
    });

    FusionCharts.register('component', ['dataset', 'TreeMap', {
        type: 'treemap',

        pIndex : 2,
        customConfigFn : '_createDatasets',
        init : function (datasetJSON) {
            var datasetDefStore = this;

            datasetDefStore.JSONData = datasetJSON.data[0];

            // Stub for saving all the child component
            datasetDefStore.components = { };
            // Stub for saving all the computed configuration
            datasetDefStore.conf ={ };
            // Stub for saving all the graphics component
            datasetDefStore.graphics = {
                elemStore : {
                    rect : [],
                    label: [],
                    highlight: [],
                    hot: [],
                    polypath: []
                }
            };

            datasetDefStore.configure();
        },

        configure : function () {
            var meta,
                algorithm,
                maxDepth,
                showNavigationBar,
                datasetDefStore = this,
                chart = datasetDefStore.chart,
                components = chart.components,
                dsConf = datasetDefStore.conf,
                rawChartAttr = chart.jsonData.chart;

            dsConf.metaTreeInf = meta = {};

            algorithm = rawChartAttr.algorithm || 'squarified';
            dsConf.algorithm = algorithm.toLowerCase();

            // horizontalPadding and verticalPadding is the separation space between parent drawing area
            // and child drawing area
            dsConf.horizontalPadding = pluckNumber(rawChartAttr.horizontalpadding, 5);
            dsConf.horizontalPadding = (dsConf.horizontalPadding < 0) ? 0 : dsConf.horizontalPadding;
            dsConf.verticalPadding = pluckNumber(rawChartAttr.verticalpadding, 5);
            dsConf.verticalPadding = (dsConf.verticalPadding < 0) ? 0 : dsConf.verticalPadding;

            // Hides the node which are not leaf nodes by using all the available spaces.
            // This attribute including horizontalPadding and verticalPadding is used to display only the child nodes
            dsConf.showParent = pluckNumber(rawChartAttr.showparent, 1);
            dsConf.showChildLabels = pluckNumber(rawChartAttr.showchildlabels, 0);

            // Hovers on all the leaf nodes which belong to a particular parent. Disbales single leaf hovering
            dsConf.highlightParentsOnHover = pluckNumber(rawChartAttr.highlightparentsonhover, 0);

            // Background color of nodes which are not leaf nodes. The leaf nodes color is managed by
            // the colorRangeManager
            dsConf.defaultParentBGColor = pluck(rawChartAttr.defaultparentbgcolor, undefined);
            dsConf.defaultNavigationBarBGColor = pluck(rawChartAttr.defaultnavigationbarbgcolor,
                dsConf.defaultParentBGColor);

            dsConf.showTooltip = pluckNumber(rawChartAttr.showtooltip, 1);
            // Font cosmetics
            dsConf.baseFontSize = pluckNumber(rawChartAttr.basefontsize, 10);
            dsConf.baseFontSize = (dsConf.baseFontSize < 1) ? 1 : dsConf.baseFontSize;
            dsConf.labelFontSize = pluckNumber(rawChartAttr.labelfontsize, undefined);
            dsConf.labelFontSize = (dsConf.labelFontSize < 1) ? 1 : dsConf.labelFontSize;
            dsConf.baseFont = pluck(rawChartAttr.basefont, 'Verdana, Sans');
            dsConf.labelFont = pluck(rawChartAttr.labelfont, undefined);
            dsConf.baseFontColor = pluck(rawChartAttr.basefontcolor, '#000000').replace(/^#?([a-f0-9]+)/ig, '#$1');
            dsConf.labelFontColor = pluck(rawChartAttr.labelfontcolor, undefined);
            dsConf.labelFontColor &&
            (dsConf.labelFontColor = dsConf.labelFontColor.replace(/^#?([a-f0-9]+)/ig, '#$1'));
            dsConf.labelFontBold = pluckNumber(rawChartAttr.labelfontbold, 0);
            dsConf.labelFontItalic = pluckNumber(rawChartAttr.labelfontitalic, 0);

            // Border cosmetics
            dsConf.plotBorderThickness = pluckNumber(rawChartAttr.plotborderthickness, 1);
            dsConf.plotBorderThickness = (dsConf.plotBorderThickness < 0) ? 0
            : (dsConf.plotBorderThickness > 5) ? 5 : dsConf.plotBorderThickness;
            dsConf.plotBorderColor = pluck(rawChartAttr.plotbordercolor, '#000000')
            .replace(/^#?([a-f0-9]+)/ig, '#$1');

            // Extended tooltip support
            dsConf.tooltipSeparationCharacter = pluck(rawChartAttr.tooltipsepchar, ',');
            dsConf.plotToolText = pluck(rawChartAttr.plottooltext, '');

            // Parent label line height configuration
            dsConf.parentLabelLineHeight = pluckNumber(rawChartAttr.parentlabellineheight, 12);
            dsConf.parentLabelLineHeight = (dsConf.parentLabelLineHeight < 0) ? 0
            : dsConf.parentLabelLineHeight;

            // Label glow is required since if the user choose a background that is as same as the color of the label,
            // the glow is required to work as a layer between text and background that will make the label stand out
            dsConf.labelGlow = pluckNumber(rawChartAttr.labelglow, 1);
            dsConf.labelGlowIntensity = pluckNumber(rawChartAttr.labelglowintensity, 100) / 100;
            dsConf.labelGlowIntensity = ((dsConf.labelGlowIntensity < 0) ? 0
            : (dsConf.labelGlowIntensity > 1) ? 1 : dsConf.labelGlowIntensity);
            dsConf.labelGlowColor = pluck(rawChartAttr.labelglowcolor, '#ffffff')
            .replace(/^#?([a-f0-9]+)/ig, '#$1');
            dsConf.labelGlowRadius = pluckNumber(rawChartAttr.labelglowradius, 2);
            dsConf.labelGlowRadius = (dsConf.labelGlowRadius < 0) ? 0 :
                (dsConf.labelGlowRadius > 10) ? 10 : dsConf.labelGlowRadius;


            // Tool bar configuration
            dsConf.btnResetChartTooltext = pluck(rawChartAttr.btnresetcharttooltext, 'Back to Top');
            dsConf.btnBackChartTooltext = pluck(rawChartAttr.btnbackcharttooltext, 'Back to Parent');

            // Legend Effects Configuration
            dsConf.rangeOutBgColor = pluck(rawChartAttr.rangeoutbgcolor, '#808080')
            .replace(/^#?([a-f0-9]+)/ig, '#$1');
            dsConf.rangeOutBgAlpha = pluckNumber(rawChartAttr.rangeoutbgalpha, 100);
            dsConf.rangeOutBgAlpha = ((dsConf.rangeOutBgAlpha < 1) || (dsConf.rangeOutBgAlpha > 100)) ?
            100 : dsConf.rangeOutBgAlpha;


            //maximum levels to display in the tree at a time.
            maxDepth = pluckNumber(rawChartAttr.maxdepth);
            dsConf.maxDepth = (maxDepth !== undefined) ? mathMax(maxDepth, 1) : undefined;

            showNavigationBar = dsConf.showNavigationBar = pluckNumber(rawChartAttr.shownavigationbar, 1);
            dsConf.slicingMode = pluck(rawChartAttr.slicingmode, 'alternate');
            dsConf.navigationBarHeight = pluckNumber(rawChartAttr.navigationbarheight);
            dsConf.navigationBarHeightRatio = pluckNumber(rawChartAttr.navigationbarheightratio);
            dsConf.navigationBarBorderColor = pluck(rawChartAttr.navigationbarbordercolor, dsConf.plotBorderColor)
            .replace(/^#?([a-f0-9]+)/ig, '#$1');
            dsConf.navigationBarBorderThickness = showNavigationBar ?pluckNumber(
                rawChartAttr.navigationbarborderthickness, dsConf.plotBorderThickness) : 0;
            dsConf.seperatorAngle = pluckNumber(rawChartAttr.seperatorangle) * (pi / 180);

            components.postLegendInitFn({
                min: 0,
                max: 100
            });

            dsConf.isConfigured = true;
        },

        _getHoveredPlot : function (chartX, chartY) {
            var dataset = this,
                trackerElem,
                m,
                kdTree = dataset.kdTree || [];

            for (m = kdTree.length; m--;) {
                if (!dataset.kdTree[m]) {
                    continue;
                }
                if (trackerElem = (dataset.kdTree[m].searchTreemap(chartX, chartY))) {
                    break;
                }
            }

            if (trackerElem) {
                dataset.pointObj = trackerElem;
                return {
                    pointIndex: trackerElem.i || trackerElem.index,
                    hovered: true,
                    pointObj: trackerElem
                };
            }

        },

        kdTreeAbs : function (arr) {
            'use strict';
            // Max radius will be tolerance
            var tolerance = arr && arr[0] && arr[0].plotDetails.rect || 5,
                i,
                max = Math.max,
                floor = Math.floor,
                sqrt = Math.sqrt,
                min = Math.min,
                log = Math.log,
                exp = Math.exp,
                pow = Math.pow,
                result = {};
            arr = arr || [];
            // Find tolerance as the max radius
            // of the element
            for (i = arr.length; i--;) {
                if (arr[i].r > tolerance) {
                    tolerance = arr[i].r;
                }
                // Setting the index
                arr[i].x = +arr[i].plotDetails.rect.x;
                arr[i].y = +arr[i].plotDetails.rect.y;
            }
            // Check a point is in range w.r.t
            // to given range
            function inRange (a, r1, r2) {
                return a >= r1 && a <= r2;
            }
            // KdTree Definition below
            function buildKdTree(arr, left, right, isY){
                var ob = {},
                    mid,
                    access = isY ? 'y' : 'x';

                if (arr.length === 0) {
                    return;
                }
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

                var n,
                m,
                z,
                s,
                sd,
                newLeft,
                newRight,
                t,
                i,
                j;

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
            result = {
                tree: buildKdTree(arr, 0, arr.length - 1, false),
                search: function (x, y) {
                    // Helper function for search
                    // to apply data if found
                    function apply (ob) {
                        var currentHovered = inRange(x, ob.x1, ob.x2) && inRange(y, ob.y1, ob.y2),
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
                        // If match found return
                        if (inRange(ob.point.x, x1, x2) && inRange(ob.point.y, y1, y2)) {
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
                        // If match found return
                        if (inRange(ob.point.x, x1, x2) && inRange(ob.point.y, y1, y2)) {
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
                },
                searchTreemap: function (x, y) {
                    var res,
                    // Higher index will be the result
                    apply = function (ob) {
                        if (!res) {
                            res = ob;
                            return;
                        }
                        if (ob.i > res.i) {
                            res = ob;
                        }
                    },
                    search = function (ob, isY) {

                        // Not found
                        if (!ob || !ob.point) {
                            return;
                        }
                        var x1 = ob.point.x,
                            x2 = x1 + ob.point.plotDetails.rect.width,
                            y1 = ob.point.y,
                            y2 = y1 + ob.point.plotDetails.rect.height;
                        ob.point.x2 = x2;
                        ob.point.y2 = y2;

                        // Found
                        if (x >= x1 && x <= x2 && y >= y1 && y <= y2) {
                            apply(ob.point);
                        }

                        if (!isY) {
                            if (true) {
                                search(ob.left, !isY);
                            }
                            if (true) {
                                search(ob.right, !isY);
                            }
                        } else {
                            if (true) {
                                search(ob.left, !isY);
                            }
                            if (true) {
                                search(ob.right, !isY);
                            }
                        }
                    };
                    search(this.tree, false);
                    return res;
                }
            }; //------
            arr.sort(function(a, b){
                return a.i - b.i;
            });
            return result;
        },

        kdTreePartioning : function () {
            var dataset = this,
                trackerConfigArray = dataset.chart.config.trackerConfig,
                m,
                trackerObjPartition = [];

            for (m = trackerConfigArray.length; m--;) {
                trackerConfigArray[m].i = m;
                if (trackerObjPartition[trackerConfigArray[m].node.meta.depth] === undefined) {
                    trackerObjPartition[trackerConfigArray[m].node.meta.depth] = [];
                }
                trackerObjPartition[trackerConfigArray[m].node.meta.depth].push(trackerConfigArray[m]);
            }

            dataset.kdTree = [];
            for (m = trackerObjPartition.length; m--;) {
                dataset.kdTree[m] = dataset.kdTreeAbs && dataset.kdTreeAbs(trackerObjPartition[m]);
            }
        },

        _rolloverResponseSetter : function (chart, elem, event) {
            var elData = elem.getData() || {};
            // Check whether the plot is in dragged state or not if
            // drag then dont fire rolloverevent
            if (elem) {
                elem.attr(elData.setRolloverAttr);
                plotEventHandler.call(elem, chart, event, ROLLOVER);
            }
        },

        _rolloutResponseSetter : function (chart, elem, event) {
            var elData = elem.getData() || {};
            // Check whether the plot is in draggedstate or not if drag then dont fire rolloutevent
            if (elem) {
                elem.attr(elData.setRolloutAttr);
                plotEventHandler.call(elem, chart, event, ROLLOUT);
            }
        },

        _firePlotEvent: function (eventType, plotIndex, e) {
            var dataset = this,
                dsConf = dataset.conf,
                chart = dataset.chart,
                jobList = chart.getJobList(),
                paper = chart.components.paper,
                data = dataset.chart.config.trackerConfig[plotIndex || 0],
                trackerGroup = chart.graphics.trackerGroup,
                setElement = data && data.node && data.node.plotItem,
                toolText = data && data.evtFns && data.evtFns.tooltip[0],
                style = chart.components.paper.canvas.style,
                tip = lib.toolTip,
                originalEvent = e.originalEvent,
                singleTracker = dataset.graphics.singleTracker,
                hoveredInfo = dataset.pointObj,
                plotDetails = hoveredInfo.plotDetails,
                rectPlotDetails = plotDetails && plotDetails.rect,
                highlightparentsonhover = dsConf.highlightParentsOnHover,
                nodePath = data && data.node.path,
                parent = nodePath && nodePath[nodePath.length - 2],
                rectParent = parent && parent.rect;


            if (!singleTracker) {
                singleTracker = dataset.graphics.singleTracker = paper.rect(trackerGroup);
            }

            if (!setElement) {
                setElement = data && data.node.dirtyNode.plotItem;
                plotDetails = {};
                rectPlotDetails = {};
            } else if (highlightparentsonhover && parent) {
                singleTracker.attr({
                    x: rectParent.x,
                    y: rectParent.y,
                    width: rectParent.width,
                    height: rectParent.height,
                    stroke: 'rgba(255,255,255,0)'
                });
            } else if (plotDetails) {
                singleTracker.attr({
                    x: rectPlotDetails.x || 0,
                    y: rectPlotDetails.y || 0,
                    width: rectPlotDetails.width || 0,
                    height: rectPlotDetails.height || 0,
                    stroke: 'rgba(255,255,255,0)'
                });
                singleTracker.toFront();
            } else {
                singleTracker.attr({
                    x: 0,
                    y: 0,
                    width: 0,
                    height: 0,
                    stroke: 'rgba(255,255,255,0)'
                });
                singleTracker.toFront();
            }
            if (setElement) {
                switch (eventType) {
                    case 'mouseover' :
                        data.evtFns.hover[0](singleTracker);
                        if (toolText) {
                            tip.setStyle(paper);
                            tip.setPosition(originalEvent);
                            tip.draw(toolText, paper);
                        }
                        style.cursor = POINTER;
                        // singleTracker.toFront();
                        // dataset._rolloverResponseSetter(chart, setElement, originalEvent);
                        break;
                    case 'mouseout' :
                        singleTracker.attr({
                            x: 0,
                            y: 0,
                            width: 0,
                            height: 0,
                            stroke: '#ffffff',
                            'stroke-width': '0px'
                        });
                        tip.hide();
                        style.cursor = DEFAULT_CURSOR;
                        singleTracker.toFront();
                        dataset._rolloutResponseSetter(chart, setElement, originalEvent);
                        break;
                    case 'click' :
                        // plotEventHandler.call(setElement, chart, originalEvent);
                        data && data.evtFns && data.evtFns.click && data.evtFns.click[0]();
                        if (toolText) {
                            tip.setStyle(paper);
                            tip.setPosition(originalEvent);
                            tip.draw(toolText, paper);
                        }
                        jobList.trackerDrawID.push(schedular.addJob(dataset.kdTreePartioning, dataset, [],
                            lib.priorityList.tracker));
                        break;
                    case 'mousemove' :
                        if (toolText) {
                            tip.setPosition(originalEvent);
                            tip.draw(toolText, paper);
                        }
                }
            }
        },

        draw : function () {
            var datasetDefStore = this,
                dsConf = datasetDefStore.conf,
                chart = datasetDefStore.chart,
                trackerConfig = chart.config.trackerConfig,
                jobList = chart.getJobList(),
                chartConf = chart.config,
                components = chart.components,
                canvasLeft = chartConf.canvasLeft,
                canvasRight = chartConf.canvasRight,
                canvasBottom = chartConf.canvasBottom,
                canvasTop = chartConf.canvasTop,
                paper = components.paper,
                chartAttr = chart.jsonData.chart,
                layers = chart.graphics,
                trackerLayer = layers.trackerGroup,
                datasetLayer, datalabelLayer, lineHotLayer, labelHighlightLayer, floatLabelLayer,
                metaInf = dsConf.metaTreeInf,
                elemStore = datasetDefStore.graphics.elemStore,
                rendererAPI = {},
                drawingAreaCenterPoint = {},
                groupLabelCssProps = ['fontFamily', 'fontSize', 'fontWeight', 'fontStyle'],
                groupLabelCss = {},
                nodeRect,
                tree,
                algorithmAPI,
                HOVER_FILL = 'rgba(255, 255, 255, 0)',
                attrs = dsConf,
                legend = components.gradientLegend,
                drawTreeFn,
                shadeFilter,
                _ref = chart._ref,
                afAPI = _ref.afAPI,
                visController = afAPI.visibilityController,
                animationObj = chart.get('config', 'animationObj'),
                animationDuration = (animationObj.duration || 0),
                mainElm = animationObj.dummyObj,
                animObj = animationObj.animObj,
                animType = animationObj.animType,
                elemCat,
                elemCatContent,
                thisElem,
                index,
                length,
                containerManager = _ref.containerManager,
                chartLevelAttr,
                algorithmFactory = _ref.algorithmFactory,
                attr;

            trackerConfig && (trackerConfig.length = 0);

            chartLevelAttr = parsexAxisStyles({}, {}, chartAttr, { fontFamily : 'Verdana,sans', fontSize: '10px' });

            // Extract the required css from the list of css (guard for IE)
            for (index = 0, length = groupLabelCssProps.length; index < length; index++) {
                attr = groupLabelCssProps[index];

                if (attr in chartLevelAttr) {
                    groupLabelCss[attr] = chartLevelAttr[attr];
                }
            }

            for (elemCat in elemStore) {
                elemCatContent = elemStore[elemCat];
                for (index = 0, length = elemCatContent.length; index < length; index++) {
                    thisElem = elemCatContent[index];
                    thisElem && thisElem.remove && thisElem.remove();
                }
                elemCatContent.length = 0;
            }

            // transport all the previously drawn elements to graphic pool.(graphics reusability)
            containerManager.remove();

            datasetLayer = layers.datasetGroup =
                (layers.datasetGroup || paper.group('dataset'));

            datalabelLayer = layers.datalabelsGroup =
                (layers.datalabelsGroup || paper.group('datalabels').insertAfter(datasetLayer)).css(groupLabelCss);

            lineHotLayer = layers.lineHot =
                (layers.lineHot || paper.group('line-hot', trackerLayer));

            labelHighlightLayer = layers.labelHighlight =
            (layers.labelHighlight || paper.group('labelhighlight', datalabelLayer));

            floatLabelLayer = layers.floatLabel =
                (layers.floatLabel || paper.group('labelfloat', datalabelLayer).insertAfter(labelHighlightLayer));


            dsConf.colorRange = legend.colorRange;

            // Measurement for available drawing area
            metaInf.effectiveWidth = canvasRight - canvasLeft;
            metaInf.effectiveHeight = canvasBottom - canvasTop;
            metaInf.startX = canvasLeft;
            metaInf.startY = canvasTop;

            // Starting point of animation. Animation starts from the center of the paper.
            drawingAreaCenterPoint.x =  metaInf.effectiveWidth / 2;
            drawingAreaCenterPoint.y = metaInf.effectiveHeight / 2;

            // Starting point of animation. Animation starts from the center of the paper.
            drawingAreaCenterPoint.x =  metaInf.effectiveWidth / 2;
            drawingAreaCenterPoint.y = metaInf.effectiveHeight / 2;

            /*
             * A function to draw a polygon of specific path and style configuration
             * @param path - {Array} - The path required to construct the polygon.
             * @param styleAttrs {Object} - The style object needed to be applied on the polygon element.
            */
            rendererAPI.drawPolyPath = function (config, styleAttrs) {
                var pathElem,
                    newElem;
                // look up for dumped 'polypathItem' inside the garbage pool or create a new path.
                pathElem = (rendererAPI.graphicPool(false, 'polyPathItem') || (newElem = paper.path(datasetLayer)))
                .attr({
                    path: config._path
                })
                .animateWith(mainElm, animObj, {
                    path: config.path
                }, animationDuration, animType);
                // applying the css styles.
                pathElem.css(styleAttrs);

                newElem && elemStore.polypath.push(newElem);

                // return the polygon path element.
                return pathElem;
            };

            rendererAPI.drawRect = function (rect, styleAttrs, _rect, overriddenAttrs) {
                var prop,
                    pVal,
                    beforeAnimationStateRect = {},
                    overrideCss = {},
                    newElem;

                for (prop in rect) {
                    pVal = rect[prop];
                    if (pVal < 0) {
                        // If value of any rect proerty is negative, give it zero pixel, so it become invisible
                        rect[prop] = 0;
                        // Explicit visibility hidden required for IE8
                        overrideCss.visibility = 'hidden';
                    }
                }
                // If animation is applied. For animation to happen we need a 'from state' and a 'to state'.
                // During the time duration the transition happens 'from state'  to 'to states'.

                fcExtend(beforeAnimationStateRect, rect);

                //From state measurement of the animation
                beforeAnimationStateRect.x = drawingAreaCenterPoint.x;
                beforeAnimationStateRect.y = drawingAreaCenterPoint.y;
                beforeAnimationStateRect.height = 0;
                beforeAnimationStateRect.width = 0;
                nodeRect = rendererAPI.graphicPool(false, 'plotItem') || (newElem = paper.rect(datasetLayer));
                nodeRect.attr((_rect && (_rect.x || _rect.y) && _rect) || beforeAnimationStateRect);

                nodeRect.attr(overriddenAttrs);
                nodeRect.animateWith(mainElm, animObj, rect, animationDuration, animType,
                    visController.controlPostAnimVisibility);
                nodeRect.css(styleAttrs).toFront();
                // Apply css which has to be applied anyway
                nodeRect.css(overrideCss);
                // Store the reference, so that we canus retrieve it later.
                // todo: remove...
                newElem && elemStore.rect.push(newElem);

                return nodeRect;
            };

            /*
             * Draw a text on the paper. This texts are drawn under datalabel layer.
             * @param text {String} - text to be drawn on paper
             * @param coordinates {Object} - Start co ordinate of the text. In {x: 10, y: 10} format
             * @return {Element} - the element which is drawn on paper
             */
            rendererAPI.drawText = function (text, coordinates, attrs, _coordinates, overAttr) {
                var mandatoryStyle = {},
                    newTextElem,
                    newHighlightElem,
                    label = (rendererAPI.graphicPool(false, 'labelItem') ||
                        (newTextElem = paper.text(floatLabelLayer))),
                    highlightMask = rendererAPI.graphicPool(false, 'highlightItem') ||
                        (newHighlightElem = paper.text(labelHighlightLayer)),
                    textAttrs = attrs.textAttrs,
                    highlightsAttrs = attrs.highlightAttrs;

                // There are two layers of datalabel placement happens here. The 1st layer from the top is the
                // real text. And below this is the text that brings the highlight effect. This effect is acheived
                // by making the strong-width bigger.

                fcExtend(mandatoryStyle, textAttrs);

                delete mandatoryStyle.fill;
                mandatoryStyle['stroke-linejoin'] = 'round';

                // If animation is applied. For animation to happen we need a 'from state' and a 'to state'.
                // During the time duration the transition happens 'from state'  to 'to states'.
                label.attr({
                    x: _coordinates.x || drawingAreaCenterPoint.x,
                    y: _coordinates.y || drawingAreaCenterPoint.y,
                    fill: '#000000'
                }).css(textAttrs);

                label.attr(overAttr);

                // If the coordinates are negative valued, texts are made BLANK.
                text = (coordinates.x < 0 || coordinates.y < 0) ? BLANKSTRING : text;

                label.animateWith(mainElm, animObj, {
                    text: text,
                    x: coordinates.x,
                    y: coordinates.y
                }, animationDuration, animType);
                highlightMask.attr({
                    text: text,
                    x: _coordinates.x || drawingAreaCenterPoint.x,
                    y: _coordinates.y || drawingAreaCenterPoint.y,
                    stroke: dsConf.labelGlow ? '#ffffff' : TRACKER_FILL
                }).css(mandatoryStyle).css(highlightsAttrs);

                highlightMask.attr(overAttr);

                highlightMask.animateWith(mainElm, animObj, {
                    x: coordinates.x,
                    y: coordinates.y
                }, animationDuration, animType);
                // Store the reference in the array
                elemStore.label.push(newTextElem);
                elemStore.highlight.push(newHighlightElem);

                return {
                    label: label,
                    highlightMask: highlightMask
                };
            };

            /*
             * Draw a rect on the paper to mock interactivity. This rects are drawn under hot layer.
             * @param plotDetails {Object} - details of the plot incling the original object and the rect associated.
             * @param eventFns {Object} - a simple key value pair where key is the name of the event and value is the
                                        function which is to be invoked when teh event fires
             * @return {Element} - the element which is drawn on paper
             */
            rendererAPI.drawHot = function (plotDetails, evtFns) {
                var tracker,
                    plotItem = plotDetails.plotItem || {},
                    rect = plotDetails.rect,
                    attr,
                    fns,
                    prop,
                    pVal;

                for (prop in rect) {
                    pVal = rect[prop];
                    if (pVal < 0) {
                        // If value of any rect proerty is negative, give it zero pixel, so it become invisible
                        rect[prop] = 0;
                    }
                }

                tracker = plotItem.tracker = paper.rect(lineHotLayer).attr(rect).attr({
                    cursor: 'pointer',
                    fill: HOVER_FILL,
                    stroke: 'none'
                });

                // Registers event and event functions
                for (attr in evtFns) {
                    fns = evtFns[attr];
                    tracker[attr].apply(tracker, fns);
                }

                // Save the reference
                elemStore.hot.push(tracker);
                return tracker;
            };

            /*
             * Dispose the graphic elements related to a node element.
             * @param node - {TreeNode} - The node element reference wrt whom the graphic elements needs to be detached.
             * @param disposeList - {Array} - The  disposing graphics elements names which are to be only removed.
            */
            rendererAPI.disposeItems = function (node, disposeList) {
                var i,
                    item,
                    prop,
                    disposeNames = disposeList || ['plotItem', 'labelItem', 'hotItem', 'highlightItem', 'polyPathItem',
                        'pathlabelItem', 'pathhighlightItem', 'stackedpolyPathItem', 'stackedpathlabelItem',
                        'stackedpathhighlightItem'];

                for (i = 0; i < disposeNames.length; i += 1) {
                    prop = disposeNames[i];
                    item = node[prop];
                    // push these elements in the graphic pool for resuing in future.
                    item && rendererAPI.graphicPool(true, prop, item, node.rect);
                    // hide the elements.
                    item && item.hide();
                    // detach the node and the graphic element linkage.
                    node[prop] = undefined;
                }
            };

            /*
             * Recursively destroy all childs of the tree node.
            */
            rendererAPI.disposeChild = (function () {
                var rendererAPI,
                    disposeItems = function () {
                        return rendererAPI.disposeItems;
                    },
                    removeFn = function (currentNode, depth) {
                        var index,
                            childrenArr;

                        // dispose the graphics elements for the element.
                        disposeItems(currentNode);
                        //todo: put it in closure
                        for (index = 0; index < (currentNode.getChildren() || []).length; index ++) {
                            childrenArr = currentNode.getChildren();
                            index = removeFn(childrenArr[index], index);
                        }
                        return depth;
                    };
                return function (node) {
                    var parentNode = node.getParent();
                    if (!rendererAPI) {
                        rendererAPI = this;
                        disposeItems = disposeItems();
                    }
                    //check if its not the global origin
                    if (parentNode) {
                        rendererAPI.disposeChild(parentNode);
                    }
                    else {
                        /* dispose the graphics elements, if any. Store it for future re-use and unlink its reference
                        from the node element */
                        removeFn(node, 0);
                    }
                };
            })();

            /**
             * store or fetch an element of the type.
             * param add {boolean} - If to add the element or fetch an element.
             * param type {'string'} - If a hot element, rectangle, texts...
             * param elem {svg element}
            */
            rendererAPI.graphicPool = (function () {
                var graphicPool = {};

                return function (add, type, elem) {
                    var freeElement,
                        dumpArr = graphicPool[type];
                    //create a storage array for the specified type if not existing.
                    if (!dumpArr) {
                        dumpArr = graphicPool[type] = [];
                    }

                    if (type === 'hotItem' || type === 'pathhotItem') {
                        elem.remove();
                    }
                    //adds the elemnt to the graphics pool
                    if (add) {
                        dumpArr.push(elem);
                    }
                    //fectches an element from the pool and remove that from the free pool.
                    else {
                        //slice out the first element from the array of free elements.
                        freeElement = dumpArr.splice(0,1)[0];
                        if (freeElement) {
                            freeElement.show();
                            return freeElement;
                        }
                    }
                };
            })();


            // dispose the complimentary tree.
            rendererAPI.disposeComplimentary = function (targetNode) {
                var child,
                    childrenArr,
                    rendererAPI = this,
                    parentNode = targetNode.getParent(),
                    leftSiblingCount = targetNode.getSiblingCount('left');
                if (parentNode) {
                    childrenArr = parentNode.getChildren();
                    //set parent node to undefined, to break the parent-child links.
                    child = childrenArr.splice(leftSiblingCount, 1)[0];
                    // generically dispose the discontinous tree.
                    rendererAPI.disposeChild(targetNode);
                    //re-eastablish the broken parent-child relationships for the node.
                    childrenArr.splice(leftSiblingCount, 0, child);
                }
                //bridge code: Cannot dispose hotItems.
                rendererAPI.removeLayers();
            };

            /*
             * Remove everything that has been drawn in the layers. It doesnot remove the layer directly.
             * Instead it removes the children. All the children of datasetLayer, datalabelLayer, hotLayer
             * are removed
             */
            rendererAPI.removeLayers = function () {
                var index,
                    length,
                    /*dataset,
                    datalabel,
                    highlight,*/
                    hot,
                    /*_datasetLayer,
                    _datalabelLayer,
                    _highlightLayer,*/
                    _hotLayer,
                    /*datasetLayerLength,
                    datalabelLayerLength,
                    highlightLayerLength,*/
                    hotLayerLength;

                /*_datasetLayer = elemStore.rect, datasetLayerLength = _datasetLayer.length;
                _datalabelLayer = elemStore.label, datalabelLayerLength = _datalabelLayer.length;
                _highlightLayer = elemStore.highlight, highlightLayerLength = _highlightLayer.length;*/
                _hotLayer = elemStore.hot, hotLayerLength = _hotLayer.length;

                // Get the length of maximum element inside among three layers
                // length = Math.max(datasetLayerLength, datalabelLayerLength, highlightLayerLength, hotLayerLength);
                length = hotLayerLength;

                for (index = 0; index < length; index++) {
                    /*dataset = _datasetLayer[index];
                    datalabel = _datalabelLayer[index];
                    highlight = _highlightLayer[index];*/
                    hot = _hotLayer[index];

                    // Remove the element from DOM
                    /*dataset && dataset.remove();
                    datalabel && datalabel.remove();
                    highlight && highlight.remove();*/
                    hot && hot.remove();
                }

                // Empty the arry which was holding the reference
                /*_datasetLayer.length = 0;
                _datalabelLayer.length = 0;*/
                _hotLayer.length = 0;
            };

            /*if (hasReflowed) {
                visibleRoot = afAPI.getVisibleRoot();
                afAPI.setVisibleRoot(visibleRoot);
                visibleRoot = [visibleRoot,visibleRoot,visibleRoot];
            }*/
            algorithmAPI = algorithmFactory.init(dsConf.algorithm, true, dsConf.maxDepth);

            // Retrieves draw function of algorithm
            drawTreeFn = algorithmFactory.plotOnCanvas(datasetDefStore.JSONData, undefined, chart._getCleanValue());
            // initialise the container manager.
            containerManager.init(datasetDefStore, metaInf, rendererAPI, tree, drawTreeFn);

            // visibleRoot = afAPI.getVisibleRoot();
            // visibleRoot && rendererAPI.disposeChild(visibleRoot);
            // hideAll(visibleRoot);
            // draw the indivual containers inside the container manager.
            containerManager.draw();

            shadeFilter = algorithmFactory.applyShadeFiltering({
                fill: attrs.rangeOutBgColor,
                opacity: (attrs.rangeOutBgAlpha * 0.01)
            }, function (css) {
                var nodeInf = this;
                nodeInf.plotItem && nodeInf.plotItem.css(css);
            });

            (legend && legend.enabled) && (legend.resetLegend(), legend.clearListeners());

            legend.notifyWhenUpdate(function () {
                shadeFilter.call(this, {
                    start: arguments[0],
                    end: arguments[1]
                });
            }, this);
            dsConf.isConfigured = false;
            jobList.trackerDrawID.push(schedular.addJob(datasetDefStore.kdTreePartioning, datasetDefStore, [],
                        lib.priorityList.tracker));
        }


    }]);


    /*
     * Algorithm API
     * These are classes, base classes to complete the algorithm
     */
    afAPICreator = function (afAPI, algorithmFactory, containerManager) {
        var iterator,
            maxDepth,
            visibleRoot,
            visibilityController,
            context;

        /*
         * AbstractTreeMaker is kind of an abstract class that converts fusioncharts configuration to tree.
         * This can directly be used and initialized  if no ordering is required. If any particular ordering
         * is needed, it is the subclass needs to implement order function.
         * @param: node {Object} - root node of the configuration. This would be root of the returned tree as well.
         * @constructor
         */
        function AbstractTreeMaker (node, bucketIterationMode, cleansingFn) {
            this.node = node;
            this.bucket = bucketIterationMode ? new Bucket() : undefined;
            this.cleansingFn = cleansingFn;
        }

        /*
         * Create the tree from configuration.
         * @return: {TreeNode} - newly created tree
         */
        AbstractTreeMaker.prototype.get = function () {
            var orderFn = this.order,
                bucket = this.bucket,
                cleansingFn = this.cleansingFn;

            /*
             * Recursively prepare the tree from the configuration.
             * @param level {Number} - The depth of the current root element.
             * @param root {TreeNode} - The current base root in the full tree trversal.
            */
            return (function rec(root, level) {
                var pNewNode,
                    index,
                    children,
                    childNode,
                    newNode,
                    notMetaKeys = ['label', 'value', 'data', 'svalue'],
                    key;

                if (root) {
                    // If root node is present add in the existing tree.
                    // This also acts as a break condition of recursion.
                    pNewNode = new TreeNode(root.label, cleansingFn(root.value), cleansingFn(root.svalue));
                    children = root.data || [];

                    if (children.length === 0 && bucket) {
                        bucket.addInBucket(pNewNode);
                    }
                    //sets the depth information in the 'meta' object for the Tree node element.
                    pNewNode.setDepth(level);
                    // Support for set label attributes. All the set label attributes are stored in meta object.
                    for (key in root) {
                        // label, value and data is non-meta attribute
                        if (notMetaKeys.indexOf(key) !== -1) {
                            continue;
                        }
                        pNewNode.setMeta(key, root[key]);
                    }
                }

                if (orderFn) {
                    // For ordered treemaps. If the subclass give implementation of orderFn
                    children = orderFn(children);
                }

                for (index = 0; index < children.length; index++) {
                    childNode = children[index];
                    // Recursively iterate to complete the tree along with the incremental level information.
                    newNode = rec(childNode, level + 1);
                    pNewNode.addChild(newNode);
                }

                return pNewNode;
            })(this.node, 0); // The depth for the initial global node remains '0'.
        };

        /*
         * Get the  bucket formation created by ordering and grouping the leaf nodes. This can be accessed if the
         * legend is enabled.
         * @return {Bucket} - The bucket of leaf nodes
         */
        AbstractTreeMaker.prototype.getBucket = function () {
            return this.bucket;
        };

        AbstractTreeMaker.prototype.getMaxDepth = function () {
            return maxDepth;
        };

        function setMaxDepth (value) {
            return (maxDepth = value);
        }

        /*
         * Iterates though the tree. This provides two basic traversal of tree. This iteration happens on-demand.
         * Hence faster.
         * 1. Breath-first
         * 2. depth-first
         * @param rootNode {TreeNode} - Root node from where the traversal to be started
         * @return {Object} - Object containg standard API for breadth-first-traversal  and depth-first-traversal
         */
        iterator = function (rootNode, controlOptions) {
            var it = {},
                exception = controlOptions && controlOptions.exception,
                df,
                bf;

            /*
             * Provides control to implement iterator in case the user wants have more than one iterator
             * without waiting for the one to get exhausted.
             */
            function Iterable (iterAPI) {
                this.iterAPI = iterAPI;
            }

            Iterable.prototype.constructor = Iterable;

            // Initialize all the traversing algorithm.
            Iterable.prototype.initWith = function (rootNode) {
                return this.iterAPI(rootNode);
            };

            /*
             * Depth first (df) iteration API.
             * This exposes two functions
             * next() - gives the next df node. If all nodes are iterated, the pointer is exhausted,
             * it returns undefined
             * reset() - reset the whole system to the initial state
             * Here the iteration happens without saving the states separately. It is on demand. Means,
             * the moment next is called, the callee node and immediate the children are only allocated.
             *
             * If there is a tree like this
             * A -|
             *    |--- B --|
             *    |        | --- B1
             *    |        | --- B2
             *    |
             *    |--- C --|
             *    |        | --- C1
             *    |        | --- C2
             *    |        | --- C3
             *    |
             *    |--- D
             *
             * It creates array like the following
             * init -  | A |
             * next() - | B | C | D | and returns A
             * next() - | B1 | B2 | C | D | and returns B (because B has children we place the children in front)
             * next() - | B2 | C | D | and returns B1 (because B1 doesn't have children, we just returns it)
             * reset() - | A |
             */
            it.df = function (node) {
                var nextNode = node,
                    dfArr = [],
                    isExhausted = false;

                // initial stage, start with the root node
                dfArr.push(nextNode);

                /*
                 * Apply depth first and returns the next node
                 * @param maxDepth{Number | undefined} - If there is a hardcoded maxDepth specified, beyond that depth
                 of the tree,its children information is not fetched.
                 * @return {TreeNode | undefined} - if the complete tree is iterated returns undefined
                 */
                function next (maxDepth) {
                    var children,
                        fNode,
                        len;


                    if (isExhausted) {
                        // tree iteration complete, return undefined
                        return;
                    }

                    // returns the front node of the array
                    fNode = dfArr.shift();

                    if (exception && fNode === exception) {
                        fNode = dfArr.shift();

                        if (!fNode) {
                            isExhausted = true;
                            return;
                        }
                    }

                    //If maxdepth is defined, no children information is fetched for the node.
                    children = (maxDepth !== undefined) ? ((fNode.getDepth() >= maxDepth) ? [] : fNode.getChildren()) :
                        fNode.getChildren();
                    len = (children && children.length) || 0;

                    if (len) {
                        // place the children at the front of the array
                        [].unshift.apply(dfArr, children);
                    }

                    if (dfArr.length === 0 ) {
                        // Sets the exhaustion flag if the array is empty so that during the next iteration
                        // the iterator returns undefined
                        isExhausted = true;
                    }

                    return fNode;
                }

                /*
                 * Reset the state of the iterator. Every iterator instance needs to reset its state
                 * once it is done traversing. The caller will be responsible for this call.
                 */
                function reset () {
                    // Go back to initial state
                    isExhausted = false;
                    nextNode = node;
                    dfArr.length = 0;
                    dfArr.push(nextNode);
                }

                return {
                    next: next,
                    reset: reset
                };
            };

            /*
             * Breadth first (bf) iteration API.
             * This exposes two functions
             * next() - gives the next df node. If all nodes are iterated, the pointer is exhausted,
             * it returns undefined
             * reset() - reset the whole system to the initial state
             * Here the iteration happens without saving the states separately. It is on demand. Means,
             * the moment next is called, the callee node and immediate the children are only allocated.
             *
             * If there is a tree like this
             * A -|
             *    |--- B --|
             *    |        | --- B1
             *    |        | --- B2
             *    |
             *    |--- C --|
             *    |        | --- C1
             *    |        | --- C2
             *    |        | --- C3
             *    |
             *    | --- D
             *
             * It creates array like the following
             * init -  | A |
             * next() - | B | C | D | and returns A
             * next() - | C | D | B1 | B2 | and returns B (because B has children we place the children in last)
             * next() - | D | B1 | B2 | C1 | C2 | C3 | and returns C (because C has children
             * we place the children in last)
             * next() - | B1 | B2 | C1 | C2 | C3 | and returns D (because D doesn't have children, we just returns it)
             * next() - | B2 | C1 | C2 | C3 | and returns B1 (because B1 doesn't have children, we just returns it)
             * next() - | C1 | C2 | C3 | and returns B2 (because B2 doesn't have children, we just returns it)
             * next() - | C2 | C3 | and returns C1 (because C1 doesn't have children, we just returns it)
             * next() - | C3 | and returns C2 (because C2 doesn't have children, we just returns it)
             * next() - | | and returns C3 (because C3 doesn't have children, we just returns it)
             * reset() - | A |
             */
            it.bf = function (node) {
                var nextNode = node,
                    bfArr = [],
                    bfBatchArray = [],
                    isExhausted = false;

                // initial stage, start with the root node
                bfArr.push(nextNode);
                bfBatchArray.push(nextNode);

                /*
                 * Apply breadth first and returns the next node
                 * @return {TreeNode | undefined} - if the complete tree is iterated returns undefined
                 */
                function next () {
                    var children,
                        fNode,
                        len;


                    if (isExhausted) {
                        return;
                    }

                    fNode = bfArr.shift();
                    children = fNode.getChildren();
                    len = (children && children.length) || 0;

                    if (len) {
                        // Stores all the node of the same level
                        [].push.apply(bfArr, children);
                    }

                    if (bfArr.length === 0) {
                        isExhausted = true;
                    }

                    return fNode;
                }

                /*
                 * Custom function to return all the nodes of level by level
                 * @return {Array.<TreeNode>} - if the complete tree is iterated returns undefined
                 */
                function nextBatch () {
                    var children,
                        fNode,
                        len;

                    if (isExhausted) {
                        return;
                    }

                    fNode = bfBatchArray.shift();
                    children = fNode.getChildren();
                    len = (children && children.length) || 0;

                    if (len) {
                        [].push.apply(bfBatchArray, children);
                    }

                    if (bfArr.length === 0) {
                        isExhausted = true;
                    }

                    return children;
                }

                /*
                 * Reset the state of the iterator. Every iterator instance needs to reset its state
                 * once it is done traversing. The caller will be responsible for this call.
                 */
                function reset () {
                    isExhausted = false;
                    nextNode = node;
                    bfArr.length = 0;
                    bfArr.push(nextNode);
                }

                return {
                    next: next,
                    nextBatch: nextBatch,
                    reset: reset
                };
            };

            // Everytime iterator is called, this creates new depth first algorithm API
            df = (new Iterable(it.df)).initWith(rootNode);
            bf = (new Iterable(it.bf)).initWith(rootNode);

            return {
                df : df,
                bf : bf
            };
        };

        /*
         * Initialization operation to be performed before measuring space for label display.
         * This takes one time information that is applied over all the text emasurement operation.
         * @param padding {Object} - provides x and y padding of the label.
         * @param lineHeight {Number} - line height of text
         * @return {Function} - a function that calculates and return the configuration to draw the text
         */
        function initConfigurationForlabel (padding, lineHeight, attrs) {
            var padX = padding.x,
                padY = padding.y,
                halfLineHeight = lineHeight / 2,
                titleHideFlag = attrs.showParent ? 0 : 1,
                showChildLabels = attrs.showChildLabels;

            /*
             * Calculate the measurement of text.
             * @param node {TreeNode} - node for which the label to be plotted
             * @param rect {Object} - bounding rectangle of node.
             * @return {Object} - the configuration object to draw the text and additional attribute primarily where
             *                     the visibility is maintained
             */
            return function (node, rect, forcedLeaf, forcedLabel) {
                var label,
                    isLeaf = false,
                    textCalConf = {
                        x: undefined,
                        y: undefined,
                        width: undefined,
                        height: undefined
                    },
                    conf = {},
                    rectShiftY = 0,
                    textAttr = {},
                    highlightAttr = {},
                    visibility,
                    availableHeight,
                    meta;

                meta = node.meta;

                if (!node) {
                    return;
                }

                if (!node.isLeaf(maxDepth)) {
                    // Detect the child nodes and set a flag
                    isLeaf = true;
                }

                label = conf.label = node.getLabel();

                textCalConf.width = rect.width - (2 * padX);
                // Places it horizontally in the middle
                textCalConf.x = rect.x + (rect.width / 2);

                availableHeight = rect.height - (2 * padY);

                if (!isLeaf && availableHeight < lineHeight) {
                    textCalConf.height = -1;
                }

                if (!forcedLabel && isLeaf) {
                    // If it is a leaf node the label will be placed in the middle, horizontally and vertically
                    textCalConf.height = showChildLabels ?
                        textCalConf.height ? textCalConf.height: rect.height - (2 * padY) : -1;
                    textCalConf.y = rect.y + (rect.height / 2);
                } else {
                    // If it is not leaf node the label will be placed at the top considering the padding and the
                    // children area will shrink
                    if (!titleHideFlag) {
                        // Places the label of the parent
                        textCalConf.height = textCalConf.height ? textCalConf.height : lineHeight;
                        textCalConf.y = rect.y + padY + halfLineHeight;
                    }
                    else {
                        // Hides the label of parent.
                        textCalConf.y = -1;
                        padY = 0;
                        lineHeight = 0;
                        visibility = 'hidden';
                    }
                }

                // Calculation of shift which will be applied to move the starting point of chidren
                rectShiftY += 2 * padY;
                rectShiftY += lineHeight;

                conf.rectShiftY = rectShiftY;
                conf.textRect = textCalConf;

                if (attrs.labelGlow) {
                    highlightAttr['stroke-width'] = attrs.labelGlowRadius;
                    highlightAttr.opacity = attrs.labelGlowIntensity;
                    highlightAttr.stroke = attrs.labelGlowColor;
                    highlightAttr.visibility = visibility === 'hidden' ? 'hidden' : 'visible';
                } else {
                    highlightAttr.visibility = 'hidden';
                }

                // CSS for node labels
                textAttr = {
                    fill: (meta && meta.fontcolor && normalizeColorCode(meta.fontcolor)) ||
                        attrs.labelFontColor || attrs.baseFontColor,
                    visibility: visibility
                };

                return {
                    conf: conf,
                    attr: textAttr,
                    highlight: highlightAttr
                };
            };
        }

        /*
         * Manages color of all the nodes. This colors the leaf node taking configuration from the xml/json
         * by using ColorRangeManager.
         * For non-leaf (title) nodes it provides color if user has provided one in defaultParentBGColor attribute.
         * The title nodes are not colored from the ColorRangeManager.
         * This takes the initial parameters and initialize the state and hold it until it is called again
         * @param attrs {Object} - All the chart attributes sanitized
         * @param colorRange {ColorRangeManager} - instance of ColorRangeManager that has all the information about the
         *                                      color distribution. This function merely calls the APIs
         * @return {Function} - Returns a function that returns a color code when a node is passed keeping in the state
         *                      intact.
         */
        function mapColorManager (attrs, colorRange, isNavigationBar) {
            var defaultParentBGColor = normalizeColorCode(isNavigationBar ? attrs.defaultNavigationBarBGColor :
                attrs.defaultParentBGColor);

            /*
             * Uses the saved state and returns the color for a node calculating the node value.
             * @param node {TreeNode} - node which is subjected to be colored
             * @return {String} - color in hex
             */
            return function (node, forceLeaf, isNavigationBar) {
                var colorProp = {},
                    cssConf = node.cssConf,
                    meta = node.meta,
                    overriddenColor = meta.fillcolor ? normalizeColorCode(meta.fillcolor) : undefined,
                    parentColor,
                    parentStyle,
                    parentNode = node.getParent(),
                    thisNodeColor,
                    nodeColorValue = node.getColorValue();

                // temp CODE
                attrs.isLegendEnabled = true;

                // Get the generalized color for a node. Later overriden for non-leaf nodes
                thisNodeColor = attrs.isLegendEnabled &&  nodeColorValue === nodeColorValue ?
                        colorRange.getColorByValue(nodeColorValue) &&
                         '#' + colorRange.getColorByValue(nodeColorValue) ||
                            normalizeColorCode(colorRange.rangeOutsideColor) : undefined;

                // Check if the current node in context is a leaf node which in turn is dependent if there is a depth
                // restriction imposed.
                if (node.isLeaf(maxDepth)) {
                    // If the node is not leaf node apply title colors property if available
                    colorProp.fill = overriddenColor || thisNodeColor || defaultParentBGColor;
                } else {
                    parentStyle = (parentNode ? parentNode : node).cssConf;
                    parentColor = parentStyle && parentStyle.fill;

                    thisNodeColor = thisNodeColor ? thisNodeColor : parentColor;
                    colorProp.fill = overriddenColor || thisNodeColor;
                }

                // apply node border thickness and color
                colorProp.stroke = isNavigationBar ? attrs.navigationBarBorderColor : attrs.plotBorderColor;
                colorProp.strokeWidth = isNavigationBar ? attrs.navigationBarBorderThickness :
                    attrs.plotBorderThickness;
                colorProp['stroke-dasharray'] = 'none';
                // applicable for only the treemap.
                if (!isNavigationBar) {
                    if (cssConf && cssConf['stroke-dasharray'] === '--') {
                        colorProp['stroke-dasharray'] = cssConf['stroke-dasharray'];
                        colorProp.strokeWidth = cssConf.strokeWidth;
                    }
                }
                return colorProp;
            };
        }

        /*
         * Serves the purpose of application context. Any Object can be stored and retrieved through the lifetime
         * of the chart instance. This gives back a singleton instance per id. Like if two different store is needed,
         * this is called with two different id. If the ids are kept same same instance is returned.
         */
        context = (function () {
            var objContainer = {},
                pointer;

            // Constructor to create instance per id
            function C_ () {
                // Container of instances of particular id
                this.con = {};
            }

            C_.prototype.constructor = C_;

            C_.prototype.get = function (key) {
                return this.con[key];
            };

            C_.prototype.set = function (key, value) {
                this.con[key] = value;
            };

            C_.prototype['delete'] = function (key) {
                return delete this.con[key];
            };

            return {
                /*
                 * Returns singleton instances per id
                 * @param id {String} - name of id
                 * @return {Object} - returns object if already instantiated or create one and return
                 */
                getInstance : function (id) {
                    var _con;

                    if (_con = objContainer[id]) {
                        // Already instantiated, get the reference and return
                        pointer = _con;
                        return pointer;
                    }

                    // Not available in container means not instantiated, creates a new instance and returns
                    pointer = _con = objContainer[id] = new C_();
                    return pointer;
                }
            };
        })();
        /*
         * Sets the visible root node.
         * @param node {TreeNode} - On drill down/ up the visible root needs to be changed.
        */
        function setVisibleRoot(node) {
            visibleRoot = node;
        }
        /*
         * Fetch the visible root.
         * return {TreeRoot} - The visible root for the current view.
        */
        function getVisibleRoot (){
            return visibleRoot;
        }

        function abstractEventRegisterer (algorithmAPI, dsStore, canvasMeasurement, rendererAPI) {
            var chart = dsStore.chart,
                components = chart.components,
                dataset = components.dataset[0],
                btns = components.toolbarBtns,
                iChart = chart.chartInstance,
                attrs = dsStore.conf,
                legend = components.gradientLegend,
                drawTreeFn = algorithmAPI.drawTree,
                removeFn = rendererAPI.disposeChild,
                backToParent,
                jobList = chart.getJobList(),
                context = afAPI.context,
                args = arguments,
                stateContextId = 'ClickedState',
                visibleState = 'VisibileRoot',
                plotClickEvt = 'dataplotclick',
                plotRollOverEvt = 'dataplotrollover',
                plotRollOutEvt = 'dataplotrollout',
                stateContext,
                resetTree,
                dataUprootMap = {
                    colorValue: 'svalue',
                    label: 'name',
                    value: 'value',
                    rect: 'metrics'
                };


            stateContext = context.getInstance(stateContextId);

            // Save reference of internal subroutines, for later use
            chart._intSR = {};

            function extractEventData (node) {
                var res = {},
                    key,
                    resKey;

                for (key in dataUprootMap) {
                    resKey = dataUprootMap[key];
                    res[resKey] = node[key];
                }

                return res;
            }

            /*
            * Goes back to immediate parent of the view.
            * @param raiseEventFlag {Boolean} - If true event will be raised. Otherwise no.
            *
            */
            chart._intSR.backToParent = backToParent = function (raiseEventFlag) {
                var target = this,
                    _t = target,
                    _p = _t && target.getParent(),
                    context = afAPI.context,
                    stateContextId = 'ClickedState',
                    visibleState = 'VisibileRoot',
                    stateContext = context.getInstance(stateContextId),
                    clickedState = stateContext.get(visibleState) || {};

                chart.config.trackerConfig.length = 0;
                jobList.trackerDrawID.push(schedular.addJob(dataset.kdTreePartioning, dataset, [],
                            lib.priorityList.tracker));

                if (raiseEventFlag) {
                    /** @todo eventname should be taken from constants */
                    /** @todo common event handling API */
                    raiseEvent('beforedrillup', {
                        node: target,
                        withoutHead: !attrs.showParent
                    }, iChart, undefined, function () {
                        // If the event is not prevented in anyway

                        if (_p) {
                            clickedState.state = 'drillup';
                            clickedState.node = [{virginNode: afAPI.getVisibleRoot()}, _p];
                            // Remove all the elements from the paper and redraw the tree
                            //using a different root node.
                            removeFn(_t);
                            drawTreeFn.apply(_p, args);
                        }

                        // Render complete now raise the event
                        /** @todo eventname should be taken from constants */
                        raiseEvent('drillup', {
                            node: target,
                            withoutHead: !attrs.showParent,
                            drillUp: backToParent,
                            drillUpToTop: resetTree
                        }, iChart);

                        target = target && target.getParent();
                    }, function () {
                        // Event is prevented
                        raiseEvent('drillupcancelled', {
                            node: target,
                            withoutHead: !attrs.showParent
                        }, iChart);
                    });
                } else {
                    if (_p) {
                        clickedState.state = 'drillup';
                        clickedState.node = [{virginNode: afAPI.getVisibleRoot()}, _p];
                        // Remove all the elements from the paper and redraw the tree
                        // using a different root node.
                        removeFn(_t);
                        drawTreeFn.apply(_p, args);
                    }

                    target = target && target.getParent();
                }
            };

            /*
            * Goes back to absolute parent of the view.
            * @param raiseEventFlag {Boolean} - If true event will be raised. Otherwise no.
            *
            * @todo donot pollute the chart object. Function access restructuring.
            */
            chart._intSR.resetTree = resetTree = function (raiseEventFlag) {
                var target = this,
                    _p = target && target.getParent(),
                    _t,
                    context = afAPI.context,
                    stateContextId = 'ClickedState',
                    visibleState = 'VisibileRoot',
                    stateContext = context.getInstance(stateContextId),
                    clickedState = stateContext.get(visibleState) || {};

                chart.config.trackerConfig.length = 0;
                jobList.trackerDrawID.push(schedular.addJob(dataset.kdTreePartioning, dataset, [],
                            lib.priorityList.tracker));

                while (_p) {
                    // Swaps the references. Keep clicked node in one variable and parent in
                    // another variable.
                    _t = _p;
                    _p = _p.getParent();
                }

                if (raiseEventFlag) {
                    // @todo eventname should be taken from constants
                    raiseEvent('beforedrillup', {
                        node: target,
                        withoutHead: !attrs.showParent
                    }, iChart, undefined, function () {
                        if (_t) {
                            clickedState.state = 'drillup';
                            clickedState.node = [{virginNode: afAPI.getVisibleRoot()}, _t];

                            // Remove all the elements from the paper and redraw the tree using
                            // a different root node.
                            removeFn(_t);
                            drawTreeFn.apply(_t, args);

                            /* @todo eventname should be taken from constants */
                            raiseEvent('drillup', {
                                node: target,
                                sender: chart.fusionCharts,
                                withoutHead: !attrs.showParent,
                                drillUp: backToParent,
                                drillUpToTop: resetTree
                            }, iChart);
                        }
                    }, function () {
                        raiseEvent('drillupcancelled', {
                            node: target,
                            withoutHead: !attrs.showParent
                        }, iChart);
                    });
                } else {
                    if (_t) {
                        clickedState.state = 'drillup';
                        clickedState.node = [{virginNode: afAPI.getVisibleRoot()}, _t];

                        // Remove all the elements from the paper and redraw the tree using a different
                        // root node.
                        removeFn(_t);
                        drawTreeFn.apply(_t, args);
                    }
                }
            };

            return {
                click: function (node, baseNode) {
                    var thisVNode = node.virginNode,
                        singleTracker = dataset.graphics.singleTracker,
                        kdTree = dataset.kdTree,
                        // tipE = lib.toolTip,
                        eventName,
                        parent,
                        target;

                    // kdTree && (kdTree.length = 0);

                    raiseEvent(plotClickEvt, extractEventData(node.virginNode), iChart);

                    parent = thisVNode.getParent();

                    if (!parent) {
                        // If the click is on root node, return since it is not possible to go back and
                        // display the parent
                        return;
                    }

                    if (thisVNode === baseNode) {
                        // If the top most rectangle is clicked show the parent rectangle of it. This
                        // is for iterative click (once drilled down)
                        target = parent;
                        // trackerConfig array made empty for new kd-tree
                        // tipE.hide();
                        kdTree && (kdTree.length = 0);
                        chart.config.trackerConfig.length = 0;
                        /** @todo eventname should be taken from constants */
                        eventName = 'drillup';
                    } else {
                        if (thisVNode.next) {
                            // If the click is not on top most rectangle (base node)and base node
                            // has children, drill down to the clicked node
                            target = thisVNode;
                            // tipE.hide();
                            kdTree && (kdTree.length = 0);
                            // trackerConfig array made empty for new kd-tree
                            chart.config.trackerConfig.length = 0;
                            /** @todo eventname should be taken from constants */
                            eventName = 'drilldown';
                        } else {
                            // If the click is not on top most rectangle (base node)and base node
                            // doesnot have any more chidren drill down to the parent node of clicked node
                            target = parent;
                            if (baseNode === target) {
                                eventName = undefined;
                                return;
                            } else {
                                // trackerConfig array made empty for new kd-tree
                                chart.config.trackerConfig.length = 0;
                                /** @todo eventname should be taken from constants */
                                eventName = 'drilldown';
                            }
                        }
                    }

                    // Reset the legend once any traversal happens
                    (legend && legend.enabled) && legend.resetLegend();
                    algorithmAPI.applyShadeFiltering.reset();

                    /** @todo eventname should be taken from constants */
                    eventName && raiseEvent('before' + eventName, {
                        node: target,
                        withoutHead: !attrs.showParent
                    }, iChart, undefined, function () {
                        stateContext.set(visibleState, {
                            node: node,
                            state: eventName
                        });

                        // Remove everything from the paper
                        removeFn.call(rendererAPI, target);
                        // reset the visible Root
                        setVisibleRoot(target);

                        // Redraw by assigning a new root
                        containerManager.draw();

                        // @todo eventname should be taken from constants

                        raiseEvent(eventName, {
                            node: target,
                            withoutHead: !attrs.showParent,
                            drillUp: backToParent,
                            drillUpToTop: resetTree
                        }, iChart);

                    }, function () {
                        // Event is cancelled
                        raiseEvent(eventName + 'cancelled', {
                            node: target,
                            withoutHead: !attrs.showParent
                        }, iChart);
                    });

                    btns.back && btns.back.attachEventHandlers({
                        'click' : backToParent.bind(target)
                    });

                    btns.home && btns.home.attachEventHandlers({
                        'click' : resetTree.bind(target)
                    });

                    singleTracker && singleTracker.attr({
                        x: 0,
                        y: 0,
                        width: 0,
                        height: 0,
                        stroke: 'rgba(255,255,255,0)'
                    });
                },

                mouseover: function (node) {
                    var evtData = extractEventData(node.virginNode);
                    raiseEvent(plotRollOverEvt, evtData, iChart, undefined, undefined,
                        function () {
                            raiseEvent(plotRollOverEvt + 'cancelled', evtData, iChart);
                        });
                },

                mouseout: function (node) {
                    var evtData = extractEventData(node.virginNode),
                        singleTracker = dataset.graphics.singleTracker;

                    singleTracker && singleTracker.attr({
                        x: 0,
                        y: 0,
                        width: 0,
                        height: 0,
                        stroke: 'rgba(255,255,255,0)'
                    });

                    raiseEvent(plotRollOutEvt, extractEventData(node.virginNode), iChart, undefined, undefined,
                        function () {
                            raiseEvent(plotRollOutEvt + 'cancelled', evtData, iChart);
                        });
                }
            };
        }

        visibilityController = (function () {
            var restOfTheTreeArr = [],
                nextVisibileTreeRoot,
                inProgress = false,
                attrVisible = {visibility: 'visible'};

            return {
                controlPreAnimVisibility: function (node, superNode) {
                    var rootNode,
                        tempNode,
                        itr,
                        dfItr,
                        nextNode,
                        overAttr;

                    if (!node) {
                        return;
                    }

                    tempNode = node;
                    while (true) {
                        tempNode = tempNode.getParent();

                        if (!tempNode) {
                            break;
                        }
                        rootNode = tempNode;
                    }

                    itr = iterator(rootNode, { exception: node });
                    dfItr = itr.df;

                    while (true) {
                        nextNode = dfItr.next();
                        if (!nextNode) {
                            break;
                        }

                        overAttr = nextNode.overAttr || (nextNode.overAttr = {});
                        overAttr.visibility = 'hidden';
                        restOfTheTreeArr.push(nextNode);
                    }

                    nextVisibileTreeRoot = superNode || node.getParent();

                    inProgress = false;
                    return restOfTheTreeArr;
                },

                displayAll: function (node) {
                    var itr,
                        overAttr,
                        dfItr,
                        nextNode;

                    if (!node) { return; }

                    itr = iterator(node.getParent() || node);
                    dfItr = itr.df;

                    while (true) {
                        nextNode = dfItr.next();
                        if (!nextNode) {
                            break;
                        }

                        overAttr = nextNode.overAttr || (nextNode.overAttr = {});
                        overAttr.visibility = 'visible';
                    }

                    nextVisibileTreeRoot = undefined;
                    restOfTheTreeArr.length = 0;
                    inProgress = false;
                },

                controlPostAnimVisibility: function () {
                    var textItem,
                        dirtyNode,
                        itr,
                        dfItr,
                        nextNode;

                    if (inProgress) {
                        return;
                    }

                    inProgress = true;

                    if (!nextVisibileTreeRoot) { return; }

                    itr = iterator(nextVisibileTreeRoot);
                    dfItr = itr.df;

                    while (true) {
                        nextNode = dfItr.next(maxDepth);
                        if (!nextNode) {
                            break;
                        }

                        if (dirtyNode = nextNode.dirtyNode) {
                            dirtyNode && dirtyNode.plotItem.attr(attrVisible);
                            textItem = dirtyNode && dirtyNode.textItem;
                            textItem && textItem.label && textItem.label.attr(attrVisible);
                            textItem && textItem.label && textItem.highlightMask.attr(attrVisible);
                        }
                    }

                    nextVisibileTreeRoot = undefined;
                    restOfTheTreeArr.length = 0;
                }
            };
        })();

        afAPI.AbstractTreeMaker = AbstractTreeMaker;
        afAPI.iterator =  iterator;
        afAPI.initConfigurationForlabel = initConfigurationForlabel;
        afAPI.context = context;
        afAPI.mapColorManager = mapColorManager;
        afAPI.abstractEventRegisterer = abstractEventRegisterer;
        afAPI.setMaxDepth = setMaxDepth;
        afAPI.getVisibleRoot = getVisibleRoot;
        afAPI.setVisibleRoot = setVisibleRoot;
        afAPI.visibilityController = visibilityController;

        return afAPI;
    };

    /*
     * Defines the tiling algorithm and exposes api to access those.
     */
    algorithmFactoryCreator = function (afAPI, algorithmFactory) {
        var algo,
            AbstractTreeMaker = afAPI.AbstractTreeMaker,
            algorithm,
            treeMaker,
            tree,
            bucketIterationMode,
            depthIncrement,
            maxDepth,
            drawingAreaMeasurement;

        algo = {
            'sliceanddice' : {
                /*
                 * Provides a more managed way to calculate space for child.
                 * This takes minimum space configuration and applies it over all the subsequent calculation
                 * @param horizontalPadding {Integer} - space between parent and child in x direction
                 * @param verticalPadding {Integer} - space between parent and child in y direction
                 * @return {Function} - A function to be called, everytime space for a new node needs to be
                 * calculated
                 */
                areaBaseCalculator: function (horizontalPadding, verticalPadding) {
                    var sx = horizontalPadding, sy = verticalPadding;

                    /*
                     * Provides the basic information of the tree so that the current node can use that and
                     * calculate the space
                     * @param node {TreeNode} - node which is the subject to calculation
                     * @param posOffsetApplyFn {Function} - logic of calculation. This function is called with
                     *      meta information, immediate left sibling (if any) and parent. The context
                     *      of this function is changed with the one which is subject to calculation.
                     * @param options {Object} - provides additional options to the calculation.
                                                Something like space for label.
                     * @return {Object} - returns what ever posOffsetApplyFn returns.
                     */
                    return function (node, posOffsetApplyFn, options) {
                        var parent,
                            leftSibling,
                            denominator,
                            meta = {},
                            eHeight,
                            eWidth,
                            parentRect,
                            textMargin = 0,
                            negSpacesY = 0;

                        if (!node) {
                            return;
                        }

                        if (options) {
                            textMargin = options.textMargin || textMargin;
                        }

                        negSpacesY = textMargin;

                        parent = node.getParent();
                        // Get immediate left sibling
                        leftSibling = node.getSibling('left');

                        if (parent) {
                            // Denomitor to calculate the area. Every parent value is the sum of all children value
                            denominator = parent.getValue();
                            parentRect = parent.rect;
                            // Calculate the width and hight of the space where children will be drawn.
                            // This ideally depend on the space that was passed when the outer most function
                            // was called
                            eHeight = parentRect.height - (2 * sy) - negSpacesY;
                            eWidth = parentRect.width - (2 * sx);

                            /*
                             * This is the inner logical rectangle where the child is drawn. If horizontalPadding
                               and verticalPadding
                             * is zero it is as same as the outermost rectangle. Something like
                             *
                             *  Parent rect
                             *  -----------------------
                             * |  verticalPadding     s|
                             * |  ------------------- p|
                             * | | effective rect    |a|
                             * | | where child will  |c|
                             * | | be drawn          |e|
                             * | |                   |x|
                             */
                            meta.effectiveRect = {
                                height: eHeight,
                                width: eWidth,
                                x: parentRect.x + sx,
                                y: parentRect.y + sy + negSpacesY
                            };
                            meta.effectiveArea =eHeight * eWidth;
                            meta.ratio = node.getValue() / denominator;

                            if (leftSibling) {
                                // If this is not the first children, this will be drawn relative
                                // to the former children
                                return posOffsetApplyFn.call(node, meta, leftSibling, parent);
                            } else {
                                // Flag indication that the last retrieved is parent
                                meta.lastIsParent = true;
                                // First children. This will be drawn relative
                                return posOffsetApplyFn.call(node, meta, parent);
                            }
                        } else {
                            // If parent is not present the it is the root node. For root node use the
                            // original canvas area. If parent is not present there is also no chance to
                            // have siblings of the node. Since there can only be only one root node
                            return null;
                        }
                    };
                },

                /*
                 * Initializes the state required when the legend is dragged and effect to be applied
                 * @param overrideEffect {Object} - style to be applied in key-value pair
                 * @param rangeOutFn {Function} - Function to be executed when outliers are found
                 * @return {Function} - Control function that operates on outliers by adjusting the range
                 */
                applyShadeFiltering: function (bucketInstance, overrideEffect, rangeOutFn) {
                    // Set style information
                    bucketInstance.setRangeOutEffect(overrideEffect, rangeOutFn);

                    this.applyShadeFiltering.reset = function() {
                        bucketInstance.resetPointers();
                    };

                    /*
                     * Control the effect to be executed on outliers.
                     * @param limits {Object} - an simple javascript object containing the start and end limit of
                     *                          the legend
                     */
                    return function (limits) {
                        bucketInstance.moveLowerShadePointer(limits.start);
                        bucketInstance.moveHigherShadePointer(limits.end);
                    };

                },
                /*
                 * logic of calculation. This function is called with meta information, immediate left sibling
                 * (if any) and parent. The context of this function is changed with the one which is subject to
                 * calculation.
                */
                alternateModeManager: function () {
                    return function (meta, lastPoint) {
                        var height,
                            width,
                            isDirectionVertical,
                            dx,
                            dy,
                            cNode = this,
                            baseArea = meta.effectiveArea,
                            ratio = meta.ratio,
                            childArea = baseArea * ratio,
                            effectiveRect = meta.effectiveRect,
                            lastRect = lastPoint.rect,
                            lastIsParent = meta.lastIsParent;

                        if (lastIsParent) {
                            // If the node is the first children, take measurement of the effective rect
                            dx = effectiveRect.x;
                            dy = effectiveRect.y;
                            height = effectiveRect.height;
                            width = effectiveRect.width;

                            // First direction is vertical (or parameterized)
                            isDirectionVertical = cNode.isDirectionVertical = true;
                        } else {
                            // If the node is not the first child, get the remaining height and width where
                            // the drawing will happen
                            height = (effectiveRect.height + effectiveRect.y) - (lastRect.height + lastRect.y);
                            width = (effectiveRect.width + effectiveRect.x) - (lastRect.width + lastRect.x);

                            // Every child drawing direction will be opposite of what the immediate left
                            // sibling used to be
                            isDirectionVertical = cNode.isDirectionVertical = !lastPoint.isDirectionVertical;
                        }

                        if (isDirectionVertical) {
                            // If this orientation is vertical possible that the last one is horizontal
                            width = childArea / height;
                            dx = dx !== undefined ? dx : lastRect.x;
                            dy = dy !== undefined ? dy : (lastRect.y + lastRect.height);
                        } else {
                            height = childArea / width;
                            dx = dx !== undefined ? dx : (lastRect.x + lastRect.width);
                            dy = dy !== undefined ? dy : lastRect.y;
                        }

                        return {
                            height : height,
                            width : width,
                            x : dx,
                            y : dy
                        };
                    };
                },

                horizontalVerticalManager: function (slicingMode) {
                    var isVerticalSlicing = Boolean((slicingMode === 'vertical') ? true : false);
                    return function (meta, lastPoint) {
                        var height,
                            width,
                            isDirectionVertical,
                            dx,
                            dy,
                            cNode = this,
                            baseArea = meta.effectiveArea,
                            ratio = meta.ratio,
                            childArea = baseArea * ratio,
                            effectiveRect = meta.effectiveRect,
                            lastRect = lastPoint.rect,
                            lastIsParent = meta.lastIsParent;

                        if (lastIsParent) {
                            // If the node is the first children, take measurement of the effective rect
                            dx = effectiveRect.x;
                            dy = effectiveRect.y;
                            height = effectiveRect.height;
                            width = effectiveRect.width;

                            // First direction is vertical (or parameterized)
                            isDirectionVertical = cNode.isDirectionVertical = !lastPoint.isDirectionVertical;
                        } else {
                            // If the node is not the first child, get the remaining height and width where
                            // the drawing will happen
                            height = (effectiveRect.height + effectiveRect.y) - (lastRect.height + lastRect.y);
                            width = (effectiveRect.width + effectiveRect.x) - (lastRect.width + lastRect.x);

                            // Every child drawing direction will be opposite of what the immediate left
                            // sibling used to be
                            isDirectionVertical = cNode.isDirectionVertical = !arguments[2].isDirectionVertical;
                        }
                        //toogle the directional flag as per the slicing mode.
                        isDirectionVertical = isVerticalSlicing ? isDirectionVertical : !isDirectionVertical;
                        if (isDirectionVertical) {
                            // If this orientation is vertical possible that the last one is horizontal
                            if (height === 0) {
                                height = effectiveRect.height;
                                dx = dx !== undefined ? dx : (lastRect.x + lastRect.width);
                                dy = dy !== undefined ? dy : lastRect.y;
                            }
                            width = childArea / height;
                            dx = dx !== undefined ? dx : lastRect.x;
                            dy = dy !== undefined ? dy : (lastRect.y + lastRect.height);
                        } else {
                            if (width === 0) {
                                width = effectiveRect.width;
                                dx = dx !== undefined ? dx : lastRect.x;
                                dy = dy !== undefined ? dy : (lastRect.y + lastRect.height);
                            }
                            height = childArea / width;
                            dx = dx !== undefined ? dx : (lastRect.x + lastRect.width);
                            dy = dy !== undefined ? dy : lastRect.y;
                        }

                        return {
                            height : height,
                            width : width,
                            x : dx,
                            y : dy
                        };
                    };
                },

                /*
                 * Maps the logical tree to nested rectangle and render on the paper.
                 * @param algorithmAPI {algorithmFactory} - all the apis for the running algorithm
                 * @param chart {Object}
                 * @param canvasMeasurement {Object} - Simple key-value pair of information
                 *                                      of the available drawing area.
                 * @param rendererAPI {Object} - API needed to render the objects in the drawing area.
                 */
                drawTree: function (algorithmAPI, dsStore, canvasMeasurement, rendererAPI) {
                    var treeRoot = this,
                        chart = dsStore.chart,
                        components = chart.components,
                        config = chart.config || (chart.config = {}),
                        trackerConfig = config.trackerConfig || (config.trackerConfig = []),
                        numberFormatter = components.numberFormatter,
                        btns = components.toolbarBtns,
                        drawRectFn = rendererAPI.drawRect,
                        drawTextFn = rendererAPI.drawText,
                        drawHotFn = rendererAPI.drawHot,
                        xShift = canvasMeasurement.horizontalPadding,
                        yShift = canvasMeasurement.verticalPadding,
                        smartLabel = dsStore.chart.linkedItems.smartLabel,
                        lineHeight,
                        labelPadding = {
                            x: 5,
                            y: 5
                        },
                        iterator = afAPI.iterator,
                        itr = iterator(treeRoot),
                        dfItr = itr.df,
                        baseNode,
                        getNextAreaBase = algorithmAPI.areaBaseCalculator(xShift, yShift),
                        attrs = dsStore.conf,
                        highlightParentsOnHover = attrs.highlightParentsOnHover,
                        getTextConf,
                        context = afAPI.context,
                        visController = afAPI.visibilityController,
                        colorRange = dsStore.conf.colorRange,
                        localColorProvider = afAPI.mapColorManager(attrs, colorRange),
                        abstractEvtReg = afAPI.abstractEventRegisterer.apply(afAPI, arguments),
                        clickEvtImpl = abstractEvtReg.click,
                        mouseoverEvtImpl = abstractEvtReg.mouseover,
                        mouseoutEvtImpl = abstractEvtReg.mouseout,
                        slicingMode = attrs.slicingMode,
                        postNodeFetcher = algorithmAPI[((slicingMode === 'alternate') ? 'alternateModeManager' :
                            'horizontalVerticalManager')](slicingMode),
                        _baseNode,
                        _intSR = chart._intSR,
                        resetTree,
                        backToParent,
                        stateContextId = 'ClickedState',
                        visibleState = 'VisibileRoot',
                        stateContext,
                        clickedState,
                        csNode;

                    stateContext = context.getInstance(stateContextId);
                    clickedState = stateContext.get(visibleState) || {};
                    csNode = clickedState.node;

                    if (clickedState.node && clickedState.state) {
                        if (clickedState.state.toLowerCase() === 'drillup') {
                            if (csNode instanceof Array) {
                                visController.controlPreAnimVisibility(csNode[0].virginNode, csNode[1]);
                            } else {
                                visController.controlPreAnimVisibility(csNode.virginNode);
                            }
                        } else {
                            visController.displayAll(clickedState.node.virginNode);
                        }
                    }


                    lineHeight = attrs.parentLabelLineHeight;
                    // Gets label configuration
                    getTextConf = afAPI.initConfigurationForlabel(labelPadding, lineHeight, attrs);

                    // First time iteration to get the root node
                    // maximum level of tree traversal is set to the value incremented with the current node depth
                    baseNode =  dfItr.next((maxDepth = (afAPI.setMaxDepth(treeRoot.getDepth() + depthIncrement))));

                    _baseNode = baseNode;
                    while (_baseNode.getParent()) {
                        // The loop is added if the root of the tree is passed via attributes otherwise we could
                        // have done just by saving the reference in a variable.
                        _baseNode =  _baseNode.getParent();
                    }

                    if (!attrs.showNavigationBar) {
                        if (_baseNode != baseNode) {
                            btns.home.show();
                            btns.back.show();
                        }
                        else {
                            btns.home.hide();
                            btns.back.hide();
                        }
                    } else {
                        btns.home.hide();
                        btns.back.hide();
                    }

                    smartLabel.useEllipsesOnOverflow(chart.config.useEllipsesWhenOverflow);
                    smartLabel.setStyle((attrs._setStyle = {
                        fontSize: (attrs.labelFontSize || attrs.baseFontSize) + 'px',
                        fontFamily: (attrs.labelFont || attrs.baseFont),
                        lineHeight: (1.2 * (attrs.labelFontSize || attrs.baseFontSize)) + 'px'
                    }));
                    // Save the state in reflow conf
                    // reflowData.tree = baseNode;
                    backToParent = _intSR.backToParent;
                    resetTree = _intSR.resetTree;
                    btns.back && btns.back.attachEventHandlers({
                        'click' : backToParent.bind(baseNode)
                    });

                    btns.home && btns.home.attachEventHandlers({
                        'click' : resetTree.bind(baseNode)
                    });

                    /*
                     * This function recursively draws the tree using depth first algorithm.
                     * @param node {TreeMap} - node to be drawn;
                     * @param drawingArea {Object} - ultimate drawing area of the node. By ultimate it means
                     *                              no more operation will be performed
                     */
                    (function rec (node, drawingArea) {
                        var nextNode,
                            _rect,
                            _textRect,
                            hotItem,
                            labelItem,
                            highlightItem,
                            textItem,
                            nodeDrawingArea,
                            rect,
                            textRect,
                            textConfObj,
                            textConf,
                            options = {},
                            label,
                            plotItem,
                            plotDetails = {},
                            evtFns = {},
                            hoverContextPointerName = 'hover',
                            cssConf = {},
                            colorDimension = '',
                            colorValue,
                            formattedValue,
                            formattedsValue;

                        if (!node) {
                            // break condition of recursive iteration
                            return;
                        }
                        formattedValue = numberFormatter.yAxis(node.getValue());
                        formattedsValue = numberFormatter.sYAxis(node.getColorValue());
                        node.setPath();
                        //cache the previous rectangular configurations for animating the rectangle.
                        _rect = node.rect || {};
                        _textRect = node.textRect || {};

                        rect = node.rect = {};
                        textRect = node.textRect = {};

                        // Get rectangle to draw the node
                        rect.width = drawingArea.width;
                        rect.height = drawingArea.height;
                        rect.x = drawingArea.x;
                        rect.y = drawingArea.y;

                        // Get the color and border configuration
                        cssConf = localColorProvider(node);
                        plotItem = node.plotItem;
                        //If plotItem exists, then its the interacted sub-tree which is updated with a
                        // different animations
                        if (plotItem) {
                            // dispose the graphic rectangle for the selected node.
                            rendererAPI.graphicPool(true, 'plotItem', plotItem, _rect);
                        }

                        plotItem = node.plotItem = drawRectFn(rect, cssConf, _rect, node.overAttr);
                        node.cssConf = cssConf;

                        // Get the configuration to draw text
                        textConfObj = getTextConf(node, rect);
                        textConf = textConfObj.conf;
                        // Offset that will be used to plot the children
                        options.textMargin = textConf.rectShiftY;
                        textRect =  node.textRect = textConf.textRect;
                        // Get the normalized text
                        label = smartLabel.getSmartText(textConf.label, textRect.width, textRect.height).text;

                        // Saves the reference so that the event listener can use it, and also useful for disposing.
                        node.plotItem = plotItem;
                        labelItem = node.labelItem;
                        if (labelItem) {
                            highlightItem = node.highlightItem;
                            rendererAPI.graphicPool(true, 'labelItem', labelItem, _rect);
                            rendererAPI.graphicPool(true, 'highlightItem', highlightItem, _rect);
                        }
                        else {
                            _textRect = _textRect || {};
                        }
                        textItem = drawTextFn(label, textRect, {
                            textAttrs : textConfObj.attr,
                            highlightAttrs: textConfObj.highlight
                        } ,_textRect, node.overAttr);

                        node.labelItem = textItem.label;
                        node.highlightItem = textItem.highlightMask;


                        // Save all the references so that it can be used as context
                        plotDetails.virginNode = node;
                        plotDetails.plotItem = plotItem;
                        plotDetails.textItem = textItem;
                        // Save circular reference for query
                        plotDetails.virginNode.dirtyNode = plotDetails;

                        if (colorValue = node.getColorValue()) {
                            colorDimension = attrs.tooltipSeparationCharacter + formattedsValue;
                        }

                        if (attrs.showTooltip) {
                            plotDetails.toolText = lib.parseTooltext(attrs.plotToolText, [1, 2, 3, 119, 122], {
                                label: node.getLabel(),
                                formattedValue: formattedValue,
                                formattedsValue: formattedsValue
                            }, {
                                value: node.getValue(),
                                svalue: node.getColorValue()
                            }) || node.getLabel() + attrs.tooltipSeparationCharacter + formattedValue + colorDimension;
                        }
                        else {
                            plotDetails.toolText = BLANKSTRING;
                        }
                        plotDetails.rect = rect;

                        /** @todo - the abstract event handler should come from algorithmAP */
                        evtFns.hover = [function (forcedTracker) {
                            var elem = this,
                                parentElem,
                                targetElement,
                                virginNode,
                                hoverContext,
                                css,
                                maskRgba,
                                hoverMaskAlpha = 60;

                            // Get the context if created or create a new one and get
                            hoverContext = context.getInstance(hoverContextPointerName);
                            virginNode = elem.virginNode;

                            if (highlightParentsOnHover && !virginNode.next) {
                                // If all the sibling leaves to be hovered together attribute is set and
                                // the node is really a leaf
                                parentElem = virginNode.getParent();
                                targetElement = parentElem ? parentElem : virginNode;
                            } else {
                                // Set hover effect on the child itself
                                targetElement = elem.virginNode;
                            }

                            // Set it on context
                            hoverContext.set('element', targetElement);

                            css = targetElement.cssConf;
                            maskRgba = convertColor(getLightColor(css.fill, 80), hoverMaskAlpha);
                            forcedTracker.attr({'fill' : maskRgba});
                            mouseoverEvtImpl(this);
                        }.bind(plotDetails), function () {
                            var hoverContext,
                                targetElement,
                                css,
                                unmaskRgba,
                                hoverMaskAlpha = 0;

                            // Get the context, which is most definitely created during the mouseover
                            hoverContext = context.getInstance(hoverContextPointerName);
                            targetElement = hoverContext.get('element');

                            css = targetElement.cssConf;
                            unmaskRgba = convertColor(css.fill || '#fff', hoverMaskAlpha);
                            targetElement.plotItem.tracker.attr({'fill' : unmaskRgba});

                            mouseoutEvtImpl(this);
                        }.bind(plotDetails)];

                        evtFns.tooltip =  [plotDetails.toolText];

                        evtFns.click =  [function () {
                            clickEvtImpl(this, baseNode);
                        }.bind(plotDetails)];

                        hotItem = node.hotItem;
                        if (hotItem) {
                            rendererAPI.graphicPool(true, 'hotItem', hotItem, _rect);
                        }

                        // hotItem = node.hotItem = drawHotFn(plotDetails, evtFns);
                        trackerConfig.push({
                            node: node,
                            key: 'hotItem',
                            plotDetails: plotDetails,
                            evtFns: evtFns,
                            callback: drawHotFn
                        });
                        // Get the next node which will be plotted
                        nextNode = dfItr.next(maxDepth);
                        nodeDrawingArea = getNextAreaBase(nextNode, postNodeFetcher, options);


                        // Recursively call the same function to draw the tree
                        rec(nextNode, nodeDrawingArea);
                    })(baseNode, canvasMeasurement);
                }
            },

            'squarified' : {
                orderNodes: function () {
                    return this.sort(function (m, n) {
                        return parseFloat(m.value, 10) < parseFloat(n.value, 10) ? 1 : -1;
                    });
                },

                /*
                 * Provides a more managed way to calculate space for child.
                 * This takes minimum space configuration and applies it over all the subsequent calculation
                 * @param horizontalPadding {Integer} - space between parent and child in x direction
                 * @param verticalPadding {Integer} - space between parent and child in y direction
                 * @return {Function} - A function to be called, everytime space for a new node needs
                 *                      to be calculated
                 */
                areaBaseCalculator: function (horizontalPadding, verticalPadding) {
                    var sx = horizontalPadding, sy = verticalPadding;

                    /*
                     * Provides the basic information of the tree so that the current node can use that and
                     * calculate the space
                     * @param node {TreeNode} - node which is the subject to calculation
                     * @param posOffsetApplyFn {Function} - logic of calculation. This function is called with meta
                     *       information, immediate left sibling (if any) and parent. The context of this function
                     *       is changed with the one which is subject to calculation.
                     * @param options {Object} - provides additional options to the calculation.
                                                Something like space for label.
                     * @return {Object} - returns what ever posOffsetApplyFn returns.
                     */
                    return function (nodes, posOffsetApplyFn, options) {
                        var parent,
                            meta = {},
                            eHeight,
                            eWidth,
                            textMargin = 0,
                            negSpacesY = 0,
                            anyNode,
                            parentRect;

                        if (!nodes || nodes.length === 0) {
                            return;
                        }

                        if (options) {
                            textMargin = options.textMargin || textMargin;
                        }

                        negSpacesY = textMargin;

                        anyNode = nodes[0];
                        parent = anyNode.getParent();

                        if (parent) {
                            parentRect = parent.rect;
                            // Calculate the width and hight of the space where children will be drawn.
                            // This ideally depend on the space that was passed when the outer most
                            // function was called
                            eHeight = parentRect.height - (2 * sy) - negSpacesY;
                            eWidth = parentRect.width - (2 * sx);

                            /*
                             * This is the inner logical rectangle where the child is drawn.
                             * If horizontalPadding and verticalPadding is zero
                             * it is as same as the outermost rectangle. Something like
                             *
                             *  Parent rect
                             *  -----------------------
                             * |  verticalPadding     s|
                             * |  ------------------- p|
                             * | | effective rect    |a|
                             * | | where child will  |c|
                             * | | be drawn          |e|
                             * | |                   |x|
                             */
                            meta.effectiveRect = {
                                height: eHeight,
                                width: eWidth,
                                x: parentRect.x + sx,
                                y: parentRect.y + sy + negSpacesY
                            };
                            meta.effectiveArea = eHeight * eWidth;

                            return posOffsetApplyFn.call(anyNode, meta, parent);
                        } else {
                            // If parent is not present the it is the root node. For root node use the original
                            // canvas area. If parent is not present there is also no chance to have siblings
                            // of the node. Since there can only be only one root node
                            return null;
                        }
                    };
                },

                /*
                 * The squarified algorithm is a recursive way to find the best aspect ratio of a node, given an
                 * incremental state. Here we create layouts based on the aspect ratio of parent container.
                 * Inside this layout the rects are placed one by one and is checked for best aspect ratio.
                 * If at any given state the aspect ratio of a node increases than what it had before
                 * the layout manager restores the previous state.
                 * Here layout means the rectanglular plot inside which the new nodes are contained.
                 */
                layoutManager: (function () {

                    /*
                     * Creates a new layout depending on the value of width and height of the available area.
                     * @param root {Object} - parent rectangle of the current layout
                     * @param totalValue {Integer} - total value of the parent which will be set in denominator
                     *                              and is used when the plot assignment happens.
                     * @constructor
                     */
                    function RowLayout (root, totalValue) {
                        this.totalValue = totalValue;
                        this._rHeight = root.height;
                        this._rWidth = root.width,
                        this._rx = root.x;
                        this._ry = root.y;
                        this._rTotalArea = root.height * root.width;
                        // Nodes which are placed in the current layout
                        this.nodes = [];
                        // Previous aspect ratio before the last node is added in the layout
                        this._prevAR = undefined;

                        if (this._rHeight < this._rWidth) {
                            // If the height of parent rectangle is larger than the width then the layout is
                            // formed in vertical direction.
                            this._hSegmented = true;
                        }
                    }

                    RowLayout.prototype.constructor = RowLayout;

                    /*
                     * Adds node the current layout then calculates and compares the aspect ratio.
                     * @param node {TreeNode} - node to be added in the current layout
                     * @return {TreeNode | Boolean} - if the new layout (affter addition of node) is not stable
                     *                              (aspect ratio is more than the last one) return false, otherwise
                     *                              return the last added node
                     */
                    RowLayout.prototype.addNode = function (node) {
                        var totalArea = this._rTotalArea, area,
                            ratio,
                            width,
                            height,
                            i, len, length,
                            snVal, snArea, snHeight, snWidth,
                            rect,
                            _hSegmented = this._hSegmented,
                            _x = this._rx, _y = this._ry,
                            _nextX, _nextY,
                            _rect,
                            remainingHeight, remainingWidth,
                            maxSide, minSide,
                            valueSoFar = 0,
                            cRect;

                        // Push node in the current layout to calculate the current aspect ratio and to determine
                        // whether it is larger than the previous one;
                        this.nodes.push(node);

                        for (i = 0, length = this.nodes.length; i < length; i++) {
                            // The numeraic value of all the nodes which are in the layout stack currently.
                            // Using this we can calculate the assignment of area of the complete layout stack unit.
                            valueSoFar += parseFloat(this.nodes[i].getValue(), 10);
                        }

                        ratio = valueSoFar / this.totalValue;
                        area = totalArea * ratio;

                        if (_hSegmented) {
                            // If width is greater than height of the parent rectangle, make vertical segmentation,
                            // since we can reach close to 1 aspect ratio in this way
                            height = this._rHeight;
                            width = area / height;
                            // Next point from where the next layout will be laid out
                            _nextX = _x + width;
                            _nextY = _y;

                            // Remaining area for after the current layout is laid
                            remainingHeight = this._rHeight;
                            remainingWidth = this._rWidth - width;
                        } else {
                            // If width is less than height of the parent rectangle, make horizontal segmentation,
                            // since we can reach close to 1 aspect ratio in this way
                            width = this._rWidth;
                            height = area / width;
                            // Next point from where the next layout will be laid out
                            _nextX = _x;
                            _nextY = _y + height;

                            // Remaining area for after the current layout is laid
                            remainingHeight = this._rHeight - height;
                            remainingWidth = this._rWidth;
                        }

                        for (i = 0, len = this.nodes.length; i < len; i++) {
                            node = this.nodes[i];
                            snVal = node.getValue();
                            // Proportional area inside the layout
                            snArea = snVal / valueSoFar * area;

                            // Keeps reference to the measurement of previous rect so that in case the aspect ratio
                            // is smaller than the previous one, we can restore the state
                            node.hRect = node.rect || {};
                            node._hRect = node._rect || {};

                            // Holds information of the current rect
                            rect = node.rect = {};
                            if (_hSegmented) {
                                rect.width = snWidth = width;
                                rect.height = snHeight = snArea / snWidth;
                                rect.x = _x;
                                rect.y = _y;

                                _y += snHeight;
                            } else {
                                rect.height = snHeight = height;
                                rect.width = snWidth = snArea / snHeight;
                                rect.x = _x;
                                rect.y = _y;

                                _x += snWidth;
                            }

                            // Calculates the aspect ratio
                            maxSide = mathMax(rect.height, rect.width);
                            minSide = mathMin(rect.height, rect.width);

                            node.aspectRatio = maxSide / minSide;
                        }


                        if (this.nodes.length > 1) {
                            if (this.prevAR < node.aspectRatio) {
                                // If the previous aspect ratio is less than the current one, we infer the
                                // old layout is more stable. Hence we restore to the previous state.
                                this.nodes.pop().rect = {};
                                for (i = 0, length = this.nodes.length; i < length; i++) {
                                    // Restore all the newly calculated rect to the previous one.
                                    if (length === 1 && this.nodes[i].firstPassed) {
                                        this.nodes[i].rect = this.nodes[i]._hRect;
                                    } else {
                                        this.nodes[i].rect = this.nodes[i].hRect;
                                    }
                                    _rect = this.nodes[i]._rect = {};
                                    cRect = this.nodes[i].rect;
                                    _rect.width = cRect.width;
                                    _rect.height = cRect.height;
                                    _rect.x = cRect.x;
                                    _rect.y = cRect.y;
                                }
                                // Forcefully return false to inform the caller that the old layout was stable and
                                // the system has restored from the new state to the old state
                                return false;
                            }
                        } else {
                            if (node) {
                                _rect = node._rect = {};
                                cRect = node.rect;
                                _rect.width = cRect.width;
                                _rect.height = cRect.height;
                                _rect.x = cRect.x;
                                _rect.y = cRect.y;

                                node.firstPassed = true;
                            }
                        }

                        this.prevAR = node.aspectRatio;

                        this.height = height;
                        this.width = width;

                        /*
                         * Provides the measurement of the remaining area for the next layout to be laid out.
                         * @return {Object} - {
                         *      height: {Integer},
                         *      width: {Integer},
                         *      x: {Integer},
                         *      y: {Integer},
                         * }
                         */
                        this.getNextLogicalDivision = function () {
                            return {
                                height: remainingHeight,
                                width: remainingWidth,
                                x: _nextX,
                                y: _nextY
                            };
                        };
                        // Keep on returning the node last added if the layout is stable
                        return node;
                    };

                    return {
                        RowLayout: RowLayout
                    };
                })(),

                /*
                 * Initializes the state required when the legend is dragged and effect to be applied
                 * @param overrideEffect {Object} - style to be applied in key-value pair
                 * @param rangeOutFn {Function} - Function to be executed when outliers are found
                 * @return {Function} - Control function that operates on outliers by adjusting the range
                 */
                applyShadeFiltering: function (bucketInstance, overrideEffect, rangeOutFn) {
                    bucketInstance.setRangeOutEffect(overrideEffect, rangeOutFn);

                    this.applyShadeFiltering.reset = function() {
                        bucketInstance.resetPointers();
                    };

                    /*
                     * Control the effect to be executed on outliers.
                     * @param limits {Object} - an simple javascript object containing the start and end limit of
                     *                          the legend
                     */
                    return function (limits) {
                        bucketInstance.moveLowerShadePointer(limits.start);
                        bucketInstance.moveHigherShadePointer(limits.end);
                    };

                },

                drawTree : function (algorithmAPI, dsStore, canvasMeasurement, rendererAPI) {
                    var treeRoot = this,
                        chart = dsStore.chart,
                        config = chart.config || (chart.config = {}),
                        trackerConfig = config.trackerConfig || (config.trackerConfig = []),
                        components = chart.components,
                        numberFormatter = components.numberFormatter,
                        btns = components.toolbarBtns,
                        labelPadding = {
                            x: 5,
                            y: 5
                        },
                        lineHeight,
                        xShift = canvasMeasurement.horizontalPadding,
                        yShift = canvasMeasurement.verticalPadding,
                        getNextAreaBase = algorithmAPI.areaBaseCalculator(xShift, yShift),
                        RowLayout = algorithmAPI.layoutManager.RowLayout,
                        smartLabel = dsStore.chart.linkedItems.smartLabel,
                        drawRectFn = rendererAPI.drawRect,
                        drawTextFn = rendererAPI.drawText,
                        drawHotFn = rendererAPI.drawHot,
                        iterator = afAPI.iterator,
                        itr = iterator(treeRoot),
                        bfItr = itr.bf,
                        baseNode,
                        attrs = dsStore.conf,
                        highlightParentsOnHover = attrs.highlightParentsOnHover,
                        getTextConf,
                        context = afAPI.context,
                        colorRange = dsStore.conf.colorRange,
                        localColorProvider = afAPI.mapColorManager(attrs, colorRange),
                        abstractEvtReg = afAPI.abstractEventRegisterer.apply(afAPI, arguments),
                        clickEvtImpl = abstractEvtReg.click,
                        mouseoverEvtImpl = abstractEvtReg.mouseover,
                        mouseoutEvtImpl = abstractEvtReg.mouseout,
                        _baseNode,
                        _intSR = chart._intSR,
                        backToParent,
                        resetTree,
                        visController = afAPI.visibilityController,
                        stateContextId = 'ClickedState',
                        visibleState = 'VisibileRoot',
                        stateContext,
                        clickedState,
                        csNode;

                    stateContext = context.getInstance(stateContextId);
                    clickedState = stateContext.get(visibleState) || {};
                    csNode = clickedState.node;

                    if (clickedState.node && clickedState.state) {
                        if (clickedState.state.toLowerCase() === 'drillup') {
                            if (csNode instanceof Array) {
                                visController.controlPreAnimVisibility(csNode[0].virginNode, csNode[1]);
                            } else {
                                visController.controlPreAnimVisibility(csNode.virginNode);
                            }
                        } else {
                            visController.displayAll(clickedState.node.virginNode);
                        }
                    }

                    lineHeight = attrs.parentLabelLineHeight;
                    getTextConf = afAPI.initConfigurationForlabel(labelPadding, lineHeight, attrs);

                    // Get the root node
                    // maximum level of tree traversal is set to the value incremented with the current node depth
                    baseNode =  bfItr.next((maxDepth = (afAPI.setMaxDepth(treeRoot.getDepth() + depthIncrement))));

                    _baseNode = baseNode;
                    while (_baseNode.getParent()) {
                        _baseNode =  _baseNode.getParent();
                    }

                    if (!attrs.showNavigationBar) {
                        if (_baseNode != baseNode) {
                            btns.home.show();
                            btns.back.show();
                        }
                        else {
                            btns.home.hide();
                            btns.back.hide();
                        }
                    } else {
                        btns.home.hide();
                        btns.back.hide();
                    }

                    smartLabel.useEllipsesOnOverflow(chart.config.useEllipsesWhenOverflow);
                    smartLabel.setStyle((attrs._setStyle = {
                        fontSize: (attrs.labelFontSize || attrs.baseFontSize) + 'px',
                        fontFamily: (attrs.labelFont || attrs.baseFont),
                        lineHeight: (1.2 * (attrs.labelFontSize || attrs.baseFontSize)) + 'px'
                    }));

                    // Save the state in reflow conf
                    // reflowData.tree = baseNode;
                    backToParent = _intSR.backToParent;
                    resetTree = _intSR.resetTree;

                    btns.back && btns.back.attachEventHandlers({
                        'click' : backToParent.bind(baseNode)
                    });

                    btns.home && btns.home.attachEventHandlers({
                        'click' : resetTree.bind(baseNode)
                    });
                    /*
                     * This function recursively draws the tree using breadth first algorithm.
                     * @param node {TreeMap} - node to be drawn;
                     * @param drawingArea {Object} - ultimate drawing area of the node. By ultimate it means
                     *                              no more operation will be performed
                     */
                    (function rec (node, drawingArea) {
                        var rect,
                            _rect = {},
                            highlightItem,
                            hotItem,
                            labelItem,
                            _textRect,
                            textRect,
                            nextNodes,
                            textItem,
                            index,
                            length,
                            totalValPlotted = 0,
                            bfsQueue,
                            bfsNode,
                            plotItem,
                            textConf,
                            label,
                            options = {},
                            textConfObj,
                            plotDetails = {},
                            evtFns = {},
                            hoverContextPointerName = 'hover',
                            cssConf = {},
                            colorDimension = '',
                            colorValue,
                            formattedValue,
                            formattedsValue;

                        if (!node) {
                            return;
                        }
                        formattedValue = numberFormatter.yAxis(node.getValue());
                        formattedsValue = numberFormatter.sYAxis(node.getColorValue());
                        node.setPath();
                        //cache the previous rectangular configurations for animating the rectangle.
                        rect = node.__initRect;
                        if (rect) {
                            _rect.x = rect.x;
                            _rect.y = rect.y;
                            _rect.width = rect.width;
                            _rect.height = rect.height;
                        }
                        _textRect = node.textRect || {};

                        rect = (node.rect = node.__initRect = {});
                        textRect = (node.textRect = {});

                        // Get rectangle to draw the node
                        rect.width = drawingArea.width;
                        rect.height = drawingArea.height;
                        rect.x = drawingArea.x;
                        rect.y = drawingArea.y;

                        // Draws the rectangle
                        cssConf = localColorProvider(node);
                        // plotItem = drawRectFn(rect, cssConf);
                        plotItem = node.plotItem;
                        //If plotItem exists, then its the interacted sub-tree which is updated with a
                        // different animations
                        if (plotItem) {
                            // dispose the graphic rectangle for the selected node.
                            rendererAPI.graphicPool(true, 'plotItem', plotItem, _rect);
                        }
                        plotItem = node.plotItem = drawRectFn(rect, cssConf, _rect, node.overAttr);
                        node.cssConf = cssConf;

                        // Get the configuration to draw text
                        textConfObj = getTextConf(node, rect);
                        textConf = textConfObj.conf;

                        // Offset that will be used to plot the children
                        options.textMargin = textConf.rectShiftY;
                        textRect =  node.textRect = textConf.textRect;
                        // Get the normalized text
                        label = smartLabel.getSmartText(textConf.label, textRect.width, textRect.height).text;
                        labelItem = node.labelItem;

                        if (labelItem) {
                            highlightItem = node.highlightItem;
                            rendererAPI.graphicPool(true, 'labelItem', labelItem, _rect);
                            rendererAPI.graphicPool(true, 'highlightItem', highlightItem, _rect);
                        }
                        else {
                            _textRect = _textRect || {};
                        }
                        textItem = drawTextFn(label, textRect, {
                            textAttrs : textConfObj.attr,
                            highlightAttrs: textConfObj.highlight
                        }, _textRect, node.overAttr);

                        node.labelItem = textItem.label;
                        node.highlightItem = textItem.highlightMask;

                        // Saves the reference so that the event listener can use it
                        node.plotItem = plotItem;

                         // Save all the references so that it can be used as context
                        plotDetails.virginNode = node;
                        plotDetails.plotItem = plotItem;
                        plotDetails.textItem = textItem;
                        // Save circular reference for query
                        plotDetails.virginNode.dirtyNode = plotDetails;

                        if (colorValue = node.getColorValue()) {
                            colorDimension = attrs.tooltipSeparationCharacter + formattedsValue;
                        }

                        if (attrs.showTooltip) {
                            plotDetails.toolText = lib.parseTooltext(attrs.plotToolText, [1, 2, 3, 119, 122], {
                                label: node.getLabel(),
                                formattedValue: formattedValue,
                                formattedsValue: formattedsValue
                            }, {
                                value: node.getValue(),
                                svalue: node.getColorValue()
                            }) || node.getLabel() + attrs.tooltipSeparationCharacter + formattedValue + colorDimension;
                        }
                        else {
                            plotDetails.toolText = BLANKSTRING;
                        }

                        plotDetails.rect = rect;

                        evtFns.hover = [function (targetElementNew) {
                            var elem = this,
                                parentElem,
                                targetElement,
                                virginNode,
                                hoverContext,
                                css,
                                maskRgba,
                                hoverMaskAlpha = 60;

                            // Get the context if created or create a new one and get
                            hoverContext = context.getInstance(hoverContextPointerName);
                            virginNode = elem.virginNode;

                            if (highlightParentsOnHover && !virginNode.next) {
                                // If all the sibling leaves to be hovered together attribute is set and
                                // the node is really a leaf
                                parentElem = virginNode.getParent();
                                targetElement = parentElem ? parentElem : virginNode;
                            } else {
                                // Set hover effect on the child itself
                                targetElement = elem.virginNode;
                            }

                            // Set it on context
                            hoverContext.set('element', targetElement);

                            css = targetElement.cssConf;
                            maskRgba = convertColor(css.fill && getLightColor(css.fill, 80), hoverMaskAlpha);
                            // singleTrackerG.attr({'fill' : maskRgba});
                            targetElementNew.attr({'fill' : maskRgba});
                            mouseoverEvtImpl(this);
                        }.bind(plotDetails), function (targetElementNew) {
                            var hoverContext,
                                targetElement,
                                css,
                                unmaskRgba,
                                hoverMaskAlpha = 0;

                            // Get the context, which is most definitely created during the mouseover
                            hoverContext = context.getInstance(hoverContextPointerName);
                            targetElement = hoverContext.get('element');

                            css = targetElement.cssConf;
                            unmaskRgba = convertColor(css.fill || '#fff', hoverMaskAlpha);
                            // targetElement.plotItem.tracker.attr({'fill' : unmaskRgba});
                            targetElementNew.attr({'fill' : unmaskRgba});
                            mouseoutEvtImpl(this);
                        }.bind(plotDetails)];

                        evtFns.tooltip =  [plotDetails.toolText];

                        evtFns.click =  [function () {
                            clickEvtImpl(this, baseNode);
                        }.bind(plotDetails)];

                        hotItem = node.hotItem;
                        if (hotItem) {
                            rendererAPI.graphicPool(true, 'hotItem', hotItem, _rect);
                        }

                        //hotItem = node.hotItem = drawHotFn(plotDetails, evtFns);

                        trackerConfig.push({
                            node: node,
                            key: 'hotItem',
                            plotDetails: plotDetails,
                            evtFns: evtFns,
                            callback: drawHotFn
                        });

                        // Get the next level (if it was in level n, the following function returns node of  n+1
                        // level) of nodes which belongs to this parent
                        nextNodes = (maxDepth !== undefined) ? ((node.getDepth() >= maxDepth) ?  undefined :
                            node.getChildren()) : node.getChildren();
                        if (!nextNodes) {
                            // If its a leaf node, no further level is possible hence return
                            return;
                        }

                        // Get the nodes of next level which stable rect information. Which we canuse to call this
                        // function recursively to draw the complete tree
                        bfsQueue = getNextAreaBase(nextNodes, function (meta, parent) {
                            var row,
                                nodeLimit,
                                nodeIndex = 0,
                                node,
                                layout,
                                nextDiv,
                                queue = [];

                            // Logically create a new layout
                            row = new RowLayout({
                                width: meta.effectiveRect.width,
                                height: meta.effectiveRect.height,
                                x: meta.effectiveRect.x,
                                y: meta.effectiveRect.y
                            }, parent.getValue());

                            nodeLimit = nextNodes.length;

                            while (true) {
                                if (nodeIndex++ === nodeLimit) {
                                    break;
                                }

                                node = nextNodes[nodeIndex - 1];
                                // Adds node in the layout to calculate the stability
                                layout = row.addNode(node);

                                if (layout === false) {
                                    // The current layout is not stable. The layoutManager has already reverted the
                                    // changes. Get the remaining logical division so that a new layout is laid
                                    nextDiv = row.getNextLogicalDivision();
                                    // Create a new layout
                                    row = new RowLayout(nextDiv, parent.getValue() - totalValPlotted);
                                    nodeIndex--;
                                } else {
                                    // Layout is stable, adds it in the queue
                                    totalValPlotted += parseFloat(node.getValue(), 10);
                                    queue.push(node);
                                }
                            }

                            return queue;
                        }, options);

                        for (index = 0, length = bfsQueue.length; index < length; index++) {
                            // For all nodes of level n andd common parent, call this function recursively
                            bfsNode = bfsQueue[index];
                            rec(bfsNode, bfsNode.rect);
                        }
                    })(baseNode, canvasMeasurement);
                }
            }
        };

        /*
         * Gives the full implementation of the AbstractTreeMaker. Ususally AbstractTreeMaker can be used directly
         * if the ordering is not intended. The more specific version of the treemap needs to have ordering of
         * nodes. TreeMaker at this movement only give that implementation.
         */
        function TreeMaker () {
            // Initialize the AbstractTreeMaker by calling the constructor
            AbstractTreeMaker.apply(this, arguments);
        }

        TreeMaker.prototype = Object.create(AbstractTreeMaker.prototype);
        TreeMaker.prototype.constructor = AbstractTreeMaker;

        /*
         * Provides the order of the node. This order is algorithm specific. This function acts as a bridge to pass
         * the ordering logic from algorithm to AbstractTreeMaker. This is called from AbstractTreeMaker only.
         * @param children {Array.<TreeNode>} - array of children at a praticular level for a particular parent.
         */
        TreeMaker.prototype.order = function (children) {
            var algorithmAPI = algo[algorithm],
                orderNodeFn = algorithmAPI.orderNodes;
            if (orderNodeFn) {
                return orderNodeFn.apply(children, [algorithmAPI]);
            }

            return children;
        };

        /*
         * Initialize the algorithm factory by passing information regarding the algorithm.
         * @param algoName {String} - name of the algorithm
         * @param flag {Boolean} - flag to inform treemaker whether it should form bucket of the leaf nodes.
         *                      Enable this if the legend is used
         * @param permitterDepth {Number | undefined} - The maximum depth of visual that can be seen in the tree at once
         */
        function init (algoName, flag, permitterDepth) {
            algorithm = algoName;
            bucketIterationMode = flag;
            depthIncrement = (afAPI.setMaxDepth(permitterDepth));

            return algo[algorithm];
        }

        /*
         * Takes the syle and operation to be applied / performed on the outliers if the legend is dragged.
         * @param css {Object} - key-value pair of the style to be applied on the outliers. Where the key is the
         *                      name of the syle (like fill, stroke-width) and value is the value associated.
         * @param shadeOutFN {Function} - function to be executed once new outliers are found. For every outliers
         *                              this function is called once
         * @return {Function} - a function that sets the range if legend is dragged to find the outliers. After
         *                      finding out the new outliers it executes the shadeOutFN on it function.
         */
        function applyShadeFiltering (css, shadeOutFN) {
            var algorithmAPI = algo[algorithm],
                args,
                shadeFilter;

            // Initializes the filter
            shadeFilter = algorithmAPI.applyShadeFiltering(treeMaker.getBucket(), css, shadeOutFN);

            // Sets the range, find the outliers and apply / perform operation on them.
            return function (limits) {
                // Modifies the argument object to send it to the filter implementation. As part of the modification
                // it pushes the limit in front of the argument object so that it become the first argument.
                args = Array.prototype.slice.call(arguments, 0);
                args.unshift(limits);
                shadeFilter.apply(treeMaker.getBucket(), args);
            };
        }

        /*
         * Create tree from the data given. It requires a root to start with.
         * @param node {Object} - the configuration object of FusionCharts
         * @return {TreeNode} - the root of the newly prepared tee
         */
        function makeTree (nodes, cleansingFn, update) {
            // todo cleansingFn should be defined when called from addData to get the number formatted values.
            var tempTree;
            treeMaker = new TreeMaker(nodes, bucketIterationMode, cleansingFn);
            tempTree = treeMaker.get();

            if (update !== false) {
                tree = tempTree;
            }
            afAPI.setVisibleRoot(tempTree);
            return tempTree;
        }

        /*
         * Prepares all the arguments and call the draw function of the algorithm in use.
         * This function can not be called from outside and needs another function to return it after making
         * use of initialization parameter and setting up all the algorithm related preprocessing.
         */
        function plotTree () {
            var algorithmAPI = algo[algorithm],
                args;
            //initialise the realTimeModule with the configurations for drawing the nodes.
            algorithmFactory.realTimeUpdate = realTimeUpdate.apply(this, arguments);
            // Prepares the arguments
            args = Array.prototype.slice.call(arguments, 0);
            args.unshift(algorithmAPI);

            // Calls the draw function of the algorithm
            algorithmAPI.drawTree.apply(afAPI.getVisibleRoot(), args);
        }
        /*
         * Adds or deletes the nodes dynamically to the chart.
        */
        function realTimeUpdate () {
            // Initialise the function with the drawing area and rendering API.
            var rendererAPI,
                args,
                algorithmAPI = algo[algorithm];

            // Prepares the arguments
            args = Array.prototype.slice.call(arguments, 0);
            args.unshift(algorithmAPI);
            rendererAPI = args.slice(-1)[0];
            return function (){
                //modifier can be either for add or delete.
                var _args = Array.prototype.slice.call(arguments, 0),
                _getCleanValue = _args.shift(),
                //modifier determines if to add or delete the nodes/ subTree.
                modifier = _args.shift(),
                api = treeOpt(tree, function (visibleRoot) {
                    // Calls the draw function of the algorithm. Attached as a callback.
                    algorithmAPI.drawTree.apply(visibleRoot || tree, args);
                }, rendererAPI, _getCleanValue);
                // api to add or delete the nodes from the tree.
                api[modifier].apply(this, _args);
            };
        }

        /*
         * Forcefully set the root of the tree. Try not to use it as this function was only created to keep state
         * over successive call of renderer.
         * @param base {TreeNode} - the root of the newly prepared tee
         */
        function setTreeBase (base) {
            return (base && (tree = base));
        }

        /*
         * Initermediate bridge function that performs the tree making operation and drawing area assignment.
         * @param nodes {Object} - the root of the newly prepared tee
         * @param drawingArea {Object} - information on the available drawing area
         * @return {Function} - returns plotTree to call the draw the function of the algorithm
         */
        function plotOnCanvas (nodes, drawingArea, cleansingFn) {
            tree = makeTree(nodes, cleansingFn);
            drawingAreaMeasurement = drawingArea;
            return plotTree;
        }

        // AlgorithmFactory API
        algorithmFactory.init = init;
        algorithmFactory.plotOnCanvas = plotOnCanvas;
        algorithmFactory.applyShadeFiltering = applyShadeFiltering;
        algorithmFactory.setTreeBase = setTreeBase;
        algorithmFactory.realTimeUpdate = realTimeUpdate;
        algorithmFactory.makeTree = makeTree;

        return algorithmFactory;
    };
    /*
     * Does the additons / deletion operations on the tree
    */
    treeOpt = function (baseNode, drawTreeFn, rendererAPI, _getCleanValue) {
        // incremental change that needs to be updated in the rest of the tree due to additions/ deletions of
        // the node/subtree.
        var change;
        /*
         * Takes the path of the node to be fetched and return the node element.
         * @param path {Array} - node reference wrt global node.
         * @retrun node {nodeElement} - a particular node in the tree as per specified in the traversal path.
        */
        function getNode(path) {
            var childNode,
                index = 0,
                parentNode = baseNode;
            if (!path.length) {
                return baseNode;
            }
            while (parentNode) {
                childNode = searchSibling.call(parentNode,path[index]);
                if ((index === path.length - 1) && childNode) {
                    //sets the incremental change.
                    change = childNode.getValue();
                    return childNode;
                }
                parentNode = childNode;
                index += 1;
            }
        }
        /*
         * Searches for a node by its name amongst the siblings.
         * @param label {String} - Label of the node being searched.
         * @return node {nodeElement} - The node element amongst the siblings having the same label name.
        */
        function searchSibling(label) {
            var index,
                node,
                sibling,
                parentNode = this,
                childrenArr = parentNode.getChildren() || [],
                len = childrenArr.length,
                sanitized = function(str) {
                    return str.toLowerCase().trim();
                };

            for (index = 0; index < len; index += 1) {
                sibling = childrenArr[index];
                if (sanitized(sibling.label) === sanitized(label)) {
                    node = sibling;
                    break;
                }
            }
            return node;
        }
        return {
            /*
             * Delete a node/ even a subTree from the original tree and redraw the tree if required.
             * @param path {Array} - Contains the information of the node/subtree to be deleted in reference to the
             global node.
             * @param draw {Boolean} - Whether to redraw the tree immediately after the change.
            */
            deleteData: function (path, draw) {
                // fetch the element to the corresonding path.
                var afAPI, // todo: RED-3367 commit refer.
                    targetNode = getNode(path),
                    itr = afAPI.iterator(targetNode),
                    dfItr = itr.df,
                    // detach the node element from the actual tree.
                    parentNode = targetNode && targetNode.getParent(),
                    leftSiblingCount = targetNode && targetNode.getSiblingCount('left'),
                    childrenArr = parentNode && parentNode.getChildren(),
                    visibleRoot = afAPI.getVisibleRoot();
                // incase the path specified is not a valid one or root node is asked to remove.
                if (!targetNode || !parentNode) {
                    return;
                }
                //set parent node to undefined, to break the parent-child links.
                childrenArr.splice(leftSiblingCount, 1);
                if (targetNode === visibleRoot){
                    visibleRoot = targetNode.getParent() || visibleRoot;
                }
                // generically dispose the tree to be deleted.
                while (targetNode) {
                    rendererAPI.disposeItems(targetNode);
                    targetNode = dfItr.next();
                }
                //update the tree with the reduced value responsible for this detachment.
                while (parentNode) {
                    //reduces the changed value from the existing value of the parent node.
                    parentNode.setValue(-change, true);
                    parentNode = parentNode.getParent();
                }
                if (draw) {
                    // draw the tree as per the specified algorithim.
                    drawTreeFn(visibleRoot);
                }
            },

            addData: function (nodes, path, draw, index) {
                var afAPI, // todo: RED-3367 commit refer.
                    algorithmFactory,
                    newNode,
                    tree,
                    parentNode,
                    oldValue,
                    childrenArr,
                    change = 0,
                    incremental = true,
                    visibleRoot = afAPI.getVisibleRoot();
                while (nodes.length) {
                    newNode = nodes.pop();
                    tree = algorithmFactory.makeTree(newNode, _getCleanValue, false);
                    change = tree.getValue();
                    parentNode = getNode(path || []);
                    // incase the path specified is not a valid one
                    if (!parentNode) {
                        continue;
                    }
                    // if there is no child node for the insertion node, its value is over-ridden by its inserted child.
                    if (!parentNode.getChildren()) {
                        // cache the old value for the insertion node before the add child operation.
                        oldValue = parentNode.getValue();
                        // flag to set the absolute value for the node.
                        incremental = false;
                    }
                    childrenArr = parentNode.addChildren(tree, index);
                    //update the tree with the added value responsible for this attachment.
                    while (parentNode) {
                        //increases the changed value from the existing value of the parent node.
                        parentNode.setValue(change, incremental);
                        if (oldValue) {
                            change -= oldValue;
                            oldValue = undefined;
                            incremental = true;
                        }
                        parentNode = parentNode.getParent();
                    }
                }

                if (draw) {
                    // draw the tree as per the specified algorithim.
                    drawTreeFn(visibleRoot);
                }
            }
        };
    };

    /**
     * Useful in managing the container elements and folding/unfolding of them.
    */
    containerManagerCreator = function  (afAPI, algorithmFactory, containerManager) {
        var datasetDefStore,
            drawTreeFn,
            tree,
            metaInf,
            dsConf,
            rendererAPI,
            updateContainers,
            forceCSS = false,
            /*
             * Draw the navigation bars - both the navigation history or the stacked children bar.
             * return {Function} - OverWrite the drawNavigation function which is defined for the rest of the time.
            */
            drawNavigation = function (drawingAreaMeasurement, isStacked) {
                var navigationPath,
                    len,
                    colorRange = dsConf.colorRange,
                    // map the color range for fetching the css colors for drawing the bars.
                    localColorProvider = afAPI.mapColorManager(dsConf, colorRange, true),
                    /*
                     * Responsible for setting the elements to be placed in the navigation bar. In stacked bar, it is
                     supposedly the childNodes, where as in the navigation History bar it is traversal path to reach
                     to that node.
                     * @param isStacked {Boolean} - A flag to determine if the navigation bar is a stacked or not.
                    */
                    setNavigationPath = function (isStacked) {
                        // fetch the visible root for any drilled state.
                        var visibleRoot = getVisibleRoot();
                        if (!isStacked) {
                            // fetches the traversal path of the visible root node element, i.e. fetch the traversal
                            // path that was taken to reach the cuurent visible state of the tree.
                            navigationPath = visibleRoot.getPath() || [].concat(visibleRoot);
                        }
                        else {
                            // fetches the child nodes to construct the stacked bar.
                            navigationPath = visibleRoot.getChildren();
                        }
                        navigationPath.pop();
                        //sets the length for the navigation path
                        len = navigationPath.length;
                    },
                    /*
                     * Determine the width of indivual segments of the constituting elements inside the bar.
                     * return {Function} - A function to overwrite the segmentRectangle to attain the above
                     functionality
                    */
                    segmentRectangle = (function () {
                        // store the already allocated width, incremented after every segment is drawn.
                        var allocatedWidth;
                        return {
                            /*
                             * A function to fetch the regtrangular area required by the segment element.
                             * @param drawingAreaMeasurement - {Object} - Entire drawing area information for the entire
                             bar to be drawn.
                             * @param pos - {Number} - The posiiton index of the segment element to be drawn.
                             * @param isStacked - {Boolean} - A flag to construct the stacked or navigation History bar
                             * @return {Object} - The rectangular area configuration for the segmented element.
                            */
                            get: function (drawingAreaMeasurement, pos, isStacked) {
                                var segmentRect = {
                                        y: drawingAreaMeasurement.startY,
                                        height: drawingAreaMeasurement.effectiveHeight
                                    },
                                    node = navigationPath[pos],
                                    parentNode = node.getParent();
                                // The segmentRectangle starts from the drawingAreMeasurement start point.
                                segmentRect.x = allocatedWidth || (allocatedWidth = drawingAreaMeasurement.startX);
                                // for stacked navigation path.
                                if (!isStacked) {
                                    // incrementally add the allocated width.
                                    // All the elements are equispaced.
                                    allocatedWidth += (segmentRect.width = drawingAreaMeasurement.effectiveWidth / len);
                                }
                                // for simple hierarchial navigation history bar.
                                // the unit width is proportional to the value of the childnodes wrt the parent node.
                                else {
                                    // increment the width allocation
                                    allocatedWidth += (segmentRect.width = drawingAreaMeasurement.effectiveWidth *
                                        (node.getValue()/parentNode.getValue()));
                                }
                                return segmentRect;
                            },
                            /*
                             * Reset the allocated Width.
                            */
                            resetAllocation: function () {
                                allocatedWidth = undefined;
                            }
                        };
                    })(),
                    fetchFlatnessPosition = function (startIndex, endIndex) {
                        var shape;
                        if (endIndex === 1) {
                            shape = 'both';
                        }
                        else if (startIndex === 0) {
                            shape = 'left';
                        }
                        else if (startIndex < (endIndex - 1)) {
                            shape = 'no';
                        }
                        else {
                            shape = 'right';
                        }
                        return shape;
                    },
                    labelPadding = {
                        x: 5,
                        y: 5
                    },
                    lineHeight = dsConf.parentLabelLineHeight,
                    // Gets label configuration
                    getTextConf = afAPI.initConfigurationForlabel(labelPadding, lineHeight, dsConf),
                    drawPathFn = rendererAPI.drawPolyPath,
                    drawTextFn = rendererAPI.drawText,
                    drawHotFn = rendererAPI.drawHot,
                    STACKED_STR = 'stacked',
                    navigationMapper = {
                        navigationHistory: {
                            path: 'polyPathItem',
                            label: 'pathlabelItem',
                            highlightItem: 'pathhighlightItem',
                            hotItem: 'pathhotItem'
                        }
                    },
                    chart = datasetDefStore.chart,
                    trackerConfig = chart.config.trackerConfig,
                    legend = chart.components.gradientLegend,
                    smartLabel = chart.linkedItems.smartLabel,
                    clickFn = function (node) {
                        return function () {
                            var context = afAPI.context,
                                stateContextId = 'ClickedState',
                                visibleState = 'VisibileRoot',
                                stateContext = context.getInstance(stateContextId),
                                clickedState = stateContext.get(visibleState) || {};

                            trackerConfig.length = 0;
                            clickedState.state = 'drillup';
                            clickedState.node = [{virginNode: afAPI.getVisibleRoot()}, node];

                            // Reset the legend once any traversal happens
                            (legend && legend.enabled) && legend.resetLegend();
                            containerManager.draw([node, node, node]);
                        };
                    },
                    hoverInFn = function () {
                        return function () {
                            /*// set the height proportion.
                            _heightProportion.set({
                                treeMap: 0.9,
                                navigationBar: 0,
                                stackedNavigation: 0.1
                            });
                            // draw the container box.
                            draw([node, fetchGlobalRoot(node), node]);*/
                        };
                    },
                    hoverOutFn = function () {
                        return function () {
                                /*// set the height proportion.
                                _heightProportion.set({
                                    treeMap: 0.9,
                                    navigationBar: 0.1,
                                    stackedNavigation: 0
                                });
                                // draw the container box.
                                draw();*/
                        };
                    },
                    toolTipFn = function (node) {
                        return dsConf.showTooltip ? node.getLabel() : BLANKSTRING;
                    },
                    i,
                    offset,
                    pathObj,
                    node,
                    segmentRect,
                    textConfObj,
                    label,
                    textConf,
                    pathText,
                    _setStyle = dsConf._setStyle,
                    textRect,
                    navigationRatio = _heightProportion.get().navigationBar,
                    verticalPadding = 2 * (_getVerticalPadding('navigationBar')),
                    navigationHeight = navigationRatio * metaInf.effectiveHeight,
                    logicalFontSize = mathMin((navigationHeight - (verticalPadding + 6)),
                        _setStyle.fontSize.replace(/\D+/g, '')),
                    fontSizeStr = logicalFontSize + 'px';
                navigationMapper.stacked = {
                    path: STACKED_STR + navigationMapper.navigationHistory.path,
                    label: STACKED_STR + navigationMapper.navigationHistory.label,
                    highlightItem: STACKED_STR + navigationMapper.navigationHistory.highlightItem,
                    hotItem: STACKED_STR + navigationMapper.navigationHistory.hotItem
                };
                segmentRectangle.resetAllocation();
                // get the navigation history of the visibleRoot
                setNavigationPath(isStacked);
                smartLabel.setStyle({
                    fontSize: fontSizeStr,
                    lineHeight: fontSizeStr
                });
                for (i = 0; i < len; i += 1) {
                    node = navigationPath[i];
                    segmentRect = segmentRectangle.get(drawingAreaMeasurement, i, isStacked);
                    offset = (pathObj = createNavigationPath(segmentRect, isStacked ? 'both' : fetchFlatnessPosition(i,
                        len))).offset;
                    node[navigationMapper[isStacked ? 'stacked' : 'navigationHistory'].path] =
                        drawPathFn(pathObj, localColorProvider(node, true, true), i);
                    // Get the configuration to draw text
                    textConfObj = getTextConf(node, segmentRect, false, true);
                    textConf = textConfObj.conf;
                    textRect = textConf.textRect;
                    textRect.width -= (2 * offset);
                    // for vertically aligning the text.
                    textRect.y = segmentRect.y + (segmentRect.height / 2);
                    label = smartLabel.getSmartText(textConf.label, textRect.width, mathMax(logicalFontSize,
                        textRect.height)).text;
                    pathText = drawTextFn(label, textRect, {
                        textAttrs: textConfObj.attr,
                        highlightAttrs: textConfObj.highlight
                    }, {
                        y: segmentRect.height / 10,
                        'font-size': dsConf._setStyle.fontSize,
                        'font-family': dsConf._setStyle.fontFamily
                    }, (isStacked ? 'stacked' : '') + 'path');
                    node[navigationMapper[isStacked ? 'stacked' : 'navigationHistory'].label] = pathText.label;
                    node[navigationMapper[isStacked ? 'stacked' : 'navigationHistory'].highlightItem] =
                        pathText.highlightMask;
                    trackerConfig.push({
                        node: node,
                        key: navigationMapper[isStacked ? 'stacked' : 'navigationHistory'].hotItem,
                        plotDetails: {
                            rect: segmentRect
                        },
                        evtFns: {
                            click: [clickFn(node, isStacked)],
                            hover: [hoverInFn(node), hoverOutFn()],
                            tooltip: [toolTipFn(node)]
                        },
                        callback: drawHotFn
                    });
                }
            },
            /*
             * Fetch the drawing function for a container element.
             * return {Function} - A function to fecth the drawing function for that type.
            */
            getDrawFn = function (type) {
                // map the type with the drawing functions.
                var drawFn = {
                    'treeMap': drawTree,
                    'navigationBar': drawNavigation,
                    'stackedNavigation': drawStackedNavigation
                };
                // Returns the drawing function for a type of the container box.
                return drawFn[type];
            },
            /*
             * Set and retrive the height allocations for navigation, treemap and stacked bar.
            */
            _heightProportion =  (function () {
                // initial height allocations.
                var heightProportion = {
                        'treeMap': 1,
                        'navigationBar': 0,
                        'stackedNavigation': 0
                    };
                return {
                    /*
                     * sets the height allocation with the parameterised input value.
                     * @param newHeightProportion {Object} - The new height configurations to be set.
                    */
                    set: function (hasNavigationBar) {

                        var singleLineRatio,
                            navigationRatio = pluckNumber(dsConf.navigationBarHeightRatio,
                            dsConf.navigationBarHeight / metaInf.effectiveHeight, 0.15),
                            maxFontSize = dsConf.labelFontSize ? mathMax(dsConf.labelFontSize,
                                dsConf.baseFontSize) : dsConf.baseFontSize,
                            verticalPadding = 2 * (_getVerticalPadding('navigationBar'));
                        // 3 px gap is maintained vertically.
                        singleLineRatio =  (6 + maxFontSize + verticalPadding) / metaInf.effectiveHeight;
                        navigationRatio = mathMax(singleLineRatio, navigationRatio);
                        if (navigationRatio < 0.1) {
                            navigationRatio = 0.1;
                        }
                        else if (navigationRatio > 0.15) {
                            navigationRatio = 0.15;
                        }
                        dsConf.navigationBarHeightRatio = navigationRatio;
                        if (hasNavigationBar) {
                            heightProportion = {
                                treeMap: (1 - navigationRatio),
                                navigationBar: navigationRatio,
                                stackedNavigation: 0
                            };
                        }
                        else {
                            heightProportion = {
                                treeMap: 1,
                                navigationBar: 0,
                                stackedNavigation: 0
                            };
                        }
                    },
                    /*
                     * Fetch the height allocation defination.
                     * @return {Object} - the height proportion.
                    */
                    get: function () {
                        return heightProportion;
                    }
                };
            })(),

            allocatedHeightProp = 0,

            _getVerticalPadding = function (type) {
                var verticalPadding = dsConf.verticalPadding,
                    plotBorderThickness = dsConf.plotBorderThickness,
                    navigationBarBorderThickness = dsConf.navigationBarBorderThickness;
                return verticalPadding + (type === 'navigationBar' ? navigationBarBorderThickness :
                    plotBorderThickness);
            },
            /*
             * Fectches the drawing area information for a particular type of container element.
             * return {Function} - a fucntion that takes type as input and calculate the area requirements using the
             heightProportion mapping.
            */
            getDrawingArea = function (type) {
                var width = metaInf.effectiveWidth,
                    height = metaInf.effectiveHeight,
                    verticalPadding = _getVerticalPadding(type),
                // maps the height requirements for each type of the container element.
                    heightProportion = _heightProportion.get(),
                    requiredHeightProp = heightProportion[type];
                if (allocatedHeightProp >= 1) {
                    allocatedHeightProp = 0;
                }
                allocatedHeightProp += requiredHeightProp;
                // take the vertical padding as the seperator between the box elements.
                return {
                    effectiveHeight: mathRound(requiredHeightProp * height * 100)/100 - (verticalPadding),
                    effectiveWidth: width,
                    startX: metaInf.startX,
                    startY: metaInf.startY + verticalPadding + mathRound((allocatedHeightProp - requiredHeightProp)*
                        height * 100)/100
                };
            };
        /*
         * Container to draw the navigation bar or the treemap within it.
        */
        function Container () {}

        Container.prototype.constructor = Container;
        /*
         * Initialise the container box with drawing configurations
         * @param configuration {Object} - Contains the drawingAreaMeasurement and name for the container box element.
         * @param drawFn {Function} - Set the draw function defined for that type of container element.
        */
        Container.prototype.init = function (configuration, drawFn) {
            var container = this,
                containerConf = container.conf || (container.conf = {});
            containerConf.name = configuration.name;
            container.setDrawingArea(configuration.drawingAreaMeasurement);
            container.draw = container.draw(drawFn);
        };
        /*
         * @param drawingAreaMeasurement - {Object} - sets the drawing area for the container element.
        */
        Container.prototype.setDrawingArea = function (drawingAreaMeasurement) {
            var containerConf = this.conf;
            containerConf.drawingAreaMeasurement = drawingAreaMeasurement;
        };

        // drawing informations.
        Container.prototype.draw = function (drawFn) {
            return function () {
                var containerConf = this.conf,
                    drawingAreaMeasurement = containerConf.drawingAreaMeasurement;
                if (drawingAreaMeasurement.effectiveHeight > 0) {
                    drawFn(containerConf.drawingAreaMeasurement);
                }
            };
        };

        Container.prototype.eventCallback = function () {

        };
        //initialise the containerManager
        function init () {
            var type,
                containersArr = ['navigationBar', 'treeMap','stackedNavigation'],
                args = Array.prototype.slice.call(arguments, 0);
            datasetDefStore = args[0];
            metaInf = args[1];
            dsConf = datasetDefStore.conf;
            rendererAPI = args[2];
            tree = args[3];
            drawTreeFn = args[4];
            if (updateContainers.get().length >= containersArr.length) {
                updateContainers.set();
            }

            while (containersArr.length) {
                type = containersArr.shift();
                updateContainers.set({
                    type: type,
                    drawFn: getDrawFn(type),
                    drawingArea: getDrawingArea(type)
                });
            }
        }

        function getVisibleRoot () {
            return afAPI.getVisibleRoot();
        }

        function drawTree (drawingAreaMeasurement) {
            var _temp = dsConf.plotBorderThickness;
            if (forceCSS) {
                dsConf.plotBorderThickness = 0;
            }
            drawTreeFn.apply(afAPI.getVisibleRoot(), [datasetDefStore, {
                width: drawingAreaMeasurement.effectiveWidth,
                height: drawingAreaMeasurement.effectiveHeight,
                x: drawingAreaMeasurement.startX,
                y: drawingAreaMeasurement.startY,
                horizontalPadding: dsConf.horizontalPadding,
                verticalPadding: dsConf.verticalPadding
            }, rendererAPI]);
            dsConf.plotBorderThickness = _temp;
        }
        /*
         * Creates a custom path for the navigation bar element.
         * @param rect - {Object} - Holds the basic configuration for the custom path.
         * @param shape - {String} - Decides the shape modification required.
         * @param _offset - {Number} - Decides the strech of the central angle of the navigation bar seperator.
         * @return {Object} - path is the actual custom required path._path is the path internally might be useful in
         folding in/out of the navigation bar
        */
        function createNavigationPath (rect, shape, _offset) {
            var x = rect.x,
                y = rect.y,
                width = rect.width,
                height = rect.height,
                centerHalfAngle = dsConf.seperatorAngle / 2,
                init = ['M', x, y],
                offset = pluckNumber((centerHalfAngle ?  ((height/2) * (1 - mathTan(centerHalfAngle))) : _offset), 15),

                pathFetcher = function (height) {
                    return {
                        'both': ['h', width, 'v', height, 'h', -width, 'v', -height],
                        'right': ['h', width, 'v', height, 'h', -width, 'l', offset, -height/2, 'l', -offset,
                        -height/2],
                        'no': ['h', width, 'l', offset, height/2, 'l', -offset, height/2, 'h', -width, 'l', offset,
                            -height/2, 'l', -offset, -height/2],
                        'left': ['h', width, 'l', offset, height/2, 'l', -offset, height/2, 'h', -width, 'v', -height]
                    };
                };
            return {
                path: init.concat(pathFetcher(height)[shape]),
                _path: init.concat(pathFetcher(0)[shape]),
                offset: offset
            };
        }

        function drawStackedNavigation () {
            var args = Array.prototype.splice.call(arguments, 0);
            args.push(true);
            getDrawFn('navigationBar').apply(this, args);
        }

        updateContainers = (function () {
            var containers = [];
            return {
                get: function () {
                    return containers;
                },
                set: function (config) {
                    var container;
                    if (config) {
                        container = new Container();
                        container.init({
                            name: config.type,
                            drawingAreaMeasurement: config.drawingArea
                        }, config.drawFn);
                        containers.push(container);
                    }
                    else {
                        containers.length = 0;
                    }
                    return containers;
                }
            };
        })();
        /*
         * Adds all the graphics element in a pool which is again reused.
        */
        function remove() {
            var visibleRoot = afAPI.getVisibleRoot();
            // dispose the elements
            visibleRoot && rendererAPI.disposeChild(visibleRoot);
        }

        function draw(visibleRootArr) {
            var i,
                containersArr,
                containerElement,
                visibleRoot = afAPI.getVisibleRoot();
            // dispose the elements
            rendererAPI.disposeChild(visibleRoot);
            // The height proportions are set as per the target Root of the treemap container.
            visibleRootArr && (visibleRoot = visibleRootArr[1]);
            // no navigation bar if the target Node is the Global node.
            if (!visibleRoot.getParent()) {
                containerManager.heightProportion.set(false);
            }
            else if (dsConf.showNavigationBar){
                // on every drill the height proportions are changed.
                containerManager.heightProportion.set(true);
            }
            // fetch the container elements.
            containersArr = updateContainers.get();
            for (i = 0; i < containersArr.length; i += 1) {
                containerElement = containersArr[i];
                containerElement.setDrawingArea(getDrawingArea(containerElement.conf.name));
                visibleRootArr && afAPI.setVisibleRoot(visibleRootArr[i]);
                containerElement.draw();
            }
        }
        containerManager.init = init;
        containerManager.draw = draw;
        containerManager.heightProportion = _heightProportion;
        containerManager.remove = remove;

        return containerManager;
    };

    function ref() {
        var afAPI = {},
            algorithmFactory = {},
            containerManager = {};

        return {
            afAPI: afAPICreator(afAPI, algorithmFactory, containerManager),
            algorithmFactory: algorithmFactoryCreator(afAPI, algorithmFactory, containerManager),
            containerManager: containerManagerCreator(afAPI, algorithmFactory, containerManager),
            treeOpt: treeOpt
        };
    }
}]);


}));
