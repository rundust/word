// pages/game/game.js
Page({

    /**
     * 页面的初始数据
     */
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
        difficulties: ['简单', '中等', '困难'],  // 增加中等难度
        difficultyIndex: 0,                     // 默认简单模式
        rows: 6,                                // 默认简单模式行数
        columns: 6                              // 默认简单模式列数
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        wx.cloud.init({
            env: 'cloud1-9gkq0uvye8459f49'
        });
        this.updateGrades();
        this.fetchWords();
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {
        return {
            title: '快来一起玩单词匹配游戏', // 分享标题
            path: '/miniprogram/pages/game/game', // 分享路径，指向当前游戏页面
            imageUrl: '', // 可选，分享卡片的图片地址，需替换为实际可用地址
            success(res) {
                console.log('分享成功', res);
                // 可在此添加分享成功后的逻辑，比如给用户奖励积分等
            },
            fail(err) {
                console.log('分享失败', err);
            }
        };
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
        const stage = this.data.stages[this.data.stageIndex];
        const grade = this.data.grades[this.data.gradeIndex];
        console.log('正在获取单词数据...', { stage, grade });

        wx.cloud.callFunction({
            name: 'getWords',
            data: {
                stage: stage,
                grade: grade
            }
        }).then(res => {
            console.log('获取单词数据成功:', res.result);
            if (res.result && res.result.data && res.result.data.length > 0) {
                this.setData({
                    wordList: res.result.data
                });
                this.createEmptyBoard();
            } else {
                console.error('获取到的单词数据为空');
                wx.showToast({
                    title: '获取单词数据失败',
                    icon: 'none',
                    duration: 2000
                });
            }
        }).catch(err => {
            console.error('获取单词数据失败:', err);
            wx.showToast({
                title: '获取单词数据失败，请检查网络',
                icon: 'none',
                duration: 2000
            });
        });
    },

    // 更新难度切换逻辑
    onDifficultyChange(e) {
        const index = parseInt(e.detail.value);
        const config = [
            { rows: 6, columns: 6 },   // 简单 6x6
            { rows: 6, columns: 8 },   // 中等 6x8
            { rows: 6, columns: 10 }   // 困难 6x10
        ];
        this.setData({
            difficultyIndex: index,
            rows: config[index].rows,
            columns: config[index].columns  // 新增列数更新
        });
        this.createEmptyBoard();
    },
    
    // 更新棋盘创建方法
    createEmptyBoard() {
        const { rows, columns } = this.data;  // 使用当前数据中的行列数
        var board = [];
        for (var i = 0; i < rows; i++) {
            board[i] = new Array(columns).fill('');  // 使用动态列数
        }

        var wordTypes = [];
        // 修复：将size替换为rows和columns
        for (var i = 0; i < rows; i++) {
            wordTypes[i] = new Array(columns).fill('');
        }

        this.setData({
            board: board,
            gameStarted: false,
            score: 0,
            selected: null,
            // 修复：计算总单元格数为rows * columns
            emptyCells: rows * columns,
            helpCount: 3,
            wordTypes: wordTypes,
            usedWords: new Set()
        });
    },

    startGame() {
        // 01移除所有开始条件判断
        this.createEmptyBoard(); // 强制重置棋盘
        
        this.setData({
            gameStarted: true,
            // 合并本地存储的已用单词
            usedWords: new Set(wx.getStorageSync('usedWords') || [])
        }, () => {
            // 根据难度生成初始单词
            const totalCells = this.data.rows * this.data.columns;
            const initialWords = Math.floor(totalCells / 2);
            for (let i = 0; i < initialWords; i++) {
                this.addWords();
            }
        });
    },

    startGame2() {
        // 02初始化当前回合的临时存储
        wx.setStorageSync('currentUsedWords', []); 
        this.setData({
            gameStarted: true,
            usedWords: new Set(wx.getStorageSync('usedWords') || [])
        }, () => {
            const totalCells = this.data.rows * this.data.columns;
            const initialWords = Math.floor(totalCells / 2);
            for (let i = 0; i < initialWords; i++) {
                this.addWords();
            }
        });
    },

    // 在 gameOver 方法后添加 gameWin 方法
    gameOver() {
        if (!this.data.gameStarted) return;
        // 完全重置游戏状态
        this.setData({
            gameStarted: false,
            score: 0,
            helpCount: 3,
            selected: null,
            // 重置为初始空单元格数
            emptyCells: this.data.rows * this.data.columns  
        }, () => {
            this.createEmptyBoard(); // 确保在状态更新后重置棋盘
        });
    },

    // 新增胜利提示方法
    gameWin() {
        if (!this.data.gameStarted) return;
        this.setData({ gameStarted: false });
        wx.showModal({
            title: '恭喜胜利！',
            content: `你成功消除了所有单词！得分：${this.data.score}`,
            showCancel: false,
            success: (res) => {
                if (res.confirm) {
                    // 合并当前使用的单词到永久存储
                    const localUsed = new Set(wx.getStorageSync('usedWords') || []);
                    const currentUsed = new Set([...localUsed, ...wx.getStorageSync('currentUsedWords')]);
                    wx.setStorageSync('usedWords', Array.from(currentUsed));
                    this.createEmptyBoard();
                }
            }
        });
    },

    onHelpTap() {
        if (!this.data.gameStarted) return;
        if (this.data.helpCount <= 0) return;

        const board = this.data.board;
        const wordList = this.data.wordList;
        const rows = this.data.rows;
        const columns = this.data.columns;
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
                    for (let x = 0; x < rows; x++) {
                        for (let y = 0; y < columns; y++) {
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
                for (let x = 0; x < rows; x++) {
                    for (let y = 0; y < columns; y++) {
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

    onCellTap(e) {
        if (!this.data.gameStarted) return;
        const i = e.currentTarget.dataset.i;
        const j = e.currentTarget.dataset.j;
        const value = this.data.board[i][j];

        if (!value) return; // 空格子不处理

        // 放大点击的格子
        this.setData({
            enlargedCell: { i, j }
        });

        // 匹配逻辑
        if (this.data.selected) {
            const selected = this.data.selected;
            if (i === selected.i && j === selected.j) {
                this.setData({
                    selected: null,
                    enlargedCell: null // 取消放大
                });
                return;
            }

            let isMatch = false;
            let matchedWord = null;
            const wordList = this.data.wordList;
            for (let k = 0; k < wordList.length; k++) {
                const word = wordList[k];
                if (
                    (selected.value === word.english && value === word.chinese) ||
                    (selected.value === word.chinese && value === word.english)
                ) {
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

                // 更新临时存储 currentUsedWords
                const currentUsedWords = wx.getStorageSync('currentUsedWords') || [];
                currentUsedWords.push(matchedWord.english, matchedWord.chinese);
                wx.setStorageSync('currentUsedWords', currentUsedWords);

                this.setData({
                    board: newBoard,
                    wordTypes: newWordTypes,
                    selected: null,
                    enlargedCell: null,
                    score: this.data.score + 1,
                    emptyCells: newEmptyCells,
                    usedWords: usedWords
                }, () => {
                    this.checkGameState();
                });
            } else {
                this.setData({
                    selected: null,
                    enlargedCell: null
                }, () => {
                    wx.showToast({
                        title: '不匹配',
                        icon: 'none',
                        duration: 1000
                    });
                    setTimeout(() => {
                        this.addWords();
                        setTimeout(() => {
                            this.rearrangeWords();
                        }, 100);
                    }, 500);
                });
            }
        } else {
            this.setData({
                selected: { i, j, value }
            });
        }
    },

    isWordUsed(word) {
        if (this.data.usedWords.has(word.english) || this.data.usedWords.has(word.chinese)) {
            return true;
        }

        const board = this.data.board;
        const rows = this.data.rows;
        const columns = this.data.columns;
        let hasEnglish = false;
        let hasChinese = false;
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < columns; j++) {
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
        const board = this.data.board;
        const emptyPositions = [];
        // 修改获取空位置的循环范围
        for (let i = 0; i < this.data.rows; i++) {
            for (let j = 0; j < this.data.columns; j++) {
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

    rearrangeWords() {
        const rows = this.data.rows;
        const columns = this.data.columns;
        // 创建新的棋盘和类型数组
        const newBoard = Array(rows).fill().map(() => Array(columns).fill(''));
        const newWordTypes = Array(rows).fill().map(() => Array(columns).fill(''));

        // 收集所有非空位置和对应的单词
        const nonEmptyPositions = [];
        const nonEmptyWords = [];
        const nonEmptyTypes = [];

        // 收集所有非空位置和对应的单词
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < columns; j++) {
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

    checkWin() {
        const board = this.data.board;
        for (let i = 0; i < board.length; i++) {
            for (let j = 0; j < board[i].length; j++) {
                if (board[i][j] !== '') return false;
            }
        }
        return true;
    },

    gameOver() {
        if (!this.data.gameStarted) return;
        this.setData({ gameStarted: false });
        // 清空当前回合的已用单词（不保存到本地）
        wx.setStorageSync('currentUsedWords', []); 
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

    startNewRound() {
        // 合并历史已用单词和当前回合的临时存储
        const localUsed = new Set(wx.getStorageSync('usedWords') || []);
        const currentUsed = new Set([...localUsed, ...wx.getStorageSync('currentUsedWords')]);
        
        this.setData({ 
            usedWords: currentUsed,
            gameStarted: true
        }, () => {
            this.createEmptyBoard();
            this.generateInitialWords();
        });
        // 保存到永久存储
        wx.setStorageSync('usedWords', Array.from(currentUsed)); 
    },

    // 注意：这里缺少 generateInitialWords 方法的定义
    // 如果需要使用 startNewRound，请添加以下实现或调整逻辑
    generateInitialWords() {
        const totalCells = this.data.rows * this.data.columns;
        const initialWords = Math.floor(totalCells / 2);
        for (let i = 0; i < initialWords; i++) {
            this.addWords();
        }
    }
})