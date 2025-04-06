var customTooltips = [];
var labels = [1, 2, 3, 4, 5];
var values = [1, 2, 4, 8, 16];

var ctx = document.getElementById('graph').getContext('2d');
var myChart = new Chart(ctx, {
    type: 'line',  
    data: {
        labels: labels,
        datasets: [{
            label: 'Exponential Growth',
            data: values, 
            fill: false,             
            borderColor: '#64ffda', 
            borderWidth: 3,         
            pointBackgroundColor: 'white', 
            pointRadius: 2.5,         
            pointBorderColor: 'white', 
            cubicInterpolationMode: 'monotone', 
            hoverBorderWidth: 0.5    
        }]
    },
    options: {
        responsive: true,          
        animation: {
            duration: 450,        
            easing: 'easeOut' 
        },
        scales: {
            x: {
                title: {
                    display: true,
                    color: "white",
                    text: 'X-axis'
                },
                ticks: {
                    color: 'white' 
                },
                grid: {
                    display: false,  
                    drawBorder: true 
                },
                border: {
                    color: 'white',
                    width: 2         
                }
            },
            y: {
                title: {
                    display: true,
                    color: "white", 
                    text: 'Y-axis'
                },
                ticks: {
                    color: 'white' 
                },
                grid: {
                    display: false,  
                    drawBorder: true 
                },
                border: {
                    color: 'white', 
                    width: 2         
                }
            }
        },
        plugins: {
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                titleColor: 'white',                   
                bodyColor: 'white',                    
                borderColor: 'dodgerblue', 
                borderWidth: 1,
                padding: 10,
                cursro: "pointer",
                callbacks: {
                    title: function () {
                        return '';  
                    },
                    // Custom label for tooltip
                    label: function (tooltipItem) {
                        var date = customTooltips[tooltipItem.dataIndex];
                        var profitText = `${selectedCompany}: $` + tooltipItem.formattedValue;
                        return [
                            "Date: " + date,  
                            profitText                       
                        ];
                    }
                }
            },
            legend: {
                position: 'top',
                labels: {
                    color: 'white'  
                }
            },
        },
        layout: {
            padding: {
                top: 20,
                left: 20,
                right: 20,
                bottom: 20
            }
        }
    }
});

//Fetching Data;
let fullStockData = [];
let points = [];
let xAxisTicks = [];
let selectedCompany = "AAPL";
let selectedTimeSpan = "1mo";
let profitsData = [];
let summaryData = []


//Function to collect full data from API
const getFullStockData = async () => {
    try {
        let response = await fetch("https://stocksapi-uhe1.onrender.com/api/stocks/getstocksdata");
        if (!response.ok) throw new Error("Some error occured");
        let data = await response.json();
        fullStockData = data.stocksData[0];
        return data.stocksData[0];
    }
    catch (err) {
        console.log(err);
    }
}


//Function to fetch company summary:
const getCompanySummary = async () => {
    try {
        let response = await fetch("https://stocksapi-uhe1.onrender.com/api/stocks/getstocksdata");
        if (!response.ok) throw new Error("Some error occured");
        let data = await response.json();
        return data.stocksData[0];
    }
    catch (err) {
        console.log(err);
    }
}

//Function to fetch company profits:
const getCompanyProfits = async () => {
    try {
        let response = await fetch("https://stocksapi-uhe1.onrender.com/api/stocks/getstockstatsdata");
        if (!response.ok) throw new Error("Some error occured");
        let data = await response.json();
        return data["stocksStatsData"][0];
    }
    catch (err) {
        console.log(err);
    }
}

//Function to fetch company summary:
const getSummary = async () => {
    try {
        let response = await fetch("https://stocksapi-uhe1.onrender.com/api/stocks/getstocksprofiledata");
        if (!response.ok) throw new Error("Some error occured");
        let data = await response.json();
        return data["stocksProfileData"][0];
    }
    catch (err) {
        console.log(err);
    }
}

