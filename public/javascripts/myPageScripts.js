function confirmDelete() {
    const confirmation = confirm("정말로 회원탈퇴를 하시겠습니까?");
    if (confirmation) {
        document.getElementById('deleteUserForm').submit();
    }
}