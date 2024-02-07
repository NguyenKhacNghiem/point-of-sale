let currentURL = window.location.href;
let url = new URL(currentURL);
let phone = url.pathname.split('/').pop();

let title = document.getElementById("title");
title.innerHTML = `Danh sách đơn hàng của khách hàng <u>${phone}</u>`;