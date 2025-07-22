// hooks/useFluidCursorTrail.ts
import { useState } from 'react';
import { PanResponder, Dimensions } from 'react-native';
import {
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const useFluidCursorTrail = () => {
  const [isTrailActive, setIsTrailActive] = useState(false);
  const cursorX = useSharedValue(SCREEN_WIDTH / 2);
  const cursorY = useSharedValue(SCREEN_HEIGHT / 2);
  const isStretching = useSharedValue(0);

  const trailElements = Array.from({ length: 8 }, () => ({
    x: useSharedValue(SCREEN_WIDTH / 2),
    y: useSharedValue(SCREEN_HEIGHT / 2),
    scale: useSharedValue(0),
    opacity: useSharedValue(0),
  }));

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      runOnJS(setIsTrailActive)(true);
      const { locationX, locationY } = evt.nativeEvent;
      cursorX.value = locationX;
      cursorY.value = locationY;
      trailElements.forEach((element, index) => {
        element.scale.value = withSpring(1, { damping: 15, stiffness: 200 });
        element.opacity.value = withTiming(0.8 - index * 0.08, {
          duration: 100 + index * 50,
        });
      });
      isStretching.value = withSpring(1, { damping: 12, stiffness: 300 });
    },
    onPanResponderMove: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      cursorX.value = locationX;
      cursorY.value = locationY;
      trailElements.forEach((element, index) => {
        const delay = (index + 1) * 50;
        const tension = 80 - index * 8;
        const friction = 6 + index * 2;
        setTimeout(() => {
          element.x.value = withSpring(locationX, {
            damping: friction,
            stiffness: tension,
          });
          element.y.value = withSpring(locationY, {
            damping: friction,
            stiffness: tension,
          });
        }, delay);
      });
      isStretching.value = withSpring(1.3, { damping: 8, stiffness: 400 });
      setTimeout(() => {
        isStretching.value = withSpring(1, { damping: 12, stiffness: 300 });
      }, 100);
    },
    onPanResponderRelease: () => {
      trailElements.forEach((element, index) => {
        element.scale.value = withTiming(0, { duration: 200 + index * 30 });
        element.opacity.value = withTiming(0, { duration: 200 + index * 30 });
      });
      isStretching.value = withSpring(0, { damping: 15, stiffness: 200 });
      setTimeout(() => {
        runOnJS(setIsTrailActive)(false);
      }, 500);
    },
  });

  return {
    isTrailActive,
    cursorX,
    cursorY,
    isStretching,
    trailElements,
    panResponder,
  };
};
