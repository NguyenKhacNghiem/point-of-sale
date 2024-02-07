// Khi nhấn vào xem chi tiết sản phẩm, thông tin sản phẩm sẽ được lấy và hiển thị tự động
function detailProduct(item) {
    let image = item.children[0].src;
    let productName = item.children[1].innerHTML;
    let retailPrice = item.children[2].innerHTML;
    let barcode = item.children[3].innerHTML;
    let category = item.children[4].innerHTML;
    let creationDate = item.children[5].innerHTML;

    $("#modalDetailProductTitle").html('Thông tin sản phẩm ' + productName);
    $("#modalDetailProductImage").attr('src', image);
    $("#modalDetailProductBarcode").html('<b>BARCODE: </b>' + barcode);
    $("#modalDetailProductName").html('<b>Tên sản phẩm: </b>' + productName);
    $("#modalDetailProductCategory").html('<b>Danh mục: </b>' + category);
    $("#modalDetailProductRetailPrice").html('<b>Giá bán: </b>' + retailPrice);
    $("#modalDetailProductCreationDate").html('<b>Ngày tạo: </b>' + creationDate);

    $("#modalDetail").modal("show");
}