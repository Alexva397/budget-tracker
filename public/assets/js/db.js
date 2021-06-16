let db;
let budgetVersion;

const request = indexedDB.open("budgetDB", budgetVersion || 2);

request.onupgradeneeded = function (event) {
    console.log("Upgrade needed in IndexDB");
  
    const { oldVersion } = event;
    const newVersion = event.newVersion || db.version;
  
    console.log(`DB Updated from version ${oldVersion} to ${newVersion}`);
  
    db = event.target.result;
  
    if (db.objectStoreNames.length === 0) {
        db.createObjectStore("BudgetStore", { autoIncrement: true });
    }
};

request.onerror = function (event) {
    console.log(`Woops! ${event.target.errorCode}`);
  };

function checkDatabase() {
console.log("check db invoked");

    let transaction = db.transaction(["BudgetStore"], "readwrite");

    const store = transaction.objectStore("BudgetStore");

    const getAll = store.getAll();

getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
    fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
        },
    })
        .then((response) => response.json())
        .then((res) => {
        if (res.length !== 0) {
            transaction = db.transaction(["BudgetStore"], "readwrite");

            const currentStore = transaction.objectStore("BudgetStore");

            currentStore.clear();
            console.log("Clearing store 🧹");
        }
        });
    }
};
}

request.onsuccess = function (event) {
    console.log("success");
    db = event.target.result;

    if (navigator.onLine) {
        console.log("Backend online! 🗄️");
        checkDatabase();
    }
};

const saveRecord = (record) => {
    console.log("Save record invoked");
    const transaction = db.transaction(["BudgetStore"], "readwrite");

    const store = transaction.objectStore("BudgetStore");

    store.add(record);
};

window.addEventListener("online", checkDatabase);