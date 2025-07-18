import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Dimensions, Text, Pressable } from "react-native";
import Svg, {
  Line,
  Path,
  Circle,
  Defs,
  ClipPath,
  Rect,
} from "react-native-svg";
import {
  PanGestureHandler,
  PinchGestureHandler,
  State,
} from "react-native-gesture-handler";
import { useChartData } from "@/hooks/useTradingStore";
import { TimeRange } from "@/types/trading";
import { useTradingStore } from "@/hooks/useTradingStore";
import { formatPrice } from "@/utils/formatters";
import Colors from "@/constants/colors";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CHART_HEIGHT = 300;
const CHART_PADDING_TOP = 20;
const CHART_PADDING_BOTTOM = 20;
const CHART_PADDING_LEFT = 80;
const CHART_PADDING_RIGHT = 20;
const TIME_RANGES: TimeRange[] = ["7D", "1M", "3M", "1Y", "5Y", "MAX"];

export default function PriceChart() {
  const { data: chartData, isLoading } = useChartData();
  const { selectedTimeRange, changeTimeRange } = useTradingStore();

  // Interactive state
  const [scale, setScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [lastScale, setLastScale] = useState(1);
  const [lastTranslateX, setLastTranslateX] = useState(0);

  const panRef = useRef<PanGestureHandler>(null);
  const pinchRef = useRef<PinchGestureHandler>(null);

  // Reset interactive state when data changes
  useEffect(() => {
    setScale(1);
    setTranslateX(0);
    setLastScale(1);
    setLastTranslateX(0);
  }, [chartData, selectedTimeRange]);

  // Handle pinch gesture for zoom
  const onPinchGestureEvent = (event: any) => {
    const newScale = Math.max(
      0.5,
      Math.min(5, lastScale * event.nativeEvent.scale)
    );
    setScale(newScale);
  };

  const onPinchHandlerStateChange = (event: any) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      setLastScale(scale);
    }
  };

  // Handle pan gesture for horizontal scrolling
  const onPanGestureEvent = (event: any) => {
    if (!chartData) return;

    const chartWidth = SCREEN_WIDTH - CHART_PADDING_LEFT - CHART_PADDING_RIGHT;
    const scaledWidth = chartWidth * scale;

    // Calculate max translation to prevent chart from going beyond boundaries
    const maxTranslate = Math.max(0, (scaledWidth - chartWidth) / 2);

    // Constrain translation to keep chart within bounds
    const newTranslateX = Math.max(
      -maxTranslate,
      Math.min(maxTranslate, lastTranslateX + event.nativeEvent.translationX)
    );
    setTranslateX(newTranslateX);
  };

  const onPanHandlerStateChange = (event: any) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      setLastTranslateX(translateX);
    }
  };

  // Create the chart path with interactive transformations
  const createPath = () => {
    if (!chartData || chartData.prices.length === 0) return "";

    const prices = chartData.prices.map((p) => p.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice;

    const chartWidth = SCREEN_WIDTH - CHART_PADDING_LEFT - CHART_PADDING_RIGHT;
    const chartHeight = CHART_HEIGHT - CHART_PADDING_TOP - CHART_PADDING_BOTTOM;
    const xScale = chartWidth / (chartData.prices.length - 1);
    const yScale = chartHeight / (priceRange || 1);

    let path = "";
    chartData.prices.forEach((point, i) => {
      const x = i * xScale;
      const y = (maxPrice - point.price) * yScale;

      if (i === 0) {
        path += `M ${x} ${y}`;
      } else {
        path += ` L ${x} ${y}`;
      }
    });

    return path;
  };

  // Create horizontal grid lines
  const createGridLines = () => {
    if (!chartData) return [];

    const prices = chartData.prices.map((p) => p.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice;

    const lines = [];
    for (let i = 0; i <= 5; i++) {
      const price = minPrice + (priceRange * i) / 5;
      const chartHeight =
        CHART_HEIGHT - CHART_PADDING_TOP - CHART_PADDING_BOTTOM;
      const y =
        CHART_PADDING_TOP + ((maxPrice - price) / priceRange) * chartHeight;

      lines.push({
        y,
        price,
      });
    }

    return lines;
  };

  // Handle time range selection
  const handleTimeRangeSelect = (range: TimeRange) => {
    changeTimeRange(range);
  };

  // Render the time range selector
  const renderTimeRangeSelector = () => {
    return (
      <View style={styles.timeRangeContainer}>
        {TIME_RANGES.map((range) => (
          <Pressable
            key={range}
            style={[
              styles.timeRangeButton,
              selectedTimeRange === range && styles.selectedTimeRangeButton,
            ]}
            onPress={() => handleTimeRangeSelect(range)}
          >
            <Text
              style={[
                styles.timeRangeText,
                selectedTimeRange === range && styles.selectedTimeRangeText,
              ]}
            >
              {range}
            </Text>
          </Pressable>
        ))}
      </View>
    );
  };

  // Render the last point on the chart
  const renderLastPoint = () => {
    if (!chartData || chartData.prices.length === 0) return null;

    const prices = chartData.prices.map((p) => p.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice;

    const chartWidth = SCREEN_WIDTH - CHART_PADDING_LEFT - CHART_PADDING_RIGHT;
    const chartHeight = CHART_HEIGHT - CHART_PADDING_TOP - CHART_PADDING_BOTTOM;
    const xScale = chartWidth / (chartData.prices.length - 1);
    const yScale = chartHeight / (priceRange || 1);

    const lastPoint = chartData.prices[chartData.prices.length - 1];
    const x = (chartData.prices.length - 1) * xScale;
    const y = (maxPrice - lastPoint.price) * yScale;

    return (
      <Circle
        cx={x}
        cy={y}
        r={4}
        fill={Colors.chart.line}
        stroke={Colors.background.primary}
        strokeWidth={2}
      />
    );
  };

  // Render grid lines with price labels
  const renderGridLines = () => {
    const gridLines = createGridLines();

    return (
      <View style={styles.gridContainer}>
        <Svg height={CHART_HEIGHT} width={SCREEN_WIDTH} style={styles.gridSvg}>
          {gridLines.map((line, index) => (
            <Line
              key={index}
              x1={CHART_PADDING_LEFT}
              y1={line.y}
              x2={SCREEN_WIDTH - CHART_PADDING_RIGHT}
              y2={line.y}
              stroke={Colors.chart.grid}
              strokeWidth={1}
              strokeDasharray="5,5"
            />
          ))}
        </Svg>
        {gridLines.map((line, index) => (
          <Text
            key={`label-${index}`}
            style={[styles.gridLineText, { top: line.y - 8 }]}
          >
            ${formatPrice(line.price)}
          </Text>
        ))}
      </View>
    );
  };

  // Render zoom controls
  const renderZoomControls = () => {
    return (
      <View style={styles.zoomControls}>
        <Pressable
          style={styles.zoomButton}
          onPress={() => {
            const newScale = Math.max(0.5, scale - 0.2);
            setScale(newScale);
            setLastScale(newScale);
          }}
        >
          <Text style={styles.zoomButtonText}>-</Text>
        </Pressable>
        <Text style={styles.zoomText}>{scale.toFixed(1)}x</Text>
        <Pressable
          style={styles.zoomButton}
          onPress={() => {
            const newScale = Math.min(5, scale + 0.2);
            setScale(newScale);
            setLastScale(newScale);
          }}
        >
          <Text style={styles.zoomButtonText}>+</Text>
        </Pressable>
      </View>
    );
  };

  if (isLoading || !chartData) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading chart...</Text>
      </View>
    );
  }

  const chartWidth = SCREEN_WIDTH - CHART_PADDING_LEFT - CHART_PADDING_RIGHT;
  const chartHeight = CHART_HEIGHT - CHART_PADDING_TOP - CHART_PADDING_BOTTOM;

  return (
    <View style={styles.container}>
      <View style={styles.chartContainer}>
        {renderGridLines()}
        <View style={[styles.interactiveArea, { left: CHART_PADDING_LEFT }]}>
          <PinchGestureHandler
            ref={pinchRef}
            onGestureEvent={onPinchGestureEvent}
            onHandlerStateChange={onPinchHandlerStateChange}
            simultaneousHandlers={panRef}
          >
            <PanGestureHandler
              ref={panRef}
              onGestureEvent={onPanGestureEvent}
              onHandlerStateChange={onPanHandlerStateChange}
              simultaneousHandlers={pinchRef}
              minPointers={1}
              maxPointers={1}
            >
              <View style={styles.svgContainer}>
                <Svg
                  height={CHART_HEIGHT}
                  width={chartWidth}
                  style={styles.chartSvg}
                >
                  <Defs>
                    <ClipPath id="chartClip">
                      <Rect
                        x={0}
                        y={CHART_PADDING_TOP}
                        width={chartWidth}
                        height={chartHeight}
                      />
                    </ClipPath>
                  </Defs>

                  {/* Chart path with scaling and translation */}
                  <Path
                    d={createPath()}
                    stroke={Colors.chart.line}
                    strokeWidth={2}
                    fill="none"
                    clipPath="url(#chartClip)"
                    transform={`translate(${translateX}, ${CHART_PADDING_TOP}) scale(${scale}, 1)`}
                  />

                  {/* Last point with scaling and translation */}
                  <Circle
                    cx={
                      (chartData.prices.length - 1) *
                      (chartWidth / (chartData.prices.length - 1))
                    }
                    cy={
                      CHART_PADDING_TOP +
                      ((Math.max(...chartData.prices.map((p) => p.price)) -
                        chartData.prices[chartData.prices.length - 1].price) /
                        (Math.max(...chartData.prices.map((p) => p.price)) -
                          Math.min(...chartData.prices.map((p) => p.price)))) *
                        chartHeight
                    }
                    r={4}
                    fill={Colors.chart.line}
                    stroke={Colors.background.primary}
                    strokeWidth={2}
                    clipPath="url(#chartClip)"
                    transform={`translate(${translateX}, 0) scale(${scale}, 1)`}
                  />
                </Svg>
              </View>
            </PanGestureHandler>
          </PinchGestureHandler>
        </View>
        {renderZoomControls()}
      </View>
      {renderTimeRangeSelector()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background.primary,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
  },
  chartContainer: {
    height: CHART_HEIGHT,
    width: "100%",
    position: "relative",
  },
  gridContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gridSvg: {
    position: "absolute",
  },
  interactiveArea: {
    position: "absolute",
    top: 0,
    width: SCREEN_WIDTH - CHART_PADDING_LEFT - CHART_PADDING_RIGHT,
    height: CHART_HEIGHT,
  },
  svgContainer: {
    flex: 1,
  },
  chartSvg: {
    position: "absolute",
  },
  loadingText: {
    color: Colors.text.primary,
    textAlign: "center",
    padding: 20,
  },
  timeRangeContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  timeRangeButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    backgroundColor: Colors.button.unselected,
  },
  selectedTimeRangeButton: {
    backgroundColor: Colors.button.selected,
  },
  timeRangeText: {
    color: Colors.text.secondary,
    fontSize: 12,
    fontWeight: "600" as const,
  },
  selectedTimeRangeText: {
    color: Colors.text.primary,
  },
  gridLineText: {
    position: "absolute",
    left: 8,
    color: Colors.text.secondary,
    fontSize: 11,
    fontWeight: "500" as const,
    backgroundColor: Colors.background.primary,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 2,
  },
  zoomControls: {
    position: "absolute",
    top: 10,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background.secondary,
    borderRadius: 8,
    padding: 4,
  },
  zoomButton: {
    width: 28,
    height: 28,
    borderRadius: 4,
    backgroundColor: Colors.button.secondary,
    justifyContent: "center",
    alignItems: "center",
  },
  zoomButtonText: {
    color: Colors.text.primary,
    fontSize: 16,
    fontWeight: "bold" as const,
  },
  zoomText: {
    color: Colors.text.primary,
    fontSize: 12,
    marginHorizontal: 8,
    minWidth: 30,
    textAlign: "center",
  },
});
