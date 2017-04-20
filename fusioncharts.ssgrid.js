
(function (factory) {
    if (typeof module === 'object' && typeof module.exports !== "undefined") {
        module.exports = factory;
    } else {
        factory(FusionCharts);
    }
}(function (FusionCharts) {

/**
 * @license FusionCharts JavaScript Library
 * Copyright FusionCharts Technologies LLP
 * License Information at <http://www.fusioncharts.com/license>
 *
 * @version 3.12.0
 */
/**
 * @private
 *
 * @module fusioncharts.renderer.javascript.ssgrid
 * @export fusioncharts.ssgrid.js
 *
 */
FusionCharts.register('module', ['private', 'modules.renderer.js-ssgrid', function () {

    var global = this,
        lib = global.hcLib,
        BLANKSTRING = lib.BLANKSTRING,
        pluck = lib.pluck,
        pluckNumber = lib.pluckNumber,
        chartAPI = lib.chartAPI,
        convertColor = lib.graphics.convertColor,
        getFirstColor = lib.getFirstColor,
        setLineHeight = lib.setLineHeight,
        win = global.window,
        math = Math,
        mathMin = math.min,
        mathMax = math.max,
        mathCeil = math.ceil,
        mathRound  = math.round,
        toRaphaelColor = lib.toRaphaelColor,
        PXSTRING = 'px',
        M = 'M',
        L = 'L',
        UNDEFINED,
        POSITION_START = lib.POSITION_START,
        HUNDREDSTRING = lib.HUNDREDSTRING,
        COLOR_TRANSPARENT = lib.COLOR_TRANSPARENT,
        creditLabel = false && !lib.CREDIT_REGEX.test(win.location.hostname);

    chartAPI('ssgrid', {
        standaloneInit: true,
        creditLabel: creditLabel,
        friendlyName: 'ssgrid Chart',
        defaultDatasetType: 'ssgrid',
        canvasBorderThickness: 1,
        singleseries: true,
        bgColor: '#FFFFFF',
        bgAlpha: 100,

        _drawCaption: function () {
        },
        _drawCanvas: function () {
        },
        _createAxes: function () {
            // Empty stub because subset of guages (pyramid, funnel) dont use axis.
        },
        _feedAxesRawData: function () {
            // Empty stub because subset of guages (pyramid, funnel) dont use axis.
        },
        _setCategories: function () {
            // Empty stub because subset of guages category.
        },
        _setAxisLimits: function () {
            // Empty stub because subset of guages axis.
        },
        _spaceManager: function () {
            var dataset = this.components.dataset[0];

            dataset._manageSpace && this._allocateSpace(dataset._manageSpace());
        }
    }, chartAPI.sscartesian);


    FusionCharts.register('component', ['dataset', 'ssgrid', {
        init: function (datasetJSON) {
            var dataSet = this,
                chart = dataSet.chart,
                visible;

            if (!datasetJSON) {
                return false;
            }
            dataSet.JSONData = datasetJSON;
            dataSet.chartGraphics = chart.chartGraphics;
            dataSet.components = {
            };

            dataSet.config = {
            };

            dataSet.graphics = {
            };

            dataSet.visible = visible = pluckNumber(dataSet.JSONData.visible,
                !Number(dataSet.JSONData.initiallyhidden), 1) === 1;
            dataSet.configure();
        },

        configure: function () {
            var dataSet = this,
                chart = dataSet.chart,
                conf = dataSet.config,
                chartAttr = chart.jsonData.chart || {},
                colorM = chart.components.colorManager,
                isBar = chart.isBar;

            // Fill color
            conf.plotFillAngle =  pluckNumber(360 - chartAttr.plotfillangle, (isBar ? 180 : 90));
            conf.plotFillAlpha = pluck(chartAttr.plotfillalpha, HUNDREDSTRING);
            // Border
            conf.plotBorderAlpha = pluck(chartAttr.plotborderalpha, HUNDREDSTRING);
            conf.plotBorderColor = pluck(chartAttr.plotbordercolor, colorM.getColor('plotBorderColor'));
            conf.plotDashLen = pluckNumber(chartAttr.plotborderdashlen, 5);
            conf.plotDashGap = pluckNumber(chartAttr.plotborderdashgap, 4);

            //Now, store all parameters
            //Whether to show percent values?
            conf.showPercentValues = pluckNumber(chartAttr.showpercentvalues, 0);
            //Number of items per page
            conf.numberItemsPerPage = pluckNumber(chartAttr.numberitemsperpage) || UNDEFINED;
            //Whether to show shadow
            conf.showShadow = pluckNumber(chartAttr.showshadow, 0);
            //Font Properties
            conf.baseFont = pluck(chartAttr.basefont, 'Verdana,sans');
            conf.baseFontSize = pluck(chartAttr.basefontsize, 10) + PXSTRING;
            conf.baseFontColor = getFirstColor(pluck(chartAttr.basefontcolor,
                colorM.getColor('baseFontColor')));

            //Alternate Row Color
            conf.alternateRowBgColor = getFirstColor(pluck(chartAttr.alternaterowbgcolor,
                colorM.getColor('altHGridColor')));
            conf.alternateRowBgAlpha = pluck(chartAttr.alternaterowbgalpha,
                colorM.getColor('altHGridAlpha')) + BLANKSTRING;

            //List divider properties
            conf.listRowDividerThickness = pluckNumber(chartAttr.listrowdividerthickness, 1);
            conf.listRowDividerColor = getFirstColor(pluck(chartAttr.listrowdividercolor,
                colorM.getColor('borderColor')));
            conf.listRowDividerAlpha = pluckNumber(pluckNumber(chartAttr.listrowdivideralpha,
                colorM.getColor('altHGridAlpha') + 15)) + BLANKSTRING;

            //Color box properties
            conf.colorBoxWidth = pluckNumber(chartAttr.colorboxwidth, 8);
            conf.colorBoxHeight = pluckNumber(chartAttr.colorboxheight, 8);
            //Navigation Properties
            conf.navButtonRadius = pluckNumber(chartAttr.navbuttonradius, 7);
            conf.navButtonColor = getFirstColor(pluck(chartAttr.navbuttoncolor,
                colorM.getColor('canvasBorderColor')));
            conf.navButtonHoverColor = getFirstColor(pluck(chartAttr.navbuttonhovercolor,
                colorM.getColor('altHGridColor')));

            //Paddings
            conf.textVerticalPadding = pluckNumber(chartAttr.textverticalpadding, 3);
            conf.navButtonPadding = pluckNumber(chartAttr.navbuttonpadding, 5);
            conf.colorBoxPadding = pluckNumber(chartAttr.colorboxpadding, 10);
            conf.valueColumnPadding = pluckNumber(chartAttr.valuecolumnpadding, 10);
            conf.nameColumnPadding = pluckNumber(chartAttr.namecolumnpadding, 5);

            // Shadow
            conf.shadow = pluckNumber(chartAttr.showshadow, 0) ? {
                enabled: true,
                opacity: conf.plotFillAlpha / 100
            } : false;

            // Reset the pageIndex while data is updated.
            dataSet.currentPage = 0;

            dataSet._setConfigure();
        },

        _setConfigure: function () {
            var dataSet = this,
                chart = dataSet.chart,
                conf = dataSet.config,
                JSONData = dataSet.JSONData,
                setDataArr = chart.jsonData && chart.jsonData.data,
                setDataLen = setDataArr && setDataArr.length || 0,
                prevDataLen = JSONData && JSONData.data && JSONData.data.length || 0,
                len = mathMax(setDataLen, prevDataLen),
                components = chart.components,
                colorM = components.colorManager,
                NumberFormatter = components.numberFormatter,
                index = dataSet.index || dataSet.positionIndex,
                plotColor = conf.plotColor = colorM.getPlotColor(index),
                parseUnsafeString = lib.parseUnsafeString,
                formatedVal,
                plotDashLen,
                plotDashGap,
                plotBorderThickness = conf.plotBorderThickness,
                plotFillRatio,
                plotBorderDashStyle,
                initailPlotBorderDashStyle = conf.plotBorderDashStyle,
                setData,
                setValue,
                dataObj,
                config,
                getDashStyle = lib.getDashStyle,
                dataStore = dataSet.components.data,
                plotFillAlpha,
                dataLabel,
                toolTipValue,
                setDisplayValue,
                setDataDashed,
                setDataPlotDashLen,
                setDataPlotDashGap,
                i,
                actualDataLen = 0,
                sumOfValues = 0,
                textStyle,
                tempIndex;

            if (!dataStore) {
                dataStore = dataSet.components.data = [];
            }

            // Parsing the attributes and values at set level.
            for (i = 0; i < len && setDataArr; i++) {

                setData = setDataArr[i];
                // If setData is not defined, remove the previously stored data from dataStore.
                if (!setData) {
                    // dataStore[i] && dataStore.splice(i, len);
                    continue;
                }
                setValue = NumberFormatter.getCleanValue(setData.value);
                dataLabel = parseUnsafeString(pluck(setData.label, setData.name));

                dataObj = config = UNDEFINED;

                if (setValue == null && dataLabel == BLANKSTRING) {
                    continue;
                } else {
                    dataObj = dataStore[actualDataLen] || (dataStore[actualDataLen] = { 'config': {} });
                    config = dataObj.config;
                }

                config.tooltext = setData.tooltext;
                config.showValue = pluckNumber(setData.showvalue, conf.showValues);
                config.setValue = setValue = NumberFormatter.getCleanValue(setData.value);
                config.setLink  = pluck(setData.link);
                config.toolTipValue = toolTipValue = NumberFormatter.dataLabels(setValue);
                config.setDisplayValue = setDisplayValue = parseUnsafeString(setData.displayvalue);
                // display value and label
                config.displayValue = NumberFormatter.dataLabels(setValue) || BLANKSTRING;
                config.dataLabel = parseUnsafeString(pluck(setData.label, setData.name)) || BLANKSTRING;

                setDataDashed = pluckNumber(setData.dashed);
                setDataPlotDashLen = pluckNumber(setData.dashlen, plotDashLen);
                setDataPlotDashGap = plotDashGap = pluckNumber(setData.dashgap, conf.plotDashGap);

                sumOfValues = sumOfValues + setValue;
                actualDataLen += 1;

                config.plotBorderDashStyle = plotBorderDashStyle =  setDataDashed === 1 ?
                    getDashStyle(setDataPlotDashLen, setDataPlotDashGap, plotBorderThickness) :
                        (setDataDashed === 0 ? 'none' : initailPlotBorderDashStyle);

                plotColor = pluck(setData.color, colorM.getPlotColor(pluckNumber((tempIndex - len), i)));

                plotFillRatio = pluck(setData.ratio, conf.plotFillRatio);


                plotFillAlpha = pluck(setData.alpha, conf.plotFillAlpha);
                // config.colorArr = colorArr = lib.graphics.getColumnColor();
                config.color = convertColor(plotColor, plotFillAlpha);
                config.borderColor = convertColor(conf.plotBorderColor,
                    pluck(setData.alpha, conf.plotBorderAlpha).toString());

                formatedVal = config.toolTipValue;

                tempIndex++;
            }


            // Creating the text style for SSGrid
            textStyle = {
                fontFamily: conf.baseFont,
                fontSize: conf.baseFontSize,
                color: conf.baseFontColor
            };
            setLineHeight(textStyle);
            conf.textStyle = textStyle;
            conf.actualDataLen = actualDataLen;
            conf.sumOfValues = sumOfValues;
        },

        _manageSpace: function () {
            var dataSet = this,
                chart = dataSet.chart,
                conf = dataSet.config,
                smartLabel = chart.linkedItems.smartLabel,
                dataStore = dataSet.components.data,
                chartConfig = chart.config,
                chartAttr = chart.jsonData.chart || {},
                borderThickness = chartConfig.borderThickness = pluckNumber(chartAttr.showborder, 1) ?
                    pluckNumber(chartAttr.borderthickness, 1) : 0,
                chartHeight = chartConfig.height - (borderThickness * 2),
                chartWidth = chartConfig.width - (borderThickness * 2),
                textStyle = conf.textStyle,
                actualDataLen = conf.actualDataLen,
                sumOfValues = conf.sumOfValues,
                components = chart.components,
                NumberFormatter = components.numberFormatter,
                maxValWidth = 0,
                i,
                config,
                rowHeight,
                itemsPerPage,
                cHeight,
                maxHeight,
                numItems,
                maxLabelWidth,
                dataObj,
                textSizeObj,
                len;

            // setting the style to LabelManagement
            smartLabel.useEllipsesOnOverflow(chartConfig.useEllipsesWhenOverflow);
            smartLabel.setStyle (textStyle);
            len = dataStore.length;

            for (i = 0; i < len; i++) {
                dataObj = dataStore[i];
                if (!dataObj) {
                    continue;
                }
                config = dataObj && dataObj.config;
                // If show values as percent
                conf.showPercentValues && (config.displayValue =
                    NumberFormatter.percentValue(config.setValue / sumOfValues * 100));

                //Now, we need to iterate through the value fields to get the max width
                //Simulate
                textSizeObj = smartLabel.getOriSize(config.displayValue);
                //Store maximum width
                maxValWidth = mathMax(maxValWidth, (textSizeObj.width + conf.valueColumnPadding));
            }

            //Get the max of two
            maxHeight = parseInt(textStyle.lineHeight, 10);
            //Add text vertical padding (for both top and bottom)
            maxHeight = maxHeight + 2 * conf.textVerticalPadding;
            //Also compare with color box height - as that's also an integral part
            maxHeight = mathMax(maxHeight, (conf.colorBoxHeight + conf.listRowDividerThickness));
            //Now that we have the max possible height, we need to calculate the page length.
            //First check if we can fit all items in a single page
            numItems = chartHeight / maxHeight;

            //Now, there are two different flows from here on w.r.t calculation of height
            //Case 1: If the user has specified his own number of items per page
            if (conf.numberItemsPerPage && numItems >= conf.numberItemsPerPage) {
                //In this case, we simply divide the page into the segments chosen by user
                //If all items are able to fit in this single page
                if (conf.numberItemsPerPage >= actualDataLen) {
                    //This height is perfectly alright and we can fit all
                    //items in a single page
                    //Set number items per page to total items.
                    conf.numberItemsPerPage = actualDataLen;
                    //So, NO need to show the navigation buttons
                    rowHeight = chartHeight / conf.numberItemsPerPage;
                    //End Index
                    itemsPerPage = actualDataLen;
                }
                else {
                    //We need to allot space for the navigation buttons
                    cHeight = chartHeight;
                    //Deduct the radius and padding of navigation buttons from height
                    cHeight = cHeight - 2 * (conf.navButtonPadding + conf.navButtonRadius);
                    //Now, get the maximum possible number of items that we can fit in each page
                    itemsPerPage = conf.numberItemsPerPage;
                    //Height for each row
                    rowHeight = cHeight / itemsPerPage;

                }
            } else {
                //Case 2: If we've to calculate best fit. We already have the maximum height
                //required by each row of data.
                //Storage for maximum height
                //Now, get the height required for any single text field
                //We do not consider wrapping.
                if (numItems >= actualDataLen) {
                    //We can fit all items in one page
                    rowHeight = (chartHeight / actualDataLen);
                    //Navigation buttons are not required.
                    //End Index
                    itemsPerPage = actualDataLen;
                } else {
                    //We cannot fit all items in same page. So, need to show
                    //navigation buttons. Reserve space for them.
                    //We need to allot space for the navigation buttons
                    cHeight = chartHeight;
                    //Deduct the radius and padding of navigation buttons from height
                    cHeight = cHeight - 2 * (conf.navButtonPadding + conf.navButtonRadius);
                    //Now, get the maximum possible number of items that we can fit in each page
                    itemsPerPage = Math.floor (cHeight / maxHeight);
                    //Height for each row
                    rowHeight = cHeight / itemsPerPage;
                }
            }

            //Now, we calculate the maximum avaiable width for data label column
            maxLabelWidth = chartWidth - conf.colorBoxPadding -
                conf.colorBoxWidth - conf.nameColumnPadding -
                maxValWidth - conf.valueColumnPadding;

            conf.labelX = conf.colorBoxPadding + conf.colorBoxWidth + conf.nameColumnPadding;

            conf.valueX = conf.colorBoxPadding + conf.colorBoxWidth +
                conf.nameColumnPadding + maxLabelWidth + conf.valueColumnPadding;
            conf.valueColumnPadding = conf.valueColumnPadding;
            conf.rowHeight = rowHeight;
            conf.itemsPerPage = itemsPerPage;

            conf.listRowDividerAttr = {
                'stroke-width': conf.listRowDividerThickness,
                stroke: convertColor(conf.listRowDividerColor,
                    conf.listRowDividerAlpha)
            };

            conf.alternateRowColor = convertColor(conf.alternateRowBgColor,
                    conf.alternateRowBgAlpha);

            return {
                top: 0,
                bottom: 0
            };
        },

        draw: function () {
            var dataSet = this,
                conf = dataSet.config,
                // visible = dataSet.visible,
                chart = dataSet.chart,
                chartComponents = chart.components,
                smartLabel = chart.linkedItems.smartLabel,
                paper = chartComponents.paper,
                layers = chart.graphics,
                datasetGroup = layers.datasetGroup,
                components = dataSet.components,
                dataStore = components.data,
                prevDataLen = dataStore.length,
                setDataArr = chart.jsonData && chart.jsonData.data,
                setDataLen = setDataArr && setDataArr.length || 0,
                len = mathMax(setDataLen, prevDataLen),
                graphics = dataSet.graphics,
                container,
                chartConfig = chart.config,
                borderThickness = chartConfig.borderThickness,
                xPos = borderThickness,
                yPos = borderThickness,
                width = chart.config.width - chartConfig.borderThickness,
                alternateRowColor = toRaphaelColor(conf.alternateRowColor),
                rowHeight = conf.rowHeight,
                listRowDividerAttr = conf.listRowDividerAttr,
                listRowDividerWidth = listRowDividerAttr['stroke-width'],
                halfW = (listRowDividerWidth % 2 / 2),
                colorBoxX = conf.colorBoxPadding + borderThickness,
                colorBoxHeight = conf.colorBoxHeight,
                colorBoxWidth = conf.colorBoxWidth,
                labelX = conf.labelX + borderThickness,
                valueX = conf.valueX + borderThickness,
                textStyle = conf.textStyle,
                // actualDataLen = conf.actualDataLen,
                itemsPerPage = conf.itemsPerPage,
                pageIndex = 0,
                currentPage = dataSet.currentPage || (dataSet.currentPage = 0),
                eventArgs = {},
                displayValueWidth,
                i,
                dataObj,
                config,
                setValue,
                alternateRowElem,
                crispY,
                listRowDivideElem,
                colorBoxElem,
                labelTextEle,
                valueTextEle;
            /*
             * Creating a container group for the graphic element of column plots if
             * not present and attaching it to its parent group.
             */
            if (!dataSet.graphics.container) {
                dataSet.graphics.container = [];
            }

            dataSet.currentPage = currentPage = mathMin(mathCeil(len / itemsPerPage) - 1, currentPage);

            // Create plot elements.
            for (i = 0; i < len; i++) {

                // Create individual group to store graphics elements page wise.
                if ((i + 1) % itemsPerPage == 1 || itemsPerPage == 1 || !container) {
                    yPos = borderThickness;
                    container = dataSet.graphics.container[pageIndex];
                    if (!container) {
                        container = dataSet.graphics.container[pageIndex] =
                            paper.group('grid-' + pageIndex, datasetGroup);
                    }
                    (pageIndex !== currentPage) ? container.hide() : container.show();
                    pageIndex += 1;
                    eventArgs = {
                        pageId: pageIndex,
                        data: []
                    };

                    container.data('eventArgs', eventArgs);
                }

                dataObj = dataStore[i];
                if (!dataObj) {
                    continue;
                }
                config = dataObj && dataObj.config;
                setValue = config && config.setValue;
                graphics = dataObj && (dataObj.graphics || (dataObj.graphics = {}));

                if (i >= setDataLen) {
                    graphics.alternateRow && graphics.alternateRow.remove();
                    graphics.alternateRow = UNDEFINED;
                    graphics.listRowDivideElem && graphics.listRowDivideElem.remove();
                    graphics.listRowDivideElem = UNDEFINED;
                    graphics.element && graphics.element.remove();
                    graphics.element = UNDEFINED;
                    graphics.label && graphics.label.remove();
                    graphics.label = UNDEFINED;
                    graphics.displayValue && graphics.displayValue.remove();
                    graphics.displayValue = UNDEFINED;
                    graphics.listRowDivideElem && graphics.listRowDivideElem.remove();
                    graphics.listRowDivideElem = UNDEFINED;
                    continue;
                }

                if (i % 2 === 0) {
                    if (!graphics.alternateRow) {
                        alternateRowElem = graphics.alternateRow = paper.rect();
                    }
                    container.appendChild(graphics.alternateRow);
                    graphics.alternateRow.attr({
                        x: xPos,
                        y: yPos + (conf.listRowDividerThickness * 0.5),
                        width: width - borderThickness,
                        height: rowHeight,
                        // r: 0,
                        fill: alternateRowColor,
                        'stroke-width': 0
                    });
                }

                    // Draw the color BOX
                if (!graphics.element) {
                    colorBoxElem = graphics.element = paper.rect();
                }
                container.appendChild(graphics.element);
                graphics.element.attr({
                    x: colorBoxX,
                    y: yPos + (rowHeight / 2) - (colorBoxHeight /
                        2),
                    width: colorBoxWidth,
                    height: colorBoxHeight,
                    // r: 0,
                    fill : config.color,
                    'stroke-width': 0,
                    stroke: '#000000'
                })
                .shadow(conf.shadow);

                // Draw value text
                displayValueWidth = smartLabel.getSmartText(config.displayValue).width || 0;
                if (!graphics.displayValue) {
                    valueTextEle = graphics.displayValue = paper.text();
                }
                container.appendChild(graphics.displayValue);
                graphics.displayValue.attr({
                    text: config.displayValue,
                    // title: (set.originalText || ''),
                    x: valueX,
                    y: (yPos + (rowHeight / 2)),
                    fill: textStyle.color,
                    direction: conf.textDirection,
                    'text-anchor': POSITION_START
                })
                .css (textStyle);

                // Draw label text
                if (!graphics.label) {
                    labelTextEle = graphics.label = paper.text();
                }
                config.label = smartLabel.getSmartText(config.dataLabel, width -
                    (displayValueWidth + colorBoxWidth + colorBoxX), rowHeight);
                container.appendChild(graphics.label);
                graphics.label.attr({
                    text: config.label.text,
                    // title: (set.originalText || ''),
                    x: labelX,
                    y: (yPos + (rowHeight / 2)),
                    fill: textStyle.color,
                    direction: conf.textDirection,
                    'text-anchor': POSITION_START
                })
                .css(textStyle);

                // Store data point configuration in container
                eventArgs.data.push({
                    color: config.color,
                    displayValue: config.displayValue,
                    label: config.dataLabel,
                    originalText: config.label.text,
                    y: (yPos + (rowHeight / 2))
                });

                yPos += rowHeight;

                crispY = mathRound(yPos) + halfW;
                if (!graphics.listRowDivideElem) {
                    listRowDivideElem = graphics.listRowDivideElem = paper.path();
                }
                container.appendChild(graphics.listRowDivideElem);
                graphics.listRowDivideElem.attr('path', [M, xPos, crispY, L, width, crispY])
                    .attr(listRowDividerAttr);
            }

            // Reset extra pages
            for (len = dataSet.graphics.container.length - 1; len >= pageIndex; len -= 1) {
                container = dataSet.graphics.container;
                container[len].remove();
                container.splice(len, 1);
            }

            this._drawSSGridNavButton();
        },

        _drawSSGridNavButton: function () {
            var dataSet = this,
                chart = dataSet.chart,
                conf = dataSet.config,
                actualDataLen = conf.actualDataLen,
                itemsPerPage = conf.itemsPerPage,
                graphics = dataSet.graphics,
                paper = chart.components.paper,
                width = chart.config.width,
                borderThickness = chart.config.borderThickness,

                // Navigation button drawing properties
                navButtonColor = conf.navButtonColor,
                navButtonHoverColor = conf.navButtonHoverColor,
                navButtonPadding = conf.navButtonPadding,
                radius = conf.navButtonRadius,
                radiusFregment = radius * 0.67,
                pageHeight = conf.itemsPerPage * conf.rowHeight,
                y = borderThickness + navButtonPadding + radiusFregment + pageHeight + radius * 0.5,
                x = 20 + borderThickness,
                nextEleX = width - x,
                layers = chart.graphics,
                trackerLayer = layers.trackerGroup,
                pageNavigationLayer = layers.pageNavigationLayer,
                pagePreNavigationLayer = layers.pagePreNavigationLayer,
                pageNextNavigationLayer = layers.pageNextNavigationLayer,
                len = graphics.container.length,
                currentPage = dataSet.currentPage,
                navElePrv,
                navTrackerPrv,
                navEleNxt,
                navTrackerNxt;

            if (!pageNavigationLayer) {
                pageNavigationLayer = layers.pageNavigationLayer = paper.group('page-nav', trackerLayer);
            }
            if (!pagePreNavigationLayer) {
                pagePreNavigationLayer = layers.pagePreNavigationLayer =
                    paper.group('page-prev-nav', pageNavigationLayer);
            }
            if (!pageNextNavigationLayer) {
                pageNextNavigationLayer = layers.pageNextNavigationLayer =
                    paper.group('page-next-nav', pageNavigationLayer);
            }


            if (actualDataLen > itemsPerPage) {
                pageNavigationLayer.show();
                // Draw the previous arrow icon
                if (!graphics.navElePrv) {
                    graphics.navElePrv = paper.path(pagePreNavigationLayer);
                }
                navElePrv = graphics.navElePrv.attr({
                    'path': [
                            M, x, y,
                            L, x + radius + radiusFregment, y - radiusFregment,
                            x + radius, y,
                            x + radius + radiusFregment, y + radiusFregment, 'Z'
                        ],
                        'fill': navButtonColor,
                        'stroke-width': 0,
                        'cursor': 'pointer'
                    });
                // Draw the previous tracker circle
                if (!graphics.navTrackerPrv) {
                    navTrackerPrv = graphics.navTrackerPrv = paper.circle(pagePreNavigationLayer)
                    .mouseover (function () {
                        navElePrv.attr ({
                            fill: navButtonHoverColor,
                            cursor: 'pointer'
                        });
                    })
                    .mouseout (function () {
                        navElePrv.attr ({
                            fill: navButtonColor
                        });
                    })
                    .click (function () {
                        dataSet._nenagitePage(-1);
                    });
                }
                navTrackerPrv = graphics.navTrackerPrv.attr({
                        cx: x + radius,
                        cy: y,
                        r: radius,
                        fill: COLOR_TRANSPARENT,
                        'stroke-width': 0,
                        cursor: 'pointer'
                    });

                // Draw the next arrow icon
                if (!graphics.navEleNxt) {
                    navEleNxt = graphics.navEleNxt = paper.path(pageNextNavigationLayer);
                }
                navEleNxt = graphics.navEleNxt.attr({
                    'path': [M, nextEleX, y, L, nextEleX - radius - radiusFregment, y - radiusFregment,
                            nextEleX - radius, y,
                            nextEleX - radius - radiusFregment, y + radiusFregment, 'Z'
                        ],
                    fill: navButtonColor,
                    'stroke-width': 0,
                    cursor: 'pointer'
                });
                // Draw the next tracker circle
                if (!graphics.navTrackerNxt) {
                    navTrackerNxt = graphics.navTrackerNxt = paper.circle(pageNextNavigationLayer)
                        .mouseover(function () {
                            navEleNxt.attr({
                                fill: navButtonHoverColor
                            });
                        })
                        .mouseout(function () {
                            navEleNxt.attr({
                                fill: navButtonColor
                            });
                        })
                        .click(function () {
                            dataSet._nenagitePage(1);
                        });
                }
                navTrackerNxt = graphics.navTrackerNxt.attr({
                        cx: nextEleX - radius,
                        cy: y,
                        r: radius,
                        fill: COLOR_TRANSPARENT,
                        'stroke-width': 0,
                        cursor: 'pointer'
                    });
                (currentPage === 0) ? pagePreNavigationLayer.hide() : pagePreNavigationLayer.show();
                (currentPage === len - 1) ? pageNextNavigationLayer.hide() : pageNextNavigationLayer.show();
            } else {
                pageNavigationLayer.hide();
            }
        },

        _nenagitePage: function (page) {
            var dataSet = this,
                chart = dataSet.chart,
                container = dataSet.graphics.container,
                currentPage = dataSet.currentPage,
                layers = chart.graphics,
                pagePreNavigationLayer = layers.pagePreNavigationLayer,
                pageNextNavigationLayer = layers.pageNextNavigationLayer,
                len = container.length,
                eventArgs;

            // Show/hide the page buttons
            if (container[currentPage + page]) {
                container[currentPage].hide();
                container[currentPage + page].show();
                currentPage = dataSet.currentPage += page;
            }
            eventArgs = container[currentPage].data('eventArgs');

            /**
             * This event is fired on page change in SSGrid chart.
             *
             * @event FusionCharts#pageNavigated
             * @group chart
             *
             * @param {object} data - Contains data of the sought page, with color, displayValue, originalText,
             * value and y position for each data points.
             * @param {number} pageId - Tells the index of the sought page.
             */
            global.raiseEvent('pageNavigated', {
                pageId: currentPage,
                data: eventArgs.data
            }, chart.chartInstance);

            // Show/hide the navigation buttons
            (currentPage === 0) ? pagePreNavigationLayer.hide() : pagePreNavigationLayer.show();
            (currentPage === len - 1) ? pageNextNavigationLayer.hide() : pageNextNavigationLayer.show();
        }
    }]);

}, [3, 2, 0, 'sr2']]);


}));
