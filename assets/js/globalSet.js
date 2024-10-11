window.onload = function() {
    localStorage.clear();
};

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
            EventBus.$emit('globalSet', this.global);
        },
        toggleRadians() {
            this.global.useRadians = !this.global.useRadians;
            this.updateGlobal();
        }
    },
    mounted() {
        EventBus.$on('resetTrigger', () => {
            this.global = {
                freqUnit: 2,
                geometricUnit: 1,
                useRadians: false
            };
        });

        EventBus.$on('pre-globalSet', (globalSet) => {
            if (globalSet.useRadians == !this.global.useRadians) {
                document.getElementById('formCheck-1').click();
            }
            this.global = globalSet;
        });
    },
})