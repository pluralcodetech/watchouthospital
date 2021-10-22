import React from 'react';
import {View, Text, Input, Button} from 'native-base';
import {SafeAreaView, ScrollView, StyleSheet, Alert} from 'react-native';
import globalStyles from '../../styles/styles';
import AppHeader from '../components/layouts/AppHeader';
import {useSelector} from 'react-redux';
import COLORS from '../../styles/colors';
import axios from 'axios';
import qs from 'qs';
import PreLoader from '../components/loaders/PreLoader';
import API from '../../conts/api';
import {useIsFocused} from '@react-navigation/native';

const VerifyPatientScreen = ({route}) => {
  const isFocused = useIsFocused();
  const tripId = route?.params?.tripId;
  const {data, code} = useSelector(state => state.userData);
  const [showPreloader, setShowPreloader] = React.useState(false);
  const [state, setState] = React.useState({
    phone: data.phone,
    hospital_id: data.hospital_id,
    ticket_id: tripId,
    amb_carid: data.amb_carid,
    fatal: data.fatal,
  });

  React.useEffect(() => {
    setState({...state, ticket_id: tripId});
  }, [isFocused]);

  const verifyPatient = async () => {
    if (state.ticket_id.trim() == '') {
      Alert.alert('Error!', 'Please input trip id');
    } else {
      setShowPreloader(true);
      try {
        const res = await axios({
          url: API + '/verify_ticket.php',
          method: 'POST',
          data: qs.stringify(state),
        });

        const resData = res.data;
        //Hide preloader
        setShowPreloader(false);
        if (resData.statuscode == '00') {
          //Clear ticket_id input
          setState({...state, ticket_id: ''});

          Alert.alert('Error!', resData.status);
        } else {
          Alert.alert('Error!', resData.status);
        }
      } catch (error) {
        //Hide preloader
        setShowPreloader(false);
        console.log(error);
        Alert.alert('Error!', 'Something went wrong please try again');
      }
    }
  };

  return (
    <SafeAreaView style={[globalStyles.safeAreaView, {paddingHorizontal: 0}]}>
      <PreLoader visible={showPreloader} />
      <AppHeader data={data} />
      <ScrollView>
        <View style={{marginVertical: 40, marginHorizontal: 20}}>
          <View style={globalStyles.card}>
            <Text style={globalStyles.cardTitle}>Verify Patient insurance</Text>
            <Text style={{marginTop: 5, textAlign: 'center', fontSize: 15}}>
              Enter patient insurance / trip ID to verify
            </Text>
            <View style={style.inputContainer}>
              <Input
                value={state.ticket_id}
                onChangeText={value => setState({...state, ticket_id: value})}
              />
            </View>

            <View>
              <Button
                onPress={verifyPatient}
                small
                rounded
                style={{marginTop: 20, paddingHorizontal: 20}}>
                <Text>Verify</Text>
              </Button>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const style = StyleSheet.create({
  inputContainer: {
    borderColor: COLORS.grey,
    borderWidth: 1,
    flex: 1,
    width: '100%',
    marginTop: 20,
    height: 45,
    paddingHorizontal: 10,
  },
});
export default VerifyPatientScreen;
