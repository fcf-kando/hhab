// register.js
document.getElementById('registerForm').addEventListener('submit', async function (event) {
    event.preventDefault();
    const newMail = document.getElementById('newMail').value;
    const newUsername = document.getElementById('newUsername').value;
    const newPassword = document.getElementById('newPassword').value;

    try {
        const response = await fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: newMail, username: newUsername, password: newPassword })
        });
        if (response.ok) {
            alert('ユーザー登録成功');
            window.location.href = 'index.html';
        } else {
            alert('ユーザー登録に失敗しました');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('ユーザー登録に失敗しました');
    }
});
document.getElementById('backButton').addEventListener('click', function () {
    window.location.href = 'index.html'; // ログイン画面に遷移
});