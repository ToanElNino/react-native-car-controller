import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  NativeModules,
  NativeEventEmitter,
  PermissionsAndroid,
  Platform
} from 'react-native';
import DeviceModal from './DeviceConnectionModal';
import PulseIndicator from './PulseIndicator';
import useBLE from './useBLE';
import BleManager from 'react-native-ble-manager';


const BleManagerModule = NativeModules.BleManager;
const BleManagerEmitter = new NativeEventEmitter(BleManagerModule);
const TestBLE = () => {
  useEffect(() => {
    // turn on bluetooth if it is not on
    BleManager.enableBluetooth().then(() => {
      console.log('Bluetooth is turned on!');
    });
    // start bluetooth manager
    BleManager.start({showAlert: false}).then(() => {
      console.log('BLE Manager initialized');
    });
    let stopListener = BleManagerEmitter.addListener(
      'BleManagerStopScan',
      () => {
        console.log('Scan is stopped');
      },
    );
    if (Platform.OS === 'android' && Platform.Version >= 23) {
      PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ).then(result => {
        if (result) {
          console.log('Permission is OK');
        } else {
          PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          ).then(result => {
            if (result) {
              console.log('User accept');
            } else {
              console.log('User refuse');
            }
          });
        }
      });
    }
    return () => {
      stopListener.remove();
    };
  }, []);
  const {
    stopScanning,
    requestPermissions,
    scanForPeripherals,
    allDevices,
    connectToDevice,
    connectedDevice,
    heartRate,
    disconnectFromDevice,
  } = useBLE();
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  const scanForDevices = () => {
    console.log('1')
    requestPermissions(isGranted => {
      console.log(isGranted)

      if (isGranted) {
        scanForPeripherals();
      }
    });
  };

  const hideModal = () => {
    setIsModalVisible(false);
  };

  const openModal = async () => {
    scanForDevices();
    setIsModalVisible(true);
  };
  const scanBLEManager = () =>{
    console.log('2');
    BleManager.scan([], 10, true)
        .then((res) => {
          console.log('res: ', res)
        })
        .catch(error => {
          console.error('error: ', error);
        });
  }
  const stopScanning1 = () =>{
    stopScanning();
  }
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.heartRateTitleWrapper}>
        {connectedDevice ? (
          <>
            <PulseIndicator />
            <Text style={styles.heartRateTitleText}>Your Heart Rate Is:</Text>
            <Text style={styles.heartRateText}>{heartRate} bpm</Text>
          </>
        ) : (
          <Text style={styles.heartRateTitleText}>
            Please Connect to a Heart Rate Monitor
          </Text>
        )}
      </View>
      <TouchableOpacity
        onPress={connectedDevice ? disconnectFromDevice : openModal}
        style={styles.ctaButton}>
        <Text style={styles.ctaButtonText}>
          {connectedDevice ? 'Disconnect' : 'Connect'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={stopScanning1}
        style={styles.ctaButton}>
        <Text style={styles.ctaButtonText}>
          {'SStop scanning'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={scanBLEManager}
        style={styles.ctaButton}>
        <Text style={styles.ctaButtonText}>
          {'Scan by ble manager'}
        </Text>
      </TouchableOpacity>
      <DeviceModal
        closeModal={hideModal}
        visible={isModalVisible}
        connectToPeripheral={connectToDevice}
        devices={allDevices}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  heartRateTitleWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartRateTitleText: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginHorizontal: 20,
    color: 'black',
  },
  heartRateText: {
    fontSize: 25,
    marginTop: 15,
  },
  ctaButton: {
    backgroundColor: 'purple',
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    marginHorizontal: 20,
    marginBottom: 5,
    borderRadius: 8,
  },
  ctaButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default TestBLE;

