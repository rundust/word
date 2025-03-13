Page({
    data: {
        board: [],
        selected: null,
        score: null,
        helpCount: 3,
        highlightPair: null,
        stages: ['小学', '初中', '高中', '大学'],
        stageIndex: 0,
        grades: [],
        gradeIndex: 0,
        wordList: [],
        emptyCells: 64,
        initialWords: 31,
        gameStarted: false
    },

    onLoad() {
        this.updateGrades();
        this.fetchWords();
    },

    updateGrades() {
        var grades = [];
        var stage = this.data.stages[this.data.stageIndex];
        if (stage === '小学') {
            grades = ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级'];
        } else if (stage === '初中' || stage === '高中') {
            grades = ['一年级', '二年级', '三年级'];
        } else if (stage === '大学') {
            grades = ['一年级', '二年级', '三年级', '四年级'];
        }
        this.setData({
            grades: grades,
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
        var that = this;
        wx.request({
            url: 'http://127.0.0.1:5000/get_words',
            method: 'GET',
            data: {
                stage: that.data.stages[that.data.stageIndex],
                grade: that.data.grades[that.data.gradeIndex]
            },
            success: function (res) {
                that.setData({
                    wordList: res.data
                });
                that.createEmptyBoard();
            },
            fail: function (err) {
                console.error('获取单词数据失败:', err);
            }
        });
    },

    createEmptyBoard() {
        var board = [];
        for (var i = 0; i < 8; i++) {
            var row = [];
            for (var j = 0; j < 8; j++) {
                row.push('');
            }
            board.push(row);
        }
        this.setData({ 
            board: board,
            score: null,
            helpCount: 3,
            highlightPair: null,
            emptyCells: 64,
            gameStarted: false,
            selected: null
        });
    },

    isWordUsed(word) {
        var board = this.data.board;
        var hasEnglish = false;
        var hasChinese = false;
        
        for (var i = 0; i < 8; i++) {
            for (var j = 0; j < 8; j++) {
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
        var wordList = this.data.wordList;
        if (wordList.length === 0) return null;

        var availableWords = [];
        for (var i = 0; i < wordList.length; i++) {
            if (!this.isWordUsed(wordList[i])) {
                availableWords.push(wordList[i]);
            }
        }

        if (availableWords.length === 0) {
            return null;
        }

        var randomIndex = Math.floor(Math.random() * availableWords.length);
        return availableWords[randomIndex];
    },

    addWords() {
        if (!this.data.gameStarted) return;
        
        var board = this.data.board;
        var emptyPositions = [];
        for (var i = 0; i < 8; i++) {
            for (var j = 0; j < 8; j++) {
                if (board[i][j] === '') {
                    emptyPositions.push({ i: i, j: j });
                }
            }
        }

        // 如果空位置少于2个，不添加单词也不结束游戏
        if (emptyPositions.length < 2) {
            return;
        }

        var randomWord = this.getUnusedWord();
        // 如果没有未使用的单词，不添加单词也不结束游戏
        if (!randomWord) {
            return;
        }

        var pos1Index = Math.floor(Math.random() * emptyPositions.length);
        var pos1 = emptyPositions[pos1Index];
        emptyPositions.splice(pos1Index, 1);
        var pos2Index = Math.floor(Math.random() * emptyPositions.length);
        var pos2 = emptyPositions[pos2Index];

        board[pos1.i][pos1.j] = randomWord.english;
        board[pos2.i][pos2.j] = randomWord.chinese;

        this.setData({ 
            board: board,
            emptyCells: emptyPositions.length - 2 
        });

        if (emptyPositions.length - 2 === 0) {
            this.gameOver();
        }
    },

    startGame() {
        var board = [];
        for (var i = 0; i < 8; i++) {
            board[i] = new Array(8).fill('');
        }
        this.setData({ 
            board: board,
            gameStarted: true,
            score: 0,
            selected: null,
            emptyCells: 64,
            helpCount: 3
        }, () => {
            for (var i = 0; i < this.data.initialWords; i++) {
                this.addWords();
            }
        });
    },

    onCellTap(e) {
        if (!this.data.gameStarted) return;
        
        var i = parseInt(e.currentTarget.dataset.i);
        var j = parseInt(e.currentTarget.dataset.j);
        var currentCell = this.data.board[i][j];
        
        if (!currentCell) return;
        
        console.log('点击格子:', i, j, '内容:', currentCell);
        
        if (!this.data.selected) {
            this.setData({
                selected: {
                    i: i,
                    j: j,
                    value: currentCell
                }
            });
            console.log('第一次选中:', currentCell);
            return;
        }
        
        var selected = this.data.selected;
        if (i === selected.i && j === selected.j) {
            this.setData({ selected: null });
            console.log('取消选中');
            return;
        }
        
        var isMatch = false;
        var wordList = this.data.wordList;
        
        for (var k = 0; k < wordList.length; k++) {
            var word = wordList[k];
            if ((selected.value === word.english && currentCell === word.chinese) ||
                (selected.value === word.chinese && currentCell === word.english)) {
                isMatch = true;
                break;
            }
        }

        console.log('匹配结果:', isMatch);

        if (isMatch) {
            var newBoard = this.data.board.map(function(row) {
                return row.slice();
            });
            
            newBoard[selected.i][selected.j] = '';
            newBoard[i][j] = '';

            this.setData({
                board: newBoard,
                selected: null,
                score: this.data.score + 1,
                emptyCells: this.data.emptyCells + 2
            });

            if (this.checkWin()) {
                this.gameWin();
            }
        } else {
            this.setData({ selected: null }, () => {
                wx.showToast({
                    title: '不匹配',
                    icon: 'none',
                    duration: 1000
                });
                setTimeout(() => {
                    this.addWords();
                    this.addWords();
                }, 500);
            });
        }
    },

    onHelpTap() {
        if (!this.data.gameStarted) return;
        if (this.data.helpCount <= 0) return;
        
        var board = this.data.board;
        var wordList = this.data.wordList;
        
        for (var i = 0; i < wordList.length; i++) {
            var word = wordList[i];
            var enPos = null;
            var cnPos = null;
            
            for (var x = 0; x < 8; x++) {
                for (var y = 0; y < 8; y++) {
                    if (board[x][y] === word.english) enPos = { i: x, j: y };
                    if (board[x][y] === word.chinese) cnPos = { i: x, j: y };
                }
            }
            
            if (enPos && cnPos) {
                board[enPos.i][enPos.j] = '';
                board[cnPos.i][cnPos.j] = '';
                this.setData({
                    board: board,
                    score: this.data.score + 1,
                    helpCount: this.data.helpCount - 1,
                    emptyCells: this.data.emptyCells + 2
                });
                if (this.checkWin()) {
                    this.gameWin();
                }
                break;
            }
        }
    },

    checkWin() {
        var board = this.data.board;
        for (var i = 0; i < board.length; i++) {
            for (var j = 0; j < board[i].length; j++) {
                if (board[i][j] !== '') return false;
            }
        }
        return true;
    },

    gameOver() {
        if (!this.data.gameStarted) return;
        this.setData({ gameStarted: false });
        wx.showModal({
            title: '游戏结束',
            content: '你的分数是: ' + this.data.score,
            success: function(res) {
                if (res.confirm) {
                    this.createEmptyBoard();
                }
            }.bind(this)
        });
    },

    gameWin() {
        if (!this.data.gameStarted) return;
        
        this.setData({ gameStarted: false });
        wx.showModal({
            title: '恭喜过关',
            content: '你的分数是: ' + this.data.score,
            success: function(res) {
                if (res.confirm) {
                    this.createEmptyBoard();
                }
            }.bind(this)
        });
    }
});