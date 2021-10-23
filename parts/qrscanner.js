import React, { Component, useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import { Button, Icon } from 'react-native-elements';
import QRCodeScanner from 'react-native-qrcode-scanner';

const QRScanner = ({ws}) => {

  const [status, setStatus] = useState('STATUS\n');
  const [botton, setBotton] = useState(true); //You stop here, Remember 1 CORINTHIANS 10:31
  const [reply, setReply] = useState('null');

  //This function is called upon reading the stored data in the QR  Code.
  const readingQr = (e) => {
    setBotton(false);
    let data = e.data;
    loadPassenger(data);
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
          state: "encrypted"
        })
      })
      const json = await response.json();
      setStatus(json);
      ws.send("LOADCHANGES\n");
    }
    catch(error){
      setStatus('Something went wrong');
    }
  }


  //This function is to enable rescanning of QR codes.
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
    position: 'absolute',
    borderRadius: 100, 
    paddingBottom: 75,
  },
  });

  return(
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
      // containerStyle = {{ 
      //   height: 500
      //  }}
      cameraStyle = {{
        height: 675
      }}
    />
  );


}

export default QRScanner;
