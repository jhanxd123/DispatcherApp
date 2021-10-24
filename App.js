//1 CORINTHIANS 10:31
//Coded by J3 team. Copyright 2021

import React, {useState, useEffect} from 'react';
import { Text, Alert, View, TextInput, StyleSheet, TouchableOpacity, ImageBackground, SafeAreaView, Image, Dimensions } from 'react-native';
import { createBottomTabNavigator, useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import QRScanner from './parts/qrscanner';
import PUVlist from './parts/puvlist';
import Passengerlist from './parts/passengerlist';
import Manualqueuing from './parts/manual';
import { NavigationContainer } from '@react-navigation/native';
import {Card, Input, Button, Icon, ListItem} from 'react-native-elements';
import { white } from 'react-native-paper/lib/typescript/styles/colors';


// Screen Dimension
const { width, height } = Dimensions.get('screen');

const bgTheme = {
  colors: {
    primary: 'transparent',
    // background: '#0059e5',
    background: '#00a2e8',
    card: 'transparent',
    text: '#FFF',
    border: 'transparent',
    notification: 'transparent',
    //Color Base = color: "#77BCFF"
    //Color Accent 1 = #FF1D36
    //Color Accent 2 =  #E9FF1D
    //Color Main = color: "#1E90FF"
  },
};



var ws = new WebSocket('ws://192.168.2.31:8082');

const unsuccess = () => Alert.alert("Error occured", "Something went wrong doing the operation",);

const success = () => Alert.alert("Success", "Vehicle successfully unqueued");

const loginfail = () => Alert.alert("Error","Dispatcher is not registered");

const info = () => Alert.alert("Information","The dispatcher is registered but is not on duty, login is restricted");

const loginError = () => Alert.alert("Error", "A problem was encountered signing you in");

export default function App() {

  const Tab = createBottomTabNavigator();
  const Stack = createNativeStackNavigator();
  const [bool, setBool] = useState(false);
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [profilename, setProfilename] = useState('');
  const [ping, setPing] = useState(false);

  useEffect(() => {
    getData();
  },[]);

  const connectionError = () => Alert.alert(
    "Connection error",
    "You might have to manually reload PUV and passenger list, since you cannot connect with other dispatchers",
    [
      {
        text: "OK",
        onPress: () => {
          clearInterval(connectionInterval);
        }
      }
    ]
  );

  const connectionInterval = setInterval(() => {
    if(ping){
      ws.send('ping');
    }
  }, 3000);

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

  ws.onmessage = (e) => {
    if (e.data === profilename.trim()) {
      setBool(false);
      setName('');
      setPin('');
    }
  };

  ws.onopen = () => {
    setPing(true);
  }

  ws.onerror = (e) => {
    connectionError();
    setPing(false);
  }

  ws.onclose = (e) => {
    connectionError();
    setPing(false);
  }


  const Profile = () => (
    <ImageBackground 
        style={{ flex: 1,}}
        source={ require( './assets/profilebg.png')}
      >
        <Text
          style = {{
            color: 'white',
            fontWeight: "500",
            fontStyle: "normal",
            fontSize: 30,
            paddingTop: 50,
            paddingLeft: 35,
            
          }}
        >
          {profilename}
        </Text>
        <Text
          style = {{
            color: 'white',
            fontWeight: "300",
            fontStyle: "italic",
            fontSize: 20,
            paddingLeft: 38,
          }}
        > 
          Dispatcher
        </Text>
        <View
          style={{ 
            flexDirection: "row", 
            flexWrap: "wrap", 
            alignContent: "flex-end", 
            alignItems: "flex-end", 
            justifyContent: "flex-end",
            paddingLeft: 350,
            marginTop: 90,
            marginRight: 103,
            position: 'absolute',
          }}
        >
          <Image
          style = {{
            width: 140,
            height: 140,
            borderRadius: 100,
            borderWidth: 4,
            borderColor: '#00a2e8',
          }}
            source = {require('./assets/profile.png')}
          />
        </View>
        <SafeAreaView
          style = {{
            flex: 1,
            alignItems: 'center',
          }}
        >
          <View 
            style={{ 
              flex: 1,
              justifyContent: 'flex-end',
            }}
          >
            <Card>
            <Card.Title>The City of Beautiful People</Card.Title>
            <Card.Divider/>
            <Card.Image 
              style={{ resizeMode: 'stretch', width: 320}}
              source={require('./assets/ormoc_bg.png')}>
            </Card.Image>
          </Card>
            <TouchableOpacity
              style = {{
                backgroundColor: 'red',
                marginTop: 35,
                borderWidth: 0.5,
                borderRadius: 5,
                padding: 10,
                width: 350,
                alignItems: "center",
                alignSelf: 'center',
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
                  color: 'white',
                }}
              >
                LOG-OUT
              </Text>
            </TouchableOpacity>
          </View>
      </SafeAreaView>
    </ImageBackground>
  );

  function showProfile () {
    return (
       <Profile/>
    )
  }

  const Bottomnavigation = () => (
    
      <NavigationContainer  theme={bgTheme}>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarStyle: {
              backgroundColor: '#FFF',
              height: 56,
              
            },
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;

              if (route.name === 'SCANNER') {
                  iconName = 'qr-code';
                } else if (route.name === 'PUVS') {
                  iconName = 'bus';
                } else if (route.name === 'MANUAL QUEUE') {
                  iconName = 'hand-left';
                } else if (route.name === 'PROFILE') {
                  iconName = 'man';
                }

                // You can return any component that you like here!
                return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#2E7DE1',
                tabBarInactiveTintColor: 'black',
                })
                
          }
        >
          <Tab.Screen
            name="SCANNER"
            component={scanner}
            options={{ 
              headerTitleAlign: 'center',
            }}
          />
          <Tab.Screen
            name="PUVS"
            component={puvs}
            options={{
              headerShown: false,
            }}
          />
          <Tab.Screen
            name="MANUAL QUEUE"
            component={manualQueuing}
            options={{
              tabBarHideOnKeyboard: true,
              headerTitleAlign: 'center',
            }}
          />
          <Tab.Screen
            name="PROFILE"
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
      signin(name, pin)
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

