import React, { useEffect } from 'react';
import {
  StyleSheet, unstable_batchedUpdates, View,
} from 'react-native';
import { Card, Typography } from './components';

export interface IUser {
  id: number;
  firstName: string;
  image: string;
}

const LIMIT = 10;

const App = () => {
  const [users, setUsers] = React.useState<IUser[]>([]);
  const total = React.useRef(LIMIT);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [firstIndex, setFirstIndex] = React.useState(0);
  const [secondIndex, setSecondIndex] = React.useState(1);
  const [thirdIndex, setThirdIndex] = React.useState(2);

  const loadUsers = async () => {
    try {
      if (total.current < LIMIT + users.length) {
        return;
      }
      // I liked images from dummyjson. So I used it instead of randomuser.me
      const response = await fetch(`https://dummyjson.com/users?limit=${LIMIT}&skip=${users.length}&select=firstName,image,id`);
      const data = await response.json();
      total.current = data.total;
      setUsers(oldUsers => [...oldUsers, ...data.users]);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (currentIndex === users.length - 3) {
      loadUsers();
    }
  }, [currentIndex])

  const onSwiped = (id: number, direction: number) => {
    // TODO: based on the swiping direction do whatever you want
    // e.g. send like to the server

  }

  const onSwipeFirst = (id: number, direction: number) => {
    onSwiped(id, direction);
    unstable_batchedUpdates(() => {
      setCurrentIndex(i => i + 1);
      setFirstIndex(i => i + 3);
    });
  }

  const onSwipeSecond = (id: number, direction: number) => {
    onSwiped(id, direction);
    unstable_batchedUpdates(() => {
      setCurrentIndex(i => i + 1);
      setSecondIndex(i => i + 3);
    });
  }

  const onSwipeThird = (id: number, direction: number) => {
    onSwiped(id, direction);
    unstable_batchedUpdates(() => {
      setCurrentIndex(i => i + 1);
      setThirdIndex(i => i + 3);
    });
  }

  const renderFirst = () => {
    if (users[firstIndex] === undefined) {
      return;
    }
    return (
      <Card
        user={users[firstIndex]}
        zIndex={(currentIndex + 2) % 3}
        onSwipe={onSwipeFirst} />
    )
  }

  const renderSecond = () => {
    if (users[secondIndex] === undefined) {
      return;
    }
    return (
      <Card
        zIndex={(currentIndex + 1) % 3}
        user={users[secondIndex]}
        onSwipe={onSwipeSecond} />
    )
  }

  const renderThird = () => {
    if (users[thirdIndex] === undefined) {
      return;
    }
    return (
      <Card
        zIndex={(currentIndex) % 3}
        user={users[thirdIndex]}
        onSwipe={onSwipeThird} />
    )
  }

  return (
    <View style={styles.container}>
      {users.length > 0 && (
        <>
          {renderFirst()}
          {renderSecond()}
          {renderThird()}
        </>
      )}
      {currentIndex === users.length && (
        <Typography>Try again later</Typography>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  }
});

export default App;
