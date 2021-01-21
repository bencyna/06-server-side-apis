$(document).ready(function () {
  // adding cities searched to cities array
  var cities = [];
  // adding buttons of cities to buttons array
  var cityBtns = [];
  // call getting items from local storage
  getItems();
  // displaying cities search to page
  function renderCities() {
    $(".list-items").html("");

    for (var i = 0; i < cities.length; i++) {
      for (var j = 0; j < i; j++) {
        if (cities[i] === cities[j] || cities[i] == "") {
          cities.splice(i, 1); // removes duplicates and empty searches
        }
      }
    }
    // Displaying cities by creating li elemtns for them to display
    // Adding buttons to the cityBtns array
    for (var p = 0; p < cities.length; p++) {
      var city = cities[p];

      var li = $("<li>");
      var button = $("<button type = 'button' class = 'cities'>").val(city);
      button.text(city);
      button.attr("data-attribute", p);
      li.append(button);
      $(".list-items").prepend(li);
      cityBtns.push(button);
    }
  }
  // get items from local storage to be displayed
  function getItems() {
    var storedCities = JSON.parse(localStorage.getItem("cities"));
    if (storedCities !== null) {
      cities = storedCities;
    }
    // Displays already searched cities upon reload
    renderCities();
  }
  // Storing items from cities array in local storage
  function storeCities() {
    localStorage.setItem("cities", JSON.stringify(cities));
  }
  //  storing input in the cities array
  function storeInputs() {
    var cityLabel = $("#cityInput").val();
    cities.push(cityLabel);
    // error check for empty searches
    if (cityLabel == "") {
      return;
    }
    storeCities();
    renderCities();
  }
  // adding clear button to remove previously searched cities
  $("#clearBtn").click(function (event) {
    var element = event.target;
    var index = element.parentElement.getAttribute("data-attribute");
    cities.splice(index, cities.length);
    storeCities();
    renderCities();
  });

  // DisplayFiveDayForecast() and currentWeather() are called
  $(".searchBtn").click(function (event) {
    event.preventDefault();
    // empty previous city chosen
    $(".keyDetails").empty();
    $(".fiveDayTitle").empty();
    $(".fiveDay").empty();
    // value of city name is the user inout if search button is clicked
    currentWeather($("#cityInput").val().trim());
    displayFiveDayForecast($("#cityInput").val().trim());
  });
  // DisplayFiveDayForecast() and currentWeather() are called
  $(".list-items").on("click", ".cities", function(event){
    event.preventDefault();
    // empty previous city valuies on click
    $(".keyDetails").empty();
      $(".fiveDayTitle").empty();
      $(".fiveDay").empty();
      // if a previoulsy searched city is clicked the text of city name is the value of the button
      displayFiveDayForecast($(this).val());
      currentWeather($(this).val());
    // });
  });
  // setting api key to retrieve information from
  var APIKey = "2b07c349d7b932546c42e60806d40881";

  // function for ajax call and display for current weather
  function currentWeather(cityName) {
    var queryURLKeyDetails =
      "https://api.openweathermap.org/data/2.5/weather?q=" +
      cityName +
      "&appid=" +
      APIKey;

    // ajax call to get desired information
    $.ajax({
      url: queryURLKeyDetails,
      method: "GET",
      // after ajax has been retrieved this function can execute
    }).then(function (response) {
      // getting local temperature
      var temperatureTemp = response.main.temp - 273;
      // rounding it to 2 decimal places
      temperatureTemp = Math.round(temperatureTemp * 100) / 100;
      var temperature = $("<li>").text(
        "Temperature: " + temperatureTemp + " C°"
      );
      // getting humidty value within a li element
      var humidity = $("<li>").text(
        "Humidity: " + response.main.humidity + "%"
      );
      // getting windspeed and adding to li element
      var windSpeed = $("<li>").text(
        "Wind Speed: " + response.wind.speed + " knots"
      );
      // adding ul for data to be displayed in
      var keyDetailsList = $("<ul>").attr("class", "keyDetailsList");

      // appending data to ul above
      keyDetailsList.append(temperature);
      keyDetailsList.append(humidity);
      keyDetailsList.append(windSpeed);

      // appendning ul above to the page
      $(".keyDetails").append(keyDetailsList);

      lat = response.coord.lat;

      lon = response.coord.lon;
      // calling UVindex function after currentWeather to get latitude and longitude coords
      displayUVindex();
      storeInputs();
    });
  };
  // assigning lat and lon to global scope
  var lon = "";
  var lat = "";

  // display Uv index function
  function displayUVindex() {
    // getting latitude and longitude coordinates for uv index
    var queryURLuv =
      "https://api.openweathermap.org/data/2.5/uvi?lat=" +
      lat +
      "&lon=" +
      lon +
      "&appid=" +
      APIKey;
    // call uv api
    $.ajax({
      url: queryURLuv,
      method: "GET",
      // then function runs after api call
    }).then(function (object) {
      // text displayed before UV
      var UVIndex = $("<li>").text("UV Index: ");
      var UVnum = "";
      // checking uv value to add colour based on severity
      if (object.value < 3) {
        UVnum = $("<i class = 'mild'>").text(object.value);
      }
      if (3 < object.value > 5) {
        UVnum = $("<i class = 'moderate'>").text(object.value);
      }
      if (object.value < 3) {
        UVnum = $("<i class = 'mild'>").text(object.value);
      }
      if (object.value > 5) {
        UVnum = $("<i class = 'severe'>").text(object.value);
      }
      // display Uv index to the page
      UVIndex.append(UVnum);
      $(".keyDetailsList").append(UVIndex);
      storeInputs();
    });
  };
  // Forecast for next 5 days function
  function displayFiveDayForecast(cityName) {
    queryURLFiveDay =
      "https://api.openweathermap.org/data/2.5/forecast?q=" +
      cityName +
      "&appid=" +
      APIKey;
    // call 5 day forecast API
    $.ajax({
      url: queryURLFiveDay,
      method: "GET",
    }).then(function (forecast) {
      // loop through each day
      for (var i = 0; i < 40; i++) {
        var setDay = forecast.list[i];
        // removing letters from string to display desired part
        var dateTemp = setDay.dt_txt;
        var dateString = JSON.stringify(dateTemp);
        // display the date only
        var date = dateString.slice(1, 11);
        // display the time only
        var time = dateString.slice(12, 20);
        // find the time at midday and use that as the forecast weather
        if (time == "12:00:00") {
          // get whether it is cloudy, sunny rain or snow
          var description = $("<li>").text(setDay.weather[0].main);

          var descriptionLi = $("<li class = 'forecastText'>");

          if (description.text() == "Rain") {
            var descriptionOf = $("<i class='fas fa-cloud-showers-heavy'>");
          }
          if (description.text() == "Clear") {
            var descriptionOf = $("<i class='fas fa-sun'>");
          }
          if (description.text() == "Snow") {
            var descriptionOf = $("<i class='fas fa-snowflake'>");
          }
          if (description.text() == "Clouds") {
            var descriptionOf = $("<i class='fas fa-cloud'>");
          }
          // get temperature
          var tempTemp = setDay.main.temp - 273;
          // round to 2 decimal places
          tempTemp = Math.round(tempTemp * 100) / 100;
          // temperature display
          var temp = $("<li class = 'forecastText'>").text(
            "Temp: " + tempTemp + " C°"
          );
          // get humidity and add to li with class forecastText
          var humid = $("<li class = 'forecastText'>").text(
            "Humidity: " + setDay.main.humidity + "%"
          );
          // create a new div for forecast to append to
          var newCol = $("<div class = 'col-md-2 forecast'>");
          // get the name and date of the city
          var cityDay = $("<h2>").text(forecast.city.name + " (" + date + ")");
          // adding title
          var fiveDayTitle = $("<h2>").text("5-Day Forecast");
          // appending above to page
          descriptionLi.append(descriptionOf);
          newCol.append(date);
          newCol.append(descriptionLi);
          newCol.append(temp);
          newCol.append(humid);

          $(".fiveDay").append(newCol);
        }
      }
      // displaying date to top of page
      $(".keyDetails").prepend(cityDay);
      // displaying title above 5 day forecast
      $(".fiveDayTitle").append(fiveDayTitle);

      storeInputs();
    });
  };
});
