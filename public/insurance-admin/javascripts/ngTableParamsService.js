nwdApp.service("ngTableParamsService", function() {
    var params = {
        page: 1,
        count: 5,
        searchText: undefined,
        //searchText2: undefined,
        //searchText3: undefined,
        sorting: { '_id': -1 }
    };

    var setParams = function(Npage, Ncount, Nfilter, Nsorting, Type) {
        if (Nfilter === undefined) {
            var filter = '';
        } else {
            var filter = Nfilter;
        }
        params.page         = Npage ? Npage : 1;
        params.count        = Ncount ? Ncount : 5;
        params.searchText   = filter;
        //params.searchText2   = filter;
        //params.searchText3   = filter;
        params.sorting      = Nsorting ? Nsorting : { '_id': -1 };
    }

    var getParams = function() {
        return params;
    }

    return {
        set: setParams,
        get: getParams
    };

});
