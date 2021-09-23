import React, { useState, useRef } from "react";
import { StyleSheet, Button, View, FlatList, SafeAreaView, StatusBar, Text, TouchableOpacity, Image, Alert } from "react-native";

const Passenger = ({item}) => (
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


const Passengerlist = ({route}) => {

  const [reply, setReply] = useState(null);

  const retrievePassengerList = (data) => {
    fetch('http://192.168.1.12/CapstoneWeb/retrievepassengerlist.php',
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
      console.log(reply);
    })
  }

  const renderItem = ({item}) => {
    return(
      <Passenger
      item = {item}
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
