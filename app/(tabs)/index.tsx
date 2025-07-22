import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { BlurView } from 'expo-blur';
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  interpolate,
  Easing,
  AnimatedStyle,
} from 'react-native-reanimated';
import Animated from 'react-native-reanimated';
import { Home, Send, LayoutGrid } from 'lucide-react-native';
import { useRouter, Href } from 'expo-router';
import { useFluidCursorTrail } from '@/hooks/useFluidCursorTrail';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Main Screen Component
export default function HomeScreen() {
  const router = useRouter();
  const transitionProgress = useSharedValue(0);

  const { panResponder } = useFluidCursorTrail();

  const triggerWipeTransition = (callback: () => void) => {
    transitionProgress.value = withTiming(
      1,
      {
        duration: 600,
        easing: Easing.bezier(0.3, 0, 0.3, 1),
      },
      (finished) => {
        if (finished) {
          runOnJS(callback)();
          transitionProgress.value = withTiming(0, { duration: 10 });
        }
      }
    );
  };

  const handleNavigation = <T extends Href>(path: T) => {
    triggerWipeTransition(() => router.push(path));
  };

  const curtainWipeStyle = useAnimatedStyle(() => {
    const height = interpolate(
      transitionProgress.value,
      [0, 1],
      [0, SCREEN_HEIGHT]
    );
    return {
      height,
    };
  });

  return (
    <ImageBackground
      source={require('../../assets/images/image-1.jpg')}
      style={styles.screenContainer}
      {...panResponder.panHandlers}
    >
      <StatusBar style="light" />
      <View style={styles.overlay}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Genie</Text>
          <TouchableOpacity onPress={() => handleNavigation('/profile')}>
            <Home size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* --- START: PLAYLIST CARD UI IS NOW DIRECTLY INCLUDED --- */}
        <BlurView
          intensity={25}
          tint="dark"
          style={[styles.card, styles.playlistCard]}
        >
          <BlurView intensity={50} tint="light" style={styles.playlistIcon} />
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardTitle}>Daily Playlist</Text>
            <Text style={styles.cardSubtitle}>Songs you might like</Text>
          </View>
          {/* The onPress handler now calls handleNavigation directly without passing props */}
          <TouchableOpacity
            style={styles.viewButton}
            onPress={() => handleNavigation('/profile')}
          >
            <Text style={styles.viewButtonText}>View</Text>
          </TouchableOpacity>
        </BlurView>
        {/* --- END: PLAYLIST CARD UI --- */}

        <View style={styles.footer}>
          <TouchableOpacity>
            <Send size={24} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity>
            <LayoutGrid size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      <WipeTransitionOverlay curtainWipeStyle={curtainWipeStyle} />
    </ImageBackground>
  );
}

// --- Prop Types ---
interface WipeTransitionOverlayProps {
  curtainWipeStyle: AnimatedStyle<StyleProp<ViewStyle>>;
}

// --- Transition Component ---
const WipeTransitionOverlay: React.FC<WipeTransitionOverlayProps> = ({
  curtainWipeStyle,
}) => (
  <Animated.View
    style={[styles.wipeContainer, curtainWipeStyle]}
    pointerEvents="none"
  >
    <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
  </Animated.View>
);

// --- Styles ---
const styles = StyleSheet.create({
  screenContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.15)',
    paddingTop: 60,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    fontFamily: 'Inter-Bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    marginBottom: 20,
  },
  card: {
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  cardTitle: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },
  cardSubtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    marginTop: 2,
  },
  playlistCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    alignSelf: 'center',
    marginBottom: 80,
  },
  playlistIcon: {
    width: 44,
    height: 44,
    borderRadius: 8,
  },
  viewButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  viewButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  wipeContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    zIndex: 1000,
  },
});
