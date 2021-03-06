import styles from "./styles.js";
import firebase from "firebase";
import { connect } from "react-redux";
import React, { useState, useEffect, Component } from "react";
import {
  SafeAreaView,
  AppRegistry,
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Calendar, CalendarList, Agenda } from "react-native-calendars";
import moment, { now } from "moment";
import { render } from "react-dom";
import { getUserJournal } from "../redux/actions/nutritionActions.js";
import NutritionCard from "./Nutrition_Comp/NutritionCard.js";
import AddModal from "./Modals/AddModal.js";
import { AntDesign } from "@expo/vector-icons";

const NutritionScreen = ({
  displayName,
  date,
  selectedDate,
  currentDayFoodList,
  totalCal,
  isLoading,
  getUserJournal,
}) => {
  const [addModalVisible, setAddModalVisible] = useState(false);

  let addModal = (
    <AddModal
      addModalVisible={addModalVisible}
      setAddModalVisible={setAddModalVisible}
      date={selectedDate}
    />
  );

  return (
    <SafeAreaView style={styles.containerNutScreen}>
      <Calendar
        onDayPress={(day) => getUserJournal(day, displayName)}
        markedDates={{
          [selectedDate]: { selected: true, selectedColor: "#00adf5" },
        }}
        theme={{ arrowColor: "rgb(22, 66, 92)" }}
      />

      <ScrollView
        contentContainerStyle={{
          ...styles.journalNut,
          backgroundColor: "#d9d5c7",
        }}
      >
        <Text style={[styles.date]}>{date}</Text>
        <Text style={styles.totalCal}>
          {totalCal ? `Total Calories: ${totalCal}` : null}
        </Text>

        {isLoading ? (
          <View style={styles.containerLoading}>
            <ActivityIndicator size="large" />
          </View>
        ) : (
          <>
            {currentDayFoodList.length !== 0 &&
              currentDayFoodList.map((recipe, key) => {
                return (
                  <NutritionCard
                    key={key}
                    id={recipe[0]}
                    journalData={recipe[1]}
                    referenceID={recipe[1].referenceID}
                  ></NutritionCard>
                );
              })}

            {date && (
              <TouchableOpacity
                style={styles.buttonStyles}
                onPress={() => setAddModalVisible(true)}
                activeOpacity="0.5"
              >
                <AntDesign
                  name="pluscircle"
                  size={50}
                  color="rgb(37, 93, 120)"
                />
              </TouchableOpacity>
            )}
          </>
        )}
      </ScrollView>
      {addModal}
    </SafeAreaView>
  );
};

const mapStateToProps = (state) => ({
  displayName: state.auth.user.displayName,
  isLoading: state.nutrition.isLoading,
  date: state.nutrition.date,
  selectedDate: state.nutrition.selectedDate,
  currentDayFoodList: state.nutrition.currentDayFoodList,
  totalCal: state.nutrition.totalCal,
});

const mapDispatchToProps = (dispatch) => {
  return {
    getUserJournal: (date, username) =>
      dispatch(getUserJournal(date, username)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(NutritionScreen);
