//1 CORINTHIANS 10:31
//Coded by J3 team. Copyright 2021

import React, {useState, useEffect} from 'react';
import { Text, Alert, Button, View, TextInput, StyleSheet, TouchableOpacity, ImageBackground, SafeAreaView, Image } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import QRScanner from './parts/qrscanner';
import PUVlist from './parts/puvlist';
import Passengerlist from './parts/passengerlist';
import Manualqueuing from './parts/manual';

var ws;
const Stack = createNativeStackNavigator();

//websocket connection

const websocketConnection = () => {
  ws = new WebSocket('ws://192.168.1.6:8082');



  ws.onopen = () => {
    console.log("connected");
  }
}

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

const unsuccess = () => Alert.alert("Error occured", "Something went wrong doing the operation",);

const success = () => Alert.alert("Success", "Vehicle successfully unqueued");

const loginfail = () => Alert.alert("Error","Dispatcher is not registered");

const info = () => Alert.alert("Information","The dispatcher is registered but is not on duty, login is restricted");

function manualQueuing({route}){
  return(
    <Manualqueuing
      warning = {unsuccess}
      route = {route}
      ws = {ws}
    />
  );
}

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
        ws = {ws}
        navigation = {navigation}
        warning = {unsuccess}
        success = {success}
      />
  );
}

function puvDetails({route}){
  return(
    <Passengerlist
      route= {route}
      ws = {ws}
      warning = {unsuccess}
      success = {success}
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
      options={({ route, }) => ({ title: route.params.vehicle[1] })}
      />
    </Stack.Navigator>
  );
}


