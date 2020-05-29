(function () {
    /**
     * Style empty points in line charts via CSS
     * https://github.com/c3js/c3/pull/1992
     */
    var rectangle_dimension = 10;
    var rectangle_legend_dimension = 12;
    var rectangle_center_offset = rectangle_dimension/2;

    function createSvgEl(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }

    if(!c3.chart.internal.fn.additionalConfig) {
        c3.chart.internal.fn.additionalConfig = {};
    }

    c3.chart.internal.fn.getTooltipContent = function (d, defaultTitleFormat, defaultValueFormat, color) {
        var $$ = this,
            config = $$.config,
            titleFormat = config.tooltip_format_title || defaultTitleFormat,
            nameFormat = config.tooltip_format_name || function (name) {
                return name;
            },
            valueFormat = config.tooltip_format_value || defaultValueFormat,
            text,
            i,
            title,
            value,
            name,
            bgcolor;

        var tooltipSortFunction = this.getTooltipSortFunction();
        if (tooltipSortFunction) {
            d.sort(tooltipSortFunction);
        }

        for (i = 0; i < d.length; i++) {
            if (!(d[i] && (d[i].value || d[i].value === 0))) {
                continue;
            }

            if (!text) {
                title = c3.chart.internal.fn.sanitise(titleFormat ? titleFormat(d[i].x) : d[i].x);
                text = "<table class='" + $$.CLASS.tooltip + "'>" + (title || title === 0 ? "<tr><th colspan='2'>" + title + "</th></tr>" : "");
            }

            value = c3.chart.internal.fn.sanitise(valueFormat(d[i].value, d[i].ratio, d[i].id, d[i].index, d));
            if (value !== undefined) {
                // Skip elements when their name is set to null
                if (d[i].name === null) {
                    continue;
                }
                name = c3.chart.internal.fn.sanitise(nameFormat(d[i].name, d[i].ratio, d[i].id, d[i].index));
                bgcolor = $$.levelColor ? $$.levelColor(d[i].value) : color(d[i].id);

                text += "<tr class='" + $$.CLASS.tooltipName + "-" + $$.getTargetSelectorSuffix(d[i].id) + "'>";
                text += "<td class='name'><span class='" + d[i].id + " legend-marker-" + $$.config.data_markers[d[i].id] + "' style='background-color:" + bgcolor + "'></span>" + name + "</td>";
                text += "<td class='value'>" + value + "</td>";
                text += "</tr>";
            }
        }
        return text + "</table>";
    };

    c3.chart.internal.fn.getToggle = function (that, d) {
        var $$ = this,
            toggle;
        // we are overriding to capture our new rectangle (peaks) marker shapes
        if (that.nodeName === 'circle' || that.nodeName === 'rect') {
            if ($$.isStepType(d)) {
                // circle is hidden in step chart, so treat as within the click area
                toggle = function toggle() {
                };
            } else {
                toggle = $$.togglePoint;
            }
        } else if (that.nodeName === 'path') {
            toggle = $$.togglePath;
        }
        return toggle;
    };
    c3.chart.internal.fn.redrawCircle = function (cx, cy, withTransition) {
        var $$ = this;
        var selectedCircles = $$.main.selectAll('.' + $$.__proto__.CLASS.selectedCircle);
        var response = [
            (withTransition ?
                $$.mainCircle.transition(Math.random().toString()) :
                $$.mainCircle
            )
            .style('opacity', this.opacityForCircle.bind(this))
            .style("fill", function (d, i) {
                return $$.color
            })
            .attr("cx", cx)
            .attr("cy", cy), (withTransition ? selectedCircles.transition(Math.random().toString()) : selectedCircles).attr("cx", cx).attr("cy", cy)];
        var mainCircle = response[0];
        mainCircle.style('color', $$.color);
        return response;
    };
    c3.chart.internal.fn.updateCircle = function () {
        var $$ = this;
        $$.mainCircle = $$.main
            .selectAll('.c3-circles')
            .selectAll('.c3-circle')
            .data($$.lineOrScatterData.bind($$))
            .enter()
            .append(function (d, i) {
                // shape is pulled from data_markers mapping which is enumeration of supported svg shapes
                // identified as part of the ChartSeries on a per-field basis.
                var shape = ($$.config.data_markers && $$.config.data_markers[d.id]) ? $$.config.data_markers[d.id] : 'circle';
                return createSvgEl(shape, d.id);
            })
            .attr('class', function (d, i) {
                var shape = ($$.config.data_markers && $$.config.data_markers[d.id]) ? $$.config.data_markers[d.id] : 'circle';
                var fieldname = d.id ? '-' + d.id : '';
                var classname = 't8c-line-marker-' + shape + ' t8c-line-marker-' + shape + fieldname;
                if (d.id.contains('_peak')) {
                    classname += ' ' + d.id.replace('_peak');
                }
                return classname.trim();
            });

        // modify attributes for non-peaks (circles)
        $$.main.selectAll('.c3-circles').selectAll('circle.t8c-line-marker-circle')
            .attr("class", $$.classCircle.bind($$))
            .attr("r", $$.pointR.bind($$))
            .style("fill", $$.color)
            .style("opacity", $$.initialOpacityForCircle.bind($$));

        // modify attributes for peaks (rectangles)
        $$.main.selectAll('.c3-circles').selectAll('rect.t8c-line-marker-rect')
            .attr("class", function (d, i) {
                return $$.classCircle.bind($$) + ' t8c-c3-rectangle-' + d.id + '-' + i
            })
            .attr("x", function (d, i) {
                // rectangle positioning starts top-left corner, need to offset to center on x-axis
                return $$.xv({value: new Date(d.x).getTime()}) - rectangle_center_offset
            })
            .attr("y", function (d, i) {
                // rectangle positioning starts top-left corner, need to offset to center on y-axis
                return $$.yv(d) - rectangle_center_offset;
            })
            .attr("width", rectangle_dimension)
            .attr("height", rectangle_dimension)
            .style("stroke", $$.color)
            .style("stroke-width", "2px")
            .style("fill", 'white')
            .style("opacity", $$.initialOpacityForCircle.bind($$));
        $$.mainCircle.style('color', $$.color);
    };

    /**
     * Return the svg x point for the given X value in units of the x-axis
     */
    c3.chart.fn._xv = function(xValue){
        var $$ = this.internal;
        return $$.xv({value: xValue});
    };

    /**
     * Update the legend to render circle legend titles instead of squares
     * https://groups.google.com/forum/#!topic/c3js/KHUD20RP_hs
     */
    c3.chart.internal.fn.additionalConfig = {
        data_markers: {},
        legend_radius: 7
    };
    c3.chart.internal.fn.updateLegend = function (targetIds, options, transitions) {
        var $$ = this,
            config = $$.config,
            base = this.__proto__,
            CLASS = base.CLASS;
        var getOption = base.getOption,
            isDefined = base.isDefined;
        var xForLegend, xForLegendText, xForLegendRect, yForLegend, yForLegendText, yForLegendRect, x1ForLegendTile,
            x2ForLegendTile, yForLegendTile;
        var paddingTop = 4,
            paddingRight = 30, // original was 10; Increased to give extra padding between legend items
            maxWidth = 0,
            maxHeight = 0,
            posMin = 10,
            tileWidth = config.legend_item_tile_width + 5;
        var l,
            totalLength = 0,
            offsets = {},
            widths = {},
            heights = {},
            margins = [0],
            steps = {},
            step = 0;
        var withTransition, withTransitionForTransform;
        var texts, rects, tiles, background;

        // Skip elements when their name is set to null
        targetIds = targetIds.filter(function (id) {
            return !isDefined(config.data_names[id]) || config.data_names[id] !== null;
        });

        options = options || {};
        withTransition = getOption(options, "withTransition", true);
        withTransitionForTransform = getOption(options, "withTransitionForTransform", true);

        function getTextBox (textElement, id) {
            if (!$$.legendItemTextBox[id]) {
                $$.legendItemTextBox[id] = $$.getTextRect(textElement.textContent, CLASS.legendItem, textElement);
            }
            return $$.legendItemTextBox[id];
        }

        function updatePositions (textElement, id, index) {
            var reset = index === 0,
                isLast = index === targetIds.length - 1,
                box = getTextBox(textElement, id),
                itemWidth = box.width + tileWidth + (isLast && !($$.isLegendRight || $$.isLegendInset) ? 0 : paddingRight) + config.legend_padding,
                itemHeight = box.height + paddingTop,
                itemLength = $$.isLegendRight || $$.isLegendInset ? itemHeight : itemWidth,
                areaLength = $$.isLegendRight || $$.isLegendInset ? $$.getLegendHeight() : $$.getLegendWidth(),
                margin,
                maxLength;

            // MEMO: care about condifion of step, totalLength
            function updateValues (id, withoutStep) {
                if (!withoutStep) {
                    margin = (areaLength - totalLength - itemLength) / 2;
                    if (margin < posMin) {
                        margin = (areaLength - itemLength) / 2;
                        totalLength = 0;
                        step++;
                    }
                }
                steps[id] = step;
                margins[step] = $$.isLegendInset ? 10 : margin;
                offsets[id] = totalLength;
                totalLength += itemLength;
            }

            if (reset) {
                totalLength = 0;
                step = 0;
                maxWidth = 0;
                maxHeight = 0;
            }

            if (config.legend_show && !$$.isLegendToShow(id)) {
                widths[id] = heights[id] = steps[id] = offsets[id] = 0;
                return;
            }

            widths[id] = itemWidth;
            heights[id] = itemHeight;

            if (!maxWidth || itemWidth >= maxWidth) {
                maxWidth = itemWidth;
            }
            if (!maxHeight || itemHeight >= maxHeight) {
                maxHeight = itemHeight;
            }
            maxLength = $$.isLegendRight || $$.isLegendInset ? maxHeight : maxWidth;

            if (config.legend_equally) {
                Object.keys(widths).forEach(function (id) {
                    widths[id] = maxWidth;
                });
                Object.keys(heights).forEach(function (id) {
                    heights[id] = maxHeight;
                });
                margin = (areaLength - maxLength * targetIds.length) / 2;
                if (margin < posMin) {
                    totalLength = 0;
                    step = 0;
                    targetIds.forEach(function (id) {
                        updateValues(id);
                    });
                } else {
                    updateValues(id, true);
                }
            } else {
                updateValues(id);
            }
        }

        if ($$.isLegendInset) {
            step = config.legend_inset_step ? config.legend_inset_step : targetIds.length;
            $$.updateLegendStep(step);
        }

        if ($$.isLegendRight) {
            xForLegend = function xForLegend (id) {
                return maxWidth * steps[id];
            };
            yForLegend = function yForLegend (id) {
                return margins[steps[id]] + offsets[id];
            };
        } else if ($$.isLegendInset) {
            xForLegend = function xForLegend (id) {
                return maxWidth * steps[id] + 10;
            };
            yForLegend = function yForLegend (id) {
                return margins[steps[id]] + offsets[id];
            };
        } else {
            xForLegend = function xForLegend (id) {
                // return margins[steps[id]] + offsets[id];
                return (margins[steps[id]] * 0.5) + offsets[id];
            };
            // yForLegend = function yForLegend(id) {
            //     return maxHeight * steps[id];
            // };
            yForLegend = function (id) {
                return maxHeight * steps[id] + config.legend_radius;
            };
        }
        xForLegendText = function xForLegendText (id, i) {
            return xForLegend(id, i) + 4 + config.legend_item_tile_width;
        };
        // yForLegendText = function yForLegendText(id, i) {
        //     return yForLegend(id, i) + 9;
        // };

        xForLegendRect = function xForLegendRect (id, i) {
            return xForLegend(id, i);
        };
        yForLegendRect = function yForLegendRect (id, i) {
            return yForLegend(id, i) - 5;
        };
        x1ForLegendTile = function x1ForLegendTile (id, i) {
            return xForLegend(id, i) - 2;
        };
        x2ForLegendTile = function x2ForLegendTile (id, i) {
            return xForLegend(id, i) - 2 + config.legend_item_tile_width;
        };
        // yForLegendTile = function yForLegendTile(id, i) {
        //     return yForLegend(id, i) + 4;
        // };

        yForLegendTile = function yForLegendTile (id, i) {
            return yForLegend(id, i) + 7;
        };

        yForLegendText = function (id, i) {
            return yForLegend(id, i) + 9 - config.legend_radius;
        };
        //yForLegendRect = function (id, i) { return yForLegend(id, i) - 7 + config.legend_radius; };
        yForLegendTile = function (id, i) {
            return yForLegend(id, i) + 5 - config.legend_radius
        };

        // Define g for legend area
        l = $$.legend.selectAll('.' + CLASS.legendItem).data(targetIds).enter()
            .append('g')
            .attr('class', function (id) {
                return $$.generateClass(CLASS.legendItem, id);
            }).style('visibility', function (id) {
                return $$.isLegendToShow(id) ? 'visible' : 'hidden';
            }).style('cursor', 'pointer').on('click', function (id) {
                if (config.legend_item_onclick) {
                    config.legend_item_onclick.call($$, id);
                } else {
                    if ($$.d3.event.altKey) {
                        $$.api.hide();
                        $$.api.show(id);
                    } else {
                        $$.api.toggle(id);
                        $$.isTargetToShow(id) ? $$.api.focus(id) : $$.api.revert();
                    }
                }
            }).on('mouseover', function (id) {
                if (config.legend_item_onmouseover) {
                    config.legend_item_onmouseover.call($$, id);
                } else {
                    $$.d3.select(this).classed(CLASS.legendItemFocused, true);
                    if (!$$.transiting && $$.isTargetToShow(id)) {
                        $$.api.focus(id);
                    }
                }
            }).on('mouseout', function (id) {
                if (config.legend_item_onmouseout) {
                    config.legend_item_onmouseout.call($$, id);
                } else {
                    $$.d3.select(this).classed(CLASS.legendItemFocused, false);
                    $$.api.revert();
                }
            });

        l.append('text').text(function (id) {
            return isDefined(config.data_names[id]) ? config.data_names[id] : id;
        }).each(function (id, i) {
            updatePositions(this, id, i);
        }).style("pointer-events", "none").attr('x', $$.isLegendRight || $$.isLegendInset ? xForLegendText : -200).attr('y', $$.isLegendRight || $$.isLegendInset ? -200 : yForLegendText);
        l.append('rect').attr("class", CLASS.legendItemEvent).style('fill-opacity', 0).attr('x', $$.isLegendRight || $$.isLegendInset ? xForLegendRect : -200).attr('y', $$.isLegendRight || $$.isLegendInset ? -200 : yForLegendRect);


        // l.append('line')
        //     .attr('class', CLASS.legendItemTile)
        //     .style('stroke', $$.color)
        //     .style("pointer-events", "none")
        //     .attr('x1', $$.isLegendRight || $$.isLegendInset ? x1ForLegendTile : -200)
        //     .attr('y1', $$.isLegendRight || $$.isLegendInset ? -200 : yForLegendTile)
        //     .attr('x2', $$.isLegendRight || $$.isLegendInset ? x2ForLegendTile : -200)
        //     .attr('y2', $$.isLegendRight || $$.isLegendInset ? -200 : yForLegendTile)
        //     .attr('stroke-width', config.legend_item_tile_height);

        l.append(function (d, i) {
            // in this case "d" is a string representing the data field name
            var shape = ($$.config.data_markers && $$.config.data_markers[d]) ? $$.config.data_markers[d] : 'circle';
            return createSvgEl(shape);
        }).attr("class", CLASS.legendItemTile)
            .style("pointer-events", "none")
            .style('fill', $$.color)
            .each(function (d, i ) {
                // d is data series field-name (id) string
                var fieldShape = $$.config.data_markers[d] || 'circle';
                switch(fieldShape) {
                    case 'rect': {
                        var x_legend_shape_text_gap = 10;
                        var y_legend_shape_text_vertical_offset = 2;
                        var legend_rect_x = xForLegendText(d, i) - (rectangle_center_offset + x_legend_shape_text_gap);
                        var legend_rect_y = yForLegend(d, i) - (rectangle_center_offset + y_legend_shape_text_vertical_offset);
                        $$.d3.select(this)
                            .attr("x", legend_rect_x)
                            .attr("y", legend_rect_y)
                            .attr("width", rectangle_legend_dimension)
                            .attr("height", rectangle_legend_dimension);
                        break;
                    }

                    // intentional fall-through as default should be 'circle'
                    case 'circle':
                    default:
                        $$.d3.select(this)
                            .attr('cx', $$.isLegendRight || $$.isLegendInset ? xForLegendText : -200)
                            .attr('cy', $$.isLegendRight || $$.isLegendInset ? -200 : yForLegend)
                            .attr('r', config.legend_radius)
                            .attr('width', 10)
                            .attr('height', 10);
                }
            });

        // Set background for inset legend
        background = $$.legend.select('.' + CLASS.legendBackground + ' rect');
        if ($$.isLegendInset && maxWidth > 0 && background.size() === 0) {
            background = $$.legend.insert('g', '.' + CLASS.legendItem).attr("class", CLASS.legendBackground).append('rect');
        }

        texts = $$.legend.selectAll('text').data(targetIds).text(function (id) {
                return isDefined(config.data_names[id]) ? config.data_names[id] : id;
            } // MEMO: needed for update
        ).each(function (id, i) {
            updatePositions(this, id, i);
        });
        (withTransition ? texts.transition() : texts).attr('x', xForLegendText).attr('y', yForLegendText);

        rects = $$.legend.selectAll('rect.' + CLASS.legendItemEvent).data(targetIds);
        (withTransition ? rects.transition() : rects).attr('width', function (id) {
            return widths[id];
        }).attr('height', function (id) {
            return heights[id];
        }).attr('x', xForLegendRect).attr('y', yForLegendRect);

        tiles = $$.legend.selectAll('circle.' + CLASS.legendItemTile + ',rect.' + CLASS.legendItemTile).data(targetIds);
        (withTransition ? tiles.transition() : tiles)
            .style('fill', $$.color)
            .attr('cx', xForLegend) // replace x with cx
            .attr('cy', yForLegendTile);
        // .style('stroke', $$.color)
        // .attr('x1', x1ForLegendTile)
        // .attr('y1', yForLegendTile)
        // .attr('x2', x2ForLegendTile)
        // .attr('y2', yForLegendTile);

        if (background) {
            (withTransition ? background.transition() : background).attr('height', $$.getLegendHeight() - 12).attr('width', maxWidth * (step + 1) + 10);
        }

        // toggle legend state
        $$.legend.selectAll('.' + CLASS.legendItem).classed(CLASS.legendItemHidden, function (id) {
            return !$$.isTargetToShow(id);
        });

        // Update all to reflect change of legend
        $$.updateLegendItemWidth(maxWidth);
        $$.updateLegendItemHeight(maxHeight);
        $$.updateLegendStep(step);
        // Update size and scale
        $$.updateSizes();
        $$.updateScales();
        $$.updateSvgSize();
        // Update g positions
        $$.transformAll(withTransitionForTransform, transitions);
        $$.legendHasRendered = true;
    };

}());
