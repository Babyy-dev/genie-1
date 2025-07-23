import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Image,
  Dimensions,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { BlurView } from 'expo-blur';
import { useAnimatedStyle, AnimatedStyle } from 'react-native-reanimated';
import Animated from 'react-native-reanimated';
import { Home, Navigation, Star, Send, LayoutGrid } from 'lucide-react-native';
import { useFluidCursorTrail } from '@/hooks/useFluidCursorTrail';

// Main Home Screen Component
export default function HomeScreen() {
  const {
    isTrailActive,
    cursorX,
    cursorY,
    isStretching,
    trailElements,
    panResponder,
  } = useFluidCursorTrail();

  // Animated style for the main cursor blob
  const mainCursorStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: cursorX.value - 25 },
        { translateY: cursorY.value - 25 },
        { scale: isStretching.value },
      ],
      opacity: isTrailActive ? 1 : 0,
    };
  });

  // Animated styles for the trailing elements
  const getTrailStyle = (index: number) =>
    useAnimatedStyle(() => {
      const element = trailElements[index];
      const baseScale = 1 - index * 0.1;
      return {
        transform: [
          { translateX: element.x.value - 20 },
          { translateY: element.y.value - 20 },
          { scale: element.scale.value * baseScale },
        ],
        opacity: element.opacity.value,
      };
    });

  return (
    <ImageBackground
      source={require('@/assets/images/image-2.png')}
      style={styles.screenContainer}
      {...panResponder.panHandlers} // This makes the whole screen interactive
    >
      <StatusBar style="light" />
      <View style={styles.overlay}>
        {/* === UPPER UI PART === */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Genie</Text>
          <TouchableOpacity>
            <Home size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* === MAIN CONTENT AREA === */}
        <View style={styles.content}>
          <NotificationCard />
          <BottomContent />
        </View>

        {/* === BOTTOM CORNER ICONS === */}
        <View style={styles.footer}>
          <TouchableOpacity>
            <Send size={24} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity>
            <LayoutGrid size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* === THE FLUID EFFECT OVERLAY === */}
      {isTrailActive && (
        <FluidCursorOverlay
          mainCursorStyle={mainCursorStyle}
          trailElements={trailElements.map((_, index) => getTrailStyle(index))}
        />
      )}
    </ImageBackground>
  );
}

// --- UI Components ---
const NotificationCard = () => (
  <BlurView
    intensity={25}
    tint="dark"
    style={[styles.card, styles.notificationCard]}
  >
    <Image
      source={{
        uri: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100',
      }}
      style={styles.profileImage}
    />
    <View style={styles.cardTextContainer}>
      <Text style={styles.cardTitleSm}>Sam</Text>
      <Text style={styles.cardSubtitle}>Shared a portal with you</Text>
    </View>
    <TouchableOpacity style={styles.replyButton}>
      <Text style={styles.replyButtonText}>Reply</Text>
    </TouchableOpacity>
  </BlurView>
);

const BottomContent = () => (
  <View style={styles.bottomContentContainer}>
    <Text style={styles.messageTitle}>Sam Messaged</Text>
    <View style={styles.ratingContainer}>
      <Star size={16} color="#FFD700" fill="#FFD700" />
      <Text style={styles.ratingText}>4.5</Text>
    </View>
    <TouchableOpacity style={styles.directionsButton}>
      <Navigation size={16} color="#333" />
      <Text style={styles.directionsText}>Directions</Text>
    </TouchableOpacity>
  </View>
);

// --- Prop Types for the Effect Component ---
interface FluidCursorOverlayProps {
  mainCursorStyle: AnimatedStyle<StyleProp<ViewStyle>>;
  trailElements: AnimatedStyle<StyleProp<ViewStyle>>[];
}

// --- Fluid Cursor Effect Component ---
const FluidCursorOverlay: React.FC<FluidCursorOverlayProps> = ({
  mainCursorStyle,
  trailElements,
}) => (
  <View style={styles.cursorContainer} pointerEvents="none">
    {trailElements.map((style, index) => (
      <Animated.View
        key={`trail-${index}`}
        style={[styles.trailElement, style]}
      >
        <BlurView
          intensity={20 + index * 3}
          tint={index % 2 === 0 ? 'light' : 'prominent'}
          style={styles.trailBlur}
        />
      </Animated.View>
    ))}
    <Animated.View style={[styles.mainCursor, mainCursorStyle]}>
      <BlurView intensity={30} tint="prominent" style={styles.cursorBlur} />
    </Animated.View>
  </View>
);

// --- Styles ---
const styles = StyleSheet.create({
  screenContainer: { flex: 1 },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.15)',
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    alignItems: 'center',
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    fontFamily: 'Inter-Bold',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    paddingBottom: 60,
  },
  card: {
    marginHorizontal: 20,
    borderRadius: 99, // Pill shape
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  cardTitleSm: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  cardSubtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    marginTop: 2,
  },
  notificationCard: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingLeft: 8,
    paddingRight: 16,
  },
  profileImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  replyButton: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  replyButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomContentContainer: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  messageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  ratingText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 4,
    fontWeight: '600',
  },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  directionsText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  cursorContainer: { ...StyleSheet.absoluteFillObject, zIndex: 999 },
  mainCursor: { position: 'absolute', width: 50, height: 50, borderRadius: 25 },
  cursorBlur: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  trailElement: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  trailBlur: { width: '100%', height: '100%', borderRadius: 20 },
});
