import * as React from 'react';
import { Animated, Dimensions, ImageBackground, PanResponder, StyleSheet, Text, View } from 'react-native';
import { IUser } from '../App';
import { Typography } from './Typography';

const SWIPE_THRESHOLD = 3;
const SWIPE_PERCENTAGE = 0.2;

const { width, height } = Dimensions.get('screen');

interface IProps {
  user: IUser;
  onSwipe: (direction: number, id: number) => void;
  zIndex: number;
}

export const Card = React.forwardRef<any, IProps>((props, ref) => {
  const { user, onSwipe, zIndex } = props;
  const pan = React.useRef(new Animated.ValueXY()).current;
  const [rotation, setRotation] = React.useState({ isUpper: false, radius: .5 });
  const panResponder = React.useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderGrant: (_, gestureState) => {
        const y = height / 2 > gestureState.y0 ? height - gestureState.y0 : gestureState.y0;
        const isUpper = gestureState.y0 < height / 2;
        const radius = (y * 2 / height - 1) > .5 ? .5 : (y * 2 / height - 1);
        setRotation({ isUpper, radius });
      },
      onPanResponderMove: Animated.event([
        null,
        {
          dx: pan.x,
          dy: pan.y,
        }
      ], { useNativeDriver: false }),
      onPanResponderRelease: (_, gesture) => {
        const { vx, vy, dx, dy } = gesture;
        let direction = 0;

        pan.flattenOffset();

        // lets check swipe direction
        if (Math.abs(vx) >= SWIPE_THRESHOLD ||
          Math.abs(vy) >= SWIPE_THRESHOLD) {
          if (Math.abs(vx) > Math.abs(vy)) {
            direction = vx > 0 ? 1 : 2;
          } else {
            direction = dy > 0 ? 3 : 4;
          }
        } else if (height * SWIPE_PERCENTAGE < Math.abs(dy) && dy * vy >= 0 ||
          width * SWIPE_PERCENTAGE < Math.abs(dx) && dx * vx >= 0) {
          if (Math.abs(dy) / height * SWIPE_PERCENTAGE > Math.abs(dx) / width * SWIPE_PERCENTAGE) {
            direction = dy > 0 ? 3 : 4;
          } else {
            direction = dx > 0 ? 1 : 2;
          }
        }

        // if we don't swipe or swipe to the wrong direction we should reset position
        if (direction === 0 || direction === 3 || direction === 4) {
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: true,
          }).start();
          return;
        }

        const x = direction === 1 ? width * 2 : direction === 2 ? - width * 2 : dx;
        const y = direction === 3 ? height * 2 : direction === 4 ? - height * 2 : dy;

        swipe(x, y, direction);
      },
      // when parent scrollview takes control, pan should reset to 0
      onPanResponderTerminate: () => {
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;

  const swipe = (x: number, y: number, direction: number) => {
    Animated.timing(pan, {
      toValue: { x, y },
      duration: 100,
      useNativeDriver: true,
    }).start(() => {
      onSwipe(direction, user.id);
      // reset position right after swipe, because we are reusing this component
      Animated.timing(pan, {
        toValue: { x: 0, y: 0 },
        duration: 0,
        useNativeDriver: true,
      }).start()
    });
  }

  React.useImperativeHandle(ref, () => ({

    swipeLeft: () => {
      // only top card can be swiped
      if (zIndex !== 2) {
        return;
      }
      swipe(- width * 2, 0, 2);
    },
    swipeRight: () => {
      // only top card can be swiped
      if (zIndex !== 2) {
        return;
      }
      swipe(width * 2, 0, 1);
    }

  }));

  const rotateZ = pan.x.interpolate({
    inputRange: [-width, 0, width],
    outputRange: rotation.isUpper ?
      [`-${rotation.radius}rad`, '0rad', `${rotation.radius}rad`] :
      [`${rotation.radius}rad`, '0rad', `-${rotation.radius}rad`],
  });

  const opacity = pan.x.interpolate({
    inputRange: [-width * 2, 0, width * 2],
    outputRange: [0, 1, 0],
  });
  return (
    <View style={{
      ...StyleSheet.absoluteFillObject,
      zIndex
    }}>
      <Animated.View style={{
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#000',
        opacity,
      }} />
      <Animated.View
        style={[styles.container, {
          transform: [
            { translateX: pan.x },
            { translateY: pan.y },
            { rotateZ },
          ],
        }]}
        {...panResponder.panHandlers}>
        <ImageBackground
          source={{ uri: user.image }}
          resizeMode="cover"
          style={{
            width: '100%',
            height: '100%',
            justifyContent: 'flex-start'
          }}>
          <Typography style={styles.username} weight='bold' size={24}>{user.firstName}</Typography>
        </ImageBackground>
      </Animated.View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 15,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,
  },
  username: {
    padding: 20,
    marginTop: 44,
  },
})