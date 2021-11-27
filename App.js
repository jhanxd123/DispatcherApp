//1 CORINTHIANS 10:31
//Coded by J3 team. Copyright 2021
import React, {useState, useEffect} from 'react';
import {Text, Alert, View, TextInput, StyleSheet, TouchableOpacity, ImageBackground, SafeAreaView, Image, Dimensions, Button} from 'react-native';
import { createBottomTabNavigator, useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
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
var ws = new WebSocket('ws://192.168.1.21:8082');

const bgTheme = {
  colors: {
    background: '#21add4',
    text: '#566573',
    notification: 'transparent',
  },
};


export default function App() {
  const Tab = createBottomTabNavigator();
  const Stack = createNativeStackNavigator();
  const [bool, setBool] = useState(false);
  const [profilename, setProfilename] = useState('');
  const [ping, setPing] = useState(false);
  const [profileURL, setProfileURL] = useState('');
  const [id, setID] = useState();

  useEffect(() => {
    isReachable();
  },[]);

  const connectionError = () => {
    clearInterval(connectionInterval);
  }

  console.log(bool);

  const connectionInterval = setInterval(() => {
    if(ping){
      ws.send('ping');
    }
  }, 3000);

  function manualQueuing({route}){
    return(
      <Manualqueuing
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
        />
    );
  }

  function puvDetails({route, navigation}){
    return(
      <Passengerlist
        route= {route}
        ws = {ws}
        navigation = {navigation}
      />
    );
  }

  function puvs() {
    return (
      <Stack.Navigator>
        <Stack.Screen
        name="PUVs"
        component={queuingPUV}
        options={{
          headerStyle: {
            backgroundColor: '#21add4'
          },
          headerShadowVisible: false
        }}
        />
        <Stack.Screen
        name="Options"
        component={puvDetails}
        options={({ route }) => ({
          title: route.params.vehicle[2],
          headerStyle: {
            backgroundColor: '#21add4'
          },
          headerShadowVisible: false
        })}
        />
      </Stack.Navigator>
    );
  }

  ws.onmessage = (e) => {
    if (e.data == id) {
      setBool(false);
    }
  };

  ws.onopen = () => {
    console.log("opened");
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
            source = {profileURL == null ? require('./assets/profile.png') : {uri: 'http://192.168.1.21/CapstoneWeb/' + profileURL.slice(1)}}
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
                borderRadius: 100,
                padding: 10,
                width: 350,
                alignItems: "center",
                alignSelf: 'center',
                marginBottom: 20
              }}
              onPress = {() => {
                setBool(false);
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
      <NavigationContainer theme={bgTheme}>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarStyle: {
              backgroundColor: '#D5D8DC',
              height: 56,
              borderColor: '#D5D8DC',
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
                tabBarActiveTintColor: '#21add4',
                tabBarInactiveTintColor: '#707B7C',
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
              headerShown: false
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
            options={{
              headerTitleAlign: 'center',
            }}
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
       source={require('./assets/applogo.png')}
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
     <View style={{marginTop: 30}}>
      <Text style={{color: '#566573', fontSize: 12}}>
        {iconType}{signInStatus}
      </Text>
     </View>
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
        setIconType(<Ionicons name='warning' size={16}/>);
        setSignInStatus('You are off duty');
        reset();
      }else if(json == 'unregistered'){
        setIconType(<Ionicons name='alert-circle' size={16}/>);
        setSignInStatus('Not registered');
        reset();
      }else if(json == 'error'){
        setIconType(<Ionicons name='warning' size={16}/>);
        setSignInStatus('Something went wrong');
        reset();
      }else{
        try{
          let data = JSON.parse(json);
          if(data.status == "onduty"){
            setProfilename(data.name);
            setProfileURL(data.profile);
            setID(data.id);
            setBool(true);
            reset();
          }
        }catch(e){
          setIconType(<Ionicons name='warning' size={16}/>);
          setSignInStatus('Something went wrong');
          reset();
        }
      }
    }catch(error){
      setIconType(<Ionicons name='warning' size={16}/>);
      setSignInStatus('Something went wrong');
      reset();
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
  const [signProcess, setSignProcess] = useState('');
  const [signInStatus, setSignInStatus] = useState('');
  const [iconType, setIconType] = useState('');
  const [serverStatus, setServerStatus] = useState(false);

  const reset = () => {
    setPin('');
    setPinCount(1);
    setPinOne(false);
    setPinTwo(false);
    setPinThree(false);
    setPinFour(false);
    setIconType('');
    setSignInStatus('');
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
      setIconType(<Ionicons name='hand-right-sharp' size={16}/>);
      setSignInStatus('Wait for a moment...');
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


  const isReachable = async () =>{
    setIconType(<Ionicons name='swap-vertical-outline' size={20}/>);
    setSignInStatus(' Connecting to the server...');
    const timeout = new Promise((resolve, reject) => {
        setTimeout(reject, 5000, 'Request timed out');
    });

    const request = fetch('http://192.168.1.21');
    try {
        const response = await Promise
            .race([timeout, request]);
        setTimeout(() => {
          setServerStatus(true);
          setIconType('');
          setSignInStatus('');
        }, 2000);
    }
    catch (error) {
      setServerStatus(false);
      setIconType(<Ionicons name='warning' size={20} color='#F7DC6F'/>);
      setSignInStatus(' Please check you internet connection');
    }
  }

  return (
    serverStatus ?
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
          source={require('./assets/banner.jpg')}
          style={{
            width: width,
            height: 200,
            marginBottom: 5,
            borderWidth: 1
          }}
        />
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
            <Ionicons name='backspace' size={25} color='#566573'/>
          </TouchableOpacity>
        </View>
      </View>
      </ImageBackground>
    </View>
    :
    <Intro/>
  );
}

const logInputStyle = StyleSheet.create({
  customContainerButtons: {
    padding: 5,
    width: width - 100,
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
