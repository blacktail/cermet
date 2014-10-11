define([
	'lodash'
], function (_) {
    return {
	    getFilterStr: function (filterObj) {
		    var filterStr = [];

		    filterObj = _.clone(filterObj, true);

		    //support key1:value1||key2:value2
		    var symbol = ',';
		    if(filterObj.isOr){
			    symbol = '||';
			    delete filterObj.isOr;
		    }

		    _.each(filterObj, function (value, key) {
			    if (value == null) {
				    return;
			    }

			    if (!_.isArray(value)) {
				    value = [value];
			    }

			    filterStr.push(key + ':' + encodeURIComponent(value.join('|')));
		    });

		    return encodeURIComponent(filterStr.join(symbol));
	    },

	    camelCase: function (str) {
		    return str.toLowerCase().replace(/-(.)/g, function(match, group1) {
			    return group1.toUpperCase();
		    });
	    },

	    buildUrl: function (base, paramObj) {
		    var sep = (base.indexOf('?') > -1) ? '&' : '?';

		    if (/\?$/.test(base)) {
			    sep = '';
		    }

		    _.each(paramObj, function (value, key) {
			    paramObj[key] = decodeURIComponent(value);
		    });

		    if (_.isEmpty(paramObj)) {
			    return base;
		    } else {
			    return base + sep + $.param(paramObj);
		    }
	    },

	    compactObject: function (obj) {
		    for (var i in obj) {
			    if (obj.hasOwnProperty(i) && obj[i] == null) {
				    delete obj[i];
			    }
		    }

		    return obj;
	    },

	    chunk: function (tasks, process, chunkSize, context) {
		    chunkSize = chunkSize || 1;

		    var oriChunkSize = chunkSize;

		    setTimeout(function chunk(){
			    chunkSize = oriChunkSize;

			    while (chunkSize-- && tasks.length > 0) {
				    var item = tasks.shift();
				    process.call(context, item);
			    }

			    if (tasks.length > 0){
				    setTimeout(chunk);
			    }
		    });
	    }
    };
});
