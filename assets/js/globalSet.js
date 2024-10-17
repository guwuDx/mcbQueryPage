let globalSet = new Vue({
    el: '#globalSet',
    data: {
        global: {
            freqUnit: 2,
            geometricUnit: 1,
            useRadians: false
        }
    },
    methods: {
        updateGlobal() {
            EventBus.$emit('globalSet', { ...this.global });
        }
    },
    watch: {
        'global.useRadians'(newVal) {
            this.updateGlobal();
        }
    },
    mounted() {
        EventBus.$on('resetTrigger', () => {
            this.global.useRadians = false;
            this.global.freqUnit = 2;
            this.global.geometricUnit = 1;
        });

        EventBus.$on('pre-globalSet', (globalSet) => {
            this.global = { ...globalSet };
        });
    },

    beforeDestroy() {
        EventBus.$off('resetTrigger');
        EventBus.$off('pre-globalSet');
    },
})