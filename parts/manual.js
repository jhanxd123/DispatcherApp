import React, { useState } from 'react';
import { Text, TextInput, StyleSheet, SafeAreaView, View, TouchableOpacity } from 'react-native';
import {Picker} from '@react-native-picker/picker';

const Manualqueuing = () => {
  const [fname, setFname] = useState('');
  const [mname, setMname] = useState('');
  const [lname, setLname] = useState('');
  const [cnum, setCnum] = useState('');
  const [dest, setDest] = useState('');

  const validate = () => {
     if(fname === '' || mname === '' || lname === '' || cnum === '' || dest === ''){
        console.log("cannot queue");
     }
     else{
       console.log("Okay");
     }
  }

  return(
    <SafeAreaView style={{padding: 20}}>
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
    marginBottom: 70
  },
  pressable:{
    backgroundColor: "#f7dc6f",
    alignItems: "center",
    padding: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#f1c40f"
  }
})

export default Manualqueuing;
