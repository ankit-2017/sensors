import React, {Component} from 'react';
import { LineChart, YAxis, XAxis, Grid } from 'react-native-svg-charts'
import { View } from 'react-native'
 
export default class Graph extends React.PureComponent {
 
    render() {
 
        // const data = [ 50, 10, 40, 95, -4, -24, 85, 91, 35, 53, -53, 24, 50, -20, -80 ]
 
        const contentInset = { top: 20, bottom: 20 }
 
        return (
            <View style={{ height: 200, flexDirection: 'row' }}>
                <LineChart
                    style={{ flex: 1, marginLeft: 16 }}
                    data={ this.props.data }
                    svg={{ stroke: 'rgb(134, 65, 244)' }}
                    contentInset={ contentInset }
                >
                    <Grid/>
                </LineChart>
            </View>
        )
    }
 
}