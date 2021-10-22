import {Button, Input, Text, View} from 'native-base';
import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Linking,
  Alert,
  Modal,
  TouchableOpacity,
} from 'react-native';
import {useSelector} from 'react-redux';
import {useIsFocused} from '@react-navigation/native';
import axios from 'axios';
import qs from 'qs';
import COLORS from '../../styles/colors';
import globalStyles from '../../styles/styles';
import AppHeader from '../components/layouts/AppHeader';
import API from '../../conts/api';
import ScreenLoader from '../components/loaders/ScreenLoader';
import PreLoader from '../components/loaders/PreLoader';
import PatientDetailsModal from '../components/modals/PatientDetailsModal';

const CaseDetailsScreen = ({navigation, route}) => {
  const {data, code} = useSelector(state => state.userData);

  const {caseId, acceptCase, declineCase} = route.params;

  const [showScreenLoader, setShowScreenLoader] = React.useState(true);
  const [state, setState] = React.useState({
    phone: data.phone,
    code,
    otp: code,
    amb_carid: data.amb_carid,
    case_id: caseId,
    amb_carphone: data.phone,
    hospital_id: data.hospital_id,
    showPreloader: false,
  });

  const [currentCase, setCurrentCase] = React.useState(null);
  const [patientDetails, setPatientDetails] = React.useState({show: false});

  const isFocused = useIsFocused();

  React.useEffect(() => {
    if (isFocused) {
      getCaseDetails();
    } else {
      setShowScreenLoader(true);
    }
  }, [isFocused]);

  React.useEffect(() => {
    //Send user back to home page there is no pending or active case or waiting case
    if (
      data.active_cases == 0 &&
      data.pending_cases == 0 &&
      data.waiting_cases == 0 &&
      isFocused
    ) {
      navigation.goBack();
    }
  }, [data]);

  // Get and display new case
  const getCaseDetails = async () => {
    setShowScreenLoader(true);
    try {
      const res = await axios({
        url: API + '/case_details.php',
        method: 'POST',
        data: qs.stringify({...state, case_id: caseId}),
      });

      const resData = res.data;

      if (resData.statuscode == '00') {
        setCurrentCase(resData);
        setShowScreenLoader(false);
      } else {
      }
    } catch (error) {
      console.log(error);
      //Send request after 5sec
    }
  };

  //Open map with link
  const openMap = link => {
    Linking.openURL(link);
  };

  const getPatientDetails = async data => {
    setState({...state, showPreloader: true});
    try {
      const res = await axios({
        url: API + '/passenger_details.php',
        method: 'POST',
        data: qs.stringify({
          phone: data.countryCode + '' + data.phone,
        }),
      });

      const resData = res.data;

      setState({...state, showPreloader: false});
      if (resData.statuscode == '00') {
        setPatientDetails({...resData, ...data, show: true});
      } else {
        Alert.alert('Error!', 'Something went wrong please try again');
      }
    } catch (error) {
      Alert.alert('Error!', 'Something went wrong please try again');
    }
  };

  return (
    <SafeAreaView style={[globalStyles.safeAreaView, {paddingHorizontal: 0}]}>
      <PreLoader visible={state.showPreloader} />
      <ScreenLoader loading={showScreenLoader} transparent={false} />
      <AppHeader data={data} />
      <PatientDetailsModal
        visible={patientDetails.show}
        patientDetails={patientDetails}
        setPatientDetails={setPatientDetails}
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{marginVertical: 40, marginHorizontal: 20}}>
          {data.pending_cases > 0 ? (
            <View style={styles.optionBtnContainer}>
              <Button
                full
                rounded
                style={{width: '45%'}}
                onPress={() => acceptCase(caseId)}>
                <Text>Accept</Text>
              </Button>

              <Button
                onPress={() => declineCase(caseId)}
                full
                style={{backgroundColor: COLORS.secondary, width: '45%'}}
                rounded>
                <Text>Decline</Text>
              </Button>
            </View>
          ) : null}

          {/* Case details card */}
          <View style={globalStyles.card}>
            <Text style={globalStyles.cardTitle}>
              Case Details({currentCase?.case_nature})
            </Text>
            <Text
              style={{
                marginTop: 10,
                color: COLORS.black,
                fontSize: 14,
              }}>
              Vehicle Plate: {currentCase?.vehicle_number}
            </Text>
            <Text
              style={{
                marginTop: 5,
                color: COLORS.primary,
                fontSize: 14,
              }}>
              Location: {currentCase?.case_location}
            </Text>
            <View>
              <Button
                small
                light
                rounded
                style={{marginTop: 10}}
                onPress={() => openMap(currentCase?.location_url)}>
                <Text style={{fontSize: 11}}>View Location On Map</Text>
              </Button>
            </View>
          </View>
          {/* Patient count card */}
          <View style={globalStyles.card}>
            <Text style={[globalStyles.cardTitle, {color: COLORS.primary}]}>
              Patient Count
            </Text>
            <View style={{flexDirection: 'row', marginTop: 10}}>
              <View style={globalStyles.pInputContainer}>
                <Input
                  onChangeText={value =>
                    setCurrentCase({...currentCase, major_injuries: value})
                  }
                  style={globalStyles.pInput}
                  value={currentCase?.major_injuries}
                />
                <Text style={globalStyles.pInputText}>Major inj.</Text>
              </View>
              <View style={globalStyles.pInputContainer}>
                <Input
                  onChangeText={value =>
                    setCurrentCase({...currentCase, minor_injuries: value})
                  }
                  style={globalStyles.pInput}
                  value={currentCase?.minor_injuries}
                />
                <Text style={globalStyles.pInputText}>Minor inj.</Text>
              </View>
              <View style={globalStyles.pInputContainer}>
                <Input
                  onChangeText={value =>
                    setCurrentCase({...currentCase, fatalities: value})
                  }
                  style={globalStyles.pInput}
                  value={currentCase?.fatalities}
                />
                <Text style={globalStyles.pInputText}>Fatality</Text>
              </View>
            </View>
          </View>
          {/* Driver card */}
          <View style={globalStyles.card}>
            <Text style={[globalStyles.cardTitle, {color: COLORS.primary}]}>
              Driver Details
            </Text>
            <Text
              style={{
                marginTop: 10,
                color: COLORS.black,
                fontSize: 14,
              }}>
              {currentCase?.driverDetails.name}
            </Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() =>
                Linking.openURL(`tel:${currentCase?.driverDetails?.phone}`)
              }>
              <Text
                style={{
                  marginTop: 5,
                  color: COLORS.black,
                  fontSize: 14,
                }}>
                {currentCase?.driverDetails?.phone}
              </Text>
            </TouchableOpacity>
          </View>
          {/* Available hospital card */}
          <View style={globalStyles.card}>
            <Text style={globalStyles.cardTitle}>Available Hospitals</Text>
            {currentCase?.hospital_respondents?.map((respondent, index) => (
              <View key={index} style={{alignItems: 'center', width: '100%'}}>
                <Text
                  style={{
                    marginTop: 10,
                    color: COLORS.black,
                    fontSize: 14,
                  }}>
                  {respondent.name}
                </Text>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => Linking.openURL(`tel:${respondent?.phone}`)}>
                  <Text
                    style={{
                      marginTop: 5,
                      color: COLORS.primary,
                      fontSize: 14,
                    }}>
                    {respondent.phone}
                  </Text>
                </TouchableOpacity>
                <View>
                  <Button
                    small
                    light
                    rounded
                    style={{marginTop: 10}}
                    onPress={() => openMap(respondent?.location_url)}>
                    <Text style={{fontSize: 11}}>View Location On Map</Text>
                  </Button>
                </View>
                <View style={styles.line} />
              </View>
            ))}
          </View>
          {/* passenger Details Card */}
          <View style={globalStyles.card}>
            <Text style={globalStyles.cardTitle}>Passenger Details</Text>
            <View style={{marginTop: 10, width: '100%'}}>
              {currentCase?.passengerDetails?.map((passenger, id) => (
                <View key={id}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                    <Text> {passenger?.passengerName}</Text>
                    <Button
                      small
                      light
                      rounded
                      onPress={() => {
                        getPatientDetails(passenger);
                      }}>
                      <Text style={{fontSize: 11}}>Details</Text>
                    </Button>
                  </View>
                  <View style={[styles.line, {width: '100%'}]} />
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  line: {
    width: '70%',
    height: 1.5,
    backgroundColor: COLORS.grey,
    marginVertical: 10,
  },
  optionBtnContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
});

export default CaseDetailsScreen;