export default function App() {

  const Tab = createBottomTabNavigator();
  const [bool, setBool] = useState(false);
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [profilename, setProfilename] = useState('');

  useEffect(() => {
    getData();
    websocketConnection();
  },[]);

  setInterval(() => {
    ws.send('ping');
  }, 3000);

  ws.onmessage = (e) => {
    if (e.data === profilename.trim()) {
      setBool(false);
      setName('');
      setPin('');
    }
  };

  ws.onclose = (e) => {
    connectionError();
  }

  ws.onerror = (e) => {
    connectionError();
  }

  const Profile = () => (
    <SafeAreaView
      style = {{
        flex: 1,
        alignItems: "center"
      }}
    >
      <Image
        source = {require('./assets/profile.png')}
        style = {{
           width: 150,
           height: 150,
           margin: 20
        }}
      />
      <Text
        style = {{
          fontWeight: "bold",
          fontStyle: "italic",
          fontSize: 25,
        }}
      >
        {profilename}
      </Text>
      <TouchableOpacity
        style = {{
          marginTop: 100,
          borderWidth: 2,
          padding: 10,
          width: 150,
          alignItems: "center"
        }}
        onPress = {() => {
          setBool(false);
          storeData({name: null, pin: null});
        }}
      >
        <Text
          style = {{
            fontWeight: "bold",
            fontSize: 15,
          }}
        >
          LOG-OUT
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );

  function showProfile () {
    return (
       <Profile/>
    )
  }

  const Bottomnavigation = () => (
    <NavigationContainer>
      <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Scanner') {
              iconName = 'qr-code';
            } else if (route.name === 'PUVS') {
              iconName = 'bus';
            } else if (route.name === 'Manual') {
              iconName = 'hand-left';
            } else if (route.name === 'Profile') {
              iconName = 'man';
            }

            // You can return any component that you like here!
            return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: 'green',
            tabBarInactiveTintColor: 'gray',
            })}
      >
        <Tab.Screen
          name="Scanner"
          component={scanner}
        />
        <Tab.Screen
          name="PUVS"
          component={puvs}
          options={{
            headerShown: false
          }}
        />
        <Tab.Screen
          name="Manual"
          component={manualQueuing}
          options={{
            tabBarHideOnKeyboard: true
          }}
        />
        <Tab.Screen
          name="Profile"
          component={showProfile}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );


  const signinProcess = () => {
    if(name.trim() === ''  || pin.trim() === ''){
      Alert.alert(
        "Error",
        "Please fill in all the field",
        [
          {
            text: "Ok",
            onPress: () => {
            }
          }
        ]
      );
    }else{
      fetch('http://192.168.1.6/CapstoneWeb/app_signin.php', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: name,
          pin: pin
        })
      }).then((response) => response.json())
      .then((json) => {
         if(json === 'ONDUTY'){
           setBool(true);
           let user_creds = {
             name: name,
             pin: pin
           }
           storeData(user_creds);
           setProfilename(name);
         }
         else if(json === 'REGISTERED'){
           info();
         }
         else if(json === 'UNREGISTERED'){
           loginfail();
         }
         else if(json === 'HALTED'){
           connectionError();
         }
      }).catch((error) => connectionError());
    }
  }

  const storeData = async (value) => {
    try {
      const jsonValue = JSON.stringify(value)
      await AsyncStorage.setItem('user_info', jsonValue)
    } catch (e) {
      unsuccess();
    }
  }

  const autoSignIn = (recent_name, recent_pin) => {
    fetch('http://192.168.1.6/CapstoneWeb/app_signin.php', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: recent_name,
        pin: recent_pin
      })
    }).then((response) => response.json())
    .then((json) => {
      if(json === 'ONDUTY'){
       setBool(true);
       setProfilename(recent_name);
       Alert.alert(
         "Information",
         "You are signed in as " + recent_name,
         [
           {
             text: "Ok",
             onPress: () => {
             }
           }
         ]
       );
      }
       else if(json === 'REGISTERED'){
         info();
       }
       else if(json === 'UNREGISTERED'){
         loginfail();
       }
       else if(json === 'HALTED'){
         connectionError();
       }
    }).catch((error) => console.error(error));
  }

  const getData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('user_info')
      if (jsonValue != null) {
        let stored_credentials  = JSON.parse(jsonValue);
        if (stored_credentials.name != null && stored_credentials.pin != null) {
          autoSignIn(stored_credentials.name, stored_credentials.pin);
        }
      }
    } catch(e) {
      unsuccess();
    }
  }

  return (
    bool ? <Bottomnavigation/> :
    <View
      style = {loginputStyle.container}
    >
       <ImageBackground
        style = {loginputStyle.imagecontainer}
        source = {require('./assets/background.jpeg')}
       >
            <TextInput
              style = {loginputStyle.input}
              placeholder = "Full name"
              onChangeText = {setName}
              value = {name}
            />
            <TextInput
              style = {loginputStyle.input}
              placeholder = "4-Digit PIN"
              textAlign = "center"
              onChangeText = {setPin}
              value = {pin}
              secureTextEntry = {true}
              maxLength = {4}
              keyboardType = "number-pad"
            />
            <TouchableOpacity
              style = {loginputStyle.logincontainer}
              onPress = {signinProcess}
            >
            <Text
              style = {{
                fontSize: 30,
              }}
            >
              LOGIN
            </Text>
          </TouchableOpacity>
       </ImageBackground>
    </View>
  );
}

const loginputStyle = StyleSheet.create({
  container: {
    flex: 1,
  },
  imagecontainer: {
    flex: 1,
    justifyContent: "center",
    padding: 10
  },
  input: {
    fontSize: 25,
    borderWidth: 2,
    borderRadius: 10,
    height: 60,
    padding: 10,
    marginBottom: 20,
    borderColor: "#d6dbdf",
    opacity: 0.8,
    backgroundColor: "#34495e",
    color: "white"
  },
  logincontainer: {
    height: 50,
    width: 200,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: "center",
    alignSelf: "center",
    borderColor: "#f1c40f",
    backgroundColor: "#27ae60",
    opacity: 0.8
  }
});
