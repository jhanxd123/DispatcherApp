import React, { useState, useRef } from "react";
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

  const [reply, setReply] = useState(null);

  ws.onmessage = (e) => {
    if(e.data === 'LOADCHANGES'){
      retrievePassengerList(route.params.vehicle[0]);
    }
  }

  const retrievePassengerList = (data) => {
    console.log(data);
    fetch('http://192.168.1.6/CapstoneWeb/retrievepassengerlist.php',
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        data: data
      })
    }).then((response) => response.json())
    .then((json) => {
      setReply(json);
    }).catch((error) => warning());
  }


  const unload = (file, passenger, vehicle) => {
    fetch('http://192.168.1.6/CapstoneWeb/unload.php',
    {
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
    }).then((response) => response.json())
    .then((json) => {
      ws.send("LOADCHANGES");
      json === "Halt" ? warning() : Alert.alert("Success", "Passenger successfully unloaded from the vehicle");
    }).catch((error) => warning());
  }

  const unloadAlert = (file, passenger, vehicle) => Alert.alert(
    "Confirmation",
    "Do you really want to unload this passenger?",
    [
      {
        text: "Cancel",
        onPress: () => console.log("Unqueuing is cancelled"),
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

  retrievePassengerList(route.params.vehicle[0]);

  return(
    <SafeAreaView>
      <FlatList
        data = {JSON.parse(reply)}
        renderItem = {renderItem}
        extraData = {JSON.parse(reply)}
      />
    </SafeAreaView>
  );

}

export default Passengerlist;
