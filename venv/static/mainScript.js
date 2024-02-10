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

const attribute_mapping_charts = {
  t: "date",
  c: "stock_price",
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

document.querySelectorAll(".tabButton").forEach((tab) => {
  tab.addEventListener("click", () => activateTab(tab));
});

//document.getElementById("searchInput").addEventListener("submit", getStockData);

async function getStockData() {
  //   document.addEventListener("DOMContentLoaded", () => {
  //     deactivateAllTabs();
  //   });

  // Remove 'active' class from all tabs
  //   document.querySelectorAll("#tabsList .tabButton").forEach((tab) => {
  //     tab.classList.remove("active");
  //   });

  // Add 'active' class to the clicked tab and display the content
  //   tab.classList.add("active");
  //   document.getElementById(targetContentId).style.display = "block";
  document
    .getElementById("searchInput")
    .addEventListener("submit", function (ev) {
      ev.preventDefault();

      const stockTickerSymbol = document.getElementById("searchText").value;
      // let resultDiv = document.getElementById('resultData');
      // resultDiv.innerHTML = '';

      // const tabsDiv = document.createElement('div');
      // tabsDiv.id = 'tabs';

      // const tabHeaders = ['Company', 'StockSummary', 'Charts', 'Latest News'];
      // tabHeaders.forEach(tabHeader => {
      //     const tabHeaderButton = document.createElement('button');
      //     tabHeaderButton.className = 'tab';
      //     //tabHeaderButton.onclick =
      //     tabHeaderButton.content = tabHeader;
      //     tabsDiv.appendChild(tabHeaderButton);
      // });

      // tabHeaders.forEach(tabHeader => {
      //     const tabData = document.createElement('div');
      //     tabData.id = tabHeader.replace(/\s/g, '');
      //     tabData.className = 'tab-data';
      //     tabsDiv.appendChild(tabData);
      // })

      // resultDiv.appendChild(tabsDiv);
      fetchStockInfo(stockTickerSymbol);
      fetchDataForTabs(stockTickerSymbol);

      // if (!isDataRetrieved && stockTickerSymbol ) {
      //     document.getElementById('resultData').innerHTML = '';
      //     fetch(`/stockInfo?stockTickerSymbol=${encodeURIComponent(stockTickerSymbol)}`)
      //         .then((response) => response.json())  // Return the promise
      //         .then((data) => {
      //             console.log(data);
      //             const displayContainer = document.getElementById('resultData');

      //             const stockDataTabs = document.createElement('div');
      //             stockDataTabs.id = 'stockDataTabs';

      //             const stockDataTabNames = [company_tab_name, summary_tab_name, charts_tab_name, news_tab_name];
      //             stockDataTabNames.forEach((stockDataTabName, index) => {
      //                 const tabElement = document.createElement('div');
      //                 tabElement.textContent = stockDataTabName;
      //                 tabElement.className = 'stockDataTab';
      //                 tabElement.addEventListener('click', () => {
      //                     loadContentForTab(index, data);

      //                     stockDataTabs.appendChild(tabElement);
      //                 })
      //             })

      //             // displayContainer.innerHTML = `<p>${JSON.stringify(data)}<p>`;
      //             console.log(modulateCompanyData(data))
      //             let tableContainer = '<table>'
      //             const companyData = modulateCompanyData(data)
      //             for(let key in companyData) {
      //                 tableContainer += '<tr>';
      //                 tableContainer += `<td>${key}</td>`;
      //                 tableContainer += `<td>${companyData[key]}</td>`;
      //                 tableContainer += '</tr>';

      //                 // const tr = tableContainer.insertRow();
      //                 // const tdKey = tr.insertCell();
      //                 // const tdValue = tr.insertCell();
      //                 // tdKey.textContent = key;
      //                 // tdValue.textContent = companyData[key];
      //             }
      //             tableContainer += '</table>';
      //             console.log(tableContainer);
      //             displayContainer.innerHTML = tableContainer;

      //             // displayContainer.innerHTML = `<p>company data - ${JSON.stringify(modulateCompanyData(data))} </p> <br>
      //             // <p>stock summary - ${JSON.stringify(modulateStockSummary(data))}</p> <br>
      //             // <p>news - ${JSON.stringify(modulateNews(data))}</p> <br>
      //             // <p>charts - ${JSON.stringify(modulateCharts(data))}</p> <br>`
      //             isDataRetrieved = true;
      //         }).catch((error) => {
      //             console.error('Error in flask API: ', error);
      //             document.getElementById("resultData").innerText = `Error fetching stock details: ${error}`;

      //         })
      // }
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
    const data = await response.json(); // Make sure to return the result of response.json()

    const modulatedData = modulateCompanyData(data);
    displayCompanyData(modulatedData);
    // Now 'data' should be defined, and you can use it as needed
    const firstTabContent = document.getElementById("companyTabData");
    console.log(`data - ${JSON.stringify(data)}`);
    // firstTabContent.innerHTML = `<p>${JSON.stringify(finalTable)}</p>`; // Adjust as needed to display your data
    document.getElementById("resultData").style.display = "flex";
    document.getElementById("companyTabData").style.display = "flex";
    // document.getElementById("stockSummaryTabData").style.display = "flex";
    // document.getElementById("chartsTabData").style.display = "flex";
    // document.getElementById("newsTabData").style.display = "flex";
    activateTab(0); // Assuming you have an activateTab function to set the active tab
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
      stockTickerSymbol
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

    console.log(`dataForAllTabs - ${JSON.stringify(dataForAllTabs)}`);
    dataForAllTabs.forEach(({ apiName, data }) => {
      const dataModulationFunction = dataModulationFunctionMap[apiName];
      const resultForEveryTab =
        dataModulationFunction && dataModulationFunction(data);
      let dataObject = dataObjectMap[apiName];
      dataObject = resultForEveryTab;
      let displayFunction = displayDataFunctionMap[apiName];
      displayFunction && displayFunction(dataObject);
      activateTab(
        document.querySelector('.tabButton[data-tab-target="companyTabData"]')
      );
      console.log(
        `apiName - ${apiName}, apiResult - ${JSON.stringify(dataObject)}`
      );
    });
  } catch (error) {
    console.log(`error in fetchDataForAllTabs - ${error}`);
  }
}

function displayNews(response) {
  let news_links = {};
  for (attribute in response) {
    if (attribute in attribute_mapping_news) {
      news_links[attribute_mapping_news[attribute]] = response[attribute];
    }
  }
  console.log(news_links);
  return news_links;
}

function modulateCharts(response) {
  let chart_data = {};
  for (attribute in response) {
    if (attribute in attribute_mapping_charts) {
      chart_data[attribute_mapping_charts[attribute]] = response[attribute];
    }
  }
  console.log(chart_data);
  return chart_data;
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

function modulateNews() {}

function modulateCharts() {}

function clearSearchInput() {
  // let searchText =  document.getElementById('searchText').value;
  // searchText = searchText && '';

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
      tab.classList.remove("active");
      let tabDataId = tab.getAttribute("data-tab-target");
      document.getElementById(tabDataId).style.display = "none";
    }
  });
}

