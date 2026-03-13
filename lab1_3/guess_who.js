function generateNum(N) {
    return Math.floor(Math.random() * N) + 1;
}

function isNumInRange(range, secretNum) {
    return secretNum >= range[0] && secretNum <= range[1];
}

function computerGuess(possibleNumbers) {
    if (possibleNumbers.length === 0) return [1, 20];
    
    const min = possibleNumbers[0];
    const max = possibleNumbers[possibleNumbers.length - 1];
    
    if (min === max) return [min, min];
    
    const mid = Math.floor((min + max) / 2);
    return [min, mid];
}

function smartComputerGuess(computerPossibleNumbers, userPossibleNumbers) {
    const n = computerPossibleNumbers.length;
    const m = userPossibleNumbers.length;
    
    console.log(`Компьютер: осталось угадать из ${n} чисел`);
    console.log(`Игрок: осталось угадать из ${m} чисел`);
    
    const min = computerPossibleNumbers[0];
    const max = computerPossibleNumbers[computerPossibleNumbers.length - 1];
    
    if (min === max) return [min, min];
    
    // Определяем тип позиции для компьютера
    let positionType = getPositionType(n, m);
    
    let b;
    
    if (positionType === 'U') {
        // Upper hand - выигрышная позиция
        b = Math.floor(n / 2);
        console.log(`Upper hand: бинарный поиск (b=${b})`);
    } else if (positionType === 'W') {
        // Weeds - проигрышная позиция
        let k = Math.floor(Math.log2(m - 1));
        // Гарантируем, что 2^k не меньше 1
        let powerOfTwo = Math.max(1, Math.pow(2, k));
        
        b = Math.min(powerOfTwo, n - 1);
        console.log(`Weeds ${k}-го порядка: рискованная стратегия (b=${b})`);
    } else {
        b = Math.floor(n / 2);
        console.log(`Граничный случай: бинарный поиск (b=${b})`);
    }
    
    const rangeEnd = min + b - 1;
    return [min, Math.min(rangeEnd, max)];
}

function getPositionType(n, m) {
    // Определяем тип позиции для компьютера
    
    if (n === 1 && m > 1) return 'WIN';
    if (n > 1 && m === 1) return 'LOSE';
    if (n === 1 && m === 1) return 'DRAW';
    
    // Определяем k
    // W_k: 2^(k+1) < n and 2^k < m ≤ 2^(k+1)
    // U_k: 2^k < n ≤ 2^(k+1) and 2^k < m
    
    for (let k = 0; k <= 10; k++) {
        let lowerBoundN = Math.pow(2, k);
        let upperBoundN = Math.pow(2, k + 1);
        let lowerBoundM = Math.pow(2, k);
        let upperBoundM = Math.pow(2, k + 1);
        
        // Проверяем Upper Hand (U)
        if (n > lowerBoundN && n <= upperBoundN && m > lowerBoundM) {
            return 'U';
        }
        
        // Проверяем Weeds (W)
        if (n > upperBoundN && m > lowerBoundM && m <= upperBoundM) {
            return 'W';
        }
    }
    
    return 'U';
}

function startGame() {
    alert('Игра "Угадай кто"');
    
    const N = 20;
    const secretNumUser = generateNum(N);
    const secretNumComputer = generateNum(N);
    
    let computerPossibleNumbers = Array.from({length: N}, (_, i) => i + 1);
    let userPossibleNumbers = Array.from({length: N}, (_, i) => i + 1);
    
    let gameOver = false;
    let winner = null;
    
    //console.log(`Ваше секретное число: ${secretNumUser}`);
    //console.log(`Секретное число компьютера: ${secretNumComputer}`);
    
    while (!gameOver) {
        // Ход игрока
        let validInput = false;
        let range_user;
        
        while (!validInput) {
            const input = prompt("Введите 2 числа от 1 до 20 через пробел (вопрос формата: число в диапазоне [a, b]?)");
            
            if (input === null) {
                if (confirm("Хотите выйти из игры?")) {
                    gameOver = true;
                    break;
                }
                continue;
            }
            
            range_user = input.split(" ").map(Number);
            
            if (range_user.length === 2 && 
                range_user[0] >= 1 && range_user[0] <= 20 && 
                range_user[1] >= 1 && range_user[1] <= 20 &&
                range_user[0] <= range_user[1]) {
                validInput = true;
            } else {
                alert("Некорректный ввод. Введите два числа от 1 до 20 через пробел (первое ≤ второе)");
            }
        }
        
        if (gameOver) break;
        
        // Проверка вопроса игрока
        const userGuessCorrect = isNumInRange(range_user, secretNumComputer);
        const answer = userGuessCorrect ? "Да" : "Нет";
        alert(`Компьютер отвечает: ${answer}`);
        
        if (userGuessCorrect) {
            userPossibleNumbers = userPossibleNumbers.filter(num => 
                num >= range_user[0] && num <= range_user[1]
            );
        } else {
            userPossibleNumbers = userPossibleNumbers.filter(num => 
                num < range_user[0] || num > range_user[1]
            );
        }
        
        // Проверка победы игрока
        if (range_user[0] === range_user[1] && userGuessCorrect) {
            gameOver = true;
            winner = "player";
            alert(`Поздравляем! Вы угадали число компьютера: ${secretNumComputer}`);
            break;
        }
        
        // Проверка, может ли игрок гарантированно назвать число
        if (userPossibleNumbers.length === 1) {
            gameOver = true;
            winner = "player";
            alert(`Победа! Число компьютера - ${userPossibleNumbers[0]}`);
            break;
        }
        console.log(userPossibleNumbers);
        
        // Ход компьютера
        const range_computer = smartComputerGuess(computerPossibleNumbers, userPossibleNumbers);
        alert(`Компьютер спрашивает про ваше число: оно в диапазоне [${range_computer[0]}, ${range_computer[1]}]?`);
        
        const computerGuessCorrect = isNumInRange(range_computer, secretNumUser);
        const computerAnswer = computerGuessCorrect ? "Да" : "Нет";
        alert(`Ваш ответ: ${computerAnswer}`);
        
        if (computerGuessCorrect) {
            computerPossibleNumbers = computerPossibleNumbers.filter(num => 
                num >= range_computer[0] && num <= range_computer[1]
            );
        } else {
            computerPossibleNumbers = computerPossibleNumbers.filter(num => 
                num < range_computer[0] || num > range_computer[1]
            );
        }
        
        // Проверка победы компьютера
        if (range_computer[0] === range_computer[1] && computerGuessCorrect) {
            gameOver = true;
            winner = "computer";
            alert(`Компьютер угадал ваше число ${secretNumUser}! Вы проиграли.`);
            break;
        }
        
        // Проверка, может ли компьютер гарантированно назвать число
        if (computerPossibleNumbers.length === 1) {
            gameOver = true;
            winner = "computer";
            alert(`Компьютер знает ваше число - ${computerPossibleNumbers[0]}. Вы проиграли.`);
            break;
        }
        console.log(computerPossibleNumbers);
    }
    
    if (winner === "player") {
        alert("Игра окончена. Вы победили!");
    } else if (winner === "computer") {
        alert("Игра окончена. Компьютер победил!");
    } else {
        alert("Игра прервана");
    }
    
    if (confirm("Хотите сыграть ещё?")) {
        startGame();
    }
}
