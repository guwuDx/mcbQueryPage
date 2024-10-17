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
        },

        querySubmit() {
            // 创建深拷贝的请求对象
            const queryRequest = {
                shapeSet: JSON.parse(JSON.stringify(this.summary.shapeSet)),
                genericSet: JSON.parse(JSON.stringify(this.summary.genericSet)),
                freqSet: JSON.parse(JSON.stringify(this.summary.freqSet))
            };

            // 根据 this.summary.global 的值换算单位
            for (let i = 0; i < this.summary.genericSet.length; i++) {
                if (3 <= this.summary.genericSet[i].parameter && this.summary.genericSet[i].parameter <= 5) {
                    queryRequest.genericSet[i].value      *= 1e3 ** (this.summary.global.geometricUnit - 1);
                    queryRequest.genericSet[i].rangeEnd   *= 1e3 ** (this.summary.global.geometricUnit - 1);
                    queryRequest.genericSet[i].rangeStart *= 1e3 ** (this.summary.global.geometricUnit - 1);
                }
            }

            for (let i = 0; i < this.summary.freqSet.length; i++) {
                if (this.summary.freqSet[i].parameter === 3 && this.summary.global.freqUnit <= 4) {
                    queryRequest.freqSet[i].value      *= 1e3 ** (2 - this.summary.global.freqUnit);
                    queryRequest.freqSet[i].rangeEnd   *= 1e3 ** (2 - this.summary.global.freqUnit);
                    queryRequest.freqSet[i].rangeStart *= 1e3 ** (2 - this.summary.global.freqUnit);
                } else if (this.summary.freqSet[i].parameter === 3 && this.summary.global.freqUnit > 4) {
                    // trans wavelength to THz frequency
                } else if (this.summary.freqSet[i].parameter === 5 && this.summary.global.useRadians) {
                    // trans radian to degree
                    queryRequest.freqSet[i].value      *= 180;
                    queryRequest.freqSet[i].rangeEnd   *= 180;
                    queryRequest.freqSet[i].rangeStart *= 180;
                }
            }
            console.log(queryRequest);

            // 发送请求
            this.sendRequest(queryRequest);
        },

        sendRequest(queryRequest) {}
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

    beforeDestroy() {
        EventBus.$off('shapeSet');
        EventBus.$off('genericSet');
        EventBus.$off('freqSet');
        EventBus.$off('globalSet');
    },
})