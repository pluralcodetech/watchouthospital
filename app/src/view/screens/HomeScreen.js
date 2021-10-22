import React from 'react';
import {View, Text} from 'native-base';
import {SafeAreaView, ScrollView, StyleSheet, Alert} from 'react-native';
import {useSelector} from 'react-redux';
import {useIsFocused} from '@react-navigation/native';
import COLORS from '../../styles/colors';
import globalStyles from '../../styles/styles';
import axios from 'axios';
import qs from 'qs';
import FONTS from '../../conts/fonts';
import API from '../../conts/api';
import AppHeader from '../components/layouts/AppHeader';
import {updateUserData} from '../../logics/auth';
import PreLoader from '../components/loaders/PreLoader';
import DisplayCases from '../components/homeComponents/DisplayCases';
let getDashboardataTimeOut = null;

const HomeScreen = ({navigation}) => {
  const isFocused = useIsFocused();

  const [currentCase, setCurrentCase] = React.useState({
    activeCase: false,
    loading: true,
    message: 'Getting case please wait...',
  });

  const [showPreloader, setShowPreloader] = React.useState(false);

  const {data, code, loggedIn} = useSelector(state => state.userData);

  React.useEffect(() => {
    clearTimeout(getDashboardataTimeOut);
    getDashboardata();
  }, [isFocused]);

  const [state, setState] = React.useState({
    phone: data.phone,
    code,
    otp: code,
    amb_carid: data.amb_carid,
    fatal: data.fatal,
    minor: data.minor,
    hospital_id: data.hospital_id,
  });

  //Get data to display for user
  const getDashboardata = async () => {
    clearTimeout(getDashboardataTimeOut);
    //Return if the the user is not loggedin
    if (loggedIn && isFocused) {
      try {
        const res = await axios({
          url: API + '/dashboard.php',
          method: 'POST',
          data: qs.stringify(state),
        });

        const resData = res.data;

        if (resData.statuscode == '00') {
          const userData = {loggedIn: true, data: resData, code, otp: code};

          //Dispatch to store and save data to users phone
          await updateUserData(userData);

          //Get new case
          getCaseDetails(resData);

          //Hide preloader
          setTimeout(() => {
            setShowPreloader(false);
          }, 2000);
          //Resend after 5sec
          getDashboardataTimeOut = setTimeout(() => getDashboardata(), 5000);
        } else {
          //Resend after 5sec if there is an error
          getDashboardataTimeOut = setTimeout(() => getDashboardata(), 5000);
        }
      } catch (error) {
        console.log(error);
        //Resend after 5sec if there is an error
        getDashboardataTimeOut = setTimeout(() => getDashboardata(), 5000);
      }
    } else {
      console.log('Not LoggedIn');
    }
  };

  //Get case details
  const getCaseDetails = async caseData => {
    // Send request only wen there is a case
    if (
      caseData.active_cases > 0 ||
      caseData.pending_cases > 0 ||
      caseData.waiting_cases > 0
    ) {
      let caseType = 'new_cases.php';
      if (caseData.active_cases > 0) {
        caseType = 'old_cases.php';
      } else if (caseData.pending_cases > 0) {
        caseType = 'new_cases.php';
      } else if (caseData.waiting_cases > 0) {
        caseType = 'waiting_cases.php';
      }

      try {
        const res = await axios({
          url: API + '/' + caseType,
          method: 'POST',
          data: qs.stringify({
            id: caseData.id,
            code,
            otp: code,
            hospital_id: caseData.hospital_id,
          }),
        });

        const resData = res.data;
        // console.log(resData);

        if (resData.statuscode == '00') {
          if (caseData.pending_cases > 0) {
            //Update current case
            setTimeout(
              () =>
                setCurrentCase({
                  pendingCase: true,
                  activeCase: false,
                  waitingCase: false,
                  loading: true,
                  message: 'No current cases please check back later.',
                  noCase:
                    data.staff_type?.toLowerCase() == 'er staff' ? true : false,
                  caseDetails: {...resData},
                }),
              3000,
            );
          } else if (caseData.waiting_cases > 0) {
            //Update current case
            setTimeout(
              () =>
                setCurrentCase({
                  pendingCase: false,
                  activeCase: false,
                  waitingCase: true,
                  loading: true,
                  noCase:
                    data.staff_type?.toLowerCase() == 'er staff' ? true : false,
                  message:
                    'Your request to attend this case is currently pending approval, you will be notified once we respond',
                  caseDetails: {...resData},
                }),
              3000,
            );
          } else if (caseData.active_cases > 0) {
            //Update current case
            setTimeout(
              () =>
                setCurrentCase({
                  pendingCase: false,
                  activeCase: true,
                  waitingCase: false,
                  loading: true,
                  message: 'You have an active case.',
                  caseDetails: {...resData},
                }),
              3000,
            );
          }
        } else {
          setTimeout(
            () =>
              setCurrentCase({
                activeCase: false,
                pendingCase: false,
                loading: true,
                noCase: true,
                message: 'No current cases please check back later.',
              }),
            3000,
          );
        } //Set active case to false and loading true
      } catch (error) {
        console.log(error);
      }
    } else {
      setTimeout(
        () =>
          setCurrentCase({
            activeCase: false,
            pendingCase: false,
            loading: true,
            noCase: true,
            message: 'No current cases please check back later.',
          }),
        3000,
      );
    }
  };

  //setUser to case details page
  const sendUserToCaseDetailsScreen = caseId => {
    navigation.navigate('CaseDetailsScreen', {caseId, acceptCase, declineCase});
  };

  // acceptCase if there is any available
  const acceptCase = async caseId => {
    Alert.alert('Confirm', 'Accept case?', [
      {text: 'No'},
      {
        text: 'Yes',
        onPress: async () => {
          setShowPreloader(true);
          try {
            const res = await axios({
              url: API + '/accept_case.php',
              method: 'POST',
              data: qs.stringify({...state, case_id: caseId}),
            });

            const resData = res.data;
            console.log(resData);
            if (resData.statuscode == '00') {
              getDashboardata();
              //Send user to case details screen
              sendUserToCaseDetailsScreen(caseId);
            } else {
              //Hide preloader
              setShowPreloader(false);
              Alert.alert('Error!', 'Something went wrong please try again');
            }
          } catch (error) {
            //Hide preloader
            setShowPreloader(false);
            console.log(error);
            Alert.alert('Error!', 'Something went wrong please try again');
          }
        },
      },
    ]);
  };
  const declineCase = caseId => {
    Alert.alert('Confirm', 'Decline case?', [
      {text: 'No'},
      {
        text: 'Yes',
        onPress: async () => {
          setShowPreloader(true);
          try {
            const res = await axios({
              url: API + '/decline_case.php',
              method: 'POST',
              data: qs.stringify({...state, case_id: caseId}),
            });

            const resData = res.data;
            console.log(resData);
            if (resData.statuscode == '00') {
              //Update currentCase state
              setCurrentCase({
                activeCase: false,
                pendingCase: false,
                loading: true,
                message: 'Getting new case please wait...',
              });
              getDashboardata();
            } else {
              //Hide preloader
              setShowPreloader(false);
              Alert.alert('Error!', 'Something went wrong please try again');
            }
          } catch (error) {
            //Hide preloader
            setShowPreloader(false);
            console.log(error);
            Alert.alert('Error!', 'Something went wrong please try again');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[globalStyles.safeAreaView, {paddingHorizontal: 0}]}>
      <PreLoader visible={showPreloader} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <AppHeader data={data} />
        {/* Case card container */}
        <View
          style={{
            marginTop: 40,
            marginBottom: 20,
            paddingHorizontal: 20,
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}>
          <View style={styles.caseCard}>
            <Text
              style={{
                fontSize: 28,
                fontFamily: FONTS.bold,
                color: COLORS.primary,
              }}>
              {!data.active_cases ? '0' : data.active_cases}
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: COLORS.grey,
              }}>
              Active Cases
            </Text>
          </View>

          <View style={styles.caseCard}>
            <Text
              style={{
                fontSize: 28,
                fontFamily: FONTS.bold,
                color: COLORS.secondary,
              }}>
              {!data.complete_cases ? '0' : data.complete_cases}
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: COLORS.grey,
              }}>
              Completed Cases
            </Text>
          </View>
        </View>
        <DisplayCases
          currentCase={currentCase}
          acceptCase={acceptCase}
          declineCase={declineCase}
          staffType={data.staff_type}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  caseCard: {
    height: 100,
    width: 150,
    backgroundColor: COLORS.white,
    elevation: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default HomeScreen;
