const company_tab_name = "Company";
const summary_tab_name = "Stock Summary";
const charts_tab_name = "Charts";
const news_tab_name = "Latest News";
let isDataRetrieved = false;
let modulatedStockSummaryData;
let modulatedChartsData;
let modulatedNewsData;
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
  i: "low_price",
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
}

async function getStockData() {
  document
    .getElementById("searchInput")
    .addEventListener("submit", function (ev) {
      ev.preventDefault();

      const stockTickerSymbol = document.getElementById("searchText").value;
      fetchStockInfo(stockTickerSymbol);
      fetchDataForTabs(stockTickerSymbol);
    });
}

async function fetchStockInfo(stockTickerSymbol) {
  try {
    const response = await fetch(
      `/stockInfo?stockTickerSymbol=${encodeURIComponent(stockTickerSymbol)}`
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();

    const modulatedData = modulateCompanyData(data);
    displayCompanyData(modulatedData);
    console.log(`data - ${JSON.stringify(data)}`);
    document.getElementById("resultData").style.display = "flex";
    document.getElementById("companyTabData").style.display = "flex";
    activateTab(0);
  } catch (error) {
    console.log("error in stockInfo - ", error);
  }
}

async function fetchDataForTabs(stockTickerSymbol) {
  const endpoints = {
    stockSummary: `/stockSummary?stockTickerSymbol=${encodeURIComponent(
      stockTickerSymbol
    )}`,
    stockrecommendationTrends: `/stockrecommendationTrends?stockTickerSymbol=${encodeURIComponent(
      stockTickerSymbol
    )}`,
    companyNews: `/companyNews?stockTickerSymbol=${encodeURIComponent(
      stockTickerSymbol
    )}`,
    highCharts: `/highCharts?stockTickerSymbol=${encodeURIComponent(
      stockTickerSymbol.toUpperCase()
    )}`,
  };

  try {
    const promises = Object.entries(endpoints).map(
      ([apiName, apiEndpoint]) =>
        fetch(apiEndpoint)
          .then((response) => response.json())
          .then((data) => ({ apiName, data })) // Ensure the promise resolves to an object with apiName and data
    );

    const dataForAllTabs = await Promise.all(promises);

    dataForAllTabs.forEach(({ apiName, data }) => {
      const dataModulationFunction = dataModulationFunctionMap[apiName];
      const resultForEveryTab =
        dataModulationFunction && dataModulationFunction(data);
      let dataObject = dataObjectMap[apiName];
      dataObject = resultForEveryTab;
      let displayFunction = displayDataFunctionMap[apiName];
      displayFunction && displayFunction(dataObject);
      console.log(
        `apiName - ${apiName}, apiResult - ${JSON.stringify(dataObject)}`
      );
    });
  } catch (error) {
    console.log(`error in fetchDataForAllTabs - ${error}`);
  }
}

function modulateCompanyData(response) {
  let company_data = {};
  for (attribute in response) {
    if (attribute in attribute_mapping_company) {
      company_data[attribute_mapping_company[attribute]] = response[attribute];
    }
  }
  console.log(company_data);
  return company_data;
}

function modulateStockSummary(response) {
  //todo: use ticker from company data
  let stock_summary = {};
  for (attribute in response) {
    if (attribute in attribute_mapping_stock_summary) {
      stock_summary[attribute_mapping_stock_summary[attribute]] =
        response[attribute];
    }
  }
  console.log(stock_summary);
  return stock_summary;
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

  // Collect up to 5 valid news items
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

  // Map the attributes for each valid news item
  for (let item of validNewsItems) {
    let news = {};
    for (let attribute in item) {
      if (attribute in attribute_mapping_news) {
        news[attribute_mapping_news[attribute]] = item[attribute];
      }
    }
    mappedNewsItems.push(news);
  }

  console.log(mappedNewsItems);
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
    let volumeItem = [
      item["t"], // Date
      item["v"], // Volume
    ];
    volumeData.push(volumeItem);
  }

  return (modulatedHighChartsData = {
    closePriceData: closePriceData,
    volumeData: volumeData,
  });
}