function activateTab(tabElement) {
  // Clear all active states and hide content
  clearActiveTabsAndHideContent();

  // Add 'active' class to the clicked tab
  tabElement.classList.add("active");

  // Get the corresponding content ID and display it
  const tabDataId = tabElement.getAttribute("data-tab-target");
  const tabContent = document.getElementById(tabDataId);
  if (tabContent) {
    tabContent.style.display = "block";
  }
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
  // Define the order of the keys as they should appear in the table
  const orderOfKeys = [
    "trading_day",
    "previous_closing_price",
    "opening_price",
    "high_price",
    "low_price",
    "change",
    "change_percent",
  ];

  // Create a table element
  const table = document.createElement("table");
  table.classList.add("stockSummary-data-table"); // Add your CSS class for styling

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
    //   if (key === "company_logo" && companyData[key]) {
    //     const img = document.createElement("img");
    //     img.src = companyData[key];
    //     img.alt = "Company Logo";
    //     // You may want to add styling or classes to size the image appropriately
    //     valueCell.appendChild(img);
    //   } else {
    valueCell.textContent = stockSummaryData[key];
    //   }

    row.appendChild(keyCell);
    row.appendChild(valueCell);
  });

  // Append the table to the "companyTabData" div
  const stockSummaryTabContent = document.getElementById("stockSummaryTabData");
  stockSummaryTabContent.innerHTML = ""; // Clear any existing content
  stockSummaryTabContent.appendChild(table);
}

function displayNewsData() {}

function displayChartsData() {}
