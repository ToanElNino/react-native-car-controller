import React, { useState, useEffect } from 'react';
import { View, Text, Button } from 'react-native';
import BluetoothSerial from 'react-native-bluetooth-serial';

const CarControlScreen = () => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    initializeBluetooth();
  }, []);

  const initializeBluetooth = async () => {
    try {
      await BluetoothSerial.requestEnable();
      await BluetoothSerial.list();
      await BluetoothSerial.connect('7C:A1:AE:9F:81:5B'); // Địa chỉ MAC của module HC-06
      setIsConnected(true);
    } catch (error) {
      console.error('Bluetooth initialization error:', error);
    }
  };

  const sendCommand = async (command) => {
    if (!isConnected) {
      console.error('Not connected to the car.');
      return;
    }

    try {
      await BluetoothSerial.write(command);
      console.log('Command sent:', command);
    } catch (error) {
      console.error('Sending command error:', error);
    }
  };

  return (
    <View>
      <Text>Car Control</Text>
      <Button title="Accelerate" onPress={() => sendCommand('accelerate')} />
      <Button title="Brake" onPress={() => sendCommand('brake')} />
      {/* Thêm các nút điều khiển khác */}
    </View>
  );
};

export default CarControlScreen;
