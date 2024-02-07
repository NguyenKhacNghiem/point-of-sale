let phone = document.getElementById("phone");
let fullname = document.getElementById("fullname");
let address = document.getElementById("address");

async function getCustomerInfo() {
    phone.value = phone.value.replace(/\D/g, '');

    if (phone.value.length === 10) {
        try {
            const response = await fetch("/customer/" + phone.value);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const json = await response.json();
            fullname.value = json.fullname;
            address.value = json.address;
        } catch (error) {
            console.error('Error:', error);
        }
    } else {
        fullname.value = "";
        address.value = "";
    }
}

function checkout() {
    if (phone === "" || fullname.value === "Không tìm thấy khách hàng" || address.value === "Không tìm thấy khách hàng" || fullname.value === "Không tìm thấy khách hàng" || address.value === "") {
        alert("Thông tin hóa đơn không hợp lệ!");
    }
}

var totalAmount = 0;

$(document).ready(function () {
    $('#mySearch').on('input', function () {
        var keyword = $(this).val();

        $.ajax({
            type: 'POST',
            url: '/search-product',
            data: { keyword: keyword },
            success: function (data) {
                displaySearchResults(data);
            },
            error: function (error) {
                console.error('Error searching product:', error);
            }
        });
    });
});

function displaySearchResults(results) {
    var searchResultsDiv = $('#searchResults');
    searchResultsDiv.empty();

    if (results.length > 0) {
        results.forEach(function (product) {
            var listItem = $('<button type="button" class="btn btn-secondary dropdown-item"></button>');

            var productInfo = $('<div></div>').addClass('product-info');

            var imageContainer = $('<div></div>').addClass('image-container');
            imageContainer.append('<img src="/uploads/products/' + product.image + '" alt="' + product.productName + '" class="product-image">');
            productInfo.append(imageContainer);

            var infoContainer = $('<div class="info-container"></div>');
            infoContainer.append('<p><strong>Barcode:</strong> ' + product.barcode + '</p>');
            infoContainer.append('<p><strong>Tên sản phẩm:</strong> ' + product.productName + '</p>');
            infoContainer.append('<p><strong>Đơn giá bán:</strong> ' + formatPrice(product.retailPrice) + "đ" + '</p>');
            productInfo.append(infoContainer);

            listItem.append(productInfo);

            listItem.click(function () {
                addProductToTable(product);
                $('#mySearch').val('');
                searchResultsDiv.hide();
            });

            searchResultsDiv.append(listItem);
        });

        searchResultsDiv.show();
    } else {
        searchResultsDiv.hide();
    }
}

$(document).on('click', function (e) {
    if (!$(e.target).closest('#searchResults').length && !$(e.target).closest('#mySearch').length) {
        $('#searchResults').hide();
    }
});

function addProduct() {
    var barcodeOrName = $('#mySearch').val();

    $.ajax({
        type: 'POST',
        url: '/search-product',
        data: { barcode: barcodeOrName },
        success: function (data) {
            if (data.length > 0) {
                var product = data[0];
                addProductToTable(product);
                $('#mySearch').val('');
            } else {
                console.log('Product not found');
            }
        },
        error: function (error) {
            console.error('Error adding product:', error);
        }
    });
}

function addProductToTable(product) {
    var barcode = product.barcode;
    var existingRow = $('#productTableBody').find('td:first-child:contains(' + barcode + ')').closest('tr');

    if (existingRow.length > 0) {
        var inputField = existingRow.find('input[type="number"]');
        var newQuantity = parseInt(inputField.val()) + 1;
        inputField.val(newQuantity);
        updateProductTable(inputField);
    } else {
        var newRow = $('<tr class="table-success"></tr>');
        newRow.append('<td>' + barcode + '</td>');
        newRow.append('<td><img src="/uploads/products/' + product.image + '"></td>');
        newRow.append('<td>' + product.productName + '</td>');
        newRow.append('<td><input type="number" min="1" value="1" oninput="updateProductTable(this)"; onchange="updateTotalAmount()" onkeydown="preventNegativeInput(event)"></td>');
        newRow.append('<td class="priceRow">' + product.retailPrice + '</td>');
        newRow.append('<td class="totalPriceRow">'  + product.retailPrice + '</td>');
        newRow.append('<td><button type="button" onclick="confirmDeleteProduct(this)" class="btn btn-danger"><i class="fas fa-trash"></i></button></td>');

        $('#productTableBody').append(newRow);
    }

    totalAmount += parseFloat(product.retailPrice);
    updateTotalAmount();

    displaySearchResults([]);
}

function confirmDeleteProduct(button) {
    deleteProduct(button);
}

function deleteProduct(button) {
    var row = $(button).closest('tr');
    var price = parseFloat(row.find('td:eq(5)').text());
    
    totalAmount -= price;
    updateTotalAmount();

    row.remove();
    updateProductTable();
}

function updateProductTable(input) {
    var row = $(input).closest('tr');
    var quantity = parseInt($(input).val());
    var retailPrice = parseFloat(row.find('td:eq(4)').text());
    var total = quantity * retailPrice;
    row.find('td:eq(5)').text(total);

    updateTotalAmount();
}

function preventNegativeInput(event) {
    if (event.key === '-' || event.key === 'e') {
        event.preventDefault();
    }
}

function updateTotalAmount() {
    var totalAmount = 0;
    var totalQuantity = 0;

    $('#productTableBody tr').each(function () {
        var quantity = parseInt($(this).find('td:eq(3) input').val()) || 0;
        var totalForRow = parseFloat($(this).find('td:eq(5)').text()) || 0;

        if (!isNaN(totalForRow)) {
            totalAmount += totalForRow;
            totalQuantity += quantity;
        }
    });

    $('p#totalAmount').html('<b>Tổng tiền: </b>' + formatPrice(totalAmount) + "đ");

    $('#totalAmountInput').val(totalAmount);

    $('#totalQuantityInput').val(totalQuantity);

    var productTable = [];
    $('#productTableBody tr').each(function () {
        var barcode = $(this).find('td:eq(0)').text();
        var productName = $(this).find('td:eq(2)').text();
        var quantity = parseInt($(this).find('td:eq(3) input').val()) || 0;
        var retailPrice = parseFloat($(this).find('td:eq(4)').text()) || 0;
        var total = parseFloat($(this).find('td:eq(5)').text()) || 0;

        if (!isNaN(total)) {
            productTable.push({
                barcode: barcode,
                productName: productName,
                quantity: quantity,
                retailPrice: retailPrice,
                total: total
            });
        }
    });

    $('#productTable').val(JSON.stringify(productTable));
}

function formatPrice(price) {
    return price.toLocaleString('vi-VN'); 
}