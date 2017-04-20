
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
 * @module fusioncharts.renderer.javascript.sparkcharts
 * @_export fusioncharts.sparkcharts.js
 *
 */
FusionCharts.register('module', ['private', 'modules.renderer.js-spark', function () {

    var global = this,
        lib = global.hcLib,
        //strings
        BLANKSTRING = lib.BLANKSTRING,
        //add the tools thats are requared
        pluck = lib.pluck,
        pluckNumber = lib.pluckNumber,
        extend2 = lib.extend2,//old: jarendererExtend / maegecolone
        chartAPI = lib.chartAPI,
        getLightColor = lib.graphics.getLightColor,
        COMMASTRING = lib.COMMASTRING,
        convertColor = lib.graphics.convertColor,
        // chartPaletteStr = lib.chartPaletteStr,
        getValidValue = lib.getValidValue,
        // getFirstValue = lib.getFirstValue,
        // getFirstAlpha = lib.getFirstAlpha,
        win = global.window,
        math = Math,
        mathMin = math.min,
        mathMax = math.max,
        mathCeil = math.ceil,
        // mathRound = math.round,
        toRaphaelColor = lib.toRaphaelColor,
        parseUnsafeString = lib.parseUnsafeString,
        getColumnColor = lib.graphics.getColumnColor,
        GUTTER_PADDING = 2,
        parseColor = lib.graphics.parseColor,
        COLOR_TRANSPARENT = lib.COLOR_TRANSPARENT,
        UNDEFINED,
        NORMALSTRING = 'normal',
        defined = function (obj) {
            return obj !== UNDEFINED && obj !== null;
        },

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

        POSITION_BOTTOM = lib.POSITION_BOTTOM,
        // POSITION_RIGHT = lib.POSITION_RIGHT,
        // POSITION_LEFT = lib.POSITION_LEFT,

        POSITION_MIDDLE = lib.POSITION_MIDDLE,
        POSITION_START = lib.POSITION_START,
        POSITION_END = lib.POSITION_END,


        HUNDREDSTRING = lib.HUNDREDSTRING,
        creditLabel = false && !lib.CREDIT_REGEX.test(win.location.hostname),

        defaultGaugePaletteOptions = extend2({}, lib.defaultGaugePaletteOptions),
        drawSparkValues = function () {
            var dataSet = this,
                chart = dataSet.chart,
                chartConf = chart.config,
                chartComponents = chart.components,
                style = chartConf.dataLabelStyle,
                paper = chartComponents.paper,
                valuePadding = chartConf.valuepadding + GUTTER_PADDING,
                dataLabelContainer = dataSet.graphics.dataLabelContainer || chart.graphics.datalabelsGroup,
                sparkValues = chartConf.sparkValues || (chartConf.sparkValues = {}),
                graphic = chart.graphics,
                sparkLabels = graphic.sparkLabels || (graphic.sparkLabels = {}),
                SmartLabel = chart.linkedItems.smartLabel,
                animObj = chart.get('config', 'animationObj'),
                transposeAnimDuration = animObj.transposeAnimDuration,
                animType = animObj.animType,
                START_BRACES = '[',
                END_BRACES = ']',
                SEPARATER = '|',
                textAttr = {
                    'class': 'fusioncharts-label',
                    'text-anchor': POSITION_END,
                    fill: style.color,
                    'font-size': style.fontSize,
                    'font-weight': style.fontWeight,
                    'font-style': style.fontStyle,
                    'font-family': style.fontFamily,
                    visibility: 'visible'
                },
                attr = {
                    x: 0,
                    y: 0
                };

            // Spark values are not visible due to the clip-rect,
            // so removing clip-rect in order to make spark labels visible
            dataLabelContainer && dataLabelContainer.attr({
                'clip-rect': null
            });

            attr.y = chartConf.canvasHeight * 0.5 + chartConf.canvasTop;
            // openValue
            attr.x = chartConf.canvasLeft - valuePadding;
            if (sparkValues.openValue && sparkValues.openValue.label || sparkLabels.openValue) {
                if (!sparkLabels.openValue) {
                    sparkLabels.openValue = paper.text({
                        text: sparkValues.openValue.label,
                        x: attr.x,
                        y: attr.y,
                        fill: sparkValues.openValue.color || textAttr.fill,
                        'text-anchor': POSITION_END,
                        'line-height': style.lineHeight,
                        'text-bound': [style.backgroundColor, style.borderColor,
                            style.borderThickness, style.borderPadding, style.borderRadius, style.borderDash],
                        visibility: 'visible'

                    }, dataLabelContainer);
                }
                else {

                    sparkLabels.openValue.attr({
                        text: sparkValues.openValue.label,
                        fill: sparkValues.openValue.color || textAttr.fill,
                        'text-anchor': POSITION_END,
                        'line-height': style.lineHeight,
                        'text-bound': [style.backgroundColor, style.borderColor,
                            style.borderThickness, style.borderPadding, style.borderRadius, style.borderDash],
                        visibility: 'visible'
                    });

                    // Transpose the sumlabels with animation
                    if (transposeAnimDuration) {
                        sparkLabels.openValue.animate(attr, transposeAnimDuration, animType);
                    }
                    // Transpose without animation
                    else {
                        sparkLabels.openValue.attr(attr);
                    }
                }

                // sparkLabels.openValue.attr({
                //     text: sparkValues.openValue.label
                // })
                // .attr(textAttr)
                // .attr({
                //     'line-height': style.lineHeight,
                //     'text-bound': [style.backgroundColor, style.borderColor,
                //         style.borderThickness, style.borderPadding, style.borderRadius, style.borderDash]
                // })
                // .css('color', sparkValues.openValue.color);

                // // Transpose the sumlabels with animation
                // if (transposeAnimDuration) {
                //     sparkLabels.openValue.animate(attr, transposeAnimDuration, animType);
                // }
                // // Transpose without animation
                // else {
                //     sparkLabels.openValue.attr(attr);
                // }

            }

            // closeValue
            textAttr['text-anchor'] = POSITION_START;
            attr.x = chartConf.canvasWidth + chartConf.canvasLeft + valuePadding;
            if (sparkValues.closeValue && sparkValues.closeValue.label || sparkLabels.closeValue) {
                if (!sparkLabels.closeValue) {
                    sparkLabels.closeValue = paper.text({
                        text: sparkValues.closeValue.label,
                        x: attr.x,
                        y: attr.y,
                        fill: sparkValues.closeValue.color || textAttr.fill,
                        'text-anchor': POSITION_START,
                        'line-height': style.lineHeight,
                        'text-bound': [style.backgroundColor, style.borderColor,
                            style.borderThickness, style.borderPadding, style.borderRadius, style.borderDash],
                        visibility: 'visible'

                    }, dataLabelContainer);
                }
                else {
                    sparkLabels.closeValue.attr({
                        text: sparkValues.closeValue.label,
                        fill: sparkValues.closeValue.color || textAttr.fill,
                        'text-anchor': POSITION_START,
                        'line-height': style.lineHeight,
                        'text-bound': [style.backgroundColor, style.borderColor,
                            style.borderThickness, style.borderPadding, style.borderRadius, style.borderDash],
                        visibility: 'visible'
                    });

                    if (transposeAnimDuration) {
                        sparkLabels.closeValue.animate(attr, transposeAnimDuration, animType);
                    }
                    // Transpose without animation
                    else {
                        sparkLabels.closeValue.attr(attr);
                    }
                }

                // sparkLabels.closeValue.attr({
                //     text: sparkValues.closeValue.label
                // })
                // .attr(textAttr)
                // .attr({
                //     'line-height': style.lineHeight,
                //     'text-bound': [style.backgroundColor, style.borderColor,
                //         style.borderThickness, style.borderPadding, style.borderRadius, style.borderDash]
                // })
                // .css('color', sparkValues.closeValue.color);

                // // Transpose the sumlabels with animation
                // if (transposeAnimDuration) {
                //     sparkLabels.closeValue.animate(attr, transposeAnimDuration, animType);
                // }
                // // Transpose without animation
                // else {
                //     sparkLabels.closeValue.attr(attr);
                // }

                // textAttr.x += sparkLabels.closeValue._getBBox().width;
                attr.x += sparkValues.closeValue.smartObj &&
                    sparkValues.closeValue.smartObj.width + GUTTER_PADDING + valuePadding || 0;
            }

            // High-low value
            if (sparkValues.highLowValue && sparkValues.highLowValue.label || sparkLabels.highValue) {
                if (sparkValues.highLowValue && sparkValues.highLowValue.label === BLANKSTRING) {
                    SEPARATER = START_BRACES = END_BRACES = BLANKSTRING;
                }

                SmartLabel.useEllipsesOnOverflow(chartConf.useEllipsesWhenOverflow);
                SmartLabel.setStyle(style);

                if (!sparkLabels.startBraces) {
                    sparkLabels.startBraces = paper.text({
                        text: START_BRACES,
                        x: attr.x,
                        y: attr.y,
                        'text-anchor': POSITION_START,
                        visibility: 'visible'
                    }, dataLabelContainer);
                    // .attr(attr)
                    // .attr(textAttr);
                }
                else {

                    // Transpose the sumlabels with animation
                    if (transposeAnimDuration) {
                        sparkLabels.startBraces.animate(attr, transposeAnimDuration, animType);
                    }
                    // Transpose without animation
                    else {
                        sparkLabels.startBraces.attr(attr);
                    }
                }

                attr.x += SmartLabel.getSmartText(START_BRACES).width;

                if (!sparkLabels.highValue) {
                    sparkLabels.highValue = paper.text({
                        text: sparkValues.highValue.label,
                        x: attr.x,
                        y: attr.y,
                        'text-anchor': POSITION_START,
                        fill: sparkValues.highValue.color || textAttr.fill,
                        visibility: 'visible'
                    }, dataLabelContainer);
                    // .attr(attr)
                    // .attr(textAttr);
                }
                else {
                    sparkLabels.highValue.attr({
                        text: sparkValues.highValue.label,
                        'text-anchor': POSITION_START,
                        fill: sparkValues.highValue.color || textAttr.fill,
                        visibility: 'visible'
                    });

                    if (transposeAnimDuration) {
                        sparkLabels.highValue.animate(attr, transposeAnimDuration, animType);
                    }
                    // Transpose without animation
                    else {
                        sparkLabels.highValue.attr(attr);
                    }
                }

                attr.x += SmartLabel.getSmartText(sparkValues.highValue.label).width;

                if (!sparkLabels.separater) {
                    sparkLabels.separater = paper.text({
                        text: SEPARATER,
                        x: attr.x,
                        y: attr.y,
                        'text-anchor': POSITION_START,
                        visibility: 'visible'
                    }, dataLabelContainer);
                    // .attr(attr)
                    // .attr(textAttr);
                }
                else {
                    if (transposeAnimDuration) {
                        sparkLabels.separater.animate(attr, transposeAnimDuration, animType);
                    }
                    // Transpose without animation
                    else {
                        sparkLabels.separater.attr(attr);
                    }
                }

                attr.x += SmartLabel.getSmartText(SEPARATER).width;

                if (!sparkLabels.lowValue) {
                    sparkLabels.lowValue = paper.text({
                        text: sparkValues.lowValue.label,
                        x: attr.x,
                        y: attr.y,
                        'text-anchor': POSITION_START,
                        fill: sparkValues.lowValue.color || textAttr.fill,
                        visibility: 'visible'
                    }, dataLabelContainer);
                    // .attr(attr)
                    // .attr(textAttr);
                }
                else {
                    sparkLabels.lowValue.attr({
                        text: sparkValues.lowValue.label,
                        'text-anchor': POSITION_START,
                        fill: sparkValues.lowValue.color || textAttr.fill,
                        visibility: 'visible'
                    });

                    if (transposeAnimDuration) {
                        sparkLabels.lowValue.animate(attr, transposeAnimDuration, animType);
                    }
                    // Transpose without animation
                    else {
                        sparkLabels.lowValue.attr(attr);
                    }
                }

                attr.x += SmartLabel.getSmartText(sparkValues.lowValue.label).width;

                if (!sparkLabels.endBraces) {
                    sparkLabels.endBraces = paper.text({
                        text: END_BRACES,
                        x: attr.x,
                        y: attr.y,
                        'text-anchor': POSITION_START,
                        visibility: 'visible'
                    }, dataLabelContainer);
                    // .attr(attr)
                    // .attr(textAttr);
                }
                else {
                    if (transposeAnimDuration) {
                        sparkLabels.endBraces.animate(attr, transposeAnimDuration, animType);
                    }
                    // Transpose without animation
                    else {
                        sparkLabels.endBraces.attr(attr);
                    }
                }

                // SmartLabel.useEllipsesOnOverflow(chartConf.useEllipsesWhenOverflow);
                // SmartLabel.setStyle(style);
                // startBraces
                // sparkLabels.startBraces
                // .attr({
                //     text: START_BRACES
                // });
                // // Transpose the sumlabels with animation
                // if (transposeAnimDuration) {
                //     sparkLabels.startBraces.animate(attr, transposeAnimDuration, animType);
                // }
                // // Transpose without animation
                // else {
                //     sparkLabels.startBraces.attr(attr);
                // }
                // attr.x += SmartLabel.getSmartText(START_BRACES).width;

                // highValue
                // sparkLabels.highValue
                // .attr({
                //     text: sparkValues.highValue.label
                // })
                // .css('color', sparkValues.highValue.color);
                // Transpose the sumlabels with animation
                // if (transposeAnimDuration) {
                //     sparkLabels.highValue.animate(attr, transposeAnimDuration, animType);
                // }
                // // Transpose without animation
                // else {
                //     sparkLabels.highValue.attr(attr);
                // }
                // attr.x += SmartLabel.getSmartText(sparkValues.highValue.label).width;

                // separater
                // sparkLabels.separater
                // .attr({
                //     text: SEPARATER
                // });
                // Transpose the sumlabels with animation
                // if (transposeAnimDuration) {
                //     sparkLabels.separater.animate(attr, transposeAnimDuration, animType);
                // }
                // // Transpose without animation
                // else {
                //     sparkLabels.separater.attr(attr);
                // }
                // attr.x += SmartLabel.getSmartText(SEPARATER).width;

                // lowValue
                // sparkLabels.lowValue
                // .attr({
                //     text: sparkValues.lowValue.label
                // })
                // .css('color', sparkValues.lowValue.color);
                // Transpose the sumlabels with animation
                // if (transposeAnimDuration) {
                //     sparkLabels.lowValue.animate(attr, transposeAnimDuration, animType);
                // }
                // // Transpose without animation
                // else {
                //     sparkLabels.lowValue.attr(attr);
                // }
                // attr.x += SmartLabel.getSmartText(sparkValues.lowValue.label).width;

                // endBraces
                // sparkLabels.endBraces
                // .attr({
                //     text: END_BRACES
                // });
                // Transpose the sumlabels with animation
                // if (transposeAnimDuration) {
                //     sparkLabels.endBraces.animate(attr, transposeAnimDuration, animType);
                // }
                // // Transpose without animation
                // else {
                //     sparkLabels.endBraces.attr(attr);
                // }
            }

            dataSet.labelDrawn = true;
        },
        _drawPeriod = function () {
            var dataSet = this,
                chart = dataSet.chart,
                chartAttr = chart.jsonData.chart,
                components = chart.components,
                colorM = components.colorManager,
                dataArr = dataSet.components.data,
                axis = components.xAxis[0],
                periodLength = pluckNumber(chartAttr.periodlength, 0),
                axisLimit;

            axisLimit = axis.getLimit();
            axis.config.band.isDraw = true;
            periodLength && axis.setAxisConfig({
                alternateGridColor: pluck(chartAttr.periodcolor, colorM.getColor('periodColor')),
                alternateGridAlpha: pluck(chartAttr.periodalpha, 100),
                showAlternateGridColor : true,
                categoryNumDivLines: dataArr && ((axisLimit.max - axisLimit.min) / periodLength - 1),
                categoryDivLinesFromZero: 0
            });
            axis.draw();
        };

    chartAPI('sparkchartbase', {
        standaloneInit: true,
        creditLabel: creditLabel,
        showBorder: 0,
        chartTopMargin: 3,
        chartRightMargin: 3,
        chartBottomMargin: 3,
        chartLeftMargin: 3,
        canvasBorderThickness: 1,
        subTitleFontSizeExtender: 0,
        subTitleFontWeight: 0,
        defaultPaletteOptions: extend(extend2({}, defaultGaugePaletteOptions), {
            //Store colors now
            paletteColors: [['555555', 'A6A6A6', 'CCCCCC', 'E1E1E1', 'F0F0F0'],
            ['A7AA95', 'C4C6B7', 'DEDFD7', 'F2F2EE'],
            ['04C2E3', '66E7FD', '9CEFFE', 'CEF8FF'],
            ['FA9101', 'FEB654', 'FED7A0', 'FFEDD5'],
            ['FF2B60', 'FF6C92', 'FFB9CB', 'FFE8EE']],
            //Store other colors
            // ------------- For 2D Chart ---------------//
            //We're storing 5 combinations, as we've 5 defined palettes.
            bgColor: ['FFFFFF', 'CFD4BE,F3F5DD', 'C5DADD,EDFBFE', 'A86402,FDC16D', 'FF7CA0,FFD1DD'],
            bgAngle: [270, 270, 270, 270, 270],
            bgRatio: ['0,100', '0,100', '0,100', '0,100', '0,100'],
            bgAlpha: ['100', '60,50', '40,20', '20,10', '30,30'],

            canvasBgColor: ['FFFFFF', 'FFFFFF', 'FFFFFF', 'FFFFFF', 'FFFFFF'],
            canvasBgAngle: [0, 0, 0, 0, 0],
            canvasBgAlpha: ['100', '100', '100', '100', '100'],
            canvasBgRatio: [BLANKSTRING, BLANKSTRING, BLANKSTRING, BLANKSTRING, BLANKSTRING],
            canvasBorderColor: ['BCBCBC', 'BEC5A7', '93ADBF', 'C97901', 'FF97B1'],

            toolTipBgColor: ['FFFFFF', 'FFFFFF', 'FFFFFF', 'FFFFFF', 'FFFFFF'],
            toolTipBorderColor: ['545454', '545454', '415D6F', '845001', '68001B'],
            baseFontColor: ['333333', '60634E', '025B6A', 'A15E01', '68001B'],
            trendColor: ['666666', '60634E', '415D6F', '845001', '68001B'],
            plotFillColor: ['666666', 'A5AE84', '93ADBF', 'C97901', 'FF97B1'],
            borderColor: ['767575', '545454', '415D6F', '845001', '68001B'],
            borderAlpha: [50, 50, 50, 50, 50],
            periodColor: ['EEEEEE', 'ECEEE6', 'E6ECF0', 'FFF4E6', 'FFF2F5'],

            //Colors for win loss chart
            winColor: ['666666', '60634E', '025B6A', 'A15E01', 'FF97B1'],
            lossColor: ['CC0000', 'CC0000', 'CC0000', 'CC0000', 'CC0000'],
            drawColor: ['666666', 'A5AE84', '93ADBF', 'C97901', 'FF97B1'],
            scorelessColor: ['FF0000', 'FF0000', 'FF0000', 'FF0000', 'FF0000']
        }),
        _setAxisLimits : function () {
            var iapi = this,
                yAxis = iapi.components.yAxis;

            yAxis[0] && yAxis[0].setAxisConfig({
                numDivLines: 0
            });

            chartAPI.mscartesian._setAxisLimits.call(iapi);
        },
        /*
         * Returns the postion for the caption placement.
         * @return extra spaces.
        */
        _fetchCaptionPos: function () {
            var extraSpace,
                iapi = this,
                components = iapi.components,
                caption = components.caption,
                captionConfig = caption.config;

            // check if even after placing the caption
            // space available on right.
            //left aligned.
            /** @todo need to optimize this logic */
            if (captionConfig.isOnLeft) {
                extraSpace = -1;
            }
            // right aligned
            else {
                extraSpace = -1;
            }
            return extraSpace;
        },
        _spaceManager: function () {
            // todo marge _allocateSpace and _spacemanager
            var availableWidth,
                availableHeight,
                iapi = this,
                config = iapi.config,
                components = iapi.components,
                // xAxis = components.xAxis && components.xAxis[0],
                // yAxis = components.yAxis && components.yAxis[0],
                // legend = components.legend,
                // legendPosition = legend.config.legendPos,
                // xDepth = config.xDepth,
                // yDepth = config.yDepth,
                // allottedSpace,
                canvasBaseDepth = config.canvasBaseDepth,
                // canvasBasePadding = config.canvasBasePadding,
                canvasBorderWidth = components.canvas.config.canvasBorderWidth,
                // showRTValue = config.realTimeConfig && config.realTimeConfig.showRTValue,
                chartBorderWidth = config.borderWidth,
                canvasMarginTop = config.canvasMarginTop,
                canvasMarginBottom = config.canvasMarginBottom,
                canvasMarginLeft = config.canvasMarginLeft,
                canvasMarginRight = config.canvasMarginRight,
                minCanvasHeight = config.minCanvasHeight,
                minCanvasWidth = config.minCanvasWidth,
                height = config.height,
                width = config.width,
                diff,
                heightAdjust = false,
                widthAdjust = false,
                top,
                bottom,
                left,
                right,
                currentCanvasHeight,
                currentCanvasWidth,
                origCanvasTopMargin = config.origCanvasTopMargin,
                origCanvasBottomMargin = config.origCanvasBottomMargin,
                origCanvasLeftMargin = config.origCanvasLeftMargin,
                origCanvasRightMargin = config.origCanvasRightMargin,
                sum;

            iapi._allocateSpace ( {
                top : chartBorderWidth,
                bottom : chartBorderWidth,
                left : chartBorderWidth,
                right : chartBorderWidth
            });


            // if (legendPosition === 'right') {
            //     allottedSpace = config.availableWidth * 0.4;
            // }
            // else {
            //     allottedSpace = config.availableHeight * 0.4;
            // }
            // availableHeight = config.availableHeight * 0.225;
            // iapi._manageActionBarSpace && iapi._allocateSpace(iapi._manageActionBarSpace(availableHeight));

            //****** Manage space
            // availableWidth = config.availableWidth * 0.7;
            // yAxis && iapi._allocateSpace (yAxis.placeAxis (availableWidth));

            //No space is allocated for legend drawing in single series charts
            // iapi._manageLegendSpace(allottedSpace);

            // availableHeight = (legendPosition === POSITION_BOTTOM) ? config.availableHeight * 0.225 :
            //     config.availableWidth *0.225;

            // a space manager that manages the space for the tools as well as the captions.
            // iapi._manageChartMenuBar(availableHeight);

            // availableHeight = config.availableHeight * 0.3;
            // config.realtimeEnabled && showRTValue && iapi._allocateSpace
            //     (iapi._realTimeValuePositioning (availableHeight));

            // availableHeight = config.availableHeight * 0.6;
            // xAxis && iapi._allocateSpace (xAxis.placeAxis (availableHeight));

            // alocate the space for datasets
            availableHeight = config.availableHeight * 0.325;
            iapi._getDSspace && iapi._allocateSpace (iapi._getDSspace (availableHeight));

            // alocate the space for scroll.
            // availableHeight = config.availableHeight * 0.3;
            // iapi._manageScrollerPosition && iapi._manageScrollerPosition(availableHeight);

            //space management for 3d canvas
            // if (yDepth) {
            //     iapi._allocateSpace ( {
            //         bottom : yDepth
            //     });
            //     config.shift = xDepth + canvasBasePadding + canvasBaseDepth;
            // }

            iapi._allocateSpace(iapi._manageActionBarSpace &&
                iapi._manageActionBarSpace(config.availableHeight * 0.225) || {});
            config.availableWidth = config.width;
            availableWidth = config.availableWidth * 0.75;
            availableWidth = (availableWidth - config.origMarginLeft - config.origMarginRight -
                (config.borderWidth * 2));
            availableWidth = mathMax(config.availableWidth * 0.1, availableWidth);
            // a space manager that manages the space for the tools as well as the captions.
            iapi._manageChartMenuBar(availableWidth);
            // iapi._allocateSpace(iapi._manageCaptionSpacing(availableWidth));

            availableWidth = (config.availableWidth - config.borderWidth * 2) * 0.75;
            // Space management for SparkWinLoss and SparkLine charts
            iapi._placeOpenCloseValues && iapi._allocateSpace(iapi._placeOpenCloseValues(availableWidth));

            iapi._allocateSpace ({
                top : canvasBorderWidth,
                bottom : canvasBorderWidth,
                left : canvasBorderWidth,
                right : canvasBorderWidth
            });

            iapi._allocateSpace({
                bottom: canvasBaseDepth
            });

            // Check for minimum canvas width and height
            if (minCanvasHeight > height - canvasMarginTop - canvasMarginBottom) {
                heightAdjust = true;
                diff = config.canvasHeight - minCanvasHeight;
                sum = canvasMarginTop + canvasMarginBottom;
                canvasMarginTop = config.canvasMarginTop = diff * canvasMarginTop / sum;
                canvasMarginBottom = config.canvasMarginBottom = diff * canvasMarginBottom / sum;
            }
            if (minCanvasWidth > width - canvasMarginLeft - canvasMarginRight) {
                widthAdjust = true;
                diff = config.canvasWidth - minCanvasWidth;
                sum = canvasMarginLeft + canvasMarginRight;
                canvasMarginLeft = config.canvasMarginLeft = diff * canvasMarginLeft / sum;
                canvasMarginRight = config.canvasMarginRight = diff * canvasMarginRight / sum;
            }

            // Allocate space for canvas margin only if the margin is less than the margin entered by the user.
            top = canvasMarginTop > config.canvasTop ? (canvasMarginTop - config.canvasTop) : 0;
            bottom = canvasMarginBottom > (height - config.canvasBottom) ? (canvasMarginBottom + config.canvasBottom -
                height) : 0;
            left = canvasMarginLeft > config.canvasLeft ? (canvasMarginLeft - config.canvasLeft) : 0;
            right = canvasMarginRight > (width - config.canvasRight) ? (canvasMarginRight + config.canvasRight - width)
                : 0;

            iapi._allocateSpace ( {
                top : top,
                bottom : bottom,
                left : left,
                right : right
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

            // Forcing canvas width to its minimum
            if (widthAdjust) {
                sum = origCanvasLeftMargin + origCanvasRightMargin;
                currentCanvasWidth = config.canvasWidth;
                if (currentCanvasWidth > minCanvasWidth) {
                    diff = currentCanvasWidth - minCanvasWidth;
                    left = diff * origCanvasLeftMargin / sum;
                    right = diff * origCanvasRightMargin / sum;
                }
                iapi._allocateSpace ( {
                    left : left,
                    right : right
                });
            }

            // Manage canvasMargins
            // If there is user given canvasMargins apply those to the chart
            if (config.origCanvasLeftMargin !== undefined) {
                config.canvasWidth = mathMax((config.canvasWidth + config.canvasLeft -
                    config.origCanvasLeftMargin), config.availableWidth * 0.2);
                // config.marginLeft = config.marginLeft - (config.canvasLeft - config.origCanvasLeftMargin);
                config.canvasLeft = config.origCanvasLeftMargin;
            }
        },
        _manageCaptionSpacing: function (availableWidth) {
            var iapi = this,
                chartConfig = iapi.config,
                components = iapi.components,
                //chartGraphics = iapi.graphics,
                caption = components.caption,
                subCaption = components.subCaption,
                captionConfig = caption.config,
                subCaptionConfig = subCaption.config,
                captionComponents = caption.components,
                subCaptionComponents = subCaption.components,
                chartAttrs = iapi.jsonData.chart,
                SmartLabel = iapi.linkedItems.smartLabel,
                titleText = parseUnsafeString(chartAttrs.caption),
                subTitleText = parseUnsafeString(chartAttrs.subcaption),
                captionPadding = captionConfig.captionPadding = pluckNumber(chartAttrs.captionpadding, 2),
                chartMenuBar = components.chartMenuBar,
                chartMenuLogicalSpace = chartMenuBar && chartMenuBar.getLogicalSpace(),
                height = chartConfig.height - ((chartMenuLogicalSpace && chartMenuLogicalSpace.height) || 0),
                // width = chartConfig.width,
                captionLineHeight = 0,
                subCaptionLineHeight = 0,
                //topGutterWidth = 5,
                canvasBorderThickness = mathMax(components.canvas.config.canvasBorderThickness, 0),
                captionHeight = 0,
                captionWidth = 0,
                // subCaptionHeight = 0,
                // subCaptionWidth = 0,
                allowedHeight = height * 0.7,
                allowedWidth = availableWidth,
                dimensions = {},
                maxCaptionWidth,
                captionObj,
                subCaptionObj,
                capStyle,
                subCapStyle;

            // text below 3px is not properly visible
            if (allowedHeight > 3) {

                if (captionPadding < canvasBorderThickness) {
                    captionPadding = canvasBorderThickness + 2;
                }
                captionConfig.captionPadding = subCaptionConfig.captionPadding = captionPadding;

                if (titleText !== BLANKSTRING) { //calculatethe single line's height
                    capStyle = captionConfig.style;
                    captionLineHeight = captionConfig.captionLineHeight =
                        mathCeil(parseFloat(pluck(capStyle.fontHeight, capStyle.lineHeight), 10), 12);
                    // captionFontSize = subCaptionConfig.captionLineHeight =
                    //     pluckNumber(parseInt(capStyle.fontSize, 10), 10);
                }
                if (subTitleText !== BLANKSTRING) {
                    subCapStyle = subCaptionConfig.style;
                    subCaptionLineHeight = mathCeil(parseInt(pluck(subCapStyle.lineHeight,
                        subCapStyle.fontHeight), 10), 12);
                    // subCaptionFontSize = pluckNumber(parseInt(subCapStyle.fontSize, 10), 10);
                }

                SmartLabel.useEllipsesOnOverflow(chartConfig.useEllipsesWhenOverflow);
                if (captionLineHeight > 0 || subCaptionLineHeight > 0) {
                    SmartLabel.setStyle(capStyle);
                    captionObj = SmartLabel.getSmartText(titleText, allowedWidth, height);
                    // Forcefully increase width to give a gutter in caption and sub-caption
                    if (captionObj.width > 0) {
                        captionObj.width += GUTTER_PADDING;
                        captionHeight = captionObj.height;
                    }
                    SmartLabel.setStyle(subCapStyle);
                    subCaptionObj = SmartLabel.getSmartText(subTitleText, allowedWidth, height - captionHeight);
                    // Force fully increase width to give a gutter in caption and subCaption
                    if (subCaptionObj.width > 0) {
                        subCaptionObj.width += GUTTER_PADDING;
                    }
                    captionConfig.captionSubCaptionGap = captionObj.height + 0 +
                        (subCaptionLineHeight * 0.2);


                    maxCaptionWidth = Math.max(captionObj.width, subCaptionObj.width);
                    // Replace the caption and subCaption text with the new wrapped text
                    captionComponents.text = captionObj.text;
                    captionConfig.height = captionHeight = captionObj.height;
                    captionConfig.width = captionWidth = captionObj.width;
                    captionConfig.tooltext && (captionComponents.originalText = captionObj.tooltext);

                    subCaptionComponents.text = subCaptionObj.text;
                    subCaptionConfig.height = captionHeight = subCaptionObj.height;
                    subCaptionConfig.width = captionWidth = subCaptionObj.width;
                    subCaptionConfig.tooltext && (captionComponents.originalText = subCaptionObj.tooltext);

                    maxCaptionWidth = Math.max(captionObj.width, subCaptionObj.width);
                    captionConfig.captionPadding = captionPadding = mathMin(availableWidth - maxCaptionWidth,
                        captionPadding);
                    //Add caption padding, if either caption or sub-caption is to be shown
                    if (maxCaptionWidth > 0) {
                        maxCaptionWidth = mathMin(availableWidth, maxCaptionWidth + captionPadding);
                    }
                    captionConfig.maxCaptionWidth = subCaptionConfig.maxCaptionWidth = maxCaptionWidth;

                    // totalHeight = totalHeight || canvasBorderThickness;
                    if (captionConfig.isOnLeft) {
                        dimensions.left = maxCaptionWidth;
                    }
                    else {
                        dimensions.right = maxCaptionWidth;
                    }
                }
            }

            return dimensions;
        },
        _manageCaptionPosition: function () {
            var iapi = this,
                chartConfig = iapi.config,
                components = iapi.components,
                caption = components.caption,
                subCaption = components.subCaption,
                captionConfig = caption.config,
                subCaptionConfig = subCaption.config,
                captionPosition = captionConfig.captionPosition,
                maxWidth = mathMax(captionConfig.width, subCaptionConfig.width),
                borderWidth = chartConfig.borderWidth || 0,
                height = chartConfig.height,
                sparkValues = chartConfig.sparkValues || {},
                openValueWidth = sparkValues.openValueWidth || 0,
                captionPadding = captionConfig.captionPadding,
                captionSubCaptionGap = captionConfig.captionSubCaptionGap;

            switch (captionPosition) {
                case POSITION_MIDDLE:
                    captionConfig.y = ((height - (captionConfig.height + subCaptionConfig.height)) / 2) +
                        ((captionConfig._offsetHeight || 0) * 0.5);
                    break;
                case POSITION_BOTTOM:
                    captionConfig.y = (height - (captionConfig.height + subCaptionConfig.height)) -
                        chartConfig.marginBottom - borderWidth;
                    break;
                default: // We put it on top by default
                    captionConfig.y = chartConfig.marginTop + borderWidth + (captionConfig._offsetHeight || 0);
                    break;
            }

            subCaptionConfig.y = captionConfig.y  + captionSubCaptionGap;

            if (captionConfig.isOnLeft) {
                captionConfig.align = subCaptionConfig.align = POSITION_END;
                captionConfig.x = subCaptionConfig.x = chartConfig.canvasLeft -
                    (borderWidth + openValueWidth + GUTTER_PADDING + captionPadding) +
                    chartConfig.borderWidth;
            } else {
                captionConfig.align = subCaptionConfig.align = POSITION_START;
                captionConfig.x = subCaptionConfig.x = chartConfig.width -
                    chartConfig.marginRight - maxWidth - borderWidth;
            }
        }
    }, chartAPI.sscartesian);


    chartAPI('sparkcolumn', {
        standaloneInit: true,
        creditLabel: creditLabel,
        friendlyName: 'sparkcolumn Chart',
        defaultDatasetType: 'sparkcolumn',
        // parse canvas cosmetics.
        // parse canvas cosmetics.
        _parseCanvasCosmetics: function () {
            var canvasBorderThickness,
                canBGAlpha,
                showCanvasBorder,
                shadow,
                iapi = this,
                config = iapi.config,
                components = iapi.components,
                canvasConfig = components.canvas.config,
                chartAttrs = iapi.jsonData.chart,
                colorM = components.colorManager,
                is3D = iapi.is3D,
                oriCanvasBorderThickness,
                palleteString = is3D ? lib.chartPaletteStr.chart3D : lib.chartPaletteStr.chart2D,
                isRoundEdges = canvasConfig.isRoundEdges = pluckNumber (chartAttrs.useroundedges, 0),
                showAxisLine = pluckNumber(chartAttrs.showxaxisline, chartAttrs.showyaxisline, 0),
                hideAxisLine = showAxisLine ? 0 : 1;

            canvasConfig.canvasBorderRadius = pluckNumber (chartAttrs.plotborderradius, isRoundEdges ? 2 : 0);

            showCanvasBorder = canvasConfig.showCanvasBorder =
                Boolean (pluckNumber(chartAttrs.showcanvasborder, hideAxisLine, canvasBorderThickness,
                isRoundEdges ? 0 : 1));

            // Storing original canvasBorderThickness for future reference
            oriCanvasBorderThickness = canvasConfig.oriCanvasBorderThickness = mathMax(pluckNumber(
                chartAttrs.canvasborderthickness, isRoundEdges ? 0 : pluckNumber(iapi.canvasborderthickness, 1), 0));

            canvasBorderThickness = canvasConfig.canvasBorderWidth = iapi.is3D ? 0 :
                showCanvasBorder ? oriCanvasBorderThickness : 0;

            canvasConfig.canvasBorderColor = convertColor (pluck (chartAttrs.canvasbordercolor,
                colorM.getColor ('canvasBorderColor')),
                pluck (chartAttrs.canvasborderalpha, colorM.getColor ('canvasBorderAlpha')));
            canBGAlpha = canvasConfig.canBGAlpha = pluck (chartAttrs.canvasbgalpha,
                colorM.getColor ('canvasBgAlpha'));

            canvasConfig.canBGColor = {
                FCcolor : {
                    color : pluck (chartAttrs.canvasbgcolor, colorM.getColor (palleteString.canvasBgColor)),
                    alpha : pluck (chartAttrs.canvasbgalpha, 100),
                    angle : pluck (chartAttrs.canvasbgangle, 0),
                    ratio : pluck (chartAttrs.canvasbgratio)
                }
            };

            shadow = canvasConfig.shadow = pluckNumber (chartAttrs.showshadow, isRoundEdges, 0) && isRoundEdges ? {
                enabled: true,
                opacity: canBGAlpha / 100
            } : 0;
            canvasConfig.shadowOnCanvasFill = shadow && shadow.enabled;

            // borderThickness = pluckNumber(chartAttrs.showborder, 1) ? pluckNumber(chartAttrs.borderthickness, 1) : 0;
            // chart margins
            config.origMarginTop = pluckNumber(chartAttrs.charttopmargin, 3);
            config.origMarginLeft = pluckNumber(chartAttrs.chartleftmargin, 3);
            config.origMarginBottom = pluckNumber(chartAttrs.chartbottommargin, 3);
            config.origMarginRight = pluckNumber(chartAttrs.chartrightmargin, 3);

            config.origCanvasLeftMargin = pluckNumber(chartAttrs.canvasleftmargin);
            config.origCanvasRightMargin = pluckNumber(chartAttrs.canvasrightmargin);
            config.origCanvasTopMargin = pluckNumber(chartAttrs.canvastopmargin);
            config.origCanvasBottomMargin = pluckNumber(chartAttrs.canvasbottommargin);

            // canvas padding
            canvasConfig.canvasPadding = pluckNumber(chartAttrs.canvaspadding, 0);

            canvasConfig.origCanvasTopPad = pluckNumber(chartAttrs.canvastoppadding, 0);
            canvasConfig.origCanvasBottomPad = pluckNumber(chartAttrs.canvasbottompadding, 0);
            canvasConfig.origCanvasLeftPad = pluckNumber(chartAttrs.canvasleftpadding, 0);
            canvasConfig.origCanvasRightPad = pluckNumber(chartAttrs.canvasrightpadding, 0);
        },
        canvasBorderThickness: 1,
        singleseries: false
    }, chartAPI.sparkchartbase, {
        showplotborder: 0,
        enablemousetracking: true
    });

    FusionCharts.register('component', ['dataset', 'sparkcolumn', {
        _setConfigure: function (newDataset) {
            var dataSet = this,
                chart = dataSet.chart,
                chartAttr = chart.jsonData.chart,
                conf = dataSet.config,
                chartConfig = chart.config,
                JSONData = dataSet.JSONData,
                setDataArr = newDataset || JSONData.data,
                setDataLen = setDataArr && setDataArr.length,
                categories = chart.config.categories,
                catLen = categories && categories.length,
                len = (newDataset && newDataset.data.length) || mathMin(catLen, setDataLen),
                showHoverEffect = chartConfig.plothovereffect,
                components = chart.components,
                colorM = components.colorManager,
                isRoundEdges = chartConfig.useroundedges,
                plotFillColor,
                color,
                borderColor,
                hoverColor,
                hoverAlpha,
                hoverGradientColor,
                hoverBorderColor,
                hoverBorderAlpha,
                hoverBorderThickness,
                borderThickness,
                config,
                plotFillAlpha,
                plotBorderAlpha,
                plotBorderColor,
                highColor,
                lowColor,
                highBorderColor,
                lowBorderColor,
                setData,
                dataObj,
                colorArr,
                hoverColorArr,
                i,
                cLen,
                cInd,
                dataStore,
                maxValue,
                minValue;

            conf.plotgradientcolor = BLANKSTRING;
            conf.showvalues = pluckNumber(JSONData.showvalues, chartAttr.showvalues, 0);
            conf.showShadow = pluckNumber(chartAttr.showshadow, 0);

            this.__base__._setConfigure.call(this);

            dataStore = dataSet.components.data;
            maxValue = conf.maxValue;
            minValue = conf.minValue;

            plotFillColor = pluck(chartAttr.plotfillcolor, colorM.getColor('plotFillColor'));
            plotFillAlpha = pluck(chartAttr.plotfillalpha, HUNDREDSTRING);
            plotBorderAlpha = pluck(chartAttr.plotborderalpha, HUNDREDSTRING);
            plotBorderColor = pluck(chartAttr.plotbordercolor, plotFillColor);

            //Fill Color for high column and low column
            highColor = pluck(chartAttr.highcolor, '000000');
            lowColor = pluck(chartAttr.lowcolor, '000000');
            highBorderColor = pluck(chartAttr.highbordercolor, chartAttr.plotbordercolor, highColor);
            lowBorderColor = pluck(chartAttr.lowbordercolor, chartAttr.plotbordercolor, lowColor);
            // conf.plotBorderThickness = borderThickness = pluckNumber(chartAttr.showplotborder, 0) ?
            //         pluckNumber(chartAttr.plotborderthickness, 1) : 0;

            // Loop through datastore and change the cosmetics
            for (i = 0; i < len; i++) {
                // Original data provided by user
                setData = setDataArr[i];
                // Parsed data previously
                dataObj = dataStore[i];
                config = dataObj.config;
                colorArr = null;

                color = plotFillColor;
                borderColor = plotBorderColor;

                // Max value
                if (config.setValue == maxValue) {
                    color = highColor;
                    borderColor = highBorderColor;
                }
                // Min value
                if (dataObj.config.setValue == minValue) {
                    color = lowColor;
                    borderColor = lowBorderColor;
                }

                // Setting the color Array to be applied to the bar/column.
                config.colorArr = colorArr = getColumnColor(
                    color + COMMASTRING + conf.plotgradientcolor,
                    plotFillAlpha,
                    '0',
                    '90',
                    isRoundEdges,
                    borderColor,
                    plotBorderAlpha,
                    0,
                    0);

                // Parsing the hover effects only if showhovereffect is not 0.
                if (showHoverEffect !== 0 && colorArr) {

                    hoverColor = hoverAlpha = UNDEFINED;
                    // Max value
                    if (config.setValue == maxValue) {
                        hoverColor = chartAttr.highhovercolor;
                        hoverAlpha = chartAttr.highhoveralpha;
                    }
                    // Min value
                    if (dataObj.config.setValue == minValue) {
                        hoverColor = chartAttr.lowhovercolor;
                        hoverAlpha = chartAttr.lowhoveralpha;
                    }

                    hoverColor = pluck(setData.hovercolor, JSONData.hovercolor, hoverColor,
                        chartAttr.plotfillhovercolor, chartAttr.columnhovercolor,
                        colorArr[0].FCcolor.color);

                    hoverColor = hoverColor.split(/\s{0,},\s{0,}/);

                    cLen = hoverColor.length;
                    for (cInd = 0; cInd < cLen; cInd++) {
                        hoverColor[cInd] = getLightColor(hoverColor[cInd], 70);
                    }

                    hoverColor = hoverColor.join(',');

                    hoverAlpha = pluck(setData.hoveralpha, JSONData.hoveralpha, hoverAlpha,
                        chartAttr.plotfillhoveralpha, chartAttr.columnhoveralpha, plotFillAlpha);

                    hoverGradientColor = pluck(setData.hovergradientcolor,
                        JSONData.hovergradientcolor, chartAttr.plothovergradientcolor, conf.plotgradientcolor);
                    !hoverGradientColor && (hoverGradientColor = BLANKSTRING);

                    hoverBorderColor = pluck(setData.borderhovercolor,
                        JSONData.borderhovercolor, chartAttr.plotborderhovercolor, conf.plotbordercolor);
                    hoverBorderAlpha = pluck(setData.borderhoveralpha,
                        JSONData.borderhoveralpha, chartAttr.plotborderhoveralpha,
                        chartAttr.plotfillhoveralpha, plotBorderAlpha, plotFillAlpha);
                    hoverBorderThickness = pluckNumber(setData.borderhoverthickness,
                        JSONData.borderhoverthickness, chartAttr.plotborderhoverthickness, borderThickness);

                    /* If no hover effects are explicitly defined and
                     * showHoverEffect is not 0 then hoverColor is set.
                     */
                    if (showHoverEffect == 1 && hoverColor === colorArr[0].FCcolor.color) {
                        hoverColor = getLightColor(hoverColor, 70);
                    }
                    // setting the hover color array which is always applied except when showHoverEffect is not 0.
                    hoverColorArr = getColumnColor(
                        hoverColor + COMMASTRING + hoverGradientColor,
                        hoverAlpha,
                        '0',
                        '90',
                        isRoundEdges,
                        hoverBorderColor,
                        hoverBorderAlpha.toString(),
                        0,
                        0);

                    config.setRolloutAttr = {
                        fill: toRaphaelColor(colorArr[0]),
                        stroke: borderThickness && toRaphaelColor(colorArr[1]),
                        'stroke-width': borderThickness
                    };
                    config.setRolloverAttr = {
                        fill: toRaphaelColor(hoverColorArr[0]),
                        stroke: borderThickness && toRaphaelColor(hoverColorArr[1]),
                        'stroke-width': borderThickness
                    };
                }
            }
        },
        draw: function () {
            var dataSet = this;
            dataSet.__base__.draw.call(dataSet);

            _drawPeriod.call(dataSet);
        }
    }, 'Column']);

    FusionCharts.register('component', ['datasetGroup', 'SparkColumn', {
    }, 'column']);


    chartAPI('sparkwinloss', {
        standaloneInit: true,
        friendlyName: 'sparkwinloss Chart',
        creditLabel: creditLabel,
        defaultDatasetType: 'sparkwinloss',
        canvasBorderThickness: 0,
        applicableDSList: {
            'sparkwinloss': true
        },
        _setAxisLimits : function () {
            var iapi = this,
                yAxis = iapi.components.yAxis;

            chartAPI.mscartesian._setAxisLimits.call(iapi);

            yAxis[0] && yAxis[0].setAxisRange({
                min: -1,
                max: 1
            });
        },
        _placeOpenCloseValues: function (availableWidth) {
            var iapi = this,
                config = iapi.config,
                smartLabel = iapi.linkedItems.smartLabel,
                style = config.dataLabelStyle,
                borderThickness = pluckNumber(style.borderThickness, 0),
                valuePadding = iapi.config.valuepadding + GUTTER_PADDING + borderThickness,
                openValueWidth = 0,
                closeValueWidth = 0,
                // height = chartConfig.height,
                // width = availableWidth,
                sparkValues = config.sparkValues || {},
                left,
                right;
            smartLabel.useEllipsesOnOverflow(config.useEllipsesWhenOverflow);
            smartLabel.setStyle(style);

            if (sparkValues.openValue && sparkValues.openValue.label) {
                sparkValues.openValue.smartObj = smartLabel.getSmartText(sparkValues.openValue.label);
                openValueWidth = sparkValues.openValue.smartObj.width + valuePadding;
            }
            if (sparkValues.closeValue && sparkValues.closeValue.label) {
                sparkValues.closeValue.smartObj = smartLabel.getSmartText(sparkValues.closeValue.label);
                closeValueWidth += sparkValues.closeValue.smartObj.width + valuePadding;
            }
            if (sparkValues.highValue && sparkValues.highValue.label) {
                sparkValues.highValue.smartObj = smartLabel.getSmartText(sparkValues.highValue.label);
            }
            if (sparkValues.lowValue && sparkValues.lowValue.label) {
                sparkValues.lowValue.smartObj = smartLabel.getSmartText(sparkValues.lowValue.label);
            }
            if (sparkValues.highLowValue && sparkValues.highLowValue.label) {
                sparkValues.highLowValue.smartObj = smartLabel.getSmartText(sparkValues.highLowValue.label);
                closeValueWidth += sparkValues.highLowValue.smartObj.width + valuePadding;
            }

            // Restrict the space to availableWidth
            left = sparkValues.openValueWidth = mathMin(openValueWidth, availableWidth);
            right = sparkValues.closeValueWidth = mathMin(closeValueWidth, (availableWidth - left));

            return {
                left: left,
                right: right
            };
        },
        // parse canvas cosmetics.
        _parseCanvasCosmetics: function () {
            var canvasBorderThickness,
                showCanvasBorder,
                shadow,
                iapi = this,
                components = iapi.components,
                config = iapi.config,
                canvasConfig = components.canvas.config,
                chartAttrs = iapi.jsonData.chart,
                colorM = components.colorManager;

            canvasConfig.canvasBorderRadius = 0;
            canvasBorderThickness = canvasConfig.canvasBorderThickness = 0;

            showCanvasBorder = canvasConfig.showCanvasBorder = 0;

            canvasConfig.canvasBorderWidth = !showCanvasBorder ? 0 : canvasBorderThickness;
            canvasConfig.canvasBorderColor = convertColor(pluck(chartAttrs.canvasbordercolor,
                colorM.getColor('canvasBorderColor')));

            // Make canvas background transparent for sparkWinLoss and sparkLine charts.
            canvasConfig.canBGColor = COLOR_TRANSPARENT;

            shadow = canvasConfig.shadow = 0;
            canvasConfig.shadowOnCanvasFill = shadow && shadow.enabled;

            // canvas padding
            canvasConfig.origCanvasTopPad = pluckNumber(chartAttrs.canvastoppadding, 0);
            canvasConfig.origCanvasBottomPad = pluckNumber(chartAttrs.canvasbottompadding, 0);
            canvasConfig.origCanvasLeftPad = pluckNumber(chartAttrs.canvasleftpadding, 0);
            canvasConfig.origCanvasRightPad = pluckNumber(chartAttrs.canvasrightpadding, 0);

            canvasConfig.canvasPadding = 0;

            config.origCanvasLeftMargin = pluckNumber(chartAttrs.canvasleftmargin);
            config.origCanvasRightMargin = pluckNumber(chartAttrs.canvasrightmargin);
            config.origCanvasTopMargin = pluckNumber(chartAttrs.canvastopmargin);
            config.origCanvasBottomMargin = pluckNumber(chartAttrs.canvasbottommargin);
        },
        singleseries: true
    }, chartAPI.sparkchartbase, {
        enablemousetracking : true
    });

    FusionCharts.register('component', ['dataset', 'sparkwinloss', {
        _setConfigure : function (newDataset, newIndex) {
            var dataSet = this,
                chart = dataSet.chart,
                chartConfig = chart.config,
                conf = dataSet.config,
                JSONData = dataSet.JSONData,
                setDataArr = newDataset || JSONData.data,
                setDataLen = setDataArr && setDataArr.length,
                categories = chart.config.categories,
                catLen = categories && categories.length,
                len = (newDataset && newDataset.data.length) || mathMin(catLen, setDataLen),
                chartAttr = chart.jsonData.chart,
                components = chart.components,
                colorM = components.colorManager,
                xAxis = components.xAxis[0],
                index = dataSet.index || dataSet.positionIndex,
                showplotborder = chartConfig.showplotborder,
                plotColor = conf.plotColor = colorM.getPlotColor(index),
                //plotBorderDash = pluckNumber(JSONData.dashed, chartAttr.plotborderdashed),
                //usePlotGradientColor = pluckNumber(chartAttr.useplotgradientcolor, 1),
                parseUnsafeString = lib.parseUnsafeString,
                plotFillColor = pluck(chartAttr.plotfillcolor, colorM.getColor('plotFillColor')),
                winColor = pluck(chartAttr.wincolor, colorM.getColor('winColor')),
                lossColor = pluck(chartAttr.losscolor, colorM.getColor('lossColor')),
                drawColor = pluck(chartAttr.drawcolor, colorM.getColor('drawColor')),
                scorelessColor = pluck(chartAttr.scorelesscolor, colorM.getColor('scorelessColor')),
                winHoverColor = chartAttr.winhovercolor,
                lossHoverColor = chartAttr.losshovercolor,
                drawHoverColor = chartAttr.drawhovercolor,
                scoreLessHoverColor = chartAttr.scorelesshovercolor,
                numWon = 0,
                numLost = 0,
                numDraw = 0,
                formatedVal,
                tempPlotfillAngle,
                // toolText,
                plotDashLen,
                plotDashGap,
                plotBorderThickness = chartConfig.plotborderthickness,
                isRoundEdges = chartConfig.isroundedges,
                showHoverEffect = chartConfig.plothovereffect,
                plotfillAngle = conf.plotfillangle,
                plotFillAlpha,
                //plotRadius,
                plotFillRatio,
                //plotgradientcolor,
                plotBorderAlpha,
                plotBorderDashStyle,
                initailPlotBorderDashStyle = conf.plotBorderDashStyle,
                setData,
                setValue,
                dataObj,
                config,
                label,
                colorArr,
                hoverColor,
                hoverAlpha,
                hoverGradientColor,
                hoverRatio,
                hoverAngle,
                hoverBorderColor,
                hoverBorderAlpha,
                hoverBorderThickness,
                hoverBorderDashed,
                hoverBorderDashGap,
                hoverBorderDashLen,
                hoverDashStyle,
                hoverColorArr,
                getDashStyle = lib.getDashStyle,
                dataStore = dataSet.components.data,
                setDisplayValue,
                //definedGroupPadding,
                isBar = chart.isBar,
                is3D = chart.is3D,
                //isStacked = chart.isStacked,
                //stack100Percent,
                //enableAnimation,
                setDataDashed,
                setDataPlotDashLen,
                setDataPlotDashGap,
                i,
                maxValue = conf.maxValue || -Infinity,
                minValue = conf.minValue || +Infinity,
                showPlotBorder,
                tempIndex;

            if (!dataStore) {
                dataStore = dataSet.components.data = [];
            }

            dataSet.__base__._setConfigure.call(dataSet);

            conf.plotgradientcolor = '';
            showPlotBorder = conf.showPlotBorder = pluckNumber(chartAttr.showplotborder, 0);
            conf.plotborderalpha = plotBorderAlpha = showPlotBorder ? pluck(chartAttr.plotborderalpha,
                plotFillAlpha, HUNDREDSTRING): 0;
            conf.showTooltip = 0;
            chartConfig.showtooltip = 0;
            // Parsing the attributes and values at set level.
            for (i = 0; i < len; i++) {

                if (newDataset) {
                    setData = (newDataset && newDataset.data[i]);

                    if (newIndex !== undefined) {
                        tempIndex = newIndex + i ;
                        dataObj = dataStore[tempIndex];
                    }
                    else {
                        tempIndex = dataStore.length - len + i;
                        dataObj = dataStore[tempIndex];
                    }
                }
                else {

                    dataObj = dataStore[i];
                    setData = setDataArr[i];
                }


                config = dataObj && dataObj.config;

                if (!dataObj) {
                    dataObj = dataStore[i] = {};
                }

                if (!dataObj.config) {
                    config = dataStore[i].config = {};

                }

                switch ((setData.value || '').toLowerCase()) {
                    case 'w':
                        plotColor = pluck(setData.color, winColor, plotFillColor);
                        hoverColor = pluck(setData.hovercolor, winHoverColor, plotColor);
                        config.setValue = setValue = 1;
                        numWon += 1;
                        break;
                    case 'l':
                        plotColor = pluck(setData.color, lossColor, plotFillColor);
                        hoverColor = pluck(setData.hovercolor, lossHoverColor, plotColor);
                        config.setValue = setValue = -1;
                        numLost += 1;
                        break;
                    case 'd':
                        plotColor = pluck(setData.color, drawColor, plotFillColor);
                        hoverColor = pluck(setData.hovercolor, drawHoverColor, plotColor);
                        config.setValue = setValue = 0.1;
                        numDraw += 1;
                        break;
                    default :
                        config.setValue = setValue = null;
                }
                if (setData.scoreless == 1) {
                    plotColor = pluck(setData.color, scorelessColor, plotFillColor);
                    hoverColor = pluck(setData.hovercolor, scoreLessHoverColor,
                        setData.color, scorelessColor, hoverColor);
                }

                config.toolText = false;
                // config.showValue = pluckNumber(setData.showvalue, conf.showValues);
                config.setLink  = pluck(setData.link);
                // config.toolTipValue = toolTipValue = yAxis.dataLabels(setValue);
                config.setDisplayValue = setDisplayValue = parseUnsafeString(setData.displayvalue);
                // config.displayValue = pluck(setDisplayValue, toolTipValue);
                setDataDashed = pluckNumber(setData.dashed);
                setDataPlotDashLen = pluckNumber(setData.dashlen, plotDashLen);
                setDataPlotDashGap = plotDashGap = pluckNumber(setData.dashgap, conf.plotDashGap);

                if (setValue !== null) {
                    maxValue = mathMax(maxValue, setValue);
                    minValue = mathMin(minValue, setValue);
                }


                config.plotBorderDashStyle = plotBorderDashStyle =  setDataDashed === 1 ?
                    getDashStyle(setDataPlotDashLen, setDataPlotDashGap, plotBorderThickness) :
                        (setDataDashed === 0 ? 'none' : initailPlotBorderDashStyle);

                plotFillAlpha = pluck(setData.alpha, conf.plotfillalpha);
                plotBorderAlpha = pluck(setData.alpha, conf.plotborderalpha, plotFillAlpha).toString();
                // Setting the angle for plot fill for negative data
                if (setValue < 0 && !isRoundEdges) {
                    tempPlotfillAngle = conf.plotfillAngle;
                    plotfillAngle = isBar ? 180 - plotfillAngle : 360 - plotfillAngle;
                }

                // Setting the color Array to be applied to the bar/column.
                config.colorArr = colorArr = lib.graphics.getColumnColor(
                        plotColor + ',' + conf.plotgradientcolor,
                        plotFillAlpha,
                        plotFillRatio = conf.plotfillratio,
                        plotfillAngle,
                        isRoundEdges,
                        conf.plotbordercolor,
                        plotBorderAlpha,
                        (isBar ? 1 : 0),
                        (is3D ? true : false)
                        );

                label = config.label = getValidValue(parseUnsafeString(xAxis.getLabel(pluckNumber(tempIndex -
                    len, i)).label));

                // Parsing the hover effects only if showhovereffect is not 0.
                if (showHoverEffect !== 0) {

                    hoverColor = pluck(setData.hovercolor, JSONData.hovercolor, chartAttr.plotfillhovercolor,
                        chartAttr.columnhovercolor, plotColor);
                    hoverAlpha = pluck(setData.hoveralpha, JSONData.hoveralpha,
                        chartAttr.plotfillhoveralpha, chartAttr.columnhoveralpha, plotFillAlpha);
                    hoverGradientColor = pluck(setData.hovergradientcolor,
                        JSONData.hovergradientcolor, chartAttr.plothovergradientcolor, conf.plotgradientcolor);
                    !hoverGradientColor && (hoverGradientColor = '');
                    hoverRatio = pluck(setData.hoverratio,
                        JSONData.hoverratio, chartAttr.plothoverratio, plotFillRatio);
                    hoverAngle = pluckNumber(360 - setData.hoverangle,
                        360 - JSONData.hoverangle, 360 - chartAttr.plothoverangle, plotfillAngle);
                    hoverBorderColor = pluck(setData.borderhovercolor,
                        JSONData.borderhovercolor, chartAttr.plotborderhovercolor, conf.plotbordercolor);
                    hoverBorderAlpha = pluck(setData.borderhoveralpha,
                        JSONData.borderhoveralpha, chartAttr.plotborderhoveralpha,
                        plotBorderAlpha, plotFillAlpha);
                    hoverBorderThickness = pluckNumber(setData.borderhoverthickness,
                        JSONData.borderhoverthickness, chartAttr.plotborderhoverthickness, plotBorderThickness);
                    hoverBorderDashed = pluckNumber(setData.borderhoverdashed,
                        JSONData.borderhoverdashed, chartAttr.plotborderhoverdashed);
                    hoverBorderDashGap = pluckNumber(setData.borderhoverdashgap,
                        JSONData.borderhoverdashgap, chartAttr.plotborderhoverdashgap, plotDashLen);
                    hoverBorderDashLen = pluckNumber(setData.borderhoverdashlen,
                        JSONData.borderhoverdashlen, chartAttr.plotborderhoverdashlen, plotDashGap);
                    hoverDashStyle = hoverBorderDashed ?
                        getDashStyle(hoverBorderDashLen, hoverBorderDashGap, hoverBorderThickness) :
                            plotBorderDashStyle;

                    /* If no hover effects are explicitly defined and
                     * showHoverEffect is not 0 then hoverColor is set.
                     */
                    if (showHoverEffect == 1 && hoverColor === plotColor) {
                        hoverColor = getLightColor(hoverColor, 70);
                    }
                    // setting the hover color array which is always applied except when showHoverEffect is not 0.
                    hoverColorArr = lib.graphics.getColumnColor(
                        hoverColor + ',' + hoverGradientColor,
                        hoverAlpha,
                        hoverRatio,
                        hoverAngle,
                        isRoundEdges,
                        hoverBorderColor,
                        hoverBorderAlpha.toString(),
                        (isBar ? 1 : 0),
                        (is3D ? true : false)
                        );

                    config.setRolloutAttr = {
                        fill: !is3D ? toRaphaelColor(colorArr[0])
                                : [toRaphaelColor(colorArr[0]), !chartConfig.use3dlighting],
                        stroke: showplotborder && toRaphaelColor(colorArr[1]),
                        'stroke-width': plotBorderThickness,
                        'stroke-dasharray': plotBorderDashStyle
                    };
                    config.setRolloverAttr = {
                        fill: !is3D ? toRaphaelColor(hoverColorArr[0])
                                : [toRaphaelColor(hoverColorArr[0]), !chartConfig.use3dlighting],
                        stroke: showplotborder && toRaphaelColor(hoverColorArr[1]),
                        'stroke-width': hoverBorderThickness,
                        'stroke-dasharray': hoverDashStyle
                    };
                }

                formatedVal = config.toolTipValue;

                // config.toolText = toolText;
                // config.setTooltext = toolText;
                tempPlotfillAngle && (plotfillAngle = tempPlotfillAngle);

                tempIndex++;
            }

            conf.maxValue = 1;
            conf.minValue = -1;

            if (pluckNumber(chartAttr.showvalue, 1) == 1) {
                chart.config.sparkValues = {
                    closeValue: {
                    }
                };
                chart.config.sparkValues.closeValue.label = numWon + '-' + numLost + ((numDraw > 0) ?
                        ('-' + numDraw) : BLANKSTRING);
            }
        },
        draw: function () {
            var dataSet = this;

            dataSet.__base__.draw.call(dataSet);

            _drawPeriod.call(dataSet);
        },
        drawLabel: drawSparkValues
    },'column']);

    FusionCharts.register('component', ['datasetGroup', 'SparkWinLoss', {
        // Override draw function in order to stop clipping of dataLabes group
        manageSpace: function () {
        },
        draw: function () {
            var group = this,
                positionStackArr = group.positionStackArr,
                length = positionStackArr.length,
                i,
                j,
                subDataset,
                subDatasetLen,
                dataSet,
                chart = group.chart,
                viewPortConfig = chart.config.viewPortConfig,
                scaleX = viewPortConfig.scaleX || 1,
                elements = chart.components.canvas.config.clip,
                is3D = chart.is3D,
                parentContainer = chart.graphics.columnGroup,
                graphics = chart.graphics,
                clipCanvas = elements['clip-canvas'].slice(0),
                dataLabelsLayer =  graphics.datalabelsGroup,
                animationObj = chart.get('config', 'animationObj'),
                animationDuration = animationObj.duration;

            clipCanvas[2] = clipCanvas[2] * scaleX;

            if (!parentContainer.clip && !is3D) {
                parentContainer.attr({
                    'clip-rect': clipCanvas
                });
                dataLabelsLayer.attr({
                    // 'clip-rect': [clipCanvas[0], 0 , clipCanvas[2], clipCanvas[3] + clipCanvas[1]]
                });
            }

            if (animationDuration) {
                !is3D && parentContainer.animate({
                    'clip-rect': clipCanvas
                }, animationDuration, NORMALSTRING);
                !is3D && dataLabelsLayer.animate({
                    // 'clip-rect': [clipCanvas[0], 0 , clipCanvas[2], clipCanvas[3] + clipCanvas[1]]
                }, animationDuration, NORMALSTRING);
            }
            else {
                !is3D && parentContainer.attr({
                    'clip-rect': clipCanvas
                });
                !is3D && dataLabelsLayer.attr({
                    // 'clip-rect': [clipCanvas[0], 0 , clipCanvas[2], clipCanvas[3] + clipCanvas[1]]
                });
            }
            group.preDrawCalculate();
            group.drawSumValueFlag = true;
            for( i=0; i<length; i++) {
                subDataset = positionStackArr[i];
                subDatasetLen = subDataset.length;
                group.manageClip = true;
                for(j=0; j<subDatasetLen; j++) {
                    dataSet = positionStackArr[i][j].dataSet;
                    dataSet.draw();
                }
            }
        }
    }, 'column']);


    chartAPI('sparkline', {
        standaloneInit: true,
        friendlyName: 'SparkLine Chart',
        creditLabel: creditLabel,
        defaultDatasetType: 'sparkline',
        singleseries: true,
        showValues: 0,
        _parseCanvasCosmetics: chartAPI.sparkwinloss._parseCanvasCosmetics,
        _placeOpenCloseValues: chartAPI.sparkwinloss._placeOpenCloseValues,
        defaultPlotShadow: 0,
        axisPaddingLeft: 0,
        axisPaddingRight: 0,
        applicableDSList: { 'line': true }
    }, chartAPI.sparkchartbase, {
        showvalues: 0,
        enablemousetracking: true
    });

    FusionCharts.register('component', ['dataset', 'sparkline', {
        type : 'sparkline',
        configure: function () {
            var dataSet = this,
                chart = dataSet.chart,
                // parseUnsafeString = lib.parseUnsafeString,
                conf = dataSet.config,
                JSONData = dataSet.JSONData,
                chartAttr = chart.jsonData.chart;

            this.__base__.configure.call(this);
            // Line configuration attributes parsing
            conf.linethickness = pluckNumber(JSONData.linethickness,
                chartAttr.linethickness, 1);
        },
        _setConfigure: function (newDataset) {
            var dataSet = this,
                chart = dataSet.chart,
                // parseUnsafeString = lib.parseUnsafeString,
                conf = dataSet.config,
                JSONData = dataSet.JSONData,
                chartAttr = chart.jsonData.chart,
                setDataArr = newDataset || JSONData.data,
                setData,
                dataObj,
                xAxis = chart.components.xAxis[0],
                len = (newDataset && newDataset.data.length) || xAxis.getCategoryLen(),
                colorM = chart.components.colorManager,
                chartConf = chart.config,
                dataStore,
                // dataLabelStyle = chartConf.dataLabelStyle,
                config,
                i,
                //Fill Color for high, low, open and close (SparkLine Charts)
                openColor = parseColor(pluck(chartAttr.opencolor, '0099FF')),
                closeColor = parseColor(pluck(chartAttr.closecolor, '0099FF')),
                highColor = parseColor(pluck(chartAttr.highcolor, '00CC00')),
                lowColor = parseColor(pluck(chartAttr.lowcolor, 'CC0000')),

                anchorColor = parseColor(pluck(chartAttr.anchorcolor, colorM.getColor('plotFillColor'))),
                //Whether to show anchors for open, close, high & low
                showOpenAnchor =
                    pluckNumber(chartAttr.showopenanchor, chartAttr.drawanchors, chartAttr.showanchors, 1),
                showCloseAnchor = pluckNumber(chartAttr.showcloseanchor, chartAttr.drawanchors,
                    chartAttr.showanchors, 1),
                showHighAnchor =
                    pluckNumber(chartAttr.showhighanchor, chartAttr.drawanchors, chartAttr.showanchors, 1),
                showLowAnchor =
                    pluckNumber(chartAttr.showlowanchor, chartAttr.drawanchors, chartAttr.showanchors, 1),
                anchorAlpha = pluckNumber(chartAttr.anchoralpha, 100),
                showAnchors = pluckNumber(chartAttr.drawanchors, chartAttr.showanchors, 0),
                defAnchorAlpha = showAnchors ? pluckNumber(chartAttr.anchoralpha, 100) : 0,
                lineColor = pluck(chartAttr.linecolor, colorM.getColor('plotFillColor')),
                sparkValues,
                hasValidValue,
                highValue,
                lowValue,
                pointAnchorAlpha,
                anchorHoverColor,
                highDisplayValue,
                lowDisplayValue,
                openDisplayValue,
                closeDisplayValue;

            // Call the original _setConfigure function
            dataSet.__base__._setConfigure.call(dataSet);

            dataStore = dataSet.components.data;

            highValue = conf.maxValue;
            lowValue = conf.minValue;
            conf.shadow = {
                opacity: pluckNumber(chartAttr.showshadow, 0) ?
                    conf.alpha / 100 : 0
            };

            // openValue
            dataObj = dataStore[0];
            config = dataObj.config;
            config.anchorProps.bgColor = pluck(dataObj.anchorbgcolor, openColor);
            config.anchorProps.enabled = !!showOpenAnchor;
            config.anchorProps.bgAlpha = showOpenAnchor ? pointAnchorAlpha : 0;
            // Apply appropriate hover efffects on openValue
            if (config.anchorProps.enabled && config.hoverEffects)  {
                config.hoverEffects.anchorColor = pluck(chartAttr.openhovercolor,
                    chartAttr.anchorhovercolor, chartAttr.plotfillhovercolor, getLightColor(openColor, 70));
                config.hoverEffects.anchorBgAlpha = pluckNumber(chartAttr.openhoveralpha, chartAttr.anchorhoveralpha,
                        chartAttr.plotfillhoveralpha, 100);
            }
            openDisplayValue = config.displayValue;

            // closeValue
            dataObj = dataStore[len - 1];
            config = dataObj.config;
            config.anchorProps.bgColor = pluck(dataObj.anchorbgcolor, closeColor);
            config.anchorProps.enabled = !!showCloseAnchor;
            config.anchorProps.bgAlpha = showCloseAnchor ? pointAnchorAlpha : 0;
            // Apply appropriate hover efffects on openValue
            if (config.anchorProps.enabled && config.hoverEffects)  {
                config.hoverEffects.anchorColor = pluck(chartAttr.closehovercolor,
                    chartAttr.anchorhovercolor, chartAttr.plotfillhovercolor, getLightColor(closeColor, 70));
                config.hoverEffects.anchorBgAlpha = pluckNumber(chartAttr.closehoveralpha, chartAttr.anchorhoveralpha,
                        chartAttr.plotfillhoveralpha, 100);
            }
            closeDisplayValue = config.displayValue;

            for (i = 0; i < len; i++) {

                dataObj = dataStore[i];
                config = dataObj.config;
                setData = setDataArr[i];

                pointAnchorAlpha = pluckNumber(setData.anchorbgalpha, anchorAlpha);
                conf.maxRadius = -Infinity;
                // Skipp color parsing for open and close values
                if (i !== 0 && i !== len-1) {
                    config.anchorProps.bgColor = pluck(setData.anchorbgcolor, anchorColor);
                    config.anchorProps.bgAlpha = pluckNumber(setData.anchorbgalpha, defAnchorAlpha);
                    config.hoverEffects.anchorColor = parseColor(pluck(chartAttr.anchorhovercolor,
                        chartAttr.plotfillhovercolor, getLightColor(lineColor, 70)));
                    config.hoverEffects.anchorBgAlpha = pluckNumber(
                        chartAttr.lowhoveralpha, chartAttr.anchorhoveralpha, chartAttr.plotfillhoveralpha, 100);
                }

                config.anchorProps.radius = pluckNumber(chartAttr.anchorradius, setData.anchorradius, 2);
                config.anchorProps.borderThickness = 0;
                config.hoverEffects.anchorBorderThickness = 0;
                config.hoverEffects.anchorRadius = pluckNumber(chartAttr.anchorhoverradius, chartAttr.anchorradius,
                    setData.anchorradius, 3);
                conf.maxRadius = Math.max(config.anchorProps.radius + (config.anchorProps.borderThickness / 2),
                        conf.maxRadius);

                if (config.setValue === lowValue) {
                    config.anchorProps.bgColor = pluck(setData.anchorbgcolor, lowColor);
                    config.hoverEffects.anchorColor = pluck(chartAttr.lowhovercolor,
                        chartAttr.anchorhovercolor, chartAttr.plotfillhovercolor, getLightColor(lowColor, 70));
                    config.hoverEffects.anchorBgAlpha = pluckNumber(chartAttr.lowhoveralpha, chartAttr.anchorhoveralpha,
                        chartAttr.plotfillhoveralpha, 100);
                    config.anchorProps.enabled = !!showLowAnchor;
                    config.anchorProps.bgAlpha = showLowAnchor ? pointAnchorAlpha : 0;
                    lowDisplayValue = config.displayValue;
                }
                if (config.setValue === highValue) {
                    config.anchorProps.bgColor = pluck(setData.anchorbgcolor, highColor);
                    config.hoverEffects.anchorColor = anchorHoverColor = pluck(chartAttr.highhovercolor,
                        chartAttr.anchorhovercolor, chartAttr.plotfillhovercolor, getLightColor(highColor, 70));
                    config.hoverEffects.anchorBgAlpha = pluckNumber(chartAttr.highhoveralpha,
                        chartAttr.anchorhoveralpha, chartAttr.plotfillhoveralpha, 100);
                    config.anchorProps.enabled = !!showHighAnchor;
                    config.anchorProps.bgAlpha = showHighAnchor ? pointAnchorAlpha : 0;
                    highDisplayValue = config.displayValue;
                }
                if (defined(config.setValue)) {
                    hasValidValue = 1;
                }
            }

            sparkValues = chartConf.sparkValues = {
                openValue: {
                    color: openColor
                },
                closeValue: {
                    color: closeColor
                },
                highValue: {
                    color: highColor
                },
                lowValue: {
                    color: lowColor
                },
                highLowValue: {
                }
            };

            if (hasValidValue) {
                sparkValues.openValue.label = pluckNumber(chartAttr.showopenvalue, 1) ?
                    openDisplayValue : BLANKSTRING;
                sparkValues.closeValue.label = pluckNumber(chartAttr.showclosevalue, 1) ?
                    closeDisplayValue : BLANKSTRING;
                if (pluckNumber(chartAttr.showhighlowvalue, 1)) {
                    // Store complete high, low label to label for the space manager.
                    sparkValues.highLowValue.label = '[' + highDisplayValue + ' | ' +
                        lowDisplayValue + ']';
                    // Store high, low label separately to render the labels
                    // Using different color style.
                    sparkValues.highValue.label = highDisplayValue;
                    sparkValues.lowValue.label = lowDisplayValue;
                }
            }
        },
        draw: function () {
            var dataSet = this;

            dataSet.__base__.draw.call(dataSet);

            dataSet._drawSparkValues();

            _drawPeriod.call(dataSet);
        },
        _drawSparkValues: function () {
            var dataSet = this;

            drawSparkValues.call(dataSet);
        }
    }, 'Line']);
}, [3, 2, 0, 'sr2']]);

/**
 * @private
 * @module fusioncharts.renderer.javascript.logger.message
 */
FusionCharts.register('module', ['private', 'modules.renderer.js-messagelogger',
    function () {
        var global = this,
        win = global.window,
        doc = win.document,
        docmode8 = doc.documentMode === 8,
        lib = global.hcLib,
        R = lib.Raphael,
        componentDispose = lib.componentDispose,
        pluckNumber = lib.pluckNumber,
        isIE = lib.isIE,
        hex2rgb = lib.graphics.HEXtoRGB,
        convertColor = lib.graphics.convertColor,
        pluck = lib.pluck,
        mathMin = Math.min,

        Message,
        PX = 'px',
        TITLE_HASH_STRING = '$titleVal$',
        MSG_HASH_STRING = '$msgVal$',
        LINK_HASH_STRING = '$msgLinkVal$',
        msgTemplate = {},
        CONTAINER_SPAN_STYLE = {
            display: 'block',
            paddingLeft: '10px',
            'paddingRight': '10px',
            'font-family': 'Arial',
            'font-size': '11px'
        },
        defAnimEffect = 'normal';

        msgTemplate.literal = msgTemplate.info = {
            title: '<span style="color: #005900">' + TITLE_HASH_STRING + '</span>',
            body: '<span>' + MSG_HASH_STRING + '</span>'
        };
        msgTemplate.link = {
            title: msgTemplate.info.title,
            body: '<a href="' + LINK_HASH_STRING + '">' + MSG_HASH_STRING + '</a>'
        };
        msgTemplate.error = {
            title: '<span style="color: #CC0000">' + TITLE_HASH_STRING + '</span>',
            body: '<span style="color: #CC0000">' + MSG_HASH_STRING + '</span>'
        };


        // message class
        Message = function (messageObj, msgLogger) {
            var message = this,
            config = message.config = {},
            messageType = (messageObj.msgType || '').toLowerCase(),
            msgObj,
            msgTitle = messageObj.msgTitle,
            msgText = messageObj.msgText,
            msgLink = pluck(messageObj.msgLink, msgText);
            // initilize with blank string
            config.totalHTML = '';

            message.graphics = {};

            message.linkedItems = {
                msgLogger: msgLogger
            };


            msgObj = msgTemplate[messageType] || msgTemplate.literal;

            if (msgTitle) {
                config.titleHTML = msgObj.title.replace(TITLE_HASH_STRING, msgTitle);
                config.totalHTML += config.titleHTML;
            }

            if (msgText) {
                config.msgHTML = msgObj.body.replace(MSG_HASH_STRING, msgText);
                // replace the link
                config.msgHTML = config.msgHTML.replace(LINK_HASH_STRING, msgLink);

                config.totalHTML += config.msgHTML;
            }
        };

        Message.prototype = {
            draw: function () {
                var message = this,
                config = message.config,
                graphics = message.graphics,
                prop,
                element = graphics.element,
                msgLogger = message.linkedItems.msgLogger,
                loggerGraphics = msgLogger.graphics,
                groupDOMelem = loggerGraphics && loggerGraphics.log && loggerGraphics.log.element,
                logWrapperElem = loggerGraphics.logWrapper && loggerGraphics.logWrapper.element,
                temp,
                loggerConfig = msgLogger.config,
                scrollHeight;
                if (!element) {
                    element = graphics.element = doc.createElement('span');

                    //apply all style
                    for (prop in CONTAINER_SPAN_STYLE) {
                        element.style[prop] = CONTAINER_SPAN_STYLE[prop];
                    }
                    // @todo: instead of teh DOM method, use renderer standerd method
                    // Apend the element
                    groupDOMelem.appendChild && groupDOMelem.appendChild(element);

                }
                graphics.element.innerHTML = config.totalHTML;

                //IE 8 erratically fails to renders child elements in the log divs.
                //Inspection reveals that there is no problem in appending the
                //elements and they gets rendered some time later as a whole.
                //This could be an issue related to what style
                //attributes (display & visibility) are used for showing or hiding
                //the div. The follwoing checks fix the issue -
                if (isIE && docmode8) {
                    temp = groupDOMelem.innerHTML;
                    groupDOMelem.innerHTML = temp;
                }
                //auto scrolling to bottom
                if (loggerConfig.scrollToBottom) {
                    //set the dynamic scrolling flag to true
                    loggerConfig.dynamicScrolling = true;
                    scrollHeight = logWrapperElem.scrollHeight;
                    logWrapperElem.scrollTop = scrollHeight;
                }

            },
            dispose: function () {
                var message = this,
                graphics = message.graphics,
                msgLogger = message.linkedItems.msgLogger;


                // @todo: instead of teh DOM method, use renderer standerd method
                // remove the graphics element
                msgLogger && msgLogger.graphics && msgLogger.graphics.log && msgLogger.graphics.log.element &&
                    msgLogger.graphics.log.element.removeChild &&
                    msgLogger.graphics.log.element.removeChild(graphics.element);
                delete graphics.element;

                // Now remove everything by calling the generalised dispose element
                componentDispose.call(message);

            }
        };
        Message.prototype.constractor = Message;




        FusionCharts.register('component', ['logger', 'message',{
            pIndex: 1,

            customConfigFn : null,
            /**
             * Initilaze the messageLogger
             */
            init: function (chart) {
                var msLogger = this,
                    linkedItems = msLogger.linkedItems || (msLogger.linkedItems = {});

                msLogger.components = msLogger.components || {};
                msLogger.components.messages = msLogger.components.messages || [];
                msLogger.graphics = msLogger.graphics || {};

                linkedItems.chart = chart;
            },

            configure: function () {
                var msLogger = this,
                    config = msLogger.config || (msLogger.config = {}),
                    chart = msLogger.linkedItems.chart,
                    chartAttr = (chart.get && chart.get('jsonData', 'chart')) || {},
                    usemessagelog = config.usemessagelog = chart.get('config', 'usemessagelog');

                // parse the attributes
                // todo: this attributes should be parsed in chart
                config.messageLogWPercent = mathMin((pluckNumber(chartAttr.messagelogwpercent, 80)), 100);
                config.messageLogHPercent = mathMin((pluckNumber(chartAttr.messageloghpercent, 70)), 100);
                config.messageLogShowTitle = pluckNumber(chartAttr.messagelogshowtitle, 1);
                config.messageLogTitle = pluck(chartAttr.messagelogtitle, 'Message Log');
                config.messageLogColor = pluck(chartAttr.messagelogcolor, '#fbfbfb').replace(/^#?([a-f0-9]+)/ig, '$1');
                config.messageLogColorRgb = hex2rgb(config.messageLogColor);
                config.messageGoesToJS = pluckNumber(chartAttr.messagegoestojs, 0);
                config.messageGoesToLog = pluckNumber(chartAttr.messagegoestolog, 1);
                config.messageJSHandler = pluck(chartAttr.messagejshandler, '');
                config.messagePassAllToJS = pluckNumber(chartAttr.messagepassalltojs, 0);
                // @todo change the default value of "messagePassAsObject" to 1 after 2 release
                config.messagePassAsObject = pluckNumber(chartAttr.messagepassasobject, 0);
                config.messageLogIsCancelable = pluckNumber(chartAttr.messagelogiscancelable, 1);
                config.alwaysShowMessageLogMenu = pluckNumber(chartAttr.alwaysshowmessagelogmenu, usemessagelog);

                chart.config.useShowLogMenu = usemessagelog && config.messageGoesToLog;

                config.dynamicScrolling = false;
                config.scrollToBottom = true;
            },
            /**
             * This function parse a message object parsed from the server and create an internal message item
             * @param {object} messageObj server sent message object
             * @returns {object} Internal message item
             */
            _createMessage: function (messageObj) {
                var msLogger = this,
                    messageObject = new Message(messageObj, msLogger);
                // if the message logger is already drawn then draw the messages as well
                if (msLogger.graphics.container) {
                    messageObject.draw();
                }

                return messageObject;
            },
            /*
             * Function to add a message
             * @param {Array(object)} messageObj this object contain the message in
             */
            addLog: function (messageObj) {
                var msLogger = this,
                    config = msLogger.config,
                    components = msLogger.components,
                    messages = components.messages,
                    msgGoesToLog = pluckNumber(messageObj.msgGoesToLog, config.messageGoesToLog),
                    msgGoesToJS = pluckNumber(messageObj.msgGoesToJS, config.messageGoesToJS),
                    globalJSFunc = win[config.messageJSHandler],
                    msgId = pluck(messageObj.msgId, ''),
                    title = pluck(messageObj.msgTitle, ''),
                    msg = pluck(messageObj.msgText, ''),
                    msgType = pluck(messageObj.msgType, 'literal'),
                    message;

                if (!config.usemessagelog) {
                    return;
                }

                if (msgGoesToJS && globalJSFunc && typeof globalJSFunc === 'function') {
                    // check whether all parameters are to be passed.
                    // @note: the order of the attributes are fixed. This could be
                    // made dynamic through passing a whole objcet.
                    config.messagePassAllToJS ? (config.messagePassAsObject ? globalJSFunc(messageObj) :
                        globalJSFunc(msgId, title, msg, msgType)): globalJSFunc(msg);
                }

                // if configured, clear the log
                if (messageObj.clearLog === '1') {
                    msLogger.clearLog();
                }

                if (msgGoesToLog && (messageObj.msgTitle || messageObj.msgText)) {
                    message = msLogger._createMessage(messageObj);
                    messages.push(message);
                    // if this is the first message  and the window is hidden, open the window
                    if (messages.length === 1 && !config.visible) {
                        msLogger.show();
                    }
                }

            },
            /**
             * Show the logger window
             */
            show: function () {
                var msLogger = this,
                    graphics = msLogger.graphics,
                    config = msLogger.config;
                if (!config.visible) {
                    // set the visibility tag
                    config.visible = true;

                    // For initial performance boost, we don't draw the message logger initially
                    // So draw the message logger when the first time it is getiing visible
                    if (!graphics.container) {
                        msLogger.draw();
                    }

                    // show the group
                    graphics.container && graphics.container.show();
                }
            },
            /**
             * Hide the logger windoew
             */
            hide: function () {
                var msLogger = this,
                    graphics = msLogger.graphics,
                    config = msLogger.config;

                // set the visibility flag
                config.visible = false;

                // hide the group
                graphics.container && graphics.container.hide();
            },
            /**
             * Clear all logged message
             */
            clearLog: function () {
                var msLogger = this,
                components = msLogger.components,
                messages = components.messages,
                i,
                l = messages.length;
                for (i = 0; i < l; i += 1) {
                    messages[i] && messages[i].dispose && messages[i].dispose();
                }

                // remove all from the store
                messages.splice(0, l);

            },
            /**
             * Function to check whether the logger is drawn or not
             * @returns {Boolean} Message logger's drawing status
             */
            isDrawn: function () {
                return !!this.graphics.container;
            },
            /**
             * This function draw the message logger window
             */
            draw: function () {
                var msLogger = this,
                    config = msLogger.config,
                    components = msLogger.components,
                    messages = components.messages,
                    i,
                    l;

                if (!config.usemessagelog) {
                    if (msLogger.isDrawn()) {
                        msLogger.clearLog();
                        msLogger.hide();
                    }
                }
                else {
                    msLogger._createHTMLDialogue();
                    if (!config.visible) {
                        msLogger.hide();
                    }


                    l = messages.length;
                    // draw all messages
                    for (i = 0; i < l; i += 1) {
                        messages[i] && messages[i].draw && messages[i].draw();
                    }
                }
            },

            _createHTMLDialogue: function () {
                var msLogger = this,
                    config = msLogger.config,
                    graphics = msLogger.graphics,
                    linkedItems = msLogger.linkedItems,
                    components = msLogger.components,
                    iapi = linkedItems.chart,
                    paper = iapi.get('components', 'paper'),
                    chartContainer = iapi.get('linkedItems', 'container'),
                    chartConfig = iapi.get('config'),
                    chartWidth = chartConfig.width,
                    chartHeight = chartConfig.height,
                    styles = chartConfig.style,
                    inCanvasStyle = styles && styles.inCanvasStyle,
                    messageLogWPercent = config.messageLogWPercent,
                    messageLogHPercent = config.messageLogHPercent,
                    messageLogShowTitle = config.messageLogShowTitle,
                    messageLogIsCancelable = config.messageLogIsCancelable,
                    messageLogColor = config.messageLogColor,
                    messageLogTitle = config.messageLogTitle,

                    //properties to configure the close button
                    closePaper = components.paper,
                    cg = graphics.cg,
                    closeBtnRadius = 6,
                    closeBtnContainerW = closeBtnRadius * 3,
                    closeBtnContainerH = closeBtnRadius * 3,
                    closeBtnBorderColor = '999999',
                    closeBtnHalfRadius = closeBtnRadius / 2,
                    closeBtnXPos = closeBtnContainerW / 2,
                    closeBtnYPos = closeBtnContainerH / 2,

                    hPadding = 5 + closeBtnRadius,
                    vPadding = 5 + closeBtnRadius,
                    dialogWidth = chartWidth * (messageLogWPercent / 100), //chartWidth - (hPadding * 2),
                    dialogHeight = chartHeight * (messageLogHPercent / 100), //chartHeight - (vPadding * 2),
                    dialogXPos = (chartWidth - dialogWidth) / 2,
                    dialogYPos = (chartHeight - dialogHeight) / 2,
                    textAreaWidth = dialogWidth - closeBtnContainerW - (hPadding * 2),
                    textAreaHeight = dialogHeight - closeBtnContainerH - (vPadding * 2),
                    closeBtnX = (dialogXPos + dialogWidth) -
                        (closeBtnContainerW + closeBtnHalfRadius), //half radius used as padding,
                    closeBtnY = dialogYPos + closeBtnHalfRadius,
                    veilBgColor = '000000',
                    dialogBgColor = 'ffffff',
                    dialogStrokeColor = messageLogColor,
                    logBGColor = messageLogColor,
                    container = graphics.container,
                    transposeAnimDuration = msLogger.isDrawn() && chartConfig.animation &&
                        chartConfig.animation.transposeAnimDuration,
                    tempAttrObj,
                    dialogAttr,
                    logBgAttr,
                    closeContainerAttr,
                    logWrapperAttr;

                // For forst time drawing create the emelents
                if (!container) {
                    container = graphics.container = paper.html('div', {
                        fill: 'transparent'
                    }, {
                        fontSize: 10 + PX,
                        lineHeight: 15 + PX
                    }, chartContainer);

                    graphics.veil = paper.html('div', {
                        id: 'veil',
                        fill: veilBgColor,
                        opacity: 0.1
                    }, undefined, container)
                    .on('click', function () {
                        messageLogIsCancelable && msLogger.hide();
                    });

                    //if message log title is available
                    //Create title
                    /** @todo: in IE title becomes too big. */
                    if (messageLogTitle && messageLogShowTitle) {
                        graphics.title = paper.html('p', {
                            id: 'Title',
                            innerHTML: messageLogTitle,
                            x: 5,
                            y: 5
                        }, {
                            'font-weight': 'bold'
                        }, container);
                    }

                    graphics.dialog = paper.html('div', {
                        id: 'dialog',
                        strokeWidth: 1
                    }, {
                        borderRadius: 5 + PX,
                        boxShadow: '1px 1px 3px #000000',
                        '-webkit-border-radius': 5 + PX,
                        '-webkit-box-shadow': '1px 1px 3px #000000',
                        filter: 'progid:DXImageTransform.Microsoft.Shadow(Strength=4, Direction=135, Color="#000000")'
                    }, container);

                    graphics.logBackground = paper.html('div', {
                        id: 'dialogBackground',
                        x: 0,
                        y: 0
                    }, undefined, graphics.dialog);


                    //create close button if required
                    if (messageLogIsCancelable) {
                        //In order to create a close button icon for message Logger
                        //we need to initiate a separate raphael instance on the messageLogger
                        //div
                        graphics.closeBtnContainer = paper.html('div', {
                            id: 'closeBtnContainer'
                        }, {
                            //'background-color': 'rgba(0, 0, 0, 0.4)'
                        }, container);

                        // @todo: recheck the use of R
                        components.paper = closePaper = new R('closeBtnContainer', closeBtnContainerW,
                            closeBtnContainerH);
                        closePaper.setConfig('stroke-linecap', 'round');

                        cg = graphics.cg = closePaper.group('closeGroup');

                        graphics.closeButton = closePaper.symbol('closeIcon', 0, 0, closeBtnRadius, cg)
                        .attr({
                            transform: 't' + closeBtnXPos + ',' + closeBtnYPos,
                            'stroke-width': 2,
                            //fill: convertColor(closeBtnFillColor),
                            stroke: convertColor(closeBtnBorderColor),
                            ishot: true,
                            'stroke-linecap': 'round',
                            'stroke-linejoin': 'round'
                        })
                        .css({
                            cursor: 'pointer',
                            _cursor: 'hand'
                        })
                        .click(function () {
                            msLogger.hide();
                        });
                    }

                    graphics.logWrapper = paper.html('div', {
                        id: 'logWrapper'
                    }, {
                        overflow: 'auto'
                    }, graphics.dialog)
                    .on('scroll', function () {
                        var wrapper = this,
                            scrollTop = wrapper && wrapper.scrollTop,
                            scrollHeight = wrapper && wrapper.scrollHeight,
                            wrapperHeight = wrapper && wrapper.offsetHeight;

                        if (config.dynamicScrolling) {
                            config.dynamicScrolling = false;
                            return;
                        }
                        //manual scrolling set auto scrolling bottom to false.
                        //if the scroller is not scrolled to bottom.
                        //This will prevent the scroller automatically jumping
                        //to end when user wants to see a specific area
                        config.scrollToBottom = ((scrollHeight - scrollTop) === wrapperHeight) ?
                            true : false;

                    });

                    graphics.log = paper.html('div', {
                        id: 'log',
                        x: 0,
                        y: 0
                        //opacity: 1
                    }, {}, graphics.logWrapper);

                }

                // update / apply the css or attributes that does not animate

                container.css({
                    fontFamily: inCanvasStyle.fontFamily
                });

                graphics.dialog.attr({
                    fill: dialogBgColor,
                    stroke: dialogStrokeColor
                });
                graphics.logBackground.attr({
                    fill: logBGColor
                });

                // to reduce the no of line pof code store the most used object as a local variable
                tempAttrObj = {
                    width: chartWidth,
                    height: chartHeight
                };
                dialogAttr = {
                    x: dialogXPos,
                    y: dialogYPos,
                    width: dialogWidth,
                    height: dialogHeight
                };
                logBgAttr = {
                    width: dialogWidth,
                    height: dialogHeight
                };
                closeContainerAttr = {
                    width: closeBtnContainerW,
                    height: closeBtnContainerH,
                    x: closeBtnX,
                    y: closeBtnY
                };
                logWrapperAttr = {
                    x: (dialogWidth - textAreaWidth) / 2,
                    y: (dialogHeight - textAreaHeight) / 2,
                    width: textAreaWidth,
                    height: textAreaHeight
                };

                if (transposeAnimDuration){
                    container.animate(tempAttrObj, transposeAnimDuration, defAnimEffect);
                    graphics.veil.animate(tempAttrObj, transposeAnimDuration, defAnimEffect);
                    graphics.dialog.animate(dialogAttr, transposeAnimDuration, defAnimEffect);
                    graphics.logBackground.animate(logBgAttr, transposeAnimDuration, defAnimEffect);
                    // if close btn is applicable then update it's attributes
                    graphics.closeBtnContainer && graphics.closeBtnContainer.animate(closeContainerAttr,
                        transposeAnimDuration, defAnimEffect);
                    graphics.logWrapper.animate(logWrapperAttr, transposeAnimDuration, defAnimEffect);
                }
                else {
                    container.attr(tempAttrObj);
                    graphics.veil.attr(tempAttrObj);
                    graphics.dialog.attr(dialogAttr);
                    graphics.logBackground.attr(logBgAttr);
                    // if close btn is applicable then update it's attributes
                    graphics.closeBtnContainer && graphics.closeBtnContainer.attr(closeContainerAttr);
                    graphics.logWrapper.attr(logWrapperAttr);
                }
            }
        }]);
    }
]);

/**
 * @private
 *
 * @module fusioncharts.renderer.javascript.alertmanager
 */
FusionCharts.register('module', ['private', 'modules.renderer.js-alertmanager', function () {

    var global = this,
        lib = global.hcLib,
        IN_ALERT_RANGE = '1',
        OUT_OF_ALERT_RANGE = '2',
        ACTION_CALLJS = 'calljs',
        ACTION_SHOWANNOTATION = 'showannotation';

    FusionCharts.register('component', ['manager', 'alert',{
        pIndex: 1,
        init: function(chart) {
            this.linkedItems = {
                chart: chart
            };
        },
        configure: function() {
            var alertManager = this,
            chart = alertManager.linkedItems.chart,
            alerts = chart.get('jsonData', 'alerts'),
            alertArr = alerts && alerts.alert,
            numberFormatter = chart.get('components', 'numberFormatter'),
            config = alertManager.config || (alertManager.config = {}),
            alertCount,
            j,
            alertObj;
            if (alertArr && alertArr.length) {
                config.alertArr = alertArr;
                alertCount = alertArr.length;
                for (j = 0; j < alertCount; j += 1) {
                    alertObj = alertArr[j];
                    alertObj.minvalue = numberFormatter.getCleanValue(alertObj.minvalue);
                    alertObj.maxvalue = numberFormatter.getCleanValue(alertObj.maxvalue);
                }
            }
            else {
                config.alertArr = [];
            }
        },
        processRTData: function(rtData) {
            var alertManager = this,
            chart = alertManager.linkedItems.chart,
            numberFormatter = chart.get('components', 'numberFormatter'),
            i,
            j,
            dsLength,
            dsObj,
            dataLength,
            dataObj,
            val;
            if (rtData && rtData.dataset && rtData.dataset.length) {
                dsLength = rtData.dataset.length;
                for (i = 0; i < dsLength; i += 1) {
                    dsObj = rtData.dataset[i];
                    if (dsObj.data && dsObj.data.length) {
                        dataLength = dsObj.data.length;
                        for (j = 0; j < dataLength; j += 1) {
                            dataObj = dsObj.data[j];
                            val = dataObj && numberFormatter.getCleanValue(dataObj.value);
                            if (val !== null) {
                                alertManager._doAlert(numberFormatter.getCleanValue(dataObj.value));
                            }
                        }
                    }
                }
            }
        },
        _doAlert: function (val) {
            var alertManager = this,
            chart = alertManager.linkedItems.chart,
            config = alertManager.config,
            alertArr = config.alertArr,
            alertCount = alertArr.length,
            alertObj,
            j,
            alertAction;
            for (j = 0; j < alertCount; j += 1) {
                alertObj = alertArr[j];
                alertAction = alertObj.action && alertObj.action.toLowerCase();
                if (alertObj.minvalue <= val && alertObj.maxvalue >= val) {
                    if (!(alertObj.occuronce === '1' && alertObj.hasOccurred)) {
                        alertObj.hasOccurred = true;
                        alertObj.state = IN_ALERT_RANGE;

                        switch (alertAction) {
                            case ACTION_CALLJS:
                                setTimeout(lib.pseudoEval(alertObj.param));
                                break;

                            case ACTION_SHOWANNOTATION:
                                chart.showAnnotation && chart.showAnnotation(alertObj.param);
                                break;
                        }
                        global.raiseEvent('AlertComplete', {
                            alertValue: val,
                            alertMaxValue: alertObj.maxvalue,
                            alertMinValue: alertObj.minvalue
                        }, chart.chartInstance);
                    }
                }
                else {
                    if (alertAction === ACTION_SHOWANNOTATION && alertObj.state === IN_ALERT_RANGE) {
                        chart.hideAnnotation &&
                            chart.hideAnnotation(alertObj.param);
                    }
                    // Set out of range flag
                    alertObj.state = OUT_OF_ALERT_RANGE;
                }
            }
        }
    }]);


}]);

/**
 * @private
 *
 * @module fusioncharts.renderer.javascript.datastreamer
 * @requires fusioncharts.renderer.javascript.logger.message
 * @requires fusioncharts.renderer.javascript.alertmanager
 */
FusionCharts.register('module', ['private', 'modules.renderer.js-realtime', function () {

    var global = this,
        lib = global.hcLib,
        win = global.window,
        math = Math,
        mathRandom = math.random,

        pluckNumber = lib.pluckNumber,

        THRESHOLD_MS = 10,

        /**
         * This function is to compact the routine of clearing and re-applying a timeout
         * @private
         *
         * @example
         * to = resetTimeout(theFunction, 500, to);
         *
         * @param {function} fn
         * @param {number} ms
         * @param {number} id
         * @returns {number}
         */
        resetTimeout = function (fn, ms, id) {
            clearTimeout(id);
            return setTimeout(fn, ms);
        },
        processRealtimeStateChange; // fn



    processRealtimeStateChange = function (event) {
        var chartObj = event.sender,
            state = chartObj.__state,
            chartAttr,
            vars,
            chart,
            options,
            chartOptions,
            refreshMs,
            clearMs,
            dataUrl,
            dataStamp,
            realtimeEnabled,
            animation,
            ajaxObj,
            clearChart,
            requestData;

        // In case data was set during construction, both the state-change capture events can happen to be fired before
        // even them being registered. Hence, a special check is made here.
        if (state.dataSetDuringConstruction && !state.rtStateChanged && state.rtPreInit === undefined) {
            if (chartObj.dataReady()) {
                state.rtStateChanged = true;
                state.rtPreInit = true;
            }
            else {
                state.rtPreInit = false;
            }
        }

        // If the data has not changed then the realtime initialization should not be repeated.
        if (!state.rtStateChanged) {
            return;
        }
        // reset the state changed flag to indicate that drawcomplete will re-work upon next state change.
        state.rtStateChanged = false;

        // Initialize the realtime framework.
        vars = chartObj.jsVars;
        chart = vars && vars.instanceAPI;

        // In case process happens before load
        if (!chart) {
            return;
        }
        options = chart.config || {};
        chartAttr = chart.jsonData && chart.jsonData.chart;
        chartOptions = (options && options.chart) || {};
        refreshMs = (pluckNumber(options.updateInterval, options.refreshInterval) * 1000);
        clearMs = (pluckNumber(options.clearInterval, 0) * 1000);
        dataUrl = options.dataStreamURL;
        realtimeEnabled = Boolean(options && options.realtimeEnabled && (refreshMs > 0) &&
            (dataUrl !== undefined && dataUrl !== '') && chartOptions);

        animation = options && options.plotOptions &&
            options.plotOptions.series.animation &&
            options.plotOptions.series.animation.duration || 0;

        ajaxObj = state._rtAjaxObj;

        clearChart = function () {
            chartObj.clearChart && chartObj.clearChart();
            if (clearMs) {
                state._toClearChart = setTimeout(clearChart, clearMs);
            }
        };

        requestData = function () {
            var url = dataUrl,
                dataStamp = chartAttr && chartAttr.datastamp;
            // append anti-cache querystring to url (a random number)
            url += (dataUrl.indexOf('?') === -1 ? '?num=' : '&num=') + mathRandom();
            // append data stamp to the url
            dataStamp && (url += ('&dataStamp=' + dataStamp));

            // If xhr object is open, then abort it. Probably because previous request did not return on time.
            ajaxObj.open && ajaxObj.abort();
            ajaxObj.get(url); // fetch the URL.
            state._rtAjaxLatencyStart = (new Date());
        };

        if (refreshMs <= 0) {
            state._toRealtime = clearTimeout(state._toRealtime);
            ajaxObj && ajaxObj.abort();
        }
        // validate whether refreshinterval is less than threshold.
        else if (refreshMs < THRESHOLD_MS) {
            refreshMs = THRESHOLD_MS;
        }

        state._toClearChart = clearTimeout(state._toClearChart);
        if (clearMs > 0) {
            if (clearMs < THRESHOLD_MS) {
                clearMs = THRESHOLD_MS;
            }
            else {
                state._toClearChart = setTimeout(clearChart, clearMs);
            }
        }

        state._rtStaticRefreshMS = refreshMs;

        if (realtimeEnabled) {
            if (state._rtPaused === undefined) {
                state._rtPaused = false;
            }
            state._rtDataUrl = dataUrl;
            state.lastSetValues = null;
            ajaxObj = state._rtAjaxObj || (state._rtAjaxObj = new global.ajax());

            ajaxObj.onSuccess = function (responseText, wrapper, data, url) {
                if (chartObj.disposed) {
                    return;
                }

                var iapi = vars.instanceAPI,
                    prevData,
                    feedData = iapi.feedData,
                    logic = {},
                    updateObj = {},
                    config = iapi.config,
                    redrawLatency;
                // Update latency timer
                state._rtAjaxLatencyStart && (state._rtAjaxLatency = (new Date()) - state._rtAjaxLatencyStart);

                if (feedData && config.realtimeEnabled && dataUrl) {

                    dataStamp = updateObj.dataStamp ?
                                updateObj.dataStamp : null;

                    // this is done for animation duration
                    updateObj.interval = refreshMs < 1000 ? refreshMs : 1000;
                    prevData = iapi._getPrevData();
                    iapi.feedData(responseText, true, url, (state._rtAjaxLatency || 0));
                    // if (chart.realtimeUpdate) {
                    //     chart.realtimeUpdate(updateObj);
                    // }
                    // else {
                    //     logic.realtimeUpdate(updateObj);
                    // }
                    // vars._rtLastUpdatedData = logic.multisetRealtime ? updateObj : chartObj.getDataJSON();

                    // Calculate combined latency for realtime drawing
                    redrawLatency = (logic.realtimeDrawingLatency || 0) + (state._rtAjaxLatency || 0);


                    /* This event is raised every time a real-time chart or gauge updates  itself  with new data. This
                     * event is raised in any of the following  cases:
                     *
                     * - Real-time update using `dataStreamUrl` attribute.
                     * - Real-time update of Angular gauge or Horizontal Liner gauge using user interaction (through
                     * edit mode).
                     *
                     * @group chart-realtime
                     *
                     * @event FusionCharts#realTimeUpdateComplete
                     * @param {string} data - Chart data as XML or JSON string
                     * @param {object} updateObject - It is the update object.
                     * @param {number} prevData - The previous data values.
                     * @param {number} source - Nature of data load request. Presently its value is 'XmlHttprequest'.
                     * @param {string} url - URL of the data source.
                    */
                    // global.raiseEvent('realtimeUpdateComplete', {
                    //     data: responseText,
                    //     updateObject: updateObj,
                    //     prevData: prevData,
                    //     source: 'XmlHttpRequest',
                    //     url: url,
                    //     networkLatency: state._rtAjaxLatency,
                    //     latency: redrawLatency
                    // }, event.sender);

                    try {
                        /* jshint camelcase: false*/
                        win.FC_ChartUpdated && win.FC_ChartUpdated(event.sender.id);
                        /* jshint camelcase: true*/
                    }
                    catch (err) {
                        setTimeout(function () {
                            throw err;
                        }, 1);
                    }

                    if (!state._rtPaused) {
                        if (redrawLatency >= state._rtStaticRefreshMS) {
                            redrawLatency = state._rtStaticRefreshMS - 1;
                        }
                        // re-issue realtime update.
                        state._toRealtime = setTimeout(requestData, state._rtStaticRefreshMS - redrawLatency);
                    }
                }
                else {
                    state._toRealtime = clearTimeout(state._toRealtime);
                }
            };

            ajaxObj.onError = function (resp, wrapper, data, url) {
                // Update latency timer
                state._rtAjaxLatencyStart && (state._rtAjaxLatency = (new Date()) - state._rtAjaxLatencyStart);

                /**
                 * This event is raised where there is an error in performing a real-time chart data update using
                 * `dataStreamUrl` attribute.
                 *
                 * @event FusionCharts#realTimeUpdateError
                 * @group chart-realtime
                 *
                 * @param {number} source - Nature of data load request. Presently its value is 'XmlHttprequest'.
                 * @param {string} url - URL of the data source.
                 * @param {object} xmlHttpReqestObject - The object which has fetched data.
                 * @param {string} httpStatus - A number which denotes the HTTP status number when the error was raised.
                 * For example, the status will be ``404`` for URL not found.
                 */
                global.raiseEvent('realtimeUpdateError', {
                    source: 'XmlHttpRequest',
                    url: url,
                    xmlHttpRequestObject: wrapper.xhr,
                    error: resp,
                    httpStatus: (wrapper.xhr && wrapper.xhr.status) ? wrapper.xhr.status : -1,
                    networkLatency: state._rtAjaxLatency
                }, event.sender);

                // Upon error, based on whether chart is alive and kicking, re-request the data or abandon realtime
                // calls.
                state._toRealtime = chartObj.isActive() ?
                    setTimeout(requestData, refreshMs) : clearTimeout(state._toRealtime);
            };

            // This is the first (initial) realtime update request to be sent. It is delayed by 0
            //second as now the entire module is handled by logic.js
            if (!state._rtPaused) {
                state._toRealtime = resetTimeout(requestData, 0, state._toRealtime);
            }
        }
    };

    // Clear realtime threads upon data change or re-render.
    global.addEventListener(['beforeDataUpdate', 'beforeRender'], function (event) {
        var chartObj = event.sender,
            state = chartObj.__state;

        chartObj.jsVars && (chartObj.jsVars._rtLastUpdatedData = null); // remove data cache
        // clear all timeouts
        state._toRealtime && (state._toRealtime = clearTimeout(state._toRealtime));
        state._toClearChart && (state._toClearChart = clearTimeout(state._toClearChart));
        state._rtAjaxLatencyStart = null; // clear latency claculations
        state._rtAjaxLatency = null;
    });

    // This is to prevent realtime init routines to be executed on every drawcomplete
    global.addEventListener(['renderComplete', 'dataUpdated'], function (event) {
        var state = event.sender.__state;
        if (state) {
            (state.rtPreInit === undefined) && (state.rtPreInit = false);
            state._rtPaused && delete state._rtPaused;

            if (!state.rtStateChanged) {
                state.rtStateChanged = true;
                // If the event happens to happen while rendering is inprogress, we need to force process.
                processRealtimeStateChange.apply(this, arguments);
            }
        }
    });

    // This is to clear any timeouts pending upon chart disposal.
    global.core.addEventListener('beforeDispose', function (event) {
        var state = event.sender.__state;
        state._toRealtime && (state._toRealtime = clearTimeout(state._toRealtime));
        state._toClearChart && (state._toClearChart = clearTimeout(state._toClearChart));
    });

    global.core.addEventListener('drawComplete', processRealtimeStateChange);
}]);

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
 * @module fusioncharts.renderer.javascript.widgets
 * @export fusioncharts.widgets.js
 *
 * @requires fusioncharts.renderer.javascript.sparkcharts
 * @requires fusioncharts.renderer.javascript.datastreamer
 */

/* jshint ignore: start */
FusionCharts.register('module', ['private', 'modules.renderer.js-widgets', function () {
	var global = this,
		lib = global.hcLib,
		extend2 = lib.extend2,
        toPrecision = lib.toPrecision;
	defaultGaugePaletteOptions = extend2({}, lib.defaultGaugePaletteOptions);


    // Production steps of ECMA-262, Edition 5, 15.4.4.18
    // Reference: http://es5.github.io/#x15.4.4.18
    if (!Array.prototype.forEach) {
        /*jslint freeze: false */


        Array.prototype.forEach = function(callback, thisArg) {

            var T, k, O, len, kValue;

            if (this == null) {
                throw new TypeError(' this is null or not defined');
            }

            // 1. Let O be the result of calling ToObject passing the |this| value as the argument.
            O = Object(this);

            // 2. Let lenValue be the result of calling the Get internal method of O with the argument "length".
            // 3. Let len be ToUint32(lenValue).
            len = O.length >>> 0;

            // 4. If IsCallable(callback) is false, throw a TypeError exception.
            // See: http://es5.github.com/#x9.11
            if (typeof callback !== 'function') {
                throw new TypeError(callback + ' is not a function');
            }

            // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
            if (arguments.length > 1) {
                T = thisArg;
            }

            // 6. Let k be 0
            k = 0;

            // 7. Repeat, while k < len
            while (k < len) {

                // a. Let Pk be ToString(k).
                //   This is implicit for LHS operands of the in operator
                // b. Let kPresent be the result of calling the HasProperty internal
                // method of O with argument Pk.
                //   This step can be combined with c
                // c. If kPresent is true, then
                if (k in O) {

                    // i. Let kValue be the result of calling the Get internal method of O with argument Pk.
                    kValue = O[k];

                    // ii. Call the Call internal method of callback with T as the this value and
                    // argument list containing kValue, k, and O.
                    callback.call(T, kValue, k, O);
                }
                // d. Increase k by 1.
                k++;
            }
            // 8. return undefined
        };
    }

    /**
     * MathExt class bunches a group of mathematical functions
     * which will be used by other classes. All the functions in
     * this class are declared as static, as the methods do not
     * relate to any specific instance.
     * @class MathExt
     * @author FusionCharts Technologies
     * @version 3.0
     *
     * Copyright (C) FusionCharts Technologies
     * @private
     */
    function MathExt () {
    //Nothing to do.
    }

    MathExt.prototype = /** @lends MathExt# */{

        /**
         * numDecimals method returns the number of decimal places provided
         * in the given number.
         *  @param  num Number for which we've to find the decimal places.
         *  @return Number of decimal places found.
         */
        numDecimals: function (num) {
            // Fix for upperLimits or lowerLimits given in decimal
            num = toPrecision(num, 10);
            //Absolute value (to avoid floor disparity for negative num)
            num = Math.abs(num);
            //Get decimals
            var decimal = toPrecision((num-Math.floor(num)), 10),
            //Number of decimals
            numDecimals = (String(decimal).length-2);
            //For integral values
            numDecimals = (numDecimals<0) ? 0 : numDecimals;
            //Return the length of string minus '0.'
            return numDecimals;
        },
        /**
         * toRadians method converts angle from degrees to radians
         * @param   angle   The numeric value of the angle in
         *                  degrees
         * @return          The numeric value of the angle in radians
         */
        toRadians: function (angle) {
            return (angle/180)*Math.PI;
        },
        /**
         * toDegrees method converts angle from radians to degrees
         * @param   angle   The numeric value of the angle in
         *                  radians
         * @returns         The numeric value of the angle in degrees
         */
        toDegrees: function (angle) {
            return (angle/Math.PI)*180;
        },
        /**
         * flashToStandardAngle method converts angles from Flash angle to normal angles (0-360).
         *  @param  ang     Angle to be converted
         *  @return         Converted angle
         */
        flashToStandardAngle: function (ang) {
            return -1*ang;
        },
        /**
         * standardToFlashAngle method converts angles from normal angle to Flash angles
         *  @param  ang     Angle to be converted
         *  @return         Converted angle
         */
        standardToFlashAngle: function (ang) {
            return -1*ang;
        },
        /**
         * flash180ToStandardAngle method changes a Flash angle (-180° to 180°) into standard
         * angle (0° to 360° CCW) wrt the positive x-axis using angle input.
         * @param   ang   Angle in degrees (-180° to 180°).
         * @return          Angle in degrees (0° to 360° CCW).
         **/
        flash180ToStandardAngle: function (ang) {
            var a = 360-(((ang%=360)<0) ? ang+360 : ang);
            return (a==360) ? 0 : a;
        },
        /**
         * getAngularPoint method calculates a point at a given angle
         * and radius from the given point.
         *  @param  fromX       From point's X co-ordinate
         *  @param  fromY       From point's Y co-ordinate
         *  @param  distance    How much distance (pixels) from current point?
         *  @param  angle       At what angle (degrees - standard) from current point
         */
        getAngularPoint: function(fromX, fromY, distance, angle) {
            //Convert the angle into radians
            angle = angle*(Math.PI/180);
            var xPos = fromX+(distance*Math.cos(angle)),
                yPos = fromY-(distance*Math.sin(angle));
            return ({
                x:xPos,
                y:yPos
            });
        },
        /**
         * remainderOf method calculates the remainder in
         * a division to the nearest twip.
         * @param   a   dividend in a division
         * @param   b   divisor in a division
         * @returns     Remainder in the division rounded
         *              to the nearest twip.
         */
        remainderOf: function (a, b) {
            return roundUp(a%b);
        },
        /**
         * boundAngle method converts any angle in degrees
         * to its equivalent in the range of 0 to 360 degrees.
         * @param   angle   Angle in degrees to be procesed;
         *                  can take negetive values.
         * @returns         Equivalent non-negetive angle in degrees
         *                  less than or equal to 360 degrees
         */
        boundAngle: function (angle) {
            if (angle>=0) {
                return MathExt.prototype.remainderOf(angle, 360);
            }
            else {
                return 360-MathExt.prototype.remainderOf(Math.abs(angle), 360);
            }
        },
        /**
         * toNearestTwip method converts a numeric value by
         * rounding it to the nearest twip value ( one twentieth
         * of a pixel ) for propermost rendering in flash.
         * @param   num     Number to rounded
         * @returns         Number rounded upto 2 decimal places and
         *                  second significant digit right of decimal
         *                  point, if exists at all is 5.
         */
        toNearestTwip: function(num) {
            var n = num,
                s = (n<0) ? -1 : 1,
                k = Math.abs(n),
                r = mathRound(k*100),
                b = Math.floor(r/5),
                t = Number(String(r-b*5)),
                m = (t>2) ? b*5+5 : b*5;
            return s*(m/100);
        },
        /**
         * roundUp method is used to format trailing decimal
         * places to the required precision, with default base 2.
         * @param       num     number to be formatted
         * @param       base    number of precision digits
         * @returns     formatted number
         * @private
         */
        roundUp: function (num, base) {
            // precise to number of decimal places
            base = (base === undefined) ? 2 : base;
            var factor = mathPow(10, base);
            num *= factor;
            num = mathRound(Number(String(num)));
            num /= factor;
            return num;
        }
    };

    MathExt.prototype.constructor = MathExt;
    lib.MathExt = MathExt;
	}
]);
FusionCharts.register('module', ['private', 'modules.renderer.js-dataset-funnelpyramidbase',
    function () {
        var global = this,
            lib = global.hcLib,
            COMPONENT = 'component',
            DATASET = 'dataset',
            pluck = lib.pluck,
            pluckNumber = lib.pluckNumber,
            BLANK = lib.BLANKSTRING,
            BLANKSTRING = BLANK,
            preDefStr = lib.preDefStr,
            showHoverEffectStr = preDefStr.showHoverEffectStr,
            convertColor = lib.graphics.convertColor,
            noneStr = 'none',
            extend2 = lib.extend2,
            PXSTRING = 'px',
            fillStr = 'fill',
            NORMALSTRING = 'normal',
            parseUnsafeString = lib.parseUnsafeString,
            getLightColor = lib.graphics.getLightColor,
            COMMASTRING = lib.COMMASTRING,
            ZEROSTRING = lib.ZEROSTRING,
            getValidValue = lib.getValidValue,
            UNDEFINED,
            parseTooltext = lib.parseTooltext,
            setLineHeight = lib.setLineHeight,
            math = Math,
            mathRound = math.round,
            mathCeil = math.ceil,
            mathMax = math.max,
            mathMin = math.min,
            mathPow = math.pow,
            mathSqrt = math.sqrt,
            COMMASPACE = lib.COMMASPACE,
            EMPTY_OBJ = {},
            getDarkColor = lib.graphics.getDarkColor,
            colorStrings = preDefStr.colors,
            COLOR_000000 = colorStrings.c000000,
            configStr = preDefStr.configStr,
            animationObjStr = preDefStr.animationObjStr,
            POSITION_START = preDefStr.POSITION_START,
            POSITION_MIDDLE = preDefStr.POSITION_MIDDLE,
            pathStr = 'path',
            zeroCommaHundredStr = '0,100',
            CRISP = 'crisp',
            win = global.window,
            userAgent = win.navigator.userAgent,
            isIE = /msie/i.test(userAgent) && !win.opera,
            HEXCODE = lib.regex.hexcode,
            TRACKER_FILL = 'rgba(192,192,192,'+ (isIE ? 0.002 : 0.000001) +')',
            dropHash = lib.regex.dropHash,
            POINTER = 'pointer',
            EVENTARGS = 'eventArgs',
            HASHSTRING = lib.HASHSTRING,
            toRaphaelColor = lib.toRaphaelColor,
            plotEventHandler = lib.plotEventHandler,
            isObject = function (obj) {
                return typeof obj === 'object';
            },
            isString = function (s) {
                return typeof s === 'string';
            },
            defined = function  (obj) {
                return obj !== UNDEFINED && obj !== null;
            },
            M = 'M',
            A = 'A',
            L = 'L',
            Z = 'Z',
            startsRGBA = lib.regex.startsRGBA,
            /**
             * Handle color operations. The object methods are chainable.
             * @param {string} input The input color in either rbga or hex format
             * @private
             */
            Color = function(input) {
                // declare variables
                var rgba = [], result;

                /**
                * Parse the input color to rgba array
                * @param {string} input
                * @private
                */
                function init(input) {

                    // rgba
                    /* jshint maxlen:200*/
                    result = /rgba\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]?(?:\.[0-9]+)?)\s*\)/.exec(input);
                    /* jshint maxlen:120*/
                    if (result) {
                        rgba = [parseInt(result[1], 10), parseInt(result[2], 10),
                            parseInt(result[3], 10), parseFloat(result[4])];
                    }

                    // hex
                    else {
                        result = /#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/.exec(input);
                        if (result) {
                            rgba = [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16), 1];
                        }
                    }

                }
                /**
                * Return the color a specified format
                * @param {string} format
                * @private
                */
                function get(format) {
                    var ret;

                    // it's NaN if gradient color on a column chart
                    if (rgba && !isNaN(rgba[0])) {
                        if (format === 'rgb') {
                            ret = 'rgb('+ rgba[0] +','+ rgba[1] +','+ rgba[2] +')';
                        /**^
                         * capability to return hex code
                         */
                        } else if (format === 'hex') {
                            ret = '#' + (COLOR_000000 +
                              (rgba[0] << 16 | rgba[1] << 8 | rgba[2]).toString(16)).slice(-6);
                        } else if (format === 'a') {
                            /*EOP^*/
                            ret = rgba[3];
                        } else {
                            ret = 'rgba('+ rgba.join(',') +')';
                        }
                    }else {
                        ret = input;
                    }
                    return ret;
                }

                /**
                 * Brighten the color
                 * @param {number} alpha
                 * @private
                 */
                function brighten(alpha) {
                    if (!isNaN(alpha) && alpha !== 0) {
                        var i;
                        for (i = 0; i < 3; i++) {
                            rgba[i] += parseInt(alpha * 255, 10);

                            if (rgba[i] < 0) {
                                rgba[i] = 0;
                            }
                            if (rgba[i] > 255) {
                                rgba[i] = 255;
                            }
                        }
                    }
                    return this;
                }
                /**
                 * Set the color's opacity to a given alpha value
                 * @param {number} alpha
                 * @private
                 */
                function setOpacity(alpha) {
                    rgba[3] = alpha;
                    return this;
                }

                // initialize: parse the input
                init(input);

                // public methods
                return {
                    get: get,
                    brighten: brighten,
                    setOpacity: setOpacity
                };
            };


        FusionCharts.register(COMPONENT, [DATASET, 'FunnelPyramidBase', {
            type: 'funnelpyramidbase',

            pIndex: 2,

            customConfigFn: '_createDatasets',

            init : function (datasetJSON) {
                var datasetDefStore = this,
                    utils = datasetDefStore.utils(datasetDefStore),
                    invokeHookFns = utils.invokeHookFns,
                    postInitHookFn = datasetDefStore.postInitHook;

                if (!datasetJSON) {
                    // If for some reason the json data is not passed return to the caller.
                    return false;
                }

                // Utils needs to be context to be set before using it.
                // utils.setContext(datasetDefStore);

                // Saves reference of input data
                datasetDefStore.JSONData = datasetJSON;
                // Stub for saving all the child component
                datasetDefStore.components = { };
                // Stub for saving all the computed configuration
                datasetDefStore.conf ={ };
                // Stub for saving all the graphics component
                datasetDefStore.graphics = { };

                // Post initialization hook if any charts need any specific case where there has to be special operation
                // to be performed after init method is called but before configure.
                invokeHookFns(postInitHookFn);

                datasetDefStore.configure();
            },

            removeData: function () {},

            _configure : function () {
                var datasetStore = this,
                    chart = datasetStore.chart,
                    chartComponents = chart.components,
                    colorManager = chartComponents.colorManager,
                    chartConfig = chart.config,
                    globalStyle = chartConfig.style,
                    dataStoreComponent = datasetStore.components,
                    datasetConf = datasetStore.conf || {},
                    jsonDataObj = datasetStore.JSONData,
                    datasetDataArr = jsonDataObj.data || [],
                    chartAttr = chart.jsonData ? chart.jsonData.chart : {},
                    utils = datasetStore.utils(datasetStore),
                    invokeHookFns = utils.invokeHookFns,
                    copyProperties = utils.copyProperties,
                    setLineHeight = lib.setLineHeight,
                    heightAllotted = chartConfig.canvasHeight,
                    BLANK_SPACE = 3,
                    DEFAULT_LABEL_DISTANCE = 50,
                    DEFAULT_BLANK_SPACE = 3,
                    configureSpecificsFn = datasetStore.configureSpecifics,
                    preDrawingHook = datasetStore.preDrawingHook,
                    baseFontColor = colorManager.getColor ('baseFontColor');

                // Parse all the attributes common to pyramid and funnel
                copyProperties(chartAttr, datasetConf, [
                    ['showlabels', 'showLabels', pluckNumber, 1],
                    ['showvalues', 'showValues', pluckNumber, 1],
                    ['plottooltext', 'toolText', pluck, BLANK],
                    ['enableslicing', 'enableSlicing', pluckNumber, 1],
                    ['plotfillalpha', 'plotFillAlpha', pluckNumber, 100],
                    ['showplotborder', 'showPlotBorder', pluckNumber, 0],
                    ['plotborderalpha', 'plotBorderAlpha', pluckNumber, undefined],
                    ['plotbordercolor', 'plotBorderColor', pluck, undefined],
                    ['plotborderthickness', 'plotBorderThickness', pluckNumber, 1],
                    ['showshadow', 'showShadow', pluckNumber, 1],
                    ['showhovereffect', showHoverEffectStr, pluckNumber, 0],
                    ['hovercapsepchar', 'hoverCapSepChar', pluck, COMMASPACE],
                    ['tooltipsepchar', 'tooltipSepChar', pluck, '$hoverCapSepChar'],
                    ['labelsepchar', 'labelSepChar', pluck, '$tooltipSepChar'],
                    ['showpercentintooltip', 'showPercentInToolTip', pluckNumber, 1],
                    ['showpercentvalues', 'showPercentValues', pluckNumber, 0],
                    [BLANK, 'slicingDistance', pluckNumber, (heightAllotted * 0.1)],
                    ['slicingdistance', 'slicingHeight', pluckNumber, '$slicingDistance', function (datasetConf) {
                        if (datasetConf.slicingHeight > 2 * datasetConf.slicingDistance) {
                            datasetConf.slicingDistance = 0;
                        }
                        else {
                            datasetConf.slicingDistance = datasetConf.slicingHeight;
                        }
                    }],
                    [BLANK, 'blankSpace', pluckNumber, BLANK_SPACE],
                    ['labeldistance', 'labelDistance', pluckNumber, DEFAULT_LABEL_DISTANCE],
                    ['issliced', 'isSliced', pluckNumber, 0],
                    ['is2d', 'is2d', pluckNumber, 0],
                    [BLANK, 'blankSpace', pluckNumber, DEFAULT_BLANK_SPACE],
                    ['showlabelsatcenter', 'showLabelsAtCenter', pluckNumber, 0],
                    ['smartlinethickness', 'connectorWidth', pluckNumber, 1],
                    ['smartlinealpha', 'connectorAlpha', pluckNumber, 100],
                    ['smartlinecolor', 'rawSmartLineColorCode', pluck, function () {
                        return colorManager.getColor('baseFontColor');
                    }],
                    ['labelalpha', 'labelAlpha', pluckNumber, 100],
                    ['basefont', 'baseFont', pluck, 'Verdana,sans'],
                    ['basefontsize', 'baseFontSize', pluckNumber, 10],
                    ['basefontcolor', 'baseFontColor', pluck, baseFontColor],
                    ['labelfontcolor', 'labelFontColor', pluck, '$baseFontColor'],
                    ['showtooltip', 'showTooltip', pluckNumber, 1],
                    ['percentofprevious', 'percentOfPrevious', pluckNumber, 0],
                    ['animationduration', 'animationDuration', pluckNumber, 1, function (datasetConf) {
                        datasetConf.animationDuration *= 1000;
                    }]
                ]);

                datasetConf.connectorColor = convertColor(datasetConf.rawSmartLineColorCode,
                        datasetConf.connectorAlpha);

                // Calculate the line height with the style applied in chart level
                setLineHeight(globalStyle);
                // Get only the starting digits from the line height string. This is a temprary property.
                globalStyle.nLineHeight = (globalStyle.lineHeight.match(/^\d+/))[0];

                copyProperties(globalStyle, datasetConf, [
                    [BLANK, 'lineHeight', pluckNumber, datasetConf.baseFontSize]
                ]);

                // Detele the property as it was created for computation purpose only.
                delete globalStyle.nLineHeight;

                // Call function for specific configuration partucular to a chart.
                invokeHookFns(configureSpecificsFn);

                if (!datasetConf.showLabels && !datasetConf.showValues) {
                    // If the labels and values both are disabled, refrain from plotting the datalabels.
                    // This is a flag that let the drawing components know about the user choice.
                    datasetConf.datalabelDisabled = true;
                } else {
                    datasetConf.datalabelDisabled = false;
                }

                // Normalize the data set. This process handles all the parseInt, parseFloat like methods, computes
                // additional keys if necessary
                dataStoreComponent.data = datasetStore.getNormalizeDataSet(datasetDataArr);

                // Call functions that are to be executed before the drawing starts.
                invokeHookFns(preDrawingHook);
            },

            _checkValidData: function (data) {
                var datasetDefStore = this,
                    chart = datasetDefStore.chart;

                if (!(data && data.length)) {
                    chart.setChartMessage();
                    return false;
                }

                return true;
            },

            addLegend : function () {
                var dataSet = this,
                    chart = dataSet.chart,
                    chartAttr = chart.jsonData.chart,
                    i,
                    dataObj,
                    data = dataSet.JSONData.data,
                    legend = chart.components.legend;

                legend.emptyItems();
                for (i = 0; i < data.length; i += 1) {
                    dataObj = data[i];

                    if (dataObj.pseudoPoint) {
                        continue;
                    }

                    dataObj.legendItemId = legend.addItems(dataSet, undefined, {
                        type: dataSet.type,
                        label: dataObj.label,
                        index: i,
                        enabled: pluckNumber(chartAttr.includeinlegend, 1),
                        legendItemId: dataObj.legendItemId
                    });
                }
            },

            getNormalizeDataSet : function(dataArr, options) {
                var datasetStore = this,
                    Point = datasetStore.getPointInContext(),
                    chart = datasetStore.chart,
                    conf = datasetStore.conf,
                    chartComponents = chart.components,
                    numberFormatter = chartComponents.numberFormatter,
                    smartLabel = datasetStore.chart.linkedItems.smartLabel,
                    colorManager = chartComponents.colorManager,
                    index, dataObj,
                    filteredData = [],
                    refreshedData,
                    stubFn, hasValidPoint, highestValue,
                    sumValue = 0,
                    countPoint = 0,
                    sum, refreshedDataLength, dataValue, prevValue, name, smartTextObj,
                    noOFSlicedElement = 0, pointSliced, pValue, formatedVal, labelText,
                    displayValueText, displayValue, toolText, ttValue, filteredDataObj,
                    showPercentValues = conf.showPercentValues,
                    labelSepChar = conf.labelSepChar,
                    chartAttr = chart.jsonData.chart,
                    isSliced = conf.isSliced,
                    plotColor, plotAlpha, plotBorderColor, plotBorderAlpha,
                    pointShadow = {
                        apply: conf.showShadow,
                        opacity: 1
                    },
                    tooltipOptions, defStyle, hoverEffects, displayValueArgs,
                    plotBorderWidth = conf.plotBorderThickness,
                    dataConnectorStyle = conf.dataConnectorStyle = {},
                    colorIndexStart = chart.config.PLOT_COLOR_INDEX_START,
                    res,
                    legendItemId,
                    colorApplied,
                    legendColor;

                function extractTextStyle (dataObj) {
                    var keyMap = {
                            'labelfont' : 'fontFamily',
                            'labelfontcolor' : 'color',
                            'labelfontsize' : 'fontSize',
                            'labelfontbold' : 'fontWeight',
                            'labelfontitalic': 'fontStyle'
                        },
                        style,
                        key;

                    for (key in keyMap) {
                        if (!(key in dataObj)) { continue; }

                        style = style || {};
                        style[keyMap[key]] = dataObj[key];
                    }

                    if (!style) { return style; }

                    if (style.fontWeight) {
                        style.fontWeight = pluckNumber(style.fontWeight) ? 'bold' : 'normal';
                    }

                    if (style.fontStyle) {
                        style.fontStyle = pluckNumber(style.fontStyle) ? 'italic' : 'normal';
                    }

                    return style;
                }

                extend2((defStyle = conf.style = {}), chart.config.style);

                defStyle.borderDash = noneStr;
                defStyle.borderPadding = 2;
                defStyle.borderRadius = 0;
                defStyle.borderThickness = 1;
                defStyle.color = convertColor(conf.labelFontColor, conf.labelAlpha);
                defStyle.fontFamily = conf.baseFont;
                defStyle.fontSize = conf.baseFontSize + PXSTRING;
                defStyle.fontStyle = NORMALSTRING;
                defStyle.fontWeight = NORMALSTRING;

                dataConnectorStyle.connectorWidth = conf.connectorWidth;
                dataConnectorStyle.connectorColor = conf.connectorColor;


                options = options || {};
                stubFn = options.getEmptyStubObject;

                res = datasetStore.datasetCalculations(dataArr);
                hasValidPoint = res.hasValidPoint;
                refreshedData = res.refreshedData;
                sumValue = res.sumValue;
                countPoint = res.countPoint;
                highestValue = res.highestValue;

                datasetStore._chartLevelAttr = lib.parsexAxisStyles({}, {}, chartAttr, defStyle);

                if (hasValidPoint) {
                    conf.sumValue = sumValue;

                    sum = numberFormatter.dataLabels(sumValue);
                    refreshedDataLength = refreshedData.length;
                    smartLabel.useEllipsesOnOverflow(chart.config.useEllipsesWhenOverflow);

                    for (index = 0; index < refreshedDataLength; index += 1) {
                        dataObj = refreshedData[index];

                        legendItemId = dataObj.legendItemId;
                        dataValue = dataObj.cleanValue;
                        prevValue = index ? refreshedData[index - 1].value : dataValue;
                        name = parseUnsafeString(pluck(dataObj.label, dataObj.name, BLANKSTRING));

                        smartTextObj = smartLabel.getOriSize(name);

                        plotAlpha = dataObj.alpha || conf.plotFillAlpha;

                        colorApplied = pluck(dataObj.color, colorManager.getPlotColor(colorIndexStart++));
                        legendColor = convertColor(colorApplied);
                        plotColor = convertColor(colorApplied, plotAlpha);

                        plotBorderColor = pluck(dataObj.bordercolor, conf.plotBorderColor,
                            getLightColor(colorApplied, 25)).split(COMMASTRING)[0];

                        plotBorderAlpha = !conf.showPlotBorder ?  ZEROSTRING :
                            pluck(dataObj.borderalpha, conf.plotBorderAlpha, '80');


                        pointShadow.opacity = Math.max(plotAlpha, plotBorderAlpha) / 100;

                        pointSliced = pluckNumber(dataObj.issliced, isSliced);
                        if (pointSliced) {
                            noOFSlicedElement += 1;
                            conf.preSliced = pointSliced;
                        }

                        if (res.prevPerValReq) {
                            sumValue = prevValue;
                        }

                        pValue = numberFormatter.percentValue(dataValue / sumValue * 100);
                        if(!conf.datalabelDisabled) {
                            formatedVal = numberFormatter.dataLabels(dataValue) || BLANKSTRING;

                            labelText = conf.showLabels === 1 ? name : BLANKSTRING;

                            displayValueText = pluckNumber(dataObj.showvalue, conf.showValues) === 1 ?
                                (showPercentValues === 1 ? pValue : formatedVal ) : BLANKSTRING;

                            displayValue = getValidValue(parseUnsafeString(dataObj.displayvalue));

                            displayValueArgs = pluck(displayValue, name + labelSepChar + (showPercentValues ? pValue :
                                formatedVal), BLANKSTRING);

                            if (displayValue) {
                                displayValueText = displayValue;
                            } else {
                                if (displayValueText !== BLANKSTRING && labelText !== BLANKSTRING) {
                                    displayValueText = labelText + labelSepChar + displayValueText;
                                }
                                else {
                                    displayValueText = pluck(labelText, displayValueText) || BLANKSTRING;
                                }
                            }
                        }

                        toolText = getValidValue(parseUnsafeString(pluck(dataObj.tooltext, conf.toolText)));

                        if (toolText !== undefined) {
                            tooltipOptions = {
                                formatedVal : formatedVal,
                                name : name,
                                pValue : pValue,
                                sum : sum,
                                sumValue : sum,
                                dataValue: dataValue,
                                prevValue: prevValue,
                                highestValue: highestValue
                            };

                            toolText = parseTooltext(toolText, [1,2,3,7,14,24,25,37],
                                datasetStore.getTooltipMacroStub(tooltipOptions), dataObj, chartAttr);
                        }
                        else {
                            ttValue = conf.showPercentInToolTip === 1 ? pValue : formatedVal;
                            toolText = name !== BLANKSTRING ? name + conf.tooltipSepChar + ttValue : ttValue;
                        }

                        hoverEffects = datasetStore.pointHoverOptions(dataObj, {
                            color: colorApplied,
                            alpha: plotAlpha,
                            borderColor: plotBorderColor,
                            borderAlpha: plotBorderAlpha,
                            borderWidth: plotBorderWidth
                        });

                        filteredDataObj = {
                            displayValue: displayValueText,
                            displayValueArgs: displayValueArgs,
                            style: lib.parsexAxisStyles(dataObj, {}, chartAttr, defStyle, plotColor),
                            appliedStyle: extractTextStyle(dataObj),
                            name: name,
                            categoryLabel: name,
                            rawColor: colorApplied,
                            rawAlpha: plotAlpha,
                            toolText: toolText,
                            legendCosmetics: undefined,
                            legendItemId: legendItemId,
                            showInLegend: undefined,
                            y: dataValue,
                            shadow: pointShadow,
                            smartTextObj: smartTextObj,
                            legendColor: legendColor,
                            color: plotColor,
                            alpha: plotAlpha,
                            borderColor: convertColor(plotBorderColor, plotBorderAlpha),
                            borderWidth: plotBorderWidth,
                            link : getValidValue(dataObj.link),
                            isSliced : pointSliced,
                            doNotSlice: !conf.enableSlicing,
                            hoverEffects: hoverEffects.enabled && hoverEffects.options,
                            rolloverProperties: hoverEffects.enabled && hoverEffects.rolloverOptions
                        };

                        filteredData.push(new Point(filteredDataObj));
                    }
                }

                conf.noOFSlicedElement = noOFSlicedElement;
                return filteredData;
            },

            datasetCalculations : function (dataArr) {
                var datasetStore = this,
                    chart = datasetStore.chart,
                    chartComponents = chart.components,
                    numberFormatter = chartComponents.numberFormatter,
                    index, length, dataObj, itemValue, res = {};

                res.refreshedData = [];
                res.sumValue = res.countPoint = 0;
                res.highestValue = Number.NEGATIVE_INFINITY;

                for (index = 0, length = dataArr.length; index < length; index++) {
                    dataObj = dataArr[index];

                    if (dataObj.vline) {
                        // Funnel or pyramid does not use vline. Ignoring the same if user put it mistakenly.
                        continue;
                    }

                    dataObj.cleanValue = itemValue = Math.abs(numberFormatter.getCleanValue(dataObj.value, true));
                    if (itemValue !== null) {
                        // If a valid value is provided in the configuration
                        res.hasValidPoint = true;
                        res.highestValue = res.highestValue || itemValue;
                        res.refreshedData.push(dataObj);
                        res.sumValue += itemValue;
                        res.countPoint += 1;
                        res.highestValue = Math.max(res.highestValue, res.itemValue);
                    }
                }

                return res;
            },

            pointHoverOptions: function (dataObj, pointCosmetics) {
                var datasetStore = this,
                    conf = datasetStore.conf,
                    chart = datasetStore.chart,
                    hoverEffect = pluckNumber(dataObj.showhovereffect, conf.showHoverEffect),
                    hoverEffects = {
                        enabled: hoverEffect
                    },
                    rolloverProperties = {},
                    highlightColors,
                    colorLen,
                    index,
                    chartAttr = chart.jsonData ? chart.jsonData.chart : {};

                // Detect whether any of the hover effect attributes are explicitly set or not
                // Enable hover effect when any of the hover attributes are explicitly set
                if (!hoverEffect) {
                    hoverEffect = hoverEffects.enabled = pluck(dataObj.hovercolor,
                        chartAttr.plotfillhovercolor, dataObj.hoveralpha, chartAttr.plotfillhoveralpha,
                        dataObj.borderhovercolor, chartAttr.plotborderhovercolor,
                        dataObj.borderhoverthickness, chartAttr.plotborderhoverthickness,
                        dataObj.borderhoveralpha, chartAttr.plotborderhoveralpha) !== UNDEFINED;
                }

                if (hoverEffect) {
                    // Parse hover attributes
                    hoverEffects.highlight = pluckNumber(dataObj.highlightonhover,
                        chartAttr.highlightonhover);
                    hoverEffects.color = pluck(dataObj.hovercolor,
                        chartAttr.plotfillhovercolor);
                    hoverEffects.alpha = pluck(dataObj.hoveralpha,
                        chartAttr.plotfillhoveralpha, pointCosmetics.alpha);
                    hoverEffects.borderColor = pluck(dataObj.borderhovercolor,
                        chartAttr.plotborderhovercolor, pointCosmetics.borderColor);
                    hoverEffects.borderThickness = pluckNumber(dataObj.borderhoverthickness,
                        chartAttr.plotborderhoverthickness, pointCosmetics.borderWidth);
                    hoverEffects.borderAlpha = pluck(dataObj.borderhoveralpha,
                        chartAttr.plotborderhoveralpha, pointCosmetics.borderAlpha);

                    // If hover effect is enabled but no hover color is provided, just highlight the default color
                    if (hoverEffects.highlight !== 0  && hoverEffects.color === undefined) {
                        hoverEffects.highlight = 1;
                    }

                    hoverEffects.color = pluck(hoverEffects.color, pointCosmetics.color).replace(/,+?$/, BLANK);

                    if (hoverEffects.highlight === 1) {
                        highlightColors = hoverEffects.color.split(/\s{0,},\s{0,}/);

                        colorLen = highlightColors.length;

                        for (index = 0; index < colorLen; index += 1) {
                            highlightColors[index] = getLightColor(highlightColors[index], 70);
                        }
                        hoverEffects.color = highlightColors.join(',');
                    }

                    rolloverProperties = {
                        color: hoverEffects.color,
                        alpha: +hoverEffects.alpha,
                        borderColor: convertColor(hoverEffects.borderColor,
                            hoverEffects.borderAlpha),
                        borderWidth: hoverEffects.borderThickness
                    };
                }

                return {
                    enabled: hoverEffect,
                    options: hoverEffects,
                    rolloverOptions: rolloverProperties
                };
            },

            getTooltipMacroStub : function (options) {
                return {
                    formattedValue: options.formatedVal,
                    label: options.name,
                    percentValue : options.pValue,
                    sum: options.sum,
                    unformattedSum: options.sumValue
                };
            },

            preDrawingSpaceManagement : function () {
                var datasetStore = this,
                    Point = datasetStore.getPointInContext(),
                    chart = datasetStore.chart,
                    chartConf = chart.config,
                    components = chart.components,
                    caption = components.caption,
                    subCaption = components.subCaption,
                    capHeight = caption.config.height || 0,
                    subCapHeight = subCaption.config.height || 0,
                    conf = datasetStore.conf,
                    showTooltip = conf.showTooltip,
                    slicingDistance = conf.slicingDistance,
                    canvasHeight, canvasMaxWidth,
                    chartWorkingHeight = chartConf.height - (chartConf.marginTop + chartConf.marginBottom),
                    chartWorkingWidth = chartConf.width - (chartConf.marginRight + chartConf.marginLeft),
                    dataArr = datasetStore.components.data,
                    length, labelDistance, showLabelsAtCenter,
                    blankSpace = conf.blankSpace,
                    i = datasetStore.LABEL_PLACEMENT_ITERATOR_INDEX_START,
                    upperRadiusFactor = Point.upperRadiusFactor,
                    minWidthForChart, drawingWillExtend, maxWidthForLabel, useSameSlantAngle,
                    labelMaxUsedWidth, hasPoint, maxValue, valueRadiusIncrementRatio,
                    //sumValues = conf.sumValue,
                    smartLabel = chart.linkedItems.smartLabel,
                    totalValue, point, lineHeight, smartTextObj, chartDrawingWidth,
                    currentValue, ratioK, currentDiameter, labelMaxWidth, extraSpace,
                    newDiameter = 0, lowestRadiusFactor, labelMaxW = 0, tempSnap, labelOverlappingW,
                    utils = datasetStore.utils(datasetStore),
                    gutter = 5,
                    snapOffset,
                    invokeHookFns = utils.invokeHookFns,
                    labelStyle,
                    prePointProcessingHookFn = datasetStore.prePointProcessingHookFn,
                    legend = components.legend,
                    legendWidth = 0,
                    outCanvasSpace = 0;

                if (legend.config.legendPos === 'right') {
                    legendWidth = legend.config.width + 2 * gutter;
                }

                outCanvasSpace += chartConf.oriCanvasLeft = chart.config.canvasLeft;
                chartConf.oriBottomSpace = chart.config.marginBottom;
                chartConf.oriTopSpace = chart.config.marginTop;
                outCanvasSpace += chart.config.canvasRight;

                // For Anotation macros store temp conf
                tempSnap = conf._tempSnap = {
                    top3DSpace : 0,
                    bottom3DSpace : 0,
                    topLabelSpace : 0,
                    rightLabelSpace : 0
                };

                canvasHeight = chartWorkingHeight - slicingDistance;
                canvasMaxWidth = Math.min(2 * canvasHeight, chartWorkingWidth);

                chartConf.marginTop += slicingDistance / 2;
                chartConf.marginBottom += slicingDistance / 2;

                // Find the label maximun width
                length = dataArr.length;
                labelDistance = conf.labelDistance + blankSpace;
                showLabelsAtCenter = conf.showLabelsAtCenter;

                minWidthForChart = Math.min(canvasMaxWidth, chartWorkingWidth * 0.3);
                drawingWillExtend = chartWorkingWidth - minWidthForChart;
                chartWorkingWidth -= legendWidth;
                maxWidthForLabel = chartWorkingWidth - minWidthForChart - labelDistance;
                labelMaxUsedWidth = 0;
                hasPoint = dataArr[0];
                maxValue = hasPoint && dataArr[0].y ? dataArr[0].y : 1;

                valueRadiusIncrementRatio = 0.8 / maxValue;
                useSameSlantAngle = conf.useSameSlantAngle == 1;

                invokeHookFns(prePointProcessingHookFn, [dataArr]);

                totalValue = conf.totalValue || 0;

                smartLabel.useEllipsesOnOverflow(chartConf.useEllipsesWhenOverflow);

                for(;i < length; i += 1) {
                    point = dataArr[i];

                    if (point.legendItemId) {
                        legend.configureItems(point.legendItemId, {
                            configuration: {
                                fillColor: point.legendColor
                            }
                        });
                    }

                    labelStyle = point.style;
                    setLineHeight(labelStyle);
                    lineHeight = pluckNumber(mathCeil(parseFloat(labelStyle.lineHeight) +
                        labelStyle.borderPadding + labelStyle.borderThickness + gutter), 10);
                    smartLabel.setStyle(labelStyle);
                    currentValue = point.y;
                    if (showLabelsAtCenter) {
                        smartTextObj = smartLabel.getSmartText(point.displayValue, chartWorkingWidth, lineHeight);

                    } else {
                        currentValue = (point.getModifiedCurrentValue && point.getModifiedCurrentValue(totalValue)) ||
                                currentValue;

                        ratioK = point.getRatioK(currentValue, valueRadiusIncrementRatio,
                                        totalValue, maxValue);

                        currentDiameter = minWidthForChart * ratioK;
                        labelMaxWidth = maxWidthForLabel + ((minWidthForChart - currentDiameter) / 2);

                        smartTextObj = smartLabel.getSmartText(point.displayValue, labelMaxWidth, lineHeight);
                        point.displayValue = smartTextObj.text;
                        showTooltip && smartTextObj.tooltext && (point.originalText = smartTextObj.tooltext);
                        labelMaxUsedWidth = Math.max(labelMaxUsedWidth, smartTextObj.width);
                        if (drawingWillExtend > 0) {
                            if (smartTextObj.width > 0) {
                                extraSpace = labelMaxWidth - smartTextObj.width;
                            }
                            else {
                                extraSpace = labelMaxWidth +  labelDistance;
                            }
                            newDiameter =  (1 / (ratioK + 1)) * (currentDiameter + 2 * extraSpace + minWidthForChart);

                            drawingWillExtend = Math.min(drawingWillExtend, newDiameter - minWidthForChart);
                        }
                        totalValue += conf.offsetVal === undefined ? point.y :
                            (typeof conf.offsetVal === 'function' ? conf.offsetVal(i) : conf.offsetVal);
                    }
                }


                if (legend.config.legendPos === 'right') {
                    chart.isLegendRight = true;
                    chartConf.marginRight += legendWidth;
                    outCanvasSpace += legendWidth;
                } else {
                    chart.isLegendRight = false;
                }

                if (point) {
                    lowestRadiusFactor = point.getLowestRadiusFactor(maxValue);
                }
                chartDrawingWidth = minWidthForChart + drawingWillExtend;
                if (chartDrawingWidth > canvasMaxWidth) {
                    chartDrawingWidth = canvasMaxWidth;
                }

                totalValue = conf.offsetVal === undefined ? 0 :
                    (typeof conf.offsetVal === 'function' ? conf.offsetVal() : conf.offsetVal);

                // Now we have the actual drawing width for the
                // funnel and pyramid reiterate through the data and find the
                // max label width
                if (!showLabelsAtCenter) {
                    i = datasetStore.LABEL_PLACEMENT_ITERATOR_INDEX_START;
                    for (length = dataArr.length; i < length; i += 1) {
                        point = dataArr[i];
                        currentValue = point.y;

                        currentValue = (point.getModifiedCurrentValue && point.getModifiedCurrentValue(totalValue)) ||
                                currentValue;

                        ratioK = point.getRatioK(currentValue, valueRadiusIncrementRatio, totalValue, maxValue);

                        currentDiameter = chartDrawingWidth * ratioK;
                        labelMaxWidth = maxWidthForLabel + ((minWidthForChart - currentDiameter) / 2) - legendWidth;
                        smartTextObj = smartLabel.getSmartText(point.displayValue, labelMaxWidth, lineHeight);
                        labelMaxW = mathMax(labelMaxW, (currentDiameter * 0.5) + smartTextObj.width + labelDistance);
                        totalValue += conf.offsetVal === undefined ? point.y :
                            (typeof conf.offsetVal === 'function' ? conf.offsetVal() : conf.offsetVal);
                    }
                }

                if (labelMaxUsedWidth > 0) {
                    tempSnap.rightLabelSpace = (chartWorkingWidth - chartDrawingWidth);
                    // Keep the chart at center and find extra space required to place the label
                    labelOverlappingW = labelMaxW - (chartConf.canvasWidth * 0.5);
                    if (labelOverlappingW > 0) {
                        // Adjust the extra space required to place the label
                        chartConf.marginRight += labelOverlappingW;
                        chartConf.marginLeft -= labelOverlappingW;
                    }

                    chartConf.marginRight += tempSnap.rightLabelSpace * 0.5;
                    chartConf.marginLeft += tempSnap.rightLabelSpace * 0.5;
                }
                else {
                    labelDistance = 0;
                }

                conf.labelDistance = conf.connectorWidth = labelDistance;

                if ((showLabelsAtCenter || !labelMaxUsedWidth) && canvasMaxWidth < chartWorkingWidth) {
                    chartConf.marginLeft += (chartWorkingWidth - canvasMaxWidth - labelDistance) * 0.5;
                    chartConf.marginRight += (chartWorkingWidth - canvasMaxWidth - labelDistance) * 0.5;
                }

                if (!conf.is2d) {
                    chartConf.marginTop += tempSnap.top3DSpace =
                      (chartDrawingWidth * conf.yScale * upperRadiusFactor) / 2;
                    chartConf.marginBottom += tempSnap.bottom3DSpace =
                        (chartDrawingWidth * conf.yScale * lowestRadiusFactor) / 2;
                }

                snapOffset = capHeight + subCapHeight + gutter;
                chartConf.gaugeStartX = chartConf.marginLeft;
                chartConf.gaugeStartY = chartConf.marginTop + snapOffset;
                chartConf.gaugeEndX = chartDrawingWidth + chartConf.marginLeft;
                chartConf.gaugeEndY = chartConf.canvasHeight + chartConf.marginTop;
                chartConf.gaugeCenterX = chartConf.gaugeStartX + ((chartConf.gaugeEndX - chartConf.gaugeStartX) / 2) -
                    chartConf.marginLeft / 2;
                chartConf.gaugeCenterY = chartConf.gaugeStartY + ((chartConf.gaugeEndY - chartConf.gaugeStartY) / 2);
                chartConf.plotSemiWidth = (chartConf.canvasWidth - tempSnap.rightLabelSpace) / 2;
                chartConf.canvasCenterX = chartConf.oriCanvasLeft + chartDrawingWidth / 2;
            },

            hide: function (plotArr) {
                var index,
                    length,
                    plot;

                if (!plotArr || plotArr.length === 0) {
                    return;
                }

                for (index = 0, length = plotArr.length; index < length; index++) {
                    plot = plotArr[index];

                    plot.connector && plot.connector.hide();
                    plot.dataLabel && plot.dataLabel.hide();
                    plot.graphic && plot.graphic.hide();
                    plot.trackerObj && plot.trackerObj.hide();
                }
            },

            animateElements: function (elements, subElem, subElemKeys, conditions, callback) {
                var datasetStore = this,
                    chart = datasetStore.chart,
                    animationObj = chart.get(configStr, animationObjStr),
                    animDuration = animationObj.duration,
                    dummyAnimElem = animationObj.dummyObj,
                    dummyAnimObj = animationObj.animObj,
                    animType = animationObj.animType,
                    isPromiseExecuted = false,
                    target,
                    index,
                    length,
                    ele,
                    i,
                    l;

                function promise () {
                    if (isPromiseExecuted) {
                        return;
                    }

                    callback();
                    isPromiseExecuted = true;
                }

                function animate (_t, point) {
                    var ialpha = (point || {}).alpha;

                    ialpha = ialpha === undefined ? conditions.post : {opacity: ialpha};
                    if (!_t) { return; }

                    _t.attr(conditions.pre);
                    _t.animateWith(dummyAnimElem, dummyAnimObj, ialpha, animDuration, animType, promise);
                }

                callback = callback || function () { };
                subElemKeys = subElemKeys || [];

                for (index = 0, length = elements.length; index < length; index++) {
                    ele = elements[index];
                    if (!ele) { continue; }

                    if (!subElemKeys.length) {
                        target = ele;
                        animate(target[subElem], ele.point);
                    } else {
                        for (i = 0, l = subElemKeys.length; i < l; i++) {
                            target = ((elements[index])[subElem])[subElemKeys[i]];
                            animate(target, ele.point);
                        }
                    }
                }
            },

            drawIndividualDataLabel : function (point, index) {
                var datasetStore = this,
                    conf = datasetStore.conf,
                    dataStore = datasetStore.components.data,
                    displayValue = point.displayValue,
                    plotItem = point.plot,
                    labelY = point.labelY,
                    labelX = point.labelX,
                    style = point.style || {},
                    fontSize = pluckNumber(parseInt(style.fontSize, 10), conf.baseFontSize),
                    lineHeight = conf.lineHeight,
                    yShift = fontSize * 0.3,
                    yDisplacement = lineHeight * 0.3,
                    connectorStartY, connectorEndY, lastConnectorEndY,
                    showLabelsAtCenter = conf.showLabelsAtCenter,
                    connectorEndSwitchHistoryY = conf.connectorEndSwitchHistoryY,
                    connectorEndX, connectorStartX,
                    labelDistance = conf.labelDistance,
                    blankSpace = conf.blankSpace,
                    connectorPath, yD,
                    streamLinedData = conf.streamLinedData;

                if (!showLabelsAtCenter) {
                    connectorStartY = labelY - yShift - (point.distributionFactor * lineHeight);
                    connectorEndY = labelY - yShift;
                    lastConnectorEndY = connectorEndSwitchHistoryY[point.alignmentSwitch];

                    if (conf.lastplotY !== undefined && lastConnectorEndY !== undefined &&
                        lastConnectorEndY - connectorEndY < lineHeight) {
                        connectorEndY = lastConnectorEndY - lineHeight;
                        labelY = connectorEndY;
                    }

                    point.displayValue && (connectorEndSwitchHistoryY[point.alignmentSwitch] = connectorEndY);
                    conf.lastplotY = point.plotY;

                    if(conf.labelAlignment === conf.alignmentType.alternate){
                        if(point.alignmentSwitch){
                            connectorEndX = labelX + blankSpace + point.virtualWidth;
                            connectorStartX = connectorEndX + labelDistance +
                            (point.distributionFactor * conf.globalMinXShift);
                        }else{
                            connectorEndX = labelX - blankSpace;
                            connectorStartX = connectorEndX - (labelDistance - (point.lOverflow || 0)) -
                            (point.distributionFactor * conf.globalMinXShift);
                        }
                    }else{
                        connectorEndX = labelX - blankSpace;
                        connectorStartX = connectorEndX - (labelDistance - (point.lOverflow || 0)) -
                        (point.distributionFactor * conf.globalMinXShift);
                    }

                    // Drawing the connector for labels
                    // Check if the label is not blank and,
                    // label is not the first label of Funnel Chart
                    if ((typeof displayValue !== 'undefined' && displayValue !== BLANKSTRING) &&
                        !(index === 0 && streamLinedData)) {
                        connectorPath = [M, connectorStartX, connectorStartY, L, connectorEndX, connectorEndY];

                        plotItem.connector.attr({
                            path: connectorPath,
                            'shape-rendering': (connectorStartY === connectorEndY) && connectorEndY < 1 ? CRISP : BLANK
                        }).show();
                    } else {
                        plotItem.connector && plotItem.connector.hide();
                    }

                    if (index === 0 && streamLinedData) {
                        yD = (labelY + (dataStore[1].plot.dy || 0));
                    }
                    else {
                        yD = (connectorEndY + (plotItem.dy || 0));
                    }

                    if (displayValue !== BLANKSTRING) {
                        plotItem.dataLabel.transform('t' + labelX + COMMASTRING + yD).show();
                    } else {
                        plotItem.dataLabel && plotItem.dataLabel.hide();
                    }
                } else {
                    if (index === 0 && streamLinedData) {
                        // access to the first plot item
                        yD = (labelY - yDisplacement + (dataStore[1].plot.distanceAvailed || 0));
                    }
                    else {
                        yD = (labelY - yDisplacement + (plotItem.distanceAvailed || 0));
                    }

                    if (displayValue !== BLANKSTRING) {
                        plotItem.dataLabel.transform('t' + labelX +','+ yD).show();
                    } else {
                        plotItem.dataLabel && plotItem.dataLabel.hide();
                    }
                }

                plotItem.dataLabel.attr({'text-bound': [style.backgroundColor, style.borderColor, style.borderThickness,
                    style.borderPadding, style.borderRadius, style.borderDash]});
            },

            drawAllLabels: function () {
                var datasetStore = this,
                    chart = datasetStore.chart,
                    chartGraphics = chart.graphics,
                    plotItems = datasetStore.graphics.plotItems,
                    labelDrawingConfigArr = datasetStore.labelDrawingConfig,
                    dataLabelsGroup = chartGraphics.datalabelsGroup,
                    removeCSSProps = ['fontFamily', 'fontSize', 'fontWeight', 'fontStyle'],
                    groupLabelCssProps = removeCSSProps,
                    groupLabelCss = {},
                    paper = chart.components.paper,
                    conf = datasetStore.conf,
                    labelDrawingConfig,
                    plotItem,
                    setLink,
                    actions,
                    point,
                    value,
                    dlElem,
                    index,
                    length,
                    attr;

                // Extract the required css from the list of css (guard for IE)
                for (index = 0, length = groupLabelCssProps.length; index < length; index++) {
                    attr = groupLabelCssProps[index];

                    if (attr in datasetStore._chartLevelAttr) {
                        groupLabelCss[attr] = datasetStore._chartLevelAttr[attr];
                    }
                }

                chartGraphics.datalabelsGroup.css(groupLabelCss);

                for (index = labelDrawingConfigArr.length - 1; index > -1; index--) {
                    labelDrawingConfig = labelDrawingConfigArr[index];
                    point = labelDrawingConfig.point;
                    setLink = !!point.link;
                    value = point.y;

                    // temporary fix till the time fill is inherited from the parent nodes in VML
                    if (labelDrawingConfig.args && labelDrawingConfig.css) {
                        labelDrawingConfig.args.fill = labelDrawingConfig.css.color || labelDrawingConfig.css.fill;
                    }

                    if (value === null || value === undefined || !point.shapeArgs) {
                        if (plotItems[index]) {
                            point.plot = plotItems[index];
                            dlElem = point.plot.dataLabel;

                            dlElem.removeCSS(removeCSSProps);
                            dlElem && dlElem.attr(labelDrawingConfig.args).css(labelDrawingConfig.css);
                        } else {
                            point.plot = plotItems[index] = {
                                dataLabel : paper.text(labelDrawingConfig.args, labelDrawingConfig.css, dataLabelsGroup)
                            };
                        }

                        datasetStore.drawIndividualDataLabel(point, index);
                        continue;
                    }

                    if (!((plotItem = plotItems[index]) && plotItem.dataLabel)) {
                        point.plot.dataLabel = plotItem.dataLabel = paper.text(labelDrawingConfig.args,
                            labelDrawingConfig.css, dataLabelsGroup);

                        if (!conf.showLabelsAtCenter || !(index === 0 && conf.streamLinedData)) {
                            plotItem.connector = paper.path(dataLabelsGroup);
                        }
                    } else {
                        plotItem.dataLabel.removeCSS(removeCSSProps);
                        plotItem.dataLabel.attr(labelDrawingConfig.args).css(labelDrawingConfig.css);
                    }

                    plotItem.dataLabel.tooltip(point.originalText);

                    plotItem.connector && plotItem.connector.attr({
                        'stroke-width': conf.dataConnectorStyle.connectorWidth,
                        stroke: conf.dataConnectorStyle.connectorColor,
                        ishot: true,
                        cursor: setLink ? POINTER : BLANK,
                        transform: labelDrawingConfig.transform
                    });

                    actions = labelDrawingConfig.actions;
                    !point.doNotSlice && plotItem.dataLabel.click(actions.click, labelDrawingConfig.context);
                    plotItem.dataLabel.hover(actions.hover[0], actions.hover[1]);

                    plotItem.dataLabel.attr({
                        transform: labelDrawingConfig.transform
                    });

                    datasetStore.drawIndividualDataLabel(point, index);
                }
            },

            drawAllTrackers: function () {
                var datasetStore = this,
                    trackerArgs = datasetStore.trackerArgs,
                    index,
                    length;


                for (index = 0, length = trackerArgs.length; index < length; index++) {
                    datasetStore.drawTracker(trackerArgs[index]);
                }
            },

            drawTracker: function(set) {
                var datasetStore = this,
                chart = datasetStore.chart,
                renderer = chart.components.paper,
                trackerGroup = chart.graphics.trackerGroup,
                shapeArgs,
                trackerObj,
                trackerLabel = +new Date(),
                point,
                eventArgs;

                point = set.plot;
                if (! point) { return; }
                trackerObj = point.trackerObj;

                if (point.graphic) {
                    shapeArgs = point.graphic.Shapeargs.silhuette;

                    eventArgs = {
                        link: set.link,
                        value: set.y,
                        displayValue: set.displayValueArgs,
                        categoryLabel: set.categoryLabel,
                        dataIndex: point.index || BLANK,
                        toolText: set.toolText
                    };
                    set.datasetIndex = point.index;
                    if (trackerObj) {
                        trackerObj.attr({
                            path: shapeArgs,
                            isTracker: trackerLabel,
                            fill: TRACKER_FILL,
                            stroke: noneStr,
                            transform: 't0,' + (point._startTranslateY || 0),
                            ishot: true,
                            cursor: point.cursor
                        });

                    } else {
                        trackerObj = point.trackerObj = renderer.path(shapeArgs, trackerGroup)
                            .attr({
                                isTracker: trackerLabel,
                                fill: TRACKER_FILL,
                                stroke: noneStr,
                                transform: 't0,' + (point._startTranslateY || 0),
                                ishot: true,
                                cursor: point.cursor
                            });
                    }
                    trackerObj.data(EVENTARGS, eventArgs);
                    trackerObj.show();
                }
            },

            calculatePositionCoordinate : function (dataArr, placeOtherSide) {
                var datasetStore = this,
                    conf = datasetStore.conf,
                    maxValue = conf.maxValue,
                    is2d = conf.is2d,
                    x = conf.x,
                    plotItemArr = datasetStore.graphics.plotItems || [],
                    chart = datasetStore.chart,
                    chartConfig = chart.config,
                    y = chartConfig.canvasTop,
                    unitHeight = conf.unitHeight,
                    drawingRadius = conf.drawingRadius,
                    labelDistance = conf.labelDistance,
                    showLabelsAtCenter = conf.showLabelsAtCenter,
                    isHollow = conf.isHollow,
                    fontSize = chartConfig.style.fontSize,
                    yShift = fontSize * 0.3,
                    yScale = conf.yScale,
                    blankSpace = conf.blankSpace,
                    lastRadius = conf.lastRadius,
                    smartLabel = chart.linkedItems.smartLabel,
                    index, length,
                    totalHeight = 0,
                    point, sliceHeight,
                    lastIndex = dataArr.length - 1,
                    alignmentSwitchToggle = false,
                    distributionOffset = 0,
                    labelMeasurement, newRadius,
                    negativeSpanningDataEnd,
                    normalizedLabel,
                    lineHeight = conf.lineHeight,
                    widthHeightRatio = 0.8 / chartConfig.effCanvasHeight,
                    chartWidth = chart.config.width - 2,
                    streamlinedData = conf.streamLinedData,
                    // Base of the  maximum trimmed label.
                    trimmedInfo = {
                        flag: false,
                        point: undefined,
                        sLabel: undefined,
                        setAll: function(flag, point, sLabel){
                            this.flag = flag;
                            this.point = point;
                            this.sLabel = sLabel;
                        }
                    },
                    // Base of the maximum spanned labels
                    largestLabel = {
                        point: undefined,
                        sLabel: undefined,
                        set: function(calcFn, predicate){
                            var _calcFn = calcFn,
                                _predicate = predicate;
                            return function(point, sLabel){
                                var existingLabelSpan,
                                    currentLabelSpan;
                                if(point.dontPlot){
                                    return;
                                }

                                if(!(this.point && this.sLabel)){
                                    this.point = point;
                                    this.sLabel = sLabel;
                                    return;
                                }
                                existingLabelSpan = _calcFn(this.point, this.sLabel);
                                currentLabelSpan = _calcFn(point, sLabel);
                                if(_predicate(existingLabelSpan, currentLabelSpan)){
                                    this.point = point;
                                    this.sLabel = sLabel;
                                    return;
                                }
                            };
                        }
                    },
                    leftTrimmedInfo = {},
                    rightTrimmedInfo = {},
                    lLargestLabel = {},
                    rLargestLabel = {},
                    extraConnectorSpace, xPos,
                    slicingGapPosition = conf.slicingGapPosition = {};

                global.extend(leftTrimmedInfo, trimmedInfo);
                global.extend(rightTrimmedInfo, trimmedInfo);

                leftTrimmedInfo.setAll = function(flag, point, sLabel){
                    var _point = this.point,
                        _sLabel = this.sLabel,
                        existingLabelSpan,
                        currentLabelSpan;

                    this.flag = flag;
                    if(!(_point && _sLabel)){
                        this.point = point;
                        this.sLabel = sLabel;
                        return;
                    }
                    existingLabelSpan = _point.labelX - (_sLabel.oriTextWidth - _sLabel.width);
                    currentLabelSpan = point.labelX - (sLabel.oriTextWidth - sLabel.width);
                    if(existingLabelSpan > currentLabelSpan){
                        this.point = point;
                        this.sLabel = sLabel;
                    }
                };

                // Override the base class method for labels which are kept right
                rightTrimmedInfo.setAll = function(flag, point, sLabel){
                    var _point = this.point,
                        _sLabel = this.sLabel,
                        existingLabelSpan,
                        currentLabelSpan;

                    this.flag = flag;
                    if(!(_point && _sLabel)){
                        this.point = point;
                        this.sLabel = sLabel;
                        return;
                    }
                    existingLabelSpan = _point.labelX + _sLabel.oriTextWidth;
                    currentLabelSpan = point.labelX + sLabel.oriTextWidth;
                    if(existingLabelSpan < currentLabelSpan){
                        this.point = point;
                        this.sLabel = sLabel;
                    }
                };

                global.extend(lLargestLabel, largestLabel);
                global.extend(rLargestLabel, largestLabel);

                lLargestLabel.set = (function(){
                    return largestLabel.set.apply(lLargestLabel, [function(point){
                        return point.labelX;
                    }, function(existingLabelSpan, currentLabelSpan){
                        return existingLabelSpan > currentLabelSpan ? true : false;
                    }]);
                })();

                rLargestLabel.set = (function(){
                    return largestLabel.set.apply(rLargestLabel, [function(point, sLabel){
                        return point.labelX + sLabel.oriTextWidth;
                    }, function(existingLabelSpan, currentLabelSpan){
                        return existingLabelSpan < currentLabelSpan ? true : false;
                    }]);
                })();

                conf.noOfGap = 0;
                smartLabel.useEllipsesOnOverflow(chartConfig.useEllipsesWhenOverflow);
                for(index = 0, length = dataArr.length; index < length ; index++){
                    point = dataArr[index];
                    if(!point){
                        continue;
                    }
                    point.x = index;
                    if (plotItemArr[index]) {
                        // @todo correct the slicing here
                        point.isSliced = plotItemArr[index].sliced || !!point.isSliced || !!conf.isSliced;
                    }

                    if(index){
                        placeOtherSide && (alignmentSwitchToggle = !alignmentSwitchToggle);

                        //code for slicing drawing
                        if (point.isSliced) {
                            xPos = point.x;
                            if (xPos > 1 && !slicingGapPosition[xPos]) {
                                slicingGapPosition[xPos] = true;
                                conf.noOfGap += 1;
                            }
                            if (xPos < lastIndex) {
                                slicingGapPosition[xPos + 1] = true;
                                conf.noOfGap += 1;
                            }
                        }
                        if(!streamlinedData){
                            totalHeight += sliceHeight = unitHeight * dataArr[index].y;
                            newRadius = drawingRadius * (1 - (totalHeight * widthHeightRatio));
                        }else{
                            if (conf.useSameSlantAngle == 1) {
                                newRadius = maxValue ? drawingRadius * point.y / maxValue : drawingRadius;
                            } else {
                                newRadius = maxValue ? drawingRadius * mathSqrt(point.y / maxValue) : drawingRadius;
                            }
                            // Default sliceHeight is set to one, in case its NaN.
                            sliceHeight = unitHeight * (dataArr[index - 1].y - point.y) || 1;
                        }
                        point.shapeArgs = {
                            x: x,
                            y: y,
                            R1: lastRadius,
                            R2: newRadius,
                            h: sliceHeight || 1,
                            r3dFactor: yScale,
                            isHollow: isHollow,
                            gStr: 'point',
                            is2D: is2d,
                            renderer: chart.components.paper,
                            isFunnel: true
                        };

                        smartLabel.setStyle(point.style);
                        point.oriText = point.displayValue;
                        labelMeasurement = labelMeasurement = smartLabel
                    .getSmartText(point.displayValue, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);

                        if (showLabelsAtCenter) {
                            point.labelAline = POSITION_MIDDLE;
                            point.labelX = x;
                            point.labelY = (is2d ? y : y + (yScale * lastRadius)) + (sliceHeight / 2) + yShift;
                        }
                        else {
                            point.labelAline = POSITION_START;
                            point.alignmentSwitch = alignmentSwitchToggle;
                            point.distributionFactor = point.distributionFactor || 0;

                            if(alignmentSwitchToggle){
                                point.labelX = x - (labelDistance + newRadius + blankSpace + labelMeasurement.width);
                                point.labelX -= point.distributionFactor * conf.globalMinXShift;
                                lLargestLabel.set(point, labelMeasurement);
                            }else{
                                point.labelX = x + labelDistance + newRadius + blankSpace;
                                point.labelX += point.distributionFactor * conf.globalMinXShift;
                                rLargestLabel.set(point, labelMeasurement);
                            }
                            distributionOffset = point.distributionFactor * lineHeight;
                            point.labelY = y + yShift + sliceHeight + distributionOffset;
                        }
                        // Checking text overflow for alternate alignment
                        if(placeOtherSide){
                            if(alignmentSwitchToggle && (point.labelX < 0)){
                                // Left and behind the margin
                                negativeSpanningDataEnd = point.labelX + labelMeasurement.width;
                                normalizedLabel = smartLabel.getSmartText(point.displayValue, negativeSpanningDataEnd,
                                    Number.POSITIVE_INFINITY, true);
                                point.labelX = 2;
                                point.isLabelTruncated = true;
                                point.displayValue = normalizedLabel.text;
                                point.virtualWidth = normalizedLabel.maxWidth;
                                leftTrimmedInfo.setAll(true, point, normalizedLabel);
                            }else if(!alignmentSwitchToggle && (point.labelX + labelMeasurement.width > chartWidth)){
                                // Right side and spanning the margin
                                normalizedLabel = smartLabel.getSmartText(point.displayValue, chartWidth - point.labelX,
                                    Number.POSITIVE_INFINITY, true);
                                point.isLabelTruncated = true;
                                point.displayValue = normalizedLabel.text;
                                point.virtualWidth = normalizedLabel.maxWidth;
                                rightTrimmedInfo.setAll(true, point, normalizedLabel);
                            }

                        }
                        point.pWidth = point.virtualWidth = point.virtualWidth || labelMeasurement.width;
                        y += sliceHeight;
                        lastRadius = newRadius;
                    }else{
                        point.oriText = point.displayValue;
                        if (conf.useSameSlantAngle == 1) {
                            newRadius = maxValue ? drawingRadius * point.y / maxValue : drawingRadius;
                        } else {
                            newRadius = maxValue ? drawingRadius * mathSqrt(point.y / maxValue) : drawingRadius;
                        }
                        if (point.labelWidth > newRadius * 2 && !placeOtherSide) {
                            point.labelAline = POSITION_START;
                            point.labelX = 0;
                        }
                        else {
                            point.labelAline =  POSITION_MIDDLE;
                            point.labelX = x;
                        }
                        extraConnectorSpace = labelDistance * 2;
                        point.displayValue = smartLabel.getSmartText(point.displayValue, newRadius * 2 +
                            extraConnectorSpace, Number.POSITIVE_INFINITY, true).text;
                        point.labelY = (is2d ? y : y - (yScale * lastRadius)) - yShift - blankSpace;
                    }
                    point.plotX = x;
                    point.plotY = y;
                }

                // Recalculate the space one more time. Ideally this should be given by space manager.
                // However in the current scope space manager cannot be called from here.
                datasetStore.findBestPosition.call(datasetStore, dataArr, {
                    'lTrimmedInfo': leftTrimmedInfo,
                    'rTrimmedInfo': rightTrimmedInfo,
                    'lLargestLabel': lLargestLabel,
                    'rLargestLabel': rLargestLabel
                });
            },

            findBestPosition : function (dataArr, config) {
                var datasetStore = this,
                    conf = datasetStore.conf,
                    chart = datasetStore.chart,
                    chartConfig = chart.config,
                    shift = 0,
                    lTrimmedInfo = config.lTrimmedInfo,
                    rTrimmedInfo = config.rTrimmedInfo,
                    lLargestLabel = config.lLargestLabel,
                    rLargestLabel = config.rLargestLabel,
                    smartLabel = chart.linkedItems.smartLabel,
                    trimmedLength,
                    point, sLabel, leftXSpace, rightXSpace, newLabel,
                    data, index, length,
                    unfoldWidth = 0, overflow,
                    streamLinedData = conf.streamLinedData,
                    allowedLeftX = conf.blankSpace,
                    allowedRightX = chartConfig.width - conf.blankSpace;

                if(lTrimmedInfo.flag && rTrimmedInfo.flag){
                    // If labels are large in both of the sides. No need to shift the system
                    return;
                }

                if(rTrimmedInfo.flag) {
                    // Only right side labels are large. Shift left
                    if(!lLargestLabel.point){
                        return;
                    }
                    point = rTrimmedInfo.point;
                    sLabel = rTrimmedInfo.sLabel;
                    trimmedLength = sLabel.oriTextWidth - sLabel.width;
                    leftXSpace = lLargestLabel.point.labelX - allowedLeftX;
                    shift = - Math.ceil(Math.min(trimmedLength, leftXSpace));
                } else if(lTrimmedInfo.flag) {
                    // Only left side labels are large. Shift right
                    if(!rLargestLabel.point){
                        return;
                    }
                    point = lTrimmedInfo.point;
                    sLabel = lTrimmedInfo.sLabel;
                    trimmedLength = sLabel.oriTextWidth - sLabel.width;
                    rightXSpace = allowedRightX - (rLargestLabel.point.labelX + rLargestLabel.sLabel.width);
                    shift = Math.ceil(Math.min(trimmedLength, rightXSpace));
                }

                // Apply shift to the whole system
                if(!shift){
                    smartLabel.useEllipsesOnOverflow(chartConfig.useEllipsesWhenOverflow);
                    for(index = 0, length = dataArr.length; index < length; index++) {
                        data = dataArr[index];

                        if((overflow = (data.labelX + data.pWidth - allowedRightX)) > 0){
                            data.lOverflow = overflow;
                            data.labelX -= overflow;
                            if(chart.isLegendRight){
                                data.displayValue = smartLabel.getSmartText(data.oriText, (data.pWidth - overflow),
                                    Number.POSITIVE_INFINITY, true).text;
                            }else{
                                data.lOverflow = overflow;
                                data.labelX -= overflow;
                            }
                        }
                    }
                    return;
                }


                for(index = 0, length = dataArr.length; index < length; index++) {
                    data = dataArr[index];
                    if(!index && streamLinedData){
                        data.labelX += shift;
                        continue;
                    }
                    if(data.alignmentSwitch) {
                        // left labels
                        if(shift < 0){
                            newLabel = smartLabel
                              .getSmartText(data.oriText, (data.pWidth),Number.POSITIVE_INFINITY, true);
                        }else{
                            newLabel = smartLabel.getSmartText(data.oriText, (data.pWidth + shift),
                                Number.POSITIVE_INFINITY, true);
                        }
                        if(data.isLabelTruncated){
                            unfoldWidth = (newLabel.width - data.pWidth);
                        }
                        data.virtualWidth = newLabel.width;
                    }else {
                        // Labels at right
                        if(shift > 0){
                            newLabel = smartLabel
                              .getSmartText(data.oriText, (data.pWidth),Number.POSITIVE_INFINITY, true);
                        }else{
                            newLabel = smartLabel.getSmartText(data.oriText, (data.pWidth - shift),
                                Number.POSITIVE_INFINITY, true);
                        }
                        data.virtualWidth = newLabel.width;
                    }
                    data.displayValue = newLabel.text;
                    data.labelX += shift - unfoldWidth;
                    data.shapeArgs && (data.shapeArgs.x +=shift);
                    unfoldWidth = 0;
                }
            },

            getPlotData: function (id) {
                var datasetStore = this,
                    data = datasetStore.components.data[id],
                    userData = datasetStore.userData || (datasetStore.userData = []),
                    props = [
                        'y',
                        'name',
                        'color',
                        'alpha',
                        'borderColor',
                        'borderWidth',
                        'link',
                        'label',
                        'displayValue',
                        'datasetIndex',
                        'toolText'
                    ],
                    plotData,
                    i,
                    prop;

                if (!userData[id]) {
                    plotData = userData[id] = {};
                    for (i = 0; i < props.length; i++) {
                        plotData[prop = props[i]] = data[prop];
                    }

                    plotData.value = plotData.y;
                    plotData.label = plotData.name;

                    delete plotData.y;
                    delete plotData.name;
                }
                else {
                    plotData = userData[id];
                }

                return plotData;
            },

            pyramidFunnelShape: (function () {
                // @todo generic fn for pyramid and funnel

                //list of attr that will handled here
                var attrList = {
                    y : true,
                    R1 : true,
                    R2 : true,
                    h : true,
                    r3dFactor : true,
                    color : true,
                    opacity : true,
                    fill : true,
                    stroke : true,
                    strokeColor: true,
                    strokeAlpha: true,
                    'stroke-width' : true
                },
                //FIX for #FWXT-600
                //for zero radius calcPoints return erroneous value
                minRadius = 0.01,

                getArcPath = function (cX, cY, startX, startY, endX, endY, rX, rY, isClockWise, isLargeArc) {
                    return [A, rX, rY, 0, isLargeArc, isClockWise, endX, endY];
                },

                /**
                 * calcPoints method calculates and returns the
                 * coordinates of four points of common tangency
                 * between the upper and lower ellipses.
                 * @param    a1          semi-major axis length of the upper ellipse
                 * @param    b1          semi-minor axis length of the upper ellipse
                 * @param    h1          height of upper ellipse center
                 * @param    a2          semi-major axis length of the lower ellipse
                 * @param    b2          semi-minor axis length of the lower ellipse
                 * @param    h2          height of lower ellipse center
                 * @returns              object holding point instances corresponding
                 *                       to the 4 points of tangencies.
                */
                calcPoints = function (a1, b1, h1, a2, b2, h2) {
                   // calcuating parameters of formula
                    var alpha = mathPow(a2, 2) - mathPow(a1, 2),
                        beta = -2 * (mathPow(a2, 2) * h1 - mathPow(a1, 2) * h2),
                        gamma = mathPow(a1 * b2, 2) + mathPow(a2 * h1, 2) -
                                            mathPow(a2 * b1, 2) - mathPow(a1 * h2, 2),
                        k = mathSqrt(mathPow(beta, 2) - 4 * alpha * gamma),
                        // getting the 2 y-intercepts for there are 2 pairs of tangents
                        c1 = (-beta + k) / (2 * alpha),
                        c2 = (-beta - k) / (2 * alpha),
                        oneHND = 100,
                        objPoints,
                        c,
                        m1,
                        m2,
                        p1,
                        p2,
                        p3,
                        p4,
                        i;

                   // but we need only one pair and hence one value of y-intercept
                    if (c1 < h2 && c1 > h1) {
                        c = c2;
                    }
                    else if (c2 < h2 && c2 > h1) {
                        c = c1;
                    }
                    // getting the slopes of the 2 tangents of the selected pair
                    m1 = mathSqrt((mathPow(c - h1, 2) - mathPow(b1, 2)) / mathPow(a1, 2));
                    m2 = -m1;

                   // getting the 4 points of tangency
                   // right sided points
                   //upper
                    p1 = {
                        x : mathRound((mathPow(a1, 2) * m1 / (c - h1)) * oneHND) / oneHND,
                        y : mathRound(((mathPow(b1, 2) / (c - h1)) + h1) * oneHND) / oneHND
                    };
                   //lower
                    p2 = {
                        x : mathRound((mathPow(a2, 2) * m1 / (c - h2)) * oneHND) / oneHND,
                        y : mathRound(((mathPow(b2, 2) / (c - h2)) + h2) * oneHND) / oneHND
                    };
                   // left sided points
                   //upper
                    p3 = {
                        x : mathRound((mathPow(a1, 2) * m2 / (c - h1)) * oneHND) / oneHND,
                        y : mathRound(((mathPow(b1, 2) / (c - h1)) + h1) * oneHND) / oneHND
                    };
                   //lower
                    p4 = {
                        x : mathRound((mathPow(a2, 2) * m2 / (c - h2)) * oneHND) / oneHND,
                        y : mathRound(((mathPow(b2, 2) / (c - h2)) + h2) * oneHND) / oneHND
                    };
                   // storing in object to be passed as a collection
                    objPoints = {
                        topLeft: p3,
                        bottomLeft: p4,
                        topRight: p1,
                        bottomRight: p2
                    };
                   // checking for invalid situations
                    for (i in objPoints) {
                        if (isNaN(objPoints[i].x) || isNaN(objPoints[i].y)) {
                            // The funnel is extremely thin and points of tangencies
                            // coincide with ellipse ends
                            if (i === 'topLeft' || i === 'bottomLeft') {
                                objPoints[i].x = -a1;
                            }
                            else {
                                objPoints[i].x = a1;
                            }
                            objPoints[i].y = (i === 'bottomRight' || i === 'bottomLeft') ? h2 : h1;
                        }
                    }
                    // object returned
                    return objPoints;
                },

                getFunnel3DShapeArgs = function (x, y, R1, R2, h, r3dFactor, isHollow) {
                    var y2 = y + h,
                    R3 = R1 * r3dFactor, R4 = R2 * r3dFactor, shapearge,
                    objPoints = calcPoints(R1, R3, y, R2, R4, y2),
                    topLeft = objPoints.topLeft,
                    bottomLeft = objPoints.bottomLeft,
                    topRight = objPoints.topRight,
                    bottomRight = objPoints.bottomRight,
                    X1 = x + topLeft.x, X2 = x + topRight.x, X3 = x + bottomLeft.x, X4 = x + bottomRight.x,
                    y3 = topLeft.y, y4 = bottomLeft.y,

                    arc1 = getArcPath(x, y, X1, y3, X2, y3, R1, R3, 0, 0),
                    arc2 = getArcPath(x, y, X1, y3, X2, y3, R1, R3, 1, 1),
                    arc3 = getArcPath(x, y2, X4, y4, X3, y4, R2, R4, 1, 0),
                    arc4 = getArcPath(x, y2, X4, y4, X3, y4, R2, R4, 0, 1);

                    shapearge =  {
                        front : [M, X1, y3].concat(arc1, [L, X4, y4], arc3, [Z]),

                        back : [M, X1, y3].concat(arc2, [L, X4, y4], arc4, [Z]),
                        silhuette  : [M, X1, y3].concat(arc2, [L, X4, y4], arc3, [Z])
                    };
                    if (!isHollow) {
                        shapearge.top = [M, X1, y3].concat(arc1, [L, X2, y3],
                            getArcPath(x, y, X2, y3, X1, y3, R1, R3, 0, 1), [Z]);
                    }

                    return shapearge;
                },

                getPyramid3DShapeArgs = function(x, y, R1, R2, h, r3dFactor, is2D, renderer, isFunnel, isHollow,
                    use3DLighting) {
                    if (isObject(x)) {
                        y = x.y;
                        R1 = x.R1;
                        R2 = x.R2;
                        h = x.h;
                        r3dFactor = x.r3dFactor;
                        is2D = x.is2D;
                        use3DLighting = x.use3DLighting;
                        isHollow = x.isHollow;
                        isFunnel = x.isFunnel;
                        renderer = x.renderer;
                        x = x.x;
                    }
                    var X1 = x - R1, X2 = x + R1, X3 = x - R2, X4 = x + R2, y2 = y + h, shapeArgs,
                        R3,
                        R4,
                        lightLength,
                        lightLengthH,
                        lightLengthH1,
                        lightWidth;
                    if (is2D) {
                        shapeArgs = {
                            silhuette  : [M, X1, y, L, X2, y, X4, y2, X3, y2, Z]
                        };

                        if(!isFunnel){
                            // Rounding the x value to remove the thin white gap between following two halfs due
                            // to sub-pixel rendering.
                            x = Math.round(x);
                            shapeArgs.lighterHalf = [M, X1, y, L, x, y, x, y2, X3, y2, Z];
                            shapeArgs.darkerHalf = [M, x, y, L, X2, y, X4, y2, x, y2, Z];
                        }
                    }
                    else if (isFunnel){
                        shapeArgs = getFunnel3DShapeArgs(x, y, R1 || minRadius, R2 ||
                            minRadius, h, r3dFactor, isHollow, renderer);
                    }
                    else {
                        R3 = R1 * r3dFactor;
                        R4 = R2 * r3dFactor;
                        lightLength = mathMin(5, R1);
                        lightLengthH = mathMin(2, 2 * R3);
                        lightLengthH1 = mathMin(2, lightLengthH);
                        lightWidth = lightLengthH1 / r3dFactor;
                        shapeArgs = {
                            top : [M, X1, y, L, x, y + R3, X2, y, x, y - R3,Z],
                            front : [M, X1, y, L, x, y + R3, X2, y, X4, y2, x, y2 + R4,
                            X3, y2, Z],
                            topLight : [M, X1, y + 0.5, L, x, y + R3 + 0.5, x, y + R3 - lightLengthH,
                                X1 + lightWidth, y,  Z],// x, y + R3 - lightLengthH, Z],
                            topLight1 : [M, X2, y + 0.5, L, x, y + R3 + 0.5, x, y + R3 - lightLengthH1,
                                X2 - lightWidth, y,  Z],// x, y + R3 - lightLengthH, Z],
                            silhuette  : [M, X1, y, L, x, y - R3, X2, y, X4, y2, x, y2 + R4,
                                X3, y2, Z],
                            centerLight : [M, x, y + R3, L, x, y2 + R4, x - 5, y2 + R4,
                            x - lightLength, y + R3, Z],
                            centerLight1 : [M, x, y + R3, L, x, y2 + R4, x + 5, y2 + R4,
                            x + lightLength, y + R3, Z]
                        };
                    }

                    return shapeArgs;
                },

                attr = function (hash, val) {
                    var key,
                    value,
                    element = this,
                    color,
                    alpha,
                    colorObject,
                    shapeChanged = false,
                    colorChanged = false,
                    lightColor,
                    lightColor1,
                    darkColor,
                    attr3D = this._3dAttr,
                    shapeArgs,
                    colorDark,
                    colorLight,
                    zero100STR,
                    lightAlphaSTR,
                    lightShade,
                    slantAngle,
                    lightShadeStop;



                    // single key-value pair
                    if (isString(hash) && defined(val)) {
                        key = hash;
                        hash = {};
                        hash[key] = val;
                    }

                    // used as a getter: first argument is a string, second is undefined
                    if (isString(hash)) {

                        //if belongs from the list then handle here
                        if (attrList[hash]) {
                            element = this._3dAttr[hash];
                        }
                        else {//else leve for the original attr
                            element = this._attr(hash);
                        }

                    // setter
                    }
                    else {
                        for (key in hash) {
                            value = hash[key];

                            //if belongs from the list then handle here
                            if (attrList[key]) {
                                //store the att in attr3D for further use
                                attr3D[key] = value;
                                //if it is 'fill' or 'lighting3D' the redefine the colors for all the 3 elements
                                if (key === fillStr) {
                                    if (value && value.linearGradient && value.stops && value.stops[0]) {
                                        value = value.stops[0][1];
                                    }

                                    if (startsRGBA.test(value)) {
                                        colorObject = new Color(value);
                                        color = colorObject.get('hex');
                                        alpha = colorObject.get('a') * 100;
                                    }
                                    else if (value && value.FCcolor) {
                                        color = value.FCcolor.color.split(COMMASTRING)[0];
                                        alpha = value.FCcolor.opacity.split(COMMASTRING)[0];
                                    }
                                    else if (HEXCODE.test(value)) {
                                        color = value.replace(dropHash, HASHSTRING);
                                        alpha = pluckNumber(attr3D.opacity, 100);
                                    }
                                    attr3D.color = color;
                                    attr3D.opacity = alpha;
                                    colorChanged = true;
                                }
                                else if (key === 'color' || key === 'opacity') {
                                    attr3D.fill = toRaphaelColor(convertColor(attr3D.color,
                                        pluckNumber(attr3D.opacity, 100)));
                                    colorChanged = true;
                                }
                                else if (key === 'stroke' || key === 'strokeColor' || key === 'strokeAlpha') {
                                    if (attr3D.is2D) {//stroke is only applicable on 2d shape
                                        if (key === 'stroke') {
                                            if (value && value.linearGradient && value.stops && value.stops[0]) {
                                                value = value.stops[0][1];
                                            }

                                            if (startsRGBA.test(value)) {
                                                colorObject = new Color(value);
                                                color = colorObject.get('hex');
                                                alpha = colorObject.get('a') * 100;
                                            }
                                            else if (value && value.FCcolor) {
                                                color = value.FCcolor.color.split(COMMASTRING)[0];
                                                alpha = value.FCcolor.opacity.split(COMMASTRING)[0];
                                            }
                                            else if (HEXCODE.test(value)) {
                                                color = value.replace(dropHash, HASHSTRING);
                                                alpha = pluckNumber(attr3D.opacity, 100);
                                            }
                                            attr3D.strokeColor = color;
                                            attr3D.strokeAlpha = alpha;
                                        }
                                        else {
                                            attr3D.stroke = convertColor(attr3D.strokeColor,
                                                pluckNumber(attr3D.strokeAlpha, 100));
                                        }
                                        if (attr3D.isFunnel) {
                                            this.funnel2D.attr('stroke', attr3D.stroke);
                                        }
                                        else {
                                            this.borderElement.attr('stroke', attr3D.stroke);
                                        }
                                    }
                                }
                                else  if (key === 'stroke-width'){
                                    if (attr3D.is2D) {//stroke is only applicable on 2d shape
                                        if (attr3D.isFunnel) {
                                            this.funnel2D.attr(key, value);
                                        }
                                        else {
                                            this.borderElement.attr(key, value);
                                        }
                                    }
                                }
                                else {
                                    shapeChanged = true;
                                }
                            }
                            else {//else leave for the original attr
                                this._attr(key, value);
                            }
                        }


                        if (attr3D.is2D) {
                            if (shapeChanged) {
                                shapeArgs = getPyramid3DShapeArgs(attr3D.x, attr3D.y,
                                    attr3D.R1, attr3D.R2, attr3D.h, attr3D.r3dFactor, attr3D.is2D);
                                element.shadowElement.attr({
                                    path: shapeArgs.silhuette
                                });
                                if (attr3D.isFunnel) {
                                    element.funnel2D.attr({
                                        path: shapeArgs.silhuette
                                    });
                                }
                                else {
                                    element.lighterHalf.attr({
                                        path: shapeArgs.lighterHalf
                                    });
                                    element.darkerHalf.attr({
                                        path: shapeArgs.darkerHalf
                                    });
                                    element.borderElement.attr({
                                        path: shapeArgs.silhuette
                                    });
                                }
                            }
                            //if color change requared
                            if (colorChanged) {
                                if (attr3D.isFunnel) {
                                    element.funnel2D.attr(fillStr, toRaphaelColor(convertColor(attr3D.color,
                                        pluckNumber(attr3D.opacity, 100))));
                                }
                                else {
                                    if (attr3D.use3DLighting === false) {
                                        colorDark = colorLight = attr3D.color;
                                    }
                                    else {
                                        colorDark = getDarkColor(attr3D.color, 80);
                                        colorLight = getLightColor(attr3D.color, 80);
                                    }
                                    element.lighterHalf.attr(fillStr, toRaphaelColor(convertColor(colorLight,
                                        pluckNumber(attr3D.opacity, 100))));
                                    element.darkerHalf.attr(fillStr, toRaphaelColor(convertColor(colorDark,
                                        pluckNumber(attr3D.opacity, 100))));
                                }
                            }
                        }
                        else {
                            //if shape changed requared
                            if (shapeChanged) {
                                shapeArgs = getPyramid3DShapeArgs(attr3D.x, attr3D.y, attr3D.R1, attr3D.R2,
                                    attr3D.h, attr3D.r3dFactor, attr3D.is2D);
                                element.shadowElement.attr(pathStr, shapeArgs.silhuette);
                                if (attr3D.isFunnel) {
                                    element.front.attr(pathStr, shapeArgs.front);
                                    element.back.attr(pathStr, shapeArgs.back);
                                    if (element.toptop && shapeArgs.top) {
                                        element.toptop.attr(pathStr, shapeArgs.top);
                                    }
                                }
                                else {
                                    element.front.attr(pathStr, shapeArgs.front);
                                    element.toptop.attr(pathStr, shapeArgs.top);
                                    element.topLight.attr(pathStr, shapeArgs.topLight);
                                    element.topLight1.attr(pathStr, shapeArgs.topLight1);
                                    element.centerLight.attr(pathStr, shapeArgs.centerLight);
                                    element.centerLight1.attr(pathStr, shapeArgs.centerLight1);
                                }
                            }
                            //if color change requared
                            if (colorChanged) {
                                color = attr3D.color;
                                alpha = attr3D.opacity;
                                if (attr3D.isFunnel) {
                                    lightColor = getLightColor(color, 60);
                                    darkColor = getDarkColor(color, 60);
                                    element.back.attr(fillStr, toRaphaelColor({
                                        FCcolor : {
                                            color : darkColor + COMMASTRING + lightColor + COMMASTRING + color,
                                            alpha : alpha + COMMASTRING + alpha + COMMASTRING + alpha,
                                            ratio : '0,60,40',
                                            angle : 0
                                        }
                                    }));
                                    element.front.attr(fillStr, toRaphaelColor({
                                        FCcolor : {
                                            color : color + COMMASTRING + lightColor + COMMASTRING + darkColor,
                                            alpha : alpha + COMMASTRING + alpha + COMMASTRING + alpha,
                                            ratio : '0,40,60',
                                            angle : 0
                                        }
                                    }));
                                    if (element.toptop) {
                                        element.toptop.attr(fillStr, toRaphaelColor({
                                            FCcolor : {
                                                color : lightColor + COMMASTRING + darkColor,
                                                alpha : alpha + COMMASTRING + alpha,
                                                ratio : zeroCommaHundredStr,
                                                angle : -65
                                            }
                                        }));
                                    }
                                }
                                else {
                                    lightColor = getLightColor(color, 80);
                                    lightColor1 = getLightColor(color, 70);
                                    darkColor = getDarkColor(color, 80);
                                    zero100STR = zeroCommaHundredStr;
                                    lightAlphaSTR = '0,' + alpha;
                                    lightShade = color + COMMASTRING + lightColor1;
                                    slantAngle = -45;
                                    lightShadeStop = (5 / (attr3D.R1 * attr3D.r3dFactor)) * 100;
                                    //slantAngle = - math.atan(1 / attr3D.r3dFactor) / deg2rad

                                    element.centerLight.attr(fillStr, toRaphaelColor({
                                        FCcolor : {
                                            color : lightShade,
                                            alpha : lightAlphaSTR,
                                            ratio : zero100STR,
                                            angle : 0
                                        }
                                    }));
                                    element.centerLight1.attr(fillStr, toRaphaelColor({
                                        FCcolor : {
                                            color : lightShade,
                                            alpha : lightAlphaSTR,
                                            ratio : zero100STR,
                                            angle : 180
                                        }
                                    }));
                                    element.topLight.attr(fillStr, toRaphaelColor({
                                        FCcolor : {
                                            color : lightColor1 + COMMASTRING + lightColor1 + COMMASTRING +
                                                color + COMMASTRING + color,
                                            alpha : alpha + COMMASTRING + alpha + COMMASTRING + 0 + COMMASTRING + 0,
                                            ratio : '0,50,' + lightShadeStop + COMMASTRING + (50 - lightShadeStop),
                                            angle : slantAngle
                                        }
                                    }));
                                    element.topLight1.attr(fillStr, toRaphaelColor({
                                        FCcolor : {
                                            color : lightColor1 + COMMASTRING + color + COMMASTRING + darkColor,
                                            alpha : alpha + COMMASTRING + alpha + COMMASTRING + alpha,
                                            ratio : '0,50,50',
                                            angle : 0
                                        }
                                    }));
                                    element.front.attr(fillStr, toRaphaelColor({
                                        FCcolor : {
                                            color : color + COMMASTRING + color + COMMASTRING +
                                            darkColor + COMMASTRING + darkColor,
                                            alpha : alpha + COMMASTRING + alpha + COMMASTRING +
                                              alpha + COMMASTRING + alpha,
                                            ratio : '0,50,0,50',
                                            angle : 0
                                        }
                                    }));
                                    element.toptop.attr(fillStr, toRaphaelColor({
                                        FCcolor : {
                                            color : lightColor + COMMASTRING + color + COMMASTRING +
                                                darkColor + COMMASTRING + darkColor,
                                            alpha : alpha + COMMASTRING + alpha + COMMASTRING +
                                              alpha + COMMASTRING + alpha,
                                            ratio : '0,25,30,45',
                                            angle : slantAngle
                                        }
                                    }));
                                }
                            }
                        }
                    }
                    return element;
                },

                shadow = function () {
                    var silhuette = this.shadowElement;
                    if (shadow) {
                        silhuette.shadow.apply(silhuette, arguments);
                    }
                },

                normalizeShapes = function (group, newAttrs) {
                    var shapes = ['silhuette', 'lighterHalf', 'darkerHalf', 'centerLight', 'centerLight1', 'front',
                        'toptop', 'topLight', 'topLight1', 'shadowElement', 'funnel2D', 'back'],
                        shapeGElem,
                        index,
                        shapeName,
                        oldAttrs,
                        length;

                    if (!group) { return; }

                    oldAttrs = group._3dAttr;

                    if ((oldAttrs.isFunnel === newAttrs.isFunnel) && (oldAttrs.is2D === newAttrs.is2D) &&
                        (oldAttrs.isHollow === newAttrs.isHollow)) {
                        return group;
                    }


                    for (index = 0, length = shapes.length; index < length; index++) {
                        shapeName = shapes[index];
                        shapeGElem = group[shapeName];

                        if (!shapeGElem) { continue; }
                        delete group[shapeName];
                        shapeGElem.remove();
                    }

                    return group;
                },

                animatePathIfPresent = function (datasetStore, renderer, parentElem) {
                    var chart = datasetStore.chart,
                        animationObj = chart.get(configStr, animationObjStr),
                        animDuration = animationObj.duration,
                        dummyAnimElem = animationObj.dummyObj,
                        dummyAnimObj = animationObj.animObj,
                        animType = animationObj.animType;

                    return function (elemType, pathArr, nonAnimAttr) {
                        var prevEle = parentElem[elemType];

                        if (prevEle) {
                            return prevEle.animateWith(dummyAnimElem, dummyAnimObj, {
                                path: pathArr
                            }, animDuration, animType, datasetStore.postPlotCallback);
                        }

                        nonAnimAttr = nonAnimAttr || EMPTY_OBJ;
                        datasetStore.postPlotCallback();
                        return renderer.path(pathArr, parentElem).attr(nonAnimAttr);
                    };
                };

                return function (x, y, R1, R2, h, r3dFactor, gStr, is2D, renderer, isFunnel, isHollow, use3DLighting) {
                    var datasetStore = this,
                        chart = datasetStore.chart,
                        graphicsGroup = chart.graphics.datasetGroup,
                        _3dAttr,
                        Shapeargs,
                        rect3D,
                        existingGElement,
                        animDuration,
                        animationType = 'easeIn',
                        animOrDraw;

                    if (isObject(x)) {
                        y = x.y;
                        R1 = x.R1;
                        R2 = x.R2;
                        h = x.h;
                        r3dFactor = x.r3dFactor;
                        gStr = x.gStr;
                        is2D = x.is2D;
                        use3DLighting = x.use3DLighting;
                        renderer = x.renderer;
                        isHollow = x.isHollow;
                        isFunnel = x.isFunnel;
                        existingGElement = x.graphics;
                        animDuration = x.animationDuration;
                        x = x.x;
                    }
                    r3dFactor = pluckNumber(r3dFactor, 0.15);
                    _3dAttr = {
                        x : x,
                        y : y,
                        R1 : R1,
                        R2 : R2,
                        h : h,
                        r3dFactor : r3dFactor,
                        is2D : is2D,
                        use3DLighting: use3DLighting,
                        isHollow : isHollow,
                        isFunnel : isFunnel,
                        renderer : renderer
                    };
                    Shapeargs = getPyramid3DShapeArgs(_3dAttr);

                    rect3D = normalizeShapes(existingGElement, _3dAttr) || renderer.group(gStr, graphicsGroup);
                    rect3D.toFront();

                    rect3D.Shapeargs = Shapeargs;

                    animOrDraw = animatePathIfPresent(datasetStore, renderer, rect3D, animationType);

                    rect3D.shadowElement = animOrDraw('shadowElement', Shapeargs.silhuette, {
                        fill : TRACKER_FILL,
                        stroke: noneStr
                    });

                    //modify the attr function of the group so that it can handle pyramid attrs
                    //store the old function
                    rect3D._attr = rect3D._attr || rect3D.attr;
                    rect3D.attr = attr;

                    // Replace the shadow function with a modified version.
                    rect3D.shadow = shadow;

                    //store the 3d attr(requared in new attr function to change any related
                    //                  attr modiffiaction)
                    rect3D._3dAttr = _3dAttr;


                    //add the new attr function
                    if (isFunnel) {
                        //if the drawing is a 2d drawing
                        if (is2D) {
                            rect3D.funnel2D = animOrDraw('funnel2D', Shapeargs.silhuette);
                        } else {
                            rect3D.back = animOrDraw('back', Shapeargs.back, {
                                'stroke-width' : 0,
                                stroke: noneStr
                            });

                            rect3D.front = animOrDraw('front', Shapeargs.front, {
                                'stroke-width' : 0,
                                stroke: noneStr
                            });

                            if (Shapeargs.top) {
                                rect3D.toptop = animOrDraw('toptop', Shapeargs.top, {
                                    'stroke-width' : 0,
                                    stroke: noneStr
                                });
                            }
                        }
                    }
                    else {
                        //if the drawing is a 2d drawing
                        if (is2D) {
                            rect3D.lighterHalf = animOrDraw('lighterHalf', Shapeargs.lighterHalf, {
                                'stroke-width' : 0
                            });

                            rect3D.darkerHalf = animOrDraw('darkerHalf', Shapeargs.darkerHalf, {
                                'stroke-width' : 0
                            });

                            rect3D.borderElement = animOrDraw('borderElement', Shapeargs.silhuette, {
                                fill : TRACKER_FILL,
                                stroke: noneStr
                            });
                        }
                        else {
                            //else it should be 3d

                            rect3D.front = animOrDraw('front', Shapeargs.front, {
                                'stroke-width' : 0
                            });

                            rect3D.centerLight = animOrDraw('centerLight', Shapeargs.centerLight, {
                                'stroke-width' : 0
                            });

                            rect3D.centerLight1 = animOrDraw('centerLight1', Shapeargs.centerLight1, {
                                'stroke-width' : 0
                            });

                            rect3D.toptop = animOrDraw('toptop', Shapeargs.top, {
                                'stroke-width' : 0
                            });

                            rect3D.topLight = animOrDraw('topLight', Shapeargs.topLight, {
                                'stroke-width' : 0
                            });

                            rect3D.topLight1 = animOrDraw('topLight1', Shapeargs.topLight1, {
                                'stroke-width' : 0
                            });
                        }
                    }

                    return rect3D;
                };
            }
            )(),

            utils : function (_context) {
                /*
                 * Utility to create associative array with the facility to get non-undefined element in optimized way.
                 * O(1) length retrieval
                 */
                function ArrayableObj() {
                    var _map = [],
                        _eLength = 0;   // Effective length. Only count of defined element

                    // Set a value in associative array
                    this.set = function(key, value) {
                        _eLength++;
                        _map[key] = value;
                    };

                    // Get an value based on the key
                    this.get = function(key) {
                        return _map[key];
                    };

                    // Get the complete array
                    this.getAll = function() {
                        return _map;
                    };

                    // Merge with a given array and return a new one. However instance remains immutable.
                    this.mergeWith = function(anotherArray) {
                        var sArr,
                            itemIndex,
                            item,
                            newArr = _map.slice(0);
                        if(anotherArray instanceof Array) {
                            sArr = anotherArray;
                        } else if(anotherArray instanceof ArrayableObj) {
                            sArr = anotherArray.getAll();
                        } else {
                            return;
                        }
                        for(itemIndex in sArr) {
                            item = sArr[itemIndex];
                            if(newArr[itemIndex]) {
                                continue;
                            }
                            newArr[itemIndex] = item;
                        }
                        return newArr;
                    };

                    this.getEffectiveLength = function(){
                        return _eLength;
                    };
                }

                ArrayableObj.prototype.constructor = ArrayableObj;

                /*
                 * Matrix that calculates the distribution of the labels.
                 * If the distribution is not uniform it calculates a variable factor to make it uniform
                 * It calculates the following cases :-
                 * a) If the distribution is permitted for one given side, it suggestes chart.alignmentType['default']
                 * b) If the distribution exceeds to a given limit it suggestes chart.alignmentType.alternate
                 *
                 * If the original distribution (non uniform) is like
                 * ------------------------------------------------------
                 *   4  |  2  |  0  |  0  |  0  |  0  |  0  | 1   |  0  |
                 * ------------------------------------------------------
                 * After make it uniform it would look like
                 * ------------------------------------------------------
                 *   1  |  1  |  1  |  1  |  1  |  1  |  0  | 1   |  0  |
                 * ------------------------------------------------------
                 *
                 * If the original distribution array is not sufficient to hold all the elements one more array is
                 * introduced.
                 * @param length - {{int}} : Permitted limit of distribution
                 */
                function DistributionMatrix(length){
                    // Allowed length of distribution
                    this.distributionLength = length;
                    // Represents the recalculated distribution for default side
                    this.distributedMatrix = [];
                    // Represents the recalculated distribution for alternate side
                    this.altDistributedMatrix = [];
                    // Represents the normal distribution
                    this.nonDistributedMatrix = {};
                    // For focefully pushing elements which are need not be distributed, but required to be placed in
                    // the final distribution matrix
                    this.forcePushObj = {};
                    this.flags = {
                        exhaustion : false
                    };
                }

                DistributionMatrix.prototype.constructor = DistributionMatrix;

                /*
                 * Puts items in the matrix to calculate dependency.
                 * @param item - {{object}} : Item to be distributed
                 * @param rangeBottom - {{int}} : distribution index
                */
                DistributionMatrix.prototype.push = function(item, rangeBottom){
                    // Original distribution before recalculation
                    this.nonDistributedMatrix[rangeBottom] = this.nonDistributedMatrix[rangeBottom] || [];
                    this.nonDistributedMatrix[rangeBottom].push(item);
                };

                /*
                 * Forcefully pushes element in already distributed array. The system does not calculate the overall
                 * distribution after the data being pushed.
                 * @param item {{object}} - object to be forcefully distributed
                 * @param index {{int}} - corrosponds to the index of the main array where the element to be placed
                */
                DistributionMatrix.prototype.forcePush = function(item, index){
                    this.forcePushObj[index] = item;
                };

                /*
                 * Controls and spread distribution of non-uniform matrix to uniform matrix.
                 * Gets called when result is prepared.
                 */
                DistributionMatrix.prototype.distribute = function(legendSkip){
                    var datasetStore = _context,
                        distributionItems,
                        alternateSwitch = true,
                        distributedMatrix = new ArrayableObj(),
                        alternateDistributedMatrix = new ArrayableObj(),
                        orphanMatrix = new ArrayableObj(),
                        altOrphanMatrix = new ArrayableObj(),
                        flags = this.flags,
                        currentMatrix, distributionIndexAlt,
                        distributionIndex, index, length, currentItem,
                        matricsExhaustionIndex = 0,
                        diff, willMatricsExhaust = false, absIndex = 0,
                        data = datasetStore.components.data;


                    // If there are too many labels even after placing them in alternate size, the system skips label.
                    // This behaviour is observable especially with low height. On top of that if legend is positioned
                    // at right side, system places labels only one side.
                    // This is applied because two side space management
                    // cannot be done in this scope.
                    if(legendSkip){
                        // If legend is in right side place all the labels in one side
                        if((diff = data.length - (this.distributionLength)) > 0){
                            willMatricsExhaust = true;
                            matricsExhaustionIndex = diff;

                            for(distributionIndexAlt in this.nonDistributedMatrix){
                                distributionItems = this.nonDistributedMatrix[distributionIndexAlt];
                                for(index = 1 ; index < distributionItems.length; index++){
                                    // Keep only the first element in the block as
                                    // distribution will not be calculated since
                                    // labels are skipped.
                                    currentItem = distributionItems[index];
                                    currentItem.dontPlot = true;
                                    currentItem.displayValue = BLANK;
                                }
                            }
                        }
                    }else{
                        // If legend is not in right side but possibility of canvas overflow
                        if((diff = data.length - (2 * this.distributionLength)) > 0){
                            willMatricsExhaust = true;
                            matricsExhaustionIndex = diff;

                            for(distributionIndexAlt in this.nonDistributedMatrix){
                                distributionItems = this.nonDistributedMatrix[distributionIndexAlt];
                                for(index = 1 ; index < distributionItems.length - 1; index++){
                                    currentItem = distributionItems[index];
                                    currentItem.dontPlot = true;
                                    currentItem.displayValue = BLANK;
                                }
                            }
                        }
                    }
                    /*
                     * If number of data to be distributed is greater than allowed length (in one side),
                     * alternate distribution happens.
                     * There are few concept here how the skipping is dealt with.
                     * The pyramid plot can have labels or can not. If the plot doesn't associate with a label we call
                     * it a orphan. While calculating the distribution orphans are not considered as their labels won't
                     * occupy any space. Hence these are kept in a separate matrix;
                     * Separately the orphans and non-orphans
                     * create one associative array. But when they are merged they create a complete array.
                     */
                    if(data.length > this.distributionLength && !legendSkip){
                        // If data exhausts two matrics, skip labels
                        flags.exhaustion = true;
                        for(distributionIndexAlt in this.nonDistributedMatrix){
                            distributionItems = this.nonDistributedMatrix[distributionIndexAlt];
                            // Alternatively place every item in two different arrays
                            for(index = 0, length = distributionItems.length ; index < length ; index++){
                                currentItem = distributionItems[index];
                                if(!currentItem.dontPlot){
                                    alternateSwitch ? (currentMatrix = distributedMatrix) :
                                    (currentMatrix = alternateDistributedMatrix);
                                    if(currentMatrix.getEffectiveLength()  > parseInt(distributionIndexAlt, 10)){
                                        currentItem.distributionFactor =
                                            (currentMatrix.getEffectiveLength() - 1) - distributionIndexAlt;
                                    }else{
                                        //currentItem.distributionFactor = 0;
                                        currentItem.distributionFactor = 0;
                                    }
                                }else{
                                    alternateSwitch ? (currentMatrix = orphanMatrix) :
                                    (currentMatrix = altOrphanMatrix);
                                }
                                currentMatrix.set(absIndex++, currentItem);
                                alternateSwitch = !alternateSwitch;
                            }
                        }
                        // Forms the complete array in both of the side
                        this.distributedMatrix = distributedMatrix.mergeWith(orphanMatrix);
                        this.altDistributedMatrix = alternateDistributedMatrix.mergeWith(altOrphanMatrix);
                    }else{
                        // Distribution happens in one side. Hence data can be accommodated in one side
                        for(distributionIndex in this.nonDistributedMatrix){
                            distributionItems = this.nonDistributedMatrix[distributionIndex];
                            for(index = 0, length = distributionItems.length ; index < length ; index++){
                                currentItem = distributionItems[index];
                                // Calculating distribution offset
                                if(!currentItem.dontPlot){
                                    currentMatrix = distributedMatrix;
                                    if(currentMatrix.getEffectiveLength()  > parseInt(distributionIndex, 10)){
                                        currentItem.distributionFactor =
                                            (currentMatrix.getEffectiveLength() - 1) - distributionIndex;
                                    }else{
                                        currentItem.distributionFactor = 0;
                                    }
                                }else{
                                    currentMatrix = orphanMatrix;
                                }
                                currentMatrix.set(absIndex++, currentItem);
                            }
                        }
                        this.distributedMatrix = distributedMatrix.mergeWith(orphanMatrix);
                    }
                };

                /*
                 * Gets the distributed result.
                 * @return {{object}} - {
                 *   suggestion :
                 *   matrix
                 * }
                 * Suggestion - suggests what kind of allignment to be taken
                 * Matrix - Uniform distribution matrix
                 */
                DistributionMatrix.prototype.getDistributedResult =function() {
                    var datasetStore = _context,
                        chart = datasetStore.chart,
                        chartConfig = chart.config,
                        legend = chart.components.legend,
                        conf = datasetStore.conf,
                        alignmentType = conf.alignmentType,
                        suggestion,
                        matrix = [],
                        isLegendRight = chart.isLegendRight,
                        allowedRightX = chartConfig.width - conf.blankSpace;

                    if(legend.config.width){
                        isLegendRight && (allowedRightX -= legend.config.width + chartConfig.marginRight);
                    }else{
                        isLegendRight = 0;
                    }
                    chart.isLegendRight = isLegendRight;


                    this.distribute(isLegendRight);

                    // When legend is in right side the plot will be in one side with skipped labels.
                    if(isLegendRight){
                        suggestion = alignmentType['default'];
                        matrix.push(this.distributedMatrix);
                    }else{
                        suggestion = this.flags.exhaustion ?
                        alignmentType.alternate : alignmentType['default'];

                        this.flags.exhaustion ? [].push.call(matrix, this.distributedMatrix,
                            this.altDistributedMatrix) : matrix.push(this.distributedMatrix);
                    }
                    return {
                        'forceMatrix' : this.forcePushObj,
                        'suggestion' : suggestion,
                        'matrix' : matrix
                    };
                };

                return {
                    DistributionMatrix: DistributionMatrix,

                    setContext : function(context){
                        _context = context;
                    },

                    invokeHookFns : function() {
                        var fn, params = [], ctx = _context;

                        switch (arguments.length) {
                            case 3:
                                ctx = arguments[2];
                                /* falls through */
                            case 2:
                                params = arguments[1];
                                /* falls through */
                            case 1:
                                fn = arguments[0];
                                break;

                            default:
                                return;
                        }

                        fn && typeof fn === 'function' && fn.apply(ctx, params);
                    },

                    copyProperties : function (fromObject, toObject, mappingArray) {
                        var index, length, confArr, fromName, toName, convertFunction, defaultValue, additionalFn,
                            DEFAULT_FN = function () { };

                        function getDefaultValue (key) {
                            var nKey;

                            if (typeof key === 'string' && key.indexOf('$') === 0) {
                                nKey = key.substring(1);
                                return toObject[nKey];
                            }

                            if (typeof key === 'function') {
                                return key.call(_context, toObject);
                            }

                            return key;
                        }

                        for (index = 0, length = mappingArray.length; index < length; index++) {
                            confArr = mappingArray[index];
                            fromName = confArr[0];
                            toName = confArr[1];
                            convertFunction = confArr[2];
                            defaultValue = getDefaultValue(confArr[3]);
                            additionalFn = confArr[4] || DEFAULT_FN;

                            toObject[toName] = convertFunction(fromObject[fromName], defaultValue);
                            additionalFn(toObject);
                        }
                    },

                    sortObjArrByKey : function(objArr, valueKey){
                        return objArr.sort(function(obj1, obj2){
                            return Math.abs(obj2[valueKey]) - Math.abs(obj1[valueKey]);
                        });
                    },

                    getSumValueOfObjArrByKey : function (objArr, valueKey) {
                        var index, length, total = 0;

                        for (index = 0, length = objArr.length; index < length; index++) {
                            total += parseFloat(objArr[index][valueKey], 10);
                        }

                        return total;
                    }
                };
            },

            slice: function (evt, x, y, sliced) {
                var context = this,
                    dataItem = context.plotItem,
                    datasetStore = context.datasetStore,
                    chart = datasetStore.chart,
                    animationObj = chart.get(configStr, animationObjStr),
                    animDuration = animationObj.duration,
                    dummyAnimElem = animationObj.dummyObj,
                    dummyAnimObj = animationObj.animObj,
                    animType = animationObj.animType,
                    conf = datasetStore.conf,
                    slicingDistance = conf.slicingDistance,
                    seriesOptionsHalf = slicingDistance / 2,
                    i = 0,
                    noOFPrevPoint = 0,
                    data = datasetStore.graphics.plotItems,
                    length = data.length,
                    transformObj,
                    dataObj,
                    reflowData,
                    itemClicked,
                    clickedItemId,
                    reflowUpdate,
                    dyPrev,
                    dyNext,
                    dyOld,
                    dyNew,
                    slicingEnd;

                if (conf.sliceLock) {
                    return;
                }

                // Flag that informs whether slicing is on-going
                conf.sliceLock = 1;

                if (dataItem) {
                    plotEventHandler.call(dataItem.trackerObj, chart, evt, 'dataplotclick');
                }

                // save state
                reflowUpdate = {
                    hcJSON: {
                        chart: {
                            issliced: false
                        },
                        series: []
                    }
                };
                reflowUpdate.hcJSON.series[0] = {
                    data: reflowData = []
                };

                sliced = dataItem.sliced = defined(sliced) ? sliced : !dataItem.sliced;

                dyPrev = -seriesOptionsHalf;
                dyNext = seriesOptionsHalf;

                slicingEnd = function () {

                    return function() {
                        conf.sliceLock = 0;
                        /**
                         * SlicingEnd event is usually associated with a pie chart.
                         * In pie charts, on click a certain entity of the pie, the clicked slice is shown distinctly.
                         * The slicing start event is triggered as soon as the particular entity
                         * is clicked when the slicing is finished,
                         * the slicingEnd event is triggered.
                         * @event FusionCharts#slicingEnd
                         * @param {boolean} slicedState Indicates whether the data is sliced or not.
                         * @param {string} data The plot data from the chart to slice.
                         */
                        global.raiseEvent('SlicingEnd', {
                            slicedState: sliced,
                            data: datasetStore.getPlotData(clickedItemId)
                        }, chart.chartInstance);
                    };
                };

                for (i = 0; i < length; i += 1) {
                    dataObj = data[i];

                    if (dataObj !== dataItem) {
                        dataObj.sliced = false;
                        reflowData[i] = {isSliced: false};
                        itemClicked = false;
                    }
                    else {
                        reflowData[i] = {isSliced: sliced};
                        itemClicked = true;
                        clickedItemId = i;
                    }

                    if (dataObj.graphic) {
                        dyOld = dataObj.dy;
                        dyNew = -dyOld;

                        if (sliced) {
                            if (dataObj.x < dataItem.x) {
                                dyNew += dyPrev;
                                noOFPrevPoint += 1;
                            }
                            else if (dataObj.x == dataItem.x) {
                                if (!noOFPrevPoint) {
                                    dyNew += -seriesOptionsHalf * 0.5;
                                }
                                else if (i == length - 1) {
                                    dyNew += seriesOptionsHalf * 0.5;
                                }
                            }
                            else {
                                dyNew += dyNext;
                            }
                        }
                        // The plot should be sent to ending y position, before invoking
                        // next slicing movement, as in the case of rapid slicing interactions.
                        dataObj.graphic.attr({
                            transform: 't0,' + dataObj.dy
                        });

                        dataObj.dy += dyNew;

                        transformObj = {transform: '...t0,' + dyNew};

                        //dataItem.distanceAvailed = dyNew;
                        /**
                         * SlicingStart event is usually associated with a pie chart.
                         * In pie charts, on click a certain entity of the pie, the clicked slice is shown distinctly.
                         * The slicing start event is triggered as soon as the particular entity is clicked.
                         * @event FusionCharts#slicingStart
                         * @param {boolean} slicedState Indicates whether the data is sliced or not.
                         * @param {string} data The plot data from the chart to slice.
                         */
                        itemClicked && global.raiseEvent('SlicingStart', {
                            slicedState: !sliced,
                            data: datasetStore.getPlotData(clickedItemId)
                        }, chart.chartInstance);

                        dataObj.graphic.animateWith(dummyAnimElem, dummyAnimObj, transformObj, animDuration, animType,
                            itemClicked && slicingEnd(sliced, clickedItemId));
                        //for labels at center translate the labels
                        if (dataObj.dataLabel) {
                            dataObj.dataLabel.animateWith(dummyAnimElem, dummyAnimObj, transformObj, animDuration,
                                animType);
                        }
                        if (dataObj.connector) {
                            dataObj.connector.animateWith(dummyAnimElem, dummyAnimObj, transformObj, animDuration,
                                animType);
                        }
                        //for tracker translate it
                        if (dataObj.trackerObj) {
                            dataObj.trackerObj.animateWith(dummyAnimElem, dummyAnimObj, transformObj, animDuration,
                                animType);
                        }
                        // For Funnel streamlinedData, the top label should move with top funnel,
                        // characterised by no graphic but with label for the plot. Topmost funnel
                        // is not the topmost plot here.
                        if (i == 1 && !data[0].graphic && data[0].dataLabel) {
                            data[0].dataLabel.animateWith(dummyAnimElem, dummyAnimObj, transformObj, animDuration,
                                animType);
                        }
                    }
                }
            },

            legendClick: function (plotItem) {
                this.slice.call(plotItem);
            },

            getEventArgs: function (legendItem) {
                var dataset = this,
                    dataStore = dataset.components.data,
                    configuration = legendItem.configuration,
                    index = configuration.index,
                    dataObj = dataStore[index] || {},
                    eventArgs;
                eventArgs = {
                    alpha: dataObj.alpha,
                    value: dataObj.y,
                    color: dataObj.color,
                    borderColor: dataObj.borderColor,
                    borderWidth: dataObj.borderWidth,
                    link: dataObj.link,
                    displayValue: dataObj.displayValue,
                    datasetIndex: dataObj.datasetIndex,
                    toolText: dataObj.toolText,
                    label: dataObj.categoryLabel
                };
                return eventArgs;
            }
        }]);
    }
]);

FusionCharts.register('module', ['private', 'modules.renderer.js-dataset-funnel',
    function () {
        var global = this,
            lib = global.hcLib,
            pluckNumber = lib.pluckNumber,
            BLANK = lib.BLANKSTRING,
            setLineHeight = lib.setLineHeight,
            plotEventHandler = lib.plotEventHandler,
            ROLLOVER = 'DataPlotRollOver',
            ROLLOUT = 'DataPlotRollOut',
            schedular = lib.schedular,
            preDefStr = lib.preDefStr,
            configStr = preDefStr.configStr,
            animationObjStr = preDefStr.animationObjStr,
            POSITION_START = preDefStr.POSITION_START,
            POSITION_END = preDefStr.POSITION_END,
            POSITION_MIDDLE = preDefStr.POSITION_MIDDLE,
            textHAlign = {
                right: POSITION_END,
                left: POSITION_START,
                middle: POSITION_MIDDLE,
                start: POSITION_START,
                end: POSITION_END,
                center: POSITION_MIDDLE,
                'undefined': BLANK,
                BLANK: BLANK
            },
            POINTER = 'pointer',
            COMPONENT = 'component',
            DATASET = 'dataset';

        FusionCharts.register(COMPONENT, [DATASET, 'Funnel', {
            type : 'funnel',

            LABEL_PLACEMENT_ITERATOR_INDEX_START: 1,

            configure : function () {
                var datasetDefStore = this,
                    chart = datasetDefStore.chart,
                    numberFormatter = chart.components.numberFormatter,
                    utils = datasetDefStore.utils(datasetDefStore),
                    sortObjArrByKey = utils.sortObjArrByKey,
                    chartAttr = chart.jsonData ? chart.jsonData.chart : {},
                    data = datasetDefStore.JSONData.data,
                    streamLinedData,
                    index,
                    dsItem,
                    length;

                if (!datasetDefStore._checkValidData(data)) { return; }

                for (index = 0, length = data.length; index < length; index++) {
                    dsItem = data[index];
                    if (dsItem && dsItem.value !== undefined) {
                        dsItem.value = numberFormatter.getCleanValue(dsItem.value, true);
                    }
                }

                streamLinedData = +(chartAttr.streamlineddata === undefined ? 1 : chartAttr.streamlineddata);
                datasetDefStore.JSONData.data = !streamLinedData ? data : sortObjArrByKey(data, 'value');

                !!streamLinedData && (data[0].pseudoPoint = true);

                datasetDefStore.addLegend();
            },

            configureSpecifics : function () {
                var datasetStore = this,
                    chart = datasetStore.chart,
                    datasetConf = datasetStore.conf,
                    chartAttr = chart.jsonData ? chart.jsonData.chart : {},
                    utils = datasetStore.utils(datasetStore),
                    copyProperties = utils.copyProperties;

                // Properties specific to the funnel only
                copyProperties(chartAttr, datasetConf, [
                    ['streamlineddata', 'streamLinedData', pluckNumber, 1],
                    ['funnelyscale', 'yScale', pluckNumber, undefined, function (datasetConf) {
                        var ys = datasetConf.yScale;
                        datasetConf.yScale = (ys >= 0 && ys <= 40) ? ys / 200 : 0.2;
                    }],
                    ['usesameslantangle', 'useSameSlantAngle', pluckNumber, function (datasetConf) {
                        return datasetConf.streamLinedData ? 0 : 1;
                    }],
                    ['ishollow', 'isHollow', pluckNumber, undefined, function (datasetConf) {
                        var isHollow = datasetConf.isHollow;

                        if (isHollow === undefined) {
                            datasetConf.isHollow = datasetConf.streamLinedData ? 1 : 0;
                        }
                    }]
                ]);

                chart.config.PLOT_COLOR_INDEX_START = datasetConf.streamLinedData ? -1 : 0;
            },

            preDrawingHook : function() {
                // @todo change the architecture
                var datasetStore = this,
                    dataStoreComponent = datasetStore.components,
                    data = dataStoreComponent.data,
                    conf = datasetStore.conf;

                if (!conf.streamLinedData ) {
                    data.splice(0,0, {
                        displayValue: BLANK,
                        y: conf.sumValue
                    });
                }
            },

            prePointProcessingHookFn : function (pointsArr) {
                var datasetStore = this,
                    chart = datasetStore.chart,
                    chartConf = chart.config,
                    conf = datasetStore.conf,
                    chartWorkingWidth = chartConf.canvasWidth,
                    smartLabel = chart.linkedItems.smartLabel,
                    nonStreamLinedData = !conf.streamLinedData,
                    point, lineHeight, smartTextObj, origHeight;

                point = pointsArr[0];
                // Wrapping the first label to the whole drawing width
                point && (point.pseudoPoint = true);
                if (point && point.displayValue) {
                    smartLabel.useEllipsesOnOverflow(chart.config.useEllipsesWhenOverflow);
                    smartLabel.setStyle(point.style);
                    setLineHeight(point.style);
                    lineHeight = parseFloat(point.style.lineHeight.match(/^\d+/)[0] || conf.lineHeight, 10);
                    origHeight = smartLabel.getOriSize(point.displayValue).height;
                    smartTextObj = smartLabel.getSmartText(point.displayValue, chartWorkingWidth, origHeight);
                    point.displayValue = smartTextObj.text;
                    smartTextObj.tooltext && (point.originalText = smartTextObj.tooltext);
                    point.labelWidth = smartLabel.getOriSize(smartTextObj.text).width;
                    // Reducing the chart height to place the top most label
                    chartConf.marginTop += lineHeight + 4;
                }

                conf.totalValue = nonStreamLinedData ? (pointsArr[0].y - pointsArr[1].y) : 0;
                conf.offsetVal = function (i) {
                    return nonStreamLinedData ? -(pointsArr[i + 1] && pointsArr[i + 1].y || 0) : point.y;
                };
            },

            getPointInContext : function () {
                var context = this;

                function P (options) {
                    this.displayValue = options.displayValue;
                    this.displayValueArgs = options.displayValueArgs,
                    this.style = options.style;
                    this.appliedStyle = options.appliedStyle;
                    this.categoryLabel = options.categoryLabel;
                    this.toolText =  options.toolText;
                    this.legendCosmetics = options.legendCosmetics;
                    this.showInLegend = options.showInLegend;
                    this.y = options.y;
                    this.shadow = options.shadow;
                    this.smartTextObj = options.smartTextObj;
                    this.color = options.color;
                    this.legendItemId = options.legendItemId;
                    this.name = options.name;
                    this.alpha = options.alpha;
                    this.rawColor = options.rawColor;
                    this.rawAlpha = options.rawAlpha;
                    this.legendColor = options.legendColor;
                    this.borderColor = options.borderColor;
                    this.borderWidth = options.borderWidth;
                    this.link = options.link;
                    this.isSliced = options.isSliced;
                    this.doNotSlice = options.doNotSlice;
                    this.hoverEffects = options.hoverEffects;
                    this.rolloverProperties = options.rolloverProperties;
                }

                P.upperRadiusFactor = 1;

                P.prototype.getModifiedCurrentValue = function () {
                    return undefined;
                };

                P.prototype.getRatioK = function (currentValue, valueRadiusIncrementRatio, totalValue, maxValue) {
                    var conf = context.conf,
                        nonStreamlinedData = !conf.streamLinedData,
                        useSameSlantAngle = conf.useSameSlantAngle;

                    return nonStreamlinedData ? 0.2 + (valueRadiusIncrementRatio * totalValue) :
                                (this.y ? (useSameSlantAngle ? this.y / maxValue : Math.sqrt(this.y / maxValue)) : 1);
                };

                P.prototype.getLowestRadiusFactor = function (maxValue) {
                    var conf = context.conf,
                        nonStreamlinedData = !conf.streamLinedData,
                        useSameSlantAngle = conf.useSameSlantAngle;

                    return nonStreamlinedData ? 0.2 :
                        (this.y ? (useSameSlantAngle ? this.y / maxValue : Math.sqrt(this.y / maxValue)) : 1);
                };

                return P;
            },

            datasetCalculations : function (dataArr) {
                var datasetStore = this,
                    chart = datasetStore.chart,
                    conf = datasetStore.conf,
                    chartComponents = chart.components,
                    numberFormatter = chartComponents.numberFormatter,
                    index, length, dataObj, itemValue, res = {},
                    isStreamLinedData = conf.streamLinedData,
                    percentOfPrevious = conf.percentOfPrevious;

                res.highestValue = Number.NEGATIVE_INFINITY;
                res.refreshedData = [];
                res.sumValue = res.countPoint = 0;

                for (index = 0, length = dataArr.length; index < length; index++) {
                    dataObj = dataArr[index];

                    if (dataObj.vline) {
                        // Funnel or pyramid does not use vline. Ignoring the same if user put it mistakenly.
                        continue;
                    }

                    dataObj.cleanValue = itemValue = Math.abs(numberFormatter.getCleanValue(dataObj.value, true));

                    if (itemValue !== null) {
                        // If a valid value is provided in the configuration
                        res.hasValidPoint = true;
                        res.highestValue = res.highestValue || itemValue;
                        res.refreshedData.push(dataObj);
                        res.sumValue += itemValue;
                        res.countPoint += 1;
                        res.highestValue = Math.max(res.highestValue, itemValue);
                    }
                }

                if (isStreamLinedData) {
                    res.sumValue = res.highestValue;
                    percentOfPrevious && (res.prevPerValReq = true);
                }

                return res;
            },

            draw : function () {
                this._configure();

                var datasetStore = this,
                    chart = datasetStore.chart,
                    graphics = chart.graphics,
                    jobList = chart.getJobList(),
                    chartConfig = chart.config,
                    conf = datasetStore.conf,
                    utils = datasetStore.utils(datasetStore),
                    trackerArgs = datasetStore.trackerArgs = [],
                    getSumValueOfObjArrByKey = utils.getSumValueOfObjArrByKey,
                    DistributionMatrix = utils.DistributionMatrix,
                    calculatePositionCoordinate = datasetStore.calculatePositionCoordinate,
                    psmMargin = {
                        top : chartConfig.marginTop,
                        bottom: chartConfig.marginBottom
                    },
                    dataStore = datasetStore.components.data,
                    index, length, plotObj, unitHeight,
                    dlGroup = graphics.datalabelsGroup,
                    streamLinedData = conf.streamLinedData,
                    heightAllotted, widthAllotted, drawingRadius, x,
                    section = 2,
                    dataStoreLength = dataStore.length,
                    maxDataValue = conf.maxValue = dataStore[0].y,
                    minDataValue = conf.minValue = dataStore[dataStoreLength - 1].y,
                    uhMockNonStreamLine, mvMockNonStreamLine, lastRadius, alignmentType, uh,
                    distributionKey, currentSliceHeight = 0, blockLabelLenFromOffset,
                    blockLenFromOffset = 0,
                    lineHeight = conf.lineHeight,
                    mFloorFn = Math.floor, mMinFn = Math.min, distributedResult,
                    dMatrix, adMatrix, curr, ele, forceKeys, fKey,
                    slicingDistance, noOfGap, halfDistance,
                    singletonCase, distributionMatrix,
                    plotItemArr = datasetStore.graphics.plotItems,
                    plotItems = [],
                    postPlotCallbackInitiated;

                datasetStore.labelDrawingConfig = datasetStore.labelDrawingConfig || [];
                datasetStore.labelDrawingConfig.length = 0;

                if (!conf.sumValue) { return; }

                // Plot area management to decide the drawing area measurement
                datasetStore.preDrawingSpaceManagement();

                datasetStore.hide(datasetStore.graphics.plotItems);

                datasetStore.rolloverResponseSetter = function (elem, elemHoverAttr) {
                    return function (data) {
                        var ele = this;
                        elem.graphic.attr(elemHoverAttr);
                        plotEventHandler.call(ele, chart, data, ROLLOVER);
                    };
                };

                datasetStore.rolloutResponseSetter = function (elem, elemUnHoverAttr) {
                    return function (data) {
                        var ele = this;
                        elem.graphic.attr(elemUnHoverAttr);
                        plotEventHandler.call(ele, chart, data, ROLLOUT);
                    };
                };

                datasetStore.legendClickHandler = function (plotItem) {
                    return function () {
                        datasetStore.legendClick(plotItem, true, false);
                    };
                };

                datasetStore.animateFunction = function(group){
                    return function() {
                        chart._animCallBack();
                        group.attr({
                            opacity: 1
                        });
                    };
                };

                datasetStore.postPlotCallback = function () { };

                chartConfig.canvasTop += chartConfig.marginTop - psmMargin.top;
                chartConfig.effCanvasHeight =
                    heightAllotted = chartConfig.canvasHeight - (chartConfig.marginTop + chartConfig.marginBottom) +
                                    (psmMargin.top + psmMargin.bottom);
                chartConfig.effCanvasWidth =
                    widthAllotted = chartConfig.width - (chartConfig.marginLeft + chartConfig.marginRight);
                drawingRadius = conf.drawingRadius =  widthAllotted / section;
                x = conf.x = drawingRadius + chartConfig.canvasLeft;
                slicingDistance = conf.slicingDistance;
                halfDistance = slicingDistance / 2;

                if (streamLinedData && dataStoreLength < 2) {
                    return;
                }

                if (!streamLinedData) {
                    uh = unitHeight = maxDataValue ? heightAllotted / maxDataValue : heightAllotted;
                } else {
                    unitHeight = heightAllotted / (maxDataValue - minDataValue);
                    mvMockNonStreamLine = getSumValueOfObjArrByKey(dataStore, 'value');
                    uh = uhMockNonStreamLine = mvMockNonStreamLine ? heightAllotted / mvMockNonStreamLine :
                     heightAllotted;
                }

                conf.unitHeight = unitHeight;
                conf.lastRadius = lastRadius = drawingRadius;

                // For funnel no x shift calculation required since the shape of the funnel causes the labels to be
                // placed in non overlapping fashion
                conf.globalMinXShift = 0;

                // Defines how to align the labels of the chart.
                alignmentType = conf.alignmentType = {};

                // Default alignment is labels placing in the right side of the pyramid, and chart is left aligned
                alignmentType['default'] = 1;
                alignmentType.alternate = 2;

                // Length of distribution matrix is how many labels ca be placed at one
                // side of the pyramid without overlapping
                distributionMatrix = new DistributionMatrix(mFloorFn(heightAllotted / lineHeight));


                for(index = 0, length = dataStoreLength; index < length; index++){
                    plotObj = dataStore[index];

                    if((!streamLinedData && index === 0) || (!streamLinedData && index === length - 1)){
                        // For non streamedlineData the first element contains the total hence continue
                        distributionMatrix.forcePush(plotObj, index);
                        continue;
                    }
                    currentSliceHeight = plotObj.y * uh;
                    // Effective length of the current slice from the top of pyramid drawing
                    blockLenFromOffset += (plotObj.y * uh);
                    blockLabelLenFromOffset = blockLenFromOffset - currentSliceHeight + (currentSliceHeight / 2);
                    distributionKey = mFloorFn(blockLabelLenFromOffset / lineHeight);
                    distributionMatrix.push(plotObj, distributionKey);
                }

                distributedResult = distributionMatrix.getDistributedResult();

                // Alternatively merge the data after distribution
                dataStore.length = 0;
                if((distributedResult.matrix)[1] === undefined){
                    [].push.apply(dataStore, (distributedResult.matrix)[0]);
                }else{
                    dMatrix = (distributedResult.matrix)[0];
                    adMatrix = (distributedResult.matrix)[1];
                    length = Math.max(dMatrix.length, adMatrix.length);
                    for(index = 0; index < length; index++){
                        ele = dMatrix[index];
                        curr = adMatrix[index];
                        dataStore.push(ele ? ele : curr);
                    }
                }

                // Placing the elements to be forced in distribution matrix
                forceKeys = Object.keys(distributedResult.forceMatrix);
                if(forceKeys.length > 0){
                    for(fKey in distributedResult.forceMatrix){
                        [].splice.apply(dataStore, [parseInt(fKey, 10), 0].concat(distributedResult.forceMatrix[fKey]));
                    }
                }

                switch(distributedResult.suggestion){
                    case alignmentType['default']:
                        calculatePositionCoordinate.call(datasetStore, dataStore, false);
                        break;

                    case alignmentType.alternate:
                        conf.labelAlignment = alignmentType.alternate;
                        // 1st section for left labels, 2nd sector for chart itself, 3rd section for right label
                        section = 3;
                        drawingRadius = widthAllotted / section;
                        chartConfig.canvasLeft = (chartConfig.canvasWidth / 2) - (drawingRadius);
                        x = conf.x = chartConfig.canvasLeft + drawingRadius;
                        lastRadius = drawingRadius;
                        calculatePositionCoordinate.call(datasetStore, dataStore, true);
                        break;
                }

                if(noOfGap = conf.noOfGap) {
                    conf.perGapDistance = mMinFn(halfDistance * 1.5, slicingDistance / noOfGap);
                    conf.distanceAvailed = halfDistance;
                }

                dlGroup.trackTooltip(true);

                singletonCase = (streamLinedData && dataStore.length == 2 || dataStore.length == 1);

                index = dataStore.length;

                if (!plotItemArr) {
                    datasetStore.graphics.plotItems = [];
                }

                // dlGroup.attr({
                //     opacity: 0
                // });

                if (conf.alreadyPlotted) {
                    datasetStore.postPlotCallback = function () {
                        if (postPlotCallbackInitiated){
                            return;
                        }

                        postPlotCallbackInitiated = true;

                        datasetStore.animateFunction(dlGroup)();
                    };
                }

                while (index--) {
                    plotItems.push(datasetStore.drawIndividualPlot(dataStore[index], index));
                }

                !conf.alreadyPlotted && datasetStore.animateElements(plotItems, 'graphic', [], {
                    pre: {opacity: 0},
                    post: {opacity: 100}
                }, datasetStore.animateFunction(dlGroup));

                conf.connectorEndSwitchHistoryY = {};

                index = dataStore.length;
                while (index--) {
                    trackerArgs.push(dataStore[index]);
                }

                jobList.labelDrawID.push(schedular.addJob(datasetStore.drawAllLabels, datasetStore, [],
                    lib.priorityList.label));

                jobList.trackerDrawID.push(schedular.addJob(datasetStore.drawAllTrackers, datasetStore, [],
                    lib.priorityList.tracker));

                conf.alreadyPlotted = true;
            },

            drawIndividualPlot : function (point, index) {
                var datasetStore = this,
                    conf = datasetStore.conf,
                    plotItems = datasetStore.graphics.plotItems,
                    value = point.y,
                    displayValue = point.displayValue,
                    chartSliced = conf.isSliced,
                    labelAlign = point.labelAline,
                    css = point.appliedStyle,
                    parentCSS = point.style,
                    textDirection = BLANK,
                    data = datasetStore.components.data,
                    chart = datasetStore.chart,
                    chartGraphics = chart.graphics,
                    trackerGroup = chartGraphics.trackerGroup,
                    sliced, plotItem, translateXY,
                    paper = chart.components.paper,
                    setLink = !!point.link,
                    distanceAvailed = conf.distanceAvailed,
                    legend = chart.components.legend,
                    animationDuration = chart.get(configStr, animationObjStr).duration,
                    labelDrawingConfigArr = datasetStore.labelDrawingConfig,
                    setRolloutAttr,
                    setRolloverAttr,
                    setRolloverProperties,
                    sliceContext,
                    pointFill,
                    labelDrawingConfig,
                    textDrawingArgs;

                // If all plots are sliced, then set flag to false, to make the first
                // slicing click on any of the plots will make it sliced.
                sliced = chartSliced ? 1 : point.isSliced;

                pointFill = (css && css.color) ||  (parentCSS && parentCSS.color) || datasetStore._chartLevelAttr.color;


                textDrawingArgs = {
                    text: displayValue,
                    ishot: true,
                    direction: textDirection,
                    cursor: setLink ? POINTER : BLANK,
                    x: 0,
                    y: 0,
                    fill: pointFill,
                    'text-anchor': textHAlign[labelAlign]
                };

                if (value === null || value === undefined || !point.shapeArgs) {
                    labelDrawingConfigArr[index] = (labelDrawingConfig = {
                        args: textDrawingArgs,
                        css: css,
                        point: point
                    });

                    return;
                }

                if (!(plotItem = plotItems[index])) {
                    point.shapeArgs.graphics = plotItem;
                    point.shapeArgs.animationDuration = animationDuration;

                    point.plot = plotItem = plotItems[index] = {
                        graphic: datasetStore.pyramidFunnelShape(point.shapeArgs).attr({
                            fill: point.color,
                            'stroke-width': point.borderWidth,
                            stroke: point.borderColor
                        }),

                        trackerObj: paper.path(trackerGroup)
                    };

                    labelDrawingConfigArr[index] = (labelDrawingConfig = {
                        args: textDrawingArgs,
                        css: css,
                        point: point
                    });

                } else {
                    point.plot = plotItem;
                    point.shapeArgs.graphics = plotItem.graphic;
                    point.shapeArgs.animationDuration = animationDuration;
                    plotItem.graphic = datasetStore.pyramidFunnelShape(point.shapeArgs).attr({
                        fill: point.color,
                        'stroke-width': point.borderWidth,
                        stroke: point.borderColor
                    });
                    plotItem.graphic.show();

                    labelDrawingConfigArr[index] = (labelDrawingConfig = {
                        args: textDrawingArgs,
                        css: css,
                        point: point
                    });
                }

                if (conf.showTooltip) {
                    plotItem.trackerObj.tooltip(point.toolText);
                } else {
                    plotItem.trackerObj.tooltip(false);
                }

                plotItem.value = value;
                plotItem.displayValue = displayValue;
                plotItem.sliced = !!sliced;
                plotItem.cursor = setLink ? POINTER : BLANK;
                plotItem.x = point.x;
                plotItem.index = index;

                legend.configureItems(data[index].legendItemId, {
                    legendClickFN: datasetStore.legendClickHandler({
                        datasetStore: datasetStore,
                        plotItem: plotItem
                    })
                });

                // Hover consmetics
                setRolloutAttr = setRolloverAttr = {};
                if (point.hoverEffects) {
                    setRolloutAttr = {
                        color: point.rawColor,
                        opacity: point.rawAlpha,
                        'stroke-width': point.borderWidth,
                        stroke: point.borderColor
                    };

                    setRolloverProperties = point.rolloverProperties;

                    setRolloverAttr = {
                        color: setRolloverProperties.color,
                        opacity: setRolloverProperties.alpha,
                        'stroke-width': setRolloverProperties.borderWidth,
                        stroke: setRolloverProperties.borderColor
                    };
                }

                sliceContext = {
                    datasetStore: datasetStore,
                    plotItem: plotItem
                };

                plotItem.trackerObj.unclick(datasetStore.slice);
                !point.doNotSlice && plotItem.trackerObj.click(datasetStore.slice, sliceContext);

                plotItem.trackerObj.mouseup(datasetStore.plotMouseUp, plotItem);

                plotItem.trackerObj.hover(datasetStore.rolloverResponseSetter(plotItem, setRolloverAttr),
                    datasetStore.rolloutResponseSetter(plotItem, setRolloutAttr));

                labelDrawingConfig.context = sliceContext;
                labelDrawingConfig.actions = {
                    click: datasetStore.slice,
                    hover: [datasetStore.rolloverResponseSetter(plotItem, setRolloverAttr),
                        datasetStore.rolloutResponseSetter(plotItem, setRolloutAttr)]
                };

                plotItem.dy = 0;

                if (conf.noOfGap) {
                    if (distanceAvailed) {
                        plotItem._startTranslateY = translateXY = 't0,' + distanceAvailed;
                        plotItem.dy = plotItem.distanceAvailed = distanceAvailed;

                        plotItem.graphic.attr({
                            transform: translateXY
                        });

                        labelDrawingConfig.transform = translateXY;
                    }

                    if (conf.slicingGapPosition[point.x]) {
                        conf.distanceAvailed -= conf.perGapDistance;
                    }
                }

                plotItem && (plotItem.point = point);
                return plotItem;
            },

            getTooltipMacroStub : function (options) {
                var datasetStore = this,
                    chart = datasetStore.chart,
                    conf = datasetStore.conf,
                    chartComponents = chart.components,
                    numberFormatter = chartComponents.numberFormatter,
                    base =  datasetStore.__base__,
                    baseStub, percentOfPrevValue;

                if (conf.streamLinedData){
                    percentOfPrevValue  = conf.percentOfPrevious ? options.pValue :
                        numberFormatter.percentValue(options.dataValue / options.prevValue * 100);
                }

                baseStub = base.getTooltipMacroStub(options);
                baseStub.percentValue =  conf.percentOfPrevious ?
                    numberFormatter.percentValue(options.dataValue / options.highestValue * 100) : options.pValue,
                baseStub.percentOfPrevValue = percentOfPrevValue;

                return baseStub;
            }

        }, 'FunnelPyramidBase']);
    }]);

FusionCharts.register('module', ['private', 'modules.renderer.js-dataset-pyramid',
    function () {
        var global = this,
            lib = global.hcLib,
            //strings
            BLANK = lib.BLANKSTRING,
            pluckNumber = lib.pluckNumber,
            preDefStr = lib.preDefStr,
            configStr = preDefStr.configStr,
            animationObjStr = preDefStr.animationObjStr,
            POSITION_START = preDefStr.POSITION_START,
            POSITION_END = preDefStr.POSITION_END,
            POSITION_MIDDLE = preDefStr.POSITION_MIDDLE,
            win = global.window,
            userAgent = win.navigator.userAgent,

            isIE = /msie/i.test(userAgent) && !win.opera,
            TRACKER_ALPHA = isIE ? 0.002 : 0.000001,
            POINTER = 'pointer',
            COMPONENT = 'component',
            DATASET = 'dataset',
            plotEventHandler = lib.plotEventHandler,
            ROLLOVER = 'DataPlotRollOver',
            ROLLOUT = 'DataPlotRollOut',

            schedular = lib.schedular,

            textHAlign = {
                right: POSITION_END,
                left: POSITION_START,
                middle: POSITION_MIDDLE,
                start: POSITION_START,
                end: POSITION_END,
                center: POSITION_MIDDLE,
                'undefined': BLANK,
                BLANK: BLANK
            };

        FusionCharts.register(COMPONENT, [DATASET, 'Pyramid', {
            type : 'pyramid',

            LABEL_PLACEMENT_ITERATOR_INDEX_START: 0,

            configure : function () {
                var datasetDefStore = this;

                if (!datasetDefStore._checkValidData(datasetDefStore.JSONData.data)) { return; }

                datasetDefStore.addLegend();
            },

            configureSpecifics : function () {
                var datasetStore = this,
                    chart = datasetStore.chart,
                    datasetConf = datasetStore.conf,
                    chartAttr = chart.jsonData ? chart.jsonData.chart : {},
                    utils = datasetStore.utils(datasetStore),
                    copyProperties = utils.copyProperties;

                copyProperties(chartAttr, datasetConf, [
                    ['pyramidyscale', 'yScale', pluckNumber, undefined, function (datasetConf) {
                        var ys = datasetConf.yScale;
                        datasetConf.yScale = (ys >= 0 && ys <= 40) ? ys / 200 : 0.2;
                    }],
                    ['use3dlighting', 'use3DLighting', pluckNumber, 1]
                ]);

                chart.config.PLOT_COLOR_INDEX_START = 0;
            },

            preDrawingHook : function() { },

            draw : function () {
                this._configure();

                var datasetStore = this,
                    chart = datasetStore.chart,
                    jobList = chart.getJobList(),
                    chartConfig = chart.config,
                    conf = datasetStore.conf,
                    utils = datasetStore.utils(datasetStore),
                    DistributionMatrix = utils.DistributionMatrix,
                    trackerArgs = datasetStore.trackerArgs = [],
                    calculatePositionCoordinate = datasetStore.calculatePositionCoordinate,
                    psmMargin = {
                        top : chartConfig.marginTop,
                        bottom: chartConfig.marginBottom
                    },
                    dataStore = datasetStore.components.data,
                    index, length, plotObj, unitHeight,
                    graphics = chart.graphics,
                    dlGroup = graphics.datalabelsGroup,
                    streamLinedData = conf.streamLinedData,
                    heightAllotted, widthAllotted, drawingRadius, x,
                    section = 2,
                    dataStoreLength = dataStore.length,
                    lastRadius, alignmentType,
                    distributionKey, currentSliceHeight = 0, blockLabelLenFromOffset,
                    blockLenFromOffset = 0,
                    lineHeight = conf.lineHeight,
                    mFloorFn = Math.floor, mMinFn = Math.min, distributedResult,
                    dMatrix, adMatrix, curr, ele,
                    slicingDistance, noOfGap, halfDistance,
                    singletonCase, distributionMatrix, inclination,
                    plotItemArr = datasetStore.graphics.plotItems,
                    plotItems = [],
                    postPlotCallbackInitiated;

                if (!conf.sumValue) { return; }

                datasetStore.labelDrawingConfig = datasetStore.labelDrawingConfig || [];
                datasetStore.labelDrawingConfig.length = 0;

                // Plot area management to decide the drawing area measurement
                datasetStore.preDrawingSpaceManagement();

                datasetStore.hide(datasetStore.graphics.plotItems);

                datasetStore.rolloverResponseSetter = function (elem, elemHoverAttr) {
                    return function (data) {
                        var ele = this;
                        elem.graphic.attr(elemHoverAttr);
                        plotEventHandler.call(ele, chart, data, ROLLOVER);
                    };
                };

                datasetStore.rolloutResponseSetter = function (elem, elemUnHoverAttr) {
                    return function (data) {
                        var ele = this;
                        elem.graphic.attr(elemUnHoverAttr);
                        plotEventHandler.call(ele, chart, data, ROLLOUT);
                    };
                };

                datasetStore.legendClickHandler = function (plotItem) {
                    return function () {
                        datasetStore.legendClick(plotItem, true, false);
                    };
                };

                datasetStore.animateFunction = function(group){
                    return function() {
                        chart._animCallBack();
                        group.attr({
                            opacity: 1
                        });
                    };
                };

                datasetStore.postPlotCallback = function () { };

                chartConfig.canvasTop += chartConfig.marginTop - psmMargin.top;
                chartConfig.effCanvasHeight =
                    heightAllotted = chartConfig.canvasHeight - (chartConfig.marginTop + chartConfig.marginBottom) +
                                    (psmMargin.top + psmMargin.bottom);
                chartConfig.effCanvasWidth = widthAllotted = chartConfig.width - (chartConfig.marginLeft +
                    chartConfig.marginRight);
                drawingRadius = conf.drawingRadius =  widthAllotted / section;
                x = conf.x = drawingRadius + chartConfig.canvasLeft;
                slicingDistance = conf.slicingDistance;
                halfDistance = slicingDistance / 2;

                inclination = Math.atan((widthAllotted / 2) / heightAllotted);

                conf.unitHeight = unitHeight = heightAllotted / conf.sumValue;
                conf.lastRadius = lastRadius = 0;

                // For funnel no x shift calculation required since the shape of the funnel causes the labels to be
                // placed in non overlapping fashion
                conf.globalMinXShift = Math.floor((lineHeight) / Math.cos(inclination));

                // Defines how to align the labels of the chart.
                alignmentType = conf.alignmentType = {};

                // Default alignment is labels placing in the right side of the pyramid, and chart is left aligned
                alignmentType['default'] = 1;
                alignmentType.alternate = 2;

                // Length of distribution matrix is how many labels ca be placed at one
                // side of the pyramid without overlapping
                distributionMatrix = new DistributionMatrix(mFloorFn(heightAllotted / lineHeight));


                for(index = 0, length = dataStoreLength; index < length; index++){
                    plotObj = dataStore[index];

                    currentSliceHeight = plotObj.y * unitHeight;
                    // Effective length of the current slice from the top of pyramid drawing
                    blockLenFromOffset += (plotObj.y * unitHeight);
                    blockLabelLenFromOffset = blockLenFromOffset - currentSliceHeight + (currentSliceHeight / 2);
                    distributionKey = mFloorFn(blockLabelLenFromOffset / lineHeight);
                    distributionMatrix.push(plotObj, distributionKey);
                }

                distributedResult = distributionMatrix.getDistributedResult();

                // Alternatively merge the data after distribution
                dataStore.length = 0;
                if((distributedResult.matrix)[1] === undefined){
                    [].push.apply(dataStore, (distributedResult.matrix)[0]);
                }else{
                    dMatrix = (distributedResult.matrix)[0];
                    adMatrix = (distributedResult.matrix)[1];
                    length = Math.max(dMatrix.length, adMatrix.length);
                    for(index = 0; index < length; index++){
                        ele = dMatrix[index];
                        curr = adMatrix[index];
                        dataStore.push(ele ? ele : curr);
                    }
                }

                switch(distributedResult.suggestion){
                    case alignmentType['default']:
                        calculatePositionCoordinate.call(datasetStore, dataStore, false);
                        break;

                    case alignmentType.alternate:
                        conf.labelAlignment = alignmentType.alternate;
                        // 1st section for left labels, 2nd sector for chart itself, 3rd section for right label
                        section = 3;
                        conf.drawingRadius = drawingRadius = widthAllotted / section;
                        chartConfig.canvasLeft = (chartConfig.canvasWidth / 2) - (drawingRadius);
                        x = conf.x = chartConfig.canvasLeft + drawingRadius;
                        lastRadius = drawingRadius;
                        calculatePositionCoordinate.call(datasetStore, dataStore, true);
                        break;
                }

                if(noOfGap = conf.noOfGap) {
                    conf.perGapDistance = mMinFn(halfDistance * 1.5, slicingDistance / noOfGap);
                    conf.distanceAvailed = halfDistance;
                }

                dlGroup.trackTooltip(true);

                singletonCase = (streamLinedData && dataStore.length == 2 || dataStore.length == 1);

                index = dataStore.length;

                if (!plotItemArr) {
                    plotItemArr = datasetStore.graphics.plotItems = [];
                }

                // dlGroup.attr({
                //     opacity: 0
                // });

                if (conf.alreadyPlotted) {
                    datasetStore.postPlotCallback = function () {
                        if (postPlotCallbackInitiated){
                            return;
                        }

                        postPlotCallbackInitiated = true;

                        datasetStore.animateFunction(dlGroup)();
                    };
                }

                while (index--) {
                    plotItems.push(datasetStore.drawIndividualPlot(dataStore[index], index));
                }

                !conf.alreadyPlotted && datasetStore.animateElements(plotItems, 'graphic', [], {
                    pre: { opacity: TRACKER_ALPHA },
                    post: { opacity: 100 }
                }, datasetStore.animateFunction(dlGroup));

                plotItemArr.splice(dataStoreLength, plotItemArr.length - dataStoreLength);

                conf.connectorEndSwitchHistoryY = {};

                index = dataStore.length;
                while (index--) {
                    trackerArgs.push(dataStore[index]);
                }

                jobList.labelDrawID.push(schedular.addJob(datasetStore.drawAllLabels, datasetStore, [],
                    lib.priorityList.label));

                jobList.trackerDrawID.push(schedular.addJob(datasetStore.drawAllTrackers, datasetStore, [],
                        lib.priorityList.tracker));

                conf.alreadyPlotted = true;
            },

            calculatePositionCoordinate : function (dataArr, placeOtherSide) {
                var datasetStore = this,
                    conf = datasetStore.conf,
                    is2d = conf.is2d,
                    x = conf.x,
                    plotItemArr = datasetStore.graphics.plotItems || [],
                    chart = datasetStore.chart,
                    chartConfig = chart.config,
                    y = chartConfig.canvasTop,
                    unitHeight = conf.unitHeight,
                    labelDistance = conf.labelDistance,
                    showLabelsAtCenter = conf.showLabelsAtCenter,
                    fontSize = chartConfig.style.fontSize,
                    yShift = fontSize * 0.3,
                    yScale = conf.yScale,
                    blankSpace = conf.blankSpace,
                    lastRadius = conf.lastRadius,
                    smartLabel = chart.linkedItems.smartLabel,
                    index, length,
                    point, sliceHeight,
                    lastIndex = dataArr.length - 1,
                    alignmentSwitchToggle = false,
                    distributionOffset = 0,
                    labelMeasurement, newRadius,
                    negativeSpanningDataEnd,
                    normalizedLabel,
                    lineHeight = conf.lineHeight,
                    totalValues = 0,
                    // Base of the  maximum trimmed label.
                    trimmedInfo = {
                        flag: false,
                        point: undefined,
                        sLabel: undefined,
                        setAll: function(flag, point, sLabel){
                            this.flag = flag;
                            this.point = point;
                            this.sLabel = sLabel;
                        }
                    },
                    // Base of the maximum spanned labels
                    largestLabel = {
                        point: undefined,
                        sLabel: undefined,
                        set: function(calcFn, predicate){
                            var _calcFn = calcFn,
                                _predicate = predicate;
                            return function(point, sLabel){
                                var existingLabelSpan,
                                    currentLabelSpan;
                                if(point.dontPlot){
                                    return;
                                }

                                if(!(this.point && this.sLabel)){
                                    this.point = point;
                                    this.sLabel = sLabel;
                                    return;
                                }
                                existingLabelSpan = _calcFn(this.point, this.sLabel);
                                currentLabelSpan = _calcFn(point, sLabel);
                                if(_predicate(existingLabelSpan, currentLabelSpan)){
                                    this.point = point;
                                    this.sLabel = sLabel;
                                    return;
                                }
                            };
                        }
                    },
                    leftTrimmedInfo = {},
                    rightTrimmedInfo = {},
                    lLargestLabel = {},
                    rLargestLabel = {},
                    xPos,
                    chartWidth = chart.config.width - 2,
                    slicingGapPosition = conf.slicingGapPosition = {};

                global.extend(leftTrimmedInfo, trimmedInfo);
                global.extend(rightTrimmedInfo, trimmedInfo);

                leftTrimmedInfo.setAll = function(flag, point, sLabel){
                    var _point = this.point,
                        _sLabel = this.sLabel,
                        existingLabelSpan,
                        currentLabelSpan;

                    this.flag = flag;
                    if(!(_point && _sLabel)){
                        this.point = point;
                        this.sLabel = sLabel;
                        return;
                    }
                    existingLabelSpan = _point.labelX - (_sLabel.oriTextWidth - _sLabel.width);
                    currentLabelSpan = point.labelX - (sLabel.oriTextWidth - sLabel.width);
                    if(existingLabelSpan > currentLabelSpan){
                        this.point = point;
                        this.sLabel = sLabel;
                    }
                };

                // Override the base class method for labels which are kept right
                rightTrimmedInfo.setAll = function(flag, point, sLabel){
                    var _point = this.point,
                        _sLabel = this.sLabel,
                        existingLabelSpan,
                        currentLabelSpan;

                    this.flag = flag;
                    if(!(_point && _sLabel)){
                        this.point = point;
                        this.sLabel = sLabel;
                        return;
                    }
                    existingLabelSpan = _point.labelX + _sLabel.oriTextWidth;
                    currentLabelSpan = point.labelX + sLabel.oriTextWidth;
                    if(existingLabelSpan < currentLabelSpan){
                        this.point = point;
                        this.sLabel = sLabel;
                    }
                };

                global.extend(lLargestLabel, largestLabel);
                global.extend(rLargestLabel, largestLabel);

                lLargestLabel.set = (function(){
                    return largestLabel.set.apply(lLargestLabel, [function(point){
                        return point.labelX;
                    }, function(existingLabelSpan, currentLabelSpan){
                        return existingLabelSpan > currentLabelSpan ? true : false;
                    }]);
                })();

                rLargestLabel.set = (function(){
                    return largestLabel.set.apply(rLargestLabel, [function(point, sLabel){
                        return point.labelX + sLabel.oriTextWidth;
                    }, function(existingLabelSpan, currentLabelSpan){
                        return existingLabelSpan < currentLabelSpan ? true : false;
                    }]);
                })();

                conf.noOfGap = 0;
                smartLabel.useEllipsesOnOverflow(chartConfig.useEllipsesWhenOverflow);
                for(index = 0, length = dataArr.length; index < length ; index++){
                    point = dataArr[index];
                    if(!point){
                        continue;
                    }
                    point.x = index;
                    if (plotItemArr[index]) {
                        point.isSliced = plotItemArr[index].sliced || !!point.isSliced || !!conf.isSliced;
                    }

                    placeOtherSide && (alignmentSwitchToggle = !alignmentSwitchToggle);

                    if (point.isSliced) {
                        xPos = point.x;
                        if (xPos && !slicingGapPosition[xPos]) {
                            slicingGapPosition[xPos] = true;
                            conf.noOfGap += 1;
                        }
                        if (xPos < lastIndex) {
                            slicingGapPosition[xPos + 1] = true;
                            conf.noOfGap += 1;
                        }
                    }

                    smartLabel.setStyle(point.style);
                    point.oriText = point.displayValue;
                    labelMeasurement = labelMeasurement = smartLabel
                        .getSmartText(point.displayValue, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);

                    totalValues += point.y;
                    newRadius = conf.drawingRadius * totalValues / conf.sumValue;
                    sliceHeight = unitHeight * point.y;
                    point.shapeArgs =
                    {
                        x: x,
                        y: y,
                        R1: lastRadius,
                        R2: newRadius,
                        h: sliceHeight,
                        r3dFactor: yScale,
                        gStr: 'point',
                        is2D: is2d,
                        use3DLighting: !!conf.use3DLighting,
                        renderer: chart.components.paper
                    };

                    if (showLabelsAtCenter) {
                        point.labelAline = POSITION_MIDDLE;
                        point.labelX = x;
                        point.labelY = (is2d ? y : y + (yScale * lastRadius)) + (sliceHeight / 2) + yShift;
                    }
                    else {
                        point.labelAline = POSITION_START;
                        point.alignmentSwitch = alignmentSwitchToggle;
                        point.distributionFactor = point.distributionFactor || 0;

                        if(alignmentSwitchToggle){
                            point.labelX = x - (labelDistance + (newRadius + lastRadius) / 2 +
                                blankSpace + labelMeasurement.width);
                            point.labelX -= point.distributionFactor * conf.globalMinXShift;
                            lLargestLabel.set(point, labelMeasurement);
                        }else{
                            point.labelX = x + labelDistance + (newRadius + lastRadius) / 2 + blankSpace;
                            point.labelX += point.distributionFactor * conf.globalMinXShift;
                            rLargestLabel.set(point, labelMeasurement);
                        }
                        distributionOffset = point.distributionFactor * lineHeight;

                        point.labelY = y + yShift + (sliceHeight / 2) + distributionOffset;
                    }

                    // Checking text overflow for alternate alignment
                    if(placeOtherSide){
                        if(alignmentSwitchToggle && (point.labelX < 0)){
                            // Left and behind the margin
                            negativeSpanningDataEnd = point.labelX + labelMeasurement.width;
                            normalizedLabel = smartLabel.getSmartText(point.displayValue, negativeSpanningDataEnd,
                                Number.POSITIVE_INFINITY, true);
                            point.labelX = 2;
                            point.isLabelTruncated = true;
                            point.displayValue = normalizedLabel.text;
                            point.virtualWidth = normalizedLabel.maxWidth;
                            leftTrimmedInfo.setAll(true, point, normalizedLabel);
                        } else if (!alignmentSwitchToggle && (point.labelX + labelMeasurement.width > chartWidth)){
                            // Right side and spanning the margin
                            normalizedLabel = smartLabel.getSmartText(point.displayValue, chartWidth -
                                point.labelX, Number.POSITIVE_INFINITY, true);
                            point.isLabelTruncated = true;
                            point.displayValue = normalizedLabel.text;
                            point.virtualWidth = normalizedLabel.maxWidth;
                            rightTrimmedInfo.setAll(true, point, normalizedLabel);
                        }

                        point.pWidth = point.virtualWidth || labelMeasurement.width;
                        distributionOffset = point.distributionFactor * lineHeight;
                        point.labelY = y + yShift + (sliceHeight / 2) + distributionOffset;
                    }

                    y += sliceHeight;
                    point.plotX = x;
                    point.plotY = y - sliceHeight / 2;
                    lastRadius = newRadius;
                    point.virtualWidth = point.virtualWidth || labelMeasurement.width;
                }

                // Recalculate the space one more time. Ideally this should be given by space manager.
                // However in the current scope space manager cannot be called from here.
                datasetStore.findBestPosition.call(datasetStore, dataArr, {
                    'lTrimmedInfo': leftTrimmedInfo,
                    'rTrimmedInfo': rightTrimmedInfo,
                    'lLargestLabel': lLargestLabel,
                    'rLargestLabel': rLargestLabel
                });
            },

            getPointInContext : function () {
                var context = this;

                function P (options) {
                    this.displayValue = options.displayValue;
                    this.displayValueArgs = options.displayValueArgs,
                    this.style = options.style;
                    this.appliedStyle = options.appliedStyle;
                    this.categoryLabel = options.categoryLabel;
                    this.toolText =  options.toolText;
                    this.legendCosmetics = options.legendCosmetics;
                    this.showInLegend = options.showInLegend;
                    this.y = options.y;
                    this.legendColor = options.legendColor;
                    this.shadow = options.shadow;
                    this.smartTextObj = options.smartTextObj;
                    this.color = options.color;
                    this.alpha = options.alpha;
                    this.name = options.name;
                    this.legendItemId = options.legendItemId;
                    this.rawColor = options.rawColor;
                    this.rawAlpha = options.rawAlpha;
                    this.borderColor = options.borderColor;
                    this.borderWidth = options.borderWidth;
                    this.link = options.link;
                    this.isSliced = options.isSliced;
                    this.doNotSlice = options.doNotSlice;
                    this.hoverEffects = options.hoverEffects;
                    this.rolloverProperties = options.rolloverProperties;
                }

                P.upperRadiusFactor = 0;

                P.prototype.getModifiedCurrentValue = function (totalValue) {
                    return totalValue + (this.y / 2);
                };

                P.prototype.getRatioK = function (currentValue) {
                    var conf = context.conf;
                    return currentValue ? currentValue / conf.sumValue : 1;
                };

                P.prototype.getLowestRadiusFactor = function () {
                    return 1;
                };

                return P;
            },

            drawIndividualPlot : function (point, index) {
                var datasetStore = this,
                    conf = datasetStore.conf,
                    plotItems = datasetStore.graphics.plotItems,
                    value = point.y,
                    displayValue = point.displayValue,
                    chartSliced = conf.isSliced,
                    textDirection = BLANK,
                    chart = datasetStore.chart,
                    data = datasetStore.components.data,
                    chartGraphics = chart.graphics,
                    trackerGroup = chartGraphics.trackerGroup,
                    sliced, plotItem, translateXY,
                    paper = chart.components.paper,
                    setLink = !!point.link,
                    distanceAvailed = conf.distanceAvailed,
                    setRolloutAttr,
                    labelAlign = point.labelAline,
                    css = point.appliedStyle,
                    parentCSS = point.style,
                    setRolloverAttr,
                    setRolloverProperties,
                    sliceContext,
                    legend = chart.components.legend,
                    textDrawingArgs,
                    animationDuration = chart.get(configStr, animationObjStr).duration,
                    labelDrawingConfigArr = datasetStore.labelDrawingConfig,
                    pointFill,
                    labelDrawingConfig;

                pointFill = (css && css.color) ||  (parentCSS && parentCSS.color) || datasetStore._chartLevelAttr.color;
                sliced = chartSliced ? 1 : point.isSliced;

                textDrawingArgs = {
                    text: displayValue,
                    ishot: true,
                    direction: textDirection,
                    cursor: setLink ? POINTER : BLANK,
                    x: 0,
                    y: 0,
                    fill: pointFill,
                    'text-anchor': textHAlign[labelAlign]
                };

                if (value === null || value === undefined || !point.shapeArgs) {
                    labelDrawingConfigArr[index] = (labelDrawingConfig = {
                        args: textDrawingArgs,
                        css: css,
                        point: point
                    });

                    return;
                }


                if (!(plotItem = plotItems[index])) {
                    point.shapeArgs.graphics = plotItem;
                    point.shapeArgs.animationDuration = animationDuration;

                    point.plot = plotItem = plotItems[index] = {
                        graphic: datasetStore.pyramidFunnelShape(point.shapeArgs).attr({
                            fill: point.color,
                            'stroke-width': point.borderWidth,
                            stroke: point.borderColor
                        }),
                        trackerObj: paper.path(trackerGroup)
                    };

                    labelDrawingConfigArr[index] = (labelDrawingConfig = {
                        args: textDrawingArgs,
                        css: css,
                        point: point
                    });
                } else {
                    point.plot = plotItem;
                    point.shapeArgs.graphics = plotItem.graphic;
                    point.shapeArgs.animationDuration = animationDuration;
                    plotItem.graphic = datasetStore.pyramidFunnelShape(point.shapeArgs).attr({
                        fill: point.color,
                        'stroke-width': point.borderWidth,
                        stroke: point.borderColor
                    });
                    plotItem.graphic.show();

                    labelDrawingConfigArr[index] = (labelDrawingConfig = {
                        args: textDrawingArgs,
                        css: css,
                        point: point
                    });
                }

                if (conf.showTooltip) {
                    plotItem.trackerObj.tooltip(point.toolText);
                } else {
                    plotItem.trackerObj.tooltip(false);
                }

                plotItem.value = value;
                plotItem.displayValue = displayValue;
                plotItem.sliced = !!sliced;
                plotItem.cursor = setLink ? POINTER : BLANK;
                plotItem.x = point.x;
                plotItem.index = index;


                legend.configureItems(data[index].legendItemId, {
                    legendClickFN: datasetStore.legendClickHandler({
                        datasetStore: datasetStore,
                        plotItem: plotItem
                    })
                });

                // Hover consmetics
                setRolloutAttr = setRolloverAttr = {};
                if (point.hoverEffects) {
                    setRolloutAttr = {
                        color: point.rawColor,
                        opacity: point.rawAlpha,
                        'stroke-width': point.borderWidth,
                        stroke: point.borderColor
                    };

                    setRolloverProperties = point.rolloverProperties;

                    setRolloverAttr = {
                        color: setRolloverProperties.color,
                        opacity: setRolloverProperties.alpha,
                        'stroke-width': setRolloverProperties.borderWidth,
                        stroke: setRolloverProperties.borderColor
                    };
                }

                sliceContext = {
                    datasetStore: datasetStore,
                    plotItem: plotItem
                };

                plotItem.trackerObj.unclick(datasetStore.slice);
                !point.doNotSlice && plotItem.trackerObj.click(datasetStore.slice, sliceContext);

                plotItem.trackerObj.mouseup(datasetStore.plotMouseUp, plotItem);

                plotItem.trackerObj.hover(datasetStore.rolloverResponseSetter(plotItem, setRolloverAttr),
                    datasetStore.rolloutResponseSetter(plotItem, setRolloutAttr));

                labelDrawingConfig.context = sliceContext;
                labelDrawingConfig.actions = {
                    click: datasetStore.slice,
                    hover: [datasetStore.rolloverResponseSetter(plotItem, setRolloverAttr),
                        datasetStore.rolloutResponseSetter(plotItem, setRolloutAttr)]
                };

                plotItem.dy = 0;

                if (conf.noOfGap) {
                    if (distanceAvailed) {
                        plotItem._startTranslateY = translateXY = 't0,' + distanceAvailed;
                        plotItem.dy = plotItem.distanceAvailed = distanceAvailed;

                        plotItem.graphic.attr({
                            transform: translateXY
                        });

                        labelDrawingConfig.transform = translateXY;
                    }

                    if (conf.slicingGapPosition[point.x]) {
                        conf.distanceAvailed -= conf.perGapDistance;
                    }
                }

                plotItem.point = point;
                return plotItem;
            },

            getTooltipMacroStub : function (options) {
                var datasetStore = this,
                    chart = datasetStore.chart,
                    conf = datasetStore.conf,
                    chartComponents = chart.components,
                    numberFormatter = chartComponents.numberFormatter,
                    base =  datasetStore.__base__,
                    baseStub, percentOfPrevValue;

                percentOfPrevValue  = conf.percentOfPrevious ? options.pValue :
                    numberFormatter.percentValue(options.dataValue / options.prevValue * 100);

                baseStub = base.getTooltipMacroStub(options);
                baseStub.percentValue =  conf.percentOfPrevious ?
                    numberFormatter.percentValue(options.dataValue / options.highestValue * 100) : options.pValue,
                baseStub.percentOfPrevValue = percentOfPrevValue;

                return baseStub;
            }

        }, 'FunnelPyramidBase']);
    }
]);

FusionCharts.register('module', ['private', 'modules.renderer.js-dataset-hlineargauge',
    function () {
        var global = this,
            lib = global.hcLib,
            pluckNumber = lib.pluckNumber,
            pluck = lib.pluck,
            COMMASTRING = lib.COMMASTRING,
            extend2 = lib.extend2,
            BLANK = lib.BLANKSTRING,
            BLANKSTRING = BLANK,

            AXISPOSITION_TOP = 1,
            AXISPOSITION_BOTTOM = 3,

            getValidValue = lib.getValidValue,
            parseUnsafeString = lib.parseUnsafeString,
            parseTooltext = lib.parseTooltext,
            convertColor = lib.graphics.convertColor,
            FILLMIXDARK10 = '{dark-10}',
            POSITION_CENTER = lib.POSITION_MIDDLE,

            preDefStr = lib.preDefStr,
            configStr = preDefStr.configStr,
            animationObjStr = preDefStr.animationObjStr,
            POSITION_TOP = preDefStr.POSITION_TOP,
            POSITION_BOTTOM = preDefStr.POSITION_BOTTOM,
            POSITION_MIDDLE = preDefStr.POSITION_MIDDLE,
            POSITION_RIGHT = lib.POSITION_RIGHT,
            POSITION_LEFT = lib.POSITION_LEFT,
            POSITION_START = preDefStr.POSITION_START,
            POSITION_END = preDefStr.POSITION_END,

            plotEventHandler = lib.plotEventHandler,
            ROLLOVER = 'DataPlotRollOver',
            ROLLOUT = 'DataPlotRollOut',

            win = global.window,
            doc = win.document,
            hasTouch = doc.documentElement.ontouchstart !== undefined,

            math = Math,
            mathMax = math.max,
            mathMin = math.min,

            POINTER = 'pointer',
            COMPONENT = 'component',
            DATASET = 'dataset',
            EVENTARGS = 'eventArgs',
            ANIM_EFFECT = 'easeIn',
            textHAlign = {
                right: POSITION_END,
                left: POSITION_START,
                middle: POSITION_MIDDLE,
                start: POSITION_START,
                end: POSITION_END,
                center: POSITION_MIDDLE,
                'undefined': BLANK,
                BLANK: BLANK
            },
             /**^ To get first touch ^*/
            getTouchEvent = function (event) {
                return (hasTouch && event.sourceEvent && event.sourceEvent.touches &&
                    event.sourceEvent.touches[0]) || event;
            };

        FusionCharts.register(COMPONENT, [DATASET, 'hlineargauge',{
            pIndex : 2,

            customConfigFn : '_createDatasets',

            init : function (pointerArr) {
                var dataSet = this;

                dataSet.pointerArr = pointerArr;
                dataSet.idMap = { };
                dataSet.configure();
            },

            configure : function () {
                var dataSet = this,
                    chart = dataSet.chart,
                    jsonData = chart.jsonData,
                    chartAttrs = jsonData.chart,
                    chartComponents = chart.components,
                    numberFormatter = chartComponents.numberFormatter,
                    colorM = chartComponents.colorManager,
                    datasetConfig = dataSet.config || (dataSet.config = {}),
                    components = dataSet.components || (dataSet.components = {}),
                    pointerArr = jsonData.pointers && jsonData.pointers.pointer,
                    len = (pointerArr && pointerArr.length) || 1,
                    dataObj,
                    data,
                    config,
                    itemValue,
                    i,
                    setToolText,
                    formatedVal,
                    tooltipSepChar,
                    setDisplayValue,
                    sides,
                    dataStore,
                    pointOrientation = {
                        top: 1,
                        right: 0,
                        left: 2,
                        bottom: 3
                    },
                    gaugeType = 1,
                    orient,
                    pointerOnOpp,
                    borderColor,
                    borderAlpha,
                    bgAlpha,
                    valueAbovePointer,
                    bgColor,
                    baseStyle = chart.config.style,
                    radius,
                    pointerBorderColor,
                    pointerBorderHoverAlpha,
                    pointerBgHoverAlpha,
                    pointerBgHoverColor,
                    pointerBorderHoverColor,
                    pointerBorderHoverThickness,
                    pointerHoverRadius,
                    borderWidth,
                    showHoverEffect,
                    hoverAttr,
                    showBorderOnHover,
                    showHoverAnimation,
                    hasHoberFillMix,
                    outAttr,
                    hasBorderHoverMix,
                    hoverAnimAttr,
                    outAnimAttr,
                    showBorder,
                    fillColor,
                    ticksBelowGauge,
                    axisPosition,
                    pointerSides,
                    chartShowHoverEffect,
                    pointerBorderThickness,
                    showValue,
                    label;

                datasetConfig.valuePadding = pluckNumber(chartAttrs.valuepadding, 2);
                datasetConfig.tooltipSepChar = tooltipSepChar = pluck(chartAttrs.tooltipsepchar, COMMASTRING);
                ticksBelowGauge = pluckNumber(chartAttrs.ticksbelowgauge, chartAttrs.ticksbelowgraph, 1);
                datasetConfig.axisPosition = axisPosition = ticksBelowGauge ? AXISPOSITION_BOTTOM : AXISPOSITION_TOP;
                datasetConfig.pointerOnOpp = pointerOnOpp = Number(!pluckNumber(chartAttrs.pointerontop,
                 ticksBelowGauge, 1));
                datasetConfig.valueabovepointer = valueAbovePointer = pluckNumber(chartAttrs.valueabovepointer,
                    !pointerOnOpp, 1);
                datasetConfig.valueInsideGauge = valueAbovePointer === pointerOnOpp ? 1 : 0;
                datasetConfig.showPointerShadow = pluckNumber(chartAttrs.showpointershadow, chartAttrs.showshadow, 1);
                datasetConfig.showTooltip = pluckNumber(chartAttrs.showtooltip, 1);
                datasetConfig.textDirection = chartAttrs.hasrtltext === '1' ? 'rtl' : BLANK;
                datasetConfig.showGaugeLabels = pluckNumber(chartAttrs.showgaugelabels, 1);
                datasetConfig.colorRangeStyle = {
                    fontFamily: baseStyle.inCanfontFamily,
                    fontSize:  baseStyle.inCanfontSize,
                    lineHeight : baseStyle.inCanLineHeight,
                    color: baseStyle.inCancolor.replace(/^#?/, '#')
                };
                datasetConfig.showValue = pluckNumber(chartAttrs.showvalue, 1);
                datasetConfig.editMode = pluckNumber(chartAttrs.editmode, 0);
                datasetConfig.pointerSides = pointerSides = pluckNumber(chartAttrs.pointersides, 3);
                datasetConfig.pointerBorderThickness = pointerBorderThickness =
                    pluckNumber(chartAttrs.pointerborderthickness);
                datasetConfig.showHoverEffect = chartShowHoverEffect = pluckNumber(chartAttrs.showhovereffect,
                    chartAttrs.plothovereffect);
                datasetConfig.upperLimit = pluckNumber(chartAttrs.upperlimit);
                datasetConfig.lowerLimit = pluckNumber(chartAttrs.lowerlimit);

                if (gaugeType === 1 ) { // horizontal gauge; left to right;
                    orient = (pointerOnOpp) ? POSITION_TOP : POSITION_BOTTOM;

                } else if (gaugeType === 2) { // vertical gauge; top to bottom;
                    orient = pointerOnOpp ? 'left' : 'right';

                } else if (gaugeType === 3) { // horizontal linear gauge; right to left;
                    orient = (pointerOnOpp) ? POSITION_TOP : POSITION_BOTTOM;

                } else {  // vertical linear gauge; bottom to top;
                    orient = pointerOnOpp ? 'left' : 'right';
                }

                datasetConfig.startAngle = pointOrientation[orient] * 90;
                dataStore = components.data || (components.data = []);

                for (i=0; i<len; i++) {
                    data = dataStore[i] || (components.data[i] = {});
                    config = data.config || (data.config = {});
                    dataObj = (pointerArr && pointerArr[i]) || {};
                    config.itemValue = itemValue = numberFormatter.getCleanValue(dataObj.value);
                    config.formatedVal = formatedVal = numberFormatter.dataLabels(itemValue);
                    config.setDisplayValue = setDisplayValue = getValidValue(parseUnsafeString(dataObj.displayvalue));
                    config.setToolText = setToolText = getValidValue(parseUnsafeString(dataObj.tooltext));
                    config.id =  pluck(dataObj.id, 'pointer_' + i);
                    config.showHoverEffect = showHoverEffect =
                        pluckNumber(dataObj.showhovereffect, chartShowHoverEffect);
                    config.showBorder = showBorder = pluckNumber(dataObj.showborder, chartAttrs.showplotborder, 1);
                    config.borderWidth = borderWidth = showBorder ? pluckNumber(dataObj.borderthickness,
                        pointerBorderThickness) : 0;
                    config.showValue = showValue =pluckNumber(dataObj.showvalue, datasetConfig.showValue);

                    //create the displayvalue
                    if (!showValue) {
                        config.displayValue = BLANKSTRING;
                    }
                    else if (setDisplayValue !== undefined) {
                        config.displayValue = setDisplayValue;
                        config.isLabelString = true;
                    }
                    else {//determine the dispalay value then
                        config.displayValue = getValidValue(formatedVal, BLANK);
                    }

                    config.sides = sides = pluckNumber(dataObj.sides, pointerSides);
                    if (sides < 3) {
                        config.sides = 3;
                    }
                    config.radius = radius = pluckNumber(dataObj.radius,chartAttrs.pointerradius, 10);

                    //create the tooltext
                    if (setToolText !== undefined) {
                        config.toolText = parseTooltext(setToolText, [1,2], {
                            formattedValue: formatedVal
                        }, dataObj, chartAttrs);
                        config.isTooltextString = true;
                    }
                    else {//determine the dispalay value then
                        config.toolText = formatedVal === null ? false :
                        (label !== undefined) ? label + tooltipSepChar + formatedVal : formatedVal;
                    }

                    //Latter used in real time draw
                    config.tempToolText = config.toolText;

                    config.bgAlpha = bgAlpha =  pluckNumber(dataObj.alpha, dataObj.bgalpha, chartAttrs.pointerbgalpha,
                     100);
                    config.bgColor = bgColor = pluck(dataObj.color, dataObj.bgcolor, chartAttrs.pointerbgcolor,
                        chartAttrs.pointercolor, colorM.getColor('pointerBgColor'));
                    config.fillColor = fillColor = convertColor(bgColor, bgAlpha);
                    config.showBorder = pluckNumber(dataObj.showborder, chartAttrs.showplotborder, 1);
                    config.borderAlpha = borderAlpha = pluckNumber(dataObj.borderalpha, chartAttrs.pointerborderalpha,
                     100);
                    config.borderColor = borderColor = pluck(dataObj.bordercolor, chartAttrs.pointerbordercolor,
                        colorM.getColor('pointerBorderColor'));
                    config.pointerBorderColor = pointerBorderColor = convertColor(borderColor, borderAlpha);
                    config.dataLink = getValidValue(dataObj.link);
                    config.editMode = pluckNumber(dataObj.editmode, datasetConfig.editMode);

                    if (showHoverEffect !== 0 && (showHoverEffect || dataObj.bghovercolor ||
                        chartAttrs.pointerbghovercolor || chartAttrs.plotfillhovercolor ||
                        dataObj.bghoveralpha || chartAttrs.pointerbghoveralpha || chartAttrs.plotfillhoveralpha ||
                        dataObj.bghoveralpha === 0 || chartAttrs.pointerbghoveralpha === 0 ||
                        dataObj.showborderonhover || chartAttrs.showborderonhover ||
                        dataObj.showborderonhover === 0 || chartAttrs.showborderonhover === 0 ||
                        dataObj.borderhoverthickness || chartAttrs.pointerborderhoverthickness ||
                        dataObj.borderhoverthickness === 0 || chartAttrs.pointerborderhoverthickness === 0 ||
                        dataObj.borderhovercolor || chartAttrs.pointerborderhovercolor ||
                        dataObj.borderhoveralpha || chartAttrs.pointerborderhoveralpha ||
                        dataObj.borderhoveralpha === 0 || chartAttrs.pointerborderhoveralpha === 0 ||
                        dataObj.hoverradius || chartAttrs.pointerhoverradius || dataObj.hoverradius === 0 ||
                        chartAttrs.pointerhoverradius === 0)) {
                        showHoverEffect = true;
                        pointerBgHoverColor = pluck(dataObj.bghovercolor, chartAttrs.pointerbghovercolor,
                            chartAttrs.plotfillhovercolor, FILLMIXDARK10);
                        pointerBgHoverAlpha = pluckNumber(dataObj.bghoveralpha,
                            chartAttrs.pointerbghoveralpha, chartAttrs.plotfillhoveralpha);
                        showBorderOnHover = pluckNumber(dataObj.showborderonhover, chartAttrs.showborderonhover);
                        if (showBorderOnHover === undefined){
                            if (dataObj.borderhoverthickness || dataObj.borderhoverthickness === 0 ||
                                    dataObj.borderhovercolor || dataObj.borderhoveralpha ||
                                    dataObj.borderhoveralpha === 0){
                                showBorderOnHover = 1;
                            }
                            else {
                                showBorderOnHover = showBorder;
                            }
                        }
                        pointerBorderHoverColor = pluck(dataObj.borderhovercolor, chartAttrs.pointerborderhovercolor,
                            FILLMIXDARK10);
                        pointerBorderHoverAlpha = pluckNumber(dataObj.borderhoveralpha,
                         chartAttrs.pointerborderhoveralpha);
                        pointerBorderHoverThickness = showBorderOnHover ? pluckNumber(dataObj.borderhoverthickness,
                            chartAttrs.pointerborderhoverthickness, borderWidth || 1) : 0;
                        pointerHoverRadius = pluckNumber(dataObj.hoverradius, chartAttrs.pointerhoverradius,
                         radius + 2);
                        showHoverAnimation = !!pluckNumber(dataObj.showhoveranimation, chartAttrs.showhoveranimation,
                         1);
                        config.hoverAttr = hoverAttr = {};
                        config.outAttr = outAttr = {};
                        if (borderWidth !== pointerBorderHoverThickness) {
                            hoverAttr['stroke-width'] = pointerBorderHoverThickness;
                            outAttr['stroke-width'] = borderWidth;
                        }
                        outAttr.fill = fillColor;
                        hasHoberFillMix = /\{/.test(pointerBgHoverColor);
                        pointerBgHoverColor = hasHoberFillMix ? colorM.parseColorMix(bgColor,
                            pointerBgHoverColor)[0] : pointerBgHoverColor;
                        hoverAttr.fill = convertColor(pointerBgHoverColor, pluckNumber(pointerBgHoverAlpha, bgAlpha));
                        if (pointerBorderHoverThickness) {
                            outAttr.stroke = pointerBorderColor;
                            hasBorderHoverMix = /\{/.test(pointerBorderHoverColor);
                            hoverAttr.stroke = convertColor(hasBorderHoverMix ? colorM.parseColorMix(borderColor,
                                pointerBorderHoverColor)[0] : pointerBorderHoverColor,
                                pluckNumber(pointerBorderHoverAlpha, borderAlpha));
                        }

                        if (pointerHoverRadius){
                            if (showHoverAnimation) {
                                hoverAnimAttr = {
                                    r: pointerHoverRadius
                                };
                                outAnimAttr = {
                                    r: radius
                                };
                            }
                            else {
                                hoverAttr.r = pointerHoverRadius;
                                outAttr.r = radius;
                            }
                        }
                    }
                    config.rolloverProperties = {
                        enabled: showHoverEffect,
                        hoverAttr: hoverAttr,
                        hoverAnimAttr: hoverAnimAttr,
                        outAttr: outAttr,
                        outAnimAttr: outAnimAttr
                    };
                }
            },

            // Space management for the pointer value.
            _manageSpace : function (availableHeight) {
                var dataSet = this,
                    chart = dataSet.chart,
                    components = dataSet.components,
                    chartConfig = chart.config,
                    datasetConfig = dataSet.config,
                    smartLabel = chart.linkedItems.smartLabel,
                    canvasWidth = chartConfig.canvasWidth,
                    smartDataLabel, extraSpace,
                    style = chartConfig.dataLabelStyle,
                    trendStyle = chartConfig.style.trendStyle,
                    jsonData = chart.jsonData,
                    trendArray = jsonData.trendpoints && jsonData.trendpoints.point,
                    lineHeight = pluckNumber(parseInt(style.lineHeight, 10), 12),
                    maxAllowedHeight = availableHeight,
                    datasetValuePadding = datasetConfig.valuePadding,
                    valueInsideGauge = datasetConfig.valueInsideGauge,
                    valuePaddingWithRadius,
                    heightUsed = 0,
                    heightUsedBottom = 0,
                    heightUsedTop = 0,
                    valuePadding = 0,
                    trendPadding = 0,
                    heightReducedBottom = 0,
                    heightReducedTop = 0,
                    trendPointConfig,
                    point,
                    trendPaddingWithRadius,
                    tickDimension = chart.components.scale.config.spaceTaken,
                    i = 0,
                    len = dataSet.pointerArr && dataSet.pointerArr.pointer && dataSet.pointerArr.pointer.length,
                    pointerOnOpp = datasetConfig.pointerOnOpp,
                    config,
                    data = components.data;

                trendArray && chart._configueTrendPoints();
                smartLabel.useEllipsesOnOverflow(chartConfig.useEllipsesWhenOverflow);
                smartLabel.setStyle(style);
                for (; i < len; i += 1) {
                    config = data[i].config;
                    // Add pointer radius in value-padding
                    valuePaddingWithRadius = datasetValuePadding + config.radius *
                    (config.sides <= 3 ? 0.5 : (config.sides % 2 ? 1.1 - (1 / config.sides) : 1));
                    valuePadding = Math.max(valuePadding, valuePaddingWithRadius);

                    if (config.showValue && config.displayValue !== BLANKSTRING) {
                        if (config.isLabelString) {
                            smartDataLabel = smartLabel.getSmartText(config.displayValue, canvasWidth,
                                maxAllowedHeight - valuePadding);
                            config.displayValue = smartDataLabel.text;
                            smartDataLabel.tooltext && (config.originalText = smartDataLabel.tooltext);
                        }
                        else {
                            smartDataLabel = smartLabel.getOriSize(config.displayValue);
                        }
                        //special fix for space string
                        /** @todo will be removed when smartLabel will be able to handle it */
                        if (config.displayValue === BLANK) {
                            smartDataLabel = {
                                height : lineHeight
                            };
                        }
                    }

                    if (smartDataLabel && smartDataLabel.height > 0 && !valueInsideGauge) {
                        heightUsed = smartDataLabel.height + valuePaddingWithRadius;
                    }
                    else {
                        heightUsed = valuePaddingWithRadius;
                    }
                    if (heightUsed > maxAllowedHeight) {
                        extraSpace = heightUsed - maxAllowedHeight;
                        valuePaddingWithRadius = extraSpace < valuePaddingWithRadius ?
                            valuePaddingWithRadius - extraSpace : 0;
                        heightUsed = maxAllowedHeight;
                    }
                    if (pointerOnOpp) {
                        if (datasetConfig.axisPosition === AXISPOSITION_BOTTOM) {
                            heightReducedBottom = Math.max(tickDimension.bottom, heightReducedBottom);
                            heightUsed = Math.max(tickDimension.bottom, heightUsed);
                        }

                        heightUsedBottom = Math.max(heightUsedBottom, heightUsed);
                    } else {
                        if (datasetConfig.axisPosition === AXISPOSITION_TOP) {
                            heightReducedTop = Math.max(tickDimension.top, heightReducedTop);
                            heightUsed = Math.max(tickDimension.top, heightUsed);
                        }

                        heightUsedTop = Math.max(heightUsed, heightUsedTop);
                    }
                    datasetConfig.align = POSITION_CENTER;
                }
                datasetConfig.currentValuePadding = valuePadding;

                smartLabel.setStyle(trendStyle);
                if (trendArray) {
                    trendPointConfig = chartConfig.trendPointConfig;
                    for (i = 0, len = trendPointConfig.length; i < len; i += 1) {
                        point = trendPointConfig[i];
                        if (point && point.displayValue !== BLANKSTRING) {

                            // Add pointer radius in value-padding
                            trendPaddingWithRadius = datasetValuePadding + point.markerRadius * 0.5;

                            trendPadding = Math.max(trendPaddingWithRadius, trendPadding);

                            smartDataLabel = smartLabel.getOriSize(point.displayValue);

                            if (smartDataLabel.height > 0) {
                                heightUsed = smartDataLabel.height + trendPaddingWithRadius;
                            }
                            if (heightUsed > maxAllowedHeight) {
                                extraSpace = heightUsed - maxAllowedHeight;
                                trendPaddingWithRadius = extraSpace < trendPaddingWithRadius ?
                                    trendPaddingWithRadius - extraSpace : 0;
                                heightUsed = maxAllowedHeight;
                            }
                            if (point.showOnTop) {
                                if (datasetConfig.axisPosition === AXISPOSITION_TOP) {
                                    heightReducedTop = Math.max(tickDimension.top, heightReducedTop);
                                    heightUsed = Math.max(tickDimension.top, heightUsed);
                                }

                                heightUsedTop = Math.max(heightUsedTop, heightUsed);
                            } else {
                                if (datasetConfig.axisPosition === AXISPOSITION_BOTTOM) {
                                    heightReducedBottom = Math.max(tickDimension.bottom, heightReducedBottom);
                                    heightUsed = Math.max(tickDimension.bottom, heightUsed);
                                }

                                heightUsedBottom = Math.max(heightUsed, heightUsedBottom);
                            }
                        }
                    }
                    datasetConfig.currentTrendPadding = trendPadding;
                }

                return {
                    top : heightUsedTop - heightReducedTop,
                    bottom : heightUsedBottom - heightReducedBottom
                };
            },

            // draws the pointer
            draw : function (animation, isRTupdate) {
                var dataSet = this,
                    idMap = dataSet.idMap,
                    chart = dataSet.chart,
                    chartComponents = chart.components,
                    chartConfig = chart.config,
                    chartGraphics = chart.graphics,
                    dataLabelsGroup = chartGraphics.datalabelsGroup,
                    wGroup = chartGraphics.tempGroup,
                    paper = chartComponents.paper,
                    scale = chartComponents.scale,
                    chartData = dataSet.pointerArr && dataSet.pointerArr.pointer,
                    width = chartConfig.canvasWidth,
                    height = chartConfig.canvasHeight,
                    datasetConfig = dataSet.config,
                    pointerY = (datasetConfig.pointerOnOpp ? height : 0),
                    showPointerShadow = datasetConfig.showPointerShadow,
                    showTooltip = datasetConfig.showTooltip,
                    min = scale.config.axisRange.min,
                    max = scale.config.axisRange.max,
                    pxValueFactor = (max - min) / width,
                    i = (chartData && chartData.length) || 1,
                    config,
                    prevData,
                    shadowObj,
                    startAngle,
                    components = dataSet.components,
                    data = components.data,
                    animationObj = chart.get(configStr,animationObjStr),
                    animObj = animationObj.animObj,
                    dummyObj = animationObj.dummyObj,
                    animType = animationObj.animType,
                    animationDuration = (animation || animationObj).duration,
                    stubEvent = {
                        pageX: 0,
                        pageY: 0
                    },
                    pointerDragStart = function (x) {
                        var point = this;
                        if (point.editMode === false) {
                            return;
                        }

                        prevData = chart._getDataJSON();
                        point.dragStartX = x;
                    },
                    pointerDragEnd = function () {

                        var point = this,
                            config = point.config,
                            jsVars,
                            chartObj = chart.chartInstance;

                        if (point.config.editMode === false) {
                            return;
                        }

                        jsVars = chartObj && chartObj.jsVars;
                        jsVars && (jsVars._rtLastUpdatedData = chart._getDataJSON());

                        global.raiseEvent('RealTimeUpdateComplete', {
                            data: '&value=' + config.updatedValStr,
                            updateObject: {values: [config.updatedValStr]},
                            prevData: prevData.values,
                            source: 'editMode',
                            url: null
                        }, chartObj);

                        try {
                            /* jshint camelcase: false*/
                            win.FC_ChartUpdated && win.FC_ChartUpdated(chartObj.id);
                            /* jshint camelcase: true*/
                        }
                        catch (err) {
                            setTimeout(function () {
                                throw (err);
                            }, 1);
                        }

                        if (datasetConfig.showTooltip) {
                            pointer.tooltip(config.toolText);
                        }
                        else {
                            pointer.tooltip(BLANK);
                        }
                    },
                    pointerOnDrag = function (dx, dy, x, y, event) {

                        var point = this,
                        touchEvent = (hasTouch && getTouchEvent(event)) || stubEvent,
                        scaleMinMax = scale.getLimit(),
                        scaleMin = scaleMinMax.min,
                        scaleMax = scaleMinMax.max,
                        pointVal = pluckNumber(point.itemValue, scaleMin),
                        diffX = point.dragStartX - x,
                        newVal = pointVal - (diffX * pxValueFactor),
                        i = 0,
                        values = [],
                        tempValues = [];

                        if (point.editMode === false) {
                            return;
                        }

                        // Flag set for setting click link in edit mode.
                        point.drag = true;

                        if (newVal < scaleMin) {
                            newVal = scaleMin;
                        } else if (newVal > scaleMax) {
                            newVal = scaleMax;
                        }

                        for (;i < point.index; i += 1) {
                            values.push(BLANK);
                            tempValues.push(BLANK);
                        }
                        values.push({value : newVal});
                        tempValues.push(newVal);

                        if (pointVal !== newVal && dataSet.updateData({data: values}, {duration : 0})) {
                            point.updatedValStr = tempValues.join('|');
                            point.dragStartX = (x || event.pageX || touchEvent.pageX);
                        }
                    },
                    pointer,
                    graphics,
                    link,
                    rolloverProperties,
                    eventArgs,
                    clickHandler,
                    hoverRollOver,
                    hoverRollOut,
                    pool = dataSet.pool;

                if (!wGroup) {
                    wGroup = chartGraphics.tempGroup = paper.group('tempGroup', dataLabelsGroup).trackTooltip(true);
                }

                clickHandler = function (graphicData) {
                    var ele = this,
                        index = ele.data(EVENTARGS).index,
                        config = data[index].config;

                    if (config.drag === true) {
                        config.drag = false;
                        return;
                    }

                    plotEventHandler.call(ele, chart, graphicData);
                };

                hoverRollOver = function (data) {
                    var ele = this,
                        rolloverProperties = ele.data('rolloverProperties');
                    if (rolloverProperties.enabled) {
                        ele.attr(rolloverProperties.hoverAttr);
                        if (rolloverProperties.hoverAnimAttr) {
                            ele.animate(rolloverProperties.hoverAnimAttr, 100, ANIM_EFFECT);
                        }
                    }
                    plotEventHandler.call(ele, chart, data, ROLLOVER);
                };

                hoverRollOut = function (data) {
                    var ele = this,
                        rolloverProperties = ele.data('rolloverProperties');
                    if (rolloverProperties.enabled) {
                        ele.attr(rolloverProperties.outAttr);
                        if (rolloverProperties.outAnimAttr) {
                            ele.animate(rolloverProperties.outAnimAttr, 100, ANIM_EFFECT);
                        }
                    }
                    plotEventHandler.call(ele, chart, data, ROLLOUT);
                };
                while (i--) {
                    config = data[i].config;
                    graphics = data[i].graphics || (data[i].graphics = {}),
                    rolloverProperties = config.rolloverProperties || {};
                    startAngle = datasetConfig.startAngle;
                    idMap[config.id] = {
                        index : i,
                        config : config
                    };
                    /**
                     * @note
                     * The slight increment in starting angle is done to avoid getting
                     * angles in multiples of 90 degree (default starting angle is 270).
                     * Issue is like, cos(270 deg) is not zero but in the range of e-16,
                     * when VML silently fails to render.
                     */
                    startAngle += 0.2;

                    shadowObj = showPointerShadow ? {
                        opacity: (Math.max(config.bgAlpha, config.borderAlpha) / 100)
                    } : false;

                    link =  config.dataLink;
                    eventArgs = {
                        index : i,
                        link: link,
                        value: config.itemValue,
                        displayValue: config.displayValue,
                        toolText: config.toolText
                    };

                    if (!(pointer = graphics.pointer)) {

                        if (pool && pool.pointer[0]) {
                            pointer = graphics.pointer = pool.pointer[0];
                            pool.pointer.splice(0, 1);
                        }
                        else {
                            pointer = graphics.pointer = paper.polypath(wGroup)
                            .click(clickHandler)
                            .hover(hoverRollOver, hoverRollOut);
                        }
                        pointer.attr({
                            polypath : [config.sides,
                                0,
                                (pointerY || 0),
                                config.radius,
                                startAngle,
                                0,
                                wGroup
                            ]
                        });
                        pointer.show();
                        pointer.drag(pointerOnDrag, pointerDragStart, pointerDragEnd, config, config, data[i]);
                    }

                    if (!isRTupdate) {
                        pointer.attr({
                            fill: config.fillColor,
                            stroke: config.pointerBorderColor,
                            ishot: true,
                            'stroke-width': config.borderWidth
                        })
                        .shadow(!!shadowObj, shadowObj && shadowObj.opacity)
                        .data(EVENTARGS, eventArgs)
                        .data('rolloverProperties', rolloverProperties);

                        if (link || config.editMode) {
                            pointer.css({
                                cursor: POINTER,
                                '_cursor': 'hand'
                            });
                        }
                        else {
                            pointer.css({
                                cursor: BLANK,
                                '_cursor': BLANK
                            });
                        }

                        config._startAngle = startAngle;

                        if (config.editMode) {
                            config.index = i;
                            config.editMode = true;
                        }
                        else {
                            config.editMode = false;
                        }
                        pointer.attr({ishot: true});
                    }
                    if (showTooltip) {
                        pointer.tooltip(config.toolText, null, null, true);
                    }
                    else {
                        pointer.tooltip(BLANK);
                    }
                    pointer.animateWith(dummyObj, animObj, {
                        polypath: [
                            config.sides,
                            width * (pluckNumber(config.itemValue, min) - min) / (max - min),
                            (pointerY || 0),
                            config.radius,
                            startAngle,
                            0
                        ],
                        r: config.radius
                    },animationDuration, animType);
                }
                isRTupdate ? dataSet.drawPointerValues(animation) : dataSet._drawWidgetLabel(animation);
                dataSet.removeDataArr && dataSet.remove();
            },

            // Alters the data of the dataset and stores the data to be removed in a different array
            removeData : function (numbers) {
                var dataSet = this,
                    data = dataSet.components.data;

                dataSet.removeDataArr || (dataSet.removeDataArr = []) ;
                dataSet.removeDataArr = dataSet.removeDataArr.concat(data.splice(0, numbers));
            },

            // Hides the graphic element of the pointer
            remove : function () {
                var dataSet = this,
                    removeDataArr = dataSet.removeDataArr,
                    length = removeDataArr.length,
                    graphics,
                    pointerValue,
                    pointer,
                    i,
                    pool = dataSet.pool || (dataSet.pool = {
                        pointer : [],
                        pointerValue : []
                    });

                for (i = 0; i < length; i++) {
                    graphics = removeDataArr[i].graphics;
                    pointer = graphics.pointer;
                    pointerValue = graphics.pointerValue;

                    pool.pointer[i] = graphics.pointer;
                    pool.pointerValue[i] = graphics.pointerValue;

                    pointerValue.hide();
                    pointer.hide();
                    pointer.undrag();
                    pointer.shadow(false);
                }
                delete dataSet.removeDataArr;
            },

            // draws Widget background(color range) values, trend point values and calls drawPointerValues
            _drawWidgetLabel: function (animation) {
                var dataSet = this,
                    chart = dataSet.chart,
                    chartConfig = chart.config,
                    chartComponents = chart.components,
                    numberFormatter = chartComponents.numberFormatter,
                    scale = chartComponents.scale,
                    paper = chartComponents.paper,
                    dataLabelsGroup = chart.graphics.datalabelsGroup,
                    min = scale.config.axisRange.min,
                    max = scale.config.axisRange.max,
                    datasetConfig = dataSet.config,
                    textDirection = datasetConfig.textDirection,
                    gaugeType = 1, //series.gaugeType,
                    colorArr = chartComponents.colorRange && chartComponents.colorRange.getColorRangeArr(min, max),
                    colorRangeStyle = datasetConfig.colorRangeStyle || {},
                    showvalue = datasetConfig.showvalue,
                    colorObj,
                    tempLabelPadding,
                    trendArr = chart.jsonData.trendpoints && chart.jsonData.trendpoints.point,
                    trendPointConfig = chartConfig.trendPointConfig,
                    width = chartConfig.canvasWidth,
                    height = chartConfig.canvasHeight,
                    marginRight = chartConfig.marginRight,
                    pointerOnOpp = datasetConfig.pointerOnOpp,
                    valueInsideGauge = datasetConfig.valueInsideGauge,
                    showGaugeLabels = datasetConfig.showGaugeLabels,
                    style = chartConfig.dataLabelStyle,
                    animationObj = chart.get(configStr,animationObjStr),
                    animObj = animationObj.animObj,
                    dummyObj = animationObj.dummyObj,
                    animType = animationObj.animType,
                    animationDuration = animationObj.duration,
                    colorArrLabel,
                    maxWidth,
                    truncatedWidth,
                    i,
                    length,
                    getPointerLabelXY,
                    getColorLabelXY,
                    labelXY,
                    nextPointer,
                    nextOriText,
                    nextSmartText,
                    nextXY,
                    labelGap,
                    isSameLevel = false,
                    j,
                    labelX,
                    labelY,
                    smartLabel = chart.linkedItems.smartLabel, smartText, testStrObj, minWidth, //labelX, labelY,
                    lineHeight = pluckNumber(parseInt(style.fontHeight, 10), parseInt(style.lineHeight, 10), 12),
                    labelPadding = (datasetConfig.currentValuePadding + (lineHeight * 0.5)) , hPad = 4,
                    innerLabelPadding = 4,
                    oppTrendLabelPadding = (datasetConfig.currentTrendPadding + (lineHeight * 0.5)),
                    tempx,
                    graphics,
                    attr,
                    trendObj,
                    trendLabelPadding = datasetConfig.currentTrendPadding,
                    css = {
                        fontFamily: style.fontFamily,
                        fontSize: style.fontSize,
                        lineHeight: style.lineHeight,
                        fontWeight: style.fontWeight,
                        fontStyle: style.fontStyle
                    },
                    dataArr = dataSet.pointerArr && dataSet.pointerArr.pointer,
                    config,
                    components = dataSet.components,
                    data = components.data,
                    dataLabels = components.dataLabels || (components.dataLabels = []),
                    trendLabels = components.trendLabels || (components.trendLabels = []),
                    dataLabel,
                    value,
                    trendLabel;

                dataLabelsGroup.transform(['T', chartConfig.canvasLeft, chartConfig.canvasTop]);
                tempLabelPadding = labelPadding - (lineHeight / 4);
                // if label is below the pointer then we need to add extra pdding to compensate for lineheight.
                labelPadding = (valueInsideGauge === pointerOnOpp) ? labelPadding - (lineHeight / 4) :
                    labelPadding + (lineHeight / 4);
                smartLabel.useEllipsesOnOverflow(chartConfig.useEllipsesWhenOverflow);
                smartLabel.setStyle(css);
                testStrObj = smartLabel.getOriSize('W...');
                minWidth = testStrObj.width;
                colorRangeStyle.fontWeight = 'normal';

                if (gaugeType === 1 ) { // horizontal gauge; left to right;
                    getPointerLabelXY = dataSet.getPointerLabelXY =
                        function (value, isInside, pointerOnOpp, xsHeight, xsWidth) {
                        var y;

                        if (pointerOnOpp) {
                            y = isInside ? (height - xsHeight - labelPadding) : (height + labelPadding);
                        } else {
                            y = isInside ? labelPadding : -(labelPadding + xsHeight);
                        }

                        tempx = (value - min) * width / (max - min);
                        (tempx + xsWidth > width + marginRight) && (tempx = width - xsWidth + marginRight);

                        return {
                            x: tempx,
                            y: y,
                            align: POSITION_MIDDLE
                        };
                    };

                    getColorLabelXY = function (minvalue, maxvalue) {
                        return {
                            x: (((minvalue - min) + (maxvalue - minvalue) / 2) * width / (max - min)),
                            y: (height / 2),
                            width: (maxvalue - minvalue) * width / (max - min),
                            height: height
                        };
                    };

                } else if (gaugeType === 2) { // vertical gauge; top to bottom;
                    getPointerLabelXY = dataSet.getPointerLabelXY = function (value, isInside, pointerOnOpp) {
                        var x, align;
                        if (pointerOnOpp) {
                            if (isInside) {
                                align = POSITION_RIGHT;
                                x = width - labelPadding;
                            } else {
                                align = POSITION_LEFT;
                                x = width + labelPadding;
                            }
                        }
                        else {
                            if (isInside) {
                                align = POSITION_LEFT;
                                x = labelPadding;
                            }
                            else {
                                align = POSITION_RIGHT;
                                x = -labelPadding;
                            }
                        }
                        return {
                            x: x,
                            y: (value * height / (max - min)),
                            align: align
                        };
                    };

                    getColorLabelXY = function (minvalue, maxvalue) {
                        return {
                            y: (((minvalue - min) + (maxvalue - minvalue) / 2) * height / (max - min)),
                            x: (width / 2),
                            height: (maxvalue - minvalue) * height / (max - min),
                            width: width
                        };
                    };

                }
                else if (gaugeType === 3) { // horizontal linear gauge; right to left;
                    getPointerLabelXY = dataSet.getPointerLabelXY = function (value, isInside, pointerOnOpp) {
                        var y;
                        if (pointerOnOpp) {
                            y = isInside ? height - labelPadding : height + labelPadding;
                        } else {
                            y = isInside ? labelPadding : -labelPadding;
                        }
                        return {
                            x: width - ((value - min) * width / (max - min)),
                            y: y,
                            align: POSITION_MIDDLE
                        };
                    };

                    getColorLabelXY = function (minvalue, maxvalue) {
                        return {
                            x: width - (((minvalue - min) + (maxvalue - minvalue) / 2) * width / (max - min)),
                            y: (height / 2),
                            width: (maxvalue - minvalue) * width / (max - min),
                            height: height
                        };
                    };

                }
                else {  // vertical linear gauge; bottom to top;
                    getPointerLabelXY = dataSet.getPointerLabelXY = function (value, isInside, pointerOnOpp) {
                        var x, align;
                        if (pointerOnOpp) {
                            if (isInside) {
                                align = POSITION_RIGHT;
                                x = width - labelPadding;
                            } else {
                                align = POSITION_LEFT;
                                x = width + labelPadding;
                            }
                        } else {
                            if (isInside) {
                                align = POSITION_LEFT;
                                x = labelPadding;
                            } else {
                                align = POSITION_RIGHT;
                                x = -labelPadding;
                            }
                        }
                        return {
                            x: x,
                            y: height - (value * height / (max - min)),
                            align: align
                        };
                    };

                    getColorLabelXY = function (minvalue, maxvalue) {
                        return {
                            y: height - (((minvalue - min) + (maxvalue - minvalue) / 2) * height / (max - min)),
                            x: (width / 2),
                            height: (maxvalue - minvalue) * height / (max - min),
                            width: width
                        };
                    };
                }

                if (dataArr && dataArr.length) {
                    i = dataArr.length;
                    while (i--) {
                        config = data[i].config;

                        if (showvalue !== 0 && config.displayValue !== BLANKSTRING) {

                            smartText = smartLabel.getOriSize(config.displayValue);
                            if (config.setWidth) {
                                smartText = smartLabel.getSmartText(config.displayValue,
                                    config.setWidth, smartText.height, true);
                            }

                            labelXY = dataSet.getPointerLabelXY(config.itemValue, valueInsideGauge,
                                pointerOnOpp, (smartText.height / 2) , (smartText.width / 2));

                            if (config.isLabelString) {

                                isSameLevel = false, j = 1;
                                while (!isSameLevel) {
                                    nextPointer = dataArr[i + j];
                                    if (!nextPointer) {
                                        break;
                                    }

                                    if (nextPointer.isLabelString) {
                                        isSameLevel = true;
                                    }
                                    else {
                                        j += 1;
                                    }
                                }

                                if (nextPointer) {
                                    nextOriText = smartLabel.getOriSize(nextPointer.displayValue);
                                    nextXY = getPointerLabelXY(nextPointer.y, valueInsideGauge,
                                        pointerOnOpp, (nextOriText.height / 2));

                                    //calculate the overlapping area's width
                                    labelGap = (nextXY.x - (nextOriText.width / 2)) - (labelXY.x +
                                     (smartText.width / 2));
                                    // get the max width i.e the distance between the pointers
                                    maxWidth = nextXY.x - labelXY.x;
                                    if (labelGap < 0) {

                                        // calculate the truncated width using labelGap (should be -ve)
                                        truncatedWidth = smartText.width + labelGap;

                                        // the truncated width cannot be more than max width.
                                        if (truncatedWidth > maxWidth) {
                                            config.setWidth = truncatedWidth = maxWidth;
                                        }
                                        if (truncatedWidth > minWidth) {
                                            if (config.setWidth && config.setWidth <= truncatedWidth) {
                                                nextSmartText = smartLabel.getSmartText(
                                                    config.displayValue, config.setWidth, smartText.height, true);
                                                config.displayValue = nextSmartText.text;
                                                nextSmartText.tooltext &&
                                                    (config.originalText = nextSmartText.tooltext);
                                            }
                                            else {
                                                nextSmartText = smartLabel.getSmartText(
                                                    config.displayValue, truncatedWidth, smartText.height, true);
                                                config.displayValue = nextSmartText.text;
                                                nextSmartText.tooltext &&
                                                    (config.originalText = nextSmartText.tooltext);
                                            }
                                        }
                                        else {
                                            nextSmartText = smartLabel.getSmartText(
                                                config.displayValue, minWidth, smartText.height, true);
                                            config.displayValue = nextSmartText.text;
                                            nextSmartText.tooltext && (config.originalText = nextSmartText.tooltext);
                                            // since the labelGap was not split equally we have to recalculate
                                            // labelGap so that the next label will adjust accordingly.
                                            labelGap = labelGap * 2 + minWidth - hPad;
                                        }

                                        config.setWidth = null;

                                        truncatedWidth = nextOriText.width + labelGap - hPad;
                                        if (truncatedWidth > maxWidth) {
                                            nextPointer.setWidth = maxWidth;
                                        }
                                        else if (truncatedWidth > minWidth) {
                                            nextPointer.setWidth = truncatedWidth;
                                        }
                                        else {
                                            nextPointer.setWidth = minWidth;
                                        }
                                    }
                                }

                                if (config.setWidth) {
                                    nextSmartText = smartLabel.getSmartText(
                                        config.displayValue, config.setWidth, smartText.height, true);
                                    config.displayValue = nextSmartText.text;
                                    nextSmartText.tooltext && (config.originalText = nextSmartText.tooltext);
                                    config.setWidth = null;
                                }
                            }
                        }
                    }
                }

                dataSet.drawPointerValues(animation);
                smartLabel.setStyle(colorRangeStyle);

                // Draw the colorRange labels
                if (colorArr && showGaugeLabels) {
                    for (i = 0, length = colorArr.length; i < length; i += 1) {

                        dataLabel = dataLabels[i] || (components.dataLabels[i] = {});
                        graphics = dataLabel.graphics || (dataLabel.graphics = {});

                        colorObj = colorArr[i];
                        colorArrLabel = pluck(colorObj.label, colorObj.name);
                        labelXY = getColorLabelXY(colorObj.minvalue, colorObj.maxvalue);
                        if ((labelXY.width - innerLabelPadding) > minWidth &&
                                (labelXY.height - innerLabelPadding) > lineHeight) {
                            smartText = smartLabel.getSmartText(colorArrLabel,
                                labelXY.width - innerLabelPadding, labelXY.height - innerLabelPadding);
                        }
                        else {
                            smartText = smartLabel.getSmartText(colorArrLabel, labelXY.width, labelXY.height);
                        }

                        attr = {
                            'text-anchor': POSITION_MIDDLE,
                            'vertical-align': POSITION_MIDDLE,
                            x: labelXY.x,
                            y: labelXY.y,
                            direction: textDirection,
                            fill : colorRangeStyle.color,
                            text: smartText.text
                        };

                        if (!(value = graphics.value)) {
                            value = graphics.value = paper.text(attr, colorRangeStyle, dataLabelsGroup);
                        }
                        else {
                            value.show();
                            value.animateWith(dummyObj, animObj, attr, animationDuration, animType)
                            .css(colorRangeStyle)
                            .tooltip(smartText.tooltext);
                        }
                    }
                }
                else {
                    // Setting i to 0 so that any previously existing trendlabels can be hidden.
                    i = 0;
                }

                // Hiding the unused colorrangeLabels
                while(dataLabel = dataLabels && dataLabels[i++]) {
                    dataLabel.graphics.value.hide();
                }

                // Drawing the display value of trend points
                if (trendArr) {
                    for (i = 0, length = trendPointConfig.length; i < length; i += 1) {
                        trendLabel = trendLabels[i] || (components.trendLabels[i] = {});
                        graphics = trendLabel.graphics || (trendLabel.graphics = {});

                        trendObj = trendPointConfig[i];
                        trendObj.displayValue = pluck(trendObj.displayValue,
                            numberFormatter.dataLabels(trendObj.startValue));
                        smartLabel.setStyle(trendObj.style);
                        lineHeight = smartLabel.getOriSize('Wg').height;
                        smartText = smartLabel.getOriSize(trendObj.displayValue);
                        labelXY = getPointerLabelXY(trendObj.startValue, 0, !trendObj.showOnTop);
                        if (trendObj.setWidth) {
                            smartText = smartLabel.getSmartText(trendObj.displayValue,
                                trendObj.setWidth, smartText.height, true);
                        }
                        isSameLevel = false, j = 1;
                        while (!isSameLevel) {
                            nextPointer = trendArr[i + j];
                            if (!nextPointer) {
                                break;
                            }

                            if (nextPointer.showOnTop === trendObj.showOnTop) {
                                isSameLevel = true;
                            }
                            else {
                                j += 1;
                            }
                        }
                        if (nextPointer) {
                            nextOriText = smartLabel.getOriSize(nextPointer.displayValue);
                            nextXY = getPointerLabelXY(nextPointer.startValue, 0, !nextPointer.showOnTop);

                            // refer to the docs of pointer label drawing above.
                            labelGap = (nextXY.x - (nextOriText.width / 2)) - (labelXY.x + (smartText.width / 2));
                            if (labelGap < 0) {
                                maxWidth = nextXY.x - labelXY.x;
                                truncatedWidth = smartText.width + labelGap;
                                if (truncatedWidth > maxWidth) {
                                    trendObj.setWidth = truncatedWidth = maxWidth;
                                }
                                if (truncatedWidth > minWidth) {
                                    if (trendObj.setWidth && (trendObj.setWidth <= truncatedWidth)) {
                                        smartText = smartLabel.getSmartText(trendObj.displayValue,
                                            trendObj.setWidth, smartText.height, true);
                                        trendObj.displayValue = smartText.text;
                                        smartText.tooltext && (trendObj.originalText = smartText.tooltext);
                                    }
                                    else {
                                        smartText = smartLabel.getSmartText(trendObj.displayValue,
                                            smartText.width + labelGap - hPad, smartText.height, true);
                                        trendObj.displayValue = smartText.text;
                                        smartText.tooltext && (trendObj.originalText = smartText.tooltext);
                                    }
                                }
                                else {
                                    smartText = smartLabel.getSmartText(
                                        trendObj.displayValue, minWidth, smartText.height, true);
                                    trendObj.displayValue = smartText.text;
                                    smartText.tooltext && (trendObj.originalText = smartText.tooltext);
                                    labelGap = labelGap * 2 + minWidth - hPad;
                                }

                                trendObj.setWidth = null;

                                truncatedWidth = nextOriText.width + labelGap - hPad;
                                if (truncatedWidth > maxWidth) {
                                    nextPointer.setWidth = maxWidth;
                                }
                                else if (truncatedWidth > minWidth) {
                                    nextPointer.setWidth = truncatedWidth;
                                }
                                else {
                                    nextPointer.setWidth = minWidth;
                                }
                            }
                        }

                        if (trendObj.setWidth) {
                            smartText = smartLabel.getSmartText(trendObj.displayValue, trendObj.setWidth,
                                smartText.height, true);
                            trendObj.displayValue = smartText.text;
                            smartText.tooltext && (trendObj.originalText = smartText.tooltext);
                            trendObj.setWidth = null;
                        }
                        labelY = trendObj.showOnTop ? -(trendLabelPadding + (smartText.height / 2)) :
                            height + oppTrendLabelPadding;
                        labelX = trendObj.isTrendZone ? getColorLabelXY(trendObj.startValue, trendObj.endValue).x :
                            labelXY.x;
                        if (!graphics.value) {
                            graphics.value = paper.text(dataLabelsGroup);
                        }

                        graphics.value.attr({
                            x : labelX,
                            y : labelY,
                            text : trendObj.displayValue,
                            'text-anchor': textHAlign[labelXY.align],
                            fill: convertColor(trendObj.textColor || colorRangeStyle.color),
                            'font-weight': 'normal',
                            direction: textDirection,
                            title: (trendObj.originalText || BLANK)
                        });

                        graphics.value.show();
                    }
                }
                else {
                    // Setting i to 0 so that any previously existing trendlabels can be hidden.
                    i = 0;
                }

                // Hiding the unused trendLabels
                while(trendLabel = trendLabels && trendLabels[i++]) {
                    trendLabel.graphics.value.hide();
                }
            },

            //Drawing pointer values
            drawPointerValues: function (animation) {
                var dataSet = this,
                    chart = dataSet.chart,
                    dataLabelsGroup = chart.graphics.datalabelsGroup,
                    paper = chart.components.paper,
                    data = dataSet.components.data,
                    datasetConfig = dataSet.config,
                    pointerOnOpp = datasetConfig.pointerOnOpp,
                    valueInsideGauge = datasetConfig.valueInsideGauge,
                    textDirection = datasetConfig.textDirection,
                    showValue,
                    smartLabel = chart.linkedItems.smartLabel,
                    chartData = dataSet.pointerArr && dataSet.pointerArr.pointer,
                    style = chart.config.dataLabelStyle,
                    i = chartData && chartData.length,
                    config,
                    pointerValue,
                    animationObj = chart.get(configStr,animationObjStr),
                    animObj = animationObj.animObj,
                    dummyObj = animationObj.dummyObj,
                    animType = animationObj.animType,
                    animationDuration = (animation || animationObj).duration,
                    chartConfig = chart.config,
                    marginLeft = chartConfig.marginLeft,
                    css = {
                        fontFamily: style.fontFamily,
                        fontSize: style.fontSize,
                        lineHeight: style.lineHeight,
                        fontWeight: style.fontWeight,
                        fontStyle: style.fontStyle
                    },
                    displayValue,
                    labelXY,
                    halfWidth,
                    graphics,
                    smartText,
                    pool = dataSet.pool,
                    attr,
                    textCreated;

                smartLabel.useEllipsesOnOverflow(chartConfig.useEllipsesWhenOverflow);
                while (i--) {
                    textCreated = false;
                    graphics = data[i].graphics;
                    config = data[i].config;
                    displayValue = config.displayValue,
                    showValue = config.showValue;

                    if (showValue !== 0 && displayValue !== BLANKSTRING) {

                        smartText = smartLabel.getOriSize(displayValue);
                        halfWidth = smartText.width / 2;
                        labelXY = dataSet.getPointerLabelXY(config.itemValue,
                            valueInsideGauge, pointerOnOpp, (smartText.height / 2), halfWidth);
                        attr = {
                            'text-anchor': textHAlign[labelXY.align],
                            title: (config.originalText || BLANK),
                            text: displayValue,
                            fill: style.color,
                            direction: textDirection,
                            'text-bound': [style.backgroundColor, style.borderColor,
                                style.borderThickness, style.borderPadding,
                                style.borderRadius, style.borderDash]
                        };
                        if (!(pointerValue = graphics.pointerValue)) {

                            if (pool && pool.pointerValue[0]) {
                                pointerValue = graphics.pointerValue = pool.pointerValue[0];
                                pool.pointerValue.splice(0, 1);
                            }
                            else {
                                attr.x = 0;
                                attr.y = labelXY.y;
                                textCreated = true;
                                pointerValue = graphics.pointerValue = paper.text(attr, css, dataLabelsGroup);
                            }
                        }

                        // Applying attr from second time ownwards during update.
                        if (!textCreated) {
                            pointerValue.attr(attr).css(css);
                            pointerValue.show();
                        }

                        // Fix for long decimal numbers moving out of the canvas.
                        (halfWidth > marginLeft + labelXY.x) && (labelXY.x = halfWidth - marginLeft);

                        pointerValue.animateWith(dummyObj, animObj, {
                            x: labelXY.x,
                            y: labelXY.y
                        }, animationDuration, animType);
                    }
                    else {
                        graphics.pointerValue && graphics.pointerValue.hide();
                    }
                }
            },

            // Setting axis limits
            getDataLimits : function () {
                var dataSet = this,
                    config = dataSet.config,
                    jsonData = dataSet.chart.jsonData,
                    pointerArr = (dataSet.pointerArr && dataSet.pointerArr.pointer) ||
                        (jsonData.dials && jsonData.dials.dial),
                    colorRange = jsonData.colorrange,
                    colorArr = colorRange && colorRange.color,
                    length = pointerArr && pointerArr.length,
                    i,
                    pointerMinVal,
                    pointerMaxVal,
                    upperLimit = config.upperLimit,
                    lowerLimit = config.lowerLimit,
                    value,
                    maxColorRangeVal,
                    minColorRangeVal,
                    max = -Infinity,
                    min = +Infinity;

                // finding max min amongst the pointer value
                for (i=0; i<length; i++) {
                    value = pointerArr[i].value;
                    if (value === BLANK) {
                        continue;
                    }
                    pointerMaxVal = max = mathMax(max, Number(pointerArr[i].value));
                    pointerMinVal = min = mathMin(min, Number(pointerArr[i].value));
                }

                length = colorArr && colorArr.length;
                // finding max min amongst the color range value but it has a lower
                // priority than upperlimit and lowerlimit set by the user.
                for (i=0; i<length; i++) {
                    maxColorRangeVal = Number(colorArr[i].maxvalue);
                    minColorRangeVal = Number(colorArr[i].minvalue);

                    upperLimit && (maxColorRangeVal > upperLimit) && (maxColorRangeVal = upperLimit);
                    lowerLimit && (minColorRangeVal < lowerLimit) && (minColorRangeVal = lowerLimit);

                    max = mathMax(max, maxColorRangeVal);
                    min = mathMin(min, minColorRangeVal);
                }

                return {
                    forceMin : pointerMinVal !== min,
                    forceMax : pointerMaxVal !== max,
                    max : max,
                    min : min
                };
            },

            // Function to update the hlinear data via drag mode or realTime update
            updateData: function (updateObj, updateAnimation) {
                if (updateObj === this.lastUpdatedObj) {
                    return false;
                }

                var dataSet = this,
                    chart = dataSet.chart,
                    numberFormatter = chart.components.numberFormatter,
                    data = dataSet.components.data,
                    label,
                    toolText,
                    showLabel,
                    dataArr = dataSet.components.data,
                    i = (dataArr && dataArr.length) || 0,
                    dataObj,
                    config,
                    formatedValue = null,
                    newData = [],
                    updateData,
                    value,
                    animation,
                    pointObj;

                updateObj = updateObj.data;
                //use the realtime animation value or the default animation value
                animation = updateAnimation || chart.get(configStr, animationObjStr);

                if (i) {
                    while (i--) {
                        dataObj = {};
                        pointObj = {};
                        config = data[i].config;
                        updateData = updateObj[i];

                        if (!updateData) {
                            continue;
                        }

                        value = updateData.value;
                        toolText = updateData.tooltext;
                        label = updateData.label;
                        showLabel = updateData.showlabel;

                        if (value !== undefined && value !== BLANK) {
                            dataObj.value = pointObj.value = value;
                            formatedValue = pointObj.displayvalue =
                                pointObj.tooltext = numberFormatter.dataLabels(pointObj.value);
                            pointObj.hasNewData = true;
                        }
                        else {
                            pointObj.value = config.formatedVal;
                        }

                        if (label) {
                            pointObj.displayvalue = label;
                            pointObj.hasNewData = true;
                        }

                        if (showLabel == '0') {
                            pointObj.displayvalue = BLANKSTRING;
                            pointObj.hasNewData = true;
                        }

                        if (toolText) {
                            toolText = getValidValue(parseUnsafeString(toolText));
                            pointObj.hasNewData = true;
                        }

                        if (pointObj.hasNewData) {
                            newData[i] = pointObj;
                            extend2(config, {
                                itemValue: pointObj.value,
                                displayValue: ((config.displayValue || showLabel == '1') ?
                                    pointObj.displayvalue : BLANKSTRING),
                                toolText: toolText !== undefined ? parseTooltext(toolText, [1,2], {
                                    formattedValue: formatedValue
                                }, dataObj) : (config.setToolText ? config.tempToolText : formatedValue)
                            });
                        }
                    }

                    if (newData.length) {
                        this.lastUpdatedObj = updateObj;
                        this.draw(animation, true);
                    }

                    return Boolean(newData.length);
                }
            }
        }]);
    }]);

FusionCharts.register('module', ['private', 'modules.renderer.js-dataset-bullet',
    function () {

        var global = this,
            lib = global.hcLib,
            preDefStr = lib.preDefStr,
            BLANK = lib.BLANKSTRING,
            BLANKSTRING = BLANK,
            pluck = lib.pluck,
            getValidValue = lib.getValidValue,
            COMPONENT = 'component',
            UNDEFINED,
            COMMASTRING = lib.COMMASTRING,
            plotEventHandler = lib.plotEventHandler,
            showHoverEffectStr = preDefStr.showHoverEffectStr,
            SETROLLOVERATTR = 'setRolloverAttr',
            DATASET = 'dataset',
            configStr = preDefStr.configStr,
            animationObjStr = preDefStr.animationObjStr,
            getColorCodeString = lib.getColorCodeString,
            ROUND = preDefStr.ROUND,
            miterStr = preDefStr.miterStr,
            BUTT = 'butt',
            HUNDREDSTRING = lib.HUNDREDSTRING,
            PLOTBORDERCOLOR = 'plotBorderColor',
            PLOTGRADIENTCOLOR = 'plotGradientColor',
            colorStrings = preDefStr.colors,
            SHOWSHADOW = 'showShadow',
            math = Math,
            mathMax = math.max,
            mathMin = math.min,
            mathAbs = math.abs,
            COLOR_FFFFFF = colorStrings.FFFFFF,
            noneStr = 'none',
            convertColor = lib.graphics.convertColor,
            toRaphaelColor = lib.toRaphaelColor,
            FILLMIXDARK10 = '{dark-10}',
            COMMASPACE = lib.COMMASPACE,
            ROLLOVER = 'DataPlotRollOver',
            SETROLLOUTATTR = 'setRolloutAttr',
            ROLLOUT = 'DataPlotRollOut',
            getFirstValue = lib.getFirstValue,
            getDarkColor = lib.graphics.getDarkColor,
            win = global.window,
            userAgent = win.navigator.userAgent,
            doc = win.document,
            hasTouch = doc.documentElement.ontouchstart !== undefined,
            CLICK_THRESHOLD_PIXELS = lib.CLICK_THRESHOLD_PIXELS,
            isIE = /msie/i.test(userAgent) && !win.opera,
            TRACKER_FILL = 'rgba(192,192,192,'+ (isIE ? 0.002 : 0.000001) +')',
            M = 'M',
            L = 'L',
            DECIDE_CRISPENING = {
                'true': undefined,
                'false': 'crisp'
            },
            EVENTARGS = 'eventArgs',
            GROUPID = 'groupId',
            POSITION_START = preDefStr.POSITION_START,
            POSITION_TOP = preDefStr.POSITION_TOP,
            POSITION_MIDDLE = preDefStr.POSITION_MIDDLE,
            PLOTFILLCOLOR_STR = preDefStr.PLOTFILLCOLOR_STR,
            TOUCH_THRESHOLD_PIXELS = lib.TOUCH_THRESHOLD_PIXELS,
            HTP = hasTouch ? TOUCH_THRESHOLD_PIXELS :
                    CLICK_THRESHOLD_PIXELS,
            POINTER = 'pointer',
            pluckNumber = lib.pluckNumber,
            schedular = lib.schedular;

        FusionCharts.register(COMPONENT, [DATASET, 'bullet', {

            init : function(datasetJSON) {
                var dataSet = this,
                    chart = dataSet.chart,
                    components = chart.components,
                    visible;

                if (!datasetJSON) {
                    return false;
                }

                dataSet.JSONData = datasetJSON;
                dataSet.yAxis = components.scale;
                dataSet.chartGraphics = chart.chartGraphics;
                dataSet.components = {
                };

                dataSet.graphics = {
                };

                // defined(stackIndex) ? (dataSet.JSONData = dataJSONarr[datasetIndex].dataset[stackIndex]):
                //         (dataSet.JSONData = dataJSONarr[datasetIndex]);
                dataSet.visible = visible = pluckNumber(dataSet.JSONData.visible,
                    !Number(dataSet.JSONData.initiallyhidden), 1) === 1;

                dataSet.configure();

                (chart.hasLegend !== false) && dataSet._addLegend();
            },

            configure : function () {
                var dataSet = this,
                    chart = dataSet.chart,
                    conf = dataSet.config,
                    JSONData = dataSet.JSONData,
                    chartAttr = chart.jsonData.chart,
                    colorM = chart.components.colorManager,
                    showplotborder,
                    plotColor = conf.plotColor = colorM.getColor(PLOTFILLCOLOR_STR),
                    plotBorderDash = pluckNumber(JSONData.dashed, chartAttr.plotborderdashed),
                    usePlotGradientColor = pluckNumber(chartAttr.useplotgradientcolor, 1),
                    plotDashLen,
                    plotDashGap,
                    plotBorderThickness,
                    isRoundEdges,
                    showHoverEffect,
                    plotfillAngle,
                    plotFillAlpha,
                    plotRadius,
                    plotFillRatio,
                    plotgradientcolor,
                    plotBorderAlpha,
                    plotBorderColor,
                    initailPlotBorderDashStyle,
                    getDashStyle = lib.getDashStyle,
                    dataStore = dataSet.components.data,

                    definedGroupPadding,
                    isBar = chart.isBar,
                    is3D = chart.is3D,
                    isStacked = chart.isStacked,
                    stack100Percent,
                    targetalpha,
                    plotAsDot,
                    targetCapStyle;

                conf.targetCapStyle = targetCapStyle = pluck(chartAttr.targetcapstyle, ROUND).toLowerCase();

                if ((targetCapStyle !== BUTT) && (targetCapStyle !== ROUND) && (targetCapStyle !== 'square') &&
                    (targetCapStyle !== 'inherit')) {
                    conf.targetCapStyle = ROUND;
                }

                conf.upperLimit = pluckNumber(chartAttr.upperlimit);
                conf.lowerLimit = pluckNumber(chartAttr.lowerlimit);

                conf.initAnimation = true;
                showplotborder = conf.showplotborder = pluckNumber(chartAttr.showplotborder, 0);
                conf.plotDashLen = plotDashLen = pluckNumber(chartAttr.plotborderdashlen, 5);
                conf.plotDashGap = plotDashGap = pluckNumber(chartAttr.plotborderdashgap, 4);
                conf.plotfillAngle = plotfillAngle =  pluckNumber(360 - chartAttr.plotfillangle, (isBar ? 180 : 90));
                conf.plotFillAlpha =  plotFillAlpha = pluck(JSONData.alpha, chartAttr.plotfillalpha, HUNDREDSTRING);
                conf.plotColor = plotColor = pluck(chartAttr.plotfillcolor, plotColor);
                conf.isRoundEdges = isRoundEdges = pluckNumber(chartAttr.useroundedges,0);
                conf.plotRadius = plotRadius = pluckNumber(chartAttr.useRoundEdges, conf.isRoundEdges ? 1 : 0);
                conf.plotFillRatio = plotFillRatio = pluck(JSONData.ratio, chartAttr.plotfillratio);
                conf.plotgradientcolor = plotgradientcolor = lib.getDefinedColor(chartAttr.plotgradientcolor,
                    colorM.getColor(PLOTGRADIENTCOLOR));
                !usePlotGradientColor && (plotgradientcolor = BLANK);
                conf.showPlotBorderOnHover = pluckNumber(chartAttr.showplotborderonhover, 0);
                conf.plotBorderAlpha = plotBorderAlpha = pluck(chartAttr.plotborderalpha, plotFillAlpha, HUNDREDSTRING);
                conf.plotBorderColor = plotBorderColor = pluck(chartAttr.plotbordercolor,
                    is3D ? COLOR_FFFFFF : colorM.getColor(PLOTBORDERCOLOR));
                conf.plotBorderThickness = plotBorderThickness = showplotborder ?
                    pluckNumber(chartAttr.plotborderthickness, 0) : 0;
                conf.plotBorderDashStyle = initailPlotBorderDashStyle = plotBorderDash ?
                            getDashStyle(plotDashLen, plotDashGap, plotBorderThickness) : noneStr;
                conf.showValue = pluckNumber(JSONData.showvalue, chartAttr.showvalue, 1);
                conf.valuePadding = pluckNumber(chartAttr.valuepadding, 2);

                conf.showShadow = (isRoundEdges || is3D) ? pluckNumber(chartAttr.showshadow, 1) :
                    pluckNumber(chartAttr.showshadow, colorM.getColor(SHOWSHADOW));
                conf.showHoverEffect = showHoverEffect = pluckNumber(chartAttr.plothovereffect,
                    chartAttr.showhovereffect, 0);
                conf.showTooltip = pluckNumber(chartAttr.showtooltip, 1);
                conf.stack100Percent = stack100Percent =
                    pluckNumber(chart.stack100percent ,chartAttr.stack100percent, 0);
                conf.definedGroupPadding = definedGroupPadding = mathMax(pluckNumber(chartAttr.plotspacepercent), 0);
                conf.plotSpacePercent = mathMax(pluckNumber(chartAttr.plotspacepercent, 20) % 100, 0);
                conf.maxColWidth = pluckNumber(isBar ? chartAttr.maxbarheight : chartAttr.maxcolwidth, 50);
                conf.showPercentValues = pluckNumber(chartAttr.showpercentvalues, (isStacked && stack100Percent) ?
                    1 : 0);
                conf.showPercentInToolTip = pluckNumber(chartAttr.showpercentintooltip,
                    (isStacked && stack100Percent) ? 1 : 0);
                conf.plotPaddingPercent = pluckNumber(chartAttr.plotpaddingpercent),
                conf.rotateValues = pluckNumber(chartAttr.rotatevalues) ? 270 : 0;
                conf.placeValuesInside = pluckNumber(chartAttr.placevaluesinside, 0);

                conf.use3DLighting = pluckNumber(chartAttr.use3dlighting, 1);
                if (!dataStore) {
                    dataStore = dataSet.components.data = [];
                }
                conf.plotAsDot = plotAsDot = pluckNumber(chartAttr.plotasdot, 0);
                conf.plotFillPercent = pluckNumber(chartAttr.plotfillpercent, plotAsDot ? 25 : 40);
                conf.targetFillPercent = pluckNumber(chartAttr.targetfillpercent, 60);
                conf.targetThickness = pluckNumber(chartAttr.targetthickness, 3);
                targetalpha = conf.targetalpha = pluckNumber(chartAttr.targetalpha, 100);
                conf.targetColor = convertColor(pluck(chartAttr.targetcolor,
                    colorM.getColor(PLOTFILLCOLOR_STR)), targetalpha);

                dataSet._setConfigure();
            },

            _setConfigure : function (newDataset) {
                var dataSet = this,
                    chart = dataSet.chart,
                    conf = dataSet.config,
                    JSONData = dataSet.JSONData,
                    setDataArr = newDataset || JSONData.data,
                    setDataLen = setDataArr && setDataArr.length,
                    categories = chart.config.categories,
                    catLen = categories && categories.length,
                    len = (newDataset && newDataset.data.length) || mathMin(catLen, setDataLen),
                    chartAttr = chart.jsonData.chart,
                    components = chart.components,
                    colorM = components.colorManager,
                    showplotborder = conf.showplotborder,
                    showPlotBorderOnHover = conf.showPlotBorderOnHover,
                    plotColor = conf.plotColor,
                    // showTooltip = pluckNumber(chartAttr.showtooltip, 1),
                    parseUnsafeString = lib.parseUnsafeString,
                    tooltipSepChar = parseUnsafeString(pluck(chartAttr.tooltipsepchar, COMMASPACE)),
                    seriesNameInTooltip = pluckNumber(chartAttr.seriesnameintooltip, 1),
                    parseTooltext = lib.parseTooltext,
                    formatedVal,
                    parserConfig,
                    setTooltext,
                    seriesname,
                    macroIndices,
                    tempPlotfillAngle,
                    // toolText,
                    plotDashLen,
                    plotDashGap,
                    plotBorderThickness = conf.plotBorderThickness,
                    isRoundEdges = conf.isRoundEdges,
                    showHoverEffect = conf.showHoverEffect,
                    plotfillAngle = conf.plotFillAngle,
                    plotFillAlpha,
                    //plotRadius,
                    plotFillRatio,
                    //plotgradientcolor,
                    plotBorderAlpha = conf.plotBorderAlpha,
                    plotBorderDashStyle,
                    initailPlotBorderDashStyle = conf.plotBorderDashStyle,
                    setData,
                    setValue,
                    dataObj,
                    config,
                    // label,
                    colorArr,
                    hoverColor,
                    hoverAlpha,
                    hoverGradientColor,
                    hoverRatio,
                    hoverAngle,
                    hoverBorderColor,
                    hoverBorderAlpha,
                    hoverBorderThickness,
                    hoverBorderDashed,
                    hoverBorderDashGap,
                    hoverBorderDashLen,
                    hoverDashStyle,
                    hoverColorArr,
                    getDashStyle = lib.getDashStyle,
                    dataStore = dataSet.components.data,
                    toolTipValue,
                    setDisplayValue,
                    isBar = chart.isBar,
                    is3D = chart.is3D,
                    setDataDashed,
                    setDataPlotDashLen,
                    setDataPlotDashGap,
                    i,
                    maxValue = -Infinity,
                    minValue = Infinity,
                    numberFormatter = chart.components.numberFormatter,

                    target,
                    hoverAttr,
                    outAttr,
                    targetHoverThickness,
                    targetHoverColor,
                    targetHoverAlpha,
                    hasTargetHoverMix,
                    setTooltextTarget,
                    getTooltext = function(setTooltext) {
                        var toolText;

                        if (!conf.showTooltip) {
                            toolText = false;
                        }
                        else {
                            if (formatedVal === null) {
                                toolText = false;
                            }
                            else if (setTooltext !== undefined) {
                                macroIndices = [1,2,3,4,5,6,7,26,27];
                                parserConfig = {
                                    formattedValue : formatedVal,
                                    targetValue : config.target,
                                    targetDataValue : config.toolTipValueTarget
                                };
                                toolText = parseTooltext(setTooltext, macroIndices,
                                    parserConfig, setData, chartAttr, JSONData);
                            }
                            else {
                                if (seriesNameInTooltip) {
                                    seriesname = getFirstValue(JSONData && JSONData.seriesname);
                                }
                                toolText = seriesname ? seriesname + tooltipSepChar : BLANK;
                                toolText += config.label ? config.label + tooltipSepChar : BLANK;
                            }
                        }
                        return toolText;
                    };

                if (!dataStore) {
                    dataStore = dataSet.components.data = [];
                }

                // Parsing the attributes and values at set level.
                for (i = 0; i < len; i++) {

                    if (newDataset) {
                        setData = (newDataset && newDataset.data[i]);
                    }
                    else {
                        setData = setDataArr[i];
                    }

                    dataObj = dataStore[i];

                    config = dataObj && dataObj.config;

                    if (!dataObj) {
                        dataObj = dataStore[i] = {};
                    }

                    if (!dataObj.config) {
                        config = dataStore[i].config = {};

                    }

                    config.showValue = pluckNumber(setData.showvalue, conf.showValues);
                    config.valuePadding = pluckNumber(chartAttr.valuepadding, 2);
                    config.setValue = setValue = numberFormatter.getCleanValue(setData.value);
                    config.target = target = numberFormatter.getCleanValue(setData.target);
                    config.setLink  = pluck(setData.link);
                    config.toolTipValue = toolTipValue = numberFormatter.dataLabels(setValue);
                    config.toolTipValueTarget = numberFormatter.dataLabels(target);
                    config.setDisplayValue = setDisplayValue = parseUnsafeString(setData.displayvalue);
                    config.displayValue = pluck(setData.label, setDisplayValue, toolTipValue);
                    setDataDashed = pluckNumber(setData.dashed);
                    setDataPlotDashLen = pluckNumber(setData.dashlen, plotDashLen);
                    setDataPlotDashGap = plotDashGap = pluckNumber(setData.dashgap, plotDashGap);

                    maxValue = mathMax(maxValue, setValue, target);
                    minValue = mathMin(minValue, setValue, target);

                    config.plotBorderDashStyle = plotBorderDashStyle =  setDataDashed === 1 ?
                        getDashStyle(setDataPlotDashLen, setDataPlotDashGap, plotBorderThickness) :
                            (setDataDashed === 0 ? noneStr : initailPlotBorderDashStyle);

                    plotColor = pluck(setData.color, conf.plotColor);

                    plotFillAlpha = pluck(setData.alpha, conf.plotFillAlpha);

                    // Setting the angle for plot fill for negative data
                    if (setValue < 0 && !isRoundEdges) {

                        tempPlotfillAngle = plotfillAngle;
                        plotfillAngle = isBar ? 180 - plotfillAngle : 360 - plotfillAngle;
                    }

                    // Setting the color Array to be applied to the bar/column.
                    config.colorArr = colorArr = lib.graphics.getColumnColor (
                            plotColor,
                            plotFillAlpha,
                            plotFillRatio,
                            plotfillAngle,
                            isRoundEdges,
                            conf.plotBorderColor,
                            plotBorderAlpha.toString(),
                            (isBar ? 1 : 0),
                            (is3D ? true : false)
                            );

                    //label = 'getValidValue(parseUnsafeString(pluck (categories[i].tooltext, categories[i].label)))';

                    // Parsing the hover effects only if showhovereffect is not 0.
                    if (showHoverEffect !== 0) {

                        hoverColor = pluck(setData.hovercolor, JSONData.hovercolor, chartAttr.plotfillhovercolor,
                            chartAttr.columnhovercolor, plotColor);
                        hoverAlpha = pluck(setData.hoveralpha, JSONData.hoveralpha,
                            chartAttr.plotfillhoveralpha, chartAttr.columnhoveralpha, plotFillAlpha);
                        hoverGradientColor = pluck(setData.hovergradientcolor,
                            JSONData.hovergradientcolor, chartAttr.plothovergradientcolor, conf.plotgradientcolor);
                        !hoverGradientColor && (hoverGradientColor = BLANK);
                        hoverRatio = pluck(setData.hoverratio,
                            JSONData.hoverratio, chartAttr.plothoverratio, plotFillRatio);
                        hoverAngle = pluckNumber(360 - setData.hoverangle,
                            360 - JSONData.hoverangle, 360 - chartAttr.plothoverangle, plotfillAngle);
                        hoverBorderColor = pluck(setData.borderhovercolor,
                            JSONData.borderhovercolor, chartAttr.plotborderhovercolor, chartAttr.plotfillhovercolor,
                            conf.plotBorderColor);
                        hoverBorderAlpha = pluck(setData.borderhoveralpha,
                            JSONData.borderhoveralpha, chartAttr.plotborderhoveralpha, plotBorderAlpha, plotFillAlpha);
                        hoverBorderThickness = pluckNumber(setData.borderhoverthickness,
                            JSONData.borderhoverthickness, chartAttr.plotborderhoverthickness, plotBorderThickness);
                        hoverBorderDashed = pluckNumber(setData.borderhoverdashed,
                            JSONData.borderhoverdashed, chartAttr.plotborderhoverdashed);
                        hoverBorderDashGap = pluckNumber(setData.borderhoverdashgap,
                            JSONData.borderhoverdashgap, chartAttr.plotborderhoverdashgap, plotDashLen);
                        hoverBorderDashLen = pluckNumber(setData.borderhoverdashlen,
                            JSONData.borderhoverdashlen, chartAttr.plotborderhoverdashlen, plotDashGap);
                        hoverDashStyle = hoverBorderDashed ?
                            getDashStyle(hoverBorderDashLen, hoverBorderDashGap, hoverBorderThickness) :
                                plotBorderDashStyle;

                        /* If no hover effects are explicitly defined and
                         * showHoverEffect is not 0 then hoverColor is set.
                         */
                        if (showHoverEffect == 1 && hoverColor === plotColor) {
                            hoverColor = getDarkColor(hoverColor, 90);
                        }

                        // setting the hover color array which is always applied except when showHoverEffect is not 0.
                        hoverColorArr = lib.graphics.getColumnColor (
                            hoverColor,
                            hoverAlpha,
                            hoverRatio,
                            hoverAngle,
                            isRoundEdges,
                            hoverBorderColor,
                            hoverBorderAlpha.toString(),
                            (isBar ? 1 : 0),
                            false
                            ),

                        config.setPlotRolloutAttr = {
                            fill: !is3D ? toRaphaelColor(colorArr[0])
                                    : [toRaphaelColor(colorArr[0]), !conf.use3DLighting],
                            stroke: showplotborder && toRaphaelColor(colorArr[1]),
                            'stroke-width': plotBorderThickness,
                            'stroke-dasharray': plotBorderDashStyle
                        };

                        config.setPlotRolloverAttr = {
                            fill: !is3D ? toRaphaelColor(hoverColorArr[0])
                                    : [toRaphaelColor(hoverColorArr[0]), !conf.use3DLighting],
                            stroke: toRaphaelColor(hoverColorArr[1]),
                            'stroke-width': showPlotBorderOnHover ? (hoverBorderThickness || 1) : hoverBorderThickness,
                            'stroke-dasharray': hoverDashStyle
                        };
                    }

                    if (showHoverEffect !== 0 && (showHoverEffect || chartAttr.targethovercolor ||
                            chartAttr.targethoveralpha || chartAttr.targethoveralpha === 0 ||
                            chartAttr.targethoverthickness || chartAttr.targethoverthickness === 0)) {
                        showHoverEffect = true;
                        hoverAttr = {};
                        outAttr = {};
                        targetHoverThickness = pluckNumber(chartAttr.targethoverthickness, conf.targetThickness + 2);
                        if (conf.targetThickness !== targetHoverThickness) {
                            hoverAttr['stroke-width'] = targetHoverThickness;
                            outAttr['stroke-width'] = conf.targetThickness;
                        }
                        targetHoverColor = pluck(chartAttr.targethovercolor, FILLMIXDARK10);
                        targetHoverAlpha = pluckNumber(chartAttr.targethoveralpha, conf.targetalpha);
                        if (targetHoverThickness) {
                            outAttr.stroke = conf.targetColor;
                            hasTargetHoverMix = /\{/.test(targetHoverColor);
                            hoverAttr.stroke = convertColor(hasTargetHoverMix ?
                                colorM.parseColorMix(pluck(chartAttr.targetcolor, plotColor), targetHoverColor)[0] :
                                targetHoverColor, targetHoverAlpha);
                        }
                        //showHoverAnimation = !!pluckNumber(chartAttr.showhoveranimation, 1);
                        config.tagetHoverAttr = hoverAttr;
                        config.targetOutAttr = outAttr;
                    }

                    formatedVal = config.toolTipValue;

                    // Parsing tooltext against various configurations provided by the user.
                    setTooltext = getValidValue(parseUnsafeString(pluck(setData.tooltext,
                        JSONData.plottooltext, chartAttr.plottooltext)));
                    // if (!showTooltip) {
                    //     toolText = false;
                    // }
                    // else {
                    //     if (formatedVal === null) {
                    //         toolText = false;
                    //     }
                    //     else if (setTooltext !== undefined) {
                    //         macroIndices = [1,2,3,4,5,6,7,26,27];
                    //         parserConfig = {
                    //             formattedValue : formatedVal,
                    //             targetValue : config.target,
                    //             targetDataValue : config.toolTipValueTarget
                    //         };
                    //         toolText = parseTooltext(setTooltext, macroIndices,
                    //             parserConfig, setData, chartAttr, JSONData);
                    //     }
                    //     else {
                    //         if (seriesNameInTooltip) {
                    //             seriesname = getFirstValue(JSONData && JSONData.seriesname);
                    //         }
                    //         toolText = seriesname ? seriesname + tooltipSepChar : BLANK;
                    //         toolText += label ? label + tooltipSepChar : BLANK;
                    //     }
                    // }
                    config.toolText = getTooltext(setTooltext);
                    config.setTooltext = config.toolText;
                    tempPlotfillAngle && (plotfillAngle = tempPlotfillAngle);

                    setTooltextTarget = getValidValue(parseUnsafeString(pluck(setData.tooltexttarget,
                        JSONData.targettooltext, chartAttr.targettooltext)));
                    config.toolTextTarget = getTooltext(setTooltextTarget);
                }
                conf.maxValue = maxValue;
                conf.minValue = minValue;
            },

            _manageSpace : function (availableHeight) {
                var dataSet = this,
                    conf = dataSet.config,
                    JSONData = dataSet.JSONData,
                    setDataArr = JSONData.data,
                    dataStore = dataSet.components.data,
                    setData,
                    dataObj,
                    chart = dataSet.chart,
                    captionConfig = chart.components.caption.config,
                    // components = dataSet.components,
                    chartConfig = chart.config,
                    // datasetConfig = dataSet.config,
                    smartLabel = chart.linkedItems.smartLabel,
                    // canvasWidth = chartConfig.canvasWidth,
                    smartDataLabel, extraSpace,
                    style = chartConfig.dataLabelStyle,
                    lineHeight = pluckNumber(parseInt(style.lineHeight, 10), 12),
                    maxAllowedHeight = availableHeight,
                    valuePadding = conf.valuePadding,
                    // valuePaddingWithRadius,
                    heightUsed = 0,
                    // heightReducedBottom = 0, heightReducedTop = 0,
                    // tickDimension = 0,
                    i = 0,
                    len = 1,
                    //pointerOnOpp = datasetConfig.pointerOnOpp,
                    config;

                setData = setDataArr[i];
                dataObj = dataStore[i];
                config = dataObj && dataObj.config;

                smartLabel.useEllipsesOnOverflow(chartConfig.useEllipsesWhenOverflow);
                smartLabel.setStyle(style);

                for (; i < len; i += 1) {

                    if (conf.showValue) {

                        smartDataLabel = smartLabel.getOriSize(config.toolTipValue);
                        //special fix for space string
                        /** @todo will be removed when smartLabel will be able to handle it */
                        if (config.toolTipValue === BLANK) {
                            smartDataLabel = {
                                height : lineHeight
                            };
                        }

                        if (smartDataLabel.height > 0) {
                            heightUsed = smartDataLabel.height + valuePadding;
                        }

                        if (heightUsed > maxAllowedHeight) {
                            extraSpace = heightUsed - maxAllowedHeight;
                            heightUsed = maxAllowedHeight;
                        }
                    }
                }
                captionConfig.widgetValueHeight = heightUsed;
                conf.heightUsed = heightUsed;
                return {
                    top : 0,
                    bottom : heightUsed
                };
            },

            _manageSpaceHorizontal : function (availableWidth) {
                var dataSet = this,
                    conf = dataSet.config,
                    JSONData = dataSet.JSONData,
                    setDataArr = JSONData.data,
                    dataStore = dataSet.components.data,
                    setData,
                    dataObj,
                    chart = dataSet.chart,
                    // components = dataSet.components,
                    chartConfig = chart.config,
                    // datasetConfig = dataSet.config,
                    smartLabel = chart.linkedItems.smartLabel,
                    // canvasWidth = chartConfig.canvasWidth,
                    smartDataLabel, extraSpace,
                    style = chartConfig.dataLabelStyle,
                    lineHeight = pluckNumber(parseInt(style.lineHeight, 10), 12),
                    maxAllowedWidth = availableWidth,
                    valuePadding = conf.valuePadding,
                    // valuePaddingWithRadius,
                    widthUsed = 0,
                    i = 0,
                    len = 1,
                    config;

                setData = setDataArr[i];
                dataObj = dataStore[i];
                config = dataObj && dataObj.config;

                smartLabel.useEllipsesOnOverflow(chartConfig.useEllipsesWhenOverflow);
                smartLabel.setStyle(style);

                for (; i < len; i += 1) {
                    //config = components[i].config;
                    if (config && config.displayValue !== BLANKSTRING && config.displayValue !== UNDEFINED) {

                        if (conf.showValue) {

                            smartDataLabel = smartLabel.getOriSize(config.displayValue);
                            //special fix for space string
                            /** @todo will be removed when smartLabel will be able to handle it */
                            if (config.displayValue === BLANK) {
                                smartDataLabel = {
                                    height : lineHeight
                                };
                            }

                            if (smartDataLabel.height > 0) {
                                widthUsed = smartDataLabel.width + valuePadding + 2;
                            }

                            if (widthUsed > maxAllowedWidth) {
                                extraSpace = widthUsed - maxAllowedWidth;
                                widthUsed = maxAllowedWidth;
                            }
                        }
                    }
                }
                conf.widthUsed = widthUsed;
                return {
                    top : 0,
                    right : widthUsed
                };
            },

            updateData : function (dataObj, index, draw) {
                var dataSet = this,
                    conf = dataSet.config,
                    prevMax = conf.maxValue,
                    prevMin = conf.prevMin,
                    chart = dataSet.chart,
                    drawManager = dataSet.groupManager || dataSet,
                    chartComponents = chart.components,
                    scale = chartComponents.scale;

                dataSet._setConfigure(dataObj, index);
                dataSet.setMaxMin();

                if (conf.maxValue !== prevMax || conf.minValue !== prevMin) {
                    dataSet.maxminFlag = true;
                }

                if (draw) {
                    chart._setAxisLimits();
                    scale.draw();
                    drawManager.draw();
                }
            },

            // Get the max and min of data during real time update.
            setMaxMin : function () {
                var dataSet = this,
                    dataStore = dataSet.components.data,
                    conf = dataSet.config,
                    i,
                    config,
                    len = dataStore.length,
                    maxValue = -Infinity,
                    minValue = +Infinity;

                for (i = 0; i < len; i++) {
                    if (!dataStore[i]) {
                        continue;
                    }
                    config = dataStore[i].config;
                    maxValue = mathMax(maxValue, config.setValue, config.target);
                    minValue = mathMin(minValue, config.setValue, config.target);
                }

                conf.maxValue = maxValue;
                conf.minValue = minValue;
            },

            draw : function () {
                var dataSet = this,
                    chart = dataSet.chart,
                    components = chart.components,
                    chartAttr = chart.jsonData.chart,
                    chartConfig = chart.config,
                    chartGraphics = chart.graphics,
                    paper = components.paper,
                    canvas = components.canvas,
                    graphics = canvas.graphics,
                    config = canvas.config,
                    canvasElement = graphics.canvasElement,
                    canvasLeft = chartConfig.canvasLeft,
                    canvasRight = chartConfig.canvasRight,
                    canvasTop = chartConfig.canvasTop,
                    canvasBottom = chartConfig.canvasBottom,
                    canvasWidth = chartConfig.canvasWidth,
                    canvasHeight = chartConfig.canvasHeight,
                    parentContainer = chartGraphics.datasetGroup,
                    shadow = config.shadow,
                    attr,
                    scale = components.scale,
                    min = scale.getLimit().min,
                    max = scale.getLimit().max,
                    isHorizontal = chart.isHorizontal,

                    animationObj = chart.get(configStr, animationObjStr),
                    animType = animationObj.animType,
                    animObj = animationObj.animObj,
                    dummyObj = animationObj.dummyObj,
                    animationDuration = animationObj.duration,

                    getRectXY = function (minValue, maxValue) {
                        if (!isHorizontal) {
                            return {
                                x: canvasLeft,
                                y: canvasTop + (canvasHeight - (maxValue * canvasHeight / (max - min))),
                                width: canvasWidth,
                                height: (maxValue - minValue) * canvasHeight / (max - min)
                            };
                        }
                        else if (isHorizontal) {
                            return {
                                x: canvasLeft + ((minValue * canvasWidth / (max - min))),
                                y: canvasTop,
                                width: (maxValue - minValue) * canvasWidth / (max - min),
                                height: canvasHeight
                            };
                        }
                    },
                    angle,
                    gaugeFillMix,
                    gaugeFillRatio,
                    paletteIndex,
                    colorRangeGetter,
                    colorArray,
                    colorM = chart.components.colorManager,
                    gaugeBorderColor,
                    gaugeBorderAlpha,
                    showShadow,
                    showGaugeBorder,
                    gaugeBorderThickness,
                    colorObj,
                    i,
                    len,
                    xyObj,
                    color,
                    borderColor,
                    crColor,
                    crAlpha,
                    borderAlpha,
                    shadowAlpha,
                    colorRangeElemsLength;

                angle = isHorizontal ? 270 : 180;

                config.colorRangeFillMix = gaugeFillMix = lib.getFirstDefinedValue(chartAttr.colorrangefillmix,
                    chartAttr.gaugefillmix, chart.colorRangeFillMix,
                    '{light-10},{dark-10},{light-10},{dark-10}');

                config.colorRangeFillRatio = gaugeFillRatio = lib.getFirstDefinedValue(chartAttr.colorrangefillratio,
                    chartAttr.gaugefillratio, chart.colorRangeFillRatio, chartAttr.gaugefillratio,
                    '0,10,80,10');

                paletteIndex = 0;

                config.colorRangeGetter = colorRangeGetter = components.colorRange;

                config.colorArray = colorArray = colorRangeGetter &&
                    colorRangeGetter.getColorRangeArr(min, max);

                gaugeBorderColor = pluck(chartAttr.colorrangebordercolor,
                    chartAttr.gaugebordercolor, '{dark-20}');

                gaugeBorderAlpha = pluckNumber(chartAttr.colorrangeborderalpha,
                    chartAttr.gaugeborderalpha, 100);

                showShadow = pluckNumber(chartAttr.showshadow, 1);

                showGaugeBorder = pluckNumber(chartAttr.showgaugeborder, chartAttr.showcolorrangeborder, 0);

                config.colorRangeBorderThickness = gaugeBorderThickness =
                showGaugeBorder ? pluckNumber(chartAttr.colorrangeborderthickness,
                    chartAttr.gaugeborderthickness, 2) : 0;

                len = colorArray && colorArray.length;

                if (!canvasElement) {
                    graphics.canvasElement = canvasElement = {};
                    canvasElement.colorRangeElems = [];
                }
                else {
                    colorRangeElemsLength = canvasElement.colorRangeElems.length;
                    for (i = colorRangeElemsLength; i > len; i -= 1) {
                        canvasElement.colorRangeElems[i-1].hide();
                        canvasElement.colorRangeElems[i-1].shadow({opacity: 0});
                    }
                }

                for (i = 0; i < len; i += 1) {
                    colorObj = colorArray[i],
                    xyObj = getRectXY((colorObj.minvalue - min), (colorObj.maxvalue - min));
                    colorObj.x = xyObj.x;
                    colorObj.y = xyObj.y;
                    colorObj.width = xyObj.width;
                    colorObj.height = xyObj.height;

                    color = colorObj.code;

                    borderColor = convertColor(getColorCodeString(pluck(colorObj.bordercolor, color), gaugeBorderColor),
                        pluckNumber(colorObj.borderalpha, gaugeBorderAlpha));

                    shadow = showShadow ? (Math.max(colorObj.alpha, gaugeBorderAlpha) / 100) : null;

                    //create the shadow element
                    crColor = colorM.parseColorMix(colorObj.code, gaugeFillMix);
                    crAlpha = colorM.parseAlphaList(colorObj.alpha, crColor.length);
                    borderAlpha = pluckNumber(colorObj.borderAlpha, gaugeBorderAlpha);
                    shadowAlpha = crAlpha.split(COMMASTRING);

                    shadowAlpha = mathMax.apply(Math, shadowAlpha);
                    shadowAlpha = mathMax(gaugeBorderThickness && borderAlpha || 0, shadowAlpha);

                    attr = {
                        x: xyObj.x,
                        y: xyObj.y,
                        width: xyObj.width,
                        height: xyObj.height,
                        r: 0,
                        'stroke-width': gaugeBorderThickness,
                        stroke: borderColor,
                        'fill': toRaphaelColor({
                            FCcolor: {
                                color: crColor.toString(),
                                ratio: gaugeFillRatio,
                                alpha: crAlpha,
                                angle: angle
                            }
                        })
                    };

                    if (!canvasElement.colorRangeElems[i]) {
                        canvasElement.colorRangeElems[i] = paper.rect(attr, parentContainer);
                    }

                    else {
                        canvasElement.colorRangeElems[i].show();

                        attr = {
                            'stroke-width': gaugeBorderThickness,
                            stroke: borderColor,
                            'fill': toRaphaelColor({
                                FCcolor: {
                                    color: crColor.toString(),
                                    ratio: gaugeFillRatio,
                                    alpha: crAlpha,
                                    angle: angle
                                }
                            })
                        };

                        canvasElement.colorRangeElems[i].animateWith(dummyObj, animObj, {
                                x: xyObj.x,
                                y: xyObj.y,
                                width: xyObj.width,
                                height: xyObj.height,
                                r: 0
                            }, animationDuration, animType);

                        canvasElement.colorRangeElems[i].attr(attr);
                    }

                    canvasElement.colorRangeElems[i]
                        .shadow({
                            apply: showShadow,
                            opacity: (shadowAlpha / 100)
                        });
                }

                chartConfig.gaugeStartX = canvasLeft;
                chartConfig.gaugeEndX = canvasRight;
                chartConfig.gaugeStartY = canvasTop;
                chartConfig.gaugeEndY = canvasBottom;
                chartConfig.gaugeCenterX = canvasLeft + (canvasWidth * 0.5);
                chartConfig.gaugeCenterY = canvasTop + (canvasHeight * 0.5);
                chartConfig.gaugeRadius = canvasWidth * 0.5;

                dataSet.drawPlot();
            },

            drawPlot: function () {
                var dataSet = this,
                    JSONData = dataSet.JSONData,
                    chartAttr = dataSet.chart.jsonData.chart,
                    conf = dataSet.config,
                    categories = dataSet.chart.config.categories,
                    setDataArr = JSONData.data,
                    catLen = categories && categories.length,
                    dataSetLen = setDataArr && setDataArr.length,
                    len,
                    setData,
                    attr,
                    i,
                    visible = dataSet.visible,
                    chart = dataSet.chart,
                    jobList = chart.getJobList(),
                    chartConfig = chart.config,
                    canvasLeft = chartConfig.canvasLeft,
                    canvasRight = chartConfig.canvasRight,
                    canvasTop = chartConfig.canvasTop,
                    canvasBottom = chartConfig.canvasBottom,
                    canvasHeight = chartConfig.canvasHeight,
                    canvasWidth = chartConfig.canvasWidth,

                    paper = chart.components.paper,
                    scale = chart.components.scale,
                    parentContainer = chart.graphics.datasetGroup,
                    xPos,
                    yPos,
                    crispBox,
                    layers = chart.graphics,
                    parseUnsafeString = lib.parseUnsafeString,
                    getValidValue = lib.getValidValue,
                    R = lib.Raphael,
                    showTooltip = conf.showTooltip,

                    animationObj = chart.get(configStr, animationObjStr),
                    animType = animationObj.animType,
                    animObj = animationObj.animObj,
                    dummyObj = animationObj.dummyObj,
                    animationDuration = animationObj.duration,

                    columnWidth,
                    height,
                    toolText,
                    dataStore = dataSet.components.data,
                    dataObj,
                    setTooltext,
                    setElement,
                    // hotElement,
                    setLink,
                    setValue,
                    eventArgs,
                    displayValue,
                    groupId,
                    config,
                    setPlotRolloutAttr,
                    setPlotRolloverAttr,
                    yMax = scale.max,
                    yMin = scale.min,
                    isAllPositiveZero = yMax > 0 && yMin >= 0,
                    isAllNegativeZero = yMax <= 0 && yMin < 0,
                    isPositive,
                    yBase = isAllNegativeZero ? yMax : isAllPositiveZero ? yMin : 0,
                    yBasePos = scale.yBasePos = scale.getAxisPosition(yBase),
                    heightBase = 0,
                    widthBase = 0,
                    showShadow = conf.showShadow,
                    plotBorderThickness = conf.plotBorderThickness,
                    plotRadius = conf.plotRadius,

                    container = dataSet.graphics.container,
                    trackerContainer = dataSet.graphics.trackerContainer,

                    targetContainer = dataSet.graphics.targetContainer,
                    trackerTargetContainer = dataSet.graphics.trackerTargetContainer,

                    dataLabelContainer = dataSet.graphics.dataLabelContainer,

                    shadowContainer = dataSet.graphics.shadowContainer,
                    shadowTargetContainer = dataSet.graphics.shadowTargetContainer,

                    trackerLayer = layers.trackerGroup,
                    colorArr,
                    plotBorderDashStyle,
                    animFlag = true,

                    isNegative = false,

                    targetPath,

                    targetLength,
                    startX,
                    endX,
                    startY,
                    endY,
                    initialColumnWidth,

                    dataLabelsLayer =  layers.datalabelsGroup,
                    style = chart.config.dataLabelStyle,
                    heightUsed = conf.heightUsed,
                    lineHeight,
                    labelBBox,
                    labelWidth,
                    isNewElem,
                    isNewTargetElem,
                    lowerLimit = conf.lowerLimit,
                    base,
                    trackerConfig,
                    // css = {
                    //     fontFamily: style.fontFamily,
                    //     fontSize: style.fontSize,
                    //     lineHeight: style.lineHeight,
                    //     fontWeight: style.fontWeight,
                    //     fontStyle: style.fontStyle
                    // },
                    showHoverEffect = conf.showHoverEffect,

                    //Fired when clicked over the hot elements.
                    clickFunc = function (setDataArr) {
                            var ele = this;
                            plotEventHandler.call(ele, chart, setDataArr);
                        },

                    //Fired on mouse-in over the hot elements.
                    rolloverResponseSetter = function (elem) {
                            return function (data) {
                                var ele = this;
                                if (ele.data(showHoverEffectStr) !== 0) {
                                    elem.attr(ele.data(SETROLLOVERATTR));
                                }
                                plotEventHandler.call(ele, chart, data, ROLLOVER);
                            };
                        },

                    //Fired on mouse-out over the hot elements.
                    rolloutResponseSetter = function (elem) {
                            return function (data) {
                                var ele = this;
                                if (ele.data(showHoverEffectStr) !== 0) {
                                    elem.attr(ele.data(SETROLLOUTATTR));
                                }
                                plotEventHandler.call(ele, chart, data, ROLLOUT);
                            };
                        },

                    //Fired at the end of transpose animation.
                    animCallBack = function() {
                        /*
                         * It enters the if condition if the dataset is not visible that is the legend is clicked to
                         * hide the dataset. Also it is executed only once for each dataset though it is called by
                         * every plot of each dataset but the _conatinerHidden flag restricts multiple execution of the
                         * if condition.
                         */
                        if (dataSet.visible === false && (dataSet._conatinerHidden === false ||
                                dataSet._conatinerHidden=== undefined)) {
                            container.hide();
                            trackerContainer.hide();
                            shadowContainer.hide();
                            dataLabelContainer && dataLabelContainer.hide();
                            dataSet._conatinerHidden = true;
                        }
                    };

                /*
                 * Creating a container group for the graphic element of bar plots if
                 * not present and attaching it to its parent group.
                 */
                if (!container) {
                    container = dataSet.graphics.container = paper.group('bar', parentContainer);
                    // Clipping the group so that the plots do not come out of the canvas area when given thick border.
                    // if (!container.attrs['clip-rect'] && !isScroll) {
                    //     container.attr({
                    //         'clip-rect': elements['clip-canvas']
                    //     });
                    // }
                    if (!visible) {
                        container.hide();
                    }
                }

                if (!dataLabelContainer) {
                    dataLabelContainer = dataSet.graphics.dataLabelContainer =
                        paper.group('datalabel', dataLabelsLayer);
                }

                if (!targetContainer) {
                    targetContainer = dataSet.graphics.targetContainer =
                    paper.group('target', parentContainer).trackTooltip(true);
                    // Clipping the group so that the plots do not come out of the canvas area when given thick border.
                    // if (!container.attrs['clip-rect'] && !isScroll) {
                    //     container.attr({
                    //         'clip-rect': elements['clip-canvas']
                    //     });
                    // }
                    if (!visible) {
                        targetContainer.hide();
                    }
                }

                /*
                 * Creating the hot element container group for the column plots if not present
                 * and attaching it its parent group.
                 */
                if (!trackerContainer) {
                    trackerContainer = dataSet.graphics.trackerContainer = paper.group('bar-hot', trackerLayer);
                    if (!visible) {
                        trackerContainer.hide();
                    }
                }

                if (!trackerTargetContainer) {
                    trackerTargetContainer = dataSet.graphics.trackerTargetContainer =
                    paper.group('target-hot', trackerLayer);
                    if (!visible) {
                        trackerTargetContainer.hide();
                    }
                }

                //chart.addCSSDefinition('.fusioncharts-datalabels .fusioncharts-label', labelCSS);

                /*
                 * Creating the shadow element container group for each plots if not present
                 * and attaching it its parent group.
                 */
                if (!shadowContainer) {
                    // Always sending the shadow group to the back of the plots group.
                    shadowContainer = dataSet.graphics.shadowContainer =
                        paper.group('shadow', parentContainer).toBack();
                    // Clipping the group so that the shadow do not come out of the canvas area when given thick border.
                    // if (!shadowContainer.attrs['clip-rect'] && !isScroll) {
                    //     shadowContainer.attr({
                    //         'clip-rect': elements['clip-canvas']
                    //     });
                    // }
                    if (!visible) {
                        shadowContainer.hide();
                    }

                }

                if (!shadowTargetContainer) {
                    // Always sending the shadow group to the back of the plots group.
                    shadowTargetContainer = dataSet.graphics.shadowTargetContainer =
                        paper.group('shadow', parentContainer).toBack();
                    // Clipping the group so that the shadow do not come out of the canvas area when given thick border.
                    // if (!shadowTargetContainer.attrs['clip-rect'] && !isScroll) {
                    //     shadowTargetContainer.attr({
                    //         'clip-rect': elements['clip-canvas']
                    //     });
                    // }
                    if (!visible) {
                        shadowTargetContainer.hide();
                    }

                }

                len = mathMin(catLen, dataSetLen);

                // Create plot elements.
                for (i = 0; i < 1; i++) {
                    setData = setDataArr[i];
                    dataObj = dataStore[i];
                    config = dataObj && dataObj.config;
                    trackerConfig = dataObj.trackerConfig = {};
                    setValue = config.setValue;
                    isPositive = setValue >= 0;

                    (setValue < 0) && (isNegative = true);

                    setLink  = config.setLink;
                    colorArr = config.colorArr;

                    isNewElem = false;
                    isNewTargetElem = false;

                    // Creating the data structure if not present for storing the graphics elements.
                    if (!dataObj.graphics) {
                        dataStore[i].graphics = {};

                    }

                    displayValue = config.displayValue;

                    // previousY = isPositive ? config.previousPositiveY : config.previousNegativeY;

                    setTooltext = getValidValue(parseUnsafeString(pluck(setData.tooltext,
                            JSONData.plottooltext, chartAttr.plottooltext)));

                    if (!chart.isHorizontal) {

                        initialColumnWidth = (conf.plotFillPercent / 100) * canvasWidth;

                        xPos = (mathAbs(canvasLeft + canvasRight) / 2) - (initialColumnWidth / 2);

                        if (conf.plotAsDot) {
                            yPos = scale.getAxisPosition(setValue) - (initialColumnWidth / 2);
                            height = initialColumnWidth;
                        }
                        else{
                            base = lowerLimit && (lowerLimit <= setValue) &&
                                    (scale.config.axisRange.min >= 0) ? lowerLimit : 0;

                            yBasePos = scale.getAxisPosition(base);

                            yPos = isNegative ? scale.getAxisPosition(0) : scale.getAxisPosition(setValue);

                            height = isNegative ? scale.getAxisPosition(setValue) - scale.getAxisPosition(0) :
                                scale.getAxisPosition(lowerLimit && (lowerLimit <= setValue) &&
                                (scale.config.axisRange.min >= 0) ? lowerLimit : 0) - yPos;
                        }

                        crispBox = R.crispBound(xPos, yPos, initialColumnWidth, height, plotBorderThickness);
                        xPos = crispBox.x;
                        yPos = crispBox.y;
                        columnWidth = crispBox.width;
                        height = crispBox.height;

                        // Setting the final tooltext.
                        toolText = config.toolText === BLANK ? config.toolTipValue : config.toolText;
                        plotBorderDashStyle = config.plotBorderDashStyle;

                        // Setting the event arguments.
                        trackerConfig.eventArgs = {
                            link: setLink,
                            value: setValue,
                            displayValue: displayValue,
                            toolText: toolText
                        };

                        setPlotRolloutAttr = config.setPlotRolloutAttr;
                        setPlotRolloverAttr = config.setPlotRolloverAttr;

                        /*
                         * If animation is inactive then ybase position and heightBase of the plots is set to the final
                         * values.
                         */
                        if (!animationDuration) {
                            yBasePos = yPos;
                            heightBase = height;
                        }

                        // Setting the attributes for plot drawing.
                        attr = {
                            x: xPos,
                            y: yBasePos,
                            width: columnWidth,
                            height: heightBase || 1,
                            r: plotRadius,
                            ishot: true,
                            fill: toRaphaelColor(colorArr[0]),
                            stroke: toRaphaelColor(colorArr[1]),
                            'stroke-width': plotBorderThickness,
                            'stroke-dasharray': plotBorderDashStyle,
                            'stroke-linejoin': miterStr,
                            'visibility': visible
                        };

                        //todo- remove _ to make it public
                        dataObj._xPos = xPos;
                        dataObj._yPos = yPos + height;
                        dataObj._height = height;
                        dataObj._width = columnWidth;

                        if (setValue !== null) {

                            /*
                             * If the data plots are not present then they are
                             * created, else only attributes are set for the
                             * existing plots.
                             */
                            if (!dataObj.graphics.element) {
                                setElement = dataObj.graphics.element = paper.rect(attr, container);
                                isNewElem = true;

                                setElement.animateWith(dummyObj, animObj, {
                                        y: yPos,
                                        height: height || 1
                                    }, animationDuration, animType);

                                if (animationDuration) {
                                    // animFlag is set to false so that initAnimCallBack is called only once for
                                    // each dataset.
                                    animFlag = false;
                                }
                                config.elemCreated = true;
                            }

                            else {
                                dataObj.graphics.element.show();
                                attr = {
                                    x: xPos,
                                    y: yPos,
                                    width: columnWidth,
                                    height: height || 1,
                                    r: plotRadius
                                };

                                setElement = dataObj.graphics.element;

                                setElement.animateWith(dummyObj, animObj, attr,
                                    animationDuration, animType, (animFlag && animCallBack));

                                setElement.attr({
                                    ishot: true,
                                    fill: toRaphaelColor(colorArr[0]),
                                    stroke: toRaphaelColor(colorArr[1]),
                                    'stroke-width': plotBorderThickness,
                                    'stroke-dasharray': plotBorderDashStyle,
                                    'stroke-linejoin': miterStr,
                                    'visibility': visible
                                });
                                config.elemCreated = false;
                            }

                            // The shadow element is set for the dataplots.
                            setElement
                            .shadow({opacity : showShadow}, shadowContainer)
                            .data('BBox', crispBox);

                            if (setLink || showTooltip) {
                                // Fix for touch devices.
                                if (height < HTP) {
                                    yPos -= (HTP - height) / 2;
                                    height = HTP;
                                }

                                // Setting attributes for the tooltip.
                                trackerConfig.attr = {
                                    x: xPos,
                                    y: yPos,
                                    width: columnWidth,
                                    height: height,
                                    r: plotRadius,
                                    cursor: setLink ? POINTER : BLANK,
                                    stroke: TRACKER_FILL,
                                    'stroke-width': plotBorderThickness,
                                    fill: TRACKER_FILL,
                                    ishot: true,
                                    visibility: visible
                                };

                                /*
                                 * If the tooltips are not present then they are created over the hot element,
                                 * else only attributes are set for the existing tooltips.
                                 */
                                // if (!dataObj.graphics.hotElement) {
                                //     hotElement = dataObj.graphics.hotElement = paper.rect(attr, trackerContainer);
                                //     isNewElem = true;
                                // }
                                // else {
                                //     dataObj.graphics.hotElement.show();
                                //     dataObj.graphics.hotElement.attr(attr);
                                // }
                            }

                            // hotElement = dataObj.graphics.hotElement;

                            // (hotElement || setElement)
                            //     .data(EVENTARGS, eventArgs)
                            //     .data(GROUPID, groupId)
                            //     .data(showHoverEffectStr, showHoverEffect)
                            //     .data(SETROLLOVERATTR, setPlotRolloverAttr)
                            //     .data(SETROLLOUTATTR, setPlotRolloutAttr)
                            //     .tooltip(toolText);

                            // if (isNewElem) {
                            //     (hotElement || setElement)
                            //         .click(clickFunc)
                            //         .hover(
                            //             rolloverResponseSetter(setElement),
                            //             rolloutResponseSetter(setElement)
                            //         );
                            // }
                        }
                        else {

                            dataObj.graphics.element && dataObj.graphics.element.hide();
                            dataObj.graphics.hotElement && dataObj.graphics.hotElement.hide();

                        }
                        //------------------------------------------------------------------------------------

                        if (config.target) {
                            setTooltext = getValidValue(parseUnsafeString(pluck(setData.tooltext,
                                    JSONData.targettooltext, chartAttr.targettooltext)));

                            toolText = config.toolTextTarget === BLANK ?
                              config.toolTipValueTarget : config.toolTextTarget;

                            targetLength = (conf.targetFillPercent / 100) * canvasWidth;

                            startX = ((canvasLeft + canvasRight) / 2) - (targetLength / 2);
                            endX = startX + targetLength;
                            startY = endY = scale.getAxisPosition(config.target);

                            targetPath = [M, startX, startY, L, endX, endY];

                            attr = {
                                stroke : conf.targetColor,
                                'stroke-width': conf.targetThickness,
                                'stroke-linecap': conf.targetCapStyle,
                                ishot: true,
                                'shape-rendering': DECIDE_CRISPENING[(3 < 1)]
                            };

                            setElement = dataObj.graphics.targetElement;

                            if (!setElement) {
                                setElement = dataObj.graphics.targetElement = paper.path(targetPath, targetContainer)
                                .attr(attr);
                                isNewTargetElem = true;
                            }

                            else {
                                dataObj.graphics.targetElement.show();
                                attr = {
                                    path: targetPath,
                                    stroke : conf.targetColor,
                                    'stroke-width': conf.targetThickness,
                                    'stroke-linecap': conf.targetCapStyle,
                                    ishot: true,
                                    'shape-rendering': DECIDE_CRISPENING[(3 < 1)]
                                };

                                setElement.animateWith(dummyObj, animObj, attr,
                                    animationDuration, animType);
                            }

                            if (isNewTargetElem) {
                                setElement
                                    .click(clickFunc)
                                    .hover(
                                        rolloverResponseSetter(setElement),
                                        rolloutResponseSetter(setElement)
                                    );
                            }

                            setElement
                                .shadow({opacity : showShadow}, shadowContainer)
                                .data('BBox', crispBox)
                                .data(EVENTARGS, eventArgs)
                                .data(GROUPID, groupId)
                                .data(showHoverEffectStr, showHoverEffect)
                                .data(SETROLLOVERATTR, config.tagetHoverAttr)
                                .data(SETROLLOUTATTR, config.targetOutAttr);

                            if (showTooltip) {
                                setElement.tooltip(toolText);
                            }
                            else {
                                setElement.tooltip(false);
                            }
                        }
                        else {
                            dataObj.graphics.targetElement && dataObj.graphics.targetElement.hide();
                        }

                        lineHeight = parseInt(style.lineHeight, 10);

                        yPos = lineHeight > heightUsed ? (chartConfig.height - chartConfig.marginBottom - heightUsed) +
                                lineHeight/2 : chartConfig.height - chartConfig.marginBottom - lineHeight/2;
                        yPos -= chartConfig.borderWidth;
                        yPos -= (chart._manageActionBarSpace &&
                            chart._manageActionBarSpace(config.availableHeight * 0.225) || {}).bottom;

                        if ((displayValue !== BLANKSTRING) && (displayValue !== UNDEFINED) && conf.showValue) {
                            attr = {
                                text: displayValue,
                                'text-anchor': POSITION_MIDDLE,
                                x: canvasWidth/2 + canvasLeft,
                                y: yPos,
                                'vertical-align': POSITION_MIDDLE,
                                fill: style.color,
                                direction: config.textDirection,
                                'text-bound': [style.backgroundColor, style.borderColor,
                                    style.borderThickness, style.borderPadding,
                                    style.borderRadius, style.borderDash]
                            };
                            if (!dataObj.graphics.label) {
                                dataObj.graphics.label = paper.text(attr, dataLabelContainer);
                            }
                            else {
                                dataObj.graphics.label.show();

                                dataObj.graphics.label.animateWith(dummyObj, animObj, {
                                    x: canvasWidth/2 + canvasLeft,
                                    y: yPos
                                }, animationDuration, animType);

                                dataObj.graphics.label
                                    .attr({text: displayValue,
                                    'text-anchor': POSITION_MIDDLE,
                                    'vertical-align': POSITION_MIDDLE,
                                    fill: style.color,
                                    direction: config.textDirection,
                                    'text-bound': [style.backgroundColor, style.borderColor,
                                        style.borderThickness, style.borderPadding,
                                        style.borderRadius, style.borderDash]
                                    });
                            }

                            // Adjusting the chart label if goes out side the chart area
                            // we try to keep the label inside viewport
                            labelBBox = dataObj.graphics.label.getBBox();
                            if (labelBBox.x + chartConfig.marginLeft < 0) {
                                labelWidth = labelBBox.width - chartConfig.marginLeft;
                                if(chartConfig.width < labelWidth) {
                                    labelWidth = chartConfig.width - chartConfig.marginLeft;
                                }
                                attr = {
                                    x : labelWidth/2
                                };
                                dataObj.graphics.label.animateWith(dummyObj, animObj, attr,
                                    animationDuration, animType);
                            }
                        }
                        else {
                            dataObj.graphics.label && dataObj.graphics.label.hide() &&
                                dataObj.graphics.label.attr({'text-bound': []});
                        }
                    }
                    else {

                        height = (conf.plotFillPercent / 100) * canvasHeight;

                        yPos = (mathAbs(canvasTop + canvasBottom) / 2) - (height / 2);

                        if (conf.plotAsDot) {
                            xPos = scale.getAxisPosition(setValue) - (height / 2);
                            initialColumnWidth = height;
                        }
                        else {
                            base = lowerLimit && (lowerLimit <= setValue) &&
                                    (scale.config.axisRange.min >= 0) ? lowerLimit : 0;

                            xPos = isNegative ? scale.getAxisPosition(setValue) : scale.getAxisPosition(base);

                            initialColumnWidth = isNegative ? scale.getAxisPosition(0) - scale.getAxisPosition(setValue)
                                                    : scale.getAxisPosition(setValue) - scale.getAxisPosition(base);
                        }

                        crispBox = R.crispBound(xPos, yPos, initialColumnWidth, height, plotBorderThickness);
                        xPos = crispBox.x;
                        yPos = crispBox.y;
                        columnWidth = crispBox.width;
                        height = crispBox.height;

                        // Setting the final tooltext.
                        toolText = config.toolText === BLANK ? config.toolTipValue : config.toolText;
                        plotBorderDashStyle = config.plotBorderDashStyle;

                        // Setting the event arguments.
                        trackerConfig.eventArgs = {
                            link: setLink,
                            value: setValue,
                            displayValue: displayValue,
                            toolText: !toolText ? '' : toolText
                        };

                        setPlotRolloutAttr = config.setPlotRolloutAttr;
                        setPlotRolloverAttr = config.setPlotRolloverAttr;

                        if (!animationDuration) {
                            widthBase = columnWidth;
                        }

                        // Setting the attributes for plot drawing.
                        attr = {
                            x: xPos,
                            y: yPos,
                            width: widthBase || 1,
                            height: height,
                            r: plotRadius,
                            ishot: true,
                            fill: toRaphaelColor(colorArr[0]),
                            stroke: toRaphaelColor(colorArr[1]),
                            'stroke-width': plotBorderThickness,
                            'stroke-dasharray': plotBorderDashStyle,
                            'stroke-linejoin': miterStr,
                            'visibility': visible
                        };

                        if (setValue !== null) {
                            /*
                             * If the data plots are not present then they are created,
                             * else only attributes are set for the
                             * existing plots.
                             */
                            if (!dataObj.graphics.element) {
                                setElement = dataObj.graphics.element = paper.rect(attr, container);
                                isNewElem = true;

                                setElement.animateWith(dummyObj, animObj, {
                                        width: columnWidth || 1
                                    }, animationDuration, animType);

                                if (animationDuration) {
                                    // animFlag is set to false so that initAnimCallBack is called only once
                                    // for each dataset.
                                    animFlag = false;
                                }
                                config.elemCreated = true;
                            }

                            else {
                                dataObj.graphics.element.show();
                                attr = {
                                    x: xPos,
                                    y: yPos,
                                    width: columnWidth,
                                    height: height || 1,
                                    r: plotRadius
                                };

                                setElement = dataObj.graphics.element;

                                setElement.animateWith(dummyObj, animObj, attr,
                                    animationDuration, animType, (animFlag && animCallBack));

                                setElement.attr({
                                    ishot: true,
                                    fill: toRaphaelColor(colorArr[0]),
                                    stroke: toRaphaelColor(colorArr[1]),
                                    'stroke-width': plotBorderThickness,
                                    'stroke-dasharray': plotBorderDashStyle,
                                    'stroke-linejoin': miterStr,
                                    'visibility': visible
                                });
                                config.elemCreated = false;
                            }

                            // The shadow element is set for the dataplots.
                            setElement
                            .shadow({opacity : showShadow}, shadowContainer)
                            .data('BBox', crispBox);

                            if (setLink || showTooltip) {
                                // Fix for touch devices.
                                if (height < HTP) {
                                    yPos -= (HTP - height) / 2;
                                    height = HTP;
                                }

                                // Setting attributes for the tooltip.
                                trackerConfig.attr = {
                                    x: xPos,
                                    y: yPos,
                                    width: columnWidth,
                                    height: height,
                                    r: plotRadius,
                                    cursor: setLink ? POINTER : BLANK,
                                    stroke: TRACKER_FILL,
                                    'stroke-width': plotBorderThickness,
                                    fill: TRACKER_FILL,
                                    ishot: true,
                                    visibility: visible
                                };

                                /*
                                 * If the tooltips are not present then they are created over the hot element,
                                 * else only attributes are set for the existing tooltips.
                                 */
                                // if (!dataObj.graphics.hotElement) {
                                //     hotElement = dataObj.graphics.hotElement = paper.rect(attr, trackerContainer);
                                //     isNewElem = true;
                                // }
                                // else {
                                //     dataObj.graphics.hotElement.show();
                                //     dataObj.graphics.hotElement.attr(attr);
                                // }
                            }

                            // hotElement = dataObj.graphics.hotElement;

                            // (hotElement || setElement)
                            //     .data(EVENTARGS, eventArgs)
                            //     .data(GROUPID, groupId)
                            //     .data(showHoverEffectStr, showHoverEffect)
                            //     .data(SETROLLOVERATTR, setPlotRolloverAttr)
                            //     .data(SETROLLOUTATTR, setPlotRolloutAttr)
                            //     .tooltip(toolText);

                            // if (isNewElem) {
                            //     (hotElement || setElement)
                            //         .click(clickFunc)
                            //         .hover(
                            //             rolloverResponseSetter(setElement),
                            //             rolloutResponseSetter(setElement)
                            //         );
                            // }
                        }
                        else {

                            dataObj.graphics.element && dataObj.graphics.element.hide();
                            dataObj.graphics.hotElement && dataObj.graphics.hotElement.hide();

                        }

                        //------------------------------------------------------------------------------------
                        if (config.target) {
                            setTooltext = getValidValue(parseUnsafeString(pluck(setData.tooltext,
                                    JSONData.targettooltext, chartAttr.targettooltext)));

                            toolText = config.toolTextTarget === BLANK ?
                              config.toolTipValueTarget : config.toolTextTarget;

                            targetLength = (conf.targetFillPercent / 100) * canvasHeight;
                            startX = endX = scale.getAxisPosition(config.target);

                            startY = ((canvasTop + canvasBottom) / 2) - (targetLength / 2);
                            endY = startY + targetLength;

                            targetPath = [M, startX, startY, L, endX, endY];

                            attr = {
                                stroke : conf.targetColor,
                                'stroke-width': conf.targetThickness,
                                'stroke-linecap': conf.targetCapStyle,
                                ishot: true,
                                'shape-rendering': DECIDE_CRISPENING[(3 < 1)]
                            };

                            setElement = dataObj.graphics.targetElement;

                            if (!setElement) {
                                setElement = dataObj.graphics.targetElement = paper.path(targetPath, targetContainer)
                                .attr(attr);
                                isNewTargetElem = true;
                            }

                            else {
                                dataObj.graphics.targetElement.show();
                                attr = {
                                    path: targetPath,
                                    stroke : conf.targetColor,
                                    'stroke-width': conf.targetThickness,
                                    'stroke-linecap': conf.targetCapStyle,
                                    ishot: true,
                                    'shape-rendering': DECIDE_CRISPENING[(3 < 1)]
                                };

                                setElement.animateWith(dummyObj, animObj, attr,
                                    animationDuration, animType);
                            }

                            if (isNewTargetElem) {
                                setElement
                                    .click(clickFunc)
                                    .hover(
                                        rolloverResponseSetter(setElement),
                                        rolloutResponseSetter(setElement)
                                    );
                            }

                            setElement
                                .shadow({opacity : showShadow}, shadowContainer)
                                .data('BBox', crispBox)
                                .data(EVENTARGS, eventArgs)
                                .data(GROUPID, groupId)
                                .data(showHoverEffectStr, showHoverEffect)
                                .data(SETROLLOVERATTR, config.tagetHoverAttr)
                                .data(SETROLLOUTATTR, config.targetOutAttr);

                            if (showTooltip) {
                                setElement.tooltip(toolText);
                            }
                            else {
                                setElement.tooltip(false);
                            }
                        }
                        else {
                            dataObj.graphics.targetElement && dataObj.graphics.targetElement.hide();
                        }

                        lineHeight = parseInt(style.lineHeight, 10);

                        yPos = (canvasTop + canvasHeight) * 0.5;

                        if ((displayValue !== BLANKSTRING) && (displayValue !== UNDEFINED) && conf.showValue) {
                            attr = {
                                text: displayValue,
                                'text-anchor': POSITION_START,
                                x: canvasRight + conf.valuePadding + 2,
                                y: yPos,
                                'vertical-align': POSITION_TOP,
                                fill: style.color,
                                direction: config.textDirection,
                                'text-bound': [style.backgroundColor, style.borderColor,
                                    style.borderThickness, style.borderPadding,
                                    style.borderRadius, style.borderDash]
                            };
                            if (!dataObj.graphics.label) {
                                dataObj.graphics.label = paper.text(attr, dataLabelContainer);
                            }
                            else {
                                dataObj.graphics.label.show();

                                dataObj.graphics.label.animateWith(dummyObj, animObj, {
                                    x: canvasRight + conf.valuePadding + 2,
                                    y: yPos
                                }, animationDuration, animType);

                                dataObj.graphics.label
                                    .attr({
                                        text: displayValue,
                                        'text-anchor': POSITION_START,
                                        'vertical-align': POSITION_TOP,
                                        fill: style.color,
                                        direction: config.textDirection,
                                        'text-bound': [style.backgroundColor, style.borderColor,
                                            style.borderThickness, style.borderPadding,
                                            style.borderRadius, style.borderDash]
                                    });

                            }

                            // Adjusting the chart label if goes out side the chart area
                            // we try to keep the label inside viewport
                            labelBBox = dataObj.graphics.label.getBBox();
                            if (labelBBox.x + chartConfig.marginLeft < 0) {
                                labelWidth = labelBBox.width - chartConfig.marginLeft;
                                if(chartConfig.width < labelWidth) {
                                    labelWidth = chartConfig.width - chartConfig.marginLeft;
                                }
                                attr = {
                                    x : labelWidth/2
                                };

                                dataObj.graphics.label.animateWith(dummyObj, animObj, attr,
                                    animationDuration, animType);
                            }
                        }
                        else {
                            dataObj.graphics.label && dataObj.graphics.label.hide() &&
                                dataObj.graphics.label.attr({'text-bound': []});
                        }
                    }

                }
                jobList.trackerDrawID.push(schedular.addJob(dataSet.drawTracker, dataSet, [],
                       lib.priorityList.tracker));

            },

            drawTracker : function () {
                var dataSet = this,
                    chart = dataSet.chart,
                    components = dataSet.components,
                    pool = components.pool,
                    dataStore = components.data,
                    chartConfig = chart.config,
                    showHoverEffect = chartConfig.plothovereffect,
                    chartComponents = chart.components,
                    // xAxis = chartComponents.xAxis[0],
                    paper = chartComponents.paper,
                    // len = xAxis.getCategoryLen(),
                    trackerContainer = dataSet.graphics.trackerContainer,
                    trackerConfig,
                    config,
                    // i,
                    dataObj,
                    setElement,
                    hotElemCreated,
                    hotElement,
                    attr,
                    graphics,
                    //Fired when clicked over the hot elements.
                    clickFunc = function (setDataArr) {
                        var ele = this;
                        plotEventHandler.call(ele, chart, setDataArr);
                    },
                    //Fired on mouse-in over the hot elements.
                    rolloverResponseSetter = function (elem) {
                        return function (data) {
                            var ele = this,
                                elData = ele.getData();
                            // Check whether the plot is in dragged state or not if
                            // drag then dont fire rolloverevent
                            if (elData.showHoverEffect !== 0 && elData.draged !== true) {
                                elem.attr(ele.getData().setRolloverAttr);
                                plotEventHandler.call(ele, chart, data, ROLLOVER);
                            }
                        };
                    },

                    //Fired on mouse-out over the hot elements.
                    rolloutResponseSetter = function (elem) {
                        return function (data) {
                            var ele = this,
                                elData = ele.getData();
                            // Check whether the plot is in draggedstate or not if drag then dont fire rolloutevent
                            if (elData.showHoverEffect !== 0 && elData.draged !== true) {
                                elem.attr(ele.getData().setRolloutAttr);
                                plotEventHandler.call(ele, chart, data, ROLLOUT);
                            }
                        };
                    };

                // Create tracker elements.
                dataObj = dataStore[0];
                config = dataObj && dataObj.config;
                trackerConfig = dataObj.trackerConfig;
                graphics = dataObj.graphics;

                setElement = graphics.element;
                hotElement = dataObj.graphics.hotElement;
                if (attr = trackerConfig.attr) {

                    /*
                     * If the tooltips are not present then they are created over the hot element,
                     * else only attributes are set for the existing tooltips.
                     */
                    if (!(hotElement = dataObj.graphics.hotElement)) {
                        // If any hot element is there in the pool then use it
                        if (pool && pool.hotElement[0]) {
                            hotElement = dataObj.graphics.hotElement = pool.hotElement[0];
                            pool.hotElement.splice(0, 1);
                        }
                        else {
                            hotElement = dataObj.graphics.hotElement = paper.rect(attr, trackerContainer);
                            hotElemCreated = true;
                        }
                    }
                    else {
                        hotElement.attr(attr);
                    }
                }

                // Hover effects and click function is binded to the hot element if present else the set element.
                (hotElement || setElement)
                    .data(EVENTARGS, trackerConfig.eventArgs)
                    .data(showHoverEffectStr, showHoverEffect)
                    .data(SETROLLOVERATTR, config.setPlotRolloverAttr || {})
                    .data(SETROLLOUTATTR, config.setPlotRolloutAttr || {})
                    .tooltip(trackerConfig.eventArgs && trackerConfig.eventArgs.toolText);

                if (hotElemCreated || config.elemCreated) {
                    (hotElement || setElement)
                    .click(clickFunc)
                    .hover(
                        rolloverResponseSetter(setElement),
                        rolloutResponseSetter(setElement)
                    );
                }
            },

            addData : function() {
            },

            removeData : function() {
            },

            // Setting axis limits
            getDataLimits : function () {
                var dataSet = this,
                    config = dataSet.config,
                    pointerArr = dataSet.pointerArr && dataSet.pointerArr.pointer,
                    colorRange = dataSet.chart.jsonData.colorrange,
                    colorArr = colorRange && colorRange.color,
                    length = pointerArr && pointerArr.length,
                    i,
                    upperLimit = config.upperLimit,
                    lowerLimit = config.lowerLimit,
                    maxColorRangeVal,
                    minColorRangeVal,
                    max = config.maxValue,
                    min = config.minValue;

                length = colorArr && colorArr.length;
                // finding max min amongst the color range value
                // but it has a lower priority than upperlimit and lowerlimit
                // set by the user.
                for (i=0; i<length; i++) {
                    maxColorRangeVal = Number(colorArr[i].maxvalue);
                    minColorRangeVal = Number(colorArr[i].minvalue);

                    upperLimit && (maxColorRangeVal > upperLimit) && (maxColorRangeVal = upperLimit);
                    lowerLimit && (minColorRangeVal < lowerLimit) && (minColorRangeVal = lowerLimit);

                    max = mathMax(max, maxColorRangeVal);
                    min = mathMin(min, minColorRangeVal);
                }

                return {
                    forceMin : true,
                    forceMax : true,
                    max : max,
                    min : min
                };
            }

        },'hlineargauge']);

    }
]);

FusionCharts.register('module', ['private', 'modules.renderer.js-dataset-led',
    function () {
        var global = this,
            lib = global.hcLib,
            //strings
            BLANK = lib.BLANKSTRING,
            BLANKSTRING = BLANK,
            //add the tools thats are requared
            pluck = lib.pluck,
            pluckNumber = lib.pluckNumber,

            plotEventHandler = lib.plotEventHandler,
            getColorCodeString = lib.getColorCodeString,
            getDarkColor = lib.graphics.getDarkColor,
            getLightColor = lib.graphics.getLightColor,
            convertColor = lib.graphics.convertColor,
            preDefStr = lib.preDefStr,
            colorStrings = preDefStr.colors,
            COLOR_000000 = colorStrings.c000000,
            configStr = preDefStr.configStr,
            animationObjStr = preDefStr.animationObjStr,
            showHoverEffectStr = preDefStr.showHoverEffectStr,
            BUTT = 'butt',
            POSITION_MIDDLE = preDefStr.POSITION_MIDDLE,

            ledColorRangeFillMixStr = '{light-10},{dark-10},{light-10},{dark-10}',
            ledColorRangeFillRatioStr = '0,10,80,10',

            COMMASTRING = lib.COMMASTRING,

            win = global.window,
            userAgent = win.navigator.userAgent,

            isIE = /msie/i.test(userAgent) && !win.opera,
            TRACKER_FILL = 'rgba(192,192,192,'+ (isIE ? 0.002 : 0.000001) +')',

            math = Math,
            mathRound = math.round,
            mathMax = math.max,
            dropHash = lib.regex.dropHash,
            // isArray = lib.isArray,
            SETROLLOVERATTR = 'setRolloverAttr',
            SETROLLOUTATTR = 'setRolloutAttr',
            EVENTARGS = 'eventArgs',
            COMPONENT = 'component',
            DATASET = 'dataset',

            HASHSTRING = lib.HASHSTRING,

            toRaphaelColor = lib.toRaphaelColor,
            UNDEFINED,
            M = 'M',
            L = 'L',
            Z = 'Z',

            HUNDREDSTRING = lib.HUNDREDSTRING;

        FusionCharts.register(COMPONENT, [DATASET, 'led', {

            init : function(datasetJSON) {
                var dataSet = this,
                    chart = dataSet.chart,
                    components = chart.components,
                    visible;

                if (!datasetJSON) {
                    return false;
                }

                dataSet.JSONData = datasetJSON;
                dataSet.yAxis = components.scale;
                dataSet.chartGraphics = chart.chartGraphics;
                dataSet.components = {
                };

                dataSet.graphics = {
                };

                dataSet.visible = visible = pluckNumber(dataSet.JSONData.visible,
                    !Number(dataSet.JSONData.initiallyhidden), 1) === 1;

                dataSet.configure();
            },

            draw : function () {
                var dataSet = this,
                    chart = dataSet.chart,
                    conf = dataSet.config,
                    components = chart.components,
                    chartAttr = chart.jsonData.chart,
                    chartConfig = chart.config,
                    chartGraphics = chart.graphics,
                    paper = components.paper,
                    canvas = components.canvas,
                    graphics = canvas.graphics,
                    config = canvas.config,

                    animationObj = chart.get(configStr, animationObjStr),
                    animType = animationObj.animType,
                    animObj = animationObj.animObj,
                    dummyObj = animationObj.dummyObj,
                    animationDuration = animationObj.duration,

                    canvasBorderElement = graphics.canvasBorderElement,
                    canvasElement = graphics.canvasElement,
                    canvasElementPath = graphics.canvasElementPath,
                    canvasHotElement = graphics.canvasHotElement,
                    canvasLeft = chartConfig.canvasLeft,
                    canvasRight = chartConfig.canvasRight,
                    canvasTop = chartConfig.canvasTop,
                    canvasBottom = chartConfig.canvasBottom,
                    canvasWidth = chartConfig.canvasWidth,
                    canvasHeight = chartConfig.canvasHeight,
                    parentContainer = chartGraphics.datasetGroup,
                    shadow = config.shadow,
                    scale = components.scale,
                    min = scale.getLimit().min,
                    max = scale.getLimit().max,
                    isAxisReverse = pluckNumber(chart.jsonData.chart.reverseaxis, chart.isAxisReverse),
                    isHorizontal = chart.isHorizontal,

                    getRectXY = function (minValue, maxValue) {
                        if (isAxisReverse && !isHorizontal) {
                            return {
                                x: canvasLeft,
                                y: canvasTop + (minValue * canvasHeight / (max - min)),
                                width: canvasWidth,
                                height: (maxValue - minValue) * canvasHeight / (max - min)
                            };
                        }
                        else if (!isAxisReverse && !isHorizontal) {
                            return {
                                x: canvasLeft,
                                y: canvasTop + (canvasHeight - (maxValue * canvasHeight / (max - min))),
                                width: canvasWidth,
                                height: (maxValue - minValue) * canvasHeight / (max - min)
                            };
                        }
                        else if (isAxisReverse && isHorizontal) {
                            return {
                                x: canvasLeft + (canvasWidth - (maxValue * canvasWidth / (max - min))),
                                y: canvasTop,
                                width: (maxValue - minValue) * canvasWidth / (max - min),
                                height: canvasHeight
                            };
                        }
                        else if (!isAxisReverse && isHorizontal) {
                            return {
                                x: canvasLeft + ((minValue * canvasWidth / (max - min))),
                                y: canvasTop,
                                width: (maxValue - minValue) * canvasWidth / (max - min),
                                height: canvasHeight
                            };
                        }
                    },
                    angle = 180,
                    gaugeFillMix,
                    gaugeFillRatio,
                    paletteIndex,
                    colorArray,
                    colorM = chart.components.colorManager,
                    gaugeBorderColor,
                    gaugeBorderAlpha,
                    showShadow,
                    showGaugeBorder,
                    gaugeBorderThickness,
                    colorObj,
                    i,
                    len,
                    xyObj,
                    color,
                    borderColor,
                    crColor,
                    crAlpha,
                    borderAlpha,
                    shadowAlpha,
                    useSameFillColor,
                    useSameFillBgColor,
                    ledGap,
                    ledSize,
                    plotHoverEffect,
                    gaugeFillColor,
                    LEDlength,
                    sizeGapSum,
                    ledGapHalf,
                    ledGapQuarter,
                    remaningLength,
                    valueDistance,
                    halfBorderWidth,
                    x1,
                    y1,
                    x2,
                    y2,
                    noOfLED,
                    extraSpace,
                    LEDGapStartX,
                    LEDGapStartY,
                    pathCommand,
                    colorRangeGetter,
                    numberFormatter = chart.components.numberFormatter,
                    useSameFillColorCode,
                    lastColor,
                    value,
                    colorIndex,
                    showHoverEffect = conf.showHoverEffect,
                    //Fired when clicked over the hot elements.
                    clickFunc = function (data) {
                            var ele = this;
                            plotEventHandler.call(ele, chart, data);
                        },
                    rolloverResponseSetter = function (colorRangeElems) {
                        var i = 0,
                            len,
                            elem,
                            ele;

                        return function () {
                            ele = this;
                            if (ele.data(showHoverEffectStr) !== 0) {
                                for (i = 0, len = colorRangeElems.length; i < len; i += 1) {
                                    elem = colorRangeElems[i];
                                    elem.attr(ele.data(SETROLLOVERATTR)[i]);
                                }
                            }
                        };
                    },
                    rolloutResponseSetter = function (colorRangeElems) {
                        var i = 0,
                            len,
                            elem,
                            ele;

                        return function () {
                            ele = this;
                            if (ele.data(showHoverEffectStr) !== 0) {
                                for (i = 0, len = colorRangeElems.length; i < len; i += 1) {
                                    elem = colorRangeElems[i];
                                    elem.attr(ele.data(SETROLLOUTATTR)[i]);
                                }
                            }
                        };
                    },
                    setRolloverAttr = [],
                    setRolloutAttr = [],
                    layers = chart.graphics,
                    dataSetGraphics = dataSet.graphics,
                    trackerContainer = dataSetGraphics.trackerContainer,
                    trackerLayer = layers.trackerGroup,
                    setLink,
                    eventArgs,
                    LEDDrawn = 0,
                    perLEDValueLength,
                    lastX,
                    lastY,
                    colorLED,
                    colorLedLengthPX,
                    colorLEDLength,
                    isNewElement = false,
                    attr;

                if (!trackerContainer) {
                    trackerContainer = dataSet.graphics.trackerContainer = paper.group('led-hot', trackerLayer);
                }

                showGaugeBorder = pluckNumber(chartAttr.showgaugeborder, 1);
                gaugeBorderColor = pluck(chartAttr.gaugebordercolor, chart.gaugeBorderColor, '333333');
                gaugeBorderThickness = showGaugeBorder ? pluckNumber(chartAttr.gaugeborderthickness,
                                                    chart.gaugeBorderThickness, 2) : 0;
                gaugeBorderAlpha = pluck(chartAttr.gaugeborderalpha, HUNDREDSTRING);
                //Gauge fill color
                config.gaugeFillColor = gaugeFillColor = pluck(chartAttr.gaugefillcolor, chartAttr.ledbgcolor,
                    COLOR_000000);
                //Whether to use same fill color?
                useSameFillColor = pluckNumber(chartAttr.usesamefillcolor, 0);
                //Same color for back ground
                useSameFillBgColor = pluckNumber(chartAttr.usesamefillbgcolor, useSameFillColor);

                conf.ledGap = ledGap = pluckNumber(chartAttr.ledgap, 2);
                conf.ledSize = ledSize = pluckNumber(chartAttr.ledsize, 2);
                plotHoverEffect = pluckNumber(chartAttr.showhovereffect, 0);

                config.colorRangeFillMix = gaugeFillMix = lib.getFirstDefinedValue(chartAttr.colorrangefillmix,
                    chartAttr.gaugefillmix, chart.colorRangeFillMix,
                    ledColorRangeFillMixStr);

                config.colorRangeFillRatio = gaugeFillRatio = lib.getFirstDefinedValue(chartAttr.colorrangefillratio,
                    chartAttr.gaugefillratio, chart.colorRangeFillRatio, chartAttr.gaugefillratio,
                    ledColorRangeFillRatioStr);

                paletteIndex = 0;
                config.colorRangeGetter = colorRangeGetter = components.colorRange;

                config.colorArray = colorArray = colorRangeGetter && colorRangeGetter.getColorRangeArr(min, max);

                gaugeBorderColor = pluck(gaugeBorderColor, COLOR_000000).replace(dropHash, HASHSTRING);

                gaugeBorderAlpha = pluckNumber(chartAttr.colorrangeborderalpha,
                    chartAttr.gaugeborderalpha, 100);

                showShadow = pluckNumber(chartAttr.showshadow, 1);

                showGaugeBorder = pluckNumber(chartAttr.showgaugeborder, 1);

                config.colorRangeBorderThickness = gaugeBorderThickness =
                showGaugeBorder ? pluckNumber(chartAttr.colorrangeborderthickness,
                    chartAttr.gaugeborderthickness, 2) : 0;

                LEDlength = !isHorizontal ? canvasHeight : canvasWidth;

                sizeGapSum = (ledGap + ledSize) || 1;
                ledGapHalf = ledGap / 2;
                ledGapQuarter = ledGapHalf / 2;
                remaningLength = LEDlength - ledSize;
                valueDistance = max - min;

                halfBorderWidth = gaugeBorderThickness / 2;
                x1 = canvasLeft - halfBorderWidth;
                y1 = canvasTop - halfBorderWidth;
                x2 = canvasLeft + canvasWidth + halfBorderWidth;
                y2 = canvasTop + canvasHeight + halfBorderWidth;

                noOfLED =  parseInt(remaningLength / sizeGapSum, 10) + 1;
                extraSpace = remaningLength % sizeGapSum;
                //devide the extra space amont all the LED
                ledSize += extraSpace / noOfLED;
                conf.sizeGapSum = sizeGapSum = ledSize + ledGap;

                conf.perLEDValueLength = perLEDValueLength = valueDistance / noOfLED;

                LEDGapStartX = canvasLeft;
                LEDGapStartY = canvasTop;

                setLink = pluck(chartAttr.clickurl);

                if (!canvasElement) {
                    graphics.canvasElement = canvasElement = {};
                    canvasElement.colorRangeElems = [];
                }

                value = numberFormatter.getCleanValue(chart.jsonData.value);

                if (useSameFillColor || useSameFillBgColor) {
                    for (i = 0, len = colorArray.length; i < len; i += 1) {
                        if (value >= colorArray[i].minvalue && value <= colorArray[i].maxvalue) {
                            useSameFillColorCode = colorArray[i].code || colorM.getPlotColor(i);
                            colorIndex = i;
                            break;
                        }
                    }
                }

                (colorArray && colorArray.length > 0) && (lastColor = colorArray[0].code || colorM.getPlotColor(0));

                lastX = isAxisReverse ? canvasRight : canvasLeft;
                lastY = isAxisReverse ? canvasTop : canvasBottom;

                for (i = 0, len = colorArray && colorArray.length; i < len; i += 1) {
                    colorObj = colorArray[i],
                    xyObj = getRectXY((colorObj.minvalue - min), (colorObj.maxvalue - min));
                    colorLED = mathRound((colorObj.maxvalue - min) / perLEDValueLength);
                    colorLEDLength = colorLED - LEDDrawn;
                    LEDDrawn = colorLED;
                    colorLedLengthPX =  colorLEDLength * sizeGapSum;

                    if (!isHorizontal && !isAxisReverse) {
                        xyObj.height = colorLedLengthPX - ledGap;
                        xyObj.y = lastY - xyObj.height;
                        lastY -= colorLedLengthPX;
                    }
                    else if (!isHorizontal && isAxisReverse) {
                        xyObj.height = colorLedLengthPX - ledGap;
                        xyObj.y = lastY;
                        lastY += colorLedLengthPX;
                    }
                    else if (isHorizontal && !isAxisReverse) {
                        xyObj.width = colorLedLengthPX - ledGap;
                        xyObj.x =  lastX;
                        lastX += colorLedLengthPX;
                    }
                    else if (isHorizontal && isAxisReverse) {
                        xyObj.width = colorLedLengthPX - ledGap;
                        xyObj.x =  lastX - xyObj.width;
                        lastX -= colorLedLengthPX;
                    }

                    colorObj.x = xyObj.x;
                    colorObj.y = xyObj.y;
                    colorObj.width = xyObj.width;
                    colorObj.height = xyObj.height;

                    if (useSameFillColor) {
                        color = useSameFillColorCode;
                    }
                    else if (useSameFillBgColor && (i > colorIndex)) {
                        color = lastColor;
                    }
                    else {
                        color = lastColor = colorObj.code || colorM.getPlotColor(i);
                    }

                    borderColor = convertColor(getColorCodeString(pluck(colorObj.bordercolor, color), gaugeBorderColor),
                        pluckNumber(colorObj.borderalpha, gaugeBorderAlpha));

                    shadow = showShadow ? (Math.max(colorObj.alpha, gaugeBorderAlpha) / 100) : null;

                    //create the shadow element
                    crColor = colorM.parseColorMix(colorObj.code, gaugeFillMix);
                    crAlpha = colorM.parseAlphaList(colorObj.alpha, crColor.length);
                    borderAlpha = pluckNumber(colorObj.borderAlpha, gaugeBorderAlpha);
                    shadowAlpha = crAlpha.split(COMMASTRING);

                    shadowAlpha = mathMax.apply(Math, shadowAlpha);
                    shadowAlpha = mathMax(gaugeBorderThickness && borderAlpha || 0, shadowAlpha);

                    attr = {
                        x: xyObj.x,
                        y: xyObj.y,
                        width: (xyObj.width < 0) ? 0 : xyObj.width,
                        height: (xyObj.height < 0) ? 0 : xyObj.height,
                        r: 0,
                        'stroke-width': 0,
                        stroke: borderColor,
                        'fill': toRaphaelColor({
                            FCcolor: {
                                color: color,
                                ratio: gaugeFillRatio,
                                alpha: crAlpha,
                                angle: angle
                            }
                        })
                    };

                    if (!canvasElement.colorRangeElems[i]) {
                        canvasElement.colorRangeElems[i] = paper.rect(attr, parentContainer).toBack();
                    }
                    else {
                        canvasElement.colorRangeElems[i].show();
                        canvasElement.colorRangeElems[i].animateWith(dummyObj, animObj, {
                            x: xyObj.x,
                            y: xyObj.y,
                            width: (xyObj.width < 0) ? 0 : xyObj.width,
                            height: (xyObj.height < 0) ? 0 : xyObj.height,
                            r: 0
                        }, animationDuration, animType);

                        canvasElement.colorRangeElems[i].attr({
                            'stroke-width': 0,
                            stroke: borderColor,
                            'fill': toRaphaelColor({
                                FCcolor: {
                                    color: color,
                                    ratio: gaugeFillRatio,
                                    alpha: crAlpha,
                                    angle: angle
                                }
                            })
                        });
                    }

                    canvasElement.colorRangeElems[i]
                    .shadow({
                        apply: showShadow,
                        opacity: (shadowAlpha / 100)
                    });

                    setRolloverAttr.push({
                        'stroke-width' : 0,
                        fill : toRaphaelColor({
                            FCcolor: {
                                color: getDarkColor(pluck(color, COLOR_000000), 80) + COMMASTRING +
                                        getLightColor(pluck(color, COLOR_000000), 80),
                                alpha: pluckNumber(colorObj.alpha, 100),
                                angle: isHorizontal ? 90 : 0
                            }
                        })
                    });

                    setRolloutAttr.push({
                        'stroke-width' : 0,
                        fill : toRaphaelColor({
                            FCcolor: {
                                color: pluck(color, COLOR_000000),
                                alpha: pluckNumber(colorObj.alpha, 100)
                            }
                        })
                    });
                }

                if (colorArray && colorArray.length === 0) {
                    for (i = 0, len = canvasElement.colorRangeElems.length; i < len; i++) {
                        canvasElement.colorRangeElems[i].hide();
                    }
                }

                eventArgs = {
                    link: setLink,
                    value: value
                };

                attr = {
                    x: canvasLeft,
                    y: canvasTop,
                    width: canvasWidth,
                    height: canvasHeight,
                    'stroke-width': 0,
                    fill: TRACKER_FILL,
                    ishot: true
                };

                if (!canvasHotElement) {
                    canvasHotElement = graphics.canvasHotElement = paper.rect(attr, trackerContainer);
                    isNewElement = true;
                }
                else {
                    canvasHotElement.attr(attr);
                }

                canvasHotElement
                    .data(EVENTARGS, eventArgs)
                    .data(showHoverEffectStr, showHoverEffect)
                    .data(SETROLLOVERATTR, setRolloverAttr)
                    .data(SETROLLOUTATTR, setRolloutAttr);

                if (isNewElement) {

                    if (setLink) {
                        canvasHotElement
                            .click(clickFunc);
                    }
                    canvasHotElement
                        .hover(
                            rolloverResponseSetter(canvasElement.colorRangeElems),
                            rolloutResponseSetter(canvasElement.colorRangeElems)
                        );

                }

                if (isHorizontal) {
                    LEDGapStartX += sizeGapSum - (ledGap / 2);
                }
                else {
                    LEDGapStartY += sizeGapSum - (ledGap / 2);
                }

                pathCommand = [];

                attr = {
                    path: [M, x1, y1, L, x2, y1, x2, y2, x1, y2, Z],
                    stroke: convertColor(gaugeBorderColor, gaugeBorderAlpha),
                    'stroke-width': gaugeBorderThickness,
                    'stroke-linecap': BUTT
                };

                if (!canvasBorderElement) {
                    graphics.canvasBorderElement = paper.path(attr, parentContainer)
                    .shadow({
                        apply: showShadow
                    }).toBack();
                }
                else {

                    canvasBorderElement.animateWith(dummyObj, animObj, {
                        path: [M, x1, y1, L, x2, y1, x2, y2, x1, y2, Z]
                    }, animationDuration, animType);

                    canvasBorderElement.attr({
                        stroke: convertColor(gaugeBorderColor, gaugeBorderAlpha),
                        'stroke-width': gaugeBorderThickness
                    });
                }

                //Draw the path for the gap
                for (i = 1; i < noOfLED; i += 1) {
                    if (isHorizontal) {
                        pathCommand.push(M, LEDGapStartX, LEDGapStartY, L, LEDGapStartX, LEDGapStartY + canvasHeight);
                        LEDGapStartX += sizeGapSum;
                    }
                    else {
                        pathCommand.push(M, LEDGapStartX, LEDGapStartY, L, LEDGapStartX + canvasWidth, LEDGapStartY);
                        LEDGapStartY += sizeGapSum;
                    }
                }

                attr = {
                    path: pathCommand,
                    stroke: convertColor(gaugeFillColor, 100),
                    'stroke-width': ledGap,
                    'stroke-linecap': BUTT
                };

                if (!canvasElementPath) {
                    graphics.canvasElementPath = paper.path(attr, parentContainer);
                }
                else {

                    canvasElementPath.animateWith(dummyObj, animObj, {
                        path: pathCommand
                    }, animationDuration, animType);

                    canvasElementPath.attr({
                        stroke: convertColor(gaugeFillColor, 100),
                        'stroke-width': ledGap
                    });
                }

                chartConfig.gaugeStartX = canvasLeft;
                chartConfig.gaugeEndX = canvasRight;
                chartConfig.gaugeStartY = canvasTop;
                chartConfig.gaugeEndY = canvasBottom;
                chartConfig.gaugeCenterX = canvasLeft + (canvasWidth * 0.5);
                chartConfig.gaugeCenterY = canvasTop + (canvasHeight * 0.5);
                chartConfig.gaugeRadius = canvasWidth * 0.5;

                dataSet.drawShade();

            },

            drawShade : function() {
                var dataSet = this,
                    conf = dataSet.config,
                    chartAttr = dataSet.chart.jsonData.chart,
                    dataStore = dataSet.components.data,
                    chart = dataSet.chart,
                    chartConfig = chart.config,
                    canvasLeft = chartConfig.canvasLeft,
                    canvasTop = chartConfig.canvasTop,
                    canvasHeight = chartConfig.canvasHeight,
                    canvasWidth = chartConfig.canvasWidth,
                    paper = chart.components.paper,
                    parentContainer = chart.graphics.datasetGroup,
                    container = dataSet.graphics.container,
                    gaugeFillColor,
                    numberFormatter = chart.components.numberFormatter,
                    setValue,
                    yPos,
                    isAxisReverse = pluckNumber(chartAttr.reverseaxis, chart.isaxisreverse),
                    isHorizontal = chart.isHorizontal,

                    animationObj = chart.get(configStr, animationObjStr),
                    animType = animationObj.animType,
                    animObj = animationObj.animObj,
                    dummyObj = animationObj.dummyObj,
                    animationDuration = animationObj.duration,

                    attr,
                    shadowElement,
                    dataObj = dataStore[0],
                    graphic = dataObj.graphics,
                    config = dataObj && dataObj.config,
                    layers = chart.graphics,
                    dataLabelContainer = dataSet.graphics.dataLabelContainer,
                    dataLabelsLayer =  layers.datalabelsGroup,
                    style = chart.config.dataLabelStyle,
                    heightUsed = conf.heightUsed,
                    lineHeight,
                    labelBBox,
                    labelWidth,
                    setTooltext,
                    initAnimation = conf.initAnimation,
                    lightedLed,
                    lightedLedLength,
                    height,
                    width,
                    scale = chart.components.scale,
                    min = scale.getLimit().min;
                    // css = {
                    //     fontFamily: style.fontFamily,
                    //     fontSize: style.fontSize,
                    //     lineHeight: style.lineHeight,
                    //     fontWeight: style.fontWeight,
                    //     fontStyle: style.fontStyle
                    // };

                gaugeFillColor = chart.components.canvas.config.gaugeFillColor;

                if (!container) {
                    container = dataSet.graphics.container = paper.group('shade', parentContainer);
                }

                // Creating the dataLabel container group if not present and appending it to its parent.
                if (!dataLabelContainer) {
                    dataLabelContainer = dataSet.graphics.dataLabelContainer =
                        paper.group('datalabel', dataLabelsLayer);
                }

                setValue = numberFormatter.getCleanValue(config.setValue);

                if (!dataObj.graphics) {
                    dataObj.graphics = {};
                }

                shadowElement = dataObj.graphics.element;

                lightedLed = (setValue - min) / conf.perLEDValueLength;
                lightedLedLength  = (mathRound(lightedLed) * conf.sizeGapSum) - conf.ledGap;

                height = Math.ceil(canvasHeight - lightedLedLength);
                width = Math.ceil(canvasWidth - lightedLedLength);

                if (isAxisReverse && !isHorizontal) {
                    attr = {
                        x: canvasLeft,
                        y: animationDuration && initAnimation ? canvasTop : canvasTop + lightedLedLength,
                        width: canvasWidth,
                        height: animationDuration && initAnimation ? canvasHeight : height,
                        r: 0,
                        'stroke-width': 0,
                        fill : convertColor(gaugeFillColor, 50)
                    };

                    if (!shadowElement) {
                        shadowElement = dataObj.graphics.element = paper.rect(attr, container);

                        shadowElement.animateWith(dummyObj, animObj, {
                            y: canvasTop + lightedLedLength,
                            height: height
                        }, animationDuration, animType);

                    }
                    else {

                        shadowElement.animateWith(dummyObj, animObj, {
                            x: canvasLeft,
                            y: canvasTop + lightedLedLength,
                            width: canvasWidth,
                            height: height,
                            r: 0
                        }, animationDuration, animType);

                        shadowElement.attr({
                            'stroke-width': 0,
                            fill : convertColor(gaugeFillColor, 50)
                        });

                    }
                }
                else if (!isAxisReverse && !isHorizontal) {
                    attr = {
                        x: canvasLeft,
                        y: canvasTop,
                        width: canvasWidth,
                        height: animationDuration && initAnimation ? canvasHeight : height,
                        r: 0,
                        'stroke-width': 0,
                        fill : convertColor(gaugeFillColor, 50)
                    };

                    if (!shadowElement) {
                        shadowElement = dataObj.graphics.element = paper.rect(attr, container);

                        shadowElement.animateWith(dummyObj, animObj, {
                            height: height
                        }, animationDuration, animType);

                    }
                    else {

                        shadowElement.animateWith(dummyObj, animObj, {
                            x: canvasLeft,
                            y: canvasTop,
                            width: canvasWidth,
                            height: height,
                            r: 0
                        }, animationDuration, animType);

                        shadowElement.attr({
                            'stroke-width': 0,
                            fill : convertColor(gaugeFillColor, 50)
                        });

                    }
                }
                else if (!isAxisReverse && isHorizontal) {
                    attr = {
                        x: animationDuration && initAnimation ? canvasLeft : canvasLeft + lightedLedLength,
                        y: canvasTop,
                        width: animationDuration && initAnimation ? canvasWidth : width,
                        height: canvasHeight,
                        r: 0,
                        'stroke-width': 0,
                        fill : convertColor(gaugeFillColor, 50)
                    };

                    if (!shadowElement) {
                        shadowElement = dataObj.graphics.element = paper.rect(attr, container);

                        shadowElement.animateWith(dummyObj, animObj, {
                            x: canvasLeft + lightedLedLength,
                            width: width
                        }, animationDuration, animType);

                    }
                    else {

                        shadowElement.animateWith(dummyObj, animObj, {
                            x: canvasLeft + lightedLedLength,
                            y: canvasTop,
                            width: width,
                            height: canvasHeight,
                            r: 0
                        }, animationDuration, animType);

                        shadowElement.attr({
                            'stroke-width': 0,
                            fill : convertColor(gaugeFillColor, 50)
                        });

                    }
                }
                else if (isAxisReverse && isHorizontal) {
                    attr = {
                        x: canvasLeft,
                        y: canvasTop,
                        width: animationDuration && initAnimation ? canvasWidth : width,
                        height: canvasHeight,
                        r: 0,
                        'stroke-width': 0,
                        fill : convertColor(gaugeFillColor, 50)
                    };

                    if (!shadowElement) {
                        shadowElement = dataObj.graphics.element = paper.rect(attr, container);

                        shadowElement.animateWith(dummyObj, animObj, {
                            width: width
                        }, animationDuration, animType);

                    }
                    else {

                        shadowElement.animateWith(dummyObj, animObj, {
                            x: canvasLeft,
                            y: canvasTop,
                            width: width,
                            height: canvasHeight,
                            r: 0
                        }, animationDuration, animType);

                        shadowElement.attr({
                            'stroke-width': 0,
                            fill : convertColor(gaugeFillColor, 50)
                        });

                    }
                }
                setTooltext = (config.setTooltext === BLANK || config.setTooltext === UNDEFINED) ?
                    config.toolTipValue : config.setTooltext;

                if (conf.showTooltip) {
                    chart.components.canvas.graphics.canvasHotElement.tooltip(setTooltext);
                }
                else {
                    chart.components.canvas.graphics.canvasHotElement.tooltip(false);
                }

                lineHeight = parseInt(style.lineHeight, 10);

                yPos = lineHeight > heightUsed ? (chartConfig.height - chartConfig.marginBottom - heightUsed) +
                        lineHeight/2 : chartConfig.height - chartConfig.marginBottom - lineHeight/2;

                yPos -= chartConfig.borderWidth;

                yPos -= (chart._manageActionBarSpace &&
                    chart._manageActionBarSpace(config.availableHeight * 0.225) || {}).bottom;
                graphic = dataObj.graphics;

                if ((config.displayValue !== BLANKSTRING) && (config.displayValue !== UNDEFINED) && conf.showValue) {
                    attr = {
                        text: config.displayValue,
                        'text-anchor': POSITION_MIDDLE,
                        x: canvasWidth/2 + canvasLeft,
                        y: yPos,
                        'vertical-align': POSITION_MIDDLE,
                        fill: style.color,
                        direction: config.textDirection,
                        'text-bound': [style.backgroundColor, style.borderColor,
                            style.borderThickness, style.borderPadding,
                            style.borderRadius, style.borderDash]
                    };

                    if (!graphic.label) {
                        graphic.label = paper.text(attr, dataLabelContainer);
                    }
                    else {

                        graphic.label.animateWith(dummyObj, animObj, {
                            x: canvasWidth/2 + canvasLeft,
                            y: yPos
                        }, animationDuration, animType);

                        graphic.label.attr({
                            text: config.displayValue,
                            'text-anchor': POSITION_MIDDLE,
                            'vertical-align': POSITION_MIDDLE,
                            fill: style.color,
                            direction: config.textDirection,
                            'text-bound': [style.backgroundColor, style.borderColor,
                                style.borderThickness, style.borderPadding,
                                style.borderRadius, style.borderDash]
                        });

                    }
                    // graphic.label
                    //     .attr(attr);
                    // Adjusting the chart label if goes out side the chart area
                    // we try to keep the label inside viewport
                    labelBBox = graphic.label.getBBox();
                    if (labelBBox.x + chartConfig.marginLeft < 0) {
                        labelWidth = labelBBox.width - chartConfig.marginLeft;
                        if(chartConfig.width < labelWidth) {
                            labelWidth = chartConfig.width - chartConfig.marginLeft;
                        }
                        attr = {
                            x : labelWidth/2
                        };

                        graphic.label.animateWith(dummyObj, animObj, attr, animationDuration, animType);
                    }
                }
                else {
                    graphic.label && (graphic.label = graphic.label.remove());
                }
            }

        },'bullet']);
    }
]);

FusionCharts.register('module', ['private', 'modules.renderer.js-dataset-thermometer',
    function () {
        var global = this,
            lib = global.hcLib,
            pluckNumber = lib.pluckNumber,
            pluck = lib.pluck,
            COMMASTRING = lib.COMMASTRING,
            BLANK = lib.BLANKSTRING,
            BLANKSTRING = BLANK,

            AXISPOSITION_TOP = 1,
            AXISPOSITION_BOTTOM = 3,

            getValidValue = lib.getValidValue,
            parseTooltext = lib.parseTooltext,
            convertColor = lib.graphics.convertColor,
            HUNDREDSTRING = lib.HUNDREDSTRING,

            getDarkColor = lib.graphics.getDarkColor,
            getLightColor = lib.graphics.getLightColor,

            preDefStr = lib.preDefStr,
            configStr = preDefStr.configStr,
            animationObjStr = preDefStr.animationObjStr,
            POSITION_TOP = preDefStr.POSITION_TOP,
            POSITION_MIDDLE = preDefStr.POSITION_MIDDLE,
            gaugeFillColorStr = preDefStr.gaugeFillColorStr,
            gaugeBorderColorStr = preDefStr.gaugeBorderColorStr,

            linkedItemsStr = 'linkedItems',
            smartLabelStr = 'smartLabel',
            dummyStr = 'dummy',

            plotEventHandler = lib.plotEventHandler,
            ROLLOVER = 'DataPlotRollOver',
            ROLLOUT = 'DataPlotRollOut',
            FILLMIXDARK10 = '{dark-10}',
            COMPONENT = 'component',
            DATASET = 'dataset',
            EVENTARGS = 'eventArgs',
            graphicsStr = 'graphics',
            trackerGroupStr = 'trackerGroup',
            componentsStr = 'components',
            scaleStr = 'scale',
            paperStr = 'paper',
            DATASET_GROUP = 'datasetGroup',
            ATTRFN = 'attr',
            ANIMATEFN = 'animate',

            toRaphaelColor = lib.toRaphaelColor,

            topLightGlowAlphaStr = '40,0',
            topLightGlowRatioStr = '0,80',
            topLightGlowRStr = '70%',
            bulbBorderLightRStr = '50%',
            bulbBorderLightAlphaStr = '0,50',
            bulbBorderLightRatioStr = '78,30',
            bulbTopLightAlphaStr = '60,0',
            bulbTopLightRatioStr = '0,30',
            bulbCenterLightAlphaStr = '80,0',
            bulbCenterLightRatioStr = '0,70',
            cylLeftLightAlphaStr = '50,0',
            cylLeftLightRatioStr = '0,80',
            cylRightLightAlphaStr = '50,0,0',
            cylRightLightRatioStr = '0,40,60',

            HUNDREDPERCENT = '100%',
            zeroCommaHundredStr = '0,100',

            M = 'M',
            A = 'A',
            L = 'L',
            Z = 'Z',

            cos50 = 0.643,
            sin50 = 0.766,

            win = global.window,
            userAgent = win.navigator.userAgent,
            isIE = /msie/i.test(userAgent) && !win.opera,
            TRACKER_FILL = 'rgba(192,192,192,'+ (isIE ? 0.002 : 0.000001) +')',

            getScaleFactor = function (origW, origH, canvasWidth, canvasHeight) {
                var scaleFactor;
                origH = pluckNumber(origH, canvasHeight);
                origW = pluckNumber(origW, canvasWidth);
                if (!origH || !origW) {
                    scaleFactor = 1;
                }
                // Now, if the ratio of original width,height & stage width,height are same
                else if ((origW / canvasWidth) == (origH / canvasHeight)) {
                    //In this case, the transformation value would be the same, as the ratio
                    //of transformation of width and height is same.
                    scaleFactor = canvasWidth / origW;
                } else {
                    //If the transformation factors are different, we do a constrained scaling
                    //We get the aspect whose delta is on the lower side.
                    scaleFactor = Math.min((canvasWidth / origW), (canvasHeight / origH));
                }


                return scaleFactor;
            };

        FusionCharts.register(COMPONENT, [DATASET, 'thermometer',{
            init : function (dataSetJson) {
                var dataSet = this;

                dataSet.configure();
                dataSet.setValue(dataSetJson && dataSetJson.data && dataSetJson.data[0]);
            },
            /**
             * Function to update the value
             * @param {number} value : value that will be added
             * @param {boolean} draw : whether to update the visuals also
             */
            setValue: function (setData, draw) {
                var dataSet = this,
                datasetConfig = dataSet.config,
                chart = dataSet.chart,
                jsonChartObj = chart.jsonData.chart,
                chartComponents = chart.components,
                numberFormatter = chartComponents.numberFormatter,
                value = setData.value,
                formattedValue;

                datasetConfig.value = value = numberFormatter.getCleanValue(value);
                if (value !== null) {
                    formattedValue = datasetConfig.formattedValue = numberFormatter.dataLabels(datasetConfig.value);

                    if (!datasetConfig.showValue) {
                        datasetConfig.displayValue = BLANKSTRING;
                    }
                    else {//determine the dispalay value then
                        datasetConfig.displayValue = setData.label || getValidValue(formattedValue, BLANK);
                    }

                    if (!datasetConfig.showTooltip) {
                        datasetConfig.toolText = BLANKSTRING;
                    }
                    else if (jsonChartObj.plottooltext !== undefined) {
                        datasetConfig.toolText = parseTooltext(pluck(setData.tooltext, jsonChartObj.plottooltext),
                         [1,2], { formattedValue: formattedValue
                        }, {}, jsonChartObj);
                    }
                    else {//determine the dispalay value then
                        datasetConfig.toolText = pluck(setData.tooltext,
                            formattedValue === null ? BLANKSTRING : formattedValue);
                    }
                }
                else {
                    datasetConfig.displayValue = BLANKSTRING;
                    datasetConfig.toolText = BLANKSTRING;
                    datasetConfig.formattedValue = null;
                }


                if (draw) {
                    dataSet.draw();
                }
            },

            configure : function () {
                var dataSet = this,
                    chart = dataSet.chart,
                    jsonData = chart.jsonData,
                    chartAttrs = jsonData.chart,
                    datasetConfig = dataSet.config || (dataSet.config = {}),
                    colorM = chart.components.colorManager,
                    chartConfig = chart.config,
                    gaugeBorderAlpha,
                    showHoverEffect = pluckNumber(chartAttrs.showhovereffect),
                    plotFillHoverColor,
                    gaugeFillAlpha,
                    gaugeFillColor;

                datasetConfig.showValue = pluckNumber(chartAttrs.showvalue, chartAttrs.showvalues, 1);
                datasetConfig.showTooltip = pluckNumber(chartAttrs.showtooltip, 1);
                datasetConfig.valuePadding = pluckNumber(chartAttrs.valuepadding, 2);
                datasetConfig.tooltipSepChar = pluck(chartAttrs.tooltipsepchar, COMMASTRING);
                datasetConfig.pointerOnOpp = pluckNumber(chartAttrs.pointerontop, 0);
                datasetConfig.axisPosition = pluckNumber(chartAttrs.ticksbelowgauge, chartAttrs.ticksbelowgraph,
                this.ticksbelowgauge, 1) ? AXISPOSITION_BOTTOM : AXISPOSITION_TOP;
                datasetConfig.valueAbovePointer = pluckNumber(chartAttrs.valueabovepointer, 1);


                datasetConfig.labelStyle = chartConfig.dataLabelStyle;

                gaugeFillColor = datasetConfig.gaugeFillColor = pluck(chartAttrs.gaugefillcolor,
                 chartAttrs.thmfillcolor, chartAttrs.cylfillcolor, colorM.getColor(gaugeFillColorStr));
                gaugeFillAlpha = datasetConfig.gaugeFillAlpha = pluckNumber(chartAttrs.gaugefillalpha,
                    chartAttrs.cylfillalpha, chartAttrs.thmfillalpha, HUNDREDSTRING);

                //Gauge Border properties
                datasetConfig.showGaugeBorder = pluckNumber(chartAttrs.showgaugeborder, 1);
                gaugeBorderAlpha = datasetConfig.showGaugeBorder ? pluckNumber(chartAttrs.gaugeborderalpha,40) : 0;
                // We are using 40 for default alpha of Thermometer Gauge Border
                datasetConfig.gaugeBorderColor = convertColor(pluck(chartAttrs.gaugebordercolor,
                    colorM.getColor(gaugeBorderColorStr)), gaugeBorderAlpha);
                datasetConfig.gaugeBorderThickness = pluckNumber(chartAttrs.gaugeborderthickness, 1);

                // Thermometer Glass color
                datasetConfig.gaugeContainerColor = pluck(chartAttrs.thmglasscolor, chartAttrs.cylglasscolor,
                    chart.glasscolor, getLightColor(gaugeFillColor, 30));

                if (showHoverEffect !== 0 && (showHoverEffect || chartAttrs.plotfillhovercolor ||
                        chartAttrs.plotfillhoveralpha || chartAttrs.plotfillhoveralpha === 0)) {
                    datasetConfig.showHoverEffect = true;

                    plotFillHoverColor = pluck(chartAttrs.plotfillhovercolor, chartAttrs.cylfillhovercolor,
                        chartAttrs.thmfillhovercolor, FILLMIXDARK10);
                    datasetConfig.plotFillHoverAlpha = pluckNumber(chartAttrs.plotfillhoveralpha,
                        chartAttrs.cylfillhoveralpha, chartAttrs.thmfillhoveralpha, gaugeFillAlpha);
                    datasetConfig.plotFillHoverColor = /\{/.test(plotFillHoverColor) ?
                        colorM.parseColorMix(gaugeFillColor, plotFillHoverColor)[0] : plotFillHoverColor;
                }
                dataSet.setValue(jsonData);
                chart._parseSpecialConfig && chart._parseSpecialConfig();
            },
            _getLabelSpace: function () {
                var dataSet = this,
                datasetConfig = dataSet.config,
                chart = dataSet.chart,
                smartLabel = chart.get(linkedItemsStr, smartLabelStr),
                labelObj;

                smartLabel.useEllipsesOnOverflow(chart.config.useEllipsesWhenOverflow);
                smartLabel.setStyle(datasetConfig.labelStyle); // @todo map datalabel style
                labelObj = smartLabel.getOriSize(datasetConfig.displayValue !== BLANK ?
                 datasetConfig.displayValue : dummyStr);

                return labelObj.height ? (labelObj.height + datasetConfig.valuePadding) : 0;
            },

            _manageSpace : function () {
                var ds = this,
                chart = this.chart,
                chartConfig = chart.config,
                chartWidth = chartConfig.width,
                chartHeight = chartConfig.height,
                canvasWidth = chartConfig.canvasWidth,
                canvasHeight = chartConfig.canvasHeight,
                canvasLeft = chartConfig.canvasLeft,
                canvasRight = chartConfig.canvasRight,
                canvasTop = chartConfig.canvasTop,
                // canvasRight = chartConfig.canvasRight,
                canvasBottom = chartConfig.canvasBottom,
                xDefined = chartConfig.xDefined,
                yDefined = chartConfig.yDefined,
                rDefined = chartConfig.rDefined,
                hDefined = chartConfig.hDefined,
                thmOriginX = chartConfig.thmOriginX,
                thmOriginY = chartConfig.thmOriginY,
                thmBulbRadius = chartConfig.thmBulbRadius,
                thmHeight = chartConfig.thmHeight,
                scaleFactor = getScaleFactor(chartConfig.origW, chartConfig.origH, chartWidth, chartHeight),
                top = 0,
                bottom = 0,
                left = 0,
                right = 0,
                thmCylenderRight,
                thmhalfWidth,
                bulbDiameter,
                centerPos,
                thmWidth,
                bulbHeight,
                measure,
                canvasLeftShift;


                // manage the space for the datalabels

                measure = ds._getLabelSpace();
                canvasBottom += measure;
                canvasHeight -= measure;
                bottom += measure;


                // manage the thermometer space

                /* First calculate the radius */

                //if Not defined the radius then calculate it.
                if (!rDefined) {
                    thmBulbRadius =  Math.min(canvasWidth / 2, pluckNumber(thmHeight, canvasHeight) * 0.13);
                    rDefined = true;
                }
                else {
                    thmBulbRadius = thmBulbRadius * scaleFactor;
                }

                // store the effective radius
                chartConfig.effectiveR = thmBulbRadius;

                bulbDiameter = thmBulbRadius*2;
                thmhalfWidth =  thmBulbRadius * cos50;
                thmWidth = 2 * thmhalfWidth;
                bulbHeight = thmBulbRadius * (1 + sin50);

                // add the space for the top glass effect
                top += thmhalfWidth;
                canvasTop += thmhalfWidth;
                canvasHeight -= thmhalfWidth;
                /* Calculate the x */

                // if x is user defined
                if (xDefined) {
                    thmOriginX = thmOriginX * scaleFactor;
                    canvasLeftShift = (thmOriginX - thmhalfWidth) - canvasLeft;
                }
                else { // else, place the gauge at the center
                    centerPos = (canvasRight - canvasLeft) / 2;
                    // now as per the center position calculate the extra left gap
                    canvasLeftShift = (centerPos - thmhalfWidth);
                    // check whether we have space to put the gauge at center
                    thmCylenderRight = canvasLeftShift + thmWidth;
                    if (thmCylenderRight > canvasWidth) {
                        canvasLeftShift = canvasWidth - thmWidth;
                    }

                }
                left += canvasLeftShift;
                canvasLeft += canvasLeftShift;
                canvasWidth -= canvasLeftShift;

                // to make the canvas width same as thermometer's cylinder width increase the right padding
                right += (canvasWidth - thmWidth);



                if (yDefined) {
                    thmOriginY = thmOriginY * scaleFactor;
                }


                if (!hDefined) { // if height is not defined
                    if (yDefined) { // if y is defined then adjust thermometer height is available space
                        thmHeight = thmOriginY - canvasTop;
                    }
                    else {
                        thmHeight =  Math.max(canvasHeight - bulbHeight, 3 * thmBulbRadius);
                        thmOriginY = canvasTop + thmHeight;
                    }
                }
                else { // height is defined
                    thmHeight = thmHeight * scaleFactor;
                    if (yDefined) {// if both are defined, adjust the top to accomodate this
                        top += thmOriginY - thmHeight - canvasTop;
                    }
                    else {
                        thmOriginY = canvasTop + thmHeight;
                    }
                }
                // finally adjust the bottom to accomodate y and height
                bottom += (canvasTop + canvasHeight) - thmOriginY;

                return {
                    top : top,
                    bottom : bottom,
                    left: left,
                    right: right
                };
            },

            draw : function () {
                var dataSet = this,
                    dsConfig = dataSet.config,
                    iapi = dataSet.chart,
                    dataLabelsLayer = iapi.graphics.datalabelsGroup,
                    trackerLayer = iapi.get(graphicsStr, trackerGroupStr),
                    graphics = dataSet.graphics || (dataSet.graphics = {}),
                    scale = iapi.get(componentsStr, scaleStr),
                    parentContainer = iapi.get(graphicsStr, DATASET_GROUP),
                    chartConfig = iapi.get(configStr),
                    paper = iapi.get(componentsStr, paperStr),
                    canvasLeft = chartConfig.canvasLeft,
                    canvasTop = chartConfig.canvasTop,
                    canvasHeight = chartConfig.canvasHeight,
                    r = chartConfig.effectiveR || 10,
                    cylinderWidthHalf = r * cos50,
                    use3DLighting = chartConfig.use3DLighting,
                    x = canvasLeft + cylinderWidthHalf,
                    y = canvasTop - cylinderWidthHalf,
                    h = canvasHeight,
                    scaleTop = cylinderWidthHalf,
                    bulbCenterDistance = r * sin50,
                    scaleY = y + scaleTop,
                    y1 = scaleY + h,
                    y2 = y1 + bulbCenterDistance,
                    value = pluckNumber(dsConfig.value, scale.getLimit().min),
                    thmPos = scale.getPixel(value),
                    topRoundR = cylinderWidthHalf * 0.33,
                    y4 = y + topRoundR,
                    y6 = thmPos,
                    lCylWidthHalf = cylinderWidthHalf * 0.9,
                    topRoundRDistance = cylinderWidthHalf - topRoundR,
                    lR = r + lCylWidthHalf - cylinderWidthHalf,
                    x1 = x - cylinderWidthHalf,
                    x2 = x + cylinderWidthHalf,
                    x3 = x - topRoundRDistance,
                    x4 = x + topRoundRDistance,
                    lx1 = x - lCylWidthHalf,
                    lx2 = x + lCylWidthHalf,
                    l1Distance = cylinderWidthHalf * 0.6,
                    l1x = parseInt(x - l1Distance, 10),
                    l2x = x + (cylinderWidthHalf / 2),
                    ly = y2 - Math.abs(Math.sqrt((lR * lR) - (lCylWidthHalf * lCylWidthHalf))),
                    container = graphics.container,
                    fluid = graphics.fluid,
                    topLightGlow = graphics.topLightGlow,
                    topLight = graphics.topLight,
                    label = graphics.label,
                    dataLabelContainer = graphics.dataLabelContainer,
                    canvasBorderElement = graphics.canvasBorderElement,
                    bulbBorderLight = graphics.bulbBorderLight,
                    bulbTopLight = graphics.bulbTopLight,
                    bulbCenterLight = graphics.bulbCenterLight,
                    trackerContainer = graphics.trackerContainer,
                    cylLeftLight = graphics.cylLeftLight,
                    cylRightLight = graphics.cylRightLight,
                    cylLeftLight1 = graphics.cylLeftLight1,
                    cylRightLight1 = graphics.cylRightLight1,
                    hotElement = graphics.hotElement,
                    gaugeFillColor = getDarkColor(dsConfig.gaugeFillColor, use3DLighting ? 70 : 80),
                    gaugeFillAlpha = dsConfig.gaugeFillAlpha,
                    conColor = dsConfig.gaugeContainerColor,
                    darkConColor = getDarkColor(conColor, 80),
                    lightConColor = getLightColor(conColor, 80),
                    gaugeBorderThickness = dsConfig.gaugeBorderThickness,
                    gaugeBorderColor  = dsConfig.gaugeBorderColor,
                    thPath,
                    bulbPathType1,
                    showHoverEffect = dsConfig.showHoverEffect,
                    plotFillHoverAlpha = dsConfig.plotFillHoverAlpha,
                    plotFillHoverColor = dsConfig.plotFillHoverColor,

                    animationObj = iapi.get(configStr, animationObjStr),
                    animType = animationObj.animType,
                    animObj = animationObj.animObj,
                    dummyObj = animationObj.dummyObj,
                    animationDuration = animationObj.duration,
                    animation = animationObj && animationObj.duration,
                    eventArgs,

                    fluidAttrFn,
                    thermometerAttrFn,
                    fluidAnimDuration,
                    thmAnimDuration,
                    canvasRight = chartConfig.canvasRight,
                    canvasBottom = chartConfig.canvasBottom,
                    canvasWidth = chartConfig.canvasWidth,
                    style = iapi.config.dataLabelStyle,
                    // css = {
                    //     fontFamily: style.fontFamily,
                    //     fontSize: style.fontSize,
                    //     lineHeight: style.lineHeight,
                    //     fontWeight: style.fontWeight,
                    //     fontStyle: style.fontStyle
                    // },
                    animCallbackFn = function(){
                        iapi._animCallBack && iapi._animCallBack();
                    },
                    applyAttr = function (element, attrString, attrObj, callback) {

                        if (attrString === ATTRFN) {
                            element.attr(attrObj);
                        }
                        else {
                            element.animateWith(dummyObj, animObj, attrObj, animationDuration, animType, callback);
                        }
                        return element;
                    },
                    fluidAnimCallback,
                    fluidAttr = dsConfig.fluidAttr;

                if (!fluidAttr) {
                    fluidAttr = dsConfig.fluidAttr = {};
                }

                if (showHoverEffect) {
                    fluidAttr.hover = {
                        fill : convertColor(getDarkColor(plotFillHoverColor, use3DLighting ? 70 : 80),
                            plotFillHoverAlpha)
                    };
                }
                fluidAttr.out = {
                    fill : convertColor(gaugeFillColor, gaugeFillAlpha)
                };

                thPath = [M, x3, y, A, topRoundR, topRoundR, 0, 0, 0, x1, y4,
                    L, x1, y1, A, r, r, 0, 1, 0, x2, y1, L, x2, y4,
                    A, topRoundR, topRoundR, 0, 0, 0, x4, y, Z];

                //Setting macros for annotation
                chartConfig.gaugeStartX = canvasLeft;
                chartConfig.gaugeEndX = canvasRight;
                chartConfig.gaugeStartY = canvasTop;
                chartConfig.gaugeEndY = canvasBottom;
                chartConfig.gaugeCenterX = canvasLeft + (canvasWidth * 0.5);
                chartConfig.gaugeCenterY = canvasTop + (canvasHeight * 0.5);
                chartConfig.gaugeRadius = canvasWidth * 0.5;

                eventArgs = {
                    value: dsConfig.value,
                    displayValue: dsConfig.displayValue,
                    toolText: dsConfig.toolText
                };

                /*
                 * Creating a container group for the graphic element of column plots if
                 * not present and attaching it to its parent group.
                 */
                if (!container) {
                    container = graphics.container = paper.group('thermometer', parentContainer);
                    canvasBorderElement = graphics.canvasBorderElement = paper.path(container);
                    fluid = graphics.fluid = paper.path(container).attr({
                        'stroke-width' : 0
                    });
                    topLight = graphics.topLight = paper.path(container).attr({
                        'stroke-width' : 1
                    });
                    topLightGlow = graphics.topLightGlow = paper.path(container).attr({
                        'stroke-width' : 0
                    });
                    bulbBorderLight = graphics.bulbBorderLight = paper.path(container).attr({
                        'stroke-width' : 0,
                        stroke : '#00FF00'
                    });
                    bulbTopLight = graphics.bulbTopLight = paper.path(container).attr({
                        'stroke-width' : 0
                    });
                    bulbCenterLight = graphics.bulbCenterLight = paper.path(container).attr({
                        'stroke-width' : 0
                    });
                    cylLeftLight = graphics.cylLeftLight = paper.path(container).attr({
                        'stroke-width' : 0
                    });
                    cylRightLight = graphics.cylRightLight = paper.path(container).attr({
                        'stroke-width' : 0
                    });
                    cylLeftLight1 = graphics.cylLeftLight1 = paper.path(container).attr({
                        'stroke-width' : 0
                    });
                    cylRightLight1 = graphics.cylRightLight1 = paper.path(container).attr({
                        'stroke-width' : 0
                    });
                    trackerContainer = graphics.trackerContainer = paper.group('col-hot', trackerLayer);
                    hotElement = graphics.hotElement = paper.path({
                        stroke: TRACKER_FILL,
                        fill: TRACKER_FILL,
                        ishot: true
                    }, trackerContainer)
                    .click(function (setDataArr) {
                        var ele = this;
                        plotEventHandler.call(ele, iapi, setDataArr);
                    })
                    .hover(
                        function (data) {
                            var ele = this;
                            if (dsConfig.showHoverEffect){
                                graphics.fluid && graphics.fluid.attr(fluidAttr.hover);
                            }
                            plotEventHandler.call(ele, iapi, data, ROLLOVER);
                        },
                        function (data) {
                            var ele = this;
                            if (dsConfig.showHoverEffect){
                                graphics.fluid && graphics.fluid.attr(fluidAttr.out);
                            }
                            plotEventHandler.call(ele, iapi, data, ROLLOUT);
                        }
                    );
                    dataLabelContainer = graphics.dataLabelContainer = paper.group('datalabel', dataLabelsLayer);
                    // label = graphics.label = paper.text({
                    //     text: BLANK,
                    //     'text-anchor': POSITION_MIDDLE,
                    //     'vertical-align': POSITION_TOP
                    // }, dataLabelContainer);

                    if (animation) {
                        fluidAttrFn = ANIMATEFN;
                        fluidAnimDuration = animation;
                        fluidAnimCallback = animCallbackFn;
                        // set the initial view for animation
                        fluid.attr({
                            path: [M, lx1, ly, A, lR, lR, 0, 1, 0, lx2, ly, L, lx2, ly, lx1, ly, Z]
                        });
                    }
                    else {
                        fluidAttrFn = ATTRFN;
                    }
                    thermometerAttrFn = ATTRFN;
                }
                else { // redraw
                    if(animation) {
                        thermometerAttrFn = fluidAttrFn = ANIMATEFN;
                        thmAnimDuration = fluidAnimDuration = animation;
                        fluidAnimCallback = animCallbackFn;
                    }
                    else {
                        thermometerAttrFn = fluidAttrFn = ATTRFN;
                    }
                }


                // apply fluid attributes
                // animate to the final view
                applyAttr(fluid, fluidAttrFn, {
                    path: [M, lx1, ly, A, lR, lR, 0, 1, 0, lx2, ly, L, lx2, y6, lx1, y6, Z]
                }, fluidAnimCallback)
                .attr(fluidAttr.out);

                // fluid[fluidAttrFn]({
                //     path: [M, lx1, ly, A, lR, lR, 0, 1, 0, lx2, ly, L, lx2, y6, lx1, y6, Z]
                // }, fluidAnimDuration, fluidAnimCallback).attr(fluidAttr.out);


                // thermometer attributes
                applyAttr(canvasBorderElement, thermometerAttrFn, {
                    path: thPath
                })
                .attr({
                    'stroke-width': gaugeBorderThickness,
                    stroke: gaugeBorderColor
                });

                // canvasBorderElement[thermometerAttrFn]({
                //     path: thPath
                // }, thmAnimDuration).attr({
                //     'stroke-width': gaugeBorderThickness,
                //     stroke: gaugeBorderColor
                // });

                applyAttr(topLight, thermometerAttrFn, {
                    path: [M, lx1, scaleY, L, lx2, scaleY]
                })
                .attr({
                    stroke : convertColor(gaugeFillColor, 40)
                });

                // topLight[thermometerAttrFn]({
                //     path: [M, lx1, scaleY, L, lx2, scaleY]
                // }, thmAnimDuration).attr({
                //     stroke : convertColor(gaugeFillColor, 40)
                // });

                applyAttr(hotElement, thermometerAttrFn, {
                    path: thPath
                })
                .tooltip(dsConfig.toolText);

                hotElement.data(EVENTARGS, eventArgs);

                // hotElement[thermometerAttrFn]({
                //     path: thPath
                // }, thmAnimDuration)
                // .tooltip(dsConfig.toolText);

                if(dsConfig.showValue){

                    label = graphics.label;

                    if (!label) {
                        label = graphics.label = paper.text({
                            text: dsConfig.displayValue,
                            x: x,
                            y: y2 + r + (dsConfig.valuePadding || 0),
                            'text-anchor': POSITION_MIDDLE,
                            'vertical-align': POSITION_TOP,
                            fill: style.color,
                            'text-bound': [style.backgroundColor, style.borderColor,
                                        style.borderThickness, style.borderPadding,
                                        style.borderRadius, style.borderDash]
                        }, dataLabelContainer);

                        label.show();
                    }
                    else {
                        applyAttr(label.show(), thermometerAttrFn, {
                            x: x,
                            y: y2 + r + (dsConfig.valuePadding || 0),
                            fill: style.color,
                            'text-bound': [style.backgroundColor, style.borderColor,
                                        style.borderThickness, style.borderPadding,
                                        style.borderRadius, style.borderDash]
                        })
                        .attr({
                            text: dsConfig.displayValue
                        });
                    }

                    // label.show()[thermometerAttrFn]({
                    //     x: x,
                    //     y: y2 + r + (dsConfig.valuePadding || 0),
                    //     fill: style.color,
                    //     'text-bound': [style.backgroundColor, style.borderColor,
                    //                 style.borderThickness, style.borderPadding,
                    //                 style.borderRadius, style.borderDash]
                    // }, thmAnimDuration).attr({
                    //     text: dsConfig.displayValue
                    // }).css(css);
                }
                else {
                    label = graphics.label;
                    label && label.hide();
                }
                // Set elements to show the 3d effects
                if (use3DLighting) {

                    applyAttr(topLightGlow.show(), thermometerAttrFn, {
                        path: [M, lx1, scaleY, L, lx2, scaleY, lx2, y4, lx1, y4, Z]
                    })
                    .attr({
                        fill : toRaphaelColor({
                            FCcolor : {
                                color: gaugeFillColor + COMMASTRING + gaugeFillColor,
                                alpha: topLightGlowAlphaStr,
                                ratio: topLightGlowRatioStr,
                                radialGradient: true,
                                cx : 0.5,
                                cy : 1,
                                r : topLightGlowRStr
                            }
                        })
                    });

                    // topLightGlow.show()[thermometerAttrFn]({
                    //     path: [M, lx1, scaleY, L, lx2, scaleY, lx2, y4, lx1, y4, Z]
                    // }, thmAnimDuration).attr({
                    //     fill : toRaphaelColor({
                    //         FCcolor : {
                    //             color: gaugeFillColor + COMMASTRING + gaugeFillColor,
                    //             alpha: '40,0',
                    //             ratio: '0,80',
                    //             radialGradient: true,
                    //             cx : 0.5,
                    //             cy : 1,
                    //             r : '70%'
                    //         }
                    //     })
                    // });

                    // draw the light effect for the bulb
                    bulbPathType1 = [M, x1, y1, A, r, r, 0, 0, 1, x2, y1,
                    A, r, r, 0, 0, 0, x1, y1,
                    A, r, r, 0, 1, 0, x2, y1, Z];

                    applyAttr(bulbBorderLight.show(), thermometerAttrFn, {
                        path: bulbPathType1
                    })
                    .attr({
                        fill : toRaphaelColor({
                            FCcolor : {
                                cx: 0.5,
                                cy: 0.5,
                                r: bulbBorderLightRStr,
                                color :  darkConColor + COMMASTRING + lightConColor,
                                alpha : bulbBorderLightAlphaStr,
                                ratio : bulbBorderLightRatioStr,
                                radialGradient : true
                            }
                        })
                    });

                    // bulbBorderLight.show()[thermometerAttrFn]({
                    //     path: bulbPathType1
                    // }, thmAnimDuration).attr({
                    //     fill : toRaphaelColor({
                    //         FCcolor : {
                    //             cx: 0.5,
                    //             cy: 0.5,
                    //             r: '50%',
                    //             color :  darkConColor + COMMASTRING + lightConColor,
                    //             alpha : '0,50',
                    //             ratio : '78,30',
                    //             radialGradient : true
                    //         }
                    //     })
                    // });

                    applyAttr(bulbTopLight.show(), thermometerAttrFn, {
                        path: bulbPathType1
                    })
                    .attr({
                        fill : toRaphaelColor({
                            FCcolor : {
                                cx: 0.3,
                                cy: 0.1,
                                r: HUNDREDPERCENT,
                                color :  lightConColor + COMMASTRING + darkConColor,
                                alpha : bulbTopLightAlphaStr,
                                ratio : bulbTopLightRatioStr,
                                radialGradient : true
                            }
                        })
                    });

                    // bulbTopLight.show()[thermometerAttrFn]({
                    //     path: bulbPathType1
                    // }, thmAnimDuration).attr({
                    //     fill : toRaphaelColor({
                    //         FCcolor : {
                    //             cx: 0.3,
                    //             cy: 0.1,
                    //             r: HUNDREDPERCENT,
                    //             color :  lightConColor + COMMASTRING + darkConColor,
                    //             alpha : '60,0',
                    //             ratio : '0,30',
                    //             radialGradient : true
                    //         }
                    //     })
                    // });

                    applyAttr(bulbCenterLight.show(), thermometerAttrFn, {
                        path: bulbPathType1
                    })
                    .attr({
                        fill : toRaphaelColor({
                            FCcolor : {
                                cx: 0.25,
                                cy: 0.7,
                                r: HUNDREDPERCENT,
                                color :  lightConColor + COMMASTRING + darkConColor,
                                alpha : bulbCenterLightAlphaStr,
                                ratio : bulbCenterLightRatioStr,
                                radialGradient : true
                            }
                        })
                    });

                    // bulbCenterLight.show()[thermometerAttrFn]({
                    //     path: bulbPathType1
                    // }, thmAnimDuration).attr({
                    //     fill : toRaphaelColor({
                    //         FCcolor : {
                    //             cx: 0.25,
                    //             cy: 0.7,
                    //             r: HUNDREDPERCENT,
                    //             color :  lightConColor + COMMASTRING + darkConColor,
                    //             alpha : '80,0',
                    //             ratio : '0,70',
                    //             radialGradient : true
                    //         }
                    //     })
                    // });

                    applyAttr(cylLeftLight.show(), thermometerAttrFn, {
                        path: [M, x, y, L, x3, y,
                            A, topRoundR, topRoundR, 0, 0, 0, x1, y4,
                            L, x1, y1, x, y1, Z]
                    })
                    .attr({
                        fill : toRaphaelColor({
                            FCcolor : {
                                color : lightConColor + COMMASTRING + darkConColor,
                                alpha : cylLeftLightAlphaStr,
                                ratio : cylLeftLightRatioStr,
                                angle : 0
                            }
                        })
                    });

                    // cylLeftLight.show()[thermometerAttrFn]({
                    //     path: [M, x, y, L, x3, y,
                    //         A, topRoundR, topRoundR, 0, 0, 0, x1, y4,
                    //         L, x1, y1, x, y1, Z]
                    // }, thmAnimDuration).attr({
                    //     fill : toRaphaelColor({
                    //         FCcolor : {
                    //             color : lightConColor + COMMASTRING + darkConColor,
                    //             alpha : '50,0',
                    //             ratio : '0,80',
                    //             angle : 0
                    //         }
                    //     })
                    // });

                    applyAttr(cylRightLight.show(), thermometerAttrFn, {
                        path: [M, x1, y, L, x4, y,
                            A, topRoundR, topRoundR, 0, 0, 1, x2, y4,
                            L, x2, y1, x1, y1, Z]
                    })
                    .attr({
                        fill : toRaphaelColor({
                            FCcolor : {
                                color : lightConColor + COMMASTRING + darkConColor + COMMASTRING + darkConColor,
                                alpha : cylRightLightAlphaStr,
                                ratio : cylRightLightRatioStr,
                                angle : 180
                            }
                        })
                    });

                    // cylRightLight.show()[thermometerAttrFn]({
                    //     path: [M, x1, y, L, x4, y,
                    //         A, topRoundR, topRoundR, 0, 0, 1, x2, y4,
                    //         L, x2, y1, x1, y1, Z]
                    // }, thmAnimDuration).attr({
                    //     fill : toRaphaelColor({
                    //         FCcolor : {
                    //             color : lightConColor + COMMASTRING + darkConColor + COMMASTRING + darkConColor,
                    //             alpha : '50,0,0',
                    //             ratio : '0,40,60',
                    //             angle : 180
                    //         }
                    //     })
                    // });

                    applyAttr(cylLeftLight1.show(), thermometerAttrFn, {
                        path: [M, l1x, y4, L, x1, y4, x1, y1, l1x, y1, Z]
                    })
                    .attr({
                        fill : toRaphaelColor({
                            FCcolor : {
                                color : lightConColor + COMMASTRING + darkConColor,
                                alpha : bulbTopLightAlphaStr,
                                ratio : zeroCommaHundredStr,
                                angle : 180
                            }
                        })
                    });

                    // cylLeftLight1.show()[thermometerAttrFn]({
                    //     path: [M, l1x, y4, L, x1, y4, x1, y1, l1x, y1, Z]
                    // }, thmAnimDuration).attr({
                    //     fill : toRaphaelColor({
                    //         FCcolor : {
                    //             color : lightConColor + COMMASTRING + darkConColor,
                    //             alpha : '60,0',
                    //             ratio : zeroCommaHundredStr,
                    //             angle : 180
                    //         }
                    //     })
                    // });

                    applyAttr(cylRightLight1.show(), thermometerAttrFn, {
                        path: [M, l1x - 0.01, y4, L, l2x, y4, l2x, y1, l1x - 0.01, y1, Z]
                    })
                    .attr({
                        fill : toRaphaelColor({
                            FCcolor : {
                                color : lightConColor + COMMASTRING + darkConColor,
                                alpha : bulbTopLightAlphaStr,
                                ratio : zeroCommaHundredStr,
                                angle : 0
                            }
                        })
                    });

                    // cylRightLight1.show()[thermometerAttrFn]({
                    //     path: [M, l1x - 0.01, y4, L, l2x, y4, l2x, y1, l1x - 0.01, y1, Z]
                    // }, thmAnimDuration).attr({
                    //     fill : toRaphaelColor({
                    //         FCcolor : {
                    //             color : lightConColor + COMMASTRING + darkConColor,
                    //             alpha : '60,0',
                    //             ratio : zeroCommaHundredStr,
                    //             angle : 0
                    //         }
                    //     })
                    // });

                }
                else { // hide all 3d effect elements
                    topLightGlow.hide();
                    bulbBorderLight.hide();
                    bulbTopLight.hide();
                    bulbCenterLight.hide();
                    cylLeftLight.hide();
                    cylRightLight.hide();
                    cylLeftLight1.hide();
                    cylRightLight1.hide();
                }


                // call the call back if there is no animation
                if (!fluidAnimCallback) {
                    animCallbackFn();
                }
            },

            getDataLimits : function () {
                var dataSet = this,
                    datasetConfig = dataSet.config,
                    min,
                    max;
                max = min = datasetConfig.value;

                datasetConfig.maxValue = max;
                datasetConfig.minValue = min;

                return {
                    forceMin : true,
                    forceMax : true,
                    max : max,
                    min : min
                };
            },

            updateData : function (dataObj, index, draw) {
                var dataSet = this,
                    conf = dataSet.config,
                    prevMax = conf.maxValue,
                    prevMin = conf.prevMin,
                    value = conf.value,
                    chart = dataSet.chart,
                    drawManager = dataSet.groupManager || dataSet,
                    chartComponents = chart.components,
                    scale = chartComponents.scale;

                dataSet.setValue(dataObj.data[0]);
                conf.maxValue = value;
                conf.minValue = value;

                if (conf.maxValue !== prevMax || conf.minValue !== prevMin) {
                    dataSet.maxminFlag = true;
                }

                if (draw) {
                    chart._setAxisLimits();
                    scale.draw();
                    drawManager.draw();
                }
            },

            addData : function() {
            },

            removeData : function() {
            }

        }]);
    }]);

FusionCharts.register('module', ['private', 'modules.renderer.js-dataset-cylinder',
    function () {

        var global = this,
            lib = global.hcLib,
            preDefStr = lib.preDefStr,
            ATTRFN = 'attr',
            COMPONENT = 'component',
            COMMASTRING = lib.COMMASTRING,
            plotEventHandler = lib.plotEventHandler,
            DATASET = 'dataset',
            configStr = preDefStr.configStr,
            animationObjStr = preDefStr.animationObjStr,
            ANIMATEFN = 'animate',
            A = 'A',
            math = Math,
            mathMax = math.max,
            mathMin = math.min,
            convertColor = lib.graphics.convertColor,
            toRaphaelColor = lib.toRaphaelColor,
            ROLLOVER = 'DataPlotRollOver',
            ROLLOUT = 'DataPlotRollOut',
            getDarkColor = lib.graphics.getDarkColor,
            win = global.window,
            userAgent = win.navigator.userAgent,
            isIE = /msie/i.test(userAgent) && !win.opera,
            Z = 'Z',
            HUNDREDPERCENT = '100%',
            zeroCommaHundredStr = '0,100',
            topLightGlowAlphaStr = '40,0',
            btnBorderLightAlphaStr = '50,50,50,50,50,70,50,50',
            btnBorderLightRatioStr = '0,15,0,12,0,15,43,15',
            backAlphaStr = '30,30,30,30,30,30,30,30',
            backRatioStr = '0,15,43,15,0,12,0,15',
            frontRatioStr = '0,15,0,12,0,15,43,15',
            TRACKER_FILL = 'rgba(192,192,192,'+ (isIE ? 0.002 : 0.000001) +')',
            M = 'M',
            L = 'L',
            EVENTARGS = 'eventArgs',
            POSITION_TOP = preDefStr.POSITION_TOP,
            POSITION_MIDDLE = preDefStr.POSITION_MIDDLE,
            pluckNumber = lib.pluckNumber,
            getLightColor = lib.graphics.getLightColor,
            getScaleFactor = function (origW, origH, canvasWidth, canvasHeight) {
                var scaleFactor;
                origH = pluckNumber(origH, canvasHeight);
                origW = pluckNumber(origW, canvasWidth);
                if (!origH || !origW) {
                    scaleFactor = 1;
                }
                // Now, if the ratio of original width,height & stage width,height are same
                else if ((origW / canvasWidth) == (origH / canvasHeight)) {
                    //In this case, the transformation value would be the same, as the ratio
                    //of transformation of width and height is same.
                    scaleFactor = canvasWidth / origW;
                } else {
                    //If the transformation factors are different, we do a constrained scaling
                    //We get the aspect whose delta is on the lower side.
                    scaleFactor = Math.min((canvasWidth / origW), (canvasHeight / origH));
                }


                return scaleFactor;
            };


        FusionCharts.register(COMPONENT,[DATASET, 'cylinder',{
            _manageSpace : function () {
                var ds = this,
                chart = this.chart,
                chartConfig = chart.config,
                chartWidth = chartConfig.width,
                chartHwight = chartConfig.height,
                canvasWidth = chartConfig.canvasWidth,
                canvasHeight = chartConfig.canvasHeight,
                canvasLeft = chartConfig.canvasLeft,
                canvasTop = chartConfig.canvasTop,
                canvasRight = chartConfig.canvasRight,
                canvasBottom = chartConfig.canvasBottom,
                xDefined = chartConfig.xDefined,
                yDefined = chartConfig.yDefined,
                rDefined = chartConfig.rDefined,
                hDefined = chartConfig.hDefined,
                gaugeOriginX = chartConfig.gaugeOriginX,
                gaugeOriginY = chartConfig.gaugeOriginY,
                gaugeRadius = chartConfig.gaugeRadius,
                gaugeHeight = chartConfig.gaugeHeight,
                gaugeYScale = chartConfig.gaugeYScale,
                scaleFactor = getScaleFactor(chartConfig.origW, chartConfig.origH, chartWidth, chartHwight),
                top = 0,
                bottom = 0,
                left = 0,
                right = 0,
                gaugeRight,
                centerPos,
                gaugeDiameter,
                gaugeYfactor,
                measure,
                canvasLeftShift;

                // manage the space for the datalabels

                measure = ds._getLabelSpace();
                canvasBottom += measure;
                canvasHeight -= measure;
                bottom += measure;

                // lightX = r * 0.85,
                //  x5 = x - lightX,
                //  x6 = x + lightX,
                //  lightY = Math.sqrt((1 - ((lightX * lightX) / (r * r))) * r2 * r2),


                // manage the thermometer space

                /* First calculate the radius */

                //if Not defined the radius then calculate it.
                if (!rDefined) {
                    gaugeRadius =  mathMax(mathMin(canvasWidth, canvasHeight * 1.2) / 2, 5);
                }
                else {
                    gaugeRadius = gaugeRadius * scaleFactor;
                }


                // store the effective radius
                chartConfig.effectiveR = gaugeRadius;
                gaugeDiameter = gaugeRadius * 2;
                gaugeYfactor = gaugeRadius * gaugeYScale;

                top += gaugeYfactor;
                canvasTop += gaugeYfactor;
                bottom += gaugeYfactor;
                canvasBottom += gaugeYfactor;
                canvasHeight -= (2 * gaugeYfactor);

                /* Calculate the x */

                // if x is user defined
                if (xDefined) {
                    gaugeOriginX = gaugeOriginX * scaleFactor;
                    canvasLeftShift = (gaugeOriginX - gaugeRadius) - canvasLeft;
                }
                else { // else, place the gauge at the center
                    centerPos = (canvasRight - canvasLeft) / 2;
                    // now as per the center position calculate the extra left gap
                    canvasLeftShift = (centerPos - gaugeRadius);
                    // check whether we have space to put the gauge at center
                    gaugeRight = canvasLeftShift + gaugeDiameter;
                    if (gaugeRight > canvasWidth) {
                        canvasLeftShift = canvasWidth - gaugeDiameter;
                    }

                }
                left += canvasLeftShift;
                canvasLeft += canvasLeftShift;
                canvasWidth -= canvasLeftShift;

                // to make the canvas width same as gauge's cylinder width increase the right padding
                right += (canvasWidth - gaugeDiameter);


                if (yDefined) {
                    gaugeOriginY = gaugeOriginY * scaleFactor;
                }


                if (!hDefined) { // if height is not defined
                    if (yDefined) { // if y is defined then adjust thermometer height is available space
                        gaugeHeight = gaugeOriginY - canvasTop;
                    }
                    else {
                        gaugeHeight =  canvasHeight;
                        gaugeOriginY = canvasTop + gaugeHeight;
                    }
                }
                else { // height is defined
                    gaugeHeight = gaugeHeight * scaleFactor;
                    if (yDefined) {// if both are defined, adjust the top to accomodate this
                        top += gaugeOriginY - gaugeHeight - canvasTop;
                    }
                    else {
                        gaugeOriginY = canvasTop + gaugeHeight;
                    }
                }
                // finally adjust the bottom to accomodate y and height
                bottom += (canvasTop + canvasHeight) - gaugeOriginY;

                return {
                    top : top,
                    bottom : bottom + 8, // space for thick border at the glass bottom
                    left: left,
                    right: right
                };
            },

            draw : function () {
                var dataSet = this,
                    dsConfig = dataSet.config,
                    iapi = dataSet.chart,
                    graphics = dataSet.graphics || (dataSet.graphics = {}),
                    layers = iapi.graphics,
                    dataLabelsLayer =  layers.datalabelsGroup,
                    trackerLayer = layers.trackerGroup,
                    parentContainer = layers.datasetGroup,
                    fluidTop = graphics.fluidTop,
                    fluid = graphics.fluid,
                    cylinterTop = graphics.cylinterTop,
                    frontLight1 = graphics.frontLight1,
                    frontLight = graphics.frontLight,
                    front = graphics.front,
                    back = graphics.back,
                    btnBorderLight = graphics.btnBorderLight,
                    btnBorder1 = graphics.btnBorder1,
                    btnBorder = graphics.btnBorder,
                    label = graphics.label,
                    dataLabelContainer = graphics.dataLabelContainer,
                    trackerContainer = graphics.trackerContainer,
                    hotElement = graphics.hotElement,
                    chartComponents = iapi.components,
                    scale = chartComponents.scale,
                    chartConfig = iapi.config,
                    paper = chartComponents.paper,
                    canvasLeft = chartConfig.canvasLeft,
                    canvasTop = chartConfig.canvasTop,
                    canvasHeight = chartConfig.canvasHeight,
                    r = chartConfig.effectiveR || 40,
                    value = pluckNumber(dsConfig.value, scale.getLimit().min),
                    gaugePos = scale.getPixel(value),
                    x = canvasLeft + r,
                    y = canvasTop,
                    h = canvasHeight,
                    style = iapi.config.dataLabelStyle,
                    // css = {
                    //     fontFamily: style.fontFamily,
                    //     fontSize: style.fontSize,
                    //     lineHeight: style.lineHeight,
                    //     fontWeight: style.fontWeight,
                    //     fontStyle: style.fontStyle
                    // },

                    fluidColor = dsConfig.gaugeFillColor,
                    fluidDarkColor = getDarkColor(fluidColor, 70),
                    fluidLightColor = getLightColor(fluidColor, 70),
                    fluidEdgeColor = getDarkColor(fluidDarkColor, 90),
                    fluidAlpha = chartConfig.gaugeFillAlpha,
                    fluidStroke = 3,

                    // Thermometer Glass color
                    gaugeContainerColor = dsConfig.gaugeContainerColor,
                    darkConColor = getDarkColor(gaugeContainerColor, 80),
                    darkConColor1 = getDarkColor(gaugeContainerColor, 90),
                    lightConColor = getLightColor(gaugeContainerColor, 80),
                    r3dFactor = chartConfig.gaugeYScale,
                    container = graphics.container,
                    r2 = r * r3dFactor,
                    fluidStrHF = fluidStroke / 2,
                    r3 = r - fluidStrHF,
                    y2 = y + h,
                    y3 = gaugePos,
                    x1 = x - r,
                    x2 = x + r,
                    x3 = x1 + fluidStrHF,
                    x4 = x2 - fluidStrHF,
                    xBt1 = x1 - 2,
                    xBt2 = x2 + 2,
                    rBt1 = r + 2,
                    rBt2 = r2 + 2,
                    yBt1 = y2 + 4,
                    yBt2 = yBt1 + 0.001,
                    lightX = r * 0.85,
                    x5 = x - lightX,
                    x6 = x + lightX,
                    lightY = Math.sqrt((1 - ((lightX * lightX) / (r * r))) * r2 * r2),
                    y4 = y + lightY,
                    y5 = y2 + lightY,
                    y6 = y - 1,
                    use3DLighting = chartConfig.use3DLighting,
                    topColorStr,
                    topStrokeStr,
                    showHoverEffect = dsConfig.showHoverEffect,
                    plotFillHoverAlpha = dsConfig.plotFillHoverAlpha,
                    plotFillHoverColor = dsConfig.plotFillHoverColor,
                    fluidHoverDarkColor,
                    fluidHoverLightColor,
                    fluidHoverEdgeColor,
                    // todo: all attributes need to be parsed and ready during configuration

                    animationObj = iapi.get(configStr, animationObjStr),
                    animType = animationObj.animType,
                    animObj = animationObj.animObj,
                    dummyObj = animationObj.dummyObj,
                    animationDuration = animationObj.duration,
                    animation = animationObj && animationObj.duration,
                    eventArgs,

                    fluidAttrFn,
                    gaugeAttrFn,
                    fluidAnimDuration,
                    gaugeAnimDuration,
                    animCallbackFn = function(){
                        iapi._animCallBack && iapi._animCallBack();
                    },
                    applyAttr = function (element, attrString, attrObj, callback) {

                        if (attrString === ATTRFN) {
                            element.attr(attrObj);
                        }
                        else {
                            element.animateWith(dummyObj, animObj, attrObj, animationDuration, animType, callback);
                        }
                        return element;
                    },
                    fluidAnimCallback,
                    fluidAttr = dsConfig.fluidAttr,
                    backColor,
                    frontColor,
                    fluidFill,
                    canvasRight = chartConfig.canvasRight,
                    canvasBottom = chartConfig.canvasBottom,
                    canvasWidth = chartConfig.canvasWidth,
                    borderColor = convertColor(darkConColor, 50);

                //Setting macros for annotation
                chartConfig.gaugeStartX = canvasLeft;
                chartConfig.gaugeEndX = canvasRight;
                chartConfig.gaugeStartY = canvasTop;
                chartConfig.gaugeEndY = canvasBottom;
                chartConfig.gaugeCenterX = canvasLeft + (canvasWidth * 0.5);
                chartConfig.gaugeCenterY = canvasTop + (canvasHeight * 0.5);
                chartConfig.gaugeRadius = canvasWidth * 0.5;

                if (!fluidAttr) {
                    fluidAttr = dsConfig.fluidAttr = {};
                }

                eventArgs = {
                    value: dsConfig.value,
                    displayValue: dsConfig.displayValue,
                    toolText: dsConfig.toolText
                };

                /*
                 * Creating a container group for the graphic element of column plots if
                 * not present and attaching it to its parent group.
                 */
                if (!container) { // first draw
                    container = graphics.container = paper.group('thermometer', parentContainer);
                    btnBorder = graphics.btnBorder = paper.path(container).attr({
                        'stroke-width' : 4
                    });
                    btnBorder1 = graphics.btnBorder1 = paper.path(container).attr({
                        'stroke-width' : 4
                    });
                    btnBorderLight = graphics.btnBorderLight = paper.path(container).attr({
                        'stroke-width' : 0
                    });
                    back = graphics.back = paper.path(container).attr({
                        'stroke-width' : 1
                    });
                    fluid = graphics.fluid = paper.path(container).attr({
                        'stroke-width' : 0
                    });
                    fluidTop = graphics.fluidTop = paper.path(container).attr({
                        'stroke-width' : 2
                    });
                    front = graphics.front = paper.path(container).attr({
                        'stroke-width' : 1
                    });
                    frontLight = graphics.frontLight = paper.path(container).attr({
                        'stroke-width' : 0
                    });
                    frontLight1 = graphics.frontLight1 = paper.path(container).attr({
                        'stroke-width' : 0
                    });
                    cylinterTop = graphics.cylinterTop = paper.path(container).attr({
                        'stroke-width' : 2
                    });
                    trackerContainer = graphics.trackerContainer = paper.group('col-hot', trackerLayer);
                    hotElement = graphics.hotElement = paper.path({
                        stroke: TRACKER_FILL,
                        fill: TRACKER_FILL,
                        ishot: true
                    }, trackerContainer)
                    .click(function (setDataArr) {
                        var ele = this;
                        plotEventHandler.call(ele, iapi, setDataArr);
                    })
                    .hover(
                        function (data) {
                            var ele = this;
                            if (dsConfig.showHoverEffect){
                                graphics.fluid && graphics.fluid.attr(fluidAttr.bodyHover);
                                graphics.fluidTop && graphics.fluidTop.attr(fluidAttr.topHover);
                            }
                            plotEventHandler.call(ele, iapi, data, ROLLOVER);
                        },
                        function (data) {
                            var ele = this;
                            if (dsConfig.showHoverEffect){
                                graphics.fluid && graphics.fluid.attr(fluidAttr.bodyOut);
                                graphics.fluidTop && graphics.fluidTop.attr(fluidAttr.topOut);
                            }
                            plotEventHandler.call(ele, iapi, data, ROLLOUT);
                        }
                        // rolloverResponseSetter(graphics, fluidHoverCosmetics),
                        // rolloutResponseSetter(graphics, fluidCosmetics)
                    );
                    dataLabelContainer = graphics.dataLabelContainer = paper.group('datalabel', dataLabelsLayer);
                    // label = graphics.label = paper.text({
                    //     text: BLANK,
                    //     'text-anchor': POSITION_MIDDLE,
                    //     'vertical-align': POSITION_TOP
                    // }, dataLabelContainer);

                    if (animation) {
                        fluidAttrFn = ANIMATEFN;
                        fluidAnimDuration = animation;
                        fluidAnimCallback = animCallbackFn;
                        // set the initial view for animation
                        fluid.attr({
                            path: [M, x1, y2, A, r, mathMax(r2, 1), 0, 0, 0, x2, y2,
                                L, x2, y2, A, r, mathMax(r2, 1), 0, 0, 1, x1, y2, Z]
                        });
                        fluidTop.attr({
                            path: [M, x3, y2, A, r3, r2, 0, 0, 0, x4, y2, L, x4, y2, A, r3, r2, 0, 0, 0, x3, y2, Z]
                        });
                    }
                    else {
                        fluidAttrFn = ATTRFN;
                    }
                    gaugeAttrFn = ATTRFN;
                }
                else {//redraw
                    if(animation) {
                        gaugeAttrFn = fluidAttrFn = ANIMATEFN;
                        gaugeAnimDuration = fluidAnimDuration = animation;
                        fluidAnimCallback = animCallbackFn;
                    }
                    else {
                        gaugeAttrFn = fluidAttrFn = ATTRFN;
                    }
                }

                // prepare attributes
                if (use3DLighting) {
                    backColor = lightConColor + COMMASTRING + darkConColor + COMMASTRING + lightConColor +
                        COMMASTRING + darkConColor + COMMASTRING + darkConColor1 + COMMASTRING +
                        darkConColor1 + COMMASTRING + darkConColor + COMMASTRING + lightConColor;
                    fluidFill = toRaphaelColor({
                        FCcolor : {
                            cx: 0.5,
                            cy: 0,
                            r: HUNDREDPERCENT,
                            color : fluidLightColor + COMMASTRING + fluidDarkColor,
                            alpha : fluidAlpha + COMMASTRING + fluidAlpha ,
                            ratio : zeroCommaHundredStr,
                            radialGradient : true
                        }
                    });

                    topColorStr = toRaphaelColor({
                        FCcolor : {
                            cx: 0.5,
                            cy: 0.7,
                            r: HUNDREDPERCENT,
                            color : fluidLightColor + COMMASTRING + fluidDarkColor,
                            alpha : fluidAlpha + COMMASTRING + fluidAlpha ,
                            ratio : zeroCommaHundredStr,
                            radialGradient : true
                        }
                    });
                    topStrokeStr = convertColor(fluidLightColor, fluidAlpha);
                    frontColor = lightConColor + COMMASTRING + darkConColor + COMMASTRING + lightConColor +
                        COMMASTRING + lightConColor + COMMASTRING + darkConColor + COMMASTRING +
                        lightConColor + COMMASTRING + darkConColor + COMMASTRING + lightConColor;

                    //draw the front light left
                    frontLight.show().attr({
                        fill : toRaphaelColor({
                            FCcolor : {
                                color : frontColor,
                                alpha : topLightGlowAlphaStr,
                                ratio : zeroCommaHundredStr,
                                angle : 0
                            }
                        })
                    });

                    applyAttr(frontLight, gaugeAttrFn, {
                        path: [M, x1, y2, A, r, r2, 1, 0, 0, x5, y5, L, x5, y4, A, r, r2, 0, 0, 1, x1, y, Z]
                    });

                    //draw the front light right
                    frontLight1.show().attr({
                        fill : toRaphaelColor({
                            FCcolor : {
                                color : frontColor,
                                alpha : topLightGlowAlphaStr,
                                ratio : zeroCommaHundredStr,
                                angle : 180
                            }
                        })
                    });

                    applyAttr(frontLight1, gaugeAttrFn, {
                        path: [M, x6, y5, A, r, r2, 0, 0, 0, x2, y2, L, x2, y, A, r, r2, 1, 0, 0, x6, y4, Z]
                    });

                }
                else {
                    backColor = lightConColor + COMMASTRING + darkConColor + COMMASTRING + darkConColor +
                        COMMASTRING + darkConColor + COMMASTRING + darkConColor + COMMASTRING +
                        darkConColor + COMMASTRING + darkConColor + COMMASTRING + lightConColor;
                    topColorStr = fluidFill = convertColor(fluidDarkColor, fluidAlpha);
                    topStrokeStr = convertColor(fluidEdgeColor);
                    frontColor = darkConColor + COMMASTRING + darkConColor + COMMASTRING + darkConColor +
                        COMMASTRING + darkConColor + COMMASTRING + darkConColor + COMMASTRING +
                        darkConColor + COMMASTRING + darkConColor + COMMASTRING + darkConColor;
                    frontLight.hide();
                    frontLight1.hide();
                }
                //draw the fluid fill
                fluidAttr.bodyOut = {
                    fill : fluidFill
                };
                fluidAttr.topOut = {
                    stroke : topStrokeStr,
                    fill : topColorStr
                };
                // create the hover attributes
                if (showHoverEffect) {
                    fluidHoverDarkColor = getDarkColor(plotFillHoverColor, 70);
                    fluidHoverLightColor = getLightColor(plotFillHoverColor, 70);
                    fluidHoverEdgeColor = getDarkColor(fluidHoverDarkColor, 90);

                    if (use3DLighting) {
                        fluidAttr.bodyHover = {
                            fill : toRaphaelColor({
                                FCcolor : {
                                    cx: 0.5,
                                    cy: 0,
                                    r: HUNDREDPERCENT,
                                    color : fluidHoverLightColor + COMMASTRING + fluidHoverDarkColor,
                                    alpha : plotFillHoverAlpha + COMMASTRING + plotFillHoverAlpha ,
                                    ratio : zeroCommaHundredStr,
                                    radialGradient : true
                                }
                            })
                        };

                        fluidAttr.topHover = {
                            stroke : convertColor(fluidHoverLightColor, plotFillHoverAlpha),
                            fill : toRaphaelColor({
                                FCcolor : {
                                    cx: 0.5,
                                    cy: 0.7,
                                    r: HUNDREDPERCENT,
                                    color : fluidHoverLightColor + COMMASTRING + fluidHoverDarkColor,
                                    alpha : plotFillHoverAlpha + COMMASTRING + plotFillHoverAlpha ,
                                    ratio : zeroCommaHundredStr,
                                    radialGradient : true
                                }
                            })
                        };
                    }
                    else {
                        fluidAttr.bodyHover = {
                            fill : convertColor(fluidHoverDarkColor, plotFillHoverAlpha)
                        };
                        fluidAttr.topHover = {
                            stroke : convertColor(fluidHoverEdgeColor),
                            fill : convertColor(fluidHoverDarkColor, plotFillHoverAlpha)
                        };
                    }

                }

                fluid.attr(fluidAttr.bodyOut);
                fluidTop.attr(fluidAttr.topOut);


                // update fluid's view
                applyAttr(fluid, fluidAttrFn, {
                    path: [M, x1, y2, A, r, mathMax(r2, 1), 0, 0, 0, x2, y2,
                        L, x2, y3, A, r, mathMax(r2, 1), 0, 0, 1, x1, y3, Z]
                }, fluidAnimCallback);

                // fluid[fluidAttrFn]({
                //     path: [M, x1, y2, A, r, mathMax(r2, 1), 0, 0, 0, x2, y2,
                //         L, x2, y3, A, r, mathMax(r2, 1), 0, 0, 1, x1, y3, Z]
                // }, fluidAnimDuration, fluidAnimCallback);

                applyAttr(fluidTop, fluidAttrFn, {
                    path: [M, x3, y3, A, r3, r2, 0, 0, 0, x4, y3, L, x4, y3, A, r3, r2, 0, 0, 0, x3, y3, Z]
                });

                // fluidTop[fluidAttrFn]({
                //     path: [M, x3, y3, A, r3, r2, 0, 0, 0, x4, y3, L, x4, y3, A, r3, r2, 0, 0, 0, x3, y3, Z]
                // }, fluidAnimDuration);

                // draw the gauge
                btnBorder.attr({
                    stroke : convertColor(darkConColor, 80)
                });

                applyAttr(btnBorder, gaugeAttrFn, {
                    path: [M, xBt1, yBt1, A, rBt1, rBt2, 0, 0, 0, xBt2, yBt1, L, xBt2, yBt2,
                        A, rBt1, rBt2, 0, 0, 0, xBt1, yBt2, Z]
                });

                btnBorder1.attr({
                    stroke : borderColor
                });

                applyAttr(btnBorder1, gaugeAttrFn, {
                    path: [M, x1, yBt1, A, r, r2, 0, 0, 0, x2, yBt1, L, x2, yBt2, A, r, r2, 0, 0, 0, x1, yBt2, Z]
                });

                btnBorderLight.attr({
                    fill : toRaphaelColor({
                        FCcolor : {
                            color : lightConColor + COMMASTRING + darkConColor + COMMASTRING + lightConColor +
                                COMMASTRING + lightConColor + COMMASTRING + darkConColor + COMMASTRING +
                                fluidDarkColor + COMMASTRING + darkConColor + COMMASTRING + lightConColor,
                            alpha : btnBorderLightAlphaStr,
                            ratio : btnBorderLightRatioStr,
                            angle : 0
                        }
                    })
                });

                applyAttr(btnBorderLight, gaugeAttrFn, {
                    path: [M, x1, y2, A, r, r2, 0, 0, 0, x2, y2, A, r, r2, 0, 0, 0, x1, y2, Z]
                });

                back.attr({
                    stroke : borderColor,
                    fill : toRaphaelColor({
                        FCcolor : {
                            color : backColor,
                            alpha : backAlphaStr,
                            ratio : backRatioStr,
                            angle : 0
                        }
                    })
                });

                applyAttr(back, gaugeAttrFn, {
                    path: [M, x1, y2, A, r, r2, 0, 0, 0, x2, y2, L, x2, y, A, r, r2, 0, 0, 0, x1, y, Z]
                });

                //draw the front side
                front.attr({
                    stroke : borderColor,
                    fill : toRaphaelColor({
                        FCcolor : {
                            color : frontColor,
                            alpha : backAlphaStr,
                            ratio : frontRatioStr,
                            angle : 0
                        }
                    })
                });

                applyAttr(front, gaugeAttrFn, {
                    path: [M, x1, y2, A, r, r2, 0, 0, 0, x2, y2, L, x2, y, A, r, r2, 0, 0, 1, x1, y, Z]
                });

                cylinterTop.attr({
                    stroke : convertColor(darkConColor, 40)
                });

                applyAttr(cylinterTop, gaugeAttrFn, {
                    path: [M, x1, y6, A, r, r2, 0, 0, 0, x2, y6, L, x2, y6, A, r, r2, 0, 0, 0, x1, y6, Z]
                });

                applyAttr(hotElement, gaugeAttrFn, {
                    path: [M, x1, y2, x1, yBt1 + 4, A, r, r2, 0, 0, 0, x2, yBt1 + 4,  L, x2, y2, x2, y,
                        A, r, r2, 0, 0, 0, x1, y, Z]
                })
                .tooltip(dsConfig.toolText);

                hotElement.data(EVENTARGS, eventArgs);

                // hotElement[gaugeAttrFn]({
                //     path: [M, x1, y2, x1, yBt1 + 4, A, r, r2, 0, 0, 0, x2, yBt1 + 4,  L, x2, y2, x2, y,
                //         A, r, r2, 0, 0, 0, x1, y, Z]
                // }, gaugeAnimDuration)
                // .tooltip(dsConfig.toolText);

                // draw the label
                if(dsConfig.showValue){

                    label = graphics.label;

                    if (!label) {
                        label = graphics.label = paper.text({
                            text: dsConfig.displayValue,
                            x: x,
                            y: y2 + r2 + (dsConfig.valuePadding || 0) + 8, // glass bottom extra thick border
                            'text-anchor': POSITION_MIDDLE,
                            'vertical-align': POSITION_TOP,
                            fill: style.color,
                            'text-bound': [style.backgroundColor, style.borderColor,
                                        style.borderThickness, style.borderPadding,
                                        style.borderRadius, style.borderDash]
                        }, dataLabelContainer);

                        label.show();
                    }
                    else {

                        label.show().attr({
                            text: dsConfig.displayValue
                        });

                        applyAttr(label, gaugeAttrFn, {
                            x: x,
                            y: y2 + r2 + (dsConfig.valuePadding || 0) + 8, // glass bottom extra thick border
                            fill: style.color,
                            'text-bound': [style.backgroundColor, style.borderColor,
                                        style.borderThickness, style.borderPadding,
                                        style.borderRadius, style.borderDash]
                        });
                    }
                }
                else {
                    label = graphics.label;
                    label && label.hide();
                }

                // call the call back if there is no animation
                if (!fluidAnimCallback) {
                    animCallbackFn();
                }
            }

        }, 'thermometer']);
    }
]);

FusionCharts.register('module', ['private', 'modules.renderer.js-dataset-angulargauge',
    function () {
        var global = this,
            lib = global.hcLib,
            R = lib.Raphael,
            //strings
            BLANK = lib.BLANKSTRING,
            BLANKSTRING = BLANK,

            //add the tools thats are requared
            pluck = lib.pluck,
            toPrecision = lib.toPrecision,
            getValidValue = lib.getValidValue,
            pluckNumber = lib.pluckNumber,
            hasSVG = lib.hasSVG,
            getFirstValue = lib.getFirstValue,
            convertColor = lib.graphics.convertColor,

            preDefStr = lib.preDefStr,
            configStr = preDefStr.configStr,
            animationObjStr = preDefStr.animationObjStr,

            getDashStyle = lib.getDashStyle,

            parseTooltext = lib.parseTooltext,

            COMMASTRING = lib.COMMASTRING,
            ZEROSTRING = lib.ZEROSTRING,
            ANIM_EFFECT = 'easeIn',
            FILLMIXDARK10 = '{dark-10}',
            PXSTRING = 'px',

            parseUnsafeString = lib.parseUnsafeString,
            win = global.window,

            doc = win.document,
            math = Math,
            mathAbs = math.abs,
            mathATan2 = math.atan2,
            mathPI = math.PI,
            math2PI = 2 * mathPI,
            deg2rad = mathPI / 180,
            POINTER = 'pointer',
            NORMALSTRING = 'normal',
            EVENTARGS = 'eventArgs',
            COMPONENT = 'component',
            DATASET = 'dataset',
            toRaphaelColor = lib.toRaphaelColor,

            hasTouch = doc.documentElement.ontouchstart !== undefined,

            getPosition = lib.getPosition,
            plotEventHandler = lib.plotEventHandler,
            ROLLOVER = 'DataPlotRollOver',
            ROLLOUT = 'DataPlotRollOut',
            getTouchEvent = function (event) {
                return (hasTouch && event.sourceEvent && event.sourceEvent.touches &&
                    event.sourceEvent.touches[0]) || event;
            },
            UNDEFINED,
            isString = function (s) {
                return typeof s === 'string';
            },
            defined = function  (obj) {
                return obj !== UNDEFINED && obj !== null;
            },
            // pInt = function(s, mag) {
            //     return parseInt(s, mag || 10);
            // },
            M = 'M',
            L = 'L',
            Z = 'Z',
            setLineHeight = lib.setLineHeight,

            HUNDREDSTRING = lib.HUNDREDSTRING,


            getAttrFunction = function () {

                var rotationStr = 'angle';

                return function (hash, val, animation) {
                    var key,
                    value,
                    element = this,
                    attr3D = this._Attr,
                    cx = R.vml ? (-1.5) : 0, // correction of -1.5 has to be added for VML.
                    cy = R.vml ? (-1.5) : 0,
                    red;

                    if (!attr3D) {
                        attr3D = element._Attr = {};
                    }


                    // single key-value pair
                    if (isString(hash) && defined(val)) {
                        key = hash;
                        hash = {};
                        hash[key] = val;
                    }

                    // used as a getter: first argument is a string, second is undefined
                    // And also if first argument is undefined it should return the all attrs object.
                    if (isString(hash) || hash === undefined) {
                        //if belongs from the list then handle here
                        if (hash == rotationStr) {
                            element = element._Attr[hash];
                        }
                        else {//else leve for the original attr
                            element = element._attr(hash);
                        }

                    // setter
                    }
                    else {
                        for (key in hash) {
                            value = hash[key];
                            //if belongs from the list then handle here
                            if (key === rotationStr) {
                                attr3D[key] = value;
                                red = value * deg2rad;
                                attr3D.tooltipPos[0] = attr3D.cx + (attr3D.toolTipRadius * Math.cos(red));
                                attr3D.tooltipPos[1] = attr3D.cy + (attr3D.toolTipRadius * Math.sin(red));
                                attr3D.prevValue = value;

                                if (animation && animation.duration) {
                                    element.animate({
                                        transform: ('R' + value + COMMASTRING + cx + COMMASTRING + cy)
                                    }, animation.duration, ANIM_EFFECT);
                                }
                                else {
                                    element.attr({transform: ('R' + value + COMMASTRING + cx + COMMASTRING + cy)});
                                }
                            }
                            else {//else leave for the original attr
                                element._attr(key, value);
                            }
                        }
                    }
                    return element;
                };
            };

        FusionCharts.register(COMPONENT, [DATASET, 'angulargauge',{
            type : 'angulargauge',

            pIndex : 2,

            customConfigFn : '_createDatasets',

            init : function () {
                var dataSet = this;
                dataSet.components = dataSet.components || {};
                dataSet.idMap = { };
                dataSet.configure();
            },
            configure : function () {
                var dataSet = this,
                    chart = dataSet.chart,
                    chartConfig = chart.config,
                    jsonData = chart.jsonData,
                    chartAttrs = jsonData.chart,
                    pointer = jsonData.pointers || jsonData.dials,
                    pointerArr = pointer.pointer || pointer.dial,
                    data = dataSet.components.data || (dataSet.components.data = []),
                    components = chart.components,
                    scale = components.scale,
                    colorM = components.colorManager,
                    datasetConfig = dataSet.config || (dataSet.config = {}),
                    scaleAngle = pluckNumber(chartAttrs.gaugescaleangle, 180),
                    startAngle = pluckNumber(chartAttrs.gaugestartangle),
                    endAngle = pluckNumber(chartAttrs.gaugeendangle),
                    startDefined = defined(startAngle), tempAngle,
                    //arc on 360deg is not possable SVG limitation so reduce the scale
                    circleHandler = hasSVG ? 0.001 : 0.01,
                    endDefined= defined(endAngle),
                    showGaugeBorder,
                    pvColor,
                    scaleOnResize,
                    showValue,
                    pointShowValue,
                    valueY,
                    dataLabelsStyle,
                    fontBdrColor,
                    i,
                    ln;

                chartConfig.displayValueCount = 0;
                for (i = 0, ln = pointerArr.length; i < ln; i += 1) {
                    data[i] = data[i] || (data[i] = {});
                    data[i].basewidth = pointerArr[i].basewidth;
                    data[i].color = pointerArr[i].color;
                    data[i].alpha = pointerArr[i].alpha;
                    data[i].bgcolor = pointerArr[i].bgcolor;
                    data[i].borderalpha = pointerArr[i].borderalpha;
                    data[i].bordercolor = pointerArr[i].bordercolor;
                    data[i].borderthickness = pointerArr[i].borderthickness;
                    data[i].editmode = pointerArr[i].editmode;
                    data[i].id = pluck(pointerArr[i].id, 'dial'+i);
                    data[i].link = pointerArr[i].link;
                    data[i].radius = pointerArr[i].radius;
                    data[i].rearextension = pointerArr[i].rearextension;
                    data[i].showvalue = pointerArr[i].showvalue;
                    data[i].tooltext = pointerArr[i].tooltext;
                    data[i].topwidth = pointerArr[i].topwidth;
                    data[i].value = pointerArr[i].value;
                    data[i].valuex = pointerArr[i].valuex;
                    data[i].valuey = pointerArr[i].valuey;
                    data[i].baseradius = pointerArr[i].baseradius;
                    data[i].displayvalue = pointerArr[i].displayvalue;

                    showValue = datasetConfig.showValue = pluckNumber(chartAttrs.showvalue,
                        chartAttrs.showrealtimevalue , 0),
                    pointShowValue = pluckNumber(data[i].showvalue, showValue);
                    valueY = pluckNumber(getValidValue(data[i].valuey));
                    if (pointShowValue && !defined(valueY)) {
                        chartConfig.displayValueCount += 1;
                    }
                }
                /*
                 *All angle should be in range of -360 to 360 of traditional methode
                 *At the end convert them in computer graphics methode
                 * relation among them is [scaleAngle = startAngle - endAngle;]
                 */
                if (scaleAngle > 360 || scaleAngle < -360) {
                    scaleAngle = scaleAngle > 0 ? 360 : -360;
                }
                if (endAngle > 360 || endAngle < -360) {
                    endAngle = endAngle % 360;
                }
                if (startAngle > 360 || startAngle < -360) {
                    startAngle = startAngle % 360;
                }
                //booth defined
                if (startDefined && endDefined) {
                    //override the scale
                    scaleAngle = startAngle - endAngle;
                    //validate scale and EndAngle
                    if (scaleAngle > 360 || scaleAngle < -360) {
                        scaleAngle = scaleAngle % 360;
                        endAngle = startAngle - scaleAngle;
                    }
                }
                else if (startDefined) {//StartAngle Defined
                    //derive endAngle
                    endAngle = startAngle - scaleAngle;
                    //if derived end angle cross the limit
                    if (endAngle > 360 || endAngle < -360) {
                        endAngle = endAngle % 360;
                        startAngle += endAngle > 0 ? -360 : 360;
                    }
                }
                else if (endDefined) {//endAngle Defined
                    //derive StartAngle
                    startAngle = endAngle + scaleAngle;
                    //if derived start angle cross the limit
                    if (startAngle > 360 || startAngle < -360) {
                        startAngle = startAngle % 360;
                        endAngle += startAngle > 0 ? -360 : 360;
                    }
                }
                else {//booth will be derived
                    if (scaleAngle === 360) {
                        startAngle = 180;
                        endAngle = - 180;
                    }
                    else  if (scaleAngle === -360) {
                        startAngle = -180;
                        endAngle = -180;
                    }
                    else {
                        tempAngle = scaleAngle / 2;
                        startAngle = 90 + tempAngle;
                        endAngle = startAngle - scaleAngle;
                    }

                }
                //Full 360 can't be drawn by arc[limitation]
                if (Math.abs(scaleAngle) === 360) {
                    scaleAngle += scaleAngle > 0 ? -circleHandler : circleHandler;
                    endAngle = startAngle - scaleAngle;
                }

                //convert all the angles into clockwise cordinate
                endAngle = 360 - endAngle;
                startAngle = 360 - startAngle;
                scaleAngle = -scaleAngle;

                //if start angle cross the limit
                if (startAngle > 360 || endAngle > 360 ) {
                    startAngle -= 360;
                    endAngle -= 360;
                }
                //convert into red
                datasetConfig.gaugeStartAngle = startAngle = startAngle * deg2rad;
                datasetConfig.gaugeEndAngle = endAngle = endAngle * deg2rad;
                datasetConfig.gaugeScaleAngle = scaleAngle = scaleAngle * deg2rad;
                datasetConfig.upperLimit = pluckNumber(chartAttrs.upperlimit);
                datasetConfig.lowerLimit = pluckNumber(chartAttrs.lowerlimit);

                // set axis configure
                scale.setAxisConfig({
                    startAngle : startAngle,
                    totalAngle : -scaleAngle
                });
                scaleOnResize = pluckNumber(chartAttrs.scaleonresize, 1);

                datasetConfig.origW = pluckNumber(chartAttrs.origw, scaleOnResize ?
                    chart.origRenderWidth : chartConfig.width);
                datasetConfig.origH = pluckNumber(chartAttrs.origh, scaleOnResize ?
                    chart.origRenderHeight : chartConfig.height);
                chartConfig.showtooltip = pluckNumber(chartAttrs.showtooltip, 1);
                // Whether to auto-scale itself with respect to previous size
                chartConfig.autoScale = pluckNumber(chartAttrs.autoscale , 1);
                datasetConfig.rearExtension = pluckNumber(pointer.rearextension, 0);
                datasetConfig.gaugeinnerradius = chartAttrs.gaugeinnerradius;
                // gaugeOuterRadius does not have any default value.
                datasetConfig.valueBelowPivot = pluckNumber(chartAttrs.valuebelowpivot ,  0);
                datasetConfig.showShadow = pluckNumber(chartAttrs.showshadow, 1);
                showGaugeBorder = pluckNumber(chartAttrs.showgaugeborder, 1);
                datasetConfig.gaugeFillMix = lib.getFirstDefinedValue(chartAttrs.colorrangefillmix,
                    chartAttrs.gaugefillmix, chart.colorRangeFillMix,
                    '{light-10},{light-70},{dark-10}');
                datasetConfig.gaugeFillRatio = lib.getFirstDefinedValue(chartAttrs.colorrangefillratio,
                    chartAttrs.gaugefillratio, chart.colorRangeFillRatio, chartAttrs.gaugefillratio);
                if (datasetConfig.gaugeFillRatio === undefined){
                    datasetConfig.gaugeFillRatio = ',6';
                }else if (datasetConfig.gaugeFillRatio !== BLANK){
                    //Append a comma before the ratio
                    datasetConfig.gaugeFillRatio = COMMASTRING + datasetConfig.gaugeFillRatio;
                }
                datasetConfig.gaugeBorderColor = pluck(chartAttrs.gaugebordercolor, '{dark-20}');
                datasetConfig.gaugeBorderThickness = showGaugeBorder ?
                    pluckNumber(chartAttrs.gaugeborderthickness, 1) : 0;
                datasetConfig.gaugeBorderAlpha = pluckNumber(chartAttrs.gaugeborderalpha, 100);

                //Gauge Border properties

                //Parse the color, alpha and ratio array for each color range arc.
                pvColor = colorM.parseColorMix(
                    pluck(chartAttrs.pivotfillcolor, chartAttrs.pivotcolor, chartAttrs.pivotbgcolor,
                        colorM.getColor('pivotColor')),
                    pluck(chartAttrs.pivotfillmix, '{light-10},{light-30},{dark-20}'));
                datasetConfig.pivotFillAlpha = colorM.parseAlphaList(pluck(chartAttrs.pivotfillalpha,
                    HUNDREDSTRING), pvColor.length);
                datasetConfig.pivotFillRatio = colorM.parseRatioList(pluck(chartAttrs.pivotfillratio, ZEROSTRING),
                    pvColor.length);
                datasetConfig.pivotFillColor = pvColor.join();
                datasetConfig.pivotFillAngle = pluckNumber(chartAttrs.pivotfillangle, 0);
                datasetConfig.isRadialGradient = pluck(chartAttrs.pivotfilltype, 'radial').toLowerCase() == 'radial';
                //Pivot border properties
                datasetConfig.showPivotBorder = pluckNumber(chartAttrs.showpivotborder, 0);
                datasetConfig.pivotBorderThickness = pluckNumber(chartAttrs.pivotborderthickness, 1);
                datasetConfig.pivotBorderColor = convertColor(
                    pluck(chartAttrs.pivotbordercolor, colorM.getColor('pivotBorderColor')),
                    datasetConfig.showPivotBorder == 1 ? pluck(chartAttrs.pivotborderalpha, HUNDREDSTRING) :
                        ZEROSTRING);
                chartConfig.dataLabels = chartConfig.dataLabels || {};
                fontBdrColor = getFirstValue(chartAttrs.valuebordercolor,
                    BLANKSTRING);
                fontBdrColor = fontBdrColor ? convertColor(
                    fontBdrColor, pluckNumber(chartAttrs.valueborderalpha,
                    chartAttrs.valuealpha, 100)) : BLANKSTRING;
                dataLabelsStyle = chartConfig.dataLabels.style = {
                    fontFamily: pluck(chartAttrs.valuefont, chartConfig.style.inCanfontFamily),
                    fontSize: pluck(chartAttrs.valuefontsize, parseInt(chartConfig.style.inCanfontSize, 10)) + PXSTRING,
                    color: convertColor(pluck(chartAttrs.valuefontcolor, chartConfig.style.inCancolor),
                        pluckNumber(chartAttrs.valuefontalpha,
                        chartAttrs.valuealpha, 100)),
                    fontWeight: pluckNumber(chartAttrs.valuefontbold) ? 'bold' :
                        NORMALSTRING,
                    fontStyle: pluckNumber(chartAttrs.valuefontitalic) ? 'italic' :
                        NORMALSTRING,
                    border: fontBdrColor || chartAttrs.valuebgcolor ?
                        (pluckNumber(chartAttrs.valueborderthickness, 1) + 'px solid') :
                            undefined,
                    borderColor: fontBdrColor,
                    borderThickness: pluckNumber(chartAttrs.valueborderthickness, 1),
                    borderPadding: pluckNumber(chartAttrs.valueborderpadding, 2),
                    borderRadius: pluckNumber(chartAttrs.valueborderradius, 0),
                    backgroundColor: chartAttrs.valuebgcolor ?
                        convertColor(chartAttrs.valuebgcolor,
                        pluckNumber(chartAttrs.valuebgalpha, chartAttrs.valuealpha,
                        100)) : BLANKSTRING,
                    borderDash: pluckNumber(chartAttrs.valueborderdashed, 0) ?
                        getDashStyle(pluckNumber(chartAttrs.valueborderdashlen, 4),
                        pluckNumber(chartAttrs.valueborderdashgap, 2),
                        pluckNumber(chartAttrs.valueborderthickness, 1)) : BLANK
                };
                setLineHeight(dataLabelsStyle);
            },
            draw :function (animation) {
                var dataSet = this,
                    chart = dataSet.chart,
                    idMap = dataSet.idMap,
                    chartConfig = chart.config,
                    jsonData = chart.jsonData,
                    chartAttrs = jsonData.chart,
                    data = dataSet.components.data,
                    datasetConfig = dataSet.config,
                    renderer = datasetConfig,
                    graphics = dataSet.graphics,
                    components = chart.components,
                    NumberFormatter = components.numberFormatter,
                    paper = components.paper,
                    colorM = components.colorManager,
                    scale = components.scale,
                    x = Number(datasetConfig.gaugeOriginX),
                    y = Number(datasetConfig.gaugeOriginY),
                    startAngle = datasetConfig.gaugeStartAngle,
                    endAngle = datasetConfig.gaugeEndAngle,
                    showShadow = datasetConfig.showShadow,
                    showTooltip = chartConfig.showtooltip,//(options.tooltip.enabled !== false),
                    scaleRange = scale.config.axisRange,
                    minValue = scaleRange.min,
                    maxValue = scaleRange.max,
                    pGroup = graphics.pointGroup,
                    dataLabelsGroup = graphics.dataLabelGroup,
                    valueRange = maxValue - minValue,
                    angleRange = endAngle - startAngle,
                    angleValueFactor = valueRange / angleRange,
                    editMode,
                    showHoverEffect = pluckNumber(chartAttrs.showhovereffect),
                    showValue = dataSet.showValue = pluckNumber(chartAttrs.showvalue, chartAttrs.showrealtimevalue , 0),
                    i = 0,
                    style = chartConfig.dataLabels.style,
                    css = {
                        fontFamily: style.fontFamily,
                        fontSize: style.fontSize,
                        lineHeight: style.lineHeight,
                        fontWeight: style.fontWeight,
                        fontStyle: style.fontStyle
                    },
                    scaleFactor = chartConfig.scaleFactor,
                    lineHeight = pluckNumber(parseInt(style.lineHeight, 10), 12),
                    isBelow = datasetConfig.valueBelowPivot,
                    animationObj = chart.get(configStr, animationObjStr),
                    animationDuration = animationObj.duration,
                    dummyObj = animationObj.dummyObj,
                    animObj = animationObj.animObj,
                    animType = animationObj.animType,
                    labelCounter = 0,
                    graphicCounter = 0,
                    hasHoverSizeChange,
                    hoverFill,
                    hoverAttr,
                    outAttr,
                    point,
                    radius,
                    baseWidth,
                    topWidth,
                    baseRadius,
                    rearExtension,
                    baseWidthHF,
                    topWidthHF,
                    ln = data && data.length,
                    rotation,
                    graphic,
                    prevData,
                    stubEvent = {
                        pageX: 0,
                        pageY: 0
                    },
                    attrFN = getAttrFunction(startAngle, endAngle),
                    chartPosition,
                    getClickArcTangent = function (x, y, center, ref) {
                        return mathATan2(y - center[1] - ref.top,
                            x - center[0] - ref.left);
                    },
                    dialDragStart = function (startX, startY) {
                        var point = data[this.pos],
                        pointConfig = point.config || {};
                        if (!point.editMode) {
                            return;
                        }
                        // For update previous value is retaining due to closure
                        x = Number(datasetConfig.gaugeOriginX);
                        y = Number(datasetConfig.gaugeOriginY);
                        chartPosition = getPosition(chart.linkedItems.container);
                        // Record the angle of point of drag start with respect
                        // to starting angle.
                        chartConfig.rotationStartAngle = getClickArcTangent(startX, startY, [x, y], chartPosition);
                        pointConfig.dragStartY = point.value;
                        prevData = chart._getDataJSON();
                    },

                    dialDragEnd = function () {
                        var point = data[this.pos],
                        chartObj = chart.chartInstance,
                        jsVars;

                        if (!point.editMode) {
                            return;
                        }
                        jsVars = chartObj && chartObj.jsVars;
                        jsVars && (jsVars._rtLastUpdatedData = chart._getDataJSON());
                        global.raiseEvent('RealTimeUpdateComplete', {
                            data: '&value=' + point.updatedValStr,
                            updateObject: {values: [point.updatedValStr]},
                            prevData: prevData.values,
                            source: 'editMode',
                            url: null
                        }, chartObj);

                        try {
                            /* jshint camelcase: false*/
                            win.FC_ChartUpdated &&
                            win.FC_ChartUpdated(chartObj.id);
                            /* jshint camelcase: true*/
                        }
                        catch (err) {
                            setTimeout(function () {
                                throw (err);
                            }, 1);
                        }
                    },
                    dialDragHandler = function (dx, dy, startX, startY, event) {

                        var point = data[this.pos],
                            touchEvent = (hasTouch && getTouchEvent(event)) || stubEvent,
                            newAngle,
                            angleDelta,
                            angleDelta2,
                            newVal,
                            newVal2,
                            values,
                            i,
                            len;

                        if (!point.editMode) {
                            return;
                        }

                        // set a flag to determine that drag is happened
                        chartConfig.fromDrag = true;

                        // For update previous value is retaining due to closure
                        x = Number(datasetConfig.gaugeOriginX);
                        y = Number(datasetConfig.gaugeOriginY);
                        minValue = scaleRange.min;
                        maxValue = scaleRange.max;
                        startAngle = datasetConfig.gaugeStartAngle;
                        endAngle = datasetConfig.gaugeEndAngle;
                        valueRange = maxValue - minValue;
                        angleRange = endAngle - startAngle;
                        angleValueFactor = valueRange / angleRange;
                        newAngle = getClickArcTangent(startX, startY, [x, y], chartPosition);

                        angleDelta = chartConfig.rotationStartAngle - newAngle;
                        angleDelta2 = angleDelta < 0 ? (math2PI + angleDelta) : (angleDelta - math2PI);
                        newVal = point.config.dragStartY - (angleDelta * angleValueFactor);
                        newVal2 = point.config.dragStartY - (angleDelta2 * angleValueFactor);

                        if ((newVal < minValue || newVal > maxValue) && (newVal2 >= minValue && newVal2 <= maxValue)) {
                            newVal = newVal2;
                        }

                        if (newVal < minValue) {
                            newVal = mathAbs(newVal2 - maxValue) < mathAbs(newVal - minValue) ? maxValue : minValue;
                        } else if (newVal > maxValue){
                            newVal = mathAbs(newVal - maxValue) < mathAbs(newVal2 - minValue) ? maxValue : minValue;
                        }

                        point.config.updatedValStr = newVal+BLANK;
                        point.config.updatedVal = newVal;
                        values = [];
                        i = 0;
                        len = point.config.index;

                        for(;i < len; i += 1) {
                            values.push(BLANK);
                        }

                        values.push({value : newVal,
                        animation : {
                            duration : 0,
                            transposeAnimDuration : 0,
                            initAnimDuration :0
                        }});

                        if (point.config.y !== newVal && dataSet.updateData({data: values}, true)) {
                            point.updatedValStr = values.join('|');
                            point.dragStartX = (x || event.pageX || touchEvent.pageX);
                        }
                    },
                    link,
                    eventArgs,
                    rolloverProperties,
                    pathComand,
                    hoverRadius,
                    baseHoverWidth,
                    baseHoverWidthHF,
                    topHoverWidth,
                    topHoverWidthHF,
                    rearHoverExtension,
                    clickHandler,
                    hoverRollOver,
                    hoverRollOut,
                    angleValue,
                    index,
                    pointConfig,
                    itemValue,
                    formatedValue,
                    displayValue,
                    pointShowValue,
                    valueY,
                    isLabelString,
                    displayValueCount,
                    setToolText,
                    bgColor,
                    bgAlpha,
                    dialFill,
                    borderColor,
                    borderalpha,
                    dialBorderColor,
                    borderThickness,
                    showDialHoverEffect,
                    borderHoverColor,
                    borderHoverAlpha,
                    borderHoverThickness,
                    hasBorderHoverMix,
                    bgHoverColor,
                    bgHoverAlpha,
                    hasHoberFillMix,
                    compositPivotRadius,
                    pivotRadius,
                    valueX,
                    toolText,
                    displayValueArgs,
                    lastY,
                    labelY,
                    labelX,
                    freshDraw;

                compositPivotRadius = pivotRadius = datasetConfig.pivotRadius;
                if (renderer.dataById === undefined) {
                    renderer.dataById = {};
                }

                animation = animation || animationObj;

                if (!dataLabelsGroup) {
                    dataLabelsGroup = graphics.dataLabelGroup =
                        paper.group('datalabels').insertAfter(graphics.pointGroup);
                }

                if (!graphics.pointersPath) {
                    graphics.pointersPath = [];
                }
                if (!graphics.pointersTpath) {
                    graphics.pointersTpath = [];
                }
                if (!graphics.dataLabel) {
                    graphics.dataLabel = [];
                }

                clickHandler = function (data) {
                    var ele = this;
                    // Checking if click is fired from drag or not
                    if (chartConfig.fromDrag) {
                        chartConfig.fromDrag = false;
                        return;
                    }
                    plotEventHandler.call(ele, chart, data);
                };

                hoverRollOver = function (data) {
                    var ele = this,
                    transStr,
                    rolloverProperties = ele.data('rolloverProperties');
                    plotEventHandler.call(ele, chart, data, ROLLOVER);
                    if (rolloverProperties.enabled) {
                        transStr = ele.attr('transform');
                        ele.attr('transform', BLANK);
                        ele.attr(rolloverProperties.hoverAttr);
                        ele.attr('transform', transStr);

                    }
                };

                hoverRollOut = function (data) {
                    var ele = this,
                            transStr,
                    rolloverProperties = ele.data('rolloverProperties');
                    plotEventHandler.call(ele, chart, data, ROLLOUT);
                    if (rolloverProperties.enabled) {
                        transStr = ele.attr('transform');
                        ele.attr('transform', BLANK);
                        ele.attr(rolloverProperties.outAttr);
                        ele.attr('transform', transStr);
                    }
                };

                index = 0;

                //fix for null or no data
                //gauge will show the dial at min value
                if (!ln) {
                    index = -1;
                    ln = 0;
                }

                if (showHoverEffect !== 0 && (showHoverEffect || chartAttrs.dialborderhovercolor ||
                        chartAttrs.dialborderhoveralpha || chartAttrs.dialborderhoveralpha === 0 ||
                        chartAttrs.dialborderhoverthickness || chartAttrs.dialborderhoverthickness === 0 ||
                        chartAttrs.dialbghovercolor || chartAttrs.plotfillhovercolor ||
                        chartAttrs.dialbghoveralpha || chartAttrs.plotfillhoveralpha ||
                            chartAttrs.dialbghoveralpha === 0)){
                    showHoverEffect = 1;
                }
                for (; i < ln; i += 1) {
                    point = data[i];
                    point.config = point.config || {};
                    pointConfig = point.config;
                    point.config.index = i;
                    idMap[point.id] = {
                        index : i,
                        config : point.config
                    };
                    freshDraw = false;

                    if (point.id !== undefined) {
                        renderer.dataById[point.id] = {
                            index: i,
                            point: point
                        };
                    }

                    itemValue = NumberFormatter.getCleanValue(point.value);
                    itemValue = Number(toPrecision(itemValue, 10));
                    rearExtension = (pluckNumber(point.rearextension, 0)) * scaleFactor;
                    compositPivotRadius = Math.max(compositPivotRadius, rearExtension * scaleFactor);
                    formatedValue = NumberFormatter.dataLabels(itemValue);
                    displayValue = getValidValue(point.displayvalue, formatedValue, BLANKSTRING);
                    pointShowValue = pluckNumber(point.showvalue, showValue);
                    valueY = pluckNumber(getValidValue(point.valuey) * scaleFactor);
                    valueX = pluckNumber(getValidValue(point.valuex) * scaleFactor);
                    isLabelString = pluck(point.tooltext, point.hovertext) ? true : false;
                    pointConfig.itemValue = itemValue;
                    pointConfig.formatedVal = formatedValue;

                    if (pointShowValue && !defined(valueY)) {
                        displayValueCount += 1;
                    }
                    setToolText = getValidValue(parseUnsafeString(pluck(point.tooltext, point.hovertext)));
                    if (setToolText){
                        setToolText = parseTooltext(setToolText, [1,2], {
                            formattedValue: formatedValue
                        }, point, chartAttrs);
                    }
                    else {
                        setToolText = displayValue;
                    }
                    bgColor = pluck(point.color, point.bgcolor, colorM.getColor('dialColor'));
                    bgAlpha = pluckNumber(point.alpha, point.bgalpha, 100);
                    dialFill = toRaphaelColor({
                            FCcolor : {
                                color: bgColor,
                                alpha: bgAlpha,
                                angle : 90
                            }
                        });
                    borderColor = pluck(point.bordercolor, colorM.getColor('dialBorderColor'));
                    borderalpha = pluckNumber(point.borderalpha, 100);
                    dialBorderColor = convertColor(borderColor, borderalpha);
                    borderThickness = pluckNumber(point.borderthickness, 1);
                    radius = (pluckNumber(point.radius)) * scaleFactor;
                    baseWidth = pluckNumber(pluckNumber(point.basewidth * scaleFactor, pivotRadius * 1.6));
                    topWidth = (pluckNumber(point.topwidth, 0)) * scaleFactor;
                    baseRadius = pluckNumber(point.baseradius, 0);
                    editMode = pluckNumber(point.editmode, chartAttrs.editmode, 0);
                    link = pluck(point.link, BLANKSTRING);
                    toolText = setToolText;
                    pointConfig.toolText = toolText;
                    displayValueArgs = pluck(displayValue, BLANKSTRING);
                    displayValue = pointShowValue ? pluck(displayValue, BLANK) : BLANKSTRING;
                    showDialHoverEffect = pluckNumber(point.showhovereffect, showHoverEffect);
                    if (showDialHoverEffect !== 0 && (showDialHoverEffect || point.borderhovercolor ||
                            point.borderhoveralpha || point.borderhoveralpha === 0 ||
                            point.borderhoverthickness || point.borderhoverthickness === 0 ||
                            point.bghovercolor || point.bghoveralpha || point.bghoveralpha === 0)) {
                        showDialHoverEffect = true;
                        outAttr = {};
                        hoverAttr = {};
                        borderHoverColor = pluck(point.borderhovercolor, chartAttrs.dialborderhovercolor,
                            FILLMIXDARK10);
                        borderHoverAlpha = pluckNumber(point.borderhoveralpha,
                            chartAttrs.dialborderhoveralpha, borderalpha);
                        borderHoverThickness = pluckNumber(point.borderhoverthickness,
                            chartAttrs.dialborderhoverthickness, borderThickness);

                        if (borderHoverThickness){
                            outAttr.stroke = dialBorderColor;
                            hasBorderHoverMix = /\{/.test(borderHoverColor);
                            hoverAttr.stroke = convertColor(hasBorderHoverMix ?
                                colorM.parseColorMix(borderColor, borderHoverColor)[0] :
                                borderHoverColor, borderHoverAlpha);
                        }
                        if (borderHoverThickness !== borderThickness) {
                            hoverAttr['stroke-width'] = borderHoverThickness;
                            outAttr['stroke-width'] = borderThickness;
                        }

                        bgHoverColor = pluck(point.bghovercolor, chartAttrs.dialbghovercolor,
                            chartAttrs.plotfillhovercolor, FILLMIXDARK10);
                        bgHoverAlpha = pluckNumber(point.bghoveralpha, chartAttrs.dialbghoveralpha,
                            chartAttrs.plotfillhoveralpha, bgAlpha);
                        outAttr.fill = dialFill;
                        hasHoberFillMix = /\{/.test(bgHoverColor);

                        bgHoverColor = hasHoberFillMix ? colorM.parseColorMix(bgColor,
                            bgHoverColor).join() : bgHoverColor;
                        hoverFill = {
                            FCcolor : {
                                color: bgHoverColor,
                                alpha: bgHoverAlpha,
                                angle : 90
                            }
                        };
                        hoverAttr.fill = toRaphaelColor(hoverFill);
                    }
                    // Parse data related attributed
                    rolloverProperties = point.rolloverProperties = {
                        enabled: showDialHoverEffect,
                        hasHoverSizeChange: hasHoverSizeChange,
                        hoverRadius: pluckNumber(hoverRadius * scaleFactor),
                        baseHoverWidth: pluckNumber(baseHoverWidth * scaleFactor, pivotRadius * 1.6),
                        topHoverWidth: pluckNumber(topHoverWidth * scaleFactor),
                        rearHoverExtension: pluckNumber(rearHoverExtension * scaleFactor),
                        hoverFill: hoverFill,
                        hoverAttr: hoverAttr,
                        outAttr: outAttr
                    },
                    radius = pluckNumber(radius, (Number(datasetConfig.gaugeOuterRadius) +
                        Number(datasetConfig.gaugeInnerRadius)) / 2);
                    baseWidthHF = baseWidth / 2;
                    topWidthHF = topWidth / 2;

                    //set the tooltip pos
                    point.tooltipPos = [x, y];
                    link = point.editMode ? undefined : point.link;
                    pathComand = [M, radius, -topWidthHF, L, radius, topWidthHF, -rearExtension,
                        baseWidthHF, -rearExtension, -baseWidthHF, Z];
                    if (rolloverProperties.hasHoverSizeChange) {
                        rolloverProperties.outAttr.path = pathComand;
                        hoverRadius = pluckNumber(rolloverProperties.hoverRadius, radius);
                        baseHoverWidth = rolloverProperties.baseHoverWidth;
                        baseHoverWidthHF = baseHoverWidth / 2;
                        topHoverWidth = rolloverProperties.topHoverWidth;
                        topHoverWidthHF = topHoverWidth / 2;
                        rearHoverExtension = rolloverProperties.rearHoverExtension;
                        rolloverProperties.hoverAttr.path = [M, hoverRadius, -topHoverWidthHF, L,
                            hoverRadius, topHoverWidthHF, -rearHoverExtension, baseHoverWidthHF,
                            -rearHoverExtension, -baseHoverWidthHF, Z];
                    }

                    eventArgs = {
                        link: point.link,
                        value: itemValue,
                        displayValue: displayValueArgs,
                        toolText: toolText
                    };
                    //graphics.pointers[i].remove()
                    if (!graphics.pointersTpath[i]) {
                        if (topWidth) {
                            graphics.pointersPath[i] = paper.path(pathComand, pGroup);
                            graphics.pointersTpath[i] = paper.trianglepath(0,0,0,0,0,0,0,0,0,pGroup);
                        }
                        // Render using trianglepath
                        else {
                            graphics.pointersPath[i] = paper.path(['M',0,0],pGroup);
                            graphics.pointersTpath[i] = paper.trianglepath(radius,
                                topWidthHF, -rearExtension, baseWidthHF,
                                -rearExtension, -baseWidthHF, 0, baseRadius,
                                baseRadius, pGroup);
                        }
                        freshDraw = true;
                    }
                    else {
                        if (topWidth) {
                            graphics.pointersPath[i].animateWith(dummyObj, animObj, {
                                path : pathComand
                            }, animationDuration, animType);
                            graphics.pointersTpath[i]._attr({
                                trianglepath : [0,0,0,0,0,0,0,0,0]
                            });
                        }
                        // Render using trianglepath
                        else {
                            graphics.pointersTpath[i].animateWith(dummyObj, animObj, {
                                trianglepath : [radius,
                                topWidthHF, -rearExtension, baseWidthHF,
                                -rearExtension, -baseWidthHF, 0, baseRadius,
                                baseRadius]
                            }, animationDuration, animType);
                            graphics.pointersPath[i]._attr({
                                path : 'M00'
                            });
                        }

                    }
                    // Render using path if topWidth present
                    if (topWidth) {
                        graphic = graphics.pointersPath[i];
                    } else {
                        graphic = graphics.pointersTpath[i];
                    }
                    if (!graphics.pointersPath[i]._attr) {
                        graphics.pointersPath[i]._attr = graphics.pointersPath[i].attr;
                        graphics.pointersPath[i].attr = attrFN;
                    }
                    if (!graphics.pointersTpath[i]._attr) {
                        graphics.pointersTpath[i]._attr = graphics.pointersTpath[i].attr;
                        graphics.pointersTpath[i].attr = attrFN;
                    }

                    graphic._attr({
                        fill: dialFill,
                        stroke: dialBorderColor,
                        ishot: true,
                        'stroke-width': borderThickness
                    })
                    // .hover(hoverRollOver, hoverRollOut)
                    .data(EVENTARGS, eventArgs);
                    // .data('rolloverProperties', rolloverProperties);

                    if (baseWidth || topWidth || borderThickness) {
                        graphic.shadow({apply: showShadow});
                    }


                    graphic._Attr = {
                        tooltipPos: point.tooltipPos,
                        cx: x,
                        cy: y,
                        toolTipRadius: radius - rearExtension,
                        color: point.color
                    };
                    if (freshDraw) {
                        rotation = (startAngle / deg2rad);
                        graphic.attr({
                            angle: rotation
                        });
                    }

                    point.index = i;
                    point.editMode = editMode;
                    graphic.css({
                        cursor: editMode || link ? POINTER : 'default',
                        '_cursor': editMode ? 'hand' : 'default'
                    })
                    .attr({
                        ishot: true
                    });
                    if (freshDraw) {
                        graphics.pointersPath[i].drag(dialDragHandler, dialDragStart, dialDragEnd,
                            {pos : i}, {pos : i}, {pos : i})
                        .click(clickHandler);
                        graphics.pointersTpath[i].drag(dialDragHandler, dialDragStart, dialDragEnd,
                            {pos : i}, {pos : i}, {pos : i})
                        .click(clickHandler);
                    }

                    pointConfig.y = itemValue;

                    // Rotate the dial as per the angle
                    if (itemValue >= minValue && itemValue <= maxValue) {
                        angleValue = ((itemValue - minValue) / valueRange) * angleRange;
                        rotation = (startAngle + angleValue) / deg2rad;
                        graphic.attr({
                                angle: rotation
                            }, null, animation);

                        if (showTooltip && toolText !== BLANK) {
                            graphic.tooltip(toolText);
                            graphic.trackTooltip(true);
                        } else {
                            graphic.trackTooltip(false);
                        }
                    }
                    // Draw widgets labels
                    graphicCounter += 1;

                    if (defined(displayValue) && displayValue !== BLANK) {
                        lastY = y + (isBelow ? (lineHeight / 2) + pivotRadius + 2 : -(lineHeight / 2) -
                            pivotRadius - 2);
                        labelY = valueY;
                        labelX = pluckNumber(valueX, x);
                        if (!defined(labelY)) {
                            labelY = isBelow ? lastY + (lineHeight * labelCounter) :
                                lastY - (lineHeight * labelCounter);
                        }
                        if (!graphics.dataLabel[i]) {
                            graphics.dataLabel[i] = paper.text(dataLabelsGroup)
                            .attr({
                                x: labelX,
                                y: labelY,
                                text: displayValue,
                                //'text-anchor': textHAlign[labelAlign],
                                direction: chartConfig.textDirection,
                                //title: (point.originalText || BLANK),
                                fill: style.color,
                                'text-bound': [style.backgroundColor, style.borderColor,
                                    style.borderThickness, style.borderPadding,
                                    style.borderRadius, style.borderDash]
                            })
                            .css(css)
                            .tooltip(point.originalText);
                        }
                        else {
                            graphics.dataLabel[i].attr({
                                text: displayValue,
                                title: (point.originalText || BLANK),
                                fill: style.color,
                                'text-bound': [style.backgroundColor, style.borderColor,
                                    style.borderThickness, style.borderPadding,
                                    style.borderRadius, style.borderDash]
                            })
                            .css(css)
                            .tooltip(point.originalText);
                            graphics.dataLabel[i].animateWith(dummyObj, animObj, {
                                x: labelX,
                                y: labelY
                            }, animationDuration, animType);
                        }
                        labelCounter += 1;
                    }
                }
                for (i = graphicCounter, ln = graphics.pointersPath.length; i < ln; i += 1) {
                    graphics.pointersPath[i].attr({
                        path : ['M',0,0]
                    });
                    graphics.pointersTpath[i].attr({
                        trianglepath : [0,0,0,0,0,0,0,0,0]
                    });
                }
                for (i = labelCounter, ln = graphics.dataLabel.length; i < ln; i += 1) {
                    graphics.dataLabel[i].attr({
                        text : BLANK,
                        'text-bound': []
                    });
                }
            },
            updateData: function (updateObj, draw) {
                if (updateObj === this.lastUpdatedObj) {
                    return false;
                }

                var dataSet = this,
                    chart = dataSet.chart,
                    data = dataSet.components.data,
                    label,
                    toolText,
                    showLabel,
                    dataArr = dataSet.components.data,
                    i = (dataArr && dataArr.length) || 0,
                    dataObj,
                    config,
                    updateData,
                    value,
                    animation,
                    pointObj;

                updateObj = updateObj.data;
                //use the realtime animation value or the default animation value

                if (i) {
                    while (i--) {
                        dataObj = {};
                        pointObj = {};
                        config = data[i].config;
                        updateData = updateObj[i];
                        if (!updateData) {
                            continue;
                        }
                        animation = updateData.animation || chart.get(configStr, animationObjStr);
                        value = updateData.value;
                        toolText = updateData.tooltext;
                        label = updateData.label;
                        showLabel = updateData.showlabel;
                        data[i].value = pluckNumber(value, data[i].value, 0);
                        data[i].tooltext = pluck(toolText, data[i].value);
                        data[i].displayvalue = label;
                    }

                    this.lastUpdatedObj = updateObj;
                    draw && this.draw(animation);

                    return true;
                }
            }

        },'hlineargauge']);
    }
]);

FusionCharts.register('module', ['private', 'modules.renderer.js-dataset-bulb',
    function () {
        var global = this,
            lib = global.hcLib,
            pluckNumber = lib.pluckNumber,
            pluck = lib.pluck,
            COMMASTRING = lib.COMMASTRING,
            COMMASPACE = lib.COMMASPACE,
            BLANK = lib.BLANKSTRING,
            BLANKSTRING = BLANK,
            extend2 = lib.extend2,
            toRaphaelColor = lib.toRaphaelColor,
            schedular = lib.schedular,
            getValidValue = lib.getValidValue,
            convertColor = lib.graphics.convertColor,
            getDarkColor = lib.graphics.getDarkColor,
            getLightColor = lib.graphics.getLightColor,
            preDefStr = lib.preDefStr,
            parseConfiguration = lib.parseConfiguration,
            parseUnsafeString = lib.parseUnsafeString,

            configStr = preDefStr.configStr,
            animationObjStr = preDefStr.animationObjStr,
            POSITION_TOP = preDefStr.POSITION_TOP,
            POSITION_MIDDLE = preDefStr.POSITION_MIDDLE,
            showHoverEffectStr = preDefStr.showHoverEffectStr,
            visibleStr = preDefStr.visibleStr,
            ROUND = preDefStr.ROUND,

            plotEventHandler = lib.plotEventHandler,
            ROLLOVER = 'DataPlotRollOver',
            ROLLOUT = 'DataPlotRollOut',
            FILLMIXDARK10 = '{dark-10}',
            COMPONENT = 'component',
            DATASET = 'dataset',
            EVENTARGS = 'eventArgs',
            SETROLLOVERATTR = 'setRolloverAttr',
            SETROLLOUTATTR = 'setRolloutAttr',
            POINTER = 'pointer',
            UNDEFINED,
            math = Math,
            mathMin = math.min,
            win = global.window,
            userAgent = win.navigator.userAgent,
            isIE = /msie/i.test(userAgent) && !win.opera,
            TRACKER_FILL = 'rgba(192,192,192,'+ (isIE ? 0.002 : 0.000001) +')';

        FusionCharts.register(COMPONENT, [DATASET, 'bulb', {

            pIndex : 2,

            customConfigFn : '_createDatasets',

            _manageSpace : function (availableHeight) {
                var dataSet = this,
                    conf = dataSet.config,
                    JSONData = dataSet.JSONData,
                    setDataArr = JSONData.data,
                    dataStore = dataSet.components.data,
                    setData,
                    dataObj,
                    chart = dataSet.chart,
                    chartConfig = chart.config,
                    smartLabel = chart.linkedItems.smartLabel,
                    smartDataLabel, extraSpace,
                    style = chartConfig.dataLabelStyle,
                    lineHeight = pluckNumber(parseInt(style.lineHeight, 10), 12),
                    maxAllowedHeight = availableHeight,
                    valuePadding = chartConfig.valuepadding,
                    heightUsed = 0,
                    config;

                setData = setDataArr[0];
                dataObj = dataStore[0];
                config = dataObj && dataObj.config;

                smartLabel.useEllipsesOnOverflow(chartConfig.useEllipsesWhenOverflow);
                smartLabel.setStyle(style);
                if (config && config.displayValue !== BLANKSTRING && !chartConfig.placevaluesinside) {

                    if (conf.showValue) {

                        smartDataLabel = smartLabel.getOriSize(config.displayValue);
                        //special fix for space string
                        /** @todo will be removed when smartLabel will be able to handle it */
                        if (config.displayValue === BLANK) {
                            smartDataLabel = {
                                height : lineHeight
                            };
                        }

                        if (smartDataLabel.height > 0) {
                            heightUsed = smartDataLabel.height + valuePadding;
                        }

                        if (heightUsed > maxAllowedHeight) {
                            extraSpace = heightUsed - maxAllowedHeight;
                            heightUsed = maxAllowedHeight;
                        }
                    }
                }

                conf.heightUsed = heightUsed;
                return {
                    top : 0,
                    bottom : heightUsed
                };
            },

            configure : function() {
                var dataSet = this,
                    JSONData = dataSet.JSONData,
                    userConfig = extend2({}, JSONData),
                    chart = dataSet.chart,
                    conf = dataSet.config,
                    chartConfig = chart.config,
                    chartAttr = chart.jsonData.chart,
                    is3D = pluckNumber(chartAttr.is3d, 1),
                    showTooltip = pluckNumber(chartAttr.showtooltip, 1),
                    enableAnimation;

                dataSet.__setDefaultConfig();
                parseConfiguration(userConfig, conf, chart.config, { data: true});

                is3D = pluckNumber(chartAttr.is3d, 1);

                // conf.autoScale = pluckNumber(chartAttr.autoscale, 1);

                conf.origW = pluckNumber(chartAttr.origw, chartConfig.autoscale ?
                    chart.origRenderWidth : chartConfig.width || chart.origRenderWidth);
                conf.origH = pluckNumber(chartAttr.origh, chartConfig.autoscale ?
                    chart.origRenderHeight : chartConfig.height || chart.origRenderHeight);

                showTooltip = pluckNumber(chartAttr.showtooltip, 1);
                conf.setToolText = getValidValue(parseUnsafeString(pluck(chartAttr.plottooltext, UNDEFINED)));
                conf.useColorNameAsValue = pluckNumber(chartAttr.usecolornameasvalue, 0);
                conf.enableAnimation = enableAnimation = pluckNumber(chartAttr.animation,
                    chartAttr.defaultanimation, 1);
                conf.animation = !enableAnimation ? false : {
                    duration: pluckNumber(chartAttr.animationduration, 1) * 1000
                };
                conf.showValue = pluckNumber(chartAttr.showvalue, 1);

                dataSet._setConfigure();
            },

            /*
             * Function for parsing all the attributes and value given by the user at set level.
             * This function is called once from the configure() function of the Column class.
             */
            _setConfigure : function (newDataset) {
                var dataSet = this,
                    chart = dataSet.chart,
                    conf = dataSet.config,
                    chartConfig = chart.config,
                    JSONData = dataSet.JSONData,
                    setDataArr = newDataset || JSONData.data,
                    setDataLen = setDataArr && setDataArr.length,
                    components = chart.components,
                    len = (newDataset && newDataset.data.length) || setDataLen,
                    chartAttr = chart.jsonData.chart,
                    colorM = components.colorManager,
                    showTooltip = pluckNumber(chartAttr.showtooltip, 1),
                    parseUnsafeString = lib.parseUnsafeString,
                    tooltipSepChar = parseUnsafeString(pluck(chartAttr.tooltipsepchar, COMMASPACE)),
                    parseTooltext = lib.parseTooltext,
                    formatedVal,
                    tempPlotfillAngle,
                    toolText,
                    showHoverEffect = chartConfig.showhovereffect,
                    plotfillAngle = conf.plotFillAngle,
                    dataStore = dataSet.components.data,
                    setData,
                    setValue,
                    dataObj,
                    config,
                    label,
                    setDisplayValue,
                    is3D = pluckNumber(chartAttr.is3d, 1),
                    i,
                    numberFormatter = chart.components.numberFormatter,
                    colorRangeGetter,
                    colorCodeObj,
                    gaugeFillAlpha,
                    colorName,
                    gaugeBorderColorCode,
                    gaugeBorderAlpha,
                    hasGaugeBorderMix,
                    fillColor,
                    gaugeBorderColor,
                    gaugeBorderThickness,
                    gaugeFillHoverColor,
                    gaugeFillHoverAlpha,
                    showGaugeBorderOnHover,
                    gaugeBorderHoverColor,
                    gaugeBorderHoverAlpha,
                    gaugeBorderHoverThickness,
                    is3DOnHover,
                    showHoverAnimation,
                    hasHoberFillMix,
                    hasBorderHoverMix,
                    isLabelString,
                    displayValue,
                    getPointColor = function (color, alpha, is3d) {
                        if (!is3d) {
                            return convertColor(color, alpha);
                        }
                        return {
                            FCcolor : {
                                cx: 0.4,
                                cy: 0.4,
                                r: '80%',
                                color :  getLightColor(color, 65) + COMMASTRING + getLightColor(color, 75) +
                                 COMMASTRING + getDarkColor(color, 65),
                                alpha : alpha + COMMASTRING + alpha + COMMASTRING + alpha,
                                ratio : '0,30,70', //BGRATIOSTRING,
                                radialGradient : true
                            }
                        };
                    },
                    hoverAttr,
                    hoverAnimAttr,
                    outAttr;

                if (!dataStore) {
                    dataStore = dataSet.components.data = [];
                }

                // Parsing the attributes and values at set level.
                for (i = 0; i < len; i++) {

                    if (newDataset) {
                        setData = (newDataset && newDataset.data[i]);
                    }
                    else {
                        setData = setDataArr[i];
                    }

                    dataObj = dataStore[i];

                    config = dataObj && dataObj.config;

                    if (!dataObj) {
                        dataObj = dataStore[i] = {};
                    }

                    if (!dataObj.config) {
                        config = dataStore[i].config = {};

                    }
                    config.setValue = setValue = numberFormatter.getCleanValue(setData.value) || 0;
                    formatedVal = numberFormatter.dataLabels(setValue);
                    setDisplayValue = getValidValue(parseUnsafeString(setData.displayvalue));
                    config.colorRangeGetter = colorRangeGetter = chart.components.colorRange;
                    colorCodeObj = colorRangeGetter.getColorObj(config.setValue);
                    colorCodeObj = colorCodeObj.colorObj || colorCodeObj.prevObj || colorCodeObj.nextObj;
                    gaugeFillAlpha = pluckNumber(chartAttr.gaugefillalpha, colorCodeObj.alpha, 100);
                    colorName = parseUnsafeString(pluck(colorCodeObj.label, colorCodeObj.name)),
                    gaugeBorderColorCode = pluck(colorCodeObj.bordercolor,
                        chartAttr.gaugebordercolor, getDarkColor(colorCodeObj.code, 70));
                    gaugeBorderAlpha =  pluckNumber(colorCodeObj.borderalpha,
                        chartAttr.gaugeborderalpha, '90') * gaugeFillAlpha / 100,
                    hasGaugeBorderMix = /\{/.test(gaugeBorderColorCode);
                    gaugeBorderColorCode = hasGaugeBorderMix ? colorM.parseColorMix(pluck(colorCodeObj.bordercolor,
                        colorCodeObj.code),
                        gaugeBorderColorCode)[0] : gaugeBorderColorCode;
                    config.gaugeBorderColor = gaugeBorderColor = convertColor(gaugeBorderColorCode, gaugeBorderAlpha);
                    config.gaugeBorderThickness = gaugeBorderThickness =
                        chartConfig.showgaugeborder ? pluckNumber(chartAttr.gaugeborderthickness, 1) : 0,
                    config.fillColor = fillColor = getPointColor(colorCodeObj.code, gaugeFillAlpha, is3D);

                    if (showHoverEffect !== 0 && (showHoverEffect || chartAttr.gaugefillhovercolor ||
                            chartAttr.plotfillhovercolor || chartAttr.gaugefillhoveralpha ||
                                chartAttr.plotfillhoveralpha || chartAttr.gaugefillhoveralpha === 0 ||
                            chartAttr.is3donhover || chartAttr.is3donhover === 0 || chartAttr.showgaugeborderonhover ||
                            chartAttr.showgaugeborderonhover === 0 || chartAttr.gaugeborderhovercolor ||
                            chartAttr.gaugeborderhoveralpha || chartAttr.gaugeborderhoveralpha === 0 ||
                            chartAttr.gaugeborderhoverthickness || chartAttr.gaugeborderhoverthickness === 0)) {
                        showHoverEffect = true;
                        gaugeFillHoverColor = pluck(chartAttr.gaugefillhovercolor,
                            chartAttr.plotfillhovercolor, FILLMIXDARK10);
                        gaugeFillHoverAlpha = pluckNumber(chartAttr.gaugefillhoveralpha, chartAttr.plotfillhoveralpha);
                        showGaugeBorderOnHover = pluckNumber(chartAttr.showgaugeborderonhover);
                        if (showGaugeBorderOnHover === undefined) {
                            if (chartAttr.gaugeborderhovercolor || chartAttr.gaugeborderhoveralpha ||
                                    chartAttr.gaugeborderhoveralpha === 0|| chartAttr.gaugeborderhoverthickness ||
                                    chartAttr.gaugeborderhoverthickness === 0) {
                                showGaugeBorderOnHover = 1;
                            }
                            else {
                                showGaugeBorderOnHover = chartConfig.showgaugeborder;
                            }
                        }
                        gaugeBorderHoverColor = pluck(chartAttr.gaugeborderhovercolor, FILLMIXDARK10);
                        gaugeBorderHoverAlpha = pluckNumber(chartAttr.gaugeborderhoveralpha);
                        gaugeBorderHoverThickness =
                            showGaugeBorderOnHover ? pluckNumber(chartAttr.gaugeborderhoverthickness,
                            gaugeBorderThickness || 1) : 0;
                        is3DOnHover = !!pluckNumber(chartAttr.is3donhover, is3D);
                        showHoverAnimation = !!pluckNumber(chartAttr.showhoveranimation, 1);
                        hoverAttr = {};
                        outAttr = {};
                        if (gaugeBorderThickness !== gaugeBorderHoverThickness) {
                            hoverAttr['stroke-width'] = gaugeBorderHoverThickness;
                            outAttr['stroke-width'] = gaugeBorderThickness;
                        }
                        outAttr.fill = toRaphaelColor(fillColor);
                        hasHoberFillMix = /\{/.test(gaugeFillHoverColor);
                        gaugeFillHoverColor = hasHoberFillMix ? colorM.parseColorMix(colorCodeObj.code,
                            gaugeFillHoverColor)[0] : pluck(gaugeFillHoverColor, colorCodeObj.code);
                        hoverAttr.fill = toRaphaelColor(getPointColor(gaugeFillHoverColor,
                            pluckNumber(gaugeFillHoverAlpha, gaugeFillAlpha), is3DOnHover));
                        if (gaugeBorderHoverThickness) {
                            outAttr.stroke = gaugeBorderColor;
                            hasBorderHoverMix = /\{/.test(gaugeBorderHoverColor);
                            hoverAttr.stroke = convertColor(hasBorderHoverMix ? colorM.parseColorMix(hasGaugeBorderMix ?
                                gaugeFillHoverColor : gaugeBorderColorCode, gaugeBorderHoverColor)[0] :
                                gaugeBorderHoverColor, pluckNumber(gaugeBorderHoverAlpha, gaugeBorderAlpha));
                        }
                    }
                    config.setTooltext = lib.getValidValue(parseUnsafeString(pluck(setData.tooltext,
                           JSONData.plottooltext, chartAttr.plottooltext)));

                    if (!showTooltip) {
                        toolText = false;
                    }
                    else if (config.setTooltext !== undefined) {
                        toolText = parseTooltext(config.setTooltext, [1,2], {
                            formattedValue: formatedVal
                        }, setData, chartAttr);
                        isLabelString = true;
                    }
                    // Determine the dispalay value then
                    else {
                        toolText = conf.useColorNameAsValue ? colorName : (formatedVal === null ? false :
                        (label !== undefined) ? label + tooltipSepChar +
                        formatedVal : formatedVal);
                    }
                    // Create the displayvalue
                    if (setDisplayValue !== undefined) {
                        displayValue = setDisplayValue;
                    }
                    // Determine the dispalay value then
                    else {
                        displayValue = setData.label || (conf.useColorNameAsValue ? colorName : formatedVal);
                    }
                    config.toolText = toolText;
                    config.displayValue = displayValue;
                    config.rolloverProperties = {
                        enabled: showHoverEffect,
                        hoverAttr: hoverAttr,
                        hoverAnimAttr: hoverAnimAttr,
                        outAttr: outAttr
                    };
                    tempPlotfillAngle && (plotfillAngle = tempPlotfillAngle);
                }
            },

            init : function(datasetJSON) {
                var dataSet = this,
                    chart = dataSet.chart;
                if (!datasetJSON) {
                    return false;
                }
                dataSet.JSONData = datasetJSON;
                dataSet.chartGraphics = chart.chartGraphics;
                dataSet.components = {
                };
                dataSet.graphics = {
                };
                dataSet.visible = true;
                dataSet.configure();
            },

            updateData : function (dataObj, index, draw) {
                var dataSet = this;

                dataSet._setConfigure(dataObj, index);

                if (draw) {
                    dataSet.draw();
                }
            },

            draw: function() {
                var dataSet = this,
                    dataStore = dataSet.components.data,
                    chart = dataSet.chart,
                    conf = dataSet.config,
                    jobList = chart.getJobList(),
                    animationObj = chart.get(configStr, animationObjStr),
                    animType = animationObj.animType,
                    animObj = animationObj.animObj,
                    dummyObj = animationObj.dummyObj,
                    animationDuration = animationObj.duration,

                    chartConfig = chart.config,
                    canvasLeft = chartConfig.canvasLeft,
                    canvasTop = chartConfig.canvasTop,
                    canvasHeight = chartConfig.canvasHeight,
                    canvasWidth = chartConfig.canvasWidth,
                    paper = chart.components.paper,
                    parentContainer = chart.graphics.datasetGroup,
                    container = dataSet.graphics.container,
                    trackerContainer = dataSet.graphics.trackerContainer,
                    layers = chart.graphics,
                    trackerLayer = layers.trackerGroup,
                    setValue,
                    attr,
                    toolText,
                    // eventArgs,
                    xPos,
                    yPos,
                    radius,
                    bulb,
                    // hotElement,
                    dataObj = dataStore[0],
                    graphic,
                    config = dataObj && dataObj.config,
                    gaugeOriginX = chartConfig.gaugeoriginx,
                    gaugeOriginY = chartConfig.gaugeoriginy,
                    gaugeRadius = chartConfig.gaugeradius,
                    hasGaugeOriginX = chartConfig.hasgaugeoriginx,
                    hasGaugeOriginY = chartConfig.hasgaugeoriginy,
                    hasGaugeRadius = chartConfig.hasgaugeradius,
                    labelY,
                    vAlign,
                    dataLabelContainer = dataSet.graphics.dataLabelContainer,
                    style = chart.config.dataLabelStyle,
                    dataLabelsLayer =  layers.datalabelsGroup,
                    // isNewElement = false,
                    trackerConfig;
                    // css = {
                    //     fontFamily: style.fontFamily,
                    //     fontSize: style.fontSize,
                    //     lineHeight: style.lineHeight,
                    //     fontWeight: style.fontWeight,
                    //     fontStyle: style.fontStyle
                    // };

                if (!container) {
                    container = dataSet.graphics.container = paper.group('bulb', parentContainer);
                }
                if (!trackerContainer) {
                    trackerContainer = dataSet.graphics.trackerContainer = paper.group('bulb-hot', trackerLayer);
                }

                // Creating the datalabel container if not created
                if (!dataLabelContainer) {
                    dataLabelContainer = dataSet.graphics.dataLabelContainer = paper.group('datalabel');
                }

                // Append the container to datalabelslayer
                if (dataLabelsLayer) {
                    dataLabelsLayer.appendChild(dataLabelContainer);
                }
                trackerConfig = dataObj.trackerConfig = {};
                setValue = config.setValue;
                toolText = config.toolText;
                trackerConfig.eventArgs = {
                    value: setValue,
                    displayValue: config.displayValue,
                    toolText: !toolText ? '' : toolText
                };
                if (!dataObj.graphics) {
                    dataObj.graphics = {};
                }
                gaugeOriginX = hasGaugeOriginX !== UNDEFINED ? (gaugeOriginX * conf.scaleFactor) :
                    canvasLeft + (canvasWidth / 2);
                // (hasGaugeOriginX !== UNDEFINED) && (gaugeOriginX *= conf.scaleFactor);
                gaugeOriginY = hasGaugeOriginY !== UNDEFINED ? (gaugeOriginY * conf.scaleFactor) :
                    canvasTop + (canvasHeight / 2);
                // (hasGaugeOriginY !== UNDEFINED) && (gaugeOriginY *= conf.scaleFactor);
                xPos = gaugeOriginX;
                yPos = gaugeOriginY;
                radius = hasGaugeRadius !== UNDEFINED ? (gaugeRadius * conf.scaleFactor) :
                    mathMin(canvasWidth / 2, canvasHeight / 2);
                // (hasGaugeRadius !== UNDEFINED) && (radius *= conf.scaleFactor);

                //Setting macros for annotation
                chartConfig.gaugeStartX = gaugeOriginX - radius;
                chartConfig.gaugeEndX = gaugeOriginX + radius;
                chartConfig.gaugeStartY = gaugeOriginY - radius;
                chartConfig.gaugeEndY = gaugeOriginY + radius;
                chartConfig.gaugeCenterX = gaugeOriginX;
                chartConfig.gaugeCenterY = gaugeOriginY;
                chartConfig.gaugeRadius = radius;

                attr = {
                    cx: xPos,
                    cy: yPos,
                    r: 0.001,
                    'stroke-linecap': ROUND,
                    stroke: toRaphaelColor(config.gaugeBorderColor),
                    'stroke-width': config.gaugeBorderThickness,
                    fill : toRaphaelColor(config.fillColor),
                    ishot: true
                };
                bulb = dataObj.graphics.element;
                if (!bulb) {
                    bulb = dataObj.graphics.element = paper.circle(attr, container);
                    bulb.animateWith(dummyObj, animObj, {
                        r: radius
                    }, animationDuration, animType);
                }
                else {

                    dataObj.graphics.element.animateWith(dummyObj, animObj, {
                        cx: xPos,
                        cy: yPos,
                        r: radius
                    }, animationDuration, animType);

                    bulb = dataObj.graphics.element.attr({
                        'stroke-linecap': ROUND,
                        stroke: toRaphaelColor(config.gaugeBorderColor),
                        'stroke-width': config.gaugeBorderThickness,
                        fill : toRaphaelColor(config.fillColor),
                        ishot: true
                    });
                }

                trackerConfig.attr = {
                    cx: xPos,
                    cy: yPos,
                    r: radius,
                    cursor: config.setLink ? POINTER : BLANK,
                    stroke: TRACKER_FILL,
                    'stroke-width': config.plotBorderThickness,
                    fill: TRACKER_FILL,
                    ishot: true,
                    visibility: visibleStr
                };
                /*
                 * If the tooltips are not present then they are created over the hot element,
                 * else only attributes are set for the existing tooltips.
                 */
                // hotElement = dataObj.graphics.hotElement;
                // if (!hotElement) {
                //     hotElement = dataObj.graphics.hotElement = paper.circle(attr, trackerContainer);
                //     isNewElement = true;
                // }
                // else {
                //     hotElement = dataObj.graphics.hotElement.attr(attr);
                // }

                // hotElement
                //     .data(EVENTARGS, eventArgs)
                //     .data(SETROLLOVERATTR, rolloverProperties.hoverAttr)
                //     .data(SETROLLOUTATTR, rolloverProperties.outAttr)
                //     .tooltip(toolText);

                // if (isNewElement) {
                //     hotElement
                //         .click(clickFunc)
                //         .hover(
                //             rolloverResponseSetter(bulb),
                //             rolloutResponseSetter(bulb)
                //         );
                // }

                graphic = dataObj.graphics;

                if (!chartConfig.placevaluesinside) {
                    labelY = yPos + radius + chartConfig.valuepadding /*- chartConfig.borderWidth*/;
                    vAlign = POSITION_TOP;
                } else {
                    labelY = yPos;
                    vAlign = POSITION_MIDDLE;
                }
                if ((config.setValue !== BLANKSTRING) && conf.showValue) {
                    attr = {
                        text: config.displayValue,
                        'text-anchor': POSITION_MIDDLE,
                        x: gaugeOriginX,
                        y: labelY,
                        //title: (bulbProperties.originalText || BLANK),
                        'vertical-align': vAlign,
                        fill: style.color,
                        direction: config.textDirection,
                        'text-bound': [style.backgroundColor, style.borderColor,
                            style.borderThickness, style.borderPadding,
                            style.borderRadius, style.borderDash]
                    };

                    if (!graphic.label) {
                        graphic.label = paper.text(attr, dataLabelContainer);
                    }
                    else {
                        graphic.label.show();

                        graphic.label.animateWith(dummyObj, animObj, {
                            x: gaugeOriginX,
                            y: labelY
                        }, animationDuration, animType);

                        graphic.label.attr({
                                text: config.displayValue,
                                'text-anchor': POSITION_MIDDLE,
                                'vertical-align': vAlign,
                                fill: style.color,
                                direction: config.textDirection,
                                'text-bound': [style.backgroundColor, style.borderColor,
                                    style.borderThickness, style.borderPadding,
                                    style.borderRadius, style.borderDash]
                            });
                    }
                    graphic.label
                        // .css(css)
                        .tooltip(toolText);
                }
                else {
                    graphic.label && graphic.label.hide() &&
                        graphic.label.attr({'text-bound': []});
                }
                jobList.trackerDrawID.push(schedular.addJob(dataSet.drawTracker, dataSet, [],
                       lib.priorityList.tracker));
            },

            drawTracker : function () {
                var dataSet = this,
                    chart = dataSet.chart,
                    components = dataSet.components,
                    dataStore = components.data,
                    chartConfig = chart.config,
                    showHoverEffect = chartConfig.plothovereffect,
                    chartComponents = chart.components,
                    paper = chartComponents.paper,
                    trackerContainer = dataSet.graphics.trackerContainer,
                    trackerConfig,
                    config,
                    dataObj,
                    setElement,
                    hotElemCreated,
                    hotElement,
                    attr,
                    //Fired when clicked over the hot elements.
                    clickFunc = function (setDataArr) {
                        var ele = this;
                        plotEventHandler.call(ele, chart, setDataArr);
                    },
                    //Fired on mouse-in over the hot elements.
                    rolloverResponseSetter = function (elem) {
                        return function (data) {
                            var ele = this,
                                elData = ele.getData();
                            // Check whether the plot is in dragged state or not if
                            // drag then dont fire rolloverevent
                            if (elData.showHoverEffect !== 0 && elData.draged !== true) {
                                elem.attr(ele.getData().setRolloverAttr);
                                plotEventHandler.call(ele, chart, data, ROLLOVER);
                            }
                        };
                    },

                    //Fired on mouse-out over the hot elements.
                    rolloutResponseSetter = function (elem) {
                        return function (data) {
                            var ele = this,
                                elData = ele.getData();
                            // Check whether the plot is in draggedstate or not if drag then dont fire rolloutevent
                            if (elData.showHoverEffect !== 0 && elData.draged !== true) {
                                elem.attr(ele.getData().setRolloutAttr);
                                plotEventHandler.call(ele, chart, data, ROLLOUT);
                            }
                        };
                    };

                // Create tracker elements.
                dataObj = dataStore[0];
                config = dataObj && dataObj.config;
                trackerConfig = dataObj.trackerConfig;
                setElement = dataObj.graphics.element;
                if (attr = trackerConfig.attr) {
                    /*
                     * If the tooltips are not present then they are created over the hot element,
                     * else only attributes are set for the existing tooltips.
                     */
                    if (!dataObj.graphics.hotElement) {
                        hotElement = dataObj.graphics.hotElement = paper.circle(attr, trackerContainer);
                        hotElemCreated = true;
                    }
                    else {
                        dataObj.graphics.hotElement.attr(attr);
                        hotElemCreated = false;
                    }

                    hotElement = dataObj.graphics.hotElement;

                    // Hover effects and click function is binded to the hot element if present else the set element.
                    (hotElement || setElement)
                        .data(EVENTARGS, trackerConfig.eventArgs)
                        .data(showHoverEffectStr, showHoverEffect)
                        .data(SETROLLOVERATTR, config.rolloverProperties.hoverAttr || {})
                        .data(SETROLLOUTATTR, config.rolloverProperties.outAttr || {})
                        .tooltip(trackerConfig.eventArgs.toolText);

                    if (hotElemCreated || config.elemCreated) {
                        (hotElement || setElement)
                        .click(clickFunc)
                        .hover(
                            rolloverResponseSetter(setElement),
                            rolloutResponseSetter(setElement)
                        );
                    }
                }

            },

            addData : function() {
            },

            removeData : function() {
            }
        }, UNDEFINED, {

        }]);

    }]);

FusionCharts.register('module', ['private', 'modules.renderer.js-dataset-progressgauge',
    function() {
        var global = this,
            lib = global.hcLib,
            //strings
            BLANK = lib.BLANKSTRING,
            //add the tools thats are requared
            pluck = lib.pluck,
            getValidValue = lib.getValidValue,
            pluckNumber = lib.pluckNumber,
            getFirstValue = lib.getFirstValue,
            getLightColor = lib.graphics.getLightColor,
            convertColor = lib.graphics.convertColor,
            preDefStr = lib.preDefStr,
            colorStrings = preDefStr.colors,
            COLOR_FFFFFF = colorStrings.FFFFFF,
            visibleStr = preDefStr.visibleStr,
            ROUND = preDefStr.ROUND,
            noneStr = 'none',
            parseUnsafeString = lib.parseUnsafeString,
            win = global.window,
            userAgent = win.navigator.userAgent,
            isIE = /msie/i.test(userAgent) && !win.opera,
            TRACKER_FILL = 'rgba(192,192,192,' + (isIE ? 0.002 : 0.000001) + ')',
            // doc = win.document,
            math = Math,
            mathMax = math.max,
            mathMin = math.min,
            dropHash = lib.regex.dropHash,
            // isArray = lib.isArray,
            PLOTBORDERCOLOR = 'plotBorderColor',
            PLOTGRADIENTCOLOR = 'plotGradientColor',
            SHOWSHADOW = 'showShadow',
            POINTER = 'pointer',
            EVENTARGS = 'eventArgs',
            GROUPID = 'groupId',
            COMPONENT = 'component',
            DATASET = 'dataset',
            HASHSTRING = lib.HASHSTRING,
            toRaphaelColor = lib.toRaphaelColor,
            UNDEFINED,
            HUNDREDSTRING = lib.HUNDREDSTRING,
            COMMASPACE = lib.COMMASPACE,
            COMMASTRING = lib.COMMASTRING;

        FusionCharts.register(COMPONENT, [DATASET, 'progressgauge', {
            type: 'doughnut2d',

            configure: function() {
                var dataSet = this,
                    chart = dataSet.chart,
                    //logic = chart.logic,
                    conf = dataSet.config,
                    //fcJSON = dataSet.fcJSON,
                    JSONData = dataSet.JSONData,
                    chartConfig = chart.config,
                    chartAttr = chart.jsonData.chart,
                    colorM = chart.components.colorManager,
                    index = dataSet.index || dataSet.positionIndex,
                    showplotborder,
                    plotColor = conf.plotColor = colorM.getPlotColor(index),
                    plotBorderDash = pluckNumber(JSONData.dashed, chartAttr.plotborderdashed),
                    usePlotGradientColor = pluckNumber(chartAttr.useplotgradientcolor, 1),
                    plotDashLen,
                    plotDashGap,
                    plotBorderThickness,
                    isRoundEdges,
                    showHoverEffect,
                    plotfillAngle,
                    plotFillAlpha,
                    plotRadius,
                    plotFillRatio,
                    plotgradientcolor,
                    plotBorderAlpha,
                    plotBorderColor,
                    initailPlotBorderDashStyle,
                    getDashStyle = lib.getDashStyle,
                    definedGroupPadding,
                    isBar = chart.isBar,
                    is3D = chart.is3D,
                    isStacked = chart.isStacked,
                    stack100Percent,
                    enableAnimation,
                    parentYAxis,
                    reflowData = /*logic.chartInstance.jsVars._reflowData*/ {},
                    reflowDataObj = reflowData.dataObj || (reflowData.dataObj = {}),
                    reflowChartObj = reflowDataObj.chart || (reflowDataObj.chart = {});
                conf.showLegend = pluckNumber(chartAttr.showlegend, 0);
                conf.legendSymbolColor = conf.plotColor;
                showplotborder = conf.showplotborder = pluckNumber(chartAttr.showplotborder, is3D ? 0 : 1);
                conf.plotDashLen = plotDashLen = pluckNumber(chartAttr.plotborderdashlen, 5);
                conf.plotDashGap = plotDashGap = pluckNumber(chartAttr.plotborderdashgap, 4);
                conf.plotfillAngle = plotfillAngle = pluckNumber(360 - chartAttr.plotfillangle,
                    (isBar ? 180 : 90));
                conf.plotFillAlpha = plotFillAlpha = pluck(JSONData.alpha, chartAttr.plotfillalpha, '70');
                conf.plotColor = plotColor = pluck(JSONData.color, plotColor);
                conf.isRoundEdges = isRoundEdges = pluckNumber(chartAttr.useroundedges, 0);
                conf.plotRadius = plotRadius = pluckNumber(chartAttr.useRoundEdges, conf.isRoundEdges ? 1 : 0);
                conf.plotFillRatio = plotFillRatio = pluck(JSONData.ratio, chartAttr.plotfillratio);
                conf.plotgradientcolor = plotgradientcolor = lib.getDefinedColor(chartAttr.plotgradientcolor,
                    colorM.getColor(PLOTGRADIENTCOLOR));
                !usePlotGradientColor && (plotgradientcolor = BLANK);
                conf.plotBorderAlpha = plotBorderAlpha = showplotborder ? pluck(chartAttr.plotborderalpha,
                    plotFillAlpha, HUNDREDSTRING) : 0;
                conf.plotBorderColor = plotBorderColor = pluck(chartAttr.plotbordercolor,
                    is3D ? COLOR_FFFFFF : colorM.getColor(PLOTBORDERCOLOR));
                conf.plotBorderThickness = plotBorderThickness = pluckNumber(chartAttr.plotborderthickness, 1);
                conf.plotBorderDashStyle = initailPlotBorderDashStyle = plotBorderDash ?
                    getDashStyle(plotDashLen, plotDashGap, plotBorderThickness) : noneStr;
                conf.showValues = pluckNumber(JSONData.showvalues, chartAttr.showvalues, 1);
                conf.valuePadding = pluckNumber(chartAttr.valuepadding, 2);
                conf.enableAnimation = enableAnimation = pluckNumber(chartAttr.animation,
                    chartAttr.defaultanimation, 1);
                conf.animation = !enableAnimation ? false : {
                    duration: pluckNumber(chartAttr.animationduration, 1) * 1000
                };
                reflowChartObj.transposeAnimation = conf.transposeAnimation =
                    pluckNumber(chartAttr.transposeanimation, reflowChartObj.transposeAnimation, enableAnimation);
                conf.transposeAnimDuration = pluckNumber(chartAttr.transposeanimduration, 1) * 700;

                conf.showShadow = (isRoundEdges || is3D) ? pluckNumber(chartAttr.showshadow, 1) :
                    pluckNumber(chartAttr.showshadow, colorM.getColor(SHOWSHADOW));
                conf.showHoverEffect = showHoverEffect = pluckNumber(chartAttr.plothovereffect,
                    chartAttr.showhovereffect, UNDEFINED);
                conf.showTooltip = pluckNumber(chartAttr.showtooltip, 1);
                conf.stack100Percent = stack100Percent =
                    pluckNumber(chart.stack100percent, chartAttr.stack100percent, 0);
                conf.definedGroupPadding = definedGroupPadding =
                    mathMax(pluckNumber(chartAttr.plotspacepercent), 0);
                conf.plotSpacePercent = mathMax(pluckNumber(chartAttr.plotspacepercent, 20) % 100, 0);
                conf.maxColWidth = pluckNumber(isBar ? chartAttr.maxbarheight : chartAttr.maxcolwidth, 50);
                conf.showPercentValues = pluckNumber(chartAttr.showpercentvalues, (isStacked && stack100Percent) ?
                    1 : 0);
                conf.showPercentInToolTip = pluckNumber(chartAttr.showpercentintooltip,
                    (isStacked && stack100Percent) ? 1 : 0);
                conf.plotPaddingPercent = pluckNumber(chartAttr.plotpaddingpercent),
                    conf.rotateValues = pluckNumber(chartAttr.rotatevalues) ? 270 : 0;
                conf.placeValuesInside = pluckNumber(chartAttr.placevaluesinside, 0);
                conf.zeroPlaneColor = chartConfig.zeroPlaneColor;
                conf.zeroPlaneBorderColor = chartConfig.zeroPlaneBorderColor;
                conf.zeroPlaneShowBorder = chartConfig.zeroPlaneShowBorder;

                conf.use3DLighting = pluckNumber(chartAttr.use3dlighting, 1);
                conf.parentYAxis = parentYAxis = pluck(JSONData.parentyaxis && JSONData.parentyaxis.toLowerCase(),
                    'p') === 's' ? 1 : 0;

                dataSet._setConfigure();
            },

            _setConfigure: function(newDataset, newIndex) {
                var dataSet = this,
                    chart = dataSet.chart,
                    conf = dataSet.config,
                    JSONData = dataSet.JSONData,
                    setDataArr = newDataset || JSONData.data,
                    setDataLen = setDataArr && setDataArr.length,
                    categories = chart.config.categories,
                    singleSeries = chart.singleseries,
                    catLen = categories && categories.length,
                    len = (newDataset && newDataset.data.length) || mathMin(catLen, setDataLen),
                    chartAttr = chart.jsonData.chart,
                    components = chart.components,
                    colorM = components.colorManager,
                    // xAxis = components.xAxis[0],
                    index = dataSet.index || dataSet.positionIndex,
                    showplotborder = conf.showPlotBorder,
                    plotColor = conf.plotColor = colorM.getPlotColor(index),
                    //plotBorderDash = pluckNumber(JSONData.dashed, chartAttr.plotborderdashed),
                    //usePlotGradientColor = pluckNumber(chartAttr.useplotgradientcolor, 1),
                    showTooltip = pluckNumber(chartAttr.showtooltip, 1),
                    parseUnsafeString = lib.parseUnsafeString,
                    yAxisName = parseUnsafeString(chartAttr.yaxisname),
                    xAxisName = parseUnsafeString(chartAttr.xaxisname),
                    tooltipSepChar = parseUnsafeString(pluck(chartAttr.tooltipsepchar, COMMASPACE)),
                    seriesNameInTooltip = pluckNumber(chartAttr.seriesnameintooltip, 1),
                    parseTooltext = lib.parseTooltext,
                    formatedVal,
                    parserConfig,
                    setTooltext,
                    seriesname,
                    macroIndices,
                    tempPlotfillAngle,
                    toolText,
                    plotDashLen,
                    plotDashGap,
                    plotBorderThickness = conf.plotBorderThickness,
                    isRoundEdges = conf.isRoundEdges,
                    showHoverEffect = conf.showHoverEffect,
                    plotfillAngle = conf.plotFillAngle,
                    plotFillAlpha,
                    //plotRadius,
                    plotFillRatio,
                    //plotgradientcolor,
                    plotBorderAlpha,
                    plotBorderDashStyle,
                    initailPlotBorderDashStyle = conf.plotBorderDashStyle,
                    setData,
                    setValue,
                    dataObj,
                    config,
                    label,
                    colorArr,
                    hoverColor,
                    hoverAlpha,
                    hoverGradientColor,
                    hoverRatio,
                    hoverAngle,
                    hoverBorderColor,
                    hoverBorderAlpha,
                    hoverBorderThickness,
                    hoverBorderDashed,
                    hoverBorderDashGap,
                    hoverBorderDashLen,
                    hoverDashStyle,
                    hoverColorArr,
                    getDashStyle = lib.getDashStyle,
                    dataStore = dataSet.components.data,
                    toolTipValue,
                    setDisplayValue,
                    //definedGroupPadding,
                    isBar = chart.isBar,
                    is3D = chart.is3D,
                    //isStacked = chart.isStacked,
                    //stack100Percent,
                    //enableAnimation,
                    setDataDashed,
                    setDataPlotDashLen,
                    setDataPlotDashGap,
                    i,
                    maxValue = conf.maxValue || -Infinity,
                    minValue = conf.minValue || +Infinity,
                    numberFormatter = dataSet.chart.components.numberFormatter,
                    tempIndex;

                if (!dataStore) {
                    dataStore = dataSet.components.data = [];
                }

                // Parsing the attributes and values at set level.
                for (i = 0; i < len; i++) {

                    if (newDataset) {
                        setData = (newDataset && newDataset.data[i]);

                        if (newIndex !== undefined) {
                            tempIndex = newIndex + i;
                            dataObj = dataStore[tempIndex];
                        } else {
                            tempIndex = dataStore.length - len + i;
                            dataObj = dataStore[tempIndex];
                        }
                    } else {

                        dataObj = dataStore[i];
                        setData = setDataArr[i];
                    }


                    config = dataObj && dataObj.config;

                    if (!dataObj) {
                        dataObj = dataStore[i] = {};
                    }

                    if (!dataObj.config) {
                        config = dataStore[i].config = {};

                    }
                    config.visible = pluckNumber(setData.visible, true);
                    config.showValue = pluckNumber(setData.showvalue, conf.showValues);
                    config.setValue = setValue = numberFormatter.getCleanValue(setData.value);
                    config.setLink = pluck(setData.link);
                    config.toolTipValue = toolTipValue = numberFormatter.dataLabels(setValue, conf.parentYAxis);
                    config.setDisplayValue = setDisplayValue = parseUnsafeString(setData.displayvalue);
                    config.displayValue = pluck(setDisplayValue, toolTipValue);
                    setDataDashed = pluckNumber(setData.dashed);
                    setDataPlotDashLen = pluckNumber(setData.dashlen, plotDashLen);
                    setDataPlotDashGap = plotDashGap = pluckNumber(setData.dashgap, plotDashGap);

                    maxValue = mathMax(maxValue, setValue);
                    minValue = mathMin(minValue, setValue);

                    config.plotBorderDashStyle = plotBorderDashStyle = setDataDashed === 1 ?
                        getDashStyle(setDataPlotDashLen, setDataPlotDashGap, plotBorderThickness) :
                        (setDataDashed === 0 ? noneStr : initailPlotBorderDashStyle);
                    if (singleSeries) {
                        plotColor = colorM.getPlotColor(isNaN(tempIndex) ? i : tempIndex);
                        plotColor = pluck(setData.color, plotColor);
                        plotFillRatio = pluck(setData.ratio, conf.plotFillRatio);
                    } else {
                        plotColor = pluck(setData.color, conf.plotColor);
                    }

                    plotFillAlpha = pluck(setData.alpha, conf.plotFillAlpha);
                    plotBorderAlpha = pluck(setData.alpha, conf.plotBorderAlpha, plotFillAlpha).toString();

                    config.plotColor = plotColor;

                    config.plotFillAlpha = pluck(setData.alpha, conf.plotFillAlpha);
                    config.plotBackgroundFillAlpha = pluckNumber(setData.plotbackgroundfillalpha,
                        chartAttr.plotbackgroundfillalpha, 30);

                    // Setting the angle for plot fill for negative data
                    if (setValue < 0 && !isRoundEdges) {

                        tempPlotfillAngle = plotfillAngle;
                        plotfillAngle = isBar ? 180 - plotfillAngle : 360 - plotfillAngle;
                    }

                    // Setting the color Array to be applied to the bar/column.
                    config.colorArr = colorArr = lib.graphics.getColumnColor(
                        plotColor,
                        plotFillAlpha,
                        plotFillRatio,
                        plotfillAngle,
                        isRoundEdges,
                        conf.plotBorderColor,
                        plotBorderAlpha,
                        (isBar ? 1 : 0),
                        (is3D ? true : false)
                    );

                    label = getValidValue(parseUnsafeString(pluck(setData.tooltext, setData.label)));

                    // Parsing the hover effects only if showhovereffect is not 0.
                    if (showHoverEffect !== 0) {

                        hoverColor = pluck(setData.hovercolor, JSONData.hovercolor, chartAttr.plotfillhovercolor,
                            chartAttr.columnhovercolor, plotColor);
                        hoverAlpha = pluck(setData.hoveralpha, JSONData.hoveralpha,
                            chartAttr.plotfillhoveralpha, chartAttr.columnhoveralpha, plotFillAlpha);
                        hoverGradientColor = pluck(setData.hovergradientcolor,
                            JSONData.hovergradientcolor, chartAttr.plothovergradientcolor, conf.plotgradientcolor);
                        !hoverGradientColor && (hoverGradientColor = BLANK);
                        hoverRatio = pluck(setData.hoverratio,
                            JSONData.hoverratio, chartAttr.plothoverratio, plotFillRatio);
                        hoverAngle = pluckNumber(360 - setData.hoverangle,
                            360 - JSONData.hoverangle, 360 - chartAttr.plothoverangle, plotfillAngle);
                        hoverBorderColor = pluck(setData.borderhovercolor,
                            JSONData.borderhovercolor, chartAttr.plotborderhovercolor, conf.plotBorderColor);
                        hoverBorderAlpha = pluck(setData.borderhoveralpha,
                            JSONData.borderhoveralpha,
                            chartAttr.plotborderhoveralpha, plotBorderAlpha, plotFillAlpha);
                        hoverBorderThickness = pluckNumber(setData.borderhoverthickness,
                            JSONData.borderhoverthickness, chartAttr.plotborderhoverthickness, plotBorderThickness);
                        hoverBorderDashed = pluckNumber(setData.borderhoverdashed,
                            JSONData.borderhoverdashed, chartAttr.plotborderhoverdashed);
                        hoverBorderDashGap = pluckNumber(setData.borderhoverdashgap,
                            JSONData.borderhoverdashgap, chartAttr.plotborderhoverdashgap, plotDashLen);
                        hoverBorderDashLen = pluckNumber(setData.borderhoverdashlen,
                            JSONData.borderhoverdashlen, chartAttr.plotborderhoverdashlen, plotDashGap);
                        hoverDashStyle = hoverBorderDashed ?
                            getDashStyle(hoverBorderDashLen, hoverBorderDashGap, hoverBorderThickness) :
                            plotBorderDashStyle;

                        /* If no hover effects are explicitly defined and
                         * showHoverEffect is not 0 then hoverColor is set.
                         */
                        if (showHoverEffect == 1 && hoverColor === plotColor) {
                            hoverColor = getLightColor(hoverColor, 70);
                        }

                        // setting the hover color array which is always
                        // applied except when showHoverEffect is not 0.
                        hoverColorArr = lib.graphics.getColumnColor(
                                hoverColor + COMMASTRING + hoverGradientColor,
                                hoverAlpha,
                                hoverRatio,
                                hoverAngle,
                                isRoundEdges,
                                hoverBorderColor,
                                hoverBorderAlpha.toString(),
                                (isBar ? 1 : 0),
                                (is3D ? true : false)
                            ),

                            config.setRolloutAttr = {
                                fill: !is3D ? toRaphaelColor(colorArr[0]) :
                                    [toRaphaelColor(colorArr[0]), !conf.use3DLighting],
                                stroke: showplotborder && toRaphaelColor(colorArr[1]),
                                'stroke-width': plotBorderThickness,
                                'stroke-dasharray': plotBorderDashStyle
                            };
                        config.setRolloverAttr = {
                            fill: !is3D ? toRaphaelColor(hoverColorArr[0]) :
                                [toRaphaelColor(hoverColorArr[0]), !conf.use3DLighting],
                            stroke: showplotborder && toRaphaelColor(hoverColorArr[1]),
                            'stroke-width': hoverBorderThickness,
                            'stroke-dasharray': hoverDashStyle
                        };
                    }

                    formatedVal = config.toolTipValue;

                    // Parsing tooltext against various configurations provided by the user.
                    setTooltext = getValidValue(parseUnsafeString(pluck(setData.tooltext,
                        JSONData.plottooltext, chartAttr.plottooltext)));
                    if (!showTooltip) {
                        toolText = false;
                    } else {
                        if (formatedVal === null) {
                            toolText = false;
                        } else if (setTooltext !== undefined) {
                            macroIndices = [1, 2, 3, 4, 5, 6, 7];
                            parserConfig = {
                                yaxisName: yAxisName,
                                xaxisName: xAxisName,
                                formattedValue: formatedVal,
                                label: label
                            };
                            toolText = parseTooltext(setTooltext, macroIndices,
                                parserConfig, setData, chartAttr, JSONData);
                        } else {
                            if (seriesNameInTooltip) {
                                seriesname = getFirstValue(JSONData && JSONData.seriesname);
                            }
                            toolText = seriesname ? seriesname + tooltipSepChar : BLANK;
                            toolText += label ? label + tooltipSepChar : BLANK;
                        }
                    }
                    config.toolText = toolText;
                    config.setTooltext = toolText;
                    tempPlotfillAngle && (plotfillAngle = tempPlotfillAngle);
                    tempIndex++;
                }
                conf.maxValue = maxValue;
                conf.minValue = minValue;
            },

            init: function(datasetJSON) {
                var dataSet = this,
                    chart = dataSet.chart,
                    visible,
                    showLegend; // need to remove later

                if (!datasetJSON) {
                    return false;
                }
                dataSet.JSONData = datasetJSON;
                dataSet.chartGraphics = chart.chartGraphics;
                dataSet.components = {};

                dataSet.graphics = {};

                dataSet.visible = visible =
                    pluckNumber(dataSet.JSONData.visible, !Number(dataSet.JSONData.initiallyhidden), 1) === 1;
                dataSet.configure();

                // temp code
                showLegend = dataSet.config.showLegend;
                showLegend && dataSet._addLegend();
            },

            _addLegend: function() {
                var dataSet = this,
                    chart = dataSet.chart,
                    chartAttr = chart.jsonData.chart,
                    setDataArr = dataSet.JSONData.data,
                    config,
                    i,
                    dataObj,
                    dataStore = dataSet.components.data,
                    fillColor,
                    strokeColor,
                    label;

                for (i = 0; i < dataStore.length; i += 1) {
                    dataObj = dataStore[i];
                    config = dataObj.config;
                    label = setDataArr[i].label ? setDataArr[i].label : 'Type ' + (i + 1);
                    fillColor = {
                        FCcolor: {
                            color: config.plotColor,
                            angle: 0,
                            ratio: '0',
                            alpha: '100'
                        }
                    };

                    strokeColor = getLightColor(config.plotColor, 60).replace(dropHash, HASHSTRING);

                    chart.components.legend.addItems(dataSet, dataSet.legendInteractivity, {
                        type: dataSet.type,
                        fillColor: toRaphaelColor(fillColor),
                        strokeColor: toRaphaelColor(strokeColor),
                        enabled: pluckNumber(chartAttr.includeinlegend, 1),
                        label: label,
                        index: i
                    });
                }
            },

            legendInteractivity: function(dataSet, legendItem) {

                var index = legendItem.configuration.index,
                    set = dataSet.components.data[index],
                    conf = dataSet.config,
                    setGraphics = set.graphics,
                    visible = set.config.visible,
                    legend = this,
                    legendConfig = legend.config,
                    config = legendItem.config,
                    legendGraphics = legendItem.graphics,
                    itemHiddenStyle = legendConfig.itemHiddenStyle,
                    hiddenColor = itemHiddenStyle.color,
                    itemStyle = legendConfig.itemStyle,
                    itemTextColor = itemStyle.color,
                    color = config.fillColor,
                    stroke = config.strokeColor;

                set.config.visible = visible ? 0 : 1;

                if (visible) {
                    if (!conf.animation.duration || !conf.transposeAnimation) {
                        setGraphics.gaugeBackground.hide();
                        setGraphics.gaugeMeter.hide();
                        setGraphics.hotElement.hide();
                    }

                    legendGraphics.legendItemSymbol && legendGraphics.legendItemSymbol.attr({
                        fill: hiddenColor,
                        'stroke': hiddenColor
                    });
                    legendGraphics.legendItemText && legendGraphics.legendItemText.attr({
                        fill: convertColor(hiddenColor)
                    });
                    legendGraphics.legendIconLine && legendGraphics.legendIconLine.attr({
                        'stroke': hiddenColor
                    });
                } else {
                    setGraphics.gaugeBackground.show();
                    setGraphics.gaugeMeter.show();
                    setGraphics.hotElement.show();
                    legendGraphics.legendItemSymbol && legendGraphics.legendItemSymbol.attr({
                        fill: color,
                        'stroke': stroke
                    });
                    legendGraphics.legendItemText && legendGraphics.legendItemText.attr({
                        fill: convertColor(itemTextColor)
                    });
                    legendGraphics.legendIconLine && legendGraphics.legendIconLine.attr({
                        'stroke': color
                    });
                }
                dataSet.draw();
            },

            draw: function() {
                var dataSet = this,
                    JSONData = dataSet.JSONData,
                    conf = dataSet.config,
                    chartAttr = dataSet.chart.jsonData.chart,
                    setDataArr = dataSet.components.data,
                    dataStore = dataSet.components.data,
                    chart = dataSet.chart,
                    paper = chart.components.paper,
                    chartConfig = chart.config,
                    canvasLeft = chartConfig.canvasLeft,
                    // canvasRight = chartConfig.canvasRight,
                    canvasTop = chartConfig.canvasTop,
                    // canvasBottom = chartConfig.canvasBottom,
                    canvasHeight = chartConfig.canvasHeight,
                    canvasWidth = chartConfig.canvasWidth,
                    parentContainer = chart.graphics.datasetGroup,
                    gaugeBackgroundContainer = dataSet.graphics.gaugeBackgroundContainer,
                    gaugeMeterContainer = dataSet.graphics.gaugeMeterContainer,
                    trackerContainer = dataSet.graphics.trackerContainer,
                    layers = chart.graphics,
                    trackerLayer = layers.trackerGroup,

                    len = dataSet.components.data.length || 0,
                    i,
                    setData,
                    dataObj,
                    config,
                    setValue,
                    colorArr,

                    maximumOuterRadius,
                    innerRadius,
                    width,
                    cx,
                    cy,
                    radius1,
                    radius2,
                    startAngle,
                    endAngle,
                    gaugeBackground,
                    arcpath,
                    gaugeMeter,
                    attr,
                    centerRadius,
                    setLink,
                    setTooltext,
                    toolText,
                    eventArgs,
                    hotElement,
                    groupId,
                    animationDuration = conf.animation.duration,
                    transposeAnimation = conf.transposeAnimation,
                    transposeAnimDuration = conf.transposeAnimDuration,
                    factor = 0,
                    visible,
                    ringpath,
                    animCallBack = function() {
                        var dataStore = dataSet.components.data,
                            config,
                            len = dataSet.components.data.length,
                            graphics;

                        for (i = 0; i < len; i++) {
                            config = dataStore[i].config;
                            graphics = dataStore[i].graphics;

                            if (!config.visible) {
                                graphics.hotElement.hide();
                            }
                        }
                    };

                if (!gaugeBackgroundContainer) {
                    gaugeBackgroundContainer =
                        dataSet.graphics.gaugeBackgroundContainer =
                        paper.group('gauge-background', parentContainer);
                }

                if (!gaugeMeterContainer) {
                    gaugeMeterContainer =
                        dataSet.graphics.gaugeMeterContainer = paper.group('gauge-meter', parentContainer);
                }

                if (!trackerContainer) {
                    trackerContainer = dataSet.graphics.trackerContainer = paper.group('meter-hot', trackerLayer);
                }

                for (i = 0; i < len; i++) {
                    setData = setDataArr[i];
                    dataObj = dataStore[i];
                    config = dataObj && dataObj.config;

                    if (!config.visible) {
                        continue;
                    }
                    factor += 1;
                }

                maximumOuterRadius = mathMin(canvasHeight / 2, canvasWidth / 2);

                innerRadius = centerRadius = 0.2 * mathMin(chart.config.canvasWidth, chart.config.canvasHeight);
                width = ((maximumOuterRadius - factor) - innerRadius) / factor;

                cx = canvasLeft + canvasWidth * 0.5;
                cy = canvasTop + canvasHeight * 0.5;

                for (i = 0; i < len; i++) {
                    setData = setDataArr[i];
                    dataObj = dataStore[i];
                    config = dataObj && dataObj.config;
                    visible = config.visible;

                    if (!visible && !animationDuration) {
                        continue;
                    }

                    // Creating the data structure if not present for storing the graphics elements.
                    if (!dataObj.graphics) {
                        dataStore[i].graphics = {};

                    }

                    setValue = config.setValue;

                    setLink = config.setLink;

                    setTooltext = getValidValue(parseUnsafeString(pluck(setData.tooltext,
                        JSONData.plottooltext, chartAttr.plottooltext)));
                    // Setting the final tooltext.
                    toolText = config.toolText + (setTooltext ? BLANK : config.toolTipValue);

                    colorArr = config.colorArr;

                    groupId = i;

                    eventArgs = {
                        index: i,
                        link: setLink,
                        value: setValue,
                        displayValue: config.displayValue,
                        // categoryLabel: categories[i].label,
                        toolText: toolText,
                        id: BLANK,
                        datasetIndex: dataSet.datasetIndex,
                        datasetName: JSONData.seriesname,
                        dataSet: dataSet,
                        visible: visibleStr,
                        cx: cx,
                        cy: cy,
                        radius: centerRadius
                    };

                    radius1 = innerRadius;
                    radius2 = innerRadius + width;
                    startAngle = 0;
                    endAngle = 6.283; // value of twoPI

                    if (!dataObj.graphics.gaugeBackground) {
                        gaugeBackground = dataObj.graphics.gaugeBackground =
                            paper.ringpath(cx, cy, radius1, radius2,
                                startAngle, endAngle, gaugeBackgroundContainer)
                            .attr({
                                fill: convertColor(config.plotColor, config.plotBackgroundFillAlpha),
                                'stroke-width': 0
                            });
                    } else {
                        attr = {
                            ringpath: [cx, cy, radius1, radius2, startAngle, endAngle],
                            fill: convertColor(config.plotColor, config.plotBackgroundFillAlpha),
                            'stroke-width': 0
                        };

                        if (transposeAnimation) {
                            ringpath = visible ? [cx, cy, radius1, radius2, startAngle, endAngle] :
                                [cx, cy, radius1, radius1, startAngle, endAngle];

                            gaugeBackground = dataObj.graphics.gaugeBackground.animate({
                                ringpath: ringpath
                            }, transposeAnimDuration, 'easeIn');
                        } else {
                            gaugeBackground = dataObj.graphics.gaugeBackground.attr(attr);
                        }
                    }

                    endAngle = mathMin(setValue * 3.6, 359.99);

                    arcpath = [cx, cy, innerRadius + width / 2, mathMin(setValue * 3.6, 359.99)];

                    if (animationDuration) {
                        endAngle = 0;
                    }

                    if (!dataObj.graphics.gaugeMeter) {
                        gaugeMeter = dataObj.graphics.gaugeMeter = paper.arcpath(cx, cy, innerRadius + width / 2,
                                endAngle, gaugeMeterContainer)
                            .attr({
                                stroke: toRaphaelColor(colorArr[0]),
                                'stroke-width': width,
                                'stroke-linecap': ROUND
                            });
                        if (animationDuration) {
                            dataObj.graphics.gaugeMeter.animate({
                                arcpath: arcpath
                            }, animationDuration, 'easeIn');
                        }
                    } else {
                        attr = {
                            arcpath: arcpath,
                            stroke: toRaphaelColor(colorArr[0]),
                            'stroke-width': width,
                            'stroke-linecap': ROUND
                        };

                        if (transposeAnimation) {
                            if (visible) {
                                gaugeMeter = dataObj.graphics.gaugeMeter.animate({
                                    arcpath: arcpath,
                                    'stroke-width': width
                                }, transposeAnimDuration, 'easeIn', animCallBack);
                            } else {
                                arcpath = [cx, cy, innerRadius, 0];
                                gaugeMeter = dataObj.graphics.gaugeMeter.animate({
                                    arcpath: arcpath,
                                    'stroke-width': 0
                                }, transposeAnimDuration, 'easeIn', animCallBack);
                            }
                        } else {
                            gaugeMeter = dataObj.graphics.gaugeMeter.attr(attr);
                        }
                    }

                    attr = {
                        arcpath: arcpath,
                        cursor: setLink ? POINTER : BLANK,
                        stroke: TRACKER_FILL,
                        'stroke-width': width,
                        'stroke-linecap': ROUND,
                        ishot: true
                    };

                    /*
                     * If the tooltips are not present then they are created over the hot element,
                     * else only attributes are set for the existing tooltips.
                     */
                    if (!dataObj.graphics.hotElement) {
                        hotElement = dataObj.graphics.hotElement = paper.arcpath(cx, cy, innerRadius + width / 2,
                            mathMin(setValue * 3.6, 359.99), trackerContainer);
                        dataObj.graphics.hotElement.attr({
                            cursor: setLink ? POINTER : BLANK,
                            stroke: TRACKER_FILL,
                            'stroke-width': width,
                            'stroke-linecap': ROUND,
                            ishot: true
                        });
                    } else {
                        dataObj.graphics.hotElement.attr(attr);
                    }

                    hotElement = dataObj.graphics.hotElement;

                    // Hover effects and click function is binded to the
                    // hot element if present else the set element.
                    (hotElement)
                    .data(EVENTARGS, eventArgs)
                        .data(GROUPID, groupId)
                        // .click(clickFunc)
                        .hover(
                            dataSet._plotRollOver,
                            dataSet._plotRollOut
                        )
                        .tooltip(toolText);

                    visible && (innerRadius += width + 1);
                }

            },

            _drawDoughnutCenterLabel: function(labelText, cx, cy,
                dx, dy, centerLabelConfig, updateConfig, visible, data) {
                var dataSet = this,
                    chart = dataSet.chart,
                    seriesData = dataSet.config,
                    labelConfig = centerLabelConfig || seriesData.lastCenterLabelConfig,
                    chartComponents = chart.components,
                    paper = chartComponents.paper,
                    smartLabel = chart.linkedItems.smartLabel,
                    dataStore = dataSet.components.data,
                    dataObj = dataStore[data.index],
                    labelPadding = 2,
                    textpadding = 2 * 2,
                    cssObj = {
                        fontFamily: 'Verdana',
                        fontSize: 12 + 'px',
                        lineHeight: (1.2 * 12) + 'px',
                        fontWeight: 1 ? 'bold' : BLANK,
                        fontStyle: 0 ? 'italic' : BLANK
                    },
                    txtW = ((dx * 0.5 - labelPadding) * 1.414) - textpadding,
                    txtH = ((dy * 0.5 - labelPadding) * 1.414) - textpadding,
                    layers = chart.graphics,
                    dataLabelsLayer = layers.datalabelsGroup,
                    dataLabelContainer = dataSet.graphics.dataLabelContainer,
                    centerLabel,
                    attr,
                    smartLabelObj;
                //labelOvalBg;

                smartLabel.useEllipsesOnOverflow(chart.config.useEllipsesWhenOverflow);
                smartLabel.setStyle(cssObj);
                smartLabelObj = smartLabel.getSmartText(labelText, txtW, txtH);

                if (!dataLabelContainer) {
                    dataLabelContainer = dataSet.graphics.dataLabelContainer =
                        paper.group('datalabel', dataLabelsLayer);
                }

                // if (!grp) {
                //     grp = dataSet.graphics.centerLabel = paper.group('centerLabel', parentContainer);
                // }
                attr = {
                    x: data.cx,
                    y: data.cy,
                    text: smartLabelObj.text,
                    //visibility: visibleStr,
                    direction: seriesData.textDirection,
                    opacity: visible ? 0 : 1,
                    //title: labelConfig.toolText ? BLANK : smartLabelObj.tooltext || BLANK,
                    fill: toRaphaelColor(dataObj.config.colorArr[0]),
                    'text-bound': labelConfig.bgOval ? noneStr : [
                        toRaphaelColor({
                            color: labelConfig.bgColor,
                            alpha: labelConfig.bgAlpha
                        }),
                        toRaphaelColor({
                            color: labelConfig.borderColor,
                            alpha: labelConfig.borderAlpha
                        }),
                        labelConfig.borderThickness,
                        labelConfig.textPadding,
                        labelConfig.borderRadius
                    ]
                };

                if (!dataObj.graphics.label) {
                    centerLabel = dataObj.graphics.label = paper.text(attr, dataLabelContainer);
                }

                dataObj.graphics.label.attr(attr)
                    .css(cssObj);

                if (!visible) {
                    dataObj.graphics.label.animate({
                        opacity: 0
                    }, 100, 'easeOut');
                    //dataObj.graphics.label.hide();
                } else {
                    //dataObj.graphics.label.show();
                    dataObj.graphics.label.animate({
                        opacity: 1
                    }, 100, 'easeIn');
                }
            },

            _plotRollOver: function() {
                var ele = this.data(EVENTARGS),
                    dx = ele.radius * 2,
                    dy = dx;
                ele.dataSet._drawDoughnutCenterLabel(ele.toolText, 300, 196, dx, dy, ele.toolText, false, true, ele);
            },

            _plotRollOut: function() {
                var ele = this.data(EVENTARGS),
                    dx = ele.radius * 2,
                    dy = dx;
                ele.dataSet
                    ._drawDoughnutCenterLabel(ele.toolText, 300, 196, dx, dy, ele.toolText, false, false, ele);
            },

            // Function to an existing data of a dataset.
            updateData: function(dataObj, index, draw) {
                var dataSet = this,
                    conf = dataSet.config,
                    prevMax = conf.maxValue,
                    prevMin = conf.prevMin,
                    chart = dataSet.chart;

                dataSet._setConfigure(dataObj, index);
                dataSet.setMaxMin();

                if (conf.maxValue !== prevMax || conf.minValue !== prevMin) {
                    dataSet.maxminFlag = true;
                }

                if (draw) {
                    chart._setAxisLimits();
                    dataSet.draw();
                }
            },

            // Function to remove a data with a given index.
            removeData: function(index, stretch, draw) {
                var dataSet = this,
                    components = dataSet.components,
                    dataStore = components.data,
                    removeDataArr = components.removeDataArr || (components.removeDataArr = []),
                    conf = dataSet.config,
                    i,
                    config,
                    len,
                    maxminFlag = dataSet.maxminFlag;

                stretch = stretch || 1;
                index = index || 0;

                // Storing the direction of input data for the type of animation to be done during remove.
                if ((index + stretch) === dataStore.length) {
                    dataSet.endPosition = true;
                } else if (index === 0 || index === undefined) {
                    dataSet.endPosition = false;
                }
                dataStore[index] && (dataStore[index].config.visible = 0);
                draw && dataSet.draw();

                components.removeDataArr = removeDataArr = removeDataArr.concat(dataStore.splice(index, stretch));

                len = removeDataArr.length;
                for (i = 0; i < len; i++) {
                    if (!removeDataArr[i]) {
                        continue;
                    }
                    config = removeDataArr[i].config;
                    if (config.setValue === conf.maxValue || config.setValue === conf.minValue) {
                        maxminFlag = dataSet.maxminFlag = true;
                    }
                    if (maxminFlag) {
                        break;
                    }
                }

                maxminFlag && dataSet.setMaxMin();
                // draw && dataSet.draw();
            },

            manageSpace: function() {

            }

        }, 'Column']);

    }
]);

FusionCharts.register ('module', ['private', 'modules.renderer.js-realtimecolumn', function () {
    var global = this,
        lib = global.hcLib,
        win = global.window,
        creditLabel = false && !lib.CREDIT_REGEX.test (win.location.hostname),
        BLANK = lib.BLANKSTRING,
        COMMASPACE = lib.COMMASPACE,
        NORMALSTRING = 'normal',
        math = Math,
        mathMax = math.max,
        dropHash = lib.regex.dropHash,
        HASHSTRING = lib.HASHSTRING,
        PXSTRING = 'px',
        convertColor = lib.graphics.convertColor,
        preDefStr = lib.preDefStr,
        animationObjStr = preDefStr.animationObjStr,
        UNDEFINED,
        visibleStr = preDefStr.visibleStr,
        configStr = preDefStr.configStr,
        pluck = lib.pluck,
        pluckNumber = lib.pluckNumber,
        schedular = lib.schedular,
        priorityList = lib.priorityList,
        chartAPI = lib.chartAPI;

    chartAPI ('realtimecolumn', {
        showRTvalue : true,
        canvasPadding : true,
        isRealTime : true,
        standaloneInit: true,
        creditLabel: creditLabel,
        defaultDatasetType : 'realtimecolumn',
        applicableDSList: { 'realtimecolumn': true },
        transposeAxis : true,
        rtManageSpace : true,
        _realTimeConfigure : function () {
            var iapi = this,
                config = iapi.config,
                animationObj = config.animationObj,
                realTimeConfig = config.realTimeConfig || (config.realTimeConfig = { }),
                refreshInterval,
                realtimeValueFontColor,
                realtimeValueFontSize,
                showRTmenuItem,
                jsonData = iapi.jsonData,
                chartAttrs = jsonData.chart,
                catLen = (jsonData.categories && jsonData.categories[0] && jsonData.categories[0].category &&
                    jsonData.categories[0].category.length) || 0;

            // Parsing the real time attributes
            realTimeConfig.showRTValue =  pluckNumber (chartAttrs.showrealtimevalue, 1),
            realTimeConfig.dataStreamURL = pluck (chartAttrs.datastreamurl, BLANK);
            realTimeConfig.dataStamp = chartAttrs.datastamp;
            realTimeConfig.useMessageLog = pluckNumber (chartAttrs.usemessagelog, 0);
            realTimeConfig.clearInterval = pluckNumber (chartAttrs.clearchartinterval, 0);
            realTimeConfig.realtimeValueSeparator = pluck (chartAttrs.realtimevaluesep, COMMASPACE);
            realTimeConfig.refreshInterval = refreshInterval =
                pluckNumber (chartAttrs.refreshinterval, chartAttrs.updateinterval, 2);
            realTimeConfig.updateInterval = iapi.config.updateInterval =
                pluckNumber (chartAttrs.updateinterval, refreshInterval);
            realTimeConfig.realtimeValuePadding = pluckNumber(chartAttrs.realtimevaluepadding);
            realTimeConfig.realtimeValueFont = pluck(chartAttrs.realtimevaluefont, BLANK);
            realTimeConfig.realtimeValueFontBold = pluck(chartAttrs.realtimevaluefontbold, 0);
            realTimeConfig.realtimeValueFontColor = realtimeValueFontColor =
                pluck(chartAttrs.realtimevaluefontcolor, BLANK);
            realTimeConfig.realtimeValueFontSize = realtimeValueFontSize =
                pluckNumber(chartAttrs.realtimevaluefontsize, BLANK);
            realTimeConfig.realTimeValuePadding = pluckNumber(chartAttrs.realtimevaluepadding, 5);
            realTimeConfig.fontWeight =  pluckNumber(chartAttrs.realtimevaluefontbold, 0) ? 'bold' : NORMALSTRING;
            realTimeConfig.numDisplaySets = pluckNumber(chartAttrs.numdisplaysets, mathMax(
                catLen, 15));
            realTimeConfig.refreshInstantly = pluckNumber(chartAttrs.refreshinstantly, 0);
            realTimeConfig.showRTmenuItem = showRTmenuItem = pluckNumber(chartAttrs.showrtmenuitem, 0);

            // chartAnimation is forced to sync
            realTimeConfig.sync = pluckNumber(chartAttrs.sync, refreshInterval > 0.6 ? true : false);

            if (realtimeValueFontColor) {
                realTimeConfig.realtimeValueFontColor = realtimeValueFontColor.replace(dropHash, HASHSTRING);
            }

            if (realtimeValueFontSize) {
                realTimeConfig.realtimeValueFontSize = realtimeValueFontSize + PXSTRING;
            }

            refreshInterval *= 1000;
            animationObj.duration > refreshInterval && (animationObj.duration = refreshInterval);
            if (showRTmenuItem) {
                iapi._setRTmenu();
            }
        },

        // Setting the number of categories to be shown.
        _setRealTimeCategories : function () {
            var iapi = this,
                components = iapi.components,
                xAxis = components.xAxis[0],
                tempArr = [],
                realTimeConfig = iapi.config.realTimeConfig,
                clear = realTimeConfig && realTimeConfig.clear,
                categories = clear ? undefined : iapi.jsonData.categories && iapi.jsonData.categories[0] &&
                    iapi.jsonData.categories[0].category,
                catLen = xAxis.getCategoryLen(),
                numDisplaySets = realTimeConfig.numDisplaySets;

            // Setting category as per numDisplaySets
            catLen = xAxis.getCategoryLen ();
            if (catLen < numDisplaySets) {
                tempArr.length = numDisplaySets - catLen;
                categories = categories ? tempArr.concat (categories) : tempArr;
                xAxis.setCategory (categories);
            }
            else if (catLen > numDisplaySets) {
                categories.splice (numDisplaySets, (catLen - numDisplaySets));
                xAxis.setCategory (categories);
            }
        },

        // Spacemanagement for real time value
        _realTimeValuePositioning : function (availableHeight) {
            var iapi = this,
                components = iapi.components,
                smartLabel = iapi.linkedItems.smartLabel,
                height,
                space,
                config = iapi.config,
                realTimeConfig = config.realTimeConfig || (config.realTimeConfig = { }),
                padding = realTimeConfig.realTimeValuePadding,
                axisConfig =components.xAxis[0].config,
                style = axisConfig.trend.trendStyle,
                attr = realTimeConfig.style = {
                    color: convertColor(pluck (realTimeConfig.realtimeValueFontColor, style.color),
                            pluck(axisConfig.trendlineAlpha, 99)),
                    fontFamily: pluck(realTimeConfig.realtimeValueFont, style.fontFamily),
                    fontSize: pluck(realTimeConfig.realtimeValueFontSize, style.fontSize),
                    fontWeight: pluck(realTimeConfig.fontWeight, style.fontWeight),
                    lineHeight : pluckNumber(style.lineHeight)
                };

            smartLabel.useEllipsesOnOverflow(config.useEllipsesWhenOverflow);
            smartLabel.setStyle (attr);

            // Setting the height to be left for displaying the value.
            realTimeConfig.height = height = smartLabel.getOriSize (lib.TESTSTR).height;
            realTimeConfig.canvasBottom = config.canvasBottom;
            space = height + padding;

            if (space > availableHeight) {
                space = availableHeight;
            }
            return {
                bottom : space
            };
        },

        // Drwaing the real time value.
        _drawRealTimeValue : function () {
            var iapi = this,
                components = iapi.components,
                config = iapi.config,
                dataset = components.dataset,
                paper = components.paper,
                smartLabel = iapi.linkedItems.smartLabel,
                realTimeConfig = config.realTimeConfig,
                realtimeValueSeparator = realTimeConfig.realtimeValueSeparator,
                len = dataset.length,
                displayValue = BLANK,
                animationObj = iapi.get(configStr, animationObjStr),
                animObj = animationObj.animObj,
                dummyObj = animationObj.dummyObj,
                animationDuration = animationObj.duration,
                canvasBottom = realTimeConfig.canvasBottom,
                height = realTimeConfig.height,
                canvasLeft = config.canvasLeft,
                canvasRight = config.canvasRight,
                style = realTimeConfig.style || {},
                width,
                positionX,
                positionY,
                realTimeValue = components.realTimeValue || (components.realTimeValue = {}),
                graphics = realTimeValue.graphics,
                chartGraphics = iapi.graphics,
                attr,
                parentLayer = chartGraphics.parentGroup,
                realTimeValueGroup = chartGraphics.realTimeValueGroup,
                datasetStore,
                drawn,
                prevData,
                dataDisplayValue,
                i;

            if (realTimeConfig.clear && realTimeValue.graphics) {
                realTimeValue.graphics.attr({text : BLANK});
            }

            if (!realTimeValueGroup) {
                realTimeValueGroup = chartGraphics.realTimeValueGroup = paper.group('realTimeValue',
                    parentLayer).insertBefore(chartGraphics.datalabelsGroup);
            }

            else {

                for (i = 0; i < len; i ++) {
                    datasetStore = dataset[i].components.data;
                    prevData = datasetStore[datasetStore.length - 1];
                    dataDisplayValue = prevData && prevData.config.displayValue;

                    displayValue += (dataDisplayValue ?
                        (dataDisplayValue === UNDEFINED ? BLANK : dataDisplayValue + realtimeValueSeparator) : BLANK);
                }

                displayValue = displayValue.substring(0, displayValue.length - realtimeValueSeparator.length);
                smartLabel.useEllipsesOnOverflow(config.useEllipsesWhenOverflow);
                smartLabel.setStyle (style);
                width = smartLabel.getOriSize (displayValue).width;
                positionX = (canvasLeft + canvasRight) / 2;
                positionY = canvasBottom  - height / 2;

                attr = {
                    x: positionX || 0,
                    y: positionY || 0,
                    'font-size': style.fontSize,
                    'font-weight': style.fontWeight,
                    'font-family': style.fontFamily,
                    'line-height': style.lineHeight,
                    visibility: visibleStr
                };

                if (!graphics) {
                    graphics = realTimeValue.graphics = paper.text(attr, realTimeValueGroup);
                    drawn = true;
                }

                graphics.attr({
                    text: displayValue,
                    fill: style.color
                });

                if (graphics && !drawn) {
                    graphics.show();
                    graphics.animateWith(dummyObj, animObj, attr, animationDuration);
                }
            }
        },

        _hideRealTimeValue : function () {
            var iapi = this,
                components = iapi.components,
                realTimeValue = components.realTimeValue || (components.realTimeValue = {}),
                graphics = realTimeValue && realTimeValue.graphics;

            graphics && graphics.hide();
        },

        _getData : function () {
            var iapi = this,
                components = iapi.components,
                dataset = components.dataset,
                xAxis = (components.xAxis && components.xAxis[0]) || components.scale,
                length,
                i,
                j,
                store = [],
                maxLength = 0,
                data,
                innerStore;

            if (dataset) {
                length = dataset.length;
                 // Finding the dataset with maximum length
                for (i = 0; i < length; i ++) {
                    maxLength = mathMax(maxLength, dataset[i].components.data.length);
                }

                for (i = 0; i < maxLength; i++) {
                    innerStore = store[i] = [];

                    innerStore[0] = xAxis.getLabel(i).label;
                    for (j = 1; j <= length; j ++) {
                        data = dataset[j - 1].components.data[i];
                        innerStore[j] = data && data.config.setValue;
                    }
                }
                return store;
            }
        },

        /**
         * This function feeds real-time data to real-time gauges. In single value gauges (LEDs, Bulb, Cylinder,
         * Thermometer) the function takes a numeric value as the parameter. For Angular gauge and Horizontal Linear
         * gauge, this function accepts two parameters - the dial number and the value to update.
         *
         * @group chart-realtime
         * @see FusionCharts#feedData
         * @see FusionCharts#getData
         * @param {string} value
         * @param {string} label
         */
        _setData : function (value, label) {
            var stream = BLANK;

            if ((value && value.toString) || value === BLANK || value === 0) {
                stream = 'value=' + value.toString();
            }
            if ((label && label.toString) || label === BLANK) {
                stream = stream + '&label=' + label.toString();
            }
            if (stream) {
                this.feedData(stream);
            }
        },

        /**
         * @group chart-realtime
         * @see FusionCharts#startUpdate
         * @see FusionCharts#restartUpdate
         * @see FusionCharts#isUpdateActive
         * @see FusionCharts#clearChart
         */
        _stopUpdate : function (source) {
            var iapi = this,
                realTimeConfig = iapi.config.realTimeConfig,
                loadData = iapi.linkedItems.timers && iapi.linkedItems.timers.setTimeout.loadData,
                chartObj = iapi.chartInstance,
                state = chartObj.__state;

            clearTimeout(state._toRealtime);
            state._rtAjaxObj && state._rtAjaxObj.abort();

            state._rtPaused = true;

            // Clearing previously queqed updates of the chart if any ideally when update interval is less than
            // refresh interval.
            loadData && clearTimeout(loadData);

            realTimeConfig.clearIntervalFlag = false;

            /**
             * This event is raised when the real time update of the chart is stopped .
             *
             * @event Fusioncharts#realTimeUpdateStopped
             * @group chart-realtime
             */
            global.raiseEvent('realimeUpdateStopped', {
                source: source
            }, chartObj);
        },

        /**
         * @group chart-realtime
         * @see FusionCharts#startUpdate
         * @see FusionCharts#stopUpdate
         * @see FusionCharts#isUpdateActive
         * @see FusionCharts#clearChart
         */
        _restartUpdate : function () {
            var chartObj = this.chartInstance,
            state = chartObj.__state;

            if (state._rtDataUrl && state._rtPaused) {
                state._rtPaused = false;
                state._rtAjaxObj.get(state._rtDataUrl);
            }
        },

        /**
         * @group chart-realtime
         * @see FusionCharts#startUpdate
         * @see FusionCharts#stopUpdate
         * @see FusionCharts#clearChart
         * @see FusionCharts#restartUpdate
         */
        _isUpdateActive : function () {
            var state = this.chartInstance.__state;

            return !state._rtPaused;
        },

        _setRTmenu : function () {
            var iapi = this,
                chartMenuTools = iapi.chartMenuTools,
                setChartTools = chartMenuTools.set,
                updateChartMenuTools = chartMenuTools.update,
                stopState = false,
                toggle = function () {
                    if (stopState) {
                        iapi._restartUpdate.call(iapi);
                        updateChartMenuTools('Restart Update', 'Stop Update', iapi);
                        stopState = false;
                    }
                    else {
                        iapi._stopUpdate.call(iapi);
                        updateChartMenuTools('Stop Update', 'Restart Update', iapi);
                        stopState = true;
                    }
                },
                toolArray = [{
                    'Clear Chart' : {
                        handler: function () {
                            iapi._clearChart.call(iapi);
                        },
                        action: 'click'
                    }
                },
                {
                    'Stop Update' : {
                        handler: function () {
                            toggle();
                        },
                        action: 'click'
                    }
                }];
            setChartTools(toolArray);
        },

        _getDataJSON : function () {
            return this.config.realTimeConfig.legacyUpdateObj || {
                values: []
            };
        },

        // Function to copy the original data to a different DS for showing tooltip in RT charts.
        _setRTdata : function () {
            var iapi = this,
                components = iapi.components,
                datasets = components.dataset,
                i,
                dataRT,
                dataset,
                removeDataArr,
                removeDataArrLen,
                datasetComponents,
                data,
                dataLen,
                len = datasets.length;

            for (i = len; i--; ) {
                dataset = datasets[i];
                datasetComponents = dataset.components;
                removeDataArr = datasetComponents.removeDataArr || [];
                removeDataArrLen = removeDataArr.length;
                data = datasetComponents.data;
                dataLen = data.length;
                dataRT = [].concat(removeDataArr, data.slice(removeDataArrLen, dataLen));
                datasetComponents.dataRT = dataRT;
            }
        },

        eiMethods : {
            feedData : function () {
                var chartContainer = this,
                    chart = chartContainer.apiInstance,
                    list = chart.getJobList(),
                    callback = arguments[1],
                    updateStr,
                    output,
                    asyncRender = chart.chartInstance.args.asyncRender;
                if (asyncRender || callback) {
                    updateStr = arguments[0];
                    list.eiMethods.push(schedular.addJob(function(){
                        output = chart.feedData.call(chart, updateStr);
                        if (typeof callback === 'function') {
                            callback(output);
                        }
                    }, chart, [], priorityList.postRender));
                }
                else {
                    return chart.feedData.apply(chart, arguments);
                }
            },

            setData : function () {
                var chart = this.apiInstance,
                    list = chart.getJobList(),
                    asyncRender = chart.chartInstance.args.asyncRender;
                asyncRender ? list.eiMethods.push(schedular.addJob(chart._setData, chart, arguments,
                    priorityList.postRender)) : chart._setData.apply(chart, arguments);
            },

            stopUpdate : function () {
                var chart = this.apiInstance,
                    list = chart.getJobList(),
                    asyncRender = chart.chartInstance.args.asyncRender;
                asyncRender ? list.eiMethods.push(schedular.addJob(chart._stopUpdate, chart, [],
                    priorityList.postRender)) : chart._stopUpdate.apply(chart, arguments);
            },

            restartUpdate : function () {
                this.apiInstance._restartUpdate.apply(this.apiInstance, arguments);
            },

            isUpdateActive : function () {
                return this.apiInstance._isUpdateActive.apply(this.apiInstance, arguments);
            },

            clearChart : function () {
                var chart = this.apiInstance,
                    list = chart.getJobList(),
                    asyncRender = chart.chartInstance.args.asyncRender;
                asyncRender ? list.eiMethods.push(schedular.addJob(chart._clearChart, chart, [],
                    priorityList.postRender)) : chart._clearChart.apply(chart, arguments);
            },

            getData : function () {
                return this.apiInstance._getData.apply(this.apiInstance, arguments);
            },

            showLog : function () {
                var msLogger = this.apiInstance.components && this.apiInstance.components.messageLogger;
                return msLogger && msLogger.show && msLogger.show.apply(msLogger, arguments);
            },

            hideLog : function () {
                var msLogger = this.apiInstance.components && this.apiInstance.components.messageLogger;
                return msLogger && msLogger.hide && msLogger.hide.apply(msLogger, arguments);
            },

            clearLog : function () {
                var msLogger = this.apiInstance.components && this.apiInstance.components.messageLogger;
                return msLogger && msLogger.clearLog && msLogger.clearLog.apply(msLogger, arguments);
            },

            getDataForId : function () {
                return this.apiInstance._getDataForId.apply(this.apiInstance, arguments);
            },

            setDataForId : function () {
                return this.apiInstance._setDataForId.apply(this.apiInstance, arguments);
            },

            getDataJSON : function () {
                return this.apiInstance._getDataJSON.apply(this.apiInstance, arguments);
            }

        }
    },chartAPI.mscartesian, {
        enablemousetracking: true
    });
}]);

FusionCharts.register ('module', ['private', 'modules.renderer.js-realtimestackedcolumn', function () {
    var global = this,
        lib = global.hcLib,
        chartAPI = lib.chartAPI;

    chartAPI ('realtimestackedcolumn', {
    },chartAPI.realtimecolumn, {
        isstacked: true,
        enablemousetracking: true
    });
}]);

FusionCharts.register ('module', ['private', 'modules.renderer.js-gaugebase', function () {
    var global = this,
      lib = global.hcLib,
      win = global.window,
      creditLabel = false && !lib.CREDIT_REGEX.test (win.location.hostname),
      chartAPI = lib.chartAPI,
      extend2 = lib.extend2,
      defaultGaugePaletteOptions = extend2({}, lib.defaultGaugePaletteOptions);

    chartAPI('gaugebase', {
        creaditLabel: creditLabel,
        defaultPaletteOptions: defaultGaugePaletteOptions,
        multiValueGauge: false,
        decimals: 2,
        formatnumberscale: 0,
        drawAnnotations: true,
        useScaleRecursively: true,
        includeColorRangeInLimits: false,
        isWidget : true,

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

        // Only updates the internal data-structure without updating visuals.
        realTimeUpdate : function (dataObj) {
            var iapi = this,
                components = iapi.components,
                dataset = components.dataset,
                newDataset = dataObj.dataset,
                newCategory = (dataObj.categories && dataObj.categories.category) || [],
                realTimeConfig = iapi.config.realTimeConfig = iapi.config.realTimeConfig ||
                    (iapi.config.realTimeConfig = {}),
                data,
                length,
                i,
                curDataset;

            if (dataset) {
                curDataset = newDataset[0];
                data = curDataset.data;
                for (i = 0, length = data.length; i < length; i++) {
                    data[i].label = newCategory[i] && newCategory[i].label;
                }
                //curDataset.data[0].label = newCategory[0].label;
                dataset[0].updateData (curDataset);
                dataset[0].maxminFlag && (realTimeConfig.maxminFlag = dataset[0].maxminFlag);
            }
        },

        _clearChart : function () {

        },

        _realTimeConfigure : chartAPI.realtimecolumn,

        _setRTmenu : function () {
            var iapi = this,
                chartMenuTools = iapi.chartMenuTools,
                setChartTools = chartMenuTools.set,
                updateChartMenuTools = chartMenuTools.update,
                stopState = false,
                toggle = function () {
                    if (stopState) {
                        iapi._restartUpdate.call(iapi);
                        updateChartMenuTools('Restart Update', 'Stop Update', iapi);
                        stopState = false;
                    }
                    else {
                        iapi._stopUpdate.call(iapi);
                        updateChartMenuTools('Stop Update', 'Restart Update', iapi);
                        stopState = true;
                    }
                };

            setChartTools([{
                'Stop Update' : {
                    handler: function () {
                        toggle();
                    },
                    action: 'click'
                }
            }]);
        },

        _getData : chartAPI.realtimecolumn,

        /**
         * This function feeds real-time data to real-time gauges. In single value gauges (LEDs, Bulb, Cylinder,
         * Thermometer) the function takes a numeric value as the parameter. For Angular gauge and Horizontal Linear
         * gauge, this function accepts two parameters - the dial number and the value to update.
         *
         * @group chart-realtime
         * @see FusionCharts#feedData
         * @see FusionCharts#getData
         * @param {string} value
         * @param {string} label
         */
        _setData: chartAPI.realtimecolumn,

        /**
         * @group chart-realtime
         * @see FusionCharts#startUpdate
         * @see FusionCharts#restartUpdate
         * @see FusionCharts#isUpdateActive
         * @see FusionCharts#clearChart
         */
        _stopUpdate: chartAPI.realtimecolumn,

         /**
         * @group chart-realtime
         * @see FusionCharts#startUpdate
         * @see FusionCharts#stopUpdate
         * @see FusionCharts#isUpdateActive
         * @see FusionCharts#clearChart
         */
        _restartUpdate: chartAPI.realtimecolumn,

        /**
         * @group chart-realtime
         * @see FusionCharts#startUpdate
         * @see FusionCharts#stopUpdate
         * @see FusionCharts#clearChart
         * @see FusionCharts#restartUpdate
         */
        _isUpdateActive: chartAPI.realtimecolumn,

        eiMethods : chartAPI.realtimecolumn

    }, chartAPI.sscartesian, {
        valuefontbold: 1
    });
}]);

FusionCharts.register ('module', ['private', 'modules.renderer.js-axisgaugebase', function () {
    var global = this,
        lib = global.hcLib,
        chartAPI = lib.chartAPI,
        pluck = lib.pluck,
        pluckNumber = lib.pluckNumber,
        BLANK = lib.BLANKSTRING,
        pluckFontSize = lib.pluckFontSize,
        UNDEFINED,
        COMPONENT = 'component',
        AXIS = 'axis';

    chartAPI('axisgaugebase',{
        chartLeftMargin: 15,
        chartRightMargin: 15,
        chartTopMargin: 10,
        chartBottomMargin: 10,
        minChartHeight : 10,
        minCanvasWidth: 0,
        // Below attribute is a temporary attribute which is introduced to alter the position of annotation layer.
        // this is required to preserve the default behavior of gauge in version 3.11 as layer is now common for charts
        // gauge and powercharts.
        annotationRelativeLayer : 'axis',

        _createAxes : function() {
            var iapi = this,
                components = iapi.components,
                scale,
                CartesianGaugeAxis = FusionCharts.register(COMPONENT, [AXIS, 'gauge']);

            components.scale = scale = new CartesianGaugeAxis();

            scale.chart = iapi;

            scale.init();
        },

        _feedAxesRawData : function() {
            var iapi = this,
                components = iapi.components,
                colorM = components.colorManager,
                dataObj = iapi.jsonData,
                chartAttrs = dataObj.chart,
                scale,
                scaleConf,
                chartPaletteStr = lib.chartPaletteStr,
                palleteString = chartPaletteStr.chart2D,
                ticksBelowGauge = pluckNumber(chartAttrs.ticksbelowgauge),
                ticksonright = pluckNumber(chartAttrs.ticksonright),
                isAxisOpposite = pluckNumber(chartAttrs.axisontop,
                    chartAttrs.axisonleft !== UNDEFINED ? !pluckNumber(chartAttrs.axisonleft) : UNDEFINED, (
                    ticksBelowGauge !== UNDEFINED ? !ticksBelowGauge : UNDEFINED), (
                    ticksonright !== UNDEFINED ? ticksonright : UNDEFINED),
                    iapi.isAxisOpposite),
                isAxisReverse = pluckNumber(chartAttrs.reverseaxis, iapi.isAxisReverse),
                showTickMarks = pluckNumber(chartAttrs.showtickmarks, 1),
                showTickValues = pluckNumber(chartAttrs.showtickvalues),
                showLimits;

            if (!showTickValues && showTickValues !== UNDEFINED) {
                showLimits = false;
            }
            else if (!showTickMarks && showTickValues === UNDEFINED) {
                showLimits = false;
            }
            else {
                showLimits = true;
            }

            scaleConf = {
                outCanfontFamily: pluck(chartAttrs.outcnvbasefont, chartAttrs.basefont, 'Verdana,sans'),
                outCanfontSize:  pluckFontSize(chartAttrs.outcnvbasefontsize, chartAttrs.basefontsize, 10),
                outCancolor: pluck(chartAttrs.outcnvbasefontcolor, chartAttrs.basefontcolor,
                    colorM.getColor(palleteString.baseFontColor)).replace(/^#?([a-f0-9]+)/ig, '#$1'),
                useEllipsesWhenOverflow: chartAttrs.useellipseswhenoverflow,
                divLineColor: pluck(chartAttrs.vdivlinecolor, colorM.getColor(palleteString.divLineColor)),
                divLineAlpha: pluck(chartAttrs.vdivlinealpha, colorM.getColor('divLineAlpha')),
                divLineThickness: pluckNumber(chartAttrs.vdivlinethickness, 1),
                divLineIsDashed: Boolean(pluckNumber(chartAttrs.vdivlinedashed, chartAttrs.vdivlineisdashed, 0)),
                divLineDashLen: pluckNumber(chartAttrs.vdivlinedashlen, 4),
                divLineDashGap: pluckNumber(chartAttrs.vdivlinedashgap, 2),
                showAlternateGridColor: pluckNumber(chartAttrs.showalternatevgridcolor, 0),
                alternateGridColor: pluck(chartAttrs.alternatevgridcolor, colorM.getColor('altVGridColor')),
                alternateGridAlpha: pluck(chartAttrs.alternatevgridalpha, colorM.getColor('altVGridAlpha')),
                numDivLines: chartAttrs.numvdivlines,
                labelFont: chartAttrs.labelfont,
                labelFontSize: chartAttrs.labelfontsize,
                labelFontColor: chartAttrs.labelfontcolor,
                labelFontAlpha: chartAttrs.labelalpha,
                labelFontBold : chartAttrs.labelfontbold,
                labelFontItalic : chartAttrs.labelfontitalic,
                axisName: chartAttrs.xaxisname,
                axisMinValue: chartAttrs.lowerlimit,
                axisMaxValue: chartAttrs.upperlimit,
                setAdaptiveMin: chartAttrs.setadaptivemin,
                adjustDiv: chartAttrs.adjustvdiv,
                labelDisplay: chartAttrs.labeldisplay,
                showLabels: chartAttrs.showlabels,
                rotateLabels: chartAttrs.rotatelabels,
                slantLabel: pluckNumber(chartAttrs.slantlabels, chartAttrs.slantlabel),
                labelStep: pluckNumber(chartAttrs.labelstep, chartAttrs.xaxisvaluesstep),
                showAxisValues: pluckNumber(chartAttrs.showxaxisvalues,  chartAttrs.showxaxisvalue),
                showDivLineValues: pluckNumber(chartAttrs.showvdivlinevalues, chartAttrs.showvdivlinevalues),
                showZeroPlane: chartAttrs.showvzeroplane,
                zeroPlaneColor: chartAttrs.vzeroplanecolor,
                zeroPlaneThickness: chartAttrs.vzeroplanethickness,
                zeroPlaneAlpha: chartAttrs.vzeroplanealpha,
                showZeroPlaneValue: chartAttrs.showvzeroplanevalue,
                trendlineColor: chartAttrs.trendlinecolor,
                trendlineToolText: chartAttrs.trendlinetooltext,
                trendlineThickness: chartAttrs.trendlinethickness,
                trendlineAlpha: chartAttrs.trendlinealpha,
                showTrendlinesOnTop: chartAttrs.showtrendlinesontop,
                showAxisLine: pluckNumber(chartAttrs.showxaxisline, chartAttrs.showaxislines,
                    chartAttrs.drawAxisLines, 0),
                axisLineThickness: pluckNumber(chartAttrs.xaxislinethickness, chartAttrs.axislinethickness, 1),
                axisLineAlpha: pluckNumber(chartAttrs.xaxislinealpha, chartAttrs.axislinealpha, 100),
                axisLineColor: pluck(chartAttrs.xaxislinecolor, chartAttrs.axislinecolor, '#000000'),
                // Tick properties
                majorTMNumber : chartAttrs.majortmnumber,
                majorTMColor : chartAttrs.majortmcolor,
                majorTMAlpha : chartAttrs.majortmalpha,
                majorTMHeight : chartAttrs.majortmheight,
                tickValueStep : chartAttrs.tickvaluestep,
                showTickMarks : chartAttrs.showtickmarks,
                connectTickMarks : chartAttrs.connecttickmarks,
                showTickValues : chartAttrs.showtickvalues,
                majorTMThickness : chartAttrs.majortmthickness,
                upperlimit : components.numberFormatter.getCleanValue(chartAttrs.upperlimit),
                lowerlimit : components.numberFormatter.getCleanValue(chartAttrs.lowerlimit),
                reverseScale : chartAttrs.reversescale,
                // Whether to display the Limits
                showLimits: chartAttrs.showlimits || showLimits,
                //Whether to automatically adjust TM
                adjustTM: chartAttrs.adjusttm,
                minorTMNumber: pluckNumber(chartAttrs.minortmnumber, iapi.minorTMNumber, 4),
                minorTMColor: chartAttrs.minortmcolor,
                minorTMAlpha : chartAttrs.minortmalpha,
                minorTMHeight: pluckNumber(chartAttrs.minortmheight, chartAttrs.minortmwidth),
                minorTMThickness: chartAttrs.minortmthickness,
                //Padding between tick mark start position and gauge
                tickMarkDistance: pluckNumber(chartAttrs.tickmarkdistance, chartAttrs.tickmarkgap),
                //Tick value distance
                tickValueDistance: pluckNumber(chartAttrs.tickvaluedistance, chartAttrs.displayvaluedistance),
                placeTicksInside: chartAttrs.placeticksinside,
                placeValuesInside: chartAttrs.placevaluesinside,
                upperLimitDisplay : chartAttrs.upperlimitdisplay,
                lowerLimitDisplay : chartAttrs.lowerlimitdisplay,
                drawTickMarkConnector: iapi.isHorizontal ? 1 : 0
            };

            scale = components.scale;

            scale.vtrendlines = dataObj.trendpoints;

            scale.chart = iapi;

            scale.setCommonConfigArr(scaleConf, !iapi.isHorizontal, isAxisReverse, isAxisOpposite);
            scale.configure();
        },

        _setAxisLimits : function () {
            var iapi = this,
                components = iapi.components,
                chartAttrs = iapi.jsonData.chart,
                scale = components.scale,
                minMaxObj;

            minMaxObj = components.dataset[0].getDataLimits();
            (minMaxObj.max === -Infinity) && (minMaxObj.max = 0);
            (minMaxObj.min === Infinity) && (minMaxObj.min = 0);
            iapi.colorRange && scale.setAxisConfig({
                lowerlimit: pluckNumber(chartAttrs.lowerlimit, minMaxObj.forceMin ? minMaxObj.min : UNDEFINED),
                upperlimit: pluckNumber(chartAttrs.upperlimit, minMaxObj.forceMax ? minMaxObj.max : UNDEFINED)
            });
            scale.setDataLimit(minMaxObj.max, minMaxObj.min);
        },

        _spaceManager: function () {
            var spaceForActionBar,
                actionBarSpace,
                iapi = this,
                config = iapi.config,
                components = iapi.components,
                dataset = components.dataset[0],
                scale = components.scale,
                is3d = iapi.is3D,
                chartAttrs = iapi.jsonData.chart,
                showBorder = pluckNumber (chartAttrs.showborder, is3d ? 0 : 1),
                isHorizontal = iapi.isHorizontal,
                minChartWidth = config.minChartWidth,
                minChartHeight = config.minChartHeight,
                chartBorderWidth =
                    config.borderWidth = showBorder ? pluckNumber (chartAttrs.borderthickness, 1) : 0,
                chartBorderVertical,
                chartBorderHorizontal;

            if ((config.canvasWidth - 2 * chartBorderWidth) < minChartWidth ) {
                chartBorderVertical = (config.canvasWidth -  minChartWidth) / 2;
            }

            if ((config.canvasHeight - 2 * chartBorderWidth) < minChartHeight ) {
                chartBorderHorizontal = (config.canvasHeight -  minChartHeight) / 2;
            }

            iapi._allocateSpace ( {
                top : chartBorderHorizontal || chartBorderWidth,
                bottom : chartBorderHorizontal|| chartBorderWidth,
                left : chartBorderVertical || chartBorderWidth,
                right : chartBorderVertical || chartBorderWidth
            });

            spaceForActionBar = config.availableHeight * 0.225;
            actionBarSpace = iapi._manageActionBarSpace && iapi._manageActionBarSpace(spaceForActionBar) ||
                {};
            iapi._allocateSpace(actionBarSpace);

            if (isHorizontal) {
                iapi._allocateSpace(scale.placeAxis(config.availableHeight));
            }
            else {
                iapi._allocateSpace(scale.placeAxis(config.availableWidth));
            }

            // iapi._allocateSpace(iapi._manageCaptionSpacing(config.availableHeight * 0.4));
            iapi._manageChartMenuBar(config.availableHeight * 0.4);

            dataset._manageSpace && iapi._allocateSpace(dataset._manageSpace(config.availableHeight));

            scale.setAxisConfig({
                drawPlotlines : iapi.drawPlotlines,
                drawPlotBands : iapi.drawPlotBands
            });
        },

        _postSpaceManagement : function () {
            var iapi = this,
                config = iapi.config,
                components = iapi.components,
                scale = components.scale,
                isHorizontal = iapi.isHorizontal;

            if (isHorizontal) {
                scale.setAxisDimention({
                    axisLength : config.canvasWidth
                });
            }
            else {
                scale.setAxisDimention({
                    axisLength : config.canvasHeight
                });
            }
        },

        _getDataJSON: function () {
            var i = 0,
                len,
                dataObj,
                values = [],
                labels = [],
                toolTexts = [],
                data = this.components.dataset[0].components.data;

            if (!data || !data.length) {
                len = 0;
            } else {
                len = data.length;
            }

            for (;i < len; i += 1) {
                dataObj = data[i].config;
                values.push(dataObj.itemValue);
                labels.push(dataObj.formatedVal || BLANK);
                toolTexts.push(dataObj.toolText || BLANK);
            }

            return {
                values: values,
                labels: labels,
                toolTexts: toolTexts
            };
        }
    }, chartAPI.gaugebase);

}]);

FusionCharts.register ('module', ['private', 'modules.renderer.js-funnelpyramidbase', function () {
    var global = this,
            lib = global.hcLib,
            chartAPI = lib.chartAPI,
            preDefStr = lib.preDefStr,
            R = lib.Raphael,
            configStr = preDefStr.configStr,
            ROUND = preDefStr.ROUND,
            animationObjStr = preDefStr.animationObjStr;

    chartAPI('funnelpyramidbase', {
        showRTvalue : false,
        canvasPadding : false,
        sliceOnLegendClick: true,
        defaultDatasetType : 'funnelpyramidbaseds',
        applicableDSList: {'funnel': true},
        hasCanvas: false,
        defaultPlotShadow: 1,
        subTitleFontSizeExtender: 0,
        tooltippadding: 3,
        defaultPaletteOptions: lib.defaultPaletteOptions,
        drawAnnotations: true,
        hasLegend: true,
        isDataLabelBold : false,
        dontShowLegendByDefault: true,
        formatnumberscale: 1,
        isSingleSeries: true,
        alignCaptionWithCanvas: 0,
        _updateVisuals : function () {
            var iapi = this,
                    config = iapi.config,
                    container = iapi.linkedItems.container,
                    components = iapi.components,
                    legend = components.legend,
                    paper = components.paper,
                    tooltip = components.tooltip,
                    chartInstance = iapi.chartInstance,
                    animationObj = iapi.get(configStr, animationObjStr),
                    animType = animationObj.animType,
                    dummyObj = animationObj.dummyObj,
                    animObj = animationObj.animObj,
                    animationDuration = animationObj.duration,
                    attr,
                    animationStarted;

            config.animationStarted = true;
            if (!paper) {
                paper = components.paper = new R (container, container.offsetWidth, container.offsetHeight);
                paper.setConfig('stroke-linecap', ROUND);
            }
            else {
                attr = {
                    width: container.offsetWidth,
                    height: container.offsetHeight
                };

                animationStarted = true;
                iapi._chartAnimation(true);
                paper.animateWith(dummyObj, animObj, attr, animationDuration, animType);
            }

            // Setting tooltip style
            paper.tooltip (tooltip.style, tooltip.config.shadow, tooltip.config.constrain);

            iapi.setChartCursor();

            //create drawing layers
            iapi._createLayers ();

            iapi._setDataLabelStyle();

            //Start the chart animation
            !animationStarted && iapi._chartAnimation(true);

            // draw components
            iapi._drawBackground ();


            components.chartMenuBar && iapi._drawChartMenuBar();

            iapi._manageCaptionPosition ();
            components.caption && components.caption.draw();

            components.actionBar && iapi.drawActionBar();

            iapi._drawDataset ();

            if (iapi.hasLegend !== false) {
                legend.drawLegend ();
            }

            iapi._drawCreditLabel ();
            iapi._drawLogo();

            if (chartInstance.annotations) {
                iapi._drawAnnotations ();
            }

            iapi.createChartStyleSheet ();
        }
    }, chartAPI.gaugebase);
}]);

FusionCharts.register ('module', ['private', 'modules.renderer.js-funnel', function () {
    var global = this,
        lib = global.hcLib,
        win = global.window,
        creditLabel = false && !lib.CREDIT_REGEX.test (win.location.hostname),
        chartAPI = lib.chartAPI;

    chartAPI('funnel', {
        friendlyName: 'Funnel Chart',
        standaloneInit: true,
        creditLabel: creditLabel,
        defaultDatasetType : 'funnel',
        applicableDSList: { 'funnel': true },
        useSortedData: true
    }, chartAPI.funnelpyramidbase);

}]);

FusionCharts.register ('module', ['private', 'modules.renderer.js-pyramid', function () {
    var global = this,
        lib = global.hcLib,
        win = global.window,
        creditLabel = false && !lib.CREDIT_REGEX.test (win.location.hostname),
        chartAPI = lib.chartAPI;

    chartAPI('pyramid', {
        friendlyName: 'Funnel Chart',
        standaloneInit: true,
        creditLabel: creditLabel,
        defaultDatasetType : 'pyramid',
        applicableDSList: { 'pyramid': true },
        useSortedData: false
    }, chartAPI.funnelpyramidbase);
}]);

FusionCharts.register ('module', ['private', 'modules.renderer.js-vled', function () {
    var global = this,
        lib = global.hcLib,
        COMPONENT = 'component',
        DATASET = 'dataset',
        DATASET_GROUP = 'datasetGroup',
        AXIS = 'axis',
        pluckNumber = lib.pluckNumber,
        win = global.window,
        creditLabel = false && !lib.CREDIT_REGEX.test (win.location.hostname),
        chartAPI = lib.chartAPI;

    chartAPI('vled', {
        showRTvalue : false,
        canvasPadding : false,
        friendlyName: 'Vertical LED Gauge',
        defaultSeriesType : 'led',
        defaultPlotShadow: 1,
        standaloneInit: true,
        realtimeEnabled: true,
        chartleftmargin: 15,
        chartrightmargin: 15,
        charttopmargin: 10,
        chartbottommargin: 10,
        showTooltip : 0,
        connectTickMarks: 0,
        creditLabel: creditLabel,
        isHorizontal: false,
        isAxisOpposite : true,
        hasLegend : false,
        drawPlotlines : false,
        drawPlotBands : false,
        isAxisReverse : false,
        hasCanvas: false,
        isRealTime: true,
        defaultDatasetType : 'led',
        colorRange: true,
        applicableDSList: {'led': true},

        _getData : function () {
            var iapi = this,
                components = iapi.components,
                dataset = components.dataset,
                data,
                dataObj;
            if (dataset) {
                dataObj = dataset[0].components.data;
                if (dataObj && dataObj[0]) {
                    data = dataObj[0].config;
                    return pluckNumber(data.setValue, data.itemValue);
                }
            }
        },

        _createDatasets : function () {
            var iapi = this,
                components = iapi.components,
                dataObj = iapi.jsonData,
                //data = dataObj.data,
                datasetStore,
                datasetObj,
                value = dataObj.value,
                target = dataObj.target,
                defaultSeriesType = iapi.defaultDatasetType,
                dsType,
                GroupManager,
                groupManagerName,
                DsGroupClass,
                DsClass,
                dataOnlyArr = [],
                JSONData,
                prevDataLength,
                currDataLength,
                datasetJSON;

            datasetStore = components.dataset  || (components.dataset = []);

            dataOnlyArr.push({
                value: value,
                target: target
            });

            datasetJSON = {data: dataOnlyArr};

            iapi.config.categories = dataOnlyArr;

            datasetStore = components.dataset  || (components.dataset = []);


            dsType = defaultSeriesType;

            if (dsType) {

                /// get the DsClass
                DsClass = FusionCharts.get(COMPONENT, [DATASET, dsType]);
                if (DsClass) {
                    groupManagerName = 'datasetGroup_' + dsType;
                    // get the ds group class
                    DsGroupClass = FusionCharts.register(COMPONENT, [DATASET_GROUP, dsType]);
                    GroupManager = components[groupManagerName];
                    if (DsGroupClass && !GroupManager) {
                        GroupManager = components[groupManagerName] = new DsGroupClass();
                        GroupManager.chart = iapi;
                        GroupManager.init();
                        // groupManager.init(components, graphics);
                        // groupManager.dataSetsLen = length;
                    }
                    if (!datasetStore[0]) {
                        // create the dataset Object
                        datasetObj = new DsClass();
                        datasetStore.push(datasetObj);
                        datasetObj.chart = iapi;
                        GroupManager && GroupManager.addDataSet(datasetObj, 0, 0);
                        datasetObj.init(datasetJSON);
                    }
                    else {
                        JSONData = datasetStore[0].JSONData;
                        prevDataLength = JSONData.data.length;
                        currDataLength = datasetJSON.data.length;
                        // Removing data plots if the number of current data plots is more than the existing ones.
                        if (prevDataLength > currDataLength) {
                            datasetStore[0].removeData(currDataLength - 1, prevDataLength - currDataLength, false);
                        }
                        datasetStore[0].JSONData = datasetJSON;
                        datasetStore[0].configure();
                    }
                }
            }
        },

        _createAxes : function() {
            var iapi = this,
                components = iapi.components,
                scale,
                CartesianGaugeAxis = FusionCharts.register(COMPONENT, [AXIS, 'gauge']);


            components.scale = scale = new CartesianGaugeAxis();

            scale.chart = iapi;

            scale.init();
        }

    }, chartAPI.axisgaugebase);

}]);

FusionCharts.register ('module', ['private', 'modules.renderer.js-vbullet',function () {
    var global = this,
        lib = global.hcLib,
        //add the tools thats are requared
        pluck = lib.pluck,
        pluckNumber = lib.pluckNumber,
        chartAPI = lib.chartAPI,

        zeroCommaHundredStr = '0,100',
        win = global.window,
        COMPONENT = 'component',
        AXIS = 'axis',
        UNDEFINED,
        pluckFontSize = lib.pluckFontSize, // To get the valid font size (filters negative values)

        creditLabel = false && !lib.CREDIT_REGEX.test(win.location.hostname);

    chartAPI('vbullet', {
        friendlyName: 'Vertical Bullet Gauge',
        creditLabel: creditLabel,
        defaultSeriesType: 'bullet',
        gaugeType: 4,
        ticksOnRight: 0,
        // colorRangeFillMix: '{light-10},{dark-20},{light-50},{light-85}',
        // colorRangeFillRatio: '0,8,84,8',
        standaloneInit: true,
        hasCanvas: true,
        singleseries: true,
        isHorizontal: false,
        isAxisOpposite : false,
        isAxisReverse : false,
        defaultDatasetType : 'bullet',
        applicableDSList: {'bullet': true},
        defaultPaletteOptions : {
            //Store colors now
            paletteColors: [['A6A6A6', 'CCCCCC', 'E1E1E1', 'F0F0F0'],
                ['A7AA95', 'C4C6B7', 'DEDFD7', 'F2F2EE'],
                ['04C2E3','66E7FD','9CEFFE','CEF8FF'],
                ['FA9101', 'FEB654', 'FED7A0', 'FFEDD5'],
                ['FF2B60', 'FF6C92', 'FFB9CB', 'FFE8EE']],
            //Store other colors
            // ------------- For 2D Chart ---------------//
            //We're storing 5 combinations, as we've 5 defined palettes.
            bgColor: ['FFFFFF', 'CFD4BE,F3F5DD', 'C5DADD,EDFBFE', 'A86402,FDC16D', 'FF7CA0,FFD1DD'],
            bgAngle: [270, 270, 270, 270, 270],
            bgRatio: [zeroCommaHundredStr, zeroCommaHundredStr, zeroCommaHundredStr, zeroCommaHundredStr,
                zeroCommaHundredStr],
            bgAlpha: ['100', '60,50', '40,20', '20,10', '30,30'],

            toolTipBgColor: ['FFFFFF', 'FFFFFF', 'FFFFFF', 'FFFFFF', 'FFFFFF'],
            toolTipBorderColor: ['545454', '545454', '415D6F', '845001', '68001B'],

            baseFontColor: ['333333', '60634E', '025B6A', 'A15E01', '68001B'],
            tickColor: ['333333', '60634E', '025B6A', 'A15E01', '68001B'],
            trendColor: ['545454', '60634E', '415D6F', '845001', '68001B'],

            plotFillColor: ['545454', '60634E', '415D6F', '845001', '68001B'],

            borderColor: ['767575', '545454', '415D6F', '845001', '68001B'],
            borderAlpha: [50, 50, 50, 50, 50]

        },

        _createAxes : function() {
            var iapi = this,
                components = iapi.components,
                scale,
                CartesianGaugeAxis = FusionCharts.register(COMPONENT, [AXIS, 'gauge']);

            components.scale = scale = new CartesianGaugeAxis();

            scale.chart = iapi;

            scale.init();
        },
        _feedAxesRawData : function() {
            var iapi = this,
                components = iapi.components,
                colorM = components.colorManager,
                dataObj = iapi.jsonData,
                chartAttrs = dataObj.chart,
                scale,
                scaleConf,
                chartPaletteStr = lib.chartPaletteStr,
                palleteString = chartPaletteStr.chart2D,
                ticksBelowGraph = pluckNumber(chartAttrs.ticksbelowgraph, 1),
                isAxisOpposite = pluckNumber(chartAttrs.ticksonright, chartAttrs.axisontop,
                                chartAttrs.axisonleft !== UNDEFINED ? !pluckNumber(chartAttrs.axisonleft) : UNDEFINED,
                                !ticksBelowGraph, iapi.isAxisOpposite);

            scaleConf = {
                outCanfontFamily: pluck(chartAttrs.outcnvbasefont, chartAttrs.basefont, 'Verdana,sans'),
                outCanfontSize:  pluckFontSize(chartAttrs.outcnvbasefontsize, chartAttrs.basefontsize, 10),
                outCancolor: pluck(chartAttrs.outcnvbasefontcolor, chartAttrs.basefontcolor,
                    colorM.getColor(palleteString.baseFontColor)).replace(/^#?([a-f0-9]+)/ig, '#$1'),
                // axisNamePadding: chartAttrs.xaxisnamepadding,
                // axisValuePadding: chartAttrs.labelpadding,
                // axisNameFont: chartAttrs.xaxisnamefont,
                // axisNameFontSize: chartAttrs.xaxisnamefontsize,
                // axisNameFontColor: chartAttrs.xaxisnamefontcolor,
                // axisNameFontBold: chartAttrs.xaxisnamefontbold,
                // axisNameFontItalic: chartAttrs.xaxisnamefontitalic,
                // axisNameBgColor: chartAttrs.xaxisnamebgcolor,
                // axisNameBorderColor: chartAttrs.xaxisnamebordercolor,
                // axisNameAlpha: chartAttrs.xaxisnamealpha,
                // axisNameFontAlpha: chartAttrs.xaxisnamefontalpha,
                // axisNameBgAlpha: chartAttrs.xaxisnamebgalpha,
                // axisNameBorderAlpha: chartAttrs.xaxisnameborderalpha,
                // axisNameBorderPadding: chartAttrs.xaxisnameborderpadding,
                // axisNameBorderRadius: chartAttrs.xaxisnameborderradius,
                // axisNameBorderThickness: chartAttrs.xaxisnameborderthickness,
                // axisNameBorderDashed: chartAttrs.xaxisnameborderdashed,
                // axisNameBorderDashLen: chartAttrs.xaxisnameborderdashlen,
                // axisNameBorderDashGap: chartAttrs.xaxisnameborderdashgap,
                useEllipsesWhenOverflow: chartAttrs.useellipseswhenoverflow,
                divLineColor: pluck(chartAttrs.vdivlinecolor, colorM.getColor(palleteString.divLineColor)),
                divLineAlpha: pluck(chartAttrs.vdivlinealpha, colorM.getColor('divLineAlpha')),
                divLineThickness: pluckNumber(chartAttrs.vdivlinethickness, 1),
                divLineIsDashed: Boolean(pluckNumber(chartAttrs.vdivlinedashed, chartAttrs.vdivlineisdashed, 0)),
                divLineDashLen: pluckNumber(chartAttrs.vdivlinedashlen, 4),
                divLineDashGap: pluckNumber(chartAttrs.vdivlinedashgap, 2),
                showAlternateGridColor: pluckNumber(chartAttrs.showalternatevgridcolor, 0),
                alternateGridColor: pluck(chartAttrs.alternatevgridcolor, colorM.getColor('altVGridColor')),
                alternateGridAlpha: pluck(chartAttrs.alternatevgridalpha, colorM.getColor('altVGridAlpha')),
                numDivLines: chartAttrs.numvdivlines,
                labelFont: chartAttrs.labelfont,
                labelFontSize: chartAttrs.labelfontsize,
                labelFontColor: chartAttrs.labelfontcolor,
                labelFontAlpha: chartAttrs.labelalpha,
                labelFontBold : chartAttrs.labelfontbold,
                labelFontItalic : chartAttrs.labelfontitalic,
                axisName: chartAttrs.xaxisname,
                axisMinValue: chartAttrs.lowerlimit,
                axisMaxValue: chartAttrs.upperlimit,
                setAdaptiveMin: chartAttrs.setadaptivexmin,
                adjustDiv: chartAttrs.adjustvdiv,
                labelDisplay: chartAttrs.labeldisplay,
                showLabels: chartAttrs.showlabels,
                rotateLabels: chartAttrs.rotatelabels,
                slantLabel: pluckNumber(chartAttrs.slantlabels, chartAttrs.slantlabel),
                labelStep: pluckNumber(chartAttrs.labelstep, chartAttrs.xaxisvaluesstep),
                showAxisValues: pluckNumber(chartAttrs.showxaxisvalues,  chartAttrs.showxaxisvalue),
                showDivLineValues: pluckNumber(chartAttrs.showvdivlinevalues, chartAttrs.showvdivlinevalues),
                showZeroPlane: chartAttrs.showvzeroplane,
                zeroPlaneColor: chartAttrs.vzeroplanecolor,
                zeroPlaneThickness: chartAttrs.vzeroplanethickness,
                zeroPlaneAlpha: chartAttrs.vzeroplanealpha,
                showZeroPlaneValue: chartAttrs.showvzeroplanevalue,
                trendlineColor: chartAttrs.trendlinecolor,
                trendlineToolText: chartAttrs.trendlinetooltext,
                trendlineThickness: chartAttrs.trendlinethickness,
                trendlineAlpha: chartAttrs.trendlinealpha,
                showTrendlinesOnTop: chartAttrs.showtrendlinesontop,
                showAxisLine: pluckNumber(chartAttrs.showxaxisline, chartAttrs.showaxislines,
                    chartAttrs.drawAxisLines, 0),
                axisLineThickness: pluckNumber(chartAttrs.xaxislinethickness, chartAttrs.axislinethickness, 1),
                axisLineAlpha: pluckNumber(chartAttrs.xaxislinealpha, chartAttrs.axislinealpha, 100),
                axisLineColor: pluck(chartAttrs.xaxislinecolor, chartAttrs.axislinecolor, '#000000'),
                // Tick properties
                majorTMNumber : chartAttrs.majortmnumber,
                majorTMColor : chartAttrs.majortmcolor,
                majorTMAlpha : chartAttrs.majortmalpha,
                majorTMHeight : chartAttrs.majortmheight,
                tickValueStep : chartAttrs.tickvaluestep,
                showTickMarks : chartAttrs.showtickmarks,
                connectTickMarks : chartAttrs.connecttickmarks,
                showTickValues : chartAttrs.showtickvalues,
                majorTMThickness : chartAttrs.majortmthickness,
                upperlimit : components.numberFormatter.getCleanValue(chartAttrs.upperlimit),
                lowerlimit : components.numberFormatter.getCleanValue(chartAttrs.lowerlimit),
                reverseScale : chartAttrs.reversescale,
                // Whether to display the Limits
                showLimits: pluckNumber(chartAttrs.showlimits, chartAttrs.showtickmarks),
                //Whether to automatically adjust TM
                adjustTM: chartAttrs.adjusttm,
                minorTMNumber: pluckNumber(chartAttrs.minortmnumber, 0),
                minorTMColor: chartAttrs.minortmcolor,
                minorTMAlpha : chartAttrs.minortmalpha,
                minorTMHeight: pluckNumber(chartAttrs.minortmheight, chartAttrs.minortmwidth),
                minorTMThickness: chartAttrs.minortmthickness,
                //Padding between tick mark start position and gauge
                tickMarkDistance: pluckNumber(chartAttrs.tickmarkdistance, chartAttrs.tickmarkgap),
                //Tick value distance
                tickValueDistance: pluckNumber(chartAttrs.tickvaluedistance, chartAttrs.displayvaluedistance),
                placeTicksInside: chartAttrs.placeticksinside,
                placeValuesInside: chartAttrs.placevaluesinside,
                upperLimitDisplay : chartAttrs.upperlimitdisplay,
                lowerLimitDisplay : chartAttrs.lowerlimitdisplay
            };

            scale = components.scale;

            scale.chart = iapi;

            scale.setCommonConfigArr(scaleConf, !iapi.isHorizontal, false, isAxisOpposite);
            scale.configure();
        },

        _drawCanvas : function () {
        }

    }, chartAPI.vled);

}]);

FusionCharts.register ('module', ['private', 'modules.renderer.js-hled', function () {
    var global = this,
        lib = global.hcLib,
        win = global.window,
        creditLabel = false && !lib.CREDIT_REGEX.test (win.location.hostname),
        chartAPI = lib.chartAPI;

    chartAPI('hled', {
        friendlyName: 'Vertical LED Gauge',
        defaultSeriesType : 'led',
        defaultPlotShadow: 1,
        standaloneInit: true,
        realtimeEnabled: true,
        chartleftmargin: 15,
        chartrightmargin: 15,
        charttopmargin: 10,
        chartbottommargin: 10,
        showTooltip : 0,
        connectTickMarks: 0,
        isHorizontal: true,
        isAxisOpposite : false,
        creditLabel: creditLabel
    }, chartAPI.vled);
}]);

FusionCharts.register ('module', ['private', 'modules.renderer.js-hlineargauge', function () {
    var global = this,
      lib = global.hcLib,
      pluck = lib.pluck,
      getValidValue = lib.getValidValue,
      BLANK = lib.BLANKSTRING,
      BLANKSTRING = BLANK,
      getDashStyle = lib.getDashStyle,
      getFirstValue = lib.getFirstValue,
      COMPONENT = 'component',
      DATASET = 'dataset',
      UNDEFINED,
      parseUnsafeString = lib.parseUnsafeString,
      preDefStr = lib.preDefStr,
      animationObjStr = preDefStr.animationObjStr,
      configStr = preDefStr.configStr,
      pluckNumber = lib.pluckNumber,
      getFirstDefinedValue = lib.getFirstDefinedValue,
      win = global.window,
      noneStr = 'none',
      convertColor = lib.graphics.convertColor,
      getColorCodeString = lib.getColorCodeString,
      COMMASTRING = lib.COMMASTRING,
      math = Math,
      mathMax = math.max,
      toRaphaelColor = lib.toRaphaelColor,
      priorityList = lib.priorityList,
      schedular = lib.schedular,
      M = 'M',
      L = 'L',
      POSITION_TOP = preDefStr.POSITION_TOP,
      POSITION_BOTTOM = preDefStr.POSITION_BOTTOM,
      creditLabel = false && !lib.CREDIT_REGEX.test (win.location.hostname),
      chartAPI = lib.chartAPI;

    chartAPI('hlineargauge', {
        showRTvalue : false,
        canvasPadding : false,
        friendlyName: 'Horizontal Linear Gauge',
        creditLabel: creditLabel,
        defaultDatasetType: 'hlineargauge',
        standaloneInit: true,
        isHorizontal: true,
        isAxisOpposite : false,
        hasLegend : false,
        drawPlotlines : false,
        drawPlotBands : false,
        isAxisReverse : false,
        minorTMNumber : 4,
        isRealTime : true,
        colorRange : true,
        applicableDSList : {'hlineargauge' : true},
        rtParserModify : true,

        _drawCanvas: function () {

            var iapi = this,
            components = iapi.components,
            chartConfig = iapi.config,
            // For proper annotation drawing.
            canvasGroup = iapi.graphics.datasetGroup,
            width = chartConfig.canvasWidth,
            height = chartConfig.canvasHeight,
            canvasTop = chartConfig.canvasTop,
            canvasLeft = chartConfig.canvasLeft,
            scale = components.scale,
            min = scale.config.axisRange.min,
            max = scale.config.axisRange.max,
            jsonData = iapi.jsonData,
            chartAttrs = jsonData.chart,
            trendArray = jsonData.trendpoints && jsonData.trendpoints.point,
            showGaugeBorder = pluckNumber(chartAttrs.showgaugeborder, 1),
            gaugeFillMix = getFirstDefinedValue(chartAttrs.colorrangefillmix, chartAttrs.gaugefillmix,
                '{light-10},{dark-20},{light-50},{light-85}'),
            gaugeFillRatio = getFirstDefinedValue(chartAttrs.colorrangefillratio, chartAttrs.gaugefillratio,
                chartAttrs.gaugefillratio, '0,8,84,8'),
            gaugeBorderColor = pluck(chartAttrs.colorrangebordercolor, chartAttrs.gaugebordercolor, '{dark-20}'),
            gaugeBorderAlpha = pluckNumber(chartAttrs.colorrangeborderalpha, chartAttrs.gaugeborderalpha, 100),
            gaugeBorderThickness = showGaugeBorder ? pluckNumber(chartAttrs.colorrangeborderthickness,
                chartAttrs.gaugeborderthickness, 1) : 0,
            gaugeType = 1,
            colorArray = components.colorRange && components.colorRange.getColorRangeArr(min, max),
            showShadow = pluckNumber(chartAttrs.showshadow, 1),
            shadow,
            i,
            y,
            len,
            marker,
            orient,
            colorGrp,
            getRectXY,
            angle,
            color,
            colorObj,
            borderColor,
            xyObj,
            trendPointConfig,
            trendZoneElem,
            trendZoneElems,
            trendObjElem,
            trendObjElems,
            trendObj,
            paper = components.paper,
            colorM = components.colorManager,
            crColor,
            crAlpha,
            borderAlpha,
            shadowAlpha,
            startAngle,
            colorRangeElem,
            animationObj = iapi.get(configStr, animationObjStr),
            duration = animationObj.duration,
            dummyObj = animationObj.dummyObj,
            animObj = animationObj.animObj,
            animType = animationObj.animType,
            pointOrientation= {
                top: 1,
                bottom: 3
            },
            attr,
            trendZoneElemsCount = 0,
            trendObjElemsCount = 0,
            markerCount = 0,
            canvas = components.canvas,
            graphics = canvas.graphics;

            //Setting macros for annotation
            chartConfig.gaugeStartX = chartConfig.canvasLeft;
            chartConfig.gaugeEndX = chartConfig.canvasLeft + width;
            chartConfig.gaugeStartY = chartConfig.canvasTop;
            chartConfig.gaugeEndY = chartConfig.canvasTop + height;
            chartConfig.gaugeCenterX = chartConfig.canvasLeft + width / 2;
            chartConfig.gaugeCenterY = chartConfig.canvasTop + height/2;


            canvasGroup.transform(['T', canvasLeft, canvasTop]);
            if (!(colorGrp = graphics.linear)) {
                graphics.linear = colorGrp = paper.group('colorrange', canvasGroup);
                colorGrp.trackTooltip(true);
                //draw the outer rectangle
                graphics.outerRect = paper.rect(canvasGroup);
            }

            graphics.outerRect.attr({
                x: 0,
                y: 0,
                width: width,
                height: height,
                stroke: noneStr,
                r: 0
            });

            if (gaugeType === 1 ) { // horizontal gauge; left to right;
                getRectXY = function (minValue, maxValue) {
                    return {
                        x: ((minValue * width / (max - min))),
                        y: 0,
                        width: (maxValue - minValue) * width / (max - min),
                        height: height
                    };
                };
                angle = 270;

            } else if (gaugeType === 2) { // vertical gauge; top to bottom;
                getRectXY = function (minValue, maxValue) {
                    return {
                        x: 0,
                        y: (minValue * height / (max - min)),
                        width: width,
                        height: (maxValue - minValue) * height / (max - min)
                    };
                };
                angle = 180;

            } else if (gaugeType === 3) { // horizontal linear gauge; right to left;
                getRectXY = function (minValue, maxValue) {
                    return {
                        x: width - (maxValue * width / (max - min)),
                        y: 0,
                        width: (maxValue - minValue) * width / (max - min),
                        height: height
                    };
                };
                angle = 270;

            } else {  // vertical linear gauge; bottom to top;
                getRectXY = function (minValue, maxValue) {
                    return {
                        x: 0,
                        y: height - (maxValue * height / (max - min)),
                        width: width,
                        height: (maxValue - minValue) * height / (max - min)
                    };
                };
                angle = 180;
            }

            if (!graphics.colorRangeElems) {
                graphics.colorRangeElems = [];
            }

            for (i = 0, len = colorArray && colorArray.length; i < len; i += 1) {
                colorObj = colorArray[i],
                xyObj = getRectXY((colorObj.minvalue - min), (colorObj.maxvalue - min));
                colorObj.x = xyObj.x;
                colorObj.y = xyObj.y;
                colorObj.width = xyObj.width;
                colorObj.height = xyObj.height;

                color = colorObj.code;
                borderColor = convertColor(getColorCodeString(pluck(colorObj.bordercolor, color), gaugeBorderColor),
                    pluckNumber(colorObj.borderalpha, gaugeBorderAlpha));

                shadow = showShadow ? (Math.max(colorObj.alpha, gaugeBorderAlpha) / 100) : null;

                //create the shadow element
                crColor = colorM.parseColorMix(colorObj.code, gaugeFillMix);
                crAlpha = colorM.parseAlphaList(colorObj.alpha, crColor.length);
                borderAlpha = pluckNumber(colorObj.borderAlpha, gaugeBorderAlpha);
                shadowAlpha = crAlpha.split(COMMASTRING);

                shadowAlpha = mathMax.apply(Math, shadowAlpha);
                shadowAlpha = mathMax(gaugeBorderThickness && borderAlpha || 0, shadowAlpha);

                attr = {
                    x: xyObj.x,
                    y: xyObj.y,
                    width: xyObj.width,
                    height: xyObj.height,
                    r: 0,
                    'stroke-width': gaugeBorderThickness
                };

                if (!(colorRangeElem = graphics.colorRangeElems[i])) {
                    colorRangeElem = graphics.colorRangeElems[i] = paper.rect(colorGrp);
                    colorRangeElem.attr(attr);
                }

                colorRangeElem.attr ({
                    stroke: borderColor,
                    'fill': toRaphaelColor({
                        FCcolor: {
                            color: crColor.toString(),
                            ratio: gaugeFillRatio,
                            alpha: crAlpha,
                            angle: angle
                        }
                    })
                });

                colorRangeElem.animateWith(dummyObj, animObj, attr, duration, animType);

                colorRangeElem.shadow({
                    apply: showShadow,
                    opacity: (shadowAlpha / 100)
                });
                colorRangeElem.show();
            }

            while (graphics.colorRangeElems[i]) {
                graphics.colorRangeElems[i].shadow(false);
                graphics.colorRangeElems[i].hide();
                i++;
            }

            if (trendArray) {
                //iapi._configueTrendPoints ();
                trendPointConfig = chartConfig.trendPointConfig;

                if (!graphics.trendObjElems) {
                    graphics.trendObjElems = [];
                }

                if (!graphics.trendZoneElems) {
                    graphics.trendZoneElems = [];
                }

                if (!graphics.marker) {
                    graphics.marker = [];
                }

                for (i = 0, len = trendPointConfig.length; i < len; i += 1) {
                    trendObj = trendPointConfig[i];
                    xyObj = getRectXY((trendObj.startValue - min), (trendObj.endValue - min));

                    if (trendObj.isTrendZone) {
                        if (!(trendZoneElem = graphics.trendZoneElems[trendZoneElemsCount])) {
                            trendZoneElem = graphics.trendZoneElems[trendZoneElemsCount] = paper.rect({
                                height : xyObj.height > 0 ? xyObj.height : 0
                            },colorGrp);
                        }
                        trendZoneElem.attr({
                            fill: toRaphaelColor({
                                FCcolor: {
                                    color: trendObj.color,
                                    alpha: trendObj.alpha
                                }
                            })
                        });

                        trendZoneElem.animateWith(dummyObj, animObj, {
                            x: xyObj.x,
                            y: xyObj.y,
                            width: xyObj.width > 0 ? xyObj.width : 0,
                            height: xyObj.height > 0 ? xyObj.height : 0,
                            r: 0,
                            'stroke-width': 0
                        }, duration, animType)
                        .tooltip(trendObj.tooltext);
                        trendZoneElem.show();
                        trendZoneElemsCount++;
                    }
                    else {
                        if (!(trendObjElem = graphics.trendObjElems[trendObjElemsCount])) {
                            trendObjElem = graphics.trendObjElems[trendObjElemsCount] = paper.path(colorGrp);
                        }
                        trendObjElem.attr({
                            stroke: convertColor(trendObj.color, trendObj.alpha),
                            'stroke-dasharray': trendObj.dashStyle,
                            'stroke-width': trendObj.thickness
                        });

                        trendObjElem.animateWith(dummyObj, animObj, {
                            path : [M, xyObj.x, xyObj.y, L, xyObj.x, (xyObj.y + xyObj.height)]
                        }, duration, animType)
                        .tooltip(trendObj.tooltext);
                        trendObjElem.show();
                        trendObjElemsCount++;
                    }

                    if (trendObj.useMarker) {
                        if (trendObj.showOnTop) {
                            orient = POSITION_BOTTOM;
                            y = 0;
                        } else {
                            orient = POSITION_TOP;
                            y = height;
                        }
                        startAngle = pointOrientation[orient] * 90;

                        if (!(marker = graphics.marker[markerCount])) {
                            graphics.marker[markerCount] = marker = paper.polypath(colorGrp);
                        }
                        marker.attr({
                            fill: trendObj.markerColor,
                            stroke: trendObj.markerBorderColor
                        });

                        marker.animateWith(dummyObj, animObj, {
                            polypath : [3, xyObj.x, y, trendObj.markerRadius, startAngle, 0],
                            'stroke-width': 1
                        }, duration, animType)
                        .shadow({
                            apply: showShadow
                        })
                        .tooltip(trendObj.tooltext);
                        marker.show();
                        markerCount++;
                    }
                }
            }

            // Hiding the unused graphic trendpoint elements if it exists
            if (trendObjElems = graphics.trendObjElems) {
                while (trendObjElems[trendObjElemsCount]) {
                    trendObjElems[trendObjElemsCount].hide();
                    trendObjElemsCount ++;
                }
            }

            if (trendZoneElems = graphics.trendZoneElems) {
                while (trendZoneElems[trendZoneElemsCount]) {
                    trendZoneElems[trendZoneElemsCount].hide();
                    trendZoneElemsCount ++;
                }
            }

            if (marker = graphics.marker) {
                while (marker[markerCount]) {
                    marker[markerCount].hide();
                    marker[markerCount].shadow(false);
                    markerCount ++;
                }
            }
        },

        _configueTrendPoints : function () {
            var iapi = this,
                jsonData = iapi.jsonData,
                config = iapi.config,
                style = config.style,
                trendArray = jsonData.trendpoints && jsonData.trendpoints.point,
                trendPointObj,
                i,
                chartComponents = iapi.components,
                scale = chartComponents.scale,
                scaleConfig = scale.config,
                axisRange = scaleConfig.axisRange,
                max = axisRange.max,
                min = axisRange.min,
                scaleFactor = scaleConfig.scaleFactor || 1,
                colorM = chartComponents.colorManager,
                startValue,
                endValue,
                isTrendZone,
                trendPointConfig = config.trendPointConfig  = [],
                chartAttrs = jsonData.chart,
                length = trendArray.length;

            style.trendStyle = {
                fontFamily: style.outCanfontFamily,
                color: style.outCancolor,
                fontSize:  style.outCanfontSize
            };

            for (i = 0; i < length; i ++) {
                trendPointObj = trendArray[i];
                startValue = pluckNumber(trendPointObj.startvalue, trendPointObj.value);
                endValue = pluckNumber(trendPointObj.endvalue, startValue);
                isTrendZone = startValue !== endValue;

                if (startValue <= max && startValue >= min && endValue <= max && endValue >= min) {
                    trendPointConfig.push({
                        startValue : startValue,
                        endValue : endValue,
                        tooltext : getValidValue(parseUnsafeString(trendPointObj.markertooltext)),
                        displayValue : getValidValue(parseUnsafeString(trendPointObj.displayvalue),
                            isTrendZone ? BLANKSTRING : chartComponents.numberFormatter.scale(startValue)),
                        showOnTop: pluckNumber(trendPointObj.showontop, chartAttrs.ticksbelowgauge, 1),
                        color: pluck(trendPointObj.color, colorM.getColor('trendLightColor')),
                        textColor: trendPointObj.color,
                        alpha: pluckNumber(trendPointObj.alpha, 99),
                        thickness: pluckNumber(trendPointObj.thickness, 1),
                        dashStyle: Number(trendPointObj.dashed) ? getDashStyle(trendPointObj.dashlen || 2,
                            trendPointObj.dashgap || 2, trendPointObj.thickness || 1) : BLANK,
                        //Marker properties
                        useMarker: pluckNumber(trendPointObj.usemarker, 0),
                        markerColor: convertColor(pluck(trendPointObj.markercolor,
                            trendPointObj.color, colorM.getColor('trendLightColor')), 100),
                        markerBorderColor: convertColor(pluck(trendPointObj.markerbordercolor,
                            trendPointObj.bordercolor, colorM.getColor('trendDarkColor')), 100),
                        markerRadius: pluckNumber(pluckNumber(trendPointObj.markerradius) *
                                        scaleFactor, 5),
                        markerToolText: getFirstValue(trendPointObj.markertooltext),
                        trendValueDistance : pluckNumber(pluckNumber(trendPointObj.trendvaluedistance) *
                            scaleFactor, axisRange.tickInterval),
                        isTrendZone : isTrendZone
                    });
                }
            }

            // Sorting the trend point array because the labels have to
            // be space managed in case of hlineargauge.
            lib.stableSort && lib.stableSort(config.trendPointConfig, function (a, b) {
                return (a.startValue - b.startValue);
            });
        },

        _createDatasets : function () {
            var iapi = this,
                components = iapi.components,
                dataObj = iapi.jsonData,
                pointers = dataObj.pointers,
                datasetStore,
                datasetObj,
                defaultSeriesType = iapi.defaultDatasetType,
                dsType,
                prevPointers,
                currPointers,
                DsClass;

            datasetStore = components.dataset  || (components.dataset = []);

            dsType = defaultSeriesType;

            if (dsType) {
                /// get the DsClass
                DsClass = FusionCharts.get(COMPONENT, [DATASET, dsType]);
                if (DsClass) {
                    if (!datasetStore[0]) {
                        datasetObj = new DsClass();
                        datasetStore.push(datasetObj);
                        datasetObj.chart = iapi;
                        datasetObj.init(pointers);
                    }
                    else {
                        prevPointers = datasetStore[0].pointerArr &&
                            datasetStore[0].pointerArr.pointer && datasetStore[0].pointerArr.pointer.length;
                        currPointers = (pointers && pointers.pointer && pointers.pointer.length) || 0;

                        if (prevPointers > currPointers) {
                            datasetStore[0].removeData(prevPointers - currPointers);
                        }
                        datasetStore[0].pointerArr = pointers;
                        datasetStore[0].configure();

                    }
                }
            }
        },

        _getData : function (index, callback) {
            var iapi = this,
                components = iapi.components,
                dataset = components.dataset,
                data,
                dataObj,
                list = iapi.getJobList(),
                _helperFn = function () {
                    dataObj = dataset[0].components.data;
                    if (dataObj && dataObj[--index]) {
                        data = dataObj[index].config;
                        return pluckNumber(data.setValue, data.itemValue);
                    }
                    else {
                        return null;
                    }
                };
            if (dataset) {
                if (typeof callback === 'function') {
                    list.eiMethods.push(schedular.addJob(function () {
                        callback(_helperFn());
                    }, iapi, [], priorityList.postRender));
                }
                else {
                    return _helperFn();
                }
            }
        },

        _setData : function (dialIndex, value) {
            var stream = 'value=',
                i;

            if (dialIndex === UNDEFINED || value === UNDEFINED) {
                return;
            }

            for (i = 1; i < Number(dialIndex); i++) {
                stream += COMMASTRING;
            }

            if (value.toString) {
                stream += value.toString();
            }

            if (stream) {
                this.feedData(stream);
            }
        },

        _getDataForId: function (id, callback) {
            var iapi = this,
                dataset = iapi.components.dataset[0],
                idMap = dataset.idMap,
                list = iapi.getJobList();
            if (typeof callback === 'function') {
                list.eiMethods.push(schedular.addJob(function () {
                    callback((idMap && idMap[id] && idMap[id].config.itemValue) || null);
                }, iapi, [], priorityList.postRender));
            }
            else {
                return (idMap && idMap[id] && idMap[id].config.itemValue) || null;
            }
        },

        _setDataForId : function (id, value) {
            var iapi = this,
                dataset = iapi.components.dataset[0],
                idMap = dataset.idMap;
            return (idMap && idMap[id] && iapi._setData(idMap[id].index + 1, value));
        }
    }, chartAPI.axisgaugebase);

}]);

FusionCharts.register ('module', ['private', 'modules.renderer.js-hbullet', function () {
    var global = this,
        lib = global.hcLib,
        win = global.window,
        pluck = lib.pluck,
        pluckNumber = lib.pluckNumber,
        parseUnsafeString = lib.parseUnsafeString,
        creditLabel = false && !lib.CREDIT_REGEX.test (win.location.hostname),
        chartAPI = lib.chartAPI,
        BLANK = lib.BLANKSTRING,
        BLANKSTRING = BLANK,
        GUTTER_PADDING = 2,
        preDefStr = lib.preDefStr,
        POSITION_START = preDefStr.POSITION_START,
        POSITION_END = preDefStr.POSITION_END,
        POSITION_BOTTOM = preDefStr.POSITION_BOTTOM,
        POSITION_MIDDLE = preDefStr.POSITION_MIDDLE,
        math = Math,
        mathCeil = math.ceil,
        mathMax = math.max;

    chartAPI('hbullet', {
        friendlyName: 'Horizontal Bullet Gauge',
        creditLabel: creditLabel,
        defaultSeriesType: 'hbullet',
        gaugeType: 1,
        standaloneInit: true,
        //isHorizontal: true,
        defaultCaptionPadding : 5,
        rendererId: 'hbullet',
        isHorizontal: true,
        isAxisOpposite : true,
        rtManageSpace: true,

        _RTmanageSpace: function() {
            var iapi = this,
                config = iapi.config,
                components = iapi.components,
                scale = components.scale,
                dataset = components.dataset[0],
                diff,
                currentLabelSpace;

            currentLabelSpace = dataset._manageSpaceHorizontal(config.oriCanvasWidth * 0.7);

            diff = currentLabelSpace.right - config.labelSpace.right;

            iapi._allocateSpace({
                right: diff
            });

            scale.setAxisDimention({
                axisLength: config.canvasWidth
            });

            config.labelSpace = currentLabelSpace;
        },

        _spaceManager: function () {
            var availableWidth,
                availableHeight,
                iapi = this,
                config = iapi.config,
                components = iapi.components,
                dataset = components.dataset[0],
                scale = components.scale,
                is3d = iapi.is3D,
                chartAttrs = iapi.jsonData.chart,
                showBorder = pluckNumber (chartAttrs.showborder, is3d ? 0 : 1),
                chartBorderHorizontal,
                chartBorderVertical,
                minChartWidth = config.minChartWidth,
                minChartHeight = config.minChartHeight,
                chartBorderWidth =
                    config.borderWidth = showBorder ? pluckNumber (chartAttrs.borderthickness, 1) : 0;

            //****** Manage space

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

            availableWidth = config.canvasWidth * 0.7;

            iapi._allocateSpace(scale.placeAxis(config.availableHeight));

            iapi._allocateSpace(iapi._manageActionBarSpace &&
                iapi._manageActionBarSpace(config.availableHeight * 0.225) || {});
            config.oriCanvasWidth = config.canvasWidth;

            config.labelSpace = dataset._manageSpaceHorizontal(availableWidth);
            dataset._manageSpace && iapi._allocateSpace(config.labelSpace);

            availableHeight = config.canvasHeight * 0.225;
            // a space manager that manages the space for the tools as well as the captions.
            iapi._manageChartMenuBar(availableHeight);

            config.oriCanvasWidth -= mathMax(components.subCaption.config.width || 0,
                components.caption.config.width || 0);

            availableHeight = config.canvasHeight * 0.325;
        },

        _manageCaptionSpacing: function () {
            var iapi = this,
                chartConfig = iapi.config,
                components = iapi.components,
                //chartGraphics = iapi.graphics,
                caption = components.caption,
                subCaption = components.subCaption,
                captionConfig = caption.config,
                subCaptionConfig = subCaption.config,
                captionComponents = caption.components,
                subCaptionComponents = subCaption.components,
                chartAttrs = iapi.jsonData.chart,
                SmartLabel = iapi.linkedItems.smartLabel,
                titleText = parseUnsafeString(chartAttrs.caption),
                subTitleText = parseUnsafeString(chartAttrs.subcaption),
                captionPadding = pluckNumber(chartAttrs.captionpadding, 2),
                height = chartConfig.height,
                width = chartConfig.width,
                captionLineHeight = 0,
                subCaptionLineHeight = 0,
                captionHeight = 0,
                captionWidth = 0,
                // subCaptionHeight = 0,
                // subCaptionWidth = 0,
                allowedHeight = height * 0.7,
                allowedWidth = width * 0.7,
                dimensions = {},
                maxCaptionWidth,
                captionObj,
                subCaptionObj,
                capStyle,
                subCapStyle;

            // text below 3px is not properly visible
            if (allowedHeight > 3) {

                captionConfig.captionPadding = subCaptionConfig.captionPadding = captionPadding;

                if (titleText !== BLANKSTRING) { //calculatethe single line's height
                    capStyle = captionConfig.style;
                    captionLineHeight = captionConfig.captionLineHeight =
                        mathCeil(parseFloat(pluck(capStyle.fontHeight, capStyle.lineHeight), 10), 12);
                    // captionFontSize = subCaptionConfig.captionLineHeight =
                    //     pluckNumber(parseInt(capStyle.fontSize, 10), 10);
                }
                if (subTitleText !== BLANKSTRING) {
                    subCapStyle = subCaptionConfig.style;
                    subCaptionLineHeight = mathCeil(parseInt(pluck(subCapStyle.lineHeight,
                        subCapStyle.fontHeight), 10), 12);
                    // subCaptionFontSize = pluckNumber(parseInt(subCapStyle.fontSize, 10), 10);
                }

                if (captionLineHeight > 0 || subCaptionLineHeight > 0) {
                    SmartLabel.useEllipsesOnOverflow(chartConfig.useEllipsesWhenOverflow);
                    SmartLabel.setStyle(capStyle);
                    captionObj = SmartLabel.getSmartText(titleText, allowedWidth, height);
                    // Forcefully increase width to give a gutter in caption and sub-caption
                    if (captionObj.width > 0) {
                        captionObj.width += GUTTER_PADDING;
                        captionHeight = captionObj.height;
                    }
                    SmartLabel.setStyle(subCapStyle);
                    subCaptionObj = SmartLabel.getSmartText(subTitleText, allowedWidth, height - captionHeight);
                    // Force fully increase width to give a gutter in caption and subCaption
                    if (subCaptionObj.width > 0) {
                        subCaptionObj.width += GUTTER_PADDING;
                    }
                    captionConfig.captionSubCaptionGap = captionObj.height + 0 +
                        (subCaptionLineHeight * 0.2);


                    maxCaptionWidth = Math.max(captionObj.width, subCaptionObj.width);
                    // Replace the caption and subCaption text with the new wrapped text
                    captionComponents.text = captionObj.text;
                    captionConfig.height = captionHeight = captionObj.height;
                    captionConfig.width = captionWidth = captionObj.width;
                    captionConfig.tooltext && (captionComponents.originalText = captionObj.tooltext);

                    subCaptionComponents.text = subCaptionObj.text;
                    subCaptionConfig.height = captionHeight = subCaptionObj.height;
                    subCaptionConfig.width = captionWidth = subCaptionObj.width;
                    subCaptionConfig.tooltext && (captionComponents.originalText = subCaptionObj.tooltext);


                    maxCaptionWidth = Math.max(captionObj.width, subCaptionObj.width);
                    //Add caption padding, if either caption or sub-caption is to be shown
                    if (maxCaptionWidth > 0) {
                        maxCaptionWidth = maxCaptionWidth + captionPadding;
                    }
                    captionConfig.maxCaptionWidth = subCaptionConfig.maxCaptionWidth = maxCaptionWidth;

                    // totalHeight = totalHeight || canvasBorderThickness;
                    if (captionConfig.isOnLeft) {
                        dimensions.left = maxCaptionWidth;
                    }
                    else {
                        dimensions.right = maxCaptionWidth;
                    }
                }
            }

            if (captionConfig.isOnLeft) {
                captionConfig.align = subCaptionConfig.align = POSITION_END;
            } else {
                captionConfig.align = subCaptionConfig.align = POSITION_START;
            }

            return dimensions;
        },
        _manageCaptionPosition: function () {
            var iapi = this,
                chartConfig = iapi.config,
                components = iapi.components,
                caption = components.caption,
                subCaption = components.subCaption,
                captionConfig = caption.config,
                subCaptionConfig = subCaption.config,
                captionPosition = captionConfig.captionPosition,
                maxWidth = mathMax(captionConfig.width, subCaptionConfig.width),
                borderWidth = chartConfig.borderWidth || 0,
                // height = chartConfig.height,
                captionSubCaptionGap = captionConfig.captionSubCaptionGap;

            switch (captionPosition) {
                case POSITION_MIDDLE:
                    captionConfig.y = (chartConfig.canvasTop + chartConfig.canvasHeight) * 0.5;
                    break;
                case POSITION_BOTTOM:
                    captionConfig.y = chartConfig.canvasBottom - (captionConfig.height + subCaptionConfig.height);
                    break;
                default: // We put it on top by default
                    captionConfig.y = chartConfig.canvasTop;
                    break;
            }

            subCaptionConfig.y = captionConfig.y  + captionSubCaptionGap;

            if (captionConfig.isOnLeft) {
                // captionConfig.align = subCaptionConfig.align = POSITION_END;
                captionConfig.x = subCaptionConfig.x = chartConfig.marginLeft + maxWidth + borderWidth;
            } else {
                // captionConfig.align = subCaptionConfig.align = POSITION_START;
                captionConfig.x = subCaptionConfig.x = chartConfig.width -
                    chartConfig.marginRight - maxWidth - borderWidth;
            }
        },
        /*
         * Returns the postion for the caption placement.
         * @return extra spaces.
        */
        _fetchCaptionPos: function () {
            var extraSpace,
                iapi = this,
                components = iapi.components,
                caption = components.caption,
                captionConfig = caption.config;

            // check if even after placing the caption
            // space available on right.
            //left aligned.
            if (captionConfig.align === POSITION_END) {
                extraSpace = 0;
            }
            // right aligned
            else {
                extraSpace = -1;
            }
            return extraSpace;
        }
    }, chartAPI.vbullet);
}]);

FusionCharts.register('module', ['private', 'modules.renderer.js-thermometer', function() {
    var global = this,
        lib = global.hcLib,
        chartAPI = lib.chartAPI,
        win = global.window,
        COMPONENT = 'component',
        pluck = lib.pluck,
        pluckNumber = lib.pluckNumber,
        creditLabel = false && !lib.CREDIT_REGEX.test(win.location.hostname),
        UNDEFINED,
        preDefStr = lib.preDefStr,
        HUNDREDSTRING = lib.HUNDREDSTRING,
        convertColor = lib.graphics.convertColor,
        gaugeFillColorStr = preDefStr.gaugeFillColorStr,
        gaugeBorderColorStr = preDefStr.gaugeBorderColorStr,
        getLightColor = lib.graphics.getLightColor,
        DATASET = 'dataset',
        extend = function(a, b) {
            var n;
            if (!a) {
                a = {};
            }
            for (n in b) {
                a[n] = b[n];
            }
            return a;
        },
        defined = function(obj) {
            return obj !== UNDEFINED && obj !== null;
        },
        extend2 = lib.extend2;

    chartAPI('thermometer', {
        showRTvalue: false,
        canvasPadding: false,
        friendlyName: 'Horizontal Linear Gauge',
        creditLabel: creditLabel,
        defaultDatasetType: 'thermometer',
        defaultPaletteOptions: extend(extend2({}, lib.defaultGaugePaletteOptions), {
            gaugeBorderColor: ['545454', '60634E', '415D6F', '845001', '68001B'],
            gaugeFillColor: ['999999', 'ADB68F', 'A2C4C8', 'FDB548', 'FF7CA0'],
            periodColor: ['EEEEEE', 'ECEEE6', 'E6ECF0', 'FFF4E6', 'FFF2F5']
        }),
        standaloneInit: true,
        isHorizontal: false,
        isAxisOpposite: true,
        hasLegend: false,
        hasCanvas: false,
        drawPlotlines: false,
        drawPlotBands: false,
        isAxisReverse: false,
        isRealTime: true,
        applicableDSList: {
            'thermometer': true
        },

        _getData: function() {
            var iapi = this,
                components = iapi.components,
                dataset = components.dataset;

            if (dataset && dataset[0]) {
                return dataset[0].config.value;
            }
        },

        // todo: this function need to be removed once the flow is proper
        _parseSpecialConfig: function() {
            var iapi = this,
                chartConfig = iapi.config,
                dataObj = iapi.jsonData,
                chartOptions = dataObj.chart,
                apiCpmponents = iapi.components,
                numberFormatter = apiCpmponents.numberFormatter,
                colorM = apiCpmponents.colorManager,
                gaugeBorderAlpha;

            chartConfig.use3DLighting = pluckNumber(chartOptions.use3dlighting, 1);
            chartConfig.thmOriginX = pluckNumber(chartOptions.thmoriginx, chartOptions.gaugeoriginx);
            chartConfig.thmOriginY = pluckNumber(chartOptions.thmoriginy, chartOptions.gaugeoriginy);
            chartConfig.thmBulbRadius =
                pluckNumber(numberFormatter.getCleanValue(chartOptions.thmbulbradius, true));
            chartConfig.thmHeight = pluckNumber(numberFormatter.getCleanValue(pluckNumber(chartOptions.thmheight,
                chartOptions.gaugeheight), true));

            chartConfig.origW = pluckNumber(chartOptions.origw);
            chartConfig.origH = pluckNumber(chartOptions.origh);

            // set the falg whether the measurements are defined by user or not
            chartConfig.xDefined = defined(chartConfig.thmOriginX);
            chartConfig.yDefined = defined(chartConfig.thmOriginY);
            chartConfig.rDefined = defined(chartConfig.thmBulbRadius);
            chartConfig.hDefined = defined(chartConfig.thmHeight);

            chartConfig.gaugeFillColor = pluck(chartOptions.gaugefillcolor, chartOptions.thmfillcolor,
                colorM.getColor(gaugeFillColorStr));
            chartConfig.gaugeFillAlpha = pluckNumber(chartOptions.gaugefillalpha,
                chartOptions.thmfillalpha, HUNDREDSTRING);


            //Gauge Border properties
            chartConfig.showGaugeBorder = pluckNumber(chartOptions.showgaugeborder, 1);
            gaugeBorderAlpha = chartConfig.showGaugeBorder ? pluckNumber(chartOptions.gaugeborderalpha, 40) : 0;
            // We are using 40 for default alpha of Thermometer Gauge Border
            chartConfig.gaugeBorderColor = convertColor(pluck(chartOptions.gaugebordercolor,
                colorM.getColor(gaugeBorderColorStr)), gaugeBorderAlpha);
            chartConfig.gaugeBorderThickness = pluckNumber(chartOptions.gaugeborderthickness, 1);

            // Thermometer Glass color
            chartConfig.gaugeContainerColor = pluck(chartOptions.thmglasscolor,
                getLightColor(chartConfig.gaugeFillColor, 30));
        },

        _createDatasets: function() {
            var iapi = this,
                components = iapi.components,
                dataObj = iapi.jsonData,
                value = dataObj.value,
                datasetStore,
                datasetObj,
                defaultSeriesType = iapi.defaultDatasetType,
                dsType,
                DsClass,
                dymmyDS = {
                    data: [{
                        value: value
                    }]
                };

            datasetStore = components.dataset || (components.dataset = []);

            dsType = defaultSeriesType;

            if (dsType) {

                /// get the DsClass
                DsClass = FusionCharts.get(COMPONENT, [DATASET, dsType]);
                if (DsClass) {
                    if (!datasetStore[0]) {
                        // create the dataset Object
                        datasetObj = new DsClass();
                        datasetStore.push(datasetObj);
                        datasetObj.chart = iapi;
                        datasetObj.init(dymmyDS);
                    } else {
                        datasetStore[0].setValue(dymmyDS && dymmyDS.data && dymmyDS.data[0]);
                        datasetStore[0].configure();
                    }
                }
            }
        }
    }, chartAPI.axisgaugebase);
}]);

FusionCharts.register ('module', ['private', 'modules.renderer.js-cylinder', function () {
    var global = this,
        lib = global.hcLib,
        HUNDREDSTRING = lib.HUNDREDSTRING,

        //add the tools thats are requared
        pluck = lib.pluck,
        pluckNumber = lib.pluckNumber,
        extend2 = lib.extend2,
        getLightColor = lib.graphics.getLightColor,
        convertColor = lib.graphics.convertColor,
        chartAPI = lib.chartAPI,

        preDefStr = lib.preDefStr,
        colorStrings = preDefStr.colors,
        COLOR_FFFFFF = colorStrings.FFFFFF,

        gaugeFillColorStr = preDefStr.gaugeFillColorStr,
        gaugeBorderColorStr = preDefStr.gaugeBorderColorStr,


        extend = function (a, b) {
            var n;
            if (!a) {
                a = {};
            }
            for (n in b) {
                a[n] = b[n];
            }
            return a;
        },

        UNDEFINED,
        defined = function  (obj) {
            return obj !== UNDEFINED && obj !== null;
        };
    chartAPI('cylinder', {
        defaultDatasetType: 'cylinder',
        applicableDSList : {'cylinder' : true},
        defaultPaletteOptions : extend(extend2({}, lib.defaultGaugePaletteOptions), {
            gaugeBorderColor: ['545454', '60634E', '415D6F', '845001', '68001B'],
            gaugeFillColor: ['CCCCCC', 'ADB68F', 'E1F5FF', 'FDB548', 'FF7CA0'],
            periodColor: ['EEEEEE', 'ECEEE6', 'E6ECF0', 'FFF4E6', 'FFF2F5']
        }),
        glasscolor: COLOR_FFFFFF,
        // todo: this function need to be removed once the flow is proper
        _parseSpecialConfig: function () {
            var iapi = this,
                chartConfig = iapi.config,
                dataObj = iapi.jsonData,
                chartOptions = dataObj.chart,
                apiCpmponents = iapi.components,
                numberFormatter = apiCpmponents.numberFormatter,
                colorM = apiCpmponents.colorManager,
                gaugeBorderAlpha;

            chartConfig.use3DLighting = pluckNumber(chartOptions.use3dlighting, 1);
            chartConfig.gaugeOriginX = pluckNumber(chartOptions.thmoriginx, chartOptions.cyloriginx,
                chartOptions.gaugeoriginx);
            chartConfig.gaugeOriginY = pluckNumber(chartOptions.thmoriginy, chartOptions.cyloriginy,
                chartOptions.gaugeoriginy);
            chartConfig.gaugeRadius = pluckNumber(numberFormatter.getCleanValue(pluckNumber(chartOptions.thmbulbradius,
                chartOptions.cylradius, chartOptions.gaugeradius), true));
            chartConfig.gaugeHeight = pluckNumber(numberFormatter.getCleanValue(pluckNumber(chartOptions.thmheight,
                chartOptions.cylheight, chartOptions.gaugeheight), true));

            chartConfig.origW = pluckNumber(chartOptions.origw);
            chartConfig.origH = pluckNumber(chartOptions.origh);

            // set the falg whether the measurements are defined by user or not
            chartConfig.xDefined = defined(chartConfig.gaugeOriginX);
            chartConfig.yDefined = defined(chartConfig.gaugeOriginY);
            chartConfig.rDefined = defined(chartConfig.gaugeRadius);
            chartConfig.hDefined = defined(chartConfig.gaugeHeight);

            chartConfig.gaugeFillColor = pluck(chartOptions.gaugefillcolor, chartOptions.cylfillcolor,
                colorM.getColor(gaugeFillColorStr));
            chartConfig.gaugeFillAlpha = pluckNumber(chartOptions.gaugefillalpha,
                chartOptions.cylfillalpha, HUNDREDSTRING);

            chartConfig.gaugeYScale = pluckNumber(chartOptions.cylyscale, chartOptions.gaugeyscale, 30);

            if (chartConfig.gaugeYScale > 50 || chartConfig.gaugeYScale < 0){
                chartConfig.gaugeYScale = 30;
            }
            chartConfig.gaugeYScale = chartConfig.gaugeYScale / 100;

            //Gauge Border properties
            chartConfig.showGaugeBorder = pluckNumber(chartOptions.showgaugeborder, 1);
            gaugeBorderAlpha = chartConfig.showGaugeBorder ? pluckNumber(chartOptions.gaugeborderalpha,40) : 0;
            // We are using 40 for default alpha of cylender Gauge Border
            chartConfig.gaugeBorderColor = convertColor(pluck(chartOptions.gaugebordercolor,
                colorM.getColor(gaugeBorderColorStr)), gaugeBorderAlpha);
            chartConfig.gaugeBorderThickness = pluckNumber(chartOptions.gaugeborderthickness, 1);

            // Thermometer Glass color
            chartConfig.gaugeContainerColor = pluck(chartOptions.cylglasscolor,
                getLightColor(chartConfig.gaugeFillColor, 30));
        }
    }, chartAPI.thermometer);


}]);

FusionCharts.register ('module', ['private', 'modules.renderer.js-angulargauge', function () {
    var global = this,
        lib = global.hcLib,
        pluck = lib.pluck,
        UNDEFINED,
        getValidValue = lib.getValidValue,
        BLANK = lib.BLANKSTRING,
        COMPONENT = 'component',
        DATASET = 'dataset',
        preDefStr = lib.preDefStr,
        animationObjStr = preDefStr.animationObjStr,
        configStr = preDefStr.configStr,
        pluckNumber = lib.pluckNumber,
        win = global.window,
        convertColor = lib.graphics.convertColor,
        COMMASTRING = lib.COMMASTRING,
        math = Math,
        mathMax = math.max,
        mathMin = math.min,
        mathPI = math.PI,
        deg2rad = mathPI / 180,
        toRaphaelColor = lib.toRaphaelColor,
        AXIS = 'axis',
        creditLabel = false && !lib.CREDIT_REGEX.test (win.location.hostname),
        chartAPI = lib.chartAPI,
        extend2 = lib.extend2,
        pluckFontSize = lib.pluckFontSize, // To get the valid font size (filters negative values)
        defined = function  (obj) {
            return obj !== UNDEFINED && obj !== null;
        },
        extend = function (a, b) {
            var n;
            if (!a) {
                a = {};
            }
            for (n in b) {
                a[n] = b[n];
            }
            return a;
        };

    chartAPI('angulargauge', {
        friendlyName: 'Angular Gauge',
        creditLabel: creditLabel,
        defaultDatasetType: 'angulargauge',
        standaloneInit: true,
        isHorizontal: true,
        isAxisOpposite : false,
        isRealTime: true,
        hasLegend : false,
        drawPlotlines : false,
        drawPlotBands : false,
        isAxisReverse : false,
        colorRange : true,
        defaultPaletteOptions : extend(extend2({}, lib.defaultGaugePaletteOptions), {
            dialColor: ['999999,ffffff,999999', 'ADB68F,F3F5DD,ADB68F', 'A2C4C8,EDFBFE,A2C4C8',
                'FDB548,FFF5E8,FDB548', 'FF7CA0,FFD1DD,FF7CA0'],
            dialBorderColor: ['999999', 'ADB68F', 'A2C4C8', 'FDB548', 'FF7CA0'],
            pivotColor: ['999999,ffffff,999999', 'ADB68F,F3F5DD,ADB68F', 'A2C4C8,EDFBFE,A2C4C8',
                'FDB548,FFF5E8,FDB548', 'FF7CA0,FFD1DD,FF7CA0'],
            pivotBorderColor: ['999999', 'ADB68F', 'A2C4C8', 'FDB548', 'FF7CA0']
        }),
        rtParserModify : true,
        applicableDSList : {'angulargauge' : true},
        _spaceManager: function () {
            var iapi = this,
                availableWidth,
                availableHeight,
                config = iapi.config,
                components = iapi.components,
                dataSet = components.dataset[0],
                scale = components.scale,
                chart = dataSet.chart,
                jsonData = chart.jsonData,
                chartAttrs = jsonData.chart,
                datasetConfig = dataSet.config,
                scaleFactor = datasetConfig.scaleFactor,
                yPosExtra = 0,
                yNegExtra = 0,
                radius = 0,
                centerX = 0,
                centerY = 0,
                compositPivotRadius = datasetConfig.pivotRadius,
                labelFontSize = config.dataLabels.style.fontSize,
                displayValueLineHeight = config.dataLabels.style.lineHeight,
                displayValueCount = config.displayValueCount,
                chartBorderWidth = config.borderWidth,
                minChartWidth = config.minChartWidth,
                minChartHeight = config.minChartHeight,
                radiusDeduce = 0,
                gaugeSpacingObj,
                innerRadiusFactor,
                pivotRadius,
                axisSpace,
                axisLimit,
                gaugeStartPos,
                gaugeEndPos,
                chartBorderHorizontal,
                chartBorderVertical;
            //****** Manage space
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

            // availableHeight = config.canvasHeight * 0.225;
            // iapi._allocateSpace(iapi._manageCaptionSpacing(availableHeight));


            if (config.autoScale) {
                config.scaleFactor = scaleFactor = iapi._getScaleFactor(datasetConfig.origW,
                    datasetConfig.origH, config.width, config.height);
            }
            else {
                config.scaleFactor = scaleFactor = 1;
            }
            labelFontSize = labelFontSize.replace(/px/i, BLANK);
            displayValueLineHeight = displayValueLineHeight.replace(/px/i, BLANK);
            if (/^\d+\%$/.test(datasetConfig.gaugeinnerradius)) {
                innerRadiusFactor = parseInt(datasetConfig.gaugeinnerradius, 10) / 100;
            }
            else {
                innerRadiusFactor = 0.7;
            }

            pivotRadius = compositPivotRadius = pluckNumber(getValidValue(chartAttrs.pivotradius) * scaleFactor, 5);
            datasetConfig.pivotRadius = pivotRadius;
            compositPivotRadius = Math.max(compositPivotRadius, datasetConfig.rearExtension * scaleFactor);
            datasetConfig.compositPivotRadius = compositPivotRadius;

            yPosExtra = displayValueCount * displayValueLineHeight + 2 + pivotRadius;
            if (!datasetConfig.valueBelowPivot) {
                yNegExtra = yPosExtra;
                yPosExtra = 0;
            }

            datasetConfig.gaugeOuterRadius = pluckNumber(Math.abs(getValidValue(chartAttrs.gaugeouterradius) *
                scaleFactor));
            //Asume gauge inner radius to be a default of 70% of gauge outer radius
            datasetConfig.gaugeInnerRadius = pluckNumber(Math.abs(getValidValue(chartAttrs.gaugeinnerradius) *
                scaleFactor), datasetConfig.gaugeOuterRadius * innerRadiusFactor);

            availableWidth = config.canvasWidth * 0.7;
            availableHeight = config.canvasHeight * 0.7;
            // TODO space management to be done
            //iapi._allocateSpace(scale.placeAxis(mathMin(availableWidth, availableHeight)));
            axisSpace = scale.placeAxis(mathMin(availableWidth, availableHeight));
            // radiusDeduce = mathMax(axisSpace.left, axisSpace.right, axisSpace.top, axisSpace.bottom);

            availableHeight = config.canvasHeight * 0.7;
            iapi._manageChartMenuBar(availableHeight);

            gaugeSpacingObj = iapi._angularGaugeSpaceManager(datasetConfig.gaugeStartAngle, datasetConfig.gaugeEndAngle,
                config.canvasWidth, config.canvasHeight, datasetConfig.gaugeOuterRadius,
                pluckNumber((getValidValue(chartAttrs.gaugeoriginx) * scaleFactor) - config.canvasLeft),
                pluckNumber((getValidValue(chartAttrs.gaugeoriginy) * scaleFactor) - config.canvasTop),
                    Math.max(compositPivotRadius, labelFontSize),
                yPosExtra, yNegExtra);
            radius = gaugeSpacingObj.radius = pluckNumber(gaugeSpacingObj.radius, gaugeSpacingObj.maxRadius);
            datasetConfig.gaugeOriginX = gaugeSpacingObj.centerX + config.canvasLeft;
            datasetConfig.gaugeOriginY = gaugeSpacingObj.centerY + config.canvasTop;
            centerX = gaugeSpacingObj.centerX;
            centerY = gaugeSpacingObj.centerY;

            if (axisSpace.left < axisSpace.top) {
                if ((centerX - axisSpace.left) >= (radius - axisSpace.left) &&
                    (centerY - axisSpace.top) >= (radius - axisSpace.left)) {
                    radiusDeduce = axisSpace.left;
                } else {
                    radiusDeduce = axisSpace.top;
                }
            } else {
                if ((centerX - axisSpace.left) >= (radius - axisSpace.top) &&
                    (centerY - axisSpace.top) >= (radius - axisSpace.top)) {
                    radiusDeduce = axisSpace.top;
                } else {
                    radiusDeduce = axisSpace.left;
                }
            }
            radiusDeduce += scale.config.polarPadding;
            if (!datasetConfig.gaugeOuterRadius) {
                datasetConfig.gaugeOuterRadius = gaugeSpacingObj.radius;
                datasetConfig.gaugeOuterRadius -= radiusDeduce;
            }
            if (datasetConfig.gaugeInnerRadius === undefined) {
                datasetConfig.gaugeInnerRadius = datasetConfig.gaugeOuterRadius * innerRadiusFactor;
            }
            scale.setAxisConfig({
                centerX : datasetConfig.gaugeOriginX,
                centerY : datasetConfig.gaugeOriginY,
                radius : gaugeSpacingObj.radius || datasetConfig.gaugeOuterRadius,
                gaugeOuterRadius : datasetConfig.gaugeOuterRadius,
                gaugeInnerRadius : datasetConfig.gaugeInnerRadius,
                scaleFactor : scaleFactor

            });

            // For annotations
            axisLimit = scale.getLimit();
            gaugeStartPos = scale.getPixel(axisLimit.min);
            gaugeEndPos = scale.getPixel(axisLimit.max);
            config.gaugeStartX = config.canvasLeft;
            config.gaugeStartY = config.canvasTop;
            config.gaugeEndX = config.canvasRight;
            config.gaugeEndY = config.canvasBottom;
            config.gaugeCenterX = datasetConfig.gaugeOriginX;
            config.gaugeCenterY = datasetConfig.gaugeOriginY;
            config.gaugeStartAngle = datasetConfig.gaugeStartAngle/deg2rad;
            config.gaugeEndAngle = datasetConfig.gaugeEndAngle/deg2rad;
        },
        _createAxes : function() {
            var iapi = this,
                components = iapi.components,
                scale,
                PolarGaugeAxis = FusionCharts.register(COMPONENT, [AXIS, 'polarGauge']);

            components.scale = scale = new PolarGaugeAxis();

            scale.chart = iapi;

            scale.init();

        },
        _feedAxesRawData : function() {
            var iapi = this,
                components = iapi.components,
                colorM = components.colorManager,
                dataObj = iapi.jsonData,
                chartAttrs = dataObj.chart,
                scale,
                scaleConf,
                chartPaletteStr = lib.chartPaletteStr,
                palleteString = chartPaletteStr.chart2D,
                isAxisOpposite = pluckNumber(chartAttrs.axisontop, chartAttrs.axisonleft, (chartAttrs.
                    ticksbelowgauge !== undefined ? !chartAttrs.ticksbelowgauge : undefined), iapi.isAxisOpposite),
                isAxisReverse = pluckNumber(chartAttrs.reverseaxis, iapi.isAxisReverse);

            scaleConf = {
                outCanfontFamily: pluck(chartAttrs.outcnvbasefont, chartAttrs.basefont, 'Verdana,sans'),
                outCanfontSize:  pluckFontSize(chartAttrs.outcnvbasefontsize, chartAttrs.basefontsize, 10),
                outCancolor: pluck(chartAttrs.outcnvbasefontcolor, chartAttrs.basefontcolor,
                    colorM.getColor(palleteString.baseFontColor)).replace(/^#?([a-f0-9]+)/ig, '#$1'),
                useEllipsesWhenOverflow: chartAttrs.useellipseswhenoverflow,
                divLineColor: pluck(chartAttrs.vdivlinecolor, colorM.getColor(palleteString.divLineColor)),
                divLineAlpha: pluck(chartAttrs.vdivlinealpha, colorM.getColor('divLineAlpha')),
                divLineThickness: pluckNumber(chartAttrs.vdivlinethickness, 1),
                divLineIsDashed: Boolean(pluckNumber(chartAttrs.vdivlinedashed, chartAttrs.vdivlineisdashed, 0)),
                divLineDashLen: pluckNumber(chartAttrs.vdivlinedashlen, 4),
                divLineDashGap: pluckNumber(chartAttrs.vdivlinedashgap, 2),
                showAlternateGridColor: pluckNumber(chartAttrs.showalternatevgridcolor, 0),
                alternateGridColor: pluck(chartAttrs.alternatevgridcolor, colorM.getColor('altVGridColor')),
                alternateGridAlpha: pluck(chartAttrs.alternatevgridalpha, colorM.getColor('altVGridAlpha')),
                numDivLines: chartAttrs.numvdivlines,
                labelFont: chartAttrs.labelfont,
                labelFontSize: chartAttrs.labelfontsize,
                labelFontColor: chartAttrs.labelfontcolor,
                labelFontAlpha: chartAttrs.labelalpha,
                labelFontBold : chartAttrs.labelfontbold,
                labelFontItalic : chartAttrs.labelfontitalic,
                axisName: chartAttrs.xaxisname,
                axisMinValue: chartAttrs.lowerlimit,
                axisMaxValue: chartAttrs.upperlimit,
                setAdaptiveMin: chartAttrs.setadaptivemin,
                adjustDiv: chartAttrs.adjustvdiv,
                labelDisplay: chartAttrs.labeldisplay,
                showLabels: chartAttrs.showlabels,
                rotateLabels: chartAttrs.rotatelabels,
                slantLabel: pluckNumber(chartAttrs.slantlabels, chartAttrs.slantlabel),
                labelStep: pluckNumber(chartAttrs.labelstep, chartAttrs.xaxisvaluesstep),
                showAxisValues: pluckNumber(chartAttrs.showxaxisvalues,  chartAttrs.showxaxisvalue),
                showDivLineValues: pluckNumber(chartAttrs.showvdivlinevalues, chartAttrs.showvdivlinevalues),
                showZeroPlane: chartAttrs.showvzeroplane,
                zeroPlaneColor: chartAttrs.vzeroplanecolor,
                zeroPlaneThickness: chartAttrs.vzeroplanethickness,
                zeroPlaneAlpha: chartAttrs.vzeroplanealpha,
                showZeroPlaneValue: chartAttrs.showvzeroplanevalue,
                trendlineColor: chartAttrs.trendlinecolor,
                trendlineToolText: chartAttrs.trendlinetooltext,
                trendlineThickness: chartAttrs.trendlinethickness,
                trendlineAlpha: chartAttrs.trendlinealpha,
                showTrendlinesOnTop: chartAttrs.showtrendlinesontop,
                showAxisLine: pluckNumber(chartAttrs.showxaxisline, chartAttrs.showaxislines,
                    chartAttrs.drawAxisLines, 0),
                axisLineThickness: pluckNumber(chartAttrs.xaxislinethickness, chartAttrs.axislinethickness, 1),
                axisLineAlpha: pluckNumber(chartAttrs.xaxislinealpha, chartAttrs.axislinealpha, 100),
                axisLineColor: pluck(chartAttrs.xaxislinecolor, chartAttrs.axislinecolor, '#000000'),
                // Tick properties
                majorTMNumber : chartAttrs.majortmnumber,
                majorTMColor : chartAttrs.majortmcolor,
                majorTMAlpha : chartAttrs.majortmalpha,
                majorTMHeight : chartAttrs.majortmheight,
                tickValueStep : chartAttrs.tickvaluestep,
                showTickMarks : chartAttrs.showtickmarks,
                connectTickMarks : chartAttrs.connecttickmarks,
                showTickValues : chartAttrs.showtickvalues,
                majorTMThickness : chartAttrs.majortmthickness,
                upperlimit : components.numberFormatter.getCleanValue(chartAttrs.upperlimit),
                lowerlimit : components.numberFormatter.getCleanValue(chartAttrs.lowerlimit),
                reverseScale : chartAttrs.reversescale,
                // Whether to display the Limits
                showLimits: chartAttrs.showlimits,
                //Whether to automatically adjust TM
                adjustTM: chartAttrs.adjusttm,
                minorTMNumber: chartAttrs.minortmnumber,
                minorTMColor: chartAttrs.minortmcolor,
                minorTMAlpha : chartAttrs.minortmalpha,
                minorTMHeight: pluckNumber(chartAttrs.minortmheight, chartAttrs.minortmwidth),
                minorTMThickness: chartAttrs.minortmthickness,
                //Padding between tick mark start position and gauge
                tickMarkDistance: pluckNumber(chartAttrs.tickmarkdistance, chartAttrs.tickmarkgap),
                //Tick value distance
                tickValueDistance: pluckNumber(chartAttrs.tickvaluedistance, chartAttrs.displayvaluedistance),
                placeTicksInside: chartAttrs.placeticksinside,
                placeValuesInside: chartAttrs.placevaluesinside,
                upperLimitDisplay : chartAttrs.upperlimitdisplay,
                lowerLimitDisplay : chartAttrs.lowerlimitdisplay,
                ticksBelowGauge : chartAttrs.ticksbelowgauge,
                ticksBelowGraph : chartAttrs.ticksbelowgraph,
                trendValueDistance : chartAttrs.trendvaluedistance
            };
            scaleConf.trendPoints = dataObj.trendpoints;

            scale = components.scale;

            scale.setCommonConfigArr(scaleConf, !iapi.isHorizontal, isAxisReverse, isAxisOpposite);
            scale.configure();

        },
        _drawCanvas: function () {
            var iapi = this,
                chartComponents = iapi.components,
                dataSet = chartComponents.dataset[0],
                dsConfig = dataSet.config,
                graphics = dataSet.graphics || (dataSet.graphics = {}),
                scale = chartComponents.scale,
                colorM = chartComponents.colorManager,
                scaleRange = scale.config.axisRange,
                colorRangeGetter = chartComponents.colorRange,
                parentContainer = iapi.graphics.datasetGroup,
                labelParentContainer = iapi.graphics.datalabelsGroup,
                paper = chartComponents.paper,
                gaugeOuterRadius = dsConfig.gaugeOuterRadius,
                gaugeInnerRadius = dsConfig.gaugeInnerRadius,
                gaugeFillRatio = dsConfig.gaugeFillRatio,
                gaugeBorderColor = dsConfig.gaugeBorderColor,
                gaugeBorderThickness = dsConfig.gaugeBorderThickness,
                gaugeBorderAlpha = dsConfig.gaugeBorderAlpha,
                gaugeFillMix = dsConfig.gaugeFillMix,
                x = dsConfig.gaugeOriginX,
                y = dsConfig.gaugeOriginY,
                startAngle = dsConfig.gaugeStartAngle,
                showShadow = dsConfig.showShadow,
                minValue = scaleRange.min,
                maxValue = scaleRange.max,
                colorRange = colorRangeGetter ? colorRangeGetter.getColorRangeArr(minValue, maxValue) : [],
                animation = iapi.get(configStr, animationObjStr),
                animationDuration = animation.duration,
                dummyObj = animation.dummyObj,
                animObj = animation.animObj,
                animType = animation.animType,
                i = 0, ln = colorRange.length,
                colorObj, currentEndAngle,
                lastAngle = startAngle,
                nextAngle,
                crColor, crAlpha, crRatio, shadowAlpha,
                borderColor,
                borderAlpha,
                fcColorObj,
                count = 0;

            graphics.band = graphics.band || [];

            if (!graphics.bandGroup) {
                graphics.bandGroup = paper.group('bandGroup', parentContainer);
            }
            // Create the Point Group
            if (!graphics.pointGroup) {
                graphics.pointGroup = paper.group('pointers', labelParentContainer).translate(x, y);
            } else {
                graphics.pointGroup.animateWith(dummyObj, animObj, {
                    transform : 't' + x + COMMASTRING + y
                }, animationDuration, animType);
            }
            //draw all color Bands
            for (; i < ln; i += 1) {
                colorObj = colorRange[i];

                currentEndAngle = scale.getAngle(Math.min(colorObj.maxvalue, maxValue));

                //Parse the color, alpha and ratio array for each color range arc.
                crColor = colorM.parseColorMix(colorObj.code, gaugeFillMix);
                crAlpha = colorM.parseAlphaList(colorObj.alpha, crColor.length);
                crRatio = colorM.parseRatioList((gaugeInnerRadius / gaugeOuterRadius * 100) +
                    gaugeFillRatio, crColor.length);

                borderColor = colorObj.bordercolor;
                borderAlpha = pluckNumber(colorObj.borderAlpha, gaugeBorderAlpha);
                //Set border propeties
                //Which border color to use - between actual color and color mix specified?
                if (borderColor && borderColor.indexOf('{') == -1) {
                    borderColor = convertColor(borderColor, borderAlpha);
                }
                else {
                    borderColor = colorM.parseColorMix(colorObj.code, pluck(borderColor, gaugeBorderColor))[0];
                }
                borderColor = convertColor(borderColor, borderAlpha);
                //create the shadow element
                shadowAlpha = crAlpha.split(COMMASTRING);
                shadowAlpha = mathMax.apply(Math, shadowAlpha);
                shadowAlpha = showShadow ?
                    mathMax(gaugeBorderThickness && borderAlpha || 0, shadowAlpha) : 0;

                // If start angle > end angle then swap the two for intended
                // behavior.
                nextAngle = currentEndAngle;
                if (lastAngle > currentEndAngle) {
                    lastAngle += (currentEndAngle);
                    currentEndAngle = lastAngle - currentEndAngle;
                    lastAngle = lastAngle - currentEndAngle;
                }
                if ( !graphics.band[i] ) {
                    graphics.band[i] = paper.ringpath(x, y, gaugeOuterRadius, gaugeInnerRadius, lastAngle,
                        currentEndAngle,graphics.bandGroup);
                } else {
                    graphics.band[i].animateWith(dummyObj, animObj, {
                        ringpath : [x, y, gaugeOuterRadius, gaugeInnerRadius, lastAngle, currentEndAngle]
                    }, animationDuration, animType);
                }
                graphics.band[i].attr({
                        fill:  toRaphaelColor({
                            FCcolor : {
                                cx: x,
                                cy: y,
                                r: gaugeOuterRadius,
                                gradientUnits: 'userSpaceOnUse',
                                color:  crColor.join(),
                                alpha: crAlpha,
                                ratio: crRatio,
                                radialGradient: true
                            }
                        }),
                        'stroke-width': gaugeBorderThickness,
                        stroke: borderColor
                    })
                    .shadow({
                        apply: showShadow,
                        opacity : (shadowAlpha / 100)
                    });

                lastAngle = nextAngle;
                count += 1;
            }
            for (i = count, ln = graphics.band.length; i < ln; i += 1) {
                graphics.band[i].attr({
                    ringpath : [0,0,0,0,0]
                });
            }


            fcColorObj = dsConfig.isRadialGradient ? {
                color: dsConfig.pivotFillColor,
                alpha: dsConfig.pivotFillAlpha,
                ratio: dsConfig.pivotFillRatio,
                radialGradient: true,
                angle: dsConfig.pivotFillAngle,
                cx : 0.5,
                cy : 0.5,
                r : '50%'
            } : {
                color: dsConfig.pivotFillColor,
                alpha: dsConfig.pivotFillAlpha,
                ratio: dsConfig.pivotFillRatio,
                radialGradient: false,
                angle: dsConfig.pivotFillAngle
            };

            // Now draw the pivot
            if (!graphics.pivot) {
                graphics.pivot = paper.circle(labelParentContainer);
                graphics.pivot.attr({
                    cx: x,
                    cy: y,
                    r: dsConfig.pivotRadius
                });
            } else {
                graphics.pivot.animateWith(dummyObj, animObj, {
                    cx: x,
                    cy: y,
                    r: dsConfig.pivotRadius
                }, animationDuration, animType);
            }
            graphics.pivot.attr({
                fill: toRaphaelColor({
                    FCcolor: fcColorObj
                }),
                'stroke-width': dsConfig.pivotBorderThickness,
                stroke: dsConfig.pivotBorderColor
            })
            .shadow({
                apply: showShadow
            });

        },
        _createDatasets : function () {
            var iapi = this,
                components = iapi.components,
                dataObj = iapi.jsonData,
                pointers = dataObj.pointers || dataObj.dials,
                datasetStore,
                datasetObj,
                defaultSeriesType = iapi.defaultDatasetType,
                prevPointers,
                currPointers,
                dsType,
                DsClass;

            if (!pointers) {
                dataObj.dials = pointers = {
                    dial : [{
                        value : 0
                    }]
                };
            }

            datasetStore = components.dataset  || (components.dataset = []);

            dsType = defaultSeriesType;

            if (dsType) {

                /// get the DsClass
                DsClass = FusionCharts.get(COMPONENT, [DATASET, dsType]);
                if (DsClass) {
                    if (!datasetStore[0]) {
                        datasetObj = new DsClass();
                        datasetStore.push(datasetObj);
                        datasetObj.chart = iapi;
                        datasetObj.init(pointers);
                    }
                    else {
                        prevPointers = datasetStore[0].components.data && datasetStore[0].components.data.length;
                        currPointers = (pointers.dial && pointers.dial.length) || 0;

                        if (prevPointers > currPointers) {
                            datasetStore[0].removeData(prevPointers - currPointers);
                        }
                        datasetStore[0].configure();
                    }
                }
            }
        },
        _setCategories : function () {
        },
        _angularGaugeSpaceManager : function (startAngle, endAngle, canvasW, canvasH,
            radius, centerX, centerY, compositPivotRadius, yPosExtra, yNegExtra) {
            var rediusDefined = defined(radius),
                centerXDefined = defined(centerX),
                centerYDefined = defined(centerY),
                PI2 = Math.PI * 2,
                PI = Math.PI,
                PIby2 = Math.PI / 2,
                PI3by2 = PI + PIby2,
                calculatedRadus,
                returnObj = {
                    radius : radius,
                    centerX : centerX,
                    centerY : centerY
                },
                leftX, topY, rightX, bottomY, pivotCalRequard = false,
                startX, startY, endX, endY, tempRadius,
                resultantEnd, range, positiveLength, negativeLength,
                scale, startAbs = startAngle % PI2;

            if (startAbs < 0) {
                startAbs += PI2;
            }
            compositPivotRadius = compositPivotRadius || 0;
            if (compositPivotRadius && compositPivotRadius < canvasW / 2 && compositPivotRadius < canvasH / 2) {
                pivotCalRequard = true;
            }
            if (yPosExtra > canvasH / 2) {//max half height will be setteled
                yPosExtra = canvasH / 2;
            }
            if (yNegExtra > canvasH / 2) {//max half height will be setteled
                yNegExtra = canvasH / 2;
            }
            startX = Math.cos(startAngle);
            startY = Math.sin(startAngle);
            endX = Math.cos(endAngle);
            endY = Math.sin(endAngle);
            leftX = Math.min(startX, endX, 0);
            rightX = Math.max(startX, endX, 0);
            topY = Math.min(startY, endY, 0);
            bottomY = Math.max(startY, endY, 0);
            if (!rediusDefined || !centerXDefined || !centerYDefined) {
                scale = endAngle - startAngle;
                resultantEnd = startAbs + scale;
                if (resultantEnd > PI2 || resultantEnd < 0) {
                    rightX = 1;
                }
                if (scale > 0) {
                    if ((startAbs < PIby2 && resultantEnd > PIby2) || resultantEnd > PI2 + PIby2) {
                        bottomY = 1;
                    }
                    if ((startAbs < PI && resultantEnd > PI) || resultantEnd > PI2 + PI) {
                        leftX = -1;
                    }
                    if ((startAbs < PI3by2 && resultantEnd > PI3by2) || resultantEnd > PI2 + PI3by2) {
                        topY = -1;
                    }
                }
                else {
                    if ((startAbs > PIby2 && resultantEnd < PIby2) || resultantEnd < - PI3by2) {
                        bottomY = 1;
                    }
                    if ((startAbs > PI && resultantEnd < PI) || resultantEnd < - PI) {
                        leftX = -1;
                    }
                    if ((startAbs > PI3by2 && resultantEnd < PI3by2) || resultantEnd < - PIby2) {
                        topY = -1;
                    }
                }
                //now decide the x, y and radius
                if (!centerXDefined) {
                    range =  rightX - leftX;
                    tempRadius = canvasW / range;
                    centerX = -tempRadius * leftX;
                    calculatedRadus = tempRadius;
                    if (pivotCalRequard) {
                        if (canvasW - centerX < compositPivotRadius) {
                            centerX = canvasW - compositPivotRadius;
                            positiveLength = canvasW - centerX;
                            negativeLength = -centerX;
                            calculatedRadus = leftX ? Math.min(positiveLength / rightX, negativeLength / leftX):
                            positiveLength / rightX;
                        }
                        else if (centerX < compositPivotRadius){
                            centerX = compositPivotRadius;
                            positiveLength = canvasW - centerX;
                            negativeLength = -centerX;
                            calculatedRadus = leftX ? Math.min(positiveLength / rightX, negativeLength / leftX):
                            positiveLength / rightX;
                        }
                    }
                    returnObj.centerX = centerX;
                }
                else if (!rediusDefined) {
                    positiveLength = canvasW - centerX;
                    negativeLength = -centerX;
                    calculatedRadus = leftX ? Math.min(positiveLength / rightX, negativeLength / leftX):
                    positiveLength / rightX;
                }

                if (!centerYDefined) {
                    range =  bottomY - topY;
                    tempRadius = canvasH / range;
                    centerY = -tempRadius * topY;
                    if (pivotCalRequard) {
                        if (canvasH - centerY < compositPivotRadius) {
                            centerY = canvasH - compositPivotRadius;
                            positiveLength = canvasH - centerY;
                            negativeLength = -centerY;
                            calculatedRadus = Math.min(calculatedRadus, topY ? Math.min(positiveLength / bottomY,
                                negativeLength / topY) : positiveLength / bottomY);
                        }
                        else if (centerY < compositPivotRadius){
                            centerY = compositPivotRadius;
                            positiveLength = canvasH - centerY;
                            negativeLength = -centerY;
                            calculatedRadus = Math.min(calculatedRadus, topY ? Math.min(positiveLength / bottomY,
                                negativeLength / topY) : positiveLength / bottomY);
                        }
                    }
                    //yAxisExtra
                    if (canvasH - centerY < yPosExtra) {
                        centerY = canvasH - yPosExtra;
                        positiveLength = canvasH - centerY;
                        negativeLength = -centerY;
                        calculatedRadus = Math.min(calculatedRadus, topY ? Math.min(positiveLength / bottomY,
                            negativeLength / topY) : positiveLength / bottomY);
                    }
                    else if (centerY < yNegExtra){
                        centerY = yNegExtra;
                        positiveLength = canvasH - centerY;
                        negativeLength = -centerY;
                        calculatedRadus = Math.min(calculatedRadus, topY ? Math.min(positiveLength / bottomY,
                            negativeLength / topY) : positiveLength / bottomY);
                    }
                    calculatedRadus = Math.min(calculatedRadus, tempRadius);
                    returnObj.centerY = centerY;
                }
                else if (!rediusDefined) {
                    positiveLength = canvasH - centerY;
                    negativeLength = -centerY;
                    calculatedRadus = Math.min(calculatedRadus, topY ? Math.min(positiveLength / bottomY,
                        negativeLength / topY) : positiveLength / bottomY);
                }
                returnObj.maxRadius = calculatedRadus;
                if (returnObj.maxRadius <= 0) {
                    returnObj.maxRadius = Math.min(canvasW / 2, canvasH / 2);
                }
            }
            return returnObj;
        },
        _getScaleFactor : function (origW, origH, canvasWidth, canvasHeight) {
            var scaleFactor;
            origH = pluckNumber(origH, canvasHeight);
            origW = pluckNumber(origW, canvasWidth);
            if (!origH || !origW) {
                scaleFactor = 1;
            }
            // Now, if the ratio of original width,height & stage width,height are same
            else if ((origW / canvasWidth) == (origH / canvasHeight)) {
                //In this case, the transformation value would be the same, as the ratio
                //of transformation of width and height is same.
                scaleFactor = canvasWidth / origW;
            } else {
                //If the transformation factors are different, we do a constrained scaling
                //We get the aspect whose delta is on the lower side.
                scaleFactor = Math.min((canvasWidth / origW), (canvasHeight / origH));
            }


            return scaleFactor;
        },
        _setData : chartAPI.hlineargauge,
        _getData : chartAPI.hlineargauge,
        _getDataForId: chartAPI.hlineargauge,
        _setDataForId : chartAPI.hlineargauge

    }, chartAPI.axisgaugebase);

}]);

FusionCharts.register ('module', ['private', 'modules.renderer.js-bulb', function () {
    var global = this,
        lib = global.hcLib,
        win = global.window,
        creditLabel = false && !lib.CREDIT_REGEX.test (win.location.hostname),
        chartAPI = lib.chartAPI,
        COMPONENT = 'component',
        DATASET = 'dataset',
        pluckNumber = lib.pluckNumber,
        UNDEFINED;

    chartAPI('bulb', {
        showRTvalue : false,
        canvasPadding : false,
        friendlyName: 'Bulb Gauge',
        defaultSeriesType : 'bulb',
        defaultPlotShadow: 1,
        standaloneInit: true,
        drawAnnotations: true,
        charttopmargin : 10,
        chartrightmargin : 10,
        chartbottommargin : 10,
        chartleftmargin : 10,
        realtimeEnabled: true,
        isRealTime: true,
        defaultDatasetType : 'bulb',
        applicableDSList: {'bulb': true},
        creditLabel: creditLabel,

        _createDatasets : function () {
            var iapi = this,
                components = iapi.components,
                dataObj = iapi.jsonData,
                //data = dataObj.data,
                datasetStore,
                datasetObj,
                value = dataObj.value,
                defaultSeriesType = iapi.defaultDatasetType,
                dsType,
                DsClass,
                dataOnlyArr = [],
                JSONData,
                prevDataLength,
                currDataLength,
                datasetJSON;

            dataOnlyArr.push({
                value: value
            });

            datasetJSON = {data: dataOnlyArr};

            iapi.config.categories = dataOnlyArr;

            datasetStore = components.dataset  || (components.dataset = []);


            dsType = defaultSeriesType;

            if (dsType) {

                /// get the DsClass
                DsClass = FusionCharts.get(COMPONENT, [DATASET, dsType]);
                if (DsClass) {
                    if (!datasetStore[0]) {
                        datasetObj = new DsClass();
                        datasetStore.push(datasetObj);
                        datasetObj.chart = iapi;
                        datasetObj.init(datasetJSON);
                    }
                    else {
                        JSONData = datasetStore[0].JSONData;
                        prevDataLength = JSONData.data.length;
                        currDataLength = datasetJSON.data.length;
                        // Removing data plots if the number of current data plots is more than the existing ones.
                        if (prevDataLength > currDataLength) {
                            datasetStore[0].removeData(currDataLength - 1, prevDataLength - currDataLength, false);
                        }
                        datasetStore[0].JSONData = datasetJSON;
                        datasetStore[0].configure();
                    }
                }
            }
        },

        _drawCanvas: function () {

        },

        _spaceManager: function () {
            // todo marge _allocateSpace and _spacemanager
            var availableWidth,
                availableHeight,
                iapi = this,
                hasLegend = iapi.hasLegend,
                config = iapi.config,
                components = iapi.components,
                legend = components.legend,
                dataset = components.dataset[0],
                datasetConfig = dataset.config,
                is3d = iapi.is3D,
                chartAttrs = iapi.jsonData.chart,
                showBorder = pluckNumber (chartAttrs.showborder, is3d ? 0 : 1),
                chartBorderHorizontal,
                chartBorderVertical,
                minChartWidth = config.minChartWidth,
                minChartHeight = config.minChartHeight,
                chartBorderWidth =
                    config.borderWidth = showBorder ? pluckNumber (chartAttrs.borderthickness, 1) : 0;

            if (config.autoscale) {
                datasetConfig.scaleFactor = iapi._getScaleFactor(datasetConfig.origW,
                    datasetConfig.origH, config.width, config.height);
            }
            else {
                datasetConfig.scaleFactor = 1;
            }

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
            iapi._allocateSpace(iapi._manageActionBarSpace &&
                iapi._manageActionBarSpace(config.availableHeight * 0.225) || {});
            //****** Manage space
            availableWidth = config.canvasWidth * 0.7;
            availableHeight = config.canvasHeight * 0.7;

            (hasLegend !== false) &&
                iapi._allocateSpace (legend._manageLegendPosition (availableHeight));

            // a space manager that manages the space for the tools as well as the captions.
            iapi._manageChartMenuBar(availableHeight);

            dataset._manageSpace && iapi._allocateSpace(dataset._manageSpace(availableHeight));

        },

        _getData : chartAPI.vled,

        _getScaleFactor : chartAPI.angulargauge

    }, chartAPI.gaugebase, {
        placevaluesinside: 0,
        hasgaugeoriginx: UNDEFINED,
        gaugeoriginx: UNDEFINED,
        hasgaugeoriginy: UNDEFINED,
        gaugeoriginy: UNDEFINED,
        hasgaugeradius: UNDEFINED,
        gaugeradius: UNDEFINED,
        valuepadding: 2,
        showgaugeborder: 0,
        showhovereffect: UNDEFINED,
        autoscale: 1
    });

}]);

FusionCharts.register('module', ['private', 'modules.renderer.js-progressgauge', function() {
    var global = this,
        lib = global.hcLib,
        chartAPI = lib.chartAPI,
        win = global.window,
        creditLabel = false && !lib.CREDIT_REGEX.test(win.location.hostname);

    chartAPI('progressgauge', {
        friendlyName: 'Progress Gauge',
        creditLabel: creditLabel,
        defaultSeriesType: 'progressgauge',
        singleseries: true,
        gaugeType: 1,
        standaloneInit: true,
        defaultCaptionPadding: 5,
        hasLegend: true,
        defaultDatasetType: 'progressgauge',
        applicableDSList: {
            'progressgauge': true
        },

        _createDatasets: function() {
            var iapi = this,
                components = iapi.components,
                legend = components.legend,
                dataObj = iapi.jsonData,
                dataset = dataObj.dataset,
                data = dataObj.data || (dataset && dataset[0].data),
                datasetStore,
                datasetObj,
                defaultSeriesType = iapi.defaultDatasetType,
                dsType,
                GroupManager,
                groupManagerName,
                DsGroupClass,
                DsClass,
                JSONData,
                i,
                prevDataLength,
                currDataLength,
                dataStore,
                datasetJSON;

            datasetJSON = iapi._dataSegregator(data);

            iapi.config.categories = datasetJSON.data;

            datasetStore = components.dataset || (components.dataset = []);

            if (!(data && data.length !== 0)) {
                iapi.setChartMessage();
                return;
            }

            dsType = defaultSeriesType;
            if (dsType) {

                /// get the DsClass
                DsClass = FusionCharts.get('component', ['dataset', dsType]);
                if (DsClass) {
                    groupManagerName = 'datasetGroup_' + dsType;
                    // get the ds group class
                    DsGroupClass = FusionCharts.register('component', ['datasetGroup', dsType]);
                    GroupManager = components[groupManagerName];
                    if (DsGroupClass && !GroupManager) {
                        GroupManager = components[groupManagerName] = new DsGroupClass();
                        GroupManager.chart = iapi;
                        GroupManager.init();
                        // groupManager.init (components, graphics);
                        // groupManager.dataSetsLen = length;
                    }
                    // If the dataset does not exists.
                    if (!datasetStore[0]) {
                        // create the dataset Object
                        datasetObj = new DsClass();
                        datasetStore.push(datasetObj);
                        datasetObj.chart = iapi;
                        GroupManager && GroupManager.addDataSet(datasetObj, 0, 0);
                        datasetObj.index = 0;
                        datasetObj.init(datasetJSON);
                    } else {
                        JSONData = datasetStore[0].JSONData;
                        dataStore = datasetStore[0].components.data || [];
                        prevDataLength = JSONData.data.length;
                        currDataLength = (datasetJSON.data && datasetJSON.data.length) || 0;
                        // Removing data plots if the number of current data plots is more than the existing ones.
                        if (prevDataLength > currDataLength) {
                            // If there is legend then remove the extra legend items
                            if (legend) {
                                for (i = currDataLength; i < prevDataLength; i++) {
                                    if (dataStore[i] && dataStore[i].legendItemId) {
                                        legend.removeItem(dataStore[i].legendItemId);
                                    }
                                }
                            }

                            datasetStore[0].removeData(currDataLength, prevDataLength - currDataLength, false);

                        }
                        datasetStore[0].JSONData = datasetJSON;
                        datasetStore[0].configure();
                    }
                }
            }
        },

        getDataSet: function(index) {
            return this.components.dataset[index];
        }

    }, chartAPI.bulb);
}]);

FusionCharts.register ('module', ['private', 'modules.renderer.js-drawingpad', function () {
    var global = this,
        lib = global.hcLib,
        R = lib.Raphael,
        preDefStr = lib.preDefStr,
        animationObjStr = preDefStr.animationObjStr,
        configStr = preDefStr.configStr,
        win = global.window,
        ROUND = preDefStr.ROUND,
        colorStrings = preDefStr.colors,
        COLOR_FFFFFF = colorStrings.FFFFFF,
        creditLabel = false && !lib.CREDIT_REGEX.test (win.location.hostname),
        chartAPI = lib.chartAPI;

    chartAPI ('drawingpad', {
        standaloneInit : true,
        friendlyName : 'Drawing Pad',
        creditLabel : creditLabel,
        bgColor : COLOR_FFFFFF,
        bgAlpha : '100',
        draw : function () {
            var iapi = this,
                config = iapi.config,
                container = iapi.linkedItems.container,
                chartInstance = iapi.chartInstance,
                components = iapi.components,
                paper = components.paper,
                animationObj = iapi.get(configStr, animationObjStr),
                animType = animationObj.animType,
                dummyObj = animationObj.dummyObj,
                animObj = animationObj.animObj,
                animationDuration = animationObj.duration,
                tooltip = components.tooltip,
                prevWidth = config.prevWidth,
                prevHeight = config.prevHeight,
                animationStarted,
                attr;

            config.width = container.offsetWidth;
            config.height = container.offsetHeight;

            //show the chart if hidden
            iapi._show();

            config.animationStarted = true;
            if (!paper) {
                paper = components.paper = new R (container, container.offsetWidth, container.offsetHeight);
                paper.setConfig('stroke-linecap', ROUND);
            }
            else {
                // Fix for IE8 paper animation.
                if (prevWidth || prevHeight) {
                    paper.setSize(prevWidth, prevHeight);
                }
                attr = {
                    width: container.offsetWidth,
                    height: container.offsetHeight
                };

                animationStarted = true;
                iapi._chartAnimation(true);
                paper.animateWith(dummyObj, animObj, attr, animationDuration, animType);
            }

            config.prevWidth = container.offsetWidth;
            config.prevHeight = container.offsetHeight;
            // Setting tooltip style
            paper.tooltip(tooltip.style, tooltip.config.shadow, tooltip.config.constrain);

            //create drawing layers
            iapi._createLayers ();
            //Start the chart animation
            !animationStarted && iapi._chartAnimation(true);
            // draw components
            iapi._drawBackground ();

            if (chartInstance.annotations) {
                iapi._drawAnnotations ();
            }
            else {
                iapi.setChartMessage();
                return;
            }

            iapi._drawCreditLabel();
        },
        _createDatasets : function () {}
    }, chartAPI.mscartesian);
}]);

FusionCharts.register ('module', ['private', 'modules.renderer.js-realtimearea', function () {
    var global = this,
        lib = global.hcLib,
        chartAPI = lib.chartAPI;

    chartAPI ('realtimearea', {
        defaultDatasetType : 'realtimearea',
        axisPaddingLeft: 0,
        axisPaddingRight: 0,
        applicableDSList: { 'realtimearea': true }
    },chartAPI.realtimecolumn, {
        enablemousetracking: true
    }, chartAPI.areabase);
}]);

FusionCharts.register('module', ['private', 'modules.renderer.js-realtimestackedarea', function() {
    var global = this,
        lib = global.hcLib,
        chartAPI = lib.chartAPI;

    chartAPI('realtimestackedarea', {
        defaultDatasetType: 'realtimearea',
        applicableDSList: {
            'realtimearea': true
        }
    }, chartAPI.realtimearea, {
        isstacked: true,
        enablemousetracking: true
    });
}]);

FusionCharts.register ('module', ['private', 'modules.renderer.js-realtimeline', function () {
    var global = this,
        lib = global.hcLib,
        chartAPI = lib.chartAPI;

    chartAPI ('realtimeline', {
        defaultDatasetType : 'realtimeline',
        axisPaddingLeft: 0,
        axisPaddingRight: 0,
        applicableDSList: { 'realtimeline': true },
        zeroplanethickness: 1,
        zeroplanealpha: 40,
        showzeroplaneontop: 0
    },chartAPI.realtimecolumn, {
        zeroplanethickness: 1,
        zeroplanealpha: 40,
        showzeroplaneontop: 0,
        enablemousetracking: true
    }, chartAPI.areabase);

}]);

FusionCharts.register ('module', ['private', 'modules.renderer.js-realtimelinedy', function () {
    var global = this,
        lib = global.hcLib,
        chartAPI = lib.chartAPI;

    chartAPI ('realtimelinedy', {
        isRealTime: true,
        defaultDatasetType : 'realtimeline',
        axisPaddingLeft: 0,
        isDual: true,
        axisPaddingRight: 0,
        applicableDSList: { 'realtimeline': true },
        _createAxes: chartAPI.msdybasecartesian._createAxes,
        _setAxisLimits: chartAPI.msdybasecartesian._setAxisLimits,
        _postSpaceManagement: chartAPI.msdybasecartesian._postSpaceManagement,
        _feedAxesRawData: chartAPI.msdybasecartesian._feedAxesRawData
    },chartAPI.realtimecolumn, {
        isdual: true,
        zeroplanethickness: 1,
        zeroplanealpha: 40,
        showzeroplaneontop: 0,
        enablemousetracking: true
    }, chartAPI.areabase);
}]);

/* jshint ignore: end */

}));
