let currentURL = window.location.href;
let url = new URL(currentURL);
let orderId = url.pathname.split('/').pop();

let title = document.getElementById("title");
title.innerHTML = `Chi tiết đơn hàng <u>${orderId}</u>`;