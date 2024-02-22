const company_tab_name = "Company";
const summary_tab_name = "Stock Summary";
const charts_tab_name = "Charts";
const news_tab_name = "Latest News";
let isDataRetrieved = false;
let modulatedStockSummaryData;
let modulatedChartsData;
let modulatedNewsData;
let maxVolumeForCharts;
const dataModulationFunctionMap = {
  stockSummary: modulateStockSummary,
  companyNews: modulateNews,
  highCharts: modulateCharts,
};

const displayDataFunctionMap = {
  stockSummary: displayStockSummaryData,
  companyNews: displayNewsData,
  highCharts: displayChartsData,
};

const dataObjectMap = {
  stockSummary: {},
  companyNews: {},
  highCharts: {},
};

const attribute_mapping_company = {
  logo: "company_logo",
  name: "company_name",
  ticker: "stock_ticker_symbol",
  exchange: "stock_exchange_code",
  ipo: "company_start_date",
  finnhubIndustry: "category",
};

const attribute_mapping_stock_summary = {
  t: "trading_day",
  pc: "previous_closing_price",
  o: "opening_price",
  h: "high_price",
  l: "low_price",
  d: "change",
  dp: "change_percent",
};

const attribute_mapping_news = {
  image: "image",
  headline: "title",
  datetime: "date",
  url: "link_to_post",
};

const attribute_mapping_charts_close_price = {
  t: "date",
  c: "stock_price",
};

const attribute_mapping_charts_volume = {
  t: "date",
  v: "volume",
};

function clearActiveTabsAndHideContent() {
  document.querySelectorAll(".tabButton").forEach((tab) => {
    tab.classList.remove("active");
  });
  document.querySelectorAll(".tabContent").forEach((content) => {
    content.style.display = "none";
  });
  const errorDiv = document.getElementById("error");
  errorDiv.innerHTML = "";
  errorDiv.display = "none";
}
document.addEventListener("DOMContentLoaded", (event) => {
  const searchForm = document.getElementById("searchInput");
  searchForm.addEventListener("submit", function (ev) {
    ev.preventDefault();
    const stockTickerSymbol = document
      .getElementById("searchText")
      .value.toUpperCase();
    fetchStockInfo(stockTickerSymbol);
    fetchDataForTabs(stockTickerSymbol);
  });
});

