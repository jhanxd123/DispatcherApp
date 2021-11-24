//1 CORINTHIANS 10:31
//Coded by J3 team. Copyright 2021
import React, {useState, useEffect} from 'react';
import {Text, Alert, View, TextInput, StyleSheet, TouchableOpacity, ImageBackground, SafeAreaView, Image, Dimensions, Button} from 'react-native';
import { createBottomTabNavigator, useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import {Ionicons} from 'react-native-vector-icons/Ionicons';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import QRScanner from './parts/qrscanner';
import PUVlist from './parts/puvlist';
import Passengerlist from './parts/passengerlist';
import Manualqueuing from './parts/manual';
import { NavigationContainer } from '@react-navigation/native';
import {Card, ListItem} from 'react-native-elements';
import { white } from 'react-native-paper/lib/typescript/styles/colors';


// Screen Dimension
const width = Dimensions.get('screen').width;
const height = Dimensions.get('screen').height;

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



var ws = new WebSocket('ws://119.92.152.243/processes');

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


                return <Ionicons name={iconName} size={size} color={color}/>;
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

  const Intro = () => (
    <View
      style={{
        flex: 1,
      }}
    >
    <ImageBackground
      source={require('./assets/gradient_bg.png')}
      resizeMode='cover'
      position='relative'
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
     <Image
       source={require('./assets/ormoc_bg.png')}
       style={{
         width: 120,
         height: 120,
       }}
     />
     <Text
       style={{
         fontSize: 30,
         fontWeight: 'bold',
         color: '#566573'
       }}
     >
       Q R M O C
     </Text>
     <Text
      style={{
        color: '#566573',
        position: 'absolute',
        bottom: 20,
      }}
     >
      1 CORINTHIANS 10:31
     </Text>
    </ImageBackground>
    </View>
  );


  const storeData = async (value) => {
    try {
      const jsonValue = JSON.stringify(value)
      await AsyncStorage.setItem('user_info', jsonValue)
    }catch (e) {
      unsuccess();
    }
  }

//Fetch function

  const autoSignIn = async (recent_name, recent_pin) => {
    try{
      const response = await fetch('http://119.92.152.243/processes/app_signin.php', {
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




  const signin = async (user_pin) => {
    try{
      const response = await fetch('http://192.168.1.21/CapstoneWeb/processes/app_signin.php', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          pin: user_pin
      })
    });
      const json = await response.json();
      if(json == 'offduty'){
        setSignInStatus('You are off duty');
        reset();
      }else if(json == 'unregistered'){
        setSignInStatus('Not registered');
        reset();
      }else if(json == 'error'){
        setSignInStatus('Something went wrong');
        reset();
      }else{
        try{
          let data = JSON.parse(json);
          setBool(true);
        }catch(e){
          setSignInStatus('Something went wrong');
          reset();
        }
      }
    }
    catch(error){
      setSignInStatus('Something went wrong');
      reset();
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

  const Pone = ({color}) => (
    <View style={{width: 15,
      height: 15,
      borderWidth: 1,
      borderRadius: 50,
      borderColor: '#566573',
      backgroundColor: color
    }}
    >
    </View>
  )

  const Ptwo = ({color}) => (
    <View style={{width: 15,
      height: 15,
      borderWidth: 1,
      borderRadius: 50,
      borderColor: '#566573',
      backgroundColor: color
    }}
    >
    </View>
  )

  const Pthree = ({color}) => (
    <View style={{width: 15,
      height: 15,
      borderWidth: 1,
      borderRadius: 50,
      borderColor: '#566573',
      backgroundColor: color
    }}
    >
    </View>
  )

  const Pfour = ({color}) => (
    <View style={{width: 15,
      height: 15,
      borderWidth: 1,
      borderRadius: 50,
      borderColor: '#566573',
      backgroundColor: color
    }}
    >
    </View>
  )

  const [pinOne, setPinOne] = useState(false);
  const [pinTwo, setPinTwo] = useState(false);
  const [pinThree, setPinThree] = useState(false);
  const [pinFour, setPinFour] = useState(false);
  const [pinCount, setPinCount] = useState(1);
  const [pin, setPin] = useState('');
  const [signInStatus, setSignInStatus] = useState('');
  const [iconType, setIconType] = useState('');

  const reset = () => {
    setPin('');
    setPinCount(1);
    setPinOne(false);
    setPinTwo(false);
    setPinThree(false);
    setPinFour(false);
  }

  const buttonPress = (value) => {
    setPinCount(pinCount + 1);
    setPin(pin + value.toString());
    setSignInStatus('');
    setIconType('');
    if(pinCount == 1){
      setPinOne(true);
    }else if(pinCount == 2){
      setPinTwo(true);
    }else if(pinCount == 3){
      setPinThree(true);
    }else if(pinCount == 4){
      setPinFour(true);
    }
  }

  const deletePin = () => {
    if(pinCount == 2){
      setPin(pin.slice(0, -1))
      setPinOne(false);
      setPinCount(pinCount - 1);
    }else if(pinCount == 3){
      setPinTwo(false);
      setPin(pin.slice(0, -1))
      setPinCount(pinCount - 1);
    }else if(pinCount == 4){
      setPinThree(false);
      setPin(pin.slice(0, -1))
      setPinCount(pinCount - 1);
    }
  }

  (function(){
    if(pin.length == 4){
      signin(pin);
    }
  })()

  return (
    bool ? <Bottomnavigation/> :
    <View
      style={{
        flex: 1
      }}
    >
      <ImageBackground
        style={{
          flex: 1,
          paddingLeft: 30,
          paddingRight: 30,
          paddingTop: 0,
          justifyContent: 'center',
          alignItems: 'center',
        }}
        source={ require('./assets/gradient_bg.png')}
      >
      <View
        style={{
          position: 'absolute',
          top: 0,
          flex: 1,
          alignItems: 'center',
        }}
      >
        <Image
          source={require('./assets/ormoc_bg.png')}
          style={{
            width: width,
            height: 200,
            marginBottom: 5
          }}
        />
        <Text
          style={{
            color: '#566573',
            fontWeight: 'bold',
            fontSize: 22
          }}
        >
          Q R M O C
        </Text>
      </View>
      <View
        style={{
          alignItems: 'center',
          top: '15%'
        }}
      >
      <View style={{width: 200, height: 70, alignItems: 'center', marginBottom: 20}}>
        <View
          style={{
            width: 150,
            flexDirection: 'row',
            justifyContent: 'space-around',
          }}
        >
          <Pone
            color={pinOne ? '#566573' : ''}
          />
          <Ptwo
            color={pinTwo ? '#566573' : ''}
          />
          <Pthree
            color={pinThree ? '#566573' : ''}
          />
          <Pfour
            color={pinFour ? '#566573' : ''}
          />
        </View>
        <TouchableOpacity style={{marginTop: 10}} onPress={reset}>
          <Text style={{color: '#566573', fontWeight: 'bold'}}>
            RESET
          </Text>
        </TouchableOpacity>
        <Text style={{bottom: 0, position: 'absolute', color: '#CD6155'}}>
          {iconType} {signInStatus}
        </Text>
      </View>
        <View style={logInputStyle.customContainerButtons}>
          <TouchableOpacity style={logInputStyle.customButtons} onPress={() => buttonPress(1)}>
            <Text style={{fontWeight: 'bold', fontSize: 20, color: '#566573'}}>
              1
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={logInputStyle.customButtons} onPress={() => buttonPress(2)}>
            <Text style={{fontWeight: 'bold', fontSize: 20, color: '#566573'}}>
              2
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={logInputStyle.customButtons} onPress={() => buttonPress(3)}>
            <Text style={{fontWeight: 'bold', fontSize: 20, color: '#566573'}}>
              3
            </Text>
          </TouchableOpacity>
        </View>
        <View style={logInputStyle.customContainerButtons}>
          <TouchableOpacity style={logInputStyle.customButtons} onPress={() => buttonPress(4)}>
            <Text style={{fontWeight: 'bold', fontSize: 20, color: '#566573'}}>
              4
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={logInputStyle.customButtons} onPress={() => buttonPress(5)}>
            <Text style={{fontWeight: 'bold', fontSize: 20, color: '#566573'}}>
              5
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={logInputStyle.customButtons} onPress={() => buttonPress(6)}>
            <Text style={{fontWeight: 'bold', fontSize: 20, color: '#566573'}}>
            6
            </Text>
          </TouchableOpacity>
        </View>
        <View style={logInputStyle.customContainerButtons}>
          <TouchableOpacity style={logInputStyle.customButtons}  onPress={() => buttonPress(7)}>
            <Text style={{fontWeight: 'bold', fontSize: 20, color: '#566573'}}>
              7
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={logInputStyle.customButtons} onPress={() => buttonPress(8)}>
            <Text style={{fontWeight: 'bold', fontSize: 20, color: '#566573'}}>
              8
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={logInputStyle.customButtons} onPress={() => buttonPress(9)}>
            <Text style={{fontWeight: 'bold', fontSize: 20, color: '#566573'}}>
              9
            </Text>
          </TouchableOpacity>
        </View>
        <View style={logInputStyle.customContainerButtons}>
          <TouchableOpacity style={{width: 55, height: 55}}>
          </TouchableOpacity>
          <TouchableOpacity style={logInputStyle.customButtons} onPress={() => buttonPress(0)}>
            <Text style={{fontWeight: 'bold', fontSize: 20, color: '#566573'}}>
              0
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={{width: 55, height: 55, justifyContent: 'center', alignItems: 'center', borderRadius: 50, backgroundColor: '#25bbc6'}} onPress={() => deletePin()}>
            <Text style={{fontWeight: 'bold', fontSize: 20}}>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      </ImageBackground>
    </View>
  );
}

const logInputStyle = StyleSheet.create({
  customContainerButtons: {
    padding: 5,
    width: width - 60,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  customButtons: {
    width: 55,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
    backgroundColor: '#5df4e2',
  }
});
