import React, { useState, useRef, useEffect } from "react";
import { ImageBackground, ActivityIndicator, Button, View, FlatList, SafeAreaView, StatusBar, Text, TouchableOpacity, Image, Alert, ScrollView } from "react-native";

//This is the component that will be rendered by the flatlist.
const Item = ({ item, pass, uq }) => (
  <View style={{
    position: 'relative',
    marginBottom: 1,
    marginHorizontal: 4,
    borderRadius: 5,
    overflow: 'hidden'
  }}>
  <View style={{
    position: 'absolute',
    backgroundColor: "#2c3e50",
    opacity: 0.3,
    width: '100%',
    height: '100%'
  }}>
  </View>
  <TouchableOpacity
    onPress = {pass}
    style = {{
    padding: 20,
    flexDirection: "row",
    position: "relative",
  }}>
    <Text
    style = {{
      fontSize: 18,
      fontWeight: 'bold',
      color: "white"
    }}
    >
    {item.vehicle}
    </Text>
    <Text style = {{
      fontSize: 15,
      padding: 3,
      position: "absolute",
      backgroundColor: '#21add4',
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
    {item.passengers == item.capacity ? "FULL" : item.passengers + "/" + item.capacity}
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
  </View>
  );

const PUVlist = ({navigation, ws, warning, success}) => {

  //This variable holds the data that will be used for the flatlist component.
  const [reply, setReply] = useState([]);
  const [ref, setRef] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mount, setMount] = useState(false);

  //This is an event that will be triggered if a message was received.
  ws.onmessage = (e) => {
    if(e.data === 'LOADCHANGES'){
      retrieveList();
    }
  }

  //This will retrieve the list of currently queuing vehicles from the server.
  const retrieveList = async() => {
    try{
      const response = await fetch('http://192.168.1.21/CapstoneWeb/processes/retrievelist.php', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
          }
      });
      const json = await response.json();
      setReply(JSON.parse(json));
      console.log(JSON.parse(json));
    }catch(error){
      warning();
    }
    finally{
      setLoading(false);
    }
  }

  const unqueueSuccessFunction = (jason) => {
    success();
    setReply(JSON.parse(jason));
    ws.send('LOADCHANGES');
  }

  const unqueue = async(data) => {
    try{
      const response = await fetch('http://192.168.1.21/CapstoneWeb/processes/dispatcher_unqueue_vehicle.php', {
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
      json == "error" ? warning() : unqueueSuccessFunction(json);
    }catch(error){
      warning();
    }
  }

  const getProfile = async(filename, vehicle, capacity, passengers) => {
    try{
      const response = await fetch('http://192.168.1.21/CapstoneWeb/processes/dispatcher_get_vehicle_profile.php', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data: vehicle
        })
      });
      const json = await response.json();
      let operator = json.FirstName + ' ' + json.MiddleName[0] + '. ' + json.LastName;
      let driver = json.DFirstName + ' ' + json.MiddleName[0] + '. ' + json.LastName;
      if(json.VehicleProfile == null){
        navigation.navigate('Options', {vehicle: [filename, '/vehicle_images/vehicleImage.png', vehicle, capacity, passengers, operator, driver]});
      }else{
        navigation.navigate('Options', {vehicle: [filename, json.VehicleProfile.slice(1), vehicle, capacity, passengers, operator, driver]});
      }
    }catch(error){
      console.log(error);
      navigation.navigate('Options', {vehicle: [filename, "/vehicle_images/vehicleImage.png", vehicle, capacity, passengers]});
    }
  }

  const unqueueAlert = (data) => Alert.alert(
    "Do you really want to unqueue this PUV?",
    "This will remove the PUV from the queuing list, and will create a log of its passengers",
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

  const refPressed = () => {
    setLoading(true);
    retrieveList();
  }


  const renderItem = ({ item }) => {
    return(
      <Item
      item = {item}
      pass = {() => getProfile(item.route + "_" + item.vehicle + ".json", item.vehicle, item.capacity, item.passengers)}
      uq = {() => unqueueAlert(item.vehicle)}
      />
    );
  }

  useEffect(() => {
    retrieveList();
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
    }}
    >
      <ImageBackground
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          width: '100%'
        }}
        source={require('../assets/gradient_bg.png')}
      >
        <ActivityIndicator size="large" color="green"/>
      </ImageBackground>
    </SafeAreaView>
    :
    reply.length > 0 ?
    <SafeAreaView style={{
      flex: 1,
      }}
    >
      <ImageBackground
        style={{
          flex: 1,
          width: '100%',
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
    :
    <SafeAreaView style = {{
      flex: 1,
    }}
    >
      <ImageBackground
        source={require('../assets/gradient_bg.png')}
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          height: '100%',
        }}
      >
        <Text>
          No currently queuing vehicle
        </Text>
        <TouchableOpacity
          onPress = {refPressed}
        >
          <Image
            style = {{
              margin: 20,
              width: 40,
              height: 40
            }}
            source = {require('../assets/reload.png')}
          />
        </TouchableOpacity>
      </ImageBackground>
    </SafeAreaView>
  )
}
export default PUVlist;
