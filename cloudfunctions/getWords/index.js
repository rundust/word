const cloud = require('wx-server-sdk')
cloud.init({
    env: 'cloud1-9gkq0uvye8459f49'
})
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
    try {
        const { stage, grade } = event
        const collection = db.collection('words')
        
        console.log('查询参数:', { stage, grade });
        
        // 查询符合条件的单词
        const { data } = await collection
            .where({
                stage: stage,
                grade: grade
            })
            .get()
        
        console.log('查询结果:', data);
        
        return {
            data: data,
            errMsg: 'ok'
        }
    } catch (err) {
        console.error('云函数错误:', err)
        return {
            data: [],
            errMsg: err.message
        }
    }
} 