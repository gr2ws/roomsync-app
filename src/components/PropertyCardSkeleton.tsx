import { View, Animated } from 'react-native';
import { useEffect, useRef } from 'react';

export default function PropertyCardSkeleton() {
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View
      className="my-1 h-40 flex-row rounded-lg border border-input bg-card shadow-sm"
      style={{ overflow: 'hidden' }}>
      {/* Image Skeleton (35%) */}
      <Animated.View
        className="w-[35%] bg-muted"
        style={{
          borderTopLeftRadius: 12,
          borderBottomLeftRadius: 12,
          opacity,
        }}
      />

      {/* Details Skeleton (65%) */}
      <View className="flex-1 justify-between p-2.5">
        {/* Title skeleton */}
        <View className="mb-1">
          <Animated.View className="mb-2 h-4 w-3/4 rounded bg-muted" style={{ opacity }} />
          <Animated.View className="h-3 w-1/2 rounded bg-muted" style={{ opacity }} />
        </View>

        {/* Price skeleton */}
        <View className="mb-1">
          <Animated.View className="h-4 w-24 rounded bg-muted" style={{ opacity }} />
        </View>

        {/* Rating skeleton */}
        <View className="mb-1">
          <Animated.View className="h-3 w-20 rounded bg-muted" style={{ opacity }} />
        </View>

        {/* Amenities skeleton */}
        <View className="flex-row gap-1">
          <Animated.View className="h-6 w-16 rounded bg-muted" style={{ opacity }} />
          <Animated.View className="h-6 w-16 rounded bg-muted" style={{ opacity }} />
        </View>
      </View>
    </View>
  );
}