//Fetch function

  const autoSignIn = async (recent_name, recent_pin) => {
    try{
      const response = await fetch('http://192.168.2.31/CapstoneWeb/processes/app_signin.php', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: recent_name,
          pin: recent_pin
      })
    });
      const json = await response.json();
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
         loginError();
       }
    }
    catch(error){
      Alert.alert("Cannot Sign-in", "Something went wrong signing you in automatically");
    }
  }




  const signin = async (user_name, user_pin) => {
    try{
      const response = await fetch('http://192.168.2.31/CapstoneWeb/processes/app_signin.php', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: user_name,
          pin: user_pin
      })
    });
      const json = await response.json();
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
         loginError();
       }
    }
    catch(error){
      loginError();
    }
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
        style={loginputStyle.imagecontainer}
        source={ require('./assets/gradient_bg.png')}
      >
        <Image
          style = {{
            // width: 140,
            // height: 140,
            width: 360,
            height: 140,
            borderRadius: 10,
            borderWidth: 4,
            borderColor: '#00a2e8',
            alignSelf: 'center'
          }}
            source = {require('./assets/banner.jpg')}
          />
        <Card
          containerStyle={{ 
            borderTopLeftRadius: 15, 
            borderTopRightRadius: 15, 
            borderBottomLeftRadius: 15,
            borderBottomRightRadius: 15,
          }}
        >
          <Card.Title>Dispatcher</Card.Title>
          <Card.Divider/>
          <Input
          // style = {loginputStyle.input}
          label="Full Name"
          labelStyle={{ color:'black', fontWeight: '300' }}
          inputStyle={{ color:'black', fontSize: 22, fontWeight: '400' }}
          inputContainerStyle={{ 
            borderBottomColor: 'black'
           }}
          leftIcon={
            <Icon
            name='user'
            type='feather'
            size={24}
            color='black'
          />
           }
          onChangeText = {setName}
          value = {name}
        />
        <Input
          // style = {loginputStyle.input}
          label="4-Digit PIN"
          labelStyle={{ color:'black', fontWeight: '300' }}
          inputStyle={{ color:'black', fontSize: 22, fontWeight: '400' }}
          inputContainerStyle={{ 
            borderBottomColor: 'black'
           }}
           leftIcon={
            <Icon
            name='hash'
            type='feather'
            size={24}
            color='black'
          />
           }
          onChangeText = {setPin}
          value = {pin}
          secureTextEntry = {true}
          maxLength = {4}
          keyboardType = "number-pad"
        />
            <Text style={{marginBottom: 10, textAlign: 'center'}}>
            “Smile, it's free therapy.”
            </Text>
            <Button
              // icon={<Icon name='chevron-right' color='#ffffff' />}
              buttonStyle={{borderRadius: 2, marginLeft: 0, marginRight: 0, marginBottom: 0}}
              title='LOGIN'
              onPress = {signinProcess}
              />
        </Card>
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
    resizeMode: 'contain',
  },
});