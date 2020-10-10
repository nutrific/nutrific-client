import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  SafeAreaView,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  Button,
} from "react-native";
import axios from "axios";
import firebase from "firebase";
import { connect } from "react-redux";
import RNPickerSelect from "react-native-picker-select";
import RowTitle from "./RowTitle.js";
import RowData from "./RowData.js";

const RecipeCard = ({ recipe }) => {
  const [name, setName] = useState(recipe.description);
  const [totalNutrients, setTotalNutrients] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [servingSize, setServingSize] = useState(null);
  const [servingUnit, setServingUnit] = useState(null);

  const [calendar, setCalendar] = useState({
    month: null,
    date: null,
    year: null,
  });
  let { month, date, year } = calendar;

  // handles parsing nutririon object
  useEffect(() => {
    let nutritionData = parseNutritionData(recipe.foodNutrients);
    setTotalNutrients(nutritionData);
  }, []);

  // handles calendar display
  useEffect(() => {
    let [month, date, year] = new Date().toLocaleDateString().split("/");
    year = year.substring(2);
    setCalendar({ month, date, year });
  }, []);

  const addToJournal = () => {
    firebase
      .database()
      .ref("users/" + props.displayName)
      .set({
        journal: name,
      });
  };

  const parseNutritionData = (nutritionArray) => {
    let parsedObject = {
      SERVING_SIZE: {
        value: 100,
        unit: "g",
      },
      CALORIES: {},
      TOTAL_FAT: {},
      SAT_FAT: {},
      TRANS_FAT: {},
      CHOLESTEROL: {},
      SODIUM: {},
      CARBS: {},
      FIBER: {},
      TOTAL_SUGAR: {},
      PROTEIN: {},
    };

    let {
      CALORIES,
      TOTAL_FAT,
      SAT_FAT,
      TRANS_FAT,
      CHOLESTEROL,
      SODIUM,
      CARBS,
      FIBER,
      TOTAL_SUGAR,
      PROTEIN,
    } = parsedObject;

    for (var i = 0; i < nutritionArray.length; i++) {
      switch (nutritionArray[i].nutrientId) {
        case 1008:
          CALORIES.value = Math.round(nutritionArray[i].value);
          break;
        case 1004:
          TOTAL_FAT.value = Math.round(nutritionArray[i].value);
          TOTAL_FAT.unit = nutritionArray[i].unitName.toLowerCase();
          break;
        case 1258:
          SAT_FAT.value = Math.round(nutritionArray[i].value);
          SAT_FAT.unit = nutritionArray[i].unitName.toLowerCase();
          break;
        case 1257:
          TRANS_FAT.value = Math.round(nutritionArray[i].value);
          TRANS_FAT.unit = nutritionArray[i].unitName.toLowerCase();
          break;
        case 1253:
          CHOLESTEROL.value = Math.round(nutritionArray[i].value);
          CHOLESTEROL.unit = nutritionArray[i].unitName.toLowerCase();
          break;
        case 1093:
          SODIUM.value = Math.round(nutritionArray[i].value);
          SODIUM.unit = nutritionArray[i].unitName.toLowerCase();
          break;
        case 1005:
          CARBS.value = Math.round(nutritionArray[i].value);
          CARBS.unit = nutritionArray[i].unitName.toLowerCase();
          break;
        case 1079:
          FIBER.value = Math.round(nutritionArray[i].value);
          FIBER.unit = nutritionArray[i].unitName.toLowerCase();
          break;
        case 2000:
          TOTAL_SUGAR.value = Math.round(nutritionArray[i].value);
          TOTAL_SUGAR.unit = nutritionArray[i].unitName.toLowerCase();
          break;
        case 1003:
          PROTEIN.value = Math.round(nutritionArray[i].value);
          PROTEIN.unit = nutritionArray[i].unitName.toLowerCase();
          break;
        default:
          continue;
      }
    }

    // loops over object for undefined values
    for (let key in parsedObject) {
      if (JSON.stringify(parsedObject[key]) === "{}") {
        parsedObject[key].value = "N/A";
        parsedObject[key].unit = "";
      }
    }

    return parsedObject;
  };

  const handleServingSize = (size, unit) => {
    // changes value inside parsed nutrition object
    totalNutrients.SERVING_SIZE.value = size;
    totalNutrients.SERVING_SIZE.unit = unit;

    // resets state values
    setServingSize(null);
    setServingUnit(null);
  };

  // TODO: create new function for converting to other units. i.e.) "cups, oz, quarts".

  const checkForEmptyInputs = () => {
    if (!servingUnit && !servingSize) {
      alert("Please Input Serving Unit and Yield");
    } else if (!servingUnit) {
      alert("Please Input Serving Units");
    } else if (!servingSize) {
      alert("Please Input Serving Yield");
    }
  };

  const handleEditing = () => {
    // Don't submit data if input fields are empty
    if (isEditing && (!servingUnit || !servingSize)) {
      checkForEmptyInputs();
      return;
    } else if (isEditing) {
      handleServingSize(servingSize, servingUnit);
    }

    setIsEditing(!isEditing);
  };

  const unitList = [
    { label: "g", value: "g" },
    { label: "oz", value: "oz" },
    { label: "cup", value: "cup" },
    { label: "qt", value: "qt" },
    { label: "lbs", value: "lbs" },
  ];

  const placeholderForPicker = {
    label: "Select unit",
    value: null,
  };

  // only render if nutrients is not an empty object
  return JSON.stringify(totalNutrients) === "{}" ? null : (
    <SafeAreaView style={styles.container}>
      <View style={styles.recipeContainer}>
        <View style={styles.recipeName}>
          <Text
            style={[
              styles.boldFont,
              {
                fontFamily: "Menlo",
                fontSize: 24,
                textAlign: "center",
                paddingVertical: 4,
              },
            ]}
          >
            {name}
          </Text>
        </View>

      <View style={{width: "100%"}}>
        <RowTitle />
        <RowData id="Serving Size" nutValue={totalNutrients.SERVING_SIZE.value} nutUnit={totalNutrients.SERVING_SIZE.unit} percentage="N/A"/>
        <RowData id="Calories" nutValue={totalNutrients.CALORIES.value} percentage="None"/>
        <RowData id="Total Fat" nutValue={totalNutrients.TOTAL_FAT.value} nutUnit={totalNutrients.TOTAL_FAT.unit} percentage="None"/>
        <RowData id="Sat. Fat" nutValue={totalNutrients.SAT_FAT.value} nutUnit={totalNutrients.SAT_FAT.unit} percentage="None"/>
        <RowData id="Trans. Fat" nutValue={totalNutrients.TRANS_FAT.value} nutUnit={totalNutrients.TRANS_FAT.unit} percentage="None"/>
        <RowData id="Cholesterol" nutValue={totalNutrients.CHOLESTEROL.value} nutUnit={totalNutrients.CHOLESTEROL.unit} percentage="None"/>
        <RowData id="Sodium" nutValue={totalNutrients.SODIUM.value} nutUnit={totalNutrients.SODIUM.unit} percentage="None"/>
        <RowData id="Total Carbs." nutValue={totalNutrients.CARBS.value} nutUnit={totalNutrients.CARBS.unit} percentage="None"/>
        <RowData id="Dietary Fiber" nutValue={totalNutrients.FIBER.value} nutUnit={totalNutrients.FIBER.unit} percentage="None"/>
        <RowData id="Total Sugar" nutValue={totalNutrients.TOTAL_SUGAR.value} nutUnit={totalNutrients.TOTAL_SUGAR.unit} percentage="None"/>
        <RowData id="Protein" nutValue={totalNutrients.PROTEIN.value} nutUnit={totalNutrients.PROTEIN.unit} percentage="None"/>
      </View>

        {/* <View style={styles.nutrientsContainer}>
          <View style={styles.nutrientTitleWrapper}>
            <View style={[styles.nutrientTitle, styles.bottomPadding]}>
              <Text style={[styles.recipeFont, styles.baseText]}>Name</Text>
            </View>
            <View style={[styles.nutrientTitle, styles.bottomPadding]}>
              <Text style={styles.recipeFont}>Serving Size</Text>
            </View>

            <View style={[styles.nutrientTitle, styles.bottomPadding]}>
              <Text style={styles.recipeFont}>Calories</Text>
            </View>

            <View style={[styles.nutrientTitle, styles.bottomPadding]}>
              <Text style={styles.recipeFont}>Total Fat</Text>
            </View>

            <View style={[styles.nutrientTitle, styles.bottomPadding]}>
              <Text style={styles.recipeFont}>Sat. Fat</Text>
            </View>

            <View style={[styles.nutrientTitle, styles.bottomPadding]}>
              <Text style={styles.recipeFont}>Trans. Fat</Text>
            </View>

            <View style={[styles.nutrientTitle, styles.bottomPadding]}>
              <Text style={styles.recipeFont}>Cholesterol</Text>
            </View>

            <View style={[styles.nutrientTitle, styles.bottomPadding]}>
              <Text style={styles.recipeFont}>Sodium</Text>
            </View>

            <View style={[styles.nutrientTitle, styles.bottomPadding]}>
              <Text style={styles.recipeFont}>Total Carbs</Text>
            </View>

            <View style={[styles.nutrientTitle, styles.bottomPadding]}>
              <Text style={styles.recipeFont}>Dietary Fiber</Text>
            </View>

            <View style={[styles.nutrientTitle, styles.bottomPadding]}>
              <Text style={styles.recipeFont}>Total Sugar</Text>
            </View>

            <View style={[styles.nutrientTitle, styles.bottomPadding]}>
              <Text style={styles.recipeFont}>Protein</Text>
            </View>
          </View>

          <View style={styles.nutrientAmountWrapper}>
            <View style={[styles.nutrientAmount, styles.bottomPadding]}>
              <Text style={[styles.recipeFont, styles.baseText]}>DV</Text>
            </View>

            <View style={[styles.nutrientAmount, styles.bottomPadding]}>
              <Text style={[styles.recipeFont, styles.boldFont]}>
                {`${totalNutrients.SERVING_SIZE.value} ${totalNutrients.SERVING_SIZE.unit}`}
              </Text>
            </View>

            <View style={[styles.nutrientAmount, styles.bottomPadding]}>
              <Text style={[styles.recipeFont, styles.boldFont]}>
                {totalNutrients.CALORIES.value}
              </Text>
            </View>

            <View style={[styles.nutrientAmount, styles.bottomPadding]}>
              <Text style={styles.recipeFont}>
                {`${totalNutrients.TOTAL_FAT.value} ${totalNutrients.TOTAL_FAT.unit}`}
              </Text>
            </View>

            <View style={[styles.nutrientAmount, styles.bottomPadding]}>
              <Text style={styles.recipeFont}>
                {`${totalNutrients.SAT_FAT.value} ${totalNutrients.TOTAL_FAT.unit}`}
              </Text>
            </View>

            <View style={[styles.nutrientAmount, styles.bottomPadding]}>
              <Text style={styles.recipeFont}>
                {`${totalNutrients.TRANS_FAT.value} ${totalNutrients.TRANS_FAT.unit}`}
              </Text>
            </View>

            <View style={[styles.nutrientAmount, styles.bottomPadding]}>
              <Text style={styles.recipeFont}>
                {`${totalNutrients.CHOLESTEROL.value} ${totalNutrients.CHOLESTEROL.unit}`}
              </Text>
            </View>

            <View style={[styles.nutrientAmount, styles.bottomPadding]}>
              <Text style={styles.recipeFont}>
                {`${totalNutrients.SODIUM.value} ${totalNutrients.SODIUM.unit}`}
              </Text>
            </View>

            <View style={[styles.nutrientAmount, styles.bottomPadding]}>
              <Text style={styles.recipeFont}>
                {`${totalNutrients.CARBS.value} ${totalNutrients.CARBS.unit}`}
              </Text>
            </View>

            <View style={[styles.nutrientAmount, styles.bottomPadding]}>
              <Text style={styles.recipeFont}>
                {`${totalNutrients.FIBER.value} ${totalNutrients.FIBER.unit}`}
              </Text>
            </View>

            <View style={[styles.nutrientAmount, styles.bottomPadding]}>
              <Text style={styles.recipeFont}>
                {`${totalNutrients.TOTAL_SUGAR.value} ${totalNutrients.TOTAL_SUGAR.unit}`}
              </Text>
            </View>

            <View style={[styles.nutrientAmount, styles.bottomPadding]}>
              <Text style={styles.recipeFont}>
                {`${totalNutrients.PROTEIN.value} ${totalNutrients.PROTEIN.unit}`}
              </Text>
            </View>
          </View>

          <View style={styles.nutrientPercentageWrapper}>
            <View style={[styles.nutrientPercentage, styles.bottomPadding]}>
              <Text style={[styles.recipeFont, styles.baseText]}>% DV</Text>
            </View>

            <View style={[styles.nutrientPercentage, styles.bottomPadding]}>
              <Text style={styles.recipeFont}>NONE</Text>
            </View>

            <View style={[styles.nutrientPercentage, styles.bottomPadding]}>
              <Text style={styles.recipeFont}>LATER</Text>
            </View>

            <View style={[styles.nutrientPercentage, styles.bottomPadding]}>
              <Text style={styles.recipeFont}>NONE</Text>
            </View>

            <View style={[styles.nutrientPercentage, styles.bottomPadding]}>
              <Text style={styles.recipeFont}>NONE</Text>
            </View>

            <View style={[styles.nutrientPercentage, styles.bottomPadding]}>
              <Text style={styles.recipeFont}>NONE</Text>
            </View>

            <View style={[styles.nutrientPercentage, styles.bottomPadding]}>
              <Text style={styles.recipeFont}>NONE </Text>
            </View>

            <View style={[styles.nutrientPercentage, styles.bottomPadding]}>
              <Text style={styles.recipeFont}>NONE </Text>
            </View>

            <View style={[styles.nutrientPercentage, styles.bottomPadding]}>
              <Text style={styles.recipeFont}>NONE </Text>
            </View>

            <View style={[styles.nutrientPercentage, styles.bottomPadding]}>
              <Text style={styles.recipeFont}>NONE </Text>
            </View>

            <View style={[styles.nutrientPercentage, styles.bottomPadding]}>
              <Text style={styles.recipeFont}>NONE</Text>
            </View>

            <View style={[styles.nutrientPercentage, styles.bottomPadding]}>
              <Text style={styles.recipeFont}>NONE </Text>
            </View>
          </View>
        </View>*/}

        <View style={styles.buttonsContainer}>
          <View style={styles.oneButtonContainer}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={handleEditing}
              activeOpacity="0.5"
            >
              <Text style={styles.buttonText}>
                {!isEditing ? "Convert" : "Done?"}
              </Text>
            </TouchableOpacity>

            <View style={styles.editDisplay}>
              {!isEditing && (
                <Text style={styles.buttonText}>Serving Size</Text>
              )}

              {!isEditing && (
                <Text
                  style={[styles.buttonText, { marginTop: 5, marginBottom: 3 }]}
                >{`${totalNutrients.SERVING_SIZE.value} ${totalNutrients.SERVING_SIZE.unit}`}</Text>
              )}

              {isEditing && (
                <TextInput
                  style={styles.servingValueBox}
                  value={servingSize}
                  placeholder={"Set Yield"}
                  placeholderTextColor="#696969"
                  keyboardType={"numeric"}
                  onChangeText={(val) => setServingSize(val)}
                />
              )}

              {isEditing && (
                <RNPickerSelect
                  selectedValue={servingUnit}
                  placeholder={placeholderForPicker}
                  style={pickerStyles}
                  onValueChange={(unit) => setServingUnit(unit)}
                  items={unitList}
                />
              )}
            </View>
          </View>

          <View style={styles.oneButtonContainer}>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => addToJournal()}
              activeOpacity="0.5"
            >
              <Text style={styles.buttonText}>Add To</Text>
            </TouchableOpacity>

            <View style={styles.editDisplay}>
              <Text style={styles.buttonText}>Date</Text>
              <Text
                style={[styles.buttonText, { marginTop: 5, marginBottom: 3 }]}
              >{`${month}/${date}/${year}`}</Text>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const mapStateToProps = (state) => ({
  displayName: state.auth.user.displayName,
});

export default connect(mapStateToProps, null)(RecipeCard);

const styles = StyleSheet.create({
  fontSize: { fontSize: 18 },
  boldFont: { fontWeight: "bold" },
  normalFont: { fontWeight: "normal" },
  centeredText: { textAlign: "center" },
  baseText: { fontFamily: "Menlo" },
  bottomPadding: { paddingBottom: 2 },
  container: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
  },
  recipeContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: "3%",
    paddingTop: "2%",
    width: "100%",
  },
  recipeFont: {
    fontSize: 20,
    textAlign: "center",
  },
  recipeName: {
    marginBottom: "2%",
  },
  nutrientsContainer: {
    flexDirection: "row",
  },
  // ============================
  // Nutrient Title
  // ============================
  nutrientTitleWrapper: {
    borderWidth: 0.5,
    flex: 1.5,
  },
  nutrientTitle: {
    borderBottomWidth: 0.5,
  },
  // ============================
  // Nutrient Amount
  // ============================
  nutrientAmountWrapper: {
    borderWidth: 0.5,
    flex: 1,
  },
  nutrientAmount: {
    borderBottomWidth: 0.5,
  },
  // ============================
  // Nutrient Percentage
  // ============================
  nutrientPercentageWrapper: {
    borderWidth: 0.5,
    flex: 0.8,
  },
  nutrientPercentage: {
    borderBottomWidth: 0.5,
  },
  // ============================
  // Add Button
  // ============================
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: "3%",
    marginBottom: "5%",
    height: 130,
  },
  oneButtonContainer: {
    flex: 1,
  },
  editButton: {
    padding: "4%",
    marginHorizontal: "5%",
    marginTop: "5%",
    marginBottom: "2%",
    backgroundColor: "limegreen",
    borderWidth: 2,
    borderRadius: 10,
  },
  editDisplay: {
    display: "flex",
    marginTop: 5,
    justifyContent: "center",
  },
  servingValueBox: {
    justifyContent: "center",
    textAlign: "center",
    paddingVertical: 4,
    marginVertical: 4,
    marginHorizontal: "10%",
    width: "80%",
    fontSize: 16,
    borderWidth: 1,
  },
  addButton: {
    padding: "4%",
    margin: "5%",
    marginBottom: "2%",
    backgroundColor: "deepskyblue",
    borderWidth: 2,
    borderRadius: 10,
  },
  buttonText: {
    textAlign: "center",
    fontFamily: "Menlo",
    fontWeight: "bold",
    fontSize: 18,
    color: "#000000",
  },
});

const pickerStyles = StyleSheet.create({
  inputIOS: {
    justifyContent: "center",
    textAlign: "center",
    paddingHorizontal: 4,
    paddingVertical: 4,
    marginTop: 2,
    marginHorizontal: "10%",
    width: "80%",
    borderWidth: 0.5,
    fontSize: 16,
    color: "#000000",
  },
  inputAndroid: {
    // Copied code of docs
    // TODO: Make styles responsive to androids
    fontSize: 16,
    justifyContent: "center",
    textAlign: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    color: "#000000",
  },
});
