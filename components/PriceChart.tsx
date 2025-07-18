import React, { useEffect, useMemo } from "react";
import { View, StyleSheet, Dimensions, Text, Pressable } from "react-native";
import Svg, {
  Line,
  Path,
  Circle,
  Defs,
  ClipPath,
  Rect,
} from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  runOnJS,
  withSpring,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";
import {
  PanGestureHandler,
  PinchGestureHandler,
  State,
  PinchGestureHandlerGestureEvent,
  PanGestureHandlerGestureEvent,
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

// Constants for better performance
const MIN_SCALE = 0.5;
const MAX_SCALE = 5;
const SCALE_STEP = 0.2;

// Context types for gesture handlers
interface PinchContext extends Record<string, unknown> {
  startScale: number;
}

interface PanContext extends Record<string, unknown> {
  startTranslateX: number;
}

export default function PriceChart() {
  const { data: chartData, isLoading } = useChartData();
  const { selectedTimeRange, changeTimeRange } = useTradingStore();

  // Shared values for smooth animations
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const focalX = useSharedValue(0);
  const focalY = useSharedValue(0);

  // Chart dimensions
  const chartWidth = SCREEN_WIDTH - CHART_PADDING_LEFT - CHART_PADDING_RIGHT;
  const chartHeight = CHART_HEIGHT - CHART_PADDING_TOP - CHART_PADDING_BOTTOM;

  // Reset values when data changes
  useEffect(() => {
    scale.value = withSpring(1);
    translateX.value = withSpring(0);
    focalX.value = 0;
    focalY.value = 0;
  }, [chartData, selectedTimeRange]);

  // Memoized chart calculations for better performance
  const chartCalculations = useMemo(() => {
    if (!chartData || chartData.prices.length === 0) {
      return {
        path: "",
        gridLines: [],
        minPrice: 0,
        maxPrice: 0,
        priceRange: 0,
        points: [],
      };
    }

    const prices = chartData.prices.map((p) => p.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice || 1; // Prevent division by zero

    // Add some padding to the price range for better visualization
    const paddedRange = priceRange * 1.1;
    const paddedMin = minPrice - (paddedRange - priceRange) / 2;
    const paddedMax = maxPrice + (paddedRange - priceRange) / 2;

    const xScale = chartWidth / Math.max(1, chartData.prices.length - 1);
    const yScale = chartHeight / paddedRange;

    // Create path and store points for reference
    let path = "";
    const points: Array<{ x: number; y: number; price: number }> = [];
    
    chartData.prices.forEach((point, i) => {
      const x = i * xScale;
      const y = ((paddedMax - point.price) / paddedRange) * chartHeight;

      points.push({ x, y, price: point.price });

      if (i === 0) {
        path += `M ${x} ${y}`;
      } else {
        path += ` L ${x} ${y}`;
      }
    });

    // Create grid lines with better spacing
    const gridLines = [];
    const gridCount = 6;
    for (let i = 0; i <= gridCount; i++) {
      const price = paddedMin + (paddedRange * i) / gridCount;
      const y = CHART_PADDING_TOP + (i / gridCount) * chartHeight;
      gridLines.push({ y, price });
    }

    return { 
      path, 
      gridLines, 
      minPrice: paddedMin, 
      maxPrice: paddedMax, 
      priceRange: paddedRange,
      points 
    };
  }, [chartData, chartWidth, chartHeight]);

  // Pinch gesture handler for zoom
  const pinchGestureHandler = useAnimatedGestureHandler<
    PinchGestureHandlerGestureEvent,
    PinchContext
  >({
    onStart: (event, context) => {
      context.startScale = scale.value;
      focalX.value = event.focalX;
      focalY.value = event.focalY;
    },
    onActive: (event, context) => {
      const newScale = Math.max(
        MIN_SCALE,
        Math.min(MAX_SCALE, context.startScale * event.scale)
      );
      scale.value = newScale;
    },
    onEnd: () => {
      // Smooth spring animation when gesture ends
      scale.value = withSpring(scale.value);
    },
  });

  // Pan gesture handler for horizontal scrolling
  const panGestureHandler = useAnimatedGestureHandler<
    PanGestureHandlerGestureEvent,
    PanContext
  >({
    onStart: (event, context) => {
      context.startTranslateX = translateX.value;
    },
    onActive: (event, context) => {
      const scaledWidth = chartWidth * scale.value;
      const maxTranslate = Math.max(0, (scaledWidth - chartWidth) / 2);

      const newTranslateX = Math.max(
        -maxTranslate,
        Math.min(maxTranslate, context.startTranslateX + event.translationX)
      );
      translateX.value = newTranslateX;
    },
    onEnd: () => {
      // Smooth spring animation when gesture ends
      translateX.value = withSpring(translateX.value);
    },
  });

  // Animated style for the chart container
  const animatedChartStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }, { scale: scale.value }],
    };
  });

  // Animated style for zoom indicator
  const animatedZoomStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scale.value,
      [1, 2],
      [0.7, 1],
      Extrapolate.CLAMP
    );

    return {
      opacity,
      transform: [
        {
          scale: withSpring(scale.value > 1 ? 1.1 : 1),
        },
      ],
    };
  });

  // Handle time range selection
  const handleTimeRangeSelect = (range: TimeRange) => {
    changeTimeRange(range);
  };

  // Handle zoom controls
  const handleZoomIn = () => {
    "worklet";
    const newScale = Math.min(MAX_SCALE, scale.value + SCALE_STEP);
    scale.value = withSpring(newScale);
  };

  const handleZoomOut = () => {
    "worklet";
    const newScale = Math.max(MIN_SCALE, scale.value - SCALE_STEP);
    scale.value = withSpring(newScale);
  };

  const handleResetZoom = () => {
    "worklet";
    scale.value = withSpring(1);
    translateX.value = withSpring(0);
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

  // Render grid lines with price labels
  const renderGridLines = () => {
    return (
      <View style={styles.gridContainer}>
        <Svg height={CHART_HEIGHT} width={SCREEN_WIDTH} style={styles.gridSvg}>
          {chartCalculations.gridLines.map((line, index) => (
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
        {chartCalculations.gridLines.map((line, index) => (
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

  // Render zoom controls with animations
  const renderZoomControls = () => {
    return (
      <Animated.View style={[styles.zoomControls, animatedZoomStyle]}>
        <Pressable
          style={styles.zoomButton}
          onPress={() => runOnJS(handleZoomOut)()}
        >
          <Text style={styles.zoomButtonText}>-</Text>
        </Pressable>

        <Pressable
          style={styles.resetButton}
          onPress={() => runOnJS(handleResetZoom)()}
        >
          <Text style={styles.resetButtonText}>Reset</Text>
        </Pressable>

        <Pressable
          style={styles.zoomButton}
          onPress={() => runOnJS(handleZoomIn)()}
        >
          <Text style={styles.zoomButtonText}>+</Text>
        </Pressable>
      </Animated.View>
    );
  };

  // Render last point with animation
  const renderLastPoint = () => {
    if (!chartData || chartData.prices.length === 0 || !chartCalculations.points.length) return null;

    const lastPoint = chartCalculations.points[chartCalculations.points.length - 1];

    return (
      <Circle
        cx={lastPoint.x}
        cy={lastPoint.y}
        r={4}
        fill={Colors.chart.line}
        stroke={Colors.background.primary}
        strokeWidth={2}
      />
    );
  };

  if (isLoading || !chartData) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading chart...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.chartContainer}>
        {renderGridLines()}

        <View style={[styles.interactiveArea, { left: CHART_PADDING_LEFT }]}>
          <PinchGestureHandler onGestureEvent={pinchGestureHandler}>
            <Animated.View style={styles.gestureContainer}>
              <PanGestureHandler
                onGestureEvent={panGestureHandler}
                minPointers={1}
                maxPointers={1}
              >
                <Animated.View style={styles.svgContainer}>
                  <Animated.View style={animatedChartStyle}>
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
                        <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor={Colors.chart.line} stopOpacity="0.3" />
                          <stop offset="100%" stopColor={Colors.chart.line} stopOpacity="0.05" />
                        </linearGradient>
                      </Defs>

                      {/* Chart area fill */}
                      {chartCalculations.path && (
                        <Path
                          d={`${chartCalculations.path} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`}
                          fill="url(#chartGradient)"
                          clipPath="url(#chartClip)"
                          transform={`translate(0, ${CHART_PADDING_TOP})`}
                        />
                      )}

                      {/* Chart path */}
                      <Path
                        d={chartCalculations.path}
                        stroke={Colors.chart.line}
                        strokeWidth={2}
                        fill="none"
                        clipPath="url(#chartClip)"
                        transform={`translate(0, ${CHART_PADDING_TOP})`}
                      />

                      {/* Last point */}
                      <g transform={`translate(0, ${CHART_PADDING_TOP})`}>
                        {renderLastPoint()}
                      </g>
                    </Svg>
                  </Animated.View>
                </Animated.View>
              </PanGestureHandler>
            </Animated.View>
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
  gestureContainer: {
    flex: 1,
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
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  zoomButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: Colors.button.secondary,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 2,
  },
  zoomButtonText: {
    color: Colors.text.primary,
    fontSize: 18,
    fontWeight: "bold" as const,
  },
  resetButton: {
    paddingHorizontal: 12,
    height: 32,
    borderRadius: 6,
    backgroundColor: Colors.button.primary,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 4,
  },
  resetButtonText: {
    color: Colors.text.primary,
    fontSize: 12,
    fontWeight: "600" as const,
  },
});
