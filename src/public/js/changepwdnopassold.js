let newPassword = document.getElementById("newPassword")
let confirmPassword = document.getElementById("confirmPassword")
let error = document.getElementById("error")
let success = document.getElementById("success")

function changePwdNoPassOld() {
    let body = {
        newPassword: newPassword.value,
        confirmPassword: confirmPassword.value
    }

    fetch("/changepwd_logout", {
        method: "PUT",
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(json => handleChangePassword(json))
}

function handleChangePassword(json) {
    if(json.success.length !== 0) { // đổi mật khẩu thành công
        success.classList.remove("d-none");
        success.innerHTML = json.success[0];

        error.classList.add("d-none");

        newPassword.value = "";
        confirmPassword.value = "";

        setTimeout(() => {
            window.location.href = "/login"
        }, 2000)
    }
    else { // đổi mật khẩu thất bại
        error.classList.remove("d-none");
        error.innerHTML = json.error[0];

        success.classList.add("d-none");

        newPassword.value = json.newPassword;
        confirmPassword.value = json.confirmPassword;
    }
}

function showPassword() {
    let newPassword = document.getElementById('newPassword');
    let confirmPassword = document.getElementById('confirmPassword');
    let showPasswordCheckbox = document.getElementById('showPassword');
    let isShowPassword = showPasswordCheckbox.checked;

    newPassword.type = isShowPassword ? 'text' : 'password';
    confirmPassword.type = isShowPassword ? 'text' : 'password';
}
