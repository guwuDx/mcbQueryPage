let genericSet = new Vue({
    el: '#genericParamSet',
    components: {
        'v-select': VueSelect.VueSelect
    },
    data: {
        materialOptions: [
            { id: 1, name: '硅 Si' },
            { id: 2, name: '锗 Ge' },
            { id: 3, name: '二氧化硅 SiO2' },
            { id: 4, name: '二氧化钛 TiO2' }
        ],
        genericArr: [
            'p',
            'h',
            'h1'
        ],
        symsArr: [
            '=',
            '≥',
            '≤'
        ],
        genericGroup: [],
    },
    methods: {
        resetGeneric() {
            this.genericGroup = [];
            this.updateGeneric();
        },

        updateGeneric() {
            // console.log(this.genericGroup);
            // localStorage.setItem('genericSet', JSON.stringify(this.genericGroup));
            EventBus.$emit('genericSet', this.genericGroup);
        },

        addGeneric() {
            this.genericGroup.push({
                logic: 1,
                parameter: 3,
                rangeMode: 1,
                showRange: true,
                rangeStart: null,
                rangeEnd: null,
                value: null,
                dispSwitch: 2,
                selectedMaterial: null,
                isInvert: false
            });
            this.updateGeneric();
        },

        rmGeneric(index) {
            // console.log(this.genericGroup[index].selectedMaterial);
            this.genericGroup.splice(index, 1);
            this.updateGeneric();
        },

        updateDisp(index) {
            // console.log(this.genericGroup);
            const condition = this.genericGroup[index];
            if (condition.parameter <= 2 && condition.parameter > 0) {
                condition.showRange = false;
                condition.dispSwitch = 3;
            } else if (condition.parameter >= 3 && condition.parameter <= 5) {
                condition.showRange = true;
                if (condition.rangeMode >= 1 && condition.rangeMode <= 3) {
                    condition.dispSwitch = 2;
                } else if  (condition.rangeMode == 4) {
                    condition.dispSwitch = 1;
                }
            }
            this.updateGeneric();
        },

        toggleInvert(index) {
            this.genericGroup[index].isInvert = !this.genericGroup[index].isInvert;
            this.updateGeneric();
        }
    },
    mounted() {
        EventBus.$on('resetTrigger', () => {
            this.resetGeneric();
        });

        EventBus.$on('pre-genericSet', (genericSet) => {
            this.genericGroup = genericSet;
        });
    }
});