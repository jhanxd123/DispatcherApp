import React, { useState, useEffect } from 'react';
import { Text, TextInput, StyleSheet, SafeAreaView, View, TouchableOpacity, Alert, Image, ScrollView, ImageBackground } from 'react-native';
import {Picker} from '@react-native-picker/picker';
import { Input, Icon, ListItem, Button, Card} from 'react-native-elements';
import { black } from 'react-native-paper/lib/typescript/styles/colors';
import Ionicons from 'react-native-vector-icons/Ionicons';

const Manualqueuing = ({navigation, route, ws}) => {
  const [fname, setFname] = useState('');
  const [mname, setMname] = useState('');
  const [lname, setLname] = useState('');
  const [cnum, setCnum] = useState('');
  const [dest, setDest] = useState('');
  const [companion, setCompanion] = useState('');
  const [button, setButton] = useState(false);
  const [status, setStatus] = useState('STATUS');
  const [bColor, setBColor] = useState('#f1d219');

  useEffect(() => {
    const setColorToDefault = navigation.addListener('focus', () => {
      setBColor('#f1d219');
      setButton(false);
      setCompanion('');
    });
    return setColorToDefault;
  }, [navigation]);

  function generateString(length) {
    const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result + "MANUAL";
  }

  const reset = () => {
    setFname('');
    setMname('');
    setLname('');
    setCnum('');
    setDest('');
    setCompanion('');
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

  const validate = () => {
    setBColor('#f1d219');
    setButton(false);
    setCompanion('');
     if(fname.trim() === '' || mname.trim()  === '' || lname.trim() === '' || dest.trim() === ''){
       Alert.alert("Missing fields", "Please fill all the fields");
     }else if(cnum.trim().length != 11){
       Alert.alert("Invalid input", "Contact number dit not meet the amount of numbers required");
     }else if(companion == ''){
       Alert.alert("Missing Information", "Please indicate if the passenger has a companion or not");
     }else{
       let invalid_str = /\d/;
       if(invalid_str.test(fname.trim()) || invalid_str.test(mname.trim()) || invalid_str.test(lname.trim()) ){
         Alert.alert("Invalid input", "Special characters and numbers are not allowed in names");
       }else{
         let invalid_char = /[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/g;
         if(invalid_char.test(fname.trim()) || invalid_char.test(mname.trim()) || invalid_char.test(lname.trim())){
           Alert.alert("Invalid input", "Special characters and numbers are not allowed in names");
         }else{
           let name = fname.trim() + " " + mname.trim() + " " + lname.trim();
           loadPassenger(generateString(5), makeItCorrect(name), dest, companion, cnum);
           reset();
         }
       }
     }
  }

  // This function is for assigning passengers with vehicles.
  const loadPassenger = async(data, name, destination, comp, num) => {
    console.log(data + name + destination + comp);
    try{
      const response = await fetch('http://119.92.152.243/processes/dispatcher_manual_queue.php', {
        method: 'POST',
        headers:{
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data: data,
          name: name,
          destination: destination,
          companion: comp,
          number: num
        })
      });
      const json = await response.json();
      if(json == "error"){
        setStatus("Something went wrong");
      }else{
        setStatus(json);
        ws.send("LOADCHANGES");
        reset();
      }
    }catch(error){
      setStatus('Something went wrong');
      console.log(error);
    }
  }

  return(
    <SafeAreaView style={{flex: 1}}>
      <ImageBackground style={{
          flex: 1
        }}
        source={require('../assets/gradient_bg.png')}
      >
      <ScrollView style={{marginTop: 20}}>
      <View style={{padding: 20}}>
      <View style={{
          marginBottom: 20,
          alignItems: "center"}}>
        <Text style={{fontSize: 20, fontWeight: "bold"}}>
          {status}
        </Text>
      </View>
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
        placeholder = "Last Name (Include suffix if present)"
        returnKeyType = "next"
        onChangeText={setLname}
        value={lname}
      />
      <Input
        style={{
          fontSize: 16,
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
      <View style={{
          borderWidth: 2,
          borderColor: "#aeb6bf",
          borderRadius: 10,
          marginBottom: 10
        }}>
          <Picker
            style={{
              backgroundColor: "#d6dbdf",
              height: 55
            }}
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
        <View style={{
          flexDirection: "row",
          justifyContent: "space-around",
          marginBottom: 30
        }}
        >
          <TouchableOpacity style={{
              paddingTop: 10,
              paddingBottom: 10,
              paddingLeft: 8,
              paddingRight: 8,
              borderRadius: 50,
              backgroundColor: bColor,
              justifyContent: "center",
            }}
            onPress={() => {
              setCompanion('true');
              setButton(true);
              setBColor('#707B7C');
            }}
            disabled={button}
          >
            <Text style={{
              color: "white",
              fontWeight: "bold"
            }}>
              <Ionicons name='people-sharp' size={16}/>  With Companion
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={{
            paddingTop: 10,
            paddingBottom: 10,
            paddingLeft: 8,
            paddingRight: 8,
            borderRadius: 50,
            backgroundColor: bColor,
            justifyContent: "center",
          }}
          onPress={() => {
            setCompanion("false")
            setButton(true);
            setBColor('#707B7C');
          }}
          disabled={button}
          >
            <Text style={{
              color: "white",
              fontWeight: "bold"
            }}>
              <Ionicons name='person' size={16}/> No Companion
            </Text>
          </TouchableOpacity>
        </View>
        <Button
          buttonStyle={{
            borderRadius: 2,
            marginLeft: 0,
            marginRight: 0,
            marginBottom: 0,
            backgroundColor: '#f7dc6f',
            borderRadius: 50
          }}
          title='LOAD PASSENGER'
          titleStyle={{ color: 'black' }}
          onPress={validate}
        />
      </View>
      </ScrollView>
      <View>
        <Text style={{textAlign: 'center', paddingLeft: 10, paddingRight: 10, marginBottom: 10}}>
          <Ionicons name='warning' size={20} color='red'/>
          Using manual queue will bypass the checking of the loaded passengers, keep watch of the status above to avoid multiple loading
        </Text>
      </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

export default Manualqueuing;
