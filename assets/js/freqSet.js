let freqSet = new Vue({
    el: '#freqParamSet',
    components: {
        'v-select': VueSelect.VueSelect
    },
    data: {
        debMsg: '',
        freqSectionHeight: 0,  // 频率搜索配置区域高度
        sparamsOptions: [
            { id: 1,  name: 'Zmin(2),Zmax(2)' },
            { id: 2,  name: 'Zmax(1),Zmin(1)' },
            { id: 3,  name: 'Zmin(1),Zmax(2)' },
            { id: 4,  name: 'Zmax(2),Zmax(2)' },
            { id: 5,  name: 'Zmax(1),Zmax(2)' },
            { id: 6,  name: 'Zmin(2),Zmax(1)' },
            { id: 7,  name: 'Zmin(1),Zmax(1)' },
            { id: 8,  name: 'Zmax(2),Zmax(1)' },
            { id: 9,  name: 'Zmax(1),Zmin(2)' },
            { id: 10, name: 'Zmax(2),Zmin(1)' },
            { id: 11, name: 'Zmax(2),Zmin(2)' },
            { id: 12, name: 'Zmax(1),Zmax(1)' },
            { id: 13, name: 'Zmin(1),Zmin(1)' },
            { id: 14, name: 'Zmin(1),Zmin(2)' },
            { id: 15, name: 'Zmin(2),Zmin(1)' },
            { id: 16, name: 'Zmin(2),Zmin(2)' }
        ],
        freqArr: [
            'θ',
            'Freq',
            'Mag',
            'Phase',
            'Disper'
        ],
        symsArr: [
            '=',
            '≥',
            '≤'
        ],
        freqGroup: [],
    },
    methods: {
        resetFreq() {
            this.freqGroup = [];
            this.updateFreq();
        },

        updateFreq() {
            // console.log(this.freqGroup);
            // localStorage.setItem('freqSet', JSON.stringify(this.freqGroup));
            EventBus.$emit('freqSet', this.freqGroup);
        },

        addFreq() {
            this.freqGroup.push({
                logic: 1,
                parameter: 2,
                rangeMode: 1,
                showRange: true,
                rangeStart: null,
                rangeEnd: null,
                value: null,
                dispSwitch: 2,
                selectedSparam: null,
                isInvert: false
            });
            this.updateFreq();
        },

        rmFreq(index) {
            // console.log(this.freqGroup[index].selectedSparam);
            this.freqGroup.splice(index, 1);
            this.updateFreq();
        },

        updateDisp(index) {
            // console.log(this.freqGroup);
            const condition = this.freqGroup[index];
            if (condition.parameter <= 1 && condition.parameter > 0) {
                condition.showRange = false;
                condition.dispSwitch = 3;
            } else if (condition.parameter >= 2 && condition.parameter <= 6) {
                condition.showRange = true;
                if (condition.rangeMode >= 1 && condition.rangeMode <= 3) {
                    condition.dispSwitch = 2;
                } else if  (condition.rangeMode == 4) {
                    condition.dispSwitch = 1;
                }
            }
            this.updateFreq();
        },

        toggleInvert(index) {
            this.freqGroup[index].isInvert = !this.freqGroup[index].isInvert;
            this.updateFreq();
        }
    },
    mounted() {
        EventBus.$on('resetTrigger', () => {
            this.resetFreq();
        });

        EventBus.$on('pre-freqSet', (freqSet) => {
            this.freqGroup = freqSet;
        });
    },

    beforeDestroy() {
        EventBus.$off('resetTrigger');
        EventBus.$off('pre-freqSet');
    },
});