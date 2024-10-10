const EventBus = new Vue();

new Vue({
    el: '#options',
    data: {
        showConfirm: false,
        summary: {
            shapeSet: [],
            genericSet: [],
            freqSet: [],
            global: {
                freqUnit: 2,
                geometricUnit: 1,
                useRadians: false
            }
        },

        preset: {
            shapeSet: [],
            genericSet: [],
            freqSet: [],
            global: {
                freqUnit: 2,
                geometricUnit: 1,
                useRadians: false
            }
        }
    },
    methods: {
        resetAll () {
            EventBus.$emit('resetTrigger', true);
            this.showConfirm = false;
        },

        confirmReset () {
            console.log(this.summary);
            this.showConfirm = true;
        },

        cancelReset () {
            this.showConfirm = false;
        },

        saveCurrent () {
            const dataToSave = JSON.stringify(this.summary, null, 4);   // 将对象转换为字符串
            const blob = new Blob([dataToSave], {type: 'text/plain'});  // 创建一个blob对象
            const url = URL.createObjectURL(blob);      // 创建一个URL
            const a = document.createElement('a');      // 创建一个a标签
            a.href = url;                               // 将a标签的href指向URL
            a.download = 'mcbQuerySet.json';            // 设置a标签的download属性
            a.click();                                  // 模拟点击a标签
            URL.revokeObjectURL(url);                   // 释放URL对象
        },

        triggerFileInput() {
            document.getElementById('fileInput').click();
        },

        handlePresetFile(event) {
            const file = event.target.files[0];  // 获取用户选择的文件

            if (file && file.type === "application/json") { // 检查文件类型
                const reader = new FileReader();            // 创建 FileReader 实例

                reader.onload = (e) => { // 当文件读取完成时的回调
                    try { // 解析 JSON 文件内容
                        this.preset = JSON.parse(e.target.result);
                        console.log("文件内容：", this.preset);
                        EventBus.$emit('pre-shapeSet', this.preset.shapeSet);
                        EventBus.$emit('pre-genericSet', this.preset.genericSet);
                        EventBus.$emit('pre-freqSet', this.preset.freqSet);
                        EventBus.$emit('pre-globalSet', this.preset.global);
                        this.summary = this.preset;
                    } catch (err) {
                        console.error(err);
                        alert('读取文件失败或文件格式不正确，请上传有效的 JSON 文件');
                    }
                };

                reader.readAsText(file);    // 异步读取文件为文本
            } else {
                alert('请选择一个有效的 JSON 文件');
            }
        }
    },
    mounted() {
        EventBus.$on('shapeSet', (shapesID) => {
            this.summary.shapeSet = shapesID;
            // console.log(this.shapeSet);
        });

        EventBus.$on('genericSet', (genericSet) => {
            this.summary.genericSet = genericSet;
            // console.log(this.genericSet);
        });

        EventBus.$on('freqSet', (freqSet) => {
            this.summary.freqSet = freqSet;
            // console.log(this.freqSet);
        });

        EventBus.$on('globalSet', (globalSet) => {
            this.summary.global = globalSet;
            // console.log(this.globalSet);
        });
    },
})