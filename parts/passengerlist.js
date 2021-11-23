import React, { useState, useRef, useEffect } from "react";
import { ActivityIndicator, StyleSheet, Button, View, FlatList, SafeAreaView, StatusBar, Text, TouchableOpacity, Image, Alert } from "react-native";

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
    {
      item.Name == '' && item.Companion == '' ?
      <Text style={{
        fontSize: 20,
        fontWeight: "bold",
        color: "#C0392B"
      }}>
        Vacant seat
      </Text>
      :
      item.Companion == "true" ?
      <Text style={{
        fontSize: 20,
        fontWeight: "bold",
        color: "white"
      }}>
      {item.Name}
      </Text>
      :
      <Text style={{
        fontSize: 20,
        fontWeight: "bold",
      }}>
      {item.Name}
      </Text>
    }
    {
      item.Name == '' && item.Companion == '' ?
    <Text style={{
      position: "absolute",
      right: 22,
      top: 11,
      fontSize: 30
    }}
    >
    +
    </Text>
    :
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
      source = {item.Name == '' && item.Companion == '' ? null : require('../assets/unload.png')}
      />
    </TouchableOpacity>
    }
  </View>
);

const Passengerlist = ({ws, route, warning}) => {

  const [reply, setReply] = useState([]);
  const [ref, setRef] = useState(false);
  const [mount, setMount] = useState(false);
  const [loading, setLoading] = useState(true);

  ws.onmessage = (e) => {
    if(e.data === 'LOADCHANGES'){
      if(mount){
        retrievePassengerList(route.params.vehicle[0]);
      }
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
      warning();
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
      json === "Halt" ? warning() : unloadSuccessFunction(json);
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
      unload = {() => {unloadAlert(route.params.vehicle[0], item.Name, route.params.vehicle[1])}}
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
