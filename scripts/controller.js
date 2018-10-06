var test = new dnyana.$controller({
    data: {
        title: "My Heading"
    },

    methods: {
        changeTitle: function () {
            this.title = "Title Changed!!"
        }
    },

    template: "test"
});