//Function to generate profit/bookvalue/company-name buttons
const generateProfitElements = (data) => {
    Object.keys(data).forEach((key, index) => {
        if (key === "_id") return;
        let wrapper = document.createElement("div");
        let button = document.createElement("button");
        button.style.width = "fit-content";
        button.classList.add("company-btn");
        if (index == 0) button.classList.add("active-comapany-btn");
        button.addEventListener("click", handleCompanyChange)
        button.textContent = key;

        let bookValueSpan = document.createElement("span");
        bookValueSpan.textContent = "$" + data[key]["bookValue"].toFixed(2);
        bookValueSpan.classList.add("light");

        let profitLossSpan = document.createElement("span");
        profitLossSpan.textContent = data[key]["profit"].toFixed(2) + "%";

        if (data[key]["profit"].toFixed(2).toString() == "0.00") profitLossSpan.classList.add("danger")
        else profitLossSpan.classList.add("success");

        wrapper.append(button, bookValueSpan, profitLossSpan);
        document.getElementById("profit-container").append(wrapper);
    })
}

//Creating the first chart after content is loaded
document.addEventListener("DOMContentLoaded", async () => {
    fullStockData = await getFullStockData();
    profitsData = await getCompanyProfits();
    summaryData = await getSummary();
    document.getElementById("loader-container").style.display = "none";
    document.getElementById("profit-container").style.display = "block";
    generateProfitElements(profitsData);
    updateCompanyDescription("AAPL");
    updateChart("AAPL", "1mo");

    console.log(fullStockData["AAPL"]["1mo"])
});


//Function to update the chart with new data:
const updateChart = (company = "AAPL", timeSpan = "") => {
    data = fullStockData[company][timeSpan];
    let values = data.value;
    let labels = [];
    let timeStamps = [];
    for (let i = 0; i < values.length; i++) {
        labels.push(i);
        let date = new Date(data.timeStamp[i] * 1000);
        let day = String(date.getDate()).padStart(2, '0');
        let month = String(date.getMonth() + 1).padStart(2, '0');
        let year = date.getFullYear();
        let formattedDate = `${day}/${month}/${year}`;
        timeStamps.push(formattedDate);
    }
    myChart.data.labels = labels;
    myChart.data.datasets[0].data = values;
    customTooltips = timeStamps;

    let min = Infinity; 
    let max = -Infinity; 
    let valuesArray = fullStockData[company][timeSpan]["value"];
    
    for (let i = 0; i < valuesArray.length; i++) {
        if (valuesArray[i] > max) max = valuesArray[i];
        if (valuesArray[i] < min) min = valuesArray[i];
    }

    document.getElementById("peak-val").textContent = `$${max.toFixed(2)}`;
    document.getElementById("low-val").textContent = `$${min.toFixed(2)}`;
    

    myChart.update();
};


//Event listeners for all the time span selection buttons:
let allTimeBtns = document.getElementsByClassName("span-btn");
Array.from(allTimeBtns).forEach((btn) => {
    btn.addEventListener("click", (e) => {
        if (btn.classList.contains("active-btn")) return;

        Array.from(allTimeBtns).forEach((button) => {
            button.classList.remove("active-btn");
        });

        btn.classList.add("active-btn");
        selectedTimeSpan = btn.dataset.type;
        updateChart(selectedCompany, selectedTimeSpan);
    });
});


//Event Listener function to handle company change:
const allCompanyBtns = document.getElementsByClassName("company-btn")
const handleCompanyChange = (e) => {
    let btn = e.target;
    if (btn.classList.contains("active-comapany-btn")) return;

    Array.from(allCompanyBtns).forEach((button) => {
        button.classList.remove("active-comapany-btn");
    });

    btn.classList.add("active-comapany-btn");
    selectedCompany = btn.textContent;
    updateChart(selectedCompany, selectedTimeSpan);
    updateCompanyDescription(selectedCompany);
}

//Function to update company description below the graph
const updateCompanyDescription = (name) => {
    let companyName = document.getElementById("company-name");
    let companyProfit = document.getElementById("company-profit");
    let companyBookValue = document.getElementById("company-book-value");
    let summaryPara = document.getElementById("summary");
    companyName.textContent = name;
    companyBookValue.textContent = `$${profitsData[name]["bookValue"]}`;
    companyProfit.textContent = `${profitsData[name]["profit"].toFixed(2)}%`
    if (profitsData[name]["profit"].toFixed(2).toString() == "0.00") {
        companyProfit.classList.add("danger");
        companyProfit.classList.remove("success");
    }
    else {
        companyProfit.classList.remove("danger");
        companyProfit.classList.add("success");
    }
    summaryPara.textContent = summaryData[name]["summary"];
}

