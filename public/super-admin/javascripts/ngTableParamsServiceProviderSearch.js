nwdApp.service("ngTableParamsServiceProviderSearch", function() {
    var params = {
        page: 1,
        count: 5,
        searchText: undefined,
        searchText2: undefined,
        searchText3: undefined,
        sorting: { '_id': -1 }
    };

    var setParams = function(Npage, Ncount, Nfilter, Nfilter2, Nfilter3, Nsorting) {
    //var setParams = function(Npage, Ncount, Nfilter, Nfilter2, Nfilter3, Nsorting) {
        //console.log('Npage',Npage,'Ncount',Ncount,'Nfilter',Nfilter,'Nfilter2',Nfilter2,'Nfilter3',Nfilter3,'Nsorting',Nsorting)           
        if (Nfilter === undefined) {
            var filter = '';
        } else {
            var filter = Nfilter;
        }
        if (Nfilter2 === undefined) {
            var filter2 = '';
        } else {
            var filter2 = Nfilter2;
        }     
        if (Nfilter3 === undefined) {
            var filter3 = '';
        } else {
            var filter3 = Nfilter3;
        }  
        //console.log('filter',filter,'filter2',filter2,'filter3',filter3)            
        params.page         = Npage ? Npage : 1;
        params.count        = Ncount ? Ncount : 5;
        params.searchText   = filter? filter:'';
        params.searchText2   = filter2?filter2:undefined;
        params.searchText3   = filter3?filter3:undefined;
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
