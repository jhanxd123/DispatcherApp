import React, { Component, useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, Text, View, TouchableOpacity, Dimensions, Alert, ScrollView, Image, ImageBackground } from 'react-native';
import { Button, Icon, Input } from 'react-native-elements';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { BottomSheet } from 'react-native-btr';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Sound from 'react-native-sound';

var goodSound = new Sound(require('../assets/success.mp3'));

const QRScanner = ({ws}) => {

  const [status, setStatus] = useState('STATUS\n');
  const [botton, setBotton] = useState(true); //You stop here, Remember 1 CORINTHIANS 10:31
  const [reply, setReply] = useState('null');
  const [visible, setVisible] = useState(false);
  const [regvisible, setRegVisible] = useState(false);
  const [qrval, setQRVal] = useState('');
  const [dest, setDest] = useState('');
  const [firstbtn, setFirstBtn] = useState(false);
  const [secbtn, setSecBtn] = useState(true);
  const [fname, setFname] = useState('');
  const [mname, setMname] = useState('');
  const [lname, setLname] = useState('');
  const [cnum, setCnum] = useState('');
  const [bColor, setBColor] = useState('#2471A3');
  const [buttonColor, setButtonColor] = useState(require('../assets/button_dis_gradient.png'));
  const height  = Dimensions.get('screen').height;
  const width  = Dimensions.get('screen').width;

  const readingQr = (e) => {
    if(e.data.match(/ORMOC/) == null){
      ws.send('LOADCHANGES');
      goodSound.play();
      queueVehicle(e.data);
    }else{
      ws.send('LOADCHANGES');
      goodSound.play();
      setQRVal(e.data);
      setVisible(true);
    }
  }

  const makeItCorrect = (value) => {
    let name = value.trim().toLowerCase();
    let tempName = '';
    let repoName = '';
    let finalName = '';
    name = name + ' ';
    let nameLength = name.length;
    for(let i = 0; i < nameLength; i++){
      if(name[i] == ' '){
        if(tempName != ''){
          repoName = tempName.charAt(0).toUpperCase() + tempName.slice(1) + ' ';
          finalName = finalName + repoName;
          tempName = '';
        }
      }else{
        tempName = tempName + name[i];
      }
    }
    return finalName.trim();
  }

  const reset = () => {
    setFname('');
    setMname('');
    setLname('');
    setCnum('');
    setRegVisible(false);
  }

  const checkPassengerStatus = async(data, destination, comp) => {
    setStatus('Processing...\n');
    setBColor('#2471A3');
    try{
      const response = await fetch('http://192.168.1.25/CapstoneWeb/processes/dispatcher_scan_process.php', {
        method: 'POST',
        headers:{
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data: data,
          destination: destination
        })
      });
      const json = await response.json();
      setBotton(false);
      setButtonColor(require('../assets/button_gradient.png'));
      if(json == "clear"){
        loadPassenger(data, destination, comp);
      }else if(json == "waiting"){
        setStatus("Passenger is in waiting list\n");
        Alert.alert("Waiting", "Passenger is in waiting list", [
          {
            text: "Ok"
          },
          {
            text: "Remove",
            onPress: () => removePassenger(data, "waiting")
          },
          {
            text: "Load",
            onPress: () => loadPassenger(data, destination, comp)
          },
        ],
        {
          cancelable: true
        })
      }else if(json == "notregistered"){
        setStatus("Passenger is not registered\n");
        Alert.alert("Not registered", "Passenger's QR is not yet registered, do you want to register it?",
        [
          {
            text: "Cancel"
          },
          {
            text: "Ok",
            onPress: () => setRegVisible(true)
          }
        ])
      }else if(json == "error"){
        setStatus('Something went wrong\n');
      }else{
        setStatus("Passenger is already loaded on " + json + "\n");
        Alert.alert("Loaded", "Passenger is already loaded on " + json, [
          {
            text: "Ok"
          },
          {
            text: "Remove",
            onPress: () => removePassenger(data, "loaded")
          },
        ],
        {
          cancelable: true
        })
      }
      console.log(json);
    }catch(error){
      setBotton(false);
      setButtonColor(require('../assets/button_gradient.png'));
      setStatus('Something went wrong\n');
    }
  }

  const loadPassenger = async(data, destination, companion) => {
    try{
      const response = await fetch('http://192.168.1.25/CapstoneWeb/processes/dispatcher_load_passenger.php', {
        method: "POST",
        headers:{
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data: data,
          destination: destination,
          companion: companion
        })
      });
      const json = await response.json();
      if(json == "waitinglist"){
        setStatus("Passenger added to waiting list\n");
      }else if(json == "error"){
        setStatus("Something went wrong\n");
      }else{
        setStatus("Directly to " + json + "\n");
        ws.send("LOADCHANGES");
      }
    }catch(error){
      setBotton(false);
      setButtonColor(require('../assets/button_gradient.png'));
      setStatus("Something went wrong\n");
    }
  }

  const removePassenger = async(data, status) => {
    try{
      const response = await fetch('http://192.168.1.25/CapstoneWeb/processes/dispatcher_remove_passenger.php',{
        method: "POST",
        headers:{
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data: data,
          status: status
        })
      });
      const json = await response.json();
      if(json == "success"){
        ws.send("RELOADPUV");
        setStatus("Passenger removed\n");
        Alert.alert("Passenger removed", "Passenger is successfully removed", [{
          text: "Ok"
        }],
      {
        cancelable: true
      });
      }else if(json == "error"){
        setStatus("Something went wrong\n");
        Alert.alert("Something went wrong", "Something went wrong, removing the passenger", [{
          text: "Ok"
        }],
      {
        cancelable: true
      });
      }else{
        setStatus("Something went wrong\n");
        Alert.alert("Something went wrong", "Something went wrong, removing the passenger", [{
          text: "Ok"
        }],
      {
        cancelable: true
      });
      }
    }catch(error){
      setBotton(false);
      setButtonColor(require('../assets/button_gradient.png'));
      setStatus("Something went wrong\n");
      Alert.alert("Something went wrong", "Something went wrong removing the passenger", {
        cancelable: true
      });
    }
  }

  const queueVehicle = async(data) => {
    setStatus('Processing...\n');
    setBColor('#2471A3');
    try{
      const response = await fetch('http://192.168.1.25/CapstoneWeb/processes/dispatcher_queue_vehicles.php',{
        method: 'POST',
        headers:{
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data: data
        })
      });
      const json = await response.json();
      setBotton(false);
      setButtonColor(require('../assets/button_gradient.png'));
      setStatus(json + '\n');
      if(json == "Vehicle is set to queuing"){
        ws.send("LOADCHANGES");
      }
    }catch(error){
      setStatus("Something went wrong\n");
      setBotton(false);
      setButtonColor(require('../assets/button_gradient.png'));
    }
  }

  const checkInfo = async () => {
    if (fname.trim() === '' || mname.trim() === '' || lname.trim() === '' || cnum.trim() === '') {
      Alert.alert("Missing fields", "Please fill all the fields");
    }else if(cnum.trim().length != 11){
      Alert.alert("Invalid input", "Contact number dit not meet the amount of numbers required");
    }
    else if(qrval == ''){
      Alert.alert("No QR code scanned", "There is no value to store");
    }
    else{
      let invalid_char = /[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/g;
      if(invalid_char.test(fname.trim()) || invalid_char.test(mname.trim()) || invalid_char.test(lname.trim())){
        Alert.alert("Invalid input", "Special characters are not allowed e.g. (dot, comma, numbers, etc.)");
      }else{
        let invalid_str = /\d/;
        if(invalid_str.test(fname.trim()) || invalid_str.test(mname.trim()) || invalid_str.test(lname.trim()) ){
          Alert.alert("Invalid input", "Special characters are not allowed e.g. (dot, comma, numbers, etc.)");
        }else{
          let fullname = fname.trim() + ' ' + mname.trim() + ' ' + lname.trim();
          let contact = cnum;
          try{
            const response = await fetch('http://192.168.1.25/CapstoneWeb/processes/passenger_register_qr.php', {
              method: 'POST',
              headers:{
                Accept: 'application/json',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                fullname: makeItCorrect(fullname),
                contact: contact,
                qr: qrval
              })
            });
            const json = await response.json();
            if(json == 'success'){
              setStatus('Passenger successfully registered\n');
              Alert.alert("Success", "Passenger is successfully registered");
              reset();
            }else if(json == 'registered'){
              setStatus('QR is already registered\n');
              Alert.alert("Already registered", "QR is already registered");
              reset();
            }else if(json == 'error'){
              setStatus('Something went wrong\n');
              Alert.alert("Error", "Something went wrong");
              reset();
            }else{
              setStatus('Something went wrong\n');
              Alert.alert("Error", "Something went wrong");
              reset();
            }
          }catch(error){
            setBotton(false);
            setButtonColor(require('../assets/button_gradient.png'));
            Alert.alert("Error", "Something went wrong");
            reset();
          }
        }
      }
    }
  }

  const reScan = () => {
    scanner.reactivate();
    setBotton(true);
    setStatus('STATUS\n');
    setButtonColor(require('../assets/button_dis_gradient.png'));
  }

  return(
    <View style={{
      flex: 1,
    }}>
    <QRCodeScanner
      onRead = {readingQr}
      ref = {(node) => {scanner = node}}
      bottomContent = {
        <View style={{position: 'relative', width: '100%', height: 350, background: 'green'}}>
          <View style={{paddingTop: 20, position: 'absolute', height: 350, width: '100%', zIndex: 1, alignItems: 'center'}}>
            <Text style={{fontWeight: 'bold', fontSize: 18}}>
              {status}
            </Text>
            <TouchableOpacity
              style={{
                zIndex: 2,
                width: 80,
                height: 80,
                borderRadius: 50,
                justifyContent: 'center',
                shadowColor: "#000",
                shadowOffset: {
          	       width: 0,
          	        height: 9,
                  },
                shadowOpacity: 0.50,
                shadowRadius: 12.35,
                elevation: 19,
                overflow: 'hidden'
              }}
              onPress={reScan}
              disabled={botton}
            >
              <ImageBackground style={{flex: 1, justifyContent: 'center'}} source={buttonColor}>
                <Icon
                  name='qrcode'
                  type='font-awesome-5'
                  size={28}
                />
              </ImageBackground>
            </TouchableOpacity>
          </View>
          <ImageBackground
            style={{flex: 1, opacity: 0.5, zIndex: 0}}
            source={require('../assets/gradient_bg.png')}
          >
          </ImageBackground>
        </View>
      }
      cameraStyle = {{
        height: '99.9%'
      }}
    />
    <BottomSheet
      visible={visible}
    >
      <View
        style={{
          backgroundColor: 'white',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          height: 400,
          overflow: 'hidden'
        }}
      >
      <ImageBackground
        source={require('../assets/gradient_bg.png')}
        style={{
          flex: 1,
          paddingRight: 5,
          paddingLeft: 5,
          paddingTop: 10,
          paddingBottom: 20,
        }}
      >
        <TouchableOpacity
          onPress={() => {
            setVisible(false);
            setFirstBtn(false);
            setSecBtn(true);
            setBotton(false);
            setButtonColor(require('../assets/button_gradient.png'));
            setBColor('#2471A3');
          }}
          style={{
            width: 40,
            height: 40,
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <Image source={require('../assets/back.png')}/>
        </TouchableOpacity>
        <ScrollView>
            <TouchableOpacity style={{
              marginBottom: 5,
              height: 60,
              backgroundColor: bColor,
              borderRadius: 50,
              justifyContent: "center",
              alignItems: "center",
              }}
              disabled={firstbtn}
              onPress={() => {
                setDest('valencia');
                setSecBtn(false);
                setFirstBtn(true);
                setBColor('#707B7C');
              }}
            >
              <Text style={{
                  fontWeight: "bold",
                  fontSize: 25,
                  color: "white"
                }}
              >
                Valencia
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={{
              marginBottom: 5,
              height: 60,
              backgroundColor: bColor,
              borderRadius: 50,
              justifyContent: "center",
              alignItems: "center",
              }}
              disabled={firstbtn}
              onPress={() => {
                setDest('puertobello');
                setSecBtn(false);
                setFirstBtn(true);
                setBColor('#707B7C');
              }}
            >
              <Text style={{
                  fontWeight: "bold",
                  fontSize: 25,
                  color: "white"
                }}
              >
                Puertobello
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={{
              marginBottom: 5,
              height: 60,
              backgroundColor: bColor,
              borderRadius: 50,
              justifyContent: "center",
              alignItems: "center",
              }}
              disabled={firstbtn}
              onPress={() => {
                setDest('albuera');
                setSecBtn(false);
                setFirstBtn(true);
                setBColor('#707B7C');
              }}
            >
              <Text style={{
                  fontWeight: "bold",
                  fontSize: 25,
                  color: "white"
                }}
              >
                Albuera
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={{
              marginBottom: 5,
              height: 60,
              backgroundColor: bColor,
              borderRadius: 50,
              justifyContent: "center",
              alignItems: "center",
              }}
              disabled={firstbtn}
              onPress={() => {
                setDest('sabangbao');
                setSecBtn(false);
                setFirstBtn(true);
                setBColor('#707B7C');
              }}
            >
              <Text style={{
                  fontWeight: "bold",
                  fontSize: 25,
                  color: "white"
                }}
              >
                Sabang-Bao
              </Text>
            </TouchableOpacity>
            <View style={{
              flexDirection: "row",
              justifyContent: "space-around"
            }}
            >
              <TouchableOpacity style={{
                  height: 50,
                  paddingLeft: 8,
                  paddingRight: 8,
                  borderRadius: 50,
                  backgroundColor: "#f1d219",
                  justifyContent: "center",
                }}
                disabled={secbtn}
                onPress={() => {
                  checkPassengerStatus(qrval, dest, "true");
                  setSecBtn(true);
                  setFirstBtn(false);
                  setVisible(false);
                }}
              >
                <Text style={{
                  color: "white",
                  fontWeight: "bold"
                }}>
                  <Ionicons name='people-sharp' size={16}/> With Companion
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={{
                height: 50,
                paddingLeft: 8,
                paddingRight: 8,
                borderRadius: 50,
                backgroundColor: "#f1d219",
                justifyContent: "center",
              }}
                disabled={secbtn}
                onPress={() => {
                  checkPassengerStatus(qrval, dest, "false");
                  setSecBtn(true);
                  setFirstBtn(false);
                  setVisible(false);
                }}
              >
                <Text style={{
                  color: "white",
                  fontWeight: "bold"
                }}>
                  <Ionicons name='person' size={16}/> No Companion
                </Text>
              </TouchableOpacity>
            </View>
        </ScrollView>
        </ImageBackground>
      </View>
    </BottomSheet>
    <BottomSheet
      visible={regvisible}
    >
      <View style={{
        backgroundColor: "white",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        overflow: 'hidden',
        height: 400
      }}>
      <ImageBackground
        source={require('../assets/gradient_bg.png')}
        style={{
          paddingRight: 5,
          paddingLeft: 5,
          paddingTop: 10,
          paddingBottom: 20,
          height: 400
        }}
      >
      <TouchableOpacity
        onPress={() => reset()}
        style={{
          width: 40,
          height: 40,
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <Image source={require('../assets/back.png')}/>
      </TouchableOpacity>
        <ScrollView>
        <Input
          style={{
            fontSize: 16
          }}
          leftIcon={
            <Icon
              name='user'
              type='feather'
              size={22}
              color='black'
            />
          }
          placeholder = "First Name"
          returnKeyType = "next"
          onChangeText={setFname}
          value={fname}
        />
        <Input
          style={{
            fontSize: 16
          }}
          leftIcon={
            <Icon
              name='user'
              type='feather'
              size={22}
              color='black'
            />
          }
          placeholder = "Middle Name"
          returnKeyType = "next"
          onChangeText={setMname}
          value={mname}
        />
        <Input
          style={{
            fontSize: 16
          }}
          leftIcon={
            <Icon
              name='user'
              type='feather'
              size={22}
              color='black'
            />
          }
          placeholder = "Last Name (Include the suffix here if there is)"
          returnKeyType = "next"
          onChangeText={setLname}
          value={lname}
        />
        <Input
          style={{
            fontSize: 16
          }}
          leftIcon={
            <Icon
              name='hash'
              type='feather'
              size={22}
              color='black'
            />
          }
          placeholder = "Mobile No. (e.g. 09306319388)"
          keyboardType = "number-pad"
          returnKeyType = "next"
          onChangeText={setCnum}
          value={cnum}
        />
          <Button
            buttonStyle={{
              borderRadius: 50,
              marginLeft: 20,
              marginRight: 20,
              backgroundColor: '#f7dc6f',
            }}
            title='REGISTER'
            titleStyle={{ color: 'black' }}
            onPress = {checkInfo}
          />
        </ScrollView>
        </ImageBackground>
      </View>
    </BottomSheet>
    </View>
  );
}

export default QRScanner;
