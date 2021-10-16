import React, { useState, useRef, useEffect } from "react";
import { StyleSheet, Button, View, FlatList, SafeAreaView, StatusBar, Text, TouchableOpacity, Image, Alert } from "react-native";

const Passenger = ({item, unload}) => (
  <View
  style={{
    padding: 20,
    marginVertical: 5,
    marginHorizontal: 8,
    backgroundColor: "#f1c40f",
    flexDirection: "row",
    position: "relative",
    borderRadius: 5
  }}
  >
    <Text
    style={{
      fontSize: 20,
      fontWeight: "bold"
    }}
    >
      {item == '' ? 'Vacant seat' : item}
    </Text>
    <TouchableOpacity
    onPress = {unload}
    style={{
      position: "absolute",
      right: 10,
      top: 13,
    }}
    >
      <Image
      style = {{
        width: 40,
        height: 40,
      }}
      source = {item == '' ? null : require('../assets/unload.png')}
      />
    </TouchableOpacity>
  </View>
);


const Passengerlist = ({ws, route, warning}) => {

  const [reply, setReply] = useState([]);
  const [ref, setRef] = useState(false);
  const [mount, setMount] = useState(false);

  ws.onmessage = (e) => {
    if(e.data === 'LOADCHANGES'){
      if(mount){
        retrievePassengerList(route.params.vehicle[0]);
      }
    }
  }

  const retrievePassengerList = async(data) => {
    try{
      const response = await fetch('http://192.168.1.31/CapstoneWeb/processes/retrievepassengerlist.php',
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
      const json = await respone.json();
      setReply(JSON.parse(json));
    }catch(error){
      warning();
    }
  }


  const unload = async(file, passenger, vehicle) => {
    try{
      const response = await fetch('http://192.168.1.31/CapstoneWeb/processes/unload.php',{
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
      setReply(JSON.parse(json));
      json === "Halt" ? warning() : () => {
        Alert.alert("Success", "Passenger successfully unloaded from the vehicle");
        ws.send('LOADCHANGES');
      }
    }catch(error){
      warning();
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
      unload = {() => {unloadAlert(route.params.vehicle[0], item, route.params.vehicle[1])}}
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

  useEffect(() => {
    retrievePassengerList(route.params.vehicle[0]);
    setMount(true);
    return () => {
      setMount(false);
      setReply([]);
    }
  },[]);

  return(
    <SafeAreaView>
      <FlatList
        data = {reply}
        renderItem = {renderItem}
        extraData = {reply}
        refreshing = {ref}
        onRefresh = {refreshFunc}
      />
    </SafeAreaView>
  );

}

export default Passengerlist;
