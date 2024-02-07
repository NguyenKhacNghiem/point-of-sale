let deletedBarcode;
let updatedImage;

$(".custom-file-input").on("change", function () {
    let fileName = $(this).val().split("\\").pop();
    $(this).siblings(".custom-file-label").addClass("selected").html(fileName);
});

function convertDateFormat(inputDate) {
    var parts = inputDate.split('/');
    if (parts.length === 3) {
        return parts[2] + '-' + parts[1] + '-' + parts[0];
    } else {
        return inputDate;
    }
}

function confirmUpdateProduct(image, barcode, productName, category, importPrice, retailPrice, creationDate) {
    $("#updatedImage").siblings(".custom-file-label").addClass("selected").html(image);
    $('#updatedBarcode').val(barcode);
    $('#updatedProductName').val(productName);
    $('#updatedCategory').val(category);
    $('#updatedImportPrice').val(importPrice);
    $('#updatedRetailPrice').val(retailPrice);
    // Chuyển creationDate sang yyyy-mm-dd
    $('#updatedCreationDate').val(convertDateFormat(creationDate));
    $("#modalUpdate").modal("show");
}

function updateProduct() {
    const formData = new FormData();
    const imageFile = document.getElementById('updatedImage').files[0];

    formData.append('image', imageFile);
    formData.append('barcode', document.getElementById('updatedBarcode').value);
    formData.append('productName', document.getElementById('updatedProductName').value);
    formData.append('category', document.getElementById('updatedCategory').value);
    formData.append('importPrice', document.getElementById('updatedImportPrice').value);
    formData.append('retailPrice', document.getElementById('updatedRetailPrice').value);
    formData.append('creationDate', document.getElementById('updatedCreationDate').value);

    fetch('/edit-product', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (response.ok) {
            window.location.reload();
        } else {
            alert('Có lỗi xảy ra khi cập nhật sản phẩm.');
        }
    })
    .catch(error => {
        alert('Có lỗi xảy ra khi cập nhật sản phẩm.', error);
    });
}

function confirmDeleteProduct(barcode) {
    $("#modalDelete").modal("show");

    deletedBarcode = barcode;
}

function deleteProduct() {
    fetch("/delete-product", {
        method: "post",
        body: new URLSearchParams  
        (                             
           {  			  
            'barcode': deletedBarcode
           }
        )
    })
    .then(response => {
        if (response.ok) 
            window.location.reload();
        else 
            alert('Xóa sản phẩm không thành công.');
    })
    .catch(error => {
        alert('Lỗi trong quá trình xóa sản phẩm:', error);
    });
}

// Khi nhấn vào nút chi tiết sản phẩm, thông tin sản phẩm sẽ được lấy và hiển thị tự động
function detailProduct(image, barcode, productName, category, importPrice, retailPrice, creationDate) {
    $("#modalDetailProductTitle").html('Thông tin sản phẩm ' + productName);

    $("#modalDetailProductImage").attr('src', '/uploads/products/' + image);
    $("#modalDetailProductBarcode").html('<b>BARCODE: </b>' + barcode);
    $("#modalDetailProductName").html('<b>Tên sản phẩm: </b>' + productName);
    $("#modalDetailProductCategory").html('<b>Danh mục: </b>' + category);
    $("#modalDetailProductImportPrice").html('<b>Giá nhập: </b>' + importPrice);
    $("#modalDetailProductRetailPrice").html('<b>Giá bán: </b>' + retailPrice);
    $("#modalDetailProductCreationDate").html('<b>Ngày tạo: </b>' + creationDate);

    $("#modalDetail").modal("show");
}