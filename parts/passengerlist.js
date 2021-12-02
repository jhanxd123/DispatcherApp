import React, { useState, useRef, useEffect } from "react";
import { ImageBackground, ActivityIndicator, StyleSheet, Button, View, FlatList, SafeAreaView, StatusBar, Text, TouchableOpacity, Image, Alert } from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';

const Passenger = ({item, unload}) => (
  item.Name != '' && item.Companion != '' ?
    <View
    style={{
      minHeight: 60,
      flexDirection: "row",
      alignItems: 'center',
      justifyContent: 'space-between',
      borderRadius: 5,
      marginHorizontal: 4,
      marginBottom: 1,
      position: 'relative',
      overflow: 'hidden'
    }}
    >
      <View style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundColor: '#2c3e50',
        opacity: 0.3
      }}>
      </View>
      <Text style={{
          fontSize: 18,
          paddingLeft: 10,
          color: 'white'
        }}>
        <Ionicons name='person' size={20} color='#2c3e50'/>
        {" " + item.Name}
      </Text>
      <TouchableOpacity
      onPress = {unload}
      style={{
        paddingRight: 10
      }}
      >
      <Ionicons name='close-circle' size={30} color="red"/>
      </TouchableOpacity>
    </View>
    :
    <View>
    </View>
);

const Passengerlist = ({navigation, ws, route}) => {

  const [reply, setReply] = useState([]);
  const [ref, setRef] = useState(false);
  const [loading, setLoading] = useState(true);
  const [passengerCount, setPassengerCount] = useState(route.params.vehicle[4]);

  useEffect(() => {
    const retrieveP = navigation.addListener('focus', () => {
      retrievePassengerList(route.params.vehicle[0]);
    });
    return retrieveP;
  }, [navigation]);

  ws.onmessage = (e) => {
    if(e.data == 'LOADCHANGES'){
      retrievePassengerList(route.params.vehicle[0]);
    }
  }

  const retrievePassengerList = async(data) => {
    try{
      const response = await fetch('http://119.92.152.243/processes/retrievepassengerlist.php',
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data: data
        })
      });
      const json = await response.json();
      setReply(JSON.parse(json));
    }catch(error){
      Alert.alert("Problem loading passengers", "Cannot load passengers, please check your internet connection and try again");
    }finally{
      setLoading(false);
    }
  }

  const unloadSuccessFunction = (jason) => {
    Alert.alert("Success", "Passenger successfully unloaded from the vehicle");
    setReply(JSON.parse(jason));
    ws.send('LOADCHANGES');
  }

  const unload = async(file, passenger, vehicle) => {
    try{
      const response = await fetch('http://119.92.152.243/processes/unload.php',{
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          file: file,
          passenger: passenger,
          vehicle: vehicle
        })
      });
      const json = await response.json();
      if(json == 'error'){
        Alert.alert("Something went wrong", "The passenger was not successfully unloaded");
      }else{
        try{
          setReply(JSON.parse(json));
          setPassengerCount(passengerCount - 1);
        }catch(e){
          Alert.alert("Something went wrong", "The passenger was not successfully unloaded");
        }
      }
    }catch(error){
      Alert.alert("Something went wrong", "The passenger was not successfully unloaded");
    }
  }

  const unloadAlert = (file, passenger, vehicle) => Alert.alert(
    "Confirmation",
    "Do you really want to unload this passenger?",
    [
      {
        text: "Cancel",
        style: "cancel"
      },
      {
        text: "Ok",
        onPress: () => {
          unload(file, passenger, vehicle);
        }
      }
    ]
  );

  const renderItem = ({item}) => {
    return(
      <Passenger
      item = {item}
      unload = {() => {unloadAlert(route.params.vehicle[0], item.Name, route.params.vehicle[2])}}
      />
    );
  }

  const secrefFunc = () => {
    retrievePassengerList(route.params.vehicle[0]);
    setRef(false);
  }

  const refreshFunc = () => {
    setRef(true);
    secrefFunc();
  }

  return(
    loading ?
    <SafeAreaView style={{
      flex: 1,
      justifyContent: "center",
      alignItems: "center"
    }}
    >
      <ActivityIndicator size="large" color="green"/>
    </SafeAreaView>
    :
    <SafeAreaView style={{
      flex: 1
    }}
    >
    <View style={{
      width: '100%',
      height: 200,
      position: 'relative',
    }}>
    <ImageBackground style={{
        width: '100%',
        height: '100%',
        opacity: 0.5,
        position: 'absolute'
      }}
      source={{uri: 'http://119.92.152.243' + route.params.vehicle[1]}}
    >
    </ImageBackground>
    <View style={{
        flex: 1,
        padding: 10,
      }}
    >
      <Text style={{
        color: 'white',
        fontWeight: 'bold',
        fontSize: 50
      }}>
        {route.params.vehicle[2]}
      </Text>
      <Text style={{
        color: 'white',
        fontSize: 18
      }}>
        {'Driver: ' + route.params.vehicle[6]}
      </Text>
      <Text style={{
        color: 'white',
        fontSize: 18
      }}>
        {'Operator: ' + route.params.vehicle[5]}
      </Text>
      <Text style={{
        color: 'white',
        fontWeight: 'bold',
        fontSize: 25,
        backgroundColor: "#f4d03f",
        padding: 5,
        borderRadius: 3,
        right: 10,
        bottom: 10,
        position: 'absolute',
      }}>
        {passengerCount + " / " + route.params.vehicle[3]}
      </Text>
    </View>
    </View>
      <ImageBackground style={{
          flex: 1,
          paddingTop: 2
        }}
        source={require('../assets/gradient_bg.png')}
      >
        <FlatList
          data = {reply}
          renderItem = {renderItem}
          extraData = {reply}
          refreshing = {ref}
          onRefresh = {refreshFunc}
        />
      </ImageBackground>
    </SafeAreaView>
  );

}

export default Passengerlist;
