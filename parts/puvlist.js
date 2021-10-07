import React, { useState, useRef } from "react";
import { Button, View, FlatList, SafeAreaView, StatusBar, Text, TouchableOpacity, Image, Alert } from "react-native";

//This is the component that will be rendered by the flatlist.
const Item = ({ item, pass, uq }) => (
  <TouchableOpacity
  onPress = {pass}
  style = {{
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
      right: 50,
      top: 19
    }}
    >
    {item.passengers === item.capacity ? "FULL" : item.passengers + "/" + item.capacity}
    </Text>
    <TouchableOpacity
    onPress = {uq}
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
    source = {require('../assets/remove.png')}
    />
    </TouchableOpacity>
  </TouchableOpacity>
);

const PUVlist = ({navigation, ws, warning, success}) => {

  //This variable holds the data that will be used for the flatlist component.
  const [reply, setReply] = useState([]);
  const [ref, setRef] = useState(false);

  //This is an event that will be triggered if a message was received.
  ws.onmessage = (e) => {
    if(e.data === 'LOADCHANGES'){
      retrieveList();
    }
  }

  //This will retrieve the list of currently queuing vehicles from the server.
  const retrieveList = () => {
  fetch('http://192.168.1.6/CapstoneWeb/retrievelist.php', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
    }).then((response) => response.json())
    .then((json) => {
      setReply(JSON.parse(json));
    })
    .catch((error) => warning());
  }

  const unqueue = (data) => {
    fetch('http://192.168.1.6/CapstoneWeb/unqueue.php', {
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
      ws.send('LOADCHANGES');
      json === "Halt" ? warning() : success();
    })
    .catch((error) => warning())
  }

  const unqueueAlert = (data) => Alert.alert(
    "Confirmation",
    "Do you really want to unqueue this PUV?",
    [
      {
        text: "Cancel",
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

  const secrefFunc = () => {
    retrieveList();
    setRef(false);
  }

  const refreshFunc = () => {
    setRef(true);
    secrefFunc();
  }

  const renderItem = ({ item }) => {
    return(
      <Item
      item = {item}
      pass = {() => navigation.navigate('Options', {vehicle: [item.route + "_" + item.vehicle + ".json", item.vehicle]})}
      uq = {() => unqueueAlert(item.vehicle)}
      />
    );
  }

  navigation.addListener('focus', () =>  {
    retrieveList();
    console.log("hehehe");
  })

  return(
    reply.length > 0 ?
    <SafeAreaView style={{
      flex: 1
    }}
    >
     <FlatList
     data = {reply}
     renderItem = {renderItem}
     extraData = {reply}
     refreshing = {ref}
     onRefresh = {refreshFunc}
     />
    </SafeAreaView>
    :
    <SafeAreaView style = {{
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      opacity: 0.5
    }}
    >
      <Text>
        No currently queuing vehicle
      </Text>
    </SafeAreaView>
  )

}

export default PUVlist;
