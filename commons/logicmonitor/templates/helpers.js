define([
	'lodash',
    'handlebars'
], function(_, Handlebars) {
	return {
		ifequal: function(s1, s2, s3, options) {
			if (s3 && s3.fn) {
				options = s3;
			}

			if (s3 == 'i') {
				s1 = String(s1).toLowerCase();
				s2 = String(s2).toLowerCase();
			}

			if (s1 == s2) {
				return options.fn(this);
			}
			else {
				return options.inverse(this);
			}
		},

		ifcontain: function(s1, s2, s3, options) {
			s1 = String(s1);
			s2 = String(s2);

			if (s3 && s3.fn) {
				options = s3;
			}

			if (s3 == 'i') {
				s1 = String(s1).toLowerCase();
				s2 = String(s2).toLowerCase();
			}

			if (s1.indexOf(s2) > -1) {
				return options.fn(this);
			}
			else {
				return options.inverse(this);
			}
		}
	};
});

