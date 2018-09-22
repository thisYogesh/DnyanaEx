var test = new dnyana.$controller({
    data: {
        title: "My Heading",
        input1: 1,
        input2: 2
    },

    methods: {
        changeTitle: function () {
            this.data.title = "Title Changed!!"
        }
    },

    template: "test"
});