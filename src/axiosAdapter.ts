import axios from 'axios';
import httpAdapter from 'axios/lib/adapters/http';
import _ from 'lodash';

module.exports = function requestAdaptor(config) {
	return function(opts) {
		let url = opts.uri;
		let axiosOpts = {
			timeout: opts.timeout,
			method: opts.method.toLowerCase(),
			headers: opts.headers,
		};

		if (config.forceHttpAdaptor) {
			axiosOpts.adapter = httpAdapter;
		}

		if (!_.isUndefined(opts.body)) {
			axiosOpts.data = opts.body;
		}

		let startTime = new Date().getTime();

		return axios(url, axiosOpts, opts.body).then(function requestSuccess(res) {
			return {
				statusCode: res.status,
				headers: res.headers,
				body: res.data,
				requestTime: new Date().getTime() - startTime,
			};
		}).catch(function requestError(res) {
			if (!res.response) {
				throw res;
			}
			return {
				statusCode: res.response.status,
				headers: res.response.headers,
				body: res.response.data,
				requestTime: new Date().getTime() - startTime,
			};
		});
	};
};
