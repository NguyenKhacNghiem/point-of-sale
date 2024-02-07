let phone = document.getElementById("phone");
let fullname = document.getElementById("fullname");
let address = document.getElementById("address");

function getCustomerInfo() {
    phone.value = phone.value.replace(/\D/g, '');

    if (phone.value.length === 10) {
        fetch("/customer/" + phone.value)
            .then(response => response.json())
            .then(json => {
                fullname.innerText = json.fullname;
                address.innerText = json.address;
            })
    }
    else {
        fullname.innerText = "";
        address.innerText = "";
    }
}

let priceGivenByCustomer = document.getElementById("priceGivenByCustomer");
let totalPrice = document.getElementById("totalPrice").innerText.replace(/[^\d]/g, ""); // xóa "." và "đ" trong tổng hóa đơn
let excessPrice = document.getElementById("excessPrice");
let orderId = document.getElementById("orderId");

function calculateExcessPrice() {
    priceGivenByCustomer.value = priceGivenByCustomer.value.replace(/\D/g, '');

    if (priceGivenByCustomer.value === "")
        excessPrice.innerText = "";
    else
        excessPrice.innerText = (parseInt(priceGivenByCustomer.value) - parseInt(totalPrice)).toLocaleString("vi-VN") + "đ";
}

function printInvoice() {
    if (fullname.innerText === "" || address.innerText === "" ||
        fullname.innerText === "Không tìm thấy khách hàng" || address.innerText === "Không tìm thấy khách hàng" ||
        excessPrice.innerText === "" || parseInt(excessPrice.innerText.replace(/[^\d-]/g, '')) < 0)
        return alert("Thông tin hóa đơn không hợp lệ!");

    // Cập nhật 2 thuộc tính của Order: priceGivenByCustomer và excessPrice
    fetch("/payment-history", {
        method: "put",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            orderId: orderId.innerText,
            priceGivenByCustomer: priceGivenByCustomer.value - 0,
            excessPrice: parseInt(excessPrice.innerText.replace(/[^\d-]/g, ''))
        })
    })
    .then(response => response.json())
    .then(json => {
        if(json.code === 1) 
            return alert(json.error);
        
        // Ẩn button in hóa đơn
        let printInvoice = document.getElementById("printInvoice");
        printInvoice.style.display = "none"

        html2pdf(document.body, {
            // Tên file pdf sẽ là mã hóa đơn
            filename: `${orderId.innerText}.pdf`,
        })

        setTimeout(() => {
            // Hiện lại button in hóa đơn
            printInvoice.style.display = ""
            alert(json.success);
            window.location.href = "/product-payment";
        }, 1000)
    })
}