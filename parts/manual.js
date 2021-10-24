import React, { useState } from 'react';
import { Text, TextInput, StyleSheet, SafeAreaView, View, TouchableOpacity, Alert, Image, ScrollView } from 'react-native';
import {Picker} from '@react-native-picker/picker';
import { Input, Icon, ListItem, Button, Card} from 'react-native-elements';
import { black } from 'react-native-paper/lib/typescript/styles/colors';

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
  const loadPassenger = async(data) => {
    try{
      const response = await fetch('http://192.168.2.31/CapstoneWeb/processes/scan_process.php', {
        method: 'POST',
        headers:{
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data: data,
          state: "plain"
        })
      });
      const json = await response.json();
      setStatus(json);
      ws.send("LOADCHANGES");
    }catch(error){
      setStatus('Something went wrong')
    }
  }

  return(
    <SafeAreaView style={{ marginTop: 20 }}>
      <ScrollView>
        <Card 
          containerStyle={{ 
            marginBottom: 20,
            borderTopEndRadius: 15,
            borderTopStartRadius: 15,
            borderBottomStartRadius: 15,
            borderBottomEndRadius: 15,

            }}
          >
          <Card.Divider/>
          <View style={inputStyle.status}>
            <Text style={{fontSize: 20, color: "red", fontWeight: "bold", fontStyle: "italic"}}>
              {status}
            </Text>
          </View>
          <Input
            // label="First Name"
            // placeholderTextColor="#fff"
            // labelStyle={{ color:'white',  fontWeight: "300"}}
            // inputStyle={{ color:'white', fontWeight: "400", fontSize: 20 }}
            // inputContainerStyle={{ borderBottomColor: '#fff' }}
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
            // label="Middle Name"
            // placeholderTextColor="#fff"
            // labelStyle={{ color:'white', fontWeight: "300", }}
            // inputStyle={{ color:'white', fontWeight: "400", fontSize: 20 }}
            // inputContainerStyle={{ borderBottomColor: '#fff' }}
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
            // label="Last Name"
            // placeholderTextColor="#fff"
            // labelStyle={{ color:'white', fontWeight: "300"}}
            // inputStyle={{ color:'white', fontWeight: "400", fontSize: 20 }}
            // inputContainerStyle={{ borderBottomColor: '#fff' }}
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
            // label="Contact Number"
            // placeholderTextColor="#fff"
            // labelStyle={{ color:'white', fontWeight: "300" }}
            // inputStyle={{ color:'white', fontWeight: "400", fontSize: 20 }}
            // inputContainerStyle={{ borderBottomColor: '#fff' }}
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
                <Picker.Item label="Sabang-Bao" value="sabangbao" />
              </Picker>
            </View>
            <Button
              // icon={<Icon name='add' color='#ffffff' />}
              buttonStyle={{
                borderRadius: 2, 
                marginLeft: 0, 
                marginRight: 0, 
                marginBottom: 0,
                backgroundColor: '#f7dc6f',
              }}
              title='LOAD PASSENGER' 
              titleStyle={{ color: 'black' }}
              onPress={validate}  
            />
        </Card>
      </ScrollView>
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
