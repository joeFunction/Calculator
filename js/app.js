$(document).foundation()
const appID = "91be4d88";
const appKey = "ab48d998ad78cda49ea9a6ffbac1461b";
// Global array variables
var calArr = []
var proArr = []
var fatArr = []
var carbArr = []
var totalData = []
var itemCalArr = []
var itemCarbrr = []
var itemFatArr = []
var itemProArr = []

// Modal variables
var popup = new Foundation.Reveal($('#first-modal'))
var queryModal = new Foundation.Reveal($('#query-modal'))
var instructions = new Foundation.Reveal($('#instructions'))
// Opens modal on page load
instructions.open()
$("#meal1").click(function (e) {
    e.preventDefault()
    // Prevents empty searches
    var searchVal = $("#search-input").val()
    if (searchVal === "") {
        popup.open()
    }
    // Otherwise makes call to meal DB and displays 5 random meal cards(if able)
    else {
        $("#card-row").empty()
        $("#meal-form")[0].reset()
        $.ajax({
            method: "GET",
            url: "https://www.themealdb.com/api/json/v1/1/search.php?s=" + searchVal
        }).then(function (res) {
            let name = ""
            let shuffledOptions = shuffle(res.meals)
            for (let index = 0; index < 5; index++) {
                let option = shuffledOptions[index]
                if (option !== undefined) {
                    let img = option.strMealThumb
                    name = option.strMeal
                    let cardEl = $("<div>")
                    let cardSection = $("<div>")
                    cardSection.addClass("card-section text-center")
                    $(cardEl).addClass("card")
                    let cardImg = $("<img>")
                    $(cardImg).attr("src", img)
                    let cardName = $("<h5>")
                    cardName.text(name)
                    cardSection.append(cardName)
                    cardEl.append(cardImg)
                    cardEl.append(cardSection)
                    let cardCell = $("<div>")
                    cardCell.addClass("cell meal-option large-auto")
                    cardCell.append(cardEl)
                    $("#card-row").append(cardCell)
                }


            }
            // Makes call to Nutritionix API based on the meal clicked
            $(".meal-option").click(function (e) {
                let name = $(this)[0].innerText
                $.ajax({
                    method: "POST",
                    url: "https://trackapi.nutritionix.com/v2/natural/nutrients",
                    "headers": {
                        "Content-Type": "application/json",
                        "x-app-id": "91be4d88",
                        "x-app-key": "ab48d998ad78cda49ea9a6ffbac1461b",
                        "x-remote-user-id": "0"
                    },
                    data: JSON.stringify({
                        "query": name,
                        "timezone": "US/Eastern",
                        "locale": "en_US"
                    })
                }).then(function (res) {
                    let itemCalArr = []
                    let itemCarbArr = []
                    let itemFatArr = []
                    let itemProArr = []
                    // for each item returned from the Nutritionix API and grabs the values for each macro nutrients, and pushes them into corresponding array
                    for (let index = 0; index < res.foods.length; index++) {
                        let totalCal = res.foods[index].nf_calories
                        let totalFat = res.foods[index].nf_total_fat
                        let totalCarbs = res.foods[index].nf_total_carbohydrate
                        let totalPro = res.foods[index].nf_protein
                        itemCalArr.push(totalCal)
                        itemProArr.push(totalPro)
                        itemFatArr.push(totalFat)
                        itemCarbArr.push(totalCarbs)
                    }
                    // Adds each macro to get totals for the meal chosen
                    let itemCaltotal = parseInt(adder(itemCalArr))
                    let itemCarbtotal = parseInt(adder(itemCarbArr))
                    let itemFattotal = parseInt(adder(itemFatArr))
                    let itemPrototal = parseInt(adder(itemProArr))
                    // Pushes total macro values into arrays, to be added with additional meals
                    calArr.push(itemCaltotal)
                    carbArr.push(itemCarbtotal)
                    fatArr.push(itemFattotal)
                    proArr.push(itemPrototal)
                    let nameheader = $("<h5>")
                    nameheader.html(name)
                    let pTag = $("<p>");
                    // Grabs newest value in each array,and appends to html
                    pTag.append("Calories: " + calArr[calArr.length - 1] + "<br>", "Fat: " + fatArr[fatArr.length - 1], "<br>", "Carbs: " + carbArr[carbArr.length - 1], "<br>", "Protein: " + proArr[proArr.length - 1], "<br>")
                    let mealDiv = $("<div>")
                    $(mealDiv).append(nameheader, pTag)
                    $("#mealCategory").append(mealDiv)
                })
            })
        })
    }
})


// Clears arrays and resets html elements
$("#reset-button").click(function () {
    $("#container").empty()
    $("#mealCategory").empty()
    $("#card-row").empty()
    calArr = []
    proArr = []
    fatArr = []
    carbArr = []
    totalData = []
})
// Adding all macros from each meal and pushes into a totalData array which is used by highcharts to graph the information
function mainArr() {
    totalData = [];
    totalData.push(adder(calArr))
    totalData.push(adder(carbArr))
    totalData.push(adder(fatArr))
    totalData.push(adder(proArr))
    var myChart = Highcharts.chart('container', {
        chart: {
            type: 'column'
        },
        title: {
            text: 'Nutritional Information'
        },
        xAxis: {
            categories: ['Calories', 'Carbs', 'Fats', 'Proteins']
        },
        yAxis: {
            title: {
                text: 'Value'
            }
        },
        series: [{
            name: 'RDA',
            data: [2000, 50, 275, 78]
        }, {
            name: 'Total Selected',
            data: totalData
        }]
    });
}
// Function for adding values in array's
function adder(array) {
    var sum = array.reduce(function (a, b) {
        return a + b;
    }, 0)
    return sum
}
// Runs function to create graph
$("#calculate-btn").click(function (e) {
    e.preventDefault()
    mainArr()
})
// Function to shuffle values in array
function shuffle(a) {
    // Shows modal for unreturned search items
    if (a === null) {
        queryModal.open()
    }
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}
