import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  Button,
} from "react-native";
import searchImage from "../../assets/search_button.png";
import axios from "axios";
import config from "../../assets/API_KEYS.json";

export default function RecipeSearch() {
  const [recipe, setRecipe] = useState("");

  const fetchRecipesOnEnter = ({ nativeEvent }) => {
    // TODO: Implement fetching from recipe database here
    // use "nativeEvent.text" keyword to fetch recipes from API
    // console.log(nativeEvent.text);
  };

  const fetchRecipesOnPress = (recipe) => {
    var res = recipe.replace(/ /g, "%20");
    axios.get(`https://api.edamam.com/search?q=${res}&app_id=${config.RECIPE_API_KEYS.APP_ID}&app_key=${config.RECIPE_API_KEYS.APP_KEY}`)
    .then((res) => {
      console.log(res)
    })
    .catch((err) => {
      console.log(err)
    })
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.inputBox}
        value={recipe}
        placeholder="Search Any Recipe"
        maxLength={50}
        onChangeText={(recipe) => setRecipe(recipe)}
        onSubmitEditing={(event) => fetchRecipesOnEnter(event)}
        defaultValue={recipe}
      />
      <TouchableOpacity onPress={() => fetchRecipesOnPress(recipe)}>
        <Image source={searchImage} style={styles.searchButton} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 50,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "green",
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "center",
    marginTop: "7%",
  },
  inputBox: {
    flex: 1,
    height: 50,
    justifyContent: "center",
    fontSize: 20,
    padding: 10,
    borderRightWidth: 0.2,
    borderColor: "green",
  },
  searchButton: {
    height: 45,
    width: 45,
    marginRight: 5,
    marginLeft: 5,
  },
});
