function lockUser(email) {
    fetch("/lock-user", {
        method: "put",
        body: JSON.stringify({
            email: email
        }),
        headers: {
            'Content-type': "application/json"
        }
    })
    .then(() => location.reload())
}

function resendEmail(email) {
    fetch("/resend-email", {
        method: "post",
        body: new URLSearchParams({
            'email': email
        })
    })
    .then(() => toastr.success("Gửi email thành công", "Thông báo"))
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