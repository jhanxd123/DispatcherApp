import React, { Component, useState } from 'react';
import { StyleSheet, Text, View, Button, TouchableOpacity} from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';

const QRScanner = ({ws}) => {

  const [status, setStatus] = useState('STATUS');
  const [botton, setBotton] = useState(true); //You stop here, Remember 1 CORINTHIANS 10:31
  const [reply, setReply] = useState('null');

  //This function is called upon reading the stored data in the QR  Code.
  const readingQr = (e) => {
    setBotton(false);
    let data = e.data;
    loadPassenger(data);
  }

  // This function is for assigning passengers with vehicles.
  const loadPassenger = (data) => {
    fetch('http://192.168.1.10/CapstoneWeb/scan_process.php', {
      method: 'POST',
      headers:{
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        data: data,
        state: "encrypted"
      })
    }).then((response) => response.json())
    .then((json) => {
      setStatus(json);
      ws.send("PUVCHANGES");
    }).catch((error) => {
      setStatus('Server maybe down');
    });
  }


  //This function is to enable rescanning of QR codes.
  const reScan = () => {
    scanner.reactivate();
    setBotton(true);
    setStatus('STATUS');
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
          <Text style={{fontSize: 20, color: "red", fontWeight: "bold", fontStyle: "italic"}}>
            {status}
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
