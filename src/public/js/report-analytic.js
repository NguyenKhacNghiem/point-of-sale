// Khi trang load lần đầu thì tương đương với option "Mặc định" -> get hết
fetch("/report-analytic", {
    method: "post"
})
.then(response => response.json())
.then(json => {
    handleResult(json);
})

let generalTimeline = document.getElementById("generalTimeline");
let fromTimeLine = document.getElementById("fromTimeLine");
let toTimeLine = document.getElementById("toTimeLine");

function getByGeneralTimeLine() {
    let currentDate = new Date();
    let value = generalTimeline.value;

    if (value === "Mặc định") {
        fetch("/report-analytic", {
            method: "post"
        })
        .then(response => response.json())
        .then(json => {
            handleResult(json);
            return;
        })
    }
        
    if (value === "Hôm nay") {
        fetch("/report-analytic", {
            method: "post",
            body: new URLSearchParams({
                generalTimeline: getTimeLine(currentDate)
            })
        })
        .then(response => response.json())
        .then(json => {
            handleResult(json);
            return;
        })
    }

    if (value === "Hôm qua") {
        let yesterday = new Date(currentDate);
        yesterday.setDate(yesterday.getDate() - 1);

        fetch("/report-analytic", {
            method: "post",
            body: new URLSearchParams({
                generalTimeline: getTimeLine(yesterday)
            })
        })
        .then(response => response.json())
        .then(json => {
            handleResult(json);
            return;
        })
    }

    if (value === "7 ngày trước") {
        let oneWeekAgo = new Date(currentDate);
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        fetch("/report-analytic", {
            method: "post",
            body: new URLSearchParams({
                fromTimeLine: getTimeLine(oneWeekAgo),
                toTimeLine: getTimeLine(currentDate)
            })
        })
        .then(response => response.json())
        .then(json => {
            handleResult(json);
            return;
        })
    }
    
    if (value === "Tháng này") {
        let month = currentDate.getMonth() + 1; 
        let year = currentDate.getFullYear();

        fetch("/report-analytic", {
            method: "post",
            body: new URLSearchParams({
                fromTimeLine: "01/" + padNumber(month) + '/' + year,
                toTimeLine: getTimeLine(currentDate)
            })
        })
        .then(response => response.json())
        .then(json => {
            handleResult(json);
            return;
        })
    }
}

function getBySpecificTimeLine() {
    let from = fromTimeLine.value;
    let to = toTimeLine.value;

    if(from === "" || to === "")
        return toastr.error("Vui lòng chọn đầy đủ 2 khoảng thời gian", "Thông báo")

    fetch("/report-analytic", {
        method: "post",
        body: new URLSearchParams({
            fromTimeLine: convertDateFormat(from),
            toTimeLine: convertDateFormat(to),
        })
    })
    .then(response => response.json())
    .then(json => {
        console.log(json)
        handleResult(json);
    })
}

// Tổng số lượng đơn hàng
function getAmountOfOrder(orders) {
    let amountOfOrder = document.getElementById("amountOfOrder");
    amountOfOrder.innerHTML = orders.length;
}

// Tổng số sản phẩm bán ra
function getAmountOfProduct(orders) {
    let amountOfProduct = document.getElementById("amountOfProduct");
    let amount = 0;

    orders.forEach(o => {
        amount += o.totalAmount;
    })

    amountOfProduct.innerHTML = amount;
}

// Tổng doanh thu
function getRevenue(orders) {
    let revenue = document.getElementById("revenue");
    let totalPrice = 0;

    orders.forEach(o => {
        totalPrice += o.totalPrice;
    })

    revenue.innerHTML = formatPrice(totalPrice) + "đ";
}

function handleResult(json) {
    let tbody = document.getElementById("tbody");
    let trs = "";

    json.orders.forEach(o => {
        trs += `
                <tr>
                    <td>${o.orderId}</td>
                    <td>${o.customerPhone}</td>
                    <td>${formatPrice(o.totalPrice)}đ</td>
                    <td>${formatPrice(o.priceGivenByCustomer)}đ</td>
                    <td>${formatPrice(o.excessPrice)}đ</td>
                    <td>${o.dateOfPurchase}</td>
                    <td>${o.totalAmount}</td>
                    <td>
                        <a href="/detail-order/${o.orderId}" class="btn btn-secondary" style="text-decoration: none; color: white;">
                            <i class="fa-solid fa-circle-info"></i>
                        </a>
                    </td>
                </tr>
                `;
    })

    tbody.innerHTML = trs;

    getAmountOfOrder(json.orders);
    getAmountOfProduct(json.orders);
    getRevenue(json.orders);
}

function formatPrice(price) {
    return price.toLocaleString('vi-VN'); 
}

function getTimeLine(dateObject) {
    let day = dateObject.getDate();
    let month = dateObject.getMonth() + 1; 
    let year = dateObject.getFullYear();

    return padNumber(day) + '/' + padNumber(month) + '/' + year;
}

function convertDateFormat(inputDate) {
    let date = new Date(inputDate);
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    let formattedDate = padNumber(day) + '/' + padNumber(month) + '/' + year;

    return formattedDate;
}

function padNumber(number) {
    return (number < 10 ? '0' : '') + number;
}

toastr.options = {
    "closeButton": true,
    "debug": false,
    "newestOnTop": true,
    "progressBar": true,
    "positionClass": "toast-top-right",
    "preventDuplicates": false,
    "onclick": null,
    "showDuration": "1000",
    "hideDuration": "500",
    "timeOut": "5000",
    "extendedTimeOut": "1000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
}