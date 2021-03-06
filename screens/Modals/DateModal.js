import React, { useState, useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View, Alert } from "react-native";
import Modal from "react-native-modal";
import firebase from "firebase";
import RNPickerSelect from "react-native-picker-select";
import { connect } from "react-redux";

function DateModal({
  dateModalVisible,
  setDateModalVisible,
  totalNutrients,
  baseNutCopy,
  description,
  fdcId,
  displayName,
}) {
  const [currentDate, setCurrentDate] = useState({
    month: new Date().getMonth() + 1,
    date: new Date().getDate(),
    year: new Date().getFullYear(),
  });
  const [monthList, setMonthList] = useState([]);
  const [dateList, setDateList] = useState([]);
  const [yearList, setYearList] = useState([]);
  let { month, date, year } = currentDate;

  useEffect(() => {
    let mList = createPickerList(12);
    let dList = createPickerList(31);
    let yList = createYearPickerList(year);
    setMonthList(mList);
    setDateList(dList);
    setYearList(yList);
  }, []);

  // Add Food Info to User's Journal
  const addToUserJournal = (
    { month, date, year },
    { CALORIES, SERVING_SIZE }
  ) => {
    const storeFoodInUserRef = firebase
      .database()
      .ref(`users/${displayName}/foodJournal/${year}/${month}/${date}`);

    storeFoodInUserRef.push().set({
      referenceID: fdcId,
      name: description,
      calories: CALORIES.value,
      servingSize: SERVING_SIZE.value,
      servingUnit: SERVING_SIZE.unit,
    });
  };

  // Add Food Info of 100 g serving size to Food Archives
  // Only if Food ID doesn't exist
  const addToArchives = (nutriData) => {
    const foodArchivesRef = firebase.database().ref(`foodArchives/${fdcId}`);

    // Transaction adds to archives unless id already exists
    foodArchivesRef.transaction(
      (currentData) => {
        if (currentData === null) {
          Alert.alert("Success", "Your food has been saved to your journal", [
            { text: "Ok", onPress: () => setDateModalVisible(false) },
          ]);
          return nutriData;
        } else {
          return;
        }
      },
      (error, committed, snapshot) => {
        if (error) {
          Alert.alert("Error", "Could not save food in your journal");
          console.log("Transaction failed abnormally!", error);
        } else if (!committed) {
          console.log(`Did not save since fdcId: ${fdcId} already exists`);
        } else {
          console.log(`fdcId: ${fdcId} has been added to archives!`);
        }
      }
    );
  };

  // Adds Nutrition Info to User's Journal and Archives
  const addFoodToDatabase = async (dateObj, nutritionObj) => {
    await addToUserJournal(dateObj, nutritionObj);
    await addToArchives(baseNutCopy);
    await setTimeout(() => {
      setDateModalVisible(false);
    }, 5000);
  };

  // creates list for month and date.
  const createPickerList = (max, array = []) => {
    for (let val = 1; val <= max; val++) {
      array.push({ label: `${val}`, value: val });
    }
    return array;
  };

  // creates list with previous, current and next year only.
  const createYearPickerList = (year, array = []) => {
    for (let val = year - 1; val <= year + 1; val++) {
      array.push({ label: `${val}`, value: val });
    }
    return array;
  };

  return (
    <View style={styles.centeredView}>
      <Modal
        isVisible={dateModalVisible}
        hasBackdrop={true}
        animationIn="slideInUp"
        animationInTiming={1000}
        animationOut="fadeOut"
        animationOutTiming={1000}
        backdropTransitionOutTiming={0}
        backdropColor="black"
        backdropOpacity={0.8}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View style={styles.header}>
              <Text style={styles.headerTextStyle}>Save Entry</Text>
            </View>

            <Text style={styles.displayMsg}>Input date of consumption</Text>

            <View style={styles.mainPickerContainer}>
              <View style={styles.subPickerContainer}>
                <Text style={styles.dateTitle}>Month</Text>

                <RNPickerSelect
                  selectedValue={month}
                  value={month}
                  placeholder={{}}
                  style={{ ...pickerSelectStyles }}
                  onValueChange={(val) =>
                    setCurrentDate({ ...currentDate, month: val })
                  }
                  items={monthList}
                />
              </View>

              <View style={styles.subPickerContainer}>
                <Text style={styles.dateTitle}>Date</Text>

                <RNPickerSelect
                  selectedValue={date}
                  value={date}
                  placeholder={{}}
                  style={{ ...pickerSelectStyles }}
                  onValueChange={(val) =>
                    setCurrentDate({ ...currentDate, date: val })
                  }
                  items={dateList}
                />
              </View>

              <View style={styles.subPickerContainer}>
                <Text style={styles.dateTitle}>Year</Text>

                <RNPickerSelect
                  selectedValue={year}
                  value={year}
                  placeholder={{}}
                  style={{ ...pickerSelectStyles }}
                  onValueChange={(val) =>
                    setCurrentDate({ ...currentDate, year: val })
                  }
                  items={yearList}
                />
              </View>
            </View>

            <View style={styles.buttonsContainer}>
              <TouchableOpacity
                style={{ ...styles.buttonStyles, backgroundColor: "#EA4848" }}
                onPress={() => setDateModalVisible(false)}
              >
                <Text style={styles.buttonTextStyle}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ ...styles.buttonStyles, backgroundColor: "#26A637" }}
                onPress={() => addFoodToDatabase(currentDate, totalNutrients)}
              >
                <Text style={styles.buttonTextStyle}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const mapStateToProps = (state) => ({
  displayName: state.auth.user.displayName,
});

export default connect(mapStateToProps, null)(DateModal);

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    color: "black",
    textAlign: "center",
    marginHorizontal: 14,
    paddingVertical: 10,
    fontSize: 22,
    width: 70,
    borderBottomWidth: 1,
    backgroundColor: "#EEC16D",
    fontFamily: "OpenSans_400Regular",
  },
  inputAndroid: {
    borderWidth: 1,
    borderColor: "white",
    color: "white",
    textAlign: "center",
    marginHorizontal: 4,
    width: 50,
    padding: 10,
    fontSize: 20,
    width: 40,
  },
});

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalView: {
    backgroundColor: "white",
    borderRadius: 20,
    width: "84%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    width: "100%",
    backgroundColor: "#F2D092",
    alignItems: "center",
    paddingVertical: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  headerTextStyle: {
    color: "black",
    fontWeight: "bold",
    textAlign: "center",
    fontFamily: "OpenSans_600SemiBold",
    fontSize: 26,
  },
  displayMsg: {
    textAlign: "center",
    fontSize: 20,
    padding: 20,
    fontFamily: "OpenSans_400Regular",
  },
  mainPickerContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "90%",
    marginBottom: 30,
  },
  subPickerContainer: { alignItems: "center" },
  dateTitle: {
    fontFamily: "OpenSans_400Regular",
    marginBottom: 4,
    fontSize: 18,
  },
  servingInput: {
    fontSize: 22,
    marginBottom: "8%",
    width: "50%",
    textAlign: "center",
    borderBottomWidth: 1,
    padding: 10,
    backgroundColor: "#EEC16D",
    fontFamily: "OpenSans_400Regular",
  },
  buttonsContainer: {
    flexDirection: "row",
    paddingHorizontal: 10,
  },
  buttonStyles: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 100,
    borderRadius: 20,
    marginBottom: 25,
    marginHorizontal: 5,
    elevation: 2,
  },
  buttonTextStyle: {
    color: "black",
    fontFamily: "OpenSans_600SemiBold",
    textAlign: "center",
    fontSize: 18,
  },
});
