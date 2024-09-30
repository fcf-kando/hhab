document.getElementById('loginButton').addEventListener('click', async function (event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.token);
            window.location.href = '/main.html';
        } else {
            const errorData = await response.json();
            alert('ログインに失敗しました');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('ログインに失敗しました');
    }
});

document.getElementById('registerButton').addEventListener('click', function () {
    window.location.href = '/register.html';
});