import React from 'react';
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import mqttConnection from '../mqtt';
import OrdersScreen from './OrdersScreen';
import OrderDetailsScreen from './OrderDetailsScreen';

const Stack = createStackNavigator();

const App = () => {
    React.useEffect(() => {
        mqttConnection.establish();
        return () => {
            mqttConnection.close();
        };
    }, []);

    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen
                    name="Orders"
                    component={OrdersScreen}
                    options={{ title: 'Đơn hàng' }}
                />
                <Stack.Screen
                    name="OrderDetails"
                    component={OrderDetailsScreen}
                    options={{ title: 'Chi tiết đơn hàng' }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default App;