function clearSearchInput() {
  document.getElementById("searchText").value = "";
  clearActiveTabsAndHideContent();
  isDataRetrieved = false;
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
      //   tab.CDATA_SECTION_NODE.
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

// function displayCompanyData(data) {

// }

function displayCompanyData(companyData) {
  // Define the order of the keys as they should appear in the table
  const orderOfKeys = [
    "company_logo",
    "company_name",
    "stock_ticker_symbol",
    "stock_exchange_code",
    "company_start_date",
    "category",
  ];

  // Create a table element
  const table = document.createElement("table");
  table.classList.add("company-data-table"); // Add your CSS class for styling

  // Iterate over the orderOfKeys array to maintain the order of content
  orderOfKeys.forEach((key) => {
    const row = table.insertRow();
    const keyCell = document.createElement("th");
    const valueCell = document.createElement("td");

    // Set the text content for keyCell based on the mapping
    keyCell.textContent = key
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" "); // Convert snake_case to Title Case

    // Check if it's the logo to create an image element instead
    if (key === "company_logo" && companyData[key]) {
      const img = document.createElement("img");
      img.src = companyData[key];
      img.alt = "Company Logo";
      // You may want to add styling or classes to size the image appropriately
      valueCell.appendChild(img);
    } else {
      valueCell.textContent = companyData[key];
    }

    row.appendChild(keyCell);
    row.appendChild(valueCell);
  });

  // Append the table to the "companyTabData" div
  const companyTabContent = document.getElementById("companyTabData");
  companyTabContent.innerHTML = ""; // Clear any existing content
  companyTabContent.appendChild(table);
}

function displayStockSummaryData(stockSummaryData) {
  const stockTickerSymbol = document
    .getElementById("searchText")
    .value.toUpperCase();
  // the order of the keys as they should appear in the table
  const orderOfKeys = [
    "trading_day",
    "previous_closing_price",
    "opening_price",
    "high_price",
    "low_price",
    "change",
    "change_percent",
  ];

  const table = document.createElement("table");
  table.classList.add("stockSummary-data-table");

  // maintain the order of content
  orderOfKeys.forEach((key) => {
    const row = table.insertRow();
    const keyCell = document.createElement("th");
    const valueCell = document.createElement("td");

    keyCell.textContent = key
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" "); // Convert snake_case to Title Case

    valueCell.textContent = stockSummaryData[key];

    row.appendChild(keyCell);
    row.appendChild(valueCell);
  });

  // Append the table to the "companyTabData" div
  const stockSummaryTabContent = document.getElementById("stockSummaryTabData");
  stockSummaryTabContent.innerHTML = "";
  stockSummaryTabContent.appendChild(table);
}

function displayNewsData(newsData) {
  const newsTable = document.createElement("table");
  newsTable.classList.add("news-table");

  // Iterate over the newsData array
  newsData.forEach((newsItem) => {
    const newsRow = document.createElement("tr"); // Table row for each news item

    // Create the image element in its own table cell
    const imgCell = document.createElement("td");
    imgCell.classList.add("news-image-cell");
    const img = document.createElement("img");
    img.src = newsItem.image;
    img.alt = newsItem.title;
    img.classList.add("news-image");
    imgCell.appendChild(img);
    newsRow.appendChild(imgCell); // Append image cell to the row

    // Create a cell for the text content
    const textCell = document.createElement("td");
    textCell.classList.add("news-text-cell");

    // Create the title element
    const title = document.createElement("h3");
    title.textContent = newsItem.title;
    title.classList.add("news-title");
    textCell.appendChild(title);

    // Create the date element
    const date = document.createElement("p");
    const dateObject = new Date(newsItem.date * 1000); // assuming the date is a timestamp
    date.textContent = dateObject.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    date.classList.add("news-date");
    textCell.appendChild(date);

    // Create the link element
    const link = document.createElement("a");
    link.href = newsItem.link_to_post;
    link.textContent = "See Original Post";
    link.classList.add("news-link");
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    textCell.appendChild(link);

    // Append text cell to the row
    newsRow.appendChild(textCell);

    // Append the newsRow to the newsTable
    newsTable.appendChild(newsRow);
  });

  const newsTabData = document.getElementById("newsTabData");
  newsTabData.innerHTML = ""; // Clear existing content
  newsTabData.appendChild(newsTable);
}

function highChartsClosePrice(data) {
  const stockTickerSymbol = document
    .getElementById("searchText")
    .value.toUpperCase();
  if (typeof HighCharts !== undefined) {
    return Highcharts.stockChart("chartsTabData", {
      rangeSelector: {
        selected: 1,
      },

      title: {
        text: `${stockTickerSymbol} Stock Price`,
      },

      navigator: {
        series: {
          accessibility: {
            exposeAsGroupOnly: true,
          },
        },
      },

      series: [
        {
          name: `${stockTickerSymbol} Stock Price`,
          data: data.closePriceData,
          type: "area",
          threshold: null,
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
        },
      ],
    });
  } else {
    console.log("high chart not loaded");
  }
}

function displayChartsData(chartsData) {
  const chartsTabData = document.getElementById("chartsTabData");
  chartsTabData.innerHTML = "";
  chartsTabData.appendChild(highChartsClosePrice(chartsData));
}
