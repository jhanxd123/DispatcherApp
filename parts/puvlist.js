import React, { useState, useRef } from "react";
import { Button, View, FlatList, SafeAreaView, StatusBar, Text, TouchableOpacity, Image, Alert } from "react-native";

//This is the component that will be rendered by the flatlist.
const Item = ({ item, pass, uq}) => (
  <View
  style={{
    padding: 20,
    marginVertical: 5,
    marginHorizontal: 8,
    backgroundColor: "#2c3e50",
    flexDirection: "row",
    position: "relative",
    borderRadius: 5
  }}>
    <Text
    style = {{
      fontSize: 18,
      color: "white"
    }}
    >
    {item.vehicle}
    </Text>
    <Text style = {{
      fontSize: 15,
      padding: 3,
      position: "absolute",
      backgroundColor: "#28b463",
      borderRadius: 5,
      top: 19,
      left: 110
    }}>
    {item.route.toUpperCase()}
    </Text>
    <Text
    style = {{
      backgroundColor: "#f4d03f",
      padding: 3,
      borderRadius: 3,
      fontSize: 15,
      fontWeight: "bold",
      fontStyle: "italic",
      position: "absolute",
      right: 100,
      top: 19
    }}
    >
    {item.passengers === item.capacity ? "FULL" : item.passengers + "/" + item.capacity}
    </Text>
    <TouchableOpacity
    onPress = {pass}
    style = {{
      position: "absolute",
      right: 10,
      top: 18,
    }}
    >
    <Image
    style = {{
      width: 30,
      height: 30,
    }}
    source = {require('../assets/menu.png')}
    />
    </TouchableOpacity>
    <TouchableOpacity
    onPress = {uq}
    style = {{
      position: "absolute",
      right: 50,
      top: 18,
    }}
    >
    <Image
    style = {{
      width: 30,
      height: 30,
    }}
    source = {require('../assets/remove.png')}
    />
    </TouchableOpacity>
  </View>
);

const PUVlist = (props) => {

  //This variable holds the data that will be used for the flatlist component.
  const [reply, setReply] = useState('[]');

  //This is an event that will be triggered if a message was received.
  props.ws.onmessage = (e) => {
    if(e.data === '[]'){
      retrieveList();
    }
    else{
      setReply(e.data);
    }
  }



  //This will retrieve the list of currently queuing vehicles from the server.
  const retrieveList = () => {
  fetch('http://192.168.1.15/CapstoneWeb/retrievelist.php', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
    }).then((response) => response.json())
    .then((json) => {
      setReply(json);
      console.log(json);
    }).catch((error) => unsuccess());
  }

  const success = () => Alert.alert(
    "Success",
    "Vehicle successfully unqueued",
    [
      {
        text: "Ok",
        onPress: () => {
        }
      }
    ]
  );

  const unsuccess = () => Alert.alert(
    "Error occured",
    "Something went wrong doing the operation",
    [
      {
        text: "Ok",
        onPress: () => {
        }
      }
    ]
  );

  const unqueue = (data) => {
    fetch('http://192.168.1.15/CapstoneWeb/unqueue.php', {
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
      props.ws.send(json);
      console.log(json);
      success();
    })
    .catch((error) => unsuccess())
  }

  const unqueueAlert = (data) => Alert.alert(
    "Confirmation",
    "Do you really want to unqueue this PUV?",
    [
      {
        text: "Cancel",
        onPress: () => console.log("Unqueuing is cancelled"),
        style: "cancel"
      },
      {
        text: "Ok",
        onPress: () => {
          unqueue(data);
        }
      }
    ]
  );


  const renderItem = ({ item }) => {
    return(
      <Item
      item = {item}
      pass = {() => props.navigation.navigate('Options', {vehicle: [item.route + "_" + item.vehicle + ".json", item.vehicle]})}
      uq = {() => unqueueAlert(item.vehicle)}
      />
    );
  }

  props.navigation.addListener('focus', () =>  {
    retrieveList();
  })

  return(
    <SafeAreaView>
     <FlatList
     data = {JSON.parse(reply)}
     renderItem = {renderItem}
     extraData = {JSON.parse(reply)}
     />
    </SafeAreaView>
  )

}

export default PUVlist;
