
(function (factory) {
    if (typeof module === 'object' && typeof module.exports !== "undefined") {
        module.exports = factory;
    } else {
        factory(FusionCharts);
    }
}(function (FusionCharts) {

/**!
 * @license FusionCharts JavaScript Library - Gantt Chart
 * Copyright FusionCharts Technologies LLP
 * License Information at <http://www.fusioncharts.com/license>
 *
 * @version 3.12.0
 */
/**
 * @private
 * @module fusioncharts.renderer.javascript.gantt
 * @export fusioncharts.gantt.js
 */
FusionCharts.register ('module', ['private', 'modules.renderer.js-gantt', function () {
    var global = this,
        lib = global.hcLib,
        win = global.window,
        userAgent = win.navigator.userAgent,
        isIE = /msie/i.test (userAgent) && !win.opera,
        chartapi = lib.chartAPI,
        extend2 = lib.extend2,
        pluck = lib.pluck,
        pluckNumber = lib.pluckNumber,
        pluckFontSize = lib.pluckFontSize,
        getFirstColor = lib.getFirstColor,
        parseConfiguration = lib.parseConfiguration,
        setAttribDefs = lib.setAttribDefs,
        //hasAttribDefs = lib.hasAttribDefs,
        graphics = lib.graphics,
        convertColor = graphics.convertColor,
        getDarkColor = graphics.getDarkColor,
        parseUnsafeString = lib.parseUnsafeString,
        getFirstValue = lib.getFirstValue,
        getValidValue = lib.getValidValue,
        toPrecision = lib.toPrecision,
        R = lib.Raphael,
        chartPaletteStr = lib.chartPaletteStr,
        componentDispose = lib.componentDispose,
        schedular = lib.schedular,
        COMMA = lib.COMMASTRING,
        setLineHeight = lib.setLineHeight,
        getDashStyle = lib.getDashStyle,
        toRaphaelColor = lib.toRaphaelColor,
        each = lib.each,
        ROLLOVER = 'DataPlotRollOver',
        ROLLOUT = 'DataPlotRollOut',
        attrTypeNum = lib.attrTypeNum,
        attrTypeBool = lib.attrTypeBool,
        PXSTRING = 'px',
        BLANK = '',
        MAX_MITER_LINEJOIN = 2,
        dropHash = lib.dropHash,
        HASHSTRING = lib.HASHSTRING,
        creditLabel = false && !lib.CREDIT_REGEX.test (win.location.hostname),
        TRACKER_FILL = 'rgba(192,192,192,'+ (isIE ? 0.002 : 0.000001) +')', // invisible but clickable
        UNDEF,
        // The default value for stroke-dash attribute.
        DASH_DEF = 'none',
        mapSymbolName = graphics.mapSymbolName,
        math = Math,
        mathMax = math.max,
        mathMin = math.min,
        mathAbs = math.abs,
        pInt = parseInt,
        toFloat = parseFloat,
        M = 'M',
        L = 'L',
        v = 'v',
        H = 'H',
        PX = 'px',
        ATTRFN = 'attr',
        BOLD = 'bold',
        ITALIC = 'italic',
        NORMAL = 'normal',
        NONE = 'none',
        UND_LINE = 'underline',
        POSITION_BOTTOM = 'bottom',
        getLightColor = lib.graphics.getLightColor,
        plotEventHandler = lib.plotEventHandler,
        hoverTimeout,
        lastHoverEle,
        merge = function () { /** @todo refactor dependency */
            var args = arguments;
            return lib.extend2 (lib.extend2 (lib.extend2 (lib.extend2 ( { }, args[0]), args[1]), args[2]), args[3]);
        },

        UNDEFINED,

        defined = function (obj) {
            return obj !== UNDEFINED && obj !== null;
        },
        isPercent = function (srt) {
            return (/%/g).test (srt);
        },
        align = {
            left: 'start',
            right: 'end',
            center: 'middle'
        },
        xAlign = {
            left: 0,
            right: 1,
            center: 0.5,
            'undefined': 0.5
        },
        alignGutter = {
            left: 5,
            right: -5,
            center: 0,
            'undefined': 0
        },
        emptyFn = function () {
        },
        checkInvalidValue = function () {
            var i = 0,
                ii = arguments.length,
                allValuesValid = false,
                val;

            for (i = 0; i < ii; i++) {
                val = arguments[i];
                if (isNaN(val)) {
                    return false;
                }
                else {
                    allValuesValid = true;
                }
            }
            return allValuesValid;

        },
        stylePropValues = {
            fontWeight: [NORMAL, BOLD],
            fontStyle: [NORMAL, ITALIC]
        },
        extractLabelStyle = function (styleObj) {
            var style,
                prop;

            for (prop in styleObj) {
                if (styleObj[prop] !== UNDEFINED) {
                    style = style || {};
                    switch (prop) {
                        case 'fontWeight':
                        case 'fontStyle':
                            style[prop] = stylePropValues[prop][styleObj[prop]];
                            break;
                        default:
                            style[prop] = styleObj[prop];
                    }
                }
            }
            return style;
        };
    // New gantt API
    chartapi('gantt', {
        defaultDatasetType: 'task',
        applicableDSList: {'task': true, 'milestone': true, 'connectors': true},
        fireGroupEvent: true,
        aligncaptionwithcanvas: 0,
        hasInteractiveLegend: false,
        creditLabel: creditLabel,
        //init: function (){},
        //configure: function(){},
        //manageSpace: function(){},
        //draw: function(){}
        _createDatasets : function () {
            var iapi = this,
                config = iapi.config,
                components = iapi.components,
                dataObj = iapi.jsonData,
                dataset = [],
                length,
                i,
                datasetStore,
                datasetStoreLen,
                datasetObj,
                datasets,
                defaultSeriesType = iapi.defaultDatasetType,
                applicableDSList = iapi.applicableDSList,
                dsType,
                DsClass,
                datasetJSON,
                JSONData,
                datasetMap = config.datasetMap || (config.datasetMap = {
                    'task': [],
                    'milestone': [],
                    'connectors': []
                }),
                tempMap = {
                    'task': [],
                    'milestone': [],
                    'connectors': []
                },
                dsTypeRef,
                dsRef,
                prevDataLength,
                currDataLength,
                dataType,
                dsCount = { };
            if (dataObj.tasks) {
                dataset = dataset.concat(dataObj.tasks);
            }
            if (dataObj.milestones) {
                dataset = dataset.concat(dataObj.milestones);
            }
            if (dataObj.connectors) {
                dataset = dataset.concat(dataObj.connectors);
            }
            length = dataset && dataset.length;

            if(dataset && !(dataset instanceof Array)){
                dataset = [dataset];
                length = 1;
            }

            if (!length) {
                iapi.setChartMessage();
            }

            iapi.config.categories = dataObj.categories && dataObj.categories[0].category;

            datasetStore = components.dataset = [];
            datasetStoreLen = datasetStore.length;

            for (i=0; i<length; i++) {
                datasetJSON = dataset[i];


                if (datasetJSON.task) {
                    dsType = 'task';
                    dataType = dsType;
                }
                else if (datasetJSON.milestone) {
                    dsType = 'milestone';
                    dataType = dsType;
                }
                else if (datasetJSON.connector) {
                    dsType = 'connectors';
                    dataType = 'connector';
                }
                dsType = dsType && dsType.toLowerCase ();

                if (!applicableDSList[dsType]) {
                    dsType = defaultSeriesType;
                }

                /// get the DsClass
                DsClass = FusionCharts.get('component', ['dataset', dsType]);
                if (DsClass) {
                    if (dsCount[dsType] === UNDEFINED) {
                        dsCount[dsType] = 0;
                    }
                    else {
                        dsCount[dsType]++;
                    }

                    dsTypeRef = datasetMap[dsType];
                    dsRef = dsTypeRef[0];
                    // If the dataset does not exists.
                    if (!dsRef) {
                        // create the dataset Object
                        datasetObj = new DsClass ();
                        tempMap[dsType].push(datasetObj);
                        datasetStore.push (datasetObj);
                        datasetObj.chart = iapi;
                        datasetObj.index = i;
                        datasetObj.init (datasetJSON);
                    }
                    // If the dataset exists incase the chart is updated using setChartData() method.
                    else {
                        JSONData = dsRef.JSONData;
                        prevDataLength = JSONData[dataType].length;
                        currDataLength = datasetJSON[dataType].length;
                        tempMap[dsType].push(dsRef);
                        datasetStore.push(dsRef);
                        dsRef.index = i;
                        // Removing data plots if the number of current data plots is more than the existing ones.
                        if (prevDataLength > currDataLength) {
                            dsRef.removeData(currDataLength - 1, prevDataLength - currDataLength, false);
                        }
                        dsRef.JSONData = datasetJSON;
                        dsRef.configure();
                        dsTypeRef.shift();
                    }
                }
            }

            iapi._createLegendItems();

            // Removing unused datasets if any
            for (dsType in datasetMap) {
                datasets = datasetMap[dsType];
                length = datasets.length;
                if (length) {
                    for (i = 0; i < length; i++) {
                        datasetObj = datasets[i];
                        if (datasetObj) {
                            // legend.removeItem(datasets[j].legendItemId);
                            componentDispose.call(datasetObj);
                        }

                    }
                }
            }
            config.datasetMap = tempMap;
        },

        configure: function () {
            var iapi = this,
                config = iapi.config,
                jsonData = iapi.jsonData,
                background = iapi.components.background,
                bConfig = background.config,
                chartAttrs = jsonData.chart;
            this.__setDefaultConfig();
            chartapi.mscartesian.configure.call(this);
            config.showBorder = pluckNumber(chartAttrs.showborder, 0);
            config.borderWidth = config.showBorder ? pluckNumber (chartAttrs.borderthickness, 1) : 0;
            bConfig.borderWidth = config.borderWidth;
            config.lastVScrollPosition = UNDEFINED;
            config.lastHScrollPosition = UNDEFINED;

        },
        _createLegendItems: function () {
            var iapi = this,
                components = iapi.components,
                dataObj = iapi.jsonData,
                legend = components.legend,
                length,
                i,
                strokeColor,
                lightColor,
                color,
                fillColor,
                itemObj,
                config,
                prevLen,
                currLen,
                legendItem,
                legendItemsArray = components.legendItems,
                items = dataObj.legend && dataObj.legend.item || [];

            prevLen = components.legendItems && components.legendItems.length || 0;
            currLen = items.length;
            if (prevLen > currLen) {
                legend.emptyItems(currLen, prevLen - currLen);
                legendItemsArray && legendItemsArray.splice(currLen, prevLen - currLen);
            }

            if (!legendItemsArray) {
                components.legendItems = legendItemsArray = [];
            }

            for (i = 0, length = items.length; i < length; i++) {
                itemObj = items[i];
                legendItem = legendItemsArray[i];
                color = itemObj.color;
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

                !legendItem && (legendItem = legendItemsArray[i] = {});
                config = {
                    fillColor : toRaphaelColor(fillColor),
                    strokeColor: toRaphaelColor(strokeColor),
                    label : itemObj.label,
                    interactiveLegend: false,
                    legendItemId: legendItem.legendItemId
                };
                legendItemsArray[i].legendItemId = legend.addItems(iapi, emptyFn, config);
            }

        },
        _setAxisLimits: function () {

        },
        _createAxes : function () {
            var iapi = this,
                components = iapi.components,
                TimeAxis = FusionCharts.get ('component', ['axis', 'time']),
                ProcessAxis = FusionCharts.get ('component', ['axis', 'process']),
                yAxis,
                xAxis;


            components.yAxis = [];
            components.xAxis = [];
            components.yAxis[0] = yAxis = new ProcessAxis ();
            components.xAxis[0] = xAxis = new TimeAxis ();
            yAxis.chart = iapi;
            xAxis.chart = iapi;

            yAxis.init ();
            xAxis.init ();
        },

        _feedAxesRawData : function () {
            var iapi = this,
                components = iapi.components,
                colorM = components.colorManager,
                dataObj = iapi.jsonData,
                chartAttrs = dataObj.chart,
                xAxisConf,
                yAxisConf,
                is3d = iapi.is3d,
                palleteString = is3d ? chartPaletteStr.chart3D : chartPaletteStr.chart2D,
                yAxis,
                xAxis;


            xAxisConf = {
                outCanfontFamily: pluck (chartAttrs.outcnvbasefont, chartAttrs.basefont, 'Verdana,sans'),
                outCanfontSize:  pluckFontSize (chartAttrs.outcnvbasefontsize, chartAttrs.basefontsize, 10),
                outCancolor: pluck (chartAttrs.outcnvbasefontcolor, chartAttrs.basefontcolor,
                    colorM.getColor (palleteString.baseFontColor)).replace (/^#? ([a-f0-9]+)/ig, '#$1'),
                axisBreaks : chartAttrs.xaxisbreaks,
                axisNamePadding: chartAttrs.xaxisnamepadding,
                axisValuePadding: chartAttrs.labelpadding,
                axisNameFont: chartAttrs.xaxisnamefont,
                axisNameFontSize: chartAttrs.xaxisnamefontsize,
                axisNameFontColor: chartAttrs.xaxisnamefontcolor,
                axisNameFontBold: chartAttrs.xaxisnamefontbold,
                axisNameFontItalic: chartAttrs.xaxisnamefontitalic,
                axisNameBgColor: chartAttrs.xaxisnamebgcolor,
                axisNameBorderColor: chartAttrs.xaxisnamebordercolor,
                axisNameAlpha: chartAttrs.xaxisnamealpha,
                axisNameFontAlpha: chartAttrs.xaxisnamefontalpha,
                axisNameBgAlpha: chartAttrs.xaxisnamebgalpha,
                axisNameBorderAlpha: chartAttrs.xaxisnameborderalpha,
                axisNameBorderPadding: chartAttrs.xaxisnameborderpadding,
                axisNameBorderRadius: chartAttrs.xaxisnameborderradius,
                axisNameBorderThickness: chartAttrs.xaxisnameborderthickness,
                axisNameBorderDashed: chartAttrs.xaxisnameborderdashed,
                axisNameBorderDashLen: chartAttrs.xaxisnameborderdashlen,
                axisNameBorderDashGap: chartAttrs.xaxisnameborderdashgap,
                useEllipsesWhenOverflow: chartAttrs.useellipseswhenoverflow,
                divLineColor: pluck (chartAttrs.vdivlinecolor, colorM.getColor (palleteString.divLineColor)),
                divLineAlpha: pluck (chartAttrs.vdivlinealpha, is3d ? colorM.getColor('divLineAlpha3D') :
                    colorM.getColor ('divLineAlpha')),
                divLineThickness: pluckNumber (chartAttrs.vdivlinethickness, 1),
                divLineIsDashed: Boolean (pluckNumber (chartAttrs.vdivlinedashed, chartAttrs.vdivlineisdashed, 0)),
                divLineDashLen: pluckNumber (chartAttrs.vdivlinedashlen, 4),
                divLineDashGap: pluckNumber (chartAttrs.vdivlinedashgap, 2),
                showAlternateGridColor: pluckNumber (chartAttrs.showalternatevgridcolor, 0),
                alternateGridColor: pluck (chartAttrs.alternatevgridcolor, colorM.getColor ('altVGridColor')),
                alternateGridAlpha: pluck (chartAttrs.alternatevgridalpha, colorM.getColor ('altVGridAlpha')),
                numDivLines: pluckNumber(chartAttrs.numvdivlines, iapi.numVDivLines),
                labelFont: chartAttrs.labelfont,
                labelFontSize: chartAttrs.labelfontsize,
                labelFontColor: chartAttrs.labelfontcolor,
                labelFontAlpha: chartAttrs.labelalpha,
                labelFontBold: chartAttrs.labelfontbold,
                labelFontItalic: chartAttrs.labelfontitalic,
                maxLabelHeight : chartAttrs.maxlabelheight,
                axisName: chartAttrs.xaxisname,
                axisMinValue: chartAttrs.xaxisminvalue,
                axisMaxValue: chartAttrs.xaxismaxvalue,
                setAdaptiveMin: chartAttrs.setadaptivexmin,
                adjustDiv: chartAttrs.adjustvdiv,
                labelDisplay: chartAttrs.labeldisplay,
                showLabels: chartAttrs.showlabels,
                rotateLabels: chartAttrs.rotatelabels,
                slantLabel: pluckNumber (chartAttrs.slantlabels, chartAttrs.slantlabel),
                labelStep: pluckNumber (chartAttrs.labelstep, chartAttrs.xaxisvaluesstep),
                showAxisValues: pluckNumber (chartAttrs.showxaxisvalues,  chartAttrs.showxaxisvalue),
                showLimits: pluckNumber(chartAttrs.showvlimits, iapi.showvlimits),
                showDivLineValues: pluckNumber (chartAttrs.showvdivlinevalues, chartAttrs.showvdivlinevalues),
                //showZeroPlane: chartAttrs.showvzeroplane,
                zeroPlaneColor: chartAttrs.vzeroplanecolor,
                zeroPlaneThickness: chartAttrs.vzeroplanethickness || 2,
                zeroPlaneAlpha: chartAttrs.vzeroplanealpha,
                showZeroPlaneValue: chartAttrs.showvzeroplanevalue,
                trendlineColor: chartAttrs.trendlinecolor,
                trendlineToolText: chartAttrs.trendlinetooltext,
                trendlineThickness: chartAttrs.trendlinethickness,
                trendlineAlpha: chartAttrs.trendlinealpha,
                showTrendlinesOnTop: chartAttrs.showtrendlinesontop,
                showAxisLine: pluckNumber (chartAttrs.showxaxisline, chartAttrs.showaxislines,
                    chartAttrs.drawAxisLines, 0),
                axisLineThickness: pluckNumber (chartAttrs.xaxislinethickness, chartAttrs.axislinethickness, 1),
                axisLineAlpha: pluckNumber (chartAttrs.xaxislinealpha, chartAttrs.axislinealpha, 100),
                axisLineColor: pluck (chartAttrs.xaxislinecolor, chartAttrs.axislinecolor, '#000000')
            };
            yAxisConf = {
                outCanfontFamily: pluck (chartAttrs.outcnvbasefont, chartAttrs.basefont, 'Verdana,sans'),
                outCanfontSize:  pluckFontSize (chartAttrs.outcnvbasefontsize, chartAttrs.basefontsize, 10),
                outCancolor: pluck (chartAttrs.outcnvbasefontcolor, chartAttrs.basefontcolor,
                    colorM.getColor (palleteString.baseFontColor)).replace (/^#? ([a-f0-9]+)/ig, '#$1'),
                axisBreaks : chartAttrs.yaxisbreaks,
                axisNamePadding: chartAttrs.yaxisnamepadding,
                axisValuePadding: chartAttrs.yaxisvaluespadding,
                axisNameFont: chartAttrs.yaxisnamefont,
                axisNameFontSize: chartAttrs.yaxisnamefontsize,
                axisNameFontColor: chartAttrs.yaxisnamefontcolor,
                axisNameFontBold: chartAttrs.yaxisnamefontbold,
                axisNameFontItalic: chartAttrs.yaxisnamefontitalic,
                axisNameBgColor: chartAttrs.yaxisnamebgcolor,
                axisNameBorderColor: chartAttrs.yaxisnamebordercolor,
                axisNameAlpha: chartAttrs.yaxisnamealpha,
                axisNameFontAlpha: chartAttrs.yaxisnamefontalpha,
                axisNameBgAlpha: chartAttrs.yaxisnamebgalpha,
                axisNameBorderAlpha: chartAttrs.yaxisnameborderalpha,
                axisNameBorderPadding: chartAttrs.yaxisnameborderpadding,
                axisNameBorderRadius: chartAttrs.yaxisnameborderradius,
                axisNameBorderThickness: chartAttrs.yaxisnameborderthickness,
                axisNameBorderDashed: chartAttrs.yaxisnameborderdashed,
                axisNameBorderDashLen: chartAttrs.yaxisnameborderdashlen,
                axisNameBorderDashGap: chartAttrs.yaxisnameborderdashgap,
                axisNameWidth: chartAttrs.yaxisnamewidth,
                useEllipsesWhenOverflow: chartAttrs.useellipseswhenoverflow,
                rotateAxisName: pluckNumber (chartAttrs.rotateyaxisname, 1),
                axisName: chartAttrs.yaxisname,
                divLineColor: pluck (chartAttrs.divlinecolor, colorM.getColor (palleteString.divLineColor)),
                divLineAlpha: pluck (chartAttrs.divlinealpha, is3d ? colorM.getColor('divLineAlpha3D') :
                    colorM.getColor ('divLineAlpha')),
                divLineThickness: pluckNumber (chartAttrs.divlinethickness, 1),
                divLineIsDashed: Boolean (pluckNumber (chartAttrs.divlinedashed, chartAttrs.divlineisdashed, 0)),
                divLineDashLen: pluckNumber (chartAttrs.divlinedashlen, 4),
                divLineDashGap: pluckNumber (chartAttrs.divlinedashgap, 2),
                showAlternateGridColor: pluckNumber (chartAttrs.showalternatehgridcolor, 1),
                alternateGridColor: pluck (chartAttrs.alternatehgridcolor, colorM.getColor ('altHGridColor')),
                alternateGridAlpha: pluck (chartAttrs.alternatehgridalpha, colorM.getColor ('altHGridAlpha')),
                numDivLines: pluckNumber(chartAttrs.numdivlines, iapi.numDivLines),
                axisMinValue: chartAttrs.yaxisminvalue,
                axisMaxValue: chartAttrs.yaxismaxvalue,
                setAdaptiveMin: chartAttrs.setadaptiveymin,
                adjustDiv: chartAttrs.adjustdiv,
                labelStep: chartAttrs.yaxisvaluesstep,
                showAxisValues: pluckNumber (chartAttrs.showyaxisvalues, chartAttrs.showyaxisvalue),
                showLimits: pluckNumber(chartAttrs.showlimits, iapi.showLimits),
                showDivLineValues: pluckNumber (chartAttrs.showdivlinevalues, chartAttrs.showdivlinevalue),
                //showZeroPlane: chartAttrs.showzeroplane,
                zeroPlaneColor: chartAttrs.zeroplanecolor,
                zeroPlaneThickness: chartAttrs.zeroplanethickness || 2,
                zeroPlaneAlpha: chartAttrs.zeroplanealpha,
                showZeroPlaneValue: chartAttrs.showzeroplanevalue,
                trendlineColor: chartAttrs.trendlinecolor,
                trendlineToolText: chartAttrs.trendlinetooltext,
                trendlineThickness: chartAttrs.trendlinethickness,
                trendlineAlpha: chartAttrs.trendlinealpha,
                showTrendlinesOnTop: chartAttrs.showtrendlinesontop,
                showAxisLine: pluckNumber (chartAttrs.showyaxisline, chartAttrs.showaxislines,
                    chartAttrs.drawAxisLines, 0),
                axisLineThickness: pluckNumber (chartAttrs.yaxislinethickness, chartAttrs.axislinethickness, 1),
                axisLineAlpha: pluckNumber (chartAttrs.yaxislinealpha, chartAttrs.axislinealpha, 100),
                axisLineColor: pluck (chartAttrs.yaxislinecolor, chartAttrs.axislinecolor, '#000000')
            };

            xAxisConf.vtrendlines = dataObj.trendlines;
            //yAxisConf.trendlines = dataObj.trendlines;

            yAxis = components.yAxis[0];
            xAxis = components.xAxis[0];

            yAxis.setCommonConfigArr (yAxisConf, true, true, false);
            xAxis.setCommonConfigArr (xAxisConf, false, false, true);
            yAxis.configure();
            xAxis.configure();
        },

        _setCategories: function(){
            var iapi = this,
                components = iapi.get('components'),
                dataObj = iapi.jsonData,
                xAxis = components.xAxis,
                yAxis = components.yAxis,
                processes = dataObj.processes,
                dataTable = dataObj.datatable,
                categories = dataObj.categories;

            yAxis[0].setAxisPadding(0.5, 0.5);
            yAxis[0].setProcess(processes);
            yAxis[0].setDataTable(dataTable);
            xAxis[0].setCategory(categories);

        },
        _setAxisValuePadding: function () {
            var iapi = this,
                datasets = iapi.components.dataset,
                len = datasets.length,
                i,
                datasetObj,
                axisPaddingLeft = -Infinity,
                axisPaddingRight = -Infinity,
                //yAxis = iapi.components.yAxis,
                paddingObj;
            for (i = 0; i < len; i++) {
                datasetObj = datasets[i];
                paddingObj = datasetObj.getAxisValuePadding && datasetObj.getAxisValuePadding() || {};
                axisPaddingLeft = mathMax(axisPaddingLeft, paddingObj.left || -Infinity);
                axisPaddingRight = mathMax(axisPaddingRight, paddingObj.right || -Infinity);
            }
            if (axisPaddingLeft === -Infinity) {
                axisPaddingLeft = 0;
            }
            if (axisPaddingRight === -Infinity) {
                axisPaddingRight = 0;
            }
            //xAxis && xAxis[0].setAxisPadding(axisPaddingLeft, axisPaddingLeft);
        },

        _spaceManager: function () {
            // todo marge _allocateSpace and _spacemanager
            var availableWidth,
                availableHeight,
                iapi = this,
                config = iapi.config,
                components = iapi.components,
                xAxis = components.xAxis && components.xAxis[0],
                yAxis = components.yAxis && components.yAxis[0],
                legend = components.legend,
                legendPosition = legend.config.legendPos,
                allottedSpace,
                ganttWidthPercent = config.ganttwidthpercent,
                processWidthPercent = 100 - (ganttWidthPercent || 67),
                chartBorderWidth = config.borderWidth,
                spaceUsed,
                processHeight,
                totalWidth = 0,
                totalHeight = 0;

            iapi._resetViewPortConfig && iapi._resetViewPortConfig();
            xAxis.resetTransletAxis();
            yAxis.resetTransletAxis();
            iapi._allocateSpace ( {
                top : chartBorderWidth,
                bottom : chartBorderWidth,
                left : chartBorderWidth,
                right : chartBorderWidth
            });
            iapi._allocateSpace(iapi._manageActionBarSpace &&
                iapi._manageActionBarSpace(config.availableHeight * 0.225) || {});

            availableHeight = (legendPosition === POSITION_BOTTOM) ? config.canvasHeight * 0.6 :
                config.canvasWidth * 0.6;

            // a space manager that manages the space for the tools as well as the captions.
            iapi._manageChartMenuBar(availableHeight);


            if (legendPosition === 'right') {
                allottedSpace = config.canvasWidth * 0.3;
            }
            else {
                allottedSpace = config.canvasHeight * 0.3;
            }



            //Manage space for legend
            iapi._manageLegendSpace(allottedSpace);

            config.actualCanvasTop = config.canvasTop;
            config.actualCanvasLeft = config.canvasLeft;
            //****** Manage space for y axis here y axis is the process column
            availableWidth = config.canvasWidth * (processWidthPercent / 100);

            spaceUsed = yAxis.placeAxis (availableWidth);

            totalWidth += (spaceUsed.left || 0) + (spaceUsed.right || 0);

            yAxis && iapi._allocateSpace (spaceUsed);

            availableHeight = (legendPosition === POSITION_BOTTOM) ? config.canvasHeight * 0.6 :
                config.canvasWidth * 0.6;

            availableHeight = config.canvasHeight * 0.6;

            spaceUsed = xAxis.placeAxis (availableHeight);

            totalHeight += (spaceUsed.top || 0);

            config.totalWidth = totalWidth;
            config.totalHeight = totalHeight;

            xAxis && iapi._allocateSpace (spaceUsed);

            processHeight = yAxis && yAxis.setProcessHeight();
            yAxis.setAxisConfig({
                processTotalHeight : processHeight
            });
        },

        _drawCanvas: function () {
            var iapi = this,
                jsonData = iapi.jsonData,
                chartAttrs = jsonData.chart,
                components = iapi.components,
                chartConfig = iapi.config,
                chartGraphics = iapi.graphics,
                paper = components.paper,
                canvas = components.canvas,
                graphics = canvas.graphics,
                config = canvas.config,
                clip = config.clip = { },
                canvasBorderElement = graphics.canvasBorderElement,
                animationObj = iapi.get('config', 'animationObj'),
                animationDuration = animationObj.duration,
                dummyAnimElem = animationObj.dummyObj,
                dummyAnimObj = animationObj.animObj,
                animType = animationObj.animType,
                canvasElement = graphics.canvasElement,
                canvasLeft = chartConfig.actualCanvasLeft,
                canvasTop = chartConfig.actualCanvasTop,
                actualCanvasWidth = chartConfig.canvasWidth,
                actualCanvasHeight = chartConfig.canvasHeight,
                actualCanvasLeft = chartConfig.canvasLeft,
                actualCanvasTop = chartConfig.canvasTop,
                canvasWidth = chartConfig.canvasWidth + chartConfig.totalWidth,
                canvasHeight = chartConfig.canvasHeight + chartConfig.totalHeight,
                canvasGroup = chartGraphics.canvasGroup,
                canvasBorderRadius = config.canvasBorderRadius,
                canvasBorderWidth = config.canvasBorderWidth,
                borderWHlf = canvasBorderWidth * 0.5,
                canvasBorderColor = config.canvasBorderColor,
                canBGColor = config.canBGColor,
                shadow = config.shadow,
                canvasBgColor,
                attr,
                showCanvasBg = config.showCanvasBG = Boolean (pluckNumber (chartAttrs.showcanvasbg, 1)),
                shadowOnCanvasFill = config.shadowOnCanvasFill,
                showCanvasBorder = config.showCanvasBorder;

            canvasBgColor = canBGColor;
            attr = {
                x: canvasLeft - borderWHlf,
                y: canvasTop - borderWHlf,
                width: canvasWidth + canvasBorderWidth,
                height: canvasHeight + canvasBorderWidth,
                r: canvasBorderRadius,
                'stroke-width': canvasBorderWidth,
                stroke: canvasBorderColor,
                'stroke-linejoin': canvasBorderWidth > MAX_MITER_LINEJOIN ? 'round' : 'miter'
            };

            if (showCanvasBorder) {
                if (!canvasBorderElement) {
                    graphics.canvasBorderElement = paper.rect (attr, canvasGroup)
                    .shadow(shadow);
                }
                else {
                    canvasBorderElement.show();
                    canvasBorderElement.animateWith(dummyAnimElem, dummyAnimObj, {
                            x: canvasLeft - borderWHlf,
                            y: canvasTop - borderWHlf,
                            width: canvasWidth + canvasBorderWidth,
                            height: canvasHeight + canvasBorderWidth,
                            r: canvasBorderRadius
                        }, animationDuration, animType);
                    canvasBorderElement.attr ({
                        'stroke-width': canvasBorderWidth,
                        stroke: canvasBorderColor,
                        'stroke-linejoin': canvasBorderWidth > MAX_MITER_LINEJOIN ? 'round' : 'miter'
                    });
                    canvasBorderElement.shadow(shadow);
                }
            }
            else {
                canvasBorderElement && canvasBorderElement.hide();
            }


            //create a clip-rect to clip canvas for later use
            clip['clip-canvas'] = [
                mathMax (0, actualCanvasLeft),
                mathMax (0, actualCanvasTop),
                mathMax (1, actualCanvasWidth),
                mathMax (1, actualCanvasHeight)
            ];
            clip['clip-canvas-init'] = [
                mathMax (0, actualCanvasLeft),
                mathMax (0, actualCanvasTop),
                1,
                mathMax (1, actualCanvasHeight)
            ];

            if (showCanvasBg) {
                attr = {
                    x: canvasLeft,
                    y: canvasTop,
                    width: canvasWidth,
                    height: canvasHeight,
                    r: canvasBorderRadius,
                    'stroke-width': 0,
                    'stroke': NONE,
                    fill: toRaphaelColor (canvasBgColor)
                };

                if (!canvasElement) {
                    graphics.canvasElement = paper.rect (attr, canvasGroup)
                    .shadow (shadowOnCanvasFill);
                }
                else {
                    canvasElement.show();
                    if (animationDuration) {
                        canvasElement.animateWith(dummyAnimElem, dummyAnimObj, {
                            x: canvasLeft,
                            y: canvasTop,
                            width: canvasWidth,
                            height: canvasHeight,
                            r: canvasBorderRadius
                        }, animationDuration, animType);
                    }
                    canvasElement.attr (attr);
                    canvasElement.shadow (shadowOnCanvasFill);
                }
            }
            else {
                canvasElement && canvasElement.hide();
            }
        },
        _postSpaceManagement : function () {
            var iapi = this,
                config = iapi.config,
                components = iapi.components,
                xAxis = components.xAxis && components.xAxis[0],
                yAxis = components.yAxis && components.yAxis[0],
                processTotalHeight = yAxis.getAxisConfig('processTotalHeight'),
                canvasHeight = config.canvasHeight,
                legend = components.legend,
                xDepth = config.xDepth,
                canvasConfig = components.canvas.config,
                canvasBorderWidth = canvasConfig.canvasBorderWidth,
                canvasPadding = canvasConfig.canvasPadding,
                vScrollBar = components.vScrollBar,
                conf = vScrollBar.userConf,
                vScrollWidth,
                vScrollEnabled,
                canvasPaddingLeft = canvasConfig.canvasPaddingLeft,
                canvasPaddingRight = canvasConfig.canvasPaddingRight,
                gPaneDuration = Number(config.ganttpaneduration),
                gPaneDurationUnit = config.ganttpanedurationunit,
                hProcessScrollBar = components.hProcessScrollBar,
                hScrollBar = components.hScrollBar,
                hScrollBarHeight = hScrollBar && hScrollBar.userConf.height || 0,
                hProcessScrollHeight = hProcessScrollBar && hProcessScrollBar.userConf.height || 0,
                totalProcessWidth,
                totalVisiblelProcessWidth,
                hScrollEnabled,
                hProcessScrollEnabled,
                maxHScrollBarHeight,
                actualCanvasHeight,
                axisLength;

            if (gPaneDuration !== UNDEF && gPaneDurationUnit !== UNDEF) {
                hScrollEnabled = true;
            }
            else {
                hScrollEnabled = false;
            }
            totalProcessWidth = yAxis.getAxisConfig('totalWidth');
            totalVisiblelProcessWidth = yAxis.getAxisConfig('totalVisiblelWidth');
            if (totalProcessWidth > totalVisiblelProcessWidth) {
                hProcessScrollEnabled = true;
            }
            else {
                hProcessScrollEnabled = false;
            }

            maxHScrollBarHeight = mathMax(hProcessScrollEnabled ? hProcessScrollHeight : 0,
                hScrollEnabled ? hScrollBarHeight : 0);
            actualCanvasHeight = canvasHeight - maxHScrollBarHeight;

            // Need to call manageScrollerPosition here for knowing whether vertical scroll bar is there
            if (processTotalHeight > actualCanvasHeight) {
                vScrollEnabled = true;
            }

            vScrollWidth = vScrollEnabled ? conf.width || 0 : 0;

            axisLength = config.canvasWidth - (xDepth || 0) - mathMax(canvasPaddingLeft, canvasPadding) -
                mathMax(canvasPaddingRight, canvasPadding) - vScrollWidth;
            xAxis && xAxis.setAxisDimention ( {
                x : config.canvasLeft + (xDepth || 0) + mathMax(canvasPaddingLeft, canvasPadding),
                y : config.canvasTop - (config.shift || 0),
                opposite : config.canvasBottom + canvasBorderWidth,
                axisLength : axisLength
            });

            config.currentCanvasWidth = axisLength;

            yAxis && yAxis.setAxisDimention ( {
                x : config.canvasLeft - (config.shift || 0),
                y : config.canvasTop,
                opposite : config.canvasRight + canvasBorderWidth,
                axisLength : config.canvasHeight
            });
            iapi._manageScrollerPosition();
            legend.postSpaceManager();
        },

        _resetViewPortConfig: function () {
            var iapi = this;

            iapi.config.viewPortConfig = {
                scaleX: 1,
                scaleY: 1,
                x: 0,
                y: 0
            };
        },
        _manageScrollerPosition: function () {
            var iapi = this,
                config = iapi.config,
                chartComponents = iapi.components,
                availableHeight,
                availableWidth,
                hScrollEnabled,
                vScrollEnabled,
                hScrollBar = chartComponents.hScrollBar,
                vScrollBar = chartComponents.vScrollBar,
                hProcessScrollBar = chartComponents.hProcessScrollBar,
                totalWidth = config.totalWidth || 0,
                totalHeight = config.totalHeight || 0,
                scrollDimensions;
            iapi._setAxisScale && iapi._setAxisScale();
            vScrollEnabled = config.vScrollEnabled;
            hScrollEnabled = config.hScrollEnabled;
            //manage space for the scroll bar.
            // fetch the availble space for the canvas area after other space management is over
            availableHeight = config.canvasHeight;
            availableWidth = config.canvasWidth;
            scrollDimensions = hScrollBar.getLogicalSpace();
            //allocate space for toolBox and set the chart configurations.
            // shift denotes the amount of shift required by the x-axis
            config.hScrollHeight = hScrollEnabled === false ? 0 : scrollDimensions.height + vScrollBar.conf.padding;
            scrollDimensions = vScrollBar.getLogicalSpace();

            config.vScrollWidth = vScrollEnabled !== false ?
                scrollDimensions.width + vScrollBar.conf.padding : 0;

            scrollDimensions = hProcessScrollBar.getLogicalSpace();
            config.hProcessScrollHeight = config.hProcessScrollEnabled ?
                scrollDimensions.height + hProcessScrollBar.conf.padding : 0;

            totalHeight += mathMax(config.hProcessScrollHeight, config.hScrollHeight);

            iapi._allocateSpace({
                bottom: mathMax(config.hProcessScrollHeight, config.hScrollHeight)
            });
            config.totalWidth = totalWidth;
            config.totalHeight = totalHeight;

        },
        updateManager: function (pos, isHorizontal) {
            var iapi = this,
                config = iapi.config,
                viewPortConfig = iapi.config.viewPortConfig,
                scaleX = viewPortConfig.scaleX,
                xAxis = iapi.components.xAxis[0],
                yAxis = iapi.components.yAxis[0],
                datasetLayer = iapi.graphics.datasetGroup,
                dataLabelsLayer = iapi.graphics.datalabelsGroup,
                trackerGroup = iapi.graphics.trackerGroup,
                xOffset = config.xOffset || 0,
                yOffset = config.yOffset || 0,
                canvasHeight = config.canvasHeight,
                currentCanvasWidth = config.currentCanvasWidth,
                scaleY = viewPortConfig.scaleY,
                transformAttr;

            if (isHorizontal) {
                config.lastHScrollPosition = pos;
            }
            else {
                config.lastVScrollPosition = pos;
            }
            if (isHorizontal) {
                xOffset = config.xOffset = (currentCanvasWidth * (scaleX - 1) * pos);
                viewPortConfig.x =  xOffset / scaleX;
                xAxis.translateAxis(-xOffset, undefined);
            }
            else {
                yOffset = config.yOffset = (canvasHeight * (scaleY - 1) * pos);
                viewPortConfig.y = yOffset / scaleY;
                yAxis.translateAxis(undefined, -yOffset);
            }
            transformAttr = 't' + -xOffset + ', ' + -yOffset;
            datasetLayer.attr({
                transform: transformAttr
            });


            dataLabelsLayer.attr({
                transform: transformAttr
            });
            trackerGroup.attr({
                transform: transformAttr
            });
        },
        _setAxisScale: function () {
            var iapi = this,
                components = iapi.components,
                config = iapi.config,
                xAxis = components.xAxis[0],
                limits = xAxis.getLimit(),
                max = limits.max,
                min = limits.min,
                minDt = new Date(min),
                yAxis = components.yAxis[0],
                numberFormatter = iapi.components.numberFormatter,
                gPaneDuration = Number(config.ganttpaneduration),
                scrollOptions = config.scrollOptions || (config.scrollOptions = {}),
                gPaneDurationUnit = config.ganttpanedurationunit,
                // scrollToDate = config.scrolltodate,
                scaleX,
                ms = max - min,
                canvasHeight = config.canvasHeight,
                scrollToDate = config.scrolltodate,
                canvasWidth = config.canvasWidth,
                datems,
                canvasLeft = config.canvasLeft,
                hProcessScrollBar = components.hProcessScrollBar,
                hScrollBar = components.hScrollBar,
                maxHScrollBarHeight,
                hScrollBarHeight = hScrollBar && hScrollBar.userConf.height || 0,
                hProcessScrollHeight = hProcessScrollBar && hProcessScrollBar.userConf.height || 0,
                datePixel,
                totalWidth = xAxis.getPixel(max) - canvasLeft,
                processTotalHeight = yAxis.getAxisConfig('processTotalHeight'),
                totalVisiblelProcessWidth,
                totalProcessWidth,
                actualCanvasHeight,
                width,
                units;
            if (gPaneDuration === UNDEF || gPaneDurationUnit === UNDEF) {
                config.hScrollEnabled = false;
            }
            else {

                switch (gPaneDurationUnit) {
                    case 'y' :
                        minDt.setFullYear(minDt.getFullYear() + gPaneDuration);
                        break;
                    case 'm' :
                        minDt.setMonth(minDt.getMonth() + gPaneDuration);
                        break;
                    case 'd' :
                        minDt.setDate(minDt.getDate() + gPaneDuration);
                        break;
                    case 'h' :
                        minDt.setHours(minDt.getHours() + gPaneDuration);
                        break;
                    case 'mn' :
                        minDt.setMinutes(minDt.getMinutes() + gPaneDuration);
                        break;
                    default :
                        minDt.setSeconds(minDt.getSeconds() + gPaneDuration);
                        break;
                }
                minDt = minDt.getTime();
                width = xAxis.getPixel(minDt) - canvasLeft;
                config.hScrollEnabled = true;
                //update the scaleX for the axis.
                config.viewPortConfig.scaleX = scaleX = totalWidth / width;
                //parse the scroll properties
                scrollOptions.horizontalVxLength = (ms / units) * gPaneDuration;
                if (scrollToDate) {
                    datems = numberFormatter.getDateValue (scrollToDate).ms;
                    datePixel = xAxis.getPixel(datems);
                    config.viewPortConfig.x = (mathMin(datePixel - canvasLeft, canvasWidth * (scaleX - 1)) / scaleX);
                    // console.log(config.viewPortConfig.x);
                }

            }

            totalProcessWidth = yAxis.getAxisConfig('totalWidth');
            totalVisiblelProcessWidth = yAxis.getAxisConfig('totalVisiblelWidth');
            if (totalProcessWidth > totalVisiblelProcessWidth) {
                config.hProcessScrollEnabled = true;
            }
            else {
                config.hProcessScrollEnabled = false;
            }


            maxHScrollBarHeight = mathMax(config.hProcessScrollEnabled ? hProcessScrollHeight : 0,
                config.hScrollEnabled ? hScrollBarHeight : 0);
            actualCanvasHeight = canvasHeight - maxHScrollBarHeight;
            if (Math.floor(processTotalHeight) > actualCanvasHeight) {
                config.viewPortConfig.scaleY = processTotalHeight / actualCanvasHeight;
                config.vScrollEnabled = true;
            }
            else {
                config.vScrollEnabled = false;
            }
        },


        drawScrollBar: function () {
            var iapi = this,
                config = iapi.config,
                components = iapi.components,
                xAxis = components.xAxis[0],
                axisConfig = xAxis.config,
                axisRange = xAxis.config.axisRange,
                viewPortConfig = config.viewPortConfig,
                scrollOptions = config.scrollOptions || (config.scrollOptions = {}),
                max = axisRange.max,
                min = axisRange.min,
                vxLength = scrollOptions.horizontalVxLength,
                hScrollBar = components.hScrollBar,
                hScrollNode = hScrollBar.node,
                vScrollBar = components.vScrollBar,
                vScrollNode = vScrollBar.node,
                hProcessScrollBar = components.hProcessScrollBar,
                hProcessScrollNode = hProcessScrollBar.node,
                useVerticalScrollBar = config.useverticalscrolling,
                scrollableLength = max - min,
                canvasRight = config.canvasRight,
                scaleX = viewPortConfig.scaleX,
                scaleY = viewPortConfig.scaleY,
                canvasLeft,
                canvasTop,
                canvasHeight,
                canvasWidth,
                canvasConfig,
                canvasBorderWidth,
                aXisLineWidth,
                aXisLineStartExtension,
                aXisLineEndExtension,
                scrollRatio,
                vScrollRatio,
                windowedCanvasHeight,
                fullCanvasHeight,
                vScrollEnabled = config.vScrollEnabled,
                // canvasHeight = config.canvasHeight,
                yAxis = components.yAxis[0],
                windowedCanvasWidth,
                vScrollWidth = vScrollEnabled ? vScrollBar.conf.width : 0,
                fullCanvasWidth,
                totalProcessWidth,
                totalVisiblelProcessWidth,
                graphics = iapi.graphics,
                scrollBarParentGroup,
                paper = components.paper;

            canvasLeft = config.canvasLeft;
            canvasTop = config.canvasTop;
            canvasHeight = config.canvasHeight;
            canvasWidth = config.canvasWidth;
            canvasConfig = components.canvas.config;
            canvasBorderWidth = canvasConfig.canvasBorderWidth;
            aXisLineWidth = pluckNumber(canvasBorderWidth, (axisConfig.showLine ? axisConfig.axisLineThickness : 0));
            aXisLineStartExtension = pluckNumber(canvasBorderWidth, axisConfig.lineStartExtension);
            aXisLineEndExtension = pluckNumber(canvasBorderWidth, axisConfig.lineEndExtension);
            scrollOptions.viewPortMin = min;
            scrollOptions.viewPortMax = max;
            scrollRatio = (scrollOptions.scrollRatio = vxLength / scrollableLength);
            windowedCanvasWidth = scrollOptions.windowedCanvasWidth = xAxis.getAxisPosition(vxLength);
            fullCanvasWidth = scrollOptions.fullCanvasWidth =
                xAxis.getAxisPosition(max - min) - windowedCanvasWidth;

            fullCanvasHeight = scrollOptions.fullCanvasHeight = yAxis.getAxisConfig('processTotalHeight');
            windowedCanvasHeight = scrollOptions.windowedCanvasHeight = canvasHeight;
            totalProcessWidth = yAxis.getAxisConfig('totalWidth');
            totalVisiblelProcessWidth = yAxis.getAxisConfig('totalVisiblelWidth');

            vScrollRatio = 1 / scaleY;
            scrollBarParentGroup = graphics.scrollBarParentGroup;
            if (!scrollBarParentGroup) {
                scrollBarParentGroup = graphics.scrollBarParentGroup = paper.group('scrollBarParentGroup',
                   graphics.parentGroup).insertBefore(graphics.datalabelsGroup);
            }
            //draw the scroller element
            // todo padding needs to be included.
            if (config.hScrollEnabled !== false) {
                hScrollBar.draw (canvasLeft,
                    canvasTop + canvasHeight,{
                        width: canvasWidth - vScrollWidth,
                        scrollRatio: 1 / scaleX,
                        scrollPosition: (viewPortConfig.x  * scaleX) / (canvasWidth * (scaleX - 1)),
                        roundEdges: canvasConfig.isRoundEdges,
                        fullCanvasWidth: fullCanvasWidth,
                        windowedCanvasWidth: windowedCanvasWidth,
                        parentLayer: scrollBarParentGroup
                    });

                // attach the callback for raising event only for it is a new scroll node.
                !hScrollNode && (function () {
                    var prevPos;
                    R.eve.on('raphael.scroll.start.' + hScrollBar.node.id, function (pos) {
                        prevPos = pos;
                        global.raiseEvent('scrollstart', {
                            scrollPosition: pos
                        }, iapi.chartInstance);
                    });

                    R.eve.on('raphael.scroll.end.' + hScrollBar.node.id, function (pos) {
                        global.raiseEvent('scrollend', {
                            prevScrollPosition: prevPos,
                            scrollPosition: pos
                        }, iapi.chartInstance);
                    });
                }());
            }
            else {
                hScrollBar && hScrollBar.node && hScrollBar.node.hide();
            }

            if (vScrollEnabled !== false && useVerticalScrollBar) {
                vScrollBar.draw (canvasRight - vScrollWidth, canvasTop, {
                    height: canvasHeight,
                    scrollRatio: vScrollRatio,
                    roundEdges: canvasConfig.isRoundEdges,
                    fullCanvasWidth: fullCanvasHeight,
                    windowedCanvasWidth: windowedCanvasHeight,
                    parentLayer: scrollBarParentGroup
                });

                // attach the callback for raising event only for it is a new scroll node.
                !vScrollNode && (function () {
                    var prevPos;
                    R.eve.on('raphael.scroll.start.' + vScrollBar.node.id, function (pos) {
                        prevPos = pos;
                        global.raiseEvent('scrollstart', {
                            scrollPosition: pos
                        }, iapi.chartInstance);
                    });

                    R.eve.on('raphael.scroll.end.' + vScrollBar.node.id, function (pos) {
                        global.raiseEvent('scrollend', {
                            prevScrollPosition: prevPos,
                            scrollPosition: pos
                        }, iapi.chartInstance);
                    });
                }());
            }
            else {
                vScrollBar && vScrollBar.node && vScrollBar.node.hide();
            }

            if (totalVisiblelProcessWidth < totalProcessWidth) {
                hProcessScrollBar.draw (canvasLeft - totalVisiblelProcessWidth,
                    canvasTop + canvasHeight,{
                        width: totalVisiblelProcessWidth,
                        scrollRatio: totalVisiblelProcessWidth/totalProcessWidth,
                        roundEdges: canvasConfig.isRoundEdges,
                        fullCanvasWidth: fullCanvasWidth,
                        windowedCanvasWidth: windowedCanvasWidth,
                        parentLayer: scrollBarParentGroup
                    });

                // attach the callback for raising event only for it is a new scroll node.
                !hProcessScrollNode && (function () {
                    var prevPos;
                    R.eve.on('raphael.scroll.start.' + hProcessScrollBar.node.id, function (pos) {
                        prevPos = pos;
                        global.raiseEvent('scrollstart', {
                            scrollPosition: pos
                        }, iapi.chartInstance);
                    });

                    R.eve.on('raphael.scroll.end.' + hProcessScrollBar.node.id, function (pos) {
                        global.raiseEvent('scrollend', {
                            prevScrollPosition: prevPos,
                            scrollPosition: pos
                        }, iapi.chartInstance);
                    });
                }());
            }
            else {
                hProcessScrollBar && hProcessScrollBar.node && hProcessScrollBar.node.hide();
            }
        },
        _createLayers: function () {
            var iapi = this,
                components = iapi.components,
                paper = components.paper,
                config = iapi.config,
                inCanStyle = config.style.inCanvasStyle,
                labelStyle,
                datasetGroup,
                graphics;

            chartapi.mscartesian._createLayers.call(iapi);
            graphics = iapi.graphics;
            datasetGroup = graphics.datasetGroup;

            graphics.parentTaskGroup = graphics.parentTaskGroup || paper.group('parentTaskGroup', datasetGroup);
            graphics.parentConnectorsGroup = graphics.parentConnectorsGroup ||
                paper.group('parentConnectorsGroup', datasetGroup);
            graphics.parentMilestoneGroup = graphics.parentMilestoneGroup ||
                paper.group('parentMilestoneGroup', datasetGroup);

            labelStyle = iapi.config.milestoneLabelStyle = {
                fontSize: pluckNumber (config.milestonefontsize,
                    inCanStyle.fontSize) + PX,
                fontFamily: pluck (config.milestonefont,
                    inCanStyle.fontFamily),
                fontWeight: pluckNumber (config.milestonefontbold, 0) && BOLD || NORMAL,
                fontStyle: pluckNumber (config.milestonefontitalic, 0) && ITALIC || NORMAL
            };

            setLineHeight(labelStyle);

            graphics.parentMilestoneGroup.css(labelStyle);
        },
        _drawDataset: function () {
            this._setClipping();
            chartapi.mscartesian._drawDataset.call(this);
        },
        drawLegend: function () {
            var iapi = this,
                config = iapi.config,
                components = iapi.components,
                legend = components.legend,
                legendConf = legend.config,
                legendWidth = legendConf.width,
                legendHeight = legendConf.height,
                legendPosition = legendConf.legendPos,
                marginLeft = config.marginLeft,
                marginTop = config.marginTop,
                chartWidth = config.width,
                marginRight = config.marginRight,
                marginBottom = config.marginBottom,
                totalWidth = config.totalWidth + config.canvasWidth,
                totalHeight = config.totalHeight + config.canvasHeight,
                chartHeight = config.height,
                spaceLeft,
                xPos,
                yPos;

            if (legendPosition === 'right') {
                spaceLeft = totalHeight - legendHeight;
                xPos = chartWidth - legendWidth - marginRight;
                yPos = marginTop + (spaceLeft < 0 ? 0 : spaceLeft) / 2;
            }

            else {
                spaceLeft = totalWidth - legendWidth;
                xPos = marginLeft + (spaceLeft < 0 ? 0 : spaceLeft) / 2;
                yPos = chartHeight - legendHeight - marginBottom;

            }

            legend.drawLegend(xPos, yPos);
        },
        _setClipping: function () {
            var chart = this,
                config = chart.config,
                datasetLayer = chart.graphics.datasetGroup,
                dataLabelsLayer = chart.graphics.datalabelsGroup,
                trackerLayer  = chart.graphics.trackerGroup,
                viewPortConfig = config.viewPortConfig,
                scaleX = viewPortConfig.scaleX,
                x = viewPortConfig.x,
                animationObj = chart.config.animationObj,
                dummyAnimElem = animationObj.dummyObj,
                dummyAnimObj = animationObj.animObj,
                animType = animationObj.animType,
                animationDuration = animationObj.transposeAnimDuration,
                clipCanvas = chart.components.canvas.config.clip['clip-canvas'].slice(0);

            if (!chart.config.clipSet) {
                datasetLayer.attr({
                    'clip-rect': clipCanvas
                });
                dataLabelsLayer.attr({
                    'clip-rect': clipCanvas
                });
                trackerLayer.attr({
                    'clip-rect': clipCanvas
                });
            }
            else {
                datasetLayer.animateWith(dummyAnimElem, dummyAnimObj, {
                    'clip-rect': clipCanvas
                }, animationDuration, animType);
                dataLabelsLayer.animateWith(dummyAnimElem, dummyAnimObj, {
                    'clip-rect': clipCanvas
                }, animationDuration, animType);
                trackerLayer.animateWith(dummyAnimElem, dummyAnimObj, {
                    'clip-rect': clipCanvas
                }, animationDuration, animType);
            }

            config.xOffset = (x * scaleX);
            datasetLayer.attr({
                transform: 'T' + -(x * scaleX) + ',0'
            });
            dataLabelsLayer.attr({
                transform: 'T' + -(x * scaleX) + ',0'
            });
            trackerLayer.attr({
                transform: 'T' + -(x * scaleX) + ',0'
            });
            chart.config.clipSet = true;
        },
        _createToolBox: function () {
            var iapi = this,
                components = iapi.components,
                yAxis = components.yAxis[0],
                _scrollBar = iapi._scrollBar,
                chartMenuBar = components.chartMenuBar || {},
                actionBar = components.actionBar,
                getScrollItems = _scrollBar.get,
                addScrollItems = _scrollBar.add,
                tb,
                Scroller,
                ComponentGroup,
                hScrollItem,
                hScrollItem1,
                vScrollItem,
                toolBoxAPI;

            if (chartMenuBar.drawn || actionBar && actionBar.drawn) {
                return;
            }

            // create the export or print buttons if required.
            chartapi.mscartesian._createToolBox.call(iapi);
            tb = components.tb;
            toolBoxAPI = components.toolBoxAPI;
            Scroller = toolBoxAPI.Scroller;
            ComponentGroup = toolBoxAPI.ComponentGroup;
            // temp code: On update scroll items needs to be reused.
            _scrollBar.clear();
            // Adding the scroll items in the scroll bar.
            addScrollItems({
                isHorizontal: true
            }, {
                // Attach the callback for scroll Interaction.
                'scroll' : (function (ref, isHorizontal) {
                    return function () {
                        ref.updateManager.call(ref, arguments[0], isHorizontal);
                    };
                })(iapi, true)
            });

            addScrollItems({
                isHorizontal: false
            }, {
                // Attach the callback for scroll Interaction.
                'scroll' : (function (ref, isHorizontal) {

                    return  function () {
                        ref.updateManager.call(ref, arguments[0], isHorizontal);
                    };

                })(iapi, false)
            });

            addScrollItems({
                isHorizontal: true
            }, {
                // Attach the callback for scroll Interaction.
                'scroll' : (function () {
                    return function () {
                        yAxis.manageProcessScroll(arguments[0]);
                    };
                })(iapi, true)
            });

            // Fetching the scroll Items.
            hScrollItem = getScrollItems()[0];

            vScrollItem = getScrollItems()[1];

            hScrollItem1 = getScrollItems()[2];

            // adding the scrollbar. tb.pid is the component pool id
            components.hScrollBar = components.hScrollBar || (new Scroller(hScrollItem.conf, 1, tb.pId)
            .attachEventHandlers(hScrollItem.handler));

            components.vScrollBar = components.vScrollBar || (new Scroller(vScrollItem.conf, 2, tb.pId)
            .attachEventHandlers(vScrollItem.handler));

            components.hProcessScrollBar = components.hProcessScrollBar || (
                new Scroller(hScrollItem1.conf, 3, tb.pId).attachEventHandlers(hScrollItem1.handler));

        },
        _preDraw : function () {
            var iapi = this;
            iapi._setAxisValuePadding();
            iapi._setCategories();
            iapi.chartMenuTools.reset(iapi.components.tb, iapi);
        },

        defaultPaletteOptions : merge (extend2 ( { }, lib.defaultGaugePaletteOptions), {
            //Colors for gauge '339900', 'DD9B02', '943A0A',
            paletteColors:
                [['AFD8F8', 'F6BD0F', '8BBA00', 'FF8E46', '008E8E',
                'D64646', '8E468E', '588526', 'B3AA00', '008ED6', '9D080D',
                'A186BE', 'CC6600', 'FDC689', 'ABA000', 'F26D7D', 'FFF200',
                '0054A6', 'F7941C', 'CC3300', '006600', '663300', '6DCFF6'],
                    ['AFD8F8', 'F6BD0F', '8BBA00', 'FF8E46', '008E8E',
                'D64646', '8E468E', '588526', 'B3AA00', '008ED6', '9D080D',
                'A186BE', 'CC6600', 'FDC689', 'ABA000', 'F26D7D', 'FFF200',
                '0054A6', 'F7941C', 'CC3300', '006600', '663300', '6DCFF6'],
                    ['AFD8F8', 'F6BD0F', '8BBA00', 'FF8E46', '008E8E',
                'D64646', '8E468E', '588526', 'B3AA00', '008ED6', '9D080D',
                'A186BE', 'CC6600', 'FDC689', 'ABA000', 'F26D7D', 'FFF200',
                '0054A6', 'F7941C', 'CC3300', '006600', '663300', '6DCFF6'],
                    ['AFD8F8', 'F6BD0F', '8BBA00', 'FF8E46', '008E8E',
                'D64646', '8E468E', '588526', 'B3AA00', '008ED6', '9D080D',
                'A186BE', 'CC6600', 'FDC689', 'ABA000', 'F26D7D', 'FFF200',
                '0054A6', 'F7941C', 'CC3300', '006600', '663300', '6DCFF6'],
                    ['AFD8F8', 'F6BD0F', '8BBA00', 'FF8E46', '008E8E',
                'D64646', '8E468E', '588526', 'B3AA00', '008ED6', '9D080D',
                'A186BE', 'CC6600', 'FDC689', 'ABA000', 'F26D7D', 'FFF200',
                '0054A6', 'F7941C', 'CC3300', '006600', '663300', '6DCFF6']],
            //Store other colors
            // ------------- For 2D Chart ---------------//
            //We're storing 5 combinations, as we've 5 defined palettes.
            bgColor: ['FFFFFF', 'FFFFFF', 'FFFFFF', 'FFFFFF', 'FFFFFF'],
            bgAngle: [270, 270, 270, 270, 270],
            bgRatio: ['100', '100', '100', '100', '100'],
            bgAlpha: ['100', '100', '100', '100', '100'],
            canvasBgColor: ['FFFFFF', 'FFFFFF', 'FFFFFF', 'FFFFFF', 'FFFFFF'],
            canvasBgAngle: [0, 0, 0, 0, 0],
            canvasBgAlpha: ['100', '100', '100', '100', '100'],
            canvasBgRatio: ['', '', '', '', ''],
            canvasBorderColor: ['545454', '545454', '415D6F', '845001', '68001B'],
            canvasBorderAlpha: [100, 100, 100, 90, 100],
            gridColor: ['DDDDDD', 'D8DCC5', '99C4CD', 'DEC49C', 'FEC1D0'],
            gridResizeBarColor: ['999999', '545454', '415D6F', '845001', 'D55979'],
            categoryBgColor: ['F1F1F1', 'EEF0E6', 'F2F8F9', 'F7F0E6', 'FFF4F8'],
            dataTableBgColor: ['F1F1F1', 'EEF0E6', 'F2F8F9', 'F7F0E6', 'FFF4F8'],
            toolTipBgColor: ['FFFFFF', 'FFFFFF', 'FFFFFF', 'FFFFFF', 'FFFFFF'],
            toolTipBorderColor: ['545454', '545454', '415D6F', '845001', '68001B'],
            baseFontColor: ['555555', '60634E', '025B6A', 'A15E01', '68001B'],
            borderColor: ['767575', '545454', '415D6F', '845001', '68001B'],
            borderAlpha: [50, 50, 50, 50, 50],
            legendBgColor: ['ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff'],
            legendBorderColor: ['666666', '545454', '415D6F', '845001', 'D55979'],
            plotBorderColor: ['999999', '8A8A8A', '6BA9B6', 'C1934D', 'FC819F'],
            plotFillColor: ['EEEEEE', 'D8DCC5', 'BCD8DE', 'E9D8BE', 'FEDAE3'],
            scrollBarColor: ['EEEEEE', 'D8DCC5', '99C4CD', 'DEC49C', 'FEC1D0']
        })
    }, chartapi.scrollbase, { // @todo: parse this attributes in chart level
        taskbarroundradius: 0,
        taskbarfillmix: ' { light-10 }, { dark-20 }, { light-50 }, { light-85 }',
        taskbarfillratio: '0,8,84,8',
        showslackasfill: 1,
        dateintooltip: 1,
        tasklabelsalign: 'center',
        datepadding: 3,
        showtasknames: 0,
        showpercentlabel: false,
        showhovereffect: 1,
        slackfillcolor: 'FF5E5E',
        connectorextension: 10,
        tasklabelspadding: 2,
        taskdatepadding: 3,
        showlabels: UNDEFINED,
        showtooltip: 1,
        showtaskhovereffect: undefined,
        useverticalscrolling: 1,
        ganttpanedurationunit: undefined,
        ganttpaneduration: undefined,
        showtaskstartdate: undefined,
        showtaskenddate: undefined,
        ganttwidthpercent: undefined,
        showshadow: 1,
        enablemousetracking: false
    });

    // set attribute definations
    setAttribDefs && setAttribDefs({
        showpercentlabel: {
            type: attrTypeBool,
            pAttr: 'showpercentlabel'
        },
        fontsize: {
            type: attrTypeNum
        },
        alpha: {
            type: attrTypeNum
        },
        showborder: {
            type: attrTypeBool
        },
        borderthickness: {
            type: attrTypeNum
        },
        borderalpha: {
            type: attrTypeNum
        },
        showHoverEffect: {
            type: attrTypeNum
        },
        hoverFillAlpha: {
            type: attrTypeNum
        },
        slackHoverFillColor: {
            type: attrTypeNum
        },
        slackHoverFillAlpha: {
            type: attrTypeBool
        },
        showlabels: {
            type: attrTypeBool,
            pAttr: 'showtasknames'
        },
        slackfillcolor: {
            pAttr: 'slackfillcolor'
        },
        showtasklabels: {
            type: attrTypeBool,
            pAttr: 'showtasknames'
        },
        showtasknames: {
            type: attrTypeBool,
            pAttr: 'showlabels'
        },
        showconnectorhovereffect: {
            type: attrTypeNum,
            pAttr: 'showhovereffect'
        },
        connectorextension: {
            type: attrTypeNum
        },
        tasklabelspadding: {
            type: attrTypeNum
        },
        taskdatepadding: {
            type: attrTypeNum
        },
        showstartdate: {
            type: attrTypeNum,
            pAttr: 'showtaskstartdate'
        },
        showenddate: {
            type: attrTypeNum,
            pAttr: 'showtaskenddate'
        },
        showtaskhovereffect: {
            type: attrTypeNum,
            pAttr: 'showhovereffect'
        },
        useverticalscrolling: {
            type: attrTypeNum
        },
        taskbarroundradius: {
            type: attrTypeNum
        },
        showshadow: {
            type: attrTypeNum
        },
        showslackasfill: {
            type: attrTypeNum
        }
    });


    FusionCharts.register('component', ['dataset', 'Task',{
        type: 'task',
        configure: function(){
            var dataSet = this,
                jsonData = dataSet.JSONData,
                chart = dataSet.chart,
                userConfig = extend2({}, jsonData);
            // set the default configurations
            dataSet.__setDefaultConfig();
            parseConfiguration(userConfig, dataSet.config, dataSet.chart && dataSet.chart.config, {task: true});
            dataSet.yAxis = chart.components.yAxis[0];
            dataSet._setConfigure();
        },
        _setConfigure: function (newDataset) {
            var dataset = this,
                datasetConfig = dataset.config,
                chart = dataset.chart,
                jsonData = chart.jsonData,
                chartAttrs = jsonData.chart,
                JSONData = dataset.JSONData,
                setDataArr = newDataset || JSONData.task,
                processes = jsonData.processes || {},
                process = processes.process || [],
                setDataLen = setDataArr && setDataArr.length,
                colorM = chart.components.colorManager,
                chartConfig = chart.get('config'),
                numberFormatter = chart.get('components', 'numberFormatter'),
                // taskRadius = chartConfig.taskbarroundradius,
                taskMix = chartConfig.taskbarfillmix,
                taskRatio = chartConfig.taskbarfillratio,
                showSlackAsFill = chartConfig.showslackasfill,
                dataStore = dataset.components.data,
                percentComplete,
                eDate,
                sDate,
                i,
                FCDPID = '__FCDPID__',
                arrColor,
                arrAlpha,
                arrRatio,
                dataLabel,
                serializeProcessId,
                dInt = chartConfig.dateintooltip,
                dataObj,
                taskObj,
                proLen = process.length,
                alignVal = {
                    right: 'right',
                    left: 'left',
                    'undefined': 'center',
                    'center': 'center'
                },
                id,
                tAlpha,
                tBorderAlpha,
                tBorderColor,
                label,
                color,
                fillAngle,
                showPercentLabel,
                tasksMap = chart.components.tasksMap = {},
                inCanStyle = chartConfig.style.inCanvasStyle,
                toolText,
                slHovColor,
                slColor,
                tColorObj,
                tHovColor,
                tHovBorderColor,
                taskId,
                numTasks = 0,
                dataConfig,
                dataLabelStyle = chartConfig.dataLabelStyle,
                datasetLabelStyle,
                setLabelStyle;
            if (!dataStore) {
                dataStore = dataset.components.data = [];
            }
            datasetConfig.showlabels = pluck(JSONData.showlabels, JSONData.showlabels, JSONData.showname,
                chartAttrs.showtasklabels, chartAttrs.showtasknames, 0);

            datasetLabelStyle = datasetConfig.labelStyle = extractLabelStyle({
                fontSize: datasetConfig.fontSize,
                fontFamily: datasetConfig.font
            });

            setLineHeight(datasetConfig.labelStyle);

            // Tasks
            if (setDataLen) {
                // dmin = Infinity;
                // dmax = -Infinity;
                for (i = 0; i < setDataLen; i += 1) {
                    taskObj = setDataArr[i];
                    serializeProcessId = numTasks % proLen;
                    id = pluck (taskObj.processid);
                    if (id && typeof id === 'string') {
                        id = id.toLowerCase();
                    }
                    taskId = taskObj.id;
                    percentComplete = taskObj.percentcomplete;
                    tAlpha = pluckNumber (taskObj.alpha, datasetConfig.alpha);
                    color = pluck (taskObj.color, datasetConfig.color, colorM.getColor ('plotFillColor'));
                    tBorderAlpha = pluckNumber (taskObj.borderalpha, datasetConfig.borderalpha, '100');
                    tBorderColor = pluck (taskObj.bordercolor, datasetConfig.bordercolor,
                        colorM.getColor('plotBorderColor'));

                    label = getFirstValue (pluck (taskObj.label, taskObj.name), BLANK);
                    //Parse the task color, ratio & alpha
                    arrColor = colorM.parseColorMix (color, taskMix);
                    arrAlpha = colorM.parseAlphaList (tAlpha.toString (), arrColor.length);
                    arrRatio = colorM.parseRatioList (taskRatio, arrColor.length);
                    fillAngle = pluckNumber (taskObj.angle, datasetConfig.angle);

                    dataObj = dataStore[i] || (dataStore[i] = {
                        config: {}
                    });

                    dataConfig = dataObj.config;
                    dataConfig.index = i;
                    dataConfig.link = taskObj.link;
                    dataConfig.processId = pluck(taskObj.processid, FCDPID + serializeProcessId);
                    // dataConfig.style = {
                    //     fontSize: pluckNumber (taskObj.fontsize, datasetConfig.fontsize,
                    //         inCanStyle.fontSize) + PX,
                    //     fontFamily: pluck (taskObj.font, datasetConfig.font,
                    //         inCanStyle.fontFamily)
                    // };

                    dataConfig.textColor = getFirstColor (pluck (taskObj.fontcolor,
                            datasetConfig.fontcolor, inCanStyle.color));

                    dataConfig.style = extractLabelStyle({
                        fontSize: taskObj.fontsize,
                        fontFamily: taskObj.font
                    });

                    setLineHeight(dataConfig.style);

                    setLabelStyle = dataConfig.style;

                    dataConfig.lineHeight = pluck(setLabelStyle && setLabelStyle.lineHeight, datasetLabelStyle &&
                        datasetLabelStyle.lineHeight, dataLabelStyle && dataLabelStyle.lineHeight);

                    dataConfig.startMs = numberFormatter.getDateValue (taskObj.start).ms;
                    dataConfig.endMs = numberFormatter.getDateValue (taskObj.end).ms;

                    sDate = numberFormatter.getFormattedDate (dataConfig.startMs);
                    eDate = numberFormatter.getFormattedDate (dataConfig.endMs);

                    dataConfig.tAlpha = tAlpha;
                    dataConfig.tBorderColor = tBorderColor;
                    dataConfig.tBorderAlpha = tBorderAlpha;
                    dataLabel = BLANK;
                    dataConfig.percentComplete = percentComplete =
                        mathMin (pluckNumber (taskObj.percentcomplete, -1), 100);
                    dataConfig.labelAlign = alignVal[[pluck (taskObj.labelalign,
                        chartConfig.tasklabelsalign).toLowerCase ()]];

                    dataConfig.showAsGroup = pluckNumber (taskObj.showasgroup, 0);
                    showPercentLabel = dataConfig.showPercentLabel = pluckNumber (taskObj.showpercentlabel,
                        datasetConfig.showpercentlabel);

                    if (pluckNumber (taskObj.showlabel, taskObj.showname,
                        datasetConfig.showlabels)) {
                        dataLabel = label;
                    }
                    if (showPercentLabel && percentComplete !== -1) {
                        dataLabel += ' ' + percentComplete + '%';
                    }
                    dataConfig.percentComplete = percentComplete;
                    tColorObj = {
                        FCcolor: {
                            color: arrColor.join (),
                            alpha: arrAlpha,
                            ratio: arrRatio,
                            angle: fillAngle
                        }
                    };
                    slColor = colorM.parseColorMix (pluck (taskObj.slackfillcolor,
                        datasetConfig.slackfillcolor), taskMix);

                    slColor = showSlackAsFill ? {
                        FCcolor: {
                            color: slColor.join (),
                            alpha: arrAlpha,
                            ratio: arrRatio,
                            angle: fillAngle
                        }
                    } : TRACKER_FILL;

                    tHovColor = {
                        FCcolor: {
                            color: colorM.parseColorMix (pluck (taskObj.hoverfillcolor,
                                datasetConfig.hoverfillcolor, chartConfig.taskhoverfillcolor,
                                getDarkColor (color, 80)), taskMix).join (),
                            alpha: colorM.parseAlphaList (pluck (taskObj.hoverfillalpha,
                                datasetConfig.hoverfillalpha).toString (), arrColor.length),
                            ratio: arrRatio,
                            angle: fillAngle
                        }
                    };

                    tHovBorderColor = convertColor (pluck (taskObj.hoverbordercolor,
                        datasetConfig.hoverbordercolor, getDarkColor (tBorderColor, 80)),
                        pluck (taskObj.hoverborderalpha, datasetConfig.hoverborderalpha,
                        tBorderAlpha));

                    slHovColor = showSlackAsFill ? {
                        FCcolor: {
                            color: colorM.parseColorMix (getDarkColor (pluck (taskObj.slackhoverfillcolor,
                                datasetConfig.slackhoverfillcolor, chartConfig.slackfillcolor), 80), taskMix).join (),
                            alpha: colorM.parseAlphaList (pluck (taskObj.slackhoverfillalpha,
                                datasetConfig.slackhoverfillalpha, '100').toString (), arrColor.length),
                            ratio: arrRatio,
                            angle: fillAngle
                        }
                    } : TRACKER_FILL;

                    dataConfig.color = toRaphaelColor (tColorObj),
                    dataConfig.slackColor = toRaphaelColor (slColor),
                    dataConfig.hoverFillColor = toRaphaelColor (tHovColor),
                    dataConfig.hoverBorderColor = tHovBorderColor,
                    dataConfig.slackHoverColor = toRaphaelColor (slHovColor),
                    dataConfig.showHoverEffect = pluckNumber (taskObj.showhovereffect,
                        datasetConfig.showhovereffect, chartConfig.showtaskhovereffect, 1);
                    dataConfig.taskHeight = pluck(taskObj.height, '35%');
                    dataConfig.topPadding = pluck (taskObj.toppadding, '35%');
                    dataConfig.showPercentLabel = showPercentLabel;
                    dataConfig.endDate = pluckNumber (taskObj.showenddate,
                        datasetConfig.showenddate) ? eDate : UNDEF;
                    dataConfig._endDate = eDate;
                    dataConfig.startDate = pluckNumber (taskObj.showstartdate,
                        datasetConfig.showstartdate) ? sDate : UNDEF;
                    dataConfig._startDate = sDate;
                    dataConfig.shadow = {
                        opacity: mathMax (tAlpha, tBorderAlpha) / 100,
                        inverted: true
                    };
                    dataConfig.id = id;
                    dataConfig.taskId = taskId;
                    dataConfig.borderColor = convertColor (tBorderColor,
                        tBorderAlpha),
                    dataConfig.borderThickness = pluckNumber (taskObj.showborder,
                        datasetConfig.showborder) ? pluckNumber (taskObj.borderthickness,
                        datasetConfig.borderthickness) : 0;
                    toolText = getValidValue (parseUnsafeString (pluck (
                        taskObj.tooltext, datasetConfig.hovertext, datasetConfig.plottooltext,
                        chartAttrs.plottooltext)));
                    if (toolText !== undefined) {
                        toolText = lib.parseTooltext (toolText, [3,28,29,30,31], {
                            end: eDate,
                            start: sDate,
                            label: label,
                            percentComplete: percentComplete !== -1 ?
                                numberFormatter.percentValue (percentComplete) : BLANK,
                            processName: ''
                        }, datasetConfig);
                    }
                    else {
                        toolText = ((label !== BLANK) ?
                            (label + (dInt ? ', ' : BLANK)) : BLANK) +
                            (dInt ? (sDate + ' - ' + eDate) : BLANK);
                    }
                    dataConfig.label = dataLabel;
                    dataConfig.toolText = toolText;
                    typeof taskId === 'string' && (taskId = taskId.toLowerCase());
                    if (taskId !== UNDEFINED) {
                        tasksMap[taskId] = dataStore[i];
                    }
                    numTasks += 1;
                }
            }
            dataset.visible = pluckNumber(JSONData.visible, 1);
        },

        getAxisValuePadding: function(){},

        draw: function() {
            var dataSet = this,
                i,
                visible = dataSet.visible,
                chart = dataSet.chart,
                jsonData = chart.jsonData,
                chartConfig = chart.get('config'),
                animationObj = chart.get('config', 'animationObj'),
                animationDuration = animationObj.duration,
                dummyAnimElem = animationObj.dummyObj,
                dummyAnimObj = animationObj.animObj,
                animType = animationObj.animType,
                chartComponents = chart.components,
                canvasTop = chartConfig.canvasTop,
                paper = chartComponents.paper,
                xAxis = chartComponents.xAxis[0],
                len,
                yAxis = dataSet.yAxis,
                parentContainer = chart.graphics.parentTaskGroup,
                components = dataSet.components,
                dataStore = components.data,
                dataObj,
                config,
                removeDataArr = components.removeDataArr,
                removeDataArrLen = removeDataArr && removeDataArr.length,
                dataLabelsLayer = chart.graphics.datalabelsGroup,
                dataLabelContainer = dataSet.graphics.dataLabelContainer,
                initAnimCallBack = function () {
                    dataLabelContainer.show();
                },
                graphics = dataSet.graphics,
                container = graphics.container,
                shadowContainer = graphics.shadowContainer,
                pool = components.pool || [],
                endX,
                startMs,
                endMs,
                setLink,
                toolText,
                height,
                id,
                pHeight,
                width,
                width2,
                xPos,
                yPos,
                position,
                taskBarElement,
                perComElem,
                slackElem,
                borderThickness,
                elemType,
                isNewElem,
                taskBarElementAttrs,
                beforeAnimAttrs,
                crispBox,
                halfH,
                txtAlign,
                borderFill,
                padding,
                eventArgs,
                incrementId,
                showTooltip = chartConfig.showtooltip,
                datePadding = chartConfig.datepadding,
                taskHeight,
                viewPortConfig = chartConfig.viewPortConfig,
                x = viewPortConfig.x,
                labelTextAttr,
                endLabelTextAttr,
                startLabelTextAttr,
                jobList = chart.getJobList(),
                proLen = jsonData.processes.process && jsonData.processes.process.length,
                scaleX = viewPortConfig.scaleX,
                taskBarRadius = chartConfig.taskbarroundradius,
                shadow = chartConfig.showshadow,
                cursor,
                processDimention,
                conf = dataSet.config,
                lineHeight;

            /*
             * Creating a container group for the graphic element of column plots if
             * not present and attaching it to its parent group.
             */
            if (!container) {
                container = dataSet.graphics.container = paper.group('columns', parentContainer);
                if (!visible) {
                    container.hide();
                }
                else {
                    container.show();
                }
            }

            if (!dataLabelContainer) {
                dataLabelContainer = dataSet.graphics.dataLabelContainer = paper.group('labels', dataLabelsLayer);
                if (!visible) {
                    dataLabelContainer.hide();
                }
                else {
                    dataLabelContainer.show();
                }
                dataLabelContainer.css(conf.labelStyle);
            }
            else {
                dataLabelContainer.removeCSS();
                dataLabelContainer.css(conf.labelStyle);
            }

            /*
             * Creating the shadow element container group for each plots if not present
             * and attaching it its parent group.
             */
            if (!shadowContainer) {
                // Always sending the shadow group to the back of the plots group.
                shadowContainer = dataSet.graphics.shadowContainer =
                    paper.group('shadow', parentContainer).toBack();

                if (!visible) {
                    shadowContainer.hide();
                }
            }

            if (!showTooltip) {
                container.trackTooltip(false);
            }
            else {
                container.trackTooltip(true);
            }

            len = dataStore.length;
            incrementId = 0;
            // Create plot elements.
            for (i = 0; i < len; i++) {
                dataObj = dataStore[i];
                config = dataObj && dataObj.config;
                startMs = config && config.startMs;
                endMs = config && config.endMs;
                // Condition arises when user has removed data in real time update
                if (dataObj === undefined || startMs === undefined || endMs === null) {
                    continue;
                }
                toolText = config.toolText;
                taskHeight = config.taskHeight;
                setLink = config.link;
                borderThickness = config.borderThickness;
                id = config.id;
                borderFill = config.color;
                lineHeight = config.lineHeight;

                isNewElem = false;
                if (incrementId > proLen - 1) {
                    incrementId = 0;
                }
                if (config.id !== undefined) {
                    processDimention = yAxis.getProcessPositionById(id);

                } else {
                    processDimention = yAxis.getProcessPositionByIndex(incrementId);
                }

                incrementId++;
                pHeight = processDimention.height;
                padding = (pHeight * (isPercent (config.topPadding) &&
                    toFloat (config.topPadding, 10) * 0.01)) ||
                    pluckNumber (config.topPadding, pHeight);
                height = config.height = (pHeight * (isPercent(taskHeight) &&
                    toFloat(taskHeight, 10) * 0.01)) ||
                    pluckNumber(taskHeight, pHeight);

                position = config.id !== undefined ? yAxis.getProcessPositionById(id) : i;
                xPos = config.xPos = xAxis.getAxisPosition(config.startMs) + (x * scaleX);
                endX = xAxis.getAxisPosition(config.endMs) + (x * scaleX);
                width = config.width = mathAbs (width2 = endX - xPos);
                yPos = processDimention.bottom + canvasTop - pHeight;

                yPos = config.yPos = (yPos + mathMin (padding, pHeight - height));
                halfH = height * 0.5;
                !dataObj.graphics && (dataObj.graphics = {});
                crispBox = R.crispBound (xPos, yPos, width, height, borderThickness);
                xPos = crispBox.x;
                yPos = crispBox.y;
                width = crispBox.width;
                height = crispBox.height;

                if (checkInvalidValue(xPos, yPos, width, height) === false) {
                    continue;
                }
                taskBarElement = dataObj.graphics.element;
                if (config.showAsGroup) {
                    elemType = 'path';
                    beforeAnimAttrs = {
                        path: [M, xPos, yPos]
                    };
                    taskBarElementAttrs = {
                        path: [M, xPos, yPos, v, height,
                            L, xPos + halfH, yPos + halfH, H, xPos + width - halfH,
                            L, xPos + width, yPos + height, v, -height, H, xPos]
                    };
                }
                else {
                    elemType = 'rect';
                    taskBarElementAttrs = {
                        x: crispBox.x,
                        y: crispBox.y,
                        width: crispBox.width || 1,
                        height: height
                    };
                    if (animationDuration) {
                        beforeAnimAttrs = {
                            x: crispBox.x,
                            y: crispBox.y,
                            width: 0,
                            height: height
                        };
                    }
                    else {
                        beforeAnimAttrs = taskBarElementAttrs;
                    }
                }

                if (taskBarElement && (taskBarElement && taskBarElement.type !== elemType)) {
                    taskBarElement.hide();
                    taskBarElement = dataObj.graphics.element = null;
                }
                if (!taskBarElement) {
                    elemType = config.showAsGroup ? 'path' : 'rect';
                    if (pool.element && pool.element.length && (taskBarElement = pool.element[0]).type ===
                        elemType) {
                        dataObj.graphics.element = taskBarElement = pool.element.shift();
                    }
                    else {
                        taskBarElement =  dataObj.graphics.element = paper[elemType](container)
                            .attr(beforeAnimAttrs)
                            .data('dataset', dataSet);

                        isNewElem = true;
                        dataSet.slackElemHandlers(taskBarElement, chart);
                    }
                }

                eventArgs = config.eventArgs = {
                    processId: config.processId,
                    taskId: config.taskId,
                    start: config._startDate,
                    end: config._endDate,
                    showAsGroup: config.showAsGroup,
                    link: config.link,
                    sourceType: 'task',
                    percentComplete: config.percentComplete !== -1
                };

                if (config.percentComplete !== -1 && !config.showAsGroup) {
                    width2 = width * config.percentComplete * 0.01;
                    borderFill = TRACKER_FILL;
                    perComElem = dataObj.graphics.taskFill;
                    slackElem = dataObj.graphics.slackElem;

                    // Percent complete element
                    if (!perComElem) {
                        if (pool.taskFill && pool.taskFill.length) {
                            perComElem = dataObj.graphics.taskFill = pool.taskFill.shift();
                        }
                        else {
                            perComElem = dataObj.graphics.taskFill = paper.rect(container);
                            dataSet.slackElemHandlers(perComElem, chart);
                            isNewElem = true;
                            perComElem.attr({
                                x: xPos,
                                y: yPos,
                                height: height,
                                width: animationDuration ? 0 : width2
                            });
                        }
                    }

                    // Slack Element
                    if (!slackElem) {
                        // Reuse elemnt from pool if any
                        if (pool.slackElem && pool.slackElem.length) {
                            slackElem = dataObj.graphics.slackElem = pool.slackElem.shift();
                        }
                        else {
                            slackElem = dataObj.graphics.slackElem = paper.rect(container);
                            dataSet.slackElemHandlers(slackElem, chart);
                            isNewElem = true;
                            slackElem.attr({
                                x: xPos,
                                y: yPos,
                                width: 0,
                                height: height
                            });
                        }
                    }

                    perComElem.show().animateWith(dummyAnimElem, dummyAnimObj, {
                        x: xPos,
                        y: yPos,
                        height: height,
                        width: width2,
                        r: 0
                    }, animationDuration, animType);
                    perComElem.attr({
                        fill: config.color,
                        cursor: setLink ? 'pointer' : BLANK,
                        ishot: true,
                        'stroke-width': 0
                    })
                    .data('chart', chart)
                    .data('dataObj', dataObj)
                    .data('dataset', dataSet)
                    .tooltip (toolText);

                    slackElem.show().animateWith(dummyAnimElem, dummyAnimObj, {
                        x: (xPos + width2) || 1,
                        y: yPos,
                        width: width - width2,
                        height: height,
                        r: 0
                    }, animationDuration, animType);

                    slackElem.attr({
                        fill: config.slackColor,
                        cursor: setLink ? 'pointer' : BLANK,
                        ishot: true,
                        'stroke-width': 0
                    });

                    perComElem && perComElem.data ('eventArgs', eventArgs);

                    slackElem && slackElem.data ('eventArgs', eventArgs)
                        .data('dataObj', dataObj)
                        .data('dataset', dataSet)
                        .data('chart', chart);
                }
                else {
                    // If there are slack elements then hide those
                    dataObj.graphics.taskFill && dataObj.graphics.taskFill.hide();
                    dataObj.graphics.slackElem && dataObj.graphics.slackElem.hide();
                }
                // set the attr
                taskBarElement.show().animateWith(dummyAnimElem, dummyAnimObj, taskBarElementAttrs, animationDuration,
                    animType)
                .attr ({
                    fill: borderFill,
                    stroke: config.borderColor,
                    cursor: setLink ? 'pointer' : BLANK,
                    ishot: true,
                    r: taskBarRadius,
                    'stroke-width': borderThickness
                })
                .shadow({
                    opacity: shadow
                }, shadowContainer)
                .tooltip (toolText)
                .data('dataObj', dataObj)
                .data('chart', chart)
                .data('dataset', dataSet)
                .data('eventArgs', eventArgs);

                if (animationDuration && isNewElem) {
                    dataLabelContainer.hide();
                    taskBarElement.animateWith (dummyAnimElem, dummyAnimObj, {
                            width: crispBox.width || 1
                        }, animationDuration, animType, initAnimCallBack);

                }

                cursor = setLink ? 'pointer' : BLANK;
                txtAlign = config.labelAlign;
                labelTextAttr = config._labelTextAttr || (config._labelTextAttr = {});

                labelTextAttr.x = xPos + (width * xAlign[txtAlign]) + alignGutter[txtAlign];
                labelTextAttr.y = (yPos - (pInt (lineHeight, 10) * 0.5) - chartConfig.tasklabelspadding);
                labelTextAttr.text = config.label;
                labelTextAttr.direction = chartConfig.textDirection;
                labelTextAttr['text-anchor'] = align[txtAlign];
                labelTextAttr.cursor = cursor;
                labelTextAttr.ishot = true;
                labelTextAttr.fill = config.textColor;
                labelTextAttr['line-height'] = lineHeight;

                startLabelTextAttr = config._startLabelTextAttr || (config._startLabelTextAttr = {});

                startLabelTextAttr.x = xPos - 2 - datePadding,
                startLabelTextAttr.y = (yPos + (height * 0.5));

                startLabelTextAttr.text = config.startDate;
                startLabelTextAttr['text-anchor'] = 'end';
                startLabelTextAttr.cursor = cursor;
                startLabelTextAttr.ishot = true;
                startLabelTextAttr.direction = chartConfig.textDirection;
                startLabelTextAttr.fill = config.textColor;
                startLabelTextAttr['line-height'] = lineHeight;

                endLabelTextAttr = config._endLabelTextAttr || (config._endLabelTextAttr = {});

                endLabelTextAttr.x = xPos  + width + 2 + datePadding;
                endLabelTextAttr.y = (yPos + (height * 0.5));
                endLabelTextAttr.text = config.endDate;
                endLabelTextAttr.cursor = cursor;
                endLabelTextAttr.ishot = true;
                endLabelTextAttr.direction = chartConfig.textDirection;
                endLabelTextAttr['text-anchor'] = 'start';
                endLabelTextAttr.fill = config.textColor;
                endLabelTextAttr['line-height'] = lineHeight;

                config.cursor = cursor;
                isNewElem = false;
            }

            dataSet.drawn ? dataSet.drawLabel() : jobList.labelDrawID.push(schedular.addJob(dataSet.drawLabel,
                dataSet, [], lib.priorityList.label));
            // Setting the drawn flag true to draw differently incase of real time draw.
            dataSet.drawn = true;
            for (i = 0; i < removeDataArrLen; i++) {
                dataSet._removeDataVisuals(removeDataArr.shift());
            }
        },
        drawLabel: function () {
            var dataset = this,
                chart = dataset.chart,
                paper = chart.components.paper,
                dataStore = dataset.components.data,
                pool = dataset.components.pool || {},
                valElem,
                startValElem,
                endValElem,
                config,
                animationObj = chart.get('config','animationObj'),
                dummyAnimElem = animationObj.dummyObj,
                dummyAnimObj = animationObj.animObj,
                animationDuration = animationObj.duration,
                animType = animationObj.animType,
                dataObj,
                eventArgs,
                textAttr,
                startLabelTextAttr,
                endLabelTextAttr,
                cursor,
                dataLabelContainer = dataset.graphics.dataLabelContainer,
                i,
                len = dataStore.length;

            for (i = 0; i < len; i++) {
                dataObj = dataStore[i];
                config = dataObj.config;
                graphics = dataObj.graphics;
                valElem = graphics.label;
                startValElem = graphics.startValElem;
                endValElem = graphics.endValElem;
                cursor = config.cursor;
                eventArgs = config.eventArgs;
                if (defined (config.label) && config.label !== BLANK) {

                    textAttr = config._labelTextAttr;

                    valElem = graphics.label || (graphics.label = pool.valElem && pool.valElem.shift());
                    if (!valElem) {
                        valElem = dataObj.graphics.label = paper.text(textAttr, config.style, dataLabelContainer)
                            .data('dataset', dataset);
                        dataset.slackElemHandlers(valElem, chart);
                    }
                    else {
                        valElem.removeCSS();
                        valElem.show().animateWith(dummyAnimElem, dummyAnimObj, textAttr,
                            animationDuration, animType)
                        .css(config.style);
                    }

                    valElem.data('dataObj', dataObj)
                        .data('dataObj', dataObj)
                        .data('eventArgs', eventArgs);
                }
                else {
                    valElem && valElem.hide();
                }

                textAttr = config._startLabelTextAttr;

                // Task start date element
                startValElem = dataObj.graphics.startLabel;

                if (defined (config.startDate) && config.startDate !== BLANK) {

                    startLabelTextAttr = config._startLabelTextAttr;

                    startValElem = graphics.startLabel || (graphics.startLabel = pool.startValElem &&
                        pool.startValElem.shift());

                    if (!startValElem) {
                        startValElem = dataObj.graphics.startLabel = paper.text(startLabelTextAttr, config.style,
                            dataLabelContainer)
                            .data('dataset', dataset);
                        dataset.slackElemHandlers(startValElem, chart);
                    }
                    else {
                        startValElem.removeCSS();
                        startValElem.show().animateWith(dummyAnimElem, dummyAnimObj, startLabelTextAttr,
                            animationDuration, animType).css(config.style);
                    }

                    startValElem.data('dataObj', dataObj)
                        .data('chart', chart)
                        .data('eventArgs', eventArgs);
                }
                else {
                    startValElem && startValElem.hide();
                }

                // Task end date label drawing
                endValElem = dataObj.graphics.endLabel;

                if (defined (config.endDate) && config.endDate !== BLANK) {

                    endLabelTextAttr = config._endLabelTextAttr;

                    endValElem = graphics.endLabel || (graphics.endLabel = pool.endValElem && pool.endValElem.shift());

                    if (!endValElem) {
                        endValElem = dataObj.graphics.endLabel = paper.text(endLabelTextAttr, config.style,
                            dataLabelContainer).data('dataset', dataset);
                        dataset.slackElemHandlers(endValElem, chart);
                    }
                    else {
                        endValElem.removeCSS();
                        endValElem.show().animateWith(dummyAnimElem, dummyAnimObj, endLabelTextAttr,
                            animationDuration, animType).css (config.style);
                    }

                    endValElem.data('dataObj', dataObj)
                    .data('chart', chart)
                    .data('eventArgs', eventArgs);
                }
                else {
                    endValElem && endValElem.hide();
                }
            }

        },
        slackElemHandlers: function (ele, chart) {
            var dataset = this;
            ele && ele.click (function (e) {
                var ele = this;
                plotEventHandler.call (ele, chart, e);
            })
            .hover (function (data) {
                var ele = this,
                    dataObj = ele.data ('dataObj');
                plotEventHandler.call (ele, chart, data, ROLLOVER);
                dataObj.config.showHoverEffect && dataset.taskHoverHandler.call (ele, chart);
            }, function (data) {
                var ele = this,
                    dataObj = ele.data ('dataObj');
                plotEventHandler.call (ele, chart, data, ROLLOUT);
                dataObj.config.showHoverEffect && dataset.taskHoverOutHandler.call (ele, chart);
            });
        },
        taskHoverHandler: function () {
            var ele = this,
                dataObj = ele.data ('dataObj') || {},
                dataset = ele.data('dataset'),
                dataStore = dataset.components.data,
                config = dataObj.config || {},
                index = config.index,
                graphics = dataStore[index] && dataStore[index].graphics,
                attrib = {
                    fill: config.hoverFillColor,
                    stroke: config.hoverBorderColor
                };

            if (config.percentComplete !== -1 &&
                    !config.showAsGroup) {
                graphics.slackElem.attr ( {
                    fill: config.slackHoverColor
                });
                graphics.taskFill.attr ( {
                    fill: config.hoverFillColor
                });
                delete attrib.fill;
            }
            graphics.element.attr (attrib);
        },
        taskHoverOutHandler: function () {
            var ele = this,
                dataObj = ele.data ('dataObj') || {},
                dataset = ele.data ('dataset') || {},
                dataStore = dataset.components.data,
                config = dataObj.config || {},
                index = config.index,
                graphics = dataStore[index] && dataStore[index].graphics,
                attrib = {
                    fill: config.color,
                    stroke: config.borderColor,
                    'stroke-width': config.borderThickness,
                    'stroke-dasharray': config.dashedStyle
                };

            if (graphics) {
                if (config.percentComplete !== -1 &&
                    !config.showAsGroup) {
                    graphics.slackElem.attr ( {
                        fill: config.slackColor
                    });
                    graphics.taskFill.attr ( {
                        fill: config.color
                    });
                    delete attrib.fill;
                }
                graphics.element.attr (attrib);
            }

        },
        slackElemClickHandler: function (e) {
            var ele = this,
                chart = ele.data('chart');
            plotEventHandler.call (ele, chart, e);
        },
        // Function to remove a data from a dataset during real time update.
        _removeDataVisuals : function (dataObj) {
            var dataSet = this,
                pool = dataSet.components.pool || (dataSet.components.pool = {}),
                elementPool,
                ele,
                graphics,
                graphicsObj;
            if (!dataObj) {
                return;
            }
            graphics = dataObj.graphics;
            for (ele in graphics) {
                elementPool = pool[ele] || (pool[ele] = []);
                graphicsObj = graphics[ele];
                if (graphicsObj.hide && typeof graphicsObj.hide === 'function') {
                    graphicsObj.attr({
                        'text-bound': []
                    });
                    graphicsObj.hide();
                    graphicsObj.transform && graphicsObj.transform('');
                }
                elementPool.push(graphics[ele]);
            }
        }
    }, 'column', {

        // configurations with defult values
        showpercentlabel: undefined,
        showlabels: undefined,
        showborder: 1,
        borderthickness: 1,
        // inherated from parent
        font: '',
        fontcolor: '',
        fontsize: '',
        color: '',
        alpha: '100',
        angle: 270,
        slackfillcolor: undefined,
        borderalpha: '100',
        hoverfillcolor: '',
        hoverfillalpha: '100',
        slackhoverfillalpha: '100',
        showstartdate: UNDEFINED,
        showenddate: UNDEFINED
    }]);

    FusionCharts.register('component', ['dataset', 'Milestone',{
        type: 'Milestone',
        configure: function(){
            var dataSet = this,
                config = dataSet.config,
                jsonData = dataSet.JSONData,
                chart = dataSet.chart,
                userConfig = extend2({}, jsonData);

            dataSet.__setDefaultConfig();
            parseConfiguration(userConfig, config, {milestones: true});
            dataSet.yAxis = chart.components.yAxis[0];
            dataSet._setConfigure();
        },
        _setConfigure: function (newDataset) {
            var dataset = this,
                chart = dataset.chart,
                JSONData = dataset.JSONData,
                setDataArr = newDataset || JSONData.milestone,
                setDataLen = setDataArr && setDataArr.length,
                colorM = chart.components.colorManager,
                chartConfig = chart.get('config'),
                numberFormatter = chart.get('components', 'numberFormatter'),
                dataStore = dataset.components.data,
                style = chart.config.style,
                inCanStyle = style.inCanvasStyle,
                tasksMap = chart.components.tasksMap,
                dataObj,
                taskConfigObj,
                dataConfig,
                i,
                setData,
                sides,
                color,
                shape,
                depth,
                toolText,
                hoverFillColor,
                taskId,
                labelStyle = chart.config.milestoneLabelStyle,
                dateMs,
                milestoneDate;

            if (!dataStore) {
                dataStore = dataset.components.data = [];
            }
            for (i = 0; i < setDataLen; i += 1) {
                setData = setDataArr[i];
                dataObj = dataStore[i];
                if (!dataObj) {
                    dataObj = dataStore[i] = {
                        config: {}
                    };
                }
                dataConfig = dataObj.config;
                taskId = getFirstValue (setData.taskid, BLANK).toLowerCase ();
                shape = pluck (setData.shape, 'polygon').toLowerCase ();

                sides = pluckNumber (setData.numsides, 5);
                //Restrict
                //shape = (shape == 'star') ? shape : mapSymbolName (sides);
                depth = 0;
                if (shape === 'star') {
                    depth = 0.4;
                } else {
                    shape = mapSymbolName (sides);
                    shape = mapSymbolName (sides).split ('-')[0];
                }

                color = pluck (setData.color, colorM.getColor ('legendBorderColor'));

                toolText = getValidValue (parseUnsafeString (pluck (setData.tooltext,
                    setData.hovertext, chartConfig.milestonetooltext)));

                dateMs = numberFormatter.getDateValue(setData.date).ms;
                milestoneDate = numberFormatter.getFormattedDate(dateMs);

                if (toolText !== undefined && tasksMap[taskId]) {
                    taskConfigObj = tasksMap[taskId].config;
                    toolText = lib.parseTooltext (toolText, [28,32,33,34,35,36], {
                        date: milestoneDate,
                        taskStartDate: taskConfigObj._startDate,
                        taskEndDate: taskConfigObj._endDate,
                        taskLabel: taskConfigObj.label,
                        taskPercentComplete: taskConfigObj.percentComplete !== -1 ?
                            numberFormatter.percentValue (taskConfigObj.percentComplete) : BLANK,
                        // @todo add the process name from data table once created
                        processName: ''
                    }, setData);
                }
                else {
                    toolText = milestoneDate;
                }

                // style = {
                //     fontSize: pluckNumber (setData.fontsize, chartConfig.milestonefontsize,
                //         inCanStyle.fontSize) + PX,
                //     fontFamily: pluck (setData.font, chartConfig.milestonefont,
                //         inCanStyle.fontFamily),
                //     fontWeight: pluckNumber (setData.fontbold,
                //         chartConfig.milestonefontbold, 0) && BOLD || NORMAL,
                //     fontStyle: pluckNumber (setData.fontitalic,
                //         chartConfig.milestonefontitalic, 0) && ITALIC || NORMAL
                // };

                style = dataConfig.style = extractLabelStyle({
                    fontSize: setData.fontsize,
                    fontFamily: setData.font,
                    fontWeight: setData.fontbold,
                    fontStyle: setData.fontitalic
                });

                dataConfig.textColor = getFirstColor (pluck (setData.fontcolor,
                    chartConfig.milestonefontcolor, inCanStyle.color));


                setLineHeight (style);

                dataConfig.lineHeight = pluck(style && style.lineHeight, labelStyle && labelStyle.lineHeight);

                dataConfig.numSides = sides,
                dataConfig.startAngle = pluckNumber (setData.startangle, 90),
                dataConfig.radius = setData.radius,
                dataConfig.origDate = setData.date,
                dataConfig.date = numberFormatter.getDateValue (setData.date),
                dataConfig.fillColor = getFirstColor (color),
                dataConfig.fillAlpha = pluckNumber (setData.fillalpha, setData.alpha, 100) * 0.01,
                dataConfig.borderColor = getFirstColor (pluck (setData.bordercolor, color)),
                dataConfig.borderAlpha = pluckNumber (setData.borderalpha, setData.alpha, 100) * 0.01,
                dataConfig.displayValue = parseUnsafeString (setData.label),
                dataConfig.style = style;
                hoverFillColor = dataConfig.hoverFillColor = getFirstColor (pluck (setData.hoverfillcolor,
                    chartConfig.milestonehoverfillcolor, getDarkColor (color, 80))),
                dataConfig.hoverFillAlpha = pluckNumber (setData.hoverfillalpha,
                    chartConfig.milestonehoverfillalpha, setData.fillalpha,
                    setData.alpha, 100) * 0.01,
                dataConfig.hoverBorderColor = getFirstColor (pluck (setData.hoverbordercolor,
                    chartConfig.milestonehoverbordercolor,
                    getDarkColor (pluck (setData.bordercolor, color), 80))),
                dataConfig.hoverBorderAlpha = pluckNumber (setData.hoverborderalpha,
                    chartConfig.milestonehoverborderalpha, setData.borderalpha,
                    setData.alpha, 100) * 0.01,
                dataConfig.showHoverEffect = pluckNumber (setData.showhovereffect,
                    chartConfig.showmilestonehovereffect, chartConfig.showhovereffect, 1),

                dataConfig.depth = depth,
                dataConfig.taskId = taskId,
                dataConfig.borderThickness = pluckNumber (setData.borderthickness, 1),
                dataConfig.link = setData.link;
                dataConfig.toolText = toolText;
            }
            dataset.visible = pluckNumber(JSONData.visible, 1);
        },
        draw: function () {
            var dataset = this,
                chart = dataset.chart,
                chartComponents = chart.components,
                components = dataset.components,
                xAxis = chartComponents.xAxis[0],
                dataStore = components.data,
                taskMap = chartComponents.tasksMap,
                chartConfig = chart.config,
                animationObj = chart.get('config', 'animationObj'),
                animationDuration = animationObj.duration,
                container = dataset.graphics.container,
                parentContainer = chart.graphics.parentMilestoneGroup,
                dataLabelContainer = dataset.graphics.dataLabelContainer,
                visible = dataset.visible,
                paper = chartComponents.paper,
                removeDataArr = dataset.components.removeDataArr || [],
                removeDataArrLen = removeDataArr.length,
                dummyAnimElem = animationObj.dummyObj,
                dummyAnimObj = animationObj.animObj,
                animType = animationObj.animType,
                dataObj,
                taskObj,
                graphics,
                config,
                eventArgs,
                taskConfigObj,
                setElement,
                xPos,
                yPos,
                polypath,
                radius,
                milestoneAnimate,
                labelElement,
                i,
                ln,
                labelAttrs,
                jobList = chart.getJobList(),
                showTooltip = chartConfig.showtooltip,
                pool = dataset.components.pool || [];
            if (!container) {
                container = dataset.graphics.container = paper.group('milestone', parentContainer);
                if (!visible) {
                    container.hide();
                }
                else {
                    container.show();
                }
            }
            if (!dataLabelContainer) {
                dataLabelContainer = dataset.graphics.dataLabelContainer = paper.group('labels', parentContainer);
                if (!visible) {
                    dataLabelContainer.hide();
                }
                else {
                    dataLabelContainer.show();
                }
            }

            if (!showTooltip) {
                container.trackTooltip(false);
            }
            else {
                container.trackTooltip(true);
            }

            ln = dataStore && dataStore.length;
            for (i = 0; i < ln; i += 1) {
                dataObj = dataStore[i];
                if (!dataObj) {
                    continue;
                }
                config = dataObj.config;
                taskObj = taskMap[config.taskId];
                !dataObj.graphics && (dataObj.graphics = {});
                graphics = dataObj.graphics;
                setElement = graphics.element;
                labelElement = graphics.label;
                if (taskObj) {
                    taskConfigObj = taskObj.config;
                    milestoneAnimate = R.animation ({
                        'fill-opacity': config.fillAlpha,
                        'stroke-opacity': config.borderAlpha
                    },
                    animationDuration, animType);

                    eventArgs = config.eventArgs = {
                        sides: config.sides,
                        date: config.origDate,
                        radius: config.radius,
                        taskId: config.taskId,
                        toolText: config.toolText,
                        link: config.link,
                        numSides: config.numSides
                    };
                    xPos = xAxis.getPixel (config.date.ms);
                    yPos = taskConfigObj.yPos + (taskConfigObj.height * 0.5);
                    radius = pluckNumber (config.radius, taskConfigObj.height * 0.6);

                    if (checkInvalidValue(xPos, yPos, radius) === false) {
                        continue;
                    }
                    polypath = [config.numSides, xPos, yPos, radius, config.startAngle, config.depth];
                    if (!setElement) {
                        if (pool.element && pool.element.length) {
                            setElement = graphics.element = pool.element.shift();
                        }
                        else {
                            setElement = graphics.element = paper.polypath(container)
                                .click(dataset.clickHandler(chart))
                                .hover (dataset.rollOverHandler(chart), dataset.rollOutHandler(chart));
                        }
                    }
                    setElement.show().animateWith(dummyAnimElem, dummyAnimObj, {
                        polypath: polypath
                    }, animationDuration, animType).attr({
                        fill: config.fillColor,
                        'fill-opacity': animationDuration ? 0 : config.fillAlpha,
                        stroke: config.borderColor,
                        'stroke-opacity': animationDuration ? 0 : config.borderAlpha,
                        groupId: 'gId' + i,
                        ishot: true,
                        cursor: config.link ? 'pointer' : BLANK,
                        'stroke-width': config.borderThickness
                    })
                    .tooltip(config.toolText)
                    .data ('eventArgs', eventArgs)
                    .data ('dataObj', dataObj);

                    if (animationDuration && milestoneAnimate && !dataset.drawn) {
                        graphics.element.animateWith(dummyAnimElem, dummyAnimObj,
                            milestoneAnimate.delay (animationDuration));
                    }

                    labelAttrs = config._labelAttrs || (config._labelAttrs = {});
                    labelAttrs.x = xPos;
                    labelAttrs.y = yPos;
                    labelAttrs.text = config.displayValue;
                    labelAttrs.groupId  = 'gId' + i;
                    labelAttrs.cursor = config.link ? 'pointer' : BLANK;
                    labelAttrs.ishot = true;
                    labelAttrs.direction = chartConfig.textDirection;
                    labelAttrs['text-anchor']  = 'middle';
                    labelAttrs.fill = config.textColor;
                }
                else {
                    setElement && setElement.hide();
                    labelElement && labelElement.hide();
                }
            }

            dataset.drawn ? dataset.drawLabel() : jobList.labelDrawID.push(schedular.addJob(dataset.drawLabel,
                dataset, [], lib.priorityList.label));

            dataset.drawn = true;
            for (i = 0; i < removeDataArrLen; i++) {
                dataset._removeDataVisuals(removeDataArr.shift());
            }
        },
        drawLabel: function () {
            var dataset = this,
                chart = dataset.chart,
                paper = chart.components.paper,
                animationObj = chart.get('config', 'animationObj'),
                animationDuration = animationObj.duration,
                animType = animationObj.animType,
                dummyAnimElem = animationObj.dummyObj,
                dummyAnimObj = animationObj.animObj,
                tasksMap = chart.components.tasksMap,
                config,
                dataLabelContainer = dataset.graphics.dataLabelContainer,
                eventArgs,
                dataObj,
                i,
                labelElement,
                len,
                graphics,
                labelAttrs,
                taskObj,
                pool = dataset.components.pool || {},
                dataStore = dataset.components.data,
                style;

            for (i = 0, len = dataStore.length; i < len; i++) {
                dataObj = dataStore[i];
                config = dataObj.config;
                taskObj = tasksMap[config.taskId];
                graphics = dataObj.graphics;
                labelElement = graphics.label;
                eventArgs = config.eventArgs;
                labelAttrs = config._labelAttrs;
                style = config.style;
                if (config.displayValue !== BLANK && config.displayValue !== UNDEFINED && taskObj) {
                    labelElement = graphics.label || (graphics.label = pool.label && pool.label.shift());
                    // Drawing of milestone label element
                    if (!labelElement) {
                        labelElement = graphics.label = paper.text (labelAttrs, style, dataLabelContainer)
                            .click (dataset.clickHandler(chart))
                            .hover (dataset.rollOverHandler(chart), dataset.rollOutHandler(chart));
                    }
                    else {
                        labelElement.removeCSS();
                        labelElement.show().animateWith(dummyAnimElem, dummyAnimObj, labelAttrs,
                            animationDuration, animType)
                        .css (style);
                    }

                    labelElement.tooltip(config.toolText)
                        .data ('eventArgs', eventArgs)
                        .data ('dataObj', dataObj);
                }
                else {
                    labelElement && labelElement.hide();
                }
            }

        },
        clickHandler: function (chart) {
            return  function (event) {
                var ele = this;
                /**
                 * In `Gantt` chart, milestones are an important part of the chart as they allow you to visually
                 * depict any crucial dates on the chart.
                 * This event is fired when a milestone is clicked
                 *
                 * This event is only applicable to Gantt chart.
                 *
                 * @event FusionCharts#milestoneClick
                 *
                 * @param {string} date - The date of the milestone.
                 * @param {string} numSides - The number of sides of the milestone.
                 * @param {string} radius - The radius of the milestone.
                 * @param {string} taskId - The id of the task to which this milestone relates to.
                 * @param {string} toolText - The tooltext that is displayed when hovered over the milestone
                 * @param {number} chartX - x-coordinate of the pointer relative to the chart.
                 * @param {number} chartY - y-coordinate of the pointer relative to the chart.
                 * @param {number} pageX - x-coordinate of the pointer relative to the page.
                 * @param {number} pageY - y-coordinate of the pointer relative to the page.
                 * @see FusionCharts#event:milestoneRollOver
                 * @see FusionCharts#event:milestoneRollOut
                 */
                plotEventHandler.call(ele, chart, event, 'MilestoneClick');
            };

        },
        rollOverHandler: function (chart) {
            return function (event) {
                var ele = this,
                    dataObj = ele.data('dataObj'),
                    config = dataObj.config;

                /**
                 * In `Gantt` chart, milestones are an important part of the chart as they allow you to visually
                 * depict any crucial dates on the chart.
                 * This event is fired when the pointer moves over a milestone
                 *
                 * This event is only applicable to Gantt chart.
                 *
                 * @event FusionCharts#milestoneRollOver
                 *
                 * @param {string} date - The date of the milestone.
                 * @param {string} numSides - The number of sides of the milestone.
                 * @param {string} radius - The radius of the milestone.
                 * @param {string} taskId - The id of the task to which this milestone relates to.
                 * @param {string} toolText - The tooltext that is displayed when hovered over the milestone
                 * @param {number} chartX - x-coordinate of the pointer relative to the chart.
                 * @param {number} chartY - y-coordinate of the pointer relative to the chart.
                 * @param {number} pageX - x-coordinate of the pointer relative to the page.
                 * @param {number} pageY - y-coordinate of the pointer relative to the page.
                 * @see FusionCharts#event:milestoneClick
                 * @see FusionCharts#event:milestoneRollOut
                 */
                plotEventHandler.call(ele, chart, event, 'MilestoneRollOver');

                config.showHoverEffect && dataObj.graphics.element.attr({
                    fill: config.hoverFillColor,
                    stroke: config.hoverBorderColor,
                    'fill-opacity': config.hoverFillAlpha,
                    'stroke-opacity': config.hoverBorderAlpha
                });
            };

        },
        rollOutHandler: function (chart) {
            return function (event) {
                var ele = this,
                    dataObj = ele.data('dataObj'),
                    config = dataObj.config;

                /**
                 * In `Gantt` chart, milestones are an important part of the chart as they allow you to visually
                 * depict any crucial dates on the chart.
                 * This event is fired when the pointer moves out of a milestone
                 *
                 * This event is only applicable to Gantt chart.
                 *
                 * @event FusionCharts#milestoneRollOut
                 *
                 * @param {string} date - The date of the milestone.
                 * @param {string} numSides - The number of sides of the milestone.
                 * @param {string} radius - The radius of the milestone.
                 * @param {string} taskId - The id of the task to which this milestone relates to.
                 * @param {string} toolText - The tooltext that is displayed when hovered over the milestone
                 * @param {number} chartX - x-coordinate of the pointer relative to the chart.
                 * @param {number} chartY - y-coordinate of the pointer relative to the chart.
                 * @param {number} pageX - x-coordinate of the pointer relative to the page.
                 * @param {number} pageY - y-coordinate of the pointer relative to the page.
                 * @see FusionCharts#event:milestoneClick
                 * @see FusionCharts#event:milestoneRollOver
                 */
                plotEventHandler.call(ele, chart, event, 'MilestoneRollOut');

                config.showHoverEffect && dataObj.graphics.element.attr({
                    fill: config.fillColor,
                    stroke: config.borderColor,
                    'fill-opacity': config.fillAlpha,
                    'stroke-opacity': config.borderAlpha
                });
            };
        }
    }, 'Task', {

        // configurations with defult values
        showpercentlabel: 0,
        showstartdate: 0,
        showenddate: 0,
        showlabels: undefined,
        showborder: 1,
        borderthickness: 1,
        showHoverEffect: 1,
        slackFillColor: 'FF5E5E',
        // inherated from parent
        font: '',
        fontcolor: '',
        fontsize: '',
        color: '',
        alpha: '100', // not found
        bordercolor: '',// not found
        borderalpha: '100', // not found
        hoverFillColor: '',// not found
        hoverFillAlpha: '100', // not found
        slackHoverFillColor: 10, // not found
        slackHoverFillAlpha: '100' // notfound

    }]);

    FusionCharts.register('component', ['dataset', 'Connectors',{
        configure: function () {
            var dataSet = this,
                config = dataSet.config,
                jsonData = dataSet.JSONData,
                chart = dataSet.chart,
                userConfig = extend2({}, jsonData);

            dataSet.__setDefaultConfig();
            parseConfiguration(userConfig, config, {connector: true});
            dataSet.yAxis = chart.components.yAxis[0];
            dataSet._setConfigure();
        },

        _setConfigure: function (newDataset) {
            var dataset = this,
                datasetConfig = dataset.config,
                chart = dataset.chart,
                JSONData = dataset.JSONData,
                setDataArr = newDataset || JSONData.connector,
                setDataLen = (setDataArr && setDataArr.length) || 0,
                colorM = chart.components.colorManager,
                chartConfig = chart.get('config'),
                dataStore = dataset.components.data,
                i,
                dataObj,
                setData,
                config,
                cnColor,
                cnAlpha,
                cnThickness,
                cnIsDashed;
            if (!dataStore) {
                dataStore = dataset.components.data = [];
            }
            // Connectors
            for (i = 0; i < setDataLen; i += 1) {
                setData = setDataArr[i];
                dataObj = dataStore[i];
                if (!dataObj) {
                    dataObj = dataStore[i] = {
                        config : {}
                    };
                }
                !dataObj.config && (dataObj.config = {});
                config = dataObj.config;
                // Extract the attributes
                cnColor = pluck (setData.color, datasetConfig.color, colorM.getColor ('plotBorderColor'));
                cnAlpha = pluckNumber (setData.alpha, datasetConfig.alpha, 100);
                cnThickness = pluckNumber (setData.thickness, datasetConfig.thickness, 1);
                cnIsDashed = pluckNumber (setData.isdashed, datasetConfig.isdashed, 1);

                config.fromTaskId = getFirstValue (setData.fromtaskid, BLANK).toLowerCase ();
                config.toTaskId = getFirstValue (setData.totaskid, BLANK).toLowerCase (),
                config.fromTaskConnectStart = pluckNumber (setData.fromtaskconnectstart, 0),
                config.toTaskConnectStart = pluckNumber (setData.totaskconnectstart, 1),
                config.color = convertColor (cnColor);
                config.alpha = cnAlpha * 0.01;
                config.link = setData.link;

                config.showHoverEffect = pluckNumber (setData.showhovereffect,
                    datasetConfig.showhovereffect, chartConfig.showconnectorhovereffect, 1);

                config.hoverColor = convertColor (pluck (setData.hovercolor,
                    datasetConfig.hovercolor, chartConfig.connectorhovercolor,
                    getDarkColor (cnColor, 80)),
                    pluckNumber (setData.hoveralpha,
                    datasetConfig.hoveralpha, chartConfig.connectorhoveralpha, cnAlpha));

                config.hoverThickness = pluckNumber (setData.hoverthickness,
                    datasetConfig.hoverthickness, chartConfig.connectorhoverthickness,
                        cnThickness);

                config.thickness = cnThickness;

                config.dashedStyle = cnIsDashed ?
                    getDashStyle (pluckNumber (setData.dashlen,
                    datasetConfig.dashlen, 5),
                    pluckNumber (setData.dashgap, datasetConfig.dashgap,
                    cnThickness), cnThickness) : DASH_DEF;
            }
            dataset.visible = pluckNumber(JSONData.visible, 1);
        },

        draw: function () {
            var dataset = this,
                chart = dataset.chart,
                chartComponents = chart.components,
                dataStore = dataset.components.data,
                paper = chartComponents.paper,
                chartConfig = chart.config,
                ln = dataStore.length,
                taskMap = chartComponents.tasksMap,
                cExt = chartConfig.connectorextension,
                parentContainer = chart.graphics.parentConnectorsGroup,
                container = dataset.graphics.container,
                pool = dataset.components.pool || [],
                visible = dataset.visible,
                animationObj = chart.get('config', 'animationObj'),
                animationDuration = animationObj.duration,
                dummyAnimElem = animationObj.dummyObj,
                dummyAnimObj = animationObj.animObj,
                animType = animationObj.animType,
                removeDataArr = dataset.components.removeDataArr || [],
                removeDataArrLen = removeDataArr.length,
                startTaskId,
                endTaskId,
                stTObj,
                endTObj,
                dataObj,
                graphics,
                isStraightLine,
                stY,
                etY,
                stx1,
                stx2,
                etx1,
                etx2,
                diff,
                cnCase,
                config,
                stTConfig,
                endTConfig,
                opacity,
                cPath,
                tH,
                connector,
                initialAnimDuration,
                eventArgs,
                applyFn,
                trackerElement,
                dashLength,
                dashGap,
                connectorAnimation,
                i;
            if (!container) {
                container = dataset.graphics.container = paper.group('connectors', parentContainer);
                if (!visible) {
                    container.hide();
                }
                else {
                    container.show();
                }
            }
            //Iterate through each and draw it
            for (i = 0; i <= ln; i += 1) {
                dataObj = dataStore[i];
                if (!dataObj) {
                    continue;
                }
                config = dataObj.config;
                !dataObj.graphics && (dataObj.graphics = {});
                graphics = dataObj.graphics;
                startTaskId = config.fromTaskId && config.fromTaskId.toLowerCase();
                endTaskId = config.toTaskId && config.toTaskId.toLowerCase();
                stTObj = taskMap[startTaskId];
                endTObj = taskMap[endTaskId];
                connector = graphics.connector;
                //If the connector's from and to Id are defined, only then we draw the connector
                if (stTObj && endTObj) {
                    stTConfig = stTObj.config;
                    endTConfig = endTObj.config;
                    //Y Positions
                    stY = stTConfig.yPos + (stTConfig.height * 0.5);
                    etY = endTConfig.yPos + (endTConfig.height * 0.5);
                    //Check if the to and from bars are in straight line
                    isStraightLine = (stY == etY);
                    //Dash properties
                    dashLength = 3;
                    dashGap = config.isDashed ? (config.thickness + 2) : 0;
                    //X Positions
                    stx1 = stTConfig.xPos;
                    stx2 = stTConfig.xPos + stTConfig.width;
                    etx1 = endTConfig.xPos;
                    etx2 = endTConfig.xPos + endTConfig.width;
                    if (checkInvalidValue(stx1, stx2, etx1, etx2) === false) {
                        continue;
                    }
                    diff = 0;
                    //There can be four cases if the two tasks are not in straight line
                    cnCase = 0;
                    //cnCase 1: End of StartTask to Start of EndTask
                    if (config.fromTaskConnectStart === 0 && config.toTaskConnectStart === 1) {
                        cnCase = 1;
                    }
                    //cnCase 2: End of StartTask to End of EndTask
                    if (config.fromTaskConnectStart === 0 && config.toTaskConnectStart === 0) {
                        cnCase = 2;
                    }
                    //cnCase 3: Start of StartTask to Start of EndTask
                    if (config.fromTaskConnectStart === 1 && config.toTaskConnectStart === 1) {
                        cnCase = 3;
                    }
                    //cnCase 4: Start of StartTask to End of EndTask
                    if (config.fromTaskConnectStart === 1 && config.toTaskConnectStart === 0) {
                        cnCase = 4;
                    }


                    if (isStraightLine) {
                        tH = stTConfig.height;
                        switch (cnCase) {
                            case 1 :
                                diff = (etx1 - stx2) / 10;
                                cPath = [M, stx2, stY, stx2 + diff, stY,
                                    L, stx2 + diff, stY, stx2 + diff, stY - tH,
                                    L, stx2 + diff, stY - tH, etx1 - diff, stY - tH,
                                    L, etx1 - diff, stY - tH, etx1 - diff, stY,
                                    L, etx1 - diff, stY, etx1, etY];
                                break;
                            case 2 :
                                cPath = [M, stx2, stY, stx2 + cExt, stY,
                                    L, stx2 + cExt, stY, stx2 + cExt, stY - tH,
                                    L, stx2 + cExt, stY - tH, etx2 + cExt, stY - tH,
                                    L, etx2 + cExt, etY - tH, etx2 + cExt, etY,
                                    etx2, etY];
                                break;
                            case 3 :
                                cPath = [M, stx1, stY, stx1 - cExt, stY,
                                    L, stx1 - cExt, stY, stx1 - cExt, stY - tH,
                                    L, stx1 - cExt, stY - tH, etx1 - cExt, stY - tH,
                                    L, etx1 - cExt, stY - tH, etx1 - cExt, stY,
                                    L, etx1 - cExt, stY, etx1, stY];

                                break;
                            case 4 :
                                cPath = [M, stx1, stY, stx1 - cExt, stY,
                                    L, stx1 - cExt, stY, stx1 - cExt, stY - tH,
                                    L, stx1 - cExt, stY - tH, etx2 + cExt, stY - tH,
                                    L, etx2 + cExt, stY - tH, etx2 + cExt, stY,
                                    L, etx2 + cExt, stY, etx2, stY];
                                break;
                        }
                    } else {
                        switch (cnCase) {
                            case 1 :
                                cPath = [M, stx2, stY, stx2 + (etx1 - stx2) / 2, stY,
                                   L, stx2 + (etx1 - stx2) / 2, stY, stx2 + (etx1 - stx2) / 2, etY,
                                   L, stx2 + (etx1 - stx2) / 2, etY, etx1, etY];

                                if (stx2 <= etx1) {
                                    cPath = [M, stx2, stY, stx2 + (etx1 - stx2) / 2, stY,
                                        L, stx2 + (etx1 - stx2) / 2, stY, stx2 + (etx1 - stx2) / 2, etY,
                                        L, stx2 + (etx1 - stx2) / 2, etY, etx1, etY];
                                } else {
                                    cPath = [M, stx2, stY, stx2 + cExt, stY,
                                        L, stx2 + cExt, stY, stx2 + cExt, stY + (etY - stY) / 2,
                                        L, stx2 + cExt, stY + (etY - stY) / 2, etx1 - cExt, stY + (etY - stY) / 2,
                                        L, etx1 - cExt, stY + (etY - stY) / 2, etx1 - cExt, etY,
                                        L, etx1 - cExt, etY, etx1, etY];
                                }
                                break;
                            case 2 :
                                diff = ((etx2 - stx2) < 0) ? (0) : (etx2 - stx2);
                                cPath = [M, stx2, stY, stx2 + cExt + diff, stY,
                                    L, stx2 + cExt + diff, stY, stx2 + cExt + diff, etY,
                                    L, stx2 + cExt + diff, etY, etx2, etY];
                                break;
                            case 3 :
                                diff = ((stx1 - etx1) < 0) ? (0) : (stx1 - etx1);
                                cPath = [M, stx1, stY, stx1 - cExt - diff, stY,
                                    L, stx1 - cExt - diff, stY, stx1 - cExt - diff, etY,
                                    L, stx1 - cExt - diff, etY, etx1, etY];
                                break;
                            case 4 :
                                if (stx1 > etx2) {
                                    cPath = [M, stx1, stY, stx1 - (stx1 - etx2) / 2, stY,
                                        L, stx1 - (stx1 - etx2) / 2, stY, stx1 - (stx1 - etx2) / 2, etY,
                                        L, stx1 - (stx1 - etx2) / 2, etY, etx2, etY];
                                } else {
                                    cPath = [M, stx1, stY, stx1 - cExt, stY,
                                        L, stx1 - cExt, stY, stx1 - cExt, stY + (etY - stY) / 2,
                                        L, stx1 - cExt, stY + (etY - stY) / 2, etx2 + cExt, stY + (etY - stY) / 2,
                                        L, etx2 + cExt, stY + (etY - stY) / 2, etx2 + cExt, etY,
                                        L, etx2 + cExt, etY, etx2, etY];
                                }
                                break;
                        }
                    }
                    if (!connector) {
                        if (pool.connector && pool.connector.length) {
                            connector = graphics.connector = pool.connector.shift();
                        }
                        else {
                            connector = graphics.connector = paper.path(container);
                        }
                        if (animationDuration) {
                            // clip-canvas animation to line chart
                            connectorAnimation = R.animation ( {
                                'stroke-opacity': config.alpha
                            },
                            animationDuration, animType);
                            applyFn = ATTRFN;
                            opacity = 0;
                            initialAnimDuration = animationDuration;
                        }
                        else {
                            applyFn = ATTRFN;
                            opacity = config.alpha;
                        }
                    }

                    connector.show().animateWith(dummyAnimElem, dummyAnimObj, {
                        path: cPath
                    }, animationDuration, animType)
                    .attr({
                        stroke: config.color,
                        'stroke-opacity': opacity,
                        'stroke-width': config.thickness,
                        'stroke-dasharray': config.dashedStyle
                    });

                    if (connectorAnimation) {
                        connector.animate(connectorAnimation.delay(initialAnimDuration || 0));
                    }

                    eventArgs = {
                        fromTaskId: config.fromTaskId,
                        toTaskId: config.toTaskId,
                        fromTaskConnectStart: config.fromTaskConnectStart,
                        toTaskConnectStart: config.toTaskConnectStart,
                        link: config.link,
                        sourceType: 'connector'
                    };

                    trackerElement = graphics.tracker;
                    if (!trackerElement) {
                        if (pool.tracker && pool.tracker.length) {
                            trackerElement = graphics.tracker = pool.tracker.shift();
                        }
                        else {
                            trackerElement = graphics.tracker = paper.path (container)
                                .click (dataset.connectorClick(chart))
                                .hover (dataset.rollOverHandler(chart), dataset.rollOutHandler(chart));
                        }
                    }
                    trackerElement.attr ({
                        path: cPath,
                        stroke: TRACKER_FILL,
                        'stroke-width': mathMax (config.thickness, 10),
                        ishot: true,
                        cursor: config.link ? 'pointer' : BLANK
                    })
                    .data ('dataObj', dataObj)
                    .data ('eventArgs', eventArgs);
                }
                else {
                    if (connector) {
                        connector.hide();
                    }
                }
            }
            for (i = 0; i < removeDataArrLen; i++) {
                dataset._removeDataVisuals(removeDataArr.shift());
            }
        },

        connectorClick: function (chart) {

            return function (e) {
                var ele = this;
                plotEventHandler.call(ele, chart, e, 'ConnectorClick');
            };

        },

        rollOverHandler: function (chart) {

            return function (event) {
                var ele = this,
                    data = ele.data('dataObj'),
                    config = data.config,
                    chartComponents = chart.components,
                    taskMap = chartComponents.tasksMap,
                    stTObj = taskMap[config.fromTaskId],
                    endTObj = taskMap[config.toTaskId],
                    attr = {
                        stroke: config.hoverColor,
                        'stroke-dasharray': config.dashedStyle,
                        'stroke-width': config.hoverThickness
                    },
                    connector = data.graphics.connector;

                plotEventHandler.call(ele, chart, event, 'ConnectorRollOver');
                if (config.showHoverEffect) {
                    each([stTObj, endTObj], function (obj) {
                        var attrib = {
                                fill: obj.config.hoverFillColor,
                                stroke: obj.config.hoverBorderColor
                            },
                            percentComplete = obj.config.percentComplete,
                            slackGraphic = obj.graphics.slackElem,
                            element = obj.graphics.element,
                            // Percent complete graphic is task fill
                            percentCompleteGraphic = obj.graphics.taskFill;
                        if (percentComplete &&
                                !obj.config.showAsGroup) {
                            slackGraphic && slackGraphic.attr({
                                fill: obj.config.slackHoverColor
                            });
                            percentCompleteGraphic && percentCompleteGraphic.attr({
                                fill: obj.config.hoverFillColor,
                                stroke: obj.config.hoverBorderColor
                            });
                            delete attrib.fill;
                        }
                        element && element.attr(attrib);
                    });
                    connector && connector.attr(attr);
                }
            };

        },

        rollOutHandler: function (chart) {

            return function (event) {
                var ele = this,
                    data = ele.data('dataObj'),
                    config = data.config,
                    chartComponents = chart.components,
                    taskMap = chartComponents.tasksMap,
                    stTObj = taskMap[config.fromTaskId],
                    endTObj = taskMap[config.toTaskId],
                    attr = {
                        stroke: config.color,
                        'stroke-width': config.thickness,
                        'stroke-dasharray': config.dashedStyle
                    },
                    connector = data.graphics.connector;

                plotEventHandler.call(ele, chart, event, 'ConnectorRollOut');

                if (config.showHoverEffect) {
                    each([stTObj, endTObj], function (obj) {
                        var attrib = {
                            fill: obj.config.color,
                            stroke: obj.config.borderColor,
                            'stroke-width': obj.config.borderThickness,
                            'stroke-dasharray': obj.config.dashedStyle
                        },
                        percentComplete = obj.config.percentComplete,
                        slackGraphic = obj.graphics.slackElem,
                        element = obj.graphics.element,
                        percentCompleteGraphic = obj.graphics.taskFill;
                        if (percentComplete &&
                                !obj.config.showAsGroup) {
                            slackGraphic && slackGraphic.attr({
                                fill: obj.config.slackColor
                            });
                            percentCompleteGraphic && percentCompleteGraphic.attr({
                                fill: obj.config.color
                            });
                            delete attrib.fill;
                        }
                        element && element.attr(attrib);
                    });
                    connector && connector.attr(attr);
                }
            };

        }
    }, 'Task', {
        isdashed: 1,
        thickness: 1
    }]);

    FusionCharts.get ('component', ['axis', 'ganttCommon', {
        _drawPlotLine : function () {
            var axis = this,
                axisConfig = axis.config,
                chart = axis.chart,
                chartComponents = chart.components,
                canvas = axisConfig.canvas,
                chartConfig = chart.config,
                axisPlotLineContainerBottom = axisConfig.ganttPlotLineContainer,
                canvasBottom = canvas.canvasBottom || chartConfig.canvasBottom,
                canvasLeft = canvas.canvasLeft || chartConfig.canvasLeft,
                canvasRight = canvas.canvasRight || chartConfig.canvasRight,
                canvasTop = canvas.canvasTop || chartConfig.canvasTop,
                paper = chartComponents.paper,
                gridArr = axisConfig.gridArr,
                plotLine = axis.graphics.line || [],
                animateAxis = axisConfig.animateAxis,
                animationDuration,
                transposeAnimDuration,
                lineStyle,
                lineElement,
                counter = 0,
                i,
                ln,
                path = [],
                animObj,
                dummyObj,
                animType;

            animationDuration = chart.get('config', 'animationObj');
            animObj = animationDuration.animObj;
            dummyObj = animationDuration.dummyObj;
            transposeAnimDuration = animationDuration.transposeAnimDuration;
            animType = animationDuration.animType;
            lineStyle = {
                'stroke-dasharray': axisConfig.plotLineDashStyle,
                'stroke-width': axisConfig.plotLineThickness,
                stroke: axisConfig.plotLineColor
            };
            for (i = 0, ln = gridArr.length; i < ln; i += 1) {
                if (gridArr[i].x !== undefined) {
                    path.push('M',gridArr[i].x,canvasTop,'L', gridArr[i].x, canvasBottom);
                } else {
                    path.push('M',canvasLeft,gridArr[i].y,'L', canvasRight, gridArr[i].y);
                }
            }
            if (plotLine[counter]) {
                lineElement = plotLine[counter].graphics;
                if (transposeAnimDuration && animateAxis) {
                    lineElement.animateWith(dummyObj, animObj, {path : path}, transposeAnimDuration, animType);
                } else {
                    lineElement.attr({path : path});
                }
                lineElement.attr(lineStyle);
            } else {
                lineElement = paper.path(path, axisPlotLineContainerBottom);
                lineElement.attr(lineStyle);
                plotLine[counter] = {};
                plotLine[counter].graphics = lineElement;
            }
            counter += 1;
            for (i = counter, ln = plotLine.length; i < ln; i += 1) {
                plotLine[i].graphics.attr({
                    path : 'M0,0'
                });
            }
            axis.graphics.line = plotLine;
        },
        _drawPlotBand : function () {

        },
        translateAxis : function (x, y) {
            var axis = this,
                axisConfig = axis.config,
                isVertical = axisConfig.isVertical,
                lastTranslate = axisConfig.lastTranslate || (axisConfig.lastTranslate = {x : 0, y : 0}),
                ganttPlotHoverBandContainer = axisConfig.ganttPlotHoverBandContainer,
                dx,
                dy;

            dx = x !== undefined ? x - lastTranslate.x : 0;
            dy = y !== undefined ? y - lastTranslate.y : 0;
            lastTranslate.x = x !== undefined ? x : lastTranslate.x;
            lastTranslate.y = y !== undefined ? y : lastTranslate.y;

            axisConfig.labelContainer && axisConfig.labelContainer.translate(dx,dy);
            axisConfig.hotContainer && axisConfig.hotContainer.translate(dx,dy);
            axisConfig.headerContainer && axisConfig.headerContainer.translate(dx,0);
            if (isVertical) {
                axisConfig.ganttPlotLineContainer && axisConfig.ganttPlotLineContainer.translate(0,dy);
                ganttPlotHoverBandContainer && ganttPlotHoverBandContainer.translate(0,dy);
            } else {
                axisConfig.ganttPlotLineContainer && axisConfig.ganttPlotLineContainer.translate(dx,0);
                ganttPlotHoverBandContainer && ganttPlotHoverBandContainer.translate(dx,0);
                axis.setAxisConfig({
                    animateAxis : false
                });
                axisConfig.drawTrendLines && axis._drawTrendLine();
                axis.setAxisConfig({
                    animateAxis : true
                });
            }
        },
        resetTransletAxis : function () {
            var axis = this,
                axisConfig = axis.config,
                transformAttr;

            transformAttr = {
                transform : 't0,0'
            };
            axisConfig.lastTranslate = {x : 0, y : 0};
            axisConfig.labelContainer && axisConfig.labelContainer.attr(transformAttr);
            axisConfig.headerContainer && axisConfig.headerContainer.attr(transformAttr);
            axisConfig.ganttPlotLineContainer && axisConfig.ganttPlotLineContainer.attr(transformAttr);
            axisConfig.ganttPlotHoverBandContainer && axisConfig.ganttPlotHoverBandContainer.attr(transformAttr);
            axisConfig.hotContainer && axisConfig.hotContainer.attr(transformAttr);
        },
        _drawProcessAndDataTableStyleParser : function (attrs) {
            var axis = this,
                axisConfig = axis.config,
                chart = axis.chart,
                smartLabel = chart.linkedItems.smartLabel,
                components = chart.components,
                colorM = components.colorManager,
                labels = axisConfig.labels,
                style = labels.style,
                elem = attrs.elem || {},
                dimension = attrs.dimension,
                textStyle = elem._attrib || {},
                left = dimension.left,
                right = dimension.right,
                top = dimension.top,
                bottom = dimension.bottom,
                processPadding = 2,
                fontFamily,
                fontSize,
                fontWeight,
                fontStyle,
                bgColor,
                xPos,
                yPos,
                text,
                retAttrib,
                smartText,
                vAlign,
                align,
                color,
                textDecoration,
                hoverC,
                hoverA,
                useHover,
                usePlotHover,
                rollOverColor,
                link,
                lHeight;

            switch (attrs.type) {
                case 'category' :
                case 'datatable' :
                case 'process' :
                    fontFamily = pluck(textStyle.font, style.fontFamily);
                    fontSize = pluck(textStyle.fontsize, style.fontSize).replace(/px/i, '') + PXSTRING;
                    fontStyle = pluck((Number(textStyle.isitalic) ? 'italic' : undefined), style.fontStyle);
                    bgColor = convertColor(pluck (textStyle.bgcolor ? getFirstColor(textStyle.bgcolor) : undefined ,
                        colorM.getColor ('categoryBgColor')), pluckNumber(textStyle.bgalpha, 100));
                    color = pluck(textStyle.fontcolor ? getFirstColor(textStyle.fontcolor) : undefined, style.color),
                    textDecoration = pluckNumber (textStyle.isunderline, 0) && UND_LINE || NONE;
                    vAlign = (pluck(textStyle.valign, 'center')).toLowerCase();
                    align = (pluck(textStyle.align, 'middle')).toLowerCase();
                    text = elem.drawLabel || '';
                    fontWeight = pluck((Number(textStyle.isbold) ? 'bold' : undefined), style.fontWeight);
                    link = elem.link;
                    break;
                case 'header' :
                    fontFamily = pluck(textStyle.headerfont, style.fontFamily);
                    fontSize = pluck(textStyle.headerfontsize, style.fontSize).replace(/px/i, '') + PXSTRING;
                    fontWeight = pluck((Number(textStyle.headerisbold) === 1 ? 'bold' : textStyle.headerisbold ===
                        undefined ? 'bold' : undefined), style.fontWeight);
                    color = pluck (textStyle.headerfontcolor ? getFirstColor(textStyle.headerfontcolor) :
                        undefined, style.color),
                    textDecoration = pluckNumber (textStyle.headerisunderline, 0) && UND_LINE || NONE;
                    fontStyle = pluck((textStyle.headerisitalic ? 'italic' : undefined), style.fontStyle);
                    bgColor = convertColor(pluck (textStyle.headerbgcolor ? getFirstColor(textStyle.headerbgcolor)
                        : undefined , colorM.getColor ('categoryBgColor')), pluckNumber(textStyle.headerbgalpha, 100));
                    vAlign = (pluck(textStyle.headervalign, 'center')).toLowerCase();
                    align = (pluck(textStyle.headeralign, 'middle')).toLowerCase();
                    text = elem.drawLabel || '';
                    link = elem.headerlink;
                    break;
            }
            switch (attrs.type) {
                case 'category' :
                    axisConfig.gridLinePath += 'M'+left+','+top+'L'+left+','+bottom+'L'+right+','+bottom;
                    fontWeight = pluck((Number(textStyle.isbold) === 1 ? 'bold' : textStyle.isbold === undefined ?
                        'bold' : undefined), style.fontWeight);
                    break;
                case 'datatable' :
                case 'process' :
                    axisConfig.gridLinePath += 'M'+left+','+bottom+'L'+right+','+bottom+'L'+right+','+top;
                    break;
                case 'header' :
                    axisConfig.gridLineHeaderPath += 'M'+left+','+bottom+'L'+right+','+bottom+'L'+right+','+top;
                    break;
            }
            hoverC = pluck (elem._attrib.hoverbandcolor, axisConfig.hoverColor);
            hoverA = pluckNumber (elem._attrib.hoverbandalpha, axisConfig.hoverAlpha);
            if (align === 'left') {
                xPos = left + processPadding;
                align = 'start';
            } else if (align === 'right') {
                xPos = left + (right - left) - processPadding;
                align = 'end';
            } else {
                align = 'middle';
                xPos = left + (right - left)/2;
            }
            if (vAlign === 'top') {
                yPos = top - processPadding;
            } else if (vAlign === 'bottom') {
                yPos = top + (bottom - top) - processPadding;
            } else {
                vAlign = 'center';
                yPos = top + (bottom - top)/2;
            }
            style = {
                fontFamily: fontFamily,
                fontSize: fontSize,
                fontWeight: fontWeight,
                fontStyle: fontStyle,
                textDecoration : textDecoration
            };
            lHeight = setLineHeight(style);
            lHeight = Number((lHeight.replace(/px/i, '')));
            lHeight = bottom - top > lHeight ? bottom - top : lHeight;
            smartLabel.useEllipsesOnOverflow(chart.config.useEllipsesWhenOverflow);
            smartLabel.setStyle (style);
            smartText = smartLabel.getSmartText (text, right - left, lHeight);
            retAttrib = {
                    textAttr : {
                        x : xPos,
                        y : yPos,
                        text : smartText.text,
                        fill: color,
                        'text-anchor' : align,
                        'vertical-align' : vAlign,
                        cursor : link ? 'pointer' : 'default'
                    },
                    css : style,
                    rectAttr : {
                        x : left,
                        y : top,
                        width : left < right ? right - left : 0,
                        height : top < bottom ? bottom - top : 0,
                        fill: bgColor,
                        'stroke-width' : 0,
                        cursor : link ? 'pointer' : 'default'
                    },
                    eventArgs : {
                        isHeader: attrs.type === 'header',
                        label: text,
                        vAlign: vAlign,
                        align: align,
                        link: link,
                        id: elem.id
                    },
                    tooltext : smartText.oriText
                };
            if (attrs.type === 'datatable' || attrs.type === 'process' || attrs.type === 'category') {
                rollOverColor = convertColor (hoverC, hoverA);
                useHover = pluckNumber(elem._attrib.showhoverband, axisConfig.useHover);
                usePlotHover = pluckNumber(elem._attrib.showganttpanehoverband, axisConfig.usePlotHover, useHover);
                retAttrib.dataArgs = {
                    rollOverColor: rollOverColor,
                    useHover: useHover,
                    usePlotHover: usePlotHover,
                    dimension: dimension,
                    hoverEle: elem,
                    type : attrs.type,
                    pos : attrs.pos,
                    axis : axis,
                    groupId : attrs.elemIndex
                };
            } else {
                retAttrib.dataArgs = {
                    rollOverColor: undefined,
                    useHover: 0,
                    usePlotHover: 0,
                    dimension: dimension,
                    hoverEle: elem,
                    type : attrs.type,
                    pos : attrs.pos,
                    axis : axis,
                    groupId : attrs.elemIndex
                };
            }
            return retAttrib;
        },
        _drawProcessAndDataTableElement : function(attrs) {
            var axis = this,
                axisConfig = axis.config,
                chart = axis.chart,
                chartComponents = chart.components,
                categoryElement = axis.components.categoryElement || [],
                hoverElemsArr = axisConfig.hoverElemsArr || (axisConfig.hoverElemsArr = []),
                paper = chartComponents.paper,
                elemIndex = attrs.elemIndex,
                labelHoverEventName = axisConfig.labelHoverEventName,
                animateAxis = axisConfig.animateAxis,
                animationDuration,
                transposeAnimDuration,
                attribs,
                labelBackContainer,
                labelLineContainer,
                labelTextContainer,
                rectElement,
                textElement,
                animObj,
                dummyObj,
                showTooltip = chart.config.showtooltip,
                animType,

                labelClickHandler = function (e) {
                    var ele = this;
                    /**
                     * In `Gantt` chart, category element distributes the time line into visual divisions
                     * This event is fired when a category is clicked.
                     *
                     * This event is only applicable to Gantt chart.
                     *
                     * @event FusionCharts#categoryClick
                     *
                     * @param { string } align - The alignment of the category label.
                     * @param { string } vAlign - The vertical alignment of the category label.
                     * @param { number } chartX - x-coordinate of the pointer relative to the chart.
                     * @param { number } chartY - y-coordinate of the pointer relative to the chart.
                     * @param { number } pageX - x-coordinate of the pointer relative to the page.
                     * @param { number } pageY - y-coordinate of the pointer relative to the page.
                     * @param { string } link - URL set for the category on mouse click.
                     * @param { string } text - The label in the category
                     * @see FusionCharts#event:categoryRollOver
                     * @see FusionCharts#event:categoryRollOut
                     */
                    plotEventHandler.call (ele, chart, e, labelHoverEventName.click);
                },
                labelRollOver = function (e) {
                    var ele = this;
                    hoverTimeout = clearTimeout (hoverTimeout);
                    if (!lastHoverEle || lastHoverEle.removed) {
                        lastHoverEle = null;
                    }
                    lastHoverEle && axis._gridOutHandler.call (lastHoverEle);
                    axis._gridHoverHandler.call (ele);
                    /**
                     * In `Gantt` chart, category element distributes the time line into visual divisions
                     * This event is fired when the pointer moves over a category.
                     *
                     * This event is only applicable to Gantt chart.
                     *
                     * @event FusionCharts#categoryRollOver
                     *
                     * @param { string } align - The alignment of the category label.
                     * @param { string } vAlign - The vertical alignment of the category label.
                     * @param { number } chartX - x-coordinate of the pointer relative to the chart.
                     * @param { number } chartY - y-coordinate of the pointer relative to the chart.
                     * @param { number } pageX - x-coordinate of the pointer relative to the page.
                     * @param { number } pageY - y-coordinate of the pointer relative to the page.
                     * @param { string } link - URL set for the category on mouse click.
                     * @param { string } text - The label in the category
                     * @see FusionCharts#event:categoryClick
                     * @see FusionCharts#event:categoryRollOut
                     */

                    plotEventHandler.call (ele, chart, e, labelHoverEventName.rollOver);
                },
                labelRollOut = function (e) {
                    lastHoverEle = this;
                    hoverTimeout = clearTimeout (hoverTimeout);
                    hoverTimeout = setTimeout (function () {
                        axis._gridOutHandler.call (lastHoverEle);
                    }, 500);
                    /**
                     * In `Gantt` chart, category element distributes the time line into visual divisions
                     * This event is fired when the pointer moves out of a category.
                     *
                     * This event is only applicable to Gantt chart.
                     *
                     * @event FusionCharts#categoryRollOut
                     *
                     * @param { string } align - The alignment of the category label.
                     * @param { string } vAlign - The vertical alignment of the category label.
                     * @param { number } chartX - x-coordinate of the pointer relative to the chart.
                     * @param { number } chartY - y-coordinate of the pointer relative to the chart.
                     * @param { number } pageX - x-coordinate of the pointer relative to the page.
                     * @param { number } pageY - y-coordinate of the pointer relative to the page.
                     * @param { string } link - URL set for the category on mouse click.
                     * @param { string } text - The label in the category
                     * @see FusionCharts#event:categoryClick
                     * @see FusionCharts#event:categoryRollOver
                     */
                    plotEventHandler.call (lastHoverEle, chart, e, labelHoverEventName.rollOut);
                };

            animationDuration = chart.get('config', 'animationObj');
            animObj = animationDuration.animObj;
            dummyObj = animationDuration.dummyObj;
            transposeAnimDuration = animationDuration.transposeAnimDuration;
            animType = animationDuration.animType;
            if (attrs.type === 'header') {
                labelBackContainer = axisConfig.headerBackContainer;
                labelLineContainer = axisConfig.headerLineContainer;
                labelTextContainer = axisConfig.headerTextContainer;
            } else {
                labelBackContainer = axisConfig.labelBackContainer;
                labelLineContainer = axisConfig.labelLineContainer;
                labelTextContainer = axisConfig.labelTextContainer;
            }
            attribs = axis._drawProcessAndDataTableStyleParser(attrs);

            if (categoryElement[elemIndex]) {
                textElement = categoryElement[elemIndex].graphics.label;
                rectElement = categoryElement[elemIndex].graphics.rect;
                labelBackContainer.appendChild(rectElement);
                labelTextContainer.appendChild(textElement);
                if (transposeAnimDuration && animateAxis) {
                    rectElement.animateWith(dummyObj, animObj,attribs.rectAttr, transposeAnimDuration, animType);
                    textElement.animateWith(dummyObj, animObj,attribs.textAttr, transposeAnimDuration, animType);
                } else {
                    rectElement.attr(attribs.rectAttr);
                    textElement.attr(attribs.textAttr);
                }
                textElement.css(attribs.css);
            } else {
                rectElement = paper.rect(attribs.rectAttr, labelBackContainer);
                textElement = paper.text(attribs.textAttr, attribs.css, labelTextContainer);
                categoryElement[elemIndex] = {};
                categoryElement[elemIndex].graphics = {};
                categoryElement[elemIndex].config = {};
                categoryElement[elemIndex].graphics.label = textElement;
                categoryElement[elemIndex].graphics.rect = rectElement;
                rectElement.hover (labelRollOver, labelRollOut)
                .click (labelClickHandler);
                textElement
                .hover (labelRollOver, labelRollOut)
                .click (labelClickHandler);
            }
            if (attrs.type !== 'header') {
                if (!hoverElemsArr[attrs.pos]) {
                    hoverElemsArr[attrs.pos] = [];
                }
                hoverElemsArr[attrs.pos].push({
                    bgElem : rectElement,
                    bgColor : attribs.rectAttr.fill
                });
            }
            rectElement
            .data ('dataObj', attrs.elem)
            .data ('eventArgs', attribs.eventArgs)
            .data ('data', attribs.dataArgs);
            textElement
            .data ('dataObj', attrs.elem)
            .data ('eventArgs', attribs.eventArgs)
            .data ('data', attribs.dataArgs)
            .tooltip(attribs.tooltext)
            .trackTooltip(showTooltip ? true : false);

            axis.components.categoryElement = categoryElement;
        },
        _drawGridLine : function () {
            var axis = this,
                axisConfig = axis.config,
                chart = axis.chart,
                chartComponents = chart.components,
                paper = chartComponents.paper,
                gridLine = axis.graphics.gridLine || [],
                animateAxis = axisConfig.animateAxis,
                animationDuration,
                transposeAnimDuration,
                lineStyle,
                lineElement,
                counter = 0,
                i = 0,
                ln = 2,
                path,
                animObj,
                dummyObj,
                container,
                animType;

            animationDuration = chart.get('config', 'animationObj');
            animObj = animationDuration.animObj;
            dummyObj = animationDuration.dummyObj;
            transposeAnimDuration = animationDuration.transposeAnimDuration;
            animType = animationDuration.animType;
            lineStyle = {
                'stroke-dasharray': axisConfig.lineDashStyle,
                'stroke-width': axisConfig.lineThickness,
                stroke: axisConfig.lineColor
            };
            for (; i < ln; i += 1) {
                if (i === 0) {
                    path = axisConfig.gridLinePath;
                    container = axisConfig.labelLineContainer;
                } else {
                    path = axisConfig.gridLineHeaderPath;
                    container = axisConfig.headerLineContainer;
                    if (!path) {
                        continue;
                    }
                }
                if (gridLine[counter]) {
                    lineElement = gridLine[counter].graphics;
                    if (transposeAnimDuration && animateAxis) {
                        lineElement.animateWith(dummyObj, animObj, {path : path}, transposeAnimDuration, animType);
                    } else {
                        lineElement.attr({path : path});
                    }
                    lineElement.attr(lineStyle);
                } else {
                    lineElement = paper.path(path, container);
                    lineElement.attr(lineStyle);
                    gridLine[counter] = {};
                    gridLine[counter].graphics = lineElement;
                }
                counter += 1;
            }
            for (i = counter, ln = gridLine.length; i < ln; i += 1) {
                gridLine[i].graphics.attr({
                    path : 'M0,0'
                });
            }
            axis.graphics.gridLine = gridLine;
        },
        _gridHoverHandler : function () {
            var data = this.data ('data'),
                type = data.type,
                dimension = data.dimension,
                axis = data.axis,
                chart = axis.chart,
                chartConfig = chart.config,
                paper = chart.components.paper,
                axisConfig = axis.config,
                hoverElemsArr = axisConfig.hoverElemsArr || [],
                ganttPlotHoverBandContainer = axisConfig.ganttPlotHoverBandContainer,
                plotHoverElement = axis.graphics.plotHoverElement || (axis.graphics.plotHoverElement = []),
                plotHoverElementAttr,
                i,
                ln;

            if (type === 'category') {
                plotHoverElementAttr = {
                    x : dimension.left,
                    y : chartConfig.canvasTop,
                    width : dimension.left < dimension.right ? (dimension.right - dimension.left) : 0,
                    height : chartConfig.height,
                    fill: data.rollOverColor,
                    'stroke-width' : 0
                };
            } else {
                plotHoverElementAttr = {
                    y : dimension.top,
                    x : chartConfig.canvasLeft,
                    height : dimension.top < dimension.bottom ? (dimension.bottom - dimension.top) : 0,
                    width : chartConfig.width,
                    fill: data.rollOverColor,
                    'stroke-width' : 0
                };
            }
            if (data.usePlotHover) {
                if (plotHoverElement[0]) {
                    plotHoverElement[0].attr(plotHoverElementAttr).show();
                } else {
                    plotHoverElement[0] = paper.rect(plotHoverElementAttr, ganttPlotHoverBandContainer);
                }
            }
            if (data.useHover && hoverElemsArr[data.pos]) {
                for (i = 0, ln = hoverElemsArr[data.pos].length; i < ln; i += 1) {
                    hoverElemsArr[data.pos][i].bgElem.attr({
                        fill : data.rollOverColor
                    });
                }
            }
        },
        _gridOutHandler : function () {
            var data = this.data ('data'),
                axis = data.axis,
                axisConfig = axis.config,
                hoverElemsArr = axisConfig.hoverElemsArr || [],
                plotHoverElement = axis.graphics.plotHoverElement || [],
                i,
                ln,
                hoverOutElem;

            if (data.usePlotHover) {
                if (plotHoverElement[0]) {
                    plotHoverElement[0].hide();
                }
            }
            if (data.useHover && hoverElemsArr[data.pos]) {
                for (i = 0, ln = hoverElemsArr[data.pos].length; i < ln; i += 1) {
                    hoverOutElem = hoverElemsArr[data.pos][i];
                    hoverOutElem.bgElem.attr({
                        fill : hoverOutElem.bgColor
                    });
                }
            }
        },
        _disposeExtraProcessAndDataTableElement : function(index) {
            var axis = this,
                categoryElement = axis.components.categoryElement || [],
                i,
                ln;

            for (i = index, ln = categoryElement.length; i < ln; i += 1) {
                categoryElement[i].graphics.label.attr({
                    text : ''
                });
                categoryElement[i].graphics.rect.attr({
                    x : 0,
                    y : 0,
                    width : 0,
                    heigth : 0
                });
            }
        }
    }, 'cartesian']);

    FusionCharts.get ('component', ['axis', 'time', {
        configure : function () {
            var axis = this,
                axisConfig = axis.config,
                axisAttr = axisConfig.rawAttr,
                chart = axis.chart,
                jsonData = chart.jsonData,
                FCChartObj = jsonData.chart,
                chartComponents = chart.components,
                colorM = chartComponents.colorManager,
                parent = FusionCharts.register('component', ['axis', 'cartesian']);

            parent.prototype.configure.call(this);
            //Gantt grid line properties
            axisConfig.plotLineColor = axisConfig.lineColor = convertColor (pluck (FCChartObj.ganttlinecolor,
                colorM.getColor ('gridColor')), pluckNumber (FCChartObj.ganttlinealpha, 100));
            axisConfig.plotLineThickness = axisConfig.lineThickness = pluckNumber (FCChartObj.ganttlinethickness, 1);
            axisConfig.plotLineDashStyle = axisConfig.lineDashStyle = pluckNumber (FCChartObj.ganttlinedashed, 0) ?
                getDashStyle (pluckNumber (FCChartObj.ganttlinedashlen, 1),
                FCChartObj.ganttlinedashgap, axisConfig.lineThickness) : DASH_DEF;
            axisConfig.hoverColor = pluck (FCChartObj.categoryhoverbandcolor, FCChartObj.hoverbandcolor,
                colorM.getColor ('gridColor'));
            axisConfig.hoverAlpha = pluckNumber (FCChartObj.categoryhoverbandalpha, FCChartObj.hoverbandalpha, 30);
            axisConfig.useHover = pluckNumber (FCChartObj.showcategoryhoverband, FCChartObj.showhoverband,
                FCChartObj.showhovereffect, 1);
            axisConfig.usePlotHover = pluckNumber (FCChartObj.showganttpaneverticalhoverband);
            axisConfig.trendlinesDashLen = pluckNumber(axisAttr.trendlinesDashLen, 3);
            axisConfig.trendlinesDashGap = pluckNumber(axisAttr.trendlinesDashGap, 3);

            axisConfig.gridLineHeaderPath = '';
            axisConfig.gridLinePath = '';
        },
        setCategory : function (categories) {
            var axis = this,
                chart = axis.chart,
                components = chart.get('components'),
                numberFormatter = components.numberFormatter,
                axisConfig = axis.config,
                axisRange = axisConfig.axisRange,
                startPad = axisConfig.startPad || 0,
                endPad = axisConfig.endPad || 0,
                axisLimits,
                catLength,
                categoriesFinal,
                catObj,
                startMS,
                endMS,
                minTime = Infinity,
                maxTime = -Infinity,
                i,
                j;

            // Initialize the category object
            axisConfig.categories = {};
            // Set the category flag to true
            if (categories) {
                axisConfig.hasCategory = 1;
            } else {
                axisConfig.hasCategory = 0;
                return;
            }
            // this will store the category
            categoriesFinal = axisConfig.categories.category = extend2({}, categories);
            axis._extractAttribToEnd(categoriesFinal, {});
            for (i in categoriesFinal) {
                if (!categoriesFinal.hasOwnProperty(i) || i === '_attrib') {
                    continue;
                }
                for (j = 0, catLength = categoriesFinal[i].category.length; j < catLength; j += 1) {
                    catObj = categoriesFinal[i].category[j];
                    startMS = numberFormatter.getDateValue(catObj.start).ms;
                    endMS = numberFormatter.getDateValue(catObj.end).ms;

                    if (isNaN(startMS)) { /** @todo nan check without fn call */
                        startMS = UNDEF;
                    }
                    if (startMS > maxTime) { maxTime = startMS; }
                    if (startMS <= minTime) { minTime = startMS; }

                    if (isNaN(endMS)) { /** @todo nan check without fn call */
                        endMS = UNDEF;
                    }
                    if (endMS > maxTime) { maxTime = endMS; }
                    if (endMS <= minTime) { minTime = endMS; }
                }
            }

            axisLimits = {
                Max : maxTime + endPad,
                Min : minTime - startPad,
                divGap : 1
            };

            axisRange.min = Number(toPrecision(axisLimits.Min,10));
            axisRange.max = Number(toPrecision(axisLimits.Max, 10));
            axisRange.tickInterval = Number(toPrecision(axisLimits.divGap, 10));
        },
        _drawComponents : function () {
            var axis = this,
                axisConfig = axis.config;

            axis._drawCategories();
            axisConfig.drawPlotlines && axis._drawPlotLine();
            axisConfig.drawPlotBand && axis._drawPlotBand();
            axisConfig.drawTrendLines && axis._drawTrendLine();
        },
        _drawCategories : function () {
            var axis = this,
                axisConfig = axis.config,
                axisDimention = axisConfig.axisDimention || {},
                axisStartPosition = axisDimention.y,
                spaceTaken = axisConfig.totalHeight || 0,
                chart = axis.chart,
                chartComponents = chart.components,
                chartConfig = chart.config,
                viewPortConfig = chartConfig.viewPortConfig,
                paper = chartComponents.paper,
                numberFormatter = chartComponents.numberFormatter,
                canvas = axisConfig.canvas,
                gridArr = axisConfig.gridArr || (axisConfig.gridArr = []),
                canvasLeft = canvas.canvasLeft || chartConfig.canvasLeft,
                canvasTop = canvas.canvasTop || chartConfig.canvasTop,
                canvasHeight = canvas.canvasHeight || chartConfig.canvasHeight,
                canvasWidth = canvas.canvasWidth || chartConfig.canvasWidth,
                lastTranslate = axisConfig.lastTranslate || (axisConfig.lastTranslate = {x : 0, y : 0}),
                layers = chart.graphics,
                axisBottomGroup = layers.axisBottomGroup,
                i,
                categories,
                category,
                elemIndex = 0,
                j,
                args,
                lastRightPos,
                animationDuration,
                animObj,
                dummyObj,
                transposeAnimDuration,
                animType,
                labelClipHeight,
                startms,
                endms;

            animationDuration = chart.get('config', 'animationObj');
            animObj = animationDuration.animObj;
            dummyObj = animationDuration.dummyObj;
            transposeAnimDuration = animationDuration.transposeAnimDuration;
            animType = animationDuration.animType;
            labelClipHeight = mathMin(spaceTaken, canvasTop - (axisConfig.maxTopSpaceAvailable || 0));
            labelClipHeight = labelClipHeight > 0 ? labelClipHeight : 0;

            layers.ganttPlotHoverBandContainerParent = layers.ganttPlotHoverBandContainerParent ||
                paper.group('guntt-plot-band-container-parent', axisBottomGroup);

            if (!axisConfig.ganttPlotHoverBandContainer) {
                axisConfig.ganttPlotHoverBandContainer = paper.group('guntt-plot-band-container',
                    layers.ganttPlotHoverBandContainerParent);
                axisConfig.ganttPlotHoverBandContainer.attr({
                    'clip-rect': canvasLeft +','+ canvasTop +
                    ','+canvasWidth+ ','+canvasHeight
                });
            } else {
                axisConfig.ganttPlotHoverBandContainer.animateWith(dummyObj, animObj, {
                    'clip-rect': canvasLeft +','+ canvasTop +
                    ','+canvasWidth+ ','+canvasHeight
                }, transposeAnimDuration, animType);
            }
            if (!axisConfig.ganttPlotLineContainer) {
                axisConfig.ganttPlotLineContainer = paper.group('guntt-plot-line-container', axisBottomGroup);
                axisConfig.ganttPlotLineContainer.attr({
                    'clip-rect': canvasLeft +','+ canvasTop +
                    ','+canvasWidth+ ','+canvasHeight
                });
            } else {
                axisConfig.ganttPlotLineContainer.animateWith(dummyObj, animObj, {
                    'clip-rect': canvasLeft +','+ canvasTop +
                    ','+canvasWidth+ ','+canvasHeight
                }, transposeAnimDuration, animType);
            }
            if (!axisConfig.labelContainer) {
                axisConfig.labelContainer = paper.group('guntt-label-container', axisBottomGroup);
                axisConfig.labelContainer.attr({
                    'clip-rect': canvasLeft +','+ (canvasTop - labelClipHeight) +
                    ','+canvasWidth+ ','+labelClipHeight
                });
            } else {
                axisConfig.labelContainer.animateWith(dummyObj, animObj, {
                    'clip-rect': canvasLeft +','+ (canvasTop - labelClipHeight) +
                    ','+canvasWidth+ ','+labelClipHeight
                }, transposeAnimDuration, animType);
            }
            if (!axisConfig.labelBackContainer) {
                axisConfig.labelBackContainer = paper.group('guntt-label-back-container', axisConfig.labelContainer);
            }
            if (!axisConfig.labelLineContainer) {
                axisConfig.labelLineContainer = paper.group('guntt-label-line-container', axisConfig.labelContainer);
            }
            if (!axisConfig.labelTextContainer) {
                axisConfig.labelTextContainer = paper.group('guntt-label-text-container', axisConfig.labelContainer);
            }
            axisConfig.gridLinePath = '';
            axisConfig.gridLineHeaderPath = '';
            axisConfig.hoverElemsArr = [];
            axisConfig.labelHoverEventName = {
                click : 'CategoryClick',
                rollOver : 'CategoryRollOver',
                rollOut : 'CategoryRollOut'
            };

            if (axisConfig.hasCategory) {
                categories = axisConfig.categories.category;
                for (i in categories) {
                    if (!categories.hasOwnProperty(i) || i === '_attrib') {
                        continue;
                    }
                    category = categories[i].category;
                    lastRightPos = undefined;
                    gridArr = axisConfig.gridArr = [];
                    for (j in category) {
                        startms = numberFormatter.getDateValue(category[j].start).ms;
                        endms = numberFormatter.getDateValue(category[j].end).ms;
                        if (!category.hasOwnProperty(j) || j === '_attrib' || isNaN(startms) || isNaN(endms)) {
                            continue;
                        }
                        args = {
                            elem : category[j],
                            elemIndex : elemIndex,
                            pos : elemIndex,
                            dimension : {
                                left : lastRightPos ||
                                    axis.getPixel(startms),
                                right : axis.getPixel(endms),
                                top : axisStartPosition - spaceTaken + categories[i]._attrib.topPos,
                                bottom : axisStartPosition - spaceTaken + categories[i]._attrib.bottomPos
                            },
                            type : 'category',
                            isHeader : false
                        };
                        lastRightPos = args.dimension.right;
                        axis._drawProcessAndDataTableElement(args);
                        elemIndex += 1;
                        gridArr.push({x : args.dimension.left});
                    }
                }
                if (viewPortConfig.x > 0) {
                    lastTranslate.x = -(viewPortConfig.x * viewPortConfig.scaleX);
                } else {
                    axisConfig.lastTranslate = {x : 0, y : 0};
                }
            }
            axis._drawGridLine();
            axis._disposeExtraProcessAndDataTableElement(elemIndex);
        },
        placeAxis : function (maxHeight) {
            var axis = this,
                axisConfig = axis.config,
                chart = axis.chart,
                chartConfig = chart.config,
                components = chart.get('components'),
                numberFormatter = components.numberFormatter,
                smartLabel = chart.linkedItems.smartLabel,
                labelStyle = axisConfig.labels.style,
                vPadding = 8,
                maxTextSize = 0,
                spaceReturn = {
                    top : 0,
                    bottom : 0
                },
                spaceUsed = 0,
                categories,
                category,
                i,
                text,
                smartLabelText,
                j,
                textStyle,
                singleTextStyle,
                jLen,
                iLim,
                maxTextDimention,
                trendStyle = axisConfig.trend.trendStyle,
                vtrendlines = axisConfig.vTrendLines,
                useEllipsesWhenOverflow = axisConfig.useEllipsesWhenOverflow,
                trendMaxHeight = 0,
                trendSpaceUsed = 0,
                trendObj,
                axisSmartTrendValue,
                trendHeight,
                heightLeft;
            smartLabel.useEllipsesOnOverflow(chartConfig.useEllipsesWhenOverflow);
            smartLabel.setStyle({
                fontSize : labelStyle.fontSize,
                fontFamily : labelStyle.fontFamily,
                lineHeight : labelStyle.lineHeight,
                fontWeight : labelStyle.fontWeight
            });
            // Used to clip the category when chart height is very small.
            axisConfig.maxTopSpaceAvailable = chartConfig.canvasTop;
            if (axisConfig.hasCategory) {
                categories = axisConfig.categories.category;
                for (i in categories) {
                    if (!categories.hasOwnProperty(i) || i === '_attrib') {
                        continue;
                    }
                    maxTextSize = 0;
                    category = categories[i].category;
                    for (j in category) {
                        if (!category.hasOwnProperty(j) || j === '_attrib') {
                            continue;
                        }
                        text = category[j];
                        text.drawLabel = parseUnsafeString(text.label || text.name);
                        textStyle = text._attrib;
                        singleTextStyle = {
                            fontFamily: pluck(textStyle.fontfamily, labelStyle.fontFamily).replace(/px/i, '') +
                                PXSTRING,
                            fontSize: pluck(textStyle.fontsize, labelStyle.fontSize),
                            fontWeight: pluck((Number(textStyle.isbold) === 1 ? 'bold' : textStyle.isbold ===
                                undefined ? 'bold' : undefined), labelStyle.fontWeight),
                            fontStyle: pluck((textStyle.isitalic ? 'italic' : undefined), labelStyle.fontStyle)
                        };
                        setLineHeight(singleTextStyle);
                        smartLabel.setStyle(singleTextStyle);
                        smartLabelText = smartLabel.getOriSize(text.drawLabel);

                        if (smartLabelText.height > maxTextSize) {
                            maxTextDimention = smartLabelText;
                            maxTextSize = smartLabelText.height;
                        }
                    }
                    categories[i]._attrib.topPos = spaceUsed;
                    spaceUsed += maxTextDimention.height + vPadding;
                    categories[i]._attrib.bottomPos = spaceUsed;
                }
            }
            heightLeft = maxHeight - spaceUsed;
            if (axisConfig.drawTrendLines && axisConfig.drawTrendLabels && vtrendlines && axisConfig.isActive){
                // for trend line
                smartLabel.setStyle({
                    fontSize : trendStyle.fontSize,
                    fontFamily : trendStyle.fontFamily,
                    lineHeight : trendStyle.lineHeight,
                    fontWeight : trendStyle.fontWeight
                });
                axisConfig.trendBottomPadding = -1;
                for (j = 0, jLen = vtrendlines.length; j < jLen; j += 1) {
                    for (i = 0, iLim = vtrendlines[j].line.length; i < iLim; i += 1) {
                        trendObj = vtrendlines[j].line[i];
                        text = trendObj.origText || trendObj.displayvalue || trendObj.endvalue ||
                        trendObj.startvalue || '';
                        text = parseUnsafeString(text);
                        // if (text === (trendObj.endvalue || trendObj.startvalue)) {
                        //     text = ''+ numberFormatterFn.call(chartComponents.numberFormatter, text);
                        // }
                        trendObj.startvalue = trendObj.start && numberFormatter.getDateValue(trendObj.start).ms;
                        trendObj.endvalue = trendObj.end && numberFormatter.getDateValue(trendObj.end).ms;
                        trendObj.origText = text;
                        axisSmartTrendValue = smartLabel.getSmartText(text, chart.canvasWidth,
                            trendStyle.lineHeight, useEllipsesWhenOverflow);
                        trendHeight = axisSmartTrendValue.height + 2;
                        // checking if space available for trend label value to be drawn
                        // if not make the display value empty
                        if (heightLeft - trendHeight < 0) {
                            trendObj.displayvalue = '';
                        } else {
                            // set the display value
                            trendObj.displayvalue = axisSmartTrendValue.text;
                            trendMaxHeight = trendMaxHeight < axisSmartTrendValue.height ?
                                axisSmartTrendValue.height : trendMaxHeight;
                        }
                        // check tooltext is available which will help to draw tooltext on hover
                        if (axisSmartTrendValue.tooltext) {
                            trendObj.valueToolText = axisSmartTrendValue.tooltext;
                        } else {
                            delete trendObj.valueToolText;
                        }
                    }
                }
            }
            axisConfig.totalHeight = spaceUsed;
            if (trendMaxHeight > 0) {
                trendSpaceUsed += trendMaxHeight + mathAbs(axisConfig.trendBottomPadding || 0);
            }
            spaceUsed = spaceUsed > maxHeight ? maxHeight : spaceUsed;
            spaceReturn.top += spaceUsed;
            spaceReturn.bottom += trendSpaceUsed;
            chartConfig.categorySpaceUsed = spaceUsed;
            return spaceReturn;
        }
    }, 'ganttCommon']);

    FusionCharts.get ('component', ['axis', 'process', {
        configure : function () {
            var axis = this,
                axisConfig = axis.config,
                chart = axis.chart,
                jsonData = chart.jsonData,
                FCChartObj = jsonData.chart,
                chartComponents = chart.components,
                colorM = chartComponents.colorManager,
                parent = FusionCharts.register('component', ['axis', 'cartesian']);

            parent.prototype.configure.call(this);
            //Grid properties
            axisConfig.lineColor = convertColor (pluck (FCChartObj.gridbordercolor,
                colorM.getColor ('gridColor')), pluckNumber (FCChartObj.gridborderalpha, 100));
            axisConfig.lineThickness = pluckNumber (FCChartObj.gridborderthickness, 1);
            axisConfig.lineDashStyle = pluckNumber (FCChartObj.gridborderdashed, 0) ?
                getDashStyle (pluckNumber (FCChartObj.gridborderdashlen, 1),
                FCChartObj.gridborderdashgap, axisConfig.lineThickness) : DASH_DEF;

            axisConfig.plotLineColor = convertColor (pluck (FCChartObj.ganttlinecolor,
                colorM.getColor ('gridColor')), pluckNumber (FCChartObj.ganttlinealpha, 100));
            axisConfig.plotLineThickness = pluckNumber (FCChartObj.ganttlinethickness, 1);
            axisConfig.plotLineDashStyle = pluckNumber (FCChartObj.ganttlinedashed, 0) ?
                getDashStyle (pluckNumber (FCChartObj.ganttlinedashlen, 1),
                FCChartObj.ganttlinedashgap, axisConfig.lineThickness) : DASH_DEF;

            axisConfig.gridResizeBarColor = convertColor (pluck (FCChartObj.gridresizebarcolor,
                colorM.getColor ('gridResizeBarColor')), pluckNumber (FCChartObj.gridresizebaralpha, 100));
            axisConfig.gridResizeBarThickness = pluckNumber (FCChartObj.gridresizebarthickness, 1);
            axisConfig.forceRowHeight = pluckNumber(FCChartObj.forcerowheight, 0);
            axisConfig.rowHeight = pluckNumber(FCChartObj.rowheight, 0);

            axisConfig.hoverColor = pluck (FCChartObj.processhoverbandcolor, FCChartObj.hoverbandcolor,
                colorM.getColor ('gridColor'));
            axisConfig.hoverAlpha = pluckNumber (FCChartObj.processhoverbandalpha, FCChartObj.hoverbandalpha, 30);
            axisConfig.useHover = pluckNumber (FCChartObj.showprocesshoverband, FCChartObj.showhoverband,
                FCChartObj.showhovereffect, 1);
            axisConfig.usePlotHover = pluckNumber (FCChartObj.showganttpanehorizontalhoverband);
            axisConfig.showFullDataTable = pluckNumber(FCChartObj.showfulldatatable, 1);

            axisConfig.useVerticalScrolling = pluckNumber(FCChartObj.useverticalscrolling, 1);

            axisConfig.gridLineHeaderPath = '';
            axisConfig.gridLinePath = '';
        },
        setDataTable : function (dataTables) {
            var axis = this,
                axisConfig = axis.config;

            // Initialize the category object
            axisConfig.dataTables = {};
            axisConfig.dataTables.dataTable = {};
            if (dataTables) {
                // Set the category flag to true
                axisConfig.hasDataTables = 1;
            } else {
                axisConfig.hasDataTables = 0;
                return;
            }
            // this will store only the category not the vline
            extend2(axisConfig.dataTables.dataTable, dataTables);
            dataTables = axisConfig.dataTables.dataTable;
            // Set the final style property for each text inherating from its parent
            axis._extractAttribToEnd(dataTables, {});
        },
        setProcess : function (processes) {
            var axis = this,
                axisConfig = axis.config,
                axisRange = axisConfig.axisRange,
                startPad = axisConfig.startPad || 0,
                endPad = axisConfig.endPad || 0,
                axisLimits,
                processesLen,
                processesFinal,
                index,
                ProcessIndex,
                processMap;

            // Initialize the category object
            axisConfig.processes = {};
            if (processes) {
                // Set the category flag to true
                axisConfig.hasProcess = 1;
            } else {
                axisConfig.hasProcess = 0;
                return;
            }
            // this will store only the category not the vline
            processesFinal = axisConfig.processes.process = extend2({}, processes);
            axis._extractAttribToEnd(processesFinal, {});

            processesLen = processesFinal.process.length;
            processMap = axisConfig.processes.processMap = {};
            axisConfig.processes.processHeightMap = {};
            // Storing Process mapping
            for (index = 0; index < processesLen; index += 1) {
                ProcessIndex = processesFinal.process[index];
                if (ProcessIndex.id) {
                    processMap[ProcessIndex.id.toLowerCase()] = {
                        catObj : ProcessIndex,
                        index : index
                    };
                }
            }

            axisLimits = {
                Max : processesLen - 1 + endPad,
                Min : -startPad,
                divGap : 1
            };

            axisRange.min = Number(toPrecision(axisLimits.Min,10));
            axisRange.max = Number(toPrecision(axisLimits.Max, 10));
            axisRange.tickInterval = Number(toPrecision(axisLimits.divGap, 10));
        },
        getProcessPositionById : function (processId) {
            var axis = this,
                axisConfig = axis.config,
                process = axisConfig.processes && axisConfig.processes.processMap[processId],
                processHeightMap = axisConfig.processes.processHeightMap;


            if (process) {
                return processHeightMap[process.index];
            } else {
                return false;
            }
        },
        getProcessPositionByIndex : function (ind) {
            var axis = this,
                axisConfig = axis.config,
                processHeightMap = axisConfig.processes.processHeightMap;


            if (processHeightMap[ind]) {
                return processHeightMap[ind];
            } else {
                return false;
            }
        },
        setProcessHeight : function () {
            var axis = this,
                axisConfig = axis.config,
                chart = axis.chart,
                chartConfig = chart.config,
                canvasHeight = chartConfig.canvasHeight,
                process = axisConfig.processes.process.process,
                processHeightMap = axisConfig.processes.processHeightMap,
                processHeight = axisConfig.processMaxHeight,
                height = 0,
                forceRowHeight = axisConfig.forceRowHeight,
                rowHeight = axisConfig.rowHeight,
                processHeightFinal,
                processLength,
                i;
            if ((processHeight * process.length) < canvasHeight || axisConfig.useVerticalScrolling === 0) {
                processHeight = canvasHeight/process.length;
            }
            if (forceRowHeight === 0) {
                if (rowHeight && rowHeight > processHeight) {
                    processHeight = rowHeight;
                }
            } else {
                processHeight = rowHeight || processHeight;
            }
            for (i = 0, processLength = process.length; i < processLength ; i++) {
                processHeightFinal = pluckNumber(process[i].height,processHeight);
                processHeightMap[i] = {
                    top : height,
                    bottom : height + processHeightFinal,
                    height : processHeightFinal
                };
                height += processHeightFinal;
            }
            return height;
        },
        _drawComponents : function () {
            var axis = this,
                axisConfig = axis.config;

            axis._drawProcessAndDataTable();
            axisConfig.drawPlotlines && axis._drawPlotLine();
            axisConfig.drawPlotBand && axis._drawPlotBand();
            axis._drawVerticalLineAndTracker();
            axis._drawGridLine();
        },
        _drawProcessAndDataTable : function () {
            var axis = this,
                axisConfig = axis.config,
                chart = axis.chart,
                axisDimention = axisConfig.axisDimention || {},
                axisStartPosition = axisDimention.x,
                spaceTaken = axisConfig.totalWidth || 0,
                gridArr = axisConfig.gridArr || (axisConfig.gridArr = []),
                canvas = axisConfig.canvas,
                chartConfig = chart.config,
                chartComponents = chart.components,
                paper = chartComponents.paper,
                canvasTop = canvas.canvasTop || chartConfig.canvasTop,
                canvasLeft = canvas.canvasLeft || chartConfig.canvasLeft,
                canvasHeight = canvas.canvasHeight || chartConfig.canvasHeight,
                canvasWidth = canvas.canvasWidth || chartConfig.canvasWidth,
                layers = chart.graphics,
                axisBottomGroup = layers.axisBottomGroup,
                totalVisiblelWidth = axisConfig.totalVisiblelWidth,
                i,
                processLength,
                dataTables,
                dataColumn,
                elemIndex = 0,
                j,
                args,
                topBottom,
                translateX,
                animationDuration,
                animObj,
                dummyObj,
                transposeAnimDuration,
                animType;

            animationDuration = chart.get('config', 'animationObj');
            animObj = animationDuration.animObj;
            dummyObj = animationDuration.dummyObj;
            transposeAnimDuration = animationDuration.transposeAnimDuration;
            animType = animationDuration.animType;

            layers.ganttPlotHoverBandContainerParent = layers.ganttPlotHoverBandContainerParent ||
                paper.group('guntt-plot-band-container-parent', axisBottomGroup);

            if (!axisConfig.ganttPlotHoverBandContainer) {
                axisConfig.ganttPlotHoverBandContainer = paper.group('guntt-plot-band-container',
                    layers.ganttPlotHoverBandContainerParent);
                axisConfig.ganttPlotHoverBandContainer.attr({
                    'clip-rect': canvasLeft +','+ canvasTop +
                    ','+canvasWidth+ ','+canvasHeight
                });
            } else {
                axisConfig.ganttPlotHoverBandContainer.animateWith(dummyObj, animObj, {
                    'clip-rect': canvasLeft +','+ canvasTop +
                    ','+canvasWidth+ ','+canvasHeight
                }, transposeAnimDuration, animType);
            }
            if (!axisConfig.ganttPlotLineContainer) {
                axisConfig.ganttPlotLineContainer = paper.group('guntt-plot-line-container', axisBottomGroup);
                axisConfig.ganttPlotLineContainer.attr({
                    'clip-rect': canvasLeft +','+ canvasTop +
                    ','+canvasWidth+ ','+canvasHeight
                });
            } else {
                axisConfig.ganttPlotLineContainer.animateWith(dummyObj, animObj, {
                    'clip-rect': canvasLeft +','+ canvasTop +
                    ','+canvasWidth+ ','+canvasHeight
                }, transposeAnimDuration, animType);
            }
            if (!axisConfig.headerContainer) {
                axisConfig.headerContainer = paper.group('guntt-header-container', axisBottomGroup);
                axisConfig.headerContainer.attr({
                    'clip-rect': (canvasLeft - axisConfig.totalVisiblelWidth) +','+
                    (canvasTop - chartConfig.categorySpaceUsed) +
                    ','+axisConfig.totalVisiblelWidth+ ','+chartConfig.categorySpaceUsed
                });
            } else {
                axisConfig.headerContainer.animateWith(dummyObj, animObj, {
                    'clip-rect': (canvasLeft - axisConfig.totalVisiblelWidth) +','+
                    (canvasTop - chartConfig.categorySpaceUsed) +
                    ','+axisConfig.totalVisiblelWidth+ ','+chartConfig.categorySpaceUsed
                }, transposeAnimDuration, animType);
            }
            if (!axisConfig.headerBackContainer) {
                axisConfig.headerBackContainer = paper.group('guntt-header-back-container', axisConfig.headerContainer);
            }
            if (!axisConfig.headerLineContainer) {
                axisConfig.headerLineContainer = paper.group('guntt-header-line-container', axisConfig.headerContainer);
            }
            if (!axisConfig.headerTextContainer) {
                axisConfig.headerTextContainer = paper.group('guntt-header-text-container', axisConfig.headerContainer);
            }
            if (!axisConfig.labelContainer) {
                axisConfig.labelContainer = paper.group('guntt-label-container', axisBottomGroup);
                axisConfig.labelContainer.attr({
                    'clip-rect': (canvasLeft - axisConfig.totalVisiblelWidth) +','+ canvasTop +
                    ','+axisConfig.totalVisiblelWidth+ ','+canvasHeight
                });
            } else {
                axisConfig.labelContainer.animateWith(dummyObj, animObj, {
                    'clip-rect': (canvasLeft - axisConfig.totalVisiblelWidth) +','+ canvasTop +
                    ','+axisConfig.totalVisiblelWidth+ ','+canvasHeight
                }, transposeAnimDuration, animType);
            }
            if (!axisConfig.labelBackContainer) {
                axisConfig.labelBackContainer = paper.group('guntt-label-back-container', axisConfig.labelContainer);
            }
            if (!axisConfig.labelLineContainer) {
                axisConfig.labelLineContainer = paper.group('guntt-label-line-container', axisConfig.labelContainer);
            }
            if (!axisConfig.labelTextContainer) {
                axisConfig.labelTextContainer = paper.group('guntt-label-text-container', axisConfig.labelContainer);
            }
            if (!axisConfig.hotContainer) {
                axisConfig.hotContainer = paper.group('guntt-hot-container', axisConfig.axisLabelGroup);
                axisConfig.hotContainer.attr({
                    'clip-rect': (canvasLeft - axisConfig.totalVisiblelWidth) +','+
                    (canvasTop - chartConfig.categorySpaceUsed) +
                    ','+axisConfig.totalVisiblelWidth+ ','+(canvasHeight + chartConfig.categorySpaceUsed)
                });
            } else {
                axisConfig.hotContainer.animateWith(dummyObj, animObj, {
                    'clip-rect': (canvasLeft - axisConfig.totalVisiblelWidth) +','+
                    (canvasTop - chartConfig.categorySpaceUsed) +
                    ','+axisConfig.totalVisiblelWidth+ ','+(canvasHeight + chartConfig.categorySpaceUsed)
                }, transposeAnimDuration, animType);
            }

            axisConfig.gridLinePath = '';
            axisConfig.gridLineHeaderPath = '';
            axisConfig.hoverElemsArr = [];
            axisConfig.labelHoverEventName = {
                click : 'ProcessClick',
                rollOver : 'ProcessRollOver',
                rollOut : 'ProcessRollOut'
            };

            if (axisConfig.hasProcess) {
                process = axisConfig.processes.process.process;
                args = {
                    elem : axisConfig.processes.process,
                    elemIndex : elemIndex,
                    dimension : {
                        left : axisStartPosition - spaceTaken + process._attrib.leftPos,
                        right : axisStartPosition - spaceTaken + process._attrib.rightPos,
                        top : canvasTop - chartConfig.categorySpaceUsed,
                        bottom : canvasTop
                    },
                    type : 'header'
                };
                axis._drawProcessAndDataTableElement(args);
                elemIndex += 1;
                gridArr = axisConfig.gridArr = [];
                for (i = 0, processLength = process.length; i < processLength ; i++) {
                    topBottom = axis.getProcessPositionByIndex(i);
                    args = {
                        elem : process[i],
                        elemIndex : elemIndex,
                        pos : i,
                        dimension : {
                            left : axisStartPosition - spaceTaken + process._attrib.leftPos,
                            right : axisStartPosition - spaceTaken + process._attrib.rightPos,
                            top : canvasTop + topBottom.top,
                            bottom : canvasTop + topBottom.bottom
                        },
                        type : 'process'
                    };
                    axis._drawProcessAndDataTableElement(args);
                    elemIndex += 1;
                    gridArr.push({y : args.dimension.bottom});
                }

            }
            if (axisConfig.hasDataTables) {
                dataTables = axisConfig.dataTables.dataTable.datacolumn;
                for (i in dataTables) {
                    if (!dataTables.hasOwnProperty(i) || i === '_attrib') {
                        continue;
                    }
                    args = {
                        elem : dataTables[i],
                        elemIndex : elemIndex,
                        pos : i,
                        dimension : {
                            left : axisStartPosition - spaceTaken + dataTables[i]._attrib.leftPos,
                            right : axisStartPosition - spaceTaken + dataTables[i]._attrib.rightPos,
                            top : canvasTop - chartConfig.categorySpaceUsed,
                            bottom : canvasTop
                        },
                        type : 'header'
                    };
                    axis._drawProcessAndDataTableElement(args);
                    elemIndex += 1;
                    dataColumn = dataTables[i].text;
                    for (j in dataColumn) {
                        if (dataColumn[j]._attrib && process[j] && process[j]._attrib) {
                            dataColumn[j]._attrib.hoverbandcolor = process[j]._attrib.hoverbandcolor;
                            dataColumn[j]._attrib.hoverbandalpha = process[j]._attrib.hoverbandalpha;
                            dataColumn[j]._attrib.showhoverband = process[j]._attrib.showhoverband;
                        }
                        if (!dataColumn.hasOwnProperty(j) || j === '_attrib') {
                            continue;
                        }
                        topBottom = axis.getProcessPositionByIndex(j);
                        args = {
                            elem : dataColumn[j],
                            elemIndex : elemIndex,
                            pos : j,
                            dimension : {
                                left : axisStartPosition - spaceTaken + dataTables[i]._attrib.leftPos,
                                right : axisStartPosition - spaceTaken + dataTables[i]._attrib.rightPos,
                                top : canvasTop + topBottom.top,
                                bottom : canvasTop + topBottom.bottom
                            },
                            type : 'datatable'
                        };
                        axis._drawProcessAndDataTableElement(args);
                        elemIndex += 1;
                    }
                }
                if (!axisConfig.drawFromProcessVlineDrag) {
                    if (spaceTaken > totalVisiblelWidth) {
                        translateX = (spaceTaken - totalVisiblelWidth);
                        axis.translateAxis(translateX, undefined);
                    } else {
                        axis.resetTransletAxis();
                        axis.resetTransletAxis();
                    }
                } else {
                    axisConfig.drawFromProcessVlineDrag = false;
                }
            }
            axis._drawGridLine();
            axis._disposeExtraProcessAndDataTableElement(elemIndex);
        },
        _drawVerticalLineAndTracker : function () {
            var axis = this,
                axisConfig = axis.config,
                chart = axis.chart,
                chartComponents = chart.components,
                canvas = axisConfig.canvas,
                chartConfig = chart.config,
                axisDimention = axisConfig.axisDimention || {},
                axisStartPosition = axisDimention.x,
                spaceTaken = axisConfig.totalWidth || 0,
                canvasTop = canvas.canvasTop || chartConfig.canvasTop,
                paper = chartComponents.paper,
                plotLine = axis.components.processVline || (axis.components.processVline  = []),
                processVlineArr = axisConfig.processVlineArr,
                trackerGroup = axisConfig.hotContainer,
                counter = 0,
                TRACKER_W = 30,
                i,
                ln,
                path,
                hotElement,
                elem,
                top,
                hoverLineStyle,
                lineHotElemStyle,
                xPos,
                vHoverLine,
                dragStart = function () {
                    var ele = this,
                        data = ele.data ('drag-options'),
                        vHoverLine = data.vHoverLine;

                    data.origX = data.lastX || (data.lastX = 0);
                    vHoverLine.show ();

                    chart.trackerClicked = true;
                    data.draged = false;
                },

                dragMove = function (dx) {
                    var ele = this,
                        data = ele.data ('drag-options'),
                        vHoverLine = data.vHoverLine,
                        vLineSetting = data.vLineSetting,
                        startX = vLineSetting.xPos + dx,
                        leftSideLimit = vLineSetting.leftLimit,
                        rightSideLimit = vLineSetting.rightLimit,
                        transform;

                    //bound limits
                    if (startX < leftSideLimit) {
                        dx = leftSideLimit - vLineSetting.xPos;
                    }
                    if (startX > rightSideLimit) {
                        dx = rightSideLimit - vLineSetting.xPos;
                    }

                    transform = {
                        transform: 't' + (data.origX + dx) + COMMA + 0
                    };

                    ele.attr (transform);
                    vHoverLine.attr (transform);

                    data.draged = true;
                    data.lastX = dx;
                },

                dragUp = function () {
                    var ele = this,
                        data = ele.data ('drag-options'),
                        vLineSetting = data.vLineSetting,
                        vHoverLine = data.vHoverLine,
                        vLineIndex = data.vLineIndex,
                        transform;

                    chart.trackerClicked = false;
                    vHoverLine.hide ();
                    // restoring state with respect to original state
                    if (data.draged) {
                        vLineSetting.left.rightPos += data.lastX || 0;
                        vLineSetting.right.leftPos += data.lastX || 0;
                        vLineSetting.xPos += data.lastX || 0;
                        if (processVlineArr[vLineIndex - 1]) {
                            processVlineArr[vLineIndex - 1].rightLimit += data.lastX || 0;
                        }
                        if (processVlineArr[vLineIndex + 1]) {
                            processVlineArr[vLineIndex + 1].leftLimit += data.lastX || 0;
                        }
                        axisConfig.drawFromProcessVlineDrag = true;
                        axis._drawProcessAndDataTable();
                        axis._drawVerticalLineAndTracker();
                        transform = {
                            transform: 't0,0'
                        };

                        ele.attr (transform);
                        vHoverLine.attr (transform);

                    }
                };

            hoverLineStyle = {
                stroke: axisConfig.gridResizeBarColor,
                'stroke-width': axisConfig.gridResizeBarThickness,
                visibility: 'hidden'
            };
            lineHotElemStyle = {
                stroke: TRACKER_FILL,
                ishot: true,
                'stroke-width': TRACKER_W
            };
            top = canvasTop - chartConfig.categorySpaceUsed;
            for(i = 0, ln = processVlineArr.length; i < ln; i += 1) {
                if(processVlineArr[i].type === 'process') {
                    elem = axisConfig.processes.process.process;
                } else {
                    elem = axisConfig.dataTables.dataTable.datacolumn[processVlineArr[i].ind];
                }
                xPos = axisStartPosition - spaceTaken + elem._attrib.rightPos;
                path = ['M', xPos, top,'L', xPos, canvasTop + axisConfig.processTotalHeight];
                if (plotLine[counter]) {
                    vHoverLine = plotLine[counter].graphics.vHoverLine;
                    vHoverLine.attr({path : path}).attr(hoverLineStyle);
                    hotElement = plotLine[counter].graphics.hotElement;
                    hotElement.attr({path : path}).attr(lineHotElemStyle);
                } else {
                    vHoverLine = paper.path(path, trackerGroup);
                    vHoverLine.attr(hoverLineStyle);
                    hotElement = paper.path(path, trackerGroup);
                    hotElement.attr(lineHotElemStyle);
                    plotLine[counter] = {};
                    plotLine[counter].graphics = {};
                    plotLine[counter].config = {};
                    plotLine[counter].graphics.vHoverLine = vHoverLine;
                    plotLine[counter].graphics.hotElement = hotElement;
                }
                hotElement.css ('cursor', R.svg && 'ew-resize' || 'e-resize')
                .drag (dragMove,  dragStart, dragUp)
                .data ('drag-options', {
                    vHoverLine: plotLine[counter].graphics.vHoverLine,
                    vLineSetting: processVlineArr[i],
                    vLineIndex: i
                });
                counter += 1;
            }
            for (i = counter, ln = plotLine.length; i < ln; i += 1) {
                plotLine[i].graphics.vHoverLine.attr({
                    path : ['M',0,0]
                });
                plotLine[i].graphics.hotElement.attr({
                    path : ['M',0,0]
                });
            }
        },
        manageProcessScroll : function (scroll) {
            var axis = this,
                axisConfig = axis.config,
                spaceTaken = axisConfig.totalWidth || 0,
                totalVisiblelWidth = axisConfig.totalVisiblelWidth,
                translateX;

            if (spaceTaken > totalVisiblelWidth) {
                translateX = (spaceTaken - totalVisiblelWidth) * (1 - scroll);
                axis.translateAxis(translateX, undefined);
            }

        },
        placeAxis : function (maxWidth) {
            var axis = this,
                axisConfig = axis.config,
                chart = axis.chart,
                smartLabel = chart.linkedItems.smartLabel,
                labelStyle = axisConfig.labels.style,
                hPadding = 4,
                processHeightPadding = 8,
                maxProcessDimention = 0,
                maxTextSize = 0,
                spaceReturn = {
                    left : 0,
                    right : 0
                },
                spaceUsed = 0,
                processOnRight = false,
                processSpaceUsed = 0,
                processMaxHeight = 0,
                i,
                text,
                smartLabelText,
                processLength,
                singleProcess,
                processStyle,
                processParent,
                singleProcessStyle,
                dataTables,
                dataTable,
                dataColumn,
                j,
                textStyle,
                singleTextStyle,
                maxTextDimention,
                preAlocateSpace = 0;
            smartLabel.useEllipsesOnOverflow(chart.config.useEllipsesWhenOverflow);
            smartLabel.setStyle({
                fontSize : labelStyle.fontSize,
                fontFamily : labelStyle.fontFamily,
                lineHeight : labelStyle.lineHeight,
                fontWeight : labelStyle.fontWeight
            });
            if (axisConfig.showFullDataTable === 0) {
                preAlocateSpace = maxWidth / ((axisConfig.hasDataTables && axisConfig.dataTables &&
                    axisConfig.dataTables.dataTable && axisConfig.dataTables.dataTable.datacolumn ?
                    axisConfig.dataTables.dataTable.datacolumn.length :
                    0) + 1);
            }
            if (axisConfig.hasProcess) {
                process = axisConfig.processes.process.process;
                processParent = axisConfig.processes.process;
                if (processParent.positioningrid === 'right') {
                    processOnRight = true;
                }
                if (processParent.headertext) {
                    processParent.drawLabel = parseUnsafeString(processParent.headertext);
                    processStyle = processParent._attrib;
                    singleProcessStyle = {
                        fontFamily: pluck(processStyle.headerfontfamily, labelStyle.fontFamily),
                        fontSize: pluck(processStyle.headerfontsize, labelStyle.fontSize).replace(/px/i, '') + PXSTRING,
                        fontWeight: pluck((Number(processStyle.headerisbold) === 1 ? 'bold' :
                            processStyle.headerisbold === undefined ? 'bold' : undefined), labelStyle.fontWeight),
                        fontStyle: pluck((processStyle.headerisitalic ? 'italic' : undefined), labelStyle.fontStyle)
                    };
                    singleProcessStyle.lineHeight = setLineHeight(singleProcessStyle);
                    smartLabel.setStyle(singleProcessStyle);
                    smartLabelText = smartLabel.getOriSize(processParent.drawLabel);

                    if (smartLabelText.width > maxTextSize) {
                        maxProcessDimention = smartLabelText;
                        maxTextSize = smartLabelText.width;
                    }
                }
                for (i = 0, processLength = process.length; i < processLength ; i++) {
                    singleProcess = process[i];
                    processStyle = singleProcess._attrib;
                    singleProcess.drawLabel = parseUnsafeString(singleProcess.label || singleProcess.name);
                    singleProcessStyle = {
                        fontFamily: pluck(processStyle.fontfamily, labelStyle.fontFamily),
                        fontSize: pluck(processStyle.fontsize, labelStyle.fontSize).replace(/px/i, '') + PXSTRING,
                        fontWeight: pluck((processStyle.isbold ? 'bold' : undefined), labelStyle.fontWeight),
                        fontStyle: pluck((processStyle.isitalic ? 'italic' : undefined), labelStyle.fontStyle)
                    };
                    singleProcessStyle.lineHeight = setLineHeight(singleProcessStyle);
                    smartLabel.setStyle(singleProcessStyle);
                    smartLabelText = smartLabel.getOriSize(singleProcess.drawLabel);

                    if (smartLabelText.width > maxTextSize) {
                        maxProcessDimention = smartLabelText;
                        maxTextSize = smartLabelText.width;
                    }
                    if (smartLabelText.height > processMaxHeight) {
                        processMaxHeight = smartLabelText.height;
                    }
                }
                axisConfig.processMaxHeight = processMaxHeight + processHeightPadding;
                //axisConfig.processTotalHeight = axis._setProcessHeight(processMaxHeight);
                process._attrib.leftPos = spaceUsed;
                if(!processOnRight) {
                    spaceUsed += preAlocateSpace || maxProcessDimention.width + hPadding;
                } else {
                    processSpaceUsed = preAlocateSpace || maxProcessDimention.width + hPadding;
                }
                process._attrib.rightPos = spaceUsed;

            }
            if (axisConfig.hasDataTables) {
                dataTables = axisConfig.dataTables.dataTable.datacolumn;
                for (i in dataTables) {
                    if (!dataTables.hasOwnProperty(i) || i === '_attrib') {
                        continue;
                    }
                    dataTable = dataTables[i];
                    maxTextSize = 0;
                    if (dataTable.headertext) {
                        processStyle = dataTable._attrib;
                        dataTable.drawLabel = parseUnsafeString(dataTable.headertext);
                        singleTextStyle = {
                            fontFamily: pluck(processStyle.headerfontfamily, labelStyle.fontFamily),
                            fontSize: pluck(processStyle.headerfontsize, labelStyle.fontSize).replace(/px/i, '') +
                                PXSTRING,
                            fontWeight: pluck((Number(processStyle.headerisbold) === 1 ? 'bold' :
                                processStyle.headerisbold === undefined ? 'bold' : undefined), labelStyle.fontWeight),
                            fontStyle: pluck((processStyle.headerisitalic ? 'italic' : undefined), labelStyle.fontStyle)
                        };
                        singleTextStyle.lineHeight = setLineHeight(singleTextStyle);
                        smartLabel.setStyle(singleTextStyle);
                        smartLabelText = smartLabel.getOriSize(dataTable.drawLabel);

                        if (smartLabelText.width > maxTextSize) {
                            maxTextDimention = smartLabelText;
                            maxTextSize = smartLabelText.width;
                        }
                    }
                    dataColumn = dataTable.text;
                    for (j in dataColumn) {
                        if (!dataColumn.hasOwnProperty(j) || j === '_attrib') {
                            continue;
                        }
                        text = dataColumn[j];
                        text.drawLabel = parseUnsafeString(text.label || text.name);
                        textStyle = text._attrib;
                        singleTextStyle = {
                            fontFamily: pluck(textStyle.fontfamily, labelStyle.fontFamily),
                            fontSize: pluck(textStyle.fontsize, labelStyle.fontSize).replace(/px/i, '') + PXSTRING,
                            fontWeight: pluck((textStyle.isbold ? 'bold' : undefined), labelStyle.fontWeight),
                            fontStyle: pluck((textStyle.isitalic ? 'italic' : undefined), labelStyle.fontStyle)
                        };
                        singleTextStyle.lineHeight = setLineHeight(singleTextStyle);
                        smartLabel.setStyle(singleTextStyle);
                        smartLabelText = smartLabel.getOriSize(text.drawLabel);

                        if (smartLabelText.width > maxTextSize) {
                            maxTextDimention = smartLabelText;
                            maxTextSize = smartLabelText.width;
                        }
                    }
                    dataTables[i]._attrib.leftPos = spaceUsed;
                    spaceUsed += preAlocateSpace || maxTextDimention.width + hPadding;
                    dataTables[i]._attrib.rightPos = spaceUsed;
                }
            }
            if (axisConfig.hasProcess) {
                if(processOnRight) {
                    process._attrib.leftPos += spaceUsed;
                    process._attrib.rightPos += spaceUsed + processSpaceUsed;
                    spaceUsed += processSpaceUsed;
                }
            }
            axisConfig.totalWidth = spaceUsed;
            axis.adjustWidth();
            spaceUsed = axisConfig.totalWidth > maxWidth ? maxWidth : axisConfig.totalWidth;
            axisConfig.totalVisiblelWidth = spaceUsed;
            spaceReturn.left += spaceUsed;
            return spaceReturn;
        },

        adjustWidth : function () {
            var axis = this,
                axisConfig = axis.config,
                totalWidth = axisConfig.totalWidth,
                availableWidth = totalWidth,
                spaceUsed = 0,
                processOnRight = false,
                dragPadding = 20,
                processVlineArr,
                attrib,
                getWidth,
                processParent,
                newLeft,
                dataTables,
                dataTable,
                i,
                prevProcessVlineArr;

            processVlineArr = axisConfig.processVlineArr = [];

            availableWidth -= dragPadding * (axisConfig.hasDataTables && axisConfig.dataTables &&
                axisConfig.dataTables.dataTable && axisConfig.dataTables.dataTable.datacolumn ?
                axisConfig.dataTables.dataTable.datacolumn.length + 1 : 1);

            getWidth = function (width) {
                var retW;

                availableWidth += dragPadding;
                if (width.match(/%/g)) {
                    retW = pluckNumber(((totalWidth * Number(width.replace(/%/g, '')/100))), 0);
                } else {
                    retW = pluckNumber(width, 0);
                }
                if (availableWidth < dragPadding) {
                    retW = dragPadding;
                } else if (retW > availableWidth) {
                    retW = availableWidth;
                }
                availableWidth -= retW;
                return retW;
            };

            if (axisConfig.hasProcess) {
                process = axisConfig.processes.process.process;
                processParent = axisConfig.processes.process;
                if (processParent.positioningrid === 'right') {
                    processOnRight = true;
                }
                attrib = process._attrib;
                newLeft = spaceUsed;
                spaceUsed += (getWidth(attrib.width || ''+(attrib.rightPos - attrib.leftPos)));
                attrib.leftPos = newLeft;
                attrib.rightPos = spaceUsed;

                if (!processOnRight) {
                    processVlineArr.push({
                        type : 'process',
                        ind : 0,
                        xPos : attrib.rightPos,
                        left : attrib,
                        leftLimit : attrib.leftPos + dragPadding
                    });
                } else {
                    spaceUsed = 0;
                }

            }
            if (axisConfig.hasDataTables) {
                dataTables = axisConfig.dataTables.dataTable.datacolumn;
                for (i in dataTables) {
                    if (!dataTables.hasOwnProperty(i) || i === '_attrib') {
                        continue;
                    }
                    dataTable = dataTables[i];
                    attrib = dataTable._attrib;
                    newLeft = spaceUsed;
                    spaceUsed += (getWidth(attrib.width || ''+(attrib.rightPos - attrib.leftPos)));
                    attrib.leftPos = newLeft;
                    attrib.rightPos = spaceUsed;
                    prevProcessVlineArr = processVlineArr[processVlineArr.length - 1];
                    if (prevProcessVlineArr) {
                        prevProcessVlineArr.right = attrib;
                        prevProcessVlineArr.rightLimit = attrib.rightPos - dragPadding;
                    }
                    processVlineArr.push({
                        type : 'dataTable',
                        ind : i,
                        xPos : attrib.rightPos,
                        left : attrib,
                        leftLimit : attrib.leftPos + dragPadding
                    });
                }
            }
            if (axisConfig.hasProcess) {
                if(processOnRight) {
                    attrib = process._attrib;
                    attrib.rightPos = spaceUsed + (attrib.rightPos - attrib.leftPos);
                    attrib.leftPos = spaceUsed;
                    spaceUsed += attrib.rightPos - attrib.leftPos;
                    prevProcessVlineArr = processVlineArr[processVlineArr.length - 1];
                    if (prevProcessVlineArr) {
                        prevProcessVlineArr.right = attrib;
                        prevProcessVlineArr.rightLimit = attrib.rightPos - dragPadding;
                    }
                } else {
                    processVlineArr.pop();
                }
            }
            axisConfig.totalWidth = spaceUsed;
        }

    }, 'ganttCommon']);

}]);


}));
