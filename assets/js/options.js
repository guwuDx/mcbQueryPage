const EventBus = new Vue();

new Vue({
    el: '#options',
    data: {
        isWaiting: false,
        queryStatus: 1, // 0: success, 1: waiting (default), 2: failed, 3: exceed limit, 4: empty result, 5: no condition
        showConfirm: false,
        queryError: '????????',
        resultFile: '',

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
            this.queryStatus = 1;
            // 不允许在没设置形状的情况下提交
            if (this.summary.shapeSet.length === 0) {
                this.queryStatus = 5;
                this.isWaiting = true;
                return;
            }

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
            this.isWaiting = true;
        },

        sendRequest(queryRequest) {
            axios.post('http://127.0.0.1:8000/query/api/', queryRequest, {timeout: 1e6})
            .then((response) => {
                console.log(response.data);
                if (response.data.status === 0) {
                    console.log(response.data.message);
                    this.queryStatus = 0;
                    this.resultFile = response.data.file;
                } else if (response.data.status === 2) {
                    console.log(response.data.message);
                    this.queryStatus = 2;
                } else if (response.data.status === 3) {
                    console.log(response.data.message);
                    this.queryStatus = 3;
                } else if (response.data.status === 4) {
                    console.log(response.data.message);
                    this.queryStatus = 4;
                }
            })
            .catch((error) => {
                console.error(error);
                this.queryStatus = 2;
                if (error.code === 'ECONNABORTED') {
                    this.queryError = '请求超时，请检查网络连接';
                } else {
                    this.queryError = error;
                }
            });
        },

        closeWaiting() {
            this.isWaiting = false;
        },

        sendDownload(resultFile) {
            let downloadRequest = {file: resultFile};
            axios.get('http://127.0.0.1:8000/query/download/?file=' + resultFile, {timeout: 1e6, responseType: 'blob'})
            .then((response) => {
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
        
                // 从后端的 Content-Disposition 头部获取文件名，或使用默认的
                const filename = response.headers['content-disposition']
                    ? response.headers['content-disposition'].split('filename=')[1]
                    : 'file.txt';  // 使用默认文件名
                link.setAttribute('download', filename);  // 设置下载文件的名称
        
                document.body.appendChild(link);
                link.click();
                link.remove();
            })
            .catch((error) => {
                console.error(error);
                this.queryStatus = 2;
                if (error.code === 'ECONNABORTED') {
                    this.queryError = '请求超时，请检查网络连接';
                } else {
                    this.queryError = error;
                }
            });
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

    beforeDestroy() {
        EventBus.$off('shapeSet');
        EventBus.$off('genericSet');
        EventBus.$off('freqSet');
        EventBus.$off('globalSet');
    },
})