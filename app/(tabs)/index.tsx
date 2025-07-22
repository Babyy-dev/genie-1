import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  PanResponder,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { BlurView } from 'expo-blur';
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import Animated from 'react-native-reanimated';
import { Chrome as Home, MoveHorizontal as MoreHorizontal, Navigation, Star, ArrowLeft } from 'lucide-react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function HomeScreen() {
  const [showSecondScreen, setShowSecondScreen] = useState(false);
  const [showNotification, setShowNotification] = useState(true);
  
  // Frosted Glass Wipe Transition
  const wipeProgress = useSharedValue(0);
  
  // Fluid Cursor Trail states
  const [isTrailActive, setIsTrailActive] = useState(false);
  const cursorX = useSharedValue(SCREEN_WIDTH / 2);
  const cursorY = useSharedValue(SCREEN_HEIGHT / 2);
  const isStretching = useSharedValue(0);
  
  // Trail elements with individual positions
  const trailElements = Array.from({ length: 8 }, (_, index) => ({
    x: useSharedValue(SCREEN_WIDTH / 2),
    y: useSharedValue(SCREEN_HEIGHT / 2),
    scale: useSharedValue(0),
    opacity: useSharedValue(0),
  }));

  // Pan responder for fluid cursor trail
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      setIsTrailActive(true);
      const { locationX, locationY } = evt.nativeEvent;
      cursorX.value = locationX;
      cursorY.value = locationY;
      
      // Activate trail elements with stagger
      trailElements.forEach((element, index) => {
        element.scale.value = withSpring(1, { damping: 15, stiffness: 200 });
        element.opacity.value = withTiming(0.8 - (index * 0.08), { duration: 100 + (index * 50) });
      });
      
      // Stretch effect
      isStretching.value = withSpring(1, { damping: 12, stiffness: 300 });
    },
    onPanResponderMove: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      cursorX.value = locationX;
      cursorY.value = locationY;
      
      // Update trail elements with fluid delay
      trailElements.forEach((element, index) => {
        const delay = (index + 1) * 50;
        const tension = 80 - (index * 8);
        const friction = 6 + (index * 2);
        
        setTimeout(() => {
          element.x.value = withSpring(locationX, { damping: friction, stiffness: tension });
          element.y.value = withSpring(locationY, { damping: friction, stiffness: tension });
        }, delay);
      });
      
      // Gooey stretch animation
      isStretching.value = withSpring(1.3, { damping: 8, stiffness: 400 });
      setTimeout(() => {
        isStretching.value = withSpring(1, { damping: 12, stiffness: 300 });
      }, 100);
    },
    onPanResponderRelease: () => {
      // Hide trail with reverse stagger
      trailElements.forEach((element, index) => {
        element.scale.value = withTiming(0, { duration: 200 + (index * 30) });
        element.opacity.value = withTiming(0, { duration: 200 + (index * 30) });
      });
      
      isStretching.value = withSpring(0, { damping: 15, stiffness: 200 });
      
      setTimeout(() => {
        setIsTrailActive(false);
      }, 500);
    },
  });

  const triggerWipeTransition = (callback: () => void) => {
    wipeProgress.value = withTiming(1, { duration: 800 }, (finished) => {
      if (finished) {
        runOnJS(callback)();
        wipeProgress.value = withTiming(0, { duration: 100 });
      }
    });
  };

  const handleHomePress = () => {
    triggerWipeTransition(() => setShowSecondScreen(true));
  };

  const handleBackPress = () => {
    triggerWipeTransition(() => setShowSecondScreen(false));
  };

  const handleReplyPress = () => {
    triggerWipeTransition(() => {
      // Handle reply action - could navigate to chat screen
      console.log('Reply pressed with wipe transition');
    });
  };

  const handleDirectionsPress = () => {
    triggerWipeTransition(() => {
      // Handle directions action - could open maps
      console.log('Directions pressed with wipe transition');
    });
  };

  const handleNavPress = (action: string) => {
    triggerWipeTransition(() => {
      console.log(`${action} pressed with wipe transition`);
    });
  };

  // Animated styles for wipe transition
  const wipeAnimatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      wipeProgress.value,
      [0, 1],
      [-SCREEN_WIDTH, SCREEN_WIDTH],
      Extrapolate.CLAMP
    );
    
    return {
      transform: [{ translateX }],
      opacity: wipeProgress.value > 0 ? 1 : 0,
    };
  });

  // Main cursor animated style
  const mainCursorStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      isStretching.value,
      [0, 1, 1.3],
      [0, 1, 1.3],
      Extrapolate.CLAMP
    );
    
    return {
      transform: [
        { translateX: cursorX.value - 25 },
        { translateY: cursorY.value - 25 },
        { scale },
      ],
      opacity: isTrailActive ? 1 : 0,
    };
  });

  // Trail elements animated styles
  const getTrailStyle = (index: number) => {
    return useAnimatedStyle(() => {
      const element = trailElements[index];
      const baseScale = 1 - (index * 0.1);
      
      return {
        transform: [
          { translateX: element.x.value - 20 },
          { translateY: element.y.value - 20 },
          { scale: element.scale.value * baseScale },
          { rotate: `${index * 15}deg` },
        ],
        opacity: element.opacity.value,
      };
    });
  };

  if (showSecondScreen) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        
        {/* Background */}
        <Image
          source={{
            uri: 'https://images.pexels.com/photos/1287145/pexels-photo-1287145.jpeg?auto=compress&cs=tinysrgb&w=400'
          }}
          style={styles.backgroundImage}
        />
        <View style={styles.backgroundOverlay} />
        
        {/* Frosted Glass Wipe Transition */}
        <Animated.View style={[styles.wipeTransition, wipeAnimatedStyle]} pointerEvents="none">
          <BlurView intensity={15} tint="light" style={styles.wipeLayer1}>
            <View style={styles.wipeGradient1} />
          </BlurView>
          <BlurView intensity={25} tint="systemMaterial" style={styles.wipeLayer2}>
            <View style={styles.wipeGradient2} />
          </BlurView>
          <BlurView intensity={35} tint="prominent" style={styles.wipeLayer3}>
            <View style={styles.wipeGradient3} />
          </BlurView>
        </Animated.View>
        
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
              <ArrowLeft size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Explore</Text>
            <View style={styles.headerSpacer} />
          </View>
          
          {/* Content */}
          <View style={styles.secondScreenContent}>
            <Text style={styles.secondScreenTitle}>Welcome to the Second Screen!</Text>
            <Text style={styles.secondScreenText}>
              This screen was accessed with a beautiful frosted glass wipe transition.
            </Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <StatusBar style="light" />
      
      {/* Background Image */}
      <Image
        source={{
          uri: 'https://images.pexels.com/photos/1287145/pexels-photo-1287145.jpeg?auto=compress&cs=tinysrgb&w=400'
        }}
        style={styles.backgroundImage}
      />
      <View style={styles.backgroundOverlay} />
      
      {/* Frosted Glass Wipe Transition */}
      <Animated.View style={[styles.wipeTransition, wipeAnimatedStyle]} pointerEvents="none">
        <BlurView intensity={15} tint="light" style={styles.wipeLayer1}>
          <View style={styles.wipeGradient1} />
        </BlurView>
        <BlurView intensity={25} tint="systemMaterial" style={styles.wipeLayer2}>
          <View style={styles.wipeGradient2} />
        </BlurView>
        <BlurView intensity={35} tint="prominent" style={styles.wipeLayer3}>
          <View style={styles.wipeGradient3} />
        </BlurView>
      </Animated.View>
      
      {/* Fluid Cursor Trail */}
      {isTrailActive && (
        <View style={styles.cursorContainer} pointerEvents="none">
          {/* Trail Elements */}
          {trailElements.map((_, index) => (
            <Animated.View key={`trail-${index}`} style={[styles.trailElement, getTrailStyle(index)]}>
              <BlurView intensity={15 + index * 2} tint={index % 3 === 0 ? 'light' : index % 3 === 1 ? 'systemMaterial' : 'prominent'} style={styles.trailBlur}>
                <View style={[styles.trailGradient, { backgroundColor: `rgba(${100 + index * 20}, ${150 + index * 10}, 255, ${0.3 - index * 0.02})` }]} />
              </BlurView>
            </Animated.View>
          ))}
          
          {/* Main Cursor */}
          <Animated.View style={[styles.mainCursor, mainCursorStyle]}>
            <BlurView intensity={25} tint="prominent" style={styles.cursorBlur}>
              <View style={styles.cursorGradient} />
            </BlurView>
          </Animated.View>
          
          {/* Gooey Effect Indicator */}
          <Animated.View style={[styles.gooeyIndicator, mainCursorStyle]}>
            <Text style={styles.gooeyText}>Gooey</Text>
          </Animated.View>
        </View>
      )}
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Top Header */}
        <View style={styles.topHeader}>
          <Text style={styles.genieTitle}>Genie</Text>
          <TouchableOpacity onPress={handleHomePress} style={styles.homeButton}>
            <Home size={20} color="white" />
          </TouchableOpacity>
        </View>
        
        {/* Notification Card */}
        {showNotification && (
          <BlurView intensity={20} tint="dark" style={styles.notificationCard}>
            <View style={styles.notificationContent}>
              <Image
                source={{
                  uri: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100'
                }}
                style={styles.profileImage}
              />
              <View style={styles.notificationText}>
                <Text style={styles.notificationName}>Sam</Text>
                <Text style={styles.notificationMessage}>Shared a portal with you</Text>
              </View>
              <TouchableOpacity style={styles.replyButton}>
                <Text style={styles.replyText}>Reply</Text>
              </TouchableOpacity>
            </View>
          </BlurView>
        )}
        
        {/* Main Content Area */}
        <View style={styles.mainContent}>
          {/* Hero Image */}
          <View style={styles.heroImageContainer}>
            <Image
              source={{
                uri: 'https://images.pexels.com/photos/1287145/pexels-photo-1287145.jpeg?auto=compress&cs=tinysrgb&w=400'
              }}
              style={styles.heroImage}
            />
            <View style={styles.heroOverlay} />
            
            {/* Sam Messaged Card */}
            <View style={styles.messageCard}>
              <Text style={styles.messageTitle}>Sam Messaged</Text>
              <View style={styles.ratingContainer}>
                <Star size={16} color="#FFD700" fill="#FFD700" />
                <Text style={styles.ratingText}>4.8</Text>
              </View>
              <TouchableOpacity style={styles.directionsButton}>
                <Navigation size={16} color="#333" />
                <Text style={styles.directionsText}>Directions</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        {/* Bottom Navigation */}
        <View style={styles.bottomNavigation}>
          <TouchableOpacity style={styles.navButton} onPress={() => handleNavPress('Triangle Menu')}>
            <View style={styles.navIcon}>
              <Text style={styles.navIconText}>▽</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton} onPress={() => handleNavPress('More Options')}>
            <View style={styles.navIcon}>
              <MoreHorizontal size={20} color="white" />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  backgroundOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  scrollView: {
    flex: 1,
  },
  
  // Frosted Glass Wipe Transition
  wipeTransition: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  wipeLayer1: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  wipeLayer2: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    left: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  wipeLayer3: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    left: 40,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  wipeGradient1: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  wipeGradient2: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  wipeGradient3: {
    flex: 1,
    backgroundColor: 'rgba(100, 150, 255, 0.1)',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  
  // Fluid Cursor Trail
  cursorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  mainCursor: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  cursorBlur: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  cursorGradient: {
    flex: 1,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
  },
  trailElement: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  trailBlur: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  trailGradient: {
    flex: 1,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  gooeyIndicator: {
    position: 'absolute',
    width: 50,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    top: -30,
  },
  gooeyText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontWeight: 'bold',
  },
  
  // Top Header
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  genieTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  homeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Notification Card
  notificationCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  notificationText: {
    flex: 1,
  },
  notificationName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 2,
  },
  notificationMessage: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  replyButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  replyText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Main Content
  mainContent: {
    paddingHorizontal: 20,
  },
  heroImageContainer: {
    position: 'relative',
    borderRadius: 20,
    overflow: 'hidden',
    height: 400,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  
  // Message Card
  messageCard: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    alignItems: 'center',
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
  
  // Bottom Navigation
  bottomNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    paddingHorizontal: 40,
    marginTop: 40,
  },
  navButton: {
    alignItems: 'center',
  },
  navIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navIconText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  
  // Second Screen
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondScreenContent: {
    padding: 20,
    alignItems: 'center',
    marginTop: 50,
  },
  secondScreenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
    textAlign: 'center',
  },
  secondScreenText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
  },
});