import React, { Component, useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, Text, View, TouchableOpacity, Dimensions, Alert, ScrollView, Image } from 'react-native';
import { Button, Icon, Input} from 'react-native-elements';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { BottomSheet } from 'react-native-btr';

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
  const height  = Dimensions.get('screen').height;
  const width  = Dimensions.get('screen').width;

  const readingQr = (e) => {
    if(e.data.match(/ORMOC/) == null){
      queueVehicle(e.data);
    }else{
      setQRVal(e.data);
      setVisible(true);
    }
    setBotton(false);
  }

  const reset = () => {
    setFname('');
    setMname('');
    setLname('');
    setCnum('');
    setRegVisible(false);
  }

  const checkPassengerStatus = async(data, destination, comp) => {
    try{
      const response = await fetch('http://119.92.152.243/processes/dispatcher_scan_process.php', {
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
      if(json == "clear"){
        loadPassenger(data, destination, comp);
        console.log("clear");
      }else if(json == "waiting"){
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
        setStatus('Something went wrong');
      }else{
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
    }catch(error){
      setStatus('Something went wrong');
    }
  }

  const loadPassenger = async(data, destination, companion) => {
    try{
      const response = await fetch('http://119.92.152.243/processes/dispatcher_load_passenger.php', {
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
        setStatus("Passenger added to waiting list");
      }else if(json == "error"){
        setStatus("Something went wrong");
      }else{
        setStatus("Directly to " + json);
        ws.send("LOADCHANGES");
      }
    }catch(error){
      setStatus('Something went wrong');
    }
  }

  const removePassenger = async(data, status) => {
    try{
      const response = await fetch('http://119.92.152.243/processes/dispatcher_remove_passenger.php',{
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
        Alert.alert("Passenger removed", "Passenger is successfully removed", [{
          text: "Ok"
        }],
      {
        cancelable: true
      });
      }else if(json == "error"){
        Alert.alert("Something went wrong", "Something went wrong, removing the passenger", [{
          text: "Ok"
        }],
      {
        cancelable: true
      });
      }else{
        Alert.alert("Something went wrong", "Something went wrong, removing the passenger", [{
          text: "Ok"
        }],
      {
        cancelable: true
      });
      }
    }catch(error){
      Alert.alert("Something went wrong", "Something went wrong removing the passenger", {
        cancelable: true
      });
    }
  }

  const queueVehicle = async(data) => {
    try{
      const response = await fetch('http://119.92.152.243/processes/dispatcher_queue_vehicles.php',{
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
      setStatus(json);
      if(json == "Vehicle is set to queuing"){
        ws.send("LOADCHANGES");
      }
    }catch(error){
      setStatus("Something went wrong");
    }
  }

  const checkInfo = async () => {
    if (fname.trim() === '' || mname.trim() === '' || lname.trim() === '' || cnum.trim() === '') {
      Alert.alert("Error", "Please fill all the field");
    }
    else if(qrval == ''){
      Alert.alert("Error", "No QR code scanned");
    }
    else{
      let fullname = fname.trim() + ' ' + mname.trim() + ' ' + lname.trim();
      let contact = cnum;
      try{
        const response = await fetch('http://119.92.152.243/processes/passenger_register_qr.php', {
          method: 'POST',
          headers:{
            Accept: 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            fullname: fullname,
            contact: contact,
            qr: qrval
          })
        });
        const json = await response.json();
        if(json == 'success'){
          Alert.alert("Success", "Passenger is successfully registered");
          reset();
        }else if(json == 'registered'){
          Alert.alert("Already registered", "QR is already registered");
          reset();
        }else if(json == 'error'){
          Alert.alert("Error", "Something went wrong");
          reset();
        }else{
          Alert.alert("Error", "Something went wrong");
          reset();
        }
      }catch(error){
        Alert.alert("Error", "Something went wrong");
        setRegVisible(false);
      }
    }
  }

  const reScan = () => {
    scanner.reactivate();
    setBotton(true);
    setStatus('STATUS\n');
  }

  const customStyles = StyleSheet.create({
  cButton: {
    width: 100,
    height: 100,
    alignItems: 'center',
    marginLeft: 50,
    borderRadius: 100,
    backgroundColor: '#f1d219',
    paddingTop: 18,
  },
  cView: {
    width: "50%",
    paddingBottom: 130
  },
  });

  return(
    <View style={{
      flex: 1
    }}>
    <QRCodeScanner
      showMarker
      onRead = {readingQr}
      ref = {(node) => {scanner = node}}
      bottomContent = {
        <View style = {customStyles.cView}>
          <Text style={{fontSize: 25, color: 'white', fontWeight: "bold", fontStyle: "italic", textAlign: 'center', position: 'relative'}}>
            {status}
          </Text>
          <TouchableOpacity
            style={customStyles.cButton}
            onPress={reScan}
            disabled={botton}
            >
               <Icon
                name='qrcode'
                type='font-awesome-5'
                size={28}
                />
          </TouchableOpacity>
        </View>
      }
      cameraStyle = {{
        height: '99.9%'
      }}
    />
    <BottomSheet
      visible={visible}
    >
      <View style={{
        backgroundColor: "white",
        paddingRight: 5,
        paddingLeft: 5,
        paddingTop: 10,
        paddingBottom: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: 400
      }}
      >
        <TouchableOpacity
          onPress={() => {
            setVisible(false);
            setFirstBtn(false);
            setSecBtn(true);
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
              backgroundColor: "#00a2e8",
              borderRadius: 5,
              justifyContent: "center",
              alignItems: "center",
              }}
              disabled={firstbtn}
              onPress={() => {
                setDest('valencia');
                setSecBtn(false);
                setFirstBtn(true);
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
              backgroundColor: "#00a2e8",
              borderRadius: 5,
              justifyContent: "center",
              alignItems: "center",
              }}
              disabled={firstbtn}
              onPress={() => {
                setDest('puertobello');
                setSecBtn(false);
                setFirstBtn(true);
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
              backgroundColor: "#00a2e8",
              borderRadius: 5,
              justifyContent: "center",
              alignItems: "center",
              }}
              disabled={firstbtn}
              onPress={() => {
                setDest('albuera');
                setSecBtn(false);
                setFirstBtn(true);
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
              backgroundColor: "#00a2e8",
              borderRadius: 5,
              justifyContent: "center",
              alignItems: "center",
              }}
              disabled={firstbtn}
              onPress={() => {
                setDest('sabangbao');
                setSecBtn(false);
                setFirstBtn(true);
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
                  borderRadius: 5,
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
                  With Companion
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={{
                height: 50,
                paddingLeft: 8,
                paddingRight: 8,
                borderRadius: 5,
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
                  No Companion
                </Text>
              </TouchableOpacity>
            </View>
        </ScrollView>
      </View>
    </BottomSheet>
    <BottomSheet
      visible={regvisible}
    >
      <View style={{
        backgroundColor: "white",
        paddingRight: 5,
        paddingLeft: 5,
        paddingTop: 10,
        paddingBottom: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: 400
      }}>
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
          leftIcon={
            <Icon
              name='user'
              type='feather'
              size={22}
              color='black'
            />
          }
          placeholder = "Last Name"
          returnKeyType = "next"
          onChangeText={setLname}
          value={lname}
        />
        <Input
          leftIcon={
            <Icon
              name='hash'
              type='feather'
              size={22}
              color='black'
            />
          }
          placeholder = "Contact number"
          keyboardType = "number-pad"
          returnKeyType = "next"
          onChangeText={setCnum}
          value={cnum}
        />
          <Button
            buttonStyle={{
              borderRadius: 2,
              marginLeft: 20,
              marginRight: 20,
              backgroundColor: '#f7dc6f',
            }}
            title='REGISTER'
            titleStyle={{ color: 'black' }}
            onPress = {checkInfo}
          />
        </ScrollView>
      </View>
    </BottomSheet>
    </View>
  );
}

export default QRScanner;
