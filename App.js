import * as React from 'react';
import { Text, View, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import QRScanner from './parts/qrscanner';
import PUVlist from './parts/puvlist';
import Passengerlist from './parts/passengerlist';


var ws;

const Stack = createNativeStackNavigator();

//websocket connection
const websocketConnection = () => {
  ws = new WebSocket('ws://192.168.1.12:8082');

  ws.onclose = (e) => {
    connectionError();
  }

  ws.onerror = (e) => {
    console.log(e.message);
  }

    ws.onopen = () => {
   console.log("connected");
  }
}
//Calling the websocket connection function
websocketConnection();

//This function will be called on  websocket onclose event
const connectionError = () => Alert.alert(
  "Connection error",
  "A problem occured when connecting you with other dispatcher",
  [
    {
      text: "Refresh",
      onPress: () => {
        websocketConnection();
      }
    }
  ]
);

function scanner() {
    return (
      <QRScanner
      ws = {ws}
      />
    );
}

function queuingPUV({navigation}){
  return (
      <PUVlist
      navigation = {navigation}
      ws = {ws}
      />
  );
}

function puvDetails({route}){
  return(
    <Passengerlist
    route={route}
    />
  );
}

function puvs() {
  return (
    <Stack.Navigator>
      <Stack.Screen
      name="PUVs"
      component={queuingPUV}
      />
      <Stack.Screen
      name="Options"
      component={puvDetails}
      options={({ route }) => ({ title: route.params.vehicle[1] })}
      />
    </Stack.Navigator>
  );
}


const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Scanner') {
              iconName = 'qr-code';
            } else if (route.name === 'PUVS') {
              iconName = 'bus';
            }

            // You can return any component that you like here!
            return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: 'green',
            tabBarInactiveTintColor: 'gray',
            })}
      >
        <Tab.Screen name="Scanner" component={scanner} />
        <Tab.Screen name="PUVS" component={puvs} options={{headerShown: false}}/>
      </Tab.Navigator>
    </NavigationContainer>
  );
}
