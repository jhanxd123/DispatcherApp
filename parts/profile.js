import React, { useState } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, Image } from 'react-native';


 const Profile = (props) => {
  return(
    <SafeAreaView
      style = {{
        flex: 1,
        alignItems: "center"
      }}
    >
      <Image
        source = {require('../assets/profile.png')}
        style = {{
           width: 150,
           height: 150,
           margin: 20
        }}
      />
      <Text
        style = {{
          fontWeight: "bold",
          fontStyle: "italic",
          fontSize: 25,
        }}
      >
        {props.profilename}
      </Text>
      <TouchableOpacity
        style = {{
          marginTop: 100,
          borderWidth: 2,
          padding: 10,
          width: 150,
          alignItems: "center"
        }}
        onPress = {() => console.log("Hello World")}
      >
        <Text
          style = {{
            fontWeight: "bold",
            fontSize: 15,
          }}
        >
          LOG-OUT
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

export default Profile;
