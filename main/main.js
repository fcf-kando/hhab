document.addEventListener('DOMContentLoaded', function () {
    const cashModal = document.getElementById('cashInputModal');
    const categoryModal = document.getElementById('categoryInputModal');
    const editAmountModal = document.getElementById('editAmountModal');
    const openCashModalButton = document.getElementById('openModalButton');
    const openCategoryModalButton = document.getElementById('openCategoryModalButton');
    const closeCashButton = document.querySelector('.close-button');
    const closeCategoryButton = document.querySelector('.close-category-button');
    const closeEditButton = document.querySelector('.close-edit-button');
    const deleteTransactionButton = document.getElementById('deleteTransactionButton');
    const logoutButton = document.getElementById('logoutButton');

    openCashModalButton.addEventListener('click', function () {
        cashModal.style.display = 'block';
    });

    openCategoryModalButton.addEventListener('click', function () {
        categoryModal.style.display = 'block';
        loadCategoryList();
        loadCategoriesForEdit();
    });

    closeCashButton.addEventListener('click', function () {
        cashModal.style.display = 'none';
    });

    closeCategoryButton.addEventListener('click', function () {
        categoryModal.style.display = 'none';
    });

    closeEditButton.addEventListener('click', function () {
        editAmountModal.style.display = 'none';
    });

    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = '/';
    });

    window.addEventListener('click', function (event) {
        if (event.target === cashModal) {
            cashModal.style.display = 'none';
        }
        if (event.target === categoryModal) {
            categoryModal.style.display = 'none';
        }
        if (event.target === editAmountModal) {
            editAmountModal.style.display = 'none';
        }
    });

    document.getElementById('cashInputForm').addEventListener('submit', async function (event) {
        event.preventDefault();

        const date = document.getElementById('date').value;
        const description = document.getElementById('description').value;
        const categorySelect = document.getElementById('category');
        const category_name = categorySelect.options[categorySelect.selectedIndex].text;
        const amount = document.getElementById('amount').value;

        try {
            const token = localStorage.getItem('token');
            const userIdResponse = await fetch('/getUserId', {
                headers: {
                    'Authorization': token
                }
            });
            const userIdData = await userIdResponse.json();
            const userId = userIdData.user_id;

            const response = await fetch('/insertTransaction', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ user_id: userId, amount, description, transaction_date: date, category_name })
            });

            if (response.ok) {
                alert('正常に登録されました');
                loadTransactions();
            } else {
                alert('登録に失敗しました');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('登録に失敗しました');
        }

        cashModal.style.display = 'none';
    });

    document.getElementById('categoryInputForm').addEventListener('submit', async function (event) {
        event.preventDefault();
        const categoryName = document.getElementById('categoryName').value;
        try {
            const response = await fetch('/insertCategory', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ categoryName })
            });

            if (response.ok) {
                alert('カテゴリが正常に登録されました');
                loadCategoryList();
            } else {
                alert('カテゴリの登録に失敗しました');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('カテゴリの登録に失敗しました');
        }

        categoryModal.style.display = 'none';
    });

    document.getElementById('editAmountForm').addEventListener('submit', async function (event) {
        event.preventDefault();
        const amount = document.getElementById('editAmount').value;
        const description = document.getElementById('editDescription').value;
        const category = document.getElementById('category').value;
        const transactionId = parseInt(document.getElementById('editAmountForm').dataset.transactionId, 10);

        try {
            const response = await fetch(`/updateTransaction/${transactionId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ amount, description, category })
            });

            if (response.ok) {
                alert('更新に成功しました');
                loadTransactions();
            } else {
                const errorText = await response.text();
                alert('更新に失敗しました: ' + errorText);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('更新に失敗しました');
        }

        editAmountModal.style.display = 'none';
    });

    deleteTransactionButton.addEventListener('click', async function () {
        const transactionId = parseInt(document.getElementById('editAmountForm').dataset.transactionId, 10);
        if (confirm('この明細を削除しますか？')) {
            try {
                const response = await fetch(`/deleteTransaction/${transactionId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    alert('削除に成功しました');
                    loadTransactions();
                } else {
                    const errorText = await response.text();
                    alert('削除に失敗しました: ' + errorText);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('削除に失敗しました');
            }

            editAmountModal.style.display = 'none';
        }
    });

    async function loadCategories() {
        try {
            const response = await fetch('/getCategories');
            if (response.ok) {
                const categories = await response.json();
                const categorySelect = document.getElementById('category');
                categorySelect.innerHTML = '';

                categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.category_name;
                    option.textContent = category.category_name;
                    categorySelect.appendChild(option);
                });
            } else {
                console.error('カテゴリの取得に失敗しました');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    async function loadCategoryList() {
        try {
            const response = await fetch('/getCategories');
            if (response.ok) {
                const categories = await response.json();
                const categoryList = document.getElementById('categoryList');
                categoryList.innerHTML = '';

                categories.forEach(category => {
                    const listItem = document.createElement('li');
                    listItem.textContent = category.category_name;
                    categoryList.appendChild(listItem);
                });
            } else {
                console.error('カテゴリの取得に失敗しました');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    async function loadCategoriesForEdit() {
        try {
            const response = await fetch('/getCategories');
            if (response.ok) {
                const categories = await response.json();
                const categorySelect = document.getElementById('editCategory');
                categorySelect.innerHTML = ''; // 既存のオプションをクリア

                categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.category_name;
                    option.textContent = category.category_name;
                    categorySelect.appendChild(option);
                });
            } else {
                console.error('カテゴリの取得に失敗しました');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    async function loadTransactions() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/transactions', {
                headers: {
                    'Authorization': token
                }
            });
            if (response.ok) {
                const transactions = await response.json();
                const transactionTable = document.getElementById('transactionTable');
                transactionTable.innerHTML = '';

                const groupedTransactions = transactions.reduce((acc, transaction) => {
                    const date = transaction.transaction_date;
                    if (!acc[date]) {
                        acc[date] = [];
                    }
                    acc[date].push(transaction);
                    return acc;
                }, {});
                for (const [date, transactions] of Object.entries(groupedTransactions)) {
                    const dateRow = document.createElement('tr');
                    dateRow.classList.add('date-row');
                    dateRow.innerHTML = `<th colspan="5">${date}</th>`;
                    transactionTable.appendChild(dateRow);

                    const headerRow = document.createElement('tr');
                    headerRow.innerHTML = `
                        <th>内容</th>
                        <th>カテゴリ名</th>
                        <th>金額</th>
                    `;
                    transactionTable.appendChild(headerRow);

                    transactions.forEach(transaction => {
                        const row = document.createElement('tr');
                        row.classList.add('transaction-data');
                        const formatAmount = transaction.amount.toLocaleString();
                        row.innerHTML = `
                            <td class="description-cell">${transaction.description}</td>
                            <td class="category-cell">${transaction.category_name}</td>
                            <td class="amount-cell" data-transaction-id="${transaction.transaction_id}">\\${formatAmount}</td>
                        `;
                        transactionTable.appendChild(row);
                    });
                }

                const currentMonth = new Date().getMonth() + 1;
                const currentYear = new Date().getFullYear();
                const currentMonthTransactions = transactions.filter(transaction => {
                    const transactionDate = new Date(transaction.transaction_date);
                    return transactionDate.getMonth() + 1 === currentMonth && transactionDate.getFullYear() === currentYear;
                });

                const totalAmount = calculateTotalAmount(currentMonthTransactions);
                displayTotalAmount(totalAmount);

                document.querySelectorAll('.transaction-data').forEach(row => {
                    row.addEventListener('click', async function () {
                        const transactionId = this.querySelector('.amount-cell').dataset.transactionId;
                        const amount = this.querySelector('.amount-cell').textContent;
                        const description = this.querySelector('.description-cell').textContent;
                        const category = this.querySelector('.category-cell').textContent;

                        document.getElementById('editAmount').value = amount;
                        document.getElementById('editDescription').value = description;
                        document.getElementById('category').value = category;
                        document.getElementById('editAmountForm').dataset.transactionId = transactionId;
                        loadCategoriesForEdit();
                        await loadCategories();

                        const categorySelect = document.getElementById('category');
                        categorySelect.value = category;

                        editAmountModal.style.display = 'block';
                    });
                });
            } else {
                console.error('トランザクションデータの取得に失敗しました');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    function calculateTotalAmount(transactions) {
        let total = transactions.reduce((sum, transaction) => sum + parseFloat(transaction.amount), 0);
        return formatAmount(total);
    }

    function displayTotalAmount(total) {
        const currentMonth = new Date().getMonth() + 1;
        document.getElementById('totalAmount').textContent = `${currentMonth} 月 合計金額: ${total}`;
    }

    function formatAmount(amount) {
        return amount.toLocaleString('ja-JP', { style: 'currency', currency: 'JPY' });
    }

    async function loadCategoriesWithDelete() {
        try {
            const response = await fetch('/getCategories');
            if (response.ok) {
                const categories = await response.json();
                const categoryList = document.getElementById('categoryList');
                categoryList.innerHTML = '';

                categories.forEach(category => {
                    const listItem = document.createElement('li');
                    listItem.textContent = category.category_name;
                    listItem.dataset.categoryName = category.category_name;
                    listItem.addEventListener('click', async function () {
                        if (confirm(`カテゴリ「${category.category_name}」を削除しますか？`)) {
                            try {
                                const response = await fetch('/deleteCategory', {
                                    method: 'DELETE',
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({ categoryName: category.category_name })
                                });

                                if (response.ok) {
                                    alert('カテゴリが正常に削除されました');
                                    document.getElementById('categoryInputModal').style.display = 'none';
                                    loadCategoriesWithDelete();
                                    loadTransactions();
                                } else {
                                    const errorText = await response.text();
                                    alert('カテゴリの削除に失敗しました: ' + errorText);
                                }
                            } catch (error) {
                                console.error('Error:', error);
                                alert('カテゴリの削除に失敗しました');
                            }
                        }
                    });
                    categoryList.appendChild(listItem);
                });
            } else {
                console.error('カテゴリの取得に失敗しました');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }
    // カテゴリ入力モーダルを開く際にカテゴリ一覧を読み込む
    document.getElementById('openCategoryModalButton').addEventListener('click', function () {
        loadCategoriesWithDelete();
        document.getElementById('categoryInputModal').style.display = 'block';
    });

    // カテゴリ入力モーダルを閉じる
    document.querySelector('.close-category-button').addEventListener('click', function () {
        document.getElementById('categoryInputModal').style.display = 'none';
    });

    loadCategories();
    loadTransactions();
});