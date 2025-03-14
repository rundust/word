Page({
  data: {
    board: [],
    selected: null,
    score: 0,
        helpCount: 3,
        highlightPair: null,
        stages: ['小学', '初中', '高中', '大学'],
        stageIndex: 0,
        grades: [],
        gradeIndex: 0,
        wordList: [],
        emptyCells: 64,
        initialWords: 31,
        gameStarted: false,
        wordTypes: [],
        usedWords: new Set(),
        difficulties: ['简单', '困难'],
        difficultyIndex: 1, // 默认困难模式
        boardSize: 8 // 默认8x8
    },

    onLoad() {
        this.updateGrades();
        this.fetchWords();
    },

    updateGrades() {
        let grades = [];
        const stage = this.data.stages[this.data.stageIndex];
        if (stage === '小学') {
            grades = ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级', 'KET'];
        } else if (stage === '初中' || stage === '高中') {
            grades = ['一年级', '二年级', '三年级'];
        } else if (stage === '大学') {
            grades = ['一年级', '二年级', '三年级', '四年级'];
        }
        this.setData({
            grades,
            gradeIndex: 0
        });
    },

    onStageChange(e) {
        this.setData({
            stageIndex: parseInt(e.detail.value)
        });
        this.updateGrades();
        this.fetchWords();
    },

    onGradeChange(e) {
        this.setData({
            gradeIndex: parseInt(e.detail.value)
        });
        this.fetchWords();
    },

    fetchWords() {
        wx.request({
            url: 'http://127.0.0.1:5000/get_words',
            method: 'GET',
            data: {
                stage: this.data.stages[this.data.stageIndex],
                grade: this.data.grades[this.data.gradeIndex]
            },
            success: (res) => {
                this.setData({
                    wordList: res.data
                });
                this.createEmptyBoard();
            },
            fail: (err) => {
                console.error('获取单词数据失败:', err);
            }
        });
    },

    onDifficultyChange(e) {
        const index = parseInt(e.detail.value);
        const boardSize = index === 0 ? 6 : 8;
        this.setData({
            difficultyIndex: index,
            boardSize: boardSize
        });
        this.createEmptyBoard();
    },

    createEmptyBoard() {
        const size = this.data.boardSize;
        var board = [];
        for (var i = 0; i < size; i++) {
            board[i] = new Array(size).fill('');
        }
        
        var wordTypes = [];
        for (var i = 0; i < size; i++) {
            wordTypes[i] = new Array(size).fill('');
        }
        
        this.setData({ 
            board: board,
            gameStarted: false,
            score: 0,
            selected: null,
            emptyCells: size * size,
            helpCount: 3,
            wordTypes: wordTypes,
            usedWords: new Set()
        });
    },

    isWordUsed(word) {
        if (this.data.usedWords.has(word.english) || this.data.usedWords.has(word.chinese)) {
            return true;
        }

        const board = this.data.board;
        const size = this.data.boardSize;
        let hasEnglish = false;
        let hasChinese = false;
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                if (board[i][j] === word.english) {
                    hasEnglish = true;
                }
                if (board[i][j] === word.chinese) {
                    hasChinese = true;
                }
            }
        }
        return hasEnglish || hasChinese;
    },

    getUnusedWord() {
        const wordList = this.data.wordList;
        if (wordList.length === 0) return null;

        const availableWords = [];
        for (let i = 0; i < wordList.length; i++) {
            if (!this.isWordUsed(wordList[i])) {
                availableWords.push(wordList[i]);
            }
        }

        if (availableWords.length === 0) {
            return null;
        }

        const randomIndex = Math.floor(Math.random() * availableWords.length);
        return availableWords[randomIndex];
  },

  addWords() {
        if (!this.data.gameStarted) return;
        const size = this.data.boardSize;
        const board = this.data.board;
        const emptyPositions = [];
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
        if (board[i][j] === '') {
          emptyPositions.push({ i, j });
        }
      }
    }
        
    if (emptyPositions.length < 2) {
            console.log('空位置不足，游戏结束');
      this.gameOver();
      return;
    }

        const randomWord = this.getUnusedWord();
        if (!randomWord) {
            console.log('没有未使用的单词，游戏结束');
      this.gameOver();
            return;
        }
        
        const pos1Index = Math.floor(Math.random() * emptyPositions.length);
        const pos1 = emptyPositions[pos1Index];
        emptyPositions.splice(pos1Index, 1);
        const pos2Index = Math.floor(Math.random() * emptyPositions.length);
        const pos2 = emptyPositions[pos2Index];

        if (randomWord && typeof randomWord.english === 'string' && typeof randomWord.chinese === 'string') {
            board[pos1.i][pos1.j] = randomWord.english;
            board[pos2.i][pos2.j] = randomWord.chinese;
    } else {
            console.error('randomWord格式不正确，缺少english或chinese属性');
            return;
        }

        const wordTypes = this.data.wordTypes;
        wordTypes[pos1.i][pos1.j] = 'english';
        wordTypes[pos2.i][pos2.j] = 'chinese';

        const newEmptyCells = emptyPositions.length - 2;
        this.setData({
          board,
            wordTypes,
            emptyCells: newEmptyCells
        }, () => {
            if (newEmptyCells === 0) {
                this.gameOver();
            }
        });
    },

    startGame() {
        if (this.data.gameStarted) return;
        
        const size = this.data.boardSize;
        var board = [];
        for (var i = 0; i < size; i++) {
            var row = [];
            for (var j = 0; j < size; j++) {
                row.push('');
            }
            board.push(row);
        }
        
        this.setData({ 
            board: board,
            gameStarted: true,
            score: 0,
            selected: null,
            emptyCells: 0,
            usedWords: new Set()
        });

        // 根据难度设置初始单词数量
        const totalCells = size * size;
        const initialWords = Math.floor(totalCells / 2); // 每个单词占用2个格子
        for (var i = 0; i < initialWords; i++) {
        this.addWords();
        }
    },

    checkWin() {
        const board = this.data.board;
        for (let i = 0; i < board.length; i++) {
            for (let j = 0; j < board[i].length; j++) {
                if (board[i][j] !== '') return false;
            }
        }
        return true;
    },

    rearrangeWords() {
        const size = this.data.boardSize;
        // 创建新的棋盘和类型数组
        const newBoard = Array(size).fill().map(() => Array(size).fill(''));
        const newWordTypes = Array(size).fill().map(() => Array(size).fill(''));
        
        // 收集所有非空位置和对应的单词
        const nonEmptyPositions = [];
        const nonEmptyWords = [];
        const nonEmptyTypes = [];

        // 收集所有非空位置和对应的单词
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                if (this.data.board[i][j] !== '') {
                    nonEmptyPositions.push({ i, j });
                    nonEmptyWords.push(this.data.board[i][j]);
                    nonEmptyTypes.push(this.data.wordTypes[i][j]);
                }
            }
        }

        // 随机打乱位置
        for (let i = nonEmptyPositions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            // 交换单词
            [nonEmptyWords[i], nonEmptyWords[j]] = [nonEmptyWords[j], nonEmptyWords[i]];
            // 交换类型
            [nonEmptyTypes[i], nonEmptyTypes[j]] = [nonEmptyTypes[j], nonEmptyTypes[i]];
        }

        // 更新新棋盘
        for (let i = 0; i < nonEmptyPositions.length; i++) {
            const pos = nonEmptyPositions[i];
            newBoard[pos.i][pos.j] = nonEmptyWords[i];
            newWordTypes[pos.i][pos.j] = nonEmptyTypes[i];
        }

        // 更新状态
        this.setData({
            board: newBoard,
            wordTypes: newWordTypes
        });
    },

    onCellTap(e) {
        if (!this.data.gameStarted) return;
    
        const i = parseInt(e.currentTarget.dataset.i);
        const j = parseInt(e.currentTarget.dataset.j);
        const currentCell = this.data.board[i][j];
    
        if (!currentCell) return;
    
        if (!this.data.selected) {
            this.setData({
                selected: { i, j, value: currentCell }
            });
            return;
        }
    
        const selected = this.data.selected;
        if (i === selected.i && j === selected.j) {
            this.setData({ selected: null });
            return;
        }
    
        let isMatch = false;
        let matchedWord = null;
        const wordList = this.data.wordList;
        for (let k = 0; k < wordList.length; k++) {
            const word = wordList[k];
            if ((selected.value === word.english && currentCell === word.chinese) ||
                (selected.value === word.chinese && currentCell === word.english)) {
                isMatch = true;
                matchedWord = word;
        break;
      }
    }
    
        if (isMatch) {
            const newBoard = this.data.board.map(row => [...row]);
            const newWordTypes = this.data.wordTypes.map(row => [...row]);
            newBoard[selected.i][selected.j] = '';
            newBoard[i][j] = '';
            newWordTypes[selected.i][selected.j] = 'empty';
            newWordTypes[i][j] = 'empty';
            const newEmptyCells = this.data.emptyCells + 2;
            
            const usedWords = new Set(this.data.usedWords);
            usedWords.add(matchedWord.english);
            usedWords.add(matchedWord.chinese);
    
            this.setData({
                board: newBoard,
                wordTypes: newWordTypes,
                selected: null,
                score: this.data.score + 1,
                emptyCells: newEmptyCells,
                usedWords: usedWords
            }, () => {
                this.checkGameState();
            });
        } else {
            this.setData({ selected: null }, () => {
                wx.showToast({
                    title: '不匹配',
                    icon: 'none',
                    duration: 1000
                });
                setTimeout(() => {
                    this.addWords();  // 先增加新单词
                    setTimeout(() => {
                        this.rearrangeWords();  // 然后打乱顺序
                    }, 100);
                }, 500);
            });
        }
    },

    onHelpTap() {
        if (!this.data.gameStarted) return;
        if (this.data.helpCount <= 0) return;

        const board = this.data.board;
        const wordList = this.data.wordList;
        const size = this.data.boardSize;
        let hintWord = null;
        let enPos = null;
        let cnPos = null;

        // 如果有选中的单词，优先提示该单词
        if (this.data.selected) {
            const selectedValue = this.data.selected.value;
            for (let i = 0; i < wordList.length; i++) {
                const word = wordList[i];
                if (selectedValue === word.english || selectedValue === word.chinese) {
                    // 找到对应的另一个单词
                    for (let x = 0; x < size; x++) {
                        for (let y = 0; y < size; y++) {
                            if (board[x][y] === (selectedValue === word.english ? word.chinese : word.english)) {
                                hintWord = word;
                                enPos = selectedValue === word.english ? 
                                    { i: this.data.selected.i, j: this.data.selected.j } : 
                                    { i: x, j: y };
                                cnPos = selectedValue === word.chinese ? 
                                    { i: this.data.selected.i, j: this.data.selected.j } : 
                                    { i: x, j: y };
                                break;
                            }
                        }
                        if (hintWord) break;
                    }
                    break;
                }
            }
        }

        // 如果没有找到匹配的单词，则随机找一个未匹配的单词对
        if (!hintWord) {
            for (let i = 0; i < wordList.length; i++) {
                const word = wordList[i];
                enPos = null;
                cnPos = null;
                for (let x = 0; x < size; x++) {
                    for (let y = 0; y < size; y++) {
                        if (board[x][y] === word.english) enPos = { i: x, j: y };
                        if (board[x][y] === word.chinese) cnPos = { i: x, j: y };
                    }
                }
                if (enPos && cnPos) {
                    hintWord = word;
                    break;
                }
            }
        }

        if (hintWord && enPos && cnPos) {
            // 更新提示状态
            const newWordTypes = this.data.wordTypes.map(row => [...row]);
            newWordTypes[enPos.i][enPos.j] = 'hint';
            newWordTypes[cnPos.i][cnPos.j] = 'hint';

            this.setData({
                helpCount: this.data.helpCount - 1,
                wordTypes: newWordTypes
            });

            // 5秒后自动清除提示效果
            setTimeout(() => {
                const resetWordTypes = this.data.wordTypes.map(row => [...row]);
                // 检查格子是否为空，如果为空则保持empty类型
                if (board[enPos.i][enPos.j] === '') {
                    resetWordTypes[enPos.i][enPos.j] = 'empty';
                } else if (!this.data.usedWords.has(board[enPos.i][enPos.j])) {
                    resetWordTypes[enPos.i][enPos.j] = board[enPos.i][enPos.j] === hintWord.english ? 'english' : 'chinese';
                }
                if (board[cnPos.i][cnPos.j] === '') {
                    resetWordTypes[cnPos.i][cnPos.j] = 'empty';
                } else if (!this.data.usedWords.has(board[cnPos.i][cnPos.j])) {
                    resetWordTypes[cnPos.i][cnPos.j] = board[cnPos.i][cnPos.j] === hintWord.chinese ? 'chinese' : 'english';
                }
                this.setData({
                    wordTypes: resetWordTypes
                });
            }, 5000);
        }
    },

    checkGameState() {
        const availableWords = this.getUnusedWord();
        if (!availableWords) {
            // 显示提示信息
            wx.showToast({
                title: '无可用单词，游戏继续',
                icon: 'none',
                duration: 2000
            });
            return;
        }

        if (this.data.emptyCells === 0) {
            this.gameOver();
            return;
        }

        if (this.checkWin()) {
            this.gameWin();
        }
  },

  gameOver() {
        if (!this.data.gameStarted) return;
        this.setData({ gameStarted: false });
    wx.showModal({
      title: '游戏结束',
      content: `你的分数是: ${this.data.score}`,
            showCancel: false,
            success: (res) => {
        if (res.confirm) {
                    this.createEmptyBoard();
                }
            }
        });
    },

    gameWin() {
        if (!this.data.gameStarted) return;
        this.setData({ gameStarted: false });
        const currentStage = this.data.stages[this.data.stageIndex];
        const currentGrade = this.data.grades[this.data.gradeIndex];
        const isLastGrade = this.data.gradeIndex === this.data.grades.length - 1;
        const isLastStage = this.data.stageIndex === this.data.stages.length - 1;

        if (isLastStage && isLastGrade) {
                wx.showModal({
                title: '游戏通关',
                content: `恭喜你通关所有关卡！你的分数是: ${this.data.score}`,
                showCancel: false,
                success: (res) => {
                    if (res.confirm) {
                        this.createEmptyBoard();
                    }
                  }
                });
        } else {
            let nextStageIndex = this.data.stageIndex;
            let nextGradeIndex = this.data.gradeIndex + 1;
            let nextStage = currentStage;
            let nextGrade = '';

            if (isLastGrade) {
                nextStageIndex++;
                nextGradeIndex = 0;
                nextStage = this.data.stages[nextStageIndex];
            }
            nextGrade = this.data.grades[nextGradeIndex];

            wx.showModal({
                title: '恭喜过关',
                content: `你的分数是: ${this.data.score}\n即将进入下一关: ${nextStage}${nextGrade}`,
                showCancel: false,
                success: (res) => {
                    if (res.confirm) {
                        this.setData({
                            stageIndex: nextStageIndex,
                            gradeIndex: nextGradeIndex
                        });
                        this.updateGrades();
                        this.fetchWords();
        }
      }
    });
        }
    },

    classifyWords() {
        const board = this.data.board;
        const wordTypes = [];
        for (let i = 0; i < board.length; i++) {
            const rowTypes = [];
            for (let j = 0; j < board[i].length; j++) {
                const word = board[i][j];
                if (/[\u4e00-\u9fa5]/.test(word)) {
                    rowTypes.push('chinese');
                } else {
                    rowTypes.push('english');
                }
            }
            wordTypes.push(rowTypes);
        }
        this.setData({
            wordTypes
    });
  }
});