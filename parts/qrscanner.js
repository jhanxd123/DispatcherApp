import React, { Component, useState } from 'react';
import { StyleSheet, Text, View, Button, TouchableOpacity} from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';

const QRScanner = (props) => {

  const [plateNo, setPlateNo] = useState('Status');
  const [botton, setBotton] = useState(true); //You stop here, Remember 1 CORINTHIANS 10:31
  const [reply, setReply] = useState('null');

  //asdf
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
        console.log(reply);
        props.ws.send(reply);
    }).catch((error) => {
      console.error(error);
    });
  }

  //This function is called upon reading the stored data in the QR  Code.
  const readingQr = (e) => {
    setBotton(false);
    let data = e.data;
    process(data);
  }

  // This function is for assigning passengers with vehicles.
  const process = (data) => {
    fetch('http://192.168.1.15/CapstoneWeb/scan_process.php', {
      method: 'POST',
      headers:{
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        data: data
      })
    }).then((response) => response.json())
    .then((json) => {
      setPlateNo(json);
    }).catch((error) => {
      setPlateNo('Server maybe down');
    });
    retrieveList();
  }


  //This function is to enable rescanning of QR codes.
  const reScan = () => {
    scanner.reactivate();
    setBotton(true);
    setPlateNo('Status');
  }

  return(
    <QRCodeScanner
      showMarker
      onRead = {readingQr}
      ref = {(node) => {scanner = node}}
      bottomContent = {
        <View style={{width: "45%"}}>
          <Button
            title='SCAN'
            onPress={reScan}
            disabled={botton}
            />
        </View>
      }
      topContent = {
        <View>
          <Text style={{fontSize: 25}}>
            {plateNo}
          </Text>
        </View>
      }
      cameraStyle = {{
        marginTop: 21,
      }}
      topViewStyle = {{
        marginBottom: 20,
      }}
    />
  );

}

export default QRScanner;
