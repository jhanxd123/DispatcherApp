import React, { useState } from 'react';
import { Text, TextInput, StyleSheet, SafeAreaView, View, TouchableOpacity, Alert } from 'react-native';
import {Picker} from '@react-native-picker/picker';

const Manualqueuing = ({warning, route, ws}) => {
  const [fname, setFname] = useState('');
  const [mname, setMname] = useState('');
  const [lname, setLname] = useState('');
  const [cnum, setCnum] = useState('');
  const [dest, setDest] = useState('');
  const [status, setStatus] = useState('STATUS');

   const reminder = () => Alert.alert(
     "Missing Information",
     "Please fill all the fields with the asked information",
     [
       {
         text: "Ok",
         onPress: () => {
         }
       }
     ]
    );

  const reset = () => {
    setFname('');
    setMname('');
    setLname('');
    setCnum('');
    setDest('');
    setStatus('STATUS');
  }

  const validate = () => {
     if(fname.trim() === '' || mname.trim()  === '' || lname.trim() === '' || cnum.trim() === '' || dest.trim() === ''){
       reminder();
     }
     else{
        loadPassenger(JSON.stringify(
          {
            type: "passenger",
            name: fname.trim() + " " + mname.trim() + " " + lname.trim(),
            cnum: cnum.trim(),
            destination: dest.trim()
          }
        )
      );
       reset();
     }
  }

  // This function is for assigning passengers with vehicles.
  const loadPassenger = (data) => {
    fetch('http://192.168.1.6/CapstoneWeb/scan_process.php', {
      method: 'POST',
      headers:{
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        data: data,
        state: "plain"
      })
    }).then((response) => response.json())
    .then((json) => {
      setStatus(json);
      ws.send("LOADCHANGES");
    }).catch((error) => {
      setStatus('Server maybe down');
    });
  }

  return(
    <SafeAreaView style={{padding: 20}}>
      <View style={inputStyle.status}>
        <Text style={{fontSize: 20, color: "red", fontWeight: "bold", fontStyle: "italic"}}>
          {status}
        </Text>
      </View>
      <TextInput
        style={inputStyle.input}
        placeholder = "First name"
        returnKeyType = "next"
        onChangeText={setFname}
        value={fname}
      />
      <TextInput
        style={inputStyle.input}
        placeholder = "Middle name"
        returnKeyType = "next"
        onChangeText={setMname}
        value={mname}
      />
      <TextInput
        style={inputStyle.input}
        placeholder = "Last name"
        returnKeyType = "next"
        onChangeText={setLname}
        value={lname}
      />
      <TextInput
        style={inputStyle.input}
        placeholder = "Contact number"
        keyboardType = "number-pad"
        returnKeyType = "next"
        onChangeText={setCnum}
        value={cnum}
      />
      <View style={inputStyle.container}>
        <Picker
          style={inputStyle.picker}
          selectedValue={dest}
          onValueChange={(itemValue, itemIndex) => setDest(itemValue)}
        >
          <Picker.Item label="Pick a destination" value="" />
          <Picker.Item label="Albuera" value="albuera" />
          <Picker.Item label="Valencia" value="valencia" />
          <Picker.Item label="Puertobello" value="puertobello" />
          <Picker.Item label="Saban-Bao" value="sabang-bao" />
        </Picker>
      </View>
      <TouchableOpacity
        style={inputStyle.pressable}
        onPress={validate}
      >
        <Text
          style={{fontSize: 25}}
        >
        LOAD PASSENGER
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const inputStyle = StyleSheet.create({
  input: {
    fontSize: 20,
    borderColor: "#aeb6bf",
    borderWidth: 2,
    backgroundColor: "#d6dbdf",
    height: 55,
    padding: 10,
    borderRadius: 10,
    marginBottom: 10
  },
  picker: {
    backgroundColor: "#d6dbdf",
    height: 55
  },
  container:{
    borderWidth: 2,
    borderColor: "#aeb6bf",
    borderRadius: 10,
    marginBottom: 40
  },
  pressable:{
    backgroundColor: "#f7dc6f",
    alignItems: "center",
    padding: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#f1c40f"
  },
  status:{
    marginBottom: 20,
    alignItems: "center"
  }
});

export default Manualqueuing;
