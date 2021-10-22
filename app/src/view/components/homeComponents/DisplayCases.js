import {View, Text, Button} from 'native-base';
import React from 'react';
import {ActivityIndicator, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import FONTS from '../../../conts/fonts';
import COLORS from '../../../styles/colors';

const DisplayCases = ({currentCase, staffType, acceptCase, declineCase}) => {
  const STAFF_TYPE = staffType?.toLowerCase();

  const navigation = useNavigation();

  //   Show cases depending the staff type
  if (currentCase.activeCase) {
    return currentCase?.caseDetails?.details?.map((_case, index) => (
      <View style={style.caseAlertCard} key={index}>
        <View
          style={{
            alignItems: 'center',
          }}>
          <Text
            style={{
              color: COLORS.secondary,
              fontFamily: FONTS.bold,
              fontSize: 18,
            }}>
            New Case Alert
          </Text>
          <Text
            style={{
              textAlign: 'center',
              marginVertical: 5,
              fontFamily: FONTS.bold,
            }}>
            {currentCase.message}
          </Text>
          <View style={{marginTop: 5}}>
            <Button
              small
              rounded
              onPress={() =>
                navigation.navigate('CaseDetailsScreen', {
                  caseId: _case.uid,
                  acceptCase,
                  declineCase,
                })
              }>
              <Text>View Details</Text>
            </Button>
          </View>
        </View>
      </View>
    ));
  } else if (currentCase.pendingCase && STAFF_TYPE != 'er staff') {
    return currentCase?.caseDetails?.details?.map((_case, index) => (
      <View style={style.caseAlertCard} key={index}>
        <View style={{width: '100%', alignItems: 'center'}}>
          <Text
            style={{
              color: COLORS.secondary,
              fontFamily: FONTS.bold,
              fontSize: 18,
            }}>
            New Case Alert
          </Text>
          <Text
            style={{
              marginTop: 10,
              color: COLORS.grey,
              fontFamily: FONTS.bold,
            }}>
            Vehicle Plate: {_case?.plate_num}
          </Text>
          <Text
            style={{
              marginTop: 10,
              color: COLORS.grey,
            }}>
            Case Type: {_case?.nature}
          </Text>
          <Text
            style={{
              marginTop: 10,
              color: COLORS.primary,
            }}>
            Location: {_case?.scene_to}
          </Text>
          <View
            style={{
              marginTop: 20,
              width: '100%',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <View>
              <Button
                small
                rounded
                light
                onPress={() =>
                  navigation.navigate('CaseDetailsScreen', {
                    caseId: _case.uid,
                    acceptCase,
                    declineCase,
                  })
                }>
                <Text>View More</Text>
              </Button>
            </View>

            <Button
              rounded
              block
              style={{marginTop: 10}}
              onPress={() => acceptCase(_case.uid)}>
              <Text>Accept</Text>
            </Button>
            <Button
              rounded
              block
              style={{backgroundColor: COLORS.secondary, marginTop: 10}}
              onPress={() => declineCase(_case.uid)}>
              <Text>Decline</Text>
            </Button>
          </View>
        </View>
      </View>
    ));
  } else if (currentCase.waitingCase && STAFF_TYPE != 'er staff') {
    return currentCase?.caseDetails?.details?.map((_case, index) => (
      <View style={style.caseAlertCard} key={index}>
        <View
          style={{
            alignItems: 'center',
          }}>
          <Text
            style={{
              color: COLORS.secondary,
              fontFamily: FONTS.bold,
              fontSize: 18,
            }}>
            New Case Alert
          </Text>
          <Text
            style={{
              textAlign: 'center',
              marginVertical: 5,
              fontFamily: FONTS.bold,
            }}>
            {currentCase.message}
          </Text>
          <View style={{marginTop: 5}}>
            <Button
              small
              rounded
              onPress={() =>
                navigation.navigate('CaseDetailsScreen', {
                  caseId: _case.uid,
                })
              }>
              <Text>View Details</Text>
            </Button>
          </View>
        </View>
      </View>
    ));
  } else {
    return (
      <View style={style.caseAlertCard}>
        <Text
          style={{
            color: COLORS.secondary,
            fontFamily: FONTS.bold,
            fontSize: 18,
          }}>
          New Case Alert
        </Text>
        <Text
          style={{
            marginVertical: 5,
            fontFamily: FONTS.bold,
          }}>
          {currentCase.message}
        </Text>
        {!currentCase?.noCase && (
          <ActivityIndicator size="large" color={COLORS.primary} />
        )}
      </View>
    );
  }
};

const style = StyleSheet.create({
  caseAlertCard: {
    paddingTop: 40,
    paddingBottom: 50,
    elevation: 10,
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    borderRadius: 10,
    marginVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
});

export default DisplayCases;
