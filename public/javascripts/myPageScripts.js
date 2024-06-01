function showPasswordSection() {
    document.getElementById('passwordSection').style.display = 'flex';
    document.getElementById('initialButtons').style.display = 'none';
    document.getElementById('submitButton').style.display = 'flex';
}

function confirmDelete() {
    const confirmation = confirm("정말로 회원탈퇴를 하시겠습니까?");
    if (confirmation) {
        document.getElementById('deleteUserForm').submit();
    }
}

function handleFormSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const newPassword = document.getElementById('newPassword').value;

    // 비밀번호 조건 확인
    if (newPassword.length < 8) {
        alert("비밀번호는 최소 8자 이상이어야 합니다.");
        return false;
    }

    fetch(form.action, {
        method: form.method,
        body: new FormData(form),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("비밀번호가 변경되었습니다.");
            window.location.reload(); // 비밀번호 변경 후 페이지 새로고침
        } else {
            alert(`비밀번호 변경에 실패했습니다: ${data.message}`);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert("비밀번호 변경에 실패했습니다. 다시 시도해주세요.");
    });
}