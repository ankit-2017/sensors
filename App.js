import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, Button, RefreshControl, PermissionsAndroid, ToastAndroid} from 'react-native';
import {accelerometer, setUpdateIntervalForType, SensorTypes} from 'react-native-sensors';
import RNFetchBlob from 'rn-fetch-blob';
import {Picker, Header, Container, Content, Form} from 'native-base';
var RNFS = require('react-native-fs');
import Graph from './graph';

const pathTempWrite = `${RNFetchBlob.fs.dirs.DownloadDir}/tmp.csv`;

export default class App extends Component {
  constructor(props){
    super(props);
    this.state ={
      x:0,
      y:0,
      z:0,
      timestamp:0,
      start : false,
      sensordata : [],
      file_name: 'sensor_data400ms',
      file_path:'',
      selectedHz: '10'
    }
    
    this._requestPermissions();
  }

  _requestPermissions = () => {
    PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE).then(readResponse => {
        return PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
    }).then(writeResponse => {
        let granted = writeResponse === PermissionsAndroid.RESULTS.GRANTED === true ?  true :  false;

        this.setState({
            hasPermission: granted
        }) 
    }) 
}
createEmptyFile = ( ) => {
    console.log('create empty file function');
    const headerString = 'time,x,y,z\n';
    const rowString = "";
    const csvString = `${headerString}${rowString}`;

    RNFS.writeFile(pathTempWrite, csvString, 'utf8').then((success) => {
        console.log('success', success)
    }).catch((err) => {
        console.log('canot create file');
        console.log(err.message);
    });
}

_startTimer = () => {
    RNFS.exists(pathTempWrite).then((response) => {
      console.log('response', response);
        if(response === true) {
            RNFS.unlink(pathTempWrite).then(() => {
                this.createEmptyFile();      
            }).catch((err) => {
                console.log(err.message);
                console.log('error in start time function');
            });
        }else{
            this.createEmptyFile();
        }
    });
}

appendToTempFile = (content, last = false) => {
    const rowString = content.map(d => `${d.timestamp},${d.x},${d.y},${d.z}\n`).join('');
    // console.log('row string', rowString);
    RNFS.appendFile(pathTempWrite, rowString, 'utf8').then(() => {
        if(last === true ) {
          const localTime = new Date();
          const seconds = localTime.getSeconds();
          const minute = localTime.getMinutes();
          const hours = localTime.getHours();
          // const localTime = new Date().toLocaleString();
          console.log('file saved without move');
            const destinationPath = `${RNFetchBlob.fs.dirs.DownloadDir}/data_at_${hours}_${minute}_${seconds}.csv`;
            RNFS.moveFile(pathTempWrite, destinationPath).then( () =>{
                this.setState({file_path: destinationPath});
                console.log('file saved');
            })
        }
    }).catch(error => console.error(error));
}
saveFile = () => {
    this.appendToTempFile(this.state.sensordata, true);
    console.log('savefile called');
}

accelerometerData = () => {
  const hertz = parseInt(this.state.selectedHz);
  const milisecond = (1/(hertz))*1000;
    console.log('data in milisecond', milisecond);
    setUpdateIntervalForType(SensorTypes.accelerometer, milisecond);
    accelerometer.subscribe(({x,y,z, timestamp}) => {
      // this.setState({x,y,z, timestamp})
      // console.log('x , y, z', x, y, z);
      
      if(this.state.start === true){
        const logData = this.state.sensordata;
        logData.push({x, y, z, timestamp})
        this.setState({sensordata: logData}, () => {
          this.appendToTempFile(logData);
          console.log('data write to file');
        })
      }
    })  
}
  componentWillMount(){
    console.log('component will mount');
    this.accelerometerData     
  }

  tracker = () => {
    ToastAndroid.show(`Tracking Started`, ToastAndroid.SHORT);
    this.setState({start: true}, () => {
      this.accelerometerData()
    });
    // () => {this._startTimer()},
      // setTimeout(()=>{
      //   this.stopTracker();
      // }, 1000)
  }

  stopTracker = () => {
    console.log('stop tracker called');
    ToastAndroid.show(`Tracking Stopped`, ToastAndroid.SHORT);
    this.setState({start: false}, () => {this.saveFile()});
  }

  onValueChange = (value) => {
    console.log('value', value);
    this.setState({selectedHz: value}, ()=> {this.accelerometerData()});
    
  }

  shouldComponentUpdate() {
    return false;
  }

  render() {
    console.log('selected value', this.state.selectedHz);
    return (
      <Container>
        <Header />
        <Content>
          <View>
            <Button 
            onPress={this.tracker} 
            title="start tracker"
            color="blue"
            style={styles.buttonStyle}
            />

            <Button 
            onPress={this.stopTracker} 
            title="stop tracker"
            color="red"
            style={styles.buttonStyle}
            />
          </View>
          
        <Form>
            <Picker
              note
              mode="dropdown"
              style={{ width: 120 }}
              selectedValue={this.state.selectedHz}
              onValueChange={this.onValueChange}
            >
              <Picker.Item label="2 Hz" value="2" />
              <Picker.Item label="5 Hz" value="5" />
              <Picker.Item label="10 Hz" value="10" />
              <Picker.Item label="20 Hz" value="20" />
              <Picker.Item label="50 Hz" value="50" />
              <Picker.Item label="100 Hz" value="100" />
              <Picker.Item label="200 Hz" value="200" />
              <Picker.Item label="400 Hz" value="400" />

            </Picker>
          </Form>
          {/* <View>
            <Graph data={this.state.sensordata} />
          </View> */}
        </Content>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  buttonStyle: {
    marginTop: 30,
    marginBottom: 30
  }
});
