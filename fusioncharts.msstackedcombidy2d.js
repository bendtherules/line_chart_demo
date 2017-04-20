
(function (factory) {
    if (typeof module === 'object' && typeof module.exports !== "undefined") {
        module.exports = factory;
    } else {
        factory(FusionCharts);
    }
}(function (FusionCharts) {

/**!
 * @license FusionCharts JavaScript Library
 * Copyright FusionCharts Technologies LLP
 * License Information at <http://www.fusioncharts.com/license>
 *
 * @version 3.12.0
 */
/**
 * @private
 * @module fusioncharts.renderer.javascript.msstepline
 */
FusionCharts.register('module', ['private', 'modules.renderer.js-msstepline', function() {
    var global = this,
        lib = global.hcLib,
        win = global.window,
        creditLabel = false && !lib.CREDIT_REGEX.test(win.location.hostname),
        COMPONENT = 'component',
        DATASET = 'dataset',
        chartAPI = lib.chartAPI,
        pluckNumber = lib.pluckNumber,
        pluck = lib.pluck,
        Image = win.Image,
        preDefStr = lib.preDefStr,
        schedular = lib.schedular,
        LINE = preDefStr.line,
        toRaphaelColor = lib.toRaphaelColor,
        getFirstValue = lib.getFirstValue,
        configStr = preDefStr.configStr,
        animationObjStr = preDefStr.animationObjStr,
        dataLabelStr = preDefStr.dataLabelStr,
        BLANKSTRING = lib.BLANKSTRING,
        hiddenStr = preDefStr.hiddenStr,
        SETROLLOVERATTR = 'setRolloverAttr',
        SETROLLOUTATTR = 'setRolloutAttr',
        math = Math,
        mathMax = math.max,
        hasTouch = lib.hasTouch,
        TOUCH_THRESHOLD_PIXELS = lib.TOUCH_THRESHOLD_PIXELS,
        CLICK_THRESHOLD_PIXELS = lib.CLICK_THRESHOLD_PIXELS,
        HTP = hasTouch ? TOUCH_THRESHOLD_PIXELS : CLICK_THRESHOLD_PIXELS,
        M = 'M',
        H = 'H',
        V = 'V',
        ROUND = preDefStr.ROUND,
        miterStr = preDefStr.miterStr,
        UNDEFINED,
        NORMALSTRING = 'normal';

    chartAPI('msstepline', {
        friendlyName: 'Multi-series Step Line Chart',
        standaloneInit: true,
        creditLabel: creditLabel,
        defaultDatasetType: 'msstepline',
        defaultPlotShadow: 1,
        applicableDSList: {'msstepline': true}
    }, chartAPI.mscartesian, {
        drawverticaljoins: 1,
        useforwardsteps: 1,
        zeroplanethickness: 1,
        zeroplanealpha: 40,
        showzeroplaneontop: 0,
        enablemousetracking: true
    }, chartAPI.areabase);

    FusionCharts.register('module', ['private', 'modules.renderer.js-dataset-group-msstepline',
        function () {
            var COMPONENT = 'component',
                DATASET_GROUP = 'datasetGroup';

            FusionCharts.register(COMPONENT, [DATASET_GROUP, 'msstepline', {
            },'line']);
        }
    ]);

    FusionCharts.register(COMPONENT, [DATASET, 'MSStepLine', {
        type: 'msstepline',
        _addLegend: function () {
            var dataset = this,
                chart = dataset.chart,
                conf = dataset.config,
                legend = chart.components.legend,
                drawAnchors = pluckNumber(conf.drawanchors, 1),
                config = {
                    enabled: conf.includeinlegend,
                    type : LINE,
                    /* In case of scatter (a child chartAPI of line),
                    line is drawn in legend only when drawLine is set
                    to true. */
                    drawLine: pluck(conf.drawLine, true),
                    fillColor : toRaphaelColor({
                        color: conf.anchorbgcolor,
                        alpha: conf.anchorbgalpha
                    }),
                    strokeColor: toRaphaelColor({
                        color: conf.anchorbordercolor,
                        alpha: '100'
                    }),
                    rawFillColor: conf.anchorbgcolor,
                    rawStrokeColor: conf.anchorbordercolor,
                    anchorSide: drawAnchors ? conf.anchorsides : 0,
                    strokeWidth: conf.anchorborderthickness,
                    label : getFirstValue(dataset.JSONData.seriesname),
                    lineWidth: conf.linethickness
                };
            dataset.legendItemId = legend.addItems(dataset, dataset.legendInteractivity, config);
        },
        draw: function () {// retrive requitrd objects
            var dataSet = this,
                JSONData = dataSet.JSONData,
                chart = dataSet.chart,
                jobList = chart.getJobList(),
                chartComponents = chart.components,
                conf = dataSet.config,
                datasetIndex = dataSet.index || dataSet.positionIndex,
                chartConfig = chart.config,
                len,
                i,
                paper = chartComponents.paper,
                xAxis = chartComponents.xAxis[0],
                yAxis = dataSet.yAxis,
                xPos,
                yPos,
                layers = chart.graphics,
                dataLabelsLayer = layers.datalabelsGroup,
                toolText,
                label,
                setElement,
                hotElement,
                setLink,
                setValue,
                eventArgs,
                displayValue,
                dataStore = dataSet.components.data,
                dataObj,
                setRolloutAttr,
                setRolloverAttr,
                removeDataArr = dataSet.components.removeDataArr || [],
                removeDataArrLen = removeDataArr.length,
                lineThickness = conf.linethickness,
                container = dataSet.graphics.container,
                connectNullData = chartConfig.connectnulldata,
                group = layers.datasetGroup,
                hoverEffects,
                shadow = conf.shadow,
                anchorShadow,
                dataLabelContainer = dataSet.graphics.dataLabelContainer,
                anchorProps = {},
                imgRef,
                symbol,
                config,
                animationObj = chart.get(configStr, animationObjStr),
                dummyAnimElem = animationObj.dummyObj,
                dummyAnimObj = animationObj.animObj,
                animationDuration = animationObj.duration,
                pool = dataSet.components.pool || [],
                showValue,
                pathAttr,
                EVENTARGS = 'eventArgs',
                /*
                    Called when transpose animation is completed
                    for hiding the dataset
                */
                animCallBack = function() {
                    if (dataSet.visible === false && (dataSet._conatinerHidden === false ||
                            dataSet._conatinerHidden=== undefined)) {
                        container.lineGroup.hide();
                        container.lineShadowGroup.hide();
                        container.anchorShadowGroup.hide();
                        container.anchorGroup.hide();
                        dataLabelContainer && dataLabelContainer.hide();
                        dataSet._conatinerHidden = true;
                    }
                },
                /*
                    Called when the initial animation compeletes
                    for showing the dataset
                */
                initAnimCallBack = function () {
                    group.lineConnector.attr({
                        'clip-rect': null
                    });
                    // fix for ie11
                    group.lineConnector.node && group.lineConnector.node.removeAttribute('clip-path');
                    if (dataSet.visible !== false) {
                        container.lineShadowGroup.show();
                        container.anchorShadowGroup.show();
                        container.anchorGroup.show();
                        dataLabelContainer && dataLabelContainer.show();
                    }
                    // animCompleteFn();
                },
                animFlag = true,
                setTooltext,
                connector,
                dashStyle,
                yBase = yAxis.getAxisBase(),
                yBasePos = yAxis.yBasePos = yAxis.getAxisPosition(yBase),
                clipConf = chartComponents.canvas.config.clip,
                clipCanvasInit = clipConf['clip-canvas-init'].slice(0),
                clipCanvas = clipConf['clip-canvas'].slice(0),
                lineDashStyle = conf.lineDashStyle,
                lineColorObj = {
                    color: conf.linecolor,
                    alpha: conf.alpha
                },
                setColor,
                setDashStyle,
                lineSegmentChange,
                colorObj,
                linePath = [],
                lscthash,
                lineDrawing = 0,
                mainLinePath = [],
                lastYPos = null,
                lastXPos,
                lastMoveCommand = [],
                initialAnimation = false,
                connectorShadow,
                MAX_MITER_LINEJOIN = 2,
                cosmeticAttrs,
                lineElement = dataSet.graphics.lineElement,
                visible = dataSet.visible,
                drawVerticalJoins = conf.drawverticaljoins,
                useForwardSteps = conf.useforwardsteps,
                labelElement,
                imageElement,
                polypath,
                animType = animationObj.animType,
                isNewElem,
                noOfImages = 0,
                catLabel,
                halfStep = chart.config.stepatmiddle ? xAxis.getPVR() * 0.5 : 0,
                radius,
                borderThickness,
                topAnchorPos,
                bottomAnchorPos,
                canvasTop = chartConfig.canvasTop,
                canvasBottom = chartConfig.canvasBottom;

            conf.imagesLoaded = 0;
            /*
             * Creating lineConnector group and appending it to dataset layer if not created
             * Lineconnector group has the anchorgroups of all datasets
             */
            group.lineConnector = group.lineConnector ||
                paper.group('line-connector', group);
            // Create dataset container if not created
            if (!container) {
                container = dataSet.graphics.container = {
                    lineShadowGroup: paper.group('connector-shadow', group.lineConnector),
                    anchorShadowGroup: paper.group('anchor-shadow', group.lineConnector),
                    lineGroup: paper.group(LINE, group.lineConnector),
                    anchorGroup: paper.group('anchors', group.lineConnector)
                };
                if (!visible) {
                    container.lineShadowGroup.hide();
                    container.anchorShadowGroup.hide();
                    container.lineGroup.hide();
                    container.anchorGroup.hide();
                }

            }

            if (!dataStore) {
                dataStore = dataSet.components.data = [];
            }

            if (!dataLabelContainer) {
                dataLabelContainer = dataSet.graphics.dataLabelContainer = dataSet.graphics.dataLabelContainer ||
                    paper.group(dataLabelStr, dataLabelsLayer);
                if (!visible) {
                    dataLabelContainer.hide();
                }
            }

            if (visible) {
                container.lineShadowGroup.show();
                container.anchorShadowGroup.show();
                container.lineGroup.show();
                container.anchorGroup.show();
                dataLabelContainer.show();
            }
            len = xAxis.getCategoryLen();
            //create plot elements
            for (i=0; i<len; i++) {
                dataObj = dataStore[i];
                if (!dataObj) {
                    continue;
                }
                config = dataObj.config;
                setValue = config.setValue;
                setLink  = config.setLink;
                setTooltext = config.setLevelTooltext;
                showValue = config.showValue;
                anchorProps = config.anchorProps;
                symbol = anchorProps.symbol;
                anchorShadow = anchorProps.shadow;
                displayValue = config.displayValue;
                setElement = dataObj.graphics.element;
                imageElement = dataObj.graphics.image;
                hotElement = dataObj.graphics.hotElement;
                labelElement = dataObj.graphics.label;
                // Creating the data object if not created
                if (!dataObj) {
                    dataObj = dataStore[i] = {
                        graphics : {}
                    };
                }
                // If value is null
                if (setValue === null) {
                    lastMoveCommand.length = 0;
                    if (!connectNullData) {
                        lastYPos = null;
                    }
                    setElement && setElement.hide();
                    imageElement && imageElement.hide();
                    labelElement && labelElement.hide();
                    hotElement && hotElement.hide();
                }
                else {
                    // Storing the color Object of this data
                    colorObj = {
                        color: config.color,
                        alpha: config.alpha
                    };
                    dashStyle = config.dashStyle;
                    xPos = xAxis.getAxisPosition(i);
                    // On hiding a dataset the y position of the hidden dataset is set to yBasePos
                    if (!dataSet.visible && animationDuration) {
                        yPos = yBasePos;
                    }
                    else {
                        yPos = yAxis.getAxisPosition(setValue);
                    }
                    hoverEffects = config.hoverEffects;
                    anchorProps.isAnchorHoverRadius = hoverEffects.anchorRadius;

                    radius = anchorProps.radius;
                    borderThickness = anchorProps.borderThickness;

                    topAnchorPos = yPos - radius - (borderThickness / 2);
                    bottomAnchorPos = yPos + radius + (borderThickness / 2);

                    topAnchorPos < canvasTop && (chartConfig.toleranceTop = mathMax(chartConfig.toleranceTop || 0,
                        canvasTop - topAnchorPos));
                    bottomAnchorPos > canvasBottom && (chartConfig.toleranceBottom = mathMax(
                        chartConfig.toleranceBottom || 0, bottomAnchorPos - canvasBottom));

                    label = config.label;
                    catLabel = xAxis.getLabel(i);

                    if (!chartConfig.showtooltip) {
                        toolText = BLANKSTRING;
                    }
                    else {
                        toolText = config.toolText + (setTooltext ? BLANKSTRING : config.toolTipValue);
                    }

                    config.finalTooltext = toolText;

                    eventArgs = config.eventArgs || (config.eventArgs = {});
                    // Storing the event arguments
                    eventArgs.index = i;
                    eventArgs.link = setLink;
                    eventArgs.value = setValue;
                    eventArgs.displayValue = displayValue;
                    eventArgs.categoryLabel = catLabel;
                    eventArgs.toolText = toolText;
                    eventArgs.id = conf.userID;
                    eventArgs.datasetIndex = datasetIndex;
                    eventArgs.datasetName = JSONData.seriesname;
                    eventArgs.visible = visible;

                    isNewElem = false;
                    // If imageurl is present
                    if (anchorProps.imageUrl) {
                        config.anchorImageLoaded = false;
                        dataObj._xPos = xPos;
                        dataObj._yPos = yPos;
                        imgRef = new Image();
                        imgRef.onload = this._onAnchorImageLoad(dataSet, i, eventArgs, xPos, yPos);
                        imgRef.onerror = this._onErrorSetter(dataSet, i);
                        imgRef.src = anchorProps.imageUrl;
                        noOfImages++;
                    }
                    else {
                        imageElement && imageElement.hide();
                        polypath = [symbol[1] || 2, xPos, yPos,
                            anchorProps.radius, anchorProps.startAngle, anchorProps.dip];
                        cosmeticAttrs = {
                            fill: toRaphaelColor({
                                color: anchorProps.bgColor,
                                alpha: anchorProps.bgAlpha
                            }),
                            stroke: toRaphaelColor({
                                color: anchorProps.borderColor,
                                alpha: anchorProps.borderAlpha
                            }),
                            'stroke-width': anchorProps.borderThickness,
                            visibility: !anchorProps.radius ? hiddenStr : visible
                        };
                        // Create anchor element if not created
                        if (!setElement) {
                            if (pool.element && pool.element.length) {
                                setElement = dataObj.graphics.element = pool.element.shift();
                            }
                            else {
                                isNewElem = true;
                                setElement = dataObj.graphics.element = paper.polypath(container.anchorGroup);
                                setElement.attr({
                                    polypath: polypath
                                });
                            }
                        }

                        setElement.show().animateWith(dummyAnimElem, dummyAnimObj, {
                            polypath: polypath
                        }, animationDuration, animType,  animFlag && animCallBack);

                        setElement.attr(cosmeticAttrs)
                        .shadow(anchorShadow, container.anchorShadowGroup)
                        .data('hoverEnabled', hoverEffects.enabled)
                        .data(EVENTARGS,eventArgs);
                        animFlag = false;
                    }

                    connector = dataObj.graphics.connector;
                    if (hoverEffects.enabled) {
                        setRolloverAttr = {
                            polypath: [hoverEffects.anchorSides || 2,
                                        xPos, yPos,
                                        hoverEffects.anchorRadius,
                                        hoverEffects.startAngle,
                                        hoverEffects.dip
                                    ],
                            fill: toRaphaelColor({
                                color: hoverEffects.anchorColor,
                                alpha: hoverEffects.anchorBgAlpha
                            }),
                            stroke: toRaphaelColor({
                                color: hoverEffects.anchorBorderColor,
                                alpha: hoverEffects.anchorBorderAlpha
                            }),
                            'stroke-width': hoverEffects.anchorBorderThickness
                        };
                        setRolloutAttr = {
                            polypath: [anchorProps.sides, xPos, yPos,
                                        anchorProps.radius, anchorProps.startAngle, 0
                                    ],
                            fill: toRaphaelColor({
                                color: anchorProps.bgColor,
                                alpha: anchorProps.bgAlpha
                            }),
                            stroke: toRaphaelColor({
                                color: anchorProps.borderColor,
                                alpha: anchorProps.borderAlpha
                            }),
                            'stroke-width': anchorProps.borderThickness
                        };
                        setElement && setElement
                        .data('anchorRadius', anchorProps.radius)
                        .data('anchorHoverRadius', hoverEffects.anchorRadius)
                        .data('hoverEnabled', hoverEffects.enabled)
                        .data(SETROLLOVERATTR, setRolloverAttr)
                        .data(SETROLLOUTATTR, setRolloutAttr)
                        .data(EVENTARGS,eventArgs);
                    }

                    config.trackerConfig || (config.trackerConfig = {});

                    config.trackerConfig.trackerRadius = mathMax(anchorProps.radius,
                        hoverEffects && hoverEffects.anchorRadius || 0, HTP) +
                        ((anchorProps.borderThickness || 0) / 2);
                    // // anchor Radius of hot element is set to maximum of hover radius and anchor radius
                    // anchorRadius = mathMax(anchorProps.radius,
                    //     hoverEffects &&
                    //     hoverEffects.anchorRadius || 0, HTP);

                    /*
                        if colorObj and dash style of this data is different from
                        the previous data then a new line segment is to be created
                    */
                    lineSegmentChange = (lscthash !== [
                        toRaphaelColor(colorObj || lineColorObj),
                        dashStyle || lineDashStyle
                    ].join(':'));
                    // If the y position of the last value is not null
                    if (lastYPos !== null) {
                        if (lastMoveCommand.length) {
                            linePath = linePath.concat(lastMoveCommand);
                            lastMoveCommand.length = 0;
                        }
                        // move to the starting position of the line segment
                        if (!linePath.join(BLANKSTRING)) {
                            linePath.push(M, lastXPos, lastYPos);
                        }
                        if (useForwardSteps) {
                            linePath.push(H, xPos - halfStep);
                            if (drawVerticalJoins) {
                                linePath.push(V, yPos);
                            }
                            else {
                                linePath.push(M, xPos - halfStep, yPos);
                            }
                            if (halfStep) {
                                linePath.push(H, xPos);
                            }
                        }
                        else {
                            if (drawVerticalJoins) {
                                linePath.push(V, yPos);
                            }
                            else {
                                linePath.push(M, lastXPos, yPos);
                            }
                            linePath.push(H, xPos);
                        }
                        // If a new line segment is to be created
                        if (lineSegmentChange) {
                            // If a connector path is to drawn
                            if (!lineDrawing) {
                                if (!connector) {
                                    connector = dataObj.graphics.connector = paper.path(linePath,
                                        container.lineGroup);
                                    initialAnimation = true;
                                }

                                connector.animateWith(dummyAnimElem, dummyAnimObj, {
                                    path: linePath
                                }, animationDuration, animType, animFlag && animCallBack);

                                connector.attr({
                                    'stroke-dasharray': setDashStyle,
                                    'stroke-width': lineThickness,
                                    'stroke': setColor,
                                    'stroke-linecap': ROUND,
                                    'stroke-linejoin': lineThickness >
                                        MAX_MITER_LINEJOIN ? ROUND : miterStr
                                })
                                .shadow(connectorShadow, container.lineShadowGroup);
                                animFlag = false;

                            }
                            // Else appending the path to main Line path
                            else {
                                mainLinePath = mainLinePath.concat(linePath);
                            }
                            linePath = [];
                        }
                        // Hide the unused disjoint lines and push it to pool for reusing it next time when new
                        // disjoint lines will be drawn
                        if (!lineSegmentChange) {
                            if (connector) {
                                connector.hide();
                            }
                        }
                    } else {
                        // Pushing the x  y position of move command to lastMoveCommand array
                        lastMoveCommand.push(M, xPos, yPos);
                    }
                    // Storing the xPos and yPos of this data for next iterations
                    lastXPos = xPos;
                    lastYPos = yPos;
                    setColor = toRaphaelColor(colorObj || lineColorObj);
                    if (colorObj) {
                        connectorShadow = {
                            opacity: colorObj && colorObj.alpha/100
                        };
                    }
                    else {
                        connectorShadow = shadow;
                    }
                    setDashStyle = dashStyle || lineDashStyle;
                    /*If color,alpha or dashed is not defined for this data
                    then line drawing is set to 1 so the path of this data is
                    appended to mainLinePath and not the connector path
                    */
                    if (pluck(config.color, config.alpha, config.dashed) === UNDEFINED) {
                        lineDrawing = 1;
                    }
                    else {
                        lineDrawing = 0;
                    }
                    lscthash = [setColor, setDashStyle].join(':');
                    /*Storing the x position and y position in dataObject for future reference
                    For example - when drawing labels we need this xPos and yPos
                    */
                    dataObj._xPos = xPos;
                    dataObj._yPos = yPos;

                    !anchorProps.imageUrl && this.drawLabel(i);
                }
            }

            conf.noOfImages = conf.totalImages = noOfImages;

            if (noOfImages === 0) {
                jobList.labelDrawID.push(schedular.addJob(dataSet.drawLabel, dataSet, [],
                    lib.priorityList.label));
            }


            if (linePath.length) {
                mainLinePath = mainLinePath.concat(linePath);
            }
            pathAttr = {
                path: mainLinePath
            };
            cosmeticAttrs = {
                'stroke-dasharray': lineDashStyle,
                'stroke-width': lineThickness,
                'stroke': toRaphaelColor(lineColorObj),
                'stroke-linecap': ROUND,
                /*  for lines even with thickness as 2 we need to have round line join
                    otherwise the line join may look like exceeding the correct position
                */
                'stroke-linejoin': lineThickness >= MAX_MITER_LINEJOIN ? ROUND : miterStr
            };
            if (!lineElement) {
                lineElement = dataSet.graphics.lineElement = paper.path({
                    path: mainLinePath
                }, container.lineGroup);
                initialAnimation = true;
            }

            lineElement.show().animateWith(dummyAnimElem, dummyAnimObj,
                pathAttr, animationDuration, animType, animFlag && animCallBack);

            lineElement.attr(cosmeticAttrs)
                .shadow(shadow, container.lineShadowGroup);
            animFlag = false;

            if (animationDuration && visible && initialAnimation) {
                container.anchorGroup.hide();
                container.lineShadowGroup.hide();
                container.anchorShadowGroup.hide();
                dataLabelContainer.hide();
                group.lineConnector.attr({
                    'clip-rect': clipCanvasInit
                })
                .animateWith(dummyAnimElem, dummyAnimObj, {
                    'clip-rect': clipCanvas
                }, animationDuration, NORMALSTRING, initAnimCallBack);
            }
            for (i = 0; i < removeDataArrLen; i++) {
                dataSet._removeDataVisuals(removeDataArr.shift());
            }
            dataSet.drawn = true;
        }
    }, LINE, {
        drawverticaljoins : undefined,
        useforwardsteps : undefined
    }]);
}]);

/**!
 * @license FusionCharts JavaScript Library MSStackedCombiDY2D Chart
 * Copyright FusionCharts Technologies LLP
 * License Information at <http://www.fusioncharts.com/license>
 *
 * @version 3.12.0
 */
/**
 * @private
 * @module fusioncharts.renderer.javascript.msstackedcombidy2d
 * @requires fusioncharts.renderer.javascript.msstepline
 * @export fusioncharts.msstackedcombidy2d.js
 */
FusionCharts.register('module', ['private', 'modules.renderer.js-msstackedcombidy2d', function () {

    // Register the module with FusionCharts and als oget access to a global
    // variable within the core's scope.
    var global = this,
        win = global.window,
        CHARTS = 'charts',
        lib = global.hcLib,
        chartAPI = lib.chartAPI,
        moduleCmdQueue = lib.moduleCmdQueue,
        injectModule = lib.injectModuleDependency, // access module dependency
        pluck = lib.pluck,
        UNDEFINED,
        creditLabel = false && !lib.CREDIT_REGEX.test(win.location.hostname),
        chartAPIConf,
        msscdy2dlogic; // store logic as object to be defined later

    msscdy2dlogic = {
        friendlyName: 'Multi-series Dual Y-Axis Stacked Combination Chart',
        creditLabel: creditLabel,
        defaultDatasetType: 'column',
        applicableDSList: { 'line': true, 'area': true, 'column': true, 'column3d' : true, 'msstepline' : true},
        _createDatasets : function () {
            var iapi = this,
                components = iapi.components,
                dataObj = iapi.jsonData,
                dataset = dataObj.dataset,
                length = dataset && dataset.length,
                i,
                j,
                datasetStore,
                datasetObj,
                defaultSeriesType = iapi.defaultDatasetType,
                applicableDSList = iapi.applicableDSList,
                legend = iapi.components.legend,
                xAxis = components.xAxis[0],
                GroupManager,
                dsType,
                DsClass,
                DsGroupClass,
                datasetJSON,
                groupManagerName,
                parentyaxis,
                prevDataLength,
                currDataLength,
                groupManagers = [],
                dsCount = { },
                config = iapi.config,
                diff,
                catLen = iapi.config.catLen,
                currCatLen,
                dataDiff,
                catDiff,
                prevData,
                diffObj,
                innerLength,
                startIndex,
                loopLength,
                datasetIndex = 0,
                // map,line,area,column, stores the index of the various dataplots in combinational charts.
                datasetMap = config.datasetMap || (config.datasetMap = {
                    line : [],
                    area : [],
                    column : [],
                    column3d: [],
                    msstepline : []
                }),
                dsTypeRef,
                tempMap = {
                    line : [],
                    area : [],
                    column : [],
                    column3d: [],
                    msstepline : []
                },
                inited = {},
                parentDataset;

            if (!dataset) {
                iapi.setChartMessage();
            }

            iapi.config.categories = dataObj.categories && dataObj.categories[0].category;
            datasetStore = components.dataset = [];
            for (i=0; i<length; i++) {
                parentDataset = dataset[i];

                parentyaxis = parentDataset.parentyaxis || '';

                dsType = pluck (parentDataset.renderas, defaultSeriesType);
                dsType = dsType && dsType.toLowerCase ();
                if (dsType === 'stepline' || (dsType === 'line' && Number(parentDataset.drawinstepmode))) {
                    dsType = 'msstepline';
                }
                else if (dsType === 'spline') {
                    dsType = 'line';
                }

                if (!applicableDSList[dsType]) {
                    dsType = defaultSeriesType;
                }

                /// get the DsClass
                DsClass = FusionCharts.get('component', ['dataset', dsType]);
                innerLength = (parentDataset.dataset && parentDataset.dataset.length);
                if (dsCount[dsType] === UNDEFINED) {
                    dsCount[dsType] = 0;
                }
                else {
                    dsCount[dsType]++;
                }
                groupManagerName = 'datasetGroup_' + dsType;
                // get the ds group class
                DsGroupClass = FusionCharts.register('component', ['datasetGroup', dsType]);
                GroupManager = components[groupManagerName];
                GroupManager && groupManagers.push(GroupManager);
                dsTypeRef = datasetMap[dsType];
                if (DsGroupClass && !GroupManager) {
                    GroupManager = components[groupManagerName] = new DsGroupClass ();
                    GroupManager.chart = iapi;
                    GroupManager.init ();
                }
                // Resetting the groupManager object if it is an update.
                else if (GroupManager && !inited[dsType]) {
                    GroupManager.init ();
                }
                inited[dsType] = true;
                for (j = 0, loopLength = innerLength || 1; j < loopLength; j++) {
                    datasetObj = dsTypeRef[0];
                    if (innerLength) {
                        datasetJSON = parentDataset.dataset[j];
                        datasetJSON.parentyaxis = parentDataset.parentyaxis;
                    }
                    else {
                        datasetJSON = parentDataset;
                    }
                    if (DsClass) {
                        // If the dataset does not exists.
                        if (!datasetObj) {
                            // create the dataset Object
                            datasetObj = new DsClass ();
                            datasetObj.chart = iapi;
                            datasetObj.index = datasetIndex;
                            datasetObj.init (datasetJSON);
                        }
                        // If the dataset exists incase the chart is updated using setChartData() method.
                        else {
                            currCatLen = xAxis.getCategoryLen();
                            catDiff = catLen - currCatLen;
                            prevData = datasetObj.JSONData;
                            prevDataLength = prevData.data && prevData.data.length;
                            currDataLength = (datasetJSON.data && datasetJSON.data.length) || 0;

                            dataDiff = prevDataLength - currDataLength;

                            diffObj = iapi._getDiff(dataDiff, currDataLength, catDiff, currCatLen);
                            diff = diffObj.diff;
                            startIndex = diffObj.startIndex;

                            // Removing data plots if the number of current data plots/categories
                            // is more than the existing ones.
                            if (diff > 0) {
                                datasetObj.removeData(startIndex, diff, false);
                            }

                            datasetObj.JSONData = datasetJSON;
                            datasetObj.index = datasetIndex;
                            datasetObj.configure();
                            dsTypeRef.splice(0, 1);
                        }
                        // add to group manager
                        GroupManager && GroupManager.addDataSet (datasetObj, dsCount[dsType], j);
                        // Push new dataset object into both tempmap array and datastore array
                        tempMap[dsType].push(datasetObj);
                        datasetStore.push (datasetObj);
                        datasetIndex++;
                    }
                }

            }

            iapi._setDatasetOrder();
            // Removing unused datasets if any
            for (dataset in datasetMap) {
                dsTypeRef  = datasetMap[dataset];
                length = dsTypeRef.length;
                for (j = 0; j < length; j++) {
                    legend.removeItem(dsTypeRef[j].legendItemId);
                    lib.componentDispose.call(dsTypeRef[j]);
                }

            }
            config.datasetMap = tempMap;
            iapi.config.catLen = xAxis.getCategoryLen();
        }
    };

    chartAPIConf = {
        hasLineSet : 0,
        isstacked : true,
        isdual : true,
        drawverticaljoins: 1,
        useforwardsteps: 1,
        zeroplanethickness: 1,
        zeroplanealpha: 40,
        showzeroplaneontop: 0,
        stepatmiddle: 1,
        enablemousetracking: true
    };

    // Add the definition to chart structure.
    if (chartAPI.msdybasecartesian) {
        chartAPI('msstackedcombidy2d', msscdy2dlogic, chartAPI.msdybasecartesian, chartAPIConf, chartAPI.areabase);
    }
    else {
        injectModule(CHARTS, 'msstackedcombidy2d', 1); // add charts dependency

        // enqueue definition
        moduleCmdQueue[CHARTS].unshift({
            cmd: '_call',
            obj: win,
            args: [function () {
                if (!chartAPI.msdybasecartesian) {
                    global.raiseError(global.core, '12052314141', 'run',
                        'JavaScriptRenderer~MSStackedCombiDY2D._call()',
                        new Error('FusionCharts.HC.Charts.js is required in order to define vizualization'));
                    return;
                }
                chartAPI('msstackedcombidy2d', msscdy2dlogic, chartAPI.msdybasecartesian, chartAPIConf,
                    chartAPI.areabase);

            }, [], win]
        });
    }

}]);


}));
