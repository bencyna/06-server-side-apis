$(document).ready(function () {
  var cities = [];
  var cityBtns = [];
  getItems();
  console.log(cityBtns[0].val());
  function renderCities() {
    $(".list-items").html("");

    for (var i = 0; i < cities.length; i++) {
      for (var j = 0; j < i; j++) {
        if (cities[i] === cities[j] || cities[i] == "") {
          cities.splice(i, 1);
        }
      }
    }

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

  function getItems() {
    var storedCities = JSON.parse(localStorage.getItem("cities"));
    if (storedCities !== null) {
      cities = storedCities;
    }
    renderCities();
  }

  function storeCities() {
    localStorage.setItem("cities", JSON.stringify(cities));
  }

  function storeInputs() {
    var cityLabel = $("#cityInput").val();
    cities.push(cityLabel);
    if (cityLabel == "") {
      return;
    }

    storeCities();
    renderCities();
  }

  $("#clearBtn").click(function (event) {
    var element = event.target;
    var index = element.parentElement.getAttribute("data-attribute");
    cities.splice(index, cities.length);

    storeCities();
    renderCities();
  });

  var cityName = "";
  $(".searchBtn").click(function () {
    cityName = $("#cityInput").val().trim();
    console.log("search clicked");
  });

  cityBtns.forEach(function (cityBtns) {
    cityBtns.click(function () {
      cityName = cityBtns.val();
      console.log("button clicked");
      console.log(cityBtns.val());
    });
  });

  function displayWeather(event) {
    event.preventDefault();

    $(".keyDetails").empty();
    $(".fiveDayTitle").empty();
    $(".fiveDay").empty();

    var APIKey = "2b07c349d7b932546c42e60806d40881";
    queryURLKeyDetails =
      "http://api.openweathermap.org/data/2.5/weather?q=" +
      cityName +
      "&appid=" +
      APIKey;
    queryURLFiveDay =
      "https://api.openweathermap.org/data/2.5/forecast?q=" +
      cityName +
      "&appid=" +
      APIKey;
    $.ajax({
      url: queryURLKeyDetails,
      method: "GET",
    }).then(function (response) {
      var temperatureTemp = response.main.temp - 273;
      temperatureTemp = Math.round(temperatureTemp * 100) / 100;
      var temperature = $("<li>").text(
        "Temperature: " + temperatureTemp + " C°"
      );
      var humidity = $("<li>").text(
        "Humidity: " + response.main.humidity + "%"
      );

      var windSpeed = $("<li>").text(
        "Wind Speed: " + response.wind.speed + "unit of measurement"
      );

      var keyDetailsList = $("<ul>").attr("class", "keyDetailsList");

      keyDetailsList.append(temperature);
      keyDetailsList.append(humidity);
      keyDetailsList.append(windSpeed);

      $(".keyDetails").append(keyDetailsList);

      var lat = response.coord.lat;

      var lon = response.coord.lon;

      var queryURLuv =
        "http://api.openweathermap.org/data/2.5/uvi?lat=" +
        lat +
        "&lon=" +
        lon +
        "&appid=" +
        APIKey;
      $.ajax({
        url: queryURLuv,
        method: "GET",
      }).then(function (object) {
        var UVIndex = $("<li>").text("UV Index: ");
        // if uv index greater than x set attribute ...

        if (object.value < 3) {
          var UVnum = $("<i class = 'mild'>").text(object.value);
        }
        if (3 < object.value > 5) {
          var UVnum = $("<i class = 'moderate'>").text(object.value);
        }
        if (object.value < 3) {
          var UVnum = $("<i class = 'mild'>").text(object.value);
        }
        if (object.value > 5) {
          var UVnum = $("<i class = 'severe'>").text(object.value);
        }

        UVIndex.append(UVnum);
        keyDetailsList.append(UVIndex);
        storeInputs();
      });
    });
    $.ajax({
      url: queryURLFiveDay,
      method: "GET",
    }).then(function (forecast) {
      console.log(forecast);
      for (var i = 0; i < 40; i++) {
        var setDay = forecast.list[i];

        var dateTemp = setDay.dt_txt;
        var dateString = JSON.stringify(dateTemp);
        var date = dateString.slice(1, 11);
        var time = dateString.slice(12, 20);
        if (time == "12:00:00") {
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

          var tempTemp = setDay.main.temp - 273;
          tempTemp = Math.round(tempTemp * 100) / 100;
          var temp = $("<li class = 'forecastText'>").text(
            "Temp: " + tempTemp + " C°"
          );

          var humid = $("<li class = 'forecastText'>").text(
            "Humidity: " + setDay.main.humidity + "%"
          );

          var newCol = $("<div class = 'col-md-2 forecast'>");

          var cityDay = $("<h2>").text(forecast.city.name + " (" + date + ")");

          var fiveDayTitle = $("<h2>").text("5-Day Forecast");

          descriptionLi.append(descriptionOf);
          newCol.append(date);
          newCol.append(descriptionLi);
          newCol.append(temp);
          newCol.append(humid);

          $(".fiveDay").append(newCol);
        }
      }
      $(".keyDetails").prepend(cityDay);
      $(".fiveDayTitle").append(fiveDayTitle);

      storeInputs();
    });
  }

  // $(".cities").click(displayWeather);
  cityBtns.forEach(function (cityBtns) {
    cityBtns.click(displayWeather);
  });

  $(".searchBtn").click(displayWeather);
});