async function fetchStockInfo(stockTickerSymbol) {
  try {
    const errorDivContainer = document.getElementById("error");
    errorDivContainer.innerHTML = "";

    const response = await fetch(
      `/stockInfo?stockTickerSymbol=${encodeURIComponent(stockTickerSymbol)}`
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();

    if (
      data &&
      Object.keys(data).length === 0 &&
      Object.keys(data)[0] !== "error"
    ) {
      clearActiveTabsAndHideContent();
      document.getElementById("resultData").style.display = "none";
      document.getElementById("companyTabData").style.display = "none";
      document.getElementById("stockSummaryTabData").style.display = "none";
      document.getElementById("chartsTabData").style.display = "none";
      document.getElementById("newsTabData").style.display = "none";
      const errorDivContainer = document.getElementById("error");
      errorDivContainer.innerHTML = "";
      const errorDiv = document.createElement("p");
      errorDiv.style.display = "block";
      errorDiv.style.backgroundColor = "rgb(234 234 234)";
      errorDiv.style.height = "20px";
      errorDiv.style.padding = "14px 70px";
      errorDiv.style.margin = "180px 150px";
      errorDiv.style.width = "auto";
      errorDiv.textContent = `Error: No record has been found, please enter a valid symbol`;
      errorDiv.style.borderRadius = "12px";
      errorDiv.style.fontSize = "18px";
      errorDivContainer.appendChild(errorDiv);
      errorDivContainer.style.display = "block";
      return;
    } else {
      const modulatedData = modulateCompanyData(data);
      displayCompanyData(modulatedData);
      document.getElementById("resultData").style.display = "flex";
      document.getElementById("companyTabData").style.display = "flex";
      activateTab(0);
    }
  } catch (error) {
    //console.log("error in stockInfo - ", error);
  }
}

async function fetchDataForTabs(stockTickerSymbol) {
  const endpoints = {
    companyNews: `/companyNews?stockTickerSymbol=${encodeURIComponent(
      stockTickerSymbol
    )}`,
    stockrecommendationTrends: `/stockrecommendationTrends?stockTickerSymbol=${encodeURIComponent(
      stockTickerSymbol
    )}`,
    stockSummary: `/stockSummary?stockTickerSymbol=${encodeURIComponent(
      stockTickerSymbol
    )}`,
    highCharts: `/highCharts?stockTickerSymbol=${encodeURIComponent(
      stockTickerSymbol.toUpperCase()
    )}`,
  };

  try {
    const promises = Object.entries(endpoints).map(([apiName, apiEndpoint]) =>
      fetch(apiEndpoint)
        .then((response) => response.json())
        .then((data) => ({ apiName, data }))
    );

    const dataForAllTabs = await Promise.all(promises);

    let recommendationTrendsApiResult = dataForAllTabs.find(
      (dataElements) => dataElements.apiName === "stockrecommendationTrends"
    );

    let companyNewsData = dataForAllTabs.find(
      (dataElements) => dataElements.apiName === "companyNews"
    );
    if (companyNewsData?.data.length === 0) {
      return;
    } else {
      dataForAllTabs.forEach(({ apiName, data }) => {
        const dataModulationFunction = dataModulationFunctionMap[apiName];
        let displayFunction = displayDataFunctionMap[apiName];
        let dataObject = dataObjectMap[apiName];
        let resultForEveryTab;
        if (apiName === "stockSummary") {
          resultForEveryTab =
            dataModulationFunction &&
            dataModulationFunction(data, recommendationTrendsApiResult.data);
          dataObject = resultForEveryTab;
          displayFunction &&
            displayFunction(
              dataObject.stockSummary,
              dataObject.recommendationTrend
            );
        } else {
          resultForEveryTab =
            dataModulationFunction && dataModulationFunction(data);
          dataObject = resultForEveryTab;
          displayFunction && displayFunction(dataObject);
        }
      });
    }
  } catch (error) {
    //console.log(`error in fetchDataForAllTabs, - ${error}`);
  }
}

function modulateCompanyData(response) {
  let company_data = {};
  for (attribute in response) {
    if (attribute in attribute_mapping_company) {
      company_data[attribute_mapping_company[attribute]] = response[attribute];
    }
  }
  return company_data;
}

function modulateStockSummary(
  stockSummaryResponse,
  recommendationTrendsResponse
) {
  let stock_summary = {};
  for (attribute in stockSummaryResponse) {
    if (attribute in attribute_mapping_stock_summary) {
      stock_summary[attribute_mapping_stock_summary[attribute]] =
        stockSummaryResponse[attribute];
    }
  }

  const unixTimeStamp = stock_summary["trading_day"];
  const date = new Date(unixTimeStamp * 1000);
  const day = date.getDate();
  const month = date.toLocaleString("default", { month: "long" });
  const year = date.getFullYear();
  stock_summary["trading_day"] = `${day} ${month}, ${year}`;

  function parseDate(dateString) {
    return new Date(dateString);
  }

  const latestDateData = recommendationTrendsResponse.reduce(
    (latest, current) => {
      return parseDate(latest.period) > parseDate(current.period)
        ? latest
        : current;
    }
  );

  let recommendationTrendData = [
    { text: "strongsell", value: latestDateData.strongSell },
    { text: "sell", value: latestDateData.sell },
    { text: "hold", value: latestDateData.hold },
    { text: "buy", value: latestDateData.buy },
    { text: "strongbuy", value: latestDateData.strongBuy },
  ];

  return {
    stockSummary: stock_summary,
    recommendationTrend: recommendationTrendData,
  };
}

function modulateNews(response) {
  const orderOfKeys = ["image", "headline", "datetime", "url"];
  const attribute_mapping_news = {
    image: "image",
    headline: "title",
    datetime: "date",
    url: "link_to_post",
  };

  const validNewsItems = [];
  let mappedNewsItems = [];

  for (let item of response) {
    const isValidItem = orderOfKeys.every(
      (key) => item.hasOwnProperty(key) && item[key]
    );
    if (isValidItem) {
      validNewsItems.push(item);
      if (validNewsItems.length === 5) {
        break;
      }
    }
  }

  for (let item of validNewsItems) {
    let news = {};
    for (let attribute in item) {
      if (attribute in attribute_mapping_news) {
        news[attribute_mapping_news[attribute]] = item[attribute];
      }
    }
    mappedNewsItems.push(news);
  }

  return mappedNewsItems;
}

function modulateCharts(response) {
  const data = response.results;
  let closePriceData = [];
  let volumeData = [];
  for (let item of data) {
    let mappedItem = [item["t"], item["c"]];
    closePriceData.push(mappedItem);
  }

  for (let item of data) {
    let volumeItem = [item["t"], item["v"]];
    volumeData.push(volumeItem);
  }

  maxVolumeForCharts = Math.max(...volumeData.map((obj) => obj[1]));
  return (modulatedHighChartsData = {
    closePriceData: closePriceData,
    volumeData: volumeData,
  });
}

function clearSearchInput() {
  document.getElementById("searchText").value = "";
  clearActiveTabsAndHideContent();
  isDataRetrieved = false;
  document.getElementById("error").innerHTML = "";
  document.getElementById("error").style.display = "none";
  document.getElementById("resultData").style.display = "none";
  document.getElementById("companyTabData").style.display = "none";
  document.getElementById("stockSummaryTabData").style.display = "none";
  document.getElementById("chartsTabData").style.display = "none";
  document.getElementById("newsTabData").style.display = "none";
}

function getDataForCompanyTab() {
  activateTab(0);
}

function getDataForStockSummaryTab() {
  activateTab(1);
}

function getDataForChartsTab() {
  activateTab(2);
}

function getDataForNewsTab() {
  activateTab(3);
}

function activateTab(tabIndex) {
  clearActiveTabsAndHideContent();
  const allTabs = document.querySelectorAll("#tabsList .tabButton");
  allTabs.forEach((tab, index) => {
    if (index === tabIndex) {
      tab.classList.add("active");
      let tabDataId = tab.getAttribute("data-tab-target");
      document.getElementById(tabDataId).style.display = "block";
    } else {
      let tabDataId = tab.getAttribute("data-tab-target");
      document.getElementById(tabDataId).style.display = "none";
    }
  });
}

function deactivateAllTabs() {
  const allTabs = document.querySelectorAll("#tabsList .tabButton");
  allTabs.forEach((tab, index) => {
    tab.classList.remove("active");
  });
}

function displayCompanyData(companyData) {
  const orderOfKeys = [
    "company_logo",
    "company_name",
    "stock_ticker_symbol",
    "stock_exchange_code",
    "company_start_date",
    "category",
  ];

  const containerDiv = document.getElementById("companyTabData");
  containerDiv.innerHTML = "";

  const table = document.createElement("table");
  table.classList.add("company-data-table");
  table.style.borderCollapse = "collapse";
  table.style.paddingTop = "3%";
  table.style.margin = "auto";
  table.style.height = "75%";
  table.style.width = "65%";

  const fragmentContainer = document.createDocumentFragment();

  if (companyData["company_logo"]) {
    const logoImg = document.createElement("img");
    logoImg.src = companyData["company_logo"];
    logoImg.style.display = "block";
    logoImg.style.margin = "auto";
    logoImg.style.height = "110px";
    logoImg.style.width = "auto";
    logoImg.style.paddingBottom = "2%";
    logoImg.style.paddingTop = "3%";
    containerDiv.appendChild(logoImg);
  }
  orderOfKeys.forEach((key) => {
    if (key !== "company_logo") {
      const row = table.insertRow();
      const keyCell = document.createElement("th");
      const valueCell = document.createElement("td");

      keyCell.textContent =
        key === "company_start_date"
          ? "Company IPO Date"
          : key
              .split("_")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ");
      valueCell.textContent = companyData[key];
      keyCell.style.textAlign = "right";
      keyCell.style.width = "48%";
      valueCell.style.textAlign = "left";
      valueCell.style.paddingLeft = "2%";
      keyCell.style.borderTop = "1px solid rgb(242 238 238)";
      valueCell.style.borderTop = "1px solid rgb(242 238 238)";
      keyCell.style.borderBottom = "1px solid rgb(242 238 238)";
      valueCell.style.borderBottom = "1px solid rgb(242 238 238)";
      row.appendChild(keyCell);
      row.appendChild(valueCell);
      fragmentContainer.appendChild(row);
    }
  });

  table.appendChild(fragmentContainer);
  containerDiv.appendChild(table);
}

function displayStockSummaryData(stockSummaryData, recommendationTrend) {
  const stockSummaryTabContent = document.getElementById("stockSummaryTabData");
  stockSummaryTabContent.innerHTML = "";
  const stockTickerSymbol = document
    .getElementById("searchText")
    .value.toUpperCase();
  const orderOfKeys = [
    "stock_ticker_symbol",
    "trading_day",
    "previous_closing_price",
    "opening_price",
    "high_price",
    "low_price",
    "change",
    "change_percent",
  ];
  stockSummaryTabContent.style.paddingTop = "2%";

  const table = document.createElement("table");
  table.classList.add("stockSummary-data-table");
  table.style.borderCollapse = "collapse";
  table.style.paddingTop = "5%";
  table.style.margin = "auto";
  table.style.height = "100%";
  table.style.width = "65%";
  const fragmentContainer = document.createDocumentFragment();

  orderOfKeys.forEach((key) => {
    const row = table.insertRow();
    const keyCell = document.createElement("th");
    const valueCell = document.createElement("td");

    keyCell.textContent = key
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
    if (key === "stock_ticker_symbol") {
      valueCell.textContent = stockTickerSymbol;
    } else if (key === "change" || key === "change_percent") {
      const value = stockSummaryData[key];
      const textNode = document.createTextNode(value);
      valueCell.appendChild(textNode);

      const arrowImg = document.createElement("img");
      arrowImg.style.marginLeft = "5px";
      arrowImg.style.width = "8%";

      if (value < 0) {
        arrowImg.src = "images/RedArrowDown.png";
      } else if (value > 0) {
        arrowImg.src = "images/GreenArrowUp.png";
      }

      if (value !== 0) {
        valueCell.appendChild(arrowImg);
      }
    } else {
      valueCell.textContent = stockSummaryData[key];
    }
    keyCell.style.textAlign = "right";
    keyCell.style.width = "48%";
    valueCell.style.textAlign = "left";
    valueCell.style.paddingLeft = "2%";
    keyCell.style.borderTop = "1px solid rgb(242 238 238)";
    valueCell.style.borderTop = "1px solid rgb(242 238 238)";
    keyCell.style.borderBottom = "1px solid rgb(242 238 238)";
    valueCell.style.borderBottom = "1px solid rgb(242 238 238)";

    row.appendChild(keyCell);
    row.appendChild(valueCell);

    fragmentContainer.appendChild(row);
  });

  table.appendChild(fragmentContainer);

  let trendDiv = document.createElement("div");
  let strongSellText = document.createElement("p");
  strongSellText.innerHTML = "Strong Sell";
  strongSellText.id = "strongSellLabel";
  let strongBuyText = document.createElement("p");
  strongBuyText.innerHTML = "Strong Buy";
  strongBuyText.id = "strongBuyLabel";
  let trend = document.createElement("ul");
  trend.id = "trendList";
  trend.style.color = "white";
  let caption = document.createElement("p");
  caption.innerHTML = "Recommendation Trends";
  caption.id = "trendCaption";
  caption.style.paddingLeft = "33%";
  caption.style.paddingBottom = "15%";
  caption.style.fontSize = "20px";
  caption.style.margin = "auto";

  trendDiv.appendChild(strongSellText);
  recommendationTrend.forEach((trendVal) => {
    let trendBox = document.createElement("li");
    trendBox.innerHTML = trendVal.value;
    trendBox.id = trendVal.text;
    trendBox.style.textAlign = "center";
    trendBox.style.display = "block";
    trendBox.style.float = "left";

    trend.appendChild(trendBox);
  });

  trendDiv.appendChild(trend);
  trendDiv.appendChild(strongBuyText);
  trendDiv.id = "trendDiv";
  trendDiv.style.display = "inline-block";
  trendDiv.style.paddingTop = "5%";
  trendDiv.style.width = "600px";
  trendDiv.style.paddingLeft = "20%";
  trendDiv.style.fontSize = "20px";

  stockSummaryTabContent.appendChild(table);
  stockSummaryTabContent.appendChild(trendDiv);
  stockSummaryTabContent.appendChild(caption);
}

function displayNewsData(newsData) {
  const newsTable = document.createElement("table");
  newsTable.classList.add("news-table");

  newsData.forEach((newsItem) => {
    const newsRow = document.createElement("tr");

    const imgCell = document.createElement("td");
    imgCell.classList.add("news-image-cell");
    const img = document.createElement("img");
    img.src = newsItem.image;
    img.alt = newsItem.title;
    img.classList.add("news-image");
    img.style.width = "105px";
    img.style.height = "105px";
    imgCell.appendChild(img);
    newsRow.appendChild(imgCell);

    const textCell = document.createElement("td");
    textCell.classList.add("news-text-cell");

    const title = document.createElement("h3");
    title.textContent = newsItem.title;
    title.classList.add("news-title");
    title.style.margin = "0";
    textCell.appendChild(title);

    const date = document.createElement("p");
    const dateObject = new Date(newsItem.date * 1000);
    date.textContent = dateObject.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    date.classList.add("news-date");
    date.style.margin = "0";
    textCell.appendChild(date);

    const link = document.createElement("a");
    link.href = newsItem.link_to_post;
    link.textContent = "See Original Post";
    link.classList.add("news-link");
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.style.margin = "0";
    textCell.appendChild(link);

    newsRow.appendChild(textCell);

    newsTable.appendChild(newsRow);
  });

  const newsTabData = document.getElementById("newsTabData");
  newsTabData.innerHTML = "";
  newsTabData.appendChild(newsTable);
}

function highChartsClosePrice(data) {
  let today = new Date();
  let formattedDate = today.toISOString().substring(0, 10);
  const stockTickerSymbol = document
    .getElementById("searchText")
    .value.toUpperCase();
  if (typeof Highcharts !== "undefined") {
    Highcharts.stockChart("chartsTabData", {
      chart: {
        height: "560px",
      },
      subtitle: {
        text: '<a href="https://polygon.io/" target="_blank_">Source: Polygon.io</a>',
        useHTML: true,
      },
      rangeSelector: {
        buttons: [
          {
            type: "day",
            count: 7,
            text: "7d",
          },
          {
            type: "day",
            count: 15,
            text: "15d",
          },
          {
            type: "month",
            count: 1,
            text: "1m",
          },
          {
            type: "month",
            count: 3,
            text: "3m",
          },
          {
            type: "month",
            count: 6,
            text: "6m",
          },
        ],
        selected: 4,
        inputEnabled: false,
      },
      title: {
        text: `Stock Price ${stockTickerSymbol} ${formattedDate}`,
      },
      yAxis: [
        {
          title: {
            text: "Stock Price",
          },
          opposite: false,
        },
        {
          title: {
            text: "Volume",
          },
          opposite: true,
          min: 0,
          max: maxVolumeForCharts * 2,
        },
      ],
      series: [
        {
          name: `Stock Price`,
          data: data.closePriceData,
          type: "area",
          gapSize: 5,
          tooltip: {
            valueDecimals: 2,
          },
          fillColor: {
            linearGradient: {
              x1: 0,
              y1: 0,
              x2: 0,
              y2: 1,
            },
            stops: [
              [0, Highcharts.getOptions().colors[0]],
              [
                1,
                Highcharts.color(Highcharts.getOptions().colors[0])
                  .setOpacity(0)
                  .get("rgba"),
              ],
            ],
          },
          yAxis: 0,
          threshold: null,
        },
        {
          name: "Volume",
          type: "column",
          data: data.volumeData,
          yAxis: 1,
          color: "black",
          showInNavigator: false,
        },
      ],
      plotOptions: {
        column: {
          pointWidth: 5,
        },
      },
    });
  } else {
    //console.log("Highcharts is not loaded");
  }
}

function displayChartsData(chartsData) {
  const chartsTabData = document.getElementById("chartsTabData");
  chartsTabData.innerHTML = "";
  chartsTabData.style.paddingTop = "1%";
  highChartsClosePrice(chartsData);
}
