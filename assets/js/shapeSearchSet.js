let shapeSet = new Vue({
    el: '#shapeSearchSet',
    components: {
        'v-select': VueSelect.VueSelect
    },
    data: {
        shapesID: [],
        crrShape: null,
        showSub: false,         // 是否显示子窗口
        selectedShape: '',      // 绑定到 v-select
        shapeOptions: [
            {id: 1,  name: '矩形柱体(双参数)'},
            {id: 2,  name: '正方形柱体(单参数)'},
            {id: 3,  name: '圆柱体(单参数)'},
            {id: 4,  name: '方形孔洞(单参数)'},
            {id: 5,  name: '方形环(双参数)'},
            {id: 6,  name: '对称十字柱体(双参数)'},
            {id: 7,  name: '一般十字柱体(四参数)'},
        ],  // 形状选项
        selectedShapeGroup: [],  // 存储被实例化的形状组
        minHeight: window.innerHeight * 0.55,
    },
    methods: {
        resetShape() {
            this.selectedShapeGroup = [];
            this.updateShape();
        },

        updateShape() {
            EventBus.$emit('shapeSet', this.selectedShapeGroup);
        },

        addShape() {
            if (this.selectedShape.id != null && !this.selectedShapeGroup.includes(this.selectedShape)) {
                this.selectedShapeGroup.push(this.selectedShape);  // 添加选中形状到列表
                this.selectedShape = null;  // 重置 v-select
                this.updateShape();
            }
        },

        addAllShape() {
            for (let shape of this.shapeOptions) {
                if (!this.selectedShapeGroup.includes(shape)) {
                    this.selectedShapeGroup.push(shape);
                }
            }
            this.updateShape();
        },

        rmShape(index) {
            this.selectedShapeGroup.splice(index, 1);  // 删除对应形状
            this.updateShape();
        },

        openSub(index) {
            this.crrShape = this.selectedShapeGroup[index];
            this.showSub = true;
        },

        closeSub() {
            this.showSub = false;
            this.crrShape = null;
        }
    },
    mounted() {
        EventBus.$on('resetTrigger', () => {
            this.resetShape();
        });

        EventBus.$on('pre-shapeSet', (shapeSet) => {
            this.selectedShapeGroup = shapeSet;
        });
    },
});